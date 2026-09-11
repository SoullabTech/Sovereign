// KERNEL-00 · pure-logic tests. Run on the Mac Studio:
//   cd ios/VoiceKernel && swift test
// These exercise the parts of the organism that need no device: the
// supervisor's windows (K00-07/08), the recovery budget and backoff (K00-10),
// generation gating (K00-09), and trace replay (K00-17). They are not the
// device witness; they are the reason the device witness can be believed.
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

    func testBudgetIsPerFaultClassAndPerWindow() {
        var p = RecoveryPolicy()
        for t in [0, 1_000, 2_000] { _ = p.decide(faultClass: "input_dead", nowMs: Int64(t)) }
        guard case .retry = p.decide(faultClass: "output_stalled", nowMs: 3_000) else { return XCTFail("other class has its own budget") }
        guard case .degraded = p.decide(faultClass: "input_dead", nowMs: 4_000) else { return XCTFail() }
        guard case .retry(_, 1, _) = p.decide(faultClass: "input_dead", nowMs: 61_000) else { return XCTFail("window rolls at 60 s") }
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
    private func ev(_ gen: Int, _ event: String, from: String? = nil, to: String? = nil, cause: String? = "c") -> JournalEvent {
        JournalEvent(session: "t", generation: gen, timeMonotonicMs: 0, component: "x", event: event, from: from, to: to, cause: cause)
    }

    func testLawfulRunReplaysClean() {
        let events = [
            ev(1, "floor_transition", from: "idle", to: "entering"),
            ev(1, "session_configured", cause: "enterConversation"),
            ev(1, "floor_transition", from: "entering", to: "listening"),
            ev(1, "floor_transition", from: "listening", to: "maiaSpeaking"),
            ev(1, "stream_cancelled", cause: "command:cancel"),
            ev(1, "floor_transition", from: "maiaSpeaking", to: "listening"),
            ev(1, "recovery_requested", cause: "input_dead"),
            ev(1, "floor_transition", from: "listening", to: "recovering"),
            ev(2, "graph_rebuilt", cause: "recovery:input_dead"),
            ev(1, "stale_callback_dropped", cause: "generation_mismatch"),
            ev(2, "floor_transition", from: "recovering", to: "listening"),
            ev(2, "floor_transition", from: "listening", to: "idle"),
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
            ev(1, "floor_transition", from: "idle", to: "entering"),
            ev(1, "floor_transition", from: "listening", to: "maiaSpeaking"),   // from ≠ current
        ])
        XCTAssertFalse(r.passes)
        XCTAssertEqual(r.orphanTransitions.count, 1)
    }

    func testUnlawfulEdgeFails() {
        let r = StateReplayer.replay([
            ev(1, "floor_transition", from: "idle", to: "maiaSpeaking"),   // no such edge
        ])
        XCTAssertFalse(r.passes)
    }

    func testAutomaticActWithoutCauseFails() {
        let r = StateReplayer.replay([ev(1, "graph_rebuilt", cause: nil)])
        XCTAssertFalse(r.passes)
        XCTAssertEqual(r.unattributedActs.count, 1)
    }

    func testJournalRoundTripsThroughJSONL() {
        var t: Int64 = 0
        let rec = FlightRecorder(session: "rt", clock: { t += 1; return t })
        rec.record(generation: 1, component: "VoiceKernel", event: "floor_transition", from: "idle", to: "entering", cause: "enterConversation")
        rec.record(generation: 1, component: "AudioSessionAuthority", event: "session_configured", cause: "enterConversation", evidence: ["category": "playAndRecord"])
        let back = FlightRecorder.importJSONL(rec.exportJSONL())
        XCTAssertEqual(back, rec.snapshot())
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
