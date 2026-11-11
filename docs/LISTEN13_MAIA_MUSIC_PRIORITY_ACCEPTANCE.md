# LISTEN-13 — MAIA Speech Priority / Listening Room Two-Way Audio Focus

**October 24, 2026 · Source-owner review only · Production and member release HOLD**

## Founder-facing operating decision (proposed, not deployed)

For the initial Soullab Listening Room, **MAIA keeps the spoken turn it has already begun**. If someone clicks Play or Resume for music while MAIA is audibly speaking, the music remains paused and the interface explains:

> MAIA is speaking. Stop or finish MAIA before playing music.

There is **no automatic resume** when MAIA's speech finishes. The member can stop MAIA with its **own** authorized controls and explicitly choose music again. Nothing in this workstream sends the legacy `maya-voice-interrupted` event, starts/stops the microphone, changes the conversation floor, rewrites speech text, or contacts cloud TTS.

This is a conservative product proposal. It is **not founder acceptance of a live change** or independent MAIA voice authority qualification.

## Exact source and custody

The original actual streaming MAIA queue `lib/voice/StreamingAudioQueue.ts` from `clean-main-no-secrets` has SHA256:

`75b47fb3e6cbd54f1f01aacebaa07621f7cc7d262f77a826cc346354acb6765e`

Build 12 already proposed focus acquisition when playback begins. Build 13's further **test-only** candidate SHA256 is:

`9f20b54fcbb4872f32ead49ecab13778450f2cf0d72e0d304e9486e349bdd8c8`

It adds `beginMaiaSpeechLease` when the first speech chunk actually begins playing, and releases that queue's own `symbol` lease on natural completion, `stop()`, or `reset()`. A separate real-time cue still asks the music transport to pause. The lease holds across an entire multi-chunk queue, rather than dropping between sentences.

The [source-owner MAIA patch](review/LISTEN13_MAIA_SPEECH_PRIORITY_SOURCE_OWNER.patch) was replayed from exact pinned original source, **apply-check → candidate SHA256 → reverse-check → original SHA256: PASS**. **No protected MAIA source has been modified.** A source owner must reconcile this with their current queue/voice build, not simply apply an old branch patch.

The Listening Room's **existing review branch** carries:

- **New** `lib/listening/maiaSpeechFocus.ts`: a module-local `Set<symbol>` of active speech leases. Pure, in-document, nonpersistent and content-free. This is **not** session authentication, consent, media licensing or multi-tab authority.
- **Review update** `components/listening/PersistentListeningProvider.tsx`: refuse both sketch and local-file Play/Resume while MAIA speech is active; recheck around asynchronous audio-start operations; display a clear member-facing message. Existing MAIA speech-initiated focus still pauses music. The prior explicit Stop, user Resume and session-end cleanup remain.
- **Review updates** `app/listen/ListenRoom.tsx` and `LocalAudioDesk.tsx`: preserve standalone-mode behavior and prevent duplicate/standalone media starting while the local MAIA speaking lease is active. Respond to explicit MAIA audio-focus events without subscribing to generic Writer editorial stop events.
- **Tests** for lease idempotence, stale completion, two different queue owners, malformed lease refusal; real browser two-way priority, standalone fallback and cross-tab negative evidence.

**Source SHA256s of the physically tested disposable code**:

| Candidate | SHA256 |
|---|---|
| In-document speech lease | `2e2853e2d13ccc8ec1c62dd309f7fb77b73ffaa9bbf91a50628cc0f4f39223a2` |
| Provider | `4a1dcd8d7d1c6154a9ffb5cab6040475d819df75362a8b39bdeba85d4f64bcf9` |
| Listening Room | `666cac6905ac648646604a51f38d6c0e25f82715fceed7ab2adfdee66caa784f` |
| Local audio desk | `e27219559745fd39e428edd54dce21585781aa7f4cee9e60240c2a4e1f278277` |

## Real browser acceptance — bounded to same document

The actual MAIA `StreamingAudioQueue` *source design* was exercised in a disposable Next.js **16.3.8** / PostgreSQL **14.19** environment with only fictional session rows, test-only audio dependencies, local synthesized speech WAV and original Listening Room synthetic studies plus a **fictional 24-bit/48 kHz stereo FLAC**. The MAIA route was a fictional facade; this was **not** live OracleConversation, realtime WebRTC, voice microphone capture, iPhone, production authentication or real member data.

**19/19 Chrome and 19/19 WebKit PASS** (published script, read back and re-executed):

- MAIA starting audible speech pauses a member-initiated sound sketch and device-local FLAC.
- Explicit music Resume / Play during speech is **refused without interrupting MAIA's actual audio element**.
- No `maya-voice-interrupted` event was sent by the music request; MAIA floor/microphone semantics were not overridden.
- The dock explains why music is paused.
- When MAIA is stopped via its own controls, member can explicitly resume music. No automatic music restoration.
- When a fictional two-chunk MAIA response naturally completes, music stays paused; subsequent explicit Play works.
- Member session-ended simulation clears the global player/file.
- No nonlocal network requests or unhandled JS page errors.

**Source-only MAIA lease tests: 5/5 PASS**, including two simultaneous queue owners, idempotent claims and repeated stale releases.

**Standalone regression: 24/24 Chrome PASS** after changes; separate focus-event smoke PASS.

**Other preserved regressions after the change:** Chrome/WebKit cross-room continuity **44/44 PASS**; actual Writer component with *test-only* typed focus request **20/20 PASS**; original queue first-play focus **20/20 PASS**; queue failed-audio/multi-chunk/new-session **20/20 PASS**; rights, playlist and AES-GCM backup **35/35 PASS**; mock route **4/4 PASS**; static source **25/25 PASS**; isolated full TypeScript **zero errors**.

## Crucial failing two-tab witness — Class B audio-exclusivity HOLD

**Two browser tabs were explicitly tested and remain UNSAFE in both Chrome and WebKit:**

- Tab A: a fictional MAIA speech WAV is actively playing.
- Tab B: the same fictional member opens Listening Room and clicks Play.
- **Observed:** Tab B's music starts while Tab A's MAIA voice continues advancing.

This is expected with the current `maiaSpeechFocus.ts`, which intentionally holds an **in-document** `Set<symbol>`; it does not propagate speech leases between tabs.

[Cross-tab negative witness](../tests/listening/listen13_cross_tab_overlap_negative_witness.cjs) prints `UNSAFE_OVERLAP_CONFIRMED`. Its process exit code 0 means the **undesirable bug was reproduced**, never product acceptance. It must be replaced by a fail-closed, privacy-preserving cross-tab coordination and replay/late-join protocol, independently tested under races, tab-close, sign-out, member switching and browser denial of BroadcastChannel, **before** any claim of multi-tab exclusivity.

Other MAIA pathways (one-shot TTS, realtime/WebRTC, iPhone native, Cabin/offline), separate app/site origins, OS media interruptions, headphone/CarPlay/AirPlay and physical VoiceOver are not covered.

## Release-order constraints

1. **MAIA voice owner** independently chooses/accepts the priority rule and reconciles the exact queue patch. It must not revive mic/floor transitions or strand a stopped queue.
2. Resolve **cross-tab voice/music overlap** in a content-free, explicit protocol. Do not put transcripts, identifiers, recording data or provider URLs into messaging.
3. Enforce the source-owner accepted shared cookie/header identity concordance and exact private `/listen` access policy in the full real app, not just the synthetic Next/PG fixture.
4. Establish an **authenticated stable-root** source-approved player. The current fictional `reviewMemberKey` in the test layout is not a real authorization.
5. Independently verify Source custody/private member backup/deletion recovery, music master/composition/territory rights, a long-form artistically finished recording, and physical devices/voice modes.
6. Retain the current **no production deploy, no new beta members, no music licenses/provider spending** posture until separate founder release GO.

**Links:** [LISTEN-01 #1979](https://github.com/SoullabTech/Sovereign/issues/1979), [MAIA VoiceOps #1902](https://github.com/SoullabTech/Sovereign/issues/1902), [MAIA security voice authority #1819](https://github.com/SoullabTech/Sovereign/issues/1819).

**Disposition:** same-document two-way focus rule **PASS** in the isolated test; **two-tab overlap CONFIRMED FAIL**; full MAIA/Writer/Soullab product release remains **HOLD**.
