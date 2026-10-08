# JEV-INT-05 — bounded live-run wrapper hardening (Mac review LW1–LW4)

**Date:** 2026-10-07 EDT · **Status:** local engineering candidate · **OFF / NOT RATIFIED / NO REAL EXECUTION AUTHORIZED**.

## Identity and authority

- Source base: `41caa8f79af488fd8ea82442fe3586f03b13d15e` on `claude/pensive-ride-hw6qra`.
- Independent Mac review and four reproductions: `8e04f80066637129db4223f0832624ec24c0f049` on `chore/jev-int05-live-run-mac-review-20261007`.
- Scoped code/test repair: `29b38b0d41f411a7ab44028a6dd17bcb8522f4dc`, branch `fix/jev-int05-live-wrapper-hardening-20261007`.
- Modified only `scripts/builder/jev-wire-live-run-v1.mjs` and its **live-wrapper** proof and mutation matrix. Frozen J1, earlier wire, adapter and checkpoint modules untouched; their settled repairs remain closed. No canonical merge or deployment.
- PILOT-01 stays deferred. No member data, labels, actual TypeSafe request, actual credential, registration, grant admission, spending or ratification has occurred.

## Four disposition findings

**LW1 — source of a remote answer must be the reviewed adapter.** A synthetic `EXTERNAL_PINNED` grant previously accepted an injected `deps.createTransport` capable of manufacturing a provider-shaped reply. The repaired wrapper rejects any provided transport override when `network === 'EXTERNAL_PINNED'`, including inherited hooks. An externally scoped execution also rejects an injected clock; the real pinned branch selects `createJevHttpTransport` itself. Injected transports remain legal for loopback-only tests. A remote test without a supplied credential fails at adapter construction, with **no real network call**. This is provider-provenance protection, not confirmation of actual TypeSafe service behavior.

**LW2 — unknown history produces a structured stop.** If the ledger disappears after a mock request but before its observation can be recorded, the wrapper no longer throws an unstructured `LEDGER_NOT_INITIALIZED` while preparing its final summary. It returns a content-free `HISTORY_UNAVAILABLE` stop, `completed:false`, `ledger_head:null`, `usd:null`, and a conservative `halted:true`. The result does not pretend the answer was durably saved or that the request was never sent. No retry, recreation or repair is triggered.

**LW3 — mount and physical storage must remain valid throughout a run.** The wrapper pins physical device IDs after the admitted preflight and revalidates the existing storage safeguards at the start of each attempt, immediately before reservation, just before transport dispatch, after the lazy credential callback, and after an outcome. A changed, absent, symlink-replaced or co-located checkpoint destination refuses subsequent dispatch. The existing ledger-first / independent-checkpoint protocol is unchanged. The tests include a synthetic mid-run Mac/T7 checkpoint remap, and another immediately after reservation but before the next local send. Mount-device checks are **not** proof against deliberate coordinated rollback, power loss, or perfect hostile time-of-check/time-of-use races.

**LW4 — the storage-free-space minimum is enforceable.** `minFreeBytes` must be a safe integer at least `MIN_FREE_BYTES = 67,108,864` (64 MiB). Zero, negative, NaN, Infinity, invalid types and sub-floor values produce `MIN_FREE_SPACE_CONFIG` before any attempt. A valid higher floor may still narrow eligibility. The default remains unchanged.

## Verification and provenance

### Exact Mac project-toolchain results

| Check | Result |
|---|---:|
| Live-wrapper proof (three independent runs) | **16/16 pass each** |
| Live-wrapper defeat matrix | **41/41 named kills; zero problems** |
| Old code with the expanded proof | **11 pass / 5 expected failures** (L10, L13–L16) |
| Repaired HTTP adapter proof / matrix | **18/18 / 23/23** |
| Retained checkpoint proof / matrix | **16/16 / 28/28** |
| Retained wire proof / matrix | **37/37 / 49/49** |
| Original eight findings | **8/8 reproduce on old; 0/8 on repaired** |
| Frozen J1 host and constitutional matrix | **PASS; 63/63 named kills, zero survivors** |
| Frozen J1 verifier / strict J1 TypeScript check | **0 violations / exit 0** |

All **17** commanded checks reached their *expected* exit status and completed; the deliberate old-code negative control exits **1**, not 0. The live-wrapper proof uses a real mounted Mac/T7 pair for its separate-volume checks (Mac device `16777230`, T7 `16777244`), only disposable data and loopback mocks. The frozen TypeScript result is **J1-specific**, not a full-application typecheck.

Execution receipt SHA-256: `fd2d7d3d9d6a8c49d1b7437e59d0b80f2d934f297c2950c96e528042f11f03f7`.
Evidence manifest: `docs/programme/evidence/jev-int05-live-hardening-20261007/SHA256SUMS.txt`, with exact commands, source HEAD, timestamps, exit codes and full log digests. Tested source `29b38b0d41f411a7ab44028a6dd17bcb8522f4dc`.


- Expanded committed regression proof: **L1–L16**, covering the four failure modes with before/after old-code reproduction via the test-only `JEV_LR_SOURCE_COMMIT` route.
- Expanded defeat matrix: new live-wrapper-only variants, preserving named check and zero survivor requirements. Mutant runs use a focused *named* test and the unmutated reference executes the whole proof; a crash, missing edit anchor or unfinished test does **not** count as a kill.
- The Mac proof no longer assumes Linux `/dev/shm`; `JEV_TEST_SECOND_DEVICE_ROOT='/Volumes/T7 Shield'` selects an explicitly mounted second device **in tests only**. Production code never reads this variable.
- The evidence directory `docs/programme/evidence/jev-int05-live-hardening-20261007/` contains the command/HEAD/exit-code/log-SHA-256 receipt for the scoped tests, retained proofs/matrices and frozen J1 check. The old candidate is expected to fail its five named assertions (changed remote-spy invariant L10 plus four LW regressions); that is an expected negative-control result, not an accepted test of old code.
- The actual committed `RESPONSE_SHAPE.witnessed:false` remains closed. Functional positive tests use temporary fake-transport / loopback copies only, not authorized live calls.

## Remaining unapproved gates

There is still **no authorization to contact TypeSafe**. Separate founder decisions are required for J1R5-WIRE constitutional reopening, canonically admitted Route A prior authorization and registration/assignment, reviewed terms/DPA/retention/billing, data-disclosure/network/spend/execution grant with expiry, credential supply, an assigned recovery operator, fixed real mounts and controlled gate activation. The very first real experiment request should count as attempt 1 of the 31, with inspection before proceeding. None of those decisions follows from software tests.

**Disposition:** after the four focused regressions and retained suites pass independently, accept the repair as engineering evidence only. Do not reopen the checkpoint, J1, adapter, human pilot or governance work by implication.
