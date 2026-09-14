#!/usr/bin/env bash
# CUTOVER-01B.0 mutation harness. CRASHED is reported as CRASHED, never SURVIVED.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
: "${DATABASE_URL:?DATABASE_URL (a *witness* database) is required}"
case "$DATABASE_URL" in *witness*) ;; *) echo "REFUSED · not a witness database."; exit 2;; esac
FILES=(
  "lib/manuscript/revisionAuthorization/store.ts"
  "database/migrations/20260914000004_manuscript_revision_authorizations.sql"
)
BK="$(mktemp -d)"
restore() { for f in "${FILES[@]}"; do cp "$BK/$(echo "$f" | tr '/' '_')" "$f"; done; }
for f in "${FILES[@]}"; do cp "$f" "$BK/$(echo "$f" | tr '/' '_')"; done
trap 'restore; rm -rf "$BK"' EXIT INT TERM
killed=0; survived=0; crashed=0
for m in "$ROOT"/scripts/witness/cutover-01b0-mutations/*.py; do
  name="$(basename "$m" .py)"; restore
  if ! python3 "$m"; then echo "  CRASHED  $name (transform did not apply)"; crashed=$((crashed+1)); continue; fi
  # every mutant gets a database built from the mutated migration
  bash scripts/witness/step2-rebuild-db.sh >/dev/null 2>&1
  out="$(timeout 300 npx tsx scripts/witness/cutover-01b0-witness.ts 2>&1)"; rc=$?
  if [ "$rc" -eq 0 ]; then echo "  SURVIVED $name"; survived=$((survived+1))
  elif [ "$rc" -eq 1 ]; then echo "  killed   $name  ($(echo "$out" | grep -c '^  FAIL') obligation/s)"; killed=$((killed+1))
  else echo "  CRASHED  $name (rc=$rc)"; crashed=$((crashed+1)); fi
done
restore; bash scripts/witness/step2-rebuild-db.sh >/dev/null 2>&1
echo ""; echo "  $killed killed · $survived survived · $crashed crashed"
[ "$survived" -eq 0 ] && [ "$crashed" -eq 0 ]
