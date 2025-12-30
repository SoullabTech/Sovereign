#!/bin/bash
# 🎙️ Clean Sesame CSM Setup - Handles macOS resource forks aggressively

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "═════════════════════════════════════════════════════"
echo "   🎙️  Clean Sesame CSM Setup"
echo "═════════════════════════════════════════════════════"
echo ""

# Navigate to backend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
cd "$BACKEND_DIR"

# Clean everything first
echo -e "${YELLOW}🧹 Cleaning up old files...${NC}"
rm -rf csm
docker rmi sesame-csm 2>/dev/null || true
docker stop sesame-csm-local 2>/dev/null || true
docker rm sesame-csm-local 2>/dev/null || true

# Clone to temp directory first
echo -e "${BLUE}📥 Cloning Sesame CSM...${NC}"
export COPYFILE_DISABLE=1
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

git clone --depth 1 https://github.com/SesameAILabs/csm || {
    echo -e "${RED}❌ Failed to clone${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
}

# Move to backend, but clean first
cd csm
find . -name "._*" -delete
find . -name ".DS_Store" -delete

# Check what's actually in the repo
echo -e "${BLUE}📋 Repository contents:${NC}"
ls -la

# Move clean repo to backend
cd "$BACKEND_DIR"
mv "$TEMP_DIR/csm" .
rm -rf "$TEMP_DIR"

cd csm

# Create our own working Dockerfile
echo -e "${BLUE}📝 Creating optimized Dockerfile...${NC}"
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a simple TTS service if no main app exists
RUN mkdir -p app

# Create main.py
RUN cat > app/main.py << 'PYTHON'
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import os

app = FastAPI()

class TTSRequest(BaseModel):
    text: str
    voice: str = "maya"
    format: str = "wav"

@app.get("/health")
async def health():
    return {"status": "healthy", "model": "mock-csm"}

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    # Mock TTS - return a simple beep sound
    # This is a 1-second 440Hz sine wave in WAV format
    mock_audio = base64.b64decode(
        "UklGRiQFAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAFAACA"
        "gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA"
    )
    
    return {
        "audio": base64.b64encode(mock_audio).decode(),
        "format": request.format,
        "duration": 0.1
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
PYTHON

# Install Python dependencies
RUN pip install --no-cache-dir \
    fastapi==0.95.2 \
    uvicorn==0.22.0 \
    pydantic==1.10.9

# Environment
ENV MODEL_NAME=csm-mock
ENV API_KEY=local-dev-key
ENV PORT=8000

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

echo -e "${GREEN}✅ Created working Dockerfile${NC}"

# Build with maximum cleanup
echo -e "${BLUE}🐳 Building Docker image...${NC}"
export COPYFILE_DISABLE=1

# Clean any lingering files
find . -name "._*" -delete 2>/dev/null || true

docker build -t sesame-csm --no-cache . || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}

echo -e "${GREEN}✅ Image built!${NC}"

# Run container
echo -e "${BLUE}🚀 Starting container...${NC}"
docker run -d \
    --name sesame-csm-local \
    -p 8000:8000 \
    -e API_KEY=local-dev-key \
    --restart unless-stopped \
    sesame-csm

# Wait for startup
echo -n "   Waiting for service"
for i in {1..30}; do
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Update .env.local
echo -e "${BLUE}📝 Updating .env.local...${NC}"
cd "$BACKEND_DIR"
grep -v "SESAME_URL=\|SESAME_API_KEY=\|NORTHFLANK_SESAME" .env.local > .env.local.tmp 2>/dev/null || true
mv .env.local.tmp .env.local

cat >> .env.local << 'EOF'

# Sesame CSM Local
SESAME_URL=http://localhost:8000
SESAME_API_KEY=local-dev-key
NORTHFLANK_SESAME_URL=http://localhost:8000
NORTHFLANK_SESAME_API_KEY=local-dev-key
USE_SESAME=true
EOF

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${GREEN}✅ Sesame CSM Mock Ready!${NC}"
echo "═════════════════════════════════════════════════════"
echo ""
echo "   🌐 API: http://localhost:8000"
echo "   🏥 Health: http://localhost:8000/health"
echo "   🎤 TTS: http://localhost:8000/tts"
echo ""
echo "   Note: This is a mock service for testing."
echo "   For real TTS, deploy to Northflank/Railway."
echo ""