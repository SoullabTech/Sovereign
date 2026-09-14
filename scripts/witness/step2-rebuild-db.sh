#!/usr/bin/env bash
# Rebuilds the disposable runtime witness database from the active migrations.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"; PGDB="${PGDB:-runtime_witness}"
case "$PGDB" in *witness*) ;; *) echo "REFUSED · '$PGDB' is not a witness database."; exit 2;; esac
psql -h "$PGH" -p "$PGP" -U "$PGU" -d postgres -q \
  -c "DROP DATABASE IF EXISTS $PGDB;" -c "CREATE DATABASE $PGDB;" >/dev/null 2>&1
psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 \
  -f "${STEP2_RUNTIME_STUBS:-/tmp/step2_runtime_stubs.sql}" >/dev/null 2>&1
for m in 20260914000001_proposal_succession 20260914000002_manuscript_revision_offers \
         20260914000003_proposal_chains_member_identity \
         20260914000004_manuscript_revision_authorizations; do
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 \
    -f "$ROOT/database/migrations/$m.sql" >/dev/null 2>&1
done
