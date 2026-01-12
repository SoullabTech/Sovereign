#!/usr/bin/env bash
set -euo pipefail

# Schema Gate: Refuse to start if required migrations are missing
# Run this before starting the app to catch schema drift early

: "${DATABASE_URL:?DATABASE_URL is required}"

# Required migrations that the code depends on
# Add new required migrations here as they're created
REQUIRED=(
  "20260112000010_add_origin_route_and_processing_profile.sql"
  # Add future required migrations here
)

echo "🔎 Checking required DB migrations..."
missing=0

# Check if schema_migrations table exists
table_exists=$(psql "$DATABASE_URL" -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='schema_migrations' LIMIT 1;" 2>/dev/null || echo "")

if [[ "$table_exists" != "1" ]]; then
  echo "❌ schema_migrations table does not exist."
  echo "   Run: ./scripts/apply-migrations.sh"
  exit 1
fi

for m in "${REQUIRED[@]}"; do
  exists=$(psql "$DATABASE_URL" -tAc "SELECT 1 FROM schema_migrations WHERE filename='$m' LIMIT 1;" 2>/dev/null || echo "")
  if [[ "$exists" != "1" ]]; then
    echo "❌ Missing migration: $m"
    missing=1
  else
    echo "✅ $m"
  fi
done

if [[ "$missing" == "1" ]]; then
  echo ""
  echo "🛑 Refusing to start: DB schema is behind code."
  echo "   Run: ./scripts/apply-migrations.sh"
  exit 1
fi

echo "✅ DB schema looks compatible."
