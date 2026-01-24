#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Docker Desktop must already be running."
echo "==> Bringing stack down (clean slate)..."
docker compose -f docker-compose.production.yml down

echo "==> Starting postgres first..."
docker compose -f docker-compose.production.yml up -d postgres

echo "==> Waiting for postgres to be healthy..."
sleep 5

echo "==> Starting core services..."
docker compose -f docker-compose.production.yml up -d maia maia-api whisper

echo "==> Running migrations (may fail on known issues)..."
docker compose -f docker-compose.production.yml --profile migrate run --rm migrate || true

echo "==> Starting caddy..."
docker compose -f docker-compose.production.yml up -d caddy

echo "==> Status:"
docker compose -f docker-compose.production.yml ps

echo "==> Smoke test:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:80/ || true
