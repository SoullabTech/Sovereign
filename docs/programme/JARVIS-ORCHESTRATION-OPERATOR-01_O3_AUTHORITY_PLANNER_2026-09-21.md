# JARVIS-ORCHESTRATION-OPERATOR-01 / O3 — Authority Planner

Opening canonical: `872ca7b4a726df5ef404747bddde94e40950809c`

## Purpose

O3 answers:

> **For each O2 planned Work Unit, what semantic minimum authority is required, what relevant authority is already held, and where must progression stop for operator authority?**

O3 grants nothing.

It consumes one valid canonical `o2.work-graph.v1` graph plus one explicit held-authority envelope and produces a separate immutable authority plan keyed to the O2 Work Unit ids.

O3 does not modify O2 nodes.

## Governing laws

1. **Authority requirements are separate from graph structure.**
2. **Held authority is evidence, not a grant.**
3. **Intent does not create authority.**
4. **Graph shape does not create authority.**
5. **Capabilities, credentials, environment state, provider availability, or technical possibility do not create authority.**
6. **A Work Unit receives only the authority relevant to its semantic minimum requirement.**
7. **Ambient held authority is never inherited by an unrelated Work Unit.**
8. **Missing authority becomes a deterministic operator gate.**
9. **O3 performs no routing, execution, integration, deployment, or production mutation.**
10. **O4 may later choose only capabilities that fit the governed authority plan or return an authority gate.**

## Semantic minimum authority table

| O2 kind | Required authority |
| --- | --- |
| `INSPECT` | `repo.read` |
| `SYNTHESIZE` | none |
| `PROPOSE` | none |
| `MODIFY` | `repo.read`, `repo.write:worktree` |
| `VERIFY` | `repo.read`, `verify.run` |
| `RELEASE_READINESS` | none |

`RELEASE_READINESS` remains a consequence boundary marker only. It does not require or imply `pr.create`, `merge`, `deploy`, or `production.write`. Those later acts remain separate consequential authority decisions.

## O0 law reuse

O3 does not create a parallel authority vocabulary. Every O3 required authority must already exist in canonical O0 `ACTION_RULES`.

For each semantic requirement, O3 invokes the corresponding O0 action decision using the explicit held-authority envelope.

Examples:

```text
repo.read            → action repo.read
repo.write:worktree  → action worktree.write
verify.run           → action verify.run
```

If a semantic requirement lacks an O0 action rule, O3 stops rather than inventing one.

## No ambient inheritance

If the held envelope contains `repo.read`, `repo.write:worktree`, `verify.run`, `merge`, `deploy`, and `production.write`, an `INSPECT` Work Unit still receives only:

```text
required_authorities      = [repo.read]
held_relevant_authorities = [repo.read]
```

It does not inherit `merge`, `deploy`, or `production.write`.

The authority planner is therefore a **minimum-requirement planner**, not a delegation mechanism.

## Authority-plan decisions

Each planned Work Unit receives:

- exact O2 `work_unit_id`;
- ordinal and semantic kind;
- `required_authorities[]`;
- `held_relevant_authorities[]`;
- `missing_authorities[]`;
- per-requirement O0 decisions;
- aggregate decision;
- `operator_required`;
- consequence-boundary marker;
- reason.

Aggregate decisions are `CONTINUE` when all semantic minimum authority is already held, and `NEEDS_OPERATOR_AUTHORITY` when any semantic minimum authority is missing.

O3 does not authorize missing authority. It reports the gate.

## Authority input boundary

O3 accepts only `heldAuthorities[]`. Additional authority-input fields such as `grant`, `permission`, `provider`, or `execution` are refused.

Unknown held-authority names are also refused. This prevents callers from laundering new power through the planner input.

## O2 consumption hardening

O3 adds a stricter consumer boundary before authority planning:

- graph-envelope keys are allowlisted;
- node keys are rechecked against O2's exact node allowlist;
- `Reflect.ownKeys` is used so non-enumerable own properties are visible;
- extra graph-level provider/routing/execution vocabulary is refused;
- extra node-level provider/routing/execution vocabulary is refused.

This closes the two named nonblocking O2 observations at the first downstream consumer without changing O2 canonical semantics.

O3 therefore refuses graph-level `provider_id`, non-enumerable graph-level `provider_id`, non-enumerable node-level `provider_id`, and node-level `execution_adapter` before any authority plan is produced.

## Effects

Every successful O3 plan declares:

```text
authority   = none
routing     = none
execution   = none
integration = none
```

## Freshness precondition

Before any mutating, adjudicating, or canonical-admission act in this programme, live `origin/clean-main-no-secrets` must be re-read.

Cached canonical standing is evidence, not authority. If live canonical differs from the standing being acted upon, the act fails closed into freshness reconciliation.

The O3 pure module itself performs no Git, filesystem, network, shell, clock, randomness, credential, provider, or execution I/O.

## Falsifier matrix

The O3 witness must prove:

- F1 INSPECT requires `repo.read` and gates when absent;
- F2 INSPECT continues when `repo.read` is held;
- F3 SYNTHESIZE requires no new semantic authority;
- F4 PROPOSE requires no new semantic authority;
- F5 MODIFY requires `repo.read` + `repo.write:worktree`;
- F6 VERIFY requires `repo.read` + `verify.run`;
- F7 complete CHANGE minimum authority yields no authority gates;
- F8 first gate respects O2 topological order;
- F9 ambient consequential authority is not inherited;
- F10 RELEASE_READINESS is a consequence marker, not a release grant;
- F11 held merge/deploy power does not become a release-readiness requirement;
- F12 decisions reuse canonical O0 action law;
- F13 unknown held authority is refused;
- F14 authority-input widening is refused;
- F15 graph-envelope downstream vocabulary is refused;
- F16 non-enumerable graph-envelope injection is refused;
- F17 non-enumerable node injection is refused;
- F18 ordinary node widening remains refused;
- F19 invalid O2 graph is refused;
- F20 O3 does not mutate O2 graph input;
- F21 deterministic replay;
- F22 deep immutability;
- F23 no grants/providers/routes/lifecycle/execution state in output;
- F24 every requirement is exactly the fixed O3 semantic minimum;
- F25 release graph records the consequence boundary without authorizing it.

## Closure condition

O3 may close only when one valid O2 graph plus an explicit held-authority envelope can produce a deterministic authority plan that identifies semantic minimum authority per Work Unit, reuses canonical O0 law, distinguishes held from missing authority, identifies the first operator gate, preserves O2 ordering and identity, does not copy ambient authority onto nodes, grants nothing, performs no routing/execution/integration, and refuses widened O2 envelopes before planning.

Canonical closure sentence:

> **O3 may determine what authority the work requires and what is missing. It may not grant that authority.**

## Programme standing

- O0 Operator Constitution — CLOSED · CANONICAL
- O1 Intent Contract — CLOSED · CANONICAL
- O2 Work Graph — CLOSED · CANONICAL
- O3 Authority Planner — candidate under witness
- O4 Capability Router — NOT OPEN
- O5 Execution Supervisor — NOT OPEN
- O6 Verification Supervisor — NOT OPEN
- O7 Operator Decision Surface — NOT OPEN
- O8 Integration Supervisor — NOT OPEN
- O9 Programme Closure — NOT OPEN
- O10 Desktop Operator Witness — NOT OPEN
- O11 Mobile Operator Witness — NOT OPEN

## Candidate witness

Witnessed from exact O3 opening canonical:
872ca7b4a726df5ef404747bddde94e40950809c

Commands:

- node --test jarvis-desktop/test/operator-authority-planner.test.mjs
- node --test jarvis-desktop/test/operator-work-graph.test.mjs
- node --test jarvis-desktop/test/operator-intent-contract.test.mjs
- node --test jarvis-desktop/test/operator-constitution.test.mjs
- node --test jarvis-desktop/test/operator-flow.test.mjs jarvis-desktop/test/operator-work-unit.test.mjs
- node --check jarvis-desktop/src/operator-authority-planner.js
- node --check jarvis-desktop/test/operator-authority-planner.test.mjs
- git diff --check

Observed:

- O3 Authority Planner suite: **26 passed · 0 failed**;
- O2 Work Graph regression: **25 passed · 0 failed**;
- O1 Intent Contract regression: **16 passed · 0 failed**;
- O0 Operator Constitution regression: **14 passed · 0 failed**;
- existing operator-flow/work-unit regression: **15 passed · 0 failed**;
- syntax and whitespace checks: **PASS**;
- exactly three new O3 artifacts;
- no authority grant, provider routing, execution, integration, deployment, or production mutation;
- O4 remains unopened.

This establishes an O3 implementation candidate only.
Canonical closure requires Founder adjudication and later canonical admission.
