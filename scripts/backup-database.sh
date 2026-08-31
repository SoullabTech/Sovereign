#!/bin/bash
# MAIA Database Backup Script
# Backs up critical user data tables to timestamped SQL files

set -e

# === QUARANTINED — NOT the canonical database backup ======================
# Canonical DB backup: scripts/backup-postgres.sh (full pg_dump -> gzip ->
# ~/MAIA-SOVEREIGN/database/backups/; cron-scheduled and restore-verified —
# see docs/ops/CONTINUITY_RECOVERY_RUNBOOK.md).
# This script is a PARTIAL export (only the 12 tables listed below, not the
# whole database), its BACKUP_DIR defaults to a macOS path that does not exist
# on the production host, and it prints "Backup complete!" regardless — a
# false-confidence footgun. Retained for reference; refuses to run unless
# invoked explicitly with --force-legacy.
if [ "${1:-}" != "--force-legacy" ]; then
  echo "DEPRECATED/QUARANTINED: use scripts/backup-postgres.sh for database backups." >&2
  echo "  (This backs up only 12 tables to a possibly-nonexistent path; it is NOT the canonical backup.)" >&2
  echo "  Re-run with --force-legacy only if you specifically need this legacy partial export." >&2
  exit 2
fi
shift

BACKUP_DIR="${BACKUP_DIR:-/Users/soullab/maia-backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/maia_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔐 Starting MAIA database backup..."
echo "📁 Backup location: $BACKUP_FILE"

# List of critical tables to back up
CRITICAL_TABLES=(
  "members"
  "quick_journal_entries"
  "reflection_capsules"
  "conversation_turns"
  "member_settings"
  "elemental_journal_entries"
  "holoflower_journal_entries"
  "scribe_sessions"
  "scribe_markers"
  "scribe_transcript_entries"
  "maia_sessions"
  "maia_turns"
)

# Dump each table
for table in "${CRITICAL_TABLES[@]}"; do
  echo "  📦 Backing up $table..."
  docker exec maia-postgres pg_dump -U soullab -d maia_consciousness \
    --table="$table" \
    --data-only \
    --inserts 2>/dev/null >> "$BACKUP_FILE" || echo "  ⚠️  Table $table not found or empty"
done

# Also dump the full schema (for recovery purposes)
SCHEMA_FILE="$BACKUP_DIR/maia_schema_$TIMESTAMP.sql"
echo "  📋 Backing up schema..."
docker exec maia-postgres pg_dump -U soullab -d maia_consciousness \
  --schema-only \
  --no-owner \
  --no-privileges 2>/dev/null > "$SCHEMA_FILE"

# Compress backups
echo "  🗜️  Compressing backups..."
gzip "$BACKUP_FILE"
gzip "$SCHEMA_FILE"

# Calculate sizes
DATA_SIZE=$(ls -lh "${BACKUP_FILE}.gz" 2>/dev/null | awk '{print $5}')
SCHEMA_SIZE=$(ls -lh "${SCHEMA_FILE}.gz" 2>/dev/null | awk '{print $5}')

echo ""
echo "✅ Backup complete!"
echo "   Data backup: ${BACKUP_FILE}.gz ($DATA_SIZE)"
echo "   Schema backup: ${SCHEMA_FILE}.gz ($SCHEMA_SIZE)"
echo ""

# Keep only last 30 days of backups
echo "🧹 Cleaning old backups (keeping last 30 days)..."
find "$BACKUP_DIR" -name "maia_backup_*.sql.gz" -mtime +30 -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "maia_schema_*.sql.gz" -mtime +30 -delete 2>/dev/null || true

BACKUP_COUNT=$(ls "$BACKUP_DIR"/maia_backup_*.sql.gz 2>/dev/null | wc -l | tr -d ' ')
echo "   Retained backups: $BACKUP_COUNT"
echo ""
echo "🔒 To restore, use:"
echo "   gunzip < ${BACKUP_FILE}.gz | docker exec -i maia-postgres psql -U soullab -d maia_consciousness"
