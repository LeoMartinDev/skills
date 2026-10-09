#!/usr/bin/env bash
# Rebuilds codemirror.js (the CodeMirror bundle embedded in every review page) and LICENSES.txt from the pinned package.json.
set -eu
cd "$(dirname "$0")"
npm ci --no-audit --no-fund
npx esbuild entry.js --bundle --minify --format=iife --global-name=CM --legal-comments=none \
  --banner:js="/* CodeMirror and Lezer (MIT), bundled for the bigbrain guided review. Licenses: LICENSES.txt */" \
  --outfile=codemirror.js
for dir in node_modules/@codemirror/* node_modules/@lezer/* node_modules/style-mod node_modules/w3c-keyname node_modules/crelt node_modules/@marijn/*; do
  [ -f "$dir/LICENSE" ] || continue
  printf '== %s\n\n' "${dir#node_modules/}"
  cat "$dir/LICENSE"
  printf '\n'
done > LICENSES.txt
ls -l codemirror.js
