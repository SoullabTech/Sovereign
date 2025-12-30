#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA Sovereign - Database Backup Script
# ═══════════════════════════════════════════════════════════════════════════════
# Run manually or via cron for nightly backups
#
# Usage:
#   ./scripts/backup-db.sh
#
# Cron example (nightly at 3am):
#   0 3 * * * /opt/maia/scripts/backup-db.sh >> /var/log/maia-backup.log 2>&1
# ═══════════════════════════════════════════════════════════════════════════════

set -e

BACKUP_DIR="${BACKUP_DIR:-/opt/maia/backups}"
CONTAINER_NAME="${POSTGRES_CONTAINER:-maia-postgres}"
DB_NAME="${DB_NAME:-maia_consciousness}"
DB_USER="${DB_USER:-soullab}"
KEEP_DAYS="${KEEP_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/maia_$TIMESTAMP.sql.gz"

echo "[$(date)] Starting backup..."

# Dump and compress
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"

# Verify
if [ -s "$BACKUP_FILE" ]; then
    SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo "[$(date)] ✅ Backup created: $BACKUP_FILE ($SIZE)"
else
    echo "[$(date)] ❌ Backup failed: empty file"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Rotate old backups
echo "[$(date)] Rotating backups older than $KEEP_DAYS days..."
find "$BACKUP_DIR" -name "maia_*.sql.gz" -mtime +$KEEP_DAYS -delete

# Summary
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "maia_*.sql.gz" | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "[$(date)] Backups: $BACKUP_COUNT files, $TOTAL_SIZE total"
