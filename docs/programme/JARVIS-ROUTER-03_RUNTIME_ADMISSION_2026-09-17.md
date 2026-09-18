# JARVIS-ROUTER-03 — Canonical Runtime Admission — 2026-09-17

**Standing:** BOUNDED IMPLEMENTATION · OFFLINE PROOF GREEN · RENDERER EXECUTION MEMBRANE CLOSED

## Purpose

ROUTER-01 answers **who may participate**.

ROUTER-02 answers **how a primary/challenger plan executes under one canonical Work Unit**.

ROUTER-03 answers **how the running JARVIS application may ask for that plan or execution without
becoming a second routing authority**.

The central rule is:

> Desktop may name an existing canonical Work Unit. Desktop may not submit model names, provider
> names, routing profiles, budgets, evidence classifications, provider authority, or free-form
> routing intent.

Those facts live in the Work Unit and are adjudicated by ROUTER-01/02.

## Canonical admission module

`scripts/builder/model-runtime-admission.mjs` is the runtime boundary.

It accepts exactly:

```json
{
  "action": "plan | execute",
  "work_unit_id": "canonical-work-unit-id"
}
```

Unknown fields are a typed refusal:

```text
REQUEST_SHAPE_INVALID
```

This explicitly rejects runtime injection attempts for:

- model;
- provider id;
- routing profile;
- provider spend;
- stage/external budgets;
- evidence/data class;
- any other field not present in the two-field request contract.

`work_unit_id` uses the existing canonical runtime `WORK_UNIT_ID_RE`; path-like ids are refused.

## Plan and execute are different acts

### `plan`

`plan` compiles ROUTER-02 and returns its typed state. It never invokes `executeModelOrchestration`.

Examples:

```text
READY
ROUTING_BLOCKED
WRITE_CAPABLE_MODEL_ADAPTER_REQUIRED
BUDGET_INVALID
STAGE_BUDGET_EXCEEDED
EXTERNAL_CALL_BUDGET_EXCEEDED
```

A blocked plan is information, not a failure that Desktop may reinterpret.

### `execute`

`execute` first compiles the same canonical Work Unit.

If compilation is not `READY`, zero model stages execute.

If compilation is `READY`, the admission module invokes ROUTER-02 exactly once. A resulting
`STOPPED / REVIEW_REQUIRED` remains stopped; there is no automatic retry or reinterpretation.

## Canonical Work Unit remains the authority source

Runtime admission never manufactures:

- `network.external`;
- `provider.spend`;
- `routing_profile`;
- `review_policy`;
- `data_class`;
- `model_stage_budget`;
- `external_call_budget`;
- model/provider selection.

A real packet proof demonstrates:

```text
default budget
  → STAGE_BUDGET_EXCEEDED

canonical model_stage_budget: 2
  → READY local GPT-OSS → Qwen plan

canonical external-deep + synthetic data + external authority + 2 external calls budgeted
  → READY Nemotron → Inkling plan
```

The runtime request in all three cases supplies only `action` and `work_unit_id`.

## Bound-repository Desktop mechanism

`jarvis-desktop/src/builder-mechanism.js` now carries a **separate optional model-routing cluster**.

This is intentionally independent from the pre-existing `MECHANISM_MODULES` local-native runtime.
Missing ROUTER-03 files therefore do **not** make the old Builder mechanism unavailable.

The model-routing cluster is resolved only from the currently bound repository:

```text
scripts/builder/model-runtime-admission.mjs
scripts/builder/model-orchestrator.mjs
scripts/builder/work-unit-route.mjs
scripts/builder/work-unit.mjs
scripts/builder/router.mjs
scripts/builder/opencode-provider.mjs
scripts/builder/tinker-direct.mjs
scripts/builder/external-context.mjs
scripts/ain-delegate.sh
```

There is no fallback to:

- another checkout;
- a sibling worktree;
- a bundled copy;
- a global module;
- a nearby file with the same name.

Desktop launches the bound repo's canonical admission module as a child Node process. The child
returns machine-readable JSON. A non-zero child exit carrying a typed governed refusal remains that
refusal; non-JSON output is named `MODEL_ADMISSION_INVALID_OUTPUT` rather than guessed.

## Main-process seam

Main currently owns one minimal model-runtime IPC handler:

```text
jarvis:model-work-unit
```

The internal request shape is:

```json
{ "action":"plan", "work_unit_id":"..." }
```

or:

```json
{ "action":"execute", "work_unit_id":"...", "confirm_execute":true }
```

`execute` requires an explicit confirmation bit. Unsupported Desktop request fields are rejected
before they reach the canonical admission child.

The main handler passes only `work_unit_id` into `planModelWorkUnit` / `executeModelWorkUnit`.

## Renderer authority remains CLOSED

The new main-process handler is **not exposed by `preload.js`**.

This is deliberate. The canonical preload allow-list states that adding a renderer invoke channel is
an authority decision, not test bookkeeping.

The existing ratified preload list remains byte-for-byte authoritative; both canonical allow-list
proofs remain green.

Model-routing availability is instead reported through the already-ratified read-only
`jarvis:status` surface as:

```text
model_routing: AVAILABLE | UNAVAILABLE
```

When available, its detail explicitly says the renderer execution membrane remains closed.

Therefore ROUTER-03 adds runtime substrate and legibility without silently widening renderer
execution authority.

## Minimal future renderer surface

Three candidate channels were considered:

```text
jarvis:model-routing-status
jarvis:plan-model-work-unit
jarvis:execute-model-work-unit
```

They were rejected as unnecessarily broad.

`jarvis:status` already carries readiness, and plan/execute can share one request channel. The
smallest future preload expansion is therefore exactly **one** channel:

```text
jarvis:model-work-unit
```

with `action = plan | execute` and main-owned validation.

## Proof

Current exact-tree evidence:

```text
model-runtime-admission-proof              31 passed · 0 failed
Desktop model-routing runtime               9 passed · 0 failed
Desktop C0 / preload allow-list proof       52 passed · 0 failed
Alpha floor / preload allow-list proof      97 passed · 0 failed
JOP-01 legibility                           39 passed · 0 failed
```

The Desktop runtime proof establishes:

- model-routing mechanism is additive to the old Builder mechanism;
- no bound repo → no model-routing mechanism;
- exact bound repo is the only source;
- a real canonical Work Unit can be planned through the child admission path with zero model
  execution;
- typed non-zero child refusals pass through intact;
- explicit execute passes one completed orchestration through without reinterpretation;
- invalid child output is named, not guessed;
- main owns one model-runtime channel and requires explicit execute confirmation;
- preload exposes none of the new model-runtime execution channels.

The canonical admission proof establishes:

- runtime field injection is refused;
- plan never executes;
- every typed ROUTER-02 blocker executes zero stages;
- READY execute invokes one orchestration only;
- REVIEW_REQUIRED is never upgraded or retried;
- canonical Work Unit routing metadata controls local/external readiness.

## Not done

- no new model/provider call;
- no provider spend;
- no renderer-accessible model execution channel;
- no automatic orchestration from free-form `submitTask`;
- no free-prose routing classifier;
- no write-capable model adapter;
- no merge;
- no deployment;
- no production/member/PHI access;
- no MAIA member-facing UI change.

## Next exact gate — ROUTER-03A Renderer Authority Admission

Opening the final Desktop gesture requires a founder ruling because it widens the canonical preload
allow-list by one privileged invoke channel.

The proposed channel can answer the five MAIA-D00A questions:

1. **Required** — the founder needs JARVIS Desktop to plan/execute a canonical multi-model Work Unit.
2. **Authorized** — requires an explicit founder act; ROUTER-03 itself does not infer it.
3. **Minimal** — one channel only: `jarvis:model-work-unit`; status reuses `jarvis:status`.
4. **Validated** — main accepts only action/id/execute-confirmation; canonical admission accepts only
   action/id and rejects all routing/authority overrides.
5. **Compatible** — context-isolated renderer doctrine remains intact; authority continues to live
   in the canonical Work Unit and builder mechanism.

Until ROUTER-03A is explicitly granted, the preload allow-list must remain unchanged and renderer
code must not be able to invoke multi-model execution.
