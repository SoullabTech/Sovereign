#!/usr/bin/env bash
set -euo pipefail

# MAIA Sovereign Production Entrypoint
# Refuses to boot if DB schema is behind what this image expects

echo "🔎 [Entrypoint] Checking DB schema compatibility..."

# Run schema gate (exits non-zero if migrations missing)
./scripts/ensure-migrations.sh

echo "✅ [Entrypoint] Schema OK, starting server..."

# Start Next standalone server
exec node server.js
