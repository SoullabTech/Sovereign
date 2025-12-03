#!/bin/bash

# MAIA Deployment Health Check Script
# Monitors Docker containers, Nginx, and application endpoints

set -e

echo "🔍 MAIA Deployment Health Check - $(date)"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Status tracking
ISSUES_FOUND=0

# Function to log status
log_status() {
    local status=$1
    local message=$2
    if [ "$status" = "OK" ]; then
        echo -e "✅ ${GREEN}$message${NC}"
    elif [ "$status" = "WARN" ]; then
        echo -e "⚠️  ${YELLOW}$message${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        echo -e "❌ ${RED}$message${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
}

# Check Docker containers
echo "📦 Docker Container Status:"
if command -v docker &> /dev/null; then
    if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "maia-sovereign"; then
        CONTAINER_STATUS=$(docker ps --filter "name=maia-sovereign" --format "{{.Status}}")
        if echo "$CONTAINER_STATUS" | grep -q "Up"; then
            log_status "OK" "MAIA Docker container is running"

            # Check specific container ports
            if docker ps --filter "name=maia-sovereign-web" --format "{{.Ports}}" | grep -q "3002"; then
                log_status "OK" "Web container listening on port 3002"
            else
                log_status "ERROR" "Web container not listening on expected port 3002"
            fi
        else
            log_status "ERROR" "MAIA Docker container is not running properly"
        fi
    else
        log_status "ERROR" "MAIA Docker container not found"
    fi
else
    log_status "WARN" "Docker command not available"
fi

# Check Nginx status
echo -e "\n🌐 Nginx Status:"
if ps aux | grep -v grep | grep -q nginx; then
    log_status "OK" "Nginx is running"

    # Check if nginx config is valid
    if nginx -t 2>/dev/null; then
        log_status "OK" "Nginx configuration is valid"
    else
        log_status "ERROR" "Nginx configuration has errors"
    fi
else
    log_status "ERROR" "Nginx is not running"
fi

# Check application endpoints
echo -e "\n🌍 Application Endpoints:"

# Test local Docker container
if curl -s -f http://localhost:3002/maia/ > /dev/null; then
    log_status "OK" "Local container (3002) responding"
else
    log_status "ERROR" "Local container (3002) not responding"
fi

# Test production endpoints
if curl -s -f -m 10 http://soullab.life/maia/ > /dev/null; then
    log_status "OK" "Production HTTP endpoint responding"
else
    log_status "ERROR" "Production HTTP endpoint not responding"
fi

if curl -s -f -m 10 https://soullab.life/maia/ > /dev/null; then
    log_status "OK" "Production HTTPS endpoint responding"
else
    log_status "ERROR" "Production HTTPS endpoint not responding"
fi

# Check disk space
echo -e "\n💾 System Resources:"
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    log_status "WARN" "Disk usage is high: ${DISK_USAGE}%"
else
    log_status "OK" "Disk usage is normal: ${DISK_USAGE}%"
fi

# Check memory usage (macOS compatible)
if command -v vm_stat &> /dev/null; then
    # macOS memory check
    MEMORY_USAGE=$(vm_stat | awk '
        /Pages free/ {free = $3}
        /Pages active/ {active = $3}
        /Pages inactive/ {inactive = $3}
        /Pages occupied by compressor/ {compressed = $5}
        END {
            total = free + active + inactive + compressed
            used_percent = int((active + inactive + compressed) / total * 100)
            print used_percent
        }' | tr -d ',')
else
    # Linux fallback
    MEMORY_USAGE=$(free 2>/dev/null | awk '/Mem/ {printf "%.0f", ($3/$2)*100}' || echo "0")
fi

if [ "$MEMORY_USAGE" -gt 90 ]; then
    log_status "WARN" "Memory usage is high: ${MEMORY_USAGE}%"
else
    log_status "OK" "Memory usage is normal: ${MEMORY_USAGE}%"
fi

# Check for Docker container logs for errors
echo -e "\n📄 Recent Container Logs (last 50 lines):"
if docker logs --tail=50 maia-sovereign-web-1 2>&1 | grep -i error | tail -5; then
    log_status "WARN" "Recent errors found in container logs (see above)"
else
    log_status "OK" "No recent errors in container logs"
fi

# Summary
echo -e "\n📋 Health Check Summary:"
echo "=============================="
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "🎉 ${GREEN}All systems operational! No issues detected.${NC}"
    exit 0
else
    echo -e "⚠️  ${YELLOW}Found $ISSUES_FOUND issue(s) that need attention.${NC}"
    echo -e "💡 Run with -v for verbose output or check logs for details."
    exit 1
fi