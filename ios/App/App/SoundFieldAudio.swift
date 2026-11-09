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
        CAPPluginMethod(name: "clearNowPlaying", returnType: CAPPluginReturnPromise)
    ]

    private let session = AVAudioSession.sharedInstance()
    private var observing = false
    private var remoteTargets: [Any] = []

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
        // Port types only; device names (for example a person's AirPods) are never reported.
        notifyListeners("routeChange", data: ["reason": name])
    }

    deinit { stopObserving() }
}
