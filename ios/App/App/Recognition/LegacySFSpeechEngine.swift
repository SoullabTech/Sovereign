import Foundation
import AVFoundation
import Speech

// VOICE-RECOGNITION-ENGINE-01 · M3 — the baseline recognizer, unchanged in
// behaviour, moved behind the boundary.
//
// This is the exact recognition path VoiceController ran before the lane:
// one SFSpeechAudioBufferRecognitionRequest, partial results on, a single
// recognition pass, error 216 ("canceled") swallowed on stop. Nothing about
// its timing, restart, or finality semantics was altered. It is the control
// the SpeechAnalyzer engine is witnessed against, and it remains the engine
// for iOS 16–25 and for iOS 26 devices whose SpeechTranscriber model is not
// supported.
final class LegacySFSpeechEngine: RecognitionEngine {
    let kind: RecognitionEngineKind = .legacySFSpeech

    private let locale: Locale
    private var recognizer: SFSpeechRecognizer?
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    private var sink: ((RecognitionEngineEvent) -> Void)?
    private var cancelled = false
    private var segmentCounter = 0
    private let lock = NSLock()

    init(locale: Locale) {
        self.locale = locale
    }

    /// Availability of the baseline path for a locale. Used by the selector so
    /// capability telemetry can say "legacy available: false" honestly.
    static func isAvailable(locale: Locale) -> Bool {
        guard let recognizer = SFSpeechRecognizer(locale: locale) else { return false }
        return recognizer.isAvailable
    }

    func start(inputFormat: AVAudioFormat,
               sink: @escaping (RecognitionEngineEvent) -> Void) throws {
        guard let recognizer = SFSpeechRecognizer(locale: locale) else {
            throw RecognitionEngineError.unavailable("SFSpeechRecognizer not available for \(locale.identifier)")
        }
        guard recognizer.isAvailable else {
            throw RecognitionEngineError.unavailable("SFSpeechRecognizer not currently available (network/permission?)")
        }

        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true

        lock.lock()
        self.recognizer = recognizer
        self.request = request
        self.sink = sink
        self.cancelled = false
        self.segmentCounter = 0
        lock.unlock()

        task = recognizer.recognitionTask(with: request) { [weak self] result, error in
            guard let self = self else { return }
            self.lock.lock()
            let isCancelled = self.cancelled
            let deliver = self.sink
            self.lock.unlock()
            guard !isCancelled, let deliver = deliver else { return }

            if let result = result {
                let text = result.bestTranscription.formattedString
                let confidence = Double(result.bestTranscription.segments.last?.confidence ?? 0.0)
                let id = self.nextSegmentId()
                deliver(.transcript(RecognitionSegment(
                    text: text,
                    stability: result.isFinal ? .finalized : .volatile,
                    composition: .cumulative,
                    confidence: confidence,
                    engine: self.kind,
                    segmentId: id
                )))
            }

            if let error = error {
                let nsError = error as NSError
                // Code 216 = "Recognition request was canceled" — expected on stop(), not an error.
                if nsError.code == 216 || nsError.localizedDescription.contains("canceled") {
                    NSLog("[LegacySFSpeechEngine] Recognition cancelled (expected on stop)")
                    return
                }
                NSLog("[LegacySFSpeechEngine] Recognition error: \(error.localizedDescription)")
                deliver(.failure(
                    code: "recognition_failed",
                    message: error.localizedDescription,
                    recoverable: false,
                    underlying: "\(nsError.domain) \(nsError.code)"
                ))
            }
        }
    }

    func consume(_ buffer: AVAudioPCMBuffer) {
        request?.append(buffer)
    }

    /// Baseline semantics: stop is cancel. SFSpeech's task-boundary drain is
    /// exactly the stitching machinery this lane exists to retire, so the
    /// legacy engine does not pretend to have a graceful drain it never had.
    func stop() {
        cancel()
    }

    func cancel() {
        lock.lock()
        cancelled = true
        let t = task
        let r = request
        task = nil
        request = nil
        sink = nil
        lock.unlock()

        t?.cancel()
        r?.endAudio()
    }

    private func nextSegmentId() -> Int {
        lock.lock()
        segmentCounter += 1
        let id = segmentCounter
        lock.unlock()
        return id
    }
}
