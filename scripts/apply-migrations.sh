#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must be set (e.g. postgres://user:pass@host:5432/db)}"

MIG_DIR="${MIG_DIR:-database/migrations}"
LOCK_ID="${MAIA_MIGRATION_LOCK_ID:-724001}"

# Safety rails (tune via env vars per environment)
LOCK_TIMEOUT="${MAIA_MIGRATION_LOCK_TIMEOUT:-5s}"
STATEMENT_TIMEOUT="${MAIA_MIGRATION_STATEMENT_TIMEOUT:-2min}"
IDLE_TIMEOUT="${MAIA_MIGRATION_IDLE_TIMEOUT:-30s}"

export PGOPTIONS="${PGOPTIONS:-} -c lock_timeout=${LOCK_TIMEOUT} -c statement_timeout=${STATEMENT_TIMEOUT} -c idle_in_transaction_session_timeout=${IDLE_TIMEOUT} -c application_name=maia_migrations"

shopt -s nullglob
files=("$MIG_DIR"/*.sql)
if ((${#files[@]} == 0)); then
  echo "ℹ️  No migrations found in $MIG_DIR"
  exit 0
fi

hash_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

echo ""
echo "🔎 DB identity:"
psql "$DATABASE_URL" -tA -c "SELECT 'db=' || current_database() || ' host=' || COALESCE(inet_server_addr()::text, 'local') || ' port=' || inet_server_port() || ' user=' || current_user;"
echo ""

# Try to acquire advisory lock
echo "🔒 Acquiring migration lock (${LOCK_ID})..."
got_lock=$(psql "$DATABASE_URL" -tA -c "SELECT pg_try_advisory_lock(${LOCK_ID})::text;")
if [[ "$got_lock" != "true" ]]; then
  echo "❌ Another migration run is in progress (lock not acquired)."
  exit 2
fi
echo "✅ Lock acquired."
echo ""

# Ensure cleanup releases lock
cleanup() {
  psql "$DATABASE_URL" -tA -c "SELECT pg_advisory_unlock(${LOCK_ID});" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Ensure schema_migrations table exists
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename text PRIMARY KEY,
  checksum text,
  applied_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum text;
SQL

# Apply each migration
for f in "${files[@]}"; do
  base="$(basename "$f")"
  sum="$(hash_file "$f")"

  echo "— $base"

  # Check if already applied
  already=$(psql "$DATABASE_URL" -tA -c "SELECT 1 FROM schema_migrations WHERE filename = '$base' LIMIT 1;")

  if [[ "$already" == "1" ]]; then
    # Check checksum
    applied_checksum=$(psql "$DATABASE_URL" -tA -c "SELECT COALESCE(checksum, '') FROM schema_migrations WHERE filename = '$base';")
    if [[ -n "$applied_checksum" && "$applied_checksum" != "$sum" ]]; then
      echo "❌ Migration file changed after it was applied: $base"
      echo "   applied checksum: $applied_checksum"
      echo "   current checksum: $sum"
      exit 3
    fi
    echo "↪︎ Skipping (already applied)"
  else
    echo "➡️  Applying..."
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
    psql "$DATABASE_URL" -c "INSERT INTO schema_migrations(filename, checksum) VALUES ('$base', '$sum');"
    echo "✅ Applied"
  fi
  echo ""
done

echo "🔓 Releasing migration lock..."
# Lock released by trap
echo "✅ All migrations applied"
