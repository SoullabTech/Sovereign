#!/usr/bin/env bash
# W4-1 mutation harness — each known-bad editorial discourse contract MUST die.
#
# ⭐ NO DATABASE. Every W4-1 law is a pure function, so the falsifiers are jest
# and the harness needs no cluster. That is a property of the act, not a
# shortcut: a contract that needed a server to be falsified would not be a
# contract.
#
# A mutant that CRASHES is reported as CRASHED, never as SURVIVED and never as
# killed-by-accident. An operator whose ANCHOR has moved exits 3 and is reported
# STALE — ⛔ a stale operator must never be read as a passing one.
#
# ⚠️ BACKUP AND RESTORE ARE FAIL-CLOSED — the W2 harness lost two mutants to an
# empty array entry that made `cp ""` fail silently under `set -u`.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

FILES=(
  "lib/manuscript/editorialDiscourse/contract.ts"
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

SUITE="lib/manuscript/editorialDiscourse"

# ⭐ THE BASELINE IS PROVED BEFORE ANY MUTANT RUNS. A green tally on a red
# baseline is negative evidence about the instrument, not positive evidence
# about the repair — W5-4 had to withdraw a run for exactly that.
if ! npx jest "$SUITE" >/dev/null 2>&1; then
  echo "REFUSED · the clean baseline is not green; every kill would be by accident."
  exit 2
fi

killed=0; survived=0; crashed=0; stale=0
for m in "$ROOT"/scripts/witness/w4-1-mutations/*.py; do
  name="$(basename "$m" .py)"
  restore
  python3 "$m"; trc=$?
  if [ "$trc" -eq 3 ]; then
    echo "  STALE    $name (anchor not found — judged nothing)"; stale=$((stale+1)); continue
  elif [ "$trc" -ne 0 ]; then
    echo "  CRASHED  $name (transform failed rc=$trc)"; crashed=$((crashed+1)); continue
  fi
  out="$(timeout 300 npx jest "$SUITE" 2>&1)"; rc=$?
  if [ "$rc" -eq 0 ]; then
    echo "  SURVIVED $name"; survived=$((survived+1))
  elif [ "$rc" -eq 1 ]; then
    n="$(echo "$out" | grep -cE '^\s+●.*›')"
    echo "  killed   $name  ($n obligation/s)"; killed=$((killed+1))
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
