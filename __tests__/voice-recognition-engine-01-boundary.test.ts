/**
 * VOICE-RECOGNITION-ENGINE-01 — static gates on the native recognition boundary.
 *
 * WHY SOURCE-READ GATES
 * ---------------------
 * The Swift files cannot be compiled or run in the JS test environment, and the
 * iOS 26 Speech APIs cannot be exercised without a device. So, as
 * `voice-capture-01a-latch-release.test.ts` and `r2-voice-continuity-contract`
 * do, this pins the STRUCTURAL invariants of the lane: what may know about what,
 * where authority is allowed to live, and what the default remains until the
 * device witness. Each gate names the mandate item it protects.
 *
 * These gates say nothing about whether the SpeechAnalyzer engine transcribes
 * well. That is the device witness (lane doc §Witness), not this file.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');
const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const IOS = 'ios/App/App';
const audioSessionManager = read(`${IOS}/AudioSessionManager.swift`);
const voiceController = read(`${IOS}/VoiceController.swift`);
const contract = read(`${IOS}/Recognition/RecognitionEngine.swift`);
const legacy = read(`${IOS}/Recognition/LegacySFSpeechEngine.swift`);
const modern = read(`${IOS}/Recognition/SpeechAnalyzerEngine.swift`);
const selector = read(`${IOS}/Recognition/RecognitionEngineSelector.swift`);
const pbxproj = read('ios/App/App.xcodeproj/project.pbxproj');
const capacitorConfig = read('capacitor.config.ts');
const jsContract = read('lib/voice/contract/MAIAVoiceProvider.ts');
const turnAuthority = read('lib/voice/recognition/humanTurnAuthority.ts');

describe('M1 — AVAudioEngine tap is decoupled from SFSpeechAudioBufferRecognitionRequest', () => {
  it('AudioSessionManager does not import Speech or reference any SFSpeech type', () => {
    expect(audioSessionManager).not.toMatch(/^\s*import Speech\s*$/m);
    expect(audioSessionManager).not.toMatch(/SFSpeech\w+/);
  });

  it('AudioSessionManager exposes a raw buffer consumer tap, not a recognition request', () => {
    expect(audioSessionManager).toContain('typealias RawAudioBufferConsumer = (AVAudioPCMBuffer) -> Void');
    expect(audioSessionManager).toContain('func installInputTap(consumer: @escaping RawAudioBufferConsumer) -> AVAudioFormat?');
    expect(audioSessionManager).not.toContain('createRecognitionRequest');
    expect(audioSessionManager).not.toContain('setRecognitionTask');
  });

  it('full teardown silences the engine through the neutral handle', () => {
    expect(audioSessionManager).toContain('RecognitionTeardownHandle');
    expect(audioSessionManager).toContain('activeRecognition');
    const teardown = audioSessionManager.slice(audioSessionManager.indexOf('private func performFullTeardown()'));
    expect(teardown).toContain('recognition.cancel()');
  });
});

describe('M2 — engine-neutral recognition contract', () => {
  it('names the three evidence kinds and the composition rule', () => {
    expect(contract).toMatch(/enum CaptureEvidence: String \{\s*case flowing\s*case unavailable/);
    expect(contract).toMatch(/enum RecognitionEvidence: String \{\s*case producing\s*case stalled/);
    expect(contract).toMatch(/enum TranscriptStability: String \{\s*case volatile\s*case finalized/);
    expect(contract).toMatch(/enum TranscriptComposition: String \{\s*case cumulative\s*case incremental/);
  });

  it('has no human-turn vocabulary — the boundary cannot express turn completion', () => {
    // The word appears only in the comment explaining why it is absent.
    const code = stripComments(contract);
    expect(code).not.toMatch(/\bturn\b/i);
    expect(code).not.toMatch(/HumanTurn/);
  });

  it('engines consume raw buffers and never see the tap', () => {
    expect(contract).toContain('func consume(_ buffer: AVAudioPCMBuffer)');
    expect(contract).not.toContain('installTap');
    expect(contract).not.toContain('AVAudioEngine');
  });

  it('confidence is optional so no engine has to invent a number', () => {
    expect(contract).toContain('public let confidence: Double?');
  });
});

describe('M3 — LegacySFSpeechEngine keeps the baseline recognition behaviour', () => {
  it('is the only place SFSpeechRecognizer is constructed for recognition', () => {
    expect(legacy).toContain('SFSpeechAudioBufferRecognitionRequest()');
    expect(legacy).toContain('shouldReportPartialResults = true');
    expect(legacy).toContain('nsError.code == 216');
    expect(voiceController).not.toContain('SFSpeechRecognizer(locale');
    expect(voiceController).not.toContain('recognitionTask(with');
    expect(voiceController).not.toContain('SFSpeechAudioBufferRecognitionRequest');
    expect(audioSessionManager).not.toContain('SFSpeechRecognizer');
  });

  it('reports cumulative composition (whole utterance re-sent), and stop is cancel', () => {
    expect(legacy).toContain('composition: .cumulative');
    expect(legacy).toMatch(/func stop\(\) \{\s*cancel\(\)\s*\}/);
  });
});

describe('M4 / M5 — SpeechAnalyzer engine is availability-gated, with DictationTranscriber fallback', () => {
  it('is gated to iOS 26 at the class, and the deployment floor stays at 16.0', () => {
    expect(modern).toMatch(/@available\(iOS 26\.0, \*\)\s*final class SpeechAnalyzerEngine: RecognitionEngine/);
    const targets = pbxproj.match(/IPHONEOS_DEPLOYMENT_TARGET = ([\d.]+);/g) ?? [];
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets) expect(t).toBe('IPHONEOS_DEPLOYMENT_TARGET = 16.0;');
  });

  it('routes buffers through SpeechAnalyzer to SpeechTranscriber or DictationTranscriber', () => {
    expect(modern).toContain('SpeechAnalyzer(modules: [transcriber])');
    expect(modern).toContain('SpeechTranscriber(');
    expect(modern).toContain('SpeechAnalyzer(modules: [dictation])');
    expect(modern).toContain('DictationTranscriber(');
    expect(modern).toContain('AnalyzerInput(buffer: converted)');
    expect(modern).toContain('reportingOptions: [.volatileResults]');
  });

  it('maps Apple isFinal to transcript stability only, incremental composition, no invented confidence', () => {
    expect(modern).toContain('stability: isFinal ? .finalized : .volatile');
    expect(modern).toContain('composition: .incremental');
    expect(modern).toContain('confidence: nil');
  });

  it('holds a bounded pending window while the analyzer warms up', () => {
    expect(modern).toContain('private let pendingCap');
    expect(modern).toContain('pending.removeFirst()');
  });

  it('every iOS 26 symbol in the selector is inside an availability check', () => {
    const uses = selector.split('\n').filter((l) => /SpeechTranscriber\.|DictationTranscriber\.|SpeechAnalyzerEngine\(/.test(l));
    expect(uses.length).toBeGreaterThan(0);
    // Each use must be preceded (in its enclosing region) by `if #available(iOS 26.0, *)`.
    for (const line of uses) {
      const idx = selector.indexOf(line);
      const before = selector.slice(0, idx);
      const lastAvail = before.lastIndexOf('if #available(iOS 26.0, *)');
      const lastFuncStart = before.lastIndexOf('static func ');
      expect(lastAvail).toBeGreaterThan(lastFuncStart);
    }
  });
});

describe('M0 — the baseline stays the default until the device witness', () => {
  it('default preference is baseline and baseline/legacy resolve to the legacy engine by policy', () => {
    expect(selector).toContain('static let defaultPreference: RecognitionEnginePreference = .baseline');
    expect(selector).toContain('static let policy = "legacy_until_witnessed"');
    expect(selector).toMatch(/case \.baseline, \.legacy:[\s\S]*?return \(\.legacySFSpeech,/);
  });

  it('VoiceController falls back to the default preference when JS passes nothing', () => {
    expect(voiceController).toContain('?? RecognitionEnginePreference.defaultPreference');
  });

  it('the modern engine is reachable only by explicit preference', () => {
    const modernBranch = selector.slice(selector.indexOf('case .modern:'), selector.indexOf('case .dictation:'));
    expect(modernBranch).toContain('.speechAnalyzerTranscriber');
    expect(modernBranch).toContain('.speechAnalyzerDictation');
    expect(modernBranch).toContain('.legacySFSpeech');
  });
});

describe('M6 — recognizer finality never closes the human turn', () => {
  it('VoiceController states the rule and emits no turn event', () => {
    expect(voiceController).toContain('RECOGNIZER FINALITY IS NOT TURN FINALITY');
    const emitted = [...voiceController.matchAll(/notifyListeners\("([a-zA-Z]+)"/g)].map((m) => m[1]);
    expect(new Set(emitted)).toEqual(new Set([
      'engineSelected', 'transcriptFinal', 'transcriptPartial', 'error',
      'recognitionEvidence', 'captureEvidence', 'stateChange',
    ]));
    for (const name of emitted) expect(name.toLowerCase()).not.toContain('turn');
  });

  it('the JS contract separates HumanTurnState from transcript stability', () => {
    expect(jsContract).toContain("export type HumanTurnState = 'open' | 'complete';");
    expect(jsContract).toContain("export type TranscriptStability = 'volatile' | 'finalized';");
    // VoiceTranscript may carry stability but never a turn field.
    const vt = stripComments(jsContract.slice(jsContract.indexOf('export interface VoiceTranscript'), jsContract.indexOf('export type VoiceErrorCode')));
    expect(vt).not.toMatch(/\bturn\b/i);
    expect(vt).not.toMatch(/HumanTurnState/);
  });

  it("the assembler's admit() can never set 'complete'; only closeTurn() can", () => {
    const admitBody = stripComments(turnAuthority.slice(turnAuthority.indexOf('admit(t: VoiceTranscript)'), turnAuthority.indexOf('closeTurn(reason')));
    expect(admitBody).not.toContain("'complete'");
    expect(turnAuthority).toContain("turn: 'open'");
  });
});

describe('M7 — capability telemetry carries no transcript content', () => {
  it('Swift toDictionary keys are device/choice facts only', () => {
    const body = selector.slice(selector.indexOf('func toDictionary()'), selector.indexOf('enum RecognitionEngineSelector'));
    const keys = [...body.matchAll(/"([a-zA-Z]+)"/g)].map((m) => m[1]);
    expect(keys).toEqual(expect.arrayContaining(['osVersion', 'engineSelected', 'speechTranscriberAvailable', 'speechTranscriberLocaleSupported', 'localeRequested']));
    for (const k of keys) expect(k).not.toMatch(/text|transcript|utterance|words/i);
  });

  it('JS RecognitionCapabilities has no text-bearing field', () => {
    const iface = jsContract.slice(jsContract.indexOf('export interface RecognitionCapabilities'), jsContract.indexOf('export interface VoiceStartOptions'));
    expect(iface).not.toMatch(/text|transcript|utterance/i);
  });

  it('engineSelected event is the telemetry dictionary plus sessionId', () => {
    expect(voiceController).toContain('var telemetry = caps.toDictionary()');
    expect(voiceController).toContain('telemetry["sessionId"] = sid');
    expect(voiceController).toContain('notifyListeners("engineSelected", data: telemetry)');
  });
});

describe('M8 — compile registration (the part a static gate can prove)', () => {
  const swiftFiles = [
    'VoiceController.swift',
    'RecognitionEngine.swift',
    'LegacySFSpeechEngine.swift',
    'SpeechAnalyzerEngine.swift',
    'RecognitionEngineSelector.swift',
    'AudioSessionManager.swift',
  ];

  it('every plugin/engine Swift file is in the Sources build phase (VoiceController.swift was not, before this lane)', () => {
    const sources = pbxproj.slice(pbxproj.indexOf('/* Begin PBXSourcesBuildPhase section */'), pbxproj.indexOf('/* End PBXSourcesBuildPhase section */'));
    for (const f of swiftFiles) expect(sources).toContain(`/* ${f} in Sources */`);
  });

  it('every Swift file has a file reference and lives in a group', () => {
    for (const f of swiftFiles) {
      expect(pbxproj).toContain(`/* ${f} */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift;`);
    }
    expect(pbxproj).toMatch(/\/\* Recognition \*\/ = \{\s*isa = PBXGroup;[\s\S]*?path = Recognition;/);
  });

  it('both plugins are registered with Capacitor', () => {
    const list = capacitorConfig.slice(capacitorConfig.indexOf('packageClassList'), capacitorConfig.indexOf('plugins:'));
    expect(list).toContain("'VoiceController'");
    expect(list).toContain("'AudioSessionManager'");
  });
});
