/**
 * VOICE-2026 · KERNEL-00 — source gates (the only gates runnable off-device).
 *
 * K00-01 / VOICE-01  exactly one file mutates AVAudioSession.
 * K00-16 / VOICE-05, -19, -20  nothing else is in the build: no STT, no TTS,
 *   no LLM, no Web audio, no Capacitor, no legacy voice components, no
 *   network, no agent logic.
 * VOICE-10  every output path goes through an OutputStreamID.
 * VOICE-07  the harness holds no voice state of its own.
 * PRE-WITNESS-01  every session mutation is its own journal record (P3), the
 *   cancel metric is measured at the render seam (P5), every record carries a
 *   causal parent seq (P8), and the harness reaches the journal only through
 *   the actor (MAC-COMPILE-01 C2).
 *
 * GATE BY HISTORY (founder ruling 2026-09-14, VPIO-01 plan §11 item 5).
 *   Two subjects now exist. The ENGINE subject (`AVAudioEngine`, P5-B0
 *   `24a6fcfa1`, Phase-A `4596b9bdb`) is FROZEN: every assertion that
 *   describes it reads the file bytes from the immutable commit in the local
 *   git object database, never the working tree. The VPIO subject (working
 *   tree) is asserted semantically. The files the substitution may not touch
 *   (authority · supervisor · policy · state · projection · journal · replay ·
 *   harness) are pinned byte-identical to `24a6fcfa1`. No VPIO tree hash is
 *   pre-invented: artifact custody is UUID + SHA + manifest at MAC-COMPILE.
 *
 * These scan source shape after stripping comments — a file must never fail
 * a gate because its own prose documents the behaviour the gate forbids.
 */
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

const PKG = join(process.cwd(), 'ios', 'VoiceKernel');
const HARNESS = join(process.cwd(), 'ios', 'VoiceKernelHarness');
const KSRC = 'ios/VoiceKernel/Sources/VoiceKernel';

// The frozen engine subjects, by immutable commit. Never a branch name.
const P5B0 = '24a6fcfa1';     // P5-B0 · MAC-COMPILE-07 · dylib CC0D3604-… · the app under test for DRIVER-01 stages A/B/C
const PHASE_A = '4596b9bdb';  // Phase A · MAC-COMPILE-06 · dylib 11A057AA-… · reproduced as R1 (64EEC026-…)

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

// History readers: bytes of a path at an immutable commit, from the local object database.
const histRaw = (sha: string, path: string): Buffer =>
  execFileSync('git', ['show', `${sha}:${path}`], { cwd: process.cwd(), maxBuffer: 64 * 1024 * 1024 });
const histBody = (sha: string, path: string): string => stripComments(histRaw(sha, path).toString('utf8'));
const histList = (sha: string, paths: string[]): string[] =>
  execFileSync('git', ['ls-tree', '-r', '--name-only', sha, '--', ...paths], { cwd: process.cwd() })
    .toString('utf8').split('\n').filter(Boolean);
const K = (name: string) => histBody(P5B0, `${KSRC}/${name}`);   // engine-subject kernel file at P5-B0

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
      // VPIO-01 plan §3 second source pin: nothing but the authority even NAMES the session.
      if (/AVAudioSession/.test(body)) offenders.push(`${rel(f)} :: names AVAudioSession`);
    }
    expect(offenders).toEqual([]);
  });
  it('AudioSessionAuthority is iOS-only by construction and journals every mutation', () => {
    const f = swift.find((p) => p.endsWith('AudioSessionAuthority.swift'))!;
    const body = bodies.get(f)!;
    expect(body).toMatch(/#if os\(iOS\)/);
    // P3: one record per mutation, each with its outcome, plus the summary records.
    for (const ev of [
      'session_category_set',
      'session_preferred_sample_rate_set',
      'session_preferred_io_buffer_set',
      'session_activated',
      'session_configured',
      'session_deactivated',
      'session_released',
      'session_output_override',
    ]) {
      expect(body).toContain(`"${ev}"`);
    }
    expect(body).toMatch(/"outcome"/);
    // C3: the current SDK option name; the deprecated `.allowBluetooth` may not return.
    expect(body).toMatch(/\.allowBluetoothHFP/);
    expect(body).not.toMatch(/\.allowBluetooth\b(?!HFP|A2DP)/);
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
    // VPIO-01 (founder ruling 2026-09-14): one VPIO build, one substrate — the engine subject is frozen in history,
    // never a second substrate or a runtime choice in this tree.
    [/AVAudioEngine\b|AVAudioPlayerNode|AVAudioPCMBuffer|installTap\(|AVAudioEngineConfigurationChange/, 'the frozen engine substrate (VPIO-01 F-V2)'],
  ];
  it('no forbidden symbol appears in kernel or harness source', () => {
    const offenders: string[] = [];
    for (const [f, body] of bodies) {
      for (const [re, what] of forbidden) if (re.test(body)) offenders.push(`${rel(f)} :: ${what}`);
    }
    expect(offenders).toEqual([]);
  });
  it('the package has no dependencies and the harness is not a member of ios/App; the VPIO subject carries its own bundle id', () => {
    const pkg = stripComments(readFileSync(join(PKG, 'Package.swift'), 'utf8'));
    expect(pkg).toMatch(/dependencies: \[\]/);
    expect(pkg).toMatch(/\.linkedFramework\("AudioToolbox"\)/);
    expect(pkg).not.toMatch(/\.package\(/);
    // YAML comments are prose; the gate reads the spec, not the explanation.
    const yml = readFileSync(join(HARNESS, 'project.yml'), 'utf8').replace(/^\s*#.*$/gm, '');
    expect(yml).not.toMatch(/Pods|Podfile|ios\/App\b|capacitor/i);
    // frozen exactly by the founder (VPIO-01 plan §8 item 3 / census §6): a distinct custody identity, never the K00 id.
    expect(yml).toMatch(/PRODUCT_BUNDLE_IDENTIFIER: life\.soullab\.voicekernel\.vpio01$/m);
    expect(yml).not.toMatch(/life\.soullab\.voicekernel\.k00\b/);
  });
});

describe('KERNEL-00 · VOICE-10 — output has identity and a cancellable lifetime', () => {
  it('the substrate schedules only under an OutputStreamID and exposes cancel(id)', () => {
    const f = swift.find((p) => p.endsWith('AudioGraph.swift'))!;
    const body = bodies.get(f)!;
    expect(body).toMatch(/func schedule\(_ buffer: PCMBuffer, as id: OutputStreamID\)/);
    expect(body).toMatch(/func cancel\(_ id: OutputStreamID\)/);
    // No bare play path that bypasses identity; one stream at a time is the render callback's contract.
    expect(body).not.toMatch(/func play\(/);
    expect(body).toMatch(/func makeTone\([^)]*\) -> PCMBuffer\?/);
  });
  it('the kernel journals every cancel and measures cancel → silence at the render seam (P5)', () => {
    const f = swift.find((p) => p.endsWith('VoiceKernel.swift'))!;
    const body = bodies.get(f)!;
    expect(body).toMatch(/"stream_cancelled"/);
    expect(body).toMatch(/"stream_cancel_measured"/);
    expect(body).toMatch(/cancelToSilenceMs/);
    // The retired metric — a function call's duration — may not come back.
    expect(body).not.toMatch(/cancelLatencyMs/);
    const g = bodies.get(swift.find((p) => p.endsWith('AudioGraph.swift'))!)!;
    // VPIO: the render seam IS the render callback; the last non-silent frame is measured where it is rendered.
    expect(g).toMatch(/func render\(/);
    expect(g).toMatch(/func lastNonSilentRenderedAtMs\(\)/);
    expect(g).toMatch(/func setSyntheticStall\(_ on: Bool\)/);
    expect(g).toMatch(/func renderStats\(\)/);
  });
});

describe('KERNEL-00 · VOICE-06 / -15 / -16 — one recovery owner, bounded, journalled', () => {
  it('only HealthSupervisor verdicts reach requestRecovery, and the schedule is the ratified one', () => {
    const k = bodies.get(swift.find((p) => p.endsWith('VoiceKernel.swift'))!)!;
    const calls = k.match(/(?<!func )requestRecovery\(faultClass:/g) ?? [];
    // evaluate() has three verdict arms + the rebuild-failed path + (PRE-WITNESS-03 B, founder-authorized; VPIO-01
    // plan §11 item 4: now sourced from the authority's route_changed observation) the configuration-change path.
    expect(calls.length).toBeLessThanOrEqual(5);
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

describe('KERNEL-00 · PRE-WITNESS-01 — causal, longitudinal, replayable record', () => {
  it('every journal record carries seq and an optional causeSeq (P8)', () => {
    const j = bodies.get(swift.find((p) => p.endsWith('Journal.swift'))!)!;
    expect(j).toMatch(/public var seq: Int/);
    expect(j).toMatch(/public var causeSeq: Int\?/);
    const r = bodies.get(swift.find((p) => p.endsWith('Replay.swift'))!)!;
    expect(r).toMatch(/brokenCausality/);
  });
  it('physiology is sampled longitudinally and the app lifecycle is journalled (P4, P7b)', () => {
    const k = bodies.get(swift.find((p) => p.endsWith('VoiceKernel.swift'))!)!;
    expect(k).toMatch(/"input_health_sample"/);
    expect(k).toMatch(/"output_render_sample"/);
    expect(k).toMatch(/"app_lifecycle"/);
  });
});

describe('KERNEL-00 · PRE-WITNESS-02 — the entry seam is a precondition, not exception handling', () => {
  // K00-W1: on the engine subject `installTap` was reached with a 0 Hz input format. The repair is a
  // Swift-level validity check that makes the invalid call unreachable. On the VPIO subject the same
  // precondition guards the arming of every callback and the property listener (plan §2 / census §4).
  it('a `try …requireValid()` lexically precedes every callback/listener arming in start() (§3.1)', () => {
    const f = swift.find((p) => p.endsWith('AudioGraph.swift'))!;
    const body = bodies.get(f)!;
    const start = body.slice(body.indexOf('public func start(voiceProcessing'), body.indexOf('private static func check('));
    expect(start.length).toBeGreaterThan(0);
    const arms = [...start.matchAll(/kAudioOutputUnitProperty_SetInputCallback|kAudioUnitProperty_SetRenderCallback|AudioUnitAddPropertyListener\(/g)];
    expect(arms.length).toBe(3);
    for (const m of arms) {
      const before = start.slice(0, m.index!);
      const guardAt = before.lastIndexOf('.requireValid()');
      expect(guardAt).toBeGreaterThan(-1);
      // the guard is a `try` — a refused format leaves `start` before any callback exists
      const guardLine = before.slice(before.lastIndexOf('\n', guardAt) + 1, guardAt);
      expect(guardLine).toMatch(/\btry \w+$/);
    }
    // the hardware format is read from the unit (Input scope, element 1) BEFORE the guard, and the guard precedes initialize/start
    expect(start.indexOf('readHardwareInputFormat(u)')).toBeLessThan(start.indexOf('.requireValid()'));
    expect(start.indexOf('.requireValid()')).toBeLessThan(start.indexOf('AudioUnitInitialize(u)'));
    expect(start.indexOf('AudioUnitInitialize(u)')).toBeLessThan(start.indexOf('AudioOutputUnitStart(u)'));
    // the pure precondition itself: rate > 0 AND channels > 0
    expect(body).toMatch(/var isValid: Bool \{ sampleRate > 0 && channels > 0 \}/);
    expect(body).toMatch(/case invalidInputFormat\(sampleRate: Double, channels: Int\)/);
  });
  it('no NSException / ExceptionCatcher / objc_try construct exists anywhere in the package (§3.1)', () => {
    const offenders: string[] = [];
    for (const [f, body] of bodies) {
      if (/NSException|ExceptionCatcher|objc_try|@try\b|NS_DURING|objc_exception/.test(body)) offenders.push(rel(f));
    }
    // Objective-C bridging files would be the other way in; the package has none.
    const objc = files.filter((f) => /\.(m|mm|h)$/.test(f));
    expect(objc).toEqual([]);
    expect(offenders).toEqual([]);
  });
  it('a refused build and every format change journal the observed input format and generation age (§3.4)', () => {
    const k = bodies.get(swift.find((p) => p.endsWith('VoiceKernel.swift'))!)!;
    expect(k).toMatch(/"graph_start_refused"/);
    expect(k).toMatch(/inputSampleRate/);
    expect(k).toMatch(/inputChannels/);
    expect(k).toMatch(/generationAgeMs/);
    // the format-change observation carries the format at the instant the unit posted it, plus the format at start
    const fc = k.slice(k.indexOf('func handleFormatChanged'), k.indexOf('"io_format_changed"'));
    expect(fc).toMatch(/formatEvidence\(now\)/);
    expect(fc).toMatch(/inputFormatAtStart\(\)/);
    expect(fc).toMatch(/generationAgeMs/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ENGINE SUBJECT — FROZEN IN HISTORY. Every block below reads `24a6fcfa1` (P5-B0) from the git object database.
// These are the assertions the engine subject passed at MAC-COMPILE-07; they now prove the frozen subject is
// still the frozen subject, and never describe the working tree.
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

describe('KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1) · PRE-WITNESS-03 — the configuration-change seam is exit-guarded, bounded, never a direct rebuild', () => {
  const k = () => K('VoiceKernel.swift');
  const handler = () => {
    const body = k();
    const start = body.indexOf('func handleConfigurationChange');
    expect(start).toBeGreaterThan(-1);
    const next = body.indexOf('private func', start + 10);
    return body.slice(start, next === -1 ? undefined : next);
  };
  it('D: a configuration-change handler never directly invokes rebuildGraph, and the route_recovery cause is gone', () => {
    expect(handler()).not.toMatch(/rebuildGraph\(/);
    expect(k()).not.toMatch(/rebuildGraph\(cause: "route_recovery"/);
  });
  it('B: a configuration change reaches the graph only through the existing RecoveryPolicy as its own fault class', () => {
    expect(handler()).toMatch(/requestRecovery\(faultClass: "configuration_change"/);
    expect(handler()).toMatch(/"recovery_requested", cause: "configuration_change"/);
    const r = K('RecoveryPolicy.swift');
    expect(r).toMatch(/budgetPerWindow: Int = 3/);
    expect(r).not.toMatch(/configuration_change/);
  });
  it('A: a notification after exit is journalled and dropped before any generation or graph exists', () => {
    const h = handler();
    const guardAt = h.indexOf('guard inConversation else');
    expect(guardAt).toBeGreaterThan(-1);
    expect(h.slice(guardAt, guardAt + 400)).toMatch(/"stale_callback_dropped", cause: "not_in_conversation"/);
    expect(guardAt).toBeLessThan(h.indexOf('"engine_configuration_changed"'));
    expect(guardAt).toBeLessThan(h.indexOf('requestRecovery('));
  });
  it('C: voice processing is a journalled, pre-Enter-only kernel command; the harness only projects it (ACTIVE — unchanged files)', () => {
    // These files are byte-pinned to 24a6fcfa1 below, so the working-tree read and the history read are the same bytes.
    const body = bodies.get(swift.find((p) => p.endsWith('VoiceKernel.swift'))!)!;
    const fn = body.slice(body.indexOf('func setVoiceProcessing'), body.indexOf('func setMicEnabled'));
    expect(fn).toMatch(/guard !inConversation else/);
    expect(fn).toMatch(/"command_refused"/);
    expect(fn).toMatch(/"voice_processing_set"/);
    expect(fn).toMatch(/snap\.voiceProcessingEnabled = on/);
    const view = bodies.get(swift.find((p) => p.endsWith('HarnessView.swift'))!)!;
    expect(view).toMatch(/s\.voiceProcessingEnabled \?/);
    expect(view).toMatch(/toggleVoiceProcessing\(\)[\s\S]{0,120}\.disabled\(s\.floor != \.idle\)/);
    expect(view).not.toMatch(/@State private var voiceProcessing/);
    const model = bodies.get(swift.find((p) => p.endsWith('HarnessModel.swift'))!)!;
    expect(model).toMatch(/kernel\.setVoiceProcessing\(!snapshot\.voiceProcessingEnabled\)/);
  });
});

describe('KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1) · PRE-WITNESS-04 — the expected VP change is classified one-shot, deferred, and decided by the supervisor', () => {
  const k = () => K('VoiceKernel.swift');
  const handler = () => {
    const body = k();
    const start = body.indexOf('func handleConfigurationChange');
    const next = body.indexOf('private func', start + 10);
    return body.slice(start, next === -1 ? undefined : next);
  };
  it('C: classification is a pure, generation-scoped, one-shot function over ports (data source is evidence, not identity)', () => {
    const c = K('ConfigurationChange.swift');
    expect(c).toMatch(/case voiceProcessingReconfiguration = "voice_processing_reconfiguration"/);
    expect(c).toMatch(/i\.voiceProcessing, i\.expectationPending, i\.ordinalInGeneration == 1, !i\.suspended/);
    expect(c).toMatch(/a\.output == b\.output && a\.input == b\.input/);
    expect(c).not.toMatch(/inputDataSource ==/);
    expect(c).not.toMatch(/Task\.sleep|DispatchQueue|Timer|Ms\b.*=\s*\d/);
  });
  it('B: the deferred branch consumes the expectation and touches neither the graph nor the recovery policy', () => {
    const h = handler();
    const deferred = h.slice(h.indexOf('case .voiceProcessingReconfiguration:'), h.indexOf('case .routeConfigurationChange:'));
    expect(deferred.length).toBeGreaterThan(0);
    expect(deferred).toMatch(/vpExpectationPending = false/);
    expect(deferred).toMatch(/"configuration_change_deferred", cause: cls\.rawValue, causeSeq: obs/);
    expect(deferred).not.toMatch(/rebuildGraph\(|requestRecovery\(|startGraph\(|Task \{|sleep/);
    const other = h.slice(h.indexOf('case .routeConfigurationChange:'));
    expect(other).toMatch(/requestRecovery\(faultClass: "configuration_change"/);
  });
  it('the expectation is armed only at a graph start and retired when the generation is healthy', () => {
    const body = k();
    expect(body).toMatch(/vpExpectationPending = snap\.voiceProcessingEnabled/);
    expect(body).toMatch(/"vp_expectation_retired", cause: "generation_healthy"/);
    expect((body.match(/vpExpectationPending = true/g) ?? []).length).toBe(0);
  });
  it('no new fault class, budget, timer or threshold: the caller set is closed and Replay names the deferral as an automatic act', () => {
    const classes = [...k().matchAll(/requestRecovery\(faultClass: "([a-z_]+)"/g)].map((m) => m[1]).sort();
    expect(classes).toEqual(['configuration_change', 'entry_timeout', 'graph_rebuild_failed', 'input_dead', 'output_stalled']);
    const r = K('RecoveryPolicy.swift');
    expect(r).toMatch(/budgetPerWindow: Int = 3/); expect(r).toMatch(/windowMs: Int64 = 60_000/);
    expect(r).toMatch(/backoffMs: \[Int64\] = \[500, 1_000, 2_000\]/);
    const h = K('HealthSupervisor.swift');
    expect(h).toMatch(/entryWindowMs: Int64 = 1_500/); expect(h).toMatch(/deadInputMs: Int64 = 2_000/);
    expect(K('Replay.swift')).toMatch(/"configuration_change_deferred"/);
  });
  it('§2.3: the observation and the samples carry the provenance that proves why C fired', () => {
    const body = k();
    for (const f of ['"classification"', 'vpReconfigurationExpected', 'configurationChangeOrdinalInGeneration', '"routeAtStart"', '"routeNow"', 'callbacksSinceChange', 'vpExpectationConsumed']) {
      expect(body).toContain(f);
    }
    const sample = body.slice(body.indexOf('"input_health_sample"'), body.indexOf('"output_render_sample"'));
    expect(sample).toMatch(/"engineRunning"/); expect(sample).toMatch(/"callbacksSinceChange"/);
  });
});

describe('KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1 / 4596b9bdb) · PRE-WITNESS-05 Phase A — instrumentation only: mutating startup order unchanged, added calls read-only, no new timer', () => {
  const graph = () => K('AudioGraph.swift');
  const startBody = () => {
    const g = graph();
    const a = g.indexOf('public func start(voiceProcessing');
    const b = g.indexOf('public func stop()');
    expect(a).toBeGreaterThan(-1); expect(b).toBeGreaterThan(a);
    return g.slice(a, b);
  };
  it('the MUTATING startup call order is unchanged from 35b0f61d0', () => {
    const body = startBody();
    const order = [
      /setVoiceProcessingEnabled\(/, /engine\.attach\(/, /engine\.connect\(/, /\.requireValid\(\)/,
      /input\.installTap\(/, /player\.installTap\(/, /addObserver\(/, /engine\.prepare\(\)/, /engine\.start\(\)/,
    ];
    let last = -1;
    for (const re of order) {
      const m = re.exec(body);
      expect(m).not.toBeNull();
      expect(m!.index).toBeGreaterThan(last);
      last = m!.index;
    }
    for (const re of [/setVoiceProcessingEnabled\(/g, /engine\.prepare\(\)/g, /engine\.start\(\)/g, /input\.installTap\(/g, /player\.installTap\(/g]) {
      expect((body.match(re) ?? []).length).toBe(1);
    }
  });
  it('ADDED calls are observation/read-only or journal instrumentation only; NO new timer · mutation · recovery act · configuration act', () => {
    const body = startBody();
    expect(body).not.toMatch(/Task\.sleep|Timer|DispatchQueue|usleep|sleep\(/);
    expect(body).not.toMatch(/AVAudioSession|setActive|setCategory|setPreferred|overrideOutput/);
    expect(body).not.toMatch(/engine\.stop\(|engine\.reset\(|disconnect|detach\(|removeTap|requestRecovery|rebuildGraph/);
    expect(body).toMatch(/String\(input\.isVoiceProcessingEnabled\)/);
    expect(body).toMatch(/trace\(\.isRunningImmediate, \["engineRunning": String\(engine\.isRunning\)\]\)/);
    const steps = [...graph().matchAll(/case \w+ = "([a-z_]+)"/g)].map((m) => m[1]);
    expect(steps.length).toBe(13);
    for (const st of steps) {
      const c = st.replace(/_([a-z])/g, (_, ch) => ch.toUpperCase()).replace('Vp', 'VP');
      expect(body).toContain(`trace(.${c}`);
    }
  });
  it('the kernel observes isRunning on the EXISTING tick only (no new timer) and journals the first callback per generation', () => {
    const k = K('VoiceKernel.swift');
    const tick = k.slice(k.indexOf('private func tick()'), k.indexOf('private func evaluate()') === -1 ? undefined : k.indexOf('private func evaluate()'));
    expect(tick).toMatch(/"engine_running_observed"/);
    expect(tick).toMatch(/msSinceStartReturn/);
    expect(tick).toMatch(/if ms >= 1_000 \{ runningObservationDone = true \}/);
    expect((k.match(/"engine_running_observed"/g) ?? []).length).toBe(1);
    expect((k.match(/Task\.sleep\(/g) ?? []).length).toBe(3);
    expect(k).toMatch(/"first_input_callback"/);
    expect(k).toMatch(/"graph_start_trace"/);
    const classes = [...k.matchAll(/requestRecovery\(faultClass: "([a-z_]+)"/g)].map((m) => m[1]).sort();
    expect(classes).toEqual(['configuration_change', 'entry_timeout', 'graph_rebuild_failed', 'input_dead', 'output_stalled']);
  });
  it('the Phase-A subject 4596b9bdb (reproduced as R1) carries the 14-step trace WITH input_format_before_vp — the shape the ledger reads', () => {
    const g = histBody(PHASE_A, `${KSRC}/AudioGraph.swift`);
    const steps = [...g.matchAll(/case \w+ = "([a-z_]+)"/g)].map((m) => m[1]);
    expect(steps.length).toBe(14);
    expect(steps).toContain('input_format_before_vp');
    expect(steps.indexOf('input_format_before_vp')).toBeLessThan(steps.indexOf('vp_enable_begin'));
  });
});

describe('KERNEL-00 · ENGINE SUBJECT (history 24a6fcfa1) · PRE-WITNESS-05 P5-B0 — removal control: the pre-VP input-format read is gone and NOTHING else moved', () => {
  const graph = () => K('AudioGraph.swift');
  const startBody = () => {
    const g = graph();
    return g.slice(g.indexOf('public func start(voiceProcessing'), g.indexOf('public func stop()'));
  };
  it('no input-format read of any kind precedes setVoiceProcessingEnabled inside start()', () => {
    const body = startBody();
    const vp = body.indexOf('setVoiceProcessingEnabled(');
    expect(vp).toBeGreaterThan(-1);
    const before = body.slice(0, vp);
    expect(before).not.toMatch(/outputFormat\(|inputFormat\(|\.format\b|sampleRate|channelCount/);
    expect(before).not.toMatch(/inputFormatBeforeVP|input_format_before_vp/);
  });
  it('exactly ONE input.outputFormat(forBus: 0) read remains in start(), after VP enable and before requireValid (the 35b0f61d0 position)', () => {
    const body = startBody();
    const reads = [...body.matchAll(/input\.outputFormat\(forBus: 0\)/g)].map((m) => m.index!);
    expect(reads.length).toBe(1);
    expect(reads[0]).toBeGreaterThan(body.indexOf('setVoiceProcessingEnabled('));
    expect(reads[0]).toBeLessThan(body.indexOf('.requireValid()'));
    expect(body).toMatch(/trace\(\.inputFormatAfterVP/);
  });
  it('the seam input_format_before_vp does not exist in any non-test kernel or harness source of the subject', () => {
    for (const p of histList(P5B0, ['ios/VoiceKernel/Sources', 'ios/VoiceKernelHarness/Harness']).filter((p) => p.endsWith('.swift'))) {
      expect(histBody(P5B0, p)).not.toMatch(/input_format_before_vp|inputFormatBeforeVP/);
    }
  });
  it('all other Phase-A reads are KEPT: VP read-back, isRunning immediate, elapsed-ms timing, after-VP format', () => {
    const body = startBody();
    expect(body).toMatch(/String\(input\.isVoiceProcessingEnabled\)/);
    expect(body).toMatch(/trace\(\.isRunningImmediate, \["engineRunning": String\(engine\.isRunning\)\]\)/);
    expect(body).toMatch(/"elapsedMs": String\(clock\(\) - vpT\)/);
    expect(body).toMatch(/trace\(\.inputFormatAfterVP, \["sampleRate": String\(inFormat\.sampleRate\)/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// VPIO SUBJECT — ACTIVE (working tree). Founder ruling 2026-09-14: bounded implementation exactly against
// VPIO-01 plan §11 / VPIO-01A census §4–§5. IMPLEMENTED, NOT COMPILED: MAC-COMPILE is a separate founder act.
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

describe('KERNEL-00 · VPIO-01 — the substrate is the one file\'s interior; the invariant substrate is byte-identical', () => {
  const UNTOUCHABLE = [
    `${KSRC}/AudioSessionAuthority.swift`, `${KSRC}/HealthSupervisor.swift`, `${KSRC}/RecoveryPolicy.swift`,
    `${KSRC}/KernelState.swift`, `${KSRC}/StateProjection.swift`, `${KSRC}/Journal.swift`, `${KSRC}/Replay.swift`,
    'ios/VoiceKernelHarness/Harness/HarnessModel.swift', 'ios/VoiceKernelHarness/Harness/HarnessView.swift',
    'ios/VoiceKernelHarness/Harness/VoiceKernelHarnessApp.swift', 'ios/VoiceKernelHarness/Harness/Info.plist',
  ];
  const graph = () => bodies.get(swift.find((p) => p.endsWith('AudioGraph.swift'))!)!;
  const kernel = () => bodies.get(swift.find((p) => p.endsWith('VoiceKernel.swift'))!)!;
  it('authority · supervisor · policy · state · projection · journal · replay · harness are byte-identical to 24a6fcfa1 (plan §1)', () => {
    const moved: string[] = [];
    for (const p of UNTOUCHABLE) {
      if (!histRaw(P5B0, p).equals(readFileSync(join(process.cwd(), p)))) moved.push(p);
    }
    expect(moved).toEqual([]);
  });
  it('the substitution is confined: ConfigurationChange.swift is gone, RouteComparison.swift is pure, and only AudioGraph.swift links Audio Toolbox', () => {
    expect(existsSync(join(PKG, 'Sources', 'VoiceKernel', 'ConfigurationChange.swift'))).toBe(false);
    const rc = bodies.get(swift.find((p) => p.endsWith('RouteComparison.swift'))!)!;
    expect(rc).toMatch(/public static func samePorts\(_ a: RouteState\?, _ b: RouteState\?\) -> Bool/);
    expect(rc).toMatch(/guard let a = a, let b = b else \{ return false \}/);
    expect(rc).toMatch(/return a\.output == b\.output && a\.input == b\.input/);
    expect(rc).not.toMatch(/import (?!Foundation\b)|AVAudio|AudioToolbox|Task|Timer|DispatchQueue|requestRecovery|rebuildGraph|inputDataSource/);
    for (const [f, body] of bodies) {
      const imports = (body.match(/^import \w+/gm) ?? []).map((s) => s.replace('import ', ''));
      if (f.endsWith('AudioGraph.swift')) {
        // C-V1 (founder ruling 2026-09-14): the Swift overlay for UnsafeMutableAudioBufferListPointer lives in CoreAudio.
        expect(imports.sort()).toEqual(['AudioToolbox', 'CoreAudio', 'Foundation']);
      } else {
        expect(imports).not.toContain('AudioToolbox');
        expect(imports).not.toContain('CoreAudio');
        if (f.endsWith('VoiceKernel.swift')) expect(imports).not.toContain('AVFoundation');
      }
    }
  });
  it('the substrate drives the Voice-Processing I/O unit: VPIO subtype, both I/O elements enabled, VP = bypass property, format read from (Input scope, el 1) before arming, client formats on (Output,1)/(Input,0), pull input + render callback + property listener, initialize before start', () => {
    const g = graph();
    const start = g.slice(g.indexOf('public func start(voiceProcessing'), g.indexOf('private static func check('));
    const order = [
      /kAudioUnitSubType_VoiceProcessingIO/, /kAudioOutputUnitProperty_EnableIO, kAudioUnitScope_Input, 1,/, /kAudioOutputUnitProperty_EnableIO, kAudioUnitScope_Output, 0,/,
      /kAUVoiceIOProperty_BypassVoiceProcessing/, /readHardwareInputFormat\(u\)/, /\.requireValid\(\)/,
      /kAudioUnitProperty_StreamFormat, kAudioUnitScope_Output, 1,/, /kAudioUnitProperty_StreamFormat, kAudioUnitScope_Input, 0,/,
      /kAudioOutputUnitProperty_SetInputCallback, kAudioUnitScope_Global, 1,/, /kAudioUnitProperty_SetRenderCallback, kAudioUnitScope_Input, 0,/,
      /AudioUnitAddPropertyListener\(u, kAudioUnitProperty_StreamFormat, vpioFormatListener,/,
      /AudioUnitInitialize\(u\)/, /AudioOutputUnitStart\(u\)/,
    ];
    let last = -1;
    for (const re of order) {
      const m = re.exec(start);
      expect(m).not.toBeNull();
      expect(m!.index).toBeGreaterThan(last);
      last = m!.index;
    }
    for (const re of [/AudioUnitInitialize\(u\)/g, /AudioOutputUnitStart\(u\)/g, /AudioUnitAddPropertyListener\(/g]) expect((start.match(re) ?? []).length).toBe(1);
    // the hardware read is the documented property on the input element's input scope
    expect(g).toMatch(/kAudioUnitProperty_StreamFormat, kAudioUnitScope_Input, 1, &asbd, &size\)/);
    // input is pulled by AudioUnitRender into an app-owned buffer; output is filled from the one scheduled stream
    expect(g).toMatch(/AudioUnitRender\(u, flags, ts, bus, frames, &abl\)/);
    expect(g).toMatch(/func pullInput\(/); expect(g).toMatch(/func render\(/); expect(g).toMatch(/func formatPropertyChanged\(/);
    // ioRunning = the unit's running property, read only (evidence, never health)
    expect(g).toMatch(/AudioUnitGetProperty\(u, kAudioOutputUnitProperty_IsRunning, kAudioUnitScope_Global, 0, &running, &size\)/);
    expect(g).not.toMatch(/AudioUnitSetProperty\([^\n]*kAudioOutputUnitProperty_IsRunning/);
    // teardown releases the unit in the documented order and removes the listener
    const stop = g.slice(g.indexOf('public func stop()'), g.indexOf('fileprivate func pullInput'));
    for (const s of ['AudioUnitRemovePropertyListenerWithUserData', 'AudioOutputUnitStop(u)', 'AudioUnitUninitialize(u)', 'AudioComponentInstanceDispose(u)']) expect(stop).toContain(s);
    expect(stop.indexOf('AudioOutputUnitStop(u)')).toBeLessThan(stop.indexOf('AudioUnitUninitialize(u)'));
    expect(stop.indexOf('AudioUnitUninitialize(u)')).toBeLessThan(stop.indexOf('AudioComponentInstanceDispose(u)'));
    // no timer · sleep · session act · recovery knowledge anywhere in the substrate (F-V5: no realtime mutation of policy)
    expect(g).not.toMatch(/Task\.sleep|Timer\b|DispatchQueue|usleep|sleep\(|requestRecovery|rebuildGraph|RecoveryPolicy|HealthSupervisor/);
  });
  it('G9 (founder header adjudication 2026-09-14): the input buffer is sized by the unit\'s MaximumFramesPerSlice, read after the formats and before any callback is armed; a larger request is refused, never truncated; no fixed capacity anywhere', () => {
    const g = graph();
    const start = g.slice(g.indexOf('public func start(voiceProcessing'), g.indexOf('private static func check('));
    const read = start.indexOf('AudioUnitGetProperty(u, kAudioUnitProperty_MaximumFramesPerSlice, kAudioUnitScope_Global, 0, &maxFrames, &maxSize)');
    expect(read).toBeGreaterThan(-1);
    expect(read).toBeGreaterThan(start.lastIndexOf('step: "formats_set"'));                       // after the formats are established
    expect(read).toBeLessThan(start.indexOf('kAudioOutputUnitProperty_SetInputCallback'));        // before any callback is armed
    expect(read).toBeLessThan(start.indexOf('AudioUnitAddPropertyListener('));
    const between = start.slice(read, start.indexOf('kAudioOutputUnitProperty_SetInputCallback'));
    expect(between).toMatch(/try Self\.check\(maxStatus, step: "max_frames_read"\)/);              // unreadable → refusal
    expect(between).toMatch(/guard maxFrames > 0 else \{ throw AudioGraphError\.invalidMaximumFramesPerSlice\(frames: maxFrames\) \}/);
    expect(between).toMatch(/inputScratch = \[Float\]\(repeating: 0, count: Int\(maxFrames\)\)/);   // exactly that capacity
    expect(start).toMatch(/"maximumFramesPerSlice": String\(maxFrames\)/);                          // recorded as startup evidence
    expect(g).toMatch(/case invalidMaximumFramesPerSlice\(frames: UInt32\)/);
    // no fixed capacity, no truncating min(...) anywhere in the substrate
    expect(g).not.toMatch(/8_192|8192|min\(frames|min\(UInt32\(inputScratch|inputScratch\.count\)\)\)/);
    expect(g).toMatch(/private var inputScratch: \[Float\] = \[\]/);
    // the realtime pull renders exactly the requested frames or refuses with the SDK's parameter error
    const pull = g.slice(g.indexOf('fileprivate func pullInput('), g.indexOf('fileprivate func render('));
    expect(pull).toMatch(/guard Int\(frames\) <= inputScratch\.count else \{ return kAudio_ParamError \}/);
    expect(pull.indexOf('kAudio_ParamError')).toBeLessThan(pull.indexOf('AudioUnitRender('));
    expect(pull).toMatch(/AudioUnitRender\(u, flags, ts, bus, frames, &abl\)/);
    // trace vocabulary unchanged: still the eleven seams, no new step for the read
    expect([...g.matchAll(/case \w+ = "([a-z_]+)"/g)].length).toBe(11);
  });
  it('the start trace names exactly the eleven VPIO seams, in order, and every step is emitted', () => {
    const g = graph();
    const steps = [...g.matchAll(/case \w+ = "([a-z_]+)"/g)].map((m) => m[1]);
    expect(steps).toEqual(['unit_created', 'io_enabled', 'vp_properties_set', 'input_format_read', 'formats_set', 'callbacks_armed',
                           'initialize_begin', 'initialize_return', 'start_begin', 'start_return', 'is_running_immediate']);
    const start = g.slice(g.indexOf('public func start(voiceProcessing'), g.indexOf('private static func check('));
    for (const st of steps) {
      const c = st.replace(/_([a-z])/g, (_, ch) => ch.toUpperCase()).replace('Vp', 'VP').replace('Io', 'IO');
      expect(start).toContain(`trace(.${c}`);
    }
    expect(start).toMatch(/trace\(\.isRunningImmediate, \["ioRunning": String\(isRunning\)\]\)/);
    // the engine seams may not survive under new names
    expect(g).not.toMatch(/vp_enable_begin|vp_enable_return|engine_created|prepare_begin|input_format_after_vp|input_format_before_vp/);
  });
  it('truthful vocabulary (census §3): ioRunning / io_running_observed / io_format_changed present; every engine-meaning record and field absent from the kernel', () => {
    const k = kernel();
    for (const s of ['"ioRunning"', '"io_running_observed"', '"io_format_changed"', '"graph_start_trace"', '"first_input_callback"', '"graph_started"', '"graph_start_refused"', '"route_observed"']) expect(k).toContain(s);
    expect(k).not.toMatch(/engineRunning|engine_running_observed|engine_configuration_changed|configuration_change_deferred|voice_processing_reconfiguration|vp_expectation_retired|vpExpectationPending|vpReconfigurationExpected|vpExpectationConsumed|ConfigurationChangeClassifier|callbacksSinceChange|configChangeOrdinal|configurationChangeOrdinalInGeneration|onConfigurationChange|handleConfigurationChange|AVAudioEngineConfigurationChange|"classification"/);
    expect(graph()).not.toMatch(/engineRunning|onConfigurationChange/);
    // io_running_observed on the EXISTING tick only, once, through 1000 ms; the ratified sleep count is unchanged
    const tick = k.slice(k.indexOf('private func tick()'), k.indexOf('private func evaluate()'));
    expect(tick).toMatch(/"io_running_observed", cause: "tick"/);
    expect(tick).toMatch(/if ms >= 1_000 \{ runningObservationDone = true \}/);
    expect((k.match(/"io_running_observed"/g) ?? []).length).toBe(1);
    expect((k.match(/Task\.sleep\(/g) ?? []).length).toBe(3);
    // graph_started carries the running read as evidence, never an expectation
    const started = k.slice(k.indexOf('var started = ['), k.indexOf('"graph_started"'));
    expect(started).toMatch(/"ioRunning": String\(ag\.isRunning\)/);
    expect(started).not.toMatch(/vpReconfigurationExpected|engineRunning/);
    // the physiology samples carry ioRunning
    const sample = k.slice(k.indexOf('"input_health_sample"'), k.indexOf('"output_render_sample"'));
    expect(sample).toMatch(/"ioRunning"/); expect(sample).not.toMatch(/engineRunning|callbacksSinceChange/);
    // Replay is untouched: the retired deferral stays in its automatic-act vocabulary for historical journals; the kernel never emits it
    expect(bodies.get(swift.find((p) => p.endsWith('Replay.swift'))!)!).toMatch(/"configuration_change_deferred"/);
  });
  it('io_format_changed is an observation, never an act: exit guard first, generation guard, no graph or policy call in the handler', () => {
    const k = kernel();
    const a = k.indexOf('private func handleFormatChanged(generation gen: Int, format now: InputFormatObservation)');
    expect(a).toBeGreaterThan(-1);
    const h = k.slice(a, k.indexOf('private func handleSession', a));
    const guardAt = h.indexOf('guard inConversation else');
    expect(guardAt).toBeGreaterThan(-1);
    expect(h.slice(guardAt, guardAt + 400)).toMatch(/"stale_callback_dropped", cause: "not_in_conversation"/);
    expect(h).toMatch(/guard gen == snap\.generation else/);
    expect(guardAt).toBeLessThan(h.indexOf('guard gen == snap.generation'));
    expect(h).toMatch(/journal\("VoiceIO", "io_format_changed", cause: "unit_property_listener", evidence: ev\)/);
    expect(h).not.toMatch(/rebuildGraph\(|requestRecovery\(|startGraph\(|Task \{|sleep|graph\?\.stop|substrateStarted =|routeAtStart =|vpExpectation/);
    // the seam is wired from the substrate's listener, generation-stamped
    expect(k).toMatch(/ag\.onFormatChanged = \{ \[weak self\] gen, fmt in Task \{ await self\?\.handleFormatChanged\(generation: gen, format: fmt\) \} \}/);
  });
  it('route recovery is sourced from the authority\'s route_changed observation, guarded for eligibility, same ports = evidence only, through the existing policy only (plan §11 item 4 / census §5)', () => {
    const k = kernel();
    const a = k.indexOf('case .routeChanged(_, let route):');
    expect(a).toBeGreaterThan(-1);
    const br = k.slice(a, k.indexOf('case .mediaServicesReset:', a));
    expect(br).toMatch(/let eligible = inConversation && !suspended && substrateStarted && routeAtStart != nil && snap\.floor != \.degraded/);
    expect(br).toMatch(/let portsChanged = !RouteComparison\.samePorts\(routeAtStart, route\)/);
    expect(br).toMatch(/if eligible && portsChanged \{/);
    expect(br).toMatch(/journal\("VoiceKernel", "recovery_requested", cause: "session_route_change", causeSeq: observationSeq, evidence: ev\)/);
    expect(br).toMatch(/requestRecovery\(faultClass: "configuration_change", causeSeq: req\)/);
    expect(br).toMatch(/"route_observed", cause: portsChanged \? "route_change_not_eligible" : "same_ports"/);
    expect(br).not.toMatch(/rebuildGraph\(|startGraph\(|graph\?\.stop|Task \{|sleep/);
    expect(k).not.toMatch(/rebuildGraph\(cause: "route_recovery"/);
    // the eligibility facts are set only by a successful start and cleared on every teardown
    expect(k).toMatch(/routeAtStart = snap\.route\n\s*substrateStarted = true/);
    expect((k.match(/substrateStarted = false; routeAtStart = nil/g) ?? []).length).toBeGreaterThanOrEqual(5);
    // the caller set is closed at the same five classes; the policy and the supervisor are byte-pinned above
    const classes = [...k.matchAll(/requestRecovery\(faultClass: "([a-z_]+)"/g)].map((m) => m[1]).sort();
    expect(classes).toEqual(['configuration_change', 'entry_timeout', 'graph_rebuild_failed', 'input_dead', 'output_stalled']);
    const r = bodies.get(swift.find((p) => p.endsWith('RecoveryPolicy.swift'))!)!;
    expect(r).not.toMatch(/configuration_change|session_route_change/);
  });
  it('the pure-logic tests follow the subject: RouteComparisonTests present, the classifier tests gone, the eleven-seam trace pinned', () => {
    const t = bodies.get(swift.find((p) => p.endsWith('PureLogicTests.swift'))!)!;
    expect(t).toMatch(/final class RouteComparisonTests: XCTestCase/);
    expect(t).not.toMatch(/ConfigurationChangeClassifier/);
    expect(t).toMatch(/func testTheTraceNamesExactlyTheElevenVPIOSeamsInOrder\(\)/);
  });
});

describe('KERNEL-00 · DRIVER-01 — automate the witness, not the organism', () => {
  const DRIVER = join(process.cwd(), 'ios', 'VoiceKernelDriver');
  // The same hash the working-tree pin used through MAC-COMPILE-07 … PHASE-A-REPRO-01, now computed from the
  // immutable commit: repo-relative path · NUL · bytes · NUL, sorted by path.
  const histTreeHash = (sha: string, paths: string[]) => {
    const h = createHash('sha256');
    for (const p of histList(sha, paths).sort()) { h.update(p); h.update('\0'); h.update(histRaw(sha, p)); h.update('\0'); }
    return h.digest('hex');
  };
  it('the engine subject 24a6fcfa1 (the app under test for stages A/B/C) is still byte-identical in history to the pinned tree hashes', () => {
    expect(histTreeHash(P5B0, ['ios/VoiceKernel/Sources', 'ios/VoiceKernel/Tests', 'ios/VoiceKernel/Package.swift'])).toBe('3f746769236d7ee68b38bafa7dfa278032063c833c24d88b9d1ad343fe1c16a2');
    expect(histTreeHash(P5B0, ['ios/VoiceKernelHarness/Harness', 'ios/VoiceKernelHarness/project.yml'])).toBe('3e718a09a23e6f5598e62162222310b3ee088ec6471f0e9656b9c16a9f00185c');
  });
  it('the driver is an external instrument: XCTest only, no VoiceKernel, no launch args/env on the app under test, no UserDefaults, no debugger hooks', () => {
    const t = stripComments(readFileSync(join(DRIVER, 'DriverUITests', 'K00DriverTests.swift'), 'utf8'));   // prose bans are not code (the C21 lesson)
    expect(t).toMatch(/^import XCTest$/m);
    expect(t).not.toMatch(/import VoiceKernel|VoiceKernel\.|AudioGraph|HealthSupervisor|RecoveryPolicy|AudioSessionAuthority|FlightRecorder/);
    expect(t).not.toMatch(/launchArguments|launchEnvironment|UserDefaults|dlopen|NSClassFromString/);
    expect(t).toMatch(/XCUIApplication\(bundleIdentifier: subject\.bundleID\)/);   // VPIO-01B: the bundle is the declared subject's, never a constant
    // the ENGINE subject's bundle id is still named — as the p5b0/phase-a row of the explicit subject table (VPIO-01B)
    expect(t).toMatch(/"life\.soullab\.voicekernel\.k00"/);
    // control vocabulary is the harness's VISIBLE labels only
    for (const l of ['Enter conversation', 'Leave', 'Export journal', 'Voice processing: ON (default)', 'Voice processing: OFF (control run)']) expect(t).toContain(`"${l}"`);
    // cold precondition asserted; driver failures are named, never audio classes
    expect(t).toMatch(/PRECONDITION-FAILED/);
    expect(t).toMatch(/DRIVER\/INFRASTRUCTURE FAILURE/);
    expect(t).toMatch(/state != \.notRunning/);
    const y = readFileSync(join(DRIVER, 'project.yml'), 'utf8');
    expect(y).not.toMatch(/packages:|VoiceKernel\b/);
    expect(y).toMatch(/type: bundle\.ui-testing/);
    expect(y).toMatch(/PRODUCT_BUNDLE_IDENTIFIER: life\.soullab\.voicekernel\.driverhost/);
  });
  it('the ledger classifier is closed to the four classes plus two non-audio rows, and never steers a batch', () => {
    const l = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-ledger.py'), 'utf8');
    for (const c of ["'gen-1 listen'", "'failure then recovery'", "'failure then degradation'", "'other observed shape'", "'DRIVER/INFRASTRUCTURE FAILURE'", "'SUBJECT-MISMATCH'"]) expect(l).toContain(c);
    expect(l).toMatch(/no enterConversation in journal/);            // a never-entered harness is a driver row
    expect(l).toMatch(/listeningHeldAtExport/); expect(l).toMatch(/listeningLostLater/); // C-D9 evidence fields (classes unchanged)
    expect(l).not.toMatch(/subprocess|os\.system|devicectl|xcodebuild/); // reads journals only
    const b = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-driver-batch.sh'), 'utf8');
    expect(b).toMatch(/harness_present\(\)/);                          // Mac-side cold check every sample
    expect(b).toMatch(/for i in \$\(seq 1 "\$N"\)/);                     // declared N is finished
    expect(b).toMatch(/test-without-building/);                       // one invocation per sample
    expect(b).not.toMatch(/install app/);                             // a batch never reinstalls; k00-reinstall.sh is the explicit boundary
    const r = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-reinstall.sh'), 'utf8');
    expect(r.indexOf('REFUSED')).toBeLessThan(r.indexOf('install app'));  // Stage-C custody gate: the UUID refusal is evaluated BEFORE the install verb
    expect(r).toMatch(/K00_EXPECT_UUID/);
    // PHASE-A-REPRO-01 R1 custody (founder ruling 2026-09-13): dylib SHA-256 and the per-file manifest are re-verified
    // BEFORE the install verb; any mismatch refuses (exit 3). The manifest check must also refuse an unlisted file.
    expect(r).toMatch(/K00_EXPECT_DYLIB_SHA/);
    expect(r).toMatch(/K00_EXPECT_MANIFEST/);
    expect(r).toMatch(/shasum -a 256 -c "\$EXPECT_MAN"/);
    expect(r).toMatch(/FILE-SET MISMATCH/);
    expect(r.indexOf('FILE-SET MISMATCH')).toBeLessThan(r.indexOf('install app'));
    // PASS-2 daemon witness (founder ruling 2026-09-14): the batch snapshots mediaserverd/coreaudiod rows before each sample and
    // after export, records UNOBSERVABLE rather than substituting a mechanism, and never signals/terminates/kills a daemon.
    expect(b).toMatch(/daemon_snapshot "\$i" before/); expect(b).toMatch(/daemon_snapshot "\$i" after/);
    expect(b).toMatch(/'mediaserverd','coreaudiod','audiomxd'/); expect(b).toMatch(/NOT PRESENT IN THE DOCUMENTED JSON WINDOW/); expect(b).toMatch(/PRESENT — witnessed by PID/); expect(b).toMatch(/UNOBSERVABLE/); expect(b).toMatch(/--json-output "\$js"/);  // ruled names always recorded (NOT PRESENT when absent); observed daemons by PID from the documented JSON
    const bExec = b.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
    expect(bExec).not.toMatch(/process (signal|terminate|suspend)|\bkill\b|sendMemoryWarning/);
    // PASS-2 unified-log instruments: discovery captures help pages only; calibration is fail-closed on the probe, issues
    // only `log collect` + `log show`, and never `log config` / sysdiagnose / a level change.
    const lp = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-log-probe.sh'), 'utf8');
    const lpExec = lp.split('\n').filter((l) => !/^\s*(#|echo\b|\{?\s*echo\b)/.test(l)).join('\n');   // prose in echo lines never reads as a capture (C21)
    expect(lpExec).not.toMatch(/\blog (collect|show|stream|config)\b(?! *--help)/);   // help pages only (`log help x`), no capture
    expect(lp).toMatch(/local f="\$1"; shift/);                                   // C-D11: the filename is shifted off before the command runs
    const lc = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-log-calibrate.sh'), 'utf8');
    const lcExec = lc.split('\n').filter((l) => !/^\s*#/.test(l) && !/^\s*say /.test(l)).join('\n');
    expect(lcExec).not.toMatch(/log config|sysdiagnose|lldb|devicectl device process/);   // `--mode L` is the driver's Mode L, not a logging mode
    expect(lc.indexOf('STOP — the installed log(1) does not document')).toBeLessThan(lc.indexOf('log collect "$DEVOPT"'));
    expect(lc).toMatch(/LOG-CAL 1 --mode L --subject phase-a/);                    // exactly one bounded sample, its own stratum
    expect(lc).toMatch(/OUT="\$ROOT\/unifiedlog-cal-\$STAMP"/);                       // C-D12: never a case-variant of the batch's LOG-CAL-<stamp>
    expect(lc).toMatch(/batch complete — /);                                          // ledger located from the batch's completion line, not a glob
    expect(lc.indexOf('did not yield an audio sample')).toBeLessThan(lc.indexOf('log collect "$DEVOPT"'));  // no collect without a real sample
    expect(lcExec).toMatch(/K00_LOG_SUDO/); expect((lcExec.match(/\bsudo\b/g) || []).length).toBeLessThanOrEqual(3); // root only on the collect, only by founder act
    expect(lcExec).not.toMatch(/sudo (xcrun|log show|log config|scripts)/);
    // AUTH-1/2/3 (founder ruling 2026-09-14): evidence is NAMED and mechanically verified; authority is a SEPARATE INPUT.
    expect(lcExec).not.toMatch(/ls -d[^\n]*log-probe[^\n]*tail -1/);                       // no 'newest probe' discovery of evidence
    expect(lc).toMatch(/--probe\) PROBE="\$2"/);                                              // explicit witness only
    expect(lc.indexOf('K00_EXEC_AUTHORITY unset')).toBeLessThan(lc.indexOf('k00-driver-batch.sh LOG-CAL'));  // authority required before any device act
    expect(lcExec).not.toMatch(/K00_EXEC_AUTHORITY[^\n]*(\b(grep|cat|git)\b|==|-f )/);            // authority is never read from or compared against the repo
    for (const k of ['seal == manifest', 'manifest hashes == files', 'criterion id == expected', 'criterion revision is ancestor of probe execution HEAD']) expect(lc).toContain(k);
    expect(lp).toMatch(/manifest\.json/); expect(lp).toMatch(/SEAL\.sha256/); expect(lp).toMatch(/merge-base --is-ancestor "\$CRITERION_REV" HEAD/);  // capture-time provenance, sealed in the same execution
    expect(lp).toMatch(/It authorizes nothing/);
    expect(lc.indexOf('root not granted')).toBeLessThan(lc.indexOf('k00-driver-batch.sh LOG-CAL'));   // no sample spent against a collect known to need root
    expect(lc).toMatch(/usage: log show \\\[options\\\] <archive>/);                    // condition 3 in the installed grammar (positional archive), founder ruling 2026-09-14
    expect(lcExec).not.toMatch(/log show --archive/);                                // the superseded spelling never runs
    expect(lcExec).toMatch(/log show --start "\$T0_LOCAL" --end "\$T1_LOCAL" --style json "\$OUT\/device\.logarchive"/); // options first, archive last, as documented
    expect(lcExec).not.toMatch(/log show[^\n]*--(info|debug)/);                          // read level stays default until ruled
    // C-D13 (2026-09-14): `log show --style json` emits ONE array then a trailer banner; the reader decodes one value and
    // records the residue verbatim, refusing anything but the documented banner. The calibrate script delegates to it.
    expect(lcExec).toMatch(/k00-log-window-read\.py "\$OUT\/window\.json"/);
    expect(lcExec).not.toMatch(/json\.load\(/);
    const wr = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-log-window-read.py'), 'utf8');
    expect(wr).toMatch(/JSONDecoder\(\)\.raw_decode\(s\)/);
    expect(wr).toMatch(/window-trailer\.txt/);
    expect(wr).toMatch(/residue is NOT the documented trailer banner/);
    const wrExec = wr.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');                // prose stripped (C21): the header names the tool it never runs
    expect(wrExec).not.toMatch(/subprocess|os\.system|xcrun|log collect|log show/);          // pure function on files: no device act, no log(1)
    expect(wr).toMatch(/NOT PRESENT IN THE \{LEVEL\} WINDOW/); expect(wr).toMatch(/'DEFAULT-LEVEL'/);   // absence scoped to the level actually read (A2, C-D15)
    const rr = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-log-window-reread.sh'), 'utf8');
    const rrExec = rr.split('\n').filter((l) => !/^\s*#/.test(l) && !/^\s*say /.test(l)).join('\n');
    expect(rrExec).not.toMatch(/sudo|xcrun|devicectl|\blog (collect|show|config)\b|sysdiagnose/);   // offline only
    expect(rrExec).toMatch(/--expect-sha "\$EXP"/);                                          // custody verified before reading
    expect(rrExec).not.toMatch(/>>? *"?\$CAL\/CALIBRATION\.md/);                            // a produced record is never edited
    expect(rr).toMatch(/REC="\$CAL\/WINDOW-READ-\$STAMP\.md"/);
    // C-D14 (2026-09-14): alignment anchors are exact framework lines from the sample's own pid, never a loose regex that can
    // match an XPC "activating connection" line from a stray harness pid; posted anchors pick the nearest candidate.
    const al = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00_log_align.py'), 'utf8');
    const alExec = al.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
    expect(alExec).not.toMatch(/subprocess|os\.system|xcrun|log collect|log show/);
    expect(al).toMatch(/Activated session 0x/); expect(al).toMatch(/start, was running/); expect(al).toMatch(/iounit configuration changed > posting notification/);
    expect(al).toMatch(/the last harness pid that activated an audio session/);
    expect(wrExec).toMatch(/from k00_log_align import align/);
    expect(wrExec).not.toMatch(/activ\|AVAudioSession\|audio/);                          // the loose anchor regex is gone
    expect(wrExec).toMatch(/--expect-archive/); expect(wr).toMatch(/named\.endswith\(want\)/);   // ruling step 4: the banner must name THIS calibration's archive
    expect(rrExec).toMatch(/--expect-archive "\$CAL\/device\.logarchive"/);
    // Founder ruling 2 (2026-09-14): ONE --info re-read of the EXISTING archive, same window, separate record; never --debug,
    // never a sample/collect/sudo/device act; authority supplied at invocation (AUTH-3); outputs never overwrite the default read.
    const wi = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-log-window-info.sh'), 'utf8');
    const wiExec = wi.split('\n').filter((l) => !/^\s*#/.test(l) && !/^\s*say /.test(l)).join('\n');
    expect(wiExec).toMatch(/log show --info --start "\$T0_LOCAL" --end "\$T1_LOCAL" --style json "\$ARCH"/);   // options first, archive last
    expect(wiExec).not.toMatch(/--debug|sudo|log collect|xcrun|devicectl|log config|sysdiagnose|k00-driver-batch/);
    expect(wiExec.indexOf('K00_EXEC_AUTHORITY unset')).toBeLessThan(wiExec.indexOf('log show --info'));   // executable order (the header prose names the command first — C21)
    expect(wiExec).not.toMatch(/K00_EXEC_AUTHORITY[^\n]*(\b(grep|cat|git)\b|==|-f )/);
    expect(wiExec).toMatch(/--suffix info/); expect(wiExec).toMatch(/W="\$CAL\/window-info\.json"/);
    expect(wiExec).not.toMatch(/> *"?\$CAL\/window\.json|window-audio\.jsonl/);                         // the default-level read is never overwritten
    expect(wr).toMatch(/--suffix/); expect(al).toMatch(/audiomxd entries in that interval/);
    // Founder ruling (2026-09-14): ONE --debug re-read, the LAST rung — --debug ALONE (never combined with --info), same archive/window,
    // separate DEBUG record; never a sample/collect/sudo/device act/log config/batch/control; authority at invocation.
    const wd = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-log-window-debug.sh'), 'utf8');
    const wdExec = wd.split('\n').filter((l) => !/^\s*#/.test(l) && !/^\s*say /.test(l)).join('\n');
    expect(wdExec).toMatch(/log show --debug --start "\$T0_LOCAL" --end "\$T1_LOCAL" --style json "\$ARCH"/);
    expect(wdExec).not.toMatch(/--info|sudo|log collect|xcrun|devicectl|log config|sysdiagnose|k00-driver-batch/);
    expect(wdExec.indexOf('K00_EXEC_AUTHORITY unset')).toBeLessThan(wdExec.indexOf('log show --debug'));
    expect(wdExec).not.toMatch(/K00_EXEC_AUTHORITY[^\n]*(\b(grep|cat|git)\b|==|-f )/);
    expect(wdExec).toMatch(/--suffix debug/); expect(wdExec).toMatch(/W="\$CAL\/window-debug\.json"/);
    expect(wdExec).not.toMatch(/> *"?\$CAL\/window\.json|window-audio\.jsonl|window-info/);                 // default and info reads never overwritten
    expect(wd).not.toMatch(/no --debug/);                                                   // C-D16: the debug record must not describe itself as 'no --debug'
    // PASS-2 SEAM EXPERIMENT (protocol PASS2_SEAM_EXPERIMENT_PROTOCOL_2026-09-14.md; design + witness implementation authorized, EXECUTION HELD):
    // N fixed at 30, blocks control|logged only, authority at invocation, ONE collect after the last sample, default-level show only,
    // named sealed probe (never newest-probe discovery), frozen fields F1–F6, classes from the kernel ledger.
    const lb = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-log-batch.sh'), 'utf8');
    const lbExec = lb.split('\n').filter((l) => !/^\s*#/.test(l) && !/^\s*say /.test(l)).join('\n');
    expect(lbExec).toMatch(/\[ "\$N" = 30 \] \|\| \{ echo "STOP/);
    expect(lbExec).toMatch(/\[ "\$BLOCK" = control \] \|\| \[ "\$BLOCK" = logged \] \|\|/);
    expect(lbExec.indexOf('K00_EXEC_AUTHORITY unset')).toBeLessThan(lbExec.indexOf('k00-driver-batch.sh'));
    expect(lbExec).not.toMatch(/K00_EXEC_AUTHORITY[^\n]*(\b(grep|cat|git)\b|==|-f )/);
    expect((lbExec.match(/\bsudo\b/g) || []).length).toBe(1); expect(lbExec).toMatch(/sudo log collect --device-udid/);
    expect(lbExec.indexOf('k00-driver-batch.sh')).toBeLessThan(lbExec.indexOf('sudo log collect'));            // collect AFTER the batch
    expect(lbExec).not.toMatch(/--info|--debug|log config|sysdiagnose|lldb|install app|k00-reinstall/);
    expect(lbExec).not.toMatch(/ls -d[^\n]*log-probe[^\n]*tail -1/); expect(lbExec).toMatch(/K00_LOG_PROBE must name the sealed probe/);
    expect(lbExec).toMatch(/log show --start "\$S0" --end "\$S1" --style json "\$UD\/device\.logarchive"/);
    expect(lbExec).toMatch(/k00-seam-ledger\.py/);
    const db = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-driver-batch.sh'), 'utf8');
    expect(db).toMatch(/sample-timing\.tsv/);
    const sl = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-seam-ledger.py'), 'utf8');
    const slExec = sl.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
    expect(slExec).not.toMatch(/subprocess|os\.system|xcrun|log collect|log show/);
    expect(al).toMatch(/SEAM_FIELDS = \('F1_aurio_start_ms', 'F2_iounit_post_ms', 'F3_iounit_post_vs_start_return_ms', 'F4_first_callback_vs_start_return_ms', 'F5_iounit_posts_in_seam', 'F6_order_signature'\)/);
    expect(sl).toMatch(/TAKE = 'gen-1 listen'/); expect(sl).toMatch(/classes from the kernel ledger, never from the log/);
    expect(readFileSync(join(process.cwd(), 'docs', 'programme', 'VOICE-2026', 'PASS2_SEAM_EXPERIMENT_PROTOCOL_2026-09-14.md'), 'utf8')).toMatch(/N = \*\*30 per block\*\*/);
    // Founder corrections (protocol §10): F5 on its FULL declared window (distinct from the at/after-start posts feeding F2/F3),
    // alignment refuses > 2 ms anchor disagreement, block-drift wording (never "observer effect" as a finding), missingness frozen.
    expect(al).toMatch(/ALIGN_TOLERANCE_MS = 2\b/); expect(al).toMatch(/BOUNDARY_TOLERANCE_MS = 1\b/);
    expect(al).toMatch(/UNREADABLE: synchronous anchors disagree/);
    expect(al).toMatch(/posts_in_seam = \[e for e in seam if is_post\(e\)\]/); expect(al).toMatch(/'F5_iounit_posts_in_seam': len\(posts_in_seam\)/);
    expect(al).toMatch(/posts_at_start = \[e for e in seam if is_post\(e\) and rel\(e\) >= -BOUNDARY_TOLERANCE_MS\]/);
    expect(sl).toMatch(/block-drift comparison/); expect(sl).toMatch(/no block difference detected/); expect(sl).toMatch(/missingness is frozen evidence/);
    expect(sl).not.toMatch(/observer\/drift/); expect(sl).toMatch(/pre-start_return evidence/);
    const a = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-container-archive.sh'), 'utf8');
    // archive mode only; deletion is a separate, later, founder-gated act. Scan executable lines only (comments and
    // echo/log prose stripped — the C21 lesson: a prose ban must never read as the banned behaviour returning).
    const exec = a.split('\n').filter((l) => !/^\s*(#|echo\b|log\b|\{?\s*echo\b)/.test(l)).join('\n');
    expect(exec).not.toMatch(/\brm\s|devicectl[^\n]*\b(delete|remove)\b/);
    expect(a).toMatch(/NOTHING DELETED/);
    const pg = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-container-purge.sh'), 'utf8');
    const pgExec = pg.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
    // founder ruling 2026-09-13: the only mechanism is the documented `copy to … --remove-existing-content true` from an
    // EMPTY source, admitted only behind the exact preimage gate; never `uninstall`, never another app-data location.
    expect(pgExec).not.toMatch(/uninstall/);
    expect(pgExec).not.toMatch(/devicectl[^\n]*\b(delete|rm)\b/);
    const copyTo = pgExec.indexOf('devicectl device copy to');
    expect(copyTo).toBeGreaterThan(0);
    expect(pgExec.indexOf('RECONCILED')).toBeLessThan(copyTo);          // D before F
    expect(pgExec.indexOf('devicectl-probe-')).toBeLessThan(copyTo);    // E before F
    expect(pgExec.indexOf('comm -3')).toBeLessThan(copyTo);             // exact-set preimage before F
    expect(pgExec.indexOf('DRY RUN COMPLETE')).toBeLessThan(copyTo);    // dry-run exits before F
    const mech = pgExec.split('\n').filter((l) => /--remove-existing-content/.test(l) && !/^\s*say\b|grep/.test(l));
    expect(mech).toHaveLength(1);                                        // exactly one mutation line
    expect(mech[0]).toMatch(/--source "\$EMPTY".*--destination tmp/);   // empty source, tmp only
    expect(pgExec).toMatch(/PURGE UNVERIFIED/);                          // H fails closed
    const pb = readFileSync(join(process.cwd(), 'scripts', 'witness', 'k00-phase-a-repro-build.sh'), 'utf8');
    const pbExec = pb.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
    expect(pbExec).not.toMatch(/install app/);                         // build only; k00-reinstall.sh is the only install path
    expect(pb).toMatch(/11A057AA-4A3C-3CAE-8C28-E29792489459/);        // the UUID gate is pinned
    expect(pb).toMatch(/SRC_SHA="4596b9bdb"/);                         // the source is pinned
    expect(pb).toMatch(/-derivedDataPath "\$DD"/);                     // fresh, dedicated DerivedData
    expect(pb).toMatch(/DD="\$WT-derived"/);                            // C-D10: DerivedData outside the worktree
    expect(pbExec).toMatch(/\[ -e "\$WT" \] && stop/);                   // C-D10: a pre-existing worktree is a STOP, never reused or cleaned
    expect(pbExec).toMatch(/mkdir "\$LOCK"/);                             // C-D10: concurrent run refused
    expect(pbExec.indexOf('MISMATCH')).toBeLessThan(pbExec.indexOf('xcodebuild -project'));  // pins before any build
  });
});

describe('KERNEL-00 · VPIO-01B — witness preparation: instrument-only subject plumbing; the organism does not move', () => {
  const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
  const execLines = (s: string) => s.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
  const VPIO = { bundle: 'life.soullab.voicekernel.vpio01', uuid: 'E8074AD1-D179-3267-A15C-142D033A9665',
                 dylib: '6efe33b1b25fdb4dc4376abfb248e6c530e59f492ebc876314619fd1bef64b3d',
                 exec: 'e43dec667e1e8ba727d7253f39199be3a34333c804c220b41233945d42a1a4ac',
                 manifest: '4710d9a68f5b6bb9de8ef64b143f8dd9b688476b3a7f3ee0257b3922b7a60bed' };
  it('the organism is frozen at the compile subject 85e5e7154: kernel + harness trees byte-identical (source, tests, Package.swift, project.yml, Harness/*)', () => {
    const paths = ['ios/VoiceKernel/Sources', 'ios/VoiceKernel/Tests', 'ios/VoiceKernel/Package.swift', 'ios/VoiceKernelHarness/Harness', 'ios/VoiceKernelHarness/project.yml'];
    const listed = histList('85e5e7154', paths).sort();
    const moved: string[] = [];
    for (const p of listed) if (!histRaw('85e5e7154', p).equals(readFileSync(join(process.cwd(), p)))) moved.push(p);
    expect(moved).toEqual([]);
    // and the working tree adds no source file under those roots
    const live = files.map(rel).filter((p) => paths.some((x) => p === x || p.startsWith(x + '/'))).sort();
    expect(live).toEqual(listed.filter((p) => /\.(swift|yml|plist)$/.test(p)));
  });
  it('the explicit subject table is the same in the ledger, the driver and the batch: p5b0/phase-a → .k00 · "VoiceKernel K00" · engineRunning; vpio-01 → .vpio01 · "VoiceKernel VPIO-01" · ioRunning; no default bundle, no fall-through', () => {
    const l = W('scripts/witness/k00-ledger.py');
    expect(l).toContain("VPIO01_STEPS = ['unit_created', 'io_enabled', 'vp_properties_set', 'input_format_read', 'formats_set', 'callbacks_armed',\n                'initialize_begin', 'initialize_return', 'start_begin', 'start_return', 'is_running_immediate']");
    expect(l).toMatch(/'vpio-01': \{'bundle': 'life\.soullab\.voicekernel\.vpio01', 'label': 'VoiceKernel VPIO-01', 'running': 'ioRunning',\s+'refusal_terminal': None\}/);
    expect(l).toMatch(/'p5b0':\s+\{'bundle': 'life\.soullab\.voicekernel\.k00',\s+'label': 'VoiceKernel K00',\s+'running': 'engineRunning', 'refusal_terminal': 'input_format_after_vp'\}/);
    expect(l).toMatch(/'phase-a': \{'bundle': 'life\.soullab\.voicekernel\.k00',\s+'label': 'VoiceKernel K00',\s+'running': 'engineRunning', 'refusal_terminal': 'input_format_after_vp'\}/);
    // the historical step lists are byte-for-byte the same lists
    expect(l).toContain("P5B0_STEPS = ['engine_created', 'vp_enable_begin', 'vp_enable_return', 'output_connected', 'input_format_after_vp',");
    expect(l).toContain("PHASE_A_STEPS = P5B0_STEPS[:1] + ['input_format_before_vp'] + P5B0_STEPS[1:]");
    // four classes, no fifth; the running key is read from the subject table, never hard-coded in classify()
    const cls = l.match(/return '([a-z][a-z0-9 -]+)', /g)!.map((m) => m.replace(/return '|', /g, ''));
    expect([...new Set(cls)].sort()).toEqual(['failure then degradation', 'failure then recovery', 'other observed shape']);   // the three direct returns
    expect(l).toMatch(/cls, why = 'gen-1 listen', ''/);                                                                       // the fourth, assigned then returned
    expect((l.match(/'(gen-1 listen|failure then recovery|failure then degradation|other observed shape|SUBJECT-MISMATCH|DRIVER\/INFRASTRUCTURE FAILURE)'/g) ?? []).length).toBeGreaterThan(0);
    const body = l.slice(l.indexOf('def classify('), l.indexOf('# ─── offline synthetic'));
    expect(body).toMatch(/running_key = SUBJECT_TABLE\[subject\]\['running'\]/);
    expect(body).not.toMatch(/\['engineRunning'\]|\['ioRunning'\]/);
    // VPIO prefix rule: exact ordered proper prefix + gen-1 graph_start_refused; the engine rule keeps its terminal step
    const sm = l.slice(l.indexOf('def subject_matches('), l.indexOf('def classify('));
    expect(sm).toMatch(/steps1\[-1\] == terminal/);
    expect(sm).toMatch(/prefix_ok = refused1 and 0 < len\(steps1\) < expected and steps1 == STEPS\[subject\]\[:len\(steps1\)\]\n/);
    expect(sm).toMatch(/full_ok = steps1 == STEPS\[subject\]/);
    const t = stripComments(W('ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift'));
    expect(t).toMatch(/"p5b0":\s+Subject\(key: "p5b0",\s+bundleID: "life\.soullab\.voicekernel\.k00",\s+iconLabel: "VoiceKernel K00"\)/);
    expect(t).toMatch(/"phase-a": Subject\(key: "phase-a", bundleID: "life\.soullab\.voicekernel\.k00",\s+iconLabel: "VoiceKernel K00"\)/);
    expect(t).toMatch(/"vpio-01": Subject\(key: "vpio-01", bundleID: "life\.soullab\.voicekernel\.vpio01", iconLabel: "VoiceKernel VPIO-01"\)/);
    expect(t).toMatch(/env\["K00_SUBJECT"\] \?\? "p5b0"/);
    expect(t).toMatch(/guard let s = Self\.subjects\[key\] else \{\s*throw DriverError/);          // unknown subject fails before any launch
    expect(t).not.toMatch(/launchArguments|launchEnvironment|UserDefaults|dlopen|NSClassFromString/);   // the app under test still receives nothing
    expect(t).not.toMatch(/harnessBundleID|harnessIconLabel/);
    const b = W('scripts/witness/k00-driver-batch.sh'); const bx = execLines(b);
    expect(bx).toMatch(/p5b0\|phase-a\) BID="life\.soullab\.voicekernel\.k00";\s+ICON="VoiceKernel K00";;/);
    expect(bx).toMatch(/vpio-01\)\s+BID="life\.soullab\.voicekernel\.vpio01"; ICON="VoiceKernel VPIO-01";;/);
    expect(bx).toMatch(/\*\) echo "unknown subject '\$SUBJECT'[^\n]*exit 2;;/);
    expect(bx).not.toMatch(/^BID="life\.soullab\.voicekernel\.k00"$/m);                                // no constant bundle anywhere
    expect((bx.match(/life\.soullab\.voicekernel\.k00/g) ?? []).length).toBe(1);                       // named exactly once: in the subject case
    expect(bx).toMatch(/TEST_RUNNER_K00_SUBJECT="\$SUBJECT"/);                                          // the driver learns the subject through the runner env only
    expect(bx).not.toMatch(/launchArguments|launchEnvironment/);
    for (const use of ['--domain-identifier "$BID" --subdirectory tmp', '--domain-identifier "$BID" --source "tmp/$1"', 'grep -i "$BID"', '--subject "$SUBJECT"']) expect(bx).toContain(use);
    expect(bx).not.toMatch(/uninstall/);
  });
  it('the VPIO first-install gate fails closed: pinned identity × all fields, manifest hashes + file set, just-in-time ABSENT read, authority at invocation, NO uninstall — every refusal lexically before the install verb; historical subjects unchanged', () => {
    const r = W('scripts/witness/k00-reinstall.sh'); const rx = execLines(r);
    for (const [k, v] of Object.entries({ VPIO_BID: VPIO.bundle, VPIO_UUID: VPIO.uuid, VPIO_DYLIB_SHA: VPIO.dylib, VPIO_EXEC_SHA: VPIO.exec, VPIO_MANIFEST_SHA: VPIO.manifest })) expect(rx).toContain(`${k}="${v}"`);
    expect(rx).toContain('VPIO_MANIFEST_FILES=7');
    expect(rx).toMatch(/vpio-01\)\s+BID="\$VPIO_BID";;/); expect(rx).toMatch(/\*\) echo "unknown subject '\$SUBJECT'[^\n]*exit 2;;/);
    const install = rx.indexOf('devicectl device install app');
    expect(install).toBeGreaterThan(0);
    for (const before of ['uuid-expectation-conflicts-with-pin', 'dylib-sha-expectation-conflicts-with-pin', 'manifest-file-required', 'manifest-sha', 'manifest-file-count', 'executable-sha', 'bundle-id',
                          'device info apps', 'absence NOT established', 'PRESENT — $VPIO_BID is already installed', 'K00_EXEC_AUTHORITY', 'exit 3', 'exit 4']) {
      expect(rx.indexOf(before)).toBeGreaterThan(-1); expect(rx.indexOf(before)).toBeLessThan(install);
    }
    expect(rx).toMatch(/APPS_RC=0; APPS="\$\(xcrun devicectl device info apps --device "\$DEV" 2>&1\)" \|\| APPS_RC=\$\?/);   // set -e cannot turn an unreadable listing into a silent exit
    expect(rx).toMatch(/if \[ \$APPS_RC -ne 0 \]; then ABSENCE="UNREADABLE/); expect(rx).toMatch(/elif grep -q "\$VPIO_BID" <<<"\$APPS"; then ABSENCE="PRESENT/);
    expect(rx).toMatch(/if \[ "\$ABSENCE" != "ABSENT" \]; then/);
    const rxNoProse = r.split('\n').filter((l) => !/^\s*(#|echo\b)/.test(l)).join('\n');           // echo prose is not a verb (C21)
    expect(rxNoProse).not.toMatch(/uninstall/);                                                // NO uninstall verb exists in executable lines
    expect(rx).not.toMatch(/K00_EXEC_AUTHORITY[^\n]*(\b(grep|cat|git)\b|==|-f )/);              // authority is an input, never read from the repo
    expect(rx).toMatch(/plistlib\.load/);                                                       // bundle id read from the product's own Info.plist
    // the manifest self-hash is checked against the pin AND every listed file + the file set (existing FILE-SET MISMATCH path)
    expect(rx).toMatch(/MAN_SELF_SHA="\$\(shasum -a 256 "\$EXPECT_MAN" \| cut -d' ' -f1\)"/);
    expect(rx.indexOf('FILE-SET MISMATCH')).toBeLessThan(install);
    // historical custody scripts never address the VPIO bundle; the historical container is outside this act's jurisdiction
    for (const p of ['scripts/witness/k00-container-archive.sh', 'scripts/witness/k00-container-purge.sh', 'scripts/witness/k00-phase-a-repro-build.sh']) expect(W(p)).not.toMatch(/vpio01|vpio-01/);
  });
  it('the ledger\'s offline synthetic VPIO self-test passes (exit 0) — and the VPIO subject rejects a 13-step engine journal', () => {
    const out = execFileSync('python3', ['scripts/witness/k00-ledger.py', '--selftest'], { cwd: process.cwd() }).toString('utf8');
    expect(out).toMatch(/selftest: 13\/13 expectations met/);
    expect(out).toMatch(/engine 13-step journal under --subject vpio-01 is a mismatch: SUBJECT-MISMATCH/);
    expect(out).toMatch(/vpio gen-1 listen, full 11-step trace, ioRunning: gen-1 listen/);
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
  it('the harness reaches the journal only through the actor, never the recorder (C2)', () => {
    for (const f of swift.filter((p) => p.startsWith(HARNESS))) {
      expect(bodies.get(f)!).not.toMatch(/\.recorder\b/);
    }
    const k = bodies.get(swift.find((p) => p.endsWith('VoiceKernel.swift'))!)!;
    expect(k).toMatch(/private let recorder: FlightRecorder/);
    expect(k).toMatch(/public func exportJournalJSONL\(\)/);
  });
  it('the view displays "listening" only via the snapshot rule, never from a local flag', () => {
    const f = swift.find((p) => p.endsWith('HarnessView.swift'))!;
    const body = bodies.get(f)!;
    expect(body).toMatch(/s\.displaysListening/);
    expect(body).not.toMatch(/@State private var (listening|speaking)/);
  });
});
