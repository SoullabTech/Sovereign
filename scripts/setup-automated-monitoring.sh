#!/bin/bash

# MAIA Automated Monitoring Setup
# Sets up automated storage health monitoring with intelligent scheduling

set -e

SCRIPTS_DIR="/Users/soullab/MAIA-SOVEREIGN/scripts"
MONITOR_SCRIPT="$SCRIPTS_DIR/storage-health-monitor.sh"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🤖 Setting up MAIA Automated Storage Monitoring${NC}\n"

# Make scripts executable
echo -e "${BLUE}Setting up script permissions...${NC}"
chmod +x "$MONITOR_SCRIPT"
chmod +x "$SCRIPTS_DIR/emergency-cleanup.sh"
chmod +x "$SCRIPTS_DIR/manage-dev-processes.sh"

# Preflight: refuse to install a job that cannot run.
#
# The installed health plist was found on 2026-11-13 pointing at
# scripts/jarvis-storage-observer-s4s6-v1.py, a file that has never existed in
# this repository. It failed on every run with exit 2 and nothing reported it,
# so the machine went unmonitored for weeks while disk emergencies were handled
# by hand. A scheduled job that cannot run is worse than no job: it looks like
# coverage. Verify the targets exist before writing any plist.
for required in "$MONITOR_SCRIPT" "$SCRIPTS_DIR/checkout-lifecycle.sh"; do
    if [ ! -x "$required" ]; then
        echo "REFUSING TO INSTALL: $required is missing or not executable." >&2
        echo "Fix that first — a job pointing at a missing file fails silently forever." >&2
        exit 1
    fi
done

# Create launchd directory if it doesn't exist
mkdir -p ~/Library/LaunchAgents

# Create LaunchAgent for daily health checks
cat > ~/Library/LaunchAgents/com.soullab.maia.storage.health.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.soullab.maia.storage.health</string>
    <key>ProgramArguments</key>
    <array>
        <string>$MONITOR_SCRIPT</string>
        <string>check</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/soullab/MAIA-SOVEREIGN/logs/automated-health.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/soullab/MAIA-SOVEREIGN/logs/automated-health-errors.log</string>
    <key>WorkingDirectory</key>
    <string>/Users/soullab/MAIA-SOVEREIGN</string>
</dict>
</plist>
EOF

# Create LaunchAgent for weekly deep cleanup
cat > ~/Library/LaunchAgents/com.soullab.maia.storage.cleanup.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.soullab.maia.storage.cleanup</string>
    <key>ProgramArguments</key>
    <array>
        <string>$MONITOR_SCRIPT</string>
        <string>cleanup</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Weekday</key>
        <integer>0</integer>
        <key>Hour</key>
        <integer>8</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>RunAtLoad</key>
    <false/>
    <key>StandardOutPath</key>
    <string>/Users/soullab/MAIA-SOVEREIGN/logs/automated-cleanup.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/soullab/MAIA-SOVEREIGN/logs/automated-cleanup-errors.log</string>
    <key>WorkingDirectory</key>
    <string>/Users/soullab/MAIA-SOVEREIGN</string>
</dict>
</plist>
EOF

# Load the LaunchAgents
echo -e "${BLUE}Loading automated monitoring services...${NC}"
launchctl unload ~/Library/LaunchAgents/com.soullab.maia.storage.health.plist 2>/dev/null || true
launchctl unload ~/Library/LaunchAgents/com.soullab.maia.storage.cleanup.plist 2>/dev/null || true
launchctl load -w ~/Library/LaunchAgents/com.soullab.maia.storage.health.plist
launchctl load -w ~/Library/LaunchAgents/com.soullab.maia.storage.cleanup.plist

# Confirm both are actually registered. The cleanup job was found unloaded on
# 2026-11-13 despite its plist being present, so "the file exists" is not
# evidence that anything is scheduled.
for label in com.soullab.maia.storage.health com.soullab.maia.storage.cleanup; do
    if launchctl list "$label" >/dev/null 2>&1; then
        echo "  registered: $label"
    else
        echo "  NOT REGISTERED: $label — plist written but launchd did not accept it" >&2
    fi
done

# Create logs directory
mkdir -p /Users/soullab/MAIA-SOVEREIGN/logs

# Test the monitoring system
echo -e "${BLUE}Running initial health check...${NC}"
"$MONITOR_SCRIPT" check

echo -e "\n${GREEN}✅ Automated Storage Monitoring Setup Complete!${NC}\n"

echo -e "${YELLOW}📋 Monitoring Schedule:${NC}"
echo "  🔍 Daily Health Check: 9:00 AM"
echo "  🧹 Weekly Cleanup: Sunday 8:00 AM"
echo ""

echo -e "${YELLOW}📁 Log Files:${NC}"
echo "  Health Logs: /Users/soullab/MAIA-SOVEREIGN/logs/"
echo "  Automated Logs: /Users/soullab/MAIA-SOVEREIGN/logs/automated-*.log"
echo ""

echo -e "${YELLOW}🛠️  Manual Commands:${NC}"
echo "  Check Status:     ./scripts/storage-health-monitor.sh check"
echo "  Force Cleanup:    ./scripts/storage-health-monitor.sh cleanup"
echo "  View Trends:      ./scripts/storage-health-monitor.sh trends"
echo "  Emergency Clean:  ./scripts/emergency-cleanup.sh"
echo ""

echo -e "${BLUE}📊 View monitoring status:${NC}"
echo "  launchctl list | grep maia"
echo "  tail -f /Users/soullab/MAIA-SOVEREIGN/logs/storage-health.log"