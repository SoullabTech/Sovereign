#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"

echo "✅ Building…"
npm run build

echo "✅ Starting…"
PORT="$PORT" npm run start >/tmp/maia-start.log 2>&1 &
PID=$!

cleanup() { kill $PID 2>/dev/null || true; }
trap cleanup EXIT

echo "✅ Waiting for server…"
for i in {1..30}; do
  if curl -fsS "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
    echo "✅ Health OK"

    # Test MAIA endpoint
    if curl -fsS -X POST "http://localhost:$PORT/api/sovereign/app/maia" \
      -H "Content-Type: application/json" \
      -d '{"message":"test","mode":"dialogue"}' >/dev/null 2>&1; then
      echo "✅ MAIA endpoint OK"
      exit 0
    else
      echo "⚠️  MAIA endpoint failed"
      exit 1
    fi
  fi
  sleep 1
done

echo "❌ Server did not become healthy. Logs:"
tail -200 /tmp/maia-start.log || true
exit 1
