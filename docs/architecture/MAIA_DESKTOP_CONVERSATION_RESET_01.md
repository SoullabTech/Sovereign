# MAIA-DESKTOP-CONVERSATION-RESET-01

**Status**: ruled (founder, 2026-08-30). Specification, not yet implemented.
**Supersedes**: the incremental defect lane on Desktop voice.

---

## The ruling

> The witness shell became the product by accretion.

Desktop has accumulated several individually defensible mechanisms that do not
compose into one coherent conversational organism. Each was proven in isolation.
None of them was ever asked to hold a ten-turn conversation together.

A transcript can wrap correctly, a scrollbar can behave correctly, VAD can emit
the expected event — and the conversation can still be unusable. That is what
happened. Component-level evidence is no longer accepted as evidence that
Desktop conversation works.

## What this reset does to the open defects

These are **frozen as evidence, not scheduled as work**:

```
VOICE-LONG-FORM-CUTOFF-01
VOICE-TEXT-BUTTON-OVERLAP-01
WPM / utterance telemetry defect
interim viewport behaviour
re-listen / re-arm failures
remaining VAD tuning
```

Repairing them individually would deepen the accretion. They are symptoms of one
missing nervous system.

---

## Verified current state

Measured against `maia-desktop/src` at `2e566a3d6`. 4,589 lines.

| module | lines | what it owns |
|---|---|---|
| `main.js` | 563 | host: window, IPC validation, OS permissions, transport, composition |
| `conversation.js` | 389 | orchestration: transcription → MAIA → audio → history adoption |
| `shell-policy.js` | 385 | origin perimeter, House allowlist, navigation decisions |
| `renderer.js` | 371 | **its own** `listening` / `captureState` / `rebuilding` / `sending` |
| `shell.js` | 355 | platform BrowserView |
| `session.js` | 335 | sovereign auth / API base |
| `voice-lifecycle.js` | 267 | capture lifecycle, revocation causes |
| `voice/epoch.js` | 249 | epoch and tail guarantees |
| `turn.js` | 195 | turn outcome |
| `continuity.js` | 167 | thread adoption |
| `capture-liveness.js` | 163 | liveness supervision |
| `voice/vad.js` | 134 | end-of-utterance detection |
| `thread-watch.js` | 127 | live canonical-thread rebinding |

**Five independent state-holders** — `main`, `conversation`, `turn`,
`voice-lifecycle`, and the renderer — each interpreting the others' state. There
is no single object that knows what Desktop is doing conversationally.

### Two corrections to the initial reading

1. **The `main.js` header fossil is already annotated.** It now opens with
   `⛔ THIS HEADER WAS FALSE, AND THE FALSEHOOD COST A DEVICE WALK` and names the
   accretion directly. The comment was corrected; the architecture was not.

2. **The 8-second ceiling is not in Desktop.** `voice/utterance.js:27` sets
   `maxSamples: 48000 * 60` — sixty seconds. The 8000 ms ceiling lives in
   `lib/voice/androidVoiceFallback.ts`, the *web* fallback recorder. Desktop did
   not import it. `VOICE-LONG-FORM-CUTOFF-01` must not inherit a cause from the
   wrong lane; the web cut-off and any Desktop cut-off are, until shown
   otherwise, two different mechanisms.

---

## The architecture

### 1. One conversational authority

Exactly one object knows what Desktop is doing conversationally.

```
DesktopConversation
    identity
    thread
    capture
    turn
    playback
    history
```

The renderer holds **no conversational state**. It receives a snapshot; it sends
gestures.

```
renderer sends:        START_VOICE · STOP_VOICE · SEND_TEXT · CANCEL
renderer receives:     conversationSnapshot
```

Deleted from the renderer: `listening`, `captureState`, `rebuilding`, `sending`,
`thinking`, `answered`, `rejoined`. Each is a projection of authoritative
runtime state, and a projection that can disagree with its source is a defect
generator.

### 2. Capture state is not turn state

The conceptual mistake under most of the observed failures. **The microphone
being open is not the same thing as the member having a turn.** Two axes:

```
CAPTURE                        TURN
  closed                         idle
  opening                        hearing
  open                           finalizing
  recovering                     waiting_for_maia
  failed                         maia_speaking
```

An ordinary exchange:

```
capture=open / turn=idle
      ↓
capture=open / turn=hearing
      ↓
capture=open / turn=finalizing
      ↓
capture=open / turn=waiting_for_maia
      ↓
capture=open / turn=maia_speaking
      ↓
capture=open / turn=idle
```

`capture` never leaves `open`. The microphone session is not torn down between
conversational turns. **VAD ends an utterance; it does not end listening.**

### 3. "Start listening" opens a conversation session

Pressed once. Then: member speaks → pauses → MAIA answers → MAIA finishes →
MAIA is listening again. No second press, no restart gesture, no recreation of
the session, no microphone reset because one semantic turn completed.

### 4. Transcription is not a conversation message

The conversation contains only **committed member turns and committed MAIA
turns**.

While speaking, a small ephemeral speech surface sits near the composer — one or
two quiet lines, no growing paragraph, no internal scrollbar, no transcript
displacing controls, no message rewriting itself in place. On final:

```
ephemeral draft disappears  →  one committed member turn enters history
```

This removes the entire class of viewport surgery, including the fix accepted as
`DESKTOP-VOICE-LIVE-TRANSCRIPT-VIEWPORT-01`. That fix stays in the web surface,
where the constraint is different; Desktop does not inherit the problem it
solved.

### 5. The conversation never redraws underneath the member

Cross-device continuity is a **persistence property**. It is not permission to
replace the room while somebody is standing in it.

```
at launch                 adopt the member's current thread
while conversation active thread is PINNED
another device moves      Desktop may notice; it does not silently rebind
conversation ends         reconcile again
```

This preserves "one MAIA" without making the perceptual field unstable.
`thread-watch.js` keeps its detection; it loses its authority to act mid-session.

### 6. MAIA speaking must not destroy listening

Controlled half-duplex, first implementation:

```
while MAIA audio plays     capture graph stays alive; turn input disarmed
on playback `ended`        turn input re-arms; turn → idle
```

Not: stop capture → play → start a new capture → hope the lifecycles line up.
Genuine barge-in is added later, deliberately. First, ordinary human turn-taking
is made boringly reliable.

### 7. One composer, two forms of expression

There is no VOICE MODE and TEXT MODE. There is one conversation.

```
[ mic ]   Message MAIA…                                   [ send ]
```

Speak whenever listening is enabled. Type whenever you want. Text sent during an
open voice session momentarily disarms speech-turn creation, sends the text
turn, lets MAIA answer, and returns to listening.

### 8. Diagnostics leave the conversational layout

Every diagnostic is kept. None of them is part of MAIA. A hidden developer
shortcut exposes audio frames, VAD, epoch, RMS, transcription, latency, capture
liveness, thread.

> An instrument is not a companion.

The architecture should finally honour that sentence — it is already written in
the source.

---

## Organ disposition

Preserved, moved behind the controller:

```
native capture · epoch/tail guarantees · VAD · WAV + transcription transport
sovereign session/auth · MAIA API · audio playback · diagnostics
shell-policy origin perimeter · House allowlist
```

Rewritten:

```
renderer.js         → snapshot consumer + gesture emitter, no state
conversation.js     → absorbed into DesktopConversation
turn.js             → the TURN axis
voice-lifecycle.js  → the CAPTURE axis
thread-watch.js     → detection only, no mid-session authority
```

Not touched by this reset:

```
root electron/ (LabTools) · desktop-app/ (legacy) · jarvis-desktop/ (operator plane)
components/voice/VoiceInteractionBar.tsx and the web conversation UI
```

Desktop does not fork MAIA's conversation UI. It hosts the platform surface and
adds native capabilities at the governed Desktop boundary.

---

## The acceptance witness

Behavioural. Not a component screenshot, not a green VAD suite.

```
 1. open MAIA Desktop
 2. existing conversation appears correctly
 3. press the microphone once
 4. speak naturally for 30–60 seconds
 5. pause naturally
 6. completed words appear ONCE
 7. MAIA answers once
 8. MAIA speaks
 9. touch nothing
10. speak again
11. MAIA hears the second turn
12. repeat for TEN consecutive turns
13. throughout: no transcript overlapping controls, no history replaced,
    no microphone restart required, no words lost to a duration ceiling
14. type a turn
15. MAIA answers
16. speak again without reconstructing the session
```

If that does not work, Desktop Conversation is **red**, regardless of how many
component tests are green.

---

## Blocker, stated plainly

**The witness cannot pass today.** Desktop refuses the browser speech API by vow
(`ContinuousConversation.tsx:727`, D01 §XII) and posts audio to a local
transcriber at `http://127.0.0.1:8000`
(`app/api/voice/transcribe-simple/route.ts:20`), gated behind
`ALLOW_AUDIO_UPLOADS` and `ALLOW_AUDIO_TRANSCRIPTION`. The local sovereign
services are deleted from the founder Mac. Steps 6, 7, 11 and 15 require a
transcriber and a voice; there is none.

Two consequences, and they are separable:

1. The architecture below can be built and unit-witnessed without a transcriber.
   Both state axes, the snapshot/gesture contract, the pinned thread and the
   half-duplex handoff are testable against a fake transport.
2. **Nothing gets called green until a real member speaks to a real
   transcriber.** Restoring a sovereign STT on `127.0.0.1:8000` is a
   prerequisite of acceptance, not a step inside it.

`Whisper returning "You" for real speech is the absence of Whisper, not an error
in Whisper.` That sentence should survive into whatever gets built next.
