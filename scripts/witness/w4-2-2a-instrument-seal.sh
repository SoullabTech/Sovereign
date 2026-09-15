#!/usr/bin/env bash
# W4-2.2a · PREFLIGHT INSTRUMENT SEAL.
#
# ⭐⭐ THE GOVERNING RULE (founder, 2026-09-14):
#
#     An instrument for discovering drift must itself survive drift without
#     converting "I cannot measure this state" into either zero or failure.
#
# So the instrument is run against DELIBERATELY DRIFTED databases — a legacy
# ledger, a half-applied W5, a missing column, a missing table — and each must
# produce a NAMED state rather than an error or a silent zero.
#
# ⛔ DISPOSABLE DATABASES ONLY. Every database this creates is named `*witness*`
# and dropped on the way in. ⛔ It never touches the protected database and
# cannot: it takes a local cluster, not a DSN.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SQL="$ROOT/scripts/witness/w4-2-2-protected-preflight.sql"
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"
[ -f "$SQL" ] || { echo "REFUSED · instrument not found: $SQL"; exit 2; }

pass=0; fail=0
ok()  { pass=$((pass+1)); echo "  PASS  $1"; }
bad() { fail=$((fail+1)); echo "  FAIL  $1"; echo "     -> $2"; }

# Build a disposable database from the SQL handed on stdin, run the instrument,
# and echo its output.
run_case() {
  local db="$1"; shift
  case "$db" in *witness*) ;; *) echo "REFUSED · '$db' is not a witness database."; exit 2;; esac
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d postgres -X -q \
    -c "DROP DATABASE IF EXISTS $db;" -c "CREATE DATABASE $db;" >/dev/null 2>&1
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$db" -X -q -v ON_ERROR_STOP=1 >/dev/null 2>&1
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$db" -X -q -v ON_ERROR_STOP=1 -c "$1" >/dev/null 2>&1
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$db" -X -f "$SQL" 2>&1
}

expect()     { if echo "$3" | grep -qF -- "$2"; then ok "$1"; else bad "$1" "expected to contain: $2"; fi; }
expect_not() { if echo "$3" | grep -qF -- "$2"; then bad "$1" "must NOT contain: $2"; else ok "$1"; fi; }
ran()        { if echo "$2" | grep -q 'WHAT THIS RUN DOES NOT AUTHORIZE'; then ok "$1 · the run COMPLETED"; \
               else bad "$1 · the run did not complete" "the instrument died before its last section"; fi; }

echo "── W4-2.2a · the instrument, against drift ───────────────────────"

# ══ LEDGER ════════════════════════════════════════════════════════════
A=$(run_case seal_witness_a "CREATE TABLE ask_threads (id uuid PRIMARY KEY, anchor jsonb NOT NULL, reading_identity jsonb);")
ran   "L1 ledger ABSENT" "$A"
expect "L1 ledger ABSENT → reported ABSENT" "schema_migrations ABSENT" "$A"

B=$(run_case seal_witness_b "CREATE TABLE schema_migrations (version text PRIMARY KEY); INSERT INTO schema_migrations VALUES ('001'); CREATE TABLE ask_threads (id uuid PRIMARY KEY, anchor jsonb NOT NULL, reading_identity jsonb);")
ran   "L2 LEGACY ledger (version, no filename)" "$B"
expect "L2 legacy → reported LEGACY, not absent and not an error" "NO \`filename\` column" "$B"
expect_not "L2 ⛔ a legacy ledger is never reported as ABSENT" "schema_migrations ABSENT" "$B"

C=$(run_case seal_witness_c "CREATE TABLE schema_migrations (filename text PRIMARY KEY); INSERT INTO schema_migrations VALUES ('20260914000005_editorial_ontology.sql'); CREATE TABLE ask_threads (id uuid PRIMARY KEY, anchor jsonb NOT NULL, reading_identity jsonb);")
ran   "L3 MODERN ledger" "$C"
expect "L3 modern → exact rows, the applied one named" "applied" "$C"
expect "L3 modern → and the unapplied ones named" "ABSENT FROM LEDGER" "$C"

# ══ ANCHOR NULLABILITY ════════════════════════════════════════════════
# ⭐ The defect this seal exists for: it reported these two BACKWARDS.
D=$(run_case seal_witness_d "CREATE TABLE ask_threads (id uuid PRIMARY KEY, anchor jsonb NOT NULL, reading_identity jsonb);")
expect "N1 anchor NOT NULL → true" "ask_threads.anchor IS NOT NULL               | true" "$D"

E=$(run_case seal_witness_e "CREATE TABLE ask_threads (id uuid PRIMARY KEY, anchor jsonb, reading_identity jsonb);")
expect "N2 anchor NULLABLE → false" "ask_threads.anchor IS NOT NULL               | false" "$E"

F=$(run_case seal_witness_f "CREATE TABLE ask_threads (id uuid PRIMARY KEY, reading_identity jsonb);")
expect "N3 anchor COLUMN ABSENT → says so" "COLUMN ABSENT" "$F"
ran    "N3 and the run still completed" "$F"

# ══ W5 SUBSTRATE ══════════════════════════════════════════════════════
G=$(run_case seal_witness_g "CREATE TABLE ask_threads (id uuid PRIMARY KEY, anchor jsonb NOT NULL, reading_identity jsonb);")
ran    "W1 W5 ABSENT" "$G"
expect "W1 W5 ABSENT → NOT MEASURABLE" "W5 substrate ABSENT" "$G"
# ⚠️ THE C21 CLASS, THIRD TIME THIS SESSION. This banned the word
# `xor_violations`, which appears in the ⛔ ECHO LINE that DECLARES the count is
# not measurable — a prohibition firing on the text that documents it.
# ⭐ What was meant is "no MEASURED value", so the ban is on the psql RESULT
# TABLE header, which can only appear when the query actually ran.
expect_not "W1 ⛔ and NEVER a measured value" "xor_violations | editorial_reading_collisions" "$G"

# ⭐ PARTIAL: the column exists, the directions table does not. No migration
#    produces this state — which is exactly why it has to be constructed.
H=$(run_case seal_witness_h "CREATE TABLE ask_threads (id uuid PRIMARY KEY, anchor jsonb NOT NULL, reading_identity jsonb, proposal_chain_id uuid);")
ran    "W2 W5 PARTIAL" "$H"
expect "W2 PARTIAL → named as PARTIAL" "W5 substrate PARTIAL" "$H"
expect_not "W2 ⛔ PARTIAL never measures" "xor_violations | editorial_reading_collisions" "$H"

I=$(run_case seal_witness_i "CREATE TABLE ask_threads (id uuid PRIMARY KEY, anchor jsonb NOT NULL, reading_identity jsonb, proposal_chain_id uuid); CREATE TABLE proposal_chains (id uuid PRIMARY KEY); CREATE TABLE proposal_chain_directions (id uuid PRIMARY KEY);")
ran    "W3 W5 COMPLETE" "$I"
expect "W3 COMPLETE → a real result table, not an echo" "xor_violations | editorial_reading_collisions" "$I"
expect "W3 COMPLETE → says so" "W5 substrate COMPLETE" "$I"

# ⛔ ask_threads itself absent — the instrument must not die counting it.
J=$(run_case seal_witness_j "CREATE TABLE unrelated (id int);")
ran    "W4 ask_threads ABSENT" "$J"
expect "W4 ask_threads absent → total NOT MEASURABLE" "ask_threads itself is ABSENT" "$J"

# ══ THE READ-ONLY MEMBRANE ════════════════════════════════════════════
W=$(psql -h "$PGH" -p "$PGP" -U "$PGU" -d seal_witness_i -X -q \
      -c "BEGIN READ ONLY; INSERT INTO proposal_chains VALUES (gen_random_uuid());" 2>&1)
expect "R1 READ ONLY refuses INSERT" "read-only transaction" "$W"
X=$(psql -h "$PGH" -p "$PGP" -U "$PGU" -d seal_witness_i -X -q \
      -c "BEGIN READ ONLY; ALTER TABLE ask_threads ALTER COLUMN anchor DROP NOT NULL;" 2>&1)
expect "R2 READ ONLY refuses DDL" "read-only transaction" "$X"
expect "R3 the instrument declares its own read-only state" "read_only" "$I"

for d in a b c d e f g h i j; do
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d postgres -X -q -c "DROP DATABASE IF EXISTS seal_witness_$d;" >/dev/null 2>&1
done

echo ""
echo "  $pass passed · $fail failed"
[ "$fail" -eq 0 ]
