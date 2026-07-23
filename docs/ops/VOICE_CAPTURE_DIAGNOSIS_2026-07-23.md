# Voice capture — "MAIA can't hear me on iPhone" (2026-07-23)

**Diagnosed from production telemetry. Nothing patched.**

Not undiagnosed, and not a layout bug. `lib/voice/voiceDiagnostics.ts` already instruments
the full Web Speech lifecycle (`granted → listening_started → audio_started →
speech_started → result|error → ended`) and ships it to `/api/telemetry/client`. The
answer was already in production logs.

## Two distinct failures, two devices

### A — Safari **26.5.2** vs **26.6** on iOS 18.7: `service-not-allowed`

**The discriminator is the Safari build, not the device model and not Safari-vs-Chrome.**
Same account, same page, same day, iOS 18.7 in both cases:

**`Version/26.6` — session `v2px3o6m`, 14:20:09→14:20:16Z — full success**

```
voice_mic_granted        audioTracks:1  trackLabel:"iPhone Microphone"
voice_listening_started
voice_audio_started
voice_transcribe_result  isFinal:false  ×8
voice_speech_started
voice_transcribe_result  isFinal:true      ← final transcript delivered
voice_recognition_ended
```

**`Version/26.5.2` — sessions `j3iu7q56`, `9zkqdnc2`, `psew2984` — fails identically ×3**

```
voice_mic_granted        audioTracks:1  trackLabel:"iPhone Microphone"
voice_transcribe_error   error:"service-not-allowed"
```

Two consequences:

1. **The failure precedes listening.** No `voice_listening_started`, no
   `voice_audio_started` in the failing sessions — the recognizer is refused at start, not
   mid-stream. The microphone is granted in both cases (`iPhone Microphone`, 1 audio
   track), so this is **not** a mic-permission problem.
2. **This is a false state transition, not missing recovery copy.** The flower enters or
   remains in `LISTENING` even though recognition was refused *before listening began* —
   there is no `voice_listening_started` in these sessions at all. The interface is not
   merely silent about a failure; it performs a state transition that never occurred.

   The distinction matters for the fix. "Missing recovery copy" would be satisfied by
   adding a message beside a spinner. It is not enough here: the state itself is wrong,
   and the member is being told MAIA is listening when MAIA was refused. Adding an
   explanation while leaving `LISTENING` on screen would leave the interface still
   asserting something untrue.

Dictation-disabled remains possible but is now the weaker branch: if Dictation were off at
the device level, the 26.6 session could not have succeeded — *unless* these are two
different physical phones (Pro Max vs 16) both on iOS 18.7 with different Safari builds,
which is likely. `service-not-allowed` with the mic granted fits either.

**Two tests that separate them, in order:**
1. iPhone 16 → Settings → General → Keyboard → **Enable Dictation**. If off, enable and
   retry.
2. If already on → **update that phone to Safari 26.6**.

Either way telemetry answers within seconds: a working attempt emits
`voice_listening_started`.

### A (original reading) — iOS 18.7, Safari: `service-not-allowed`

```
voice_transcribe_error  error:"service-not-allowed"  session jnjwie6f  14:12:47Z
voice_transcribe_error  error:"service-not-allowed"  session wojgkrar  14:14:41Z
ua: iPhone; CPU iPhone OS 18_7 … Version/26.5.2 Mobile
```

`service-not-allowed` is **not** a mic-permission failure — that is `not-allowed`. It
means the speech-recognition *service* refused. On iOS, `webkitSpeechRecognition` is
backed by Apple's dictation service, so the leading cause is **Dictation disabled on the
device** (Settings → General → Keyboard → Enable Dictation), or Siri & Dictation blocked
under Screen Time restrictions.

Mic works. Browser works. Apple's service declines.

**Unconfirmed** until someone checks that setting on the device — this is the leading
cause consistent with the error code, not a proven one.

### B — CORRECTED: Chrome on iOS **works**

**An earlier revision of this document claimed "Chrome on iOS does not support the Web
Speech API." That was wrong.** It generalized a single `aborted` event into a
browser-wide capability claim, reasoning from general knowledge rather than from the
telemetry. Retracted.

Measured — three complete CriOS chains:

```
sessions rij5hvig · 9bmy6qkq · z5m6xrb6   (all CriOS/150)
voice_mic_granted → voice_listening_started → voice_audio_started
  → voice_speech_started → voice_transcribe_result ×N → voice_recognition_ended
```

`aborted` does not indicate missing support. In the Web Speech API it means recognition
ended before producing a result — typically a programmatic `.abort()`/`.stop()`, a
navigation, or the member stopping the mic. One such event is not evidence about the
browser's capability.

### Consequence — the failure is Safari-build-specific, same device, same permissions

| browser | outcome |
|---|---|
| Chrome (CriOS/150) | **works** — 3 complete chains |
| Safari 26.6 | **works** — complete chain, final transcript |
| Safari 26.5.2 | **fails ×3** — `service-not-allowed` at start |

Microphone granted in every case (`iPhone Microphone`, 1 audio track). So:

- it is **not** a device-level permission problem;
- it is **not** a general iPhone 16 limitation;
- it is **not** a hardware problem;
- MAIA's broader voice flow is working;
- **Safari 26.5.2 is the outlier.**

Dictation-off survives only as a possible *device-specific* explanation, never the general
one — Chrome completing the path on the same phone rules dictation out as the cause there.

**Cheapest next confirmation:** retry Safari on that same phone after a full Safari
restart (swipe it away from the app switcher, not just background it). If Safari still
fails while Chrome succeeds, that is a clean same-device, same-permission,
browser-specific reproduction.

### B (superseded reading) — iOS 26.6, Chrome (`CriOS/150`): `aborted`

```
voice_transcribe_error  error:"aborted"        session 0dasssb6  14:17:20.073Z
voice_audio_no_speech   cycleCount:1 limit:2   session 0dasssb6  14:17:20.078Z
ua: iPhone; CPU iPhone OS 26_6_0 … CriOS/150.0.7871.113
```

Chrome on iOS does not support the Web Speech API. Recognition starts against the WebKit
shell and immediately aborts. **The same device works in Safari** — three complete chains
(`listening_started → audio_started → speech_started`) minutes earlier under the iOS 26.6
Safari UA.

## Baseline — voice is working broadly

6h of production telemetry:

| event | count |
|---|---|
| `voice_transcribe_result` | 74 |
| `voice_mic_granted` | 7 |
| `voice_listening_started` | 5 |
| `voice_audio_started` | 5 |
| `voice_speech_started` | 4 |
| `voice_transcribe_error` | **3** |
| `voice_audio_no_speech` | 1 |

The three errors are the two causes above. This is not a widespread capture failure.

## Acceptance test (tracked as #706)

```
On service-not-allowed:
- LISTENING must not remain visible
- the UI must transition to an error/recovery state
- the member must receive a plain-language remedy
- telemetry must still emit the original failure event
```

Each error must be **forced**, not reasoned about — dictation disabled on a real device,
and MAIA opened in CriOS.

## The actual product defect

**The app knows exactly why it failed and tells the member nothing.** Both error codes are
captured, typed, and shipped to telemetry — and the member sees a flower that silently
never hears them. Each has a precise, actionable remedy that never reaches the person
holding the phone:

| error | what the member should be told |
|---|---|
| `service-not-allowed` | Dictation is off for this device — enable it in Settings |
| `aborted` / no API in CriOS | Voice needs Safari on iPhone — open this page in Safari |

Smallest patch: map those two codes to a member-facing message at the point of failure in
`components/voice/ContinuousConversation.tsx`. **Not applied.**

## Verification before any code

On the affected iPhone: Settings → General → Keyboard → **Enable Dictation**. If it is
off, turning it on should restore voice immediately — which confirms cause A before
anyone writes a line.
