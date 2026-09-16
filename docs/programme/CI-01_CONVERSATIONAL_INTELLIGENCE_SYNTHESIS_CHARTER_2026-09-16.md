# CI-01 — Conversational Intelligence Synthesis · Charter

**Date:** 2026-09-16

**State:** COMPLETE · RESEARCH / ARCHITECTURE ONLY · NO RUNTIME AUTHORITY

**Branch:** `feature/ci-01-conversational-intelligence-synthesis-20260916`

**Founding anchor:** TURN-03 opening `f5c02193c5ebee4f51b6c4b769ad6a8166b2a80f`

**Inherited head:** TURN-03 A1 census `7ac17a0abf50f3382c9c2c84c9b5ed93630779e3`

**Tracker:** `MAIA-SOVEREIGN-70`

## Founding question

> How should MAIA's existing hearing, turn, memory, Gestalt, relational, cognitive, and
> expressive capacities inform one another without any subsystem silently acquiring another
> subsystem's authority?

CI-01 does not seek a new master model or a second conversational mind. Its job is to recover,
classify, and connect what already exists, then define the missing seams precisely enough that a
later implementation lane can be judged before it is built.

The governing synthesis is:

> **Integrate evidence, not authority.**

## Why this lane exists

The repository already contains substantial but differently situated intelligence:

- a canonical cognition path shared by typed and spoken turns;
- a governed canonical-turn and evidence-admission architecture;
- member-owned floor timing and a shadow turn arbiter;
- memory, continuity, relationship, elemental, and developmental inputs;
- Care / Talk / Scribe conversational grammars;
- response-shape and field telemetry;
- voice, prosody, full-duplex, and acoustic-model research;
- Gestalt, relational-standing, and free-synthesis research.

Those capacities do not yet form one governed conversational ecology. Some affect live turns on
this branch, some only observe, some are disconnected, and some are research records on separate
branches. Treating all of them as equally live would be false. Treating them as unrelated would
discard the architecture they collectively reveal.

CI-01 establishes the truthful map between those two errors.

## Constitutional invariants

### CI-1 — One MAIA mind

Typed and spoken conversation converge on canonical MAIA cognition. A voice, turn, acoustic,
Gestalt, relational, or expression model may alter what evidence MAIA receives or how she is
expressed. It may not become a hidden replacement cognition path.

### CI-2 — Evidence does not inherit authority

A confidence score, inferred pattern, remembered theme, acoustic projection, developmental frame,
or relational hypothesis remains evidence with provenance. It does not become member intention,
consent, identity, or truth through repetition, persistence, or composition.

### CI-3 — Member authority remains lexically and structurally superior

At minimum:

```text
explicit member hold       > acoustic or semantic continuation model
current member speech      > a planned MAIA response
member correction          > stored or inferred interpretation
member-selected mode/space > an aggressive automatic policy
present counterevidence    > historical pattern confidence
```

### CI-4 — Four judgments remain separate

The architecture must not collapse these questions:

1. **Floor state:** is the member's expression still unfolding, and is a conversational
   opportunity available?
2. **Relational act:** if participation is appropriate, what kind of act belongs here—silence,
   acknowledgment, mirror, inquiry, illumination, permission, invitation, challenge, return?
3. **Cognition:** what does canonical MAIA actually understand, reason, remember, and mean?
4. **Expression:** how should that act be rendered in wording, length, timing, cadence, prosody,
   or silence?

`FLOOR_AVAILABLE` would mean only that the floor appears available. It would never mean “speak
now.”

### CI-5 — CanonicalTurn and conversational state are not the same object

`lib/maia/canonical-turn/` already governs **what evidence may participate in a MAIA turn**, under
what provenance, disposition, and sovereignty. CI-01 will not replace it with a giant context
object.

A future conversational-field representation, if admitted, would describe provisional encounter
state. It would still have to cross the canonical-turn / MIPA custody boundary before influencing
cognition.

This also names a vocabulary collision that later design must remove:

```text
CMT-01 “participation”      = evidence admission into a canonical turn
TURN / CI “participation”  = conversational floor and action opportunity
```

Future contracts must use distinct names such as `evidenceDisposition` and `floorState`; they may
not overload one word for both powers.

### CI-6 — Gestalt remains provisional

Gestalt may orient attention to the dynamic whole. It may not manufacture evidence, harden a
person into a profile, suppress novelty, or survive present contradiction without readjudication.
The present encounter retains the power to reorganize the whole.

### CI-7 — Observation cannot become control by accident

Shadow logs, telemetry, benchmarks, and research projections do not gain response, prompt,
endpointing, TTS, memory-write, or dispatch authority merely because CI-01 can see them together.

### CI-8 — A defect finding is not repair authorization

CI-01 may establish that an active capability is fragmented, prompt-heavy, inconsistent across
tiers, disconnected, or missing. That finding does not authorize changing it in this lane.

## Research domains

CI-01 classifies every admitted capability under one primary domain while preserving cross-domain
dependencies.

| Domain | Governing question |
|---|---|
| **HEARING** | What is observable in speech, silence, text, breath, prosody, and overlap? |
| **FLOOR** | Is expression still unfolding, and what conversational opportunity exists? |
| **GESTALT** | What provisional whole is forming across present movement and relevant history? |
| **RELATIONSHIP** | What act is warranted, invited, permitted, or restrained here? |
| **COGNITION** | What does canonical MAIA understand, reason, remember, and mean? |
| **EXPRESSION** | How should the chosen act be rendered—or withheld? |
| **LEARNING** | What may change over time, from whose evidence, with what correction path? |

`FLOOR` is used instead of `PARTICIPATION` in this charter to avoid collision with CMT-01's
evidence-participation contract.

## Candidate topology — not a runtime contract

The working architectural hypothesis is:

```text
member encounter
    ↓
provenance-bearing witnesses
    ↓
provisional conversational field
    ↓
floor judgment
    ↓
relational-act judgment
    ↓
canonical MAIA cognition
    ↓
expression policy
    ↓
member encounter continues
```

This hypothesis is subordinate to `CanonicalTurn`:

```text
registered evidence producer
    ↓
MIPA: HELD / OFFERED / ADMITTED / EXCLUDED
    ↓
CanonicalTurn
    ↓
canonical cognition
```

CI-01 Act 2 must adjudicate where a conversational-field projection belongs relative to that
existing boundary. This charter does not decide whether it is one registered producer, several
typed producers, a pre-cognition decision object, or something that should not exist at all.

## Programme acts

### A1 — Recovery and capability census

Recover the current implementation and the named R&D corpus. For each capability, record:

- exact implementation or research locus;
- whether it is effect-bearing, partial, shadow, disconnected, research-only, or absent;
- what evidence it observes or produces;
- what authority it currently possesses;
- which canonical seam, if any, consumes it;
- what must remain separate from it.

The initial repository census is recorded in
`CI-01_ACT1_CONVERSATIONAL_INTELLIGENCE_CENSUS_2026-09-16.md`.

### A2 — Conversational field contract candidate

**Tracker:** `MAIA-SOVEREIGN-ci01-a2` · **COMPLETE · ARCHITECTURE CANDIDATE ONLY**

Architecture only. Define the minimum ontology and provenance envelope required to represent
encounter state without duplicating `CanonicalTurn`, leaking an open context bag back into
cognition, or converting a projection into evidence.

The A2 ruling is recorded in
`CI-01_ACT2_CONVERSATIONAL_FIELD_CONTRACT_2026-09-16.md`. It rejects a monolithic runtime
`ConversationalFieldSnapshot`: the conversational field is a governed view over differentiated,
expiring witnesses and purpose-specific projections. Only separately registered outputs could
ever approach MIPA, and none were registered by A2.

A2 must answer:

- identity and authorship of every observation;
- observation time, expiry, and encounter scope;
- confidence and uncertainty without scalar authority collapse;
- member correction and counterevidence;
- distinction between member-originated, system-observed, system-inferred, and MAIA-generated
  material;
- relation to MIPA producer registration and dispositions;
- what is recomputed per turn versus durable;
- what cognition may read and what expression may read.

### A3 — Shadow synthesis architecture

**Tracker:** `MAIA-SOVEREIGN-ci01-a3` · **COMPLETE · ARCHITECTURE ONLY**

Specify a synthesizer that can combine admitted evidence into inspectable field projections while
remaining causally absent from member-facing behavior.

The A3 ruling is recorded in
`CI-01_ACT3_SHADOW_SYNTHESIS_ARCHITECTURE_2026-09-16.md`. It defines the synthesizer as a
one-way observational pipeline over sealed temporal cuts, not a master model or monolithic field.
Independent projectors produce attestations; later outcomes are joined only after the evaluated
projection is frozen. Authority isolation and operational non-interference remain separate proof
obligations, and neither is claimed as implemented by this architecture record.

Required shadow comparison:

```text
what the live path did
what each witness observed
what the synthesizer projected
what the member did next
```

No prompt injection, response rewrite, floor action, TTS action, or memory update is authorized.

### A4 — MAIA-CONVERSATION-BENCH-01 specification

**Tracker:** `MAIA-SOVEREIGN-ci01-a4` · **COMPLETE · SPECIFICATION ONLY**

The A4 ruling is recorded in
`CI-01_ACT4_MAIA_CONVERSATION_BENCH_01_SPEC_2026-09-16.md`. It defines a constitutional,
multi-domain, outcome-bound benchmark without creating or running one. Corpus validity, causal
isolation, domain judgment, ecology judgment, encounter outcome, and operational fitness remain
separate claim layers. The specification preserves timing classes, exact denominators, direct
member evidence, independent human adjudication, mandatory cross-domain cases, and synergy by
consequence plus ablation. It rejects a composite conversational-intelligence score.

Define a benchmark for conversational ecology, not answer correctness alone. It must include:

- false floor seizure and re-entry collision;
- missed invitation and inappropriate action;
- over-interpretation and inference leakage;
- premature advice and unnecessary verbosity;
- lost or falsely continued threads;
- failed correction uptake;
- inappropriate backchannel or silence;
- response-start latency;
- same-history / different-present sensitivity;
- continuity across long encounters.

The benchmark must preserve per-case failures and provenance. An aggregate score may not hide a
constitutional violation.

### Stop gate — reached

CI-01 stops here after architecture and benchmark specification. A later lane—provisionally
`CI-02 — Conversational Field Runtime`—would require separate authorization before adding types,
runtime synthesis, storage, prompts, model calls, or behavior.

## Relationship to TURN-03

TURN-03 remains independent; CI-01 does not import or govern its implementation:

> Can a lawful sovereign acoustic model improve continuation evidence?

TURN-03 A1 has independently selected DualTurn `c3860ed` as an **A2 baseline experiment
candidate only**. It has not granted that candidate live authority. Any future acoustic output may
become a HEARING witness only after TURN-03 earns it and a later contract admits it. The projector
does not need Gestalt, relationship, memory, Spiralogic, or response knowledge, and CI-01 grants it
none.

CI-01 A3 read the independent TURN-03 research state at
`897dfcc8c7067ac8d09d9221647f80a7dda0c012`. At that immutable ref, the local DualTurn shadow
runtime passed feasibility; direct DualTurn and Smart Turn completion evidence failed important
continuation cases; and an asymmetric floor-ownership rule passed the two sealed synthetic
populations as a shadow candidate while preserving a known ceiling falsifier.

During A4 closeout, the remote sibling advanced to
`296590d3b12fa19d22542b0d7454c11f981fd681`. At that immutable ref, TURN-03 A4's domain-specific
human-shadow instrumentation is sealed and a local/admin-only founder witness is admitted, but
the witness is **not executed** and the human population remains **unopened**. Its protocol adds
useful research precedent—separate opt-in, explicit-floor ground truth, metadata-only telemetry,
a frozen candidate, and no tuning inside a population—but provides no real-human result and no
TURN-04 authority. No sibling component, route, observer, model, evidence store, or authority is
imported into CI-01.

CI-01 asks the complementary question:

> If acoustic evidence earns admission, how can it coexist with other evidence without acquiring
> floor, relational, cognitive, or expressive sovereignty?

The two programmes meet only at a separately adjudicated evidence contract.

## Explicit exclusions

Nothing in CI-01 may:

- modify application, library, route, component, hook, schema, migration, or prompt code;
- install or download a conversational, acoustic, voice, or embedding model;
- change FAST / CORE / DEEP routing or composition;
- alter voice capture, endpointing, transcript commit, dispatch, or TTS;
- change memory retrieval, ranking, writeback, or relationship inference;
- activate a disconnected full-duplex, Gestalt, field, prosody, or learning service;
- create a second cognition path;
- deploy, merge to a production branch, or claim production standing;
- promote a research branch merely by citing it;
- create a runtime `ConversationalFieldSnapshot` type.

## Programme acceptance

CI-01 is truthfully complete when:

- the charter is durable;
- the inherited capability map has an evidence-backed baseline;
- CMT-01, TURN-01/02/03, Gestalt law, prompt-cognition findings, and prior conversational-model
  research are related without conflation;
- the field contract preserves differentiated witnesses and projections rather than creating a
  second mind or opaque context object;
- shadow synthesis is temporally sealed, one-way, and falsifiable before any intelligence claim;
- the conversation benchmark preserves constitutional failures, direct member evidence, exact
  denominators, timing classes, and non-aggregation law;
- implementation and live-authority exclusions remain explicit.

## Current standing

```text
lane ................................ COMPLETE · RESEARCH / ARCHITECTURE ONLY
A1 baseline census .................. COMPLETE · REPOSITORY / R&D RECORDS ONLY
A2 field contract ................... COMPLETE · ARCHITECTURE CANDIDATE ONLY
A2 monolithic field snapshot ........ REJECTED AS FIRST IMPLEMENTATION SHAPE
A3 shadow synthesizer ............... COMPLETE · ARCHITECTURE ONLY
A3 runtime / event mirror ........... NOT CREATED
A4 conversation benchmark ........... COMPLETE · SPECIFICATION ONLY · NOT RUN
A4 composite intelligence score ..... REJECTED
runtime types ....................... UNCHANGED
prompts ............................. UNCHANGED
models .............................. CI-01 SELECTED / INSTALLED NONE
TURN-03 sibling state ............... A4 INSTRUMENTATION SEALED · FOUNDER WITNESS ADMITTED · NOT EXECUTED
TURN-03 integration into CI-01 ...... NONE
live floor / response authority ..... UNCHANGED
TURN-03 ............................. INDEPENDENT
CI-02 ............................... NOT OPENED
production .......................... UNTOUCHED
```
