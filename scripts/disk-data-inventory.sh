#!/usr/bin/env bash
# Read-only inventory of DATA-PLACEMENT candidates on the Mac Studio.
# Measures and identifies. Deletes nothing, moves nothing, changes no settings.
#
#   bash scripts/disk-data-inventory.sh
#
# Written for the 2026-09-11 boundary: cache reclamation is exhausted (5.6 → 38 GiB
# recovered), and the remaining mass is durable data whose correct operation is
# archive/offload, not rm. Per docs/ops/STORAGE_CLASSIFICATION_POLICY.md, nothing
# here may be removed before an independent, verified copy exists — a synced copy
# is not custody.

echo "===== FREE ====="
df -h /System/Volumes/Data 2>/dev/null || df -h /

echo ""
echo "===== VOICE MEMOS ====="
for p in "$HOME/Library/Group Containers/group.com.apple.VoiceMemos.shared" \
         "$HOME/Library/Application Support/com.apple.voicememos"; do
    [ -d "$p" ] && du -sh "$p" 2>/dev/null
done
rec="$HOME/Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings"
if [ -d "$rec" ]; then
    echo "recordings on disk: $(find "$rec" -type f \( -name '*.m4a' -o -name '*.caf' \) 2>/dev/null | wc -l | tr -d ' ')"
    echo "oldest / newest:"
    find "$rec" -type f \( -name '*.m4a' -o -name '*.caf' \) -exec stat -f '%Sm %N' -t '%Y-%m-%d' {} \; 2>/dev/null | sort | sed -n '1p;$p'
fi

echo ""
echo "===== MESSAGES ====="
du -sh "$HOME/Library/Messages" 2>/dev/null
du -h -d1 "$HOME/Library/Messages" 2>/dev/null | sort -rh | head -8

echo ""
echo "===== MOBILESYNC BACKUPS ====="
bk="$HOME/Library/Application Support/MobileSync/Backup"
if [ -d "$bk" ]; then
    for d in "$bk"/*/; do
        [ -d "$d" ] || continue
        size="$(du -sh "$d" 2>/dev/null | cut -f1)"
        name="$(defaults read "$d/Info.plist" 'Device Name' 2>/dev/null || echo '?')"
        prod="$(defaults read "$d/Info.plist" 'Product Name' 2>/dev/null || echo '?')"
        last="$(defaults read "$d/Info.plist" 'Last Backup Date' 2>/dev/null || echo '?')"
        printf '%8s  %-22s %-14s %s\n' "$size" "$name" "$prod" "$last"
    done
else
    echo "(no MobileSync backups)"
fi

echo ""
echo "===== APPLICATION SUPPORT — top 25 ====="
du -h -d1 "$HOME/Library/Application Support" 2>/dev/null | sort -rh | head -25

echo ""
echo "===== CONTAINERS / GROUP CONTAINERS — top 10 each ====="
du -h -d1 "$HOME/Library/Containers" 2>/dev/null | sort -rh | head -10
echo "---"
du -h -d1 "$HOME/Library/Group Containers" 2>/dev/null | sort -rh | head -10

echo ""
echo "===== DOCKER (if reachable) ====="
docker system df 2>/dev/null || echo "(docker not reachable)"
