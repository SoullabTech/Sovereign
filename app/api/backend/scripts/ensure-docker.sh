#!/bin/bash

# Ensure Docker Desktop is running on macOS

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Checking Docker status...${NC}"

# Check if Docker is running
if docker info >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker is already running${NC}"
    exit 0
fi

# Docker is not running, try to start it
echo -e "${YELLOW}Docker is not running. Starting Docker Desktop...${NC}"

# Try to start Docker Desktop on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Check if Docker Desktop is installed
    if [ -d "/Applications/Docker.app" ]; then
        echo "Starting Docker Desktop..."
        open -a Docker
        
        # Wait for Docker to start (max 60 seconds)
        echo -n "Waiting for Docker to be ready"
        for i in {1..60}; do
            if docker info >/dev/null 2>&1; then
                echo ""
                echo -e "${GREEN}✅ Docker is now running!${NC}"
                exit 0
            fi
            echo -n "."
            sleep 1
        done
        
        echo ""
        echo -e "${RED}❌ Docker failed to start within 60 seconds${NC}"
        echo "Please start Docker Desktop manually and try again."
        exit 1
    else
        echo -e "${RED}❌ Docker Desktop not found at /Applications/Docker.app${NC}"
        echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
else
    echo -e "${RED}❌ This script is designed for macOS${NC}"
    echo "Please start Docker manually for your platform."
    exit 1
fi