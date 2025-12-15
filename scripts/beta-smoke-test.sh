#!/bin/bash
# MAIA Beta Smoke Test
# Tests 4 critical endpoints to ensure core functionality is working
# Run this anytime before deploying or when something feels off

set -e  # Exit on any error

# Configuration
PORT="${PORT:-3003}"
BASE_URL="http://localhost:${PORT}"
TEST_USER_ID="smoke-test-user-$(date +%s)"
TEST_SESSION_ID="smoke-test-session-$(date +%s)"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 MAIA BETA SMOKE TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing against: ${BASE_URL}"
echo "User ID: ${TEST_USER_ID}"
echo "Session ID: ${TEST_SESSION_ID}"
echo ""

PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local check_field="$5"

    echo -n "Testing ${name}... "

    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "${BASE_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        response=$(curl -s "${BASE_URL}${endpoint}" 2>&1)
    fi

    # Check if response contains expected field
    if echo "$response" | jq -e "$check_field" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "   Response: $(echo "$response" | head -c 200)"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Oracle (Sonnet path - FAST/CORE)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. ORACLE CONVERSATION (Sonnet FAST/CORE)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint \
    "Oracle endpoint" \
    "POST" \
    "/api/oracle/conversation" \
    "{\"message\":\"Hello MAIA, this is a smoke test\",\"userId\":\"${TEST_USER_ID}\",\"sessionId\":\"${TEST_SESSION_ID}\"}" \
    ".message"

echo ""

# Test 2: Sovereign MAIA (Opus DEEP path)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. SOVEREIGN MAIA (Opus DEEP)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint \
    "Sovereign MAIA" \
    "POST" \
    "/api/sovereign/app/maia" \
    "{\"message\":\"Deep consciousness question for smoke test\",\"userId\":\"${TEST_USER_ID}\",\"sessionId\":\"${TEST_SESSION_ID}\"}" \
    ".message"

echo ""

# Test 3: AIN Table of Contents
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. AIN TABLE OF CONTENTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint \
    "AIN TOC" \
    "GET" \
    "/api/book-companion/ain/toc" \
    "" \
    ".toc | length"

echo ""

# Test 4: AIN Section Fetch
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. AIN SECTION CONTENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# First get a valid section ID from TOC
SECTION_ID=$(curl -s "${BASE_URL}/api/book-companion/ain/toc" | jq -r '.toc[0].id' 2>/dev/null || echo "")

if [ -z "$SECTION_ID" ] || [ "$SECTION_ID" = "null" ]; then
    echo -e "${YELLOW}⚠ WARNING: Could not get section ID from TOC, using fallback${NC}"
    SECTION_ID="preface"
fi

test_endpoint \
    "AIN Section (${SECTION_ID})" \
    "GET" \
    "/api/book-companion/ain/section?id=${SECTION_ID}" \
    "" \
    ".content"

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SMOKE TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All smoke tests passed!${NC}"
    echo "   Core MAIA functionality is working."
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed.${NC}"
    echo "   Check the logs above for details."
    echo "   Common issues:"
    echo "   - Server not running (npm run dev)"
    echo "   - Database connection issues"
    echo "   - Missing environment variables"
    echo ""
    exit 1
fi
