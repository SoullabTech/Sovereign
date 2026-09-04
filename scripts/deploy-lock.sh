#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Deploy Lane Lock — one deploy at a time, as structure not discipline
# ═══════════════════════════════════════════════════════════════════════════════
# On 2026-07-09 multiple parallel sessions launched deploys into the same lane on
# minisforum; five processes wedged on the buildkit lock and two recovery deploys
# raced each other. No lane misbehaved — there was simply no mechanism by which
# deploy attempts could see each other. This file is that mechanism.
#
# Sourced by scripts/deploy-production.sh and scripts/pre-deploy-gate.sh.
# Requires $PROJECT_DIR to be set by the sourcing script before sourcing.
#
#   acquire_deploy_lock "<entry-point label>" [target]
#   deploy_lock_record_target "<target>"     (re-write the record once a target is known)
#
#   target — the commit the entry point was ASKED to deploy, exactly as named on
#            the command line (SHA or ref). Recorded verbatim as `target=`, with
#            its resolution as `target_sha=`. Empty/omitted means "no SHA named":
#            with DEPLOY_ALLOW_HEAD=1 the record says the checkout tip is the
#            target BY ACKNOWLEDGEMENT; otherwise it says `none`.
#
# Behavior:
#   - Exclusive, NON-BLOCKING lock on $PROJECT_DIR/.deploy.lock (flock -n).
#   - The kernel lock is held on fd 9 for the lifetime of the calling process
#     AND its children (docker compose build inherits the fd, including across
#     `exec`), then auto-released when they all exit or die — a crashed deploy
#     can never leave the lane locked.
#   - On contention: prints WHO holds the lock (pid, start time, user@host,
#     entry point, deploy target) and refuses with exit 1. It never queues — a
#     second deploy must be a conscious retry after the first finishes.
#   - The record names the deploy TARGET, never the shared checkout's HEAD as
#     if it were the target. On 2026-09-03 a refusal printed
#     `git_commit=5370b42a3` (the stale shared checkout, 286 commits behind)
#     while the in-flight deploy was building the SHA named on its command
#     line — because the record fell back to `git rev-parse HEAD` before
#     GIT_COMMIT had been exported from the asserted SHA. The immutable-SHA
#     design (docs/ops/IMMUTABLE_SHA_DEPLOY.md) exists precisely because the
#     checkout is not the target; the record must not reintroduce that
#     confusion. `checkout_head=` is printed ONLY when it differs from the
#     target, and is labelled informational.
#   - No-flock hosts (macOS local dev stack): PID-file fallback with loud
#     stale-lock breaking when the recorded holder is dead.
# ═══════════════════════════════════════════════════════════════════════════════

DEPLOY_LOCK_FILE="${DEPLOY_LOCK_FILE:-$PROJECT_DIR/.deploy.lock}"

_deploy_lock_refuse() {
    echo "" >&2
    echo "🛑 [deploy-lock] DEPLOY REFUSED — another deploy is already running in this lane." >&2
    echo "   Lock: $DEPLOY_LOCK_FILE" >&2
    if [ -s "$DEPLOY_LOCK_FILE" ]; then
        echo "   Holder:" >&2
        sed 's/^/     /' "$DEPLOY_LOCK_FILE" >&2 || true
        local holder_pid
        holder_pid="$(sed -n 's/^pid=//p' "$DEPLOY_LOCK_FILE" 2>/dev/null | head -1)"
        if [ -n "$holder_pid" ]; then
            if kill -0 "$holder_pid" 2>/dev/null; then
                echo "   Holder pid $holder_pid is ALIVE. Wait for it to finish (watch: ps -fp $holder_pid)." >&2
            else
                echo "   Recorded holder pid $holder_pid is dead, but the lock is still held —" >&2
                echo "   almost certainly a child of that deploy (e.g. docker compose build) is" >&2
                echo "   still running and holding the inherited fd." >&2
                echo "   Inspect: fuser -v $DEPLOY_LOCK_FILE   (or: lsof $DEPLOY_LOCK_FILE)" >&2
            fi
        fi
    fi
    echo "   One deploy lane. Do NOT delete the lockfile to force entry — deleting it" >&2
    echo "   detaches the kernel lock from future acquirers and re-opens the" >&2
    echo "   2026-07-09 concurrent-deploy race." >&2
    echo "" >&2
}

# Resolve a ref to a short SHA against the deploy SOURCE repo (the same repo the
# immutable-SHA materialize resolves against). Prints nothing when it does not
# resolve. Read-only: this is for the record, not for authority — the build
# still asserts and snapshots the commit in scripts/deploy-context.sh.
_deploy_lock_resolve_short() {
    local ref="${1:-}"
    local repo="${DEPLOY_SOURCE_REPO:-$PROJECT_DIR}"
    [ -z "$ref" ] && return 0
    local full
    full="$(git -C "$repo" rev-parse --verify --quiet "${ref}^{commit}" 2>/dev/null || true)"
    [ -z "$full" ] && return 0
    git -C "$repo" rev-parse --short "$full" 2>/dev/null || true
}

# Write the holder record. Fields:
#   pid= started= user= entry=   — who holds the lane
#   target=                      — what the entry point was asked to deploy, verbatim
#   target_sha=                  — its resolution: the commit this deploy builds
#   checkout_head=               — ONLY when the shared checkout's HEAD differs from
#                                  target_sha; informational, explicitly NOT the target
_deploy_lock_write_record() {
    local target="${1:-}"
    local repo="${DEPLOY_SOURCE_REPO:-$PROJECT_DIR}"
    local head_short target_line target_sha
    head_short="$(git -C "$repo" rev-parse --short HEAD 2>/dev/null || echo unknown)"

    if [ -z "$target" ]; then
        if [ "${DEPLOY_ALLOW_HEAD:-0}" = "1" ]; then
            target_line="HEAD (no SHA named; DEPLOY_ALLOW_HEAD=1 — checkout tip acknowledged as the target)"
            target_sha="$head_short"
        else
            target_line="none (no SHA named on the command line)"
            target_sha="n/a"
        fi
    else
        target_line="$target"
        target_sha="$(_deploy_lock_resolve_short "$target")"
        [ -z "$target_sha" ] && target_sha="n/a (not a commit in $repo)"
    fi

    {
        echo "pid=$$"
        echo "started=$_DEPLOY_LOCK_STARTED"
        echo "user=$(id -un 2>/dev/null || echo unknown)@$(hostname 2>/dev/null || echo unknown)"
        echo "entry=$_DEPLOY_LOCK_LABEL"
        echo "target=$target_line"
        echo "target_sha=$target_sha"
        if [ "$head_short" != "$target_sha" ]; then
            echo "checkout_head=$head_short (shared checkout HEAD — informational, NOT the deploy target)"
        fi
    } > "$DEPLOY_LOCK_FILE"
}

# Re-write the record with a target learned AFTER the lock was taken (e.g.
# `update` names the tip it just pulled). Same pid/started/entry; only the
# target fields change. No-op unless this process holds the lock.
deploy_lock_record_target() {
    if [ -z "${_DEPLOY_LOCK_LABEL:-}" ]; then
        echo "[deploy-lock] deploy_lock_record_target called before acquire_deploy_lock — ignored." >&2
        return 0
    fi
    _deploy_lock_write_record "${1:-}"
    echo "[deploy-lock] record updated: target=${1:-<none>}" >&2
}

acquire_deploy_lock() {
    local label="${1:-deploy}"
    local target="${2:-}"

    if command -v flock >/dev/null 2>&1; then
        # Kernel flock on fd 9: auto-released when the holder and every child
        # that inherited the fd have exited or died. Append-open never truncates
        # a live holder's info.
        exec 9>>"$DEPLOY_LOCK_FILE"
        if ! flock -n 9; then
            _deploy_lock_refuse
            exit 1
        fi
    else
        # Fallback for hosts without flock (macOS local dev stack).
        if [ -f "$DEPLOY_LOCK_FILE" ]; then
            local holder_pid
            holder_pid="$(sed -n 's/^pid=//p' "$DEPLOY_LOCK_FILE" 2>/dev/null | head -1)"
            if [ -n "$holder_pid" ] && kill -0 "$holder_pid" 2>/dev/null; then
                _deploy_lock_refuse
                exit 1
            fi
            echo "⚠️  [deploy-lock] STALE LOCK: recorded holder (pid ${holder_pid:-?}) is dead — breaking lock." >&2
            sed 's/^/    stale: /' "$DEPLOY_LOCK_FILE" >&2 || true
            rm -f "$DEPLOY_LOCK_FILE"
        fi
        # PID-file lock has no kernel auto-release; clean up on exit.
        trap 'rm -f "$DEPLOY_LOCK_FILE"' EXIT
    fi

    # Record WHO holds the lane and WHAT it is deploying, so a refused second
    # deploy can say so. Written once here; re-written by deploy_lock_record_target
    # when an entry point learns its target after locking (e.g. `update` pulls first).
    _DEPLOY_LOCK_LABEL="$label"
    _DEPLOY_LOCK_STARTED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    _deploy_lock_write_record "$target"
    echo "[deploy-lock] acquired $DEPLOY_LOCK_FILE (pid $$, entry: $label)" >&2

    # Lane token — proof, forwarded into the image build, that this deploy came
    # through the lane machinery. docker-compose.production.yml passes it as the
    # DEPLOY_LANE_TOKEN build arg (deliberately no default there) and the
    # Dockerfiles REFUSE to build without it, so the raw
    # `docker compose ... up -d --build` bypass (2026-07-10 incident) fails
    # loudly instead of succeeding quietly. Constant by design: a per-deploy
    # nonce would invalidate the docker layer cache on every deploy. This trips
    # the QUIET bypass; typing the token by hand is an explicit, greppable act.
    # See docs/ops/DEPLOY_LANE_TOKEN.md.
    export DEPLOY_LANE_TOKEN="deploy-lane"
}
