#!/bin/bash

# Enhanced startup script with Sesame model loading verification
# Ensures Sesame is fully loaded before starting other services

set -e
source "$(dirname "$0")/ensure-docker.sh"

echo "🚀 Starting Enhanced SpiraLogic Oracle System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Function to wait for Sesame to be ready
wait_for_sesame() {
    echo -e "${BLUE}⏳ Waiting for Sesame CSM to load model...${NC}"
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        # Test if Sesame is responsive with a simple health check
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health | grep -q "200"; then
            # Try a test TTS call to ensure model is loaded
            response=$(curl -s -X POST http://localhost:8000/tts \
                -H "Content-Type: application/json" \
                -d '{"text": "Test", "voice": "maya"}' \
                -w "\n%{http_code}" | tail -n 1)
            
            if [ "$response" = "200" ]; then
                echo -e "${GREEN}✅ Sesame CSM is ready and model is loaded!${NC}"
                return 0
            fi
        fi
        
        echo -e "${YELLOW}⏳ Sesame not ready yet (attempt $((attempt+1))/$max_attempts)...${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ Sesame failed to start or load model${NC}"
    return 1
}

# Kill any existing processes
echo -e "${BLUE}🔄 Cleaning up existing processes...${NC}"
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
pkill -f "sesame-csm" 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

sleep 2

# Start Sesame CSM first
echo -e "${BLUE}🎙️ Starting Sesame CSM...${NC}"
cd "$(dirname "$0")/.."

# Check if running in Docker
if docker ps | grep -q sesame-csm; then
    echo -e "${YELLOW}⚠️ Sesame CSM already running in Docker${NC}"
else
    # Try Docker first
    if command -v docker &> /dev/null && docker info &> /dev/null; then
        echo -e "${BLUE}🐳 Starting Sesame CSM in Docker...${NC}"
        docker run -d --rm \
            --name sesame-csm \
            -p 8000:8000 \
            -e MODEL_NAME=suno/bark-small \
            -e USE_GPU=False \
            -e PRELOAD_MODEL=true \
            -e LOG_LEVEL=INFO \
            -v $(pwd)/models:/app/models \
            sesame-csm:latest 2>/dev/null || {
            echo -e "${YELLOW}⚠️ Docker failed, trying local Python...${NC}"
            # Fallback to Python
            if [ -d "sesame_csm_openai" ]; then
                cd sesame_csm_openai
                source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
                pip install -q -r requirements.txt
                PRELOAD_MODEL=true python app.py > ../sesame.log 2>&1 &
                cd ..
            fi
        }
    else
        # Use Python directly
        if [ -d "sesame_csm_openai" ]; then
            echo -e "${BLUE}🐍 Starting Sesame CSM with Python...${NC}"
            cd sesame_csm_openai
            source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
            pip install -q -r requirements.txt
            PRELOAD_MODEL=true python app.py > ../sesame.log 2>&1 &
            cd ..
        fi
    fi
fi

# Wait for Sesame to be fully ready
wait_for_sesame || {
    echo -e "${RED}❌ Failed to start Sesame CSM${NC}"
    echo -e "${YELLOW}💡 Falling back to mock mode...${NC}"
}

# Start Backend
echo -e "${BLUE}🚀 Starting Backend (port 3002)...${NC}"
cd "$(dirname "$0")/.."
PORT=3002 npm start > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo -e "${BLUE}⏳ Waiting for Backend...${NC}"
attempt=0
while [ $attempt -lt 15 ]; do
    if check_port 3002; then
        echo -e "${GREEN}✅ Backend is running on port 3002${NC}"
        break
    fi
    sleep 1
    ((attempt++))
done

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend (port 3001)...${NC}"
cd "$(dirname "$0")/../.."
PORT=3001 npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend
echo -e "${BLUE}⏳ Waiting for Frontend...${NC}"
attempt=0
while [ $attempt -lt 15 ]; do
    if check_port 3001; then
        echo -e "${GREEN}✅ Frontend is running on port 3001${NC}"
        break
    fi
    sleep 1
    ((attempt++))
done

# Final status check
echo -e "\n${GREEN}🎉 System Status:${NC}"
echo -e "═══════════════════════════════════"

if check_port 8000; then
    echo -e "✅ Sesame CSM:  ${GREEN}http://localhost:8000${NC}"
    # Test TTS endpoint
    test_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8000/tts \
        -H "Content-Type: application/json" \
        -d '{"text": "System ready", "voice": "maya"}')
    if [ "$test_response" = "200" ]; then
        echo -e "   └─ TTS:      ${GREEN}✓ Working${NC}"
    else
        echo -e "   └─ TTS:      ${YELLOW}⚠ Not responding (mock mode)${NC}"
    fi
else
    echo -e "❌ Sesame CSM:  ${RED}Not running (using mock)${NC}"
fi

if check_port 3002; then
    echo -e "✅ Backend:     ${GREEN}http://localhost:3002${NC}"
else
    echo -e "❌ Backend:     ${RED}Not running${NC}"
fi

if check_port 3001; then
    echo -e "✅ Frontend:    ${GREEN}http://localhost:3001${NC}"
else
    echo -e "❌ Frontend:    ${RED}Not running${NC}"
fi

echo -e "═══════════════════════════════════"
echo -e "\n${GREEN}📺 View logs:${NC}"
echo -e "  Backend:  ${BLUE}tail -f backend/backend.log${NC}"
echo -e "  Frontend: ${BLUE}tail -f frontend.log${NC}"
echo -e "  Sesame:   ${BLUE}tail -f backend/sesame.log${NC}"

echo -e "\n${YELLOW}💡 Test the streaming voice:${NC}"
echo -e "  ${BLUE}http://localhost:3001/test-streaming${NC}"

echo -e "\n${RED}🛑 To stop all services:${NC}"
echo -e "  ${BLUE}pkill -f 'npm run dev' && pkill -f 'npm start' && docker stop sesame-csm${NC}"

# Keep script running
echo -e "\n${GREEN}✨ System is running. Press Ctrl+C to stop all services.${NC}"

# Trap Ctrl+C to cleanup
trap cleanup INT

cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    docker stop sesame-csm 2>/dev/null
    pkill -f "python app.py" 2>/dev/null
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Wait indefinitely
wait