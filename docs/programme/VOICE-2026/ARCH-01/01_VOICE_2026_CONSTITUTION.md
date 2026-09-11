# The Voice 2026 Constitution — RATIFIED

**Act:** ARCH-01 · artifact 1 · 2026-09-11 · **Status:** **RATIFIED — founder act, 2026-09-11** (`00_README.md` §2b): *VOICE-01 through VOICE-20 are RATIFIED as the Voice 2026 Constitution*, with two amendments recorded in place below (VOICE-14 causal gate; VOICE-18 turn-continuity retention). VOICE-10, -17, -19, -20 were ruled earlier the same day (§2a).

Twenty articles — eighteen from the research (§6) and two from founder rulings on the census (F2; the JARVIS distinction). Each carries: the **statement** (research §6, verbatim in substance); the **evidence** that made it necessary (census, by part and section); the **falsifier** — the observable event that proves the article violated; and the **gate** that would catch it. Gate kinds: **S** = automated source gate (a test that fails on the code shape) · **D** = device gate (a predeclared on-device witness) · **P** = policy gate (a configuration/runtime check). *Every article must be falsifiable or it is not law.*

The constitution governs the new organism (`VoiceKernel` and everything on the iOS voice path after `MIGRATE-01`). It does not retroactively judge the legacy runtime, which is frozen evidence (E21).

---

### VOICE-01 — One hardware sovereign
**Statement.** Exactly one native authority may configure or activate the iOS conversational audio session.
**Evidence.** Four session writers today: the speech plugin on every start, the gatekeeper on the repaired build, WebKit's own session, the voice-recorder path (census §1 row 1; P1 §2.1–2.4).
**Falsifier.** Any `AVAudioSession` mutation (category · mode · options · `setActive` · preferred rates · route override · voice-processing flag) executed by code outside `AudioSessionAuthority`; or a trace showing two components' session writes within one conversation.
**Gate.** S — a source gate over `ios/**` and every linked pod that fails on `AVAudioSession` mutation outside the authority module (research §5.1). D — the flight recorder shows one writer per session.

### VOICE-02 — Conversation lifetime is independent of recognizer lifetime
**Statement.** An STT process may start, stop, crash, or be replaced without implicitly opening or closing the physical conversation session.
**Evidence.** The plugin's `start()` is the session's only activator and nothing ever deactivates it; every recognizer restart re-asserts the session (P1 #1–4).
**Falsifier.** A recognizer lifecycle event (start · stop · error · final · replacement) followed, without a kernel decision, by a session activation, deactivation, or reconfiguration.
**Gate.** D — fault injection "terminate STT mid-turn" (KERNEL-01 onward) shows `audioSession` health unchanged.

### VOICE-03 — Segment is not turn
**Statement.** Recognizer segmentation, finalization, and task callbacks have zero authority to commit or discard a member turn.
**Evidence.** E16.1: 537 characters discarded on an in-task re-segmentation; `native_stop` sent on the plugin's `stopped` (P4 §1 site 6, §2 D7).
**Falsifier.** A `turnCommitted` or a discard of held member text whose causal event (VOICE-16) is a recognizer boundary rather than a `TurnCoordinator` decision.
**Gate.** S — only `TurnCoordinator` may emit `turnCommitted` (VOICE-09 gate). D — the E16.1 reproduction (long utterance across a re-segmentation) closes as one intact turn.

### VOICE-04 — Listening and speaking share one coherent session
**Statement.** Normal listen → think → speak → listen transitions must not require competing components to rewrite the physical audio configuration.
**Evidence.** The gatekeeper flips `.playAndRecord/.voiceChat` → `.playback/.spokenAudio` per reply underneath a still-active plugin session; the E18 alternation (P1 §2.3; census §3.2–3.3).
**Falsifier.** Any session category/mode change between `enterConversation` and `leaveConversation` that is not a route or interruption recovery act stamped as such.
**Gate.** D — KERNEL-00 obligation K00-03 (zero configuration mutations across N cycles).

### VOICE-05 — The WebView has no iOS hardware authority
**Statement.** On iOS, the WebView may express commands and render state. It may not own MAIA's microphone, recognizer, audio output, or session configuration.
**Evidence.** Web `SpeechRecognition` created inside the WebView by an unguarded driver; five standing WebKit `AudioContext`s; a keep-alive oscillator; Quick Journal claiming `getUserMedia` over voice mode (P2 D4/F4; P5 #4, #7–11).
**Falsifier.** On the iOS voice path: any `getUserMedia`, `SpeechRecognition` construction, `AudioContext` used for conversational input/output, or `<audio>` playback of MAIA's voice from web code.
**Gate.** S — a source gate over the iOS bundle's voice path that fails on those constructors outside a web-only branch; D — the WebView capture state reads *not capturing* throughout a session.

### VOICE-06 — Recovery has one owner
**Statement.** Only the `HealthSupervisor`/`VoiceKernel` may initiate automatic recovery. Recovery is bounded, idempotent, generation-aware, and cannot form a self-exciting restart loop.
**Evidence.** Ten automatic recovery drivers, each recovering by killing; ceilings reset by the loop itself; 37 generations in 46 s (census §2.4, §3.3).
**Falsifier.** A recovery act not requested by `HealthSupervisor`; or two recovery acts within the same generation; or a generation count exceeding the retry budget without a terminal degraded state.
**Gate.** S — only the supervisor may call the kernel's recovery entry; D — KERNEL-00 K00-09/K00-10.

### VOICE-07 — Runtime truth precedes UI belief
**Statement.** The UI may display "listening" only from authoritative runtime state. Requested state and observed state remain separate.
**Evidence.** Three optimistic `isListening=true` writers; the engine's `micState` never rendered; `isMuted` vs `isListening` desync acknowledged in code (P4 §4c–4d).
**Falsifier.** A rendered "listening" (or any voice state) whose value did not originate from a `voice.*` event of the current session.
**Gate.** S — the UI's voice-state reducer accepts only kernel events (no local `setListening(true)`); D — UI/runtime disagreement rate = 0 over a KERNEL-01 run.

### VOICE-08 — Started is not healthy
**Statement.** Health requires evidence of actual input/output flow. A running engine with dead input is degraded.
**Evidence.** E18: engine `running` on an input delivering 8.8e-43 (census §3.3); the `Audio output confirmed` probe measuring graph activity, not sound (P3 §4).
**Falsifier.** `inputFlow = healthy` while the last N input callbacks carried digital zero; or `outputFlow = rendering` with no frames rendered.
**Gate.** D — KERNEL-00 K00-07/K00-08 (injected digital zero and stalled output are detected within the predeclared window).

### VOICE-09 — Exactly one turn-commit authority
**Statement.** Timers, STT, VAD, models, and UI gestures provide evidence; only `TurnCoordinator` commits.
**Evidence.** Four closers armed at once; seven deciders; twenty-two discarders (P4 §6.1–6.2).
**Falsifier.** A `turnCommitted` event whose emitter is not `TurnCoordinator`; a discard of held text by any component other than `TurnCoordinator` acting on a policy.
**Gate.** S — a single emitter (type-level: only `TurnCoordinator` can construct the commit event); D — KERNEL-01 trace shows one commit per turn with its evidence list.

### VOICE-10 — Output is explicitly cancellable — **RULED (founder F3, 2026-09-11)**
**Statement.** *Every emitted audio stream must have an identity and a cancellable lifetime owned by the voice runtime.* `play()` without a durable stop handle is architecturally impossible. Output is not "TTS"; it is `TTS synthesis → output stream identity → runtime-controlled renderer → cancel / fade / complete / fail`. Barge-in, stop, leave, route failure, emergency teardown and recovery stop or fade output deterministically through that identity.
**Evidence.** The live `BufferSource` lives in local variables; no interrupt path stops it (P3 §5; census F5).
**Falsifier.** A playback request without a handle; or a cancel on a valid handle after which frames continue to render beyond the predeclared cancel latency.
**Gate.** D — KERNEL-00 K00-05.

### VOICE-11 — Provider/model interchangeability
**Statement.** No STT/TTS/turn model can become architectural authority. Every model is replaceable behind a protocol.
**Evidence.** The community plugin owns session, engine and task at once (P1 §2.5); the OpenAI route is the only reachable synthesizer (P3 §3).
**Falsifier.** A candidate in BENCH-01 that requires a change to kernel authority to function (research §15: "architecturally expensive… penalized even if its benchmark score is good").
**Gate.** S — adapters implement only `SpeechRecognizer` / `TurnInference` / `SpeechSynthesizer` / `RealtimeTransport`; no adapter imports `AudioSessionAuthority`.

### VOICE-12 — Transport cannot own hardware
**Statement.** WebRTC/WebSocket reconnects may restore a stream; they may not reconfigure the local audio session independently.
**Evidence.** Latent today (no live transport); named now so the sovereign-server profile cannot re-import the defect.
**Falsifier.** A transport reconnect followed by a session mutation not stamped as a kernel decision.
**Gate.** D — fault injection "stall the transport" (BENCH-01 sovereign-server profile) shows `audioSession` unchanged.

### VOICE-13 — Interruption is distinct from speech activity
**Statement.** Incoming speech during MAIA output becomes an interruption only after interruption policy says it is. Backchannels and incidental speech are separate states.
**Evidence.** Today barge-in is a raw level threshold that flips flags while audio continues (P3 #18; P2 #12).
**Falsifier.** Output cancelled on a VAD start with no `InterruptionController` decision in the trace; or a backchannel classified as a floor claim in the KERNEL-01 corpus beyond the predeclared rate.
**Gate.** D — TURN-02 corpus B (research §14.1); until then, half-duplex policy v0 makes `overlapCandidate` advisory only (state model §4).

### VOICE-14 — Silence is evidence, never a verdict by itself
**Statement.** A fixed silence threshold may contribute to a turn decision but cannot be the sole definition of human completion.
**Evidence.** 2500 / 1500 / 3500 / 10000 ms literals as sole closers (P4 §3); the research's human-timing evidence (§11).
**Falsifier.** A `turnCommitted` whose evidence list contains only an elapsed-silence item.
**Gate — AMENDED by the founder act (2026-09-11).** *A turn may not be committed solely because a silence duration elapsed. A non-silence completion signal or explicit member gesture must participate in the causal basis for commitment.* S — the commit event's typed evidence list is rejected if its only item is an elapsed-silence record. The earlier "≥ 2 evidence kinds" wording is withdrawn: it could reject a very good acoustic/semantic turn model merely for being one highly informative source, legislating today's model architecture into tomorrow's.

```text
silence alone                          → NEVER sufficient
silence + semantic completion          → potentially sufficient
silence + acoustic completion          → potentially sufficient
semantic/acoustic turn model alone     → potentially sufficient, if its declared policy allows it
explicit "send / done / stop" gesture  → sufficient
```

D — the reflective-pause falsifier (research §14.3): *a person pauses for several seconds, continues the same thought, and MAIA does not seize the floor.*

### VOICE-15 — No unbounded retries
**Statement.** Every recovery attempt carries a generation ID, retry budget, backoff, and terminal degraded state visible to the member.
**Evidence.** D1's ceilings reset by the loop; `isConversationAlive` self-refreshing (P2 D1, F8).
**Falsifier.** A recovery generation without a budget; a budget exceeded without a member-visible `degraded` state; a retry whose delay is not from the declared schedule.
**Gate.** D — KERNEL-00 K00-10.

### VOICE-16 — Causal observability is built in
**Statement.** Every event is stamped with session, turn, output/request, model, and recovery-generation identity where applicable.
**Evidence.** E16/E18 reconstruction required cross-reading JS logs, native logs, and inference (census §3).
**Falsifier.** An automatic state-changing event in the trace that cannot answer *what observation caused this act, and which generation/turn did it belong to* (research §19).
**Gate.** S — the event type requires the identity fields; D — a KERNEL-00 run's trace is replayable into the state machine with no orphan transitions.

### VOICE-17 — Sovereignty is executable policy — **RULED (founder F1, 2026-09-11)**
**Statement.** *Speech transport and model routing must be explicit. A local or sovereign speech failure may never silently widen into a cloud provider.* Allowed providers and transports are enforced in runtime configuration, not asserted in prose. The current `/maia` cloud-TTS default is unlawful for the future architecture; migration cannot declare completion while it stands.
**Evidence.** Census F1: `/maia` spoken output is OpenAI cloud TTS by default with no client fallback.
**Falsifier.** Any request from the voice path to a provider not in the active `VoiceProviderPolicy`; any fallback that changes provider class without a member-visible degraded state.
**Gate.** P — `05_PROVIDER_SOVEREIGNTY_POLICY.md` §4; S — no production voice module imports a prohibited provider SDK.

### VOICE-18 — Raw audio and prosody are minimised
**Statement.** Raw audio is ephemeral by default. Derived prosodic or affective features require an explicit purpose and retention policy; they must not quietly become personality/mental-state surveillance.
**Evidence.** Sovereignty Invariants and the growth-obligation check (CLAUDE.md): every capability increase owes provenance, restraint and transparency; research §11.3, §20.5.
**Falsifier.** Raw PCM persisted beyond the turn without a declared purpose; a prosodic feature stored or forwarded to cognition without an entry in the policy's retention table.
**Gate.** P — policy §5 retention table, **as amended by the founder act**: recognizer partials and segments are ephemeral; *the human turn must survive them* — the runtime keeps the minimum turn-scoped continuity state needed to preserve the complete uncommitted turn across segmentation, recognizer replacement or recovery, and persists nothing beyond the turn unless canonical memory law independently permits the committed text. S — the `CognitionBridge` payload type carries committed text and declared interaction-control features only.

### VOICE-19 — Capture custody is granted, never acquired — **RULED (founder F2, 2026-09-11)**
**Statement.** *No feature may independently acquire conversational microphone custody. Capture is granted only through the single voice authority.* A feature that needs audio (the composer, a journal, a lab) requests a bounded capture from the kernel; it never opens its own engine, recorder, or `AVAudioSession` regime.
**Evidence.** Registering the gatekeeper would open the composer-mic chain — `prepareForListening` (`.measurement`) then `capacitor-voice-recorder` (`.playAndRecord`) — with no stop of the live engine (census F3; P1 §2.4.4; P5 #2). Registration was therefore not a harmless missing-plugin fix but the enabling of a second custody actor.
**Falsifier.** Any code path on the iOS build that reaches an `AVAudioEngine`, `AVAudioRecorder`, `getUserMedia`, or a recognizer's own capture without a kernel-issued capture grant; or a journal showing capture active with no grant id.
**Gate.** S — a source gate over the iOS bundle that fails on those constructors outside `VoiceKernel`; D — every capture in a run's journal carries a grant id.

### VOICE-20 — The realtime path has no committee — **founder-authored, 2026-09-11 (JARVIS distinction)**
**Statement.** The realtime nervous system has brutally clear authority: ONE `VoiceKernel` · ONE `SessionAuthority` · ONE `TurnCoordinator` · ONE `OutputController`. No committee, no agent negotiation, no deliberative layer between the microphone and a decision. JARVIS — the collaboration and inquiry orchestration that designs, interrogates and verifies the organism — sits above this layer and never inside it.
**Evidence.** The legacy runtime is exactly a committee: eleven starters, seven stoppers, four closers, ten recoverers voting by racing (census §2). Reintroducing distributed authority through agents would recreate the defect with newer technology.
**Falsifier.** Any realtime decision (session, capture, turn commit, output cancel, recovery) whose causal record (VOICE-16) names more than one deciding component, or names an agent/orchestration service as the decider.
**Gate.** S — the kernel's decision entry points are single-owner and non-pluggable; no agent/LLM call exists on the realtime path; D — trace replay (K00-17) shows one decider per act.

---

## Articles not yet falsifiable enough to ratify

None are withheld, but two carry thresholds that are PROPOSED until the KERNEL-00 law is ratified: VOICE-08 (detection window) and VOICE-10 (cancel latency). Their falsifiers are sound; the numbers are in `06_…` §3.

## Relationship to the Sovereignty Invariants

VOICE-05, -07, -17 and -18 are the voice organism's implementation of Interface Humility, the Right to Remain Unpossessed, and Invariant 14 (cultural sovereignty — the member's language is carried as committed text, never re-authored by the sensory layer). Nothing here amends canon; canon governs.
