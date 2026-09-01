#!/usr/bin/env bash
# Apply the canonical schema baseline to an EMPTY database, then seed the
# migration ledger so scripts/apply-migrations.sh treats the baselined
# migrations as already applied.
#
# Canonical bootstrap sequence for a blank PostgreSQL database:
#   scripts/bootstrap-database.sh && npm run db:migrate
#
# Refuses to run against a database that already has application tables.
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must be set}"

BASELINE="${BASELINE:-database/baseline/0001_baseline_2026-09-01.sql}"
MANIFEST="${MANIFEST:-database/baseline/0001_baseline_2026-09-01.manifest}"

[ -f "$BASELINE" ] || { echo "❌ baseline not found: $BASELINE"; exit 1; }
[ -f "$MANIFEST" ] || { echo "❌ manifest not found: $MANIFEST"; exit 1; }

existing="$(psql "$DATABASE_URL" -tAc \
  "select count(*) from pg_tables where schemaname='public'")"
if [ "$existing" != "0" ]; then
  echo "❌ Refusing to baseline: database already has $existing public table(s)."
  echo "   The baseline is for empty databases only. Use npm run db:migrate."
  exit 1
fi

echo "📦 Applying canonical baseline: $BASELINE"
psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 -f "$BASELINE"

echo "🧾 Seeding migration ledger from $MANIFEST"
psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename text PRIMARY KEY,
  checksum text,
  applied_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum text;
SQL

# The manifest is "sha256<two spaces>filename", fixed at capture time.
# Built as one statement rather than one psql invocation per row.
{
  echo "INSERT INTO schema_migrations (filename, checksum) VALUES"
  awk 'NF==2 {printf "%s(%c%s%c,%c%s%c)", sep, 39, $2, 39, 39, $1, 39; sep=","} END {print ""}' "$MANIFEST"
  echo "ON CONFLICT (filename) DO NOTHING;"
} | psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1

seeded="$(psql "$DATABASE_URL" -tAc 'select count(*) from schema_migrations')"
tables="$(psql "$DATABASE_URL" -tAc "select count(*) from pg_tables where schemaname='public'")"
echo "✅ Baseline applied: $tables table(s), $seeded ledger row(s)."
echo "   Next: npm run db:migrate"
