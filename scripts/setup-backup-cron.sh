#!/usr/bin/env bash
# MAIA Enterprise Backup Cron Setup Script
# Sets up automated nightly database backups at 3:00 AM
set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎛️ MAIA Enterprise Backup Cron Setup${NC}"
echo "======================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
    echo -e "${YELLOW}⚠️ DATABASE_URL environment variable is not currently set.${NC}"
    echo ""
    echo -e "${BLUE}📝 To set up automated backups, you need to:${NC}"
    echo ""
    echo "1. Find your actual DATABASE_URL connection string"
    echo "   (Check your .env file or docker-compose.yml)"
    echo ""
    echo "2. Run this command with your DATABASE_URL:"
    echo "   export DATABASE_URL='your_connection_string_here'"
    echo "   ./scripts/setup-backup-cron.sh"
    echo ""
    echo -e "${YELLOW}💡 Common DATABASE_URL formats:${NC}"
    echo "   postgresql://user:password@localhost:5432/database_name"
    echo "   postgresql://postgres:postgres@localhost:5432/maia_database"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ DATABASE_URL detected${NC}"
echo ""

# Check if backup script exists and is executable
BACKUP_SCRIPT="/Users/soullab/MAIA-SOVEREIGN/scripts/backup-db.sh"
if [ ! -x "$BACKUP_SCRIPT" ]; then
    echo -e "${RED}❌ Backup script not found or not executable: $BACKUP_SCRIPT${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backup script verified${NC}"

# Create the crontab entry
CRON_ENTRY="# MAIA Enterprise Database Backup - Nightly at 3:00 AM
DATABASE_URL=\"$DATABASE_URL\"
PATH=/usr/local/bin:/usr/bin:/bin

# Run backup script every night at 3:00 AM
0 3 * * * $BACKUP_SCRIPT"

# Show the user what will be installed
echo -e "${BLUE}📋 The following cron job will be installed:${NC}"
echo ""
echo "$CRON_ENTRY"
echo ""

# Ask for confirmation
echo -e "${YELLOW}⚠️ This will replace any existing crontab. Continue? [y/N]:${NC} "
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Setup cancelled.${NC}"
    exit 0
fi

# Install the cron job
echo "$CRON_ENTRY" | crontab -

echo ""
echo -e "${GREEN}✅ Cron job installed successfully!${NC}"
echo ""

# Verify installation
echo -e "${BLUE}📋 Verifying cron job installation:${NC}"
crontab -l

echo ""
echo -e "${GREEN}🎉 MAIA Enterprise Backup Automation Complete!${NC}"
echo ""
echo -e "${BLUE}📝 Summary:${NC}"
echo "  • Nightly backups scheduled for 3:00 AM"
echo "  • Backups stored in: $HOME/maia_backups"
echo "  • Retention: Last 14 backups kept"
echo "  • Logs: $HOME/maia_backups/backup.log"
echo ""
echo -e "${BLUE}🔧 Management commands:${NC}"
echo "  • View cron jobs: crontab -l"
echo "  • Remove cron jobs: crontab -r"
echo "  • Manual backup: $BACKUP_SCRIPT"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "  1. Test manual backup: $BACKUP_SCRIPT"
echo "  2. Use control center option [4] to test backup integration"
echo "  3. Verify first automated backup runs at 3:00 AM"

exit 0