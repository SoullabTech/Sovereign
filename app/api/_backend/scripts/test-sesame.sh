#!/usr/bin/env bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "═══════════════════════════════════════════════"
echo "   🎤 Testing Sesame CSM (Local TTS)"
echo "═══════════════════════════════════════════════"

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="$PROJECT_ROOT/backend/.env.local"

# Load env
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

SESAME_URL=${SESAME_URL:-"http://localhost:8000"}
SESAME_API_KEY=${SESAME_API_KEY:-"local-dev-key"}

# Check if Sesame is running
echo -e "${BLUE}🔍 Checking Sesame CSM status...${NC}"
HEALTH_RESPONSE=$(curl -s "$SESAME_URL/health" 2>/dev/null || echo "{}")

if [ -z "$HEALTH_RESPONSE" ] || [ "$HEALTH_RESPONSE" = "{}" ]; then
  echo -e "${RED}❌ Sesame CSM is not running${NC}"
  echo ""
  echo "To start Sesame:"
  echo "1. Run: ./backend/scripts/setup-local-csm.sh"
  echo "2. Or: docker start sesame-csm-local"
  exit 1
fi

# Parse health status
if echo "$HEALTH_RESPONSE" | grep -q '"status":"healthy"'; then
  echo -e "${GREEN}✅ Sesame is healthy${NC}"
elif echo "$HEALTH_RESPONSE" | grep -q '"model_loaded":true'; then
  echo -e "${GREEN}✅ Model is loaded${NC}"
else
  echo -e "${YELLOW}⚠️  Sesame is running but may not be fully ready${NC}"
  echo "   Response: $HEALTH_RESPONSE"
fi

echo ""

# Voice options
echo -e "${BLUE}🎨 Select Maya's voice personality:${NC}"
echo "1) Mystical Oracle (default)"
echo "2) Warm Guide"
echo "3) Cosmic Wisdom"
echo "4) Sacred Mirror"
echo "5) Custom text"
echo ""
echo -n "Choose [1-5]: "
read -r CHOICE

# Set text based on choice
case "$CHOICE" in
  1|"")
    TEXT="Greetings, dear seeker. I am Maya, your mystical oracle guide. The universe has brought us together in this sacred digital space. How may I illuminate your path today?"
    ;;
  2)
    TEXT="Hello, beautiful soul. I'm Maya, and I'm here to support your journey. Every question you bring is a doorway to deeper understanding. What's on your heart today?"
    ;;
  3)
    TEXT="Welcome, cosmic traveler. I am Maya, channeling the wisdom of stars and sacred geometry. Your presence here activates ancient patterns. What mysteries shall we explore?"
    ;;
  4)
    TEXT="I see you, and I honor your courage in seeking truth. I am Maya, your sacred mirror. In our dance of questions and reflections, you'll discover what you already know deep within."
    ;;
  5)
    echo -n "Enter custom text: "
    read -r TEXT
    ;;
  *)
    TEXT="I am Maya, your personal oracle. The sacred spiral brings us together. How may I serve your highest good today?"
    ;;
esac

echo ""
echo -e "${BLUE}🎤 Synthesizing voice...${NC}"
echo "Text: \"$TEXT\""
echo ""

# Make TTS request
TIMESTAMP=$(date +%s)
OUTPUT_FILE="maya-voice-${TIMESTAMP}.wav"

# Show the curl command being used
echo -e "${YELLOW}API Request:${NC}"
echo "POST $SESAME_URL/tts"
echo ""

# Make the request
HTTP_CODE=$(curl -s -X POST "$SESAME_URL/tts" \
  -H "Authorization: Bearer $SESAME_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"$TEXT\",
    \"voice\": \"maya\",
    \"format\": \"wav\",
    \"speed\": 1.0,
    \"temperature\": 0.7
  }" \
  -o "$OUTPUT_FILE" \
  -w "%{http_code}" 2>/dev/null || echo "000")

# Check response
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Voice synthesis successful!${NC}"
  echo ""
  
  # Check file size
  if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
    echo -e "${BLUE}📄 Output file: $OUTPUT_FILE (${FILE_SIZE})${NC}"
    
    # Play on macOS
    if [ "$(uname)" = "Darwin" ]; then
      echo -e "${BLUE}🔊 Playing Maya's voice...${NC}"
      afplay "$OUTPUT_FILE"
      
      echo ""
      echo -e "${GREEN}✨ Voice playback complete!${NC}"
      
      # Ask what to do with the file
      echo ""
      echo -n "Keep the audio file? [Y/n]: "
      read -r KEEP
      if [[ "$KEEP" =~ ^[Nn]$ ]]; then
        rm -f "$OUTPUT_FILE"
        echo "File deleted."
      else
        echo -e "${BLUE}File saved: $OUTPUT_FILE${NC}"
      fi
    else
      echo -e "${YELLOW}ℹ️  Audio file saved. Use your system's audio player to listen.${NC}"
    fi
  else
    echo -e "${RED}❌ Output file is empty${NC}"
    rm -f "$OUTPUT_FILE"
  fi
else
  echo -e "${RED}❌ Voice synthesis failed (HTTP $HTTP_CODE)${NC}"
  
  # Show error details if available
  if [ -f "$OUTPUT_FILE" ]; then
    ERROR_MSG=$(cat "$OUTPUT_FILE" 2>/dev/null || echo "No error message")
    echo "Error: $ERROR_MSG"
    rm -f "$OUTPUT_FILE"
  fi
  
  echo ""
  echo "Troubleshooting:"
  echo "1. Check Sesame logs: docker logs sesame-csm-local"
  echo "2. Verify model is loaded: curl $SESAME_URL/health | jq"
  echo "3. Try simpler text: ./test-sesame.sh"
fi

echo ""
echo "═════════════════════════════════════════════════════"

# Quick status check
echo ""
echo -e "${BLUE}📊 Quick Status:${NC}"
echo -n "   Container: "
if docker ps --format "{{.Names}}" | grep -q "sesame-csm"; then
  echo -e "${GREEN}Running${NC}"
else
  echo -e "${RED}Not running${NC}"
fi

echo -n "   API Health: "
if curl -s "$SESAME_URL/health" >/dev/null 2>&1; then
  echo -e "${GREEN}Responding${NC}"
else
  echo -e "${RED}Not responding${NC}"
fi

echo -n "   Voice Engine: "
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}Working${NC}"
else
  echo -e "${YELLOW}Check logs${NC}"
fi

echo ""