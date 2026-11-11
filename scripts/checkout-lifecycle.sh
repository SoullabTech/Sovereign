#!/usr/bin/env bash
# checkout-lifecycle.sh — custody-gated reclamation across every checkout root.
#
# WHY THIS EXISTS
#   ain-worktree-claim.sh reclaims exactly one root ($HOME/.claude/worktrees).
#   Measured 2026-11-09: fifteen roots exist on the Mac Studio, holding ~45 GB,
#   growing ~5 GB/day because each delegated work unit creates a ~550 MB
#   checkout and nothing removes it when the unit finishes. A person cannot
#   hand-balance that. This closes the loop named in CLAUDE.md as
#   "Checkout Lifecycle GC".
#
# WHAT IT WILL NEVER DO
#   - delete a tree with uncommitted changes
#   - delete a tree holding commits that are on no remote
#   - delete a tree touched inside the active window (default 2 days)
#   - delete anything under a protected prefix
#   - delete source it cannot classify (orphans are REPORTED, never removed)
#
# Report-only by default. Reclaims only with --apply.
set -uo pipefail

ACTIVE_DAYS="${LIFECYCLE_ACTIVE_DAYS:-2}"
APPLY=0
STRIP_ONLY=0
VERBOSE=0

usage() {
    cat >&2 <<USAGE
usage: checkout-lifecycle.sh [--apply] [--strip-only] [--active-days N] [-v]

  (default)      report every checkout root and what each tree holds; changes nothing
  --apply        strip regenerable caches from kept trees, remove reclaimable trees
  --strip-only   with --apply: only strip node_modules/.next, never remove a tree
  --active-days  treat a tree touched within N days as in use (default ${ACTIVE_DAYS})
USAGE
    exit 2
}

while [ $# -gt 0 ]; do
    case "$1" in
        --apply) APPLY=1 ;;
        --strip-only) STRIP_ONLY=1 ;;
        --active-days) shift; ACTIVE_DAYS="${1:-2}" ;;
        -v|--verbose) VERBOSE=1 ;;
        -h|--help) usage ;;
        *) echo "unknown argument: $1" >&2; usage ;;
    esac
    shift
done

HOME_DIR="${HOME:?}"

# Prefixes that are never touched, whatever they contain.
is_protected() {
    case "$1" in
        "$HOME_DIR"/Library/Application\ Support/Claude*) return 0 ;;
        "$HOME_DIR"/.nvm/*|"$HOME_DIR"/Applications/*)    return 0 ;;
        "$HOME_DIR"/Downloads/*|"$HOME_DIR"/Documents/*)  return 0 ;;
        /System/*|/private/*|/opt/*)                      return 0 ;;
        *.app/*)                                          return 0 ;;
    esac
    return 1
}

# Roots are discovered, not hardcoded: whatever git itself admits to, plus the
# conventional parents. A root that stops existing simply drops out.
discover_roots() {
    {
        for r in \
            "$HOME_DIR/.claude/worktrees" \
            "$HOME_DIR/.jarvis-worktrees" \
            "$HOME_DIR/.jarvis/worktrees" \
            "$HOME_DIR/.review-worktrees" \
            "$HOME_DIR/.worktrees" \
            "$HOME_DIR/worktrees" \
            "$HOME_DIR/maia-worktrees" \
            "$HOME_DIR/Soullab-Worktrees" \
            "$HOME_DIR/MAIA-SOVEREIGN-worktrees" \
            "$HOME_DIR/MAIA-SOVEREIGN-worktrees-tmp" \
            "$HOME_DIR/MAIA-SOVEREIGN/.claude/worktrees"
        do
            [ -d "$r" ] && printf '%s\n' "$r"
        done

        # Anything git has registered that lives under a parent we don't know.
        if [ -d "$HOME_DIR/MAIA-SOVEREIGN/.git" ] || [ -f "$HOME_DIR/MAIA-SOVEREIGN/.git" ]; then
            git -C "$HOME_DIR/MAIA-SOVEREIGN" worktree list --porcelain 2>/dev/null \
                | sed -n 's|^worktree ||p' \
                | sed 's|/[^/]*$||' \
                | grep -v "^$HOME_DIR/MAIA-SOVEREIGN$" || true
        fi
    } | sort -u
}

size_kb() { du -sk "$1" 2>/dev/null | cut -f1; }

human() {
    local kb="${1:-0}"
    if   [ "$kb" -ge 1048576 ]; then awk -v k="$kb" 'BEGIN{printf "%.1fG", k/1048576}'
    elif [ "$kb" -ge 1024 ];    then awk -v k="$kb" 'BEGIN{printf "%.0fM", k/1024}'
    else printf '%sK' "$kb"
    fi
}

# Empty output == safe to reclaim. Mirrors ain-worktree-claim.sh's gate so the
# two cannot disagree about custody.
blockers_for() {
    local wt="$1" out="" dirty unpushed

    if ! git -C "$wt" rev-parse --git-dir >/dev/null 2>&1; then
        printf 'ORPHAN (git does not manage this path — inspect by hand)\n'
        return 0
    fi
    if [ -n "$(find "$wt" -maxdepth 1 -newermt "-${ACTIVE_DAYS} days" -print -quit 2>/dev/null)" ]; then
        out="${out}active within ${ACTIVE_DAYS}d"$'\n'
    fi
    dirty="$(git -C "$wt" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
    [ "${dirty:-0}" -gt 0 ] && out="${out}${dirty} uncommitted change(s)"$'\n'

    unpushed="$(git -C "$wt" rev-list --count HEAD --not --remotes 2>/dev/null || echo 0)"
    [ "${unpushed:-0}" -gt 0 ] && out="${out}${unpushed} commit(s) on no remote"$'\n'

    printf '%s' "$out"
}

# node_modules/.next are gitignored everywhere, so stripping them can never
# destroy tracked or uncommitted work. This is why it needs no custody gate --
# but it is still skipped on active trees, because deleting the deps of a tree
# someone is building in just forces a reinstall tomorrow.
strip_caches() {
    local wt="$1" freed=0 d
    for d in node_modules .next; do
        if [ -d "$wt/$d" ] && ! is_protected "$wt/$d"; then
            freed=$(( freed + $(size_kb "$wt/$d") ))
            [ "$APPLY" -eq 1 ] && rm -rf "$wt/$d"
        fi
    done
    printf '%s' "$freed"
}

total_kb=0; reclaim_kb=0; strip_kb=0; held_kb=0
n_reclaim=0; n_held=0; n_orphan=0; n_active=0

echo "checkout lifecycle — $( [ "$APPLY" -eq 1 ] && echo APPLY || echo 'report only' ), active window ${ACTIVE_DAYS}d"
echo

for root in $(discover_roots); do
    is_protected "$root" && continue
    printf '%s\n' "$root"
    found=0

    for d in "$root"/*/; do
        [ -d "$d" ] || continue
        wt="${d%/}"
        is_protected "$wt" && continue
        found=1

        kb="$(size_kb "$wt")"; kb="${kb:-0}"
        total_kb=$(( total_kb + kb ))
        why="$(blockers_for "$wt")"

        case "$why" in
            ORPHAN*)
                n_orphan=$(( n_orphan + 1 )); held_kb=$(( held_kb + kb ))
                printf '  ORPHAN    %6s  %s\n' "$(human "$kb")" "${wt##*/}"
                ;;
            "")
                n_reclaim=$(( n_reclaim + 1 )); reclaim_kb=$(( reclaim_kb + kb ))
                printf '  RECLAIM   %6s  %s\n' "$(human "$kb")" "${wt##*/}"
                if [ "$APPLY" -eq 1 ] && [ "$STRIP_ONLY" -eq 0 ]; then
                    main="$(git -C "$wt" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)"
                    main="$(dirname "${main:-/nonexistent}")"
                    if git -C "$main" worktree remove --force "$wt" 2>/dev/null; then
                        echo "            removed"
                    else
                        rmdir "$wt" 2>/dev/null && echo "            removed (empty)" \
                            || echo "            COULD NOT REMOVE — left in place"
                    fi
                fi
                ;;
            *active\ within*)
                n_active=$(( n_active + 1 )); held_kb=$(( held_kb + kb ))
                printf '  ACTIVE    %6s  %s\n' "$(human "$kb")" "${wt##*/}"
                ;;
            *)
                n_held=$(( n_held + 1 )); held_kb=$(( held_kb + kb ))
                printf '  HELD      %6s  %s — %s\n' "$(human "$kb")" "${wt##*/}" \
                    "$(printf '%s' "$why" | tr '\n' ';' | sed 's/;$//')"
                s="$(strip_caches "$wt")"; strip_kb=$(( strip_kb + ${s:-0} ))
                [ "${s:-0}" -gt 0 ] && printf '            caches %s %s\n' \
                    "$( [ "$APPLY" -eq 1 ] && echo stripped || echo strippable )" "$(human "$s")"
                ;;
        esac
    done

    [ "$found" -eq 0 ] && echo "  (empty)"
    echo
done

echo "----------------------------------------------------------------"
printf 'trees: %d reclaimable, %d held (uncommitted/unpushed), %d active, %d orphaned\n' \
    "$n_reclaim" "$n_held" "$n_active" "$n_orphan"
printf 'space: %s total, %s reclaimable, %s in caches of held trees, %s held\n' \
    "$(human "$total_kb")" "$(human "$reclaim_kb")" "$(human "$strip_kb")" "$(human "$held_kb")"

if [ "$n_orphan" -gt 0 ]; then
    echo
    echo "ORPHANS are reported, never removed: git cannot vouch for them, so this"
    echo "script will not delete them. Inspect by hand, or re-register them."
fi

if [ "$APPLY" -eq 0 ]; then
    echo
    echo "nothing was changed. re-run with --apply to reclaim."
else
    # APFS pins deleted blocks to local snapshots: df does not move until these
    # are thinned. Three cleanups this week were judged failures for this reason.
    if command -v tmutil >/dev/null 2>&1; then
        echo
        echo "thinning local snapshots (deleted blocks are pinned until this runs)…"
        sudo tmutil thinlocalsnapshots / 200000000000 4 2>/dev/null || \
            echo "  (skipped — needs sudo; run: sudo tmutil thinlocalsnapshots / 200000000000 4)"
    fi
    sync
    df -h /System/Volumes/Data 2>/dev/null | awk 'NR==2{print "free now: "$4}'
fi
