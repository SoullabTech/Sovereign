import Foundation
import AVFoundation

// VOICE-RECOGNITION-ENGINE-01 · M2 — engine-neutral recognition contract.
//
// MAIA's hearing is no longer organised around the lifecycle of a speech
// recognition task. The audio engine produces raw buffers; an engine behind
// this boundary turns them into words; MAIA decides when the human is done.
//
// Three orthogonal kinds of evidence replace the old started/stopped/
// partial/final vocabulary:
//
//   CAPTURE EVIDENCE       flowing | unavailable      are buffers arriving?
//   RECOGNITION EVIDENCE   producing | stalled        is audio becoming words?
//   TRANSCRIPT STATE       volatile | finalized       may this text still change?
//
// A fourth thing is deliberately NOT here:
//
//   HUMAN TURN             open | complete
//
// No engine may express it. `finalized` means "the recognizer will not revise
// these words" — it never means "the person has finished the thought". Turn
// authority lives above the recognizer (lib/voice/recognition/humanTurnAuthority.ts).

/// Are audio buffers reaching the recognition boundary?
public enum CaptureEvidence: String {
    case flowing
    case unavailable
}

/// Is voiced audio turning into transcript segments?
public enum RecognitionEvidence: String {
    case producing
    case stalled
}

/// May the recognizer still revise this text?
public enum TranscriptStability: String {
    case volatile
    case finalized
}

/// How a segment's text relates to earlier segments of the same utterance.
///
/// - `cumulative`: `text` is the whole utterance so far (SFSpeechRecognizer
///   re-delivers the full transcription on every callback).
/// - `incremental`: `text` is a chunk. A finalized chunk is appended to what
///   is already committed; a volatile chunk replaces the pending tail
///   (SpeechAnalyzer delivers results this way).
///
/// The assembler above the boundary handles both so that no engine has to
/// impersonate another.
public enum TranscriptComposition: String {
    case cumulative
    case incremental
}

public enum RecognitionEngineKind: String {
    case legacySFSpeech = "legacy_sfspeech"
    case speechAnalyzerTranscriber = "speech_analyzer_transcriber"
    case speechAnalyzerDictation = "speech_analyzer_dictation"
}

/// One recognition result. Carries text plus the facts the consumer needs to
/// stitch it correctly; carries no opinion about the human turn.
public struct RecognitionSegment {
    public let text: String
    public let stability: TranscriptStability
    public let composition: TranscriptComposition
    /// 0.0–1.0 when the engine reports one; `nil` when it does not. Consumers
    /// must not manufacture a number where the engine gave none.
    public let confidence: Double?
    public let engine: RecognitionEngineKind
    /// Engine-local, monotonically increasing per session. Lets the consumer
    /// reject duplicate or out-of-order admission without parsing text.
    public let segmentId: Int

    public init(text: String,
                stability: TranscriptStability,
                composition: TranscriptComposition,
                confidence: Double?,
                engine: RecognitionEngineKind,
                segmentId: Int) {
        self.text = text
        self.stability = stability
        self.composition = composition
        self.confidence = confidence
        self.engine = engine
        self.segmentId = segmentId
    }
}

public enum RecognitionEngineEvent {
    case transcript(RecognitionSegment)
    /// Engine could not continue. `recoverable` is the engine's honest read of
    /// whether a fresh `start` would succeed; the caller decides what to do.
    case failure(code: String, message: String, recoverable: Bool, underlying: String?)
    /// The engine drained its trailing results after `stop()` and is now quiet.
    case finished
}

public enum RecognitionEngineError: Error, LocalizedError {
    case unavailable(String)
    case startFailed(String)

    public var errorDescription: String? {
        switch self {
        case .unavailable(let why): return "Recognition engine unavailable: \(why)"
        case .startFailed(let why): return "Recognition engine failed to start: \(why)"
        }
    }
}

/// Anything AudioSessionManager must be able to silence during a full
/// teardown, without knowing which engine is behind it.
public protocol RecognitionTeardownHandle: AnyObject {
    /// Stop immediately. No events after this returns.
    func cancel()
}

/// The boundary. Engines never own the microphone tap, the audio session, or
/// the audio engine. They receive buffers and return words.
public protocol RecognitionEngine: RecognitionTeardownHandle {
    var kind: RecognitionEngineKind { get }

    /// Prepare to receive buffers in `inputFormat`. Must return quickly; heavy
    /// setup (model checks, asset installs) happens asynchronously and buffers
    /// that arrive meanwhile are the engine's responsibility to hold or drop.
    func start(inputFormat: AVAudioFormat,
               sink: @escaping (RecognitionEngineEvent) -> Void) throws

    /// M1 — raw buffer consumer. Called from the audio render thread.
    func consume(_ buffer: AVAudioPCMBuffer)

    /// End of input. The engine may emit trailing `finalized` segments, then
    /// `.finished`. Engines that cannot drain (legacy) may treat this as cancel.
    func stop()
}
