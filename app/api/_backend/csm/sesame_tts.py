#!/usr/bin/env python3
"""
Sesame CSM - Real TTS Implementation using Coqui TTS
Provides actual voice synthesis with conversational intelligence
"""
import os
import sys
import base64
import io
import json
import hashlib
import time
import tempfile
import logging
from typing import Optional, Dict, List, Any
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel
import numpy as np

# Try to import TTS libraries
try:
    import torch
    from TTS.api import TTS
    COQUI_AVAILABLE = True
except ImportError:
    COQUI_AVAILABLE = False
    print("Warning: Coqui TTS not available. Install with: pip install TTS")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Sesame CSM", version="2.0.0")

# Service configuration
SERVICE_MODE = "live" if COQUI_AVAILABLE else "mock"
MODEL_LOADED = False
tts_model = None

# Available TTS models (lightweight and fast)
TTS_MODELS = {
    "tacotron2": "tts_models/en/ljspeech/tacotron2-DDC",
    "glow-tts": "tts_models/en/ljspeech/glow-tts",
    "speedy": "tts_models/en/ljspeech/speedy-speech",
    "jenny": "tts_models/en/jenny/jenny",  # Multi-speaker model
}

# Voice personality mappings
VOICE_PERSONALITIES = {
    "maya": {
        "model": "jenny",
        "speaker": "jenny",  # Warm, friendly voice
        "speed": 0.95,
        "emotion": "neutral_warm"
    },
    "oracle": {
        "model": "tacotron2",
        "speaker": None,
        "speed": 0.9,
        "emotion": "wise"
    },
    "guide": {
        "model": "glow-tts",
        "speaker": None,
        "speed": 1.0,
        "emotion": "helpful"
    }
}

class TTSRequest(BaseModel):
    text: str
    voice: str = "maya"
    format: str = "wav"
    temperature: float = 0.7
    speed: float = 1.0
    element: Optional[str] = None  # fire, water, earth, air, aether
    context: Optional[str] = None  # guidance, exploration, reassurance

class CIShapeRequest(BaseModel):
    text: str
    style: str = "neutral"  
    archetype: str = "guide"
    meta: Dict[str, Any] = {}

def initialize_tts():
    """Initialize the TTS model"""
    global tts_model, MODEL_LOADED
    
    if not COQUI_AVAILABLE:
        logger.warning("Coqui TTS not available - running in mock mode")
        return False
    
    try:
        # Use Jenny model for multi-speaker capabilities
        model_name = TTS_MODELS.get("jenny", TTS_MODELS["tacotron2"])
        logger.info(f"Loading TTS model: {model_name}")
        
        # Initialize with GPU if available, else CPU
        device = "cuda" if torch.cuda.is_available() else "cpu"
        tts_model = TTS(model_name=model_name, progress_bar=False).to(device)
        
        MODEL_LOADED = True
        logger.info(f"TTS model loaded successfully on {device}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to load TTS model: {e}")
        MODEL_LOADED = False
        return False

def apply_conversational_shaping(text: str, element: str = None, context: str = None) -> str:
    """
    Apply conversational intelligence shaping to text
    Adds prosody markers and adjusts phrasing for natural speech
    """
    shaped_text = text
    
    # Element-based shaping
    if element == "water":
        # Flowing, gentle pacing
        shaped_text = shaped_text.replace(".", "...")
        shaped_text = shaped_text.replace("!", ".")
    elif element == "fire":
        # Dynamic, energetic
        shaped_text = shaped_text.replace(".", "!")
        shaped_text = shaped_text.upper() if len(text) < 50 else shaped_text
    elif element == "earth":
        # Grounded, steady
        shaped_text = shaped_text.replace("?", ".")
    elif element == "air":
        # Light, questioning
        shaped_text = shaped_text.replace(".", "?")
    elif element == "aether":
        # Mystical, paused
        shaped_text = shaped_text.replace(",", "...")
        shaped_text = shaped_text.replace(".", "... ...")
    
    # Context-based adjustments
    if context == "guidance":
        shaped_text = f"Listen... {shaped_text}"
    elif context == "reassurance":
        shaped_text = f"It's okay... {shaped_text}"
    elif context == "exploration":
        shaped_text = f"Let's see... {shaped_text}"
    
    return shaped_text

@app.on_event("startup")
async def startup_event():
    """Initialize TTS on startup"""
    initialize_tts()

@app.get("/")
async def root():
    """Root endpoint with service info"""
    return {
        "service": "Sesame CSM",
        "mode": SERVICE_MODE,
        "model_loaded": MODEL_LOADED,
        "version": "2.0.0",
        "capabilities": {
            "tts": True,
            "conversational_intelligence": True,
            "voice_personalities": list(VOICE_PERSONALITIES.keys()),
            "elements": ["fire", "water", "earth", "air", "aether"]
        },
        "endpoints": {
            "health": "/health",
            "tts": "/tts",
            "ci_shape": "/ci/shape"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy" if MODEL_LOADED else "degraded",
        "mode": SERVICE_MODE,
        "model_loaded": MODEL_LOADED,
        "service": "sesame-csm",
        "version": "2.0.0",
        "gpu_available": torch.cuda.is_available() if COQUI_AVAILABLE else False,
        "uptime": time.time()
    }

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Generate speech from text with conversational intelligence"""
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Apply conversational shaping
        shaped_text = apply_conversational_shaping(
            request.text, 
            request.element, 
            request.context
        )
        
        logger.info(f"TTS request: {request.text[:50]}... (voice: {request.voice})")
        
        if MODEL_LOADED and tts_model:
            # Get voice configuration
            voice_config = VOICE_PERSONALITIES.get(
                request.voice, 
                VOICE_PERSONALITIES["maya"]
            )
            
            # Generate audio using Coqui TTS
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                try:
                    # Generate speech
                    tts_model.tts_to_file(
                        text=shaped_text,
                        file_path=tmp_file.name,
                        speaker=voice_config.get("speaker"),
                        speed=request.speed * voice_config.get("speed", 1.0)
                    )
                    
                    # Read the generated audio
                    with open(tmp_file.name, 'rb') as f:
                        audio_data = f.read()
                    
                    # Encode to base64
                    audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                    
                    return {
                        "success": True,
                        "audio": audio_base64,
                        "format": "wav",
                        "duration_ms": len(audio_data) // 44,  # Rough estimate
                        "service": "sesame-csm",
                        "engine": "coqui-tts",
                        "model": voice_config["model"],
                        "shaped_text": shaped_text,
                        "voice_personality": request.voice
                    }
                    
                finally:
                    # Clean up temp file
                    if os.path.exists(tmp_file.name):
                        os.unlink(tmp_file.name)
        else:
            # Fallback to mock mode
            logger.warning("Model not loaded, returning mock audio")
            
            # Generate mock WAV header
            mock_audio = b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
            
            return {
                "success": True,
                "audio": base64.b64encode(mock_audio).decode(),
                "format": "wav",
                "duration_ms": 100,
                "service": "sesame-csm-mock",
                "engine": "mock",
                "shaped_text": shaped_text,
                "voice_personality": request.voice
            }
            
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ci/shape")
async def shape_text(request: CIShapeRequest):
    """Apply conversational intelligence shaping to text"""
    try:
        shaped = apply_conversational_shaping(
            request.text,
            element=request.style,
            context=request.archetype
        )
        
        # Add SSML-like tags for prosody hints
        tags = []
        if "..." in shaped:
            tags.append("pause")
        if "!" in shaped:
            tags.append("emphasis")
        if "?" in shaped:
            tags.append("question")
        
        return {
            "text": shaped,
            "shapingApplied": True,
            "tags": tags,
            "processingTime": 10,
            "raw": request.text,
            "shaped": shaped,
            "metadata": {
                "style": request.style,
                "archetype": request.archetype,
                "transformations": len(tags)
            }
        }
        
    except Exception as e:
        logger.error(f"Text shaping failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/voices")
async def list_voices():
    """List available voices and their configurations"""
    return {
        "voices": VOICE_PERSONALITIES,
        "default": "maya",
        "models_available": list(TTS_MODELS.keys()),
        "model_loaded": MODEL_LOADED
    }

if __name__ == "__main__":
    import uvicorn
    
    # Initialize TTS before starting server
    print("Initializing Sesame CSM with Coqui TTS...")
    initialize_tts()
    
    # Start server
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=int(os.environ.get("SESAME_PORT", 8000)),
        log_level="info"
    )