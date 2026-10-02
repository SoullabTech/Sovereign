#!/usr/bin/env bash
# Local structural test for prepared-reader custody.
# Uses throwaway imported Docker images only: no network, no production
# containers, no MAIA application image build.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(mktemp -d "${TMPDIR:-/tmp}/deploy-reader-split.XXXXXX")"
TEST_REPO="deploy-reader-split-selftest-$$"
export MAIA_IMAGE_REPO="$TEST_REPO"
export MAIA_CONTAINER="fake-live"
export DEPLOY_PREPARED_RECORD="$ROOT/prepared.env"

cleanup() {
    docker images "$TEST_REPO" --format '{{.Repository}}:{{.Tag}}' 2>/dev/null \
      | xargs -r docker rmi -f >/dev/null 2>&1 || true
    rm -rf "$ROOT"
}
trap cleanup EXIT

source "$SCRIPT_DIR/deploy-reader-artifact.sh"

PASS=0
FAIL=0
ok()  { echo "  ok:   $1"; PASS=$((PASS + 1)); }
bad() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

mint() {
    local tag="$1" sha="$2"
    tar -cf - --files-from /dev/null \
      | docker import --change "ENV GIT_COMMIT=$sha" - "$TEST_REPO:$tag" >/dev/null
}

echo "[selftest] Minting baseline + candidate images"
mint base oldsha123
mint build newsha456
BASE_ID="$(docker image inspect "$TEST_REPO:base" --format '{{.Id}}')"
NEW_ID="$(docker image inspect "$TEST_REPO:build" --format '{{.Id}}')"
docker tag "$TEST_REPO:base" "$TEST_REPO:prod"
docker tag "$TEST_REPO:base" "$TEST_REPO:current"
docker tag "$TEST_REPO:base" "$TEST_REPO:oldsha123"

export DEPLOY_READER_LIVE_ID_CMD="printf '%s\n' '$BASE_ID'"
export DEPLOY_READER_LIVE_SHA_CMD="printf '%s\n' 'oldsha123'"

deploy_reader_capture_baseline \
  && ok "baseline identity accepted" || bad "baseline identity refused"

docker tag "$TEST_REPO:build" "$TEST_REPO:prod"
deploy_reader_stage_candidate "ffffffffffffffffffffffffffffffffffffffff" "newsha456" \
  && ok "candidate staged without cutover" || bad "candidate staging failed"

[ "$(deploy_reader_image_id "$TEST_REPO:prod")" = "$BASE_ID" ] \
  && ok ":prod restored to live image after prepare" || bad ":prod not restored"
[ "$(deploy_reader_image_id "$TEST_REPO:current")" = "$BASE_ID" ] \
  && ok ":current remained live image after prepare" || bad ":current moved during prepare"
[ "$(deploy_reader_image_id "$TEST_REPO:candidate-newsha456")" = "$NEW_ID" ] \
  && ok "candidate immutable tag points at built image" || bad "candidate tag wrong"
[ "$(deploy_reader_image_id "$TEST_REPO:newsha456")" = "$NEW_ID" ] \
  && ok "candidate SHA tag points at built image" || bad "SHA tag wrong"
grep -q '^baseline_live_sha=oldsha123$' "$DEPLOY_PREPARED_RECORD" \
  && ok "prepared record freezes rollback SHA" || bad "rollback SHA absent from record"

deploy_reader_verify_prepared "ffffffffffffffffffffffffffffffffffffffff" "newsha456" \
  && ok "unchanged prepared/live/rollback custody accepted" || bad "valid prepared custody refused"

if deploy_reader_verify_prepared "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" "wrongsha" >/dev/null 2>&1; then
  bad "wrong asserted target was accepted"
else
  ok "wrong asserted target refused"
fi

export DEPLOY_READER_LIVE_SHA_CMD="printf '%s\n' 'someoneelse'"
if deploy_reader_verify_prepared "ffffffffffffffffffffffffffffffffffffffff" "newsha456" >/dev/null 2>&1; then
  bad "live SHA movement after prepare was accepted"
else
  ok "live SHA movement after prepare refused"
fi
export DEPLOY_READER_LIVE_SHA_CMD="printf '%s\n' 'oldsha123'"

docker tag "$TEST_REPO:base" "$TEST_REPO:candidate-newsha456"
if deploy_reader_verify_prepared "ffffffffffffffffffffffffffffffffffffffff" "newsha456" >/dev/null 2>&1; then
  bad "candidate image movement was accepted"
else
  ok "candidate image movement refused"
fi
docker tag "$TEST_REPO:build" "$TEST_REPO:candidate-newsha456"

deploy_reader_verify_prepared "ffffffffffffffffffffffffffffffffffffffff" "newsha456"
deploy_reader_promote_prepared "newsha456" \
  && ok "verified candidate role promotion succeeds" || bad "role promotion failed"

[ "$(deploy_reader_image_id "$TEST_REPO:previous")" = "$BASE_ID" ] \
  && ok ":previous freezes old live image" || bad ":previous wrong"
[ "$(deploy_reader_image_id "$TEST_REPO:current")" = "$NEW_ID" ] \
  && ok ":current points at prepared candidate" || bad ":current wrong"
[ "$(deploy_reader_image_id "$TEST_REPO:prod")" = "$NEW_ID" ] \
  && ok ":prod points at prepared candidate" || bad ":prod wrong"

SRC="$(cat "$SCRIPT_DIR/pre-deploy-gate.sh")"
PREP="$(awk '/^cmd_prepare_maia\(\)/,/^}/' "$SCRIPT_DIR/pre-deploy-gate.sh")"
LEGACY="$(awk '/^cmd_deploy_maia\(\)/,/^}/' "$SCRIPT_DIR/pre-deploy-gate.sh")"

if grep -q 'up -d' <<<"$PREP"; then
  bad "prepare function contains live recreate"
else
  ok "prepare contains no live recreate"
fi
grep -q 'Combined deploy-maia is retired' <<<"$LEGACY" \
  && ok "legacy combined deploy path fails closed" || bad "legacy combined path not retired"
grep -q 'deploy_reader_verify_prepared' <<<"$SRC" \
  && ok "cutover re-proves prepared custody" || bad "cutover lacks custody verification"

qcount="$(grep -c 'gate_quick_lane_no_pending_migrations' <<<"$SRC")"
[ "${qcount:-0}" -ge 3 ] \
  && ok "prepare + cutover retain zero-drift migration refusal" || bad "migration refusal missing"

echo
echo "[selftest] Results: $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ]
