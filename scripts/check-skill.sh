#!/usr/bin/env bash
# Checks each skill's text budget and that every referenced skill path and anchor exists.
set -eu
repo=$(cd "$(dirname "$0")/.." && pwd)
max_words=${MAX_WORDS:-1000}
status=0
slugs() { grep -E '^#+ ' "$1" | sed -E 's/^#+ //' | tr 'A-Z' 'a-z' | sed -E 's/[^a-z0-9 -]//g; s/ /-/g'; }
for skill in "$repo"/*/SKILL.md; do
  root=$(dirname "$skill")
  name=$(basename "$root")
  cd "$root"
  for f in $(find . -name node_modules -prune -o -name '*.md' -print | sort); do
    words=$(wc -w < "$f" | tr -d ' ')
    [ "$words" -le "$max_words" ] || { echo "over budget: $name/${f#./} has $words words (max $max_words)"; status=1; }
  done
  for ref in $(grep -rohE --exclude-dir=node_modules '`(bricks|usecases|references|principles|scripts)/[A-Za-z0-9_./-]+(#[a-z0-9-]+)?`' . | tr -d '`' | sort -u); do
    path=${ref%%#*}
    if [ ! -e "$path" ]; then echo "missing: $name/$ref"; status=1; continue; fi
    [ "$path" != "$ref" ] || continue
    slugs "$path" | grep -qx "${ref#*#}" || { echo "missing anchor: $name/$ref"; status=1; }
  done
done
[ "$status" -ne 0 ] || echo "PASS: every file within $max_words words, every reference resolves"
exit "$status"
