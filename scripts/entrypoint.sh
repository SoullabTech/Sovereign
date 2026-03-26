#!/usr/bin/env bash
set -euo pipefail

# MAIA Sovereign Production Entrypoint
# Refuses to boot if DB schema is behind what this image expects

echo "🔎 [Entrypoint] Checking DB schema compatibility..."

# Run schema gate (exits non-zero if migrations missing)
./scripts/ensure-migrations.sh

echo "✅ [Entrypoint] Schema OK, starting server..."

# Deploy marker — answers "which code is running?" in one log line
LATEST_MIGRATION=$(ls /app/database/migrations/*.sql 2>/dev/null | sort | tail -1 | xargs basename 2>/dev/null || echo "unknown")
echo "═══════════════════════════════════════════════════════════════"
echo "  MAIA SOVEREIGN BOOT"
echo "  DEPLOY_VERSION=${GIT_COMMIT:-unknown}"
echo "  BUILD_DATE=${BUILD_DATE:-unknown}"
echo "  APP_VERSION=${APP_VERSION:-unknown}"
echo "  SCHEMA_LATEST=${LATEST_MIGRATION}"
echo "  NODE_ENV=${NODE_ENV:-production}"
echo "  BOOT_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "═══════════════════════════════════════════════════════════════"

# Start Next standalone server
exec node server.js
