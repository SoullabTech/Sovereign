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

O3 accepts one canonical serialized JSON request at its public planning boundary:

```text
{
  "version": "o3.authority-request.v1",
  "graph": <canonical O2 graph data>,
  "authority_input": {
    "heldAuthorities": [...]
  }
}
```

Live JavaScript objects are not admitted by `planAuthority`.

Within the parsed request, `authority_input` accepts only `heldAuthorities[]`. Additional fields such as `grant`, `permission`, `provider`, or `execution` are refused.

Every `heldAuthorities[]` element must be nonblank text. Numbers, nulls, objects, and blanks are refused rather than silently dropped.

Unknown held-authority names are also refused. This prevents callers from laundering new power through the planner input or hiding malformed evidence inside normalization.

## O2 consumption hardening

O3 adds a stricter consumer boundary before authority planning:

- graph-envelope keys are allowlisted;
- node keys are rechecked against O2's exact node allowlist;
- `Reflect.ownKeys` is used so non-enumerable own properties are visible;
- extra graph-level provider/routing/execution vocabulary is refused;
- extra node-level provider/routing/execution vocabulary is refused;
- the embedded governed intent is replayed through canonical `O2.compileWorkGraph`;
- the supplied graph must be own-key-aware deep-structurally identical to that canonical replay.

Legal individual field values are not enough. Changes to stage kind, objective, node parent objective, edge content, effects content, or nested own keys are refused when they no longer match canonical replay.

This hardens the first downstream consumer without changing O2 canonical semantics.

Graph integrity here means structural integrity relative to the graph's embedded governed intent. Authenticity of the upstream O1 act remains a custody/provenance concern outside this pure O3 module.

## O3R2 — historical accessor/TOCTOU hardening

O3R2 established that validation and planning must not re-read caller-controlled accessors.

Its live-object descriptor snapshot was subsequently falsified by an independent second witness: JavaScript Proxy introspection traps can execute during reflection and mutate authority evidence before descriptor capture.

That live-object snapshot mechanism is therefore superseded and removed by O3R3.

## O3R3 — proxy-safe serialized authority ingest

O3R3 moves the public O3 trust boundary from executable JavaScript objects to canonical serialized JSON text.

The boundary rules are:

- `planAuthority` accepts only primitive string input;
- arbitrary objects, Proxies, boxed String objects, accessors, and `toJSON` hooks are rejected before property access;
- O3 parses the JSON internally;
- the request must decode to one exact `o3.authority-request.v1` envelope;
- O3 requires canonical JSON reserialization equality, so textual normalization and duplicate-key ambiguity are refused;
- the parsed request is deeply frozen;
- O2 graph validation, canonical replay integrity, authority-input validation, and authority planning all consume that same parsed frozen request;
- caller mutation after serialization cannot change admitted authority evidence;
- non-enumerable live-object properties that are not present in serialized bytes are outside the O3 boundary and cannot affect planning.

Core invariant:

> **O3 accepts authority evidence only through a representation whose admission cannot execute caller-controlled code. The bytes/data admitted as authority evidence are exactly the bytes/data validated and exactly the data used for planning.**

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
- F16 non-enumerable live graph-envelope data is not admitted by serialization and cannot affect planning;
- F17 non-enumerable live node data is not admitted by serialization and cannot affect planning;
- F18 ordinary node widening remains refused;
- F19 invalid O2 graph is refused;
- F20 O3 does not mutate O2 graph input;
- F21 deterministic replay;
- F22 deep immutability;
- F23 no grants/providers/routes/lifecycle/execution state in output;
- F24 every requirement is exactly the fixed O3 semantic minimum;
- F25 release graph records the consequence boundary without authorizing it;
- F26 MODIFY stage-kind drift is refused;
- F27 VERIFY stage-kind drift is refused;
- F28 embedded objective drift is refused;
- F29 node parent-objective drift is refused;
- F30 edge-envelope widening is refused;
- F31 effects-envelope widening is refused;
- F32 malformed or blank held-authority entries are refused;
- F33 non-enumerable live held-authority properties are not admitted by serialization;
- F34 nested non-enumerable live intent data is not admitted by serialization;
- F35 live object requests are rejected before accessor invocation;
- F36 Proxy request objects are rejected with zero Proxy traps;
- F37 proxied boxed String objects are rejected with zero traps;
- F38 canonical serialized requests succeed from deeply frozen parsed data;
- F39 textual JSON normalization is refused;
- F40 duplicate JSON keys are refused by canonical reserialization;
- F41 malformed JSON is refused before authority logic;
- F42 request-envelope widening is refused;
- F43 missing request fields are refused;
- F44 wrong request versions are refused;
- F45 serialized MODIFY downgrade remains refused by canonical O2 replay;
- F46 malformed serialized authority evidence is refused;
- F47 caller mutation after serialization cannot alter admitted authority bytes;
- F48 Proxy authority manufacture cannot execute inside O3 admission;
- F49 caller `toJSON` hooks cannot execute inside O3 admission;
- F50 identical admitted bytes/data produce deterministic plans.

## Closure condition

O3 may close only when one canonical serialized `o3.authority-request.v1` can produce a deterministic authority plan that identifies semantic minimum authority per Work Unit, reuses canonical O0 law, distinguishes held from missing authority, identifies the first operator gate, preserves O2 ordering and identity, does not copy ambient authority onto nodes, grants nothing, performs no routing/execution/integration, refuses widened O2 envelopes before planning, rejects executable object input before property access, and validates/plans from the exact same deeply frozen data parsed from the admitted canonical JSON bytes.

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

- O3 Authority Planner suite: **35 passed · 0 failed**;
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

## O3R2 candidate witness

O3R2 was opened from exact canonical:

`7c58ad5330fe5e091fbbc75035da4f7a537ac61f`

while preserving exact O3R1R1 content authority from:

`40214688fd5baa5ad8a9ad7b585c83370dacb7fb`.

The O3R1R1 files were re-established byte-for-byte before O3R2 mutation.

Observed O3R2 witness:

- O3 Authority Planner suite: **45 passed · 0 failed**;
- O2 Work Graph regression: **25 passed · 0 failed**;
- O1 Intent Contract regression: **16 passed · 0 failed**;
- O0 Operator Constitution regression: **14 passed · 0 failed**;
- existing operator-flow/work-unit regression: **15 passed · 0 failed**;
- syntax and whitespace checks: **PASS**;
- stateful MODIFY accessor reprobe: **REFUSED · getter reads 0**;
- stateful VERIFY accessor reprobe: **REFUSED · getter reads 0**;
- stateful heldAuthorities accessor reprobe: **REFUSED · getter reads 0**;
- stateful objective accessor reprobe: **REFUSED · getter reads 0**;
- no authority grant, provider routing, execution, integration, deployment, or production mutation;
- O4 remains unopened.

O3R2 establishes:

> **The exact inert data that passes authority-boundary validation is the exact data used for authority planning. No caller-controlled code may execute between validation and use.**

This establishes an O3R2 implementation candidate only.
Canonical closure still requires Founder adjudication and later canonical admission.

## O3R3 candidate witness

O3R3 was opened from exact canonical:

`fa5274fd9c8761bed4d07e8437bdd1fc36e13a9a`

while preserving exact O3R2 content authority from:

`21b819c0ec7fcda9920989021e12bcd8ccec8364`.

The O3R2 files were re-established byte-for-byte before O3R3 mutation.

Observed O3R3 witness:

- O3 Authority Planner suite: **51 passed · 0 failed**;
- O2 Work Graph regression: **25 passed · 0 failed**;
- O1 Intent Contract regression: **16 passed · 0 failed**;
- O0 Operator Constitution regression: **14 passed · 0 failed**;
- existing operator-flow/work-unit regression: **15 passed · 0 failed**;
- syntax and whitespace checks: **PASS**;
- live object request: **REFUSED before property access**;
- Proxy request object: **REFUSED · trap count 0**;
- proxied boxed String request: **REFUSED · trap count 0**;
- duplicate-key JSON: **REFUSED as non-canonical**;
- malformed JSON: **REFUSED before authority logic**;
- caller mutation after serialization: **NO EFFECT on admitted authority evidence**;
- Proxy authority-manufacture reprobe: **CLOSED · trap count 0**;
- caller `toJSON` hook: **NOT INVOKED**;
- no authority grant, provider routing, execution, integration, deployment, or production mutation;
- O4 remains unopened.

O3R3 establishes:

> **O3 accepts authority evidence only through a representation whose admission cannot execute caller-controlled code. The bytes/data admitted as authority evidence are exactly the bytes/data validated and exactly the data used for planning.**

This establishes an O3R3 implementation candidate only.
Canonical closure still requires independent second witness, Founder adjudication, and later canonical admission.
