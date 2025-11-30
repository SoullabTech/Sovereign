#!/bin/bash
# 🌀 Test alternative Sesame/TTS endpoints
# Checks multiple possible configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load .env.local if available
if [ -f "../.env.local" ]; then
  export $(grep -v '^#' ../.env.local | xargs)
fi

echo "🔍 Testing various Sesame/TTS configurations..."
echo ""

# Test 1: HuggingFace sesame/csm-1b
echo "1️⃣ Testing HuggingFace sesame/csm-1b..."
if [ -n "$SESAME_API_KEY" ]; then
  RESPONSE=$(curl -s -w '\nHTTP_CODE:%{http_code}' \
    -X POST "https://api-inference.huggingface.co/models/sesame/csm-1b" \
    -H "Authorization: Bearer $SESAME_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"inputs":"Hello"}' 2>/dev/null || echo "FAILED")
  
  HTTP_CODE=$(echo "$RESPONSE" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
  echo "   Status: HTTP $HTTP_CODE"
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "   ${GREEN}✅ Model accessible${NC}"
  else
    echo -e "   ${RED}❌ Model not accessible${NC}"
    echo "   Response: $(echo "$RESPONSE" | head -n -1)"
  fi
else
  echo -e "   ${YELLOW}⚠️ No SESAME_API_KEY found${NC}"
fi

echo ""

# Test 2: Alternative TTS models
echo "2️⃣ Testing alternative TTS models..."
MODELS=("facebook/fastspeech2-en-ljspeech" "espnet/kan-bayashi_ljspeech_vits" "microsoft/speecht5_tts")

for MODEL in "${MODELS[@]}"; do
  echo -n "   Testing $MODEL: "
  if [ -n "$SESAME_API_KEY" ]; then
    HTTP_CODE=$(curl -s -w '%{http_code}' -o /dev/null \
      -X POST "https://api-inference.huggingface.co/models/$MODEL" \
      -H "Authorization: Bearer $SESAME_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"inputs":"Hello"}' 2>/dev/null)
    
    if [ "$HTTP_CODE" = "200" ]; then
      echo -e "${GREEN}✅ Available${NC}"
    else
      echo -e "${RED}❌ HTTP $HTTP_CODE${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️ No API key${NC}"
  fi
done

echo ""

# Test 3: Northflank endpoint if configured
echo "3️⃣ Testing Northflank CSM endpoint..."
if [ -n "$NORTHFLANK_SESAME_URL" ]; then
  echo "   URL: $NORTHFLANK_SESAME_URL"
  
  # Test health endpoint
  echo -n "   Health check: "
  HEALTH=$(curl -s -w 'HTTP_CODE:%{http_code}' "$NORTHFLANK_SESAME_URL/health" 2>/dev/null || echo "FAILED")
  HEALTH_CODE=$(echo "$HEALTH" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
  
  if [ "$HEALTH_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Service healthy${NC}"
    
    # Test TTS endpoint
    echo -n "   TTS endpoint: "
    TTS_CODE=$(curl -s -w '%{http_code}' -o /dev/null \
      -X POST "$NORTHFLANK_SESAME_URL/tts" \
      -H "Authorization: Bearer ${NORTHFLANK_SESAME_API_KEY:-$SESAME_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '{"text":"Test","voice":"maya"}' 2>/dev/null)
    
    if [ "$TTS_CODE" = "200" ]; then
      echo -e "${GREEN}✅ TTS working${NC}"
    else
      echo -e "${RED}❌ HTTP $TTS_CODE${NC}"
    fi
  else
    echo -e "${RED}❌ HTTP $HEALTH_CODE${NC}"
  fi
else
  echo -e "   ${YELLOW}⚠️ NORTHFLANK_SESAME_URL not configured${NC}"
fi

echo ""

# Test 4: ElevenLabs fallback
echo "4️⃣ Testing ElevenLabs fallback..."
if [ -n "$ELEVENLABS_API_KEY" ]; then
  VOICES=$(curl -s -w '\nHTTP_CODE:%{http_code}' \
    "https://api.elevenlabs.io/v1/voices" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" 2>/dev/null || echo "FAILED")
  
  ELEVEN_CODE=$(echo "$VOICES" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
  
  if [ "$ELEVEN_CODE" = "200" ]; then
    echo -e "   ${GREEN}✅ ElevenLabs API working${NC}"
    VOICE_COUNT=$(echo "$VOICES" | head -n -1 | jq '.voices | length' 2>/dev/null || echo "0")
    echo "   Available voices: $VOICE_COUNT"
  else
    echo -e "   ${RED}❌ HTTP $ELEVEN_CODE${NC}"
  fi
else
  echo -e "   ${YELLOW}⚠️ ELEVENLABS_API_KEY not configured${NC}"
fi

echo ""
echo "📊 Summary:"
echo "   - Primary Sesame endpoint: Check model availability"
echo "   - Alternative TTS models: Use if sesame/csm-1b unavailable"
echo "   - Northflank: Custom deployment option"
echo "   - ElevenLabs: Production-ready fallback"