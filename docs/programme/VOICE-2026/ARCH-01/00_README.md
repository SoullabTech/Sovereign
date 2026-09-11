# VOICE-2026 · ARCH-01 — Architecture Ratification Package

**Act:** `ARCH-01` — *ratify architecture before source changes* (charter §5; research §21).
**Branch:** `claude/voice-2026-census-01` · **Date:** 2026-09-11
**Status:** **RATIFIED — founder act, 2026-09-11** (§2b), with three narrow amendments recorded in place (VOICE-14 causal gate · turn-continuity retention · K00-06 duplex gate + K00-11 Bluetooth wording). No production code. **KERNEL-00 is NOT open** — ratifying what shall be built is not the same act as authorizing someone to start building it.

**Inputs of record**

| Input | Where | Standing |
|---|---|---|
| Executable census | `../CENSUS-01_EXECUTABLE_VOICE_AUTHORITY_2026-09-11.md` (+ `../census/01–05`) | ASSEMBLED, read-only |
| Platform survey | `../SURVEY-01_CONTEMPORARY_VOICE_ARCHITECTURE_2026-09-11.md` | evidence, not design |
| Founder research package | `../research/MAIA_Voice_2026_Architecture_Research_v1.docx` (the document of record) and `.md` (text extraction — tables flattened, figures absent) | research synthesis; "no production-code authorization implied" |
| Founder rulings | RUNTIME-01 lane doc E21; charter §3, §9 | ruled |

**Outputs (this package)**

| # | Artifact | File | What it fixes |
|---|---|---|---|
| 1 | Voice 2026 Constitution | `01_VOICE_2026_CONSTITUTION.md` | VOICE-01…18, each with evidence, falsifier and gate |
| 2 | Target authority graph | `02_TARGET_AUTHORITY_GRAPH.md` | who may change physical state, terminate work, commit a turn, declare recovery — exactly one answer each |
| 3 | Orthogonal state model | `03_STATE_MODEL.md` | floor state machine · physical health dimensions · recovery generations · projection rules |
| 4 | Migration boundary | `04_MIGRATION_BOUNDARY.md` | KEEP / ADAPT / REPLACE / REMOVE, reconciled with census §4; no dual hardware |
| 5 | Provider & sovereignty policy | `05_PROVIDER_SOVEREIGNTY_POLICY.md` | `VoiceProviderPolicy` as executable routing law; fail-closed |
| 6 | KERNEL-00 acceptance law | `06_KERNEL-00_ACCEPTANCE_LAW.md` | predeclared obligations, fault matrix, pass rule for the first code |

---

## 1. What ratification means here

The research (§22) names ten decisions "mature enough to ratify now if desired". This package writes them down in the form a founder act can ratify or refuse, one by one. Until that act is recorded in §2 below, every artifact is a **candidate**. Recording the act is a founder edit to this file, not an inference from silence or from gates.

Ratification is also **falsification-first** (founder, 2026-09-11: *"only when those survive falsification should anyone begin the new kernel"*). Every constitutional article therefore carries a falsifier — the observable event that would prove it violated — and a gate that would catch it. An article without a workable falsifier is not ready to ratify and is marked so.

## 2. Founder decisions — status ledger

Recommended by the research §22 and by the founder's 2026-09-11 message. Column three is edited only by a founder act.

> **D1–D10 RATIFIED, founder, 2026-09-11.** Together they define the architectural standing of Voice 2026. They are not independent suggestions to be selectively weakened during implementation.

| ID | Decision | Status |
|---|---|---|
| D1 | Native `VoiceKernel` is the sole iOS conversational audio authority. | **RATIFIED** (2026-09-11) |
| D2 | The WebView does not own iOS conversational capture or playback. | **RATIFIED** (2026-09-11) |
| D3 | Canonical MAIA cognition remains separate from voice infrastructure. | **RATIFIED** (2026-09-11) |
| D4 | Exactly one `TurnCoordinator` commits human turns. | **RATIFIED** (2026-09-11) |
| D5 | Speech providers/models are adapters governed by executable sovereignty policy. | **RATIFIED** (2026-09-11) |
| D6 | The runtime supports local and sovereign-server deployment profiles from one architecture. | **RATIFIED** (2026-09-11) |
| D7 | Full-duplex speech models are a planned experimental backend, not the production constitution. | **RATIFIED** (2026-09-11) |
| D8 | The legacy runtime is frozen after bounded witness work (E19/E20) and is not incrementally transformed into `VoiceKernel`. | **RATIFIED** (2026-09-11) |
| D9 | `KERNEL-00` precedes model selection (`BENCH-01`) and MAIA reconnection (`BRIDGE-01`). | **RATIFIED** (2026-09-11) |
| D10 | Runtime health is physical/observable, not inferred from component booleans. | **RATIFIED** (2026-09-11) |

## 2a. Founder acts recorded 2026-09-11 (after CENSUS-01 assembly) — RULED

Verbatim substance; these are law for the future architecture from this date. They do not patch the frozen legacy runtime.

| Act | Ruling | Consequence in this package |
|---|---|---|
| **F1 — cloud TTS default** | *The default is unlawful for the future architecture.* Not because OpenAI TTS is intrinsically unusable, but because a sovereign system cannot silently select an external speech provider as its default sensory/motor path. **Ratified law: "Speech transport and model routing must be explicit. A local or sovereign speech failure may never silently widen into a cloud provider."** Migration cannot declare completion while `/maia` silently defaults to cloud TTS. | VOICE-17 carries the ratified sentence; policy §4 and §7 bind `MIGRATE-01` |
| **F2 — gatekeeper registration exposes the composer microphone** | *Do not register it as an isolated repair.* Registration is not merely "make `AudioSessionManager` available"; it is effectively "enable another actor capable of taking microphone/session custody". The registration branch cannot be treated as a harmless missing-plugin fix. **Rule: "No feature may independently acquire conversational microphone custody. Capture is granted only through the single voice authority."** The composer may record later — by requesting capture from the kernel, never by owning another `AVAudioSession` regime. | New article VOICE-19; migration boundary §3 (composer mic); RUNTIME-01 lane record E22 (registration branch standing) |
| **F3 — MAIA's output cannot be stopped** | *Output cancellation is constitutional, not optional UX.* **"Every emitted audio stream must have an identity and a cancellable lifetime owned by the voice runtime."** `play()` without a durable stop handle becomes architecturally impossible. Output is not "TTS"; it is `TTS synthesis → output stream identity → runtime-controlled renderer → cancel / fade / complete / fail`. | VOICE-10 statement replaced by the ruling; state model gains an **output** dimension; `OutputController` named in the authority graph |
| **F4 — `MAIABridgeViewController` history** | *Evidence, not constraint.* The March revert failed on project integration (the pbxproj omission), not on the architectural idea. **"The historical revert supplies no negative evidence against a native VoiceKernel or bridge controller."** Keep it in provenance; do not carry it as technical debt. | census F2 stands as provenance only |
| **Dispositions** | **RATIFIED** with one refinement: recognizers, TTS engines, VAD, semantic/acoustic turn models, diagnostics and transport are **ADAPT** — *instruments feeding the runtime, not authorities governing it* — so the present architecture is not recreated with newer technology. KEEP adds *accumulated transcript / turn continuity as a concept* and *the observational record and witness methodology*; REMOVE adds *optimistic booleans pretending to describe physical microphone state*. | `04_MIGRATION_BOUNDARY.md` §1–4 marked RATIFIED and reconciled |
| **Synthesis question (charter §9), rephrased** | *What is the smallest sovereign conversational runtime that can own one continuous human–MAIA encounter while allowing hearing, turn understanding, cognition and speaking technologies to change independently?* Answer: the kernel of `02_…` §0. **Principle: "The kernel owns the encounter. Models interpret it."** | authority graph §0 |
| **E19 / E20** | Still run; they belong to the evidentiary record and sharpen census §3.4. They are **overlay evidence, not a gate** on whether Voice 2026 needs a new substrate: even perfect results cannot change four session writers, eleven start authorities, competing turn closure, uncancellable output, nonexistent native interruption handling, split WebKit/native custody, or the absence of one authoritative state. They reopen the conclusion only if they falsify one of its premises. | census §3.4; charter §5 |
| **The three ARCH-01 artifacts, fixed** | (1) authority graph — one named owner per physical/conversational power, with the explicit rule that *adapters possess evidence but not authority*; (2) conversation state machine — orthogonal physical, conversational, turn and output state; no giant `isListening` boolean; no model event allowed to masquerade as system state; (3) migration boundary — precisely what crosses intact from legacy MAIA and what dies with the legacy voice runtime. **Then falsify ARCH-01 before writing `VoiceKernel.swift`.** | `02_…`, `03_…`, `04_…`; falsification act = the review in §5 |
| **JARVIS layer** | Designing MAIA's auditory and vocal nervous system is a JARVIS flow; the resulting `VoiceKernel` is not JARVIS. **JARVIS stays out of the realtime audio path**: ONE VoiceKernel · ONE SessionAuthority · ONE TurnCoordinator · ONE OutputController — no committee, no agent negotiation. VOICE-2026 is named a canonical JARVIS collaboration exemplar. | New article VOICE-20; `../JARVIS_EXEMPLAR_NOTE_2026-09-11.md` |

**D1–D10 status after these acts:** substantively covered (D1/D2 by F2 and VOICE-19/20; D4 by the ratified REPLACE of turn commitment; D5 by F1; D8 by E21 + the ratified boundary; D10 by F3/VOICE-08), but **not yet ratified as a set by number**. The ledger in §2 stays PROPOSED until a founder act names them.

## 2b. Founder Act — ARCH-01 (2026-09-11, on the package at `e3190db16`)

Recorded verbatim in substance. Three narrow amendments; no design cycle reopened.

1. **D1–D10 — RATIFIED AS A SET** (§2). D8 closes the temptation to "evolve" the legacy implementation into the new one; D9 preserves the order — prove the physical organism before choosing models or reconnecting MAIA; D10 establishes physical observation, not `isListening`-style belief, as runtime truth.
2. **Constitution — RATIFIED WITH TWO AMENDMENTS.** *VOICE-01 through VOICE-20 are RATIFIED as the Voice 2026 Constitution.* (a) **VOICE-14**: the law stands (*silence is evidence, never a verdict by itself*); the source gate "≥ 2 evidence kinds, or an explicit member gesture" is replaced — *a turn may not be committed solely because a silence duration elapsed; a non-silence completion signal or explicit member gesture must participate in the causal basis for commitment* — so a single highly informative acoustic/semantic turn model is not rejected by fiat and today's model architecture is not legislated into tomorrow's. (b) **VOICE-18 / provider retention**: the phrase "ephemeral; last partial only for continuity" does not survive — it is perilously close to the conceptual mistake that produced E16.1. Replaced by: *transcript hypotheses and recognizer segments are ephemeral; the runtime may retain the minimum turn-scoped continuity state required to preserve the complete uncommitted human turn across segmentation, recognizer replacement, or recovery; it is never persisted beyond the turn unless existing member-authorized canonical memory law independently permits the resulting committed text.* Recognizer partials and segments are ephemeral; **the human turn must survive them.**
3. **Provider §7 — RATIFIED: degraded voice + text continuity.** *Until an allowed voice adapter qualifies through BENCH-01, degraded voice with intact text continuity is the lawful production posture. Availability does not outrank sovereignty. A speech failure may reduce modality; it may not silently change custody.* Legacy boundary: this does not turn ARCH-01 into a repair of the frozen runtime; E19/E20 may still exercise the old system as evidence; but once Voice 2026 provider policy governs a production path, **that path may not continue using OpenAI TTS merely because BENCH-01 has not finished** — that is what fail-closed means.
4. **KERNEL-00 thresholds — six of seven RATIFIED exactly as written** (entry ≤ 1 500 ms · digital-zero detection ≤ 2 000 ms · output-stall detection ≤ 1 000 ms · cancel ≤ 100 ms · recovery 3/fault/60 s at 500/1 000/2 000 ms · 60 min / ≥ 50 cycles / routes / interruptions / reset). They are first constitutional ceilings and **may not later be loosened because an implementation misses them.** **Duplex residual — AMENDED**: the harness-declared tolerance was circular; K00-06 now proves *duplex physiology* (input callbacks continue, input does not collapse to digital zero, input/output health independently observable; echo coupling measured and recorded per route), and quantitative echo-suppression qualification moves to KERNEL-01/BENCH-01. **K00-11 Bluetooth — clarified**: exercise speaker ↔ receiver and every Bluetooth topology the OS admits on the witness device; at least one Bluetooth transition when compatible hardware is available; unsupported combinations are platform capability, not recovery failures — but once a route is admitted, *manual mic tap needed after route change = FAIL*, no softness.
5. **Standing after these acts:**

```text
CENSUS-01       CLOSED / ASSEMBLED
F1–F4           RULED
D1–D10          RATIFIED
VOICE-01…20     RATIFIED · with VOICE-14 causal-gate amendment
MIGRATION       RATIFIED dispositions
PROVIDER LAW    RATIFIED · fail closed → degraded voice + text continuity
K00 THRESHOLDS  RATIFIED · except duplex acoustic-quality gate moved downstream
ARCH-01         RATIFIED · these exact amendments recorded (this commit)
KERNEL-00       NOT YET OPEN
```

6. **KERNEL-00 is not opened by this act.** Not because more research is required — it is not — but because *ratifying what shall be built is not the same act as authorizing someone to start building it.* The next founder act can be exactly: **"ARCH-01 stands ratified. Open KERNEL-00 under the ratified acceptance law. No STT, no TTS, no Web audio, no MAIA, no legacy voice components. Prove the physical organism first."** At that point the research/design phase is finished, and the JARVIS boundary is clean: inquiry → assembly → differentiation → synthesis → ratification are complete; the next phase is bounded execution against predeclared law, not more ideation.

## 2c. Founder Act — Open KERNEL-00 (2026-09-11)

> **KERNEL-00 is OPEN under the ratified Voice 2026 acceptance law.** Build only the physical conversational audio organism: `VoiceKernel`, `AudioSessionAuthority`, duplex native audio graph, `HealthSupervisor`, `StateProjection`, flight recorder, and the bounded native test harness. No STT, no TTS, no Web audio, no canonical MAIA, no legacy voice components, and no network egress. Nothing beyond the ratified K00 obligations is authorized.

Explicit boundaries (founder): no model selection — BENCH-01 closed · no `/maia` integration — BRIDGE-01 closed · no legacy cleanup or migration — MIGRATE-01 closed · no "helpful" additions (VAD, turn detection, transcription, synthetic speech, semantic state, JARVIS logic) · no threshold tuning to obtain green; the ratified ceilings stand · a failure is evidence — if `AVAudioEngine` voice processing cannot satisfy K00-06/K00-11, record the failure before considering the separately witnessed lower Voice-I/O path · E19/E20 remain overlay evidence and do not block KERNEL-00.

The question: *can one native authority keep MAIA's physical auditory/vocal apparatus alive, observable, cancellable, and recoverable for an entire conversation?* Nothing about intelligence yet. First prove that the body can hear and speak without fighting itself.

**Execution record:** source written 2026-09-11 in `ios/VoiceKernel/` (package) and `ios/VoiceKernelHarness/` (separate app target, bundle `life.soullab.voicekernel.k00`) at **`eef487422`**; runbook `../KERNEL-00_RUNBOOK_2026-09-11.md`; source gate `__tests__/voice-kernel-00-source-gates.test.ts`. **Not compiled** · **not witnessed**.

**Founder ruling on `eef487422` (2026-09-11):** *architecturally on target; do not run the device witness yet.* **RUN** `MAC-COMPILE-01` against exactly `eef487422`, preserving the unmodified first-compile evidence. **HOLD** the device witness. Eight bounded pre-witness defects found — none requiring architectural redesign: stale acceptance-law header · K00-02 latent contradiction (entry/exit vs OS-forced recovery reactivations) · session mutations not individually witnessed · physical-health evidence not longitudinal in the journal · K00-05's `cancelLatencyMs` measures a function call, not cancel → last rendered frame · K00-08's stall fault leaves the stream counter advancing · K00-11/13/14 not fully exercisable by the harness (no route override, no lifecycle observation, reset wrongly "NOT EXERCISABLE" — Apple: Settings → Developer → Reset Media Services) · K00-17 replay accepts any cause string rather than a causal parent. Dispositions and sequence: `../PRE-WITNESS-01_PLAN_2026-09-11.md`. PRE-WITNESS-01 = record coherence · witnessability · physiological instrumentation · causal instrumentation · lawful harness controls; no architecture, no STT/TTS/MAIA, no threshold changes; compiled again as a new SHA before the witness.

## 3. Supersessions this package introduces (for the record)

| Earlier text | Superseded by | Note |
|---|---|---|
| Charter §4 draft invariants VOICE-01…08 | Constitution VOICE-01…20 | 01–08 keep their numbers and meaning; 09–18 from the research; 19–20 from founder rulings F2 and the JARVIS distinction |
| Charter §3 / E21 WebView command set `startConversation · stopConversation · mute · interrupt` | Authority graph §5: `enterConversation · leaveConversation · setMicEnabled · interruptMAIA · setOutputEnabled · requestDiagnosticsSnapshot` | research §17; the event set likewise widened |
| Charter §5 sequence (`KERNEL-01` as first code) | `KERNEL-00` inserted before `KERNEL-01`; `BENCH-01 · BRIDGE-01 · MIGRATE-01 · TURN-02 · DUPLEX-R&D` appended | research §21; charter §5 updated in the same commit |
| Census §4 dispositions (proposal) | Migration boundary (candidate law) | reconciled item by item in `04_…`; where the research and the census differ, `04_…` says which and why |

## 4. What this package does not do

- It does not select a recognizer, a synthesizer, a VAD, a turn model, or a transport. `BENCH-01` does, on MAIA hardware.
- It does not decide between `AVAudioEngine` voice processing and lower-level Voice I/O (research §20.1). `KERNEL-00` measures; the law only requires the measurement.
- It does not authorize `KERNEL-00`. That is a separate founder act on `06_…` after ratification.
- It does not touch the legacy runtime, E19, or E20.

## 5. Ratification review questions (for the founder act)

1. Does each article's falsifier describe something that could actually be observed on a device or caught by a source gate? If not, the article is not ready.
2. Is any REMOVE in `04_…` removing a *responsibility* that the member relies on and that no REPLACE picks up?
3. Does `05_…` name the prohibited provider classes precisely enough that the census F1 condition (OpenAI TTS default) would fail the gate today?
4. Are the `KERNEL-00` thresholds in `06_…` the ones you want to be held to? They are marked PROPOSED and become law with the act.
5. Which of D1–D10 are ratified, refused, or amended — recorded in §2.
