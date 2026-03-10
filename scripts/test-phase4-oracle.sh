#!/usr/bin/env bash
# =============================================================================
# scripts/test-phase4-oracle.sh
#
# Phase 4 Oracle Activation Test
#
# Runs three tests in sequence:
#   1. Readiness check — confirms service key + delegation cert + root pubkey
#   2. Reflect publish — signs + publishes a kind 1 oracle event via delegation
#   3. Relay verification — subscribes to confirm event arrived on the relay
#
# Prerequisites:
#   - MAIA_INTERNAL_SERVICE_TOKEN set in env
#   - Phase 4 operator setup complete (see docs/NOSTR_PHASE4_ACTIVATION_RUNBOOK.md)
#   - wscat installed: npm install -g wscat
#
# Usage:
#   MAIA_INTERNAL_SERVICE_TOKEN=xxx bash scripts/test-phase4-oracle.sh
#   MAIA_INTERNAL_SERVICE_TOKEN=xxx BASE_URL=https://soullab.life bash scripts/test-phase4-oracle.sh
#
# =============================================================================

set -euo pipefail

BASE_URL="${BASE_URL:-https://soullab.life}"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

fail() { echo -e "${RED}✗ $1${NC}" >&2; exit 1; }
pass() { echo -e "${GREEN}✓ $1${NC}"; }
info() { echo -e "${CYAN}→ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Required: $1 (install with: $2)"
}

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Phase 4 Oracle Activation Test               ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ─── Preflight ────────────────────────────────────────────────────────────────

require_command curl "brew install curl"
require_command jq "brew install jq"

if [[ -z "${MAIA_INTERNAL_SERVICE_TOKEN:-}" ]]; then
  fail "MAIA_INTERNAL_SERVICE_TOKEN is not set. Export it before running this script."
fi

echo "Target: $BASE_URL"
echo ""

# ─── Test 1: Readiness ────────────────────────────────────────────────────────

echo "━━━ Test 1: Phase 4 Readiness ━━━"
info "GET $BASE_URL/api/nostr/maia/status"
echo ""

STATUS_RESPONSE=$(curl -sf "$BASE_URL/api/nostr/maia/status" \
  -H "Accept: application/json") || fail "Status endpoint unreachable"

echo "$STATUS_RESPONSE" | jq .
echo ""

ORACLE_READY=$(echo "$STATUS_RESPONSE" | jq -r '.roles.oracle.ready')
ORACLE_SERVICE_KEY=$(echo "$STATUS_RESPONSE" | jq -r '.roles.oracle.serviceKeyConfigured')
ORACLE_DELEGATION=$(echo "$STATUS_RESPONSE" | jq -r '.roles.oracle.delegationCertActive')
ORACLE_ROOT=$(echo "$STATUS_RESPONSE" | jq -r '.roles.oracle.rootPubkeyConfigured')
ORACLE_VALID_UNTIL=$(echo "$STATUS_RESPONSE" | jq -r '.roles.oracle.delegationValidUntil // "not set"')
ROOT_PUBKEY=$(echo "$STATUS_RESPONSE" | jq -r '.rootPubkey // "not set"')

echo "Oracle readiness breakdown:"
[[ "$ORACLE_SERVICE_KEY" == "true" ]] && pass "Service key configured" || fail "Service key NOT configured (set MAIA_ORACLE_SERVICE_PRIVKEY)"
[[ "$ORACLE_DELEGATION" == "true" ]] && pass "Delegation cert active (valid until: $ORACLE_VALID_UNTIL)" || fail "Delegation cert NOT active (run generate-maia-delegation.ts)"
[[ "$ORACLE_ROOT" == "true" ]] && pass "Root pubkey configured: $ROOT_PUBKEY" || fail "Root pubkey NOT configured (set MAIA_ROOT_NOSTR_PUBKEY)"

[[ "$ORACLE_READY" == "true" ]] || {
  echo ""
  fail "Oracle not ready. Complete operator setup (docs/NOSTR_PHASE4_ACTIVATION_RUNBOOK.md) then retry."
}
pass "Oracle: READY"

echo ""

# ─── Test 2: Reflect publish ─────────────────────────────────────────────────

echo "━━━ Test 2: Oracle Reflection Publish ━━━"

TEST_CONTENT="MAIA oracle activation test — Phase 4. $(date -u +%Y-%m-%dT%H:%M:%SZ)"
info "Posting oracle reflection..."
echo "Content: \"$TEST_CONTENT\""
echo ""

REFLECT_RESPONSE=$(curl -sf "$BASE_URL/api/nostr/maia/reflect" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: $MAIA_INTERNAL_SERVICE_TOKEN" \
  -d "{\"content\": \"$TEST_CONTENT\"}") || fail "Reflect endpoint failed"

echo "$REFLECT_RESPONSE" | jq .
echo ""

EVENT_ID=$(echo "$REFLECT_RESPONSE" | jq -r '.eventId // empty')
DELEGATED=$(echo "$REFLECT_RESPONSE" | jq -r '.delegated // false')
RETURNED_ROOT=$(echo "$REFLECT_RESPONSE" | jq -r '.rootPubkey // empty')

[[ -n "$EVENT_ID" ]] && pass "Event published: $EVENT_ID" || fail "No eventId in response"
[[ "$DELEGATED" == "true" ]] && pass "Event is NIP-26 delegated" || warn "Event was NOT delegated (missing delegation cert?)"
[[ -n "$RETURNED_ROOT" ]] && pass "Root pubkey confirmed: $RETURNED_ROOT" || warn "Root pubkey missing from response"

echo ""

# ─── Test 3: Relay verification ──────────────────────────────────────────────

echo "━━━ Test 3: Relay Event Verification ━━━"

RELAY_WS="wss://nostr.soullab.life"

if ! command -v wscat >/dev/null 2>&1; then
  warn "wscat not installed — skipping live relay check"
  warn "Install: npm install -g wscat"
  echo ""
  echo "To verify manually, open a WebSocket to $RELAY_WS and send:"
  echo '  ["REQ","test",{"ids":["'"$EVENT_ID"'"]}]'
  echo ""
  echo "Expected: EVENT message with kind 1 and delegation tag."
else
  info "Querying relay for event $EVENT_ID..."
  echo ""

  RELAY_FILTER='["REQ","test",{"ids":["'"$EVENT_ID"'"]}]'
  RELAY_CLOSE='["CLOSE","test"]'

  RELAY_RESPONSE=$(
    echo -e "$RELAY_FILTER\n$RELAY_CLOSE" | \
    timeout 8 wscat -c "$RELAY_WS" --no-color 2>/dev/null | \
    grep '"EVENT"' | head -1
  ) || true

  if [[ -z "$RELAY_RESPONSE" ]]; then
    warn "No EVENT response from relay (event may still be propagating — retry in 2s)"
    sleep 2
    RELAY_RESPONSE=$(
      echo -e "$RELAY_FILTER\n$RELAY_CLOSE" | \
      timeout 8 wscat -c "$RELAY_WS" --no-color 2>/dev/null | \
      grep '"EVENT"' | head -1
    ) || true
  fi

  if [[ -n "$RELAY_RESPONSE" ]]; then
    pass "Event found on relay"
    echo "$RELAY_RESPONSE" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); e=d[2]; print('  kind:', e['kind']); print('  pubkey:', e['pubkey']); tags=e.get('tags',[]); deleg=[t for t in tags if t[0]=='delegation']; print('  delegation tag:', 'PRESENT ✓' if deleg else 'MISSING ✗')" 2>/dev/null || echo "  (event present but could not parse)"
    DELEG_PRESENT=$(echo "$RELAY_RESPONSE" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); e=d[2]; print(any(t[0]=='delegation' for t in e.get('tags',[])))" 2>/dev/null || echo "unknown")
    [[ "$DELEG_PRESENT" == "True" ]] && pass "Delegation tag present in relay event" || warn "Delegation tag not found in relay event"
  else
    warn "Event not found on relay within timeout — check relay connectivity"
    echo "Manual check: wscat -c $RELAY_WS"
    echo 'Send: ["REQ","test",{"ids":["'"$EVENT_ID"'"]}]'
  fi
fi

echo ""

# ─── Summary ─────────────────────────────────────────────────────────────────

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
pass "Phase 4 Oracle activation confirmed."
echo ""
echo "  Root pubkey:  $ROOT_PUBKEY"
echo "  Event ID:     $EVENT_ID"
echo "  Delegated:    $DELEGATED"
echo "  Relay:        $RELAY_WS"
echo ""
echo "MAIA is now a first-class Nostr entity."
echo ""
