# KERNEL-00 / VPIO-01 · MAC-COMPILE-02 — 2026-09-14 — GREEN on `85e5e7154`
**Act:** founder-authorized MAC-COMPILE-02 on exactly `85e5e7154` (`85e5e7154f0547c8a9b3e42145b624fed930e0ad`).  
**Execution:** Mac Studio · detached worktree `/private/tmp/vpio-mac-compile-02-85e5e7154` · fresh DerivedData `/private/tmp/vpio-mac-compile-02-85e5e7154-derived`.  
**Toolchain:** Xcode 26.3 (`17C529`) · iPhoneOS SDK 26.2 · Swift 6.2.4 · XcodeGen 2.46.0.  
**Authority boundary:** compile only. No install, launch, phone sample, N=30, or witness act authorized or performed.

## Verdict

```text
MAC-COMPILE-02       GREEN
subject              85e5e7154
swift build           PASS
swift test            PASS 27/27
source gate           PASS 45/45
xcodegen              PASS
unsigned iOS build    PASS
signed iOS build      PASS
artifact identity     RECORDED
```

The C-V1 correction is exercised by the iOS compiler: `AudioGraph.swift` compiles with `CoreAudio` imported and the previously unresolved `UnsafeMutableAudioBufferListPointer` is accepted. The only compiler warning is the pre-existing `try? session?.release(...)` unused-result warning in `VoiceKernel.swift`; it is unchanged and not repaired here.

## Artifact identity — signed product

```text
dylib_uuid=UUID: E8074AD1-D179-3267-A15C-142D033A9665 (arm64) /private/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib
dylib_sha256=6efe33b1b25fdb4dc4376abfb248e6c530e59f492ebc876314619fd1bef64b3d
executable_sha256=e43dec667e1e8ba727d7253f39199be3a34333c804c220b41233945d42a1a4ac
manifest_sha256=4710d9a68f5b6bb9de8ef64b143f8dd9b688476b3a7f3ee0257b3922b7a60bed
manifest_files=7
bundle_identifier=life.soullab.voicekernel.vpio01
display_name=VoiceKernel VPIO-01
codesign:
Identifier=life.soullab.voicekernel.vpio01
Authority=Apple Development: Kelly Nezat (N9DTF6434L)
Authority=Apple Worldwide Developer Relations Certification Authority
Authority=Apple Root CA
TeamIdentifier=ZVK2X646Z2
```

Manifest file committed beside this record: `KERNEL-00_VPIO-01_MAC-COMPILE-02_2026-09-14.manifest.sha256`.

## Six-step execution — outputs verbatim

### 1. `swift build`

Command:

```bash
cd ios/VoiceKernel && xcrun swift build
```

Output, verbatim:

````text
Building for debugging...
[0/2] Write sources
[1/2] Write swift-version--58304C5D6DBC2206.txt
[3/13] Compiling VoiceKernel KernelState.swift
[4/13] Compiling VoiceKernel HealthSupervisor.swift
[5/13] Compiling VoiceKernel VoiceKernel.swift
[6/13] Compiling VoiceKernel Replay.swift
[7/13] Compiling VoiceKernel Journal.swift
[8/13] Compiling VoiceKernel RecoveryPolicy.swift
[9/13] Compiling VoiceKernel RouteComparison.swift
[10/13] Compiling VoiceKernel StateProjection.swift
[11/13] Compiling VoiceKernel AudioSessionAuthority.swift
[12/13] Compiling VoiceKernel AudioGraph.swift
[13/13] Emitting module VoiceKernel
Build complete! (3.78s)
````

### 2. `swift test`

Command:

```bash
cd ios/VoiceKernel && xcrun swift test
```

Output, verbatim:

````text
[0/1] Planning build
Building for debugging...
[0/5] Write sources
[1/6] /private/tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/.build/arm64-apple-macosx/debug/VoiceKernelPackageTests.derived/runner.swift
[2/6] Write sources
[3/6] Write swift-version--58304C5D6DBC2206.txt
[5/8] Emitting module VoiceKernelTests
[6/8] Compiling VoiceKernelTests PureLogicTests.swift
[7/10] Compiling VoiceKernelPackageTests runner.swift
[8/10] Emitting module VoiceKernelPackageTests
[8/10] Write Objects.LinkFileList
[9/10] Linking VoiceKernelPackageTests
Build complete! (6.22s)
Test Suite 'All tests' started at 2026-09-14 13:45:33.141.
Test Suite 'VoiceKernelPackageTests.xctest' started at 2026-09-14 13:45:33.141.
Test Suite 'ConfigurationChangeSeamTests' started at 2026-09-14 13:45:33.142.
Test Case '-[VoiceKernelTests.ConfigurationChangeSeamTests testConfigurationChangeIsBoundedByTheSameRatifiedBudget]' started.
Test Case '-[VoiceKernelTests.ConfigurationChangeSeamTests testConfigurationChangeIsBoundedByTheSameRatifiedBudget]' passed (0.001 seconds).
Test Suite 'ConfigurationChangeSeamTests' passed at 2026-09-14 13:45:33.143.
	 Executed 1 test, with 0 failures (0 unexpected) in 0.001 (0.001) seconds
Test Suite 'HealthSupervisorTests' started at 2026-09-14 13:45:33.143.
Test Case '-[VoiceKernelTests.HealthSupervisorTests testDigitalZeroIsDeadWithinTheRatifiedWindow]' started.
Test Case '-[VoiceKernelTests.HealthSupervisorTests testDigitalZeroIsDeadWithinTheRatifiedWindow]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.HealthSupervisorTests testEntryBecomesHealthyOnFirstLiveInput]' started.
Test Case '-[VoiceKernelTests.HealthSupervisorTests testEntryBecomesHealthyOnFirstLiveInput]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.HealthSupervisorTests testEntryTimesOutAtRatifiedWindow]' started.
Test Case '-[VoiceKernelTests.HealthSupervisorTests testEntryTimesOutAtRatifiedWindow]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.HealthSupervisorTests testMissingCallbacksAreDeadToo]' started.
Test Case '-[VoiceKernelTests.HealthSupervisorTests testMissingCallbacksAreDeadToo]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.HealthSupervisorTests testQuietRoomIsHealthyNotDead]' started.
Test Case '-[VoiceKernelTests.HealthSupervisorTests testQuietRoomIsHealthyNotDead]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.HealthSupervisorTests testStaleGenerationObservationsAreRejected]' started.
Test Case '-[VoiceKernelTests.HealthSupervisorTests testStaleGenerationObservationsAreRejected]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.HealthSupervisorTests testStalledOutputWithinRatifiedWindow]' started.
Test Case '-[VoiceKernelTests.HealthSupervisorTests testStalledOutputWithinRatifiedWindow]' passed (0.000 seconds).
Test Suite 'HealthSupervisorTests' passed at 2026-09-14 13:45:33.144.
	 Executed 7 tests, with 0 failures (0 unexpected) in 0.001 (0.001) seconds
Test Suite 'InputFormatPreconditionTests' started at 2026-09-14 13:45:33.144.
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testInvalidFormatThrowsASwiftErrorCarryingTheObservedNumbers]' started.
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testInvalidFormatThrowsASwiftErrorCarryingTheObservedNumbers]' passed (0.001 seconds).
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testResolvedHardwareFormatIsValid]' started.
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testResolvedHardwareFormatIsValid]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testTheWitnessedZeroHertzFormatIsInvalid]' started.
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testTheWitnessedZeroHertzFormatIsInvalid]' passed (0.000 seconds).
Test Suite 'InputFormatPreconditionTests' passed at 2026-09-14 13:45:33.145.
	 Executed 3 tests, with 0 failures (0 unexpected) in 0.001 (0.001) seconds
Test Suite 'RecoveryPolicyTests' started at 2026-09-14 13:45:33.145.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetAndBackoffAreTheRatifiedSchedule]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetAndBackoffAreTheRatifiedSchedule]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetIsPerFaultClassAndSlidesOverSixtySeconds]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetIsPerFaultClassAndSlidesOverSixtySeconds]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testGenerationsAreMonotonicAcrossReasons]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testGenerationsAreMonotonicAcrossReasons]' passed (0.000 seconds).
Test Suite 'RecoveryPolicyTests' passed at 2026-09-14 13:45:33.146.
	 Executed 3 tests, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'ReplayTests' started at 2026-09-14 13:45:33.146.
Test Case '-[VoiceKernelTests.ReplayTests testAutomaticActWithoutCauseOrParentFails]' started.
Test Case '-[VoiceKernelTests.ReplayTests testAutomaticActWithoutCauseOrParentFails]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testCausalParentMustExistPrecedeAndNotComeFromALaterGeneration]' started.
Test Case '-[VoiceKernelTests.ReplayTests testCausalParentMustExistPrecedeAndNotComeFromALaterGeneration]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testConfigurationChangeDeferralMustBeAttributed]' started.
Test Case '-[VoiceKernelTests.ReplayTests testConfigurationChangeDeferralMustBeAttributed]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testJournalAssignsMonotonicSeqAndRoundTripsThroughJSONL]' started.
Test Case '-[VoiceKernelTests.ReplayTests testJournalAssignsMonotonicSeqAndRoundTripsThroughJSONL]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testLawfulCausalRunReplaysClean]' started.
Test Case '-[VoiceKernelTests.ReplayTests testLawfulCausalRunReplaysClean]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testOrphanTransitionFails]' started.
Test Case '-[VoiceKernelTests.ReplayTests testOrphanTransitionFails]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testPostExitRecoveryEdgeIsAnOrphan]' started.
Test Case '-[VoiceKernelTests.ReplayTests testPostExitRecoveryEdgeIsAnOrphan]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testUnlawfulEdgeFails]' started.
Test Case '-[VoiceKernelTests.ReplayTests testUnlawfulEdgeFails]' passed (0.000 seconds).
Test Suite 'ReplayTests' passed at 2026-09-14 13:45:33.147.
	 Executed 8 tests, with 0 failures (0 unexpected) in 0.001 (0.001) seconds
Test Suite 'RouteComparisonTests' started at 2026-09-14 13:45:33.147.
Test Case '-[VoiceKernelTests.RouteComparisonTests testAMissingBaselineIsNeverTheSameRoute]' started.
Test Case '-[VoiceKernelTests.RouteComparisonTests testAMissingBaselineIsNeverTheSameRoute]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RouteComparisonTests testDataSourceAlternationDoesNotChangeRouteIdentity]' started.
Test Case '-[VoiceKernelTests.RouteComparisonTests testDataSourceAlternationDoesNotChangeRouteIdentity]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RouteComparisonTests testDifferentPortsAreADifferentRoute]' started.
Test Case '-[VoiceKernelTests.RouteComparisonTests testDifferentPortsAreADifferentRoute]' passed (0.000 seconds).
Test Suite 'RouteComparisonTests' passed at 2026-09-14 13:45:33.147.
	 Executed 3 tests, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'SnapshotRulesTests' started at 2026-09-14 13:45:33.147.
Test Case '-[VoiceKernelTests.SnapshotRulesTests testListeningIsDisplayedOnlyWithHealthyInput]' started.
Test Case '-[VoiceKernelTests.SnapshotRulesTests testListeningIsDisplayedOnlyWithHealthyInput]' passed (0.000 seconds).
Test Suite 'SnapshotRulesTests' passed at 2026-09-14 13:45:33.147.
	 Executed 1 test, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'StartTraceTests' started at 2026-09-14 13:45:33.147.
Test Case '-[VoiceKernelTests.StartTraceTests testTheTraceNamesExactlyTheElevenVPIOSeamsInOrder]' started.
Test Case '-[VoiceKernelTests.StartTraceTests testTheTraceNamesExactlyTheElevenVPIOSeamsInOrder]' passed (0.000 seconds).
Test Suite 'StartTraceTests' passed at 2026-09-14 13:45:33.148.
	 Executed 1 test, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'VoiceKernelPackageTests.xctest' passed at 2026-09-14 13:45:33.148.
	 Executed 27 tests, with 0 failures (0 unexpected) in 0.005 (0.006) seconds
Test Suite 'All tests' passed at 2026-09-14 13:45:33.148.
	 Executed 27 tests, with 0 failures (0 unexpected) in 0.005 (0.007) seconds
◇ Test run started.
↳ Testing Library Version: 1501
↳ Target Platform: arm64e-apple-macos14.0
✔ Test run with 0 tests in 0 suites passed after 0.001 seconds.
````

### 3. VPIO source gate

Command:

```bash
./node_modules/.bin/jest --config jest.config.js __tests__/voice-kernel-00-source-gates.test.ts
```

Output, verbatim:

````text
jest-haste-map: Haste module naming collision: maia-desktop
  The following files share their name; please adjust your hasteImpl:
    * <rootDir>/desktop-app/package.json
    * <rootDir>/maia-desktop/package.json

PASS __tests__/voice-kernel-00-source-gates.test.ts
  KERNEL-00 · K00-01 / VOICE-01 — one hardware sovereign
    ✓ only AudioSessionAuthority.swift touches AVAudioSession (1 ms)
    ✓ AudioSessionAuthority is iOS-only by construction and journals every mutation (1 ms)
  KERNEL-00 · K00-16 — nothing else is in the build
    ✓ no forbidden symbol appears in kernel or harness source (1 ms)
    ✓ the package has no dependencies and the harness is not a member of ios/App; the VPIO subject carries its own bundle id (1 ms)
  KERNEL-00 · VOICE-10 — output has identity and a cancellable lifetime
    ✓ the substrate schedules only under an OutputStreamID and exposes cancel(id)
    ✓ the kernel journals every cancel and measures cancel → silence at the render seam (P5)
  KERNEL-00 · VOICE-06 / -15 / -16 — one recovery owner, bounded, journalled
    ✓ only HealthSupervisor verdicts reach requestRecovery, and the schedule is the ratified one (1 ms)
    ✓ stale callbacks are gated by generation and journalled, never acted on
  KERNEL-00 · PRE-WITNESS-01 — causal, longitudinal, replayable record
    ✓ every journal record carries seq and an optional causeSeq (P8)
    ✓ physiology is sampled longitudinally and the app lifecycle is journalled (P4, P7b)
  KERNEL-00 · PRE-WITNESS-02 — the entry seam is a precondition, not exception handling
    ✓ a `try …requireValid()` lexically precedes every callback/listener arming in start() (§3.1) (1 ms)
    ✓ no NSException / ExceptionCatcher / objc_try construct exists anywhere in the package (§3.1)
    ✓ a refused build and every format change journal the observed input format and generation age (§3.4)
  KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1) · PRE-WITNESS-03 — the configuration-change seam is exit-guarded, bounded, never a direct rebuild
    ✓ D: a configuration-change handler never directly invokes rebuildGraph, and the route_recovery cause is gone (33 ms)
    ✓ B: a configuration change reaches the graph only through the existing RecoveryPolicy as its own fault class (40 ms)
    ✓ A: a notification after exit is journalled and dropped before any generation or graph exists (12 ms)
    ✓ C: voice processing is a journalled, pre-Enter-only kernel command; the harness only projects it (ACTIVE — unchanged files)
  KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1) · PRE-WITNESS-04 — the expected VP change is classified one-shot, deferred, and decided by the supervisor
    ✓ C: classification is a pure, generation-scoped, one-shot function over ports (data source is evidence, not identity) (12 ms)
    ✓ B: the deferred branch consumes the expectation and touches neither the graph nor the recovery policy (14 ms)
    ✓ the expectation is armed only at a graph start and retired when the generation is healthy (11 ms)
    ✓ no new fault class, budget, timer or threshold: the caller set is closed and Replay names the deferral as an automatic act (54 ms)
    ✓ §2.3: the observation and the samples carry the provenance that proves why C fired (15 ms)
  KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1 / 4596b9bdb) · PRE-WITNESS-05 Phase A — instrumentation only: mutating startup order unchanged, added calls read-only, no new timer
    ✓ the MUTATING startup call order is unchanged from 35b0f61d0 (12 ms)
    ✓ ADDED calls are observation/read-only or journal instrumentation only; NO new timer · mutation · recovery act · configuration act (28 ms)
    ✓ the kernel observes isRunning on the EXISTING tick only (no new timer) and journals the first callback per generation (12 ms)
    ✓ the Phase-A subject 4596b9bdb (reproduced as R1) carries the 14-step trace WITH input_format_before_vp — the shape the ledger reads (16 ms)
  KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1) · PRE-WITNESS-05 P5-B0 — removal control: the pre-VP input-format read is gone and NOTHING else moved
    ✓ no input-format read of any kind precedes setVoiceProcessingEnabled inside start() (13 ms)
    ✓ exactly ONE input.outputFormat(forBus: 0) read remains in start(), after VP enable and before requireValid (the 35b0f61d0 position) (15 ms)
    ✓ the seam input_format_before_vp does not exist in any non-test kernel or harness source of the subject (178 ms)
    ✓ all other Phase-A reads are KEPT: VP read-back, isRunning immediate, elapsed-ms timing, after-VP format (12 ms)
  KERNEL-00 · VPIO-01 — the substrate is the one file's interior; the invariant substrate is byte-identical
    ✓ authority · supervisor · policy · state · projection · journal · replay · harness are byte-identical to 24a6fcfa1 (plan §1) (139 ms)
    ✓ the substitution is confined: ConfigurationChange.swift is gone, RouteComparison.swift is pure, and only AudioGraph.swift links Audio Toolbox (1 ms)
    ✓ the substrate drives the Voice-Processing I/O unit: VPIO subtype, both I/O elements enabled, VP = bypass property, format read from (Input scope, el 1) before arming, client formats on (Output,1)/(Input,0), pull input + render callback + property listener, initialize before start
    ✓ G9 (founder header adjudication 2026-09-14): the input buffer is sized by the unit's MaximumFramesPerSlice, read after the formats and before any callback is armed; a larger request is refused, never truncated; no fixed capacity anywhere (1 ms)
    ✓ the start trace names exactly the eleven VPIO seams, in order, and every step is emitted
    ✓ truthful vocabulary (census §3): ioRunning / io_running_observed / io_format_changed present; every engine-meaning record and field absent from the kernel (1 ms)
    ✓ io_format_changed is an observation, never an act: exit guard first, generation guard, no graph or policy call in the handler
    ✓ route recovery is sourced from the authority's route_changed observation, guarded for eligibility, same ports = evidence only, through the existing policy only (plan §11 item 4 / census §5)
    ✓ the pure-logic tests follow the subject: RouteComparisonTests present, the classifier tests gone, the eleven-seam trace pinned
  KERNEL-00 · DRIVER-01 — automate the witness, not the organism
    ✓ the engine subject 24a6fcfa1 (the app under test for stages A/B/C) is still byte-identical in history to the pinned tree hashes (241 ms)
    ✓ the driver is an external instrument: XCTest only, no VoiceKernel, no launch args/env on the app under test, no UserDefaults, no debugger hooks (1 ms)
    ✓ the ledger classifier is closed to the four classes plus two non-audio rows, and never steers a batch (5 ms)
  KERNEL-00 · VOICE-07 — the harness is a projection
    ✓ HarnessModel holds no voice state and reduces only kernel snapshots
    ✓ the harness reaches the journal only through the actor, never the recorder (C2)
    ✓ the view displays "listening" only via the snapshot rule, never from a local flag

Test Suites: 1 passed, 1 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        1.255 s
Ran all test suites matching /__tests__\/voice-kernel-00-source-gates.test.ts/i.
````

### 4. `xcodegen generate`

Command:

```bash
cd ios/VoiceKernelHarness && xcodegen generate
```

Output, verbatim:

````text
⚙️  Generating plists...
⚙️  Generating project...
⚙️  Writing project...
Created project at /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
````

### 5. unsigned iOS build

Command:

```bash
cd ios/VoiceKernelHarness && xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination 'generic/platform=iOS' -derivedDataPath /private/tmp/vpio-mac-compile-02-85e5e7154-derived CODE_SIGNING_ALLOWED=NO build
```

Output, verbatim:

````text
Command line invocation:
    /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination generic/platform=iOS -derivedDataPath /private/tmp/vpio-mac-compile-02-85e5e7154-derived CODE_SIGNING_ALLOWED=NO build

Build settings from command line:
    CODE_SIGNING_ALLOWED = NO

Resolve Package Graph


Resolved source packages:
  VoiceKernel: /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel

2026-09-14 13:46:31.625 xcodebuild[25775:29518926] [MT] IDERunDestination: Supported platforms for the buildables in the current scheme is empty.
ComputePackagePrebuildTargetDependencyGraph

Prepare packages

CreateBuildRequest

SendProjectDescription

CreateBuildOperation

ComputeTargetDependencyGraph
note: Building targets in dependency order
note: Target dependency graph (3 targets)
    Target 'VoiceKernelHarness' in project 'VoiceKernelHarness'
        ➜ Explicit dependency on target 'VoiceKernel' in project 'VoiceKernel'
    Target 'VoiceKernel' in project 'VoiceKernel'
        ➜ Explicit dependency on target 'VoiceKernel' in project 'VoiceKernel'
    Target 'VoiceKernel' in project 'VoiceKernel' (no dependencies)

GatherProvisioningInputs

CreateBuildDescription

ExecuteExternalTool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -v -E -dM -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -x c -c /dev/null

ExecuteExternalTool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc --version

ExecuteExternalTool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/ld -version_details

Build description signature: 063a5f9ff08677587d4c216853d533a5
Build description path: /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/XCBuildData/063a5f9ff08677587d4c216853d533a5.xcbuilddata
ClangStatCache /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk /tmp/vpio-mac-compile-02-85e5e7154-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -o /tmp/vpio-mac-compile-02-85e5e7154-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache

CreateBuildDirectory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products

CreateBuildDirectory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex

CreateBuildDirectory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/ExplicitPrecompiledModules
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/ExplicitPrecompiledModules

CreateBuildDirectory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules

CreateBuildDirectory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml

CreateBuildDirectory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos

CreateBuildDirectory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.hmap

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-target-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json

MkDir /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    /bin/mkdir -p /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyStaticMetadataFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyStaticMetadataFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyMetadataFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyMetadataFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.LinkFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.LinkFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftConstValuesFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftConstValuesFileList

Copy /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos/VoiceKernel.modulemap /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos

SwiftDriver VoiceKernel normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-SwiftDriver -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernel -Onone -enforce-exclusivity\=checked @/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList -DSWIFT_PACKAGE -DDEBUG -DSWIFT_MODULE_RESOURCE_BUNDLE_UNAVAILABLE -DXcode -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Session.modulevalidation -package-name voicekernel -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources -Xcc -DSWIFT_PACKAGE -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -working-directory /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj -experimental-emit-module-separately -disable-cmo

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_float-DKWDLP0TTBLKK9NMG1E7PBP6V.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_stdbool-34GZZKT62QW9ATNFPWOH3IGQJ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/SwiftShims-8GU1XYZJ4DNB0N8E56S95UMQA.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/ptrcheck-2JEFRBTE00M47FHCF38R2C30P.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_SwiftConcurrencyShims-7G43ATX2MR1RI4RZGUSSBOJAG.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_AvailabilityInternal-60IH25FVS7OX7GRITJB4QQHMU.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_stdarg-6BADK5PUISWQFXY3R44U4G90O.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/ptrauth-48EL4LX8Z1UGBGGYBK4DKSUF4.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_stddef-3UDR0Z9XS53BP5VFZQL676Z26.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_DarwinFoundation1-BVDJPD5EC3SG6XBRWQM9QXL89.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_DarwinFoundation2-9M5D8Y7166EXWECI4Z2C5H29F.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_limits-2WQ9DUHQ0K7IHWR26ZSHZ9BCU.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/sys_types-646WYTFB42056OKAWZ1HIJ335.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_stdint-5PYRHJU9MDJ21VG9CLX7DB3XP.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_tgmath-W5PQBN50RTMUUTAR9NXO63F9.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_intrinsics-G9R7Z02V9EW8OGPCPLTXSI8P.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_DarwinFoundation3-C253YV20DL5982EU2R45OEZU6.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_stdatomic-73I2AU6P4XAUY9QFN1DC65ART.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_inttypes-BULPH55JW5HG7U64B9BM6MFYH.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Darwin-CDZ2A5BFQIJV98GBBM7H6IZWY.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/simd-CCHXAON741349F6YU2ZGYE7T.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/ObjectiveC-8AD2V0XOK2QBQID8VZ52W2PYN.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/MachO-9XDVIU549YNUNI3JWY33UJCD8.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/os_object-D2US04L3VCVVY9M7LD4L606AK.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/os_workgroup-2SSIP9XSVCXHQS3V53NCYJEVP.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Dispatch-BBOTDZBBF2H57U5X4HYK6ZI5J.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/dnssd-A89LO8HU9X584TW86NFL2L0SS.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/XPC-405MR1TV1XCTKQ5BW7VPBO5N5.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreFoundation-9YLB1SXBDF2BEU9GC8FV4FDSY.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/os-4KTW3XYC2TX0LGYH27P9XF1AM.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Security-7421VH57L8GIF9XKE973MF269.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CFNetwork-C8GJBSK95K6XF7OKY7TD0X8GF.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreGraphics-E2DTZC3BM2KLRGF8G1V632PHI.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreAudioTypes-9GVD5ZOFF3J7Y0H37TZ3GR620.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreAudio-89QF843FZDT57OQ89AZAIJC4J.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Foundation-4JVRJ1G445VRT6YXRQ4T1WKCF.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/ImageIO-E5H801PZ2GM1ZQJR8ZUQ8B191.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/IOSurface-5R37MEUFKNSS6J8QKEPKYFVZK.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/UniformTypeIdentifiers-ASK07AKK4E4MYGJNGZA8HV5QQ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Network-97B47EX1PW5SJGKB4R3SAV2EP.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreMIDI-B4W69VZHQETCY93SJYN186GBP.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/OpenGLES-15E2VS5UNO74SACOCLH15FAZU.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Metal-O9B8USVR64UYJVZ9CAZ7Z802.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/AVRouting-C4OQ2M9VCFX5JHPGRMBBO0FLB.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/AudioToolbox-F2CTC9V1GVLPNMOMGZ4E5XD2C.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreVideo-F3YCYFIDPCVQE6BLPAYE6FG2I.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/QuartzCore-7ZLAII14B7SL9R1QWT63JL2QW.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreMedia-8VQCICHS6W3MBV6SW2OKRWYQB.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreImage-25A0JI1KQ80QJXTNCN2VJEE39.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/AVFAudio-BL2DYOXGT6GADSNMYNSHDS56E.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/MediaToolbox-669OEL4KRYSNUHMQGGZD5O3D6.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/AVFoundation-2I3LNS6UGETJ44KCFYZ3OW5YG.pcm

SwiftEmitModule normal arm64 Emitting\ module\ for\ VoiceKernel (in target 'VoiceKernel' from project 'VoiceKernel')

EmitSwiftModule normal arm64 (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ StateProjection.swift /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/StateProjection.swift (in target 'VoiceKernel' from project 'VoiceKernel')
SwiftCompile normal arm64 /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/StateProjection.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ RouteComparison.swift /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/RouteComparison.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/RouteComparison.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ Replay.swift /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/Replay.swift (in target 'VoiceKernel' from project 'VoiceKernel')
SwiftCompile normal arm64 /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/Replay.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ KernelState.swift /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/KernelState.swift (in target 'VoiceKernel' from project 'VoiceKernel')
SwiftCompile normal arm64 /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/KernelState.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ VoiceKernel.swift /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift (in target 'VoiceKernel' from project 'VoiceKernel')
SwiftCompile normal arm64 /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    
/tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift:139:9: warning: result of 'try?' is unused
        try? session?.release(cause: "leaveConversation", causeSeq: cmd)
        ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

SwiftCompile normal arm64 Compiling\ AudioSessionAuthority.swift /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/AudioSessionAuthority.swift (in target 'VoiceKernel' from project 'VoiceKernel')
SwiftCompile normal arm64 /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/AudioSessionAuthority.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ AudioGraph.swift /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ Journal.swift /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/Journal.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/Journal.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ HealthSupervisor.swift /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/HealthSupervisor.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/HealthSupervisor.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ RecoveryPolicy.swift /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/RecoveryPolicy.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel/Sources/VoiceKernel/RecoveryPolicy.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftDriverJobDiscovery normal arm64 Emitting module for VoiceKernel (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriver\ Compilation\ Requirements VoiceKernel normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-Swift-Compilation-Requirements -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernel -Onone -enforce-exclusivity\=checked @/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList -DSWIFT_PACKAGE -DDEBUG -DSWIFT_MODULE_RESOURCE_BUNDLE_UNAVAILABLE -DXcode -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Session.modulevalidation -package-name voicekernel -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources -Xcc -DSWIFT_PACKAGE -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -working-directory /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj -experimental-emit-module-separately -disable-cmo

SwiftMergeGeneratedHeaders /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos/VoiceKernel-Swift.h /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    builtin-swiftHeaderTool -arch arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos/VoiceKernel-Swift.h

Copy /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftmodule /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftmodule

Copy /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftdoc /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftdoc (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftdoc /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftdoc

Copy /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.abi.json /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.abi.json (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.abi.json /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.abi.json

Copy /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftsourceinfo (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftsourceinfo /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo

SwiftDriver VoiceKernelHarness normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-SwiftDriver -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernelHarness -Onone -enforce-exclusivity\=checked @/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList -DDEBUG -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -F /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json -Xcc -iquote -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap -Xcc -ivfsoverlay -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml -Xcc -iquote -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h -working-directory /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness -experimental-emit-module-separately -disable-cmo

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_stddef-3H8BDPWTYQ84ZH7MDF92TIMK7.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/SwiftShims-8Y96B3NM0JF645JI7PBBUH02B.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_stdarg-5SOQFUSL98FUN1JX1NBREWUB0.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/DeveloperToolsSupport-1R5PWJAOIMQRDJBYMHUZ4QEQ1.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/ptrauth-6IJW0A7Z8LJZPABX4PYQEIREG.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_SwiftConcurrencyShims-7I0FN5OGB29R8DMOFZE4S3LHW.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_float-A51UVMOFDS74SMHHVHZHBYL3B.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_stdbool-A88Z9S3FVPSLMQ411KW6XYWNM.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_AvailabilityInternal-1U3YVKR81W2R50EUOKZ01XXNG.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/ptrcheck-TMNPIXKW8S892NVADQY0E28J.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_DarwinFoundation1-2ESH19BC1NBRHVYBT8VLAKP2.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_limits-EQ5AZMDAL4XFF81NHWX7R199X.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_DarwinFoundation2-1CE0HPKCNWPK03NYDMSDS6VQE.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/sys_types-6C82JPU4K3LQ1IQ2EGQO5TGJ3.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_tgmath-A8GMX74OY5MRF14TPMUSD96EL.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_stdint-8Z1AA6BHH9GEJ9LB9T0AZA06B.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_DarwinFoundation3-3LM94RKOAG2Q9RY06EL3GAOY.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_intrinsics-4WWRGBNI223P4ONPVBZOG538O.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_stdatomic-E66XH3OSMIZQLSKIB1A58Q9R6.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/_Builtin_inttypes-4G5FQPI31SLOPIAJ36KA0RP1O.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Darwin-1YM5EV3ZBZRQVEDURC0G8AQJ5.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/simd-4S4P9NNYJDY9APOU5879KGU7I.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/MachO-87PD8VZ8NONRLK38ZV0C1J1H9.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/ObjectiveC-AZY9YSKEOM8KBD9GNBQAU2ZGD.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/os_object-8TVJAS0T9N1407HTVVH4X3OAK.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Spatial-F14G6DVX0DW9RXSRGSN5RCXS.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/os_workgroup-18DSSLC606S1Z29J1OTRM86CR.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Dispatch-EFOG318OF33LSQ3IF383ROFFZ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/dnssd-84NY92L15ZA395R8FGXBEI5E5.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreFoundation-DGH08R1YN45QC3W2XVD1WA8QH.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/XPC-86QXISOGMO80244HS1BQ6O8O6.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/os-9ORGN5PF9RLXJIO1H38DYZRF9.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CFNetwork-6BD5SWHP699LLLNTYJRBWMW52.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Security-B7QJ00LVEHRWAX7FQ265Y9VOH.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreAudioTypes-A93CBMOPVDV0ZF6X4S1EHMTP6.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreGraphics-E1EU4RE77QLNWBO0CDJDOW5XQ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreAudio-B031MHV3JC5UCZNO6OLREF2HY.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Foundation-BRUSGEWKEIS2Z5K0JQMEPIAF6.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/ImageIO-9P9LA4KXIAI9T11UM55FF2GP9.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreText-EBFKZNOHEMYX181L6DRRKHAS.pcm

SwiftDriverJobDiscovery normal arm64 Compiling RouteComparison.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling StateProjection.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling Replay.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling RecoveryPolicy.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling HealthSupervisor.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling Journal.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling KernelState.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling AudioGraph.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling VoiceKernel.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Accessibility-5NPLG95XD0X9IZ01ZZPL51A1R.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Network-DXAHXT64M31N5XCAJDU55X8LK.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/DataDetection-DPCFCEXBEZE0RJYGCMTPNA2BB.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreTransferable-LKNFLZ51GM960Z7H8RSM42ZV.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreMIDI-B2V5CJL10VVT5XE9OZ3TAMQMS.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/IOSurface-8HGKGMV2B8IBLJNSL34DQR0JA.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/UniformTypeIdentifiers-3ZIP8OCXELVENPT64FOGU7SQ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/UIUtilities-1YPKKOLK2L272NWRO7WVAAILX.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/UserNotifications-E3C5PWF04IYINBFAZXUFSJO3H.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/FileProvider-DVUDTAT82CKYTW5U7Z6HZB7IJ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/OSLog-15OS8BFHNNUPWFX4DHQNVF1CC.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreData-99ERB87FJKATPT8FIXK0CYY4I.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Symbols-98OME4L6GRTZDF58OQGYUPXWD.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/OpenGLES-3TCMRIJ8PSWC7G1RYGM73ZEOA.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Metal-DW1N1A29XW1SB6FRE47J9G815.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/AVRouting-DZMKPLOZBLD37RSHO42IMSCG4.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/AudioToolbox-2W3XAYA7JF0KVUXV0PYDN6T20.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreVideo-1Y70LM6YKOPHK88A4C30RMCAG.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/QuartzCore-BZFQQKH8VPCRHA2FJ62NKKL6B.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreImage-F059XQ9FQ0CW7818RWYNDE43Y.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/CoreMedia-EK5LUALK1IKGKH44X8W5EDLF8.pcm

SwiftDriverJobDiscovery normal arm64 Compiling AudioSessionAuthority.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriver\ Compilation VoiceKernel normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-Swift-Compilation -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernel -Onone -enforce-exclusivity\=checked @/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList -DSWIFT_PACKAGE -DDEBUG -DSWIFT_MODULE_RESOURCE_BUNDLE_UNAVAILABLE -DXcode -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Session.modulevalidation -package-name voicekernel -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources -Xcc -DSWIFT_PACKAGE -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -working-directory /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj -experimental-emit-module-separately -disable-cmo

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/SwiftUICore-7CZBEABSFC0C8BFTTSJYVXTJH.pcm

Ld /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.o normal (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -r -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -L/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -L/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -iframework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -iframework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -filelist /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.LinkFileList -nostdlib -Xlinker -object_path_lto -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_lto.o -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_dependency_info.dat -fobjc-link-runtime -L/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/iphoneos -L/usr/lib/swift -Xlinker -add_ast_path -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule @/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-linker-args.resp -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.o

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/AVFAudio-34BZM6KTQS10HP34B4UADC6OU.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/MediaToolbox-EA0NT2Y137GLUSD0YMG6UE7KS.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/UIKit-6KOWTZF7KBPA0AFZJUQJA1O1I.pcm

ExtractAppIntentsMetadata (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsmetadataprocessor --toolchain-dir /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --module-name VoiceKernel --sdk-root /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk --xcode-version 17C529 --platform-family iOS --deployment-target 16.0 --bundle-identifier voicekernel.VoiceKernel --output /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.appintents --target-triple arm64-apple-ios16.0 --binary-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.o --dependency-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_dependency_info.dat --stringsdata-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/ExtractedAppShortcutsMetadata.stringsdata --source-file-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList --metadata-file-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyMetadataFileList --static-metadata-file-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyStaticMetadataFileList --swift-const-vals-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftConstValuesFileList --force --compile-time-extraction --deployment-aware-processing --validate-assistant-intents --no-app-shortcuts-localization
2026-09-14 13:46:35.618 appintentsmetadataprocessor[25925:29519592] Starting appintentsmetadataprocessor export
2026-09-14 13:46:35.690 appintentsmetadataprocessor[25925:29519592] Extracted no relevant App Intents symbols, skipping writing output

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/AVFoundation-4L3IAA5FTPBCACQ0ATYCY4UM6.pcm

RegisterExecutionPolicyException /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.o (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel
    builtin-RegisterExecutionPolicyException /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernel.o

Ld /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -install_name @rpath/VoiceKernelHarness.debug.dylib -dead_strip -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib

ProcessInfoPlistFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/Harness/Info.plist (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-infoPlistUtility /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/Harness/Info.plist -producttype com.apple.product-type.application -genpkginfo /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/PkgInfo -expandbuildsettings -format binary -platform iphoneos -requiredArchitecture arm64 -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/SwiftUI-9MBV03JYAN6UNL82HEUGJ9JP9.pcm

SwiftEmitModule normal arm64 Emitting\ module\ for\ VoiceKernelHarness (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

EmitSwiftModule normal arm64 (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    

SwiftCompile normal arm64 Compiling\ VoiceKernelHarnessApp.swift /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/Harness/VoiceKernelHarnessApp.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
SwiftCompile normal arm64 /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/Harness/VoiceKernelHarnessApp.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    

SwiftCompile normal arm64 Compiling\ HarnessModel.swift /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/Harness/HarnessModel.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
SwiftCompile normal arm64 /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/Harness/HarnessModel.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    

SwiftCompile normal arm64 Compiling\ HarnessView.swift /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/Harness/HarnessView.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
SwiftCompile normal arm64 /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/Harness/HarnessView.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    

SwiftDriverJobDiscovery normal arm64 Emitting module for VoiceKernelHarness (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftDriver\ Compilation\ Requirements VoiceKernelHarness normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-Swift-Compilation-Requirements -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernelHarness -Onone -enforce-exclusivity\=checked @/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList -DDEBUG -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -F /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json -Xcc -iquote -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap -Xcc -ivfsoverlay -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml -Xcc -iquote -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h -working-directory /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness -experimental-emit-module-separately -disable-cmo

SwiftMergeGeneratedHeaders /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/VoiceKernelHarness-Swift.h /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-swiftHeaderTool -arch arm64 /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/VoiceKernelHarness-Swift.h

Copy /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.abi.json /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.abi.json (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.abi.json /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.abi.json

Copy /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.swiftmodule /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.swiftmodule

Copy /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.swiftdoc /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftdoc (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftdoc /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.swiftdoc

Copy /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftsourceinfo (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftsourceinfo /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo

SwiftDriverJobDiscovery normal arm64 Compiling VoiceKernelHarnessApp.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftDriverJobDiscovery normal arm64 Compiling HarnessModel.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftDriverJobDiscovery normal arm64 Compiling HarnessView.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftDriver\ Compilation VoiceKernelHarness normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-Swift-Compilation -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernelHarness -Onone -enforce-exclusivity\=checked @/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList -DDEBUG -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -F /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-mac-compile-02-85e5e7154-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json -Xcc -iquote -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap -Xcc -ivfsoverlay -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml -Xcc -iquote -Xcc /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h -working-directory /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness -experimental-emit-module-separately -disable-cmo

Ld /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -L/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -filelist /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList -install_name @rpath/VoiceKernelHarness.debug.dylib -Xlinker -rpath -Xlinker /usr/lib/swift -Xlinker -rpath -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks -Xlinker -rpath -Xlinker @executable_path/Frameworks -dead_strip -Xlinker -object_path_lto -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_lto.o -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat -fobjc-link-runtime -L/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/iphoneos -L/usr/lib/swift -Xlinker -add_ast_path -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule @/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-linker-args.resp -Wl,-no_warn_duplicate_libraries -framework AudioToolbox -Xlinker -alias -Xlinker _main -Xlinker ___debug_main_executable_dylib_entry_point -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib -Xlinker -add_ast_path -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule @/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-linker-args.resp

ConstructStubExecutorLinkFileList /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    construct-stub-executor-link-file-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor_no_swift_entry_point.a /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor.a --output /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt
note: Using stub executor library with Swift entry point. (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

Ld /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -Xlinker -rpath -Xlinker @executable_path -Xlinker -rpath -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks -Xlinker -rpath -Xlinker @executable_path/Frameworks -rdynamic -Xlinker -no_deduplicate -e ___debug_blank_executor_main -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_dylib -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_instlnm -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt -Xlinker -filelist -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness

CopySwiftLibs /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-swiftStdLibTool --copy --verbose --scan-executable /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib --scan-folder /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Frameworks --scan-folder /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/PlugIns --scan-folder /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/SystemExtensions --scan-folder /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Extensions --platform iphoneos --toolchain /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --destination /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Frameworks --strip-bitcode --strip-bitcode-tool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/bitcode_strip --emit-dependency-info /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/SwiftStdLibToolInputDependencies.dep --filter-for-swift-os --back-deploy-swift-span
Ignoring --strip-bitcode because --sign was not passed

ExtractAppIntentsMetadata (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsmetadataprocessor --toolchain-dir /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --module-name VoiceKernelHarness --sdk-root /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk --xcode-version 17C529 --platform-family iOS --deployment-target 16.0 --bundle-identifier life.soullab.voicekernel.vpio01 --output /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app --target-triple arm64-apple-ios16.0 --binary-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness --dependency-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat --stringsdata-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/ExtractedAppShortcutsMetadata.stringsdata --source-file-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList --metadata-file-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList --static-metadata-file-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList --swift-const-vals-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList --compile-time-extraction --deployment-aware-processing --validate-assistant-intents --no-app-shortcuts-localization
2026-09-14 13:46:37.224 appintentsmetadataprocessor[25939:29519677] Starting appintentsmetadataprocessor export
2026-09-14 13:46:37.225 appintentsmetadataprocessor[25939:29519677] warning: Metadata extraction skipped. No AppIntents.framework dependency found.

AppIntentsSSUTraining (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsnltrainingprocessor --infoplist-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist --temp-dir-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/ssu --bundle-id life.soullab.voicekernel.vpio01 --product-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app --extracted-metadata-path /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Metadata.appintents --metadata-file-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList --archive-ssu-assets
2026-09-14 13:46:37.238 appintentsnltrainingprocessor[25940:29519678] Parsing options for appintentsnltrainingprocessor
2026-09-14 13:46:37.238 appintentsnltrainingprocessor[25940:29519678] No AppShortcuts found - Skipping.

RegisterExecutionPolicyException /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-RegisterExecutionPolicyException /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app

Validate /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-validationUtility /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app -shallow-bundle -infoplist-subpath Info.plist

Touch /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    /usr/bin/touch -c /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app

** BUILD SUCCEEDED **

````

### 6. signed physical-device build

Command:

```bash
cd ios/VoiceKernelHarness && xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination '<resolved physical iOS destination>' -derivedDataPath /private/tmp/vpio-mac-compile-02-85e5e7154-derived DEVELOPMENT_TEAM='<resolved local signing team>' CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates build
```

Output, verbatim:

````text
Command line invocation:
    /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination id=00008140-00163D9922E0801C -derivedDataPath /private/tmp/vpio-mac-compile-02-85e5e7154-derived DEVELOPMENT_TEAM=ZVK2X646Z2 CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates build

Build settings from command line:
    CODE_SIGN_STYLE = Automatic
    DEVELOPMENT_TEAM = ZVK2X646Z2

Resolve Package Graph


Resolved source packages:
  VoiceKernel: /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernel

2026-09-14 13:49:59.895 xcodebuild[26346:29524913] [MT] IDERunDestination: Supported platforms for the buildables in the current scheme is empty.
ComputePackagePrebuildTargetDependencyGraph

Prepare packages

CreateBuildRequest

SendProjectDescription

CreateBuildOperation

ComputeTargetDependencyGraph
note: Building targets in dependency order
note: Target dependency graph (3 targets)
    Target 'VoiceKernelHarness' in project 'VoiceKernelHarness'
        ➜ Explicit dependency on target 'VoiceKernel' in project 'VoiceKernel'
    Target 'VoiceKernel' in project 'VoiceKernel'
        ➜ Explicit dependency on target 'VoiceKernel' in project 'VoiceKernel'
    Target 'VoiceKernel' in project 'VoiceKernel' (no dependencies)

GatherProvisioningInputs

CreateBuildDescription

ExecuteExternalTool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -v -E -dM -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -x c -c /dev/null

ExecuteExternalTool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc --version

ExecuteExternalTool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/ld -version_details

Build description signature: 58daf672f6079498543e7461dd7673a1
Build description path: /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/XCBuildData/58daf672f6079498543e7461dd7673a1.xcbuilddata
ClangStatCache /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk /tmp/vpio-mac-compile-02-85e5e7154-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -o /tmp/vpio-mac-compile-02-85e5e7154-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache

WriteAuxiliaryFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/Entitlements.plist (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/Entitlements.plist

ProcessProductPackaging /Users/soullab/Library/Developer/Xcode/UserData/Provisioning\ Profiles/08a653d1-5ec3-4206-84fd-991a5fcc11c2.mobileprovision /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/embedded.mobileprovision (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-productPackagingUtility /Users/soullab/Library/Developer/Xcode/UserData/Provisioning\ Profiles/08a653d1-5ec3-4206-84fd-991a5fcc11c2.mobileprovision -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/embedded.mobileprovision

ProcessProductPackaging "" /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    
    Entitlements:
    
    {
    "application-identifier" = "ZVK2X646Z2.life.soullab.voicekernel.vpio01";
    "com.apple.developer.team-identifier" = ZVK2X646Z2;
    "get-task-allow" = 1;
}
    
    builtin-productPackagingUtility -entitlements -format xml -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent

ProcessProductPackagingDER /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent.der (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    /usr/bin/derq query -f xml -i /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent.der --raw

Ld /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -install_name @rpath/VoiceKernelHarness.debug.dylib -dead_strip -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat -Xlinker -no_adhoc_codesign -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib

ProcessInfoPlistFile /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/Harness/Info.plist (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-infoPlistUtility /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness/Harness/Info.plist -producttype com.apple.product-type.application -genpkginfo /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/PkgInfo -expandbuildsettings -format binary -platform iphoneos -requiredArchitecture arm64 -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist

Ld /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -L/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -filelist /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList -install_name @rpath/VoiceKernelHarness.debug.dylib -Xlinker -rpath -Xlinker /usr/lib/swift -Xlinker -rpath -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks -Xlinker -rpath -Xlinker @executable_path/Frameworks -dead_strip -Xlinker -object_path_lto -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_lto.o -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat -fobjc-link-runtime -L/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/iphoneos -L/usr/lib/swift -Xlinker -add_ast_path -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule @/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-linker-args.resp -Wl,-no_warn_duplicate_libraries -framework AudioToolbox -Xlinker -alias -Xlinker _main -Xlinker ___debug_main_executable_dylib_entry_point -Xlinker -no_adhoc_codesign -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib -Xlinker -add_ast_path -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule @/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-linker-args.resp

ConstructStubExecutorLinkFileList /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    construct-stub-executor-link-file-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor_no_swift_entry_point.a /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor.a --output /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt
note: Using stub executor library with Swift entry point. (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

Ld /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F/tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos -Xlinker -rpath -Xlinker @executable_path -Xlinker -rpath -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/PackageFrameworks -Xlinker -rpath -Xlinker @executable_path/Frameworks -rdynamic -Xlinker -no_deduplicate -e ___debug_blank_executor_main -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_dylib -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_instlnm -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt -Xlinker -filelist -Xlinker /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib -Xlinker -no_adhoc_codesign -o /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness

CopySwiftLibs /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-swiftStdLibTool --copy --verbose --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --scan-executable /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib --scan-folder /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Frameworks --scan-folder /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/PlugIns --scan-folder /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/SystemExtensions --scan-folder /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Extensions --platform iphoneos --toolchain /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --destination /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Frameworks --strip-bitcode --strip-bitcode-tool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/bitcode_strip --emit-dependency-info /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/SwiftStdLibToolInputDependencies.dep --filter-for-swift-os

ExtractAppIntentsMetadata (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsmetadataprocessor --toolchain-dir /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --module-name VoiceKernelHarness --sdk-root /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk --xcode-version 17C529 --platform-family iOS --deployment-target 16.0 --bundle-identifier life.soullab.voicekernel.vpio01 --output /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app --target-triple arm64-apple-ios16.0 --binary-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness --dependency-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat --stringsdata-file /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/ExtractedAppShortcutsMetadata.stringsdata --source-file-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList --metadata-file-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList --static-metadata-file-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList --swift-const-vals-list /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList --compile-time-extraction --deployment-aware-processing --validate-assistant-intents --no-app-shortcuts-localization
2026-09-14 13:50:01.025 appintentsmetadataprocessor[26364:29525113] Starting appintentsmetadataprocessor export
2026-09-14 13:50:01.026 appintentsmetadataprocessor[26364:29525113] warning: Metadata extraction skipped. No AppIntents.framework dependency found.

CodeSign /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    
    Signing Identity:     "Apple Development: Kelly Nezat (N9DTF6434L)"
    Provisioning Profile: "iOS Team Provisioning Profile: *"
                          (08a653d1-5ec3-4206-84fd-991a5fcc11c2)
    
    /usr/bin/codesign --force --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --timestamp\=none --generate-entitlement-der /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib

CodeSign /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    
    Signing Identity:     "Apple Development: Kelly Nezat (N9DTF6434L)"
    Provisioning Profile: "iOS Team Provisioning Profile: *"
                          (08a653d1-5ec3-4206-84fd-991a5fcc11c2)
    
    /usr/bin/codesign --force --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --timestamp\=none --generate-entitlement-der /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib

CodeSign /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    
    Signing Identity:     "Apple Development: Kelly Nezat (N9DTF6434L)"
    Provisioning Profile: "iOS Team Provisioning Profile: *"
                          (08a653d1-5ec3-4206-84fd-991a5fcc11c2)
    
    /usr/bin/codesign --force --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --entitlements /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent --timestamp\=none --generate-entitlement-der /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app

Validate /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-02-85e5e7154/ios/VoiceKernelHarness
    builtin-validationUtility /tmp/vpio-mac-compile-02-85e5e7154-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app -shallow-bundle -infoplist-subpath Info.plist

** BUILD SUCCEEDED **

````

## Signed-build orchestration notes

Before the successful signed `xcodebuild` invocation, two local command-construction attempts failed **before any signed build began**: (1) a BSD `awk` incompatibility in the destination parser produced syntax errors; (2) a subsequent shell-resolution attempt exited 1 before emitting output. Neither invoked the signed build and neither touched source. The successful invocation resolved the physical iOS destination and signing team from local Xcode state and then ran the build shown above. These are operator/instruction defects, not kernel evidence.

The source gate used the already-installed repository dependencies via a disposable-worktree `node_modules` symlink to `/Users/soullab/MAIA-SOVEREIGN/node_modules`; no dependency install and no repository source mutation was performed.

## XcodeGen footprint

As in prior MAC-COMPILE records, `xcodegen generate` rewrote the tracked `ios/VoiceKernelHarness/Harness/Info.plist` in the disposable worktree from `project.yml`. The compile subject remained `85e5e7154`; no generated footprint was committed or treated as subject source.

```text
post-compile worktree status:
 M ios/VoiceKernelHarness/Harness/Info.plist
```

## Standing

```text
VPIO-01 source          85e5e7154 · COMPILE GREEN
MAC-COMPILE-02          GREEN · CLOSED on this SHA
signed artifact          BUILT · identity recorded
install · device act     NOT AUTHORIZED · NOT RUN
N=30                     NOT AUTHORIZED · UNSPENT
F-W1                     UNSPENT
KERNEL-01                CLOSED
BENCH-01                 CLOSED
BRIDGE-01                CLOSED
MIGRATE-01               CLOSED
JOP-04                   UNTOUCHED
```

A green compile establishes native build viability and artifact custody only. It does not authorize install or physiological witness.
