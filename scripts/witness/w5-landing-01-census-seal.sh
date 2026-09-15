#!/usr/bin/env bash
# W5-LANDING-01 · CENSUS INSTRUMENT SEAL.
#
# ⭐⭐ The census exists to find drift, so it is falsified against DELIBERATE
# drift — in BOTH directions — and against a partial migration, a state no
# migration produces and which therefore has to be constructed.
#
# ⛔ DISPOSABLE DATABASES ONLY, all named `*witness*` and dropped on the way in.
# ⛔ It takes a local cluster, never a DSN: it cannot reach the protected host.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SQL="$ROOT/scripts/witness/w5-landing-01-lane-census.sql"
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"
[ -f "$SQL" ] || { echo "REFUSED · census not found: $SQL"; exit 2; }

pass=0; fail=0
ok()  { pass=$((pass+1)); echo "  PASS  $1"; }
bad() { fail=$((fail+1)); echo "  FAIL  $1"; echo "     -> $2"; }
expect()     { if echo "$3" | grep -qF -- "$2"; then ok "$1"; else bad "$1" "expected: $2"; fi; }
expect_not() { if echo "$3" | grep -qF -- "$2"; then bad "$1" "must NOT contain: $2"; else ok "$1"; fi; }
# ⚠️ ROW-SCOPED, AND THE DISTINCTION COST TWO FAILURES. Banning a word across
# the WHOLE output fails whenever ANOTHER migration legitimately has that state:
# in a run where 000001 is PARTIAL, 000002-000005 are correctly PENDING. The
# obligation was always about ONE ROW.
row_is()     { local r; r=$(echo "$4" | grep -F -- "$2" | tail -1)
               if echo "$r" | grep -qF -- "$3"; then ok "$1"; else bad "$1" "row [$r] lacks: $3"; fi; }
row_is_not() { local r; r=$(echo "$4" | grep -F -- "$2" | tail -1)
               if echo "$r" | grep -qF -- "$3"; then bad "$1" "row [$r] must not say: $3"; else ok "$1"; fi; }
ran()        { if echo "$2" | grep -q 'WHAT THIS RUN DOES NOT AUTHORIZE'; then ok "$1 · run COMPLETED"; \
               else bad "$1 · run did not complete" "died before its last section"; fi; }

run_case() {
  local db="$1"; shift
  case "$db" in *witness*) ;; *) echo "REFUSED · '$db' is not a witness database."; exit 2;; esac
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d postgres -X -q \
    -c "DROP DATABASE IF EXISTS $db;" -c "CREATE DATABASE $db;" >/dev/null 2>&1
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$db" -X -q -c "$1" >/dev/null 2>&1
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$db" -X -f "$SQL" 2>&1
}

echo "── W5-LANDING-01 · the census, against drift ─────────────────────"

# ⭐⭐ THE DUPLICATION GUARD. The read-only membrane forbids a temp view, so the
# object list appears twice in the census. If the copies drift, the detail and
# the rollup describe different databases — and nothing else would notice.
COPIES=$(awk '/^WITH lane_objects\(migration, kind, name, col\) AS \(VALUES$/{f=1;n++;next} f&&/^\),$/{f=0;print "---COPY"n"---";next} f' "$SQL")
C1=$(echo "$COPIES" | sed -n '1,/---COPY1---/p' | grep -v -- '---COPY')
C2=$(echo "$COPIES" | sed -n '/---COPY1---/,/---COPY2---/p' | grep -v -- '---COPY')
if [ -n "$C1" ] && [ "$C1" = "$C2" ]; then
  ok "D1 ⭐ the two object-list copies are BYTE-IDENTICAL ($(echo "$C1" | grep -c "('0000") objects)"
else
  bad "D1 the two object-list copies DIFFER" "detail and rollup would describe different databases"
fi

# ══ CATALOGUE STATES ══════════════════════════════════════════════════
A=$(run_case lane_witness_a "CREATE TABLE unrelated (id int);")
ran    "C1 nothing applied" "$A"
expect "C1 nothing applied → every migration ABSENT" "20260914000001_proposal_succession.sql                | ABSENT" "$A"
expect_not "C1 ⛔ and nothing reported PRESENT" "| PRESENT" "$A"

# ⭐ PARTIAL: the table exists, its triggers and indexes do not. No migration
#    produces this — which is why it must be constructed.
B=$(run_case lane_witness_b "CREATE TABLE proposal_chains (id uuid PRIMARY KEY); CREATE TABLE proposal_versions (id uuid PRIMARY KEY);")
ran    "C2 half of 000001 applied" "$B"
expect "C2 → PARTIAL, not PRESENT and not ABSENT" "PARTIAL" "$B"
# ⚠️ AND THE ROW TO ASSERT DEPENDS ON WHICH SECTIONS RAN. Case B has NO ledger,
# so §5 prints no pending-set row at all and the last matching line is §4's
# rollup. Asserting "PARTIAL - ruling owed" here demanded a row that correctly
# does not exist. The derived state is asserted in case E, which has a ledger.
row_is     "C2 the 000001 rollup row says PARTIAL" "20260914000001_proposal_succession.sql" "PARTIAL" "$B"
row_is_not "C2 ⛔ and that row is never PENDING" "20260914000001_proposal_succession.sql" "PENDING" "$B"

# ══ LEDGER × CATALOGUE · the four derived states ══════════════════════
LEDGER_ALL="CREATE TABLE schema_migrations (filename text PRIMARY KEY);
 INSERT INTO schema_migrations VALUES
   ('20260914000001_proposal_succession.sql'),
   ('20260914000002_manuscript_revision_offers.sql'),
   ('20260914000003_proposal_chains_member_identity.sql'),
   ('20260914000004_manuscript_revision_authorizations.sql'),
   ('20260914000005_editorial_ontology.sql');"

D=$(run_case lane_witness_d "$LEDGER_ALL")
ran    "S1 ledger says applied, database has nothing" "$D"
expect "S1 ⭐⭐ → DRIFT (ledger claims it, database lacks it)" "DRIFT - ledger claims it, database lacks it" "$D"
expect_not "S1 ⛔ never reported as LANDED" "| LANDED" "$D"

E=$(run_case lane_witness_e "CREATE TABLE schema_migrations (filename text PRIMARY KEY); CREATE TABLE proposal_chains (id uuid PRIMARY KEY);")
ran    "S2 objects present, ledger silent" "$E"
expect "S2 → DRIFT or PARTIAL, never PENDING" "PARTIAL" "$E"
row_is_not "S2 ⛔ the PARTIAL row is never PENDING" "20260914000001_proposal_succession.sql" "PENDING" "$E"
row_is     "S2 ⭐ while a genuinely absent+unledgered migration IS PENDING" "20260914000002_manuscript_revision_offers.sql" "PENDING" "$E"
row_is     "S2 ⭐⭐ and the PARTIAL row carries its own derived state" "20260914000001_proposal_succession.sql" "PARTIAL - ruling owed" "$E"

F=$(run_case lane_witness_f "CREATE TABLE schema_migrations (filename text PRIMARY KEY);")
ran    "S3 empty modern ledger, empty database" "$F"
expect "S3 ⭐ → PENDING, the state we are here to measure" "PENDING" "$F"

# ⭐ The 2026-09-07 shape, exactly: present but unledgered.
G=$(run_case lane_witness_g "CREATE TABLE schema_migrations (filename text PRIMARY KEY); ALTER TABLE schema_migrations ADD COLUMN x int;")
ran    "S4 modern ledger present" "$G"

# ══ LEDGER SHAPES ═════════════════════════════════════════════════════
H=$(run_case lane_witness_h "CREATE TABLE schema_migrations (version text PRIMARY KEY);")
ran    "L1 LEGACY ledger (version, no filename)" "$H"
expect "L1 → reported LEGACY" "NO \`filename\` column" "$H"
expect "L1 ⭐⭐ → and NO pending set is derived from it" "NO pending set can be derived" "$H"
expect_not "L1 ⛔ a legacy ledger never yields PENDING rows" "| PENDING" "$H"

I=$(run_case lane_witness_i "CREATE TABLE unrelated (id int);")
expect "L2 absent ledger → NOT MEASURABLE, no pending set" "NO pending set can be derived" "$I"

# ══ READ-ONLY MEMBRANE ════════════════════════════════════════════════
W=$(psql -h "$PGH" -p "$PGP" -U "$PGU" -d lane_witness_f -X -q \
      -c "BEGIN READ ONLY; CREATE TABLE nope (i int);" 2>&1)
expect "R1 READ ONLY refuses DDL" "read-only transaction" "$W"
expect "R2 the census declares its own read-only state" "read_only" "$F"

for d in a b d e f g h i; do
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d postgres -X -q \
    -c "DROP DATABASE IF EXISTS lane_witness_$d;" >/dev/null 2>&1
done

echo ""
echo "  $pass passed · $fail failed"
[ "$fail" -eq 0 ]
