#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
TMP="$(mktemp -d /tmp/migration-compat-bundle.XXXXXX)"
trap 'rm -rf "$TMP"' EXIT
OLD="$(git rev-parse HEAD^)"
TARGET="$(git rev-parse HEAD)"
OUT="$TMP/bundle"

scripts/migration-compatibility-review-bundle.sh "$OLD" "$TARGET" "$OUT" >/dev/null

test -f "$OUT/MIGRATION_COMPATIBILITY_CONTEXT.json"
test -f "$OUT/package.json"
test -f "$OUT/old-reader/$OLD/package.json"

A="$(git show "$TARGET:package.json" | shasum -a 256 | awk '{print $1}')"
B="$(shasum -a 256 "$OUT/package.json" | awk '{print $1}')"
[ "$A" = "$B" ]

A="$(git show "$OLD:package.json" | shasum -a 256 | awk '{print $1}')"
B="$(shasum -a 256 "$OUT/old-reader/$OLD/package.json" | awk '{print $1}')"
[ "$A" = "$B" ]

python3 - "$OUT/MIGRATION_COMPATIBILITY_CONTEXT.json" "$OLD" "$TARGET" <<'PY'
import json,sys
r=json.load(open(sys.argv[1]))
assert r["instrument"]=="migration-compatibility-review-bundle/v1"
assert r["old_reader_commit"]==sys.argv[2]
assert r["target_reader_commit"]==sys.argv[3]
assert r["old_reader_root"]=="old-reader/"+sys.argv[2]
PY

echo "MIGRATION COMPATIBILITY BUNDLE: PASS"
echo "  exact target bytes materialized"
echo "  exact old-reader bytes materialized under SHA-named root"
