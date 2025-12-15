# 🛠️ Beta Dev Debug Checklist

> **Quick reference for engineers monitoring voice pipeline during beta testing**

---

## Pre-Test Environment Setup

```bash
# Enable full debugging
export MAYA_DEBUG_MEMORY=true
export MAYA_DEBUG_VOICE=true  
export BACKEND_LOG_LEVEL=debug

# TTS Configuration (for fallback testing)
export TTS_MOCK_MODE=false  # Set to true to test mock fallback
export SESAME_TTS_URL=http://localhost:8000
export ELEVENLABS_API_KEY=your_key_here
```

---

## Real-Time Monitoring

### 1. Console Logs to Watch For

#### ✅ Good Logs:
```
[Memory Debug] Context loaded: {sessionEntries: 5, journalEntries: 3, profileLoaded: true}
[TTS] Success with elevenlabs (1234ms)
[Voice Stream] Transcription received: "Hello Maya, how are you today?"
[ConversationalPipeline] Memory orchestration completed (145ms)
```

#### 🚨 Red Flag Logs:
```
[TTS Orchestrator] All services failed, returning mock audio
[ConversationalPipeline] Memory orchestration failed, using fallback context
[Voice Stream] Request timeout after 30s
[Voice Health] STT health check failed
```

### 2. Health Check Commands

Run these during testing sessions:

```bash
# Check STT status
curl -s http://localhost:3002/api/v1/voice/health/stt | jq

# Check TTS status  
curl -s http://localhost:3002/api/v1/voice/health/tts | jq

# Expected healthy STT response:
# {"status":"healthy","whisper":"available","models":["whisper-1"]}

# Expected TTS response (degraded is OK if ElevenLabs works):
# {"status":"degraded","services":{"sesame":{"status":"failed"},"elevenlabs":{"status":"healthy"}}}
```

### 3. Debug Panel Validation

In dev mode, the Oracle page should show:

```
🧪 Voice Pipeline Debug
TTS Service: elevenlabs | sesame | mock
Processing Time: <2000ms (preferred <1500ms)
Memory Layers: session: 5, journal: 3, profile: true, symbolic: 2
Recording: 🎙️ Active | ⏹️ Idle
```

---

## Debugging Common Issues

### Issue: Silent Voice Output
**Symptoms**: Text response appears but no audio plays
**Check**:
1. TTS health endpoint shows all services failed
2. Browser console for audio playback errors
3. Network tab for audio file requests

**Fix**: Verify `ELEVENLABS_API_KEY` or enable `TTS_MOCK_MODE=true`

### Issue: Generic Maya Responses
**Symptoms**: Maya says "What would be different?" instead of personal responses
**Check**:
1. Memory debug logs show empty context
2. `buildContext()` throwing errors in backend logs
3. Supabase connection issues

**Fix**: Check database connectivity and user session data

### Issue: Transcript Gaps
**Symptoms**: User speaks but no live transcript appears
**Check**:
1. Browser mic permissions granted
2. STT health endpoint returning healthy
3. Network requests to `/transcribe/stream` failing

**Fix**: Check `OPENAI_API_KEY` and network connectivity

### Issue: Processing Timeout
**Symptoms**: Conversation hangs in "processing" state
**Check**:
1. Backend logs for ConversationalPipeline errors
2. Upstream AI model rate limits
3. Memory orchestration timeout

**Fix**: Check API keys and rate limits

---

## Performance Benchmarks

### Target Metrics:
- **STT Latency**: <500ms first words, <2s complete transcript
- **Memory Orchestration**: <150ms context building
- **TTS Generation**: <3s for typical response (50-100 words)
- **End-to-End**: <5s from speech stop to audio playback start

### Monitoring Commands:
```bash
# Watch backend logs
tail -f backend/logs/debug.log | grep -E "(Memory Debug|TTS|Voice Stream)"

# Monitor API response times
curl -w "@curl-format.txt" -s http://localhost:3002/api/v1/voice/health/tts

# Check memory usage
ps aux | grep node
```

---

## Quick Fixes During Testing

### Emergency Fallback Activation:
```bash
export TTS_MOCK_MODE=true  # Forces mock TTS (always works)
```

### Reset Voice Pipeline:
1. Refresh Oracle page
2. Check mic permissions  
3. Restart backend if needed: `npm run dev`

### Clear Audio Cache:
- Delete `backend/public/audio/*` files if playback issues occur

---

## Success Indicators ✅

During a successful test session, you should see:

1. **Logs flowing**: Memory, TTS, and STT logs appear regularly
2. **Health checks green**: Both endpoints return healthy/degraded status
3. **Debug panel updating**: Shows real TTS service and memory data
4. **No error accumulation**: Occasional failures are OK, but not cascading errors
5. **Tester engagement**: Users continue talking (indicates pipeline feels natural)

---

## Emergency Contacts

If major issues arise during beta testing:

- **Backend Issues**: Check `/api/v1/health` endpoint
- **Voice Pipeline Down**: Run health checks, verify API keys
- **Database Issues**: Check Supabase dashboard
- **Performance Issues**: Monitor server resources

---

**🎯 Remember**: The goal is testers having natural conversations. If they're confused or frustrated with the tech, the pipeline needs fixing before expanding the beta.