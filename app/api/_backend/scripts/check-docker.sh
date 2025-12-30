#!/bin/bash
# ===================================================
# 🐳 Docker Health Preflight Utility
# ===================================================
# Usage: source ./backend/scripts/check-docker.sh
# Ensures Docker is running before continuing
# ===================================================

# Colors (redefined in case not already set)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_docker() {
    echo "🔍 Checking Docker daemon..."
    
    # First check if Docker command exists
    if ! command -v docker >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker not installed${NC}"
        echo "   👉 Install Docker Desktop: https://docker.com/products/docker-desktop"
        return 1
    fi
    
    # Auto-start Docker on macOS if not running
    if ! docker info >/dev/null 2>&1; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo -e "${YELLOW}⚠️  Docker daemon not running${NC}"
            echo "🚀 Starting Docker Desktop automatically..."
            open -a Docker 2>/dev/null || {
                echo -e "${RED}❌ Failed to start Docker Desktop${NC}"
                echo "   👉 Please start Docker Desktop manually"
                return 1
            }
        fi
    fi
    
    # Try pinging Docker, wait up to 30s
    timeout=30
    while ! docker info >/dev/null 2>&1; do
        echo "⏳ Waiting for Docker... ($timeout seconds left)"
        sleep 2
        timeout=$((timeout-2))
        if [ $timeout -le 0 ]; then
            echo -e "${RED}❌ Docker daemon not responding.${NC}"
            echo "   👉 Try running: open -a Docker"
            echo "   Then rerun this script."
            return 1
        fi
    done
    
    echo -e "${GREEN}✅ Docker is running and healthy!${NC}"
    
    # Show Docker version for debugging
    DOCKER_VERSION=$(docker version --format '{{.Server.Version}}' 2>/dev/null || echo "unknown")
    echo "   Version: $DOCKER_VERSION"
    
    # Check available disk space (Docker needs ~2GB minimum)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS disk check
        AVAILABLE_GB=$(df -g / | tail -1 | awk '{print $4}')
        if [ "$AVAILABLE_GB" -lt 2 ] 2>/dev/null; then
            echo -e "${YELLOW}⚠️  Low disk space: ${AVAILABLE_GB}GB free${NC}"
            echo "   Docker may fail to build images"
        fi
    fi
    
    return 0
}

# If script is run directly (not sourced), execute the check
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    check_docker
    exit $?
fi