# DESKTOP-PLATFORM-CONVERSATION-01 — composition census

**Date:** 2026-08-30 · **Status:** read-only census. No code changed.
**Ruling it serves:** B — one canonical MAIA conversation surface. Desktop hosts it; Desktop does not fork it.
**Adjudicates:** `c7873fe4c` is valid conversational-domain foundation wired to the wrong composition root.

---

## 0 · Why this census exists

356 tests passed around a conversational nervous system that was not connected to
the body the founder was using. `DesktopConversation` governs `maia-desktop/src/renderer.js`;
the member sees `https://soullab.life/maia` in the platform `BrowserView`. Those two
cannot reach each other, by design.

⛔ **The boundary is not the defect.** `shell.js:7-13` states the invariant:

```
BrowserWindow
├── webContents      file://index.html · preload.js · window.maia
└── platform view    https://soullab.life · NO preload
                     partition 'maia-platform' · sandboxed
```

The platform view has no `window.maia` because remote content and the privileged
bridge must never share a webContents. That stays. This census exists to find the
seam that does **not** require breaching it.

---

## 1 · The actual member-facing path

```
main.js  goTo(MAIA)                       reveals the platform view over the local renderer
  └── shell.js  navigate('/maia')         attach() → setPlace(PLATFORM) → loadURL
        └── https://soullab.life/maia
              app/maia/page.tsx
                └── components/OracleConversation.tsx          (11,029 lines)
                      ├── voice/ContinuousConversation.tsx     (4,273 lines)  ← capture + STT
                      └── voice/VoiceInteractionBar.tsx                        ← the visible bar
                            └── lib/voice/androidVoiceFallback.ts  recordAndTranscribe
                                  └── POST /api/voice/transcribe-simple  → maia-whisper (server-side)
```

`maia-desktop/src/renderer.js`, `turn.js`, `voice-lifecycle.js`, `voice/*` and
`desktop-conversation.js` are **not on this path**. They are mounted underneath and,
after `goTo(MAIA)`, never visible.

---

## 2 · The eight questions

### 1. How does the platform surface detect it is inside MAIA Desktop?

By **user-agent product token**, nothing else. `lib/utils/platformDetection.ts:46`:

```ts
const DESKTOP_SHELL_UA_MARKER = /\bmaia-desktop\//i;
export function isDesktopShell(userAgent?) {
  if (Capacitor.isNativePlatform()) return false;
  return DESKTOP_SHELL_UA_MARKER.test(ua);
}
```

The token comes from Electron's **default** user agent, which embeds
`<package.name>/<package.version>` → `maia-desktop/0.0.1-d01`. No code in
`maia-desktop/src` sets a user agent; `ds02-ua-marker` guards the package name for
exactly this reason.

⚠️ **Fragility to record, not to fix here.** Classification depends on a token nobody
sets deliberately. A rename, an `app.userAgentFallback`, or an Electron default change
silently reclassifies Desktop as an ordinary browser — and the branch it would fall
into is the browser Web Speech path, which D01 §XII forbids.

### 2. Which voice implementation does it select there?

`ContinuousConversation.tsx:3417` and `:3424`:

```ts
const voiceTransport = selectVoiceTransport({ isNative, isDesktop, hasSpeechRecognition, canRecordAudio });
if ((info.isDesktop || !hasSpeechRecognitionAPI()) && canRecordAudio) { … sovereign path … }
```

Desktop is admitted **by classification, never by capability** — Chromium ships
SpeechRecognition, so a capability test would route Desktop onto the browser service.
Web Speech is refused structurally at its single construction site
(`:727`, `initializeSpeechRecognition` returns `null` when `isDesktopShell()`).

### 3. Web Speech, MediaRecorder→sovereign Whisper, or nothing?

**MediaRecorder → sovereign Whisper**, when classification holds. The dispatch is
`selectVoiceTransport` → `sovereign-whisper`, logged at `:3422` as
`[voice] transport: sovereign-whisper { platform: 'desktop' }`.

⚠️ The transport is **logged, not dispatched on** — the `if` at `:3424` re-derives the
same decision from raw facts. Two expressions of one rule; they agree today.

### 4. Where does the visible `LISTENING` come from?

```
ContinuousConversation :3473   onRecordingStateChange?.(true)
  → OracleConversation :1802   handleRecordingStateChange → setIsListening(true)
      → :874                   voiceInteractionState = isListening ? 'listening' : …
          → VoiceInteractionBar          the green "listening" chip
          → holoflower                   the large LISTENING label
```

`handleRecordingStateChange` is commented **"This is the SOURCE OF TRUTH for whether
mic is actually live."**

### 5. Is that state based on real audio-frame admission, or a gesture?

⛔ **A gesture. This is the finding.** `ContinuousConversation.tsx:3446-3473`:

```ts
stream = await navigator.mediaDevices.getUserMedia({ audio: true });   // 3446
…
setMicState('LISTENING', 'web_whisper_fallback');                      // 3472
onRecordingStateChange?.(true);                                        // 3473
…
const { recordAndTranscribe } = await import('…/androidVoiceFallback');// 3503
```

LISTENING is claimed when the **microphone handle resolves** — before `MediaRecorder`
is constructed, before the analyser exists, before one sample is admitted.

This is **exactly MAIA-D02A**, on the surface D02A never covered. The local Desktop
stack built `capture-liveness.js`, a watchdog, and a whole state contract to make
"Listening…" unreachable without frame receipt, because the interface once held it for
sixteen seconds against zero frames. The platform surface has no equivalent, and it is
the surface the member actually meets.

### 6. What conversational authority governs `ContinuousConversation.tsx`?

No single one. At least **five independent holders**, each interpreting the others:

| holder | where | what it means |
|---|---|---|
| `MicState` (9 states) | `ContinuousConversation:69` | IDLE·ARMING·LISTENING·CAPTURING·SUBMITTING·WAITING_FOR_TTS·PLAYING_TTS·INTERRUPTED·ERROR |
| `isRecording` + `isRecordingRef` | ContinuousConversation | the component's own belief |
| `sovereignGenerationRef` | ContinuousConversation | stale-capture gate for the whisper path |
| `isListening/isActivating/isProcessing/isResponding/isAudioPlaying/isMuted/hasActivated` | `OracleConversation:835-1052` | the parent's seven booleans |
| `pwaVoice` | OracleConversation | a separate PWA voice state machine |

129 `useState`/`useRef` sites in `ContinuousConversation` alone. This is the same
five-state-holder shape RESET-01 §1 diagnosed in the Desktop tree — at ~15,300 lines
instead of ~4,800, and on the live member path.

### 7. What of `DesktopConversation` can become a shared portable domain module?

The authority is already pure — no Electron, DOM, fetch, timers, audio, filesystem or
clock, asserted by its own suite. Nothing about it is Electron-specific. It could move
to `lib/voice/` and be consumed by `ContinuousConversation` directly, in-process, with
**no IPC and no bridge**.

Directly transferable:

- the two axes (capture ⟂ turn) — the conflation under most observed failures
- the refusal discipline: invalid transitions refused, counted, never silent
- generation + turn-id staleness — `sovereignGenerationRef` is a partial hand-rolled version of it
- the pinned-thread rule
- the playback-ended handoff, which is *more* needed here (the web surface has TTS today)
- `inputArmed` as the one disarm both text and speech obey

⛔ Needs re-derivation, not transfer: `capture.state === 'open'` must be reached on
**frame admission**, which on this surface means the analyser's first trusted poll —
not `getUserMedia` resolving. Wiring the authority without fixing that would move the
gesture-time claim rather than remove it.

### 8. What genuinely requires a native capability boundary?

On the evidence, **almost nothing that is currently missing**. `getUserMedia`,
`MediaRecorder`, `AudioContext` and `<audio>` playback all work inside the platform
view, gated by `shell-policy.js:350 platformPermission` — audio only, main frame only,
platform origin only, and only while `maiaIsVisible()` (place `PLATFORM` **and** path
`/maia`). That gate is doing real work: leaving `/maia` withdraws the microphone.

Genuinely native, and already held by the shell: the attention/threshold rule, the
origin perimeter, credential minting, the House allowlist. None of them needs the
conversation authority to live in the main process.

---

## 3 · The first reason LISTENING can display while the first utterance never crosses

**The claim is made at gesture time, so it is true in every downstream failure.**

`onRecordingStateChange?.(true)` fires once `getUserMedia` resolves. From that instant
the surface reads LISTENING and will keep reading it whether or not:

- the analyser's `AudioContext` resumed (`androidVoiceFallback.ts:483` documents this exact
  symptom — *"a suspended context feeds the analyser pure silence → the VAD sees
  false-silence and stops at ~1.5s → 'listening but doesn't hear'"* — found for
  Firefox/Zen. ⚠️ **HYPOTHESIS, corrected 2026-08-30.** This section first read
  *"Electron's Chromium carries the same autoplay policy and Desktop now shares that
  branch"* as though it were established. It is not. Desktop does share the branch —
  that is read from the code — but nothing here shows a suspended context occurred on
  the founder's Mac, or caused the failure. PLATFORM-D02A-01 makes the case
  *observable* (`audio_admitted` fires or it does not) precisely so it can be settled
  by evidence rather than assumed),
- the track is live, muted, or ended,
- `/api/voice/transcribe-simple` answers, 410s on `ALLOW_AUDIO_TRANSCRIPTION`, or fails,
- the recording ever stops.

Nothing between the gesture and the transcript can correct the label, because no signal
downstream of it feeds back into `isListening`.

**Desktop-specific aggravation — also a hypothesis, not a cause.** `:3515` sets
`maxMs: DESKTOP_MAX_UTTERANCE_MS`
= **120 000 ms** (`lib/voice/desktopUtteranceLimits.ts:40`); every other browser on this
branch keeps the module's 8 000 ms bound. The silence-stop needs
`elapsed ≥ 800 && silenceFor ≥ 1500` with `SILENCE_RMS_THRESHOLD = 0.012`
(`androidVoiceFallback.ts:40-43, 551`). If the silence-stop never concludes — a stream
whose RMS stays above threshold, room tone, a DC offset — the member sits in LISTENING
for **two minutes** before anything is sent. On Desktop alone that reads as frozen.

So there are two failure shapes behind one indistinguishable label, and the console
separates them:

| observed | meaning |
|---|---|
| no `[voice] transport:` line | classification failed — the UA token is absent, and it took a non-Desktop path |
| `transport: sovereign-whisper` then a transcript in ~1.5 s that is truncated or empty | analyser false-silence — stopped early |
| `transport: sovereign-whisper` and nothing for ~2 minutes | silence-stop never concluded — the 120 s ceiling |
| `transport: none` | `canRecordAudio` false — no MediaRecorder/getUserMedia in that context |

⛔ Until LISTENING is grounded in frame admission, every one of these presents
identically to the member, which is why the device walk produced no usable signal.

---

## 4 · What this census does NOT do

No code moved. `ContinuousConversation.tsx` is unedited, no IPC added, the authority is
where it was. The next unit decides how much of `DesktopConversation` becomes a shared
`lib/` domain module consumed by the canonical surface.

## 5 · Debt this opens

⛔ **RESET-01 still contains both horns.** `docs/architecture/MAIA_DESKTOP_CONVERSATION_RESET_01.md`
§1–§7 describe `renderer.js` as the member-facing conversation and list it under
*Rewritten*, while its Organ disposition says *"Desktop does not fork MAIA's conversation
UI. It hosts the platform surface."* Under ruling B the second is authoritative. The
document must be amended so a later lane cannot read the first and wire the hidden
renderer again — which is precisely what happened.


---

## 6 · Amendment log

**2026-08-30** — two sentences in §3 stated hypotheses in the grammar of findings: the
Electron/Firefox `AudioContext` similarity, and the 120 s ceiling as the cause of the
observed freeze. Both are corrected above and marked. Neither has evidence behind it;
both are now *observable* under PLATFORM-D02A-01 rather than assumed. A census is a
reading of code, and a reading of code cannot establish what happened on a device.
