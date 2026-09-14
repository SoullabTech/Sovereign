// KERNEL-00 / VPIO-01 · the duplex physical I/O substrate on the lower
// Voice Processing I/O path.
//
// One Voice-Processing I/O audio unit per generation (Audio Toolbox
// kAudioUnitType_Output / kAudioUnitSubType_VoiceProcessingIO — research
// §20.1, SURVEY-01 §2). Input is PULLED inside the unit's input callback
// (AudioUnitRender into an app-owned buffer) and reported as generation-
// stamped observations; output is FILLED inside the unit's render callback
// from the one scheduled stream. Duplex physiology (K00-06) is a property of
// the unit itself: input and output are the same instance.
//
// The substrate owns NO session state: it never names AVAudioSession. The
// hardware sample rate, category, mode, activation, route and output override
// are AudioSessionAuthority's; this file only READS the hardware format the
// unit reports and adapts its client format to it (VPIO-01 plan §3).
//
// Output has identity: `schedule` returns an OutputStreamID; `cancel` stops
// rendering for that identity — the next render callback emits silence
// (VOICE-10, ruled F3). One stream at a time.
//
// P5: cancel → last rendered non-silent frame is measured INSIDE the render
// callback (the callback is the render; there is no separate tap). P6: the
// synthetic stall freezes the render-observation seam, stamped synthetic.
//
// The stream-format property listener is an OBSERVATION seam
// (`onFormatChanged`), never an act: the kernel journals it and the
// HealthSupervisor's existing windows decide (VPIO-01A census §5; founder
// ruling plan §11). There is no configuration-change classifier on this
// subject.
//
// Realtime note: both callbacks run on the audio thread. They do arithmetic,
// take a short lock for stream bookkeeping and hand small value structs on;
// the kernel hops to its actor. Bounded and adequate for KERNEL-00; a
// lock-free ring is a KERNEL-01 refinement.
//
// Every Audio Toolbox property and call below is a documented, SDK-present
// name (founder header check, iPhoneOS 26.2); none is guessed.
import Foundation
import AudioToolbox

public struct RenderStats: Sendable, Equatable {
    public var streamId: OutputStreamID
    public var framesRendered: Int64
    public var framesScheduled: Int64
    public var lastNonSilentRenderedAtMs: Int64?
    public var synthetic: Bool
}

/// The only ways `start` refuses. Swift errors thrown BEFORE any callback is
/// armed, so an invalid configuration is unreachable rather than caught.
/// There is no NSException machinery in this package; the source gate
/// asserts that.
public enum AudioGraphError: Error, CustomStringConvertible, Equatable {
    case invalidInputFormat(sampleRate: Double, channels: Int)
    case unitUnavailable
    case unitError(step: String, status: Int32)
    public var description: String {
        switch self {
        case .invalidInputFormat(let sr, let ch): return "invalidInputFormat(sampleRate: \(sr), channels: \(ch))"
        case .unitUnavailable: return "unitUnavailable"
        case .unitError(let step, let status): return "unitError(step: \(step), status: \(status))"
        }
    }
}

/// The hardware input format as observed at one instant, in plain numbers so
/// it can be journalled and validated without Audio Toolbox.
public struct InputFormatObservation: Sendable, Equatable {
    public var sampleRate: Double
    public var channels: Int
    public init(sampleRate: Double, channels: Int) { self.sampleRate = sampleRate; self.channels = channels }

    /// Pure precondition (PRE-WITNESS-02 §3.1): a format the hardware has not
    /// yet resolved (0 Hz, 0 channels) is invalid.
    public var isValid: Bool { sampleRate > 0 && channels > 0 }

    /// Throws `AudioGraphError.invalidInputFormat` unless `isValid`.
    public func requireValid() throws {
        guard isValid else { throw AudioGraphError.invalidInputFormat(sampleRate: sampleRate, channels: channels) }
    }
}

/// Known PCM for output: mono float samples at a sample rate. Substrate-owned
/// value type — the kernel never sees an Audio Toolbox or AVFoundation buffer.
public struct PCMBuffer: Sendable, Equatable {
    public var samples: [Float]
    public var sampleRate: Double
    public var frameCount: Int { samples.count }
    public init(samples: [Float], sampleRate: Double) { self.samples = samples; self.sampleRate = sampleRate }
}

// C entry points for the unit. They capture nothing; the instance travels as refCon.
private let vpioInputProc: AURenderCallback = { refCon, ioActionFlags, inTimeStamp, inBusNumber, inNumberFrames, _ in
    Unmanaged<AudioGraph>.fromOpaque(refCon).takeUnretainedValue()
        .pullInput(ioActionFlags, inTimeStamp, inBusNumber, inNumberFrames)
}
private let vpioRenderProc: AURenderCallback = { refCon, _, _, _, inNumberFrames, ioData in
    Unmanaged<AudioGraph>.fromOpaque(refCon).takeUnretainedValue().render(frames: inNumberFrames, into: ioData)
}
private let vpioFormatListener: AudioUnitPropertyListenerProc = { refCon, _, _, scope, element in
    Unmanaged<AudioGraph>.fromOpaque(refCon).takeUnretainedValue().formatPropertyChanged(scope: scope, element: element)
}

public final class AudioGraph: @unchecked Sendable {
    public let generation: Int
    private var unit: AudioUnit?
    private var listenerInstalled = false
    private let lock = NSLock()
    private var activeStream: OutputStreamID?
    private var activeSamples: [Float] = []
    private var activeFrames: Int64 = 0
    private var renderedFramesForActive: Int64 = 0
    private var lastNonSilentAtMs: Int64?
    private var frozen: RenderStats?            // synthetic stall (P6)
    private var lastInputFormat: InputFormatObservation?   // §3.4
    private var startedAtMs: Int64?                        // §3.4 generation age
    private var clock: () -> Int64 = MonotonicClock.nowMs
    private var inputScratch: [Float] = Array(repeating: 0, count: 8_192)
    private let silencePeak: Float = 1e-7

    /// The sample rate every output buffer must be in: the hardware rate the
    /// unit reported at start (mono float). Set by `start`; 48 kHz until then.
    public private(set) var outputSampleRate: Double = 48_000

    public var onInput: ((InputObservation) -> Void)?
    public var onStreamComplete: ((OutputStreamID, Int) -> Void)?             // (stream, generation)
    /// Observation only: the unit's hardware input stream format changed.
    public var onFormatChanged: ((Int, InputFormatObservation) -> Void)?    // (generation, format now)

    public init(generation: Int) { self.generation = generation }

    /// The unit's running property — EVIDENCE only (journalled as `ioRunning`).
    /// It never earns physical health; only input callbacks do (plan §5).
    public var isRunning: Bool {
        guard let u = unit else { return false }
        var running: UInt32 = 0
        var size = UInt32(MemoryLayout<UInt32>.size)
        let st = AudioUnitGetProperty(u, kAudioOutputUnitProperty_IsRunning, kAudioUnitScope_Global, 0, &running, &size)
        return st == noErr && running != 0
    }

    /// VPIO-01 startup seams — the closed, ordered set the kernel journals as
    /// `graph_start_trace`. Observation steps only; each names the call that
    /// just happened. Eleven steps on this subject.
    public enum StartTraceStep: String, CaseIterable, Sendable {
        case unitCreated = "unit_created"
        case ioEnabled = "io_enabled"
        case vpPropertiesSet = "vp_properties_set"
        case inputFormatRead = "input_format_read"
        case formatsSet = "formats_set"
        case callbacksArmed = "callbacks_armed"
        case initializeBegin = "initialize_begin"
        case initializeReturn = "initialize_return"
        case startBegin = "start_begin"
        case startReturn = "start_return"
        case isRunningImmediate = "is_running_immediate"
    }

    public func start(voiceProcessing: Bool, clock: @escaping () -> Int64 = MonotonicClock.nowMs,
                      trace: (StartTraceStep, [String: String]) -> Void = { _, _ in }) throws {
        self.clock = clock
        let t0 = clock()
        var desc = AudioComponentDescription(componentType: kAudioUnitType_Output,
                                             componentSubType: kAudioUnitSubType_VoiceProcessingIO,
                                             componentManufacturer: kAudioUnitManufacturer_Apple,
                                             componentFlags: 0, componentFlagsMask: 0)
        guard let component = AudioComponentFindNext(nil, &desc) else {
            trace(.unitCreated, ["outcome": "error", "error": "unitUnavailable"])
            throw AudioGraphError.unitUnavailable
        }
        var created: AudioUnit?
        let newStatus = AudioComponentInstanceNew(component, &created)
        guard newStatus == noErr, let u = created else {
            trace(.unitCreated, ["outcome": "error", "status": String(newStatus)])
            throw AudioGraphError.unitError(step: "unit_created", status: newStatus)
        }
        unit = u
        trace(.unitCreated, ["voiceProcessingRequested": String(voiceProcessing)])

        // Input on element 1, output on element 0 — both explicitly enabled.
        var one: UInt32 = 1
        let inEnable = AudioUnitSetProperty(u, kAudioOutputUnitProperty_EnableIO, kAudioUnitScope_Input, 1, &one, UInt32(MemoryLayout<UInt32>.size))
        let outEnable = AudioUnitSetProperty(u, kAudioOutputUnitProperty_EnableIO, kAudioUnitScope_Output, 0, &one, UInt32(MemoryLayout<UInt32>.size))
        trace(.ioEnabled, ["inputStatus": String(inEnable), "outputStatus": String(outEnable)])
        try Self.check(inEnable, step: "io_enabled")
        try Self.check(outEnable, step: "io_enabled")

        // The unit IS the voice processor: VP on/off is its bypass property.
        // AGC is read back as evidence, never set (plan §3: a policy, not a right).
        let vpT = clock()
        var bypass: UInt32 = voiceProcessing ? 0 : 1
        let bypassStatus = AudioUnitSetProperty(u, kAUVoiceIOProperty_BypassVoiceProcessing, kAudioUnitScope_Global, 0, &bypass, UInt32(MemoryLayout<UInt32>.size))
        var bypassBack: UInt32 = 0, agcBack: UInt32 = 0
        var u32Size = UInt32(MemoryLayout<UInt32>.size)
        let bypassRead = AudioUnitGetProperty(u, kAUVoiceIOProperty_BypassVoiceProcessing, kAudioUnitScope_Global, 0, &bypassBack, &u32Size)
        u32Size = UInt32(MemoryLayout<UInt32>.size)
        let agcRead = AudioUnitGetProperty(u, kAUVoiceIOProperty_VoiceProcessingEnableAGC, kAudioUnitScope_Global, 0, &agcBack, &u32Size)
        trace(.vpPropertiesSet, ["bypassRequested": String(bypass), "status": String(bypassStatus),
                                 "bypassReadBack": bypassRead == noErr ? String(bypassBack) : "-",
                                 "agcReadBack": agcRead == noErr ? String(agcBack) : "-",
                                 "elapsedMs": String(clock() - vpT)])
        try Self.check(bypassStatus, step: "vp_properties_set")

        // §3.1 precondition: the hardware input format is read BEFORE any
        // callback is armed. If the hardware has not resolved it, `start`
        // refuses here and nothing below is reached.
        let hw = readHardwareInputFormat(u)
        trace(.inputFormatRead, ["sampleRate": String(hw.sampleRate), "channels": String(hw.channels)])
        lock.lock(); lastInputFormat = hw; lock.unlock()
        try hw.requireValid()

        // Client formats: mono float at the hardware rate, non-interleaved, on
        // the input element's output scope and the output element's input scope.
        var client = Self.clientFormat(sampleRate: hw.sampleRate)
        let asbdSize = UInt32(MemoryLayout<AudioStreamBasicDescription>.size)
        let inFmt = AudioUnitSetProperty(u, kAudioUnitProperty_StreamFormat, kAudioUnitScope_Output, 1, &client, asbdSize)
        let outFmt = AudioUnitSetProperty(u, kAudioUnitProperty_StreamFormat, kAudioUnitScope_Input, 0, &client, asbdSize)
        outputSampleRate = hw.sampleRate
        trace(.formatsSet, ["clientSampleRate": String(hw.sampleRate), "inputStatus": String(inFmt), "outputStatus": String(outFmt)])
        try Self.check(inFmt, step: "formats_set")
        try Self.check(outFmt, step: "formats_set")

        // Callbacks: pull input on element 1, fill output on element 0, observe
        // the hardware input format property. Armed only after the precondition.
        let refCon = Unmanaged.passUnretained(self).toOpaque()
        var inputCb = AURenderCallbackStruct(inputProc: vpioInputProc, inputProcRefCon: refCon)
        var renderCb = AURenderCallbackStruct(inputProc: vpioRenderProc, inputProcRefCon: refCon)
        let cbSize = UInt32(MemoryLayout<AURenderCallbackStruct>.size)
        let inCb = AudioUnitSetProperty(u, kAudioOutputUnitProperty_SetInputCallback, kAudioUnitScope_Global, 1, &inputCb, cbSize)
        let outCb = AudioUnitSetProperty(u, kAudioUnitProperty_SetRenderCallback, kAudioUnitScope_Input, 0, &renderCb, cbSize)
        let lst = AudioUnitAddPropertyListener(u, kAudioUnitProperty_StreamFormat, vpioFormatListener, refCon)
        listenerInstalled = (lst == noErr)
        trace(.callbacksArmed, ["inputCallbackStatus": String(inCb), "renderCallbackStatus": String(outCb), "listenerStatus": String(lst)])
        try Self.check(inCb, step: "callbacks_armed")
        try Self.check(outCb, step: "callbacks_armed")

        trace(.initializeBegin, [:])
        let iT = clock()
        let initStatus = AudioUnitInitialize(u)
        trace(.initializeReturn, ["outcome": initStatus == noErr ? "ok" : "error", "status": String(initStatus), "elapsedMs": String(clock() - iT)])
        try Self.check(initStatus, step: "initialize_return")

        trace(.startBegin, [:])
        let sT = clock()
        let startStatus = AudioOutputUnitStart(u)
        trace(.startReturn, ["outcome": startStatus == noErr ? "ok" : "error", "status": String(startStatus),
                             "elapsedMs": String(clock() - sT), "totalMs": String(clock() - t0)])
        try Self.check(startStatus, step: "start_return")
        lock.lock(); startedAtMs = clock(); lock.unlock()
        trace(.isRunningImmediate, ["ioRunning": String(isRunning)])
    }

    private static func check(_ status: OSStatus, step: String) throws {
        guard status == noErr else { throw AudioGraphError.unitError(step: step, status: status) }
    }

    private static func clientFormat(sampleRate: Double) -> AudioStreamBasicDescription {
        AudioStreamBasicDescription(mSampleRate: sampleRate, mFormatID: kAudioFormatLinearPCM,
                                    mFormatFlags: kAudioFormatFlagIsFloat | kAudioFormatFlagIsPacked | kAudioFormatFlagIsNonInterleaved,
                                    mBytesPerPacket: 4, mFramesPerPacket: 1, mBytesPerFrame: 4,
                                    mChannelsPerFrame: 1, mBitsPerChannel: 32, mReserved: 0)
    }

    /// The hardware input format as the unit reports it (input element,
    /// input scope) — a query, never a mutation.
    private func readHardwareInputFormat(_ u: AudioUnit) -> InputFormatObservation {
        var asbd = AudioStreamBasicDescription()
        var size = UInt32(MemoryLayout<AudioStreamBasicDescription>.size)
        let st = AudioUnitGetProperty(u, kAudioUnitProperty_StreamFormat, kAudioUnitScope_Input, 1, &asbd, &size)
        guard st == noErr else { return InputFormatObservation(sampleRate: 0, channels: 0) }
        return InputFormatObservation(sampleRate: asbd.mSampleRate, channels: Int(asbd.mChannelsPerFrame))
    }

    /// §3.4 seam evidence: the hardware input format right now (a query).
    public func currentInputFormat() -> InputFormatObservation {
        guard let u = unit else { return lastInputFormat ?? InputFormatObservation(sampleRate: 0, channels: 0) }
        return readHardwareInputFormat(u)
    }

    /// The format observed by the last `start` attempt (valid or refused).
    public func inputFormatAtStart() -> InputFormatObservation? {
        lock.lock(); defer { lock.unlock() }
        return lastInputFormat
    }

    /// Milliseconds since this generation's unit started; nil if it never did.
    public func ageMs(now: Int64) -> Int64? {
        lock.lock(); defer { lock.unlock() }
        guard let s = startedAtMs else { return nil }
        return now - s
    }

    public func stop() {
        if let u = unit {
            if listenerInstalled {
                AudioUnitRemovePropertyListenerWithUserData(u, kAudioUnitProperty_StreamFormat, vpioFormatListener,
                                                            Unmanaged.passUnretained(self).toOpaque())
                listenerInstalled = false
            }
            AudioOutputUnitStop(u)
            AudioUnitUninitialize(u)
            AudioComponentInstanceDispose(u)
            unit = nil
        }
        lock.lock(); activeStream = nil; activeSamples = []; frozen = nil; lock.unlock()
    }

    // MARK: audio-thread entry points

    fileprivate func pullInput(_ flags: UnsafeMutablePointer<AudioUnitRenderActionFlags>, _ ts: UnsafePointer<AudioTimeStamp>,
                               _ bus: UInt32, _ frames: UInt32) -> OSStatus {
        guard let u = unit else { return noErr }
        let n = Int(min(frames, UInt32(inputScratch.count)))
        var status: OSStatus = noErr
        var observation: InputObservation?
        let gen = generation
        let now = clock()
        inputScratch.withUnsafeMutableBufferPointer { p in
            var abl = AudioBufferList(mNumberBuffers: 1,
                                      mBuffers: AudioBuffer(mNumberChannels: 1, mDataByteSize: UInt32(n * 4),
                                                            mData: UnsafeMutableRawPointer(p.baseAddress)))
            status = AudioUnitRender(u, flags, ts, bus, UInt32(n), &abl)
            if status == noErr, let base = p.baseAddress {
                let (rms, peak) = Self.measure(base, n)
                observation = InputObservation(generation: gen, timeMs: now, frames: n, rms: rms, peak: peak)
            }
        }
        if let o = observation { onInput?(o) }
        return status
    }

    fileprivate func render(frames: UInt32, into ioData: UnsafeMutablePointer<AudioBufferList>?) -> OSStatus {
        guard let ioData = ioData else { return noErr }
        let buffers = UnsafeMutableAudioBufferListPointer(ioData)
        let n = Int(frames)
        var completed: OutputStreamID?
        var nonSilent = false
        lock.lock()
        let id = activeStream
        let pos = Int(renderedFramesForActive)
        let total = activeSamples.count
        for buf in buffers {
            guard let raw = buf.mData else { continue }
            let out = raw.assumingMemoryBound(to: Float.self)
            let count = min(n, Int(buf.mDataByteSize) / 4)
            var i = 0
            while i < count {
                let idx = pos + i
                if id != nil, idx < total {
                    let v = activeSamples[idx]
                    out[i] = v
                    if abs(v) > silencePeak { nonSilent = true }
                } else {
                    out[i] = 0
                }
                i += 1
            }
        }
        if id != nil {
            let next = min(total, pos + n)
            renderedFramesForActive = Int64(next)
            if next >= total { completed = id; activeStream = nil }
        }
        if nonSilent { lastNonSilentAtMs = clock() }
        lock.unlock()
        if let c = completed { onStreamComplete?(c, generation) }
        return noErr
    }

    fileprivate func formatPropertyChanged(scope: AudioUnitScope, element: AudioUnitElement) {
        // Only the hardware input side (input scope, element 1) is the seam the
        // kernel observes; everything else is the unit's own bookkeeping.
        guard scope == kAudioUnitScope_Input, element == 1, let u = unit else { return }
        onFormatChanged?(generation, readHardwareInputFormat(u))
    }

    private static func measure(_ p: UnsafeMutablePointer<Float>, _ frames: Int) -> (Float, Float) {
        var peak: Float = 0
        var sumSq: Float = 0
        var i = 0
        while i < frames {
            let v = p[i]
            let a = abs(v)
            if a > peak { peak = a }
            sumSq += v * v
            i += 1
        }
        let rms = frames > 0 ? (sumSq / Float(frames)).squareRoot() : 0
        return (rms, peak)
    }

    // MARK: output with identity

    /// Schedule PCM for rendering under a new stream identity. Returns the
    /// number of frames scheduled. Completion fires when the render callback
    /// has actually emitted the last frame.
    public func schedule(_ buffer: PCMBuffer, as id: OutputStreamID) -> Int64 {
        let frames = Int64(buffer.frameCount)
        lock.lock()
        activeStream = id
        activeSamples = buffer.samples
        activeFrames = frames
        renderedFramesForActive = 0
        lock.unlock()
        return frames
    }

    /// Render progress for the active stream, from the render callback. Under
    /// a synthetic stall (P6) the frozen value is returned and marked so.
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

    /// Time of the last non-silent buffer the render callback emitted (P5).
    public func lastNonSilentRenderedAtMs() -> Int64? {
        lock.lock(); defer { lock.unlock() }
        return lastNonSilentAtMs
    }

    /// Cancel the identified stream. Returns frames rendered at cancel, or nil
    /// if the id is not the active stream (already complete / never scheduled).
    /// The next render callback emits silence; a late completion is impossible
    /// because `activeStream` is already nil.
    public func cancel(_ id: OutputStreamID) -> Int64? {
        lock.lock(); defer { lock.unlock() }
        guard activeStream == id else { return nil }
        let rendered = renderedFramesForActive
        activeStream = nil
        activeSamples = []
        return rendered
    }

    // MARK: known PCM (harness only — there is no synthesizer in KERNEL-00)

    public func makeTone(frequencyHz: Double, seconds: Double, amplitude: Float = 0.2) -> PCMBuffer? {
        let sr = outputSampleRate
        let total = Int(seconds * sr)
        guard total > 0 else { return nil }
        var samples = [Float](repeating: 0, count: total)
        let twoPiF = 2.0 * Double.pi * frequencyHz
        let fadeFrames = Int(sr * 0.01)
        for i in 0..<total {
            var v = Float(sin(twoPiF * Double(i) / sr)) * amplitude
            if fadeFrames > 0 {
                if i < fadeFrames { v *= Float(i) / Float(fadeFrames) }
                if i > total - fadeFrames { v *= Float(total - i) / Float(fadeFrames) }
            }
            samples[i] = v
        }
        return PCMBuffer(samples: samples, sampleRate: sr)
    }
}
