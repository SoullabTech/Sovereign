#!/bin/bash

# Production Startup Script - Zero Mock Mode, 99.9% Uptime Target
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Spiralogic Oracle Production Stack${NC}"
echo "================================================"

# Check if running in production mode
if [ "$1" != "--production" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not running in production mode${NC}"
    echo "Usage: ./start-production.sh --production"
    echo ""
    echo "This script will:"
    echo "  - Start Sesame CSM with model preloading"
    echo "  - Enable health monitoring and auto-recovery"
    echo "  - Use strict mode (no mock fallbacks)"
    echo "  - Target 99.9% uptime"
    exit 1
fi

# Function to check Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not found${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker daemon not running${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker is ready${NC}"
}

# Function to build images
build_images() {
    echo -e "${BLUE}📦 Building Docker images...${NC}"
    
    # Build Sesame production image
    if [ -f "Dockerfile.sesame-prod" ]; then
        echo "  Building Sesame CSM..."
        docker build -f Dockerfile.sesame-prod -t sesame-csm:production . || {
            echo -e "${RED}❌ Failed to build Sesame image${NC}"
            exit 1
        }
    fi
    
    # Build backend image
    echo "  Building Backend..."
    docker build -f Dockerfile -t spiralogic-backend:production . || {
        echo -e "${RED}❌ Failed to build backend image${NC}"
        exit 1
    }
    
    # Build frontend image
    echo "  Building Frontend..."
    cd .. && docker build -f Dockerfile.frontend -t spiralogic-frontend:production . || {
        echo -e "${RED}❌ Failed to build frontend image${NC}"
        exit 1
    }
    cd backend
    
    echo -e "${GREEN}✅ All images built successfully${NC}"
}

# Function to start services
start_services() {
    echo -e "${BLUE}🔧 Starting production services...${NC}"
    
    # Set production environment
    export NODE_ENV=production
    export TTS_ENABLE_FALLBACK=true
    export TTS_ENABLE_CACHE=true
    export SESAME_DOCKER=true
    export USE_GPU=false  # Set to true if GPU available
    
    # Start with docker-compose
    docker-compose -f ../docker-compose.prod.yml up -d || {
        echo -e "${RED}❌ Failed to start services${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Services started${NC}"
}

# Function to wait for services
wait_for_services() {
    echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
    
    # Wait for Sesame
    echo -n "  Sesame CSM: "
    for i in {1..60}; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            echo -e "${GREEN}Ready${NC}"
            break
        fi
        if [ $i -eq 60 ]; then
            echo -e "${RED}Failed${NC}"
            return 1
        fi
        sleep 2
    done
    
    # Test TTS endpoint
    echo -n "  TTS Engine: "
    response=$(curl -s -X POST http://localhost:8000/tts \
        -H "Content-Type: application/json" \
        -d '{"text":"Production test","voice":"maya"}' \
        -w "\n%{http_code}" | tail -n 1)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}Working${NC}"
    else
        echo -e "${RED}Failed (HTTP $response)${NC}"
        return 1
    fi
    
    # Wait for Backend
    echo -n "  Backend API: "
    for i in {1..30}; do
        if curl -s http://localhost:3002/health > /dev/null 2>&1; then
            echo -e "${GREEN}Ready${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}Failed${NC}"
            return 1
        fi
        sleep 1
    done
    
    # Wait for Frontend
    echo -n "  Frontend: "
    for i in {1..30}; do
        if curl -s http://localhost:3001 > /dev/null 2>&1; then
            echo -e "${GREEN}Ready${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}Failed${NC}"
            return 1
        fi
        sleep 1
    done
    
    return 0
}

# Function to run health checks
run_health_checks() {
    echo -e "${BLUE}🏥 Running health checks...${NC}"
    
    # Check Sesame uptime
    uptime=$(curl -s http://localhost:3002/api/monitoring/voice-metrics | jq -r '.sesame.uptime' 2>/dev/null || echo "0")
    echo "  Sesame Uptime: ${uptime}%"
    
    # Check latency
    latency=$(curl -s http://localhost:3002/api/monitoring/voice-metrics | jq -r '.sesame.requests.avgLatency' 2>/dev/null || echo "N/A")
    echo "  Average Latency: ${latency}ms"
    
    # Check fallback usage
    fallbacks=$(curl -s http://localhost:3002/api/monitoring/voice-metrics | jq -r '.fallbacks.elevenLabsUsed' 2>/dev/null || echo "0")
    echo "  Fallback Invocations: ${fallbacks}"
    
    echo -e "${GREEN}✅ Health checks complete${NC}"
}

# Function to display status
display_status() {
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 Spiralogic Oracle Production Stack Running${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "🌐 Services:"
    echo "  Frontend:    http://localhost:3001"
    echo "  Backend API: http://localhost:3002"
    echo "  Sesame TTS:  http://localhost:8000"
    echo ""
    echo "📊 Monitoring:"
    echo "  Health:      http://localhost:3002/api/monitoring/health"
    echo "  Metrics:     http://localhost:3002/api/monitoring/voice-metrics"
    echo "  Logs:        docker-compose -f ../docker-compose.prod.yml logs -f"
    echo ""
    echo "🛑 To stop:"
    echo "  docker-compose -f ../docker-compose.prod.yml down"
    echo ""
    echo -e "${YELLOW}⚠️  Production Mode Active:${NC}"
    echo "  - No mock audio fallbacks"
    echo "  - Strict error handling"
    echo "  - Auto-recovery enabled"
    echo "  - 99.9% uptime target"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Main execution
main() {
    cd "$(dirname "$0")/.."
    
    check_docker
    build_images
    start_services
    
    if wait_for_services; then
        run_health_checks
        display_status
        
        # Start monitoring in background
        echo -e "${BLUE}📡 Starting background monitoring...${NC}"
        nohup ./scripts/monitor-production.sh > logs/monitor.log 2>&1 &
        echo "  Monitor PID: $!"
        
        echo ""
        echo -e "${GREEN}✨ Production deployment successful!${NC}"
    else
        echo -e "${RED}❌ Production deployment failed${NC}"
        echo "Check logs: docker-compose -f ../docker-compose.prod.yml logs"
        exit 1
    fi
}

# Handle cleanup on exit
trap cleanup EXIT

cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down production stack...${NC}"
    # Graceful shutdown
    docker-compose -f ../docker-compose.prod.yml down
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Run main function
main "$@"