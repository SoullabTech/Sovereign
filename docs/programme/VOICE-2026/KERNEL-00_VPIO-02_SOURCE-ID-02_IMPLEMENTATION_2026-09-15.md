# KERNEL-00 · VPIO-02 · `SOURCE-ID-02` — IMPLEMENTATION RECORD (code/offline only · 2026-09-15)

**Authority:** founder ruling on `d02ce1094` (design record §9–§11; discriminator plan §18.34): *SOURCE-ID-02 implementation is now AUTHORIZED, code/offline only* — diff budget = the ruled Q4 surface; return before any Mac compile with the named offline evidence. **Nothing else is open:** Mac compile CLOSED · install CLOSED · SID entry witness REQUIRED · CLOSED · S-b N=10 CLOSED · S-a NOT OPEN · S3 CLOSED · device execution authority NONE.

**Implementation SHA: `6f0e2e0b25ff74636dab21b6c4239865ba51c691`** (one commit, instrument + organism + tests + gate together, gate read green before it). ⛔ **NOT COMPILED** — no Swift toolchain in this container; the Swift below earns itself on the Mac under its own MAC-COMPILE authority, which this record does not open. **Subject by custody:** bundle `life.soullab.voicekernel.vpio02sid` · display `VoiceKernel VPIO-02-SID` · UUID / dylib SHA / executable SHA / manifest **UNRECORDED** (they exist only after a compile; the reinstall refuses the subject with `pins-unrecorded` until then).

---

## 1. Diff inventory (exactly the ruled surface)

| File | Lines | What |
|---|---|---|
| `ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift` | +147 | `SourceObservation` (7 magnitudes in `SIMD8<Double>` lanes, frame bookkeeping) · `SourceEstimator` (fixed-bin Goertzel over a Hann frame of 4 callbacks; coefficients `2cos(ω)` from the OBSERVED rate; Hann by cos/sin recurrence; state = three `SIMD8` + scalars; no allocation, no lock, no unit call; callback-size change → frame discarded + `reset` flag) · `SourceSignature.modulationIndex` (`m2 = 2·|X(2 Hz)|/X(0)` over frame time) · one hook in `pullInput` after `measure()` on the same consumed buffer; `onSource` fired outside the buffer closure · estimator constructed after `try hw.requireValid()` and before `callbacks_armed` (no trace step; the fourteen seams unchanged, gate-proven) |
| `ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift` | +50 −1 | `ag.onSource` hop (25/s) · `SourceAggregate` (per-bin sum/max/min, **ordered** `e997`/`e440` envelopes, cap 64) · `handleSource` (generation gate → `sourceAgg.add`, nothing else) · `input_source_sample` journalled once, component `SourceEvidence`, cause `sample`, from the existing `sampleIfDue` tick beside an unchanged `input_health_sample`; **never assigned to `lastObservationSeq`** (never a causal parent) · resets with the health aggregate at generation begin and at each tick |
| `ios/VoiceKernel/Tests/VoiceKernelTests/PureLogicTests.swift` | +113 | `SourceEstimatorTests` ×6 (§3) |
| `ios/VoiceKernelHarness/project.yml` | 2 lines | bundle `life.soullab.voicekernel.vpio02sid` · display `VoiceKernel VPIO-02-SID` |
| `scripts/witness/fixtures/k00-sid-nearend-997hz-gated-2hz-180s.wav` + `.sha256` | new | 997 Hz · 180 s · mono · 48 kHz · PCM16 · peak 0.20 FS · 250 ms on / 250 ms off (2 Hz, 50 % duty) · 2 ms raised-cosine edges · OFF halves digital zero · **SHA `30d51cf4b7527d28131bd9c2535c6bd4dcd2403c8dc0343fc045f6f6959875eb`** (generator in §4, reproducible) |
| `scripts/witness/k00-source-ledger.py` | new | evidence-only source reader, §10.B law as ruled §11 (§5) |
| `scripts/witness/k00-driver-batch.sh` | +26 −2 | SID subject row · `CLASSIFIER_SUBJECT` mapping (`vpio-02-sid → vpio-02`) on the entry-classifier line · second header line `classifierSubject=` when it differs · token `sid-nearend-gated` (lawful only with `--subject vpio-02-sid`); **`s2-nearend` now refused with `vpio-02-sid`** (the stationary S-a arm is NOT OPEN on the SID subject, as ruled) · `SOURCE_LEDGER` only under the gated token · source reader invoked inside the output guard after the two frozen readers |
| `scripts/witness/k00-reinstall.sh` | +13 −1 | `VPIO02SID_*` constants (bundle set; five pins EMPTY) · SID case row · `pins-unrecorded` refusal before any device read |
| `ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift` | +4 −1 | SID subject row + closed-set string; the app under test still receives nothing (⚠️ named by me as a custody declaration *necessary to recognize the subject* — the batch launches by the driver's table; founder may reject) |
| `__tests__/voice-kernel-00-source-gates.test.ts` | +237 | gate by history (§6) |

**Byte-identical to `ac12dedf4` (gate-proven, per file):** `AudioSessionAuthority.swift` · `HealthSupervisor.swift` · `Journal.swift` · `KernelState.swift` · `RecoveryPolicy.swift` · `Replay.swift` · `RouteComparison.swift` · `StateProjection.swift` · `Package.swift` · every `Harness/*.swift`. **Byte-identical to `b198e2e37`:** `k00-ledger.py` · `k00-output-ledger.py` (frozen readers). `InputObservation`, `classify`, thresholds, health meaning, recovery, projection, route/session semantics, harness behaviour, installed `.vpio02`: untouched.

## 2. Two explicit substitutions on historical instrument lines (pinned, not hidden)

The batch and reinstall preservation law (*every historical executable line verbatim, in order*) is kept with exactly two named substitutions, each normalized explicitly in the gate before the in-order scan: **(a)** the entry-classifier call receives `--subject "$CLASSIFIER_SUBJECT"` (== `$SUBJECT` for every historical subject; `vpio-02` for `vpio-02-sid`, because the frozen classifier knows no SID subject and the SID trace is the same fourteen seams — *declared custody + trace compatibility = subject identity*, founder ruling 2026-09-14); **(b)** the unknown-subject refusal strings name the five-subject closed set. Every other historical line is verbatim; every added line matches a closed allow-list (`SID_ALLOWED`) or sits inside the SID blocks. The driver's and batch's historical comment/header lines were restored verbatim after a first draft edited them (the gate caught it; the SID information now travels on added lines).

## 3. Offline evidence returned (as the ruling required)

| Obligation | Result |
|---|---|
| Source estimator unit vectors | `SourceEstimatorTests` (Swift, **not yet executed** — no toolchain): 997 Hz at rms 1e-3 → own bin 7.07e-4 ± 2 %, controls ≤ −60 dB; silence → 0; bins exactly the seven; frame closes every 4th callback; frame-reset path |
| Leakage / tail arithmetic | test pins the four amplitude coefficients and asserts each own harmonic at magnitude 0.1 leaks into 997 within +10 % of its coefficient and ≥ 50 % of it (a bound of the right order, not a fiction); the tail `2.82e-6 × e880Max` is pinned in the reader |
| Deterministic 2 Hz signature incl. the `own_modulated` veto | Swift: ideal gate (14 phases, K = 25 and 26) ≥ 1.15 and ≤ 1.40; steady = 0; zero energy → nil; 7 Hz ripple + drift < 0.9; a gated 997 + continuous 440 through the whole estimator → `m2_997 ≥ 0.9`, `m2_440 < 0.2`. Reader: case 16 (`own_modulated`) and case 15 (`signature_absent`) |
| Every source-reader path | `--selftest` **20/20**: no_source_evidence · geometry · V1 (twice) · healthy-only baseline · V2 · no full window · SURVIVES · SUPPRESSED · capture-not-intact → floor · mixed → CHARACTERIZE-SRC · between · floor by noise · floor by LEAKAGE · signature_absent · own_modulated · frameReset · residual descriptive · residual rendered · never PASS/FAIL |
| Gated-fixture checks | gate: header · 8 640 000 frames · first two seconds sample-exact (±1 LSB) against the generator with edges · OFF halves exactly zero · full-file peak ±6553 · SHA = sidecar = batch pin |
| Frozen-reader row-identical replay | both frozen readers are byte-identical to `b198e2e37`, so replay is identity; the gate's corpus-partition test still reproduces every ledgered directory row-for-row (16 populations, 559 journals); the source reader over all **61 tracked VPIO-02 journals → 61 × `no_source_evidence`**, never PASS/FAIL |
| Byte-identity of the ruled invariant files | gate (§1 list), per file against `ac12dedf4` |
| VOICE source gate | **82/82** (was 76): 12 frozen-subject pins moved to history + 6 new SOURCE-ID-02 obligations (§6); read green before the implementation commit |

## 4. Fixture generator (reproducible; the SHA is the custody)

```python
fs=48000; sec=180; f=997.0; peak=round(0.20*32767)          # 6553
period=fs//2; on=fs//4; edge=int(fs*0.002)                   # 24000 · 12000 · 96
for i in range(fs*sec):
    ph=i%period
    if ph<on:
        g=1.0
        if ph<edge: g=0.5-0.5*cos(pi*ph/edge)
        elif ph>=on-edge: g=0.5-0.5*cos(pi*(on-1-ph)/edge)
    else: g=0.0
    sample=int(round(peak*g*sin(2*pi*f*i/fs)))               # PCM16 LE, mono, 48 kHz; RIFF/WAVE 44-byte header
```

## 5. The reader's law as implemented (design §10.B + ruling §11, verbatim in the module docstring)

Constants: `A440 2.16e-5 · A880 2.77e-3 · A1320 4.00e-5 · A1760 1.12e-5 · TAIL 2.82e-6 (× e880Max)` · `VIS 10 · SURV 0.1 · SUPP 0.01 · NOISE 10 · M2 0.9 · CB_MIN 90 · MIN_FRAMES 20` · geometry pinned `48 000 Hz / 1 920 frames` (any other geometry → UNMEASURED-SRC: geometry, never approximated). `NEAR-END-SURVIVES iff e997Mean ≥ 0.1·B997 ∧ e997Mean ≥ 10·F_w ∧ m2_997 ≥ 0.9 ∧ m2_440 < 0.9 ∧ frameReset = 0`; `NEAR-END-SUPPRESSED iff e997Mean < 0.01·B997 ∧ callbacks ≥ 90 ∧ ioRunning`; `INDETERMINATE-SRC: frameReset | between | floor | signature_absent | own_modulated`; own-playback residual descriptive on every window; row = SURVIVES / SUPPRESSED / CHARACTERIZE-SRC / UNMEASURED-SRC. Pairing: each `input_source_sample` with the `input_health_sample` of the same generation and `windowMs` at most three records earlier (the tick writes them adjacently).

## 6. Gate by history (what moved, and why each is lawful)

The twelve pins that asserted *the working tree is the frozen VPIO-02 subject* now assert *the frozen VPIO-02 subject is `ac12dedf4` in history* and *the working tree differs from it in exactly the four ruled files* (organism), or *the instrument differs from `b198e2e37`/`8b111709b`/`08483cfe4`/`83a382a14` only by SID-declaring lines* (`sidOnlyDelta`, closed allow-list). New block (6 obligations): seven bins exact · construction after the guard, before arming · trace enum unchanged · counts of every `AudioUnit*/AudioOutputUnit*/AudioComponent*` call, `import`, `lock.lock()` and `NSLock(` equal to history; no `DispatchQueue/Timer/Thread/Semaphore` · hook after `measure()`, emission outside the closure · kernel: one `input_source_sample`, component `SourceEvidence`, never `lastObservationSeq`, health record byte-identical, `handleSource` touches only `sourceAgg`, no `source` symbol in supervisor/policy/projection/state/replay · tests named + coefficients pinned · fixture checks · reader constants + vocabulary + self-test 20/20 + the 61-journal `no_source_evidence` regression · batch/reinstall/driver custody declarations + frozen readers byte-identical.

## 7. Deviations and flags for the founder

1. **Component name `SourceEvidence`** on the record (design §2.2 had written `HealthSupervisor`): the evidence is not the supervisor's and must not read as if it were; a one-word change if rejected.
2. **Driver row** added (§1) — argued as the minimum custody declaration for the batch to launch the SID bundle; not in the ruling's literal list.
3. **`s2-nearend` refused on the SID subject** — an instrument refusal implementing "S-a NOT OPEN"; removable by ruling.
4. **Compile-era risk, named, not resolved here:** `SIMD8<Double>` arithmetic, `.squareRoot()` on SIMD, `pointwiseMin/Max`, and the optional-chained mutating `sourceEstimator?.consume(base, n)` inside the buffer closure are all standard Swift 5.9 but unexercised until MAC-COMPILE; an importer/syntax rejection would be a bounded compile-era defect of the predeclared class (C-V1 precedent), never an API.
5. The SID pins are empty by design; **any reinstall with `--subject vpio-02-sid` refuses (`pins-unrecorded`) until a MAC-COMPILE records them** — fail-closed, gate-pinned.

## 8. Standing after this record (nothing opened)

```text
SOURCE-ID-02 implementation      LANDED · 6f0e2e0b2 · NOT COMPILED · returned
offline evidence                 §3 (Swift tests written, not executed; reader 20/20; corpus 61/61; gate 82/82)
SID subject                      life.soullab.voicekernel.vpio02sid · VoiceKernel VPIO-02-SID · identity UNRECORDED
SID MAC-COMPILE                  CLOSED (own founder act, on exactly the accepted SHA)
SID FIRST-INSTALL                CLOSED
SID ENTRY WITNESS                REQUIRED · CLOSED
S-b N=10 population              CLOSED
S-a stationary arm               NOT OPEN (instrument refuses it on the SID subject)
S3                               CLOSED
K00-06 built-in                  CHARACTERIZE ONLY · INCOMPLETE
KERNEL-00                        NOT ACCEPTED
device execution authority       NONE
```

---

## 9. Founder ruling on `6f0e2e0b2` (2026-09-15) → `SOURCE-ID-02A` offline repair LANDED at `f0c6ae13b` · implementation still NOT ACCEPTED for MAC-COMPILE

**Ruling (substance verbatim):** the implementation surface is substantially right and confined to the ruled files; the five flags are disposed — `SourceEvidence` ACCEPTED · driver row ACCEPTED (custody/selection, not app behaviour) · S-a refusal ACCEPTED IN PRINCIPLE · compile-era Swift risks DEFERRED TO MAC-COMPILE · empty SID pins ACCEPTED (`pins-unrecorded` is the correct fail-closed condition); the estimator is faithful (consumed buffer, four callbacks, observed-rate coefficients, ordered 997/440 envelopes). **Two real offline defects and one control-shape ambiguity** must be fixed before Swift enters the toolchain: **Defect 1** — the batch's historical two-stage parser refused `sid-nearend-gated` as *unknown stimulus* before the SID branch could admit it, so the record's claim that the gated token was lawful on the SID subject was **false in executable behaviour**; **Defect 2** — the reader evaluated SURVIVES and SUPPRESSED before `frameReset`, so a suppressed-amplitude window with healthy capture and a reset inside it read `NEAR-END-SUPPRESSED`; **Ambiguity** — `m2own is None or m2own < M2` let an absent/malformed own-tone control qualify like a measured quiet one. Authority: exactly one narrow offline carrier, `SOURCE-ID-02A` (batch dispatch · reader precedence · undefined-control handling · self-test coverage · gate pins · records); no Swift change, no new bins/thresholds, no compile/install/device/witness/playback/population.

**Repair, at `f0c6ae13b88db29cbd1537bec585d98376c8bc4f` (Swift untouched — `git diff` names only the batch, the reader and the gate):**

1. **Batch — one closed dispatch** (replacing the two-stage parser):
   ```text
   ""                  no stimulus
   s2-nearend          only --subject vpio-02      (the stationary S-a arm is NOT OPEN on the SID subject)
   sid-nearend-gated   only --subject vpio-02-sid
   anything else       refused; the refusal names the two lawful pairings
   ```
   Gate: exactly one `case "$STIMULUS" in`; both guarded branches precede the catch-all; no unguarded `s2-nearend) ;;`; the old "the only token is s2-nearend" text absent; the dispatch precedes the device lock. (The historical single-line `case` from `b198e2e37` is superseded by this dispatch; it was never a `8b111709b` line, so the preservation law over the K00-05/06 base is unaffected, and every added line is inside the dispatch or SID-allowed.)
2. **Reader — `frameReset` first:** `frameReset > 0 → INDETERMINATE-SRC: frameReset` is evaluated before SURVIVES and SUPPRESSED. New self-test 21 (suppressed amplitude + callbacks ≥ 90 + `ioRunning` + `frameReset=1` → `frameReset`, never SUPPRESSED).
3. **Reader — own-tone control law:** `control = clear` iff `m2_440` numeric and `< 0.9`, or `m2_440` undefined with a complete record (all seven bins' Mean/Max/Min parseable) and `e440Mean < max(C_base, C_w)` (no own-band energy to modulate); numeric and `≥ 0.9` → `own_modulated`; absent/malformed while own-band energy is material → **`INDETERMINATE-SRC: own_control_unmeasured`**. `control == clear` is part of SURVIVES; missing control evidence never earns it. Self-tests 22 (undefined + quiet → SURVIVES), 23 (undefined + material → `own_control_unmeasured`), 24 (own-band keys missing → `own_control_unmeasured`). Vocabulary gains exactly that one reason code.
4. **Self-test 24/24; gate 82/82** (pins for the dispatch, the law order `frameReset → SURVIVES → SUPPRESSED → …`, the control expression, the new reason code and the four new case names); 61 tracked VPIO-02 journals still `no_source_evidence`.

**Standing after §9:** implementation `6f0e2e0b2` + repair `f0c6ae13b` RETURNED · NOT YET ACCEPTED for MAC-COMPILE (the founder adjudicates the whole after this carrier) · core Swift/source design ACCEPTED IN PRINCIPLE · MAC-COMPILE · FIRST-INSTALL · SID ENTRY WITNESS (required) · S-b N=10 CLOSED · S-a NOT OPEN · S3 CLOSED · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE · KERNEL-00 NOT ACCEPTED · device execution authority NONE.

---

## 10. Founder adjudication (2026-09-15): `SOURCE-ID-02` ACCEPTED · `SOURCE-ID-02A` ACCEPTED · accepted code state `f0c6ae13b88db29cbd1537bec585d98376c8bc4f` · **SID MAC-COMPILE OPEN** (the only newly authorized act) — pinned §10.2, NOT YET EXECUTED

### 10.1 Ruling as captured (substance verbatim)

Accepted as repaired: one closed stimulus dispatch with `sid-nearend-gated` reachable only under `vpio-02-sid` · `frameReset` before both attribution verdicts · missing/undefined own-tone control never silently earns SURVIVES, `own_control_unmeasured` carries the unresolved case · new cases gate-pinned, repair limited to batch + reader + gate, Swift untouched · the record preserves that the implementation was not accepted before this ruling. The five flags stay disposed as previously ruled.

```text
SOURCE-ID-02          ACCEPTED
SOURCE-ID-02A         ACCEPTED
accepted code state   f0c6ae13b88db29cbd1537bec585d98376c8bc4f
offline gate          82/82
source reader         24/24
```

**SID MAC-COMPILE — OPEN.** Purpose, narrow: establish that the accepted SID subject compiles and tests on the Mac toolchain and record its product identity. It installs and launches nothing. **Subject = exactly `f0c6ae13b88db29cbd1537bec585d98376c8bc4f`** (the later `94f4cb4af` carrier is records-only and does not alter the compiled subject). Steps: (1) HEAD exact + tree clean · (2) VOICE gate 82/82 · (3) `swift test` for `ios/VoiceKernel` · (4) `xcodegen` from `project.yml` · (5) device build of the SID harness, no install, no launch · (6) identity: bundle `life.soullab.voicekernel.vpio02sid` · display `VoiceKernel VPIO-02-SID` · `VoiceKernelHarness.debug.dylib` UUID · dylib SHA-256 · executable SHA-256 · complete product manifest + manifest SHA-256 + file count · (7) the built source/test surface is still the accepted one after the build · (8) return every compile/test/custody line in a record. The Swift unit tests matter particularly: written, never executed (seven bins · leakage coefficients · reset · 2 Hz discrimination · the gated-997 / continuous-440 control case).

PASS = HEAD exact ∧ tree clean before build ∧ gate 82/82 ∧ `swift test` zero failures ∧ project generation PASS ∧ device build PASS ∧ bundle/display exact ∧ dylib UUID, dylib SHA, executable SHA readable ∧ manifest complete + sealed ∧ device install 0 · launch 0 · sample 0. **STOP** on any Swift compile/test failure, project-generation failure, signing/build failure, unreadable identity field, unexpected bundle identity or source drift. A compiler error in the predeclared risk area (`SIMD8`, pointwise operations, the optional-mutating estimator call, …) is returned as a **bounded compile defect — never repaired inside the compile act**; a repair needs its own ruling. **Do not fill the reinstall pins because the build produced them**: the compile records the identity; pinning the install instrument follows only after the compile evidence is accepted.

Still closed: FIRST-INSTALL · reinstall pin mutation (pending compile acceptance) · SID ENTRY WITNESS (REQUIRED) · S-b N=10 · S-a (NOT OPEN) · S3 · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE · KERNEL-00 NOT ACCEPTED · device execution NONE.

### 10.2 Execution pin — `SID MAC-COMPILE-01` (Mac Studio terminal directly; paste-able; zsh-safe — no `#` on command lines; every line reused from the accepted VPIO-02 MAC-COMPILE-01 / repro-build recipe, with the SHA, the paths and the SID identity substituted)

Toolchain expected (recorded, not re-pinned here): Xcode 26.3 (17C529) · Swift 6.2.4 · XcodeGen 2.46.0 · SDK iphoneos26.2; destination = the Xcode id `00008140-00163D9922E0801C` (never the devicectl id); team `ZVK2X646Z2`. The signed build compiles for the paired device and produces a signed product; it does not install, launch or sample. Evidence directory: `$OUT` (outside the worktree); return on a `feature/*` branch → cherry-pick here.

```bash
set -e
SHA=f0c6ae13b88db29cbd1537bec585d98376c8bc4f
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
WT=/private/tmp/sid-mac-compile-01-$SHA
DD=$WT-derived
OUT=/private/tmp/sid-mac-compile-01-out-$STAMP
mkdir -p "$OUT"
test ! -e "$WT"
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/voice-2026-census-01
git worktree add --detach "$WT" "$SHA"
cd "$WT"
git rev-parse HEAD | tee "$OUT/head.txt"
test "$(git rev-parse HEAD)" = "$SHA"
git status --porcelain | tee "$OUT/status-before.txt"
test -z "$(git status --porcelain)"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
xcodebuild -version | tee "$OUT/toolchain.txt"
xcodegen --version | tee -a "$OUT/toolchain.txt"
xcrun swift --version 2>&1 | head -1 | tee -a "$OUT/toolchain.txt"
npx jest --config jest.config.js __tests__/voice-kernel-00-source-gates.test.ts 2>&1 | tee "$OUT/gate.log" | tail -5
grep -E 'Tests:\s+82 passed, 82 total' "$OUT/gate.log"
( cd ios/VoiceKernel && xcrun swift build 2>&1 ) | tee "$OUT/swift-build.log" | tail -3
( cd ios/VoiceKernel && xcrun swift test 2>&1 ) | tee "$OUT/swift-test.log" | grep -E 'Executed|error|failed' | tail -4
grep -E 'Executed [0-9]+ tests, with 0 failures' "$OUT/swift-test.log"
grep -E 'SourceEstimatorTests' "$OUT/swift-test.log" | grep -E "passed" | wc -l | tee "$OUT/source-tests-passed-count.txt"
( cd ios/VoiceKernelHarness && xcodegen generate 2>&1 ) | tee "$OUT/xcodegen.log" | tail -2
( cd ios/VoiceKernelHarness && xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination 'generic/platform=iOS' -derivedDataPath "$DD" CODE_SIGNING_ALLOWED=NO build ) > "$OUT/xcodebuild-unsigned.log" 2>&1 || true
grep -E '\*\* BUILD (SUCCEEDED|FAILED) \*\*' "$OUT/xcodebuild-unsigned.log" | tee -a "$OUT/build-results.txt"
grep -q 'BUILD SUCCEEDED' "$OUT/xcodebuild-unsigned.log"
( cd ios/VoiceKernelHarness && xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination id=00008140-00163D9922E0801C -derivedDataPath "$DD" DEVELOPMENT_TEAM=ZVK2X646Z2 CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates build ) > "$OUT/xcodebuild-signed.log" 2>&1 || true
grep -E '\*\* BUILD (SUCCEEDED|FAILED) \*\*' "$OUT/xcodebuild-signed.log" | tee -a "$OUT/build-results.txt"
grep -q 'BUILD SUCCEEDED' "$OUT/xcodebuild-signed.log"
P="$DD/Build/Products/Debug-iphoneos/VoiceKernelHarness.app"
/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' -c 'Print CFBundleDisplayName' "$P/Info.plist" | tee "$OUT/identity.txt"
test "$(/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' "$P/Info.plist")" = life.soullab.voicekernel.vpio02sid
test "$(/usr/libexec/PlistBuddy -c 'Print CFBundleDisplayName' "$P/Info.plist")" = 'VoiceKernel VPIO-02-SID'
dwarfdump --uuid "$P/VoiceKernelHarness.debug.dylib" | tee -a "$OUT/identity.txt"
shasum -a 256 "$P/VoiceKernelHarness.debug.dylib" "$P/VoiceKernelHarness" | tee -a "$OUT/identity.txt"
( cd "$P" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "$OUT/SID-MAC-COMPILE-01.manifest.sha256"
shasum -a 256 "$OUT/SID-MAC-COMPILE-01.manifest.sha256" | tee -a "$OUT/identity.txt"
wc -l "$OUT/SID-MAC-COMPILE-01.manifest.sha256" | tee -a "$OUT/identity.txt"
codesign -dv --verbose=2 "$P" 2>&1 | grep -E 'Identifier|TeamIdentifier|Authority' | tee -a "$OUT/identity.txt"
git rev-parse HEAD | tee "$OUT/head-after.txt"
test "$(git rev-parse HEAD)" = "$SHA"
git status --porcelain | tee "$OUT/status-after.txt"
git diff --stat | tee "$OUT/diff-after.txt"
git diff --quiet -- ios/VoiceKernel ios/VoiceKernelHarness/project.yml scripts __tests__
( cd "$OUT" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "$OUT/SHA256SUMS.compile"
echo "SID-MAC-COMPILE-01 $STAMP subject $SHA out $OUT"
```

Reading law for the return: every `test` line passing = the corresponding PASS criterion; `status-after.txt` may show only the known `xcodegen` footprint (`ios/VoiceKernelHarness/Harness/Info.plist` regenerated) and untracked build/evidence artefacts — the `git diff --quiet` line proves the accepted source, project.yml, instruments and gate did not move; anything else = STOP (source drift). The first failing line stops the paste (`set -e`): return `$OUT` as it stands with the failing line named; no second attempt under this authority. **Nothing in the block installs, launches, samples or writes a reinstall pin.**

**Standing after §10:** SOURCE-ID-02 + 02A ACCEPTED · accepted code state `f0c6ae13b` · SID MAC-COMPILE OPEN · pinned · NOT YET EXECUTED (Mac act) · FIRST-INSTALL · reinstall pin mutation · SID ENTRY WITNESS (required) · S-b N=10 CLOSED · S-a NOT OPEN · S3 CLOSED · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE · KERNEL-00 NOT ACCEPTED · device execution NONE.

### 10.3 Execution note — first Mac attempt was a PASTE SLIP, nothing ran (founder transcript, 2026-09-15): NOT EXECUTED · authority intact

The founder completed the pinned fetch-and-show read (the printed §10.2 block matched the committed text byte-for-byte), then the paste of the block delivered only `set -e` and `SHA=f0c6ae13b…`, echoed a stray fragment (`8bc4f`), and ran the final `echo`, which printed with `$STAMP` and `$OUT` empty. `mkdir`, `test ! -e "$WT"`, the worktree add, the gate, `swift test`, `xcodegen`, both builds, every custody read: none ran; no file, worktree, DerivedData or evidence directory was created; no device verb exists in the block anyway. **Classification (precedent §18.28.3–§18.28.4): a transport/paste non-execution, not a governed STOP; `SID MAC-COMPILE-01` is NOT SPENT and the §10.2 pin stands unchanged.** One consequence for conduct only: `set -e` is now armed in that interactive shell, so the block must be pasted in a **fresh terminal window** as one paste, from `set -e` through the final `echo`, with no fences and no prose — otherwise the first non-zero command would close the shell mid-run and leave a partial `$OUT` that looks like a STOP. Nothing else changes. (Extraction is pinned to `6d0a95e6c`, the last commit in which the file holds exactly one ```bash block; `git -C` makes the working directory irrelevant — a bare `git show` from `~` fails with `not a git repository`, as one attempt did.)

### 10.4 Second paste slip in a fresh window (founder transcript, 2026-09-15): three lines took (`set -e` · `SHA=` · `STAMP=`), nothing after — NOT EXECUTED · authority intact · transport changed to the §16.7 file shape

A fresh Terminal window received the paste and executed only the first three lines; the prompt returned with no worktree, no `$OUT`, no build, no device verb. Same classification as §10.3: paste non-execution, not a STOP; `SID MAC-COMPILE-01` unspent; the §10.2 block unchanged. Two slips in a row establish that a multi-line paste is not a reliable transport on this Mac for a block this long. **Transport for the next attempt = the §16.7 shape every Block A–D act already used:** extract the block byte-for-byte from git into a file, run it with `bash`, capture the output with `tee`. The block itself is untouched (extracted, not retyped); `set -e` then governs the script, not the interactive shell. Pinned lines (paste as ONE line each, or type):

```bash
git -C /Users/soullab/MAIA-SOVEREIGN show 6d0a95e6c:docs/programme/VOICE-2026/KERNEL-00_VPIO-02_SOURCE-ID-02_IMPLEMENTATION_2026-09-15.md | sed -n '/^```bash$/,/^```$/p' | sed '1d;$d' > /private/tmp/sid-mac-compile-01.sh
shasum -a 256 /private/tmp/sid-mac-compile-01.sh; wc -l /private/tmp/sid-mac-compile-01.sh
bash /private/tmp/sid-mac-compile-01.sh 2>&1 | tee /private/tmp/sid-mac-compile-01-transcript-$(date -u +%Y%m%dT%H%M%SZ).log; echo "rc=${PIPESTATUS[0]}"
```

The first line must produce a 50-line file (the block from `set -e` through the final `echo`); the `shasum` is custody for the transcript. `rc=` may print empty under zsh (C-D26, known); the script's own final `echo "SID-MAC-COMPILE-01 …"` line, or the last command shown before it stopped, is the status of record. Nothing else changes.

### 10.5 `SID MAC-COMPILE-01` EXECUTED (founder, Mac Studio terminal directly, 2026-09-15) → **STOP at Swift test compilation** · bounded compile defect in the predeclared risk area · authority SPENT · no repair · no rerun · no pin mutation

**What ran (founder report, recorded as stated; the `$OUT` files are not yet in this branch's custody).** The §10.2 block was transported by the §10.4 file shape (`git -C … show 6d0a95e6c:… | sed … > /private/tmp/sid-mac-compile-01.sh`; `shasum`/`wc -l` matched the pinned `a3a803f419f80e75fa973f42f69d45a04ea3fcb75c2affa77228c64faf467043` / 50 lines) and executed with `bash`. `$OUT = /private/tmp/sid-mac-compile-01-out-20260915T204348Z`, containing exactly six files: `gate.log` · `head.txt` · `status-before.txt` · `swift-build.log` · `swift-test.log` · `toolchain.txt`. Sequence as witnessed:

| step | result |
|---|---|
| worktree at `f0c6ae13b88db29cbd1537bec585d98376c8bc4f`, HEAD exact, tree clean (`head.txt`, `status-before.txt`) | PASS |
| VOICE gate `__tests__/voice-kernel-00-source-gates.test.ts` (`gate.log`) | **82/82 PASS** |
| `xcrun swift build` for `ios/VoiceKernel` (`swift-build.log`) | **PASS** — the kernel target (invariant files + `AudioGraph.swift` estimator interior + `VoiceKernel.swift` aggregate) compiles |
| `xcrun swift test` (`swift-test.log`) | **FAIL at test-target compilation**: `PureLogicTests.swift:485:13: error: the compiler is unable to type-check this expression in reasonable time; try breaking up the expression into distinct sub-expressions` → `error: fatalError` |
| `grep -E 'Executed [0-9]+ tests, with 0 failures'` (the pinned PASS test for step 3) | no match → `set -e` **STOP** |
| `xcodegen` · unsigned build · signed device build · identity · manifest · codesign · post-build surface proof · `SEAL` | **NEVER ENTERED** — no `xcodegen.log`, no `build-*.log`, no `build-results.txt`, no seal |

**Classification.** Governed execution — the act was entered and spent; this is a STOP under the §10.1 rule *"STOP on any Swift compile/test failure"*, not a paste slip (§10.3/§10.4) and not a transport refusal. The failure is a **bounded compile-era defect in the predeclared risk class** (a Swift type-checker time-out on a test expression; the pin named `SIMD8`, pointwise operations and the optional-mutating estimator call as the risk area with an open "…" — a type-checker time-out in the same new test class is inside that class of risk, and the founder's rule for it applies unchanged): **returned as the exact failure, not repaired inside the compile act**. Per §10.1 a repair requires its own ruling. Two facts must not be inflated: (i) **zero Swift tests ran** — the test target did not link, so the six `SourceEstimatorTests` vectors are neither passed nor failed; the accepted-state claim *"reader 24/24 · gate 82/82"* stands, the *"never-executed source unit vectors"* remain never-executed; (ii) **the kernel compiled** — the defect is in `ios/VoiceKernel/Tests/VoiceKernelTests/PureLogicTests.swift`, not in the SID subject's runtime surface, and `swift build` PASS is the first Mac-toolchain evidence that the Q4 interior compiles at all. Neither fact is a PASS: the pinned PASS conjunction fails at its fourth term and every later term is unmeasured.

**Where line 485 is (read here from `f0c6ae13b`'s tree, byte-identical on this branch).** Inside `SourceEstimatorTests.testTheOrderedEnvelopeModulationIndexSeparatesAGatedStimulusFromASteadyOrFluctuatingOne`, column 13 = the `ripple` binding:

```swift
let ripple = (0..<25).map { k in 0.5 + 0.3 * sin(2.0 * Double.pi * 7.0 * Double(k) * dt) + 0.01 * Double(k) }
```

An untyped single-expression closure over a `Range<Int>` whose body mixes five literals, `Double.pi`, `sin`, `Double(k)` and a captured `Double` — the textbook shape for Swift's expression-solver blow-up (many overloads of `*`/`+`/`sin` × literal-type inference); it is a **test-file expression, exercising `SourceSignature.modulationIndex`, and touches no kernel line**. The remote session has no Swift toolchain, so the time-out is not reproducible here, and whether any *later* expression in the same file would also time out once this one is split (candidates by shape: the `g` generator's `Float(0.002 * gate * sin(…) + 0.02 * sin(…))` at the whole-estimator test, the `seq26` map, the inner `on`-counting loop) is **unknown** — the compiler stops at the first such diagnostic per file. Any repair ruling should therefore expect that a second compile may stop at a sibling expression, and that is still a bounded defect of the same class, not evidence against the design.

**Candidate repair shape — NAMED, NOT WRITTEN, NOT AUTHORIZED.** The bounded correction is the one the compiler names: break the expression into typed sub-expressions with no change to the computed values or to any assertion — e.g. an explicitly typed closure `{ (k: Int) -> Double in let kk = Double(k); let arg = 2.0 * Double.pi * 7.0 * kk * dt; return 0.5 + 0.3 * sin(arg) + 0.01 * kk }` bound to `let ripple: [Double]`, and the same treatment for the sibling generator expressions if the founder chooses to pre-empt them. Diff budget of such a repair = `PureLogicTests.swift` only; kernel files, harness, readers, batch, reinstall, fixtures and the gate untouched; the gate's `SID_ALLOWED` set already admits the test file. Because the accepted code state is SHA-pinned, **any repair produces a new SHA and therefore a fresh MAC-COMPILE authority** (a new pin block with the new SHA; the reinstall pins stay empty).

**What was NOT witnessed and must not be recorded as fact.** The founder's scrollback shows a second, queued invocation of the same `bash /private/tmp/sid-mac-compile-01.sh … | tee …` line typed while the first ran. Only ONE `$OUT` directory and one governed-run transcript exist; no second `tee` artifact has been produced. The duplicate is recorded here as **visible scrollback, execution NOT ESTABLISHED** — in particular it is NOT recorded as the pin's worktree-exists precondition refusal having fired (that refusal would be the expected outcome of a second run, but expectation is not a witness). Separately, a **0-byte transcript stamped 20:43:11Z** on the Mac belongs to the §10.4 empty-script no-op (the redirection that truncated the file before `git show` failed without `-C`), not to this act; the governed run's stamp is 20:43:48Z.

**Custody on the Mac (owed as the evidence carrier).** `$OUT` (six files) + a recomputed seal, plus the two Desktop copies (`/Users/soullab/Desktop/SID-MAC-COMPILE-01-terminal-recovered.txt`, 41 lines / 3,966 bytes; `/Users/soullab/Desktop/SID-MAC-COMPILE-01-governed-run.log`, 4,351 bytes), travel on a `feature/*` branch and are cherry-picked here with `-x` before any reading beyond this founder-reported table is written. Nothing on the Mac is to be deleted, re-run or amended: the worktree may stay; the `.sh` may stay; `$OUT` is frozen evidence.

**Standing after §10.5.** `SID MAC-COMPILE-01` = EXECUTED · STOPPED at step 3 (`swift test`) · authority SPENT · evidence carrier OWED. Accepted code state `f0c6ae13b` UNCHANGED (acceptance was of the offline evidence; it is not withdrawn by a Mac test-compile defect — the founder rules what, if anything, it means). Open authority: NONE — a repair ruling (test-file only, new SHA) and a fresh compile pin are the next possible founder acts. Still closed: FIRST-INSTALL · reinstall pin mutation · SID ENTRY WITNESS (REQUIRED) · S-b N=10 · S-a (NOT OPEN) · S3 · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE · KERNEL-00 NOT ACCEPTED · device execution NONE · C-D26 HOLD.

### 10.6 FOUNDER RULING on §10.5 (2026-09-15): `SID REPAIR-01` OPEN for the line-485 expression ONLY · sibling expressions HOLD · `SID MAC-COMPILE-02` NOT OPEN · evidence carrier lands FIRST

Recorded verbatim in substance. The founder made the next ruling **narrower** than the pre-emptive repair §10.5 named: *the Mac produced one admissible compiler finding; the sibling expressions are plausible candidates by shape, but they are not yet findings — repairing them now would turn prediction into authority and blur the distinction between what failed and what might fail next.*

```text
REPAIR AUTHORITY
  file      ios/VoiceKernel/Tests/VoiceKernelTests/PureLogicTests.swift
  locus     modulation-index test · line 485 expression only
  purpose   make the existing expression type-checkable
  semantic change     NONE
  values              unchanged
  assertions          unchanged
  production/kernel   untouched
  sibling expressions HOLD
```

The §10.5 repair shape is accepted as appropriate — *explicit `[Double]`, typed closure argument, `kk`, `arg`, same arithmetic and return value; compiler-disambiguation, not test redesign.* Sequence, kept as three separate acts so that *the first failure does not pull the next two across its boundary*:

```text
MAC-COMPILE-01   EXECUTED · STOP · Swift test compile · authority SPENT
REPAIR-01        one proven compiler obstruction · one test file · new SHA
review repair diff
MAC-COMPILE-02   separately authorized against that exact new SHA
```

If `MAC-COMPILE-02` then stops on `g`, `seq26` or the inner `on` loop, *that* creates the evidence for the next repair; if it passes them, they were merely similar-looking expressions and no change was manufactured. **The evidence carrier lands before the repair**: the six frozen `$OUT` files, a recomputed seal and the two recovered Desktop copies become durable first, preserving the failed act independently of whatever follows.

**Order of execution as it follows from the ruling (this session).**
1. **Carrier (Mac, founder, first).** Script `docs/programme/VOICE-2026/SID_MAC-COMPILE-01_CARRIER_2026-09-15.sh` (30 lines; file transport per §10.4, no paste of the body): fetches the lane branch, opens a detached worktree at its tip, creates `feature/sid-mac-compile-01-evidence-20260915T204348Z`, copies the six `$OUT` files · the two Desktop copies · `/private/tmp/sid-mac-compile-01.sh` · every `/private/tmp/sid-mac-compile-01-transcript-*.log` (this deliberately includes the 0-byte 20:43:11Z transcript of the §10.4 empty-script no-op, so that attribution is carried as a file, not as a sentence) · a `ls -la` listing, into `docs/programme/VOICE-2026/driver-ledger/sid-mac-compile-01-20260915T204348Z/`, writes `SHA256SUMS.run` + `RETURN.txt`, commits and pushes the `feature/*` branch. It reads `$OUT`; it never writes into it. It touches no kernel, test, harness or reader file. It refuses (`test`) if `$OUT`, either Desktop copy, or a pre-existing carrier worktree is missing/present. Run shape:
   ```bash
   git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
   git -C /Users/soullab/MAIA-SOVEREIGN show origin/claude/voice-2026-census-01:docs/programme/VOICE-2026/SID_MAC-COMPILE-01_CARRIER_2026-09-15.sh > /private/tmp/sid-carrier.sh
   shasum -a 256 /private/tmp/sid-carrier.sh; wc -l /private/tmp/sid-carrier.sh
   bash /private/tmp/sid-carrier.sh 2>&1 | tee /private/tmp/sid-carrier-transcript-$(date -u +%Y%m%dT%H%M%SZ).log; echo "rc=${PIPESTATUS[0]}"
   ```
   Expected last line `SID-MAC-COMPILE-01 CARRIER PUSHED`. The 30-line count and the SHA printed by the remote session at commit time are the custody check.
2. **Here, on the carrier's arrival:** cherry-pick with `-x`, recompute `SHA256SUMS.run`, read `swift-test.log` in full (the only file whose contents §10.5 quotes from the founder's report rather than from custody), confirm `swift-build.log` PASS and the `head.txt` SHA, then write the carrier record (§10.7).
3. **`SID REPAIR-01` (here, after 2).** Exactly one hunk in `PureLogicTests.swift`, the line-485 binding replaced by the pinned text below; nothing else in the file; gate 82/82 (the file is inside `SID_ALLOWED`; the frozen-subject pins are unaffected because the kernel tree is byte-identical); commit → **new SHA** → founder diff review. Pinned replacement (value-identical: the multiplication order `2.0 * Double.pi * 7.0 * kk * dt` is the original's left-to-right order, so every double is bitwise the same):
   ```swift
   let ripple: [Double] = (0..<25).map { (k: Int) -> Double in
       let kk = Double(k)
       let arg = 2.0 * Double.pi * 7.0 * kk * dt
       return 0.5 + 0.3 * sin(arg) + 0.01 * kk
   }
   ```
   No other line of the test file is touched — not `g`, not `seq26`, not the `on` loop, not the assertions, not the comment.
4. **`SID MAC-COMPILE-02`** — NOT OPEN. It opens only by a separate founder act against the reviewed REPAIR-01 SHA, with its own §10.2-shaped pin (same steps, that SHA, a new `$OUT` stamp; reinstall pins still empty).

**Standing after §10.6.** `SID MAC-COMPILE-01` EXECUTED · STOP · SPENT · carrier OWED (script issued) · `SID REPAIR-01` OPEN (line 485 only; not yet written — sequenced after the carrier) · sibling expressions HOLD · `SID MAC-COMPILE-02` NOT OPEN · accepted code state `f0c6ae13b` unchanged until REPAIR-01 supersedes it for compile purposes · FIRST-INSTALL CLOSED · reinstall pins EMPTY · SID ENTRY WITNESS REQUIRED, not opened · device execution NONE · C-D26 HOLD.

### 10.7 Carrier LANDED and READ (2026-09-15): `feature/sid-mac-compile-01-evidence-20260915T204348Z` @ `1c772e14f96253ef6db422ab545e205b8a4e4f1c` → cherry-picked `-x` here · seal reproduced · §10.5 confirmed from custody · one new fact (a third, 0-byte transcript at 21:32:08Z)

**Transport.** Founder ran the §10.6 four-line shape at the Mac Studio terminal: extracted script = 30 lines · `8e8ca597b68f551d912b64b6d3bf1d1fcbcb1cd1e2e2e69d759f195020161028` (matches the remote session's hash at commit); pre-commit hooks passed on the `feature/*` branch; push succeeded; final line `SID-MAC-COMPILE-01 CARRIER PUSHED`; `rc=` empty (C-D26). Carrier directory `docs/programme/VOICE-2026/driver-ledger/sid-mac-compile-01-20260915T204348Z/`, 15 files, 320 lines.

**Custody reproduced here.** `shasum -a 256 -c SHA256SUMS.run` → 0 mismatches; `SHA256SUMS.run` itself = `ba8c0528da5b9dfd4d6a7570c26be151398b22e20aab334dd4485a406accdc79` (the value the Mac printed). `head.txt` = `f0c6ae13b88db29cbd1537bec585d98376c8bc4f` (subject exact). `status-before.txt` = 0 bytes (tree clean before build). `toolchain.txt` = Xcode 26.3 (17C529) · xcodegen 2.46.0 · Apple Swift 6.2.4 (swiftlang-6.2.4.1.4). `sid-mac-compile-01.sh` = `a3a803f419f80e75fa973f42f69d45a04ea3fcb75c2affa77228c64faf467043` (the §10.2 pin, unchanged). `SID-MAC-COMPILE-01-governed-run.log` is **byte-identical** to `sid-mac-compile-01-transcript-20260915T204348Z.log` (`cmp` clean, 4,351 bytes) — the Desktop copy adds nothing and loses nothing. `SID-MAC-COMPILE-01-terminal-recovered.txt` (3,966 bytes) is the same run seen through the terminal: it additionally carries the §10.4 history (the `git show` without `-C` → `fatal: not a git repository`, the empty-file hash `e3b0c442…` / 0 lines, the no-op `bash` with `rc=`), then the correct 50-line extraction and the governed invocation; the `Updating files: 30% …` progress spool is collapsed to its final line, and a queued keystroke echo is interleaved into the `Test Suites:` line — display artefacts, not evidence differences.

**§10.5 confirmed from custody, not from report.** `gate.log`: `Tests: 82 passed, 82 total`. `swift-build.log`: all 13 kernel compilation units including `AudioGraph.swift` and `VoiceKernel.swift`, `Build complete! (4.06s)`. `swift-test.log` (1,445 bytes, read in full): `[6/8] Compiling VoiceKernelTests PureLogicTests.swift` → `PureLogicTests.swift:485:13: error: the compiler is unable to type-check this expression in reasonable time; try breaking up the expression into distinct sub-expressions`, with the compiler's own excerpt of lines 483–487 showing the caret under `ripple`, then `error: fatalError`. **It is the only diagnostic in the log** — no second expression is named, no test ran (no `Test Suite` / `Executed` line). The line-485 locus §10.5 read from this branch's tree is therefore the compiler's locus too. No xcodegen or xcodebuild artefact exists in the carrier, consistent with `set -e` stopping at the `Executed … 0 failures` grep.

**New fact — a third transcript.** `OUT-listing.txt` and the carrier glob show three `sid-mac-compile-01-transcript-*.log` files in `/private/tmp`: `20260915T204311Z` (0 bytes — the §10.4 empty-script no-op, as attributed) · `20260915T204348Z` (4,351 bytes — the governed run) · **`20260915T213208Z` (0 bytes, mtime 17:32 local)** — created ~48 minutes after the governed run, at about the time the carrier was being run. §10.5 recorded the queued duplicate as *visible scrollback, execution NOT ESTABLISHED*, and `RETURN.txt` carries `DUPLICATE_INVOCATION not-established` because that line was authored by the carrier script from §10.5's state, before the carrier's own listing existed. **The listing now bears on it, and the record must not over-read it either way.** What a 0-byte `tee` file establishes: the `bash … | tee …` line was executed at 21:32:08Z and the script wrote nothing to stdout/stderr before exiting. What it does not establish: which line exited. The §10.2 script's preamble is `set -e` · vars · `mkdir -p "$OUT"` · `test ! -e "$WT"` · `cd` · `git fetch …`. A `git fetch` failure prints to stderr and would not be 0 bytes; a `test ! -e "$WT"` failure prints nothing and is exactly 0 bytes — and the worktree `/private/tmp/sid-mac-compile-01-f0c6ae13b…` did exist from the governed run. So the most plausible reading is: **the queued duplicate line was still pending in the terminal's input, was consumed at 17:32:08 local (the four-line carrier paste into the same window would do this), executed, and refused at the worktree precondition before any device or build verb** — but that is a reading, not a witness. Two things make it checkable read-only: `mkdir -p "$OUT"` precedes the precondition, so a refused invocation leaves an **empty** directory `/private/tmp/sid-mac-compile-01-out-20260915T213208Z`; and a refused invocation touches nothing in the governed `$OUT` (its six files keep mtimes 16:43/16:44 local in the listing — **the governed evidence is unmodified whatever the third invocation did**). One read-only line settles it: `ls -ld /private/tmp/sid-mac-compile-01-out-* /private/tmp/sid-mac-compile-01-f0c6ae13b*` — an empty `…-out-20260915T213208Z` directory = the duplicate ran and refused at `test ! -e "$WT"`; no such directory = it exited even earlier (only `set -e`/assignments precede the `mkdir`, so that would itself need explaining). Until read: **duplicate invocation EXECUTED at 21:32:08Z (established by the tee file), outcome REFUSED-BEFORE-ANY-ACT (most plausible, NOT witnessed), governed `$OUT` UNAFFECTED (witnessed by mtimes).** Design note for future pins, not a repair: place `mkdir -p "$OUT"` after the preconditions so a refusal leaves no directory.

**Effect on §10.6 sequencing.** None. The carrier has landed and been read; `SID REPAIR-01` may now be written under §10.6's authority. The third-transcript question is a record matter (one `ls`), not a precondition of the repair.

### 10.8 `SID REPAIR-01` WRITTEN (2026-09-15): commit `faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8` · one hunk · one file · returned for founder diff review · `SID MAC-COMPILE-02` NOT OPEN

**Diff (the whole of it).** `ios/VoiceKernel/Tests/VoiceKernelTests/PureLogicTests.swift`, 1 hunk, `+5 −1`, inside `SourceEstimatorTests.testTheOrderedEnvelopeModulationIndexSeparatesAGatedStimulusFromASteadyOrFluctuatingOne`:

```diff
-        let ripple = (0..<25).map { k in 0.5 + 0.3 * sin(2.0 * Double.pi * 7.0 * Double(k) * dt) + 0.01 * Double(k) }
+        let ripple: [Double] = (0..<25).map { (k: Int) -> Double in
+            let kk = Double(k)
+            let arg = 2.0 * Double.pi * 7.0 * kk * dt
+            return 0.5 + 0.3 * sin(arg) + 0.01 * kk
+        }
```

Exactly the text pinned in §10.6 step 3. **Semantic change NONE**: `kk` is the original `Double(k)`; `arg` is the original sine argument with the original left-to-right multiplication order (`2.0 * Double.pi * 7.0 * kk * dt`), so each intermediate double is the value the original expression computed; the return is the original sum in the original order. The following assertion `XCTAssertLessThan(SourceSignature.modulationIndex(ripple, frameSeconds: dt)!, 0.9)` is untouched, as is every other line of the file: the comment above, `seq26`, the `g` generator, the inner `on` loop, all six test names and all assertions — **sibling expressions HOLD, as ruled**. The change is compiler disambiguation (explicit element type, typed closure parameter and return, two named intermediates), not test redesign.

**Surface proof.** `git diff --stat f0c6ae13b faf918b5c -- ios scripts __tests__` → **1 file changed, 5 insertions(+), 1 deletion(-)** — the accepted code state and the repair differ, across the entire kernel/harness/driver/reader/gate surface, by this hunk and nothing else. Gate `__tests__/voice-kernel-00-source-gates.test.ts` alone at `faf918b5c`: **82/82** (the test file is inside `SID_ALLOWED`; the twelve frozen-subject history pins and the invariant-file identity to `ac12dedf4` are unaffected because no kernel file moved). `k00-source-ledger.py` and both frozen readers untouched. Not verifiable here: that Swift 6.2.4 now type-checks the expression — the remote session has no toolchain; that is precisely what `SID MAC-COMPILE-02` exists to witness, and a further time-out on a sibling expression would be that act's finding, not this one's.

**Standing after §10.8.** `SID REPAIR-01` WRITTEN at `faf918b5c` · awaiting **founder diff review** (this section is the diff) · `SID MAC-COMPILE-02` **NOT OPEN** — opens only by a separate founder act naming `faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8` exactly, with its own §10.2-shaped pin (same steps; new `$OUT` stamp; `mkdir -p "$OUT"` moved after the `test ! -e "$WT"` precondition per the §10.7 design note; reinstall pins still empty). Accepted code state for **source/offline** purposes remains `f0c6ae13b`; for **compile** purposes the candidate is `faf918b5c`. Sibling expressions HOLD · FIRST-INSTALL CLOSED · SID ENTRY WITNESS REQUIRED, not opened · device execution NONE · C-D26 HOLD · the §10.7 third-transcript `ls` still owed as a record matter.

### 10.9 FOUNDER RULING on the third transcript (2026-09-15): queued duplicate → **EXECUTION ESTABLISHED · precondition refusal at the existing `$WT` · non-substantive residue only** — supersedes the §10.5 / §10.7 / `RETURN.txt` "not established" wording

Recorded verbatim in substance. The founder checked the file directly on the Mac: `sid-mac-compile-01-transcript-20260915T213208Z.log` is 0 bytes, created **21:32:08Z**, and the carrier's own transcript `sid-carrier-transcript-20260915T213212Z.log` begins **21:32:12Z** — four seconds later. With the executed script's preamble (`set -e` · … · `mkdir -p "$OUT"` · `test ! -e "$WT"`) and the original worktree already present from the governed run, a second invocation creates its `$OUT` and its tee transcript, reaches `test ! -e "$WT"`, and terminates before producing any stdout. Ruled standing:

```text
first invocation
  EXECUTED · STOP at Swift test compilation · authority SPENT

queued duplicate
  EXECUTION NOW ESTABLISHED
  precondition refusal at existing $WT
  0-byte tee transcript
  no gate · no Swift · no Xcode · no device act
  non-substantive residue only
```

This **supersedes** three earlier wordings, none of which is edited: §10.5 ("visible scrollback, execution NOT ESTABLISHED"), §10.7 ("outcome most plausibly a precondition refusal, NOT witnessed"), and the carrier's `RETURN.txt` line `DUPLICATE_INVOCATION not-established` (authored by the carrier script from §10.5's state; the carrier directory is frozen evidence and is not rewritten). The §10.7 `ls -ld …` line is no longer owed; it remains a free confirmation (an empty `…-out-20260915T213208Z` directory would be the mechanism's footprint) and, if run, would be recorded as such. The §10.7 design note stands for the next pin: `mkdir -p "$OUT"` after the worktree precondition, so a refusal leaves no residue at all.

**Ordering, as the founder stated it and as it ran.** §10.7 (carrier read, third-transcript finding) was written and committed (`e7a50435f`) **before** `SID REPAIR-01` (`faf918b5c`); the ruling here changes the finding's classification, not its place in the sequence. `REPAIR-01` remains open exactly as ruled (§10.6) and is written (§10.8), awaiting diff review. Siblings HOLD. `SID MAC-COMPILE-02` NOT OPEN.

### 10.10 Free confirmation of §10.9 (founder, Mac terminal, read-only, 2026-09-15)

```text
drwxr-xr-x  413 soullab  wheel  13216 Sep 15 16:43 /private/tmp/sid-mac-compile-01-f0c6ae13b88db29cbd1537bec585d98376c8bc4f
drwxr-xr-x    8 soullab  wheel    256 Sep 15 16:44 /private/tmp/sid-mac-compile-01-out-20260915T204348Z
drwxr-xr-x    2 soullab  wheel     64 Sep 15 17:32 /private/tmp/sid-mac-compile-01-out-20260915T213209Z
```

The mechanism's footprint is present: an **empty** `$OUT` directory (`2` links, 64 bytes = `.` and `..` only) stamped `20260915T213209Z`, created 17:32 local — one second after the shell's tee stamp `213208Z`, because the script computes its own `STAMP` after `bash` starts. The duplicate ran `mkdir -p "$OUT"`, reached `test ! -e "$WT"` with the governed worktree (16:43) present, and exited: no `head.txt`, no log, nothing written into the governed `$OUT` (unchanged at 16:44, 8 entries). §10.9's ruling is confirmed by direct evidence; nothing in the ruling changes. Residue on the Mac: the empty `…-out-20260915T213209Z` directory — non-substantive; left in place (nothing on the Mac is deleted in this lane without a ruling). Next pin: `mkdir -p "$OUT"` after the precondition.

### 10.11 FOUNDER RULINGS (2026-09-15): `SID REPAIR-01` **ACCEPTED** at `faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8` · `SID MAC-COMPILE-02` **OPEN** against that SHA exactly → execution pin issued as a standalone file

**Ruling 1 — REPAIR-01 ACCEPTED (verbatim in substance).** The founder reviewed `faf918b5c` directly: file changed `PureLogicTests.swift` only · hunks 1 · 5 insertions / 1 deletion · kernel untouched · harness/driver untouched · siblings untouched · assertions unchanged · test values unchanged; the transformation is semantically faithful — *it gives the type solver intermediate typed expressions while preserving the calculation and assertion surface*; scope within ruling, one proven obstruction only, semantic drift NONE FOUND, no amendment required.

**Ruling 2 — MAC-COMPILE-02 OPEN (verbatim in substance).** A fresh compile act against exactly `faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8`; purpose = *requalification after the accepted REPAIR-01, not continuation of MAC-COMPILE-01*; the pin retains the §10.2 compile path with only two changes — (1) subject SHA, (2) `mkdir -p "$OUT"` moved after `test ! -e "$WT"` so a refused invocation cannot manufacture an empty evidence directory (*evidence hygiene, not a change to the qualification being performed*). Boundary: sibling repair ⛔ HOLD · additional code change ⛔ NONE · reinstall pins EMPTY · install 0 · launch 0 · sample 0 · device mutation 0. **MAC-COMPILE-02 gets its own fate**: if the compiler now exposes `g`, `seq26`, the inner `on` loop, or anything else, that is a new finding and a STOP, not inherited permission to repair it.

**Pin issued.** `docs/programme/VOICE-2026/SID_MAC-COMPILE-02_PIN_2026-09-15.sh` — 50 lines, `554e663eca340b9cad70cf1139718930926a0b931070b4012e6417d53fc9d390`. Derived mechanically from the accepted §10.2 block (extracted from `7ec59882d`, hash `a3a803f4…` reproduced here first) by `sed`/`awk`; the complete `diff` between the two is:

| lines | change | authority |
|---|---|---|
| 2 | `SHA=f0c6ae13b…` → `SHA=faf918b5c…` | ruled change 1 |
| 7→9 | `mkdir -p "$OUT"` moved from before to after `test ! -e "$WT"` | ruled change 2 |
| 4 · 6 · 40–42 · 50 | act label `sid-mac-compile-01` / `SID-MAC-COMPILE-01` → `…-02` in the worktree path, the `$OUT` path, the manifest filename and the final echo | **labelling only — disclosed as a third class the ruling did not enumerate**: the evidence of act 02 must not be written under act 01's name, and a `-02-` worktree path also cannot collide with the still-present `-01-` worktree; every command, test, path component and identity read is otherwise byte-identical |

If the founder prefers the strict two-change reading, the label substitution is reverted and the pin re-issued before any run; **nothing runs on this pin until the founder runs it.** Steps, PASS conjunction and STOP rules are exactly §10.1/§10.2's: HEAD exact + tree clean → gate 82/82 → `swift build` → `swift test` (`Executed N tests, with 0 failures`; `SourceEstimatorTests … passed` count) → `xcodegen` → unsigned generic-iOS build → signed device build (team `ZVK2X646Z2`, destination id `00008140-00163D9922E0801C`, no install) → identity (bundle `life.soullab.voicekernel.vpio02sid` · display `VoiceKernel VPIO-02-SID` · dylib UUID · dylib SHA · executable SHA · manifest + count) → post-build `git diff --quiet -- ios/VoiceKernel ios/VoiceKernelHarness/project.yml scripts __tests__` → `SHA256SUMS.compile` → `SID-MAC-COMPILE-02 <stamp> subject faf918b5c… out <OUT>`. Any Swift diagnostic = STOP, returned as the exact failure, not repaired.

**Run shape (Mac Studio terminal directly; file transport; no paste of the body):**

```bash
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
git -C /Users/soullab/MAIA-SOVEREIGN show origin/claude/voice-2026-census-01:docs/programme/VOICE-2026/SID_MAC-COMPILE-02_PIN_2026-09-15.sh > /private/tmp/sid-mac-compile-02.sh
shasum -a 256 /private/tmp/sid-mac-compile-02.sh; wc -l /private/tmp/sid-mac-compile-02.sh
bash /private/tmp/sid-mac-compile-02.sh 2>&1 | tee /private/tmp/sid-mac-compile-02-transcript-$(date -u +%Y%m%dT%H%M%SZ).log; echo "rc=${PIPESTATUS[0]}"
```

Custody check before line 4: `554e663e…` and `50`. Do not type anything into the window while it runs. `rc=` may be empty (C-D26). The evidence carrier for `$OUT` follows the §10.6 carrier shape on a `feature/*` branch — issued after the run, whatever its fate.

**Standing after §10.11.** REPAIR-01 ACCEPTED · compile candidate = `faf918b5c` · `SID MAC-COMPILE-02` OPEN, pinned, NOT YET EXECUTED · siblings HOLD · reinstall pins EMPTY · FIRST-INSTALL CLOSED · SID ENTRY WITNESS REQUIRED, not opened · device execution NONE · C-D26 HOLD.

### 10.12 `SID MAC-COMPILE-02` EXECUTED (founder, Mac Studio terminal directly, 2026-09-15) → **final echo reached = pinned PASS conjunction satisfied, as founder-reported** · carrier issued · acceptance waits on custody

**Transport.** Label substitution accepted by execution. Extracted pin = 50 lines · `554e663e…` (matches). `$OUT = /private/tmp/sid-mac-compile-02-out-20260915T214212Z`; worktree `/private/tmp/sid-mac-compile-02-faf918b5c…` (new path, no collision with the `-01-` worktree). `rc=` empty (C-D26).

**Transcript, step by step (founder report; custody pending the carrier).**

| step | witnessed line(s) | pinned criterion |
|---|---|---|
| HEAD | `faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8` | exact — PASS |
| tree before | `test -z "$(git status --porcelain)"` passed (script continued) | clean — PASS |
| toolchain | Xcode 26.3 (17C529) · xcodegen 2.46.0 · Apple Swift 6.2.4 — identical to MAC-COMPILE-01 | same toolchain that produced the 485:13 time-out |
| gate | `Tests: 82 passed, 82 total` | 82/82 — PASS |
| `swift build` | `[13/13] Compiling VoiceKernel AudioGraph.swift` · `Build complete! (4.00s)` | PASS |
| `swift test` | **`Executed 33 tests, with 0 failures (0 unexpected)`** (package total; per-suite lines include `Executed 6 tests, with 0 failures … 0.033 s` = `SourceEstimatorTests`) | zero failures — PASS · **the six source unit vectors have now executed for the first time on any toolchain, all passing** |
| source count | `7` (`SourceEstimatorTests` lines carrying `passed` = suite summary + six tests) | readable — PASS |
| xcodegen | `Created project at …/VoiceKernelHarness.xcodeproj` | PASS |
| unsigned generic-iOS build | `** BUILD SUCCEEDED **` | PASS |
| signed device build (team `ZVK2X646Z2`, destination id) | `** BUILD SUCCEEDED **` | PASS · no install, no launch |
| identity | `life.soullab.voicekernel.vpio02sid` · `VoiceKernel VPIO-02-SID` · dylib UUID **`4A6AD464-0A19-320F-980E-7446F6AA1440`** (arm64) · dylib SHA-256 **`a15b399d9a9a3c1071d12ba3c4fb24a56b3f6e51c708f8d3c5dd9cb811bdfc44`** · executable SHA-256 **`db036694dcaa415bb50bb6319af249d643e6db76847177541db836f2f1ec5d17`** · manifest `SID-MAC-COMPILE-02.manifest.sha256` = **`699ac758b12bd8062145655ad12fab6ed5ac2c96e1b4003cc210a5b39f72c7a4`**, **7 files** · codesign `Identifier=life.soullab.voicekernel.vpio02sid` · `TeamIdentifier=ZVK2X646Z2` · Apple Development authority chain | bundle/display exact; every identity field readable — PASS |
| post-build surface | `head-after` = `faf918b5c…` · `status-after` = ` M ios/VoiceKernelHarness/Harness/Info.plist` (19+/1−) only · `git diff --quiet -- ios/VoiceKernel ios/VoiceKernelHarness/project.yml scripts __tests__` passed | the known `xcodegen` footprint and nothing else (§10.2 reading law) — PASS |
| seal + echo | `SHA256SUMS.compile` written · `SID-MAC-COMPILE-02 20260915T214212Z subject faf918b5c… out …` | final echo reached — PASS |

**What this establishes, and what it does not.** (i) The line-485 obstruction is **resolved on the same toolchain that produced it** — no sibling expression (`g`, `seq26`, the inner `on` loop) produced a diagnostic; they were, as the founder anticipated they might be, merely similar-looking expressions, and **no change was manufactured for them**; sibling HOLD is now moot rather than lifted. (ii) The SID subject compiles, its unit vectors pass (6/6 within 33/33), and it builds signed for the registered device with the ruled identity. (iii) This is a **compile qualification only**: install 0 · launch 0 · sample 0 · device mutation 0; the reinstall pins remain **EMPTY** — the identity above is recorded here, not pinned into `k00-reinstall.sh`; that mutation is its own act after the compile evidence is accepted (§10.1). (iv) **Acceptance waits on custody**: this section is the founder's transcript; the carrier below brings `$OUT` (head/status/toolchain/gate/swift-build/swift-test/source-tests-passed-count/xcodegen/xcodebuild-unsigned/xcodebuild-signed/build-results/identity/manifest/head-after/status-after/diff-after/SHA256SUMS.compile) onto a `feature/*` branch, is cherry-picked `-x`, the compile seal is re-checked file-by-file and the manifest re-hashed here before `SID MAC-COMPILE-02` is recorded ACCEPTED.

**Carrier issued** — `docs/programme/VOICE-2026/SID_MAC-COMPILE-02_CARRIER_2026-09-15.sh` (§10.6 shape): reads `$OUT` whole (`cp -R`), the executed pin, every `sid-mac-compile-02-transcript-*.log`, a listing; runs `shasum -c SHA256SUMS.compile` inside the copy and stores the result as `SHA256SUMS.compile.check`; writes `SHA256SUMS.run` + `RETURN.txt`; commits to `feature/sid-mac-compile-02-evidence-20260915T214212Z` and pushes. Never writes into `$OUT`; touches no code. Run shape as §10.6 (`git show <sha>:… > /private/tmp/sid-carrier-02.sh` · `shasum`/`wc -l` · `bash … | tee …`).

**Standing after §10.12.** `SID MAC-COMPILE-02` EXECUTED · PASS (founder-reported) · **NOT YET ACCEPTED** (carrier owed) · REPAIR-01 ACCEPTED at `faf918b5c` · siblings: no finding · reinstall pins EMPTY · FIRST-INSTALL CLOSED · SID ENTRY WITNESS REQUIRED, not opened · device execution NONE · C-D26 HOLD. Next possible founder acts, none open: accept MAC-COMPILE-02 on custody → rule on pinning the SID identity into the reinstall instrument → rule on opening the SID ENTRY WITNESS.

### 10.13 FOUNDER RULINGS on §10.11–§10.12 (2026-09-15): label substitution ACCEPTED as constitutive act identity · `SID MAC-COMPILE-02` **PASS · authority SPENT** on the founder's independent read of `$OUT` · carrier NOT withheld

**Ruling 1 — labels (verbatim in substance).** The founder compared the issued script against the accepted §10.2 block directly; the complete differences are exactly: subject SHA `f0c6ae13b…` → `faf918b5c…` · worktree identity `sid-mac-compile-01` → `-02` · OUT identity `-01` → `-02` · `mkdir` moved after the `$WT` precondition · manifest filename `COMPILE-01` → `COMPILE-02` · final identity echo `COMPILE-01` → `COMPILE-02`; *no undisclosed build, test, identity, signing, source, or acceptance-command changes.* The `01→02` substitutions are accepted **as constitutive act identity, not an expansion of authority** — and the worktree identity change was *necessary*: retaining the preserved `-01-` worktree path would have made `MAC-COMPILE-02` refuse immediately and so could not have instantiated the separately authorized act. No re-issue required.

**Ruling 2 — PASS (verbatim in substance).** The founder independently read `/private/tmp/sid-mac-compile-02-out-20260915T214212Z`: subject `faf918b5c…` before and after · repository clean before · JS/source gate 82/82 · Swift build PASS · Swift test suite 33 tests, 0 failures, 0 unexpected · `SourceEstimatorTests` 6 tests, 0 failures · **the repaired modulation-index test `testTheOrderedEnvelopeModulationIndexSeparatesAGatedStimulusFromASteadyOrFluctuatingOne` executed and passed** — *REPAIR-01 has done more than merely compile: its affected test executed successfully* · unsigned Xcode build SUCCEEDED · signed device-target build SUCCEEDED · identity `life.soullab.voicekernel.vpio02sid` / `VoiceKernel VPIO-02-SID` / `TeamIdentifier=ZVK2X646Z2` / `Apple Development: Kelly Nezat (N9DTF6434L)` · signed artifacts hashed · product manifest 7 entries · `status-before.txt` 0 bytes · after: `M ios/VoiceKernelHarness/Harness/Info.plist` only, 20 lines — the known `xcodegen` footprint the pin permits; the protected source/project/script/test diff check passed (else the final echo was unreachable) · **compile evidence seal present: `SHA256SUMS.compile`, 17 entries, sha256 `d835bebc36a86be7d8640fdbdd68b36eca9b26cce1faaaec70b3a12c3c93e2d3`** · normal termination at the `SID-MAC-COMPILE-02 20260915T214212Z subject faf918b5c… out …` echo · empty `rc=` = the known zsh `PIPESTATUS` display issue, not failure. Standing ruled:

```text
REPAIR-01                 ACCEPTED
SID MAC-COMPILE-02        EXECUTED · PASS · authority SPENT
sibling-expression HOLD   remains HOLD — no sibling compiler finding occurred
reinstall pins            EMPTY
install 0 · launch 0 · sample 0 · device act 0
```

*Do not withhold the carrier*: the `MAC-COMPILE-02` evidence carrier is issued under the established pattern, preserving `$OUT` and the transcript before anything downstream opens.

**Corrections to this record's own wording.** §10.12 said the sibling HOLD was "moot rather than lifted"; the founder's standing is **remains HOLD** — the absence of a finding leaves the hold in place, it does not dissolve it. §10.12 also made acceptance wait on custody; the founder has ruled PASS on a direct read of `$OUT`, which is the founder's witness, not this session's. What custody still does here, when the carrier lands: reproduce the 17-entry `SHA256SUMS.compile` (expected sha256 `d835bebc…`), re-hash the 7-entry manifest (expected `699ac758…`), read `swift-test.log` in full, and record the reproduction as §10.14 — a confirmation of a ruling already made, not a condition of it.

**Carrier status.** `SID_MAC-COMPILE-02_CARRIER_2026-09-15.sh` was committed at `3bad244ad` in the same minute this ruling arrived (28 lines, `5aaa5120fdf9b2c0c8c541857b274272b9343553635561d72d45fcf179e01a65`). Run shape (Mac Studio terminal directly; no paste of the body):

```bash
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
git -C /Users/soullab/MAIA-SOVEREIGN show 3bad244ad:docs/programme/VOICE-2026/SID_MAC-COMPILE-02_CARRIER_2026-09-15.sh > /private/tmp/sid-carrier-02.sh
shasum -a 256 /private/tmp/sid-carrier-02.sh; wc -l /private/tmp/sid-carrier-02.sh
bash /private/tmp/sid-carrier-02.sh 2>&1 | tee /private/tmp/sid-carrier-02-transcript-$(date -u +%Y%m%dT%H%M%SZ).log; echo "rc=${PIPESTATUS[0]}"
```

Expected final line `SID-MAC-COMPILE-02 CARRIER PUSHED`. It reads `$OUT`; it never writes it.

**Standing after §10.13.** `SID MAC-COMPILE-02` PASS · SPENT · carrier issued, not yet landed · REPAIR-01 ACCEPTED · siblings HOLD · reinstall pins EMPTY · FIRST-INSTALL CLOSED · SID ENTRY WITNESS REQUIRED, not opened · device execution NONE · C-D26 HOLD. Downstream acts, none open until the founder opens them: reinstall-pin mutation for the SID identity (UUID `4A6AD464-…`, container unknown until an install exists) · SID ENTRY WITNESS.

### 10.14 FOUNDER RULINGS (2026-09-15) after the first `MAC-COMPILE-02` carrier attempt: carrier STOP = checker defect → **carrier-B issued** · `SID REINSTALL-PIN-SID` OPEN code-only → **written at `3f3cb15b070d9237f17f66625ede6591b1ae5940`** · `SID ENTRY-WITNESS-DESIGN` OPEN (records/design only)

**Carrier attempt 1 — STOP (founder, verbatim in substance).** The carrier reached its feature worktree and copied the evidence, then stopped at `shasum -c SHA256SUMS.compile`: the seal contains a self-entry `e3b0c442… ./SHA256SUMS.compile` — the hash of the seal while it was still empty during its own creation (the §10.2 recipe's `( … | xargs shasum ) > "$OUT/SHA256SUMS.compile"` opens the output file before `find` enumerates it, so the seal lists itself at zero length). Populated, the seal's real hash is `d835bebc36a86be7d8640fdbdd68b36eca9b26cce1faaaec70b3a12c3c93e2d3`; the copy has that hash and the other 16 sealed files verify OK. No remote evidence branch, no carrier commit. Standing: `SID MAC-COMPILE-02` PASS unchanged · carrier attempt STOP (checker defect) · compile `$OUT` frozen · failed carrier worktree preserved as residue. *Do not rewrite or "fix" the original compile seal.* Note for future compile pins (not repaired here): write the seal to a temporary path outside `$OUT`, or exclude the seal's own name, so it never lists itself.

**Carrier-B (narrow repair/re-issue, as ruled).** `docs/programme/VOICE-2026/SID_MAC-COMPILE-02_CARRIER-B_2026-09-15.sh` (36 lines) — fresh worktree `/private/tmp/sid-carrier-02b-20260915T214212Z` and branch `feature/sid-mac-compile-02-evidence-b-20260915T214212Z`; only the verification semantics changed: asserts the copied `SHA256SUMS.compile` hashes to `d835bebc…` · asserts exactly one self-entry for `./SHA256SUMS.compile` · asserts 17 lines · preserves the self-entry unchanged · verifies the other 16 entries with the self-entry excluded from the check input (`grep -v … | shasum -c -`) and asserts 16 `OK` · writes the check result plus the preserved self-entry line to `SHA256SUMS.compile.check` · then the carrier's independent `SHA256SUMS.run` and `RETURN.txt` (which names carrier attempt 1's STOP) · commit · push. The semantics were self-tested here on a synthetic seal built by the same recipe (17 lines, one `e3b0c442` self-entry, 16 OK). It never rewrites the compile seal and never writes into `$OUT`. Run shape as §10.13, substituting `CARRIER-B` in the path and `sid-carrier-02b` for the transcript name.

**`SID REINSTALL-PIN-SID` — ruling (verbatim in substance) and the mutation.** OPEN · CODE-ONLY; may record bundle identifier `life.soullab.voicekernel.vpio02sid`, dylib UUID `4A6AD464-0A19-320F-980E-7446F6AA1440`, dylib SHA-256 `a15b399d9a9a3c1071d12ba3c4fb24a56b3f6e51c708f8d3c5dd9cb811bdfc44`; container identity ⛔ NOT KNOWN — *must remain structurally unset / witness-required, must not be guessed or manufactured*, and kept **semantically unknown rather than an ordinary empty value that downstream code might mistake for a legitimate pin**; install 0 · launch 0 · sample 0 · device act 0; no install or runtime witness inherited. Written at **`3f3cb15b070d9237f17f66625ede6591b1ae5940`** (two files; gate 82/82):

- `scripts/witness/k00-reinstall.sh`: `VPIO02SID_UUID` and `VPIO02SID_DYLIB_SHA` filled with exactly the two ruled values; `VPIO02SID_EXEC_SHA` / `_MANIFEST_SHA` / `_MANIFEST_FILES` **left empty** because they are outside the ruled list — consequence, stated plainly: **`pins-unrecorded` still refuses the SID subject before any device verb**, which is the fail-closed reading of a partial ruling, not a defect. The compile evidence does hold those three values (executable SHA `db036694dcaa415bb50bb6319af249d643e6db76847177541db836f2f1ec5d17` · manifest SHA `699ac758b12bd8062145655ad12fab6ed5ac2c96e1b4003cc210a5b39f72c7a4` · 7 files); if the founder extends the ruled list to them, that is a second three-line mutation under this same shape. New constant `VPIO02SID_CONTAINER="WITNESS-REQUIRED"` — declared once, **consumed nowhere** (the container is not an install input; it exists only after an install and is captured by the ENTRY witness); the comment above it says why neither an empty string nor a UUID would be admissible there.
- `__tests__/voice-kernel-00-source-gates.test.ts`: the SOURCE-ID-02 obligation that asserted all five SID pins empty now asserts the two ruled values exactly, the three unruled pins still empty, the sentinel present exactly once, and that the sentinel is never `""` and never UUID-shaped. The historical `sidOnlyDelta` pins are unaffected (every changed/added line carries a `VPIO02SID_` / `SOURCE-ID-02` / `pins-unrecorded` token).

Complete diff returned to the founder in-session for review; nothing downstream opens on it.

**`SID ENTRY-WITNESS-DESIGN` — OPEN (verbatim in substance).** Records/design only, analogous to SOURCE-ID-01: define the witness §18.34 requires before any source population — identity inputs · preconditions · read-only observations · acceptance/refusal criteria · timing/order · evidence carriers · failure semantics · container-ID capture after install · the exact boundary between ENTRY and source population. May not install, launch, sample, populate a source, modify a device, or spend an ENTRY witness. *Designing the witness now separates what counts as admissible ENTRY evidence from whatever happens during the eventual install; it prevents the install result from retroactively defining its own test.* Design returned as `KERNEL-00_VPIO-02_SID_ENTRY_WITNESS_DESIGN_2026-09-15.md` (§10.15 on return).

**Standing after §10.14.** MAC-COMPILE-01 STOP · spent · durable · REPAIR-01 ACCEPTED · MAC-COMPILE-02 PASS · spent · carrier attempt 1 STOP (checker) · carrier-B issued, not yet run · reinstall-pin written at `3f3cb15b070d9237f17f66625ede6591b1ae5940`, diff review next · ENTRY witness design OPEN, in progress · siblings HOLD · install/launch/sample 0 · failed carrier worktree, compile `$OUT`, compile seal and all 01 residue untouched.

### 10.15 Carrier-B LANDED and READ · a terminal-hygiene incident (non-event for the repo) · FOUNDER RULINGS: act 1 ACCEPTED at `3f3cb15b0` · act 2 OPEN → written at `3035c0235` · ENTRY design CONTINUED with the three-moment framing (2026-09-15)

**Carrier-B.** Founder ran it (36 lines · `ed69fa6a…`; fresh worktree `sid-carrier-02b-…`; branch `feature/sid-mac-compile-02-evidence-b-20260915T214212Z`); pre-commit hooks passed; commit `ca735fe15f4dc83618a0c3caac0269a7ddafc091`, 23 files, 1,277 lines; final line `SID-MAC-COMPILE-02 CARRIER-B PUSHED`. Carrier attempt 1's transcript (branch `…-evidence-20260915T214212Z`, no commit) shows the STOP exactly where the founder placed it: after "Switched to a new branch", nothing — the `shasum -c` output went to the `.check` file and `set -e` exited. **Cherry-picked here with `-x`** (`docs/programme/VOICE-2026/driver-ledger/sid-mac-compile-02-20260915T214212Z/`, 23 files). Reproduced from custody: `SHA256SUMS.run` = `9db0dffa3cd7c290a68dcb3232efcef82f018fab2a3e240016e6aee74cb1b727`, **0 mismatches** · `SHA256SUMS.compile` = `d835bebc36a86be7d8640fdbdd68b36eca9b26cce1faaaec70b3a12c3c93e2d3`, 17 lines, one self-entry `e3b0c442…` preserved, **16/16 OK** excluding it (and `SHA256SUMS.compile.check` says the same) · manifest `699ac758…`, 7 entries · `head.txt` = `head-after.txt` = `faf918b5c…` · `status-before.txt` 0 bytes · `build-results.txt` two `** BUILD SUCCEEDED **` · `source-tests-passed-count.txt` 7 · `swift-test.log`: `Executed 33 tests, with 0 failures`, `SourceEstimatorTests` 6/6, and **`testTheOrderedEnvelopeModulationIndexSeparatesAGatedStimulusFromASteadyOrFluctuatingOne … started` then `passed`**, zero `error:` lines. §10.13's ruling is confirmed from custody in every field it named.

**Terminal incident (recorded because it happened in the witness window, classified as a non-event for the repository and the device).** After carrier-B, the §10.14 reinstall diff text was pasted into the same zsh window. zsh executed it line by line: every `+`/`-`/`---` line → `command not found` or `no matches found` (nothing ran); the diff's unchanged context lines (leading space, e.g. ` VPIO02SID_BID="…"`, ` VPIO02SID_EXEC_SHA=""`) **did** execute as interactive shell-variable assignments — session-local, no file touched, no redirection anywhere in the pasted text; the second block's quotes left the window in a `dquote>` continuation, buffering, not executing. Founder ruling: press `Ctrl-C` once to cancel the unfinished quoted command, then **retire that Terminal window from governed witness work** — the shell state is no longer clean enough for custody; the next governed act uses a fresh window. No repository edit, no device act, no authority spent. (Lesson already in the record from §10.3/§10.4, now in a third form: diff text is for reading, never for a terminal; the run shapes in this record are the only things meant to be pasted, and even those travel by `git show`.)

**Ruling — `SID REINSTALL-PIN-SID` act 1 ACCEPTED at `3f3cb15b0`** (verbatim in substance): the actual commit reviewed, not only the pasted diff; within the code-only authority — 2 files · reinstall script identity constants/comments only · gate test pins the new law · install verb unchanged · launch/sample unchanged · no device read/write added; the two values are exactly the witnessed ones (`4A6AD464-0A19-320F-980E-7446F6AA1440`, `a15b399d…`), visible in the compile transcript; `VPIO02SID_CONTAINER="WITNESS-REQUIRED"` accepted **as a sentinel, not identity data** — asserted exactly once, not consumed by the reinstall path — preserving that *the container does not exist as admissible identity until an ENTRY witness observes it after install*. No amendment.

**Ruling — act 2 OPEN, code-only, exactly the remaining three compile-established pins** (`VPIO02SID_EXEC_SHA` = `db036694dcaa415bb50bb6319af249d643e6db76847177541db836f2f1ec5d17` · `VPIO02SID_MANIFEST_SHA` = `699ac758b12bd8062145655ad12fab6ed5ac2c96e1b4003cc210a5b39f72c7a4` · `VPIO02SID_MANIFEST_FILES` = `7`; may change those and the corresponding gate expectations/comments only; may not change BID · UUID · DYLIB_SHA · container sentinel · reinstall transaction · device selection · first-install law · `K00_EXEC_AUTHORITY` law · install verb · launch/sample behaviour). Founder's stated consequence, carried into the script comment verbatim in substance: *once these three are populated the `pins-unrecorded` structural refusal disappears for the SID subject; that does not authorize installation — artifact matching, manifest verification, just-in-time absence and explicit execution authority still stand; "installable under a future authorized transaction" is not "installation opened".* **Written at `3035c0235`** — 2 files, `+13 −8` (three value lines, one `VPIO02SID_MANIFEST_FILES=7` unquoted to match the VPIO-01/02 form the gate already expects, the comment block extended, the gate's three empty-string expectations replaced by three exact-value expectations); `git diff 3f3cb15b0 3035c0235 -- scripts ios __tests__` = those 2 files only; gate 82/82. Returned for diff review.

**Ruling — ENTRY design CONTINUED**, with the founder's three-moment framing (PRE-INSTALL · INSTALL TRANSACTION · POST-INSTALL ENTRY · ONLY AFTER ENTRY PASS) now §2a of the design, including the four-link binding chain (compiled identity ↔ artifact at install time ↔ container from the install result ↔ live installed bundle) that makes a population sample admissible ENTRY evidence only for a bound subject. Design returned: §10.16.

### 10.16 `SID ENTRY-WITNESS-DESIGN` RETURNED (read-only; authorizes nothing) — `KERNEL-00_VPIO-02_SID_ENTRY_WITNESS_DESIGN_2026-09-15.md`

Shape: §1 the question (Q-ENTRY: does the in-process observer perturb physical entry; H0/H1; what it is not; why the observer must be demonstrably live) · §2 identity inputs (all five pins + UUID, product path, device, container UNKNOWN, `.vpio02` coexistence) · §2a the three moments and the binding chain · §3 the chain [A] pin completion → [B] FIRST-INSTALL-SID → [C] container capture (records-only) → [D] preflight → [E] ENTRY batch (`--vp on --mode L --hold 15 --subject vpio-02-sid`, no `--act output`, no `--stimulus`) → [F] carrier → [G] verification here → [H] adjudication, each its own authority · §4 preflight block (HEAD + instrument identity · both containers = 1 · harness processes = 0 · product UUID) · §5 observations (frozen classifier rows via `classifierSubject=vpio-02`; latency vs the 1 500 ms ceiling; **observer liveness** `L ≥ 10` `input_source_sample` records with `frames ≥ 1` per journal, bins/`m2` never read; `input_health_sample` cadence unchanged) · §6 predeclared reading law (validity: infrastructure ≤ 2, liveness veto, `SUBJECT-MISMATCH` = STOP-CLASS; classes ENTRY-UNPERTURBED `t/v ≥ 24/30` ∧ one-sided Fisher vs F-W1 (29,1) n.s. ∧ 0 ceiling breach ∧ all live · ENTRY-PERTURBED · INDETERMINATE-ENTRY with reason · CHARACTERIZE ONLY; latency shift descriptive; no class licenses anything) · §7 carriers (seal written outside the dir first) · §8 container capture (produced by the install result line; recorded in two places; never in an instrument; sentinel permanent) · §9 the ENTRY/population boundary table with two prohibitions (ENTRY journals never fed to the source reader; population never re-reads ENTRY rows) · §10 failure semantics, complete · §11 open questions **Q2–Q6** (N=30 recommended; comparison law as written; liveness bar; whether preflight read 4 is a gate or a read; `.vpio02` coexistence confirmed) — Q1 RULED · §12 standing.

**Standing after §10.16.** MAC-COMPILE-01 STOP · spent · durable · REPAIR-01 ACCEPTED · MAC-COMPILE-02 PASS · spent · durable (carrier-B in custody, all seals reproduced) · reinstall-pin act 1 ACCEPTED `3f3cb15b0` · act 2 written `3035c0235`, review pending · ENTRY design RETURNED, Q2–Q6 owed · [A]–[H] NOT OPEN · siblings HOLD · container WITNESS-REQUIRED · install 0 · launch 0 · sample 0 · source population 0 · the `dquote>` window retired.

### 10.17 FOUNDER RULINGS (2026-09-15): act 2 ACCEPTED at `3035c0235` · ENTRY design ACCEPTED in architecture with Q2–Q6 ruled (Q3 AMENDED) · `FIRST-INSTALL-SID` pin DRAFT OPEN (draft only) → draft returned

**Act 2 — ACCEPTED at `3035c0235`** (verbatim in substance): the actual commit reviewed; exactly the three compile-established pins (`VPIO02SID_EXEC_SHA` `db036694…` · `VPIO02SID_MANIFEST_SHA` `699ac758…` · `VPIO02SID_MANIFEST_FILES` `7`), their gate expectations and explanatory comments; BID, UUID, dylib SHA, container sentinel, install transaction, device selection, first-install law, authority gate and install verb untouched. *`pins-unrecorded` may now cease refusing the SID subject — identity completion, not install authority.* The carrier-B terminus and the terminal-paste non-event were confirmed by the founder in the same ruling (fresh Terminal window for the next governed execution).

**ENTRY design — architecture ACCEPTED; rulings folded into the design file as marked (§4, §6.3, §11, §12):**
- **Q2 · N = 30** — organism comparison against F-W1's 30; matching N keeps the baseline legible.
- **Q3 · AMENDED — UNPERTURBED floor = 27/30.** *Failure to establish significant deterioration is not the same claim as evidence of non-perturbation.* One-sided Fisher vs 29/1: 27/30 p=.306 · 26/30 p=.177 · 25/30 p=.097 · 24/30 p=.051 · 23/30 p=.026 — 24 is the statistical boundary and would give five extra failures the strongest reassuring class. Ruled classes: UNPERTURBED = `t ≥ 27/30` ∧ Fisher n.s. ∧ 0 ceiling breaches ∧ all rows OBSERVER-LIVE · PERTURBED = Fisher significant ∨ ≥ 2 breaches · INDETERMINATE-ENTRY = everything between, including 24–26 takes or exactly 1 breach, reason named.
- **Q4 · OBSERVER-LIVE = ≥ 10 `input_source_sample` records during the 15 s hold**; a valid row below that is INDETERMINATE-ENTRY (observer-dormant), never silently excluded.
- **Q5 · product existence + identity = GATE at [B]; product-path existence = READ ONLY at [D]**; disappearance between [B] and [D] does not invalidate an already-bound installed identity.
- **Q6 · coexistence YES** — `.vpio02` exactly one container · `.vpio02sid` exactly one · uninstall NEVER · overwrite of `.vpio02` NEVER; the historical comparator is preserved in the act of introducing the experimental subject.

**`FIRST-INSTALL-SID` pin — DRAFT OPEN, draft only** (verbatim in substance): may define the exact subject · bind the five compile pins · artifact path · absence precondition · coexistence requirement · one-install transaction · `K00_EXEC_AUTHORITY` requirement · install evidence capture · STOP semantics · container extraction/custody; may NOT install · launch · sample · mutate the device · capture a real container · open the ENTRY batch. *Return the complete script and its record section; do not issue a run shape; the actual act receives a separate explicit opening after the pin is reviewed.*

**Draft returned: `docs/programme/VOICE-2026/SID_FIRST-INSTALL-01_PIN_DRAFT_2026-09-15.sh`** — 57 lines, `6201d9bb03d22f334784b8abff96d5ba1003633b682f7739b040a02c7b8dfd70`, `bash -n` only (⛔ never executed here — §13.16.1 rule; the remote session has no device and the script refuses on line 3 without an authority in any case). Shape, line by line in substance:

| block | what it pins | STOP if |
|---|---|---|
| authority (line 3) | `K00_EXEC_AUTHORITY` must be non-empty in the environment — supplied by the founder at invocation (exported from a file in the fresh window, as §13.17 did), **never read from the repo; the draft contains no authority text** — its content is the founder's to author at opening | empty → refuses before any read |
| identity | instrument/lane SHA `3035c02353b3cc0dab0b0ce1823116d6712b8eb1` (act-2 bytes of `k00-reinstall.sh`; carrier-B manifest present in that tree) · subject `faf918b5c…` · bundle `…vpio02sid` · historical bundle `…vpio02` · device `A0736AC8-…` (the registered arm; `K00_DEVICE` override honoured) · UUID / dylib / exec / manifest pins = the five act-1/act-2 values | — |
| PRE-INSTALL, local | worktree and `$OUT` paths absent · **product exists at the exact MAC-COMPILE-02 path** and its dylib SHA, executable SHA and dylib UUID equal the pins (Q5 GATE) · fresh detached worktree at the SHA · HEAD exact · `k00-reinstall.sh` unmodified · manifest file self-hash `699ac758…` and 7 lines · **`mkdir -p "$OUT"` only after every precondition** (§10.7 hygiene) | any mismatch → `set -e` STOP, no device read yet |
| PRE-INSTALL, device (read-only) | `device info apps --bundle-id` twice: `.vpio02` = exactly 1 · `.vpio02sid` = exactly 0 (Q6 coexistence + SID ABSENT, the pin's own read) · `info processes` → 0 harness processes | otherwise STOP before the instrument runs |
| INSTALL TRANSACTION | **exactly one** `k00-reinstall.sh "$OUT" "$APP"` with `K00_SUBJECT=vpio-02-sid` and the four `K00_EXPECT_*` equal to the pins (a disagreeing expectation refuses inside the instrument); the instrument's own custody gate, just-in-time ABSENT read and authority gate are the admission; its `.REFUSED.txt` / `.HELD.txt` exit propagates (`pipefail`) and STOPs the pin; the pin itself contains **zero** `devicectl … install` verbs (grep-checked: 0) | instrument refusal → STOP, authority spent per instrument law |
| POST-INSTALL, capture | `.last-reinstall` → `reinstall-<stamp>.txt` → the `installationURL … /Bundle/Application/<CONTAINER>/VoiceKernelHarness.app` line → `container.txt` (**produced by the install result, extracted by pattern, never typed**) | no result line / no container → STOP |
| POST-INSTALL, bind (read-only) | `.vpio02` still exactly 1 · `.vpio02sid` exactly 1 · the extracted container appears in the SID listing and **not** in the `.vpio02` listing · 0 harness processes (nothing launched) | otherwise STOP — the install happened but the bind failed, returned as such |
| seal + echo | `SHA256SUMS.install` written to `/private/tmp` first, then moved in (never lists itself at zero length) · `SID-FIRST-INSTALL-01 <stamp> subject … instrument … container <CONTAINER> out <OUT>` | — |

Evidence carrier after a run: the §10.6 shape over `$OUT` (apps/processes before+after · reinstall artefact · invocation log · `container.txt` · seal). The container literal then travels, records-only, into the FIRST-INSTALL-SID record and the ENTRY preflight block (design §8); `VPIO02SID_CONTAINER` stays `WITNESS-REQUIRED`.

**What the draft deliberately does not do.** No authority text (founder-authored at opening; expected content: act name `SID FIRST-INSTALL-01`, subject `faf918b5c…`, instrument `3035c0235…`, bundle, "exactly one custody-gated first-install transaction", no launch/sample) · no run shape · no `.vpio02` verb of any kind · no launch · no journal pull · no ENTRY step. Draft review is the next founder act; a separate explicit opening follows review.

**Standing after §10.17.** MAC-COMPILE-01 STOP · spent · durable · REPAIR-01 ACCEPTED · MAC-COMPILE-02 PASS · spent · durable · carrier-B PASS · durable · reinstall-pin act 1 ACCEPTED `3f3cb15b0` · act 2 ACCEPTED `3035c0235` · ENTRY design ACCEPTED (Q1–Q6 ruled) · FIRST-INSTALL-SID draft RETURNED · FIRST-INSTALL-SID run NOT OPEN · ENTRY [D]–[H] NOT OPEN · install 0 · launch 0 · sample 0 · source population 0 · container WITNESS-REQUIRED · siblings HOLD.
