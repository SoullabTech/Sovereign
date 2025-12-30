#!/bin/bash

# Unified startup script for the complete system
# Handles Sesame CSM + Backend + Frontend orchestration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Spiralogic Oracle System${NC}"
echo "================================================"

# Ensure Docker is running first
if [ -f "$SCRIPT_DIR/ensure-docker.sh" ]; then
    "$SCRIPT_DIR/ensure-docker.sh" || {
        echo -e "${RED}❌ Could not start Docker${NC}"
        exit 1
    }
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    
    # Kill backend if running
    if [ -f "$BACKEND_DIR/.port" ]; then
        PORT=$(cat "$BACKEND_DIR/.port")
        if check_port $PORT; then
            echo "Stopping backend on port $PORT..."
            lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
        fi
        rm -f "$BACKEND_DIR/.port"
    fi
    
    # Kill Sesame if running
    if check_port 8000; then
        echo "Stopping Sesame CSM on port 8000..."
        lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    fi
    
    # Kill frontend if running
    if check_port 3000; then
        echo "Stopping frontend on port 3000..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✨ Cleanup complete${NC}"
}

# Set up trap for cleanup
trap cleanup EXIT INT TERM

# Step 1: Start Sesame CSM
echo -e "\n${BLUE}Step 1: Starting Sesame CSM voice service...${NC}"
cd "$BACKEND_DIR"

if [ -f "./scripts/start-sesame-csm.sh" ]; then
    ./scripts/start-sesame-csm.sh
    
    # Verify Sesame is running
    sleep 2
    if check_port 8000; then
        echo -e "${GREEN}✅ Sesame CSM is running on port 8000${NC}"
    else
        echo -e "${YELLOW}⚠️  Sesame CSM may not be fully initialized yet${NC}"
    fi
else
    echo -e "${RED}❌ start-sesame-csm.sh not found${NC}"
    exit 1
fi

# Step 2: Start the main system
echo -e "\n${BLUE}Step 2: Starting backend and frontend...${NC}"

if [ -f "./scripts/start-beta-simple.sh" ]; then
    ./scripts/start-beta-simple.sh &
    SYSTEM_PID=$!
    
    # Wait for backend to be ready
    echo -n "Waiting for backend to start"
    for i in {1..30}; do
        if [ -f "$BACKEND_DIR/.port" ]; then
            PORT=$(cat "$BACKEND_DIR/.port")
            if check_port $PORT; then
                echo -e "\n${GREEN}✅ Backend is running on port $PORT${NC}"
                break
            fi
        fi
        echo -n "."
        sleep 1
    done
    
    # Wait for frontend to be ready
    echo -n "Waiting for frontend to start"
    for i in {1..30}; do
        if check_port 3000; then
            echo -e "\n${GREEN}✅ Frontend is running on port 3000${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
else
    echo -e "${RED}❌ start-beta-simple.sh not found${NC}"
    exit 1
fi

# Step 3: Display status
echo -e "\n${BLUE}================================================${NC}"
echo -e "${GREEN}✨ System startup complete!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "Services running:"
echo -e "  ${GREEN}•${NC} Sesame CSM (Voice): http://localhost:8000"

if [ -f "$BACKEND_DIR/.port" ]; then
    PORT=$(cat "$BACKEND_DIR/.port")
    echo -e "  ${GREEN}•${NC} Backend API: http://localhost:$PORT"
fi

echo -e "  ${GREEN}•${NC} Frontend: http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Step 4: Show real-time logs
echo -e "${BLUE}Tailing logs (press Ctrl+C to stop)...${NC}"
echo "================================================"

# Keep the script running and show logs
if [ -f "$BACKEND_DIR/.port" ]; then
    PORT=$(cat "$BACKEND_DIR/.port")
    
    # Function to format and display logs
    show_logs() {
        # Tail backend logs if available
        if [ -f "$BACKEND_DIR/backend.log" ]; then
            tail -f "$BACKEND_DIR/backend.log" 2>/dev/null &
            TAIL_PID=$!
        fi
        
        # Wait for user interrupt
        wait $SYSTEM_PID
    }
    
    show_logs
else
    # Just wait if we can't find logs
    wait $SYSTEM_PID
fi