import Foundation
import Capacitor
import AVFoundation

/**
 * NativeAudioPlayerPlugin - Sovereign Audio Architecture
 *
 * Design: Resolve immediately, event-driven completion
 * - playBase64 resolves instantly with durationMs (JS never hangs)
 * - playbackEnded event fires when audio actually finishes
 * - JS uses duration-based timeout as final governor
 *
 * This keeps MAIA's state machine self-consistent even if iOS
 * decides to skip a delegate callback or interrupt audio session.
 */
@objc(NativeAudioPlayer)
public class NativeAudioPlayerPlugin: CAPPlugin, CAPBridgedPlugin, AVAudioPlayerDelegate {

    public let identifier = "NativeAudioPlayer"
    public let jsName = "NativeAudioPlayer"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "playBase64", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise)
    ]

    private var player: AVAudioPlayer?
    private let session = AVAudioSession.sharedInstance()

    @objc func playBase64(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                call.reject("Plugin deallocated")
                return
            }

            print("🎧 [NativeAudioPlayer] === playBase64 START ===")

            // Stop any existing playback first
            if self.player != nil {
                self.player?.stop()
                self.player = nil
                // Emit interrupted event for previous playback
                self.notifyListeners("playbackEnded", data: [
                    "success": false,
                    "reason": "interrupted"
                ])
                print("🎧 [NativeAudioPlayer] Interrupted previous playback")
            }

            // Get and validate base64
            guard let base64 = call.getString("base64"), !base64.isEmpty else {
                call.reject("Missing base64")
                return
            }

            print("🎧 [NativeAudioPlayer] Got \(base64.count) chars")

            guard let data = Data(base64Encoded: base64, options: .ignoreUnknownCharacters),
                  data.count > 0 else {
                call.reject("Invalid/empty base64")
                return
            }

            print("🎧 [NativeAudioPlayer] Decoded \(data.count) bytes")

            // Reset audio session before reconfiguring
            do {
                try self.session.setActive(false, options: .notifyOthersOnDeactivation)
            } catch {
                print("🎧 [NativeAudioPlayer] Session deactivate (best effort): \(error)")
            }

            // Configure session for spoken output
            // CRITICAL: This category coexists with mic/STT workflows
            do {
                try self.session.setCategory(
                    .playAndRecord,
                    mode: .spokenAudio,
                    options: [.defaultToSpeaker, .duckOthers, .allowBluetooth, .allowBluetoothA2DP]
                )
                // CRITICAL: Hard-force speaker routing to prevent "silent route" after STT
                try? self.session.overrideOutputAudioPort(.speaker)
                try self.session.setActive(true)
                print("🎧 [NativeAudioPlayer] Session configured with forced speaker routing")
            } catch {
                call.reject("Audio session error: \(error.localizedDescription)")
                return
            }

            // Create player
            do {
                let p = try AVAudioPlayer(data: data)
                self.player = p
                p.delegate = self
                p.volume = 1.0
                p.numberOfLoops = 0
                p.prepareToPlay()

                let durationMs = Int(p.duration * 1000)
                print("🎧 [NativeAudioPlayer] Player ready, duration: \(durationMs)ms")

                // ✅ RESOLVE IMMEDIATELY with duration - JS never hangs
                call.resolve([
                    "ok": true,
                    "durationMs": durationMs
                ])

                // Now start playback
                if p.play() {
                    print("🎧 [NativeAudioPlayer] ✅ play() started")
                } else {
                    print("🎧 [NativeAudioPlayer] ❌ play() returned false")
                    self.player = nil
                    self.notifyListeners("playbackEnded", data: [
                        "success": false,
                        "reason": "play_failed"
                    ])
                    do { try self.session.setActive(false, options: .notifyOthersOnDeactivation) } catch {}
                }
            } catch {
                print("🎧 [NativeAudioPlayer] ❌ Player error: \(error)")
                call.reject("Player error: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - AVAudioPlayerDelegate

    public func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        print("🎧 [NativeAudioPlayer] ✅ Delegate: finished, success=\(flag)")

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            self.player = nil

            // Emit event for JS to handle
            self.notifyListeners("playbackEnded", data: [
                "success": flag,
                "reason": flag ? "completed" : "failed"
            ])

            do { try self.session.setActive(false, options: .notifyOthersOnDeactivation) } catch {}
        }
    }

    public func audioPlayerDecodeErrorDidOccur(_ player: AVAudioPlayer, error: Error?) {
        print("🎧 [NativeAudioPlayer] ❌ Decode error: \(error?.localizedDescription ?? "?")")

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            self.player = nil

            self.notifyListeners("playbackEnded", data: [
                "success": false,
                "reason": "decode_error",
                "error": error?.localizedDescription ?? "unknown"
            ])

            do { try self.session.setActive(false, options: .notifyOthersOnDeactivation) } catch {}
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                call.resolve(["ok": true])
                return
            }

            print("🎧 [NativeAudioPlayer] stop() called")

            if self.player != nil {
                self.player?.stop()
                self.player = nil

                self.notifyListeners("playbackEnded", data: [
                    "success": false,
                    "reason": "stopped"
                ])
            }

            do { try self.session.setActive(false, options: .notifyOthersOnDeactivation) } catch {}

            call.resolve(["ok": true])
        }
    }
}
