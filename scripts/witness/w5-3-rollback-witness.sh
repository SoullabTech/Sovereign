#!/usr/bin/env bash
# W5-3 · THE ROLLBACK IS PART OF THE WITNESS.
#
# ⭐⭐ WHY THIS EXISTS. This migration REDEFINES an existing function
# (`ask_threads_freeze`). A rollback that merely dropped the new tables and
# column would leave that freeze referring to `proposal_chain_id` after the
# column was gone — and EVERY UPDATE on ask_threads would fail. A migration
# reversible only on paper is not reversible.
#
# ⛔ So this does not check that the objects disappeared. It checks that the OLD
# ASK SCHEMA IS USABLE AFTERWARDS: a thread can be opened and updated.
#
# ⛔ DISPOSABLE DATABASE ONLY.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"; PGDB="${PGDB:-w5_witness}"
case "$PGDB" in *witness*) ;; *) echo "REFUSED · '$PGDB' is not a witness database."; exit 2;; esac
PGDB="$PGDB" bash "$ROOT/scripts/witness/w5-rebuild-db.sh" >/dev/null 2>&1 \
  || { echo "REFUSED · could not rebuild $PGDB"; exit 2; }

q() { psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -tAq -c "$1" 2>&1; }
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }
bad() { FAIL=$((FAIL+1)); printf '  FAIL  %s\n     -> %s\n' "$1" "$2"; }
eq()  { if [ "$2" = "$3" ]; then ok "$1  [$2]"; else bad "$1" "got '$2' want '$3'"; fi; }
admits() { local out; out="$(q "$2")"
  if printf '%s' "$out" | grep -q 'ERROR'; then bad "$1" "$(printf '%s' "$out" | head -1)"; else ok "$1"; fi; }

echo "── W5-3 · rollback ───────────────────────────────────────────"

footer_of() { sed -n '/^-- BEGIN;$/,/^-- COMMIT;$/p' "$1" | sed 's/^-- \{0,1\}//'; }
run_sql() { printf '%s\n' "$1" | psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 2>&1; }

W42="$ROOT/database/migrations/20260915000001_editorial_turn_bindings.sql"
W53="$ROOT/database/migrations/20260914000005_editorial_ontology.sql"
W42_ROLLBACK="$(footer_of "$W42")"
ROLLBACK_SQL="$(footer_of "$W53")"
[ -n "$ROLLBACK_SQL" ] || { echo "REFUSED · no rollback block found in the migration"; exit 2; }
[ -n "$W42_ROLLBACK" ] || { echo "REFUSED · no rollback block found in the W4-2 migration"; exit 2; }

# ⭐⭐ THE ORDERING LAW, PERFORMED RATHER THAN ASSERTED IN PROSE. W4-2 builds on
# W5-3's objects, so W5-3's footer CANNOT run while W4-2 is applied. This ran
# green before W4-2 existed and would silently go on passing if the two footers
# were run out of order in the wrong direction — so it is checked first, on a
# database where nothing has been rolled back yet.
OUT_EARLY="$(run_sql "$ROLLBACK_SQL")"
if printf '%s' "$OUT_EARLY" | grep -q 'ERROR'; then
  ok "R0a · ⭐⭐ W5-3's rollback is REFUSED while W4-2 is applied — the footers have an order"
else
  bad "R0a · W5-3's rollback ran with W4-2 still applied" "NOT REFUSED"
fi
PGDB="$PGDB" bash "$ROOT/scripts/witness/w5-rebuild-db.sh" >/dev/null 2>&1 \
  || { echo "REFUSED · could not rebuild $PGDB"; exit 2; }

# ⭐ W4-2's own footer first. ⛔ Its SET NOT NULL is allowed to fail when an
# editorial thread exists — that is the design's rollback law, and it is not
# exercised here because this database has no threads yet.
OUT42="$(run_sql "$W42_ROLLBACK")"
if printf '%s' "$OUT42" | grep -q 'ERROR'; then
  bad "R0b · W4-2's rollback runs first" "$(printf '%s' "$OUT42" | head -2)"
else ok "R0b · ⭐ W4-2's rollback, from its own footer, runs first"; fi
# ⭐ Executed FROM THE MIGRATION'S OWN FOOTER, so a rollback that drifts from
# what the file documents is a failure here rather than a surprise later.
OUT="$(run_sql "$ROLLBACK_SQL")"
if printf '%s' "$OUT" | grep -q 'ERROR'; then
  bad "R0 · the documented rollback runs" "$(printf '%s' "$OUT" | head -2)"
else ok "R0 · ⭐ the rollback recorded in the migration's own footer RUNS"; fi

eq "R1 · the new objects are gone" \
  "$(q "SELECT count(*) FROM information_schema.tables
        WHERE table_name IN ('proposal_chain_insights','proposal_chain_directions');")" "0"
eq "R2 · the discourse column and its FK are gone" \
  "$(q "SELECT count(*) FROM information_schema.columns
        WHERE table_name='ask_threads' AND column_name='proposal_chain_id';")" "0"
eq "R3 · the FK-target constraint is gone" \
  "$(q "SELECT count(*) FROM pg_constraint WHERE conname='proposal_chains_member_work_id_key';")" "0"

# ⭐⭐ THE OBLIGATION THAT MATTERS: the restored freeze must not reference a
# column that no longer exists.
q "INSERT INTO members (id) VALUES ('77770000-0000-4000-8000-00000000000a') ON CONFLICT DO NOTHING;
   INSERT INTO member_manuscripts (id) VALUES ('77770000-0000-4000-8000-00000000000b') ON CONFLICT DO NOTHING;" >/dev/null
admits "R4 · ⭐ a thread can still be OPENED after rollback" \
  "INSERT INTO ask_threads (id, manuscript_id, member_id, anchor, canonical_at_open, initiated_by)
   VALUES ('77770000-0000-4000-8000-00000000000c','77770000-0000-4000-8000-00000000000b',
           '77770000-0000-4000-8000-00000000000a','{\"on\":\"work\"}','c1','author');"
admits "R5 · ⭐⭐ and UPDATED — the restored freeze does not name a dropped column" \
  "UPDATE ask_threads SET canonical_at_open='c1' WHERE id='77770000-0000-4000-8000-00000000000c';"
# and it is still a real freeze, not a function that silently does nothing
OUT2="$(q "UPDATE ask_threads SET anchor='{\"on\":\"section\",\"sectionId\":\"s\"}'
           WHERE id='77770000-0000-4000-8000-00000000000c';")"
if printf '%s' "$OUT2" | grep -qi 'immutable'; then
  ok "R6 · ⭐ and the restored freeze still REFUSES a re-point — it is the old law, not a stub"
else bad "R6 · the restored freeze still refuses a re-point" "NOT REFUSED"; fi

echo
echo "  $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ]
