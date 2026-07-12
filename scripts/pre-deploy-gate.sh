#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Pre-Deploy Gate — Construction Gate as structure, not discipline
# ═══════════════════════════════════════════════════════════════════════════════
# Mechanizes two deploy-discipline checks that were previously operator-remembered
# steps, so a deploy that would violate them is *refused* rather than merely
# discouraged (the same move the FK refusal made at the schema layer).
#
# This realizes Phase 3 (Verification) of the four-phase deploy constitution
# (Quiet Field → Build → Verification → Recognition) as a PRE-build refusal:
#
#   Gate 1 — Provenance : GIT_COMMIT must resolve to a real short SHA, never
#             "unknown"/empty. The quick maia-only compose command bakes
#             GIT_COMMIT=unknown unless prefixed; this gate makes that
#             structurally impossible (see feedback_deploy_container_provenance_gate).
#
#   Gate 2 — Co-Lab boundaries : the boundary verifier must pass 31/31 with
#             0 failed and 0 warned. Previously a manual "before tester waves"
#             step; now a hard precondition of the deploy path itself
#             (see docs/ops/COLAB_RELEASE_GATE.md).
#
# ── Usage ──────────────────────────────────────────────────────────────────────
#   scripts/pre-deploy-gate.sh provenance     # validate + echo resolved SHA (stdout)
#   scripts/pre-deploy-gate.sh colab          # run boundary verifier, block on fail
#   scripts/pre-deploy-gate.sh all            # both gates, no build
#   scripts/pre-deploy-gate.sh deploy-maia    # both gates, then quick maia-only build
#                                               of whatever is currently checked out
#   scripts/pre-deploy-gate.sh deploy-maia-at [<branch>]
#                                             # acquire the lane lock FIRST, then
#                                               fetch/checkout/reset to origin/<branch>
#                                               (default clean-main-no-secrets) INSIDE
#                                               the lock, then gates + build + swap.
#                                               This is the canonical quick deploy:
#                                               the checkout mutation can never move
#                                               under another holder's in-flight build
#                                               (2026-07-12 contention hole).
#
# ── Escape hatches (explicit, loud, never silent) ─────────────────────────────
#   FIRST_DEPLOY=1        — allow Co-Lab gate to skip when no container exists yet
#   COLAB_VERIFIER_CMD    — override the verifier command (used by the gate's own
#                           self-test; also lets you run against a local DB)
#   MIN_COLAB_CHECKS=31   — floor on passing checks (raise when new checks ship)
#   DEPLOY_SYNC_FORCE=1   — let deploy-maia-at discard a DIRTY deploy checkout
#                           (default is to refuse: a dirty prod checkout means
#                           someone hand-edited it — inspect before discarding)
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Deploy lane lock — deploy-maia serializes on $PROJECT_DIR/.deploy.lock so a
# second concurrent deploy is refused, not raced (see scripts/deploy-lock.sh).
source "$SCRIPT_DIR/deploy-lock.sh"

# Rollback tagging — shared with deploy-production.sh so the quick path keeps
# maia-sovereign:current/:previous/:<sha> truthful too (see scripts/deploy-tag.sh;
# the 2026-07-10 out-of-lane deploy left :current pointing at the wrong image).
source "$SCRIPT_DIR/deploy-tag.sh"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

# All human-facing logging goes to STDERR so that `provenance` can emit the bare
# SHA on STDOUT for command substitution.
log_info()    { echo -e "${BLUE}[gate]${NC} $1" >&2; }
log_ok()      { echo -e "${GREEN}[gate:ok]${NC} $1" >&2; }
log_warn()    { echo -e "${YELLOW}[gate:warn]${NC} $1" >&2; }
log_block()   { echo -e "${RED}[gate:BLOCK]${NC} $1" >&2; }

MIN_COLAB_CHECKS="${MIN_COLAB_CHECKS:-31}"
CONTAINER="${MAIA_CONTAINER:-maia-sovereign}"

# ───────────────────────────────────────────────────────────────────────────────
# Gate 1 — Provenance
# Resolve GIT_COMMIT (env override wins, else git). Refuse empty / "unknown".
# On success: echo the resolved SHA to STDOUT (only), exit 0.
# ───────────────────────────────────────────────────────────────────────────────
gate_provenance() {
    local sha="${GIT_COMMIT:-}"
    if [ -z "$sha" ]; then
        sha="$(git -C "$PROJECT_DIR" rev-parse --short HEAD 2>/dev/null || true)"
    fi

    if [ -z "$sha" ] || [ "$sha" = "unknown" ]; then
        log_block "GIT_COMMIT resolves to '${sha:-<empty>}' — refusing to bake unprovenanced image."
        log_block "A deploy with GIT_COMMIT=unknown cannot be traced back to a commit."
        log_block "Run from a git checkout, or export a real short SHA before deploying."
        return 1
    fi

    log_ok "Provenance: GIT_COMMIT = $sha"
    echo "$sha"
    return 0
}

# ───────────────────────────────────────────────────────────────────────────────
# Gate 2 — Co-Lab boundaries (31/31 · 0 failed · 0 warned)
# Runs the boundary verifier and blocks unless the pass condition holds.
# The hard invariant is: passed >= MIN_COLAB_CHECKS AND failed==0 AND warned==0
# AND the verifier exited 0. (A verifier that silently drops checks — e.g.
# 20 passed · 0 failed · 0 warned — is ALSO a block: the floor catches regressions
# where checks disappear rather than fail.)
# ───────────────────────────────────────────────────────────────────────────────
gate_colab() {
    local cmd
    if [ -n "${COLAB_VERIFIER_CMD:-}" ]; then
        cmd="$COLAB_VERIFIER_CMD"
    elif docker exec "$CONTAINER" true >/dev/null 2>&1; then
        # Default: run inside the running production container (pg is available there).
        cmd="docker exec $CONTAINER sh -c 'DATABASE_URL=\"\$DATABASE_URL\" npx tsx scripts/verify-constitution-colab.ts'"
    else
        if [ "${FIRST_DEPLOY:-0}" = "1" ]; then
            log_warn "Container '$CONTAINER' not running and FIRST_DEPLOY=1 — skipping Co-Lab gate."
            log_warn "Post-deploy smoke tests will still run the boundary gate against the new container."
            return 0
        fi
        log_block "Container '$CONTAINER' is not running — cannot verify Co-Lab boundaries pre-deploy."
        log_block "If this is a genuine first-ever deploy, re-run with FIRST_DEPLOY=1."
        return 1
    fi

    log_info "Co-Lab boundaries: running verifier ..."
    local output exit_code=0
    output="$(eval "$cmd" 2>&1)" || exit_code=$?

    # Parse the verifier summary: "Results: X passed · Y failed · Z warned (...)"
    local summary passed failed warned
    summary="$(echo "$output" | grep -Eo '[0-9]+ passed · [0-9]+ failed · [0-9]+ warned' | tail -1 || true)"
    passed="$(echo "$summary"  | grep -Eo '^[0-9]+'            || echo '')"
    failed="$(echo "$summary"  | grep -Eo '· [0-9]+ failed'   | grep -Eo '[0-9]+' || echo '')"
    warned="$(echo "$summary"  | grep -Eo '· [0-9]+ warned'   | grep -Eo '[0-9]+' || echo '')"

    if [ -z "$summary" ]; then
        log_block "Could not parse a 'X passed · Y failed · Z warned' line from the verifier."
        log_block "Verifier exit code: $exit_code. Treating as a BLOCK (unverifiable)."
        echo "$output" | tail -20 >&2
        return 1
    fi

    log_info "Co-Lab boundaries: $summary (verifier exit $exit_code)"

    if [ "$exit_code" -ne 0 ] || [ "${failed:-1}" -ne 0 ] || [ "${warned:-1}" -ne 0 ]; then
        log_block "Co-Lab boundary gate FAILED — $summary (exit $exit_code)."
        log_block "Ownership / membership / scope invariants are not clean. Do not deploy or invite testers."
        return 1
    fi

    if [ "${passed:-0}" -lt "$MIN_COLAB_CHECKS" ]; then
        log_block "Co-Lab boundary gate FAILED — only $passed checks ran (floor is $MIN_COLAB_CHECKS)."
        log_block "Checks appear to have silently disappeared. This is a regression, not a pass."
        return 1
    fi

    log_ok "Co-Lab boundaries: $passed passed · 0 failed · 0 warned (floor $MIN_COLAB_CHECKS)"
    return 0
}

# ───────────────────────────────────────────────────────────────────────────────
# Composite + deploy driver
# ───────────────────────────────────────────────────────────────────────────────
gate_all() {
    local sha
    sha="$(gate_provenance)"   # exits non-zero (set -e) if provenance blocks
    gate_colab
    log_ok "All pre-deploy gates passed for $sha."
    echo "$sha"
}

# sync_repo_to_branch — move the deploy checkout to origin/<branch>, INSIDE the
# already-held lane lock. This closes the 2026-07-12 contention hole: the old
# canonical command ran `git pull` in the ssh line BEFORE this script executed,
# so session B's pull could advance the shared checkout while session A's build
# was still reading it as docker build context. Called only after
# acquire_deploy_lock, so the mutation is part of the serialized lane occupancy.
#
# `reset --hard origin/<branch>` (not `pull`) so a diverged local branch can't
# leave the tree somewhere other than origin's tip. Self-update is safe: git
# replaces files by unlinking + writing new inodes, so this running script keeps
# reading its pre-sync content from the open fd; the synced version runs next time.
sync_repo_to_branch() {
    local branch="$1"
    # -uno: only TRACKED modifications refuse — reset --hard never touches
    # untracked files, so they are not at risk and must not block the lane.
    if [ -n "$(git -C "$PROJECT_DIR" status --porcelain --untracked-files=no 2>/dev/null)" ]; then
        if [ "${DEPLOY_SYNC_FORCE:-0}" = "1" ]; then
            log_warn "Deploy checkout is DIRTY; DEPLOY_SYNC_FORCE=1 — discarding local changes."
        else
            log_block "Deploy checkout at $PROJECT_DIR is DIRTY — refusing to reset it."
            log_block "Someone hand-edited the deploy checkout; inspect before discarding:"
            log_block "  git -C $PROJECT_DIR status"
            log_block "Re-run with DEPLOY_SYNC_FORCE=1 to discard local changes deliberately."
            return 1
        fi
    fi
    log_info "Syncing checkout to origin/$branch (inside the deploy-lane lock) ..."
    git -C "$PROJECT_DIR" fetch origin "$branch" >&2
    git -C "$PROJECT_DIR" checkout "$branch" >&2
    git -C "$PROJECT_DIR" reset --hard "origin/$branch" >&2
    if [ -n "${GIT_COMMIT:-}" ]; then
        log_warn "Ignoring inherited GIT_COMMIT=$GIT_COMMIT — provenance resolves from the synced tree."
        unset GIT_COMMIT
    fi
    log_ok "Checkout now at $(git -C "$PROJECT_DIR" rev-parse --short HEAD) (origin/$branch)"
}

# Shared gate → build → tag → swap driver. Caller MUST already hold the lane
# lock. Runs both gates, builds with a validated, EXPORTED GIT_COMMIT (so the
# operator can no longer forget the prefix), refreshes the rollback tags, then
# swaps the container with --force-recreate --no-deps (per
# feedback_deploy_container_provenance_gate). Build and swap are separate steps
# (not one `up -d --build`) so :current/:previous move only after a successful
# build and BEFORE the new container starts — same ordering as
# deploy-production.sh.
run_gates_and_build() {
    local sha
    sha="$(gate_all)"
    export GIT_COMMIT="$sha"
    # Provenance is resolved AFTER any locked sync, from the tree actually being
    # built; refresh the lock-holder record so a refused second deploy names it.
    record_deploy_lock_commit "$sha"
    # DEPLOY_LANE_TOKEN was exported by acquire_deploy_lock — the compose
    # build arg the Dockerfile's deploy-lane tripwire requires.
    log_info "Building maia at $GIT_COMMIT ..."
    docker compose -p maia-sovereign \
        -f "$PROJECT_DIR/docker-compose.production.yml" \
        --env-file "$PROJECT_DIR/.env.production" \
        build maia
    tag_images_for_rollback "$GIT_COMMIT"
    log_info "Swapping maia container (--force-recreate --no-deps) ..."
    docker compose -p maia-sovereign \
        -f "$PROJECT_DIR/docker-compose.production.yml" \
        --env-file "$PROJECT_DIR/.env.production" \
        up -d --force-recreate --no-deps maia
}

# deploy-maia — gates + build of whatever is currently checked out. Performs NO
# repo mutation: use it when you have deliberately positioned the tree (e.g. a
# specific commit). Lock BEFORE the gates: the whole deploy attempt is one
# serialized lane occupancy; the fd-9 flock is inherited by every child, so the
# lock is held until docker compose itself finishes.
cmd_deploy_maia() {
    acquire_deploy_lock "pre-deploy-gate.sh deploy-maia"
    run_gates_and_build
}

# deploy-maia-at [<branch>] — the canonical quick deploy. Lock FIRST, then the
# repo-state mutation (fetch/checkout/reset) happens inside the critical
# section, then gates + build + tag + swap. A concurrent invocation is refused
# by acquire_deploy_lock BEFORE it can touch the working tree.
cmd_deploy_maia_at() {
    local branch="${1:-clean-main-no-secrets}"
    acquire_deploy_lock "pre-deploy-gate.sh deploy-maia-at $branch"
    sync_repo_to_branch "$branch"
    run_gates_and_build
}

case "${1:-help}" in
    provenance) gate_provenance ;;
    colab)      gate_colab ;;
    all)        gate_all >/dev/null ;;   # SHA already logged to stderr; suppress stdout echo
    deploy-maia) cmd_deploy_maia ;;
    deploy-maia-at) cmd_deploy_maia_at "${2:-}" ;;
    *)
        echo "Pre-Deploy Gate — Construction Gate as structure, not discipline"
        echo ""
        echo "Usage: $0 <provenance|colab|all|deploy-maia|deploy-maia-at [<branch>]>"
        echo ""
        echo "  provenance      Validate GIT_COMMIT (never unknown/empty); echo resolved SHA"
        echo "  colab           Run Co-Lab boundary verifier; block unless 31/31 · 0 failed · 0 warned"
        echo "  all             Run both gates (no build)"
        echo "  deploy-maia     Both gates, then quick maia-only build of the CURRENT checkout"
        echo "  deploy-maia-at  Lane lock FIRST, then fetch/checkout/reset to origin/<branch>"
        echo "                  (default clean-main-no-secrets) inside the lock, then gates+build."
        echo "                  Canonical quick deploy — never mutate the checkout outside it."
        exit 0
        ;;
esac
