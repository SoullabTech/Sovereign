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

## 5. Capacity and current-reachable selection

Builder OS already owns a machine-level concurrency budget and write-session exclusivity. R5 must not duplicate or bypass those controls.

O2 V1 canonically serializes its compiled graph, so current canonical can expose at most one dependency-ready node at a time. R5A may consume observed capacity as input evidence: zero/unknown capacity selects none; any positive capacity may select at most that single canonical ready node.

Important distinction:

- R5 selection says **eligible to attempt dispatch**;
- `session.mjs open` still rechecks the live concurrency budget and worktree/branch/Work Unit ownership at the moment of launch.

A stale capacity observation can therefore cause a later refusal; it can never authorize an over-budget session.

## 6. R5B parallelism explicitly deferred

Review against O3 canonical replay found that a manually branched/multi-ready graph is not current-runtime-admissible: O2 V1 emits a strict predecessor chain, and O3 reconstructs the graph from embedded intent and requires structural identity.

Therefore **R5A does not freeze multi-ready parallel scheduling law**. R5B may open only when O2 has a canonical representation capable of expressing independent nodes (or another already-governed dependency relation is explicitly admitted). Until then, O5 must not delete O2 dependencies merely to manufacture parallelism.

## 7. No hidden priority or speculative execution

R5 does not invent scoring, urgency, cost optimization, speculative execution, dependency skipping, or semantic priority. With the same graph/bindings/states/capacity it must return the same ready set and selected prefix.

The first scheduler is intentionally boring: **dependency truth first, deterministic bounded progress second.**

## 8. Scope exclusions

R5 does not open:

- O6 verification supervision;
- O7 founder inbox / decision surface;
- O8 semantic merge;
- integration or release authority;
- session budget override;
- implicit retry;
- automatic successor resolution;
- production deployment.

## 9. Falsifier scope

The pre-implementation suite must kill at least these designs:

| Falsifier | Wrong design killed |
|---|---|
| **R5-F1 canonical O2 replay** | accepts a dependency-mutated graph that O3 would reject as noncanonical |
| **R5-F2 exact binding** | matches live runtime units to planned nodes by string coincidence / objective text |
| **R5-F3 one-to-one binding** | one planned node has multiple live runtime instances, or one runtime unit instantiates multiple nodes |
| **R5-F4 closed-only predecessor** | treats `ADJUDICATED`, `RETURNED`, `STOPPED`, `SUPERSEDED`, or executing predecessor as satisfied |
| **R5-F5 routed-only own state** | selects DRAFT/AUTHORIZED/EXECUTING/terminal node as ready |
| **R5-F6 fail closed on missing evidence** | missing predecessor binding/state is treated as schedulable |
| **R5-F7 current capacity gate** | zero/unknown capacity still selects work, or positive capacity selects beyond the single current-reachable ready node |
| **R5-F8 deterministic selection** | equal canonical inputs select a different node |
| **R5-F9 no authority mutation** | readiness changes W2 state, route, authority, scope, or session records |
| **R5-F10 live session recheck remains authoritative** | readiness capacity decision bypasses `session.mjs` ownership/concurrency refusal |

No R5 falsifier is frozen by this census yet.

**Standing: O5-R5 CENSUS ✅ · PLANNED→RUNTIME BINDING GAP PROVEN · CLOSED-ONLY DEPENDENCY DEFAULT IDENTIFIED · ROUTED-ONLY ELIGIBILITY IDENTIFIED · CAPACITY INPUT / SESSION RECHECK SEPARATED · ⛔ NO IMPLEMENTATION.**

## 10. Initial falsifier freeze result

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

## 11. Pre-admission freeze correction — current-reachable R5A

After the initial freeze was pushed, review against O3 canonical replay exposed an instrument overreach: the synthetic branched graph used to prove multi-ready selection cannot be emitted by current O2 V1. O2 V1 serializes every stage, and O3 rejects any graph not identical to replay from its embedded O1 intent.

The freeze was therefore corrected **before admission**. The new R5A instrument tests only current-reachable behavior and adds an explicit canonical-replay falsifier. `FREEZE.json` records the previous hashes, commit `3dfd4d984`, amendment cause, changed scope, unchanged laws, and new hashes. R5B parallel scheduling remains unopened.

Post-correction: **R5-F1…F10 PASS · DC-F1…DC-F10 KILLED · MATRIX LETHAL + DISCRIMINATING**.

## 12. Implementation boundary opened by the corrected instrument — mechanism still untouched

A conforming R5 implementation, if opened, is limited to:

1. immutable evidence binding between O2 planned node and W0/W2 canonical runtime unit;
2. one-to-one binding validation;
3. pure dependency-readiness evaluation with `CLOSED` as the only satisfied dependency state;
4. `ROUTED` as the only selectable own runtime state;
5. fail-closed treatment of missing/invalid binding or runtime evidence;
6. deterministic selection of the single current-reachable ready node, suppressed by zero/unknown capacity;
7. no runtime/session mutation by readiness calculation;
8. actual Builder session/worktree/concurrency admission rechecked live at dispatch time and remaining authoritative.

It may not yet launch a process, claim a worktree, transition W2 to `EXECUTING`, override session capacity, infer successor completion, or create O7/O8 behavior.

**Standing: O5-R5A CENSUS ✅ · PRE-ADMISSION FREEZE CORRECTED ONCE ✅ · R5-F1…F10 CURRENT-REACHABLE LAWS FROZEN ✅ · 10/10 DEFEAT CANDIDATES KILLED ✅ · R5B PARALLELISM DEFERRED ⛔ · NO RUNTIME IMPLEMENTATION · NO DISPATCH.**
