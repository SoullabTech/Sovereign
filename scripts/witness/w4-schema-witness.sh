#!/usr/bin/env bash
# W4-SCHEMA · THE WITNESS — every claim the design makes, as a database refusal.
#
# ⭐⭐ THE STANDARD THIS HOLDS ITSELF TO:
#
#     Every one of B1–B9 is a CONSTRAINT, not an application check. So every
#     obligation here is a REAL INSERT against a REAL DATABASE, and a refusal is
#     checked BY THE CONSTRAINT'S OWN NAME — never by "it errored".
#
# ⛔ DISPOSABLE DATABASES ONLY. The database name must contain `witness`, and it
# takes a LOCAL CLUSTER, never a DSN: it cannot reach the protected host.
#
#     PGP=5601 bash scripts/witness/w4-schema-witness.sh
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT" || exit 2
PGH="${PGH:-/tmp}"; PGP="${PGP:-5601}"; PGU="${PGU:-postgres}"
DB="${DB:-w4_schema_witness}"
case "$DB" in *witness*) ;; *) echo "REFUSED · '$DB' is not a witness database."; exit 2;; esac
URL="postgresql://$PGU@/$DB?host=$PGH&port=$PGP"

pass=0; fail=0
ok(){  pass=$((pass+1)); printf "  PASS  %s\n" "$1"; }
bad(){ fail=$((fail+1)); printf "  FAIL  %s\n     -> %s\n" "$1" "$2"; }
q(){  psql "$URL" -X -q -t -A -c "$1" 2>&1 | tr -d ' '; }
eq(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "want [$3] got [$2]"; fi; }

# ⭐ A refusal is only evidence if it is THE refusal. `admits` likewise proves
# the row is really there, not merely that psql printed nothing.
admits(){ local o; o="$(psql "$URL" -X -q -v ON_ERROR_STOP=1 -c "$2" 2>&1)"
  if [ -n "$o" ] && echo "$o" | grep -qiE 'error'; then bad "$1" "refused: $(echo "$o" | head -1)"; else ok "$1"; fi; }
refuses(){ local o; o="$(psql "$URL" -X -q -v ON_ERROR_STOP=1 -c "$2" 2>&1)"
  if ! echo "$o" | grep -qiE 'error'; then bad "$1" "⛔ ADMITTED — the database allowed it"
  elif echo "$o" | grep -qF "$3"; then ok "$1"
  else bad "$1" "refused for the WRONG reason (wanted '$3'): $(echo "$o" | head -1 | cut -c1-140)"; fi; }

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo " W4-SCHEMA WITNESS — subject XOR · turn↔act binding · B1–B9"
echo "══════════════════════════════════════════════════════════════════"

# ══ BUILD ═════════════════════════════════════════════════════════════
psql -h "$PGH" -p "$PGP" -U "$PGU" -d postgres -X -q \
  -c "DROP DATABASE IF EXISTS $DB;" -c "CREATE DATABASE $DB;" >/dev/null 2>&1
DATABASE_URL="$URL" bash scripts/bootstrap-database.sh >/tmp/w4boot.log 2>&1 \
  || { echo "  ⛔ REFUSED — bootstrap failed; see /tmp/w4boot.log"; exit 2; }
DATABASE_URL="$URL" bash scripts/apply-migrations.sh  >/tmp/w4mig.log  2>&1 \
  || { echo "  ⛔ REFUSED — migrations failed; see /tmp/w4mig.log"; exit 2; }
for m in 20260915000001_ask_threads_subject_preparation.sql 20260915000002_editorial_turn_bindings.sql; do
  eq "BUILD · $m ledgered" "$(q "select count(*) from schema_migrations where filename='$m'")" "1"
done

# ══ FIXTURES ══════════════════════════════════════════════════════════
M=11111111-0000-4000-8000-000000000001     # member
WK=22222222-0000-4000-8000-000000000001    # Work
DR=33333333-0000-4000-8000-000000000001    # draft
SE=44444444-0000-4000-8000-000000000001    # section
CX=cccccccc-0000-4000-8000-00000000000a    # chain X
CY=cccccccc-0000-4000-8000-00000000000b    # chain Y — the foreign chain
psql "$URL" -X -q -v ON_ERROR_STOP=1 >/tmp/w4fix.log 2>&1 <<SQL
INSERT INTO members (id, passkey, username, password_hash) VALUES ('$M','W4-WITNESS','w4_witness','x');
INSERT INTO member_manuscripts (id, member_id) VALUES ('$WK','$M');
INSERT INTO manuscript_working_drafts (id, manuscript_id, member_id, content, base_source_hash)
  VALUES ('$DR','$WK','$M','Before the water.','sha-w4');
INSERT INTO manuscript_draft_sections (id, draft_id, position, text) VALUES ('$SE','$DR',1,'Before the water.');
INSERT INTO proposal_chains (id, member_id, work_id, draft_id, base_version, target_section_id, expected_text)
  VALUES ('$CX','$M','$WK','$DR',1,'$SE','Before the water.'),
         ('$CY','$M','$WK','$DR',1,'$SE','Before the water.');
INSERT INTO proposal_versions (id, chain_id, author, formulation, supersedes) VALUES
  ('99990000-0000-4000-8000-00000000000a','$CX','maia',', held',NULL),
  ('99990000-0000-4000-8000-00000000000b','$CX','member',', held twice','99990000-0000-4000-8000-00000000000a'),
  ('99990000-0000-4000-8000-0000000000fa','$CY','maia',', elsewhere',NULL);
INSERT INTO proposal_chain_directions (id, member_id, proposal_chain_id, author, instruction) VALUES
  ('dddd0000-0000-4000-8000-00000000000a','$M','$CX','member','warmer'),
  ('dddd0000-0000-4000-8000-00000000000b','$M','$CX','maia','a reading'),
  ('dddd0000-0000-4000-8000-0000000000fa','$M','$CY','member','elsewhere');
SQL
VM=99990000-0000-4000-8000-00000000000a   # version · maia   · chain X
VB=99990000-0000-4000-8000-00000000000b   # version · member · chain X
VF=99990000-0000-4000-8000-0000000000fa   # version · maia   · chain Y  (foreign)
DM=dddd0000-0000-4000-8000-00000000000a   # direction · member · chain X
DA=dddd0000-0000-4000-8000-00000000000b   # direction · maia   · chain X
DF=dddd0000-0000-4000-8000-0000000000fa   # direction · member · chain Y (foreign)
eq "FIXTURE · acts exist" "$(q "select (select count(*) from proposal_versions)||'/'||(select count(*) from proposal_chain_directions)")" "3/3"

TH="INSERT INTO ask_threads (id, manuscript_id, member_id, anchor, reading_identity, canonical_at_open, initiated_by, proposal_chain_id) VALUES"
AN='{"kind":"section","sectionId":"44444444-0000-4000-8000-000000000001"}'
TA=aaaa0000-0000-4000-8000-00000000000a   # anchored thread
TE=aaaa0000-0000-4000-8000-00000000000e   # editorial thread on chain X

echo ""
echo "── S1 · ONE SUBJECT ──────────────────────────────────────────────"
eq  "W1 ⭐ anchor is nullable" \
    "$(q "select is_nullable from information_schema.columns where table_name='ask_threads' and column_name='anchor'")" "YES"
admits "W2a an ANCHORED thread (anchor, no chain)" \
  "$TH ('$TA','$WK','$M','$AN'::jsonb,NULL,'c1','author',NULL);"
admits "W2b ⭐ an EDITORIAL thread (chain, no anchor)" \
  "$TH ('$TE','$WK','$M',NULL,NULL,'c1','author','$CX');"
refuses "W2c ⛔⛔ BOTH subjects — the collapse" \
  "$TH ('aaaa0000-0000-4000-8000-00000000000c','$WK','$M','$AN'::jsonb,NULL,'c1','author','$CX');" \
  "ask_threads_one_subject"
refuses "W2d ⛔ NEITHER subject — a thread about nothing is not a thread" \
  "$TH ('aaaa0000-0000-4000-8000-00000000000d','$WK','$M',NULL,NULL,'c1','author',NULL);" \
  "ask_threads_one_subject"
refuses "W3 ⛔ an editorial thread carrying a READING it never addressed" \
  "$TH ('aaaa0000-0000-4000-8000-00000000000f','$WK','$M',NULL,'{\"r\":1}'::jsonb,'c1','author','$CX');" \
  "ask_threads_editorial_has_no_reading"
eq "W4 ⭐ both constraints are VALIDATED, not merely present" \
   "$(q "select count(*) from pg_constraint where conname in ('ask_threads_one_subject','ask_threads_editorial_has_no_reading') and convalidated")" "2"

echo ""
echo "── S2 · THE FOUR SUPPORTING UNIQUE TARGETS ───────────────────────"
for c in ask_threads_id_chain_key ask_turns_thread_index_speaker_key \
         proposal_chain_directions_chain_id_id_author_key proposal_versions_chain_id_id_author_key; do
  eq "W5 $c is UNIQUE" "$(q "select contype from pg_constraint where conname='$c'")" "u"
done
eq "W5 ⛔ and the existing UNIQUE (chain_id,id) STAYS — succession targets it" \
   "$(q "select count(*) from pg_constraint where conname='proposal_versions_chain_id_id_key'")" "1"

# turns: 0 author, 1 maia, on the editorial thread
psql "$URL" -X -q -v ON_ERROR_STOP=1 >/dev/null 2>&1 <<SQL
-- ⚠️ SIX TURNS, ALTERNATING, ALL CREATED UP FRONT. The first draft created
-- three and then tried to create more INSIDE a \`refuses\` statement — which
-- rolls back with the refusal it is testing, so later obligations ran against
-- turns that did not exist and refused on the CHECK before ever reaching the
-- FK. A fixture built by a failing test is not a fixture.
INSERT INTO ask_turns (thread_id, turn_index, speaker, body, staleness) VALUES
  ('$TE',0,'author','warmer, please','{}'::jsonb),
  ('$TE',1,'maia','how is this?','{}'::jsonb),
  ('$TE',2,'author','again','{}'::jsonb),
  ('$TE',3,'maia','or this?','{}'::jsonb),
  ('$TE',4,'author','closer','{}'::jsonb),
  ('$TE',5,'maia','and this','{}'::jsonb),
  ('$TA',0,'author','about this line','{}'::jsonb);
SQL
eq "FIXTURE · turns exist" "$(q "select count(*) from ask_turns")" "7"

B="INSERT INTO editorial_turn_bindings (thread_id, turn_index, turn_speaker, proposal_chain_id, act_author, direction_id, version_id) VALUES"

echo ""
echo "── B1–B9 · THE BINDING ───────────────────────────────────────────"
admits "B-ok1 ⭐ author turn ↔ MEMBER Direction" "$B ('$TE',0,'author','$CX','member','$DM',NULL);"
admits "B-ok2 ⭐ maia turn ↔ MAIA Version"       "$B ('$TE',1,'maia','$CX','maia',NULL,'$VM');"

refuses "B1 ⛔ a turn_index that does not exist in the thread" \
  "$B ('$TE',9,'author','$CX','member','$DA',NULL);" "etb_turn"
refuses "B2 ⛔⛔ binding an ANCHORED Ask thread — it has no chain to match" \
  "$B ('$TA',0,'author','$CX','member','$DA',NULL);" "etb_thread_is_editorial"
refuses "B3 ⛔ a chain that is not THIS thread's editorial parent" \
  "$B ('$TE',2,'author','$CY','member','$DF',NULL);" "etb_thread_is_editorial"
refuses "B4 ⛔ a Direction belonging to ANOTHER chain" \
  "$B ('$TE',2,'author','$CX','member','$DF',NULL);" "etb_direction"
refuses "B5 ⛔ a Version belonging to ANOTHER chain" \
  "$B ('$TE',3,'maia','$CX','maia',NULL,'$VF');" "etb_version"
refuses "B6a ⛔ BOTH adjuncts on one turn" \
  "$B ('$TE',2,'author','$CX','member','$DA','$VB');" "etb_one_adjunct"
refuses "B6b ⛔ NEITHER — a binding that binds nothing" \
  "$B ('$TE',2,'author','$CX','member',NULL,NULL);" "etb_one_adjunct"
refuses "B6c ⭐⭐ a SECOND adjunct for a turn already bound — nowhere to put it" \
  "$B ('$TE',0,'author','$CX','member','$DA',NULL);" "editorial_turn_bindings_pkey"
refuses "B7 ⛔ one Direction claimed by TWO turns" \
  "$B ('$TE',2,'author','$CX','member','$DM',NULL);" "etb_one_turn_per_direction"
refuses "B8 ⛔ one Version claimed by TWO turns" \
  "$B ('$TE',3,'maia','$CX','maia',NULL,'$VM');" "etb_one_turn_per_version"

echo ""
echo "── B9 ⭐⭐ THE VOCABULARY BRIDGE — unrepresentable, not rejected ───"
refuses "B9a ⛔ a MEMBER Direction bound to a MAIA turn" \
  "$B ('$TE',5,'maia','$CX','member','$DA',NULL);" "etb_speaker_matches_author"
refuses "B9b ⛔ a MAIA Version bound to an AUTHOR turn" \
  "$B ('$TE',2,'author','$CX','maia',NULL,'$VM');" "etb_speaker_matches_author"
refuses "B9c ⭐ and lying in ONE column is caught by the FK, not the CHECK" \
  "$B ('$TE',2,'maia','$CX','maia',NULL,'$VB');" "etb_turn"

echo ""
echo "── IMMUTABILITY AND WITHDRAWAL ───────────────────────────────────"
refuses "W6 ⛔ a binding cannot be revised — a correction is a new binding" \
  "UPDATE editorial_turn_bindings SET version_id=NULL, direction_id='$DA' WHERE thread_id='$TE' AND turn_index=1;" \
  "is immutable"
eq "W7 ⭐ but it CAN be deleted — withdrawal must be able to remove one" \
   "$(psql "$URL" -X -q -t -A -c "DELETE FROM editorial_turn_bindings WHERE thread_id='$TE' AND turn_index=1; SELECT count(*) FROM editorial_turn_bindings;" 2>&1 | tail -1 | tr -d ' ')" "1"
admits "W7b and re-binding that turn afterwards is ordinary" "$B ('$TE',1,'maia','$CX','maia',NULL,'$VM');"
# ⭐⭐ A REAL FINDING, RECORDED RATHER THAN SMOOTHED — and it is the same class
# as W5-3's S6c. This obligation first asserted that `etb_direction`'s
# ON DELETE RESTRICT would refuse. It does not get the chance:
# `authored_editorial_record_immutable` refuses the DELETE EARLIER and by
# something STRONGER — an authored editorial record cannot be deleted by
# anything, ever. ⛔ The FK's RESTRICT is therefore belt-and-braces and is
# UNREACHABLE IN PRACTICE, and asserting it here would have claimed a protection
# that never fires. The design's §2.5 calls RESTRICT "the belt"; the belt is
# real, and the trousers are welded on.
refuses "W8 ⭐⭐ an authored act cannot be deleted AT ALL — immutability fires before the FK" \
  "DELETE FROM proposal_chain_directions WHERE id='$DM';" "is immutable"
eq "W8b ⛔ and the FK's RESTRICT is still CONFIGURED, merely unreachable" \
   "$(q "select confdeltype from pg_constraint where conname='etb_direction'")" "r"

DEL="$(q "select 1")"
psql "$URL" -X -q -c "DELETE FROM ask_threads WHERE id='$TE';" >/dev/null 2>&1
eq "W9 ⭐ withdrawing the conversation removes its turns and its bindings" \
   "$(q "select (select count(*) from ask_turns where thread_id='$TE')||'/'||(select count(*) from editorial_turn_bindings)")" "0/0"
eq "W9b ⭐⭐ AND THE AUTHORED ACTS REMAIN — withdrawal is not erasure" \
   "$(q "select (select count(*) from proposal_versions)||'/'||(select count(*) from proposal_chain_directions)")" "3/3"

echo ""
echo "── ROLLBACK PROPERTY ─────────────────────────────────────────────"
admits "W10 fixture · an editorial thread exists again" "$TH ('aaaa0000-0000-4000-8000-000000000ee1','$WK','$M',NULL,NULL,'c1','author','$CX');"
refuses "W10 ⭐⭐ rollback's SET NOT NULL REFUSES while an editorial thread exists" \
  "ALTER TABLE ask_threads ALTER COLUMN anchor SET NOT NULL;" "contains null values"
echo "   ⛔ That refusal is the design's most important rollback property:"
echo "      rollback is clean while the refinement is applied and NOT YET USED."
echo "      Once a writer has held one editorial conversation, rolling back is"
echo "      no longer a schema operation — it is a decision about their record."
echo "   ⛔ The rollback must NOT delete editorial threads to make itself succeed."

echo ""
echo "  $pass passed · $fail failed"
[ "$fail" -eq 0 ]
