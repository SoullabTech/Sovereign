#!/usr/bin/env bash
# Writer's Studio journey runner (WJ-1). Everything is disposable: a throwaway Postgres container, fictional writers,
# a local server. Nothing touches production, no provider is called, no email is sent.
#
#   tests/e2e/writers-journey/run-journey.sh [--build] [--defeat MODE] [--keep]
#
# Needs: Docker, a built app (.next — or pass --build), node_modules installed, Google Chrome installed.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../../.."

BUILD=0; DEFEAT=none; KEEP=0
while [ $# -gt 0 ]; do case "$1" in --build) BUILD=1;; --keep) KEEP=1;; --defeat) DEFEAT="${2:-none}"; shift;; *) echo "unknown arg $1"; exit 64;; esac; shift; done

PGPORT="${WJ_PG_PORT:-55460}"; APPPORT="${WJ_APP_PORT:-3300}"; CONT="wj-pg-$$"
SERVER_PID=""
cleanup() { [ "$KEEP" = 1 ] && { echo "== --keep: stack left running (app :$APPPORT, container $CONT, pid $SERVER_PID)"; return; }; [ -n "$SERVER_PID" ] && kill "$SERVER_PID" >/dev/null 2>&1; docker rm -f "$CONT" >/dev/null 2>&1; }
trap cleanup EXIT

[ -d node_modules ] || { echo "REFUSED: node_modules missing (run npm ci)"; exit 65; }
if [ "$BUILD" = 1 ]; then NEXT_TELEMETRY_DISABLED=1 npm run build || exit 66; fi
[ -f .next/BUILD_ID ] || { echo "REFUSED: no production build (.next/BUILD_ID). Pass --build."; exit 66; }

echo "== throwaway database (container $CONT on :$PGPORT)"
docker run -d --name "$CONT" -e POSTGRES_PASSWORD=wj -e POSTGRES_DB=wj -p "$PGPORT:5432" pgvector/pgvector:pg16 >/dev/null || exit 67
for i in $(seq 1 60); do docker exec "$CONT" pg_isready -U postgres -q && break; sleep 1; done
docker exec "$CONT" psql -U postgres -d wj -qc 'CREATE EXTENSION IF NOT EXISTS vector; CREATE EXTENSION IF NOT EXISTS pgcrypto; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' || exit 67
export DATABASE_URL="postgresql://postgres:wj@127.0.0.1:$PGPORT/wj"
bash scripts/bootstrap-database.sh >/tmp/wj-bootstrap.log 2>&1 || { tail -5 /tmp/wj-bootstrap.log; exit 68; }
bash scripts/apply-migrations.sh >/tmp/wj-migrate.log 2>&1 || { tail -8 /tmp/wj-migrate.log; exit 68; }
echo "   schema: $(docker exec "$CONT" psql -U postgres -d wj -Atc "select count(*) from pg_tables where schemaname='public'") tables, ledger $(docker exec "$CONT" psql -U postgres -d wj -Atc "select count(*) from schema_migrations") rows"
node tests/e2e/writers-journey/seed-fictional-writers.cjs >/dev/null || exit 69

if [ "$DEFEAT" = no_roster ]; then
  docker exec "$CONT" psql -U postgres -d wj -qc "DELETE FROM ops_contacts WHERE member_id = (SELECT id FROM members WHERE username='journey_alice')"
fi

echo "== app on :$APPPORT"
NODE_ENV=production PORT="$APPPORT" NEXT_TELEMETRY_DISABLED=1 npx next start -p "$APPPORT" >/tmp/wj-server.log 2>&1 &
SERVER_PID=$!
for i in $(seq 1 60); do
  code=$(node -e "fetch('http://127.0.0.1:$APPPORT/signin').then(r=>console.log(r.status)).catch(()=>console.log(0))")
  [ "$code" = 200 ] && break; sleep 1
done
[ "$code" = 200 ] || { echo "REFUSED: app did not become ready"; tail -5 /tmp/wj-server.log; exit 70; }

echo "== journey (defeat mode: $DEFEAT)"
WJ_BASE_URL="http://127.0.0.1:$APPPORT" WJ_DEFEAT="$DEFEAT" WJ_REPORT="${WJ_REPORT:-/tmp/wj-report-$DEFEAT.json}" \
  npx playwright test -c tests/e2e/writers-journey/playwright.journey.config.ts
RC=$?
echo "== journey exit: $RC"
exit $RC
