#!/bin/bash

# Quick Anthropic API Key Validator
# Usage: ./test-claude-key.sh [optional-api-key]
# If no key provided, reads from .env file

set -e

echo "🔑 Anthropic API Key Validator"
echo "=============================="

# Get API key from parameter or .env
if [ -n "$1" ]; then
    API_KEY="$1"
    echo "📝 Testing provided key: ${API_KEY:0:20}...${API_KEY: -10}"
else
    # Load from .env file
    if [ -f ".env" ]; then
        source .env
        API_KEY="$ANTHROPIC_API_KEY"
        echo "📂 Testing key from .env: ${API_KEY:0:20}...${API_KEY: -10}"
    else
        echo "❌ No .env file found and no key provided"
        echo "Usage: ./test-claude-key.sh [api-key]"
        exit 1
    fi
fi

if [ -z "$API_KEY" ]; then
    echo "❌ No Anthropic API key found"
    echo "Usage: ./test-claude-key.sh [api-key]"
    exit 1
fi

echo "🔍 Key length: ${#API_KEY} characters"

# Test the API key with a minimal request
echo "📡 Testing connection to Claude..."

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "https://api.anthropic.com/v1/messages" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 10,
    "messages": [
      {
        "role": "user", 
        "content": "Say OK"
      }
    ]
  }')

# Extract HTTP status
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

case $HTTP_STATUS in
    200)
        echo "✅ API Key VALID - Claude is responding!"
        echo "🎯 Response: $(echo "$BODY" | jq -r '.content[0].text' 2>/dev/null || echo 'OK')"
        echo "📊 Usage: $(echo "$BODY" | jq -r '.usage' 2>/dev/null || echo 'Available')"
        echo ""
        echo "🚀 Ready to restart Maya backend with this key!"
        exit 0
        ;;
    401)
        echo "❌ API Key INVALID"
        echo "🔍 Error: $(echo "$BODY" | jq -r '.error.message' 2>/dev/null || echo 'Authentication failed')"
        echo "💡 Check if key is expired, revoked, or has wrong format"
        exit 1
        ;;
    429)
        echo "⚠️  API Key VALID but QUOTA EXCEEDED"
        echo "🔍 Error: $(echo "$BODY" | jq -r '.error.message' 2>/dev/null || echo 'Rate limit or quota exceeded')"
        echo "💳 Check Anthropic dashboard for billing/limits"
        exit 1
        ;;
    403)
        echo "⚠️  API Key VALID but ACCESS DENIED"
        echo "🔍 Error: $(echo "$BODY" | jq -r '.error.message' 2>/dev/null || echo 'Insufficient permissions')"
        echo "🔐 Key may be restricted to certain models or features"
        exit 1
        ;;
    *)
        echo "❓ Unexpected response (HTTP $HTTP_STATUS)"
        echo "📄 Body: $BODY"
        exit 1
        ;;
esac