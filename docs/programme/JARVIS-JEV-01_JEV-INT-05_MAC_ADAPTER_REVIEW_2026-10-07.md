# JEV-INT-05 — Independent Mac review of the inactive HTTP adapter

Date: 2026-10-07. **Disposition: reported local-service integration and retained suites verified on the Mac. The normal string-credential/default-limit path works. Two bounded adapter-hardening areas remain: credential callback handling (error redaction and cancellation at dispatch), and response-limit configuration validation. No checkpoint repair is reopened. Candidate remains inactive and unratified; no live execution is authorized.**

## Source and review boundary

Reviewed HEAD: `76fe39b2300a1e7d18bc953893c80f42c195c15c`. Code/test commit: `0dadf2f8a3567a653a8d644a2a1a26afad57289b`. Only the adapter return Markdown record differs between those commits.
Reviewer branch: `chore/jev-int05-adapter-mac-review-20261007`. This review adds documentation and synthetic evidence only; it changes no runtime, tests, package scripts, frozen J1 files, provider policy or authorizations. The Claude-owned branch was fetched and read, not written.

The existing runner differs from its prior state by the single line supplying `bodyHash` to transport. The checkpoint module is unchanged from the closed dangling-link repair. Source blobs:

- `scripts/builder/jev-wire-http-adapter-v1.mjs`: `562f1ec3be079fdac0c575f1466dacb9fcca29e2`.
- `scripts/builder/jev-wire-v1.mjs`: `cb91b5458428f910f64263b45809776b9826b3e0`.
- `scripts/builder/jev-wire-checkpoint-v1.mjs`: `bf30fa98fb28a024779c15a34422fe16af49f993`.
- `scripts/builder/jev-judgment-host-v1.mjs`: `8138beeb387b1264ce386163ea7468108f2d7451`.

No TypeSafe request, external inference, real credential lookup, provider registration/assignment, spend, ratification, authorization admission, canonical merge, deployment or PILOT-01 activity occurred. All HTTP servers listened on literal `127.0.0.1`; all credentials were explicit dummy strings or synthetic callbacks. The reviewed adapter was never given remote execution for a send. Tests use environment allowlisting; no package installation occurred. Functional runner variants open the schema flag only in temporary copies; the committed flag remains false and a local-server control confirms zero requests through it.

## Project-toolchain verification

Clean detached checkout before review documentation, installed dependency tree symlinked: Node v22.22.3, TypeScript 5.9.3, tsx 4.21.0, @types/node 25.0.9. Strict **J1** typecheck, not full-application typechecking. Up to three isolated test commands ran concurrently; each used its own temporary data and ephemeral loopback server where applicable.

- Adapter proof: **15/15, three consecutive submitted runs** (all three pass).
- Adapter matrix: **18/18 caught on named checks**.
- Checkpoint proof: **16/16 across three runs**; matrix **28/28**.
- Wire proof/matrix: **37/37 and 49/49**.
- Original eight findings: **8/8 reproduced against the old candidate; 0/8 against repaired code**.
- J1 host: **26/26**; frozen J1 matrix: **63/63 named kills, zero survivors, unclassified or stale**.
- J1 freeze: **0 violations**; strict J1 typecheck **exit 0**.

All 16 commands completed with exit 0 and source clean. These are scoped suite results, not proof against every possible failure path.

In addition to the committed matrix, an independent executor reran all 18 adapter mutations and required: exactly 15 unique checks, a complete final summary, exit 1, no signal or timeout, and the declared named assertion failure. **All 18 meet these criteria.** Exact edits and complete per-mutant outputs are retained in `adapter-mutation-completeness.json` and its logs; no crash or unfinished run is counted as a kill.

| Command label | Exit | Full log SHA-256 |
|---|---:|---|
| http-adapter-proof-1 | 0 | `f7485a40f345db5131cf31364477523cca374f40840f602b7aaf1525918d3497` |
| http-adapter-proof-2 | 0 | `d154a686429e971c0b570d932e2a346a23e7aecad6d6044b0db1b36e7f7999f5` |
| http-adapter-proof-3 | 0 | `dcd982a15e5e18f9091d087384d4e9862801150654b59c9fa9d27bf32e584a67` |
| http-adapter-matrix | 0 | `f3815fc381d1d3f3bf4e6f9339805e66252437c1c9bb5ba88365321b556e85c6` |
| checkpoint-proof-1 | 0 | `c3a6cb8b8781f42c188d2585e2b1e96ab0813da5a215af2f985fedb80f2d0397` |
| checkpoint-proof-2 | 0 | `a7351442460c41e0c06c2687343ceb47db7e6bfabc2f196a2886a3f33772a468` |
| checkpoint-proof-3 | 0 | `d983602e60b38d054ea2bbfe723b97a3893bf76da18ea7c20ac157fbff2ec2f0` |
| checkpoint-matrix | 0 | `eafeb5e197297f22d523c40fdb6b80667851385583f02a2569ce0ceb2ded2ff2` |
| wire-proof | 0 | `e903961dcda3fe7cf49858b7aed21680788267727040ad46ed91723c89b8daaf` |
| wire-matrix | 0 | `a83968bf5e582ecd08774f0e482b0251d88ba5f291ffe0c97af6c5645e7afb44` |
| findings-old | 0 | `30272970c9083a150319fa6a8b3b352a239765f4bb9998b06fb5f8796fed677d` |
| findings-new | 0 | `a6513a7ee7840695122966b0085663e3fd60f59d3c9e88164935440c5563cab9` |
| J1-freeze | 0 | `10ee78b8f2c04a2c886e0022760862563bdeb492e1e38aec85d85615f63679f3` |
| J1-host | 0 | `3bb9f810726484b79396374d51e79fd4b82e772953d15928e89043cee520af15` |
| J1-matrix | 0 | `d1b870c53561110ad2bce4fb19b20300684a9a018807edad29aa4a5aa3d951db` |
| J1-typecheck | 0 | `ade72812509fb0c1f6d3427647f14846fc854c95fc427674ae58306fd7fccf0b` |

Execution receipt SHA-256: `083c37d73ea0d289f90a00ff6602dd16deda3499376f6bd3dd2cbafa214a219c`.
Logs include command, source HEAD, timestamps and explicit exit status, including the silent compiler's nonempty execution record.

## Independent complete-flow and duration checks

The committed adapter was exercised with a temporary functional runner and the existing checkpoint wrapper against a separate local mock. Fresh synthetic ledger files were placed on the Mac, and independent checkpoint files on the mounted T7. Device ids differed (`16777230` and `16777244`). No actual volume was disconnected or altered.

**31/31 named attempts completed over loopback HTTP.** At server receipt, every request matched the persisted pre-send body hash and the checkpoint already matched that reservation. After completion, each settlement was checkpointed. All 31 observations were present; restart refused replay. The simulated accounting total was 31 x 300 x the candidate's fixed token rate = $0.0003906, not an actual charge or verification of account billing. The committed gate produced zero local requests.

A separate headers-stall test used the adapter's actual default **30,000 ms** setting rather than the shorter unit-test deadlines. It returned `ADAPTER_TIMEOUT` after **30002 ms**. At the 100 ms server-side observation grace, zero sockets remained. This covers a loopback headers stall; it does not test DNS/TLS establishment or physical network failures.

The default 65,536-byte response cap rejected a 70,118-byte body. Ordinary cancellation, malformed replies, HTTP failures and redirects pass the committed cases. Server-side closure after cancellation/timeout is evidence of the tested local behavior; it is not proof that a remote provider did not process a timed-out request.

## E1/E2 — optional credential callbacks bypass two adapter promises

The API supports both string credentials and a synchronous callback. The normal string path passes. The callback path has two reproducible edge cases:

1. **E1, callback throws.** A dummy callback throws an Error containing a dummy credential marker. `send()` propagates that original exception synchronously; its message/stack include the marker, rather than returning only a closed `ADAPTER_*` error. Zero connections were opened. This contradicts the adapter's direct error-redaction contract. No real secret was involved. The current outer runner catches transport exceptions, so this measurement is not a claim that a real credential reached its ledger.
2. **E2, callback cancels.** A dummy callback deliberately aborts the supplied signal before returning a valid dummy key. The adapter checked the signal before calling the callback and installs its listener afterward; it misses this cancellation. **One local request is still sent and a response is returned**, although the signal was already aborted before request creation. Ordinary pre-abort and later asynchronous-abort tests remain passing; this finding is precisely the credential-acquisition boundary.

Bounded correction: either explicitly restrict the candidate to validated string credentials and remove callback support, or preserve callback support while catching callback failures into a generic closed adapter error without the original message/cause/stack and rechecking cancellation after acquisition, immediately before a request may be created. Keep every invalid/aborted case at zero connections; retain a valid callback positive control. No actual credential lookup implementation is requested by this correction.

## E3 — invalid size configuration can disable the response limit

`timeoutMs` is validated, but `maxResponseBytes` is not. With either **NaN** or **Infinity** supplied as the latter, a 70,118-byte response is accepted. The same response is refused under the default limit. This is an invalid-configuration case, not failure of the default cap.

Bounded correction: validate `maxResponseBytes` as a finite, positive safe integer at construction, before any connection. Test invalid numbers/types plus a valid finite override and retain the default oversize-body refusal. Do not broaden the experiment or rewrite the checkpoint layer to repair this.

`independent-adapter-witness.mjs` reproduces these measurements and the positive controls. It creates only fresh synthetic stores, uses dummy credentials, and listens locally. Its exit 0 means measurements completed, not acceptance: inspect each result row. E1's result records only whether the dummy marker leaked, not a real credential. Results SHA-256: `9a76be1aaa1eac1a000e14c35b31e6b3cf9e687ac5c24251d33ab12d7eaeee14`.

## Runbook

The documented `node -e` triage command was run unmodified against a fresh copy of a synthetic ledger containing one unresolved reservation. It exited 0, reported that reservation, and left original and copied bytes unchanged. Pair verification also succeeded on the copies. **`pair.verify()` creates and removes its own temporary pair lock** on the copy; it should not be described as a wholly mutation-free operation on live originals. The runbook already directs inspection to copies. No operator is assigned and no production lock was removed.

The triage check establishes the shown command's behavior, not a full rehearsal of every recovery procedure. A designated operator, exact runtime locations and recovery authority remain deployment decisions. The runbook must not infer authority to recover or restart from a checksum or successful inspection.

## Remaining boundary and next handoff

The missing-adapter item has advanced: **a real HTTP implementation exists and its local-service integration works**. TLS/certificates, DNS, proxies and real TypeSafe behavior remain untested here. Neither the public schema nor a mock proves the vendor service's current behavior or grants permission to use it.

Request only a focused adapter-hardening pass for E1/E2 and E3; add committed regressions and named defeat candidates, then retain/rerun the relevant suites. C1/C2, the checkpoint protocol and manual-recovery rules stay closed and unchanged. No new human calibration labels or PILOT-01 activity.

A later live-run wrapper, J1R5-WIRE ratification, Route A prior canonical authorization/registration/assignment, applicable provider terms and billing review, explicit execution/network/disclosure/spend grant, actual secure credential supply, verified runtime mounts and assigned operator are still separate. Do not open `witnessed` or call a provider as part of this repair. For a later authorized staged run, a first-call inspection should use the first of the 31 named attempts, not add an uncounted extra call or retry.

Evidence directory: `docs/programme/evidence/jev-wire-adapter-mac-20261007/`. `SHA256SUMS.txt` covers all copied scripts, receipts and logs. No ZIP transfer is required.
