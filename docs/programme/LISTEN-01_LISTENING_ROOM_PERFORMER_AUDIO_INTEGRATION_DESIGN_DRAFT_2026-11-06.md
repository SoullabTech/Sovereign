# LISTEN-01 · Listening Room performer playback — audio-integration design (DRAFT)

**State:** `PROPOSED` · draft only, untracked · **no owner issue edited, no source touched, nothing committed, nothing deployed, no performer contacted.**
**Owner lane:** LISTEN-01 (#1979) under AUDIO-PLATFORM-01 (#1984). Creates no second owner, branch, player or audio coordinator. Companion to `LISTEN-01_FEATURED_PERFORMERS_AND_LISTENING_COMMUNITY_DESIGN_DRAFT_2026-11-06.md` (§8d–§8f carry the device evidence this builds on).
**Question answered:** how should a YouTube performer video played in a native player join Sound Studio's existing audio authority so that it never overlaps MAIA speech, Reader narration or the Sound Field, and never restarts by itself?

## 1. Evidence standing

| Claim | Class | Source |
|---|---|---|
| What the audio authority code *says* (locks, priorities, policy, native session) | **Code-read only** — establishes what the code says, **not** what it does at runtime | Read from branch `feature/listen-native-audio-session-20261030` (tip `b549e4d8c`), **not checked out and not merged**; files named in §2 |
| How the prototype native player behaves on a phone (loads, pauses on command, iOS pauses it on lock/background, no restart by itself after lock) | **Device-witnessed** (console + founder) | Companion note §8f |
| AUDIO-PLATFORM-01 (#1984) and LISTEN-01 (#1979) wording | **Read 2026-11-06 via `gh` (read-only):** #1984's Canon, Architecture, Owner acceptance order and several of its 29 comments; #1979's LISTEN-14/-04/-06 and provider/registry sections. **Not read in full** — both issues are long; a search-driven read, not a complete one. See §7a. | #1984, #1979 |
| Whether any of this passes in the real MAIA app | **Unknown — nothing was built in the app** | |

⚠️ **Correction to my own earlier statement.** The companion note says a repo search found no existing feature called "Listening Room." That search was of the **current checkout only**. On the LISTEN branches **"Listening Room" is the name of the existing Sound Studio surface** (`app/listen/ListenRoom.tsx`, `docs/LISTEN03_SOURCE_OWNER_REVIEW.md` "Native Listening Room", `docs/LISTEN07…` "Soullab Listening Room is intended to accompany…"). So the founder's choice of the name is consistent with the shelves living **inside the existing room** — but it is **not a new name**, and "Soullab Picks" and "Members" are sections of an existing surface. To confirm with the founder.

## 2. What already exists (code-read)

- **One exclusive output lock** — `lib/listening/audioOutputLock.ts`: a Web Lock `soullab:exclusive-audio-output:v1`, kinds `maia-speech` > `reader-narration` > `listening-music`. *Web Locks are the authority for exclusion; BroadcastChannel only requests preemption; a message is not a grant.* Music declines immediately if busy after a 75 ms preflight; MAIA speech and Reader wait up to 2.5 s. Missing lock/channel support ⇒ **refuse to play**. No transition restarts a prior track.
- **Preflight channel** — `PersistentListeningProvider` listens on `soullab-audio-focus-v1` and **pauses** on `maia-speech-preflight`, `reader-narration-preflight`, `music-preflight`. `AudiobookReader` does the same for MAIA.
- **Focus event** — `lib/listening/audioFocus.ts`: sources `listening-room`, `writers-listen`, `maia-voice`, `reader-narration`, `sound-sanctuary`, `external`; *a focus event requests a pause, nothing else.* (`'listening-room'` already denotes the existing music player as a source.)
- **MAIA speech lease** — `lib/listening/maiaSpeechFocus.ts`.
- **Platform policy (pure)** — `lib/listening/platformAudioPolicy.ts`: an interruption **began ⇒ pause**, **ended ⇒ nothing** (the platform's "should resume" hint is ignored by policy); route change **pauses only on `oldDeviceUnavailable`**; the **lock-screen Play is a member gesture and the only remote resume.**
- **Native session** — `ios/App/App/AudioSessionManager.swift`: `prepareForListening` sets **`playAndRecord / measurement`, `duckOthers`** (microphone); `prepareForSpeaking` sets **`playback / spokenAudio`, `duckOthers`**; `stopAllAudio` deactivates. `components/listening/usePlatformAudioSession.ts` forwards native `interruption` / `remoteCommand` to pause/resume handlers.

## 3. Where a native YouTube player does not fit (gap analysis)

1. **Different origin, different context.** The player lives in its own `WKWebView` at `https://<bundle id>`; it cannot hold the Web Lock or hear the BroadcastChannel of the app's `capacitor://localhost` page. **Only the page can be the lock holder**; the native side must be told what to do.
2. **The member's own press starts the sound.** For view counts and YouTube's terms the video must start from **the player's own play button** — the page cannot mediate that press. So the lease can only be taken **at or just after** the first sound, not before it.
3. **WebKit publishes its own lock-screen controls.** Observed on the founder's phone: a play control appeared after lock. That is a **resume path that is not `remoteCommandAction`.** It is a member gesture, so it may be honoured — but only if the lease is free.
4. **One shared iOS audio session.** MAIA voice flips the category to `playAndRecord/measurement` and `duckOthers`. A playing YouTube view can be ducked or interrupted mid-category-change; it must be **paused before** the session is reconfigured.
5. **iOS already pauses it on lock and on backgrounding** (device-witnessed) — useful, but a platform behaviour, **not** something the contract may rely on.
6. **No Android/web native path.** On web the standard HTTPS embed works; on Android there is no prototype — **link-out** until tested.

## 4. Proposed design — bridge, don't fork

**Principle:** the page remains the single audio-authority participant; the native player is a **remote-controlled output** it must account for. Nothing new is invented: the bridge reuses `acquireAudioOutput`, the preflight channel, `audioFocus` and `platformAudioPolicy` unchanged.

- **R1 — No programmatic play.** The native plugin exposes `load`, `pause`, `state`, `close` and lifecycle events — **no `play()` method at all.** Soullab code *cannot* start performer playback; only the member's press can. This is structural, and it also matches YouTube's view-count rule.
- **R2 — Lease on first sound.** On the native `playing` event the page calls `acquireAudioOutput('listening-music')`. If it returns `null` (busy, MAIA speaking, locks/channel missing) the page **immediately calls `pause()`** and says why. *Accepted cost: a brief sound before the pause lands — to be measured on a device (the prototype's page-to-native pause took about 3 ms in the simulator; end-to-end on a device is unmeasured).* The lease is **released on every non-playing state** (paused, ended, error, closed, backgrounded).
- **R3 — Obey the same preflight.** A single shared hook (not a copy) makes the bridge pause on `maia-speech-preflight`, `reader-narration-preflight`, `music-preflight` and on the focus events `maia-voice`, `reader-narration`, `writers-listen`, `external` — exactly what `PersistentListeningProvider` does. Starting performer playback sends `music-preflight`, so the Sound Field pauses first (existing behaviour: the latest member act wins among music).
- **R4 — Interruptions pause, never resume.** The plugin forwards lifecycle events (prototype already logs `willResignActive`, `didEnterBackground`, `deviceLocking`, `audioInterruption`, `audioRouteChange`). The bridge feeds them to the **existing** `interruptionAction` / `routeChangeAction` and also **pauses explicitly on `didEnterBackground`** so the contract does not depend on iOS doing it. There is no resume path for Soullab.
- **R5 — Lock-screen Play is honoured only when the lease is free.** It arrives as a native `playing` event with no preceding member tap in the app; R2 then decides: lease granted ⇒ keep playing; refused ⇒ pause.
- **R6 — Never under MAIA's voice or microphone.** Before any call to `AudioSessionManager.prepareForListening` / `prepareForSpeaking`, the voice layer calls `performerPlayback.pauseAll()`; MAIA's speech lease also triggers it through the focus event. Device test required (§6 A3).
- **R7 — Teardown.** Close and release on route leave, `SOULLAB_SESSION_END_EVENT`, verified member switch, sign-out and `didReceiveMemoryWarning`.
- **R8 — Fail closed.** If the locks or channel are unavailable the card shows **link-out only**, as the rest of the product does.
- **R9 — Fallback ladder.** Plugin absent or error `153/100/101/150` ⇒ **"Watch on YouTube"** link-out. Web ⇒ standard HTTPS embed. Android ⇒ link-out until tested.
- **R10 — Present as a sheet, not an inline overlay.** The prototype's fixed rectangle does not follow scrolling. Recommended: tapping a card opens a **native "Now listening" sheet** (fixed position, one performer at a time, close control) so z-order against MAIA's UI and the member's scroll are never in question. The card keeps credit, links and the "Play here" entry.
- **R11 — No second Now Playing.** Soullab publishes no Now Playing entry for performer playback (WebKit supplies its own); when the Sound Field resumes by member act, the sheet closes. Conflict behaviour between the two entries is **untested.**

## 5. Obligations this inherits (growth-obligation check)

- **Uncertainty introduced and how it is preserved:** a brief pre-pause sound window (R2); WebKit's lock-screen control (R5); behaviour with MAIA's category switch (R6) — each is listed as a named acceptance test, not assumed.
- **Provenance/ownership:** performer playback goes through the **one** rights registry (#1979 item 4); the native sheet is a rendering of the performer's own platform, hosted by it.
- **New responsibility:** a custom native plugin in the iOS app (registration, scene-delegate wiring — see companion §8e, App Store review) owned by the iOS pipeline owner, not by the Listening Room alone.

## 6. Acceptance tests (device), each paired with a defeat candidate before any build

Per the lane's discipline, each needs a *wrong* implementation that fails it — so the test can fail.

| # | Law | Defeat candidate (a plausible wrong build) |
|---|---|---|
| A1 | Lease refused ⇒ playback paused at once | Bridge plays regardless of `acquireAudioOutput` result |
| A2 | MAIA speech preflight pauses performer playback | Bridge ignores the channel (only the Sound Field listens) |
| A3 | Microphone/voice setup pauses performer playback first | Voice layer reconfigures the session without calling `pauseAll()` |
| A4 | Lock ⇒ paused, no restart by itself | Bridge treats "interruption ended" as a cue to resume |
| A5 | Background ⇒ paused by Soullab, not only by iOS | Bridge relies on iOS to pause |
| A6 | No programmatic play exists | Plugin exposes `play()` "for convenience" |
| A7 | Lock-screen Play honoured only with a free lease | Bridge lets WebKit's resume through unchecked |
| A8 | Starting a performer pauses the Sound Field (and vice-versa) by member act only | Performer start does not send `music-preflight` |
| A9 | Session end / member switch closes the sheet | Sheet survives sign-out |
| A10 | Locks/channel missing ⇒ link-out only | Bridge falls back to "play anyway" |
| A11 | Error 153/100/101/150 ⇒ link-out, never a blank box | Bridge shows the error player |
| A12 | The sheet never plays under MAIA speech (end-to-end, real device) | — (end-to-end, no single wrong stub) |

## 7. Open decisions (all founder / owner, none taken here)

1. ~~Confirm the name "Listening Room" is meant to be the **existing** room, and that the two shelves are sections of it.~~ **Answered by the founder 2026-11-06: yes — the existing room.** Soullab Picks and Members are sections of the existing Listening Room (consequence: this is a LISTEN-01 change under its single source owner, on its branches — never a separate surface or branch).
2. ~~**Sheet (R10, recommended) vs inline overlay** for performer playback.~~ **Answered by the founder 2026-11-06: sheet.** A native "Now listening" sheet, one performer at a time; the card keeps credit, links and the "Play here" entry. Direction only; no build authorised.
3. **DECIDED (founder, 2026-11-06, after "I don't know which is better" and Claude's recommendation: "Yes, record all three"): accept the window provisionally, measure it on the real phone first, and switch to the no-leak gate only if the measured sound is audible enough to matter.** Direction only; no build authorised. Reasons: it can only occur when a member presses the video's play button *while MAIA is already speaking*, because MAIA starting to speak already pauses the video via the preflight (R3); the member just deliberately pressed play; and the gate would cost the native-button view-count rule. Suggested measurement: time from the player's `playing` event to the native `paused` state when the lease is refused, on the target phone, repeated. Original wording follows. Accept the **brief pre-pause sound window** (R2), or require a gate that cannot leak (would need a different start path — e.g. a Soullab "Play" button that takes the lease then reveals the player, at the cost of the native-button view-count rule).
4. ~~Who owns the native plugin and whether AUDIO-PLATFORM-01 admits a new output kind or reuses `listening-music`.~~ **DECIDED (founder, 2026-11-06, on Claude's recommendation): the plugin is built inside the existing LISTEN native-audio work** (the lane that already owns the iOS audio session, lock-screen controls and interruption rules), not as a separate plugin — one place that controls the phone's audio. The **iOS pipeline owner reviews it** (native plugin, App Store exposure); ⚠️ **that person is not identified in anything read here — to be named.** Reuse of `listening-music` vs a new output kind in AUDIO-PLATFORM-01 remains **open** (#1984 not read). Direction only.
5. ~~Android: link-out only for now?~~ **DECIDED (founder, 2026-11-06): link-out only for now**; web keeps the standard HTTPS embed; iPhone gets the native player. Android playback needs its own test before it is considered. Direction only.
6. Read AUDIO-PLATFORM-01 (#1984) and LISTEN-47/LISTEN-14 acceptance records for any rule this design contradicts — **partly done (§7a):** no contradiction found in what was read, but one **required reconciliation** (`useAudioCoordinator`) and several **sequencing gates** surfaced; the full comment threads are not read.

## 7a. What the owner issues add (read 2026-11-06 — search-driven, not exhaustive)

**Fits the design:**
- #1984 Canon: *member intent starts and stops music; no automatic restart after speech, interruption, device handoff, logout or failed playback* — matches R1, R4, R5. *"Imported Spotify/TIDAL/Apple Music metadata is not a license"* — matches the companion note's rule that cards use Soullab's own text and links, never provider metadata as a licence. The protected order **voice/MAIA → Reader narration → persistent music** is the order R2/R3 reuse.
- #1984 Architecture: *"iPhone/Capacitor: existing native AudioSessionManager, AVAudioSession … physical Safari/WKWebView acceptance"* — matches building the player inside the native-audio lane and requiring device acceptance.
- #1979 §4 (recording-rights registry **must fail closed**): *unknown rights ⇒ no Soullab-hosted media; an artist agreeing to a submission is not automatically all rights.* Performer cards are **provider-hosted pointers, not Soullab-hosted media** — the registry row must say so explicitly, and **Soullab Mixes route 3 (Soullab-hosted) must clear every track** before anything is hosted.

**Required reconciliation (new, not yet in the design):**
- #1984 says the shared core is **reconciled with `lib/hooks/useAudioCoordinator.ts`**, and warns **"do not fork a new Listening-only priority stack."** It adds that the LISTEN-14 lease should be reconciled under `useAudioCoordinator` **only after platform source/consent/auth/security acceptance**, and that *the audited Web Lock is not native/offline/external music control.* ⇒ R2/R3 must be written **against whichever interface becomes canonical** (acquire/release/pause-on-preflight), not hard-wired to the LISTEN-14 lock. `useAudioCoordinator` has **not been read** here.
- #1984: *"External Spotify/TIDAL/apps cannot claim control of another OS app or commercial audio catalog."* ⇒ the embeds are **provider-hosted players inside our UI**, controlled only to the extent their own APIs allow; Soullab must not describe them as controlled "Soullab playback."

**Provider constraints that bound the embeds (from #1979's provider-portability finding):** Spotify Dev Mode limits and "technical existence is not a right to run a commercial streaming integration"; **TIDAL** standard developer terms limited to non-commercial, no independent storage/aggregation of catalog content, no use with AI tools, written commercial agreement needed; **Apple Music** needs separate product/legal review. ⇒ This design is **embed-only: no OAuth, no Web API calls, no catalog ingestion, no storing provider metadata**; any step beyond that needs the agreements #1979 names. (YouTube/Spotify embed terms read separately in the companion note §8b.)

**Sequencing gates (the biggest finding):**
- #1979/#1984 state **LISTEN-01 beta/production HOLD, `/listen` feature-disabled, the native Capacitor path unadmitted**, and a **shared-authentication blocker** (LISTEN-06: two mismatched credentials must be refused; "do not enable `/listen` for member tests until the platform's shared authentication owner corrects and accepts that boundary"). ⇒ **the Listening Room is not yet member-visible, so the performer shelves cannot ship ahead of the room itself.** This work is design and evidence **until the room is admitted.**
- The lane's working pattern is **review-only branches off `clean-main-no-secrets`, exact source identities, reversible patches, zero existing files modified.** A native performer plugin necessarily **touches an existing file** (the scene delegate, companion §8e), so it would be proposed as a **reversible patch**, not a direct edit.
- **Status correction (2026-11-06, from GitHub):** **PR #1999** *(LISTEN-NATIVE-AUDIO-01: playback session, lock-screen controls, interruption law)* shows **MERGED at 19:42Z into its stacked base `feature/sound-studio-uiux-02-prototype-20261030` — not into `clean-main-no-secrets`.** So the native-audio work is merged **within the stack**, **not canonical.** Per the ownership handoff (#1982), **Claude Code cannot be the independent reviewer** of this design; an independent reviewer is needed.
- **iOS pipeline owner:** neither issue names a person. The owner of record is the LISTEN-01 source owner ("Soullab" in the issue threads). ⚠️ Decision 4's "to be named" stands.

**Possible reviewer (founder's call, not assigned):** #1984 records an *Independent Human Experience & Stewardship Reviewer, Sound Field Pilot* role whose binding scope is Start/Pause/Stop, Reader/MAIA interruption, **no overlap, no automatic restart**, privacy expectations and non-diagnostic language — **exactly the experiential behaviours §6 tests.** It confers no rights, security or release authority. Whether that reviewer's scope extends to performer playback is the founder's decision.

## 8. Not authorised by this document

Any code, plugin, route, migration, asset or audio file; any change to `ios/`, `lib/listening/`, `components/listening/`; posting to #1979/#1984; opening a branch or PR; contacting a performer; any release or lifting of source-admission, rights, device or production holds; any claim that this design has been tested in the real app.
