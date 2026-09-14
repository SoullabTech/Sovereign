# KERNEL-00 / VPIO-01 · MAC-COMPILE-01 — 2026-09-14 — RED on `5ca7851a8`

**Act:** founder-authorized MAC-COMPILE on exactly `5ca7851a8` (`5ca7851a82a0f0087894adac727e0cd0a24cf45e`).
**Execution:** Mac Studio · detached worktree `/private/tmp/vpio-mac-compile-5ca7851a8` · fresh DerivedData `/private/tmp/vpio-mac-compile-5ca7851a8-derived`.
**Toolchain:** Xcode 26.3 (`17C529`) · iPhoneOS SDK 26.2 · Swift 6.2.4 · XcodeGen 2.46.0.
**Authority boundary:** compile only. No install, launch, phone sample, N=30, or witness act authorized.

## Verdict

```text
MAC-COMPILE-01       RED
subject              5ca7851a8
swift build           PASS
swift test            PASS 27/27
source gate           PASS 45/45
xcodegen              PASS
unsigned iOS build    FAIL — compiler error in AudioGraph.swift:361
signed device build   NOT RUN — sequence stopped after unsigned failure
artifact identity     NONE — no executable or debug dylib produced
```

The bounded compile-era defect is:

```text
AudioGraph.swift:361:23
error: cannot find 'UnsafeMutableAudioBufferListPointer' in scope
```

The installed iPhoneOS 26.2 SDK does contain `UnsafeMutableAudioBufferListPointer`, but its Swift declaration is in the `CoreAudio` module (`CoreAudio.swiftinterface`). The subject source imports `Foundation` and `AudioToolbox` only. This record does **not** repair that module-visibility/import defect and does not reach for another API.

Because step 5 failed before a valid app binary was linked, step 6 was not run and there is no UUID / dylib SHA / app manifest to bind. The partial `.app` directory contains no executable and no debug dylib.

## Six-step execution, outputs verbatim

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
[3/13] Emitting module VoiceKernel
[4/13] Compiling VoiceKernel StateProjection.swift
[5/13] Compiling VoiceKernel KernelState.swift
[6/13] Compiling VoiceKernel RouteComparison.swift
[7/13] Compiling VoiceKernel AudioSessionAuthority.swift
[8/13] Compiling VoiceKernel Replay.swift
[9/13] Compiling VoiceKernel VoiceKernel.swift
[10/13] Compiling VoiceKernel Journal.swift
[11/13] Compiling VoiceKernel AudioGraph.swift
[12/13] Compiling VoiceKernel RecoveryPolicy.swift
[13/13] Compiling VoiceKernel HealthSupervisor.swift
Build complete! (3.68s)
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
[1/6] /private/tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/.build/arm64-apple-macosx/debug/VoiceKernelPackageTests.derived/runner.swift
[2/6] Write sources
[3/6] Write swift-version--58304C5D6DBC2206.txt
[5/8] Emitting module VoiceKernelTests
[6/8] Compiling VoiceKernelTests PureLogicTests.swift
[7/10] Compiling VoiceKernelPackageTests runner.swift
[8/10] Emitting module VoiceKernelPackageTests
[8/10] Write Objects.LinkFileList
[9/10] Linking VoiceKernelPackageTests
Build complete! (6.21s)
Test Suite 'All tests' started at 2026-09-14 13:14:49.555.
Test Suite 'VoiceKernelPackageTests.xctest' started at 2026-09-14 13:14:49.556.
Test Suite 'ConfigurationChangeSeamTests' started at 2026-09-14 13:14:49.556.
Test Case '-[VoiceKernelTests.ConfigurationChangeSeamTests testConfigurationChangeIsBoundedByTheSameRatifiedBudget]' started.
Test Case '-[VoiceKernelTests.ConfigurationChangeSeamTests testConfigurationChangeIsBoundedByTheSameRatifiedBudget]' passed (0.001 seconds).
Test Suite 'ConfigurationChangeSeamTests' passed at 2026-09-14 13:14:49.557.
	 Executed 1 test, with 0 failures (0 unexpected) in 0.001 (0.001) seconds
Test Suite 'HealthSupervisorTests' started at 2026-09-14 13:14:49.557.
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
Test Suite 'HealthSupervisorTests' passed at 2026-09-14 13:14:49.558.
	 Executed 7 tests, with 0 failures (0 unexpected) in 0.001 (0.001) seconds
Test Suite 'InputFormatPreconditionTests' started at 2026-09-14 13:14:49.558.
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testInvalidFormatThrowsASwiftErrorCarryingTheObservedNumbers]' started.
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testInvalidFormatThrowsASwiftErrorCarryingTheObservedNumbers]' passed (0.001 seconds).
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testResolvedHardwareFormatIsValid]' started.
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testResolvedHardwareFormatIsValid]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testTheWitnessedZeroHertzFormatIsInvalid]' started.
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testTheWitnessedZeroHertzFormatIsInvalid]' passed (0.000 seconds).
Test Suite 'InputFormatPreconditionTests' passed at 2026-09-14 13:14:49.559.
	 Executed 3 tests, with 0 failures (0 unexpected) in 0.001 (0.001) seconds
Test Suite 'RecoveryPolicyTests' started at 2026-09-14 13:14:49.559.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetAndBackoffAreTheRatifiedSchedule]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetAndBackoffAreTheRatifiedSchedule]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetIsPerFaultClassAndSlidesOverSixtySeconds]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetIsPerFaultClassAndSlidesOverSixtySeconds]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testGenerationsAreMonotonicAcrossReasons]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testGenerationsAreMonotonicAcrossReasons]' passed (0.000 seconds).
Test Suite 'RecoveryPolicyTests' passed at 2026-09-14 13:14:49.559.
	 Executed 3 tests, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'ReplayTests' started at 2026-09-14 13:14:49.559.
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
Test Suite 'ReplayTests' passed at 2026-09-14 13:14:49.561.
	 Executed 8 tests, with 0 failures (0 unexpected) in 0.001 (0.001) seconds
Test Suite 'RouteComparisonTests' started at 2026-09-14 13:14:49.561.
Test Case '-[VoiceKernelTests.RouteComparisonTests testAMissingBaselineIsNeverTheSameRoute]' started.
Test Case '-[VoiceKernelTests.RouteComparisonTests testAMissingBaselineIsNeverTheSameRoute]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RouteComparisonTests testDataSourceAlternationDoesNotChangeRouteIdentity]' started.
Test Case '-[VoiceKernelTests.RouteComparisonTests testDataSourceAlternationDoesNotChangeRouteIdentity]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RouteComparisonTests testDifferentPortsAreADifferentRoute]' started.
Test Case '-[VoiceKernelTests.RouteComparisonTests testDifferentPortsAreADifferentRoute]' passed (0.000 seconds).
Test Suite 'RouteComparisonTests' passed at 2026-09-14 13:14:49.561.
	 Executed 3 tests, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'SnapshotRulesTests' started at 2026-09-14 13:14:49.561.
Test Case '-[VoiceKernelTests.SnapshotRulesTests testListeningIsDisplayedOnlyWithHealthyInput]' started.
Test Case '-[VoiceKernelTests.SnapshotRulesTests testListeningIsDisplayedOnlyWithHealthyInput]' passed (0.000 seconds).
Test Suite 'SnapshotRulesTests' passed at 2026-09-14 13:14:49.561.
	 Executed 1 test, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'StartTraceTests' started at 2026-09-14 13:14:49.561.
Test Case '-[VoiceKernelTests.StartTraceTests testTheTraceNamesExactlyTheElevenVPIOSeamsInOrder]' started.
Test Case '-[VoiceKernelTests.StartTraceTests testTheTraceNamesExactlyTheElevenVPIOSeamsInOrder]' passed (0.000 seconds).
Test Suite 'StartTraceTests' passed at 2026-09-14 13:14:49.562.
	 Executed 1 test, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'VoiceKernelPackageTests.xctest' passed at 2026-09-14 13:14:49.562.
	 Executed 27 tests, with 0 failures (0 unexpected) in 0.005 (0.006) seconds
Test Suite 'All tests' passed at 2026-09-14 13:14:49.562.
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
    * <rootDir>/maia-desktop/package.json
    * <rootDir>/desktop-app/package.json

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
    ✓ only HealthSupervisor verdicts reach requestRecovery, and the schedule is the ratified one
    ✓ stale callbacks are gated by generation and journalled, never acted on
  KERNEL-00 · PRE-WITNESS-01 — causal, longitudinal, replayable record
    ✓ every journal record carries seq and an optional causeSeq (P8)
    ✓ physiology is sampled longitudinally and the app lifecycle is journalled (P4, P7b)
  KERNEL-00 · PRE-WITNESS-02 — the entry seam is a precondition, not exception handling
    ✓ a `try …requireValid()` lexically precedes every callback/listener arming in start() (§3.1) (1 ms)
    ✓ no NSException / ExceptionCatcher / objc_try construct exists anywhere in the package (§3.1)
    ✓ a refused build and every format change journal the observed input format and generation age (§3.4)
  KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1) · PRE-WITNESS-03 — the configuration-change seam is exit-guarded, bounded, never a direct rebuild
    ✓ D: a configuration-change handler never directly invokes rebuildGraph, and the route_recovery cause is gone (29 ms)
    ✓ B: a configuration change reaches the graph only through the existing RecoveryPolicy as its own fault class (41 ms)
    ✓ A: a notification after exit is journalled and dropped before any generation or graph exists (14 ms)
    ✓ C: voice processing is a journalled, pre-Enter-only kernel command; the harness only projects it (ACTIVE — unchanged files)
  KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1) · PRE-WITNESS-04 — the expected VP change is classified one-shot, deferred, and decided by the supervisor
    ✓ C: classification is a pure, generation-scoped, one-shot function over ports (data source is evidence, not identity) (13 ms)
    ✓ B: the deferred branch consumes the expectation and touches neither the graph nor the recovery policy (12 ms)
    ✓ the expectation is armed only at a graph start and retired when the generation is healthy (13 ms)
    ✓ no new fault class, budget, timer or threshold: the caller set is closed and Replay names the deferral as an automatic act (49 ms)
    ✓ §2.3: the observation and the samples carry the provenance that proves why C fired (15 ms)
  KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1 / 4596b9bdb) · PRE-WITNESS-05 Phase A — instrumentation only: mutating startup order unchanged, added calls read-only, no new timer
    ✓ the MUTATING startup call order is unchanged from 35b0f61d0 (14 ms)
    ✓ ADDED calls are observation/read-only or journal instrumentation only; NO new timer · mutation · recovery act · configuration act (26 ms)
    ✓ the kernel observes isRunning on the EXISTING tick only (no new timer) and journals the first callback per generation (15 ms)
    ✓ the Phase-A subject 4596b9bdb (reproduced as R1) carries the 14-step trace WITH input_format_before_vp — the shape the ledger reads (15 ms)
  KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1) · PRE-WITNESS-05 P5-B0 — removal control: the pre-VP input-format read is gone and NOTHING else moved
    ✓ no input-format read of any kind precedes setVoiceProcessingEnabled inside start() (14 ms)
    ✓ exactly ONE input.outputFormat(forBus: 0) read remains in start(), after VP enable and before requireValid (the 35b0f61d0 position) (14 ms)
    ✓ the seam input_format_before_vp does not exist in any non-test kernel or harness source of the subject (179 ms)
    ✓ all other Phase-A reads are KEPT: VP read-back, isRunning immediate, elapsed-ms timing, after-VP format (13 ms)
  KERNEL-00 · VPIO-01 — the substrate is the one file's interior; the invariant substrate is byte-identical
    ✓ authority · supervisor · policy · state · projection · journal · replay · harness are byte-identical to 24a6fcfa1 (plan §1) (136 ms)
    ✓ the substitution is confined: ConfigurationChange.swift is gone, RouteComparison.swift is pure, and only AudioGraph.swift links Audio Toolbox
    ✓ the substrate drives the Voice-Processing I/O unit: VPIO subtype, both I/O elements enabled, VP = bypass property, format read from (Input scope, el 1) before arming, client formats on (Output,1)/(Input,0), pull input + render callback + property listener, initialize before start (1 ms)
    ✓ G9 (founder header adjudication 2026-09-14): the input buffer is sized by the unit's MaximumFramesPerSlice, read after the formats and before any callback is armed; a larger request is refused, never truncated; no fixed capacity anywhere
    ✓ the start trace names exactly the eleven VPIO seams, in order, and every step is emitted (1 ms)
    ✓ truthful vocabulary (census §3): ioRunning / io_running_observed / io_format_changed present; every engine-meaning record and field absent from the kernel
    ✓ io_format_changed is an observation, never an act: exit guard first, generation guard, no graph or policy call in the handler
    ✓ route recovery is sourced from the authority's route_changed observation, guarded for eligibility, same ports = evidence only, through the existing policy only (plan §11 item 4 / census §5) (1 ms)
    ✓ the pure-logic tests follow the subject: RouteComparisonTests present, the classifier tests gone, the eleven-seam trace pinned
  KERNEL-00 · DRIVER-01 — automate the witness, not the organism
    ✓ the engine subject 24a6fcfa1 (the app under test for stages A/B/C) is still byte-identical in history to the pinned tree hashes (244 ms)
    ✓ the driver is an external instrument: XCTest only, no VoiceKernel, no launch args/env on the app under test, no UserDefaults, no debugger hooks
    ✓ the ledger classifier is closed to the four classes plus two non-audio rows, and never steers a batch (4 ms)
  KERNEL-00 · VOICE-07 — the harness is a projection
    ✓ HarnessModel holds no voice state and reduces only kernel snapshots
    ✓ the harness reaches the journal only through the actor, never the recorder (C2)
    ✓ the view displays "listening" only via the snapshot rule, never from a local flag (1 ms)

Test Suites: 1 passed, 1 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        1.29 s
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
Created project at /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
````

### 5. unsigned iOS build

Command:

```bash
cd ios/VoiceKernelHarness && xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination 'generic/platform=iOS' -derivedDataPath /private/tmp/vpio-mac-compile-5ca7851a8-derived CODE_SIGNING_ALLOWED=NO build
```

Output, verbatim:

````text
Command line invocation:
    /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination generic/platform=iOS -derivedDataPath /private/tmp/vpio-mac-compile-5ca7851a8-derived CODE_SIGNING_ALLOWED=NO build

Build settings from command line:
    CODE_SIGNING_ALLOWED = NO

Resolve Package Graph


Resolved source packages:
  VoiceKernel: /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel

2026-09-14 13:17:49.726 xcodebuild[21208:29473582] [MT] IDERunDestination: Supported platforms for the buildables in the current scheme is empty.
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

Build description signature: bd894cf14cc5594beab6b04639941503
Build description path: /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/XCBuildData/bd894cf14cc5594beab6b04639941503.xcbuilddata
CreateBuildDirectory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products

CreateBuildDirectory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex

ClangStatCache /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk /tmp/vpio-mac-compile-5ca7851a8-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -o /tmp/vpio-mac-compile-5ca7851a8-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache

CreateBuildDirectory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/ExplicitPrecompiledModules
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/ExplicitPrecompiledModules

CreateBuildDirectory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules

CreateBuildDirectory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml

CreateBuildDirectory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos

CreateBuildDirectory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/PackageFrameworks
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/PackageFrameworks

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-target-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyMetadataFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyMetadataFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyStaticMetadataFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyStaticMetadataFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.hmap

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftConstValuesFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftConstValuesFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.LinkFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.LinkFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json

MkDir /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    /bin/mkdir -p /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList

WriteAuxiliaryFile /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    write-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json

Copy /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos/VoiceKernel.modulemap /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos

SwiftDriver VoiceKernel normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-SwiftDriver -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernel -Onone -enforce-exclusivity\=checked @/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList -DSWIFT_PACKAGE -DDEBUG -DSWIFT_MODULE_RESOURCE_BUNDLE_UNAVAILABLE -DXcode -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-mac-compile-5ca7851a8-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-mac-compile-5ca7851a8-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Session.modulevalidation -package-name voicekernel -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources -Xcc -DSWIFT_PACKAGE -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -working-directory /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj -experimental-emit-module-separately -disable-cmo

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_float-3SFSW9602VP4HB3MUX1OQMX7X.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/ptrauth-A0R7KB781HQWV8YOIPKA648O6.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_stdarg-DDGBUH7RBWLJ83UF6BIKR6TF.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/SwiftShims-BA2P3X47FI68KJ964G2BSIP3Z.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_stddef-33YRCNT0XDKH154HQL340VKYE.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/ptrcheck-DA29R65DKKRS2VIY7G3ZJ2BQX.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_stdbool-9VA4W35F4BH1SFZVBWZWPKGEO.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_SwiftConcurrencyShims-QC9YR5E1JUXN65URVACRTP34.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_AvailabilityInternal-3PCELOI15WPL9FGCZ0LFEX3VV.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_DarwinFoundation1-AC8K44P3K895MAL1KE3DFMERG.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_limits-10UQHYJOS6J3ELWJGMQ8J7IHN.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_DarwinFoundation2-F4Y8KEP1THT2QBTQ2EC4IE62F.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_stdint-30G7W4ERDSV3UZA4N0EINUOFY.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/sys_types-C570PD5IG7I6D60N5JV1RY507.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_tgmath-4645BP01HN9U9VOC76NB3RSBW.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_intrinsics-2M1QQQK82B87J9VFEOIY5KHAH.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_stdatomic-9TK0CUB7YKLSAQHOHFE7QD8HU.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_DarwinFoundation3-AUUI4C2N1MSY60BTAFIAX5V5I.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_inttypes-37NR7I9UHY9OU7L54J22O2QF7.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Darwin-DY3WGK9CWSHVCIMFJRH2RQA5S.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/simd-2S39Y0I5DKW00F5TAIA2VJ6PL.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/ObjectiveC-5RLVOSKEP7M9SDC5Z6S2Q6A70.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/MachO-3GQE2LABO8HH68JDHT7D5PDEI.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/os_object-70A5OOG92B4SQCGK40JBT15QE.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/os_workgroup-5XGDGFXKSH307I3AMGTTI32BH.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Dispatch-9MVY5OMVOUMD7EP950RHICMAD.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/XPC-98TLWK8AP8OKJ1AU70GNOVJXG.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/dnssd-7C1WRWWMMVVM29BJ1BP8QYD2B.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CoreFoundation-DYEHU3IJCNOSL71KZK74PXKSA.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/os-ARV0S34VGETG6YRYPFULRD00K.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CoreAudioTypes-K3G77Q9NHNDL34BBOGAFQKLW.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Security-186HDTL1DLG2TZZVZJ7ASI947.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CFNetwork-1LXMJNB9WSA9V8BK751VVKD3Y.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CoreGraphics-7KH36PXLKGPEKFTEX84J86CJX.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CoreAudio-56MXODNUYJ2GEIPWLVV8RBHKV.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Foundation-5EHAHRMKDKBHBB9VLBJZ5T8Y9.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/ImageIO-C7V3XQGT542Y8GLAR4BQ9IUX5.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CoreMIDI-BUY6RFAPKXZL4AS4O40323P9G.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/UniformTypeIdentifiers-D79BQFE7IMP4TY4E3MGHKTKK1.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/IOSurface-8B4KP1GMN2WNCEK2CC18YEQN9.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Network-ANUMF1E5AJZ47FL0WCQ03E9LT.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Metal-799QS0LV518PC37GEDLEA7H0N.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/OpenGLES-EOF5MDNWXK1923YVDEGLJJDB2.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/AVRouting-5EJ858EMH4TKI5OCEXP9GHKZD.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/AudioToolbox-4FBK26PZ1GI9N2U393USFS1KU.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CoreVideo-CXDVYCUGN41YKKW9I0JDYPF4P.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CoreImage-3FFOZDSR7FCCEGDJFFK84G9EW.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/QuartzCore-ETR50ZHGEYJ6O022QHMZU5LO0.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CoreMedia-8YRK6CUQQIZXD2NGS1QVNEJH1.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/AVFAudio-153JQU3OMLQLCB7FWEXIFLKKJ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/MediaToolbox-DUK999LKGLGZJ5AMIXW2Y4M5B.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/AVFoundation-43FKUT1WSINVL0O7VUUF0ZZOD.pcm

SwiftEmitModule normal arm64 Emitting\ module\ for\ VoiceKernel (in target 'VoiceKernel' from project 'VoiceKernel')

EmitSwiftModule normal arm64 (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ RouteComparison.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/RouteComparison.swift (in target 'VoiceKernel' from project 'VoiceKernel')
SwiftCompile normal arm64 /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/RouteComparison.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ VoiceKernel.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift (in target 'VoiceKernel' from project 'VoiceKernel')
SwiftCompile normal arm64 /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ KernelState.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/KernelState.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/KernelState.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ Replay.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/Replay.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/Replay.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ StateProjection.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/StateProjection.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/StateProjection.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ RecoveryPolicy.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/RecoveryPolicy.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/RecoveryPolicy.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ Journal.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/Journal.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/Journal.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ AudioGraph.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift (in target 'VoiceKernel' from project 'VoiceKernel')
Failed frontend command:
/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swift-frontend -frontend -c -primary-file /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/AudioSessionAuthority.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/HealthSupervisor.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/Journal.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/KernelState.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/RecoveryPolicy.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/Replay.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/RouteComparison.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/StateProjection.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift -emit-dependencies-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/AudioGraph.d -emit-const-values-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/AudioGraph.swiftconstvalues -emit-reference-dependencies-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/AudioGraph.swiftdeps -serialize-diagnostics-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/AudioGraph.dia -target arm64-apple-ios16.0 -load-resolved-plugin /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/swift/host/plugins/libFoundationMacros.dylib\#/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/swift-plugin-server\#FoundationMacros -load-resolved-plugin /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/swift/host/plugins/libObservationMacros.dylib\#/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/swift-plugin-server\#ObservationMacros -load-resolved-plugin /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/swift/host/plugins/libSwiftMacros.dylib\#/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/swift-plugin-server\#SwiftMacros -disable-implicit-swift-modules -Xcc -fno-implicit-modules -Xcc -fno-implicit-module-maps -explicit-swift-module-map-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-dependencies-1.json -Xllvm -aarch64-use-tbi -enable-objc-interop -stack-check -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -I /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -no-color-diagnostics -Xcc -fno-color-diagnostics -enable-testing -g -debug-info-format\=dwarf -dwarf-version\=4 -module-cache-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -swift-version 5 -enforce-exclusivity\=checked -Onone -D SWIFT_PACKAGE -D DEBUG -D SWIFT_MODULE_RESOURCE_BUNDLE_UNAVAILABLE -D Xcode -serialize-debugging-options -const-gather-protocols-file /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json -enable-experimental-feature DebugDescriptionMacro -empty-abi-descriptor -validate-clang-modules-once -clang-build-session-file /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -working-directory -Xcc /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj -enable-anonymous-context-mangled-names -file-compilation-dir /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -Xcc -ivfsstatcache -Xcc /tmp/vpio-mac-compile-5ca7851a8-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/swift-overrides.hmap -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources -Xcc -DSWIFT_PACKAGE -Xcc -DDEBUG\=1 -no-auto-bridging-header-chaining -module-name VoiceKernel -package-name voicekernel -frontend-parseable-output -disable-clang-spi -target-sdk-version 26.2 -target-sdk-name iphoneos26.2 -clang-target arm64-apple-ios26.2 -in-process-plugin-server-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/libSwiftInProcPluginServer.dylib -o /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/AudioGraph.o -index-unit-output-path /VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/AudioGraph.o -index-store-path /tmp/vpio-mac-compile-5ca7851a8-derived/Index.noindex/DataStore -index-system-modules

SwiftCompile normal arm64 /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    
/tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift:361:23: error: cannot find 'UnsafeMutableAudioBufferListPointer' in scope
        let buffers = UnsafeMutableAudioBufferListPointer(ioData)
                      ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

SwiftCompile normal arm64 Compiling\ AudioSessionAuthority.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/AudioSessionAuthority.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/AudioSessionAuthority.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ HealthSupervisor.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/HealthSupervisor.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/HealthSupervisor.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftDriverJobDiscovery normal arm64 Emitting module for VoiceKernel (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriver\ Compilation\ Requirements VoiceKernel normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-Swift-Compilation-Requirements -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernel -Onone -enforce-exclusivity\=checked @/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList -DSWIFT_PACKAGE -DDEBUG -DSWIFT_MODULE_RESOURCE_BUNDLE_UNAVAILABLE -DXcode -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-mac-compile-5ca7851a8-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-mac-compile-5ca7851a8-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Session.modulevalidation -package-name voicekernel -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources -Xcc -DSWIFT_PACKAGE -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -working-directory /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj -experimental-emit-module-separately -disable-cmo

SwiftMergeGeneratedHeaders /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos/VoiceKernel-Swift.h /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    builtin-swiftHeaderTool -arch arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -o /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos/VoiceKernel-Swift.h

Copy /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.abi.json /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.abi.json (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.abi.json /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.abi.json

Copy /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftdoc /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftdoc (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftdoc /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftdoc

Copy /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftmodule /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftmodule

Copy /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftsourceinfo (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftsourceinfo /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo

SwiftDriver VoiceKernelHarness normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness
    builtin-SwiftDriver -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernelHarness -Onone -enforce-exclusivity\=checked @/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList -DDEBUG -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-mac-compile-5ca7851a8-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos -F /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-mac-compile-5ca7851a8-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json -Xcc -iquote -Xcc /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap -Xcc -ivfsoverlay -Xcc /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml -Xcc -iquote -Xcc /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-mac-compile-5ca7851a8-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h -working-directory /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernelHarness -experimental-emit-module-separately -disable-cmo

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/SwiftShims-1TU2B6HVFR1X9ERL8AEOID9PZ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/ptrauth-3KQ6KXYAKKJ8JHEF2E53RP5J7.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_SwiftConcurrencyShims-1RU0CG4PK8AB1BPQJ75RS9WQF.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_stdbool-84LVMZ6P6BK0886OG9JPYEQMK.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_stdarg-5OV9HZI350YGBLHJ5XHI5OKAO.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/DeveloperToolsSupport-C28IP7CZIQ6IQKFOB0BZEQMH.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_AvailabilityInternal-DEIEHW4F8WK58I0RW6RF7Q0NH.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/ptrcheck-1S53LI8R7UDUI2R3I4GMP8G9R.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_float-4LH4ECI7NAFCVE96LJO0LN4GB.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_stddef-8IXTXIYXKU9NEKM9405DLXVGJ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_DarwinFoundation1-A2JM8AF362UZKZ19UW26DB0F1.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_DarwinFoundation2-2PX29NLR0U0A2T0ZM3LDM8VKI.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_limits-EL2A175CIGSM4CAU17SV03XCX.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_tgmath-EP9WDG3QWPKLFKNSG7M668CCK.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/sys_types-8696EAL0Q5Y0CMT1RYSLISJJ3.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_stdint-F1JFSEYY3XJMUMJFX62ICR94G.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_stdatomic-7VHZ2CKLJQKFNQPVAPV1Q0AAA.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_intrinsics-5SWAFVELZP0RKSE59R1MP619G.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_DarwinFoundation3-6KD56JEZY0T8IWGNQJ5RGY795.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/_Builtin_inttypes-9RJQGG473QK86VRP7NUGST0ZB.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Darwin-AFB2102N7H1AGC474M2QL2VED.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/simd-4P76YVCMORH8CUGULONSKHLW3.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/MachO-7V3K6H8Z1QVOZ7S8A9CE4TPLM.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/ObjectiveC-2RI2XQONOPJ38A3ES51FI1W9G.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Spatial-F52FM081H4I12O8EENNJTXPDJ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/os_object-4WBPJNXVY9WM45DM8AUEENMSR.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/os_workgroup-BH0L9F32REC3QRP5G45LD46AO.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Dispatch-A7R83RHN1CSH3JO78IMLV35BT.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/dnssd-E7MUPQH1SW68H6OVEWKXOPMAJ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CoreFoundation-BODNYAZ4O0BC7UEZ3CD4ZYJ8I.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/XPC-BTK9F18WDTG2OTLHZS7NI6UAC.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/os-EWVF3K5EJBJ4RX5YPCJCS10Y7.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CFNetwork-ETUT82BS70XNWGXFDM7J1BHGB.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CoreAudioTypes-B83AWZ6XCNSA2744ZR9JTBVBH.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CoreGraphics-BQG7F30EU0JMSOC3O7SU15KOX.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Security-6ZRIBVNN4G7UMYX27RZV6F99U.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CoreAudio-BJRL9F4ZH28L1NCDJAFUZVH0S.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/Foundation-9X6T2RC6WY1EOMEY78IFXEYGO.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/ImageIO-5POAB1Q7KY6CPY8TBCDGM8HHE.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-mac-compile-5ca7851a8-derived/ModuleCache.noindex/CoreText-EBKB7F5Q6C2J1ROKB5OQ7EF4A.pcm

SwiftDriverJobDiscovery normal arm64 Compiling RouteComparison.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling StateProjection.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling RecoveryPolicy.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling Replay.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling HealthSupervisor.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling Journal.swift (in target 'VoiceKernel' from project 'VoiceKernel')

** BUILD FAILED **


The following build commands failed:
	SwiftCompile normal arm64 Compiling\ AudioGraph.swift /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift (in target 'VoiceKernel' from project 'VoiceKernel')
	SwiftCompile normal arm64 /tmp/vpio-mac-compile-5ca7851a8/ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift (in target 'VoiceKernel' from project 'VoiceKernel')
	Building project VoiceKernelHarness with scheme VoiceKernelHarness
(3 failures)
````

### 6. signed device build

**NOT RUN.** The predeclared compile sequence stopped after step 5 returned `RC=65` / `** BUILD FAILED **`. No signed build was attempted.

```text
(no command executed; no output)
```

## Artifact identity

Output, verbatim:

````text
--- expected binaries ---
ABSENT /private/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness
ABSENT /private/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib
--- app files ---
--- codesign ---
/private/tmp/vpio-mac-compile-5ca7851a8-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app: bundle format unrecognized, invalid, or unsuitable
````

Therefore:

```text
VoiceKernelHarness executable       ABSENT
VoiceKernelHarness.debug.dylib      ABSENT
debug dylib UUID                    NOT PRODUCED
debug dylib SHA-256                 NOT PRODUCED
signed app manifest                 NOT PRODUCED
codesign identity                   NOT PRODUCED
```

## Bounded compile-era defect evidence

Read-only diagnosis on the Mac after the failure, verbatim:

````text
SDKROOT=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk
--- source imports ---
// Every Audio Toolbox property and call below is a documented, SDK-present
// name (founder header check, iPhoneOS 26.2); none is guessed.
import Foundation
import AudioToolbox

public struct RenderStats: Sendable, Equatable {
    public var streamId: OutputStreamID
    public var framesRendered: Int64
    public var framesScheduled: Int64
--- Swift overlay declaration ---
22-  public static func allocate(maximumBuffers: Swift.Int) -> CoreAudio.UnsafeMutableAudioBufferListPointer
23-}
24:public struct UnsafeMutableAudioBufferListPointer {
25-  public init(_ p: Swift.UnsafeMutablePointer<CoreAudioTypes.AudioBufferList>)
26-  #if compiler(>=5.3) && $NonescapableTypes
27-  public init?(_ p: Swift.UnsafeMutablePointer<CoreAudioTypes.AudioBufferList>?)
28-  #endif
29-  public var count: Swift.Int {
30-    get
````

This establishes a module-visibility defect, not an absent SDK primitive: the Swift overlay type exists in the installed SDK under `CoreAudio`, while this subject does not import that module. No source was changed by this act.

## Execution note — source-gate dependency setup

The first gate invocation in the detached worktree used `npx jest` before that worktree had repository dependencies available. It did **not** execute the gate and failed at Jest configuration because `ts-jest` was unavailable. That attempt is an execution-environment defect, not a source-gate result. It is preserved here verbatim; the actual gate was then run using the canonical checkout's existing `node_modules` through a temporary symlink and passed 45/45.

First attempt, verbatim:

````text
npm warn exec The following package was not found and will be installed: jest@30.5.1
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
● Validation Error:

  Preset ts-jest not found relative to rootDir /private/tmp/vpio-mac-compile-5ca7851a8.

  Configuration Documentation:
  https://jestjs.io/docs/configuration
````

No package or source file was changed to obtain the valid gate result.

## XcodeGen footprint

`xcodegen generate` performs its known tracked `Info.plist` generation in the disposable worktree. The subject commit remained `5ca7851a8`; package/kernel source stayed unchanged. Post-attempt footprint, verbatim:

````text
--- post-attempt worktree status ---
 M ios/VoiceKernelHarness/Harness/Info.plist
--- xcodegen Info.plist footprint ---
diff --git a/ios/VoiceKernelHarness/Harness/Info.plist b/ios/VoiceKernelHarness/Harness/Info.plist
index 39a5741cf..d51fdd24d 100644
--- a/ios/VoiceKernelHarness/Harness/Info.plist
+++ b/ios/VoiceKernelHarness/Harness/Info.plist
@@ -4,6 +4,8 @@
 <dict>
 	<key>CFBundleDevelopmentRegion</key>
 	<string>$(DEVELOPMENT_LANGUAGE)</string>
+	<key>CFBundleDisplayName</key>
+	<string>VoiceKernel VPIO-01</string>
 	<key>CFBundleExecutable</key>
 	<string>$(EXECUTABLE_NAME)</string>
 	<key>CFBundleIdentifier</key>
@@ -13,6 +15,22 @@
 	<key>CFBundleName</key>
 	<string>$(PRODUCT_NAME)</string>
 	<key>CFBundlePackageType</key>
-	<string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
+	<string>APPL</string>
+	<key>CFBundleShortVersionString</key>
+	<string>0.0.1</string>
+	<key>CFBundleVersion</key>
+	<string>1</string>
+	<key>NSMicrophoneUsageDescription</key>
+	<string>KERNEL-00 witness: proves one native authority can keep the microphone and speaker alive, observable, cancellable and recoverable. No speech is recognized, stored, or transmitted.</string>
+	<key>UIBackgroundModes</key>
+	<array>
+		<string>audio</string>
+	</array>
+	<key>UILaunchScreen</key>
+	<dict/>
+	<key>UISupportedInterfaceOrientations</key>
+	<array>
+		<string>UIInterfaceOrientationPortrait</string>
+	</array>
 </dict>
 </plist>
````

## Standing

```text
VPIO-01 source          5ca7851a8 · COMPILE-ERA DEFECT FOUND
MAC-COMPILE-01          RED · CLOSED on this SHA
signed build            NOT RUN
artifact                NONE
install · device        NOT AUTHORIZED · NOT RUN
N=30                     NOT AUTHORIZED · UNSPENT
F-W1                     UNSPENT
KERNEL-01                CLOSED
BENCH-01                 CLOSED
BRIDGE-01                CLOSED
MIGRATE-01               CLOSED
JOP-04                   UNTOUCHED
```

A source correction, if authorized, is a new compile subject and earns a fresh MAC-COMPILE. This failed compile does not authorize any downstream act.
