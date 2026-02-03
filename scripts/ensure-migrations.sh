#!/usr/bin/env bash
set -euo pipefail

# Schema Gate: Refuse to start if required migrations are missing
# Run this before starting the app to catch schema drift early

: "${DATABASE_URL:?DATABASE_URL is required}"

# Single source of truth for required migrations
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REQUIRED_FILE="${SCRIPT_DIR}/../database/required_migrations.txt"

if [[ ! -f "$REQUIRED_FILE" ]]; then
  echo "❌ Required migrations file not found: $REQUIRED_FILE"
  exit 1
fi

# Read required migrations (skip comments and empty lines)
REQUIRED=()
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip comments and empty lines
  [[ "$line" =~ ^#.*$ ]] && continue
  [[ -z "${line// }" ]] && continue
  REQUIRED+=("$line")
done < "$REQUIRED_FILE"

if [[ ${#REQUIRED[@]} -eq 0 ]]; then
  echo "⚠️  No required migrations defined in $REQUIRED_FILE"
  echo "✅ DB schema check skipped (no requirements)."
  exit 0
fi

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
