# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R2 — Existing Runtime Recovery Census

**Date:** 2026-09-30
**Base:** `4f90085f` (O5-R1 freeze on `04005ca7`)
**Class:** Census — READ-ONLY. ⛔ No runtime file modified. ⛔ No seam designed.
**Frozen suite:** O5-R1 @ `af2f0203`, untouched.

## 0. Architectural law carried in (founder, R2-C)

> **The checkpoint is evidence about a prior execution. It is never authority to execute the next act.**

```text
Checkpoint           = what appears to have happened
Work graph / unit    = what the work is
Live authority       = what may happen now
Effect knowledge     = PROVEN ABSENT → may issue · PROVEN PRESENT → must not repeat · UNKNOWN → BLOCKED_BY_EVIDENCE

Recovery decision    = intersection(checkpoint evidence, reconstructed work, live authority, effect knowledge)
```

⭐ *The recovery operator's question is not "where did I leave off?" but "what can I know
happened, what remains authorized now, and what may I safely cause next?"*

## 1. ⚠️ Premise correction — stated first because two records carry it wrong

The 015 crosswalk (§1, 015.6 row) and the O5-R1 record (§7) and CLAUDE.md said
`reconcileOrphanedRuns()` *is* DC-1 in production. **That is false, in two ways.**

1. **It has no caller.** `grep` across every file type outside `node_modules`/`.git`
   finds only its definition (`scripts/builder/jarvis-runtime-store.mjs:101`). It is
   dead code. (The clone is shallow — 243 commits — so when its caller was removed,
   if one ever existed, is not recoverable here.)
2. **Even if called, it does not restart.** It marks in-flight runs
   `FAILED / RUNTIME_STOPPED_MID_RUN`. A re-submission of the same `work_unit_id` is then
   refused with `WORK_UNIT_ID_IN_USE`, because the on-disk packet carries the old
   `runtime_run_id` (`jarvis-runtime-pipeline.mjs` VALIDATING). So its nearest candidate
   is **DC-9 (inert)** with a terminal disposition, ⛔ not DC-1.

**What actually happens today on interruption:** nothing. An interrupted run keeps
whatever in-flight state its last `saveRun()` wrote (`RUNNING`, `VERIFYING_EVIDENCE`, …)
**indefinitely**. No process discovers it, no disposition is written, and the
`work_unit_id` stays locked. That is a behaviour the R1 corpus did not name: a
**silent orphan**. It fails F1 (no resume) like DC-9 does, but unlike DC-9 it leaves **no gate
and no disposition** — work goes dark. That violates 015.20 *no dark work*.

The earlier records are corrected in place, marked as superseded rather than deleted.

## 2. Two execution substrates, not one

The census found **two live execution paths with different recovery physics**. Any
O5 seam must say which one it serves.

| | **Path A — runtime pipeline (local-native)** | **Path B — canonical W v2 (provider execution)** |
|---|---|---|
| Entry | `jarvis-desktop/src/builder-mechanism.js · runWorkUnit()` → `executeRun()` | `jarvis-desktop/src/work-unit-control.js` (E1 execution) → `canonical-work-unit-v2.js` |
| Unit | Unit 10 packet (`packets/<id>.json`) | W0.v2 envelope (`work-units-v2/<id>.json`) |
| Lifecycle | `RUN_STATES` (pipeline §5) | W2.v2 `DRAFT…EXECUTING…CLOSED` |
| Authority | `checkAuthority(packet)` (lane) + `validateNativeExecutionBoundary` + `validateWorkerGate` | W2 authorized-core guard + execution grant (ISSUED/CLAIMED/CONSUMED) + EXECUTING transition |
| Evidence | run record, `events.jsonl` (best-effort), result file, patch-admission ledger, logs | W4.v2 ledger (`model_identity · attempt · artifact · test_result …`) + durable-result file + grant ledger |
| Touches W2/W4? | ⛔ **No** | ✅ Yes |

⭐ **The R1 contract's vocabulary ("live W2 guard", "W4 ledger kinds") exists only on Path B.**
Path A has no W2 guard and no W4 ledger at all.

## 3. Seam map

Legend: **EXISTS · PARTIAL · MISSING · WRONG**

### Path A — runtime pipeline

```text
orphan discovery            MISSING   reconcileOrphanedRuns() dead; nothing scans runs/
      ↓
checkpoint/state read       PARTIAL   run record (atomic per transition) holds only the coarse
                                      state; no per-effect phase
      ↓
authority revalidation      MISSING   authority checked once at VALIDATING; no re-derivation
                                      on any re-entry (there is no re-entry)
      ↓
reconstruction              MISSING   no path re-enters executeRun for an existing run
      ↓
resume decision             MISSING   PAUSED_FOR_GOVERNANCE → QUEUED is declared legal and
                                      never performed by any code
      ↓
effect probe                MISSING   parent sees one opaque child (ain-delegate.sh); effects
                                      inside it are invisible to the run record
      ↓
dispatch / not / block      WRONG     effects are sent inside the child with no durable phase
                                      written before sending
      ↓
effect witness              PARTIAL   patch-admission ledger (admitted/applied events), git
                                      commit in worktree, result file — all written by the child
      ↓
ledger convergence          PARTIAL   result file + episodes line are written LAST; a crash
                                      before them leaves applied files/commit with no result
```

**Effects inside Path A's single "RUNNING" state** (from `ain-delegate.sh local-native`):
worktree claim (git worktree + PID lock) · Builder session `open` · log rotation · model
call · NPA1 patch **apply** (writes files) · **verifier commands via `eval` in the worktree**
(effects of arbitrary class) · rollback `reset --hard` / `clean -fd` on failure · JARVIS
**candidate commit** · result file · episodes line. Before the child: packet file write.
After: `releaseRun()` — which has **no caller**, so Builder claims and worktree locks outlive every run.

### Path B — canonical W v2

```text
orphan discovery            MISSING   nothing scans work-units-v2/ for EXECUTING units
      ↓
checkpoint/state read       EXISTS*   derivable from three durable facts, no new store:
                                      grant ledger (jsonl, append-only) · durable-result file ·
                                      W4 envelope
      ↓
authority revalidation      EXISTS    W2 guard (authorized-core snapshot) + grant standing are
                                      durable and re-readable; nothing re-reads them on recovery
      ↓
reconstruction              EXISTS    W0.v2 envelope is the unit; no reconstruction needed
      ↓
resume decision             MISSING   no operator decides anything after interruption
      ↓
effect probe                MISSING   provider runs inside a containment runRoot deleted in
                                      `finally`; no probe → every in-flight call is UNKNOWN
      ↓
dispatch / not / block      PARTIAL   single-use grant means a CLAIMED grant can never be
                                      re-claimed → no duplicate dispatch BY CONSTRUCTION (safe),
                                      but also no disposition (wedged, not gated)
      ↓
effect witness              PARTIAL   persistCanonicalDurableResult() — ⚠️ plain writeFileSync,
                                      NOT atomic (unlike atomicWrite in the same file)
      ↓
ledger convergence          EXISTS    appendCanonicalExecutionResultV2 → W4 model_identity,
                                      attempt, artifact
```

**Path B already has the idempotence phases as durable facts:**

| R1 phase | Path B durable fact |
|---|---|
| `authorized` | grant `ISSUED` (ACTIVE) + W2 `ROUTED`/`EXECUTING` |
| `dispatched` | grant `CLAIMED`, no durable-result file |
| `effect_witnessed` | durable-result file present, no W4 attempt for it |
| `ledgered` | W4 attempt whose `evidence_refs` names that result |

⭐ **Path B's checkpoint is a derived read over existing records, not a new object.**
That answers the question you asked in R2: on Path B, O5 does **not** need a new supervisor
abstraction or checkpoint store, only a read-only resume operator over the grant ledger,
the durable result and W4.

## 4. Falsifier crosswalk against reality

| Law | Path A today | Path B today | Existing seam | Required change |
|---|---|---|---|---|
| **F1** restart-from-zero | ❌ silent orphan; no resume; unit id locked | ❌ wedged (CLAIMED grant blocks new grant: `UNRESOLVED_GRANT_ALREADY_EXISTS`); no resume | B: grant ledger + W4 | a resume operator; A additionally needs per-effect durability first |
| **F2** blind resume | n/a (no resume); authority never re-derived | n/a; W2 guard + grant standing re-readable | B: `readEnvelope` + `canonicalGrantStandingV1` | resume must re-read W2 guard + canonical tip + grant standing; never the checkpoint |
| **F3** dead checkpoint | n/a — no checkpoint | durable facts written, **read by nothing on recovery** — F3's condition exactly | B: three stores | the resume operator is the reader |
| **F4** error flattening | codes rich and specific; no cause axis | status/reason codes (`GRANT_NOT_ACTIVE`, `W4_…_REFUSED`) outside the F4 inventory | pipeline `fail()` sites | additive cause map — **and see §5.1: the frozen F4 inventory is incomplete** |
| **F5** evidence escalation | `recommended_next_action` is advisory; worker governance gate is validated, not obeyed | W4 has no `finding`/`proposal` kinds | W4 `KINDS` | add two evidence-only kinds on B; A has no ledger to add them to |
| **F6** cross-lane leakage | result carries `scope_deviations: []`, `unresolved_questions` — no cross-lane object | none | — | consequence-finding admission (B, W4) |
| **F7** cosmetic recovery | n/a | n/a (no recovery) | — | resume must carry the W4/grant state, not re-derive from the W0 spec |
| **F8** effect repetition | ⚠️ unguarded: no pre-send phase for any effect inside the child | ✅ safe side already (single-use grant) · ❌ no probe, so every CLAIMED-no-result case must become `BLOCKED_BY_EVIDENCE` rather than a wedge | B: grant single-use | map CLAIMED-without-result → GATED; never re-issue a grant silently |

## 5. Findings

### 5.1 ⚠️ The frozen F4 inventory is incomplete (INSTRUMENT defect)

F4 claims *"every live failure_class code"* and counted **47**. The extractor misses
codes that reach `failure_class` by other routes:

- **7 via the exit-code table** `DELEGATE_EXIT_FAILURES` (`jarvis-runtime-pipeline.mjs`):
  `BUILDER_OWNERSHIP_REFUSED · CONTENDED_OR_UNKNOWN_LANE · SELECTOR_SHA_MISMATCH ·
  NATIVE_PATCH_ADMISSION_REFUSED · NATIVE_OUTPUT_CONTRACT_INVALID · NATIVE_CUSTODY_FAILURE`
  plus the fallback `NATIVE_CONTEXT_BOUNDARY_REFUSED` (via `fail(error?.code || …)`).
- **9 via thrown `error.code`** in `jarvis-native-prompt.mjs`, which reach
  `fail(error?.code …)`: `SELECTOR_PATH_UNSAFE · SELECTOR_PATH_ESCAPE ·
  LOCAL_NATIVE_CONTEXT_REQUIRED · EXECUTION_HEAD_UNAVAILABLE ·
  PACKET_CANONICAL_SHA_REQUIRED · PACKET_CANONICAL_SHA_INVALID ·
  PACKET_CANONICAL_SHA_UNRESOLVED · EXECUTION_HEAD_MISMATCH · EXECUTION_WORKTREE_NOT_CLEAN`.

**Measured (disposable probe, run in-session):** the frozen extractor finds **47**; the union with the exit-code table values, the `error.code = "…"` assignments in `jarvis-native-prompt.mjs` and the `NATIVE_CONTEXT_BOUNDARY_REFUSED` fallback is **63**, so **16 are missed**. All 16 are listed above.

⭐ The law F4 enforces is sound; the **instrument's reach is narrower than the record
claimed**. Per the freeze law this is exactly the evidence that permits a correction.
**Proposed, ⛔ not taken:** an **additive** falsifier `F4-R` at its own address with an
inventory that also reads `DELEGATE_EXIT_FAILURES` values and `error.code = '…'`
assignments in the native modules. Adding it edits no frozen file. The R1 record's
"47 = every live code" sentence is corrected in place.

### 5.2 Other hazards (named, ⛔ not repaired)

1. **Non-atomic witness write.** `persistCanonicalDurableResult()` uses bare
   `writeFileSync`. A crash mid-write leaves a truncated result: that is *witness
   present but unreadable*, which a resume operator must classify UNKNOWN, never
   PRESENT.
2. **Stale grant-ledger lock.** `withLedgerLock` is an `O_EXCL` lockfile removed in
   `finally`. A hard kill while holding it leaves `GRANT_LEDGER_BUSY` permanently.
   ⚠️ This belongs to the later **concurrency falsifier**, not to R2.
3. **`releaseRun()` has no caller.** Path A never releases Builder claims or worktree
   locks. Resources accumulate, a counterpart to the silent orphan.
4. **Path A's verifier runs `eval` in the worktree.** Effects there are of arbitrary
   class, so on Path A even VERIFY is an effect-bearing stage with no durable phase.
5. **`events.jsonl` is best-effort by design** ("telemetry is never load-bearing"),
   so it may not be treated as recovery evidence.
6. **Declared-but-unimplemented resume.** `PAUSED_FOR_GOVERNANCE → QUEUED` is in
   `LEGAL_TRANSITIONS` with a comment promising "the same run resuming". No code
   performs it.

## 6. What the evidence says about the seam (for adjudication, ⛔ not a design)

- **Path B needs no new supervisor and no new store.** Its minimal conforming seam is a
  **read-only resume operator** that:
  1. discovers W0.v2 units in `EXECUTING` whose grant is CLAIMED but not CONSUMED, or
     whose durable result is not in W4;
  2. derives the phase from the three facts;
  3. re-reads live W2 guard, canonical tip and grant standing;
  4. then either RECORDs a witnessed result into W4 (effect_witnessed), GATEs
     `BLOCKED_BY_EVIDENCE` (CLAIMED, no readable result), or GATEs on authority.
  It never re-issues a grant or re-sends a provider call.
  That is R1's reference shape, sitting on substrate that already exists.
- **Path A cannot conform by a seam alone.** Its effects happen inside an opaque child
  with no pre-send record, so any honest resume there would be `BLOCKED_BY_EVIDENCE`
  for every interrupted run. The **minimal honest move** on Path A is not resume but
  **orphan discovery → GATED `BLOCKED_BY_EVIDENCE` with a disposition**: the silent
  orphan becomes a visible, accounted-for stop. It would pass F2, F3 (it must read), F4
  and F8. It would fail F1 and F7 openly, as DC-9 does. That is inert safety, *declared
  as inert*: better than dark work, not yet recovery.

## 7. One question for the founder

**Which path does the first conforming O5 seam serve?**

- **(a) Path B first (recommended).** The idempotence phases already exist as durable
  facts. The seam is read-only derivation plus one W4 write (RECORD). It can run
  against the frozen matrix almost directly. Path A gets only the declared-inert orphan
  disposition (§6).
- **(b) Path A first.** It is the path Desktop drives today for local coding work, but
  conforming requires instrumenting `ain-delegate.sh` per effect before any seam, which
  is a larger act.
- **(c) Converge Path A onto Path B.** Local-native execution would become a W v2
  provider execution. This is the architecturally cleanest option, but it is a
  convergence lane, ⛔ not O5-R2.

Separately owed: a founder act on **F4-R** (§5.1).

**Standing: R2-A CENSUS COMPLETE · R2-B CROSSWALK COMPLETE · PREMISE CORRECTED
(`reconcileOrphanedRuns()` dead; live behaviour = silent orphan) · F4 INSTRUMENT GAP
MEASURED (63 vs 47) · ⛔ FROZEN SUITE UNTOUCHED · ⛔ NO SEAM DESIGNED · ⛔ NO
RUNTIME FILE MODIFIED · PRODUCTION UNTOUCHED.**
