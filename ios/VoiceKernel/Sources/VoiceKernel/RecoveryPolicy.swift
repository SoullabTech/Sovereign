// KERNEL-00 · RecoveryPolicy (VOICE-15: no unbounded retries).
//
// Every recovery attempt carries a generation, a retry budget, a backoff from
// the declared schedule, and a terminal degraded state. Pure and testable.
//
// Schedule — K00 §3, RATIFIED 2026-09-11: budget 3 attempts per fault class
// per 60 s; backoff 500 / 1 000 / 2 000 ms; then `degraded`.
import Foundation

public struct RecoverySchedule: Sendable, Equatable {
    public var budgetPerWindow: Int = 3
    public var windowMs: Int64 = 60_000
    public var backoffMs: [Int64] = [500, 1_000, 2_000]
    public init() {}
}

public enum RecoveryDecision: Sendable, Equatable {
    case retry(afterMs: Int64, attempt: Int, generation: Int)
    case degraded(cause: String, attempts: Int)
}

public struct RecoveryPolicy: Sendable {
    public private(set) var schedule: RecoverySchedule
    public private(set) var generation: Int = 0
    private var attempts: [String: [Int64]] = [:]   // faultClass → attempt timestamps

    public init(schedule: RecoverySchedule = RecoverySchedule()) {
        self.schedule = schedule
    }

    public func attemptsInWindow(faultClass: String, nowMs: Int64) -> Int {
        (attempts[faultClass] ?? []).filter { nowMs - $0 < schedule.windowMs }.count
    }

    /// Decide on a recovery for `faultClass`. A retry consumes budget and
    /// increments the generation — the new generation is the one every
    /// callback created by the rebuilt graph must carry (K00-09).
    public mutating func decide(faultClass: String, nowMs: Int64) -> RecoveryDecision {
        let recent = (attempts[faultClass] ?? []).filter { nowMs - $0 < schedule.windowMs }
        if recent.count >= schedule.budgetPerWindow {
            return .degraded(cause: faultClass, attempts: recent.count)
        }
        let attempt = recent.count + 1
        let backoff = schedule.backoffMs[min(attempt - 1, schedule.backoffMs.count - 1)]
        attempts[faultClass] = recent + [nowMs]
        generation += 1
        return .retry(afterMs: backoff, attempt: attempt, generation: generation)
    }

    /// A member act (re-enter) clears the degraded standing but not the
    /// generation counter — generations are monotonic for the session.
    public mutating func clearBudget() {
        attempts = [:]
    }

    /// Non-recovery generation bumps (interruption end, route rebuild, media
    /// reset) also advance the counter so stale callbacks are droppable.
    public mutating func nextGeneration() -> Int {
        generation += 1
        return generation
    }
}
