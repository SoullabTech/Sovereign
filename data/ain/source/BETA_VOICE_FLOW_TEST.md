# 🎙️ Beta Voice Flow Test Protocol

> **Goal**: Validate that Maya's voice + memory pipeline feels natural, reliable, and intelligent.

---

## 1. Setup

```bash
export MAYA_DEBUG_MEMORY=true
export MAYA_DEBUG_VOICE=true
export BACKEND_LOG_LEVEL=debug
```

**Pre-flight checks:**
- Open Oracle page in Chrome (preferred)
- Check mic permissions are enabled
- Confirm `/api/v1/voice/health/stt` → healthy
- Confirm `/api/v1/voice/health/tts` → healthy or degraded (with fallback)

---

## 2. Flow Cycle Test (5 minutes)

Each tester completes **3 full cycles**:

### Cycle 1: Listening → Speaking → Transcript
- Press mic
- Say: *"Maya, what do you remember from my last session?"*
- Watch the torus pulse + live interim transcript
- **Expect**: Transcript updates in real time

### Cycle 2: Processing → Voice Playback
- Wait for torus to shift to processing state
- **Expect**: Maya responds with memory (journals / past sessions)
- Her voice should play automatically

### Cycle 3: Memory Reference Check
- Ask: *"What themes did I explore in my journal?"*
- **Expect**: Maya references real journal themes (not generic filler)

---

## 3. Stress Test (10 minutes)

Ask **3 different types of prompts**:

1. **Memory recall**: *"What did we talk about yesterday?"*
2. **Contextual reflection**: *"How does that connect to my goals?"*
3. **Open nudge**: *"What do you notice about my patterns?"*

### Expected Results:
- ✅ Maya uses Mirror → Nudge → Integrate scaffold
- ✅ Voice pipeline stays intact (no silent failures)
- ✅ Debug console shows memory layers + TTS service used

---

## 4. Continuity Test (Multi-turn, 5 minutes)

- Speak naturally for **3–4 turns** without resetting mic
- **Expect**:
  - Maya keeps context across turns
  - No reintroductions or forgetting mid-conversation
  - If fallback TTS triggered, voice still plays (mock or ElevenLabs)

---

## 5. Success Criteria ✅

- ✅ **90%+** of utterances → appear as live transcripts
- ✅ Maya **always responds** with memory context (not generic)
- ✅ Voice plays **every time** (even via fallback)
- ✅ Torus + waveform provide **clear** listening/processing feedback
- ✅ Testers report: *"I felt like I was having a natural conversation"*

---

## 6. Feedback Form (Quick)

1. Did Maya's voice loop feel smooth (no confusing gaps)?
2. Did she reference your memory naturally?
3. Were the torus + waveform indicators clear enough?
4. On a scale of 1–5, how natural did the conversation feel?
5. Would you use this daily if it worked like this consistently?

---

## 🛠️ Dev Debug Checklist

**During testing, engineers should verify:**

### Console Logs to Watch:
```
[Memory Debug] Context loaded: {sessionEntries: X, journalEntries: Y, ...}
[TTS Orchestrator] Sesame TTS failed, falling back to ElevenLabs: <error>
[Voice Stream] Starting transcription stream...
[ConversationalPipeline] Memory orchestration failed, using fallback context: <error>
```

### Health Check Endpoints:
```bash
curl http://localhost:3002/api/v1/voice/health/stt
curl http://localhost:3002/api/v1/voice/health/tts
```

### Expected Debug Panel (Dev Mode):
- **TTS Service**: sesame | elevenlabs | mock
- **Processing Time**: <2000ms preferred
- **Memory Layers**: session: X, journal: Y, profile: true/false
- **Recording**: 🎙️ Active | ⏹️ Idle

### Red Flags 🚨:
- Silent failures (no voice output)
- Generic responses ("What would be different?")
- Transcript gaps >3 seconds
- Multiple TTS fallback attempts
- Memory orchestration errors

---

**👉 This protocol ensures every tester experiences Maya's "alive" loop:**  
🎤 **Mic** → 📝 **Transcript** → 🧠 **Memory** → 🔊 **Voice**