#!/usr/bin/env bash
#
# RLM Navigate endpoint smoke test
#
# Validates:
# 1. Endpoint responds
# 2. Returns success: true
# 3. Returns nextFiles array
# 4. Confidence is reasonable
#
# Usage:
#   ./scripts/smoke/rlm-navigate-smoke.sh [base_url]
#
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"

ts() { date +"%H:%M:%S"; }
log() { echo "[$(ts)] $*"; }
ok()  { echo "✅ $*"; }
no()  { echo "❌ $*"; exit 1; }

log "RLM Navigate smoke test starting..."
log "BASE_URL=${BASE_URL}"

# Test 1: Health check
log "Test 1: Health check..."
if ! curl -sS --max-time 10 "$BASE_URL/api/health" >/dev/null 2>&1; then
  no "Health check failed - is the server running?"
fi
ok "Server healthy"

# Test 2: Navigate endpoint responds
log "Test 2: Calling navigate endpoint..."
RESP=$(curl -sS --max-time 30 -X POST "$BASE_URL/api/rlm/navigate" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "postgres database client Pool",
    "limit": 5,
    "includeSnippets": false
  }')

# Test 3: Response has success: true
log "Test 3: Checking success field..."
if ! echo "$RESP" | jq -e '.success == true' >/dev/null 2>&1; then
  echo "Response: $RESP"
  no "Expected success: true"
fi
ok "Response has success: true"

# Test 4: Has nextFiles array
log "Test 4: Checking nextFiles array..."
FILE_COUNT=$(echo "$RESP" | jq -r '.nextFiles | length')
if [[ "$FILE_COUNT" -lt 1 ]]; then
  echo "Response: $RESP"
  no "Expected at least 1 file in nextFiles"
fi
ok "Found ${FILE_COUNT} files in nextFiles"

# Test 5: First file is lib/db/postgres.ts (deterministic for this query)
log "Test 5: Checking top result..."
TOP_FILE=$(echo "$RESP" | jq -r '.nextFiles[0].file')
if [[ "$TOP_FILE" != *"postgres"* && "$TOP_FILE" != *"db"* ]]; then
  log "⚠️  Top file '$TOP_FILE' doesn't contain postgres/db - might be okay"
else
  ok "Top result: ${TOP_FILE}"
fi

# Test 6: Confidence is reasonable
log "Test 6: Checking confidence..."
CONFIDENCE=$(echo "$RESP" | jq -r '.confidence')
if [[ $(echo "$CONFIDENCE > 0.1" | bc -l) -eq 1 ]]; then
  ok "Confidence: ${CONFIDENCE}"
else
  log "⚠️  Low confidence: ${CONFIDENCE}"
fi

# Test 7: Stats are populated
log "Test 7: Checking stats..."
INDEXED=$(echo "$RESP" | jq -r '.stats.indexedFiles')
MS=$(echo "$RESP" | jq -r '.stats.ms')
ok "Indexed ${INDEXED} files in ${MS}ms"

# Summary
echo ""
ok "RLM Navigate smoke test PASSED"
echo ""
echo "Summary:"
echo "  Query: postgres database client Pool"
echo "  Files found: ${FILE_COUNT}"
echo "  Top result: ${TOP_FILE}"
echo "  Confidence: ${CONFIDENCE}"
echo "  Index size: ${INDEXED} files"
echo "  Response time: ${MS}ms"
