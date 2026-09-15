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
