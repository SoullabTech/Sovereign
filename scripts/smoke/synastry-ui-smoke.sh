#!/usr/bin/env bash
#
# Synastry UI smoke test - validates the viewer page renders
#
# Usage:
#   ./scripts/smoke/synastry-ui-smoke.sh [BASE_URL]
#
# Examples:
#   ./scripts/smoke/synastry-ui-smoke.sh                    # Local
#   ./scripts/smoke/synastry-ui-smoke.sh https://soullab.life
#
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"

need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Missing dependency: $1"; exit 1; }; }
need curl
need jq

ts() { date +"%H:%M:%S"; }
log() { echo "[$(ts)] $*"; }
ok()  { echo "✅ $*"; }
no()  { echo "❌ $*"; exit 1; }

log "Synastry UI smoke test starting…"
log "BASE_URL=${BASE_URL}"

# Step 1: Create a persisted synastry analysis
log "Creating persisted synastry analysis…"
CREATE_JSON="$(curl -sS -X POST "${BASE_URL}/api/astrology/synastry" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc '{
    a: { birth: { date: "1990-04-15", time: "10:30" } },
    b: { birth: { date: "1988-07-22", time: "14:45" } },
    persist: true
  }')")"

if ! echo "$CREATE_JSON" | jq -e '.success == true' >/dev/null 2>&1; then
  echo "Response: $CREATE_JSON"
  no "Failed to create synastry analysis"
fi

ANALYSIS_ID="$(echo "$CREATE_JSON" | jq -r '.analysisId')"
[[ -n "$ANALYSIS_ID" && "$ANALYSIS_ID" != "null" ]] || no "Missing analysisId"
ok "Created analysis: ${ANALYSIS_ID}"

# Step 2: Fetch the UI page
log "Fetching UI page /astrology/synastry/${ANALYSIS_ID}…"
UI_RESPONSE="$(curl -sS -w "\n%{http_code}" "${BASE_URL}/astrology/synastry/${ANALYSIS_ID}")"
HTTP_CODE="$(echo "$UI_RESPONSE" | tail -1)"
HTML_BODY="$(echo "$UI_RESPONSE" | sed '$d')"

[[ "$HTTP_CODE" == "200" ]] || no "Expected 200, got ${HTTP_CODE}"
ok "UI page returned 200"

# Step 3: Verify key content is present
log "Verifying page content…"

# Check for analysis ID in page
if echo "$HTML_BODY" | grep -q "$ANALYSIS_ID"; then
  ok "Page contains analysis ID"
else
  log "Warning: Analysis ID not found in page (may be truncated)"
fi

# Check for synastry-related content
if echo "$HTML_BODY" | grep -qi "synastry\|Person A\|Person B\|Harmony\|Friction"; then
  ok "Page contains synastry content"
else
  no "Page missing expected synastry content"
fi

# Check for chart data (sun signs)
if echo "$HTML_BODY" | grep -qi "Sun in\|sunSign\|Aries\|Taurus\|Gemini\|Cancer\|Leo\|Virgo\|Libra\|Scorpio\|Sagittarius\|Capricorn\|Aquarius\|Pisces"; then
  ok "Page contains chart/sign data"
else
  log "Warning: No zodiac signs found (may be client-rendered)"
fi

ok "Synastry UI smoke test PASSED ✅"
