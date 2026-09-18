# JARVIS-ROUTING-INTELLIGENCE-01 · J6-WORK-UNIT-INTEGRATION-02 / I1 Witness

**Date:** 2026-09-18
**Authorization:** I1 VERSIONED CORE + ROUTE/TRANSPORT BINDING ONLY
**Canonical base:** `caddb904c7cfddcec0da0888a98bfb8795ae23d2`
**Contract:** `J6-WORK-UNIT-INTEGRATION-CONTRACT-01_2026-09-18.md`
**Implementation status:** bounded candidate, not PR/merge/deploy authorized

## 1 · Scope implemented

I1 adds only new versioned canonical modules:

- `scripts/builder/work-unit-v2.mjs`
- `scripts/builder/work-unit-lifecycle-v2.mjs`
- `scripts/builder/routing-intelligence-j5-v1.mjs`
- `scripts/builder/work-unit-routing-v2.mjs`
- `scripts/builder/work-unit-transport-v1.mjs`

and pure deterministic proof suites.

Historical W0.v1 / W2.v1 / W3.v1 / W4.v1 modules remain untouched.

I1 does not implement:

- W4.v2;
- durable-result mapping into W4.v2;
- Desktop convergence;
- compatibility-adapter migration;
- provider execution connector;
- credential access;
- external network execution;
- repository execution;
- PR/merge/deploy/production/schema/member-facing MAIA changes.

## 2 · W0.v2

W0.v2 makes the following authorized-core facts explicit:

### J5 task shape

Exactly:

- CODE_GROUNDED
- ARCHITECTURE_REASONING
- ADVERSARIAL_FALSIFICATION
- LONG_HORIZON_DECOMPOSITION
- EVIDENCE_SYNTHESIS
- FRONTIER_UNKNOWN

Historical `mechanical_code` / `deep_reasoning` are refused rather than silently reinterpreted.

### Deterministic capability

`identity.capability` is null or an exact nonblank capability name.

### Custody

`custody.evidence_class` is exactly one of E0-E4.

### Routing request

Immutable authorized intent contains:

- requested_posture;
- review_pressure.

### R5A future-owned routing domain

W0.v2 begins with:

- no route record;
- no route digest;
- no route source;
- no bound SHA;
- `execution_connected:false`;
- no primary/challengers;
- no transport bindings.

## 3 · W2.v2

W2.v2 remains the sole lifecycle-transition authority.

Its authorized-core snapshot now additionally includes:

- identity.capability;
- custody;
- routing_request.

Therefore task shape, capability, custody class, routing posture, and review pressure cannot change after AUTHORIZED without supersession.

The lifecycle spine remains:

```text
DRAFT → BOUNDED → AUTHORIZED → ROUTED → EXECUTING
      → EVIDENCE_READY → ADJUDICATED → CLOSED
```

with STOPPED / RETURNED / SUPERSEDED exits.

### ROUTED → EXECUTING

For a model route, every route participant marked `required_for_completion:true` must have exactly one active governed transport binding whose:

- participant id;
- model family;
- role

match the route and whose readiness is READY or route-authorized MANUAL_ONLY.

HOLD does not admit execution.

A superseded READY binding is not active if a newer HOLD binding supersedes it.

A deterministic route requires no model binding but the route capability must exactly match the authorized Work Unit capability.

### Important R4/R5A boundary

I1 lifecycle admission is **not a provider execution connector**.

Current canonical R4/R5A remain authoritative for future real provider execution, including provider-specific execution authorization and immutable route-integrity admission.

I1 creates no `provider.execute:*` authority and connects no model call.

A future execution connector must satisfy both the canonical lifecycle state and the separately governed execution-admission membrane.

## 4 · J5.v1 cognitive router

The new canonical cognitive route module is import-free and provider-free.

It selects:

- deterministic capability vs model reasoning;
- model family;
- role;
- review topology;
- evidence posture;
- required external authority;
- response-budget provenance.

It never selects provider id as cognitive identity.

It never grants authority.

Every model route participant has a stable `participant_id`.

### CODE_GROUNDED

- primary / QWEN / required;
- local-review-1 / GPT_OSS / required.

Nemotron is refused for CODE_GROUNDED.

### ARCHITECTURE_REASONING

- primary / GPT_OSS / required;
- local-review-1 / QWEN / required.

### EVIDENCE_SYNTHESIS

- primary / GPT_OSS / required;
- local-review-1 / QWEN / required.

Explicit external challengers preserve the J3 evidence-backed eligibility matrix.

### Custody

- E2 cannot externalize;
- E4 may remain local but is refused for external routing;
- E1 repository material becomes E3 for the exact external crossing.

### Budgets

The J3-B-R1 bounded profiles remain provenance:

- Inkling Tinker: 4096 / no auto-expand;
- Nemotron Tinker: 4096 / no auto-expand;
- Qwen local: adapter-managed;
- GPT-OSS local: adapter-managed, low-reasoning posture.

## 5 · W3.v2

W3.v2 binds only AUTHORIZED W0.v2/W2.v2 envelopes.

It derives the routing input only from canonical Work Unit fields.

It preserves:

- read-only route narrowing;
- deterministic replay;
- authority(route) subset of authority(Work Unit);
- W2 ownership of AUTHORIZED → ROUTED;
- R5A route digest;
- route version;
- route source;
- exact base SHA;
- `execution_connected:false`.

The v2 route source is:

`J5.v1-pure-router`

W3.v2 never writes lifecycle state directly.

## 6 · W3T.v1

W3T is the new governed family → transport bridge.

It is pure and append-only.

It operates only on ROUTED W0.v2/W2.v2 envelopes with valid immutable route integrity.

It validates the route participant before binding exact:

- provider id;
- model id;
- adapter id;
- transport posture;
- execution mode;
- response-budget profile;
- evidence class;
- authority projection;
- readiness evidence.

Current governed mappings in I1 are intentionally narrow and evidence-backed:

- QWEN → qwen-local / qwen3-coder:30b;
- GPT_OSS → gpt-oss-local / gpt-oss:20b;
- INKLING → inkling-tinker / Inkling-Small;
- NEMOTRON repository-grounded → nemotron-tinker / Nemotron 3.5 Lightning;
- NEMOTRON text-only manual → nemotron-zen / manual-only posture.

W3T cannot change model family.

A Nemotron participant cannot silently become Inkling.

### Append-only supersession

A participant with an active binding cannot be rebound without explicit `supersedes_binding_id`.

The old binding remains in history.

Only the non-superseded latest binding is active.

## 7 · Required 18-mutant falsification matrix

All 18 authorized falsifiers pass:

1. W0.v1 not silently treated as W0.v2;
2. task shape mutation after AUTHORIZED refused;
3. capability mutation refused;
4. custody mutation refused;
5. routing-request mutation refused;
6. deterministic capability cannot route to a model;
7. E2 cannot externalize;
8. E4 cannot externalize;
9. E1 external crossing becomes E3;
10. Nemotron CODE_GROUNDED refused;
11. CODE_GROUNDED requires GPT-OSS independent local review;
12. route authority exceeding Work Unit authority refused;
13. transport binding to absent family/participant refused;
14. silent family substitution refused;
15. HOLD binding cannot admit EXECUTING;
16. superseded binding is not active;
17. W3 cannot write ROUTED directly;
18. W2 cannot admit EXECUTING without all required bindings.

Result:

**18 / 18 PASS**

## 8 · New I1 proof population

- W0.v2 schema: 12 / 12
- W2.v2 lifecycle: 13 / 13
- J5.v1 routing: 14 / 14
- W3.v2 route binding: 11 / 11
- W3T.v1 transport binding: 11 / 11
- I1 falsification matrix: 18 / 18

Total new I1 assertions:

**79 / 79**

## 9 · Historical compatibility

Untouched canonical v1 proofs remain green:

- W1 / W0.v1: 22 / 22
- W2.v1: 27 / 27
- W3.v1: 28 / 28
- W4.v1: 31 / 31
- W5.v1: 22 / 22

Current canonical routing/admission/integrity also remain green:

- R1 routing: 20 / 20
- R4 execution admission: 24 / 24
- R5A immutable binding: 20 / 20

No v1 semantics were modified by I1.

## 10 · Broader regression

Full canonical JARVIS proof:

**253 assertions / 0 failures**

TypeScript no-regression:

- program files: 4379;
- diagnostics: 229;
- baseline: 239;
- regressions: 0.

Scripts TypeScript remains repository-red at 40 diagnostics.

Diagnostics on I1 paths:

**0**

## 11 · Synthetic I1 composition

The durable fixture proves:

```text
W0.v2 DRAFT
  ↓
W2.v2 BOUNDED
  ↓
W2.v2 AUTHORIZED
  ↓
W3.v2 J5.v1 ROUTED
    primary QWEN
    required review GPT_OSS
    route digest persisted
  ↓
W3T READY Qwen binding
  ↓
W3T READY GPT-OSS binding
  ↓
W2.v2 EXECUTING admission
```

The fixture stops there.

No W4.v2 evidence ledger and no provider execution occur.

## 12 · Evidence custody

Durable evidence:

`docs/programme/evidence/JARVIS-ROUTING-INTELLIGENCE-01/J6_WORK_UNIT_I1/`

includes:

- the 18-mutant proof output;
- synthetic I1 fixture;
- proof summary;
- TypeScript no-regression output;
- scripts diagnostic summary;
- v1 preservation record;
- SHA-256 manifest.

Raw full JARVIS logs remain ephemeral because Builder proofs can contain lease tokens.

## 13 · Non-events

I1 performed no:

- paid/live model call;
- provider call;
- credential lookup;
- external network execution;
- provider spend;
- repository execution;
- W4.v2 implementation;
- Desktop change;
- compatibility-adapter migration;
- PR creation/update;
- merge;
- deployment;
- production access;
- schema/database migration;
- member-facing MAIA change.

## 14 · Standing before commit

The I1 implementation and authorized proof population are complete on the current working candidate.

Repository sovereignty/pre-commit gates and post-commit exact-head rerun remain owed.

The gate must stop at:

`J6-WORK-UNIT-I1-EXACT-HEAD-EVIDENCE-01`

No PR/merge/deploy authority is implied.
