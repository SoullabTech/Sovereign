#!/bin/bash
# MAIA Hetzner Failover Script
# Run ON Hetzner after minisforum is confirmed down (or isolated for drill).
#
# Drill mode:  DRILL_MODE=1 ./hetzner-failover.sh
#   minisforum stays up; Hetzner runs in isolation; DNS is NOT switched.
#
# Real failover: ./hetzner-failover.sh
#   minisforum is genuinely down; DNS is switched at the end.
#
# Rollback (drill only): see runbook Phase 7.

set -euo pipefail

COMPOSE_PROJECT="maia-sovereign"
COMPOSE_FILE="/root/MAIA-SOVEREIGN/docker-compose.production.yml"
ENV_FILE="/root/MAIA-SOVEREIGN/.env.production"
STANDBY="maia-postgres-standby"

echo ""
echo "=== MAIA Hetzner Failover ==="
echo "Mode: ${DRILL_MODE:+DRILL}${DRILL_MODE:-REAL FAILOVER}"
echo ""

# ── Phase 1: Promote standby ─────────────────────────────────────────────────
echo "--- Phase 1: Promoting standby ---"
IS_RECOVERY=$(docker exec "$STANDBY" psql -U soullab -d maia_consciousness \
  -t -c "SELECT pg_is_in_recovery();" | tr -d ' \n')

if [ "$IS_RECOVERY" = "f" ]; then
  echo "✓ Already primary (pg_is_in_recovery = f) — skipping pg_promote()"
else
  docker exec "$STANDBY" psql -U soullab -d maia_consciousness \
    -c "SELECT pg_promote();"
  IS_RECOVERY=$(docker exec "$STANDBY" psql -U soullab -d maia_consciousness \
    -t -c "SELECT pg_is_in_recovery();" | tr -d ' \n')
  if [ "$IS_RECOVERY" != "f" ]; then
    echo "ERROR: pg_is_in_recovery() = '$IS_RECOVERY' — promotion failed"
    exit 1
  fi
  echo "✓ Postgres promoted (pg_is_in_recovery = f)"
fi

# ── Phase 2: Data integrity ───────────────────────────────────────────────────
echo ""
echo "--- Phase 2: Data integrity ---"
docker exec "$STANDBY" psql -U soullab -d maia_consciousness -c "
  SELECT
    (SELECT COUNT(*) FROM members)             AS members,
    (SELECT COUNT(*) FROM maia_sessions)       AS maia_sessions,
    (SELECT COUNT(*) FROM member_memory_atoms) AS atoms;
"
echo "Expected: members ≥ 69, maia_sessions ≥ 764, atoms ≥ 127"

# ── Phase 3: Wire Docker networks ─────────────────────────────────────────────
echo ""
echo "--- Phase 3: Wiring Docker networks ---"

for NET in maia-internal maia-public; do
  FULL="${COMPOSE_PROJECT}_${NET}"
  if docker network ls --format '{{.Name}}' | grep -q "^${FULL}$"; then
    echo "✓ Network exists: $FULL"
  else
    docker network create \
      --label "com.docker.compose.network=${NET}" \
      --label "com.docker.compose.project=${COMPOSE_PROJECT}" \
      "$FULL"
    echo "✓ Created network: $FULL"
  fi
done

INTERNAL="${COMPOSE_PROJECT}_maia-internal"
ALREADY_CONNECTED=$(docker inspect "$STANDBY" \
  --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' \
  | grep -c "$INTERNAL" || true)

if [ "$ALREADY_CONNECTED" -eq 0 ]; then
  docker network connect --alias maia-postgres "$INTERNAL" "$STANDBY"
  echo "✓ Standby connected to maia-internal as 'maia-postgres'"
else
  echo "✓ Standby already on maia-internal"
fi

# ── Phase 4: Start app stack ──────────────────────────────────────────────────
echo ""
echo "--- Phase 4: Starting app stack (--no-deps skips postgres/whisper) ---"

# On Hetzner, external networks referenced by Caddy (marc-studio_default,
# rudeboy-caddy-bridge) don't exist — other service stacks aren't here.
# Create stubs so Caddy can start; they'll be empty.
for EXT_NET in marc-studio_default rudeboy-caddy-bridge; do
  if ! docker network ls --format '{{.Name}}' | grep -q "^${EXT_NET}$"; then
    docker network create "$EXT_NET"
    echo "✓ Created stub network: $EXT_NET"
  fi
done

cd /root/MAIA-SOVEREIGN
# Prefer docker compose (V2 plugin) if available; fall back to docker-compose (V1)
if docker compose version &>/dev/null; then
  COMPOSE="docker compose"
else
  COMPOSE="docker-compose"
fi
$COMPOSE -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" --env-file "$ENV_FILE" \
  up -d --no-deps --build maia caddy

echo "Waiting for maia-sovereign to become healthy (up to 120s)..."
for i in $(seq 1 24); do
  HEALTH=$(docker inspect maia-sovereign --format '{{.State.Health.Status}}' 2>/dev/null || echo "starting")
  [ "$HEALTH" = "healthy" ] && echo "✓ maia-sovereign healthy" && break
  echo "  ($i/24) $HEALTH"
  sleep 5
done

# ── Phase 5: Health check ─────────────────────────────────────────────────────
echo ""
echo "--- Phase 5: Health endpoint ---"
docker exec maia-sovereign curl -s http://localhost:3000/api/health || echo "WARN: health check failed"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "=== Failover complete ==="
if [ "${DRILL_MODE:-}" = "1" ]; then
  echo "DRILL: DNS was NOT switched. Verify at http://49.13.62.106"
  echo "After verifying the Continuity Recovery Test Account, run the rollback steps in the runbook."
else
  echo "NEXT: Switch DNS A record → 49.13.62.106 (Hetzner public IP)"
  echo "TTL is 300s. Verify from cellular after 5 minutes:"
  echo "  curl https://soullab.life/api/health"
fi
