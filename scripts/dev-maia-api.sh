#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA API Local Development
# ═══════════════════════════════════════════════════════════════════════════════
# Starts the MAIA API service locally for development.
#
# Usage:
#   ./scripts/dev-maia-api.sh
#
# Prerequisites:
#   - PostgreSQL running locally or via docker
#   - DATABASE_URL set in environment or .env
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "                       MAIA API Local Dev"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "Starting on http://localhost:3001"
echo
echo "Set NEXT_PUBLIC_API_URL=http://localhost:3001 in .env.local for Next.js dev"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo

npm run -w @maia/api dev
