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
run_sql()  { printf '%s\n' "$1" | psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 2>&1; }
rebuild()  { PGDB="$PGDB" bash "$ROOT/scripts/witness/w5-rebuild-db.sh" >/dev/null 2>&1 \
             || { echo "REFUSED · could not rebuild $PGDB"; exit 2; }; }

S2_ROLLBACK="$(footer_of "$ROOT/database/migrations/20260915000002_w4_s2_validation_and_binding.sql")"
S1_ROLLBACK="$(footer_of "$ROOT/database/migrations/20260915000001_w4_s1_thread_subject_preparation.sql")"
ROLLBACK_SQL="$(footer_of "$ROOT/database/migrations/20260914000005_editorial_ontology.sql")"
for v in "$S2_ROLLBACK" "$S1_ROLLBACK" "$ROLLBACK_SQL"; do
  [ -n "$v" ] || { echo "REFUSED · a rollback block is missing"; exit 2; }
done

# ⭐⭐ THE ORDER IS W4-S2 → W4-S1 → W5-3, and the two boundaries are NOT the same
# kind of thing. Asserting both is the point: describing a discipline as if it
# were an enforced constraint is how a rollback comes to be trusted further than
# it can carry.

# ── Boundary 1 · STRUCTURAL. The database refuses it.
OUT_EARLY="$(run_sql "$ROLLBACK_SQL")"
if printf '%s' "$OUT_EARLY" | grep -q 'ERROR'; then
  ok "R0a · ⭐⭐ W5-3's footer is REFUSED while W4 stands — the binding references what it drops"
else bad "R0a · W5-3's footer ran with W4 still applied" "NOT REFUSED"; fi
rebuild

# ── Boundary 2 · ⚠️ DISCIPLINE ONLY. Nothing refuses it, and the damage is silent.
OUT_S1_FIRST="$(run_sql "$S1_ROLLBACK")"
if printf '%s' "$OUT_S1_FIRST" | grep -q 'ERROR'; then
  bad "R0b · S1's footer out of order" "expected it to SUCCEED and damage silently; it errored: $(printf '%s' "$OUT_S1_FIRST" | head -1)"
else ok "R0b · ⚠️⚠️ S1's footer out of order is NOT REFUSED — it succeeds"; fi
STILL="$(q "SELECT count(*) FROM information_schema.tables WHERE table_name='editorial_turn_bindings';")"
XOR="$(q "SELECT count(*) FROM pg_constraint WHERE conname='ask_threads_one_subject';")"
eq "R0c · ⭐⭐ and leaves the binding standing on a guarantee that is GONE" "$STILL/$XOR" "1/0"
rebuild

# ── The correct order, run in full.
OUT_S2="$(run_sql "$S2_ROLLBACK")"
if printf '%s' "$OUT_S2" | grep -q 'ERROR'; then
  bad "R0d · W4-S2's footer runs first" "$(printf '%s' "$OUT_S2" | head -2)"
else ok "R0d · ⭐ W4-S2's footer, from its own file, runs FIRST"; fi
eq "R0e · the binding and its four UNIQUE targets are gone" \
  "$(q "SELECT (SELECT count(*) FROM information_schema.tables WHERE table_name='editorial_turn_bindings')
        + (SELECT count(*) FROM pg_constraint WHERE conname IN
           ('ask_threads_id_chain_key','ask_turns_thread_index_speaker_key',
            'proposal_chain_directions_chain_id_id_author_key',
            'proposal_versions_chain_id_id_author_key'));")" "0"
OUT_S1="$(run_sql "$S1_ROLLBACK")"
if printf '%s' "$OUT_S1" | grep -q 'ERROR'; then
  bad "R0f · W4-S1's footer runs second" "$(printf '%s' "$OUT_S1" | head -2)"
else ok "R0f · ⭐ W4-S1's footer runs SECOND — anchor NOT NULL restored on an empty table"; fi
# ⛔ Its SET NOT NULL is allowed to FAIL when an editorial thread exists; that is
# the design's rollback law and it is not exercised here, where none was created.
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
