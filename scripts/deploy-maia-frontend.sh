#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA Frontend Deploy Script
# ═══════════════════════════════════════════════════════════════════════════════
# Rebuilds and deploys the MAIA frontend with the external API URL.
# Run AFTER deploy-maia-api.sh has succeeded.
#
# Usage:
#   ./scripts/deploy-maia-frontend.sh
#
# Prerequisites:
#   - MAIA API already deployed and healthy
#   - .env.production has NEXT_PUBLIC_API_URL=https://api.soullab.life
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "                       MAIA Frontend Deploy"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "Repo: $ROOT_DIR"
echo

# ─────────────────────────────────────────────────────────────────────────────────
# Pre-flight checks
# ─────────────────────────────────────────────────────────────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found"
  exit 1
fi

# Check that NEXT_PUBLIC_API_URL is set
if ! grep -q "NEXT_PUBLIC_API_URL" "$ENV_FILE"; then
  echo "WARNING: NEXT_PUBLIC_API_URL not found in $ENV_FILE"
  echo "Add: NEXT_PUBLIC_API_URL=https://api.soullab.life"
  echo
fi

# Verify MAIA API is healthy before rebuilding frontend
echo "== Verify MAIA API is healthy =="
if ! curl -fsS "http://localhost:3001/v1/health" >/dev/null 2>&1; then
  echo "WARNING: MAIA API not responding on localhost:3001"
  echo "Run ./scripts/deploy-maia-api.sh first"
  echo
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo "MAIA API healthy"
fi
echo

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
# Build & deploy frontend
# ─────────────────────────────────────────────────────────────────────────────────
echo "== Build & start MAIA frontend =="
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build maia
echo

# ─────────────────────────────────────────────────────────────────────────────────
# Wait for frontend health
# ─────────────────────────────────────────────────────────────────────────────────
echo "== Wait for frontend health =="
sleep 10

MAX_RETRIES=20
RETRY_COUNT=0
until curl -fsS "http://localhost:3000/api/consciousness/health" >/dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [[ $RETRY_COUNT -ge $MAX_RETRIES ]]; then
    echo "ERROR: MAIA frontend failed to become healthy after $MAX_RETRIES attempts"
    echo "Check logs: docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs maia"
    exit 1
  fi
  echo "Waiting for MAIA frontend to become healthy... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 5
done

echo "MAIA frontend healthy"
echo

# ─────────────────────────────────────────────────────────────────────────────────
# Show recent logs
# ─────────────────────────────────────────────────────────────────────────────────
echo "== Recent logs (last 30 lines) =="
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=30 maia || true
echo

# ─────────────────────────────────────────────────────────────────────────────────
# Done
# ─────────────────────────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "                     MAIA Frontend Deploy Complete"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo
echo "Smoke tests:"
echo "  1. Sign in: https://soullab.life/signin"
echo "  2. Portal:  https://loralee.soullab.life"
echo
echo "If both work, frontend is using MAIA API correctly."
echo
