#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must be set (e.g. postgres://user:pass@host:5432/db)}"

# Safety rails
export PGOPTIONS="-c lock_timeout=5s -c statement_timeout=2min -c idle_in_transaction_session_timeout=30s"

echo "🔒 Acquiring migration lock..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT pg_advisory_lock(724001); -- MAIA migrations lock (arbitrary constant)
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL

echo "🧭 Applying migrations..."
for f in $(ls -1 database/migrations/*.sql | sort); do
  already=$(psql "$DATABASE_URL" -tA -v ON_ERROR_STOP=1 -c \
    "SELECT 1 FROM schema_migrations WHERE filename = '$(basename "$f")' LIMIT 1;")
  if [[ "$already" == "1" ]]; then
    echo "↪︎ Skipping $(basename "$f") (already applied)"
    continue
  fi

  echo "➡️  Applying $(basename "$f")"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"

  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c \
    "INSERT INTO schema_migrations(filename) VALUES ('$(basename "$f")');"
done

echo "🔓 Releasing migration lock..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT pg_advisory_unlock(724001);
SQL

echo "✅ All migrations applied"
