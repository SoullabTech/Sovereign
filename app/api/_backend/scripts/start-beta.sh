#!/bin/bash
# 🚀 Spiralogic Oracle System - Bulletproof Beta Launcher
# Enhanced with force auto-start and retry logic for Sesame CSM

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "═════════════════════════════════════════════════════"
echo "   🌟 Starting Spiralogic Oracle System Beta"
echo "═════════════════════════════════════════════════════"
echo -e "${BLUE}💡 Alternative: Use the unified stack with ./stack-manager.sh start${NC}"
echo ""

# Navigate to project root
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

echo -e "${BLUE}📍 Project root: $PROJECT_ROOT${NC}"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Load environment variables
if [ -f ".env.local" ]; then
    echo "📋 Loading environment variables..."
    while IFS='=' read -r key value; do
        [[ $key =~ ^[[:space:]]*# ]] && continue
        [[ -z "$key" ]] && continue
        export "$key=$value" 2>/dev/null || true
    done < .env.local
fi

# Source Docker check utility
BACKEND_SCRIPT_DIR="$PROJECT_ROOT/backend/scripts"
if [ -f "$BACKEND_SCRIPT_DIR/check-docker.sh" ]; then
    source "$BACKEND_SCRIPT_DIR/check-docker.sh"
fi

# 🎤 BULLETPROOF SESAME CSM STARTUP
echo "🎤 Ensuring Sesame CSM Server is running..."

SESAME_CONTAINER="sesame-csm-local"
SESAME_PORT=${SESAME_PORT:-8001}
SESAME_HEALTH_URL="http://localhost:$SESAME_PORT/health"
SESAME_STARTED_BY_SCRIPT=false
SESAME_AVAILABLE=false

# Function to check Sesame health with retries
check_sesame_health() {
    local max_retries="${1:-5}"
    local retry_delay="${2:-3}"
    local attempt=1
    
    echo "🔍 Checking Sesame health status..."
    while [ $attempt -le $max_retries ]; do
        local health_response=$(curl -s --max-time 5 $SESAME_HEALTH_URL 2>/dev/null || echo "")
        
        if [ -n "$health_response" ]; then
            if echo "$health_response" | grep -q '"model_loaded":[[:space:]]*true'; then
                echo -e "${GREEN}✅ Sesame model loaded and ready (attempt $attempt)${NC}"
                if echo "$health_response" | grep -q "Mock Sesame"; then
                    echo -e "${BLUE}ℹ️  Running in mock mode for testing${NC}"
                fi
                return 0
            else
                echo -e "${YELLOW}⚠️  Sesame responding but model not ready (attempt $attempt/$max_retries)${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  Sesame not responding (attempt $attempt/$max_retries)${NC}"
        fi
        
        if [ $attempt -lt $max_retries ]; then
            echo "   Retrying in $retry_delay seconds..."
            sleep $retry_delay
        fi
        attempt=$((attempt + 1))
    done
    
    return 1
}

# Function to start Sesame container
start_sesame_container() {
    # Auto-detect mode
    if [ -f "backend/Dockerfile.sesame" ] && [ -f "configs/sesame-server-config.yaml" ]; then
        SESAME_MODE="offline"
        COMPOSE_FILE="backend/docker-compose.sesame-offline.yml"
        echo "🔍 Offline setup detected, using offline mode"
    else
        SESAME_MODE="online"
        COMPOSE_FILE="backend/docker-compose.sesame.yml"
        echo "🔍 Using online mode (HuggingFace API)"
    fi
    
    # Check if compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        echo -e "${YELLOW}⚠️  Compose file not found: $COMPOSE_FILE${NC}"
        echo "   Falling back to mock server"
        return 1
    fi
    
    echo "🚀 Starting Sesame CSM container..."
    if docker compose -f "$COMPOSE_FILE" up -d 2>/dev/null; then
        echo -e "${GREEN}✅ Sesame container started${NC}"
        SESAME_STARTED_BY_SCRIPT=true
        
        # Wait for container to be healthy
        local wait_time=60
        if [ "$SESAME_MODE" = "offline" ]; then
            wait_time=120
            echo "   Waiting for offline model to load (up to 2 minutes)..."
        else
            echo "   Waiting for model to load (up to 1 minute)..."
        fi
        
        # Give container time to initialize
        sleep 5
        
        # Check health with extended retries for container startup
        if check_sesame_health 20 3; then
            return 0
        else
            echo -e "${RED}❌ Container started but health check failed${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Failed to start container${NC}"
        return 1
    fi
}

# Main Sesame startup logic
echo ""

# Step 1: Try initial health check
if check_sesame_health 3 2; then
    echo -e "${GREEN}✅ Sesame already healthy and running${NC}"
    SESAME_AVAILABLE=true
else
    # Step 2: Check if Docker is available and healthy
    if ! command -v docker >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Docker not installed, starting mock server${NC}"
        
        # Start mock server
        if [ -f "./scripts/start-mock-sesame.sh" ]; then
            ./scripts/start-mock-sesame.sh &
            SESAME_STARTED_BY_SCRIPT=true
            sleep 3
            
            if check_sesame_health 5 2; then
                echo -e "${GREEN}✅ Mock Sesame server running${NC}"
                SESAME_AVAILABLE=true
            else
                echo -e "${RED}❌ Failed to start mock server${NC}"
            fi
        else
            echo -e "${RED}❌ Mock server script not found${NC}"
        fi
    else
        # Docker command exists, now check if daemon is healthy
        if ! check_docker; then
            echo -e "${YELLOW}⚠️  Docker daemon not healthy, using mock server${NC}"
            if [ -f "./scripts/start-mock-sesame.sh" ]; then
                ./scripts/start-mock-sesame.sh &
                SESAME_STARTED_BY_SCRIPT=true
                sleep 3
                
                if check_sesame_health 5 2; then
                    echo -e "${GREEN}✅ Mock Sesame server running${NC}"
                    SESAME_AVAILABLE=true
                fi
            fi
        else
            # Step 3: Check if container exists
        CONTAINER_EXISTS=$(docker ps -a --format '{{.Names}}' 2>/dev/null | grep -c "^${SESAME_CONTAINER}$" || echo "0")
        
        if [ "$CONTAINER_EXISTS" -eq "0" ]; then
            # No container exists, create and start it
            echo "🔄 No Sesame container found, creating..."
            if start_sesame_container; then
                SESAME_AVAILABLE=true
            else
                echo -e "${YELLOW}⚠️  Container startup failed, trying mock server${NC}"
                if [ -f "./scripts/start-mock-sesame.sh" ]; then
                    ./scripts/start-mock-sesame.sh &
                    SESAME_STARTED_BY_SCRIPT=true
                    sleep 3
                    
                    if check_sesame_health 5 2; then
                        echo -e "${GREEN}✅ Mock Sesame server running${NC}"
                        SESAME_AVAILABLE=true
                    fi
                fi
            fi
        else
            # Container exists, check if it's running
            CONTAINER_RUNNING=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -c "^${SESAME_CONTAINER}$" || echo "0")
            
            if [ "$CONTAINER_RUNNING" -eq "0" ]; then
                echo "🔄 Sesame container exists but not running, starting..."
                docker start "$SESAME_CONTAINER" 2>/dev/null
                sleep 5
                
                if check_sesame_health 10 3; then
                    echo -e "${GREEN}✅ Sesame container restarted successfully${NC}"
                    SESAME_AVAILABLE=true
                else
                    echo -e "${YELLOW}⚠️  Container restart failed, recreating...${NC}"
                    docker rm -f "$SESAME_CONTAINER" 2>/dev/null || true
                    if start_sesame_container; then
                        SESAME_AVAILABLE=true
                    fi
                fi
            else
                echo "🔄 Sesame container running but unhealthy, restarting..."
                docker restart "$SESAME_CONTAINER" 2>/dev/null
                sleep 5
                
                if check_sesame_health 10 3; then
                    echo -e "${GREEN}✅ Sesame container restarted successfully${NC}"
                    SESAME_AVAILABLE=true
                else
                    echo -e "${RED}❌ Container restart didn't help${NC}"
                fi
            fi
        fi
        fi
    fi
fi

# Final status
echo ""
if [ "$SESAME_AVAILABLE" = "true" ]; then
    # Check if it's mock or real Sesame
    SESAME_TYPE="Unknown"
    HEALTH_CHECK=$(curl -s $SESAME_HEALTH_URL 2>/dev/null || echo "{}")
    
    if echo "$HEALTH_CHECK" | grep -q '"provider":[[:space:]]*"Mock Sesame'; then
        SESAME_TYPE="Mock"
        echo -e "${GREEN}✅ Sesame CSM Mock is available for voice synthesis${NC}"
        echo -e "   🔊 Voice Engine: ${BLUE}Sesame Mock (port $SESAME_PORT)${NC} active"
        echo -e "   ${YELLOW}Note: Using mock audio for fast development${NC}"
    elif echo "$HEALTH_CHECK" | grep -q '"model":[[:space:]]*"csm-1b"'; then
        SESAME_TYPE="Real"
        echo -e "${GREEN}✅ Sesame CSM (Real Model) is available for voice synthesis${NC}"
        echo -e "   🔊 Voice Engine: ${BLUE}Sesame CSM-1B (port $SESAME_PORT)${NC} active"
        echo -e "   ${GREEN}✨ Full voice synthesis with real AI model${NC}"
    else
        echo -e "${GREEN}✅ Sesame CSM is available for voice synthesis${NC}"
        echo -e "   🔊 Voice Engine: ${BLUE}Sesame (port $SESAME_PORT)${NC} active"
    fi
    
    # Force enable Sesame in environment
    export SESAME_ENABLED=true
    export SESAME_TYPE=$SESAME_TYPE
else
    echo -e "${YELLOW}⚠️  Sesame CSM not available, will use fallback engines${NC}"
    echo "   Fallback chain: HuggingFace → ElevenLabs"
    export SESAME_TYPE="Fallback"
fi

echo ""
echo "═════════════════════════════════════════════════════"

# Smart port management
echo "🔍 Checking for port availability..."

# Default backend port
BACKEND_PORT=${PORT:-3002}

# Function to find next available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    while check_port $port; do
        # Check what's using the port
        local process_info=$(lsof -i :$port -sTCP:LISTEN 2>/dev/null | grep -v "^COMMAND" | head -1)
        if [ -n "$process_info" ]; then
            local process_name=$(echo "$process_info" | awk '{print $1}')
            local process_pid=$(echo "$process_info" | awk '{print $2}')
            echo -e "${YELLOW}⚠️  Port $port is in use by: $process_name (PID: $process_pid)${NC}"
            
            # If it's our own backend, try to kill it
            if [[ "$process_name" == "node" ]] && [[ "$process_info" == *"spiralogic"* || "$process_info" == *"backend"* ]]; then
                echo "   Killing our own backend process..."
                kill -9 $process_pid 2>/dev/null || true
                sleep 2
                # Check if port is now free
                if ! check_port $port; then
                    echo -e "${GREEN}✅ Port $port is now free${NC}"
                    return
                fi
            elif [[ "$process_info" == *"exlm-agent"* ]]; then
                echo -e "${YELLOW}   Note: This appears to be exlm-agent service${NC}"
                echo "   To disable it permanently, run:"
                echo -e "${BLUE}   launchctl list | grep exlm${NC}"
                echo -e "${BLUE}   launchctl bootout gui/$(id -u) <service-name>${NC}"
            fi
        fi
        
        # Try next port
        port=$((port + 1))
        echo "   Trying port $port..."
    done
    
    # Found a free port
    if [ $port -ne $start_port ]; then
        echo -e "${GREEN}✅ Found available port: $port${NC}"
        BACKEND_PORT=$port
        export PORT=$port
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
    fi
}

# Check and handle backend port
find_available_port $BACKEND_PORT

# Check frontend port
if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use, killing existing process...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Trap to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    
    # Stop Sesame if we started it
    if [ "$SESAME_STARTED_BY_SCRIPT" = "true" ]; then
        if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${SESAME_CONTAINER}$"; then
            echo "   Stopping Sesame container..."
            docker stop "$SESAME_CONTAINER" >/dev/null 2>&1 || true
        fi
        
        # Kill mock server if running
        pkill -f "start-mock-sesame" 2>/dev/null || true
    fi
    exit
}
trap cleanup EXIT INT TERM

# Start backend with dynamic port
echo -e "${GREEN}▶  Starting backend on port $BACKEND_PORT...${NC}"
cd "$PROJECT_ROOT/backend"
PORT=$BACKEND_PORT npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"

# Start frontend
echo -e "${GREEN}▶  Starting frontend...${NC}"
cd "$PROJECT_ROOT"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"

# Wait for services to be ready
echo ""
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"

# Wait for backend
echo -n "   Backend (http://localhost:$BACKEND_PORT): "
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/api/v1/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for frontend
echo -n "   Frontend (http://localhost:3000): "
for i in {1..30}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Run health checks
echo ""
echo "═════════════════════════════════════════════════════"
echo "   🏥 Running Health Checks"
echo "═════════════════════════════════════════════════════"
echo ""

# Backend health
echo -n "🔍 Backend API Health: "
if curl -s http://localhost:$BACKEND_PORT/api/v1/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Unhealthy${NC}"
fi

# Voice system test with audio
echo ""
echo "🎤 VOICE ENGINE TEST:"
echo -e "   Current Engine: ${BLUE}$SESAME_TYPE${NC}"

# If Sesame is available, run direct test first
if [ "$SESAME_AVAILABLE" = "true" ] && [ -f "$PROJECT_ROOT/backend/scripts/test-sesame-simple.sh" ]; then
    if [ "$SESAME_TYPE" = "Mock" ]; then
        echo "   Running mock Sesame test (fast response)..."
    else
        echo "   Running direct Sesame CSM test..."
    fi
    (cd "$PROJECT_ROOT/backend" && ./scripts/test-sesame-simple.sh 2>&1 | sed 's/^/   /')
    echo ""
fi

# Determine voice message based on availability and type
if [ "$SESAME_TYPE" = "Mock" ]; then
    VOICE_TEST_TEXT="Maya here. Mock voice system active for rapid development."
elif [ "$SESAME_TYPE" = "Real" ]; then
    VOICE_TEST_TEXT="Maya here. Full Sesame voice synthesis is operational."
elif [ "$SESAME_AVAILABLE" = "true" ]; then
    VOICE_TEST_TEXT="Maya here. Sesame voice system is active and ready."
else
    VOICE_TEST_TEXT="Maya here. Voice system operational with fallback engines."
fi

# Test voice synthesis
VOICE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/voice/unified \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"$VOICE_TEST_TEXT\",
    \"voiceEngine\": \"auto\",
    \"fallbackEnabled\": true
  }" 2>/dev/null || echo "{}")

if echo "$VOICE_RESPONSE" | grep -q '"success":true'; then
    VOICE_ENGINE=$(echo "$VOICE_RESPONSE" | grep -o '"engine":"[^"]*"' | cut -d'"' -f4)
    echo -e "   ${GREEN}✅ Voice generated via $VOICE_ENGINE${NC}"
    
    # Play audio on macOS
    if [ "$(uname)" = "Darwin" ]; then
        AUDIO_DATA=$(echo "$VOICE_RESPONSE" | grep -o '"audioData":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$AUDIO_DATA" ] && [ "$AUDIO_DATA" != "null" ]; then
            echo "$AUDIO_DATA" | base64 -d > /tmp/maya_startup.wav 2>/dev/null && {
                ( afplay /tmp/maya_startup.wav && rm -f /tmp/maya_startup.wav ) &
                echo -e "   ${GREEN}✨ You should hear Maya's voice now!${NC}"
            }
        fi
    fi
else
    echo -e "   ${RED}❌ Voice test failed${NC}"
fi

# Final status
echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${GREEN}✅ Spiralogic Oracle Beta is READY!${NC}"
echo "═════════════════════════════════════════════════════"
echo ""
echo "   🌐 Backend:  http://localhost:$BACKEND_PORT"
echo "   🎨 Frontend: http://localhost:3000/oracle"
echo "   📊 Health:   http://localhost:$BACKEND_PORT/api/v1/health"

# Show voice engine status
if [ "$SESAME_TYPE" = "Mock" ]; then
    echo -e "   🔊 Voice:    ${BLUE}Sesame Mock${NC} (port $SESAME_PORT)"
elif [ "$SESAME_TYPE" = "Real" ]; then
    echo -e "   🔊 Voice:    ${GREEN}Sesame CSM-1B${NC} (port $SESAME_PORT)"
elif [ "$SESAME_TYPE" = "Fallback" ]; then
    echo -e "   🔊 Voice:    ${YELLOW}Fallback Mode${NC} (HF → ElevenLabs)"
else
    echo -e "   🔊 Voice:    ${BLUE}Active${NC}"
fi

echo ""
echo -e "   ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo "═════════════════════════════════════════════════════"
echo ""

# Tail logs
echo -e "${BLUE}📡 Tailing logs (Ctrl+C to exit)...${NC}"
echo ""

tail -f backend/backend.log frontend.log 2>/dev/null || wait $BACKEND_PID $FRONTEND_PID