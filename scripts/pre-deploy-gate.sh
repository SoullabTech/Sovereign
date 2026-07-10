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
#
# ── Escape hatches (explicit, loud, never silent) ─────────────────────────────
#   FIRST_DEPLOY=1        — allow Co-Lab gate to skip when no container exists yet
#   COLAB_VERIFIER_CMD    — override the verifier command (used by the gate's own
#                           self-test; also lets you run against a local DB)
#   MIN_COLAB_CHECKS=31   — floor on passing checks (raise when new checks ship)
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Deploy lane lock — deploy-maia serializes on $PROJECT_DIR/.deploy.lock so a
# second concurrent deploy is refused, not raced (see scripts/deploy-lock.sh).
source "$SCRIPT_DIR/deploy-lock.sh"

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

# deploy-maia — the mechanized replacement for the quick maia-only command.
# Runs both gates, then execs the build with a validated, EXPORTED GIT_COMMIT so
# the operator can no longer forget the prefix. Uses --force-recreate --no-deps
# to force the container swap (per feedback_deploy_container_provenance_gate).
cmd_deploy_maia() {
    # Lock BEFORE the gates: the whole deploy attempt (verify + build) is one
    # serialized lane occupancy. The fd-9 flock survives the `exec` below, so
    # the lock is held until docker compose itself finishes.
    acquire_deploy_lock "pre-deploy-gate.sh deploy-maia"
    local sha
    sha="$(gate_all)"
    export GIT_COMMIT="$sha"
    log_info "Building maia at $GIT_COMMIT (--force-recreate --no-deps) ..."
    exec docker compose -p maia-sovereign \
        -f "$PROJECT_DIR/docker-compose.production.yml" \
        --env-file "$PROJECT_DIR/.env.production" \
        up -d --build --force-recreate --no-deps maia
}

case "${1:-help}" in
    provenance) gate_provenance ;;
    colab)      gate_colab ;;
    all)        gate_all >/dev/null ;;   # SHA already logged to stderr; suppress stdout echo
    deploy-maia) cmd_deploy_maia ;;
    *)
        echo "Pre-Deploy Gate — Construction Gate as structure, not discipline"
        echo ""
        echo "Usage: $0 <provenance|colab|all|deploy-maia>"
        echo ""
        echo "  provenance   Validate GIT_COMMIT (never unknown/empty); echo resolved SHA"
        echo "  colab        Run Co-Lab boundary verifier; block unless 31/31 · 0 failed · 0 warned"
        echo "  all          Run both gates (no build)"
        echo "  deploy-maia  Run both gates, then quick maia-only build with validated GIT_COMMIT"
        exit 0
        ;;
esac
