"""
MAIA Local TTS Service — stub for integration testing.

This is a FastAPI service that implements the same /tts endpoint
that the Node.js backend expects. Replace _build_stub_wav() with
real model inference (Voxtral, CSM-1B, Orpheus, etc.) when ready.

Run: uvicorn app:app --host 0.0.0.0 --port 8882 --reload
"""

from io import BytesIO
import math
import wave

from fastapi import FastAPI, Response
from pydantic import BaseModel


app = FastAPI(title="MAIA Local TTS Service")


class TTSRequest(BaseModel):
    text: str
    voiceId: str = "maia_default"
    stylePreset: str = "grounded_reflective"
    speed: float = 1.0
    context: dict | None = None


def _duration_from_text(text: str, minimum: float = 1.2, maximum: float = 8.0) -> float:
    """Estimate audio duration from text length."""
    words = max(1, len(text.split()))
    estimated = 0.22 * words
    return max(minimum, min(maximum, estimated))


def _tone_frequency(style_preset: str) -> float:
    """Map style preset to a distinguishable tone frequency (stub only)."""
    frequencies = {
        "quiet_containing": 210.0,
        "clear_direct": 260.0,
        "shadow_depth": 170.0,
        "mentor_firm": 235.0,
        "ritual_spacious": 150.0,
        "grounded_reflective": 220.0,
    }
    return frequencies.get(style_preset, 220.0)


def _build_stub_wav(text: str, style_preset: str) -> bytes:
    """
    Generate a simple sine-wave WAV as a placeholder.

    Each style preset produces a different tone frequency so you can
    hear the routing is working, even before real inference is wired.
    Replace this entire function with actual model inference.
    """
    sample_rate = 22050
    duration = _duration_from_text(text)
    frequency = _tone_frequency(style_preset)
    amplitude = 8000

    buffer = BytesIO()

    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)

        total_frames = int(sample_rate * duration)

        for i in range(total_frames):
            envelope = min(1.0, i / 1200.0) * min(1.0, (total_frames - i) / 1200.0)
            sample = int(
                amplitude
                * envelope
                * math.sin(2.0 * math.pi * frequency * (i / sample_rate))
            )
            wav_file.writeframesraw(
                sample.to_bytes(2, byteorder="little", signed=True)
            )

    return buffer.getvalue()


@app.get("/health")
async def health():
    return {"ok": True, "service": "maia-local-tts", "engine": "stub"}


@app.post("/tts")
async def tts(request: TTSRequest):
    wav_bytes = _build_stub_wav(request.text, request.stylePreset)
    return Response(content=wav_bytes, media_type="audio/wav")
