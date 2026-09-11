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
// Realtime note: the input tap runs on the audio thread. It does arithmetic
// and hands a small value struct to a non-realtime callback; the kernel hops
// to its actor. This is bounded and adequate for KERNEL-00; a lock-free ring
// is a KERNEL-01 refinement, not a law.
import Foundation
import AVFoundation

public final class AudioGraph: @unchecked Sendable {
    public let generation: Int
    private let engine = AVAudioEngine()
    private let player = AVAudioPlayerNode()
    private var tapInstalled = false
    private var configObserver: NSObjectProtocol?
    private let lock = NSLock()
    private var activeStream: OutputStreamID?
    private var activeFrames: Int64 = 0
    private var lastRendered: Int64 = 0

    /// The format every output buffer must be in. Mono 48 kHz float; the mixer
    /// converts to the hardware format.
    public let outputFormat: AVAudioFormat

    public var onInput: ((InputObservation) -> Void)?
    public var onStreamComplete: ((OutputStreamID, Int) -> Void)?          // (stream, generation)
    public var onConfigurationChange: ((Int) -> Void)?                       // generation

    public init(generation: Int) {
        self.generation = generation
        self.outputFormat = AVAudioFormat(standardFormatWithSampleRate: 48_000, channels: 1)!
    }

    public var isRunning: Bool { engine.isRunning }

    public func start(voiceProcessing: Bool, clock: @escaping () -> Int64 = MonotonicClock.nowMs) throws {
        let input = engine.inputNode
        // Must be set before the engine starts; global to both IO nodes (SURVEY-01 §2).
        try input.setVoiceProcessingEnabled(voiceProcessing)

        engine.attach(player)
        engine.connect(player, to: engine.mainMixerNode, format: outputFormat)

        let inFormat = input.outputFormat(forBus: 0)
        let gen = generation
        input.installTap(onBus: 0, bufferSize: 1024, format: inFormat) { [weak self] buffer, _ in
            guard let self = self else { return }
            let frames = Int(buffer.frameLength)
            var peak: Float = 0
            var sumSq: Float = 0
            if let ch = buffer.floatChannelData, buffer.format.channelCount > 0 {
                let n = Int(buffer.frameLength)
                let p = ch[0]
                var i = 0
                while i < n {
                    let v = p[i]
                    let a = abs(v)
                    if a > peak { peak = a }
                    sumSq += v * v
                    i += 1
                }
            }
            let rms = frames > 0 ? (sumSq / Float(frames)).squareRoot() : 0
            self.onInput?(InputObservation(generation: gen, timeMs: clock(), frames: frames, rms: rms, peak: peak))
        }
        tapInstalled = true

        configObserver = NotificationCenter.default.addObserver(
            forName: .AVAudioEngineConfigurationChange, object: engine, queue: nil) { [weak self] _ in
            guard let self = self else { return }
            self.onConfigurationChange?(self.generation)
        }

        engine.prepare()
        try engine.start()
    }

    public func stop() {
        if let o = configObserver { NotificationCenter.default.removeObserver(o); configObserver = nil }
        if tapInstalled { engine.inputNode.removeTap(onBus: 0); tapInstalled = false }
        player.stop()
        engine.stop()
        lock.lock(); activeStream = nil; lock.unlock()
    }

    // MARK: output with identity

    /// Schedule PCM for rendering under a new stream identity. Returns the id
    /// and the number of frames scheduled. Completion fires when the data has
    /// been RENDERED (not merely consumed) — `.dataRendered`.
    public func schedule(_ buffer: AVAudioPCMBuffer, as id: OutputStreamID) -> Int64 {
        let frames = Int64(buffer.frameLength)
        lock.lock()
        activeStream = id
        activeFrames = frames
        lastRendered = 0
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

    /// Frames rendered so far for the active stream, from the node's own clock.
    public func renderedFrames() -> (OutputStreamID, Int64, Int64)? {
        lock.lock()
        guard let id = activeStream else { lock.unlock(); return nil }
        let total = activeFrames
        lock.unlock()
        guard let nt = player.lastRenderTime, let pt = player.playerTime(forNodeTime: nt) else {
            return (id, lastRendered, total)
        }
        let rendered = max(0, min(total, Int64(pt.sampleTime)))
        lock.lock(); lastRendered = rendered; lock.unlock()
        return (id, rendered, total)
    }

    /// Cancel the identified stream. Returns frames rendered at cancel, or nil
    /// if the id is not the active stream (already complete / never scheduled).
    public func cancel(_ id: OutputStreamID) -> Int64? {
        lock.lock()
        guard activeStream == id else { lock.unlock(); return nil }
        lock.unlock()
        let rendered = renderedFrames()?.1 ?? 0
        lock.lock(); activeStream = nil; lock.unlock()
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
