#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# OPS-DT-01 — Deploy an explicitly named SHA into the device-test environment
# ═══════════════════════════════════════════════════════════════════════════════
#   scripts/device-test-up.sh <SHA>
#
# Mirrors the production immutable-SHA discipline: the SHA is named, materialized
# with `git archive` into an isolated build context, and verified in the running
# container afterwards. A concurrent checkout of the shared working tree cannot
# change what gets built.
#
# Never touches production containers, the production network, or the production
# database. This stack has no route to any of them.
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

COMPOSE="docker-compose.device-test.yml"
ENV_FILE="${DEVICE_TEST_ENV_FILE:-.env.device-test}"

SHA="${1:-}"
if [ -z "$SHA" ]; then
  echo "usage: scripts/device-test-up.sh <SHA>"
  echo "  the SHA is required — device-test never builds 'whatever is checked out'"
  exit 2
fi

[ -f "$ENV_FILE" ] || { echo "missing $ENV_FILE (see docs/ops/OPS_DT_01_DEVICE_TEST_ENV.md §2)"; exit 2; }

FULL_SHA=$(git rev-parse "$SHA^{commit}")
SHORT_SHA=$(git rev-parse --short "$SHA^{commit}")
echo "═══ device-test deploy: $SHORT_SHA ═══"

# ── Materialize the exact commit into an isolated context ────────────────────
CTX=$(mktemp -d "${DEPLOY_CONTEXT_DIR:-/tmp}/device-test-XXXXXX")
trap 'rm -rf "$CTX"' EXIT
git archive "$FULL_SHA" | tar -x -C "$CTX"
cp "$ENV_FILE" "$CTX/$ENV_FILE"
echo "  context materialized from $FULL_SHA"

cd "$CTX"
export GIT_COMMIT="$SHORT_SHA"
export DEPLOY_LANE_TOKEN="device-test"

docker compose -f "$COMPOSE" --env-file "$ENV_FILE" up -d --build

# ── Verify what is actually running ──────────────────────────────────────────
echo
echo "═══ provenance verification ═══"
sleep 5
RUNNING=$(docker exec maia-device-test printenv GIT_COMMIT 2>/dev/null || echo "MISSING")
LANE=$(docker exec maia-device-test printenv DEPLOY_LANE 2>/dev/null || echo "MISSING")
echo "  GIT_COMMIT : $RUNNING  (expected $SHORT_SHA)"
echo "  DEPLOY_LANE: $LANE     (expected device-test)"
if [ "$RUNNING" != "$SHORT_SHA" ]; then
  echo "  ❌ running container does not report the requested SHA — ABORT"
  exit 1
fi
echo "  ✅ provenance verified"

# ── Apply migrations to the ISOLATED database only ───────────────────────────
echo
echo "═══ migrations (device-test database only) ═══"
echo "  target: maia-postgres-device-test / maia_device_test"
echo "  run:    scripts/device-test-migrate.sh"
echo
echo "Reminder: run scripts/verify-device-test-isolation.sh BEFORE trusting any result."
