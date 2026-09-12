#!/usr/bin/env bash
# OPS-DT-01 — tear down the device-test environment.
#   scripts/device-test-down.sh          stop containers, KEEP data
#   scripts/device-test-down.sh --wipe   stop and DESTROY the test database
# Production is never touched: this stack owns its own network and volumes.
set -euo pipefail
COMPOSE="docker-compose.device-test.yml"
ENV_FILE="${DEVICE_TEST_ENV_FILE:-.env.device-test}"

if [ "${1:-}" = "--wipe" ]; then
  echo "Destroying device-test containers AND data (production untouched)…"
  docker compose -f "$COMPOSE" --env-file "$ENV_FILE" down -v
  echo "device-test wiped. Next up.sh starts from an empty database."
else
  docker compose -f "$COMPOSE" --env-file "$ENV_FILE" down
  echo "device-test stopped; data preserved. Use --wipe to reset."
fi
