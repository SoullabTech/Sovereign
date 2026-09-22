# JARVIS-ORCHESTRATION-OPERATOR-01 / O4 — Capability Router Contract + Pre-Implementation Falsifier Instrument

**Date:** 2026-09-22  
**Opening canonical:** `65aca24608b7ed63b44b2ee5d21b3f3ffb62ea79`  
**Class:** B — Structural Risk  
**Standing:** CONTRACT + FALSIFIER INSTRUMENT ONLY · NO O4 RUNTIME IMPLEMENTATION

## 1. Purpose

O4 answers one bounded question:

> Given one valid canonical O3 authority plan, what is the least-powerful lawful capability suitable for each Work Unit?

O4 is a capability-selection boundary, not an execution boundary.

It composes existing canonical routing law. It does not create a second router.

The governing progression is:

```text
O2 planned work
        ↓
O3 canonical minimum-authority plan
        ↓
O4 capability selection
        ↓
STOP
```

## 2. Constitutional distinctions

O4 preserves all of the following as separate facts:

> **CAPABILITY ≠ AUTHORITY**

> **ROUTING ≠ EXECUTION**

> **PROVIDER AVAILABILITY ≠ PERMISSION**

> **RELEASE READINESS ≠ PR / MERGE / DEPLOY / PRODUCTION AUTHORITY**

A technically possible action is not a permitted action.

A route plan is not an execution grant.

A credential, provider, model, adapter, environment variable, or available transport cannot create authority.

## 3. Canonical law reused

O4 composes and may not replace:

- O0 Operator Constitution;
- O1 Intent Contract;
- O2 Work Graph;
- canonical O3 Authority Planner;
- `JARVIS-ROUTING-INTELLIGENCE-01 / J5`;
- canonical J6 pure routing law;
- canonical deterministic capability registry;
- canonical Work Unit and routing vocabulary.

The J6 pure router remains authoritative for:

- deterministic-first selection;
- evidence class;
- task shape;
- model-family eligibility;
- independent-review topology;
- local/external distinction;
- model-family / transport separation;
- external authority blockers;
- response-budget profile;
- `HOLD` behavior.

O4 may add fail-closed consumer checks around canonical inputs. It may not silently rewrite J6 routing semantics.

## 4. O3 consumer boundary

O4 consumes O3 authority evidence; it does not manufacture it.

Before capability selection, O4 must refuse or hold malformed O3 evidence.

At minimum every per-requirement O3 decision must satisfy:

```text
operatorRequired == (decision != CONTINUE)
```

The following is therefore inadmissible:

```text
decision         = NEEDS_OPERATOR_AUTHORITY
operatorRequired = false
```

This is a downstream consumer check, not a replacement for canonical O3 F51–F53 producer law.

## 5. Authority gate dominance

If the relevant O3 Work Unit entry carries any missing semantic minimum authority, or otherwise requires operator authority, O4 must stop at:

`HELD_FOR_AUTHORITY`

or a stricter `HOLD`.

O4 may not route around that gate.

Capability availability, model availability, provider availability, credential presence, prior similar permission, or technical feasibility cannot change the authority result.

## 6. Minimum O4 outcome vocabulary

The O4 capability plan has a closed outcome vocabulary:

- `DETERMINISTIC`
- `ROUTED_LOCAL`
- `EXTERNAL_REVIEW_READY`
- `HELD_FOR_AUTHORITY`
- `HOLD`

Unknown outcomes are refused.

Every successful O4 record must preserve:

```text
granted_authorities    = []
execution_authorized   = false
consequence_effect     = NONE
```

O4 never creates execution, PR, merge, deploy, production, or authority-change power.

## 7. Deterministic first

If an explicit capability is present and exists in the canonical deterministic registry, O4 must preserve J6 deterministic-first law.

A valid deterministic capability may not be bypassed merely because a model route is available.

If an explicit capability identifier is supplied but is unknown, O4 must `HOLD` or refuse it.

It may not normalize an unknown capability into model routing.

## 8. Local before external

Where canonical J6 establishes a valid local topology, O4 preserves that topology.

External review remains eligible only where J6 permits the family and the relevant explicit external permission facts are present.

`LOCAL_ONLY` / `E2_CONTINUITY_LOCAL` evidence cannot become external merely because an external provider is available.

## 9. External authority truth

Provider availability is readiness evidence only.

It cannot substitute for:

- external-network authority;
- provider-spend authority;
- repository-disclosure authority where repository evidence leaves the local boundary.

For an external repository bundle, missing disclosure authority must produce `HOLD`.

For a metered external route, missing provider-spend authority must produce `HOLD`.

## 10. Family / transport integrity

Model family is selected before transport.

O4 must preserve the canonical family and transport produced by J6.

If the selected family is unavailable, O4 may not silently substitute another family.

If the canonical transport is unavailable, O4 may not silently substitute another provider/transport.

Unknown provider/transport identifiers must `HOLD` or be refused.

## 11. Independent review

A retry is not an independent review.

Same-model retry evidence cannot satisfy an independent-review requirement.

O4 may report the canonical review topology; it does not invent reviewer independence.

## 12. No ambient authority inheritance

O4 may carry only authority relevant to the selected capability plan.

Ambient held authorities such as `merge`, `deploy`, or `production.write` are not copied into an unrelated capability record.

Held authority remains evidence. It is never a capability grant.

## 13. Release boundary

`RELEASE_READINESS` is a planning boundary only.

It cannot become:

- `pr.create`;
- `merge`;
- `deploy`;
- `production.write`.

Those remain separately governed consequential acts.

## 14. Pre-implementation instrument

This act deliberately creates no O4 runtime router.

The falsifier harness is test-only.

It imports canonical O3/J6/deterministic vocabulary and asks whether a proposed O4 record is lawful.

It may call the existing pure J6 `planRouting()` as an oracle.

It does not:

- launch a worker;
- call a model;
- read credentials;
- contact a provider;
- mutate a Work Unit;
- acquire execution authority;
- write repository state outside this authorized contract branch.

## 15. Single-proposition defeat-candidate law

Every load-bearing defeat candidate must vary exactly one proposition from a lawful baseline.

The test harness mechanically computes the changed path set and requires:

```text
changed_paths == [authorized_mutation_path]
```

A combined mutant cannot stand in for two separable laws.

This directly incorporates the earlier G2 masking lesson.

## 16. Falsifier matrix

| ID | Single proposition under attack | Required death |
| --- | --- | --- |
| F-O4-01 | O3 authority gate bypassed | `O3_AUTHORITY_GATE_BYPASS` |
| F-O4-02 | route creates authority | `ROUTE_AUTHORITY_GRANT_FORBIDDEN` |
| F-O4-03 | provider availability substitutes for spend authority | `PROVIDER_SPEND_NOT_AUTHORIZED` |
| F-O4-04 | deterministic capability bypassed | `DETERMINISTIC_CAPABILITY_BYPASSED` |
| F-O4-05A | release readiness creates PR authority | `CONSEQUENCE_AUTHORITY_FORBIDDEN` |
| F-O4-05B | release readiness creates merge authority | `CONSEQUENCE_AUTHORITY_FORBIDDEN` |
| F-O4-05C | release readiness creates deploy authority | `CONSEQUENCE_AUTHORITY_FORBIDDEN` |
| F-O4-05D | release readiness creates production-write authority | `CONSEQUENCE_AUTHORITY_FORBIDDEN` |
| F-O4-06 | local-only evidence routes externally | `LOCAL_ONLY_EVIDENCE` |
| F-O4-07 | external repository route lacks disclosure authority | `EXTERNAL_REPOSITORY_DISCLOSURE_NOT_AUTHORIZED` |
| F-O4-08A | selected model family substituted | `MODEL_FAMILY_SUBSTITUTION` |
| F-O4-08B | selected transport substituted | `TRANSPORT_SUBSTITUTION` |
| F-O4-09 | same-model retry credited as independent review | `RETRY_NOT_INDEPENDENT_REVIEW` |
| F-O4-10 | execution bit appears | `EXECUTION_AUTHORITY_FORBIDDEN` |
| F-O4-11 | ambient held authority inherited | `AMBIENT_AUTHORITY_INHERITED` |
| F-O4-12A | unknown explicit capability normalizes into route | `UNKNOWN_EXPLICIT_CAPABILITY` |
| F-O4-12B | unknown provider/transport normalizes into route | `UNKNOWN_REQUESTED_TRANSPORT` |
| F-O4-13 | inconsistent O3 requirement evidence trusted | `O3_REQUIREMENT_DECISION_INCOHERENT` |

## 17. F-O4-13 precision

The O3 consumer-coherence falsifier mutates only the missing `repo.write:worktree` requirement decision:

```text
operatorRequired: true → false
```

The aggregate O3 Work Unit remains gated.

That proves O4 checks the nested authority evidence itself rather than merely inheriting the aggregate stop.

## 18. Allowed artifacts in this act

Exactly these O4 artifacts are permitted:

1. this contract document;
2. one O4 falsifier/test surface;
3. one defeat-candidate fixture surface.

No O4 source/runtime implementation is admitted by this act.

## 19. Not authorized

This contract does not authorize:

- O4 runtime implementation;
- modification of J5/J6 routing law;
- provider execution;
- credential use;
- external network use;
- repository disclosure;
- provider spend;
- Work Unit lifecycle mutation;
- native edit/patch execution;
- O5 Agent Mode;
- O6 Verification Supervisor;
- PR publication;
- merge;
- deployment;
- production mutation.

## 20. Closure condition

O4 contract/falsifier work may close when:

- all lawful baselines are accepted;
- all 18 defeat candidates vary exactly one proposition;
- every defeat candidate dies on its named law;
- O3 consumer coherence is independently checked;
- canonical J6 remains the routing oracle;
- no O4 runtime implementation exists;
- canonical freshness remains exact.

Canonical closure sentence:

> **O4 may determine which lawful capability plan is admissible under an already-governed O3 authority plan. It may not grant authority, execute the plan, or invent routing law.**

## 21. Programme standing at this candidate boundary

- O0 Operator Constitution — CLOSED · CANONICAL
- O1 Intent Contract — CLOSED · CANONICAL
- O2 Work Graph — CLOSED · CANONICAL
- O3 Authority Planner + F51–F53 hardening — CLOSED · CANONICAL
- O4 Capability Router contract/falsifier instrument — candidate under witness
- O4 runtime implementation — NOT OPEN
- O5 Execution Supervisor — NOT OPEN
- O6 Verification Supervisor — NOT OPEN
- O7 Operator Decision Surface — NOT OPEN
- O8 Integration Supervisor — NOT OPEN
- O9 Programme Closure — NOT OPEN
