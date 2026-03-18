# Phase 1 Sovereign Inference — Runbook

**Status:** Production-ready (profile: `sovereign`)
**Last updated:** 2026-02-23

---

## What this is

Phase 1 adds a runtime inference mode to MAIA controlled by a single env var (`MAIA_INFERENCE_MODE`). When unset the system behaves exactly as before. When set, all text generation is routed through `sovereignRouter.ts` before any existing provider logic runs.

Three modes:

| `MAIA_INFERENCE_MODE` | Behaviour |
|---|---|
| *(unset / empty)* | Zero change — existing MAIA_TEXT_PROVIDER logic |
| `primary` | Anthropic first; local fallback on failure |
| `sovereign` | Local first; degraded on failure (NO vendor switch) |
| `local_only` | Local only; degraded on failure |

The **local provider** is `maia-local-inference` — a thin FastAPI adapter that bridges MAIA → Ollama.

---

## Architecture

```
MAIA app
  └─ modelService.generateText()
       └─ [guard] if MAIA_INFERENCE_MODE set → sovereignRouter.ts
            ├─ [primary]    generateWithClaude()  ──→ Anthropic API
            │               ↓ fail
            └─ [sovereign / local_only / primary fallback]
                            localInferenceClient.ts
                              └─ isLocalHealthy()  ──→ maia-local-inference:8080/health
                              └─ callLocalInference() → maia-local-inference:8080/v1/generate
                                                          └─ Ollama /api/generate
```

**Circuit breaker** (in `localInferenceClient.ts`): after any local failure, health probes are skipped for 45 seconds to prevent hammering a down service.

**Degraded response**: if the chosen path fails and no fallback is available, MAIA returns:
> "MAIA is here. I've saved your message. My local voice is temporarily limited; I'll return with a fuller response as soon as capacity is back."

---

## Files changed / created

| File | Change |
|---|---|
| `lib/ai/types.ts` | Added `InferenceMode`, `TokenUsage`, `'local_inference'` to `ProviderName` |
| `lib/ai/modelService.ts` | Added sovereign guard, token usage logging |
| `lib/ai/sovereignRouter.ts` | New — routing logic for all three modes |
| `lib/ai/localInferenceClient.ts` | New — HTTP client + circuit breaker |
| `services/local-inference/server.py` | New — FastAPI adapter (Ollama bridge) |
| `services/local-inference/Dockerfile` | New |
| `services/local-inference/requirements.txt` | New |
| `docker-compose.production.yml` | Added `maia-local-inference` service (profile: `sovereign`) |
| `.env.docker.template` | Added Phase 1 env var block |

---

## Env vars

```env
# ── Sovereign routing mode ────────────────────────────────────────────────────
# Leave empty for zero behavior change.
MAIA_INFERENCE_MODE=            # primary | sovereign | local_only

# ── Local inference service ───────────────────────────────────────────────────
LOCAL_INFERENCE_BASE_URL=http://maia-local-inference:8080
LOCAL_INFERENCE_TIMEOUT_MS=15000
LOCAL_INFERENCE_HEALTH_PATH=/health
LOCAL_INFERENCE_GENERATE_PATH=/v1/generate

# ── Ollama backend (read by maia-local-inference container) ──────────────────
OLLAMA_BASE_URL=http://host.docker.internal:11434   # or UM790 LAN IP
OLLAMA_MODEL=deepseek-r1:8b

# ── Token usage logging ───────────────────────────────────────────────────────
MAIA_LOG_TOKEN_USAGE=false
MAIA_LOG_TOKEN_USAGE_SAMPLE_RATE=1
```

---

## Start / stop

```bash
cd /Users/soullab/MAIA-SOVEREIGN

# Start the local inference adapter (sovereign profile)
docker compose -f docker-compose.production.yml --profile sovereign up -d maia-local-inference

# Start main MAIA stack as normal (maia-local-inference already running)
docker compose -f docker-compose.production.yml up -d maia

# Stop just the inference adapter
docker compose -f docker-compose.production.yml stop maia-local-inference

# Rebuild after server.py changes
docker compose -f docker-compose.production.yml build maia-local-inference
docker compose -f docker-compose.production.yml --profile sovereign up -d maia-local-inference
```

> **Note:** MAIA starts fine without `maia-local-inference`. If the service is down and `MAIA_INFERENCE_MODE=sovereign`, MAIA returns the degraded message (not a 500).

---

## Health checks

### 1. Container status

```bash
docker ps --filter name=maia-local-inference --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### 2. Service health endpoint

```bash
curl -sS -i http://localhost:8080/health
# Expected: HTTP/1.1 200 OK
# {"status":"ok","model":"deepseek-r1:8b","backend":"http://host.docker.internal:11434"}

# 503 = Ollama unreachable (circuit will trip in localInferenceClient after next call)
```

### 3. Generate smoke test

```bash
curl -sS -X POST http://localhost:8080/v1/generate \
  -H "content-type: application/json" \
  -d '{"prompt":"Respond with exactly three words.","max_tokens":16,"temperature":0.0}'
# Expected: {"text":"...","model":"deepseek-r1:8b","usage":{...}}
```

### 4. Ollama reachable from container

```bash
docker exec maia-local-inference \
  curl -sS -o /dev/null -w "HTTP %{http_code}\n" \
  http://host.docker.internal:11434/api/tags
# Expected: HTTP 200
# If HTTP 000 or connection refused: set OLLAMA_BASE_URL to UM790 LAN IP
```

### 5. Container logs

```bash
docker logs --tail=50 maia-local-inference
docker logs --tail=50 maia-local-inference -f   # stream
```

---

## Token usage logging

When `MAIA_LOG_TOKEN_USAGE=true`, every generation emits one JSON line to stdout:

```json
{
  "at": "2026-02-23T10:00:00.000Z",
  "kind": "token_usage",
  "provider": "local_inference",
  "model": "deepseek-r1:8b",
  "ms": 4200,
  "input": 42,
  "output": 187,
  "total": 229,
  "tag": "sovereignRouter.sovereign"
}
```

Grep for it:

```bash
docker logs maia-sovereign 2>&1 | grep '"kind":"token_usage"'
```

---

## Troubleshooting

### maia-local-inference is unhealthy

```
docker logs maia-local-inference | tail -20
```

Most likely causes:
1. **Ollama not running** — start Ollama on host or UM790 and verify with `curl http://localhost:11434/api/tags`
2. **Wrong `OLLAMA_BASE_URL`** — if Ollama is on UM790, set `OLLAMA_BASE_URL=http://192.168.x.x:11434` in `.env.production`
3. **Model not pulled** — `ollama pull deepseek-r1:8b` on the machine running Ollama

### Circuit breaker is open (local calls skipped for 45s)

Symptom: MAIA returns the degraded message immediately without attempting local inference.

This is expected after a failure. The circuit resets automatically after 45 seconds. To reset it immediately, restart MAIA:

```bash
docker compose -f docker-compose.production.yml restart maia
```

### Sovereign mode returning degraded unexpectedly

Check in order:
1. Is `maia-local-inference` running and healthy? (`docker ps`)
2. Can the container reach Ollama? (exec test above)
3. Is the model loaded? (`ollama list` on the Ollama host)
4. Check MAIA logs for circuit breaker trips:
   ```bash
   docker logs maia-sovereign 2>&1 | grep "circuit tripped"
   ```

### Switching between modes without restart

`MAIA_INFERENCE_MODE` is read at module load (Node.js startup). To change modes, update `.env.production` then restart:

```bash
docker compose -f docker-compose.production.yml restart maia
```

---

## UM790 setup (LAN routing)

If Ollama runs on the UM790 rather than the Mac Studio:

1. Start Ollama on UM790 with external binding:
   ```bash
   OLLAMA_HOST=0.0.0.0 ollama serve
   ```
2. Pull the model on UM790:
   ```bash
   ollama pull deepseek-r1:8b
   ```
3. Set in `.env.production` on Mac Studio:
   ```env
   OLLAMA_BASE_URL=http://192.168.x.x:11434   # UM790 LAN IP
   ```
4. Test connectivity:
   ```bash
   curl http://192.168.x.x:11434/api/tags
   ```
5. Rebuild and restart `maia-local-inference`:
   ```bash
   docker compose -f docker-compose.production.yml build maia-local-inference
   docker compose -f docker-compose.production.yml --profile sovereign up -d maia-local-inference
   ```

---

## Running tests

```bash
# Unit tests (no infrastructure required)
npx jest tests/ai/sovereignRouter.test.ts tests/ai/modelService.sovereign-fallback.test.ts --no-coverage

# All AI tests
npx jest tests/ai/ --no-coverage
```

---

## Re-entry checklist (before changing sovereign routing code)

1. `MAIA_INFERENCE_MODE` is validated upstream by the guard — the router never receives an invalid mode
2. **Never call `generateText()` from `sovereignRouter.ts`** — infinite recursion
3. **Never import anything with side effects** into `sovereignRouter.ts` or `localInferenceClient.ts` at module load time
4. The circuit breaker is in-process module state — it resets on container restart, not across requests
5. Billing/auth errors (`ANTHROPIC_BILLING_ERROR`, `noFallback`) must always re-throw — no local fallback
6. The degraded text is exact copy — do not alter it without a design review
