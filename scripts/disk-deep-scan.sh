#!/usr/bin/env bash
# Read-only deep breakdown of user-space disk usage. Deletes nothing.
#
#   bash scripts/disk-deep-scan.sh
#
# Written for the 2026-08-29 disk lane after the volume-wide scan put 312G of
# 418G under /Users. Splits that mass and names concrete reclaimable targets
# with sizes, so cuts are chosen from a ranked list rather than guessed at.
#
# Slow on first run (walks $HOME). Everything here only reads.

HOME_DIR="${HOME}"

echo "===== /Users ====="
du -x -h -d1 /System/Volumes/Data/Users 2>/dev/null | sort -rh | head -10

echo ""
echo "===== HOME depth 1 ====="
du -x -h -d1 "$HOME_DIR" 2>/dev/null | sort -rh | head -25

echo ""
echo "===== ~/Library depth 1 ====="
du -x -h -d1 "$HOME_DIR/Library" 2>/dev/null | sort -rh | head -20

echo ""
echo "===== container / VM engines ====="
du -sh "$HOME_DIR/.docker" "$HOME_DIR/.colima" "$HOME_DIR/.orbstack" "$HOME_DIR/.lima" \
       "$HOME_DIR/Library/Containers/com.docker.docker" 2>/dev/null || echo "(none found)"

echo ""
echo "===== node_modules — top 20 ====="
find "$HOME_DIR" -type d -name node_modules -prune -print 2>/dev/null \
  | while IFS= read -r d; do du -sk "$d" 2>/dev/null; done \
  | sort -rn | head -20 \
  | awk -F'\t' '{printf "%8.2f GB  %s\n", $1/1048576, $2}'

echo ""
echo "===== node_modules — total ====="
find "$HOME_DIR" -type d -name node_modules -prune -print 2>/dev/null \
  | while IFS= read -r d; do du -sk "$d" 2>/dev/null; done \
  | awk -F'\t' '{s+=$1; n++} END {printf "%.2f GB across %d directories\n", s/1048576, n}'

echo ""
echo "===== other build output (.next / target / DerivedData dirs) ====="
find "$HOME_DIR" -type d \( -name .next -o -name target -o -name .turbo \) -prune -print 2>/dev/null \
  | while IFS= read -r d; do du -sk "$d" 2>/dev/null; done \
  | sort -rn | head -15 \
  | awk -F'\t' '{printf "%8.2f GB  %s\n", $1/1048576, $2}'

echo ""
echo "===== files over 1 GB ====="
find "$HOME_DIR" -type f -size +1G 2>/dev/null \
  | while IFS= read -r f; do du -sk "$f" 2>/dev/null; done \
  | sort -rn | head -25 \
  | awk -F'\t' '{printf "%8.2f GB  %s\n", $1/1048576, $2}'

echo ""
echo "===== trash / xcode ====="
du -sh "$HOME_DIR/.Trash" \
       "$HOME_DIR/Library/Developer/Xcode/Archives" \
       "$HOME_DIR/Library/Developer/Xcode/DerivedData" \
       "$HOME_DIR/Library/Developer/Xcode/iOS DeviceSupport" \
       "$HOME_DIR/Library/Developer/CoreSimulator" 2>/dev/null

echo ""
echo "===== snapshots ====="
if command -v tmutil >/dev/null 2>&1; then
    snaps="$(tmutil listlocalsnapshots / 2>/dev/null)"
    if [ -n "$snaps" ]; then echo "$snaps"; else echo "(none)"; fi
else
    echo "(tmutil unavailable — not macOS)"
fi

echo ""
echo "===== free ====="
df -h /System/Volumes/Data 2>/dev/null || df -h /
