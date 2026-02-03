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
    echo "[$(date)] Backup created: ${BACKUP_FILE}.gz"
    
    # Clean up old backups (keep last 30 days)
    find "$BACKUP_DIR" -name "maia_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
else
    echo "[$(date)] Backup FAILED"
    rm -f "$BACKUP_FILE"
    exit 1
fi
