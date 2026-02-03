#!/bin/bash

# Docker recovery script for I/O errors and other issues

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔧 Docker Recovery Tool${NC}"
echo "================================"

# Check current Docker status
echo -e "\n${YELLOW}Checking Docker status...${NC}"
if docker info >/dev/null 2>&1; then
    echo -e "${GREEN}Docker is responding${NC}"
else
    echo -e "${RED}Docker is not responding${NC}"
fi

# Option 1: Clean Docker cache
echo -e "\n${YELLOW}Cleaning Docker system...${NC}"
docker system prune -af --volumes 2>/dev/null || {
    echo -e "${RED}Could not clean Docker cache${NC}"
}

# Option 2: Reset Docker to factory defaults (requires user confirmation)
echo -e "\n${YELLOW}Docker appears to have I/O errors.${NC}"
echo "This usually means Docker Desktop needs to be reset."
echo ""
echo "Options:"
echo "  1. Restart Docker Desktop (recommended - try this first)"
echo "  2. Clean and restart Docker Desktop" 
echo "  3. Reset Docker to factory defaults (last resort)"
echo ""
read -p "Choose option (1-3) or press Enter to skip: " choice

case $choice in
    1)
        echo -e "\n${YELLOW}Restarting Docker Desktop...${NC}"
        osascript -e 'quit app "Docker"' 2>/dev/null || true
        sleep 2
        open -a Docker
        
        echo -n "Waiting for Docker to restart"
        for i in {1..60}; do
            if docker info >/dev/null 2>&1; then
                echo -e "\n${GREEN}✅ Docker restarted successfully${NC}"
                exit 0
            fi
            echo -n "."
            sleep 1
        done
        echo -e "\n${RED}Docker failed to restart${NC}"
        ;;
        
    2)
        echo -e "\n${YELLOW}Cleaning and restarting Docker...${NC}"
        
        # Stop all containers
        docker stop $(docker ps -aq) 2>/dev/null || true
        
        # Remove all containers
        docker rm $(docker ps -aq) 2>/dev/null || true
        
        # Remove all images
        docker rmi $(docker images -q) 2>/dev/null || true
        
        # Clean build cache
        docker builder prune -af 2>/dev/null || true
        
        # Restart Docker
        osascript -e 'quit app "Docker"' 2>/dev/null || true
        sleep 3
        open -a Docker
        
        echo -n "Waiting for Docker to restart"
        for i in {1..60}; do
            if docker info >/dev/null 2>&1; then
                echo -e "\n${GREEN}✅ Docker cleaned and restarted${NC}"
                exit 0
            fi
            echo -n "."
            sleep 1
        done
        ;;
        
    3)
        echo -e "\n${RED}⚠️  WARNING: This will delete ALL Docker data${NC}"
        read -p "Are you sure? (yes/no): " confirm
        
        if [ "$confirm" = "yes" ]; then
            echo -e "\n${YELLOW}Resetting Docker to factory defaults...${NC}"
            echo "Please use Docker Desktop menu: Troubleshoot → Reset to factory defaults"
            echo "After reset, run this script again."
            open -a Docker
        fi
        ;;
        
    *)
        echo -e "\n${YELLOW}Skipping Docker recovery${NC}"
        ;;
esac

echo -e "\n${BLUE}Recovery steps completed${NC}"