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

# SHA256 hash (modern standard)
hash_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

# MD5 hash (for legacy checksum upgrade)
hash_file_md5() {
  if command -v md5sum >/dev/null 2>&1; then
    md5sum "$1" | awk '{print $1}'
  elif command -v md5 >/dev/null 2>&1; then
    md5 -q "$1"
  else
    openssl md5 "$1" | awk '{print $2}'
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
  echo "\\if :got_lock"
  echo "  \\echo '✅ Lock acquired.'"
  echo "\\else"
  echo "  \\echo '❌ Another migration run is in progress (lock not acquired).'"
  echo "  \\quit 2"
  echo "\\endif"
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
  md5sum="$(hash_file_md5 "$f")"

  # escape single quotes
  base_esc="${base//\'/\'\'}"
  sum_esc="${sum//\'/\'\'}"
  md5sum_esc="${md5sum//\'/\'\'}"
  abs_esc="${abs//\'/\'\'}"

  {
    echo '\echo'
    echo "\\echo '— ${base_esc}'"
    echo "\\set filename '${base_esc}'"
    echo "\\set checksum '${sum_esc}'"
    echo "\\set md5sum '${md5sum_esc}'"

    # Compute boolean flags in SQL (psql \if only understands t/f, not comparisons)
    # not_applied: migration not in schema_migrations
    # no_checksum: applied but checksum is NULL or empty
    # sha_match: applied and checksum matches current SHA256
    # md5_match: applied and checksum matches current MD5 (legacy)
    cat << 'PSQL_BOOL_QUERY'
SELECT
  (NOT EXISTS (SELECT 1 FROM schema_migrations WHERE filename = :'filename')) AS not_applied,
  COALESCE((SELECT checksum IS NULL OR checksum = '' FROM schema_migrations WHERE filename = :'filename'), false) AS no_checksum,
  COALESCE((SELECT checksum = :'checksum' FROM schema_migrations WHERE filename = :'filename'), false) AS sha_match,
  COALESCE((SELECT checksum = :'md5sum' FROM schema_migrations WHERE filename = :'filename'), false) AS md5_match;
\gset
PSQL_BOOL_QUERY

    echo "\\if :not_applied"
    echo "  \\echo '➡️  Applying...'"
    echo "  \\i '${abs_esc}'"
    echo "  INSERT INTO schema_migrations(filename, checksum) VALUES (:'filename', :'checksum');"
    echo "  \\echo '✅ Applied'"
    echo "\\elif :no_checksum"
    echo "  \\echo '↪︎ Skipping (already applied, no checksum stored)'"
    echo "\\elif :sha_match"
    echo "  \\echo '↪︎ Skipping (already applied)'"
    echo "\\elif :md5_match"
    echo "  UPDATE schema_migrations SET checksum = :'checksum' WHERE filename = :'filename';"
    echo "  \\echo '↪︎ Skipping (already applied; checksum upgraded MD5→SHA256)'"
    echo "\\else"
    echo "  SELECT checksum AS mismatch_checksum FROM schema_migrations WHERE filename = :'filename'; \\gset"
    echo "  \\echo '❌ Migration file changed after it was applied: ' :'filename'"
    echo "  \\echo '   applied checksum: ' :'mismatch_checksum'"
    echo "  \\echo '   current checksum: ' :'checksum'"
    echo "  SELECT 1/0; -- Force error to stop migration"
    echo "\\endif"
  } >> "$tmp"
done

# Post-migration invariant checks
{
  echo '\echo'
  echo '\echo 🧪 Post-migration invariants...'

  # Invariant: episode_links must be a VIEW (canonical state)
  # Compute boolean: is_view = true if episode_links exists and is a view ('v')
  cat << 'PSQL_INVARIANT'
SELECT
  COALESCE((SELECT relkind = 'v' FROM pg_class WHERE relname = 'episode_links'), false) AS is_view,
  COALESCE((SELECT relkind::text FROM pg_class WHERE relname = 'episode_links'), 'missing') AS el_kind;
\gset
PSQL_INVARIANT

  echo "\\if :is_view"
  echo "  \\echo '✅ episode_links is a VIEW (canonical state)'"
  echo "\\else"
  echo "  \\echo '❌ Invariant failed: episode_links must be a VIEW (relkind=v). Got: ' :'el_kind'"
  echo "  SELECT 1/0; -- Force error to stop migration"
  echo "\\endif"
} >> "$tmp"

# Unlock at the end
{
  echo '\echo'
  echo '\echo 🔓 Releasing migration lock...'
  echo "SELECT pg_advisory_unlock(${LOCK_ID});"
  echo '\echo'
  echo '\echo ✅ All migrations applied + invariants verified'
} >> "$tmp"

psql "$DATABASE_URL" -f "$tmp"
