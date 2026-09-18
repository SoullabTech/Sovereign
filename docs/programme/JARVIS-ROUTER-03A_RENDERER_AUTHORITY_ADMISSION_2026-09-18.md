# JARVIS-ROUTER-03A — Renderer Authority Admission — 2026-09-18

**Standing:** BOUNDED IMPLEMENTATION · PRELOAD AUTHORITY ADMITTED · UI GESTURE NOT OPEN

## Founder grant

On 2026-09-18 the founder explicitly authorized exactly one new preload invoke channel:

```text
jarvis:model-work-unit
```

Purpose:

> Allow the JARVIS Desktop renderer to request planning or explicitly confirmed execution of an
> already-canonical Work Unit through the existing ROUTER-03 main-process handler.

The grant authorizes the preload bridge and bounded tests only.

It does not authorize automatic execution, automatic provider spend, write-capable model authority,
full Inkling, Nemotron Ultra, production access, merge, deployment, or MAIA member-facing change.

## Exact renderer surface

`preload.js` now exposes one method:

```text
modelWorkUnit(action, workUnitId, confirmExecute = false)
```

and exactly one invoke channel:

```text
jarvis:model-work-unit
```

Plan payload:

```json
{
  "action": "plan",
  "work_unit_id": "..."
}
```

Execute payload:

```json
{
  "action": "execute",
  "work_unit_id": "...",
  "confirm_execute": true
}
```

No separate model-routing status, plan, or execute invoke channels exist.

`jarvis:status` remains the only model-routing readiness/status surface.

## Five-question authority review

The canonical preload allow-list records the complete review in
`scripts/builder/__tests__/desktop-preload-allowlist.mjs`.

### 1. Required

The founder needs JARVIS Desktop to be able to request plan or explicitly confirmed execution of an
already-canonical multi-model Work Unit.

### 2. Authorized

The channel is bound to the explicit:

```text
ROUTER-03A founder grant 2026-09-18
```

and is not inferred from ROUTER-01/02/03 implementation.

### 3. Minimal

One invoke channel covers both actions.

Readiness remains on the already-ratified `jarvis:status` channel.

The rejected wider surface remains absent:

```text
jarvis:model-routing-status
jarvis:plan-model-work-unit
jarvis:execute-model-work-unit
```

### 4. Validated

The preload bridge can construct only:

- `action`;
- `work_unit_id`;
- execute-only boolean `confirm_execute`.

The existing main-process handler rejects unsupported fields and requires explicit execute
confirmation. ROUTER-03 canonical admission accepts only `action + work_unit_id` and derives all
routing/provider/budget/evidence facts from the canonical Work Unit.

### 5. Compatible

Context isolation remains intact. The preload imports no `child_process`, exposes no shell/exec
function, and provides no raw `ipcRenderer.send` bridge.

Routing, provider spend, evidence classification, advancement standing, and Work Unit authority
remain downstream in the canonical JARVIS mechanism.

## What the renderer cannot supply

The preload surface contains no constructors for:

```text
model
provider_id
routing_profile
review_policy
data_class
network.external
provider.spend
model_stage_budget
external_call_budget
allowed_files
authorized_acts
evidence classification
```

Those remain canonical Work Unit facts.

## Exact allow-list standing

The invoke allow-list moves from ten to eleven channels.

The new entry appears exactly once and the actual preload channel set matches the reviewed list
exactly.

The two historical exact-list proofs remain exact; neither was weakened to subset matching.

One older negative control used the crude predicate `!preload.includes('exec')` to represent
"no general shell/exec bridge." Because the newly authorized action is literally named `execute`,
that spelling-based predicate became semantically invalid. It was narrowed to the capability it was
always intended to prohibit:

- no `child_process` import;
- no `exec`, `execFile`, `execSync`, or `execFileSync` call in preload;
- no `ipcRenderer.send` bridge.

The exact invoke-channel allow-list remains the authority gate.

## Scope containment

ROUTER-03A does **not** add a renderer control or UI gesture.

`jarvis-desktop/src/renderer.js` does not call `modelWorkUnit()`.

Therefore this lane admits the bridge but does not make model execution ambient or user-triggerable
through a new visible control yet.

No model/provider call occurs in ROUTER-03A proof.

## Proof

Current bounded evidence:

```text
ROUTER-03A renderer authority proof     38 passed · 0 failed
Desktop model-runtime proof              9 passed · 0 failed
Desktop C0 / preload allow-list proof    52 passed · 0 failed
Alpha / preload allow-list proof         97 passed · 0 failed
```

The dedicated ROUTER-03A proof establishes:

- exactly one `jarvis:model-work-unit` allow-list entry;
- exactly eleven ratified invoke channels;
- the founder grant is named in the authority record;
- all five authority-review dimensions are durable;
- actual preload channels equal the reviewed allow-list exactly;
- exactly one model runtime channel and one `modelWorkUnit` method;
- no separate status/plan/execute channels;
- preload request shape cannot carry routing or provider authority;
- main owns plan/execute validation and explicit execution confirmation;
- `jarvis:status` remains the only readiness/status surface;
- no renderer UI call exists yet;
- no general shell/exec/send bridge exists.

## Not done

- no new provider/model call;
- no provider spend;
- no renderer UI control;
- no automatic execution;
- no write-capable model authority;
- no full Inkling;
- no Nemotron Ultra;
- no production access;
- no merge;
- no deployment;
- no MAIA member-facing behavior change.

## Next gate

### JARVIS-ROUTER-03B — Founder Desktop Gesture

A separate lane may add one visible JARVIS Desktop gesture for an existing canonical Work Unit:

```text
Plan
or
Execute (explicit confirmation)
```

ROUTER-03B must reuse the single `modelWorkUnit()` preload method admitted here. It may not add
another IPC channel, invent routing metadata, auto-confirm execution, or surface provider/model
controls that bypass the canonical Work Unit.

Until ROUTER-03B is separately opened, ROUTER-03A is a privileged bridge with no new UI caller.
