#!/bin/bash
# 🌀 Simple Sesame API Test
# Tests HuggingFace conversational AI integration

# Load environment variables
if [ -f "../.env.local" ]; then
  export $(grep -v '^#' ../.env.local | xargs)
fi

# Check requirements
if [ -z "$SESAME_API_KEY" ]; then
  echo "❌ Missing SESAME_API_KEY in .env.local"
  echo "Get your API key from: https://huggingface.co/settings/tokens"
  exit 1
fi

# Default to a known working model if SESAME_URL not set
: ${SESAME_URL:="https://api-inference.huggingface.co/models/gpt2"}

echo "🔍 Testing Sesame..."
echo "URL: $SESAME_URL"
echo "Key: ${SESAME_API_KEY:0:10}..."
echo ""

# Make the API call
curl -X POST "$SESAME_URL" \
  -H "Authorization: Bearer $SESAME_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "The meaning of life is"}' \
  2>/dev/null | jq . || echo "❌ Failed to connect"