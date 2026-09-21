# MAIA Voice — Cross-Platform Product Acceptance Matrix — 2026-09-21

**Status:** records-only acceptance protocol. No deployment, device mutation, microphone act, or platform acceptance occurs by creating this record.

## 1. Purpose

KERNEL-00 qualifies the new native iPhone VoiceKernel organism. It does **not** by itself prove that a member can have a reliable voice conversation with MAIA on Web/PWA, Desktop, iOS or Android.

This matrix defines the separate product-level acceptance law.

A platform is accepted only after an exact runtime/build identity passes the same core member conversation protocol on that platform. Shared code ancestry is supporting evidence, never a substitute for a platform witness.

## 2. Surfaces

The acceptance set is:

- Web / desktop browser;
- Safari PWA on iPhone;
- MAIA Desktop app on macOS;
- native MAIA iOS app / TestFlight build;
- Android app or Android browser surface if still supported as a product target.

Unsupported platforms may be removed only by an explicit product ruling, not by silent omission.

## 3. Identity custody before every walk

Record before microphone permission is exercised:

- platform and OS version;
- app/browser name and version;
- exact MAIA runtime/build SHA when exposed;
- native build number where applicable;
- signed-in member identity class (no secret identifier);
- input device;
- output device;
- voice mode and turn-taking settings;
- TTS provider policy/effective provider when observable;
- whether hands-free is enabled;
- whether floor control is Automatic or Explicit/Pause.

If exact build/runtime identity cannot be established, the walk may diagnose behavior but cannot accept the platform.

## 4. Core protocol

Each platform must pass the following in one coherent member session.

### P1 — explicit entry
Member explicitly enters voice. Capture is not reported as Listening before the platform has evidence that frames/capture are actually alive.

### P2 — live/provisional transcript authority
While the member speaks, provisional text may scroll. It must remain display-only. No provisional prefix may become memory, a committed member turn, or a MAIA response by itself.

### P3 — one ordinary turn
Speak one normal multi-sentence turn. Exactly one final member turn is committed. No duplicated dispatch, tail replay, or competing send path.

### P4 — reflective silence
Begin a second thought, pause for at least 15 seconds, then continue.

- Under **Explicit/Pause** floor control, silence alone must not send the turn or tear capture down.
- Under **Automatic** floor control, the platform must obey the selected Conversational Space and current lawful endpointing behavior.

### P5 — explicit yield
In Explicit mode, use **Pause** to yield the floor. The accumulated transcript commits once through the canonical final path. Pause is not interpreted as crisis language.

### P6 — MAIA response / TTS handoff
MAIA produces the same canonical cognition path used by typed turns. If speech output is enabled, the visible assistant turn and spoken output must correspond; TTS must not manufacture a second hidden response.

### P7 — re-arm / turn two
After MAIA finishes, hands-free mode returns to a real listening state without reload or mode reset. Speak and complete another turn successfully.

### P8 — genuine capture-death behavior
Where the test surface can safely simulate or observe a genuine silent-death capture failure:

- Automatic hands-free may spend the one bounded TURN-02 recovery token;
- the token replenishes only after actual recognition `onresult`;
- a second death before proof of life fails closed to truthful recoverable error/manual action;
- Explicit floor, push-to-talk, permission loss, track end/mute, AudioContext interruption and other excluded causes may not borrow the automatic silent-death recovery.

If safe simulation is unavailable, this item remains separately owed; it is not guessed from unit tests.

### P9 — interruption / lifecycle truth
Exercise one platform-appropriate interruption (foreground/background, audio interruption, or device change). UI state must remain truthful; no phantom Listening, hidden transcript commit, or silent loss of the member's floor.

### P10 — cognition non-degradation
The final spoken member turn must enter the same canonical MAIA cognition/memory/consent path as a typed turn. Transport may differ before convergence; MAIA's mind may not.

## 5. Extended conversation run

After P1–P10, complete **10 consecutive member↔MAIA voice turns** without:

- reload;
- manual mode reset;
- duplicated member turn;
- hidden assistant turn;
- stuck Listening / stuck Thinking;
- lost post-TTS re-arm;
- transcript becoming memory before final commit;
- crisis false positive from ordinary completion language.

Any one occurrence prevents product acceptance for that build.

## 6. Platform-specific additions

### Web / Safari / PWA
- Safari interim-only utterance must finalize lawfully rather than vanish.
- late final results after a committed turn must not create a duplicate.
- browser-local voice-off must be represented as a member choice, not as TTS failure.

### Desktop
- rolling live transcription must remain provisional-only;
- frame receipt, not AudioWorklet connection, is the authority for Listening;
- Desktop must not transcribe MAIA's own local playback as the member;
- cross-device playback heard acoustically remains a known environmental edge and must not be silently attributed as a server role-map defect.

### iOS native app
- native bridge/build identity must be explicit;
- a current TestFlight/device build must be used;
- shared web-code ancestry alone cannot accept native microphone lifecycle behavior.

### Android
- identify whether the current product uses native recognition or browser/Whisper fallback;
- acceptance follows the actual shipped route, not an intended route.

## 7. Result states

Per platform/build:

- **PASS** — P1–P10 plus 10-turn run green, exact identity bound.
- **INCOMPLETE** — one or more required acts were not executable or not witnessed.
- **FAIL** — an executed criterion violated its pass law.

No WARN/SKIP state is promoted to PASS.

## 8. Current pre-witness standing

| Surface | Standing before this protocol is run |
|---|---|
| Web / Safari / PWA | deployment-witnessed repair exists; full current-build matrix owed |
| Desktop | canonical beta implementation; current installed-build walk owed |
| iOS product app | shared repairs exist; post-Sept-18 native build walk owed |
| Android | current product route/build walk owed |

## 9. Relationship to KERNEL-00

Product acceptance may proceed on the currently shipped product voice stack while KERNEL-00 continues.

KERNEL-00 acceptance is required before the new native VoiceKernel can become the production iPhone audio authority through BRIDGE-01/MIGRATE-01.

Therefore:

- product voice can become reliable before native migration;
- native migration may not be called complete merely because product voice is usable;
- neither programme may borrow the other's evidence.

## 10. Terminal definition

The full MAIA voice programme is finished only when:

1. every supported product surface has a current exact-build **PASS** under this matrix;
2. KERNEL-00 has 18/18 PASS and is founder-accepted;
3. BRIDGE-01 integrates the accepted native kernel without cognition degradation;
4. MIGRATE-01, if still desired, is separately witnessed on the native iOS app;
5. a post-migration cross-platform matrix confirms that the member experience remains one MAIA realm across surfaces.
