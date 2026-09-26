#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Self-test for scripts/deploy-tag.sh (tagging post-condition + prune retention)
# ═══════════════════════════════════════════════════════════════════════════════
# Simulates the deploy tagging flow against a throwaway image repo and asserts:
#
#   A. Happy path — only the newest RETAIN_SHA_TAGS <sha> tags survive; a SHA
#      tag older than the window survives anyway when its image ID matches
#      :current or :previous; role tags (:prod/:current/:previous) are untouched.
#   B. The just-deployed SHA tag is exempt from pruning BY NAME — it survives
#      even when it is the OLDEST image and its image ID matches nothing
#      protected. (Regression: image .Created is a proxy for deploy recency and
#      is wrong for cache-hit rebuilds, where the new build's image predates
#      every other tag.)
#   C. Tagging is fail-closed — tag_images_for_rollback returns NON-ZERO when it
#      cannot leave a per-commit referent behind, instead of logging an intent
#      and finishing green. (Regression for 2026-08-06: a deploy logged
#      "Tagging new image as :current and :ac5e4b981..." and exited 0 with no
#      such tag, because `docker tag` failures were discarded and never checked.)
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

has_tag() { docker image inspect "$TEST_REPO:$1" >/dev/null 2>&1; }

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "[A] Happy path: sha1 (old, prunable) · sha2 = :current (live) · new build = :prod"
mint_image "sha1"
mint_image "sha2"
docker tag "$TEST_REPO:sha2" "$TEST_REPO:current"
mint_image "prod"

echo "[A] Running tag_images_for_rollback sha3 with RETAIN_SHA_TAGS=$RETAIN_SHA_TAGS ..."
tag_images_for_rollback "sha3"
# Expected: :current→:previous moved sha2's image to :previous; :prod became
# :current + :sha3. Prune keeps the deployed sha3; sha2 survives via :previous
# protection; sha1 is removed by name.

echo "[A] Asserting outcomes:"
has_tag sha3     && ok "sha3 kept (the deployed commit)"                      || fail "sha3 missing"
has_tag sha2     && ok "sha2 kept (older than window, but matches :previous)" || fail "sha2 was pruned despite matching :previous"
! has_tag sha1   && ok "sha1 pruned (stale, no protection)"                   || fail "sha1 survived — retention did not fire"
has_tag prod     && ok ":prod untouched"                                      || fail ":prod removed"
has_tag current  && ok ":current untouched"                                   || fail ":current removed"
has_tag previous && ok ":previous untouched"                                  || fail ":previous removed"

cur_id="$(docker image inspect "$TEST_REPO:current"  --format '{{.Id}}')"
new_id="$(docker image inspect "$TEST_REPO:sha3"     --format '{{.Id}}')"
prev_id="$(docker image inspect "$TEST_REPO:previous" --format '{{.Id}}')"
old_id="$(docker image inspect "$TEST_REPO:sha2"     --format '{{.Id}}')"
[ "$cur_id" = "$new_id" ]  && ok ":current points at the new build"         || fail ":current mispointed"
[ "$prev_id" = "$old_id" ] && ok ":previous points at the prior live image" || fail ":previous mispointed"

# ─────────────────────────────────────────────────────────────────────────────
cleanup
echo ""
echo "[B] Cache-hit rebuild: the deployed SHA is the OLDEST image and protected by nothing but its name"
# deployed_sha is minted FIRST (oldest .Created — what a fully cached rebuild
# produces), then two newer, unrelated SHA tags. :current/:previous deliberately
# point at those OTHER images, so the image-ID protections cannot rescue it.
mint_image "deployed_sha"
mint_image "newer_a"
mint_image "newer_b"
docker tag "$TEST_REPO:newer_a" "$TEST_REPO:previous"
docker tag "$TEST_REPO:newer_b" "$TEST_REPO:current"

echo "[B] Running prune_old_sha_tags deployed_sha with RETAIN_SHA_TAGS=$RETAIN_SHA_TAGS ..."
prune_old_sha_tags "deployed_sha"

echo "[B] Asserting outcomes:"
has_tag deployed_sha && ok "deployed_sha kept — exempt by name despite being the oldest image" \
                     || fail "deployed_sha PRUNED — the deployed commit lost its rollback referent"
has_tag newer_b      && ok "newer_b kept (matches :current)"  || fail "newer_b pruned despite matching :current"
has_tag newer_a      && ok "newer_a kept (matches :previous)" || fail "newer_a pruned despite matching :previous"

# ─────────────────────────────────────────────────────────────────────────────
cleanup
echo ""
echo "[C] Fail-closed tagging: the function must refuse rather than report a tag it did not create"

if tag_images_for_rollback "" 2>/dev/null; then
    fail "empty SHA accepted — a deploy with no per-commit referent was allowed"
else
    ok "empty SHA refused (non-zero)"
fi

if tag_images_for_rollback "sha_no_prod" 2>/dev/null; then
    fail "missing :prod accepted — tagged nothing and reported success"
else
    ok "missing :prod refused (non-zero)"
fi

# A tag name docker cannot create: exercises the post-condition on the exact
# shape of the 2026-08-06 failure — :prod exists, :current tags fine, the
# per-commit tag does not get created.
mint_image "prod"
if tag_images_for_rollback "in valid" 2>/dev/null; then
    fail "uncreatable :<sha> tag accepted — deploy would have continued with no rollback referent"
else
    ok "uncreatable :<sha> tag refused (non-zero) — post-condition caught it"
fi

echo ""
echo "[selftest] Results: $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ]
