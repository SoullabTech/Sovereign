# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O2R4R1

## FIXTURE CONFORMANCE AUDIT + SUCCESSOR-READINESS DECISION ONLY

**Status:** CONFORMANCE PASS · SUCCESSOR DESIGN READY · NO IMPLEMENTATION AUTHORIZED BY THIS ACT

## Question

> Are the O2R4 descriptors constitutionally coherent enough to design the first source implementation boundary without allowing unresolved capabilities, legacy runtime paths, or metadata completeness to manufacture authority?

## Decision

> **YES — READY FOR A NARROW INERT-REGISTRY IMPLEMENTATION BOUNDARY.**

This is not readiness for member-facing orchestration.
It is not readiness for capability offers.
It is not readiness for invocation.
It is not readiness for entitlement migration.

It is readiness only to admit the descriptive registry contract into source as an inert, non-consuming object with explicit gates.## Mechanical conformance results

O2R4R1 re-ran the descriptor laws against `O2R4_DESCRIPTOR_FIXTURES_v0.2.jsonl`.

Result: **PASS · 0 conformance errors**.

Verified:
- 18/18 O2R2 identities preserved exactly and in order;
- 18/18 unique IDs;
- gate standing = 6 COMPLETE · 5 PARTIAL · 6 UNRESOLVED · 1 WITHHELD;
- lifecycle = 17 DECLARED · 1 WITHHELD;
- exactly 6 true unresolved authority references remain;
- 11 named gap/nonconformance references remain;
- COMPLETE descriptors carry neither gaps nor unknowns;
- PARTIAL descriptors carry gaps and no unknown authority substitutions;
- UNRESOLVED descriptors carry explicit `UNKNOWN:` refs;
- WITHHELD gate and lifecycle agree;
- no descriptor exceeds its O2R4 lifecycle ceiling;
- `researchDependency` and `outputEpistemicStanding` exist on all 18;
- no legacy `researchStatus` remains;
- forbidden ambient-authority fields = 0;
- runtime eligibility = 18/18 `NOT_AUTHORIZED_BY_O2R4`;
- all local resolved authority references point to files that exist.## Custody / mutation check

The whole-organism orchestration directory is currently untracked documentary work in the working tree.

Scoped source-surface inspection found one modified runtime/source file:
- `config/accessMatrix.ts`.

Its diff consists of explicit House/Decisions/Practices access entries labelled `HOUSE-PREFERENCES-01`.

That change belongs to another active development lane and was not created, edited, repaired, staged, reverted, or adopted by O2R4/O2R4R1.

No scoped diff was present in:
- `lib/maia/capabilities.ts`;
- `lib/maia/cognitionEvents.ts`;
- `lib/voice/voiceCommands.ts`;
- `components/OracleConversation.tsx`;
- `app/api/studio/sessions/route.ts`;
- `app/api/studio/personal/enter/route.ts`;
- `lib/auth/getCurrentPractitioner.ts`.

O2R4R1 therefore makes no claim that the repository as a whole is clean.

It establishes only:
> **this orchestration lane has remained documentary; the observed source mutation is external to it.**## Why successor design is now safe

The first implementation can be made non-consequential because the architecture now separates five things that the old registry collapsed:

1. **identity** — what act is being named;
2. **authority references** — what laws apply;
3. **gate standing** — complete / partial / unresolved / withheld;
4. **lifecycle standing** — declared is not wired;
5. **runtime eligibility** — O2R4 grants none.

This means a source registry can exist without becoming an execution router.

Unresolved capabilities do not need to disappear from the ontology.
They can remain legible as unresolved while being mechanically ineligible for runtime consumption.

Likewise, current legacy voice/UI behavior can continue to exist without being silently declared conformant.

That is sufficient separation to begin source admission.## What is NOT successor-ready

The following remain outside any first implementation act:

- member-visible capability suggestions;
- `capability_available` emission;
- `capability-offer` binding/rendering;
- voice-command migration;
- Journal CaptureScope runtime repair;
- Astrology voice migration;
- Shadow member-facing activation;
- Pattern detection runtime;
- Writer's Studio entitlement migration;
- Pro Studio entitlement migration;
- Personal Studio commercial adjudication;
- practitioner booking;
- session-create authority repair;
- Wisdom rights-model implementation;
- accessMatrix changes;
- route/middleware changes.

These are not defects in the readiness ruling.
They are precisely why the first implementation must be inert.## Successor implementation shape

The safe first source act may create only:

### 1. Canonical v2 descriptor types
Source representation of the O2/O2R4 descriptive schema.

### 2. Canonical candidate ID union
The 18 O2R4 identities exactly, including `pattern.detect` as WITHHELD.

### 3. Static descriptor registry
Data equivalent to the v0.2 documentary fixtures.

### 4. Pure structural validator
A validator that can reject malformed descriptors, forbidden authority-grant fields, illegal gate/lifecycle combinations, and missing gate structure.

### 5. Tests
Tests proving identity preservation, unresolved-gate preservation, lifecycle ceilings, namespace separation, and zero runtime adoption.

The act must **not** create an invocation API, availability resolver, entitlement resolver, consent resolver, router, event emitter, or UI consumer.## Legacy coexistence law

The existing `lib/maia/capabilities.ts` is historical runtime-adjacent vocabulary and remains inert as a registry value.

The first implementation must not silently rewrite it because:
- its 13-ID union is type-used by cognition events;
- current voice actions are not actually routed through its registry value;
- several of its IDs are now retired/ambiguous;
- changing that union could convert a documentary migration into an accidental runtime migration.

Therefore the first source act should use a **new source locus** for the v2 descriptive registry.

Legacy IDs may be represented in a compatibility ledger/test fixture only.

They may not alias silently to v2 IDs.

Any later adapter from legacy vocabulary to v2 must be a separate bounded act.

## Candidate source locus

Recommended design target:
`lib/maia/capabilityAuthorityRegistry.ts`

Name is provisional until the implementation act confirms there is no conflicting source object.

The file should export data/types only.
No import of it from member-facing runtime is authorized in the first act.## First-act acceptance conditions

A future implementation candidate must prove all of the following before founder adjudication:

1. 18 canonical IDs, exact set and no duplicates.
2. `pattern.detect` remains WITHHELD.
3. All six unresolved gates remain present verbatim.
4. All named gap/nonconformance refs remain legible.
5. All descriptors default to / preserve no runtime eligibility.
6. COMPLETE does not imply WIRED.
7. No legacy ID silently aliases to a new ID.
8. Existing `lib/maia/capabilities.ts` behavior/value remains unchanged.
9. No `capability_available` or `capability-offer` emission is added.
10. No voice command imports the v2 registry.
11. No route, accessMatrix rule, middleware, entitlement, consent, or member-data path changes.
12. Targeted tests pass.
13. Existing relevant tests remain green.
14. Diff is limited to the new inert registry module + tests + evidence/docs required by the act.

Any breach means the act widened into runtime orchestration and must stop.

## Successor-readiness ruling

> **The constitutional work is now sufficient to begin implementing the registry as inert descriptive infrastructure. It is not sufficient to wire orchestration.**

This is the important threshold.

Until O2R4, putting the registry into source risked turning incomplete semantics into executable architecture.

After O2R4:
- identity is separated from availability;
- authority is separated from metadata;
- unresolved gates fail closed;
- lifecycle is separated from runtime eligibility;
- legacy substrate is separated from canonical identity;
- output epistemic standing is separated from capability research dependency.

That makes a non-consequential source admission possible.

## Standing

> **O2R4R1 — FIXTURE CONFORMANCE PASS · 18/18 IDENTITIES PRESERVED · 0 CONTRACT ERRORS · SOURCE-CUSTODY CHECK COMPLETE · READY FOR INERT REGISTRY SOURCE ADMISSION ONLY · MEMBER-FACING ORCHESTRATION STILL CLOSED**

## Exact next boundary

> **SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O3 — INERT CAPABILITY AUTHORITY REGISTRY v2 SOURCE ADMISSION ONLY**

O3 may:
- create the new descriptive registry source locus;
- admit the exact O2R4 v0.2 identity/descriptor set;
- add pure validation/types;
- add conformance tests;
- record legacy compatibility without aliases.

O3 may **not**:
- consume the registry from runtime;
- emit capability events/offers;
- route voice commands;
- invoke capabilities;
- alter access or entitlements;
- touch member data;
- repair Journal/session/Studio gaps;
- change product behavior.

O3 must stop again for founder adjudication before any consumer or runtime integration is designed.