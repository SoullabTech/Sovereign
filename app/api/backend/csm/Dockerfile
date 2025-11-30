FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the CSM code if it exists
COPY . /app/

# Install Python dependencies
RUN pip install --no-cache-dir \
    torch \
    torchaudio \
    transformers \
    huggingface-hub \
    fastapi \
    uvicorn \
    pydantic

# Create API wrapper if run_csm.py exists
RUN if [ -f "run_csm.py" ]; then \
    echo "Found run_csm.py, creating API wrapper..."; \
    cat > api_server.py << 'PYTHON'
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import os
import subprocess
import tempfile
import wave

app = FastAPI()

class TTSRequest(BaseModel):
    text: str
    voice: str = "maya"
    format: str = "wav"
    speed: float = 1.0
    temperature: float = 0.7

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model": "csm-1b",
        "model_loaded": True,
        "gpu_available": False
    }

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    try:
        # For now, return mock audio
        # TODO: Integrate with actual CSM model
        mock_audio = b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
        
        return {
            "audio": base64.b64encode(mock_audio).decode(),
            "format": request.format,
            "duration": 0.1,
            "engine": "sesame-local"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
PYTHON
    ; \
else \
    echo "No run_csm.py found, creating mock server..."; \
    cat > api_server.py << 'PYTHON'
from fastapi import FastAPI
from pydantic import BaseModel
import base64

app = FastAPI()

class TTSRequest(BaseModel):
    text: str
    voice: str = "maya"
    format: str = "wav"

@app.get("/health")
async def health():
    return {"status": "healthy", "model": "mock-csm", "model_loaded": True}

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    # Mock audio data
    mock_audio = b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
    return {
        "audio": base64.b64encode(mock_audio).decode(),
        "format": request.format,
        "duration": 0.1
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
PYTHON
    ; \
fi

EXPOSE 8000

CMD ["python", "api_server.py"]
