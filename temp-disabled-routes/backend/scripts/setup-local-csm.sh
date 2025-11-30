#!/bin/bash
# 🎤 Bulletproof Sesame CSM Local Setup
# Handles git clone, macOS cleanup, Docker build, and container management

set -e

# Preflight: Docker check
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/check-docker.sh" ]; then
    source "$SCRIPT_DIR/check-docker.sh"
    check_docker || exit 1
fi

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   🎤 ${PURPLE}Sesame CSM Local Setup${NC}"
echo "═════════════════════════════════════════════════════"
echo ""

# Navigate to backend directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
cd "$BACKEND_DIR"

echo -e "${BLUE}📍 Working directory: $BACKEND_DIR${NC}"
echo ""

# Docker check is handled by sourced utility above
echo ""

# Clean and clone repository
echo "📦 Setting up Sesame CSM repository..."

if [ -d "csm" ]; then
    echo -e "${YELLOW}⚠️  Existing csm directory found${NC}"
    echo -n "   Remove and re-clone? (y/N): "
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "   Removing old directory..."
        rm -rf csm
    else
        echo "   Using existing directory..."
    fi
fi

if [ ! -d "csm" ]; then
    echo "   Cloning Sesame CSM repository..."
    # Disable resource fork creation during clone
    export COPYFILE_DISABLE=1
    export GIT_DIR_MODE=0755
    export GIT_WORK_TREE_MODE=0755
    
    git clone --depth 1 https://github.com/SesameAILabs/csm || {
        echo -e "${RED}❌ Failed to clone repository${NC}"
        echo "   Check your internet connection"
        exit 1
    }
fi

cd csm
echo -e "${GREEN}✓ Repository ready${NC}"
echo ""

# Aggressive cleanup of macOS resource fork files
echo "🧹 Cleaning macOS metadata files..."
export COPYFILE_DISABLE=1
find . -name "._*" -type f -delete 2>/dev/null || true
find .git -name "._*" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Extra cleanup for git objects
if [ -d ".git/objects" ]; then
    find .git/objects -name "._*" -print -delete 2>/dev/null || true
fi

echo -e "${GREEN}✓ Cleaned metadata files${NC}"
echo ""

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo -e "${YELLOW}⚠️  No Dockerfile found, creating one...${NC}"
    cat > Dockerfile << 'EOF'
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Environment variables
ENV MODEL_NAME=csm-1b
ENV API_KEY=local-dev-key
ENV PORT=8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the service
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF
    echo -e "${GREEN}✓ Created Dockerfile${NC}"
fi

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo -e "${YELLOW}⚠️  No requirements.txt found, creating one...${NC}"
    cat > requirements.txt << 'EOF'
torch>=2.0.0
transformers>=4.30.0
fastapi>=0.95.0
uvicorn>=0.20.0
pydantic>=2.0.0
numpy>=1.24.0
scipy>=1.10.0
soundfile>=0.12.0
EOF
    echo -e "${GREEN}✓ Created requirements.txt${NC}"
fi

# Build Docker image
echo "🐳 Building Docker image..."
echo "   This may take 5-10 minutes the first time..."

IMAGE_NAME="sesame-csm"
CONTAINER_NAME="sesame-csm-local"

# Stop existing container if running
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}   Stopping existing container...${NC}"
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
fi

# Build with explicit Dockerfile and COPYFILE_DISABLE
export COPYFILE_DISABLE=1
if COPYFILE_DISABLE=1 docker build -t "$IMAGE_NAME" -f Dockerfile . ; then
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    echo ""
    echo "Attempting cleanup and retry..."
    
    # Additional cleanup before retry
    find . -name "._*" -print -delete 2>/dev/null || true
    find .git -name "._*" -print -delete 2>/dev/null || true
    
    # Retry with --no-cache
    echo -e "${YELLOW}Retrying with --no-cache...${NC}"
    if COPYFILE_DISABLE=1 docker build --no-cache -t "$IMAGE_NAME" -f Dockerfile . ; then
        echo -e "${GREEN}✅ Docker image built successfully on retry${NC}"
    else
        echo -e "${RED}❌ Docker build failed after retry${NC}"
        echo ""
        echo "Common fixes:"
        echo "1. Check for resource fork files: find . -name '._*' -ls"
        echo "2. Ensure Docker has enough disk space"
        echo "3. Try: docker system prune -a (warning: removes all unused images)"
        exit 1
    fi
fi

echo ""

# Run container
echo "🚀 Starting Sesame CSM container..."

docker run -d \
    --name "$CONTAINER_NAME" \
    -p 8000:8000 \
    -e MODEL_NAME=csm-1b \
    -e API_KEY=local-dev-key \
    --restart unless-stopped \
    "$IMAGE_NAME"

# Wait for container to be ready
echo "   Waiting for model to load..."
echo -n "   "
for i in {1..60}; do
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        echo -e "${GREEN}✅ Sesame CSM is ready!${NC}"
        break
    fi
    echo -n "."
    sleep 2
    
    if [ $i -eq 60 ]; then
        echo -e " ${RED}✗${NC}"
        echo -e "${RED}❌ Container failed to start${NC}"
        echo "   Check logs: docker logs $CONTAINER_NAME"
        exit 1
    fi
done

echo ""

# Update environment file
echo "📝 Updating environment configuration..."

ENV_FILE="$BACKEND_DIR/.env.local"
if [ -f "$ENV_FILE" ]; then
    # Backup existing file
    cp "$ENV_FILE" "$ENV_FILE.backup"
    
    # Update or add Sesame configuration
    grep -v "^SESAME_URL=" "$ENV_FILE" | grep -v "^SESAME_API_KEY=" > "$ENV_FILE.tmp"
    mv "$ENV_FILE.tmp" "$ENV_FILE"
fi

# Add Sesame configuration
cat >> "$ENV_FILE" << EOF

# Sesame CSM Local Configuration
SESAME_URL=http://localhost:8000
SESAME_API_KEY=local-dev-key
SESAME_ENABLED=true
SESAME_MODE=local
EOF

echo -e "${GREEN}✓ Environment updated${NC}"
echo ""

# Test the deployment
echo "🧪 Testing Sesame CSM..."

# Create test script
cat > "$BACKEND_DIR/scripts/test-sesame-local.sh" << 'EOF'
#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 Testing Sesame CSM at http://localhost:8000"

# Health check
echo -n "   Health check: "
if curl -s http://localhost:8000/health | grep -q "healthy\|ok\|ready"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# TTS test
echo -n "   Voice synthesis: "
RESPONSE=$(curl -s -X POST http://localhost:8000/tts \
    -H "Authorization: Bearer local-dev-key" \
    -H "Content-Type: application/json" \
    -d '{
        "text": "Hello, I am Maya. Welcome to the Oracle.",
        "voice": "maya",
        "format": "wav"
    }' -o test-voice.wav -w "%{http_code}")

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC}"
    echo ""
    echo "   Voice file saved: test-voice.wav"
    
    # Play on macOS
    if [[ "$OSTYPE" == "darwin"* ]] && [ -f "test-voice.wav" ]; then
        echo "   Playing audio..."
        afplay test-voice.wav
    fi
else
    echo -e "${RED}✗ (HTTP $RESPONSE)${NC}"
fi
EOF

chmod +x "$BACKEND_DIR/scripts/test-sesame-local.sh"

# Run the test
"$BACKEND_DIR/scripts/test-sesame-local.sh"

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   🎉 ${GREEN}Sesame CSM Setup Complete!${NC}"
echo "═════════════════════════════════════════════════════"
echo ""
echo "🎤 Sesame CSM is running locally at: http://localhost:8000"
echo ""
echo "📋 Quick commands:"
echo "   View logs:    docker logs -f $CONTAINER_NAME"
echo "   Stop:         docker stop $CONTAINER_NAME"  
echo "   Start:        docker start $CONTAINER_NAME"
echo "   Test:         ./scripts/test-sesame-local.sh"
echo ""
echo "🚀 Your Maya voice system is now 100% local!"
echo ""

# Return to original directory
cd "$BACKEND_DIR"