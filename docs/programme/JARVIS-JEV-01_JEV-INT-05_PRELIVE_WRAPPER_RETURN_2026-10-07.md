# JEV-INT-05 — default-disabled pre-live wrapper: engineering return

**Date:** 2026-10-07 · **Status:** TESTED LOCAL-MOCK CANDIDATE · **OFF · NOT RATIFIED · NO EXTERNAL EXECUTION AUTHORIZED**

## Exactly what changed
Implementation source commit: `3eefdeb81fc39e24e328182d845ad3e024a3ef32` on the isolated development branch `chore/jev-int05-prelive-wrapper-20261007`, based on the previously repaired adapter at `c29e9aa1f`. All code and prior repairs on `claude/pensive-ride-hw6qra` were left untouched. No canonical merge, deployment, provider registration or activation occurred.

- **Wrapper:** `scripts/builder/jev-wire-prelive-wrapper-v1.mjs` composes the existing verified wire runner, checkpoint and HTTP adapter. It defaults to `INACTIVE`; `enableLocalMock:true` is confined to literal `http://127.0.0.1:<port>/v1/systemone` with a fixed nonfunctional dummy credential. There is **no remote-enabled branch** in this wrapper.
- **Frozen scope:** model `jev-1.13.0`; question table `jev-wire-q2` and hash `6bb269d84c674d14730ecd0519ef48caef430e764fde9e32eb2f1f267610064e`; fixture-list hash `a0f4a26cea085527783a62c8875fdf60f2fed93d1f4ff48d2285ab5288c24f60`; 31 named attempts, $1 ceiling, $0.005 reservation and 30-second maximum deadline. The wire-pinned source is verified before construction. No human labels or real-work content are used.
- **Physical preflight:** absolute configurable ledger/checkpoint paths, collision guard, separate-device requirement by default, **explicit expected device-ID pins**, and reinspection before reservation and dispatch. In a local mock only, a single-device fixture can opt out for testing. This attests the tested parent directories and device IDs, **not volume UUID identity or device-level power-loss behavior**; real deployment mount verification remains separately owed.
- **History controls:** explicit fresh synthetic initialization; no automatic reinitialization, `resume()` method, or stale-lock deletion. The existing checkpoint anchors the reservation before dispatch, and observed/settled records before completion. Any uncertainty blocks further sends.
- **Test seams:** a temporary wire copy with `witnessed:true` is injected **only by the tests** to exercise a loopback server. The committed wire remains `RESPONSE_SHAPE.witnessed:false`; when it is used, the wrapper sends **zero** requests.
- **Founder brief:** `docs/programme/JARVIS-JEV-01_JEV-INT-05_PRELIVE_FOUNDER_BRIEF_2026-10-07.md`.
- **Operator handoff:** `docs/ops/JEV_INT05_PRELIVE_OPERATOR_HANDOFF_2026-10-07.md`, supplementing the existing interrupted-run inspection runbook. No operator is assigned.

## Mac project-toolchain receipts
A clean, commit-pinned source worktree on the Mac Studio ran **17 commands**, all exit 0, with no source edits. Installed project dependencies (Node 22.22.3, TypeScript 5.9.3, tsx 4.21.0); TypeScript checks cover **the strict J1 configuration**, not the entire application.

| Check | Result |
|---|---|
| New pre-live proof × 3 | **12/12 pass** each |
| New pre-live defeat matrix | **11/11 wrong designs die on their named checks; 0 problems** |
| Mac–T7 separate-volume local-mock flow | **31/31 requests**; reservation already anchored at server receipt, observation and settlement anchored before return, replay refused |
| Repaired HTTP adapter | **18/18 pass; 23/23 defeat candidates killed** |
| Retained checkpoint | **16/16 pass; 28/28 candidates killed** |
| Retained wire | **37/37 pass; 49/49 candidates killed** |
| Original eight findings | **8/8 reproduce against the old code; 0/8 on repaired code** |
| Frozen J1 host and matrix | **PASS; 63/63 named kills, zero survivors** |
| J1 freeze verifier / strict typecheck | **No freeze violations / exit 0** |

The Mac/T7 test used fresh **disposable synthetic directories**. The Mac data volume and T7 device IDs differed (`16777230` and `16777244`). The first inspected mock request was **attempt 1 of the same 31**, not an extra. Simulated token usage was `$0.0003906`; **actual provider calls = 0, actual spending = $0**. The off-gate control used the committed wire and sent zero requests. The witness cleaned only its disposable directories.

The full receipts (exact commands, source HEAD, timestamps, exit codes and SHA-256 log hashes) are at `docs/programme/evidence/jev-int05-prelive-20261007/`. `receipt.json` SHA-256: `24839f53d3a4376f0c8d91c7e84999ac53fcfff3b711be2d9d5d079c0a55373b`. The tests and their matrix are committed; the long-running adapter/checkpoint/wire matrix survivors and collateral failures are classified by their own harnesses.

## Scope and boundaries
**Technical result:** the inactive wrapper successfully assembles the pinned local mock run, checks the limited physical mount conditions, and preserves the closed adapter/checkpoint behavior. This is not a validation of Jev's answer quality, real TypeSafe endpoint compatibility, TLS/DNS/proxy behavior, live billing or retention, power-loss durability, Windows/NFS behavior, coordinated rollback, or immunity to every filesystem race.

**Still missing and not authorized:** the actual external execution wrapper and reviewed off-switch change; founder J1R5-WIRE ratification; Class-A Route A canonical authorization and provider registration/assignment; the narrow network/data/spend/execution grant with expiry; TypeSafe DPA/retention and billing-term review; a real credential; final permanent mount location and qualified operator; and a deliberate first-call inspection. PILOT-01 remains deferred and untouched.

**Disposition:** keep this engineering candidate **OFF**. Do not construct a remote provider call or imply permission from these tests. The next milestone is a plain-language approval review after the unresolved contractual and constitutional decisions, not another labeling exercise.
