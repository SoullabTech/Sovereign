#!/usr/bin/env bash
# WRITERS-STUDIO-PRODUCTION-DEPLOY-01 · Phase A — run from the Mac Studio.
#
# ⛔ READ ONLY. It changes nothing on production. It answers the four Phase A
# items and prints a STOP/GO line for each hard stop condition.
set -uo pipefail
H=soullab@minisforum
echo '════ 1 · PRODUCTION IDENTITY ════'
echo "-- ⚠️ The IMAGE and the CONTAINER are checked separately: a stale compose"
echo "--    runtime override can stamp one and not the other (2026-09-03)."
ssh $H 'docker inspect maia-sovereign --format "container created : {{.Created}}"'
ssh $H 'docker exec maia-sovereign printenv GIT_COMMIT   | sed "s/^/container GIT_COMMIT : /"'
ssh $H 'docker image inspect maia-sovereign:current --format "{{range .Config.Env}}{{println .}}{{end}}" | grep -E "^GIT_COMMIT=" | sed "s/^/image     /"'
ssh $H 'docker exec maia-sovereign printenv DEPLOY_LANE  | sed "s/^/DEPLOY_LANE          : /"'
echo
echo '════ 3 · EDITORIAL FLAG — current production value ════'
echo "-- ⛔ ABSENT means OFF. The release ruling is to set it to '1'."
ssh $H 'docker exec maia-sovereign printenv WRITERS_STUDIO_EDITORIAL_ENABLED || echo "(absent — editorial capability OFF)"'
ssh $H 'grep -n WRITERS_STUDIO_EDITORIAL_ENABLED ~/MAIA-SOVEREIGN/docker-compose.production.yml ~/MAIA-SOVEREIGN/.env.production 2>/dev/null || echo "(declared in neither compose nor .env.production)"'
echo
echo '════ 2 + 4 · SCHEMA, MIGRATIONS, AND THE REAL WORK ════'
ssh $H "docker exec -i maia-postgres psql -U soullab maia_consciousness -v ON_ERROR_STOP=1" \
  < "$(dirname "$0")/ws-production-deploy-preflight.sql"
