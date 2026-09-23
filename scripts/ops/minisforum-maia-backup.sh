#!/bin/bash
# MAIA Sovereign — Nightly Backup Script
# Backs up PostgreSQL and media to DS225 NAS
# Retention: 14 daily, 8 weekly, 12 monthly
#
# ── Repository copy, recovered 2026-09-23 ─────────────────────────────────────
# This file is a VERBATIM copy of /usr/local/bin/maia-backup on the minisforum
# (production), recovered read-only so the one live NAS integration is visible
# and governed. The minisforum copy is the one that runs; this copy runs nowhere.
# Do not "fix" it here and assume production changed — changing production is a
# separate act. Scheduling and mount, as found:
#
#   /etc/cron.d/maia-backup:
#     0 2 * * * root /usr/local/bin/maia-backup
#   /etc/fstab:
#     //192.168.0.103/soullab-backups /mnt/ds225 cifs \
#       credentials=/etc/cifs-credentials-ds225,uid=1000,gid=1000,vers=3.0,_netdev,x-systemd.automount 0 0
#     (credentials file NOT copied; it authenticates as NAS user `maia-backup`)
#
# See docs/ops/NAS_RECOVERY_AND_MIRROR_2026-09-23.md §3a for findings.
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

BACKUP_ROOT="/mnt/ds225/maia-backups"
POSTGRES_DIR="$BACKUP_ROOT/postgres"
MEDIA_DIR="$BACKUP_ROOT/media"
MANIFEST_DIR="$BACKUP_ROOT/manifests"
LOG_FILE="/var/log/maia-backup.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y%m%d)
DOW=$(date +%u)   # 1=Monday 7=Sunday
DOM=$(date +%d)   # day of month

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

log "=== MAIA backup started ==="

# --- Mount check ---
if ! mountpoint -q /mnt/ds225; then
    log "ERROR: /mnt/ds225 not mounted. Aborting."
    exit 1
fi

# --- Disk space check ---
AVAIL=$(df /mnt/ds225 | awk 'NR==2{print $4}')
if [ "$AVAIL" -lt 10485760 ]; then  # 10GB minimum
    log "ERROR: Less than 10GB free on DS225. Aborting."
    exit 1
fi

# --- PostgreSQL backup ---
log "Starting PostgreSQL backup..."
PG_FILE="$POSTGRES_DIR/maia_${TIMESTAMP}.sql.gz"
docker exec maia-postgres pg_dump -U soullab maia_consciousness | gzip > "$PG_FILE"
PG_SIZE=$(du -sh "$PG_FILE" | cut -f1)
log "PostgreSQL backup complete: $PG_FILE ($PG_SIZE)"

# --- Media backup (incremental rsync) ---
log "Starting media backup..."
MEDIA_SOURCE="/var/lib/docker/volumes"
# Find the maia media volume
MEDIA_VOL=$(docker inspect maia-sovereign --format '{{range .Mounts}}{{if eq .Destination "/app/data/media"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || echo "")
if [ -n "$MEDIA_VOL" ] && [ -d "$MEDIA_VOL" ]; then
    rsync -a --delete --stats "$MEDIA_VOL/" "$MEDIA_DIR/" 2>&1 | tail -5 | tee -a "$LOG_FILE"
    log "Media backup complete: $MEDIA_DIR"
else
    log "WARNING: Could not find media volume path. Skipping media backup."
fi

# --- Retention: keep 14 daily, 8 weekly (Sunday), 12 monthly (1st) ---
log "Applying retention policy..."
# Keep monthly (1st of month)
if [ "$DOM" = "01" ]; then
    cp "$PG_FILE" "$POSTGRES_DIR/monthly_${DATE}.sql.gz" 2>/dev/null || true
fi
# Keep weekly (Sunday)
if [ "$DOW" = "7" ]; then
    cp "$PG_FILE" "$POSTGRES_DIR/weekly_${DATE}.sql.gz" 2>/dev/null || true
fi
# Prune dailies older than 14 days
find "$POSTGRES_DIR" -name "maia_*.sql.gz" -mtime +14 -delete
# Prune weeklies older than 56 days
find "$POSTGRES_DIR" -name "weekly_*.sql.gz" -mtime +56 -delete
# Prune monthlies older than 365 days
find "$POSTGRES_DIR" -name "monthly_*.sql.gz" -mtime +365 -delete

# --- Write manifest ---
MANIFEST="$MANIFEST_DIR/manifest_${TIMESTAMP}.txt"
{
    echo "MAIA Backup Manifest"
    echo "Date: $(date)"
    echo "Hostname: $(hostname)"
    echo ""
    echo "PostgreSQL:"
    echo "  File: $PG_FILE"
    echo "  Size: $PG_SIZE"
    echo ""
    echo "Media:"
    du -sh "$MEDIA_DIR" 2>/dev/null | awk '{print "  Size: "$1}'
    echo ""
    echo "DS225 free space: $(df -h /mnt/ds225 | awk 'NR==2{print $4}')"
    echo ""
    echo "Postgres files retained:"
    ls -lh "$POSTGRES_DIR"/*.sql.gz 2>/dev/null | awk '{print "  "$NF" "$5}'
} > "$MANIFEST"

log "Manifest written: $MANIFEST"
log "=== MAIA backup complete ==="
