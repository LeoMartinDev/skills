#!/usr/bin/env bash
# Offline checks for guided-review.mjs: builds a throwaway repo, collects its branch, validates tours, builds the page,
# and drives the review server against a fake gh.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
script="$here/../guided-review.mjs"
work=$(mktemp -d "${TMPDIR:-/tmp}/guided-review-test.XXXXXX")
server=
trap '[ -z "$server" ] || { kill "$server"; wait "$server"; } 2>/dev/null; rm -rf "$work"' EXIT
fail() { echo "FAIL: $*"; exit 1; }
check() { node -e "$1" "$2" || fail "$3"; }

# Fake gh: no PR for a branch during collect; a PR on acme/widgets once served. It records posted reviews.
mkdir -p "$work/bin"
cat > "$work/bin/gh" <<'GH'
#!/bin/sh
case "$*" in
  "api user --jq .login") echo bob ;;
  "pr view 7 --repo acme/widgets"*) echo '{"headRefOid":"'"$FAKE_HEAD"'","state":"OPEN"}' ;;
  "api -X POST repos/acme/widgets/pulls/7/reviews --input -")
    cat > "$FAKE_POSTED"
    echo '{"html_url":"https://github.com/acme/widgets/pull/7#pullrequestreview-1"}' ;;
  *) exit 1 ;;
esac
GH
chmod +x "$work/bin/gh"
export PATH="$work/bin:$PATH" FAKE_POSTED="$work/posted.json"

repo="$work/repo"
git init -q -b main "$repo"
cd "$repo"
git config user.email test@example.com
git config user.name Test
mkdir -p src
printf 'export function total(items) {\n  return items.reduce((a, b) => a + b, 0);\n}\n' > src/total.js
seq 1 60 > src/numbers.txt
echo legacy > legacy.txt
printf 'one\ntwo\nthree\nfour\nfive\n' > src/old-name.txt
printf 'export const helper = 1;\n' > src/helper.js
git add -A
git commit -qm "initial"

git checkout -qb feature
printf 'export function total(items, tax = 0) {\n  const sum = items.reduce((a, b) => a + b, 0);\n  return sum * (1 + tax);\n}\n' > src/total.js
sed -i.bak -e 's/^5$/five/' -e 's/^50$/fifty/' src/numbers.txt && rm src/numbers.txt.bak
git rm -q legacy.txt
git mv src/old-name.txt src/new-name.txt
printf 'export const TAX = 0.2; // </script> and $& must not break the page\n' > src/tax.js
printf '\000\001\002' > logo.bin
git add -A
git commit -qm "add tax to total"

out=$(node "$script" collect --base main | tail -1)
for f in data.json overview.md diff.patch; do [ -f "$out/$f" ] || fail "collect did not write $f"; done
check '
const d = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const f = Object.fromEntries(d.files.map(x => [x.path, x]));
const ok = (c, m) => { if (!c) { console.error(m); process.exit(1); } };
ok(f["src/total.js"].status === "M", "modified");
ok(f["src/numbers.txt"].hunks.length === 2, "two separate hunks");
ok(f["legacy.txt"].status === "D", "deleted");
ok(f["src/new-name.txt"].status === "R" && f["src/new-name.txt"].oldPath === "src/old-name.txt", "renamed");
ok(f["src/tax.js"].status === "A" && f["src/tax.js"].additions === 1, "added");
ok(f["logo.bin"].binary && d.contents["logo.bin"] === null && !("legacy.txt" in d.contents), "binary and deleted contents");
ok(d.baseContents["src/total.js"].startsWith("export function total(items)"), "base side of a modified file");
ok(d.baseContents["src/new-name.txt"].startsWith("one"), "base side of a renamed file comes from its old path");
ok(d.baseContents["legacy.txt"] === "legacy\n" && !("src/tax.js" in d.baseContents), "base side of deleted and added files");
ok(d.commits.map(c => c.subject).join() === "add tax to total" && d.title === "add tax to total", "commits and title");
ok(d.pr === null && d.head.ref === "feature", "branch target");
' "$out/data.json" "collected data is wrong"
grep -q "hunk 1: lines" "$out/overview.md" || fail "overview lists hunks"
range=$(node "$script" collect main..feature | tail -1)
check 'process.exit(JSON.parse(require("fs").readFileSync(process.argv[1] + "/data.json", "utf8")).files.length === 6 ? 0 : 1)' "$range" "range target"

write_tour() {
  cat > "$out/tour.json" <<JSON
{
  "lang": "fr",
  "summary": "Ajoute une taxe au total. Voir [[src/total.js:1-4]] et [[src/helper.js|le helper]].",
  "flow": [{ "label": "Le total", "step": "total" }, { "label": "Le reste", "step": "rest" }],
  "steps": [
    { "id": "total", "title": "Le total", "risk": "high",
      "body": "Change [[src/total.js:2]], suite en [[step:rest]].",
      "checks": ["Arrondi ?", "Pas de test."],
      "show": [{ "file": "src/total.js", "note": "La taxe.", "highlights": [{ "lines": "3", "text": "Le calcul." }] },
        { "file": "src/tax.js", "view": "diff", "note": "Le taux." }] },
    { "id": "rest", "title": "Le reste", "risk": "low", "link": "Après le total, le reste.", "body": "Fichiers annexes.",
      "show": [{ "file": "src/numbers.txt", "hunks": [1], "note": "Un nombre." }, { "file": "src/new-name.txt", "note": "Renommé." },
        { "file": "src/helper.js", "lines": "1", "note": "Le helper." }] }
  ],
  "skipped": [{ "file": "legacy.txt", "reason": "Supprimé, plus utilisé." }, { "file": "src/numbers.txt", "hunks": [0], "reason": "Même édition." } $1]
}
JSON
}
expect_error() {
  if node "$script" build "$out" 2> "$work/err" >/dev/null; then fail "build accepted: $1"; fi
  grep -q "$1" "$work/err" || { cat "$work/err"; fail "missing error: $1"; }
}

write_tour ""
expect_error "neither shown in a step nor listed in skipped: logo.bin"

skip=', { "file": "logo.bin", "reason": "Image." }'
write_tour "$skip"
page=$(node "$script" build "$out") || fail "valid tour rejected"
[ -f "$page" ] || fail "no page written"
grep -q "__GR_" "$page" && fail "unreplaced template token"
grep -q "</script> and" "$page" && fail "payload not escaped"
grep -q '<script src="data:text/javascript;base64,' "$page" || fail "CodeMirror bundle not embedded"
check '
const html = require("fs").readFileSync(process.argv[1], "utf8");
const payload = JSON.parse(html.match(/<script id="payload" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const ok = (c, m) => { if (!c) { console.error(m); process.exit(1); } };
ok("src/helper.js" in payload.data.contents, "context file referenced by a badge is embedded");
ok(JSON.stringify(payload.tour.steps[1].show[2].lines) === "[1,1]", "lines are normalized");
ok(JSON.stringify(payload.tour.steps[0].show[0].highlights[0].lines) === "[3,3]", "highlight lines are normalized");
ok(!("repo" in payload.data), "local path is not embedded");
ok(payload.data.contents["src/tax.js"].includes("$&"), "replacement patterns survive");
' "$page" "embedded payload"

write_tour "$skip" && sed -i.bak 's/"hunks": \[1\]/"hunks": [2]/' "$out/tour.json"
expect_error "hunks must list indexes between 0 and 1"
write_tour "$skip" && sed -i.bak 's/, { "file": "src\/numbers.txt", "hunks": \[0\], "reason": "Même édition." }//' "$out/tour.json"
expect_error "neither shown in a step nor listed in skipped: src/numbers.txt hunk 0"
write_tour "$skip" && sed -i.bak 's/"risk": "low"/"risk": "none"/' "$out/tour.json"
expect_error "risk must be low, medium, high"
write_tour "$skip" && sed -i.bak 's/"risk": "high",/"risk": "high", "claim": "x",/' "$out/tour.json"
expect_error "claim is no longer part of a step"
write_tour "$skip" && sed -i.bak 's/"lang": "fr",/"lang": "fr", "evidence": "x",/' "$out/tour.json"
expect_error "evidence: no longer part of the tour"
write_tour "$skip" && sed -i.bak 's/"Pas de test."/{ "kind": "gap", "text": "Pas de test." }/' "$out/tour.json"
expect_error "check 2: must be a non-empty sentence"
write_tour "$skip" && sed -i.bak 's/"summary": "Ajoute/"summary": "1\\n2\\n3\\n4\\n5\\n6\\n7\\n8\\n9\\n10\\nAjoute/' "$out/tour.json"
expect_error "summary: 11 lines"
write_tour "$skip" && sed -i.bak 's/"Pas de test."/"Pas de test.", "Et la doc ?"/' "$out/tour.json"
expect_error "3 checks; keep the 2"
write_tour "$skip" && sed -i.bak 's/"step": "rest"/"step": "nope"/' "$out/tour.json"
expect_error 'flow\[2\]: step names no step id'
write_tour "$skip" && sed -i.bak 's/"lines": "3", "text"/"lines": "30", "text"/' "$out/tour.json"
expect_error "highlight 1: src/total.js has 4 lines"
write_tour "$skip" && sed -i.bak -e 's/, "note": "Un nombre."//' -e 's/Fichiers annexes./Fichiers simplement annexes./' -e 's/"link": "Après le total, le reste.", //' "$out/tour.json"
node "$script" build "$out" 2> "$work/err" >/dev/null || fail "warnings must not fail the build: $(cat "$work/err")"
grep -q "no link; say in one sentence" "$work/err" || fail "missing link not warned"
grep -q "show\[1\]: no note" "$work/err" || fail "missing note not warned"
grep -q '"simplement" judges the code' "$work/err" || fail "reassuring word not warned"
write_tour "$skip" && sed -i.bak 's/step:rest/step:nope/' "$out/tour.json"
expect_error "names no step id"
write_tour "$skip" && sed -i.bak 's#src/helper.js|#src/missing.js|#' "$out/tour.json"
expect_error "points to no changed file nor file at head"
write_tour "$skip" && sed -i.bak 's/"lines": "1"/"lines": "9-12"/' "$out/tour.json"
expect_error "starts past the end"
write_tour "$skip" && sed -i.bak 's/"file": "src\/tax.js", "view": "diff"/"file": "src\/helper.js", "view": "diff"/' "$out/tour.json"
expect_error 'view "diff" needs a changed file'

# Serve the page as if it came from PR #7 of acme/widgets.
write_tour "$skip"
node -e '
const fs = require("fs"); const p = process.argv[1] + "/data.json"; const d = JSON.parse(fs.readFileSync(p, "utf8"));
d.pr = { number: 7, url: "https://github.com/acme/widgets/pull/7", author: "alice", state: "OPEN" };
fs.writeFileSync(p, JSON.stringify(d));' "$out"
node "$script" build "$out" >/dev/null
export FAKE_HEAD=$(git rev-parse HEAD)
node "$script" serve "$out" --no-open > "$work/serve.log" 2>&1 &
server=$!
for _ in 1 2 3 4 5 6 7 8 9 10; do grep -q '^http' "$work/serve.log" && break; sleep 0.3; done
url=$(grep -m1 '^http' "$work/serve.log") || fail "serve did not start: $(cat "$work/serve.log")"
origin=${url%/*/}
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
[ "$(code "$url")" = 200 ] || fail "page not served"
[ "$(code "$origin/wrong-token/")" = 404 ] || fail "wrong token accepted"
[ "$(code -H 'Host: evil.example' "$url")" = 404 ] || fail "foreign Host accepted"
curl -s "${url}api/status" | grep -q '"viewer":"bob"' || fail "status does not report the gh user"
post() { curl -s -w '\n%{http_code}' -H 'Content-Type: application/json' -H "Origin: $1" -d "$2" "${url}api/review"; }
post "http://evil.example" '{"event":"COMMENT","body":"x","comments":[]}' | tail -1 | grep -q 403 || fail "foreign Origin accepted"
post "$origin" '{"event":"APPROVE","comments":[{"path":"src/numbers.txt","line":25,"side":"RIGHT","body":"x"}]}' | grep -q "outside the diff" || fail "comment outside the diff accepted"
post "$origin" '{"event":"REQUEST_CHANGES","body":"","comments":[]}' | tail -1 | grep -q 400 || fail "request changes without a comment accepted"
[ ! -f "$FAKE_POSTED" ] || fail "an invalid review reached gh"
reply=$(post "$origin" '{"event":"REQUEST_CHANGES","body":"Round it","comments":[{"path":"src/total.js","line":3,"side":"RIGHT","body":"Rounding?"},{"path":"legacy.txt","line":1,"side":"LEFT","body":"Still used?"}]}')
echo "$reply" | tail -1 | grep -q 200 || fail "valid review rejected: $reply"
echo "$reply" | grep -q 'pullrequestreview-1' || fail "review URL not returned"
check '
const r = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const ok = (c, m) => { if (!c) { console.error(m, r); process.exit(1); } };
ok(r.event === "REQUEST_CHANGES" && r.body === "Round it" && r.commit_id === process.env.FAKE_HEAD, "review fields");
ok(r.comments.length === 2 && r.comments[1].side === "LEFT" && r.comments[1].path === "legacy.txt", "line comments");
' "$FAKE_POSTED" "posted review"

echo "PASS: collect, build and serve"
