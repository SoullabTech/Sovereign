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

# Get list of already-applied migrations
applied=$(psql "$DATABASE_URL" -X -t -A -c "SELECT filename FROM schema_migrations;")

pending=0
applied_count=0

for f in /app/database/migrations/*.sql; do
  [ -e "$f" ] || continue  # handles empty-glob case

  filename=$(basename "$f")

  # Skip if already applied
  if echo "$applied" | grep -qx "$filename"; then
    continue
  fi

  echo "→ $filename"

  # Run migration with transaction + error stop
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$f"

  # Record successful application
  psql "$DATABASE_URL" -X -q -c "INSERT INTO schema_migrations (filename) VALUES ('$filename');"

  applied_count=$((applied_count + 1))
done

# Count total migrations
total=$(ls -1 /app/database/migrations/*.sql 2>/dev/null | wc -l)
already=$((total - applied_count))

if [ "$applied_count" -eq 0 ]; then
  echo "=== No pending migrations (${already} already applied) ==="
else
  echo "=== Applied ${applied_count} migrations (${already} were already applied) ==="
fi
