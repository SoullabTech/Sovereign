# KERNEL-00 · MAC-COMPILE-01 — first compile record

**Date:** 2026-09-11  
**Subject:** `eef4874221cef69d16700b06712310ed4ab53706`  
**Standing:** first compile evidence only · device witness HOLD · PRE-WITNESS-01 not executed  
**Execution note:** the main repository worktree was on an unrelated active branch with untracked work, so the authorized SHA was compiled in a clean detached worktree at `/tmp/k00-mac-compile-eef487422`. `git rev-parse HEAD` there returned the exact subject SHA above. No Swift source was modified.

## Environment

```text
macOS 15.7.8 (24G806)
Xcode 26.3 (17C529)
Swift 6.2.4 (swiftlang-6.2.4.1.4 clang-1700.6.4.2)
iOS SDK 26.2
Architecture: arm64-apple-macosx15.0
```

## Result summary

| Gate | Result | Evidence classification |
|---|---|---|
| `swift build` | PASS | Package compiles on Mac Studio. |
| `swift test` | FAIL | 16 executed · 1 failure: `RecoveryPolicyTests.testBudgetIsPerFaultClassAndPerWindow` (`window rolls at 60 s`). |
| source gate | ENVIRONMENT-GATED / NOT EXECUTED | `npx` installed Jest 30.5.1 in the clean worktree, then Jest could not resolve the repository's `ts-jest` preset. This is not evidence that the source gate itself is red. |
| `xcodegen generate` | PASS | Harness Xcode project generated successfully. |
| generic iOS `xcodebuild` | FAIL AT SIGNING | Package graph resolves and build planning reaches provisioning; target has no Development Team configured. No Swift compile error is established by this step. |

Per the ruling, these are evidence about `eef487422`, not repair authorization. PRE-WITNESS-01 may now address P1–P8 plus named compile/test/environment fixes as a new SHA. The device witness remains HOLD.

---

## Five predeclared outputs — verbatim

### 1. `swift build`

```text
Building for debugging...
[0/2] Write sources
[1/2] Write swift-version--58304C5D6DBC2206.txt
[3/12] Compiling VoiceKernel VoiceKernel.swift
[4/12] Compiling VoiceKernel KernelState.swift
[5/12] Emitting module VoiceKernel
[6/12] Compiling VoiceKernel HealthSupervisor.swift
[7/12] Compiling VoiceKernel StateProjection.swift
[8/12] Compiling VoiceKernel AudioGraph.swift
[9/12] Compiling VoiceKernel Journal.swift
[10/12] Compiling VoiceKernel AudioSessionAuthority.swift
[11/12] Compiling VoiceKernel RecoveryPolicy.swift
[12/12] Compiling VoiceKernel Replay.swift
Build complete! (5.20s)
```

### 2. `swift test`

```text
[0/1] Planning build
Building for debugging...
[0/5] Write sources
[1/5] /private/tmp/k00-mac-compile-eef487422/ios/VoiceKernel/.build/arm64-apple-macosx/debug/VoiceKernelPackageTests.derived/runner.swift
[2/6] Write sources
[3/6] Write swift-version--58304C5D6DBC2206.txt
[5/8] Emitting module VoiceKernelTests
[6/8] Compiling VoiceKernelTests PureLogicTests.swift
[7/10] Emitting module VoiceKernelPackageTests
[8/10] Compiling VoiceKernelPackageTests runner.swift
[8/10] Write Objects.LinkFileList
[9/10] Linking VoiceKernelPackageTests
Build complete! (7.02s)
Test Suite 'All tests' started at 2026-09-11 10:47:18.265.
Test Suite 'VoiceKernelPackageTests.xctest' started at 2026-09-11 10:47:18.266.
Test Suite 'HealthSupervisorTests' started at 2026-09-11 10:47:18.266.
Test Case '-[VoiceKernelTests.HealthSupervisorTests testDigitalZeroIsDeadWithinTheRatifiedWindow]' started.
Test Case '-[VoiceKernelTests.HealthSupervisorTests testDigitalZeroIsDeadWithinTheRatifiedWindow]' passed (0.001 seconds).
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
Test Suite 'HealthSupervisorTests' passed at 2026-09-11 10:47:18.267.
	 Executed 7 tests, with 0 failures (0 unexpected) in 0.001 (0.002) seconds
Test Suite 'RecoveryPolicyTests' started at 2026-09-11 10:47:18.267.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetAndBackoffAreTheRatifiedSchedule]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetAndBackoffAreTheRatifiedSchedule]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetIsPerFaultClassAndPerWindow]' started.
/private/tmp/k00-mac-compile-eef487422/ios/VoiceKernel/Tests/VoiceKernelTests/PureLogicTests.swift:113: error: -[VoiceKernelTests.RecoveryPolicyTests testBudgetIsPerFaultClassAndPerWindow] : failed - window rolls at 60 s
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetIsPerFaultClassAndPerWindow]' failed (0.041 seconds).
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testGenerationsAreMonotonicAcrossReasons]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testGenerationsAreMonotonicAcrossReasons]' passed (0.000 seconds).
Test Suite 'RecoveryPolicyTests' failed at 2026-09-11 10:47:18.309.
	 Executed 3 tests, with 1 failure (0 unexpected) in 0.041 (0.041) seconds
Test Suite 'ReplayTests' started at 2026-09-11 10:47:18.309.
Test Case '-[VoiceKernelTests.ReplayTests testAutomaticActWithoutCauseFails]' started.
Test Case '-[VoiceKernelTests.ReplayTests testAutomaticActWithoutCauseFails]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testJournalRoundTripsThroughJSONL]' started.
Test Case '-[VoiceKernelTests.ReplayTests testJournalRoundTripsThroughJSONL]' passed (0.001 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testLawfulRunReplaysClean]' started.
Test Case '-[VoiceKernelTests.ReplayTests testLawfulRunReplaysClean]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testOrphanTransitionFails]' started.
Test Case '-[VoiceKernelTests.ReplayTests testOrphanTransitionFails]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testUnlawfulEdgeFails]' started.
Test Case '-[VoiceKernelTests.ReplayTests testUnlawfulEdgeFails]' passed (0.000 seconds).
Test Suite 'ReplayTests' passed at 2026-09-11 10:47:18.310.
	 Executed 5 tests, with 0 failures (0 unexpected) in 0.001 (0.001) seconds
Test Suite 'SnapshotRulesTests' started at 2026-09-11 10:47:18.310.
Test Case '-[VoiceKernelTests.SnapshotRulesTests testListeningIsDisplayedOnlyWithHealthyInput]' started.
Test Case '-[VoiceKernelTests.SnapshotRulesTests testListeningIsDisplayedOnlyWithHealthyInput]' passed (0.000 seconds).
Test Suite 'SnapshotRulesTests' passed at 2026-09-11 10:47:18.310.
	 Executed 1 test, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'VoiceKernelPackageTests.xctest' failed at 2026-09-11 10:47:18.310.
	 Executed 16 tests, with 1 failure (0 unexpected) in 0.044 (0.045) seconds
Test Suite 'All tests' failed at 2026-09-11 10:47:18.310.
	 Executed 16 tests, with 1 failure (0 unexpected) in 0.044 (0.045) seconds
◇ Test run started.
↳ Testing Library Version: 1501
↳ Target Platform: arm64e-apple-macos14.0
✔ Test run with 0 tests in 0 suites passed after 0.001 seconds.
```

### 3. KERNEL-00 source gate

```text
npm warn exec The following package was not found and will be installed: jest@30.5.1
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
● Validation Error:

  Preset ts-jest not found relative to rootDir /private/tmp/k00-mac-compile-eef487422.

  Configuration Documentation:
  https://jestjs.io/docs/configuration

```

### 4. `xcodegen generate`

```text
⚙️  Generating plists...
⚙️  Generating project...
⚙️  Writing project...
Created project at /tmp/k00-mac-compile-eef487422/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
```

### 5. generic iOS `xcodebuild` (last 60 lines, exactly as predeclared)

```text
Command line invocation:
    /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination generic/platform=iOS -allowProvisioningUpdates build

Resolve Package Graph


Resolved source packages:
  VoiceKernel: /tmp/k00-mac-compile-eef487422/ios/VoiceKernel

2026-09-11 10:49:44.765 xcodebuild[38799:24547739] [MT] IDERunDestination: Supported platforms for the buildables in the current scheme is empty.
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

Build description signature: c0719bc6c6be4e70810a0b25a2847860
Build description path: /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-erldhicdfedulbdnggjwnupcpjod/Build/Intermediates.noindex/XCBuildData/c0719bc6c6be4e70810a0b25a2847860.xcbuilddata
/tmp/k00-mac-compile-eef487422/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj: error: Signing for "VoiceKernelHarness" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
** BUILD FAILED **


The following build commands failed:
	Building project VoiceKernelHarness with scheme VoiceKernelHarness
(1 failure)
```

---

## Supplementary same-SHA environment/compile probes

These do **not** replace any of the five predeclared outputs above. They were run afterward on the same detached `eef487422` worktree to distinguish environment/provisioning blockers from source defects. No tracked source was changed.

### A. Source gate rerun with the repository's already-installed dependencies mounted

```text
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
    ✓ the package has no dependencies and the harness is not a member of ios/App
  KERNEL-00 · VOICE-10 — output has identity and a cancellable lifetime
    ✓ the graph schedules only under an OutputStreamID and exposes cancel(id) (1 ms)
    ✓ the kernel journals every cancel with frames rendered and cancel latency
  KERNEL-00 · VOICE-06 / -15 / -16 — one recovery owner, bounded, journalled
    ✓ only HealthSupervisor verdicts reach requestRecovery, and the schedule is the ratified one
    ✓ stale callbacks are gated by generation and journalled, never acted on (1 ms)
  KERNEL-00 · VOICE-07 — the harness is a projection
    ✓ HarnessModel holds no voice state and reduces only kernel snapshots
    ✓ the view displays "listening" only via the snapshot rule, never from a local flag

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        0.397 s
Ran all test suites matching /__tests__\/voice-kernel-00-source-gates.test.ts/i.
```

**Result:** PASS · 10/10. The original `ts-jest` failure was an environment artifact of the clean worktree, not a red source gate.

### B. Generic iOS compile with code signing disabled

Command:

```bash
xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
```

The full output is preserved at `/tmp/k00-xcodebuild-nosign.txt` on the Mac Studio for this session. The decisive compiler excerpt is:

```text
/tmp/k00-mac-compile-eef487422/ios/VoiceKernelHarness/Harness/HarnessModel.swift:75:27: error: actor-isolated property 'recorder' can not be referenced from the main actor
        let text = kernel.recorder.exportJSONL()
                          ^
VoiceKernel.VoiceKernel.recorder:2:12: note: property declared here
public let recorder: VoiceKernel.FlightRecorder}
           ^
/tmp/k00-mac-compile-eef487422/ios/VoiceKernelHarness/Harness/HarnessModel.swift:76:29: error: actor-isolated property 'recorder' can not be referenced from the main actor
        let events = kernel.recorder.snapshot()
                            ^
VoiceKernel.VoiceKernel.recorder:2:12: note: property declared here
public let recorder: VoiceKernel.FlightRecorder}
           ^

** BUILD FAILED **
```

**Classification:** named compile defect, bounded for PRE-WITNESS-01. The harness must request journal export/snapshot through an actor-isolated `VoiceKernel` method (or equivalent lawful boundary); it may not reach actor-owned state directly. This is compile custody, not architecture redesign.
