# SOULLAB AUDIO AUTHORITY — For every Soullab experience

**Status: Founder-directed architectural requirement; isolated policy/test candidate, NOT deployed**  
**Date: October 24, 2026 · Owner: sole Soullab founder · Release: HOLD**

## Product promise

Music, sound, guided listening, MAIA speech, spoken writing, audiobooks, clinical/practitioner sessions, microphone input, and native/offline voice must cooperate in the life of **one member**. Soullab should not make them manage every audio subsystem themselves. At the same time, an AI must never silently record, interrupt a private professional call, resume music after speech, or use a music link as a streaming license.

This is a **platform capability**, not a Listening Room feature and not a replacement of the well-developed Writer, MAIA, Jarvis, or Cabin experiences.

## Six canons

1. **Member agency first.** Starting a soundtrack, recording, or a professional session must follow explicit member action and the separately verified consent/turn/role rules of its owner. Never infer permission from the presence of a source file, an OAuth playlist link or a random browser flag.
2. **One source of priority rules.** A shared policy describes preference; a source-authorized adapter reserves the actual exclusive output. Any other experience must pause/acknowledge before a new sound begins. Failure is refusal, never uncontrolled overlap.
3. **Audio output ≠ microphone input.** Arbitration does not grant microphone access, save a transcript, or authorize provider TTS. Real microphone capture belongs to the existing voice/recording owner and independently enforced consent. A microphone cannot be activated by an audio focus event.
4. **No surprise restart.** After MAIA, Writer, Jarvis, a call, failure, device disconnection, logout or interruption, music remains paused until the member explicitly restarts it. No auto-resume, autoplay or background AI takeover.
5. **Private, sovereign, reversible.** A focus event contains only a local ephemeral owner tag and activity category. No member IDs, journals, transcripts, birth data, medical data, recordings, provider tokens, playlist content or media URL; no focus telemetry based on raw content. Deletion/restore cannot resurrect old private audio context.
6. **Truth in fidelity and rights.** Studio-quality source files, decoder support, system mixer output, Bluetooth and DAC output are different claims. A file marked FLAC does not certify end-to-end losslessness. Commercial music requires independent master/composition/sample/use/territory rights; Spotify, TIDAL and Apple Music playlist imports alone provide no streaming authority.

## Default priority: understandable to a member

| New requested audio | With another soundtrack/soundscape | With MAIA/Writer/Jarvis speech | With a live private/practitioner session | With active microphone capture |
|---|---|---|---|---|
| Music, Sound Sanctuary, audiobook | Pause the existing entire output, then start only on explicit member action | Refuse; explain that voice is active | Refuse | Hand off to mic/voice owner; no implicit start |
| MAIA/Jarvis/Writer spoken response | Pause background audio, await confirmed pause, then reserve exclusive output | Refuse competing spoken turn; owner must explicitly manage floor | Refuse | Delegate to voice conductor; do not take mic authority |
| Pro Studio live session | Pause background audio with acknowledgement, then reserve output | Source-owner handoff before interrupting voice | Refuse another uncontrolled session | Source-owner/permission handoff |
| Microphone/voice journaling | Permission and transition belong to capture owner | Permission and turn authority belong to capture owner | Permission belongs to live-session owner | Permission and single capture ownership handled separately |
| Optional UI cue/notification | Do not forcibly interrupt active content | Do not interrupt | Do not interrupt | Do not interrupt |

**Important:** A policy result named `attempt` permits *trying to acquire* an audio lease, not starting audio by itself. The adapter must independently verify identity, consent, recording/music rights and voice-turn ownership. Paused sources stay paused.

## One runtime with platform-specific enforcement

**Common policy/core:** `lib/audio-governance/platformAudioPolicy.ts`, `audioFocusTransaction.ts`. These modules are pure/adapter-neutral and never access DOM, fetch, microphones, member identity or records. Source-owner review must reconcile them into the **existing** `lib/hooks/useAudioCoordinator.ts` rather than instantiating a second global controller.

**Browser (same-origin, same profile):** LISTEN-14's Web Locks exclusive output claim plus content-free BroadcastChannel pause intent. Only cooperating tabs in one browser profile are covered; no claim about independent browsers, other sites, separate profiles or other apps. Browser permission or unsupported-capability refusal must be visible and accessible.

**iPhone / iPad (Capacitor):** Integrate the existing `lib/voice/AudioSessionManager.ts` and actual native `AVAudioSession` / microphone permissions. The web fallback is a no-op for native audio and is **not** physical Safari acceptance. Check audio route changes, recording/playback transitions, Siri/phone-call interruptions, Bluetooth/AirPlay, lockscreen, VoiceOver and background modes on actual devices.

**JARVIS desktop / Electron:** Existing approved main-process origin/IPC/cancellation authority must own audio state. Do not let an untrusted renderer tab choose which user's voice is captured or assign itself global audio rights. The user must explicitly authorize any local tool or OS audio-capture route. Separate security and signing gates remain held.

**Cabin offline:** Device-local, privacy-preserving coordinator lives in Cabin's independently accepted encrypted/local service. Core priority rules require no internet. Member switch, encrypted backups, deletion and restore must not resurrect playback or microphone capture; IPC authority belongs to Cabin source owner, never to a browser text parameter.

**Cloud and different devices:** No instantaneous global exclusivity is claimed. A cloud coordinator would introduce privacy, connectivity, latency and cross-device consent questions. Do not suggest that a Web Lock on a Mac controls an iPhone or Spotify playing in a separate native app.

**Sound Sanctuary multi-layer engine:** Bowls, drones, ocean, gong, chanting and transducers are *stems under one owned session*, not independent focus competitors. Permission to mix, public performance, health/physiological claims and device output are separate acceptance domains.

## Required experience-level controls

Members should see the current sound/source, understandable Pause/Stop, optional volume, a clear reason if playback cannot begin, and an explicit choice to return after MAIA finishes. There must be no invisible audio source, automatic restart after a failed voice request, or surprise microphone activation. A future explicit **“Stop MAIA and play music”** control may be considered only when the MAIA voice owner proves that it safely cancels a spoken turn without changing microphone floor/restart semantics. It is **not** part of the current admitted contract.

## Source integrity and release

- Reconcile source lineage with the actual MAIA, Writer, Sound Sanctuary, reader, Pro Studio, Astrology, JARVIS and Cabin owners; respect the existing developer's work and held gates.
- Join a single, reviewable application image with actual authenticated member shell and fail-closed cookie+header concordance; no second Studio/House/MAIA implementation.
- Test content-free decision traces and audio-focus race/lock release under simultaneous starts, denied BrowserChannel/Web Locks, refresh, tab crash and session change.
- Independently qualify real audio/microphone/floor behavior on Chromium, WebKit, actual iPhone Safari/Capacitor, macOS/Electron and disconnected Cabin.
- Validate private member-account isolation, source/restore/deletion custody, music rights, professionally mastered long-form content and founder-approved release.

**No source merge, deployment, beta admission, new interpretive/clinical capability, proprietary recording processing, provider spend or audio-license purchase is authorized by this work.**
