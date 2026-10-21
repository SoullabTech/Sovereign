#!/bin/bash
# Pull encrypted MAIA backups from minisforum to a second machine (Mac Studio
# or any box that can `ssh soullab@minisforum`). Pull model: the production
# host holds no credentials to anywhere.
#
# Everything transferred is already GPG-encrypted; this script never sees
# plaintext member data. Optionally relays to cloud via rclone from HERE, so
# cloud credentials also live off the production host.
set -euo pipefail

SRC="${SRC:-soullab@minisforum:backups/offsite/}"
VAULT="${VAULT:-$HOME/MAIA-BACKUPS/offsite}"
RCLONE_REMOTE="${RCLONE_REMOTE:-}"     # optional cloud relay, e.g. "b2:maia-backups/offsite"
HEARTBEAT_URL="${HEARTBEAT_URL:-}"     # separate check from the backup job's

mkdir -p "$VAULT"
chmod 700 "$VAULT"

rsync -az --include='maia_*.dump.gpg' --include='maia_*.manifest.txt' --exclude='*' \
  "$SRC" "$VAULT/"

latest=$(ls -1t "$VAULT"/maia_*.dump.gpg 2>/dev/null | head -1)
[ -n "$latest" ] || { echo "PULL FAILED: no artifacts in $VAULT" >&2; exit 1; }

# Integrity: recompute sha256 and compare with the manifest written at dump time.
manifest="${latest%.dump.gpg}.manifest.txt"
if [ -f "$manifest" ]; then
  want=$(awk '/^sha256_encrypted:/ {print $2}' "$manifest")
  have=$(shasum -a 256 "$latest" 2>/dev/null | awk '{print $1}' || sha256sum "$latest" | awk '{print $1}')
  [ "$want" = "$have" ] || { echo "PULL FAILED: sha256 mismatch on $(basename "$latest")" >&2; exit 1; }
fi

if [ -n "$RCLONE_REMOTE" ]; then
  command -v rclone >/dev/null || { echo "RCLONE_REMOTE set but rclone not installed" >&2; exit 1; }
  rclone copy "$VAULT/" "$RCLONE_REMOTE/" --checksum --include 'maia_*'
fi

[ -n "$HEARTBEAT_URL" ] && curl -fsS -m 10 --retry 3 "$HEARTBEAT_URL" >/dev/null 2>&1 || true
echo "[$(date -u +%FT%TZ)] PULL OK latest=$(basename "$latest") vault=$VAULT relayed=${RCLONE_REMOTE:-no}"
