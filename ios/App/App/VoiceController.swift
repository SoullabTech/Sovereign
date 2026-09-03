import Foundation
import Capacitor
import AVFoundation
import Speech

/// VoiceController — Single-owner iOS voice runtime for MAIA.
///
/// Owns the recognition lifecycle through the engine-neutral boundary
/// (`Recognition/RecognitionEngine.swift`). Delegates audio session + engine
/// management to AudioSessionManager, which owns the "full teardown" pattern,
/// the AVAudioEngine, and the microphone tap.
///
/// VOICE-RECOGNITION-ENGINE-01: this plugin no longer instantiates a speech
/// recognizer. It asks `RecognitionEngineSelector` for an engine, hands the
/// raw microphone buffers to it, and translates its events for JS.
///
/// JS contract events (compat events kept; new evidence events added):
///   - transcriptPartial:    { text, confidence, confidenceReported, isFinal: false,
///                             stability: "volatile", composition, engine, segmentId, sessionId }
///   - transcriptFinal:      { ...same, isFinal: true, stability: "finalized" }
///   - captureEvidence:      { evidence: "flowing" | "unavailable", sessionId }
///   - recognitionEvidence:  { evidence: "producing" | "stalled", sessionId }
///   - engineSelected:       { ...RecognitionCapabilities, sessionId }   (no transcript content)
///   - stateChange:          { state, previousState, sessionId }
///   - error:                { code, message, recoverable, sessionId, underlying }
///
/// RECOGNIZER FINALITY IS NOT TURN FINALITY. `transcriptFinal` / `finalized`
/// means the engine will not revise those words. It does not mean the person
/// has finished speaking. This plugin emits no "turn complete" event of any
/// kind; the human turn is closed above the recognizer, by MAIA's silence /
/// turn authority (lib/voice/recognition/humanTurnAuthority.ts).
///
/// Design doc: docs/programme/VOICE-RECOGNITION-ENGINE-01_LANE.md
@objc(VoiceController)
public class VoiceController: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "VoiceController"
    public let jsName = "VoiceController"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCapabilities", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermission", returnType: CAPPluginReturnPromise)
    ]

    // MARK: - State

    private enum State: String {
        case idle, listening, paused, transitioning, error
    }

    private var currentState: State = .idle
    private let stateLock = NSLock()
    private var engine: RecognitionEngine?
    /// Engines that were asked to drain after stop(). Held strongly until they
    /// report `.finished` or the drain grace elapses, so trailing finalized
    /// segments are not lost to deallocation.
    private var draining: [RecognitionEngine] = []
    private let drainGraceSeconds: Double = 5.0
    private var sessionId: String = ""

    // MARK: - Evidence tracking (capture heartbeat generalised to the boundary)

    private let evidenceLock = NSLock()
    private var lastBufferAt: CFAbsoluteTime = 0
    private var voicedSecondsSinceLastSegment: Double = 0
    private var captureEvidence: CaptureEvidence?
    private var recognitionEvidence: RecognitionEvidence?
    private var watchdog: DispatchSourceTimer?
    private let watchdogQueue = DispatchQueue(label: "maia.voice.evidence")

    /// Buffers older than this and capture is `unavailable`.
    private let captureStaleSeconds: Double = 1.5
    /// This much voiced audio with no segment and recognition is `stalled`.
    private let stallVoicedSeconds: Double = 6.0
    /// RMS below this is treated as silence for stall accounting only.
    private let voicedRmsThreshold: Float = 0.01

    // MARK: - Plugin Methods

    /// Request speech recognition authorization.
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

    /// M7 — what this device can do, without starting anything.
    /// Options: { engine?: "baseline"|"modern"|"dictation"|"legacy", locale?: "en-US" }
    @objc func getCapabilities(_ call: CAPPluginCall) {
        let preference = RecognitionEnginePreference(rawValue: call.getString("engine") ?? "")
            ?? RecognitionEnginePreference.defaultPreference
        let locale = Locale(identifier: call.getString("locale") ?? "en-US")
        Task {
            let caps = await RecognitionEngineSelector.probe(preference: preference, locale: locale)
            call.resolve(caps.toDictionary())
        }
    }

    /// Start a recognition session.
    /// Requires AudioSessionManager.prepareForListening() to have been called first
    /// (the JS provider orchestrates this).
    /// Options: { engine?: "baseline"|"modern"|"dictation"|"legacy", locale?: "en-US" }
    @objc func start(_ call: CAPPluginCall) {
        guard let audioMgr = bridge?.plugin(withName: "AudioSessionManager") as? AudioSessionManager else {
            call.reject("AudioSessionManager plugin not available")
            return
        }
        guard audioMgr.getAudioEngine() != nil else {
            call.reject("Audio engine not initialized — caller must invoke AudioSessionManager.prepareForListening first")
            return
        }

        let preference = RecognitionEnginePreference(rawValue: call.getString("engine") ?? "")
            ?? RecognitionEnginePreference.defaultPreference
        let locale = Locale(identifier: call.getString("locale") ?? "en-US")

        // New session ID for event correlation
        sessionId = String(UUID().uuidString.prefix(8)).lowercased()
        let sid = sessionId

        Task { [weak self] in
            guard let self = self else { return }

            let (engine, caps) = await RecognitionEngineSelector.select(preference: preference, locale: locale)
            var telemetry = caps.toDictionary()
            telemetry["sessionId"] = sid
            self.notifyListeners("engineSelected", data: telemetry)
            NSLog("[VoiceController] engine=\(caps.engineSelected) reason=\(caps.selectionReason) os=\(caps.osVersion) sid=\(sid)")

            await MainActor.run {
                self.beginSession(engine: engine, audioMgr: audioMgr, sessionId: sid, call: call)
            }
        }
    }

    /// Stop the current recognition session and return to idle.
    /// Caller (JS provider) is responsible for calling AudioSessionManager.stopAllAudio()
    /// after this if full audio teardown is desired.
    @objc func stop(_ call: CAPPluginCall) {
        stopWatchdog()
        if let engine = engine {
            self.engine = nil
            engine.stop()
            retainWhileDraining(engine)
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

    // MARK: - Session

    private func beginSession(engine: RecognitionEngine,
                              audioMgr: AudioSessionManager,
                              sessionId sid: String,
                              call: CAPPluginCall) {
        // Guard against a stop() that raced the async selection.
        guard sid == sessionId else {
            call.reject("Session superseded before start completed")
            return
        }

        resetEvidence()

        // M1 — the tap hands raw buffers to the boundary. The engine never
        // sees the tap, the AVAudioEngine, or the audio session.
        guard let inputFormat = audioMgr.installInputTap(consumer: { [weak self, weak engine] buffer in
            self?.noteBuffer(buffer)
            engine?.consume(buffer)
        }) else {
            call.reject("Failed to install microphone tap")
            return
        }

        do {
            try engine.start(inputFormat: inputFormat) { [weak self] event in
                self?.handle(event, sessionId: sid)
            }
        } catch {
            NSLog("[VoiceController] Engine start failed: \(error.localizedDescription) sid=\(sid)")
            audioMgr.setActiveRecognition(nil)
            setState(.error)
            call.reject("Recognition engine failed to start: \(error.localizedDescription)")
            return
        }

        self.engine = engine
        audioMgr.setActiveRecognition(engine)
        setState(.listening)

        do {
            try audioMgr.startAudioEngine()
            startWatchdog(sessionId: sid)
            NSLog("[VoiceController] Started engine=\(engine.kind.rawValue) sessionId=\(sid)")
            call.resolve(["success": true, "sessionId": sid, "engine": engine.kind.rawValue])
        } catch {
            NSLog("[VoiceController] Failed to start audio engine: \(error.localizedDescription)")
            engine.cancel()
            self.engine = nil
            audioMgr.setActiveRecognition(nil)
            setState(.error)
            call.reject("Failed to start audio engine: \(error.localizedDescription)")
        }
    }

    private func handle(_ event: RecognitionEngineEvent, sessionId sid: String) {
        switch event {
        case .transcript(let segment):
            noteSegment()
            let data: [String: Any] = [
                "text": segment.text,
                "confidence": segment.confidence ?? 0.0,
                "confidenceReported": segment.confidence != nil,
                "isFinal": segment.stability == .finalized,
                "stability": segment.stability.rawValue,
                "composition": segment.composition.rawValue,
                "engine": segment.engine.rawValue,
                "segmentId": segment.segmentId,
                "sessionId": sid
            ]
            if segment.stability == .finalized {
                notifyListeners("transcriptFinal", data: data)
                NSLog("[VoiceController] finalized segment #\(segment.segmentId) engine=\(segment.engine.rawValue) sid=\(sid)")
            } else {
                notifyListeners("transcriptPartial", data: data)
            }

        case .failure(let code, let message, let recoverable, let underlying):
            NSLog("[VoiceController] Recognition failure \(code): \(message) sid=\(sid)")
            notifyListeners("error", data: [
                "code": code,
                "message": message,
                "recoverable": recoverable,
                "sessionId": sid,
                "underlying": underlying ?? ""
            ])
            setState(.error)

        case .finished:
            NSLog("[VoiceController] Engine drained sid=\(sid)")
            releaseDrained()
        }
    }

    private func retainWhileDraining(_ engine: RecognitionEngine) {
        stateLock.lock()
        draining.append(engine)
        stateLock.unlock()
        watchdogQueue.asyncAfter(deadline: .now() + drainGraceSeconds) { [weak self, weak engine] in
            guard let self = self, let engine = engine else { return }
            engine.cancel()
            self.stateLock.lock()
            self.draining.removeAll { $0 === engine }
            self.stateLock.unlock()
        }
    }

    private func releaseDrained() {
        stateLock.lock()
        draining.removeAll()
        stateLock.unlock()
    }

    // MARK: - Evidence

    private func resetEvidence() {
        evidenceLock.lock()
        lastBufferAt = 0
        voicedSecondsSinceLastSegment = 0
        captureEvidence = nil
        recognitionEvidence = nil
        evidenceLock.unlock()
    }

    /// Audio render thread. Keep it cheap: a timestamp and an RMS.
    private func noteBuffer(_ buffer: AVAudioPCMBuffer) {
        let now = CFAbsoluteTimeGetCurrent()
        let frames = Int(buffer.frameLength)
        var voiced = false
        if frames > 0, let channels = buffer.floatChannelData {
            let samples = channels[0]
            var sum: Float = 0
            for i in 0..<frames { sum += samples[i] * samples[i] }
            let rms = (sum / Float(frames)).squareRoot()
            voiced = rms > voicedRmsThreshold
        }
        let seconds = frames > 0 ? Double(frames) / buffer.format.sampleRate : 0

        evidenceLock.lock()
        lastBufferAt = now
        if voiced { voicedSecondsSinceLastSegment += seconds }
        evidenceLock.unlock()
    }

    private func noteSegment() {
        evidenceLock.lock()
        voicedSecondsSinceLastSegment = 0
        let previous = recognitionEvidence
        recognitionEvidence = .producing
        let sid = sessionId
        evidenceLock.unlock()
        if previous != .producing {
            notifyListeners("recognitionEvidence", data: ["evidence": RecognitionEvidence.producing.rawValue, "sessionId": sid])
        }
    }

    private func startWatchdog(sessionId sid: String) {
        stopWatchdog()
        let timer = DispatchSource.makeTimerSource(queue: watchdogQueue)
        timer.schedule(deadline: .now() + 1.0, repeating: 1.0)
        timer.setEventHandler { [weak self] in
            self?.tickEvidence(sessionId: sid)
        }
        timer.resume()
        watchdog = timer
    }

    private func stopWatchdog() {
        watchdog?.cancel()
        watchdog = nil
    }

    private func tickEvidence(sessionId sid: String) {
        let now = CFAbsoluteTimeGetCurrent()

        evidenceLock.lock()
        let capture: CaptureEvidence = (lastBufferAt > 0 && now - lastBufferAt < captureStaleSeconds) ? .flowing : .unavailable
        let captureChanged = capture != captureEvidence
        captureEvidence = capture

        var recognitionChanged = false
        if capture == .flowing, voicedSecondsSinceLastSegment >= stallVoicedSeconds, recognitionEvidence != .stalled {
            recognitionEvidence = .stalled
            recognitionChanged = true
        }
        let recognition = recognitionEvidence
        evidenceLock.unlock()

        if captureChanged {
            notifyListeners("captureEvidence", data: ["evidence": capture.rawValue, "sessionId": sid])
        }
        if recognitionChanged, let recognition = recognition {
            NSLog("[VoiceController] recognition stalled: voiced audio flowing, no segment for \(Int(stallVoicedSeconds))s sid=\(sid)")
            notifyListeners("recognitionEvidence", data: ["evidence": recognition.rawValue, "sessionId": sid])
        }
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
