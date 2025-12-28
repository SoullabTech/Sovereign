#!/bin/bash
# MAIA Mode Awareness Smoke Test
# Verifies Talk/Care/Note modes produce different greeting styles

set -e

echo "🧪 Testing MAIA Mode Awareness"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test endpoint
ENDPOINT="${MAIA_TEST_URL:-http://localhost:3000}/api/between/chat"

echo "📍 Endpoint: $ENDPOINT"
echo ""

# Test greeting message
GREETING="Hello"

echo "📨 Test Message: '$GREETING'"
echo ""

# Function to extract message from JSON response
extract_message() {
  echo "$1" | grep -o '"message":"[^"]*"' | sed 's/"message":"//; s/"$//'
}

# Test Talk mode (dialogue)
echo "1️⃣  Testing TALK mode (dialogue)..."
TALK_RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "content-type: application/json" \
  -d "{\"message\":\"$GREETING\", \"sessionId\":\"mode-test-talk\", \"mode\":\"dialogue\"}")

TALK_MSG=$(extract_message "$TALK_RESPONSE")
echo "   Response: $TALK_MSG"

# Check for service language (should NOT be present)
if echo "$TALK_MSG" | grep -qiE "how can I help|how may I assist|what can I do"; then
  echo -e "   ${RED}❌ FAIL: Service language detected in Talk mode${NC}"
  exit 1
else
  echo -e "   ${GREEN}✅ PASS: No service language${NC}"
fi
echo ""

# Test Care mode (counsel)
echo "2️⃣  Testing CARE mode (counsel)..."
CARE_RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "content-type: application/json" \
  -d "{\"message\":\"$GREETING\", \"sessionId\":\"mode-test-care\", \"mode\":\"counsel\"}")

CARE_MSG=$(extract_message "$CARE_RESPONSE")
echo "   Response: $CARE_MSG"

# Check for therapeutic language (should be present OR neutral)
if echo "$CARE_MSG" | grep -qiE "support|help|listening|explore|need"; then
  echo -e "   ${GREEN}✅ PASS: Therapeutic language present${NC}"
elif echo "$CARE_MSG" | grep -qiE "here|with you"; then
  echo -e "   ${GREEN}✅ PASS: Supportive presence${NC}"
else
  echo -e "   ${YELLOW}⚠️  WARN: Expected therapeutic language${NC}"
fi
echo ""

# Test Note mode (scribe)
echo "3️⃣  Testing NOTE mode (scribe)..."
NOTE_RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "content-type: application/json" \
  -d "{\"message\":\"$GREETING\", \"sessionId\":\"mode-test-note\", \"mode\":\"scribe\"}")

NOTE_MSG=$(extract_message "$NOTE_RESPONSE")
echo "   Response: $NOTE_MSG"

# Check for witnessing language (should be minimal/observational)
if echo "$NOTE_MSG" | grep -qiE "ready|listening|here"; then
  echo -e "   ${GREEN}✅ PASS: Witnessing presence${NC}"
else
  echo -e "   ${YELLOW}⚠️  WARN: Expected witnessing language${NC}"
fi
echo ""

# Verify responses are different
echo "4️⃣  Verifying mode differentiation..."
if [ "$TALK_MSG" = "$CARE_MSG" ] || [ "$TALK_MSG" = "$NOTE_MSG" ] || [ "$CARE_MSG" = "$NOTE_MSG" ]; then
  echo -e "   ${RED}❌ FAIL: Modes producing identical responses${NC}"
  echo "   Talk: $TALK_MSG"
  echo "   Care: $CARE_MSG"
  echo "   Note: $NOTE_MSG"
  exit 1
else
  echo -e "   ${GREEN}✅ PASS: All three modes produce distinct responses${NC}"
fi
echo ""

echo "================================"
echo -e "${GREEN}🎉 Mode Awareness Test Complete${NC}"
echo ""
echo "Summary:"
echo "  Talk: $TALK_MSG"
echo "  Care: $CARE_MSG"
echo "  Note: $NOTE_MSG"
