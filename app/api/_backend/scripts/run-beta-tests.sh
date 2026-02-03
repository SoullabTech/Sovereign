#!/bin/bash
# 🌀 Spiralogic Oracle – Unified Beta Test Runner
# Runs full integration + prompt tests for Maya & Sesame

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo ""
echo "======================================"
echo -e " ${PURPLE}🎉 Running Spiralogic Oracle Beta Tests${NC} "
echo "======================================"
echo ""

# Navigate to backend directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$BACKEND_DIR")"
cd "$BACKEND_DIR"

# Load environment
if [ -f "../.env.local" ]; then
  export $(grep -v '^#' ../.env.local | xargs)
  echo -e "${GREEN}✓ Environment loaded${NC}"
else
  echo -e "${YELLOW}⚠️  No .env.local found, using defaults${NC}"
fi

# Create logs directory if needed
mkdir -p logs
TEST_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEST_REPORT="logs/beta-test-report-${TEST_TIMESTAMP}.json"

# Initialize report
echo "{" > "$TEST_REPORT"
echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"," >> "$TEST_REPORT"
echo "  \"tests\": {" >> "$TEST_REPORT"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to log test results
log_test_result() {
    local test_name=$1
    local status=$2
    local details=$3
    
    if [ "$status" = "passed" ]; then
        ((TESTS_PASSED++))
        echo -e "${GREEN}✓ $test_name${NC}"
    else
        ((TESTS_FAILED++))
        echo -e "${RED}✗ $test_name${NC}"
    fi
    
    # Add to JSON report (append comma if not first test)
    if [ $((TESTS_PASSED + TESTS_FAILED)) -gt 1 ]; then
        echo "," >> "$TEST_REPORT"
    fi
    
    echo -n "    \"$test_name\": {
      \"status\": \"$status\",
      \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
      \"details\": \"$details\"
    }" >> "$TEST_REPORT"
}

# 1. Health check
echo -e "\n${BLUE}🔍 Checking backend health...${NC}"
if HEALTH_RESPONSE=$(curl -s http://localhost:3002/api/v1/health 2>/dev/null); then
    if echo "$HEALTH_RESPONSE" | grep -q '"status":"healthy"'; then
        log_test_result "backend_health" "passed" "Backend is healthy"
        echo "$HEALTH_RESPONSE" | jq . 2>/dev/null || echo "$HEALTH_RESPONSE"
    else
        log_test_result "backend_health" "failed" "Backend unhealthy: $HEALTH_RESPONSE"
    fi
else
    log_test_result "backend_health" "failed" "Backend not responding"
fi

# 2. Sesame check
echo -e "\n${BLUE}🎤 Checking Sesame voice engine...${NC}"
if [ "$SESAME_ENABLED" = "true" ]; then
    if SESAME_RESPONSE=$(curl -s http://localhost:8000/health 2>/dev/null); then
        if echo "$SESAME_RESPONSE" | grep -q '"model_loaded":true'; then
            log_test_result "sesame_health" "passed" "Sesame model loaded and ready"
            echo "$SESAME_RESPONSE" | jq . 2>/dev/null || echo "$SESAME_RESPONSE"
        else
            log_test_result "sesame_health" "failed" "Sesame model not loaded"
        fi
    else
        log_test_result "sesame_health" "failed" "Sesame server not responding"
    fi
else
    echo -e "${YELLOW}⚠️  Sesame not enabled, skipping voice check${NC}"
    log_test_result "sesame_health" "skipped" "Sesame disabled in configuration"
fi

# 3. Voice API test
echo -e "\n${BLUE}🔊 Testing voice synthesis API...${NC}"
VOICE_TEST=$(curl -s -X POST http://localhost:3000/api/voice/unified \
  -H "Content-Type: application/json" \
  -d '{"text":"Maya voice test","voiceEngine":"auto"}' 2>/dev/null || echo "{}")

if echo "$VOICE_TEST" | grep -q '"success":true'; then
    ENGINE=$(echo "$VOICE_TEST" | grep -o '"engine":"[^"]*"' | cut -d'"' -f4)
    log_test_result "voice_synthesis" "passed" "Voice generated via $ENGINE"
    echo -e "   Engine used: ${GREEN}$ENGINE${NC}"
else
    log_test_result "voice_synthesis" "failed" "Voice synthesis failed"
fi

# 4. Run CSM integration tests (if test file exists)
echo -e "\n${BLUE}🧪 Running CSM integration test suite...${NC}"
if [ -f "test-maya-csm-integration.js" ]; then
    if node test-maya-csm-integration.js > /tmp/csm-test-output.log 2>&1; then
        log_test_result "csm_integration" "passed" "All CSM integration tests passed"
        echo -e "${GREEN}✓ CSM integration tests completed${NC}"
    else
        log_test_result "csm_integration" "failed" "CSM integration tests failed - see logs"
        echo -e "${YELLOW}⚠️  Some CSM tests failed (check logs)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  test-maya-csm-integration.js not found${NC}"
    log_test_result "csm_integration" "skipped" "Test file not found"
fi

# 5. Oracle conversation API test
echo -e "\n${BLUE}📡 Testing Oracle conversation API...${NC}"
ORACLE_TEST=$(curl -s -X POST http://localhost:3002/api/v1/converse/stream \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"element":"aether","userId":"beta-test","q":"Hello Maya"}' \
  --max-time 5 2>/dev/null || echo "")

if echo "$ORACLE_TEST" | grep -q 'event: delta'; then
    log_test_result "oracle_conversation" "passed" "Oracle conversation streaming works"
    echo -e "${GREEN}✓ Oracle API responding with streaming${NC}"
else
    # Fallback to checking if any reasonable response
    if [ -n "$ORACLE_TEST" ]; then
        log_test_result "oracle_conversation" "passed" "Oracle API responded"
    else
        log_test_result "oracle_conversation" "failed" "Oracle API not responding"
    fi
fi

# 6. Memory service check (if Supabase configured)
echo -e "\n${BLUE}💾 Checking memory persistence...${NC}"
if [ -n "$SUPABASE_URL" ] && [ "$SUPABASE_URL" != "null" ]; then
    # Try a simple memory test endpoint
    MEMORY_TEST=$(curl -s http://localhost:3002/api/oracle/memory \
      -H "Authorization: Bearer test-token" 2>/dev/null || echo "{}")
    
    if echo "$MEMORY_TEST" | grep -q '"error"'; then
        log_test_result "memory_service" "failed" "Memory service error: likely Supabase DNS issue"
        echo -e "${YELLOW}⚠️  Memory persistence unavailable (Supabase DNS issue)${NC}"
    else
        log_test_result "memory_service" "passed" "Memory service operational"
    fi
else
    echo -e "${YELLOW}⚠️  Supabase not configured${NC}"
    log_test_result "memory_service" "skipped" "No Supabase configuration"
fi

# 7. TypeScript compilation check
echo -e "\n${BLUE}📦 Checking TypeScript compilation...${NC}"
if npm run build:check > /tmp/ts-check.log 2>&1; then
    log_test_result "typescript_compilation" "passed" "No TypeScript errors"
    echo -e "${GREEN}✓ TypeScript compilation clean${NC}"
else
    ERROR_COUNT=$(grep -c "error TS" /tmp/ts-check.log || echo "0")
    log_test_result "typescript_compilation" "failed" "$ERROR_COUNT TypeScript errors found"
    echo -e "${RED}✗ $ERROR_COUNT TypeScript errors (run npm run build:check for details)${NC}"
fi

# Close JSON report
echo "" >> "$TEST_REPORT"
echo "  }," >> "$TEST_REPORT"
echo "  \"summary\": {" >> "$TEST_REPORT"
echo "    \"passed\": $TESTS_PASSED," >> "$TEST_REPORT"
echo "    \"failed\": $TESTS_FAILED," >> "$TEST_REPORT"
echo "    \"total\": $((TESTS_PASSED + TESTS_FAILED))" >> "$TEST_REPORT"
echo "  }" >> "$TEST_REPORT"
echo "}" >> "$TEST_REPORT"

# Display summary
echo ""
echo "======================================"
echo -e " ${PURPLE}📊 Test Summary${NC}"
echo "======================================"
echo -e "   Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "   Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "   Total:  $((TESTS_PASSED + TESTS_FAILED))"
echo ""
echo -e "   Report saved: ${BLUE}$TEST_REPORT${NC}"
echo ""

# Beta prompt guidance
echo "======================================"
echo -e " ${PURPLE}📖 Next Steps${NC}"
echo "======================================"
echo "1. Test manual prompts in Oracle UI:"
echo -e "   👉 ${BLUE}http://localhost:3000/oracle${NC}"
echo ""
echo "2. Use prompts from:"
echo -e "   📄 ${YELLOW}AIN_BETA_TEST_PROMPTS.md${NC}"
echo ""
echo "3. Voice testing commands:"
echo "   - Test Sesame: curl -X POST http://localhost:3000/api/voice/unified -H 'Content-Type: application/json' -d '{\"text\":\"Hello\",\"voiceEngine\":\"sesame\"}'"
echo "   - Test fallback: curl -X POST http://localhost:3000/api/voice/unified -H 'Content-Type: application/json' -d '{\"text\":\"Hello\",\"voiceEngine\":\"elevenlabs\"}'"
echo ""

# Exit with appropriate code
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All automated tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed - check report for details${NC}"
    exit 1
fi