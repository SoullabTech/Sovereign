#!/usr/bin/env bash
set -euo pipefail

# MAIA Sovereign Production Entrypoint
# Refuses to boot if DB schema is behind what this image expects.

echo "🔎 [Entrypoint] Checking DB schema compatibility..."
./scripts/ensure-migrations.sh

echo "✅ [Entrypoint] Schema checks OK, starting server..."
exec node server.js
