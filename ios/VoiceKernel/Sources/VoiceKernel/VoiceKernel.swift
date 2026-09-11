// KERNEL-00 · VoiceKernel — the sole coordinator (VOICE-20: no committee).
//
// A Swift actor. Owns authority and no model logic. It is the only component
// that turns an observation into a state transition. It commands
// AudioSessionAuthority (session), AudioGraph (capture + output), and executes
// what HealthSupervisor requests and RecoveryPolicy allows. Everything it does
// is journalled with cause and generation.
//
// Commands (intentions): enterConversation · leaveConversation · setMicEnabled
// · setOutputEnabled · play(known PCM) · cancel · setFaults ·
// requestDiagnosticsSnapshot · recordManualIntervention.
// Observations: input callbacks, output progress, session events,
// configuration changes — each carrying the generation that produced it.
import Foundation
import AVFoundation

public actor VoiceKernel {
    public let recorder: FlightRecorder
    public nonisolated let projection: StateProjection

    private var snap: KernelSnapshot
    private var health: HealthSupervisor
    private var recovery: RecoveryPolicy
    private var graph: AudioGraph?
    #if os(iOS)
    private var session: AudioSessionAuthority?
    #endif
    private var tickTask: Task<Void, Never>?
    private var pendingRecovery: Task<Void, Never>?
    private var heldStale: InputObservation?
    private var inConversation = false
    /// True while the OS holds the session (interruption in progress). Health
    /// evaluation pauses: an interrupted session is not a dead organism.
    private var suspended = false
    private let clock: () -> Int64

    public init(session id: String = "K00-" + UUID().uuidString.prefix(8).lowercased(),
                thresholds: HealthThresholds = HealthThresholds(),
                schedule: RecoverySchedule = RecoverySchedule(),
                clock: @escaping () -> Int64 = MonotonicClock.nowMs) {
        self.clock = clock
        recorder = FlightRecorder(session: id, clock: clock)
        snap = KernelSnapshot(session: id)
        snap.recovery.budget = schedule.budgetPerWindow
        health = HealthSupervisor(thresholds: thresholds)
        recovery = RecoveryPolicy(schedule: schedule)
        projection = StateProjection(initial: snap)
    }

    // MARK: - commands

    public func enterConversation() async {
        guard !inConversation else { return }
        inConversation = true
        journal("VoiceKernel", "command", cause: "enterConversation")
        transition(to: .entering, cause: "enterConversation")
        #if os(iOS)
        let s = AudioSessionAuthority(recorder: recorder)
        s.onEvent = { [weak self] e in Task { await self?.handleSession(e) } }
        session = s
        do {
            let g = recovery.nextGeneration()
            s.setGeneration(g)
            try s.configureForConversation(cause: "enterConversation")
            snap.audioSession = .active
            snap.route = s.currentRoute()
            s.startObserving()
            try startGraph(generation: g, cause: "enterConversation")
        } catch {
            journal("VoiceKernel", "error", cause: "enterConversation_failed", evidence: ["error": "\(error)"])
            transition(to: .degraded, cause: "enterConversation_failed")
            publish()
            return
        }
        #else
        // macOS: no AVAudioSession. The graph alone (used by `swift test` only through pure parts).
        let g = recovery.nextGeneration()
        do { try startGraph(generation: g, cause: "enterConversation") } catch {
            journal("VoiceKernel", "error", cause: "enterConversation_failed", evidence: ["error": "\(error)"])
            transition(to: .degraded, cause: "enterConversation_failed")
        }
        #endif
        startTick()
        publish()
    }

    public func leaveConversation() async {
        guard inConversation else { return }
        journal("VoiceKernel", "command", cause: "leaveConversation")
        pendingRecovery?.cancel(); pendingRecovery = nil
        stopTick()
        cancelAllStreams(cause: "leaveConversation")
        graph?.stop(); graph = nil
        #if os(iOS)
        session?.stopObserving()
        try? session?.release(cause: "leaveConversation")
        session = nil
        #endif
        health.markSessionLost()
        snap.audioSession = .inactive
        snap.inputFlow = .unknown; snap.outputFlow = .idle
        inConversation = false
        transition(to: .idle, cause: "leaveConversation")
        publish()
    }

    public func setMicEnabled(_ on: Bool) {
        journal("VoiceKernel", "command", cause: on ? "setMicEnabled(true)" : "setMicEnabled(false)")
        snap.micEnabled = on
        publish()
    }

    public func setOutputEnabled(_ on: Bool) {
        journal("VoiceKernel", "command", cause: on ? "setOutputEnabled(true)" : "setOutputEnabled(false)")
        snap.outputEnabled = on
        if !on { cancelAllStreams(cause: "setOutputEnabled(false)") }
        publish()
    }

    /// Harness only: render known PCM (a tone). KERNEL-00 has no synthesizer.
    @discardableResult
    public func playTone(seconds: Double = 3.0, frequencyHz: Double = 440) -> OutputStreamID? {
        guard inConversation, snap.outputEnabled, let g = graph, snap.floor == .listening else {
            journal("VoiceKernel", "play_refused", cause: "not_listening_or_output_disabled")
            return nil
        }
        guard let buf = g.makeTone(frequencyHz: frequencyHz, seconds: seconds) else { return nil }
        let id = OutputStreamID.make()
        let frames = g.schedule(buf, as: id)
        let rec = OutputStreamRecord(id: id, state: .rendering, framesScheduled: frames, framesRendered: 0,
                                     generation: snap.generation, scheduledAtMs: clock())
        snap.streams.append(rec)
        health.beginRendering(id, nowMs: clock())
        snap.outputFlow = .rendering
        journal("OutputController", "stream_scheduled", to: id.raw, cause: "command:playTone",
                evidence: ["framesScheduled": String(frames), "seconds": String(seconds)])
        transition(to: .maiaSpeaking, cause: "stream_rendering:\(id.raw)")
        publish()
        return id
    }

    public func cancel(_ id: OutputStreamID) {
        cancelStream(id, cause: "command:cancel")
        publish()
    }

    public func setFaults(_ f: FaultInjection) {
        journal("Harness", "faults_set", cause: "command:setFaults",
                evidence: ["digitalZeroInput": String(f.digitalZeroInput), "stallOutput": String(f.stallOutput),
                           "holdStaleCallback": String(f.holdStaleCallback), "persistentFault": String(f.persistentFault)])
        snap.faults = f
        publish()
    }

    /// The harness records any manual intervention honestly. K00 forbids
    /// needing one after an admitted route change (K00-11) or at all in the
    /// endurance run (K00-15).
    public func recordManualIntervention(_ note: String) {
        snap.manualInterventions += 1
        journal("Harness", "manual_intervention", cause: note)
        publish()
    }

    public func requestDiagnosticsSnapshot() -> KernelSnapshot {
        snap.journalCount = recorder.count
        return snap
    }

    /// A member act that leaves `degraded` (state model §2: degraded → entering).
    public func reenterAfterDegraded() async {
        guard snap.floor == .degraded else { return }
        journal("VoiceKernel", "command", cause: "reenter")
        recovery.clearBudget()
        snap.recovery.degradedCause = nil
        snap.recovery.attemptsInWindow = 0
        inConversation = false
        graph?.stop(); graph = nil
        transition(to: .idle, cause: "reenter")
        await enterConversation()
    }

    // MARK: - graph lifecycle

    private func startGraph(generation g: Int, cause: String) throws {
        graph?.stop()
        let ag = AudioGraph(generation: g)
        ag.onInput = { [weak self] o in Task { await self?.handleInput(o) } }
        ag.onStreamComplete = { [weak self] id, gen in Task { await self?.handleStreamComplete(id, generation: gen) } }
        ag.onConfigurationChange = { [weak self] gen in Task { await self?.handleConfigurationChange(generation: gen) } }
        try ag.start(voiceProcessing: snap.voiceProcessingEnabled, clock: clock)
        graph = ag
        snap.generation = g
        snap.recovery.generation = g
        snap.inputCallbacksInGeneration = 0
        health.beginGeneration(g, nowMs: clock())
        snap.inputFlow = health.inputFlow
        snap.outputFlow = health.outputFlow
        #if os(iOS)
        session?.setGeneration(g)
        snap.route = session?.currentRoute() ?? snap.route
        #endif
        journal("VoiceKernel", "graph_started", cause: cause,
                evidence: ["voiceProcessing": String(snap.voiceProcessingEnabled), "engineRunning": String(ag.isRunning)])
    }

    // MARK: - observations

    private func handleInput(_ raw: InputObservation) {
        // K00-09: generation gate. A callback from a previous generation is
        // journalled and dropped; it changes nothing.
        guard raw.generation == snap.generation else {
            journal("VoiceKernel", "stale_callback_dropped", cause: "generation_mismatch",
                    evidence: ["callbackGeneration": String(raw.generation), "current": String(snap.generation)])
            publish()
            return
        }
        // Fault: hold one callback and fire it after the next recovery.
        if snap.faults.holdStaleCallback && heldStale == nil {
            heldStale = raw
            journal("Harness", "callback_held", cause: "fault:holdStaleCallback",
                    evidence: ["generation": String(raw.generation)])
            return
        }
        var o = raw
        if snap.faults.digitalZeroInput || snap.faults.persistentFault {
            o.rms = 0; o.peak = 0
        }
        // `micEnabled == false` is an intention for the future turn layer; the
        // physical organism is still observed (K00 has no turn layer to gate).
        health.observeInput(o)
        snap.inputCallbacksInGeneration = health.callbacksInGeneration
        snap.lastInputRms = o.rms; snap.lastInputPeak = o.peak
        let before = snap.inputFlow
        snap.inputFlow = health.inputFlow
        if before != snap.inputFlow {
            journal("HealthSupervisor", "input_flow", from: before.rawValue, to: snap.inputFlow.rawValue,
                    cause: "observation", evidence: ["rms": String(o.rms), "peak": String(o.peak), "frames": String(o.frames)])
        }
        if snap.floor == .entering && snap.inputFlow == .healthy {
            transition(to: .listening, cause: "input_flow_healthy")
        }
        if snap.floor == .recovering && snap.inputFlow == .healthy {
            transition(to: .listening, cause: "recovery_flow_reobserved")
        }
        evaluate()
        publish()
    }

    private func handleStreamComplete(_ id: OutputStreamID, generation gen: Int) {
        guard gen == snap.generation else {
            journal("VoiceKernel", "stale_callback_dropped", cause: "generation_mismatch",
                    evidence: ["stream": id.raw, "callbackGeneration": String(gen), "current": String(snap.generation)])
            return
        }
        guard let i = snap.streams.firstIndex(where: { $0.id == id }), snap.streams[i].state == .rendering else { return }
        snap.streams[i].state = .complete
        snap.streams[i].framesRendered = snap.streams[i].framesScheduled
        snap.streams[i].endedAtMs = clock()
        health.endRendering(id)
        snap.outputFlow = health.outputFlow
        journal("OutputController", "stream_complete", from: id.raw, cause: "frames_rendered",
                evidence: ["framesRendered": String(snap.streams[i].framesRendered)])
        if snap.floor == .maiaSpeaking { transition(to: .listening, cause: "stream_complete:\(id.raw)") }
        publish()
    }

    private func handleConfigurationChange(generation gen: Int) {
        guard gen == snap.generation else {
            journal("VoiceKernel", "stale_callback_dropped", cause: "generation_mismatch",
                    evidence: ["kind": "configurationChange", "callbackGeneration": String(gen)])
            return
        }
        // Rebuild-not-resume (SURVEY-01 §7): a new generation under the SAME
        // session configuration. This is a route recovery act, stamped as such.
        journal("VoiceKernel", "engine_configuration_changed", cause: "os_configuration_change")
        rebuildGraph(cause: "route_recovery")
    }

    #if os(iOS)
    private func handleSession(_ e: SessionEvent) {
        switch e {
        case .interruptionBegan:
            suspended = true
            snap.audioSession = .interrupted
            cancelAllStreams(cause: "interruption_began")
            graph?.stop()
            health.markSessionLost()
            snap.inputFlow = .unknown; snap.outputFlow = .idle
            transition(to: .recovering, cause: "interruption_began")
        case .interruptionEnded(let resume):
            // KERNEL-00 policy: always attempt to resume; `shouldResume` is
            // recorded as evidence, not obeyed as authority.
            journal("VoiceKernel", "interruption_recovery", cause: "os_interruption_ended",
                    evidence: ["shouldResume": String(resume)])
            do {
                try session?.configureForConversation(cause: "interruption_recovery")
                snap.audioSession = .active
            } catch {
                journal("VoiceKernel", "error", cause: "interruption_recovery_failed", evidence: ["error": "\(error)"])
            }
            suspended = false
            rebuildGraph(cause: "interruption_recovery")
        case .routeChanged(_, let route):
            snap.route = route
            // The engine posts AVAudioEngineConfigurationChange when the route
            // affects it; the rebuild happens there. Here we only record state.
        case .mediaServicesReset:
            snap.audioSession = .resetting
            cancelAllStreams(cause: "media_services_reset")
            graph?.stop()
            health.markSessionLost()
            transition(to: .recovering, cause: "media_services_reset")
            do {
                try session?.configureForConversation(cause: "media_services_reset_recovery")
                snap.audioSession = .active
            } catch {
                journal("VoiceKernel", "error", cause: "reset_recovery_failed", evidence: ["error": "\(error)"])
            }
            rebuildGraph(cause: "media_services_reset_recovery")
        }
        publish()
    }
    #endif

    // MARK: - health → recovery

    private func startTick() {
        stopTick()
        tickTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 100_000_000)
                await self?.tick()
            }
        }
    }
    private func stopTick() { tickTask?.cancel(); tickTask = nil }

    private func tick() {
        guard inConversation else { return }
        if let g = graph, let r = g.renderedFrames() {
            let (id, rendered, total) = r
            if !snap.faults.stallOutput {
                health.observeOutput(OutputObservation(generation: snap.generation, timeMs: clock(), streamId: id,
                                                       framesRendered: rendered, framesScheduled: total))
            }
            if let i = snap.streams.firstIndex(where: { $0.id == id }) { snap.streams[i].framesRendered = rendered }
        }
        evaluate()
        publish()
    }

    private func evaluate() {
        guard snap.floor != .degraded, snap.floor != .idle, !suspended else { return }
        let verdict = health.tick(nowMs: clock())
        snap.inputFlow = health.inputFlow
        snap.outputFlow = health.outputFlow
        switch verdict {
        case .none:
            return
        case .entryTimedOut(let waited):
            journal("HealthSupervisor", "recovery_requested", cause: "entry_timeout",
                    evidence: ["waitedMs": String(waited)])
            requestRecovery(faultClass: "entry_timeout")
        case .inputDead(let since):
            journal("HealthSupervisor", "recovery_requested", cause: "input_dead",
                    evidence: ["sinceMs": String(since), "engineRunning": String(graph?.isRunning ?? false)])
            requestRecovery(faultClass: "input_dead")
        case .outputStalled(let id, let since):
            journal("HealthSupervisor", "recovery_requested", cause: "output_stalled",
                    evidence: ["stream": id.raw, "sinceMs": String(since)])
            cancelStream(id, cause: "output_stalled", failed: true)
            requestRecovery(faultClass: "output_stalled")
        }
    }

    private func requestRecovery(faultClass: String) {
        guard pendingRecovery == nil else { return }   // one recovery in flight per generation (VOICE-06)
        let now = clock()
        let decision = recovery.decide(faultClass: faultClass, nowMs: now)
        snap.recovery.lastFaultClass = faultClass
        snap.recovery.attemptsInWindow = recovery.attemptsInWindow(faultClass: faultClass, nowMs: now)
        switch decision {
        case .degraded(let cause, let attempts):
            snap.recovery.degradedCause = cause
            journal("VoiceKernel", "degraded", cause: cause, evidence: ["attempts": String(attempts), "budget": String(snap.recovery.budget)])
            cancelAllStreams(cause: "degraded")
            graph?.stop(); graph = nil
            transition(to: .degraded, cause: "budget_exhausted:\(cause)")
        case .retry(let after, let attempt, let gen):
            journal("VoiceKernel", "recovery_scheduled", cause: faultClass,
                    evidence: ["afterMs": String(after), "attempt": String(attempt), "nextGeneration": String(gen)])
            if snap.floor != .recovering { transition(to: .recovering, cause: "recovery_scheduled:\(faultClass)") }
            pendingRecovery = Task { [weak self] in
                try? await Task.sleep(nanoseconds: UInt64(after) * 1_000_000)
                await self?.performRecovery(generation: gen, faultClass: faultClass)
            }
        }
    }

    private func performRecovery(generation gen: Int, faultClass: String) {
        pendingRecovery = nil
        guard inConversation, snap.floor == .recovering else { return }
        journal("VoiceKernel", "recovery_started", cause: faultClass, evidence: ["generation": String(gen)])
        rebuildGraph(cause: "recovery:\(faultClass)", generation: gen)
        // Fault: replay the held callback now — it carries the OLD generation and must be dropped.
        if let held = heldStale {
            heldStale = nil
            handleInput(held)
        }
        publish()
    }

    private func rebuildGraph(cause: String, generation: Int? = nil) {
        let g = generation ?? recovery.nextGeneration()
        cancelAllStreams(cause: cause)   // a stream cannot survive its graph; VOICE-10 makes that explicit
        do {
            try startGraph(generation: g, cause: cause)
            journal("VoiceKernel", "graph_rebuilt", cause: cause, evidence: ["generation": String(g)])
            if snap.floor != .recovering && snap.floor != .entering {
                transition(to: .recovering, cause: cause)
            }
        } catch {
            journal("VoiceKernel", "error", cause: "graph_rebuild_failed", evidence: ["error": "\(error)", "generation": String(g)])
            requestRecovery(faultClass: "graph_rebuild_failed")
        }
    }

    // MARK: - output control

    private func cancelStream(_ id: OutputStreamID, cause: String, failed: Bool = false) {
        guard let i = snap.streams.firstIndex(where: { $0.id == id }), snap.streams[i].state == .rendering else { return }
        let t0 = clock()
        let rendered = graph?.cancel(id) ?? snap.streams[i].framesRendered
        let t1 = clock()
        snap.streams[i].state = failed ? .failed : .cancelled
        snap.streams[i].framesRendered = rendered
        snap.streams[i].endedAtMs = t1
        health.endRendering(id, failed: failed)
        snap.outputFlow = health.outputFlow
        journal("OutputController", failed ? "stream_failed" : "stream_cancelled", from: id.raw, cause: cause,
                evidence: ["framesRendered": String(rendered), "framesScheduled": String(snap.streams[i].framesScheduled),
                           "cancelLatencyMs": String(t1 - t0)])
        if snap.floor == .maiaSpeaking { transition(to: .listening, cause: "\(failed ? "stream_failed" : "stream_cancelled"):\(id.raw)") }
    }

    private func cancelAllStreams(cause: String) {
        for s in snap.streams where s.state == .rendering { cancelStream(s.id, cause: cause) }
    }

    // MARK: - state + journal

    private func transition(to: FloorState, cause: String) {
        let from = snap.floor
        guard from != to else { return }
        snap.floor = to
        snap.lastCause = cause
        journal("VoiceKernel", "floor_transition", from: from.rawValue, to: to.rawValue, cause: cause)
    }

    private func journal(_ component: String, _ event: String, from: String? = nil, to: String? = nil,
                         cause: String? = nil, evidence: [String: String] = [:]) {
        recorder.record(generation: snap.generation, component: component, event: event,
                        from: from, to: to, cause: cause, evidence: evidence)
    }

    private func publish() {
        snap.journalCount = recorder.count
        projection.publish(snap)
    }
}
