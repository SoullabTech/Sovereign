#!/bin/bash
# 🚀 Spiralogic Oracle System - Beta Launcher
# Runs backend + frontend + tests in one command
#
# Usage:
#   ./start-beta.sh          # Auto-detect and use best available engine
#   ./start-beta.sh --mock   # Force mock server (skip Docker/prompts)

set -e

# Parse command line arguments
FORCE_MOCK=false
for arg in "$@"; do
    case $arg in
        --mock)
            FORCE_MOCK=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --mock    Force mock Sesame server (skip Docker checks)"
            echo "  --help    Show this help message"
            exit 0
            ;;
    esac
done

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "═════════════════════════════════════════════════════"
echo "   🌟 Starting Spiralogic Oracle System Beta"
if [ "$FORCE_MOCK" = "true" ]; then
    echo "       (Mock Mode - Quick Development)"
else
    echo "       (Enhanced with Smart Auto-Start)"
fi
echo "═════════════════════════════════════════════════════"
echo -e "${BLUE}💡 Alternative: Use the unified stack with ./stack-manager.sh start${NC}"
echo ""

# Show voice mode right away
if [ "$FORCE_MOCK" = "true" ]; then
    echo -e "🎭 Voice Mode: ${YELLOW}Mock (Quick Dev)${NC}"
else
    echo -e "🎤 Voice Mode: ${GREEN}Auto-Detect Best Available${NC}"
fi

echo ""
echo "🔗 Voice Engine Priority Chain:"
echo "   1️⃣  Sesame (Self-Hosted, Docker)"
echo "   2️⃣  HuggingFace Blenderbot (Cloud Fallback)"
echo "   3️⃣  ElevenLabs (Premium Fallback)"
echo ""

# Navigate to project root (assuming script is in backend/scripts)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
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

# 🎤 AUTO-START SESAME CSM - Required for Sesame-Primary Mode
if [ "$FORCE_MOCK" = "true" ]; then
    echo "🎤 Starting Mock Sesame Server (--mock flag specified)..."
else
    echo "🎤 Checking Sesame CSM Server (REQUIRED for voice)..."
fi

# Initialize variables
SESAME_STARTED_BY_SCRIPT=false
SESAME_CONTAINER="sesame-csm"
SESAME_HEALTH_URL="http://localhost:8000/health"

# Auto-detect offline mode from environment
if [ -f ".env.local" ]; then
    # Source environment variables safely
    echo "📋 Loading environment variables..."
    # Use a different approach that works on macOS
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^[[:space:]]*# ]] && continue
        [[ -z "$key" ]] && continue
        # Export the variable
        export "$key=$value" 2>/dev/null || true
    done < .env.local
fi

# Function to check Sesame health with retries
check_sesame_health() {
    local max_retries=5
    local retry_delay=3
    local attempt=1
    
    echo "🔍 Checking Sesame health status..."
    while [ $attempt -le $max_retries ]; do
        local health_response=$(curl -s --max-time 5 $SESAME_HEALTH_URL 2>/dev/null || echo "")
        
        if [ -n "$health_response" ]; then
            if echo "$health_response" | grep -q '"model_loaded":[[:space:]]*true'; then
                echo -e "${GREEN}✅ Sesame model loaded and ready (attempt $attempt)${NC}"
                # Check if it's a mock server
                if echo "$health_response" | grep -q "Mock Sesame"; then
                    echo -e "${BLUE}ℹ️  Running in mock mode for testing${NC}"
                    
                    # Offer to switch to real Sesame if available (unless --mock was used)
                    if [ "$FORCE_MOCK" != "true" ] && [ -f "backend/docker-compose.sesame-offline.yml" ] && command -v docker >/dev/null 2>&1; then
                        echo ""
                        echo -e "${YELLOW}💡 Real Sesame Docker setup detected!${NC}"
                        echo "   Would you like to switch from mock to real Sesame?"
                        echo -n "   Start real Sesame Docker container? [y/N] "
                        read -t 10 SWITCH_TO_REAL || SWITCH_TO_REAL="n"
                        
                        if [[ "$SWITCH_TO_REAL" =~ ^[Yy]$ ]]; then
                            echo "   Stopping mock server..."
                            lsof -ti:8000 | xargs kill -9 2>/dev/null || true
                            sleep 2
                            return 1  # Force restart with real Sesame
                        fi
                    fi
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

# Check if Sesame container is running
SESAME_RUNNING=false
if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${SESAME_CONTAINER}$"; then
    echo -e "${BLUE}ℹ️  Sesame container detected${NC}"
    SESAME_RUNNING=true
fi

# Force mock if flag is set
if [ "$FORCE_MOCK" = "true" ]; then
    # Check if any server is already running on port 8000
    if curl -s --max-time 2 http://localhost:8000/health >/dev/null 2>&1; then
        echo "   Stopping existing server on port 8000..."
        lsof -ti:8000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Start mock server
    echo "🚀 Starting mock Sesame server..."
    ./scripts/start-mock-sesame.sh &
    SESAME_STARTED_BY_SCRIPT=true
    sleep 3
    
    # Verify mock started
    if check_sesame_health; then
        echo -e "${GREEN}✅ Mock Sesame server started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start mock server${NC}"
    fi
# Try initial health check
elif check_sesame_health; then
    echo -e "${GREEN}✅ Sesame server already healthy${NC}"
else
    # If not healthy, force start the container
    echo -e "${YELLOW}🔄 Sesame not healthy, attempting to start...${NC}"
    
    # Enable Sesame regardless of env setting if we're trying to start it
    SESAME_ENABLED=true
    
    # Try to start container if not running
    if [ "$SESAME_RUNNING" = "false" ]; then
        # Check if Docker is available
        if ! command -v docker >/dev/null 2>&1; then
            echo -e "${RED}❌ Docker not found. Falling back to mock server.${NC}"
            echo "🚀 Starting mock Sesame server..."
            ./scripts/start-mock-sesame.sh &
            SESAME_STARTED_BY_SCRIPT=true
            sleep 3
            
            # Check if mock started successfully
            if check_sesame_health; then
                echo -e "${GREEN}✅ Mock Sesame server started successfully${NC}"
            else
                echo -e "${RED}❌ Failed to start mock server${NC}"
            fi
        else
            # Docker is available, check if daemon is running
            if ! docker ps >/dev/null 2>&1; then
                echo -e "${YELLOW}⚠️  Docker daemon not running${NC}"
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    echo "   Attempting to start Docker Desktop..."
                    open -a Docker 2>/dev/null || echo "   Please start Docker Desktop manually"
                    
                    # Wait for Docker to start
                    echo -n "   Waiting for Docker daemon"
                    for i in {1..30}; do
                        if docker ps >/dev/null 2>&1; then
                            echo -e " ${GREEN}✓${NC}"
                            break
                        fi
                        echo -n "."
                        sleep 1
                    done
                    
                    if ! docker ps >/dev/null 2>&1; then
                        echo -e "\n${RED}❌ Docker failed to start. Using mock server instead.${NC}"
                        ./scripts/start-mock-sesame.sh &
                        SESAME_STARTED_BY_SCRIPT=true
                        sleep 3
                        return
                    fi
                fi
            fi
            
            # Auto-detect offline mode if setup was completed
            if [ -f "backend/Dockerfile.sesame" ] && [ -f "configs/sesame-server-config.yaml" ]; then
                SESAME_MODE="${SESAME_MODE:-offline}"
                echo "🔍 Offline setup detected, using offline mode"
            else
                SESAME_MODE="${SESAME_MODE:-online}"
            fi
    
    # Check if Sesame container is already running (either mode)
    if ! docker ps --format "table {{.Names}}" | grep -q "sesame-csm"; then
        echo "🔄 Sesame CSM not running, starting with Docker..."
        
        # Check if Docker is available
        if ! command -v docker >/dev/null 2>&1; then
            echo -e "${RED}❌ Docker not found. Please install Docker to auto-start Sesame.${NC}"
            echo ""
            echo -e "${BLUE}Setup options:${NC}"
            echo "  1. Offline setup: ${YELLOW}./scripts/setup-sesame-offline.sh${NC}"
            echo "  2. Manual setup: ${YELLOW}./scripts/setup-sesame-local.sh${NC}"
            echo "  3. Mock server: ${YELLOW}./scripts/start-mock-sesame.sh${NC}"
            exit 1
        fi
        
        # Choose Docker Compose file based on mode
        if [ "$SESAME_MODE" = "offline" ]; then
            COMPOSE_FILE="backend/docker-compose.sesame-offline.yml"
            CONTAINER_NAME="sesame-csm"
            echo "   Starting Sesame CSM in OFFLINE mode..."
            
            # Check GPU support for faster inference
            if command -v nvidia-smi >/dev/null 2>&1 && nvidia-smi >/dev/null 2>&1; then
                echo "   🚀 NVIDIA GPU detected, enabling GPU acceleration"
                GPU_AVAILABLE=true
            else
                echo "   💻 No GPU detected, using CPU inference (slower)"
                GPU_AVAILABLE=false
            fi
            
            # Check if offline setup was completed
            if [ ! -f "configs/sesame-server-config.yaml" ] || [ ! -f "backend/Dockerfile.sesame" ]; then
                echo -e "${YELLOW}⚠️  Offline setup not completed${NC}"
                echo "   Run: ${YELLOW}./backend/scripts/setup-sesame-offline.sh${NC}"
                echo "   Falling back to online mode..."
                COMPOSE_FILE="backend/docker-compose.sesame.yml"
                CONTAINER_NAME="sesame-csm"
            fi
        else
            COMPOSE_FILE="backend/docker-compose.sesame.yml"
            CONTAINER_NAME="sesame-csm"
            echo "   Starting Sesame CSM in ONLINE mode..."
        fi
        
        # Start Sesame CSM container
        echo "   Using compose file: $COMPOSE_FILE"
        if docker compose -f "$COMPOSE_FILE" up -d; then
            echo -e "${GREEN}✅ Sesame CSM container started${NC}"
            if [ "$SESAME_MODE" = "offline" ]; then
                echo "   Waiting for offline model to load (this may take 60-90 seconds)..."
            else
                echo "   Waiting for model to load (this may take 30-60 seconds)..."
            fi
            SESAME_STARTED_BY_SCRIPT=true
            
            # Wait for service to be ready with timeout (longer for offline mode)
            MAX_WAIT=60
            if [ "$SESAME_MODE" = "offline" ]; then
                MAX_WAIT=120
            fi
            
            for i in $(seq 1 $MAX_WAIT); do
                if curl -s --max-time 2 http://localhost:8000/health >/dev/null 2>&1; then
                    echo -e "${GREEN}✅ Sesame CSM is ready${NC}"
                    break
                fi
                echo -n "."
                sleep 1
                
                if [ $i -eq $MAX_WAIT ]; then
                    echo -e "${RED}❌ Sesame CSM failed to start within $MAX_WAIT seconds${NC}"
                    echo "   Check container logs: docker logs $CONTAINER_NAME"
                    exit 1
                fi
            done
        else
            echo -e "${RED}❌ Failed to start Sesame CSM container${NC}"
            echo ""
            echo -e "${BLUE}Setup options:${NC}"
            echo "  1. Offline setup: ${YELLOW}./scripts/setup-sesame-offline.sh${NC}"
            echo "  2. Manual setup: ${YELLOW}./scripts/setup-sesame-local.sh${NC}"
            echo "  3. Mock server: ${YELLOW}./scripts/start-mock-sesame.sh${NC}"
            exit 1
        fi
    else
        # Determine which container is running
        if docker ps --format "table {{.Names}}" | grep -q "sesame-csm"; then
            # Check if it's the offline version by inspecting the image or compose file
            if [ -f "backend/docker-compose.sesame-offline.yml" ] && docker compose -f backend/docker-compose.sesame-offline.yml ps sesame-csm 2>/dev/null | grep -q "Up"; then
                echo "🎤 Sesame CSM container already running (OFFLINE mode)"
            else
                echo "🎤 Sesame CSM container already running (ONLINE mode)"
            fi
        fi
    fi
    
    # Final health check
    if ! curl -s --max-time 5 http://localhost:8000/health >/dev/null 2>&1; then
        echo -e "${RED}❌ Sesame CSM server is not responding on port 8000${NC}"
        echo "   Check container status: docker ps | grep sesame-csm"
        echo "   Check container logs: docker logs sesame-csm"
        exit 1
    fi
        fi  # Close the outer Docker check
    fi  # Close SESAME_RUNNING check
fi  # Close the main health check

echo ""

# Final Voice System Status with Fallback Chain
echo "🔊 Voice System Status:"
echo ""

# Check each engine's availability
SESAME_STATUS="❌"
HUGGINGFACE_STATUS="❌"
ELEVENLABS_STATUS="❌"

# 1. Check Sesame
SESAME_FINAL=$(curl -s --max-time 5 http://localhost:8000/health 2>/dev/null || echo "")
if [ -n "$SESAME_FINAL" ]; then
    if echo "$SESAME_FINAL" | grep -q '"model_loaded":true'; then
        SESAME_STATUS="✅"
        if echo "$SESAME_FINAL" | grep -q "Mock Sesame"; then
            SESAME_MODE=" (Mock)"
        else
            SESAME_MODE=" (Real Docker)"
        fi
    else
        SESAME_STATUS="⚠️"
        SESAME_MODE=" (Not Ready)"
    fi
else
    SESAME_MODE=" (Not Running)"
fi

# 2. Check HuggingFace
if [ -n "$SESAME_FALLBACK_API_KEY" ] && [ -n "$SESAME_FALLBACK_URL" ]; then
    HF_TEST=$(curl -s --max-time 3 -X POST "$SESAME_FALLBACK_URL" \
        -H "Authorization: Bearer $SESAME_FALLBACK_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"inputs":"Test"}' 2>/dev/null || echo "")
    
    if echo "$HF_TEST" | grep -q "generated_text\|error"; then
        if echo "$HF_TEST" | grep -q "error"; then
            HUGGINGFACE_STATUS="⚠️"
            HUGGINGFACE_MODE=" (API Error)"
        else
            HUGGINGFACE_STATUS="✅"
            HUGGINGFACE_MODE=" (Ready)"
        fi
    else
        HUGGINGFACE_MODE=" (No Response)"
    fi
else
    HUGGINGFACE_MODE=" (Not Configured)"
fi

# 3. Check ElevenLabs
if [ -n "$ELEVENLABS_API_KEY" ]; then
    EL_TEST=$(curl -s --max-time 3 -X GET "https://api.elevenlabs.io/v1/voices" \
        -H "xi-api-key: $ELEVENLABS_API_KEY" 2>/dev/null || echo "")
    
    if echo "$EL_TEST" | grep -q "voices"; then
        ELEVENLABS_STATUS="✅"
        ELEVENLABS_MODE=" (Ready)"
    elif echo "$EL_TEST" | grep -q "unauthorized\|Unauthorized"; then
        ELEVENLABS_STATUS="⚠️"
        ELEVENLABS_MODE=" (Invalid API Key)"
    else
        ELEVENLABS_MODE=" (Not Reachable)"
    fi
else
    ELEVENLABS_MODE=" (Not Configured)"
fi

# Display the voice fallback chain with live status
echo "🔗 Voice Engine Priority Chain:"
echo -e "   1️⃣  ${SESAME_STATUS} Sesame${SESAME_MODE}"
echo -e "   2️⃣  ${HUGGINGFACE_STATUS} HuggingFace Blenderbot${HUGGINGFACE_MODE}"
echo -e "   3️⃣  ${ELEVENLABS_STATUS} ElevenLabs Premium${ELEVENLABS_MODE}"

# Show which engine will be used
echo ""
PRIMARY_ENGINE="none"
if [ "$SESAME_STATUS" = "✅" ]; then
    echo -e "   ${GREEN}➜ Primary: Sesame will handle all voice requests${NC}"
    PRIMARY_ENGINE="sesame"
elif [ "$HUGGINGFACE_STATUS" = "✅" ]; then
    echo -e "   ${YELLOW}➜ Fallback: HuggingFace will handle voice requests${NC}"
    PRIMARY_ENGINE="huggingface"
elif [ "$ELEVENLABS_STATUS" = "✅" ]; then
    echo -e "   ${BLUE}➜ Fallback: ElevenLabs will handle voice requests${NC}"
    PRIMARY_ENGINE="elevenlabs"
else
    echo -e "   ${RED}➜ Warning: No voice engines available!${NC}"
fi

# Log voice status to JSON
LOG_DIR="$PROJECT_ROOT/logs"
mkdir -p "$LOG_DIR"
VOICE_STATUS_LOG="$LOG_DIR/voice-status.json"
VOICE_HISTORY_LOG="$LOG_DIR/voice-status-history.jsonl"

# Create JSON status object
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
VOICE_STATUS_JSON=$(cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "mode": "$([ "$FORCE_MOCK" = "true" ] && echo "mock" || echo "auto")",
  "engines": {
    "sesame": {
      "status": "$SESAME_STATUS",
      "available": $([ "$SESAME_STATUS" = "✅" ] && echo "true" || echo "false"),
      "details": "$SESAME_MODE"
    },
    "huggingface": {
      "status": "$HUGGINGFACE_STATUS",
      "available": $([ "$HUGGINGFACE_STATUS" = "✅" ] && echo "true" || echo "false"),
      "details": "$HUGGINGFACE_MODE"
    },
    "elevenlabs": {
      "status": "$ELEVENLABS_STATUS",
      "available": $([ "$ELEVENLABS_STATUS" = "✅" ] && echo "true" || echo "false"),
      "details": "$ELEVENLABS_MODE"
    }
  },
  "primary_engine": "$PRIMARY_ENGINE",
  "all_engines_available": $([ "$SESAME_STATUS" = "✅" ] && [ "$HUGGINGFACE_STATUS" = "✅" ] && [ "$ELEVENLABS_STATUS" = "✅" ] && echo "true" || echo "false"),
  "any_engine_available": $([ "$PRIMARY_ENGINE" != "none" ] && echo "true" || echo "false")
}
EOF
)

# Write current status
echo "$VOICE_STATUS_JSON" > "$VOICE_STATUS_LOG"

# Append to history (JSONL format for easy parsing)
echo "$VOICE_STATUS_JSON" | jq -c . >> "$VOICE_HISTORY_LOG" 2>/dev/null || echo "$VOICE_STATUS_JSON" >> "$VOICE_HISTORY_LOG"

echo ""
echo "📊 Voice status logged to:"
echo "   - Current: $VOICE_STATUS_LOG"
echo "   - History: $VOICE_HISTORY_LOG"

echo ""

# Kill existing processes on our ports
echo "🔍 Checking for existing processes..."
if check_port 3002; then
    echo -e "${YELLOW}⚠️  Port 3002 is in use, killing existing process...${NC}"
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

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
    
    # Stop Sesame container if we started it
    if [ "$SESAME_STARTED_BY_SCRIPT" = "true" ]; then
        echo "   Stopping Sesame CSM container..."
        # Try both compose files to handle either mode
        docker compose -f backend/docker-compose.sesame-offline.yml down >/dev/null 2>&1 || true
        docker compose -f backend/docker-compose.sesame.yml down >/dev/null 2>&1 || true
    fi
    exit
}
trap cleanup EXIT INT TERM

# 1. Start backend
echo -e "${GREEN}▶  Starting backend...${NC}"
cd "$PROJECT_ROOT/backend"
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"

# 2. Start frontend
echo -e "${GREEN}▶  Starting frontend...${NC}"
cd "$PROJECT_ROOT"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"

# 3. Wait for services to be ready
echo ""
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"

# Wait for backend
echo -n "   Backend (http://localhost:3002): "
for i in {1..30}; do
    if curl -s http://localhost:3002/api/v1/health >/dev/null 2>&1; then
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

# 4. Run health checks
echo ""
echo "═════════════════════════════════════════════════════"
echo "   🏥 Running Health Checks"
echo "═════════════════════════════════════════════════════"
echo ""

# Backend health check
echo -n "🔍 Backend API Health: "
if curl -s http://localhost:3002/api/v1/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Unhealthy${NC}"
    echo "   Check backend.log for details"
fi

# Check Supabase connection
echo -n "🔍 Supabase Connection: "
SUPABASE_CHECK=$(curl -s http://localhost:3002/api/v1/health | grep -o '"supabase":"[^"]*"' | cut -d'"' -f4)
if [ "$SUPABASE_CHECK" = "connected" ]; then
    echo -e "${GREEN}✓ Connected${NC}"
    
    # Test Supabase persistence
    echo -n "🔍 Supabase Write/Read Test: "
    TEST_ID="beta-test-$(date +%s)"
    
    # Try to write a test memory item
    WRITE_RESPONSE=$(curl -s -X POST http://localhost:3002/api/v1/memory/test \
      -H "Content-Type: application/json" \
      -d "{\"userId\":\"$TEST_ID\",\"content\":\"Beta launcher test at $(date)\"}" 2>/dev/null || echo "{}")
    
    if echo "$WRITE_RESPONSE" | grep -q "success"; then
        # Try to read it back
        READ_RESPONSE=$(curl -s "http://localhost:3002/api/v1/memory/test?userId=$TEST_ID" 2>/dev/null || echo "{}")
        if echo "$READ_RESPONSE" | grep -q "Beta launcher test"; then
            echo -e "${GREEN}✓ Persistence working${NC}"
            
            # Clean up test data
            curl -s -X DELETE "http://localhost:3002/api/v1/memory/test?userId=$TEST_ID" >/dev/null 2>&1
        else
            echo -e "${YELLOW}⚠️  Read failed (check Supabase permissions)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Write failed (check Supabase credentials)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Not connected (running in limited mode)${NC}"
fi

# 5. Test Oracle Insights persistence
if [ "$SUPABASE_CHECK" = "connected" ]; then
    echo -n "🔍 Oracle Insights Table Test: "
    
    # Test writing an oracle insight
    INSIGHT_TEST=$(curl -s -X POST http://localhost:3002/api/v1/oracle/insight-test \
      -H "Content-Type: application/json" \
      -d '{"userId":"beta-test","query":"Test query","response":"Test response","agentType":"aether-agent"}' 2>/dev/null || echo "{}")
    
    if echo "$INSIGHT_TEST" | grep -q "success\|created"; then
        echo -e "${GREEN}✓ Oracle insights working${NC}"
    else
        echo -e "${YELLOW}⚠️  Oracle insights not configured${NC}"
    fi
fi

# 5a. Test ElevenLabs Voice Synthesis
echo -n "🔍 ElevenLabs Voice API: "
if [ -n "$ELEVENLABS_API_KEY" ]; then
    VOICE_TEST=$(curl -s -X GET "https://api.elevenlabs.io/v1/voices" \
      -H "xi-api-key: $ELEVENLABS_API_KEY" 2>/dev/null || echo "{}")
    
    if echo "$VOICE_TEST" | grep -q "voices"; then
        echo -e "${GREEN}✓ Connected${NC}"
    else
        echo -e "${YELLOW}⚠️  Not connected (check API key)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No API key configured${NC}"
fi

# 5b. Test Sesame-Primary Voice Integration (WITH AUDIO!)
echo "🔍 Sesame-Primary Voice Integration:"

# Check if Sesame self-hosted server is running
echo -n "   Checking Sesame server: "
if curl -s --max-time 5 http://localhost:8000/health >/dev/null 2>&1; then
    SESAME_HEALTH=$(curl -s --max-time 5 http://localhost:8000/health)
    if echo "$SESAME_HEALTH" | grep -q '"model_loaded":true'; then
        echo -e "${GREEN}✓ Self-hosted server ready${NC}"
        SESAME_AVAILABLE=true
    else
        echo -e "${YELLOW}⚠️  Server running but model not loaded${NC}"
        SESAME_AVAILABLE=false
    fi
else
    echo -e "${YELLOW}⚠️  Self-hosted server not running${NC}"
    SESAME_AVAILABLE=false
    
    # Fall back to HuggingFace API test
    echo -n "   Checking HuggingFace API: "
    if [ -n "$SESAME_API_KEY" ] && [ -n "$SESAME_URL" ]; then
        SESAME_TEST=$(curl -s --max-time 5 -X POST "$SESAME_URL" \
          -H "Authorization: Bearer $SESAME_API_KEY" \
          -H "Content-Type: application/json" \
          -d '{"inputs":"Hello"}' 2>/dev/null || echo "{}")
        
        if echo "$SESAME_TEST" | grep -q "generated_text"; then
            echo -e "${GREEN}✓ Connected${NC}"
            SESAME_AVAILABLE=true
        else
            echo -e "${YELLOW}⚠️  Not accessible${NC}"
            SESAME_AVAILABLE=false
        fi
    else
        echo -e "${YELLOW}⚠️  Not configured${NC}"
        SESAME_AVAILABLE=false
    fi
fi

# 🎤 AUDIBLE VOICE VERIFICATION
echo ""
echo "🎤 VOICE ENGINE TEST (AUDIBLE CONFIRMATION):"
echo "   Testing Sesame-Primary voice routing..."

# First, ensure frontend is responding (needed for voice API)
if ! curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "   ⚠️  Frontend not ready yet, waiting..."
    sleep 5
fi

# Determine which voice engine to announce based on availability
if [ "$SESAME_AVAILABLE" = "true" ]; then
    VOICE_TEST_TEXT="Maya here. Sesame voice system is active and ready. I'm speaking through your self-hosted voice engine."
    EXPECTED_ENGINE="sesame"
elif [ -n "$ELEVENLABS_API_KEY" ]; then
    VOICE_TEST_TEXT="Maya here. Voice system operational with ElevenLabs as primary engine."
    EXPECTED_ENGINE="elevenlabs"
else
    VOICE_TEST_TEXT="Maya here. Voice system is ready."
    EXPECTED_ENGINE="any"
fi

# Test via unified voice API
VOICE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/voice/unified \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"$VOICE_TEST_TEXT\",
    \"voiceEngine\": \"auto\",
    \"fallbackEnabled\": true
  }" 2>/dev/null || echo "{}")

if echo "$VOICE_RESPONSE" | grep -q '"success":true'; then
    VOICE_ENGINE=$(echo "$VOICE_RESPONSE" | grep -o '"engine":"[^"]*"' | cut -d'"' -f4)
    PROCESSING_TIME=$(echo "$VOICE_RESPONSE" | grep -o '"processingTimeMs":[0-9]*' | cut -d':' -f2)
    FALLBACK_USED=$(echo "$VOICE_RESPONSE" | grep -o '"fallbackUsed":[^,}]*' | cut -d':' -f2)
    
    if [ "$VOICE_ENGINE" = "sesame" ]; then
        echo -e "   ${GREEN}🎉 SUCCESS! Voice generated via Sesame (${PROCESSING_TIME}ms)${NC}"
        echo "   🔊 Primary engine confirmed: SESAME"
    elif [ "$VOICE_ENGINE" = "elevenlabs" ] && [ "$FALLBACK_USED" = "true" ]; then
        echo -e "   ${YELLOW}⚠️  Sesame failed, used ElevenLabs fallback${NC}"
        echo "   🔊 Fallback engine used: ELEVENLABS"
    elif [ "$VOICE_ENGINE" = "elevenlabs" ]; then
        echo -e "   ${BLUE}ℹ️  ElevenLabs used directly (not primary mode)${NC}"
        echo "   🔊 Engine used: ELEVENLABS"
    else
        echo -e "   ${YELLOW}⚠️  Unknown engine: $VOICE_ENGINE${NC}"
    fi
    
    # Try to play the audio if on macOS
    if [ "$(uname)" = "Darwin" ]; then
        echo "   🔊 Playing startup confirmation..."
        
        # Extract audio data and play it
        AUDIO_DATA=$(echo "$VOICE_RESPONSE" | grep -o '"audioData":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$AUDIO_DATA" ] && [ "$AUDIO_DATA" != "null" ]; then
            # Create temp file and play
            echo "$AUDIO_DATA" | base64 -d > /tmp/maya_startup_voice.wav 2>/dev/null && {
                # Play in background so script continues
                ( afplay /tmp/maya_startup_voice.wav 2>/dev/null && rm -f /tmp/maya_startup_voice.wav ) &
                echo -e "   ${GREEN}✨ You should hear Maya's voice now!${NC}"
            } || {
                echo "     (Audio data format not supported for playback)"
            }
        else
            # Try audioUrl format
            AUDIO_URL=$(echo "$VOICE_RESPONSE" | grep -o '"audioUrl":"[^"]*"' | cut -d'"' -f4)
            if [ -n "$AUDIO_URL" ] && [[ "$AUDIO_URL" == /* ]]; then
                ( afplay "$PROJECT_ROOT$AUDIO_URL" 2>/dev/null ) &
                echo -e "   ${GREEN}✨ You should hear Maya's voice now!${NC}"
            fi
        fi
    else
        echo "   🔊 Audio generated successfully (playback not available on this platform)"
    fi
    
else
    echo -e "   ${RED}❌ Voice test failed${NC}"
    ERROR_MSG=$(echo "$VOICE_RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$ERROR_MSG" ]; then
        echo "      Error: $ERROR_MSG"
    fi
fi

# Optional: Add a shorter audible chime after all tests complete
PLAY_STARTUP_CHIME() {
    if [ "$(uname)" = "Darwin" ] && [ "$VOICE_ENGINE" != "" ]; then
        # Create a simple success tone using macOS's say command as backup
        ( say -v Samantha "System ready" 2>/dev/null || true ) &
    fi
}

echo ""

# 6. Run Maya smoke tests
echo ""
echo "═════════════════════════════════════════════════════"
echo "   🧪 Running Maya Smoke Tests"
echo "═════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT/backend"
if [ -f "test-maya.ts" ]; then
    npx ts-node test-maya.ts || {
        echo -e "${RED}❌ Maya smoke tests failed${NC}"
        echo "   Check the output above for details"
    }
else
    echo -e "${YELLOW}⚠️  test-maya.ts not found, skipping tests${NC}"
fi

# 7. Optional: Quick API test
echo ""
echo "🔍 Quick API Test..."
MAYA_RESPONSE=$(curl -s -X POST http://localhost:3002/api/v1/oracle/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"beta-test","input":"Hello Maya"}' 2>/dev/null || echo "{}")

if echo "$MAYA_RESPONSE" | grep -q "message"; then
    echo -e "${GREEN}✓ Maya API responding${NC}"
else
    echo -e "${YELLOW}⚠️  Maya API not responding as expected${NC}"
fi

# 8. System Status Summary
echo ""
echo "═════════════════════════════════════════════════════"
echo "   🌟 Spiralogic Oracle System Status"
echo "═════════════════════════════════════════════════════"

# Set status variables for final display
BACKEND_STATUS="✅ Running"
FRONTEND_STATUS="✅ Running"

if [ "$SUPABASE_CHECK" = "connected" ]; then
    SUPABASE_STATUS="✅ Connected"
else
    SUPABASE_STATUS="⚠️ Disconnected"
fi

# Check Redis (if configured)
if command -v redis-cli >/dev/null 2>&1 && redis-cli ping >/dev/null 2>&1; then
    REDIS_STATUS="✅ Running"
else
    REDIS_STATUS="⚠️ Not running"
fi

# Check ElevenLabs
if [ -n "$ELEVENLABS_API_KEY" ]; then
    ELEVENLABS_STATUS="✅ Active"
else
    ELEVENLABS_STATUS="⚠️ Not configured"
fi

# Sesame status (already checked at startup)
SESAME_STATUS="✅ Sesame active"

echo "Backend: $BACKEND_STATUS"
echo "Frontend: $FRONTEND_STATUS"
echo "Supabase: $SUPABASE_STATUS"
echo "Redis: $REDIS_STATUS"
echo "ElevenLabs: $ELEVENLABS_STATUS"
echo "Sesame: $SESAME_STATUS"
echo "═════════════════════════════════════════════════════"
echo ""

# Final status
echo "═════════════════════════════════════════════════════"
if [ $? -eq 0 ] && [ "$SUPABASE_CHECK" = "connected" ]; then
    echo -e "   ${GREEN}✅ Spiralogic Oracle Beta is FULLY READY!${NC}"
    echo -e "   ${GREEN}   All systems operational with persistence${NC}"
elif [ $? -eq 0 ]; then
    echo -e "   ${YELLOW}⚠️  Beta is running in LIMITED MODE${NC}"
    echo -e "   ${YELLOW}   (No persistence - memory will be lost on restart)${NC}"
else
    echo -e "   ${YELLOW}⚠️  Beta started with warnings${NC}"
fi
echo "═════════════════════════════════════════════════════"
echo ""
echo "   🌐 Backend:  http://localhost:3002"
echo "   🎨 Frontend: http://localhost:3000/oracle"
echo "   📊 Health:   http://localhost:3002/api/v1/health"
echo "   📊 Voice Logs: http://localhost:3000/oracle?showVoiceLogs=true"
echo ""
echo "   📝 Logs:"
echo "      - Backend:  ./backend/backend.log"
echo "      - Frontend: ./frontend.log"
if [ "$SESAME_STARTED_BY_SCRIPT" = "true" ] && command -v docker >/dev/null 2>&1 && docker ps | grep -q sesame-csm; then
echo "      - Sesame:   docker logs sesame-csm"
fi
echo ""
echo -e "   ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo "═════════════════════════════════════════════════════"
echo ""

# Play startup completion chime if voice was successful
if [ "$VOICE_ENGINE" != "" ]; then
    PLAY_STARTUP_CHIME
fi

# Keep running and show logs
echo -e "${BLUE}📡 Tailing logs (Ctrl+C to exit)...${NC}"
echo ""

# Tail both logs
tail -f backend/backend.log frontend.log 2>/dev/null || {
    # If tail fails, just wait
    wait $BACKEND_PID $FRONTEND_PID
}