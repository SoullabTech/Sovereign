#!/bin/bash
# MAIA Golden State Behavioral Test
# Tests key behavioral characteristics against baseline expectations

set -e

BASE_URL="${MAIA_URL:-http://localhost:3005}"
RESULTS_DIR="/Users/soullab/MAIA-SOVEREIGN/golden-states/test-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULT_FILE="$RESULTS_DIR/test_$TIMESTAMP.md"

mkdir -p "$RESULTS_DIR"

echo "🧪 MAIA Golden State Behavioral Test"
echo "======================================"
echo "Testing against: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

# Test function
test_endpoint() {
    local name="$1"
    local endpoint="$2"
    local expected_ms="$3"

    echo -n "Testing $name... "

    START=$(date +%s%3N)
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint" 2>/dev/null || echo "000")
    END=$(date +%s%3N)

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    DURATION=$((END - START))

    if [ "$HTTP_CODE" = "200" ]; then
        if [ "$DURATION" -lt "$expected_ms" ]; then
            echo -e "${GREEN}PASS${NC} (${DURATION}ms)"
            ((PASS_COUNT++))
            echo "- ✅ $name: PASS (${DURATION}ms)" >> "$RESULT_FILE"
        else
            echo -e "${YELLOW}SLOW${NC} (${DURATION}ms > ${expected_ms}ms expected)"
            ((WARN_COUNT++))
            echo "- ⚠️ $name: SLOW (${DURATION}ms)" >> "$RESULT_FILE"
        fi
    else
        echo -e "${RED}FAIL${NC} (HTTP $HTTP_CODE)"
        ((FAIL_COUNT++))
        echo "- ❌ $name: FAIL (HTTP $HTTP_CODE)" >> "$RESULT_FILE"
    fi
}

# Test MAIA conversation endpoint
test_maia_response() {
    echo -n "Testing MAIA response quality... "

    START=$(date +%s%3N)
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/sovereign/app/maia" \
        -H "Content-Type: application/json" \
        -d '{
            "message": "Hello, how are you today?",
            "userId": "golden-state-test",
            "sessionId": "test-session"
        }' 2>/dev/null || echo '{"error": true}')
    END=$(date +%s%3N)

    DURATION=$((END - START))

    # Check for response content
    if echo "$RESPONSE" | grep -q "error"; then
        echo -e "${RED}FAIL${NC} (Error in response)"
        ((FAIL_COUNT++))
        echo "- ❌ MAIA Response: FAIL (Error)" >> "$RESULT_FILE"
    elif [ "$DURATION" -lt 5000 ]; then
        echo -e "${GREEN}PASS${NC} (${DURATION}ms)"
        ((PASS_COUNT++))
        echo "- ✅ MAIA Response: PASS (${DURATION}ms)" >> "$RESULT_FILE"

        # Extract a snippet for the report
        SNIPPET=$(echo "$RESPONSE" | head -c 200)
        echo "  Response preview: $SNIPPET..." >> "$RESULT_FILE"
    else
        echo -e "${YELLOW}SLOW${NC} (${DURATION}ms)"
        ((WARN_COUNT++))
        echo "- ⚠️ MAIA Response: SLOW (${DURATION}ms)" >> "$RESULT_FILE"
    fi
}

# Initialize results file
cat > "$RESULT_FILE" << EOF
# Golden State Test Results
**Run:** $(date "+%Y-%m-%d %H:%M:%S")
**Target:** $BASE_URL

## Test Results
EOF

echo ""
echo "Running tests..."
echo ""

# Run health checks
test_endpoint "API Health" "/api/health" 500
test_endpoint "Memory System" "/api/consciousness/memory/health" 1000

# Run MAIA behavioral test
test_maia_response

echo ""
echo "======================================"
echo "Results Summary:"
echo -e "  ${GREEN}Passed:${NC} $PASS_COUNT"
echo -e "  ${YELLOW}Warnings:${NC} $WARN_COUNT"
echo -e "  ${RED}Failed:${NC} $FAIL_COUNT"
echo ""

# Add summary to results
cat >> "$RESULT_FILE" << EOF

## Summary
- **Passed:** $PASS_COUNT
- **Warnings:** $WARN_COUNT
- **Failed:** $FAIL_COUNT

## Comparison Notes
_Add notes about how this compares to the golden state..._
EOF

echo "📄 Full results saved to: $RESULT_FILE"

# Return appropriate exit code
if [ "$FAIL_COUNT" -gt 0 ]; then
    exit 1
elif [ "$WARN_COUNT" -gt 0 ]; then
    exit 0
else
    exit 0
fi
