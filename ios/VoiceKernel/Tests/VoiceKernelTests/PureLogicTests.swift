// KERNEL-00 · pure-logic tests. Run on the Mac Studio:
//   cd ios/VoiceKernel && swift test
// These exercise the parts of the organism that need no device: the
// supervisor's windows (K00-07/08), the recovery budget and backoff (K00-10),
// generation gating (K00-09), and trace replay with causal parents (K00-17).
// They are not the device witness; they are the reason the device witness can
// be believed.
import XCTest
@testable import VoiceKernel

final class HealthSupervisorTests: XCTestCase {
    func testEntryBecomesHealthyOnFirstLiveInput() {
        var h = HealthSupervisor()
        h.beginGeneration(1, nowMs: 0)
        XCTAssertEqual(h.inputFlow, .unknown)
        h.observeInput(InputObservation(generation: 1, timeMs: 50, frames: 1024, rms: 0.002, peak: 0.01))
        XCTAssertEqual(h.inputFlow, .healthy)
        XCTAssertEqual(h.tick(nowMs: 100), .none)
    }

    func testQuietRoomIsHealthyNotDead() {
        // Noise floor ≠ digital zero (SURVEY-01 §8).
        var h = HealthSupervisor()
        h.beginGeneration(1, nowMs: 0)
        for t in stride(from: 10, through: 5_000, by: 20) {
            h.observeInput(InputObservation(generation: 1, timeMs: Int64(t), frames: 1024, rms: 0.0004, peak: 0.002))
        }
        XCTAssertEqual(h.inputFlow, .healthy)
        XCTAssertEqual(h.tick(nowMs: 5_010), .none)
    }

    func testDigitalZeroIsDeadWithinTheRatifiedWindow() {
        // K00-07: ≤ 2 000 ms of digital zero → dead + recovery requested.
        var h = HealthSupervisor()
        h.beginGeneration(1, nowMs: 0)
        h.observeInput(InputObservation(generation: 1, timeMs: 10, frames: 1024, rms: 0.01, peak: 0.05))
        XCTAssertEqual(h.inputFlow, .healthy)
        var verdict: HealthVerdict = .none
        for t in stride(from: 30, through: 2_100, by: 20) {
            h.observeInput(InputObservation(generation: 1, timeMs: Int64(t), frames: 1024, rms: 0, peak: 0))
            verdict = h.tick(nowMs: Int64(t))
            if case .inputDead = verdict { break }
        }
        guard case .inputDead(let since) = verdict else { return XCTFail("expected inputDead, got \(verdict)") }
        XCTAssertGreaterThanOrEqual(since, 2_000)
        XCTAssertLessThan(since, 2_100)
        XCTAssertEqual(h.inputFlow, .dead)
    }

    func testMissingCallbacksAreDeadToo() {
        var h = HealthSupervisor()
        h.beginGeneration(1, nowMs: 0)
        h.observeInput(InputObservation(generation: 1, timeMs: 10, frames: 1024, rms: 0.01, peak: 0.05))
        XCTAssertEqual(h.tick(nowMs: 1_500), .none)
        XCTAssertEqual(h.inputFlow, .suspect)
        guard case .inputDead = h.tick(nowMs: 2_100) else { return XCTFail("cadence gap must be dead") }
    }

    func testEntryTimesOutAtRatifiedWindow() {
        var h = HealthSupervisor()
        h.beginGeneration(1, nowMs: 0)
        XCTAssertEqual(h.tick(nowMs: 1_400), .none)
        guard case .entryTimedOut(let waited) = h.tick(nowMs: 1_500) else { return XCTFail("entry must time out at 1500 ms") }
        XCTAssertEqual(waited, 1_500)
    }

    func testStalledOutputWithinRatifiedWindow() {
        // K00-08: ≤ 1 000 ms without progress while rendering → stalled.
        var h = HealthSupervisor()
        h.beginGeneration(1, nowMs: 0)
        h.observeInput(InputObservation(generation: 1, timeMs: 10, frames: 1024, rms: 0.01, peak: 0.05))
        let id = OutputStreamID("s1")
        h.beginRendering(id, nowMs: 100)
        h.observeOutput(OutputObservation(generation: 1, timeMs: 200, streamId: id, framesRendered: 4_800, framesScheduled: 144_000))
        h.observeInput(InputObservation(generation: 1, timeMs: 300, frames: 1024, rms: 0.01, peak: 0.05))
        XCTAssertEqual(h.tick(nowMs: 900), .none)
        h.observeInput(InputObservation(generation: 1, timeMs: 1_150, frames: 1024, rms: 0.01, peak: 0.05))
        guard case .outputStalled(let sid, let since) = h.tick(nowMs: 1_200) else { return XCTFail("expected stall") }
        XCTAssertEqual(sid, id)
        XCTAssertGreaterThanOrEqual(since, 1_000)
        XCTAssertEqual(h.outputFlow, .stalled)
    }

    func testStaleGenerationObservationsAreRejected() {
        // K00-09 at the supervisor: an observation from generation 1 cannot touch generation 2.
        var h = HealthSupervisor()
        h.beginGeneration(2, nowMs: 0)
        XCTAssertFalse(h.observeInput(InputObservation(generation: 1, timeMs: 10, frames: 1024, rms: 0.01, peak: 0.05)))
        XCTAssertEqual(h.inputFlow, .unknown)
        XCTAssertTrue(h.observeInput(InputObservation(generation: 2, timeMs: 10, frames: 1024, rms: 0.01, peak: 0.05)))
        XCTAssertEqual(h.inputFlow, .healthy)
    }
}

final class RecoveryPolicyTests: XCTestCase {
    func testBudgetAndBackoffAreTheRatifiedSchedule() {
        // K00-10: 3 per fault class per 60 s; 500 / 1000 / 2000 ms; then degraded.
        var p = RecoveryPolicy()
        guard case .retry(let a1, 1, let g1) = p.decide(faultClass: "input_dead", nowMs: 0) else { return XCTFail() }
        guard case .retry(let a2, 2, let g2) = p.decide(faultClass: "input_dead", nowMs: 1_000) else { return XCTFail() }
        guard case .retry(let a3, 3, let g3) = p.decide(faultClass: "input_dead", nowMs: 3_000) else { return XCTFail() }
        XCTAssertEqual([a1, a2, a3], [500, 1_000, 2_000])
        XCTAssertEqual([g1, g2, g3], [1, 2, 3])
        guard case .degraded(let cause, let attempts) = p.decide(faultClass: "input_dead", nowMs: 6_000) else { return XCTFail("4th must degrade") }
        XCTAssertEqual(cause, "input_dead")
        XCTAssertEqual(attempts, 3)
    }

    func testBudgetIsPerFaultClassAndSlidesOverSixtySeconds() {
        // C1 (MAC-COMPILE-01): the window is SLIDING, not epoch-based. Attempts
        // at 0 / 1 000 / 2 000 ms: at 61 000 ms the 2 000 ms attempt is only
        // 59 s old and still counts; at 62 001 ms all three have aged out.
        var p = RecoveryPolicy()
        for t in [0, 1_000, 2_000] { _ = p.decide(faultClass: "input_dead", nowMs: Int64(t)) }
        guard case .retry = p.decide(faultClass: "output_stalled", nowMs: 3_000) else { return XCTFail("other class has its own budget") }
        guard case .degraded = p.decide(faultClass: "input_dead", nowMs: 4_000) else { return XCTFail() }
        // 60 001 ms: the attempt at 0 has aged out; 1 000 and 2 000 remain → 2 in window → a retry is allowed as attempt 3.
        XCTAssertEqual(p.attemptsInWindow(faultClass: "input_dead", nowMs: 60_001), 2)
        guard case .retry(_, 3, _) = p.decide(faultClass: "input_dead", nowMs: 60_001) else { return XCTFail("sliding window: 2 remain, so attempt 3 is lawful") }
        // Now attempts at 1 000, 2 000, 60 001 are in window → the next decide before 61 001 must degrade.
        guard case .degraded = p.decide(faultClass: "input_dead", nowMs: 60_500) else { return XCTFail("3 in window → degraded") }
        // At 122 002 ms every attempt (latest 60 001) is ≥ 60 s old → fresh attempt 1.
        guard case .retry(_, 1, _) = p.decide(faultClass: "input_dead", nowMs: 122_002) else { return XCTFail("window fully aged out") }
    }

    func testGenerationsAreMonotonicAcrossReasons() {
        var p = RecoveryPolicy()
        let g1 = p.nextGeneration()
        guard case .retry(_, _, let g2) = p.decide(faultClass: "x", nowMs: 0) else { return XCTFail() }
        let g3 = p.nextGeneration()
        XCTAssertEqual([g1, g2, g3], [1, 2, 3])
        p.clearBudget()
        XCTAssertEqual(p.nextGeneration(), 4, "clearing the budget never rewinds generations")
    }
}

final class ReplayTests: XCTestCase {
    private func ev(_ seq: Int, _ gen: Int, _ event: String, from: String? = nil, to: String? = nil,
                    cause: String? = "c", causeSeq: Int? = nil) -> JournalEvent {
        JournalEvent(seq: seq, session: "t", generation: gen, timeMonotonicMs: Int64(seq), component: "x", event: event,
                     from: from, to: to, cause: cause, causeSeq: causeSeq)
    }

    func testLawfulCausalRunReplaysClean() {
        let events = [
            ev(1, 1, "command", cause: "enterConversation"),
            ev(2, 1, "floor_transition", from: "idle", to: "entering", causeSeq: 1),
            ev(3, 1, "session_category_set", cause: "enterConversation", causeSeq: 1),
            ev(4, 1, "session_activated", cause: "enterConversation", causeSeq: 3),
            ev(5, 1, "session_configured", cause: "enterConversation", causeSeq: 4),
            ev(6, 1, "graph_started", cause: "enterConversation", causeSeq: 5),
            ev(7, 1, "input_flow", from: "unknown", to: "healthy", cause: "observation"),
            ev(8, 1, "floor_transition", from: "entering", to: "listening", causeSeq: 7),
            ev(9, 1, "command", cause: "playTone"),
            ev(10, 1, "stream_scheduled", cause: "command:playTone", causeSeq: 9),
            ev(11, 1, "floor_transition", from: "listening", to: "maiaSpeaking", causeSeq: 10),
            ev(12, 1, "command", cause: "cancel"),
            ev(13, 1, "stream_cancelled", cause: "command:cancel", causeSeq: 12),
            ev(14, 1, "floor_transition", from: "maiaSpeaking", to: "listening", causeSeq: 13),
            ev(15, 1, "stream_cancel_measured", cause: "render_tap", causeSeq: 13),
            ev(16, 1, "input_health_sample", cause: "sample"),
            ev(17, 1, "recovery_requested", cause: "input_dead", causeSeq: 16),
            ev(18, 1, "recovery_scheduled", cause: "input_dead", causeSeq: 17),
            ev(19, 1, "floor_transition", from: "listening", to: "recovering", causeSeq: 18),
            ev(20, 1, "recovery_started", cause: "input_dead", causeSeq: 18),
            ev(21, 2, "graph_started", cause: "recovery:input_dead", causeSeq: 20),
            ev(22, 2, "graph_rebuilt", cause: "recovery:input_dead", causeSeq: 20),
            ev(23, 2, "stale_callback_dropped", cause: "generation_mismatch"),
            ev(24, 2, "input_flow", from: "unknown", to: "healthy", cause: "observation"),
            ev(25, 2, "floor_transition", from: "recovering", to: "listening", causeSeq: 24),
            ev(26, 2, "command", cause: "leaveConversation"),
            ev(27, 2, "floor_transition", from: "listening", to: "idle", causeSeq: 26),
        ]
        let r = StateReplayer.replay(events)
        XCTAssertTrue(r.passes, "\(r)")
        XCTAssertEqual(r.finalFloor, .idle)
        XCTAssertEqual(r.transitions, 7)
        XCTAssertEqual(r.staleCallbacksDropped, 1)
        XCTAssertEqual(r.generationsSeen, [1, 2])
    }

    func testOrphanTransitionFails() {
        let r = StateReplayer.replay([
            ev(1, 1, "command", cause: "enterConversation"),
            ev(2, 1, "floor_transition", from: "idle", to: "entering", causeSeq: 1),
            ev(3, 1, "floor_transition", from: "listening", to: "maiaSpeaking", causeSeq: 1),   // from ≠ current
        ])
        XCTAssertFalse(r.passes)
        XCTAssertEqual(r.orphanTransitions.count, 1)
    }

    // PRE-WITNESS-03 §A (K00-W4): moved here because `ev` is this class's helper (C4, MAC-COMPILE-04).
    func testPostExitRecoveryEdgeIsAnOrphan() {
        // K00-W4: after leaveConversation the floor is idle; a rebuild reaction
        // then moved it idle → recovering. The replayer must reject that edge
        // (it did on the device: "1 orphans"). This pins the law the exit
        // guard now enforces upstream. The replayer starts every trace at idle
        // (C5, MAC-COMPILE-04), so the prefix walks a lawful path there first.
        let r = StateReplayer.replay([
            ev(1, 1, "command", cause: "enterConversation"),
            ev(2, 1, "floor_transition", from: "idle", to: "entering", causeSeq: 1),
            ev(3, 1, "recovery_scheduled", cause: "configuration_change", causeSeq: 2),
            ev(4, 1, "floor_transition", from: "entering", to: "recovering", causeSeq: 3),
            ev(5, 1, "command", cause: "leaveConversation"),
            ev(6, 1, "floor_transition", from: "recovering", to: "idle", causeSeq: 5),
            ev(7, 1, "floor_transition", from: "idle", to: "recovering", causeSeq: 6),   // the W4 edge
        ])
        XCTAssertFalse(r.passes)
        XCTAssertEqual(r.orphanTransitions.count, 1)
        XCTAssertEqual(r.orphanTransitions.first?.seq, 7)
    }

    // PRE-WITNESS-04 §2.2: the deferral is an ACT (the kernel decided not to rebuild) and
    // must name the observation that caused it, or the replayer rejects the record.
    func testConfigurationChangeDeferralMustBeAttributed() {
        let good = StateReplayer.replay([
            ev(1, 1, "command", cause: "enterConversation"),
            ev(2, 1, "floor_transition", from: "idle", to: "entering", causeSeq: 1),
            ev(3, 1, "engine_configuration_changed", cause: "os_configuration_change"),
            ev(4, 1, "configuration_change_deferred", cause: "voice_processing_reconfiguration", causeSeq: 3),
        ])
        XCTAssertTrue(good.passes)
        let bad = StateReplayer.replay([
            ev(1, 1, "command", cause: "enterConversation"),
            ev(2, 1, "floor_transition", from: "idle", to: "entering", causeSeq: 1),
            ev(3, 1, "configuration_change_deferred", cause: "voice_processing_reconfiguration"),   // no causeSeq
        ])
        XCTAssertFalse(bad.passes)
        XCTAssertEqual(bad.unattributedActs.count, 1)
    }

    func testUnlawfulEdgeFails() {
        let r = StateReplayer.replay([
            ev(1, 1, "command", cause: "x"),
            ev(2, 1, "floor_transition", from: "idle", to: "maiaSpeaking", causeSeq: 1),   // no such edge
        ])
        XCTAssertFalse(r.passes)
    }

    func testAutomaticActWithoutCauseOrParentFails() {
        XCTAssertFalse(StateReplayer.replay([ev(1, 1, "graph_rebuilt", cause: nil, causeSeq: nil)]).passes)
        let r = StateReplayer.replay([ev(1, 1, "graph_rebuilt", cause: "recovery", causeSeq: nil)])
        XCTAssertFalse(r.passes)
        XCTAssertEqual(r.unattributedActs.count, 1)
    }

    func testCausalParentMustExistPrecedeAndNotComeFromALaterGeneration() {
        // parent seq does not exist
        var r = StateReplayer.replay([ev(1, 1, "graph_rebuilt", cause: "recovery", causeSeq: 99)])
        XCTAssertEqual(r.brokenCausality.count, 1)
        // parent comes after the act
        r = StateReplayer.replay([
            ev(1, 1, "graph_rebuilt", cause: "recovery", causeSeq: 2),
            ev(2, 1, "recovery_started", cause: "recovery", causeSeq: 1),
        ])
        XCTAssertGreaterThanOrEqual(r.brokenCausality.count, 1)
        // parent belongs to a LATER generation than the act it supposedly caused
        r = StateReplayer.replay([
            ev(1, 3, "input_flow", from: "unknown", to: "dead", cause: "observation"),
            ev(2, 2, "recovery_requested", cause: "input_dead", causeSeq: 1),
        ])
        XCTAssertEqual(r.brokenCausality.count, 1)
    }

    func testJournalAssignsMonotonicSeqAndRoundTripsThroughJSONL() {
        var t: Int64 = 0
        let rec = FlightRecorder(session: "rt", clock: { t += 1; return t })
        let a = rec.record(generation: 1, component: "VoiceKernel", event: "command", cause: "enterConversation")
        let b = rec.record(generation: 1, component: "VoiceKernel", event: "floor_transition", from: "idle", to: "entering",
                           cause: "enterConversation", causeSeq: a.seq)
        XCTAssertEqual([a.seq, b.seq], [1, 2])
        XCTAssertEqual(b.causeSeq, 1)
        let back = FlightRecorder.importJSONL(rec.exportJSONL())
        XCTAssertEqual(back, rec.snapshot())
        XCTAssertTrue(StateReplayer.replay(back).passes)
    }
}

final class SnapshotRulesTests: XCTestCase {
    func testListeningIsDisplayedOnlyWithHealthyInput() {
        // VOICE-07/-08 projection rule 3.
        var s = KernelSnapshot(session: "x")
        s.floor = .listening; s.inputFlow = .suspect
        XCTAssertFalse(s.displaysListening)
        s.inputFlow = .healthy
        XCTAssertTrue(s.displaysListening)
        s.floor = .recovering
        XCTAssertFalse(s.displaysListening)
    }
}

// PRE-WITNESS-02 §3.5 — the entry-seam precondition (K00-W1). The witnessed
// failure was `installTap` reached with a 0 Hz / 0-channel input format. The
// check is pure so it can be believed without a device; that it runs BEFORE
// the tap is pinned lexically by the repo source gate.
final class InputFormatPreconditionTests: XCTestCase {
    func testResolvedHardwareFormatIsValid() {
        XCTAssertTrue(InputFormatObservation(sampleRate: 48_000, channels: 1).isValid)
        XCTAssertNoThrow(try InputFormatObservation(sampleRate: 16_000, channels: 2).requireValid())
    }

    func testTheWitnessedZeroHertzFormatIsInvalid() {
        // 2026-09-11 device witness: `outf<1 ch, 0 Hz> inf<1 ch, 0 Hz>`.
        XCTAssertFalse(InputFormatObservation(sampleRate: 0, channels: 1).isValid)
        XCTAssertFalse(InputFormatObservation(sampleRate: 48_000, channels: 0).isValid)
        XCTAssertFalse(InputFormatObservation(sampleRate: 0, channels: 0).isValid)
        XCTAssertFalse(InputFormatObservation(sampleRate: -1, channels: 1).isValid)
    }

    func testInvalidFormatThrowsASwiftErrorCarryingTheObservedNumbers() {
        // §3.1: a Swift error, thrown before any tap — never an NSException.
        XCTAssertThrowsError(try InputFormatObservation(sampleRate: 0, channels: 1).requireValid()) { error in
            XCTAssertEqual(error as? AudioGraphError, .invalidInputFormat(sampleRate: 0, channels: 1))
            XCTAssertEqual("\(error)", "invalidInputFormat(sampleRate: 0.0, channels: 1)")
        }
    }
}

// PRE-WITNESS-03 §B — the configuration-change seam is bounded by the ratified budget.
// (§A's replay law, testPostExitRecoveryEdgeIsAnOrphan, lives in ReplayTests.)
final class ConfigurationChangeSeamTests: XCTestCase {
    func testConfigurationChangeIsBoundedByTheSameRatifiedBudget() {
        // K00-W3: 584 unbudgeted rebuilds in 6.2 min. Under RecoveryPolicy the
        // class `configuration_change` gets exactly the ratified ceiling —
        // 3 per 60 s at 500 / 1000 / 2000 ms — then degrades. No new budget.
        var p = RecoveryPolicy()
        guard case .retry(500, 1, _) = p.decide(faultClass: "configuration_change", nowMs: 0) else { return XCTFail() }
        guard case .retry(1_000, 2, _) = p.decide(faultClass: "configuration_change", nowMs: 700) else { return XCTFail() }
        guard case .retry(2_000, 3, _) = p.decide(faultClass: "configuration_change", nowMs: 2_000) else { return XCTFail() }
        guard case .degraded("configuration_change", 3) = p.decide(faultClass: "configuration_change", nowMs: 4_500) else {
            return XCTFail("the fourth reaction inside the window must degrade, not rebuild")
        }
    }

}

// PRE-WITNESS-04 §2.1 (founder amendment 1) — the classifier is generation-scoped
// and one-shot: exactly one expected VP-associated change per VP-enabled start,
// on unchanged ports, with no interruption/reset in progress. Nothing else.
final class ConfigurationChangeClassifierTests: XCTestCase {
    private let builtIn = RouteState(output: "builtInSpeaker", input: "builtInMic", inputDataSource: "-")
    private let builtInBottom = RouteState(output: "builtInSpeaker", input: "builtInMic", inputDataSource: "Bottom")
    private let hfp = RouteState(output: "bluetoothHFP", input: "bluetoothHFP")

    private func input(vp: Bool = true, pending: Bool = true, ordinal: Int = 1,
                       start: RouteState? = nil, now: RouteState? = nil, suspended: Bool = false)
        -> ConfigurationChangeClassifier.Input {
        .init(voiceProcessing: vp, expectationPending: pending, ordinalInGeneration: ordinal,
              routeAtStart: start ?? builtIn, routeNow: now ?? builtInBottom, suspended: suspended)
    }

    func testTheOneExpectedChangeAfterAVPStartIsClassifiedAsVPReconfiguration() {
        // Run 3a shape: VP on · first change · same ports · data source `-` → `Bottom` (evidence, not identity).
        XCTAssertEqual(ConfigurationChangeClassifier.classify(input()), .voiceProcessingReconfiguration)
    }

    func testDataSourceAlternationDoesNotChangeRouteIdentity() {
        XCTAssertTrue(ConfigurationChangeClassifier.samePorts(builtIn, builtInBottom))
        XCTAssertFalse(ConfigurationChangeClassifier.samePorts(builtIn, hfp))
        XCTAssertFalse(ConfigurationChangeClassifier.samePorts(nil, builtIn))
    }

    func testSecondChangeInTheSameGenerationIsNotVP() {
        // The expectation is consumed on the first match; a later same-route change is ordinary.
        XCTAssertEqual(ConfigurationChangeClassifier.classify(input(pending: false, ordinal: 2)), .routeConfigurationChange)
        XCTAssertEqual(ConfigurationChangeClassifier.classify(input(pending: true, ordinal: 2)), .routeConfigurationChange)
    }

    func testRealRouteChangeIsNeverVP() {
        XCTAssertEqual(ConfigurationChangeClassifier.classify(input(now: hfp)), .routeConfigurationChange)
    }

    func testVoiceProcessingOffIsNeverVP() {
        // Run 3b: with VP off no change arrived at all; if one did, it is not the VP one.
        XCTAssertEqual(ConfigurationChangeClassifier.classify(input(vp: false)), .routeConfigurationChange)
    }

    func testRetiredExpectationAndSuspensionAreNeverVP() {
        XCTAssertEqual(ConfigurationChangeClassifier.classify(input(pending: false)), .routeConfigurationChange)
        XCTAssertEqual(ConfigurationChangeClassifier.classify(input(suspended: true)), .routeConfigurationChange)
    }
}

// PRE-WITNESS-05 Phase A — the startup-seam trace is a closed, ordered set of
// observation steps. The kernel journals them as `graph_start_trace`; the
// device trace (VP ON vs VP OFF) is what names the first divergent seam.
final class StartTraceTests: XCTestCase {
    func testTheTraceNamesExactlyTheThirteenSeamsPlusEngineCreated() {
        let steps = AudioGraph.StartTraceStep.allCases.map(\.rawValue)
        XCTAssertEqual(steps, [
            "engine_created", "input_format_before_vp", "vp_enable_begin", "vp_enable_return",
            "output_connected", "input_format_after_vp", "input_tap_installed", "render_tap_installed",
            "observer_installed", "prepare_begin", "prepare_return", "start_begin", "start_return",
            "is_running_immediate",
        ], "the set is closed and ordered as the calls happen; a reorder here is a reorder in the graph")
    }
}
