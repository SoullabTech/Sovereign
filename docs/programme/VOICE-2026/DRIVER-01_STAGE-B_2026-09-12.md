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

---

## §5 Attempt 2 — `STAGE-B-20260912T191955Z` — 30 invocations, LEDGER INVALID AS PRODUCED (orchestration defect C-D5)

Run by the founder 19:19:55Z–19:42:27Z on the current install (seq 4608) with no second reinstall — the disposition question §4(2) answered by conduct. The SIGTERM cause for attempt 1 was not stated → UNKNOWN. Every one of the 30 driver invocations passed on the device (`testOneSample passed`, 25.05–25.88 s each), so the harness was cold-launched, entered, held and exported thirty times. The ledger, however, is not a record of thirty samples:

| # | rows written | what happened |
|---|---|---|
| 1–6, 9–14 | 1 each | ledgered correctly (12 rows) |
| 7, 15, 17, 19, 21, 23, 25, 27, 29 | 1 each, `DRIVER/INFRASTRUCTURE FAILURE — no new journal` | the container LISTING failed after the invocation; the batch read the failure as an empty container |
| 8, 16, 18, 20, 22, 24, 26, 28, 30 | 79 · 87 · 89 · 91 · 93 · 95 · 97 · 99 · 101 | the next listing succeeded and, against an empty BEFORE, every journal in the container (every run since 2026-09-11) was pulled and ledgered as that sample |

**C-D5 (this session's defect, orchestration only):** `list_journals` ran `devicectl … files … 2>/dev/null | grep -o …`, so a failed listing ("The system failed to get a list of files on the remote device", seen again by hand at 19:54:35Z) produced the same empty string as an empty directory. The batch then (a) ledgered the sample as "no new journal" and (b) assigned the empty result to `BEFORE`, so the next successful listing diffed against nothing. The listing failure recurred at every odd sample from 15 on; the container held 95+ journals by then (the harness never deletes its exports) and each even sample re-copied ~90 files, which is also why the per-sample interval grew from 33 s to 58 s over the batch. Repair (`k00-driver-batch.sh`): a listing that fails is retried three times; a persistent failure is an infrastructure row **that keeps the BEFORE snapshot** and names the journal as remaining on the device; a failed listing before sample 1 aborts the batch (exit 7); and more than one new journal after one invocation is never ledgered as a sample (all preserved under `journals/not-a-sample/`). Gate 35/35 with the repair.

**C-D6 (classifier, `k00-ledger.py`):** sample 5 (`K00-faf8fa3e`) was ledgered `SUBJECT-MISMATCH — gen-1 trace has 5 steps` because the subject check demanded exactly 13 gen-1 trace steps. The journal is the P5-B0 subject behaving lawfully: the §3 guard refused **at generation 1** (`input_format_after_vp 0.0 Hz` → `graph_start_refused`), which ends the trace at step 5 by design. The subject check now accepts a proper prefix of the ordered 13-step list only when a gen-1 `graph_start_refused` is present, records `gen1Refused=true`, and counts `media_services_reset` records. Regression: all 39 previously ledgered rows (Stage A 29, attempt 1 7, CALIBRATION-05 3) re-classify identically, hash-identical.

### §5.1 Reconstruction from the journals — evidence, NOT a ledger (founder ruling owed on standing)

All thirty journals exist in the repo (twelve pulled correctly, eighteen pulled inside the floods). Each invocation's journal is identified by its export epoch falling 24–26 s after that sample's `driver` timestamp in `batch.log`; every window holds exactly one candidate. Verified here for all 30: SHA-256 as pulled · cold launch (`didBecomeActive` first, generation 0) · 13-step P5-B0 subject (or the lawful 5-step gen-1 refusal, sample 5) · VP ON (`vp_enable_return readBack true`) · no `input_format_before_vp` · exactly one §3 0 Hz refusal per failed entry (15 refusals across 15 failures) · 0 interruptions · max generation 8.

| # | journal | export − driver | SHA-256 | class | evidence |
|---|---|---|---|---|---|
| 1 | `kernel00-K00-5798eff1-1789240822.jsonl` | 25 s | `f31f0dc0987a659e…` | gen-1 listen | listening 468 ms · gen 1 |
| 2 | `kernel00-K00-8718c7e0-1789240855.jsonl` | 25 s | `9560d2a04c89d02a…` | gen-1 listen | listening 420 ms · gen 1 |
| 3 | `kernel00-K00-541b50c9-1789240888.jsonl` | 24 s | `efda926934fefbed…` | failure then degradation | gen 7 |
| 4 | `kernel00-K00-075125a0-1789240921.jsonl` | 25 s | `37cd636b4b602523…` | failure then recovery | listening 7806 ms · gen 5 |
| 5 | `kernel00-K00-faf8fa3e-1789240954.jsonl` | 25 s | `b0b377c8d6075295…` | failure then degradation | gen 2 · **gen-1 refusal** · **media services reset ×1** (§5.2) |
| 6 | `kernel00-K00-064f9168-1789240988.jsonl` | 25 s | `911edeab36bcaec5…` | failure then degradation | gen 6 |
| 7 | `kernel00-K00-b6458f90-1789241021.jsonl` | 24 s | `72448017e57e1339…` | failure then recovery | listening 7912 ms · gen 5 |
| 8 | `kernel00-K00-91ae0f84-1789241055.jsonl` | 25 s | `bdc60b54cef13895…` | gen-1 listen | listening 430 ms · gen 1 |
| 9 | `kernel00-K00-30b56212-1789241102.jsonl` | 24 s | `c5c9cbb0a7667399…` | other observed shape | gen 8 · still `recovering` at export (16.5 s), neither listening nor degraded |
| 10 | `kernel00-K00-514464fd-1789241137.jsonl` | 24 s | `39cae958e69fa86d…` | gen-1 listen | listening 411 ms · gen 1 |
| 11 | `kernel00-K00-ff7c4dd9-1789241172.jsonl` | 24 s | `d024e410fdd940ac…` | failure then degradation | gen 7 |
| 12 | `kernel00-K00-496783f7-1789241207.jsonl` | 24 s | `ccfe1013c65b441f…` | failure then recovery | listening 6849 ms · gen 6 |
| 13 | `kernel00-K00-6086905e-1789241243.jsonl` | 25 s | `a63129fb8e9cbe04…` | gen-1 listen | listening 411 ms · gen 1 |
| 14 | `kernel00-K00-d952665a-1789241278.jsonl` | 25 s | `4138aa31dc5a1acd…` | gen-1 listen | listening 404 ms · gen 1 |
| 15 | `kernel00-K00-11ba3904-1789241314.jsonl` | 25 s | `733078af887c657f…` | gen-1 listen | listening 426 ms · gen 1 |
| 16 | `kernel00-K00-5a298e70-1789241350.jsonl` | 26 s | `68c207a714fb6a0f…` | failure then recovery | listening 3892 ms · gen 8 |
| 17 | `kernel00-K00-094aefed-1789241404.jsonl` | 26 s | `c7688c4a3aaa394d…` | gen-1 listen | listening 437 ms · gen 1 |
| 18 | `kernel00-K00-3ed37c7c-1789241441.jsonl` | 24 s | `e85f49c17ad03902…` | failure then degradation | gen 7 |
| 19 | `kernel00-K00-af17ce4a-1789241495.jsonl` | 25 s | `b321bb182da49239…` | failure then recovery | listening 11819 ms · gen 6 |
| 20 | `kernel00-K00-67ecbe44-1789241535.jsonl` | 25 s | `959a4228d87fbf31…` | failure then degradation | gen 7 |
| 21 | `kernel00-K00-4ba9ce99-1789241591.jsonl` | 24 s | `731d237eb784e6f8…` | other observed shape | gen 8 · still `recovering` at export (16.6 s) |
| 22 | `kernel00-K00-3d104b77-1789241633.jsonl` | 24 s | `e7544f259116f810…` | gen-1 listen | listening 426 ms · gen 1 |
| 23 | `kernel00-K00-d1b70c43-1789241693.jsonl` | 25 s | `70cc27dffa126b73…` | failure then recovery | listening 3814 ms · gen 8 |
| 24 | `kernel00-K00-90a49e10-1789241738.jsonl` | 25 s | `d435f03595a6423f…` | gen-1 listen | listening 431 ms · gen 1 |
| 25 | `kernel00-K00-f5992e85-1789241801.jsonl` | 25 s | `31690ea1ca54b1a6…` | gen-1 listen | listening 407 ms · gen 1 |
| 26 | `kernel00-K00-994492d9-1789241849.jsonl` | 25 s | `7d092911e437915b…` | gen-1 listen | listening 454 ms · gen 1 |
| 27 | `kernel00-K00-e4ba8a1a-1789241916.jsonl` | 25 s | `d640e30f4df38dc4…` | failure then recovery | listening 13760 ms · gen 7 |
| 28 | `kernel00-K00-f39914ed-1789241968.jsonl` | 25 s | `6c3fe807d0be3fe2…` | gen-1 listen | listening 423 ms · gen 1 |
| 29 | `kernel00-K00-57317542-1789242039.jsonl` | 25 s | `c22b66bc24378c01…` | gen-1 listen | listening 428 ms · gen 1 |
| 30 | `kernel00-K00-de1d430c-1789242096.jsonl` | 25 s | `da71f98cc4c54163…` | gen-1 listen | listening 423 ms · gen 1 |

Reconstructed tally (descriptive; standing undecided): **15 gen-1 listen · 7 failure then recovery · 6 failure then degradation · 2 other observed shape** (both still recovering at export, generation 8). Sequence `LLFFFFFLOLFFLLLFLFFFOLFLLLFLLL`. Failure shape as in Stage A: gen-1 `is_running_immediate` TRUE then zero callbacks, exactly one 0 Hz refusal, recovery through the existing policy — with two additions below.

### §5.2 Organism observations in attempt 2 (evidence, no mechanism claim)

- **O6 — first §3 refusal at generation 1 (sample 5, `K00-faf8fa3e`).** Until now the 0 Hz refusal had only ever fired at generation 2 inside the reconfiguration window. Here `input_format_after_vp` read 0.0 Hz at the very first build, 115 ms after `session_activated`, so `enterConversation` itself failed (`error enterConversation_failed`, floor `entering → degraded` at +154 ms). The gen-1 failure path (PRE-WITNESS-02 §3.3, "reviewed, left as is") was exercised on the device for the first time: it goes straight to `degraded` with no recovery request.
- **O7 — first device exercise of the media-services-reset path (same journal).** 3.33 s after the refusal iOS posted `media_services_reset` (cause UNKNOWN, no inference). The kernel re-activated the session stamped `media_services_reset_recovery` (lawful under P2), rebuilt generation 2 (`is_running_immediate` TRUE, `graph_started engineRunning false`), classified the following change `voice_processing_reconfiguration` and deferred it — and then **nothing**: no `engine_running_observed` tick, no `input_health_sample`, no verdict, no floor transition for the remaining ~12 s of the hold. The floor stayed `recovering`; the journal ends at 43 records. Contrast every other degraded session, where samples keep emitting. Reading offered as INFERENCE only: the supervisor's tick was never started because entry failed before it, and the reset-recovery rebuild does not start it — a silent limbo distinct from `degraded`. Whether the 0 Hz at gen 1 was itself the onset of the media-server event is UNKNOWN.
- **O8 — generation 8 reached (samples 9, 16, 21, 23).** Stage A's failures resolved by generation 7 at the latest. Bounded (the policy admits at most 3 attempts per fault class across three classes); the two `other observed shape` rows are recoveries still in progress at the 16 s export, not a new class.

### §5.3 Custody

- Attempt 1's sample-8 journal is identified: `kernel00-K00-52781559-1789239945.jsonl` (export 33 s after sample 8's driver timestamp 19:05:20Z), pulled inside attempt 2's sample-8 flood; class gen-1 listen, listening 435 ms; copied to `STAGE-B-20260912T190130Z/journals/not-a-sample/` (SHA-256 `d2803ed9c76043fec6d5080fb18b29bf3b18630cd553071884944697329f84cd`), never counted.
- The attempt-2 ledger and its 101-journal directory are kept exactly as produced (the produced record is never edited); the flood copies are byte-identical to the originals in their own batches and in the run records.
- The container now holds ~100 journals and its listing service failed intermittently under that load. Deleting exports from the app container is a device act on the app's data, not on the app; **not done, not authorized here** — a founder decision (a `k00-container-archive.sh` that pulls everything, hashes it, and only then deletes would be the bounded form).

## §6 A and B side by side — never pooled

| | Stage A (`…183944Z`, same install, clean) | Stage B attempt 2 (`…191955Z`, identical reinstall, reconstructed §5.1) |
|---|---|---|
| valid samples | 29 (+1 infrastructure) | 30 invocations; standing of the reconstruction = founder ruling |
| gen-1 listen | 14 | 15 |
| failure then recovery | 9 | 7 |
| failure then degradation | 6 | 6 |
| other observed shape | 0 | 2 (still recovering at export, gen 8) |
| gen-1 refusal | 0 | 1 (O6) |
| media services reset | 0 | 1 (O7) |
| max generation | 7 | 8 |

Read: on both installs, about half of VP-ON cold starts take at generation 1 and the rest fail in the same shape. The reinstall boundary did not move the picture. No rate difference is claimed between A and B; they are laid beside each other, not compared statistically, and neither is pooled with the manual stratum (7/9).

## §7 Disposition — FOUNDER RULING OWED

1. **Standing of attempt 2.** Options: (a) accept §5.1 as Stage B by reconstruction (every invocation passed; every journal identified, verified and hashed; the defect was in Mac custody, not in the driver or the organism) — recorded as `AUTOMATED-COLD-LAUNCH (reconstructed)`; or (b) require attempt 3 on the repaired instrument (C-D5/C-D6) and keep §5.1 as evidence only. Recommendation: **(b)**, because D3 was declared on a clean ledger and the instrument can now produce one in 20 minutes; §5.1 stays in the record either way.
2. **Container housekeeping** (§5.3): authorize an archive-then-delete script, or leave the container as is and accept that listing failures will recur under C-D5 as infrastructure rows.
3. **O6/O7** are new device facts about the organism; nothing is repaired. The silent limbo after reset recovery (O7) is the one that touches the acceptance law (K00-10 bounded recovery) and should be named for PRE-WITNESS-06 scoping if it recurs, not repaired from one sample.
4. Stage C (Phase-A `4596b9bdb`) stays a founder decision after A and B are read.
