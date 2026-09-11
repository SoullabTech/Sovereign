// KERNEL-00 · orthogonal state (ARCH-01/03_STATE_MODEL.md).
//
// Four dimensions plus a generation. KERNEL-00 carries no turn dimension
// (there is no speech understanding yet); the floor is the subset that a
// physical organism can occupy: idle · entering · listening · maiaSpeaking
// (derived from a stream rendering) · recovering · degraded.
//
// There is no `isListening` boolean anywhere in this package. "Listening" is
// displayed only when floor ∈ {listening} AND inputFlow == .healthy.
import Foundation

public enum FloorState: String, Codable, Sendable, CaseIterable {
    case idle, entering, listening, maiaSpeaking, recovering, degraded
}

public enum InputFlow: String, Codable, Sendable { case unknown, healthy, suspect, dead }
public enum OutputFlow: String, Codable, Sendable { case idle, rendering, stalled, failed }
public enum SessionState: String, Codable, Sendable { case inactive, active, interrupted, resetting }

public struct RouteState: Codable, Sendable, Equatable {
    public var output: String          // builtInSpeaker · builtInReceiver · bluetoothHFP · bluetoothA2DP · headphones · other · none
    public var input: String           // builtInMic · bluetoothHFP · headsetMic · other · none
    public var inputDataSource: String? // e.g. "Bottom" / "Front" — the E18 alternation is visible here
    public var sampleRate: Double?
    public var ioBufferDurationMs: Double?
    public init(output: String = "none", input: String = "none", inputDataSource: String? = nil,
                sampleRate: Double? = nil, ioBufferDurationMs: Double? = nil) {
        self.output = output; self.input = input; self.inputDataSource = inputDataSource
        self.sampleRate = sampleRate; self.ioBufferDurationMs = ioBufferDurationMs
    }
}

public struct OutputStreamID: Hashable, Codable, Sendable, CustomStringConvertible {
    public let raw: String
    public init(_ raw: String) { self.raw = raw }
    public static func make() -> OutputStreamID { OutputStreamID(UUID().uuidString.lowercased()) }
    public var description: String { raw }
}

/// VOICE-10 (ruled F3): every emitted stream has an identity and a cancellable lifetime.
public enum OutputStreamState: String, Codable, Sendable {
    case scheduled, rendering, fading, cancelled, complete, failed
}

public struct OutputStreamRecord: Codable, Sendable, Equatable {
    public var id: OutputStreamID
    public var state: OutputStreamState
    public var framesScheduled: Int64
    public var framesRendered: Int64
    public var generation: Int
    public var scheduledAtMs: Int64
    public var endedAtMs: Int64?
    public init(id: OutputStreamID, state: OutputStreamState, framesScheduled: Int64, framesRendered: Int64,
                generation: Int, scheduledAtMs: Int64, endedAtMs: Int64? = nil) {
        self.id = id; self.state = state; self.framesScheduled = framesScheduled
        self.framesRendered = framesRendered; self.generation = generation
        self.scheduledAtMs = scheduledAtMs; self.endedAtMs = endedAtMs
    }
}

public struct RecoveryStatus: Codable, Sendable, Equatable {
    public var generation: Int
    public var attemptsInWindow: Int
    public var budget: Int
    public var lastFaultClass: String?
    public var degradedCause: String?
    public init(generation: Int = 0, attemptsInWindow: Int = 0, budget: Int = 3,
                lastFaultClass: String? = nil, degradedCause: String? = nil) {
        self.generation = generation; self.attemptsInWindow = attemptsInWindow; self.budget = budget
        self.lastFaultClass = lastFaultClass; self.degradedCause = degradedCause
    }
}

/// The single authoritative answer to: session active? input alive? output alive?
/// route? input level? MAIA speaking? recognizer alive? (n/a) current turn? (n/a)  — VOICE-07.
public struct KernelSnapshot: Codable, Sendable, Equatable {
    public var session: String
    public var generation: Int
    public var floor: FloorState
    public var inputFlow: InputFlow
    public var outputFlow: OutputFlow
    public var audioSession: SessionState
    public var route: RouteState
    public var lastInputRms: Float
    public var lastInputPeak: Float
    public var inputCallbacksInGeneration: Int
    public var streams: [OutputStreamRecord]
    public var recovery: RecoveryStatus
    public var micEnabled: Bool
    public var outputEnabled: Bool
    public var voiceProcessingEnabled: Bool
    public var faults: FaultInjection
    public var lastCause: String?
    public var manualInterventions: Int
    public var journalCount: Int
    /// PRE-WITNESS-01 P7a: authority-owned output override (`overrideOutputAudioPort`).
    public var outputOverrideSpeaker: Bool
    /// PRE-WITNESS-01 P5: last measured `cancel(handle) → last non-silent rendered frame` (ms).
    public var lastCancelToSilenceMs: Int64?

    public init(session: String) {
        self.session = session
        generation = 0
        floor = .idle
        inputFlow = .unknown
        outputFlow = .idle
        audioSession = .inactive
        route = RouteState()
        lastInputRms = 0; lastInputPeak = 0
        inputCallbacksInGeneration = 0
        streams = []
        recovery = RecoveryStatus()
        micEnabled = true
        outputEnabled = true
        voiceProcessingEnabled = true
        faults = FaultInjection()
        lastCause = nil
        manualInterventions = 0
        journalCount = 0
        outputOverrideSpeaker = false
        lastCancelToSilenceMs = nil
    }

    /// Projection rule 3: "listening" only from floor AND physical input health.
    public var displaysListening: Bool { floor == .listening && inputFlow == .healthy }
}

/// Fault injection controls exposed by the harness (K00 §4). They transform
/// observations before the supervisor sees them; they never touch authority.
public struct FaultInjection: Codable, Sendable, Equatable {
    public var digitalZeroInput: Bool = false     // K00-07 · K00-09 · K00-10
    public var stallOutput: Bool = false          // K00-08
    public var holdStaleCallback: Bool = false    // K00-09 — hold one callback, fire it after the next recovery
    public var persistentFault: Bool = false      // K00-10 — digital zero that survives recovery
    public init() {}
}
