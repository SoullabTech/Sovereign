#!/usr/bin/env bash
# Rebuilds the disposable ER-R1 witness database from the repository's own
# bootstrap and migration runner.
#
# ⛔ DISPOSABLE ONLY. The database name must contain `witness`, and this takes a
# LOCAL CLUSTER, never a DSN — it cannot reach the protected host.
set -eu
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
PGH="${PGH:-/tmp}"; PGP="${PGP:-5603}"; PGU="${PGU:-postgres}"; PGDB="${PGDB:-er_r1_witness}"
case "$PGDB" in *witness*) ;; *) echo "REFUSED · '$PGDB' is not a witness database."; exit 2;; esac
psql -h "$PGH" -p "$PGP" -U "$PGU" -d postgres -X -q \
  -c "DROP DATABASE IF EXISTS $PGDB;" -c "CREATE DATABASE $PGDB;" >/dev/null 2>&1
U="postgresql://$PGU@/$PGDB?host=$PGH&port=$PGP"
DATABASE_URL="$U" bash scripts/bootstrap-database.sh >/dev/null 2>&1
DATABASE_URL="$U" bash scripts/apply-migrations.sh   >/dev/null 2>&1
echo "rebuilt $PGDB"
echo "  DATABASE_URL=\"$U\" npx tsx scripts/witness/er-r1-member-act-witness.ts"
