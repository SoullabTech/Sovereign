#!/bin/bash

# Deploy Sesame CSM - Full Production Deployment
echo "🚀 Deploying Sesame CSM with Real Voice Synthesis..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SESAME_PORT=${SESAME_PORT:-8000}
SESAME_HOST=${SESAME_HOST:-localhost}
CONTAINER_NAME="sesame-csm"
IMAGE_NAME="sesame-csm-prod"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi
}

# Function to stop existing container
stop_existing() {
    echo "Stopping existing Sesame container..."
    docker stop $CONTAINER_NAME 2>/dev/null
    docker rm $CONTAINER_NAME 2>/dev/null
}

# Function to build Docker image
build_image() {
    echo -e "${YELLOW}Building Sesame CSM image...${NC}"
    docker build -f Dockerfile.simple -t $IMAGE_NAME . || {
        echo -e "${RED}Failed to build Docker image${NC}"
        exit 1
    }
}

# Function to run container
run_container() {
    echo -e "${YELLOW}Starting Sesame CSM container...${NC}"
    docker run -d \
        --name $CONTAINER_NAME \
        -p $SESAME_PORT:8000 \
        -e SESAME_PORT=8000 \
        -e SERVICE_MODE=live \
        -e SESAME_HOST=$SESAME_HOST \
        --restart unless-stopped \
        $IMAGE_NAME
}

# Function to wait for service to be ready
wait_for_service() {
    echo "Waiting for Sesame to initialize..."
    for i in {1..30}; do
        if curl -s http://$SESAME_HOST:$SESAME_PORT/health | grep -q "healthy"; then
            echo -e "${GREEN}✅ Sesame CSM is ready!${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
    done
    echo -e "${RED}❌ Sesame failed to start${NC}"
    return 1
}

# Function to test the service
test_service() {
    echo -e "\n${YELLOW}Testing Sesame CSM...${NC}"
    
    # Test health endpoint
    echo "Testing health endpoint..."
    HEALTH=$(curl -s http://$SESAME_HOST:$SESAME_PORT/health)
    echo "Health: $HEALTH" | head -1
    
    # Test TTS
    echo -e "\nTesting voice synthesis..."
    RESPONSE=$(curl -s -X POST http://$SESAME_HOST:$SESAME_PORT/tts \
        -H "Content-Type: application/json" \
        -d '{
            "text": "Sesame voice synthesis is now active.",
            "voice": "maya",
            "element": "aether"
        }')
    
    if echo "$RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✅ Voice synthesis working!${NC}"
    else
        echo -e "${RED}❌ Voice synthesis failed${NC}"
        echo "Response: $RESPONSE"
    fi
    
    # Test CI Shaping
    echo -e "\nTesting conversational intelligence..."
    CI_RESPONSE=$(curl -s -X POST http://$SESAME_HOST:$SESAME_PORT/ci/shape \
        -H "Content-Type: application/json" \
        -d '{
            "text": "Welcome to your journey",
            "style": "water",
            "archetype": "guide"
        }')
    
    if echo "$CI_RESPONSE" | grep -q "shapingApplied"; then
        echo -e "${GREEN}✅ CI shaping working!${NC}"
    else
        echo -e "${RED}❌ CI shaping failed${NC}"
    fi
}

# Function to update environment variables
update_env() {
    echo -e "\n${YELLOW}Updating environment configuration...${NC}"
    
    ENV_FILE="../../../../.env.local"
    if [ -f "$ENV_FILE" ]; then
        # Backup current env
        cp $ENV_FILE $ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)
        
        # Update Sesame configuration
        sed -i.bak 's/SESAME_ENABLED=false/SESAME_ENABLED=true/' $ENV_FILE
        sed -i.bak 's/SESAME_MODE=offline/SESAME_MODE=live/' $ENV_FILE
        sed -i.bak 's/USE_SESAME=false/USE_SESAME=true/' $ENV_FILE
        sed -i.bak "s|SESAME_URL=.*|SESAME_URL=http://$SESAME_HOST:$SESAME_PORT|" $ENV_FILE
        sed -i.bak "s|SESAME_SELF_HOSTED_URL=.*|SESAME_SELF_HOSTED_URL=http://$SESAME_HOST:$SESAME_PORT|" $ENV_FILE
        
        echo -e "${GREEN}✅ Environment configuration updated${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.local not found - please update manually${NC}"
    fi
}

# Function to show service info
show_info() {
    echo -e "\n${GREEN}════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Sesame CSM Deployment Complete!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Service Information:"
    echo "  Status: Active"
    echo "  Mode: Live Voice Synthesis"
    echo "  Engine: Google TTS"
    echo ""
    echo "Service URLs:"
    echo "  Health: http://$SESAME_HOST:$SESAME_PORT/health"
    echo "  TTS: http://$SESAME_HOST:$SESAME_PORT/tts"
    echo "  Generate: http://$SESAME_HOST:$SESAME_PORT/api/v1/generate"
    echo "  CI Shaping: http://$SESAME_HOST:$SESAME_PORT/ci/shape"
    echo "  Voices: http://$SESAME_HOST:$SESAME_PORT/voices"
    echo ""
    echo "Available Voices:"
    echo "  - maya (warm, friendly)"
    echo "  - oracle (wise, measured)"
    echo "  - guide (helpful, clear)"
    echo ""
    echo "Container Management:"
    echo "  View logs: docker logs -f $CONTAINER_NAME"
    echo "  Stop: docker stop $CONTAINER_NAME"
    echo "  Restart: docker restart $CONTAINER_NAME"
    echo "  Remove: docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
}

# Main deployment flow
main() {
    echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}     Sesame CSM - Voice Synthesis Deployment${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Check prerequisites
    check_docker
    
    # Stop existing container
    stop_existing
    
    # Build new image
    build_image
    
    # Run container
    run_container
    
    # Wait for service
    if wait_for_service; then
        # Test service
        test_service
        
        # Update environment
        update_env
        
        # Show info
        show_info
    else
        echo -e "${RED}Deployment failed. Check Docker logs:${NC}"
        echo "docker logs $CONTAINER_NAME"
        exit 1
    fi
}

# Run main function
main