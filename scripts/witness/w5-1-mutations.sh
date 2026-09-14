#!/usr/bin/env bash
# W3 mutation harness. ⛔ Backup and restore are fail-closed: a harness that
# does not restore is accumulating damage, not reporting kills (W2 lesson).
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
FILES=(
  "lib/manuscript/editorialWorkspace/ontology.ts"
  "lib/manuscript/editorialWorkspace/__tests__/ontology.test.ts"
)
BK="$(mktemp -d)"
for f in "${FILES[@]}"; do
  [ -n "$f" ] && [ -f "$f" ] || { echo "REFUSED · unbackupable target: '$f'"; exit 2; }
  cp "$f" "$BK/$(echo "$f" | tr '/' '_')" || { echo "REFUSED · backup failed: $f"; exit 2; }
done
restore() {
  for f in "${FILES[@]}"; do
    cp "$BK/$(echo "$f" | tr '/' '_')" "$f" || { echo "⛔ RESTORE FAILED: $f"; exit 2; }
  done
}
trap 'restore; rm -rf "$BK"' EXIT INT TERM
killed=0; survived=0; crashed=0
for m in "$ROOT"/scripts/witness/w5-1-mutations/*.py; do
  name="$(basename "$m" .py)"; restore
  if ! python3 "$m"; then echo "  ⛔ STALE  $name"; crashed=$((crashed+1)); continue; fi
  out="$(timeout 600 npx jest lib/manuscript/editorialWorkspace 2>&1)"; rc=$?
  if ! printf '%s' "$out" | grep -q '^Tests:'; then
    echo "  ⛔ CRASHED  $name"; crashed=$((crashed+1)); continue
  fi
  if [ "$rc" -eq 0 ]; then echo "  SURVIVED $name"; survived=$((survived+1))
  else echo "  killed   $name  ($(printf '%s' "$out" | grep -c '✕') obligation/s)"; killed=$((killed+1)); fi
done
restore
echo ""; echo "  $killed killed · $survived survived · $crashed crashed"
[ "$survived" -eq 0 ] && [ "$crashed" -eq 0 ]
