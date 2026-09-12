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
  it('the kernel journals every cancel and measures cancel → silence at the render seam (P5)', () => {
    const f = swift.find((p) => p.endsWith('VoiceKernel.swift'))!;
    const body = bodies.get(f)!;
    expect(body).toMatch(/"stream_cancelled"/);
    expect(body).toMatch(/"stream_cancel_measured"/);
    expect(body).toMatch(/cancelToSilenceMs/);
    // The retired metric — a function call's duration — may not come back.
    expect(body).not.toMatch(/cancelLatencyMs/);
    const g = bodies.get(swift.find((p) => p.endsWith('AudioGraph.swift'))!)!;
    expect(g).toMatch(/player\.installTap\(onBus: 0/);
    expect(g).toMatch(/func lastNonSilentRenderedAtMs\(\)/);
    expect(g).toMatch(/func setSyntheticStall\(_ on: Bool\)/);
  });
});

describe('KERNEL-00 · VOICE-06 / -15 / -16 — one recovery owner, bounded, journalled', () => {
  it('only HealthSupervisor verdicts reach requestRecovery, and the schedule is the ratified one', () => {
    const k = bodies.get(swift.find((p) => p.endsWith('VoiceKernel.swift'))!)!;
    const calls = k.match(/(?<!func )requestRecovery\(faultClass:/g) ?? [];
    // evaluate() has three verdict arms + the rebuild-failed path + (PRE-WITNESS-03 B,
    // founder-authorized) the configuration-change path; nothing else may call it.
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
  // K00-W1: `installTap` was reached with a 0 Hz input format. The repair is a
  // Swift-level validity check that makes the invalid call unreachable.
  it('a validity check lexically precedes every input-node installTap(onBus: 0 (§3.1)', () => {
    const f = swift.find((p) => p.endsWith('AudioGraph.swift'))!;
    const body = bodies.get(f)!;
    const taps = [...body.matchAll(/(\w+)\.installTap\(onBus: 0/g)];
    expect(taps.length).toBeGreaterThan(0);
    const inputTaps = taps.filter((m) => m[1] !== 'player');
    expect(inputTaps.length).toBeGreaterThan(0);
    for (const m of inputTaps) {
      const before = body.slice(0, m.index!);
      const guardAt = before.lastIndexOf('.requireValid()');
      expect(guardAt).toBeGreaterThan(-1);
      // the guard is a `try` — a refused format leaves `start` before the tap
      const guardLine = before.slice(before.lastIndexOf('\n', guardAt) + 1, guardAt);
      expect(guardLine).toMatch(/\btry \w+$/);
    }
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
  it('a refused build and every configuration change journal the observed input format and generation age (§3.4)', () => {
    const k = bodies.get(swift.find((p) => p.endsWith('VoiceKernel.swift'))!)!;
    expect(k).toMatch(/"graph_start_refused"/);
    expect(k).toMatch(/inputSampleRate/);
    expect(k).toMatch(/inputChannels/);
    expect(k).toMatch(/generationAgeMs/);
    // the config-change observation carries the format at the instant iOS posted it
    const cc = k.slice(k.indexOf('func handleConfigurationChange'), k.indexOf('"engine_configuration_changed"'));
    expect(cc).toMatch(/currentInputFormat\(\)/);
  });
});

describe('KERNEL-00 · PRE-WITNESS-03 — the configuration-change seam is exit-guarded, bounded, never a direct rebuild', () => {
  const k = () => bodies.get(swift.find((p) => p.endsWith('VoiceKernel.swift'))!)!;
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
    // no new budget: RecoveryPolicy is untouched by this plan
    const r = bodies.get(swift.find((p) => p.endsWith('RecoveryPolicy.swift'))!)!;
    expect(r).toMatch(/budgetPerWindow: Int = 3/);
    expect(r).not.toMatch(/configuration_change/);
  });
  it('A: a notification after exit is journalled and dropped before any generation or graph exists', () => {
    const h = handler();
    const guardAt = h.indexOf('guard inConversation else');
    expect(guardAt).toBeGreaterThan(-1);
    expect(h.slice(guardAt, guardAt + 400)).toMatch(/"stale_callback_dropped", cause: "not_in_conversation"/);
    // the exit guard precedes every other act in the handler
    expect(guardAt).toBeLessThan(h.indexOf('"engine_configuration_changed"'));
    expect(guardAt).toBeLessThan(h.indexOf('requestRecovery('));
  });
  it('C: voice processing is a journalled, pre-Enter-only kernel command; the harness only projects it', () => {
    const body = k();
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

describe('KERNEL-00 · PRE-WITNESS-04 — the expected VP change is classified one-shot, deferred, and decided by the supervisor', () => {
  const k = () => bodies.get(swift.find((p) => p.endsWith('VoiceKernel.swift'))!)!;
  const handler = () => {
    const body = k();
    const start = body.indexOf('func handleConfigurationChange');
    const next = body.indexOf('private func', start + 10);
    return body.slice(start, next === -1 ? undefined : next);
  };
  it('C: classification is a pure, generation-scoped, one-shot function over ports (data source is evidence, not identity)', () => {
    const c = bodies.get(swift.find((p) => p.endsWith('ConfigurationChange.swift'))!)!;
    expect(c).toMatch(/case voiceProcessingReconfiguration = "voice_processing_reconfiguration"/);
    expect(c).toMatch(/i\.voiceProcessing, i\.expectationPending, i\.ordinalInGeneration == 1, !i\.suspended/);
    expect(c).toMatch(/a\.output == b\.output && a\.input == b\.input/);
    expect(c).not.toMatch(/inputDataSource ==/);
    // no timer, no threshold, no budget lives in the classifier
    expect(c).not.toMatch(/Task\.sleep|DispatchQueue|Timer|Ms\b.*=\s*\d/);
  });
  it('B: the deferred branch consumes the expectation and touches neither the graph nor the recovery policy', () => {
    const h = handler();
    const deferred = h.slice(h.indexOf('case .voiceProcessingReconfiguration:'), h.indexOf('case .routeConfigurationChange:'));
    expect(deferred.length).toBeGreaterThan(0);
    expect(deferred).toMatch(/vpExpectationPending = false/);
    expect(deferred).toMatch(/"configuration_change_deferred", cause: cls\.rawValue, causeSeq: obs/);
    expect(deferred).not.toMatch(/rebuildGraph\(|requestRecovery\(|startGraph\(|Task \{|sleep/);
    // the other branch is PRE-WITNESS-03's bounded path, unchanged
    const other = h.slice(h.indexOf('case .routeConfigurationChange:'));
    expect(other).toMatch(/requestRecovery\(faultClass: "configuration_change"/);
  });
  it('the expectation is armed only at a graph start and retired when the generation is healthy', () => {
    const body = k();
    expect(body).toMatch(/vpExpectationPending = snap\.voiceProcessingEnabled/);
    expect(body).toMatch(/"vp_expectation_retired", cause: "generation_healthy"/);
    expect((body.match(/vpExpectationPending = true/g) ?? []).length).toBe(0);
  });
  it('no new fault class, budget, timer or threshold: RecoveryPolicy and HealthSupervisor are byte-pinned and the caller set is closed', () => {
    const classes = [...k().matchAll(/requestRecovery\(faultClass: "([a-z_]+)"/g)].map((m) => m[1]).sort();
    expect(classes).toEqual(['configuration_change', 'entry_timeout', 'graph_rebuild_failed', 'input_dead', 'output_stalled']);
    const r = bodies.get(swift.find((p) => p.endsWith('RecoveryPolicy.swift'))!)!;
    expect(r).toMatch(/budgetPerWindow: Int = 3/); expect(r).toMatch(/windowMs: Int64 = 60_000/);
    expect(r).toMatch(/backoffMs: \[Int64\] = \[500, 1_000, 2_000\]/);
    const h = bodies.get(swift.find((p) => p.endsWith('HealthSupervisor.swift'))!)!;
    expect(h).toMatch(/entryWindowMs: Int64 = 1_500/); expect(h).toMatch(/deadInputMs: Int64 = 2_000/);
    const rep = bodies.get(swift.find((p) => p.endsWith('Replay.swift'))!)!;
    expect(rep).toMatch(/"configuration_change_deferred"/);
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

describe('KERNEL-00 · PRE-WITNESS-05 Phase A — instrumentation only: mutating startup order unchanged, added calls read-only, no new timer', () => {
  const graph = () => bodies.get(swift.find((p) => p.endsWith('AudioGraph.swift'))!)!;
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
    // each mutating call appears exactly once (no duplicated start/tap/prepare)
    for (const re of [/setVoiceProcessingEnabled\(/g, /engine\.prepare\(\)/g, /engine\.start\(\)/g, /input\.installTap\(/g, /player\.installTap\(/g]) {
      expect((body.match(re) ?? []).length).toBe(1);
    }
  });
  it('ADDED calls are observation/read-only or journal instrumentation only; NO new timer · mutation · recovery act · configuration act', () => {
    const body = startBody();
    // forbidden anywhere in start(): timers, sleeps, session/config mutation, stops/resets, recovery
    expect(body).not.toMatch(/Task\.sleep|Timer|DispatchQueue|usleep|sleep\(/);
    expect(body).not.toMatch(/AVAudioSession|setActive|setCategory|setPreferred|overrideOutput/);
    expect(body).not.toMatch(/engine\.stop\(|engine\.reset\(|disconnect|detach\(|removeTap|requestRecovery|rebuildGraph/);
    // the added reads are exactly these (P5-B0: the pre-VP format read is gone — see the P5-B0 block)
    expect(body).toMatch(/String\(input\.isVoiceProcessingEnabled\)/);
    expect(body).toMatch(/trace\(\.isRunningImmediate, \["engineRunning": String\(engine\.isRunning\)\]\)/);
    // every trace step is emitted in the graph, and the enum is closed at 13 (14 minus the removed seam)
    const steps = [...graph().matchAll(/case \w+ = "([a-z_]+)"/g)].map((m) => m[1]);
    expect(steps.length).toBe(13);
    for (const st of steps) {
      const c = st.replace(/_([a-z])/g, (_, ch) => ch.toUpperCase()).replace('Vp', 'VP');
      expect(body).toContain(`trace(.${c}`);
    }
  });
  it('the kernel observes isRunning on the EXISTING tick only (no new timer) and journals the first callback per generation', () => {
    const k = bodies.get(swift.find((p) => p.endsWith('VoiceKernel.swift'))!)!;
    const tick = k.slice(k.indexOf('private func tick()'), k.indexOf('private func evaluate()') === -1 ? undefined : k.indexOf('private func evaluate()'));
    expect(tick).toMatch(/"engine_running_observed"/);
    expect(tick).toMatch(/msSinceStartReturn/);
    expect(tick).toMatch(/if ms >= 1_000 \{ runningObservationDone = true \}/);
    expect((k.match(/"engine_running_observed"/g) ?? []).length).toBe(1);
    expect((k.match(/Task\.sleep\(/g) ?? []).length).toBe(3);   // tick · recovery backoff · re-enter delay — unchanged
    expect(k).toMatch(/"first_input_callback"/);
    expect(k).toMatch(/"graph_start_trace"/);
    // caller set still closed; policy untouched
    const classes = [...k.matchAll(/requestRecovery\(faultClass: "([a-z_]+)"/g)].map((m) => m[1]).sort();
    expect(classes).toEqual(['configuration_change', 'entry_timeout', 'graph_rebuild_failed', 'input_dead', 'output_stalled']);
  });
});

describe('KERNEL-00 · PRE-WITNESS-05 P5-B0 — removal control: the pre-VP input-format read is gone and NOTHING else moved', () => {
  const graph = () => bodies.get(swift.find((p) => p.endsWith('AudioGraph.swift'))!)!;
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
  it('the seam input_format_before_vp does not exist in any non-test kernel or harness source (comments stripped; the XCTest negative assertion is excluded by scope)', () => {
    for (const f of swift.filter((p) => !p.includes('/Tests/'))) {
      expect(bodies.get(f)!).not.toMatch(/input_format_before_vp|inputFormatBeforeVP/);
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
