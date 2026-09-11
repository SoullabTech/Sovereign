# VOICE-2026 · ARCH-01 — Architecture Ratification Package

**Act:** `ARCH-01` — *ratify architecture before source changes* (charter §5; research §21).
**Branch:** `claude/voice-2026-census-01` · **Date:** 2026-09-11
**Status:** DRAFTED FOR RATIFICATION · no production code · nothing here is law until a founder act says so.

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

| ID | Decision | Status |
|---|---|---|
| D1 | Native `VoiceKernel` is the sole iOS conversational audio authority. | PROPOSED |
| D2 | The WebView does not own iOS conversational capture or playback. | PROPOSED |
| D3 | Canonical MAIA cognition remains separate from voice infrastructure. | PROPOSED |
| D4 | Exactly one `TurnCoordinator` commits human turns. | PROPOSED |
| D5 | Speech providers/models are adapters governed by executable sovereignty policy. | PROPOSED |
| D6 | The runtime supports local and sovereign-server deployment profiles from one architecture. | PROPOSED |
| D7 | Full-duplex speech models are a planned experimental backend, not the production constitution. | PROPOSED |
| D8 | The legacy runtime is frozen after bounded witness work (E19/E20) and is not incrementally transformed into `VoiceKernel`. | PROPOSED (E21 already rules the freeze; D8 adds "not transformed into") |
| D9 | `KERNEL-00` precedes model selection (`BENCH-01`) and MAIA reconnection (`BRIDGE-01`). | PROPOSED |
| D10 | Runtime health is physical/observable, not inferred from component booleans. | PROPOSED |

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
