# KERNEL-00 / VPIO-02 · MAC-COMPILE-01 — 2026-09-14 — GREEN on `ac12dedf4`

**Act:** founder-authorized VPIO-02 / FORMAT-RESOLUTION-01 MAC-COMPILE-01 on exactly `ac12dedf4b7b4efc9855c08bb4285a704e7039f1`.
**Execution:** Mac Studio · fresh detached worktree `/private/tmp/vpio02-mac-compile-01-ac12dedf4` · fresh external DerivedData `/private/tmp/vpio02-mac-compile-01-ac12dedf4-derived`.
**Toolchain:** Xcode 26.3 (`17C529`) · Swift 6.2.4 · XcodeGen 2.46.0 · iPhoneOS SDK 26.2.
**Authority boundary:** compile + artifact custody only. No install, no launch, no VPIO-02 witness, no journal pull, no sample, no N=30 act.

## Verdict

```text
subject                  ac12dedf4b7b4efc9855c08bb4285a704e7039f1
swift build              PASS
swift test               PASS · 27/27
source gate              PASS · 53/53
xcodegen generate        PASS
unsigned iOS build       PASS
signed iOS build         PASS
artifact custody         COMPLETE
phone install            NOT RUN
phone launch             NOT RUN
sample                   NOT RUN
```

The stale source comment `Eleven steps on this subject` was preserved exactly as ruled; no source correction occurred inside this act. The one known `try?` unused-result warning appeared in the unsigned iOS build and did not fail compilation.

## Artifact custody

```text
dylib UUID               B346F448-A2A8-30DB-9683-B732A80D7899
dylib SHA-256            e963a23cd17fd12e273671023b01c74ea5fbc4e8a7fb22168a0cee2562bd66ec
executable SHA-256       9fe56504131e0b023162c62a6bd60541053b14262c9d3075a15a08dbe6c7805a
manifest SHA-256         1459283c175e243c90459b2724c2be7362cf6dd4c95c191bd15c443ec8b98410
manifest files           7
bundle id                life.soullab.voicekernel.vpio02
display name             VoiceKernel VPIO-02
team identifier          ZVK2X646Z2
```

The dylib UUID is new and does not match VPIO-01's `E8074AD1-D179-3267-A15C-142D033A9665`; no identity anomaly occurred.

## Post-compile worktree footprint

`xcodegen generate` rewrote the tracked harness `Info.plist`, and the custody recipe created the manifest at the detached worktree root. Neither is a source change to the compile subject and neither is committed from that worktree. The exact `git status --porcelain` output is preserved in the custody transcript below.

## Outputs verbatim

### 0. Fresh detached worktree + toolchain

````text
$ cd /Users/soullab/MAIA-SOVEREIGN
$ git fetch origin claude/voice-2026-census-01
From https://github.com/SoullabTech/Sovereign
 * branch                claude/voice-2026-census-01 -> FETCH_HEAD
$ test "$(git rev-parse ac12dedf4b7b4efc9855c08bb4285a704e7039f1)" = "ac12dedf4b7b4efc9855c08bb4285a704e7039f1"
$ git worktree add --detach /private/tmp/vpio02-mac-compile-01-ac12dedf4 ac12dedf4b7b4efc9855c08bb4285a704e7039f1
Preparing worktree (detached HEAD ac12dedf4)
Updating files:  54% (7388/13440)Updating files:  55% (7392/13440)Updating files:  56% (7527/13440)Updating files:  57% (7661/13440)Updating files:  58% (7796/13440)Updating files:  59% (7930/13440)Updating files:  60% (8064/13440)Updating files:  61% (8199/13440)Updating files:  62% (8333/13440)Updating files:  63% (8468/13440)Updating files:  64% (8602/13440)Updating files:  65% (8736/13440)Updating files:  66% (8871/13440)Updating files:  67% (9005/13440)Updating files:  68% (9140/13440)Updating files:  69% (9274/13440)Updating files:  70% (9408/13440)Updating files:  71% (9543/13440)Updating files:  72% (9677/13440)Updating files:  73% (9812/13440)Updating files:  74% (9946/13440)Updating files:  75% (10080/13440)Updating files:  76% (10215/13440)Updating files:  77% (10349/13440)Updating files:  78% (10484/13440)Updating files:  79% (10618/13440)Updating files:  80% (10752/13440)Updating files:  81% (10887/13440)Updating files:  82% (11021/13440)Updating files:  83% (11156/13440)Updating files:  84% (11290/13440)Updating files:  85% (11424/13440)Updating files:  86% (11559/13440)Updating files:  87% (11693/13440)Updating files:  88% (11828/13440)Updating files:  89% (11962/13440)Updating files:  90% (12096/13440)Updating files:  91% (12231/13440)Updating files:  92% (12365/13440)Updating files:  93% (12500/13440)Updating files:  94% (12634/13440)Updating files:  95% (12768/13440)Updating files:  96% (12903/13440)Updating files:  97% (13037/13440)Updating files:  98% (13172/13440)Updating files:  99% (13306/13440)Updating files: 100% (13440/13440)Updating files: 100% (13440/13440), done.
HEAD is now at ac12dedf4 voice-2026(kernel-00): VPIO-02 / FORMAT-RESOLUTION-01 — the §3 guard earns its evidence from a probe lifecycle (initialize → read → uninitialize → requireValid) before anything is armed or started; 14-step trace with the probe visible; custody life.soullab.voicekernel.vpio02; gate 53/53 read before commit; NOT COMPILED
$ cd /private/tmp/vpio02-mac-compile-01-ac12dedf4 && git rev-parse HEAD && git status --porcelain
ac12dedf4b7b4efc9855c08bb4285a704e7039f1
$ ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
$ xcodebuild -version
Xcode 26.3
Build version 17C529
$ xcrun swift --version
swift-driver version: 1.127.15 Apple Swift version 6.2.4 (swiftlang-6.2.4.1.4 clang-1700.6.4.2)
Target: arm64-apple-macosx15.0
$ xcodegen --version
Version: 2.46.0
$ xcrun --sdk iphoneos --show-sdk-version
26.2

````

### 1. swift build

````text
$ ( cd ios/VoiceKernel && xcrun swift build )
Building for debugging...
[0/2] Write sources
[1/2] Write swift-version--58304C5D6DBC2206.txt
[3/13] Compiling VoiceKernel KernelState.swift
[4/13] Compiling VoiceKernel VoiceKernel.swift
[5/13] Compiling VoiceKernel AudioSessionAuthority.swift
[6/13] Compiling VoiceKernel Journal.swift
[7/13] Compiling VoiceKernel Replay.swift
[8/13] Compiling VoiceKernel RecoveryPolicy.swift
[9/13] Compiling VoiceKernel RouteComparison.swift
[10/13] Compiling VoiceKernel StateProjection.swift
[11/13] Compiling VoiceKernel HealthSupervisor.swift
[12/13] Emitting module VoiceKernel
[13/13] Compiling VoiceKernel AudioGraph.swift
Build complete! (3.68s)

````

### 2. swift test

````text
$ ( cd ios/VoiceKernel && xcrun swift test )
[0/1] Planning build
Building for debugging...
[0/5] Write sources
[1/6] /private/tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/.build/arm64-apple-macosx/debug/VoiceKernelPackageTests.derived/runner.swift
[2/6] Write sources
[3/6] Write swift-version--58304C5D6DBC2206.txt
[5/8] Emitting module VoiceKernelTests
[6/8] Compiling VoiceKernelTests PureLogicTests.swift
[7/10] Compiling VoiceKernelPackageTests runner.swift
[8/10] Emitting module VoiceKernelPackageTests
[8/10] Write Objects.LinkFileList
[9/10] Linking VoiceKernelPackageTests
Build complete! (6.74s)
Test Suite 'All tests' started at 2026-09-14 17:02:59.402.
Test Suite 'VoiceKernelPackageTests.xctest' started at 2026-09-14 17:02:59.402.
Test Suite 'ConfigurationChangeSeamTests' started at 2026-09-14 17:02:59.402.
Test Case '-[VoiceKernelTests.ConfigurationChangeSeamTests testConfigurationChangeIsBoundedByTheSameRatifiedBudget]' started.
Test Case '-[VoiceKernelTests.ConfigurationChangeSeamTests testConfigurationChangeIsBoundedByTheSameRatifiedBudget]' passed (0.001 seconds).
Test Suite 'ConfigurationChangeSeamTests' passed at 2026-09-14 17:02:59.404.
	 Executed 1 test, with 0 failures (0 unexpected) in 0.001 (0.001) seconds
Test Suite 'HealthSupervisorTests' started at 2026-09-14 17:02:59.404.
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
Test Suite 'HealthSupervisorTests' passed at 2026-09-14 17:02:59.405.
	 Executed 7 tests, with 0 failures (0 unexpected) in 0.001 (0.001) seconds
Test Suite 'InputFormatPreconditionTests' started at 2026-09-14 17:02:59.405.
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testInvalidFormatThrowsASwiftErrorCarryingTheObservedNumbers]' started.
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testInvalidFormatThrowsASwiftErrorCarryingTheObservedNumbers]' passed (0.001 seconds).
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testResolvedHardwareFormatIsValid]' started.
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testResolvedHardwareFormatIsValid]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testTheWitnessedZeroHertzFormatIsInvalid]' started.
Test Case '-[VoiceKernelTests.InputFormatPreconditionTests testTheWitnessedZeroHertzFormatIsInvalid]' passed (0.000 seconds).
Test Suite 'InputFormatPreconditionTests' passed at 2026-09-14 17:02:59.406.
	 Executed 3 tests, with 0 failures (0 unexpected) in 0.001 (0.001) seconds
Test Suite 'RecoveryPolicyTests' started at 2026-09-14 17:02:59.406.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetAndBackoffAreTheRatifiedSchedule]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetAndBackoffAreTheRatifiedSchedule]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetIsPerFaultClassAndSlidesOverSixtySeconds]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testBudgetIsPerFaultClassAndSlidesOverSixtySeconds]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testGenerationsAreMonotonicAcrossReasons]' started.
Test Case '-[VoiceKernelTests.RecoveryPolicyTests testGenerationsAreMonotonicAcrossReasons]' passed (0.000 seconds).
Test Suite 'RecoveryPolicyTests' passed at 2026-09-14 17:02:59.407.
	 Executed 3 tests, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'ReplayTests' started at 2026-09-14 17:02:59.407.
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
Test Suite 'ReplayTests' passed at 2026-09-14 17:02:59.408.
	 Executed 8 tests, with 0 failures (0 unexpected) in 0.001 (0.001) seconds
Test Suite 'RouteComparisonTests' started at 2026-09-14 17:02:59.408.
Test Case '-[VoiceKernelTests.RouteComparisonTests testAMissingBaselineIsNeverTheSameRoute]' started.
Test Case '-[VoiceKernelTests.RouteComparisonTests testAMissingBaselineIsNeverTheSameRoute]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RouteComparisonTests testDataSourceAlternationDoesNotChangeRouteIdentity]' started.
Test Case '-[VoiceKernelTests.RouteComparisonTests testDataSourceAlternationDoesNotChangeRouteIdentity]' passed (0.000 seconds).
Test Case '-[VoiceKernelTests.RouteComparisonTests testDifferentPortsAreADifferentRoute]' started.
Test Case '-[VoiceKernelTests.RouteComparisonTests testDifferentPortsAreADifferentRoute]' passed (0.000 seconds).
Test Suite 'RouteComparisonTests' passed at 2026-09-14 17:02:59.408.
	 Executed 3 tests, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'SnapshotRulesTests' started at 2026-09-14 17:02:59.408.
Test Case '-[VoiceKernelTests.SnapshotRulesTests testListeningIsDisplayedOnlyWithHealthyInput]' started.
Test Case '-[VoiceKernelTests.SnapshotRulesTests testListeningIsDisplayedOnlyWithHealthyInput]' passed (0.000 seconds).
Test Suite 'SnapshotRulesTests' passed at 2026-09-14 17:02:59.408.
	 Executed 1 test, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'StartTraceTests' started at 2026-09-14 17:02:59.408.
Test Case '-[VoiceKernelTests.StartTraceTests testTheTraceNamesExactlyTheFourteenVPIO02SeamsInOrder]' started.
Test Case '-[VoiceKernelTests.StartTraceTests testTheTraceNamesExactlyTheFourteenVPIO02SeamsInOrder]' passed (0.000 seconds).
Test Suite 'StartTraceTests' passed at 2026-09-14 17:02:59.409.
	 Executed 1 test, with 0 failures (0 unexpected) in 0.000 (0.000) seconds
Test Suite 'VoiceKernelPackageTests.xctest' passed at 2026-09-14 17:02:59.409.
	 Executed 27 tests, with 0 failures (0 unexpected) in 0.005 (0.006) seconds
Test Suite 'All tests' passed at 2026-09-14 17:02:59.409.
	 Executed 27 tests, with 0 failures (0 unexpected) in 0.005 (0.007) seconds
◇ Test run started.
↳ Testing Library Version: 1501
↳ Target Platform: arm64e-apple-macos14.0
✔ Test run with 0 tests in 0 suites passed after 0.001 seconds.

````

### 3. source gate

````text
$ npx jest --config jest.config.js __tests__/voice-kernel-00-source-gates.test.ts
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
    ✓ the package has no dependencies and the harness is not a member of ios/App; the VPIO subject carries its own bundle id
  KERNEL-00 · VOICE-10 — output has identity and a cancellable lifetime
    ✓ the substrate schedules only under an OutputStreamID and exposes cancel(id) (1 ms)
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
    ✓ D: a configuration-change handler never directly invokes rebuildGraph, and the route_recovery cause is gone (32 ms)
    ✓ B: a configuration change reaches the graph only through the existing RecoveryPolicy as its own fault class (42 ms)
    ✓ A: a notification after exit is journalled and dropped before any generation or graph exists (18 ms)
    ✓ C: voice processing is a journalled, pre-Enter-only kernel command; the harness only projects it (ACTIVE — unchanged files) (1 ms)
  KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1) · PRE-WITNESS-04 — the expected VP change is classified one-shot, deferred, and decided by the supervisor
    ✓ C: classification is a pure, generation-scoped, one-shot function over ports (data source is evidence, not identity) (15 ms)
    ✓ B: the deferred branch consumes the expectation and touches neither the graph nor the recovery policy (14 ms)
    ✓ the expectation is armed only at a graph start and retired when the generation is healthy (14 ms)
    ✓ no new fault class, budget, timer or threshold: the caller set is closed and Replay names the deferral as an automatic act (57 ms)
    ✓ §2.3: the observation and the samples carry the provenance that proves why C fired (14 ms)
  KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1 / 4596b9bdb) · PRE-WITNESS-05 Phase A — instrumentation only: mutating startup order unchanged, added calls read-only, no new timer
    ✓ the MUTATING startup call order is unchanged from 35b0f61d0 (15 ms)
    ✓ ADDED calls are observation/read-only or journal instrumentation only; NO new timer · mutation · recovery act · configuration act (31 ms)
    ✓ the kernel observes isRunning on the EXISTING tick only (no new timer) and journals the first callback per generation (15 ms)
    ✓ the Phase-A subject 4596b9bdb (reproduced as R1) carries the 14-step trace WITH input_format_before_vp — the shape the ledger reads (15 ms)
  KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1) · PRE-WITNESS-05 P5-B0 — removal control: the pre-VP input-format read is gone and NOTHING else moved
    ✓ no input-format read of any kind precedes setVoiceProcessingEnabled inside start() (23 ms)
    ✓ exactly ONE input.outputFormat(forBus: 0) read remains in start(), after VP enable and before requireValid (the 35b0f61d0 position) (15 ms)
    ✓ the seam input_format_before_vp does not exist in any non-test kernel or harness source of the subject (207 ms)
    ✓ all other Phase-A reads are KEPT: VP read-back, isRunning immediate, elapsed-ms timing, after-VP format (13 ms)
  KERNEL-00 · VPIO-01 — the substrate is the one file's interior; the invariant substrate is byte-identical
    ✓ authority · supervisor · policy · state · projection · journal · replay · harness are byte-identical to 24a6fcfa1 (plan §1) (165 ms)
    ✓ the substitution is confined: ConfigurationChange.swift is gone, RouteComparison.swift is pure, and only AudioGraph.swift links Audio Toolbox (1 ms)
    ✓ the substrate drives the Voice-Processing I/O unit: VPIO subtype, both I/O elements enabled, VP = bypass property, format read from (Input scope, el 1) before arming, client formats on (Output,1)/(Input,0), pull input + render callback + property listener, initialize before start
    ✓ G9 (founder header adjudication 2026-09-14): the input buffer is sized by the unit's MaximumFramesPerSlice, read after the formats and before any callback is armed; a larger request is refused, never truncated; no fixed capacity anywhere (1 ms)
    ✓ the start trace names exactly the fourteen VPIO-02 seams, in order (the format probe visible), and every step is emitted
    ✓ truthful vocabulary (census §3): ioRunning / io_running_observed / io_format_changed present; every engine-meaning record and field absent from the kernel (1 ms)
    ✓ io_format_changed is an observation, never an act: exit guard first, generation guard, no graph or policy call in the handler
    ✓ route recovery is sourced from the authority's route_changed observation, guarded for eligibility, same ports = evidence only, through the existing policy only (plan §11 item 4 / census §5)
    ✓ the pure-logic tests follow the subject: RouteComparisonTests present, the classifier tests gone, the fourteen-seam VPIO-02 trace pinned
  KERNEL-00 · DRIVER-01 — automate the witness, not the organism
    ✓ the engine subject 24a6fcfa1 (the app under test for stages A/B/C) is still byte-identical in history to the pinned tree hashes (274 ms)
    ✓ the driver is an external instrument: XCTest only, no VoiceKernel, no launch args/env on the app under test, no UserDefaults, no debugger hooks (2 ms)
    ✓ the ledger classifier is closed to the four classes plus two non-audio rows, and never steers a batch (3 ms)
  KERNEL-00 · VPIO-01B — witness preparation: instrument-only subject plumbing; the organism moves only inside the VPIO-02 envelope
    ✓ VPIO-02 envelope (founder adjudication 2026-09-14): relative to the VPIO-01 compile subject 85e5e7154, exactly AudioGraph.swift · PureLogicTests.swift · project.yml moved; kernel, authority, supervisor, policy, state, projection, journal, replay, Package.swift and every harness behavioural file are byte-identical; no file added under those roots (251 ms)
    ✓ the explicit subject table is the same in the ledger, the driver and the batch: p5b0/phase-a → .k00 · "VoiceKernel K00" · engineRunning; vpio-01 → .vpio01 · "VoiceKernel VPIO-01" · ioRunning; no default bundle, no fall-through (2 ms)
    ✓ the VPIO first-install gate fails closed: pinned identity × all fields, manifest hashes + file set, just-in-time ABSENT read, authority at invocation, NO uninstall — every refusal lexically before the install verb; historical subjects unchanged (1 ms)
    ✓ the ledger's offline synthetic VPIO self-test passes (exit 0) — and the VPIO subject rejects a 13-step engine journal (51 ms)
  KERNEL-00 · VOICE-07 — the harness is a projection
    ✓ HarnessModel holds no voice state and reduces only kernel snapshots
    ✓ the harness reaches the journal only through the actor, never the recorder (C2)
    ✓ the view displays "listening" only via the snapshot rule, never from a local flag
  KERNEL-00 · VPIO-02 — the format probe lifecycle: initialize → read → uninitialize → guard, before anything is armed or started
    ✓ the probe brackets the read and is uninitialized before the guard, the client formats, any callback, the real initialize and the start
    ✓ the read is still the documented property on (Input scope, element 1); the client format is set from the OBSERVED rate; no session-derived rate, no hard-coded rate, no alternate scope, no engine fallback, no retry (1 ms)
    ✓ the three probe seams are traced with outcome/status/elapsed and the read is stamped afterProbeInitialize; a post-probe refusal ends at the uninitialize seam
    ✓ the custody identity is the new subject: bundle life.soullab.voicekernel.vpio02 · display name "VoiceKernel VPIO-02"; the frozen .vpio01 identity survives only in the VPIO-01 witness instrument and records (58 ms)

Test Suites: 1 passed, 1 total
Tests:       53 passed, 53 total
Snapshots:   0 total
Time:        1.765 s
Ran all test suites matching /__tests__\/voice-kernel-00-source-gates.test.ts/i.

````

### 4. xcodegen generate

````text
$ ( cd ios/VoiceKernelHarness && xcodegen generate )
⚙️  Generating plists...
⚙️  Generating project...
⚙️  Writing project...
Created project at /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj

````

### 5. unsigned generic-iOS build

````text
$ ( cd ios/VoiceKernelHarness && xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination 'generic/platform=iOS' -derivedDataPath /private/tmp/vpio02-mac-compile-01-ac12dedf4-derived CODE_SIGNING_ALLOWED=NO build )
Command line invocation:
    /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination generic/platform=iOS -derivedDataPath /private/tmp/vpio02-mac-compile-01-ac12dedf4-derived CODE_SIGNING_ALLOWED=NO build

Build settings from command line:
    CODE_SIGNING_ALLOWED = NO

Resolve Package Graph


Resolved source packages:
  VoiceKernel: /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel

2026-09-14 17:03:55.780 xcodebuild[55122:29838944] [MT] IDERunDestination: Supported platforms for the buildables in the current scheme is empty.
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

Build description signature: 2089f95df9444d9ee9e11ee7b773b34a
Build description path: /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/XCBuildData/2089f95df9444d9ee9e11ee7b773b34a.xcbuilddata
ClangStatCache /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk /tmp/vpio02-mac-compile-01-ac12dedf4-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache

CreateBuildDirectory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products

CreateBuildDirectory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex

CreateBuildDirectory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules

CreateBuildDirectory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/ExplicitPrecompiledModules
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/ExplicitPrecompiledModules

CreateBuildDirectory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml

CreateBuildDirectory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos

CreateBuildDirectory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-create-build-directory /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.hmap

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-target-headers.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyStaticMetadataFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyStaticMetadataFileList

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyMetadataFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyMetadataFileList

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.LinkFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.LinkFileList

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftConstValuesFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftConstValuesFileList

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList

MkDir /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    /bin/mkdir -p /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app

Copy /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos/VoiceKernel.modulemap /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.modulemap /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos

SwiftDriver VoiceKernel normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-SwiftDriver -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernel -Onone -enforce-exclusivity\=checked @/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList -DSWIFT_PACKAGE -DDEBUG -DSWIFT_MODULE_RESOURCE_BUNDLE_UNAVAILABLE -DXcode -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Session.modulevalidation -package-name voicekernel -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources/arm64 -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources -Xcc -DSWIFT_PACKAGE -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -working-directory /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj -experimental-emit-module-separately -disable-cmo

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_float-69SG5OZHFXGRV2GIVUEKGYNS1.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_stdbool-1VYS5127WVNRYN0QMN7W7OU91.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/ptrcheck-LV0TO08RIPQOYIE93GE7UFX1.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_stdarg-ECN3403W6SMZ5S2V56HBLU6GX.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_SwiftConcurrencyShims-AR8M9ABTMDVIVI43WXA1F6VDD.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/SwiftShims-8FI70J6R80SVX1TV5HMZA7CEP.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/ptrauth-C34Q6I4LLU8PEF76WXCRCW2DW.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_AvailabilityInternal-9IDQQKXHUDXBNW4RPMZNVUY4Y.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_stddef-177OK3U393F81RTCEHE7P7HK.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_DarwinFoundation1-ESP8TECAJOYK46JIGPDR9FR6H.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_DarwinFoundation2-EX62OYBEX3A2H26P1CA3OLQI6.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_limits-6V1WCH4N29GNG3VM4AZVPTGOJ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/sys_types-917MRRXG9B6J6TL95XB8LPJR4.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_tgmath-AKAHDY66YYOVTUJY3SG4K5FWY.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_stdint-BKDNZARL3SL84EBMTRVZBUH4H.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_stdatomic-4YVWW6HYZFSRZQGUMBT53RXK.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_intrinsics-318RIF99JITAUEZPR7LI4E9TA.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_DarwinFoundation3-ANVG91KC0UFMITMNKQP7G8YC6.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_inttypes-8UL29AUI5TIKK7HWO52GPVRFU.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Darwin-7EB8FH2T7P4C7IMZGJYO342V.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/simd-164ZYW8ECTT0LJR4FLDJP891J.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/MachO-4A2WI8ZXDV5BE81W93IEA3JKU.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/ObjectiveC-B4GZCQI4TJSP22Q8AH5OCFSPB.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/os_object-7AO2VDYSGCRHGN8DLJ2C0Q8EB.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/os_workgroup-D2ISSO992WRBO4W5IDYO32UG9.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Dispatch-7FZMEVP140JH7M86RFFG0S9R3.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/XPC-AQS4IIU29IEVH1Z56VW4PT1AI.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/dnssd-8LJFKOYOINH50NGN09KFQOP9Q.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreFoundation-AYUHCMWDGTJVVTE6WQYK971PF.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/os-210LOIX9OHY225A2JR2EXK04.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CFNetwork-9G1OU3DKXHE0QKAAITPL7Y7TR.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreGraphics-2DOYEFNWBFJ50MC7I952NOFG9.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Security-38ENUH0J3XBAQD2IERET3ZNSL.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreAudioTypes-5M8LRHGFQ6PKCB6V4YJJ1VX6W.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreAudio-1TP2NO3KRK7DJCE26KN4PS2TZ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Foundation-BJSAE3NYEKF7DG891MLKFH9DK.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/ImageIO-A0LEJHTWNKHJH5Z6SHKO7L4Z5.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Network-DALTANVGIYMQ0I31RW8S5AH1A.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/IOSurface-4IW53SF2RZIPG606ZIT1FTNUV.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/UniformTypeIdentifiers-ACYLLMPHSK50LGJIOYNBZL1LY.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreMIDI-CLU1EUV7D1DY9M0GHWWVAA4DR.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/OpenGLES-9KIU79SLJ9OKEG9PADMT3E748.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Metal-A7U93XAG33KX9ZV5HHOP2SQVC.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/AudioToolbox-HHP58QLPSRLO0DJO3Y4XGQG3.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/AVRouting-5NFIL8SV4WPYXBUPHHEKCLR0B.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreVideo-5E7QOXIJ9QGIHFVYEVVFVPNFB.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/QuartzCore-9R1CK89UE1IWPQC16GIMOTLZF.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreImage-3U9ZTWRXSCQMLSY3JQA3NCB0.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreMedia-8XMOTAL22LQQEKRNJFSEGFP69.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/MediaToolbox-3EHW1T901H43EN28E6I3K7FV3.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/AVFAudio-BXSLVU6WAM5U57CY7UUK2RD5C.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/AVFoundation-AF1A213XF5ZBVV8HF7DHU0C12.pcm

SwiftCompile normal arm64 Compiling\ KernelState.swift /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/KernelState.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/KernelState.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ RecoveryPolicy.swift /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/RecoveryPolicy.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/RecoveryPolicy.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftEmitModule normal arm64 Emitting\ module\ for\ VoiceKernel (in target 'VoiceKernel' from project 'VoiceKernel')

EmitSwiftModule normal arm64 (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ VoiceKernel.swift /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift (in target 'VoiceKernel' from project 'VoiceKernel')
SwiftCompile normal arm64 /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    
/tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift:139:9: warning: result of 'try?' is unused
        try? session?.release(cause: "leaveConversation", causeSeq: cmd)
        ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

SwiftCompile normal arm64 Compiling\ Replay.swift /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/Replay.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/Replay.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ StateProjection.swift /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/StateProjection.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/StateProjection.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ AudioGraph.swift /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ Journal.swift /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/Journal.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/Journal.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ HealthSupervisor.swift /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/HealthSupervisor.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/HealthSupervisor.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ RouteComparison.swift /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/RouteComparison.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftCompile normal arm64 /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/RouteComparison.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftCompile normal arm64 Compiling\ AudioSessionAuthority.swift /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/AudioSessionAuthority.swift (in target 'VoiceKernel' from project 'VoiceKernel')
SwiftCompile normal arm64 /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel/Sources/VoiceKernel/AudioSessionAuthority.swift (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    

SwiftDriverJobDiscovery normal arm64 Emitting module for VoiceKernel (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriver\ Compilation\ Requirements VoiceKernel normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-Swift-Compilation-Requirements -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernel -Onone -enforce-exclusivity\=checked @/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList -DSWIFT_PACKAGE -DDEBUG -DSWIFT_MODULE_RESOURCE_BUNDLE_UNAVAILABLE -DXcode -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Session.modulevalidation -package-name voicekernel -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources/arm64 -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources -Xcc -DSWIFT_PACKAGE -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -working-directory /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj -experimental-emit-module-separately -disable-cmo

SwiftMergeGeneratedHeaders /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos/VoiceKernel-Swift.h /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    builtin-swiftHeaderTool -arch arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/GeneratedModuleMaps-iphoneos/VoiceKernel-Swift.h

Copy /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.abi.json /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.abi.json (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.abi.json /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.abi.json

Copy /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftdoc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftdoc (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftdoc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftdoc

Copy /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftmodule /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/arm64-apple-ios.swiftmodule

Copy /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftsourceinfo (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftsourceinfo /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo

SwiftDriver VoiceKernelHarness normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-SwiftDriver -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernelHarness -Onone -enforce-exclusivity\=checked @/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList -DDEBUG -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -F /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json -Xcc -iquote -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap -Xcc -ivfsoverlay -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml -Xcc -iquote -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/arm64 -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h -working-directory /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness -experimental-emit-module-separately -disable-cmo

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_SwiftConcurrencyShims-3HAPF5BS1WKA81SZXHKURI3O.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_stddef-3PPQPLBDGZKIO41WR6P7BUKHN.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_stdbool-AGTB0CMU83DUV4D89Z8FV6SYO.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/SwiftShims-CYENOFHARA5EYRLVGRI57X7JD.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/ptrcheck-7O8C3KTRBI26FYE95X7UCI0KS.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/ptrauth-CP6GZ0VV8YQ02AORCXSVXJV8H.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_float-EMXLMU3HEY8XNMBI1E937ASWP.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/DeveloperToolsSupport-1HH25W3P2SFBY583464O38S40.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_AvailabilityInternal-1UPF775XGSTHYK5RTCLBBFVZF.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_stdarg-DUXAL4BYX40HBNYW5DNKCEEEQ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_DarwinFoundation1-9X4I4W52Q40WZ8BEJF66W29PN.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_DarwinFoundation2-88R9FJPEMAJ28YOQIFEN2CKQ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_limits-5TY7GMEM0MP5RXFMYXG5RYU8J.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_stdint-DIR7Q18EYYAAVLLZ0EDZNV5I1.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_tgmath-8UX69FEA11HEU9UWFCRAYRNH1.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/sys_types-BLZG354VKX7HAHQ5XXGKY7QGH.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_intrinsics-5T2Y0YO16WDCRBWQFX5BSNWES.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_DarwinFoundation3-6ZH7UXZNY2E3RB057WZM21FW0.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_stdatomic-14OUJ8NIM06HFXH44MTBN191V.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/_Builtin_inttypes-1PVPNRBTNGU1VT6Z7I2VK9L3M.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Darwin-AVPD5S6IUHF2N0607M81974EN.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/simd-87HW6BXKNUSAQPE6JXVSDM8PJ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/MachO-DDZQ5FJA6IOND45JE2XWE0FN5.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/ObjectiveC-5YZQ4OEYOQAE2WBT5HBRJC152.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Spatial-9EYVTBDOHYVR6WOZ4MO3MHI9I.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/os_object-7D9YEQF41AYGNOW77CBD9II23.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/os_workgroup-50J7C0BZAXA6P58M1AXLKWZOP.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Dispatch-22H4EQSB1F2F1EOX5E7017136.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/XPC-6SWB0KXQ6P0U88H76UUWD9BVQ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreFoundation-A2YYJ3R1F05N3J54NJHA6QYF3.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/dnssd-5EU7XSESNUQVUQSUGPKHLB103.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/os-D94TYG32HZDAV8UIFUOQLO7K8.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreGraphics-4LQ28SFBKBUT3Z9SY77X8T4DS.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CFNetwork-7LDHK89EAMS9JIJWTIINENFIV.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreAudioTypes-5OVR0L7QZKKGZTNKMQ4I9A6WJ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Security-ENM3CTHU5420N5DVPAHVUSAKO.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreAudio-4C2WASX23IIZU6LIQ7SZ7E6MY.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreText-3ERITL9JH1SRQQAUVUV46X0NA.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/ImageIO-AIBTP73E1KXRCELDAPGBIANOC.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Foundation-AE3VJ59Z3WTNH4PTMY5M2TUPH.pcm

SwiftDriverJobDiscovery normal arm64 Compiling RouteComparison.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling StateProjection.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling Replay.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling RecoveryPolicy.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling HealthSupervisor.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling Journal.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling KernelState.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriverJobDiscovery normal arm64 Compiling AudioGraph.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/UserNotifications-3WW1W5NT1LC1QUUEQD8VNU9CA.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/UIUtilities-9QARG16S09RA2QS7X3IN0POR5.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/OSLog-76QU3EETVEKKXUE09AFEMKPD1.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Network-19NB2EVXF4144QQEDE82FNUDG.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreMIDI-4N0URBGPIVE1T7EV92SDUUFAC.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/FileProvider-7QESED8JJV5GAH2EH4JAS0DAR.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreData-3HNKVGTIFXTL4TR2ZI129TECE.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Accessibility-3CA7HPF5J3YBB582JWZXLP8RD.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/DataDetection-EFWHL2GZMC81MJVFICKMRVONU.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/UniformTypeIdentifiers-6UMC9VABCXIHDH3DE3PGDJ5M1.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreTransferable-Q0F5WF0KLFJ6XLX6VZDUWTIW.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/IOSurface-BZ4R12HJOIW31A80B299YUU2C.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Symbols-7DV8GZVM92S2D3O5O8NZDX9NQ.pcm

SwiftDriverJobDiscovery normal arm64 Compiling VoiceKernel.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Metal-EXTZ26POHQQJRFC9AP6XJF6EM.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/OpenGLES-1W1CIV2UA1074VH4SP2OUEJOO.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/AVRouting-A8NL0COWXR1PP11STM2QDL0MN.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/AudioToolbox-88T2QT8ESJF1DG61KP1YPIH7A.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreVideo-8SSMQ3H3MM3E94UYXKCXWPXNG.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreImage-1YBJ08QEJYY6FTXD5B9LX0VI.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/QuartzCore-177NUVW0XRBWKVIWEO75H9XW2.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/CoreMedia-3AYFGCTXAMQQR7B3GTG91NFU3.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/SwiftUICore-56D4K73G4DT6HZF5OGMHSFNF3.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/AVFAudio-8ZUPOH5JSE7RUUODHEASJTP5S.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/UIKit-AFVEN6M4PKWZZTUB1308HOY6W.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/MediaToolbox-95V7UPM4WHZRNRD3DFKDZ57QK.pcm

SwiftDriverJobDiscovery normal arm64 Compiling AudioSessionAuthority.swift (in target 'VoiceKernel' from project 'VoiceKernel')

SwiftDriver\ Compilation VoiceKernel normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    builtin-Swift-Compilation -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernel -Onone -enforce-exclusivity\=checked @/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList -DSWIFT_PACKAGE -DDEBUG -DSWIFT_MODULE_RESOURCE_BUNDLE_UNAVAILABLE -DXcode -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Session.modulevalidation -package-name voicekernel -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_const_extract_protocols.json -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources/arm64 -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/DerivedSources -Xcc -DSWIFT_PACKAGE -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-Swift.h -working-directory /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj -experimental-emit-module-separately -disable-cmo

Ld /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.o normal (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -r -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -L/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -L/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -iframework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -iframework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -filelist /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.LinkFileList -nostdlib -Xlinker -object_path_lto -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_lto.o -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_dependency_info.dat -fobjc-link-runtime -L/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/iphoneos -L/usr/lib/swift -Xlinker -add_ast_path -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule @/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-linker-args.resp -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.o

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/AVFoundation-95YJ8R2VV75CRZKF3HH6FSDN4.pcm

ExtractAppIntentsMetadata (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsmetadataprocessor --toolchain-dir /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --module-name VoiceKernel --sdk-root /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk --xcode-version 17C529 --platform-family iOS --deployment-target 16.0 --bundle-identifier voicekernel.VoiceKernel --output /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.appintents --target-triple arm64-apple-ios16.0 --binary-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.o --dependency-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel_dependency_info.dat --stringsdata-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/ExtractedAppShortcutsMetadata.stringsdata --source-file-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftFileList --metadata-file-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyMetadataFileList --static-metadata-file-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/VoiceKernel.DependencyStaticMetadataFileList --swift-const-vals-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.SwiftConstValuesFileList --force --compile-time-extraction --deployment-aware-processing --validate-assistant-intents --no-app-shortcuts-localization
2026-09-14 17:04:00.089 appintentsmetadataprocessor[55299:29839887] Starting appintentsmetadataprocessor export
2026-09-14 17:04:00.163 appintentsmetadataprocessor[55299:29839887] Extracted no relevant App Intents symbols, skipping writing output

RegisterExecutionPolicyException /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.o (in target 'VoiceKernel' from project 'VoiceKernel')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel
    builtin-RegisterExecutionPolicyException /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernel.o

Ld /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -install_name @rpath/VoiceKernelHarness.debug.dylib -dead_strip -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib

ProcessInfoPlistFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/Harness/Info.plist (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-infoPlistUtility /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/Harness/Info.plist -producttype com.apple.product-type.application -genpkginfo /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/PkgInfo -expandbuildsettings -format binary -platform iphoneos -requiredArchitecture arm64 -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/SwiftUI-AWHMBCGG0FWDW0WJ3NWRCXXD9.pcm

SwiftEmitModule normal arm64 Emitting\ module\ for\ VoiceKernelHarness (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

EmitSwiftModule normal arm64 (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    

SwiftCompile normal arm64 Compiling\ HarnessView.swift /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/Harness/HarnessView.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
SwiftCompile normal arm64 /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/Harness/HarnessView.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    

SwiftCompile normal arm64 Compiling\ VoiceKernelHarnessApp.swift /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/Harness/VoiceKernelHarnessApp.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftCompile normal arm64 /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/Harness/VoiceKernelHarnessApp.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    

SwiftCompile normal arm64 Compiling\ HarnessModel.swift /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/Harness/HarnessModel.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftCompile normal arm64 /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/Harness/HarnessModel.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    

SwiftDriverJobDiscovery normal arm64 Emitting module for VoiceKernelHarness (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftDriver\ Compilation\ Requirements VoiceKernelHarness normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-Swift-Compilation-Requirements -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernelHarness -Onone -enforce-exclusivity\=checked @/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList -DDEBUG -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -F /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json -Xcc -iquote -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap -Xcc -ivfsoverlay -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml -Xcc -iquote -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/arm64 -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h -working-directory /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness -experimental-emit-module-separately -disable-cmo

SwiftMergeGeneratedHeaders /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/VoiceKernelHarness-Swift.h /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-swiftHeaderTool -arch arm64 /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/VoiceKernelHarness-Swift.h

Copy /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.swiftdoc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftdoc (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftdoc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.swiftdoc

Copy /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.swiftmodule /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.swiftmodule

Copy /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.abi.json /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.abi.json (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.abi.json /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/arm64-apple-ios.abi.json

Copy /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftsourceinfo (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftsourceinfo /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo

SwiftDriverJobDiscovery normal arm64 Compiling VoiceKernelHarnessApp.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftDriverJobDiscovery normal arm64 Compiling HarnessModel.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftDriverJobDiscovery normal arm64 Compiling HarnessView.swift (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

SwiftDriver\ Compilation VoiceKernelHarness normal arm64 com.apple.xcode.tools.swift.compiler (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-Swift-Compilation -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name VoiceKernelHarness -Onone -enforce-exclusivity\=checked @/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList -DDEBUG -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -F /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_const_extract_protocols.json -Xcc -iquote -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-generated-files.hmap -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-own-target-headers.hmap -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-all-non-framework-target-headers.hmap -Xcc -ivfsoverlay -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness-09c65f5dfc7399442b67b093cd14845f-VFS-iphoneos/all-product-headers.yaml -Xcc -iquote -Xcc /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-project-headers.hmap -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/arm64 -Xcc -I/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-Swift.h -working-directory /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness -experimental-emit-module-separately -disable-cmo

Ld /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -L/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -filelist /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList -install_name @rpath/VoiceKernelHarness.debug.dylib -Xlinker -rpath -Xlinker /usr/lib/swift -Xlinker -rpath -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks -Xlinker -rpath -Xlinker @executable_path/Frameworks -dead_strip -Xlinker -object_path_lto -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_lto.o -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat -fobjc-link-runtime -L/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/iphoneos -L/usr/lib/swift -Xlinker -add_ast_path -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule @/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-linker-args.resp -Wl,-no_warn_duplicate_libraries -framework AudioToolbox -Xlinker -alias -Xlinker _main -Xlinker ___debug_main_executable_dylib_entry_point -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib -Xlinker -add_ast_path -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule @/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-linker-args.resp

ConstructStubExecutorLinkFileList /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    construct-stub-executor-link-file-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor_no_swift_entry_point.a /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor.a --output /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt
note: Using stub executor library with Swift entry point. (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

Ld /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -Xlinker -rpath -Xlinker @executable_path -Xlinker -rpath -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks -Xlinker -rpath -Xlinker @executable_path/Frameworks -rdynamic -Xlinker -no_deduplicate -e ___debug_blank_executor_main -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_dylib -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_instlnm -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt -Xlinker -filelist -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness

CopySwiftLibs /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-swiftStdLibTool --copy --verbose --scan-executable /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib --scan-folder /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Frameworks --scan-folder /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/PlugIns --scan-folder /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/SystemExtensions --scan-folder /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Extensions --platform iphoneos --toolchain /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --destination /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Frameworks --strip-bitcode --strip-bitcode-tool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/bitcode_strip --emit-dependency-info /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/SwiftStdLibToolInputDependencies.dep --filter-for-swift-os --back-deploy-swift-span
Ignoring --strip-bitcode because --sign was not passed

ExtractAppIntentsMetadata (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsmetadataprocessor --toolchain-dir /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --module-name VoiceKernelHarness --sdk-root /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk --xcode-version 17C529 --platform-family iOS --deployment-target 16.0 --bundle-identifier life.soullab.voicekernel.vpio02 --output /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app --target-triple arm64-apple-ios16.0 --binary-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness --dependency-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat --stringsdata-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/ExtractedAppShortcutsMetadata.stringsdata --source-file-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList --metadata-file-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList --static-metadata-file-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList --swift-const-vals-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList --compile-time-extraction --deployment-aware-processing --validate-assistant-intents --no-app-shortcuts-localization
2026-09-14 17:04:01.685 appintentsmetadataprocessor[55312:29839989] Starting appintentsmetadataprocessor export
2026-09-14 17:04:01.686 appintentsmetadataprocessor[55312:29839989] warning: Metadata extraction skipped. No AppIntents.framework dependency found.

AppIntentsSSUTraining (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsnltrainingprocessor --infoplist-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist --temp-dir-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/ssu --bundle-id life.soullab.voicekernel.vpio02 --product-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app --extracted-metadata-path /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Metadata.appintents --metadata-file-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList --archive-ssu-assets
2026-09-14 17:04:01.699 appintentsnltrainingprocessor[55313:29839991] Parsing options for appintentsnltrainingprocessor
2026-09-14 17:04:01.700 appintentsnltrainingprocessor[55313:29839991] No AppShortcuts found - Skipping.

RegisterExecutionPolicyException /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-RegisterExecutionPolicyException /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app

Validate /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-validationUtility /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app -shallow-bundle -infoplist-subpath Info.plist

Touch /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    /usr/bin/touch -c /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app

** BUILD SUCCEEDED **


````

### 6. signed iOS build

````text
$ ( cd ios/VoiceKernelHarness && xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination id=00008140-00163D9922E0801C -derivedDataPath /private/tmp/vpio02-mac-compile-01-ac12dedf4-derived DEVELOPMENT_TEAM=ZVK2X646Z2 CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates build )
Command line invocation:
    /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination id=00008140-00163D9922E0801C -derivedDataPath /private/tmp/vpio02-mac-compile-01-ac12dedf4-derived DEVELOPMENT_TEAM=ZVK2X646Z2 CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates build

Build settings from command line:
    CODE_SIGN_STYLE = Automatic
    DEVELOPMENT_TEAM = ZVK2X646Z2

Resolve Package Graph


Resolved source packages:
  VoiceKernel: /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernel

2026-09-14 17:04:21.390 xcodebuild[55355:29840701] [MT] IDERunDestination: Supported platforms for the buildables in the current scheme is empty.
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

Build description signature: 69497c78c2eb5ad2564bf3ac81bbaaca
Build description path: /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/XCBuildData/69497c78c2eb5ad2564bf3ac81bbaaca.xcbuilddata
ClangStatCache /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk /tmp/vpio02-mac-compile-01-ac12dedf4-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache

WriteAuxiliaryFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/Entitlements.plist (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    write-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/DerivedSources/Entitlements.plist

ProcessProductPackaging /Users/soullab/Library/Developer/Xcode/UserData/Provisioning\ Profiles/08a653d1-5ec3-4206-84fd-991a5fcc11c2.mobileprovision /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/embedded.mobileprovision (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-productPackagingUtility /Users/soullab/Library/Developer/Xcode/UserData/Provisioning\ Profiles/08a653d1-5ec3-4206-84fd-991a5fcc11c2.mobileprovision -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/embedded.mobileprovision

ProcessProductPackaging "" /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    
    Entitlements:
    
    {
    "application-identifier" = "ZVK2X646Z2.life.soullab.voicekernel.vpio02";
    "com.apple.developer.team-identifier" = ZVK2X646Z2;
    "get-task-allow" = 1;
}
    
    builtin-productPackagingUtility -entitlements -format xml -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent

ProcessProductPackagingDER /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent.der (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    /usr/bin/derq query -f xml -i /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent.der --raw

Ld /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -install_name @rpath/VoiceKernelHarness.debug.dylib -dead_strip -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat -Xlinker -no_adhoc_codesign -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib

Ld /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -L/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -filelist /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.LinkFileList -install_name @rpath/VoiceKernelHarness.debug.dylib -Xlinker -rpath -Xlinker /usr/lib/swift -Xlinker -rpath -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks -Xlinker -rpath -Xlinker @executable_path/Frameworks -dead_strip -Xlinker -object_path_lto -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_lto.o -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat -fobjc-link-runtime -L/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/iphoneos -L/usr/lib/swift -Xlinker -add_ast_path -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.swiftmodule @/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness-linker-args.resp -Wl,-no_warn_duplicate_libraries -framework AudioToolbox -Xlinker -alias -Xlinker _main -Xlinker ___debug_main_executable_dylib_entry_point -Xlinker -no_adhoc_codesign -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib -Xlinker -add_ast_path -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel.swiftmodule @/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernel.build/Debug-iphoneos/VoiceKernel.build/Objects-normal/arm64/VoiceKernel-linker-args.resp

ProcessInfoPlistFile /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/Harness/Info.plist (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-infoPlistUtility /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness/Harness/Info.plist -producttype com.apple.product-type.application -genpkginfo /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/PkgInfo -expandbuildsettings -format binary -platform iphoneos -requiredArchitecture arm64 -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Info.plist

ConstructStubExecutorLinkFileList /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    construct-stub-executor-link-file-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor_no_swift_entry_point.a /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor.a --output /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt
note: Using stub executor library with Swift entry point. (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')

Ld /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness normal (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks -F/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos -Xlinker -rpath -Xlinker @executable_path -Xlinker -rpath -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/PackageFrameworks -Xlinker -rpath -Xlinker @executable_path/Frameworks -rdynamic -Xlinker -no_deduplicate -e ___debug_blank_executor_main -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_dylib -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibPath-normal-arm64.txt -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_instlnm -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-DebugDylibInstallName-normal-arm64.txt -Xlinker -filelist -Xlinker /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness-ExecutorLinkFileList-normal-arm64.txt /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib -Xlinker -no_adhoc_codesign -o /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness

CopySwiftLibs /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-swiftStdLibTool --copy --verbose --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --scan-executable /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib --scan-folder /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Frameworks --scan-folder /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/PlugIns --scan-folder /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/SystemExtensions --scan-folder /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Extensions --platform iphoneos --toolchain /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --destination /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/Frameworks --strip-bitcode --strip-bitcode-tool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/bitcode_strip --emit-dependency-info /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/SwiftStdLibToolInputDependencies.dep --filter-for-swift-os

ExtractAppIntentsMetadata (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsmetadataprocessor --toolchain-dir /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --module-name VoiceKernelHarness --sdk-root /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk --xcode-version 17C529 --platform-family iOS --deployment-target 16.0 --bundle-identifier life.soullab.voicekernel.vpio02 --output /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app --target-triple arm64-apple-ios16.0 --binary-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness --dependency-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness_dependency_info.dat --stringsdata-file /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/ExtractedAppShortcutsMetadata.stringsdata --source-file-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftFileList --metadata-file-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyMetadataFileList --static-metadata-file-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.DependencyStaticMetadataFileList --swift-const-vals-list /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/Objects-normal/arm64/VoiceKernelHarness.SwiftConstValuesFileList --compile-time-extraction --deployment-aware-processing --validate-assistant-intents --no-app-shortcuts-localization
2026-09-14 17:04:22.505 appintentsmetadataprocessor[55372:29840955] Starting appintentsmetadataprocessor export
2026-09-14 17:04:22.506 appintentsmetadataprocessor[55372:29840955] warning: Metadata extraction skipped. No AppIntents.framework dependency found.

CodeSign /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    
    Signing Identity:     "Apple Development: Kelly Nezat (N9DTF6434L)"
    Provisioning Profile: "iOS Team Provisioning Profile: *"
                          (08a653d1-5ec3-4206-84fd-991a5fcc11c2)
    
    /usr/bin/codesign --force --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --timestamp\=none --generate-entitlement-der /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib

CodeSign /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    
    Signing Identity:     "Apple Development: Kelly Nezat (N9DTF6434L)"
    Provisioning Profile: "iOS Team Provisioning Profile: *"
                          (08a653d1-5ec3-4206-84fd-991a5fcc11c2)
    
    /usr/bin/codesign --force --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --timestamp\=none --generate-entitlement-der /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/__preview.dylib

CodeSign /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    
    Signing Identity:     "Apple Development: Kelly Nezat (N9DTF6434L)"
    Provisioning Profile: "iOS Team Provisioning Profile: *"
                          (08a653d1-5ec3-4206-84fd-991a5fcc11c2)
    
    /usr/bin/codesign --force --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --entitlements /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Intermediates.noindex/VoiceKernelHarness.build/Debug-iphoneos/VoiceKernelHarness.build/VoiceKernelHarness.app.xcent --timestamp\=none --generate-entitlement-der /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app

Validate /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app (in target 'VoiceKernelHarness' from project 'VoiceKernelHarness')
    cd /tmp/vpio02-mac-compile-01-ac12dedf4/ios/VoiceKernelHarness
    builtin-validationUtility /tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app -shallow-bundle -infoplist-subpath Info.plist

** BUILD SUCCEEDED **


````

### 7. artifact custody

````text
$ P=/private/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app
$ dwarfdump --uuid "$P/VoiceKernelHarness.debug.dylib"
UUID: B346F448-A2A8-30DB-9683-B732A80D7899 (arm64) /private/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib
$ shasum -a 256 "$P/VoiceKernelHarness.debug.dylib" "$P/VoiceKernelHarness"
e963a23cd17fd12e273671023b01c74ea5fbc4e8a7fb22168a0cee2562bd66ec  /private/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness.debug.dylib
9fe56504131e0b023162c62a6bd60541053b14262c9d3075a15a08dbe6c7805a  /private/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app/VoiceKernelHarness
$ ( cd "$P" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > KERNEL-00_VPIO-02_MAC-COMPILE-01_2026-09-14.manifest.sha256
$ shasum -a 256 KERNEL-00_VPIO-02_MAC-COMPILE-01_2026-09-14.manifest.sha256
1459283c175e243c90459b2724c2be7362cf6dd4c95c191bd15c443ec8b98410  KERNEL-00_VPIO-02_MAC-COMPILE-01_2026-09-14.manifest.sha256
$ wc -l KERNEL-00_VPIO-02_MAC-COMPILE-01_2026-09-14.manifest.sha256
       7 KERNEL-00_VPIO-02_MAC-COMPILE-01_2026-09-14.manifest.sha256
$ /usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' -c 'Print CFBundleDisplayName' "$P/Info.plist"
life.soullab.voicekernel.vpio02
VoiceKernel VPIO-02
$ codesign -dv "$P" 2>&1 | grep -E 'Identifier|Authority|TeamIdentifier'
Identifier=life.soullab.voicekernel.vpio02
TeamIdentifier=ZVK2X646Z2
$ git status --porcelain
 M ios/VoiceKernelHarness/Harness/Info.plist
?? KERNEL-00_VPIO-02_MAC-COMPILE-01_2026-09-14.manifest.sha256

````

## Manifest contents verbatim

````text
d5b4874c372694469787759930a482a189dd1745633b8615bd7c4c97277aaee1  ./Info.plist
82502191c9484b04d685374f9879a0066069c49b8acae7a04b01d38d07e8eca0  ./PkgInfo
9fe56504131e0b023162c62a6bd60541053b14262c9d3075a15a08dbe6c7805a  ./VoiceKernelHarness
e963a23cd17fd12e273671023b01c74ea5fbc4e8a7fb22168a0cee2562bd66ec  ./VoiceKernelHarness.debug.dylib
8c75fe9132a48caadce0477d8ca29b70cb4e0198e515d1a24839733edba2d742  ./_CodeSignature/CodeResources
cec03fc4d7cad41420ffb576258eb2069ce92c28f40b3f98b76deb3acc446082  ./__preview.dylib
25e33e51802415fe894535c3612ffb635dcbcf1d938907f9301242ef3deb4621  ./embedded.mobileprovision

````

## Standing

VPIO-02 source at `ac12dedf4` is **COMPILE GREEN** and the signed artifact identity is in custody. This record authorizes nothing downstream. VPIO-02 instrument plumbing remains HELD; install, launch, first physiological sample, and N=30 remain NOT AUTHORIZED. VPIO-01 remains CLOSED with its installed `.vpio01` artifact frozen as evidence. Historical K00/R1 remains untouched. KERNEL-00 is not accepted; KERNEL-01, BENCH-01, BRIDGE-01 and MIGRATE-01 remain CLOSED; JOP-04 remains UNTOUCHED.
