# MAIA Voice Experience Review
## Stabilization Plan and Realtime Architecture Path
**Date**: 2026-03-14
**Status**: Internal — engineering + product

---

## Diagnosis

The current voice stack is serial:

```
mic open → silence detected → submit → wait for oracle → request TTS → play → reopen mic
```

This can be improved at the margins, but it will remain structurally choppy compared to systems like OpenAI Realtime and Sesame AI. Those systems use continuous bidirectional audio pipelines with server-side VAD. MAIA is still operating as a request-response cycle that happens to include audio at the edges.

The bugs fixed this week (beeping oscillator, duplicate keep-alive, multiple AudioContext instances, fragile silence thresholds) were real and worth fixing. But fixing them does not change the underlying shape.

---

## What Is Actually Broken for Testers

### 1. The system exposes internal seams

Testers feel the handoff points:
- mic closes
- silence detector fires
- server thinks
- TTS starts late
- mic reopens awkwardly

This makes MAIA feel hesitant and unstable — not because the AI is wrong, but because the pipeline is visible.

### 2. Turn-taking is too fragile

The silence threshold is a guess. Too short: MAIA interrupts the user mid-thought. Too long: the conversation stalls. We are manually approximating what OpenAI's server-side VAD handles natively, including semantic VAD that waits for a complete thought, not just a silence window.

### 3. iPhone Safari PWA is the harshest environment

On iOS PWA, audio session handling is easy to destabilize. Every extra AudioContext, unlock workaround, fallback provider path, and mic restart sequence increases failure probability. The current system has too many of these layers.

### 4. Confusion is often worse than the actual bug

When the system breaks, testers do not know what happened:
- "Is she listening?"
- "Did it freeze?"
- "Did it hear me?"
- "Why did it stop talking?"

That ambiguity is a product failure even when the underlying bug is minor.

---

## What Was Fixed This Week

These were legitimate bugs that needed addressing regardless of the architecture path:

| Fix | File | What it resolved |
|-----|------|-----------------|
| Beeping oscillator | `OracleConversation.tsx` | Default 440Hz oscillator in audio unlock fallback was audible. Changed to 1Hz subsonic. |
| Click-creating keep-alive | `voice-feedback-prevention.ts` | 2-second interval playing 1-sample silent buffers created audible clicks. Replaced with the existing oscillator keep-alive from `ios-audio-session.ts`. |
| Multiple AudioContext instances | `OracleConversation.tsx` | Three separate places created new AudioContexts that weren't gesture-unlocked on iOS. All now share the single context from `ios-audio-session.ts`. |
| Premature submission | `ContinuousConversation.tsx` | Silence threshold raised from 5s to 8s. Minimum transcript length of 8 chars required before any auto-submission — prevents "um", "uh", fragments from triggering a MAIA response of "take your time." |
| Native silence timeout | `ContinuousConversation.tsx` | Increased from 2.5s to 4s with same 8-char gate. |
| Turn handoff speed | `ContinuousConversation.tsx` + `OracleConversation.tsx` | Mic restart delay reduced from 600ms to 300ms. Streaming cooldown reduced from 400ms to 200ms. |
| Kokoro in the hot path | `openai-tts/route.ts` | Kokoro is now only attempted when `MAIA_TTS_PROVIDER=kokoro` is explicitly set. Default goes straight to OpenAI, removing potential timeout latency from every request. |

These make the current architecture less bad. They do not change its structure.

---

## Product Rule for Live Voice

> **Reliability beats cleverness.**

If a fallback path saves 2% of edge cases but creates confusion for 15% of testers, it should go.

The current live voice mode has too many conditional paths — Kokoro fallback, multiple keep-alive methods, iOS unlock variants, PWA vs native detection branches. Each branch is a potential failure mode that a tester can hit.

---

## Three-Phase Plan

### Phase 1 — Stabilize what exists (this week)

Keep:
- OpenAI TTS only in the hot path
- One shared AudioContext per session
- One mic state machine (ContinuousConversation)
- Longer silence threshold (8s)
- Minimum transcript gate (8 chars)
- Reduced restart delays

Remove or avoid:
- Provider fallbacks during live voice
- Multiple audio initialization paths
- Custom keep-alive tricks beyond one proven method (the oscillator)
- Duplicate silence timers
- Hidden "nudge" responses in live voice mode unless explicitly intended

**Goal**: Stop the obvious failures that confuse testers. Make the system boring-reliable.

---

### Phase 2 — Dedicated Voice Session Mode

Do not keep treating voice as "chat with audio added."

Make it its own mode with its own contract. Voice Session Mode should have:

- A persistent session with explicit state: `listening | thinking | speaking | recovering`
- Visible status cues — the user should never have to guess whether MAIA is listening
- Graceful recovery when audio fails, with a clear recovery prompt ("Tap to reconnect")
- No hidden transitions — every state change should be visible to the user
- No overlapping fallback paths — one path per state

**UX invariant**: When it breaks, the user must understand what happened.

This does not require WebRTC. It can be built on top of the current architecture with a proper state machine and recovery UI.

---

### Phase 3 — OpenAI Realtime over WebRTC

This is the real upgrade path. A WebRTC Realtime session gives the architecture that systems with genuine flow use:

- Lower-latency audio pipeline (no TTS round-trip per sentence)
- Continuous session instead of repeated request cycles
- Server-side VAD with semantic mode — the model knows when you are done speaking
- Natural interruption and handoff without timer hacks
- Fewer local timing compensations

OpenAI's Realtime API supports WebRTC sessions with ephemeral key issuance from the server. The architecture is:

```
Client PWA (WebRTC peer)
    ↔ OpenAI Realtime session (audio + events)
    ← MAIA server (ephemeral key issuance + event hooks)
```

MAIA's oracle layer (system prompt, spiral state, therapeutic lens, memory) can be injected at session creation. Turn events from the Realtime API can be forwarded to MAIA's backend for logging and memory updates — this preserves sovereignty while using the Realtime audio pipeline.

**Note**: The `/api/voice/webrtc-session` route already exists in the codebase. It should be evaluated as the starting point.

---

## Proposed Architecture Progression

### Now — "Voice v1" (serial, current)
```
PWA mic capture
→ WebSpeech API transcript
→ oracle route (LLM)
→ OpenAI TTS
→ HTMLAudioElement playback
```
**Goal**: Make it dependable. One path, no fallbacks in the hot loop.

### Next — "Voice v2" (realtime)
```
PWA WebRTC peer
↔ OpenAI Realtime session
← MAIA server (session init + event hooks)
→ MAIA oracle layer (system prompt, memory, lens)
```
**Goal**: Make it fluid. Server-side turn detection, continuous audio, no TTS request latency.

---

## What to Stop Spending Time On

The following are diminishing returns in the current architecture and should not be further invested in as long-term fixes:

- Silence threshold tuning
- Mic restart timing
- TTS cooldowns
- Fallback provider chains
- AudioContext recovery hacks beyond one proven method

These are all symptoms of operating a serial pipeline in an environment that wants continuous audio. Further tuning them will produce marginal improvements at best.

---

## Decision Required

**For now**: Use OpenAI TTS only in the current PWA voice path. No local voice in the hot loop.

**Next milestone**: Build Phase 2 — Voice Session Mode with explicit states and visible recovery.

**Target architecture**: Move live conversation to OpenAI Realtime/WebRTC. This is the path to the level of flow we are targeting.

---

## Files Changed in This Session

```
app/api/voice/openai-tts/route.ts
components/OracleConversation.tsx
components/voice/ContinuousConversation.tsx
lib/voice/voice-feedback-prevention.ts
```

Commit on branch: `claude/elastic-villani`

---

*This document should be reviewed before further voice architecture work begins.*
