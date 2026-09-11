# KERNEL-00 · MAC-COMPILE-03 — 2026-09-11

**Subject SHA:** `728924819` (PRE-WITNESS-02 §3 applied on `claude/voice-2026-census-01`; plan `6566ace40` accepted as written).
**Purpose:** native viability of the §3 entry-seam repair before any device act. Compile is not a witness. A green compile does not lift anything except the prohibition on installing.
**Operator:** founder, Mac Studio, checkout `~/MAIA-SOVEREIGN` at detached HEAD `728924819` (`git rev-parse --short HEAD` → `728924819`, verbatim in the transcript).
**Toolchain (from the build log):** Xcode `17C529` · iPhoneOS SDK `26.2` (`23C57`) · target `arm64-apple-ios16.0` · Swift language mode 5.
**Team:** `DEVELOPMENT_TEAM=ZVK2X646Z2` (Xcode label "Kelly Nezat"; Individual; `isFreeProvisioningTeam = 0` — founder-read from Xcode's account metadata).

## 1. Results

| Step | Command | Result | Evidence |
|---|---|---|---|
| 1 | `cd ios/VoiceKernel && swift build` | **PASS** | `Building for debugging...` · `[12/12] Compiling VoiceKernel StateProjection.swift` · `Build complete! (5.51s)` |
| 2 | `swift test` | **PASS 20/20 (two runs)** | First pass (19:41) did not run: the instruction line carried a trailing `# expect 20 tests`, the founder's zsh does not treat `#` as a comment on an interactive line (`interactivecomments` off), and `swift test` refused: `error: 4 unexpected arguments: '#', 'expect', '20', 'tests'` — instruction defect (this session's), not a kernel defect. Rerun clean at **19:49:28** and again explicitly on `git rev-parse --short HEAD` → `728924819` at **19:50:02**, both: `Test Suite 'VoiceKernelPackageTests.xctest' passed` · `Executed 20 tests, with 0 failures (0 unexpected)` (`ReplayTests` 6 · `SnapshotRulesTests` 1 · `RecoveryPolicyTests` 3 · remaining suites in the untruncated log; 17 prior + `InputFormatPreconditionTests` ×3 = 20). The swift-testing runner line `Test run with 0 tests in 0 suites passed` is the empty Swift Testing target, expected. |
| 3 | `npx jest --config jest.config.js __tests__/voice-kernel-00-source-gates.test.ts` | **PASS 16/16** | `Tests: 16 passed, 16 total` — including the three PRE-WITNESS-02 gates: validity check lexically precedes every input-node `installTap(onBus: 0` (§3.1) · no `NSException` / `ExceptionCatcher` / `objc_try` anywhere (§3.1) · refused build + configuration change journal format and generation age (§3.4). (The same stray `#` leaked into the jest path pattern, `…\|#\|16\/16`; the suite still matched and ran in full.) |
| 4 | `cd ios/VoiceKernelHarness && xcodegen generate` | **PASS** | `Created project at /Users/soullab/MAIA-SOVEREIGN/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj` |
| 5 | unsigned iOS compile (`-destination generic/platform=iOS CODE_SIGNING_ALLOWED=NO build`) | **PASS — `** BUILD SUCCEEDED **`** | First pass (19:41): kernel target compiled every source with exactly one diagnostic (§2); the paste was cut before the verdict line. Rerun 19:49:30 with the filtered command: `warning: Metadata extraction skipped. No AppIntents.framework dependency found.` then `** BUILD SUCCEEDED **`. No `error:` lines. |
| 6 | signed device build (`-destination id=00008140-00163D9922E0801C DEVELOPMENT_TEAM=ZVK2X646Z2 CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates build`) | **PASS — `** BUILD SUCCEEDED **` (19:41 full log; 19:49:32 filtered rerun, three `Signing Identity: "Apple Development: Kelly Nezat (N9DTF6434L)"` / `Provisioning Profile: "iOS Team Provisioning Profile: *"` pairs, `** BUILD SUCCEEDED **`)** | Linked `VoiceKernelHarness.app/VoiceKernelHarness` and `VoiceKernelHarness.debug.dylib`; `CopySwiftLibs`; `CodeSign` ×3 (debug dylib · `__preview.dylib` · app bundle with entitlements `VoiceKernelHarness.app.xcent`); `Validate … -shallow-bundle`; then `** BUILD SUCCEEDED **`. |

### Signing facts (verbatim from step 6)

```
Signing Identity:     "Apple Development: Kelly Nezat (N9DTF6434L)"
Provisioning Profile: "iOS Team Provisioning Profile: *"
                      (08a653d1-5ec3-4206-84fd-991a5fcc11c2)
/usr/bin/codesign --force --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --entitlements …/VoiceKernelHarness.app.xcent --timestamp=none --generate-entitlement-der …/VoiceKernelHarness.app
```

`appintentsmetadataprocessor`: `warning: Metadata extraction skipped. No AppIntents.framework dependency found.` — tooling note, not a diagnostic against the kernel; the harness declares no App Intents.

Bundle identifier confirmed in the build (`--bundle-identifier life.soullab.voicekernel.k00`). Note the profile in this run is the wildcard team profile (`*`), where MAC-COMPILE-02 recorded an explicit profile for `life.soullab.voicekernel.k00`. Both sign the same bundle id under the same team; recorded as observed, not adjudicated.

## 2. Diagnostics

Exactly one, identical to MAC-COMPILE-02:

```
/Users/soullab/MAIA-SOVEREIGN/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift:121:9: warning: result of 'try?' is unused
        try? session?.release(cause: "leaveConversation", causeSeq: cmd)
```

**Deliberately not changed** (same ruling as MAC-COMPILE-02: a fix would be a new subject requiring its own qualification; it is outside the §3 entry-seam scope).

Nothing in the §3 diff produced a diagnostic. The two compile risks this session flagged before the run — actor-isolated `clock` called inside `graph.flatMap { … }` in `startGraph`, and the `Double` interpolation in the new test's exact-string assertion — did not fire in the kernel target. The second was judged by step 2: the exact-string assertion `invalidInputFormat(sampleRate: 0.0, channels: 1)` passed.

## 3. What is still owed before this record can be accepted

Nothing from the toolchain. Every step in §1 is green on `728924819`. What remains is the founder's acceptance of this record as the compile of record — an act, not a build.

## 4. Standing after this record

```
SUBJECT              728924819
swift build          PASS
swift test           PASS 20/20 (19:49:28 · 19:50:02)
source gate          PASS 16/16
xcodegen             PASS
unsigned compile     PASS · BUILD SUCCEEDED (19:49:30)
signed device build  PASS · BUILD SUCCEEDED · team ZVK2X646Z2 · identity N9DTF6434L (19:41 · 19:49:32)
diagnostics          1 warning (known, unchanged)
MAC-COMPILE-03       GREEN — awaiting founder acceptance
device act           NOT AUTHORIZED until the founder accepts this record
```

A green MAC-COMPILE-03 authorizes exactly one thing: installing `728924819` and rerunning the KERNEL-00 witness **from Enter conversation** under candidate A (rebuild-now with the precondition), recording whatever the organism does into `KERNEL-00_WITNESS_<date>_run2.md`. Thresholds unchanged. Candidate B/C not implemented. Both outcomes legitimate.

## 5. Artifact provenance for the device rerun (founder-read, 2026-09-11 ~20:55)

```
UUID: 81D0C25C-73C9-39BE-B617-CF1020D0A9A4 (arm64) …/VoiceKernelHarness.app/VoiceKernelHarness
UUID: 1AEBEE45-BF4E-3D6E-9D3A-69CFA6E4218A (arm64) …/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib
Identifier=life.soullab.voicekernel.k00
TeamIdentifier=ZVK2X646Z2
```

**Finding — the main executable's UUID is build-invariant; it is not the kernel.** `81D0C25C-…` is byte-identical to the run-1 artifact UUID recorded in `KERNEL-00_WITNESS_2026-09-11.md` §1, although the kernel sources changed between `488e0666c` and `728924819`. The build log explains it: Xcode links the app's main binary as a **stub executor** (`ConstructStubExecutorLinkFileList … libPreviewsJITStubExecutor.a`, entry `___debug_blank_executor_main`, `-reproducible`, with the debug-dylib path embedded by `-sectcreate`), and links every line of kernel and harness code into **`VoiceKernelHarness.debug.dylib`**. Same stub inputs, same DerivedData path → same UUID. The code the phone runs is identified by the **dylib** UUID.

Consequences, recorded rather than argued away:

- **Run 2 binding = `1AEBEE45-BF4E-3D6E-9D3A-69CFA6E4218A`.** Any device crash report for run 2 must list `VoiceKernelHarness.debug.dylib` with this UUID in its binary images. A report listing a different dylib UUID is a different binary. The main-executable UUID proves nothing about which kernel ran.
- **Run 1's provenance claim is weaker than written.** "Mach-O UUID `81D0C25C-…` matches all three device crash reports" bound the crashes to the *stub*, which every local build of this project shares — CLI and GUI alike. It therefore did **not** discriminate the CLI artifact from a possible Xcode GUI build, which is exactly the question the record left as "binary replacement by Xcode NOT established". That verdict stands; the evidence cited for the match is now known to be non-discriminating. Corrected in place in the witness record (§1), not erased. The three run-1 `.ips` reports still carry the run-1 dylib UUID in their binary-image lists; reading it would (a) name the run-1 code identity for the record and (b) prove by inequality that run 2 runs new code. Owed as a read, not a rebuild.
- **Non-crash outcome has no in-journal binding.** The flight recorder does not journal the build identity, so a run-2 journal that shows the organism surviving Enter is bound to this artifact only by the `devicectl install` transcript and timestamps. Journalling a build identity is outside the accepted §3 scope; recorded as an observability gap for a later plan, not done now.

**Device state before install (founder-read):** `devicectl … processes | grep -iE "maia|voicekernel|App$"` → empty. No legacy `/maia` process, no resident harness process.

**Unrelated file noticed in the same terminal:** `docs/programme/witness/coverage-admission-attempts.jsonl` now exists in the Mac Studio checkout with one line (`runId 56e9375c`, `2026-09-11T20:53:11Z`, `condition FULL`, `lens development`, `outcome refused`). Written by another lane, after this compile; not on `claude/voice-2026-census-01`; not part of VOICE-2026. Noted so it is not mistaken for kernel evidence.
