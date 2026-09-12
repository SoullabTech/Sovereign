// KERNEL-00 · the duplex native audio graph.
//
// One AVAudioEngine per generation: input node with voice processing enabled
// (echo cancellation / AGC at the audio layer — research §3.1, §20.1) and an
// AVAudioPlayerNode for output. Input exists while output renders (duplex
// physiology, K00-06). The graph owns NO session state: it never touches
// AVAudioSession. It reports observations stamped with its generation so the
// kernel can drop anything stale (K00-09).
//
// Output has identity: `schedule` returns an OutputStreamID; `cancel` stops
// rendering for that identity (VOICE-10, ruled F3). KERNEL-00 renders one
// stream at a time.
//
// PRE-WITNESS-01: a tap on the player node observes what is actually rendered
// (P5) — cumulative frames and the monotonic time of the last non-silent
// buffer — so `cancel(handle) → last rendered frame` is measured rather than
// inferred from a function call's duration. The synthetic output stall (P6)
// freezes THIS observation seam, so supervisor, snapshot and journal agree.
//
// Realtime note: both taps run on the audio thread. They do arithmetic and
// hand small value structs on; the kernel hops to its actor. Bounded and
// adequate for KERNEL-00; a lock-free ring is a KERNEL-01 refinement.
import Foundation
import AVFoundation

public struct RenderStats: Sendable, Equatable {
    public var streamId: OutputStreamID
    public var framesRendered: Int64
    public var framesScheduled: Int64
    public var lastNonSilentRenderedAtMs: Int64?
    public var synthetic: Bool
}

/// PRE-WITNESS-02 §3.1: the only way `start` refuses. A Swift error thrown
/// BEFORE any input tap exists, so the invalid `installTap` call is
/// unreachable rather than caught. There is no NSException machinery in this
/// package; the source gate asserts that.
public enum AudioGraphError: Error, CustomStringConvertible, Equatable {
    case invalidInputFormat(sampleRate: Double, channels: Int)
    public var description: String {
        switch self {
        case .invalidInputFormat(let sr, let ch): return "invalidInputFormat(sampleRate: \(sr), channels: \(ch))"
        }
    }
}

/// The input node's format as observed at one instant, in plain numbers so it
/// can be journalled (§3.4) and validated (§3.1) without AVFoundation.
public struct InputFormatObservation: Sendable, Equatable {
    public var sampleRate: Double
    public var channels: Int
    public init(sampleRate: Double, channels: Int) { self.sampleRate = sampleRate; self.channels = channels }

    /// Pure precondition (§3.1): a format the hardware has not yet resolved
    /// (0 Hz, 0 channels — the witnessed 2026-09-11 state) is invalid.
    public var isValid: Bool { sampleRate > 0 && channels > 0 }

    /// Throws `AudioGraphError.invalidInputFormat` unless `isValid`.
    public func requireValid() throws {
        guard isValid else { throw AudioGraphError.invalidInputFormat(sampleRate: sampleRate, channels: channels) }
    }
}

public final class AudioGraph: @unchecked Sendable {
    public let generation: Int
    private let engine = AVAudioEngine()
    private let player = AVAudioPlayerNode()
    private var inputTapInstalled = false
    private var renderTapInstalled = false
    private var configObserver: NSObjectProtocol?
    private let lock = NSLock()
    private var activeStream: OutputStreamID?
    private var activeFrames: Int64 = 0
    private var renderedFramesForActive: Int64 = 0
    private var lastNonSilentAtMs: Int64?
    private var frozen: RenderStats?            // synthetic stall (P6)
    private var lastInputFormat: InputFormatObservation?   // §3.4
    private var startedAtMs: Int64?                        // §3.4 generation age
    private var clock: () -> Int64 = MonotonicClock.nowMs

    /// The format every output buffer must be in. Mono 48 kHz float; the mixer
    /// converts to the hardware format.
    public let outputFormat: AVAudioFormat
    private let silencePeak: Float = 1e-7

    public var onInput: ((InputObservation) -> Void)?
    public var onStreamComplete: ((OutputStreamID, Int) -> Void)?          // (stream, generation)
    public var onConfigurationChange: ((Int) -> Void)?                       // generation

    public init(generation: Int) {
        self.generation = generation
        self.outputFormat = AVAudioFormat(standardFormatWithSampleRate: 48_000, channels: 1)!
    }

    public var isRunning: Bool { engine.isRunning }

    /// PRE-WITNESS-05 Phase A — the closed set of startup seams the trace names.
    /// Observation only: no call in `start` is reordered or added-as-mutation.
    /// The kernel journals each step as `graph_start_trace`.
    ///
    /// P5-B0 (removal control, founder-selected 2026-09-12): the Phase-A read of the
    /// input node's format BEFORE `setVoiceProcessingEnabled` — and only that read —
    /// is REMOVED. The seam `input_format_before_vp` therefore no longer exists on
    /// this subject and is absent from the set (13 steps). Everything else in
    /// `start` is byte-for-byte the Phase-A subject `4596b9bdb`.
    public enum StartTraceStep: String, CaseIterable, Sendable {
        case engineCreated = "engine_created"
        case vpEnableBegin = "vp_enable_begin"
        case vpEnableReturn = "vp_enable_return"
        case outputConnected = "output_connected"
        case inputFormatAfterVP = "input_format_after_vp"
        case inputTapInstalled = "input_tap_installed"
        case renderTapInstalled = "render_tap_installed"
        case observerInstalled = "observer_installed"
        case prepareBegin = "prepare_begin"
        case prepareReturn = "prepare_return"
        case startBegin = "start_begin"
        case startReturn = "start_return"
        case isRunningImmediate = "is_running_immediate"
    }

    public func start(voiceProcessing: Bool, clock: @escaping () -> Int64 = MonotonicClock.nowMs,
                      trace: (StartTraceStep, [String: String]) -> Void = { _, _ in }) throws {
        self.clock = clock
        let t0 = clock()
        let input = engine.inputNode
        trace(.engineCreated, ["voiceProcessingRequested": String(voiceProcessing)])
        // P5-B0: no read of the input node's format happens here. The Phase-A
        // `input.outputFormat(forBus: 0)` that preceded `setVoiceProcessingEnabled`
        // is the one candidate cause under test; the first touch of the input
        // format on this subject is `input_format_after_vp` below, as in 35b0f61d0.
        // Must be set before the engine starts; global to both IO nodes (SURVEY-01 §2).
        trace(.vpEnableBegin, [:])
        let vpT = clock()
        do {
            try input.setVoiceProcessingEnabled(voiceProcessing)
        } catch {
            trace(.vpEnableReturn, ["outcome": "error", "error": "\(error)", "elapsedMs": String(clock() - vpT)])
            throw error
        }
        trace(.vpEnableReturn, ["outcome": "ok", "elapsedMs": String(clock() - vpT),
                                "readBack": String(input.isVoiceProcessingEnabled)])

        engine.attach(player)
        engine.connect(player, to: engine.mainMixerNode, format: outputFormat)
        trace(.outputConnected, [:])

        let inFormat = input.outputFormat(forBus: 0)
        trace(.inputFormatAfterVP, ["sampleRate": String(inFormat.sampleRate), "channels": String(inFormat.channelCount)])
        // §3.1 precondition: validated BEFORE the tap. If the hardware format
        // is unresolved this throws and `installTap` below is never reached.
        let observed = InputFormatObservation(sampleRate: inFormat.sampleRate, channels: Int(inFormat.channelCount))
        lock.lock(); lastInputFormat = observed; lock.unlock()
        try observed.requireValid()
        let gen = generation
        input.installTap(onBus: 0, bufferSize: 1024, format: inFormat) { [weak self] buffer, _ in
            guard let self = self else { return }
            let (frames, rms, peak) = Self.measure(buffer)
            self.onInput?(InputObservation(generation: gen, timeMs: clock(), frames: frames, rms: rms, peak: peak))
        }
        inputTapInstalled = true
        trace(.inputTapInstalled, [:])

        // Render observation (P5): what the player node actually emits.
        player.installTap(onBus: 0, bufferSize: 1024, format: outputFormat) { [weak self] buffer, _ in
            guard let self = self else { return }
            let (frames, _, peak) = Self.measure(buffer)
            let now = clock()
            self.lock.lock()
            if self.activeStream != nil {
                self.renderedFramesForActive = min(self.activeFrames, self.renderedFramesForActive + Int64(frames))
            }
            if peak > self.silencePeak { self.lastNonSilentAtMs = now }
            self.lock.unlock()
        }
        renderTapInstalled = true
        trace(.renderTapInstalled, [:])

        configObserver = NotificationCenter.default.addObserver(
            forName: .AVAudioEngineConfigurationChange, object: engine, queue: nil) { [weak self] _ in
            guard let self = self else { return }
            self.onConfigurationChange?(self.generation)
        }
        trace(.observerInstalled, [:])

        trace(.prepareBegin, [:])
        let pT = clock()
        engine.prepare()
        trace(.prepareReturn, ["elapsedMs": String(clock() - pT)])
        trace(.startBegin, [:])
        let sT = clock()
        do {
            try engine.start()
        } catch {
            trace(.startReturn, ["outcome": "error", "error": "\(error)", "elapsedMs": String(clock() - sT)])
            throw error
        }
        trace(.startReturn, ["outcome": "ok", "elapsedMs": String(clock() - sT), "totalMs": String(clock() - t0)])
        lock.lock(); startedAtMs = clock(); lock.unlock()
        trace(.isRunningImmediate, ["engineRunning": String(engine.isRunning)])
    }

    /// §3.4 seam evidence: the input node's format as the engine reports it
    /// right now (a query, never a mutation; it cannot raise).
    public func currentInputFormat() -> InputFormatObservation {
        let f = engine.inputNode.outputFormat(forBus: 0)
        return InputFormatObservation(sampleRate: f.sampleRate, channels: Int(f.channelCount))
    }

    /// The format observed by the last `start` attempt (valid or refused).
    public func inputFormatAtStart() -> InputFormatObservation? {
        lock.lock(); defer { lock.unlock() }
        return lastInputFormat
    }

    /// Milliseconds since this generation's engine started; nil if it never did.
    public func ageMs(now: Int64) -> Int64? {
        lock.lock(); defer { lock.unlock() }
        guard let s = startedAtMs else { return nil }
        return now - s
    }

    public func stop() {
        if let o = configObserver { NotificationCenter.default.removeObserver(o); configObserver = nil }
        if inputTapInstalled { engine.inputNode.removeTap(onBus: 0); inputTapInstalled = false }
        if renderTapInstalled { player.removeTap(onBus: 0); renderTapInstalled = false }
        player.stop()
        engine.stop()
        lock.lock(); activeStream = nil; frozen = nil; lock.unlock()
    }

    private static func measure(_ buffer: AVAudioPCMBuffer) -> (Int, Float, Float) {
        let frames = Int(buffer.frameLength)
        var peak: Float = 0
        var sumSq: Float = 0
        if let ch = buffer.floatChannelData, buffer.format.channelCount > 0 {
            let p = ch[0]
            var i = 0
            while i < frames {
                let v = p[i]
                let a = abs(v)
                if a > peak { peak = a }
                sumSq += v * v
                i += 1
            }
        }
        let rms = frames > 0 ? (sumSq / Float(frames)).squareRoot() : 0
        return (frames, rms, peak)
    }

    // MARK: output with identity

    /// Schedule PCM for rendering under a new stream identity. Returns the
    /// number of frames scheduled. Completion fires when the data has been
    /// RENDERED (not merely consumed) — `.dataRendered`.
    public func schedule(_ buffer: AVAudioPCMBuffer, as id: OutputStreamID) -> Int64 {
        let frames = Int64(buffer.frameLength)
        lock.lock()
        activeStream = id
        activeFrames = frames
        renderedFramesForActive = 0
        lock.unlock()
        let gen = generation
        player.scheduleBuffer(buffer, at: nil, options: [], completionCallbackType: .dataRendered) { [weak self] _ in
            guard let self = self else { return }
            self.lock.lock()
            let still = (self.activeStream == id)
            if still { self.activeStream = nil }
            self.lock.unlock()
            if still { self.onStreamComplete?(id, gen) }
        }
        if !player.isPlaying { player.play() }
        return frames
    }

    /// Render progress for the active stream, from the render tap. Under a
    /// synthetic stall (P6) the frozen value is returned and marked so.
    public func renderStats() -> RenderStats? {
        lock.lock(); defer { lock.unlock() }
        if let f = frozen { return f }
        guard let id = activeStream else { return nil }
        return RenderStats(streamId: id, framesRendered: renderedFramesForActive, framesScheduled: activeFrames,
                           lastNonSilentRenderedAtMs: lastNonSilentAtMs, synthetic: false)
    }

    /// Synthetic output stall at the observation seam (P6): progress appears to
    /// stop for every observer at once. The audio keeps rendering; that is why
    /// it is labelled synthetic in every record it produces.
    public func setSyntheticStall(_ on: Bool) {
        lock.lock(); defer { lock.unlock() }
        if on, frozen == nil, let id = activeStream {
            frozen = RenderStats(streamId: id, framesRendered: renderedFramesForActive, framesScheduled: activeFrames,
                                 lastNonSilentRenderedAtMs: lastNonSilentAtMs, synthetic: true)
        } else if on, frozen == nil {
            frozen = RenderStats(streamId: OutputStreamID("synthetic"), framesRendered: 0, framesScheduled: 0,
                                 lastNonSilentRenderedAtMs: nil, synthetic: true)
        }
        if !on { frozen = nil }
    }

    /// Time of the last non-silent buffer the player node emitted (P5).
    public func lastNonSilentRenderedAtMs() -> Int64? {
        lock.lock(); defer { lock.unlock() }
        return lastNonSilentAtMs
    }

    /// Cancel the identified stream. Returns frames rendered at cancel, or nil
    /// if the id is not the active stream (already complete / never scheduled).
    public func cancel(_ id: OutputStreamID) -> Int64? {
        lock.lock()
        guard activeStream == id else { lock.unlock(); return nil }
        let rendered = renderedFramesForActive
        activeStream = nil
        lock.unlock()
        player.stop()   // drops the scheduled buffers; `activeStream` is already nil so a late completion is ignored
        return rendered
    }

    // MARK: known PCM (harness only — there is no synthesizer in KERNEL-00)

    public func makeTone(frequencyHz: Double, seconds: Double, amplitude: Float = 0.2) -> AVAudioPCMBuffer? {
        let sr = outputFormat.sampleRate
        let n = AVAudioFrameCount(seconds * sr)
        guard let buf = AVAudioPCMBuffer(pcmFormat: outputFormat, frameCapacity: n), let ch = buf.floatChannelData else { return nil }
        buf.frameLength = n
        let p = ch[0]
        let twoPiF = 2.0 * Double.pi * frequencyHz
        let fadeFrames = Int(sr * 0.01)
        let total = Int(n)
        for i in 0..<total {
            var v = Float(sin(twoPiF * Double(i) / sr)) * amplitude
            if i < fadeFrames { v *= Float(i) / Float(fadeFrames) }
            if i > total - fadeFrames { v *= Float(total - i) / Float(fadeFrames) }
            p[i] = v
        }
        return buf
    }
}
