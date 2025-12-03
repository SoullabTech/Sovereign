#!/bin/bash

# MAIA Webhook Notification System
# Sends alerts to Discord/Slack/Teams webhooks with intelligent routing

set -e

# Configuration from environment or defaults
WEBHOOK_URL="${SOULGUARD_WEBHOOK:-}"
BACKUP_WEBHOOK="${BACKUP_WEBHOOK_URL:-}"
EMERGENCY_WEBHOOK="${EMERGENCY_WEBHOOK_URL:-}"
ENVIRONMENT="${NODE_ENV:-development}"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Message type and content
MESSAGE_TYPE="${1:-info}"
MESSAGE_CONTENT="${2:-Default notification}"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log locally
log_notification() {
    local log_file="logs/webhook-notifications.log"
    echo "[$TIMESTAMP] [$MESSAGE_TYPE] $MESSAGE_CONTENT" >> "$log_file"
}

# Function to determine webhook URL based on message type
get_webhook_url() {
    case "$MESSAGE_TYPE" in
        "emergency"|"critical"|"error")
            echo "${EMERGENCY_WEBHOOK:-$WEBHOOK_URL}"
            ;;
        "backup"|"maintenance")
            echo "${BACKUP_WEBHOOK:-$WEBHOOK_URL}"
            ;;
        *)
            echo "$WEBHOOK_URL"
            ;;
    esac
}

# Function to determine message color for Discord
get_discord_color() {
    case "$MESSAGE_TYPE" in
        "emergency"|"critical"|"error") echo "15158332" ;; # Red
        "warning") echo "16776960" ;; # Yellow
        "success") echo "5763719" ;; # Green
        "info") echo "3447003" ;; # Blue
        "backup") echo "10181046" ;; # Purple
        *) echo "7506394" ;; # Grey
    esac
}

# Function to get appropriate emoji
get_emoji() {
    case "$MESSAGE_TYPE" in
        "emergency"|"critical") echo "🚨" ;;
        "error") echo "❌" ;;
        "warning") echo "⚠️" ;;
        "success") echo "✅" ;;
        "info") echo "ℹ️" ;;
        "backup") echo "💾" ;;
        "health") echo "🩺" ;;
        "deploy") echo "🚀" ;;
        "soulguard") echo "🧠" ;;
        *) echo "🔔" ;;
    esac
}

# Function to send Discord webhook
send_discord_webhook() {
    local webhook_url="$1"
    local emoji=$(get_emoji)
    local color=$(get_discord_color)

    local payload=$(cat <<EOF
{
    "embeds": [{
        "title": "${emoji} MAIA System Alert",
        "description": "$MESSAGE_CONTENT",
        "color": $color,
        "fields": [
            {
                "name": "Environment",
                "value": "$ENVIRONMENT",
                "inline": true
            },
            {
                "name": "Type",
                "value": "$MESSAGE_TYPE",
                "inline": true
            },
            {
                "name": "Timestamp",
                "value": "$TIMESTAMP",
                "inline": true
            }
        ],
        "footer": {
            "text": "MAIA Sovereign Control System"
        }
    }]
}
EOF
)

    curl -H "Content-Type: application/json" \
         -X POST \
         -d "$payload" \
         "$webhook_url" \
         --silent \
         --fail
}

# Function to send simple webhook (Slack/Teams/Generic)
send_simple_webhook() {
    local webhook_url="$1"
    local emoji=$(get_emoji)

    local payload=$(cat <<EOF
{
    "text": "${emoji} **MAIA Alert [$MESSAGE_TYPE]**\n$MESSAGE_CONTENT\n*Environment: $ENVIRONMENT | Time: $TIMESTAMP*"
}
EOF
)

    curl -H "Content-Type: application/json" \
         -X POST \
         -d "$payload" \
         "$webhook_url" \
         --silent \
         --fail
}

# Function to determine webhook type and send appropriately
send_notification() {
    local webhook_url=$(get_webhook_url)

    if [ -z "$webhook_url" ]; then
        echo -e "${YELLOW}Warning: No webhook URL configured${NC}"
        log_notification
        return 0
    fi

    echo -e "${BLUE}📡 Sending $MESSAGE_TYPE notification...${NC}"

    # Try Discord format first, fall back to simple format
    if send_discord_webhook "$webhook_url" 2>/dev/null; then
        echo -e "${GREEN}✅ Discord webhook sent successfully${NC}"
    elif send_simple_webhook "$webhook_url" 2>/dev/null; then
        echo -e "${GREEN}✅ Simple webhook sent successfully${NC}"
    else
        echo -e "${RED}❌ Failed to send webhook notification${NC}"
        log_notification
        return 1
    fi

    log_notification
    return 0
}

# Function to send system health summary
send_health_summary() {
    local health_status=""

    # Check production health
    if curl -s -f "https://soullab.life/maia/" > /dev/null; then
        health_status="${health_status}✅ Production: Online\n"
    else
        health_status="${health_status}❌ Production: Offline\n"
    fi

    # Check Docker containers
    if docker ps --format "{{.Names}}" | grep -q "maia-sovereign"; then
        health_status="${health_status}✅ Docker: Running\n"
    else
        health_status="${health_status}❌ Docker: Stopped\n"
    fi

    # Check disk space
    local disk_usage=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 85 ]; then
        health_status="${health_status}⚠️ Disk: ${disk_usage}% (High)\n"
    else
        health_status="${health_status}✅ Disk: ${disk_usage}% (OK)\n"
    fi

    MESSAGE_TYPE="health"
    MESSAGE_CONTENT="MAIA System Health Summary:\n${health_status}"
    send_notification
}

# Main execution
main() {
    case "$MESSAGE_TYPE" in
        "health-summary")
            send_health_summary
            ;;
        "test")
            MESSAGE_CONTENT="🧪 Webhook test from MAIA Control System - $(date)"
            send_notification
            ;;
        *)
            send_notification
            ;;
    esac
}

# Usage help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "MAIA Webhook Notification System"
    echo ""
    echo "Usage:"
    echo "  $0 <type> <message>"
    echo "  $0 health-summary"
    echo "  $0 test"
    echo ""
    echo "Message types:"
    echo "  emergency, critical, error - Red alerts (uses emergency webhook)"
    echo "  warning - Yellow warnings"
    echo "  success - Green success messages"
    echo "  info - Blue informational messages"
    echo "  backup - Purple backup notifications"
    echo "  health - Health check results"
    echo "  deploy - Deployment notifications"
    echo "  soulguard - AI observer insights"
    echo ""
    echo "Environment variables:"
    echo "  SOULGUARD_WEBHOOK - Primary webhook URL"
    echo "  EMERGENCY_WEBHOOK_URL - Emergency notifications webhook"
    echo "  BACKUP_WEBHOOK_URL - Backup/maintenance webhook"
    echo ""
    echo "Examples:"
    echo "  $0 error 'Production site is down'"
    echo "  $0 success 'Deployment completed successfully'"
    echo "  $0 backup 'Nightly backup completed'"
    exit 0
fi

# Execute main function
main "$@"