# PASS 2 · SEAM EXPERIMENT — predeclared protocol (2026-09-14) · APPROVED WITH CORRECTIONS (founder, §10) · EXECUTION HELD pending the two authority acts

**Founder ruling opening this (census §7.18):** the daemon question is closed for this archive; the client-side seam the calibrated instrument can resolve is worth **one matched experiment**: a LOGGED batch paired with a MATCHED NO-LOG CONTROL, design and witness implementation authorized, **execution HELD until this protocol is predeclared, gate-pinned and ruled**. Nothing below authorizes a sample.

## 1 · The two questions (frozen)

- **Primary:** *Does the temporal/order signature inside `engine.start()` differ between takes and misses?* — read from the external unified log aligned to the sample's own journal.
- **Control (as ruled under D-L1):** *Does the take/miss distribution or ordinary driver timing differ between the two same-session blocks?* — **CONTROL = no `log(1)` invocation; a same-session block-drift/stability control, NOT an observer-effect control** (the collect happens after all sampling, so CONTROL and LOGGED have the same external condition during sampling). "No-log control" survives only as historical shorthand.

`audiomxd` is not a purpose of this experiment (ladder CLOSED, §7.17). The outcome of a sample is whatever the kernel ledger already calls it: **take = `gen-1 listen`; miss = `failure then recovery` · `failure then degradation` · `other observed shape`**. The external log never redefines the outcome.

## 2 · Blocks, N, order (frozen; D-L2 for the founder)

- N = **30 per block**, fixed; the runner refuses any other N.
- Two blocks, each one ordinary driver batch: AUTOMATED-COLD-LAUNCH · Mode L · cold-launch law unchanged · **subject RULED: `phase-a` on the installed R1, no reinstall** (continuity with LOG-CAL; no install boundary; no unrelated device act; P5-B0 available only for a later replication if earned) · same driver, same harness, no reinstall inside a block.
- Order **RULED: CONTROL → LOGGED → one post-hoc collect** — the collect can affect neither block's samples and its `--start` (LOGGED T0 − 5 s) excludes CONTROL by construction; the reverse would place the heavy collect between the blocks. Interleaving not proposed.
- Both blocks on the same install, same session, same day; the reinstall boundary is not crossed inside the experiment.

## 3 · What "logged" means here (D-L1 — a design decision for the founder)

The unified log is persisted by the device continuously; `log collect` only reads the store afterwards. The instrument therefore has two possible shapes:

- **(a) Post-hoc block collect — IMPLEMENTED.** The LOGGED block runs exactly as the control does; **after the 30th sample** one root-scoped `log collect --start <block T0−5 s>` reads the store; per-sample windows are then `log show`n offline at DEFAULT level (all seam lines were default-level in LOG-CAL) using the per-sample wall windows the batch now records (`sample-timing.tsv`). *During sampling nothing external runs that does not also run in the control.* Consequence: the control cannot measure an observer effect of the collect (there is none during sampling); it measures **same-session drift** of the take/miss rate and driver timing — still needed, because a rate difference between the two blocks must be separable from block order.
- **(b) Per-sample collect — NOT implemented.** The LOG-CAL shape repeated 30 times: a ~3-minute USB log dump *between* every pair of samples, 30 sudo elevations, ~2 h. The control would then measure the inter-sample effect of that dump on the next cold launch. Heavier, and it changes the inter-sample state of the logged block relative to every prior stratum.

**RULED (founder): (a), exactly as built; (b) REJECTED.** Consequence, ruled: a take-rate difference between the blocks is a block/time difference, never evidence of an instrumentation effect.

## 4 · Fields (FROZEN before any outcome is read; `k00_log_align.seam_fields`)

Per sample, from the sample pid's own `com.apple.coreaudio` / `com.apple.avfaudio` lines aligned by the two synchronous anchors (`Activated session` ↔ `session_activated`; `start, was running` ↔ `start_begin`), all in ms relative to the journal's `start_begin`:

| field | definition |
|---|---|
| F1 `aurio_start_ms` | first `Starting AURemoteIO` line at/after start_begin |
| F2 `iounit_post_ms` | first `iounit configuration changed > posting notification` at/after start_begin |
| F3 `iounit_post_vs_start_return_ms` | F2 − (start_return − start_begin); negative = posted INSIDE `engine.start()` |
| F4 `first_callback_vs_start_return_ms` | journal `first_input_callback` − `start_return` (absent on a miss with no callback) |
| F5 `iounit_posts_in_seam` | count of such posts in the FULL declared window [start_begin − 50 ms, max(start_return, first callback) + 500 ms] — implemented as `posts_in_seam`, distinct from `posts_at_start` (at/after start_begin) which feeds F2/F3/F6 (founder correction, §10) |
| F6 `order_signature` | the order of {start_begin, aurio, iounit_post, start_return, callback} as observed |

**Boundary tolerance (ruled explicit):** for F1/F2/F6 a line within 1 ms *before* the aligned `start_begin` is boundary-equal (integer-ms journal quantization), not genuinely pre-start. **Alignment fail-closed (ruled):** both synchronous anchors must be present AND agree to ≤ 2 ms, else the sample's seam is `UNREADABLE: synchronous anchors disagree` and no field is emitted — a wrong-event match fails closed (C-D14).

Raw evidence preserved per sample: the verbatim seam transcript (`seam/sample-<i>.txt`) — every coreaudio/avfaudio/AURemoteIO line of the sample pid in the seam window. **No new derived field after outcomes are visible**; any later field is a new predeclaration, labelled exploratory, never pooled with F1–F6.

## 5 · Sample treatment and refusal conditions (frozen)

- Infra / precondition rows are not samples (existing law); they are counted and reported per block.
- A logged sample whose seam cannot be read (no journal · no `Activated session` line · anchors incomplete · reader STOP) is **counted for take/miss and excluded from the seam comparison** as `UNREADABLE`; the count is reported.
- Collect failure → **every seam row of the block UNOBSERVABLE**; the 30 kernel-ledger rows stand as audio samples; the primary question is unanswered, not answered.
- Batch abort (existing laws: xcodebuild refusal · listing failure ×3 · lingering harness) → the block is INCOMPLETE and reported as such; no top-up, no rerun inside the experiment.
- The runner refuses: N ≠ 30 · block not `control|logged` · no `K00_EXEC_AUTHORITY` · logged block without `K00_LOG_SUDO=1` · logged block without an explicitly named, sealed probe (`K00_LOG_PROBE`; never newest-probe discovery) · `--info`/`--debug`/`log config` anywhere (pinned absent).
- Stop conditions during a block: none beyond the batch's own; the founder's governance stop is always available and is recorded as such.

## 6 · Comparison statistics (predeclared)

- Primary: per field, takes vs misses — median · min…max · n · **AUC (take > miss)** as in census pass 1 (0.5 = no separation); F6 as counts per signature. A field absent in a class is reported as absent, not imputed.
- Control: take rate LOGGED vs CONTROL with **Fisher's exact test, two-sided**; infra counts; median driver wall per sample. Predeclared reading (ruled): **p ≥ 0.05 → no block difference detected** (NOT proof of no drift, NOT an observer-effect finding); **p < 0.05 → block/time difference detected, reported without attribution**. Neither result is ever called an "observer effect" (D-L1).
- **Missingness frozen:** the per-class `absent-in X takes / Y misses` counts are part of the predeclared output — absence of F1/F2/F4 is visible evidence and never disappears through complete-case summaries.
- AUC is descriptive: near 0 or near 1 indicates separation, 0.5 none; no post-hoc significance test, no composite score.
- Nothing else is computed before the founder reads these.

## 7 · Interpretation boundary (founder, verbatim in substance)

A clean separation is a **client-side correlating signature** — not daemon causation, not mechanism. `configuration-change post < start_return` on misses and not on takes would be a strong localization result and still would not license "the configuration change causes the miss" without later perturbation or other causal evidence. No separation = Pass 2 has exhausted the currently observable hidden-state candidate without modifying the organism. **Ruled: F4 and the callback element of F6 are downstream context and cannot by themselves satisfy the primary claim that a distinguishing signature exists *inside* `engine.start()`; the localization claim must rest on pre-`start_return` evidence — principally F1/F2/F3 and the pre-return ordering in F6; F5 only insofar as the differing posts occur before `start_return`.**

## 8 · Instrument (built, gate-pinned, NOT RUN)

- `scripts/witness/k00-driver-batch.sh` now writes `sample-timing.tsv` (per-sample epoch window; orchestration only).
- `scripts/witness/k00-log-batch.sh <LABEL> --block control|logged [--subject …]` — the block runner (§3a). Control: the driver batch and nothing else. Logged: the driver batch → ONE `sudo log collect` after the last sample → per-sample `log show` at DEFAULT level → `k00-log-window-read.py --suffix s<i>` → `k00-seam-ledger.py`.
- `scripts/witness/k00_log_align.py` → `seam_fields()` (F1–F6, frozen) · `scripts/witness/k00-seam-ledger.py <LOGGED> <unifiedlog>` (per-sample rows + §6 primary) and `--compare <LOGGED> <CONTROL>` (§6 control).
- Shim: 4 synthetic samples (2 takes, 2 misses with the post inside `start()`) → fields, AUC, signatures, transcripts, Fisher — all produced offline. No device act has occurred.

## 9 · Rulings owed before execution — RULED (founder, 2026-09-14): D-L1 (a) · D-L2 CONTROL → LOGGED · subject `phase-a`/installed R1 · F1–F6 with the F5 fix · alignment ≤ 2 ms fail-closed · statistics with block-drift wording · missingness frozen. Still owed, separately: `K00_EXEC_AUTHORITY` and root for the single post-hoc collect — neither granted by the approval.

## 10 · Pre-execution delta (applied, gate-pinned, shim-exercised)

| item | before (`af5b5bcb8`) | after |
|---|---|---|
| F5 | `len(posts)` with posts filtered `rel ≥ −1 ms` — posts in −50…−1 ms excluded although §4 counts them | `posts_in_seam` over the full declared window → F5; `posts_at_start` (≥ −1 ms) → F2/F3/F6 |
| boundary tolerance | implicit | stated in §4: within 1 ms before the boundary = boundary-equal |
| alignment | offsets averaged regardless; disagreement only reported | agreement > 2 ms → `UNREADABLE: synchronous anchors disagree`, no fields emitted |
| control wording | "observer/drift", "no-log control" | "block-drift comparison; CONTROL = no `log(1)` invocation; NOT an observer-effect control" in the instrument, the runner and §1/§6 |
| statistics reading | "no observer/drift effect claimed" | "no block difference detected (not proof of no drift, not an observer-effect finding)" / "block/time difference detected, reported without attribution" |
| missingness | reported | frozen as predeclared output (§6) |
| interpretation | §7 | + F4/callback = downstream context; localization rests on pre-`start_return` evidence |

Shim: a post at −30 ms now counts in F5 (2) while F2 stays at the first at/after-start post; a 5 ms anchor disagreement yields `UNREADABLE`. The 60 samples remain unspent.
