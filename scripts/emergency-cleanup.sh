#!/bin/bash

# MAIA Emergency Storage Cleanup
# Aggressive cleanup for critical disk space situations

set -e

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

EMERGENCY_LOG="/Users/soullab/MAIA-SOVEREIGN/logs/emergency-cleanup.log"

log_emergency() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$EMERGENCY_LOG"
}

print_header() {
    echo -e "${RED}🚨 MAIA EMERGENCY STORAGE CLEANUP 🚨${NC}"
    echo -e "${RED}======================================${NC}\n"
    echo -e "${YELLOW}⚠️  This script performs aggressive cleanup for critical disk space situations${NC}"
    echo -e "${YELLOW}⚠️  Only run when disk usage is above 90%${NC}\n"
}

check_if_emergency() {
    local usage=$(df -h /System/Volumes/Data | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ $usage -lt 90 ]; then
        echo -e "${GREEN}Current usage: ${usage}% - Emergency cleanup not needed${NC}"
        echo -e "${BLUE}Use regular cleanup instead: ./scripts/storage-health-monitor.sh cleanup${NC}"
        exit 0
    fi

    echo -e "${RED}Current usage: ${usage}% - Emergency cleanup authorized${NC}"
    log_emergency "Emergency cleanup initiated - disk usage at ${usage}%"
}

confirm_emergency() {
    echo -e "${YELLOW}Emergency cleanup will:${NC}"
    echo "• Clear ALL Xcode DerivedData"
    echo "• Remove ALL Next.js build caches"
    echo "• Clean ALL npm caches"
    echo "• Remove temporary files"
    echo "• Clean Docker data (if running)"
    echo "• Suggest files for external storage"
    echo ""

    read -p "Continue with emergency cleanup? (type 'EMERGENCY' to confirm): " confirm
    if [ "$confirm" != "EMERGENCY" ]; then
        echo "Emergency cleanup cancelled"
        exit 1
    fi
}

emergency_xcode_cleanup() {
    echo -e "\n${BLUE}🧹 Cleaning Xcode data...${NC}"

    # DerivedData
    local derived_data_size=$(du -sh ~/Library/Developer/Xcode/DerivedData 2>/dev/null | awk '{print $1}' || echo "0B")
    echo "Clearing DerivedData (${derived_data_size})..."
    rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true
    log_emergency "Cleared Xcode DerivedData: $derived_data_size"

    # Archives (older than 30 days)
    echo "Cleaning old Xcode archives..."
    find ~/Library/Developer/Xcode/Archives -name "*.xcarchive" -mtime +30 -delete 2>/dev/null || true
    log_emergency "Cleaned old Xcode archives"

    # iOS DeviceSupport
    echo "Cleaning iOS DeviceSupport..."
    find ~/Library/Developer/Xcode/iOS\ DeviceSupport -name "*" -mtime +90 -delete 2>/dev/null || true
    log_emergency "Cleaned iOS DeviceSupport"
}

emergency_node_cleanup() {
    echo -e "\n${BLUE}📦 Cleaning Node.js data...${NC}"

    # Next.js caches
    echo "Removing ALL Next.js caches..."
    find /Users/soullab -name ".next" -type d -exec rm -rf {} \; 2>/dev/null || true
    log_emergency "Removed all Next.js caches"

    # npm cache
    echo "Clearing npm cache..."
    npm cache clean --force 2>/dev/null || true
    log_emergency "Cleared npm cache"

    # Find large node_modules for potential removal
    echo "Large node_modules directories:"
    find /Users/soullab -name "node_modules" -type d -exec du -sh {} \; 2>/dev/null | \
        sort -hr | head -5 | while read size dir; do
        echo "  $size - $dir"
        log_emergency "Found large node_modules: $size at $dir"
    done
}

emergency_docker_cleanup() {
    echo -e "\n${BLUE}🐳 Cleaning Docker data...${NC}"

    if command -v docker &> /dev/null && docker info &>/dev/null; then
        echo "Performing Docker system cleanup..."

        # Stop all containers
        docker stop $(docker ps -q) 2>/dev/null || true

        # Remove all containers, networks, images (except base)
        docker system prune -af 2>/dev/null || true

        # Remove volumes
        docker volume prune -f 2>/dev/null || true

        log_emergency "Performed aggressive Docker cleanup"
    else
        echo "Docker not running or not available"
    fi
}

emergency_system_cleanup() {
    echo -e "\n${BLUE}🗑️  Cleaning system files...${NC}"

    # Temporary files
    echo "Clearing system temp files..."
    sudo rm -rf /tmp/* 2>/dev/null || true
    rm -rf /var/folders/*/T/* 2>/dev/null || true
    log_emergency "Cleared system temp files"

    # User caches
    echo "Clearing user cache files..."
    rm -rf ~/Library/Caches/* 2>/dev/null || true
    log_emergency "Cleared user cache files"

    # Trash
    echo "Emptying trash..."
    rm -rf ~/.Trash/* 2>/dev/null || true
    log_emergency "Emptied trash"

    # Downloads folder (files older than 30 days)
    echo "Cleaning old downloads..."
    find ~/Downloads -type f -mtime +30 -delete 2>/dev/null || true
    log_emergency "Cleaned old downloads"
}

suggest_external_moves() {
    echo -e "\n${PURPLE}💾 Suggesting files for external storage...${NC}"

    echo "Large directories that could be moved to external storage:"

    # Large projects
    find /Users/soullab -maxdepth 3 -type d \( -name "*project*" -o -name "*archive*" -o -name "*backup*" \) \
        -exec du -sh {} \; 2>/dev/null | sort -hr | head -5

    # Large media files
    echo -e "\nLarge media files:"
    find /Users/soullab -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.avi" -o -name "*.zip" -o -name "*.dmg" \) \
        -size +500M -exec du -sh {} \; 2>/dev/null | head -5

    echo -e "\n${YELLOW}💡 Consider moving these to external drives:${NC}"
    echo "• T7 Shield: Development archives, large caches"
    echo "• LaCie: Media files, personal archives"
}

show_results() {
    echo -e "\n${GREEN}✅ Emergency cleanup completed!${NC}"

    local new_usage=$(df -h /System/Volumes/Data | awk 'NR==2 {print $5}' | sed 's/%//')
    local available=$(df -h /System/Volumes/Data | awk 'NR==2 {print $4}')

    echo -e "\n${BLUE}📊 Results:${NC}"
    echo "Current usage: ${new_usage}%"
    echo "Available space: ${available}"

    log_emergency "Emergency cleanup completed - new usage: ${new_usage}%"

    if [ $new_usage -gt 85 ]; then
        echo -e "\n${YELLOW}⚠️  Still high usage - consider:${NC}"
        echo "1. Moving Docker data to external storage"
        echo "2. Archiving old projects"
        echo "3. Adding additional storage capacity"
    else
        echo -e "\n${GREEN}✅ System usage now at healthy levels${NC}"
    fi
}

# Main execution
print_header
check_if_emergency
confirm_emergency

echo -e "${RED}🚨 Starting emergency cleanup...${NC}"

emergency_xcode_cleanup
emergency_node_cleanup
emergency_docker_cleanup
emergency_system_cleanup
suggest_external_moves
show_results

echo -e "\n${BLUE}📋 Next steps:${NC}"
echo "1. Monitor disk usage: ./scripts/storage-health-monitor.sh check"
echo "2. Set up automated monitoring: ./scripts/setup-automated-monitoring.sh"
echo "3. Review suggestions above for external storage moves"