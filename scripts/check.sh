#!/usr/bin/env bash
# Structural checks for the leogpt skill. Run from anywhere: scripts/check.sh
# Fails on: a skill file over 80 lines, a referenced skill path that does not exist,
# a principle indexed in SKILL.md without its file, or a principle file not indexed.
set -uo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
skill="$root/leogpt"
max_lines=80
status=0

fail() { echo "FAIL: $*"; status=1; }

while IFS= read -r file; do
  lines=$(wc -l < "$file" | tr -d ' ')
  [ "$lines" -gt "$max_lines" ] && fail "${file#$root/} has $lines lines (max $max_lines)"
done < <(find "$skill" -name '*.md' -type f)

while IFS= read -r path; do
  [ -e "$skill/$path" ] || fail "referenced path missing: $path"
done < <(grep -rhoE '`(playbooks|bricks|principles|references)/[a-z0-9./#-]+`' "$skill" | tr -d '`' | sed 's/#.*//' | sort -u)

indexed=$(grep -oE '^- `[a-z-]+`:' "$skill/SKILL.md" | sed -E 's/^- `([a-z-]+)`:/\1/' | sort)
for name in $indexed; do
  [ -f "$skill/principles/$name.md" ] || fail "principle indexed but missing: principles/$name.md"
done
for file in "$skill"/principles/*.md; do
  [ -e "$file" ] || continue
  name=$(basename "$file" .md)
  echo "$indexed" | grep -qx "$name" || fail "principle file not indexed in SKILL.md: $name"
done

[ "$status" -eq 0 ] && echo "OK: all checks passed"
exit "$status"
