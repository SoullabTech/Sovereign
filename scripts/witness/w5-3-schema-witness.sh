#!/usr/bin/env bash
# W5-3 · THE EDITORIAL ONTOLOGY — asserted on the DATABASE's behaviour.
#
# ⭐⭐ THE BAR: the database must refuse every way the editorial subject can be
# substituted, every way an authored non-wording act can become mutable, and
# every way conversation can acquire executable wording by convenience.
#
# ⛔ DISPOSABLE DATABASE ONLY. Every fact is established by PERFORMING the act,
# never by reading the migration text — a constraint that exists and does not
# fire is not enforcement.
set -u
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"; PGDB="${PGDB:-w5_witness}"
case "$PGDB" in *witness*) ;; *) echo "REFUSED · '$PGDB' is not a witness database."; exit 2;; esac

# ⭐ THE WITNESS REBUILDS ITS OWN DATABASE. The first run left fixtures behind
# and the second reported duplicate-key errors as obligation failures — a
# witness whose result depends on whether it has run before is not measuring the
# schema, it is measuring its own history.
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
N=55555555-5555-5555-5555-555555555555
echo "── W5-3 · editorial ontology ─────────────────────────────────"

q "INSERT INTO members (id) VALUES ('$M'),('$N') ON CONFLICT DO NOTHING;" >/dev/null
q "INSERT INTO member_manuscripts (id) VALUES
     ('aaaaaaaa-0000-4000-8000-00000000000a'),
     ('bbbbbbbb-0000-4000-8000-00000000000b');" >/dev/null
# chain X for member M on Work A; chain Y for member M on Work B; chain Z for member N
q "INSERT INTO proposal_chains (id, member_id, work_id, draft_id, base_version, target_section_id, expected_text) VALUES
   ('cccccccc-0000-4000-8000-00000000000c','$M','aaaaaaaa-0000-4000-8000-00000000000a','dddddddd-0000-4000-8000-00000000000d',41,'eeeeeeee-0000-4000-8000-00000000000e',', fixated'),
   ('cccccccc-0000-4000-8000-00000000000f','$M','bbbbbbbb-0000-4000-8000-00000000000b','dddddddd-0000-4000-8000-00000000000d',41,'eeeeeeee-0000-4000-8000-00000000000e',', fixated'),
   ('cccccccc-0000-4000-8000-000000000001','$N','aaaaaaaa-0000-4000-8000-00000000000a','dddddddd-0000-4000-8000-00000000000d',41,'eeeeeeee-0000-4000-8000-00000000000e',', fixated');" >/dev/null
CX=cccccccc-0000-4000-8000-00000000000c   # M · Work A
CY=cccccccc-0000-4000-8000-00000000000f   # M · Work B
CZ=cccccccc-0000-4000-8000-000000000001   # N · Work A
# a version in CX, and one in CY, for the Direction reference tests
q "INSERT INTO proposal_versions (id, chain_id, author, formulation, supersedes) VALUES
   ('99999999-0000-4000-8000-00000000000a','$CX','maia',', held',NULL),
   ('99999999-0000-4000-8000-00000000000b','$CY','maia',', held',NULL);" >/dev/null
VX=99999999-0000-4000-8000-00000000000a
VY=99999999-0000-4000-8000-00000000000b

# ⭐ CARRIED FORWARD, WITH ITS PROVENANCE VISIBLE. The anchor = NULL adaptation
# below was authored at `ca355b983` (2026-09-15 00:10Z) on
# `chore/w4-2-migration-20260915`, a branch that never reached canonical. It is
# reused here rather than rewritten, and it is named rather than absorbed.
# ⛔ The migration reference in the next sentence is updated: the XOR now lands
# in 20260915000001_ask_threads_subject_preparation.sql and is VALIDATED in
# 20260915000002 — two files, per the W4-2.1 phasing seal.
#
# ⭐ W4-S1/S2: a thread has EXACTLY ONE SUBJECT. The chain-bound
# rows below therefore pass anchor = NULL; the unbound row S1 keeps its anchor.
# ⛔ Before that migration anchor was NOT NULL, so this fixture HAD to supply
# one — which is why it wrote a two-subject thread and why W4-2 found it.
TH="INSERT INTO ask_threads (id, manuscript_id, member_id, anchor, canonical_at_open, initiated_by, proposal_chain_id) VALUES"

# ══ DISCOURSE ══════════════════════════════════════════════════════════════
admits "S1 · ⭐ an UNBOUND thread is admitted — MATCH SIMPLE leaves it unchecked" \
  "$TH ('11110000-0000-4000-8000-00000000000a','aaaaaaaa-0000-4000-8000-00000000000a','$M','{\"on\":\"work\"}','c1','author',NULL);"
admits "S2 · thread M/Work A → chain M/Work A" \
  "$TH ('11110000-0000-4000-8000-00000000000b','aaaaaaaa-0000-4000-8000-00000000000a','$M',NULL,'c1','author','$CX');"
refuses "S3 · ⭐⭐ thread M/Work A → chain M/Work B — the WRONG-WORK substitution" \
  "$TH ('11110000-0000-4000-8000-00000000000c','aaaaaaaa-0000-4000-8000-00000000000a','$M',NULL,'c1','author','$CY');" \
  "ask_threads_proposal_chain_fkey"
refuses "S4 · thread M → chain owned by N" \
  "$TH ('11110000-0000-4000-8000-00000000000d','aaaaaaaa-0000-4000-8000-00000000000a','$M',NULL,'c1','author','$CZ');" \
  "ask_threads_proposal_chain_fkey"
refuses "S5a · ⛔ NULL → chain after open (attaching an old conversation)" \
  "UPDATE ask_threads SET proposal_chain_id='$CX' WHERE id='11110000-0000-4000-8000-00000000000a';" \
  "immutable"
refuses "S5b · ⛔ chain C1 → C2" \
  "UPDATE ask_threads SET proposal_chain_id='$CY' WHERE id='11110000-0000-4000-8000-00000000000b';" \
  "immutable"
refuses "S5c · ⛔ chain → NULL (the quiet unbinding)" \
  "UPDATE ask_threads SET proposal_chain_id=NULL WHERE id='11110000-0000-4000-8000-00000000000b';" \
  "immutable"
# ⭐⭐ THE INVERSE OBLIGATION, added by the W4 schema act (founder, 2026-09-15).
#
# Adapting the fixture to anchor = NULL is only half the work, and the missing
# half is the dangerous one: S3 and S4 above prove the WRONG-WORK and
# WRONG-MEMBER substitutions are refused BY THE FK, and they only prove that
# while their rows carry NO anchor. ⛔ Had the fixture kept its anchors, those
# two rows would now be refused by `ask_threads_one_subject` instead — the
# obligations would still read PASS while proving something weaker and
# different. A witness that passes for a new reason has stopped testing what it
# names.
#
# So the XOR gets its own obligation, and the two-subject thread the old fixture
# used to write is now the thing that is refused.
refuses "S8 · ⭐⭐ anchor AND proposal_chain_id together — the two-subject thread" \
  "$TH ('11110000-0000-4000-8000-000000000011','aaaaaaaa-0000-4000-8000-00000000000a','$M','{\"on\":\"work\"}','c1','author','$CX');" \
  "ask_threads_one_subject"
refuses "S8b · ⛔ and NEITHER subject — a thread about nothing is not a thread" \
  "$TH ('11110000-0000-4000-8000-000000000012','aaaaaaaa-0000-4000-8000-00000000000a','$M',NULL,'c1','author',NULL);" \
  "ask_threads_one_subject"

admits "S7 · ⭐ MANY threads may belong to one chain" \
  "$TH ('11110000-0000-4000-8000-00000000000e','aaaaaaaa-0000-4000-8000-00000000000a','$M',NULL,'c1','maia','$CX');"

# ⛔⛔ S6 IS KNOWN-VACUOUS AND IS LEFT THAT WAY ON PURPOSE.
#
# Disclosed at `b67eb15e5` (W5_WITNESS_INTEGRITY_FINDINGS_2026-09-15.md): the
# seed below names `asked_at`, which does not exist on `ask_turns`, so the
# INSERT never writes and S6 passes ON ZERO — the turn it claims was removed was
# never there.
#
# ⛔ NOT REPAIRED HERE. The W5 witness repair is held under its own separate
# authorization, and repairing it inside the W4 act would absorb a disclosed
# finding into an unrelated change. ⭐ This marker is disclosure in place, not a
# fix: it exists so no reader takes S6's PASS for a functioning assertion.
# ⭐ S6b and S6c below are NOT vacuous and are unaffected.
#
# S6 · deleting a bound thread takes its turns and NOTHING else
q "INSERT INTO ask_turns (thread_id, turn_index, speaker, body, asked_at)
   VALUES ('11110000-0000-4000-8000-00000000000b',0,'author','why?',now());" >/dev/null
q "DELETE FROM ask_threads WHERE id='11110000-0000-4000-8000-00000000000b';" >/dev/null
eq "S6 · deleting a bound thread removes its turns" \
  "$(q "SELECT count(*) FROM ask_turns WHERE thread_id='11110000-0000-4000-8000-00000000000b';")" "0"
eq "S6b · ⭐⭐ the chain and its versions REMAIN" \
  "$(q "SELECT count(*) FROM proposal_chains WHERE id='$CX';")/$(q "SELECT count(*) FROM proposal_versions WHERE chain_id='$CX';")" "1/1"
# ⭐⭐ A REAL FINDING, recorded rather than smoothed. This obligation first
# asserted the FK would refuse — and the DELETE is refused EARLIER and by
# something stronger: `proposal_chains` is append-only by its own trigger, so no
# chain can be deleted by anything, ever. The FK's ON DELETE RESTRICT is
# therefore belt-and-braces and is UNREACHABLE in practice. Asserting the FK
# here would have claimed a protection that never fires.
refuses "S6c · ⭐⭐ a chain cannot be deleted AT ALL — append-only fires before the FK" \
  "DELETE FROM proposal_chains WHERE id='$CX';" "append-only"

# ══ INSIGHT ════════════════════════════════════════════════════════════════
INS="INSERT INTO proposal_chain_insights (id, member_id, proposal_chain_id, author, observation) VALUES"
admits "I1 · ⭐⭐ a ZERO-VERSION chain may carry an Insight — 'I would keep this'" \
  "INSERT INTO proposal_chains (id, member_id, work_id, draft_id, base_version, target_section_id, expected_text)
     VALUES ('cccccccc-0000-4000-8000-000000000002','$M','aaaaaaaa-0000-4000-8000-00000000000a','dddddddd-0000-4000-8000-00000000000d',41,'eeeeeeee-0000-4000-8000-00000000000e',', fixated');
   $INS ('22220000-0000-4000-8000-00000000000a','$M','cccccccc-0000-4000-8000-000000000002','maia','In context I would leave it; the repetition is doing emotional work.');"
eq "I1b · and that chain genuinely has NO versions" \
  "$(q "SELECT count(*) FROM proposal_versions WHERE chain_id='cccccccc-0000-4000-8000-000000000002';")" "0"
refuses "I2 · ⛔ a member-authored Insight" \
  "$INS ('22220000-0000-4000-8000-00000000000b','$M','$CX','member','mine');" "author"
refuses "I3 · ⛔ a blank observation" \
  "$INS ('22220000-0000-4000-8000-00000000000c','$M','$CX','maia','   ');" "observation"
refuses "I3b · ⛔ an Insight on another member's chain" \
  "$INS ('22220000-0000-4000-8000-00000000000d','$M','$CZ','maia','x');" "chain_fkey"
refuses "I4 · ⛔ UPDATE" \
  "UPDATE proposal_chain_insights SET observation='rewritten' WHERE id='22220000-0000-4000-8000-00000000000a';" "immutable"
refuses "I5 · ⛔ DELETE" \
  "DELETE FROM proposal_chain_insights WHERE id='22220000-0000-4000-8000-00000000000a';" "immutable"

# ══ DIRECTION ══════════════════════════════════════════════════════════════
DIR="INSERT INTO proposal_chain_directions (id, member_id, proposal_chain_id, author, instruction, refers_to_version_id) VALUES"
admits "D1 · a member-authored Direction" \
  "$DIR ('33330000-0000-4000-8000-00000000000a','$M','$CX','member','Make it gentler.',NULL);"
admits "D2 · a MAIA-authored Direction" \
  "$DIR ('33330000-0000-4000-8000-00000000000b','$M','$CX','maia','Shall we try it shorter?',NULL);"
admits "D3 · ⭐ a reference to a version IN THIS CHAIN" \
  "$DIR ('33330000-0000-4000-8000-00000000000c','$M','$CX','member','Go back to what V1 was doing.','$VX');"
refuses "D4 · ⛔⛔ a reference to a version in ANOTHER chain — unrepresentable" \
  "$DIR ('33330000-0000-4000-8000-00000000000d','$M','$CX','member','x','$VY');" "version_fkey"
admits "D5 · ⭐ a Direction with NO reference is lawful (MATCH SIMPLE again)" \
  "$DIR ('33330000-0000-4000-8000-00000000000e','$M','$CX','maia','Try another approach.',NULL);"
refuses "D6 · ⛔ a blank instruction" \
  "$DIR ('33330000-0000-4000-8000-00000000000f','$M','$CX','member','  ',NULL);" "instruction"
refuses "D6b · ⛔ an author outside the vocabulary" \
  "$DIR ('33330000-0000-4000-8000-000000000011','$M','$CX','editor','x',NULL);" "author"
refuses "D7 · ⛔ UPDATE" \
  "UPDATE proposal_chain_directions SET instruction='changed' WHERE id='33330000-0000-4000-8000-00000000000a';" "immutable"
refuses "D8 · ⛔ DELETE" \
  "DELETE FROM proposal_chain_directions WHERE id='33330000-0000-4000-8000-00000000000a';" "immutable"

# ══ ANTI-COLLAPSE — from the CATALOGUE, never from comments ════════════════
eq "A1 · ⭐⭐ among the four tables, ONLY proposal_versions carries a formulation" \
  "$(q "SELECT string_agg(DISTINCT table_name, ',' ORDER BY table_name)
        FROM information_schema.columns
        WHERE table_name IN ('proposal_chain_insights','proposal_chain_directions','ask_turns','proposal_versions')
          AND column_name = 'formulation';")" "proposal_versions"
eq "A2 · ⛔ neither authored table carries wording, binding or receipt columns" \
  "$(q "SELECT count(*) FROM information_schema.columns
        WHERE table_name IN ('proposal_chain_insights','proposal_chain_directions')
          AND column_name IN ('supersedes','replacement_text','formulation','expected_text',
                              'operation','authorization_id','accepted_at','resulting_version');")" "0"
eq "A3 · ⛔ no FK from the new objects or ask_threads to the authorization ledger" \
  "$(q "SELECT count(*) FROM pg_constraint c
        JOIN pg_class s ON s.oid = c.conrelid
        JOIN pg_class t ON t.oid = c.confrelid
        WHERE c.contype='f' AND t.relname='manuscript_revision_authorizations'
          AND s.relname IN ('proposal_chain_insights','proposal_chain_directions','ask_threads');")" "0"
eq "A4 · ⛔ Direction has NO succession column, and no answer/status lifecycle" \
  "$(q "SELECT count(*) FROM information_schema.columns
        WHERE table_name='proposal_chain_directions'
          AND column_name IN ('supersedes','answered_at','spent','status','resolved_at','satisfied_by');")" "0"
eq "A5 · ⛔ Insight has NO version relationship of any kind" \
  "$(q "SELECT count(*) FROM information_schema.columns
        WHERE table_name='proposal_chain_insights' AND column_name LIKE '%version%';")" "0"
eq "A6 · ⭐ the discourse FK is MATCH SIMPLE with RESTRICT on both sides" \
  "$(q "SELECT c.confmatchtype::text || c.confupdtype::text || c.confdeltype::text
        FROM pg_constraint c WHERE c.conname='ask_threads_proposal_chain_fkey';")" "srr"
eq "A7 · ⛔ no second binding timestamp — opened_at IS the binding time" \
  "$(q "SELECT count(*) FROM information_schema.columns
        WHERE table_name='ask_threads' AND column_name IN ('bound_at','chain_bound_at');")" "0"
# ⭐ NARROWED by W4-2, and the law is UNCHANGED. The old predicate matched ANY
# unique index mentioning proposal_chain_id, so W4-2's FK target
# UNIQUE (id, proposal_chain_id) failed it — although that index constrains
# NOTHING, id being the PK already. What the obligation forbids is a unique key
# that makes a chain determine at most one thread: one that names
# proposal_chain_id and does NOT include id. ⛔ A unique index leading with
# proposal_chain_id would still fail this, as it must.
eq "A8 · ⛔ no uniqueness that restricts threads per chain" \
  "$(q "SELECT count(*) FROM pg_index i JOIN pg_class c ON c.oid = i.indrelid
        WHERE c.relname='ask_threads' AND i.indisunique
          AND EXISTS (SELECT 1 FROM unnest(i.indkey::int[]) k
                      JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=k
                      WHERE a.attname='proposal_chain_id')
          AND NOT EXISTS (SELECT 1 FROM unnest(i.indkey::int[]) k
                          JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=k
                          WHERE a.attname='id');")" "0"
eq "A9 · ⛔ AskAnchor untouched — no anchor column was added or altered" \
  "$(q "SELECT data_type FROM information_schema.columns
        WHERE table_name='ask_threads' AND column_name='anchor';")" "jsonb"

echo
echo "  $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ]
