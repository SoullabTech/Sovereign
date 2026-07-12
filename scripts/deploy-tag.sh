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
# ═══════════════════════════════════════════════════════════════════════════════

# Retention contract: keep the newest RETAIN_SHA_TAGS <sha> tags (by image
# creation time), while ALWAYS preserving any SHA tag whose image ID matches
# :current or :previous. This is a bound, not an exact count — more than N
# tags may legitimately survive when older tags point at protected rollback
# images. Do NOT "fix" that by pruning to an exact N; the protection is the
# point (a SHA tag is how a rollback image is identified).
# Why this exists: each image is ~35-42 GB; on 2026-07-12 nineteen stale SHA
# tags filled minisforum's 937 GB disk to 100% and broke an in-flight deploy
# at metadata write.
RETAIN_SHA_TAGS="${RETAIN_SHA_TAGS:-3}"

# Repo name is overridable ONLY so the prune logic can be simulated against a
# throwaway repo (see scripts/verify-deploy-tag-prune.sh); production always
# uses the default.
MAIA_IMAGE_REPO="${MAIA_IMAGE_REPO:-maia-sovereign}"

tag_images_for_rollback() {
    local sha="$1"
    local repo="$MAIA_IMAGE_REPO"

    # If there's already a :current, move it to :previous
    if docker image inspect "$repo:current" >/dev/null 2>&1; then
        echo "[deploy-tag] Preserving current image as :previous for rollback..." >&2
        docker tag "$repo:current" "$repo:previous" 2>/dev/null || true
    fi

    # Tag the new build as :current and with its SHA
    echo "[deploy-tag] Tagging new image as :current and :$sha..." >&2
    docker tag "$repo:prod" "$repo:current" 2>/dev/null || true
    docker tag "$repo:prod" "$repo:$sha" 2>/dev/null || true

    # Retention — a prune failure must never block the deploy, but it must be loud.
    prune_old_sha_tags \
        || echo "[deploy-tag] WARNING: SHA-tag prune failed — stale rollback tags may be accumulating (disk pressure)." >&2
}

# Remove all but the newest $RETAIN_SHA_TAGS <sha> tags. Role tags
# (:prod/:current/:previous) are excluded from the listing, and any SHA tag
# whose image ID matches :current or :previous is kept regardless of age.
# Every removed tag is named in the log (irreversible command → name the target).
# Scope note: this bounds ROLLBACK-TAG growth only. Removing a tag does not
# necessarily reclaim disk (shared layers, build cache, dangling images stay);
# the pre-deploy disk gate is the backstop for total storage. Deliberately no
# `docker system prune` here — broad reclaim needs explicit authorization,
# never a quiet side effect of deploying.
prune_old_sha_tags() {
    local repo="$MAIA_IMAGE_REPO"
    local retain="$RETAIN_SHA_TAGS"

    local current_id previous_id
    current_id="$(docker image inspect "$repo:current" --format '{{.Id}}' 2>/dev/null || true)"
    previous_id="$(docker image inspect "$repo:previous" --format '{{.Id}}' 2>/dev/null || true)"

    local tags
    tags="$(docker images "$repo" --format '{{.Tag}}' 2>/dev/null \
        | grep -vE '^(prod|current|previous|<none>)$' || true)"
    if [ -z "$tags" ]; then
        return 0
    fi

    # One "<created>\t<tag>" line per SHA tag; .Created is RFC3339, so a plain
    # reverse lexical sort orders newest-first.
    local lines tag created
    lines="$(for tag in $tags; do
        created="$(docker image inspect "$repo:$tag" --format '{{.Created}}' 2>/dev/null || true)"
        [ -n "$created" ] && printf '%s\t%s\n' "$created" "$tag"
    done | sort -r)"

    local kept=0 removed=0 image_id
    while IFS=$'\t' read -r created tag; do
        [ -z "$tag" ] && continue
        if [ "$kept" -lt "$retain" ]; then
            kept=$((kept + 1))
            continue
        fi
        image_id="$(docker image inspect "$repo:$tag" --format '{{.Id}}' 2>/dev/null || true)"
        if [ -n "$image_id" ] && { [ "$image_id" = "$current_id" ] || [ "$image_id" = "$previous_id" ]; }; then
            echo "[deploy-tag] Keeping $repo:$tag — image ID matches :current/:previous." >&2
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
