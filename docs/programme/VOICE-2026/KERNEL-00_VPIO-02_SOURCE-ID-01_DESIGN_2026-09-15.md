# KERNEL-00 · VPIO-02 · `SOURCE-ID-01` — SOURCE-IDENTIFICATION DESIGN ACT (read-only, 2026-09-15)

**Status:** DESIGN ONLY · returned for founder ruling · **authorizes nothing.** ⚠️ **Founder ruling §9 (2026-09-15): spectral core ACCEPTED; §2.2 aggregate and §4 numerical law AMENDED in §10 — read §2.2/§4 with §10, which supersedes their numbers.** No implementation · no compile · no install · no device act · no S3 · no K00-06 acceptance attempt · no threshold · no organism, harness, driver, reader or reinstall change. The frozen organism `ac12dedf4` / instrument `b198e2e37` / installed `.vpio02` are untouched.

**Opened by:** founder, after the §18.32 ruling on the S2 population (discriminator plan `KERNEL-00_VPIO-02_K00-06_PARTIAL-ZERO_DISCRIMINATOR_PLAN_2026-09-15.md` §18.32; standing table §18.32.2). Founder's words: *"Next is not another witness. The next lawful move is a new design lane for the unresolved discriminator: can we prove that the energy surviving at the consumed seam is the independent near-end source, rather than MAIA's own playback / residual echo? … Open a read-only source-identification design act. No device run, no harness change, no S3, no K00-06 acceptance attempt."* The act must answer four questions before any implementation: **(1) measurement · (2) stimulus · (3) reading law · (4) minimal surface.**

**Precedent that governs the design:** P5-F1 (*the instrument changed the subject*: a read-only observation added to the startup seam moved the engine subject's gen-1 behaviour); the observer-effect firewall of the hidden-state census (in-process reads are the last tier, never silently admitted); the §18.32 ruling that S2's amplitude-only evidence is material to interpretation and that S3 as written is non-executable; the K00-06 amendment (quantitative AEC gates belong to KERNEL-01/BENCH-01 — anything measured here is evidence, never a gate); the vow that no raw microphone audio is stored.

---

## 0. The question, stated so it can be falsified

S2 (§18.31.6, accepted §18.32) showed that under VP ON the consumed post-VP seam keeps `signal`-class energy through 22 of 25 full rendering windows and collapses to ~1e-5 rms in 3. It could not say **whose energy** survives in the 22: the journal carries `rms · peak · digitalZero/noiseFloor/signal` per callback, aggregated per second — amplitude classes with no source attribution. Two sources are physically present at the seam while MAIA renders: the controlled near-end stimulus (Mac Studio Speakers, 997 Hz) and MAIA's own 440 Hz test tone re-entering the microphone (removed by the voice processor's AEC to a residual the journal cannot separate).

**SOURCE-ID-01's question:** *at the consumed post-VP seam, during full rendering windows, is the surviving energy attributable to the labelled near-end source, to own-playback residual, to both, or to neither — per window, from evidence the organism itself journals, with no raw audio stored?*

A design that cannot state, before any run, what observation would read "near-end survives" and what would read "own playback only" is not a design; §5 states both.

---

## 1. Seam census (read at `efad9b399`; organism `ac12dedf4`)

| Seam | File:line | What exists |
|---|---|---|
| Audio-thread input pull | `AudioGraph.swift:364–387` `pullInput` | `AudioUnitRender` into `inputScratch` (G9-sized); then `Self.measure(base, n)` → `(rms, peak)`; one `InputObservation(generation, timeMs, frames, rms, peak)` per callback; delivered by `onInput?(o)` |
| Energy estimator | `AudioGraph.swift:434–447` `measure` | one pass over `n` floats: `peak = max|v|`, `rms = sqrt(Σv²/n)` — the **only** arithmetic on the consumed samples |
| Observation type | `HealthSupervisor.swift:28–41` `InputObservation` + `classify` | `digitalZero` peak ≤ 1e-7 · `noiseFloor` rms < 1e-3 · `signal` rms ≥ 1e-3 |
| Kernel hop | `VoiceKernel.swift:285` | `ag.onInput = { o in Task { await self?.handleInput(o) } }` — one actor hop per callback (≈100/s) |
| Per-second aggregate | `VoiceKernel.swift:63–70`, `393–403`, `407–420` | `InputAggregate` (callbacks · frames · rmsMin/Sum/Max · peakMax · three class counts) → `input_health_sample` on the existing tick (`sampleIfDue`, 1 000 ms) |
| Own tone | `VoiceKernel.swift:203` `playTone(seconds: 3.0, frequencyHz: 440)` → `AudioGraph.makeTone` | amplitude 0.2, 3.0 s, one stream at a time |
| Near-end stimulus | `scripts/witness/fixtures/k00-s2-nearend-997hz-180s.wav` (SHA `1a505b3d…`) via `/usr/bin/afplay -v 0.50 -t 180` | 997 Hz · 180 s · mono · 48 kHz · PCM16 · peak 0.20 FS; the batch's only stimulus token `s2-nearend` (`k00-driver-batch.sh:37–63`) |
| Callback geometry (observed, S2 ×10) | journals | 48 000 Hz · 1 ch · ≈100 callbacks/s · 480 frames/callback (10 ms) · `ioRunning true` |
| Readers | `k00-ledger.py` · `k00-output-ledger.py` | dispatch on `r['event'] == …`; **unknown record names are ignored** (a new evidence record cannot move any existing row) |
| Replay | `Replay.swift:37` `automaticActs` | only the listed automatic acts need `causeSeq`; an observation record is replay-neutral |

Nothing in the seam carries frequency, phase or temporal-pattern information; the design has to add exactly one such observation, at exactly that seam, with no health meaning.

---

## 2. Q1 — Measurement: what source-identifying statistic is recorded at the consumed post-VP seam?

### 2.1 Estimator: fixed-bin Goertzel on the consumed buffer, Hann-windowed over a 40 ms analysis frame

- **Where:** inside `pullInput`, on the same `inputScratch` buffer `measure()` already reads, *after* `AudioUnitRender` returned `noErr` — the identical samples the organism consumes; no second tap, no raw-mic seam, no new call into the unit.
- **What:** Goertzel power at a **closed bin set** `B = {440, 880, 997, 700, 1200}` Hz — own fundamental · own 2nd harmonic · near-end stimulus · two control bands away from every 440-multiple. Each bin's recurrence continues across **four consecutive callbacks** (4 × 480 = 1 920 samples = 40 ms) with a Hann weight applied by sample index, then the frame closes and five magnitudes are emitted. Coefficients (`2cos(2πf/fs)`) and the Hann recurrence are computed **once at start from the observed hardware rate** (`input_format_read` → the same `requireValid()`-guarded rate), never hard-coded 48 kHz; the frame length is fixed at `4 × observed callback frames` on the first callback of a generation (if a callback ever changes size the frame is discarded and the count restarts — recorded as `frameReset`).
- **Why 40 ms / Hann, not 10 ms / rectangular (numbers computed here, N = 1 920, fs = 48 000):** at 10 ms the bin width is 100 Hz and the own tone's 2nd harmonic (880 Hz) leaks **−8.5 dB** into the 997 Hz bin under Hann (main-lobe overlap) and −17 dB rectangular — enough to manufacture a false "near-end survives" from speaker distortion. At 40 ms Hann the worst own-harmonic leak into the 997 bin is **880 → 997 = −51.2 dB**, 440 → −93 dB, 1 320 → −88 dB, 1 760 → −99 dB; the 997 tone leaks −73 dB into the 1 200 control and −83 dB into 700. Equivalent noise bandwidth 37.5 Hz: broadband white noise at the S2 baseline level (rms ≈ 7e-4) contributes ≈ **2.8e-5** in-band; at the deep-attenuation level (rms ≈ 1e-5) ≈ 4e-7. A near-end tone at the S2 baseline level (rms ≈ 1e-3, normalized bin magnitude ≈ 7e-4) therefore sits ≈ 28 dB above in-band noise at baseline and would still read ≈ 65 dB above the floor of a collapsed window if it were present — the estimator can distinguish "the tone is gone" from "the tone is 100× smaller", which aggregate rms cannot.
- **Realtime cost:** five Goertzel recurrences = 10 multiply-adds per sample plus one Hann recurrence (two multiply-adds) — ≈ 12 MAC/sample against `measure()`'s 2; no allocation, no lock, no syscall, fixed state in the graph object. Bounded, but **not zero**: §7 treats the instrumented build as a new subject on that basis.
- **What is emitted per frame (25 frames/s):** five normalized magnitudes (`|X_f| / Σw`, so a full-scale sine reads 0.5) — never per-frame journal records (25 × 5 fields/s would be ~90 000 records/hour, above the recorder's design budget and useless for reading). Frames feed an aggregate (§2.2).
- **Privacy / vow:** five narrow-band magnitudes at fixed frequencies over 40 ms are non-invertible summaries; no raw audio, no wide-band spectrum, no phase is stored. The harness has no member, but the design keeps the vow anyway so the mechanism could survive into a member-facing runtime under its own ruling.

### 2.2 Aggregate: one evidence record per second on the existing tick, beside `input_health_sample`

> ⚠️ Superseded numerically by §10.A (founder ruling §9): the `e997HighFrames / e997LowFrames` counts below preserve contrast, not order, and cannot prove a 2 Hz signature; the frame arithmetic "≈ 6 high / 6 low" is wrong (25 frames/s → ≈ 12–13 on / 12–13 off). Kept as written for the record.

New record **`input_source_sample`** (component `HealthSupervisor`, cause `sample`, emitted from the same `sampleIfDue` tick, so its `windowMs` and callback count coincide with the health sample it sits beside). Evidence, per bin `b ∈ B`: `e<b>Mean` · `e<b>Max` · `e<b>Min` (over the frames closed in the window) and, for the stimulus bin only, `e997HighFrames` / `e997LowFrames` (frames above / below the geometric mean of that window's `e997Max`·`e997Min` — the **temporal-contrast signature** a gated stimulus leaves and a stationary residual cannot, §3); plus `frames` (closed 40 ms frames in the window), `frameReset`, `analysisRateHz`, `binsHz` (the closed list, so the record is self-describing). No `inputFlow`, no class, no verdict: **evidence only**. `input_health_sample` keeps its exact current shape and keys.

### 2.3 What is deliberately NOT measured
Raw audio · wide-band FFT · phase · cross-correlation against a stored reference (would need the reference on the phone and per-sample alignment — heavier, closer to raw-audio custody, and unnecessary for a tone/gated-tone stimulus) · anything on the render (output) path (the own tone is already exactly known: 440 Hz, 0.2 amplitude, 3.0 s, handle-stamped).

---

## 3. Q2 — Stimulus: keep 997 Hz stationary, or a non-stationary / coded source?

S2 raised (as inference only, §18.31.7 (e)) that a stationary 997 Hz tone is exactly the input a voice processor's noise suppression may learn as stationary noise; rows 1–2's patchy baseline visibility is consistent with that and establishes nothing. Options, with the measurement of §2 fixed:

| Option | Stimulus | Identifies the source by | Cost | Reading |
|---|---|---|---|---|
| **S-a** | 997 Hz stationary (the existing fixture, SHA-pinned) | frequency only (`e997` vs controls, vs `e440`/`e880` leakage bound) | none (fixture and batch token unchanged) | clean but still exposed to stationary-noise suppression — and now that exposure becomes **measurable**: a monotone decline of `e997Mean` across the ≥ 10 pre-output baseline windows, with no own playback present, is direct evidence of suppression-by-stationarity, separately from anything MAIA does |
| **S-b (recommended primary)** | 997 Hz **gated**: 250 ms on / 250 ms off (2 Hz duty, 50 %), same level, 180 s, new SHA-pinned fixture | frequency **and** temporal contrast: within every 1 s window the 997 bin must alternate (≈ 6 high / 6 low 40 ms frames [corrected §10: ≈ 12–13 on / 12–13 off of 25 frames per second], `e997Max/e997Min` ≫ 1); own-playback residual and any leakage are continuous over the 3 s stream and cannot produce that pattern | one new fixture (+ sidecar SHA + gate header/frame/crossing/duty checks) + one new batch token; organism unchanged beyond §2 | the strongest attribution available without correlation: energy at 997 Hz *that turns on and off at 2 Hz* is the Mac's, full stop; a 250 ms gate is far shorter than typical noise-suppression adaptation, so the tone never becomes "stationary" to the processor |
| S-c | two alternating tones (997 / 1 540 Hz) | frequency alternation | new fixture, two stimulus bins (1 540 avoids 440-multiples but sits 220 Hz from 1 320 and 1 760 — fine at 25 Hz bins) | equivalent to S-b with more bins; no advantage over gating |
| S-d | chirp / PRN / coded sequence | correlation against a reference | phone-side reference + alignment + a correlation estimator ≈ raw-audio-adjacent custody; a different instrument class | **not recommended for the first source instrument** (most power, least minimal); named for the record as the escalation if S-b cannot separate |

**Recommendation:** **S-b as the population stimulus**, with **S-a retained as the first arm** (N small, e.g. 5) purely to *measure* the stationarity-suppression inference from S2 with the new estimator before the gated population is read — the S-a arm is what turns §18.31.7 (e) from inference into evidence or into a dropped hypothesis. Harmonic-safety table for 997 Hz (own-tone multiples 440 · 880 · 1 320 · 1 760 · 2 200): nearest is 880 at 117 Hz = 4.7 bins at 25 Hz spacing → −51 dB under Hann (§2.1); acceptable, so **997 Hz is retained** — changing the frequency would sever comparability with S2's fixture for no measurable gain.

---

## 4. Q3 — Reading law (predeclared; witness criteria only, never constitutional, never a change to the K00-06 law or readers)

> ⚠️ Superseded numerically by §10.B (founder ruling §9): the leakage bound `Lk = 3.5e-6 × e880Max + 1e-9 × e440Max` applied power-domain ratios to magnitude-domain quantities and understates leakage by orders of magnitude; the V2 contrast test is replaced by the ordered 2 Hz measure. Structure and taxonomy stand; numbers are re-derived in §10.B.

All quantities per invocation, self-calibrated from that invocation's own pre-output baseline windows (the §7.2 discipline), read from `input_source_sample` beside the unchanged `input_health_sample`. Let `B997`, `B700`, `B1200` be the medians of `e997Mean`, `e700Mean`, `e1200Mean` over the healthy pre-output baseline windows; `C = max(B700, B1200)` the in-band noise reference.

**Validity (row admitted to the reading):**
- V1 stimulus visible at baseline: `B997 ≥ 10 × C` (≥ 20 dB above the control bands) in ≥ 2 healthy baseline windows; else **UNMEASURED-SRC** (stimulus not resolvable at the seam even at rest — the row says nothing about rendering).
- V2 (S-b only) temporal signature at baseline: median `e997Max / e997Min` over baseline windows ≥ 4 (≥ 12 dB contrast) — the gate is seen; else UNMEASURED-SRC.
- V3 stimulus custody `VALID` (existing batch TSV) and the entry classifier's row is a gen-1 listen or a lawful recovery with the window inside a listening generation (existing rows, unchanged).

**Per full rendering window** (same definition as §18.31.6: a 1 s window wholly inside a scheduled stream), with leakage bound `Lk = 3.5e-6 × e880Max + 1e-9 × e440Max` (the −51 dB / −93 dB factors of §2.1, applied to the *measured* own-tone bins of that same window):
- **NEAR-END-SURVIVES:** `e997Mean ≥ 0.1 × B997` (within 20 dB of its own baseline) ∧ `e997Mean ≥ 10 × max(C, Lk)` ∧ (S-b) contrast `e997Max/e997Min ≥ 4`.
- **NEAR-END-SUPPRESSED:** `e997Mean < 0.01 × B997` (≥ 40 dB below baseline) ∧ `callbacks ≥ 90` ∧ `ioRunning true` — the tone is gone from the seam while capture continues (the A′ shape, now source-attributed).
- **OWN-PLAYBACK-RESIDUAL-PRESENT** (descriptive, orthogonal, never a gate): `e440Mean ≥ 10 × C` in that window — quantifies residual echo of MAIA's own tone at the seam per window; K00-06's amendment moved any AEC gate to KERNEL-01/BENCH-01, so this is evidence only.
- **INDETERMINATE-SRC:** between the two 997 bands, or `Lk` within 10× of `e997Mean` (leakage could explain it), or a `frameReset` in the window.

**Per row:** every full rendering window NEAR-END-SURVIVES → **NEAR-END SURVIVES**; every window NEAR-END-SUPPRESSED → **NEAR-END SUPPRESSED**; mixed → **CHARACTERIZE-SRC** with the windows listed. Own-playback residual is reported beside each verdict, never folded into it.

**Mapping to the open hypotheses (exactly the founder's framing):** NEAR-END SURVIVES in a window where S2-style `signal` also persists → that window's surviving energy **is** (at least partly) the independent near-end source — A-consistent *as originally defined*; NEAR-END SUPPRESSED with `signal` still present → the surviving energy is **not** the near-end source (own-playback residual and/or processor output) — the 22-window question resolves toward A′ for that window; NEAR-END SUPPRESSED with `signal` absent → the S2 collapse windows, now attributed. **No reading here earns K00-06 PASS**, moves the 3/5/2 K00-06 population, or reopens S3; it answers the discriminator and returns.

**Population shape (proposal, founder's numbers to rule):** N = 10 per arm, no top-up, the S2 conduct (stimulus spanning the whole invocation, Mac Studio Speakers at 69 paired with restoration, cold precondition, Mode L, VP ON, output act, cancel-at 1 000 ms) unchanged; S-a arm N = 5 first, then S-b N = 10; readings per row; population verdict = tally + CHARACTERIZE-SRC if mixed, never forced.

---

## 5. Q4 — Minimal surface: evidence-only, no behaviour change

| File | Change | Byte-identical to `ac12dedf4`? |
|---|---|---|
| `AudioGraph.swift` | `SourceObservation` struct (5 magnitudes + frame bookkeeping); Goertzel/Hann state and coefficients set at start **after** `input_format_read` and before `callbacks_armed` (no new call into the unit; pure arithmetic from the already-read rate); the recurrence inside `pullInput` after `measure`; a second closure `onSource: ((SourceObservation) -> Void)?` fired once per closed frame (25/s, not per callback) — `onInput` and `InputObservation` untouched | **no** (this is the substrate's interior, the same file every prior subject change lived in) |
| `VoiceKernel.swift` | `ag.onSource` hop; `SourceAggregate`; `input_source_sample` journalled from the existing `sampleIfDue` tick (one new `journal(...)` call; evidence dict only) | **no** (two seams: one hop, one record) |
| `HealthSupervisor.swift` · `RecoveryPolicy` · `StateProjection` · `KernelState` · `Journal` · `Replay.swift` · `AudioSessionAuthority` · `RouteComparison` · harness `Harness/*.swift` · `Package.swift` | none | **yes** — every invariant file, and `InputObservation`/`classify`/thresholds/health meaning untouched |
| `PureLogicTests.swift` | Goertzel unit vectors: a synthetic 997 Hz sine at rms 1e-3 → bin ≈ 7.07e-4 ± 1 %; 440 Hz sine → 997 bin ≤ −90 dB; 880 Hz → 997 bin ≤ −50 dB; silence → 0; a 2 Hz-gated tone over 1 s → contrast ≥ 4 | tests follow the subject |
| `project.yml` | new bundle id / display name (custody delta, e.g. `life.soullab.voicekernel.vpio02sid` / `VoiceKernel VPIO-02-SID`; founder names it) — the frozen `.vpio02` install is never overwritten | custody only |
| Gate | pins: the estimator lives only in `AudioGraph.swift`; `input_health_sample` keys unchanged; `input_source_sample` never read by `HealthSupervisor`/policy/projection; bin list closed; no new timer, no new AVAudio call, no threshold | instrument |
| Readers | **`k00-ledger.py` and `k00-output-ledger.py` unchanged** (regression over all 559 journals must be row-identical); NEW evidence-only `k00-source-ledger.py` implementing §4 with a self-test on synthetic journals | instrument |
| Batch / driver / reinstall | S-b fixture + token + preflight/gate checks (duty, on/off crossings, SHA); subject row for the new bundle; driver untouched (the app under test still receives nothing) | instrument (later witness work, own ruling) |

**Behaviour claim, falsifiable at the gate:** no control-flow, health, recovery, floor, threshold or classification path reads `SourceObservation` or `input_source_sample`; the only new runtime effects are ≈12 MAC/sample on the audio thread and 25 actor hops/s. That is the entire diff budget; anything beyond it is refused at design time (F-S1 below).

---

## 6. Observer-effect firewall and subject identity

- The addition is **not** an AVAudio read (the census's INTRUSIVE class): it is arithmetic on samples the organism already owns, plus coefficient setup from a rate already read. It touches no startup call, no session, no unit property. On that reasoning the P5-F1 risk is small — **and the design still treats the instrumented build as a NEW SUBJECT** by custody (new SHA · new bundle · own UUID/dylib SHA/manifest · own witness lineage), because P5-F1 taught that reasoning about inertness is not evidence of it.
- What the first population observes for free: every sample is a cold gen-1 entry, so the entry classifier's rows (K00-04 axis) travel with the source population; if the instrumented subject stops listening, the population reads that first and the source reading is moot. Whether a separate F-W1-style entry witness must precede any source population is the founder's call (recommendation: no separate entry witness; the entry rows inside the population are the check, and a drop below the S2-era 10/10 gen-1 listens is itself a finding to return).

---

## 7. Falsifiers

**Design-time refusals (F-S1…F-S6, any one → the design is rejected, not adapted):** F-S1 a diff outside §5 · F-S2 any read of `SourceObservation`/`input_source_sample` by health, policy, projection or the entry/output readers · F-S3 any new AVAudio/AudioUnit call, timer, allocation or lock on the audio thread · F-S4 a per-frame journal record (record budget) · F-S5 raw audio, wide-band spectrum or phase stored anywhere · F-S6 a threshold in §4 promoted to constitutional or used to move a K00-06 row.

**Instrument validation before any device act (offline, gate-pinned):** the §5 unit vectors; the source reader's self-test on synthetic journals covering every §4 class and every UNMEASURED-SRC path; the frozen readers' row-identical regression; the S-b fixture's header/frames/crossings/duty/SHA check.

**First-witness readings that would falsify the design (return, never adapt):** V1 fails on ≥ 3 of 5 S-a rows (the seam cannot resolve the stimulus even at rest — the level or the frequency is wrong for this route, not the processor) · V2 fails on S-b rows while V1 passes (the gate is being smoothed before the seam — the stimulus design, not the organism, is the obstacle) · `Lk` within 10× of `e997Mean` in most rendering windows (the own tone's harmonics dominate the bin: move the stimulus frequency, a new fixture) · the instrumented subject's gen-1 listens drop materially below 10/10 (P5-F1 again: the instrument changed the subject; stop and return).

---

## 8. Sequence (the founder's, restated as gates) and rulings owed

```text
SOURCE-ID-01 DESIGN (this record)      ← returned
      ↓ founder ruling on Q1–Q4 + the four items below
minimal evidence instrument            new SHA · new bundle · tests · gate · new reader · S-b fixture + token
      ↓ offline / gate validation      unit vectors · reader self-test · frozen-reader regression · fixture check
      ↓ MAC-COMPILE (own act)          build · test · gate · xcodegen · unsigned · signed · custody identity
      ↓ first install (own act)        JIT absence read for the new bundle · one install · `.vpio02` untouched
      ↓ one controlled population      S-a N=5 then S-b N=10, paired restoration, if authorized
      ↓ source-specific reading        §4, per row, returned
only then                              reconsider S3 (redesigned, not inherited) / KERNEL-00
```

Rulings owed (in order): **(1)** Q1 estimator accepted as specified (40 ms Hann, bin set `B`, one `input_source_sample`/s)? **(2)** Q2: S-b gated 997 Hz as the population stimulus with an S-a N=5 measurement arm first — or S-a only, or another shape? **(3)** Q3 reading law as predeclared (the 10×/20 dB/40 dB witness criteria, the leakage bound, the four classes, the hypothesis mapping) — numbers are proposals, the structure is the design? **(4)** Q4 surface accepted as the whole diff budget; new bundle id named; separate entry witness required or not (§6)? Then, separately and only after (1)–(4): implementation authority.

**Nothing opens with this record.** S3 CLOSED · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE · KERNEL-00 NOT ACCEPTED · C-D26 HOLD · `.vpio02` untouched · no device act · no code.

---

## 9. Founder ruling on §1–§8 (2026-09-15) — spectral core ACCEPTED · Q1 aggregate AMEND REQUIRED · Q2 S-b ACCEPTED, S-a NOT OPEN · Q3 structure ACCEPTED, numbers AMEND REQUIRED · Q4 surface ACCEPTED IN PRINCIPLE, separate entry witness REQUIRED · implementation NOT AUTHORIZED

Substance verbatim:

1. **Q1 — ACCEPTED IN PART.** Accepted: the consumed post-VP buffer after `AudioUnitRender` · no second AVAudio/AudioUnit read · 40 ms Hann frame (justified: ≈ −51.2 dB 880→997, −93 dB 440→997; the 10 ms alternative materially unsafe) · fixed-frequency magnitude measurement · source evidence only, no health/control meaning · one aggregate record on the existing 1 s tick · no raw audio, phase or wide-band spectrum · new subject by custody. **Defect A:** `e997HighFrames / e997LowFrames` preserves how many high/low frames occurred, not their order — it proves contrast, not a 2 Hz gated signature; random or processor-induced fluctuation could satisfy the same counts. Amend so the 1 s record carries a **phase-independent measure of the 2 Hz modulation of the 997 Hz magnitude envelope** (e.g. a fixed 2 Hz Goertzel/DFT magnitude over the ordered 40 ms `e997` frames); no phase stored; still non-invertible and one per second. Also correct the frame arithmetic: ≈ 25 frames/s; a 50 % duty 250 ms gate gives ≈ 12–13 high and 12–13 low frames per second, not ≈ 6/6.
2. **Q2 — S-b ACCEPTED; S-a N=5 NOT AUTHORIZED.** Gated 997 Hz, 250 ms on / 250 ms off, is the first source-identification population stimulus: frequency plus a known 2 Hz amplitude modulation is materially stronger than frequency alone and does not make the stationary-noise-suppression side question a mandatory population. The stationary arm stays a legitimate optional characterization experiment, not a precondition. Chirp/PRN = escalation only. N = 10 proposal retained.
3. **Q3 — STRUCTURE ACCEPTED; NUMBERS NOT ACCEPTED AS WRITTEN.** The taxonomy (UNMEASURED-SRC · NEAR-END-SURVIVES · NEAR-END-SUPPRESSED · CHARACTERIZE-SRC · INDETERMINATE-SRC, own-playback residual descriptive only), the self-calibrated baseline discipline and the separation from K00-06 are accepted. **Defect B:** the estimator outputs are magnitudes, yet `Lk = 3.5e-6 × e880Max + 1e-9 × e440Max` uses power-domain ratios: −51.2 dB amplitude → 10^(−51.2/20) ≈ 2.75e-3, −93 dB → ≈ 2.2e-5; the written bound understates leakage by orders of magnitude and the `10 × Lk` test cannot be accepted. The amended law must (i) use amplitude-domain coefficients with magnitude measurements, (ii) explicitly account for every own-tone harmonic the leakage claim relies on, or conservatively bound unmeasured ones, (iii) replace the unordered contrast test with the corrected 2 Hz measure, (iv) re-derive the V2 / SURVIVES / INDETERMINATE thresholds from those corrected quantities. The 20 dB visibility, ≥ 40 dB suppression and indeterminate-band shapes are reasonable; their numerical ratification waits for the corrected derivation.
4. **Q4 — SURFACE ACCEPTED IN PRINCIPLE, SEPARATE ENTRY WITNESS REQUIRED.** Diff budget accepted (AudioGraph interior · VoiceKernel source hop + aggregate/record · tests · new fixture/token + evidence-only source reader · gate isolation proofs · frozen readers unchanged · `.vpio02` untouched · no health/recovery/classification/projection/session/route semantics). The runtime observer cost (extra audio-thread arithmetic, ≈ 25 source-observation actor hops/s) is exactly why "it should be inert" is not enough after P5-F1. **New subject named: bundle `life.soullab.voicekernel.vpio02sid` · display `VoiceKernel VPIO-02-SID`.** A separate entry witness is required before any source population — the population must not answer *did the new in-process observer perturb entry?* and *what source survives during duplex rendering?* at once. That entry witness is not opened here; its shape belongs in the implementation/qualification pin after the design correction.

**Authorized now: only a read-only amendment correcting A and B and returning the amended Q1/Q3 arithmetic and law.** No implementation, compile, install, entry witness, Mac playback or population.

```text
SOURCE-ID-01 spectral core     ACCEPTED
Q1 aggregate                   AMEND REQUIRED
Q2 gated 997 Hz                ACCEPTED
S-a stationary arm             NOT OPEN
Q3 taxonomy/structure          ACCEPTED
Q3 numerical law               AMEND REQUIRED
Q4 diff budget                 ACCEPTED IN PRINCIPLE
SID bundle                     life.soullab.voicekernel.vpio02sid
separate SID entry witness     REQUIRED · NOT OPEN

implementation                 NOT AUTHORIZED
device act                     NONE
S3                             CLOSED
K00-06                         CHARACTERIZE ONLY · INCOMPLETE
KERNEL-00                      NOT ACCEPTED
```

---

## 10. Amendment (read-only, under ruling §9) — A: ordered 2 Hz source signature · B: magnitude-domain leakage law · re-derived thresholds

Every number below was computed here (Hann, N = 1 920, fs = 48 000; 40 ms frames at 25/s; script results quoted); the amended coefficients are to be **recomputed by the instrument for the actual observed rate and frame length and pinned by the gate** at implementation time — these are the design values.

### 10.A Amended Q1 aggregate — the 2 Hz signature is measured on the *ordered* frame sequence

Per closed 40 ms frame the estimator yields magnitudes `e_b` for each bin `b`. Within each 1 s tick window the kernel keeps, for the stimulus bin and the own-fundamental bin, the **ordered** sequence of frame magnitudes `e997[k]`, `e440[k]` (`k = 0 … K−1`, `K` ≈ 25–26, fixed-size ring buffer sized for the longest tick, no allocation) and computes at the tick, then discards:

```text
X0   = Σ_k e[k]
X2   = | Σ_k e[k] · exp(−j·2π·2 Hz·(k·0.040 s)) |        (one fixed-frequency DFT bin at exactly 2 Hz over frame time; K need not be 25)
m2   = 2·X2 / X0                                        (modulation index of the magnitude envelope at 2 Hz; phase-independent; 0 for a steady envelope)
```

Evidence on `input_source_sample` (replacing `e997HighFrames / e997LowFrames`): per bin `e<b>Mean · e<b>Max · e<b>Min` · **`m2_997` · `m2_440`** · `frames` (= K) · `frameMs` (40) · `frameReset` · `analysisRateHz` · `binsHz`. Still one record per second, still five-to-seven magnitudes plus two scalar indices, still non-invertible: `m2` is a magnitude of one DFT bin of the *envelope*, no phase, no waveform. `m2_440` is the control: MAIA's own tone is continuous over its 3 s stream, so its residual at the seam must read `m2_440 ≈ 0`; a 2 Hz index on the 440 bin would itself be an anomaly to record.

**Frame arithmetic (corrected):** 25 frames/s; a 250 ms on / 250 ms off gate spans 6.25 frames per half-period, so a window holds ≈ 12–13 ON frames and ≈ 12–13 OFF frames, with 4 transition frames per second carrying intermediate values.

**Expected values (computed):** ideal 50 % gate, random phase relative to the frame grid, K = 25 or 26 → **`m2` = 1.21 … 1.31** (median 1.26); a gate whose ON half is progressively attenuated to 30 % inside each 250 ms (the noise-suppressor-adapting shape) → `m2` ≈ 1.33 (still a strong 2 Hz line); **unmodulated frames with heavy random fluctuation (σ/μ ≈ 1)** → `m2` median 0.23, 95th percentile 0.48, 99th 0.60, **max 0.82 over 4 000 trials**; σ/μ ≈ 0.3 → max 0.39. Hence the predeclared signature threshold **`m2_997 ≥ 0.9`**: ≥ 0.3 below the ideal gate's minimum, ≥ 0.08 above the worst unmodulated draw observed, and no unmodulated 4 000-trial draw reached it. (0.5, the first draft's implicit margin, would have admitted ≈ 5 % false signatures per window under heavy fluctuation.)

**Bin set (Q1 leakage accounting, ruling item 3(ii)):** the design bin set `{440, 880, 997, 700, 1200}` measures only the first two own-tone harmonics the leakage bound relies on. Two options, founder's choice: **(recommended) measure the harmonics the bound uses — add 1 320 and 1 760 Hz** (7 bins; ≈ 14 MAC/sample + Hann, still trivial; the 1 200 Hz control sits 4.8 bins from 1 320, leak 1 320 → 1 200 = 1.8e-3 amplitude, acceptable as a control) — or keep 5 bins and **bound unmeasured harmonics conservatively by the 2nd**, i.e. assume `e1320, e1760, e2200 ≤ e880` (adds (4.0e-5 + 1.1e-5 + 8.4e-7) ≈ 5.2e-5 to the 880 coefficient, +1.9 %; an assumption about speaker distortion, stated as one). §10.B is written for the 7-bin set with the 5-bin fallback shown.

### 10.B Amended Q3 numerical law — amplitude domain throughout

All estimator outputs are magnitudes (normalized DFT magnitudes; a full-scale sine reads 0.5; a tone of rms *r* reads ≈ *r*/√2). All ratios below are **amplitude ratios**: 10× = 20 dB, 100× = 40 dB.

**Leakage coefficients into the 997 Hz bin (amplitude, Hann N = 1 920):**

| Own-tone component | Amplitude coefficient `a` into 997 | dB |
|---|---|---|
| 440 Hz (fundamental) | **2.16e-5** | −93.3 |
| 880 Hz (2nd) | **2.77e-3** | −51.2 |
| 1 320 Hz (3rd) | **4.00e-5** | −88.0 |
| 1 760 Hz (4th) | **1.12e-5** | −99.0 |
| 2 200 Hz (5th) | 8.4e-7 | −121.5 |

**Leakage bound per window** (using each harmonic's *measured* maximum in that window; 7-bin set):

```text
Lk = 2.77e-3·e880Max + 2.16e-5·e440Max + 4.00e-5·e1320Max + 1.12e-5·e1760Max
     (5-bin fallback, conservative: Lk = 2.82e-3·e880Max + 2.16e-5·e440Max, assuming higher harmonics ≤ e880)
```

Sanity against S1/S2 levels: under VP OFF (S1) the own tone read ≈ 0.06 rms at the seam; if its 2nd harmonic were as large as 10 % of that (≈ 4e-3 magnitude), `Lk` ≈ 1.1e-5 — two orders below a 7e-4 stimulus; under VP ON (S2 full windows ≈ 2e-3 rms total) `Lk` is smaller still. The bound is therefore rarely binding, but it is now dimensionally correct and computed from what was measured, not assumed.

**Noise references (magnitudes):** `C_base = max(B700, B1200)` over healthy pre-output baseline windows (medians); `C_w = max(e700Mean, e1200Mean)` of the window being read (rendering may raise the floor); `F_w = max(C_base, C_w, Lk)`.

**Validity (row admitted):**
- **V1** `B997 ≥ 10 × C_base` (stimulus ≥ 20 dB above the control bands at rest) in ≥ 2 healthy baseline windows.
- **V2 (amended)** median `m2_997` over healthy baseline windows **≥ 0.9** (the gate is seen at rest as a 2 Hz line on the envelope; unordered contrast no longer used anywhere).
- **V3** stimulus custody `VALID`; entry row lawful (unchanged).
- Any of V1–V3 failing → **UNMEASURED-SRC** (the row says nothing about rendering).

**Per full rendering window** (definition unchanged):
- **NEAR-END-SURVIVES:** `e997Mean ≥ 0.1 × B997` (within 20 dB of its own baseline) ∧ `e997Mean ≥ 10 × F_w` (≥ 20 dB above noise *and* above the amplitude-domain leakage bound) ∧ **`m2_997 ≥ 0.9`** (the surviving 997 Hz energy carries the Mac's 2 Hz gate — this is what makes it *the near-end source* rather than any 997 Hz energy).
- **NEAR-END-SUPPRESSED:** `e997Mean < 0.01 × B997` (≥ 40 dB below its baseline) ∧ `callbacks ≥ 90` ∧ `ioRunning true` (no `m2` condition: there is nothing to modulate).
- **INDETERMINATE-SRC** with a reason code, any of: `between` (0.01 × B997 ≤ e997Mean < 0.1 × B997) · `floor` (e997Mean ≥ 0.1 × B997 but < 10 × F_w — energy present but not resolvable above noise/leakage) · **`signature_absent`** (amplitude conditions of SURVIVES met but `m2_997 < 0.9`: 997 Hz energy is present yet not gated — residual, leakage, or processor artefact; explicitly *not* attributed to the near-end source) · `frameReset`.
- **OWN-PLAYBACK-RESIDUAL-PRESENT** (descriptive, orthogonal): `e440Mean ≥ 10 × max(C_base, C_w)`; reported with `m2_440` (expected ≈ 0).

**Per row / population:** unchanged from §4 — every full window SURVIVES → NEAR-END SURVIVES; every window SUPPRESSED → NEAR-END SUPPRESSED; otherwise CHARACTERIZE-SRC with windows listed; hypothesis mapping as §4; no K00-06 PASS.

**What changed and why it matters:** a window can now be *A-consistent in amplitude* (energy persists) and still be **`signature_absent`** — which is precisely the S2 ambiguity (§18.32: *whose energy survives in the 22 windows*) rendered as a measurable, per-window outcome instead of an interpretive limitation.

### 10.C Standing after the amendment

Design amended as ruled; nothing else moves. Owed from the founder: acceptance of §10.A (including the 7-bin vs 5-bin choice) and §10.B; then, separately, the implementation/qualification pin that also shapes the **required SID entry witness** (`life.soullab.voicekernel.vpio02sid` · `VoiceKernel VPIO-02-SID`) — none of which is opened by this amendment. Implementation NOT AUTHORIZED · device act NONE · S-a NOT OPEN · S3 CLOSED · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE · KERNEL-00 NOT ACCEPTED.
