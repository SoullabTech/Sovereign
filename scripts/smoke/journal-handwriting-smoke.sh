#!/usr/bin/env bash
#
# Journal Handwriting OCR smoke test
#
# Validates that handwriting journal entries can be created via API
# with OCR metadata (source, provider, confidence).
#
# Usage:
#   ./scripts/smoke/journal-handwriting-smoke.sh [BASE_URL]
#
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
TEST_USER="handwriting-smoke-$(date +%s)"

need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Missing dependency: $1"; exit 1; }; }
need curl
need jq

ts() { date +"%H:%M:%S"; }
log() { echo "[$(ts)] $*"; }
ok()  { echo "✅ $*"; }
no()  { echo "❌ $*"; exit 1; }

log "Journal Handwriting smoke test starting…"
log "BASE_URL=${BASE_URL}"
log "TEST_USER=${TEST_USER}"

# Test 1: Create handwriting entry with OCR metadata
log "Test 1: Creating handwriting entry with OCR metadata…"
CREATE_JSON="$(curl -sS -X POST "${BASE_URL}/api/journal/quick" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc --arg userId "$TEST_USER" '{
    userId: $userId,
    entryType: "handwriting",
    content: "This is a test of handwritten journal text.\nExtracted via Vision OCR.\n\nMultiple paragraphs preserved.",
    tags: ["handwriting", "ocr", "smoke_test"],
    source: "handwriting_ocr",
    meta: {
      ocrProvider: "ios_vision",
      ocrConfidence: 0.92,
      hasImage: true,
      imageSize: 245678
    }
  }')")"

if ! echo "$CREATE_JSON" | jq -e '.success == true' >/dev/null 2>&1; then
  echo "Response: $CREATE_JSON"
  no "Failed to create handwriting entry"
fi

ENTRY_ID="$(echo "$CREATE_JSON" | jq -r '.entryId')"
[[ -n "$ENTRY_ID" && "$ENTRY_ID" != "null" ]] || no "Missing entryId"
ok "Created handwriting entry: ${ENTRY_ID}"

# Test 2: Create handwriting entry with manual paste (no OCR)
log "Test 2: Creating handwriting entry with manual paste…"
PASTE_JSON="$(curl -sS -X POST "${BASE_URL}/api/journal/quick" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc --arg userId "$TEST_USER" '{
    userId: $userId,
    entryType: "handwriting",
    content: "Manually pasted text from Live Text extraction.",
    tags: ["handwriting", "manual"],
    source: "handwriting_paste",
    meta: {
      ocrProvider: "manual_paste",
      hasImage: true
    }
  }')")"

if ! echo "$PASTE_JSON" | jq -e '.success == true' >/dev/null 2>&1; then
  echo "Response: $PASTE_JSON"
  no "Failed to create manual paste entry"
fi
ok "Created manual paste entry"

# Test 3: Retrieve handwriting entries
log "Test 3: Retrieving handwriting entries…"
GET_JSON="$(curl -sS "${BASE_URL}/api/journal/quick?userId=${TEST_USER}&type=handwriting")"

if ! echo "$GET_JSON" | jq -e '.success == true' >/dev/null 2>&1; then
  echo "Response: $GET_JSON"
  no "Failed to retrieve entries"
fi

ENTRY_COUNT="$(echo "$GET_JSON" | jq -r '.count')"
[[ "$ENTRY_COUNT" -ge 2 ]] || no "Expected at least 2 entries, got ${ENTRY_COUNT}"
ok "Retrieved ${ENTRY_COUNT} handwriting entries"

# Test 4: Verify OCR metadata is stored
log "Test 4: Verifying OCR metadata in retrieved entries…"
FIRST_ENTRY="$(echo "$GET_JSON" | jq '.entries[0]')"
SOURCE="$(echo "$FIRST_ENTRY" | jq -r '.source')"
[[ "$SOURCE" == "handwriting_ocr" || "$SOURCE" == "handwriting_paste" ]] || no "Unexpected source: ${SOURCE}"
ok "Source field correctly stored: ${SOURCE}"

# Test 5: Verify entry_type is 'handwriting'
ENTRY_TYPE="$(echo "$FIRST_ENTRY" | jq -r '.entry_type')"
[[ "$ENTRY_TYPE" == "handwriting" ]] || no "Expected entry_type=handwriting, got ${ENTRY_TYPE}"
ok "Entry type correctly stored: ${ENTRY_TYPE}"

# Test 6: Error case - invalid entry type
log "Test 6: Verifying invalid entry type is rejected…"
ERROR_JSON="$(curl -sS -X POST "${BASE_URL}/api/journal/quick" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc --arg userId "$TEST_USER" '{
    userId: $userId,
    entryType: "invalid_type",
    content: "This should fail"
  }')")"

if echo "$ERROR_JSON" | jq -e '.success == false' >/dev/null 2>&1; then
  ok "Correctly rejected invalid entry type"
else
  no "Should have rejected invalid entry type"
fi

ok "Journal Handwriting smoke test PASSED ✅"
