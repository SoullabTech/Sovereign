# KERNEL-00 — MAC-COMPILE-02 record

**Subject:** `488e0666cfe7501cb55df14bc12dc416f4f7bd5d` (`PRE-WITNESS-01` applied)
**Date:** 2026-09-11
**Machine:** Kelly's Mac Studio
**Purpose:** second compile gate required before the KERNEL-00 device witness. This record compiles the bounded PRE-WITNESS-01 SHA; it does not install or run the harness and does not spend the device witness.

## Result

| Gate | Result |
|---|---|
| `swift build` | PASS |
| `swift test` | PASS — 17/17 |
| source gate | PASS — 13/13 |
| `xcodegen generate` | PASS |
| unsigned iOS compile | PASS |
| signed device-targeted compile | PASS |

**Standing after this record:** all predeclared compile gates are green. The device-witness HOLD is therefore lifted by the standing rule recorded before this compile; the witness remains unspent until a separate install/run act occurs.

## Environment

```text
macOS 15.7.8 (24G806)
Xcode 26.3 (17C529)
Swift 6.2.4 (swiftlang-6.2.4.1.4 clang-1700.6.4.2)
iOS SDK 26.2
XcodeGen 2.46.0
Subject 488e0666cfe7501cb55df14bc12dc416f4f7bd5d
Paired device: Kelly Nezat’s iPhone · iPhone 16 Pro Max
Xcode destination id: 00008140-00163D9922E0801C
Development team: ZVK2X646Z2
Signing identity used: Apple Development: Kelly Nezat (N9DTF6434L)
```

## Notes that do not change the result

- The unsigned iOS compile emits one non-blocking warning: the result of `try? session?.release(...)` is unused.
- `.allowBluetoothHFP` compiles against the iOS 16 deployment target and iOS 26.2 SDK.
- The first device-targeted command used the `devicectl` identifier rather than Xcode's destination identifier and therefore failed before build selection. That operator/destination mismatch is preserved verbatim in Appendix A. The corrected Xcode destination build then PASSed and signed successfully.
- The source gate ran against this exact detached subject using the main repository's already-installed `node_modules`; no source from the main worktree was used.

## 1. `swift build` — verbatim

```text
Building for debugging...
[0/2] Write sources
[1/2] Write swift-version--58304C5D6DBC2206.txt
[3/12] Compiling VoiceKernel VoiceKernel.swift
[4/12] Compiling VoiceKernel HealthSupervisor.swift
[5/12] Emitting module VoiceKernel
[6/12] Compiling VoiceKernel Replay.swift
[7/12] Compiling VoiceKernel AudioGraph.swift
[8/12] Compiling VoiceKernel KernelState.swift
[9/12] Compiling VoiceKernel AudioSessionAuthority.swift
[10/12] Compiling VoiceKernel RecoveryPolicy.swift
[11/12] Compiling VoiceKernel StateProjection.swift
[12/12] Compiling VoiceKernel Journal.swift
Build complete! (5.12s)
```

## 2. `swift test` — verbatim

```text
[0/1] Planning build
Building for debugging...
[0/5] Write sources
[1/6] /private/tmp/k00-second-488e0666c/ios/VoiceKernel/.build/arm64-apple-macosx/debug/VoiceKernelPackageTests.derived/runner.swift
[2/6] Write sources
[3/6] Write swift-version--58304C5D6DBC2206.txt
[5/8] Compiling VoiceKernelTests PureLogicTests.swift
[6/8] Emitting module VoiceKernelTests
[7/10] Emitting module VoiceKernelPackageTests
[8/10] Compiling VoiceKernelPackageTests runner.swift
[8/10] Write Objects.LinkFileList
[9/10] Linking VoiceKernelPackageTests
Build complete! (7.08s)
Test Suite 'All tests' started at 2026-09-11 11:42:17.605.
Test Suite 'VoiceKernelPackageTests.xctest' started at 2026-09-11 11:42:17.606.
Test Suite 'HealthSupervisorTests' started at 2026-09-11 11:42:17.606.
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
Test Suite 'HealthSupervisorTests' passed at 2026-09-11 11:42:17.607.
	 Executed 7 tests, with 0 failures (0 unexpected) in 0.001 (0.002) seconds
Test Suite 'RecoveryPolicyTests' started at 2026-09-11 11:42:17.607.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetAndBackoffAreTheRatifiedSchedule]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetAndBackoffAreTheRatifiedSchedule]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetIsPerFaultClassAndSlidesOverSixtySeconds]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetIsPerFaultClassAndSlidesOverSixtySeconds]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testGenerationsAreMonotonicAcrossReasons]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testGenerationsAreMonotonicAcrossReasons]' passed (0.000 seconds).
Test Suite 'RecoveryPolicyTests' passed at 2026-09-11 11:42:17.608.
	 Executed 3 tests, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'ReplayTests' started at 2026-09-11 11:42:17.608.
Test Case '-[VoiceKernelTests.ReplayTests testAutomaticActWithoutCauseOrParentFails]' started.
Test Case '-[VoiceKernelTests.ReplayTests testAutomaticActWithoutCauseOrParentFails]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testCausalParentMustExistPrecedeAndNotComeFromALaterGeneration]' started.
Test Case '-[VoiceKernelTests.ReplayTests testCausalParentMustExistPrecedeAndNotComeFromALaterGeneration]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testJournalAssignsMonotonicSeqAndRoundTripsThroughJSONL]' started.
Test Case '-[VoiceKernelTests.ReplayTests testJournalAssignsMonotonicSeqAndRoundTripsThroughJSONL]' passed (0.001 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testLawfulCausalRunReplaysClean]' started.
Test Case '-[VoiceKernelTests.ReplayTests testLawfulCausalRunReplaysClean]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testOrphanTransitionFails]' started.
Test Case '-[VoiceKernelTests.ReplayTests testOrphanTransitionFails]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.ReplayTests testUnlawfulEdgeFails]' started.
Test Case '-[VoiceKernelTests.ReplayTests testUnlawfulEdgeFails]' passed (0.000 seconds).
Test Suite 'ReplayTests' passed at 2026-09-11 11:42:17.609.
	 Executed 6 tests, with 0 failures (0 unexpected) in 0.001 (0.002) seconds
Test Suite 'SnapshotRulesTests' started at 2026-09-11 11:42:17.609.
Test Case '-[VoiceKernelTests.SnapshotRulesTests testListeningIsDisplayedOnlyWithHealthyInput]' started.
Test Case '-[VoiceKernelTests.SnapshotRulesTests testListeningIsDisplayedOnlyWithHealthyInput]' passed (0.000 seconds).
Test Suite 'SnapshotRulesTests' passed at 2026-09-11 11:42:17.609.
	 Executed 1 test, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'VoiceKernelPackageTests.xctest' passed at 2026-09-11 11:42:17.609.
	 Executed 17 tests, with 0 failures (0 unexpected) in 0.003 (0.004) seconds
Test Suite 'All tests' passed at 2026-09-11 11:42:17.609.
	 Executed 17 tests, with 0 failures (0 unexpected) in 0.003 (0.004) seconds
◇ Test run started.
↳ Testing Library Version: 1501
↳ Target Platform: arm64e-apple-macos14.0
✔ Test run with 0 tests in 0 suites passed after 0.001 seconds.
```

## 3. source gate — verbatim

```text
jest-haste-map: Haste module naming collision: maia-desktop
  The following files share their name; please adjust your hasteImpl:
    * <rootDir>/desktop-app/package.json
    * <rootDir>/maia-desktop/package.json

PASS __tests__/voice-kernel-00-source-gates.test.ts
  KERNEL-00 · K00-01 / VOICE-01 — one hardware sovereign
    ✓ only AudioSessionAuthority.swift touches AVAudioSession (1 ms)
    ✓ AudioSessionAuthority is iOS-only by construction and journals every mutation
  KERNEL-00 · K00-16 — nothing else is in the build
    ✓ no forbidden symbol appears in kernel or harness source (1 ms)
    ✓ the package has no dependencies and the harness is not a member of ios/App (1 ms)
  KERNEL-00 · VOICE-10 — output has identity and a cancellable lifetime
    ✓ the graph schedules only under an OutputStreamID and exposes cancel(id)
    ✓ the kernel journals every cancel and measures cancel → silence at the render seam (P5)
  KERNEL-00 · VOICE-06 / -15 / -16 — one recovery owner, bounded, journalled
    ✓ only HealthSupervisor verdicts reach requestRecovery, and the schedule is the ratified one (1 ms)
    ✓ stale callbacks are gated by generation and journalled, never acted on
  KERNEL-00 · PRE-WITNESS-01 — causal, longitudinal, replayable record
    ✓ every journal record carries seq and an optional causeSeq (P8)
    ✓ physiology is sampled longitudinally and the app lifecycle is journalled (P4, P7b)
  KERNEL-00 · VOICE-07 — the harness is a projection
    ✓ HarnessModel holds no voice state and reduces only kernel snapshots
    ✓ the harness reaches the journal only through the actor, never the recorder (C2) (1 ms)
    ✓ the view displays "listening" only via the snapshot rule, never from a local flag

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        0.384 s
Ran all test suites matching /__tests__\/voice-kernel-00-source-gates.test.ts/i.
```

## 4. `xcodegen generate` — verbatim

```text
⚙️  Generating plists...
⚙️  Generating project...
⚙️  Writing project...
Created project at /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
```

## 5. unsigned iOS compile — verbatim

```text
Command line invocation:
    /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination generic/platform=iOS CODE_SIGNING_ALLOWED=NO build

Build settings from command line:
    CODE_SIGNING_ALLOWED = NO

Resolve Package Graph


Resolved source packages:
  VoiceKernel: /tmp/k00-second-488e0666c/ios/VoiceKernel

2026-09-11 11:44:10.156 xcodebuild[43215:24626531] [MT] IDERunDestination: Supported platforms for the buildables in the current scheme is empty.
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

Build description signature: 61163cbdee25aaf7b3a4968d04e86797
Build description path: /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/XCBuildData/61163cbdee25aaf7b3a4968d04e86797.xcbuilddata
CreateBuildDirectory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products

CreateBuildDirectory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex

ClangStatCache /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk /Users/soullab/Library/Developer/Xcode/DerivedData/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -o /Users/soullab/Library/Developer/Xcode/DerivedData/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache

CreateBuildDirectory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos

CreateBuildDirectory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules

CreateBuildDirectory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/ExplicitPrecompiledModules
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/ExplicitPrecompiledModules

CreateBuildDirectory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml

CreateBuildDirectory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.hmap

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-target-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-target-headers.hmap

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json

MkDir /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    /bin/mkdir -p /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyStaticMetadataFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyStaticMetadataFileList

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyMetadataFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyMetadataFileList

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.LinkFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.LinkFileList

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftConstValuesFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftConstValuesFileList

Copy /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos/VoiceKernel.modulemap /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos

SwiftDriver VoiceKernel normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-SwiftDriver -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernel -Onone -enforce-exclusivity\=checked @/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList -DSWIFT_PACKAGE -DDEBUG -DSWIFT_MODULE_RESOURCE_BUNDLE_UNAVAILABLE -DXcode -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -sdk-module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule -validate-clang-modules-once -clang-build-session-file /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex/Session.modulevalidation -package-name voicekernel -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/include -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources-normal/arm64 -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources/arm64 -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources -Xcc -DSWIFT_PACKAGE -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -working-directory /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj -experimental-emit-module-separately -disable-cmo

SwiftCompile normal arm64 Compiling\ RecoveryPolicy.swift /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/RecoveryPolicy.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/RecoveryPolicy.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ Journal.swift /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/Journal.swift (in target 'VoiceKernel' from project 'VoiceKernel')
SwiftCompile normal arm64 /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/Journal.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ HealthSupervisor.swift /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/HealthSupervisor.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/HealthSupervisor.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ KernelState.swift /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/KernelState.swift (in target 'VoiceKernel' from project 'VoiceKernel')
SwiftCompile normal arm64 /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/KernelState.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ AudioGraph.swift /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift (in target 'VoiceKernel' from project 'VoiceKernel')
SwiftCompile normal arm64 /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftEmitModule normal arm64 Emitting\ module\ for\ VoiceKernel (in target 'VoiceKernel' from project 'VoiceKernel')

EmitSwiftModule normal arm64 (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ VoiceKernel.swift /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift (in target 'VoiceKernel' from project 'VoiceKernel')
SwiftCompile normal arm64 /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    
/tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift:117:9: warning: result of 'try?' is unused
        try? session?.release(cause: "leaveConversation", causeSeq: cmd)
        ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

SwiftCompile normal arm64 Compiling\ StateProjection.swift /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/StateProjection.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/StateProjection.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ AudioSessionAuthority.swift /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/AudioSessionAuthority.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/AudioSessionAuthority.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ Replay.swift /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/Replay.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/k00-second-488e0666c/ios/VoiceKernel/Sources/VoiceKernel/Replay.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftDriverJobDiscovery normal arm64 Emitting module for VoiceKernel (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriver\ Compilation\ Requirements VoiceKernel normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-Swift-Compilation-Requirements -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernel -Onone -enforce-exclusivity\=checked @/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList -DSWIFT_PACKAGE -DDEBUG -DSWIFT_MODULE_RESOURCE_BUNDLE_UNAVAILABLE -DXcode -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -sdk-module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule -validate-clang-modules-once -clang-build-session-file /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex/Session.modulevalidation -package-name voicekernel -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/include -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources-normal/arm64 -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources/arm64 -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources -Xcc -DSWIFT_PACKAGE -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -working-directory /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj -experimental-emit-module-separately -disable-cmo

SwiftMergeGeneratedHeaders /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos/VoiceKernel-Swift.h /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    builtin-swiftHeaderTool -arch arm64 /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos/VoiceKernel-Swift.h

Copy /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.abi.json /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.abi.json (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.abi.json /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.abi.json

Copy /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftmodule /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftmodule

Copy /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftdoc /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftdoc (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftdoc /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftdoc

Copy /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftsourceinfo (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftsourceinfo /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo

SwiftDriver VoiceKernelHarness normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-SwiftDriver -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernelHarness -Onone -enforce-exclusivity\=checked @/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList -DDEBUG -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -F /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks -F /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -sdk-module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule -validate-clang-modules-once -clang-build-session-file /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex/Session.modulevalidation -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json -Xcc -iquote -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap -Xcc -ivfsoverlay -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml -Xcc -iquote -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/include -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources-normal/arm64 -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/arm64 -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h -working-directory /tmp/k00-second-488e0666c/ios/VoiceKernelHarness -experimental-emit-module-separately -disable-cmo

SwiftEmitModule normal arm64 Emitting\ module\ for\ VoiceKernelHarness (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

EmitSwiftModule normal arm64 (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    

SwiftCompile normal arm64 Compiling\ HarnessModel.swift /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/Harness/HarnessModel.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
SwiftCompile normal arm64 /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/Harness/HarnessModel.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    

SwiftCompile normal arm64 Compiling\ HarnessView.swift /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/Harness/HarnessView.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
SwiftCompile normal arm64 /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/Harness/HarnessView.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    

SwiftCompile normal arm64 Compiling\ VoiceKernelHarnessApp.swift /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/Harness/VoiceKernelHarnessApp.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftCompile normal arm64 /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/Harness/VoiceKernelHarnessApp.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    

SwiftDriverJobDiscovery normal arm64 Emitting module for VoiceKernelHarness (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftDriver\ Compilation\ Requirements VoiceKernelHarness normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-Swift-Compilation-Requirements -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernelHarness -Onone -enforce-exclusivity\=checked @/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList -DDEBUG -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -F /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks -F /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -sdk-module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule -validate-clang-modules-once -clang-build-session-file /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex/Session.modulevalidation -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json -Xcc -iquote -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap -Xcc -ivfsoverlay -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml -Xcc -iquote -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/include -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources-normal/arm64 -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/arm64 -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h -working-directory /tmp/k00-second-488e0666c/ios/VoiceKernelHarness -experimental-emit-module-separately -disable-cmo

Copy /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.swiftmodule /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.swiftmodule

Copy /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.abi.json /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.abi.json (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.abi.json /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.abi.json

SwiftMergeGeneratedHeaders /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/VoiceKernelHarness-Swift.h /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-swiftHeaderTool -arch arm64 /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/VoiceKernelHarness-Swift.h

Copy /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.swiftdoc /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftdoc (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftdoc /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.swiftdoc

Copy /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftsourceinfo (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftsourceinfo /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo

SwiftDriverJobDiscovery normal arm64 Compiling StateProjection.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling Replay.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling RecoveryPolicy.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling HealthSupervisor.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling Journal.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling KernelState.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling AudioGraph.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling AudioSessionAuthority.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling VoiceKernel.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriver\ Compilation VoiceKernel normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-Swift-Compilation -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernel -Onone -enforce-exclusivity\=checked @/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList -DSWIFT_PACKAGE -DDEBUG -DSWIFT_MODULE_RESOURCE_BUNDLE_UNAVAILABLE -DXcode -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -sdk-module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule -validate-clang-modules-once -clang-build-session-file /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex/Session.modulevalidation -package-name voicekernel -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/include -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources-normal/arm64 -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources/arm64 -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources -Xcc -DSWIFT_PACKAGE -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -working-directory /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj -experimental-emit-module-separately -disable-cmo

Ld /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.o normal (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -r -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -L/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -L/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -iframework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -iframework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -filelist /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.LinkFileList -nostdlib -Xlinker -object_path_lto -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_lto.o -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_dependency_info.dat -fobjc-link-runtime -L/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/iphoneos -L/usr/lib/swift -Xlinker -add_ast_path -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule @/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-linker-args.resp -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.o

ExtractAppIntentsMetadata (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsmetadataprocessor --toolchain-dir /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --module-name VoiceKernel --sdk-root /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk --xcode-version 17C529 --platform-family iOS --deployment-target 16.0 --bundle-identifier voicekernel.VoiceKernel --output /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.appintents --target-triple arm64-apple-ios16.0 --binary-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.o --dependency-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_dependency_info.dat --stringsdata-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/ExtractedAppShortcutsMetadata.stringsdata --source-file-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList --metadata-file-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyMetadataFileList --static-metadata-file-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyStaticMetadataFileList --swift-const-vals-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftConstValuesFileList --force --compile-time-extraction --deployment-aware-processing --validate-assistant-intents --no-app-shortcuts-localization
2026-09-11 11:44:12.962 appintentsmetadataprocessor[43250:24626998] Starting appintentsmetadataprocessor export
2026-09-11 11:44:13.032 appintentsmetadataprocessor[43250:24626998] Extracted no relevant App Intents symbols, skipping writing output

RegisterExecutionPolicyException /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.o (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernel
    builtin-RegisterExecutionPolicyException /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernel.o

Ld /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -install_name @rpath/VoiceKernelHarness.debug.dylib -dead_strip -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib

ProcessInfoPlistFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/Harness/Info.plist (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-infoPlistUtility /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/Harness/Info.plist -producttype com.apple.product-type.application -genpkginfo /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/PkgInfo -expandbuildsettings -format binary -platform iphoneos -requiredArchitecture arm64 -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist

SwiftDriverJobDiscovery normal arm64 Compiling VoiceKernelHarnessApp.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftDriverJobDiscovery normal arm64 Compiling HarnessModel.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftDriverJobDiscovery normal arm64 Compiling HarnessView.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftDriver\ Compilation VoiceKernelHarness normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-Swift-Compilation -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernelHarness -Onone -enforce-exclusivity\=checked @/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList -DDEBUG -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -F /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks -F /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -sdk-module-cache-path /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule -validate-clang-modules-once -clang-build-session-file /Users/soullab/Library/Developer/Xcode/DerivedData/ModuleCache.noindex/Session.modulevalidation -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json -Xcc -iquote -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap -Xcc -ivfsoverlay -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml -Xcc -iquote -Xcc /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/include -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources-normal/arm64 -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/arm64 -Xcc -I/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h -working-directory /tmp/k00-second-488e0666c/ios/VoiceKernelHarness -experimental-emit-module-separately -disable-cmo

Ld /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -L/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -filelist /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList -install_name @rpath/VoiceKernelHarness.debug.dylib -Xlinker -rpath -Xlinker /usr/lib/swift -Xlinker -rpath -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks -Xlinker -rpath -Xlinker @executable_path/Frameworks -dead_strip -Xlinker -object_path_lto -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_lto.o -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat -fobjc-link-runtime -L/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/iphoneos -L/usr/lib/swift -Xlinker -add_ast_path -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule @/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-linker-args.resp -Wl,-no_warn_duplicate_libraries -Xlinker -alias -Xlinker _main -Xlinker ___debug_main_executable_dylib_entry_point -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib -Xlinker -add_ast_path -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule @/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-linker-args.resp

ConstructStubExecutorLinkFileList /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    construct-stub-executor-link-file-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor_no_swift_entry_point.a /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor.a --output /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt
note: Using stub executor library with Swift entry point. (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

Ld /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -Xlinker -rpath -Xlinker @executable_path -Xlinker -rpath -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks -Xlinker -rpath -Xlinker @executable_path/Frameworks -rdynamic -Xlinker -no_deduplicate -e ___debug_blank_executor_main -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_dylib -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_instlnm -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt -Xlinker -filelist -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness

CopySwiftLibs /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-swiftStdLibTool --copy --verbose --scan-executable /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib --scan-folder /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Frameworks --scan-folder /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/PlugIns --scan-folder /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/SystemExtensions --scan-folder /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Extensions --platform iphoneos --toolchain /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --destination /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Frameworks --strip-bitcode --strip-bitcode-tool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/bitcode_strip --emit-dependency-info /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/SwiftStdLibToolInputDependencies.dep --filter-for-swift-os --back-deploy-swift-span
Ignoring --strip-bitcode because --sign was not passed

ExtractAppIntentsMetadata (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsmetadataprocessor --toolchain-dir /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --module-name VoiceKernelHarness --sdk-root /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk --xcode-version 17C529 --platform-family iOS --deployment-target 16.0 --bundle-identifier life.soullab.voicekernel.k00 --output /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app --target-triple arm64-apple-ios16.0 --binary-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness --dependency-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat --stringsdata-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/ExtractedAppShortcutsMetadata.stringsdata --source-file-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList --metadata-file-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList --static-metadata-file-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList --swift-const-vals-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList --compile-time-extraction --deployment-aware-processing --validate-assistant-intents --no-app-shortcuts-localization
2026-09-11 11:44:13.492 appintentsmetadataprocessor[43258:24627060] Starting appintentsmetadataprocessor export
2026-09-11 11:44:13.493 appintentsmetadataprocessor[43258:24627060] warning: Metadata extraction skipped. No AppIntents.framework dependency found.

AppIntentsSSUTraining (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsnltrainingprocessor --infoplist-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist --temp-dir-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/ssu --bundle-id life.soullab.voicekernel.k00 --product-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app --extracted-metadata-path /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Metadata.appintents --metadata-file-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList --archive-ssu-assets
2026-09-11 11:44:13.507 appintentsnltrainingprocessor[43259:24627061] Parsing options for appintentsnltrainingprocessor
2026-09-11 11:44:13.508 appintentsnltrainingprocessor[43259:24627061] No AppShortcuts found - Skipping.

RegisterExecutionPolicyException /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-RegisterExecutionPolicyException /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app

Validate /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-validationUtility /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app -shallow-bundle -infoplist-subpath Info.plist

Touch /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    /usr/bin/touch -c /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app

** BUILD SUCCEEDED **

```

## 6. signed device-targeted compile — verbatim

```text
Command line invocation:
    /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination id=00008140-00163D9922E0801C DEVELOPMENT_TEAM=ZVK2X646Z2 CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates build

Build settings from command line:
    CODE_SIGN_STYLE = Automatic
    DEVELOPMENT_TEAM = ZVK2X646Z2

Resolve Package Graph


Resolved source packages:
  VoiceKernel: /tmp/k00-second-488e0666c/ios/VoiceKernel

2026-09-11 11:49:09.576 xcodebuild[43521:24633806] [MT] IDERunDestination: Supported platforms for the buildables in the current scheme is empty.
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

Build description signature: 6cdcc0fac2acc02ac2a99bb1d1da6aef
Build description path: /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/XCBuildData/6cdcc0fac2acc02ac2a99bb1d1da6aef.xcbuilddata
ClangStatCache /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk /Users/soullab/Library/Developer/Xcode/DerivedData/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -o /Users/soullab/Library/Developer/Xcode/DerivedData/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache

WriteAuxiliaryFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/Entitlements.plist (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    write-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/Entitlements.plist

ProcessProductPackaging /Users/soullab/Library/Developer/Xcode/UserData/Provisioning\ Profiles/08a653d1-5ec3-4206-84fd-991a5fcc11c2.mobileprovision /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/embedded.mobileprovision (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-productPackagingUtility /Users/soullab/Library/Developer/Xcode/UserData/Provisioning\ Profiles/08a653d1-5ec3-4206-84fd-991a5fcc11c2.mobileprovision -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/embedded.mobileprovision

ProcessProductPackaging "" /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    
    Entitlements:
    
    {
    "application-identifier" = "ZVK2X646Z2.life.soullab.voicekernel.k00";
    "com.apple.developer.team-identifier" = ZVK2X646Z2;
    "get-task-allow" = 1;
}
    
    builtin-productPackagingUtility -entitlements -format xml -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent

ProcessProductPackagingDER /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent.der (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    /usr/bin/derq query -f xml -i /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent.der --raw

Ld /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -install_name @rpath/VoiceKernelHarness.debug.dylib -dead_strip -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat -Xlinker -no_adhoc_codesign -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib

ProcessInfoPlistFile /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/Harness/Info.plist (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-infoPlistUtility /tmp/k00-second-488e0666c/ios/VoiceKernelHarness/Harness/Info.plist -producttype com.apple.product-type.application -genpkginfo /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/PkgInfo -expandbuildsettings -format binary -platform iphoneos -requiredArchitecture arm64 -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist

Ld /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -L/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -filelist /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList -install_name @rpath/VoiceKernelHarness.debug.dylib -Xlinker -rpath -Xlinker /usr/lib/swift -Xlinker -rpath -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks -Xlinker -rpath -Xlinker @executable_path/Frameworks -dead_strip -Xlinker -object_path_lto -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_lto.o -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat -fobjc-link-runtime -L/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/iphoneos -L/usr/lib/swift -Xlinker -add_ast_path -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule @/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-linker-args.resp -Wl,-no_warn_duplicate_libraries -Xlinker -alias -Xlinker _main -Xlinker ___debug_main_executable_dylib_entry_point -Xlinker -no_adhoc_codesign -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib -Xlinker -add_ast_path -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule @/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-linker-args.resp

ConstructStubExecutorLinkFileList /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    construct-stub-executor-link-file-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor_no_swift_entry_point.a /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor.a --output /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt
note: Using stub executor library with Swift entry point. (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

Ld /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks -F/Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos -Xlinker -rpath -Xlinker @executable_path -Xlinker -rpath -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/PackageFrameworks -Xlinker -rpath -Xlinker @executable_path/Frameworks -rdynamic -Xlinker -no_deduplicate -e ___debug_blank_executor_main -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_dylib -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_instlnm -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt -Xlinker -filelist -Xlinker /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib -Xlinker -no_adhoc_codesign -o /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness

CopySwiftLibs /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-swiftStdLibTool --copy --verbose --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --scan-executable /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib --scan-folder /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Frameworks --scan-folder /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/PlugIns --scan-folder /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/SystemExtensions --scan-folder /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Extensions --platform iphoneos --toolchain /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --destination /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Frameworks --strip-bitcode --strip-bitcode-tool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/bitcode_strip --emit-dependency-info /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/SwiftStdLibToolInputDependencies.dep --filter-for-swift-os

ExtractAppIntentsMetadata (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsmetadataprocessor --toolchain-dir /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --module-name VoiceKernelHarness --sdk-root /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk --xcode-version 17C529 --platform-family iOS --deployment-target 16.0 --bundle-identifier life.soullab.voicekernel.k00 --output /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app --target-triple arm64-apple-ios16.0 --binary-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness --dependency-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat --stringsdata-file /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/ExtractedAppShortcutsMetadata.stringsdata --source-file-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList --metadata-file-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList --static-metadata-file-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList --swift-const-vals-list /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList --compile-time-extraction --deployment-aware-processing --validate-assistant-intents --no-app-shortcuts-localization
2026-09-11 11:49:13.902 appintentsmetadataprocessor[43541:24634147] Starting appintentsmetadataprocessor export
2026-09-11 11:49:13.903 appintentsmetadataprocessor[43541:24634147] warning: Metadata extraction skipped. No AppIntents.framework dependency found.

CodeSign /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    
    Signing Identity:     "Apple Development: Kelly Nezat (N9DTF6434L)"
    Provisioning Profile: "iOS Team Provisioning Profile: *"
                          (08a653d1-5ec3-4206-84fd-991a5fcc11c2)
    
    /usr/bin/codesign --force --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --timestamp\=none --generate-entitlement-der /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib

CodeSign /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    
    Signing Identity:     "Apple Development: Kelly Nezat (N9DTF6434L)"
    Provisioning Profile: "iOS Team Provisioning Profile: *"
                          (08a653d1-5ec3-4206-84fd-991a5fcc11c2)
    
    /usr/bin/codesign --force --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --timestamp\=none --generate-entitlement-der /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib

CodeSign /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    
    Signing Identity:     "Apple Development: Kelly Nezat (N9DTF6434L)"
    Provisioning Profile: "iOS Team Provisioning Profile: *"
                          (08a653d1-5ec3-4206-84fd-991a5fcc11c2)
    
    /usr/bin/codesign --force --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --entitlements /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent --timestamp\=none --generate-entitlement-der /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app

Validate /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/k00-second-488e0666c/ios/VoiceKernelHarness
    builtin-validationUtility /Users/soullab/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-frthvjuweijhogaxshekhihubdac/Build/Products/Debug-iphoneos/VoiceKernelHarness.app -shallow-bundle -infoplist-subpath Info.plist

** BUILD SUCCEEDED **

```

## Appendix A — destination discovery and first identifier-mismatch attempt

### Xcode destinations — verbatim

```text
Command line invocation:
    /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -showdestinations

Resolve Package Graph


Resolved source packages:
  VoiceKernel: /tmp/k00-second-488e0666c/ios/VoiceKernel

2026-09-11 11:45:51.003 xcodebuild[43360:24628646] [MT] IDERunDestination: Supported platforms for the buildables in the current scheme is empty.


	Available destinations for the "VoiceKernelHarness" scheme:
		{ platform:macOS, arch:arm64, variant:Designed for [iPad,iPhone], id:00006041-00146119217A801C, name:My Mac }
		{ platform:iOS, arch:arm64, id:00008140-00163D9922E0801C, name:Kelly Nezat’s iPhone }
		{ platform:iOS, id:dvtdevice-DVTiPhonePlaceholder-iphoneos:placeholder, name:Any iOS Device }
		{ platform:iOS Simulator, id:dvtdevice-DVTiOSDeviceSimulatorPlaceholder-iphonesimulator:placeholder, name:Any iOS Simulator Device }
		{ platform:iOS Simulator, arch:arm64, id:94202CD8-AA39-427A-8708-799BC9F1DE56, OS:26.2, name:iPad (A16) }
		{ platform:iOS Simulator, arch:arm64, id:4E89B914-6F1A-43C7-9225-205683A94CC8, OS:26.2, name:iPad Air 11-inch (M3) }
		{ platform:iOS Simulator, arch:arm64, id:F9EABAC6-FCE9-405E-A8F0-6B513B54BF46, OS:26.2, name:iPad Air 13-inch (M3) }
		{ platform:iOS Simulator, arch:arm64, id:D4082578-385A-4852-B784-8A3C148578C2, OS:26.2, name:iPad Pro 11-inch (M5) }
		{ platform:iOS Simulator, arch:arm64, id:9FF0C309-BC8B-4172-BAE8-ECEE560A0178, OS:26.2, name:iPad Pro 13-inch (M5) }
		{ platform:iOS Simulator, arch:arm64, id:9FE073A5-1F7A-4EA9-A1B0-56E0A7C8D84C, OS:26.2, name:iPad mini (A17 Pro) }
		{ platform:iOS Simulator, arch:arm64, id:55D8C670-533A-4184-B7E2-D6D7EDC280AB, OS:26.2, name:iPhone 16e }
		{ platform:iOS Simulator, arch:arm64, id:BADAF44C-689B-47B4-B45E-57C7C7846CD5, OS:26.2, name:iPhone 17 }
		{ platform:iOS Simulator, arch:arm64, id:7D2451FC-8C14-40D7-A222-60C6BD9BA0A3, OS:26.2, name:iPhone 17 Pro }
		{ platform:iOS Simulator, arch:arm64, id:8E1BBFCE-256A-4AE7-8A6A-3DF5C7C8AB90, OS:26.2, name:iPhone 17 Pro }
		{ platform:iOS Simulator, arch:arm64, id:843DEBF3-353A-45FA-B268-FDFDA7AFECAD, OS:26.2, name:iPhone 17 Pro Max }
		{ platform:iOS Simulator, arch:arm64, id:8E8FA105-059D-4899-B3DE-2BE8EDEA394B, OS:26.2, name:iPhone Air }
```

### First signed attempt using `devicectl` identifier — verbatim

```text
Command line invocation:
    /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination id=A0736AC8-793B-516F-AC72-C076DB6CEE38 DEVELOPMENT_TEAM=ZVK2X646Z2 CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates build

Build settings from command line:
    CODE_SIGN_STYLE = Automatic
    DEVELOPMENT_TEAM = ZVK2X646Z2

Resolve Package Graph


Resolved source packages:
  VoiceKernel: /tmp/k00-second-488e0666c/ios/VoiceKernel

2026-09-11 11:45:51.516 xcodebuild[43364:24628712] [MT] IDERunDestination: Supported platforms for the buildables in the current scheme is empty.
2026-09-11 11:46:51.844 xcodebuild[43364:24628712] Writing error result bundle to /var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/ResultBundle_2026-11-09_11-46-0051.xcresult
xcodebuild: error: Unable to find a device matching the provided destination specifier:
		{ id:A0736AC8-793B-516F-AC72-C076DB6CEE38 }

	The requested device could not be found because no available devices matched the request.

	Available destinations for the "VoiceKernelHarness" scheme:
		{ platform:macOS, arch:arm64, variant:Designed for [iPad,iPhone], id:00006041-00146119217A801C, name:My Mac }
		{ platform:iOS, arch:arm64, id:00008140-00163D9922E0801C, name:Kelly Nezat’s iPhone }
		{ platform:iOS, id:dvtdevice-DVTiPhonePlaceholder-iphoneos:placeholder, name:Any iOS Device }
		{ platform:iOS Simulator, id:dvtdevice-DVTiOSDeviceSimulatorPlaceholder-iphonesimulator:placeholder, name:Any iOS Simulator Device }
		{ platform:iOS Simulator, arch:arm64, id:94202CD8-AA39-427A-8708-799BC9F1DE56, OS:26.2, name:iPad (A16) }
		{ platform:iOS Simulator, arch:arm64, id:4E89B914-6F1A-43C7-9225-205683A94CC8, OS:26.2, name:iPad Air 11-inch (M3) }
		{ platform:iOS Simulator, arch:arm64, id:F9EABAC6-FCE9-405E-A8F0-6B513B54BF46, OS:26.2, name:iPad Air 13-inch (M3) }
		{ platform:iOS Simulator, arch:arm64, id:D4082578-385A-4852-B784-8A3C148578C2, OS:26.2, name:iPad Pro 11-inch (M5) }
		{ platform:iOS Simulator, arch:arm64, id:9FF0C309-BC8B-4172-BAE8-ECEE560A0178, OS:26.2, name:iPad Pro 13-inch (M5) }
		{ platform:iOS Simulator, arch:arm64, id:9FE073A5-1F7A-4EA9-A1B0-56E0A7C8D84C, OS:26.2, name:iPad mini (A17 Pro) }
		{ platform:iOS Simulator, arch:arm64, id:55D8C670-533A-4184-B7E2-D6D7EDC280AB, OS:26.2, name:iPhone 16e }
		{ platform:iOS Simulator, arch:arm64, id:BADAF44C-689B-47B4-B45E-57C7C7846CD5, OS:26.2, name:iPhone 17 }
		{ platform:iOS Simulator, arch:arm64, id:7D2451FC-8C14-40D7-A222-60C6BD9BA0A3, OS:26.2, name:iPhone 17 Pro }
		{ platform:iOS Simulator, arch:arm64, id:8E1BBFCE-256A-4AE7-8A6A-3DF5C7C8AB90, OS:26.2, name:iPhone 17 Pro }
		{ platform:iOS Simulator, arch:arm64, id:843DEBF3-353A-45FA-B268-FDFDA7AFECAD, OS:26.2, name:iPhone 17 Pro Max }
		{ platform:iOS Simulator, arch:arm64, id:8E8FA105-059D-4899-B3DE-2BE8EDEA394B, OS:26.2, name:iPhone Air }
```
