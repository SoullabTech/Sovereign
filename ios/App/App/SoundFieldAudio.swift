import Foundation
import Capacitor
import AVFoundation
import MediaPlayer

/// SoundFieldAudio — the playback side of the one Soullab audio authority.
///
/// LISTEN-NATIVE-AUDIO-01. The web player (a single <audio> element inside the WKWebView) remains the
/// only player; this plugin gives it a correct iOS playback session and reports what the system does.
///
/// Law (AUDIO-PLATFORM-01):
///   - Member intent starts sound. `activate` is called only after a member Play.
///   - Interruptions and route changes are REPORTED so the web player can pause. The end of an
///     interruption is reported as `ended` with no resume hint: Soullab never auto-resumes.
///   - Lock-screen Play/Pause/Stop are member gestures forwarded to the web player.
///   - The native mix ("Play with your music", recorded sounds only) is a second player under the
///     single-source rule: the page stops the web player before starting it. It starts only on a member
///     Play, STOPS when an interruption begins or a route is lost, and is never restarted by the system.
///     It plays only bundled recorded sounds and never reads another app's audio or metadata.
///   - No microphone: this file never requests record permission or uses an input.
///   - Now Playing carries title, passage and a clock only.
@objc(SoundFieldAudio)
public class SoundFieldAudio: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SoundFieldAudio"
    public let jsName = "SoundFieldAudio"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "activate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deactivate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setNowPlaying", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearNowPlaying", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "mixStart", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "mixStop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "mixSetLevel", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "mixStatus", returnType: CAPPluginReturnPromise)
    ]

    private let session = AVAudioSession.sharedInstance()
    private var observing = false
    private var remoteTargets: [Any] = []

    // MARK: - Native mix ("Play with your music"): recorded sounds only, member-started, never auto-resumed
    private var mixEngine: AVAudioEngine?
    private var mixNode: AVAudioPlayerNode?
    private var mixEQ: AVAudioUnitEQ?
    private var mixFile: AVAudioFile?
    private var mixLoop = true
    private var mixActive = false
    private var mixLevel: Double = 80
    private var mixDuration: Double = 1

    /// Level 0...100 maps to -60 ... +18 dB around the recording's own level (about 77 is the file level).
    /// +18 dB keeps the shipped recordings' peaks below full scale. Must match platformAudioPolicy.mixGainDb.
    private func mixGainDb(_ level: Double) -> Float { Float(-60.0 + 78.0 * max(0.0, min(100.0, level)) / 100.0) }

    private func mixScheduleNext() {
        guard let node = mixNode, let file = mixFile, mixActive else { return }
        node.scheduleFile(file, at: nil, completionCallbackType: .dataPlayedBack) { [weak self] _ in
            DispatchQueue.main.async {
                guard let self = self, self.mixActive else { return }
                if self.mixLoop { self.mixScheduleNext() } else { self.stopMix(reason: "finished") }
            }
        }
    }

    private func teardownMix() {
        mixActive = false
        mixNode?.stop()
        mixEngine?.stop()
        mixNode = nil; mixEngine = nil; mixEQ = nil; mixFile = nil
    }

    /// Every way the mix ends goes through here and is reported; nothing in this file starts it again.
    private func stopMix(reason: String) {
        guard mixActive || mixEngine != nil else { return }
        teardownMix()
        NSLog("[SoundFieldAudio] mix stopped reason=\(reason)")
        notifyListeners("mixStopped", data: ["reason": reason])
    }

    @objc func mixStart(_ call: CAPPluginCall) {
        guard let rel = call.getString("path"), rel.hasPrefix("public/media/"), !rel.contains("..") else {
            call.reject("The native mix plays only bundled recorded sounds under public/media")
            return
        }
        let level = call.getDouble("level") ?? 80
        let url = URL(fileURLWithPath: Bundle.main.bundlePath).appendingPathComponent(rel)
        do {
            teardownMix()
            try session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
            try session.setActive(true, options: [])
            let file = try AVAudioFile(forReading: url)
            let engine = AVAudioEngine()
            let node = AVAudioPlayerNode()
            let eq = AVAudioUnitEQ(numberOfBands: 1)
            eq.globalGain = mixGainDb(level)
            engine.attach(node); engine.attach(eq)
            engine.connect(node, to: eq, format: file.processingFormat)
            engine.connect(eq, to: engine.mainMixerNode, format: file.processingFormat)
            mixFile = file
            mixLoop = call.getBool("loop") ?? true
            mixLevel = level
            mixDuration = max(1.0, Double(file.length) / file.processingFormat.sampleRate)
            mixEngine = engine; mixNode = node; mixEQ = eq
            mixActive = true
            mixScheduleNext()
            try engine.start()
            node.play()
            startObserving()
            enableRemoteCommands()
            NSLog("[SoundFieldAudio] mix started level=\(level) gainDb=\(mixGainDb(level)) otherAudio=\(session.isOtherAudioPlaying)")
            call.resolve(["durationSeconds": mixDuration, "gainDb": Double(mixGainDb(level))])
        } catch {
            teardownMix()
            NSLog("[SoundFieldAudio] mix error \(error)")
            call.reject("The native mix could not start")
        }
    }

    @objc func mixSetLevel(_ call: CAPPluginCall) {
        mixLevel = call.getDouble("level") ?? mixLevel
        mixEQ?.globalGain = mixGainDb(mixLevel)
        call.resolve(["gainDb": Double(mixGainDb(mixLevel))])
    }

    @objc func mixStop(_ call: CAPPluginCall) {
        stopMix(reason: "stopped")
        call.resolve()
    }

    @objc func mixStatus(_ call: CAPPluginCall) {
        var position = 0.0
        if let n = mixNode, let nt = n.lastRenderTime, let pt = n.playerTime(forNodeTime: nt), pt.sampleRate > 0 {
            position = (Double(pt.sampleTime) / pt.sampleRate).truncatingRemainder(dividingBy: mixDuration)
        }
        call.resolve(["active": mixActive, "positionSeconds": position, "durationSeconds": mixDuration,
                      "level": mixLevel, "gainDb": Double(mixGainDb(mixLevel))])
    }

    // MARK: - Session

    @objc func activate(_ call: CAPPluginCall) {
        let mix = call.getBool("mixWithOthers") ?? false
        do {
            // .playback keeps audio going with the screen locked and the silent switch on.
            // mixWithOthers is set ONLY when the member chose companion mode.
            // The web view's media element already drives a playback session (UIBackgroundModes: audio).
            // Re-activating it from here collided with WebKit's own activation and produced an immediate
            // spurious interruption (measured on device), so the category is touched ONLY when the member
            // chose companion mode, and the session is never force-activated.
            if mix {
                try session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
            }
            NSLog("[SoundFieldAudio] activate category=\(session.category.rawValue) mix=\(mix) otherAudio=\(session.isOtherAudioPlaying)")
            startObserving()
            enableRemoteCommands()
            call.resolve(["category": session.category.rawValue, "mixWithOthers": mix])
        } catch {
            call.reject("Could not configure the playback session")
        }
    }

    @objc func deactivate(_ call: CAPPluginCall) {
        // The web player going idle must not take the session from a native mix that is playing.
        if mixActive { call.resolve(); return }
        NSLog("[SoundFieldAudio] deactivate")
        stopObserving()
        disableRemoteCommands()
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
        do { try session.setActive(false, options: .notifyOthersOnDeactivation) } catch { /* nothing held */ }
        call.resolve()
    }

    // MARK: - Now Playing (title, passage, clock — never content)

    @objc func setNowPlaying(_ call: CAPPluginCall) {
        var info: [String: Any] = [
            MPMediaItemPropertyTitle: call.getString("title") ?? "Soullab Sound Studio",
            MPMediaItemPropertyArtist: "Soullab Sound Studio",
            MPNowPlayingInfoPropertyElapsedPlaybackTime: call.getDouble("elapsedSeconds") ?? 0,
            MPNowPlayingInfoPropertyPlaybackRate: (call.getBool("playing") ?? false) ? 1.0 : 0.0
        ]
        if let passage = call.getString("passage"), !passage.isEmpty {
            info[MPMediaItemPropertyAlbumTitle] = passage
        } else if let subtitle = call.getString("subtitle"), !subtitle.isEmpty {
            info[MPMediaItemPropertyAlbumTitle] = subtitle
        }
        // An until-Stop field has no honest end: the duration is omitted, not invented.
        if let duration = call.getDouble("durationSeconds") {
            info[MPMediaItemPropertyPlaybackDuration] = duration
        }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
        call.resolve()
    }

    @objc func clearNowPlaying(_ call: CAPPluginCall) {
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
        call.resolve()
    }

    // MARK: - Remote commands (lock screen / Control Center): pause, play, stop only

    private func enableRemoteCommands() {
        guard remoteTargets.isEmpty else { return }
        let center = MPRemoteCommandCenter.shared()
        func bind(_ command: MPRemoteCommand, _ name: String) {
            command.isEnabled = true
            let token = command.addTarget { [weak self] _ in
                NSLog("[SoundFieldAudio] remoteCommand \(name)")
                self?.notifyListeners("remoteCommand", data: ["command": name])
                return .success
            }
            remoteTargets.append((command, token))
        }
        bind(center.playCommand, "play")
        bind(center.pauseCommand, "pause")
        bind(center.stopCommand, "stop")
        bind(center.togglePlayPauseCommand, "toggle")
        // Seeking and skipping are not part of a continuous field.
        for command in [center.nextTrackCommand, center.previousTrackCommand, center.seekForwardCommand,
                        center.seekBackwardCommand, center.changePlaybackPositionCommand,
                        center.skipForwardCommand, center.skipBackwardCommand] {
            command.isEnabled = false
        }
    }

    private func disableRemoteCommands() {
        for entry in remoteTargets {
            if let pair = entry as? (MPRemoteCommand, Any) { pair.0.removeTarget(pair.1) }
        }
        remoteTargets.removeAll()
        let center = MPRemoteCommandCenter.shared()
        for command in [center.playCommand, center.pauseCommand, center.stopCommand, center.togglePlayPauseCommand] {
            command.isEnabled = false
        }
    }

    // MARK: - Interruptions and route changes: reported, never answered with sound

    private func startObserving() {
        guard !observing else { return }
        observing = true
        let nc = NotificationCenter.default
        nc.addObserver(self, selector: #selector(onInterruption(_:)),
                       name: AVAudioSession.interruptionNotification, object: session)
        nc.addObserver(self, selector: #selector(onRouteChange(_:)),
                       name: AVAudioSession.routeChangeNotification, object: session)
    }

    private func stopObserving() {
        guard observing else { return }
        observing = false
        NotificationCenter.default.removeObserver(self)
    }

    @objc private func onInterruption(_ note: Notification) {
        guard let raw = note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: raw) else { return }
        // The system's `shouldResume` option is deliberately dropped: there is no auto-resume.
        var reasonName = "none"
        if let reasonRaw = note.userInfo?[AVAudioSessionInterruptionReasonKey] as? UInt,
           let reason = AVAudioSession.InterruptionReason(rawValue: reasonRaw) {
            switch reason {
            case .default: reasonName = "default"
            case .appWasSuspended: reasonName = "appWasSuspended"
            case .builtInMicMuted: reasonName = "builtInMicMuted"
            case .routeDisconnected: reasonName = "routeDisconnected"
            @unknown default: reasonName = "unknown"
            }
        }
        NSLog("[SoundFieldAudio] interruption \(type == .began ? "began" : "ended") reason=\(reasonName) otherAudio=\(session.isOtherAudioPlaying) category=\(session.category.rawValue)")
        // The system's resume hint is dropped; the mix stops when an interruption begins and waits for the member.
        if type == .began { stopMix(reason: "interruption") }
        notifyListeners("interruption", data: ["phase": type == .began ? "began" : "ended"])
    }

    @objc private func onRouteChange(_ note: Notification) {
        guard let raw = note.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt,
              let reason = AVAudioSession.RouteChangeReason(rawValue: raw) else { return }
        let name: String
        switch reason {
        case .oldDeviceUnavailable: name = "oldDeviceUnavailable"
        case .newDeviceAvailable: name = "newDeviceAvailable"
        case .categoryChange: name = "categoryChange"
        default: name = "other"
        }
        NSLog("[SoundFieldAudio] routeChange \(name)")
        // Losing a route (headphones off, Bluetooth gone) must never move the mix to the speaker.
        if name == "oldDeviceUnavailable" { stopMix(reason: "routeLoss") }
        // Port types only; device names (for example a person's AirPods) are never reported.
        notifyListeners("routeChange", data: ["reason": name])
    }

    deinit { stopObserving() }
}
