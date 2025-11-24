#!/bin/bash
# 🔍 HuggingFace Token Validator
# Checks if your HF token is valid and has inference permissions

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "═══════════════════════════════════════════════════"
echo -e "   🔍 ${BLUE}HuggingFace Token Validator${NC}"
echo "═══════════════════════════════════════════════════"
echo ""

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

# Load .env.local if it exists
if [ -f ".env.local" ]; then
    echo "📄 Loading environment from .env.local..."
    set -o allexport
    source .env.local 2>/dev/null || true
    set +o allexport
else
    echo -e "${YELLOW}⚠️  No .env.local found${NC}"
fi

# Check for HuggingFace token
HF_TOKEN="${SESAME_FALLBACK_API_KEY:-$SESAME_API_KEY}"

if [ -z "$HF_TOKEN" ]; then
    echo -e "${RED}❌ No HuggingFace token found${NC}"
    echo "   Expected: SESAME_FALLBACK_API_KEY or SESAME_API_KEY in .env.local"
    echo ""
    echo "   To fix this:"
    echo "   1. Get token from https://huggingface.co/settings/tokens"
    echo "   2. Add to .env.local: SESAME_FALLBACK_API_KEY=hf_your_token_here"
    exit 1
fi

# Validate token format
if [[ ! "$HF_TOKEN" =~ ^hf_ ]]; then
    echo -e "${YELLOW}⚠️  Token doesn't start with 'hf_' - this may not be a HuggingFace token${NC}"
fi

echo "🔍 Validating HuggingFace token..."
echo "   Token: ${HF_TOKEN:0:10}...${HF_TOKEN: -4}"
echo ""

# Check token validity
RESPONSE=$(curl -s -H "Authorization: Bearer $HF_TOKEN" https://huggingface.co/api/whoami-v2 2>/dev/null || echo '{"error":"request_failed"}')

if echo "$RESPONSE" | grep -q '"type":"user"'; then
    echo -e "${GREEN}✅ Token is valid!${NC}"
    
    # Extract user info
    if command -v jq >/dev/null 2>&1; then
        USERNAME=$(echo "$RESPONSE" | jq -r '.name // "unknown"')
        USER_ID=$(echo "$RESPONSE" | jq -r '.id // "unknown"')
        ORGS=$(echo "$RESPONSE" | jq -r '.orgs // [] | length')
        echo "   Username: $USERNAME"
        echo "   User ID: $USER_ID"
        echo "   Organizations: $ORGS"
    else
        echo "   Install 'jq' for detailed user info"
    fi
else
    echo -e "${RED}❌ Invalid or unauthorized token!${NC}"
    echo "   Response: $RESPONSE"
    echo ""
    echo "   Common issues:"
    echo "   - Token expired or revoked"
    echo "   - Missing 'Inference Provider' permissions"
    echo "   - Network connectivity issues"
    exit 1
fi

echo ""

# Check model access
MODEL_URL="${SESAME_FALLBACK_URL:-https://api-inference.huggingface.co/models/facebook/blenderbot-1B-distill}"
echo "🔍 Testing model access..."
echo "   Model: $MODEL_URL"

# Test with a minimal request
MODEL_RESPONSE=$(curl -s \
    -H "Authorization: Bearer $HF_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"inputs":"test","options":{"wait_for_model":false,"use_cache":true}}' \
    "$MODEL_URL" 2>/dev/null || echo '{"error":"request_failed"}')

if echo "$MODEL_RESPONSE" | grep -q '"error"'; then
    ERROR_TYPE=$(echo "$MODEL_RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$ERROR_TYPE" = "Model facebook/blenderbot-1B-distill is currently loading" ] || \
       echo "$MODEL_RESPONSE" | grep -q "currently loading"; then
        echo -e "${YELLOW}⚠️  Model is loading (this is normal)${NC}"
        echo "   Status: Model available but needs warm-up"
    elif [ "$ERROR_TYPE" = "Authorization header is required" ]; then
        echo -e "${RED}❌ Authorization failed${NC}"
        echo "   Issue: Token not accepted by inference API"
    else
        echo -e "${YELLOW}⚠️  Model access issue:${NC}"
        if command -v jq >/dev/null 2>&1; then
            echo "$MODEL_RESPONSE" | jq .
        else
            echo "$MODEL_RESPONSE"
        fi
    fi
else
    echo -e "${GREEN}✅ Model access OK!${NC}"
    echo "   Model is ready for inference"
fi

echo ""

# Check inference permissions
echo "🔍 Checking inference permissions..."
PERMISSIONS_RESPONSE=$(curl -s -H "Authorization: Bearer $HF_TOKEN" https://huggingface.co/api/token 2>/dev/null || echo '{"error":"request_failed"}')

if echo "$PERMISSIONS_RESPONSE" | grep -q '"role":"read"'; then
    echo -e "${GREEN}✅ Read permissions confirmed${NC}"
    
    if echo "$PERMISSIONS_RESPONSE" | grep -q '"canPay":true\|"isPaying":true'; then
        echo -e "${GREEN}✅ Inference API access available${NC}"
    else
        echo -e "${YELLOW}⚠️  Limited inference access (free tier)${NC}"
        echo "   Note: May have rate limits or slower response times"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot verify permissions${NC}"
    echo "   Token may still work for inference"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo -e "   🎯 ${GREEN}Token Validation Complete${NC}"
echo "═══════════════════════════════════════════════════"
echo ""

# Final recommendations
if echo "$RESPONSE" | grep -q '"type":"user"' && ! echo "$MODEL_RESPONSE" | grep -q '"error"'; then
    echo -e "${GREEN}🎉 All checks passed! Your HuggingFace integration is ready.${NC}"
    echo ""
    echo "   Next steps:"
    echo "   - Start Maya with: ${YELLOW}./scripts/start-beta.sh${NC}"
    echo "   - HuggingFace will be used as secondary voice fallback"
    echo "   - Monitor usage at: https://huggingface.co/settings/billing"
else
    echo -e "${YELLOW}⚠️  Some issues detected, but basic functionality may still work.${NC}"
    echo ""
    echo "   To improve reliability:"
    echo "   1. Check token permissions at https://huggingface.co/settings/tokens"
    echo "   2. Ensure 'Inference Provider' scope is enabled"
    echo "   3. Verify billing/quota at https://huggingface.co/settings/billing"
fi

echo ""