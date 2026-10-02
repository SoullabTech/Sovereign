# SOULLAB-JARVIS-015 — Orchestration, Delegation, and Recovery · Substrate Crosswalk

**Date:** 2026-09-30
**Base:** `04005ca7c65c8cdc1420d482710a50ea0c3b8f68`
**Class:** Census + design candidate — READ-ONLY against runtime code
**Standing:** ⛔ NO IMPLEMENTATION · ⛔ O5 NOT OPENED · ⛔ NO NEW VOCABULARY LANDED

## 0. Why this record exists instead of code

015 proposed `JARVIS-015-R1`: implement `DelegationPacket`, `ExecutionReturn`,
`FailureClassification`, `Checkpoint`. A census of the repository before building
found that **most of 015 already exists under other names**, and that R1 as written
sits exactly on the boundary of **O5 Execution Supervisor — NOT OPEN**
(`JARVIS-ORCHESTRATION-OPERATOR-01_O0` §stages; restated in O4 §closing).

Building R1 as specified would violate law the programme already ratified:

- O3: *"O3 does not create a parallel authority vocabulary."*
- O4: *"It composes existing canonical routing law. It does not create a second router."*
- Unit 11 seam: *"Do NOT create a second JARVIS implementation."*

So the honest first act is the crosswalk: what 015 names, where it already lives,
and which parts are genuinely absent.

⭐ **Governing question of 015 stands and is correct:** *how does JARVIS coordinate
many executors and partial failures without losing the thread of the work?* The
census sharpens it: **the thread is already governed on the way in; it is lost on
the way out and on the way back.**

## 1. Crosswalk — 015 section → existing substrate

| 015 | Proposal | Existing canonical substrate | Standing |
|---|---|---|---|
| 015.1 Work Graph | `WorkNode` DAG | **O2** `jarvis-desktop/src/operator-work-graph.js` — deterministic DAG of planned Work Unit descriptors, topological order, `INSPECT·SYNTHESIZE·PROPOSE·MODIFY·VERIFY·RELEASE_READINESS` | ✅ EXISTS — ⛔ do not add a second graph |
| 015.2 Readiness derived | `canStart(node)` | **O3** authority planner (missing authority → deterministic operator gate) + **O0** gate decisions `CONTINUE · NEEDS_OPERATOR_AUTHORITY · NEEDS_OPERATOR_JUDGMENT · BLOCKED_BY_EVIDENCE · STOP` + W2 lifecycle guards | ✅ EXISTS (authority + evidence); ⚠️ dependency-satisfaction over *live* completion state not yet composed — that is O5 |
| 015.3 Delegation packet | structured act packet | **W0.v2** Work Unit (identity · context · scope `allowed_paths/forbidden_paths` · authority · base_ref) + **Unit 10** `jarvis-packet-guard.mjs` (`WORKER_VISIBLE_FIELDS` vs `VERIFIER_ONLY_FIELDS`, answer-leakage lint, SHA-bound selectors) + **W3T** transport binding | ✅ EXISTS — a DelegationPacket is a **projection** of an AUTHORIZED W0.v2, never a new object |
| 015.4 Return packet | `ExecutionReturn` | **W4.v2** append-only ledger (`model_identity · attempt · artifact · diff · test_result · verifier_result · resulting_commit`; *"model/verifier output is evidence only"*) + **DR1** durable-result mapper (`completed · failed · refused · rejected · insufficient · escalated`; wrapper status never authoritative) + Unit 11 mechanical verifier | ✅ MOSTLY EXISTS; ⚠️ **no ledger kind for `finding` or `proposal`** |
| 015.5 Failure taxonomy | 7 cause classes | `failure_class` codes across `jarvis-runtime-pipeline.mjs`, `jarvis-local-worker.mjs`, runtime store (`PACKET_SCHEMA_INVALID`, `NATIVE_AUTHORITY_TOO_BROAD`, `WORKER_TIMEOUT`, `RUNTIME_STOPPED_MID_RUN`, …) | ⚠️ PARTIAL — codes are **specific and flat**; there is no **cause axis** mapping a code to a lawful response |
| 015.6 Recovery without forgetting | resume from checkpoint | `reconcileOrphanedRuns()` (`jarvis-runtime-store.mjs`) — ⚠️ **SUPERSEDED by O5-R2 census §1: this function has NO caller; the live behaviour is a silent orphan (in-flight state kept indefinitely, no disposition)** | ❌ **GAP, and the existing behaviour is the opposite of 015**: any run left in-flight by a hard stop is collapsed to `FAILED / RUNTIME_STOPPED_MID_RUN`. That is honest (an in-flight state is not evidence of a live worker) but it *is* "start over from the prompt". `PAUSED_FOR_GOVERNANCE` resumes only the authority-stop case |
| 015.7 Checkpoints | `Checkpoint` | none | ❌ GAP — the only genuinely new object in R1 |
| 015.8 Rollback as governed act | `canRollback()` | deploy: `deploy-production.sh rollback` + rollback tags; worktree: `NATIVE_RUNTIME_ROLLBACK_*` in pipeline | ✅ EXISTS at both scales; ⚠️ not unified under O0 action rules as a named action |
| 015.9 Parallelism | graph-permitted concurrency | O2 topological order; deploy-lane `flock` | ⚠️ ordering exists, concurrent dispatch does not (O5) |
| 015.10–11 Conflict / semantic merge review | textual · semantic · authority conflict | none | ❌ GAP — belongs to **O8 Integration Supervisor (NOT OPEN)** |
| 015.12 Programme invariants | global invariant registry | per-lane constitutional guards (`tests/constitutional/**`, `check:no-supabase`, freeze guards) | ⚠️ exists per lane, not as one registry evaluated per act |
| 015.13–14 Cross-lane consequence | finding propagates, authority does not | none as an object; the law is already practised in prose (*"the lane that finds a defect does not thereby own it"* — S3, thread-store finding) | ❌ GAP as an object; ✅ LAW already ratified in practice |
| 015.15 Scheduler | maximize validated progress | none | ❌ GAP — O5 |
| 015.16–17 Cost-aware routing · local-first | least expensive executor that satisfies the evidence burden | **J5/J6** routing law + **O4** *"least-powerful lawful capability"* + W3T transports (`qwen-local`, `gpt-oss-local` unmetered first) | ✅ EXISTS — 015.17 is a restatement of O4 §1. ⛔ Do not re-legislate it |
| 015.18–19 Founder inbox | Needs Kelly · In motion · Watching | O0 operator gates are its input; **O7 Operator Decision Surface (NOT OPEN)** | ⚠️ inputs exist, surface is O7 |
| 015.20 No dark work | every act discoverable | runtime store runs + W4 ledger + lifecycle `STOPPED · RETURNED · SUPERSEDED` dispositions | ✅ MOSTLY; the §015.6 collapse is the one place work loses its disposition *detail* |

## 2. What is genuinely new

Four gaps survive the census. Everything else is composition.

1. **Checkpoint + resume (015.6–7).** The only new object. It must *replace* the
   collapse in `reconcileOrphanedRuns()` with: re-observe actual repo state →
   compare with last checkpoint → `RESUMABLE | DIVERGED | UNRECOVERABLE`, and the
   decision to continue is an **O0 gate**, never automatic.
2. **Failure cause axis (015.5).** A pure classifier from existing `failure_class`
   codes to the seven causes. ⛔ It adds an axis; it does not rename a single code.
3. **Two evidence-only ledger kinds (015.4, 015.13).** `finding` (unexpected
   observation / scope breach / cross-lane consequence) and `proposal`
   (executor-suggested next act). Both appended to W4 as **evidence**, never as
   graph nodes.
4. **Consequence finding (015.13–14).** Shape of `finding` with `affected_lane`,
   `reason`, `evidence_refs`, `urgency` — and structurally **no write-path field**.

## 3. Laws R1 must carry (restated from 015, reconciled with O-series)

- **L1 — Executor substitution preserves act identity.** Changing executor changes the
  W3T transport binding and appends a new `attempt`; the W0.v2 id and the W2
  authorized-core snapshot are unchanged. (Already guarded by W2's authorized-core
  immutability — R1 must prove, not re-implement.)
- **L2 — Proposal ≠ authorization.** An executor `proposal` can only enter the
  programme as **input to O1** (a new operator intent) — ⛔ never as an O2 node, ⛔
  never as an O3 held authority. 015.4 said *"JARVIS evaluates them"*; the
  sharper reading is **JARVIS may evaluate; only the operator may convert.**
- **L3 — Resume re-observes; it never trusts the checkpoint.** A checkpoint is
  evidence of what *was*; the repository is what *is*. Resume on divergence
  STOPs to `BLOCKED_BY_EVIDENCE`.
- **L4 — Recovery mints no authority.** A resumed act carries only the
  authorized core it had; a checkpoint may not widen `allowed_paths`, extend
  expiry, or survive a canonical tip move without the O2 freshness precondition.
- **L5 — Finding propagates, authority does not.** A `finding` names another lane
  and cannot carry a path, command, or grant into it.
- **L6 — Cause classification is non-authoritative over disposition.** Classifying a
  failure as `ENVIRONMENT` does not license retry; retry remains governed by the
  existing lifecycle (*retry ≠ independent review*, W1–W5 closure).

## 4. Falsifiers, each with a defeat candidate

Per the S3 Class-B discipline (lethality before implementation):

| # | Proposition | Defeat candidate (plausible, competent, wrong) |
|---|---|---|
| F1 | Swapping executor mid-act keeps W0 id + authorized core | re-mints a Work Unit per executor "for clean provenance" |
| F2 | An executor `proposal` never appears in O2 graph or O3 plan | auto-enqueues proposals whose kind is `INSPECT` "because read-only is harmless" |
| F3 | Resume on a moved repo HEAD STOPs to evidence gate | resumes when the diff "still applies cleanly" |
| F4 | A checkpoint cannot widen authority | checkpoint stores the envelope and resume re-reads it from the checkpoint rather than from the W2 guard |
| F5 | A `finding` against Lane B confers no write into Lane B | finding carries a `suggested_patch` the next act applies |
| F6 | `ENVIRONMENT` cause does not by itself authorize retry | classifier returns `retry: true` for transient causes |
| F7 | Crash mid-act produces a checkpoint-backed disposition, not bare `FAILED` | keeps `reconcileOrphanedRuns()` and adds a checkpoint that nothing reads |

⭐ F7's defeat candidate is the likeliest real outcome: a checkpoint object that is
written faithfully and consulted by nothing.

## 5. Placement

015-R1 is **the opening unit of O5 Execution Supervisor**, not a parallel
programme. Semantic merge review → O8. Founder inbox → O7. Scheduler/parallel
dispatch → later O5 units. 015 should be carried as the **design intent for
O5/O7/O8**, which is what the JARVIS manual permits (*canonical for architecture
and design intent only; authorizes no implementation*).

## 6. Owed before any code

1. ⛔ **Founder act opening O5** with R1 (§2 items 1–4) as its sole scope.
2. Ruling on L2's sharpened reading (proposals enter via O1 only).
3. Ruling on where checkpoints persist (runtime store under `AIN_HOME` is the
   natural home; ⛔ not PostgreSQL, ⛔ not the Work Unit itself — W0.v2 is
   authorized-core-frozen after AUTHORIZED).
4. Falsifier suite + defeat candidates authored and proven lethal, then frozen,
   **before** implementation.

**Standing: 015 ACCEPTED AS DESIGN INTENT (pending founder) · CROSSWALK COMPLETE ·
4 GENUINE GAPS NAMED · ⛔ O5 NOT OPENED · ⛔ NO CODE · ⛔ NO VOCABULARY LANDED ·
PRODUCTION UNTOUCHED.**
