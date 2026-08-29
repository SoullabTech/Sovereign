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
#   ain-worktree-claim.sh release <work_unit_id> [--keep] [--force]
#   ain-worktree-claim.sh list
#   ain-worktree-claim.sh gc      [--dry-run] [--caches] [--force]
#
# On claim: creates (or reuses) a git worktree at
#   ~/.claude/worktrees/ain-<work_unit_id>
# checked out to <branch> from <base_sha> (default: current HEAD of the repo
# this script lives in), and writes an ownership lock recording who holds it.
# Prints the worktree path on stdout (only) on success — safe to capture with
# $(...).
#
# On release: reclaims the worktree from disk as well as dropping the lock.
# Each worktree carries its own node_modules (1–2 GB for this repo) plus a
# .next cache, so leaving them in place accumulated ~10+ abandoned trees and
# put the dev host at 96% disk. Reclamation is REFUSED (worktree kept, reason
# printed) whenever the tree still holds work that exists nowhere else:
# uncommitted/untracked changes, or commits not reachable from any remote.
# --keep drops the lock only; --force removes despite blockers.
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AIN_HOME="${AIN_DELEGATION_HOME:-$HOME/.claude/ain-delegation}"
LOCKS_DIR="$AIN_HOME/locks"
WORKTREES_ROOT="${AIN_WORKTREES_ROOT:-$HOME/.claude/worktrees}"

mkdir -p "$LOCKS_DIR" "$WORKTREES_ROOT"

_lock_file() { echo "$LOCKS_DIR/$1.lock"; }
_worktree_path() { echo "$WORKTREES_ROOT/ain-$1"; }
_id_from_path() { basename "$1" | sed 's/^ain-//'; }

# Disk footprint of a path, in KB (0 if missing). Used for the reclaim tally.
_size_kb() {
    [ -d "$1" ] || { echo 0; return 0; }
    du -sk "$1" 2>/dev/null | awk '{print $1}' || echo 0
}

_human_kb() {
    awk -v kb="$1" 'BEGIN {
        if (kb >= 1048576) printf "%.1fG", kb/1048576;
        else if (kb >= 1024) printf "%.0fM", kb/1024;
        else printf "%dK", kb;
    }'
}

# Is the lock for this work unit held by a process that is still alive?
_lock_is_live() {
    local lock_file pid
    lock_file="$(_lock_file "$1")"
    [ -f "$lock_file" ] || return 1
    pid="$(sed -n 's/^pid=//p' "$lock_file" 2>/dev/null | head -1)"
    [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

# Print newline-separated reasons this worktree must NOT be removed.
# Empty output == safe to reclaim. Kept as a string rather than an array
# because the Mac Studio dev host runs bash 3.2, where "${arr[@]}" on an
# empty array trips `set -u`.
_reclaim_blockers() {
    local wt="$1" work_unit_id="$2" blockers="" pid dirty unpushed

    [ -d "$wt" ] || return 0

    if _lock_is_live "$work_unit_id"; then
        pid="$(sed -n 's/^pid=//p' "$(_lock_file "$work_unit_id")" 2>/dev/null | head -1)"
        blockers="${blockers}still claimed by live pid ${pid}"$'\n'
    fi

    if ! git -C "$wt" rev-parse --git-dir >/dev/null 2>&1; then
        blockers="${blockers}not a valid git worktree (inspect by hand)"$'\n'
        printf '%s' "$blockers"
        return 0
    fi

    # --porcelain honours .gitignore, so node_modules/.next do not register here.
    dirty="$(git -C "$wt" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
    if [ "$dirty" -gt 0 ]; then
        blockers="${blockers}${dirty} uncommitted/untracked change(s)"$'\n'
    fi

    # Commits reachable from HEAD but from no remote ref exist only in this
    # tree. Covers both "never pushed" and "pushed then advanced".
    unpushed="$(git -C "$wt" rev-list --count HEAD --not --remotes 2>/dev/null || echo 0)"
    if [ "${unpushed:-0}" -gt 0 ]; then
        blockers="${blockers}${unpushed} commit(s) not on any remote"$'\n'
    fi

    printf '%s' "$blockers"
}

# Strip regenerable build artifacts (node_modules, .next) from a worktree we
# are keeping. Always safe: both are gitignored and rebuildable.
_strip_caches() {
    local wt="$1" freed=0 d
    for d in node_modules .next; do
        if [ -d "$wt/$d" ]; then
            freed=$(( freed + $(_size_kb "$wt/$d") ))
            rm -rf "$wt/$d"
        fi
    done
    echo "$freed"
}

_remove_worktree() {
    local wt="$1" force="$2"
    if [ "$force" = "yes" ]; then
        git -C "$PROJECT_DIR" worktree remove --force "$wt" >/dev/null 2>&1 || rm -rf "$wt"
    else
        git -C "$PROJECT_DIR" worktree remove "$wt" >/dev/null 2>&1 || rm -rf "$wt"
    fi
}

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
    local work_unit_id="" keep="no" force="no" arg
    for arg in "$@"; do
        case "$arg" in
            --keep)  keep="yes" ;;
            --force) force="yes" ;;
            -*)      echo "[ain-worktree-claim] unknown flag: $arg" >&2; exit 2 ;;
            *)       work_unit_id="$arg" ;;
        esac
    done
    [ -n "$work_unit_id" ] || { echo "work_unit_id required" >&2; exit 2; }

    local lock_file worktree_path blockers size_kb
    lock_file="$(_lock_file "$work_unit_id")"
    worktree_path="$(_worktree_path "$work_unit_id")"

    rm -f "$lock_file"

    if [ "$keep" = "yes" ]; then
        echo "[ain-worktree-claim] released '$work_unit_id' (--keep: worktree left in place: $worktree_path)" >&2
        return 0
    fi

    if [ ! -d "$worktree_path" ]; then
        echo "[ain-worktree-claim] released '$work_unit_id' (no worktree on disk)" >&2
        git -C "$PROJECT_DIR" worktree prune >/dev/null 2>&1 || true
        return 0
    fi

    # The lock is already gone, so it can never be its own blocker here.
    blockers="$(_reclaim_blockers "$worktree_path" "$work_unit_id")"
    size_kb="$(_size_kb "$worktree_path")"

    if [ -n "$blockers" ] && [ "$force" != "yes" ]; then
        echo "[ain-worktree-claim] released '$work_unit_id' — worktree KEPT ($(_human_kb "$size_kb")), it still holds work:" >&2
        printf '%s\n' "$blockers" | sed 's/^/     • /' >&2
        echo "   Push or discard that work, then: $0 release $work_unit_id" >&2
        echo "   (or reclaim the regenerable caches now: $0 gc --caches)" >&2
        return 0
    fi

    _remove_worktree "$worktree_path" "$force"
    git -C "$PROJECT_DIR" worktree prune >/dev/null 2>&1 || true
    echo "[ain-worktree-claim] released '$work_unit_id' — worktree reclaimed, $(_human_kb "$size_kb") freed" >&2
}

cmd_list() {
    local total_kb=0 count=0 wt work_unit_id size_kb blockers state rows=""
    for wt in "$WORKTREES_ROOT"/ain-*; do
        [ -d "$wt" ] || continue
        work_unit_id="$(_id_from_path "$wt")"
        size_kb="$(_size_kb "$wt")"
        total_kb=$(( total_kb + size_kb ))
        count=$(( count + 1 ))
        if _lock_is_live "$work_unit_id"; then
            state="held"
        elif [ -f "$(_lock_file "$work_unit_id")" ]; then
            state="stale"
        else
            state="unlocked"
        fi
        blockers="$(_reclaim_blockers "$wt" "$work_unit_id")"
        if [ -z "$blockers" ]; then
            rows="${rows}$(printf '%-34s %8s  %-10s %s' "$work_unit_id" "$(_human_kb "$size_kb")" "$state" "safe")"$'\n'
        else
            rows="${rows}$(printf '%-34s %8s  %-10s %s' "$work_unit_id" "$(_human_kb "$size_kb")" "$state" \
                "blocked: $(printf '%s' "$blockers" | paste -sd';' - )")"$'\n'
        fi
    done
    if [ "$count" -eq 0 ]; then
        echo "(no worktrees under $WORKTREES_ROOT)"
        return 0
    fi
    printf '%-34s %8s  %-10s %s\n' "WORK UNIT" "SIZE" "LOCK" "RECLAIM"
    printf '%s' "$rows"
    echo ""
    echo "$count worktree(s), $(_human_kb "$total_kb") total under $WORKTREES_ROOT"
}

cmd_gc() {
    local dry_run="no" caches="no" force="no" arg
    for arg in "$@"; do
        case "$arg" in
            --dry-run) dry_run="yes" ;;
            --caches)  caches="yes" ;;
            --force)   force="yes" ;;
            *)         echo "[ain-worktree-claim] unknown flag: $arg" >&2; exit 2 ;;
        esac
    done

    local wt work_unit_id size_kb blockers freed_kb=0 removed=0 kept=0 stripped_kb=0

    if [ "$dry_run" = "yes" ]; then
        echo "[ain-worktree-claim] sweeping $WORKTREES_ROOT (dry run — nothing will be deleted)" >&2
    else
        echo "[ain-worktree-claim] sweeping $WORKTREES_ROOT" >&2
    fi
    for wt in "$WORKTREES_ROOT"/ain-*; do
        [ -d "$wt" ] || continue
        work_unit_id="$(_id_from_path "$wt")"
        size_kb="$(_size_kb "$wt")"
        blockers="$(_reclaim_blockers "$wt" "$work_unit_id")"

        if [ -z "$blockers" ] || [ "$force" = "yes" ]; then
            if [ "$dry_run" = "yes" ]; then
                echo "  would reclaim  $work_unit_id ($(_human_kb "$size_kb"))" >&2
            else
                _remove_worktree "$wt" "$force"
                rm -f "$(_lock_file "$work_unit_id")"
                echo "  reclaimed      $work_unit_id ($(_human_kb "$size_kb"))" >&2
            fi
            freed_kb=$(( freed_kb + size_kb ))
            removed=$(( removed + 1 ))
            continue
        fi

        kept=$(( kept + 1 ))
        echo "  kept           $work_unit_id ($(_human_kb "$size_kb")) — $(printf '%s' "$blockers" | paste -sd'; ' - )" >&2

        if [ "$caches" = "yes" ]; then
            local before_kb
            before_kb=$(( $(_size_kb "$wt/node_modules") + $(_size_kb "$wt/.next") ))
            if [ "$before_kb" -gt 0 ]; then
                if [ "$dry_run" = "yes" ]; then
                    echo "                   would strip node_modules/.next ($(_human_kb "$before_kb"))" >&2
                else
                    before_kb="$(_strip_caches "$wt")"
                    echo "                   stripped node_modules/.next ($(_human_kb "$before_kb"))" >&2
                fi
                stripped_kb=$(( stripped_kb + before_kb ))
            fi
        fi
    done

    [ "$dry_run" = "yes" ] || git -C "$PROJECT_DIR" worktree prune >/dev/null 2>&1 || true

    echo "" >&2
    if [ "$dry_run" = "yes" ]; then
        echo "[ain-worktree-claim] would reclaim $removed, keep $kept — $(_human_kb $(( freed_kb + stripped_kb ))) recoverable" >&2
    else
        echo "[ain-worktree-claim] $removed reclaimed, $kept kept — $(_human_kb $(( freed_kb + stripped_kb ))) freed" >&2
    fi
    if [ "$kept" -gt 0 ] && [ "$caches" != "yes" ]; then
        echo "   Kept trees still hold node_modules/.next; strip those with: $0 gc --caches" >&2
    fi
}

case "${1:-}" in
    claim)   shift; cmd_claim "$@" ;;
    status)  shift; cmd_status "$@" ;;
    release) shift; cmd_release "$@" ;;
    list)    shift; cmd_list "$@" ;;
    gc)      shift; cmd_gc "$@" ;;
    *)
        echo "usage: $0 {claim|status|release|list|gc} [args...]" >&2
        echo "  claim   <work_unit_id> <branch> [base_sha]" >&2
        echo "  status  <work_unit_id>" >&2
        echo "  release <work_unit_id> [--keep] [--force]   reclaims the worktree unless it holds unpushed work" >&2
        echo "  list                                        every worktree with size and reclaim status" >&2
        echo "  gc      [--dry-run] [--caches] [--force]    sweep: reclaim safe trees, optionally strip caches from kept ones" >&2
        exit 2
        ;;
esac
