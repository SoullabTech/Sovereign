#!/usr/bin/env bash
set -euo pipefail

OLD_REF="$1"
TARGET_REF="$2"
OUT="$3"
REPO="$(git rev-parse --show-toplevel)"
OLD="$(git -C "$REPO" rev-parse "$OLD_REF^{commit}")"
TARGET="$(git -C "$REPO" rev-parse "$TARGET_REF^{commit}")"

if [ "$OLD" = "$TARGET" ]; then
  echo "REFUSED: old reader and target reader are the same commit" >&2
  exit 1
fi
if [ -e "$OUT" ]; then
  echo "REFUSED: output already exists: $OUT" >&2
  exit 1
fi

mkdir -p "$OUT"
git -C "$REPO" archive "$TARGET" | tar -xf - -C "$OUT"
mkdir -p "$OUT/old-reader/$OLD"
git -C "$REPO" archive "$OLD" | tar -xf - -C "$OUT/old-reader/$OLD"

OLD="$OLD" TARGET="$TARGET" OUT="$OUT" python3 - <<'PY'
import json, os
from pathlib import Path
out=Path(os.environ["OUT"])
record={
  "instrument":"migration-compatibility-review-bundle/v1",
  "old_reader_commit":os.environ["OLD"],
  "target_reader_commit":os.environ["TARGET"],
  "target_root":".",
  "old_reader_root":"old-reader/"+os.environ["OLD"],
  "law":"Reviewer cwd is this bundle root. Target paths remain repository-relative; old-reader reads live under the exact SHA-named root."
}
(out/"MIGRATION_COMPATIBILITY_CONTEXT.json").write_text(json.dumps(record,indent=2)+"\n")
PY

echo "BUNDLE READY"
echo "  old reader   $OLD"
echo "  target       $TARGET"
echo "  root         $OUT"
echo "  old source   old-reader/$OLD/"
