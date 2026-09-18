# JARVIS-ROUTING-INTELLIGENCE-01 · J6-FRESHNESS-RECONCILIATION-01 — Exact Bounded Repair Plan

**Date:** 2026-09-18
**Status:** PLAN ONLY — NOT AUTHORIZED FOR IMPLEMENTATION
**Repair base:** exact canonical `7937fc7cf1b0aede76b4e5302e36800c85f997da`
**Reviewed evidence donor:** `b42dc0d4c0d47c37f60a66bc06c52b4927118b84`
**Founder law:** `JARVIS-ROUTING-INTELLIGENCE-01 / J5`
**Goal:** one new reconciled candidate; do not mutate PR #1383 in place

## 1 · Construction rule

Do **not** merge #1383 wholesale and do **not** revert canonical routing commits.

Create a new isolated repair branch from exact canonical `7937fc7c…`.

Treat:

- current canonical as the implementation substrate;
- reviewed J6 as a proven donor of J5 law/conformance repairs;
- J3/J4/J5 records as governing programme evidence;
- canonical R1/R3 records as parallel historical evidence and donor mechanics.

The new candidate must have a new exact SHA and a new exact-head gate.

## 2 · Documentary authority first

Before or with the repair candidate, admit the founder-ratified programme record that canonical currently lacks:

- J5 founder ruling;
- J3 model-discrimination / response-budget evidence needed to justify model eligibility and adapter profiles;
- J4 falsification record;
- J6 reviewed witness as historical candidate evidence;
- this freshness reconciliation verdict and plan.

Do not delete or rewrite the canonical parallel discovery/R1 contract.

Instead add a successor reconciliation record stating which R1 clauses are superseded by J5:

- `single_mechanical` fast path;
- provider-before-family selection;
- lack of E0–E4 custody representation;
- lack of response-budget profile;
- any implication that route-level disclosure requirements alone constitute lower execution authority.

Preserve `R1-NEMOTRON-01` where compatible.

## 3 · Pure route core — reconcile, do not choose one file wholesale

Target:

`scripts/builder/routing-intelligence.mjs`

Start from canonical's stronger implementation mechanics:

- no filesystem/network/credential access;
- no ambient state reads;
- immutable/deep-frozen output;
- explicit route version;
- typed blockers;
- routing reason codes;
- evidence policy;
- required authority;
- `granted_authority: []`;
- execution disposition.

Replace / extend policy with J5.

### Required reconciled inputs

The pure route input should carry structured facts equivalent to:

```text
deterministic_capability:
  name | null
  registered: boolean

evidence_class:
  E0_TASK_TEXT
  E1_REPOSITORY_LOCAL
  E2_CONTINUITY_LOCAL
  E3_EXTERNAL_REPO_BUNDLE
  E4_SENSITIVE_OR_PRODUCTION

task_shape:
  CODE_GROUNDED
  ARCHITECTURE_REASONING
  ADVERSARIAL_FALSIFICATION
  LONG_HORIZON_DECOMPOSITION
  EVIDENCE_SYNTHESIS
  FRONTIER_UNKNOWN

review_pressure:
  ordinary
  high_value_uncertain

challenge_mode:
  none
  adversarial
  frontier

frontier_posture:
  none
  text_only_manual
  repository_grounded

evidence:
  exact_external_bundle_refs[]
  task_text_available

authority:
  repo_read
  repo_write_scope
  network_external
  provider_spend
  repository_external_disclosure

work_unit:
  risk_class
  explicit_independent_review
```

The host, not the renderer, supplies trusted deterministic and authority facts.

### Deterministic-first without sacrificing purity

Do not reintroduce J6's direct import of the deterministic registry into the pure router.

Instead:

1. MAIN / the canonical host resolves whether an exact registered deterministic capability applies;
2. pass that structured fact into the pure router;
3. if registered, route record terminates at deterministic C0 before model-family selection.

This preserves:

- J5 deterministic-first;
- canonical R2 purity.

### Reconciled task/review semantics

Preserve canonical's useful orthogonal controls:

- `review_pressure`;
- `challenge_mode`;
- `frontier_posture`.

But local J5 topology is binding:

```text
CODE_GROUNDED
  primary family: QWEN
  independent local family: GPT_OSS

ARCHITECTURE_REASONING
  primary family: GPT_OSS
  independent local family: QWEN

EVIDENCE_SYNTHESIS
  primary family: GPT_OSS
  independent local family: QWEN
```

No `single_mechanical` completion path.

High-value pressure may increase review/escalation requirements. It may not reduce the J5 independent local topology.

### Evidence-backed external eligibility

Use J3 evidence:

```text
INKLING
  eligible challenger:
    CODE_GROUNDED
    ADVERSARIAL_FALSIFICATION
    LONG_HORIZON_DECOMPOSITION
    EVIDENCE_SYNTHESIS

NEMOTRON
  eligible challenger:
    ARCHITECTURE_REASONING
    ADVERSARIAL_FALSIFICATION
    LONG_HORIZON_DECOMPOSITION
    EVIDENCE_SYNTHESIS

NEMOTRON
  NOT eligible:
    CODE_GROUNDED
```

Keep canonical's useful distinction:

- Inkling as adversarial challenge;
- Nemotron as frontier/reasoning challenge;
- Zen manual text-only only;
- NVIDIA outside automatic routing until separately adjudicated.

## 4 · Model family before transport

The reconciled route record must not use provider ID as the cognitive identity.

Change route record semantics from:

`provider_id = inkling-tinker`

to a family-first structure equivalent to:

```text
primary:
  model_family: GPT_OSS
  role: architecture_primary

challengers:
  - model_family: QWEN
    role: independent_local_challenger
  - model_family: INKLING
    role: adversarial_challenger
```

Transport resolution is a later step.

### Pure transport-resolution step

Add a second pure/structured function, in the same routing module or a narrowly named companion, which consumes:

- selected model family;
- allowed transport registry facts supplied by host;
- evidence class;
- existing authority posture;
- bounded response profile.

It returns one of:

- local transport selected;
- external transport eligible but explicit act required;
- manual-only;
- HOLD / no admissible transport;
- REFUSED.

It must never silently change model family.

Provider availability / credential readiness must not rewrite the cognitive route.

If the chosen family lacks an admissible transport:

> HOLD.

This satisfies J5 while retaining canonical's principle that ambient provider state does not alter cognitive routing law.

## 5 · E0–E4 evidence law

Reconciled route record must carry `evidence_class`.

### E2

`E2_CONTINUITY_LOCAL`

may never produce an external transport proposal.

### E4

`E4_SENSITIVE_OR_PRODUCTION`

must remain outside this programme's external routing authority.

### E1 → E3

If repository-local evidence is proposed to cross an external membrane:

`E1_REPOSITORY_LOCAL → E3_EXTERNAL_REPO_BUNDLE`

That crossing must be explicit in route/transport provenance.

Exact external bundle refs remain canonical's useful implementation detail.

## 6 · Load-bearing disclosure at the lower execution seam

Bring forward reviewed J6 changes in:

- `scripts/builder/work-unit.mjs`
- `scripts/builder/opencode-provider.mjs`

Add the independent act:

`repo.disclose:external-readonly`

Project it as:

`external_repo_disclosure`

Require it at the provider resolver whenever external execution would carry E3 repository evidence.

Do not rely on:

- UI checkbox alone;
- route record requirement alone;
- network + spend alone.

Manual provider strategy must also obey the same lower-seam grant.

## 7 · Work Unit lifecycle / durable result

Bring forward reviewed J6 changes in:

- `scripts/ain-delegate.sh`
- `scripts/builder/work-unit.mjs`
- `jarvis-desktop/src/work-unit-control.js`

### Delegate

After writing the durable result contract, wrapper return code must preserve provider/worker exit status.

### Host lifecycle

Any durable result with:

- nonzero numeric `exit_code`;
- `test_results = fail`; or
- `recommended_next_action = reject`

must derive failure / repair standing, never `ready_to_integrate`.

### Desktop caller outcome

Desktop completion status must derive from the durable recorded attempt, not wrapper success.

This restores RI-G11.

## 8 · Independent-review reconciliation

Bring forward J6 model-family derivation into general Work Unit reconciliation.

Two attempts from the same model family:

```text
QWEN
QWEN
```

do not satisfy independent review.

A valid second dimension is:

- a different model family; or
- an independent deterministic falsifier capable of testing the material claim.

Canonical route-specific challenger sequencing may remain, but the generic attempt reconciler must not have a weaker rule.

Remove the canonical `single_mechanical` completion branch.

## 9 · Response-budget profiles

Preserve reviewed J6 evidence-backed profiles.

At minimum:

```text
inkling-tinker
  max output ceiling: 4096
  auto expand: false

nemotron-tinker
  max output ceiling: 4096
  auto expand: false
  CODE_GROUNDED not admitted

qwen-local
  adapter-managed bounded profile

gpt-oss-local
  adapter-managed bounded profile
  proven low-reasoning posture metadata
```

Response budget belongs to model/adapter or transport provenance.

It is not authority and cannot auto-expand.

## 10 · Reconciled route record

Bump the route version. Do not reuse `R1.v1` for changed semantics.

Recommended:

`J5.v1`

The immutable record should combine the strongest fields from both lineages:

```text
route_version
governing_law
deterministic
evidence_class
task_shape
review_pressure
challenge_mode
frontier_posture

primary:
  model_family
  role

challengers:
  model_family
  role
  review_dimension

review_policy
evidence_policy
required_authority
granted_authority: []

transport_resolution
response_budget_profiles

execution_disposition
blockers[]
routing_reason_codes[]
```

Required provenance must answer the J5 questions without inspecting hidden ambient state.

## 11 · Preserve canonical R3 Work Unit binding

Retain canonical mechanics in:

- `jarvis-desktop/src/main.js`
- `jarvis-desktop/src/operator-work-unit.js`
- `jarvis-desktop/src/renderer.js`
- `scripts/builder/__tests__/routing-intelligence-binding-proof.mjs`

Specifically preserve:

- preview route before Work Unit creation;
- MAIN computes route record;
- renderer cannot submit route record or raw authority;
- exact route record persisted to Work Unit;
- route-bound packet has `provider_strategy: []`;
- `routing_intelligence.execution_connected:false`;
- bound canonical SHA;
- `run-provider` disabled for route-bound Work Units;
- routed UI hides Run Strategy;
- stale async preview response protection.

Do **not** restore reviewed J6's `route-plan` action if canonical `preview-route` already satisfies the plan-before-execution requirement more strongly.

## 12 · Strengthen execution disconnect below MAIN

Canonical currently enforces R3 execution disconnect in MAIN.

For defense in depth, the reconciled `WUC.runProvider()` should itself refuse a Work Unit whose persisted:

`routing_intelligence.execution_connected === false`

before provider resolution / credential readiness / worktree acquisition.

This makes canonical's strong R3 membrane load-bearing at the lower controller seam rather than dependent only on one caller.

## 13 · Manual provider path

Canonical preserves a manual provider strategy alongside routed preview.

Keep it.

But reconcile it to J5:

- explicit external network grant;
- explicit spend when metered;
- explicit `repo.disclose:external-readonly` for external repository material;
- lower resolver enforcement;
- durable-result precedence;
- same-model independence.

Manual mode must not become an escape hatch around the routed constitutional membrane.

## 14 · Tests — union of both proof families

Do not choose one proof suite.

### Preserve canonical proofs

Keep/rework canonical:

- structural purity;
- immutable route record;
- no ambient credentials/network state in cognitive route;
- required authority grants none;
- external exact bundle;
- Zen manual-only;
- route persistence round trip;
- execution disconnect;
- MAIN-owned route computation;
- stale preview protection.

### Preserve reviewed J6/J4 falsifiers

All ten must be green on the reconciled exact head:

1. deterministic work not routed to a model;
2. E2 continuity not externalized;
3. Nemotron not admitted for CODE_GROUNDED;
4. same-family retry not independent;
5. unavailable transport HOLD / no family substitution;
6. E3 disclosure lower-seam grant required;
7. model consensus remains evidence;
8. durable result outranks wrapper status;
9. bounded model/adapter response profiles;
10. model-authored lifecycle labels do not advance state.

### Explicitly delete/supersede one canonical proof expectation

The test:

> `single mechanical reconciliation may complete after one clean primary`

must not survive.

Replace it with:

> CODE_GROUNDED owes the independent GPT-OSS local review under J5.

### Additional lower-seam proof

A direct call to the provider controller on a route-bound Work Unit with `execution_connected:false` must refuse before credentials or workspace acquisition.

## 15 · Exact repair file set

### Manual-conflict files

Reconcile by hand:

1. `scripts/builder/routing-intelligence.mjs`
2. `scripts/builder/__tests__/routing-intelligence-proof.mjs`
3. `jarvis-desktop/src/main.js`
4. `jarvis-desktop/src/operator-work-unit.js`
5. `jarvis-desktop/src/work-unit-control.js`
6. `jarvis-desktop/test/operator-work-unit.test.mjs`
7. `jarvis-desktop/test/work-unit-cockpit.test.mjs`

### Candidate-only conformance repairs to bring forward

8. `scripts/builder/work-unit.mjs`
9. `scripts/builder/opencode-provider.mjs`
10. `scripts/ain-delegate.sh`
11. `scripts/builder/__tests__/work-unit-proof.mjs`
12. `scripts/builder/__tests__/opencode-adapter-governance-proof.mjs`
13. `scripts/builder/__tests__/desktop-preload-allowlist.mjs`
14. `jarvis-desktop/test/work-unit-control.test.mjs`

### Canonical-only implementation to preserve

15. `jarvis-desktop/src/renderer.js`
16. `scripts/builder/__tests__/routing-intelligence-binding-proof.mjs`

### Programme / evidence records

Bring forward the J3–J6/J5 founder evidence required to justify the reconciled law, plus a new reconciled contract/witness.

Do not erase either historical lineage.

## 16 · Repair sequence

### R0 — exact custody

Start a new repair worktree from exact `7937fc7c…`.

Do not modify #1383.

### R1 — authority/provenance admission

Add J5 founder ruling and empirical model evidence to the repair lineage.

Add a reconciliation contract that marks incompatible parallel R1 clauses superseded.

No runtime change yet.

### R2 — pure routing contract

Implement:

- J5 task/evidence/family law;
- canonical pure immutable record;
- family-first selection;
- no `single_mechanical`;
- deterministic-first trusted input;
- route version bump;
- pure transport-resolution result.

Run pure routing/J4 tests only.

### R3 — lower authority + lifecycle conformance

Apply:

- disclosure act;
- E1→E3 lower seam;
- provider resolver check;
- same-family independence;
- durable-result precedence;
- delegate exit propagation;
- response-budget profiles.

Run Work Unit/provider/delegate proofs.

### R4 — canonical Desktop binding

Reconcile:

- preview route;
- persisted route record;
- execution disconnect;
- manual mode;
- renderer route preview;
- lower controller execution-disconnect guard.

Run binding + Desktop/Alpha proofs.

### R5 — full exact-head falsification

Required before any PR:

- reconciled routing suite;
- all ten J4 mutants;
- canonical binding proof;
- provider governance;
- Work Unit;
- Desktop;
- Alpha Floor;
- external-context membrane;
- direct Tinker synthetic transport proof only;
- TypeScript no-regression;
- scripts diagnostic no-regression;
- sovereignty/pre-commit gates.

No paid/live external model call is required for this repair.

### R6 — exact-head evidence gate

Return:

- exact repaired SHA;
- current canonical SHA;
- ahead/behind/freshness;
- proof counts;
- changed-file scope;
- unresolved questions.

Stop before PR update/open/merge.

## 17 · Evidence standing after repair

J3 empirical model evidence may be reused without another paid benchmark unless:

- model ID changes;
- transport changes materially;
- response-budget semantics change;
- a new model family is admitted;
- the repair contradicts the frozen benchmark conditions.

J4 and J6 implementation proofs must be rerun because the implementation changes.

PR #1383 CI must **not** be inherited by the reconciled candidate.

## 18 · What happens to PR #1383

Under the repair plan:

- #1383 remains frozen historical evidence;
- do not force-push it;
- do not rebase it;
- do not merge it.

After a repaired exact candidate is proven, a later founder gate may choose whether to:

- close #1383 as superseded and open a new PR; or
- use another explicit GitHub strategy.

That decision is outside this repair plan.

## 19 · Stop condition

This plan authorizes nothing by itself.

No source change, PR mutation, merge, deployment, schema change, production mutation, provider spend, external model call, or MAIA member-facing change may occur until a separate repair authorization is issued.
