# JARVIS-ORCHESTRATION-OPERATOR-01 / O2 — Work Graph

Opening canonical: `1546ef4172b71505db6552ad81abc3d0596e81d8`

## Purpose

O2 answers:

> **What bounded pieces of work must exist, and in what dependency order, to pursue one CLEAR O1 intent?**

O2 does not execute those pieces of work.

It converts a canonical `o1.intent.v1` record into a deterministic directed acyclic graph of **planned Work Unit descriptors**.

Those descriptors are not canonical `W0.v2` Work Units. They are pre-authority planning records.

## Governing boundary

O2 may:

- decompose one clear governed objective;
- name bounded semantic work stages;
- create deterministic planned Work Unit identities;
- express dependencies explicitly;
- produce a deterministic topological order;
- preserve the exact parent O1 objective.

O2 may not:

- grant or infer authority;
- select a provider or model;
- create a routing record;
- create W0.v2 lifecycle state;
- invoke a worker;
- execute a Work Unit;
- mutate the repository as part of graph execution;
- integrate, merge, deploy, or mutate production.

O3 owns authority planning for every planned Work Unit.

## Operational freshness precondition

Before any mutating, adjudicating, or canonical-admission act is issued from this programme, the live `origin/clean-main-no-secrets` tip must be re-read and compared with the standing being acted upon.

Cached canonical standing is evidence, not authority. If the tip differs, the act fails closed into freshness reconciliation rather than proceeding on stale lineage.

This is a programme-operating precondition, not O2 graph semantics; the pure O2 module performs no Git or filesystem access.

## V1 stage vocabulary

O2 V1 uses six bounded semantic stages:

- `INSPECT`
- `SYNTHESIZE`
- `PROPOSE`
- `MODIFY`
- `VERIFY`
- `RELEASE_READINESS`

`RELEASE_READINESS` means exactly:

> establish the next consequential release boundary **without crossing it**.

It is not PR creation, merge, deployment, publication, or production mutation.

## Deterministic graph templates

### UNDERSTAND

```text
INSPECT
  ↓
SYNTHESIZE
```

### PREPARE

```text
INSPECT
  ↓
SYNTHESIZE
  ↓
PROPOSE
```

### CHANGE

```text
INSPECT
  ↓
SYNTHESIZE
  ↓
PROPOSE
  ↓
MODIFY
  ↓
VERIFY
```

### Pure RELEASE

A pure release request may point to an already-existing candidate. O2 must not invent a modification merely because the endpoint is release.

```text
INSPECT
  ↓
VERIFY
  ↓
RELEASE_READINESS
```

### CHANGE + RELEASE

```text
INSPECT
  ↓
SYNTHESIZE
  ↓
PROPOSE
  ↓
MODIFY
  ↓
VERIFY
  ↓
RELEASE_READINESS
```

O2 V1 deliberately does not invent parallelism. Safe parallel execution belongs to O5 after dependencies, authority, routing, and custody are established.

## Planned Work Unit descriptor

Each graph node contains only planning identity:

- `planned_work_unit_version`;
- `work_unit_id`;
- ordinal;
- semantic kind;
- bounded stage objective;
- exact parent O1 objective;
- explicit `depends_on[]`;
- expected evidence/product;
- `planned_only: true`.

It deliberately contains no:

- authority block;
- scope block;
- routing request;
- provider strategy;
- lifecycle state;
- execution lane.

Those fields belong to later governed stages.

## O2 output effects

Every valid graph declares:

```text
authority   = none
routing     = none
execution   = none
integration = none
```

A graph that claims otherwise is invalid.

## Fail-closed input law

O2 accepts only a `CLEAR` canonical O1 intent.

It refuses:

- `AMBIGUOUS` intent;
- `INVALID` intent;
- wrong O1 version;
- missing objective;
- unrecognized requested level;
- malformed level signals;
- any O1 record that carries or infers authority.

## Graph invariants

1. maximum six planned Work Units;
2. deterministic ids;
3. unique Work Unit ids;
4. every dependency names a Work Unit inside the graph;
5. no self-dependency;
6. every dependency precedes its dependent node;
7. explicit deterministic topological order;
8. graph remains acyclic;
9. all descriptors remain planning-only;
10. O1 objective remains exact and unchanged;
11. planned Work Unit fields are governed by a strict O2 allowlist.

The allowed node fields are exactly:

`planned_work_unit_version`, `work_unit_id`, `ordinal`, `kind`, `objective`,
`parent_objective`, `depends_on`, `produces`, and `planned_only`.

Any additional key — known, unknown, future, null, falsy, or populated — is refused with
`PLANNED_DESCRIPTOR_AUTHORITY_WIDENING`.

This is intentionally an allowlist rather than a denylist: later stages may extend their own vocabularies, but O2's descriptor boundary remains closed by default.

## Falsifier matrix

The O2 witness must prove at minimum:

- F1 UNDERSTAND graph;
- F2 PREPARE graph;
- F3 CHANGE graph;
- F4 pure RELEASE does not invent modification;
- F5 CHANGE + RELEASE reaches release readiness;
- F6 ambiguous intent refused;
- F7 invalid intent refused;
- F8 authority-contaminated intent refused;
- F9 O1 objective preserved exactly;
- F10 no provider/routing/execution connection;
- F11 deterministic replay;
- F12 explicit topological dependency order;
- F13 unknown dependency refused;
- F14 release readiness stops before consequence;
- F15 graph bounded to six units;
- F16 deep immutability;
- F17 continuation preserves inherited intent;
- F18 continuation + release adds readiness only;
- F19 descriptors are not W0.v2 Work Units;
- F20 release language still yields no O2 authority effect;
- F21 injected authority on a graph node is refused deterministically;
- F22 injected routing/lifecycle/execution fields are refused deterministically;
- F23 an unknown future descriptor field is refused by the allowlist;
- F24 canonical downstream provider/execution vocabulary such as `provider_id`, `execution_adapter`, and `repo_write_scope` is refused at the O2 boundary.

## Closure condition

O2 may close only when a CLEAR O1 intent can deterministically produce a bounded, immutable, acyclic graph of planned Work Unit descriptors while:

- preserving exact operator objective;
- preserving O0/O1 authority law;
- granting no authority;
- performing no routing;
- performing no execution;
- performing no integration;
- creating no canonical W0.v2 lifecycle state.

Canonical closure sentence:

> **O2 determines what work must exist and in what order. It does not decide who may do it, whether it is authorized, or execute it.**

## Programme standing

- O0 Operator Constitution — CLOSED · CANONICAL
- O1 Intent Contract — CLOSED · CANONICAL
- O2 Work Graph — candidate under witness
- O3 Authority Planner — NOT OPEN
- O4 Capability Router — NOT OPEN
- O5 Execution Supervisor — NOT OPEN
- O6 Verification Supervisor — NOT OPEN
- O7 Operator Decision Surface — NOT OPEN
- O8 Integration Supervisor — NOT OPEN
- O9 Programme Closure — NOT OPEN
- O10 Desktop Operator Witness — NOT OPEN
- O11 Mobile Operator Witness — NOT OPEN

## Candidate witness

Witnessed from exact O2 opening canonical
`1546ef4172b71505db6552ad81abc3d0596e81d8`.

Commands:

```text
node --test jarvis-desktop/test/operator-work-graph.test.mjs
node --test jarvis-desktop/test/operator-intent-contract.test.mjs
node --test jarvis-desktop/test/operator-constitution.test.mjs
node --test jarvis-desktop/test/operator-flow.test.mjs jarvis-desktop/test/operator-work-unit.test.mjs
node --check jarvis-desktop/src/operator-work-graph.js
node --check jarvis-desktop/test/operator-work-graph.test.mjs
git diff --check
```

Observed:

- O2 Work Graph suite: **25 passed · 0 failed**;
- O1 Intent Contract regression: **16 passed · 0 failed**;
- O0 Operator Constitution regression: **14 passed · 0 failed**;
- existing operator-flow/work-unit regression: **15 passed · 0 failed**;
- syntax and whitespace checks: **PASS**;
- exactly three new O2 artifacts;
- no authority grant, provider routing, execution, integration, deployment, or production mutation;
- O3 remains unopened.

This establishes an O2 implementation candidate only.
Canonical closure requires Founder adjudication and later canonical admission.
