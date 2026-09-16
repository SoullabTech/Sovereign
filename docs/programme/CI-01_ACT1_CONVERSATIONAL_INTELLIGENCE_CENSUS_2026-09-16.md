# CI-01 — Act 1 Conversational Intelligence Census

**Date:** 2026-09-16

**Act:** A1 — recovery and capability census

**State:** BASELINE COMPLETE · READ-ONLY FINDING

**Founding branch cut:** `f5c02193c5ebee4f51b6c4b769ad6a8166b2a80f`

**Inherited source head after rebase:** `7ac17a0abf50f3382c9c2c84c9b5ed93630779e3`

**Authority:** None. This record changes no runtime, prompt, model, schema, memory, or member-facing
behavior.

## 1. Question and method

This census asks:

> What conversational intelligence does MAIA already possess, where does it actually run, what
> remains shadow or research, and which seams are missing between the parts?

The census is bounded to:

1. the effect-bearing canonical MAIA conversation path and its direct inputs;
2. TURN-01 / TURN-02 / TURN-03;
3. the canonical-turn / MIPA boundary;
4. directly relevant Care, continuity, relationship, field, expression, and learning loci;
5. named recent R&D records for prompt cognition, free synthesis, relational Gestalt standing,
   relational geometry, full-duplex voice, and acoustic turn projection.

It does not treat every historical prototype in the repository as current MAIA. A file existing is
not evidence that the canonical path calls it.

### Status vocabulary

| Status | Meaning in this census |
|---|---|
| **LIVE PATH** | Effect-bearing on the current branch. This is not a deployment claim. |
| **PARTIAL** | Some effect-bearing pieces exist, but the named faculty is incomplete or tier/path dependent. |
| **SHADOW** | Executes or records evidence but is prohibited from changing the member-facing turn. |
| **DISCONNECTED** | Code exists but has no reachable effect from the canonical general-MAIA path. |
| **RESEARCH** | Document, benchmark, prototype, lab adapter, or unmerged branch; no current authority. |
| **MISSING** | No admitted implementation locus was found for the named faculty. |

`GOVERNING` is used only for ratified constraints, not as a claim that behavior implements them.

## 2. Evidence cut

### Current-tree governing and implementation records

- `docs/programs/MAIA_CONVERSATIONAL_INTELLIGENCE_EVOLUTION.md`
- `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`
- `docs/programme/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md`
- `docs/programme/CMT-01_PARTICIPATION_DISPOSITION_CONTRACT.md`
- `docs/architecture/MAIA_TEMPORAL_RELATIONAL_MEMORY_GESTALT_LAW_2026-09-16.md`
- `docs/research/relational-geometry/RELATIONAL_GEOMETRY_PRELIMINARY_NOTE_2026-09-15.md`
- `docs/programme/VOICE-2026/TURN-01_CONVERSATIONAL_SOVEREIGNTY_IMPLEMENTATION_2026-09-16.md`
- `docs/programme/VOICE-2026/TURN-02_PREDICTIVE_SHADOW_2026-09-16.md`
- `docs/programme/VOICE-2026/TURN-02_CLOSURE_2026-09-16.md`
- `docs/programme/VOICE-2026/TURN-03_ACOUSTIC_TURN_PROJECTION_CHARTER_2026-09-16.md`
- `docs/programme/VOICE-2026/TURN-03_A1_MODEL_CENSUS_2026-09-16.md`
- `docs/programme/VOICE-2026/TURN-03_A1_MODEL_CENSUS_2026-09-16.json`
- `docs/architecture/MAIA_VOICE_ECOLOGY_ROADMAP.md`

### Recovered research refs not promoted into this tree

These refs were read as research evidence. Their absence from the inherited branch is itself part
of their status.

| Research line | Immutable ref | Disposition here |
|---|---:|---|
| JARVIS MAIA Free Synthesis A1–A7 | `bc4da828` | RESEARCH; prompt reduction alone insufficient, Gestalt gains provisional, inference leakage unresolved |
| Prompt Cognition Census | `b12fa3ce` | RESEARCH; FAST / CORE / DEEP are materially different cognitive environments |
| Relational Gestalt Standing Acts 2–7 | `33eb5ee8` | RESEARCH; standing resolver and inference-admission boundary are candidate architecture only |

No result from these refs is described below as live or ratified merely because it was useful.

## 3. Current turn-composition map

The current general conversation flow is not empty. It already resembles an organism, but most
coordination occurs through prompt composition, route state, and post-hoc telemetry rather than a
shared provenance-aware conversational state.

```text
member text or transcribed speech
    ↓
OracleConversation.handleTextMessage(...)
    ↓
main MAIA surfaces → /api/sovereign/app/maia/list
other admitted ingress → /api/between/chat → generateMaiaTurn(...)
    ↓
memory / relationship / elemental / mode / knowledge inputs
    ↓
getMaiaResponse(...) — shared cognition service
    ↓
FAST / CORE / DEEP prompt assembly
    ↓
canonical MAIA response
    ↓
voice rendering / playback when requested
    ↓
memory, anamnesis, quality, and continuity observations
```

Typed and spoken turns converge into `handleTextMessage(...)` and canonical cognition. The old
`/api/voice/stream-conversation` full-duplex exit remains in the repository but was structurally
removed from ordinary voice reachability because it contained its own cognition, memory, prompt,
and response decisions.

`CanonicalTurn` is a second, orthogonal architecture: it governs evidence custody and admission.
It is live for the Writer's Studio room, shadow-constructed on `/list`, and is not yet the general
MAIA cognition boundary. CI-01 must respect that trajectory rather than create another open
context channel beside it.

## 4. Domain census

### 4.1 HEARING

| Capability | Status | Current locus | Present authority / finding |
|---|---|---|---|
| Speech capture and transcript production | **LIVE PATH** | `components/voice/ContinuousConversation.tsx`; native / Web Speech / local Whisper paths | Produces member text and capture state. It does not understand relational meaning. |
| Spoken-to-typed cognition convergence | **LIVE PATH** | `components/OracleConversation.tsx::handleVoiceTranscript → handleTextMessage` | Protects one MAIA mind; ordinary voice cannot reach the divergent streaming cognition exit. |
| High-precision semantic continuation cues | **SHADOW** | `lib/voice/semanticTurnSignals.ts` | Observable wording only; feeds TURN-02 recommendation telemetry and has no send authority. |
| Acoustic continuation / yield projection | **RESEARCH** | TURN-03 charter and A1 census; TURN-02 predictor ports and adapters | TURN-03 A1 selected DualTurn `c3860ed` as the A2 baseline experiment candidate only. A1 performed no download or product integration and granted no live authority; A2 has not freshly proved the runtime. |
| Full-duplex acoustic / prosodic sensing | **DISCONNECTED / RESEARCH** | `app/api/voice/stream-conversation/route.ts`; `lib/voice/moshi/`; PersonaPlex provider and lab | Useful prior art for overlap, interruption, cadence, and presence. Not canonical cognition and not reactivated by this census. |
| Unified multimodal hearing state | **MISSING** | — | No admitted object combines text, acoustic, silence, breath, overlap, and expiry while preserving provenance. |

**Finding H1:** TURN-03 belongs here as one future witness. It should remain ignorant of memory,
relationship, and MAIA's intended response.

### 4.2 FLOOR

| Capability | Status | Current locus | Present authority / finding |
|---|---|---|---|
| Member-selected conversational space | **LIVE PATH** | `lib/voice/turnTaking.ts`; `components/OracleConversation.tsx`; `/api/settings/voice` | Member chooses baseline patience. Learned timing cannot shorten that baseline. |
| Explicit floor control | **LIVE PATH** | TURN-01 logic in `turnTaking.ts` and `ContinuousConversation.tsx` | Explicit hold prevents automatic transcript commit; explicit member action owns release. |
| Session pause-continuation adaptation | **LIVE PATH / PARTIAL** | `observeContinuedPause` and `resolveTurnSilenceMs` | Session evidence can make MAIA more patient within a bounded ceiling; it is not durable member profiling. |
| Predictive floor recommendation | **SHADOW** | `lib/voice/turnArbiter.ts`; `ContinuousConversation.emitTurnShadowDecision` | Emits `wait`, `backchannel_candidate`, `yield_candidate`, or `insufficient_evidence`; no caller branches on it. |
| Turn benchmark | **RESEARCH INSTRUMENT** | `lib/voice/turnBench.ts`; `turnBenchCorpus.ts`; `MAIA-TURN-BENCH-01` | Measures false floor seizure, yield recall, and latency. It does not authorize behavior. |
| Backchannel production | **MISSING** | TURN-02 has only a candidate recommendation; TURN-05 unopened | Detecting a possible backchannel and emitting one are different powers. |
| Floor availability → response decision seam | **MISSING** | — | Current endpointing commits a transcript into cognition; no governed faculty separately decides whether available floor should become silence, acknowledgment, or full response. |

**Finding F1:** The repository already proves the architectural distinction between floor evidence
and send authority. CI-01 must preserve it beyond voice.

### 4.3 GESTALT

| Capability | Status | Current locus | Present authority / finding |
|---|---|---|---|
| Recent in-session continuity | **LIVE PATH / PARTIAL** | session continuity in `lib/sovereign/maiaService.ts`; bounded prompt apertures in `maiaVoice.ts` | Preserves recent exchanges, but the whole is reconstructed differently by tier and prompt window. |
| Cross-session memory orientation | **LIVE PATH / PARTIAL** | `lib/memory/MemoryBundle.ts`; memory orchestrator / recall addenda | Retrieves ranked continuity and provenance traces, but does not constitute a dynamic whole of the encounter. |
| Active-thread and correction observations | **SHADOW / PARTIAL** | `deriveActiveThread` and `detectCorrectionSignal` telemetry in `maiaService.ts` | Post-hoc observation; not a first-class, corrected Gestalt state. |
| Dynamic Gestalt law | **GOVERNING** | `MAIA_TEMPORAL_RELATIONAL_MEMORY_GESTALT_LAW_2026-09-16.md` | Requires present reorganization, counterevidence, surprise, and observer non-authority. No runtime claim follows from the law alone. |
| Legacy `GestaltEngine` | **DISCONNECTED** | `lib/intelligence/GestaltEngine.ts` | No canonical general-MAIA caller found. Existence is not activation. |
| Free-synthesis relational Gestalt projection | **RESEARCH** | ref `bc4da828` | Improved some continuity judgments, but adjudication found inference leakage and no sufficient structural standing. |
| Deterministic relational standing + inference boundary | **RESEARCH** | ref `33eb5ee8` | Candidate sequence: evidence → relations → standing → projection → synthesis → inference admission. Not implemented here. |
| First-class conversational Gestalt | **MISSING** | — | No current state preserves active movements, unresolved threads, returns, novelty, counterevidence, and claim standing across the encounter. |

**Finding G1:** Recent history is not Gestalt. A topic summary is not Gestalt. Gestalt must remain a
disposable projection over admissible evidence, with the present able to overturn it.

### 4.4 RELATIONSHIP

| Capability | Status | Current locus | Present authority / finding |
|---|---|---|---|
| Member-selected Talk / Care / Scribe stance | **LIVE PATH** | `components/OracleConversation.tsx`; mode handling in `maiaService.ts` / `maiaVoice.ts` | Member selection shapes prompt stance. It does not yet select a typed conversational act per turn. |
| Mirror → Bridge / Illuminate → Permission → one move | **LIVE PATH / PARTIAL** | FAST Care block in `lib/sovereign/maiaService.ts`; CORE Care block in `maiaVoice.ts` | The grammar is valuable but tier-divergent: FAST carries explicit pressure reduction; CORE has a different, more directive block. |
| Comprehensive Care voice module | **DISCONNECTED** | `lib/maia/careModeVoice.ts` | Defines Attune / Illuminate / Permission / Invite / Hold, but no source import or call was found outside historical documentation. |
| AIN response-shape witness | **SHADOW / PARTIAL** | `lib/ai/quality/ainResponseShape.ts`; conditional telemetry in routes | Detects mirror, bridge, permission, next step, and menu mode after generation. Optional rewrite targets menu shape, not relational-act selection. |
| Explicit relational-context handoff | **LIVE PATH** | `formatRelationalContextForPrompt`; sovereign route handoff reader | Member action carries a relationship into conversation; system themes are explicitly marked as inference and subordinate to current speech. |
| Relationship Anamnesis | **LIVE PATH / PARTIAL** | `RelationshipAnamnesisPostgres`; post-turn capture in sovereign route; relationship memory inputs | Durable relational continuity exists, but derived essence and current member evidence are not synthesized through one per-turn standing resolver. |
| Talk-mode field intelligence / wisdom move | **LIVE PATH / PARTIAL** | FAST dialogue reference in `maiaService.ts`; `talkModeFieldIntelligence.ts`; `wisdomFieldMoves.ts` | Keyword-derived element, phase, state, scale, and move can enter FAST prompt context. Its telemetry-only copy on the old stream route is disconnected from canonical voice. |
| Relational geometry | **RESEARCH** | `RELATIONAL_GEOMETRY_PRELIMINARY_NOTE_2026-09-15.md` | Typed relations may be more faithful than scalar similarity; decodability and analogy do not confer live use or authority. |
| Turn-specific relational-act selector | **MISSING** | — | No governed pre-content selection among silence, acknowledgment, mirror, inquiry, permission, invitation, return, challenge, or clarification. |
| Inference admission boundary | **MISSING IN RUNTIME** | candidate design at ref `33eb5ee8` | Structured distinction among grounded claim, candidate, and question has not entered canonical conversation. |

**Finding R1:** Care grammar is currently mostly prompt constitution and post-hoc observation. The
missing faculty is not more caring language; it is a governed judgment about which relational act
is warranted before wording is generated.

### 4.5 COGNITION

| Capability | Status | Current locus | Present authority / finding |
|---|---|---|---|
| Canonical MAIA response service | **LIVE PATH** | primary `/list → getMaiaResponse`; `/between → generateMaiaTurn → getMaiaResponse`; `maiaService.ts` | One response-producing cognition service for ordinary typed and spoken conversation. |
| Canonical evidence-admission object | **PARTIAL / SHADOW FOR GENERAL MAIA** | `lib/maia/canonical-turn/`; MIPA; `CanonicalTurn`; manifest | Strong closed-object constitution exists. Live in Writer's Studio, shadow on `/list`; general MAIA still accepts a large open `meta` channel. |
| FAST / CORE / DEEP cognition | **LIVE PATH / PARTIAL** | `maiaService.ts`; `maiaVoice.ts` | Tiers share MAIA identity but receive materially different prompt composition and history apertures. Strategy and field membership are not yet fully separated. |
| Memory and continuity inputs | **LIVE PATH / PARTIAL** | MemoryBundle, memory orchestrator, conversational recall, episodic / atom / relationship addenda | Multiple governed inputs exist, but prompt assembly remains the principal integration mechanism. |
| Spiralogic / elemental / Wu Xing / developmental orientation | **LIVE PATH / PARTIAL** | facet decision, spiral and Wu Xing snapshots, field intelligence, prompt addenda | Several signals affect prompts, frequently through scalars or summaries. They do not yet participate as differentiated simultaneous ways of knowing in a shared field. |
| Legacy `UnifiedIntelligenceEngine` | **DISCONNECTED** | `lib/intelligence/UnifiedIntelligenceEngine.ts` | No canonical conversation caller found; monitoring and field prototypes do not establish response authority. |
| Prompt cognition census / free synthesis | **RESEARCH** | refs `b12fa3ce` and `bc4da828` | Established prompt burden, duplication, and tier divergence; did not authorize prompt diet or replacement architecture. |
| Closed conversational-state consumption | **MISSING** | — | Canonical cognition has no admitted, versioned conversational-state contract distinct from the open meta/addenda channel. |

**Finding C1:** “Canonical cognition” is real, but “canonical field membership for every general
MAIA turn” is not yet complete. CI-01 must build on CMT-01 rather than create a parallel context
bag.

### 4.6 EXPRESSION

| Capability | Status | Current locus | Present authority / finding |
|---|---|---|---|
| Text and voice share intended meaning | **LIVE PATH** | voice non-degradation repair; `OracleConversation` convergence; canonical response service | Voice is embodiment of canonical MAIA rather than an alternate mind. |
| Voice renderer / TTS ecology | **LIVE PATH / PARTIAL** | `renderVoice`, provider routing, local voices, UI playback | Wording and voice rendering exist, but expression is not driven by a typed relational-act contract. |
| PersonaPlex adapter | **RESEARCH / LAB ONLY** | `lib/voice/personaplex/`; TTS provider qualification | Useful for full-duplex and presence research; production qualification is explicitly refused outside the lab path. |
| Prosody hints and relational voice stack | **DISCONNECTED FROM CANONICAL VOICE** | `buildProsodyHints` and `MoshiSessionManager` are called by the old stream route | Rich prosody research exists but currently belongs to the unreachable second-mind path. |
| Backchannel and deliberate silence expression | **MISSING** | — | Candidate turn recommendations do not produce controlled non-floor-taking expression. |
| Relational act → expression contract | **MISSING** | — | No typed seam maps an admitted act to length, cadence, prosody, interruptibility, or silence while keeping content in canonical cognition. |

**Finding E1:** Full-duplex systems are most valuable here as teachers of timing, interruption,
abortability, and presence—not as replacements for MAIA's meaning-making.

### 4.7 LEARNING

| Capability | Status | Current locus | Present authority / finding |
|---|---|---|---|
| In-session pause rhythm adaptation | **LIVE PATH / PARTIAL** | TURN-01 EMA in `turnTaking.ts` | Learns only demonstrated pause-continuation and can only increase patience; bounded and corrigible through member settings. |
| Memory writeback and relationship essence | **LIVE PATH / PARTIAL** | MemoryWriteback; Relationship Anamnesis capture | Long-horizon continuity changes, but this is not an explicit conversational-policy learner. |
| Response-shape / interruption / field telemetry | **SHADOW / PARTIAL** | AIN telemetry, interruption ledger, field-monitor code | Mostly observational. Field monitor is called from the disconnected stream route, not canonical ordinary voice. |
| Voice learning service | **DISCONNECTED** | `lib/learning/voiceLearningService.ts` | Storage and analysis service exists; no current source caller was found. |
| Member-specific conversational ecology learning | **MISSING** | — | No governed mechanism learns rhythm, preferred acknowledgment, correction patterns, or act preferences with durable provenance and member-visible correction. |
| Learning promotion gate | **MISSING** | — | No cross-domain law says when repeated shadow evidence may alter policy, how it expires, or how a member can inspect / correct it. |

**Finding L1:** “Learning” currently names several unrelated processes. A future field must
distinguish session adaptation, durable memory, observational telemetry, model training data, and
policy promotion; none may inherit another's consent.

## 5. Cross-cutting capability: custody and provenance

The strongest existing integration substrate is not an intelligence model. It is CMT-01:

```text
registered producer
    ↓
authoredBy + participationClass + authority
    ↓
HELD / OFFERED / ADMITTED / EXCLUDED with closed reason
    ↓
frozen CanonicalTurn + content-free manifest
```

This already provides the constitutional answer to part of CI-01:

> Every useful witness must remain identifiable and adjudicated before cognition can read it.

What it does not yet provide is a model of conversational movement. `CanonicalTurn` answers “what
may participate in this turn?” It does not answer “what is happening in the encounter?” or “which
relational act belongs?”

The missing seam is therefore not a replacement for CMT-01. It is a typed, ephemeral,
provenance-bearing projection whose relationship to CMT-01 must be explicitly adjudicated.

## 6. What is already connected

The census does not support a story that MAIA lacks conversational intelligence entirely. The
following connections are real on the current branch:

- spoken and typed turns converge into canonical cognition;
- selected conversational space and explicit floor control constrain endpointing;
- a shadow arbiter can combine semantic and acoustic-shaped evidence without acting;
- recent and cross-session continuity can reach cognition;
- member-selected modes shape stance;
- explicit relational handoff reaches cognition with provenance caveats;
- elemental, Spiralogic, Wu Xing, and developmental signals can inform prompts;
- response-shape, continuity, and interruption observations exist;
- canonical-turn custody can close and manifest evidence participation in bounded paths.

These are not seven separate empty boxes. They are partially connected organs.

## 7. What is not connected

No current admitted seam performs all of the following:

1. receives multiple time-bounded witnesses;
2. preserves authorship, source, confidence, uncertainty, expiry, and counterevidence;
3. distinguishes present observation from remembered context and inferred projection;
4. forms an inspectable, provisional encounter state;
5. decides floor state without deciding response;
6. decides relational act without writing content;
7. hands only admitted context to canonical cognition;
8. constrains expression without becoming another mind;
9. learns only through an explicit promotion and correction law.

That is the missing conversational-field seam.

## 8. Candidate A2 ontology—requirements, not schema

A2 should test whether a minimum field projection needs these facets:

| Candidate facet | Minimum content | Prohibited collapse |
|---|---|---|
| `memberAuthority` | explicit hold/yield, correction, selected space/mode, invitation/withdrawal | Member speech reduced to model confidence |
| `floorState` | speech activity, continuation evidence, silence, re-entry risk, floor opportunity | Floor opportunity converted to send command |
| `gestalt` | active movement, open/returned thread, unresolved movement, novelty, counterevidence | Projection presented as fact or identity |
| `relational` | permission, invitation, rupture/repair, warrant, candidate act | “Caring” prompt style treated as consent |
| `cognitiveReferences` | admitted memory/knowledge/frame identities and dispositions | A second cognition or duplicated prompt bag |
| `expressionConstraints` | allowed form, interruptibility, length/pacing tendency, silence/backchannel eligibility | Expression layer deciding meaning |
| `learningObservations` | outcome evidence, correction, expiry, promotion status | Telemetry silently changing policy |
| `provenance` | producer, authorship, observation time, scope, confidence, authority, expiry, evidence links | Scalar confidence standing in for authority |

This table is intentionally not TypeScript. A2 must first decide whether these facets are one
object, several registered producers, or a misleading abstraction.

## 9. Primary architecture findings

### Finding 1 — the integration center is a governed state, not a model

No surveyed conversational model can truthfully own hearing, relationship, memory, cognition, and
expression. The useful common center is a provenance-aware encounter representation under an
existing admission constitution.

### Finding 2 — there are two different participation problems

Evidence participation in `CanonicalTurn` and conversational floor participation are different
jurisdictions. Conflating them would allow a floor model to decide cognition inputs or a context
admission policy to decide when MAIA speaks.

### Finding 3 — relational intelligence is currently strongest as law and prompt grammar

The repository contains rich relational principles, explicit handoffs, Care grammar, and
post-generation witnesses. It lacks a governed per-turn relational-act decision before content.

### Finding 4 — Gestalt is the missing temporal shape, not another memory summary

Memory can supply prior evidence; it cannot author the present whole. Recent research supports a
standing-aware, counterevidence-preserving projection, but also shows that narrative continuity
without an inference boundary overreaches.

### Finding 5 — full-duplex research should be decomposed

Prior full-duplex systems offer separable lessons: simultaneous listening, continuation
projection, abortability, overlap, backchannels, cadence, and prosody. CI-01 should recover those
faculties without importing a second mind.

### Finding 6 — prompt composition is carrying too much architecture

Memory, modes, field sensing, relational law, and developmental orientation often meet as prompt
blocks. Prompt cognition research shows this creates tier divergence and makes presence dependent
on static instruction pressure. CI-01 should specify structure before any prompt repair is opened.

## 10. A1 disposition

The first census supports the following programme judgment:

> MAIA already has meaningful conversational organs and a strong evidence-custody constitution.
> What is missing is a governed, ephemeral coordination seam between evidence admission, floor
> state, relational act, canonical cognition, and expression.

It does **not** support any of these stronger claims:

- that a `ConversationalFieldSnapshot` schema is already known;
- that CMT-01 should be bypassed or widened;
- that prior free-synthesis or Gestalt branches should be merged;
- that TURN-03 should absorb semantic, memory, or relational inference;
- that Care grammar should become a universal fixed response sequence;
- that full-duplex cognition should be restored;
- that shadow observations should alter member-facing behavior.

## 11. Questions owed to A2

1. Is the conversational field a registered producer, a set of differentiated producers, or a
   read-only decision object outside cognition?
2. Which observations expire within milliseconds, within a turn, within a session, or never become
   durable at all?
3. How are member-originated evidence, system observation, inference, and MAIA-generated language
   kept non-equivalent through synthesis?
4. Can a Gestalt projection cite supporting and contradicting evidence without becoming an open
   narrative blob?
5. What closed vocabulary represents floor opportunity without implying action?
6. What closed vocabulary represents relational acts without forcing every response into a fixed
   grammar?
7. Where is the inference-admission boundary relative to canonical cognition?
8. How does a field projection become inspectable in shadow without the observer changing the
   encounter?
9. What would prove that a shared field improves conversation rather than merely producing more
   sophisticated internal descriptions?

## 12. Standing

```text
A1 current-path census .............. COMPLETE
named R&D recovery .................. COMPLETE FOR THE BOUNDED CORPUS
long-tail historical prototypes ..... NOT CLAIMED AS CURRENT CAPABILITY
shared field contract ............... MISSING · A2 NOT OPENED
relational-act selector ............. MISSING
first-class Gestalt state ........... MISSING
backchannel authority ............... MISSING · TURN-05 UNOPENED
CI-01 model action .................. NONE SELECTED OR INSTALLED
TURN-03 model standing .............. A2 BASELINE CANDIDATE SELECTED · NO LIVE AUTHORITY
runtime / prompt / schema changes ... NONE
member-facing behavior .............. UNCHANGED
production .......................... UNTOUCHED
```
