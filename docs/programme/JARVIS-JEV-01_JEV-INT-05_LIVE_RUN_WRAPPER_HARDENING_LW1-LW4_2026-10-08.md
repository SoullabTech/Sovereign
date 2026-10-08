# JEV-INT-05 — live-run wrapper hardening for Mac review `8e04f8006` (LW1–LW4)

**OFF · candidate · unratified · nothing authorized.** Subject of review: `41caa8f79`. Only `scripts/builder/jev-wire-live-run-v1.mjs` and its proof/matrix changed. Wire, adapter, checkpoint and J1 files byte-identical (`git diff 41caa8f79 HEAD` empty on them and on `tests/`, `lib/`, `app/`). Local mock, dummy credential and synthetic files only. The committed off-switch is unchanged (`witnessed: false`); no TypeSafe contact, credential, permission change, spend, ratification, deploy; PILOT-01 untouched.

| Finding | Repair | Regression (fails on `41caa8f79`, passes now) |
|---|---|---|
| **LW1** injected transport under a real-provider grant | `resolveTransportFactory`: `EXTERNAL_PINNED` always selects the reviewed adapter; any injected factory is refused (`TRANSPORT_INJECTION_REFUSED`) before a store is created. Injection remains only for loopback-mock grants. `transportOptions` is the single place `allowRemote` is derived (from the grant's network class). | L10, L13 |
| **LW2** ledger lost mid-request throws | Loop and final-state read are guarded; result is a content-free structured stop `HISTORY_UNAVAILABLE` (`ledger_head`/`usd` null, `halted` true, no internal text). Nothing is created, repaired or resent; no claim the observation persisted. | L14 |
| **LW3** storage identity checked only at preflight | `captureStorageIdentity` / `verifyStorageIdentity` (real path, device, inode, non-link, distinct devices, genuine mount point containing the checkpoint, free space). Re-verified before every attempt (before any reservation) and again inside a guarded `send` immediately before dispatch. A dispatch-time refusal is recorded by the unchanged runner as `crossing_unknown` (conservative: nothing was sent); stop reason `STORAGE_CHANGED`. | L15 |
| **LW4** free-space floor overridable | `MIN_FREE_FLOOR`: `minFreeBytes` must be a safe integer ≥ 64 MiB; 0, negatives, NaN, Infinity, fractions, strings, null and unsafe integers refuse. | L16 |

## Portability
The proof no longer assumes `/dev/shm`. `JEV_LR_SECOND_DEVICE_ROOT` names a mount point on a second device (default `/dev/shm` on Linux; on macOS pass a mounted volume). Without a verified second device the distinct-device checks **fail as NOT RUN**, never green. `JEV_LR_SOURCE_FILE` runs the proof against another copy of the wrapper (used for the failing-before evidence).

## Evidence (this host, Linux, `/dev/shm`)
- Proof: **16/16**. Against `41caa8f79` source: **11 pass / 5 fail** (L10, L13, L14, L15, L16).
- Matrix: 9 new defeat candidates for LW1–LW4 (injection under remote grant; history-loss rethrow; storage-only-at-preflight; no dispatch recheck; no pre-attempt recheck; device-only identity; no device/mount verification; lowerable floor; unenforced floor) — see final matrix result in the return message/commit.
- Adapter 18/18 · checkpoint 16/16 · wire 37/37 re-run.
- The suite's first revision had a survivor/wrong-death set; all were suite defects (candidate edit strings stale after the repair; a dispatch-time case that the checkpoint module's own symlink refusal pre-empted, now uses a swap only the wrapper can see; a hook that armed on the runner's own clock read). Repaired in the suite, not by weakening the wrapper.

## Limits (unchanged or new)
- Defence in depth, not independently provable here: the loop-level `catch` for history loss (the final-state guard is what the proof exercises; candidate targets that guard).
- A dispatch-time storage refusal leaves a `crossing_unknown` + halt in the ledger even though nothing was sent; this is deliberate conservatism of the closed runner.
- NOT RUN here: the exact Mac/T7 suite (reviewer to rerun), J1 freeze/host/matrix/typecheck (files unchanged), TLS/real TypeSafe, power loss, Windows/NFS.
