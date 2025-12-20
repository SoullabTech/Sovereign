# MAIA Bulletproof Process - Complete System Management

**Date:** December 17, 2025
**Status:** ✅ PRODUCTION READY
**Sovereignty:** 100% Voice Pipeline

---

## Quick Start (For Daily Use)

### Start Everything
```bash
cd /Users/soullab/MAIA-SOVEREIGN
./scripts/start-maia-full.sh
```

This single command starts:
- ✅ Whisper server (local STT)
- ✅ Ollama service (local intelligence)
- ✅ MAIA dev server
- ✅ Health checks for all services

### Check System Health
```bash
./scripts/check-whisper.sh
```

### Stop Whisper Server
```bash
./scripts/stop-whisper.sh
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     MAIA Bulletproof Stack                       │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Voice Input (100% Sovereign)
  ├─ Browser MediaRecorder API
  ├─ WhisperContinuousConversation.tsx
  └─ Whisper-cpp Server (Port 8080)
      ├─ Model: ggml-base.en.bin (147 MB)
      ├─ GPU: Apple M4 Max (Metal)
      └─ Management: scripts/start-whisper.sh

Layer 2: Intelligence (100% Sovereign)
  ├─ Ollama Service (Port 11434)
  ├─ Model: DeepSeek-R1
  └─ Consciousness Systems (local)

Layer 3: Voice Output (Approved External)
  └─ OpenAI TTS API (user-approved for "speaking")

Layer 4: Application
  ├─ Next.js Dev Server (Port 3003)
  └─ MAIA Interface: http://localhost:3003/maia
```

---

## Management Scripts

### 1. start-maia-full.sh (Master Startup)

**Purpose:** Start all MAIA services in correct order with health checks

**Features:**
- ✅ Checks for existing services before starting
- ✅ Waits for each service to be healthy
- ✅ Auto-recovers from stale processes
- ✅ Verifies GPU acceleration
- ✅ Checks required models
- ✅ Comprehensive status output

**Usage:**
```bash
./scripts/start-maia-full.sh
```

**Output Example:**
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           MAIA SOVEREIGN - FULL SYSTEM STARTUP            ║
║                                                           ║
║             100% Sovereign Voice Conversation             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

[SECTION] Step 1: Starting Whisper Server
[INFO] Starting Whisper server...
[INFO] ✅ Whisper server is fully operational!

[SECTION] Step 2: Checking Ollama Service
[INFO] ✅ Ollama service is running
[INFO] ✅ DeepSeek-R1 model found

[SECTION] Step 3: Checking Database Services
[INFO] ✅ PostgreSQL running on port 5432

[SECTION] Step 4: Starting MAIA Dev Server
[INFO] ✅ Dev server is ready!

╔═══════════════════════════════════════════════════════════╗
║                  ✅ ALL SYSTEMS OPERATIONAL                ║
╚═══════════════════════════════════════════════════════════╝

🌟 MAIA Voice System Status:

  🎤 Speech-to-Text:   http://127.0.0.1:8080 (whisper-cpp, 100% sovereign)
  🧠 Intelligence:      http://localhost:11434 (Ollama DeepSeek-R1, 100% sovereign)
  🎯 MAIA Interface:    http://localhost:3003/maia
  🔊 Text-to-Speech:    OpenAI TTS (approved for voice output)
```

---

### 2. start-whisper.sh (Whisper Server Management)

**Purpose:** Start Whisper server with comprehensive error handling

**Features:**
- ✅ Pre-flight checks (installation, model, FFmpeg)
- ✅ Kills existing conflicting processes
- ✅ Starts server in background with logging
- ✅ Performs HTTP health check
- ✅ Retries on failure (max 3 attempts)
- ✅ Verifies GPU acceleration

**Usage:**
```bash
./scripts/start-whisper.sh
```

**What It Checks:**
1. whisper-server installation (Homebrew)
2. Model file exists (~whisper-models/ggml-base.en.bin)
3. FFmpeg available (for audio conversion)
4. Port 8080 availability
5. Server HTTP responsiveness
6. GPU Metal support

**Auto-Recovery:**
- Kills conflicting processes on port 8080
- Retries startup up to 3 times
- 5-second delay between retries

---

### 3. stop-whisper.sh (Graceful Shutdown)

**Purpose:** Stop Whisper server gracefully

**Features:**
- ✅ Sends SIGTERM first (graceful)
- ✅ Waits up to 10 seconds
- ✅ Force kills if necessary (SIGKILL)
- ✅ Verifies port is free

**Usage:**
```bash
./scripts/stop-whisper.sh
```

**Output Example:**
```
==========================================
  Whisper Server Shutdown
==========================================

[INFO] Found process(es): 76662
[INFO] Sending SIGTERM to process 76662...
..........
[INFO] Process 76662 stopped successfully

==========================================
  ✅ Whisper server stopped successfully
==========================================
```

---

### 4. check-whisper.sh (Health Monitoring)

**Purpose:** Comprehensive health check and status report

**Features:**
- ✅ Checks port occupation
- ✅ Shows process details (CPU, memory, uptime)
- ✅ HTTP health check with response time
- ✅ Verifies model file
- ✅ Checks GPU support
- ✅ Shows recent log entries

**Usage:**
```bash
./scripts/check-whisper.sh
```

**Output Example:**
```
==========================================
  Whisper Server Health Check
==========================================

[STATUS] Checking port 8080...
[INFO] ✅ Process(es) found: 76662

[STATUS] Process Details (PID: 76662):
  PID:     76662
  User:    soullab
  CPU:     0.0%
  Memory:  0.7%
  Uptime:  13:16
  Command: whisper-server -m /Users/soullab/whisper-models/ggml-base.en.bin --host 127.0.0.1 --port 8080 --convert

[STATUS] Performing HTTP health check...
[INFO] ✅ Server is responding to HTTP requests
[INFO]    Response time: 0.000390s

[STATUS] Checking model file...
[INFO] ✅ Model found: /Users/soullab/whisper-models/ggml-base.en.bin (144M)

[STATUS] Checking GPU support...
[INFO] ✅ Metal GPU support available
[INFO]    GPU: Apple M4 Max

==========================================
[INFO] ✅ Overall Status: HEALTHY
==========================================
```

---

## Startup Sequence (What Happens)

### Phase 1: Whisper Server (Local STT)
1. Kill any conflicting processes on port 8080
2. Verify whisper-cpp installation
3. Verify model file exists (ggml-base.en.bin)
4. Check FFmpeg availability
5. Start server: `whisper-server -m ~/whisper-models/ggml-base.en.bin --host 127.0.0.1 --port 8080 --convert`
6. Wait for HTTP endpoint to respond
7. Log to: `whisper-server.log`

**Startup Time:** ~5-8 seconds (model loading + GPU initialization)

### Phase 2: Ollama Service (Local Intelligence)
1. Check if Ollama installed
2. Check if service responding (port 11434)
3. Start Ollama.app if needed (macOS)
4. Verify DeepSeek-R1 model available
5. Wait for API to respond

**Startup Time:** ~3-5 seconds (if already running)

### Phase 3: MAIA Dev Server (Application)
1. Remove stale lock files
2. Start Next.js: `PORT=3003 npm run dev`
3. Wait for HTTP endpoint (localhost:3003)
4. Verify MAIA interface loads
5. Log to: `dev-server.log`

**Startup Time:** ~10-15 seconds (Turbopack compilation)

---

## Error Recovery

### Scenario 1: Whisper Server Won't Start

**Symptoms:**
- Port 8080 shows as occupied but server not responding
- "Local Whisper transcription failed" in browser

**Fix:**
```bash
# Force kill everything on port 8080
kill -9 $(lsof -ti:8080)

# Restart cleanly
./scripts/start-whisper.sh
```

### Scenario 2: Model Not Found

**Symptoms:**
- Startup fails with "loading model from '...' failed"

**Fix:**
```bash
mkdir -p ~/whisper-models
cd ~/whisper-models
curl -L -O https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin
```

### Scenario 3: Dev Server Lock File

**Symptoms:**
- "Unable to acquire lock at .next/dev/lock"

**Fix:**
```bash
rm -f /Users/soullab/MAIA-SOVEREIGN/.next/dev/lock
PORT=3003 npm run dev
```

### Scenario 4: Ollama Not Responding

**Symptoms:**
- "Failed to connect to Ollama"

**Fix (macOS):**
```bash
# Restart Ollama app
killall Ollama
open -a Ollama

# Wait 5 seconds
sleep 5

# Verify
curl http://localhost:11434/api/tags
```

---

## Production Deployment (Auto-Start on Boot)

### Option 1: macOS LaunchAgent (Whisper Server)

Create `~/Library/LaunchAgents/com.soullab.whisper.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.soullab.whisper</string>

    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/whisper-server</string>
        <string>-m</string>
        <string>/Users/soullab/whisper-models/ggml-base.en.bin</string>
        <string>--host</string>
        <string>127.0.0.1</string>
        <string>--port</string>
        <string>8080</string>
        <string>--convert</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <true/>

    <key>StandardOutPath</key>
    <string>/Users/soullab/whisper-server.log</string>

    <key>StandardErrorPath</key>
    <string>/Users/soullab/whisper-server-error.log</string>
</dict>
</plist>
```

**Enable:**
```bash
launchctl load ~/Library/LaunchAgents/com.soullab.whisper.plist
launchctl start com.soullab.whisper
```

**Disable:**
```bash
launchctl stop com.soullab.whisper
launchctl unload ~/Library/LaunchAgents/com.soullab.whisper.plist
```

---

## Monitoring and Maintenance

### Check All Services
```bash
# Quick status
lsof -ti:8080 && echo "✅ Whisper running" || echo "❌ Whisper down"
lsof -ti:11434 && echo "✅ Ollama running" || echo "❌ Ollama down"
lsof -ti:3003 && echo "✅ Dev server running" || echo "❌ Dev server down"
```

### View Logs in Real-Time
```bash
# Whisper server logs
tail -f whisper-server.log

# Dev server logs
tail -f dev-server.log

# Combined
tail -f whisper-server.log -f dev-server.log
```

### Resource Usage
```bash
# Check Whisper memory usage
ps aux | grep whisper-server | grep -v grep

# Check all MAIA processes
ps aux | grep -E "whisper|ollama|next-server" | grep -v grep
```

---

## Daily Workflow

### Morning Startup
```bash
cd /Users/soullab/MAIA-SOVEREIGN
./scripts/start-maia-full.sh
```

**Expected Time:** ~20 seconds total

### During Development
```bash
# Check health periodically
./scripts/check-whisper.sh

# View logs if issues arise
tail -f whisper-server.log
```

### End of Day Shutdown
```bash
# Stop Whisper (optional, can leave running)
./scripts/stop-whisper.sh

# Stop dev server
killall next-server

# Stop Ollama (optional)
killall Ollama
```

---

## Troubleshooting Decision Tree

```
Is voice input working?
├─ No → Check Whisper server
│   ├─ Run: ./scripts/check-whisper.sh
│   ├─ Is server running?
│   │   ├─ No → Run: ./scripts/start-whisper.sh
│   │   └─ Yes → Is server responding?
│   │       ├─ No → Restart: ./scripts/stop-whisper.sh && ./scripts/start-whisper.sh
│   │       └─ Yes → Check browser console for errors
│   └─ Check endpoint: curl http://localhost:3003/api/voice/transcribe-simple
└─ Yes → Is MAIA responding?
    ├─ No → Check Ollama
    │   ├─ Run: curl http://localhost:11434/api/tags
    │   └─ If fails → Start Ollama app
    └─ Yes → System fully operational ✅
```

---

## Security Notes

### Whisper Server Security
- **Bind Address:** 127.0.0.1 (localhost only, NOT 0.0.0.0)
- **No Authentication:** Not exposed to network, safe for local use
- **Audio Privacy:** Audio never leaves local machine

### Production Considerations
If deploying to production server:
1. Add authentication to Whisper endpoint
2. Use HTTPS/TLS for all connections
3. Implement rate limiting
4. Add request logging and monitoring

---

## Performance Optimization

### Whisper Server Performance
- **Model Choice:** Base model (fastest, good accuracy)
- **GPU:** Metal acceleration (Apple Silicon)
- **Typical Latency:** 1-2 seconds for 5-second audio
- **Memory:** ~250 MB resident

### Upgrade to Large Model (Higher Accuracy)
```bash
# Download large-v3 model (3GB)
cd ~/whisper-models
curl -L -O https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin

# Update start script to use large model
# Edit: scripts/start-whisper.sh
# Change: WHISPER_MODEL="$HOME/whisper-models/ggml-large-v3.bin"
```

**Trade-offs:**
- ✅ Higher accuracy
- ❌ 3x slower (3-5 seconds per utterance)
- ❌ 3x more memory (~500 MB)

---

## Summary

You now have a **bulletproof** MAIA voice system with:

✅ **One-command startup:** `./scripts/start-maia-full.sh`
✅ **Health monitoring:** `./scripts/check-whisper.sh`
✅ **Graceful shutdown:** `./scripts/stop-whisper.sh`
✅ **Auto-recovery:** Handles conflicting processes, retries failures
✅ **Comprehensive logging:** whisper-server.log, dev-server.log
✅ **Production ready:** LaunchAgent support for auto-start
✅ **100% Sovereign:** Local STT + local intelligence

**Zero external dependencies for transcription** (OpenAI only for TTS)

---

**🌟 Status: BULLETPROOF - Ready for Daily Use ✨**
