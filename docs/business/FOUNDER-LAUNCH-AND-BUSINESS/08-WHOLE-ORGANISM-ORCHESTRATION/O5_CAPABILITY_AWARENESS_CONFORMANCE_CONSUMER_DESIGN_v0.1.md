# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O5

## CAPABILITY AWARENESS CONFORMANCE CONSUMER — DESIGN ONLY

**Status:** DESIGN ONLY · CONSTITUTIONAL TEST/TOOLING RECIPIENT ONLY · NO RUNTIME OR MEMBER-FACING CONSUMER

## Governing question

> What may change simply because a subsystem now knows the capability-awareness map?

## Founder answer

> **Only our evidence about whether the system remains coherent.**

The first recipient is the constitutional conformance layer.

It may receive awareness in order to answer:
- did the canonical capability ontology drift?
- did a WITHHELD capability disappear or get normalized?
- did a capability change species/domain/lifecycle without adjudication?
- did awareness acquire operational semantics it is forbidden to carry?

It may not answer:
- what should the member see?
- what should MAIA suggest?
- where should House route?
- who is entitled?
- what may execute?

## Working name

> **Capability Awareness Conformance Matrix**## Input contract

The consumer accepts only:

```ts
readonly CapabilityAwarenessRecord[]
```

It does not accept:
- `CapabilityAuthorityDescriptor[]`;
- member identity;
- accessMatrix;
- entitlement state;
- consent state;
- current route;
- conversation;
- memory;
- model output;
- runtime availability.

The runner that constructs the awareness set may use the already-authorized pure projection, but the conformance laws themselves operate only on awareness records.

## Output contract

```ts
interface CapabilityAwarenessLawResult {
  lawId: string
  ok: boolean
  detail: string
}
```

The output is evidence.

It carries no repair instruction and no action token.## Permitted effects

A conformance runner may:
- print evidence;
- fail a test;
- exit non-zero;
- record which law failed;
- preserve a witness artifact for founder/operator review.

It may not:
- edit files;
- generate a patch;
- call a model;
- call a database;
- call an API;
- update a registry;
- suppress a capability;
- change route/navigation data;
- modify CI configuration in this act;
- mutate product state.

> **Detection is permitted. Self-repair is not.**

## Initial semantic laws

### O5-L01 — Identity completeness
The awareness set contains exactly the canonical 18 v2 identities, once each.

### O5-L02 — Order custody
Canonical registry order remains unchanged.

Order has no ranking semantics; this law exists only to detect unadjudicated rewriting of the frozen set.

### O5-L03 — WITHHELD legibility
`pattern.detect` exists, remains `WITHHELD`, and remains species `integrative_field`.### O5-L04 — Journal family custody
`journal.create`, `journal.save`, and `journal.dream` remain in domain `journal` and species `modal_action`.

### O5-L05 — Astrology family custody
`astrology.reading`, `astrology.transit.current`, and `astrology.transit.personal` remain in domain `astrology` and species `room`.

### O5-L06 — Wisdom differentiation
- `wisdom.open` remains a `portal`;
- `wisdom.surface` remains a `portal`;
- `wisdom.text.open` remains an `archive`.

This protects the O2 ruling that orientation and specific-source opening are not one act.

### O5-L07 — Relationship object custody
`relationship.reflect` remains domain `relationships`, species `room`.

### O5-L08 — Shadow naming custody
`shadow.open` remains the canonical awareness identity.

Legacy `depth.shadow` must not appear in the awareness set.

### O5-L09 — Studio differentiation
- `studio.choose` remains a `transition`;
- `studio.writer.open`, `studio.personal.open`, `studio.pro.open` remain `studio` species;
- `studio.session.create` remains `studio` species.

This prevents the old generic `studio.transition` shape from silently returning.### O5-L10 — Booking differentiation
`booking.practitioner.request` remains a `utility`, not a Studio/session-create alias.

### O5-L11 — Research-dependency custody
The awareness layer preserves static research dependency exactly as projected.

The conformance consumer may compare against the ratified current topology, but may not infer output truth standing from that field.

### O5-L12 — No operational awareness
No record may contain fields or semantics named:
- available;
- enabled;
- eligible;
- allowed;
- canInvoke;
- route;
- label;
- economicClass;
- consent;
- readScopes;
- writeScopes;
- membranes;
- runtimeEligibility.

### O5-L13 — No legacy identities
The awareness set contains none of:
- `astrology.transit`;
- `pattern.show`;
- `wisdom.text`;
- `depth.shadow`;
- `studio.transition`;
- `schedule.create`;
- documentary-only retired `depth.explore`.

### O5-L14 — No member-relative result
Law output contains no member identifier, role, tier, entitlement, or personalized availability state.## Why these laws are safe

They judge only the **shape of the ontology already ratified**.

They do not decide whether the ontology is correct forever.

If the founder later changes a capability identity, domain, species, or research dependency, the correct response is:

```text
matrix fails
→ named founder adjudication changes the law
→ matrix/reference is deliberately succeeded
```

not:

```text
matrix fails
→ runtime adapts itself
```

## House / MAIA boundary

O5 deliberately does not compare awareness to `GOVERNED_ROOMS` yet.

Why:
- House's governed-room registry affects real MAIA place context and handle visibility;
- not every capability is a House room;
- a capability-domain mismatch is not automatically a routing defect;
- joining the two ontologies requires its own relationship contract.

Likewise, O5 does not import awareness into `cognitionEvents.ts`.

Awareness-to-House and awareness-to-MAIA remain later, separate design acts.## Falsifier matrix

| ID | Mutation under test | Required failure |
| --- | --- | --- |
| F-O5-01 | drop one canonical ID | `IDENTITY_COMPLETENESS` |
| F-O5-02 | duplicate an ID | `IDENTITY_COMPLETENESS` |
| F-O5-03 | reorder two IDs | `ORDER_CUSTODY` |
| F-O5-04 | change `pattern.detect` to DECLARED | `WITHHELD_LEGIBILITY` |
| F-O5-05 | change `pattern.detect` species to room | `WITHHELD_LEGIBILITY` |
| F-O5-06 | collapse personal/current astrology transit identity | `ASTROLOGY_FAMILY_CUSTODY` |
| F-O5-07 | change `wisdom.text.open` to portal | `WISDOM_DIFFERENTIATION` |
| F-O5-08 | reintroduce `depth.shadow` | `NO_LEGACY_IDENTITIES` |
| F-O5-09 | collapse Studio chooser into Studio species | `STUDIO_DIFFERENTIATION` |
| F-O5-10 | relabel booking as Studio act | `BOOKING_DIFFERENTIATION` |
| F-O5-11 | add `available=true` to awareness | `NO_OPERATIONAL_AWARENESS` |
| F-O5-12 | add `economicClass` to awareness | `NO_OPERATIONAL_AWARENESS` |
| F-O5-13 | consumer accepts member context | `NO_MEMBER_RELATIVE_RESULT` |
| F-O5-14 | consumer imports accessMatrix / place / cognition runtime | `CONFORMANCE_RUNTIME_COUPLING_FORBIDDEN` |

Every defeat candidate should vary one proposition where practical.

Collateral failures must be named rather than silently tolerated.

## Proposed source shape — future act only

Test/governance locus:

`tests/constitutional/whole-organism-orchestration/capability-awareness/`

Candidate files:
- `contract.ts` — pure laws over `CapabilityAwarenessRecord[]`;
- `candidates.ts` — reference + single-proposition defeat candidates;
- `matrix.ts` — evidence runner.

The matrix runner may construct awareness by:

```text
O3 registry
→ O4 projector
→ O5 law functions
```

but O5 law functions themselves receive awareness only.

No production source file needs to import the O5 consumer.

## What may change because it knows

Exactly:

```text
constitutional evidence: PASS ↔ FAIL
process exit code:       0 ↔ non-zero
founder/operator review: no issue ↔ named drift
```

Nothing else.

## Standing

> **O5 DESIGN — FIRST BEHAVIORAL CONSEQUENCE OF CAPABILITY AWARENESS LIMITED TO CONSTITUTIONAL EVIDENCE · CONFORMANCE MATRIX CONTRACT DEFINED · HOUSE / MAIA / ACCESS / ROUTING STILL CLOSED**

## Exact next boundary

> **SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O5R1 — CAPABILITY AWARENESS CONFORMANCE MATRIX SOURCE ADMISSION ONLY**

O5R1 may:
- add the test-only contract;
- add reference and defeat candidates;
- add the constitutional matrix runner;
- run it and record evidence.

O5R1 may not:
- edit production source;
- import awareness into House or MAIA;
- change package scripts or CI without separate authorization;
- repair any matrix failure automatically;
- alter product behavior.

It must stop for founder adjudication before any behavioral subsystem is allowed to receive awareness.