# LISTEN-12 — MAIA streaming-voice audio focus / fail-closed interruption review

**Date:** October 24, 2026  
**Disposition:** **STREAMING-QUEUE MAIA→MUSIC FOCUS CANDIDATE PASS; REVERSE DIRECTION FAIL/HOLD; PRODUCTION & MEMBER ACCESS HOLD**

## Purpose and verified source seam

The existing Listening Room can persist across client-side navigation in the isolated Build 10 shell. Build 11 established an explicit Writer speech/music focus contract.

Source review located one **actual MAIA conversation playback path**: `components/OracleConversation.tsx` constructs `StreamingAudioQueue` to play sentence-level TTS chunks in `lib/voice/StreamingAudioQueue.ts`. This is **not MAIA's sole voice engine**: OracleConversation also plays one-shot `Audio` and WebAudio buffers, and the platform includes WebRTC/native voice/ContinuousConversation implementations. Do **not** generalize this bounded test to all MAIA speaking modes.

The queue's current `onPlayingChange(true)` fires when a chunk is dequeued, **before** its `audio.play()` succeeds. OracleConversation also dispatches the legacy `maya-voice-start` at preparation/keep-alive time, not necessarily when audio is heard. **Neither early event is a reliable audio-focus signal.**

The appropriate focus boundary is `HTMLAudioElement.onplay` with a fallback after successfully resolved `play()` (WebKit/iOS may omit the event), **never** a queued, rejected or merely anticipated speech request. Signal only the generic source name `maia-voice`, not text, transcript, member identity or provider data.

## Source custody and reversible owner proposal

- Protected MAIA queue: [`lib/voice/StreamingAudioQueue.ts`](https://github.com/SoullabTech/Sovereign/blob/clean-main-no-secrets/lib/voice/StreamingAudioQueue.ts), GitHub blob SHA `4644ed6ed48e47592cd523a7c359a78e3536b503` and local source SHA256 `75b47fb3e6cbd54f1f01aacebaa07621f7cc7d262f77a826cc346354acb6765e`.
- **TEST-ONLY** queued focus proposal SHA256 `7d8cc95410ec253d19711526b3c5385921a6e937fbb32982d7d782659004c25a` (not a protected source commit).
- [Owner-review unified patch](review/LISTEN12_MAIA_STREAMING_AUDIO_FOCUS_SOURCE_OWNER.patch) adds a typed `requestAudioFocus('maia-voice')` signal at the **first confirmed play**, idempotent per speech streaming session, with a fallback for missing `onplay` and reset when queue `stop()/reset()` runs.
- **Direct git apply / reverse rehearsal PASS:** original source SHA256 → candidate SHA256 → original SHA256, exactly. No protected file changed or merged.

The source owner must independently reconcile exact-current voice source before integration, including playback failure/abort, early-onplay/queued retry, chunk lifecycle and platform native audio controls.

## Physical source-derived test on Mac Studio

The actual canonical MAIA `StreamingAudioQueue` class was loaded through a disposable Next 16.3.8 application using a **fictional MAIA route**, test-only audio-platform stubs (`ensureAudioReady`, feedback prevention, local telemetry), and generated **7s/1.1s local WAV** files. No real OracleConversation, microphone, provider TTS, MAIA conversation, member information, auth keys or protected app files. Authentication/proxy for the fixture remain simulated with fictional PostgreSQL members and previous review-only source corrections.

### Verified positive and negative observations

| Case | Chromium | WebKit 26.0 | Meaning |
|---|---|---|---|
| Original queue baseline | 10/10 observed | 10/10 observed | **UNDESIRABLE:** voice and music overlap; `maia-voice` focus requests = 0 |
| Proposed first-audio focus candidate | **10/10 PASS** | **10/10 PASS** | Actually playing queue WAV causes music pause; focus requested exactly once |
| Failed audio + multi-chunk/new-session behavior | **10/10 PASS** | **10/10 PASS** | Rejected playback does not claim focus or stop music; two actual chunks claim once; next session claims once; no auto-resume |
| Reverse music-resume overlap | **UNSAFE witnessed** | **UNSAFE witnessed** | While MAIA speech plays, member pressing music Resume causes **both** to play; not release-ready |

**Reverse-direction evidence is deliberately a negative witness.** Its script returning success means the known defect was reproduced, **not that the product passed**.

Published scripts, all downloaded and replayed against test-only source:
- [MAIA baseline vs candidate](../tests/listening/listen12_maia_streaming_focus_browser_witness.cjs)
- [Failed-play, multi-chunk, fresh session](../tests/listening/listen12_maia_focus_negative_edges.cjs)
- [Reverse overlap negative witness](../tests/listening/listen12_maia_reverse_overlap_negative_witness.cjs)

All tests recorded **zero external browser requests and zero unhandled page JS errors** in their bounded contexts. The isolated combined-code TypeScript check produced zero errors.

### Existing player and Writer regressions

With the test-only MAIA queue candidate present, prior tests still reported: **44/44** Chrome/WebKit cross-room continuity; **20/20** real protected Writer component + test-only typed Writer focus proposal; **35/35** rights/playlist/backup crypto; **4/4** mocked route authentication; **25/25** static source checks; isolated full TypeScript **0 errors**. None means the actual current production image is signed or admitted.

## Reverse focus and microphone safety: explicit STOP

The persistent player's existing `requestAudioFocus('listening-room')` stops Writer TTS using Writer's established `ws-stop-maia-reading` event, but does **not** stop the MAIA streaming queue. MAIA's older `maya-voice-interrupted` is not an unqualified substitute: triggering it globally could alter hands-free mode, microphone-restart semantics, floor control, and interrupted conversation completion.

**The MAIA voice owner must decide and test the two-way contract**:

- Should music Resume **defer until MAIA finishes**, or should a clear **user-commanded switch to music** cancel MAIA speech? The choice must be predictable and accessible, preserve transcript and turn state, and never surprise-resume the microphone.
- MAIA speech after audio preparation must pause music **only when audible playback begins**, with a correct fallback and content-free receipt.
- If microphone capture can pick up soundtrack playback, the voice owner must govern duck/pause during listening, with member notice and no covert audio/voice capture. This is **not** solved by the outgoing speech queue patch.
- Reconcile all actual MAIA voices (WebRTC, one-shot TTS, native iPhone, offline Cabin, etc.); this patch covers only `StreamingAudioQueue`.
- Member switches, sign-out, revocation and member-owned local files require the previously held authenticated stable-root acceptance before any active trial.

## Governance and next exact owner step

Cross-lane proposal belongs to [MAIA VoiceOps #1902](https://github.com/SoullabTech/Sovereign/issues/1902) and [MAIA security/voice authority #1819](https://github.com/SoullabTech/Sovereign/issues/1819), coordinated through [LISTEN-01 #1979](https://github.com/SoullabTech/Sovereign/issues/1979). **No independently accepted MAIA source-owner review, production merge or release authorization is implied by these findings.**

Required next gate: choose the reverse-direction voice/music priority and certify actual MAIA speaking/listening turn state in a minimal source-owner integrated fiction-only build; after that independently qualify the complete Soullab authenticated image, physical iPhone, private collections, rights and audiophile output.

**Production/Beta: HOLD.**
