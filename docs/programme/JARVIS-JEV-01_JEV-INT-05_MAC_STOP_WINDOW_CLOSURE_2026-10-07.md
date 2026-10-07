# JEV-INT-05 — Mac verification of the stop-window repair

Date: 2026-10-07. **Disposition: the identified settled-before-halt defect and parser safe-integer correction are verified on their specified cases. Candidate remains OFF, unratified, and not ready for live execution.** This record is evidence, not a permission grant.

## Exact candidate and scope

- Reviewed HEAD: `9fb068beed0fb2171fc68eb47b5b9ad251fb8de7`.
- Runtime/test commit: `7ae0fdbeda0a15c93705db265042257628e00a80`. The only subsequent change is the stop-window repair Markdown record.
- Runtime module blob: `6d8aadb09c6c3801a902ba4c448cdc9347fa2ca9`.
- Runtime module SHA-256: `59ddcae2e722353fff5edc526966a8474e84f6477d00a418df5b970710e1b938`.
- Review branch: `chore/jev-int05-stop-closure-mac-20261007`. Documentation/evidence only; no runtime, test, package, provider-policy, frozen-J1 or Claude-owned branch changes.

A new detached checkout was created for the review and was clean before and after every completed test batch. The existing installed project dependencies were symlinked; no dependency installation occurred. Toolchain: `{"@types/node": "25.0.9", "node": "v22.22.3", "tsx": "4.21.0", "typescript": "5.9.3"}`. This is a strict **J1** typecheck, not full-application typechecking.

No credentials, paid inference, provider registration/assignment, ratification, authorization admission, canonical merge or deployment. All exercised transports were fake. No PILOT-01 files, labels, backups, reminders or servers were touched.

## Independent before/after witness

The exact reviewer script committed at `1d0c76a369605cb82e12c56a0d4b86af8a1b6012` was run unchanged against both the prior runtime and the repaired runtime. Script SHA-256: `d2ed3d2ad038aae5a4bc6453d329ff437e4fd5e17fef7812eb0ac3cfd0149a0d`. The prior witness checkout carries documentation over the `765c236e1` runtime; no source was reconstructed.

| Crash immediately after settled is durably written | Before: subsequent fake sends | After: subsequent fake sends |
|---|---:|---:|
| Transport error / uncertain crossing | 1 | 0 |
| Malformed response | 1 | 0 |
| Returned model drift | 1 | 0 |
| Usage exceeds reserve | 1 | 0 |

Every child exited at the intended boundary with exit 47. No explicit halt event was written before the exit. After the repair, saved outcome/observation data alone blocks the next dispatch. The separate W35 positive control confirms a clean success interrupted at the same boundary is not improperly blocked.

The independent response test that previously accepted `output_tokens = 9007199254740992` now refuses it. W37 tests nonnegative safe-integer parsing in both token fields and rejects unsafe billable input tokens inserted through the ledger API. This is scoped test evidence, not an assertion that every conceivable manual ledger fabrication has been tested.

## Regression results from the committed Mac source

- Original findings: 8/8 reproduced against old code; 0/8 reproduced against the repaired candidate.
- Wire proof: **37/37**.
- Committed wire matrix: **49/49 caught on named checks; zero reported problems**. Collateral failures are preserved in the full log.
- Original J1 host: **26/26**.
- Frozen J1 matrix: **63/63 named kills; zero survivors, unclassified or stale**.
- J1 freeze: **0 violations**.
- Strict J1 TypeScript configuration: **exit 0**.

All ten commands, including the separate before/after reviewer measurements, exited 0. The reviewer script's exit 0 is only completion of measurements; this closure additionally checks its four `stop_invariant_holds` fields and zero-send values.

| Command label | Exit | Full log SHA-256 |
|---|---:|---|
| reviewer-before | 0 | `23f9bd27ef820e43824729b7effd84000de439aff00b09de346304baef234f73` |
| reviewer-after | 0 | `762bf109519a1f698ba4a8c25b6e9c0ede4469c8fa8e23f971e73fae20d3319f` |
| findings-old | 0 | `ac451be44494e70df0417e26f3424d817f4b3282b4e6882cb6c2762fbac67edc` |
| findings-new | 0 | `22f47a690a33f2e81572f2d0b72a10f518c9ff35679acd77f01c5cb540e6bf74` |
| wire-proof | 0 | `f506198668e80a851afe1cb61b9c1a1e281efca865855bd9c9a3ce71958d2693` |
| wire-matrix | 0 | `3b9370bac925d55466d5c8ce4d42bd727acbcfb0cc1aeaadc0904f38b51f9f8b` |
| J1-freeze | 0 | `5bac75964bdcedccf8c36861ca23be8e237dfb33a71dc784f5b7eb13bcfc49fb` |
| J1-host | 0 | `80e2b2cad8d5ad8e63df4b6cc0f7c4d8219053484417b4ffa65f0a4c67bc3dbe` |
| J1-matrix | 0 | `e35eef67b683f9f7e596213c80ca835a9399f4f5acbb58e454d5c1458e0b35db` |
| J1-typecheck | 0 | `5f3369f63470dd92a4f9ec649017767bc61c6300349041e1b2a722c9a9b742f4` |

Exact commands, working directory, source HEAD and start/end timestamps are in the logs and `receipt.json`. The compiler log contains an invocation and explicit exit record rather than empty output alone.

Evidence directory: `docs/programme/evidence/jev-wire-stop-closure-mac-20261007/`.
Execution receipt SHA-256: `95a804eb829e81b20a6d17f9497312299ebe8d12f98477d71c403a6093e1e312`.
The checksum manifest covers every copied log and receipt. The evidence contains synthetic data only.

## Source/schema boundary remains unchanged

The captured public OpenAPI snapshot at `1d0c76a369605cb82e12c56a0d4b86af8a1b6012:docs/programme/evidence/jev-wire-repair-mac-20261007/typesafe-openapi.json` retains SHA-256 `a191f8a7df6bd6fedced8120dd0fd106f88575d1d1c8360d08900a6c7c0360d5`. The descriptor matches the documented field names in that snapshot. No new provider request was needed for this review.

Question table: `jev-wire-q2`, SHA-256 `6bb269d84c674d14730ecd0519ef48caef430e764fde9e32eb2f1f267610064e`.
Fixture list SHA-256: `a0f4a26cea085527783a62c8875fdf60f2fed93d1f4ff48d2285ab5288c24f60`.
Committed `RESPONSE_SHAPE.witnessed`: **false**. The independent control confirms **zero sends**. Temporary test variants open this flag only for fake transports; the committed candidate is unchanged.

## Next technical deliverable, not performed here

The reported defect repair can close without another broad repair cycle. External checkpoint enforcement remains specified but unbuilt; the existing return value `ledger_head` is not a persisted independent checkpoint.

For that next implementation, require checkpoint agreement **before dispatch as well as on startup**. In particular, persist and verify the reservation checkpoint before a request can leave, then checkpoint the observed/settled outcome before reporting completion or permitting another attempt. Outcome-only checkpoints leave an interval between dispatch and the first outcome that has no independent record of the attempt. This is a requirement for the unbuilt wrapper, not a claim that this review tested it.

Bind the checkpoint to a unique experiment initialization, sequence/head, table/fixture/model identities and caps. Specify a conservative two-store transition protocol; any ambiguous or unavailable state must cause zero sends rather than silently advancing an anchor or resetting history. Test process loss between the two stores, missing/truncated/replaced history, missing checkpoint, repeat initialization, unavailable checkpoint volume, stale locks, and normal resumption. Preserve uncertainty and reservations; no automatic lock deletion or resend.

Suggested configurable paths for a future run (not created or approved here):
- Ledger: `/Users/soullab/jev-int05-synthetic/run-001/ledger.jsonl`.
- Independent checkpoint: `/Volumes/T7 Shield/jev-int05-checkpoints/run-001/anchor.json`.

These can be injected into a synthetic test wrapper, so final runtime placement need not block local development. A separate-volume checkpoint reduces common storage failure exposure; it is not proof against both stores being deliberately or simultaneously rolled back.

The real adapter, applicable terms/DPA review, J1R5-WIRE ratification, Route A prior-authorization and assignment sequence, bounded execution/network/disclosure/spend grants, credential, and controlled activation remain separate, unopened matters. No new founder questionnaire or human calibration labels are requested.
