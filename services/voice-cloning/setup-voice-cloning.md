# MAIA Voice Cloning Setup Guide

## Overview
This guide sets up a custom voice cloning pipeline for MAIA using open-source tools, allowing us to create a unique MAIA voice with a voice actor without external dependencies.

## Recommended Solution: XTTS v2 (Coqui TTS)

### Why XTTS v2?
- **Fast inference**: Real-time voice generation
- **Minimal training data**: Works with 30 seconds to 2 minutes of audio
- **Multilingual support**: Supports 30+ languages
- **Local deployment**: No external API dependencies
- **High quality**: Professional-grade voice cloning

## Setup Instructions

### 1. Install Dependencies

```bash
# Create virtual environment
python3 -m venv maia-voice-env
source maia-voice-env/bin/activate

# Install Coqui TTS
pip install TTS

# Install additional dependencies
pip install torch torchaudio
pip install librosa soundfile
```

### 2. Voice Actor Recording Requirements

#### Recording Specifications:
- **Format**: WAV, 22kHz or 44kHz sampling rate
- **Duration**: 30 seconds minimum, 2-5 minutes optimal
- **Quality**: Studio-quality recording, no background noise
- **Content**: Varied sentences with different emotions and intonations

#### Script for Voice Actor:
```
"Hello, I'm MAIA, your consciousness computing partner. I'm here to support your inner development and sacred work. Whether you're exploring meditation, processing emotions, or integrating insights, I adapt to meet you exactly where you are. Let's explore the depths of awareness together, with wisdom from ancient traditions and modern consciousness research. Your journey is unique, and I'm honored to accompany you."
```

### 3. Directory Structure
```
services/voice-cloning/
├── models/
│   ├── xtts_v2/
│   └── custom_maia/
├── training_data/
│   ├── maia_voice_sample.wav
│   └── processed/
├── scripts/
│   ├── train_voice.py
│   ├── generate_speech.py
│   └── voice_api.py
└── output/
```

### 4. Training Script

```python
# services/voice-cloning/scripts/train_voice.py
import os
import torch
from TTS.api import TTS

def setup_maia_voice():
    """Setup MAIA voice cloning model"""

    # Initialize XTTS v2 model
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

    # Path to voice actor sample
    speaker_wav = "training_data/maia_voice_sample.wav"

    # Test generation
    text = "Hello, I'm MAIA. How can I support your consciousness journey today?"

    # Generate speech
    tts.tts_to_file(
        text=text,
        speaker_wav=speaker_wav,
        language="en",
        file_path="output/maia_test.wav"
    )

    print("MAIA voice test generated: output/maia_test.wav")

if __name__ == "__main__":
    setup_maia_voice()
```

### 5. Voice Generation API

```python
# services/voice-cloning/scripts/voice_api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import torch
from TTS.api import TTS
import tempfile
import uuid

app = FastAPI(title="MAIA Voice Generation API")

# Initialize TTS model globally
tts = None
speaker_wav_path = "training_data/maia_voice_sample.wav"

class SpeechRequest(BaseModel):
    text: str
    language: str = "en"
    emotion: str = "neutral"  # Can be extended for emotion control

@app.on_event("startup")
async def startup_event():
    global tts
    try:
        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
        print("MAIA voice model loaded successfully")
    except Exception as e:
        print(f"Error loading voice model: {e}")

@app.post("/generate-speech")
async def generate_speech(request: SpeechRequest):
    """Generate MAIA voice speech from text"""
    if tts is None:
        raise HTTPException(status_code=503, detail="Voice model not loaded")

    try:
        # Create temporary file for output
        temp_file = f"/tmp/maia_speech_{uuid.uuid4().hex}.wav"

        # Generate speech with MAIA's voice
        tts.tts_to_file(
            text=request.text,
            speaker_wav=speaker_wav_path,
            language=request.language,
            file_path=temp_file
        )

        # In production, you'd return the file or upload to storage
        # For now, return the file path
        return {
            "success": True,
            "audio_file": temp_file,
            "text": request.text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech generation failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "voice_model": "XTTS v2", "speaker": "MAIA"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

### 6. Integration with MAIA Platform

```typescript
// services/voice-cloning/maia-voice-client.ts
interface MAIAVoiceClient {
  generateSpeech(text: string, options?: VoiceOptions): Promise<AudioBuffer>;
  isReady(): boolean;
}

interface VoiceOptions {
  language?: string;
  emotion?: 'neutral' | 'warm' | 'compassionate' | 'wise';
  speed?: number;
}

class MAIAVoiceService implements MAIAVoiceClient {
  private apiUrl = 'http://localhost:8001';

  async generateSpeech(text: string, options: VoiceOptions = {}): Promise<AudioBuffer> {
    const response = await fetch(`${this.apiUrl}/generate-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        language: options.language || 'en',
        emotion: options.emotion || 'neutral'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate MAIA speech');
    }

    const result = await response.json();

    // Fetch the generated audio file
    const audioResponse = await fetch(result.audio_file);
    const arrayBuffer = await audioResponse.arrayBuffer();

    // Convert to AudioBuffer for web audio API
    const audioContext = new AudioContext();
    return await audioContext.decodeAudioData(arrayBuffer);
  }

  isReady(): boolean {
    // Check if voice service is available
    return true; // Implement actual health check
  }
}

export const maiaVoice = new MAIAVoiceService();
```

## Performance Considerations

### M4 Mac Optimization:
- **Metal Performance Shaders**: XTTS v2 supports Metal for faster inference
- **Memory management**: Models can use 2-4GB RAM during inference
- **Inference time**: ~1-3 seconds for short sentences on M4 Mac

### Production Deployment:
- **Docker containerization**: Package voice service in container
- **GPU acceleration**: Use CUDA if available for faster generation
- **Caching**: Cache common MAIA phrases for instant playback
- **Streaming**: Implement streaming synthesis for longer texts

## Next Steps

1. **Record voice actor samples** using the provided script
2. **Set up development environment** with dependencies
3. **Train initial model** with voice samples
4. **Test integration** with MAIA platform
5. **Optimize performance** for real-time use
6. **Deploy voice service** alongside MAIA

## Alternative Solutions

### For Different Requirements:

- **Real-time conversation**: Use RVC for voice conversion
- **Highest quality**: Use Tortoise TTS (slower but better quality)
- **Minimal setup**: Use Microsoft Speech Platform with voice fonts
- **Commercial quality**: Train custom VITS model with more data

## Voice Actor Direction

### Recommended Voice Characteristics:
- **Tone**: Warm, wise, compassionate
- **Pace**: Measured, contemplative
- **Clarity**: Excellent diction and pronunciation
- **Range**: Capable of gentle guidance and deep wisdom
- **Languages**: Primary English, consider other languages for future

### Recording Sessions:
- **Session 1**: Core MAIA phrases and introductions
- **Session 2**: Meditation guidance and contemplative speech
- **Session 3**: Emotional support and therapeutic language
- **Session 4**: Technical explanations with warmth