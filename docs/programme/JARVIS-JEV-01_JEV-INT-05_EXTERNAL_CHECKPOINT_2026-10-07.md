# JARVIS-JEV-01 / JEV-INT-05 — External Checkpoint (two-store protocol)

**Date:** 2026-10-07 · **Status:** ⭐ REVIEWABLE CANDIDATE · ⛔ **OFF · NOT RATIFIED · AUTHORIZES NOTHING**
**Code HEAD:** `a8680700b324d3d1fe9029d0dd23d08908c27e82` · builds on the Mac closure `ec2d7d9119a03f7c727608c7abeda7226a8b3d7b` (read, not merged).
The stop-window repair is closed on that review; its regressions (W35–W37 and the eight-finding reproductions) are retained and rerun below.
Fake transports only · **no live provider client built or injected** · no credential · no provider registration/assignment · no
authorization record · no spend · no inference · no ratification · no merge · no deploy · PILOT-01 deferred, no labels.

## 1 · What was built

| File | Role |
|---|---|
| `scripts/builder/jev-wire-checkpoint-v1.mjs` | `createCheckpointedLedger(baseLedger, checkpointPath, {hooks})` — wraps the existing ledger with an independent anchor. **Ledger path and checkpoint path are both parameters** (e.g. different volumes); neither is hard-coded. |
| `scripts/builder/__tests__/jev-wire-checkpoint-v1-proof.mjs` | 13 checks (K1–K13), real child processes for the interruptions. |
| `scripts/builder/__tests__/jev-wire-checkpoint-v1-matrix.mjs` | 18 defeat candidates, each must die on its named check. |
| `jev-wire-v1.mjs` (small edit) | maps `PAIR_*` refusals through unchanged; a checkpoint failure after the observation write returns `observation_persisted_checkpoint_failed`, never `ok`. |

## 2 · Protocol

```text
every append    ledger append (fsync)  →  checkpoint advance (tmp + fsync + rename + dir fsync)
reservation     checkpoint covers the reservation, and ledger/anchor are re-verified equal, BEFORE the caller may dispatch
outcomes        checkpoint covers observed, then settled, BEFORE "ok" is returned or another attempt can start
start / each    experiment id + table/fixture/schema/caps binding · same initialization (instance = hash of the
dispatch        ledger's init record) · ledger reaches the anchor · record at the anchor equals the anchored head
```

The checkpoint is never ahead of a healthy ledger; the only legal divergence is "ledger ahead by the records of one interrupted
step". That state is **refused** (`PAIR_CHECKPOINT_BEHIND`) until an explicit, deliberate `resume()`, which only advances the
anchor over records that already validly extend the anchored head and never clears an unresolved attempt.

| State found | Result (zero sends in every row) |
|---|---|
| checkpoint missing, ledger present | `PAIR_CHECKPOINT_MISSING` — never recreated over history; `establishCheckpoint()` only if the ledger holds **only** its init record |
| checkpoint present, ledger missing | `PAIR_LEDGER_MISSING` |
| checkpoint corrupt / hash mismatch | `PAIR_CHECKPOINT_CORRUPT` |
| binding differs (experiment, table, fixtures, schema, caps) | `PAIR_BINDING_MISMATCH` |
| ledger shorter than the anchor (truncated) | `PAIR_LEDGER_BEHIND` |
| replaced / re-initialized / forked at the anchor | `PAIR_INSTANCE_MISMATCH` / `PAIR_LEDGER_DIVERGES` |
| initialize when either store exists | `PAIR_ALREADY_INITIALIZED` |
| checkpoint volume unavailable or unwritable | `PAIR_CHECKPOINT_UNAVAILABLE` (reservation, if already in the ledger, is preserved) |
| ledger ahead of anchor | `PAIR_CHECKPOINT_BEHIND` until `resume()` |
| stale pair or ledger lock | `PAIR_LOCK_HELD` / `LOCK_HELD`, lock left in place |

## 3 · Interruption results (real child processes exit at each boundary)

| Process lost at | Sends before loss | After restart | After explicit `resume()` |
|---|---:|---|---|
| ledger wrote `reserved`, anchor not yet | 0 | `PAIR_CHECKPOINT_BEHIND` | `UNRESOLVED_ATTEMPT`, 0 sends |
| anchor covered `reserved`, before send | 0 | `UNRESOLVED_ATTEMPT` | — |
| ledger wrote `observed`, anchor not yet | 1 | `PAIR_CHECKPOINT_BEHIND` | `UNRESOLVED_ATTEMPT` (never re-sent) |
| anchor covered `observed` | 1 | `UNRESOLVED_ATTEMPT` | — |
| ledger wrote `settled` (clean success), anchor not yet | 1 | `PAIR_CHECKPOINT_BEHIND` | next attempt proceeds (normal recovery) |
| between the two stores of initialization | 0 | `PAIR_CHECKPOINT_MISSING` | `establishCheckpoint()` |

**A process lost inside either lock leaves the lock behind, so every crash above first meets a lock refusal.** The test clears it only by an
explicit `rmSync` standing in for a human inspection; the code never deletes a lock (K13 asserts the only `unlinkSync` is the holder's own
release of its pair lock). This is the intended conservative behaviour, and it means **crash recovery always needs a person**.

## 4 · Results (container, Node v22.22.0; clean tree)

| Command | Exit | Result |
|---|---:|---|
| `node …/jev-wire-checkpoint-v1-proof.mjs` ×3 | 0 | **13 passed · 0 failed** each |
| `node …/jev-wire-checkpoint-v1-matrix.mjs` | 0 | **18/18 killed on named check · 0 problems** |
| `node …/jev-wire-v1-proof.mjs` | 0 | 37 passed · 0 failed (retained stop-window regressions) |
| `node …/jev-wire-v1-matrix.mjs` | 0 | 49/49 killed on named check · 0 problems |
| `node …/jev-wire-v1-findings-repro.mjs old` / `new` | 0 / 0 | old fails 8/8 · repair fails 0/8 |
| `node scripts/verify-jarvis-jev-j1-freeze.mjs` | 0 | 0 violations |
| `node …/jev-judgment-host-v1-proof.mjs` | 0 | PASS |
| `tsx …/jarvis-jev-j1/matrix.ts` · `tsc -p tsconfig.jarvis-jev-j1.json` | 0 · 0 | survivors 0 · strict J1 only; **scratchpad toolchain**, Mac run is the record |

Proof/matrix logs for the wire proof, findings reproductions and J1 checks were taken at the code commit just before a test-only
retarget of one wire-matrix candidate (`1bd51c17…`); the wire matrix was rerun after it (49/49). The Mac project-dependency run of this HEAD is **NOT RUN** here.

Blob ids: checkpoint module `0a945136…` · `jev-wire-v1.mjs fdc35031…` · checkpoint proof `14687e52…` · checkpoint matrix `5cea6ef4…` ·
host `8138beeb…` (unchanged). Question table and fixture list hashes unchanged (`6bb269d8…`, `a0f4a26c…`). `witnessed` still `false`.

## 5 · Candidate-suite lessons recorded

Two layers overlap by construction and are only lethal together: **identity vs. divergence** (a different initialization differs at every
hash), and **write-failure handling vs. the final agreement check** before dispatch. Single-layer removals survived; the candidates now remove
both layers, and the document does not claim either layer alone is separately falsifiable.

## 6 · Remaining blockers / known limits (the candidate stays OFF)

1. **Both stores rolled back or replaced together** (by someone able to write both) is undetectable locally; a separate volume lowers
   common-mode loss only. Actual volume placement and mount-verification are the runtime owner's.
2. **Crash recovery needs a human** (stale locks) and, after a split-store interruption, an explicit `resume()`. A checkpoint outage after a
   ledger write leaves an unresolved reservation by design — conservative, and it ends that experiment run until an owner decides.
3. Unbuilt/unopened: a real adapter owning its deadline, J1R5-WIRE ratification, Route A chain, execution/network/spend/disclosure grants,
   DPA review, credential, opening `witnessed`.
4. Windows/NFS semantics of directory fsync and rename atomicity are **not tested**; Linux container only.
