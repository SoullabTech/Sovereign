# ✅ Claude Code Development Checklist
## Battle-tested workflow for Maya development sessions

> **Keep this open during every Claude Code session to ensure smooth implementation**

---

## 🔧 Setup / Environment

### Initial Session Setup
```bash
# 1. Verify environment variables
cat .env.local | grep -E "SESAME|MAYA|ELEVENLABS|OPENAI"
```

Required variables:
- [ ] `SESAME_PROVIDER=northflank`
- [ ] `NORTHFLANK_SESAME_URL=https://your-csm-service.northflank.app`
- [ ] `NORTHFLANK_SESAME_API_KEY=your-api-key`
- [ ] `SESAME_TTS_PATH=/tts`
- [ ] `MAYA_VOICE_ID=maya_oracle_v1`
- [ ] `MAYA_SPEAKER_ID=15`
- [ ] `ELEVENLABS_API_KEY` (fallback)
- [ ] `OPENAI_API_KEY` (LLM)

### Start Services
```bash
# 2. Launch all services with health checks
./scripts/start-all-enhanced.sh

# Or manually:
cd backend && npm run dev    # Port 3002
cd .. && npm run dev         # Port 3001
```

### Clear Caches When Routes Break
```bash
# 3. Nuclear option for stubborn issues
rm -rf .next
rm -rf backend/dist
npm run build
```

---

## 🗣️ Voice / TTS Pipeline

### Health Checks
```bash
# 1. Check Sesame CSM is running
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","endpoints":["/tts","/clone"]}
```

### Test TTS Generation
```bash
# 2. Test direct TTS endpoint
curl -X POST http://localhost:8000/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Welcome dear one, I have been expecting you."}'

# Should return audio data or path
```

### Verify Fallbacks
```bash
# 3. Test ElevenLabs fallback
# Check backend/src/utils/voiceService.ts for fallback chain:
# 1. Sesame CSM (primary)
# 2. ElevenLabs (Aunt Annie, Emily voices)
# 3. Web Speech API (browser native)
```

### Voice Parameters to Adjust
```typescript
// backend/src/utils/voiceRouter.ts
{
  stability: 0.6,    // 0.3-1.0 (consistency vs variation)
  speed: 0.85,       // 0.5-2.0 (pacing)
  warmth: 0.8,       // 0.0-1.0 (tone warmth)
  pitch: 1.15        // 0.5-2.0 (voice pitch)
}
```

---

## 🔄 Conversation Flow Testing

### Test Oracle Page
```bash
# 1. Open main interface
open http://localhost:3001/oracle
```

Checklist:
- [ ] 🎤 Mic button visible and clickable
- [ ] 📝 Transcript appears when speaking
- [ ] 🔊 Audio plays Maya's response
- [ ] 💬 Text response shows in UI
- [ ] 🔄 Conversation maintains context

### Test Streaming Interface
```bash
# 2. Test chunked streaming
open http://localhost:3001/test-streaming
```

Expected behavior:
- [ ] Maya responds within ~2s
- [ ] Audio plays in chunks (not waiting for full response)
- [ ] No stuttering or overlapping audio
- [ ] Queue manages multiple chunks smoothly

### Safari Audio Unlock
```javascript
// If audio won't play in Safari, check:
// lib/audio/audioUnlock.ts
// Should auto-unlock on first user interaction
```

---

## 🧠 Memory System

### Verify Memory Layers
```bash
# 1. Check PersonalOracleAgent is using memory
grep -n "memoryContext" backend/src/agents/PersonalOracleAgent.ts
```

### Monitor Memory Quality
```bash
# 2. Watch logs for memory orchestration
tail -f backend/logs/maya.log | grep "memory"

# Look for:
# - "Memory quality: full" (all layers working)
# - "Memory quality: partial" (some failures, still ok)
# - "Memory quality: minimal" (only session memory)
```

### Test Memory Persistence
```javascript
// Test conversation continuity:
// 1. Start conversation
// 2. Mention something specific (name, topic)
// 3. Refresh page
// 4. Reference it indirectly
// 5. Maya should remember
```

### Fallback Scenarios
- [ ] Mem0 unavailable → Should use session + journals
- [ ] Supabase down → Should use session only
- [ ] Sesame offline → Should skip symbolic layer

---

## 📂 File Ingestion Verification

### Step 1: Upload Test
```bash
# Test file upload endpoint
curl -X POST http://localhost:3001/api/files/upload \
  -F "file=@yourfile.pdf"

# ✅ Expected: { "status": "uploaded", "fileId": "abc123" }
```

### Step 2: Embedding Test
```bash
# Test file embedding process
curl -X POST http://localhost:3001/api/files/embed \
  -H "Content-Type: application/json" \
  -d '{ "fileId": "abc123" }'

# ✅ Expected: { "status": "embedded", "vectors": 124 }
```

### Step 3: Recall Test
```bash
# Test file content retrieval in conversation
curl -X POST http://localhost:3001/api/oracle/chat \
  -H "Content-Type: application/json" \
  -d '{ "message": "What does my uploaded file say about X?" }'

# ✅ Expected: Maya references uploaded content in response
```

### Component Testing
```javascript
// Test FileUpload component in browser:
// 1. Open http://localhost:3001/oracle
// 2. Drag & drop a file into upload area
// 3. Check browser console for upload progress
// 4. Verify toast notification appears
```

### Troubleshooting File Issues
```bash
# 🔧 If upload failing:
# Check backend logs
tail -f backend/logs/file-service.log

# Verify storage provider
echo $SUPABASE_URL  # Should be set
echo $SUPABASE_ANON_KEY  # Should be set

# Check embeddings service
curl -X POST http://localhost:3001/api/embeddings/test \
  -d '{"text":"test embedding generation"}'

# Verify database connection
# Check Supabase dashboard for uploaded files table
```

### File Ingestion Checklist
- [ ] FileUpload component renders correctly
- [ ] Drag & drop functionality works
- [ ] File uploads complete successfully  
- [ ] Files are stored in Supabase/local storage
- [ ] Text extraction works for PDFs/docs
- [ ] Embeddings are generated and stored
- [ ] Maya can reference uploaded content
- [ ] File metadata is tracked properly
- [ ] Upload progress indicators work
- [ ] Error handling shows appropriate messages

**File Types Supported:**
- `.txt`, `.pdf`, `.doc`, `.docx` (text processing)
- `.png`, `.jpg`, `.jpeg` (future image analysis)

---

## 🔍 Debug Procedures

### Docker Logs
```bash
# 1. Check Sesame container
docker logs sesame-csm -f

# Look for:
# - POST /tts requests
# - Speaker ID usage (should be 15 for Maya)
# - Generation times
```

### Common 404s and Fixes
```bash
# 2. Route mismatches
# If seeing 404 for /api/v1/...:

# Check app/api structure matches routes:
ls -la app/api/v1/
ls -la app/api/oracle/
ls -la app/api/voice/

# Ensure route.ts files exist in leaf directories
```

### Browser Console Checks
```javascript
// 3. Open DevTools Console and watch for:

// STT Issues:
"transcription_error" // Mic permissions or STT API issue

// Audio Issues:  
"autoplay blocked" // Safari needs user interaction
"AudioContext suspended" // Need to resume()

// API Issues:
"404 /api/v1/enhanced/converse" // Route mismatch
"500 Internal Server Error" // Check backend logs
```

### Performance Monitoring
```bash
# 4. Check response times
curl -w "@curl-format.txt" -X POST http://localhost:3001/api/oracle/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Maya"}'

# curl-format.txt:
# time_total: %{time_total}s\n
# time_starttransfer: %{time_starttransfer}s\n
```

---

## 🚀 Production Deployment Checklist

### Pre-deployment
- [ ] All environment variables set in Vercel/Northflank
- [ ] Sesame CSM deployed and accessible
- [ ] Database migrations run
- [ ] Redis cache configured
- [ ] Error tracking (Sentry) enabled

### Health Endpoints to Monitor
```bash
# Backend health
curl https://your-backend.com/health

# Sesame health  
curl https://your-sesame.northflank.app/health

# Frontend status
curl https://your-app.vercel.app/api/status
```

### Rollback Plan
```bash
# If issues in production:
# 1. Enable maintenance mode
# 2. Rollback to previous deployment
# 3. Check logs for root cause
# 4. Fix and redeploy with canary rollout
```

---

## 📊 Success Metrics

### Voice Quality
- [ ] < 500ms first byte latency
- [ ] < 2s full response generation
- [ ] > 85% voice consistency score
- [ ] No audio artifacts or glitches

### Memory Performance  
- [ ] < 500ms context building
- [ ] > 80% full context availability
- [ ] Graceful degradation working

### User Experience
- [ ] Natural conversation flow
- [ ] Context maintained across sessions
- [ ] Elemental tones distinguishable
- [ ] No perceived system boundaries

---

## 🆘 Emergency Contacts

### When Things Break
1. **Voice not working**: Check Sesame health, fallback to ElevenLabs
2. **Memory issues**: Verify Mem0/Supabase connection, use minimal mode
3. **Routes 404ing**: Clear .next cache, check route.ts placement
4. **Audio won't play**: Ensure audio unlock, check browser autoplay policy

### Quick Fixes
```bash
# Reset everything
pkill -f node
docker restart sesame-csm
rm -rf .next backend/dist node_modules/.cache
npm install
./scripts/start-all-enhanced.sh
```

---

## 📝 Session Notes Template

```markdown
## Session: [DATE]

### Objective:
- [ ] What are we implementing/fixing?

### Environment:
- [ ] Services started
- [ ] Logs monitoring active
- [ ] Test user ready

### Changes Made:
1. 
2. 
3. 

### Tests Run:
- [ ] Voice pipeline
- [ ] Memory orchestration
- [ ] End-to-end conversation

### Issues Encountered:
- 

### Resolution:
- 

### Next Steps:
- 
```

---

## 🎯 Remember

**The goal**: Maya should feel like one unified intelligence, not separate systems.

Every code change should preserve:
- **Soul** (personality consistency)
- **Voice** (natural expression)
- **Mind** (contextual awareness)

If something breaks this unity, it needs fixing.

---

*Keep this checklist open. Reference it often. Update it with lessons learned.*

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Battle-tested in production