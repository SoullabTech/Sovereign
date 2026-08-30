# MAIA-CONVERSATION-HARVEST-01

**Status:** census complete · classification proposed · no code moved
**Date:** 2026-08-30
**Ruling this serves:** *"Canonical `/maia` should survive as the MAIA surface. Mini MAIA should survive as evidence about how MAIA should converse."*

This is a **behavioural** comparison, not a visual one. Nothing here proposes copying
`renderer.js` into React. The question is: *which of mini MAIA's conversational truths
should become substrate-independent MAIA behaviour?*

---

## 0. The finding that reframes the rest

Most of mini MAIA's lessons **already exist on `/maia`**. `micLiveness.ts`,
`utteranceTail.ts`, `restartAuthority.ts`, `rapidEndPolicy.ts`, `webSpeechLifecycle.ts`
and `crossSurfaceAdoption.ts` are all web-side, all live, all imported by
`components/voice/ContinuousConversation.tsx`. Each carries a header naming the field
incident that produced it.

So the difference is not *knowledge*. It is **where the knowledge sits**:

> `/maia` holds these truths as **repairs layered onto a permissive core**.
> Mini MAIA holds them as **the shape of the core itself**.

On `/maia`, `LISTENING` is asserted at connect and *retracted later* if a watchdog
proves it false. In mini, `LISTENING` cannot be asserted until a frame arrives. Same
truth; opposite direction of authority. That inversion is the harvest.

---

## 1. Behavioural census

| Question | Mini MAIA | Canonical `/maia` |
|---|---|---|
| **Who owns microphone lifecycle?** | One owner per window. `renderer.js` opens the stream; **main is authoritative** about liveness; `capture-liveness.js` is a pure decision function with no DOM and no timer. | `ContinuousConversation.tsx` (**4,212 lines**) owns the conversational mic, containing **4 capture paths** (Web Speech · native Capacitor · Android MediaRecorder fallback · desktop/Firefox MediaRecorder+Whisper). A **second** capture owner — `lib/hooks/useVoiceInput.ts` behind `ModernTextInput` — is mounted on the same screen. Repo-wide: **36 files** call `getUserMedia`. |
| **What makes `LISTENING` true?** | **Frame receipt, and nothing else.** A distinct `STARTING` state exists precisely so *"worklet connected"* can never mean *"listening"*. `noteFrame()` is the only promoter. | `onstart` from the recognition object → `setMicState('LISTENING', 'web_recognition_started')`. **5 distinct sources** set `LISTENING`. `micLiveness.ts` then *watches for* silent death after the claim was already made. |
| **Who decides a turn is complete?** | Explicit grammar. VAD emits `utterance_boundary`; `utterance.take()` is the only way to empty the audio buffer and it returns what it removed; `epoch.commit()` sends **only committed finals**. | A `silenceThreshold` timer (component default **12000 ms**; `VOICE_TIMING` says 3500 Talk / 10000 Care / 999999 Scribe) **plus** an independent adaptive audio-level detector in a separate effect. Both call `processAccumulatedTranscript()`, which needs `isCallingProcessRef` to guard against **concurrent invocation**. |
| **What happens on capture loss?** | Bounded and stated. `MAX_RECOVERIES = 1`, then `UNAVAILABLE` and the member is told **in words**. Tail is salvaged or the loss is explicitly emitted. | `setMicState('ERROR', 'capture_loss_…')` + `salvageTranscript(cause)` + `snapshotCaptureForensics`. Salvage **exists** and works — but it is invoked from **3 separate call sites** by discipline, not funnelled through one structural gate. |
| **Can pauses prematurely finish speech?** | **Structurally guarded.** An utterance boundary is *never* an epoch boundary. Capture keeps running through the pause; speech resuming continues the same epoch with accumulated finals intact. Silence is a relational event, not a timeout. | Guarded by **threshold values**, not structure: 12 s silence + `GRACE_WINDOW_MS` 750. A pause exceeding the threshold **does** end the turn. Generous, and correct in practice — but it is a number, not an invariant. |
| **Who owns playback/listen coordination?** | One owner. MAIA's audio returns **on the same call** as her words (`includeAudio: true`), so there is no second TTS round trip and **no place for voice to diverge from text**. One `<audio>` element. | Distributed across ≥4 modules: `useStreamingVoice` (constructs `new Audio()` in 2 places) · `MicState.PLAYING_TTS` · `voiceLock` · `enhanced-feedback-prevention` · `webSpeechLifecycle` suspend/discard. |
| **Does conversation survive surface change?** | Yes, and **continuously**. `adoptMemberThread()` at sign-in, `canonicalThreadId()` + `thread-watch.js` polling. Read-only: Desktop **observes and conforms**, never pushes its idea of the thread outward. | Yes — `crossSurfaceAdoption.ts`. **And here `/maia` is the stronger design**: adoption is *additive* and keyed on `exchange_id`+`seq`, so a rich local message (Keep state, integrity results, state vectors, delivery state, audio) is never overwritten by the server's four-column projection. |
| **How many independent state machines affect one turn?** | **4 pure ones** — liveness · vad · utterance · epoch — plus `thread-watch`. All pure, all dependency-injected, all exhaustively testable **without a microphone**. | `MicState` (9 states) · `restartAuthority` · `webSpeechLifecycle` · `micLiveness` · `rapidEndPolicy` · `utteranceTail` · `useStreamingVoice` · `voiceLock` · `ConversationalRhythm` · delivery status. |
| **What can cause MAIA to stop hearing after a response?** | Bounded: one recovery attempt, then `UNAVAILABLE`, said out loud. | Historically, two separate field-fatal defects, each now repaired: (a) the **restart-authority P0** — a turn ending in `SUBMITTING`/`WAITING_FOR_TTS` pinned `micState` at a value the guard rejected, so *every* later restart including an explicit user tap was refused for the rest of the session; (b) **VOICE-ABORT-01** — one benign 302 ms abort read as an infinite loop → capture loss → `ERROR`, mic never returned. |
| **How much UI machinery executes during a basic turn?** | `renderer.js` **371 lines**, 6 listeners, no framework. | `OracleConversation.tsx` **11,169 lines** — 67 `useEffect`, 125 `useState`, 25 `useRef` — plus `ContinuousConversation.tsx` (15/9/28) plus `app/maia/page.tsx` (8/45), plus ~40 imported subsystems. |

---

## 2. Classification of every mini behaviour

### SHARED SEMANTIC — should govern `/maia`, Desktop, and any future native host

1. **Frame receipt is the sole authority for `LISTENING`.** Not `getUserMedia` success,
   not a connected node, not the absence of an error. A distinct `STARTING` state is
   required so the claim cannot be made early. *(`capture-liveness.js`)*
2. **An utterance boundary is not an epoch boundary.** Silence may request a final; it
   may never tear down capture. A resumed sentence continues the same epoch with its
   accumulated finals. *(`voice/vad.js`)*
3. **The tail invariant.** No boundary may end with nonempty human speech state that is
   silently discarded — salvaged, or explicitly declared lost. Enforced **structurally**:
   `openPartial` is private and exactly one function can clear it. *(`voice/epoch.js`)*
   The same rule one layer down for audio: `take()` is the only way to empty the buffer,
   and it returns what it removed. *(`voice/utterance.js`)*
4. **Capture loss is bounded and spoken.** A fixed recovery budget, then a member-facing
   statement. Never an unbounded retry, never a silent degradation.
5. **Finals are deduped by key.** A backend replaying a segment on reconnect must not
   double-count it — and a duplicate final must still close the open partial, or it
   becomes a hole material escapes through unreported.
6. **The near-silence gate, and its direction of travel.** Gate on *both* rms and peak;
   the threshold moves **down** on evidence of quiet real speech and never up to catch
   more hallucinations. Strip invisible/bidi characters before deciding a transcript is
   speech. And **never gate silently** — the member is told. *(`conversation.js`)*
7. **Desktop/any client observes the canonical thread; it never pushes one.** Continuity
   as a field, not a snapshot.

### DESKTOP ADAPTER — Electron-specific mechanism only

- AudioWorklet → renderer → IPC frame relay and its coalescing.
- `session.fromPartition` / `setPermissionRequestHandler` / surface-scoped
  `platformPermission()`.
- Main-process encrypted credential custody and `x-session-token` injection.
- `multipartWav` with an explicit `Content-Length` (a Node-`fetch` artefact; browsers
  already send it).
- The bounded transcribe retry — a **mitigation of a known server defect**
  (`TRANSCRIBE_BODY_DISTURBED_2026-08-27`), scheduled for removal when the server is fixed.

### EXPERIENCE QUALITY — worth bringing into canonical `/maia` UX

- **Visual calmness.** The thing that felt better. Proposed disposition: this becomes
  **Focus mode** on `/maia` — not a second product, a presentation of the one MAIA.
- **Diagnostics subordinate to the conversation**, never the experience itself.
- **MAIA's words and MAIA's voice arriving together** on one call, so the two can never
  diverge.
- **Failures explained in human sentences**, never a bare status code to someone who
  just spoke.

### HARNESS ONLY — useful for testing, never product behaviour

- The mini shell/window topology and its standalone `index.html`.
- The on-screen state/debug bar.
- The `platform-probe` surface.
- Any second sign-in surface.

### OBSOLETE — solved differently, and better, in canonical MAIA

- Mini's thread adoption *replaces* the local id. `/maia`'s `crossSurfaceAdoption.ts` is
  **additive and identity-keyed**, preserving rich local message state the server does
  not model. **Canonical wins; mini should converge on it, not the reverse.**
- Mini's single Whisper path. `/maia` legitimately needs per-platform capture routing.
  The lesson to carry is *not* "one backend" but "one **turn lifecycle** regardless of
  backend."

---

## 3. The one architectural recommendation

The four pure modules — `capture-liveness` · `vad` · `utterance` · `epoch` — hold no
Electron, no audio API, no DOM, no timer and no clock. That is why the tail invariant
can be proven exhaustively on Linux for a microphone that only exists on macOS.

They are already substrate-independent. **Nothing about them is Desktop.**

The proposal is therefore not a rewrite of `/maia` but a **relocation**: move those four
to a shared module both surfaces consume, and let `ContinuousConversation`'s per-platform
capture paths feed one lifecycle instead of four. `/maia` keeps its capture routing, its
UI, its rich messages and its superior cross-surface adoption. What it gains is that
`LISTENING`, turn completion, and the tail stop being **four parallel implementations
defended by four separate regression tests**, and become one contract.

**Not authorised by this document.** This is a census and a classification. The
relocation is its own lane and its own ruling.

---

## 4. What this changes about the mini-MAIA disposition

The standing ruling — *HIDE, PRESERVE, DO NOT SHIP AS A SECOND MAIA* — is unchanged and
correct. This document is the harvest that must happen **before** it is hidden, so the
conversation research does not go with it.

> Its topology was temporary. Its conversation research is load-bearing.
