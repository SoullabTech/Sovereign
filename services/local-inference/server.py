"""
maia-local-inference — Phase 1 Sovereign Inference Adapter
===========================================================
Bridges the MAIA app (localInferenceClient.ts) to Ollama.

Exposes exactly the interface localInferenceClient.ts expects:
  GET  /health       → 200 {"status":"ok","model":str,"backend":str}
                       503 if Ollama is unreachable
  POST /v1/generate  → body: {prompt, max_tokens, temperature}
                       200 {"text":str, "model":str, "usage":{...}}
                       502 if Ollama call fails
"""

import logging
import os
import time
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("maia-local-inference")

# ── Config ────────────────────────────────────────────────────────────────────
OLLAMA_BASE_URL  = os.environ.get("OLLAMA_BASE_URL",  "http://host.docker.internal:11434")
OLLAMA_MODEL     = os.environ.get("OLLAMA_MODEL",     "deepseek-r1:8b")
GENERATE_TIMEOUT = float(os.environ.get("GENERATE_TIMEOUT_S", "30"))
PORT             = int(os.environ.get("PORT", "8080"))
VERSION          = "1.0.0"


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "maia-local-inference v%s starting — ollama=%s model=%s timeout=%ss",
        VERSION, OLLAMA_BASE_URL, OLLAMA_MODEL, GENERATE_TIMEOUT,
    )
    yield


app = FastAPI(
    title="maia-local-inference",
    version=VERSION,
    lifespan=lifespan,
)


# ── Request / response models ─────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    prompt:      str
    max_tokens:  int   = Field(default=1024, ge=1, le=8192)
    temperature: float = Field(default=0.7,  ge=0.0, le=2.0)


class TokenUsage(BaseModel):
    prompt_tokens:     int | None = None
    completion_tokens: int | None = None
    total_tokens:      int | None = None


class GenerateResponse(BaseModel):
    text:  str
    model: str
    usage: TokenUsage | None = None


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    """
    Probes Ollama before confirming healthy.
    isLocalHealthy() in localInferenceClient.ts calls this endpoint.
    """
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
    except httpx.RequestError as exc:
        logger.warning("health: ollama unreachable — %s", exc)
        raise HTTPException(status_code=503, detail=f"ollama unreachable: {exc}")

    if r.status_code != 200:
        logger.warning("health: ollama returned %s", r.status_code)
        raise HTTPException(status_code=503, detail=f"ollama returned {r.status_code}")

    return {"status": "ok", "model": OLLAMA_MODEL, "backend": OLLAMA_BASE_URL}


# ── Generate ──────────────────────────────────────────────────────────────────
@app.post("/v1/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    """
    Accepts the shape callLocalInference() sends, returns the shape it reads.
    Translates to Ollama /api/generate (non-streaming).
    """
    t0 = time.monotonic()

    try:
        async with httpx.AsyncClient(timeout=GENERATE_TIMEOUT) as client:
            r = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model":  OLLAMA_MODEL,
                    "prompt": req.prompt,
                    "stream": False,
                    "options": {
                        "num_predict": req.max_tokens,
                        "temperature": req.temperature,
                    },
                },
            )
    except httpx.TimeoutException:
        logger.error("generate: ollama timed out after %ss", GENERATE_TIMEOUT)
        raise HTTPException(status_code=504, detail="ollama timed out")
    except httpx.RequestError as exc:
        logger.error("generate: ollama request error — %s", exc)
        raise HTTPException(status_code=502, detail=f"ollama unreachable: {exc}")

    if r.status_code != 200:
        logger.error("generate: ollama error %s — %s", r.status_code, r.text[:200])
        raise HTTPException(status_code=502, detail=f"ollama error {r.status_code}")

    data      = r.json()
    elapsed   = time.monotonic() - t0
    prompt_t  = data.get("prompt_eval_count")
    gen_t     = data.get("eval_count")
    total_t   = (prompt_t or 0) + (gen_t or 0) or None

    logger.info(
        "generated %.2fs — model=%s prompt_tokens=%s gen_tokens=%s",
        elapsed, OLLAMA_MODEL, prompt_t, gen_t,
    )

    return GenerateResponse(
        text=data.get("response", ""),
        model=OLLAMA_MODEL,
        usage=TokenUsage(
            prompt_tokens=prompt_t,
            completion_tokens=gen_t,
            total_tokens=total_t,
        ),
    )


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")
