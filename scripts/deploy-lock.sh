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
#   acquire_deploy_lock "<entry-point label>"
#
# Behavior:
#   - Exclusive, NON-BLOCKING lock on $PROJECT_DIR/.deploy.lock (flock -n).
#   - The kernel lock is held on fd 9 for the lifetime of the calling process
#     AND its children (docker compose build inherits the fd, including across
#     `exec`), then auto-released when they all exit or die — a crashed deploy
#     can never leave the lane locked.
#   - On contention: prints WHO holds the lock (pid, start time, user@host,
#     entry point, commit) and refuses with exit 1. It never queues — a second
#     deploy must be a conscious retry after the first finishes.
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

acquire_deploy_lock() {
    local label="${1:-deploy}"

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

    # Record WHO holds the lane, so a refused second deploy can say so.
    {
        echo "pid=$$"
        echo "started=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
        echo "user=$(id -un 2>/dev/null || echo unknown)@$(hostname 2>/dev/null || echo unknown)"
        echo "entry=$label"
        echo "git_commit=${GIT_COMMIT:-$(git -C "$PROJECT_DIR" rev-parse --short HEAD 2>/dev/null || echo unknown)}"
    } > "$DEPLOY_LOCK_FILE"
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

# Update the recorded git_commit in the holder info AFTER a locked repo sync,
# so the lock file names the tree actually being built rather than the pre-sync
# HEAD captured at acquire time (deploy-maia-at moves the checkout under the
# lock, then calls this with the freshly resolved SHA). Rewriting the file is
# safe while held: flock binds to the open fd/inode, not the file's content.
record_deploy_lock_commit() {
    local sha="$1"
    [ -s "$DEPLOY_LOCK_FILE" ] || return 0
    local rest
    rest="$(grep -v '^git_commit=' "$DEPLOY_LOCK_FILE" 2>/dev/null || true)"
    {
        printf '%s\n' "$rest"
        echo "git_commit=$sha"
    } > "$DEPLOY_LOCK_FILE"
}
