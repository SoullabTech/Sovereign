#!/bin/bash
# 🧪 Automated Beta System Test

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "════════════════════════════════════════════════════════"
echo "   🧪 SpiralogicOracleSystem Beta Test Suite"
echo "════════════════════════════════════════════════════════"
echo ""

# Check if backend is running
check_backend() {
    echo -e "${YELLOW}🔍 Checking backend status...${NC}"
    
    # Try to find the port from .port file
    if [ -f ".port" ]; then
        BACKEND_PORT=$(cat .port)
    else
        BACKEND_PORT=3002
    fi
    
    if curl -s http://localhost:$BACKEND_PORT/health > /dev/null; then
        echo -e "${GREEN}✅ Backend is running on port $BACKEND_PORT${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend is not running${NC}"
        echo "   Start it with: ./scripts/start-beta-bulletproof.sh"
        return 1
    fi
}

# Test API endpoints
test_endpoints() {
    echo ""
    echo -e "${YELLOW}🧪 Testing API endpoints...${NC}"
    
    # Health check
    echo -n "  Testing /health... "
    if curl -s http://localhost:$BACKEND_PORT/health | grep -q "ok"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    # Oracle chat
    echo -n "  Testing Oracle chat... "
    RESPONSE=$(curl -s -X POST http://localhost:$BACKEND_PORT/api/v1/oracle/chat \
        -H "Content-Type: application/json" \
        -d '{"message":"Hello","element":"water","userId":"test-user"}' || echo "failed")
    
    if [[ "$RESPONSE" != "failed" ]] && [[ ! "$RESPONSE" =~ "error" ]]; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    # Journal
    echo -n "  Testing Journal API... "
    if curl -s http://localhost:$BACKEND_PORT/api/v1/journal?userId=test-user | grep -q "entries"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    # Voice health
    echo -n "  Testing Voice health... "
    if curl -s http://localhost:$BACKEND_PORT/api/v1/voice/health | grep -q "status"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
}

# Check frontend
check_frontend() {
    echo ""
    echo -e "${YELLOW}🔍 Checking frontend status...${NC}"
    
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✅ Frontend is running on port 3000${NC}"
        return 0
    else
        echo -e "${RED}❌ Frontend is not running${NC}"
        echo "   Start it with: npm run dev"
        return 1
    fi
}

# Test Sesame voice service
test_voice_service() {
    echo ""
    echo -e "${YELLOW}🎤 Checking voice service...${NC}"
    
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Voice service is running on port 8000${NC}"
    else
        echo -e "${YELLOW}⚠️  Voice service not running (optional)${NC}"
        echo "   Start mock with: ./scripts/setup-csm-clean.sh"
    fi
}

# Check environment
check_environment() {
    echo ""
    echo -e "${YELLOW}🌍 Checking environment...${NC}"
    
    # Node version
    NODE_VERSION=$(node -v)
    echo "  Node.js: $NODE_VERSION"
    
    # Check for .env files
    if [ -f ".env" ] || [ -f ".env.local" ]; then
        echo -e "  Environment files: ${GREEN}Found${NC}"
    else
        echo -e "  Environment files: ${YELLOW}Missing (using defaults)${NC}"
    fi
    
    # Check Supabase vars
    if [ -n "$SUPABASE_URL" ] || grep -q "SUPABASE_URL" .env* 2>/dev/null; then
        echo -e "  Supabase config: ${GREEN}Found${NC}"
    else
        echo -e "  Supabase config: ${YELLOW}Not configured${NC}"
    fi
}

# Performance test
performance_test() {
    echo ""
    echo -e "${YELLOW}⚡ Running performance tests...${NC}"
    
    # Test response time
    echo -n "  Testing Oracle response time... "
    START=$(date +%s%N)
    curl -s -X POST http://localhost:$BACKEND_PORT/api/v1/oracle/chat \
        -H "Content-Type: application/json" \
        -d '{"message":"Hi","element":"air","userId":"perf-test"}' > /dev/null
    END=$(date +%s%N)
    DIFF=$((($END - $START) / 1000000))
    
    if [ $DIFF -lt 1000 ]; then
        echo -e "${GREEN}✅ ${DIFF}ms${NC}"
    else
        echo -e "${YELLOW}⚠️  ${DIFF}ms (slow)${NC}"
    fi
}

# Browser test
browser_test() {
    echo ""
    echo -e "${YELLOW}🌐 Browser test instructions:${NC}"
    echo "  1. Open http://localhost:3000"
    echo "  2. Complete onboarding flow"
    echo "  3. Send a message to Maya"
    echo "  4. Test voice input (click mic)"
    echo "  5. Create a journal entry"
    echo "  6. Upload a test file"
}

# Main test flow
main() {
    echo "Starting automated tests..."
    echo ""
    
    # Run checks
    BACKEND_OK=false
    FRONTEND_OK=false
    
    if check_backend; then
        BACKEND_OK=true
        test_endpoints
        performance_test
    fi
    
    if check_frontend; then
        FRONTEND_OK=true
    fi
    
    test_voice_service
    check_environment
    
    # Summary
    echo ""
    echo "════════════════════════════════════════════════════════"
    echo "   📊 Test Summary"
    echo "════════════════════════════════════════════════════════"
    
    if $BACKEND_OK && $FRONTEND_OK; then
        echo -e "${GREEN}✅ System is ready for testing!${NC}"
        echo ""
        browser_test
    else
        echo -e "${RED}❌ System is not fully running${NC}"
        echo ""
        echo "To start the system:"
        if ! $BACKEND_OK; then
            echo "  1. cd backend && ./scripts/start-beta-bulletproof.sh"
        fi
        if ! $FRONTEND_OK; then
            echo "  2. npm run dev (from project root)"
        fi
    fi
    
    echo ""
    echo "For full manual testing, see: BETA_TESTING_GUIDE.md"
}

# Run main
main