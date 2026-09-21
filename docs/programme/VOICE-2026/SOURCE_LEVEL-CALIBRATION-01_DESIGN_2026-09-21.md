# VOICE-2026 — SOURCE LEVEL-CALIBRATION-01 Design — 2026-09-21

**Status:** DESIGN ONLY · records-only act · no device execution, playback, install, launch, sample, threshold change, or acceptance authority.

**Opening basis:** record-of-record `4e2600a406712bbfae6c6cdad2d21401bedb9554`, especially §10.62 / §18.87 / §10.105.

## 1. Question

SOURCE-03 completed lawfully but all ten source rows remained `UNMEASURED-SRC: stimulus_not_visible`.

The post-run reading established:

- the 997 Hz source **did reach the consumed post-VP seam**;
- the 2 Hz gated signature was present in every journal;
- stimulus/output custody was valid;
- baseline 997-to-control separation was only **9–15 dB**;
- the frozen V1 visibility bar is **20 dB**;
- the design's own falsifier therefore fired: **return, never adapt**.

This act asks one bounded question:

> **What prospectively pinned source level, at a recorded fixed geometry, makes the existing gated 997 Hz source visible at the consumed seam with enough margin that a fresh source-discrimination population is valid under the unchanged reader law?**

This act does **not** ask whether the old ten rows should be re-read. They remain UNMEASURED forever.

---

## 2. Non-negotiable invariants

The following are frozen:

- V1 visibility threshold: `B997 >= 10 × C_base` (20 dB);
- ordered 2 Hz source-signature law and its existing threshold;
- source taxonomy and source reader semantics;
- K00-06 law;
- SID organism and source estimator semantics;
- historical SOURCE-03 evidence;
- Mac Studio default route remains **Mac Studio Speakers / built-in**;
- system output volume remains **69** during this calibration;
- no MAIA 440 Hz rendering during the calibration rows;
- VP ON is the authority-setting used to choose the source pin.

A passing calibration selects a **new source-level pin**. It does not alter S2, SOURCE-03, or any historical pin.

---

## 3. Geometry custody

The largest uncontrolled variable in SOURCE-03 was physical geometry. This act makes geometry part of the evidence.

Before the first row, record once:

- iPhone model and installed SID bundle/container identity;
- phone orientation;
- which phone edge/microphone is aimed toward the Mac Studio;
- speaker used;
- phone-to-speaker distance in centimetres;
- whether the phone and Mac remain stationary on hard surfaces/stands;
- room-door/window state and any obvious continuous noise source.

The geometry record is immutable for the entire calibration. Any movement beyond ordinary handling noise invalidates the remaining rows and returns the act; the run is not silently resumed at a new geometry.

No human ear is used as the measurement point. Headphones are forbidden.

---

## 4. Source-level ladder

The old SOURCE-03 effective source was the existing 997 Hz gated fixture at file peak 0.20 FS played with host gain 0.50, i.e. nominal effective peak ≈0.10 FS before the Mac output chain.

To avoid relying on undocumented host gain above unity, implementation should generate **one new deterministic 997 Hz gated master fixture**:

- 48 kHz;
- mono PCM16;
- 997 Hz carrier;
- 250 ms on / 250 ms off (2 Hz, 50 % duty);
- peak amplitude **0.70 FS**;
- duration sufficient for both calibration and the later N=10 source population;
- exact header/frame/duty/crossing/SHA validation before use.

The host playback gain is never greater than 1.0.

Three prospective calibration levels are derived from that one sealed master:

| Level | Master playback gain | Nominal effective peak | Increase vs historical SOURCE-03 effective peak |
|---|---:|---:|---:|
| L1 | 0.285714 | 0.20 FS | +6.0 dB |
| L2 | 0.571429 | 0.40 FS | +12.0 dB |
| L3 | 1.000000 | 0.70 FS | +16.9 dB |

The exact generated PCM peak and host gain must be independently checked before any phone act. If the playback path cannot prove that these gains are applied without digital clipping, implementation refuses before execution.

The ladder is closed. There is no L4 under this act.

---

## 5. Phase A — VP-ON level calibration

Each level is a separately sealed **N=5** at-rest population.

For every row:

- cold lawful SID entry under the established zero-harness custody;
- VP ON;
- Mode L;
- gated 997 Hz source active;
- **no 440 Hz MAIA render act**;
- enough healthy baseline windows for the frozen source reader to evaluate V1 and the ordered 2 Hz signature;
- export journal;
- terminate according to the already accepted source witness custody;
- no top-up or row replacement.

### Sequential rule

The levels are evaluated in order L1 → L2 → L3.

A level is **CALIBRATION-PASS** only if all five rows satisfy all of:

1. existing source-reader V1 is valid;
2. ordered 2 Hz source signature is valid;
3. per-row `20*log10(B997 / C_base) >= 26 dB`.

The 26 dB requirement is **not a new source-reader threshold**. It is a calibration-selection margin: the frozen 20 dB reader bar plus a prospectively declared 6 dB operating margin.

The **first** level whose five rows all pass becomes the selected source-level pin. Higher levels are not executed.

If a level fails, all five rows remain frozen evidence and the next predeclared level may run. No failed row is replaced.

If L3 fails, the act returns **NO LEVEL PIN**. The threshold is not changed and no stronger source level is invented under this authority.

### Why the margin exists

SOURCE-03 missed V1 by approximately 5–11 dB. Selecting a source that merely grazes 20 dB would leave the next N=10 population vulnerable to ordinary room/geometry variation. The 6 dB margin is therefore an execution-stability requirement, not a reinterpretation of the source discriminator.

---

## 6. Phase B — VP-off attribution arm

After, and only after, Phase A selects a level, execute one **N=3** characterization arm at the exact selected level and exact same geometry with **VP OFF**.

This arm cannot change the selected source pin and cannot earn any KERNEL-00 PASS. Its sole purpose is to separate two explanations left unresolved by SOURCE-03:

- acoustic/geometry/source-level limitation;
- attenuation introduced by the voice-processing path.

For each VP-OFF row compute the same at-rest `B997/C_base` dB measure and ordered 2 Hz signature.

Read descriptively against the VP-ON selected-level population:

- median VP-OFF minus VP-ON separation **>= 6 dB** → `VP_ATTENUATION_MATERIAL`;
- delta **< 3 dB** → `VP_EFFECT_SMALL_AT_CALIBRATION_LEVEL`;
- 3–6 dB → `MIXED_OR_INDETERMINATE`.

These labels are characterization only. No source threshold, recovery policy, AEC requirement, or K00-06 law is created from them.

If VP OFF cannot be entered lawfully without changing organism semantics or custody, Phase B is refused and Phase A may still produce a valid source-level pin.

---

## 7. Acoustic and operator safety

This is an instrument calibration, not a listening test.

- no headphones;
- no ear placed near the Mac speaker;
- system volume remains 69;
- master PCM peak never exceeds 0.70 FS;
- 50 % duty gating remains in force;
- calibration rows use only the minimum source duration required to acquire the declared baseline windows;
- any audible distortion, unexpected clipping evidence, or operator discomfort → immediate STOP and return; no louder level is attempted under the same act.

A safety stop is not a failed physiological row.

---

## 8. Minimal implementation surface

If separately authorized, implementation may touch only:

- deterministic gated-fixture generator / fixture validation;
- source calibration preflight/pin wrapper;
- source calibration batch wrapper;
- evidence-only calibration reader/report;
- records, hashes and tests.

Frozen:

- `ios/VoiceKernel/**`;
- `ios/VoiceKernelHarness/**`;
- source estimator and `input_source_sample` schema;
- all existing source/output/entry readers and thresholds;
- historical SOURCE-03 scripts/evidence;
- C1 duplex implementation;
- KERNEL-00 law.

If implementation requires an organism/harness runtime change, this design is falsified and must return.

---

## 9. Output of the act

A successful act returns one immutable source pin containing at least:

- selected level L1/L2/L3;
- master fixture SHA-256 and validated audio metadata;
- host playback gain;
- nominal effective PCM peak;
- Mac system volume 69;
- built-in output identity;
- fixed geometry record;
- VP ON;
- five calibration journal SHAs and reading table;
- optional VP-OFF three-row characterization table.

It does not modify the historical SOURCE-03 pin.

---

## 10. What the pin opens — and what it does not

Only after the calibration result is adjudicated may a **fresh N=10 S-b source-discrimination population** be opened.

That future population must:

- use the selected source pin exactly;
- use VP ON / Mode L;
- use fresh preflight and one-shot authority;
- keep zero-harness custody;
- keep the frozen 20 dB V1 and ordered 2 Hz source law;
- never pool or reinterpret SOURCE-03 rows.

Even a green source population does **not** by itself accept K00-06 or KERNEL-00.

C1/C2/C3/C4/C5 remain separately governed.

---

## 11. Standing

`SOURCE LEVEL-CALIBRATION-01` design is returned for adjudication.

- threshold change: **NONE**
- organism change: **NONE**
- harness change: **NONE**
- device act: **NONE**
- playback act: **NONE**
- old-row reinterpretation: **FORBIDDEN**
- VP-off arm: **included as non-gating characterization**
- next possible implementation: fixture + wrapper + reader only
- K00-06: **INCOMPLETE**
- KERNEL-00: **NOT ACCEPTED**
- BRIDGE-01: **CLOSED**
- MIGRATE-01 / production native voice: **CLOSED**
