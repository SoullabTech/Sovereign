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

The founder completed the pinned fetch-and-show read (the printed §10.2 block matched the committed text byte-for-byte), then the paste of the block delivered only `set -e` and `SHA=f0c6ae13b…`, echoed a stray fragment (`8bc4f`), and ran the final `echo`, which printed with `$STAMP` and `$OUT` empty. `mkdir`, `test ! -e "$WT"`, the worktree add, the gate, `swift test`, `xcodegen`, both builds, every custody read: none ran; no file, worktree, DerivedData or evidence directory was created; no device verb exists in the block anyway. **Classification (precedent §18.28.3–§18.28.4): a transport/paste non-execution, not a governed STOP; `SID MAC-COMPILE-01` is NOT SPENT and the §10.2 pin stands unchanged.** One consequence for conduct only: `set -e` is now armed in that interactive shell, so the block must be pasted in a **fresh terminal window** as one paste, from `set -e` through the final `echo`, with no fences and no prose — otherwise the first non-zero command would close the shell mid-run and leave a partial `$OUT` that looks like a STOP. Nothing else changes.
