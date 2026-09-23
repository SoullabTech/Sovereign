#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Backup health authority (NAS-BACKUP-01 / R2 §III.D)
# Reads the governed backup state written by maia-backup (R2) and the restore
# witness, and prints ONE line of KEY=VALUE pairs. It never reads a listing of
# files as evidence: a file's existence is not a verified backup.
#
#   BACKUP=verified-current | stale | missing | unreachable
#   BACKUP_AGE_H=<hours since VERIFIED_AT> | ?
#   RESTORE_WITNESS=pass-current | stale | failed | absent | unreachable
#   WITNESS_AGE_H=<hours> | ?
#
# Thresholds: BACKUP_STALE_H (default 26, nightly + slack) ·
#             WITNESS_STALE_H (default 192 = 8 days, weekly + slack)
# Env: BACKUP_ROOT (default /mnt/ds225/maia-backups) · MOUNT_POINT ("" disables)
# Exit 0 always — it reports; health-check.sh decides.
# ═══════════════════════════════════════════════════════════════════════════════
set -u
BACKUP_ROOT="${BACKUP_ROOT:-/mnt/ds225/maia-backups}"
MOUNT_POINT="${MOUNT_POINT-/mnt/ds225}"
BACKUP_STALE_H="${BACKUP_STALE_H:-26}"
WITNESS_STALE_H="${WITNESS_STALE_H:-192}"
STATE_DIR="$BACKUP_ROOT/state"

is_mountpoint() {
  if command -v mountpoint >/dev/null 2>&1; then mountpoint -q "$1"; return $?; fi
  local d p; d=$(stat -c %d "$1" 2>/dev/null || stat -f %d "$1" 2>/dev/null); p=$(stat -c %d "$1/.." 2>/dev/null || stat -f %d "$1/.." 2>/dev/null); [ -n "$d" ] && [ "$d" != "$p" ]
}
epoch_of() {  # ISO-8601 UTC → epoch (GNU date or BSD date)
  date -u -d "$1" +%s 2>/dev/null || date -u -j -f %Y-%m-%dT%H:%M:%SZ "$1" +%s 2>/dev/null || echo ""
}
age_h() { local e; e=$(epoch_of "$1"); [ -n "$e" ] && echo $(( ( $(date -u +%s) - e ) / 3600 )) || echo ""; }

BACKUP=missing; BACKUP_AGE_H="?"; RESTORE_WITNESS=absent; WITNESS_AGE_H="?"

if [ -n "$MOUNT_POINT" ] && ! is_mountpoint "$MOUNT_POINT"; then
  BACKUP=unreachable; RESTORE_WITNESS=unreachable
else
  if [ -f "$STATE_DIR/last-verified-backup.env" ]; then
    VERIFIED_AT=$(sed -n 's/^VERIFIED_AT=//p' "$STATE_DIR/last-verified-backup.env")
    BACKUP_PATH=$(sed -n 's/^BACKUP_PATH=//p' "$STATE_DIR/last-verified-backup.env")
    a=$(age_h "$VERIFIED_AT")
    if [ -z "$a" ] || [ ! -f "$BACKUP_PATH" ]; then BACKUP=missing
    elif [ "$a" -le "$BACKUP_STALE_H" ]; then BACKUP=verified-current; BACKUP_AGE_H=$a
    else BACKUP=stale; BACKUP_AGE_H=$a; fi
  fi
  if [ -f "$STATE_DIR/last-restore-witness.env" ]; then
    W_RESULT=$(sed -n 's/^WITNESS_RESULT=//p' "$STATE_DIR/last-restore-witness.env")
    W_AT=$(sed -n 's/^WITNESS_AT=//p' "$STATE_DIR/last-restore-witness.env")
    a=$(age_h "$W_AT"); WITNESS_AGE_H="${a:-?}"
    if [ "$W_RESULT" != "PASS" ]; then RESTORE_WITNESS=failed
    elif [ -n "$a" ] && [ "$a" -le "$WITNESS_STALE_H" ]; then RESTORE_WITNESS=pass-current
    else RESTORE_WITNESS=stale; fi
  fi
fi
echo "BACKUP=$BACKUP BACKUP_AGE_H=$BACKUP_AGE_H RESTORE_WITNESS=$RESTORE_WITNESS WITNESS_AGE_H=$WITNESS_AGE_H"
