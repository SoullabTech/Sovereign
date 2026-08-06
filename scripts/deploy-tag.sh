#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Rollback tagging — shared by every deploy entry point
# ═══════════════════════════════════════════════════════════════════════════════
# Keeps maia-sovereign:current / :previous / :<sha> pointing at the truth.
# On 2026-07-10 an out-of-lane deploy skipped this step and left :current
# pointing at the WRONG image — a miswired recovery path that only shows up
# the day a rollback is needed. Tagging now lives here, sourced by BOTH
# scripts/deploy-production.sh and scripts/pre-deploy-gate.sh, so the quick
# maia-only path refreshes rollback tags too (structure, not discipline).
#
# Call AFTER `docker compose build` and BEFORE `up -d`:
#
#   tag_images_for_rollback "$GIT_COMMIT"
#
# ── 2026-08-06: the announcement is not the act ───────────────────────────────
# A deploy of ac5e4b981 logged "Tagging new image as :current and :ac5e4b981..."
# and finished green, yet no maia-sovereign:ac5e4b981 tag existed afterwards.
# The prune log line ("kept newest 3, removed 1") was read as the culprit; it
# was not. The prune CANNOT remove the tag it was just handed — that tag's image
# is :current at that moment, and the image-ID protection below covers it. The
# three surviving SHA tags were exactly `kept newest 3`, i.e. the new tag was
# never a member of the set: `docker tag` had failed, and BOTH its stderr and
# its exit status were discarded (`2>/dev/null || true`) while the log line —
# printed BEFORE the command and never checked against reality — still claimed
# success. A deploy reported a fulfilled contract it had not fulfilled.
#
# So this file now enforces three things structurally:
#   1. Tag failures are LOUD (stderr kept, exit status inspected).
#   2. The per-commit referent is ASSERTED after tagging. No :<sha> tag → the
#      function fails, and under the callers' `set -e` the deploy stops BEFORE
#      `up -d`. The running container is untouched; a deploy that cannot leave
#      a rollback referent behind does not get to swap silently.
#   3. The just-deployed SHA is EXPLICITLY exempt from pruning — passed in by
#      name rather than protected as a side effect of pointing at :current.
# ═══════════════════════════════════════════════════════════════════════════════

# ── Retention contract (RETAIN_SHA_TAGS) ─────────────────────────────────────
# Meaning: an upper BOUND on rollback-tag growth, not an exact count.
#
#   * The <sha> just deployed is NEVER pruned. It is exempt by name, it is
#     always ranked first, and it always occupies a retention slot. This is the
#     deploy contract's per-commit rollback referent — it outranks retention.
#   * Beyond that, the newest RETAIN_SHA_TAGS-1 remaining <sha> tags survive,
#     ranked by image creation time.
#   * Any <sha> tag whose image ID matches :current or :previous survives
#     regardless of age. A rollback image is IDENTIFIED by its SHA tag; pruning
#     that tag would delete the name of the thing we roll back to.
#
# Consequence: MORE than RETAIN_SHA_TAGS tags may legitimately survive. Do NOT
# "fix" that by pruning to an exact N — the protections are the point.
# Ranking note: image .Created is a PROXY for deploy recency and can be wrong
# (a fully cache-hit rebuild yields an image whose .Created predates the
# deploy, and several tags can share one image and thus one timestamp). That
# proxy is acceptable for ordering the older tags, and is deliberately NOT
# relied on for the tag that matters — see rule 1 above.
# Why any of this exists: each image is ~35-42 GB; on 2026-07-12 nineteen stale
# SHA tags filled minisforum's 937 GB disk to 100% and broke an in-flight deploy
# at metadata write.
RETAIN_SHA_TAGS="${RETAIN_SHA_TAGS:-3}"

# Repo name is overridable ONLY so the prune logic can be simulated against a
# throwaway repo (see scripts/verify-deploy-tag-prune.sh); production always
# uses the default.
MAIA_IMAGE_REPO="${MAIA_IMAGE_REPO:-maia-sovereign}"

tag_images_for_rollback() {
    local sha="$1"
    local repo="$MAIA_IMAGE_REPO"

    if [ -z "$sha" ]; then
        echo "[deploy-tag] ERROR: no commit SHA passed to tag_images_for_rollback." >&2
        echo "[deploy-tag]        Refusing to tag — a deploy with no per-commit referent is not rollback-able." >&2
        return 1
    fi

    # The source of every tag below. If the build did not produce it, nothing
    # downstream is trustworthy — say so here rather than three silent `|| true`s later.
    if ! docker image inspect "$repo:prod" >/dev/null 2>&1; then
        echo "[deploy-tag] ERROR: $repo:prod does not exist — the build did not produce the expected image." >&2
        echo "[deploy-tag]        Expected image name comes from docker-compose.production.yml (x-maia-image)." >&2
        return 1
    fi

    # If there's already a :current, move it to :previous
    if docker image inspect "$repo:current" >/dev/null 2>&1; then
        echo "[deploy-tag] Preserving current image as :previous for rollback..." >&2
        docker tag "$repo:current" "$repo:previous" \
            || echo "[deploy-tag] WARNING: failed to move :current → :previous — one-step rollback may be unavailable." >&2
    fi

    # Tag the new build as :current and with its SHA. Failures are surfaced, not
    # swallowed — this log line describes an INTENT, and the assertion below is
    # what turns it into a claim.
    echo "[deploy-tag] Tagging new image as :current and :$sha ..." >&2
    docker tag "$repo:prod" "$repo:current" \
        || echo "[deploy-tag] WARNING: failed to tag $repo:current." >&2
    docker tag "$repo:prod" "$repo:$sha" \
        || echo "[deploy-tag] WARNING: failed to tag $repo:$sha." >&2

    # Post-condition — the contract in CLAUDE.md ("tags images per-commit for
    # rollback") is verified, not assumed. Fail-closed: callers run under
    # `set -e`, so this stops the deploy before `up -d`.
    if ! docker image inspect "$repo:$sha" >/dev/null 2>&1; then
        echo "[deploy-tag] ERROR: $repo:$sha was NOT created — the per-commit rollback referent is missing." >&2
        echo "[deploy-tag]        Rollback-by-SHA and reproducible preview containers both depend on it;" >&2
        echo "[deploy-tag]        :current/:prod are mutable and image IDs are host-local, so neither substitutes." >&2
        echo "[deploy-tag]        Refusing to continue the deploy. The running container is untouched." >&2
        return 1
    fi
    echo "[deploy-tag] Verified $repo:$sha exists (per-commit rollback referent)." >&2

    # Retention — a prune failure must never block the deploy, but it must be loud.
    prune_old_sha_tags "$sha" \
        || echo "[deploy-tag] WARNING: SHA-tag prune failed — stale rollback tags may be accumulating (disk pressure)." >&2

    return 0
}

# Bound the number of <sha> tags. Role tags (:prod/:current/:previous) are
# excluded from the listing. Protected from removal, in order of authority:
#   1. $1 — the SHA just deployed (exempt by NAME; ranked first; never pruned)
#   2. any SHA tag whose image ID matches :current or :previous
#   3. any SHA tag whose image ID matches the just-deployed SHA's image
# Every removed tag is named in the log (irreversible command → name the target).
# Scope note: this bounds ROLLBACK-TAG growth only. Removing a tag does not
# necessarily reclaim disk (shared layers, build cache, dangling images stay);
# the pre-deploy disk gate is the backstop for total storage. Deliberately no
# `docker system prune` here — broad reclaim needs explicit authorization,
# never a quiet side effect of deploying.
prune_old_sha_tags() {
    local repo="$MAIA_IMAGE_REPO"
    local retain="$RETAIN_SHA_TAGS"
    local protect_tag="${1:-}"

    local current_id previous_id protect_id
    current_id="$(docker image inspect "$repo:current" --format '{{.Id}}' 2>/dev/null || true)"
    previous_id="$(docker image inspect "$repo:previous" --format '{{.Id}}' 2>/dev/null || true)"
    protect_id=""
    if [ -n "$protect_tag" ]; then
        protect_id="$(docker image inspect "$repo:$protect_tag" --format '{{.Id}}' 2>/dev/null || true)"
    fi

    local tags
    tags="$(docker images "$repo" --format '{{.Tag}}' 2>/dev/null \
        | grep -vE '^(prod|current|previous|<none>)$' || true)"
    if [ -z "$tags" ]; then
        return 0
    fi

    # One "<created>\t<tag>" line per SHA tag; .Created is RFC3339, so a plain
    # reverse lexical sort orders newest-first. The just-deployed tag is NOT
    # ordered this way: it is prepended, because we KNOW it is the newest deploy
    # and must not depend on .Created (cache-hit rebuilds carry an old
    # timestamp, and tags sharing an image share a timestamp).
    local lines tag created
    lines="$(for tag in $tags; do
        [ "$tag" = "$protect_tag" ] && continue
        created="$(docker image inspect "$repo:$tag" --format '{{.Created}}' 2>/dev/null || true)"
        [ -n "$created" ] && printf '%s\t%s\n' "$created" "$tag"
    done | sort -r)"
    if [ -n "$protect_tag" ] && docker image inspect "$repo:$protect_tag" >/dev/null 2>&1; then
        lines="$(printf 'DEPLOYED\t%s\n%s\n' "$protect_tag" "$lines")"
    fi

    local kept=0 removed=0 image_id
    while IFS=$'\t' read -r created tag; do
        [ -z "$tag" ] && continue
        # The deploy's own tag is never a prune candidate, at any rank.
        if [ -n "$protect_tag" ] && [ "$tag" = "$protect_tag" ]; then
            kept=$((kept + 1))
            continue
        fi
        if [ "$kept" -lt "$retain" ]; then
            kept=$((kept + 1))
            continue
        fi
        image_id="$(docker image inspect "$repo:$tag" --format '{{.Id}}' 2>/dev/null || true)"
        if [ -n "$image_id" ] && { [ "$image_id" = "$current_id" ] || [ "$image_id" = "$previous_id" ] || [ "$image_id" = "$protect_id" ]; }; then
            echo "[deploy-tag] Keeping $repo:$tag — image ID matches :current/:previous/the deployed commit." >&2
            continue
        fi
        echo "[deploy-tag] Pruning stale rollback tag: $repo:$tag (created $created)" >&2
        if docker rmi "$repo:$tag" >/dev/null 2>&1; then
            removed=$((removed + 1))
        else
            echo "[deploy-tag] WARNING: failed to remove $repo:$tag (in use by a container?)" >&2
        fi
    done <<< "$lines"

    echo "[deploy-tag] SHA-tag retention: kept newest $kept, removed $removed (RETAIN_SHA_TAGS=$retain)." >&2
    return 0
}
