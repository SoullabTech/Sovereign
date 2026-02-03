#!/usr/bin/env python3
"""
CSM API Wrapper - Local Mock TTS Service for Maya
"""
import os
import sys
import base64
import io
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel
import json
import hashlib
import time
import re
from typing import Dict, List, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Sesame CSM Local", version="1.0.0")

# Service status
SERVICE_MODE = "mock"  # Will be "live" when CSM is available
MODEL_LOADED = True  # Set to True for mock mode to enable Sesame

class TTSRequest(BaseModel):
    text: str
    voice: str = "maya"
    format: str = "wav"
    temperature: float = 0.7
    speed: float = 1.0
    prompt_style: str = "conversational_a"

class TTSResponse(BaseModel):
    success: bool
    audio_url: Optional[str] = None
    duration_ms: Optional[int] = None
    service: str = "sesame-local"
    cached: bool = False

class CIShapeRequest(BaseModel):
    text: str
    style: str = "neutral"  # element: fire, water, earth, air, aether
    archetype: str = "guide"  # sage, oracle, companion, etc
    meta: Dict[str, Any] = {}

class CIShapeResponse(BaseModel):
    text: str  # Shaped text with SSML tags
    shapingApplied: bool = True
    tags: List[str] = []
    processingTime: int = 0
    raw: str = ""  # Original text
    shaped: str = ""  # Shaped text (same as text field)

def generate_mock_audio_url(text: str, voice: str) -> str:
    """Generate a mock audio URL for testing"""
    text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
    # Return absolute URL for better cross-origin compatibility
    host = os.environ.get('SESAME_HOST', 'localhost')
    port = os.environ.get('SESAME_PORT', '8000')
    return f"http://{host}:{port}/audio/mock/{voice}_{text_hash}.wav"

@app.get("/")
async def root():
    """Root endpoint with service info"""
    return {
        "service": "Sesame CSM Local",
        "mode": SERVICE_MODE,
        "model_loaded": MODEL_LOADED,
        "endpoints": {
            "health": "/health",
            "generate": "/api/v1/generate",
            "tts": "/tts"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "mode": SERVICE_MODE,
        "model_loaded": MODEL_LOADED,
        "service": "sesame-csm-local",
        "version": "1.0.0",
        "uptime": time.time()
    }

@app.post("/api/v1/generate")
async def generate_speech(request: TTSRequest):
    """Generate speech from text - Main TTS endpoint"""
    try:
        logger.info(f"TTS request: {request.text[:50]}... (voice: {request.voice})")
        
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Mock response for now
        mock_audio_url = generate_mock_audio_url(request.text, request.voice)
        estimated_duration = len(request.text) * 50  # ~50ms per character
        
        response = TTSResponse(
            success=True,
            audio_url=mock_audio_url,
            duration_ms=estimated_duration,
            service="sesame-local-mock",
            cached=False
        )
        
        logger.info(f"Generated mock audio URL: {mock_audio_url}")
        return response
        
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tts")
async def tts_endpoint(request: TTSRequest):
    """Alternative TTS endpoint for compatibility"""
    return await generate_speech(request)

@app.get("/audio/mock/{filename}")
async def serve_mock_audio(filename: str):
    """Serve mock audio files"""
    # Generate a simple beep tone as placeholder
    logger.info(f"Serving mock audio: {filename}")
    
    # Return a minimal WAV header for a 1-second silence
    # This is just a placeholder - in production this would be real audio
    wav_header = bytes([
        0x52, 0x49, 0x46, 0x46,  # "RIFF"
        0x24, 0x08, 0x00, 0x00,  # File size
        0x57, 0x41, 0x56, 0x45,  # "WAVE" 
        0x66, 0x6d, 0x74, 0x20,  # "fmt "
        0x10, 0x00, 0x00, 0x00,  # Format chunk size
        0x01, 0x00, 0x01, 0x00,  # PCM, mono
        0x40, 0x1f, 0x00, 0x00,  # Sample rate (8000 Hz)
        0x80, 0x3e, 0x00, 0x00,  # Byte rate  
        0x02, 0x00, 0x10, 0x00,  # Block align, bits per sample
        0x64, 0x61, 0x74, 0x61,  # "data"
        0x00, 0x08, 0x00, 0x00   # Data size
    ])
    
    # Add 1 second of silence (8000 samples at 16-bit)
    silence = b'\x00' * 16000
    
    return Response(
        content=wav_header + silence,
        media_type="audio/wav",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Cache-Control": "public, max-age=3600"
        }
    )

def apply_elemental_shaping(text: str, element: str, archetype: str) -> tuple[str, list]:
    """Apply elemental prosody shaping to text"""
    shaped = text
    tags = []
    
    # Element-based prosody rules
    elemental_rules = {
        "fire": {
            "pauses": {"short": "200ms", "long": "400ms"},
            "rate": "fast",
            "pitch": "high",
            "energy": "strong"
        },
        "water": {
            "pauses": {"short": "400ms", "long": "800ms"},
            "rate": "medium",
            "pitch": "medium",
            "energy": "moderate"
        },
        "earth": {
            "pauses": {"short": "500ms", "long": "1000ms"},
            "rate": "slow",
            "pitch": "low",
            "energy": "moderate"
        },
        "air": {
            "pauses": {"short": "300ms", "long": "600ms"},
            "rate": "fast",
            "pitch": "high",
            "energy": "light"
        },
        "aether": {
            "pauses": {"short": "600ms", "long": "1200ms"},
            "rate": "slow",
            "pitch": "medium",
            "energy": "soft"
        }
    }
    
    rules = elemental_rules.get(element.lower(), elemental_rules["aether"])
    
    # Add pauses after sentences
    shaped = re.sub(r'\. ', f'. <pause duration="{rules["pauses"]["long"]}"/> ', shaped)
    shaped = re.sub(r'\? ', f'? <pause duration="{rules["pauses"]["long"]}"/> ', shaped)
    shaped = re.sub(r'! ', f'! <pause duration="{rules["pauses"]["short"]}"/> ', shaped)
    shaped = re.sub(r', ', f', <pause duration="{rules["pauses"]["short"]}"/> ', shaped)
    
    # Add prosody wrapper
    if element != "neutral":
        shaped = f'<prosody rate="{rules["rate"]}" pitch="{rules["pitch"]}">{shaped}</prosody>'
        tags.append(f"PROSODY_{element.upper()}")
    
    # Add emphasis for key words based on archetype
    if archetype == "sage":
        # Emphasize wisdom words
        wisdom_words = ["understand", "wisdom", "knowledge", "truth", "insight", "remember", "consider"]
        for word in wisdom_words:
            shaped = re.sub(rf'\b({word})\b', r'<emphasis level="strong">\1</emphasis>', shaped, flags=re.IGNORECASE)
            if word in shaped.lower():
                tags.append("EMPHASIS_WISDOM")
                break
    elif archetype == "oracle":
        # Emphasize mystical words
        mystical_words = ["see", "vision", "future", "destiny", "path", "journey", "spirit"]
        for word in mystical_words:
            shaped = re.sub(rf'\b({word})\b', r'<emphasis level="moderate">\1</emphasis>', shaped, flags=re.IGNORECASE)
            if word in shaped.lower():
                tags.append("EMPHASIS_MYSTICAL")
                break
    
    # Add elemental tag
    tags.append(f"ELEMENT_{element.upper()}")
    tags.append(f"ARCHETYPE_{archetype.upper()}")
    
    return shaped, tags

@app.post("/ci/shape", response_model=CIShapeResponse)
async def shape_text(request: CIShapeRequest):
    """Conversational Intelligence shaping endpoint"""
    start_time = time.time()
    
    try:
        logger.info(f"CI Shaping request: element={request.style}, archetype={request.archetype}")
        
        # Apply elemental shaping
        shaped_text, tags = apply_elemental_shaping(
            request.text, 
            request.style, 
            request.archetype
        )
        
        processing_time = int((time.time() - start_time) * 1000)  # ms
        
        return CIShapeResponse(
            text=shaped_text,
            shapingApplied=True,
            tags=tags,
            processingTime=processing_time,
            raw=request.text,
            shaped=shaped_text
        )
        
    except Exception as e:
        logger.error(f"CI shaping error: {str(e)}")
        # Return unmodified text on error
        return CIShapeResponse(
            text=request.text,
            shapingApplied=False,
            tags=["ERROR"],
            processingTime=int((time.time() - start_time) * 1000),
            raw=request.text,
            shaped=request.text
        )

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Sesame CSM Local service with CI shaping...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")