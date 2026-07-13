#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Self-test for prune_old_sha_tags (scripts/deploy-tag.sh)
# ═══════════════════════════════════════════════════════════════════════════════
# Simulates the deploy tagging flow against a throwaway image repo and asserts:
#   1. Only the newest RETAIN_SHA_TAGS <sha> tags survive the prune.
#   2. A SHA tag older than the retention window survives anyway when its image
#      ID matches :current or :previous (rollback safety).
#   3. Role tags (:prod/:current/:previous) are untouched.
#
# Uses `docker import` of an empty tarball to mint distinct images (distinct
# IDs + creation timestamps) with no network or base-image dependency. Never
# touches the real maia-sovereign repo — everything happens under $TEST_REPO.
#
# Run anywhere docker is available:  scripts/verify-deploy-tag-prune.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TEST_REPO="deploy-tag-prune-selftest"
export MAIA_IMAGE_REPO="$TEST_REPO"
export RETAIN_SHA_TAGS=1

source "$SCRIPT_DIR/deploy-tag.sh"

PASS=0; FAIL=0
ok()   { echo "  ok:   $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

cleanup() {
    local t
    for t in $(docker images "$TEST_REPO" --format '{{.Tag}}' 2>/dev/null); do
        docker rmi "$TEST_REPO:$t" >/dev/null 2>&1 || true
    done
}
trap cleanup EXIT
cleanup  # start clean in case a previous run died mid-test

mint_image() {  # mint_image <tag> — distinct image ID + creation time per call
    tar -cf - --files-from /dev/null | docker import - "$TEST_REPO:$1" >/dev/null
    sleep 1.1  # keep creation timestamps unambiguous for the sort
}

echo "[selftest] Setting up: sha1 (old, prunable) · sha2 = :current (live) · new build = :prod"
mint_image "sha1"
mint_image "sha2"
docker tag "$TEST_REPO:sha2" "$TEST_REPO:current"
mint_image "prod"

echo "[selftest] Running tag_images_for_rollback sha3 with RETAIN_SHA_TAGS=$RETAIN_SHA_TAGS ..."
tag_images_for_rollback "sha3"
# Expected: :current→:previous moved sha2's image to :previous; :prod became
# :current + :sha3. Prune keeps newest 1 (sha3); sha2 survives via :previous
# protection; sha1 is removed by name.

has_tag() { docker image inspect "$TEST_REPO:$1" >/dev/null 2>&1; }

echo "[selftest] Asserting outcomes:"
has_tag sha3     && ok "sha3 kept (newest, within RETAIN_SHA_TAGS)"        || fail "sha3 missing"
has_tag sha2     && ok "sha2 kept (older than window, but matches :previous)" || fail "sha2 was pruned despite matching :previous"
! has_tag sha1   && ok "sha1 pruned (stale, no protection)"                || fail "sha1 survived — retention did not fire"
has_tag prod     && ok ":prod untouched"                                   || fail ":prod removed"
has_tag current  && ok ":current untouched"                                || fail ":current removed"
has_tag previous && ok ":previous untouched"                               || fail ":previous removed"

cur_id="$(docker image inspect "$TEST_REPO:current"  --format '{{.Id}}')"
new_id="$(docker image inspect "$TEST_REPO:sha3"     --format '{{.Id}}')"
prev_id="$(docker image inspect "$TEST_REPO:previous" --format '{{.Id}}')"
old_id="$(docker image inspect "$TEST_REPO:sha2"     --format '{{.Id}}')"
[ "$cur_id" = "$new_id" ]  && ok ":current points at the new build" || fail ":current mispointed"
[ "$prev_id" = "$old_id" ] && ok ":previous points at the prior live image" || fail ":previous mispointed"

echo ""
echo "[selftest] Results: $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ]
