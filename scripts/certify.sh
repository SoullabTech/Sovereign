#!/usr/bin/env bash
# scripts/certify.sh - MAIA Capability Certification Harness
# Only certify what can be proven. Don't promise vibes.

set -e  # Exit on first failure

PORT=${PORT:-3000}
BASE_URL="http://localhost:$PORT"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Test helper functions
test_start() {
  TESTS_TOTAL=$((TESTS_TOTAL + 1))
  echo -e "\n${YELLOW}[$TESTS_TOTAL]${NC} $1"
}

test_pass() {
  TESTS_PASSED=$((TESTS_PASSED + 1))
  echo -e "  ${GREEN}✓${NC} $1"
}

test_fail() {
  TESTS_FAILED=$((TESTS_FAILED + 1))
  echo -e "  ${RED}✗${NC} $1"
  echo "  Detail: $2"
}

# JSON extraction helper (requires jq or python3)
json_get() {
  if command -v jq &> /dev/null; then
    echo "$1" | jq -r "$2"
  else
    echo "$1" | python3 -c "import sys, json; data=json.load(sys.stdin); print($2)" 2>/dev/null || echo "null"
  fi
}

echo "======================================"
echo "  MAIA SOVEREIGNTY CERTIFICATION"
echo "======================================"
echo "Testing against: $BASE_URL"
echo ""

# ============================================
# TEST 1: Pure Liveness Check
# ============================================
test_start "Pure Liveness Check (No Blocking)"

HEALTH=$(curl -s "$BASE_URL/api/health" || echo '{"ok":false}')
HEALTH_OK=$(json_get "$HEALTH" ".ok")
HEALTH_SERVICE=$(json_get "$HEALTH" ".service")

if [ "$HEALTH_OK" = "true" ]; then
  test_pass "Service is alive (ok=true)"
else
  test_fail "Service not responding" "Health endpoint returned ok=$HEALTH_OK"
fi

if [ "$HEALTH_SERVICE" = "MAIA-SOVEREIGN" ]; then
  test_pass "Service identity confirmed: $HEALTH_SERVICE"
else
  test_fail "Service identity missing" "Expected 'MAIA-SOVEREIGN', got '$HEALTH_SERVICE'"
fi

# Note: /api/health is now PURE LIVENESS (no subsystems checks)
# Use /api/ready for dependency/subsystem health checks

# ============================================
# TEST 2: Deterministic Spiralogic Definition
# ============================================
test_start "Deterministic Spiralogic Definition"

SPIRALOGIC=$(curl -s -X POST "$BASE_URL/api/sovereign/app/maia" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is Spiralogic?","userName":"CertifyBot","userId":"certify_user","mode":"dialogue","engine":"qwen2.5:7b"}')

SPIRALOGIC_TEXT=$(json_get "$SPIRALOGIC" ".message")
DETERMINISTIC=$(json_get "$SPIRALOGIC" ".metadata.deterministic")
ENGINE_USED=$(json_get "$SPIRALOGIC" ".metadata.engineUsed")
SPIRALOGIC_GLOSSARY=$(json_get "$SPIRALOGIC" ".metadata.promptBlocksIncluded.spiralogicGlossary")
PROCESSING_TIME=$(json_get "$SPIRALOGIC" ".metadata.processingTimeMs")

if echo "$SPIRALOGIC_TEXT" | grep -q "Soullab"; then
  test_pass "Contains 'Soullab' reference"
else
  test_fail "Missing 'Soullab' reference" "Response: ${SPIRALOGIC_TEXT:0:100}"
fi

if echo "$SPIRALOGIC_TEXT" | grep -q "Earth" && echo "$SPIRALOGIC_TEXT" | grep -q "Water" && \
   echo "$SPIRALOGIC_TEXT" | grep -q "Fire" && echo "$SPIRALOGIC_TEXT" | grep -q "Air" && \
   echo "$SPIRALOGIC_TEXT" | grep -q "Aether"; then
  test_pass "Contains all 5 elements (Earth, Water, Fire, Air, Aether)"
else
  test_fail "Missing elements" "Response: ${SPIRALOGIC_TEXT:0:100}"
fi

if [ "$DETERMINISTIC" = "true" ]; then
  test_pass "Metadata reports deterministic=true"
else
  test_fail "Metadata reports deterministic=$DETERMINISTIC" "Should be 'true'"
fi

if [ "$ENGINE_USED" = "deterministic" ]; then
  test_pass "Engine used: deterministic (bypassed model)"
else
  test_fail "Engine used: $ENGINE_USED" "Should be 'deterministic'"
fi

if [ "$SPIRALOGIC_GLOSSARY" = "true" ]; then
  test_pass "Spiralogic glossary marked as included"
fi

if [ "$PROCESSING_TIME" != "null" ] && [ "$PROCESSING_TIME" -lt 100 ]; then
  test_pass "Response time: ${PROCESSING_TIME}ms (instant)"
else
  test_fail "Response time: ${PROCESSING_TIME}ms" "Should be <100ms for deterministic response"
fi

# ============================================
# TEST 3: Dialogue Mode Contract
# ============================================
test_start "Dialogue Mode Contract"

DIALOGUE=$(curl -s -X POST "$BASE_URL/api/sovereign/app/maia" \
  -H "Content-Type: application/json" \
  -d '{"message":"I feel stuck today.","userName":"CertifyBot","userId":"certify_user","mode":"dialogue","engine":"qwen2.5:7b"}')

MODE_REQUESTED=$(json_get "$DIALOGUE" ".metadata.modeRequested")
MODE_USED=$(json_get "$DIALOGUE" ".metadata.modeUsed")
ENGINE_REQUESTED=$(json_get "$DIALOGUE" ".metadata.engineRequested")
ENGINE_USED=$(json_get "$DIALOGUE" ".metadata.engineUsed")

if [ "$MODE_REQUESTED" = "dialogue" ]; then
  test_pass "Mode requested: dialogue"
fi

if [ "$MODE_USED" = "dialogue" ]; then
  test_pass "Mode used: dialogue (contract honored)"
else
  test_fail "Mode used: $MODE_USED" "Requested 'dialogue' but got '$MODE_USED'"
fi

if [ "$ENGINE_REQUESTED" = "qwen2.5:7b" ]; then
  test_pass "Engine requested: qwen2.5:7b"
fi

if [ "$ENGINE_USED" != "null" ]; then
  test_pass "Engine used: $ENGINE_USED (transparent)"
fi

# ============================================
# TEST 4: Counsel Mode Contract
# ============================================
test_start "Counsel Mode Contract"

COUNSEL=$(curl -s -X POST "$BASE_URL/api/sovereign/app/maia" \
  -H "Content-Type: application/json" \
  -d '{"message":"Help me work through my anxiety.","userName":"CertifyBot","userId":"certify_user","mode":"counsel","engine":"qwen2.5:7b"}')

MODE_USED_COUNSEL=$(json_get "$COUNSEL" ".metadata.modeUsed")

if [ "$MODE_USED_COUNSEL" = "counsel" ]; then
  test_pass "Mode used: counsel (contract honored)"
else
  test_fail "Mode used: $MODE_USED_COUNSEL" "Requested 'counsel' but got '$MODE_USED_COUNSEL'"
fi

# ============================================
# TEST 5: Scribe Mode Contract
# ============================================
test_start "Scribe Mode Contract"

SCRIBE=$(curl -s -X POST "$BASE_URL/api/sovereign/app/maia" \
  -H "Content-Type: application/json" \
  -d '{"message":"Summarize the plan in 3 bullets.","userName":"CertifyBot","userId":"certify_user","mode":"scribe","engine":"qwen2.5:7b"}')

MODE_USED_SCRIBE=$(json_get "$SCRIBE" ".metadata.modeUsed")

if [ "$MODE_USED_SCRIBE" = "scribe" ]; then
  test_pass "Mode used: scribe (contract honored)"
else
  test_fail "Mode used: $MODE_USED_SCRIBE" "Requested 'scribe' but got '$MODE_USED_SCRIBE'"
fi

# ============================================
# TEST 6: UserName Normalization (No Placeholders)
# ============================================
test_start "UserName Normalization (No Guest/Explorer)"

USERNAME_TEST=$(curl -s -X POST "$BASE_URL/api/sovereign/app/maia" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","userName":"Kelly","userId":"certify_user","mode":"dialogue","engine":"qwen2.5:7b"}')

USERNAME_INCLUDED=$(json_get "$USERNAME_TEST" ".metadata.promptBlocksIncluded.userName")
USERNAME_RESPONSE=$(json_get "$USERNAME_TEST" ".message")

if [ "$USERNAME_INCLUDED" = "true" ]; then
  test_pass "UserName marked as included in metadata"
fi

if ! echo "$USERNAME_RESPONSE" | grep -qi "guest"; then
  test_pass "Response does not contain 'Guest' placeholder"
else
  test_fail "Response contains 'Guest' placeholder" "Response: ${USERNAME_RESPONSE:0:100}"
fi

if ! echo "$USERNAME_RESPONSE" | grep -qi "explorer"; then
  test_pass "Response does not contain 'Explorer' placeholder"
else
  test_fail "Response contains 'Explorer' placeholder" "Response: ${USERNAME_RESPONSE:0:100}"
fi

# ============================================
# TEST 7: Truth Metadata Present
# ============================================
test_start "Truth Metadata Present in All Responses"

METADATA_FIELDS_PRESENT=0

if [ "$(json_get "$DIALOGUE" ".metadata.modeRequested")" != "null" ]; then
  METADATA_FIELDS_PRESENT=$((METADATA_FIELDS_PRESENT + 1))
fi
if [ "$(json_get "$DIALOGUE" ".metadata.modeUsed")" != "null" ]; then
  METADATA_FIELDS_PRESENT=$((METADATA_FIELDS_PRESENT + 1))
fi
if [ "$(json_get "$DIALOGUE" ".metadata.engineRequested")" != "null" ]; then
  METADATA_FIELDS_PRESENT=$((METADATA_FIELDS_PRESENT + 1))
fi
if [ "$(json_get "$DIALOGUE" ".metadata.engineUsed")" != "null" ]; then
  METADATA_FIELDS_PRESENT=$((METADATA_FIELDS_PRESENT + 1))
fi
if [ "$(json_get "$DIALOGUE" ".metadata.deterministic")" != "null" ]; then
  METADATA_FIELDS_PRESENT=$((METADATA_FIELDS_PRESENT + 1))
fi

if [ $METADATA_FIELDS_PRESENT -ge 5 ]; then
  test_pass "All truth metadata fields present (modeRequested, modeUsed, engineRequested, engineUsed, deterministic)"
else
  test_fail "Missing truth metadata fields" "Only $METADATA_FIELDS_PRESENT/5 fields present"
fi

# ============================================
# TEST 8: Liveness Never Blocks
# ============================================
test_start "Liveness Check Never Blocks (< 2s)"

# Use --max-time 2 to enforce hard timeout
LIVENESS_START=$(date +%s)
LIVENESS_RESPONSE=$(curl --max-time 2 -s "$BASE_URL/api/health" 2>&1 || echo '{"ok":false,"error":"timeout"}')
LIVENESS_END=$(date +%s)
LIVENESS_DURATION=$((LIVENESS_END - LIVENESS_START))

LIVENESS_OK=$(json_get "$LIVENESS_RESPONSE" ".ok")

if [ "$LIVENESS_OK" = "true" ]; then
  test_pass "Liveness check returned ok=true"
else
  test_fail "Liveness check failed" "Response: ${LIVENESS_RESPONSE:0:100}"
fi

if [ $LIVENESS_DURATION -lt 2 ]; then
  test_pass "Liveness check completed in ${LIVENESS_DURATION}s (< 2s)"
else
  test_fail "Liveness check took too long: ${LIVENESS_DURATION}s" "Should complete in < 2s"
fi

# ============================================
# TEST 9: Fallback Shows in Metadata
# ============================================
test_start "Fallback Metadata When Nonsense Model Requested"

FALLBACK_TEST=$(curl -s -X POST "$BASE_URL/api/sovereign/app/maia" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","userName":"CertifyBot","userId":"certify_user","mode":"dialogue","engine":"nonsense-model-xyz-9000"}')

ENGINE_REQUESTED_FALLBACK=$(json_get "$FALLBACK_TEST" ".metadata.engineRequested")
ENGINE_USED_FALLBACK=$(json_get "$FALLBACK_TEST" ".metadata.engineUsed")
PROVIDER_USED_FALLBACK=$(json_get "$FALLBACK_TEST" ".metadata.providerUsed")

if [ "$ENGINE_REQUESTED_FALLBACK" = "nonsense-model-xyz-9000" ]; then
  test_pass "Metadata shows requested engine: nonsense-model-xyz-9000"
else
  test_fail "Metadata engineRequested: $ENGINE_REQUESTED_FALLBACK" "Should be 'nonsense-model-xyz-9000'"
fi

# Engine used should NOT be the nonsense model (should fall back to qwen2.5:7b or consciousness_engine)
if [ "$ENGINE_USED_FALLBACK" != "nonsense-model-xyz-9000" ] && [ "$ENGINE_USED_FALLBACK" != "null" ]; then
  test_pass "Metadata shows fallback engine used: $ENGINE_USED_FALLBACK (not nonsense model)"
else
  test_fail "Metadata engineUsed: $ENGINE_USED_FALLBACK" "Should fall back to real model, not use nonsense model"
fi

if [ "$PROVIDER_USED_FALLBACK" != "null" ]; then
  test_pass "Metadata shows provider: $PROVIDER_USED_FALLBACK"
fi

# ============================================
# TEST 10: Readiness Check (Dependencies Available)
# ============================================
test_start "Readiness Check (Dependencies Available)"

READY=$(curl -s "$BASE_URL/api/ready" || echo '{"ready":false}')
READY_OK=$(json_get "$READY" ".ready")
OLLAMA_STATUS=$(json_get "$READY" ".dependencies.ollama.status")
MEMORY_PROVIDER=$(json_get "$READY" ".dependencies.memory.provider")

if [ "$READY_OK" = "true" ]; then
  test_pass "Service is ready (dependencies available)"
else
  test_fail "Service not ready" "Ready endpoint returned ready=$READY_OK"
fi

if [ "$OLLAMA_STATUS" = "ready" ]; then
  test_pass "Ollama status: ready"
else
  test_fail "Ollama status: $OLLAMA_STATUS" "Expected 'ready'"
fi

if [ "$MEMORY_PROVIDER" != "null" ]; then
  test_pass "Memory provider: $MEMORY_PROVIDER"
fi

# ============================================
# TEST 11: No Name Invention When Unknown
# ============================================
test_start "No Name Invention When Unknown"

UNKNOWN_SESSION="no_name_$(date +%s)"
UNKNOWN_RESP=$(curl -sS -X POST "$BASE_URL/api/sovereign/app/maia" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Hi\",\"userName\":\"\",\"userId\":\"$UNKNOWN_SESSION\",\"sessionId\":\"$UNKNOWN_SESSION\",\"mode\":\"dialogue\"}")

UNKNOWN_MSG=$(json_get "$UNKNOWN_RESP" ".message")

# Check that response doesn't contain invented proper names in greeting patterns
# Patterns to avoid: "Hi Emily", "Hey Sarah", "Hello Michael", etc.
if echo "$UNKNOWN_MSG" | grep -qiE '^(Hi|Hey|Hello)[[:space:]]+[A-Z][a-z]+[,!.]'; then
  INVENTED_NAME=$(echo "$UNKNOWN_MSG" | grep -oiE '^(Hi|Hey|Hello)[[:space:]]+[A-Z][a-z]+' | head -1)
  test_fail "Response invented a name: $INVENTED_NAME" "Should greet without name when userName is unknown"
else
  test_pass "No name invention (greeted appropriately without fabricating a name)"
fi

# Also ensure no Guest/Explorer placeholders
if echo "$UNKNOWN_MSG" | grep -qiE '\b(Guest|Explorer)\b'; then
  test_fail "Response contains placeholder" "Found Guest/Explorer when userName is unknown"
else
  test_pass "No placeholder names (Guest/Explorer not used)"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "======================================"
echo "  CERTIFICATION SUMMARY"
echo "======================================"
echo -e "Tests Passed:  ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed:  ${RED}$TESTS_FAILED${NC}"
echo "Tests Total:   $TESTS_TOTAL"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ MAIA SOVEREIGNTY CERTIFIED${NC}"
  echo "All core capabilities are verified and working."
  echo ""
  echo "Safe to promise testers:"
  echo "  - Spiralogic definition is authoritative"
  echo "  - Mode contracts are honored (dialogue/counsel/scribe)"
  echo "  - Truth metadata is transparent"
  echo "  - No placeholder names will be used"
  echo "  - No name invention when user is unknown"
  echo ""
  exit 0
else
  echo -e "${RED}✗ CERTIFICATION FAILED${NC}"
  echo "Some capabilities are not working correctly."
  echo "DO NOT ship this build to testers until all tests pass."
  echo ""
  exit 1
fi
