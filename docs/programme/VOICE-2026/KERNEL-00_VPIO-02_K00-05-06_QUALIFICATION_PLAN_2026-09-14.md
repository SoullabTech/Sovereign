# KERNEL-00 · VPIO-02 · K00-05 / K00-06 QUALIFICATION PLAN + INSTRUMENT COVERAGE CENSUS (2026-09-14)

**Status:** READ-ONLY PLANNING ACT (founder authorization 2026-09-14). **Nothing is implemented, compiled, installed, launched, played, cancelled, sampled or exercised by this record.** It reads source at `8210d834e` (organism `ac12dedf4b7b4efc9855c08bb4285a704e7039f1`, instrument `08483cfe4f6c3e98198805337ced99bae92ce911`), the ratified acceptance law (`ARCH-01/06_KERNEL-00_ACCEPTANCE_LAW.md`), the runbook and the existing records. It answers the six founder questions and returns for a ruling on whether a witness act opens and what instrument surface, if any, is allowed.

**Boundary honoured:** harness · driver · `VoiceKernel` untouched; no `xcodebuild`; no phone; `.vpio02` not launched; no tone; no microphone sample; cancel and duplex not exercised. K00-05 and K00-06 are kept as two obligations with two readings throughout, even where one invocation could serve both.

---

## 1. Current coverage census

### 1.1 What the frozen organism (`ac12dedf4`) already provides for output — read from source, never run

**Kernel output API (`VoiceKernel.swift`):**
- `playTone(seconds: 3.0, frequencyHz: 440)` — harness-only known PCM ("KERNEL-00 has no synthesizer"). Guard: `inConversation ∧ outputEnabled ∧ graph present ∧ floor == .listening`, else journals `play_refused (not_listening_or_output_disabled)`. On accept: `OutputStreamID.make()` → `graph.schedule(buffer, as: id)` → `OutputStreamRecord{id, .rendering, framesScheduled, generation, scheduledAtMs}` appended to `snap.streams` → `health.beginRendering(id)` → `outputFlow = .rendering` → journal **`stream_scheduled {framesScheduled, seconds}`** (to: id) → floor **`listening → maiaSpeaking`** (`stream_rendering:<id>`).
- `cancel(id)` → journal `command cancel {stream: id}` → `cancelStream`: `issuedAt = clock()`, `graph.cancel(id)` (returns frames rendered at cancel, or nil if that id is not the active stream) → record state `.cancelled`, `framesRendered = rendered`, `health.endRendering` → **`stream_cancelled {framesRendered, framesScheduled, cancelIssuedAtMs}`** (from: id) → floor **`maiaSpeaking → listening`** → after 300 ms **`stream_cancel_measured {cancelIssuedAtMs, lastNonSilentRenderedAtMs, cancelToSilenceMs, withinRatifiedWindow}`** where `cancelToSilenceMs = max(0, lastNonSilent − issuedAt)` and `withinRatifiedWindow = cancelToSilenceMs ≤ 100` (`HealthThresholds.cancelWindowMs = 100`, ratified).
- Completion: the render callback fires `onStreamComplete` when it has emitted the last scheduled frame → `handleStreamComplete` (generation-guarded) → record `.complete`, `framesRendered = framesScheduled` → **`stream_complete {framesRendered}`** → floor `maiaSpeaking → listening`.
- Tick (~100 ms): `graph.renderStats()` → `health.observeOutput` (progress) and `snap.streams[i].framesRendered` updated; the supervisor returns `outputStalled` after ≥ 1 000 ms without progress while rendering (K00-08, ratified) → `stream_failed`. Per-second **`output_render_sample {stream, framesRendered, framesScheduled, outputFlow, synthetic}`** is journalled beside **`input_health_sample {windowMs, callbacks, rmsMean, rmsMax, peakMax, digitalZero, noiseFloor, signal, inputFlow, route, ioRunning, synthetic}`**.

**Substrate (`AudioGraph.swift`, the VPIO-02 interior):** output is filled inside the unit's render callback from `activeSamples`; each buffer sets `nonSilent` if any `|v| > silencePeak (1e-7)` and stamps `lastNonSilentAtMs = clock()`; `cancel(id)` nils `activeStream` under the lock so the *next* render callback emits zeros — "a late completion is impossible". `makeTone` = sine at `outputSampleRate` (read from the hardware format at start, 48 000 on this device), amplitude 0.2, 10 ms fades → 3 s = **144 000 frames scheduled**. The input callback (pull by `AudioUnitRender`, element 1) is unchanged by output; every input buffer is classified `digitalZero (peak ≤ 1e-7) / noiseFloor (rms < 1e-3) / signal` by the pure supervisor. Voice processing runs *inside* the unit (`bypass 0`), so the input the kernel observes during output is **post-AEC** — a fact to record with every coupling measurement, not a threshold.

**Harness (`HarnessView.swift` / `HarnessModel.swift`, frozen inside the organism tree):** buttons **`Play 3 s tone`** (disabled unless `floor == listening ∧ outputEnabled`), **`Cancel active`** (disabled unless a stream is `.rendering`; acts on the last rendering stream), `Output: enabled/disabled` (default enabled), `Speaker` / `System default`, the K00-07/08/09/10 fault toggles + `Apply faults`, `Export journal`, `Record manual intervention`. Read-outs: floor text, `last cancel → silence N ms` (green ≤ 100), up to five stream rows `<id prefix> <state> rendered/scheduled`. Tone length is fixed at 3 s; there is no timed cancel and no repeat control.

### 1.2 What the driver (`K00DriverTests.swift`, instrument `08483cfe4`) can actually control and observe

Three tests: `testOneSample` (cold precondition → launch by bundle id → set VP by its visible toggle → tap `Enter conversation` → `Thread.sleep(hold)` → tap `Export journal` → terminate), `testW4Sample` (Enter → sleep → `Leave` → 3 s → export), `testTerminateOnly`. Runner env keys: `K00_MODE · K00_VP · K00_HOLD_S · K00_W4_MS · K00_SUBJECT` (the app under test receives none). The generic `tap(label, timeout)` helper reaches **any** harness button by label; nothing in the driver taps `Play 3 s tone` or `Cancel active`, reads `isEnabled`, or waits for `listening`. The driver observes only button existence; every physiological observation comes from the journal the batch pulls from the container (`devicectl device copy from … appDataContainer … tmp/`). The batch (`k00-driver-batch.sh`) forwards the env, pulls exactly one new journal per sample, hashes it and writes one ledger row via `k00-ledger.py`, which is a **closed four-class entry-axis classifier**: it reads no `stream_*` or `output_render_sample` record (its only non-entry field is `--w4` Enter→Leave). The gate (`__tests__/voice-kernel-00-source-gates.test.ts`) byte-pins the organism to `ac12dedf4` and names the instrument set as exactly `K00DriverTests.swift · k00-driver-batch.sh · k00-ledger.py · k00-reinstall.sh`.

### 1.3 Precisely where the entry-only instrument stops short

| K00-05 / K00-06 need | Present today | Gap |
|---|---|---|
| Schedule known PCM under a handle | kernel + harness button | driver never taps `Play 3 s tone` |
| Cancel against that exact handle at a controlled time | kernel + harness button (last rendering stream) | driver never taps `Cancel active`; no timing control |
| Wait for `listening` before Play | harness disables Play until listening | driver sleeps blind; would have to poll `isEnabled` |
| Let the P5 measurement land | kernel journals it 300 ms after cancel | export must be ≥ 300 ms after cancel; the driver's export timing is not tied to any act |
| Read output records into a row | journal carries them | classifier ignores them; no output-axis ledger exists |
| Read duplex windows | `input_health_sample` per second carries callbacks + energy classes | no reader aligns windows to the rendering interval |
| Population | batch loops N | batch has no output act; `--w4` is the only post-Enter act |

⭐ **Never exercised on a device, on any subject:** the repository holds **zero** journals carrying `stream_cancel_measured` or `stream_complete`. Runbook steps 3 / 3b / 4 were never reached by runs 2–6 (entry/exit only), and every automated stratum is entry-only. K00-05 and K00-06 are unmeasured on the engine subjects as well as on VPIO-02.

---

## 2. K00-05 — output / cancellation (own reading)

**Law:** *Known PCM renders through native output and is cancellable by handle. Every play yields a handle; a cancel stops rendering within the cancel window; `outputFlow` shows `rendering → idle`.* Threshold: ≤ 100 ms from `cancel(handle)` to last rendered non-silent frame, measured as `cancelToSilenceMs` in `stream_cancel_measured` (render-seam time; the cancel call's own duration is not the metric).

**2.1 How a known PCM stream is scheduled under an `OutputStreamID`.** The harness `Play 3 s tone` → `playTone(3.0, 440)` → `makeTone` → `OutputStreamID.make()` → `schedule`. Evidence of the handle: `stream_scheduled` carries the id (`to:`), `framesScheduled = 144 000` at 48 kHz (`seconds = 3.0`), and the floor transition `stream_rendering:<id>`. **A play without a handle is impossible by construction** (the id is minted before scheduling); the falsifier is `play_refused` or a `stream_scheduled` without an id.

**2.2 What proves frames really rendered.** Two independent seams: (i) `output_render_sample.framesRendered` for that stream strictly increasing across consecutive per-second samples while `outputFlow = rendering` (≈ 48 000 per second; the value comes from the render callback's own counter, not from a timer); (ii) for a stream left to complete, `stream_complete.framesRendered == framesScheduled` and the completion arrives ≈ 3.0 s after `stream_scheduled` (tolerance one render slice + one tick, ≤ 150 ms), with the floor returning to `listening`. **"Rendered" means the unit consumed the frames through its render callback** — the ratified seam. Acoustic emission is not observed by K00-05; the microphone-side coupling in K00-06 is descriptive corroboration only, never K00-05 evidence.

**2.3 How cancel is issued against that exact handle.** The harness `Cancel active` resolves `snap.streams.last(where: .rendering)` — with one stream at a time (K00 law) that is the scheduled id — and calls `kernel.cancel(id)`. Evidence: `command cancel {stream: <id>}` and `stream_cancelled (from: <id>)` must name the **same id** as `stream_scheduled`; `framesRendered` at cancel must satisfy `0 < framesRendered < framesScheduled` (proof the cancel landed *during* rendering). Falsifier: a different id, a `nil` return (id not active → no `stream_cancelled`), or `framesRendered == framesScheduled` (cancel after completion — not a cancel row).

**2.4 What measures cancel → last non-silent frame ≤ 100 ms.** `stream_cancel_measured` 300 ms after the cancel: `cancelToSilenceMs = max(0, lastNonSilentRenderedAtMs − cancelIssuedAtMs)`, `withinRatifiedWindow`. Cross-checks that make the number falsifiable rather than self-reported: after `stream_cancelled`, every later `output_render_sample` for that id must show `framesRendered` unchanged and `outputFlow ≠ rendering`; no `stream_complete` may follow a `stream_cancelled` for the same id; `snap.lastCancelToSilenceMs` appears on the harness row. Expected physics on this substrate: because `cancel` nils the active stream under the lock and the callback stamps `lastNonSilentAtMs` only when it filled a non-silent buffer, the value can exceed 0 only by one render slice already in flight (≈ 10 ms at the 10 ms preferred I/O buffer) — a reading above 100 ms is a FAIL of the organism, not of the metric. The clamp at 0 is recorded as a property of the measurement (a last non-silent frame *before* the cancel reads 0, not negative).

**2.5 Predeclared PASS / FAIL (per K00-05 row, before any witness):**
- **PASS-05 (cancel row)** iff all of: `stream_scheduled` with a handle and `framesScheduled = 144 000 ± 1 %` · ≥ 2 render samples with strictly increasing `framesRendered` before the cancel · `stream_cancelled` naming the same handle with `0 < framesRendered < framesScheduled` · `stream_cancel_measured` present with `withinRatifiedWindow = true` (`cancelToSilenceMs ≤ 100`) · no `framesRendered` advance and no `stream_complete` for that id after the cancel · floor `maiaSpeaking → listening` on the cancel · no `stream_failed`, no `outputStalled`, no recovery request in the invocation.
- **PASS-05 (completion row)** iff: handle · `framesRendered` increasing · `stream_complete.framesRendered == framesScheduled` within 3.0 s + 150 ms of `stream_scheduled` · floor returns to `listening` · no `stream_failed` / `outputStalled`.
- **FAIL-05** iff any clause above is false on a valid row. The 100 ms ceiling is a ceiling; it may not be loosened because a device misses it.
- **NOT-A-CANCEL-ROW** (instrument timing, not organism): the cancel tap landed after completion (`stream_complete` precedes `command cancel`, or `Cancel active` was disabled). Counted separately, never PASS, never FAIL, capped (§6).

---

## 3. K00-06 — duplex physiology (own reading)

**Law (as amended):** *During native output rendering, input callbacks continue without interruption, input does not collapse to digital zero, and input/output physical health remain independently observable. Echo coupling is measured and recorded for every tested route; the quantitative AEC gate belongs to KERNEL-01 / BENCH-01.* No duplex residual threshold exists (withdrawn as circular). The three-way classification `digital zero ≠ noise floor ≠ signal` is preserved as the vocabulary of every reading.

**3.1 How output is active while microphone callbacks continue.** One VPIO unit, one generation: the render callback fills output from the scheduled samples while the input callback keeps pulling element 1 every buffer; both run on the unit's I/O thread and both are journalled independently (`output_render_sample` vs `input_health_sample`, `outputFlow` vs `inputFlow`). No act is needed beyond Play; the duplex interval is `[stream_scheduled, stream_complete | stream_cancelled]`.

**3.2 What proves input remains physiologically alive during output.** Every `input_health_sample` window that overlaps the rendering interval must show: `callbacks` at the pre-output rate (baseline from the ≥ 2 windows before Play; ≈ 100 per 1 000 ms window at 480-frame buffers), `digitalZero = 0` if the baseline windows had 0, `inputFlow = healthy`, `ioRunning = true`, and no `input_flow` transition to `suspect`/`dead` and no `inputDead` verdict inside or immediately after the interval. `io_running_observed` ticks continue through the interval. Output health is read from the *other* record family in the same windows — the "independently observable" clause is discharged only if both families are present in every overlapping window.

**3.3 Duplex falsifier (predeclared):** any overlapping window with `callbacks < 0.9 × baseline` (a lost buffer run, not boundary jitter) · any overlapping window with `digitalZero > 0` where baseline windows had 0 · `inputFlow` leaving `healthy` during the interval · an `input_dead` or `entry_timeout` verdict inside or within 2 000 ms after the interval · either record family absent from an overlapping window · `ioRunning ≠ true` on any tick in the interval.

**3.4 Echo / coupling — descriptive only.** For each valid invocation record, per route (built-in speaker / built-in mic in this act): baseline `rmsMean · rmsMax · peakMax` from the pre-output windows, the same three from the overlapping windows, and their ratio/delta; plus the energy-class mix (`noiseFloor` vs `signal` counts) inside vs outside the interval. Record beside it that the observed input is post-AEC (VP inside the unit, `bypass 0`). **No threshold is coined; no PASS/FAIL attaches to coupling.** A window that reads `signal` during the tone is *coupling observed*, not a failure; a window that reads `digitalZero` is the K00-06 falsifier.

**3.5 Predeclared PASS / FAIL (per K00-06 row):** **PASS-06** iff no falsifier in 3.3 fires across every overlapping window of every stream in the invocation and the coupling record is complete. **FAIL-06** iff any falsifier fires. **UNMEASURED-06** if the invocation produced no rendering interval (play refused / entry not reached) — never PASS, never FAIL.

**3.6 Independence of the two readings.** K00-05 reads only `OutputController` records and the floor; K00-06 reads only input-family records aligned to the rendering interval. One invocation yields one row of each; a FAIL in one never decides the other; the two tables are reported separately and never summed.

---

## 4. Instrument options (smallest lawful choice)

| option | what changes | why the smaller option fails |
|---|---|---|
| **A. existing harness capability, manual** | nothing; the founder taps Play / Cancel / Export per runbook steps 3–4 | Sufficient for the *organism* side — every record in §2/§3 already exists — but the manual phone witness is **SUSPENDED by ruling** ("I'm not testing on my phone anymore"), cancel timing would be a human act, and repetitions/export alignment cannot be guaranteed. Lawful if the founder lifts the suspension for a bounded runbook act; not the automated path. |
| **B. harness-only affordance** (e.g. a "Play, cancel at 1 s" button or a repeat control) | `ios/VoiceKernelHarness/Harness/*.swift` | The harness is inside the byte-pinned organism tree (`ac12dedf4`) and inside the installed, F-W1-qualified artifact (`.vpio02`, container `E3B88028`). Any change = new organism SHA = new compile + new install = **a new subject** whose entry qualification would have to be re-earned before K00-05/06 could attach to it. Rejected: it changes the subject to make it testable. |
| **C. driver-only extension (RECOMMENDED)** | `K00DriverTests.swift` (+1 test), `k00-driver-batch.sh` (+2 flags → runner env), one **new** reader `scripts/witness/k00-output-ledger.py`; `k00-ledger.py` and `k00-reinstall.sh` untouched; gate pins updated in the same commit | Everything K00-05/06 needs is already journalled by the frozen organism; the only missing pieces are *taps at controlled times* and *a reader*. Neither touches the phone-side artifact. Option A fails on suspension/timing; B on custody. |
| **D. paired harness + driver** | B + C | Not needed: C observes every seam §2/§3 name. The one thing C cannot do — vary the 3 s tone length — is not required by either obligation. |

**C in detail (proposal, not authorized):** new `testOutputSample`: cold precondition → launch → VP toggle → tap `Enter conversation` → **wait until `Play 3 s tone` reports `isEnabled`** (≤ 5 s; else driver fail "listening not reached") → settle `K00_SETTLE_S` (2 s, so ≥ 2 baseline input windows exist) → tap `Play 3 s tone` → sleep `K00_CANCEL_AT_MS` (1 000) → tap `Cancel active` (if not enabled → the row is NOT-A-CANCEL-ROW) → sleep 1.0 s (covers the 300 ms P5 measurement) → tap `Play 3 s tone` again → sleep 4.5 s (3 s tone + completion + one post window) → tap `Export journal` → terminate. Runner env only (`TEST_RUNNER_K00_ACT=output`, `…_CANCEL_AT_MS`, `…_SETTLE_S`); **the app under test still receives no arguments, environment or hooks.** Batch: `--act output --cancel-at 1000` selects the test and forwards the env; ledger rows come from **both** readers on the same journal — the untouched entry classifier (the invocation must have entered lawfully) and the new output reader (one K00-05 cancel row, one K00-05 completion row, one K00-06 row, one coupling record). Gate: the VPIO-02B instrument list grows by the new reader; the organism pin is unchanged. Every change is one instrument SHA, driver-compiled (`build-for-testing`, generic iOS, signing off) and recorded before any device act.

---

## 5. Custody / sovereignty

- Organism stays `ac12dedf4b7b4efc9855c08bb4285a704e7039f1`; the installed `.vpio02` (container `E3B88028-…`, dylib `B346F448-…`) is the F-W1-qualified artifact and is **not reinstalled, rebuilt or replaced** for this act.
- VPIO-02 physical behaviour does not change to become testable: option C drives only the harness's existing visible buttons.
- No second audio authority: the XCUITest runner is a UI driver; it opens no audio session (`K00DriverTests` links no audio framework — pinned by the existing gate).
- No WebView, no STT/TTS provider, no network path.
- No hidden output: the only output is the harness tone through the kernel's `playTone`, journalled with its handle. No synthetic microphone success: an invocation with any `faults_set` true, or any `synthetic = true` sample, is **INVALID** for K00-05/06; the K00-07/08 fault toggles are not part of this act.
- Any new instrument surface gets its own SHA, its own driver-compile record and gate pins before a device act; the authority string for the witness is an invocation input, never reconstructed.

---

## 6. Experiment shape (proposal; N fixed here, before any outcome exists)

**Why not N=30.** F-W1's N=30 was sized for a *probabilistic* comparison of a gen-1 take rate against four historical strata. K00-05 and K00-06 have no historical stratum and no rate: each is a **ceiling on every row** (≤ 100 ms; no lost callbacks / no digital zero). A single FAIL row is decisive regardless of N; more rows only show that the ceiling holds repeatedly and expose the distribution of `cancelToSilenceMs`.

**Proposed population:** **N = 10 invocations**, each yielding 1 K00-05 cancel row + 1 K00-05 completion row + 1 K00-06 row (over both rendering intervals) + 1 coupling record → 10 cancel measurements, 10 completions, ≥ 40 rendering-overlapped input windows. Stratum `AUTOMATED-COLD-LAUNCH · VPIO-02 · OUTPUT`, own ledger directory, never merged with the F-W1 rows. Route: built-in speaker / built-in mic only (K00-11 is a separate obligation).

```text
valid invocation        cold precondition passed · lawful entry reached listening (any entry class) ·
                        VP ON · 14-step subject · faults all false · no synthetic sample ·
                        ≥ 1 stream_scheduled · exactly one journal pulled and hashed
entry not reached       entry degraded / never listening → play never possible → EN-ROW:
                        counted, not K00-05/06 evidence, not infra, not FAIL of 05/06
not-a-cancel-row        cancel tapped after completion or Cancel disabled → instrument timing, counted separately
infrastructure failure  driver fail · no journal · > 1 journal · precondition · xcodebuild refusal
PASS (K00-05)           every valid cancel row PASS-05 AND every valid completion row PASS-05 (10/10 each)
FAIL (K00-05)           any valid row FAIL-05
PASS (K00-06)           every valid invocation PASS-06 (10/10)
FAIL (K00-06)           any valid invocation FAIL-06
characterize only       > 2 infrastructure rows, or > 2 not-a-cancel rows, or > 2 EN-ROWs → no PASS/FAIL, return
abort                   instrument abort · batch identity read ≠ .vpio02 in container E3B88028 ·
                        harness process at preflight · any faults_set true → STOP, INCOMPLETE, no top-up
repetition count        10, fixed; no automatic rerun; an aborted batch is returned INCOMPLETE
```

**Predeclared readings:** K00-05 PASS + K00-06 PASS → both obligations discharged on the VPIO-02 subject for the built-in route (K00-11/12/13/15 untouched). Either FAIL → recorded FAIL on that obligation; the other obligation keeps its own verdict; no correction inside the act (any correction = new SHA = new subject/instrument = founder act). The coupling record is returned descriptively whatever the verdicts.

---

## 7. Returned for ruling

1. Whether a K00-05/06 witness act opens on the installed VPIO-02 at all.
2. Which instrument surface is allowed: A (manual, requires lifting the suspension) · **C (driver-only, recommended)** · D (not needed) · B (rejected as a subject change).
3. If C: whether the proposed test shape (settle 2 s · cancel at 1 000 ms · second play to completion · export ≥ 300 ms after the cancel), the two-reader ledger (entry classifier untouched + new output reader), and N = 10 are accepted as written or amended.
4. Whether the two predeclared PASS/FAIL tables (§2.5, §3.5) and the falsifiers (§2.3–2.4, §3.3) are pinned as the law of the act.

**Standing (unchanged by this plan):** VPIO-02 F-W1 CLOSED · PASS · K00-04 PASS · K00-05 / 06 / 11 / 12 / 13 / 15 UNMEASURED · new sample / route / interruption / reset / endurance / reinstall NOT AUTHORIZED · `.vpio01` FROZEN · K00/R1 UNTOUCHED · KERNEL-00 NOT ACCEPTED.

---

## 8. FOUNDER RULING (2026-09-14) — plan ACCEPTED WITH AMENDMENTS · OPTION C · INSTRUMENT PREPARATION OPEN · device witness NOT YET AUTHORIZED

Recorded prospectively before any implementation. Where the amendments below differ from §§2–6, **the amendments govern**.

**1. Option C governs.** Driver-only extension accepted; A remains suspended; B rejected (changing the harness changes the already-qualified organism); D unnecessary. Authorized surface, exactly: `ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift` · `scripts/witness/k00-driver-batch.sh` · `scripts/witness/k00-output-ledger.py` (NEW) · `__tests__/voice-kernel-00-source-gates.test.ts` · plan/ruling record · CLAUDE.md standing. `k00-ledger.py`, `k00-reinstall.sh`, `ios/VoiceKernel`, `ios/VoiceKernelHarness` byte-frozen. The app under test receives no arguments, environment, hooks or hidden state.

**2. Physical sequence accepted, values explicit:** lawful entry → wait `Play` enabled ≤ 5 s → settle 2 s → Play 3 s tone → cancel at 1 000 ms → wait 1 s (P5 due at 300 ms) → second Play to completion → wait 4.5 s → Export → terminate. Batch syntax carries `--act output --cancel-at 1000 --settle 2`. **Invocations without `--act output` retain their historical behaviour exactly.**

**3. K00-05 corrections to §2.5.** (i) The cancel row may NOT require two pre-cancel `output_render_sample` records (≈1/s sampling would make the test phase-dependent). Direct render-seam proof: `stream_scheduled(handle)` · `stream_cancelled(same handle)` · `0 < framesRendered < framesScheduled` · `stream_cancel_measured` (same act) · `cancelToSilenceMs ≤ 100` · no later completion for the cancelled handle · `outputFlow → idle`. Pre-cancel render samples are corroborating when present. (ii) `3.0 s + 150 ms` is removed as a completion ceiling — the only ratified K00-05 number is cancel-to-last-frame ≤ 100 ms; completion latency is descriptive; completion PASS = actual render progress + `stream_complete.framesRendered == framesScheduled` + return to idle/listening. (iii) The blanket "no recovery request anywhere in the invocation" is removed from PASS-05: `outputStalled`, `stream_failed`, broken handle identity, failed render progress or failed cancel semantics fail K00-05; a foreign (input-side) fault/recovery makes the affected K00-05 row **non-evidence** unless its own output evidence independently establishes FAIL.

**4. K00-06 correction.** `digitalZero > 0` is not itself FAIL (the frozen supervisor distinguishes an isolated zero buffer from sustained dead input; flow transitions are journalled separately from the 1 s aggregates). Use **full** rendering-overlap input windows. Pinned: `baselineRate = median(callbacks·1000/windowMs)` over ≥ 2 healthy pre-output windows · **callback-gap FAIL** = any full rendering window < 0.90 × baselineRate · **digital-zero collapse FAIL** = `callbacks > 0 ∧ digitalZero == callbacks` in a full rendering window, OR an `input_dead` verdict during / immediately after rendering · **clean PASS** = rate ≥ 0.90 × baseline ∧ `digitalZero == 0` ∧ `ioRunning == true` ∧ both input- and output-health families present · **partial digital zero** (`0 < digitalZero < callbacks`) → CHARACTERIZE / INCOMPLETE for K00-06, neither FAIL nor PASS. The 0.90 line is a witness criterion for callback continuity in this act, not a constitutional audio threshold. ≥ 2 full rendering-overlap windows required per invocation, else K00-06 UNMEASURED for it. Coupling stays descriptive; no suppression threshold.

**5. Population law (N = 10 accepted).** Exactly ten invocations; no top-up, no automatic rerun; a valid FAIL decides that obligation but does not stop the remaining declared rows unless the instrument aborts. `K00-05 PASS = 10 valid cancel rows PASS ∧ 10 valid completion rows PASS` · `K00-06 built-in PASS = 10 valid duplex rows PASS` · any valid FAIL-05 → K00-05 FAIL · any valid FAIL-06 → K00-06 FAIL · EN / infrastructure / not-a-cancel = no evidence for the affected obligation = overall INCOMPLETE if it prevents 10 valid rows, never dropped or topped up. Independence is real: a NOT-A-CANCEL row can leave K00-05 incomplete while its rendering interval still yields valid K00-06 evidence; a K00-06 failure never converts a sound cancel measurement into FAIL-05.

**6. Scope of a green result.** This act can establish `K00-06 · builtInSpeaker/builtInMic PASS/FAIL` only. Final K00-06 closure requires duplex physiology/coupling to travel with the K00-11 route witnesses (receiver / Bluetooth). Green N = 10 = built-in duplex qualified, not K00-06 permanently discharged.

**7. Reader is evidence-only.** It parses the completed journal and emits separate K00-05, K00-06 and coupling records; it may not steer the next invocation, change entry classification, terminate early on an outcome, modify the journal, or reinterpret historical F-W1 rows. Offline cases pinned: cancel with `framesRendered > 0` and no pre-cancel sample → admissible · cancel > 100 ms → FAIL-05 · handle mismatch → FAIL-05 · completion frame mismatch → FAIL-05 · completion latency > 3.15 s alone → descriptive, NOT FAIL · one transient digital-zero callback → NOT "collapse" · partial-zero full window → CHARACTERIZE · all-zero full window → FAIL-06 · callback rate < 90 % baseline → FAIL-06 · missing coupling record → FAIL-06 · synthetic/faulted row → INVALID · entry not reached → EN-ROW. Entry classifier untouched.

**8. Execution sequence authorized:** record this ruling → implement only the bounded surface → offline reader self-tests → source gate read → commit the exact new instrument SHA → driver-only `xcodegen` + generic-iOS `build-for-testing`, signing OFF → record compile custody → **STOP**. No phone test, `.vpio02` launch, Play, Cancel, journal pull or physiological sample is authorized by this ruling.

**Standing:** organism `ac12dedf4` FROZEN · installed `.vpio02` F-W1-qualified, DO NOT REPLACE · K00-04 PASS · K00-05 UNMEASURED · K00-06 built-in UNMEASURED · K00-06 final route closure OPEN LATER with K00-11 · **K00-05/06 instrument prep OPEN · Option C** · driver-only compile AUTHORIZED after the exact instrument SHA · K00-05/06 device witness NOT YET AUTHORIZED · route/interruption/reset/endurance NOT AUTHORIZED · KERNEL-00 NOT ACCEPTED.

## 9. OPTION C INSTRUMENT LANDED at `8b111709b6e5010b4b6ee7281d257141945276ff` — IMPLEMENTED, SELF-TESTED, GATED · NOT COMPILED · driver-only compile is the next founder act

**Surface (exactly the ruled set):** `ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift` · `scripts/witness/k00-driver-batch.sh` · `scripts/witness/k00-output-ledger.py` (NEW) · `__tests__/voice-kernel-00-source-gates.test.ts`. Verified before commit: `ios/VoiceKernel` + `ios/VoiceKernelHarness` byte-identical to `ac12dedf4`; `k00-ledger.py` + `k00-reinstall.sh` byte-identical to `08483cfe4` (both now gate-pinned).

**Driver.** `testOutputSample` = cold precondition → launch by bundle id → VP by its visible toggle → tap `Enter conversation` → wait until the harness itself enables `Play 3 s tone` (≤ 5 s; else marker `K00-OUTPUT: entry not reached … (ENTRY-NOT-REACHED)` and the journal is still exported) → settle `K00_SETTLE_S` (default 2) → tap Play → sleep `K00_CANCEL_AT_MS` (default 1000) → tap `Cancel active` only if the harness shows it enabled (else marker `NOT-A-CANCEL-ROW`) → 1.0 s → tap Play again if enabled within 3 s → 4.5 s → Export → terminate. Markers go to the runner log by `NSLog`, never `XCTFail`; the only `driverFail` in the act is the missing-button precondition. The three historical tests are byte-identical (gate-pinned by body extraction). No launch arguments/environment/hooks; no audio framework in the driver.

**Batch.** `--act entry|output` (default `entry`) · `--cancel-at MS` (1000) · `--settle S` (2); unknown act refused; `--act output` with `--w4` refused. Under `output`: `TEST=testOutputSample`, exactly two runner-env values forwarded (`TEST_RUNNER_K00_CANCEL_AT_MS`, `TEST_RUNNER_K00_SETTLE_S`) via one `env $OUTPUT_ENV …` prefix that is empty under `entry`, one extra header line (`act=output · cancelAt · settle · driver · reader`), and every ledgered journal is read a second time into `output-ledger.md` (header once, then four rows per journal + the driver markers as `DRIVER-MARKER` rows). The historical header line, the entry-ledger call and every `devicectl`/`xcodebuild` line are verbatim (gate-pinned against `08483cfe4`).

**Reader (`k00-output-ledger.py`, evidence-only).** Per journal: `K00-05-CANCEL` · `K00-05-COMPLETE` · `K00-06` · `COUPLING`. Constants `CANCEL_WINDOW_MS = 100` (ratified) and `GAP_FRACTION = 0.90` (witness criterion). Cancel row: handle identity (scheduled ↔ command ↔ cancelled), `0 < framesRendered < framesScheduled`, `stream_cancel_measured` chained by `causeSeq`, `cancelToSilenceMs ≤ 100` ∧ `withinRatifiedWindow`, no later completion / no frame advance / no rendering after the cancel, no `stream_failed`/`outputStalled`, floor back to listening; pre-cancel render samples counted as corroboration only; foreign `input_dead`/`entry_timeout` inside the stream → `NON-EVIDENCE` unless output evidence independently fails. Completion row: `framesRendered == framesScheduled`, monotonic render progress (none observed → `INCOMPLETE-05`), floor back, latency descriptive. K00-06: full rendering-overlap windows only; `baselineRate = median(callbacks·1000/windowMs)` over ≥ 2 healthy pre-output windows; gap FAIL < 0.90×; collapse FAIL = `callbacks > 0 ∧ digitalZero == callbacks` or an `input_dead` verdict during / ≤ 2 000 ms after rendering; partial zero → `CHARACTERIZE-06`; `ioRunning` must read true; an `output_render_sample` must sit within 250 ms of every full window (both families); coupling fields (`rmsMean/rmsMax/peakMax`) required else FAIL-06; < 2 baseline or < 2 full windows → `UNMEASURED-06`. Coupling row: medians baseline → rendering with ratios, class mix, route, `voiceProcessing` (post-AEC note) — DESCRIPTIVE only. `--selftest` **33/33**: nominal · the founder's twelve cases · F-W1 shape → `NO-OUTPUT`/`UNMEASURED-06` · cancel-after-completion → `NOT-A-CANCEL-ROW` with K00-06 still measurable · foreign fault → `NON-EVIDENCE` · no second Play → `NO-COMPLETION-ROW`. Regression over all 60 real VPIO journals: `NO-OUTPUT` ×60 · `UNMEASURED-06` ×60 · `EN-ROW` ×120, **no PASS, no FAIL** (gate-pinned). No subprocess, no device verb, no journal write, no import of the entry classifier.

**One defect of this session, offline:** the first self-test read a synthetic handle mismatch as "no cancel" (the cancelled stream had been removed from the scheduled set) — the reader now treats any `stream_cancelled` naming an unscheduled or differently-named handle as `FAIL-05 handle mismatch`, never as absence. Corrected before the gate was read; 33/33 thereafter.

**Gate:** 60 → **64/64** read before commit (instrument roots may add exactly the reader; classifier + reinstall pinned to `08483cfe4`; driver sequence order, batch flags/guards/verbatim lines, reader constants/vocabulary/self-test/regression pinned).

**Pinned driver-only compile (founder act on the Mac, on exactly `8b111709b6e5010b4b6ee7281d257141945276ff`; generic iOS, signing OFF; no device targeted; nothing installed, launched, played, cancelled, pulled or sampled):**

```bash
git -C /path/to/fresh/worktree rev-parse HEAD     # must print 8b111709b6e5010b4b6ee7281d257141945276ff
cd ios/VoiceKernelDriver && xcodegen generate \
&& xcodebuild build-for-testing -project VoiceKernelDriver.xcodeproj -scheme DriverUITests \
     -destination 'generic/platform=iOS' -derivedDataPath /private/tmp/k0506-driver-compile-8b111709b-derived \
     CODE_SIGNING_ALLOWED=NO
python3 ../../scripts/witness/k00-output-ledger.py --selftest | tail -1      # expect: selftest: 33/33 expectations met
```

Owed back: the xcodegen + build log (`** TEST BUILD SUCCEEDED **` once), product hashes (xctestrun · DriverUITests · XCTRunner · DriverHost — instrument evidence, never organism identity), the self-test line, and a statement that no `devicectl`/`test-without-building`/install/launch verb ran — on a `feature/*` branch, cherry-picked here. **Then STOP.** The K00-05/06 device witness remains NOT AUTHORIZED.

### 9.1 First compile attempt VOID as evidence for `8b111709b` — two instruction defects of this session (2026-09-14, founder transcript)

**What happened.** The founder ran the §9 invocation from `/tmp/vpio02b-driver-compile-08483cfe4/ios/VoiceKernelDriver` — the existing VPIO-02B worktree — and `xcodebuild build-for-testing` reported `** TEST BUILD SUCCEEDED **`; the trailing self-test line then failed: `can't open file '…/scripts/witness/k00-output-ledger.py': No such file or directory`, and `tail: #: No such file or directory …` for every word of the `# expect: …` comment.

**Reading.** The reader is new in `8b111709b`, so its absence proves the worktree was NOT at `8b111709b`: the sources compiled were the historical driver, not the Option C instrument. The green build is therefore **not a compile record for `8b111709b`** and is VOID as evidence; nothing was harmed (generic iOS, signing off, no device verb, nothing installed or launched). The self-test never ran there.

**Defects (this session, instruction side):** (a) §9 wrote `git -C /path/to/fresh/worktree rev-parse HEAD` as a placeholder and never created the worktree — an invocation that cannot be pasted is an invitation to run in whatever worktree is open; (b) `# expect: …` comments on executable lines — zsh with `interactivecomments` off passes them as arguments (the MAC-COMPILE-03 defect, repeated). Neither touches the instrument or the organism.

**Corrected invocation (paste as a block; no comments; creates a fresh detached worktree at exactly the instrument SHA; fresh derived path so no product of the void run is reused):**

```bash
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach /private/tmp/k0506-driver-compile-8b111709b 8b111709b6e5010b4b6ee7281d257141945276ff
cd /private/tmp/k0506-driver-compile-8b111709b
git rev-parse HEAD
test -f scripts/witness/k00-output-ledger.py && echo reader-present
python3 scripts/witness/k00-output-ledger.py --selftest | tail -1
cd ios/VoiceKernelDriver
xcodegen generate
xcodebuild build-for-testing -project VoiceKernelDriver.xcodeproj -scheme DriverUITests -destination 'generic/platform=iOS' -derivedDataPath /private/tmp/k0506-driver-compile-8b111709b-derived-run2 CODE_SIGNING_ALLOWED=NO 2>&1 | tee /private/tmp/k0506-build-for-testing-8b111709b.log | tail -3
```

Expected readings, in order: `8b111709b6e5010b4b6ee7281d257141945276ff` · `reader-present` · `selftest: 33/33 expectations met` · `** TEST BUILD SUCCEEDED **`. Any other reading → STOP, return the transcript. Product hashes afterwards (`shasum -a 256` of the `.xctestrun`, `DriverUITests.xctest/DriverUITests`, `DriverUITests-Runner.app/DriverUITests-Runner`, `DriverHost.app/DriverHost` under the run2 derived path) are instrument evidence, never organism identity. Still NOT authorized: `test-without-building`, `devicectl`, install, launch, Play, Cancel, journal pull, sample.

### 9.2 DRIVER-ONLY COMPILE GREEN on exactly `8b111709b` (founder transcript, 2026-09-14) — custody artefacts OWED · STOP

**Transcript readings (founder, verbatim order):** `git fetch` brought `d36866f46..2aad16d64`; `worktree add --detach /private/tmp/k0506-driver-compile-8b111709b 8b111709b…` → `HEAD is now at 8b111709b …` · `git rev-parse HEAD` → `8b111709b6e5010b4b6ee7281d257141945276ff` ✓ · `reader-present` ✓ · `selftest: 33/33 expectations met` ✓ · `xcodegen generate` → `Created project at /tmp/k0506-driver-compile-8b111709b/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj` ✓ · `xcodebuild build-for-testing … generic/platform=iOS … CODE_SIGNING_ALLOWED=NO` → `** TEST BUILD SUCCEEDED **` ✓ (once; log teed to `/private/tmp/k0506-build-for-testing-8b111709b.log`). No `test-without-building`, `devicectl`, install, launch, Play, Cancel, journal pull or sample appears in the transcript. The §9.1 void run is superseded as a compile record by this one; its record stays.

**Established:** the K00-05/06 Option C instrument at `8b111709b` compiles for iOS as a driver bundle. Instrument evidence only — not organism identity, not physiology, not authorization.

**Owed for custody (founder, Mac; paste as a block, no comments):**

```bash
cd /private/tmp/k0506-driver-compile-8b111709b-derived-run2/Build/Products
grep -c 'TEST BUILD SUCCEEDED' /private/tmp/k0506-build-for-testing-8b111709b.log
grep -cE 'devicectl|test-without-building|install app' /private/tmp/k0506-build-for-testing-8b111709b.log
shasum -a 256 *.xctestrun Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests Debug-iphoneos/DriverUITests-Runner.app/DriverUITests-Runner Debug-iphoneos/DriverHost.app/DriverHost /private/tmp/k0506-build-for-testing-8b111709b.log
```

Expected: `1` · `0` · five hashes. Record `KERNEL-00_VPIO-02_K00-05-06_DRIVER-COMPILE-01_2026-09-14.md` (transcript + log + hashes) on a `feature/*` branch → cherry-picked here. Only `DriverUITests` is expected to differ from the VPIO-02B products (`6d669e39…`); the xctestrun, XCTRunner and DriverHost hashes may match `7105c95e…` / `6fa0f967…` / `57793876…` — a match is consistency evidence, never identity.

**Standing after §9.2:** instrument `8b111709b` COMPILED (driver-only) · custody record OWED · organism `ac12dedf4` FROZEN · installed `.vpio02` UNTOUCHED · **K00-05/06 device witness NOT AUTHORIZED** (a separate founder ruling would name: the installed artifact, the exact batch invocation `k00-driver-batch.sh K00-0506 10 --act output --cancel-at 1000 --settle 2 --vp on --mode L --subject vpio-02`, the read-only preflight, N = 10, the authority string) · route/interruption/reset/endurance NOT AUTHORIZED · KERNEL-00 NOT ACCEPTED. **STOP.**
