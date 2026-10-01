# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R5 — Execution Binding & Readiness Census

**Date:** 2026-10-01  
**Base:** `2e657fa0dd6261584dd77463ced7782d80906d7d`  
**Class:** Census / pre-falsifier · READ-ONLY against runtime mechanism  
**Predecessors:** O2 Work Graph · O3 Authority Planner · O4 Capability Router · O5-R1…R4  
**Standing:** ⭐ R5 CENSUS COMPLETE · ⛔ NO SCHEDULER · ⛔ NO DISPATCH IMPLEMENTATION

> **Governing boundary:** O5 may decide which already-authorized, already-routed Work Units are ready to execute. It may not manufacture a runtime identity, authority, route, capacity, or successful dependency state.

## 1. Why R5 is next

O2 explicitly defers safe parallel execution to O5. R1–R4 now close continuity/recovery, cause classification, grant-writer integrity, and evidence return. The remaining O5 obligation visible in the original 015 crosswalk is live dependency readiness / bounded parallel dispatch.

The runtime already contains three separate truths:

1. **O2 graph truth** — planned nodes with explicit `depends_on[]` and deterministic topological order;
2. **W2 runtime truth** — each canonical Work Unit’s lifecycle state;
3. **Builder session truth** — active concurrency budget plus write-worktree / branch / Work Unit ownership.

There is currently no canonical composition that says: **this O2 node is this W2 unit, its dependencies are satisfied, and it is eligible for one of the available execution slots.**

## 2. First gap: planned node → canonical runtime binding

O3 and O4 preserve the O2 `work_unit_id`, but W0.v2 runtime identity does not carry `graph_id` or a planned-node binding. The Desktop canonical W0 constructor can create a Work Unit from an independently supplied `workUnitId`.

Therefore dependency readiness cannot lawfully compare an O2 dependency id to an arbitrary W2 envelope merely because the strings happen to match.

R5 first needs an **evidence binding** between:

- `graph_id`;
- `planned_work_unit_id`;
- `canonical_work_unit_id`;
- exact O2 graph identity / digest;
- exact canonical base SHA at which the binding was made.

This binding grants no authority. It is provenance that allows O5 to know what runtime unit instantiates a planned node.

## 3. Dependency satisfaction

The safe default is deliberately strict:

- `CLOSED` satisfies a dependency;
- `ADJUDICATED` does **not** yet satisfy it — closure has not completed;
- `STOPPED`, `RETURNED`, `SUPERSEDED` do not satisfy it;
- `EXECUTING`, `EVIDENCE_READY`, `ROUTED`, and earlier states do not satisfy it;
- missing/unreadable/ambiguous binding is **BLOCKED_BY_EVIDENCE**, never assumed complete.

A later act may define successor resolution for `SUPERSEDED`; R5 does not infer it.

## 4. Node eligibility

A planned node may enter the ready set only when all of the following are true:

1. its O2 descriptor is valid and belongs to the bound graph;
2. exactly one canonical runtime unit is bound to it;
3. that runtime unit is exactly `ROUTED`;
4. every dependency has exactly one binding and every bound dependency is `CLOSED`;
5. the runtime unit’s W2 guard is internally valid;
6. no scheduler decision widens authority or changes route/lifecycle state.

R5 readiness is therefore **selection evidence**, not dispatch authority.

## 5. Capacity and parallel selection

Builder OS already owns a machine-level concurrency budget and write-session exclusivity. R5 must not duplicate or bypass those controls.

The scheduler may consume an observed `available_slots >= 0` as input evidence and select at most that many ready nodes, deterministically by O2 `topological_order`.

Important distinction:

- R5 selection says **eligible to attempt dispatch**;
- `session.mjs open` still rechecks the live concurrency budget and worktree/branch/Work Unit ownership at the moment of launch.

A stale capacity observation can therefore cause a later refusal; it can never authorize an over-budget session.

## 6. No hidden priority or speculative execution

R5 does not invent scoring, urgency, cost optimization, speculative execution, dependency skipping, or semantic priority. With the same graph/bindings/states/capacity it must return the same ready set and selected prefix.

The first scheduler is intentionally boring: **dependency truth first, deterministic bounded progress second.**

## 7. Scope exclusions

R5 does not open:

- O6 verification supervision;
- O7 founder inbox / decision surface;
- O8 semantic merge;
- integration or release authority;
- session budget override;
- implicit retry;
- automatic successor resolution;
- production deployment.

## 8. Falsifier scope

The pre-implementation suite must kill at least these designs:

| Falsifier | Wrong design killed |
|---|---|
| **R5-F1 exact binding** | matches live runtime units to planned nodes by string coincidence / objective text |
| **R5-F2 one-to-one binding** | one planned node has multiple live runtime instances, or one runtime unit instantiates multiple nodes |
| **R5-F3 closed-only dependency** | treats `ADJUDICATED`, `RETURNED`, `STOPPED`, `SUPERSEDED`, or executing states as satisfied |
| **R5-F4 all dependencies required** | starts a node when only some dependencies are closed |
| **R5-F5 routed-only own state** | selects DRAFT/AUTHORIZED/EXECUTING/terminal node as ready |
| **R5-F6 fail closed on missing evidence** | missing binding/state is treated as not-yet-complete but still schedulable |
| **R5-F7 capacity bound** | selects more nodes than observed slots or treats negative/unknown capacity as unlimited |
| **R5-F8 deterministic selection** | equal inputs produce different selected sets / hidden priority |
| **R5-F9 no authority mutation** | readiness changes W2 state, route, authority, scope, or session records |
| **R5-F10 live session recheck remains authoritative** | scheduler capacity decision bypasses `session.mjs` ownership/concurrency refusal |

No R5 falsifier is frozen by this census yet.

**Standing: O5-R5 CENSUS ✅ · PLANNED→RUNTIME BINDING GAP PROVEN · CLOSED-ONLY DEPENDENCY DEFAULT IDENTIFIED · ROUTED-ONLY ELIGIBILITY IDENTIFIED · CAPACITY INPUT / SESSION RECHECK SEPARATED · ⛔ NO IMPLEMENTATION.**

## 9. Falsifier freeze result

The R5 constitutional instrument is frozen at `tests/constitutional/jarvis-o5-r5/FREEZE.json`.

Frozen law-bearing files:

- `contract.mjs`;
- `substrate.mjs`;
- `reference.mjs`;
- `falsifiers.mjs`;
- `candidates.mjs`.

`matrix.mjs` remains unfrozen for transparent current-runtime observations later.

Result:

- **R5-F1…F10: 10/10 reference PASS**;
- **DC-F1…DC-F10: 10/10 KILLED on their named falsifier**;
- matrix: **LETHAL + DISCRIMINATING**.

The instrument caught and repaired one pre-freeze weakness: the first F2 scenario made a duplicate planned-node binding collide again on the runtime side, allowing DC-F2 to die for the wrong reason. The adversarial world was corrected to add a second otherwise-unbound valid routed runtime, isolating the one-to-one planned-node violation. No law was weakened.

Freeze guard proof:

- clean corpus → `FREEZE INTACT`;
- deliberate comment drift in `falsifiers.mjs` → `FREEZE VIOLATED (1)`, exit 1;
- byte restore from backup → `FREEZE INTACT`.

## 10. Implementation boundary opened by the instrument — mechanism still untouched

A conforming R5 implementation, if opened, is limited to:

1. immutable evidence binding between O2 planned node and W0/W2 canonical runtime unit;
2. one-to-one binding validation;
3. pure dependency-readiness evaluation with `CLOSED` as the only satisfied dependency state;
4. `ROUTED` as the only selectable own runtime state;
5. fail-closed treatment of missing/invalid binding or runtime evidence;
6. deterministic topological-prefix selection bounded by observed nonnegative capacity;
7. no runtime/session mutation by readiness calculation;
8. actual Builder session/worktree/concurrency admission rechecked live at dispatch time and remaining authoritative.

It may not yet launch a process, claim a worktree, transition W2 to `EXECUTING`, override session capacity, infer successor completion, or create O7/O8 behavior.

**Standing: O5-R5 CENSUS ✅ · R5-F1…F10 FROZEN ✅ · 10/10 DEFEAT CANDIDATES KILLED ✅ · FREEZE GUARD PROVEN ✅ · ⛔ NO RUNTIME IMPLEMENTATION · ⛔ NO DISPATCH.**
