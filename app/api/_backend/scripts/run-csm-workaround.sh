#!/bin/bash
# 🎙️ CSM Docker Workaround - Builds in temp directory to avoid resource forks

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "═════════════════════════════════════════════════════"
echo "   🎙️  Sesame CSM (Workaround Mode)"
echo "═════════════════════════════════════════════════════"
echo ""

# Create temp directory in /tmp (not on external drive)
TEMP_DIR="/tmp/csm-build-$$"
mkdir -p "$TEMP_DIR"

echo -e "${BLUE}📦 Preparing clean build directory...${NC}"

# Copy only essential files
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

if [ -d "$BACKEND_DIR/csm" ]; then
    cd "$BACKEND_DIR/csm"
    # Copy Python files only
    cp -f *.py "$TEMP_DIR/" 2>/dev/null || true
    cp -f requirements.txt "$TEMP_DIR/" 2>/dev/null || true
    cp -f LICENSE "$TEMP_DIR/" 2>/dev/null || true
    cp -f README.md "$TEMP_DIR/" 2>/dev/null || true
fi

cd "$TEMP_DIR"

# Create simple Dockerfile
cat > Dockerfile << 'DOCKERFILE'
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install minimal dependencies for mock mode
RUN pip install --no-cache-dir \
    fastapi==0.95.2 \
    uvicorn==0.22.0 \
    pydantic==1.10.9 \
    numpy==1.24.3 \
    soundfile==0.12.1

# Create mock API
RUN cat > api_server.py << 'PYTHON'
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import numpy as np
import io
import soundfile as sf

app = FastAPI()

class TTSRequest(BaseModel):
    text: str
    voice: str = "maya"
    format: str = "wav"

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model": "csm-mock",
        "note": "Real CSM requires GPU and Hugging Face access"
    }

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    # Generate a simple chime sound
    duration = 0.5
    sample_rate = 16000
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Create a pleasant chime with harmonics
    freq1, freq2, freq3 = 523.25, 659.25, 783.99  # C, E, G
    audio = 0.3 * np.sin(2 * np.pi * freq1 * t)
    audio += 0.3 * np.sin(2 * np.pi * freq2 * t)
    audio += 0.3 * np.sin(2 * np.pi * freq3 * t)
    
    # Apply envelope
    envelope = np.exp(-3 * t)
    audio = audio * envelope
    
    # Convert to WAV
    buffer = io.BytesIO()
    sf.write(buffer, audio, sample_rate, format='WAV')
    buffer.seek(0)
    
    return {
        "audio": base64.b64encode(buffer.read()).decode(),
        "format": request.format,
        "duration": duration,
        "engine": "mock-chime"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
PYTHON

EXPOSE 8000
CMD ["python", "api_server.py"]
DOCKERFILE

# Stop old containers
docker stop sesame-csm-local 2>/dev/null || true
docker rm sesame-csm-local 2>/dev/null || true

# Build in temp directory
echo -e "${BLUE}🔨 Building Docker image...${NC}"
docker build -t sesame-csm-mock .

# Run container
echo -e "${BLUE}🚀 Starting container...${NC}"
docker run -d \
    --name sesame-csm-local \
    -p 8000:8000 \
    --restart unless-stopped \
    sesame-csm-mock

# Cleanup
rm -rf "$TEMP_DIR"

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

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${GREEN}✅ Sesame CSM Mock is Running${NC}"
echo "═════════════════════════════════════════════════════"
echo ""
echo "   🌐 API: http://localhost:8000"
echo "   🎤 This is a lightweight mock for testing"
echo ""
echo "   For real TTS with CSM:"
echo "   1. Use a machine with CUDA GPU"
echo "   2. Get Hugging Face access to Llama-3.2-1B & CSM-1B"
echo "   3. Deploy to cloud (Northflank/Railway)"
echo ""