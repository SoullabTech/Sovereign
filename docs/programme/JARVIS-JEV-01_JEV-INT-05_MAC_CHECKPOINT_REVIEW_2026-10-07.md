# JEV-INT-05 — Mac and two-volume checkpoint review

Date: 2026-10-07. **Disposition: intended two-store protocol and the reported suites independently verified on the Mac; two focused corrections remain. Candidate OFF, unratified, not ready for live execution.**

## Scope and source identity

- Reviewed HEAD: `380b29a4aebdc6ec8d9d9bd1d6dcbeef47d30d5b`.
- Code/test tip: `a8680700b324d3d1fe9029d0dd23d08908c27e82`; implementation commit `04feab1030983327f807251e304b5c338143e96e`.
- Only the external-checkpoint record differs between code/test tip and reviewed HEAD.
- Checkpoint module blob: `0a94513694c6945ccf4c120036dd4a9eeb507648`.
- Wire module blob: `fdc350310c4ac166f664952e8b5d0395150dab77`.
- Frozen host blob: `8138beeb387b1264ce386163ea7468108f2d7451` (unchanged).
- Reviewer branch: `chore/jev-int05-checkpoint-mac-review-20261007`. This branch adds only this record and evidence under docs. Claude-owned branch, runtime, tests, package scripts and frozen contracts are untouched.

All transports exercised were fake. No credential access, provider registration/assignment, real adapter construction, inference, spending, ratification, authorization admission, canonical merge or deployment. PILOT-01, its files, backups, reminders and stopped server were not touched. The committed `witnessed` flag remains false; a control confirms zero sends. Functional probes use the existing helper to open that flag ONLY in temporary test copies.

## Independent committed-suite execution

A clean detached checkout was used before adding documentation. Existing project dependencies were symlinked, not installed: Node v22.22.3, tsx 4.21.0, TypeScript 5.9.3, @types/node 25.0.9. This is the strict **J1** typecheck, not full-application typechecking.

- Checkpoint proof: 13/13, three consecutive runs.
- Checkpoint matrix: 18/18 caught on named checks as reported by its committed runner, zero problems.
- Wire proof: 37/37; wire matrix: 49/49 caught on named checks, zero problems.
- Original eight findings: 8/8 reproduce on the original candidate; 0/8 reproduce on the repaired candidate.
- Frozen J1 host: 26/26; frozen J1 matrix: 63/63 named kills, zero survivors, unclassified or stale.
- Freeze verifier: 0 violations; strict J1 typecheck: exit 0.

All 12 commands completed with exit 0. Full command, source HEAD, timestamps, explicit exit status and log digests are retained, including a nonempty compiler execution receipt. Clean status was confirmed at completion. These results confirm the specified suites, not every possible failure mode.

| Check | Exit | Full log SHA-256 |
|---|---:|---|
| checkpoint-proof-1 | 0 | `c8da3936db2d0b2f7d896a8361ba9b5af4c813e593a461c39d3fa77712ce3e13` |
| checkpoint-proof-2 | 0 | `814121cf63886f1732138ffec657ee8e0e95ea25476ff92228002352424ca40e` |
| checkpoint-proof-3 | 0 | `a8186273edfab90a8621808fb896dd7e24ad83b1d91e05b0782aeb2d6e64a26b` |
| checkpoint-matrix | 0 | `c00c36cc6c84489e7518162415cb98cccc95cb456681db02a2b8652f3bbb5a26` |
| findings-old | 0 | `73a1b568889b2686a00318fa647e9f2b0272a25bcb3c2f51fddbc72b27f1625d` |
| findings-new | 0 | `48913f86aecdde39119178b92546c6997826093efae344b7bedf63e86a7e2b87` |
| wire-proof | 0 | `63e1aa4a42a19bcd757c5f8406d30c04265204e0e7a2e6d7f64e74069bc01741` |
| wire-matrix | 0 | `0dff732b90e0bb15bad0bf69fb5b6a9ed4a181390b0c5e3d791541094e54da3f` |
| J1-freeze | 0 | `0febf7f8f9ed9e103caf48ad9991c6a185e5e5655a2e90aa85c765c86cc52654` |
| J1-host | 0 | `1971121cbb8647c645195ceff158823dec6d9c3d197243d6b9fb3e5e12d57133` |
| J1-matrix | 0 | `ff0ea0ec306251d1d12ead8c1df43e6b5119a815c3ffc345e243f83f5af52647` |
| J1-typecheck | 0 | `3e3d450c312d4ebccc3d04129d73453bbeef715908cd6b0379f0dccfe0bd384c` |

Execution receipt SHA-256: `9a73ed3f7275677bf2d7e16afb29484719899a82edbbdaad501728d60bb8e5d5`.

## Independent Mac-to-T7 exercise

Fresh synthetic directories were created on the Mac data volume and mounted T7 Shield. Their device ids differed: `16777230` and `16777244`. A read-only diskutil check identified both filesystems as APFS (Mac `disk3s5`, T7 `disk7s1`). No real device was unmounted, disconnected or reformatted.

The independent witness confirmed:

1. All 31 allowed fake attempts completed. For every dispatch, the checkpoint already matched the reserved ledger record. For every returned completion, the checkpoint matched the settled record. Reopening retained used attempts and refused replay.
2. Checkpoint-path loss after reservation caused zero sends. Restoring the synthetic path and deliberately resuming did not clear the unresolved attempt.
3. The earlier stop-window repair survives composition with the checkpoint wrapper: after process exit immediately after settlement but before checkpoint advancement, all four conditions (transport error, malformed response, model drift, excessive usage) first refused the stale lock, then refused the behind checkpoint, and still refused dispatch as HALTED after explicit resume. Subsequent fake sends: zero in all four cases.

Stale-lock clearance in those tests affected only newly created disposable test files, after confirming the child exited at the intended boundary (47). This simulates a deliberate operator action; it does not implement automatic production lock removal. Checkpoint outage was simulated by renaming a fresh test directory, not ejecting the T7. This verifies the exercised macOS/APFS code paths, not actual power-loss behavior, controller-level durability, Windows or NFS semantics.

An initial version of the reviewer script had a nested-string newline quoting error and exited before its crash probes. That was a reviewer harness error, not a candidate failure. It was corrected without changing the candidate, and the full portable witness then ran successfully. The initial error log is retained explicitly.

## Finding C1 — false observation-persistence status before the observation write

The wire runner's new catch classifies **every** `PAIR_*` error as `observation_persisted_checkpoint_failed`.
However, the checkpoint wrapper checks its lock and store agreement **before** appending the observation. Those checks can fail before any observation bytes reach the ledger.

The witness starts from a valid anchored reservation and lets the fake transport return a valid response. Immediately before the return it separately simulates: (a) a missing checkpoint, (b) unavailable checkpoint directory, (c) a held pair lock. In all three cases:

```text
returned outcome: observation_persisted_checkpoint_failed
actual ledger:   init, reserved
observed records: 0
next fake sends:  0
```

The no-further-send rule holds. The defect is a false claim that response evidence was saved. This matters because later recovery must not expect an observation that was never persisted. It is distinct from K12, which correctly exercises checkpoint loss **after** the observed append and does retain the observation.

Bounded correction: report persistence from an explicit verified write-phase result or read-back of the exact observation, not the `PAIR_` prefix. Preserve a conservative not-recorded/not-confirmed result when write durability cannot be established. Retain `observation_persisted_checkpoint_failed` only for the post-ledger-write case. Add paired before-write and after-write regressions, including lock and unavailable-store cases. Neither case may return completed success, resend, or discard its reservation.

## Finding C2 — colliding storage paths can destroy initialization

The parameterized wrapper does not reject path collisions. Two fresh, synthetic-only configurations were tested:

| Configuration | initialize() | Ledger after return |
|---|---|---|
| `checkpointPath == ledger.path` | Returns success | Newly created init record overwritten by checkpoint JSON; ledger is corrupt |
| `ledger.path == checkpointPath + '.tmp'` | Returns success | Checkpoint temporary write replaces init data, rename removes ledger pathname |

No existing user data was involved; all objects were new disposable test fixtures. This is not a failure of the valid Mac-to-T7 layout tested above, and no unauthorized provider send was observed. It is an initialization/configuration guard missing from a safety wrapper that accepts independent path parameters.

Bounded correction: validate storage destinations before the first mutation. Reject equal or aliased ledger/checkpoint paths and collisions with checkpoint temporary or ledger/pair-lock paths; require the promised directory independence through the wrapper or an unavoidable preflight. Use canonical/physical path checks as needed rather than string inequality alone. A rejected layout must leave both stores untouched. Add focused no-clobber tests and named defeat candidates. Actual separate-volume selection and mount verification remain runtime deployment requirements.

## Reproducible evidence, no ZIP required

Evidence directory: `docs/programme/evidence/jev-wire-checkpoint-mac-20261007/`.
Independent result SHA-256: `970fcb8e4ad5d04e97ae25136f5cf9e69683b55493d0bdba45661fe82d37c7ed`.
Portable witness SHA-256: `539fddb67ef39e9b68da2f6778b7d3816d809cc75d2ecde8707cf0a4b19bd39e`.

The witness is measurement code: exit 0 means measurements completed. Read `pass`, `misclassified_as_persisted` and `unsafe_initialization_accepted` rather than treating exit 0 as all-case acceptance. It preserves the exact candidate bytes and writes only fresh synthetic data and output.

Portable replay on one filesystem (the result identifies whether devices differ):

```bash
OUT="$(mktemp -d)"
node docs/programme/evidence/jev-wire-checkpoint-mac-20261007/independent-checkpoint-witness.mjs "$PWD" "$OUT"
```

Mac replay with a verified separate checkpoint volume:

```bash
OUT="$(mktemp -d)"
node docs/programme/evidence/jev-wire-checkpoint-mac-20261007/independent-checkpoint-witness.mjs "$PWD" "$OUT" '/Volumes/T7 Shield' --require-distinct-devices
```

No schema change or new public-provider read was needed. The prior captured schema remains the source for parser field names. Nothing in this review changes `witnessed` or grants live execution.

## Next boundary

Do not reopen the broad four-area repair or the closed settled-before-halt fix. Address only C1 (accurate persistence classification) and C2 (non-clobbering storage placement), retain the passing suites and add focused regression/mutation checks. Do not turn manual recovery into automatic lock deletion or checkpoint reconciliation.

The declared inability to detect a coordinated rollback of both stores remains. Independent storage is not an absolute anti-rollback guarantee. Normal successful attempts require no human intervention; stale locks and ambiguous recovery do. The responsible operator need not be Kelly personally, but authority to inspect/recover must be explicit.

After these bounded corrections are independently checked, the remaining planned work is the separate real-adapter and authorization/activation sequence. Provider terms/DPA review, J1R5-WIRE ratification, Route A prior authorization/assignment, bounded execution/network/disclosure/spend authority, credentials and schema-gate opening remain separate. No new founder ratings or PILOT-01 activity are requested.
