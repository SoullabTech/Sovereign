#!/bin/sh
# SQL Migration Runner for MAIA Production
# Called by: docker compose --profile migrate run --rm migrate
#
# Expects:
#   - DATABASE_URL environment variable
#   - /app/database/migrations/*.sql files mounted

set -eu

echo "=== SQL migrations ==="

for f in /app/database/migrations/*.sql; do
  echo "→ $(basename "$f")"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done

echo "=== Migrations complete ==="
