# MAIA Voice Implementation Plan
## State Machine, Instrumentation, and Realtime Migration Steps
**Date**: 2026-03-14
**Status**: Internal — engineering
**Companion to**: `voice-experience-review-2026-03.md`

---

## The Clean Split

This document is explicitly for **implementation work**. It does not describe MAIA's relational intelligence, memory, or symbolic guidance — those are handled by the oracle layer. It describes the **voice runtime**, which is the carrier of all of that.

Three layers, three responsibilities:

| Layer | Responsibility | Owner |
|-------|---------------|--------|
| **Voice runtime** | Audio streaming, turn detection, latency, state clarity | This document |
| **MAIA orchestration** | System prompt, memory, spiral state, therapeutic lens | Oracle layer |
| **Claude Code** | Build, refactor, harden, instrument | Implementation work |

The layers must not blur. A regression in voice runtime cannot be fixed by making the oracle smarter. A gap in MAIA intelligence cannot be papered over with faster TTS.

---

## Canonical Voice State Machine

The current implementation has voice state scattered across `OracleConversation.tsx`, `ContinuousConversation.tsx`, and several hooks. The result is emergent behavior that is hard to reason about and harder to recover from.

The target is one canonical state model, owned in one place.

### States

```
idle
  └→ listening          (mic opens, VAD active)
       └→ processing    (transcript submitted, oracle request in-flight)
            └→ speaking (TTS playing, mic closed)
                 └→ idle or listening (mic reopens after playback)

At any state:
  → recovering          (audio error, mic failure, or timeout detected)
       └→ idle or listening (after recovery prompt acknowledged)
  → blocked             (hard failure — requires user action to resume)
```

### State Invariants

1. **Only one state is active at a time.** No "kind of listening while also kind of speaking."
2. **Every transition is logged.** See Instrumentation section.
3. **Every state is visible to the user.** See Voice Session Mode section.
4. **No transition happens in a catch block without going through `recovering` first.** Catch blocks should set state to `recovering`, not silently re-enter `listening`.

### Implementation Target

```typescript
type VoiceState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'recovering'
  | 'blocked';
```

Single state atom, single setter, single subscriber. All component state should derive from this, not compete with it.

---

## One Audio Pathway

### Current problem

There are currently multiple competing audio initialization patterns:
- `OracleConversation.tsx` creates its own AudioContexts (now partially fixed)
- `voice-feedback-prevention.ts` had its own keep-alive interval
- `StreamingAudioQueue.ts` has its own context readiness check
- Various fallback paths create new contexts on failure

Each extra initialization path is a surface where iOS can get confused about which context is active.

### Target

One shared AudioContext. One keep-alive mechanism. Everything else reads from `ios-audio-session.ts`.

```
ios-audio-session.ts
  └─ getAudioContext()          → single shared context
  └─ ensureAudioReady()         → resume before every playback
  └─ startSessionKeepAlive()    → 1Hz subsonic oscillator (continuous)
  └─ unlockAudioOnUserGesture() → auto-installed, called once
```

No component should call `new AudioContext()`. No component should implement its own keep-alive. The session keep-alive starts when voice mode activates and stops when it exits.

### Specific removals (not yet done)

- [ ] Audit `OracleConversation.tsx` for any remaining `new AudioContext()` — should be zero after fixes this session
- [ ] Confirm `StreamingAudioQueue.ts` uses `ensureAudioReady()` from shared module before every `attemptPlay()`
- [ ] Confirm `voice-feedback-prevention.ts` no longer owns a keep-alive interval
- [ ] Search for `new (window.AudioContext` across all voice-related files — should return nothing

---

## One Live-Voice Provider Path

### Current state (post this session)

OpenAI TTS is the default. Kokoro is only attempted when `MAIA_TTS_PROVIDER=kokoro` is explicitly set. This is correct.

### What must not change

Do not re-introduce provider selection logic inside the live voice hot loop. The current architecture has `ttsWithFallback.ts` and `ttsRouter.ts` — these are valid abstractions, but during an active voice session, there should be no runtime branching between providers. Provider is resolved once at session start (or at server config time), not per-request.

### Rules for live session

1. One provider resolves before the session starts
2. If the provider fails mid-session, the session goes to `recovering` — it does not silently try a different provider
3. The user sees a recovery UI and can choose to reconnect
4. Provider switching is a settings-level operation, not a live-voice-path operation

---

## Full Instrumentation

The second biggest source of tester confusion (after the actual breaks) is **not knowing what the system is doing**.

Every seam in the pipeline must be logged. These logs serve two purposes:
1. Give the engineering team a timeline to debug failures
2. Power a future real-time debug overlay for internal testing

### Required log points

All logs should use a consistent prefix: `[voice:STATE_NAME:SESSION_ID]`

```
[voice:idle] session started
[voice:idle→listening] mic opened
[voice:listening] VAD active
[voice:listening] partial transcript received: chars=N
[voice:listening] silence detected: duration=Nms transcript=N_chars
[voice:listening→processing] submitting transcript: chars=N
[voice:processing] oracle request started: requestId=X
[voice:processing] oracle first token received: latency=Nms
[voice:processing] oracle stream complete: totalChars=N
[voice:processing→speaking] TTS request started: chunk=1/N chars=N
[voice:speaking] TTS first byte received: latency=Nms
[voice:speaking] playback started: chunk=N
[voice:speaking] playback complete: chunk=N
[voice:speaking→listening] mic reopened: delay=Nms
[voice:ANY→recovering] failure: reason=X state=Y
[voice:recovering] recovery prompt shown
[voice:recovering→listening] recovery confirmed by user
[voice:recovering→blocked] recovery failed: reason=X
```

### What NOT to log

No transcript content. No oracle response content. Voice logs are structural telemetry, not session content.

---

## Dedicated Voice Session Mode (Phase 2)

The current architecture treats voice as "chat with a microphone." The target is a distinct mode with its own assumptions.

### What Voice Session Mode owns

1. **Session lifecycle**: explicit start, explicit end, no ambiguous middle states
2. **State visibility**: user can always see which state the system is in
3. **Recovery UI**: when the system breaks, the user gets a clear, actionable prompt
4. **No hidden transitions**: every state change updates the UI

### Required UI elements

| State | User sees |
|-------|-----------|
| `idle` | "Tap to begin" or session not started indicator |
| `listening` | Animated mic indicator, "Listening..." |
| `processing` | "Thinking..." or spinner |
| `speaking` | Audio waveform or "Speaking..." |
| `recovering` | "Something went wrong — tap to reconnect" |
| `blocked` | "Voice is unavailable — try refreshing" |

The user must never have to guess. "Is she listening?" is a product failure. "Did it freeze?" is a product failure. Every ambiguous state is a recovery failure.

### Recovery flow

```
failure detected
  → set state to 'recovering'
  → log failure with reason
  → show recovery prompt to user
  → user taps to reconnect
  → attempt mic restart
  → if success: → listening
  → if failure: → blocked (show refresh prompt)
```

### What this does NOT require

WebRTC. Phase 2 Voice Session Mode can be built entirely on top of the current serial pipeline, with proper state management and a dedicated recovery UI. It is a UX and state machine improvement, not an audio pipeline change.

---

## Realtime Migration Path (Phase 3)

This is the architectural endgame. It resolves the structural choppy-ness that Phase 1 and Phase 2 cannot fix.

### Why this is necessary

Phase 1 stabilizes the serial pipeline. Phase 2 makes failures legible. Neither changes the fundamental shape:

```
mic → transcript → oracle → TTS → playback → mic
```

Each arrow is latency. The gaps between states are felt by the user as hesitation. No amount of tuning makes a serial pipeline feel like a continuous conversation.

### Target architecture

```
Client PWA (WebRTC peer)
    ↔ OpenAI Realtime session (audio + events)
    ← MAIA server (ephemeral key issuance + event hooks)
    → MAIA oracle layer (system prompt, memory, lens — injected at session creation)
```

This gives:
- Continuous audio pipeline (no TTS round-trip per sentence)
- Server-side VAD with semantic mode (model waits for a complete thought, not just silence)
- Natural interruption without timer hacks
- Sub-200ms response feel

### MAIA sovereignty in this model

The concern: if OpenAI handles the audio pipeline end-to-end, does MAIA lose its relational intelligence?

No — but only if the integration is built correctly:

1. **System prompt injected at session creation**: MAIA's oracle layer constructs the full system prompt (including spiral state, mode, therapeutic lens, memory context) and passes it to the Realtime session at init time. This is the same prompt that drives the current serial path.

2. **Turn events forwarded to MAIA backend**: The Realtime API emits `conversation.item.completed` events. These are forwarded to the MAIA server for memory updates, session logging, and spiral state persistence.

3. **MAIA server issues ephemeral keys**: The client never holds long-lived API credentials. The MAIA server mints a short-lived session token via `/api/voice/webrtc-session`. This route already exists.

4. **No cloud storage of session content**: OpenAI Realtime does not persist audio. Turn events forwarded to MAIA are processed for structural signals (spiral motion, relational phase) — not stored as conversation content.

### Starting point

```
app/api/voice/webrtc-session/route.ts  ← already exists, evaluate as starting point
```

Evaluate this route before building anything new. It may already have the ephemeral key issuance pattern.

### Migration sequence

1. Evaluate `/api/voice/webrtc-session` route — is it functional? What does it return?
2. Build a minimal proof-of-concept: WebRTC Realtime session with MAIA system prompt injected, no memory/lens integration yet
3. Test on iPhone Safari PWA — this is the primary target environment
4. Layer in turn event forwarding for memory updates
5. Add therapeutic lens + spiral state to session init
6. Once stable, make Realtime the default path for voice mode; keep serial path as fallback for environments where WebRTC is blocked

---

## Implementation Priority Order

```
1. One state machine (Phase 2 foundation)
   - Extract canonical VoiceState type
   - Route all state changes through single setter
   - Log every transition

2. One audio pathway (Phase 1 hardening)
   - Audit and remove any remaining competing AudioContext creation
   - Confirm StreamingAudioQueue uses ensureAudioReady() from ios-audio-session.ts
   - Confirm voice-feedback-prevention.ts has no interval keep-alive

3. Recovery UI (Phase 2)
   - Add visible state indicator to Voice Session Mode UI
   - Implement recovering state with user-facing prompt
   - Implement blocked state with refresh prompt

4. Instrumentation (Phase 1 hardening / Phase 2)
   - Add all required log points to state machine transitions
   - Confirm no session content appears in voice logs

5. WebRTC proof-of-concept (Phase 3 start)
   - Evaluate existing /api/voice/webrtc-session route
   - Minimal Realtime session with MAIA system prompt injection
   - iPhone Safari PWA test
```

---

## What Claude Code Is For Here

Claude Code should be used for:
- Extracting and centralizing the voice state machine
- Removing competing audio initialization patterns
- Adding instrumentation to state transitions
- Implementing the recovery UI and state visibility layer
- Evaluating and extending the WebRTC session route

Claude Code should not be used as a substitute for:
- Solving latency in the serial pipeline (structural, not code quality)
- Deciding on the runtime architecture (already decided: WebRTC is the target)
- Making a choppy pipeline feel continuous through prompt engineering

The runtime problem is architectural. Code quality and discipline make it buildable and maintainable. They do not change the shape of the pipeline.

---

*Read alongside `voice-experience-review-2026-03.md` before starting any voice work.*
