import Foundation
import Capacitor
import AVFoundation
import Speech

/// VoiceController — Single-owner iOS voice runtime for MAIA (Phase 1).
///
/// Owns the speech recognition lifecycle. Delegates audio session + engine
/// management to AudioSessionManager (which owns the "full teardown" pattern
/// and AVAudioEngine).
///
/// Architecture: this plugin is ONE side of the voice contract. The JS layer
/// (IOSNativeVoiceProvider) talks to the MAIAVoiceProvider interface, which
/// translates to Capacitor plugin calls.
///
/// JS contract events:
///   - transcriptPartial: { text, confidence, isFinal: false, sessionId }
///   - transcriptFinal:   { text, confidence, isFinal: true,  sessionId }
///   - stateChange:       { state, previousState, sessionId }
///   - error:             { code, message, recoverable, sessionId }
///
/// PHASE 1 SCOPE: scaffold + first transcript smoke test.
///   ✅ Permission request
///   ✅ Start single recognition pass
///   ✅ Emit partial + final transcripts
///   ✅ Stop cleanly
///   ❌ No continuous restart (Phase 2)
///   ❌ No 60-sec session rotation (Phase 2)
///   ❌ No pauseForTTS/resumeAfterTTS (Phase 3)
///   ❌ No background/foreground recovery (Phase 4)
///   ❌ No production telemetry (Phase 5)
///
/// Design doc: docs/architecture/MAIA_VOICE_CONTROLLER_DESIGN.md
@objc(VoiceController)
public class VoiceController: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "VoiceController"
    public let jsName = "VoiceController"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermission", returnType: CAPPluginReturnPromise)
    ]

    // MARK: - State

    private enum State: String {
        case idle, listening, paused, transitioning, error
    }

    private var currentState: State = .idle
    private let stateLock = NSLock()
    private var recognitionTask: SFSpeechRecognitionTask?
    private var sessionId: String = ""

    // MARK: - Plugin Methods

    /// Request speech recognition authorization.
    /// Must be granted before start() will succeed.
    @objc func requestPermission(_ call: CAPPluginCall) {
        SFSpeechRecognizer.requestAuthorization { status in
            DispatchQueue.main.async {
                let granted = (status == .authorized)
                let statusName: String
                switch status {
                case .authorized: statusName = "authorized"
                case .denied: statusName = "denied"
                case .restricted: statusName = "restricted"
                case .notDetermined: statusName = "notDetermined"
                @unknown default: statusName = "unknown"
                }
                NSLog("[VoiceController] Speech permission: \(statusName) granted=\(granted)")
                call.resolve(["granted": granted, "status": statusName])
            }
        }
    }

    /// Start a recognition session.
    /// Requires AudioSessionManager.prepareForListening() to have been called first
    /// (the JS provider orchestrates this).
    @objc func start(_ call: CAPPluginCall) {
        // Acquire AudioSessionManager via the Capacitor bridge.
        // This is the substrate that owns audio session + engine.
        guard let audioMgrPlugin = bridge?.plugin(withName: "AudioSessionManager") as? AudioSessionManager else {
            call.reject("AudioSessionManager plugin not available")
            return
        }

        // Verify the audio engine has been initialized
        // (AudioSessionManager.prepareForListening must have run first).
        guard audioMgrPlugin.getAudioEngine() != nil else {
            call.reject("Audio engine not initialized — caller must invoke AudioSessionManager.prepareForListening first")
            return
        }

        // Construct speech recognizer for current locale (en-US for Phase 1).
        // Future: pull from user preference.
        guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US")) else {
            call.reject("SFSpeechRecognizer not available for en-US locale")
            return
        }

        guard recognizer.isAvailable else {
            call.reject("Speech recognizer not currently available (network/permission?)")
            return
        }

        // Create the recognition request via AudioSessionManager (which installs
        // the audio tap on the engine's input node).
        guard let request = audioMgrPlugin.createRecognitionRequest() else {
            call.reject("Failed to create recognition request from AudioSessionManager")
            return
        }

        // New session ID for event correlation
        sessionId = String(UUID().uuidString.prefix(8)).lowercased()

        // Update state to listening
        setState(.listening)

        // Create the recognition task with our result handler.
        // Phase 1: single recognition pass. When isFinal arrives, we DO NOT
        // restart — that's Phase 2.
        recognitionTask = recognizer.recognitionTask(with: request) { [weak self] result, error in
            guard let self = self else { return }

            if let result = result {
                let text = result.bestTranscription.formattedString
                let isFinal = result.isFinal
                let confidence = Double(result.bestTranscription.segments.last?.confidence ?? 0.0)

                let event: [String: Any] = [
                    "text": text,
                    "confidence": confidence,
                    "isFinal": isFinal,
                    "sessionId": self.sessionId
                ]

                if isFinal {
                    self.notifyListeners("transcriptFinal", data: event)
                    NSLog("[VoiceController] Final: \(text) (conf=\(confidence)) sid=\(self.sessionId)")
                } else {
                    self.notifyListeners("transcriptPartial", data: event)
                }
            }

            if let error = error {
                let nsError = error as NSError
                // Code 216 = "Recognition request was canceled" — happens on stop(), not an error
                if nsError.code == 216 || nsError.localizedDescription.contains("canceled") {
                    NSLog("[VoiceController] Recognition cancelled (expected on stop) sid=\(self.sessionId)")
                    return
                }

                NSLog("[VoiceController] Recognition error: \(error.localizedDescription) sid=\(self.sessionId)")
                self.notifyListeners("error", data: [
                    "code": "recognition_failed",
                    "message": error.localizedDescription,
                    "recoverable": false,
                    "sessionId": self.sessionId,
                    "underlying": "\(nsError.domain) \(nsError.code)"
                ])
                self.setState(.error)
            }
        }

        // Track the task in AudioSessionManager so its teardown logic can cancel it
        audioMgrPlugin.setRecognitionTask(recognitionTask)

        // Start the audio engine (AudioSessionManager owns this)
        do {
            try audioMgrPlugin.startAudioEngine()
            NSLog("[VoiceController] Started, sessionId=\(sessionId)")
            call.resolve(["success": true, "sessionId": sessionId])
        } catch {
            NSLog("[VoiceController] Failed to start audio engine: \(error.localizedDescription)")
            setState(.error)
            call.reject("Failed to start audio engine: \(error.localizedDescription)")
        }
    }

    /// Stop the current recognition session and return to idle.
    /// Caller (JS provider) is responsible for calling AudioSessionManager.stopAllAudio()
    /// after this if full audio teardown is desired.
    @objc func stop(_ call: CAPPluginCall) {
        if let task = recognitionTask {
            task.cancel()
            recognitionTask = nil
        }
        setState(.idle)
        NSLog("[VoiceController] Stopped, sessionId=\(sessionId)")
        call.resolve(["success": true, "sessionId": sessionId])
    }

    /// Get current state. Single source of truth for "is voice listening".
    @objc func getState(_ call: CAPPluginCall) {
        stateLock.lock()
        let state = currentState.rawValue
        stateLock.unlock()
        call.resolve(["state": state, "sessionId": sessionId])
    }

    // MARK: - Private

    /// Update state and emit stateChange event if changed.
    private func setState(_ newState: State) {
        stateLock.lock()
        let oldState = currentState
        currentState = newState
        stateLock.unlock()

        if oldState != newState {
            NSLog("[VoiceController] State: \(oldState.rawValue) → \(newState.rawValue) sid=\(sessionId)")
            notifyListeners("stateChange", data: [
                "state": newState.rawValue,
                "previousState": oldState.rawValue,
                "sessionId": sessionId
            ])
        }
    }
}
