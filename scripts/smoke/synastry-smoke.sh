#!/usr/bin/env bash
#
# Synastry smoke test - validates cross-chart aspect calculation
#
# Usage:
#   ./scripts/smoke/synastry-smoke.sh [BASE_URL]
#
# Examples:
#   ./scripts/smoke/synastry-smoke.sh                    # Local
#   ./scripts/smoke/synastry-smoke.sh https://soullab.life
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

http_post_json() {
  local url="$1"
  local data="$2"
  curl -sS -X POST "${BASE_URL}${url}" \
    -H "Content-Type: application/json" \
    -d "$data"
}

log "Synastry smoke test starting…"
log "BASE_URL=${BASE_URL}"

# Test 1: Basic synastry with two raw birth charts
# Using classic example: Sun in Aries person meets Moon in Aries person
log "Test 1: Calculating synastry between two birth charts…"
SYNASTRY_JSON="$(http_post_json "/api/astrology/synastry" "$(jq -nc '{
  a: {
    birth: {
      date: "1990-04-15",
      time: "10:30",
      timezone: "America/New_York",
      lat: 40.7128,
      lng: -74.0060
    }
  },
  b: {
    birth: {
      date: "1988-07-22",
      time: "14:45",
      timezone: "America/Los_Angeles",
      lat: 34.0522,
      lng: -118.2437
    }
  },
  options: {
    maxAspects: 50
  }
}')")"

# Check success
if ! echo "$SYNASTRY_JSON" | jq -e '.success == true' >/dev/null 2>&1; then
  echo "Response: $SYNASTRY_JSON"
  no "Synastry calculation failed"
fi
ok "Synastry calculation succeeded"

# Check we got aspects
ASPECT_COUNT="$(echo "$SYNASTRY_JSON" | jq -r '.synastry.aspects | length')"
[[ "$ASPECT_COUNT" -gt 0 ]] || no "Expected aspects but got 0"
ok "Found ${ASPECT_COUNT} cross-chart aspects"

# Check highlights exist
HIGHLIGHT_COUNT="$(echo "$SYNASTRY_JSON" | jq -r '.synastry.highlights | length')"
[[ "$HIGHLIGHT_COUNT" -gt 0 ]] || no "Expected highlights but got 0"
ok "Found ${HIGHLIGHT_COUNT} highlighted aspects"

# Check scores exist
HARMONY="$(echo "$SYNASTRY_JSON" | jq -r '.synastry.scores.harmony')"
FRICTION="$(echo "$SYNASTRY_JSON" | jq -r '.synastry.scores.friction')"
[[ -n "$HARMONY" && "$HARMONY" != "null" ]] || no "Missing harmony score"
[[ -n "$FRICTION" && "$FRICTION" != "null" ]] || no "Missing friction score"
ok "Scores present: harmony=${HARMONY}, friction=${FRICTION}"

# Check chart summaries
SUN_A="$(echo "$SYNASTRY_JSON" | jq -r '.chartA.sunSign')"
SUN_B="$(echo "$SYNASTRY_JSON" | jq -r '.chartB.sunSign')"
[[ -n "$SUN_A" && "$SUN_A" != "null" ]] || no "Missing chartA sun sign"
[[ -n "$SUN_B" && "$SUN_B" != "null" ]] || no "Missing chartB sun sign"
ok "Chart A: Sun in ${SUN_A}, Chart B: Sun in ${SUN_B}"

# Test 2: Minimal request (no time)
log "Test 2: Synastry with missing birth times (uses noon default)…"
MINIMAL_JSON="$(http_post_json "/api/astrology/synastry" "$(jq -nc '{
  a: { birth: { date: "1985-03-21" } },
  b: { birth: { date: "1987-09-15" } }
}')")"

if ! echo "$MINIMAL_JSON" | jq -e '.success == true' >/dev/null 2>&1; then
  echo "Response: $MINIMAL_JSON"
  no "Minimal synastry failed"
fi

MINIMAL_ASPECTS="$(echo "$MINIMAL_JSON" | jq -r '.synastry.aspects | length')"
[[ "$MINIMAL_ASPECTS" -gt 0 ]] || no "Expected aspects from minimal request"
ok "Minimal request succeeded with ${MINIMAL_ASPECTS} aspects"

# Test 3: Error case - missing required field
log "Test 3: Error handling for invalid request…"
ERROR_JSON="$(http_post_json "/api/astrology/synastry" '{"a":{}}')"
if echo "$ERROR_JSON" | jq -e '.success == false' >/dev/null 2>&1; then
  ok "Correctly rejected invalid request"
else
  no "Should have rejected invalid request"
fi

# Test 4: Verify aspect structure
log "Test 4: Validating aspect structure…"
FIRST_ASPECT="$(echo "$SYNASTRY_JSON" | jq -r '.synastry.aspects[0]')"
ABODY="$(echo "$SYNASTRY_JSON" | jq -r '.synastry.aspects[0].aBody')"
BBODY="$(echo "$SYNASTRY_JSON" | jq -r '.synastry.aspects[0].bBody')"
ASPECT_TYPE="$(echo "$SYNASTRY_JSON" | jq -r '.synastry.aspects[0].aspect')"
STRENGTH="$(echo "$SYNASTRY_JSON" | jq -r '.synastry.aspects[0].strength')"

[[ -n "$ABODY" && "$ABODY" != "null" ]] || no "Aspect missing aBody"
[[ -n "$BBODY" && "$BBODY" != "null" ]] || no "Aspect missing bBody"
[[ -n "$ASPECT_TYPE" && "$ASPECT_TYPE" != "null" ]] || no "Aspect missing aspect type"
[[ -n "$STRENGTH" && "$STRENGTH" != "null" ]] || no "Aspect missing strength"
ok "Aspect structure is valid"

# Print sample aspect for visibility
log "Sample aspect: ${ABODY} ${ASPECT_TYPE} ${BBODY} (strength: ${STRENGTH})"

ok "Synastry smoke test PASSED ✅"
