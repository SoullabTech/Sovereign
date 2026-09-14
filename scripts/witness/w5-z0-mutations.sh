#!/usr/bin/env bash
# W5-Z0 mutation harness — each known-bad chain-level subject MUST be killed.
#
# A mutant that CRASHES is reported as CRASHED, never as SURVIVED and never as
# killed-by-accident: a witness that cannot run has not judged anything. An
# operator whose ANCHOR has moved exits 3 and is reported STALE — ⛔ a stale
# operator must never be read as a passing one.
#
# ⚠️ BACKUP AND RESTORE ARE FAIL-CLOSED. The W2 harness lost two mutants to an
# empty entry in this array: `cp ""` failed silently under `set -u`, the route
# was left mutated, and the run's "6 killed" had to be WITHDRAWN as evidence.
# Every path is verified to exist before anything is touched, and restore is
# verified after.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
: "${DATABASE_URL:?DATABASE_URL (a *witness* database) is required}"
case "$DATABASE_URL" in *witness*) ;; *) echo "REFUSED · not a witness database."; exit 2;; esac

FILES=(
  "lib/manuscript/proposalChain/editorialSubject.ts"
  "app/writers-studio/canvasIdentity.ts"
  "app/api/sovereign/manuscripts/[id]/write-state/route.ts"
  "app/writers-studio/canvas/page.tsx"
  "app/writers-studio/EditorialWorkspace.tsx"
)
for f in "${FILES[@]}"; do
  [ -n "$f" ] && [ -f "$f" ] || { echo "REFUSED · not a file: '$f'"; exit 2; }
done

BK="$(mktemp -d)"
key() { echo "$1" | tr '/' '_'; }
restore() {
  for f in "${FILES[@]}"; do
    cp "$BK/$(key "$f")" "$f" || { echo "RESTORE FAILED for $f"; exit 2; }
  done
}
for f in "${FILES[@]}"; do cp "$f" "$BK/$(key "$f")" || exit 2; done
trap 'restore; rm -rf "$BK"' EXIT INT TERM

killed=0; survived=0; crashed=0; stale=0
for m in "$ROOT"/scripts/witness/w5-z0-mutations/*.py; do
  name="$(basename "$m" .py)"
  restore
  python3 "$m"; trc=$?
  if [ "$trc" -eq 3 ]; then
    echo "  STALE    $name (anchor not found — judged nothing)"; stale=$((stale+1)); continue
  elif [ "$trc" -ne 0 ]; then
    echo "  CRASHED  $name (transform failed rc=$trc)"; crashed=$((crashed+1)); continue
  fi
  out="$(timeout 300 npx tsx scripts/witness/w5-z0-witness.ts 2>&1)"; rc=$?
  if [ "$rc" -eq 0 ]; then
    echo "  SURVIVED $name"; survived=$((survived+1))
  elif [ "$rc" -eq 1 ]; then
    echo "  killed   $name  ($(echo "$out" | grep -c '^  FAIL') obligation/s)"; killed=$((killed+1))
  else
    echo "  CRASHED  $name (rc=$rc)"; crashed=$((crashed+1))
  fi
done
restore
for f in "${FILES[@]}"; do
  cmp -s "$BK/$(key "$f")" "$f" || { echo "RESTORE VERIFY FAILED for $f"; exit 2; }
done
echo ""
echo "  $killed killed · $survived survived · $crashed crashed · $stale stale"
[ "$survived" -eq 0 ] && [ "$crashed" -eq 0 ] && [ "$stale" -eq 0 ]
