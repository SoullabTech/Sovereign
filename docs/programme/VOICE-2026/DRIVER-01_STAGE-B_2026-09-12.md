# DRIVER-01 · STAGE B — identical reinstall, AUTOMATED-COLD-LAUNCH, N=30 (Mode L)

Lane: `VOICE-2026` · `KERNEL-00` · `DRIVER-01` · subject `24a6fcfa1` (P5-B0, dylib `CC0D3604-7902-373E-A2BB-2C093D9BF804`) · device iPhone 16 Pro Max (`A0736AC8-793B-516F-AC72-C076DB6CEE38`).

Plan reference: `DRIVER-01_PLAN_2026-09-12.md` (D1–D5, §16 calibration accepted). Stage A record: `DRIVER-01_STAGE-A_2026-09-12.md`.

**Status of this record: STAGE B NOT COMPLETE.** Attempt 1 was terminated externally at sample 8 of 30. Under D3 (N fixed before execution, no early stopping, the declared N is finished) a 7-sample batch is not Stage B and is not read as Stage B. Its rows are preserved here as an incomplete batch, never pooled with any other batch, and the disposition is a founder ruling (§4).

---

## §1 Reinstall boundary (the act that opens Stage B)

`scripts/witness/k00-reinstall.sh` ran once, 19:01:28Z, record `driver-ledger/reinstall-20260912T190128Z.txt`, `.last-reinstall = 20260912T190128Z`.

| Check | Value | Verdict |
|---|---|---|
| dylib UUID of the local product BEFORE install | `CC0D3604-7902-373E-A2BB-2C093D9BF804` | identical to Stage A and run 6 — same artifact |
| codesign identifier / team | `life.soullab.voicekernel.k00` / `ZVK2X646Z2` | as recorded |
| install | `databaseSequenceNumber: 4608`, container `47A3FE4A-…` | new install sequence (Stage A ran on seq 4224) |
| post-install processes | no `VoiceKernelHarness` process | cold boundary holds |

The reinstall boundary is therefore satisfied: same signed bytes, new install, no harness process between install and sample 1. No non-driver launch of the harness occurred between the reinstall and the termination (batch.log shows precondition → driver → ledgered for every sample; no `stray process` line).

## §2 Attempt 1 — `STAGE-B-20260912T190130Z` — INCOMPLETE (terminated at sample 8)

Batch parameters (ledger header, verbatim): `stratum=AUTOMATED-COLD-LAUNCH · N=30 · vp=on · mode=L · hold=15s · w4=off · subject=p5b0`.

Timeline (batch.log, UTC): build-for-testing 19:01:31 · sample 1 driver 19:01:32 → ledgered 19:02:05 · … · sample 7 ledgered 19:05:20 · sample 8 precondition + driver 19:05:20 · **`zsh: terminated scripts/witness/k00-driver-batch.sh STAGE-B 30 --mode L`** (SIGTERM to the batch shell; source of the signal NOT STATED by the founder — recorded as UNKNOWN, not inferred).

Sample 8 is the boundary case: `sample-8-xcodebuild.log` shows `Test Case '-[DriverUITests.K00DriverTests testOneSample]' passed (25.161 seconds)` and the suite passed at 19:05:48Z, so the harness was launched cold, held, exported and was terminated by the driver on the device; the batch shell died between that completion and the journal pull, so **no ledger row exists for sample 8 and its journal is still on the device, unpulled** (epoch > 1789239912, i.e. the first `kernel00-*.jsonl` newer than sample 7's). Sample 8 is not a sample of any batch. Its journal is owed to `journals/not-a-sample/` for custody only (never counted), by the same rule as Stage A sample 9.

### §2.1 The seven ledgered rows (verified in this session: file hash = ledger hash · 13 `graph_start_trace` steps in generation 1 · no `input_format_before_vp` · `vp_enable_return readBack true` · cold=True · 0 orphans · 0 interruptions, 7/7)

| # | Session | Records | Class | Evidence |
|---|---|---|---|---|
| 1 | `K00-c3c4333d` | 53 | gen-1 listen | firstCallbackMs 94 · listeningMs 470 · gen 1 · hold 16.0 s |
| 2 | `K00-e7376ee7` | 240 | failure then degradation | isRunningImmediate true · graphStartedRunning false · 7 generations · degraded, no listening |
| 3 | `K00-9fc34c4b` | 112 | failure then recovery | listening first in gen 3 · listeningMs 3796 |
| 4 | `K00-c7385590` | 245 | failure then degradation | 7 generations · degraded, no listening |
| 5 | `K00-a7d20733` | 53 | gen-1 listen | firstCallbackMs 97 · listeningMs 422 |
| 6 | `K00-029de96a` | 53 | gen-1 listen | firstCallbackMs 96 · listeningMs 455 |
| 7 | `K00-7368ad1a` | 112 | failure then recovery | listening first in gen 3 · listeningMs 3908 |

Sequence `LFFFLLF` · tally 3 gen-1 listen · 2 failure then recovery · 2 failure then degradation · 0 infrastructure. Every failure shows the Stage A shape (gen-1 `is_running_immediate` TRUE → zero callbacks → verdict → exactly one 0 Hz refusal at gen 2 → existing policy). These seven rows are **descriptive of an incomplete batch only**; no rate is stated for them, and they are not compared to Stage A.

## §3 What this attempt establishes and does not

- Establishes: the reinstall path works end to end on the same signed artifact (UUID unchanged, new sequence, cold), and the driver produced seven valid samples on the fresh install before the termination. The termination is an orchestration event on the Mac, not a device or harness event (the device-side test of sample 8 passed).
- Does not establish: anything about Stage B's distribution. Seven of thirty is not the declared N. No pooling with Stage A, with Stage B attempt 2, or with the manual stratum.
- Defect class: none in the driver or the harness. A SIGTERM delivered to the batch shell is outside the batch's control; the batch has no trap that pulls an in-flight sample's journal on SIGTERM (custody gap, same family as Stage A sample 9 — the journal survives on the device and is recoverable by the same route).

## §4 Disposition — FOUNDER RULING OWED

Questions put to the founder:
1. What sent the SIGTERM (terminal closed · Ctrl-C-equivalent · system sleep · another process)? Recorded verbatim; if not known, stays UNKNOWN.
2. Stage B attempt 2: run a fresh `STAGE-B 30 --mode L` on the **current** install (seq 4608) **without a second reinstall** — the reinstall boundary already holds and no non-driver launch occurred — or reinstall again first. Recommendation: no second reinstall; attempt-1 rows stay as this incomplete batch, unpooled.
3. Sample-8 journal: pull to `STAGE-B-20260912T190130Z/journals/not-a-sample/` for custody (never counted).

Nothing in the kernel, harness, thresholds or driver source changes for attempt 2.
