// KERNEL-00 · HealthSupervisor (VOICE-08: started is not healthy).
//
// Pure. No timers, no audio, no Foundation clocks — every call carries the
// monotonic time so the same code is exercised by `swift test` on macOS and by
// the device. Health is derived from observations of actual flow: input
// callback cadence and energy, output frames rendered. A running engine with
// dead input is `dead`, not `healthy`.
//
// This is the ONLY component that may request automatic recovery (VOICE-06);
// it does so by returning a verdict to the kernel, which owns execution.
import Foundation

public struct HealthThresholds: Sendable, Equatable {
    /// K00 §3, RATIFIED 2026-09-11. May not be loosened because an implementation misses them.
    public var entryWindowMs: Int64 = 1_500
    public var deadInputMs: Int64 = 2_000
    public var stalledOutputMs: Int64 = 1_000
    public var cancelWindowMs: Int64 = 100
    /// Energy classification (SURVEY-01 §8 three-way split). Digital zero is
    /// not a quiet room: a quiet room has a noise floor.
    public var digitalZeroPeak: Float = 1e-7
    public var noiseFloorRms: Float = 1e-3
    public init() {}
}

public enum EnergyClass: String, Sendable { case digitalZero, noiseFloor, signal }

public struct InputObservation: Sendable, Equatable {
    public var generation: Int
    public var timeMs: Int64
    public var frames: Int
    public var rms: Float
    public var peak: Float
    public init(generation: Int, timeMs: Int64, frames: Int, rms: Float, peak: Float) {
        self.generation = generation; self.timeMs = timeMs; self.frames = frames; self.rms = rms; self.peak = peak
    }
    public func classify(_ t: HealthThresholds) -> EnergyClass {
        if peak <= t.digitalZeroPeak { return .digitalZero }
        if rms < t.noiseFloorRms { return .noiseFloor }
        return .signal
    }
}

public struct OutputObservation: Sendable, Equatable {
    public var generation: Int
    public var timeMs: Int64
    public var streamId: OutputStreamID
    public var framesRendered: Int64
    public var framesScheduled: Int64
    public init(generation: Int, timeMs: Int64, streamId: OutputStreamID, framesRendered: Int64, framesScheduled: Int64) {
        self.generation = generation; self.timeMs = timeMs; self.streamId = streamId
        self.framesRendered = framesRendered; self.framesScheduled = framesScheduled
    }
}

public enum HealthVerdict: Sendable, Equatable {
    case none
    case inputDead(sinceMs: Int64)
    case outputStalled(streamId: OutputStreamID, sinceMs: Int64)
    case entryTimedOut(waitedMs: Int64)
}

public struct HealthSupervisor: Sendable {
    public private(set) var thresholds: HealthThresholds
    public private(set) var inputFlow: InputFlow = .unknown
    public private(set) var outputFlow: OutputFlow = .idle
    public private(set) var generation: Int = 0

    private var enteredAtMs: Int64?
    private var firstInputMs: Int64?
    private var lastInputMs: Int64?
    private var lastLiveInputMs: Int64?       // last callback whose energy was not digital zero
    private var callbackCount: Int = 0

    private var renderingStream: OutputStreamID?
    private var lastRenderProgressMs: Int64?
    private var lastRenderedFrames: Int64 = 0

    public init(thresholds: HealthThresholds = HealthThresholds()) {
        self.thresholds = thresholds
    }

    // MARK: lifecycle

    /// Called when the kernel (re)builds the graph. Everything observed before
    /// belongs to a previous generation and is forgotten (K00-09).
    public mutating func beginGeneration(_ g: Int, nowMs: Int64) {
        generation = g
        enteredAtMs = nowMs
        firstInputMs = nil; lastInputMs = nil; lastLiveInputMs = nil
        callbackCount = 0
        inputFlow = .unknown
        renderingStream = nil; lastRenderProgressMs = nil; lastRenderedFrames = 0
        outputFlow = .idle
    }

    public mutating func markSessionLost() {
        inputFlow = .unknown
        outputFlow = .idle
        renderingStream = nil
        lastRenderProgressMs = nil
        enteredAtMs = nil      // no entry window runs while the OS holds the session
        firstInputMs = nil; lastInputMs = nil; lastLiveInputMs = nil
    }

    public var callbacksInGeneration: Int { callbackCount }

    // MARK: input

    /// Returns true if the observation was accepted (right generation).
    @discardableResult
    public mutating func observeInput(_ o: InputObservation) -> Bool {
        guard o.generation == generation else { return false }
        callbackCount += 1
        if firstInputMs == nil { firstInputMs = o.timeMs }
        lastInputMs = o.timeMs
        switch o.classify(thresholds) {
        case .digitalZero:
            // Do not flip to dead here; `tick` decides on elapsed time, so a
            // single silent buffer at a boundary is `suspect`, not `dead`.
            if inputFlow == .healthy { inputFlow = .suspect }
            if inputFlow == .unknown { inputFlow = .suspect }
        case .noiseFloor, .signal:
            lastLiveInputMs = o.timeMs
            inputFlow = .healthy
        }
        return true
    }

    // MARK: output

    public mutating func beginRendering(_ id: OutputStreamID, nowMs: Int64) {
        renderingStream = id
        lastRenderProgressMs = nowMs
        lastRenderedFrames = 0
        outputFlow = .rendering
    }

    @discardableResult
    public mutating func observeOutput(_ o: OutputObservation) -> Bool {
        guard o.generation == generation, o.streamId == renderingStream else { return false }
        if o.framesRendered > lastRenderedFrames {
            lastRenderedFrames = o.framesRendered
            lastRenderProgressMs = o.timeMs
            if outputFlow == .stalled { outputFlow = .rendering }
        }
        return true
    }

    public mutating func endRendering(_ id: OutputStreamID, failed: Bool = false) {
        guard renderingStream == id else { return }
        renderingStream = nil
        lastRenderProgressMs = nil
        outputFlow = failed ? .failed : .idle
    }

    // MARK: verdict

    /// Evaluate elapsed-time conditions. Called on the kernel's tick and after
    /// every observation. Returns at most one verdict, most urgent first.
    public mutating func tick(nowMs: Int64) -> HealthVerdict {
        // Entry: no live input within the entry window is a dead entry.
        if inputFlow == .unknown, let entered = enteredAtMs {
            let waited = nowMs - entered
            if waited >= thresholds.entryWindowMs && lastLiveInputMs == nil {
                inputFlow = .dead
                return .entryTimedOut(waitedMs: waited)
            }
        }
        // Dead input: callbacks stopped, or callbacks continue with digital zero.
        if inputFlow != .unknown {
            let lastLive = lastLiveInputMs ?? firstInputMs ?? enteredAtMs ?? nowMs
            let since = nowMs - lastLive
            if since >= thresholds.deadInputMs {
                inputFlow = .dead
                return .inputDead(sinceMs: since)
            }
            if inputFlow == .healthy, let last = lastInputMs, nowMs - last >= thresholds.deadInputMs / 2 {
                inputFlow = .suspect
            }
        }
        // Stalled output: a stream is rendering and no frame progressed inside the window.
        if let id = renderingStream, let last = lastRenderProgressMs {
            let since = nowMs - last
            if since >= thresholds.stalledOutputMs {
                outputFlow = .stalled
                return .outputStalled(streamId: id, sinceMs: since)
            }
        }
        return .none
    }
}
