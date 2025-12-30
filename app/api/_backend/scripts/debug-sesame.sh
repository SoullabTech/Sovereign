#!/bin/bash
# 🔍 Sesame CSM Debugging Script

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${PURPLE}🔍 Sesame CSM Diagnostics${NC}"
echo "═════════════════════════════════════════════════════"
echo ""

# Check if Docker is running
echo -e "${YELLOW}1. Checking Docker...${NC}"
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "   Please start Docker Desktop first."
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Find Sesame containers
echo ""
echo -e "${YELLOW}2. Looking for Sesame containers...${NC}"
SESAME_CONTAINERS=$(docker ps -a --filter "name=sesame" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}" | tail -n +2)

if [ -z "$SESAME_CONTAINERS" ]; then
    echo -e "${RED}❌ No Sesame containers found${NC}"
    echo ""
    echo "To create one, run:"
    echo "  cd backend/sesame"
    echo "  docker-compose up -d"
    exit 1
fi

echo -e "${GREEN}✅ Found Sesame container(s):${NC}"
echo "$SESAME_CONTAINERS"

# Get the first container ID
CONTAINER_ID=$(docker ps -a --filter "name=sesame" --format "{{.ID}}" | head -1)
CONTAINER_NAME=$(docker ps -a --filter "name=sesame" --format "{{.Names}}" | head -1)

echo ""
echo -e "${BLUE}Using container: $CONTAINER_NAME ($CONTAINER_ID)${NC}"

# Check health status
echo ""
echo -e "${YELLOW}3. Health Status:${NC}"
HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_ID 2>/dev/null || echo "no healthcheck")
echo "   Status: $HEALTH_STATUS"

if [ "$HEALTH_STATUS" != "no healthcheck" ]; then
    echo ""
    echo "   Recent health check logs:"
    docker inspect --format='{{range .State.Health.Log}}{{.End}} - {{.Output}}{{end}}' $CONTAINER_ID | tail -5
fi

# Check ports
echo ""
echo -e "${YELLOW}4. Port Mappings:${NC}"
PORTS=$(docker port $CONTAINER_ID 2>/dev/null || echo "No port mappings")
echo "$PORTS"

# Check if ports are actually listening
echo ""
echo -e "${YELLOW}5. Port Availability:${NC}"
for port in 8000 8080 5000; do
    if lsof -i:$port >/dev/null 2>&1; then
        PROCESS=$(lsof -ti:$port | xargs ps -p 2>/dev/null | tail -1 | awk '{print $NF}')
        echo -e "   Port $port: ${RED}IN USE${NC} by $PROCESS"
    else
        echo -e "   Port $port: ${GREEN}Available${NC}"
    fi
done

# Get environment variables
echo ""
echo -e "${YELLOW}6. Environment Variables:${NC}"
docker inspect $CONTAINER_ID --format='{{range .Config.Env}}{{println .}}{{end}}' | grep -E "(HF_|SESAME|PORT|HOST)" | head -10

# Show recent logs
echo ""
echo -e "${YELLOW}7. Recent Container Logs:${NC}"
echo "─────────────────────────────────────────────────────"
docker logs --tail 50 $CONTAINER_ID 2>&1 | tail -20
echo "─────────────────────────────────────────────────────"

# Test connectivity
echo ""
echo -e "${YELLOW}8. Testing Sesame Endpoints:${NC}"

# Try different possible ports
for port in 8000 8080 5000; do
    echo -n "   Testing http://localhost:$port/health ... "
    if curl -s -m 2 http://localhost:$port/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Responding${NC}"
        RESPONSE=$(curl -s http://localhost:$port/health | head -c 100)
        echo "      Response: $RESPONSE"
        WORKING_PORT=$port
    else
        echo -e "${RED}❌ No response${NC}"
    fi
done

# Recommendations
echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${BLUE}📋 Recommendations${NC}"
echo "═════════════════════════════════════════════════════"

if [ "$HEALTH_STATUS" = "unhealthy" ]; then
    echo ""
    echo -e "${YELLOW}Container is unhealthy. Common fixes:${NC}"
    echo ""
    echo "1. Check if HuggingFace token is set:"
    echo "   docker exec $CONTAINER_ID env | grep HF_TOKEN"
    echo ""
    echo "2. Restart the container:"
    echo "   docker restart $CONTAINER_ID"
    echo ""
    echo "3. Check resource limits:"
    echo "   docker stats --no-stream $CONTAINER_ID"
    echo ""
    echo "4. Rebuild with fresh config:"
    echo "   docker stop $CONTAINER_ID"
    echo "   docker rm $CONTAINER_ID"
    echo "   cd backend/sesame && docker-compose up -d --build"
fi

if [ -z "$WORKING_PORT" ]; then
    echo ""
    echo -e "${RED}No working endpoints found!${NC}"
    echo ""
    echo "Try:"
    echo "1. docker exec -it $CONTAINER_ID bash"
    echo "2. Check if the service is actually running inside"
    echo "3. Review the Dockerfile healthcheck command"
fi

echo ""
echo "═════════════════════════════════════════════════════"
echo ""
echo "Full logs: docker logs $CONTAINER_ID"
echo "Interactive: docker exec -it $CONTAINER_ID bash"
echo ""