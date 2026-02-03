#!/bin/bash
# Voice acceptance smoke test
# Run this before TestFlight uploads to verify TTS pipeline is working

set -e

API_URL="${1:-https://soullab.life}"
TIMEOUT=30

echo "🎤 Voice Smoke Test"
echo "==================="
echo "Target: $API_URL"
echo ""

# Test message
TEST_MESSAGE="Hello, this is a voice test."

echo "📡 Sending test message to stream-conversation..."

# Make request and capture SSE events
RESPONSE=$(curl -s --max-time $TIMEOUT \
  -X POST "$API_URL/api/voice/stream-conversation" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"$TEST_MESSAGE\",
    \"voice\": \"alloy\",
    \"speed\": 1.0,
    \"conversationHistory\": []
  }" 2>&1)

# Check for audio events
AUDIO_COUNT=$(echo "$RESPONSE" | grep -c "event: audio" || true)
COMPLETE_COUNT=$(echo "$RESPONSE" | grep -c "event: complete" || true)
TEXT_COUNT=$(echo "$RESPONSE" | grep -c "event: text" || true)

echo ""
echo "📊 Results:"
echo "  - text events:     $TEXT_COUNT"
echo "  - audio events:    $AUDIO_COUNT"
echo "  - complete events: $COMPLETE_COUNT"
echo ""

# Validate
FAILED=0

if [ "$TEXT_COUNT" -eq 0 ]; then
  echo "❌ FAIL: No text events received (LLM not responding)"
  FAILED=1
fi

if [ "$AUDIO_COUNT" -eq 0 ]; then
  echo "❌ FAIL: No audio events received (TTS pipeline broken)"
  FAILED=1
fi

if [ "$COMPLETE_COUNT" -eq 0 ]; then
  echo "❌ FAIL: No complete event received (stream didn't finish)"
  FAILED=1
fi

if [ "$FAILED" -eq 0 ]; then
  echo "✅ PASS: Voice pipeline is working!"
  echo ""
  echo "Safe to deploy to TestFlight."
  exit 0
else
  echo ""
  echo "🚫 Voice smoke test FAILED - do NOT deploy"
  exit 1
fi
