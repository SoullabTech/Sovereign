#!/usr/bin/env bash
# CUTOVER-01A mutation harness — each known-bad cutover MUST be killed.
#
# A mutant that CRASHES is reported as CRASHED, never as SURVIVED and never as
# killed-by-accident: a witness that cannot run has not judged anything.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
: "${DATABASE_URL:=no-db-needed-witness}"
case "$DATABASE_URL" in *witness*) ;; *) echo "REFUSED · not a witness database."; exit 2;; esac

# ⚠️ INSTRUMENT DEFECT, CAUGHT 2026-09-14. This array was generated from the
# 01A.2 harness by sed, and the substitution that was meant to retarget the
# route path BLANKED it instead — leaving an empty third entry. `cp ""` failed
# silently under `set -u` (no `set -e`), so two mutants edited the route and
# NOTHING RESTORED IT: known-bad code stayed in the working tree and every later
# mutant ran on top of it.
#
# ⛔ A harness that does not restore what it mutated is not reporting kills, it
# is accumulating damage. The run that produced "6 killed" on this file set is
# WITHDRAWN as evidence, not re-labelled.
FILES=(
  "lib/manuscript/proposalChain/store.ts"
  "app/writers-studio/VersionComposer.tsx"
  "app/api/writers-studio/proposal-chains/[chainId]/versions/route.ts"
)
BK="$(mktemp -d)"
restore() {
  for f in "${FILES[@]}"; do
    cp "$BK/$(echo "$f" | tr '/' '_')" "$f" || { echo "⛔ RESTORE FAILED: $f"; exit 2; }
  done
}
for f in "${FILES[@]}"; do
  [ -n "$f" ] && [ -f "$f" ] || { echo "REFUSED · unbackupable target: '$f'"; exit 2; }
  cp "$f" "$BK/$(echo "$f" | tr '/' '_')" || { echo "REFUSED · backup failed: $f"; exit 2; }
done
trap 'restore; rm -rf "$BK"' EXIT INT TERM

killed=0; survived=0; crashed=0
for m in "$ROOT"/scripts/witness/w2-mutations/*.py; do
  name="$(basename "$m" .py)"
  restore
  if ! python3 "$m"; then echo "  CRASHED  $name (transform did not apply)"; crashed=$((crashed+1)); continue; fi
  out="$(timeout 300 npx tsx scripts/witness/w2-formulation-composer-witness.ts 2>&1)"; rc=$?
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
