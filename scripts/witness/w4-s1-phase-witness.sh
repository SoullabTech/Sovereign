#!/usr/bin/env bash
# W4-S1 · THE SAFE INTERMEDIATE STATE — asserted on the DATABASE's behaviour.
#
# ⭐⭐ THIS IS THE OBLIGATION THE TWO-FILE SHAPE EXISTS TO DELIVER. Carrier §10
# claims that if W4-S2 refuses, the database rests somewhere strictly better
# than a half-applied file: anchor nullable · both CHECKs present and ENFORCED
# ON NEW ROWS · any violating row still visible and findable · S1 ledgered, S2
# not. ⛔ That claim is worthless unread — a one-file carrier would fail these
# same assertions, which is what makes them discriminating rather than decorative.
#
# ⛔ DISPOSABLE DATABASE ONLY. Every fact is established by PERFORMING the act.
set -u
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"; PGDB="${PGDB:-w4_phase_witness}"
case "$PGDB" in *witness*) ;; *) echo "REFUSED · '$PGDB' is not a witness database."; exit 2;; esac
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STUBS="${STEP2_RUNTIME_STUBS:-/tmp/step2_runtime_stubs.sql}"
[ -f "$STUBS" ] || { echo "REFUSED · stubs not found: $STUBS"; exit 2; }

# ⭐ Built to S1 AND NO FURTHER — the point of the witness is the state between
# the two ledger acts, which no full rebuild can show.
psql -h "$PGH" -p "$PGP" -U "$PGU" -d postgres -q \
  -c "DROP DATABASE IF EXISTS $PGDB;" -c "CREATE DATABASE $PGDB;" >/dev/null 2>&1
TMP="$(mktemp)"
grep -v '^CREATE TABLE ask_threads\|^CREATE TABLE ask_turns\|^  turn_index integer NOT NULL, speaker' "$STUBS" > "$TMP"
psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 -f "$TMP" >/dev/null || {
  echo "REFUSED · stub load failed"; rm -f "$TMP"; exit 2; }
rm -f "$TMP"
for m in 20260901000001_ask_threads \
         20260914000001_proposal_succession 20260914000002_manuscript_revision_offers \
         20260914000003_proposal_chains_member_identity \
         20260914000004_manuscript_revision_authorizations \
         20260914000005_editorial_ontology \
         20260915000001_w4_s1_thread_subject_preparation; do
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 \
    -f "$ROOT/database/migrations/$m.sql" >/dev/null || {
      echo "REFUSED · migration failed: $m"; exit 2; }
done

q()   { psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -tAq -c "$1" 2>&1; }
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }
bad() { FAIL=$((FAIL+1)); printf '  FAIL  %s\n     -> %s\n' "$1" "$2"; }
eq()  { if [ "$2" = "$3" ]; then ok "$1  [$2]"; else bad "$1" "got '$2' want '$3'"; fi; }
admits()  { local out; out="$(q "$2")"
  if printf '%s' "$out" | grep -q 'ERROR'; then bad "$1" "$(printf '%s' "$out" | head -1)"; else ok "$1"; fi; }
refuses() { local out; out="$(q "$2")"
  if printf '%s' "$out" | grep -q 'ERROR'; then
    if printf '%s' "$out" | grep -qi "$3"; then ok "$1  [$3]"
    else bad "$1" "refused, but not by '$3': $(printf '%s' "$out" | head -1)"; fi
  else bad "$1" "NOT REFUSED"; fi; }

M=11111111-1111-1111-1111-111111111111
W=aaaaaaaa-0000-4000-8000-00000000000a
echo "── W4-S1 · the state between the two ledger acts ─────────────"
q "INSERT INTO members (id) VALUES ('$M') ON CONFLICT DO NOTHING;" >/dev/null
q "INSERT INTO member_manuscripts (id) VALUES ('$W');" >/dev/null
q "INSERT INTO proposal_chains (id, member_id, work_id, draft_id, base_version, target_section_id, expected_text) VALUES
   ('cccccccc-0000-4000-8000-00000000000c','$M','$W','dddddddd-0000-4000-8000-00000000000d',41,'eeeeeeee-0000-4000-8000-00000000000e',', fixated');" >/dev/null
C=cccccccc-0000-4000-8000-00000000000c
TH="INSERT INTO ask_threads (id, manuscript_id, member_id, anchor, reading_identity, canonical_at_open, initiated_by, proposal_chain_id) VALUES"

eq "P1 · anchor is nullable after S1" \
  "$(q "SELECT is_nullable FROM information_schema.columns
        WHERE table_name='ask_threads' AND column_name='anchor';")" "YES"
eq "P2 · ⭐ both CHECKs are PRESENT" \
  "$(q "SELECT count(*) FROM pg_constraint WHERE conrelid='ask_threads'::regclass
        AND conname IN ('ask_threads_one_subject','ask_threads_editorial_has_no_reading');")" "2"
eq "P3 · ⭐⭐ and NEITHER is validated yet — S1 does not validate" \
  "$(q "SELECT count(*) FROM pg_constraint WHERE conrelid='ask_threads'::regclass
        AND conname IN ('ask_threads_one_subject','ask_threads_editorial_has_no_reading')
        AND convalidated;")" "0"
# ⭐⭐ THE LOAD-BEARING PAIR. NOT VALID is enforced for NEW rows and silently
# unenforced over the OLD ones. P4 proves the first half is real after S1 alone,
# so the intermediate state genuinely stops the bleeding; P3 proves the second
# half is still outstanding, which is exactly why S2's VALIDATE is not optional.
refuses "P4 · ⭐⭐ a two-subject thread is ALREADY REFUSED after S1 alone" \
  "$TH ('11110000-0000-4000-8000-0000000000e3','$W','$M','{\"on\":\"work\"}',NULL,'c1','author','$C');" \
  "ask_threads_one_subject"
admits "P5 · an editorial thread is admitted after S1 alone" \
  "$TH ('11110000-0000-4000-8000-0000000000e1','$W','$M',NULL,NULL,'c1','author','$C');"
eq "P6 · ⛔ the binding does NOT exist yet — S1 creates no substrate" \
  "$(q "SELECT count(*) FROM information_schema.tables WHERE table_name='editorial_turn_bindings';")" "0"
eq "P7 · ⛔ nor any of S2's four UNIQUE targets" \
  "$(q "SELECT count(*) FROM pg_constraint WHERE conname IN
        ('ask_threads_id_chain_key','ask_turns_thread_index_speaker_key',
         'proposal_chain_directions_chain_id_id_author_key',
         'proposal_versions_chain_id_id_author_key');")" "0"
# ⭐ IDEMPOTENCE, PERFORMED. §10 requires it because a runner that fails after
# the file succeeds but before its ledger write WILL re-run the file.
OUT="$(psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 \
       -f "$ROOT/database/migrations/20260915000001_w4_s1_thread_subject_preparation.sql" 2>&1)"
if printf '%s' "$OUT" | grep -q 'ERROR'; then
  bad "P8 · ⭐ S1 re-runs cleanly" "$(printf '%s' "$OUT" | head -1)"
else ok "P8 · ⭐ S1 RE-RUNS CLEANLY — the retry a lost ledger write would cause"; fi
eq "P9 · and the re-run added no duplicate constraint" \
  "$(q "SELECT count(*) FROM pg_constraint WHERE conrelid='ask_threads'::regclass
        AND conname IN ('ask_threads_one_subject','ask_threads_editorial_has_no_reading');")" "2"

echo
echo "  $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ]
