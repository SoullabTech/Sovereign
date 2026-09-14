# PASS 2 · SEAM EXPERIMENT — predeclared protocol (2026-09-14) · DESIGN + WITNESS IMPLEMENTATION · EXECUTION HELD

**Founder ruling opening this (census §7.18):** the daemon question is closed for this archive; the client-side seam the calibrated instrument can resolve is worth **one matched experiment**: a LOGGED batch paired with a MATCHED NO-LOG CONTROL, design and witness implementation authorized, **execution HELD until this protocol is predeclared, gate-pinned and ruled**. Nothing below authorizes a sample.

## 1 · The two questions (frozen)

- **Primary:** *Does the temporal/order signature inside `engine.start()` differ between takes and misses?* — read from the external unified log aligned to the sample's own journal.
- **Control:** *Does running the logging instrument materially alter the take/miss distribution or ordinary driver timing compared with an otherwise matched no-log batch?*

`audiomxd` is not a purpose of this experiment (ladder CLOSED, §7.17). The outcome of a sample is whatever the kernel ledger already calls it: **take = `gen-1 listen`; miss = `failure then recovery` · `failure then degradation` · `other observed shape`**. The external log never redefines the outcome.

## 2 · Blocks, N, order (frozen; D-L2 for the founder)

- N = **30 per block**, fixed; the runner refuses any other N.
- Two blocks, each one ordinary driver batch: AUTOMATED-COLD-LAUNCH · Mode L · cold-launch law unchanged · `--subject` as ruled (device currently holds **R1**, `phase-a`; a P5-B0 block needs the authorized reinstall expecting `CC0D3604-…` first) · same driver, same harness, no reinstall inside a block.
- Order proposed: **CONTROL first, then LOGGED** — so the LOGGED collect's `--start` (block T0 − 5 s) excludes the control block by construction and the control is uncollected by construction. The founder may flip the order; interleaving is NOT proposed (D-L1 makes it moot, see §3).
- Both blocks on the same install, same session, same day; the reinstall boundary is not crossed inside the experiment.

## 3 · What "logged" means here (D-L1 — a design decision for the founder)

The unified log is persisted by the device continuously; `log collect` only reads the store afterwards. The instrument therefore has two possible shapes:

- **(a) Post-hoc block collect — IMPLEMENTED.** The LOGGED block runs exactly as the control does; **after the 30th sample** one root-scoped `log collect --start <block T0−5 s>` reads the store; per-sample windows are then `log show`n offline at DEFAULT level (all seam lines were default-level in LOG-CAL) using the per-sample wall windows the batch now records (`sample-timing.tsv`). *During sampling nothing external runs that does not also run in the control.* Consequence: the control cannot measure an observer effect of the collect (there is none during sampling); it measures **same-session drift** of the take/miss rate and driver timing — still needed, because a rate difference between the two blocks must be separable from block order.
- **(b) Per-sample collect — NOT implemented.** The LOG-CAL shape repeated 30 times: a ~3-minute USB log dump *between* every pair of samples, 30 sudo elevations, ~2 h. The control would then measure the inter-sample effect of that dump on the next cold launch. Heavier, and it changes the inter-sample state of the logged block relative to every prior stratum.

Recommendation stated, decision the founder's: **(a)**. If (b) is ruled, it is a separate implementation.

## 4 · Fields (FROZEN before any outcome is read; `k00_log_align.seam_fields`)

Per sample, from the sample pid's own `com.apple.coreaudio` / `com.apple.avfaudio` lines aligned by the two synchronous anchors (`Activated session` ↔ `session_activated`; `start, was running` ↔ `start_begin`), all in ms relative to the journal's `start_begin`:

| field | definition |
|---|---|
| F1 `aurio_start_ms` | first `Starting AURemoteIO` line at/after start_begin |
| F2 `iounit_post_ms` | first `iounit configuration changed > posting notification` at/after start_begin |
| F3 `iounit_post_vs_start_return_ms` | F2 − (start_return − start_begin); negative = posted INSIDE `engine.start()` |
| F4 `first_callback_vs_start_return_ms` | journal `first_input_callback` − `start_return` (absent on a miss with no callback) |
| F5 `iounit_posts_in_seam` | count of such posts in [start_begin − 50 ms, max(start_return, first callback) + 500 ms] |
| F6 `order_signature` | the order of {start_begin, aurio, iounit_post, start_return, callback} as observed |

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
- Control: take rate LOGGED vs CONTROL with **Fisher's exact test, two-sided**; infra counts; median driver wall per sample. Predeclared reading: p ≥ 0.05 → no observer/drift effect claimed; p < 0.05 → reported, never attributed.
- Nothing else is computed before the founder reads these.

## 7 · Interpretation boundary (founder, verbatim in substance)

A clean separation is a **client-side correlating signature** — not daemon causation, not mechanism. `configuration-change post < start_return` on misses and not on takes would be a strong localization result and still would not license "the configuration change causes the miss" without later perturbation or other causal evidence. No separation = Pass 2 has exhausted the currently observable hidden-state candidate without modifying the organism.

## 8 · Instrument (built, gate-pinned, NOT RUN)

- `scripts/witness/k00-driver-batch.sh` now writes `sample-timing.tsv` (per-sample epoch window; orchestration only).
- `scripts/witness/k00-log-batch.sh <LABEL> --block control|logged [--subject …]` — the block runner (§3a). Control: the driver batch and nothing else. Logged: the driver batch → ONE `sudo log collect` after the last sample → per-sample `log show` at DEFAULT level → `k00-log-window-read.py --suffix s<i>` → `k00-seam-ledger.py`.
- `scripts/witness/k00_log_align.py` → `seam_fields()` (F1–F6, frozen) · `scripts/witness/k00-seam-ledger.py <LOGGED> <unifiedlog>` (per-sample rows + §6 primary) and `--compare <LOGGED> <CONTROL>` (§6 control).
- Shim: 4 synthetic samples (2 takes, 2 misses with the post inside `start()`) → fields, AUC, signatures, transcripts, Fisher — all produced offline. No device act has occurred.

## 9 · Rulings owed before execution

D-L1 collect shape (a recommended) · D-L2 block order (CONTROL → LOGGED proposed) · subject (`phase-a` on the installed R1, or a P5-B0 reinstall first) · the frozen field list §4 as written · the statistics §6 as written · then, separately, the execution authority string and root for the one collect.
