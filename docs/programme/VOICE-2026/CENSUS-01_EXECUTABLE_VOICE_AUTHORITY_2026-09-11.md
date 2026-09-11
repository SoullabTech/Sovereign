# VOICE-2026 · CENSUS-01 — The Executable Voice Authority Map

**Lane:** `VOICE-2026` · **Act:** `CENSUS-01` (read-only) · **Branch:** `claude/voice-2026-census-01` (cut from `clean-main-no-secrets` tip `e1c6f527b`) · **Date:** 2026-09-11
**Status:** ASSEMBLED · nothing ratified · no source modified · no repair proposed.

**Question (charter §1, §6):** who currently owns hearing, speaking, turn-taking, audio-session state and recovery on the live `/maia` path of the iOS app — and for each, who can start it, stop it, restart it, and change its configuration? The subject is the **executable** architecture, not the intended one.

**Parts (each cites `file:line`; this document cites them by part number):**

| Part | File | Subject |
|---|---|---|
| P1 | `census/01_native_ios_authority.md` | native iOS: AVAudioSession, engine, recognizer task, plugins, WebView config, registration |
| P2 | `census/02_web_capture_recognition_lifecycle.md` | `ContinuousConversation.tsx`: start/stop/restart drivers, refs, timers |
| P3 | `census/03_tts_playback_output.md` | `OracleConversation.maiaSpeak`: engines, playback graph, watchdogs, the speak sequence |
| P4 | `census/04_turn_closure_conversation_state.md` | send sites, discard sites, turn timers, state variables, UI source of truth |
| P5 | `census/05_other_capture_paths.md` | every other mic / AudioContext / audio-session claimant and its reachability |
| S1 | `SURVEY-01_CONTEMPORARY_VOICE_ARCHITECTURE_2026-09-11.md` | platform capability (evidence, not design) |

**Branch caveat (load-bearing).** This branch is canonical + nothing. It carries **neither** the registration repair (`claude/ios-runtime-01-audiosession-registration`) **nor** Repair Two (`claude/ios-runtime-01-repair-two-turn-close`). So: every `AudioSessionManager` call rejects at the bridge; the `native_stop` send path is present; native partials replace the buffer. Where the repaired build differs, the row says so — because the E13–E18 device evidence was gathered on the repaired build, and the census must be readable against both.

---

## 1. The resolving schema

One row per domain. "Owner" is whoever's code actually executes against the thing on `/maia` iOS voice mode. Counts are of *distinct executable sites*, from the parts.

| Domain | Current owner (executable) | Can start | Can stop | Can restart | Can reconfigure | Observed conflicts | Future disposition |
|---|---|---|---|---|---|---|---|
| **AVAudioSession** (category · mode · active · rates) | The patched `@capacitor-community/speech-recognition` plugin, inside `start()` only: `.playAndRecord / .voiceChat / [defaultToSpeaker, allowBluetooth, allowBluetoothA2DP, mixWithOthers]`, 48 kHz, 0.01 s, `setActive(true)` — re-asserted on **every** recognizer start (P1 #1–3). Plus WebKit's own content-process session, which no MAIA code touches (P1 Q1; S1 §4). | plugin (per start) | **nobody reachable** — no `setActive(false)` on the live path (P1 #4) | n/a | plugin (per start) · gatekeeper `prepareForSpeaking` → `.playback/.spokenAudio` on the repaired build only (P1 #14) · `capacitor-voice-recorder` `.playAndRecord` default mode, JS-blocked today (P1 #21) | Two app-process writers with different categories and no coordination (P1 §2.4.3); WebKit as a silent third; the E18 alternation `Bottom/0.01 ↔ Front/0.0026666` is two owners alternately winning (§3) | **REPLACE** — one native runtime owns it for the conversation's lifetime (VOICE-01, VOICE-04) |
| **Microphone capture** (engine + tap) | The plugin's `AVAudioEngine` + input tap, created fresh per start, stopped by `stop()` **and** by any task callback (P1 #5–9). | 1 native start site reached by **11 requesters** (P2 F1) | **7** native `stop()` sites + listener teardown; every requester is also a stopper because `startListening` pre-emptively stops (P2 F2) | 11 (7 in CC: D1–D7 · 4 in OC: P1–P4) | plugin only | Each restart kills a possibly healthy engine; engines carry no identity (P2 F7); a stale task's callback stops the *current* engine (P1 #9) | **REPLACE** — capture is a stream owned by the runtime; STT consumes it (VOICE-02, VOICE-06) |
| **Recognizer** (task lifecycle) | The plugin: new `SFSpeechRecognizer` + task per start; `stop()` ends audio but **never cancels the task**; only the next `start()`'s `cleanup()` cancels (P1 #7–8). | plugin via CC | plugin `stop()`; plugin task callback; plugin `cleanup()` | the 11 requesters | on-device flag only (P1 #12) | Double `stopped` per stop (P1 §2.4.2); no task identity (E16.5 confirmed at source, P1 §2.4.1); re-segments inside one task with no event (E16.1) | **REPLACE** — an STT adapter behind a protocol; segment boundaries are not events the conversation reacts to (VOICE-03) |
| **Turn closure** (who says the human is done) | **Four closers armed at once on iOS**: 2500 ms no-partials timer · 1500 ms audio-level timer (same ref) · the plugin's `stopped` event (`native_stop`, removed on Repair Two) · manual stop. Eight send sites, seven deciders across platforms (P4 §6.1). `OracleConversation` is a ninth authority that can veto (twelve guard returns) but not close (P4 §2b). | timers (CC) | — | — | `silenceThreshold` prop per mode (web only); native values are literals | **22 discard authorities** (10 engine, 12 orchestrator); native partials *replace* the buffer (P4 D7 = E16.1); parent TTS state discards the child's unsent text (D3); dispatched ≠ accepted with no return channel (P4 §6.3) | **REPLACE** — a `TurnManager` in the runtime is the sole closer; Repair Two's *principle* (segment ≠ turn) is **KEEP**, its implementation and re-arm are not carried (charter §3) |
| **TTS / output** | `OracleConversation.maiaSpeak`: fetch from `/api/voice/openai-tts` (**OpenAI cloud by default**; Kokoro needs env + archetype), decode, `BufferSource → Gain → Analyser → destination` in WebKit (P3 #1, #5–8, §3). | OC only | **nobody** — the source node lives in local variables; barge-in, tap-interrupt, emergency stop and both watchdogs stop nothing that plays on `/maia` (P3 §5) | n/a | `ctx.resume()` only | Output does not wait for capture to stop; capture does not wait for output to end; no handshake (P3 §5); `Audio output confirmed` proves graph activity, not sound (P3 §4) | **REPLACE** — a TTS adapter renders through the runtime's output; engine selection is a sovereignty ruling (§5 F1) |
| **Routing** | Nobody. Speaker routing comes solely from the plugin's `.defaultToSpeaker`; no `overrideOutputAudioPort`, no route observer (P1 #27, #29). | — | — | — | — | Route alternation witnessed in E18 with no code reacting to it | **REPLACE** — routing is a runtime concern with observable state (VOICE-07) |
| **Interruption recovery** | Nobody native: **zero** observers of interruption / route change / media-services reset anywhere in the app or any pod (P1 #27). "Interruption" in the web layer means `appStateChange` only (P1 §2.2). Recovery = 11 restart drivers + `[voice:watchdog]` 90/120 s + 75 s recovery timer (P2 §2, P3 #23–24). | restart drivers | — | restart drivers | — | Two handlers per foreground (D6 + D7); every driver restarts by killing; `isConversationAlive` self-refreshes on every restart so it cannot end a storm (P2 F8); the only exit is the web `onend` inactivity guard (P2 F5) | **REMOVE** the restart-driver family; recovery belongs to the runtime (VOICE-06) |
| **WebView media** | WKWebView with `mediaTypesRequiringUserActionForPlayback = []`, capture auto-granted (P1 #24–25); five standing `AudioContext`s on `/maia` incl. a permanent 1 Hz keep-alive oscillator installed at module load (P5 #7–11); a web `SpeechRecognition` can be created on iOS by D4, which has no native guard (P2 D4/F4); Quick Journal claims `getUserMedia` + web SR over voice mode with no gate (P5 #4). | web code | web code | D4/D5 | — | WebKit's session vs the plugin's session (S1 §4: WebKit ignores the app's category; documented "already interrupted" lineage); `LISTENING_STOOD_DOWN` in E18 is reachable **only** from a web recognizer's `onend` (P2 F5) | **REMOVE** on iOS — the WebView expresses intention only (VOICE-05) |
| **UI state** | `OracleConversation` booleans (`isListening`, `isMuted`, `isActivating`, four TTS flags) → `voiceInteractionState`; the engine's `micState` is **never rendered** (P4 §4d). | — | — | — | — | Three optimistic `isListening=true` writers; `isMuted` vs `isListening` desync acknowledged in code; `isHandsFreeMode` write-only mirror; `CAPTURING`/`WAITING_FOR_TTS` never entered (P4 §4c) | **REPLACE** — the UI reads the runtime's single `voice.state` (VOICE-07) |

---

## 2. The actual authority graph

Authority, not components. Read each list as *"these can do this today, on `/maia` iOS voice mode, without asking anyone."*

### 2.1 Who can cause physical audio state to change?

```text
AVAudioSession ◀── speech-recognition plugin .start()           (every restart: 11 requesters upstream)
               ◀── AudioSessionManager.prepareForSpeaking()     (repaired build only; every TTS turn; setActive(false)→.playback→setActive(true))
               ◀── WebKit content process                       (Web Audio graph, keep-alive oscillator, any web SpeechRecognition — outside MAIA source)
               ◀── capacitor-voice-recorder                     (composer mic; blocked today at the unregistered gatekeeper; opens if AudioSessionManager registers)
AVAudioEngine  ◀── plugin .start() (create)  ◀── plugin .stop()  ◀── ANY plugin task callback (no task identity)
speaker        ◀── maiaSpeak (start only; no stop handle anywhere)
```

Four session writers, none of which knows about the others. The one that runs most often (the plugin) never releases what it takes.

### 2.2 Who can terminate another subsystem's work?

```text
startListening (any of 11 requesters) ──stop()──▶ whatever engine is live, confirmed or not     (P2 #3)
plugin task callback (stale task)     ──stop()──▶ the NEW engine                                 (P1 #9)
OracleConversation isSpeaking=true    ──────────▶ CC discards unsent text, stops native, PLAYING_TTS (P4 D3, P2 F9)
OracleConversation guards O2/O10      ──────────▶ vetoes a turn CC already marked submitted     (P4 §6.3)
web onend inactivity (45 s)           ──────────▶ ERROR + wantsContinuous=false: parks the mic; does NOT stop the native engine (P2 F5)
[voice:watchdog] 90/120 s             ──────────▶ resets all flags, restarts mic; audio untouched (P3 #23)
gatekeeper prepareForSpeaking         ──────────▶ tears down only its OWN objects; the live engine is not its (P1 §2.4.3)
```

### 2.3 Who can decide a human turn is finished?

```text
2500 ms no-partials timer   ┐
1500 ms audio-level timer   ├─ armed simultaneously on iOS; (b)/(c) share one ref; (c) has no isSpeaking check
plugin listeningState:stopped ┤  (removed by Repair Two)
manual stop                 ┘
+ Android recorder bound · sovereign whisper bound (other platforms)
+ OracleConversation: can VETO (12 ways), cannot close
```

Seven deciders; on the live iOS path four at once. And 22 places that can make the text vanish before or after a decision, four of them silent to telemetry (P4 §6.2).

### 2.4 Who can declare recovery?

```text
D1 stopped_backoff · D2 800 ms · D3 immediate · D4 600 ms (web SR!) · D6 interruption_end 1 s · D7 foreground 800 ms
P1 streaming 300 ms · P2 stream cooldown 200 ms · P3 [NON-STREAM] 0 ms + rAF ×2, retry 400 ms ×8 · P4 watchdog 90/120 s
```

Ten automatic recovery authorities, every one of which "recovers" by killing and restarting, every one of which the parent labels `user_tap` at the boundary so the push-to-talk policy never applies (P2 F3). None observes whether the microphone is actually delivering energy. Recovery is declared by *starting*, not by *hearing*.

### 2.5 Overlaps (the interesting nodes)

| Overlap | Nodes | Why it matters |
|---|---|---|
| Session custody | plugin · gatekeeper · WebKit · voice-recorder | Every combination witnessed or latent in E14/E16/E18 |
| Engine termination | 11 restart requesters · stale task callback | The storm's engine (§3) |
| Turn closure | 4 armed closers · 22 discarders · OC veto | The E16.1 drop and the "submitted but never received" hole |
| Recovery | 10 drivers · 2 handlers per foreground · watchdog | No driver can tell a dead mic from a quiet one (VOICE-08) |
| Truth | `micState` · `nativeStatusRef` · `isRecording`/`isListening` · OC's six · `voiceSession.phase` | No single answer to "are we listening?" (VOICE-07) |

---

## 3. The failure graph — E16/E18 as a deterministic interaction

Overlaying the witnessed device runs (lane doc E16, E18) onto the census. Every arrow is a code path from the parts; where a step is inferred from timing rather than source it is marked **[inf]**.

### 3.1 The long-utterance drop (E16.1)

```text
member speaks 30 s+
  ↓ plugin partials grow (matches[0] cumulative)                              P1 #5
  ↓ recognizer re-segments INSIDE one task — no event                         E16.1
  ↓ next partial = "And"                                                      E16.1
  ↓ CC: accumulatedTranscript.current = transcript   (assignment, not append)  P4 D7 / P2 F6
  ↓ 537 chars gone; continuity buffer holds nothing on native (recordPending is web-only)  P4 §4c
  ↓ 2500 ms timer fires → native_silence sends the ~60-char tail              P4 site 4
```

Deterministic given the plugin's behaviour: the web layer's only model of a turn was "the last partial". Repair Two (E20) changes the fold; it does not change who closes the turn.

### 3.2 The turn boundary (every spoken reply)

```text
response JSON arrives
  ↓ OC setIsMicrophonePaused(true) → CC isSpeaking=true                        P3 seq 2
  ↓ CC: discard unsent text (D3) · clear timers · PLAYING_TTS · plugin stop() fire-and-forget   P2 F9
  ↓ plugin stop(): endAudio + engine.stop — task NOT cancelled, session NOT released, emits stopped #1   P1 #7
  ↓ OC prepareForSpeaking (unsequenced vs the stop above)                      P3 seq 8, P1 Q4
        canonical: rejects at the bridge → continue
        repaired : setActive(false) → .playback/.spokenAudio → setActive(true) UNDER a plugin session that is still nominally active
                   → WebKit content process logs "beginInterruption but session is already interrupted!"   E16 / S1 §4
                   → Web Audio renders into an interrupted session → graph active, speaker silent = H-SILENT  [inf, A/B pending]
  ↓ TTS fetch (OpenAI) → decode → BufferSource.start                           P3 seq 9–11
  ↓ +2 s: "Audio output confirmed" (analyser bins non-zero — not the speaker)  P3 §4
  ↓ plugin stale task finalises the ended request → stopped #2 → D1 evaluates a restart WHILE MAIA speaks; refused only by !isSpeakingRef   P1 §2.4.2, P2 D1 step 7
```

### 3.3 The re-entry storm (E18: 37 generations, ≈46 s)

```text
maiaSpeak resolves
  ↓ OC finally: isMicrophonePaused=false at cooldown 0 → CC isSpeaking=false   P3 seq 16
  ↓ SIX restart requests from one transition:                                   P2 F9
       D3  immediate        requestRestart('maia_stopped_speaking')
       P3  0 ms + rAF×2     startListening('non_stream_restart_attempt') → arrives as user_tap
       D4  600 ms           ensureFreshAndStart → creates a WEB SpeechRecognition inside the WebView (no native guard)   P2 D4(b)
       D2  800 ms           requestRestart unless nativeStatusRef==='started'
       P3  +150 ms verify   phase!=='listening' → retry 400 ms, ×8
       (P1/P2 if streaming; not this path)
  ↓ EACH accepted request: pre-emptive plugin stop() → cleanup() cancels previous task → NEW engine → session re-asserted   P2 #3, P1 #8
  ↓ the cancelled task's callback lands on the NEW engine: audioEngine.stop() + stopped   P1 #9  → "No speech detected" within 0.3–1.9 s   E16
  ↓ D1: stop inside 1200 ms grace → not counted; backoffStepRef reset to 0 on every 'started' → NEITHER ceiling can fire   P2 D1 step 3, F-D1 [inf]
  ↓ isConversationAlive refreshed by every startListening → cannot expire   P2 F8
  ↓ meanwhile the web SpeechRecognition from D4 runs its own onend/restart loop (D5) in the WebView
  ↓ session configuration ALTERNATES Bottom/0.01 ↔ Front/0.0026666           E18
        0.01 s       = the plugin's setPreferredIOBufferDuration(0.01)          P1 #2
        0.0026666 s  = 128 frames ÷ 48 000 Hz = WebKit's Web Audio render quantum   [inf: arithmetic exact; attribution to WebKit not witnessed]
        → two owners alternately winning the session, one per generation
  ↓ exit: web onend inactivity — no speech AND no MAIA audio end within 45 000 ms   P2 #23   ⚠ qualified by §3.4 E23 — in the registered Pi8 witness this guard did not terminate the interaction within the captured interval
        E18: "69s since speech, 46s since MAIA" → 46 s > 45 s → handleCaptureLoss('inactivity')
        → LISTENING_STOOD_DOWN · MicState ERROR · isListening=false · wantsContinuous=false → D1/D2 silenced · mic parked   P2 F5
        → handleCaptureLoss does NOT stop the native engine
  ↓ the last plugin engine survives, running, on an input the session fight left dead → level 8.8e-43   E18  [inf on cause; VOICE-08 on principle]
```

**Reading.** Not 37 bugs. One transition fans out to six restart authorities; each restart kills the engine before it, the killed engine's task kills the one after it, the two ceilings that could stop the loop are structurally reset by the loop itself, the only exit is a web-path inactivity guard that was never meant for native, and the exit leaves a native engine running on nothing. The alternating route configuration is the two session owners taking turns. **The storm is the architecture executing correctly.**

### 3.4 E19 / E20 overlay — E23 recorded (founder act, 2026-09-11)

E19 (A/B on the preserved pre-registration build) decides whether the repaired-build silence is the gatekeeper flip (§3.2 repaired branch) — the census locates the mechanism, the device decides the attribution. E20 (Repair Two witness) tests §3.1 only. E20 is not run. **E19's registered arm is now witnessed (E23 below); its pre-registration arm is DEFERRED by founder ruling** — useful later for the historical causal increment (*did registering the gatekeeper materially worsen this exact Pi8 sequence?*), no longer needed to justify the replacement architecture, and not a block on KERNEL-00.

```text
E19 REGISTERED ARM      WITNESSED · STRONG POSITIVE   (E23)
E19 PRE-REG ARM         UNSPENT · DEFERRED
E19 A/B                 HISTORICALLY INCOMPLETE
LEGACY REPAIR           FORBIDDEN / NONE
```

#### E23 — Registered-arm runtime witness: competing audio/recognition authority under Bluetooth HFP (Pi8)

**Source:** Xcode console capture, 2026-09-11 ≈15:57–16:00Z, scheme `claude/ios-runtime-01-audiosession-registration` run from Xcode on the founder's iPhone (iOS 18.7), speech plugin "Build 77 — VoiceChat Mode", web bundle stamp `2026-01-31_pwa_voice_v3`, flags `VOICE_V2 · IOS_VOICE_NATIVE`. Founder-supplied; ≈2 minutes of console plus a second frame at speech-age 99 s. Classified by founder ruling; **recorded, not repaired** (charter §0). The RUNTIME-01 lane ledger (E13–E22) lives on the registration branch; this entry is the census overlay and does not edit that ledger.

**Evidence classes (founder-ruled; keep the line):**

```text
WITNESS-PROVEN
  registration active            "[MAIABridgeViewController] registered in-app plugin: AudioSessionManager" at launch
  Pi8 Bluetooth HFP route        INPUT and OUTPUT = BluetoothHFP "Pi8" on every native start; built-in mic listed as available only
  native recognizer starts       "[SR] ✅ Engine started - listening", category playAndRecord / mode voiceChat, 16 kHz, on-device recognition YES
  OpenAI TTS header              /api/voice/openai-tts response carries x-tts-provider: openai (ruling F1 live on this build)
  gatekeeper teardown/flip       prepareForSpeaking → "Performing full teardown" → "Session deactivated" → "Category set to playback/spokenAudio" → "Session activated for speaking"
  Web Speech lifecycle active    web SpeechRecognition in the WebView: voice_transcribe_error aborted · onend restart every 300 ms · "Fresh recognition object (onend_restart, gen 1 … gen 18)"
  restart / no-speech cycle      ≥18 native cycles in ≈25 s: start → started → "Recognition error: No speech detected" within 0.6–1.8 s → stopped → restart
  voice-recorder path reached    after cycle 18: "stopListening called (internal)" → "Using native voice recorder (capacitor-voice-recorder)" → VoiceRecorder hasAudioRecordingPermission
  WebKit session contention      WebContent: "AudioSession::beginInterruption but session is already interrupted!"
  first turn intact              "Hi can you hear me" dispatched by the 2500 ms silence timer; the native_stop duplicate 42 ms later discarded; MAIA replied; the 2026-09-07 transcript seam committed the turn by watchdog (speak path 6.8 s)

INFERRED
  which competing owner imposes the 2.875 ms IO buffer   (alternates with the plugin's 0.01; the plugin never asks for 2.875 ms — a second owner exists; 0.002875 s does not reduce cleanly to a 128-frame quantum at 44.1 or 48 kHz, so the §3.3 WebKit attribution stays an inference)
  Bluetooth/SCO reopen timing as the mechanism            (playback category drops the HFP input link; voiceChat must reopen it; the recognizer starts before audio arrives; "No speech detected"; the restart flips the session again)
  whether Bluetooth amplifies rather than originates      (decidable without code: same sequence on the built-in route)
```

**Ruling wording for the gatekeeper finding (preserves the ratified F1–F4 numbering — this is the split session-authority / gatekeeper finding, ruling **F2**, census §5 **F3**; it is NOT ruling F3, which is output cancellability):** *The registered gatekeeper is witnessed as an active `AVAudioSession` writer on the live path: before TTS it tears down the current session, deactivates it, changes category to `playback/spokenAudio`, and reactivates.*

**Then the competing runtime becomes visible.** While the native recognizer reports `playAndRecord / voiceChat`, WebContent reports that an audio-session interruption is already in progress. The web recognition lifecycle independently reaches generation 18 while the native path is also cycling; at cycle 18 the log proceeds into the native voice-recorder permission path. Strong runtime corroboration of §2.1, §2.5 and §3.3.

**Two overlay qualifications of §3.3 (recorded, causes unresolved):**

1. **"The 45 s inactivity guard is the only exit" — qualified.** In the registered Pi8 witness that guard did not terminate the observed interaction within the captured interval: the second console frame shows the cycle continuing at `speech: 99s` with `conversation_alive: true`. Either its predicate was not satisfied / not armed on this build, or activity generated by the competing restart system continually refreshed it. **Do not choose between these yet.**
2. **The grace-period exemption suppresses the failure it was meant to protect.** Every stop in the loop is logged "Idle stop within N ms grace period — not counting as failure" with N from 1 ms to 1167 ms, and every start logs "Restart counter reset to 0 (mic is live)". A stop 1 ms after start is exempted as benign. *The mechanism intended to suppress false failure counting can suppress the failure being measured.* **Preserved as a Voice 2026 anti-pattern:** a recovery ceiling may never be reset by the act it is counting (cf. VOICE-06/-15/-16; K00-10 fault-class budgets are windowed by wall clock, not by successful starts).

**Member-visible symptom:** after MAIA's first spoken reply she never hears the member again; the mic indicator flickers with each cycle. Class: E18 re-entry storm, Bluetooth HFP variant. No legacy remedy exists; Repair Two (turn close) does not address it.

**E23 addendum — founder reading of the complete Xcode capture (2026-09-11).** The excerpt above understates persistence. In the full file: the loop is demonstrably still active at speech-age **99 s** with the exact sequence *mic reported live → restart counter reset to 0 → native state stops → "Idle stop within 1ms grace period — not counting as failure" → authority allows another restart → hands_free_restart → startListening FORCE OVERRIDE → repeat*; a file search finds **hundreds** of exact `"Idle stop within 1ms grace period"` instances, including at speech-age 60 s and 61 s and much later; `Restart counter reset to 0 (mic is live)` recurs throughout; the `0.002875` IO buffer recurs many times while the plugin still reports `playAndRecord / voiceChat`, which proves the plugin is not maintaining the physical configuration it believes it owns (the owner of that value stays inferred). The 45 s qualification above is therefore not speculative: *whatever the intended exit was, it did not terminate this observed registered-build interaction.* And the ceilings finding is stronger than "fail to fire": **the storm continuously refreshes the conditions that prevent the ceilings from firing.** The third capture path (voice-recorder) is directly in the capture, so the census's registration warning is no longer hypothetical. Roadmap unchanged; its justification strengthened.

**Founder wording adjustment (recorded):** KERNEL-00 is not "one step" — it is **the architectural proof point**. If the new kernel can sit on the same iPhone + Pi8 HFP route, render output, retain live input, survive route transitions, and remain stable without manual taps or ownership storms, the old pathology is experimentally shown to belong to the architecture — not to Bluetooth, not to the phone, not to iOS speech. The `?` on the KERNEL-00 side of the comparison below is now the most important open item in the voice programme.

**KERNEL-00 consequence (founder ruling):** the Pi8 is a **named K00-11 route**, not "some Bluetooth device". The witness exercises at least `built-in → Pi8 HFP → built-in → Pi8 again`, and while output renders on the Pi8, K00-06 must show input callbacks continuing without collapse to digital zero. The comparison this sets up:

```text
LEGACY + Pi8                      VOICEKERNEL + Pi8
  multiple session owners           one session owner
  category transitions per turn     persistent conversational category
  recognizer restart storm          no recognizer at all
  input health never observed       duplex physiology observed
```

If KERNEL-00 survives the same physical route cleanly, that is stronger evidence than any further legacy repair could provide. **Next substantive act: the KERNEL-00 device witness.** The old organism is left alone.

---

## 4. The 2026 disposition

One label per significant old subsystem. **KEEP** concept and implementation survive · **ADAPT** concept survives, implementation changes · **REPLACE** responsibility survives, owner changes · **REMOVE** the responsibility should no longer exist. Labels are the census's proposal to the founder, not rulings.

| Subsystem | Today | Label | Reason |
|---|---|---|---|
| Deep-Intelligence convergence (`handleVoiceTranscript` → `handleTextMessage`), the canonical turn, `commitOracleTurn` seam | canonical MAIA side (P4 §5) | **KEEP** | Out of scope by charter §2; the runtime delivers `turn.committed` text to exactly this seam |
| Segment ≠ turn (Repair Two's principle) | `lib/voice/turnAccumulator.ts` on its branch | **KEEP** the principle → VOICE-03; **REMOVE** the implementation's re-arm-on-recognition-start (E21) | The principle is constitutional; the code exists only because the recognizer was the closer |
| Dispatch provenance / `witnessDispatch` / voice diagnostics event catalogue | web layer (P4 §1, §5) | **ADAPT** | Observability survives; events are emitted by the runtime (`transcript.partial/final`, `turn.committed`, `voice.state`), witnessed once at one boundary |
| Sovereign STT on the server (`maia-whisper`, `/api/voice/transcribe-simple`) | live for chat-mode and other routes (P5 §3) | **ADAPT** | Remains a `SpeechRecognizer` protocol implementation; capture no longer belongs to the caller |
| `@capacitor-community/speech-recognition` (patched) as session owner + engine owner + recognizer | live (P1 §2.1) | **REPLACE** | Recognition survives as an adapter; session and engine ownership move to the runtime (VOICE-01/02) |
| `AudioSessionManager.swift` gatekeeper (per-turn category flip, teardown) | unregistered on canonical; registered on the repair branch | **REMOVE** | Under VOICE-04 the responsibility "reconfigure the session to speak" does not exist |
| `VoiceController.swift` | tracked, **not compiled** (P1 #18) | **REMOVE** | Dead |
| `ContinuousConversation` restart drivers D1–D7 and `OracleConversation` P1–P4 | live (P2 §2) | **REMOVE** | Recovery belongs to the runtime (VOICE-06); the drivers are the storm |
| Silence timers as turn closers (2500 / 1500 / web threshold) | live (P4 §3) | **REPLACE** | Endpointing survives inside a `TurnManager`; values become policy, not scattered literals |
| `native_stop` (recognizer-closes-turn) | live on canonical; removed on Repair Two | **REMOVE** | VOICE-03 |
| Discard sites D1–D10, echo phrase list, three dedup windows | live (P4 §2) | **REMOVE** the family; **ADAPT** one dedup at the turn-commit boundary | 22 authorities over the member's words is the defect, not any one of them |
| `maiaSpeak` Web Audio playback on iOS | live (P3 #8) | **REPLACE** | Output renders through the runtime's TTS adapter; a stop handle exists by construction |
| OpenAI cloud TTS as the `/maia` default (`/api/voice/openai-tts`) | live (P3 §3) | **REPLACE** — **ruling required** (§5 F1) | Conflicts with the project vow; Kokoro is opt-in twice today |
| `[voice:watchdog]` 90/120 s, 75 s recovery timer, 6 s transcript watchdog | live (P3 #15, #23–24) | **REMOVE** the first two; **KEEP** the transcript watchdog (it protects the record, not the audio) | VOICE-07/08 replace state-based health with physiological health |
| `Audio output confirmed` probe | live (P3 §4) | **REMOVE** | Measures the wrong thing; replaced by rendered-output observation in the runtime |
| iOS keep-alive oscillator + `voice-feedback-prevention` context (two standing WebKit contexts at module load) | live (P5 #8–9) | **REMOVE** | A standing web audio session is a session owner (VOICE-01) |
| Web `SpeechRecognition` on iOS (D4 path), Quick Journal `getUserMedia` + web SR over voice mode | reachable (P2 F4, P5 #4) | **REMOVE** on iOS | VOICE-05 |
| Composer mic (`capacitor-voice-recorder` via `useVoiceInput`) | rendered, fails closed at the gatekeeper (P1 row J) | **REPLACE** | One capture owner; the composer asks the runtime for a bounded capture |
| `MicState` / `nativeStatusRef` / OC boolean set as UI truth | live (P4 §4) | **REPLACE** | UI reads `voice.state` from the runtime (VOICE-07) |
| `useVoiceSession` boundary (drops `reason`, labels every parent restart `user_tap`) | live (P2 F3) | **REMOVE** | The boundary becomes `startConversation / stopConversation / mute / interrupt` |
| Dormant cloud STT/TTS (`streamTranscribe.ts` OpenAI + Deepgram, `MaiaRealtimeClientDirect.ts`, `ttsWithFallback.ts`, `VoiceMirror`, `WhisperContinuousConversation`, `NativeAudioRecorder`) | unreached (P5 §1c, P3 #30) | **REMOVE** | Dead; two of them target providers the vow forbids |

Nothing labelled KEEP is voice infrastructure. That is the migration boundary in one sentence: **canonical MAIA and the record survive; the sensory/motor apparatus is rebuilt.** ARCH-01 draws the line precisely.

---

## 5. Findings that need a founder act (outside the schema)

**F1 — The spoken voice on `/maia` is OpenAI cloud TTS by default.** `OracleConversation` posts to `/api/voice/openai-tts`; the route uses the OpenAI SDK unless `MAIA_LOCAL_VOICE_ENABLED=1` **and** `MAIA_TTS_PROVIDER=kokoro` **and** the member's archetype is a Kokoro one; the client has no fallback engine (P3 §3). CLAUDE.md says *never OpenAI or other cloud AI providers; voice: local TTS/STT or browser APIs only.* Either this is an accepted, undocumented exception, or a claim-state gap. Recorded, not repaired. Related: `MaiaRealtimeWebRTC` (dormant) would open an OpenAI Realtime session; `streamTranscribe.ts` (dormant) targets OpenAI and Deepgram STT (P5 #33–34).

**F2 — A `MAIABridgeViewController` subclass was added to canonical and reverted on 2026-03-03** (`abdbf858c` → `835e176c5`, "broke Capacitor bridge"). The revert body says the file was never added to the Xcode project, so the class could not be instantiated and the WebView never initialised. That is a pbxproj omission, not a bridge defect — and the RUNTIME-01 repair (`4551a56ed`, not on this branch) did update the pbxproj and proved registration on device (E13). Recorded so the history is not misread as a caveat against the current repair, and so the RUNTIME-01 lane record can cite it.

**F3 — Registering `AudioSessionManager` opens a second capture path that is closed today.** The composer mic chain (`ModernTextInput` → `useVoiceInput` → `capacitorRecorder`) runs `prepareForListening` (`.measurement`) then `capacitor-voice-recorder` (`.playAndRecord`, default mode) with no stop of the community engine anywhere in the chain; today the tap dies at the unregistered gatekeeper (P1 §2.4.4, P5 #2). The repaired build therefore has a third session writer reachable from the chat-mode mic. Not witnessed; source-level.

**F4 — E18's `LISTENING_STOOD_DOWN` is only reachable from a web `SpeechRecognition`'s `onend`**, and D4 (`auto_resume_after_tts`) can create one inside the iOS WebView because its "WEB path only" comment has no native guard (P2 D4, F5). If that is what happened, the storm had two recognizers, two restart loops and two session owners — which is also the shape the alternating route configuration suggests (§3.3). Open question P2 Q1 (does `webkitSpeechRecognition` exist in the shipped WKWebView) decides it; a device trace with `voice_recognition_ended` alongside the native `listeningState` events would settle it in one run.

**F5 — Nothing can stop MAIA's audio once it starts.** Barge-in (default off), tap-interrupt (live), emergency stop and both watchdogs call stops for paths that do not play on `/maia`; the live `BufferSource` has no handle (P3 §5). The tap-interrupt also re-opens capture under still-playing audio **[inf]**.

**F6 — Two source defects, recorded not repaired:** `streamVoice.stop()` at `OracleConversation.tsx:10340` references an undefined identifier on the voice bar's stop button (P3 #20); `/api/voice/health` probes `maia-whisper:9000` while the service listens on 8000 (P5 §3).

**F7 — Documentation drift in `voiceTiming.ts`:** `NATIVE_SILENCE_MS`, `NATIVE_RECENT_SPEECH_MS`, `GRACE_WINDOW_MS` are declared and unreferenced; the native path uses literals; the documented 750 ms grace window does not exist (P4 §3).

---

## 6. What the survey establishes, and does not (S1 — capability, not design)

Evidence the target architecture may rely on (each sourced in S1; UNVERIFIED items are marked there):

- `.playAndRecord` + `.voiceChat` continues playback with the silent switch engaged and holds one session across listen/speak (S1 §1) — the E18 "silent switch UNWITNESSED" ambiguity is not a necessary property of MAIA voice.
- Voice-processing I/O is global to both nodes, must be enabled with the engine stopped, forces mono output and can change the input format; AEC has a residual tail (S1 §2) — constraints for the runtime's engine lifecycle, not reasons to keep per-turn reconfiguration.
- iOS 26 `SpeechAnalyzer` separates input stream, analysis modules (`SpeechTranscriber`, `SpeechDetector`) and results with volatile → final semantics; the community plugin uses the legacy API and owns its engine, tap and session call — *a second session owner by construction* (S1 §3).
- WebKit runs its own audio session that ignores the app's category; Web Audio can enter an un-resumable interrupted state and follows the mute switch; Capacitor `notifyListeners` has a documented data race and no cross-emitter ordering guarantee (S1 §4) — the mechanism class for H-SILENT and for "stopped" events landing on the wrong closure.
- Every reference realtime architecture surveyed separates capture · VAD · STT · turn-commit · LLM · TTS · render, with turn-commit as its own stage and an upstream interruption signal (S1 §6) — VOICE-03 is the industry's default, not MAIA's idiosyncrasy.
- Engine recovery after route change / interruption / media-services reset is rebuild-not-resume; `isRunning` can be true while nothing flows (S1 §7) — VOICE-08 has platform precedent.
- Sovereign engine options exist on both sides of the boundary (S1 options matrices); no established iOS practice was found for confirming *audibility* of rendered output (S1 §8, UNVERIFIED gap) — VOICE-07's "output alive?" needs its own design.

None of this is a recommendation. The survey rule (charter §9) holds: platform capability is evidence; MAIA's design is decided in ARCH-01.

---

## 7. Consolidated open questions

Carried from the parts; each is answerable by a specific instrument, none by more source reading.

| # | Question | Instrument |
|---|---|---|
| Q1 | Does the shipped WKWebView expose `webkitSpeechRecognition` / `getUserMedia` (decides F4 and Quick Journal concurrency)? | one device run with web `voice_recognition_*` events and native `listeningState` side by side |
| Q2 | Is the repaired-build silence the gatekeeper flip (§3.2)? | E19 A/B, already ruled — registered arm WITNESSED (E23, §3.4); pre-registration arm DEFERRED by founder ruling |
| Q3 | Does the whole utterance survive re-segmentation under Repair Two? | E20, already ruled |
| Q4 | What does WebKit's content process do to the shared session when Web Audio starts under the plugin's session; what is the session state before the first `start()`? | native session diagnostics read at those moments (the gatekeeper's `getAudioDiagnostics` exists but is only read on failure) |
| Q5 | Which arrives first on a spoken turn: the plugin `stop()` or `prepareForSpeaking`? | E14 witnessed teardown first; a timestamped trace settles it per run |
| Q6 | Is OpenAI TTS an accepted exception (F1)? | founder ruling |
| Q7 | Is the composer-mic session path (F3) intended to open with registration? | founder ruling; not a census matter |
| Q8 | Does the 60 s web timeout merge two utterances via continuation restart on the PWA? | trace of `voice_recognition_ended` vs `voice_turn_committed` |

---

## 8. What this census does not establish

- Device behaviour. Every claim is source-level; E-series entries are cited as witnessed, inferences are marked.
- The Android path, the PWA path beyond where they share code with iOS, and any route other than `/maia`.
- The correct target architecture — that is ARCH-01, gated on the synthesis question (charter §9).
- That any subsystem labelled REMOVE is safe to delete today. Labels are dispositions for the *new* organism, not deletion orders for the legacy one, which stays frozen as evidence (E21).

> **Synthesis question for the next act:** given MAIA's sovereignty, relational continuity, mobile requirements, and future barge-in / prosodic ambitions, what is the smallest lawful voice organism we should own? The census answers what we own now: **four session writers, eleven starters, seven stoppers, four closers, twenty-two discarders, ten recoverers, and no single truth.** The smallest lawful organism is the one in which each of those numbers is one.
