#!/bin/bash
# 🌀 Spiralogic Oracle System - Sesame API Test
# Tests HuggingFace Sesame (CSM) or fallback model

set -e

# Load .env.local if available
if [ -f "../.env.local" ]; then
  export $(grep -v '^#' ../.env.local | xargs)
fi

if [ -z "$SESAME_URL" ] || [ -z "$SESAME_API_KEY" ]; then
  echo "❌ Missing SESAME_URL or SESAME_API_KEY in .env.local"
  exit 1
fi

echo "🔍 Testing Sesame at $SESAME_URL ..."

RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $SESAME_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"inputs":"Hello Sesame, are you online?"}' \
  "$SESAME_URL")

echo "📡 Response:"
echo "$RESPONSE" | jq .

