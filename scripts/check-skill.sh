#!/usr/bin/env bash
# Checks the skill's text budget and that every referenced skill path and anchor exists.
set -eu
root=$(cd "$(dirname "$0")/../bigbrain" && pwd)
cd "$root"
max_words=${MAX_WORDS:-1000}
status=0
for f in $(find . -name '*.md' | sort); do
  words=$(wc -w < "$f" | tr -d ' ')
  [ "$words" -le "$max_words" ] || { echo "over budget: ${f#./} has $words words (max $max_words)"; status=1; }
done
slugs() { grep -E '^#+ ' "$1" | sed -E 's/^#+ //' | tr 'A-Z' 'a-z' | sed -E 's/[^a-z0-9 -]//g; s/ /-/g'; }
for ref in $(grep -rohE '`(bricks|usecases|references|principles|scripts)/[A-Za-z0-9_./-]+(#[a-z0-9-]+)?`' . | tr -d '`' | sort -u); do
  path=${ref%%#*}
  if [ ! -e "$path" ]; then echo "missing: $ref"; status=1; continue; fi
  [ "$path" != "$ref" ] || continue
  slugs "$path" | grep -qx "${ref#*#}" || { echo "missing anchor: $ref"; status=1; }
done
[ "$status" -ne 0 ] || echo "PASS: every file within $max_words words, every reference resolves"
exit "$status"
