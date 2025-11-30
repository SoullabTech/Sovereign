#!/bin/bash
# 🚀 Simplified Beta Startup Script - Gracefully handles Sesame issues

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${BLUE}🚀 SpiralogicOracleSystem Beta Startup${NC}"
echo "   Simplified version - skips problematic Sesame checks"
echo "═════════════════════════════════════════════════════"
echo ""

# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i:$port >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to find available port
find_available_port() {
    local base_port=$1
    local port=$base_port
    
    while check_port $port; do
        echo -e "${YELLOW}Port $port is in use, trying next...${NC}"
        port=$((port + 1))
    done
    
    echo $port
}

# Kill existing processes
cleanup_existing() {
    echo "🧹 Cleaning up existing processes..."
    
    # Kill any existing backend
    pkill -f "node.*dist/server.js" 2>/dev/null || true
    pkill -f "tsx.*src/server.ts" 2>/dev/null || true
    
    # Kill any existing frontend on 3000
    if check_port 3000; then
        echo "   Killing process on port 3000..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit
}
trap cleanup EXIT INT TERM

# Main execution
cleanup_existing

# Check Sesame (but don't fail if it's not working)
echo -e "${YELLOW}🎤 Checking voice services...${NC}"
if curl -s http://localhost:8000/health >/dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Sesame CSM is running${NC}"
    export SESAME_ENABLED=true
else
    echo -e "   ${YELLOW}⚠️  Sesame CSM not available${NC}"
    echo "   Voice will use fallback Web Speech API"
    export SESAME_ENABLED=false
fi

# Start backend
echo ""
echo -e "${GREEN}▶  Starting backend...${NC}"
cd "$PROJECT_ROOT/backend"

# Find available port
BACKEND_PORT=$(find_available_port 3002)
echo "   Using port: $BACKEND_PORT"

# Export port for backend to use
export PORT=$BACKEND_PORT

# Write port file for frontend
echo $BACKEND_PORT > .port

# Start backend
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"
echo "   Log: backend/backend.log"

# Start frontend
echo ""
echo -e "${GREEN}▶  Starting frontend...${NC}"
cd "$PROJECT_ROOT"

# Ensure BACKEND_URL is set
export NEXT_PUBLIC_BACKEND_URL=http://localhost:$BACKEND_PORT

npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"
echo "   Log: frontend.log"

# Wait for services
echo ""
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"

# Wait for backend
echo -n "   Backend (http://localhost:$BACKEND_PORT): "
SUCCESS=false
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        SUCCESS=true
        break
    fi
    echo -n "."
    sleep 1
done
if [ "$SUCCESS" = false ]; then
    echo -e "${RED}✗${NC}"
    echo -e "${RED}Backend failed to start. Check backend/backend.log${NC}"
fi

# Wait for frontend
echo -n "   Frontend (http://localhost:3000): "
SUCCESS=false
for i in {1..30}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        SUCCESS=true
        break
    fi
    echo -n "."
    sleep 1
done
if [ "$SUCCESS" = false ]; then
    echo -e "${RED}✗${NC}"
    echo -e "${RED}Frontend failed to start. Check frontend.log${NC}"
fi

# Quick health checks for status banner
check_service_health() {
    local service=$1
    local url=$2
    
    if curl -s "$url" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Get service statuses
BACKEND_STATUS="❌"
FRONTEND_STATUS="❌"
SESAME_STATUS="❌"
DB_STATUS="❓"

if check_service_health "backend" "http://localhost:$BACKEND_PORT/health"; then
    BACKEND_STATUS="✅"
fi

if check_service_health "frontend" "http://localhost:3000"; then
    FRONTEND_STATUS="✅"
fi

if [ "$SESAME_ENABLED" = "true" ]; then
    SESAME_STATUS="✅"
else
    SESAME_STATUS="⚠️"
fi

# Check if Supabase is configured
if [ -n "$SUPABASE_URL" ] || grep -q "SUPABASE_URL" "$PROJECT_ROOT/backend/.env" 2>/dev/null; then
    DB_STATUS="✅"
else
    DB_STATUS="⚠️"
fi

# Final status dashboard
echo ""
echo "╔═════════════════════════════════════════════════════════════╗"
echo -e "║           ${BLUE}🚀 SpiralogicOracleSystem Status Dashboard${NC}        ║"
echo "╠═════════════════════════════════════════════════════════════╣"
echo -e "║                                                             ║"
echo -e "║  Service Status:                                            ║"
echo -e "║  ────────────────────────────────────────────────────────  ║"
echo -e "║  ${BACKEND_STATUS} Backend API    │ http://localhost:$BACKEND_PORT          ║"
echo -e "║  ${FRONTEND_STATUS} Frontend       │ http://localhost:3000               ║"
echo -e "║  ${SESAME_STATUS} Voice (Sesame) │ ${SESAME_ENABLED:+Sesame CSM Active              }${SESAME_ENABLED:=Fallback: Web Speech API       }║"
echo -e "║  ${DB_STATUS} Database       │ ${DB_STATUS:+Supabase Configured            }${DB_STATUS:=Not Configured                }║"
echo -e "║                                                             ║"
echo -e "║  Quick Tests:                                               ║"
echo -e "║  ────────────────────────────────────────────────────────  ║"
echo -e "║  • Health: curl http://localhost:$BACKEND_PORT/health            ║"
echo -e "║  • Chat:   Open http://localhost:3000                      ║"
echo -e "║  • Logs:   tail -f backend/backend.log                     ║"
echo -e "║                                                             ║"
echo -e "║  Legend:                                                    ║"
echo -e "║  ────────────────────────────────────────────────────────  ║"
echo -e "║  ✅ = Running perfectly                                     ║"
echo -e "║  ⚠️  = Running with limitations                             ║"
echo -e "║  ❌ = Not running                                           ║"
echo -e "║  ❓ = Unknown status                                        ║"
echo -e "║                                                             ║"
echo -e "║  ${YELLOW}Press Ctrl+C to stop all services${NC}                          ║"
echo "╚═════════════════════════════════════════════════════════════╝"
echo ""

# Show any important warnings
if [ "$SESAME_STATUS" = "⚠️" ]; then
    echo -e "${YELLOW}⚠️  Note: Voice synthesis using fallback Web Speech API${NC}"
    echo "   To enable Sesame: docker start sesame (if container exists)"
    echo ""
fi

if [ "$DB_STATUS" = "⚠️" ]; then
    echo -e "${YELLOW}⚠️  Note: Supabase not configured, using local storage${NC}"
    echo "   To enable: Add SUPABASE_URL and SUPABASE_ANON_KEY to .env"
    echo ""
fi

# Keep script running
while true; do
    sleep 1
done