#!/bin/bash
# 🎙️ Run Real Sesame CSM in Docker
# Uses the actual CSM repository with proper dependencies

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "═════════════════════════════════════════════════════"
echo "   🎙️  Sesame CSM Docker Runner"
echo "═════════════════════════════════════════════════════"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
cd "$BACKEND_DIR"

# Check for CSM directory
if [ ! -d "csm" ]; then
    echo -e "${RED}❌ CSM directory not found${NC}"
    echo "Run: ./scripts/setup-csm-clean.sh first"
    exit 1
fi

cd csm

# Clean resource forks
echo -e "${BLUE}🧹 Cleaning macOS files...${NC}"
find . -name "._*" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Create proper Dockerfile for real CSM
echo -e "${BLUE}📝 Creating CSM Dockerfile...${NC}"
cat > Dockerfile.real << 'DOCKERFILE'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including build tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    ffmpeg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
# Note: This will use CPU versions of PyTorch
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir \
        transformers \
        tokenizers \
        huggingface_hub \
        soundfile \
        numpy \
        scipy \
        fastapi \
        uvicorn \
        pydantic

# Copy application code
COPY . .

# Environment
ENV NO_TORCH_COMPILE=1
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

# Run the API wrapper
CMD ["python", "api_wrapper.py"]
DOCKERFILE

# Stop existing container
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker stop sesame-csm-local 2>/dev/null || true
docker rm sesame-csm-local 2>/dev/null || true
docker rmi sesame-csm-real 2>/dev/null || true

# Build image
echo -e "${BLUE}🔨 Building Docker image...${NC}"
echo -e "${YELLOW}This will take a few minutes...${NC}"

export COPYFILE_DISABLE=1
if ! docker build -t sesame-csm-real -f Dockerfile.real . ; then
    echo -e "${RED}❌ Build failed${NC}"
    echo "Trying with --no-cache..."
    docker build --no-cache -t sesame-csm-real -f Dockerfile.real .
fi

echo -e "${GREEN}✅ Image built${NC}"

# Get Hugging Face token from env
HF_TOKEN="${HUGGINGFACE_TOKEN:-}"
if [ -z "$HF_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  No HUGGINGFACE_TOKEN found${NC}"
    echo "The model will run in mock mode without a token."
    echo ""
    echo "To use real TTS, add to .env.local:"
    echo "HUGGINGFACE_TOKEN=your-token-here"
fi

# Run container
echo -e "${BLUE}🚀 Starting CSM container...${NC}"
docker run -d \
    --name sesame-csm-local \
    -p 8000:8000 \
    -e HUGGINGFACE_TOKEN="$HF_TOKEN" \
    -e API_KEY=local-dev-key \
    --restart unless-stopped \
    sesame-csm-real

# Wait for startup
echo -n "   Waiting for CSM to start"
for i in {1..60}; do
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Check status
echo ""
echo -e "${BLUE}🔍 Checking CSM status...${NC}"
HEALTH=$(curl -s http://localhost:8000/health)
echo "$HEALTH" | python3 -m json.tool

# Update env
cd "$BACKEND_DIR"
grep -v "SESAME_URL=\|SESAME_API_KEY=" .env.local > .env.local.tmp 2>/dev/null || true
mv .env.local.tmp .env.local
cat >> .env.local << 'EOF'

# Sesame CSM (Real Model in Docker)
SESAME_URL=http://localhost:8000
SESAME_API_KEY=local-dev-key
NORTHFLANK_SESAME_URL=http://localhost:8000
NORTHFLANK_SESAME_API_KEY=local-dev-key
EOF

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${GREEN}✅ Sesame CSM is Running!${NC}"
echo "═════════════════════════════════════════════════════"
echo ""
echo "   🌐 API: http://localhost:8000"
echo "   📊 Health: http://localhost:8000/health"
echo "   🎤 Voices: http://localhost:8000/voices"
echo ""
echo "   Logs: docker logs -f sesame-csm-local"
echo "   Stop: docker stop sesame-csm-local"
echo ""

# Test it
echo -e "${BLUE}Testing TTS...${NC}"
cd "$BACKEND_DIR"
echo "1" | ./scripts/test-sesame.sh || true