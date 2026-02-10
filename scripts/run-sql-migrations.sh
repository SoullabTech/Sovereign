#!/bin/sh
# SQL Migration Runner for MAIA Production
# Called by: docker compose --profile migrate run --rm migrate
#
# Only runs migrations not yet recorded in schema_migrations table.
# Records each successful migration to prevent re-runs.
#
# ROBUST: Works regardless of how schema_migrations was originally created.
# Uses filename as the canonical identifier.

set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"

echo "=== SQL migrations ==="

# Ensure schema_migrations table exists with filename as primary identifier
# This is idempotent - won't fail if table already exists with different schema
psql "$DATABASE_URL" -X -q -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);"

# Add checksum column if missing (for future compatibility)
psql "$DATABASE_URL" -X -q -c "
ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum TEXT;" 2>/dev/null || true

# Handle legacy tables that have 'version' as PK instead of 'filename'
# Migrate any version-only rows to have filename
psql "$DATABASE_URL" -X -q -c "
DO \$\$
BEGIN
  -- Check if 'version' column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schema_migrations' AND column_name = 'version'
  ) THEN
    -- Add filename column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'schema_migrations' AND column_name = 'filename'
    ) THEN
      ALTER TABLE schema_migrations ADD COLUMN filename TEXT;
    END IF;

    -- Update any rows where filename is NULL but version exists
    -- Try to find matching file by version prefix
    UPDATE schema_migrations SET filename = version || '.sql'
    WHERE filename IS NULL AND version IS NOT NULL;
  END IF;
END \$\$;" 2>/dev/null || true

# Get list of already-applied migrations
applied_tmp="$(mktemp)"
trap "rm -f '$applied_tmp'" EXIT

# Query only the filename column (guaranteed to exist after our setup)
psql "$DATABASE_URL" -X -t -A -c "
SELECT filename FROM schema_migrations WHERE filename IS NOT NULL;" > "$applied_tmp" 2>/dev/null || true

# Count state before running
applied_before=$(wc -l < "$applied_tmp" | tr -d ' ')
applied_now=0

for f in /app/database/migrations/*.sql; do
  [ -e "$f" ] || continue  # handles empty-glob case

  filename=$(basename "$f")

  # Skip if already applied
  if grep -Fxq "$filename" "$applied_tmp"; then
    continue
  fi

  echo "→ $filename"

  # Run migration with error stop, wrapped in transaction
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c "BEGIN;" -f "$f" -c "COMMIT;" || {
    echo "❌ Migration failed: $filename"
    psql "$DATABASE_URL" -X -q -c "ROLLBACK;" 2>/dev/null || true
    exit 1
  }

  # Record successful application
  psql "$DATABASE_URL" -X -q -c "
INSERT INTO schema_migrations (filename) VALUES ('$filename')
ON CONFLICT (filename) DO NOTHING;"

  applied_now=$((applied_now + 1))
done

# Count total migrations
total=$(ls -1 /app/database/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ')

if [ "$applied_now" -eq 0 ]; then
  echo "=== No pending migrations ($applied_before already applied, $total total) ==="
else
  echo "=== Applied $applied_now new migrations ($applied_before were already applied, $total total) ==="
fi
