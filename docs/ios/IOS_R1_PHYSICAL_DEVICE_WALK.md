# iOS R1 Physical-Device Acceptance Walk

**Build under test:** commit `131d6c236`, marketing 1.2.0, build 2497, Release configuration, development-signed for direct install (store-signed `MAIA.ipa` of the same commit is the upload artifact).
**Device:** Kelly Nezat's iPhone 16 Pro Max (iPhone17,2), iOS 26.6, UDID `00008140-00163D9922E0801C`.
**Walker:** Kelly (his account, his hands). Claude records.
**Install evidence:** 2026-07-27 ~13:41 local — installed via `xcrun devicectl device install app` (installationURL confirmed by device), launched via `devicectl device process launch` → "Launched application with life.soullab.maia bundle identifier." No developer-trust prompt required (profile already trusted). The prior concern that the expired Apple Developer agreement might block provisioning did not materialize: the existing iOS Team Provisioning Profile carried the build without a portal call.

## Scenario results

| Scenario | Device | iOS | Build | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 1 — Installation & cold launch (icon, launch screen, no browser chrome, correct environment) | iPhone 16 Pro Max | 26.6 | 2497 | | | |
| 2 — Authentication (sign in, correct account, kill + relaunch restores state) | iPhone 16 Pro Max | 26.6 | 2497 | | | |
| 3 — Arrival threshold (type without trapping, non-writing exit, single composer, return state) | iPhone 16 Pro Max | 26.6 | 2497 | | | |
| 4 — Conversation (send turn, streamed response, scroll, keyboard cycles, background/resume, no lost/duplicated turn) | iPhone 16 Pro Max | 26.6 | 2497 | | | |
| 5 — Voice (deliberate invoke, permission on action not launch, record + submit, playback, silent preference respected) | iPhone 16 Pro Max | 26.6 | 2497 | **FAIL → FIXED → PASS (multi-round)** | Console captures `device-console.log` (broken) + `device-console-b78.log` (fixed); patch commit in lane | Initial FAIL: deaf after first round. Root cause measured via attached console: overlapping JS restarts ran unserialized native `start()` calls; each start's cleanup killed the just-started engine; the ms-scale churn wedged the input HAL (zero buffers to the tap; 14× "No speech detected"; restart counter reset on every start so the circuit breaker never tripped). TTS acquitted by silent-mode capture. Fix (SR plugin Build 78): `start()` idempotent while running; `stop()` emits no phantom `stopped`. Device-verified same day: rounds 1, 2, 3+ all transcribe; guard absorbed a real overlapping start immediately before round 2; zero "No speech detected" in 4-min capture; audio buffers continuous. TTS-on retest and permission-timing check still pending as part of the full re-walk. |
| 6 — Session & safety (logout blocks protected routes, second account isolation if available, expired session explicit) | iPhone 16 Pro Max | 26.6 | 2497 | | | |

Result vocabulary: PASS · FAIL (with symptom) · PARTIAL (with boundary) · NOT RUN (with reason).

## Additional walk observations (outside the six scenarios)

- **"The MAIA screen is off" (Kelly, verbatim — meaning to be confirmed).** The screenshot shows the field rendering **purple/violet** behind the Holoflower; brand canon is navy, never purple. Whether Kelly meant the visual tone, or the screen/orb state, is not yet settled — recorded verbatim pending his clarification.
- **VOICE TRACE debug overlay is visible in the walk build** — a developer diagnostic panel (timestamped mic-state log) rendering in the member-facing conversation view, plus a debug (bug-icon) button bottom-right. Whatever gates this overlay did not suppress it in a Release-configuration device build.
- **Welcome text renders behind/through the debug overlay** with heavy overlap — may be purely a consequence of the overlay's presence; assess after the overlay question is resolved.
- Positive signals visible in the same screenshot: correct member recognition ("Kelly" in header), transcription of the first utterance, "Keep this moment" mark gesture present, Text fallback affordance present, no browser chrome.

## Known limitations entering the walk

- Display name is still `Soullab` (rename is deliberately sequenced after the walk, as its own commit).
- The walk build is development-signed; the TestFlight artifact will be the store-signed IPA of the same commit — signature differs, code identical.
- App Store Connect upload is blocked until the Apple Developer agreement is re-accepted (Account Holder).
- Voice on device exercises the production voice path; simulator could not test microphone at all.
