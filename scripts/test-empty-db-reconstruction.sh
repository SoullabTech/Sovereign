#!/usr/bin/env bash
set -euo pipefail

# Empty-database reconstruction test.
#
# The falsifier for DB-EMPTY-BOOTSTRAP-01. It asserts the one property the
# repository did not have:
#
#   a completely empty PostgreSQL database can be turned into the MAIA schema
#   from the repository alone
#
# Nothing may be copied from a live database to make this pass. It runs the
# canonical bootstrap — database/init/ extensions, then scripts/apply-migrations.sh
# — and then holds the result to the application's own schema gate.
#
# Usage:
#   DATABASE_URL=postgres://user@host:5432/some_disposable_db \
#     scripts/test-empty-db-reconstruction.sh
#
# The target database is written to and must be disposable. The script refuses
# to touch a database that already has a schema.

: "${DATABASE_URL:?DATABASE_URL must point at an empty, disposable database}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail() { echo "❌ $*" >&2; exit 1; }

echo "🔎 Target:"
psql "$DATABASE_URL" -c \
  "SELECT current_database() AS db, inet_server_addr() AS host, current_user AS user;" \
  || fail "cannot connect to \$DATABASE_URL"

# ---- Guard: the target must be empty -------------------------------------
relations="$(psql "$DATABASE_URL" -tAc \
  "SELECT count(*) FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r','p','v','m');")"
if [[ "$relations" -ne 0 ]]; then
  fail "target database is not empty ($relations relations in public).
   This test writes to its target. Point it at a disposable database."
fi
echo "✅ Target is empty."
echo

# ---- Canonical bootstrap -------------------------------------------------
# Mirrors production: database/init/ runs via docker-entrypoint-initdb.d on
# first start, then the migration runner.
echo "🧱 Applying database/init/ ..."
shopt -s nullglob
for f in database/init/*.sql; do
  echo "   — $(basename "$f")"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$f" || fail "init failed: $f"
done
echo

echo "🚚 Running canonical migration runner ..."
if ! ./scripts/apply-migrations.sh; then
  fail "scripts/apply-migrations.sh failed against an empty database.
   This is the DB-EMPTY-BOOTSTRAP-01 defect. See the run output above for the
   first migration that could not be applied."
fi
echo

# ---- Assert the whole tree is recorded -----------------------------------
echo "🧪 Verifying every migration on disk is recorded ..."
missing=0
for f in database/migrations/*.sql; do
  base="$(basename "$f")"
  base_esc="${base//\'/\'\'}"
  got="$(psql "$DATABASE_URL" -tAc \
    "SELECT 1 FROM schema_migrations WHERE filename = '${base_esc}' LIMIT 1;")"
  if [[ "$got" != "1" ]]; then
    echo "   ❌ not recorded: $base"
    missing=$((missing + 1))
  fi
done
[[ "$missing" -eq 0 ]] || fail "$missing migration(s) on disk were never recorded."

on_disk="$(ls -1 database/migrations/*.sql | wc -l | tr -d ' ')"
recorded="$(psql "$DATABASE_URL" -tAc "SELECT count(*) FROM schema_migrations;")"
echo "✅ $on_disk migrations on disk, $recorded recorded."
echo

# ---- Application schema gate ---------------------------------------------
echo "🚪 Running the application schema gate ..."
./scripts/ensure-migrations.sh || fail "the application schema gate rejects a
   schema reconstructed from source. runtime-required and
   constructible-from-source are still not reconciled."
echo

echo "══════════════════════════════════════════════════════════════"
echo "✅ EMPTY-DATABASE RECONSTRUCTION: PASS"
echo "   An empty database was turned into the MAIA schema from the"
echo "   repository alone, and the application schema gate accepts it."
echo "══════════════════════════════════════════════════════════════"
