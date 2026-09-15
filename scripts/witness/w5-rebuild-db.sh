#!/usr/bin/env bash
# Rebuilds the disposable W5 schema witness database.
#
# ⛔ The step-2 stub file carries a MINIMAL `ask_threads` shim (id only). W5-3
# constrains the REAL table, so the shim is stripped and the real migration
# applied instead — a witness that constrained a shim would prove nothing.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"; PGDB="${PGDB:-w5_witness}"
case "$PGDB" in *witness*) ;; *) echo "REFUSED · '$PGDB' is not a witness database."; exit 2;; esac
STUBS="${STEP2_RUNTIME_STUBS:-/tmp/step2_runtime_stubs.sql}"
[ -f "$STUBS" ] || { echo "REFUSED · stubs not found: $STUBS"; exit 2; }

TMP="$(mktemp)"
grep -v '^CREATE TABLE ask_threads\|^CREATE TABLE ask_turns\|^  turn_index integer NOT NULL, speaker' "$STUBS" > "$TMP"

psql -h "$PGH" -p "$PGP" -U "$PGU" -d postgres -q \
  -c "DROP DATABASE IF EXISTS $PGDB;" -c "CREATE DATABASE $PGDB;" >/dev/null 2>&1
psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 -f "$TMP" >/dev/null || {
  echo "REFUSED · stub load failed"; rm -f "$TMP"; exit 2; }
rm -f "$TMP"

for m in 20260901000001_ask_threads \
         20260914000001_proposal_succession 20260914000002_manuscript_revision_offers \
         20260914000003_proposal_chains_member_identity \
         20260914000004_manuscript_revision_authorizations \
         20260914000005_editorial_ontology \
         20260915000001_w4_s1_thread_subject_preparation \
         20260915000002_w4_s2_validation_and_binding; do
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 \
    -f "$ROOT/database/migrations/$m.sql" >/dev/null || {
      echo "REFUSED · migration failed: $m"; exit 2; }
done
