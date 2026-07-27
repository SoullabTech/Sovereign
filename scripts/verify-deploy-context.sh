#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Self-test for the immutable-SHA build context (scripts/deploy-context.sh)
# ═══════════════════════════════════════════════════════════════════════════════
# Proves the structural fix for the 2026-07-27 shared-checkout deploy incident:
# a deploy builds an explicitly named immutable commit, never whatever branch is
# checked out. Asserts, against a THROWAWAY git repo (no docker, no network):
#
#   1. Naming (Option 1)        — an empty ref is refused; a bogus ref is refused;
#                                 a real SHA resolves to full + short.
#   2. Immutability (Option 4)  — the materialized build context is the SHA's tree,
#                                 NOT the checked-out HEAD, and a concurrent
#                                 checkout after materialization cannot change it.
#   3. Dirty isolation (Opt 3)  — uncommitted files and unstaged edits in the
#                                 working tree CANNOT enter the materialized
#                                 context (subsumes the dirty-tree refusal: the
#                                 known `M Caddyfile` physically cannot be baked).
#   4. Stamping (Option 5)      — GIT_COMMIT is exported from the asserted SHA.
#   5. Refusal / ack            — no SHA is refused; DEPLOY_ALLOW_HEAD=1 builds the
#                                 committed tip (still the commit, not the dirt).
#   6. Post-swap verify (Opt 5) — a running GIT_COMMIT that matches passes; a
#                                 mismatch is caught loudly.
#
# Uses `git init` + a couple of commits to mint distinct immutable trees with no
# dependency on the real repo. Everything happens under a throwaway $ROOT.
#
# Run anywhere git is available:  scripts/verify-deploy-context.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ROOT="$(mktemp -d "${TMPDIR:-/tmp}/deploy-ctx-selftest.XXXXXX")"
REPO="$ROOT/repo"
export DEPLOY_CONTEXT_DIR="$ROOT/ctx"    # keep every materialized context under $ROOT
export DEPLOY_SOURCE_REPO="$REPO"        # resolve/archive from the throwaway repo
export PROJECT_DIR="$REPO"               # helper's default source repo

cleanup() { rm -rf "$ROOT"; }
trap cleanup EXIT

PASS=0; FAIL=0
ok()   { echo "  ok:   $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

git_repo() { git -C "$REPO" -c user.email=selftest@maia -c user.name=selftest "$@"; }

# ── Setup: a repo with two commits on one branch ───────────────────────────────
echo "[selftest] Setting up throwaway repo: commit1(marker=COMMIT_ONE) → commit2(marker=COMMIT_TWO)"
mkdir -p "$REPO"
git -C "$REPO" init -q
printf 'FROM scratch\n'        > "$REPO/Dockerfile"       # materialize's presence check
printf '{"version":"9.9.9"}\n' > "$REPO/package.json"
printf 'COMMIT_ONE\n'          > "$REPO/marker.txt"
git_repo add -A
git_repo commit -q -m "commit one"
FULL1="$(git -C "$REPO" rev-parse HEAD)"
SHORT1="$(git -C "$REPO" rev-parse --short HEAD)"

printf 'COMMIT_TWO\n' > "$REPO/marker.txt"
git_repo add -A
git_repo commit -q -m "commit two"
FULL2="$(git -C "$REPO" rev-parse HEAD)"
SHORT2="$(git -C "$REPO" rev-parse --short HEAD)"

source "$SCRIPT_DIR/deploy-context.sh"

# ── 1. Naming (Option 1) ───────────────────────────────────────────────────────
echo "[selftest] 1. Naming — empty/bogus refused, real SHA resolves"
rc=0; deploy_ctx_resolve_sha "" || rc=$?
[ "$rc" -eq 2 ] && ok "empty ref returns 'no name' (rc=2)" || fail "empty ref not distinguished (rc=$rc)"

rc=0; deploy_ctx_resolve_sha "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef" || rc=$?
[ "$rc" -eq 3 ] && ok "bogus ref refused (rc=3)" || fail "bogus ref not refused (rc=$rc)"

deploy_ctx_resolve_sha "$SHORT1"
[ "$DEPLOY_CTX_FULL_SHA"  = "$FULL1"  ] && ok "resolves full SHA"  || fail "full SHA wrong: $DEPLOY_CTX_FULL_SHA"
[ "$DEPLOY_CTX_SHORT_SHA" = "$SHORT1" ] && ok "resolves short SHA" || fail "short SHA wrong: $DEPLOY_CTX_SHORT_SHA"

# ── Dirty the working tree, with HEAD at commit2 ───────────────────────────────
# marker.txt edited (unstaged) + an untracked secret. This is the shape of the
# minisforum `M Caddyfile` — a build MUST NOT see any of it.
git -C "$REPO" checkout -q "$FULL2"
printf 'DIRTY-UNCOMMITTED\n' > "$REPO/marker.txt"
printf 'leaked\n'            > "$REPO/dirty-secret.txt"

# ── 2 + 3 + 4. Materialize commit1 while dirty & HEAD=commit2 ───────────────────
echo "[selftest] 2/3/4. Materialize $SHORT1 while HEAD=$SHORT2 and tree is dirty"
deploy_ctx_resolve_sha "$SHORT1"
deploy_ctx_materialize
CTX_B="$MAIA_BUILD_CONTEXT"
[ "$(cat "$CTX_B/marker.txt")" = "COMMIT_ONE" ] \
    && ok "context is commit1's tree, not HEAD(commit2) nor the dirty edit" \
    || fail "context marker='$(cat "$CTX_B/marker.txt")' (expected COMMIT_ONE)"
[ ! -e "$CTX_B/dirty-secret.txt" ] \
    && ok "untracked working-tree file did NOT enter the context (dirty isolation)" \
    || fail "untracked file leaked into the build context"
[ "${GIT_COMMIT:-}" = "$SHORT1" ] \
    && ok "GIT_COMMIT stamped from asserted SHA ($SHORT1)" \
    || fail "GIT_COMMIT='$GIT_COMMIT' (expected $SHORT1)"

# ── 2b. Immutability vs a concurrent checkout after materialization ─────────────
echo "[selftest] 2b. A checkout AFTER materialization cannot change the snapshot"
git -C "$REPO" checkout -qf "$FULL2"   # move the live checkout out from under it
[ "$(cat "$CTX_B/marker.txt")" = "COMMIT_ONE" ] \
    && ok "already-materialized context unchanged by later checkout (TOCTOU closed)" \
    || fail "materialized context tracked the live checkout — race NOT closed"

# ── 5. Refusal without a name; ack builds the committed tip ─────────────────────
echo "[selftest] 5. No SHA refused; DEPLOY_ALLOW_HEAD=1 builds committed tip"
if ( unset DEPLOY_ALLOW_HEAD; deploy_ctx_assert_and_materialize "" ); then
    fail "assert_and_materialize accepted an unnamed commit without ack"
else
    ok "assert_and_materialize refuses when no SHA is named"
fi

# HEAD is commit2, tree still dirty (marker=DIRTY-UNCOMMITTED). Ack must still
# build the COMMITTED tip, not the dirt.
printf 'DIRTY-AGAIN\n' > "$REPO/marker.txt"
export DEPLOY_ALLOW_HEAD=1
deploy_ctx_assert_and_materialize ""
unset DEPLOY_ALLOW_HEAD
[ "$(cat "$MAIA_BUILD_CONTEXT/marker.txt")" = "COMMIT_TWO" ] \
    && ok "HEAD-ack builds the committed tip (COMMIT_TWO), not the dirty tree" \
    || fail "HEAD-ack context marker='$(cat "$MAIA_BUILD_CONTEXT/marker.txt")' (expected COMMIT_TWO)"
[ "${GIT_COMMIT:-}" = "$SHORT2" ] \
    && ok "GIT_COMMIT stamped to HEAD's SHA ($SHORT2) under ack" \
    || fail "GIT_COMMIT='$GIT_COMMIT' (expected $SHORT2)"

# ── 6. Post-swap running-provenance verify (Option 5) ──────────────────────────
echo "[selftest] 6. Post-swap verify — match passes, mismatch is caught"
if DEPLOY_VERIFY_PRINTENV_CMD="printf '%s' '$SHORT1'" DEPLOY_VERIFY_RETRIES=1 \
        deploy_ctx_verify_running "$SHORT1" fake-container; then
    ok "verify passes when the running GIT_COMMIT matches the asserted SHA"
else
    fail "verify rejected a matching running GIT_COMMIT"
fi
if DEPLOY_VERIFY_PRINTENV_CMD="printf '%s' 'cafe1234'" DEPLOY_VERIFY_RETRIES=1 \
        deploy_ctx_verify_running "$SHORT1" fake-container; then
    fail "verify accepted a MISMATCHED running GIT_COMMIT"
else
    ok "verify rejects a mismatched running GIT_COMMIT (stale-image guard)"
fi

echo ""
echo "[selftest] Results: $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ]
