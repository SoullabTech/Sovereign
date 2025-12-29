#!/bin/sh
# SQL Migration Runner for MAIA Production
# Called by: docker compose --profile migrate run --rm migrate

set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"

echo "=== SQL migrations ==="

count=0
for f in /app/database/migrations/*.sql; do
  [ -e "$f" ] || continue  # handles empty-glob case
  echo "→ $(basename "$f")"
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$f"
  count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
  echo "ERROR: No migrations found in /app/database/migrations/" >&2
  exit 1
fi

echo "=== $count migrations complete ==="
