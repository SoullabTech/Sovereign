#!/usr/bin/env bash
# MAIA Enterprise Database Restore Script
# Restore from compressed database backup with safety checks
set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="${HOME}/maia_backups"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Logging function
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S'): $1" | tee -a "${LOG_FILE}"
}

# Error handling
error_exit() {
    log "${RED}❌ ERROR: $1${NC}"
    exit 1
}

# Usage check
BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ]; then
    echo -e "${RED}Usage: $0 /path/to/backup.sql.gz${NC}"
    echo ""
    echo -e "${BLUE}Available backups in ${BACKUP_DIR}:${NC}"
    if ls -1t "${BACKUP_DIR}"/maia_*.sql.gz 2>/dev/null | head -5; then
        echo ""
        echo -e "${YELLOW}Tip: Use the most recent backup (top of list)${NC}"
    else
        echo -e "${YELLOW}No backups found in ${BACKUP_DIR}${NC}"
    fi
    exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    error_exit "Backup file not found: $BACKUP_FILE"
fi

# Check for DATABASE_URL
if [ -z "${DATABASE_URL:-}" ]; then
    error_exit "DATABASE_URL environment variable is not set"
fi

# Create backup directory for logging
mkdir -p "$BACKUP_DIR"

log "${BLUE}🔄 Starting MAIA Enterprise Database Restore${NC}"
log "Restore file: $(basename "$BACKUP_FILE")"

# Get backup file info
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
BACKUP_DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$BACKUP_FILE" 2>/dev/null || stat -c "%y" "$BACKUP_FILE" 2>/dev/null | cut -d'.' -f1)

echo -e "${BLUE}📋 Backup Information:${NC}"
echo "  File: $(basename "$BACKUP_FILE")"
echo "  Size: $BACKUP_SIZE"
echo "  Date: $BACKUP_DATE"
echo ""

# Check if gunzip and psql are available
if ! command -v gunzip >/dev/null 2>&1; then
    error_exit "gunzip not found. Please install gzip tools"
fi

if ! command -v psql >/dev/null 2>&1; then
    error_exit "psql not found. Please install PostgreSQL client tools"
fi

# Verify backup file integrity
echo -e "${BLUE}🔍 Verifying backup file integrity...${NC}"
if gunzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${GREEN}✅ Backup file integrity verified${NC}"
else
    error_exit "Backup file appears to be corrupted or invalid"
fi

# Safety confirmation
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will completely overwrite the current database!${NC}"
echo -e "${YELLOW}⚠️  All existing data will be lost and replaced with backup data.${NC}"
echo ""
echo -e "${RED}Press Ctrl+C within 3 seconds to abort...${NC}"
echo ""

# 3-second countdown
for i in 3 2 1; do
    echo -e "${YELLOW}Proceeding in ${i}...${NC}"
    sleep 1
done

echo ""
log "${BLUE}🚀 Starting database restore operation...${NC}"

# Perform the restore
echo -e "${BLUE}Decompressing and restoring database...${NC}"
start_time=$(date +%s)

if gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL" >/dev/null 2>&1; then
    end_time=$(date +%s)
    duration=$((end_time - start_time))

    log "${GREEN}✅ Database restore completed successfully${NC}"
    log "Restore duration: ${duration} seconds"
    log "Restored from: $(basename "$BACKUP_FILE")"
    log "Backup date: $BACKUP_DATE"

    echo ""
    echo -e "${GREEN}🎉 MAIA Enterprise Database Restore Complete${NC}"
    echo -e "${GREEN}✅ Database successfully restored from backup${NC}"
    echo "  Backup: $(basename "$BACKUP_FILE")"
    echo "  Size: $BACKUP_SIZE"
    echo "  Duration: ${duration} seconds"

else
    error_exit "Database restore failed. Check DATABASE_URL and backup file integrity"
fi

# Suggest next steps
echo ""
echo -e "${BLUE}📝 Recommended next steps:${NC}"
echo "  1. Test application functionality"
echo "  2. Verify critical data is present"
echo "  3. Run health checks via control center"
echo ""

log "${GREEN}🎉 Enterprise restore operation completed successfully${NC}"

exit 0