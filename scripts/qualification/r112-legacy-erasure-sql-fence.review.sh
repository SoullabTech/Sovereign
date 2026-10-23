#!/usr/bin/env bash
# R112 CLASS A / REVIEW ONLY — real original worker with legacy SQL role fenced.
# Disposable GitHub-hosted CI ONLY. This is NOT production fencing or approval.
set -euo pipefail
test "$(printenv GITHUB_ACTIONS || :)" = true || { echo R112_REFUSE_NONCI; exit 90; }
test "$(printenv GITHUB_REPOSITORY || :)" = SoullabTech/Sovereign || exit 90
test "$(printenv RUNNER_ENVIRONMENT || :)" = github-hosted || exit 90
test "$(printenv RUNNER_OS || :)" = Linux || exit 90
test -z "$(printenv DOCKER_HOST || :)" || exit 90
test -z "$(printenv DOCKER_CONTEXT || :)" || exit 90
test "$(docker context show)" = default || exit 90
cd "$(dirname "$0")/../.."
test "$(git hash-object lib/storage/fileVault.ts)" = e2471c6a865f12103a9ca4497647fa636295cb52 || exit 91
test "$(git hash-object lib/manuscript/source/eraseManuscript.ts)" = a480ab1fd50085e6d926cb535b6e81102c431150 || exit 91
test "$(git hash-object scripts/run-media-worker.ts)" = 46935ab7ec048d85a30396d904042f78493f62ed || exit 91
test "$(git hash-object docker-compose.production.yml)" = 30e0d9f50e952535aeff86ede389c2343a2e2b49 || exit 91
test -x ./node_modules/.bin/tsx || { echo R112_REFUSED_NO_TSX; exit 91; }

tag="r112_$GITHUB_RUN_ID"
pg="$tag"_pg
net="$tag"_net
vol="$tag"_vault
old_one="$tag"_old1
old_two="$tag"_old2
active_worker=""
cleanup() {
  docker rm -f "$old_one" "$old_two" "$pg" >/dev/null 2>&1 || :
  docker volume rm -f "$vol" >/dev/null 2>&1 || :
  docker network rm "$net" >/dev/null 2>&1 || :
}
trap cleanup EXIT
fail() {
  echo "R112_REFUSED: $*" >&2
  if [ -n "$active_worker" ]; then docker logs --tail 40 "$active_worker" 2>&1 || :; fi
  exit 92
}
sql() {
  docker exec "$pg" psql -X -qAt -h 127.0.0.1 -v ON_ERROR_STOP=1 -U r112 -d r112 -c "$1"
}
verify_vault_unchanged() {
  docker run --rm --network none \
    --mount "type=volume,source=$vol,target=/app/data/vault,readonly" \
    node:22-bookworm sh -ceu '
      test "$(cat /app/data/vault/fictional/r112-owed.bin)" = "FICTIONAL_R112_OWED_ONLY"
      test "$(cat /app/data/vault/fictional/r112-bystander.bin)" = "FICTIONAL_R112_BYSTANDER_ONLY"
    ' || fail "fictional authoritative named vault changed"
}
wait_attempts() {
  local threshold="$1" attempts count i
  for ((i=0; i<45; i++)); do
    count="$(sql 'SELECT count(*) FROM vault_erasure_queue')" || fail "queue query unavailable"
    test "$count" = 1 || fail "old worker illegally discharged queue"
    attempts="$(sql 'SELECT attempts FROM vault_erasure_queue LIMIT 1')" || fail "attempt read failed"
    if (( attempts >= threshold )); then
      return 0
    fi
    if ! docker inspect -f '{{.State.Running}}' "$active_worker" | grep -qx true; then
      fail "real old worker exited unexpectedly"
    fi
    sleep 1
  done
  fail "no real old worker erasure attempt observed"
}
launch_old_worker() {
  local name="$1"
  docker run --detach --name "$name" --network "$net" \
    --user 1000:1000 --cap-drop ALL --security-opt no-new-privileges \
    --mount "type=bind,source=$PWD,target=/repo,readonly" --workdir /repo \
    -e DATABASE_URL=postgresql://legacy_worker@r112-pg:5432/r112 \
    -e FILE_STORAGE_PATH=/app/data/vault -e VAULT_ERASURE_EVERY_N_LOOPS=1 \
    -e NODE_ENV=production node:22-bookworm \
    ./node_modules/.bin/tsx scripts/run-media-worker.ts >/dev/null
}
docker network create --internal "$net" >/dev/null
docker volume create "$vol" >/dev/null
docker run --detach --name "$pg" --network "$net" --network-alias r112-pg \
  -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_USER=r112 -e POSTGRES_DB=r112 \
  postgres:16-alpine >/dev/null
ready=0
for ((i=0; i<65; i++)); do
  # The Docker Postgres entrypoint starts a transient socket server.
  # Only a successful TCP SQL query proves the final server is ready.
  if sql 'SELECT 1' 2>/dev/null | grep -qx 1; then ready=1; break; fi
  sleep 1
done
test "$ready" = 1 || fail "PG16 final TCP server not ready"
docker exec -i "$pg" psql -X -q -h 127.0.0.1 -v ON_ERROR_STOP=1 -U r112 -d r112 \
  < database/migrations/20260407100001_media_studio_build_a.sql
docker exec -i "$pg" psql -X -q -h 127.0.0.1 -v ON_ERROR_STOP=1 -U r112 -d r112 \
  < database/migrations/20260907000001_vault_erasure_queue.sql

# Simulate a cutover where an old image retains only a bounded, separate SQL role.
# It can query/update the queue, but can never DELETE a row. Real infrastructure
# still uses shared credentials: THIS IS NOT evidence such a cutover has happened.
docker exec -i "$pg" psql -X -q -h 127.0.0.1 -v ON_ERROR_STOP=1 -U r112 -d r112 <<'SQL'
CREATE ROLE legacy_worker LOGIN;
GRANT USAGE ON SCHEMA public TO legacy_worker;
GRANT SELECT, UPDATE ON public.media_jobs TO legacy_worker;
GRANT SELECT, UPDATE ON public.vault_erasure_queue TO legacy_worker;
REVOKE DELETE ON public.vault_erasure_queue FROM PUBLIC;
REVOKE DELETE ON public.vault_erasure_queue FROM legacy_worker;
SQL
test "$(sql "SELECT has_table_privilege('legacy_worker','vault_erasure_queue','DELETE')")" = f || fail "legacy DELETE still available"
test "$(sql "SELECT has_table_privilege('legacy_worker','vault_erasure_queue','SELECT')")" = t || fail "no legacy SELECT"
test "$(sql "SELECT has_table_privilege('legacy_worker','vault_erasure_queue','UPDATE')")" = t || fail "no legacy UPDATE"

docker run --rm --network none \
  --mount "type=volume,source=$vol,target=/app/data/vault" node:22-bookworm sh -ceu '
    mkdir -p /app/data/vault/fictional
    printf "%s" "FICTIONAL_R112_OWED_ONLY" > /app/data/vault/fictional/r112-owed.bin
    printf "%s" "FICTIONAL_R112_BYSTANDER_ONLY" > /app/data/vault/fictional/r112-bystander.bin
  '
verify_vault_unchanged
sql "INSERT INTO vault_erasure_queue(artifact_ref) VALUES ('fictional/r112-owed.bin')" >/dev/null
test "$(sql 'SELECT count(*) FROM vault_erasure_queue')" = 1 || fail "fixture queue missing"

# First actual old worker: wrong image-local vault + no queue DELETE privilege.
active_worker="$old_one"
launch_old_worker "$old_one"
wait_attempts 1
verify_vault_unchanged
test "$(sql 'SELECT count(*) FROM vault_erasure_queue')" = 1 || fail "legacy worker incorrectly cleared obligation"
docker rm -f "$old_one" >/dev/null
active_worker=""
echo R112_LEGACY_FIRST_PROCESS:real_old_worker_denied_queue_DELETE_original_file_and_obligation_retained

# A separate worker process retries the SAME persisted obligation after restart.
active_worker="$old_two"
launch_old_worker "$old_two"
wait_attempts 2
verify_vault_unchanged
test "$(sql 'SELECT count(*) FROM vault_erasure_queue')" = 1 || fail "legacy restart cleared obligation"
if docker logs "$old_one" "$old_two" 2>&1 | grep -q FICTIONAL_R112_; then fail "fictional bytes leaked in worker logs"; fi
docker rm -f "$old_two" >/dev/null
active_worker=""
echo R112_LEGACY_SECOND_PROCESS:real_old_worker_restart_cannot_discharge_persisted_obligation
echo R112_LIMIT:SQL_ROLE_FENCING_ONLY_no_attested_mount_no_receipt_no_old_shared_credential_cutover
echo R112_CLASS_A_HOLD:separate_erasure_actor_and_R20_antirollback_still_required
