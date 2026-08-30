#!/usr/bin/env bash
# Read-only disk + custody report for the Mac Studio dev host.
# Measures and verifies. Deletes nothing, modifies nothing.
#
#   bash scripts/disk-census.sh
#
# Written for the 2026-08-29 worktree/disk cleanup lane: proves the three
# backup pushes landed, shows what still blocks reclamation, then measures
# the actual disk consumers so reclamation is decided from numbers rather
# than from guesses.

WORKTREES="${AIN_WORKTREES_ROOT:-$HOME/.claude/worktrees}"
REPO="${MAIA_REPO:-$HOME/MAIA-SOVEREIGN}"

echo "===== CUSTODY VERIFICATION ====="
for id in jarvis-custody geometric-reasoning-audit relational-geometry; do
    wt="$WORKTREES/ain-$id"
    if [ ! -d "$wt" ]; then
        printf '%-28s (worktree not present)\n' "$id"
        continue
    fi
    remote="chore/backup-$id"
    local_sha="$(git -C "$wt" rev-parse HEAD 2>/dev/null)"
    remote_sha="$(git -C "$wt" ls-remote origin "refs/heads/$remote" 2>/dev/null | awk '{print $1}')"
    git -C "$wt" fetch origin --prune --quiet 2>/dev/null
    unpushed="$(git -C "$wt" rev-list --count HEAD --not --remotes 2>/dev/null || echo '?')"
    dirty="$(git -C "$wt" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
    if [ -n "$remote_sha" ] && [ "$local_sha" = "$remote_sha" ]; then p1=OK; else p1=FAIL; fi
    if [ "$unpushed" = "0" ]; then p2=OK; else p2="FAIL($unpushed)"; fi
    if [ "$unpushed" = "0" ] && [ "$dirty" = "0" ]; then expect=SAFE; else expect=KEPT; fi
    printf '%-28s sha=%-5s reclaim=%-9s dirty=%-3s expect=%s\n' "$id" "$p1" "$p2" "$dirty" "$expect"
done

echo ""
echo "===== RELATIONAL-GEOMETRY DIRTY ITEM ====="
git -C "$WORKTREES/ain-relational-geometry" status --short 2>/dev/null || echo "(not present)"

echo ""
echo "===== DISK ====="
df -h /System/Volumes/Data 2>/dev/null || df -h /

echo ""
echo "===== ALL VOLUMES ====="
df -h 2>/dev/null | head -20

echo ""
echo "===== APFS CONTAINER ====="
if command -v diskutil >/dev/null 2>&1; then
    diskutil apfs list 2>/dev/null | grep -E "Container |Capacity|APFS Volume Disk|Snapshot" | head -30
else
    echo "(diskutil unavailable — not macOS)"
fi

echo ""
echo "===== PURGEABLE / FREE DETAIL ====="
if command -v diskutil >/dev/null 2>&1; then
    diskutil info /System/Volumes/Data 2>/dev/null | grep -iE "free space|available|purgeable|container total"
else
    echo "(diskutil unavailable — not macOS)"
fi

echo ""
echo "===== LOCAL TIME MACHINE SNAPSHOTS ====="
if command -v tmutil >/dev/null 2>&1; then
    snaps="$(tmutil listlocalsnapshots / 2>/dev/null)"
    if [ -n "$snaps" ]; then echo "$snaps" | head -30; else echo "(no local snapshots)"; fi
else
    echo "(tmutil unavailable — not macOS)"
fi

echo ""
echo "===== HOME TOP-LEVEL ====="
du -h -d1 "$HOME" 2>/dev/null | sort -rh | head -15

echo ""
echo "===== SUSPECTS ====="
du -sh "$HOME/Library/Containers/com.docker.docker" \
       "$HOME/Library/Developer/Xcode/DerivedData" \
       "$HOME/Library/Developer/CoreSimulator" \
       "$HOME/Library/Caches" \
       "$HOME/Library/Logs" 2>/dev/null

echo ""
echo "===== REPO ====="
du -sh "$REPO/node_modules" "$REPO/.next" "$REPO/.git" 2>/dev/null

echo ""
echo "===== WORKTREES ====="
du -sh "$WORKTREES" 2>/dev/null

echo ""
echo "===== TMPDIR (deploy snapshots) ====="
du -h -d1 "${TMPDIR:-/tmp}" 2>/dev/null | sort -rh | head -10

echo ""
echo "===== DOCKER ====="
docker system df 2>/dev/null || echo "(docker not running or not installed)"
