// KERNEL-00 · harness model — a reducer over kernel snapshots (VOICE-07).
//
// This object holds NO voice state of its own. Everything it displays comes
// from `KernelSnapshot`s published by the kernel's StateProjection. The
// counters here are witness bookkeeping (cycles, route changes, interruptions,
// resets, manual interventions) for the K00 checklist, not runtime state.
import Foundation
import SwiftUI
import VoiceKernel

@MainActor
final class HarnessModel: ObservableObject {
    @Published private(set) var snapshot: KernelSnapshot
    @Published var faults = FaultInjection()
    @Published private(set) var cyclesCompleted = 0
    @Published private(set) var routeChanges = 0
    @Published private(set) var interruptions = 0
    @Published private(set) var resets = 0
    @Published private(set) var staleDropped = 0
    @Published private(set) var exportURL: URL?
    @Published private(set) var replayReport: ReplayReport?

    let kernel: VoiceKernel
    private var observer: Task<Void, Never>?
    private var lastRoute: RouteState?
    private var lastSessionState: SessionState = .inactive
    private var seenStreams = Set<OutputStreamID>()
    private let startedAtMs = MonotonicClock.nowMs()

    init() {
        let k = VoiceKernel()
        kernel = k
        snapshot = k.projection.latest
        observer = Task { [weak self] in
            for await s in k.projection.stream {
                await MainActor.run { self?.reduce(s) }
            }
        }
    }

    var elapsedMinutes: Double { Double(MonotonicClock.nowMs() - startedAtMs) / 60_000 }

    private func reduce(_ s: KernelSnapshot) {
        // Witness bookkeeping derived from observed state, never from intent.
        if let r = lastRoute, r != s.route { routeChanges += 1 }
        lastRoute = s.route
        if lastSessionState != .interrupted && s.audioSession == .interrupted { interruptions += 1 }
        if lastSessionState != .resetting && s.audioSession == .resetting { resets += 1 }
        lastSessionState = s.audioSession
        for st in s.streams where st.state == .complete && !seenStreams.contains(st.id) {
            seenStreams.insert(st.id)
            cyclesCompleted += 1
        }
        snapshot = s
    }

    // MARK: commands (intentions)

    func enter() { Task { await kernel.enterConversation() } }
    func leave() { Task { await kernel.leaveConversation() } }
    func reenter() { Task { await kernel.reenterAfterDegraded() } }
    func playTone() { Task { await kernel.playTone(seconds: 3.0) } }
    func cancelActive() {
        guard let s = snapshot.streams.last(where: { $0.state == .rendering }) else { return }
        Task { await kernel.cancel(s.id) }
    }
    func toggleMic() { Task { await kernel.setMicEnabled(!snapshot.micEnabled) } }
    func toggleOutput() { Task { await kernel.setOutputEnabled(!snapshot.outputEnabled) } }
    func applyFaults() { let f = faults; Task { await kernel.setFaults(f) } }
    func manualIntervention() { Task { await kernel.recordManualIntervention("harness:manual_mic_tap") } }

    // MARK: witness export

    func exportJournal() {
        let text = kernel.recorder.exportJSONL()
        let events = kernel.recorder.snapshot()
        replayReport = StateReplayer.replay(events)
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("kernel00-\(snapshot.session)-\(Int(Date().timeIntervalSince1970)).jsonl")
        do {
            try text.write(to: url, atomically: true, encoding: .utf8)
            exportURL = url
        } catch {
            exportURL = nil
        }
    }
}
