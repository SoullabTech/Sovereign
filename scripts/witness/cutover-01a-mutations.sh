#!/usr/bin/env bash
# CUTOVER-01A mutation harness — each known-bad cutover MUST be killed.
#
# A mutant that CRASHES is reported as CRASHED, never as SURVIVED and never as
# killed-by-accident: a witness that cannot run has not judged anything.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
: "${DATABASE_URL:?DATABASE_URL (a *witness* database) is required}"
case "$DATABASE_URL" in *witness*) ;; *) echo "REFUSED · not a witness database."; exit 2;; esac

FILES=(
  "lib/manuscript/proposalChain/proposalWorkTarget.ts"
  "lib/manuscript/proposalChain/proposalWork.ts"
  "app/api/sovereign/manuscripts/[id]/write-state/route.ts"
)
BK="$(mktemp -d)"
restore() { for f in "${FILES[@]}"; do cp "$BK/$(echo "$f" | tr '/' '_')" "$f"; done; }
for f in "${FILES[@]}"; do cp "$f" "$BK/$(echo "$f" | tr '/' '_')"; done
trap 'restore; rm -rf "$BK"' EXIT INT TERM

killed=0; survived=0; crashed=0
for m in "$ROOT"/scripts/witness/cutover-01a-mutations/*.py; do
  name="$(basename "$m" .py)"
  restore
  if ! python3 "$m"; then echo "  CRASHED  $name (transform did not apply)"; crashed=$((crashed+1)); continue; fi
  out="$(timeout 300 npx tsx scripts/witness/cutover-01a-witness.ts 2>&1)"; rc=$?
  if [ "$rc" -eq 0 ]; then
    echo "  SURVIVED $name"; survived=$((survived+1))
  elif [ "$rc" -eq 1 ]; then
    echo "  killed   $name  ($(echo "$out" | grep -c '^  FAIL') obligation/s)"; killed=$((killed+1))
  else
    echo "  CRASHED  $name (rc=$rc)"; crashed=$((crashed+1))
  fi
done
restore
echo ""
echo "  $killed killed · $survived survived · $crashed crashed"
[ "$survived" -eq 0 ] && [ "$crashed" -eq 0 ]
