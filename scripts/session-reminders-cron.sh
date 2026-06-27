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

# Cron secret for authentication — NEVER hardcode it here.
# The route allows unauthenticated calls when NODE_ENV=development
# (see app/api/cron/session-reminders/route.ts), so this script works against
# a local dev server with no secret at all. For a non-dev target, export
# CRON_SECRET in your shell, or place it in .env.local (gitignored) and it is
# sourced below. Mirrors the prod host scripts, which read CRON_SECRET from
# .env.production rather than embedding it.
if [ -z "${CRON_SECRET:-}" ] && [ -f "$PROJECT_DIR/.env.local" ]; then
  CRON_SECRET="$(grep -E '^CRON_SECRET=' "$PROJECT_DIR/.env.local" | head -1 | cut -d '=' -f2- | tr -d '"' | tr -d "'")"
fi

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
