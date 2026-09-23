#!/bin/bash
# MAIA Postgres Daily Backup Script

BACKUP_DIR="$HOME/MAIA-SOVEREIGN/database/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/maia_backup_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

# Create backup
docker exec maia-postgres pg_dump -U soullab maia_consciousness > "$BACKUP_FILE" 2>/dev/null

if [ $? -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
    gzip "$BACKUP_FILE"
    # NAS-BACKUP-01/R2 §III.E: this job is kept as the independent SECONDARY tier
    # (local disk; it held the only intact 18 Sep dump). A tier that cannot tell
    # a truncated file from a good one is not a tier: verify before claiming.
    if ! gzip -t "${BACKUP_FILE}.gz" 2>/dev/null; then
        echo "[$(date)] Backup FAILED integrity check, removing: ${BACKUP_FILE}.gz"
        rm -f "${BACKUP_FILE}.gz"
        exit 1
    fi
    echo "[$(date)] Backup created + verified: ${BACKUP_FILE}.gz ($(stat -c %s "${BACKUP_FILE}.gz" 2>/dev/null || stat -f %z "${BACKUP_FILE}.gz") bytes)"
    
    # Clean up old backups (keep last 30 days)
    find "$BACKUP_DIR" -name "maia_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
else
    echo "[$(date)] Backup FAILED"
    rm -f "$BACKUP_FILE"
    exit 1
fi
