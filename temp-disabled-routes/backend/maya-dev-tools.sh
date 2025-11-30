#!/bin/bash

# 🔮 Maya Developer Tools - Interactive CLI for Sesame/Maya Pipeline
# Complete toolkit for managing, testing, and debugging your Oracle system

set -euo pipefail

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Change to backend directory
cd "$(dirname "$0")"

show_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🔮 Maya Developer Tools                   ║"
    echo "║              Sesame/Maya Pipeline Management                 ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

show_menu() {
    echo ""
    echo -e "${CYAN}Available Commands:${NC}"
    echo ""
    echo -e "${GREEN}🚀 Server Management${NC}"
    echo "  1) Start server (APP_PORT=3002)"
    echo "  2) Check server status"
    echo "  3) Kill server processes"
    echo "  4) View server logs"
    echo ""
    echo -e "${BLUE}🧪 API Testing${NC}"
    echo "  5) Test API routes"
    echo "  6) Test health endpoints"
    echo "  7) Test conversational pipeline"
    echo "  8) Full endpoint validation"
    echo ""
    echo -e "${YELLOW}🔧 Diagnostics${NC}"
    echo "  9) Run full diagnostics"
    echo " 10) Check environment variables"
    echo " 11) Check dependencies"
    echo " 12) Test import chain"
    echo ""
    echo -e "${PURPLE}🛠️ Development${NC}"
    echo " 13) Build project"
    echo " 14) Run TypeScript check"
    echo " 15) View API documentation"
    echo ""
    echo " 16) Show this menu"
    echo "  q) Quit"
    echo ""
}

start_server() {
    echo -e "${GREEN}🚀 Starting Sesame/Maya server on port 3002...${NC}"
    echo ""
    
    # Kill existing processes
    if lsof -ti:3002 >/dev/null 2>&1; then
        echo "Killing existing process on port 3002..."
        lsof -ti:3002 | xargs kill -9 || true
    fi
    
    export APP_PORT=3002
    unset PORT
    
    echo "Starting server..."
    SAFE_MODE=1 NODE_ENV=development npx ts-node --transpile-only -r tsconfig-paths/register src/server-minimal.ts
}

check_server_status() {
    echo -e "${BLUE}📊 Server Status Check${NC}"
    echo ""
    
    if lsof -iTCP:3002 -sTCP:LISTEN >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is running on port 3002${NC}"
        lsof -iTCP:3002 -sTCP:LISTEN
        echo ""
        echo "Quick test:"
        curl -s http://localhost:3002/api | jq '.name, .version' 2>/dev/null || echo "API not responding"
    else
        echo -e "${RED}❌ No server found on port 3002${NC}"
        echo ""
        echo "To start: Select option 1 or run:"
        echo "  APP_PORT=3002 ./start-backend.sh"
    fi
}

kill_server() {
    echo -e "${YELLOW}🧹 Killing server processes...${NC}"
    
    PIDS=$(lsof -ti:3002 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
        echo "Killing PIDs: $PIDS"
        kill -9 $PIDS || true
        echo -e "${GREEN}✅ Processes killed${NC}"
    else
        echo "No processes found on port 3002"
    fi
    
    # Also kill any ts-node server processes
    pkill -f "ts-node.*server" || true
}

view_logs() {
    echo -e "${CYAN}📋 Server Logs${NC}"
    echo ""
    
    if [ -f server.log ]; then
        echo "=== Recent server.log ==="
        tail -20 server.log
    fi
    
    if [ -f server-test.log ]; then
        echo ""
        echo "=== Recent server-test.log ==="
        tail -20 server-test.log
    fi
    
    if [ ! -f server.log ] && [ ! -f server-test.log ]; then
        echo "No log files found. Server may not have been started yet."
    fi
}

test_api_routes() {
    echo -e "${BLUE}🌐 Testing API Routes${NC}"
    echo ""
    
    if ! lsof -iTCP:3002 -sTCP:LISTEN >/dev/null 2>&1; then
        echo -e "${RED}❌ Server not running on port 3002${NC}"
        return 1
    fi
    
    echo "API Root:"
    curl -s http://localhost:3002/api | jq .routes 2>/dev/null || echo "Failed"
    
    echo ""
    echo "Available endpoints:"
    curl -s http://localhost:3002/api | jq '.endpoints // .routes' 2>/dev/null || echo "Failed"
}

test_health_endpoints() {
    echo -e "${GREEN}🏥 Testing Health Endpoints${NC}"
    echo ""
    
    if ! lsof -iTCP:3002 -sTCP:LISTEN >/dev/null 2>&1; then
        echo -e "${RED}❌ Server not running on port 3002${NC}"
        return 1
    fi
    
    echo "1. API v1 Health:"
    curl -s http://localhost:3002/api/v1/health | jq '.data.status // .status' 2>/dev/null || echo "Failed"
    
    echo ""
    echo "2. Conversational Health:"
    curl -s http://localhost:3002/api/v1/converse/health | jq '.' 2>/dev/null || echo "Failed"
}

test_conversational_pipeline() {
    echo -e "${PURPLE}💬 Testing Conversational Pipeline${NC}"
    echo ""
    
    if ! lsof -iTCP:3002 -sTCP:LISTEN >/dev/null 2>&1; then
        echo -e "${RED}❌ Server not running on port 3002${NC}"
        return 1
    fi
    
    echo "Sending test message to Sesame/Maya pipeline..."
    echo ""
    
    RESPONSE=$(curl -s -X POST http://localhost:3002/api/v1/converse/message \
        -H 'Content-Type: application/json' \
        -d '{"userText":"short grounding ritual for sleep","userId":"test-user","element":"earth","preferences":{"voice":{"enabled":false}}}' 2>/dev/null || echo '{"error": "request_failed"}')
    
    if echo "$RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Pipeline responding${NC}"
        echo "Response:"
        echo "$RESPONSE" | jq .
    else
        echo -e "${RED}❌ Pipeline error${NC}"
        echo "$RESPONSE"
    fi
}

run_full_diagnostics() {
    echo -e "${PURPLE}🔍 Running Full Diagnostics${NC}"
    echo ""
    ./claude-code-diagnostics.sh
}

check_environment() {
    echo -e "${YELLOW}🌍 Environment Variables${NC}"
    echo ""
    
    echo "Port Configuration:"
    node -e "require('dotenv').config({override:false}); console.log('APP_PORT:', process.env.APP_PORT || 'unset'); console.log('PORT:', process.env.PORT || 'unset');" 2>/dev/null || echo "Failed to check"
    
    echo ""
    echo "API Keys Status:"
    [ -n "${OPENAI_API_KEY:-}" ] && echo "✅ OPENAI_API_KEY: Set" || echo "❌ OPENAI_API_KEY: Not set"
    [ -n "${ANTHROPIC_API_KEY:-}" ] && echo "✅ ANTHROPIC_API_KEY: Set" || echo "❌ ANTHROPIC_API_KEY: Not set"
    [ -n "${MEM0_API_KEY:-}" ] && echo "✅ MEM0_API_KEY: Set" || echo "❌ MEM0_API_KEY: Not set"
}

check_dependencies() {
    echo -e "${CYAN}📦 Dependencies Check${NC}"
    echo ""
    
    npm list openai @anthropic-ai/sdk express dotenv --depth=0 2>/dev/null || echo "Some dependencies missing - run 'npm install'"
}

test_imports() {
    echo -e "${BLUE}🔗 Testing Import Chain${NC}"
    echo ""
    
    npx ts-node --transpile-only -r tsconfig-paths/register src/boot/diag.ts 2>/dev/null || echo "Import chain has issues"
}

build_project() {
    echo -e "${GREEN}🏗️ Building Project${NC}"
    echo ""
    
    npm run build
}

typescript_check() {
    echo -e "${CYAN}📝 TypeScript Check${NC}"
    echo ""
    
    npx tsc --noEmit || echo "TypeScript errors found"
}

show_api_docs() {
    echo -e "${PURPLE}📖 API Documentation${NC}"
    echo ""
    
    if lsof -iTCP:3002 -sTCP:LISTEN >/dev/null 2>&1; then
        echo "Live API documentation:"
        curl -s http://localhost:3002/api | jq . 2>/dev/null || echo "API not responding"
    else
        echo -e "${RED}Server not running. Start server first.${NC}"
    fi
}

# Main loop
show_banner

while true; do
    show_menu
    read -p "Enter your choice: " choice
    echo ""
    
    case $choice in
        1) start_server ;;
        2) check_server_status ;;
        3) kill_server ;;
        4) view_logs ;;
        5) test_api_routes ;;
        6) test_health_endpoints ;;
        7) test_conversational_pipeline ;;
        8) run_full_diagnostics ;;
        9) run_full_diagnostics ;;
        10) check_environment ;;
        11) check_dependencies ;;
        12) test_imports ;;
        13) build_project ;;
        14) typescript_check ;;
        15) show_api_docs ;;
        16) continue ;;
        q|quit|exit) 
            echo -e "${GREEN}👋 Happy coding with Sesame/Maya!${NC}"
            exit 0
            ;;
        *) 
            echo -e "${RED}❌ Invalid choice. Please try again.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done