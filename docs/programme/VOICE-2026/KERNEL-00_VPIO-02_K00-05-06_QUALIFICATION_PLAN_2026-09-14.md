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

### 9.3 DRIVER-COMPILE-01 (K00-05/06 instrument) CUSTODY PINNED from the founder transcript (2026-09-14) — CLOSED · STOP

Readings (founder, Mac, `…-derived-run2/Build/Products`): `TEST BUILD SUCCEEDED` count **1** · `devicectl|test-without-building|install app` count **0** · hashes:

| product | SHA-256 | vs VPIO-02B (`08483cfe4`) |
|---|---|---|
| `DriverUITests_iphoneos26.2-arm64.xctestrun` | `7105c95ed047091bfc823c5d704f5dd8cc98257c9fde43927c69d83789657739` | identical (`7105c95e…`) |
| `DriverUITests.xctest/DriverUITests` | `ab573914a8bfa5c0d29e8965c68138df10aa0407ac7e6c838af4ca954566d90e` | **moved** (was `6d669e39…`) — the one bundle carrying `testOutputSample` |
| `DriverUITests-Runner.app/DriverUITests-Runner` | `6fa0f96700913280d0bb3ddd3b400d69bc2ea66592d97c4760a753d2dd701f41` | identical (`6fa0f967…`) |
| `DriverHost.app/DriverHost` | `5779387686f49134baeee76cfc77f9d2bebd53e56cb59279b163b8dc640d479b` | identical (`57793876…`) |
| `k0506-build-for-testing-8b111709b.log` | `680fe1e9248803df065c96e03bf0580fd32c5d46fb266b0afffa225da2fe579f` | — |

Exactly the predicted shape: the instrument delta reaches one product. Matches are consistency evidence, never identity. The log file itself (hash pinned above) is still owed to the repository on a `feature/*` branch when convenient; its absence blocks nothing, because the transcript readings are recorded here and the log's hash is fixed.

**DRIVER-COMPILE-01 (K00-05/06) CLOSED.** The ruling's sequence (record → implement → self-test → gate → instrument SHA → driver-only compile → compile custody → STOP) is complete. **STOP.** Nothing downstream is opened: K00-05/06 device witness NOT AUTHORIZED · `.vpio02` untouched · organism frozen · KERNEL-00 NOT ACCEPTED.

---

## 10. FOUNDER RULING (2026-09-14) — VPIO-02 K00-05/06 DEVICE WITNESS OPEN AFTER THIS RECORD PIN · preflight PINNED · invocation PINNED · authority RECORDED · EXECUTION IS A MAC ACT

**Ruling (verbatim substance):** "I accept `8b111709b6e5010b4b6ee7281d257141945276ff` as the exact witness instrument. The compile custody has the expected shape … The next act may now open, but only after this ruling, preflight, exact invocation, and authority string are recorded/pushed before touching the device." — "This is now the right next test: can the same VPIO-02 organism that reliably listens also render, cancel cleanly, and keep its microphone physiology alive while speaking?"

**Authorized subject (verbatim):**

```text
organism source     ac12dedf4b7b4efc9855c08bb4285a704e7039f1
installed subject   life.soullab.voicekernel.vpio02 · container E3B88028-A10F-46B1-AB27-CF0A1F83FB78
artifact identity   dylib UUID B346F448-A2A8-30DB-9683-B732A80D7899 · dylib SHA e963a23cd17fd12e273671023b01c74ea5fbc4e8a7fb22168a0cee2562bd66ec
                    exec SHA 9fe56504131e0b023162c62a6bd60541053b14262c9d3075a15a08dbe6c7805a · manifest 1459283c175e243c90459b2724c2be7362cf6dd4c95c191bd15c443ec8b98410
witness instrument  8b111709b6e5010b4b6ee7281d257141945276ff
```

No rebuild, replacement or reinstall of `.vpio02` is authorized.

**Governed population (verbatim):** stratum `K00-0506` · act output · cancel-at 1000 ms · settle 2 s · VP ON · mode L · subject vpio-02 · N = 10. No pilot, no top-up, no automatic rerun. The Option C sequence is the already-compiled visible-button act; the organism remains untouched.

**Preflight — one read-only act immediately before the batch, from the exact instrument worktree (verbatim):**

```bash
cd /private/tmp/k0506-driver-compile-8b111709b \
&& git rev-parse HEAD \
&& git diff --quiet 8b111709b6e5010b4b6ee7281d257141945276ff -- \
     ios/VoiceKernelDriver \
     scripts/witness/k00-driver-batch.sh \
     scripts/witness/k00-output-ledger.py \
     scripts/witness/k00-ledger.py \
     scripts/witness/k00-reinstall.sh \
&& echo "instrument identical to 8b111709b" \
&& DEV=A0736AC8-793B-516F-AC72-C076DB6CEE38 \
&& PF="docs/programme/VOICE-2026/driver-ledger/K00-0506-preflight-$(date -u +%Y%m%dT%H%M%SZ)" \
&& mkdir -p "$PF" \
&& xcrun devicectl device info apps \
     --device "$DEV" \
     --bundle-id life.soullab.voicekernel.vpio02 \
     --json-output "$PF/apps.json" \
&& echo "container E3B88028 lines: $(grep -c E3B88028-A10F-46B1-AB27-CF0A1F83FB78 "$PF/apps.json")" \
&& xcrun devicectl device info processes \
     --device "$DEV" \
     --json-output "$PF/processes.json" >/dev/null \
&& echo "harness processes: $(grep -ci VoiceKernelHarness "$PF/processes.json")"
```

Proceed only on: HEAD exactly `8b111709b6e5010b4b6ee7281d257141945276ff` · `instrument identical to 8b111709b` · container lines ≥ 1 · harness processes 0. Anything else → STOP before the batch; no terminate-only normalization, reinstall, overwrite or corrective device read. (The batch's own sample-1 precondition would terminate-only, which is why the preflight is a separate act — §13.8/§13.18 shape.)

**Exact batch invocation (same shell, immediately after a clean preflight; the string below is the founder's, 2 086 bytes, no apostrophe, single-quoted whole; the instrument's `K00_DEVICE` / `K00_XCODE_DEST` variables carry exactly their defaults; the batch does not consume `K00_EXEC_AUTHORITY` mechanically — this section is its record):**

```bash
K00_DEVICE=A0736AC8-793B-516F-AC72-C076DB6CEE38 \
K00_XCODE_DEST=00008140-00163D9922E0801C \
K00_EXEC_AUTHORITY='FOUNDER-AUTH: VPIO-02 K00-05/06 only; execute exactly one N=10 K00-0506 automated output-and-duplex witness batch on the existing VPIO-02 artifact installed by FIRST-INSTALL-02, using the Option C witness instrument at 8b111709b6e5010b4b6ee7281d257141945276ff, subject vpio-02, bundle life.soullab.voicekernel.vpio02, Mode L, voice processing ON, act output, settle 2 seconds, cancel the first 3-second known-PCM tone at 1000 ms, then exercise the second 3-second tone to completion. Before sample 1 perform only the ruled read-only custody preflight: verify the instrument worktree is exactly 8b111709b6e5010b4b6ee7281d257141945276ff and unmodified on the witness surface, verify life.soullab.voicekernel.vpio02 still resolves to the FIRST-INSTALL-02 container E3B88028-A10F-46B1-AB27-CF0A1F83FB78, and verify no VoiceKernelHarness process is running. If instrument custody is different, installed-app custody is unreadable or different, or a harness process is already running, STOP before sampling and return the preflight evidence; do not normalize the state with terminate-only, reinstall, overwrite, or another corrective device act. If preflight is clean, execute the declared 10 invocations and finish all ten unless the instrument itself aborts. A valid K00-05 or K00-06 failure does not stop selection of the remaining declared rows. No top-up, no automatic rerun, no source change, no reinstall, no threshold change, no fault injection, no manual intervention, no route-change act, no interruption act, no media-services-reset act, no endurance act, no unified-log experiment, no mutation of the frozen .vpio01 artifact, and no historical K00/R1 mutation. K00-05 and K00-06 remain separate readings: output/cancellation evidence may not mechanically decide duplex physiology, and duplex physiology may not mechanically decide output/cancellation. Echo coupling is descriptive only and creates no acoustic threshold. Return the complete preflight and K00-0506 evidence for independent reading and founder adjudication. No outcome from this batch authorizes any subsequent act.' \
scripts/witness/k00-driver-batch.sh K00-0506 10 \
  --act output \
  --cancel-at 1000 \
  --settle 2 \
  --vp on \
  --mode L \
  --subject vpio-02
```

**Execution authority — verbatim (an invocation input, never reconstructed from this record):**

```text
FOUNDER-AUTH: VPIO-02 K00-05/06 only; execute exactly one N=10 K00-0506 automated output-and-duplex witness batch on the existing VPIO-02 artifact installed by FIRST-INSTALL-02, using the Option C witness instrument at 8b111709b6e5010b4b6ee7281d257141945276ff, subject vpio-02, bundle life.soullab.voicekernel.vpio02, Mode L, voice processing ON, act output, settle 2 seconds, cancel the first 3-second known-PCM tone at 1000 ms, then exercise the second 3-second tone to completion. Before sample 1 perform only the ruled read-only custody preflight: verify the instrument worktree is exactly 8b111709b6e5010b4b6ee7281d257141945276ff and unmodified on the witness surface, verify life.soullab.voicekernel.vpio02 still resolves to the FIRST-INSTALL-02 container E3B88028-A10F-46B1-AB27-CF0A1F83FB78, and verify no VoiceKernelHarness process is running. If instrument custody is different, installed-app custody is unreadable or different, or a harness process is already running, STOP before sampling and return the preflight evidence; do not normalize the state with terminate-only, reinstall, overwrite, or another corrective device act. If preflight is clean, execute the declared 10 invocations and finish all ten unless the instrument itself aborts. A valid K00-05 or K00-06 failure does not stop selection of the remaining declared rows. No top-up, no automatic rerun, no source change, no reinstall, no threshold change, no fault injection, no manual intervention, no route-change act, no interruption act, no media-services-reset act, no endurance act, no unified-log experiment, no mutation of the frozen .vpio01 artifact, and no historical K00/R1 mutation. K00-05 and K00-06 remain separate readings: output/cancellation evidence may not mechanically decide duplex physiology, and duplex physiology may not mechanically decide output/cancellation. Echo coupling is descriptive only and creates no acoustic threshold. Return the complete preflight and K00-0506 evidence for independent reading and founder adjudication. No outcome from this batch authorizes any subsequent act.
```

**Instrument behaviour named (read from `8b111709b`, not changed):** the batch regenerates the driver project and runs its own `build-for-testing` against the Xcode destination (`DEVELOPMENT_TEAM` signing) before sample 1 — the runner that drives the phone is built by the batch from the pinned worktree; the app under test is never rebuilt. Per sample: cold precondition → one `testOutputSample` invocation with `TEST_RUNNER_K00_CANCEL_AT_MS=1000 TEST_RUNNER_K00_SETTLE_S=2` → pull the one new journal → entry row (`k00-ledger.py`, untouched) → four output rows + driver markers into `output-ledger.md` (`k00-output-ledger.py`, evidence-only).

**Frozen reading law (verbatim):** K00-05 PASS overall = 10/10 valid cancel rows PASS-05 AND 10/10 valid completion rows PASS-05; any valid FAIL-05 → K00-05 FAIL; the constitutional ceiling stays cancel → last non-silent frame ≤ 100 ms; completion timing descriptive. K00-06 built-in route PASS = 10/10 valid duplex rows PASS-06; any valid FAIL-06 → FAIL; full rendering-overlap windows and the ruled continuity reading; sustained all-zero window or `input_dead` = collapse; partial-zero = characterize/incomplete, never silently PASS or FAIL. EN / infrastructure / NOT-A-CANCEL / other non-evidence preventing ten valid rows → the affected obligation INCOMPLETE; no replacement sample. Scope of green: `K00-05 PASS on VPIO-02` · `K00-06 builtInSpeaker/builtInMic PASS`; route-wide K00-06 closure travels with K00-11.

**Sequence (verbatim):** 1 record this ruling + exact preflight + invocation (this section) → 2 gate/read → 3 commit + push record-only → 4 the one read-only preflight (Mac) → 5 if clean, exactly one N = 10 batch (Mac) → 6 return preflight + complete batch evidence → 7 STOP for independent reading/adjudication.

**Owed from the Mac:** `driver-ledger/K00-0506-preflight-<stamp>/` (apps.json · processes.json) + `driver-ledger/K00-0506-<stamp>/` complete (ledger.md · output-ledger.md · batch.log · build-for-testing.log · 10 sample logs · journals/ · daemons/ · sample-timing.tsv) on a `feature/*` branch → cherry-picked `-x` here → every journal hash / cold / 14-step / VP-ON verified and both readers re-run here → K00-05 and K00-06 read separately against the frozen law → returned for adjudication. No outcome authorizes a subsequent act.

**Standing after this pin:** K00-05/06 device witness OPEN after record pin · new instrument changes NOT AUTHORIZED · reinstall NOT AUTHORIZED · route/interruption/reset NOT AUTHORIZED · endurance NOT AUTHORIZED · KERNEL-00 NOT ACCEPTED.

### 10.1 First batch attempt reached nothing (founder transcript, 2026-09-14) — instruction defect of this session · authority UNSPENT · preflight NOT YET RUN

The founder pasted the chat rendering of the invocation — whose `K00_EXEC_AUTHORITY` was abbreviated to `'FOUNDER-AUTH: VPIO-02 K00-05/06 only; …'` — from `…-derived-run2/Build/Products` (the compile's product directory). zsh refused at `no such file or directory: scripts/witness/k00-driver-batch.sh`: no process started, nothing reached the device, no journal, no sample. **The one K00-0506 authority is UNSPENT** (an invocation that never executed cannot spend it), and the preflight (§10) has not been performed.

**Defect (this session, the §13.6.1 shape repeated):** the chat message showed an abbreviated authority string with a pointer to the record instead of the full block. Rule reaffirmed and made operative: **a chat rendering of a pinned invocation carries the full authority string or no invocation at all**; an abbreviated string is never valid, and had the path resolved, the abbreviated invocation would itself have been a defective act to record. No instrument, record or organism change; §10 stands as pinned; the correct order remains preflight (which `cd`s into the instrument worktree) → batch in the same shell.

### 10.2 Preflight CLEAN · batch invocation (full authority) REFUSED by the instrument's own device lock — a batch instance is presumed ALIVE or died un-cleaned in the worktree · read-only diagnostic pinned · NO second batch

**Founder transcript (2026-09-14 ~19:50 local):** preflight from `/private/tmp/k0506-driver-compile-8b111709b` → HEAD `8b111709b6e5010b4b6ee7281d257141945276ff` · `instrument identical to 8b111709b` · apps listing `VoiceKernel VPIO-02 · life.soullab.voicekernel.vpio02 · 0.0.1 · 1` · `container E3B88028 lines: 1` · `harness processes: 0` → **CLEAN** (the preflight output appears twice in the paste with identical `19:50:01` timestamps; one act displayed twice, or two identical read-only acts — either is lawful; the preflight directory stamp(s) will say). Then the batch, with the **full** 2 086-byte authority string, from the worktree → `DRIVER/INFRASTRUCTURE FAILURE: another batch already holds device A0736AC8-… (…/driver-ledger/.device-A0736AC8-….lock.d exists); refusing to run two batches against one device` (exit 5, before `xcodegen`, before sample 1, no device verb).

**Reading.** The lock directory is runtime state (gitignored since C-D3; `git ls-files` shows nothing under `.device-*`), so a fresh worktree cannot carry it: **a batch process created it in this worktree.** Two possibilities, not decidable from here: (a) an earlier submission of the full block was accepted by the terminal (the paste shows `>....` continuation prompts) and **that instance is the one authorized batch, running now** — its `log()` lines go to `batch.log` and to its own stdout; (b) an instance started and died without its `EXIT` trap (hard kill / closed tab), leaving a stale directory. The guard that refused is CAL-F3's protection and behaved correctly. ⛔ **Do not `rmdir` the lock directory and do not start another batch until (a)/(b) is read** — removing a live lock re-opens the two-batches-one-phone condition; if an instance is alive, it is *the* batch and must be left to finish all ten.

**Read-only diagnostic (founder, Mac; paste as a block; no comments; reads only):**

```bash
cd /private/tmp/k0506-driver-compile-8b111709b
pgrep -fl 'k00-driver-batch.sh K00-0506' || echo no-batch-process
pgrep -fl 'xcodebuild.*DriverUITests' || echo no-xcodebuild-process
ls -la docs/programme/VOICE-2026/driver-ledger/ | grep -E 'K00-0506|\.device-'
for d in docs/programme/VOICE-2026/driver-ledger/K00-0506-*/; do echo "== $d"; tail -5 "$d/batch.log" 2>/dev/null; ls "$d/journals" 2>/dev/null | wc -l; done
```

**Predeclared reading:** a `k00-driver-batch.sh K00-0506` process present, or a `K00-0506-<stamp>/batch.log` whose last line is not `batch complete` and is advancing → **(a): the batch is running; touch nothing; wait for `batch complete — …/ledger.md` (≈ 8–10 min), then return the evidence.** No process, and either no `K00-0506-*` directory or one whose `batch.log` stopped without `batch complete` → **(b): stale lock; return the diagnostic output; the founder removes exactly the stale `.lock.d` by hand (a runtime artefact, never evidence), records that act, and re-runs the §10 preflight + batch in one shell.** The one K00-0506 authority is spent only by an instance that actually ran samples; a stale-lock instance that never reached sample 1 spends nothing.

### 10.3 Diagnostic read → (a): THE ONE AUTHORIZED BATCH IS RUNNING (`K00-0506-20260914T235008Z`, pid 82331) — nothing touched · the refused instance left an empty footprint · sample 1 ledgered silently (read later from the ledger, not inferred now)

**Founder diagnostic (read-only, 2026-09-14 ~19:52 local / 23:52Z):** `pgrep` → `82331 bash scripts/witness/k00-driver-batch.sh K00-0506 10 --act output --cancel-at 1000 --settle 2 --vp on --mode L --subject vpio-02` and `82622 xcodebuild test-without-building -xctestrun …/.derived/Build/Products/DriverUITests_iphoneos26.2-arm64.xctestrun -destination id=00008140-00163D9922E0801C -collect-test-diagnostics never -only-testing:DriverUITests/K00DriverTests/testOutputSample`. Ledger root: `.device-….lock` (0 B, the `exec 9>` file) · `.device-….lock.d` (23:50, held by 82331) · **`K00-0506-20260914T235008Z/`** (11 entries; `batch.log` tail: `xctestrun …` → `sample 1/10 — precondition` 23:50:15 → `sample 1/10 — driver (testOutputSample, mode L)` → `sample 2/10 — precondition` 23:51:24 → `sample 2/10 — driver` 23:51:25; `journals/` 0 files at read time) · `K00-0506-20260914T235012Z/` (96 B: only an empty `journals/` — the footprint of the instance refused at the lock four seconds later; the batch creates its ledger dir before the lock check; **not a batch, not evidence, keep as is**) · two preflight directories `234929Z` and `235001Z` (two read-only preflight acts; both lawful; both to be returned).

**Reading, bounded to what the log shows:** the first instance holds the lock and is the authorized batch; the refusal in §10.2 protected it (CAL-F3 guard). Sample 1 took ≈ 69 s driver wall and was followed directly by sample 2 with no `sample 1 ledgered:` / `output rows read:` log line and no journal in `journals/` at read time — consistent with the batch's infrastructure branch, which writes its row to `ledger.md` without a `log()` line (Stage A sample 9 shape), or with a journal pulled after the read. **Not read further now**: the ledger row is the record and will be read when the evidence returns; no intervention, no inference about the organism from a driver wall time.

**Instruction:** wait for `batch complete — …/K00-0506-20260914T235008Z/ledger.md` (≈ 8–12 min from 23:50), then return `K00-0506-preflight-234929Z/`, `K00-0506-preflight-235001Z/`, `K00-0506-20260914T235008Z/` complete and the empty `K00-0506-20260914T235012Z/` (as the refused footprint) on a `feature/*` branch. Nothing else is touched; the `.lock.d` is removed by the batch's own `EXIT` trap.

### 10.4 K00-0506 N=10 EXECUTED · RECEIVED and READ HERE → TEN INFRASTRUCTURE ROWS · CHARACTERIZE ONLY · K00-05 / K00-06 INCOMPLETE · C-D20 named · adjudication OWED

Record: `KERNEL-00_VPIO-02_K00-05-06_WITNESS_2026-09-14.md`. Evidence `36d0d683d` cherry-picked `6960e13e7`, four hashes verified. Samples 1–2 automation-mode timeout (known start-of-batch shape); samples 3–10 `'Play 3 s tone' not found after Enter` ×8 (Enter tapped, five existence checks, hierarchy snapshot requested but discarded with the `.xcresult`); seven terminate-only preconditions passed; one harness process left alive after sample 10. No journal, no output rows, nothing read about the organism; K00-04 standing untouched. C-D20 candidate (inference): the Output section is the fourth section of a lazy SwiftUI `List` and is offscreen after Enter; correction shape = driver-only scroll-to-reveal + hierarchy-on-failure, new SHA, new compile, new ruling. Authority SPENT. Returned: classification · C-D20 · lingering-process disposal · whether a fresh N=10 opens.

### 10.5 ADJUDICATED (founder) — classification ACCEPTED · C-D20 bounded driver repair AUTHORIZED · one corrective termination AUTHORIZED (pinned below) · fresh N=10 HELD

Ruling substance in the witness record §8. Three acts follow, in this order; none opens a device witness.

**A. Record pin (this section).** Then the C-D20 source change (§10.6 when landed).

**B. C-D20 specification (driver only).** In `testOutputSample`, the single line `guard play.waitForExistence(timeout: 5) else { return driverFail(…) }` becomes: if the button does not exist within 5 s → up to `revealSwipeLimit = 4` calls of `harness.swipeUp()`, each followed by a short settle and an exact-label existence check (`harness.buttons["Play 3 s tone"].exists`), stopping at the first hit; if revealed → fall through to the unchanged `waitEnabled(play, timeout: 5)` guard; if not revealed after the fourth swipe → every line of `harness.debugDescription` is written to the runner log by `note(…)` under the prefix `K00-HIERARCHY:`, then the one existing `driverFail("'Play 3 s tone' not found after Enter …")` returns the same `DRIVER/INFRASTRUCTURE FAILURE`. `driverFail(` count in the body stays 1; no `XCTFail`/`XCTAssert`; everything from `waitEnabled` onward byte-for-byte as at `8b111709b`; `testOneSample` · `testW4Sample` · `testTerminateOnly` and the four historical helpers byte-identical to `08483cfe4`; the app under test still receives nothing. Gate amendments in the same commit: the ordered-step pin gains `play.waitForExistence(timeout: 5)` → `harness.swipeUp()` → `K00-HIERARCHY:` between `harness.buttons["Play 3 s tone"]` and `waitEnabled(play, timeout: 5)`; `static let revealSwipeLimit = 4` and the bounded `for … in 1...Self.revealSwipeLimit` loop pinned; the batch, both readers and the reinstall gate pinned byte-identical to `8b111709b6e5010b4b6ee7281d257141945276ff` (new constant). Then: gate read alone → one instrument commit → its SHA is the compile subject → driver-only `xcodegen` + generic-iOS `build-for-testing`, signing OFF → custody → STOP.

**C. Corrective termination — pinned invocation (founder Mac act; the `8b111709b` signed batch runner already on the Mac; `TEST_RUNNER_K00_SUBJECT=vpio-02` is the only runner env; the harness receives nothing).** Read first; act only on exactly one; read once after; STOP. The process count is read from the listing's documented JSON exactly as the batch's `daemon_snapshot` reads it (`{"executable": "file://…", "processIdentifier": N}` rows; basename match on `VoiceKernelHarness`). Paste-able, no comments:

```
xcrun devicectl device info processes --device A0736AC8-793B-516F-AC72-C076DB6CEE38 --json-output /private/tmp/k0506-disposal-before.json
python3 - /private/tmp/k0506-disposal-before.json <<'PY'
import json,re,sys
s=json.dumps(json.load(open(sys.argv[1])))
rows=re.findall(r'\{"executable": "file://([^"]+)", "processIdentifier": (\d+)\}', s)
hits=[(p,pid) for p,pid in rows if p.rsplit('/',1)[-1]=='VoiceKernelHarness']
print('VoiceKernelHarness processes BEFORE:', len(hits), hits)
PY
```

If and only if the line reads `VoiceKernelHarness processes BEFORE: 1 […]`:

```
cd /private/tmp/k0506-driver-compile-8b111709b
git rev-parse HEAD
TEST_RUNNER_K00_SUBJECT=vpio-02 xcodebuild test-without-building -xctestrun /private/tmp/k0506-driver-compile-8b111709b/ios/VoiceKernelDriver/.derived/Build/Products/DriverUITests_iphoneos26.2-arm64.xctestrun -destination id=00008140-00163D9922E0801C -collect-test-diagnostics never -only-testing:DriverUITests/K00DriverTests/testTerminateOnly 2>&1 | tee /private/tmp/k0506-disposal-terminate.log
xcrun devicectl device info processes --device A0736AC8-793B-516F-AC72-C076DB6CEE38 --json-output /private/tmp/k0506-disposal-after.json
python3 - /private/tmp/k0506-disposal-after.json <<'PY'
import json,re,sys
s=json.dumps(json.load(open(sys.argv[1])))
rows=re.findall(r'\{"executable": "file://([^"]+)", "processIdentifier": (\d+)\}', s)
hits=[(p,pid) for p,pid in rows if p.rsplit('/',1)[-1]=='VoiceKernelHarness']
print('VoiceKernelHarness processes AFTER:', len(hits), hits)
PY
```

`git rev-parse HEAD` must print `8b111709b6e5010b4b6ee7281d257141945276ff`; the xctestrun path is the one the K00-0506 batch logged at `[23:50:14] xctestrun:` (signed, device-targeted; the generic `build-for-testing` product is unsigned and is not this runner); the destination is the Xcode destination id, never the `devicectl` id. Zero, more than one, or an unreadable listing → return the BEFORE read and stop; a `testTerminateOnly` that reports `DRIVER/INFRASTRUCTURE FAILURE: harness did not terminate` → return the log and the AFTER read and stop; no second invocation. Return the three files on a `feature/*` branch.

**D. Runner-readiness preflight (rule only; for the future N=10 ruling, NOT an authorization).** Before any fresh K00-0506 batch: on the corrected compiled runner (new SHA, custody recorded), exactly one `testTerminateOnly` against vpio-02 → PASS means the runner initialized on the device and no harness is running; FAIL → STOP, no retry inside the same authority. Then the §10-shaped read-only preflight (HEAD = new SHA · witness surface identical · apps listing carries `E3B88028` · zero harness processes). The batch itself needs a new authority string at invocation.

### 10.6 C-D20 LANDED at `83a382a1455161996d499f30cbf00504bbd0332a` — driver test only · gate 65/65 · NOT COMPILED · driver-only compile OWED (invocation pinned) · STOP

**What moved (one instrument commit; `git diff --stat 8b111709b -- ios scripts` = `K00DriverTests.swift | 20 +++-`, nothing else):** `static let revealSwipeLimit = 4`; in `testOutputSample` the single `guard play.waitForExistence(timeout: 5) else { return driverFail(…) }` became: not present within 5 s → `for i in 1...Self.revealSwipeLimit { harness.swipeUp(); sleep 0.5 s; revealed = harness.buttons["Play 3 s tone"].exists; note(reveal swipe i/4 — exists: …); if revealed { break } }` → not revealed → every line of `harness.debugDescription` to the runner log as `K00-HIERARCHY: …` → the one existing `driverFail("'Play 3 s tone' not found after Enter (absent after 4 reveal swipes; hierarchy written under K00-HIERARCHY:)")` — the same `DRIVER/INFRASTRUCTURE FAILURE` class. From `guard waitEnabled(play, timeout: 5)` onward the act is byte-for-byte the `8b111709b` act (gate-asserted by slicing both bodies). Driver file SHA-256 `ead48cf59498f9c81ea2eb06dfb610ec6da87bd50b7c1cf8af59c480488b72c5`.

**Frozen, verified before commit:** `git diff --quiet ac12dedf4… -- ios/VoiceKernel ios/VoiceKernelHarness` clean · `git diff --quiet 8b111709b… -- scripts/witness` clean (batch · `k00-ledger.py` · `k00-output-ledger.py` · `k00-reinstall.sh`). Gate 64 → **65/65** read alone before commit: new pin `INSTRUMENT_K0506 = 8b111709b…` (those four files byte-identical; the driver test must differ); the ordered-step pin now runs `harness.buttons["Play 3 s tone"]` → `play.waitForExistence(timeout: 5)` → `for i in 1...Self.revealSwipeLimit` → `harness.swipeUp()` → exact-label `.exists` → `if revealed { break }` → `if !revealed` → `harness.debugDescription` → `K00-HIERARCHY:` → `driverFail("'Play 3 s tone' not found after Enter` → `waitEnabled(play, timeout: 5)` → the unchanged tail; `revealSwipeLimit = 4` pinned; exactly one `swipeUp()` site; no `swipeDown|swipeLeft|swipeRight|scrollTo|while`; hierarchy written before the failure returns; `debugDescription` read once; `driverFail(` count 1; no `XCTFail|XCTAssert`; three historical tests + four helpers byte-identical to `08483cfe4`; app under test receives nothing.

**Driver-only compile invocation (founder Mac act; fresh detached worktree at exactly this SHA; fresh derived path; signing OFF; paste as a block; no comments):**

```bash
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach /private/tmp/k0506-driver-compile-83a382a14 83a382a1455161996d499f30cbf00504bbd0332a
cd /private/tmp/k0506-driver-compile-83a382a14
git rev-parse HEAD
grep -c 'static let revealSwipeLimit = 4' ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift
python3 scripts/witness/k00-output-ledger.py --selftest | tail -1
cd ios/VoiceKernelDriver
xcodegen generate
xcodebuild build-for-testing -project VoiceKernelDriver.xcodeproj -scheme DriverUITests -destination 'generic/platform=iOS' -derivedDataPath /private/tmp/k0506-driver-compile-83a382a14-derived CODE_SIGNING_ALLOWED=NO 2>&1 | tee /private/tmp/k0506-build-for-testing-83a382a14.log | tail -3
```

Expected readings, in order: `83a382a1455161996d499f30cbf00504bbd0332a` · `1` · `selftest: 33/33 expectations met` · `** TEST BUILD SUCCEEDED **`. Any other reading → STOP, return the transcript; a compile red is a bounded driver-source defect to record, corrected only on a new SHA under a fresh authorization.

**Custody afterwards (same shape as §9.2):**

```bash
cd /private/tmp/k0506-driver-compile-83a382a14-derived/Build/Products
grep -c 'TEST BUILD SUCCEEDED' /private/tmp/k0506-build-for-testing-83a382a14.log
grep -cE 'devicectl|test-without-building|install app' /private/tmp/k0506-build-for-testing-83a382a14.log
shasum -a 256 *.xctestrun Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests Debug-iphoneos/DriverUITests-Runner.app/DriverUITests-Runner Debug-iphoneos/DriverHost.app/DriverHost /private/tmp/k0506-build-for-testing-83a382a14.log
```

Expected: `1` · `0` · five hashes; only `DriverUITests` is expected to differ from §9.3 (`ab573914…`). Return on a `feature/*` branch → cherry-picked here → §10.7.

**What this SHA does NOT open:** no device act; the corrective termination of §10.5 C runs on the `8b111709b` runner, not this one, and is independent of this compile; the fresh N=10 stays HELD behind §10.5 (4): this SHA · its compile custody · clean process state · the runner-readiness preflight on THIS runner (one `testTerminateOnly` vs vpio-02) · a fresh authority string. **STOP.**

### 10.7 BOTH MAC ACTS RETURNED and VERIFIED HERE — corrective termination PASS (harness CLEARED) · C-D20 driver-only compile GREEN on exactly `83a382a14` · custody pinned · STOP

Evidence commit `ed0c2c337794976e1197a0666ef741e986948924` (branch `feature/k00-0506-cd20-mac-evidence-20260914`) cherry-picked here with `-x` → `87f0d403a`; six files under two UTC-stamped directories in `driver-ledger/`, read line by line.

**A. Corrective termination (`K00-0506-C-D20-disposal-20260915T002929Z/`; §10.5 C executed once).** `processes-before.json` read by the batch's own `daemon_snapshot` regex: 372 rows, **exactly one** `VoiceKernelHarness` — PID 67021, executable under `/private/var/containers/Bundle/Application/E3B88028-A10F-46B1-AB27-CF0A1F83FB78/…` (the FIRST-INSTALL-02 `.vpio02` container, so the lingering process was the K00-0506 sample-10 harness, not another subject). `terminate-only.log` line 2 = the pinned invocation verbatim (`test-without-building -xctestrun /private/tmp/k0506-driver-compile-8b111709b/…/DriverUITests_iphoneos26.2-arm64.xctestrun -destination id=00008140-00163D9922E0801C -collect-test-diagnostics never -only-testing:DriverUITests/K00DriverTests/testTerminateOnly`); `testTerminateOnly` **passed (1.113 s) · Executed 1 test, 0 failures · TEST EXECUTE SUCCEEDED**. `processes-after.json`: 380 rows, `VoiceKernelHarness` **0**. `custody.txt`: runner source `8b111709b…` · subject `vpio-02` · before 1 / pid 67021 · PASS · after 0 · `no_second_invocation=true`. The runner env `TEST_RUNNER_K00_SUBJECT=vpio-02` is not echoed by `xcodebuild` and is therefore founder-attested through `custody.txt`; the outcome (the `.vpio02` container's process gone, no other harness bundle present) is consistent with it. **Device state: `.vpio02` installed, zero harness processes; `.vpio01` frozen; K00/R1 untouched. Authority for this act SPENT (one invocation, one pass).**

**B. C-D20 driver-only compile (`K00-0506-C-D20-driver-compile-20260915T002929Z/`; §10.6 invocation).** `custody.txt`: source `83a382a1455161996d499f30cbf00504bbd0332a` · `revealSwipeLimit` count 1 · reader selftest 33/33 · `TEST BUILD SUCCEEDED` count 1 · device/test-execution verbs 0. `build-for-testing.log` re-read here: `TEST BUILD SUCCEEDED` **1** · `devicectl|test-without-building|install app` **0** · `CODE_SIGNING_ALLOWED=NO` · `generic/platform=iOS` · derived path `/private/tmp/k0506-driver-compile-83a382a14-derived`; SHA-256 recomputed **`ff79b82a…` = recorded**. Product custody (founder-read, recorded):

| product | SHA-256 | vs §9.3 (`8b111709b`) |
|---|---|---|
| `DriverUITests_iphoneos26.2-arm64.xctestrun` | `7105c95ed047091bfc823c5d704f5dd8cc98257c9fde43927c69d83789657739` | identical |
| `DriverUITests.xctest/DriverUITests` | `9e8ebb4616a662d8383de2fbdb49d4adb62bad88e4b14966072046fd19c3ad3e` | **moved** (was `ab573914…`) — the one C-D20 bundle |
| `DriverUITests-Runner.app/DriverUITests-Runner` | `6fa0f96700913280d0bb3ddd3b400d69bc2ea66592d97c4760a753d2dd701f41` | identical |
| `DriverHost.app/DriverHost` | `5779387686f49134baeee76cfc77f9d2bebd53e56cb59279b163b8dc640d479b` | identical |
| `build-for-testing.log` | `ff79b82a77473e4bd6e42241dca76fc509d46b3338732b3759621c2e2d5326fe` | — |

Exactly the expected shape: only the test bundle moved. Gate read on the Mac before the evidence commit: 65/65. **DRIVER-COMPILE-02 (K00-05/06, C-D20) CLOSED.**

**C. What is now true, and what is not.** Instrument `83a382a14` is compiled (generic, unsigned) and its custody is pinned; the device is clean; the organism and the installed `.vpio02` are untouched. **Nothing about K00-05/06 has been measured** — no journal exists on any subject with `stream_cancel_measured` / `stream_complete`. §10.5 (4)'s conditions: new SHA ✓ · compile custody ✓ · clean process state ✓ (as of 00:29Z; a future preflight re-reads it) · **runner-readiness preflight NOT YET AUTHORIZED, NOT RUN** · fresh authority string NONE. One instrument fact for the next ruling, recorded so the invocation is not mis-pinned: the compile-green product is signing-OFF and cannot execute on the phone; a device act on `83a382a14` (the readiness `testTerminateOnly`, then any batch) runs on the runner the batch builds itself — `k00-driver-batch.sh` performs its own signed `build-for-testing` into `ios/VoiceKernelDriver/.derived` from the worktree it runs in, exactly as the K00-0506 batch did at `[23:50:14] xctestrun:` — so the readiness ruling must name the worktree (`/private/tmp/k0506-driver-compile-83a382a14`), a signed build step, and the one `testTerminateOnly` invocation, and the batch's sample-1 precondition is again a terminate-only act the ruling must place.

**Standing:** K00-04 PASS on VPIO-02 · K00-05 INCOMPLETE · K00-06 built-in INCOMPLETE · C-D20 LANDED + COMPILED (`83a382a14`, custody pinned) · lingering harness CLEARED · runner-readiness preflight NOT AUTHORIZED · fresh K00-0506 N=10 HELD (needs a fresh authority string) · reinstall / route / interruption / reset / endurance NOT AUTHORIZED · `.vpio02` installed, untouched · `.vpio01` FROZEN · K00/R1 UNTOUCHED · KERNEL-00 NOT ACCEPTED. **STOP.**

### 10.8 FOUNDER RULING — RUNNER-READINESS PREFLIGHT OPEN (one invocation) · FRESH K00-0506 N=10 SELECTED, EXECUTION HELD (no authority string exists)

§10.7 discharges the two missing prerequisites (compiled successor `83a382a14`; lingering `.vpio02` process cleared). The instrument stays driver-only; organism and installed artifact did not move.

**1. Runner-readiness preflight — AUTHORIZED.** One instrument-readiness act; not a K00-05/06 sample, not a pilot. Subject: instrument source `83a382a1455161996d499f30cbf00504bbd0332a` · worktree `/private/tmp/k0506-driver-compile-83a382a14` · device `A0736AC8-793B-516F-AC72-C076DB6CEE38` · Xcode destination `00008140-00163D9922E0801C` · subject `vpio-02` · bundle `life.soullab.voicekernel.vpio02`. Because the §10.7 compile was signing-OFF, the act first creates the signed runner from this exact worktree with the batch's own recipe. **Verified here by reading `k00-driver-batch.sh` (frozen at `8b111709b`), never by running it:** line 147 `xcodegen generate` in `ios/VoiceKernelDriver`; line 149 `xcodebuild build-for-testing -project "$PROJ" -scheme DriverUITests -destination "id=$XDEST" -derivedDataPath "$DD" DEVELOPMENT_TEAM="${K00_TEAM:-ZVK2X646Z2}"` with `DD="$ROOT/ios/VoiceKernelDriver/.derived"`; line 150 `XCTESTRUN="$(ls -t "$DD"/Build/Products/*.xctestrun | head -1)"`; line 121 the `test-without-building` form — the ruling's sequence below is that recipe, term for term. Pinned by the founder, exactly one sequence:

```bash
cd /private/tmp/k0506-driver-compile-83a382a14
git rev-parse HEAD
git diff --quiet 83a382a1455161996d499f30cbf00504bbd0332a -- \
  ios/VoiceKernelDriver \
  scripts/witness/k00-driver-batch.sh \
  scripts/witness/k00-ledger.py \
  scripts/witness/k00-output-ledger.py \
  scripts/witness/k00-reinstall.sh
echo "readiness surface identical to 83a382a14"
cd ios/VoiceKernelDriver
xcodegen generate
xcodebuild build-for-testing \
  -project VoiceKernelDriver.xcodeproj \
  -scheme DriverUITests \
  -destination id=00008140-00163D9922E0801C \
  -derivedDataPath .derived \
  DEVELOPMENT_TEAM=ZVK2X646Z2
XCTESTRUN="$(ls -t .derived/Build/Products/*.xctestrun | head -1)"
TEST_RUNNER_K00_SUBJECT=vpio-02 \
xcodebuild test-without-building \
  -xctestrun "$XCTESTRUN" \
  -destination id=00008140-00163D9922E0801C \
  -collect-test-diagnostics never \
  -only-testing:DriverUITests/K00DriverTests/testTerminateOnly
```

Then exactly one process read:

```bash
xcrun devicectl device info processes \
  --device A0736AC8-793B-516F-AC72-C076DB6CEE38 \
  --json-output /private/tmp/k0506-readiness-processes-after.json
```

read with the same basename rule as §10.5 C (documented JSON rows; basename `VoiceKernelHarness`).

**Reading note (this session, recorded beside the pinned sequence, not substituted into it):** the `echo "readiness surface identical to 83a382a14"` line is unconditional — it prints whether or not `git diff --quiet` exited 0. The reading "witness surface unchanged" therefore rests on the diff's exit status (e.g. `echo $?` immediately after it, or the founder's transcript showing no diff output), never on the echo line. The `xcodegen` step rewrites the tracked `Harness/Info.plist`-style footprint only inside `ios/VoiceKernelDriver`, so the diff must be read BEFORE `xcodegen generate` runs, which the pinned order already does.

**2. Predeclared readiness reading (founder):** PASS = HEAD exact `83a382a14…` ∧ witness surface unchanged ∧ signed build succeeds ∧ `testTerminateOnly` executes exactly once ∧ 0 test failures ∧ after-read = 0 `VoiceKernelHarness` processes. FAIL = any compile/build refusal · runner initialization failure · `testTerminateOnly` failure · unreadable after-state · any harness process remaining afterward. **No retry.** A FAIL returns as instrument evidence and authorizes no second attempt, cleanup act, source edit or N=10 batch. If zero harness processes already exist, `testTerminateOnly` still runs once — its purpose here is to prove the corrected signed runner initializes on the device, not to terminate anything.

**3. Fresh K00-0506 N=10 — SELECTED as the next physiological experiment if readiness passes; EXECUTION HELD.** No further architectural decision on population, output sequence, thresholds or the separate K00-05/K00-06 readings; frozen: N 10 · act output · cancel-at 1000 ms · settle 2 s · VP ON · mode L · subject vpio-02 · K00-05 own reading · K00-06 own reading · coupling descriptive only · no top-up · no automatic rerun. **The batch is not executable from this ruling: readiness PASS establishes a fact; it does not itself create execution authority.** After the readiness evidence returns and is recorded, the founder issues the fresh batch authority string. None exists now; the old 2 086-byte string stays spent.

**4. What the eventual N=10 ruling will pin (assuming readiness PASS):** corrected instrument `83a382a14…` · signed-runner readiness PASS · installed artifact = existing `.vpio02` / `E3B88028…` · one §10-shaped read-only preflight clean immediately before the batch · N = 10 · exact invocation `K00-0506 10 --act output …` · a new full authority string as invocation input. The batch's ordinary per-sample cold precondition stays lawful (terminate-only after sample 1 when needed), but a clean external preflight before sample 1 is required again so a lingering process is never normalized into the governed population.

**Standing:** K00-04 PASS · K00-05 INCOMPLETE · K00-06 built-in INCOMPLETE · C-D20 instrument `83a382a14` COMPILED · lingering harness CLEARED · **runner-readiness preflight OPEN · one invocation** · **fresh K00-0506 N=10 SELECTED · EXECUTION HELD** · fresh authority string DOES NOT EXIST · reinstall / route / interruption / reset / endurance NOT AUTHORIZED · KERNEL-00 NOT ACCEPTED. The only live Mac act is the single corrected-runner readiness preflight; its evidence (transcript · signed `build-for-testing.log` · `test-without-building` log · after-listing JSON · product hashes of the signed runner) returns on a `feature/*` branch → §10.9.

### 10.9 RUNNER-READINESS PREFLIGHT EXECUTED — PASS on every predeclared field · VERIFIED HERE · signed-runner custody pinned · fresh N=10 still HELD (no authority string)

Evidence `416ce8de7d57309216b2c0f03cda280f119ff029` (branch `feature/k00-0506-readiness-evidence-20260914`) cherry-picked `-x` → `a663f4d7f`; directory `driver-ledger/K00-0506-C-D20-readiness-20260915T003727Z/` (`build-for-testing.log` · `test-without-building.log` · `processes-after.json` · `transcript.txt` · `custody.txt`). Custody names the ruling commit `10631fb04`.

**Predeclared reading (§10.8 item 2), each field read from the files, not from the summary:**

| field | evidence | reading |
|---|---|---|
| HEAD exact `83a382a14…` | `transcript.txt` line 10 `HEAD=83a382a1455161996d499f30cbf00504bbd0332a` | ✓ |
| witness surface unchanged | `transcript.txt` line 11 `READINESS_DIFF_RC=0` (the explicit exit status; the unconditional echo on line 12 was not used) | ✓ |
| signed build succeeds | `build-for-testing.log`: `TEST BUILD SUCCEEDED` ×1 · `DEVELOPMENT_TEAM=ZVK2X646Z2` · `-destination id=00008140-00163D9922E0801C` · `-derivedDataPath .derived` · no `CODE_SIGNING_ALLOWED=NO` · `devicectl|test-without-building|install app` count 0 | ✓ |
| `testTerminateOnly` exactly once | `test-without-building.log` line 2 = the pinned invocation on the worktree's own `.derived/Build/Products/DriverUITests_iphoneos26.2-arm64.xctestrun`; `started` count 1 | ✓ |
| 0 test failures | `passed (0.023 s)` · `Executed 1 test, with 0 failures` · `** TEST EXECUTE SUCCEEDED **` | ✓ |
| after-read = 0 harness | `processes-after.json` by the batch's own regex: 364 rows, `VoiceKernelHarness` 0 | ✓ |
| no retry · batch not run | `custody.txt` `no_retry=true` · `fresh_k00_0506_batch_not_run=true`; the logs contain one build and one test invocation | ✓ |

The 0.023 s pass is the expected shape with zero harness processes: the corrected signed runner installed, initialized and executed on the device, found the harness `.notRunning`, and returned — exactly the purpose §10.8 assigned to it. Hashes recomputed here: `build-for-testing.log` `7862c605…` · `test-without-building.log` `259dca02…` · `processes-after.json` `1c7b8b78…` — all = custody. **Signed-runner custody (founder-read, recorded; device-targeted products, so not expected to equal the §10.7 signing-OFF hashes):** xctestrun `3b6360f76e2ec96f0917bcac180dea439c7bddfcafa2c592317b953cfd08d1fc` · DriverUITests `4d8684d1d92b25a051b5984d621ca3bb848b60507d7477b6a71bd74b9d1cd6d3` · XCTRunner `d77c249034186dd459154832ddffc138c9790d5b2e2ed290fccedc8c5489993b` · DriverHost `704d21d31ad3ce15ed158294b8f775b936998c647ac26a44d816d47ca14861d0`. Gate read on the Mac before the evidence commit: 65/65; read here again before this record commit: 65/65.

**RUNNER-READINESS PREFLIGHT: PASS · CLOSED.** What it establishes: the corrected instrument `83a382a14` has a signed runner that initializes and executes on this device against subject vpio-02, and the device holds zero harness processes as of 00:37Z. What it does not establish: anything about K00-05/06 (no journal, no Play, no Cancel); and per §10.8 item 3 it creates **no execution authority** — the fresh K00-0506 N=10 stays SELECTED · EXECUTION HELD until the founder issues the new authority string, which does not exist. The eventual ruling pins (§10.8 item 4): instrument `83a382a14` · readiness PASS (this section) · installed `.vpio02` / `E3B88028…` · one §10-shaped read-only preflight clean immediately before the batch (HEAD `83a382a14` · surface diff rc 0 · apps listing by `--bundle-id` + `--json-output` carrying `E3B88028` · zero harness processes) · N = 10 · exact invocation `k00-driver-batch.sh K00-0506 10 --act output --cancel-at 1000 --settle 2 --vp on --mode L --subject vpio-02` from the `83a382a14` worktree with `K00_DEVICE` / `K00_XCODE_DEST` as in §10 · the new full authority string at invocation, never abbreviated in any chat rendering. The batch rebuilds its own signed runner into `.derived` at start; the readiness runner's hashes above are custody evidence for the instrument, not a precondition that the batch's rebuild reproduce them byte-for-byte.

**Standing:** K00-04 PASS · K00-05 INCOMPLETE · K00-06 built-in INCOMPLETE · C-D20 instrument `83a382a14` COMPILED · corrected-runner readiness PASS · harness 0 processes · fresh K00-0506 N=10 SELECTED · EXECUTION HELD · fresh authority string DOES NOT EXIST · reinstall / route / interruption / reset / endurance NOT AUTHORIZED · KERNEL-00 NOT ACCEPTED. **No Mac act is live.** Next decision point = the founder's fresh-batch ruling with its authority string (§10.10 when issued).


### 10.10 FOUNDER RULING — FRESH K00-0506 N=10 OPEN AFTER THIS RECORD PIN · preflight + exact invocation + complete authority string recorded · Mac act, NOT YET EXECUTED

Readiness passed every predeclared field (§10.9); the corrected instrument is fixed at `83a382a1455161996d499f30cbf00504bbd0332a`; the installed `.vpio02` subject is the existing `E3B88028…` artifact. The held condition is satisfied. **The fresh physiological witness opens only after this section is recorded and pushed; then the preflight is the live Mac act, and the batch is live only if that preflight is clean.**

**Authorized population.** Organism `ac12dedf4b7b4efc9855c08bb4285a704e7039f1` · installed subject `life.soullab.voicekernel.vpio02`, container `E3B88028-A10F-46B1-AB27-CF0A1F83FB78` · witness instrument `83a382a1455161996d499f30cbf00504bbd0332a` · runner readiness PASS (§10.9) · population K00-0506 · N=10 · act output · cancel-at 1000 ms · settle 2 s · VP ON · Mode L · subject vpio-02. No pilot, top-up, automatic rerun, reinstall, or organism rebuild.

**Source custody — fresh detached batch worktree** (so the readiness run's `xcodegen` footprint cannot contaminate the preflight; custody preparation only, no new subject or instrument):

```bash
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach /private/tmp/k0506-batch-83a382a14 83a382a1455161996d499f30cbf00504bbd0332a
cd /private/tmp/k0506-batch-83a382a14
```

**One read-only preflight immediately before the batch (founder-pinned; paste as a block):**

```bash
cd /private/tmp/k0506-batch-83a382a14
HEAD_NOW="$(git rev-parse HEAD)"
echo "HEAD=$HEAD_NOW"
if [ "$HEAD_NOW" != "83a382a1455161996d499f30cbf00504bbd0332a" ]; then
  echo "STOP: wrong instrument HEAD"
  exit 90
fi

git diff --quiet 83a382a1455161996d499f30cbf00504bbd0332a -- \
  ios/VoiceKernelDriver \
  scripts/witness/k00-driver-batch.sh \
  scripts/witness/k00-ledger.py \
  scripts/witness/k00-output-ledger.py \
  scripts/witness/k00-reinstall.sh
DIFF_RC=$?
echo "PREFLIGHT_DIFF_RC=$DIFF_RC"
if [ "$DIFF_RC" -ne 0 ]; then
  echo "STOP: witness surface differs"
  exit 91
fi

if pgrep -fl 'k00-driver-batch.sh K00-0506' > /private/tmp/k0506-preflight-other-batches.txt; then
  cat /private/tmp/k0506-preflight-other-batches.txt
  echo "STOP: another K00-0506 batch process exists"
  exit 92
else
  echo "OTHER_K00_0506_BATCHES=0"
fi

DEV=A0736AC8-793B-516F-AC72-C076DB6CEE38
PF="docs/programme/VOICE-2026/driver-ledger/K00-0506-preflight-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$PF"

xcrun devicectl device info apps \
  --device "$DEV" \
  --bundle-id life.soullab.voicekernel.vpio02 \
  --json-output "$PF/apps.json" >/dev/null
APPS_RC=$?
echo "APPS_READ_RC=$APPS_RC"
if [ "$APPS_RC" -ne 0 ]; then
  echo "STOP: apps listing unreadable"
  exit 93
fi

CONTAINER_HITS="$(grep -c 'E3B88028-A10F-46B1-AB27-CF0A1F83FB78' "$PF/apps.json")"
echo "E3B88028_CONTAINER_HITS=$CONTAINER_HITS"
if [ "$CONTAINER_HITS" -lt 1 ]; then
  echo "STOP: ruled VPIO-02 container not found"
  exit 94
fi

xcrun devicectl device info processes \
  --device "$DEV" \
  --json-output "$PF/processes.json" >/dev/null
PROCESS_RC=$?
echo "PROCESS_READ_RC=$PROCESS_RC"
if [ "$PROCESS_RC" -ne 0 ]; then
  echo "STOP: process listing unreadable"
  exit 95
fi

HCOUNT="$(python3 - "$PF/processes.json" <<'PY'
import json,re,sys
s=json.dumps(json.load(open(sys.argv[1])))
rows=re.findall(r'\{"executable": "file://([^"]+)", "processIdentifier": (\d+)\}', s)
hits=[(p,pid) for p,pid in rows if p.rsplit('/',1)[-1]=='VoiceKernelHarness']
print(len(hits))
PY
)"
echo "VoiceKernelHarness processes: $HCOUNT"
if [ "$HCOUNT" != "0" ]; then
  echo "STOP: harness process present"
  exit 96
fi

echo "PREFLIGHT_CLEAN=$PF"
```

Proceed only on: HEAD exact `83a382a14…` · `PREFLIGHT_DIFF_RC` 0 · `OTHER_K00_0506_BATCHES` 0 · `APPS_READ_RC` 0 · `E3B88028_CONTAINER_HITS` ≥ 1 · `PROCESS_READ_RC` 0 · `VoiceKernelHarness processes` 0. **Anything else is STOP.** No cleanup, termination, reinstall, second preflight, or corrective device act follows a failed preflight. (Session reading of the block, not a change to it: the preflight `PF` directory lands inside the batch worktree's `driver-ledger/`, so it is returned with the batch evidence on a `feature/*` branch; run in a fresh shell, `pgrep` sees only other batch processes, never itself.)

**Fresh execution authority — verbatim (2 927 UTF-8 bytes, no apostrophe, no ellipsis; reproduced here byte-for-byte from the ruling, sha256 `fb1373850a3646fe…`; an invocation input, never reconstructed from this record):**

```text
FOUNDER-AUTH: VPIO-02 K00-05/06 fresh witness after C-D20 and corrected-runner readiness PASS; execute exactly one N=10 K00-0506 automated output-and-duplex witness batch on the existing VPIO-02 artifact installed by FIRST-INSTALL-02, using corrected Option C instrument at 83a382a1455161996d499f30cbf00504bbd0332a, subject vpio-02, bundle life.soullab.voicekernel.vpio02, Mode L, voice processing ON, act output, settle 2 seconds, cancel the first 3-second known-PCM tone at 1000 ms, then exercise the second 3-second tone to completion. This authority is valid only after the immediately preceding ruled read-only preflight returns HEAD exactly 83a382a1455161996d499f30cbf00504bbd0332a, witness-surface diff rc 0, an apps listing in which life.soullab.voicekernel.vpio02 still resolves to the FIRST-INSTALL-02 container E3B88028-A10F-46B1-AB27-CF0A1F83FB78, and zero VoiceKernelHarness processes. If any preflight field is unreadable or different, STOP before the batch and return the preflight evidence; do not normalize state, terminate a harness, reinstall, overwrite, change source, or take another corrective device act. If preflight is clean, execute the declared ten invocations and finish all ten unless the frozen instrument itself aborts. No pilot, no top-up, no automatic rerun, no source change, no reinstall, no threshold change, no fault injection, no manual intervention, no route-change act, no interruption act, no media-services-reset act, no endurance act, no unified-log experiment, no mutation of the frozen .vpio01 artifact, and no historical K00/R1 mutation. The batch may regenerate and signed-build only the external driver from the pinned 83a382a14 worktree as its frozen orchestration requires; the installed .vpio02 app under test must not be rebuilt, replaced, or reinstalled. The batch ordinary per-sample cold precondition is authorized for samples 2 through 10 to terminate a harness process left by the immediately preceding declared invocation before starting the next declared invocation. The external preflight is the custody condition for sample 1; if the batch nevertheless reports a harness process present before sample 1, preserve and return that event as a protocol deviation for founder adjudication and do not treat the resulting sample as K00-05 or K00-06 evidence. A valid K00-05 or K00-06 failure does not stop selection of the remaining declared rows. K00-05 and K00-06 remain separate readings: output and cancellation evidence may not mechanically decide duplex physiology, and duplex physiology may not mechanically decide output and cancellation. Echo coupling is descriptive only and creates no acoustic threshold. The 100 ms K00-05 cancellation ceiling and the frozen K00-06 continuity reading remain unchanged. Return the complete preflight and K00-0506 evidence for independent reading and founder adjudication. No outcome from this batch authorizes any subsequent act.
```

**Exact batch invocation — same shell, immediately after `PREFLIGHT_CLEAN` (the complete string is carried in the invocation; a chat rendering that abbreviates it is not an invocation, per §13.6.1 / §10.1):**

```bash
K00_DEVICE=A0736AC8-793B-516F-AC72-C076DB6CEE38 \
K00_XCODE_DEST=00008140-00163D9922E0801C \
K00_EXEC_AUTHORITY='FOUNDER-AUTH: VPIO-02 K00-05/06 fresh witness after C-D20 and corrected-runner readiness PASS; execute exactly one N=10 K00-0506 automated output-and-duplex witness batch on the existing VPIO-02 artifact installed by FIRST-INSTALL-02, using corrected Option C instrument at 83a382a1455161996d499f30cbf00504bbd0332a, subject vpio-02, bundle life.soullab.voicekernel.vpio02, Mode L, voice processing ON, act output, settle 2 seconds, cancel the first 3-second known-PCM tone at 1000 ms, then exercise the second 3-second tone to completion. This authority is valid only after the immediately preceding ruled read-only preflight returns HEAD exactly 83a382a1455161996d499f30cbf00504bbd0332a, witness-surface diff rc 0, an apps listing in which life.soullab.voicekernel.vpio02 still resolves to the FIRST-INSTALL-02 container E3B88028-A10F-46B1-AB27-CF0A1F83FB78, and zero VoiceKernelHarness processes. If any preflight field is unreadable or different, STOP before the batch and return the preflight evidence; do not normalize state, terminate a harness, reinstall, overwrite, change source, or take another corrective device act. If preflight is clean, execute the declared ten invocations and finish all ten unless the frozen instrument itself aborts. No pilot, no top-up, no automatic rerun, no source change, no reinstall, no threshold change, no fault injection, no manual intervention, no route-change act, no interruption act, no media-services-reset act, no endurance act, no unified-log experiment, no mutation of the frozen .vpio01 artifact, and no historical K00/R1 mutation. The batch may regenerate and signed-build only the external driver from the pinned 83a382a14 worktree as its frozen orchestration requires; the installed .vpio02 app under test must not be rebuilt, replaced, or reinstalled. The batch ordinary per-sample cold precondition is authorized for samples 2 through 10 to terminate a harness process left by the immediately preceding declared invocation before starting the next declared invocation. The external preflight is the custody condition for sample 1; if the batch nevertheless reports a harness process present before sample 1, preserve and return that event as a protocol deviation for founder adjudication and do not treat the resulting sample as K00-05 or K00-06 evidence. A valid K00-05 or K00-06 failure does not stop selection of the remaining declared rows. K00-05 and K00-06 remain separate readings: output and cancellation evidence may not mechanically decide duplex physiology, and duplex physiology may not mechanically decide output and cancellation. Echo coupling is descriptive only and creates no acoustic threshold. The 100 ms K00-05 cancellation ceiling and the frozen K00-06 continuity reading remain unchanged. Return the complete preflight and K00-0506 evidence for independent reading and founder adjudication. No outcome from this batch authorizes any subsequent act.' \
scripts/witness/k00-driver-batch.sh K00-0506 10 \
  --act output \
  --cancel-at 1000 \
  --settle 2 \
  --vp on \
  --mode L \
  --subject vpio-02
```

Instrument facts verified here by reading, never by running: the batch is executable at `83a382a14`; it parses `--act` · `--cancel-at` · `--settle` (line 26) and derives `$BID` from `--subject vpio-02`; it regenerates and signed-builds only the external driver into `ios/VoiceKernelDriver/.derived` from the worktree it runs in (lines 147–150), never the app under test; it does NOT read `K00_EXEC_AUTHORITY` mechanically (the string is a recorded invocation input, as for the first K00-0506 batch); its per-sample precondition is terminate-only, which this authority admits for samples 2–10 and treats as a protocol deviation before sample 1; its device lock (`.device-<DEV>.lock.d`) refuses a concurrent batch. The output act runs `testOutputSample` on the C-D20 driver (bounded ≤ 4 reveal swipes; hierarchy to the runner log on a not-found; same infrastructure failure class) and reads each journal a second time with `k00-output-ledger.py` into `output-ledger.md`.

**Frozen adjudication law (unchanged from §10):** K00-05 PASS = 10/10 valid cancel rows PASS-05 ∧ 10/10 valid completion rows PASS-05; K00-05 FAIL = any valid FAIL-05 · K00-06 built-in PASS = 10/10 valid duplex rows PASS-06; K00-06 FAIL = any valid FAIL-06 · > 2 infrastructure / EN / not-a-cancel rows → CHARACTERIZE ONLY, affected obligation INCOMPLETE · no top-up · no automatic rerun · one population only. The 100 ms cancellation ceiling is constitutional; completion timing descriptive; K00-06 coupling descriptive; route-wide K00-06 closure travels later with K00-11. **No outcome from this batch authorizes any subsequent act.**

**Standing at the pin:** fresh K00-0506 N=10 OPEN after this record pin · new authority EXISTS only as the verbatim string above · preflight REQUIRED immediately before the batch · reinstall / route / interruption / reset / endurance NOT AUTHORIZED · KERNEL-00 NOT ACCEPTED. Evidence (preflight directory · batch ledger directory complete · `output-ledger.md` · journals · logs) returns on a `feature/*` branch → §10.11.

### 10.11 FRESH K00-0506 N=10 EXECUTED · RECEIVED and READ HERE (`KERNEL-00_VPIO-02_K00-05-06_WITNESS-02_2026-09-15.md`) → K00-05 PASS CONDITION MET · K00-06 built-in CHARACTERIZE ONLY / INCOMPLETE · adjudication OWED

Evidence `3fde4bbab` → cherry-pick `43fbe8c8f`; five core hashes and 10/10 journal hashes recomputed = recorded. Preflight clean (apps listing carries `E3B88028`, 0 harness, HEAD exact, diff rc 0). Batch 10/10, 0 infrastructure, 0 terminate-only, 0 aborts; C-D20 exercised ten times (one reveal swipe each, hierarchy path never taken). Entry: 10 × gen-1 listen (329–436 ms), cold ×10, 14-step trace ×10, VP ON ×10. **K00-05:** 10/10 cancel rows PASS-05 (handle-exact; last non-silent frame 0–10 ms BEFORE the cancel; `cancelToSilenceMs 0`; within the 100 ms ceiling) ∧ 10/10 completion rows PASS-05 (144 000/144 000) → the frozen PASS condition is met. **K00-06 built-in:** 3 PASS-06 · 5 CHARACTERIZE-06 (partial digital zero 1–42 callbacks per batch, never a full window, `input_dead` never, min rate ≥ 99.2/s vs ≈100/s baseline) · 2 UNMEASURED-06 (one full rendering window) · 0 FAIL-06 → PASS not met, FAIL not fired, > 2 non-adjudicating rows → CHARACTERIZE ONLY · INCOMPLETE under the frozen law. Coupling descriptive (post-AEC input attenuated during own playback in 9/10 measured rows). `listeningLostLater=True` ×10 = the lawful `listening → maiaSpeaking` output floor (semantics note, field frozen). Authority SPENT. **Adjudication is the founder's; no act opened; standing unchanged except the two readings above.**

**§10.11 addendum — C-D21 + session defect.** The §10.11 record commit `147f6b9a2` was made on a RED gate (corpus test: the new K00-0506 journals fell into the engine-era partition and read `gen-1 listen`); the commit chain did not stop on the failure — this session's defect, recorded in witness-02 §11, not absorbed (records only in that commit; evidence and instrument untouched). C-D21: the population `K00-0506-20260915T004738Z` named explicitly in the corpus test (10 × gen-1 listen under vpio-02 · 10 × SUBJECT-MISMATCH under vpio-01), excluded from engine-era; gate 65/65 read alone; founder acceptance as gate maintenance owed.

### 10.12 ADJUDICATED (founder; witness-02 §12) — K00-05 PASS · CLOSED · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE · partial-zero discriminator PLANNING OPEN (read-only) · `listeningLostLater` semantic limitation · C-D21 accepted

Substance in witness-02 §12. Planning act output → `KERNEL-00_VPIO-02_K00-06_PARTIAL-ZERO_DISCRIMINATOR_PLAN_2026-09-15.md` (read-only; may produce a protocol; authorizes no implementation, instrument or device witness). Standing per §12.

### 10.13 K00-06 PARTIAL-ZERO DISCRIMINATOR PLANNING ACT RETURNED (read-only; `KERNEL-00_VPIO-02_K00-06_PARTIAL-ZERO_DISCRIMINATOR_PLAN_2026-09-15.md`)

Semantics: "digital zero" = `peak ≤ 1e-7` at the consumed post-VP seam (the organism's only input; no raw-mic seam exists); VP off = bypass 1 on the same unit, already reachable by `--vp off`. Corpus reading: every in-stream near-silence callback lies in stream 2 at +0.8…+3.0 s (none in the cancelled stream 1); post-VP input attenuates progressively to `rmsMean` ~1e-6 with `signal` 0 over the first second of a stream; the PASS-06/CHARACTERIZE-06 split among samples 3–10 is a 1e-7 threshold-edge on one continuous shape; sample 1 shows no attenuation (unexplained, n=1); ambient near-end `signal` present at every baseline vanishes during deep attenuation — uncontrolled, so the corpus cannot separate A (live capture, echo removed), A′ (near-end suppressed at the seam during own playback) and B (capture collapse; not supported but not excluded). Answer: YES, an independent labelled stimulus discriminates on existing fields (window-level, no ms alignment) with a VP-OFF arm; smallest witnesses: S1 = VP-OFF output act with the existing instrument (no code) → S2 = VP-ON + steady external stimulus spanning the invocation (founder-placed source, or a batch-only `--stimulus` flag for custody; playback verb to be read on the Mac, not guessed) → S3 only on A′; N=10 per arm; readings predeclared, descriptive, no constitutional threshold; K00-06 PASS condition untouched. Rulings needed: S1 open? · S2 shape · reading law as witness criteria · the seam K00-06 governs. Nothing implemented or run.


### 10.14 FOUNDER RULING on the discriminator plan (discriminator plan §7–§8): plan ACCEPTED · K00-06 governs the consumed post-VP seam · §4 reading law RATIFIED as witness criteria (10×-floor amendment; classification-based A / A′ / UNMEASURED / CHARACTERIZE) · **S1 VP-OFF output witness OPEN after record pin** (stratum `K00-0506-VPOFF` · N=10 · instrument `83a382a14` · `--vp off` · no code; fresh worktree `/private/tmp/k0506-vpoff-83a382a14`; §10.10-shaped preflight; 2 389 -byte authority verbatim in plan §8, sha `4e77a98214c93f7f…`) · S2 shape = batch-orchestrated source SELECTED, implementation HELD (Mac playback verb to be discovered) · S3 conditional. Mac act, NOT YET EXECUTED; evidence → discriminator plan §9.

### 10.15 S1 VP-OFF WITNESS EXECUTED · READ HERE (discriminator plan §9): bypass 1/1 ×10 · own playback observable at the consumed seam under bypass (rendering `rmsMean` 0.06–0.07, ×10–55 baseline, `signal` ≈103/103) · ZERO near-silence callbacks in any stream · frozen rows 7 PASS-06 / 2 UNMEASURED / 1 FAIL-06 (row 1 = reader boundary: input window stamped at the exact ms of `stream_complete`; C-D22 candidate, row unchanged) · reading = processor-dependent suppression strongly supported, B not supported · transport deviation preserved · authority SPENT · adjudication owed; S2 held.

### 10.16 FOUNDER ADJUDICATION of S1 (discriminator plan §10): S1 ACCEPTED (processor-dependent suppression; A vs A′ = S2's question) · transport deviation ACCEPTED · C-D22 ACCEPTED → correction DONE offline (reader boundary rule; synthetic case FAIL-06 on `8b111709b` → PASS-06 now; corpus replay moves exactly S1 row 1; successor recorded separately; gate 66/66) · C-D23 ACCEPTED, enumeration at its limit → structural corpus-partition CENSUS OWED (read-only) before S2 evidence lands · Mac playback-capability CENSUS OPEN (read-only, no sound) · S2 implementation HELD · S3 not open.

### 10.17 Corpus-partition census RETURNED (`KERNEL-00_CORPUS_PARTITION_CENSUS_2026-09-15.md`: H header ∧ C signature agree on all 548 journals; P-H and P-C each reproduce the current buckets 50/30/468; structural rule recommended, implementation NOT authorized) · Mac playback-capability probe PINNED (`scripts/witness/k00-playback-probe.sh`, read-only, no sound; gate 67/67; invocation in discriminator plan §12), NOT RUN · S2 HELD · S3 not open.

### 10.18 Mac playback probe RETURNED + READ (discriminator plan §13; seal `fc14fd50…` verified, 37 files, no sound/volume/device change): `afplay` established as the S2 player (`-v`, `-t`; plays to the *default audio output*); **current default output = `B06Ultra` (Bluetooth), system default = Mac Studio Speakers; no CLI selector installed → S2 output source UNRESOLVED, founder favours a separate preparation act (Mac Studio Speakers as default), NOT authorized** · corpus-partition rule RATIFIED → gate-only structural partition IMPLEMENTED (H ∧ C membership, fail-closed with named evidence, sets exactly 50/30/468, produced-ledger reproduction row-for-row over 15 ledgered directories, flood shape detected structurally with the C-D6 delta pinned; no directory named; gate 67/67) · S2 implementation HELD · S2 witness NOT AUTHORIZED · S3 not open.

### 10.19 FOUNDER RULING — S2 physical source = Mac Studio Speakers (RULED; `afplay` plays to the default output, which is `B06Ultra`/Bluetooth today) · OUTPUT-SOURCE PREPARATION ACT OPEN (founder macOS UI act: before-read → Control Center → Sound → Output → Mac Studio Speakers → after-read; exactly one selection; no sound/volume/unpair/utility/input/sample-rate/iPhone change; PASS = exactly one `DEFAULT_OUTPUT` line, `Mac Studio Speakers`, `coreaudio_device_type_builtin`, flag True; else STOP) — sequence, parser (verified here against the probe JSON) and return path pinned in discriminator plan §14 · S2 design direction FIXED (afplay · Mac Studio Speakers · SHA-pinned steady stimulus distinct from 440 Hz · batch-only · per-sample custody incl. PID-alive proof and pre-population device identity) but NOT live · a PASS authorizes nothing downstream; S2 design authority is a separate act · S2 implementation HELD · S2 witness NOT AUTHORIZED · S3 not open.

### 10.20 OUTPUT-SOURCE PREPARATION PASS (discriminator plan §14.9; evidence `8a3ca8fda` cherry-picked; four hashes recomputed = seal; parser run here: before `B06Ultra bluetooth 44100`, after **`Mac Studio Speakers coreaudio_device_type_builtin 48000`, one line, flag True, B06Ultra present not default**; volume 25→69 custody only; a Continuity input entry vanished between reads, recorded) · S2 physical chain now has a named speaker · next boundary = the founder's separate S2 batch-only design authority (NOT opened) · S2 implementation HELD · S2 witness NOT AUTHORIZED · S3 not open.

### 10.21 S2 BATCH-ONLY IMPLEMENTATION LANDED (founder ruling 2026-09-15; discriminator plan §15) at **`b198e2e37058f2e059d986b4b148e224215f3ee3`**, gate **75/75**: tracked fixture `scripts/witness/fixtures/k00-s2-nearend-997hz-180s.wav` (997 Hz · 180.000 s · mono · 48 kHz · PCM16 · peak 0.20 FS; **SHA `1a505b3d…`** pinned in sidecar · batch · gate; generated offline, never played) · `/usr/bin/afplay -v 0.50 -t 180` (binary SHA `88f3b577…` = census pin, a precondition) around the `run_test` seam (1 s settle · alive/non-zombie proof · 1 s liveness · explicit TERM/wait · exit status · custody VALID|INVALID in `stimulus-sample-N.tsv`) · read-only Mac preflight STOPs before playback unless exactly one default output = Mac Studio Speakers/builtin, volume 69, unmuted, fixture + afplay SHAs match · `--stimulus s2-nearend` the only token, lawful only with `--act output --vp on --mode L --subject vpio-02` · historical batch path byte-preserved (gate-proven) · readers/reinstall/driver/organism frozen · offline shims exercised every refusal and STOP clause (no player exists here). **Opens nothing:** playback NOT AUTHORIZED · S2 population NOT AUTHORIZED (separate witness authority after the founder reads the two SHAs) · S3 not open · KERNEL-00 NOT ACCEPTED.

### 10.22 `S2-WITNESS-01` GRANTED, BOUNDED (founder; discriminator plan §16): one witness of the landed orchestration `b198e2e37` on the real Mac Studio — Block A (fresh worktree at the exact SHA · tree clean · gate 75/75 · fixture SHA `1a505b3d…` · `/usr/bin/afplay` SHA `88f3b577…` · no pre-existing afplay) → Block B read-only device preflight (§10.10 law) → Block C exactly one invocation `k00-driver-batch.sh S2-WITNESS-01 1 --act output --cancel-at 1000 --settle 2 --vp on --mode L --subject vpio-02 --stimulus s2-nearend` (the batch's own stimulus preflight STOPs inside it; playback permitted ONLY as this witness's instrument) → Block D read-only post-read + seal; predeclared PASS/STOP law (§16.4: preflight PASS · five preflight files · complete `stimulus-sample-1.tsv` with all-alive liveness spanning `run_test`, `custody VALID`, stop before the 180 s failsafe · no afplay before/after · one ledger row + one journal · pipeline rc 0). The sample-1 journal is witness evidence, never an S2 row; its §7 reading is not performed. PASS ≠ S2 population · ≠ S3 · ≠ KERNEL-00 acceptance. Mac act, NOT YET EXECUTED; evidence owed on `feature/*`.

### 10.23 `S2-WITNESS-01` EXECUTED → STOP (discriminator plan §17; evidence `3cbec915b` cherry-picked `706dc4cf2`, eleven files hashed here): Blocks A and B PASSED every pinned line on the real Mac (HEAD `b198e2e37` · tree clean · gate 75/75 · fixture SHA · `/usr/bin/afplay` SHA = census · no afplay before · surface diff 0 · container present · harness 0); Block C built the driver, then the batch's stimulus preflight PASSED fixture SHA, exact format and **exactly one default output = Mac Studio Speakers/builtin**, then **STOPPED on `output volume:31` ≠ ruled 69 (exit 8) — nothing played, nothing sampled, no journal, no `stimulus-sample-1.tsv`**; Block D not run; no repair, no rerun. Adjudication §16.4: **STOP · witness NOT PASS · authority SPENT**; the fail-closed branch of the orchestration is witnessed once on the real Mac. Volume drift 69 (02:23Z) → 31 (12:28Z) with no governed act touching it: cause UNKNOWN, not inferred. Returned for ruling: keep 69 (needs a founder-performed re-preparation act) vs re-rule the precondition (new SHA) · characterise the drift read-only · whether an `S2-WITNESS-02` authority is issued. S2 population · S3 · KERNEL-00 acceptance CLOSED.

### 10.24 FOUNDER RULING on the S2-WITNESS-01 STOP (discriminator plan §18): **69 STAYS** (31 = the prepared state did not persist, cause UNKNOWN; a successful refusal is not pressure to weaken the refusal) · **`S2-VOLUME-DRIFT-01` OPEN, read-only** — repository half DONE here (no volume-mutation code anywhere in scripts/ios/tests; the only osascript calls are the two governed reads + an unrelated notification; readings 25 → 25 → 69 → 31, device state property-identical between 02:23Z and 12:28Z, only the scalar moved) · Mac half = `scripts/witness/k00-volume-drift-census.sh` (`302b7bc4745e6ba59eb9ba3dff7e913bc7de244b`, gate 76/76: volume · audio + Bluetooth JSON · boot/sleep/wake history · audio preference domains discovered then `defaults read` · process list · one default-level `log show` window kept off-repo; manifest + seal; no set/select/play/signal/preference-write/phone/batch verb), invocation pinned, NOT RUN · restoration = founder read → hand → read act (instrument may never SET) · `S2-WITNESS-02` NOT ISSUED (opens as its own act only after census → restoration if 69 stands → post-hand read; may reuse `b198e2e37` if the batch is unchanged) · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### 10.25 `S2-VOLUME-DRIFT-01` Mac half EXECUTED and READ HERE (discriminator plan §18.4; evidence `7447a6b1d` cherry-picked `edb138f70`, 36 files, seal `e3dbc8f1…` and every hash recomputed here; `K00_DRIFT_LOG_LAST=16h`, raw 34 692-line window off-repo sha `cd3c5bd6…`; manifest flags volumeSet/deviceSelected/soundPlayed/phoneTouched/preferencesWritten all false): volume still 31 at 12:51Z, Mac Studio Speakers still default, no reboot/sleep; retained coreaudio entries begin only at 07:08 local, so the 02:23Z preparation act is a coverage gap, not evidence. **Reading: CANDIDATE MECHANISM.** A System Settings → Sound session opened 07:25:23 local (11:25Z, still open at capture); at **07:25:48 local the default output device changed** (HAL notification in Messages + Camo Studio; ControlCenter's system-volume target id `4e5 → 7f`; coreaudiod's 18-hour B06Ultra output context turned off at the same second) — end state the same device name, re-selection vs re-creation not determinable (UIDs redacted); then **fourteen `coreaudiod LogVolumeChangeForServerSideControl` writes on control id 138, 07:32:18–07:56:59 local**, each coincident with the Sound pane's `playVolumeKeyFeedback` (34 firings to 08:46; last before the 08:28 witness at 08:21:53), values `<private>`. No line writes 31, none names 69; no other volume-writing path in the window; actor recorded as a person-shaped desktop session, not inferred. Ruling unchanged: **69 stays · restoration = founder read → hand → read (NOT YET PERFORMED) · `S2-WITNESS-02` NOT ISSUED · S2 population · S3 · KERNEL-00 acceptance CLOSED.** Conduct note only (no instrument change): restore minutes before invocation with the Sound pane closed; the batch preflight already refuses drift.

### 10.26 FOUNDER RULING on §10.25 (discriminator plan §18.5): **`S2-VOLUME-DRIFT-01` CLOSED · candidate mechanism** (not cause found, not unknown: the 07:25:48 default-output transition + the server-side volume writes inside the active Sound session move it beyond unknown; redacted values forbid naming which event produced 31) · **`S2-VOLUME-RESTORE-01` AUTHORIZED** — founder read → hand → read shaped by §14: close System Settings / Sound first · short settling interval · machine READ device + volume · founder SETS 69 by hand · machine READ again · both reads + timestamps preserved · evidence on `feature/*`; NOT authorized: instrument sets volume · playback · `run_test` · phone invocation · S2 sample · `S2-WITNESS-02` · batch modification; acceptance = `Mac Studio Speakers` · `builtin` · `69` · `muted false`, else STOP with no further adjusting under the same act; the Sound-pane-closed conduct note = execution discipline, not an instrument requirement. Sequence pinned in §18.5.2 (reads only + the one hand act; §14.2 parser extended with `OUTPUT_VOLUME` / `OUTPUT_MUTED` / `RESTORE_ACCEPTANCE`), evidence → `driver-ledger/s2-volume-restore-<stamp>/`. Standing: 69 RULED · restoration NOT YET EXECUTED · `S2-WITNESS-02` NOT ISSUED (its own authority after the restoration evidence returns) · `b198e2e37` reusable if the batch is byte-unchanged · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### 10.27 `S2-VOLUME-RESTORE-01` EXECUTED → STOP (discriminator plan §18.6; evidence `47ba68d30` cherry-picked `a8dad7942`, nine hashes = seal = the founder's list; parser reproduced here): first attempt `20260915T132000Z` blocked at the hand boundary (§18.5.5–18.5.7; kept as custody, never paired); fresh stamp `20260915T134328Z` — Step 0 pane closed `rc=1` · before 13:43:28Z volume 44 · one hand act via the Sound slider · after 13:46:03Z **volume 73**, pane open (new instance; explained by the act, not the criterion), device state byte-identical (Mac Studio Speakers / builtin / unmuted) → **`RESTORE_ACCEPTANCE STOP` (73 ≠ 69) · authority SPENT**. Founder-disclosed: a later adjustment after the after-read, outside the act, unread → current volume UNKNOWN to the record; leave the volume alone. Flagged inference only (§18.6.4): the accepted 69 and the readings 25/31/44 are all sixteenth-step values of the keyboard volume keys (11/16 = 68.75 → 69), 73 is not — a stepped-control hand act may reach the exact reported integer the preflight compares; band vs exact vs stepped control = founder decision (a band = new orchestration SHA). Standing: 69 RULED · restoration re-open needs a fresh authority · `S2-WITNESS-02` NOT ISSUED · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### 10.28 FOUNDER RULING on §10.27 (discriminator plan §18.7): precondition stays **exact 69** · band NOT ADOPTED · `b198e2e37` unchanged · the sixteenth-step inference justifies a different human control, not a new target (the slider lands between keyboard steps; 69 is not shown inappropriate) · **`S2-VOLUME-RESTORE-02` AUTHORIZED** as a fresh act (RESTORE-01 stays STOP · spent): close the Sound pane by hand → settle → fresh Step 0 + Step 1 under a new stamp (current volume UNKNOWN until read) → the ONE hand act = keyboard Volume Down to the bottom/zero state, then Volume Up exactly 11 times, stop → after-read + unchanged parser; no slider, no scripted keys, no `osascript`, no device selection, no test playback, no twelfth press, no correction after the after-read, no retry under the same authority; PASS = the unchanged §18.5.3 condition with `OUTPUT_VOLUME 69`, else STOP and rule again; eleven presses are tested once, not assumed. Sequence pinned §18.7.2; evidence → `driver-ledger/s2-volume-restore-02-<stamp>/`. Standing: `S2-WITNESS-02` NOT ISSUED · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### 10.29 `S2-VOLUME-RESTORE-02` EXECUTED → **PASS** (discriminator plan §18.8; evidence `988628e0d` on `001970366`, cherry-picked `8b8c8f299`; nine hashes = seal = the founder's list; parser reproduced here): pane closed `rc=1` at both reads · before 13:59:19Z volume 65 (first governed read after the §18.6 post-act adjustment; off-grid, custody only) · the one hand act = keyboard Volume Down to zero, Volume Up exactly eleven times · after 14:05:42Z **volume 69** · device state byte-identical (Mac Studio Speakers / builtin / unmuted) → **`RESTORE_ACCEPTANCE PASS` · authority SPENT · 69 RESTORED at 14:05:42Z**. The stepped-control mechanism is supported by one observation (n = 1, this Mac): eleven sixteenth-steps reached the exact reported integer the batch preflight compares, where the slider reached 73; procedure of record for any future restoration, reproducibility unmeasured. Nothing in the instrument moved (`b198e2e37` unchanged, target exact, band not adopted). Standing: `S2-WITNESS-02` NOT ISSUED (its own founder authority; §16 shape is the template) · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### 10.30 `S2-WITNESS-02` ISSUED (discriminator plan §18.9: one act on unchanged `b198e2e37`, §16 Blocks A–D with three literal substitutions, §16.4 law unchanged; conduct rule = Block C by 14:35:42Z · Sound pane closed · volume/device untouched · fresh Step 0 before Block C; pinned `24f111302` at 14:15:48Z) → **LAPSED UNSPENT** (§18.10): the conduct-rule clock read 14:52:19Z; Blocks A–D not executed, no batch, no ledger/preflight/out files, no S2 row, volume/device/pane untouched, no hurry or later clock substituted. Not STOP, not failure; nothing witnessed; the §18.9.2 pin stays valid text for a fresh issuance. Observation only: the ruling → pin → preparation loop consumed the window anchored to the 14:05:42Z restoration read; anchoring a fresh window to a new pre-Block-C read, or pairing restoration and witness, is the founder's call. Standing: 69 last read 14:05:42Z · `b198e2e37` unchanged · next move = a fresh issuance/custody act · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### 10.31 `S2-WITNESS-02` residue READ (discriminator plan §18.10.2–§18.11.1): worktree `k0506-s2w2-b198e2e37` + four `s2w2-block*.sh` + `blockA.out` (14:18Z) + `blockB.out` (14:19Z) + preflight dir `S2-WITNESS-02-preflight-20260915T141935Z`; no transcript, no `blockC/D.out`, no ledger dir, no afplay/batch process at 14:55:27Z → predeclared case 2: the interrupted lane ran the read-only Blocks A–B under the still-live issuance, died before Block C; **batch never started, nothing played, no S2 row**; §18.10 corrected beside the original. **FOUNDER RULING → `S2-WITNESS-03` AUTHORIZED** (§18.11.2): residue preserved, never removed/reused/executed · new path token `/private/tmp/k0506-s2w3-b198e2e37` + `s2w3-block*` · freshness anchored to a fresh governed volume read immediately before Block C (14:05:42Z = historical only; no fresh read, no Block C; batch preflight drift refusal still operative) · §18.9.2 reusable with exactly the run/path-token substitutions, proof by diff · pre-Block-C conduct = volume read · `date -u` · `pgrep` · no process · `output volume:69`/`muted:false` · `READ OK` is a precondition, never a trigger. Pinned §18.11.3; NOT YET EXECUTED. Standing: RESTORE-02 PASS · spent · WITNESS-02 lapsed unspent · `b198e2e37` unchanged · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### §10.32 — `S2-WITNESS-03` EXECUTED → STOP BEFORE BLOCK C (2026-09-15; discriminator plan §18.12)

Evidence `e85a39dae` (`feature/k00-s2-witness-03-stop-evidence-20260915T150551Z`) → cherry-pick `05bbccc80`; `SHA256SUMS.stop` 11/11 OK here; block hashes A `ee17183f…` · B `2dce2db8…` · C `82f3c6be…` · D `c682e8aa…` = founder's; substitution diffs carry only the three pinned tokens; path did not pre-exist. Block A PASS (HEAD `b198e2e37` · clean · gate 75/75 · fixture + afplay SHAs = pins · no afplay before) · Block B PASS (`S2-WITNESS-03-preflight-20260915T150524Z`: diff rc 0 · other batches 0 · `E3B88028` ×1 · harness 0). **Pre-Block-C read 15:05:51Z: `output volume:38` ≠ 69, muted false, pane closed (`[pgrep rc=1]`) → STOP** exactly as §18.11.3 pinned; Block C/D NOT RUN · playback NONE · no transcript/ledger/S2 row by design · authority SPENT. Second drift 69 (14:05:42Z) → 38 (15:05:51Z), pane closed both ends, no governed volume act between: cause/actor UNKNOWN, not inferred (38 on the sixteenth-step grid — inference only, identifies nobody). Founder attestation verbatim in §18.12.3. Returned: STOP acceptance · drift disposition (bounded second census vs re-prepare-before-use) · whether a paired `S2-VOLUME-RESTORE-03` + `S2-WITNESS-04` issuance is made (minutes-scale window, `s2w4` token, residue preserved). Standing: WITNESS-03 STOP · spent · `b198e2e37` unchanged · nothing issued · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### §10.33 — FOUNDER RULING on §18.12 (2026-09-15; discriminator plan §18.13): WITNESS-03 ACCEPTED · second drift census NOT OPENED · `S2-RESTORE/WITNESS-04` AUTHORIZED AS ONE PAIRED CUSTODY

`S2-WITNESS-03` accepted exactly as adjudicated (STOP before Block C, spent); 69 target unchanged; cause of 69 → 38 UNKNOWN, no further mechanism required for progress; second census ⛔ not opened (*output volume is volatile state on this Mac* is the operational fact; another census would not change the witness design). The lesson: do not depend on 69 persisting while preparation consumes time → all slow preparation before the hand. Paired act pinned §18.13.3 (token `s2w4`, path `/private/tmp/k0506-s2w4-b198e2e37`, blocks = `17b4df63b` §16 with three literal substitutions, diff-proven, no pre-existing path): Block A → Block B → pane closed / no competing process → RESTORE-03 before-read → the one hand act (Volume Down to zero, Up ×11) → **immediate governed after-read = the joint** (§18.5.2 parser: Mac Studio Speakers · builtin · `OUTPUT_VOLUME 69` · `OUTPUT_MUTED false` · `RESTORE_ACCEPTANCE PASS` · pane `rc=1`) → PASS: Block C is the very next act, then Block D on rc 0; FAIL or interruption after the read: STOP, no correction/retry, authority spent. Boundary ordinal, not a clock; nothing (seal · commit · push · note · deliberation) may intervene between the accepted joint read and Block C. `b198e2e37` unchanged; batch's own preflight still refuses drift inside Block C; WITNESS-02/03 residue preserved; sample-1 journal never an S2 row. Evidence → `driver-ledger/s2-restore-witness-04-<stamp>/` + the §16.7 return with `04` substitutions → §18.14. NOT YET EXECUTED. S2 population · S3 · KERNEL-00 acceptance CLOSED.

### §10.34 — `S2-RESTORE/WITNESS-04` EXECUTED → STOP IN BLOCK B (2026-09-15; discriminator plan §18.14)

Evidence `83b7fe3d2` (`feature/k00-s2-restore-witness-04-stop-evidence-20260915T152805Z`) → cherry-pick `f33bff911`; `SHA256SUMS.stop` 7/7 OK here; block hashes A `8bebb636…` · B `e8ead651…` · C `fefcec89…` · D `4752ac25…` = founder's; substitution diffs carry only the three pinned tokens; `s2w4` path did not pre-exist. Block A PASS every line (third clean pass on `b198e2e37`). Block B: `PREFLIGHT_DIFF_RC=0` · `OTHER_BATCHES=0` → the apps read failed with `com.apple.dt.CoreDeviceError 4000 — The device disconnected immediately after connecting` · `APPS_READ_RC=1` · `STOP: apps listing unreadable` (the block's own fail-closed line). RESTORE-03 NOT STARTED · hand act NOT REACHED · joint NOT REACHED · Block C/D NOT RUN · playback NONE · S2 row NONE · authority SPENT. No volume operation or restoration read occurred; 69 untested by this act (last governed read 38 at 15:05:51Z). Device-preflight transport failure at the Mac ↔ iPhone seam; cause NOT INFERRED (founder and record). Classified infrastructure, not sample, not physiology; no repair/rerun under the spent authority. Returned: STOP acceptance · whether a fresh paired issuance (`s2w5`, same pin, `b198e2e37` unchanged) is made, or a read-only device-availability act first (named, not proposed). Standing: WITNESS-04 STOP · spent · `b198e2e37` unchanged · nothing issued · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### §10.35 — FOUNDER RULING on §18.14 (2026-09-15; discriminator plan §18.15): WITNESS-04 ACCEPTED · device-availability act NOT OPENED · `S2-RESTORE/WITNESS-05` AUTHORIZED

`S2-RESTORE/WITNESS-04` accepted exactly as adjudicated (STOP in Block B · spent; establishes only that the Mac → iPhone apps-read seam was unavailable during that act; RESTORE-03 never entered; the §18.13 ordinal boundary unexercised and unchanged). Separate device-availability act ⛔ NOT OPENED: Block B already occupies the correct architectural position (tests the device seam at the last responsible moment before the hand and refuses if unavailable); an earlier census would not establish availability when the paired custody needs it — *a transient failure of a lawful boundary is reason to approach that boundary again under fresh authority, not reason to route around it.* `S2-RESTORE/WITNESS-05` AUTHORIZED as one paired custody: §18.13.3 unchanged except the fresh tokens (`S2-WITNESS-04→05` · `s2-witness-04→05` · `s2w4→s2w5` · path `/private/tmp/k0506-s2w5-b198e2e37`), blocks re-extracted from `17b4df63b` and substitution-proved; same stages, joint condition, failure law (Block A/B STOP spends before restoration · joint FAIL → STOP, no correction/retry · interruption after an accepted read → STOP · Block C's own preflight refusal = evidence, no rerun · nothing weakens 69 / modifies `b198e2e37` / bypasses a failed boundary); WITNESS-02/03/04 residue preserved. Pin §18.15.2 (Stage 0 reproduced with `s2w5`; Stages 1–7 = §18.13.3 with the token). NOT YET EXECUTED; evidence → `s2-restore-witness-05-<stamp>/` + §16.7 return → §18.16. S2 population · S3 · KERNEL-00 acceptance CLOSED.

### §10.36 — `S2-RESTORE/WITNESS-05` EXECUTED → JOINT PASS → BLOCK C PASS → BLOCK D COMPLETED (2026-09-15; discriminator plan §18.16)

Evidence `36bfde4e6` (`feature/k00-s2-restore-witness-05-evidence-20260915T154626Z`) → cherry-pick `041b892c0`; `SHA256SUMS.witness` **12/12 OK here**. Restoration half (founder-relayed, NOT in custody here — the remote safety layer refused post-execution packaging writes, not bypassed; raw evidence intact at `/private/tmp/k00-s2-volume-restore-03-20260915T154626Z`, seal 9/9 founder-verified): before 15:46:26Z volume 38 → one keyboard act → joint 15:49:23Z **69 · unmuted · Mac Studio Speakers · builtin · `RESTORE_ACCEPTANCE PASS` · pane rc=1** → FOUNDER-ATTESTED PASS, custody OWED (second exact-integer stepped-control observation, n = 2). Ordinal joint HONOURED (Block C the very next shell act). Witness half §16.4 PASS on every committed line: stimulus preflight PASS (fixture + afplay SHAs = pins · format EXACT · one default output Mac Studio Speakers/builtin · **volume 69** at 15:49:59Z) · `stimulus-sample-1.tsv` complete (82 rows; pid 94754; 67 liveness rows all `alive`, 69 s, no gap > 2 s, spanning `testOutputSample` 28.9 s) · `custody VALID` · stopped at 71 s (`waitExitStatus 143` = batch TERM) · one row + one journal · `BATCH_PIPELINE_RC=0` (relayed) · afplay 0 before/after (relayed; Block A/D outputs not packaged; Block D ran once, `tee` rejected, not rerun). Classifier + output reader reproduced byte-for-byte here (`K00-fb8793df` gen-1 listen, 14-step VPIO-02, cold, listening 397 ms, held 19 s; K00-05 rows PASS-05; K00-06/COUPLING UNMEASURED-06 — sample 1 is never an S2 row, no §7 reading). **First complete passage of the S2 orchestration on the real Mac.** Authority SPENT. Returned: acceptance · custody of the restoration half + block outputs by a lawful packaging path (re-hash here; nothing rerun) · whether the S2 population (`K00-0506-S2 10 … --stimulus s2-nearend`) is issued (separate authority; named, not proposed). S3 NOT OPEN · KERNEL-00 acceptance CLOSED.

### §10.37 — FOUNDER RULING on §18.16 (2026-09-15; discriminator plan §18.17): WITNESS-05 ACCEPTED · `S2-WITNESS-05-CUSTODY-COMPLETE-01` AUTHORIZED, custody only · C-D24 ACCEPTED · S2 population NOT YET ISSUED

`S2-RESTORE/WITNESS-05` ACCEPTED as read (first complete passage of the S2 orchestration on the real Mac; the missing repository copy of the restoration captures is custody incompleteness, not a defect, no downgrade). Restoration standing = two carriers never merged: repository-verifiable (the batch's own preflight at 15:49:59Z: 69 · unmuted · Mac Studio Speakers · builtin) + founder-attested/local (RESTORE-03 captures before 38 → after 69, parser PASS, pane rc=1, `SHA256SUMS` 9/9 at the Mac), upgradable only by custody transfer, never described as rerun. **`S2-WITNESS-05-CUSTODY-COMPLETE-01` AUTHORIZED, custody only:** byte-for-byte copy of the eleven already-existing files (nine captures · `SHA256SUMS` · `parser.txt`) from `/private/tmp/k00-s2-volume-restore-03-20260915T154626Z/` into `driver-ledger/s2-restore-witness-05-20260915T154626Z/`; originals untouched; seal 9/9 verified before AND after the copy, mismatch = STOP; the §18.5.2 parser may be re-executed on the copied after-captures and compared with `parser.txt` (derivation check, not a rerun); a derived `JOINT.txt` may be created only self-identified (`DERIVED_DURING_CUSTODY_COMPLETION true · ORIGINAL_JOINT_FILE absent — packaging write refused after execution`); `s2w5-block[ABC].out` copied if they exist; **`s2w5-blockD.out` never manufactured** — founder's custody note verbatim in the carrier ("Block D executed once. The tee carrier was refused by the remote safety layer. No original s2w5-blockD.out exists. Block D was not rerun to manufacture one. Its produced repository artifacts and SHA256SUMS.witness are the evidence of that act."); Stage-0 material displayed but never written = attested/derived, not original. NOT authorized: volume change · keyboard act · device selection · playback · `run_test` · batch · new S2 sample · new restoration/witness read · regeneration of missing evidence · modification of `b198e2e37`. Pin §18.17.2 (fresh `feature/*` worktree from the lane tip; source read only; `SHA256SUMS.custody` + `RETURN.txt`; return → §18.18). C-D24 ACCEPTED as gate maintenance (the cardinality-vs-integrity design question deserves a later ruling, not opened). **S2 population NOT YET ISSUED** — prerequisite met; after the carrier returns and the 9/9 seal recomputes here, the programme returns for an explicit issuance ruling; authority does not arise automatically. Founder: *"The experiment is complete. The evidence transfer is not. Custody may complete the carrier; custody may not recreate the act."* S3 · KERNEL-00 acceptance CLOSED.

### §10.38 — `S2-WITNESS-05-CUSTODY-COMPLETE-01` EXECUTED → custody PASS · STOP AT THE COMMIT TRANSPORT (2026-09-15; discriminator plan §18.18)

Stages 0–5 of §18.17.2 passed on the Mac (founder-relayed; nothing received here): source seal 9/9 before the copy · destination seal 9/9 after · eleven files byte-identical · parser derivation `DIFF_RC=0` · `JOINT.txt` self-identified derived · `s2w5-block[ABC].out` copied · Block D absent as attested, note written verbatim · `SHA256SUMS.custody` + `RETURN.txt` produced · no device/volume/playback/batch/witness act. Then the governance pre-commit refused (`repository dependencies are not installed … Governance hooks never download dependencies at hook time`) because the fresh worktree has no `node_modules`; the lane did not install, bypass, amend or retry. The Stage-5 block lacked `set -e`, so the push ran after the refused commit and created `feature/k00-s2-witness-05-custody-complete-20260915T163124Z` on the remote at the carrier base `a5e874aa2` only — no custody commit anywhere; the staged carrier is intact in `/private/tmp/k00-s2w5-custody-20260915T163124Z`. **C-D25** = this session's pin defect (the dependency link that §16 Block A and the §18.4 census already exercised was omitted; no `set -e`); pin preserved, transport pin for the precedented shape written beside it (§18.18.4), valid only on a founder ruling naming it. Returned: commit-transport ruling only — (1) link `/Users/soullab/MAIA-SOVEREIGN/node_modules` into the same worktree and commit/push the already-staged carrier (precedented) · (2) `npm ci` (not precedented; the hook message is not authority) · (3) hold; no new stamp/worktree/re-copy under any shape. Evidence standing unchanged; S2 population NOT AUTHORIZED · S3 · KERNEL-00 acceptance CLOSED.

### §10.39 — `S2-WITNESS-05-CUSTODY-COMPLETE-01` TRANSPORT COMPLETE → carrier VERIFIED HERE · WITNESS-05 restoration half REPOSITORY-VERIFIED (2026-09-15; discriminator plan §18.19)

Founder ruled the precedented transport (§18.18.4: link the main checkout's `node_modules`, commit and push the already-staged carrier; `STAGED_CARRIER_ONLY true`, no `npm ci`/new worktree/re-copy/device act). Commit `34bdfbb91` on `feature/k00-s2-witness-05-custody-complete-20260915T163124Z` (parent `a5e874aa2`) → cherry-picked `e6af62b18`; 24 files. Verified here: `SHA256SUMS.custody` 22/22 · RESTORE-03 `SHA256SUMS` 9/9 · founder's pasted list = committed = recomputed · §18.5.2 parser re-executed on the copied captures → `Mac Studio Speakers · builtin · 69 · unmuted · RESTORE_ACCEPTANCE PASS`, byte-equal to `parser.txt` (before-captures → 38 · STOP) · `15:46:26Z → 15:49:23Z` · pane `rc=1` both · `audio-before.json` ≡ `audio-after.json` (only the scalar moved) · `JOINT.txt` self-identified derived (16:33:57Z) · Block-D note verbatim, no `blockD.out` · **Stage-0 blocks reproduced here from `17b4df63b` + the three §18.15.2 substitutions = the custody-time hashes exactly** (`4c0c7f4d…` · `918b0323…` · `3eab254f…` · `e30277f5…`) · `s2w5-blockA/B/C.out` in custody (`AFPLAY_PROCESSES_BEFORE=0` · `GATE_75_75=1` · `E3B88028` ×1 · harness 0 · `BATCH_PIPELINE_RC=0`); Block D's after-read stays attested. Gate 76/76 on the cherry-pick (no journal/ledger in the directory). C-D26 candidate (record-only): `${PIPESTATUS[0]}` printed empty under zsh in every `.out`; exit evidence carried by each block's own last line. **Reading: CUSTODY-COMPLETE-01 COMPLETE · WITNESS-05 restoration half FOUNDER-ATTESTED → REPOSITORY-VERIFIED PASS (§18.5.3) by custody transfer, never rerun · the §18.17 item-6 precondition for an S2-population issuance is met · nothing opened.** Returned: acceptance · C-D26 · the separate S2-population issuance ruling. S3 · KERNEL-00 acceptance CLOSED.

### §10.40 — FOUNDER RULING on §18.19 (2026-09-15; discriminator plan §18.20): §18.19 ACCEPTED · C-D26 non-blocking · **S2 POPULATION AUTHORIZED** → pinned as `K00-0506-S2`, NOT YET EXECUTED

§18.19 accepted as written (WITNESS-05 stands wholly on committed evidence; restoration half repository-verified by custody transfer, nothing rerun; the two committed clocks are custody of the sequence, not a replacement for the ordinal law). C-D26 accepted as a transport/observability defect of the §16.7 outer wrapper only (zsh has no `PIPESTATUS`); experiment, block bodies and evidence unaffected; OPEN as a maintenance candidate, repair NOT authorized here, not a population blocker. **S2 population AUTHORIZED** — strictly the existing §15 invocation (`k00-driver-batch.sh K00-0506-S2 10 --act output --cancel-at 1000 --settle 2 --vp on --mode L --subject vpio-02 --stimulus s2-nearend` on unchanged `b198e2e37`) under the existing §7.2/§7.3 reading law (A / A′ / UNMEASURED / CHARACTERIZE per invocation; frozen K00-05/06 rows beside, never pooled; sample-1 witness journal outside the population); "acquisition ≠ interpretation · presence ≠ significance · one sample ≠ pattern · population ≠ acceptance"; the population may be null, ambiguous or counter-hypothesis. NOT authorized: S3 · KERNEL-00 acceptance · new orchestration/stimulus/volume target/witness architecture · C-D26 repair · residue cleanup · reinterpretation of prior samples. Pin §18.20.3: §16 Blocks A/B/C with four token substitutions (diff-proven, hashes fixed) · governed pre-Block-C volume read (69/unmuted/pane closed else STOP, nothing invoked; no restoration inside this authority — a paired issuance would be a separate §18.13.3-shaped ruling) · one Block C · population post-read `Dpop` (globs over ten samples, `SHA256SUMS.population`) · §16.7 transport unchanged. Return on `feature/*` → §18.21 (seal recomputed, classifier + output reader rerun, §7 reading per row; corpus-partition pins expected to move by ten, maintained as C-D24 species). Founder: *"The witness proved the path. The population may now use the path. What the population means remains governed by the reading law, not by the success of the witness."* S3 · KERNEL-00 acceptance CLOSED.

### §10.41 — `K00-0506-S2` POPULATION ACT → STOP IN BLOCK B (two foreign `VoiceKernelHarness` processes; 2026-09-15; discriminator plan §18.21)

Evidence `e128037428be61a820659d5e43d3f41c0a2e9ad9` (`feature/k00-s2-population-stop-evidence-20260915T170040Z`) → cherry-picked; `SHA256SUMS.stop` 8/8 here; the four block hashes = §18.20.3 = recomputed here; Stage-0 diffs = the four tokens only. Block A PASS (fourth clean pass on `b198e2e37`; `AFPLAY_PROCESSES_BEFORE=0`) · **Block B STOP: `E3B88028` ×1 (the `.vpio02` install intact, no process) but `VoiceKernelHarness processes: 2`** → pre-C read · Block C · `Dpop` NOT RUN · population NOT invoked · playback NONE · S2 rows NONE. Identified from the committed `processes.json` against the reinstall records: **PID 2098 = the R1 `.k00` install (`0B07D423…`, `reinstall-20260914T011754Z.txt`) · PID 2099 = the frozen `.vpio01` install (`6A2E406B…`, `reinstall-20260914T194554Z.txt`)** — neither the population's subject; no governed act launched either; adjacent low PIDs (prior reads all five-digit) consistent with a device restart + relaunch — inference only; **cause/actor UNKNOWN, not inferred**. Block B refused what the batch's own sample-1 precondition would have aborted as infrastructure (the driver's `testTerminateOnly` addresses `.vpio02` only). Volume UNREAD by this act (69 last committed 15:49:59Z). Returned: STOP acceptance · disposal of the two foreign processes (§10.5 C shape per subject; the `.vpio01` termination touches a frozen subject — founder's words needed) · optional read-only container reads of `6A2E406B…`/`0B07D423…` `tmp/` · population re-issuance with a fresh worktree token (`s2pop2`; pin otherwise unchanged; by the §18.15 precedent a Block-B STOP spends the act). S3 · KERNEL-00 acceptance CLOSED.

### §10.42 — FOUNDER RULING on §18.21 (2026-09-15; discriminator plan §18.22): STOP ACCEPTED · `tmp/` census NOT OPENED · `S2-FOREIGN-HARNESS-DISPOSAL-01` AUTHORIZED (termination only) · `K00-0506-S2-02` AUTHORIZED CONDITIONALLY

`K00-0506-S2` STOP accepted as read (infrastructure refusal by two live foreign harness processes: PID 2098 R1/`.k00`/`phase-a`, PID 2099 frozen `.vpio01`; `.vpio02` absent as process, intact as install; restart inference stays inference; cause/actor UNKNOWN; Block B correct). Optional container `tmp/` census NOT OPENED (a separate forensic question, not needed to restore the precondition). **`S2-FOREIGN-HARNESS-DISPOSAL-01` AUTHORIZED** = the exercised §10.5 C shape twice on the `8b111709b` signed runner — `TEST_RUNNER_K00_SUBJECT=phase-a` then `vpio-01`, one `testTerminateOnly` each — with a before-read that must show exactly the two identified containers and an after-read that must show `VoiceKernelHarness processes: 0` (Block B's surface); `.vpio01` termination only, frozen in every other respect; NOT authorized: launch · sample · reinstall · container mutation · journal · reader · stimulus · playback · volume/configuration change · escalation · kill · retry by another mechanism; a remaining process → STOP, return. **`K00-0506-S2-02` AUTHORIZED upon a clean disposal only**, as a distinct evidentiary act: §18.20.3 unchanged except the token `s2pop` → `s2pop2` (worktree `/private/tmp/k0506-s2pop2-b198e2e37`, `s2pop2-*` carrier names; label `K00-0506-S2`, N 10, `vpio-02`, `s2-nearend`, `b198e2e37`, §7 law unchanged); the spent `s2pop` worktree is residue; the pre-Block-C 69/unmuted/pane-closed read stays decisive with no restoration authority; a clean disposal or a later Block B PASS explains nothing about the earlier presence; C-D26 OPEN, no repair inside either act. Both pins (§18.22.2 disposal with its own seal/branch; §18.22.3 population with re-derived `s2pop2` block hashes) NOT YET EXECUTED. Founder: *"Remove the defect by the narrowest already-exercised act; then approach the same population boundary again without weakening it."* S3 · KERNEL-00 acceptance CLOSED.

### §10.43 — `S2-FOREIGN-HARNESS-DISPOSAL-01` EXECUTED → STOP AT STAGE 0 (2026-09-15; discriminator plan §18.23): signed runner absent · nothing invoked · `K00-0506-S2-02` condition UNMET

Evidence `939a00bbae531ff95b6f191f89f7fb54ea85f967` (`feature/k00-s2-foreign-harness-disposal-stop-20260915T171701Z`) → cherry-picked `1d95272b6`; `SHA256SUMS.disposal-stop` 3/3 here = the founder's hashes. The §18.22.2 Stage-0 precondition fired as pinned: `/private/tmp/k0506-driver-compile-8b111709b/…/DriverUITests_iphoneos26.2-arm64.xctestrun` ABSENT → `STOP: the 8b111709b signed runner xctestrun is absent — no rebuild under this authority`; `TERMINATION_INVOCATIONS 0` · `PROCESS_BEFORE_READ NOT_RUN` · `PROCESS_AFTER_READ NOT_RUN` · `DISPOSAL_ACCEPTANCE NOT_REACHED` · `POPULATION_REISSUANCE CONDITION NOT_MET`; no devicectl/xcodebuild verb, no escalation, no substitute runner. Runner absence: cause UNKNOWN, not inferred (last logged present at the §10.7 corrective termination). Foreign process state (PID 2098 R1 `.k00` · PID 2099 frozen `.vpio01`, from the Block-B read) NOT re-read; volume unread; `.vpio02`/`.vpio01`/K00/R1/organism/`b198e2e37` untouched; no S2 row. Instrument fact: `testTerminateOnly` is byte-identical (`c483528b…`) at `8b111709b` · `83a382a14` · `b198e2e37`, subject table unchanged — any signed runner from those SHAs runs the same termination against the same bundle ids. Returned for ruling, named not chosen: (a) name an already-built signed runner on record (candidate `/private/tmp/k0506-s2w5-b198e2e37/…`, most recent; presence read + xctestrun SHA at Stage 0, absent → STOP) · (b) a disposal-only signed `build-for-testing` at `b198e2e37` in a fresh worktree by the batch's own recipe as Stage −1, then §18.22.2 unchanged · (c) hold. Before-set must still equal exactly the two identified containers; after-read 0; `DISPOSAL_ACCEPTANCE PASS` alone meets the `K00-0506-S2-02` condition; the `s2pop2` pin is unaffected. S3 · KERNEL-00 acceptance CLOSED.

### §10.44 — FOUNDER RULING on §18.23 (2026-09-15; discriminator plan §18.24): DISPOSAL-01 STOP ACCEPTED · historical runner reuse NOT ADOPTED · `S2-FOREIGN-HARNESS-DISPOSAL-02` AUTHORIZED with a Stage −1 runner build

DISPOSAL-01 accepted as recorded (STOP at Stage 0 · runner absent · invocations 0 · device acts none · `NOT_REACHED` · spent; establishes runner absence only, not the foreign processes' current state; cause UNKNOWN). Option (a) NOT ADOPTED — `/private/tmp/k0506-s2w5-b198e2e37` was already observed to have ceased being a Git worktree during custody completion; a disposal authority may not depend on the accidental survival of an old `/private/tmp` product; no historical path searched as fallback. **DISPOSAL-02 AUTHORIZED** = Stage −1 (fresh detached worktree at `b198e2e37058f2e059d986b4b148e224215f3ee3`, path must not pre-exist · `xcodegen` · the batch's own driver-only signed `build-for-testing` recipe · xctestrun resolution · runner custody; NOT: test execution · launch · install · reinstall · sample · stimulus · playback · volume · organism/batch modification) → runner identity proven before any invocation (HEAD exact · runner exists · `testTerminateOnly` body SHA = `c483528b…` · subject table rows unchanged; cannot produce → STOP, no alternate build, no historical fallback, no termination) → §18.22.2 Stages 0–3 unchanged with the new `XR` (before-set exactly `0B07D423…` + `6A2E406B…` else STOP · `phase-a` then `vpio-01`, once each · after-read 0 → `DISPOSAL_ACCEPTANCE PASS`, proving only that the known foreign live state was removed). `K00-0506-S2-02` stays conditionally authorized as pinned (§18.22.3), unopened until DISPOSAL-02 PASS is committed and pushed as its own act; no restoration authority; pre-C 69/unmuted/pane-closed read decisive. Pinned §18.24.2 — Mac act, **NOT YET EXECUTED**; evidence → `driver-ledger/S2-FOREIGN-HARNESS-DISPOSAL-02-<stamp>/` → §18.25. Founder: *"Rebuilding the carrier does not reopen the design. The code being exercised is frozen; only the disposable signed runner needed to exercise it is being restored."* `b198e2e37` unchanged · C-D26 OPEN · S3 · KERNEL-00 acceptance CLOSED.

### §10.45 — `S2-FOREIGN-HARNESS-DISPOSAL-02` EXECUTED → STOP IN STAGE −1 at the runner-custody line (2026-09-15; discriminator plan §18.25): runner BUILT + IDENTIFIED · C-D27 (this session's pin) · nothing invoked

Evidence `761bef73950c6b5ef76ef80191949f75e5909267` (`feature/k00-s2-foreign-harness-disposal-02-stop-20260915T173055Z`) → cherry-picked `60269c4ed`; seal 12/12 here. Stage −1 established: HEAD `b198e2e37…` exact · `testTerminateOnly` body SHA `c483528b…` (= the git-object-database value) · subject-table rows 2 · `xcodegen` PASS · signed `build-for-testing` `** TEST BUILD SUCCEEDED **` ×1, no device/test verb · xctestrun present and hashed `3b6360f7…` (observation: byte-equal to the §10.9 readiness xctestrun from the `83a382a14` worktree; consistent with `__TESTROOT__`-relative content, not further inferred) · footprint empty. **STOP on the pinned custody line: the three bundle binaries were named relative to `Build/Products/`, but the founder's post-STOP listing shows every bundle under `Build/Products/Debug-iphoneos/`** (all three present there; the build log names the test binary at that path). The precedent line with the `Debug-iphoneos/` prefix had already run on the Mac at §10.6 and §10.9; this session wrote a fresh line instead → **C-D27, instruction defect (C-D3/C-D25 species)**; the founder stopped exactly as §18.24 item 5 requires, adapting nothing. DISPOSAL-02 STOP · spent · invocations 0 · foreign process state NOT re-read · device/volume/organism untouched · `K00-0506-S2-02` condition UNMET. Returned, named not chosen: (α) DISPOSAL-03 reusing the just-built runner behind a read-only Stage −1′ (HEAD re-read · xctestrun re-hash = `3b6360f7…` · the corrected four-file custody line; mismatch → STOP) or (β) a fresh Stage −1 in a new path with the corrected line; then §18.22.2 Stages 0–3 unchanged under both. Founder's observation preserved: the executable was successfully rebuilt; the act stopped on custody path assumptions before reaching the problem it was created to solve. `b198e2e37` unchanged · C-D26 OPEN · S3 · KERNEL-00 acceptance CLOSED.

### §10.46 — FOUNDER RULING on §18.25 (2026-09-15; discriminator plan §18.26): DISPOSAL-02 STOP ACCEPTED · C-D27 ACCEPTED · option (α) ADOPTED → `S2-FOREIGN-HARNESS-DISPOSAL-03` AUTHORIZED on the just-built runner

DISPOSAL-02 accepted as recorded (build · source identity · subject table · signed build · xctestrun all PASS; custody-path check STOP; device acts none; invocations 0; spent) — the STOP was C-D27, not a Mac/runner/design/phone-state failure. C-D27 accepted as a pin defect (`Build/Products/` vs the precedented `Build/Products/Debug-iphoneos/`; no design change). **(α) ADOPTED, (β) resisted unless α fails its identity re-read** — *the next act should consume evidence already earned, not pay again for the same build.* **DISPOSAL-03 AUTHORIZED** on the carrier `/private/tmp/k0506-disposal-b198e2e37` (identity already committed: HEAD `b198e2e37…` · `testTerminateOnly` `c483528b…` · subject rows · `TEST BUILD SUCCEEDED` · xctestrun `3b6360f7…`) behind a **read-only Stage −1′**: worktree present · HEAD exact · xctestrun present · SHA = `3b6360f7…` · the corrected four-file custody line (`Debug-iphoneos/`) succeeds with exactly four hashes; NOT authorized: rebuild · `xcodegen` · `build-for-testing` · alternate/historical runner · file repair · regeneration; any mismatch → STOP, no rebuild, no second path, no termination. Then §18.22.2 Stages 0–3 unchanged (before-set exactly `0B07D423…` + `6A2E406B…` · `phase-a` then `vpio-01` once each · `.vpio01` termination only · after-read 0 → `DISPOSAL_ACCEPTANCE PASS`, proving only absence of the known foreign live state). `K00-0506-S2-02` conditional, unopened until DISPOSAL-03 PASS is committed and pushed; no restoration authority. Pinned §18.26.2 (Stage −1′ adds a read-only driver-source-unmodified check; every other line = §18.22.2 with the act name, carrier and corrected custody line substituted) — Mac act, **NOT YET EXECUTED**; evidence → `driver-ledger/S2-FOREIGN-HARNESS-DISPOSAL-03-<stamp>/` → §18.27. Founder: *"Do not rebuild what the previous act already built and proved. Re-read its identity, correct the custody path, and continue only if the carrier is still exactly the runner already placed in custody."* `b198e2e37` unchanged · C-D26 OPEN · S3 · KERNEL-00 acceptance CLOSED.

### §10.47 — `S2-FOREIGN-HARNESS-DISPOSAL-03` STOPPED IN STAGE −1′ BY THE REMOTE EXECUTION TRANSPORT (2026-09-15; discriminator plan §18.27): no hash · no evidence carrier · nothing invoked · spent-vs-unspent RETURNED

Founder report (no bundle exists): stamp `20260915T174632Z`; the four read-only lines ran and read worktree present · HEAD `b198e2e37…` · driver source unmodified · xctestrun present (founder-attested only, no custody); the next pinned line (xctestrun SHA-256, then the corrected four-file custody line) was **refused by the remote execution safety layer**, which then also refused creating the local STOP evidence directory → no branch, no commit; the founder substituted nothing, inferred nothing, routed around nothing. Requalification NOT REACHED · process reads NOT RUN · terminations 0 · `DISPOSAL_ACCEPTANCE NOT_REACHED` · `K00-0506-S2-02` NOT OPENED · phone untouched. Classification adopted: execution-transport STOP, not a runner mismatch, not a disposal-design result; the runner's identity remains the §18.25 custody (`3b6360f7…`), neither confirmed nor contradicted; C-D27's corrected line never reached; the §18.26.2 pin text stands. Precedents on record: §18.16.5 (safety layer refused packaging writes after a completed act), §18.6 (RESTORE-01 first attempt blocked at the hand boundary, fresh stamp under the same authority), §18.10 (WITNESS-02 LAPSED UNSPENT). Returned, nothing chosen: (i) STOP · spent → DISPOSAL-04 = §18.26.2 verbatim with the `03→04` tokens from a transport that can run `shasum`/`mkdir` on the Mac; (ii) NOT EXECUTED · authority intact → the same pin run once under DISPOSAL-03 with a fresh stamp — the distinction (*a platform refusal before the pinned operation is not an execution of the act*) is the founder's to make. Either way: no fresh build · runner SHA `3b6360f7…` · before-set the two containers · `phase-a` then `vpio-01` once each · after-read 0 · population unopened until a committed and pushed PASS. `b198e2e37` unchanged · C-D26 OPEN · S3 · KERNEL-00 acceptance CLOSED.

### §10.48 — FOUNDER RULING on §18.27 (2026-09-15; discriminator plan §18.28): `S2-FOREIGN-HARNESS-DISPOSAL-03` = NOT EXECUTED · AUTHORITY INTACT · pin unchanged · Mac-side transport only

Choice (ii): *a transport refusing to carry an authorized operation ≠ the operation executing and returning STOP; only the latter spends the authority* — otherwise a transport layer could consume constitutional authority merely by refusing to carry it. DISPOSAL-03: NOT EXECUTED · authority INTACT · no evidence carrier · no device act · no termination · runner identity neither requalified nor contradicted; the four founder-attested reads are NOT inherited — the resumed act restarts from Stage −1′ line one with a fresh stamp, every check repeated (worktree · HEAD `b198e2e37…` · driver source unmodified · xctestrun present · SHA `3b6360f7…` · corrected four-file custody line · exactly four lines) before Stage 0 may touch the phone. Precedent: §18.6 · §18.10 · §18.16.5. **The refusing remote-command channel is INELIGIBLE for the resumed act — not to be tested again inside this authority; execute through a Mac-side transport already able to carry the pinned shell operations (the Mac Studio terminal directly).** §18.26.2 unchanged (no `03→04`, no inherited stamp); disposal boundary unchanged (before-set exactly `0B07D423…` + `6A2E406B…` · `phase-a` then `vpio-01` once each · after-read 0 → PASS; anything else = a genuine governed STOP that spends DISPOSAL-03); `K00-0506-S2-02` unopened until DISPOSAL-03 PASS is committed and pushed. Founder: *"A refusal by the transport is not a refusal by the governed instrument. Do not spend authority on an operation the instrument never performed."* Evidence → `driver-ledger/S2-FOREIGN-HARNESS-DISPOSAL-03-<stamp>/` → §18.29. `b198e2e37` unchanged · C-D26 OPEN · S3 · KERNEL-00 acceptance CLOSED.

### §10.49 — `S2-FOREIGN-HARNESS-DISPOSAL-03` EXECUTED → PASS (2026-09-15; discriminator plan §18.29): foreign harnesses removed under committed evidence · `K00-0506-S2-02` CONDITION MET · population NOT YET OPENED

Evidence `cb195a05267d7d97ec4c8e82f3e8c37e57383e69` (`feature/k00-s2-foreign-harness-disposal-03-20260915T181106Z`) → cherry-picked `79fa57e87`; seal 9/9 here; transport Mac Studio terminal directly. Verified from the files: fresh stamp `181106Z` · requalification (worktree · HEAD `b198e2e37…` · driver source unmodified · runner present · PASS, causally downstream of the custody file) · xctestrun re-hash `3b6360f7…` = DISPOSAL-02 custody · exactly four custody lines on the C-D27-corrected `Debug-iphoneos/` paths (bundle-binary hashes differ from the §10.9 readiness runner as expected; xctestrun byte-identical) · before-read exactly `0B07D423…` PID 2098 + `6A2E406B…` PID 2099 (same instances as the Block-B read) · `phase-a` terminated 2098, `vpio-01` terminated 2099, one invocation each, both `Executed 1 test, with 0 failures` / `TEST EXECUTE SUCCEEDED` (the first waited ~50 s for the founder to unlock the phone — a readiness act, not a governed operation; no second invocation) · after-read `VoiceKernelHarness processes AFTER: 0` → `DISPOSAL_ACCEPTANCE PASS`. Legacy `App.app` PID 2100 present before and after, outside the act, untouched. **Founder ruling: DISPOSAL-03 PASS · accepted · spent; carrier now retained residue; C-D27 closed; C-D28 future only; C-D26 HOLD; `K00-0506-S2-02` condition MET, population execution NOT YET OPENED** — to be opened as its own explicit act under the unchanged §18.22.3 `s2pop2` pin after this record is durable. PASS proves only that the known foreign live state is absent; cause/actor/launch time/prior exit NOT established. `b198e2e37` unchanged · S3 · KERNEL-00 acceptance CLOSED.

### §10.50 — FOUNDER RULING after §18.29 (2026-09-15; discriminator plan §18.30): `K00-0506-S2-02` ISSUED as a PAIRED restoration + population act (option b) · Mac Studio terminal directly · pinned §18.30.2 · NOT YET EXECUTED

Population semantics = §18.22.3 unchanged (label `K00-0506-S2` · N 10 · `vpio-02` · `s2-nearend` · `b198e2e37` · §7 reading; not acceptance/S3/KERNEL-00). Shape = §18.13.3's proven joint: Block A → Block B → RESTORE-04 before-read → the one keyboard act (Down to zero · Up ×11 · stop) → immediate after-read = the joint (Mac Studio Speakers · builtin · 69 · unmuted · pane closed · parser PASS) = the population's pre-Block-C boundary → Block C the very next act → `Dpop` → seal/return. Founder: *prepare the host to the already-required state, never relax the state the population requires; do not spend another scientific authority discovering that the Mac changed its volume.* Transport: Mac Studio terminal directly; remote channel INELIGIBLE for this act. Scope: joint + one N=10 invocation + `Dpop`/return; NOT S3 · KERNEL-00 acceptance · C-D26 repair (HOLD) · new runner/stimulus/volume target · alternate restoration · rerun after a governed STOP. CLAUDE.md compaction deferred until the population disposition. Pin §18.30.2 composes §18.22.3 (Stage 0, Blocks A/B/C/`Dpop`, hashes `5dd16bdd…` · `22e105dd…` · `77d40528…` · `e4f93c0b…`) with the §18.13.3 restoration stages (prefix `k00-s2-volume-restore-04-`), the §18.5.2 parser embedded verbatim writing `parser.txt`, `JOINT.txt` derived only from the parser output + pane read (C-D28 shape), no separate pre-C read, return on `feature/k00-s2-population-02-evidence-<stamp>` (restoration dir `s2-volume-restore-04-<stamp>/` · ledger `K00-0506-S2-<stamp>/` · preflight dir · `K00-0506-S2-02-run-<stamp>/` with block files, outs, `RETURN.txt`, `SHA256SUMS.run`) → §18.31 (restoration half vs §18.5.3, population half vs §16.4 + `Dpop`, §7 reading per row, partition pins +10). `b198e2e37` unchanged · S3 · KERNEL-00 acceptance CLOSED.

### §10.51 — `S2-RESTORE-04 / K00-0506-S2-02` EXECUTED → JOINT PASS → POPULATION 10/10 (2026-09-15; discriminator plan §18.31): verified here · §7.2/§7.3 reading → population CHARACTERIZE · returned for ruling

Mirror of discriminator plan §18.31. Paired act executed at the Mac Studio terminal directly (return `84eb74094…` → cherry-pick `d82e7a834`). Restoration half: before 18:40:16Z volume 69 (no drift since 15:49:59Z) → one keyboard act → after 18:41:19Z 69 · unmuted · Mac Studio Speakers · builtin · pane closed → `RESTORE_ACCEPTANCE PASS` (parser reproduced here), seal 11/11, device JSON byte-identical. One founder-disclosed sequencing deviation (a premature, read-only Stage 7 seal attempt before Stage 5, failed closed, touched nothing) ruled non-material, ordering not relaxed. Population half: Block A PASS · Block B clean (0 harness, `E3B88028` ×1) · Block C stimulus preflight PASS at 18:41:35 (fixture + afplay SHAs, builtin, **69**, unmuted) · 10/10 custody VALID · `BATCH_PIPELINE_RC=0` · Dpop afplay 0 · seals 9/9 and 80/80 · block scripts = pin. Classifier 10/10 identical (10 × gen-1 listen, 328–434 ms); output reader identical on every K00-05/06/COUPLING row: K00-05 PASS-05 ×10 + ×10 (evidence only, K00-05 CLOSED); K00-06 frozen rows 9 PASS-06 · 1 UNMEASURED-06 (sample 6) · 0 CHARACTERIZE · 0 FAIL · `digitalZeroTotal=0` ×10 — never pooled, earning nothing, K00-06 built-in standing unchanged (CHARACTERIZE ONLY · INCOMPLETE). **§7.2 reading (script embedded in §18.31.6):** rows A-consistent 6 + 1 on a single window (sample 6) · CHARACTERIZE 3 (samples 3 · 7 · 8) · A′ 0 · UNMEASURED 0; windows 22/25 signal-class input persists at the consumed seam, **3/25 fall to ~1e-5 rms with callbacks/`ioRunning` intact (A′ shape)** → **population CHARACTERIZE**: A dominant, A′ not excluded, A not established. Limitation named: the journal's amplitude-only evidence cannot separate the near-end tone from residual echo in the A windows; the stimulus reaches the seam at threshold-edge level (rows 1–2 marginal). Gate maintenance C-D24 species: four count pins (559 · 61 · 17 · 60), 76/76. Returned: reading acceptance · sample-6 disposition · the amplitude-only limitation and S3 (NOT OPEN) · gate-maintenance acceptance · compaction eligibility. Standing: `S2-RESTORE-04 PASS` · `K00-0506-S2-02 EXECUTION PASS · SPENT` · reading PERFORMED → CHARACTERIZE · S3 NOT OPEN · KERNEL-00 NOT ACCEPTED · no Mac population act needed.

### §10.52 — FOUNDER RULING on §18.31 (2026-09-15; discriminator plan §18.32): S2 disposition CHARACTERIZE · ACCEPTED · CLOSED · sample 6 A-consistent n=1 · amplitude-only limitation MATERIAL · S3 CLOSED, non-executable as written · C-D24 maintenance ACCEPTED · CLAUDE.md compaction AUTHORIZED

Mirror of discriminator plan §18.32 (standing table verbatim there). Five rulings: (1) §18.31.6 accepted — S2 closes as CHARACTERIZE, founder question unresolved, not PASS/FAIL/A/A′; (2) sample 6 = A-consistent on n=1 full rendering window, not UNMEASURED (the K00-06 reader's two-window rule is not imported into S2; weakness carried as `n=1`, tally "6 + 1 on one window · 3 CHARACTERIZE"); (3) the amplitude-only limitation is material: the 22 signal-positive windows are A-consistent but cannot establish A as defined (the surviving energy may be residual echo), the 3 deep-attenuation windows are strong A′-shaped observations that do not establish A′ for the population → **S3 CLOSED and non-executable as written** (its VP-OFF positive arm is non-discriminating: S1 showed own playback dominates the seam at 0.06–0.07 rms under bypass); any A-vs-echo or A′→B question needs a new source-identifying discriminator (spectral/correlation or labelled-source) by a new ruling; (4) C-D24 maintenance `c78ccd59c` accepted (four count pins, rule unchanged, 76/76); (5) CLAUDE.md compaction authorized as its own subsequent carrier (pointer to the standing table + `VOICE_CLAIM_STATE_2026-09-15.md`; no new doctrine, no S3 reopening, no C-D26 repair, findings unaltered). K00-06 built-in stays CHARACTERIZE ONLY · INCOMPLETE; K00-05 CLOSED · PASS; KERNEL-00 NOT ACCEPTED; S2 top-up/rerun and any new Mac population act ⛔.

### §10.53 — `SOURCE-ID-01` read-only design act OPENED and RETURNED (2026-09-15; discriminator plan §18.33; design `KERNEL-00_VPIO-02_SOURCE-ID-01_DESIGN_2026-09-15.md`)

Founder-opened design lane for the discriminator S2 left unresolved (*whose energy survives at the consumed seam while MAIA renders*). Design returned, authorizing nothing: Q1 fixed-bin Goertzel (440 · 880 · 997 · 700 · 1200 Hz) on the consumed buffer, Hann over 40 ms, one evidence-only `input_source_sample`/s beside an unchanged `input_health_sample`; Q2 keep 997 Hz, recommend a gated (250 ms on/off) fixture for the population with the stationary fixture as a small first arm; Q3 predeclared per-invocation reading law (NEAR-END-SURVIVES / SUPPRESSED / own-playback residual descriptive / INDETERMINATE-SRC; leakage bound; maps onto A / A′; no K00-06 PASS); Q4 minimal surface = `AudioGraph.swift` interior + two kernel seams + tests + new bundle + gate + one new reader, invariant files and frozen readers byte-identical, new subject by custody. Rulings owed on Q1–Q4 before any implementation authority. Standing unchanged; open execution authority NONE.

### §10.54 — FOUNDER RULING on `SOURCE-ID-01` + read-only amendment (2026-09-15; discriminator plan §18.34; design §9–§10)

Spectral core accepted; Q1 aggregate and Q3 numerical law amended as ruled: ordered 2 Hz envelope index `m2_997` / `m2_440` (threshold ≥ 0.9; ideal gate 1.21–1.31, unmodulated max 0.82) replaces the unordered contrast counts; leakage law now amplitude-domain (880 → 997 = 2.77e-3, 440 → 997 = 2.16e-5, 1 320 → 4.00e-5, 1 760 → 1.12e-5; measure the harmonics or bound them explicitly); SURVIVES/SUPPRESSED/INDETERMINATE re-derived, with `signature_absent` naming 997 Hz energy that persists without the gate. Q2 gated 997 Hz accepted, S-a NOT OPEN. Q4 surface accepted in principle; SID subject `life.soullab.voicekernel.vpio02sid` / `VoiceKernel VPIO-02-SID`; a separate SID entry witness is REQUIRED before any source population and is not opened. Implementation NOT AUTHORIZED; device act NONE; open execution authority NONE.

### §10.55 — `SOURCE-ID-02` implementation LANDED, code/offline only (2026-09-15; discriminator plan §18.35; record `KERNEL-00_VPIO-02_SOURCE-ID-02_IMPLEMENTATION_2026-09-15.md`)

Founder ruling on `d02ce1094` accepted §10.A/§10.B with the `m2_440` confound veto, the 7-bin set and an explicit harmonic tail, and authorized implementation only. Landed at `6f0e2e0b2`: seven-bin Hann/Goertzel estimator on the consumed seam, evidence-only `input_source_sample` (ordered 2 Hz indices), SID subject `life.soullab.voicekernel.vpio02sid` / `VoiceKernel VPIO-02-SID`, gated 997 Hz fixture (SHA `30d51cf4…`, token `sid-nearend-gated`), evidence-only `k00-source-ledger.py` (20/20; 61 VPIO-02 journals → `no_source_evidence`), batch/reinstall/driver custody declarations (S-a refused on the SID subject; SID pins empty → `pins-unrecorded`), gate 82/82 by history; invariant files and frozen readers byte-identical. NOT COMPILED. Owed: founder acceptance → SID MAC-COMPILE (own act) → FIRST-INSTALL → SID ENTRY WITNESS (required, separately authorized) → S-b N=10 → source reading. Device execution authority NONE.

### §10.56 — `SOURCE-ID-02A` offline repair LANDED at `f0c6ae13b` (2026-09-15; discriminator plan §18.36; implementation record §9)

Founder review of `6f0e2e0b2`: surface right, five flags disposed (all accepted; Swift risk deferred to MAC-COMPILE), but two offline defects (the gated stimulus token unreachable behind the batch's earlier catch-all; `frameReset` not vetoing SUPPRESSED) and one control ambiguity (undefined `m2_440` clearing like a measured control) → one narrow carrier: single closed stimulus dispatch with two lawful pairings; `frameReset` before either attribution verdict; own-control law with `own_control_unmeasured`; self-test 24/24; gate 82/82; Swift untouched. Implementation NOT YET ACCEPTED for MAC-COMPILE; nothing else open; device execution authority NONE.

### §10.57 — `SOURCE-ID-02` + `02A` ACCEPTED · SID MAC-COMPILE OPEN (2026-09-15; discriminator plan §18.37; implementation record §10)

Accepted code state `f0c6ae13b88db29cbd1537bec585d98376c8bc4f` (gate 82/82 · reader 24/24). SID MAC-COMPILE-01 pinned as a paste-able Mac act (implementation record §10.2): worktree at the SHA · gate · `swift test` · xcodegen · unsigned + signed builds · identity + manifest + codesign · post-build surface proof · sealed `$OUT`; STOP rules and the no-repair / no-pin-mutation constraints as ruled. NOT YET EXECUTED. FIRST-INSTALL · SID ENTRY WITNESS (required) · S-b N=10 · S-a · S3 CLOSED; KERNEL-00 NOT ACCEPTED; device execution NONE.


### §10.58 — `SID MAC-COMPILE-01` EXECUTED · STOP at `swift test` (2026-09-15; discriminator plan §18.38; implementation record §10.5)

Gate 82/82 PASS · `swift build` PASS · `swift test` FAIL at test-target compilation (`PureLogicTests.swift:485:13` type-checker time-out on the `ripple` closure in the modulation-index unit test) → STOP; xcodegen/builds/identity/manifest/seal never entered; zero Swift tests ran. Bounded compile defect in the predeclared risk class; not repaired inside the act; authority SPENT; duplicate invocation NOT ESTABLISHED as executed; evidence carrier owed. Repair (test file only, new SHA, fresh compile pin) is a separate founder ruling; reinstall pins unchanged (empty). Qualification of the SID subject remains CLOSED; SID ENTRY WITNESS still REQUIRED and not opened.


### §10.59 — `SID REPAIR-01` OPEN (line 485 only) · siblings HOLD · `SID MAC-COMPILE-02` NOT OPEN · carrier first (2026-09-15; discriminator plan §18.39; implementation record §10.6)

Founder ruling on the §10.58 STOP. Repair authority limited to the compiler-proven expression (`PureLogicTests.swift:485`, modulation-index test): type-check disambiguation only, values/assertions unchanged, one test file, new SHA, founder diff review; sibling closure expressions HOLD until a compile names them. `SID MAC-COMPILE-02` opens only by a separate act against the reviewed REPAIR-01 SHA. Evidence carrier (`SID_MAC-COMPILE-01_CARRIER_2026-09-15.sh`) lands before the repair is written. Qualification of the SID subject remains CLOSED; SID ENTRY WITNESS REQUIRED, not opened; reinstall pins EMPTY.


### §10.60 — carrier read · `SID REPAIR-01` written at `faf918b5c` · founder diff review pending · `SID MAC-COMPILE-02` NOT OPEN (2026-09-15; discriminator plan §18.40; implementation record §10.7–§10.8)

Evidence of the STOP is durable (carrier cherry-picked, seal reproduced, single 485:13 diagnostic confirmed from custody, zero tests ran). Repair = one hunk in the test file, compiler disambiguation only, siblings HOLD, kernel byte-identical to the accepted state. Compile requalification against `faf918b5c` opens only by a separate founder act. SID subject qualification remains CLOSED; SID ENTRY WITNESS REQUIRED, not opened; reinstall pins EMPTY. Third 0-byte transcript at 21:32:08Z recorded as an executed duplicate invocation with an unwitnessed (most plausibly precondition-refused) outcome; one read-only `ls` owed.


### §10.61 — duplicate invocation ESTABLISHED as a precondition refusal (founder ruling 2026-09-15; discriminator plan §18.41; implementation record §10.9)

Non-substantive residue only (0-byte tee transcript, refused at `test ! -e "$WT"`, nothing ran). Supersedes §10.58/§10.60 "not established" wording. No change to any standing: MAC-COMPILE-01 SPENT · REPAIR-01 written at `faf918b5c`, review pending · siblings HOLD · MAC-COMPILE-02 NOT OPEN · SID ENTRY WITNESS REQUIRED · reinstall pins EMPTY.


### §10.62 — REPAIR-01 ACCEPTED · `SID MAC-COMPILE-02` OPEN and pinned (2026-09-15; discriminator plan §18.42; implementation record §10.11)

Compile requalification of `faf918b5c` on the Mac toolchain; same PASS conjunction and STOP rules as MAC-COMPILE-01; installs, launches, samples nothing; reinstall pins stay empty. SID subject qualification remains CLOSED; SID ENTRY WITNESS REQUIRED, not opened. Not yet executed.


### §10.63 — `SID MAC-COMPILE-02` PASS as founder-reported on `faf918b5c`; NOT YET ACCEPTED pending custody (2026-09-15; discriminator plan §18.43; implementation record §10.12)

Compile qualification of the SID subject reached its final echo: gate 82/82 · swift build · swift test 33/33 (source vectors 6/6) · project generation · unsigned + signed device builds · identity exact (`vpio02sid` / `VPIO-02-SID`; dylib UUID `4A6AD464-…`) · surface proof. Installs, launches, samples nothing; reinstall pins EMPTY. SID subject qualification (K00 obligations) remains CLOSED; SID ENTRY WITNESS REQUIRED and not opened. Carrier owed before acceptance.


### §10.64 — `SID MAC-COMPILE-02` PASS · SPENT (founder ruling 2026-09-15; discriminator plan §18.44; implementation record §10.13)

Compile qualification of the SID subject `faf918b5c` is complete and ruled; sibling HOLD remains; reinstall pins EMPTY; K00 qualification of the SID subject remains CLOSED; SID ENTRY WITNESS REQUIRED and not opened; carrier landing = record confirmation only.


### §10.65 — carrier-B · reinstall-pin at `3f3cb15b070d9237f17f66625ede6591b1ae5940` · ENTRY witness design OPEN (2026-09-15; discriminator plan §18.45; implementation record §10.14)

No qualification change: MAC-COMPILE-02 PASS stands; the SID subject remains uninstallable by the instrument (`pins-unrecorded` on the unruled pins) and unqualified (K00 obligations CLOSED for it); the ENTRY witness is being designed, not executed.


### §10.66 — ENTRY witness DESIGNED, not opened · all five SID reinstall pins recorded (act 2 review pending) (2026-09-15; discriminator plan §18.46; implementation record §10.15–§10.16)

The SID subject's compile qualification is complete and in custody; the instrument no longer refuses it structurally once act 2 is accepted, but FIRST-INSTALL-SID, the ENTRY witness and S-b each remain separately unauthorized. K00 obligations for the SID subject: CLOSED. ENTRY = K00-04 axis only.


### §10.67 — ENTRY law ruled · FIRST-INSTALL-SID pin drafted, not opened (2026-09-15; discriminator plan §18.47; implementation record §10.17)

The SID subject is identity-complete in the instrument and remains uninstalled, unlaunched, unsampled. K00 obligations for the SID subject: CLOSED; ENTRY = K00-04 axis only, law as ruled (27/30 floor). Nothing opens on this record.


### §10.68 — the ENTRY witness instruments exist as drafts before the install (2026-09-15; discriminator plan §18.48; implementation record §10.18)

No qualification change. FIRST-INSTALL-SID not open; ENTRY not open; K00 obligations for the SID subject CLOSED.


### §10.69 — ENTRY instruments complete as drafts; liveness validity reader exists before its evidence (2026-09-15; discriminator plan §18.49; implementation record §10.19)

No qualification change. FIRST-INSTALL-SID closed; ENTRY not open; K00 obligations for the SID subject CLOSED. The reader that will judge observer liveness at [G] is committed and self-tested before any SID journal exists.


### §10.70 — `SID FIRST-INSTALL-01` OPEN (2026-09-15; discriminator plan §18.50; implementation record §10.20)

The install is the INSTALL TRANSACTION moment only: it establishes presence and container, nothing physiological. K00 obligations for the SID subject remain CLOSED; ENTRY [D]/[E] execution CLOSED; S-b CLOSED.


### §10.71 — FIRST-INSTALL attempt 1 not entered (2026-09-15; discriminator plan §18.51; implementation record §10.21)

No install occurred; no container exists; nothing changes in qualification standing.


### §10.72 — FIRST-INSTALL-01 STOP · spent (founder ruling 2026-09-16; discriminator plan §18.52; implementation record §10.22)

No install occurred; nothing changes in qualification standing; a future install requires a new act and fresh authority.


### §10.73 — FIRST-INSTALL-02 opened, pin re-issued, not run (2026-09-16; discriminator plan §18.53; implementation record §10.23)

No qualification change.


### §10.74 — FIRST-INSTALL-02 pin accepted, carrier re-issued, run held (2026-09-16; discriminator plan §18.54; implementation record §10.25)

No qualification change.


### §10.75 — FIRST-INSTALL-02 run shape issued, not yet invoked (2026-09-16; discriminator plan §18.55; implementation record §10.26)

No qualification change.


### §10.76 — FIRST-INSTALL-02 STOP at device pre-state (historical harness running) (2026-09-16; discriminator plan §18.56; implementation record §10.27)

No install; no container; no qualification change. The `.vpio02` subject was observed running outside any governed act — recorded as device-environment fact, cause unknown.


### §10.77 — terminate-only act, `02` STOP carrier and `03` pin drafted; nothing executable (2026-09-16; discriminator plan §18.57; implementation record §10.28)

No qualification change.


### §10.78 — STOP carrier run shape issued; terminate pin amended; 03 accepted but closed (2026-09-16; discriminator plan §18.58; implementation record §10.30)

No qualification change.


### §10.79 — FIRST-INSTALL-02 STOP evidence durable (2026-09-16; discriminator plan §18.59; implementation record §10.31)

No qualification change.


### §10.80 — terminate-only act open, not yet invoked (2026-09-16; discriminator plan §18.60; implementation record §10.32)

No qualification change; the act touches only the historical `.vpio02` process state.


### §10.81 — terminate-01 STOP (driver infrastructure), spent; carrier drafted (2026-09-16; discriminator plan §18.61; implementation record §10.33)

No qualification change. FIRST-INSTALL-03 closed.


### §10.82 — steps 1 + 2 landed and read; mechanism located, cause unknown; historical harness still alive (2026-09-16; discriminator plan §18.64; implementation record §10.37)

No qualification change. The terminate-01 runner install placed only the test-runner app on the device (tooling, not subject); `.vpio02sid` remains absent; FIRST-INSTALL-03 remains closed behind step 3.


### §10.83 — step-2b device-state calibration open as draft-only; draft returned, not run (2026-09-16; discriminator plan §18.65; implementation record §10.38)

No qualification change. Read-only calibration of the device-state vocabulary; no subject touched.


### §10.84 — step-2b accepted; read-only execution open; run shape issued (2026-09-16; discriminator plan §18.66; implementation record §10.39)

No qualification change.


### §10.85 — step-2b landed and read; device-state vocabulary observed; foreign `.k00` / `.vpio01` harness processes found alive again (2026-09-16; discriminator plan §18.67; implementation record §10.40)

No qualification change. The ENTRY validity premise (no other VoiceKernel organism holding audio during SID entry) is why FIRST-INSTALL-03 and [D] require harness 0; the frozen subjects' *processes* being alive is a device-state finding, not a change to any frozen container.


### §10.86 — zero-harness law preserved; relaunch census + foreign-disposal-04 drafted, not run (2026-09-16; discriminator plan §18.68; implementation record §10.41)

No qualification change. The ENTRY premise (harness 0 at FIRST-INSTALL-03 and [D]) stands unamended.


### §10.87 — census and disposal-04 drafts amended per ruling; root grant issued for the amended census; not run (2026-09-16; discriminator plan §18.69; implementation record §10.42)

No qualification change.


### §10.88 — relaunch census identified DAS prewarm; current harness set 0; SID install instrument hardened; FIRST-INSTALL-04 drafted, execution closed (2026-09-16; discriminator plan §18.70; implementation record §10.43)

No physiological qualification change. Zero-harness validity law is preserved. `.k00` / `.vpio01` relaunches were iOS DAS app-resume prewarming, external to the organism; current harness read = 0. `FIRST-INSTALL-03` remains unexecuted and receives no authority because its outer zero-harness read is not adjacent to the actual install verb. Instrument `ec60321b…` adds a SID-only just-in-time process read immediately before install; gate 85/85. `FIRST-INSTALL-04` = 59 lines `81f29c59…`, draft only; [D]/[E] remain closed.


### §10.89 — FIRST-INSTALL-04 PASS; SID container witnessed; ENTRY [D] bound (2026-09-16; discriminator plan §18.71; implementation record §10.44)

No physiological qualification change yet. SID install is now complete and in custody: `.vpio02sid` container `85948DBD-BA8F-4679-950D-31767B1C24E5`, historical `.vpio02` unchanged, harness 0 after install. Bound ENTRY preflight pin `1d1eb08d…`/44 preserves all accepted [D] laws and substitutes only the witnessed container literal. [E] remains closed until [D] PASS.


### §10.90 — `SID ENTRY-PREP-01` complete as tooling/records only; successor ENTRY witness drafts returned, execution closed (2026-09-16; discriminator plan §18.72; implementation record §10.45)

No physiological qualification change. FIRST-INSTALL-04 custody is durable. SID ENTRY's first-sample validity boundary is hardened at `36e412f8e…`: unexpected/prewarmed harness state cannot be auto-terminated into a sample; it is preserved and refused, with a second process read adjacent to the first driver invocation. Gate 86/86. PRELIGHT-02 `cecaa12c…`/44 and BATCH-02 `b8941411…`/32 are drafts only; neither was run. K00-04/K00-05/K00-06 standings unchanged; ENTRY evidence remains unmeasured.


### §10.91 — ENTRY-01 complete but INDETERMINATE; fresh hardened `03` successor authorized conditionally (2026-09-16; discriminator plan §18.73; implementation record §10.46)

ENTRY-01 is measured, not accepted: 29/30 gen-1 takes, 0 ceiling breaches, Fisher p 0.754237288136 versus F-W1, but observer liveness is 29 LIVE / 1 DORMANT (sample 1 = 9 frames-present records < 10) → **INDETERMINATE-ENTRY · observer-dormant**. Evidence is durable at `6543484f2` / `a4364a842`. The run also predates the sample-1 adjacent JIT harness-zero hardening, so it cannot discharge that later custody law. PRELIGHT-02 correctly refused a live SID harness and launched no successor batch. PRELIGHT-03 `a5c56517…` is OPEN read-only; BATCH-03 `e1ca9cb6…` is conditionally OPEN only after CLEAN ≤300 s, as a fresh full N=30 under the unchanged law. No source population or KERNEL-00 acceptance follows automatically. Gate 86/86 after admitting SID ENTRY as its own custody corpus.


### §10.91 — SID ENTRY-BATCH-03 partial STOP at sample 16; 15/15 completed rows clean; all-sample prewarm custody hardened; retryable 04 successor drafted (2026-09-16; discriminator plan §18.73; implementation record §10.47)

No physiological qualification change. BATCH-03 is incomplete and carries no final ENTRY class; its 15 rows are preserved separately and never topped up. All 15 completed rows are gen-1 listen, observer-LIVE, 0 ceiling breaches, resets 0. New instrument `9df4c934…` waits read-only up to 60 s for transient prewarm to clear before every SID ENTRY sample and retains an adjacent fail-closed JIT zero-harness read; it never auto-terminates a SID ENTRY harness. Gate 87/87. PRELIGHT-04 `6a503774…` / BATCH-04 `3a745d95…` are drafted only; execution/source population remain closed.

### §10.92 — ENTRY-04 pin review repaired forward; physiology unchanged; natural-clear semantics await founder acceptance (2026-09-16; discriminator plan §18.74; implementation record §10.48)

No physiological qualification change. The 02:35 PRELIGHT-03 retry refused before sampling on one historical `.vpio02` harness and is now durable (`6a4ca824a`). The first 04 draft hashes in `c5a1f2540` were transport/custody-defective and are superseded before execution. Corrected PRELIGHT-04 = `3268743e…`/48; corrected BATCH-04 = `b9fa2971…`/46, with one-shot act marker and before/after new-ledger proof; gate 88/88. The ≤60 s natural-clear wait in `9df4c934…` changes successor witness timing/eligibility semantics and therefore awaits explicit founder acceptance; no ENTRY-04 population is authorized yet. ENTRY-01 remains INDETERMINATE; ENTRY-03 remains PARTIAL/STOP/SPENT; source population remains closed.


### §10.93 — SID ENTRY precondition semantics repaired; physiology unchanged; fresh successor not yet pinned or authorized (2026-09-16; discriminator plan §18.75; implementation record §10.49)

No physiological qualification change. ENTRY-03 remains PARTIAL/STOP/SPENT with 15/15 completed gen-1-listen, observer-LIVE rows; those rows are never topped up. Founder-authorized tooling repair `9ed72a38c…` removes the held natural-clear wait and makes the adjacent all-sample SID ENTRY JIT process-set read the sole SID process precondition: nonzero/unreadable → evidence + STOP before launch, never cleanup. Historical non-SID/non-ENTRY behavior is preserved; source gate **88/88 PASS**; organism, driver, readers and thresholds untouched. PRELIGHT-04/BATCH-04 pins bound to `9df4c934…` no longer identify the current instrument and are not executable under this ruling. Fresh N=30, source population and KERNEL-00 acceptance remain CLOSED pending a newly pinned successor and separate founder authority.


### §10.94 — record-of-record reconciled; ENTRY-05 successor shape accepted, physiological qualification unchanged (2026-09-16; discriminator plan §18.76; implementation record §10.50)

No physiological qualification changes. The 03:31 census proves the harness population had returned to 3 after the earlier zero; the 04:09 separate clearance proves a later exact-subject 3→2→1→0 state transition but used native PID SIGTERM, not the historical XCTest disposal instruments, and therefore does not claim their acceptance identities. ENTRY-01 remains INDETERMINATE-ENTRY; ENTRY-03 remains PARTIAL/STOP/SPENT. PRELIGHT-05 `ded53aa8…`/48 and BATCH-05 `e00529be…`/46 are the accepted successor shapes against fail-closed instrument `9ed72a38…`. Reconciled Voice source gate = **89/89 PASS**. A fresh complete N=30 population and adjudication are still required before KERNEL-00 acceptance or downstream bridge/migration authority.

### §10.95 — PRELIGHT-05 refused cleanly; physiology unchanged; BATCH-05 remains unspent (2026-09-16; discriminator §18.77; implementation §10.51)

No physiological qualification change. PRELIGHT-05 verified the installed SID and historical containers, then refused on one historical `.vpio02` harness before CLEAN. BATCH-05 was not invoked. The refusal is custody, not an ENTRY result. A post-install process-clearance successor is drafted only; it changes device process state, not organism bytes or physiological thresholds. Fresh authority is required before it can execute, and a successful clearance still requires a new PRELIGHT-05 CLEAN before the N=30 population.

### §10.96 — CLEAR-02 STOP target absent; physiology unchanged; fresh PRELIGHT-05 next (2026-09-16)

No qualification change. Both installed subjects remained bound; harness population was already zero at CLEAR-02 PRE; no terminate or sample ran. BATCH-05 remains uninvoked.


### §10.97 — SID ENTRY qualification satisfied: BATCH-05 = **ENTRY-UNPERTURBED**; next gate = source-discrimination population (2026-09-16; discriminator §18.79; implementation §10.53)

Fresh repaired witness: PRELIGHT-05 CLEAN, BATCH-05 complete N=30, rc 0, every JIT harness guard zero. Classifier 30/30 gen-1; 0 infrastructure/subject-mismatch; listeningMs 315…400 so 0 ceiling breaches; liveness 30/30 LIVE with min 15 frames-present and resets 0; one-sided deterioration Fisher vs F-W1 29/30 = p 1.0. The predeclared ENTRY-UNPERTURBED law is fully met. This closes the ENTRY validity gate only; source-discrimination population and KERNEL-00 acceptance remain unopened downstream gates. Corpus-count maintenance preserves the constitutional exclusion of all 75 SID ENTRY journals from output/source interpretation; source gate 89/89.


### §10.98 — SOURCE-SB-01 successor prepared; S-b N=10 remains the next qualification population, not yet executed (2026-09-16; discriminator §18.80; implementation §10.54)

ENTRY validity is satisfied. The already-ratified source-discrimination arm is S-b only (N=10); S-a remains NOT OPEN. Read-only preflight `f675d5d7…`/56 is next and checks durable ENTRY-UNPERTURBED, source-reader 24/24, fixture/player identity, exact Mac output/volume/mute, SID installed container, and harness zero. Population `b43e3709…`/32 is conditional on CLEAN ≤300 s + fresh authority and contains exactly one N=10 gated SID output population with cancel-at 1000 / settle 2. No source criterion changes; source gate 90/90. KERNEL-00 acceptance remains downstream of the returned population + source reading.
