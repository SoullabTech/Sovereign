#!/bin/bash

echo "🎤 Testing Voice-to-Chat Pipeline for Sesame/Maya Integration"
echo "============================================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if Maya Chat API is responding
echo -e "\n${YELLOW}Test 1: Maya Chat API (Text Only)${NC}"
curl -s -X POST http://localhost:3000/api/maya-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, I am testing the voice pipeline",
    "enableVoice": false,
    "userId": "test-user"
  }' | jq '.' || echo -e "${RED}Failed to connect to Maya Chat API${NC}"

# Test 2: Check if Maya Chat API returns voice URL
echo -e "\n${YELLOW}Test 2: Maya Chat API with Voice${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/maya-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about finding inner peace",
    "enableVoice": true,
    "userId": "test-user"
  }')

echo "$RESPONSE" | jq '.' || echo -e "${RED}Failed to get response${NC}"

# Check if audioUrl is present
if echo "$RESPONSE" | jq -e '.audioUrl' > /dev/null; then
  echo -e "${GREEN}✓ Audio URL returned successfully${NC}"
else
  echo -e "${YELLOW}⚠ No audio URL in response (Sesame might be offline)${NC}"
fi

# Test 3: Check Oracle backend directly
echo -e "\n${YELLOW}Test 3: Oracle Backend Direct${NC}"
curl -s -X POST http://localhost:3003/api/v1/converse/message \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "userText": "Testing direct oracle connection",
    "element": "aether"
  }' | jq '.' || echo -e "${YELLOW}Oracle backend not available (port 3003)${NC}"

# Test 4: Check Sesame TTS directly
echo -e "\n${YELLOW}Test 4: Sesame TTS Service Direct${NC}"
curl -s -X POST http://localhost:3004/api/v1/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is a test of the text to speech system",
    "voice": "nova",
    "speed": 1.0
  }' | jq '.' || echo -e "${YELLOW}Sesame TTS not available (port 3004)${NC}"

echo -e "\n${GREEN}============================================================${NC}"
echo "Pipeline Test Complete!"
echo ""
echo "Expected flow:"
echo "1. User speaks → HybridVoiceInput detects speech"
echo "2. Speech stops → Auto-sends to Maya Chat API"
echo "3. Maya Chat API → Oracle Backend (3003) for response"
echo "4. Maya Chat API → Sesame TTS (3004) for voice"
echo "5. Response with audioUrl → Played to user"
echo ""
echo "To test the full voice flow:"
echo "1. Start the backend: cd backend && npm run dev (port 3003)"
echo "2. Start Sesame: cd backend && npm run sesame (port 3004)"
echo "3. Start the web app: cd apps/web && npm run dev (port 3000)"
echo "4. Open http://localhost:3000 and click the microphone button"