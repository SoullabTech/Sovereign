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

tag_images_for_rollback() {
    local sha="$1"

    # If there's already a :current, move it to :previous
    if docker image inspect maia-sovereign:current >/dev/null 2>&1; then
        echo "[deploy-tag] Preserving current image as :previous for rollback..." >&2
        docker tag maia-sovereign:current maia-sovereign:previous 2>/dev/null || true
    fi

    # Tag the new build as :current and with its SHA
    echo "[deploy-tag] Tagging new image as :current and :$sha..." >&2
    docker tag maia-sovereign:prod maia-sovereign:current 2>/dev/null || true
    docker tag maia-sovereign:prod "maia-sovereign:$sha" 2>/dev/null || true
}
