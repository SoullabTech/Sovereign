# LISTEN-14 — Cross-tab exclusive audio-output proof (Web Locks)

**Date:** October 24, 2026  
**Disposition:** **ISOLATED SOURCE + CHROME/WEBKIT ACCEPTANCE PASS; PROTECTED SOURCE, MAIA VOICE AND MEMBER/PRODUCTION RELEASE HOLD**

## Why this was needed

LISTEN-13's same-document `Set<symbol>` reliably refused music during MAIA speech **inside one tab**, but a second same-origin tab could still play music simultaneously with the first tab's MAIA voice. Chrome and WebKit physically reproduced that unsafe overlap.

A simple BroadcastChannel message or timeout-based heartbeat is **not a sufficiently strong grant of exclusivity**: a late-joining/suspended/crashed tab could miss it. LISTEN-14 instead holds a **browser-managed, origin-scoped exclusive Web Lock** for the *whole lifetime* of each participating audible source. BroadcastChannel now only sends content-free **preemption requests**; it never grants audio authority.

## Candidate operating rule

1. Music Play/Resume sends a preflight notice to other same-origin tabs and must acquire the exclusive `soullab:exclusive-audio-output:v1` Web Lock **before** calling WebAudio resume or `HTMLAudioElement.play()`. If lock is busy, unavailable, or BroadcastChannel cannot be used, decline music playback with a visible explanation. Browser-native audio controls are not exposed in the persistent review dock because they would bypass this controlled gate.
2. MAIA streaming speech sends a priority preflight and asks existing music players to pause/release. The queue must **acquire the same exclusive lock before attempting a speech chunk's unmuted playback**, and retain it across chunks until `onComplete`, `stop`, or `reset`. Bounded lock acquisition refuses voice playback after 2.5s instead of allowing unsafe overlap.
3. A second music tab can take focus from the first: its preflight asks the first to pause and relinquish the lock before acquisition. A new tab opened while MAIA is speaking cannot take the lock.
4. Explicit Pause, Stop, session-end teardown and tab closure release the held lock. Browser Web Locks automatically release when the owning browsing context terminates; no heartbeat staleness or timer invents authority.
5. **Trade-off:** a speech attempt that ultimately fails may pause pre-existing music during priority preflight. It stays paused until the member explicitly resumes; there is no automatic sound restart, particularly after an interrupted voice turn.
6. This is **UX audio mutual exclusion**, not authentication, medical/voice consent, streaming license, MAIA conversation-floor authority, or a guaranteed operating-system audio focus service.

## Exact source identity and scope

Original protected `lib/voice/StreamingAudioQueue.ts` SHA256:
`75b47fb3e6cbd54f1f01aacebaa07621f7cc7d262f77a826cc346354acb6765e`.

The MAIA queue with existing LISTEN-12/LISTEN-13 voice-focus improvements and this new preplay-output lock has **TEST-ONLY** SHA256:
`af860d6ef962fb5299fdc10e54eec0275bbd23d0d4ba91f017ed0e3e073039ec`.

The exact [MAIA source-owner proposal](review/LISTEN14_MAIA_CROSS_TAB_AUDIO_OWNER.patch) is an **unapplied** unified diff relative to the original protected source. Its **apply/reverse test PASS**: pinned original SHA → test candidate SHA → pinned original SHA. The protected application/MAIA queue was **not edited**.

Review-only additions and edits:
- **New `lib/listening/audioOutputLock.ts`** — Web Lock reservation, content-free `BroadcastChannel` intent, capped MAIA waiting, fail-closed missing-capability behavior. Source SHA256 `51d55718f8309f520962229b8255f482d0296e0d88de6bb687e3a91b4dbe2374`.
- **Updated `components/listening/PersistentListeningProvider.tsx`** — one controlled player with held music lock, release on pause/stop/error/session-end/unmount, cross-tab notice receiver and single local `audio` element. Source SHA256 `a9f523df93b0fcea7efdff4f0cb594f802eba1b172afc2c7bf86f212648da481`.
- **Updated `app/listen/ListenRoom.tsx`** — visible denial explanation for a busy/unavailable shared audio output. Source SHA256 `70653421ba2c1974148e3ee3203cb48ca38b851e4cef1e1ddd988d92f2e3e667`.
- No modifications to protected `app/layout.tsx`, shared authentication, `proxy.ts`, central access matrix, Writer Studio or source vault.
- No actual MAIA microphone, Realtime/WebRTC, one-shot TTS, native iPhone or external commercial music streaming was admitted.

The simulated application was a **disposable Next.js 16.3.8 + fictional PostgreSQL 14.19** test on the Mac Studio external review drive, with prior review-only shared session and strict-proxy corrections, fictional House/Writer/MAIA facades and generated low-volume WAV/FLAC. The current protected checkout was left untouched.

## Executed real-browser acceptance

| Test | Chrome | WebKit 26.0 | Result |
|---|---:|---:|---|
| Cross-tab late join, MAIA priority, music-to-music takeover, abrupt tab closure | **12/12** | **12/12** | PASS |
| Browser Web Locks/BroadcastChannel unavailable or blocked | **7/7** | **7/7** | PASS — refuses new sound |
| Concurrent voice/music starts in 5 independent trials | **5/5** | **5/5** | PASS — no overlap observed |
| Failed MAIA speech attempt and deliberate user recovery | **5/5** | **5/5** | PASS — paused until explicit restart |
| Direct browser-held exclusive lock lifecycle query | **8/8** | **8/8** | PASS — held during sound, released on stop/pause/close |

The **five** published scripts were independently re-downloaded from this GitHub review branch and executed again against the source-derived fiction-only fixture, with all tests returning success.

Existing final regressions: **44/44** cross-room Chrome/WebKit; **20/20** real Writer component with separate test-only focus hook; **35/35** rights/import/private backup; **4/4** mocked private route; **5/5** MAIA in-document lease; **25/25** structural/source; isolated combined `tsc --noEmit` **0 errors**. A transient TypeScript error was due solely to a second source-patch rehearsal copy left under the disposable project directory; that copy was moved outside the app project before the final clean compilation. No runtime source was changed to silence the check.

Source tests:
- [Cross-tab browser witness](../tests/listening/listen14_cross_tab_browser_witness.cjs)
- [Capability refusal witness](../tests/listening/listen14_missing_capabilities_witness.cjs)
- [Simultaneous-start witness](../tests/listening/listen14_simultaneous_start_witness.cjs)
- [Failed-preflight witness](../tests/listening/listen14_failed_voice_preflight_witness.cjs)
- [Direct lock lifecycle witness](../tests/listening/listen14_lock_lifecycle_witness.cjs)

## What this **does not** prove

- **Only same browser profile + same origin + cooperating playback paths.** Web Locks do not coordinate separate browser profiles, browsers, apps, devices or old Soullab tabs that ignore this lock. BroadcastChannel preemption is not a security/authority system. The pilot must make all relevant same-origin playback sources participate.
- Physical **iPhone Safari, WKWebView, Capacitor, lock screen, AirPlay/Bluetooth, multi-hour playback, OS audio-session interruptions, latency and accessibility/VoiceOver** remain untested in this gate.
- The MAIA stream callback here is real queue source but the OracleConversation route is a **fictional shell and test-stub iOS audio environment**, not actual TTS/Realtime/native microphone/cancel/turn state. A failed MAIA preflight can intentionally leave the music paused; the MAIA product owner must accept/revise that cost.
- Browser audio format labels do not prove bit-perfect output; rights/composition/masters/samples/territory and artist licensing remain independently held.
- Actual member-scoped session lifecycle and strict cookie+header same-member authentication, route matrix, erasure/deletion-recovery and encrypted account custody have not been accepted into the protected production image.

## Source-owner release order

1. MAIA VoiceOps and privacy/security owner independently reconcile this exact preplay-lock patch against the **current** MAIA-owned queue; verify no microphone/cancellation/restart or member-floor regression. Decide how to handle unsupported browsers and the failed-speech preflight UX.
2. Qualify non-queue MAIA playback and Writer/Sound Sanctuary focus against the **same authority**, avoiding another player or uncontrolled global intercepts.
3. Accept the authenticated stable-root, same-member shared auth and exact nonpublic `/listen` policy in **one governed source image**, using only fictional members until independently cleared.
4. Verify strict cross-tab, cross-profile and unsupported-device behavior and real iPhone Safari/Capacitor, with content-free security/privacy logs and independent review.
5. Independently accept private-data recovery/deletion and licensed high-fidelity music before founder release GO.

**Status:** Cross-tab exclusivity proved in the bounded browser test. **No production merge, audio policy enablement, member beta, paid provider integration, licensing spend, real member records or deployment. HOLD.**
