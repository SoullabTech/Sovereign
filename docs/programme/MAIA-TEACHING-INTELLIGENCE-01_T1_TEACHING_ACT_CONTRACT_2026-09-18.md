# MAIA-TEACHING-INTELLIGENCE-01 / T1 — Teaching Act Contract

> **Class:** A — constitutional implementation boundary; pure/non-executing only
> **Governing authority:** founder T1 authorization · ratified T0 Teaching Constitution at canonical merge `98dda3bed79d2052fa86afb17882a387187d3d2d`
> **Current gate:** pure contract + deterministic falsification evidence → founder adjudication
> **Evidence subject:** `lib/maia/teaching/TeachingActContract.ts` and its isolated falsification suite
> **Stop boundary:** no runtime caller, model call, prompt change, retrieval call, learner persistence, memory write, schema, provider routing, deployment, or production effect

**Date:** 2026-09-18
**Status:** ⚠️ **T1 CANDIDATE — NOT CANONICAL UNTIL FOUNDER ADJUDICATION**
**Contract:** `tac-1`

## 1. Founder authorization

T1 is bounded to one pure, inspectable, non-executing teaching-disposition contract under ratified T0.

It may classify only the current turn among the ratified descriptive teaching-act families, including `REFRAIN`, and must expose occasion, source/provenance basis, R1-R8 checks, rationale and uncertainty.

It may not infer or persist learner identity, mastery, readiness, developmental standing, recognition, embodiment or integration. It may not call models, alter prompts, retrieve new sources, execute teaching, write memory, create learner profiles, change schema, route providers, deploy or affect production.

## 2. Contract shape

T1 accepts only:

```text
occasion
sourceBasis
restraints
candidateAct
uncertainty
```

No member text enters the contract.

No learner-state field exists.

No free-form rationale enters the record.

The output is always:

```text
contractVersion = tac-1
act
executionStanding = NON_EXECUTING_PROPOSAL
authorityEffect = DESCRIPTIVE_PROPOSAL_ONLY
occasion
sourceBasis
restraintChecks = R1..R8
rationale
uncertainty
learnerClaims = []
mayExecute = false
mayPersistLearnerState = false
```

## 3. Closed act grammar

```text
ORIENT
EXPLAIN
ILLUSTRATE
CONTRAST
INQUIRE
INVITE_EXPERIENCE
OFFER_PRACTICE
CHECK_UNDERSTANDING
REPAIR_MISUNDERSTANDING
REFRAIN
```

`REFRAIN` is first-class. It is not `null`, omission, exception or silent failure.

## 4. Decision law

### Restraint / authority first

Any triggered T0 R1-R8 check yields `REFRAIN`.

R8 is explicitly tagged `failure_boundary` so dysfunction cannot masquerade as pedagogical wisdom.

### Occasion second

If no member occasion exists, the result is:

```text
REFRAIN / no_member_occasion
```

even when retrieval is highly relevant.

### Direct explanation third

If the member explicitly asks for a plain explanation and no restraint fires:

```text
EXPLAIN
```

This preserves T0's anti-over-restraint falsifier.

### Requested act / present movement

A member-requested family or already-structured current-turn candidate can be proposed.

The proposal never executes.

## 5. Source fidelity

Source basis distinguishes:

```text
source
maia_paraphrase
maia_synthesis
```

A source-dependent act fails closed unless source standing is `governed_ready`.

The contract has no author-voice or impersonation field.

Retrieval relevance is descriptive only and cannot create a teaching occasion.

## 6. Representation Authority standing

T1 output is `DESCRIPTIVE_PROPOSAL_ONLY`.

It may not alter:

- identity;
- rights;
- access;
- eligibility;
- curriculum position;
- mastery;
- readiness;
- recognition;
- integration.

No learner claim can be represented in the T1 record.

A future execution/admission layer would require a separate founder authorization.

## 7. Falsification suite

The executable suite pins:

1. **F-T1-01** — retrieval relevance does not imply teaching.
2. **F-T1-02** — direct explanation remains available when explicitly requested.
3. **F-T1-03** — explicit requested teaching family survives.
4. **F-T1-04** — present-movement candidate remains proposal-only.
5. **F-T1-05** — R1 member decline overrides teaching.
6. **F-T1-06** — R2 ungoverned source refuses source-dependent teaching.
7. **R3-R7 isolation** — every ratified restraint independently yields `REFRAIN`.
8. **F-T1-07** — R8 is machine-readable as a failure boundary.
9. **F-T1-08** — learner-state / mastery fields are rejected.
10. **F-T1-09** — provenance layers remain distinct; `authorVoice` is rejected.
11. **F-T1-10** — source-independent direct explanation remains possible.
12. **F-T1-11** — output is descriptive, claim-free, non-executing and non-persistent.
13. **F-T1-12** — deterministic same-input/same-output behavior.
14. **F-T1-13** — every record exposes R1-R8.
15. **F-T1-14** — module has no runtime I/O, retrieval, model, prompt, DB or memory dependency.

## 8. Legacy teaching router census

A pre-existing runtime file exists:

`lib/sovereign/teachingRouter.ts`

It predates T0/T1.

T1 does **not** modify, import, wrap, authorize, reconcile or replace it.

The T1 module has no runtime callers.

Whether that legacy router conforms to T0 is a separate future conformance question, not silently decided here.

## 9. What would make T1 fail

T1 is RED if:

- relevant retrieval can create a teaching occasion;
- `REFRAIN` is not a normal disposition;
- a direct explanation request is blocked without an actual restraint;
- a learner-state or mastery field can enter;
- source-dependent teaching can proceed with unavailable source standing;
- source / MAIA paraphrase / MAIA synthesis collapse;
- R8 cannot be distinguished from intentional restraint;
- output can execute or persist;
- the module acquires runtime/model/retrieval/prompt/DB/memory dependencies;
- any runtime caller imports T1 without a later founder authorization.

## 10. Stop boundary

```text
pure contract                    ✅ AUTHORIZED
deterministic classifier         ✅ AUTHORIZED
closed act grammar               ✅ AUTHORIZED
REFRAIN first-class              ✅ REQUIRED
source/provenance basis          ✅ REQUIRED
R1-R8 checks                     ✅ REQUIRED
rationale + uncertainty          ✅ REQUIRED
falsification suite              ✅ REQUIRED

member text inspection           ⛔ CLOSED
model call                       ⛔ CLOSED
retrieval call                   ⛔ CLOSED
prompt change                    ⛔ CLOSED
runtime caller                   ⛔ CLOSED
teaching execution               ⛔ CLOSED
learner profile/state            ⛔ CLOSED
persistence / memory             ⛔ CLOSED
schema / migration               ⛔ CLOSED
provider routing                 ⛔ CLOSED
deployment / production          ⛔ CLOSED
T2                               ⛔ NOT OPEN
```

**Next gate:** founder adjudication of T1 after exact-head falsification evidence.

## 11. Exact local falsification evidence

Evidence base:

`98dda3bed79d2052fa86afb17882a387187d3d2d`

Targeted suite:

```text
lib/maia/teaching/__tests__/TeachingActContract.test.ts

Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
Snapshots:   0
```

TypeScript no-regression gate:

```text
tsconfig.ship.json
program files  4378 (baseline 3965)
errors         229  (baseline 239)
10 errors fixed since baseline
0 regressions
PASS
```

Additional containment evidence:

```text
git diff --check                         PASS
runtime imports of TeachingActContract  0
legacy teachingRouter modified          NO
T1 member-text field                    NONE
T1 learner-state field                  NONE
T1 model/retrieval/DB/prompt imports    NONE
```

The first Jest invocation in the isolated worktree failed before loading T1 because the worktree had no local `node_modules` and bare `npx` could not resolve the repository `ts-jest` preset. The worktree was then bound to the existing repository dependency tree with an untracked local symlink and the exact suite passed 20/20. That setup failure is not counted as a T1 falsification result.

## 12. Founder adjudication docket

T1 is ready for founder adjudication on these exact questions:

1. **Act grammar** — take, revise, or refuse the ten-family closed grammar including first-class `REFRAIN`.
2. **Occasion law** — take, revise, or refuse: retrieval relevance cannot create a teaching occasion.
3. **Direct explanation** — take, revise, or refuse: explicit plain explanation yields `EXPLAIN` unless a ratified restraint fires.
4. **R1-R8 precedence** — take, revise, or refuse the fail-closed restraint/authority ordering.
5. **Source basis** — take, revise, or refuse the `not_required | governed_ready | unavailable` standing and provenance layers.
6. **Learner-claim exclusion** — take, revise, or refuse the load-bearing `learnerClaims=[]` / no learner-state input rule.
7. **Authority effect** — take, revise, or refuse `DESCRIPTIVE_PROPOSAL_ONLY`, `mayExecute=false`, `mayPersistLearnerState=false`.
8. **Legacy-router boundary** — confirm that T1 neither legitimizes nor repairs `lib/sovereign/teachingRouter.ts`.

### Founder options

**TAKE T1** — ratify `tac-1` and its falsification evidence as the pure Teaching Act Contract. This does not authorize a runtime caller or T2.

**TAKE BOUNDED** — identify the surviving contract clauses and the specific boundary requiring another falsification pass.

**RETURN** — revise the contract or test population. No runtime authority opens.

**REFUSE / PARK** — T1 does not proceed.

## 13. Final T1 standing

```text
T0 teaching constitution          ✅ CANONICAL
T1 pure contract                  ✅ IMPLEMENTED LOCALLY
T1 falsification suite            ✅ 20/20 PASS
TypeScript no-regression          ✅ PASS
runtime caller                    ⛔ NONE
legacy router reconciliation      ⛔ NOT PERFORMED
teaching execution                ⛔ CLOSED
learner state / persistence       ⛔ CLOSED
prompt / model / retrieval        ⛔ CLOSED
schema / deployment / production ⛔ CLOSED
T2                                ⛔ NOT OPEN
```

**Next gate: founder adjudication of T1 only.**

## 14. Canonical freshness reconciliation

The T1 candidate was initially built against canonical:

`98dda3bed79d2052fa86afb17882a387187d3d2d`

Before PR creation, canonical advanced to:

`7937fc7cf1b0aede76b4e5302e36800c85f997da`

through JARVIS Routing Intelligence PR #1382.

The intervening canonical delta was confined to JARVIS routing documentation, desktop Work Unit preview/control files, and routing-intelligence builder proofs. It did not touch:

- the ratified T0 teaching constitution;
- `lib/maia/teaching/**`;
- `lib/sovereign/teachingRouter.ts`;
- governed knowledge retrieval;
- Representation Authority Law or its named teaching-governance neighbors.

The T1 branch was rebased cleanly onto current canonical and the falsification suite was rerun.

Post-rebase evidence:

```text
canonical base     7937fc7cf1b0aede76b4e5302e36800c85f997da
candidate code head before this documentary evidence append
                   2b4d00a5d29bb00926e95a60483c5cb510526bf5
targeted tests     20/20 PASS
typehealth         229 vs 239 baseline · 0 regressions
runtime callers    0
git diff --check   PASS
```

This reconciliation changes no T1 contract semantics and opens no new authority.
