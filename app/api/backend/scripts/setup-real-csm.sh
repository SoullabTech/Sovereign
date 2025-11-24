#!/bin/bash
# 🎙️ Real Sesame CSM Setup - CPU Version
# Runs the actual CSM model locally (slower on CPU)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "═════════════════════════════════════════════════════"
echo "   🎙️  Setting up Real Sesame CSM (CPU Mode)"
echo "═════════════════════════════════════════════════════"
echo ""

# Check for Hugging Face token
if [ -z "$HUGGINGFACE_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  No HUGGINGFACE_TOKEN found${NC}"
    echo ""
    echo "To use the real CSM model, you need:"
    echo "1. Create a Hugging Face account at https://huggingface.co"
    echo "2. Request access to:"
    echo "   - https://huggingface.co/meta-llama/Llama-3.2-1B"
    echo "   - https://huggingface.co/sesame/csm-1b"
    echo "3. Create a token at https://huggingface.co/settings/tokens"
    echo "4. Add to .env.local:"
    echo "   HUGGINGFACE_TOKEN=your-token-here"
    echo ""
    echo -e "${BLUE}For now, using the mock service...${NC}"
    exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
cd "$BACKEND_DIR"

# Create Python virtual environment
echo -e "${BLUE}📦 Setting up Python environment...${NC}"
if [ -d "csm_venv" ]; then
    echo -e "${YELLOW}⚠️  Removing old virtual environment...${NC}"
    rm -rf csm_venv
fi

python3 -m venv csm_venv
source csm_venv/bin/activate

# Install dependencies
echo -e "${BLUE}📥 Installing dependencies...${NC}"
pip install --upgrade pip

# Install PyTorch CPU version
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install other requirements
pip install \
    transformers \
    tokenizers \
    huggingface-hub \
    fastapi \
    uvicorn \
    numpy \
    scipy \
    soundfile

# Create API wrapper for CSM
echo -e "${BLUE}📝 Creating CSM API wrapper...${NC}"
cat > "$BACKEND_DIR/csm_api.py" << 'PYTHON'
import os
import sys
import base64
import io
import torch
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import soundfile as sf
from transformers import pipeline
import logging

# Disable Mimi lazy compilation
os.environ["NO_TORCH_COMPILE"] = "1"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Global model variable
tts_pipeline = None

class TTSRequest(BaseModel):
    text: str
    voice: str = "maya"
    format: str = "wav"
    temperature: float = 0.7
    speed: float = 1.0

def load_model():
    """Load CSM model on startup"""
    global tts_pipeline
    try:
        logger.info("Loading CSM model...")
        # Try to use the CSM model directly
        tts_pipeline = pipeline(
            "text-to-speech",
            model="sesame/csm-1b",
            device="cpu",
            torch_dtype=torch.float32
        )
        logger.info("CSM model loaded successfully")
        return True
    except Exception as e:
        logger.warning(f"Could not load CSM model: {e}")
        logger.info("Falling back to mock mode")
        return False

@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    load_model()

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model": "csm-1b" if tts_pipeline else "mock",
        "model_loaded": tts_pipeline is not None,
        "device": "cpu"
    }

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    try:
        if tts_pipeline:
            # Use real model
            logger.info(f"Generating speech for: {request.text[:50]}...")
            
            # Generate audio
            result = tts_pipeline(
                request.text,
                forward_params={
                    "temperature": request.temperature,
                }
            )
            
            # Extract audio data
            audio_data = result["audio"]
            sampling_rate = result.get("sampling_rate", 16000)
            
            # Convert to WAV format
            buffer = io.BytesIO()
            sf.write(buffer, audio_data, sampling_rate, format='WAV')
            buffer.seek(0)
            audio_bytes = buffer.read()
            
            return {
                "audio": base64.b64encode(audio_bytes).decode(),
                "format": request.format,
                "duration": len(audio_data) / sampling_rate,
                "engine": "csm-cpu"
            }
        else:
            # Mock mode
            logger.info("Using mock audio response")
            # Generate a simple tone
            duration = 1.0
            sample_rate = 16000
            t = np.linspace(0, duration, int(sample_rate * duration))
            frequency = 440  # A4 note
            audio = 0.5 * np.sin(2 * np.pi * frequency * t)
            
            buffer = io.BytesIO()
            sf.write(buffer, audio, sample_rate, format='WAV')
            buffer.seek(0)
            audio_bytes = buffer.read()
            
            return {
                "audio": base64.b64encode(audio_bytes).decode(),
                "format": request.format,
                "duration": duration,
                "engine": "mock"
            }
            
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
PYTHON

# Create startup script
cat > "$BACKEND_DIR/start-csm.sh" << 'BASH'
#!/bin/bash
cd "$(dirname "$0")"
source csm_venv/bin/activate
export HUGGINGFACE_TOKEN="$HUGGINGFACE_TOKEN"
export NO_TORCH_COMPILE=1
python csm_api.py
BASH
chmod +x "$BACKEND_DIR/start-csm.sh"

# Update .env.local
echo -e "${BLUE}📝 Updating .env.local...${NC}"
grep -v "SESAME_URL=\|SESAME_API_KEY=\|NORTHFLANK_SESAME" .env.local > .env.local.tmp 2>/dev/null || true
mv .env.local.tmp .env.local

cat >> .env.local << 'EOF'

# Sesame CSM Local (Real Model)
SESAME_URL=http://localhost:8000
SESAME_API_KEY=local-dev-key
NORTHFLANK_SESAME_URL=http://localhost:8000
NORTHFLANK_SESAME_API_KEY=local-dev-key
USE_SESAME=true
EOF

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${GREEN}✅ Real CSM Setup Complete!${NC}"
echo "═════════════════════════════════════════════════════"
echo ""
echo "To run the real CSM:"
echo -e "${YELLOW}./start-csm.sh${NC}"
echo ""
echo "Note: CPU inference will be slow (~5-10 seconds per generation)"
echo "For faster inference, use a CUDA GPU or deploy to cloud."
echo ""
echo "The API will start in mock mode if models can't be loaded."
echo ""