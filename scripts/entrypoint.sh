#!/usr/bin/env bash
set -euo pipefail

# MAIA Sovereign Production Entrypoint
# Refuses to boot if DB schema is behind what this image expects.

echo "🔎 [Entrypoint] Checking DB schema compatibility..."
./scripts/ensure-migrations.sh

echo "🔐 [Entrypoint] Reconciling SOURCE-CUSTODY-PII-01 operational contacts..."
NODE_OPTIONS="${NODE_OPTIONS:-} --conditions=react-server" \
  ./node_modules/.bin/tsx ./scripts/source-custody-r3-migrate.ts

echo "✅ [Entrypoint] Schema/custody checks OK, starting server..."
exec node server.js
