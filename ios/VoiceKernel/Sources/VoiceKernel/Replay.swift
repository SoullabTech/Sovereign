// KERNEL-00 · trace replay (K00-17: the trace replays).
//
// A run's journal is fed back into the floor state machine. Every
// `floor_transition` must be lawful (from == current, to ∈ allowed[from]);
// every automatic act must name its causal parent by `causeSeq`, and that
// parent must exist, precede the act, and belong to the same or an earlier
// generation (PRE-WITNESS-01 P8). Anything else is an orphan, and an orphan
// fails K00-17.
import Foundation

public struct ReplayReport: Sendable, Equatable {
    public var finalFloor: FloorState
    public var transitions: Int
    public var orphanTransitions: [JournalEvent]
    public var unattributedActs: [JournalEvent]      // automatic act with no cause / no causeSeq
    public var brokenCausality: [JournalEvent]       // causeSeq missing, later, or from a later generation
    public var staleCallbacksDropped: Int
    public var generationsSeen: Set<Int>
    public var passes: Bool { orphanTransitions.isEmpty && unattributedActs.isEmpty && brokenCausality.isEmpty }
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

    /// Events that are automatic acts and therefore must carry a cause AND a
    /// causal parent. Observations (samples, flow transitions, session
    /// notifications, dropped stale callbacks) are not acts.
    public static let automaticActs: Set<String> = [
        "recovery_requested", "recovery_scheduled", "recovery_started", "graph_rebuilt", "graph_started",
        "session_configured", "session_released", "session_category_set", "session_preferred_sample_rate_set",
        "session_preferred_io_buffer_set", "session_activated", "session_deactivated", "session_output_override",
        "stream_scheduled", "stream_cancelled", "stream_failed", "stream_cancel_measured",
        "degraded", "floor_transition",
    ]

    public static func replay(_ events: [JournalEvent]) -> ReplayReport {
        var floor: FloorState = .idle
        var transitions = 0
        var orphans: [JournalEvent] = []
        var unattributed: [JournalEvent] = []
        var broken: [JournalEvent] = []
        var stale = 0
        var gens = Set<Int>()
        var seen: [Int: JournalEvent] = [:]

        for e in events {
            gens.insert(e.generation)
            if e.event == "stale_callback_dropped" { stale += 1 }
            if automaticActs.contains(e.event) {
                if (e.cause ?? "").isEmpty || e.causeSeq == nil {
                    unattributed.append(e)
                } else if let cs = e.causeSeq {
                    if let parent = seen[cs] {
                        if !(cs < e.seq) || parent.generation > e.generation { broken.append(e) }
                    } else {
                        broken.append(e)
                    }
                }
            }
            seen[e.seq] = e
            guard e.event == "floor_transition" else { continue }
            guard let fromRaw = e.from, let toRaw = e.to,
                  let from = FloorState(rawValue: fromRaw), let to = FloorState(rawValue: toRaw) else {
                orphans.append(e); continue
            }
            let lawful = (from == floor) && (to == .idle || (allowed[from]?.contains(to) ?? false))
            if !lawful { orphans.append(e); continue }
            floor = to
            transitions += 1
        }
        return ReplayReport(finalFloor: floor, transitions: transitions, orphanTransitions: orphans,
                            unattributedActs: unattributed, brokenCausality: broken,
                            staleCallbacksDropped: stale, generationsSeen: gens)
    }
}
