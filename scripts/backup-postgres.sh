#!/bin/bash
# MAIA Postgres Daily Backup Script

BACKUP_DIR="$HOME/MAIA-SOVEREIGN/database/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/maia_backup_$TIMESTAMP.sql"
ERR_FILE="$BACKUP_DIR/last_backup_error.log"

mkdir -p "$BACKUP_DIR"

# Create backup. Capture pg_dump's stderr so a failure's REASON is preserved in
# the log instead of being discarded (was `2>/dev/null`, which hid why a failed
# backup failed).
docker exec maia-postgres pg_dump -U soullab maia_consciousness > "$BACKUP_FILE" 2>"$ERR_FILE"
DUMP_RC=$?

if [ "$DUMP_RC" -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
    gzip "$BACKUP_FILE"
    rm -f "$ERR_FILE"
    echo "[$(date)] Backup created: ${BACKUP_FILE}.gz"

    # Retention: the dump above is gzipped to *.sql.gz, so this pattern matches.
    # Keep the last $RETENTION_DAYS days.
    find "$BACKUP_DIR" -name "maia_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
else
    echo "[$(date)] Backup FAILED (pg_dump rc=$DUMP_RC). Reason:"
    sed 's/^/    /' "$ERR_FILE" 2>/dev/null || echo "    (no error output captured)"
    rm -f "$BACKUP_FILE"
    exit 1
fi
