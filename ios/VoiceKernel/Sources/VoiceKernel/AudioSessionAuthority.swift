// KERNEL-00 · AudioSessionAuthority (VOICE-01: one hardware sovereign).
//
// THE ONLY FILE in the Voice 2026 organism permitted to mutate AVAudioSession:
// category · mode · options · active/inactive · preferred sample rate and IO
// buffer · route policy · and to observe interruption / route change /
// media-services reset. The repo source gate
// (__tests__/voice-kernel-00-source-gates.test.ts) fails if any other file
// under ios/VoiceKernel or ios/VoiceKernelHarness touches these APIs.
//
// It acts only on a VoiceKernel decision and journals every mutation with its
// cause (VOICE-04, VOICE-16). It never starts an engine, never installs a tap,
// never renders. iOS only by construction.
#if os(iOS)
import Foundation
import AVFoundation

public enum SessionEvent: Sendable, Equatable {
    case interruptionBegan
    case interruptionEnded(shouldResume: Bool)
    case routeChanged(reason: String, route: RouteState)
    case mediaServicesReset
}

public final class AudioSessionAuthority: @unchecked Sendable {
    private let session = AVAudioSession.sharedInstance()
    private let recorder: FlightRecorder
    private var observers: [NSObjectProtocol] = []
    private let lock = NSLock()
    private var _generation: Int = 0

    /// Delivered on an arbitrary thread; the kernel hops to its actor.
    public var onEvent: ((SessionEvent) -> Void)?

    public init(recorder: FlightRecorder) {
        self.recorder = recorder
    }

    public func setGeneration(_ g: Int) {
        lock.lock(); _generation = g; lock.unlock()
    }
    private var generation: Int {
        lock.lock(); defer { lock.unlock() }; return _generation
    }

    // MARK: the conversation session (VOICE-04: one coherent session for listen and speak)

    /// Configure once per conversation (or on an interruption/reset recovery,
    /// stamped as such). `.playAndRecord` + `.voiceChat`: two-way voice, keeps
    /// playing with the Ring/Silent switch engaged (SURVEY-01 §1). Options are
    /// deliberately NOT `.mixWithOthers` — a conversation owns its session.
    public func configureForConversation(cause: String) throws {
        let before = describe()
        try session.setCategory(.playAndRecord, mode: .voiceChat,
                                options: [.defaultToSpeaker, .allowBluetooth, .allowBluetoothA2DP])
        try session.setPreferredSampleRate(48_000)
        try session.setPreferredIOBufferDuration(0.010)
        try session.setActive(true, options: [])
        let after = describe()
        recorder.record(generation: generation, component: "AudioSessionAuthority", event: "session_configured",
                        from: before, to: after, cause: cause,
                        evidence: ["category": "playAndRecord", "mode": "voiceChat",
                                   "options": "defaultToSpeaker,allowBluetooth,allowBluetoothA2DP",
                                   "preferredSampleRate": "48000", "preferredIOBufferDuration": "0.010",
                                   "actualSampleRate": String(session.sampleRate),
                                   "actualIOBufferDuration": String(session.ioBufferDuration)])
    }

    public func release(cause: String) throws {
        let before = describe()
        try session.setActive(false, options: [.notifyOthersOnDeactivation])
        recorder.record(generation: generation, component: "AudioSessionAuthority", event: "session_released",
                        from: before, to: "inactive", cause: cause)
    }

    // MARK: route (observable first-class state — research §3.3)

    public func currentRoute() -> RouteState {
        let r = session.currentRoute
        let out = r.outputs.first
        let inp = r.inputs.first
        return RouteState(output: Self.portName(out?.portType),
                          input: Self.portName(inp?.portType),
                          inputDataSource: inp?.selectedDataSource?.dataSourceName ?? session.inputDataSource?.dataSourceName,
                          sampleRate: session.sampleRate,
                          ioBufferDurationMs: session.ioBufferDuration * 1000)
    }

    public func describe() -> String {
        let r = currentRoute()
        return "\(session.category.rawValue)/\(session.mode.rawValue) out=\(r.output) in=\(r.input) ds=\(r.inputDataSource ?? "-") sr=\(Int(session.sampleRate)) io=\(String(format: "%.4f", session.ioBufferDuration))"
    }

    private static func portName(_ p: AVAudioSession.Port?) -> String {
        guard let p = p else { return "none" }
        switch p {
        case .builtInSpeaker: return "builtInSpeaker"
        case .builtInReceiver: return "builtInReceiver"
        case .builtInMic: return "builtInMic"
        case .bluetoothHFP: return "bluetoothHFP"
        case .bluetoothA2DP: return "bluetoothA2DP"
        case .bluetoothLE: return "bluetoothLE"
        case .headphones: return "headphones"
        case .headsetMic: return "headsetMic"
        case .airPlay: return "airPlay"
        case .carAudio: return "carAudio"
        default: return p.rawValue
        }
    }

    // MARK: observers (K00-11 · K00-12 · K00-13)

    public func startObserving() {
        stopObserving()
        let nc = NotificationCenter.default
        observers.append(nc.addObserver(forName: AVAudioSession.interruptionNotification, object: session, queue: nil) { [weak self] n in
            guard let self = self,
                  let raw = n.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
                  let type = AVAudioSession.InterruptionType(rawValue: raw) else { return }
            switch type {
            case .began:
                self.recorder.record(generation: self.generation, component: "AudioSessionAuthority",
                                     event: "interruption_began", cause: "os_interruption")
                self.onEvent?(.interruptionBegan)
            case .ended:
                var resume = false
                if let o = n.userInfo?[AVAudioSessionInterruptionOptionKey] as? UInt {
                    resume = AVAudioSession.InterruptionOptions(rawValue: o).contains(.shouldResume)
                }
                self.recorder.record(generation: self.generation, component: "AudioSessionAuthority",
                                     event: "interruption_ended", cause: "os_interruption",
                                     evidence: ["shouldResume": String(resume)])
                self.onEvent?(.interruptionEnded(shouldResume: resume))
            @unknown default:
                break
            }
        })
        observers.append(nc.addObserver(forName: AVAudioSession.routeChangeNotification, object: session, queue: nil) { [weak self] n in
            guard let self = self else { return }
            let raw = n.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt ?? 0
            let reason = Self.reasonName(AVAudioSession.RouteChangeReason(rawValue: raw))
            let route = self.currentRoute()
            self.recorder.record(generation: self.generation, component: "AudioSessionAuthority",
                                 event: "route_changed", to: "\(route.output)/\(route.input)", cause: reason,
                                 evidence: ["inputDataSource": route.inputDataSource ?? "-",
                                            "ioBufferDurationMs": String(route.ioBufferDurationMs ?? -1),
                                            "sampleRate": String(route.sampleRate ?? -1)])
            self.onEvent?(.routeChanged(reason: reason, route: route))
        })
        observers.append(nc.addObserver(forName: AVAudioSession.mediaServicesWereResetNotification, object: session, queue: nil) { [weak self] _ in
            guard let self = self else { return }
            self.recorder.record(generation: self.generation, component: "AudioSessionAuthority",
                                 event: "media_services_reset", cause: "os_media_services_reset")
            self.onEvent?(.mediaServicesReset)
        })
    }

    public func stopObserving() {
        for o in observers { NotificationCenter.default.removeObserver(o) }
        observers.removeAll()
    }

    private static func reasonName(_ r: AVAudioSession.RouteChangeReason?) -> String {
        guard let r = r else { return "unknown" }
        switch r {
        case .newDeviceAvailable: return "new_device_available"
        case .oldDeviceUnavailable: return "old_device_unavailable"
        case .categoryChange: return "category_change"
        case .override: return "override"
        case .wakeFromSleep: return "wake_from_sleep"
        case .noSuitableRouteForCategory: return "no_suitable_route"
        case .routeConfigurationChange: return "route_configuration_change"
        case .unknown: return "unknown"
        @unknown default: return "unknown"
        }
    }
}
#endif
