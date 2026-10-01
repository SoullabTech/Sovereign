# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R2 — Path B Recovery Seam · F4-R · Path A Orphan Visibility

**Date:** 2026-09-30
**Base:** `64ba10ba` (O5-R2 census) · frozen O5-R1 suite @ `af2f0203` — **FREEZE INTACT**
**Class:** B — Structural Risk
**Standing:** R2A–R2E BUILT + WITNESSED IN-SESSION · ⛔ NOT MERGED · ⛔ NOT DEPLOYED · ⛔ NOT RUN AGAINST A REAL DESKTOP HOME

## 1. Founder rulings (verbatim substance)

1. **Path B first.** Build the first conforming recovery seam there. R2 remains a recovery/read
   operator; it must not quietly become a new orchestration system.
2. **Approve F4-R** beside frozen F4, with the wider live inventory; do not alter the frozen suite;
   **fail closed if the extractor ever sees fewer codes than the measured baseline.**
3. **Path A: no recovery.** Give interrupted runs an explicit disposition such as
   `BLOCKED_BY_EVIDENCE` so the system stops lying by omission. Local-coding convergence is a later lane.
4. Sequence **R2A → R2E**. Keep the other hazards (atomic result writes, abandoned ledger locks,
   `releaseRun()`, governance requeue) **out of this act** unless they block the seam.

⭐ Governing distinction: ***Recovery is only legitimate where the system can distinguish what was
intended, what was dispatched, what actually happened, and what was durably ledgered.*** Path B can.
Path A cannot.

## 2. What was built

| Act | Artifact | Standing |
|---|---|---|
| **R2A** F4-R | `tests/constitutional/jarvis-o5-r2/f4r.mjs` — frozen F4's inventory ∪ `DELEGATE_EXIT_FAILURES` values ∪ `fail(x \|\| '…')` fallbacks ∪ thrown `error.code` in `jarvis-native-prompt.mjs`; floor `MEASURED_BASELINE = 63`, **fail closed below it**. Cause map extended additively (+16); `RUNTIME_STOPPED_MID_RUN` moved ENVIRONMENT → **EVIDENCE** (after R2E it marks effects of unknown standing) | ✅ 63/63 · both defeat candidates dead |
| **R2B** classifier | `scripts/builder/o5-recovery-path-b-v1.mjs` — **pure**; derives the R1 phase from grant ledger + durable result + W4; re-derives live authority from the W2 guard; closed action vocabulary `NONE · CONVERGED · RECORD · GATED` | ✅ PB-F1…PB-F7 pass |
| **R2C** lethality | `pathb-falsifiers.mjs` · `pathb-candidates.mjs` · `matrix.mjs` | ✅ **LETHAL + DISCRIMINATING** |
| **R2D** writer | `jarvis-desktop/src/o5-path-b-recovery.js` — reader + minimal disposition writer | ✅ 8/8 integration witness on the real W v2 substrate |
| **R2E** Path A | owner stamp (`builder-mechanism.js`) · proof-requiring `reconcileOrphanedRuns` (`jarvis-runtime-store.mjs`) · `IN_FLIGHT_STATES` + `EFFECTS_POSSIBLE_BY_STATE` (`jarvis-runtime-pipeline.mjs`) · startup caller (`main.js`) | ✅ 5/5 |

Commands: `npm run matrix:jarvis-o5-r2` · `npm run test:jarvis-o5-r2` · `npm run matrix:jarvis-o5-r1` · `npm run verify:jarvis-o5-r1-freeze`.

## 3. Path B — the seam

**The checkpoint is derived, not stored.** No new store, no new supervisor:

| R1 phase | Path B durable fact | Classifier action |
|---|---|---|
| authorized | grant never CLAIMED | `NONE` — nothing was dispatched |
| dispatched | claimed, **no** durable result | `GATED · BLOCKED_BY_EVIDENCE` — Path B has **no probe**, so this is always UNKNOWN |
| dispatched (torn) | result present but unreadable / unbound / undigested | `GATED · BLOCKED_BY_EVIDENCE` — never PRESENT, never ABSENT |
| effect_witnessed | readable, bound result; W4 does not record it | `RECORD` (settle the grant if still CLAIMED, then W4) — **only under live authority** |
| ledgered | W4 artifact/attempt names `canonical-result:<wu>:<grant>` | `CONVERGED` (settle the grant if still CLAIMED) |

**Live authority, re-derived now:** envelope readable and bound to the unit · lifecycle **and** guard
`EXECUTING` · `guard.authorized_core_snapshot === authorizedCoreSnapshotV2(now)` · grant bound to the
unit and not REVOKED/INVALIDATED. Any failure → `GATED` (`NEEDS_OPERATOR_AUTHORITY` for authority,
`BLOCKED_BY_EVIDENCE` for unreadable/foreign records).

**Canonical-tip freshness is deliberately NOT an input.** Every R2 action records what already
happened; none is a new act against the repository. The O2 freshness precondition governs new
mutating acts, and R2 creates none.

**The writer never invents.** RECORD calls the *existing* `appendCanonicalExecutionResultV2` with the
witness's body and a digest computed over the **bytes on disk** (never a re-serialization). That is the
same call, with the same arguments, the interrupted execution would have made. GATED appends one
line to `work-units-v2/recovery/<id>.jsonl` (append-only; an identical consecutive disposition is not
repeated). ⛔ It never issues, claims or dispatches, and never transitions W2. R2D-8 checks this structurally.

### Finding surfaced by the real flow (handled, ⛔ not repaired upstream)

`canonicalConfirmAuthorizedExecution` appends to W4 **without checking** the consume result. A busy
grant lock can therefore leave a result **ledgered while its grant stays CLAIMED**, and an unresolved
CLAIMED grant blocks every future grant for that participant (`UNRESOLVED_GRANT_ALREADY_EXISTS`).
Recovery classifies it `CONVERGED` with `settle_grant: true`: consuming a spent grant only narrows
authority, and nothing is re-ledgered. The upstream ordering is **named, ⛔ not changed** (it sits
in the lock-hazard family ruled out of this act).

## 4. Evidence

### R2C matrix (`npm run matrix:jarvis-o5-r2`, exit 0)

```
R2A · F4-R           F4-R PASS (63 codes)
  DC-F4R-1 cause map covering only the 47 R1-visible codes         → KILLED on F4-R
  DC-F4R-2 regressed extractor (the frozen 47-code one)            → KILLED on F4-R
R2C · Path B classifier   PB-F1…PB-F7 all PASS
  DC-B1 gate-then-retry (auto-reissue once the gate clears)        → KILLED on PB-F1
  DC-B2 CONSUMED-without-witness declared converged                → KILLED on PB-F2
  DC-B3 lenient witness (any file counts)                          → KILLED on PB-F3
  DC-B4 blind authority ("it already happened")                    → KILLED on PB-F4
  DC-B5 double record (convergence not checked)                    → KILLED on PB-F5
  DC-B6 dead witness reader (CLAIMED always UNKNOWN)               → KILLED on PB-F6
  DC-B7 inert caution                                              → KILLED on PB-F6 (+PB-F5 CLASSIFIED)
  DC-B8 unreadable envelope read as "nothing to do"                → KILLED on PB-F7
MATRIX LETHAL + DISCRIMINATING
```

⭐ **The first run was `MATRIX DEFECT (2)`, and both defects were in my candidates, not the classifier.**
DC-B4 overrode *every* live-authority failure, including evidence failures, so it also died on PB-F7.
The error it models is "authority does not matter", so it now overrides only authority gates. DC-B7 gated
everything blindly; it was rebuilt as the *competent* inert candidate (names every stop truthfully,
then defers every recovery), mirroring R1's DC-9. Its one remaining extra death is irreducible.
The falsifiers were not touched.

### R2D integration witness (real substrate, `jarvis-desktop/test/o5-path-b-recovery.test.mjs`)

Interrupted states are produced by the **real** `canonicalConfirmAuthorizedExecution`, frozen mid-flight
by a runner that never returns. The grant is CLAIMED and the unit EXECUTING because the real code put
them there. The durable result exists only if the runner wrote it exactly as the real runner does.

| # | State | Result |
|---|---|---|
| R2D-1 | claimed, no witness | GATED · BLOCKED_BY_EVIDENCE; grant ledger byte-count unchanged (1 ISSUED, 1 CLAIMED); W4 empty; disposition visible, not repeated |
| R2D-2 | claimed + witnessed | RECORD: `grant:CONSUMED` + `w4:attempt`; attempt fields **equal the uninterrupted reference run**; ledgered digest = witnessed bytes; second pass CONVERGED, still 1 attempt |
| R2D-3 | consumed + witnessed, W4 missing | RECORD without re-settling |
| R2D-4 | witness torn in half | GATED · `DURABLE_RESULT_UNREADABLE`; nothing recorded, grant not settled |
| R2D-5 | witnessed, authorized core moved | GATED · NEEDS_OPERATOR_AUTHORITY; nothing written but the disposition |
| R2D-6 | ledgered, grant still CLAIMED | CONVERGED; grant settled; still 1 attempt |
| R2D-7 | never claimed · read-only mode | NONE / writes nothing at all |
| R2D-8 | structural | writer + classifier reference no issue/claim/confirm/execute/transition/process API; classifier has no fs |

**Anti-vacuity (disposable mutations, restored, ⛔ not the record):** disabling the writer's grant
settlement fails R2D-2; making the classifier read "claimed, no witness" as `NONE` fails R2D-1
**and** turns the R2C matrix to `DEFECT (8)`. Both were restored, and the matrix is lethal again.

### R2E Path A (`jarvis-desktop/test/o5-path-a-orphan.test.mjs`, 5/5)

An in-flight run is reconciled **only on proof its owner is gone**: an owner stamp for this host
whose pid returns `ESRCH`. It becomes terminal `FAILED` with the **existing** code
`RUNTIME_STOPPED_MID_RUN`, disposition `BLOCKED_BY_EVIDENCE`, and
`interruption.{last_state, owner, effects_possible, recovery: 'NONE …'}`. `FAILED` is the one lawful
destination from every in-flight state. ⛔ Never resumed, re-dispatched or re-queued.
**Unrecorded, other-host, live, self and undeterminable owners are reported UNPROVEN and left
untouched**, because absence of evidence is not evidence of death. `QUEUED`, `PAUSED_FOR_GOVERNANCE` and
terminal runs are never touched. Mutation check: treating a missing owner stamp as death fails R2E-3.

### Regression

- **jarvis-desktop suite:** before any change, 356 tests / **13 failing**; after, 369 tests / **the
  same 13 failing** (diffed by name). The 13 are pre-existing in this container. The E1 cases fail
  because the shallow clone lacks their pinned SHA `9580ad38`: the same E1 file run with the current
  HEAD passes **11/11**.
- `scripts/builder/__tests__`: native-runtime 8/0 · alpha-floor 97/0 · durable-result 10/0 ·
  grant-store 9/0 · ledger-v2 23/0 · lifecycle-v2 13/0.
- O5-R1 matrix LETHAL + DISCRIMINATING · **FREEZE INTACT** · `check:no-supabase` clean.
- ⚠️ `npm run typecheck` **not run**: no project `node_modules` in this container, and every R2
  file is `.mjs`/`.js` outside the TypeScript program. ⛔ Not reported as a pass.

## 5. What this act deliberately does NOT do

- ⛔ No new orchestration model, supervisor, store or checkpoint object.
- ⛔ No grant is ever issued, claimed, reissued or dispatched by recovery; no provider or model runs.
- ⛔ No Path A resume. The disposition is visibility, not recovery.
- ⛔ No O7 surfacing. A draft IPC handler for a recovery report was **removed before commit**; the
  durable records (`recovery/<id>.jsonl`, the run record) are the visibility, and the startup report is logged.
- ⛔ Out of scope and untouched, as ruled: non-atomic `persistCanonicalDurableResult` (R2 *tolerates*
  it: a torn write gates on evidence) · stale `O_EXCL` grant lock · `releaseRun()` uncalled ·
  `PAUSED_FOR_GOVERNANCE → QUEUED` unperformed · concurrency.

## 6. Known limits

1. **Startup-only, single-resumer.** Recovery runs once at Desktop startup under
   `requestSingleInstanceLock`, before this process dispatches anything. A Path B execution started by
   a *different* process at the same moment would be read as interrupted, and a `GATED` line would be
   true of the moment but misleading. That is the concurrency falsifier's territory, and it is not
   modelled.
2. **Never run against a real `~/.claude/ain-delegation`.** All witnesses use temporary homes. The
   first real startup will classify whatever historical Path B units exist. A read-only pass
   (`recoverPathB(root, { write: false })`) before the first write is the prudent first act.
3. **Legacy Path A orphans stay dark.** Runs created before the owner stamp can never be proven orphaned
   and remain UNPROVEN. Resolving them is an operator act, ⛔ not an inference.
4. **Path B has no probe.** Every claimed-but-unwitnessed execution is permanently UNKNOWN to the
   system. A per-provider probe would be new evidence and belongs to a later lane.

**Standing: R2A F4-R ✅ · R2B CLASSIFIER ✅ · R2C MATRIX LETHAL + DISCRIMINATING ✅ · R2D WRITER ✅
(8/8 real-substrate) · R2E PATH A VISIBILITY ✅ (5/5) · DESKTOP SUITE: 0 NEW FAILURES · O5-R1 FREEZE
INTACT · ⛔ NOT MERGED · ⛔ NOT DEPLOYED · ⛔ NO REAL-HOME RUN · PRODUCTION UNTOUCHED.**
