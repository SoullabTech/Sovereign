#!/bin/bash

# 🔮 Claude Code Diagnostics for Sesame/Maya Pipeline
# Run this script to validate your entire backend setup

set -euo pipefail

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Success/failure counters
PASS=0
FAIL=0

check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAIL++))
    fi
}

run_test() {
    echo -e "${BLUE}🔍 Testing:${NC} $2"
    if eval "$1" >/dev/null 2>&1; then
        check_result 0 "$2"
    else
        check_result 1 "$2"
    fi
}

echo -e "${PURPLE}🔮 Sesame/Maya Pipeline Diagnostics${NC}"
echo "===================================="
echo ""

# Change to backend directory
cd "$(dirname "$0")"

echo -e "${YELLOW}📋 Environment Configuration${NC}"
echo "----------------------------"

# Test environment variables
echo "Environment check:"
node -e "require('dotenv').config({override:false}); console.log('APP_PORT:', process.env.APP_PORT || 'unset'); console.log('PORT:', process.env.PORT || 'unset');"

echo ""
echo -e "${YELLOW}🔧 Dependencies Check${NC}"
echo "---------------------"

run_test "npm list openai --depth=0" "OpenAI package installed"
run_test "npm list @anthropic-ai/sdk --depth=0" "Anthropic SDK installed"
run_test "npm list express --depth=0" "Express installed"
run_test "npm list dotenv --depth=0" "Dotenv installed"

echo ""
echo -e "${YELLOW}📁 File Structure${NC}"
echo "------------------"

run_test "test -f src/server-minimal.ts" "server-minimal.ts exists"
run_test "test -f src/api/index.ts" "API index exists"
run_test "test -f src/routes/conversational.routes.ts" "Conversational routes exist"
run_test "test -f src/services/ConversationalPipeline.ts" "ConversationalPipeline exists"

echo ""
echo -e "${YELLOW}🏗️ Build & Compilation${NC}"
echo "----------------------"

run_test "npx tsc --noEmit" "TypeScript compilation check"
run_test "npx ts-node --transpile-only -r tsconfig-paths/register src/boot/diag.ts" "Import chain validation"

echo ""
echo -e "${YELLOW}🚀 Server Status${NC}"
echo "---------------"

# Check if server is already running
if lsof -iTCP:3002 -sTCP:LISTEN >/dev/null 2>&1; then
    check_result 0 "Server listening on port 3002"
    SERVER_RUNNING=true
else
    echo -e "${YELLOW}⚠️ Server not running, attempting to start...${NC}"
    
    # Start server in background
    nohup sh -c 'export APP_PORT=3002; unset PORT; SAFE_MODE=1 NODE_ENV=development npx ts-node --transpile-only -r tsconfig-paths/register src/server-minimal.ts' > server-test.log 2>&1 &
    
    # Wait for startup
    sleep 5
    
    if lsof -iTCP:3002 -sTCP:LISTEN >/dev/null 2>&1; then
        check_result 0 "Server started successfully on port 3002"
        SERVER_RUNNING=true
    else
        check_result 1 "Server failed to start"
        echo "Check server-test.log for errors"
        SERVER_RUNNING=false
    fi
fi

echo ""
echo -e "${YELLOW}🌐 API Endpoint Tests${NC}"
echo "--------------------"

if [ "$SERVER_RUNNING" = true ]; then
    # Test basic connectivity
    run_test "curl -sf http://localhost:3002/api >/dev/null" "API root responds"
    
    # Test route discovery
    if curl -s http://localhost:3002/api | grep -q '"converse"'; then
        check_result 0 "API root includes converse route"
    else
        check_result 1 "API root missing converse route"
    fi
    
    # Test health endpoints
    run_test "curl -sf http://localhost:3002/api/v1/health >/dev/null" "/api/v1/health responds"
    run_test "curl -sf http://localhost:3002/api/v1/converse/health >/dev/null" "/api/v1/converse/health responds"
    
    # Test pipeline identification
    if curl -s http://localhost:3002/api/v1/converse/health | grep -q 'sesame-maya-pipeline'; then
        check_result 0 "Sesame/Maya pipeline confirmed"
    else
        check_result 1 "Sesame/Maya pipeline not detected"
    fi
    
    # Test conversational endpoint
    if curl -sf -X POST http://localhost:3002/api/v1/converse/message \
        -H 'Content-Type: application/json' \
        -d '{"userText":"test message","userId":"test-user","element":"earth","preferences":{"voice":{"enabled":false}}}' >/dev/null; then
        check_result 0 "Conversational endpoint responds"
    else
        check_result 1 "Conversational endpoint failed"
    fi
    
else
    echo -e "${RED}❌ Skipping endpoint tests - server not running${NC}"
    ((FAIL+=5))
fi

echo ""
echo -e "${YELLOW}🔍 Response Format Validation${NC}"
echo "-----------------------------"

if [ "$SERVER_RUNNING" = true ]; then
    # Test response format
    RESPONSE=$(curl -s http://localhost:3002/api/v1/converse/health 2>/dev/null || echo '{}')
    
    if echo "$RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
        check_result 0 "Health endpoint returns valid JSON"
    else
        check_result 1 "Health endpoint returns invalid JSON"
    fi
    
    if echo "$RESPONSE" | grep -q 'sesame-maya-pipeline'; then
        check_result 0 "Response contains pipeline identifier"
    else
        check_result 1 "Response missing pipeline identifier"
    fi
else
    echo -e "${RED}❌ Skipping response validation - server not running${NC}"
    ((FAIL+=2))
fi

echo ""
echo "===================================="
echo -e "${PURPLE}📊 Final Results${NC}"
echo "===================================="
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"

if [ $FAIL -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Sesame/Maya pipeline is ready.${NC}"
    echo ""
    echo "Quick commands to use:"
    echo "  curl -s http://localhost:3002/api | jq .routes"
    echo "  curl -s http://localhost:3002/api/v1/converse/health | jq ."
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}⚠️ Some tests failed. Check the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  - Install missing dependencies: npm install"
    echo "  - Check server logs: tail -f server-test.log"
    echo "  - Restart server: APP_PORT=3002 ./start-backend.sh"
    echo ""
    exit 1
fi