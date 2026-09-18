# JARVIS-ROUTING-INTELLIGENCE-01 · J6 — Bounded Routing Implementation Witness

**Date:** 2026-09-18
**Founder authority:** `JARVIS-ROUTING-INTELLIGENCE-01 / J5`
**Ruling commit:** `b9d34415e55bed80b82c56a99f24d541e062c4de`
**Branch:** `feature/jarvis-routing-intelligence-01-j6-20260918`
**Worktree:** `/private/tmp/jarvis-routing-intelligence-01-j6-20260918`
**Class:** A — routing / external disclosure / development-memory custody / provider-spend boundary
**Current gate:** implementation + falsification complete; exact-head merge gate not yet opened
**Stop boundary:** no merge, deploy, production mutation, provider spend, external model execution, schema change, or member-facing MAIA behavior

## 1 · Question

> Can the ratified J5 routing constitution be implemented as a deterministic, inspectable plan layer that selects bounded intelligence capability and review topology without acquiring execution authority or weakening any custody boundary?

## 2 · Answer

**Yes — on the J6 candidate.**

The implementation now makes these distinctions mechanically explicit:

```text
deterministic capability
        ↓
evidence class
        ↓
declared / bounded task shape
        ↓
evidence-backed model-family eligibility
        ↓
local primary + independent review topology
        ↓
optional external family selection
        ↓
authority-aware transport resolution
        ↓
route plan
        ↓
STOP
```

A route plan can become:

- `DETERMINISTIC`
- `ROUTED_LOCAL`
- `EXTERNAL_REVIEW_READY`
- `HOLD`

but **never acquires execution authority**.

Every route record carries:

`execution_authorized: false`

External execution remains the already-separate explicit provider act.

## 3 · Pure routing core

After canonical conflict reconciliation, the J6/J5 planner lives at:

`scripts/builder/routing-intelligence-j6.mjs`

The original J6 candidate used `scripts/builder/routing-intelligence.mjs`. Reconciliation gave the J6/J5 planner the explicit `-j6` path so the subsequently integrated R3 pure router could remain unchanged at its canonical path. The two ratified contracts remain separately testable rather than being silently collapsed into one routing law.

The J6 module:

- calls no model;
- reads no credential;
- creates no Work Unit;
- acquires no worktree;
- sends no network request;
- spends no provider funds;
- mutates no repository/runtime state;
- merges/deploys nothing.

It defines the J5 vocabulary mechanically:

### Evidence

- `E0_TASK_TEXT`
- `E1_REPOSITORY_LOCAL`
- `E2_CONTINUITY_LOCAL`
- `E3_EXTERNAL_REPO_BUNDLE`
- `E4_SENSITIVE_OR_PRODUCTION`

### Task shapes

- `CODE_GROUNDED`
- `ARCHITECTURE_REASONING`
- `ADVERSARIAL_FALSIFICATION`
- `LONG_HORIZON_DECOMPOSITION`
- `EVIDENCE_SYNTHESIS`
- `FRONTIER_UNKNOWN`

### Model families

- `QWEN`
- `GPT_OSS`
- `INKLING`
- `NEMOTRON`

Model eligibility is the J3/J5 evidence profile, not model-size inference or provider availability.
## 4 · Evidence-backed topology

### CODE_GROUNDED

```text
primary             QWEN
independent review  GPT_OSS
external challenger INKLING eligible
NEMOTRON            ineligible
```

Nemotron remains mechanically refused for CODE_GROUNDED because J3-B-R1 never earned that standing.

### ARCHITECTURE_REASONING

```text
primary             GPT_OSS
independent review  QWEN
external challenger NEMOTRON eligible
```

### EVIDENCE_SYNTHESIS

```text
primary             GPT_OSS
independent review  QWEN
external challengers INKLING / NEMOTRON eligible
```

### ADVERSARIAL_FALSIFICATION / LONG_HORIZON_DECOMPOSITION

No automatic local primary is invented by J6.

A founder-selected evidence-backed external family may produce an `EXTERNAL_REVIEW_READY` **plan** when its existing Work Unit grants and transport readiness are present.

That plan still carries:

`execution_authorized: false`

## 5 · Deterministic first

The new router checks the real deterministic registry before model-family routing.

A task carrying registered `git.rev_parse` returns:

```text
status          DETERMINISTIC
execution_lane  C0
models          none
```

even if a model-shaped task class was also supplied.

J4 mutant M1 is therefore mechanically closed.

## 6 · LOCAL_ONLY remains local

E2 continuity cannot produce an external transport.

A route request with:

- evidence = `E2_CONTINUITY_LOCAL`
- task = `EVIDENCE_SYNTHESIS`
- Inkling requested
- network/spend/disclosure all apparently present

returns:

```text
status   HOLD
blocker  LOCAL_ONLY_EVIDENCE
transport null
```

The blocker is now correctly about **evidence custody**, not a false statement that Inkling is cognitively ineligible.

## 7 · E1 → E3 boundary is load-bearing

J6 introduced:

`repo.disclose:external-readonly`

as an independent Work Unit act.

The permission envelope now carries:

`external_repo_disclosure`

The lower provider resolver requires that permission whenever repository evidence crosses to an external provider.

A subtle seam was caught during J6 testing:

> A local repository Work Unit is E1 while evidence remains on the machine, but the same repository bytes must become E3 at the moment external review is requested.

The initial J6 cut trusted the Work Unit's local E1 label too literally.

The stored-Work-Unit route proof exposed that before publication.

The final implementation now:

- preserves E1 for local review;
- promotes the **external crossing** to E3;
- requires `repo.disclose:external-readonly`;
- derives the grant from the stored Work Unit;
- ignores any caller-supplied permission envelope.

This closes RI-G03 mechanically on the J6 candidate.
## 8 · Independent review means independent intelligence

`reconcileAttempts()` now derives a model-family identity from each attempt.

Two clean attempts from:

```text
Qwen
Qwen
```

remain:

`SECOND_REVIEW_OWED`

Two clean attempts from:

```text
Qwen
GPT-OSS
```

may reach:

`EVIDENCE_PRESENTED`

A deterministic falsifier may also form an independent evidence dimension.

Attempt count alone no longer creates corroboration.

This closes RI-G02 mechanically.

## 9 · Durable result outranks wrapper status

J3-B-R1 proved that `ain-delegate.sh` could emit a durable provider result:

```text
exit_code = 4
recommended_next_action = reject
```

while the wrapper process itself returned shell status 0.

J6 repairs both sides.

### Delegate

After writing and printing the durable result contract, `_run_lane` now returns the worker/provider `exit_code`.

### Desktop controller

`runProvider()` derives caller-facing completion from the durable recorded attempt, not wrapper status.

### Work Unit lifecycle

A durable result with:

- nonzero numeric exit code;
- `test_results = fail`; or
- `recommended_next_action = reject`

derives lifecycle `failed`.

This closes RI-G11 on the J6 candidate.

## 10 · Host-owned lifecycle

Model output text is never parsed for lifecycle transitions.

Synthetic model logs claiming:

- `MERGED`
- `DEPLOYED`

still produce at most host-derived:

`EVIDENCE_PRESENTED`

when the structured attempt evidence is clean and independent.

J4 M10 remains closed.

## 11 · Model family precedes transport

Routing profiles name cognitive families first.

Transport resolution occurs afterward.

Current J6 transports deliberately use only evidence-backed/proven seams:

- Qwen → `qwen-local`
- GPT-OSS → `gpt-oss-local`
- Inkling → `inkling-tinker`
- Nemotron → `nemotron-tinker`

If the preferred transport is unavailable, the result is `HOLD`.

No other family is silently substituted.

J4 M5 remains closed.

## 12 · Response-budget profiles

J6 records bounded adapter/model profiles.

### External Tinker

- Inkling: 4096
- Nemotron: 4096
- `auto_expand: false`

These values are justified by J3-B-R1.

### Local adapters

Qwen / GPT-OSS are explicitly marked `adapter-managed`.

J6 does **not** invent an unsupported OpenCode output-token flag merely to make every profile look numerically identical.

GPT-OSS also records its evidence-backed low-reasoning posture as routing metadata.

No model can silently enlarge its own budget.

This closes the J5/J4 law obligation while preserving RI-G12's evidence boundary.

## 13 · Route-decision provenance

Every plan records, at minimum:

- whether deterministic capability was considered/selected;
- evidence class;
- task-shape source;
- eligible model families;
- selected primary family;
- required independent reviewer;
- external candidates;
- requested external family;
- external crossing evidence class;
- selected transport;
- stored authority facts;
- response-budget profile;
- first held reason.

The planner therefore produces an inspectable reason record rather than a hidden model-selection decision.

## 14 · Desktop binding

No new preload channel was added.

The already-ratified:

`jarvis:work-unit-action`

now has six bounded verbs after reconciliation with canonical R3:

1. `providers`
2. `preview-route` — canonical R3 pre-create pure-router preview
3. `create`
4. `status`
5. `route-plan` — J6 post-create governed planning
6. `run-provider`

Both `preview-route` and `route-plan` are non-executing. They remain distinct because R3 previews a proposed routed Work Unit before persistence, while J6 derives a plan from an already-stored governed Work Unit.

For `route-plan`, MAIN accepts only:

- Work Unit id;
- optional requested external model family.

For `preview-route`, MAIN constructs the R3 routing input from the bounded proposed Work Unit spec; the renderer cannot provide a route record or external authority grant.

It then reloads the actual Work Unit and derives:

- evidence class;
- task shape;
- permission envelope;
- local provider readiness

from governed state.

The renderer cannot submit a filesystem path, shell command, raw authority envelope, network grant, disclosure grant, spend grant, canonical SHA, or branch through `route-plan`.

A dedicated test attempts to supply a forged permission envelope; the plan ignores it and preserves the stored Work Unit's closed authority.

## 15 · J4 falsification replay

The J6 falsification suite now lives at:

`scripts/builder/__tests__/routing-intelligence-j6-proof.mjs`

The canonical R3/R2 proof remains at `scripts/builder/__tests__/routing-intelligence-proof.mjs`.

Final J6 result:

**15 passed · 0 failed**

Canonical R3/R2 reconciliation controls also remain green:

- pure routing law: **20 passed · 0 failed**
- Work Unit/Desktop binding: **8 passed · 0 failed**

It replays all ten J4 mutants and additional discriminators:

- deterministic-first;
- E2 external refusal;
- Nemotron CODE_GROUNDED refusal;
- same-model retry;
- unavailable transport / no substitution;
- E3 disclosure;
- consensus remains evidence;
- durable-result precedence;
- bounded response profiles;
- explicit external-only plan remains non-executing;
- model-authored lifecycle labels ignored;
- host lifecycle fails nonzero durable result;
- local topology;
- structured provenance.

## 16 · Regression evidence

### Full JARVIS proof

Nine suites green:

```text
55 / 0
24 / 0
18 / 0
38 / 0
15 / 0
20 / 0
 9 / 0
30 / 0
44 / 0
```

Total: **253 assertions · 0 failures**

### JARVIS Desktop

```text
164 tests
155 passed
0 failed
9 intentionally skipped
```

### Additional focused proofs

- Routing intelligence: **15 / 15**
- Provider governance: **44 / 44**
- Work Unit: **38 / 38**
- Alpha Floor: **97 / 97**
- External context membrane: **9 / 9**
- Direct Tinker: **12 / 12**

### Typehealth

```text
tsconfig.ship.json
program files  4378
diagnostics    229
baseline       239
regressions      0
```

**PASS — 10 diagnostics better than baseline.**

### Scripts TypeScript

The known repository-red scripts suite remains exactly **40 diagnostics**.

No J6 changed path appears in that diagnostic population.

J6 introduced **0** scripts TypeScript diagnostics.

## 17 · Durable evidence

Directory:

`docs/programme/evidence/JARVIS-ROUTING-INTELLIGENCE-01/J6/`

Contains:

- final routing falsification output;
- final typehealth output;
- route-plan fixtures;
- proof summary;
- SHA-256 manifest.

Raw full JARVIS/Desktop logs are not committed because canonical proof logs may contain ephemeral Builder lease tokens.

Their final-run SHA-256 values were recorded during the witness session:

- full JARVIS: `c295f0cd21341ec39559c7136551b486d9b3ae46937f84e466dd3dc3b6c87b91`
- Desktop: `ed28ed298e49bbe167c065575232f376522e2fbaff78be1d286fe9a81c39ef81`
- routing: `f89c8178904eb9fd356bdd00cbea7f8538beb066795a25093b98712efd2fae5c`
- provider: `1d1a07122d67a370fdef101685323d94c04f5e3c37d4b90ad3b583e2d86d9e27`

## 18 · Scope / non-events

J6 made no:

- external model call;
- provider spend;
- repository disclosure to an external model;
- continuity disclosure;
- member/client/PHI/production access;
- schema change;
- production mutation;
- deployment;
- merge;
- member-facing MAIA UI change;
- change to the sacred `/maia` experience.

External execution remains an explicit later provider act.

## 19 · Pre-publication freshness

Before the J6 evidence commit, canonical advanced to:

`98dda3bed79d2052fa86afb17882a387187d3d2d`

Intervening changes since the J6 ruled base were confined to:

- voice liveness / explicit-floor files;
- `MAIA-TEACHING-INTELLIGENCE-01 / T0` constitutional records.

No J6 routing/provider/Work Unit/IPC/proof path overlapped.

**Freshness reconciliation: PASS at pre-publication inspection.**

A final canonical-head check remains owed immediately before branch publication.

## 20 · J6 adjudication

### Implementation — PASS

The J5 routing constitution now has a contained implementation.

### Falsification — PASS

All J4 mutants remain rejected mechanically.

### Regression — PASS

No tested canonical JARVIS, Desktop, sovereignty, provider, or typehealth boundary regressed.

### Standing

**J6 is ready for an exact-head evidence gate.**

It is **not merge-authorized** by this witness.

## 21 · Required next act

After:

1. commit J6 candidate;
2. reconcile current `clean-main-no-secrets` freshness;
3. rerun the discriminating J6 proofs on the reconciled exact head;
4. push the exact J6 head;

present:

`J6-EXACT-HEAD-EVIDENCE-01`

with the exact candidate SHA and no merge action.

Merge requires a separate founder authorization.
