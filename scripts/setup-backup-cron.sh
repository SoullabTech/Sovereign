#!/usr/bin/env bash
# MAIA Postgres backup — cron installer (ADDITIVE, idempotent)
#
# Installs a daily cron entry that runs scripts/backup-postgres.sh. It is:
#   • ADDITIVE   — preserves every existing crontab line (it does NOT do a
#                  destructive `echo … | crontab -` replace; it reads the
#                  current crontab first, appends one line, and writes it back).
#   • IDEMPOTENT — re-running won't add a duplicate.
#   • PORTABLE   — derives the repo path from its own location (no hardcoded
#                  /Users/... dev path) and runs the docker-based backup script
#                  (no DATABASE_URL needed).
#
# Usage:
#   ./scripts/setup-backup-cron.sh                       # install (02:00 daily)
#   SCHEDULE="30 1 * * *" ./scripts/setup-backup-cron.sh # custom schedule
#   ./scripts/setup-backup-cron.sh --remove              # remove ONLY our line
#
# Alternative (systemd, when sudo / lingering is available): see
# scripts/systemd/maia-backup.{service,timer}.
set -euo pipefail

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_SCRIPT="$REPO_DIR/scripts/backup-postgres.sh"
LOG_FILE="$REPO_DIR/database/backups/backup.log"
SCHEDULE="${SCHEDULE:-0 2 * * *}"
MARKER="backup-postgres.sh"   # idempotency / removal marker

if [ ! -f "$BACKUP_SCRIPT" ]; then
  echo -e "${RED}❌ Backup script not found: $BACKUP_SCRIPT${NC}"; exit 1
fi

# --remove: strip ONLY our line; never touch other entries, never `crontab -r`.
if [ "${1:-}" = "--remove" ]; then
  if crontab -l 2>/dev/null | grep -q "$MARKER"; then
    crontab -l 2>/dev/null | grep -v "$MARKER" | crontab -
    echo -e "${GREEN}✅ Removed the MAIA backup cron line (all other entries preserved).${NC}"
  else
    echo -e "${YELLOW}No MAIA backup cron line found; nothing to remove.${NC}"
  fi
  exit 0
fi

# Robust PATH for cron's minimal environment, so `docker` resolves at runtime.
DOCKER_BIN="$(command -v docker || echo /usr/bin/docker)"
CRON_PATH="$(dirname "$DOCKER_BIN"):/usr/local/bin:/usr/bin:/bin"
CRON_LINE="$SCHEDULE cd $REPO_DIR && PATH=$CRON_PATH bash scripts/backup-postgres.sh >> $LOG_FILE 2>&1"

echo -e "${BLUE}🎛️  MAIA Postgres backup — additive cron install${NC}"
echo "  schedule : $SCHEDULE"
echo "  runs     : $BACKUP_SCRIPT"
echo "  logs     : $LOG_FILE"
echo ""

# Idempotent: skip if our line already present.
if crontab -l 2>/dev/null | grep -q "$MARKER"; then
  echo -e "${YELLOW}⚠️  A MAIA backup cron line already exists — leaving it unchanged:${NC}"
  crontab -l 2>/dev/null | grep "$MARKER"
  echo "   (Run with --remove first if you want to reinstall on a new schedule.)"
  exit 0
fi

mkdir -p "$(dirname "$LOG_FILE")"

# ADDITIVE install: keep all existing lines, append ours.
( crontab -l 2>/dev/null; echo "$CRON_LINE" ) | crontab -

echo -e "${GREEN}✅ Installed (existing crontab entries preserved):${NC}"
crontab -l 2>/dev/null
echo ""
echo -e "${BLUE}Tail the log:${NC}   tail -f $LOG_FILE"
echo -e "${BLUE}Remove safely:${NC}  ./scripts/setup-backup-cron.sh --remove"
echo -e "${YELLOW}Never use 'crontab -r' — it deletes ALL of your cron jobs, not just this one.${NC}"
