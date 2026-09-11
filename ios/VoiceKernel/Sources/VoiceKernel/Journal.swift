// KERNEL-00 · flight recorder (VOICE-16: causal observability is built in).
//
// Every automatic state-changing act answers: what observation caused this
// act, and which generation did the observation belong to? PRE-WITNESS-01 (P8)
// made that answer structural: every record carries a monotonic `seq`, and
// every automatic act carries `causeSeq` — the seq of the observation (or
// command) that caused it. Replay verifies the chain instead of inferring it
// from a cause string.
import Foundation

public struct JournalEvent: Codable, Sendable, Equatable {
    public var seq: Int              // monotonic per session, assigned by the recorder
    public var session: String
    public var turn: Int?            // always nil in KERNEL-00 — there are no turns yet
    public var generation: Int
    public var timeMonotonicMs: Int64
    public var component: String
    public var event: String
    public var from: String?
    public var to: String?
    public var cause: String?
    public var causeSeq: Int?        // the record that caused this one (required on automatic acts)
    public var evidence: [String: String]

    public init(seq: Int, session: String, turn: Int? = nil, generation: Int, timeMonotonicMs: Int64,
                component: String, event: String, from: String? = nil, to: String? = nil,
                cause: String? = nil, causeSeq: Int? = nil, evidence: [String: String] = [:]) {
        self.seq = seq
        self.session = session
        self.turn = turn
        self.generation = generation
        self.timeMonotonicMs = timeMonotonicMs
        self.component = component
        self.event = event
        self.from = from
        self.to = to
        self.cause = cause
        self.causeSeq = causeSeq
        self.evidence = evidence
    }
}

public enum MonotonicClock {
    /// Milliseconds on the monotonic clock. Never wall-clock: the journal must
    /// order events across sleeps and clock changes.
    public static func nowMs() -> Int64 {
        Int64(DispatchTime.now().uptimeNanoseconds / 1_000_000)
    }
}

/// Append-only, in-memory, thread-safe. Export is JSONL, one event per line,
/// so a run can be attached to the witness record verbatim and replayed
/// (`StateReplayer`) — K00-17.
public final class FlightRecorder: @unchecked Sendable {
    public let session: String
    private let lock = NSLock()
    private var events: [JournalEvent] = []
    private var nextSeq: Int = 1
    private let clock: () -> Int64
    private let cap: Int

    public init(session: String, cap: Int = 200_000, clock: @escaping () -> Int64 = MonotonicClock.nowMs) {
        self.session = session
        self.cap = cap
        self.clock = clock
    }

    /// Records one event and returns it (with its assigned `seq`). Callers
    /// that perform an automatic act pass `causeSeq` = the seq of the record
    /// that caused it.
    @discardableResult
    public func record(generation: Int, component: String, event: String,
                       from: String? = nil, to: String? = nil, cause: String? = nil,
                       causeSeq: Int? = nil, evidence: [String: String] = [:]) -> JournalEvent {
        lock.lock()
        let seq = nextSeq
        nextSeq += 1
        let e = JournalEvent(seq: seq, session: session, generation: generation, timeMonotonicMs: clock(),
                             component: component, event: event, from: from, to: to,
                             cause: cause, causeSeq: causeSeq, evidence: evidence)
        if events.count < cap { events.append(e) }
        lock.unlock()
        return e
    }

    public func snapshot() -> [JournalEvent] {
        lock.lock(); defer { lock.unlock() }
        return events
    }

    public var count: Int {
        lock.lock(); defer { lock.unlock() }
        return events.count
    }

    public func exportJSONL() -> String {
        let enc = JSONEncoder()
        enc.outputFormatting = [.sortedKeys]
        return snapshot().compactMap { e in
            guard let d = try? enc.encode(e) else { return nil }
            return String(data: d, encoding: .utf8)
        }.joined(separator: "\n")
    }

    public static func importJSONL(_ text: String) -> [JournalEvent] {
        let dec = JSONDecoder()
        return text.split(separator: "\n").compactMap { line in
            guard let d = line.data(using: .utf8) else { return nil }
            return try? dec.decode(JournalEvent.self, from: d)
        }
    }
}
