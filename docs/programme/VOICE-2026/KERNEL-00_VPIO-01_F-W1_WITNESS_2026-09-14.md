# KERNEL-00 / VPIO-01 · F-W1 WITNESS — 2026-09-14 — N=30 EXECUTED · VERIFIED HERE · READING: 0/30 gen-1 takes → predeclared row "about the same / WORSE" · ADJUDICATION OWED (founder)

**Lane:** `VOICE-2026` · `KERNEL-00` · `VPIO-01` · branch `claude/voice-2026-census-01`.
**Authority:** founder ruling 2026-09-14 (plan §13.8): one governed N=30 batch, no pilot; authority string supplied at invocation, recorded in §13.8.
**Subject:** VPIO artifact from `85e5e7154` (dylib UUID `E8074AD1-D179-3267-A15C-142D033A9665`), installed by FIRST-INSTALL-01 (bundle container `6A2E406B-D1B8-43A4-92F3-29D50333AF19`, db seq 6720); instrument `de3efd3fb`; stratum `AUTOMATED-COLD-LAUNCH · VPIO-01`; Mode L · VP ON · hold 15 s.
**This record:** reads the evidence and applies the pinned F-W1 table. It adjudicates nothing. No next act is opened by it.

## 1. Custody

| item | value |
|---|---|
| evidence commit | `75bfffaece` on `feature/vpio-01b-driver-compile-record-20260914` → cherry-picked `-x` into this lane |
| directories | `driver-ledger/VPIO-01-preflight-20260914T200524Z/` (`apps.json` · `processes.json`) · `driver-ledger/VPIO-01-20260914T200542Z/` (187 files) |
| `ledger.md` SHA-256 | `3797692a664b1ded351e6e2615ad25a4ea95e6c7ec4ebd364c85007b9a74abef` (= founder's) |
| `batch.log` SHA-256 | `9d44fb9b1e22975a4d220cc60b9ff27d9552738cc6d26ff33b3f519811506d5d` (= founder's) |
| counts | ledger rows 30 · journals 30 · `not-a-sample/` 0 · sample logs 30 · timing rows 30 · daemon files 120 |
| wall clock | first log 20:05:43Z · `batch complete` 20:23:34Z · 17 m 52 s · exit 0 |
| preflight | instrument identical to `de3efd3fb` · container `6A2E406B…` lines 1 · harness processes 0 (both predeclared readings clean) |
| batch.log anomalies | 0 (no terminate-only, retry, abort, not-a-sample, UNOBSERVABLE) |
| founder-declared unplanned events | none |

## 2. Independent verification (this session, from the files)

- **Hashes:** 30/30 journal SHA-256 recomputed here = ledger rows.
- **Classifier reproduction:** `k00-ledger.py --subject vpio-01` re-run over all 30 → 30 × `failure then degradation`, identical to the produced ledger; 0 SUBJECT-MISMATCH, 0 infrastructure, 0 precondition failures.
- **Subject identity in every journal:** trace steps exactly `unit_created · io_enabled · vp_properties_set · input_format_read` followed by a gen-1 `graph_start_refused` — the frozen 11-step VPIO trace's exact ordered prefix + gen-1 refusal (the vpio-01 subject rule); `voiceProcessingRequested: true` ×30; `bypassReadBack: 0` ×30 (VP not bypassed); component `VoiceIO` ×30; no `engineRunning`, no `ioRunning` (nothing ever ran), no engine record name anywhere.
- **Cold:** 30/30 journals open with `app_lifecycle didBecomeActive {audioSession: inactive, floor: idle}`.
- **Session authority (F-W6):** every `session_*` record is `AudioSessionAuthority`; category `playAndRecord` / `voiceChat` / `defaultToSpeaker,allowBluetoothHFP,allowBluetoothA2DP`; `session_configured` reads `in=builtInMic ds=Bottom sr=48000 io=0.0100` — **the session reports a 48 kHz built-in-mic input at the moment the unit's format read returns 0 Hz.**
- **Sequence identity:** 29 journals = 15 records, one identical organism sequence; sample 1 (`K00-d56e3ca0`) = 17 records: the same 15 + a harness `willResignActive` / `didBecomeActive` pair after `degraded` (first launch of the batch; harness lifecycle, not an organism act; audioSession `active`, floor `degraded` both times).
- **Recovery:** 0 `recovery_requested`, 0 `recovery_scheduled` in 30 journals — the generation-1 failure path (§3.3, reviewed and left as is) goes `enterConversation_failed → degraded` with no recovery request. This is the O6 shape (first seen once on the engine subject, `K00-faf8fa3e`), here ×30.
- **Timing (ms, min / median / max):** `session_activated → graph_start_refused` 13 / 15 / 37 · `enterConversation → degraded` 51 / 59 / 126. Every sample's whole physiology fits inside ~60 ms; the 15 s hold observed a floor already `degraded`.

## 3. The physiology, exactly

```text
enterConversation
  AudioSessionAuthority: category · sample rate 48000 · io 0.010 · activate → ok · configured (in=builtInMic, sr=48000)
  VoiceIO gen 1:  unit_created (VP requested)
                  io_enabled   (input status 0, output status 0)
                  vp_properties_set (bypass 0 read back 0, elapsed 0 ms)
                  input_format_read  sampleRate 0.0 · channels 1          ← Input scope, element 1, BEFORE initialize
  VoiceKernel:    graph_start_refused invalidInputFormat(sampleRate: 0.0, channels: 1)   (§3 precondition, gen 1)
                  error enterConversation_failed
                  floor entering → degraded   (no recovery request: gen-1 failure path)
```

Never reached, in any of 30 samples: `formats_set` · `callbacks_armed` · `initialize_begin/return` · `start_begin/return` · `is_running_immediate` · any input callback · any health sample · any supervisor tick.

## 4. F-W1 reading against the pinned table (plan §8 item 2; §13.8) — a reading, not an adjudication

| field | value |
|---|---|
| valid non-infrastructure rows | **30** (0 infra → adjudicable, not "characterize only") |
| gen-1 takes | **0** |
| take proportion | 0/30 = 0.00 |
| pinned rows | ≥ 24/30 clear improvement · ≤ 16/29 (0.552) about the same / worse · between INDETERMINATE |
| **row entered** | **"about the same / worse"** — 0.00 ≤ 0.552 — and within that row the reading is **WORSE than every historical stratum**, not "about the same" |

Never pooled, laid beside: A 14/29 · B 15/28 · C 16/29 · R1 13/30 · **VPIO-01 0/30**. One-sided exact (hypergeometric) probability of ≤ 0 takes given the margins, per stratum: vs A `5.8e-06` · vs B `1.3e-06` · vs C `6.2e-07` · vs R1 `2.3e-05` (the "clear improvement" Fisher criterion is trivially unmet, p = 1). **F-W1 is now SPENT by this batch. Its outcome is FAIL on the entry axis.**

## 5. What this batch measured, and what it did not — the distinction the adjudication turns on

- **Measured:** the behaviour of the VPIO subject's own §3 precondition (`InputFormatObservation.requireValid`, carried over from the engine subject) when the hardware stream format is read from the Voice-Processing I/O unit's **Input scope, element 1, after `vp_properties_set` and before `AudioUnitInitialize`** (the placement chosen in plan §12: "hardware format read BEFORE any callback is armed → `try requireValid()`"). On this device/runtime that read returns `sampleRate 0.0, channels 1` **deterministically, 30/30, within ~15 ms of a successful 48 kHz session activation.**
- **Not measured:** whether a VPIO unit on this device can be initialized, started, and deliver input callbacks — the question the lower path was opened to ask (research §20.1; plan §0–§2). `AudioOutputUnitStart` was never called. **The F-W1 FAIL is a fact about the subject as built; it is not evidence that the Voice-Processing I/O unit cannot listen on this device.**
- **Contrast with the engine strata:** every engine failure was *non-deterministic* (gen-1 `start()` returned, `is_running_immediate` TRUE, then zero callbacks; the 0 Hz §3 refusal appeared only on a fresh engine inside the reconfiguration window, gen 2+; gen-1 refusal once in ~150 rows). Here the failure is *deterministic* and *earlier* — before initialize, before any start — and it is a refusal by design, not a start that did not take. The hidden-runtime-state question (census pass 1–2) was **not reached** by this subject.

## 6. Candidate explanations — INFERENCE, untested, none authorized

1. On an uninitialized Voice-Processing I/O unit the Input-scope / element-1 stream format is not yet populated from the hardware; it becomes valid only at `AudioUnitInitialize` (the documented configure → initialize lifecycle the founder's header adjudication cited for bypass-before-initialize). The engine subject's analogous read (`inputNode.outputFormat(forBus: 0)`) ran against an engine whose I/O unit the framework had already prepared.
2. The property/scope read is the wrong witness of "hardware format" for a raw unit; the session's own `sampleRate`/`inputNumberOfChannels` (already journaled as 48000 / built-in mic in the same millisecond) is the hardware fact the precondition intended to guard.
3. A timing race (activation → read 13–37 ms) — least likely given 30/30 with zero variance in the value.

Each candidate implies a **different bounded correction** (read after initialize with uninitialize-on-refusal · source the precondition from the authority's session read · both) and each is a **new SHA = new subject = founder act** (plan §6 F-V3 diff budget; acceptance law: never a silent retry). None is chosen here.

## 7. Other falsifiers, as exercised by this batch

| falsifier | reading |
|---|---|
| F-W2 unit reads running with zero callbacks | NOT EXERCISED (never started) |
| F-W3 cancel-to-silence · F-W4 duplex · F-W8 ducking | NOT EXERCISED (no output stream; no conversation floor) |
| F-W5 route/interruption/reset | NOT AUTHORIZED, not exercised |
| F-W6 session mutation only by the authority | HELD (every session record `AudioSessionAuthority`) |
| F-W7 replay | ledger replay: 0 orphans flagged ×30; the Swift `StateReplayer` was not run here (no toolchain) |

## 8. Standing after this record

F-W1 **SPENT · FAIL (entry axis; row "about the same / worse", decisively worse than A/B/C/R1)** · the substantive lower-path question **UNMEASURED** (the unit was never initialized or started) · the failure is a **deterministic precondition refusal at trace step 4 of 11**, candidate causes in §6 as inference only · evidence IN CUSTODY on this lane · ledger row classes reproduced here · **NO next act opened**: no correction, no rebuild, no second batch, no top-up, no reinstall, no threshold change; VPIO launch outside the batch NOT AUTHORIZED; K00-11/12/13/15 NOT AUTHORIZED; KERNEL-00 NOT accepted; KERNEL-01 / BENCH-01 / BRIDGE-01 / MIGRATE-01 CLOSED; JOP-04 UNTOUCHED; historical K00/R1 UNTOUCHED.

**Returned to the founder for adjudication:** (a) F-W1 outcome as read above; (b) whether the deterministic step-4 refusal is ruled a *subject design defect* (a bounded correction to the precondition's read placement/source as a new subject with its own compile and witness) or a *substrate finding* (the lower path closed on this evidence); (c) whether, under (a), the §3 precondition may lawfully be sourced from the authority's session read or moved after initialize — either amends where the guard reads, never whether it guards.
