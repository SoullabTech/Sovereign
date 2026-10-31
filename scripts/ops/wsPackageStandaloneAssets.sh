#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
[[ -f .next/BUILD_ID ]] || { echo 'Missing .next/BUILD_ID; run the production build first.' >&2; exit 20; }
[[ -f .next/standalone/server.js ]] || { echo 'Missing standalone server.js.' >&2; exit 21; }
[[ -d .next/static ]] || { echo 'Missing .next/static.' >&2; exit 22; }
[[ -d public ]] || { echo 'Missing public directory.' >&2; exit 23; }
mkdir -p .next/standalone/.next/static .next/standalone/public
rsync -a --delete .next/static/ .next/standalone/.next/static/
rsync -a --delete public/ .next/standalone/public/

# Next's file tracer includes pdf-parse's CJS entry but currently omits the
# worker imported dynamically by that entry. A standalone server without it
# accepts the upload and then fails every typed PDF as an unreadable file.
# Copy the package's runtime distribution as an explicit deploy artifact. This
# carries executable parser support only; no manuscript or generated output.
PDF_PARSE_SOURCE="node_modules/pdf-parse/dist"
PDF_PARSE_TARGET=".next/standalone/node_modules/pdf-parse/dist"
[[ -f "$PDF_PARSE_SOURCE/pdf-parse/cjs/pdf.worker.mjs" ]] || {
  echo 'Missing pdf-parse CJS worker required for standalone PDF import.' >&2
  exit 26
}
mkdir -p "$PDF_PARSE_TARGET"
rsync -a "$PDF_PARSE_SOURCE/" "$PDF_PARSE_TARGET/"

# The book renderer resolves Paged.js at runtime to inject its print polyfill
# into headless Chrome. Next traces the application module but not this dynamic
# asset lookup, so copy the exact package distribution into the standalone tree.
PAGEDJS_SOURCE="node_modules/pagedjs/dist"
PAGEDJS_TARGET=".next/standalone/node_modules/pagedjs/dist"
[[ -f "$PAGEDJS_SOURCE/paged.polyfill.js" ]] || {
  echo 'Missing Paged.js polyfill required for standalone PDF rendering.' >&2
  exit 28
}
mkdir -p "$PAGEDJS_TARGET"
rsync -a "$PAGEDJS_SOURCE/" "$PAGEDJS_TARGET/"

BUILD_ID="$(cat .next/BUILD_ID)"
printf '%s\n' "$BUILD_ID" > .next/standalone/BUILD_ID
STATIC_FILES="$(find .next/standalone/.next/static -type f | wc -l | tr -d ' ')"
PUBLIC_FILES="$(find .next/standalone/public -type f | wc -l | tr -d ' ')"
PDF_PARSE_WORKERS="$(find "$PDF_PARSE_TARGET" -name 'pdf.worker.mjs' -type f | wc -l | tr -d ' ')"
PAGEDJS_POLYFILLS="$(find "$PAGEDJS_TARGET" -name 'paged.polyfill.js' -type f | wc -l | tr -d ' ')"
[[ "$STATIC_FILES" -gt 0 ]] || { echo 'Standalone static copy is empty.' >&2; exit 24; }
[[ "$PUBLIC_FILES" -gt 0 ]] || { echo 'Standalone public copy is empty.' >&2; exit 25; }
[[ "$PDF_PARSE_WORKERS" -ge 1 ]] || { echo 'Standalone PDF worker copy is empty.' >&2; exit 27; }
[[ "$PAGEDJS_POLYFILLS" -ge 1 ]] || { echo 'Standalone Paged.js polyfill copy is empty.' >&2; exit 29; }
printf 'STANDALONE_ASSETS=PASS BUILD_ID=%s STATIC_FILES=%s PUBLIC_FILES=%s PDF_PARSE_WORKERS=%s PAGEDJS_POLYFILLS=%s\n' \
  "$BUILD_ID" "$STATIC_FILES" "$PUBLIC_FILES" "$PDF_PARSE_WORKERS" "$PAGEDJS_POLYFILLS"
