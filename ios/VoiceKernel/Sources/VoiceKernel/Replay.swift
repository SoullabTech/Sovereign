// KERNEL-00 · trace replay (K00-17: the trace replays).
//
// A run's journal is fed back into the floor state machine. Every
// `floor_transition` must be lawful (from == current, to ∈ allowed[from]);
// every automatic act must name its cause and generation. Anything else is an
// orphan, and an orphan fails K00-17.
import Foundation

public struct ReplayReport: Sendable, Equatable {
    public var finalFloor: FloorState
    public var transitions: Int
    public var orphanTransitions: [JournalEvent]
    public var unattributedActs: [JournalEvent]
    public var staleCallbacksDropped: Int
    public var generationsSeen: Set<Int>
    public var passes: Bool { orphanTransitions.isEmpty && unattributedActs.isEmpty }
}

public enum StateReplayer {
    /// The floor machine as ratified (03_STATE_MODEL.md §2), restricted to
    /// the KERNEL-00 subset. `idle` is reachable from anywhere via leave.
    public static let allowed: [FloorState: Set<FloorState>] = [
        .idle: [.entering],
        .entering: [.listening, .degraded, .recovering, .idle],
        .listening: [.maiaSpeaking, .recovering, .idle],
        .maiaSpeaking: [.listening, .recovering, .idle],
        .recovering: [.entering, .listening, .degraded, .idle],
        .degraded: [.entering, .idle],
    ]

    /// Events that are automatic acts and therefore must carry a cause.
    public static let automaticActs: Set<String> = [
        "recovery_requested", "recovery_scheduled", "recovery_started", "graph_rebuilt",
        "session_configured", "session_released", "stream_cancelled", "stream_failed",
        "degraded", "stale_callback_dropped",
    ]

    public static func replay(_ events: [JournalEvent]) -> ReplayReport {
        var floor: FloorState = .idle
        var transitions = 0
        var orphans: [JournalEvent] = []
        var unattributed: [JournalEvent] = []
        var stale = 0
        var gens = Set<Int>()

        for e in events {
            gens.insert(e.generation)
            if e.event == "stale_callback_dropped" { stale += 1 }
            if automaticActs.contains(e.event) {
                // A command-caused cancel is attributed by its cause string too.
                if (e.cause ?? "").isEmpty { unattributed.append(e) }
            }
            guard e.event == "floor_transition" else { continue }
            guard let fromRaw = e.from, let toRaw = e.to,
                  let from = FloorState(rawValue: fromRaw), let to = FloorState(rawValue: toRaw) else {
                orphans.append(e); continue
            }
            let lawful = (from == floor) && (to == .idle || (allowed[from]?.contains(to) ?? false))
            if !lawful { orphans.append(e); continue }
            if (e.cause ?? "").isEmpty { unattributed.append(e) }
            floor = to
            transitions += 1
        }
        return ReplayReport(finalFloor: floor, transitions: transitions, orphanTransitions: orphans,
                            unattributedActs: unattributed, staleCallbacksDropped: stale, generationsSeen: gens)
    }
}
