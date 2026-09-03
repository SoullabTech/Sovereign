import Foundation
import Speech

// VOICE-RECOGNITION-ENGINE-01 · M0 / M7 — engine selection and capability
// telemetry.
//
// Selection is a policy, not a discovery: the baseline (2515 lineage,
// SFSpeechRecognizer) stays the default until the SpeechAnalyzer engine has
// won a same-device, same-walk witness against it. The modern engine is
// reachable only when the caller asks for it. Flipping `defaultPreference`
// to `.modern` is the single line that changes the default, and it is a
// governed act that follows the witness — never precedes it.
//
// Telemetry carries OS, engine selected, availability facts, locale support,
// and the reason for the choice. It carries no transcript content, ever.

enum RecognitionEnginePreference: String {
    /// The control path. Resolves to the legacy engine regardless of OS.
    case baseline
    /// Apple's iOS 26 architecture if supported, DictationTranscriber if not,
    /// legacy if neither. The candidate path.
    case modern
    /// Force DictationTranscriber where available (older-hardware comparison).
    case dictation
    /// Force the legacy engine explicitly.
    case legacy

    /// M0 — legacy until witnessed. See lane doc before changing.
    static let defaultPreference: RecognitionEnginePreference = .baseline
}

struct RecognitionCapabilities {
    var osVersion: String
    var localeRequested: String
    var preference: String
    var policy: String
    var engineSelected: String
    var selectionReason: String
    var speechAnalyzerApiPresent: Bool
    var speechTranscriberAvailable: Bool?
    var speechTranscriberLocaleSupported: Bool?
    /// Always `nil`. The shipped iOS 26 SDK exposes no `isAvailable` member on
    /// the dictation module (first native compile, 2026-09-03: "type
    /// 'DictationTranscriber' has no member 'isAvailable'"). Dictation
    /// eligibility is API presence + locale support; no device-availability
    /// test is performed, and none is claimed.
    var dictationTranscriberAvailable: Bool?
    var dictationTranscriberLocaleSupported: Bool?
    var legacyAvailable: Bool

    /// M7 — capability telemetry. Keys are facts about the device and the
    /// choice. There is deliberately no key that could carry what was said.
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "osVersion": osVersion,
            "localeRequested": localeRequested,
            "preference": preference,
            "policy": policy,
            "engineSelected": engineSelected,
            "selectionReason": selectionReason,
            "speechAnalyzerApiPresent": speechAnalyzerApiPresent,
            "legacyAvailable": legacyAvailable
        ]
        dict["speechTranscriberAvailable"] = speechTranscriberAvailable.map { $0 } ?? NSNull()
        dict["speechTranscriberLocaleSupported"] = speechTranscriberLocaleSupported.map { $0 } ?? NSNull()
        dict["dictationTranscriberAvailable"] = dictationTranscriberAvailable.map { $0 } ?? NSNull()
        dict["dictationTranscriberLocaleSupported"] = dictationTranscriberLocaleSupported.map { $0 } ?? NSNull()
        return dict
    }
}

enum RecognitionEngineSelector {
    static let policy = "legacy_until_witnessed"

    /// Probe what this device can do for `locale`, without starting anything.
    static func probe(preference: RecognitionEnginePreference, locale: Locale) async -> RecognitionCapabilities {
        var caps = RecognitionCapabilities(
            osVersion: ProcessInfo.processInfo.operatingSystemVersionString,
            localeRequested: locale.identifier,
            preference: preference.rawValue,
            policy: policy,
            engineSelected: RecognitionEngineKind.legacySFSpeech.rawValue,
            selectionReason: "unresolved",
            speechAnalyzerApiPresent: false,
            speechTranscriberAvailable: nil,
            speechTranscriberLocaleSupported: nil,
            dictationTranscriberAvailable: nil,
            dictationTranscriberLocaleSupported: nil,
            legacyAvailable: LegacySFSpeechEngine.isAvailable(locale: locale)
        )

        if #available(iOS 26.0, *) {
            caps.speechAnalyzerApiPresent = true
            caps.speechTranscriberAvailable = SpeechTranscriber.isAvailable
            // The dictation module has no `isAvailable` in the SDK — left nil (see struct doc).

            let wanted = locale.identifier(.bcp47)
            let stLocales = await SpeechTranscriber.supportedLocales
            caps.speechTranscriberLocaleSupported = stLocales.contains { $0.identifier(.bcp47) == wanted }
            let dtLocales = await DictationTranscriber.supportedLocales
            caps.dictationTranscriberLocaleSupported = dtLocales.contains { $0.identifier(.bcp47) == wanted }
        }

        let (kind, reason) = resolve(preference: preference, caps: caps)
        caps.engineSelected = kind.rawValue
        caps.selectionReason = reason
        return caps
    }

    /// Probe, then instantiate the engine the policy resolves to.
    static func select(preference: RecognitionEnginePreference,
                       locale: Locale) async -> (engine: RecognitionEngine, capabilities: RecognitionCapabilities) {
        let caps = await probe(preference: preference, locale: locale)
        let engine: RecognitionEngine
        switch RecognitionEngineKind(rawValue: caps.engineSelected) ?? .legacySFSpeech {
        case .speechAnalyzerTranscriber:
            if #available(iOS 26.0, *) {
                engine = SpeechAnalyzerEngine(locale: locale, mode: .transcriber)
            } else {
                engine = LegacySFSpeechEngine(locale: locale)
            }
        case .speechAnalyzerDictation:
            if #available(iOS 26.0, *) {
                engine = SpeechAnalyzerEngine(locale: locale, mode: .dictation)
            } else {
                engine = LegacySFSpeechEngine(locale: locale)
            }
        case .legacySFSpeech:
            engine = LegacySFSpeechEngine(locale: locale)
        }
        return (engine, caps)
    }

    // MARK: - Policy

    private static func resolve(preference: RecognitionEnginePreference,
                                caps: RecognitionCapabilities) -> (RecognitionEngineKind, String) {
        let transcriberReady = caps.speechAnalyzerApiPresent
            && caps.speechTranscriberAvailable == true
            && caps.speechTranscriberLocaleSupported == true
        // Dictation: API presence + locale support only. The SDK offers no
        // device-availability member for DictationTranscriber, so none is tested.
        let dictationReady = caps.speechAnalyzerApiPresent
            && caps.dictationTranscriberLocaleSupported == true

        switch preference {
        case .baseline, .legacy:
            // M0 — the control path. Selected by policy, not by capability.
            return (.legacySFSpeech, "policy:\(policy) preference:\(preference.rawValue)")

        case .modern:
            if transcriberReady {
                return (.speechAnalyzerTranscriber, "SpeechTranscriber available and locale supported")
            }
            if dictationReady {
                return (.speechAnalyzerDictation, "SpeechTranscriber unavailable; DictationTranscriber locale supported (no device-availability API)")
            }
            if !caps.speechAnalyzerApiPresent {
                return (.legacySFSpeech, "SpeechAnalyzer API absent (iOS < 26)")
            }
            return (.legacySFSpeech, "SpeechAnalyzer present; SpeechTranscriber unavailable or locale unsupported; DictationTranscriber locale unsupported")

        case .dictation:
            if dictationReady {
                return (.speechAnalyzerDictation, "DictationTranscriber requested; locale supported (no device-availability API)")
            }
            if !caps.speechAnalyzerApiPresent {
                return (.legacySFSpeech, "SpeechAnalyzer API absent (iOS < 26)")
            }
            return (.legacySFSpeech, "DictationTranscriber requested but locale unsupported")
        }
    }
}
