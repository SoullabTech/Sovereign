# JARVIS-ROUTER-03B — Founder Desktop Gesture — 2026-09-18

**Standing:** BOUNDED IMPLEMENTATION · WORK-VIEW GESTURE ADMITTED · NO MERGE/DEPLOY

## Founder grant

On 2026-09-18 the founder explicitly authorized one bounded JARVIS Desktop interface for an
existing canonical Work Unit using the already-ratified `modelWorkUnit()` preload method.

The authorized visible acts are:

```text
Plan
Execute
```

with these boundaries:

- Plan is non-executing;
- Execute requires a separate explicit human confirmation gesture;
- the UI may display model roles, local/external standing, stage/external-call budgets, routing
  blockers, and orchestration disposition;
- the UI may not edit routing/provider/evidence/authority/budget fields;
- no additional IPC channel;
- no automatic execution, confirmation, or provider spend;
- no write-capable model authority;
- no merge or deployment;
- no MAIA member-facing UI change.

## Placement

The interface lives in the existing JARVIS Desktop **Work** view.

No new navigation section, model console, or router screen is created.

The new card appears before the older C0/C1/C3 free-form task composer and is labelled:

```text
Canonical multi-model Work Unit
```

This placement keeps two different acts legible:

```text
canonical Work Unit operation   → ROUTER-01/02/03 governed path
bounded task submission         → existing C0/C1/C3 Desktop path
```

ROUTER-03B does not collapse those paths.

## Editable surface

The model Work Unit card has exactly one editable value:

```text
existing canonical Work Unit ID
```

It contains no provider/model/routing/evidence/budget selectors or textareas.

The card explicitly tells the founder:

> Routing, provider choice, evidence classification, authority, and budgets are read-only here and
> come from the canonical Work Unit.

Local Work Unit ID validation is preflight only. Main and ROUTER-03 canonical admission remain the
actual authority boundary.

## Plan gesture

Plan calls:

```text
modelWorkUnit("plan", workUnitId, false)
```

The preload bridge strips the unused confirmation field from plan requests, so canonical runtime
admission still receives only:

```json
{ "action":"plan", "work_unit_id":"..." }
```

Plan makes no model call.

The card displays only the founder-authorized presentation fields:

- primary role + provider identity as provenance;
- challenger role(s) + provider identity as provenance;
- local vs external standing;
- provider standing;
- model stages planned / budgeted;
- external calls planned / budgeted;
- typed routing blocker, when present;
- orchestration disposition, when present.

The pure DOM-free helper `jarvis-desktop/src/model-work-unit-ui.js` is a presentation lens over
ROUTER-03 output. It does not call IPC or choose providers.

## Execute gesture

Execute is not initially visible.

It is rendered only when the plan summary says:

```text
status = READY
executable = true
```

Clicking `Execute…` does **not** execute.

It opens a second confirmation box stating the canonical Work Unit ID and whether the already-
canonical plan includes external provider calls.

The confirmation explains that it cannot edit routing, providers, authority, evidence
classification, or budgets.

Only the separate button:

```text
Confirm Execute
```

calls:

```text
modelWorkUnit("execute", lastPlannedWorkUnitId, true)
```

Cancel closes the confirmation box without execution.

Before execution, renderer code rechecks that the current Work Unit ID still matches the ID that was
planned.

**Confirm Execute also re-plans the canonical Work Unit immediately before execution.** JARVIS
compares a non-displayed execution guard containing:

- ROUTER-01 route-plan identity;
- planned stage roles/provider ids/local-vs-external standing;
- model-stage budget;
- external calls planned;
- external-call budget;
- current READY standing.

If that guard differs from what the founder just reviewed, JARVIS does **not** execute. It displays
the updated plan and requires the founder to choose Execute and confirm again.

This closes the plan-to-execute race: a canonical Work Unit may not change after review and then run
under stale founder consent.

If the user edits the Work Unit ID at any time, the stored plan, execution guard, and execute standing
are discarded.

After one execution result, `ready_to_execute` and the execution guard are cleared. Another
execution therefore requires a fresh Plan.

## No ambient execution

There are exactly two model-runtime bridge call sites in renderer code:

```text
Plan
confirmed Execute
```

Neither application initialization, render cycles, status refreshes, timers, nor navigation invoke
`modelWorkUnit()`.

Pressing Enter in the Work Unit ID input maps to Plan only.

No provider call occurs merely by opening Work, rendering a plan, or viewing a blocker.

## Display standing

The interface intentionally distinguishes:

```text
LOCAL
EXTERNAL
```

without turning either into a quality score.

Typed ROUTER-03 blockers display as blocked states. A blocked plan never exposes Execute.

`STOPPED / REVIEW_REQUIRED` remains stopped/review-required after an orchestration. The UI does not
upgrade disagreement or model consensus into verification.

`COMPLETE / READY_FOR_EXISTING_GATE` is displayed as an orchestration disposition, not as proof.

ROUTER-01 advancement law remains controlling.

## IPC authority unchanged

ROUTER-03B adds no channel.

The invoke surface remains exactly eleven ratified channels and exactly one model-runtime channel:

```text
jarvis:model-work-unit
```

The rejected wider channels remain absent:

```text
jarvis:model-routing-status
jarvis:plan-model-work-unit
jarvis:execute-model-work-unit
```

## MAIA boundary

ROUTER-03B changes only JARVIS Desktop.

It does not change `/maia`, MAIA member-facing UI, production services, or member data.

## Proof

Current bounded proofs include:

```text
model Work Unit presentation lens       7 passed · 0 failed
ROUTER-03B founder gesture proof       49 passed · 0 failed
ROUTER-03A successor proof             40 passed · 0 failed
aggregate npm run jarvis:proof         252 passed · 0 failed across 9 suites
```

The gesture proof establishes:

- existing Work navigation is reused;
- no model/router navigation view is added;
- one model Work Unit card;
- Work Unit ID is its only editable field;
- no select/textarea authority controls;
- Plan is the only action available initially;
- Plan invokes only the non-executing action;
- Execute appears only after `ready_to_execute`;
- opening Execute confirmation performs no execution;
- Confirm Execute is a separate human gesture;
- execute carries the exact true confirmation bit;
- Work Unit ID is rechecked before execute;
- Confirm Execute re-plans and compares route/stage/budget identity before execution;
- plan drift stops execution and requires a fresh visible confirmation;
- editing the ID invalidates the plan and execution guard;
- no initialization/render/timer performs model execution;
- preload authority remains exactly the ROUTER-03A eleven-channel surface;
- no provider/model/routing/evidence/budget authority-edit controls exist.

## Not done

- no live model/provider witness in this lane;
- no automatic provider spend;
- no new IPC channel;
- no routing metadata editing;
- no provider/model selector;
- no write-capable model authority;
- no full Inkling;
- no Nemotron Ultra;
- no production access;
- no merge;
- no deployment;
- no MAIA member-facing UI change.

Repository governance at closure also requires:

```text
no Supabase                  PASS
provider governance          PASS
no direct Anthropic SDK      PASS
PHI log gate                 PASS
design canon                 PASS
pre-commit sovereignty       PASS
secret scan                  PASS
large-file gate              PASS
```

A live dev relaunch was intentionally not used as the closure witness because an installed JARVIS
instance was already active in a separate founder session. ROUTER-03B does not disturb or replace an
active founder app merely to obtain a visual witness; the bounded presentation/gesture proofs are the
evidence for this branch.

## Next gate

ROUTER-03B completes the bounded founder Desktop gesture on its branch.

Before any merge or installed-app promotion, the remaining acts are repository integration gates:

1. reconcile ROUTER-01 → ROUTER-02 → ROUTER-03 → ROUTER-03A → ROUTER-03B into one exact review
   lineage;
2. run the full repository/JARVIS proof population on that exact candidate;
3. obtain any required Frontier/Mentor verification;
4. present a separate exact-head **merge-only** authorization.

No merge or deployment authority is created by ROUTER-03B.
