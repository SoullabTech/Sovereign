#!/bin/bash

echo "🔮 Validating Sesame/Maya Pipeline Configuration"
echo "================================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "1. Checking if server is running on port 3002..."
if lsof -iTCP:3002 -sTCP:LISTEN > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is running on port 3002${NC}"
    lsof -iTCP:3002 -sTCP:LISTEN
else
    echo -e "${RED}✗ Server is not running on port 3002${NC}"
    echo "  Please start the server with: APP_PORT=3002 ./start-backend.sh"
    exit 1
fi

echo ""
echo "2. Testing API root endpoint..."
API_RESPONSE=$(curl -s http://localhost:3002/api)
if echo "$API_RESPONSE" | jq -e '.routes.converse' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API root includes converse route${NC}"
    echo "$API_RESPONSE" | jq '.routes'
else
    echo -e "${RED}✗ API root missing converse route${NC}"
    echo "$API_RESPONSE" | jq .
fi

echo ""
echo "3. Testing /api/v1/health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3002/api/v1/health)
if echo "$HEALTH_RESPONSE" | jq -e '.service == "conversational"' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Conversational service health check passed${NC}"
    echo "$HEALTH_RESPONSE" | jq .
else
    echo -e "${RED}✗ Conversational service health check failed${NC}"
    echo "$HEALTH_RESPONSE"
fi

echo ""
echo "4. Testing /api/v1/converse/health endpoint..."
CONVERSE_HEALTH=$(curl -s http://localhost:3002/api/v1/converse/health)
if echo "$CONVERSE_HEALTH" | jq -e '.pipeline == "sesame-maya"' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Sesame/Maya pipeline confirmed${NC}"
    echo "$CONVERSE_HEALTH" | jq .
else
    echo -e "${RED}✗ Sesame/Maya pipeline not configured${NC}"
    echo "$CONVERSE_HEALTH"
fi

echo ""
echo "5. Testing conversational endpoint (limited mode)..."
CONVERSE_RESPONSE=$(curl -s -X POST http://localhost:3002/api/v1/converse/message \
  -H 'Content-Type: application/json' \
  -d '{
    "userText": "lets do a gentle evening grounding ritual",
    "userId": "test-user",
    "element": "earth",
    "preferences": {"voice": {"enabled": false}}
  }')

if echo "$CONVERSE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Conversational endpoint responding${NC}"
    echo "$CONVERSE_RESPONSE" | jq .
else
    echo -e "${RED}✗ Conversational endpoint error${NC}"
    echo "$CONVERSE_RESPONSE"
fi

echo ""
echo "6. Environment Configuration Check..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}⚠ OPENAI_API_KEY not set (running in limited mode)${NC}"
else
    echo -e "${GREEN}✓ OPENAI_API_KEY is configured${NC}"
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${YELLOW}⚠ ANTHROPIC_API_KEY not set (Air element using fallback)${NC}"
else
    echo -e "${GREEN}✓ ANTHROPIC_API_KEY is configured${NC}"
fi

if [ -z "$MEM0_API_KEY" ]; then
    echo -e "${YELLOW}⚠ MEM0_API_KEY not set (no long-term memory)${NC}"
else
    echo -e "${GREEN}✓ MEM0_API_KEY is configured${NC}"
fi

echo ""
echo "================================================"
echo "Validation complete!"