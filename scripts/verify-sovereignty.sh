#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA Sovereignty Verification Script
# ═══════════════════════════════════════════════════════════════════════════════
# Run this after deployment to verify MAIA is running sovereign (no cloud AI)
#
# Usage:
#   ./scripts/verify-sovereignty.sh staging.soullab.life
#   ./scripts/verify-sovereignty.sh www.soullab.life
#   ./scripts/verify-sovereignty.sh localhost:3000
# ═══════════════════════════════════════════════════════════════════════════════

set -e

DOMAIN="${1:-localhost:3000}"

# Determine protocol (assume https unless localhost)
if [[ "$DOMAIN" == localhost* ]]; then
    BASE_URL="http://$DOMAIN"
else
    BASE_URL="https://$DOMAIN"
fi

echo "═══════════════════════════════════════════════════════════════════════════"
echo "MAIA Sovereignty Verification"
echo "═══════════════════════════════════════════════════════════════════════════"
echo "Target: $BASE_URL"
echo ""

# ─────────────────────────────────────────────────────────────────────────────────
# 1. Health Check
# ─────────────────────────────────────────────────────────────────────────────────
echo "1️⃣  Health Check"
echo "   GET $BASE_URL/api/consciousness/health"

HEALTH=$(curl -s "$BASE_URL/api/consciousness/health" 2>&1)
if echo "$HEALTH" | jq -e '.status' > /dev/null 2>&1; then
    STATUS=$(echo "$HEALTH" | jq -r '.status')
    echo "   ✅ Status: $STATUS"
else
    echo "   ❌ Health endpoint failed or returned non-JSON"
    echo "   Response: $HEALTH"
    exit 1
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────────────
# 2. Provider Metadata Check (THE definitive sovereignty proof)
# ─────────────────────────────────────────────────────────────────────────────────
echo "2️⃣  Provider Metadata Check (requires MAIA_INCLUDE_PROVIDER_META=1)"
echo "   POST $BASE_URL/api/between/chat"

# Create temp file for request body
TMPFILE=$(mktemp)
echo '{"message":"sovereignty check","userId":"verify-script"}' > "$TMPFILE"

CHAT=$(curl -s "$BASE_URL/api/between/chat" \
    -H "Content-Type: application/json" \
    -d @"$TMPFILE" 2>&1)
rm -f "$TMPFILE"

# Check if provider metadata is present
PROVIDER=$(echo "$CHAT" | jq -r '.metadata.sovereignty.provider.provider // "NOT_EXPOSED"')
MODEL=$(echo "$CHAT" | jq -r '.metadata.sovereignty.provider.model // "NOT_EXPOSED"')
MODE=$(echo "$CHAT" | jq -r '.metadata.sovereignty.provider.mode // "NOT_EXPOSED"')

if [[ "$PROVIDER" == "NOT_EXPOSED" ]]; then
    echo "   ⚠️  Provider metadata not exposed"
    echo "   Set MAIA_INCLUDE_PROVIDER_META=1 to verify sovereignty"
    echo ""
    echo "   Response message: $(echo "$CHAT" | jq -r '.message // "ERROR"')"
else
    echo "   Provider: $PROVIDER"
    echo "   Model:    $MODEL"
    echo "   Mode:     $MODE"
    echo ""

    # Sovereignty verdict
    if [[ "$PROVIDER" == "ollama" ]] || [[ "$PROVIDER" == "consciousness_engine" ]] || [[ "$PROVIDER" == "multi_engine" ]]; then
        echo "   ✅ SOVEREIGN - Running on local AI ($PROVIDER/$MODEL)"
    elif [[ "$PROVIDER" == "anthropic" ]]; then
        echo "   ❌ NOT SOVEREIGN - Using Claude API (anthropic/$MODEL)"
    elif [[ "$PROVIDER" == "openai" ]]; then
        echo "   ❌ NOT SOVEREIGN - Using OpenAI API (openai/$MODEL)"
    else
        echo "   ⚠️  Unknown provider: $PROVIDER"
    fi
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────────────
# 3. Identity Trust Posture Check
# ─────────────────────────────────────────────────────────────────────────────────
echo "3️⃣  Identity Trust Posture"
echo "   Checking for dangerous dev-only flags..."

# We can't check env vars directly, but we can infer from behavior
# A properly secured prod won't trust body-supplied IDs

# Try with a known-bad userId pattern
TMPFILE=$(mktemp)
echo '{"message":"test","userId":"SHOULD_BE_IGNORED_IN_PROD"}' > "$TMPFILE"

TRUST_CHECK=$(curl -s "$BASE_URL/api/between/chat" \
    -H "Content-Type: application/json" \
    -d @"$TMPFILE" 2>&1)
rm -f "$TMPFILE"

# Check the session ID in response - if it contains our userId, trust is enabled
SESSION_ID=$(echo "$TRUST_CHECK" | jq -r '.session.id // "NONE"')

if [[ "$SESSION_ID" == *"SHOULD_BE_IGNORED"* ]]; then
    echo "   ❌ DANGER: Body userId is being trusted"
    echo "   MAIA_DEV_TRUST_BODY_ID is likely set to 1"
else
    echo "   ✅ Body userId is NOT trusted (correct for production)"
fi
echo ""

# ─────────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════════════════════"
echo "Verification Complete"
echo "═══════════════════════════════════════════════════════════════════════════"

if [[ "$PROVIDER" == "ollama" ]] || [[ "$PROVIDER" == "consciousness_engine" ]] || [[ "$PROVIDER" == "multi_engine" ]]; then
    echo "🔒 MAIA appears to be running SOVEREIGN on $DOMAIN"
elif [[ "$PROVIDER" == "NOT_EXPOSED" ]]; then
    echo "⚠️  Enable MAIA_INCLUDE_PROVIDER_META=1 for definitive check"
else
    echo "⚠️  MAIA may be using cloud AI providers on $DOMAIN"
fi
