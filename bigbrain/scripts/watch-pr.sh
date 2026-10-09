#!/usr/bin/env bash
set -eu
usage() {
  echo 'Usage: watch-pr.sh NUMBER [--repo OWNER/NAME] [--previous FILE] [--snapshot FILE]'
  echo 'Read-only, one-pass GitHub observation; JSON stdout. Requires Bash, gh and jq.'
}
fail() { echo "watch-pr: $*" >&2; exit 2; }
number= repo= previous= replay=
while [ "$#" -gt 0 ]; do
  case "$1" in
    --help|-h) usage; exit 0 ;;
    --repo|--previous|--snapshot)
      [ "$#" -ge 2 ] || fail "missing value for $1"
      case "$1" in --repo) repo=$2;; --previous) previous=$2;; --snapshot) replay=$2;; esac
      shift 2 ;;
    *) [ -z "$number" ] || fail "unexpected argument: $1"; number=$1; shift ;;
  esac
done
case "$number" in ''|*[!0-9]*) fail 'NUMBER must be a positive integer';; esac
[ "$number" -gt 0 ] || fail 'NUMBER must be positive'
command -v jq >/dev/null || fail 'install jq, or use GitHub tools and the pr-watch brick directly'
[ -z "$repo" ] || [[ "$repo" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || fail 'repo must be OWNER/NAME'
dir=$(cd "$(dirname "$0")" && pwd)
tmp=$(mktemp -d "${TMPDIR:-/tmp}/bigbrain-watch.XXXXXX")
trap 'rm -rf "$tmp"' EXIT
echo '[]' > "$tmp/errors"
echo 'null' > "$tmp/previous"
if [ -n "$previous" ]; then
  jq -se 'select(length == 1) | .[0] | .snapshot // . | select(type == "object")' "$previous" > "$tmp/previous" || fail 'invalid previous snapshot'
fi
error() {
  echo "watch-pr: $1" >&2
  jq --arg error "$1" '. + [$error]' "$tmp/errors" > "$tmp/new"
  mv "$tmp/new" "$tmp/errors"
}
request() {
  local dest=$1; shift
  if gh "$@" > "$tmp/response" 2> "$tmp/diagnostic" && jq -se 'length == 1 and (.[0] | if type == "array" then all(.[]; .errors? == null) else type == "object" and .errors? == null end)' "$tmp/response" >/dev/null; then
    cp "$tmp/response" "$dest"
    return 0
  fi
  error "collection failed: $dest"
  cat "$tmp/diagnostic" >&2
  echo 'null' > "$dest"
  return 1
}
pages() {
  local dest=$1 endpoint=$2 filter=$3
  if request "$dest" api "$endpoint" --method GET --paginate --slurp; then
    if jq -e "$filter" "$dest" > "$tmp/new"; then mv "$tmp/new" "$dest"; else error "invalid API pages: $endpoint"; echo '[]' > "$dest"; fi
  else echo '[]' > "$dest"; fi
}
cursor_valid() {
  jq -e --arg old "$2" "$1 | (.hasNextPage|type == \"boolean\") and (if .hasNextPage then (.endCursor|type == \"string\" and length > 0) and .endCursor != \$old else true end)" "$3" >/dev/null
}
if [ -n "$replay" ]; then
  jq -se 'select(length == 1) | .[0] | .snapshot // . | select(type == "object")' "$replay" > "$tmp/snapshot" || fail 'invalid replay snapshot'
  [ -n "$repo" ] || repo=$(jq -r '.repo' "$tmp/snapshot")
else
  command -v gh >/dev/null || fail 'install/authenticate gh, or use GitHub tools and the pr-watch brick directly'
  if [ -z "$repo" ]; then repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner) || fail 'cannot resolve repo; provide --repo'; fi
  [[ "$repo" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || fail 'repo must be OWNER/NAME'
  fields=number,url,state,isDraft,headRefOid,baseRefOid,baseRefName,potentialMergeCommit,mergeable,mergeStateStatus,reviewDecision,updatedAt
  request "$tmp/pr" pr view "$number" --repo "$repo" --json "$fields" || :
  echo '[]' > "$tmp/rules"; echo 'null' > "$tmp/protection"
  echo 'null' > "$tmp/classic"; echo '[]' > "$tmp/threads"
  echo 'null' > "$tmp/branch"; echo 'null' > "$tmp/endBranch"
  echo '[]' > "$tmp/headChecks"; echo '[]' > "$tmp/headStatuses"
  echo '[]' > "$tmp/mergeChecks"; echo '[]' > "$tmp/mergeStatuses"
  if [ "$(jq -r '.headRefOid // empty' "$tmp/pr")" != '' ]; then
    head=$(jq -r .headRefOid "$tmp/pr")
    merge=$(jq -r '.potentialMergeCommit.oid // empty' "$tmp/pr")
    base=$(jq -r '.baseRefName | @uri' "$tmp/pr")
    request "$tmp/branch" api "repos/$repo/branches/$base" --method GET || :
    pages "$tmp/rules" "repos/$repo/rules/branches/$base?per_page=100" 'if all(.[];type == "array") then [.[][]] else error("invalid rule pages") end'
    query='query($owner:String!,$name:String!,$number:Int!,$endCursor:String){repository(owner:$owner,name:$name){pullRequest(number:$number){baseRef{branchProtectionRule{id}} reviewThreads(first:100,after:$endCursor){nodes{id isResolved isOutdated comments(first:100){nodes{id body author{login} updatedAt} pageInfo{hasNextPage endCursor}}} pageInfo{hasNextPage endCursor}}}}}'
    cursor=; seen='|'
    while :; do
      seen="$seen$cursor|"
      if ! request "$tmp/threadPage" api graphql -f query="$query" -f owner="${repo%/*}" -f name="${repo#*/}" -F number="$number" ${cursor:+-f endCursor="$cursor"}; then break; fi
      if ! jq -e '.data.repository.pullRequest.reviewThreads | .nodes | type == "array"' "$tmp/threadPage" >/dev/null; then error 'missing review threads'; break; fi
      if ! cursor_valid '.data.repository.pullRequest.reviewThreads.pageInfo' "$cursor" "$tmp/threadPage" || ! jq -e '.data.repository.pullRequest.reviewThreads.nodes | all(.[]; (.comments.nodes|type == "array") and (.comments.pageInfo.hasNextPage|type == "boolean") and (if .comments.pageInfo.hasNextPage then (.comments.pageInfo.endCursor|type == "string" and length > 0) else true end))' "$tmp/threadPage" >/dev/null; then error 'invalid thread pagination'; break; fi
      jq '.data.repository.pullRequest.baseRef | if type != "object" or (has("branchProtectionRule")|not) then null else (.branchProtectionRule != null) end' "$tmp/threadPage" > "$tmp/classic"
      jq -s '.[0] + .[1].data.repository.pullRequest.reviewThreads.nodes' "$tmp/threads" "$tmp/threadPage" > "$tmp/new"; mv "$tmp/new" "$tmp/threads"
      cursor=$(jq -r '.data.repository.pullRequest.reviewThreads.pageInfo | if .hasNextPage then .endCursor else empty end' "$tmp/threadPage")
      [ -n "$cursor" ] || break
      case "$seen" in *"|$cursor|"*) error 'thread cursor cycle'; break;; esac
    done
    jq -r '.[] | select(.comments.pageInfo.hasNextPage) | [.id,.comments.pageInfo.endCursor] | @tsv' "$tmp/threads" > "$tmp/replies"
    while IFS=$'\t' read -r thread cursor; do
      seen='|'
      while [ -n "$cursor" ]; do
        seen="$seen$cursor|"
        query='query($id:ID!,$endCursor:String){node(id:$id){... on PullRequestReviewThread{comments(first:100,after:$endCursor){nodes{id body author{login} updatedAt} pageInfo{hasNextPage endCursor}}}}}'
        if ! request "$tmp/replyPage" api graphql -f query="$query" -f id="$thread" -f endCursor="$cursor"; then break; fi
        if ! jq -e '.data.node.comments.nodes | type == "array"' "$tmp/replyPage" >/dev/null; then error 'missing thread replies'; break; fi
        if ! cursor_valid '.data.node.comments.pageInfo' "$cursor" "$tmp/replyPage"; then error 'invalid reply pagination'; break; fi
        jq --arg id "$thread" --slurpfile page "$tmp/replyPage" 'map(if .id == $id then .comments.nodes += $page[0].data.node.comments.nodes | .comments.pageInfo = $page[0].data.node.comments.pageInfo else . end)' "$tmp/threads" > "$tmp/new"; mv "$tmp/new" "$tmp/threads"
        cursor=$(jq -r '.data.node.comments.pageInfo | if .hasNextPage then .endCursor else empty end' "$tmp/replyPage")
        if [ -n "$cursor" ]; then case "$seen" in *"|$cursor|"*) error 'reply cursor cycle'; break;; esac; fi
      done
    done < "$tmp/replies"
    if [ "$(cat "$tmp/classic")" = true ]; then
      request "$tmp/protection" api "repos/$repo/branches/$base/protection" --method GET || :
    elif [ "$(cat "$tmp/classic")" != false ]; then error 'classic branch policy unavailable'; fi
    for target in head merge; do
      sha=$head; [ "$target" != merge ] || sha=$merge
      [ -n "$sha" ] || continue
      if request "$tmp/suites" api "repos/$repo/commits/$sha/check-suites?per_page=1" --method GET; then
        jq -e '(.total_count|type == "number") and .total_count <= 1000' "$tmp/suites" >/dev/null || error 'check-suite coverage exceeds API limit or is unknown'
      fi
      pages "$tmp/${target}Checks" "repos/$repo/commits/$sha/check-runs?per_page=100&filter=latest" 'if all(.[];(.check_runs|type == "array") and (.total_count|type == "number")) and ([.[].total_count]|max) <= ([.[].check_runs[]]|length) then [.[].check_runs[]] else error("incomplete check runs") end'
      pages "$tmp/${target}Statuses" "repos/$repo/commits/$sha/statuses?per_page=100" '[.[][]]'
    done
  else error 'PR identity details unavailable'; fi
  pages "$tmp/reviews" "repos/$repo/pulls/$number/reviews?per_page=100" '[.[][]]'
  pages "$tmp/comments" "repos/$repo/issues/$number/comments?per_page=100" '[.[][]]'
  request "$tmp/end" pr view "$number" --repo "$repo" --json "$fields" || :
  if [ -n "${base:-}" ]; then request "$tmp/endBranch" api "repos/$repo/branches/$base" --method GET || :; fi
  jq -n --arg repo "$repo" --argjson number "$number" --arg observedAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --slurpfile branch "$tmp/branch" --slurpfile endBranch "$tmp/endBranch" --slurpfile pr "$tmp/pr" --slurpfile end "$tmp/end" --slurpfile rules "$tmp/rules" --slurpfile classic "$tmp/classic" --slurpfile protection "$tmp/protection" --slurpfile headChecks "$tmp/headChecks" --slurpfile headStatuses "$tmp/headStatuses" --slurpfile mergeChecks "$tmp/mergeChecks" --slurpfile mergeStatuses "$tmp/mergeStatuses" --slurpfile reviews "$tmp/reviews" --slurpfile comments "$tmp/comments" --slurpfile threads "$tmp/threads" --slurpfile errors "$tmp/errors" '{repo:$repo,number:$number,observedAt:$observedAt,baseTip:$branch[0].commit.sha,endBaseTip:$endBranch[0].commit.sha,pr:$pr[0],end:$end[0],policy:{rules:$rules[0],classic:$classic[0],protection:$protection[0]},checks:{head:$headChecks[0],merge:$mergeChecks[0]},statuses:{head:$headStatuses[0],merge:$mergeStatuses[0]},reviews:$reviews[0],comments:$comments[0],threads:$threads[0],errors:$errors[0]}' > "$tmp/snapshot"
fi
jq -e --arg repo "$repo" --argjson number "$number" --slurpfile previous "$tmp/previous" '
  .repo == $repo and .number == $number and
  (.errors|type == "array") and (.policy|type == "object") and (.policy.rules|type == "array") and
  ([.checks.head,.checks.merge,.statuses.head,.statuses.merge,.reviews,.comments,.threads]|all(.[];type == "array")) and
  ($previous[0] == null or ($previous[0].repo == .repo and $previous[0].number == .number))
' "$tmp/snapshot" >/dev/null || fail 'invalid snapshot or mismatched repo/PR in previous/replay'
jq --slurpfile previous "$tmp/previous" -f "$dir/watch-pr.jq" "$tmp/snapshot"
