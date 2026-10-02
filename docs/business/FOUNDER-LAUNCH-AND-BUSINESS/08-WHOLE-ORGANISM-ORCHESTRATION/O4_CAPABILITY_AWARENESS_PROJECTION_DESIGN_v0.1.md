# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O4

## READ-ONLY CAPABILITY AWARENESS PROJECTION — DESIGN ONLY

**Status:** DESIGN ONLY · NO SOURCE CONSUMER · NO RUNTIME IMPORT · NO MEMBER-FACING OUTPUT

## Governing question

> What may the first consumer know about the capability registry without gaining enough information or authority to act?

## Decision

The first lawful consumer seam is a pure:

> **Capability Awareness Projection**

It consumes the v2 registry and emits a deliberately reduced descriptive view.

It does not answer:
- can this member use it?
- is this available now?
- should MAIA suggest it?
- may it be invoked?
- what may it read or write?
- what does it cost?
- what route should open?

It answers only:
> **What kind of capability is this, what human movement does it serve, and what documentary standing does it currently have?**## Why this is the first consumer

Four candidate first consumers were considered.

### A. MAIA cognition event emitter — rejected for first use
Too close to member-facing behavior. A read could easily become an offer.

### B. House navigation/router — rejected for first use
Would risk turning descriptive identity into route authority.

### C. Entitlement/access resolver — rejected
Explicitly outside O3 and would collapse current access with future economic architecture.

### D. Capability Awareness Projection — accepted
Pure transformation only.

It creates a narrow membrane between the full authority registry and any future consumer.

That means future systems do not import the raw registry by default.

## Projection law

> **A consumer should receive only the minimum information required for its present responsibility.**

The Awareness Projection therefore strips authority-bearing and operational fields before anything downstream can see them.## Proposed awareness record

```ts
interface CapabilityAwarenessRecord {
  id: CapabilityAuthorityId
  domain: string
  humanMovement: string
  species: ArchitecturalSpecies
  lifecycle: 'DECLARED' | 'WITHHELD'
  authorityGateStanding: 'COMPLETE' | 'PARTIAL' | 'UNRESOLVED' | 'WITHHELD'
  researchDependency: ResearchDependency
}
```

No additional fields are authorized in O4.

## Fields deliberately NOT projected

### Operational authority
- consent mode;
- read scopes;
- write scopes;
- membranes;
- return targets;
- acknowledgment mode;
- JARVIS role.

### Commercial/access authority
- economic class;
- entitlement references;
- current access rules;
- role requirements.

### Epistemic implementation detail
- AIN roles;
- resolved authority refs;
- gap refs;
- unknown refs;
- output policy refs.### Runtime authority
- runtime eligibility;
- route target;
- modal target;
- voice phrases;
- availability;
- invocation status.

The consumer may know a capability is UNRESOLVED.
It does not receive the unresolved policy detail unless a later diagnostic consumer is separately authorized.

## Why gate standing is allowed

Gate standing is descriptive restraint, not action authority.

It lets a downstream system know the difference between:
- a fully-described capability;
- one with known gaps;
- one with missing authority;
- one deliberately withheld.

But it may not derive:

```text
COMPLETE   → available
PARTIAL    → maybe available
UNRESOLVED → ask for entitlement
WITHHELD   → offer workaround
```

All four inferences are forbidden.

Gate standing answers only:
> **how complete is the documentary authority picture?**## No-member-context law

The projection accepts **no member identity or member context**.

Forbidden inputs include:
- member id;
- account tier;
- Steward status;
- practitioner role;
- Studio ownership;
- relationship identity;
- chart data;
- current room contents;
- conversation text;
- consent state;
- memory state.

Therefore the projection cannot become a personalized availability engine.

Signature shape:

```ts
projectCapabilityAwareness(
  registry: readonly CapabilityAuthorityDescriptor[]
): readonly CapabilityAwarenessRecord[]
```

Not:

```ts
projectCapabilityAwareness(member, conversation, entitlements, registry)
```## No-selection law

The projection returns the complete awareness set in registry order.

It may not:
- rank;
- recommend;
- score;
- filter by member;
- choose a best capability;
- infer relevance from conversation;
- suppress capabilities because of commercial tier;
- promote COMPLETE above PARTIAL;
- translate WITHHELD into a substitute.

A future consumer may request a narrower semantic subset only under a separately authorized contract.

## No-label invention law

O3 v2 descriptors deliberately contain no human-facing `label` field.

The Awareness Projection may not manufacture labels by title-casing IDs or borrowing legacy labels.

Why:
- old labels carry old semantic assumptions;
- `studio.transition` and `wisdom.text` already demonstrated that apparently harmless labels can hide ambiguous acts.

Human-facing naming belongs to a separate presentation contract.

## No-runtime adoption law

Creating the Awareness Projection does not authorize:
- importing it into `cognitionEvents.ts`;
- attaching it to Oracle response payloads;
- rendering it in House;
- exposing an API;
- logging it as member telemetry;
- adding a developer endpoint;
- adding a MAIA tool;
- reading it from voice processing.

The first source implementation, if authorized, remains an unconsumed pure projector with tests.## Awareness invariants

### O4-INV-01 — Reduction only
Every projected field must already exist in the source descriptor; no semantic enrichment.

### O4-INV-02 — No authority fields
Consent, read/write effects, membranes, entitlement, economic class, and runtime eligibility never cross the projection.

### O4-INV-03 — No member context
Projection accepts no identity, role, tier, consent, memory, or conversation input.

### O4-INV-04 — No availability semantics
No output field may be named or interpreted as `available`, `enabled`, `eligible`, `allowed`, or `canInvoke`.

### O4-INV-05 — No ranking
Registry order is preserved; no scoring or recommendation.

### O4-INV-06 — WITHHELD remains visible as standing
`pattern.detect` may remain visible to internal awareness as WITHHELD but cannot be offered or invoked.

### O4-INV-07 — No alias translation
Legacy IDs are not accepted as projection input and are not mapped to v2 identities.

### O4-INV-08 — No human-facing naming
No labels/copy are manufactured.

### O4-INV-09 — Pure and deterministic
Same registry input produces the same awareness output with no I/O.

### O4-INV-10 — Awareness does not imply adoption
Presence in the awareness projection means only that the capability exists in canonical descriptive ontology.## Falsifier matrix

| ID | Forbidden proposition | Required failure |
| --- | --- | --- |
| F-O4-01 | Projection exposes `economicClass` | `AWARENESS_AUTHORITY_FIELD_FORBIDDEN` |
| F-O4-02 | Projection exposes `readScopes` or `writeScopes` | `AWARENESS_EFFECT_SCOPE_FORBIDDEN` |
| F-O4-03 | Projection accepts member identity | `AWARENESS_MEMBER_CONTEXT_FORBIDDEN` |
| F-O4-04 | Projection emits `available=true` for COMPLETE | `AWARENESS_NOT_AVAILABILITY` |
| F-O4-05 | Projection sorts COMPLETE before PARTIAL | `AWARENESS_RANKING_FORBIDDEN` |
| F-O4-06 | WITHHELD capability omitted to make list cleaner | `WITHHELD_STANDING_MUST_REMAIN_LEGIBLE` |
| F-O4-07 | Legacy `studio.transition` maps to `studio.choose` | `LEGACY_ALIAS_FORBIDDEN` |
| F-O4-08 | Label generated from ID | `PRESENTATION_INFERENCE_FORBIDDEN` |
| F-O4-09 | Projection reads accessMatrix | `AWARENESS_ACCESS_COUPLING_FORBIDDEN` |
| F-O4-10 | Projection imported by cognition/voice/route/UI during first act | `AWARENESS_RUNTIME_CONSUMER_FORBIDDEN` |

## Relationship to the five orchestrators

### House
Future House may eventually use awareness to understand architectural species, but O4 does not authorize that.

### MAIA
Future MAIA may eventually know capabilities through this membrane instead of raw registry access, but O4 does not authorize that.

### AIN
AIN is not needed to project static awareness.

### JARVIS
JARVIS may work on the implementation under separate work authority but gains no member capability authority.

### The Lab
Research standing remains visible only as static dependency; dynamic epistemic standing remains outside this projection.

## Design consequence

The first consumer should itself be a **membrane for future consumers**.

This gives the architecture a clean dependency direction:

```text
Capability Authority Registry v2
          │
          ▼
Capability Awareness Projection
          │
          ├── future House awareness     [NOT AUTHORIZED]
          ├── future MAIA awareness      [NOT AUTHORIZED]
          ├── future developer inspector [NOT AUTHORIZED]
          └── future docs/tooling        [NOT AUTHORIZED]
```

No future consumer should import the raw authority registry unless its responsibility genuinely requires authority metadata and receives separate adjudication.

## Standing

> **O4 DESIGN — FIRST LAWFUL CONSUMER SEAM DEFINED AS PURE CAPABILITY AWARENESS PROJECTION · MINIMUM-KNOWLEDGE CONTRACT FIXED · NO SOURCE CONSUMER OR RUNTIME INTEGRATION AUTHORIZED**

## Exact next boundary

> **SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O4R1 — PURE CAPABILITY AWARENESS PROJECTION SOURCE ADMISSION ONLY**

O4R1 may implement only the pure projector + tests.

It must stop before importing that projector into MAIA, House, cognition events, routes, UI, voice, telemetry, or any member-facing runtime.