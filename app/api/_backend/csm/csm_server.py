"""
Sesame CSM (csm-1b) — genuine model server for the Voice Lab.

This wraps the REAL Sesame Conversational Speech Model (generator.load_csm_1b →
Generator.generate) in the FastAPI `/tts` + `/health` contract the MAIA sesame
adapter (lib/tts/providers/sesame.ts) expects. It is NOT the gTTS placeholder
(sesame_simple.py) and NOT Coqui (sesame_tts.py) — it is csm-1b itself.

Contract (matches lib/tts/providers/sesame.ts):
  POST /tts  { text, voice?, format?, speed?, element?, context? }
      → 200 { success: true, audio: <base64>, sample_rate, format, model }
      → 5xx { success: false, error }   (NEVER silently substitute another engine)
  GET  /health  → { healthy, model, sample_rate, initialized }

LAB-ONLY. Not production-qualified. Qualification is earned downstream by
behavioral checks (transcript fidelity via STT, latency, listening), not by the
fact that this server boots. A booting server is layer-1 (operational) only.

Requires: the meta-llama/Llama-3.2-1B tokenizer license accepted on the running
HF account (generator.py:26) + the csm-1b weights. Fails loudly if absent.

Run:  python csm_server.py     (PORT env, default 8890 to avoid the 8881 gTTS slot)
"""

import base64
import io
import logging
import os
import subprocess
import tempfile
import time
from typing import Optional

import numpy as np
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("csm_server")

app = FastAPI(title="Sesame CSM (csm-1b)", version="1.0.0")

# Loaded once at startup. None until the real model is in memory.
_generator = None
_sample_rate = 24000
_load_error: Optional[str] = None

# CSM conditions voice via context Segments, not a voice id. The lab sends a
# `voice` string; map it to a speaker index. Single MAIA speaker for now (0).
_VOICE_TO_SPEAKER = {"maya": 0, "maia": 0}


def _select_device() -> str:
    import torch
    forced = os.environ.get("CSM_DEVICE")
    if forced:
        return forced
    # NOTE: loading csm-1b safetensors directly onto MPS fails ("device mps:0 is
    # invalid") in this torch/safetensors build, so default to CPU for a correct
    # (if slower) load. Fidelity is device-independent; latency is reported as CPU.
    # Override with CSM_DEVICE=mps once a load-on-cpu-then-.to(mps) path is wired.
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


@app.on_event("startup")
def _startup():
    global _generator, _sample_rate, _load_error
    try:
        from generator import load_csm_1b  # local module (app/api/_backend/csm)
        device = _select_device()
        logger.info(f"[csm] loading csm-1b on {device} …")
        t0 = time.time()
        _generator = load_csm_1b(device)
        _sample_rate = int(_generator.sample_rate)
        logger.info(f"[csm] ready in {time.time()-t0:.1f}s (sr={_sample_rate})")
    except Exception as e:  # noqa: BLE001 — surface the real reason, do not hide it
        _load_error = f"{type(e).__name__}: {e}"
        logger.error(f"[csm] model load FAILED: {_load_error}")


class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "maya"
    format: Optional[str] = "wav"
    speed: Optional[float] = 1.0
    element: Optional[str] = None
    context: Optional[list] = None  # reserved; zero-shot for now


@app.get("/health")
def health():
    if _generator is None:
        return JSONResponse(
            {"healthy": False, "initialized": False, "error": _load_error or "not initialized"},
            status_code=503,
        )
    return {"healthy": True, "initialized": True, "model": "sesame-csm-1b", "sample_rate": _sample_rate}


def _wav_bytes(waveform: "np.ndarray", sr: int) -> bytes:
    import soundfile as sf
    buf = io.BytesIO()
    sf.write(buf, waveform, sr, format="WAV", subtype="PCM_16")
    return buf.getvalue()


def _wav_to_mp3(wav: bytes) -> bytes:
    """Transcode via ffmpeg. Honest failure if ffmpeg is absent — never return
    wav bytes labelled as mp3 (that would corrupt provenance/playback)."""
    with tempfile.NamedTemporaryFile(suffix=".wav") as fin, tempfile.NamedTemporaryFile(suffix=".mp3") as fout:
        fin.write(wav); fin.flush()
        subprocess.run(
            ["ffmpeg", "-y", "-i", fin.name, "-codec:a", "libmp3lame", "-qscale:a", "2", fout.name],
            check=True, capture_output=True,
        )
        fout.seek(0)
        return fout.read()


@app.post("/tts")
def tts(req: TTSRequest):
    if _generator is None:
        return JSONResponse({"success": False, "error": _load_error or "model not initialized"}, status_code=503)
    text = (req.text or "").strip()
    if not text:
        return JSONResponse({"success": False, "error": "text is required"}, status_code=400)

    speaker = _VOICE_TO_SPEAKER.get((req.voice or "maya").lower(), 0)
    fmt = (req.format or "wav").lower()

    try:
        import torch  # noqa: F401
        t0 = time.time()
        audio = _generator.generate(text=text, speaker=speaker, context=[], max_audio_length_ms=30_000)
        gen_ms = int((time.time() - t0) * 1000)
        waveform = audio.detach().to("cpu").numpy().astype(np.float32)

        wav = _wav_bytes(waveform, _sample_rate)
        if fmt == "mp3":
            try:
                out = _wav_to_mp3(wav)
            except Exception as e:  # noqa: BLE001
                return JSONResponse(
                    {"success": False, "error": f"mp3 transcode failed (ffmpeg?): {e}"}, status_code=500
                )
        elif fmt in ("wav", "opus"):
            out = wav  # opus not implemented; return wav bytes only for wav
            fmt = "wav"
        else:
            out = wav; fmt = "wav"

        return {
            "success": True,
            "audio": base64.b64encode(out).decode("utf-8"),
            "sample_rate": _sample_rate,
            "format": fmt,
            "model": "sesame-csm-1b",
            "gen_ms": gen_ms,
        }
    except Exception as e:  # noqa: BLE001
        logger.error(f"[csm] generation error: {e}")
        return JSONResponse({"success": False, "error": f"{type(e).__name__}: {e}"}, status_code=500)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("CSM_PORT", "8890"))
    uvicorn.run(app, host="127.0.0.1", port=port)
