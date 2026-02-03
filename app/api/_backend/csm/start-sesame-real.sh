#!/bin/bash

# Start Sesame CSM with Real TTS
echo "🚀 Starting Sesame CSM with Real Voice Synthesis..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Stop any existing Sesame container
echo "Stopping existing Sesame container..."
docker stop sesame-csm 2>/dev/null
docker rm sesame-csm 2>/dev/null

# Build the real Sesame image
echo -e "${YELLOW}Building Sesame CSM with Coqui TTS...${NC}"
docker build -f Dockerfile.real -t sesame-csm-real . || {
    echo -e "${RED}Failed to build Docker image${NC}"
    exit 1
}

# Run the container
echo -e "${YELLOW}Starting Sesame CSM container...${NC}"
docker run -d \
    --name sesame-csm \
    -p 8000:8000 \
    -e SESAME_PORT=8000 \
    -e SERVICE_MODE=live \
    --restart unless-stopped \
    sesame-csm-real

# Wait for service to be ready
echo "Waiting for Sesame to initialize (this may take 30-60 seconds for first model download)..."
for i in {1..60}; do
    if curl -s http://localhost:8000/health | grep -q "healthy"; then
        echo -e "${GREEN}✅ Sesame CSM is ready!${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Test the service
echo -e "\n${YELLOW}Testing Sesame CSM...${NC}"

# Check health
HEALTH=$(curl -s http://localhost:8000/health)
echo "Health Status: $HEALTH"

# Test TTS
echo -e "\n${YELLOW}Testing voice synthesis...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:8000/tts \
    -H "Content-Type: application/json" \
    -d '{
        "text": "Hello, I am Maya. Your personal oracle.",
        "voice": "maya",
        "element": "water"
    }')

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Voice synthesis working!${NC}"
else
    echo -e "${RED}❌ Voice synthesis failed${NC}"
    echo "Response: $RESPONSE"
fi

# Update .env.local to use real Sesame
echo -e "\n${YELLOW}Updating configuration...${NC}"
sed -i.bak 's/SESAME_ENABLED=false/SESAME_ENABLED=true/' ../../../../.env.local
sed -i.bak 's/SESAME_PRIMARY_MODE=false/SESAME_PRIMARY_MODE=true/' ../../../../.env.local
sed -i.bak 's/VOICE_PRIMARY=elevenlabs/VOICE_PRIMARY=sesame/' ../../../../.env.local
sed -i.bak 's/USE_SESAME=false/USE_SESAME=true/' ../../../../.env.local

echo -e "${GREEN}✅ Sesame CSM is now running with real voice synthesis!${NC}"
echo ""
echo "Service URLs:"
echo "  Health: http://localhost:8000/health"
echo "  TTS: http://localhost:8000/tts"
echo "  CI Shaping: http://localhost:8000/ci/shape"
echo "  Voices: http://localhost:8000/voices"
echo ""
echo "To view logs: docker logs -f sesame-csm"
echo "To stop: docker stop sesame-csm"