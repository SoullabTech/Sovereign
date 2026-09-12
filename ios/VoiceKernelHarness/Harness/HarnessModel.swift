// KERNEL-00 · harness model — a reducer over kernel snapshots (VOICE-07).
//
// This object holds NO voice state of its own. Everything it displays comes
// from `KernelSnapshot`s published by the kernel's StateProjection. The
// counters here are witness bookkeeping (cycles, route changes, interruptions,
// resets, manual interventions) for the K00 checklist, not runtime state.
//
// PRE-WITNESS-01: journal export goes through the actor's own methods (C2 —
// the harness never reaches actor-owned state); app lifecycle is forwarded to
// the kernel as an observation (P7b); the route override control asks the
// kernel, which asks the authority (P7a).
import Foundation
import SwiftUI
import UIKit
import VoiceKernel

@MainActor
final class HarnessModel: ObservableObject {
    @Published private(set) var snapshot: KernelSnapshot
    @Published var faults = FaultInjection()
    @Published private(set) var cyclesCompleted = 0
    @Published private(set) var routeChanges = 0
    @Published private(set) var interruptions = 0
    @Published private(set) var resets = 0
    @Published private(set) var exportURL: URL?
    @Published private(set) var replayReport: ReplayReport?

    let kernel: VoiceKernel
    private var observer: Task<Void, Never>?
    private var lifecycleObservers: [NSObjectProtocol] = []
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
        observeLifecycle()
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

    // MARK: lifecycle observation (P7b, K00-14)

    private func observeLifecycle() {
        let nc = NotificationCenter.default
        let pairs: [(Notification.Name, String)] = [
            (UIApplication.willResignActiveNotification, "willResignActive"),
            (UIApplication.didEnterBackgroundNotification, "didEnterBackground"),
            (UIApplication.willEnterForegroundNotification, "willEnterForeground"),
            (UIApplication.didBecomeActiveNotification, "didBecomeActive"),
            (UIApplication.protectedDataWillBecomeUnavailableNotification, "protectedDataWillBecomeUnavailable"),
            (UIApplication.protectedDataDidBecomeAvailableNotification, "protectedDataDidBecomeAvailable"),
        ]
        for (name, phase) in pairs {
            lifecycleObservers.append(nc.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in
                guard let self = self else { return }
                let k = self.kernel
                Task { await k.recordAppLifecycle(phase) }
            })
        }
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
    /// PRE-WITNESS-03 C: pre-Enter voice-processing control. Reads the kernel's
    /// snapshot, asks the kernel; holds nothing itself (VOICE-07).
    func toggleVoiceProcessing() { Task { await kernel.setVoiceProcessing(!snapshot.voiceProcessingEnabled) } }
    func toggleMic() { Task { await kernel.setMicEnabled(!snapshot.micEnabled) } }
    func toggleOutput() { Task { await kernel.setOutputEnabled(!snapshot.outputEnabled) } }
    func routeToSpeaker() { Task { await kernel.setOutputOverride(speaker: true) } }
    func routeToSystemDefault() { Task { await kernel.setOutputOverride(speaker: false) } }
    func applyFaults() { let f = faults; Task { await kernel.setFaults(f) } }
    func manualIntervention() { Task { await kernel.recordManualIntervention("harness:manual_mic_tap") } }

    // MARK: witness export (C2: through the actor, never the recorder)

    func exportJournal() {
        Task { [weak self] in
            guard let self = self else { return }
            let text = await self.kernel.exportJournalJSONL()
            let events = await self.kernel.journalEvents()
            let report = StateReplayer.replay(events)
            let url = FileManager.default.temporaryDirectory
                .appendingPathComponent("kernel00-\(self.snapshot.session)-\(Int(Date().timeIntervalSince1970)).jsonl")
            var written: URL? = nil
            do { try text.write(to: url, atomically: true, encoding: .utf8); written = url } catch { written = nil }
            await MainActor.run {
                self.replayReport = report
                self.exportURL = written
            }
        }
    }
}
