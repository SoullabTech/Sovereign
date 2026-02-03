#!/bin/bash

# SESSION REMINDERS CRON SCRIPT
# Run this every 5-10 minutes to process session reminders
#
# Sends reminders to:
# - Clients: WhatsApp + SMS at 24h and 1h before
# - Practitioner (you): Telegram + SMS at 24h, 1h, and 15m before
#
# Setup (macOS launchd):
#   1. Copy the plist to ~/Library/LaunchAgents/
#   2. launchctl load ~/Library/LaunchAgents/life.soullab.session-reminders.plist
#
# Manual test:
#   ./scripts/session-reminders-cron.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# API endpoint - development uses localhost
API_URL="http://localhost:3005"

# Cron secret for authentication
CRON_SECRET="badf9f0555895fec46bbf2e50a5bd9053bdb6bdb4e63faedfdb548a19d7f7800"

echo "[$(date)] Running session reminders..."

# Call the cron endpoint
response=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$API_URL/api/cron/session-reminders")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo "[$(date)] Success: $body"
else
  echo "[$(date)] Error ($http_code): $body"
fi
