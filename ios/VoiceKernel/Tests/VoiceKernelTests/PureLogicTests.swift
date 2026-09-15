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

// VPIO-01 (founder ruling 2026-09-14, plan §11 item 3) — the one pure operation
// kept from the retired engine classifier: port identity. Data source is
// evidence, never identity (PRE-WITNESS-04 amendment 1). Nothing else lives here.
final class RouteComparisonTests: XCTestCase {
    private let builtIn = RouteState(output: "builtInSpeaker", input: "builtInMic", inputDataSource: "-")
    private let builtInBottom = RouteState(output: "builtInSpeaker", input: "builtInMic", inputDataSource: "Bottom")
    private let hfp = RouteState(output: "bluetoothHFP", input: "bluetoothHFP")

    func testDataSourceAlternationDoesNotChangeRouteIdentity() {
        XCTAssertTrue(RouteComparison.samePorts(builtIn, builtInBottom))
    }
    func testDifferentPortsAreADifferentRoute() {
        XCTAssertFalse(RouteComparison.samePorts(builtIn, hfp))
    }
    func testAMissingBaselineIsNeverTheSameRoute() {
        // No successfully started generation → no baseline → never "same"; the kernel's
        // eligibility guard refuses the act anyway, this keeps the helper honest on its own.
        XCTAssertFalse(RouteComparison.samePorts(nil, builtIn))
        XCTAssertFalse(RouteComparison.samePorts(builtIn, nil))
    }
}

// The startup-seam trace is a closed, ordered set of observation steps. The
// kernel journals them as `graph_start_trace` (Phase-A lineage; VPIO vocabulary).
final class StartTraceTests: XCTestCase {
    // VPIO-02 / FORMAT-RESOLUTION-01 (founder adjudication 2026-09-14): fourteen
    // Voice-Processing I/O seams, in the order the calls happen. The format probe
    // is VISIBLE: probe initialize → read → probe uninitialize → guard, all before
    // any callback is armed; the real initialize/start follow only if the guard
    // passed. No engine seam exists on this subject.
    func testTheTraceNamesExactlyTheFourteenVPIO02SeamsInOrder() {
        let steps = AudioGraph.StartTraceStep.allCases.map(\.rawValue)
        XCTAssertEqual(steps, [
            "unit_created", "io_enabled", "vp_properties_set",
            "format_probe_initialize_begin", "format_probe_initialize_return", "input_format_read",
            "format_probe_uninitialize_return",
            "formats_set", "callbacks_armed", "initialize_begin", "initialize_return",
            "start_begin", "start_return", "is_running_immediate",
        ], "the set is closed and ordered as the calls happen; a reorder here is a reorder in the substrate")
        let at = { (s: String) -> Int in steps.firstIndex(of: s)! }
        // the probe brackets the read
        XCTAssertLessThan(at("format_probe_initialize_begin"), at("format_probe_initialize_return"))
        XCTAssertLessThan(at("format_probe_initialize_return"), at("input_format_read"))
        XCTAssertEqual(at("format_probe_uninitialize_return"), at("input_format_read") + 1, "uninitialize is the next seam after the read — before any reconfiguration")
        // nothing is configured, armed, initialized or started until the probe has uninitialized
        XCTAssertLessThan(at("format_probe_uninitialize_return"), at("formats_set"))
        XCTAssertLessThan(at("formats_set"), at("callbacks_armed"))
        XCTAssertLessThan(at("callbacks_armed"), at("initialize_begin"))
        XCTAssertLessThan(at("initialize_return"), at("start_begin"))
        XCTAssertEqual(steps.last, "is_running_immediate")
        // a post-probe refusal truthfully ends at the uninitialize seam: nothing "started"
        let refusalPrefix = Array(steps.prefix(through: at("format_probe_uninitialize_return")))
        XCTAssertFalse(refusalPrefix.contains("start_begin"))
        XCTAssertFalse(refusalPrefix.contains("initialize_begin"))
        XCTAssertFalse(refusalPrefix.contains("callbacks_armed"))
    }
}

// SOURCE-ID-02 (founder ruling 2026-09-15): the source estimator and the 2 Hz
// signature are pure arithmetic and earn themselves here, offline, before any
// Mac compile: unit vectors for the seven bins, the amplitude-domain leakage
// coefficients the reading law relies on, the ordered-envelope modulation index
// (ideal gate ≈ 1.2–1.3 · steady 0 · fluctuation < 0.9) and the frame-reset path.
final class SourceEstimatorTests: XCTestCase {
    private let fs = 48_000.0
    private let n = 480          // 10 ms callback (the observed geometry); frame = 4 × 480 = 1 920 = 40 ms

    /// Feed `callbacks` × `n` samples of a generator through the estimator; return the closed frames.
    private func run(_ callbacks: Int, _ gen: (Int) -> Float, n: Int? = nil) -> [SourceEstimator.ClosedFrame] {
        var est = SourceEstimator(sampleRate: fs)
        var frames: [SourceEstimator.ClosedFrame] = []
        let m = n ?? self.n
        var buf = [Float](repeating: 0, count: m)
        var idx = 0
        for _ in 0..<callbacks {
            for i in 0..<m { buf[i] = gen(idx); idx += 1 }
            buf.withUnsafeMutableBufferPointer { p in
                if let f = est.consume(p.baseAddress!, m) { frames.append(f) }
            }
        }
        return frames
    }
    private func sine(_ hz: Double, amplitude: Double) -> (Int) -> Float {
        { i in Float(amplitude * sin(2.0 * Double.pi * hz * Double(i) / self.fs)) }
    }
    private func bin(_ f: SourceEstimator.ClosedFrame, _ hz: Double) -> Double { f.magnitudes[SourceEstimator.binsHz.firstIndex(of: hz)!] }

    func testTheBinSetIsExactlyTheSevenRuledFrequenciesAndAFrameClosesEveryFourthCallback() {
        XCTAssertEqual(SourceEstimator.binsHz, [440, 700, 880, 997, 1200, 1320, 1760])
        XCTAssertEqual(SourceEstimator.callbacksPerFrame, 4)
        let frames = run(8, sine(997, amplitude: 0.001))
        XCTAssertEqual(frames.count, 2)
        XCTAssertEqual(frames[0].frameFrames, 1_920)
        XCTAssertEqual(frames[0].sampleRate, fs)
        XCTAssertFalse(frames[0].reset); XCTAssertFalse(frames[1].reset)
        XCTAssertEqual(frames[0].magnitudes[7], 0, "lane 7 is unused and always zero")
    }

    func testAStimulusToneReadsItsOwnBinAtTheCoherentGainAndNothingInTheControls() {
        // rms 1e-3 → amplitude 1.414e-3 → normalized magnitude ≈ 7.07e-4 (a full-scale sine reads 0.5)
        let f = run(4, sine(997, amplitude: 0.001 * 2.0.squareRoot()))[0]
        XCTAssertEqual(bin(f, 997), 7.07e-4, accuracy: 7.07e-4 * 0.02)
        XCTAssertLessThan(bin(f, 700), 7.07e-4 * 1e-3)      // −60 dB or better into the controls
        XCTAssertLessThan(bin(f, 1200), 7.07e-4 * 1e-3)
        XCTAssertLessThan(bin(f, 880), 7.07e-4 * 4e-3)      // 997 → 880 mirrors the pinned 880 → 997 coefficient
        XCTAssertLessThan(bin(f, 440), 7.07e-4 * 1e-4)
    }

    func testOwnToneHarmonicsLeakIntoTheStimulusBinNoMoreThanTheAmplitudeCoefficientsTheReadingLawPins() {
        // §10.B (amplitude domain): 440 → 997 2.16e-5 · 880 → 997 2.77e-3 · 1320 → 997 4.00e-5 · 1760 → 997 1.12e-5
        for (hz, coeff) in [(440.0, 2.16e-5), (880.0, 2.77e-3), (1320.0, 4.00e-5), (1760.0, 1.12e-5)] {
            let f = run(4, sine(hz, amplitude: 0.2))[0]            // MAIA's own tone amplitude → magnitude 0.1 in its own bin
            XCTAssertEqual(bin(f, hz), 0.1, accuracy: 0.1 * 0.02, "\(hz) Hz reads its own bin")
            XCTAssertLessThanOrEqual(bin(f, 997), 0.1 * coeff * 1.10, "\(hz) Hz leaks into 997 within the pinned coefficient (+10 %)")
            XCTAssertGreaterThanOrEqual(bin(f, 997), 0.1 * coeff * 0.50, "the coefficient is a bound of the right order, not a fiction")
        }
    }

    func testSilenceReadsZeroEverywhereAndACallbackSizeChangeResetsTheFrame() {
        let z = run(4, { _ in 0 })[0]
        for i in 0..<7 { XCTAssertEqual(z.magnitudes[i], 0) }
        var est = SourceEstimator(sampleRate: fs)
        var a = [Float](repeating: 0.01, count: 480), b = [Float](repeating: 0.01, count: 512)
        var closed: [SourceEstimator.ClosedFrame] = []
        a.withUnsafeMutableBufferPointer { p in for _ in 0..<3 { if let f = est.consume(p.baseAddress!, 480) { closed.append(f) } } }
        XCTAssertEqual(closed.count, 0, "three of four callbacks: the frame is still open")
        b.withUnsafeMutableBufferPointer { p in for _ in 0..<4 { if let f = est.consume(p.baseAddress!, 512) { closed.append(f) } } }
        XCTAssertEqual(closed.count, 1, "the open 480-frame is discarded; four 512-callbacks close a new 2 048-frame")
        XCTAssertTrue(closed[0].reset); XCTAssertEqual(closed[0].frameFrames, 2_048)
    }

    func testTheOrderedEnvelopeModulationIndexSeparatesAGatedStimulusFromASteadyOrFluctuatingOne() {
        let dt = 0.04
        // ideal 250 ms on / 250 ms off gate, integrated per 40 ms frame, random phase against the frame grid
        for phase in stride(from: 0.0, to: 0.5, by: 0.037) {
            var seq: [Double] = []
            for k in 0..<25 {
                var on = 0.0
                for i in 0..<40 { let t = Double(k) * dt + phase + Double(i) * 0.001; if t.truncatingRemainder(dividingBy: 0.5) < 0.25 { on += 1 } }
                seq.append(on / 40.0)
            }
            let m2 = SourceSignature.modulationIndex(seq, frameSeconds: dt)!
            XCTAssertGreaterThanOrEqual(m2, 1.15, "ideal gate reads ≈ 1.21–1.31 (phase \(phase))")
            XCTAssertLessThanOrEqual(m2, 1.40)
        }
        XCTAssertEqual(SourceSignature.modulationIndex([Double](repeating: 0.3, count: 25), frameSeconds: dt)!, 0, accuracy: 1e-9, "a steady envelope has no 2 Hz line")
        XCTAssertNil(SourceSignature.modulationIndex([Double](repeating: 0, count: 25), frameSeconds: dt), "no energy → no index (journalled as -)")
        // deterministic fluctuation (a 7 Hz ripple + drift) stays well under the 0.9 witness threshold
        let ripple = (0..<25).map { k in 0.5 + 0.3 * sin(2.0 * Double.pi * 7.0 * Double(k) * dt) + 0.01 * Double(k) }
        XCTAssertLessThan(SourceSignature.modulationIndex(ripple, frameSeconds: dt)!, 0.9)
        // 26 frames (a 1.04 s tick) evaluates over frame time, not a fixed 25-point bin
        let seq26 = (0..<26).map { k in (Double(k) * dt).truncatingRemainder(dividingBy: 0.5) < 0.25 ? 1.0 : 0.0 }
        XCTAssertGreaterThanOrEqual(SourceSignature.modulationIndex(seq26, frameSeconds: dt)!, 1.15)
    }

    func testAGatedStimulusThroughTheWholeEstimatorCarriesTheSignatureOnTheStimulusBinOnly() {
        // 997 Hz gated 250 ms on/off + a continuous 440 Hz own tone; 25 frames = 100 callbacks
        let g: (Int) -> Float = { i in
            let t = Double(i) / self.fs
            let gate = t.truncatingRemainder(dividingBy: 0.5) < 0.25 ? 1.0 : 0.0
            return Float(0.002 * gate * sin(2.0 * Double.pi * 997 * t) + 0.02 * sin(2.0 * Double.pi * 440 * t))
        }
        let frames = run(100, g)
        XCTAssertEqual(frames.count, 25)
        let e997 = frames.map { bin($0, 997) }, e440 = frames.map { bin($0, 440) }
        XCTAssertGreaterThanOrEqual(SourceSignature.modulationIndex(e997, frameSeconds: 0.04)!, 0.9, "the stimulus bin carries the 2 Hz gate")
        XCTAssertLessThan(SourceSignature.modulationIndex(e440, frameSeconds: 0.04)!, 0.2, "the own-tone bin does not (m2_440 is the confound veto's control)")
    }
}

