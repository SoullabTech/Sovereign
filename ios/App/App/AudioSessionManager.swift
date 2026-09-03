import Foundation
import Capacitor
import AVFoundation

/// AudioSessionManager - The iOS Audio Session Gatekeeper
///
/// This plugin manages exclusive access to the iOS audio session,
/// ensuring TTS and speech recognition never fight over control.
/// It implements the "full teardown" pattern required for reliable
/// audio mode transitions on iOS.
///
/// VOICE-RECOGNITION-ENGINE-01 · M1: this file no longer knows what a speech
/// recognizer is. The microphone tap hands raw `AVAudioPCMBuffer`s to a
/// consumer closure; whatever is behind that closure is silenced during a full
/// teardown through the engine-neutral `RecognitionTeardownHandle`. The
/// `Speech` framework is intentionally not imported here.
@objc(AudioSessionManager)
public class AudioSessionManager: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AudioSessionManager"
    public let jsName = "AudioSessionManager"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "prepareForListening", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "prepareForSpeaking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopAllAudio", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getAudioDiagnostics", returnType: CAPPluginReturnPromise)
    ]

    // MARK: - State Management

    private enum AudioState: String {
        case idle = "idle"
        case listening = "listening"
        case speaking = "speaking"
        case transitioning = "transitioning"
    }

    private var currentState: AudioState = .idle
    private let stateLock = NSLock()

    private var audioEngine: AVAudioEngine?
    /// Whatever is consuming the tap right now. Cancelled on full teardown.
    private weak var activeRecognition: RecognitionTeardownHandle?
    private var inputTapInstalled = false

    private let audioSession = AVAudioSession.sharedInstance()

    // MARK: - Plugin Methods

    /// Prepare the audio session for speech recognition (listening mode)
    /// This performs a full teardown before configuring for input
    @objc func prepareForListening(_ call: CAPPluginCall) {
        stateLock.lock()
        let previousState = currentState
        currentState = .transitioning
        stateLock.unlock()

        NSLog("[AudioSessionManager] prepareForListening called, previous state: \(previousState.rawValue)")

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            do {
                // Step 1: Full teardown of any existing audio
                self.performFullTeardown()

                // Step 2: Small delay to let the system settle
                Thread.sleep(forTimeInterval: 0.1)

                // Step 3: Deactivate the session (the "reset spell")
                try self.audioSession.setActive(false, options: .notifyOthersOnDeactivation)
                NSLog("[AudioSessionManager] Session deactivated")

                // Step 4: Configure for recording with speech recognition
                try self.audioSession.setCategory(
                    .playAndRecord,
                    mode: .measurement,
                    options: [.defaultToSpeaker, .allowBluetooth, .duckOthers]
                )
                NSLog("[AudioSessionManager] Category set to playAndRecord/measurement")

                // Step 5: Activate the session for listening
                try self.audioSession.setActive(true, options: [])
                NSLog("[AudioSessionManager] Session activated for listening")

                // Step 6: Initialize audio engine
                self.audioEngine = AVAudioEngine()

                // Step 7: Update state
                self.stateLock.lock()
                self.currentState = .listening
                self.stateLock.unlock()

                call.resolve([
                    "success": true,
                    "state": "listening",
                    "sampleRate": self.audioSession.sampleRate,
                    "inputChannels": self.audioSession.inputNumberOfChannels
                ])

            } catch {
                NSLog("[AudioSessionManager] prepareForListening failed: \(error.localizedDescription)")

                self.stateLock.lock()
                self.currentState = .idle
                self.stateLock.unlock()

                call.reject("Failed to prepare for listening: \(error.localizedDescription)")
            }
        }
    }

    /// Prepare the audio session for TTS (speaking mode)
    /// This performs a full teardown before configuring for output
    @objc func prepareForSpeaking(_ call: CAPPluginCall) {
        stateLock.lock()
        let previousState = currentState
        currentState = .transitioning
        stateLock.unlock()

        NSLog("[AudioSessionManager] prepareForSpeaking called, previous state: \(previousState.rawValue)")

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            do {
                // Step 1: Full teardown of any existing audio (especially recognition)
                self.performFullTeardown()

                // Step 2: Small delay to let the system settle
                Thread.sleep(forTimeInterval: 0.1)

                // Step 3: Deactivate the session (the "reset spell")
                try self.audioSession.setActive(false, options: .notifyOthersOnDeactivation)
                NSLog("[AudioSessionManager] Session deactivated")

                // Step 4: Configure for playback only
                try self.audioSession.setCategory(
                    .playback,
                    mode: .spokenAudio,
                    options: [.duckOthers]
                )
                NSLog("[AudioSessionManager] Category set to playback/spokenAudio")

                // Step 5: Activate the session for speaking
                try self.audioSession.setActive(true, options: [])
                NSLog("[AudioSessionManager] Session activated for speaking")

                // Step 6: Update state
                self.stateLock.lock()
                self.currentState = .speaking
                self.stateLock.unlock()

                call.resolve([
                    "success": true,
                    "state": "speaking"
                ])

            } catch {
                NSLog("[AudioSessionManager] prepareForSpeaking failed: \(error.localizedDescription)")

                self.stateLock.lock()
                self.currentState = .idle
                self.stateLock.unlock()

                call.reject("Failed to prepare for speaking: \(error.localizedDescription)")
            }
        }
    }

    /// Stop all audio and return to idle state
    @objc func stopAllAudio(_ call: CAPPluginCall) {
        NSLog("[AudioSessionManager] stopAllAudio called")

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            self.performFullTeardown()

            do {
                try self.audioSession.setActive(false, options: .notifyOthersOnDeactivation)
            } catch {
                NSLog("[AudioSessionManager] Failed to deactivate session: \(error.localizedDescription)")
            }

            self.stateLock.lock()
            self.currentState = .idle
            self.stateLock.unlock()

            call.resolve([
                "success": true,
                "state": "idle"
            ])
        }
    }

    /// Get diagnostic information about current audio state
    @objc func getAudioDiagnostics(_ call: CAPPluginCall) {
        stateLock.lock()
        let state = currentState.rawValue
        stateLock.unlock()

        var diagnostics: [String: Any] = [
            "currentState": state,
            "category": audioSession.category.rawValue,
            "mode": audioSession.mode.rawValue,
            "isOtherAudioPlaying": audioSession.isOtherAudioPlaying,
            "sampleRate": audioSession.sampleRate,
            "inputAvailable": audioSession.isInputAvailable
        ]

        if let inputDataSource = audioSession.inputDataSource {
            diagnostics["inputDataSource"] = inputDataSource.dataSourceName
        }

        if let outputDataSource = audioSession.outputDataSource {
            diagnostics["outputDataSource"] = outputDataSource.dataSourceName
        }

        diagnostics["inputNumberOfChannels"] = audioSession.inputNumberOfChannels
        diagnostics["outputNumberOfChannels"] = audioSession.outputNumberOfChannels
        diagnostics["preferredSampleRate"] = audioSession.preferredSampleRate
        diagnostics["inputLatency"] = audioSession.inputLatency
        diagnostics["outputLatency"] = audioSession.outputLatency

        // Check available inputs
        var inputDescriptions: [[String: Any]] = []
        if let inputs = audioSession.availableInputs {
            for input in inputs {
                inputDescriptions.append([
                    "portName": input.portName,
                    "portType": input.portType.rawValue,
                    "uid": input.uid
                ])
            }
        }
        diagnostics["availableInputs"] = inputDescriptions

        call.resolve(diagnostics)
    }

    // MARK: - Private Methods

    /// Perform a complete teardown of all audio resources
    private func performFullTeardown() {
        NSLog("[AudioSessionManager] Performing full teardown...")

        // Silence whatever is behind the recognition boundary
        if let recognition = activeRecognition {
            recognition.cancel()
            activeRecognition = nil
            NSLog("[AudioSessionManager] Active recognition cancelled")
        }

        // Stop and reset the audio engine
        if let engine = audioEngine {
            // Remove input tap if installed
            if inputTapInstalled {
                engine.inputNode.removeTap(onBus: 0)
                inputTapInstalled = false
                NSLog("[AudioSessionManager] Input tap removed")
            }

            if engine.isRunning {
                engine.stop()
                NSLog("[AudioSessionManager] Audio engine stopped")
            }

            engine.reset()
            NSLog("[AudioSessionManager] Audio engine reset")

            audioEngine = nil
        }

        NSLog("[AudioSessionManager] Full teardown complete")
    }

    // MARK: - Audio Engine Access (for speech recognition integration)

    /// Get the audio engine for external use (e.g., by speech recognition)
    public func getAudioEngine() -> AVAudioEngine? {
        return audioEngine
    }

    public typealias RawAudioBufferConsumer = (AVAudioPCMBuffer) -> Void

    /// M1 — install the microphone tap and route raw buffers to `consumer`.
    /// Returns the tap format so the consumer can prepare for it, or nil when
    /// there is no engine to tap. The buffers are untouched: no recognition
    /// request, no format opinion, no lifecycle coupling.
    public func installInputTap(consumer: @escaping RawAudioBufferConsumer) -> AVAudioFormat? {
        guard let engine = audioEngine else {
            NSLog("[AudioSessionManager] Cannot install input tap - no audio engine")
            return nil
        }

        let inputNode = engine.inputNode
        if inputTapInstalled {
            inputNode.removeTap(onBus: 0)
            inputTapInstalled = false
        }

        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            consumer(buffer)
        }
        inputTapInstalled = true
        return recordingFormat
    }

    /// Start the audio engine
    public func startAudioEngine() throws {
        guard let engine = audioEngine else {
            throw NSError(domain: "AudioSessionManager", code: 1, userInfo: [
                NSLocalizedDescriptionKey: "Audio engine not initialized"
            ])
        }

        engine.prepare()
        try engine.start()
        NSLog("[AudioSessionManager] Audio engine started")
    }

    /// Register the consumer behind the tap so a full teardown can silence it
    /// without knowing which engine it is.
    public func setActiveRecognition(_ handle: RecognitionTeardownHandle?) {
        activeRecognition = handle
    }
}
