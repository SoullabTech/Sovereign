#!/bin/bash

# MAIA Auto-Backup System with Rotation
# Automated timestamped backups with intelligent cleanup

set -e

# === QUARANTINED — file/source snapshot, NOT a database backup ============
# This tars app/, lib/, components/, ... to "$(pwd)/backups" (relative to
# wherever it is run) — it does NOT back up the database. For DB backups use
# the canonical scripts/backup-postgres.sh (see
# docs/ops/CONTINUITY_RECOVERY_RUNBOOK.md). Its "Backup complete" output has
# been mistaken for a database backup. Retained for reference; refuses to run
# unless invoked explicitly with --force-legacy.
if [ "${1:-}" != "--force-legacy" ]; then
  echo "DEPRECATED/QUARANTINED: this is a FILE/source snapshot, not a database backup." >&2
  echo "  For database backups use scripts/backup-postgres.sh." >&2
  echo "  Re-run with --force-legacy only if you specifically want a source-tree tarball." >&2
  exit 2
fi
shift

# Configuration
BACKUP_DIR="$(pwd)/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MAX_BACKUPS=10

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
NC='\\033[0m'

echo -e "${BLUE}📦 MAIA Auto-Backup System${NC}"
echo "=================================="

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Create backup filename
BACKUP_FILE="$BACKUP_DIR/maia-backup-$TIMESTAMP.tar.gz"

echo -e "${YELLOW}Creating backup: $(basename $BACKUP_FILE)${NC}"

# Create comprehensive backup
tar -czf "$BACKUP_FILE" \
  --exclude=".next" \
  --exclude="node_modules" \
  --exclude="logs/*.log" \
  --exclude="backups" \
  --exclude=".git" \
  app/ \
  lib/ \
  components/ \
  pages/ \
  public/ \
  scripts/ \
  docker-compose.yml \
  docker-compose.staging.yml \
  package.json \
  package-lock.json \
  next.config.js \
  tailwind.config.js \
  tsconfig.json \
  .env.template \
  2>/dev/null || true

# Check if backup was successful
if [ -f "$BACKUP_FILE" ]; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo -e "${GREEN}✅ Backup created successfully: $BACKUP_SIZE${NC}"
else
  echo -e "${RED}❌ Backup failed!${NC}"
  exit 1
fi

# Backup rotation - keep only MAX_BACKUPS
cd "$BACKUP_DIR"
BACKUP_COUNT=$(ls -1 maia-backup-*.tar.gz 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
  echo -e "${YELLOW}🧹 Rotating backups (keeping $MAX_BACKUPS most recent)${NC}"

  # Remove oldest backups
  ls -1t maia-backup-*.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | while read -r old_backup; do
    echo "  Removing: $old_backup"
    rm -f "$old_backup"
  done
fi

# Create symlink to latest backup
ln -sf "maia-backup-$TIMESTAMP.tar.gz" "latest.tar.gz"

# Log backup completion
echo "$(date): Backup completed - $BACKUP_FILE ($BACKUP_SIZE)" >> backup.log

echo -e "${GREEN}📋 Backup Summary:${NC}"
echo "  File: $(basename $BACKUP_FILE)"
echo "  Size: $BACKUP_SIZE"
echo "  Total backups: $(ls -1 maia-backup-*.tar.gz 2>/dev/null | wc -l)"
echo "  Latest symlink: latest.tar.gz"

# Optional: Send notification if webhook is configured
if [ -n "$BACKUP_WEBHOOK_URL" ]; then
  curl -H "Content-Type: application/json" -X POST \
    -d "{\"content\": \"📦 MAIA Backup completed: $BACKUP_SIZE at $(date)\"}" \
    "$BACKUP_WEBHOOK_URL" 2>/dev/null || true
fi