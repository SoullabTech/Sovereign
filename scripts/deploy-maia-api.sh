#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA API Deploy Script
# ═══════════════════════════════════════════════════════════════════════════════
# Deploys the MAIA API service to production.
# Run on the server after SSH.
#
# Usage:
#   ./scripts/deploy-maia-api.sh
#
# Prerequisites:
#   - .env.production exists with DATABASE_URL, CORS_ORIGINS
#   - DNS: api.soullab.life → server IP
#   - Docker and docker compose installed
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "                         MAIA API Deploy"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "Repo: $ROOT_DIR"
echo "Compose: $COMPOSE_FILE"
echo "Env: $ENV_FILE"
echo

# ─────────────────────────────────────────────────────────────────────────────────
# Pre-flight checks
# ─────────────────────────────────────────────────────────────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found"
  echo "Copy .env.production.template and fill in your values."
  exit 1
fi

if ! command -v docker &> /dev/null; then
  echo "ERROR: docker not found"
  exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────────
# Pull latest (if git-managed)
# ─────────────────────────────────────────────────────────────────────────────────
echo "== Pull latest =="
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git pull --rebase
else
  echo "Skipping git pull (not a git repo here)."
fi
echo

# ─────────────────────────────────────────────────────────────────────────────────
# Build & start MAIA API
# ─────────────────────────────────────────────────────────────────────────────────
echo "== Build & start MAIA API =="
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build maia-api
echo

# ─────────────────────────────────────────────────────────────────────────────────
# Health check (internal)
# ─────────────────────────────────────────────────────────────────────────────────
echo "== Wait for startup & check internal health =="
sleep 5

MAX_RETRIES=10
RETRY_COUNT=0
until curl -fsS "http://localhost:3001/v1/health" >/dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [[ $RETRY_COUNT -ge $MAX_RETRIES ]]; then
    echo "ERROR: MAIA API failed to become healthy after $MAX_RETRIES attempts"
    echo "Check logs: docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs maia-api"
    exit 1
  fi
  echo "Waiting for MAIA API to become healthy... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 3
done

echo
curl -fsS "http://localhost:3001/v1/health" | head -200
echo
echo "MAIA API healthy on localhost:3001"
echo

# ─────────────────────────────────────────────────────────────────────────────────
# Reload Caddy (for api.soullab.life routing)
# ─────────────────────────────────────────────────────────────────────────────────
echo "== Reload Caddy (api.soullab.life routing) =="
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d caddy
echo

# ─────────────────────────────────────────────────────────────────────────────────
# Show recent logs
# ─────────────────────────────────────────────────────────────────────────────────
echo "== Recent logs =="
echo "--- maia-api (last 30 lines) ---"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=30 maia-api || true
echo
echo "--- caddy (last 20 lines) ---"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=20 caddy || true
echo

# ─────────────────────────────────────────────────────────────────────────────────
# Done
# ─────────────────────────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "                         MAIA API Deploy Complete"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo
echo "Next steps:"
echo "  1. Verify externally:"
echo "     curl -s https://api.soullab.life/v1/health | head"
echo
echo "  2. Test migrated routes:"
echo "     curl -s -X POST https://api.soullab.life/v1/members/check \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"passkey\":\"TEST-123\"}' | head"
echo
echo "     curl -s https://api.soullab.life/v1/portal/loralee/config | head"
echo
echo "  3. Rebuild frontend with API URL:"
echo "     ./scripts/deploy-maia-frontend.sh"
echo
