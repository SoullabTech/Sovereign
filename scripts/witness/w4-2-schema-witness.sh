#!/usr/bin/env bash
# W4-2 · THREAD SUBJECT + TURN ↔ AUTHORED-ACT BINDING — asserted on the
# DATABASE's behaviour.
#
# ⭐⭐ THE BAR: the database must make the WRONG TURN, WRONG CHAIN, WRONG ACT and
# WRONG AUTHOR UNREPRESENTABLE — not merely discouraged, and not preserved by
# application convention.
#
# ⛔ DISPOSABLE DATABASE ONLY. Every fact is established by PERFORMING the act,
# never by reading the migration text — a constraint that exists and does not
# fire is not enforcement.
set -u
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"; PGDB="${PGDB:-w4_witness}"
case "$PGDB" in *witness*) ;; *) echo "REFUSED · '$PGDB' is not a witness database."; exit 2;; esac

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
PGDB="$PGDB" bash "$ROOT_DIR/scripts/witness/w5-rebuild-db.sh" >/dev/null 2>&1 \
  || { echo "REFUSED · could not rebuild $PGDB"; exit 2; }

q()   { psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -tAq -c "$1" 2>&1; }
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }
bad() { FAIL=$((FAIL+1)); printf '  FAIL  %s\n     -> %s\n' "$1" "$2"; }
admits()  { local out; out="$(q "$2")"
  if printf '%s' "$out" | grep -q 'ERROR'; then bad "$1" "$(printf '%s' "$out" | head -1)"; else ok "$1"; fi; }
refuses() { local out; out="$(q "$2")"
  if printf '%s' "$out" | grep -q 'ERROR'; then
    if printf '%s' "$out" | grep -qi "$3"; then ok "$1  [$3]"
    else bad "$1" "refused, but not by '$3': $(printf '%s' "$out" | head -1)"; fi
  else bad "$1" "NOT REFUSED"; fi; }
eq() { if [ "$2" = "$3" ]; then ok "$1  [$2]"; else bad "$1" "got '$2' want '$3'"; fi; }

M=11111111-1111-1111-1111-111111111111
echo "── W4-2 · thread subject and the authored-act binding ────────"

q "INSERT INTO members (id) VALUES ('$M') ON CONFLICT DO NOTHING;" >/dev/null
q "INSERT INTO member_manuscripts (id) VALUES ('aaaaaaaa-0000-4000-8000-00000000000a');" >/dev/null
q "INSERT INTO proposal_chains (id, member_id, work_id, draft_id, base_version, target_section_id, expected_text) VALUES
   ('cccccccc-0000-4000-8000-00000000000c','$M','aaaaaaaa-0000-4000-8000-00000000000a','dddddddd-0000-4000-8000-00000000000d',41,'eeeeeeee-0000-4000-8000-00000000000e',', fixated'),
   ('cccccccc-0000-4000-8000-00000000000d','$M','aaaaaaaa-0000-4000-8000-00000000000a','dddddddd-0000-4000-8000-00000000000d',41,'eeeeeeee-0000-4000-8000-00000000000e',', fixated');" >/dev/null
C1=cccccccc-0000-4000-8000-00000000000c
C2=cccccccc-0000-4000-8000-00000000000d
TH="INSERT INTO ask_threads (id, manuscript_id, member_id, anchor, reading_identity, canonical_at_open, initiated_by, proposal_chain_id) VALUES"
W=aaaaaaaa-0000-4000-8000-00000000000a

# ══ X · THE THREAD HAS EXACTLY ONE SUBJECT ═════════════════════════════════
admits "X1 · ⭐ an EDITORIAL thread — a chain, and no anchor" \
  "$TH ('11110000-0000-4000-8000-0000000000e1','$W','$M',NULL,NULL,'c1','author','$C1');"
admits "X2 · an ANCHORED Ask thread — an anchor, and no chain" \
  "$TH ('11110000-0000-4000-8000-0000000000e2','$W','$M','{\"on\":\"work\"}',NULL,'c1','author',NULL);"
refuses "X3 · ⛔⛔ BOTH subjects — the substitution W4-2 exists to forbid" \
  "$TH ('11110000-0000-4000-8000-0000000000e3','$W','$M','{\"on\":\"work\"}',NULL,'c1','author','$C1');" \
  "ask_threads_one_subject"
refuses "X4 · ⛔ NEITHER subject — a thread about nothing" \
  "$TH ('11110000-0000-4000-8000-0000000000e4','$W','$M',NULL,NULL,'c1','author',NULL);" \
  "ask_threads_one_subject"
refuses "X5 · ⛔ an editorial thread ALSO frozen against a reading" \
  "$TH ('11110000-0000-4000-8000-0000000000e5','$W','$M',NULL,'{\"r\":1}','c1','author','$C1');" \
  "ask_threads_editorial_has_no_reading"
admits "X6 · ⭐ an ANCHORED thread may carry a reading — that is what it is for" \
  "$TH ('11110000-0000-4000-8000-0000000000e6','$W','$M','{\"on\":\"work\"}','{\"r\":1}','c1','author',NULL);"
# ⭐⭐ THE ASSERTION THAT PROVES PART D RAN. A constraint left NOT VALID is
# enforced for new rows and silently unenforced over the existing ones, so X3/X4
# would pass while the invariant was never established over the table.
eq "X7 · ⭐⭐ both CHECKs are VALIDATED, not left NOT VALID" \
  "$(q "SELECT count(*) FROM pg_constraint WHERE conrelid='ask_threads'::regclass
        AND conname IN ('ask_threads_one_subject','ask_threads_editorial_has_no_reading')
        AND convalidated;")" "2"
eq "X8 · anchor is now nullable" \
  "$(q "SELECT is_nullable FROM information_schema.columns
        WHERE table_name='ask_threads' AND column_name='anchor';")" "YES"

ED=11110000-0000-4000-8000-0000000000e1
AN=11110000-0000-4000-8000-0000000000e2
q "INSERT INTO ask_turns (thread_id, turn_index, speaker, body, staleness) VALUES
   ('$ED',0,'author','make it gentler','{}'),
   ('$ED',1,'maia','like this?','{}'),
   ('$ED',2,'author','and again','{}'),
   ('$ED',3,'maia','again','{}'),
   ('$AN',0,'author','what is this about?','{}');" >/dev/null
q "INSERT INTO proposal_chain_directions (id, member_id, proposal_chain_id, author, instruction, refers_to_version_id) VALUES
   ('33330000-0000-4000-8000-00000000000a','$M','$C1','member','Make it gentler.',NULL),
   ('33330000-0000-4000-8000-00000000000b','$M','$C1','maia','Shall we try it shorter?',NULL),
   ('33330000-0000-4000-8000-00000000000c','$M','$C2','member','A direction in the OTHER chain.',NULL),
   ('33330000-0000-4000-8000-00000000000d','$M','$C1','member','Spare, unclaimed.',NULL),
   ('33330000-0000-4000-8000-00000000000e','$M','$C1','member','Spare, unclaimed.',NULL);" >/dev/null
q "INSERT INTO proposal_versions (id, chain_id, author, formulation, supersedes) VALUES
   ('99999999-0000-4000-8000-00000000000a','$C1','maia',', held',NULL),
   ('99999999-0000-4000-8000-00000000000b','$C2','maia',', held elsewhere',NULL),
   -- ⭐ a SUCCESSOR, not a second root: proposal_versions_one_root admits
   -- exactly one supersedes-NULL version per chain.
   ('99999999-0000-4000-8000-00000000000f','$C1','maia',', spare and unclaimed','99999999-0000-4000-8000-00000000000a');" >/dev/null
DM=33330000-0000-4000-8000-00000000000a   # member Direction, chain 1
DA=33330000-0000-4000-8000-00000000000b   # MAIA Direction, chain 1
DO_=33330000-0000-4000-8000-00000000000c  # member Direction, chain 2
V1=99999999-0000-4000-8000-00000000000a   # MAIA Version, chain 1
V2=99999999-0000-4000-8000-00000000000b   # MAIA Version, chain 2
# ⭐ Spare acts, deliberately UNCLAIMED. An adversarial row must fail for the
# reason it names — a case that also collides on B7/B8 is refused by the wrong
# constraint and proves nothing about the one under test.
D2=33330000-0000-4000-8000-00000000000d
D3=33330000-0000-4000-8000-00000000000e
V3=99999999-0000-4000-8000-00000000000f
B="INSERT INTO editorial_turn_bindings (thread_id, turn_index, turn_speaker, proposal_chain_id, act_author, direction_id, version_id) VALUES"

# ══ B · THE BINDING ════════════════════════════════════════════════════════
admits "B0a · ⭐ the member's turn 0 produced the member's Direction" \
  "$B ('$ED',0,'author','$C1','member','$DM',NULL);"
admits "B0b · ⭐ MAIA's turn 1 produced MAIA's Version" \
  "$B ('$ED',1,'maia','$C1','maia',NULL,'$V1');"
refuses "B6a · ⛔ a SECOND adjunct on a turn that already has one" \
  "$B ('$ED',0,'author','$C1','member',NULL,'$V1');" "editorial_turn_bindings_pkey"
refuses "B6b · ⛔ BOTH adjuncts in one row" \
  "$B ('$ED',2,'author','$C1','member','$DM','$V1');" "etb_one_adjunct"
refuses "B6c · ⛔ NEITHER adjunct — a binding that binds nothing" \
  "$B ('$ED',2,'author','$C1','member',NULL,NULL);" "etb_one_adjunct"
refuses "B9a · ⛔⛔ a MEMBER's Direction attributed to MAIA's turn" \
  "$B ('$ED',1,'maia','$C1','member','$DM',NULL);" "etb_speaker_matches_author"
refuses "B9b · ⛔⛔ MAIA's Version attributed to the AUTHOR's turn" \
  "$B ('$ED',2,'author','$C1','maia',NULL,'$V1');" "etb_speaker_matches_author"
refuses "B9c · ⛔ a turn whose speaker the binding MISREPORTS" \
  "$B ('$ED',2,'maia','$C1','maia',NULL,'$V3');" "etb_turn"
refuses "B2 · ⛔⛔ a binding onto an ANCHORED Ask thread" \
  "$B ('$AN',0,'author','$C1','member','$D2',NULL);" "etb_thread_is_editorial"
refuses "B3 · ⛔ a chain that is NOT this thread's chain" \
  "$B ('$ED',2,'author','$C2','member','$DO_',NULL);" "etb_thread_is_editorial"
refuses "B1 · ⛔ a turn index that does not exist in the thread" \
  "$B ('$ED',9,'author','$C1','member','$D3',NULL);" "etb_turn"
refuses "B4 · ⛔⛔ a Direction belonging to ANOTHER chain" \
  "$B ('$ED',2,'author','$C1','member','$DO_',NULL);" "etb_direction"
refuses "B5 · ⛔⛔ a Version belonging to ANOTHER chain" \
  "$B ('$ED',3,'maia','$C1','maia',NULL,'$V2');" "etb_version"
refuses "B7 · ⛔ the SAME Direction claimed by a second turn" \
  "$B ('$ED',2,'author','$C1','member','$DM',NULL);" "etb_one_turn_per_direction"
refuses "B8 · ⛔ the SAME Version claimed by a second turn" \
  "$B ('$ED',3,'maia','$C1','maia',NULL,'$V1');" "etb_one_turn_per_version"

# ══ IMMUTABILITY AND WITHDRAWAL ════════════════════════════════════════════
refuses "M1 · ⛔ UPDATE — a correction is a new binding, never a revision" \
  "UPDATE editorial_turn_bindings SET direction_id='$DA' WHERE thread_id='$ED' AND turn_index=0;" \
  "immutable"
# ⭐⭐ THE DISCRIMINATOR. authored_editorial_record_immutable() refuses UPDATE
# AND DELETE; reusing it here because the name fits would make withdrawal
# unenforceable at the exact seam that carries it. This obligation FAILS against
# that wrong implementation and passes against the right one.
admits "M2 · ⭐⭐ DELETE is ADMITTED — withdrawal must be able to remove a binding" \
  "DELETE FROM editorial_turn_bindings WHERE thread_id='$ED' AND turn_index=1;"
eq "M2b · and the Version it named SURVIVES its binding's withdrawal" \
  "$(q "SELECT count(*) FROM proposal_versions WHERE id='$V1';")" "1"
q "$B ('$ED',1,'maia','$C1','maia',NULL,'$V1');" >/dev/null

# ══ LIFECYCLE — the impossible FK, avoided ═════════════════════════════════
q "DELETE FROM ask_threads WHERE id='$ED';" >/dev/null
eq "L1 · ⭐⭐ deleting the conversation removes its bindings and NOTHING else" \
  "$(q "SELECT count(*) FROM editorial_turn_bindings WHERE thread_id='$ED';")/$(q "SELECT count(*) FROM proposal_chain_directions WHERE id='$DM';")/$(q "SELECT count(*) FROM proposal_versions WHERE id='$V1';")" \
  "0/1/1"
# ⭐ Recorded rather than smoothed, the same way W5-3 · S6c was: the binding's
# ON DELETE RESTRICT on the act side is a BELT that can never be reached,
# because an authored act refuses DELETE by its own trigger first. Asserting
# RESTRICT here would claim a protection that never fires.
refuses "L2 · ⭐ an authored Direction cannot be deleted AT ALL — its own trigger fires before the binding's RESTRICT" \
  "DELETE FROM proposal_chain_directions WHERE id='$DM';" "immutable"

# ══ ANTI-COLLAPSE — from the CATALOGUE, never from comments ════════════════
eq "A1 · ⛔ no surrogate id and no chronology column on the binding" \
  "$(q "SELECT count(*) FROM information_schema.columns
        WHERE table_name='editorial_turn_bindings'
          AND column_name IN ('id','created_order','event_index','editorial_sequence','authored_at','created_at','bound_at');")" "0"
eq "A2 · ⛔ the binding carries NO wording of its own" \
  "$(q "SELECT count(*) FROM information_schema.columns
        WHERE table_name='editorial_turn_bindings'
          AND column_name IN ('formulation','instruction','observation','replacement_text','body');")" "0"
eq "A3 · ⭐ the identity IS (thread_id, turn_index)" \
  "$(q "SELECT string_agg(a.attname, ',' ORDER BY a.attnum)
        FROM pg_index i JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid='editorial_turn_bindings'::regclass AND i.indisprimary;")" "thread_id,turn_index"
eq "A4 · ⛔ no FK points FROM an authored act AT a thread or a binding" \
  "$(q "SELECT count(*) FROM pg_constraint c
        JOIN pg_class s ON s.oid=c.conrelid JOIN pg_class t ON t.oid=c.confrelid
        WHERE c.contype='f'
          AND s.relname IN ('proposal_chain_directions','proposal_versions','proposal_chain_insights')
          AND t.relname IN ('ask_threads','ask_turns','editorial_turn_bindings');")" "0"
eq "A5 · ⭐ the Direction FK really does target (chain, id, author)" \
  "$(q "SELECT count(*) FROM pg_constraint WHERE conname='etb_direction' AND confmatchtype='s';")" "1"

echo
echo "  $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ]
