# 🎙️ Sesame CSM Deployment Guide

This guide explains how to deploy the Sesame AI Labs CSM (Continuous Speech Model) for Maya's voice synthesis.
The system is designed for **self-hosting first**, with optional cloud fallbacks.

## Overview

Sesame CSM provides:

* Natural, conversational voice synthesis
* Multiple voice personas (e.g. Maya, neutral, warm, mystic)
* Low-latency audio generation (~400ms locally)
* REST API interface compatible with your Oracle backend

GitHub: [https://github.com/SesameAILabs/csm](https://github.com/SesameAILabs/csm)

---

## Deployment Options

### Option 1: Local Docker (Recommended)

**Fully offline setup with auto-start integration:**

1. **Run the one-time setup**:
   ```bash
   ./backend/scripts/setup-sesame-offline.sh
   ```

2. **Start Maya with voice**:
   ```bash
   ./scripts/start-beta.sh
   ```

3. **Your configuration** (automatically created):
   ```env
   SESAME_ENABLED=true
   SESAME_MODE=offline
   SESAME_URL=http://localhost:8000/api/v1/generate
   SESAME_API_KEY=local
   ```

✨ This gives you **100% offline, self-hosted voice** with no external dependencies.

---

### Option 2: Manual Docker Setup

If you prefer manual control:

```bash
# Use the included Docker Compose
docker compose -f docker-compose.sesame-offline.yml up -d

# Check health
curl http://localhost:8000/health

# Test generation
curl -X POST http://localhost:8000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from Maya"}'
```

---

### Option 3: HuggingFace Fallback (Optional)

If Sesame is unavailable, you can use HuggingFace's inference API:

```env
SESAME_ENABLED=true
SESAME_MODE=online
SESAME_URL=https://api-inference.huggingface.co/models/facebook/blenderbot-1B-distill
SESAME_API_KEY=hf_your_token_here
SESAME_FALLBACK_ENABLED=true
```

⚠️ Requires a HuggingFace account and **read-access token**. Subject to rate limits and slower response times.

---

### Option 4: ElevenLabs Fallback (Optional)

For premium cloud voices, ElevenLabs can serve as the final fallback:

```env
ELEVENLABS_API_KEY=your-elevenlabs-key
```

Use this for **high-quality production fallback**, while keeping Sesame as the primary engine.

---

## Testing Your Deployment

Run the included script:

```bash
cd backend
./scripts/test-sesame.sh
```

This will check:

* Health endpoint (`/health`)
* TTS generation endpoint (`/api/v1/generate`)

---

## Integration with Maya

The backend automatically detects and uses Sesame when configured:

1. **Primary**: Self-hosted Sesame CSM (offline Docker)
2. **Fallback**: HuggingFace model (online)
3. **Final Fallback**: ElevenLabs (cloud TTS)

---

## Monitoring

Check Sesame status in `start-beta.sh` output:

```
🎤 Checking Sesame CSM Server (REQUIRED for voice)...
✅ Sesame CSM container started
✅ Sesame CSM is ready
```

And in the Oracle UI header:
- 🟢 **Sesame Local** = 100% offline voice working
- 🔵 **Sesame API** = Online Sesame working  
- 🟠 **ElevenLabs** = Fallback in use
- 🔴 **Voice Offline** = No engines available

---

## Troubleshooting

### "Connection refused"

* Ensure the Docker container is running:
  `docker ps | grep sesame-csm`

### "Model not loaded"

* First start can take 2–3 minutes
* Watch container logs with:
  `docker logs -f sesame-csm-offline`

### "Auto-start failed"

* Run the offline setup:
  `./backend/scripts/setup-sesame-offline.sh`
* Check Docker is installed and running

---

## Performance Tips

* **Model Caching**: Once loaded, Sesame keeps the model in memory for fast responses
* **Warm Starts**: The system automatically keeps containers alive
* **GPU Support**: If available, Sesame automatically accelerates model inference

---

## Cost Optimization

* **Local Docker**: Free (runs on your hardware)
* **HuggingFace**: Free tier with rate limits, Pro tier for more calls
* **ElevenLabs**: Paid (usage-based, premium fallback)

---

With Sesame CSM self-hosted, Maya now speaks with a **consistent, natural, and private voice** — always available, with smooth fallbacks when needed.