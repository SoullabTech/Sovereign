# CI-01 — Act 2 Conversational Field Projection Contract

**Date:** 2026-09-16

**Act:** A2 — conversational field contract candidate

**State:** CANDIDATE COMPLETE · RESEARCH / ARCHITECTURE ONLY · NO RUNTIME AUTHORITY

**Branch:** `feature/ci-01-conversational-intelligence-synthesis-20260916`

**Research base:** `82d777459249bfa6b138131b50f3cddf115acca3`

**Tracker:** `MAIA-SOVEREIGN-ci01-a2`

**Authority:** None. This record creates no runtime type, producer, prompt block, schema, model,
route, memory behavior, endpointing decision, response plan, expression behavior, or learning
policy.

## 1. The ruling

> **The conversational field is a governed view over differentiated witnesses and projections.
> It is not one object, one producer, one prompt block, one memory, or one mind.**

The name `ConversationalFieldSnapshot` is therefore rejected as the first implementation shape.
It invites a single bag containing material with different authorship, standing, lifetimes,
readers, and powers. Registering that bag as one MIPA producer would launder those differences at
the precise boundary designed to preserve them.

The minimum architecture is instead a small ecology:

```text
governed source systems
        ↓
lineage-bearing encounter witnesses
        ↓
independent, expiring projections
        ├── floor projection                 outside cognition
        ├── Gestalt projection               provisional
        ├── relational-act proposal          provisional
        └── expression envelope              post-cognition constraint
        ↓
specific projection outputs, if separately registered
        ↓
MIPA disposition: HELD / OFFERED / ADMITTED / EXCLUDED
        ↓
CanonicalTurn
        ↓
canonical MAIA cognition
        ↓
inference-admission boundary
        ↓
expression
        ↓
outcome observations held outside policy promotion
```

The phrase **conversational field** names the coordinated view formed across those records. It
does not name a new sovereign runtime object.

## 2. Decisions at a glance

| Question | A2 decision |
|---|---|
| Is the field one registered producer? | **No.** Mixed provenance, authority, and lifetime must be partitioned before MIPA. |
| Is the field a second `CanonicalTurn`? | **No.** `CanonicalTurn` remains the sole closed cognition boundary. |
| Is the field durable memory? | **No.** Projections expire. Governed primary evidence and relations remain in their own source systems. |
| May the field load new member data? | **No.** Projection is not collection or retrieval authority. It receives already-lawful witnesses. |
| May a floor projection make MAIA speak? | **No.** `FLOOR_AVAILABLE` describes opportunity, never action. |
| May a Gestalt projection become member truth? | **No.** It remains recomputable, standing-aware, and disposable. |
| May a relational-act proposal write the response? | **No.** It proposes form, warrant, and restraint; canonical MAIA owns meaning. |
| May cognition read the whole field? | **No.** It may read only separately registered, MIPA-admitted participants. |
| May expression read raw memory or Gestalt? | **No.** It receives canonical meaning plus a narrow expression envelope. |
| May telemetry or repeated projections learn policy? | **No.** Promotion requires a separate correction and consent law. |

## 3. Evidence cut and inherited law

A2 was derived from current repository truth, not from the field metaphor alone.

### Current-tree contracts read

- `lib/maia/canonical-turn/types.ts`
- `lib/maia/canonical-turn/construct.ts`
- `lib/maia/canonical-turn/adjudicate.ts`
- `lib/maia/canonical-turn/producerRegistry.ts`
- `docs/programme/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md`
- `docs/programme/CMT-01_PARTICIPATION_DISPOSITION_CONTRACT.md`
- `lib/voice/turnArbiter.ts`
- `docs/architecture/MAIA_TEMPORAL_RELATIONAL_MEMORY_GESTALT_LAW_2026-09-16.md`
- `lib/field/fieldOrchestrator.ts`
- `lib/field/fieldOrchestratorTelemetry.ts`
- `lib/sovereign/pfiMindEntrypoint.ts`
- `lib/sovereign/types/mindContext.ts`
- `lib/conversation/conversationStateResolver.ts`
- `lib/maia/maiaPlanner.ts`
- `lib/consciousness/pfi.ts`
- `lib/consciousness/field/MAIAFieldInterface.ts`

### Research evidence read without promotion

At immutable ref `33eb5ee84c589855aeb7957213c1e4fb43ab0507`:

- `RELATIONAL-GESTALT-STANDING-01_CONTRACT_2026-09-16.md`
- `RELATIONAL-GESTALT-STANDING-01_ACT4_STANDING_AWARE_PROJECTION_2026-09-16.md`
- `RELATIONAL-GESTALT-STANDING-01_ACT6_ADJUDICATION_2026-09-16.md`
- `RELATIONAL-GESTALT-STANDING-01_ACT7_MINIMUM_ARCHITECTURE_2026-09-16.md`
- `RELATIONAL-GESTALT-STANDING-01_CLOSURE_2026-09-16.md`

That lane remains research-only. A2 adopts no implementation from it. It preserves the findings
that projection must descend to evidence, standing metadata alone does not prevent generative
overreach, and an inference-admission boundary is needed after synthesis.

## 4. Existing names that this contract does not replace

The repository already contains several objects called “field,” “mind,” “plan,” or “conversation
state.” They are relevant predecessors, not the A2 contract.

| Existing locus | What it currently does | Why it is not the conversational field contract |
|---|---|---|
| `CanonicalTurn` | Freezes one cognition turn after MIPA disposition | It governs cognition membership, not evolving encounter state. |
| `FieldContext` | Combines PFI, resonance, and unified-elemental outputs and serializes them as a prompt addendum on current FAST / CORE paths | It mixes sources into one rendered JSON block, lacks claim-level lineage and expiry, is tier-divergent, and currently includes explicitly synthetic defaults in its partial unified-field input. |
| `PFIMindState` / `MindContext` | Carries pre-language field scalars and routing guidance when enabled | It is one witness family. Its scalars are not member truth, Gestalt, floor state, or relational consent. |
| `ConversationState` resolver | Resolves local answer / referent continuity and emits a prompt hint | It is a narrow semantic witness whose direct prompt rendering bypasses the desired field / MIPA separation. |
| TURN-02 arbiter | Produces shadow `wait`, `backchannel_candidate`, `yield_candidate`, or `insufficient_evidence` | It combines floor evidence but has no dispatch authority and does not model Gestalt or relationship. |
| `MAIAResponsePlan` / PFI collapse | Combines stance, response shape, memory policy, and voice direction | It demonstrates a useful planning seam while also showing why powers must be separated rather than placed in one plan. |
| `MAIAFieldInterface` | Historical consciousness-field and persistence machinery | It joins embeddings, biometric modulation, persistence, inference, and recommended action; it is not a governed conversation boundary. |

### A2 naming consequence

A future implementation must not create another generic `FieldContext`, `MindContext`,
`ConversationState`, or `ConversationalFieldSnapshot` and ask callers to infer which authority it
has.

The executable nouns, if separately authorized, should remain specific:

```text
EncounterWitness
FloorProjection
GestaltProjection
RelationalActProposal
ExpressionEnvelope
OutcomeObservation
```

These are conceptual names in A2, not TypeScript authorization.

## 5. The six planes

The contract separates six planes because each has a different relationship to truth and action.

| Plane | Purpose | May contain | May not do |
|---|---|---|---|
| **SOURCE** | Produce lawful observations | current speech, UI acts, acoustic signals, retrieved evidence, computed signals | Gain authority merely because a downstream field wants the data |
| **WITNESS** | Preserve source, scope, time, lineage, and uncertainty | atomic observations and direct member acts | Synthesize a whole or issue an action |
| **PROJECTION** | Form disposable judgments for one purpose | floor, Gestalt, relational-act candidates | Become primary evidence, memory, or member identity |
| **ADMISSION** | Decide what may reach cognition | separately registered candidate blocks and MIPA dispositions | Admit “the whole field” as an opaque block |
| **RESPONSE** | Produce and govern member-facing expression | canonical meaning, claim standing, narrow expression constraints | Cite its own output as evidence that its interpretation was true |
| **OUTCOME** | Observe what happened next | correction, adoption, interruption, re-entry, silence, continuation | Alter policy or durable memory without a later promotion law |

No plane inherits another plane's authority through adjacency.

## 6. Encounter identity and scope

Every witness and projection must be bound to a closed encounter scope.

| Required concept | Meaning |
|---|---|
| `encounterRef` | Opaque identity for the current room/session encounter; not raw member content |
| `exchangeRef` | The member / MAIA exchange or pre-turn interval to which the record belongs |
| `roomKind` | The room policy under which the observation was lawfully produced |
| `identityStatusRef` | Reference to an identity posture minted through the same identity authority used by the canonical boundary; never a route-supplied member claim |
| `sovereigntyRef` | The sanctuary, memory, consent, and member-setting posture in force when produced |
| `asOf` | The time at which the projection is claimed to describe the encounter |
| `validUntil` | Explicit expiry or invalidation condition; no implicit timelessness |
| `contractVersion` | The version of the witness or projection vocabulary used |

The field may reference these truths. It does not remint identity, consent, room policy, or
sovereignty.

## 7. Encounter witness contract

An `EncounterWitness` is the smallest field-bearing unit. It is an observation with lineage, not
a text block waiting to be pasted into a prompt.

### 7.1 Required envelope

Each witness must preserve at least:

- stable witness identity;
- named producer and producer version;
- domain: HEARING / FLOOR / GESTALT / RELATIONSHIP / COGNITION / EXPRESSION / LEARNING;
- origin kind;
- claim kind;
- observation time and source window;
- encounter, exchange, room, and sovereignty scope;
- expiry or invalidation condition;
- source evidence references;
- derivation references when computed or inferred;
- supporting and contradicting references where applicable;
- uncertainty form and measurement confidence where meaningful;
- correction, withdrawal, supersession, or contest relations;
- whether it is eligible for projection, cognition candidacy, expression, or observation only.

No generic `payload: Record<string, unknown>` is admitted by this candidate contract. Each future
witness family would require a closed payload contract of its own.

### 7.2 Origin kinds

| Origin kind | Meaning | Constitutional treatment |
|---|---|---|
| **MEMBER_ORIGIN** | Direct member utterance, gesture, setting, correction, invitation, or withdrawal | Preserve exact source and scope; do not reduce it to model confidence. |
| **SYSTEM_OBSERVATION** | Mechanically observed event such as speech activity, silence duration, or a route fact | May report what occurred; may not claim member meaning. |
| **SYSTEM_COMPUTATION** | Deterministic transformation such as a bounded threshold or resolved relation | Must expose inputs and algorithm/version; computation is not authorship. |
| **SYSTEM_INFERENCE** | Model, heuristic, or synthesis hypothesis about continuation, meaning, affect, relation, or pattern | Provisional; requires uncertainty and evidence lineage; never member truth. |
| **MAIA_OUTPUT** | MAIA's prior wording, question, interpretation, backchannel, silence decision, or expressive act | Evidence of what MAIA did, not evidence that the member state MAIA described was true. |

Retrieval does not create a sixth origin. A retrieved member utterance remains member-origin with
historical scope. A retrieved MAIA interpretation remains MAIA-origin. Persistence, recurrence,
embedding, or summarization does not change origin.

### 7.3 No reflexive evidence

MAIA's output cannot corroborate the interpretation that generated it.

```text
MAIA infers X
    ↓
MAIA says language shaped by X
    ↓
the resulting language is NOT new evidence that X is true
```

Only a new member-origin act—adoption, correction, refinement, rejection, continuation, or another
direct response—may change the standing of that proposal.

## 8. Four axes that must never collapse

One scalar `confidence` is constitutionally inadequate.

| Axis | Question | Example |
|---|---|---|
| **Origin** | Who or what produced this? | member utterance vs acoustic model vs MAIA proposal |
| **Epistemic standing** | In what form may it be represented now? | established, provisional, contested, unresolved, historical |
| **Measurement confidence** | How reliable is this observation or inference as measured? | acoustic continuation probability |
| **Control authority** | What, if anything, may this record cause? | observe only, propose, admit to cognition, constrain expression |

A high-confidence inference remains an inference. A low-confidence transcription of an explicit
member hold requires clarification or conservative handling; the detector's uncertainty does not
make a model sovereign over the member. A direct member correction carries authority because of
its origin and act, not because it has a larger numeric score.

The CMT-01 axes—`authoredBy`, `participationClass`, and `authority`—remain the governing cognition
admission axes when a specific field output becomes a candidate block. Field axes do not replace
or pre-adjudicate them.

## 9. Member-authority projection

Member authority is not a psychological inference. This projection may contain only a direct
member act or a system observation that points to the exact act it recognized.

Candidate acts include:

```text
EXPLICIT_HOLD
EXPLICIT_RELEASE
CURRENT_SPEECH
CORRECTION
WITHDRAWAL
INVITATION
PERMISSION
SELECTED_SPACE
SELECTED_MODE
```

### Laws

1. A UI gesture is represented as the member's direct act with its exact event reference.
2. A phrase detector is represented as a system observation linked to the exact member span; it
   may not erase the distinction between the utterance and its interpretation.
3. Correction, withdrawal, and current speech invalidate dependent projections immediately for
   present use.
4. No remembered preference silently overrides the member's current act.
5. “No signal” is not member consent, yield, invitation, or permission.

At minimum, the ordering remains:

```text
explicit member hold       > acoustic / semantic projection
current member speech      > planned MAIA expression
member correction          > stored or inferred meaning
member withdrawal          > prior invitation / permission
current counterevidence    > historical pattern confidence
```

## 10. Floor projection

The floor projection answers one question only:

> **What is the current availability of the conversational floor?**

### 10.1 Closed candidate vocabulary

| `floorState` | Meaning | What it does not mean |
|---|---|---|
| **MEMBER_HOLDS** | An explicit hold or member-controlled continuation keeps the floor with the member | The model is confident the member has a stable trait |
| **MEMBER_SPEAKING** | Current speech or re-entry is observed | MAIA may continue a prepared response |
| **CONTINUATION_POSSIBLE** | Time-bounded evidence indicates the member may continue | The member has explicitly asked MAIA to wait forever |
| **FLOOR_AVAILABLE** | No superior hold/speech/continuation condition currently prevents another participant from acting | MAIA should speak, backchannel, or generate content |
| **INDETERMINATE** | Available evidence cannot support another state | Silence is consent or yield |

`FLOOR_AVAILABLE` deliberately replaces `YIELD` at this layer. Yield describes a member act or a
predictor's hypothesis. Availability is the limited conclusion the floor resolver may draw.

### 10.2 TURN-02 mapping

TURN-02 remains unchanged. A later adapter could map its shadow evidence without changing its
authority:

| TURN-02 output | A2 interpretation |
|---|---|
| `wait` with `explicit_floor` | `MEMBER_HOLDS` |
| `wait` with `speech_active` | `MEMBER_SPEAKING` |
| `wait` with continuation evidence | `CONTINUATION_POSSIBLE` |
| `yield_candidate` | evidence supporting—but not by itself establishing—`FLOOR_AVAILABLE` |
| `insufficient_evidence` | `INDETERMINATE` |
| `backchannel_candidate` | not a floor state; a candidate relational / expression opportunity |

The floor projection may never call transcript commit, response generation, dispatch, TTS, or
playback. Those powers remain in separately authorized lanes.

## 11. Gestalt projection

The Gestalt projection is a small, disposable view of the encounter's temporal-relational shape.
It is not a topic summary, personality profile, narrative completion, or durable memory.

### 11.1 Permitted item kinds

```text
ACTIVE_MOVEMENT
OPEN_THREAD
RETURNED_THREAD
UNRESOLVED_MOVEMENT
RELATIONAL_SHIFT
NOVELTY
COUNTEREVIDENCE
CORRECTION
```

Each item must carry evidence / relation references, temporal and process scope, standing, and
contradicting evidence where present. A prose label may aid inspection, but the prose label may
not be the sole carrier of lineage.

### 11.2 Standing vocabulary

The research line at `33eb5ee8` supplies a useful candidate vocabulary without gaining runtime
standing here:

```text
ESTABLISHED_MEMBER
ADOPTED_MEANING          // MAIA origin remains visible
PROVISIONAL_MAIA
CONTESTED
UNRESOLVED
HISTORICAL_ONLY
OPEN
```

### 11.3 Gestalt laws

1. A projection cites primary evidence and typed relations; it may not cite itself as evidence.
2. Member adoption changes usability, never original authorship.
3. Corrected or superseded material is pair-or-neither: carry the correction relation or omit
   the historical claim when irrelevant.
4. Salience and standing remain separate.
5. Current member evidence may reorganize the whole immediately.
6. Contradiction and unresolved difference remain representable.
7. Process scope precedes person ontology.
8. The projection expires and is recomputed; persistence cannot promote it.

## 12. Relational-act proposal

The relational-act proposal answers:

> **If participation becomes appropriate, what form of participation appears warranted?**

It does not answer what MAIA believes, what words she will use, or whether she is authorized to
take the floor.

### 12.1 Closed candidate vocabulary

```text
RECEIVE_SILENTLY
ACKNOWLEDGE
MIRROR
CLARIFY
INQUIRE
ILLUMINATE
BRIDGE
ASK_PERMISSION
INVITE
CHALLENGE
RETURN_TO_THREAD
REPAIR
NO_CLEAR_ACT
```

The vocabulary is a set, not a sequence. `MIRROR → ILLUMINATE / BRIDGE → ASK_PERMISSION → INVITE`
remains a valuable Care grammar, but A2 does not make it compulsory for every encounter.

Each proposal must include:

- one primary candidate act or `NO_CLEAR_ACT`;
- optional alternative candidates;
- evidence and Gestalt references;
- degree and source of warrant;
- invitation / permission state;
- applicable restraint or risk;
- expiry at the current exchange;
- system-inference origin unless the member explicitly selected the act.

`ACKNOWLEDGE` is the relational act. A short vocal backchannel is one possible expression of it.
This preserves the distinction between **what kind of participation belongs** and **how it is
rendered**.

## 13. The cognition crossing

### 13.1 The field itself never crosses MIPA

The complete field view may be inspected by shadow instrumentation, but it may not be registered
as one producer or serialized into one prompt block.

A future implementation may propose separately registered producers for narrowly bounded outputs,
for example a standing-resolved Gestalt projection or a relational-act proposal. Each would owe:

- one closed producer identity;
- one authorship / participation / authority classification;
- one room and sovereignty policy;
- one loader with no hidden extra data;
- one MIPA disposition and reason;
- one renderer contract;
- one manifest row;
- one independent refusal / removal path.

Mixed origin requires partition before MIPA. A projection containing a member quote, a system
calculation, and a MAIA inference cannot travel as one participant.

### 13.2 Cognitive reference index

The field may carry a content-free index of the governed sources and projection claims on which it
depends. It may not duplicate their prose, memory bodies, transcripts, or prompt addenda.

Canonical cognition receives only the content of MIPA-admitted participants. The index supports
descent and audit; it is not a bypass around participation.

### 13.3 Inference admission after cognition

Standing-resolved input cannot by itself govern everything a generative model creates. A later
response contract must distinguish member-facing claims as:

```text
GROUNDED       descends to admitted evidence / relation references
CANDIDATE      new MAIA-origin interpretation, explicitly provisional
QUESTION       genuinely open inquiry without hidden presupposition
```

Unsupported inference may be downgraded to a candidate or question, repaired, or omitted. A model
or semantic verifier may detect possible overreach; it may not grant standing. This boundary is a
future architecture requirement, not an A2 implementation.

## 14. Expression envelope

Expression is downstream of canonical meaning. It receives only what it needs to embody that
meaning faithfully and remain interruptible.

Candidate envelope content:

| Facet | Permitted content | Exclusion |
|---|---|---|
| form eligibility | silence, acknowledgment, utterance | no dispatch command |
| interruptibility | whether rendering must abort on current speech / re-entry | no authority to ignore the member |
| length tendency | sparse, brief, measured, extended where allowed | no new semantic content |
| pacing tendency | wait, slow, moderate, spacious | no floor seizure |
| prosody tendency | warmth, intensity, cadence, pause | no affect diagnosis presented as truth |
| voice reference | member-selected or governed voice profile | no second voice identity |

The envelope may read:

- the canonical MAIA response;
- the admitted relational-act plan;
- current member-authority and floor projections;
- member-selected mode / voice settings;
- governed expression policy.

It may not read raw memory, raw Gestalt material, hidden member profiles, or unadmitted field
inferences. Expression may shape delivery. It may not change MAIA's meaning.

## 15. Outcome and learning quarantine

The conversational field does not learn merely because it observes outcomes.

After an exchange, an `OutcomeObservation` may record:

```text
member continued
member yielded explicitly
member re-entered
member interrupted MAIA
member adopted a proposal
member corrected or rejected a proposal
member ignored a proposal
response was aborted
```

These are observations with lineage. They do not automatically:

- update member preferences;
- change floor thresholds;
- consolidate a personality or developmental pattern;
- rewrite memory;
- promote a relational act;
- train a model;
- or alter future policy.

Session-local TURN-01 pause adaptation remains governed by its own existing law. Any broader
promotion requires a separately authorized learning contract with consent, correction,
inspection, expiry, and rollback.

## 16. Lifetime and expiry law

Nothing inside the conversational field is timeless.

| Record | Maximum conceptual lifetime | Invalidation |
|---|---|---|
| acoustic / VAD / overlap witness | producer-declared short TTL tied to sample cadence | newer signal, stream discontinuity, clock expiry |
| semantic continuation witness | current utterance / pause window | transcript revision, new speech, exchange seal |
| floor projection | current pre-turn interval | member speech, hold/release act, new witness, transcript commit |
| relational-act proposal | current exchange | floor change, correction, new member input, exchange completion |
| Gestalt projection | current as-of view, ordinarily recomputed per turn | new evidence, correction, contradiction, scope change |
| expression envelope | one response lifecycle | member re-entry, abort, response completion |
| outcome observation | historical evidence under its own custody | never treated as current state without reconstruction |

No field projection receives `never expires`. Durable source evidence may persist under existing
memory or event law; its current relevance must still be reconstructed.

## 17. Correction and counterevidence

Correction is append-only and immediately effective for present use.

```text
new member correction
        ↓
append correction / contest / refinement relation
        ↓
invalidate dependent current projections
        ↓
recompute from the new source cut
```

Historical bytes and authorship remain intact. A projection may not silently mutate the old claim
into the new one.

Every derived claim must support reverse descent:

```text
projection claim
    → standing decision
    → typed relation(s)
    → observation(s)
    → primary evidence
```

If descent breaks, the derived claim is ineligible for cognition candidacy and must remain absent
or explicitly invalid in shadow inspection.

## 18. Reader and authority matrix

| Reader / faculty | May read | May produce | Explicitly forbidden |
|---|---|---|---|
| hearing witness producers | consented current signal | atomic hearing witnesses | memory, relational act, response intent |
| floor resolver | member authority, hearing, silence threshold, session-local pause evidence | `FloorProjection` | transcript commit, response generation, backchannel, dispatch |
| Gestalt projector | lawful primary evidence, typed relations, present counterevidence | `GestaltProjection` | personality truth, memory write, member-facing prose |
| relational-act resolver | member authority, floor availability, standing-resolved Gestalt, selected mode | `RelationalActProposal` | wording, model invocation, floor seizure |
| MIPA | separately registered candidates plus identity / encounter / sovereignty | dispositions and manifest | loading sources, synthesizing projections, dispatch |
| canonical cognition | admitted `CanonicalTurn` participants | MAIA meaning / draft | reading the unadmitted field or bypassing MIPA |
| inference-admission gate | response claims plus admitted lineage | grounded / candidate / question disposition | inventing evidence or granting member adoption |
| expression renderer | canonical meaning plus narrow expression envelope | text / audio / silence rendering | changing meaning, ignoring re-entry, reading raw field data |
| outcome observer | actual subsequent events | outcome witnesses | policy promotion, memory rewrite, model training |

### 18.1 Shadow inspection manifest

An A3 shadow implementation would need an observational manifest distinct from both field content
and the `TurnParticipationManifest`. At minimum it would identify:

- projection identity and contract version;
- build SHA and projector / policy versions;
- encounter and exchange references;
- `asOf`, expiry, and invalidation state;
- input witness references and content-free digests;
- projection state codes and closed reason codes;
- supporting, contesting, correction, and supersession references;
- whether any candidate approached MIPA and its actual disposition;
- causal-isolation state: `SHADOW_ONLY`, with zero registered behavior readers;
- projector failure, omission, or lineage refusal.

It must not persist transcript text, prompt bodies, memory bodies, acoustic frames, relational
inference prose, or the full projection as a future retrieval source. Its purpose is to prove what
the shadow system saw and did not cause.

## 19. Failure behavior

A future field runtime, if authorized, must fail locally and conservatively.

| Failure | Required result |
|---|---|
| witness expired | exclude it from the current source cut |
| stream discontinuity | invalidate acoustic continuity; do not interpolate confidence across the gap |
| missing lineage | projection claim invalid; no cognition candidacy |
| mixed-origin block not partitioned | refuse the candidate before MIPA |
| conflicting evidence | preserve `CONTESTED` / `UNRESOLVED`; do not force synthesis |
| no lawful floor judgment | `INDETERMINATE` |
| no warranted relational act | `NO_CLEAR_ACT` |
| member correction | invalidate dependent present projections and recompute |
| field projector failure | live conversation remains unchanged; shadow record marks failure |
| expression loses current floor | abort or withhold under the separately authorized turn law |

“Graceful degradation” may never mean silently dropping a constitutional member act, silently
admitting a thinner context, or replacing missing evidence with a default psychological claim.

## 20. A2 falsifiers

The candidate contract fails if a future design permits any of the following:

1. **Whole-field producer:** one field blob crosses MIPA under one provenance classification.
2. **Open-bag return:** an index signature, generic metadata bag, or free-form addendum becomes the
   ordinary extension seam.
3. **Self-evidence loop:** MAIA's wording is treated as evidence that MAIA's interpretation of the
   member was correct.
4. **Floor-action collapse:** `FLOOR_AVAILABLE` or predictor yield causes speech, dispatch, or TTS.
5. **Backchannel collapse:** a `backchannel_candidate` is treated as both floor permission and
   expression authorization.
6. **Confidence sovereignty:** a numeric model score overrides explicit member behavior or
   epistemic standing.
7. **Expiry blindness:** stale acoustic, semantic, or relational state participates without a
   valid source window.
8. **Correction blindness:** a corrected claim remains current without the correction relation.
9. **Gestalt persistence:** a prior projection returns as primary evidence or present truth.
10. **PFI scalar laundering:** coherence, realm, element, safety, readiness, resonance, or another
    field scalar is presented as member-authored meaning.
11. **Prompt bypass:** a field renderer serializes unadjudicated sources directly beside a
    `CanonicalTurn`.
12. **Reader overreach:** expression reads raw memory / Gestalt, or the floor resolver reads MAIA's
    intended response and biases availability toward it.
13. **Observer authority:** shadow projection or telemetry changes the encounter being measured.
14. **Same-history capture:** materially different present evidence cannot reorganize the field
    because historical projections dominate.
15. **Learning by accumulation:** recurrence count or repeated shadow agreement silently promotes
    a policy or member profile.

## 21. Answers to the A1 questions

| A1 question | A2 answer |
|---|---|
| One producer, differentiated producers, or outside-cognition object? | The field is an outside-cognition governed view. Only differentiated, separately registered outputs may later become MIPA candidates. |
| What expires when? | Every projection expires; short signals, pre-turn floor, current-exchange act, per-turn Gestalt, one-response expression. No timeless projection. |
| How are origins kept distinct? | Immutable origin kind, source lineage, no conversion through retrieval or synthesis, and mixed-origin partition before MIPA. |
| Can Gestalt cite support and contradiction without becoming narrative? | Yes: typed items and relations with supporting / contesting references; prose labels are non-authoritative. |
| Closed floor vocabulary? | `MEMBER_HOLDS`, `MEMBER_SPEAKING`, `CONTINUATION_POSSIBLE`, `FLOOR_AVAILABLE`, `INDETERMINATE`. |
| Closed relational-act vocabulary without a fixed grammar? | A versioned set of candidate acts, one or more proposals, and `NO_CLEAR_ACT`; no mandatory sequence. |
| Where is inference admission? | After canonical cognition and before member-facing expression, with grounded / candidate / question claim standing. |
| How can shadow inspection avoid changing the encounter? | Content-free manifests and causally isolated projection; no prompt, floor, response, memory, expression, or policy readers. |
| What would show improvement? | A3 must first prove causal isolation; A4 must compare member outcomes, correction fidelity, floor behavior, relational fit, and latency—not richness of internal description. |

## 22. How the earlier R&D enters synergistically

| Research / capability | Lawful contribution to the candidate ecology | Power it does not receive |
|---|---|---|
| TURN-03 / DualTurn candidate | time-bounded HEARING witness | floor, response, or dispatch authority |
| TURN-02 arbiter | shadow floor evidence and reasons | transcript commit or speech |
| PFI / field orchestrator | typed elemental, coherence, safety, resonance, and routing witnesses with source / coverage metadata | member meaning, consent, Gestalt, or one-block prompt sovereignty |
| Care Mode grammar | relational-act vocabulary and restraint | mandatory scripted sequence |
| relational Gestalt standing research | typed relations, disposable projection, counterevidence, descent, and claim standing | live inference or member truth |
| memory / Anamnesis | historical evidence and relations under existing consent | present salience, identity, or response command |
| CMT-01 / MIPA | cognition admission and manifest constitution | floor judgment or projection synthesis |
| canonical MAIA cognition | one meaning-making voice | unadmitted field access |
| MAIA planner / PFI voice / prosody | prior art for act and expression planning | authority to merge cognition, memory policy, and expression into one field object |
| full-duplex / PersonaPlex research | timing, overlap, abortability, backchannel, cadence, prosody lessons | replacement cognition |

This is the intended synergy: every prior capacity becomes more useful because its contribution is
made explicit, scoped, and composable—without being allowed to become the whole.

## 23. A2 disposition and stop

A2 establishes an architecture candidate:

> **The minimum conversational-field seam is a lineage-preserving ecology of expiring witnesses
> and purpose-specific projections, with CanonicalTurn / MIPA remaining the only cognition
> crossing and with floor, relational act, cognition, expression, and learning retaining separate
> powers.**

It does not authorize:

- runtime types or constructors;
- producer-registry additions;
- MIPA policy changes;
- a field assembler or state store;
- prompt or response-plan changes;
- PFI / field-orchestrator repair;
- TURN-03 integration;
- relational standing implementation;
- inference-admission implementation;
- endpointing, transcript commit, backchannel, dispatch, TTS, or playback changes;
- memory write, schema, model, learning, merge, or deployment acts.

The next prepared act remains:

```text
CI-01 A3 — Shadow Synthesis Architecture
```

A3 must design how these records could be produced and compared while remaining causally absent
from live conversation. A3 is not opened by this record.

## 24. Standing

```text
A2 field shape ruling ............... COMPLETE · VIEW, NOT ONE OBJECT
witness envelope .................... CANDIDATE DEFINED · NO TYPE CREATED
floor vocabulary .................... CANDIDATE DEFINED · NO AUTHORITY
Gestalt standing .................... CANDIDATE RELATED · RESEARCH NOT PROMOTED
relational-act vocabulary ........... CANDIDATE DEFINED · NO SELECTOR
MIPA relationship ................... CLOSED IN ARCHITECTURE · NO REGISTRY CHANGE
inference-admission boundary ........ REQUIRED BY ARCHITECTURE · NOT IMPLEMENTED
expression envelope ................. CANDIDATE DEFINED · NO RENDERER CHANGE
learning promotion .................. EXCLUDED
A3 shadow synthesis ................. NOT OPENED
runtime / prompt / schema changes ... NONE
member-facing behavior .............. UNCHANGED
production .......................... UNTOUCHED
```
