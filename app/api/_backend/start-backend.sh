#!/usr/bin/env bash
set -euo pipefail

PORT_TO_USE="${APP_PORT:-${PORT:-3001}}"

echo "🧹 Killing anything on $PORT_TO_USE..."
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -tiTCP:$PORT_TO_USE || true)
  [[ -n "${PIDS}" ]] && kill -9 $PIDS || true
fi

# Force APP_PORT to win; neutralize PORT from .env
export APP_PORT="${APP_PORT:-$PORT_TO_USE}"
unset PORT

echo "🚀 Starting SpiralogicOracle Backend on port $APP_PORT..."
export NODE_OPTIONS="--trace-uncaught"

# Change to backend directory
cd "$(dirname "$0")"

# Run in foreground so logs/errors are visible
exec npx ts-node src/server-minimal.ts