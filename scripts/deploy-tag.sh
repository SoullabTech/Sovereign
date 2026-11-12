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

    # If there's already a :current, move it to :previous — UNLESS :current is the
    # same commit being deployed again. A same-commit redeploy must not rotate the
    # rollback point: on 2026-10-01 two redeploys of RC1 03f0fd3ab moved :previous
    # onto an RC1 rebuild, so `rollback` would have swapped RC1 for RC1 while the
    # real pre-RC1 image survived only as its SHA tag.
    if docker image inspect "$repo:current" >/dev/null 2>&1; then
        local current_commit
        current_commit="$(docker image inspect "$repo:current" \
            --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null \
            | sed -n 's/^GIT_COMMIT=//p' | head -n1 | tr -d '[:space:]')"
        if [ -n "$current_commit" ] && [ "$current_commit" != "unknown" ] \
            && { [ "${current_commit#"$sha"}" != "$current_commit" ] || [ "${sha#"$current_commit"}" != "$sha" ]; }; then
            echo "[deploy-tag] :current is already commit $current_commit (same-commit redeploy) — keeping :previous as the last DIFFERENT commit." >&2
        else
            echo "[deploy-tag] Preserving current image as :previous for rollback..." >&2
            docker tag "$repo:current" "$repo:previous" 2>/dev/null || true
        fi
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

# ───────────────────────────────────────────────────────────────────────────────
# :prod guard — a deploy refused before the swap must not leave :prod moved.
#
# :prod is the compose image name (docker-compose.production.yml x-maia-image), so
# `compose build` repoints it at the candidate BEFORE the migration review gate,
# the migration run and the image verify. On 2026-11-11 a deploy of 3555668f5 was
# refused at the gate, yet :prod stayed on the unswapped candidate. Any later
# `docker compose up` (e.g. an env-change recreate) would then have started an
# unreviewed build whose migrations never ran.
#
# Arm immediately before the build; disarm immediately before the swap (from then
# on the candidate is the legitimate :prod). prod_tag_guard_restore runs from the
# deploy-context EXIT handler: if still armed, it restores :prod to the image it
# had before the build and keeps the candidate as :refused-<sha> for evidence.
# Best effort and loud; it never changes the deploy's exit status.
# ───────────────────────────────────────────────────────────────────────────────
_DEPLOY_PROD_PRIOR_ID=""
_DEPLOY_PROD_GUARD_ARMED=""
_DEPLOY_PROD_CANDIDATE_SHA=""

prod_tag_guard_arm() {
    _DEPLOY_PROD_CANDIDATE_SHA="${1:-unknown}"
    _DEPLOY_PROD_PRIOR_ID="$(docker image inspect "$MAIA_IMAGE_REPO:prod" --format '{{.Id}}' 2>/dev/null || true)"
    _DEPLOY_PROD_GUARD_ARMED=1
}

prod_tag_guard_disarm() {
    _DEPLOY_PROD_GUARD_ARMED=""
}

prod_tag_guard_restore() {
    [ -n "$_DEPLOY_PROD_GUARD_ARMED" ] || return 0
    _DEPLOY_PROD_GUARD_ARMED=""
    local repo="$MAIA_IMAGE_REPO" now
    now="$(docker image inspect "$repo:prod" --format '{{.Id}}' 2>/dev/null || true)"
    [ "$now" = "$_DEPLOY_PROD_PRIOR_ID" ] && return 0
    if [ -n "$now" ]; then
        docker tag "$repo:prod" "$repo:refused-$_DEPLOY_PROD_CANDIDATE_SHA" 2>/dev/null || true
    fi
    if [ -n "$_DEPLOY_PROD_PRIOR_ID" ]; then
        if docker tag "$_DEPLOY_PROD_PRIOR_ID" "$repo:prod" 2>/dev/null; then
            echo "[deploy-tag] Deploy ended before the swap: restored :prod to its pre-build image; the candidate is kept as :refused-$_DEPLOY_PROD_CANDIDATE_SHA." >&2
        else
            echo "[deploy-tag] WARNING: could not restore :prod to $_DEPLOY_PROD_PRIOR_ID — :prod may point at an unswapped, unreviewed candidate. Fix before any 'docker compose up'." >&2
        fi
    elif [ -n "$now" ]; then
        docker image rm "$repo:prod" >/dev/null 2>&1 || true
        echo "[deploy-tag] Deploy ended before the swap with no prior :prod; untagged the candidate (kept as :refused-$_DEPLOY_PROD_CANDIDATE_SHA)." >&2
    fi
    return 0
}
