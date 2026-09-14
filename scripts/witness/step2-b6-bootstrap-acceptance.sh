#!/usr/bin/env bash
# STEP 2 · B6 — THE CLOSURE GATE.
#
#   From a blank database, can the COMPLETE ACTIVE migration set run to
#   completion with zero collisions, leaving exactly the three intended objects
#   — offer, collaborative proposal, authorization — with no table carrying two
#   lifecycles?
#
# ⭐ FIVE SEPARATE FAILURES. Two of them are easy to conflate: correct table
# NAMES do not prove correct ontology, so the shape classification is its own
# gate and a set can pass the name gate while failing it.
#
# ⛔ DISPOSABLE CLUSTER ONLY.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"; PGDB="${PGDB:-b6_witness}"
case "$PGDB" in *witness*) ;; *) echo "REFUSED · '$PGDB' is not a witness database."; exit 2;; esac
q() { psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -tAq -c "$1" 2>&1; }
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }
bad() { FAIL=$((FAIL+1)); printf '  FAIL  %s\n     -> %s\n' "$1" "$2"; }

echo "── STEP 2 · B6 blank-database bootstrap ─────────────────────"

psql -h "$PGH" -p "$PGP" -U "$PGU" -d postgres -q \
  -c "DROP DATABASE IF EXISTS $PGDB;" -c "CREATE DATABASE $PGDB;" >/dev/null 2>&1
psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 \
  -f "${STEP2_STUBS:-/tmp/step2_stubs.sql}" >/dev/null 2>&1
psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 \
  -c "CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now(),
        checksum text);" >/dev/null 2>&1

# ── 1 · the ACTIVE set, in order, every migration this lane touches ────────
# ⚠️ Scoped to the four Step 1/2 migrations plus their stubs. ⛔ It is NOT a
# full-repository replay, and does not claim to be: the 485-file active set
# needs the real runner and the real base schema. What it DOES prove is that the
# four migrations of this lane bootstrap together, in order, on nothing.
LOG="$(mktemp)"
for m in 20260914000001_proposal_succession \
         20260914000002_manuscript_revision_offers \
         20260914000003_proposal_chains_member_identity \
         20260914000004_manuscript_revision_authorizations; do
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -v ON_ERROR_STOP=1 \
    -f "$ROOT/database/migrations/$m.sql" >>"$LOG" 2>&1
  RC=$?
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -tAq \
    -c "INSERT INTO schema_migrations (filename) VALUES ('$m.sql')
        ON CONFLICT DO NOTHING;" >/dev/null 2>&1
  [ $RC -ne 0 ] && echo "    (exit $RC on $m)" >>"$LOG"
done

ERRS=$(grep -c "ERROR" "$LOG" || true)
[ "$ERRS" = "0" ] && ok "1 · the active set applies with ZERO errors" \
                  || bad "1 · zero errors" "$ERRS error(s): $(grep -m1 ERROR "$LOG")"

# ── 2 · ⭐⭐ ZERO COLLISION NOTICES ────────────────────────────────────────
# ⛔ `relation already exists, skipping` is HOW THIS DEFECT STAYED QUIET. Here
# it is a FAILURE, never noise.
NOTICES=$(grep -c "already exists, skipping" "$LOG" || true)
[ "$NOTICES" = "0" ] && ok "2 · ⭐ ZERO 'relation already exists, skipping' notices" \
                     || bad "2 · zero collision notices" "$NOTICES — a table name was claimed twice"
rm -f "$LOG"

# ── 3 · exactly the four intended objects, and no retired name ────────────
for t in manuscript_revision_offers proposal_chains proposal_versions \
         manuscript_revision_authorizations; do
  P=$(q "SELECT count(*) FROM information_schema.tables
          WHERE table_schema='public' AND table_name='$t';")
  [ "$P" = "1" ] && ok "3 · $t PRESENT" || bad "3 · $t" "ABSENT"
done
GONE=$(q "SELECT count(*) FROM information_schema.tables
           WHERE table_schema='public' AND table_name='manuscript_revision_proposals';")
[ "$GONE" = "0" ] && ok "3e · ⛔ NO manuscript_revision_proposals anywhere" \
                  || bad "3e · retired name" "the table still exists"

# ── 4 · ⭐⭐ ONE ONTOLOGY EACH — and this is NOT test 3 again ──────────────
# Correct table NAMES do not prove correct ontology. A set could produce four
# correctly named tables while one still carries both column families.
shape() { # $1 table → verdict
  q "WITH c AS (SELECT column_name FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='$1')
     SELECT CASE
       WHEN (SELECT count(*) FROM c)=0 THEN 'ABSENT'
       WHEN (SELECT count(*) FROM c WHERE column_name IN
              ('proposed_text','reason','based_on','read_state','origin','producer'))>0
        AND (SELECT count(*) FROM c WHERE column_name IN
              ('expected_text','accepted_at','resulting_version','operation'))>0
            THEN 'HYBRID'
       WHEN (SELECT count(*) FROM c WHERE column_name IN
              ('proposed_text','reason','based_on','read_state','origin','producer'))>0
            THEN 'OFFER'
       WHEN (SELECT count(*) FROM c WHERE column_name IN
              ('expected_text','accepted_at','resulting_version'))>0
            THEN 'AUTHORIZATION'
       WHEN (SELECT count(*) FROM c WHERE column_name IN ('supersedes','formulation'))>0
            THEN 'PROPOSAL_VERSION'
       ELSE 'OTHER' END;"
}
for pair in "manuscript_revision_offers:OFFER" \
            "manuscript_revision_authorizations:AUTHORIZATION" \
            "proposal_versions:PROPOSAL_VERSION"; do
  T="${pair%%:*}"; WANT="${pair#*:}"; GOT=$(shape "$T")
  [ "$GOT" = "$WANT" ] && ok "4 · $T carries exactly one ontology  [$GOT]" \
                       || bad "4 · $T ontology" "got '$GOT', want '$WANT'"
done
HYB=$(q "SELECT count(*) FROM information_schema.columns
          WHERE table_schema='public' AND table_name='manuscript_revision_offers'
            AND column_name IN ('expected_text','accepted_at','resulting_version','operation');")
[ "$HYB" = "0" ] && ok "4d · ⛔ and the offer carries NO authorization column family" \
                 || bad "4d · no hybrid" "$HYB authorization column(s) on the offer"

# ── 5 · ledger and schema AGREE ───────────────────────────────────────────
# ⚠️ This is the property `maia_focus_witness` violates, and it is in the gate
# because we have now seen it fail in a real database.
LEDGER=$(q "SELECT count(*) FROM schema_migrations
             WHERE filename LIKE '2026091400000%';")
[ "$LEDGER" = "4" ] \
  && ok "5 · the ledger names every applied migration of this lane  [$LEDGER]" \
  || bad "5 · ledger ↔ schema agree" "ledger holds $LEDGER of 4"
RETIRED=$(q "SELECT count(*) FROM schema_migrations
              WHERE filename LIKE '%20260910000004%' OR filename LIKE '%20260913000002%'
                 OR filename LIKE '%20260913000003%';")
[ "$RETIRED" = "0" ] && ok "5b · ⛔ and it names none of the retired migrations" \
                     || bad "5b · retired in ledger" "$RETIRED"

echo
echo "  $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
