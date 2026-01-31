#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-https://soullab.life}"

echo "== Smoke test: $BASE =="

echo "-- /api/health"
curl -fsS "$BASE/api/health" | head -200
echo

echo "-- /api/version"
curl -fsS "$BASE/api/version" | head -200
echo

echo "-- /api/ready"
READY_RESP=$(curl -sS "$BASE/api/ready" 2>&1) || true
echo "$READY_RESP" | head -200
echo

echo "-- home page (first 20 lines)"
curl -fsS "$BASE" 2>/dev/null | head -20
echo

echo "✅ smoke test passed"
