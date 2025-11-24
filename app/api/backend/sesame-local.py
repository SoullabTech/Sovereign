#!/usr/bin/env python3
"""
Sesame Local Service with CI Shaping
Provides both TTS and conversational intelligence shaping endpoints
"""
import os
import base64
import io
import logging
import time
import re
from typing import Optional, Dict, List, Any
from fastapi import FastAPI, HTTPException, Response, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Sesame CSM Local with CI", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service status
SERVICE_MODE = "mock_with_ci"
MODEL_LOADED = True

class TTSRequest(BaseModel):
    text: str
    voice: str = "maya"
    format: str = "wav"

class CIShapeRequest(BaseModel):
    text: str
    style: str = "neutral"  # element: fire, water, earth, air, aether
    archetype: str = "guide"  # sage, oracle, companion, guide, etc
    meta: Dict[str, Any] = {}
    # Enhanced multi-modal parameters
    voiceParams: Optional[Dict[str, Any]] = None  # speed, pitch, emphasis, warmth, confidence
    emotionalContext: Optional[Dict[str, Any]] = None  # emotional state, intensity, needs
    sessionMemory: Optional[Dict[str, Any]] = None  # user preferences, history

class CIShapeResponse(BaseModel):
    text: str  # Shaped text with SSML tags
    shapingApplied: bool = True
    tags: List[str] = []
    processingTime: int = 0
    raw: str = ""  # Original text
    shaped: str = ""  # Shaped text (same as text field)
    # Enhanced multi-modal response fields
    elementUsed: str = ""  # Primary element applied
    archetypeUsed: str = ""  # Archetype applied
    voiceAdaptations: List[str] = []  # Voice adaptations made
    therapeuticIntent: str = ""  # Detected therapeutic intent
    confidenceScore: float = 0.5  # Processing confidence
    multiModalEnhanced: bool = False  # Whether multi-modal data was used

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model": "mock-csm-with-ci"
    }

@app.post("/tts")
async def generate_tts(request: TTSRequest):
    """Generate TTS audio (mock)"""
    logger.info(f"TTS request: {request.text[:50]}...")
    
    # Generate mock WAV header
    wav_header = bytes([
        0x52, 0x49, 0x46, 0x46,  # "RIFF"
        0x24, 0x08, 0x00, 0x00,  # File size
        0x57, 0x41, 0x56, 0x45,  # "WAVE"
        0x66, 0x6d, 0x74, 0x20,  # "fmt "
        0x10, 0x00, 0x00, 0x00,  # Subchunk1Size
        0x01, 0x00, 0x01, 0x00,  # Audio format, channels
        0x80, 0x3e, 0x00, 0x00,  # Sample rate
        0x00, 0x7d, 0x00, 0x00,  # Byte rate  
        0x02, 0x00, 0x10, 0x00,  # Block align, bits per sample
        0x64, 0x61, 0x74, 0x61,  # "data"
        0x00, 0x08, 0x00, 0x00   # Data size
    ])
    
    # Add 1 second of silence
    silence = b'\x00' * 16000
    audio_base64 = base64.b64encode(wav_header + silence).decode()
    
    return {
        "audio": audio_base64,
        "service": "sesame-local-ci"
    }

def apply_elemental_shaping(text: str, element: str, archetype: str, voice_params: dict = None) -> tuple[str, list]:
    """Apply enhanced elemental prosody shaping to text with multi-modal intelligence"""
    shaped = text
    tags = []
    
    # Enhanced element-based prosody rules with multi-modal parameters
    elemental_rules = {
        "fire": {
            "pauses": {"short": "200ms", "long": "400ms"},
            "rate": "fast",
            "pitch": "high",
            "energy": "strong",
            "emphasis_level": "strong",
            "voice_warmth": 0.7
        },
        "water": {
            "pauses": {"short": "400ms", "long": "800ms"},
            "rate": "medium",
            "pitch": "medium",
            "energy": "moderate",
            "emphasis_level": "moderate",
            "voice_warmth": 0.8
        },
        "earth": {
            "pauses": {"short": "500ms", "long": "1000ms"},
            "rate": "slow",
            "pitch": "low",
            "energy": "moderate",
            "emphasis_level": "strong",
            "voice_warmth": 0.6
        },
        "air": {
            "pauses": {"short": "300ms", "long": "600ms"},
            "rate": "fast",
            "pitch": "high",
            "energy": "light",
            "emphasis_level": "moderate",
            "voice_warmth": 0.5
        },
        "aether": {
            "pauses": {"short": "600ms", "long": "1200ms"},
            "rate": "slow",
            "pitch": "medium",
            "energy": "soft",
            "emphasis_level": "gentle",
            "voice_warmth": 0.9
        }
    }
    
    rules = elemental_rules.get(element.lower(), elemental_rules["aether"])
    
    # Apply voice parameters if provided (from multi-modal analysis)
    if voice_params:
        # Adjust rules based on voice parameters
        if voice_params.get('speed', 1.0) < 0.8:
            # User speaks slowly, adjust pauses
            rules["pauses"]["short"] = str(int(rules["pauses"]["short"][:-2]) * 1.2) + "ms"
            rules["pauses"]["long"] = str(int(rules["pauses"]["long"][:-2]) * 1.2) + "ms"
        elif voice_params.get('speed', 1.0) > 1.2:
            # User speaks quickly, shorter pauses
            rules["pauses"]["short"] = str(int(rules["pauses"]["short"][:-2]) * 0.8) + "ms"
            rules["pauses"]["long"] = str(int(rules["pauses"]["long"][:-2]) * 0.8) + "ms"
        
        # Adjust emphasis based on user's emotional state
        emphasis_level = rules["emphasis_level"]
        if voice_params.get('emphasis', 0.5) > 0.8:
            emphasis_level = "strong"
        elif voice_params.get('emphasis', 0.5) < 0.3:
            emphasis_level = "moderate"
        
        rules["emphasis_level"] = emphasis_level
        tags.append(f"VOICE_ADAPTED_{element.upper()}")
    
    # Add pauses after sentences with enhanced timing
    shaped = re.sub(r'\. ', f'. <pause duration="{rules["pauses"]["long"]}"/> ', shaped)
    shaped = re.sub(r'\? ', f'? <pause duration="{rules["pauses"]["long"]}"/> ', shaped)
    shaped = re.sub(r'! ', f'! <pause duration="{rules["pauses"]["short"]}"/> ', shaped)
    shaped = re.sub(r', ', f', <pause duration="{rules["pauses"]["short"]}"/> ', shaped)
    
    # Add enhanced prosody wrapper with warmth
    if element != "neutral":
        warmth = voice_params.get('warmth', rules['voice_warmth']) if voice_params else rules['voice_warmth']
        pitch_adjustment = voice_params.get('pitch', 0) if voice_params else 0
        
        # Create enhanced prosody tag
        prosody_tag = f'<prosody rate="{rules["rate"]}" pitch="{rules["pitch"]}"'
        if pitch_adjustment != 0:
            prosody_tag += f' pitch-shift="{pitch_adjustment:+d}st"'
        if warmth > 0.7:
            prosody_tag += ' tone="warm"'
        elif warmth < 0.4:
            prosody_tag += ' tone="clinical"'
        prosody_tag += '>'
        
        shaped = f'{prosody_tag}{shaped}</prosody>'
        tags.append(f"PROSODY_{element.upper()}")
        
        if voice_params:
            tags.append("MULTI_MODAL_ENHANCED")
    
    # Enhanced archetype-based emphasis
    emphasis_level = rules["emphasis_level"]
    
    if archetype == "sage":
        wisdom_words = ["understand", "wisdom", "knowledge", "truth", "insight", "remember", "consider", "learn", "teach"]
        for word in wisdom_words:
            shaped = re.sub(rf'\b({word})\b', rf'<emphasis level="{emphasis_level}">\1</emphasis>', shaped, flags=re.IGNORECASE)
            if word in shaped.lower():
                tags.append("EMPHASIS_WISDOM")
                break
    elif archetype == "oracle":
        mystical_words = ["see", "vision", "future", "destiny", "path", "journey", "spirit", "divine", "sacred", "transcend"]
        for word in mystical_words:
            shaped = re.sub(rf'\b({word})\b', rf'<emphasis level="{emphasis_level}">\1</emphasis>', shaped, flags=re.IGNORECASE)
            if word in shaped.lower():
                tags.append("EMPHASIS_MYSTICAL")
                break
    elif archetype == "companion":
        supportive_words = ["feel", "understand", "support", "together", "care", "comfort", "gentle"]
        for word in supportive_words:
            shaped = re.sub(rf'\b({word})\b', rf'<emphasis level="gentle">\1</emphasis>', shaped, flags=re.IGNORECASE)
            if word in shaped.lower():
                tags.append("EMPHASIS_SUPPORTIVE")
                break
    elif archetype == "guide":
        guiding_words = ["step", "path", "direction", "forward", "progress", "growth", "change"]
        for word in guiding_words:
            shaped = re.sub(rf'\b({word})\b', rf'<emphasis level="moderate">\1</emphasis>', shaped, flags=re.IGNORECASE)
            if word in shaped.lower():
                tags.append("EMPHASIS_GUIDANCE")
                break
    
    # Add elemental and archetype tags
    tags.append(f"ELEMENT_{element.upper()}")
    tags.append(f"ARCHETYPE_{archetype.upper()}")
    
    # Add confidence indicator if voice params available
    if voice_params:
        confidence = voice_params.get('confidence', 0.5)
        if confidence > 0.8:
            tags.append("HIGH_CONFIDENCE")
        elif confidence < 0.4:
            tags.append("LOW_CONFIDENCE")
    
    return shaped, tags

@app.post("/ci/shape", response_model=CIShapeResponse)
async def shape_text(request: CIShapeRequest, authorization: Optional[str] = Header(None)):
    """Enhanced Conversational Intelligence shaping endpoint with multi-modal support"""
    start_time = time.time()
    
    try:
        logger.info(f"Enhanced CI Shaping: element={request.style}, archetype={request.archetype}")
        
        # Determine if multi-modal enhancement is available
        multi_modal_enhanced = bool(request.voiceParams or request.emotionalContext)
        voice_adaptations = []
        therapeutic_intent = "general-wellbeing"
        confidence_score = 0.5
        
        # Enhanced element selection with emotional context
        effective_element = request.style
        effective_archetype = request.archetype
        
        if request.emotionalContext:
            # Analyze emotional context for better element selection
            emotional_state = request.emotionalContext.get('primaryEmotion', '')
            intensity = request.emotionalContext.get('emotionalIntensity', 0.5)
            needs = request.emotionalContext.get('therapeuticNeeds', [])
            
            # Auto-select optimal element based on emotional state
            if emotional_state in ['excitement', 'anger', 'passion'] and intensity > 0.7:
                effective_element = 'earth' if 'grounding' in needs else 'water'  # Cool down intensity
                therapeutic_intent = 'grounding'
                voice_adaptations.append('EMOTIONAL_GROUNDING')
            elif emotional_state in ['sadness', 'melancholy'] and intensity > 0.5:
                effective_element = 'fire'  # Energize and uplift
                therapeutic_intent = 'activation'
                voice_adaptations.append('EMOTIONAL_ACTIVATION')
            elif emotional_state in ['anxiety', 'worry']:
                effective_element = 'earth'  # Ground and stabilize
                therapeutic_intent = 'stress-reduction'
                voice_adaptations.append('ANXIETY_GROUNDING')
            
            # Adjust archetype based on needs
            if 'comfort' in needs:
                effective_archetype = 'companion'
            elif 'clarity' in needs:
                effective_archetype = 'sage'
            elif 'guidance' in needs:
                effective_archetype = 'guide'
            elif 'transcendence' in needs:
                effective_archetype = 'oracle'
            
            confidence_score = 0.85  # Higher confidence with emotional context
            logger.info(f"Emotional context applied: {emotional_state} -> {effective_element} ({therapeutic_intent})")
        
        # Apply session memory preferences if available
        if request.sessionMemory:
            preferences = request.sessionMemory.get('prosodyPreferences', {})
            preferred_elements = preferences.get('preferredElements', [])
            
            # Use user's preferred element if compatible with therapeutic needs
            if preferred_elements and effective_element == request.style:  # Only if not overridden by emotional needs
                effective_element = preferred_elements[0]
                voice_adaptations.append('USER_PREFERENCE_APPLIED')
                confidence_score = 0.95  # Highest confidence with personalization
                logger.info(f"User preference applied: {effective_element}")
        
        # Apply enhanced elemental shaping with voice parameters
        shaped_text, tags = apply_elemental_shaping(
            request.text,
            effective_element,
            effective_archetype,
            request.voiceParams
        )
        
        # Additional voice adaptations based on parameters
        if request.voiceParams:
            if request.voiceParams.get('speed', 1.0) != 1.0:
                voice_adaptations.append('SPEED_ADAPTED')
            if request.voiceParams.get('pitch', 0) != 0:
                voice_adaptations.append('PITCH_ADAPTED')
            if request.voiceParams.get('emphasis', 0.5) > 0.7:
                voice_adaptations.append('HIGH_EMPHASIS')
            elif request.voiceParams.get('emphasis', 0.5) < 0.3:
                voice_adaptations.append('SUBTLE_EMPHASIS')
            if request.voiceParams.get('warmth', 0.5) > 0.7:
                voice_adaptations.append('WARM_TONE')
                
        processing_time = int((time.time() - start_time) * 1000)
        
        logger.info(f"Enhanced shaping complete: {shaped_text[:100]}...")
        logger.info(f"Tags: {tags}, Adaptations: {voice_adaptations}")
        
        return CIShapeResponse(
            text=shaped_text,
            shapingApplied=True,
            tags=tags,
            processingTime=processing_time,
            raw=request.text,
            shaped=shaped_text,
            # Enhanced fields
            elementUsed=effective_element,
            archetypeUsed=effective_archetype,
            voiceAdaptations=voice_adaptations,
            therapeuticIntent=therapeutic_intent,
            confidenceScore=confidence_score,
            multiModalEnhanced=multi_modal_enhanced
        )
        
    except Exception as e:
        logger.error(f"Enhanced CI shaping error: {str(e)}")
        # Return unmodified text on error with diagnostic info
        return CIShapeResponse(
            text=request.text,
            shapingApplied=False,
            tags=["ERROR", f"EXCEPTION_{type(e).__name__}"],
            processingTime=int((time.time() - start_time) * 1000),
            raw=request.text,
            shaped=request.text,
            elementUsed=request.style,
            archetypeUsed=request.archetype,
            voiceAdaptations=["ERROR_FALLBACK"],
            therapeuticIntent="error-recovery",
            confidenceScore=0.0,
            multiModalEnhanced=False
        )

@app.get("/")
async def root():
    """Root endpoint with enhanced service info"""
    return {
        "service": "Sesame CSM Enhanced Multi-Modal Intelligence",
        "version": "3.0.0-multimodal",
        "mode": SERVICE_MODE,
        "model_loaded": MODEL_LOADED,
        "capabilities": {
            "multi_modal_analysis": True,
            "emotional_intelligence": True,
            "voice_adaptation": True,
            "contextual_memory": True,
            "therapeutic_shaping": True,
            "biometric_ready": True
        },
        "endpoints": {
            "health": "/health",
            "tts": "/tts",
            "ci_shape": "/ci/shape (Enhanced with multi-modal support)"
        },
        "supported_elements": ["fire", "water", "earth", "air", "aether"],
        "supported_archetypes": ["sage", "oracle", "companion", "guide"],
        "voice_adaptations": [
            "speed_adaptation",
            "pitch_adjustment", 
            "emphasis_control",
            "warmth_tuning",
            "emotional_resonance"
        ]
    }

if __name__ == "__main__":
    logger.info("Starting Sesame CSM Local service with CI shaping...")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")