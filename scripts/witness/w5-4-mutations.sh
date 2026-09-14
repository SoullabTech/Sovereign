#!/usr/bin/env bash
# W5-4 mutation harness — each known-bad editorial store MUST be killed.
#
# A mutant that CRASHES is reported as CRASHED, never as SURVIVED and never as
# killed-by-accident. An operator whose ANCHOR has moved exits 3 and is reported
# STALE — ⛔ a stale operator must never be read as a passing one.
#
# ⭐ THE DATABASE IS REBUILT BEFORE EVERY MUTANT. W5-3 learned this the hard
# way: a witness that accumulates its own rows eventually measures its own
# history, and duplicate-key noise then reads as an obligation failure.
#
# ⚠️ BACKUP AND RESTORE ARE FAIL-CLOSED — the W2 harness lost two mutants to an
# empty array entry that made `cp ""` fail silently under `set -u`.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
: "${DATABASE_URL:?DATABASE_URL (a *witness* database) is required}"
case "$DATABASE_URL" in *witness*) ;; *) echo "REFUSED · not a witness database."; exit 2;; esac
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"; PGDB="${PGDB:-w5_witness}"

FILES=(
  "lib/manuscript/editorialWorkspace/store.ts"
  "lib/manuscript/proposalChain/store.ts"
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

rebuild() {
  PGH="$PGH" PGP="$PGP" PGU="$PGU" PGDB="$PGDB" \
    bash "$ROOT/scripts/witness/w5-rebuild-db.sh" >/dev/null 2>&1 \
    || { echo "REFUSED · database rebuild failed"; exit 2; }
}

killed=0; survived=0; crashed=0; stale=0
for m in "$ROOT"/scripts/witness/w5-4-mutations/*.py; do
  name="$(basename "$m" .py)"
  restore
  python3 "$m"; trc=$?
  if [ "$trc" -eq 3 ]; then
    echo "  STALE    $name (anchor not found — judged nothing)"; stale=$((stale+1)); continue
  elif [ "$trc" -ne 0 ]; then
    echo "  CRASHED  $name (transform failed rc=$trc)"; crashed=$((crashed+1)); continue
  fi
  rebuild
  out="$(timeout 300 npx tsx scripts/witness/w5-4-editorial-store-witness.ts 2>&1)"; rc=$?
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
rebuild
echo ""
echo "  $killed killed · $survived survived · $crashed crashed · $stale stale"
[ "$survived" -eq 0 ] && [ "$crashed" -eq 0 ] && [ "$stale" -eq 0 ]
