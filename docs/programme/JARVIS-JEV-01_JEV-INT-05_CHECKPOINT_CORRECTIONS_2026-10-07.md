# JARVIS-JEV-01 / JEV-INT-05 — Checkpoint Corrections C1 and C2

**Date:** 2026-10-07 · **Status:** ⭐ REVIEWABLE CANDIDATE · ⛔ **OFF · NOT RATIFIED · AUTHORIZES NOTHING**
**Code HEAD:** `3b7b25ecf2012d057c56c96bbcfcfb2a2d514de4` · responds to the Mac checkpoint review at
`352b840cb238623b93af5df385e15b423a74fd23` (branch `chore/jev-int05-checkpoint-mac-review-20261007`; read, not merged).
The two-store checkpoint, the stop-window repair and the manual-recovery boundary are **retained unchanged**. Fake transports only ·
no credential · no provider registration/assignment · no spend · no inference · no authorization change · no ratification · PILOT-01 deferred.

## C1 — "persisted" was inferred from the error name

**Defect (confirmed):** any `PAIR_*` error after a response was reported as `observation_persisted_checkpoint_failed`, but a missing
checkpoint, an unavailable checkpoint directory or a held pair lock can fail **before** the observation is written (ledger held only
`init, reserved`). Dispatch stayed blocked; the *report* was wrong.

**Repair:** persistence is now established only by finding the `observed` record for that attempt in the validated ledger.

| Situation after a response | Outcome |
|---|---|
| observation found in the ledger, anchoring failed | `observation_persisted_checkpoint_failed` |
| ledger readable, no observation | `observation_not_persisted` |
| ledger cannot be read to decide | `observation_persistence_unverified` (never guessed) |

Regression **K14**: the three reviewer scenarios (checkpoint missing, directory unavailable, pair lock held at response time) each
return `observation_not_persisted` with ledger kinds exactly `[init, reserved]`; the after-write counterpart and the unreadable-ledger case are
pinned. Defeat candidates: `DC-PERSISTED-ASSUMED-FROM-ERROR-NAME`, `DC-UNVERIFIABLE-REPORTED-AS-NOT-PERSISTED`, and the retargeted
`DC-CHECKPOINT-FAILURE-REPORTED-OK` / `DC-OK-ON-PERSIST-FAILURE`.

## C2 — colliding storage paths could overwrite the new ledger

**Defect (confirmed):** same path for both stores, or ledger path equal to the checkpoint's `.tmp`, let `initialize()` report success while
one store overwrote the other.

**Repair:** `assertDistinctStores(ledgerPath, checkpointPath)` runs at construction and again before any pair-lock is created, so it executes
**before either store is created, read for repair or changed**. Ownership sets must not intersect:
ledger owns `L · L.lock · L.pair.lock`; checkpoint owns `C · C.tmp`. Paths are compared by real parent directory + basename (dot-segments and
symlinked directories resolve; case-folded on macOS/Windows), and **existing files are compared by device+inode** (hard links, file symlinks).
Refusal code `PAIR_PATH_COLLISION`. Valid layouts (separate directories/volumes; same directory with distinct names) are unaffected.

Regression **K15**: identical paths · ledger equals checkpoint temp · checkpoint equals ledger lock · checkpoint equals pair lock ·
dot-segment alias · symlinked directory · hard link · file symlink — each refused with the directory listing byte-identical before/after;
`initialize()` never succeeds on a collision; both valid layouts initialize and verify. Defeat candidates: `DC-PATH-COLLISION-UNCHECKED`,
`DC-ONLY-EXACT-EQUALITY-CHECKED`, `DC-ALIASES-NOT-RESOLVED`.

## Results (container, Node v22.22.0, clean tree before and after)

| Command | Exit | Result | Log sha256 |
|---|---:|---|---|
| `node …/jev-wire-checkpoint-v1-proof.mjs` ×3 | 0 | **15 passed · 0 failed** each | `cdae02fca9d7…b5a064` |
| `node …/jev-wire-checkpoint-v1-matrix.mjs` | 0 | **23/23 killed on named check · 0 problems** | `1e0500c9f683…ec76e86` |
| `node …/jev-wire-v1-proof.mjs` | 0 | 37 passed · 0 failed | `0e51e3214803…32951` |
| `node …/jev-wire-v1-matrix.mjs` | 0 | 49/49 killed on named check · 0 problems | `405138486b00…98` |
| `node …/jev-wire-v1-findings-repro.mjs old` / `new` | 0 / 0 | old fails 8/8 · repair fails 0/8 | `3953f2a0b6d3…` / `816de9258ec1…` |
| `node scripts/verify-jarvis-jev-j1-freeze.mjs` | 0 | 0 violations | `c77942443850…5f17` |
| `node …/jev-judgment-host-v1-proof.mjs` | 0 | PASS | `2272eddabf1b…ac1` |
| `tsx …/jarvis-jev-j1/matrix.ts` · `tsc -p tsconfig.jarvis-jev-j1.json` | 0 · 0 | survivors 0 · strict J1 only | `9ba90f54d0ff…a80` · `8ee5d01b9c54…92e7` |

The two TypeScript rows used the session scratchpad toolchain (TS 5.6.3, tsx 4.21.0); the Mac project-dependency run of this HEAD is **NOT RUN** here.

**Reviewer's independent witness** (`independent-checkpoint-witness.mjs`, unmodified, from the review commit) on the prior code `a8680700b`
vs this tree: the three "observation before write" rows went from `misclassified_as_persisted: true` to `false` (outcome
`observation_not_persisted`, next sends 0); the two placement rows previously ended with `unsafe_initialization_accepted: true`. On the new tree the
witness aborts at those rows because it constructs the wrapper outside a `try` and the wrapper now **throws `PAIR_PATH_COLLISION` at construction** — the
intended earlier rejection; K15 is the committed regression for those rows. The witness's own two-volume rows still pass here, but this container has a
single filesystem, so the **real Mac-to-T7 exercise is the reviewer's, not repeated by me**.

Blob ids: checkpoint module `1c628995…` · `jev-wire-v1.mjs fe880578…` · checkpoint proof `64e184e0…` · checkpoint matrix `bc402158…` ·
wire matrix `756679af…` · host `8138beeb…` (unchanged). Table/fixture hashes unchanged (`6bb269d8…`, `a0f4a26c…`). `witnessed` still `false`.

## Boundaries kept

Manual recovery unchanged: stale locks are refusals never deleted by code; a split-store interruption needs the explicit `resume()`; a
checkpoint outage after a ledger write leaves an unresolved reservation. Normal operation needs no intervention. **Exceptional recovery
should belong to a named maintenance workflow and operator, not to you**; defining that runbook and who holds it is still open. Remaining
unopened: a real adapter owning its deadline, J1R5-WIRE ratification, Route A chain, grants, DPA review, credential, opening `witnessed`.
