#!/usr/bin/env bash
# MAIA Enterprise Database Backup Script
# Nightly backup solution with retention management
set -euo pipefail

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${HOME}/maia_backups"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S'): $1" | tee -a "${LOG_FILE}"
}

# Error handling
error_exit() {
    log "${RED}❌ ERROR: $1${NC}"
    exit 1
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "${BLUE}📦 Starting MAIA Enterprise Database Backup${NC}"

# Check for DATABASE_URL
if [ -z "${DATABASE_URL:-}" ]; then
    error_exit "DATABASE_URL environment variable is not set"
fi

log "Backup directory: ${BACKUP_DIR}"
log "Timestamp: ${TIMESTAMP}"

# Generate backup filename
BACKUP_FILE="${BACKUP_DIR}/maia_${TIMESTAMP}.sql.gz"

log "${BLUE}Creating backup: $(basename "$BACKUP_FILE")${NC}"

# Check if pg_dump is available
if ! command -v pg_dump >/dev/null 2>&1; then
    error_exit "pg_dump not found. Please install PostgreSQL client tools"
fi

# Create the backup
if pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"; then
    # Get backup size for logging
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "${GREEN}✅ Backup completed successfully${NC}"
    log "Backup file: $(basename "$BACKUP_FILE")"
    log "Backup size: ${BACKUP_SIZE}"

    # Verify backup file exists and has content
    if [ -s "$BACKUP_FILE" ]; then
        log "${GREEN}✅ Backup file verified (non-empty)${NC}"
    else
        error_exit "Backup file is empty or corrupted"
    fi
else
    error_exit "pg_dump failed to create backup"
fi

# Cleanup old backups (keep last 14)
log "${YELLOW}🧹 Cleaning up old backups (keeping last 14)${NC}"

# Count backups before cleanup
BACKUP_COUNT_BEFORE=$(ls -1 "$BACKUP_DIR"/maia_*.sql.gz 2>/dev/null | wc -l)
log "Backups found: ${BACKUP_COUNT_BEFORE}"

if [ "$BACKUP_COUNT_BEFORE" -gt 14 ]; then
    # Remove old backups
    OLD_BACKUPS=$(ls -1t "$BACKUP_DIR"/maia_*.sql.gz | sed '1,14d')
    if [ -n "$OLD_BACKUPS" ]; then
        echo "$OLD_BACKUPS" | xargs rm -f
        REMOVED_COUNT=$(echo "$OLD_BACKUPS" | wc -l)
        log "${GREEN}✅ Removed ${REMOVED_COUNT} old backups${NC}"
    fi
else
    log "No cleanup needed (${BACKUP_COUNT_BEFORE} backups ≤ 14)"
fi

# Final backup count
BACKUP_COUNT_AFTER=$(ls -1 "$BACKUP_DIR"/maia_*.sql.gz 2>/dev/null | wc -l)
log "Backups retained: ${BACKUP_COUNT_AFTER}"

# Log success summary
log "${GREEN}✅ MAIA Enterprise Database Backup Complete${NC}"
log "Latest backup: $(basename "$BACKUP_FILE") (${BACKUP_SIZE})"
log "Total backups: ${BACKUP_COUNT_AFTER}"

# Display recent backups for verification
log "${BLUE}📋 Recent backups:${NC}"
ls -1t "$BACKUP_DIR"/maia_*.sql.gz 2>/dev/null | head -3 | while read -r backup; do
    backup_name=$(basename "$backup")
    backup_size=$(du -h "$backup" | cut -f1)
    backup_date=$(echo "$backup_name" | sed 's/maia_\([0-9]\{8\}_[0-9]\{6\}\)\.sql\.gz/\1/' | sed 's/_/ /')
    log "  - $backup_name ($backup_size) - $backup_date"
done

log "${GREEN}🎉 Enterprise backup operation completed successfully${NC}"

exit 0