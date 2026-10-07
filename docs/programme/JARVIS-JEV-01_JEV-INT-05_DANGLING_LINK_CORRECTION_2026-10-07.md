# JARVIS-JEV-01 / JEV-INT-05 — Dangling-Link Correction (C2 completion)

**Date:** 2026-10-07 · **Status:** ⭐ REVIEWABLE CANDIDATE · ⛔ **OFF · NOT RATIFIED · AUTHORIZES NOTHING**
**Repair commit:** `ff3908d268082ccc3ef97b6e83f44fd0127fa3b6` · responds to the Mac review at `04e3a2db013abcd0c1b1ab812c9a12f3f03966b1`
(read, not merged). C1 is unchanged and closed; the checkpoint protocol, manual recovery and C2's earlier cases are untouched.
Fake transports only · no credential · no provider call · no spend · no permission change · no ratification · PILOT-01 deferred.

## Defect and repair

Both reproduced layouts left a symlink whose target did not yet exist, so the identity check saw nothing; initialization then created the
target and the later write went through the link onto the other store (`C.tmp → L`: checkpoint JSON replaced the new ledger;
`L → C.tmp`: the rename left the ledger path without its target).

`inspectLinks` now runs inside `assertDistinctStores` (construction, and again before any pair lock exists) and inspects links **as objects (lstat)**:
- `L.lock`, `L.pair.lock` and `C.tmp` are never legitimately links — any link there is refused;
- a store path that is a link is refused when **dangling**, and when its target is any path owned by the other store (conservative: an unresolved alias is never permission);
- the checkpoint temp file is opened `O_WRONLY|O_CREAT|O_TRUNC|O_NOFOLLOW`, so a link that appears **after** the preflight is not written through (`PAIR_CHECKPOINT_UNAVAILABLE`, sentinel bytes preserved).

Refusal is `PAIR_PATH_COLLISION` at construction — before a lock, an `initialize()` or either store exists.

## Regression K16 (no-mutation: names, kinds, file bytes and link targets compared before/after)

Both reviewer orientations · pair-lock link · ledger-lock link · dangling checkpoint · dangling ledger · temp → unrelated existing file ·
ledger → existing checkpoint · a link planted between the ledger write and the anchor write · plus a control (stale plain temp file works).

Defeat candidates (each dies on K16): `DC-LINK-INSPECTION-REMOVED`, `DC-LEDGER-SIDE-LINKS-NOT-INSPECTED`, `DC-TEMP-AND-LOCK-LINKS-ALLOWED`,
`DC-DANGLING-LINK-ALLOWED` (removes both overlapping layers: dangling rule + target comparison), `DC-WRITE-FOLLOWS-LINKS`.

## Evidence (container, Node v22.22.0; tree clean before and after)

| Command | Exit | Result | Log sha256 |
|---|---:|---|---|
| `node …/jev-wire-checkpoint-v1-proof.mjs` ×3 | 0 | **16 passed · 0 failed** each | `ff53951f50af…3069c` |
| `node …/jev-wire-checkpoint-v1-matrix.mjs` | 0 | **28/28 killed on named check · 0 problems** | `100ce9ead479…8e5` |
| `node …/jev-wire-v1-proof.mjs` | 0 | 37 passed | `0e51e3214803…32951` |
| `node …/jev-wire-v1-matrix.mjs` | 0 | 49/49 killed | `405138486b00…98` |
| `node …/jev-wire-v1-findings-repro.mjs old` / `new` | 0 / 0 | old 8/8 · repair 0/8 | `3953f2a0b6d3…` / `816de9258ec1…` |
| `node scripts/verify-jarvis-jev-j1-freeze.mjs` | 0 | 0 violations | `c77942443850…5f17` |
| `node …/jev-judgment-host-v1-proof.mjs` | 0 | PASS | `2272eddabf1b…ac1` |
| `tsx …/jarvis-jev-j1/matrix.ts` · `tsc -p tsconfig.jarvis-jev-j1.json` | 0 · 0 | survivors 0 · strict J1 only | `9ba90f54d0ff…a80` · `8ee5d01b9c54…92e7` |

**Reviewer's `path-alias-witness.mjs`, unmodified:** previous code `c12dc9652` returned success with `ledger_valid: false` and `no_clobber_refusal: false` on both
dangling rows; this tree returns `no_clobber_refusal: true`, `returned_success: false` on both, and all earlier rows keep their results (the valid separate-layout control still succeeds with a valid ledger).

Blob ids: checkpoint module `bf30fa98…` · `jev-wire-v1.mjs fe880578…` (unchanged) · checkpoint proof `e7cf6848…` · checkpoint matrix `06fab213…` · host `8138beeb…` (unchanged).
TypeScript rows ran on the session scratchpad toolchain; the Mac project-dependency run of this HEAD is **NOT RUN** here. macOS/APFS, Windows, NFS and power-loss behaviour remain untested by me.

## Still open (unchanged)

Real adapter owning its deadline · recovery runbook and a designated operator · real storage/mount validation · J1R5-WIRE ratification · Route A chain ·
execution/network/spend/disclosure grants · DPA review · credential · opening `witnessed`.
