#!/usr/bin/env bash
# R111: original media worker + disposable PostgreSQL16 + fictional vault.
# CLASS A / EXPECTED UNSAFE. GitHub-hosted runner ONLY. No production infrastructure.
set -euo pipefail
test "$(printenv GITHUB_ACTIONS || :)" = true || exit 90
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
test -x ./node_modules/.bin/tsx || { echo R111_MISSING_TSX; exit 91; }
tag="r111_$GITHUB_RUN_ID"
pg="$tag"_pg
net="$tag"_net
vol="$tag"_vault
wrong="$tag"_wrong
right="$tag"_right
active_worker=""
cleanup() {
  docker rm -f "$wrong" "$right" "$pg" >/dev/null 2>&1 || :
  docker volume rm -f "$vol" >/dev/null 2>&1 || :
  docker network rm "$net" >/dev/null 2>&1 || :
}
trap cleanup EXIT
fail() {
  echo "R111_REFUSED: $*" >&2
  if [ -n "$active_worker" ]; then docker logs --tail 35 "$active_worker" 2>&1 || :; fi
  exit 92
}
count_queue() {
  docker exec "$pg" psql -X -qAt -v ON_ERROR_STOP=1 -U r111 -d r111 -c \
    "SELECT count(*) FROM vault_erasure_queue"
}
wait_queue_empty() {
  local stage="$1" n i
  for ((i=0; i<35; i++)); do
    n="$(count_queue)" || fail "$stage: SQL failed"
    if [ "$n" = 0 ]; then return 0; fi
    if ! docker inspect -f '{{.State.Running}}' "$active_worker" | grep -qx true; then
      fail "$stage: actual worker exited"
    fi
    sleep 1
  done
  fail "$stage: queue did not clear"
}
inspect_vault() {
  docker run --rm --network none \
    --mount "type=volume,source=$vol,target=/app/data/vault,readonly" \
    node:22-bookworm sh -ceu '
      test "$(cat /app/data/vault/fictional/r111-bystander.bin)" = "FICTIONAL_R111_BYSTANDER_ONLY"
      if [ "$1" = present ]; then
        test "$(cat /app/data/vault/fictional/r111-owed.bin)" = "FICTIONAL_R111_OWED_ONLY"
      else
        test ! -e /app/data/vault/fictional/r111-owed.bin
      fi
    ' sh "$1" || fail "physical named-volume inspection"
}
insert_owed() {
  docker exec "$pg" psql -X -q -v ON_ERROR_STOP=1 -U r111 -d r111 \
    -c "INSERT INTO vault_erasure_queue(artifact_ref) VALUES ('fictional/r111-owed.bin')" >/dev/null
}
launch_worker() {
  local name="$1"
  shift
  docker run --detach --name "$name" --network "$net" \
    --user 1000:1000 --cap-drop ALL --security-opt no-new-privileges \
    --mount "type=bind,source=$PWD,target=/repo,readonly" --workdir /repo \
    -e DATABASE_URL=postgresql://r111@r111-pg:5432/r111 \
    -e FILE_STORAGE_PATH=/app/data/vault -e VAULT_ERASURE_EVERY_N_LOOPS=1 \
    -e NODE_ENV=production "$@" node:22-bookworm \
    ./node_modules/.bin/tsx scripts/run-media-worker.ts >/dev/null
}
docker network create --internal "$net" >/dev/null
docker volume create "$vol" >/dev/null
docker run --detach --name "$pg" --network "$net" --network-alias r111-pg \
  -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_USER=r111 -e POSTGRES_DB=r111 \
  postgres:16-alpine >/dev/null
ready=0
for ((i=0; i<60; i++)); do
  # The Postgres Docker entrypoint starts a TEMPORARY Unix-socket server
  # during init, then shuts it down; pg_isready -without -h can briefly
  # report a false READY. Require a working final TCP query instead.
  if docker exec "$pg" psql -X -qAt -h 127.0.0.1 -v ON_ERROR_STOP=1 -U r111 -d r111 -c 'SELECT 1' 2>/dev/null | grep -qx 1; then
    ready=1
    break
  fi
  sleep 1
done
[ "$ready" = 1 ] || fail "PG16 not ready"
# Apply ORIGINAL migrations rather than a fake database queue.
docker exec -i "$pg" psql -X -q -v ON_ERROR_STOP=1 -U r111 -d r111 \
  < database/migrations/20260407100001_media_studio_build_a.sql
docker exec -i "$pg" psql -X -q -v ON_ERROR_STOP=1 -U r111 -d r111 \
  < database/migrations/20260907000001_vault_erasure_queue.sql
docker run --rm --network none \
  --mount "type=volume,source=$vol,target=/app/data/vault" node:22-bookworm sh -ceu '
    mkdir -p /app/data/vault/fictional
    printf "%s" "FICTIONAL_R111_OWED_ONLY" > /app/data/vault/fictional/r111-owed.bin
    printf "%s" "FICTIONAL_R111_BYSTANDER_ONLY" > /app/data/vault/fictional/r111-bystander.bin
    chown -R 1000:1000 /app/data/vault
    chmod 0700 /app/data/vault /app/data/vault/fictional
    chmod 0600 /app/data/vault/fictional/*.bin
  '
inspect_vault present
insert_owed
active_worker="$wrong"
# Real unmodified process; no vault mount, as in current published Compose.
launch_worker "$wrong"
wait_queue_empty wrong_mount
inspect_vault present
docker logs "$wrong" 2>&1 | grep -q 'MediaWorker/erasure.*destroyed 1' || fail "wrong-root sweep missing"
if docker logs "$wrong" 2>&1 | grep -q FICTIONAL_R111_; then fail "worker log disclosed marker"; fi
docker rm -f "$wrong" >/dev/null
active_worker=""
echo R111_EXPECTED_UNSAFE:actual_worker_cleared_real_PG16_queue_while_named_vault_file_survived
# Reinsert only the fictional obligation and repeat with the correct named volume.
insert_owed
active_worker="$right"
launch_worker "$right" --mount "type=volume,source=$vol,target=/app/data/vault"
wait_queue_empty correct_mount
inspect_vault absent
docker logs "$right" 2>&1 | grep -q 'MediaWorker/erasure.*destroyed 1' || fail "correct-root sweep missing"
if docker logs "$right" 2>&1 | grep -q FICTIONAL_R111_; then fail "worker log disclosed marker"; fi
docker rm -f "$right" >/dev/null
active_worker=""
echo R111_CORRECT_CONTROL:only_fictional_target_erased_and_sibling_preserved
echo R111_CLASS_A_HOLD:no_runtime_mount_pin_old_image_fencing_R20_key_or_restoration_review
