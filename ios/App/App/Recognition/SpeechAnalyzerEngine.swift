import Foundation
import AVFoundation
import Speech

// VOICE-RECOGNITION-ENGINE-01 · M4 / M5 — Apple's iOS 26 recognition
// architecture behind the MAIA boundary.
//
//   AVAudioEngine tap ──raw AVAudioPCMBuffer──▶ consume()
//                                                  │ convert to analyzer format
//                                                  ▼
//                                     AsyncStream<AnalyzerInput>
//                                                  │
//                                            SpeechAnalyzer
//                                                  │
//                        ┌─────────────────────────┴───────────────────────┐
//                  SpeechTranscriber (.transcriber)        DictationTranscriber (.dictation)
//                  long-form / conversational model        older-hardware compatible model
//                        └─────────────────────────┬───────────────────────┘
//                                                  ▼
//                                   results ──▶ RecognitionSegment (.incremental)
//
// Both modules are availability-gated to iOS 26.0; the deployment floor stays
// at 16.0. The selector decides which mode is instantiated.
//
// Result semantics (why composition is `incremental`): SpeechAnalyzer delivers
// a volatile result as the current in-progress text for the not-yet-finalized
// range (replace the pending tail), and a finalized result as a chunk that is
// appended to what is already committed. It does not re-send the whole
// utterance. The assembler above the boundary stitches accordingly.
//
// `isFinal` from Apple is mapped to `.finalized` and nothing else. It is not
// the end of the human turn.
@available(iOS 26.0, *)
final class SpeechAnalyzerEngine: RecognitionEngine {
    enum Mode {
        case transcriber
        case dictation
    }

    let kind: RecognitionEngineKind

    private let locale: Locale
    private let mode: Mode

    private var analyzer: SpeechAnalyzer?
    private var inputBuilder: AsyncStream<AnalyzerInput>.Continuation?
    private var analyzerFormat: AVAudioFormat?
    private var converter: AVAudioConverter?
    private var converterInputFormat: AVAudioFormat?

    private var startTask: Task<Void, Never>?
    private var resultsTask: Task<Void, Never>?

    private var sink: ((RecognitionEngineEvent) -> Void)?
    private var cancelled = false
    private var stopping = false
    private var segmentCounter = 0

    /// Buffers that arrive before the analyzer has told us its preferred
    /// format. Bounded so a stalled model download cannot grow memory without
    /// limit; at 1024 frames/buffer this is roughly five seconds of audio.
    private var pending: [AVAudioPCMBuffer] = []
    private let pendingCap = 256

    private let lock = NSLock()

    init(locale: Locale, mode: Mode) {
        self.locale = locale
        self.mode = mode
        self.kind = (mode == .transcriber) ? .speechAnalyzerTranscriber : .speechAnalyzerDictation
    }

    // MARK: - RecognitionEngine

    func start(inputFormat: AVAudioFormat,
               sink: @escaping (RecognitionEngineEvent) -> Void) throws {
        let (stream, builder) = AsyncStream<AnalyzerInput>.makeStream()

        lock.lock()
        self.sink = sink
        self.cancelled = false
        self.stopping = false
        self.segmentCounter = 0
        self.inputBuilder = builder
        self.pending.removeAll()
        lock.unlock()

        let locale = self.locale
        let mode = self.mode

        startTask = Task { [weak self] in
            guard let self = self else { return }
            do {
                switch mode {
                case .transcriber:
                    let transcriber = SpeechTranscriber(
                        locale: locale,
                        transcriptionOptions: [],
                        reportingOptions: [.volatileResults],
                        attributeOptions: []
                    )
                    try await self.ensureAssets(for: [transcriber])
                    let analyzer = SpeechAnalyzer(modules: [transcriber])
                    let format = await SpeechAnalyzer.bestAvailableAudioFormat(compatibleWith: [transcriber])
                    self.resultsTask = Task { [weak self] in
                        do {
                            for try await result in transcriber.results {
                                self?.emit(text: String(result.text.characters), isFinal: result.isFinal)
                            }
                            self?.emitFinished()
                        } catch {
                            self?.fail(error, code: "recognition_failed")
                        }
                    }
                    self.activate(analyzer: analyzer, format: format)
                    try await analyzer.start(inputSequence: stream)

                case .dictation:
                    let dictation = DictationTranscriber(
                        locale: locale,
                        contentHints: [],
                        transcriptionOptions: [],
                        reportingOptions: [.volatileResults],
                        attributeOptions: []
                    )
                    try await self.ensureAssets(for: [dictation])
                    let analyzer = SpeechAnalyzer(modules: [dictation])
                    let format = await SpeechAnalyzer.bestAvailableAudioFormat(compatibleWith: [dictation])
                    self.resultsTask = Task { [weak self] in
                        do {
                            for try await result in dictation.results {
                                self?.emit(text: String(result.text.characters), isFinal: result.isFinal)
                            }
                            self?.emitFinished()
                        } catch {
                            self?.fail(error, code: "recognition_failed")
                        }
                    }
                    self.activate(analyzer: analyzer, format: format)
                    try await analyzer.start(inputSequence: stream)
                }
            } catch {
                self.fail(error, code: "recognizer_unavailable")
            }
        }
    }

    func consume(_ buffer: AVAudioPCMBuffer) {
        lock.lock()
        guard !cancelled, !stopping, let builder = inputBuilder else {
            lock.unlock()
            return
        }
        guard let format = analyzerFormat else {
            // Analyzer not ready yet — hold a bounded window, drop the oldest.
            if pending.count >= pendingCap { pending.removeFirst() }
            pending.append(buffer)
            lock.unlock()
            return
        }
        lock.unlock()

        if let converted = convert(buffer, to: format) {
            builder.yield(AnalyzerInput(buffer: converted))
        }
    }

    /// Graceful drain: end the input, let the analyzer finalize what it holds,
    /// then emit `.finished`. Trailing `finalized` segments may still arrive
    /// between this call and `.finished`.
    func stop() {
        lock.lock()
        guard !cancelled, !stopping else {
            lock.unlock()
            return
        }
        stopping = true
        let builder = inputBuilder
        let analyzer = self.analyzer
        lock.unlock()

        builder?.finish()
        Task { [weak self] in
            do {
                try await analyzer?.finalizeAndFinishThroughEndOfInput()
            } catch {
                self?.fail(error, code: "recognition_failed")
            }
        }
    }

    func cancel() {
        lock.lock()
        cancelled = true
        let builder = inputBuilder
        let analyzer = self.analyzer
        inputBuilder = nil
        self.analyzer = nil
        sink = nil
        pending.removeAll()
        lock.unlock()

        builder?.finish()
        startTask?.cancel()
        resultsTask?.cancel()
        startTask = nil
        resultsTask = nil
        if let analyzer = analyzer {
            Task { await analyzer.cancelAndFinishNow() }
        }
    }

    // MARK: - Private

    private func ensureAssets(for modules: [any SpeechModule]) async throws {
        if let request = try await AssetInventory.assetInstallationRequest(supporting: modules) {
            NSLog("[SpeechAnalyzerEngine] Installing speech assets for \(locale.identifier)")
            try await request.downloadAndInstall()
        }
    }

    private func activate(analyzer: SpeechAnalyzer, format: AVAudioFormat?) {
        lock.lock()
        guard !cancelled else {
            lock.unlock()
            return
        }
        self.analyzer = analyzer
        self.analyzerFormat = format
        let held = pending
        pending.removeAll()
        let builder = inputBuilder
        lock.unlock()

        guard let format = format, let builder = builder else { return }
        for buffer in held {
            if let converted = convert(buffer, to: format) {
                builder.yield(AnalyzerInput(buffer: converted))
            }
        }
    }

    private func convert(_ buffer: AVAudioPCMBuffer, to format: AVAudioFormat) -> AVAudioPCMBuffer? {
        if buffer.format.isEqual(format) { return buffer }

        lock.lock()
        if converter == nil || converterInputFormat?.isEqual(buffer.format) != true {
            converter = AVAudioConverter(from: buffer.format, to: format)
            converterInputFormat = buffer.format
        }
        let converter = self.converter
        lock.unlock()

        guard let converter = converter else { return nil }

        let ratio = format.sampleRate / buffer.format.sampleRate
        let capacity = AVAudioFrameCount(Double(buffer.frameLength) * ratio) + 32
        guard let out = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: capacity) else { return nil }

        var consumed = false
        var conversionError: NSError?
        let status = converter.convert(to: out, error: &conversionError) { _, outStatus in
            if consumed {
                outStatus.pointee = .noDataNow
                return nil
            }
            consumed = true
            outStatus.pointee = .haveData
            return buffer
        }
        guard status != .error, conversionError == nil else { return nil }
        return out
    }

    private func emit(text: String, isFinal: Bool) {
        lock.lock()
        guard !cancelled, let deliver = sink else {
            lock.unlock()
            return
        }
        segmentCounter += 1
        let id = segmentCounter
        lock.unlock()

        deliver(.transcript(RecognitionSegment(
            text: text,
            stability: isFinal ? .finalized : .volatile,
            composition: .incremental,
            confidence: nil, // SpeechAnalyzer does not report a scalar confidence; do not invent one.
            engine: kind,
            segmentId: id
        )))
    }

    private func emitFinished() {
        lock.lock()
        let deliver = cancelled ? nil : sink
        lock.unlock()
        deliver?(.finished)
    }

    private func fail(_ error: Error, code: String) {
        if error is CancellationError { return }
        lock.lock()
        let deliver = cancelled ? nil : sink
        lock.unlock()
        let nsError = error as NSError
        NSLog("[SpeechAnalyzerEngine] \(code): \(error.localizedDescription)")
        deliver?(.failure(
            code: code,
            message: error.localizedDescription,
            recoverable: code == "recognizer_unavailable",
            underlying: "\(nsError.domain) \(nsError.code)"
        ))
    }
}
