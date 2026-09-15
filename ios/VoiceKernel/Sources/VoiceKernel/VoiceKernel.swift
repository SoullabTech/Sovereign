// KERNEL-00 · VoiceKernel — the sole coordinator (VOICE-20: no committee).
//
// A Swift actor. Owns authority and no model logic. It is the only component
// that turns an observation into a state transition. It commands
// AudioSessionAuthority (session), AudioGraph (the Voice-Processing I/O
// substrate: capture + output), and executes
// what HealthSupervisor requests and RecoveryPolicy allows. Everything it does
// is journalled with cause, generation and causal parent (`causeSeq`).
//
// Commands (intentions): enterConversation · leaveConversation · setMicEnabled
// · setOutputEnabled · setOutputOverride · play(known PCM) · cancel · setFaults
// · requestDiagnosticsSnapshot · recordManualIntervention · recordAppLifecycle
// · exportJournalJSONL · journalEvents.
// Observations: input callbacks, render progress, session events,
// hardware-format changes, app lifecycle — each carrying the generation that
// produced it and each becoming a journal record whose seq is the causal
// parent of any act it provokes.
import Foundation

public actor VoiceKernel {
    private let recorder: FlightRecorder
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

    /// Causality (P8): the seq of the most recent observation record. Every
    /// automatic act names the observation that caused it.
    private var lastObservationSeq: Int?

    /// VPIO-01: the route at this generation's successful start (from the
    /// authority, never from the substrate) and whether the physical I/O
    /// instance actually started. Both are nil/false until `startGraph`
    /// returns without throwing; both are cleared whenever the instance is
    /// stopped. Route recovery is lawful only against a started generation
    /// (founder ruling, plan §11 item 4).
    private var routeAtStart: RouteState?
    private var substrateStarted = false

    /// PRE-WITNESS-05 Phase A (founder amendment 1): after `start_return`,
    /// `engine.isRunning` is observed on every EXISTING ~100 ms tick until at
    /// least 1000 ms have elapsed — no new timer; the record carries the actual
    /// `msSinceStartReturn`, never a nominal value. Plus the first input
    /// callback per generation.
    private var startReturnedAtMs: Int64?
    private var runningObservationDone = true
    private var firstCallbackSeen = true

    /// Physiology sampling (P4): bounded, aggregated once per second.
    private struct InputAggregate {
        var callbacks = 0; var frames = 0
        var rmsMin: Float = .greatestFiniteMagnitude; var rmsSum: Float = 0; var rmsMax: Float = 0
        var peakMax: Float = 0; var digitalZero = 0; var noiseFloor = 0; var signal = 0
    }
    private var agg = InputAggregate()
    private var lastSampleMs: Int64 = 0
    private let sampleEveryMs: Int64 = 1_000

    /// SOURCE-ID-02 (founder ruling 2026-09-15): source-identification EVIDENCE,
    /// aggregated on the same tick as `input_health_sample` and journalled beside
    /// it as `input_source_sample`. Nothing here is read by the supervisor, the
    /// recovery policy, the projection or any floor transition; the record is
    /// never a causal parent (it is never assigned to `lastObservationSeq`).
    private struct SourceAggregate {
        var frames = 0; var resets = 0; var frameFrames = 0; var sampleRate = 0.0
        var sum = SIMD8<Double>(repeating: 0)
        var maxLane = SIMD8<Double>(repeating: -Double.greatestFiniteMagnitude)
        var minLane = SIMD8<Double>(repeating: Double.greatestFiniteMagnitude)
        var e997: [Double] = []      // ORDERED frame envelope of the stimulus bin (the 2 Hz signature lives in the order)
        var e440: [Double] = []      // ORDERED frame envelope of the own-tone bin (the confound control)
        static let capacity = 64     // > any 1 s tick at 25 frames/s; beyond it frames still count but are not sequenced
        mutating func add(_ o: SourceObservation) {
            frames += 1; if o.frameReset { resets += 1 }
            frameFrames = o.frameFrames; sampleRate = o.sampleRate
            sum += o.magnitudes; maxLane = pointwiseMax(maxLane, o.magnitudes); minLane = pointwiseMin(minLane, o.magnitudes)
            if e997.count < Self.capacity { e997.append(o[bin: 997]); e440.append(o[bin: 440]) }
        }
    }
    private var sourceAgg = SourceAggregate()

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

    // MARK: - journal access (C2: lawful actor boundary; the harness never touches the recorder)

    public func exportJournalJSONL() -> String { recorder.exportJSONL() }
    public func journalEvents() -> [JournalEvent] { recorder.snapshot() }

    // MARK: - commands

    public func enterConversation() async {
        guard !inConversation else { return }
        inConversation = true
        let cmd = journal("VoiceKernel", "command", cause: "enterConversation")
        transition(to: .entering, cause: "enterConversation", causeSeq: cmd)
        #if os(iOS)
        let s = AudioSessionAuthority(recorder: recorder)
        s.onEvent = { [weak self] e, seq in Task { await self?.handleSession(e, observationSeq: seq) } }
        session = s
        do {
            let g = recovery.nextGeneration()
            s.setGeneration(g)
            let configured = try s.configureForConversation(cause: "enterConversation", causeSeq: cmd)
            snap.audioSession = .active
            snap.route = s.currentRoute()
            s.startObserving()
            try startGraph(generation: g, cause: "enterConversation", causeSeq: configured)
        } catch {
            // PRE-WITNESS-02 §3.3: reviewed, not widened. A generation-1 refusal
            // (now journalled as graph_start_refused) still degrades without a
            // recovery attempt; whether it should enter RecoveryPolicy is
            // decided by the plan's §4 evidence, not here.
            let err = journal("VoiceKernel", "error", cause: "enterConversation_failed", causeSeq: cmd, evidence: ["error": "\(error)"])
            transition(to: .degraded, cause: "enterConversation_failed", causeSeq: err)
            publish()
            return
        }
        #else
        let g = recovery.nextGeneration()
        do { try startGraph(generation: g, cause: "enterConversation", causeSeq: cmd) } catch {
            let err = journal("VoiceKernel", "error", cause: "enterConversation_failed", causeSeq: cmd, evidence: ["error": "\(error)"])
            transition(to: .degraded, cause: "enterConversation_failed", causeSeq: err)
        }
        #endif
        startTick()
        publish()
    }

    public func leaveConversation() async {
        guard inConversation else { return }
        let cmd = journal("VoiceKernel", "command", cause: "leaveConversation")
        pendingRecovery?.cancel(); pendingRecovery = nil
        stopTick()
        cancelAllStreams(cause: "leaveConversation", causeSeq: cmd)
        graph?.stop(); graph = nil; substrateStarted = false; routeAtStart = nil
        #if os(iOS)
        session?.stopObserving()
        try? session?.release(cause: "leaveConversation", causeSeq: cmd)
        session = nil
        #endif
        health.markSessionLost()
        snap.audioSession = .inactive
        snap.inputFlow = .unknown; snap.outputFlow = .idle
        inConversation = false
        transition(to: .idle, cause: "leaveConversation", causeSeq: cmd)
        publish()
    }

    /// PRE-WITNESS-03 C — harness-only, pre-Enter voice-processing control.
    /// Default stays ON. The setting is journalled; in conversation it is
    /// refused (also journalled) — the causal discriminator is set before
    /// Enter, never mid-encounter. Architecture unchanged: the graph still
    /// receives `snap.voiceProcessingEnabled` exactly as before.
    public func setVoiceProcessing(_ on: Bool) {
        let cmd = journal("VoiceKernel", "command", cause: "setVoiceProcessing",
                          evidence: ["requested": String(on), "inConversation": String(inConversation)])
        guard !inConversation else {
            journal("VoiceKernel", "command_refused", cause: "setVoiceProcessing_in_conversation", causeSeq: cmd,
                    evidence: ["voiceProcessing": String(snap.voiceProcessingEnabled)])
            publish()
            return
        }
        snap.voiceProcessingEnabled = on
        journal("VoiceKernel", "voice_processing_set", cause: "setVoiceProcessing", causeSeq: cmd,
                evidence: ["voiceProcessing": String(on)])
        publish()
    }

    public func setMicEnabled(_ on: Bool) {
        journal("VoiceKernel", "command", cause: on ? "setMicEnabled(true)" : "setMicEnabled(false)")
        snap.micEnabled = on
        publish()
    }

    public func setOutputEnabled(_ on: Bool) {
        let cmd = journal("VoiceKernel", "command", cause: on ? "setOutputEnabled(true)" : "setOutputEnabled(false)")
        snap.outputEnabled = on
        if !on { cancelAllStreams(cause: "setOutputEnabled(false)", causeSeq: cmd) }
        publish()
    }

    /// K00-11 route exercise (P7a): speaker vs system default, through the
    /// authority only. On macOS this is a journalled no-op.
    public func setOutputOverride(speaker: Bool) {
        let cmd = journal("VoiceKernel", "command", cause: speaker ? "setOutputOverride(speaker)" : "setOutputOverride(none)")
        #if os(iOS)
        do {
            try session?.overrideOutput(speaker: speaker, cause: "command:setOutputOverride", causeSeq: cmd)
            snap.outputOverrideSpeaker = speaker
            snap.route = session?.currentRoute() ?? snap.route
        } catch {
            journal("VoiceKernel", "error", cause: "output_override_failed", causeSeq: cmd, evidence: ["error": "\(error)"])
        }
        #else
        _ = cmd
        #endif
        publish()
    }

    /// Harness only: render known PCM (a tone). KERNEL-00 has no synthesizer.
    @discardableResult
    public func playTone(seconds: Double = 3.0, frequencyHz: Double = 440) -> OutputStreamID? {
        let cmd = journal("VoiceKernel", "command", cause: "playTone", evidence: ["seconds": String(seconds)])
        guard inConversation, snap.outputEnabled, let g = graph, snap.floor == .listening else {
            journal("VoiceKernel", "play_refused", cause: "not_listening_or_output_disabled", causeSeq: cmd)
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
        let sched = journal("OutputController", "stream_scheduled", to: id.raw, cause: "command:playTone", causeSeq: cmd,
                            evidence: ["framesScheduled": String(frames), "seconds": String(seconds)])
        transition(to: .maiaSpeaking, cause: "stream_rendering:\(id.raw)", causeSeq: sched)
        publish()
        return id
    }

    public func cancel(_ id: OutputStreamID) {
        let cmd = journal("VoiceKernel", "command", cause: "cancel", evidence: ["stream": id.raw])
        cancelStream(id, cause: "command:cancel", causeSeq: cmd)
        publish()
    }

    public func setFaults(_ f: FaultInjection) {
        journal("Harness", "faults_set", cause: "command:setFaults",
                evidence: ["digitalZeroInput": String(f.digitalZeroInput), "stallOutput": String(f.stallOutput),
                           "holdStaleCallback": String(f.holdStaleCallback), "persistentFault": String(f.persistentFault)])
        snap.faults = f
        graph?.setSyntheticStall(f.stallOutput)   // P6: the stall lives at the observation seam
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

    /// App lifecycle observation (P7b, K00-14). The harness forwards
    /// UIApplication notifications; the kernel journals them as observations.
    public func recordAppLifecycle(_ phase: String) {
        lastObservationSeq = journal("Harness", "app_lifecycle", cause: phase,
                                     evidence: ["floor": snap.floor.rawValue, "audioSession": snap.audioSession.rawValue,
                                                "inputFlow": snap.inputFlow.rawValue])
        publish()
    }

    public func requestDiagnosticsSnapshot() -> KernelSnapshot {
        snap.journalCount = recorder.count
        return snap
    }

    /// A member act that leaves `degraded` (state model §2: degraded → entering).
    public func reenterAfterDegraded() async {
        guard snap.floor == .degraded else { return }
        let cmd = journal("VoiceKernel", "command", cause: "reenter")
        recovery.clearBudget()
        snap.recovery.degradedCause = nil
        snap.recovery.attemptsInWindow = 0
        inConversation = false
        graph?.stop(); graph = nil; substrateStarted = false; routeAtStart = nil
        transition(to: .idle, cause: "reenter", causeSeq: cmd)
        await enterConversation()
    }

    // MARK: - graph lifecycle

    private func startGraph(generation g: Int, cause: String, causeSeq: Int?) throws {
        // §3.4: how long the generation being replaced actually lived.
        let priorAge = graph.flatMap { $0.ageMs(now: clock()) }
        let priorGen = graph?.generation
        graph?.stop()
        substrateStarted = false
        routeAtStart = nil
        let ag = AudioGraph(generation: g)
        ag.onInput = { [weak self] o in Task { await self?.handleInput(o) } }
        ag.onStreamComplete = { [weak self] id, gen in Task { await self?.handleStreamComplete(id, generation: gen) } }
        ag.onFormatChanged = { [weak self] gen, fmt in Task { await self?.handleFormatChanged(generation: gen, format: fmt) } }
        ag.onSource = { [weak self] o in Task { await self?.handleSource(o) } }   // SOURCE-ID-02: evidence hop, 25/s
        do {
            try ag.start(voiceProcessing: snap.voiceProcessingEnabled, clock: clock) { step, ev in
                // Phase A: one journal record per startup seam, in the order it happened.
                var e = ev
                e["step"] = step.rawValue
                e["generation"] = String(g)
                journal("VoiceIO", "graph_start_trace", cause: cause, causeSeq: causeSeq, evidence: e)
            }
        } catch {
            // §3.1/§3.2: a refused build. Journal the format the precondition
            // saw, then let the error take the road that already exists
            // (rebuildGraph → graph_rebuild_failed → RecoveryPolicy, or
            // enterConversation_failed for generation 1). No new recovery logic.
            var ev = ["error": "\(error)", "generation": String(g)]
            ev.merge(formatEvidence(ag.inputFormatAtStart())) { a, _ in a }
            ev.merge(ageEvidence(priorGeneration: priorGen, priorAgeMs: priorAge)) { a, _ in a }
            journal("VoiceKernel", "graph_start_refused", cause: cause, causeSeq: causeSeq, evidence: ev)
            throw error
        }
        graph = ag
        ag.setSyntheticStall(snap.faults.stallOutput)
        snap.generation = g
        snap.recovery.generation = g
        snap.inputCallbacksInGeneration = 0
        agg = InputAggregate(); sourceAgg = SourceAggregate(); lastSampleMs = clock()
        health.beginGeneration(g, nowMs: clock())
        snap.inputFlow = health.inputFlow
        snap.outputFlow = health.outputFlow
        #if os(iOS)
        session?.setGeneration(g)
        snap.route = session?.currentRoute() ?? snap.route
        #endif
        // Phase A: arm the post-start observations for this generation.
        startReturnedAtMs = clock()
        runningObservationDone = false
        firstCallbackSeen = false
        routeAtStart = snap.route
        substrateStarted = true
        var started = ["voiceProcessing": String(snap.voiceProcessingEnabled), "ioRunning": String(ag.isRunning),
                       "generationAgeMs": "0",
                       "routeAtStart": "\(snap.route.output)/\(snap.route.input)"]
        started.merge(formatEvidence(ag.inputFormatAtStart())) { a, _ in a }
        started.merge(ageEvidence(priorGeneration: priorGen, priorAgeMs: priorAge)) { a, _ in a }
        journal("VoiceKernel", "graph_started", cause: cause, causeSeq: causeSeq, evidence: started)
    }

    // §3.4 seam evidence (additive fields; K00-17 record coherence).
    private func formatEvidence(_ f: InputFormatObservation?) -> [String: String] {
        guard let f = f else { return [:] }
        return ["inputSampleRate": String(f.sampleRate), "inputChannels": String(f.channels), "inputFormatValid": String(f.isValid)]
    }
    private func ageEvidence(priorGeneration: Int?, priorAgeMs: Int64?) -> [String: String] {
        var ev: [String: String] = [:]
        if let g = priorGeneration { ev["priorGeneration"] = String(g) }
        if let a = priorAgeMs { ev["priorGenerationAgeMs"] = String(a) }
        return ev
    }

    // MARK: - observations

    private func handleInput(_ raw: InputObservation) {
        // K00-09: generation gate. A callback from a previous generation is
        // journalled (as an observation) and dropped; it changes nothing.
        guard raw.generation == snap.generation else {
            lastObservationSeq = journal("VoiceKernel", "stale_callback_dropped", cause: "generation_mismatch",
                                         evidence: ["callbackGeneration": String(raw.generation), "current": String(snap.generation)])
            publish()
            return
        }
        // Fault: hold one callback and fire it after the next recovery.
        if snap.faults.holdStaleCallback && heldStale == nil {
            heldStale = raw
            journal("Harness", "callback_held", cause: "fault:holdStaleCallback", evidence: ["generation": String(raw.generation)])
            return
        }
        var o = raw
        let synthetic = snap.faults.digitalZeroInput || snap.faults.persistentFault
        if synthetic { o.rms = 0; o.peak = 0 }
        health.observeInput(o)
        aggregate(o)
        snap.inputCallbacksInGeneration = health.callbacksInGeneration
        snap.lastInputRms = o.rms; snap.lastInputPeak = o.peak
        let before = snap.inputFlow
        snap.inputFlow = health.inputFlow
        if before != snap.inputFlow {
            lastObservationSeq = journal("HealthSupervisor", "input_flow", from: before.rawValue, to: snap.inputFlow.rawValue,
                                         cause: "observation", evidence: ["rms": String(o.rms), "peak": String(o.peak),
                                                                          "frames": String(o.frames), "synthetic": String(synthetic)])
        }
        if !firstCallbackSeen {
            firstCallbackSeen = true
            lastObservationSeq = journal("VoiceIO", "first_input_callback", cause: "observation",
                                         evidence: ["generation": String(snap.generation),
                                                    "msSinceStartReturn": startReturnedAtMs.map { String(clock() - $0) } ?? "-",
                                                    "frames": String(raw.frames)])
        }
        if snap.floor == .entering && snap.inputFlow == .healthy {
            transition(to: .listening, cause: "input_flow_healthy", causeSeq: lastObservationSeq)
        }
        if snap.floor == .recovering && snap.inputFlow == .healthy {
            transition(to: .listening, cause: "recovery_flow_reobserved", causeSeq: lastObservationSeq)
        }
        evaluate()
        publish()
    }

    private func aggregate(_ o: InputObservation) {
        agg.callbacks += 1; agg.frames += o.frames
        agg.rmsMin = min(agg.rmsMin, o.rms); agg.rmsSum += o.rms; agg.rmsMax = max(agg.rmsMax, o.rms)
        agg.peakMax = max(agg.peakMax, o.peak)
        switch o.classify(HealthThresholds()) {
        case .digitalZero: agg.digitalZero += 1
        case .noiseFloor: agg.noiseFloor += 1
        case .signal: agg.signal += 1
        }
    }

    /// P4: one bounded physiology record per second — input cadence/energy and,
    /// while rendering, output progress. ~3 600/hour, well inside the recorder cap.
    private func sampleIfDue(now: Int64) {
        guard now - lastSampleMs >= sampleEveryMs else { return }
        let a = agg
        let meanRms = a.callbacks > 0 ? a.rmsSum / Float(a.callbacks) : 0
        lastObservationSeq = journal("HealthSupervisor", "input_health_sample", cause: "sample",
                                     evidence: ["windowMs": String(now - lastSampleMs), "callbacks": String(a.callbacks),
                                                "frames": String(a.frames),
                                                "rmsMin": a.callbacks > 0 ? String(a.rmsMin) : "-",
                                                "rmsMean": String(meanRms), "rmsMax": String(a.rmsMax), "peakMax": String(a.peakMax),
                                                "digitalZero": String(a.digitalZero), "noiseFloor": String(a.noiseFloor),
                                                "signal": String(a.signal), "inputFlow": snap.inputFlow.rawValue,
                                                "route": "\(snap.route.output)/\(snap.route.input)",
                                                "ioRunning": graph.map { String($0.isRunning) } ?? "-",
                                                "synthetic": String(snap.faults.digitalZeroInput || snap.faults.persistentFault)])
        if let g = graph, let r = g.renderStats() {
            lastObservationSeq = journal("OutputController", "output_render_sample", cause: "sample",
                                         evidence: ["stream": r.streamId.raw, "framesRendered": String(r.framesRendered),
                                                    "framesScheduled": String(r.framesScheduled),
                                                    "outputFlow": snap.outputFlow.rawValue, "synthetic": String(r.synthetic)])
        }
        // SOURCE-ID-02: the evidence-only source record, same tick, same window.
        let sa = sourceAgg
        var src: [String: String] = ["windowMs": String(now - lastSampleMs), "generation": String(snap.generation),
                                     "frames": String(sa.frames), "frameReset": String(sa.resets),
                                     "frameFrames": String(sa.frameFrames), "analysisRateHz": String(sa.sampleRate),
                                     "frameMs": sa.sampleRate > 0 ? String(Double(sa.frameFrames) * 1000.0 / sa.sampleRate) : "-",
                                     "binsHz": SourceEstimator.binsHz.map { String(Int($0)) }.joined(separator: ",")]
        for (i, hz) in SourceEstimator.binsHz.enumerated() {
            let b = "e\(Int(hz))"
            src[b + "Mean"] = sa.frames > 0 ? String(sa.sum[i] / Double(sa.frames)) : "-"
            src[b + "Max"] = sa.frames > 0 ? String(sa.maxLane[i]) : "-"
            src[b + "Min"] = sa.frames > 0 ? String(sa.minLane[i]) : "-"
        }
        let frameSeconds = sa.sampleRate > 0 ? Double(sa.frameFrames) / sa.sampleRate : 0
        src["m2_997"] = SourceSignature.modulationIndex(sa.e997, frameSeconds: frameSeconds).map { String($0) } ?? "-"
        src["m2_440"] = SourceSignature.modulationIndex(sa.e440, frameSeconds: frameSeconds).map { String($0) } ?? "-"
        journal("SourceEvidence", "input_source_sample", cause: "sample", evidence: src)
        agg = InputAggregate()
        sourceAgg = SourceAggregate()
        lastSampleMs = now
    }

    /// SOURCE-ID-02: generation-gated like every observation; a frame from a
    /// previous generation is dropped without a record (evidence, not an act).
    private func handleSource(_ o: SourceObservation) {
        guard o.generation == snap.generation else { return }
        sourceAgg.add(o)
    }

    private func handleStreamComplete(_ id: OutputStreamID, generation gen: Int) {
        guard gen == snap.generation else {
            lastObservationSeq = journal("VoiceKernel", "stale_callback_dropped", cause: "generation_mismatch",
                                         evidence: ["stream": id.raw, "callbackGeneration": String(gen), "current": String(snap.generation)])
            return
        }
        guard let i = snap.streams.firstIndex(where: { $0.id == id }), snap.streams[i].state == .rendering else { return }
        snap.streams[i].state = .complete
        snap.streams[i].framesRendered = snap.streams[i].framesScheduled
        snap.streams[i].endedAtMs = clock()
        health.endRendering(id)
        snap.outputFlow = health.outputFlow
        let obs = journal("OutputController", "stream_complete", from: id.raw, cause: "frames_rendered",
                          evidence: ["framesRendered": String(snap.streams[i].framesRendered)])
        lastObservationSeq = obs
        if snap.floor == .maiaSpeaking { transition(to: .listening, cause: "stream_complete:\(id.raw)", causeSeq: obs) }
        publish()
    }

    /// VPIO-01: the unit's hardware input stream-format property changed.
    /// An OBSERVATION only (VPIO-01A census §5; founder ruling, plan §11):
    /// no classifier, no expectation, no recovery request, no rebuild. If
    /// the change kills the input, the HealthSupervisor's existing windows
    /// earn the recovery and may name this record as their causal parent.
    private func handleFormatChanged(generation gen: Int, format now: InputFormatObservation) {
        // Exit guard (K00-W4): a notification after the member left is
        // evidence, never an act: journalled, dropped, no generation, no graph.
        guard inConversation else {
            lastObservationSeq = journal("VoiceKernel", "stale_callback_dropped", cause: "not_in_conversation",
                                         evidence: ["kind": "formatChange", "callbackGeneration": String(gen),
                                                    "floor": "\(snap.floor)"])
            return
        }
        guard gen == snap.generation else {
            lastObservationSeq = journal("VoiceKernel", "stale_callback_dropped", cause: "generation_mismatch",
                                         evidence: ["kind": "formatChange", "callbackGeneration": String(gen)])
            return
        }
        var ev: [String: String] = [
            "generation": String(snap.generation),
            "callbacksSinceStart": String(snap.inputCallbacksInGeneration),
            "route": "\(snap.route.output)/\(snap.route.input)",
        ]
        ev.merge(formatEvidence(now)) { a, _ in a }               // the format at the instant the unit posted it
        if let g = graph {
            if let f = g.inputFormatAtStart() { ev["formatAtStart"] = "\(f.sampleRate)/\(f.channels)" }
            if let age = g.ageMs(now: clock()) { ev["generationAgeMs"] = String(age) }
            ev["ioRunning"] = String(g.isRunning)
        }
        lastObservationSeq = journal("VoiceIO", "io_format_changed", cause: "unit_property_listener", evidence: ev)
        publish()
    }

    #if os(iOS)
    private func handleSession(_ e: SessionEvent, observationSeq: Int) {
        lastObservationSeq = observationSeq
        switch e {
        case .interruptionBegan:
            suspended = true
            snap.audioSession = .interrupted
            cancelAllStreams(cause: "interruption_began", causeSeq: observationSeq)
            graph?.stop(); substrateStarted = false; routeAtStart = nil
            health.markSessionLost()
            snap.inputFlow = .unknown; snap.outputFlow = .idle
            transition(to: .recovering, cause: "interruption_began", causeSeq: observationSeq)
        case .interruptionEnded(let resume):
            // KERNEL-00 policy: always attempt to resume; `shouldResume` is
            // recorded as evidence, not obeyed as authority.
            var parent = observationSeq
            do {
                parent = try session?.configureForConversation(cause: "interruption_recovery", causeSeq: observationSeq) ?? observationSeq
                snap.audioSession = .active
            } catch {
                parent = journal("VoiceKernel", "error", cause: "interruption_recovery_failed", causeSeq: observationSeq,
                                 evidence: ["error": "\(error)", "shouldResume": String(resume)])
            }
            suspended = false
            rebuildGraph(cause: "interruption_recovery", causeSeq: parent)
        case .routeChanged(_, let route):
            let previous = snap.route
            snap.route = route
            // VPIO-01 (founder ruling, plan §11 item 4): the authority's own
            // route_changed observation is the causal parent of route recovery.
            // Same ports (data-source alternation) = evidence only. A recovery
            // act is lawful only against a successfully started generation —
            // never after a refused entry, never while suspended, never from
            // degraded — and only through the existing policy: no direct rebuild.
            let eligible = inConversation && !suspended && substrateStarted && routeAtStart != nil && snap.floor != .degraded
            let portsChanged = !RouteComparison.samePorts(routeAtStart, route)
            let ev: [String: String] = ["routeAtStart": routeAtStart.map { "\($0.output)/\($0.input)" } ?? "-",
                                        "routeNow": "\(route.output)/\(route.input)",
                                        "previous": "\(previous.output)/\(previous.input)",
                                        "eligible": String(eligible), "portsChanged": String(portsChanged),
                                        "floor": snap.floor.rawValue]
            if eligible && portsChanged {
                let req = journal("VoiceKernel", "recovery_requested", cause: "session_route_change", causeSeq: observationSeq, evidence: ev)
                requestRecovery(faultClass: "configuration_change", causeSeq: req)
            } else {
                lastObservationSeq = journal("VoiceKernel", "route_observed", cause: portsChanged ? "route_change_not_eligible" : "same_ports",
                                             causeSeq: observationSeq, evidence: ev)
            }
        case .mediaServicesReset:
            snap.audioSession = .resetting
            cancelAllStreams(cause: "media_services_reset", causeSeq: observationSeq)
            graph?.stop(); substrateStarted = false; routeAtStart = nil
            health.markSessionLost()
            transition(to: .recovering, cause: "media_services_reset", causeSeq: observationSeq)
            var parent = observationSeq
            do {
                parent = try session?.configureForConversation(cause: "media_services_reset_recovery", causeSeq: observationSeq) ?? observationSeq
                snap.audioSession = .active
            } catch {
                parent = journal("VoiceKernel", "error", cause: "reset_recovery_failed", causeSeq: observationSeq, evidence: ["error": "\(error)"])
            }
            rebuildGraph(cause: "media_services_reset_recovery", causeSeq: parent)
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
        let now = clock()
        if let g = graph, let r = g.renderStats(), r.framesScheduled > 0 {
            // P6: under a synthetic stall the graph returns frozen stats, so the
            // supervisor, the snapshot and the journal all see progress stop.
            health.observeOutput(OutputObservation(generation: snap.generation, timeMs: now, streamId: r.streamId,
                                                   framesRendered: r.framesRendered, framesScheduled: r.framesScheduled))
            if let i = snap.streams.firstIndex(where: { $0.id == r.streamId }), snap.streams[i].state == .rendering {
                snap.streams[i].framesRendered = r.framesRendered
            }
        }
        if let g = graph, let t = startReturnedAtMs, !runningObservationDone {
            let ms = now - t
            lastObservationSeq = journal("VoiceIO", "io_running_observed", cause: "tick",
                                         evidence: ["generation": String(snap.generation), "msSinceStartReturn": String(ms),
                                                    "ioRunning": String(g.isRunning),
                                                    "callbacksSoFar": String(snap.inputCallbacksInGeneration)])
            if ms >= 1_000 { runningObservationDone = true }
        }
        sampleIfDue(now: now)
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
            let req = journal("HealthSupervisor", "recovery_requested", cause: "entry_timeout", causeSeq: lastObservationSeq,
                              evidence: ["waitedMs": String(waited)])
            requestRecovery(faultClass: "entry_timeout", causeSeq: req)
        case .inputDead(let since):
            let req = journal("HealthSupervisor", "recovery_requested", cause: "input_dead", causeSeq: lastObservationSeq,
                              evidence: ["sinceMs": String(since), "ioRunning": String(graph?.isRunning ?? false)])
            requestRecovery(faultClass: "input_dead", causeSeq: req)
        case .outputStalled(let id, let since):
            let req = journal("HealthSupervisor", "recovery_requested", cause: "output_stalled", causeSeq: lastObservationSeq,
                              evidence: ["stream": id.raw, "sinceMs": String(since), "synthetic": String(snap.faults.stallOutput)])
            cancelStream(id, cause: "output_stalled", causeSeq: req, failed: true)
            requestRecovery(faultClass: "output_stalled", causeSeq: req)
        }
    }

    private func requestRecovery(faultClass: String, causeSeq: Int) {
        guard pendingRecovery == nil else {              // one recovery in flight per generation (VOICE-06)
            // Record coherence (K00-17): the request is coalesced into the pending one, and the journal says so.
            journal("VoiceKernel", "recovery_request_coalesced", cause: faultClass, causeSeq: causeSeq,
                    evidence: ["pending": snap.recovery.lastFaultClass ?? "-"])
            return
        }
        let now = clock()
        let decision = recovery.decide(faultClass: faultClass, nowMs: now)
        snap.recovery.lastFaultClass = faultClass
        snap.recovery.attemptsInWindow = recovery.attemptsInWindow(faultClass: faultClass, nowMs: now)
        switch decision {
        case .degraded(let cause, let attempts):
            snap.recovery.degradedCause = cause
            let deg = journal("VoiceKernel", "degraded", cause: cause, causeSeq: causeSeq,
                              evidence: ["attempts": String(attempts), "budget": String(snap.recovery.budget)])
            cancelAllStreams(cause: "degraded", causeSeq: deg)
            graph?.stop(); graph = nil; substrateStarted = false; routeAtStart = nil
            transition(to: .degraded, cause: "budget_exhausted:\(cause)", causeSeq: deg)
        case .retry(let after, let attempt, let gen):
            let sched = journal("VoiceKernel", "recovery_scheduled", cause: faultClass, causeSeq: causeSeq,
                                evidence: ["afterMs": String(after), "attempt": String(attempt), "nextGeneration": String(gen)])
            if snap.floor != .recovering { transition(to: .recovering, cause: "recovery_scheduled:\(faultClass)", causeSeq: sched) }
            pendingRecovery = Task { [weak self] in
                try? await Task.sleep(nanoseconds: UInt64(after) * 1_000_000)
                await self?.performRecovery(generation: gen, faultClass: faultClass, causeSeq: sched)
            }
        }
    }

    private func performRecovery(generation gen: Int, faultClass: String, causeSeq: Int) {
        pendingRecovery = nil
        guard inConversation, snap.floor == .recovering else { return }
        let started = journal("VoiceKernel", "recovery_started", cause: faultClass, causeSeq: causeSeq, evidence: ["generation": String(gen)])
        rebuildGraph(cause: "recovery:\(faultClass)", causeSeq: started, generation: gen)
        // Fault: replay the held callback now — it carries the OLD generation and must be dropped.
        if let held = heldStale {
            heldStale = nil
            handleInput(held)
        }
        publish()
    }

    private func rebuildGraph(cause: String, causeSeq: Int, generation: Int? = nil) {
        let g = generation ?? recovery.nextGeneration()
        cancelAllStreams(cause: cause, causeSeq: causeSeq)   // a stream cannot survive its graph; VOICE-10 makes that explicit
        do {
            try startGraph(generation: g, cause: cause, causeSeq: causeSeq)
            let rebuilt = journal("VoiceKernel", "graph_rebuilt", cause: cause, causeSeq: causeSeq, evidence: ["generation": String(g)])
            if snap.floor != .recovering && snap.floor != .entering {
                transition(to: .recovering, cause: cause, causeSeq: rebuilt)
            }
        } catch {
            let err = journal("VoiceKernel", "error", cause: "graph_rebuild_failed", causeSeq: causeSeq,
                              evidence: ["error": "\(error)", "generation": String(g)])
            let req = journal("HealthSupervisor", "recovery_requested", cause: "graph_rebuild_failed", causeSeq: err)
            requestRecovery(faultClass: "graph_rebuild_failed", causeSeq: req)
        }
    }

    // MARK: - output control (VOICE-10; K00-05 measured at the render seam — P5)

    private func cancelStream(_ id: OutputStreamID, cause: String, causeSeq: Int, failed: Bool = false) {
        guard let i = snap.streams.firstIndex(where: { $0.id == id }), snap.streams[i].state == .rendering else { return }
        let g = graph
        let issuedAt = clock()
        let rendered = g?.cancel(id) ?? snap.streams[i].framesRendered
        snap.streams[i].state = failed ? .failed : .cancelled
        snap.streams[i].framesRendered = rendered
        snap.streams[i].endedAtMs = issuedAt
        health.endRendering(id, failed: failed)
        snap.outputFlow = health.outputFlow
        let act = journal("OutputController", failed ? "stream_failed" : "stream_cancelled", from: id.raw, cause: cause, causeSeq: causeSeq,
                          evidence: ["framesRendered": String(rendered), "framesScheduled": String(snap.streams[i].framesScheduled),
                                     "cancelIssuedAtMs": String(issuedAt)])
        if snap.floor == .maiaSpeaking {
            transition(to: .listening, cause: "\(failed ? "stream_failed" : "stream_cancelled"):\(id.raw)", causeSeq: act)
        }
        // P5: the ratified metric is cancel(handle) → last rendered non-silent
        // frame. The render tap keeps observing after stop(); read it after the
        // window has had time to elapse and journal the measurement.
        if let g = g {
            Task { [weak self] in
                try? await Task.sleep(nanoseconds: 300_000_000)
                await self?.measureCancel(id: id, graph: g, issuedAt: issuedAt, causeSeq: act)
            }
        }
    }

    private func measureCancel(id: OutputStreamID, graph g: AudioGraph, issuedAt: Int64, causeSeq: Int) {
        let last = g.lastNonSilentRenderedAtMs()
        let toSilence: Int64 = {
            guard let l = last, l > issuedAt else { return 0 }
            return l - issuedAt
        }()
        snap.lastCancelToSilenceMs = toSilence
        journal("OutputController", "stream_cancel_measured", from: id.raw, cause: "render_tap", causeSeq: causeSeq,
                evidence: ["cancelIssuedAtMs": String(issuedAt),
                           "lastNonSilentRenderedAtMs": last.map(String.init) ?? "-",
                           "cancelToSilenceMs": String(toSilence),
                           "withinRatifiedWindow": String(toSilence <= health.thresholds.cancelWindowMs)])
        publish()
    }

    private func cancelAllStreams(cause: String, causeSeq: Int) {
        for s in snap.streams where s.state == .rendering { cancelStream(s.id, cause: cause, causeSeq: causeSeq) }
    }

    // MARK: - state + journal

    private func transition(to: FloorState, cause: String, causeSeq: Int?) {
        let from = snap.floor
        guard from != to else { return }
        snap.floor = to
        snap.lastCause = cause
        journal("VoiceKernel", "floor_transition", from: from.rawValue, to: to.rawValue, cause: cause, causeSeq: causeSeq)
    }

    @discardableResult
    private func journal(_ component: String, _ event: String, from: String? = nil, to: String? = nil,
                         cause: String? = nil, causeSeq: Int? = nil, evidence: [String: String] = [:]) -> Int {
        recorder.record(generation: snap.generation, component: component, event: event,
                        from: from, to: to, cause: cause, causeSeq: causeSeq, evidence: evidence).seq
    }

    private func publish() {
        snap.journalCount = recorder.count
        projection.publish(snap)
    }
}
