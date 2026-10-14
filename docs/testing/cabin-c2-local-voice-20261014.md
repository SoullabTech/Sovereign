# Cabin C2 — local voice preview, October 14, 2026

Cabin 0.4.0 adds Record message, Stop recording, Listen to MAIA and Stop listening to the existing local text adapter. Transcription fills a draft for review; it does not automatically send a message or create a saved turn. Audio requests use authenticated same-origin routes. Reply synthesis reads the authoritative assistant turn in the active conversation and refuses an old conversation. No raw audio is written by the Cabin runtime.

## Dependency qualification and repair

The existing Whisper and Kokoro images were tested in separate Cabin-owned containers on an internal Docker network. Their default entry points attempted Python package resolution from internet locations and failed when egress was blocked. The solution is to invoke their installed Python environments directly, with Hugging Face/Transformers offline flags and the cached Whisper model volume mounted read-only.

Two speech engines remain on the internal network. A small fixed-target doorway publishes only host-loopback endpoints 18080 and 18880; it relays only health, transcription and speech paths to those two internal engine addresses. It does not accept caller-provided targets and refuses redirects. The doorway has a bridge connection for host port publishing; its network isolation is therefore different from that of the internal speech engines. No blanket claim that every container has kernel-denied egress is made.

The installed doorway code is stored in the Cabin application-support directory, independent of the source checkout. scripts/cabin-local-voice-services.py reuses cached images, starts only Cabin-owned names, and never pulls an image. Existing production speech services were not restarted or modified. Docker and the cached model/image resources remain local prerequisites.

## Evidence

- Known fictional Kokoro clip → offline Whisper: recognized “Fictional test, the forest is quiet today.”
- Actual packaged window: controlled synthetic AudioContext stream → MediaRecorder → local Whisper → reviewed draft → explicit Send → local MAIA reply → Kokoro WAV → browser playback → Stop: PASS.
- Transcription alone creates no durable conversation turn: PASS.
- Old-conversation audio request: refused (409).
- Unauthenticated voice access: refused (401).
- Existing writing/model/recovery regression: PASS.
- Runtime external-egress denial remains enabled; voice engine network is internal.
- Package bundling, JavaScript/Python syntax, source whitespace and deep ad-hoc signing: PASS.
- Physical microphone: NOT TESTED.
- Physical speaker output: NOT TESTED; browser playback was muted during automation.

Electron's built-in fake microphone/file fixture returned an unrelated transcript. That attempt is not accepted as recognition evidence. The successful window test injects a controlled synthetic stream into getUserMedia; it exercises recording, upload, real recognition and playback, but does not prove physical capture or operating-system permission behavior.

The window test also exposed the need to allow same-origin/blob audio in the workspace content policy. That correction was applied and the complete voice window test passed afterward.

## Remaining scope

This remains the bounded local MAIA adapter. Full online cognition/orchestration, Sanctuary voice posture, long-conversation context qualification, physical microphone/speaker acceptance and autonomous JARVIS execution are not delivered by this preview. Conversation text continues to use the existing normal local persistence posture.

The JARVIS flow ran in the foreground conversation. No autonomous worker, independent reviewer or canonical execution evidence is fabricated. Local House/writing and saved workspace remain preserved; prior Cabin 0.3.0 is retained for rollback.
