#!/bin/bash

# 🔮 Maya Quick Start - One command setup and test
# Gets your Sesame/Maya pipeline up and validated in under 30 seconds

set -euo pipefail

# Color codes (safe with set -u)
: "${RED:='\033[0;31m'}" "${GREEN:='\033[0;32m'}" "${YELLOW:='\033[0;33m'}" "${BLUE:='\033[0;34m'}" "${PURPLE:='\033[0;35m'}" "${CYAN:='\033[0;36m'}" "${NC:='\033[0m'}"

cd "$(dirname "$0")"

echo -e "${PURPLE}🔮 Maya Quick Start${NC}"
echo "=================="
echo ""

echo -e "${BLUE}1. Pre-flight API key check...${NC}"
if [ -f "../scripts/check-keys.sh" ]; then
    if ! ../scripts/check-keys.sh; then
        echo -e "${RED}❌ Pre-flight check failed: API keys missing${NC}"
        echo "Fix API keys before starting Maya server."
        exit 1
    fi
    echo -e "${GREEN}✅ API keys validated${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️ check-keys.sh not found, skipping API validation${NC}"
fi

echo -e "${BLUE}2. Cleaning up existing processes...${NC}"
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

echo -e "${BLUE}3. Starting Sesame/Maya server...${NC}"
export APP_PORT=3002
unset PORT
nohup sh -c 'SAFE_MODE=1 NODE_ENV=development npx ts-node --transpile-only -r tsconfig-paths/register src/server-minimal.ts' > maya-server.log 2>&1 &

echo "Waiting for server startup..."
sleep 5

echo -e "${BLUE}4. Validating pipeline...${NC}"
if lsof -iTCP:3002 -sTCP:LISTEN >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Server running on port 3002${NC}"
    
    # Quick validation
    echo "Testing endpoints..."
    
    API_STATUS=$(curl -s http://localhost:3002/api | jq -r '.name // "failed"' 2>/dev/null)
    HEALTH_STATUS=$(curl -s http://localhost:3002/api/v1/converse/health | jq -r '.status // "failed"' 2>/dev/null)
    
    if [ "$API_STATUS" != "failed" ] && [ "$HEALTH_STATUS" != "failed" ]; then
        echo -e "${GREEN}✅ All endpoints responding${NC}"
        echo ""
        echo -e "${CYAN}🎯 Ready to use:${NC}"
        echo "  API Root: http://localhost:3002/api"
        echo "  Health: http://localhost:3002/api/v1/converse/health"
        echo "  Chat: POST http://localhost:3002/api/v1/converse/message"
        echo ""
        echo -e "${PURPLE}Example test:${NC}"
        echo "  curl -s -X POST http://localhost:3002/api/v1/converse/message \\"
        echo "    -H 'Content-Type: application/json' \\"
        echo "    -d '{\"userText\":\"guide me through a grounding ritual\",\"userId\":\"test\",\"element\":\"earth\"}'"
        echo ""
    else
        echo -e "${RED}❌ Some endpoints not responding${NC}"
        echo "Run './maya-dev-tools.sh' for detailed diagnostics"
    fi
else
    echo -e "${RED}❌ Server failed to start${NC}"
    echo "Check maya-server.log for errors:"
    tail -10 maya-server.log 2>/dev/null || echo "No log file found"
fi

echo ""
echo -e "${CYAN}💡 Next steps:${NC}"
echo "  - Run './maya-dev-tools.sh' for interactive menu"
echo "  - Run './claude-code-diagnostics.sh' for full validation" 
echo "  - Check './CLAUDE_CODE_COMMANDS.md' for copy/paste commands"