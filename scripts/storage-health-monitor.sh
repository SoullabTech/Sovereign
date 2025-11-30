#!/bin/bash

# MAIA Storage Health Monitor
# Automated system health monitoring and maintenance for sovereign development environment

set -e

# Configuration
HEALTH_LOG="/Users/soullab/MAIA-SOVEREIGN/logs/storage-health.log"
ALERT_LOG="/Users/soullab/MAIA-SOVEREIGN/logs/storage-alerts.log"
CLEANUP_LOG="/Users/soullab/MAIA-SOVEREIGN/logs/storage-cleanup.log"

# Thresholds
CRITICAL_THRESHOLD=90  # Trigger immediate action
WARNING_THRESHOLD=80   # Trigger cleanup suggestions
OPTIMAL_THRESHOLD=75   # Target usage level

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$HEALTH_LOG")"

# Function to log with timestamp
log_with_timestamp() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$HEALTH_LOG"
}

print_header() {
    echo -e "\n${PURPLE}🏥 MAIA Storage Health Monitor${NC}"
    echo -e "${PURPLE}=================================${NC}\n"
}

# Check current disk usage
check_disk_usage() {
    local usage=$(df -h /System/Volumes/Data | awk 'NR==2 {print $5}' | sed 's/%//')
    local used=$(df -h /System/Volumes/Data | awk 'NR==2 {print $3}')
    local avail=$(df -h /System/Volumes/Data | awk 'NR==2 {print $4}')

    echo "current_usage=$usage"
    echo "used_space=$used"
    echo "available_space=$avail"

    if [ $usage -ge $CRITICAL_THRESHOLD ]; then
        echo -e "${RED}🚨 CRITICAL: ${usage}% disk usage!${NC}"
        log_with_timestamp "CRITICAL ALERT: Disk usage at ${usage}%"
        return 2
    elif [ $usage -ge $WARNING_THRESHOLD ]; then
        echo -e "${YELLOW}⚠️  WARNING: ${usage}% disk usage${NC}"
        log_with_timestamp "WARNING: Disk usage at ${usage}%"
        return 1
    else
        echo -e "${GREEN}✅ HEALTHY: ${usage}% disk usage${NC}"
        log_with_timestamp "HEALTHY: Disk usage at ${usage}%"
        return 0
    fi
}

# Identify large cache directories that can be cleaned
identify_cleanup_candidates() {
    echo -e "\n${BLUE}🔍 Identifying cleanup candidates...${NC}"

    # Xcode DerivedData
    local xcode_derived=$(du -sh ~/Library/Developer/Xcode/DerivedData 2>/dev/null | awk '{print $1}' || echo "0B")
    echo "Xcode DerivedData: $xcode_derived"

    # Next.js caches
    local nextjs_total=0
    find /Users/soullab/MAIA-SOVEREIGN -name ".next" -type d 2>/dev/null | while read dir; do
        size=$(du -sh "$dir" 2>/dev/null | awk '{print $1}')
        echo "Next.js cache ($dir): $size"
    done

    # node_modules directories
    echo "Large node_modules directories:"
    find /Users/soullab -name "node_modules" -type d -exec du -sh {} \; 2>/dev/null | sort -hr | head -5

    # Docker data
    if command -v docker &> /dev/null; then
        echo "Docker system usage:"
        docker system df 2>/dev/null || echo "Docker not running"
    fi

    # Desktop clutter
    local desktop_size=$(du -sh ~/Desktop 2>/dev/null | awk '{print $1}' || echo "0B")
    echo "Desktop size: $desktop_size"
}

# Automated cleanup (safe operations only)
perform_safe_cleanup() {
    local cleanup_performed=false

    echo -e "\n${BLUE}🧹 Performing safe automated cleanup...${NC}"

    # Clean Xcode DerivedData if > 5GB
    local xcode_size_mb=$(du -sm ~/Library/Developer/Xcode/DerivedData 2>/dev/null | awk '{print $1}' || echo "0")
    if [ $xcode_size_mb -gt 5120 ]; then  # 5GB in MB
        echo "Cleaning Xcode DerivedData (${xcode_size_mb}MB)..."
        rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true
        echo "[$(date)] Cleaned Xcode DerivedData: ${xcode_size_mb}MB" >> "$CLEANUP_LOG"
        cleanup_performed=true
    fi

    # Clean Next.js caches
    find /Users/soullab/MAIA-SOVEREIGN -name ".next" -type d 2>/dev/null | while read dir; do
        echo "Cleaning Next.js cache: $dir"
        rm -rf "$dir" 2>/dev/null || true
        echo "[$(date)] Cleaned Next.js cache: $dir" >> "$CLEANUP_LOG"
        cleanup_performed=true
    done

    # Clean npm cache
    echo "Cleaning npm cache..."
    npm cache clean --force 2>/dev/null || true
    echo "[$(date)] Cleaned npm cache" >> "$CLEANUP_LOG"
    cleanup_performed=true

    # Clean system temp files
    echo "Cleaning temporary files..."
    sudo rm -rf /tmp/* 2>/dev/null || true
    echo "[$(date)] Cleaned system temp files" >> "$CLEANUP_LOG"

    if [ "$cleanup_performed" = true ]; then
        echo -e "${GREEN}✅ Automated cleanup completed${NC}"
    else
        echo -e "${YELLOW}ℹ️  No cleanup needed${NC}"
    fi
}

# Check external drive health
check_external_drives() {
    echo -e "\n${BLUE}💾 External Drive Status${NC}"

    # T7 Shield
    if [ -d "/Volumes/T7 Shield" ]; then
        local t7_usage=$(df -h "/Volumes/T7 Shield" | awk 'NR==2 {print $5}' | sed 's/%//')
        local t7_used=$(df -h "/Volumes/T7 Shield" | awk 'NR==2 {print $3}')
        local t7_avail=$(df -h "/Volumes/T7 Shield" | awk 'NR==2 {print $4}')
        echo -e "${GREEN}✅ T7 Shield: ${t7_usage}% used (${t7_used}/${t7_avail} available)${NC}"

        # Verify symlinks
        if [ -L ~/.ollama/models ]; then
            echo -e "${GREEN}✅ Ollama symlink: Active${NC}"
        else
            echo -e "${RED}❌ Ollama symlink: Broken${NC}"
        fi
    else
        echo -e "${RED}❌ T7 Shield: Not mounted${NC}"
    fi

    # LaCie
    if [ -d "/Volumes/LaCie" ]; then
        local lacie_usage=$(df -h "/Volumes/LaCie" | awk 'NR==2 {print $5}' | sed 's/%//')
        local lacie_used=$(df -h "/Volumes/LaCie" | awk 'NR==2 {print $3}')
        local lacie_avail=$(df -h "/Volumes/LaCie" | awk 'NR==2 {print $4}')
        echo -e "${GREEN}✅ LaCie: ${lacie_usage}% used (${lacie_used}/${lacie_avail} available)${NC}"

        # Check Photos symlink
        if [ -L ~/Pictures/Photos\ Library.photoslibrary ]; then
            echo -e "${GREEN}✅ Photos symlink: Active${NC}"
        else
            echo -e "${YELLOW}⚠️  Photos symlink: Check needed${NC}"
        fi
    else
        echo -e "${RED}❌ LaCie: Not mounted${NC}"
    fi
}

# Suggest optimizations based on current state
suggest_optimizations() {
    echo -e "\n${PURPLE}💡 Optimization Suggestions${NC}"

    # Check Docker data size
    local docker_size=$(du -sh ~/Library/Containers/com.docker.docker/Data 2>/dev/null | awk '{print $1}' || echo "0B")
    if [[ "$docker_size" == *"G"* ]]; then
        echo -e "${YELLOW}📦 Docker Data (${docker_size}): Consider moving to T7 Shield${NC}"
    fi

    # Check for large project directories
    echo "🔍 Largest project directories:"
    find /Users/soullab -maxdepth 2 -type d -name "*MAIA*" -o -name "*project*" -o -name "*dev*" 2>/dev/null | \
        xargs du -sh 2>/dev/null | sort -hr | head -3

    # Check Downloads folder
    local downloads_size=$(du -sh ~/Downloads 2>/dev/null | awk '{print $1}' || echo "0B")
    if [[ "$downloads_size" == *"G"* ]]; then
        echo -e "${YELLOW}📥 Downloads (${downloads_size}): Consider archiving old files${NC}"
    fi
}

# Generate storage trend data
update_storage_trends() {
    local trends_file="/Users/soullab/MAIA-SOVEREIGN/logs/storage-trends.csv"
    local usage=$(df /System/Volumes/Data | awk 'NR==2 {print $5}' | sed 's/%//')
    local used_gb=$(df /System/Volumes/Data | awk 'NR==2 {print $3}' | sed 's/Gi//')

    # Create header if file doesn't exist
    if [ ! -f "$trends_file" ]; then
        echo "timestamp,usage_percent,used_gb" > "$trends_file"
    fi

    # Append current data
    echo "$(date '+%Y-%m-%d %H:%M:%S'),$usage,$used_gb" >> "$trends_file"
}

# Send notifications for critical issues
send_alert() {
    local message="$1"
    local priority="$2"

    echo "[$(date)] $priority: $message" >> "$ALERT_LOG"

    # macOS notification
    osascript -e "display notification \"$message\" with title \"MAIA Storage Alert\" sound name \"Glass\"" 2>/dev/null || true

    # Could add email/Slack integration here
    echo -e "${RED}🔔 ALERT: $message${NC}"
}

# Main monitoring function
run_health_check() {
    print_header
    log_with_timestamp "Starting storage health check"

    # Check disk usage
    local disk_check_result
    check_disk_usage
    disk_check_result=$?

    # Update trends
    update_storage_trends

    # Check external drives
    check_external_drives

    # Identify cleanup candidates
    identify_cleanup_candidates

    # Handle based on disk usage level
    case $disk_check_result in
        2) # Critical
            send_alert "Critical disk usage detected! Immediate action required." "CRITICAL"
            perform_safe_cleanup
            suggest_optimizations
            echo -e "\n${RED}🚨 CRITICAL ACTION REQUIRED${NC}"
            echo "1. Run manual cleanup: ./scripts/emergency-cleanup.sh"
            echo "2. Move large files to external storage"
            echo "3. Consider adding more storage capacity"
            ;;
        1) # Warning
            suggest_optimizations
            echo -e "\n${YELLOW}⚠️  CLEANUP RECOMMENDED${NC}"
            echo "Run: ./scripts/storage-health-monitor.sh --cleanup"
            ;;
        0) # Healthy
            echo -e "\n${GREEN}✅ System healthy - no action required${NC}"
            ;;
    esac

    echo -e "\n${BLUE}📊 View detailed logs:${NC}"
    echo "Health log: $HEALTH_LOG"
    echo "Trends: /Users/soullab/MAIA-SOVEREIGN/logs/storage-trends.csv"

    log_with_timestamp "Storage health check completed"
}

# Command line interface
case "${1:-check}" in
    "check")
        run_health_check
        ;;
    "cleanup")
        perform_safe_cleanup
        run_health_check
        ;;
    "trends")
        echo "Storage usage trends:"
        tail -10 "/Users/soullab/MAIA-SOVEREIGN/logs/storage-trends.csv" 2>/dev/null || echo "No trend data available"
        ;;
    "alerts")
        echo "Recent alerts:"
        tail -20 "$ALERT_LOG" 2>/dev/null || echo "No alerts logged"
        ;;
    "--help"|"-h")
        echo "MAIA Storage Health Monitor"
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  check     Run full health check (default)"
        echo "  cleanup   Perform safe cleanup and health check"
        echo "  trends    Show storage usage trends"
        echo "  alerts    Show recent alerts"
        echo "  --help    Show this help"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac