#!/bin/sh
# PT-3 §VI (B21) — recreate the runtime that actually possesses owner authority. PRODUCTION HOST.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §VI.
#
# ⭐ WHY THIS IS NOT A LIST. Editing .env.production does not change a RUNNING container's
# environment — the container must be recreated. The runbook recreated seven remembered services
# while the post-cutover witness defines the constitutional set by POSSESSION: any non-Postgres
# container still holding DATABASE_URL is a defect. Fourteen services load .env.production, so a
# container outside the seven — caddy, oldhead, demo, palisades — would keep the old owner URL in
# its existing environment and fail the final witness.
#
# Replacing a stale four-name list with a stale seven-name list repeats the defect one size larger.
# This DISCOVERS the set, recreates it, then RE-DISCOVERS and requires the law to hold:
#
#   no ordinary running container possesses owner DATABASE_URL
#
# Execution follows the same law as the witness, which is the point.

set -eu
PROJECT="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"
COMPOSE="$PROJECT/docker-compose.production.yml"
cd "$PROJECT"

# The migration authority is deliberately exempt: migrate must keep owner authority (§IX.5), and
# postgres is the database itself rather than an ordinary runtime consumer.
is_exempt() { case "$1" in maia-postgres|*migrate*) return 0 ;; *) return 1 ;; esac; }

discover() {
  for c in $(docker ps --format '{{.Names}}' 2>/dev/null); do
    is_exempt "$c" && continue
    own=$(docker exec "$c" printenv DATABASE_URL 2>/dev/null || true)
    [ -n "$own" ] || continue
    svc=$(docker inspect -f '{{index .Config.Labels "com.docker.compose.service"}}' "$c" 2>/dev/null || true)
    [ -n "$svc" ] && printf '%s\n' "$svc"
  done | sort -u
}

echo "════════ discovered: running containers possessing owner DATABASE_URL ════════"
SERVICES=$(discover)
if [ -z "$SERVICES" ]; then
  echo "  none — every ordinary container has already lost owner authority"
  exit 0
fi
printf '  %s\n' $SERVICES

echo
echo "════════ recreating exactly that set ════════"
# shellcheck disable=SC2086
docker compose -f "$COMPOSE" up -d --no-deps --force-recreate $SERVICES

echo
echo "════════ re-discovering — the law must now hold ════════"
sleep 5
REMAIN=$(discover)
if [ -z "$REMAIN" ]; then
  echo "  READY — no ordinary running container possesses owner DATABASE_URL"
  exit 0
fi
echo "  DEFECT — these still possess owner authority after recreation:"
printf '    %s\n' $REMAIN
echo "  Their environment did not change: check that .env.production no longer carries DATABASE_URL."
exit 1
