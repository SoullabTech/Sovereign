#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# AIN Delegation — Worktree Ownership Guard
# ═══════════════════════════════════════════════════════════════════════════════
# "One active write lane → one branch → one worktree → one owner" is a hard
# Builder OS delegation requirement (docs/ops/AIN_DELEGATION_CONTROL_PLANE_2026-08-09.md
# §6). No repo-side worktree helper existed before this — this mirrors the
# exact lock pattern already proven in scripts/deploy-lock.sh (PID-file
# fallback, since flock is not present on the Mac Studio dev host), scoped
# per work_unit_id instead of one global deploy lane.
#
# Usage:
#   ain-worktree-claim.sh claim   <work_unit_id> <branch> [base_sha]
#   ain-worktree-claim.sh status  <work_unit_id>
#   ain-worktree-claim.sh release <work_unit_id>
#
# On claim: creates (or reuses) a git worktree at
#   ~/.claude/worktrees/ain-<work_unit_id>
# checked out to <branch> from <base_sha> (default: current HEAD of the repo
# this script lives in), and writes an ownership lock recording who holds it.
# Prints the worktree path on stdout (only) on success — safe to capture with
# $(...).
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AIN_HOME="${AIN_DELEGATION_HOME:-$HOME/.claude/ain-delegation}"
LOCKS_DIR="$AIN_HOME/locks"
WORKTREES_ROOT="${AIN_WORKTREES_ROOT:-$HOME/.claude/worktrees}"

mkdir -p "$LOCKS_DIR" "$WORKTREES_ROOT"

_lock_file() { echo "$LOCKS_DIR/$1.lock"; }
_worktree_path() { echo "$WORKTREES_ROOT/ain-$1"; }

_refuse() {
    local work_unit_id="$1" lock_file="$2"
    echo "" >&2
    echo "🛑 [ain-worktree-claim] CLAIM REFUSED — work unit '$work_unit_id' is already owned." >&2
    echo "   Lock: $lock_file" >&2
    if [ -s "$lock_file" ]; then
        echo "   Holder:" >&2
        sed 's/^/     /' "$lock_file" >&2 || true
    fi
    echo "   One worktree, one owner. Do not delete the lock to force entry —" >&2
    echo "   release it properly with: ain-worktree-claim.sh release $work_unit_id" >&2
    echo "" >&2
}

cmd_claim() {
    local work_unit_id="${1:?work_unit_id required}"
    local branch="${2:?branch required}"
    local base_sha="${3:-$(git -C "$PROJECT_DIR" rev-parse --short HEAD)}"
    local lock_file worktree_path
    lock_file="$(_lock_file "$work_unit_id")"
    worktree_path="$(_worktree_path "$work_unit_id")"

    if [ -f "$lock_file" ]; then
        local holder_pid
        holder_pid="$(sed -n 's/^pid=//p' "$lock_file" 2>/dev/null | head -1)"
        if [ -n "$holder_pid" ] && kill -0 "$holder_pid" 2>/dev/null; then
            _refuse "$work_unit_id" "$lock_file"
            exit 1
        fi
        echo "⚠️  [ain-worktree-claim] STALE LOCK for '$work_unit_id' (holder pid ${holder_pid:-?} dead) — breaking." >&2
        rm -f "$lock_file"
    fi

    if [ -d "$worktree_path" ]; then
        echo "[ain-worktree-claim] reusing existing worktree at $worktree_path" >&2
    else
        git -C "$PROJECT_DIR" worktree add -B "$branch" "$worktree_path" "$base_sha" >&2
    fi

    {
        echo "pid=$$"
        echo "started=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
        echo "user=$(id -un 2>/dev/null || echo unknown)@$(hostname 2>/dev/null || echo unknown)"
        echo "work_unit_id=$work_unit_id"
        echo "branch=$branch"
        echo "base_sha=$base_sha"
        echo "worktree=$worktree_path"
    } > "$lock_file"

    echo "[ain-worktree-claim] claimed '$work_unit_id' -> $worktree_path (branch $branch @ $base_sha)" >&2
    echo "$worktree_path"
}

cmd_status() {
    local work_unit_id="${1:?work_unit_id required}"
    local lock_file
    lock_file="$(_lock_file "$work_unit_id")"
    if [ ! -f "$lock_file" ]; then
        echo "unclaimed"
        return 0
    fi
    local holder_pid
    holder_pid="$(sed -n 's/^pid=//p' "$lock_file" 2>/dev/null | head -1)"
    if [ -n "$holder_pid" ] && kill -0 "$holder_pid" 2>/dev/null; then
        echo "claimed"
    else
        echo "stale"
    fi
    sed 's/^/  /' "$lock_file" >&2 || true
}

cmd_release() {
    local work_unit_id="${1:?work_unit_id required}"
    local lock_file
    lock_file="$(_lock_file "$work_unit_id")"
    rm -f "$lock_file"
    echo "[ain-worktree-claim] released '$work_unit_id' (worktree left in place: $(_worktree_path "$work_unit_id"))" >&2
}

case "${1:-}" in
    claim)   shift; cmd_claim "$@" ;;
    status)  shift; cmd_status "$@" ;;
    release) shift; cmd_release "$@" ;;
    *)
        echo "usage: $0 {claim|status|release} <work_unit_id> [args...]" >&2
        exit 2
        ;;
esac
