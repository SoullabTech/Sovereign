// KERNEL-00 · StateProjection (VOICE-07: runtime truth precedes UI belief).
//
// The UI is a reducer over snapshots published here and nothing else. There is
// no command that sets displayed state; commands are intentions, snapshots are
// observations. `voice.*` event names are carried for the future WebView
// contract (02_TARGET_AUTHORITY_GRAPH.md §5); the harness consumes the
// snapshot directly.
import Foundation

public final class StateProjection: @unchecked Sendable {
    public let stream: AsyncStream<KernelSnapshot>
    private let continuation: AsyncStream<KernelSnapshot>.Continuation
    private let lock = NSLock()
    private var _latest: KernelSnapshot

    public init(initial: KernelSnapshot) {
        _latest = initial
        var c: AsyncStream<KernelSnapshot>.Continuation!
        stream = AsyncStream(bufferingPolicy: .bufferingNewest(1)) { c = $0 }
        continuation = c
    }

    public var latest: KernelSnapshot {
        lock.lock(); defer { lock.unlock() }; return _latest
    }

    public func publish(_ s: KernelSnapshot) {
        lock.lock(); _latest = s; lock.unlock()
        continuation.yield(s)
    }

    /// The event names the kernel → UI contract will use. Purely descriptive
    /// in KERNEL-00; listed so the projection's vocabulary is fixed now.
    public static let eventNames: [String] = [
        "voice.sessionState", "voice.routeState", "voice.inputHealth", "voice.outputHealth",
        "voice.userActivity", "voice.turnState", "voice.transcriptPartial", "voice.transcriptCommitted",
        "voice.maiaOutputState", "voice.recoveryState", "voice.error",
    ]
}
