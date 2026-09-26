# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O2R4

## DESCRIPTOR REFERENCE RECONCILIATION + UNRESOLVED-GATE CONTRACT ONLY

**Status:** DOCUMENTARY RECONCILIATION · NO SOURCE IMPLEMENTATION · NO RUNTIME CONSUMER · NO ACCESS OR ENTITLEMENT CHANGE

## Purpose

O2R4 converts the O2R3 authority census into a durable descriptor-gating model.

It does four things only:
1. replaces genuinely resolved `UNKNOWN:` references with real authorities;
2. represents partial items as governing law plus explicit named gaps;
3. preserves genuinely unresolved authority as `UNKNOWN:`;
4. separates static research dependency from dynamic output epistemic standing.

> **Descriptor completeness is not runtime authority.**

Every O2R4 descriptor explicitly carries:
`runtimeEligibility = NOT_AUTHORIZED_BY_O2R4`.## Authority reference structure

Each descriptor now carries:

```text
authority.resolvedRefs
authority.gapRefs
authority.unknownRefs
authorityGateStanding
runtimeEligibility
```

### `resolvedRefs`
Existing authorities or verified implementation evidence that genuinely answer a contract question.

A resolved reference proves only the proposition it governs.
It does not prove runtime conformance.

### `gapRefs`
Known missing enforcement, contradiction, migration, or implementation obligation.

Gap prefixes currently used:
- `GAP:` — missing policy/enforcement/reconciliation;
- `NONCONFORMANCE:` — runtime behavior conflicts with accepted law;
- `CONFLICT:` — two legitimate authorities/policies currently disagree.

A gap is not an UNKNOWN. The problem is known and named.### `unknownRefs`
A governing authority is genuinely absent or insufficient.

`UNKNOWN:` must never be interpreted as:
- permissive;
- inherited from a nearby capability;
- supplied by current route behavior;
- supplied by product tier;
- supplied by role;
- supplied by model confidence.

Unknown remains unknown until a separate adjudication creates or locates adequate authority.

## Authority-gate standing

### COMPLETE
All currently required authority questions represented by this descriptor have governing references and no named gaps.

**COMPLETE still does not authorize wiring.**

### PARTIAL
No governing authority is genuinely unknown, but one or more named gaps/nonconformances remain.

A PARTIAL descriptor is blocked from registry-driven member execution until the relevant gap is discharged and separately witnessed.

### UNRESOLVED
At least one required authority question remains `UNKNOWN:`.

An UNRESOLVED descriptor is blocked from registry-driven offer, invocation, and execution when the unknown bears on the proposed act.### WITHHELD
The capability identity is deliberately retained but is not eligible for member-facing invocation.

`pattern.detect` remains WITHHELD even though its epistemic primitive is now resolved.

Withholding may arise because implementation prerequisites, evidence, safety, or product authority remain unopened.

## Gate law

> **A missing authority may never be filled by adjacency.**

Specifically:
- a route that currently works cannot fill an entitlement UNKNOWN;
- an active practitioner-shaped row cannot fill a professional-role UNKNOWN;
- a corpus source being retrievable cannot fill a source-rights UNKNOWN;
- research architecture cannot fill member-facing product authority;
- a nearby UI action cannot fill a missing consent contract;
- current business intent cannot rewrite current route law.

## Lifecycle ceiling law

O2R4 establishes a documentary ceiling for future registry implementation:

| Gate standing | Maximum registry lifecycle without new adjudication |
| --- | --- |
| COMPLETE | DECLARED — implementation act still required |
| PARTIAL | DECLARED |
| UNRESOLVED | DECLARED |
| WITHHELD | WITHHELD |

No O2R4 descriptor may become WIRED, WITNESSED, or PRODUCTION by metadata promotion alone.## Runtime coexistence law

Some capabilities already have legacy/current runtime paths outside the registry.

O2R4 does not disable, endorse, or silently adopt those paths.

Examples:
- voice Journal save/dream;
- voice astrology transits;
- Studio navigation;
- current Studio/session surfaces.

These are recorded as **existing substrate**.

When a future implementation binds them to the registry, it must prove:
1. semantic identity matches;
2. authority scope matches;
3. consent mode matches;
4. read/write scopes match;
5. acknowledgment and failure behavior match;
6. unresolved gates are closed.

> Existing execution does not grandfather itself into registry conformance.

## Unresolved-gate classes

### RIGHTS gate
Applies where SOULLAB may retrieve, quote, display, or redistribute source material.

Current instance:
- `wisdom.text.open` → `UNKNOWN:source-rights-policy`.### PRODUCT-CONSTITUTION gate
Applies where a member-facing environment lacks a governing product constitution.

Current instance:
- `shadow.open` → `UNKNOWN:current-shadow-constitution`.

The research-shadow charter cannot satisfy this gate because it explicitly carries member-facing authority NONE.

### ENTITLEMENT gate
Applies where future economic architecture conflicts with current access authority or lacks an enacted entitlement contract.

Current instances:
- `studio.writer.open` → `UNKNOWN:writers-studio-entitlement-policy`;
- `studio.pro.open` → `UNKNOWN:pro-studio-entitlement-policy`.

Current `accessMatrix` remains current authority until separately migrated.

### PRODUCT-STATUS gate
Applies where substrate exists but product/economic distinctness has not been adjudicated.

Current instance:
- `studio.personal.open` → `UNKNOWN:personal-studio-product-status`.

### EXTERNAL-EFFECT gate
Applies where an act could create booking, calendar, payment, messaging, or other off-object effects without a complete governing contract.

Current instance:
- `booking.practitioner.request` → `UNKNOWN:booking-external-effect-policy`.## Partial-gap classes currently recorded

### Journal capture scope
- `journal.create` — universal create/write policy incomplete;
- `journal.save` — fixed-last-five runtime conflicts with O2R2 scope law;
- `journal.dream` — same nonconformance for dream capture.

### Studio threshold / role
- `studio.choose` — current Personal/Practice chooser does not yet model Writer/Personal/Pro ecosystem;
- `studio.pro.open` — Personal Studio's practitioner-shaped substrate prevents practitioner-row existence from proving Pro role.

### Session creation
`studio.session.create` has real practitioner-side substrate but still owes:
- client-ownership proof/enforcement;
- explicit notification/calendar external-effect authority;
- Pro role/context reconciliation.

## Resolved authority references now carried directly

### Astrology
- `docs/design/contracts/astrology.md`;
- `docs/canon/SYMBOLIC_GUIDANCE_LAYER_DOCTRINE.md`.

### Wisdom provenance/retrieval
- `docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md`;
- `docs/canon/CORPUS_WEIGHTING_SCHEMA_v1.0.md`.

### Relationships
- `docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md`.

### Pattern
- `docs/canon/PATTERN_PRIMITIVE.md`.## Epistemic-standing split

O2R4 replaces the old single `researchStatus` fixture field with two documentary concepts.

### `researchDependency`
Static property of the capability itself.

Current vocabulary:
- `NONE`;
- `SOURCE_GOVERNED`;
- `INTERPRETIVE_STANDING_REQUIRED`;
- `HYPOTHESIS_DEPENDENT`;
- `UNKNOWN`.

### `outputEpistemicStanding`
Dynamic policy for the particular result or material presented during an invocation.

It may be:
- `NONE` — no special output standing contract required;
- `DYNAMIC` — standing must be determined from the actual source/output and cited policy refs.

This is load-bearing for Wisdom, Astrology, Relationships, Pattern, and future Lab-derived capabilities.

> A capability can be production-ready while a particular output remains low-standing, contested, traditional, symbolic, or hypothetical.

The capability descriptor must never collapse those two questions.## Economic/current-access separation

`economicClass` remains descriptive product architecture.

It is not current entitlement enforcement.

For Writer's Studio and Pro Studio in particular:
- current access policy remains in `config/accessMatrix.ts`;
- future Studio economics remain in business architecture;
- unresolved entitlement gates prevent the registry from pretending those have already converged.

No O2R4 fixture changes `accessMatrix.ts`.

## O2R4 falsifiers

| ID | Forbidden behavior | Required refusal |
| --- | --- | --- |
| F-O2R4-01 | COMPLETE descriptor treated as runtime-authorized | `DESCRIPTOR_NOT_EXECUTION_AUTHORITY` |
| F-O2R4-02 | PARTIAL descriptor wired with open gap | `AUTHORITY_GAP_OPEN` |
| F-O2R4-03 | UNRESOLVED descriptor uses nearest policy as substitute | `UNRESOLVED_AUTHORITY_GATE` |
| F-O2R4-04 | WITHHELD capability offered to member | `CAPABILITY_WITHHELD` |
| F-O2R4-05 | current route access treated as future entitlement law | `CURRENT_ACCESS_NOT_FUTURE_ENTITLEMENT` |
| F-O2R4-06 | practitioner-shaped row treated as sufficient Pro role | `INFRASTRUCTURE_ROLE_NOT_SEMANTIC_ROLE` |
| F-O2R4-07 | retrievable source treated as rights-cleared | `RETRIEVABLE_NOT_RIGHTS_CLEARED` |
| F-O2R4-08 | research charter used as member-facing product authority | `RESEARCH_NOT_PRODUCT_AUTHORITY` |
| F-O2R4-09 | static research dependency used as output truth standing | `CAPABILITY_STATUS_NOT_OUTPUT_STANDING` |
| F-O2R4-10 | legacy runtime self-adopts into registry | `LEGACY_RUNTIME_REQUIRES_CONFORMANCE` |## Closure conditions

O2R4 is complete when:
1. the v0.2 fixture set contains the same 18 identities as O2R2;
2. every resolved O2R3 authority is carried as a real reference;
3. every partial item has a named gap/nonconformance;
4. all six unresolved authority types remain visible as `UNKNOWN:`;
5. every descriptor has an authority-gate standing;
6. every descriptor explicitly states `NOT_AUTHORIZED_BY_O2R4`;
7. static research dependency is separated from dynamic output standing;
8. no runtime/access/entitlement/source code is changed.

## Standing

> **O2R4 — DESCRIPTOR REFERENCES RECONCILED DOCUMENTARILY · UNRESOLVED-GATE CONTRACT DEFINED · STATIC RESEARCH DEPENDENCY SEPARATED FROM DYNAMIC OUTPUT STANDING · NO RUNTIME AUTHORITY GRANTED**

## Exact next boundary

> **SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O2R4R1 — FIXTURE CONFORMANCE AUDIT + SUCCESSOR-READINESS DECISION ONLY**

O2R4R1 should mechanically verify identity preservation, reference existence, gate counts, lifecycle ceilings, and absence of runtime/source mutations before deciding whether the programme is ready to design its first implementation act.