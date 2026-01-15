#!/bin/sh
# SQL Migration Runner for MAIA Production
# Called by: docker compose --profile migrate run --rm migrate
#
# Only runs migrations not yet recorded in schema_migrations table.
# Records each successful migration to prevent re-runs.

set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"

echo "=== SQL migrations ==="

# Ensure schema_migrations table exists (compatible with existing schema)
# The table may already exist with version as PK, so we add filename column if missing
psql "$DATABASE_URL" -X -q -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT NOW(),
  filename VARCHAR(255)
);"
psql "$DATABASE_URL" -X -q -c "
ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS filename VARCHAR(255);"

# Get list of already-applied migrations into temp file
# Check both version and filename columns for compatibility
applied_tmp="$(mktemp)"
trap "rm -f '$applied_tmp'" EXIT
psql "$DATABASE_URL" -X -t -A -c "
SELECT COALESCE(filename, version) FROM schema_migrations
WHERE filename IS NOT NULL OR version IS NOT NULL;" > "$applied_tmp"

# Also get versions (numeric prefixes) that have been applied
psql "$DATABASE_URL" -X -t -A -c "SELECT version FROM schema_migrations WHERE version IS NOT NULL;" >> "$applied_tmp"

# Count state before running
applied_before=$(wc -l < "$applied_tmp" | tr -d ' ')
applied_now=0

for f in /app/database/migrations/*.sql; do
  [ -e "$f" ] || continue  # handles empty-glob case

  filename=$(basename "$f")
  # Extract version from filename (numeric prefix before first underscore)
  version=$(echo "$filename" | sed 's/_.*$//')

  # Skip if already applied (check both filename and version)
  if grep -Fxq "$filename" "$applied_tmp" || grep -Fxq "$version" "$applied_tmp"; then
    continue
  fi

  echo "→ $filename"

  # Run migration with error stop
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$f"

  # Record successful application (insert version and filename)
  psql "$DATABASE_URL" -X -q <<EOF
INSERT INTO schema_migrations (version, filename) VALUES ('$version', '$filename')
ON CONFLICT (version) DO UPDATE SET filename = EXCLUDED.filename;
EOF

  applied_now=$((applied_now + 1))
done

# Count total migrations
total=$(ls -1 /app/database/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ')

if [ "$applied_now" -eq 0 ]; then
  echo "=== No pending migrations (${applied_before} were already applied) ==="
else
  echo "=== Applied ${applied_now} new migrations (${applied_before} were already applied) ==="
fi
