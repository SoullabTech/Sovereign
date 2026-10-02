#!/usr/bin/env bash
# Builds a throwaway copy of lib/media whose relative imports carry .ts extensions
# (the project's extensionless specifiers are resolved by Next, not by raw node) and
# stubs the two constants storage.ts consumes from ./types, which otherwise pulls in
# zod. ⛔ The source tree is never modified. Path logic is exercised unchanged.
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ROOT="$(mktemp -d)"; trap 'rm -rf "$ROOT"' EXIT
mkdir -p "$ROOT/media/proj-B/original" "$ROOT/lib"
echo "victim data" > "$ROOT/media/proj-B/original/victim.txt"
cp -R "$REPO/lib/media" "$ROOT/lib/"
sed -i -E "s|from '(\./[A-Za-z0-9_./-]+)'|from '\1.ts'|g" "$ROOT/lib/media/"*.ts
printf 'export const MIN_DISK_SPACE_BYTES = 1;\nexport const DEFAULT_MAX_UPLOAD_BYTES = 1000000000;\nexport type AssetSubdir = string;\n' > "$ROOT/lib/media/types.ts"
MEDIA_HARNESS_LIB="$ROOT/lib/media" MEDIA_HARNESS_ROOT="$ROOT" \
  node --experimental-strip-types "$REPO/tests/constitutional/media-storage-containment/regression-falsifier.mjs"
