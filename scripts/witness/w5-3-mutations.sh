#!/usr/bin/env bash
# W5-3 mutation harness. ⛔ Backup/restore fail-closed; CRASHED and STALE are
# their own outcomes and fail the run — an unjudged obligation is not a passing
# one (the W2 and R6 lessons, kept).
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
FILES=( "database/migrations/20260914000005_editorial_ontology.sql" )
BK="$(mktemp -d)"
for f in "${FILES[@]}"; do
  [ -n "$f" ] && [ -f "$f" ] || { echo "REFUSED · unbackupable target: '$f'"; exit 2; }
  cp "$f" "$BK/$(echo "$f" | tr '/' '_')" || { echo "REFUSED · backup failed: $f"; exit 2; }
done
restore() { for f in "${FILES[@]}"; do
  cp "$BK/$(echo "$f" | tr '/' '_')" "$f" || { echo "⛔ RESTORE FAILED: $f"; exit 2; }; done; }
trap 'restore; rm -rf "$BK"' EXIT INT TERM
killed=0; survived=0; crashed=0
for m in "$ROOT"/scripts/witness/w5-3-mutations/*.py; do
  name="$(basename "$m" .py)"; restore
  if ! python3 "$m"; then echo "  ⛔ STALE  $name"; crashed=$((crashed+1)); continue; fi
  out="$(timeout 300 bash scripts/witness/w5-3-schema-witness.sh 2>&1)"; rc=$?
  if ! printf '%s' "$out" | grep -q 'passed ·'; then
    echo "  ⛔ CRASHED  $name (the witness never completed)"; crashed=$((crashed+1)); continue
  fi
  if [ "$rc" -eq 0 ]; then echo "  SURVIVED $name"; survived=$((survived+1))
  else echo "  killed   $name  ($(printf '%s' "$out" | grep -c '^  FAIL') obligation/s)"; killed=$((killed+1)); fi
done
restore; bash scripts/witness/w5-rebuild-db.sh >/dev/null 2>&1
echo ""; echo "  $killed killed · $survived survived · $crashed crashed"
[ "$survived" -eq 0 ] && [ "$crashed" -eq 0 ]
