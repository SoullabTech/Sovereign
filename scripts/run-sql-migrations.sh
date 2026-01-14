#!/bin/sh
# SQL Migration Runner for MAIA Production
# Called by: docker compose --profile migrate run --rm migrate
#
# Only runs migrations not yet recorded in schema_migrations table.
# Records each successful migration to prevent re-runs.

set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"

echo "=== SQL migrations ==="

# Ensure schema_migrations table exists
psql "$DATABASE_URL" -X -q -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);"

# Get list of already-applied migrations into temp file (safer matching)
applied_tmp="$(mktemp)"
trap "rm -f '$applied_tmp'" EXIT
psql "$DATABASE_URL" -X -t -A -c "SELECT filename FROM schema_migrations;" > "$applied_tmp"

# Count state before running
applied_before=$(wc -l < "$applied_tmp" | tr -d ' ')
applied_now=0

for f in /app/database/migrations/*.sql; do
  [ -e "$f" ] || continue  # handles empty-glob case

  filename=$(basename "$f")

  # Skip if already applied (fixed-string exact match)
  if grep -Fxq "$filename" "$applied_tmp"; then
    continue
  fi

  echo "→ $filename"

  # Run migration with error stop
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$f"

  # Record successful application (using psql variables to avoid injection)
  psql "$DATABASE_URL" -X -q -v fname="$filename" -c \
    "INSERT INTO schema_migrations (filename) VALUES (:'fname');"

  applied_now=$((applied_now + 1))
done

# Count total migrations
total=$(ls -1 /app/database/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ')

if [ "$applied_now" -eq 0 ]; then
  echo "=== No pending migrations (${applied_before} already applied) ==="
else
  echo "=== Applied ${applied_now} new migrations (${applied_before} were already applied) ==="
fi
