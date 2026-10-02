# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O7

## CAPABILITY PRESENTATION + UTTERANCE AUTHORITY CONTRACT ONLY

**Status:** DESIGN ONLY · NO HOUSE OR MAIA CONSUMER · NO COPY WIRED · NO OFFER / ROUTING / AVAILABILITY CHANGE

## Governing question

> How may a capability be named or described to a human without that language manufacturing availability, routing, entitlement, or authority?

## Core distinction

> **CAPABILITY IDENTITY ≠ PRESENTATION**

> **PRESENTATION ≠ AVAILABILITY**

> **PRESENTATION ≠ OFFER**

> **PRESENTATION ≠ INVOCATION**

> **PRESENTATION ≠ ROUTE**

A capability may exist canonically without any approved member-facing presentation.## Existing presentation authorities preserved

O7 does not replace existing authored sources.

### House presentation
`lib/house/catalog.ts` remains authoritative for House-place labels, purposes, aliases, visual marks, grouping, and hrefs.

Those strings describe places.
They do not automatically name capability acts.

### MAIA platform facts
`lib/sovereign/platformKnowledge.ts` remains the current authored source of truth for what MAIA may say about SOULLAB areas and their platform status.

O7 may not silently add capability facts to MAIA by creating presentation records.

### Legacy capability labels
`lib/maia/capabilities.ts` labels and voice phrases are historical runtime-adjacent vocabulary.

They are not accepted as v2 presentation authority merely because they are human-readable.## Presentation standing

O7 defines four presentation states.

### `APPROVED`
Human-facing name and purpose text have been deliberately authored and accepted for the capability.

APPROVED means only:
> the capability may be described using this copy in a separately-authorized presentation context.

It does not mean available, open, entitled, routed, or invokable.

### `PURPOSE_ONLY`
The act may be described by purpose, but no short capability name is yet approved.

This is useful where a label would prematurely solidify ambiguous semantics.

### `WITHHOLD`
The capability must not be surfaced as a member-facing capability.

`pattern.detect` is expected to remain WITHHOLD while its runtime capability remains WITHHELD.

### `UNRESOLVED`
Human-facing copy has not yet earned standing.

No fallback label may be invented.## Proposed presentation record

```ts
type CapabilityPresentationStanding =
  | 'APPROVED'
  | 'PURPOSE_ONLY'
  | 'WITHHOLD'
  | 'UNRESOLVED'

interface CapabilityPresentationRecord {
  capabilityId: CapabilityAuthorityId
  standing: CapabilityPresentationStanding
  name?: string
  purpose?: string
  sourceRefs: readonly string[]
}
```

Shape laws:
- `APPROVED` requires both `name` and `purpose`;
- `PURPOSE_ONLY` requires `purpose` and forbids `name`;
- `WITHHOLD` and `UNRESOLVED` carry neither member-facing name nor purpose;
- every APPROVED/PURPOSE_ONLY record carries authored source references.## Authorship law

> **Presentation copy must be authored, never inferred.**

Forbidden derivations include:
- title-casing `capabilityId`;
- reusing legacy `CAPABILITY_REGISTRY.label` automatically;
- copying `HOUSE_PLACES.label` or `purpose` automatically;
- generating copy from topology relation;
- generating copy from economic class;
- generating copy from lifecycle/gate standing;
- asking a model to invent a label at runtime.

A future authoring act may deliberately choose the same words as House or legacy copy, but that equivalence must be explicit and reviewable.

## Utterance-context law

An approved presentation record is not globally speakable.

A later consumer contract must name the context in which it may be used.

Initial context vocabulary for future acts:
- `EXPLICIT_PLATFORM_ORIENTATION` — member asks what SOULLAB can do / what an area is for;
- `EXPLICIT_CAPABILITY_INQUIRY` — member directly asks about an identified act;
- `PROACTIVE_SUGGESTION` — **not authorized by O7**.

O7 itself authorizes no runtime context.## No availability implication

Member-safe copy must avoid phrases that imply current access unless that fact comes from a separate current-access authority.

Forbidden presentation implications include:
- “you can use…”;
- “available to you…”;
- “open now…”;
- “your Studio…”;
- “tap here…”;
- “I can do that for you…”;
- “let me…” when it implies execution.

Safe presentation is capability-purpose language, for example:
> “Journal capture is for preserving something you want to keep in your Journal.”

That sentence still does not claim the current member can invoke it from the present context.

## No route implication

Presentation records contain no href, route, modal, button, voice phrase, or navigation instruction.

Navigation truth remains separately governed.## No offer implication

Presentation may answer an explicit informational question without becoming a suggestion.

Therefore a future presentation consumer must distinguish:

```text
describe capability
≠
offer capability
```

Naming a capability after an explicit question is not permission to append:
> “Would you like me to do that?”

Offer grammar requires a later suggestion-authority act.

## No member-state implication

Presentation records are static and member-independent.

They do not contain:
- member tier;
- role;
- entitlement;
- eligibility;
- preferences;
- current room;
- consent state;
- data state.

Any member-relative statement must come from another authorized source.## Relationship to platformKnowledge

`platformKnowledge.ts` currently governs MAIA's authored platform-area truth.

O7 does not supersede it.

Before MAIA can consume capability presentation, a later reconciliation must determine:
- which capability presentations are already faithfully represented in platform knowledge;
- where platform knowledge is stale relative to the current House/product state;
- whether capability-level language belongs in platform knowledge at all;
- how availability claims remain evidence-bound.

Observed reason this matters:
- House currently contains newer place architecture under active development;
- platformKnowledge is last verified 2026-08-28;
- legacy capability labels still reflect older `patterns`, `depth`, and generic `studio` semantics.

Therefore runtime composition would be premature.## Presentation invariants

### O7-L01 — Authored copy only
No presentation text may be synthesized from IDs or adjacent registries.

### O7-L02 — Standing-shape integrity
APPROVED/PURPOSE_ONLY/WITHHOLD/UNRESOLVED obey their field-shape laws.

### O7-L03 — Presentation non-authority
Presentation standing does not alter lifecycle, authority-gate standing, or runtime eligibility.

### O7-L04 — No access semantics
Presentation carries no tier, role, entitlement, eligibility, or availability.

### O7-L05 — No routing semantics
Presentation carries no route, href, modal, button, or voice phrase.

### O7-L06 — No offer semantics
Presentation text contains no suggestion or execution commitment.

### O7-L07 — WITHHELD dominance
A capability whose canonical lifecycle is WITHHELD cannot have APPROVED or PURPOSE_ONLY presentation.

### O7-L08 — Unresolved honesty
UNRESOLVED copy may not fall back to House or legacy labels.

### O7-L09 — House non-inheritance
Capability-to-place topology does not confer House label/purpose copy.

### O7-L10 — MAIA authored-truth preservation
Capability presentation cannot enter MAIA runtime until reconciled with current platformKnowledge authority.

### O7-L11 — No member context
Presentation records are static and member-independent.

### O7-L12 — Description is not offer
A presentation consumer may not automatically append a suggestion/CTA.

## Falsifier matrix

| ID | Forbidden proposition | Required failure |
| --- | --- | --- |
| F-O7-01 | title-case ID into a label | `PRESENTATION_INFERENCE_FORBIDDEN` |
| F-O7-02 | copy legacy label automatically | `LEGACY_COPY_NOT_AUTHORITY` |
| F-O7-03 | copy House label automatically | `HOUSE_COPY_NOT_CAPABILITY_COPY` |
| F-O7-04 | APPROVED record missing purpose | `PRESENTATION_SHAPE_INVALID` |
| F-O7-05 | UNRESOLVED record carries fallback label | `UNRESOLVED_MUST_REMAIN_UNAUTHORED` |
| F-O7-06 | presentation includes economic/access state | `PRESENTATION_ACCESS_SEMANTICS_FORBIDDEN` |
| F-O7-07 | presentation includes route/href | `PRESENTATION_ROUTING_FORBIDDEN` |
| F-O7-08 | copy says “available to you” | `PRESENTATION_NOT_AVAILABILITY` |
| F-O7-09 | copy appends “want me to do that?” | `PRESENTATION_NOT_OFFER` |
| F-O7-10 | WITHHELD pattern.detect gets member-facing copy | `WITHHELD_PRESENTATION_FORBIDDEN` |
| F-O7-11 | presentation varies by member tier | `PRESENTATION_NOT_MEMBER_RELATIVE` |
| F-O7-12 | presentation imported into MAIA before reconciliation | `PLATFORM_KNOWLEDGE_RECONCILIATION_REQUIRED` |

## Behavioral ruling

> **O7 authorizes no observable member behavior.**

It creates the missing linguistic membrane so a later act can safely choose a tiny behavioral consumer.

The likely first behavioral candidate after O7 is not proactive suggestion.

The lowest-consequence candidate is:
> **explicit platform-orientation description in response to a member's direct question**

but even that remains closed until:
1. presentation fixtures are authored;
2. platformKnowledge reconciliation is complete;
3. availability wording is separately bounded.

## Standing

> **O7 DESIGN — PRESENTATION / UTTERANCE AUTHORITY SEPARATED FROM IDENTITY, PLACE, AVAILABILITY, ROUTING, AND OFFERING · AUTHORED-COPY CONTRACT DEFINED · NO BEHAVIORAL CONSUMER AUTHORIZED**

## Exact next boundary

> **SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O7R1 — CAPABILITY PRESENTATION STANDING CENSUS + AUTHORED-COPY FIXTURE DESIGN ONLY**

O7R1 should:
- classify all 18 capability identities as APPROVED / PURPOSE_ONLY / WITHHOLD / UNRESOLVED candidates;
- trace any proposed copy to current authored sources;
- refuse automatic reuse of legacy or House labels;
- identify where new founder-authored copy is required;
- compare candidate statements against current `platformKnowledge.ts` without mutating it.

O7R1 may not:
- add production presentation source;
- alter House copy;
- alter platformKnowledge;
- wire MAIA or House;
- add offers, routes, or availability logic;
- change member-visible behavior.