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

tmp="$(mktemp -t maia-migrations.XXXXXX.psql)"
cleanup(){ rm -f "$tmp"; }
trap cleanup EXIT

# Build a single psql script so the advisory lock stays held
{
  echo '\set ON_ERROR_STOP on'
  echo '\echo'
  echo '\echo 🔎 DB identity:'
  echo "SELECT current_database() AS db, inet_server_addr() AS host, inet_server_port() AS port, current_user AS user;"
  echo '\echo'

  echo "\echo 🔒 Acquiring migration lock (${LOCK_ID})..."
  echo "SELECT pg_try_advisory_lock(${LOCK_ID}) AS got_lock; \\gset"
  echo "\\if :got_lock != 't'"
  echo "  \\echo '❌ Another migration run is in progress (lock not acquired).'"
  echo "  \\quit 2"
  echo "\\endif"
  echo '\echo ✅ Lock acquired.'
  echo '\echo'

  # Track applied migrations (+ checksum to detect edits)
  echo "CREATE TABLE IF NOT EXISTS schema_migrations ("
  echo "  filename text PRIMARY KEY,"
  echo "  checksum text,"
  echo "  applied_at timestamptz NOT NULL DEFAULT now()"
  echo ");"
  echo "ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum text;"
} > "$tmp"

# Append per-migration blocks
for f in "${files[@]}"; do
  abs="$(cd "$(dirname "$f")" && pwd)/$(basename "$f")"
  base="$(basename "$f")"
  sum="$(hash_file "$f")"

  # escape single quotes
  base_esc="${base//\'/\'\'}"
  sum_esc="${sum//\'/\'\'}"
  abs_esc="${abs//\'/\'\'}"

  {
    echo '\echo'
    echo "\\echo '— ${base_esc}'"
    echo "\\set filename '${base_esc}'"
    echo "\\set checksum '${sum_esc}'"

    # already applied?
    echo "SELECT count(*)::int AS already FROM schema_migrations WHERE filename = :'filename'; \\gset"
    echo "\\if :already > 0"
    echo "  SELECT COALESCE(checksum,'') AS applied_checksum FROM schema_migrations WHERE filename = :'filename'; \\gset"
    echo "  \\if :'applied_checksum' != '' AND :'applied_checksum' != :'checksum'"
    echo "    \\echo '❌ Migration file changed after it was applied: ' :filename"
    echo "    \\echo '   applied checksum: ' :'applied_checksum'"
    echo "    \\echo '   current checksum: ' :'checksum'"
    echo "    \\quit 3"
    echo "  \\endif"
    echo "  \\echo '↪︎ Skipping (already applied)'"
    echo "\\else"
    echo "  \\echo '➡️  Applying...'"
    echo "  \\i '${abs_esc}'"
    echo "  INSERT INTO schema_migrations(filename, checksum) VALUES (:'filename', :'checksum');"
    echo "  \\echo '✅ Applied'"
    echo "\\endif"
  } >> "$tmp"
done

# Unlock at the end
{
  echo '\echo'
  echo '\echo 🔓 Releasing migration lock...'
  echo "SELECT pg_advisory_unlock(${LOCK_ID});"
  echo '\echo ✅ All migrations applied'
} >> "$tmp"

psql "$DATABASE_URL" -f "$tmp"
