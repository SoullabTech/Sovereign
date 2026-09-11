/**
 * VOICE-2026 · KERNEL-00 — source gates (the only gates runnable off-device).
 *
 * K00-01 / VOICE-01  exactly one file mutates AVAudioSession.
 * K00-16 / VOICE-05, -19, -20  nothing else is in the build: no STT, no TTS,
 *   no LLM, no Web audio, no Capacitor, no legacy voice components, no
 *   network, no agent logic.
 * VOICE-10  every output path goes through an OutputStreamID.
 * VOICE-07  the harness holds no voice state of its own.
 *
 * These scan source shape after stripping comments — a file must never fail
 * a gate because its own prose documents the behaviour the gate forbids.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const PKG = join(process.cwd(), 'ios', 'VoiceKernel');
const HARNESS = join(process.cwd(), 'ios', 'VoiceKernelHarness');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(swift|yml|plist)$/.test(name)) out.push(p);
  }
  return out;
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'])\/\/.*$/gm, '$1');
}

const files = [...walk(PKG), ...walk(HARNESS)];
const swift = files.filter((f) => f.endsWith('.swift'));
const bodies = new Map(swift.map((f) => [f, stripComments(readFileSync(f, 'utf8'))]));
const rel = (f: string) => f.replace(process.cwd() + '/', '');

describe('KERNEL-00 · K00-01 / VOICE-01 — one hardware sovereign', () => {
  const mutators = [
    /AVAudioSession\.sharedInstance\(\)/,
    /\.setCategory\(/,
    /\.setActive\(/,
    /\.setPreferredSampleRate\(/,
    /\.setPreferredIOBufferDuration\(/,
    /\.overrideOutputAudioPort\(/,
    /\.setPreferredInput\(/,
    /\.setMode\(/,
  ];
  it('only AudioSessionAuthority.swift touches AVAudioSession', () => {
    const offenders: string[] = [];
    for (const [f, body] of bodies) {
      if (f.endsWith('AudioSessionAuthority.swift')) continue;
      for (const m of mutators) if (m.test(body)) offenders.push(`${rel(f)} :: ${m}`);
    }
    expect(offenders).toEqual([]);
  });
  it('AudioSessionAuthority is iOS-only by construction and journals every mutation', () => {
    const f = swift.find((p) => p.endsWith('AudioSessionAuthority.swift'))!;
    const body = bodies.get(f)!;
    expect(body).toMatch(/#if os\(iOS\)/);
    expect(body).toMatch(/event: "session_configured"/);
    expect(body).toMatch(/event: "session_released"/);
    expect(body).toMatch(/interruptionNotification/);
    expect(body).toMatch(/routeChangeNotification/);
    expect(body).toMatch(/mediaServicesWereResetNotification/);
  });
});

describe('KERNEL-00 · K00-16 — nothing else is in the build', () => {
  const forbidden: Array<[RegExp, string]> = [
    [/import Speech\b/, 'Apple Speech (STT)'],
    [/SFSpeech/, 'SFSpeechRecognizer (STT)'],
    [/SpeechAnalyzer|SpeechTranscriber/, 'SpeechAnalyzer (STT)'],
    [/AVSpeechSynthesizer|AVSpeechUtterance/, 'AVSpeechSynthesizer (TTS)'],
    [/URLSession|URLRequest|NWConnection|import Network\b|WebSocket/, 'network egress'],
    [/import WebKit\b|WKWebView/, 'WebView audio'],
    [/import Capacitor\b|CAPPlugin|CAPBridge/, 'Capacitor'],
    [/AudioSessionManager\b|VoiceController\b/, 'legacy voice components'],
    [/speech-recognition|SpeechRecognition\b/, 'community speech plugin'],
    [/whisper|Whisper|kokoro|Kokoro|openai|OpenAI|Anthropic|anthropic|claude/, 'models / providers'],
    [/isListening\b/, 'the giant boolean (VOICE-07)'],
    [/\bVAD\b|VoiceActivity|turnCommitted|TurnCoordinator/, 'turn layer — belongs to KERNEL-01'],
  ];
  it('no forbidden symbol appears in kernel or harness source', () => {
    const offenders: string[] = [];
    for (const [f, body] of bodies) {
      for (const [re, what] of forbidden) if (re.test(body)) offenders.push(`${rel(f)} :: ${what}`);
    }
    expect(offenders).toEqual([]);
  });
  it('the package has no dependencies and the harness is not a member of ios/App', () => {
    const pkg = stripComments(readFileSync(join(PKG, 'Package.swift'), 'utf8'));
    expect(pkg).toMatch(/dependencies: \[\]/);
    // YAML comments are prose; the gate reads the spec, not the explanation.
    const yml = readFileSync(join(HARNESS, 'project.yml'), 'utf8').replace(/^\s*#.*$/gm, '');
    expect(yml).not.toMatch(/Pods|Podfile|ios\/App\b|capacitor/i);
    expect(yml).toMatch(/PRODUCT_BUNDLE_IDENTIFIER: life\.soullab\.voicekernel\.k00/);
  });
});

describe('KERNEL-00 · VOICE-10 — output has identity and a cancellable lifetime', () => {
  it('the graph schedules only under an OutputStreamID and exposes cancel(id)', () => {
    const f = swift.find((p) => p.endsWith('AudioGraph.swift'))!;
    const body = bodies.get(f)!;
    expect(body).toMatch(/func schedule\(_ buffer: AVAudioPCMBuffer, as id: OutputStreamID\)/);
    expect(body).toMatch(/func cancel\(_ id: OutputStreamID\)/);
    expect(body).toMatch(/completionCallbackType: \.dataRendered/);
    // No bare play path that bypasses identity.
    expect(body).not.toMatch(/func play\(/);
  });
  it('the kernel journals every cancel with frames rendered and cancel latency', () => {
    const f = swift.find((p) => p.endsWith('VoiceKernel.swift'))!;
    const body = bodies.get(f)!;
    expect(body).toMatch(/"stream_cancelled"/);
    expect(body).toMatch(/cancelLatencyMs/);
  });
});

describe('KERNEL-00 · VOICE-06 / -15 / -16 — one recovery owner, bounded, journalled', () => {
  it('only HealthSupervisor verdicts reach requestRecovery, and the schedule is the ratified one', () => {
    const k = bodies.get(swift.find((p) => p.endsWith('VoiceKernel.swift'))!)!;
    const calls = k.match(/(?<!func )requestRecovery\(faultClass:/g) ?? [];
    // evaluate() has three verdict arms + the rebuild-failed path; nothing else may call it.
    expect(calls.length).toBeLessThanOrEqual(4);
    const r = bodies.get(swift.find((p) => p.endsWith('RecoveryPolicy.swift'))!)!;
    expect(r).toMatch(/budgetPerWindow: Int = 3/);
    expect(r).toMatch(/windowMs: Int64 = 60_000/);
    expect(r).toMatch(/backoffMs: \[Int64\] = \[500, 1_000, 2_000\]/);
    const h = bodies.get(swift.find((p) => p.endsWith('HealthSupervisor.swift'))!)!;
    expect(h).toMatch(/entryWindowMs: Int64 = 1_500/);
    expect(h).toMatch(/deadInputMs: Int64 = 2_000/);
    expect(h).toMatch(/stalledOutputMs: Int64 = 1_000/);
    expect(h).toMatch(/cancelWindowMs: Int64 = 100/);
  });
  it('stale callbacks are gated by generation and journalled, never acted on', () => {
    const k = bodies.get(swift.find((p) => p.endsWith('VoiceKernel.swift'))!)!;
    expect((k.match(/"stale_callback_dropped"/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(k).toMatch(/guard raw\.generation == snap\.generation else \{/);
  });
});

describe('KERNEL-00 · VOICE-07 — the harness is a projection', () => {
  it('HarnessModel holds no voice state and reduces only kernel snapshots', () => {
    const f = swift.find((p) => p.endsWith('HarnessModel.swift'))!;
    const body = bodies.get(f)!;
    expect(body).toMatch(/for await s in k\.projection\.stream/);
    expect(body).not.toMatch(/@Published var (listening|speaking|micState|floor)/);
    expect(body).toMatch(/private func reduce\(_ s: KernelSnapshot\)/);
  });
  it('the view displays "listening" only via the snapshot rule, never from a local flag', () => {
    const f = swift.find((p) => p.endsWith('HarnessView.swift'))!;
    const body = bodies.get(f)!;
    expect(body).toMatch(/s\.displaysListening/);
    expect(body).not.toMatch(/@State private var (listening|speaking)/);
  });
});
