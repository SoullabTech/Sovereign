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
import { basename, dirname, join } from 'path';

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
// SOURCE-ID-02 (founder ruling 2026-09-15): an instrument file may move beyond its frozen state ONLY by lines that
// declare the SID subject; every historical executable line must survive verbatim and in order.
const SID_JIT_ALLOWED_LINES = new Set([
  '    PROC_RC=0; PROCS="$(xcrun devicectl device info processes --device "$DEV" 2>&1)" || PROC_RC=$?',
  `    printf '%s\\n' "$PROCS" > "$LEDGER/sid-jit-processes-before-install.txt"`,
  '    HCOUNT="$(grep -ci VoiceKernelHarness <<<"$PROCS" || true)"',
  '    echo "## SID just-in-time harness count before install: $HCOUNT"',
  '    if [ $PROC_RC -ne 0 ] || [ "$HCOUNT" -ne 0 ]; then',
  '      grep -i VoiceKernelHarness <<<"$PROCS" || true',
  '      echo "## REFUSED — SID just-in-time harness-zero precondition failed (process rc=$PROC_RC · harnesses=$HCOUNT); NO install"',
  '      exit 5',
  '    fi',
  '  fi',
]);
const sidOnlyDelta = (was: string, now: string, allowed: RegExp): string[] => {
  const ex = (s: string) => s.split('\n').filter((l) => !/^\s*#/.test(l));
  // the one ruled substitution: the unknown-subject refusal names the five-subject closed set; normalized back to history for the scan
  const w = ex(was), n = ex(now).map((l) => l.replace('(p5b0|phase-a|vpio-01|vpio-02|vpio-02-sid)', '(p5b0|phase-a|vpio-01|vpio-02)').replace('(p5b0 | phase-a | vpio-01 | vpio-02 | vpio-02-sid)', '(p5b0 | phase-a | vpio-01 | vpio-02)'));
  let j = 0; for (const l of w) { while (j < n.length && n[j] !== l) j++; if (j >= n.length) return [`MISSING: ${l}`]; j++; }
  const seen = new Map<string, number>(); for (const l of w) seen.set(l, (seen.get(l) ?? 0) + 1);
  const added: string[] = [];
  for (const l of n) { const c = seen.get(l) ?? 0; if (c > 0) { seen.set(l, c - 1); continue; } if (/^\s*$/.test(l) || allowed.test(l) || SID_JIT_ALLOWED_LINES.has(l)) continue; added.push(l); }
  return added;
};
const SID_ALLOWED = /VPIO02SID_|vpio-02-sid|vpio02sid|VPIO-02-SID|pins-unrecorded|SOURCE-ID-02|CLASSIFIER_SUBJECT|SOURCE_LEDGER|k00-source-ledger\.py|sid-nearend-gated|classifierSubject=|S-a arm/;
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
    // VPIO-02 / FORMAT-RESOLUTION-01 (founder adjudication 2026-09-14): a new subject, a new custody identity; the
    // installed .vpio01 artifact is frozen evidence and is never re-used for a different subject.
    // SOURCE-ID-02 (founder ruling 2026-09-15): the working tree is the SID subject; the frozen VPIO-02 identity is
    // pinned in history (ac12dedf4), never re-used for the instrumented subject.
    expect(yml).toMatch(/PRODUCT_BUNDLE_IDENTIFIER: life\.soullab\.voicekernel\.vpio02sid$/m);
    expect(histRaw('ac12dedf4', 'ios/VoiceKernelHarness/project.yml').toString('utf8')).toMatch(/PRODUCT_BUNDLE_IDENTIFIER: life\.soullab\.voicekernel\.vpio02$/m);
    expect(yml).not.toMatch(/vpio01/);
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
    // VPIO-02: the hardware format is read from the unit (Input scope, element 1) on a PROBE-initialized unit, the probe
    // is uninitialized BEFORE the guard can throw, and the guard precedes the real initialize and the start
    expect(start.indexOf('AudioUnitInitialize(u)')).toBeLessThan(start.indexOf('readHardwareInputFormat(u)'));
    expect(start.indexOf('readHardwareInputFormat(u)')).toBeLessThan(start.indexOf('AudioUnitUninitialize(u)'));
    expect(start.indexOf('AudioUnitUninitialize(u)')).toBeLessThan(start.indexOf('.requireValid()'));
    expect(start.indexOf('.requireValid()')).toBeLessThan(start.lastIndexOf('AudioUnitInitialize(u)'));
    expect(start.lastIndexOf('AudioUnitInitialize(u)')).toBeLessThan(start.indexOf('AudioOutputUnitStart(u)'));
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
      /kAUVoiceIOProperty_BypassVoiceProcessing/,
      // VPIO-02: probe initialize → read → probe uninitialize → guard (the probe is visible in the trace)
      /trace\(\.formatProbeInitializeBegin, \[:\]\)/, /AudioUnitInitialize\(u\)/, /readHardwareInputFormat\(u\)/,
      /AudioUnitUninitialize\(u\)/, /\.requireValid\(\)/,
      /kAudioUnitProperty_StreamFormat, kAudioUnitScope_Output, 1,/, /kAudioUnitProperty_StreamFormat, kAudioUnitScope_Input, 0,/,
      /kAudioOutputUnitProperty_SetInputCallback, kAudioUnitScope_Global, 1,/, /kAudioUnitProperty_SetRenderCallback, kAudioUnitScope_Input, 0,/,
      /AudioUnitAddPropertyListener\(u, kAudioUnitProperty_StreamFormat, vpioFormatListener,/,
      /trace\(\.initializeBegin, \[:\]\)/, /AudioOutputUnitStart\(u\)/,
    ];
    let last = -1;
    for (const re of order) {
      const m = re.exec(start);
      expect(m).not.toBeNull();
      expect(m!.index).toBeGreaterThan(last);
      last = m!.index;
    }
    // VPIO-02: exactly two initializes in start() (the probe and the real one), one probe uninitialize, one start, one listener
    expect((start.match(/AudioUnitInitialize\(u\)/g) ?? []).length).toBe(2);
    expect((start.match(/AudioUnitUninitialize\(u\)/g) ?? []).length).toBe(1);
    for (const re of [/AudioOutputUnitStart\(u\)/g, /AudioUnitAddPropertyListener\(/g]) expect((start.match(re) ?? []).length).toBe(1);
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
    // trace vocabulary: the fourteen VPIO-02 seams, no extra step for the G9 read
    expect([...g.matchAll(/case \w+ = "([a-z_]+)"/g)].length).toBe(14);
  });
  it('the start trace names exactly the fourteen VPIO-02 seams, in order (the format probe visible), and every step is emitted', () => {
    const g = graph();
    const steps = [...g.matchAll(/case \w+ = "([a-z_]+)"/g)].map((m) => m[1]);
    expect(steps).toEqual(['unit_created', 'io_enabled', 'vp_properties_set',
                           'format_probe_initialize_begin', 'format_probe_initialize_return', 'input_format_read', 'format_probe_uninitialize_return',
                           'formats_set', 'callbacks_armed', 'initialize_begin', 'initialize_return', 'start_begin', 'start_return', 'is_running_immediate']);
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
  it('the pure-logic tests follow the subject: RouteComparisonTests present, the classifier tests gone, the fourteen-seam VPIO-02 trace pinned', () => {
    const t = bodies.get(swift.find((p) => p.endsWith('PureLogicTests.swift'))!)!;
    expect(t).toMatch(/final class RouteComparisonTests: XCTestCase/);
    expect(t).not.toMatch(/ConfigurationChangeClassifier/);
    expect(t).toMatch(/func testTheTraceNamesExactlyTheFourteenVPIO02SeamsInOrder\(\)/);
    expect(t).not.toMatch(/ElevenVPIOSeams/);
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
    // S2 (founder ruling 2026-09-15): the batch stops its OWN Mac-local afplay child (and the 1 s liveness monitor) — never a device process.
    const bNoS2 = bExec.replace(/^(afplay_state|stimulus_preflight|stimulus_start|stimulus_stop)\(\)\{[\s\S]*?^\}$/gm, '').replace(/^\s*trap 'if \[ -n "\$\{S2_PID:-\}" \][^\n]*INT TERM$/m, '');
    expect(bNoS2).not.toMatch(/process (signal|terminate|suspend)|\bkill\b|sendMemoryWarning/);
    for (const k of bExec.match(/\bkill\b[^\n]*/g) ?? []) expect(k).toMatch(/^kill (-TERM )?"\$S2_(PID|MON)"/);   // every kill in the file names the afplay child or its monitor, nothing else
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

describe('KERNEL-00 · VPIO-01B — witness preparation: instrument-only subject plumbing; the organism moves only inside the VPIO-02 envelope', () => {
  const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
  const execLines = (s: string) => s.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
  const VPIO = { bundle: 'life.soullab.voicekernel.vpio01', uuid: 'E8074AD1-D179-3267-A15C-142D033A9665',
                 dylib: '6efe33b1b25fdb4dc4376abfb248e6c530e59f492ebc876314619fd1bef64b3d',
                 exec: 'e43dec667e1e8ba727d7253f39199be3a34333c804c220b41233945d42a1a4ac',
                 manifest: '4710d9a68f5b6bb9de8ef64b143f8dd9b688476b3a7f3ee0257b3922b7a60bed' };
  it('VPIO-02 envelope (founder adjudication 2026-09-14): relative to the VPIO-01 compile subject 85e5e7154, exactly AudioGraph.swift · PureLogicTests.swift · project.yml moved; kernel, authority, supervisor, policy, state, projection, journal, replay, Package.swift and every harness behavioural file are byte-identical; no file added under those roots', () => {
    const paths = ['ios/VoiceKernel/Sources', 'ios/VoiceKernel/Tests', 'ios/VoiceKernel/Package.swift', 'ios/VoiceKernelHarness/Harness', 'ios/VoiceKernelHarness/project.yml'];
    const ENVELOPE = ['ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift', 'ios/VoiceKernel/Tests/VoiceKernelTests/PureLogicTests.swift', 'ios/VoiceKernelHarness/project.yml'];
    const listed = histList('85e5e7154', paths).sort();
    const moved: string[] = [];
    // the VPIO-02 envelope is a fact of history now: ac12dedf4 relative to 85e5e7154 (SOURCE-ID-02 moved the working tree on)
    for (const p of listed) if (!histRaw('85e5e7154', p).equals(histRaw('ac12dedf4', p))) moved.push(p);
    expect(moved.sort()).toEqual(ENVELOPE);
    // SOURCE-ID-02 (founder ruling 2026-09-15): relative to the frozen VPIO-02 subject ac12dedf4 the working tree moves in
    // exactly AudioGraph.swift (estimator) · VoiceKernel.swift (hop + aggregate + record) · PureLogicTests.swift · project.yml (identity)
    const SID_ENVELOPE = ['ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift', 'ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift',
                          'ios/VoiceKernel/Tests/VoiceKernelTests/PureLogicTests.swift', 'ios/VoiceKernelHarness/project.yml'];
    const sidMoved: string[] = [];
    for (const p of listed) if (!histRaw('ac12dedf4', p).equals(readFileSync(join(process.cwd(), p)))) sidMoved.push(p);
    expect(sidMoved.sort()).toEqual(SID_ENVELOPE);
    // the working tree adds no source file under those roots
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
    expect(rx).toMatch(/vpio-01\)\s+BID="\$VPIO_BID";/); expect(rx).toMatch(/\*\) echo "unknown subject '\$SUBJECT'[^\n]*exit 2;;/);   // VPIO-02B: the case line now also selects PIN_* (asserted in the VPIO-02B block)
    const install = rx.indexOf('devicectl device install app');
    expect(install).toBeGreaterThan(0);
    for (const before of ['uuid-expectation-conflicts-with-pin', 'dylib-sha-expectation-conflicts-with-pin', 'manifest-file-required', 'manifest-sha', 'manifest-file-count', 'executable-sha', 'bundle-id',
                          'device info apps', 'absence NOT established', 'PRESENT — $PIN_BID is already installed', 'K00_EXEC_AUTHORITY', 'exit 3', 'exit 4']) {
      expect(rx.indexOf(before)).toBeGreaterThan(-1); expect(rx.indexOf(before)).toBeLessThan(install);
    }
    expect(rx).toMatch(/APPS_RC=0; APPS="\$\(xcrun devicectl device info apps --device "\$DEV" 2>&1\)" \|\| APPS_RC=\$\?/);   // set -e cannot turn an unreadable listing into a silent exit
    expect(rx).toMatch(/if \[ \$APPS_RC -ne 0 \]; then ABSENCE="UNREADABLE/); expect(rx).toMatch(/elif grep -q "\$PIN_BID" <<<"\$APPS"; then ABSENCE="PRESENT/);   // VPIO-02B: the declared subject's own pin
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
    expect(out).toMatch(/selftest: 34\/34 expectations met/);   // 13 VPIO-01B + 21 VPIO-02B expectations (the VPIO-02B block names the new ones)
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

// VPIO-02 / FORMAT-RESOLUTION-01 (founder adjudication 2026-09-14, F-W1 witness record §9 / plan §13.10).
// The §3 law stands: an invalid input format is refused before the unit enters physical operation. What moved is
// WHERE the guard earns its evidence: from a probe-initialized unit, uninitialized again before the guard can throw.
describe('KERNEL-00 · VPIO-02 — the format probe lifecycle: initialize → read → uninitialize → guard, before anything is armed or started', () => {
  const graph = () => bodies.get(swift.find((p) => p.endsWith('AudioGraph.swift'))!)!;
  const startOf = (g: string) => g.slice(g.indexOf('public func start(voiceProcessing'), g.indexOf('private static func check('));
  it('the probe brackets the read and is uninitialized before the guard, the client formats, any callback, the real initialize and the start', () => {
    const start = startOf(graph());
    const i = (re: RegExp, from = 0) => { const m = re.exec(start.slice(from)); expect(m).not.toBeNull(); return from + m!.index; };
    const probeInit = i(/AudioUnitInitialize\(u\)/);
    const read = i(/readHardwareInputFormat\(u\)/);
    const probeUninit = i(/AudioUnitUninitialize\(u\)/);
    const guard = i(/try hw\.requireValid\(\)/);
    const formats = i(/kAudioUnitProperty_StreamFormat, kAudioUnitScope_Output, 1,/);
    const arm = i(/kAudioOutputUnitProperty_SetInputCallback/);
    const realInit = start.lastIndexOf('AudioUnitInitialize(u)');
    const startCall = i(/AudioOutputUnitStart\(u\)/);
    expect([probeInit, read, probeUninit, guard, formats, arm, realInit, startCall]).toEqual([probeInit, read, probeUninit, guard, formats, arm, realInit, startCall].slice().sort((a, b) => a - b));
    expect(probeInit).toBeLessThan(read); expect(read).toBeLessThan(probeUninit); expect(probeUninit).toBeLessThan(guard);
    expect(guard).toBeLessThan(formats); expect(formats).toBeLessThan(arm); expect(arm).toBeLessThan(realInit); expect(realInit).toBeLessThan(startCall);
    // the probe window mutates nothing and arms nothing: no set-property, no callback, no listener, no start inside it
    const window = start.slice(probeInit, probeUninit);
    expect(window).not.toMatch(/AudioUnitSetProperty|SetInputCallback|SetRenderCallback|AudioUnitAddPropertyListener|AudioOutputUnitStart/);
    // a failed probe initialize returns its exact OSStatus BEFORE the read; a failed probe uninitialize returns its OSStatus BEFORE the guard
    expect(start.slice(probeInit, read)).toMatch(/try Self\.check\(probeInit, step: "format_probe_initialize_return"\)/);
    expect(start.slice(probeUninit, guard)).toMatch(/try Self\.check\(probeUninit, step: "format_probe_uninitialize_return"\)/);
    // the guard is the inherited pure precondition, unchanged
    expect(graph()).toMatch(/var isValid: Bool \{ sampleRate > 0 && channels > 0 \}/);
  });
  it('the read is still the documented property on (Input scope, element 1); the client format is set from the OBSERVED rate; no session-derived rate, no hard-coded rate, no alternate scope, no engine fallback, no retry', () => {
    const g = graph(); const start = startOf(g);
    expect(g).toMatch(/kAudioUnitProperty_StreamFormat, kAudioUnitScope_Input, 1, &asbd, &size\)/);
    expect(start).toMatch(/var client = Self\.clientFormat\(sampleRate: hw\.sampleRate\)/);
    // no fixed rate inside start() or the hardware read (the pre-existing `outputSampleRate` default field is not the guard's evidence)
    const hwRead = g.slice(g.indexOf('private func readHardwareInputFormat('), g.indexOf('public func currentInputFormat()'));
    expect(start + hwRead).not.toMatch(/AVAudioSession|AVAudioEngine|48_?000\b|44_?100\b/);
    // an unreadable property yields the zero sentinel, which the guard refuses — never a substituted rate
    expect(hwRead).toMatch(/guard st == noErr else \{ return InputFormatObservation\(sampleRate: 0, channels: 0\) \}/);
    expect(start).not.toMatch(/\bwhile\b|\brepeat\b|for _ in|attempt|retry/);
    expect((start.match(/readHardwareInputFormat\(u\)/g) ?? []).length).toBe(1);
    expect((start.match(/AudioUnitInitialize\(u\)/g) ?? []).length).toBe(2);
    expect((start.match(/AudioUnitUninitialize\(u\)/g) ?? []).length).toBe(1);
  });
  it('the three probe seams are traced with outcome/status/elapsed and the read is stamped afterProbeInitialize; a post-probe refusal ends at the uninitialize seam', () => {
    const start = startOf(graph());
    expect(start).toMatch(/trace\(\.formatProbeInitializeBegin, \[:\]\)/);
    expect(start).toMatch(/trace\(\.formatProbeInitializeReturn, \["outcome": probeInit == noErr \? "ok" : "error", "status": String\(probeInit\), "elapsedMs":/);
    expect(start).toMatch(/trace\(\.formatProbeUninitializeReturn, \["outcome": probeUninit == noErr \? "ok" : "error", "status": String\(probeUninit\), "elapsedMs":/);
    expect(start).toMatch(/trace\(\.inputFormatRead, \["sampleRate": String\(hw\.sampleRate\), "channels": String\(hw\.channels\), "afterProbeInitialize": "true"\]\)/);
    // order of trace emissions in the source mirrors the enum order
    const order = ['formatProbeInitializeBegin', 'formatProbeInitializeReturn', 'inputFormatRead', 'formatProbeUninitializeReturn', 'formatsSet', 'callbacksArmed', 'initializeBegin'];
    let last = -1;
    for (const c of order) { const at = start.indexOf(`trace(.${c}`); expect(at).toBeGreaterThan(last); last = at; }
  });
  it('the custody identity is the new subject: bundle life.soullab.voicekernel.vpio02 · display name "VoiceKernel VPIO-02"; the frozen .vpio01 identity survives only in the VPIO-01 witness instrument and records', () => {
    const yml = readFileSync(join(process.cwd(), 'ios/VoiceKernelHarness/project.yml'), 'utf8');
    // SOURCE-ID-02 (founder ruling 2026-09-15): the frozen VPIO-02 identity lives in history; the tree carries the SID subject.
    const frozenYml = histRaw('ac12dedf4', 'ios/VoiceKernelHarness/project.yml').toString('utf8');
    expect(frozenYml).toMatch(/PRODUCT_BUNDLE_IDENTIFIER: life\.soullab\.voicekernel\.vpio02$/m);
    expect(frozenYml).toMatch(/CFBundleDisplayName: VoiceKernel VPIO-02$/m);
    expect(yml).toMatch(/PRODUCT_BUNDLE_IDENTIFIER: life\.soullab\.voicekernel\.vpio02sid$/m);
    expect(yml).toMatch(/CFBundleDisplayName: VoiceKernel VPIO-02-SID$/m);
    const ymlExec = yml.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');   // prose is not identity (the C21 lesson)
    expect(ymlExec).not.toMatch(/vpio01|VPIO-01/);
    expect(ymlExec).not.toMatch(/vpio02$|VPIO-02$/m);                                  // the frozen .vpio02 identity is never the tree's
    // VPIO-02B (founder ruling 2026-09-14): the instrument now carries the vpio-02 row; its delta against de3efd3fb is
    // pinned to exactly the four authorized files in the VPIO-02B block below, and the organism is pinned to ac12dedf4 there.
  });
});

describe('KERNEL-00 · VPIO-02B — witness preparation: the fourth subject row lives in the instrument only; the organism is frozen at ac12dedf4; no device act', () => {
  const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
  const execLines = (s: string) => s.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
  const ORGANISM = 'ac12dedf4';        // VPIO-02 / FORMAT-RESOLUTION-01 · VPIO-02 MAC-COMPILE-01 GREEN
  const INSTRUMENT_BASE = 'de3efd3fb'; // VPIO-01B instrument · DRIVER-COMPILE-01 GREEN
  const VPIO02 = { bundle: 'life.soullab.voicekernel.vpio02', label: 'VoiceKernel VPIO-02', uuid: 'B346F448-A2A8-30DB-9683-B732A80D7899',
                   dylib: 'e963a23cd17fd12e273671023b01c74ea5fbc4e8a7fb22168a0cee2562bd66ec',
                   exec: '9fe56504131e0b023162c62a6bd60541053b14262c9d3075a15a08dbe6c7805a',
                   manifest: '1459283c175e243c90459b2724c2be7362cf6dd4c95c191bd15c443ec8b98410' };
  const VPIO01 = { bundle: 'life.soullab.voicekernel.vpio01', uuid: 'E8074AD1-D179-3267-A15C-142D033A9665',
                   dylib: '6efe33b1b25fdb4dc4376abfb248e6c530e59f492ebc876314619fd1bef64b3d',
                   exec: 'e43dec667e1e8ba727d7253f39199be3a34333c804c220b41233945d42a1a4ac',
                   manifest: '4710d9a68f5b6bb9de8ef64b143f8dd9b688476b3a7f3ee0257b3922b7a60bed' };
  const VPIO02_STEPS = ['unit_created', 'io_enabled', 'vp_properties_set', 'format_probe_initialize_begin', 'format_probe_initialize_return',
                        'input_format_read', 'format_probe_uninitialize_return', 'formats_set', 'callbacks_armed',
                        'initialize_begin', 'initialize_return', 'start_begin', 'start_return', 'is_running_immediate'];
  const tracked = (paths: string[]) => execFileSync('git', ['ls-files', '--', ...paths], { cwd: process.cwd() }).toString('utf8').split('\n').filter(Boolean).sort();
  const INSTRUMENT = ['ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift', 'scripts/witness/k00-driver-batch.sh', 'scripts/witness/k00-ledger.py', 'scripts/witness/k00-reinstall.sh'];
  const OUTPUT_READER = 'scripts/witness/k00-output-ledger.py';                      // K00-05/06 (Option C): the one file the instrument may add
  const PLAYBACK_PROBE = 'scripts/witness/k00-playback-probe.sh';                    // S2 design (founder ruling 2026-09-15): read-only Mac playback-capability census
  const S2_FIXTURE = 'scripts/witness/fixtures/k00-s2-nearend-997hz-180s.wav';          // S2 stimulus (founder ruling 2026-09-15): 997 Hz · 180 s · PCM16 · 48 kHz, SHA-pinned
  const S2_FIXTURE_SIDECAR = S2_FIXTURE + '.sha256';
  const VOLUME_DRIFT_CENSUS = 'scripts/witness/k00-volume-drift-census.sh';                // S2-VOLUME-DRIFT-01 (founder ruling 2026-09-15): read-only Mac census, never sets volume
  const INSTRUMENT_VPIO02B = '08483cfe4f6c3e98198805337ced99bae92ce911';             // the F-W1 instrument; the entry classifier + reinstall stay at its bytes
  const INSTRUMENT_K0506 = '8b111709b6e5010b4b6ee7281d257141945276ff';               // the K00-05/06 Option C instrument (DRIVER-COMPILE-01 GREEN; first witness ten infra rows); C-D20 may move only the driver test beyond it
  it('SOURCE-ID-02 (founder ruling 2026-09-15): the frozen VPIO-02 organism is ac12dedf4 in history; the working tree differs from it in exactly the four ruled files, and every invariant file (authority · supervisor · policy · state · projection · journal · replay · route comparison · Package.swift · every harness Swift file) is byte-identical; no file added or removed', () => {
    const roots = ['ios/VoiceKernel', 'ios/VoiceKernelHarness'];
    const listed = histList(ORGANISM, roots).sort();
    expect(listed.length).toBeGreaterThan(10);
    expect(tracked(roots)).toEqual(listed);
    const SID_ENVELOPE = ['ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift', 'ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift',
                          'ios/VoiceKernel/Tests/VoiceKernelTests/PureLogicTests.swift', 'ios/VoiceKernelHarness/project.yml'];
    const moved = listed.filter((p) => !histRaw(ORGANISM, p).equals(readFileSync(join(process.cwd(), p))));
    expect(moved.sort()).toEqual(SID_ENVELOPE);
    const INVARIANT = ['AudioSessionAuthority.swift', 'HealthSupervisor.swift', 'Journal.swift', 'KernelState.swift', 'RecoveryPolicy.swift', 'Replay.swift', 'RouteComparison.swift', 'StateProjection.swift']
      .map((f) => 'ios/VoiceKernel/Sources/VoiceKernel/' + f).concat(['ios/VoiceKernel/Package.swift'], listed.filter((p) => p.startsWith('ios/VoiceKernelHarness/Harness/') && p.endsWith('.swift')));
    expect(INVARIANT.length).toBeGreaterThanOrEqual(12);
    for (const p of INVARIANT) { expect(listed).toContain(p); expect(histRaw(ORGANISM, p).equals(readFileSync(join(process.cwd(), p)))).toBe(true); }
  });
  it('the instrument moved only in the four authorized files relative to de3efd3fb (scripts/witness · ios/VoiceKernelDriver); exactly one file added under those roots — the K00-05/06 output reader (founder ruling 2026-09-14, Option C); nothing removed', () => {
    const roots = ['scripts/witness', 'ios/VoiceKernelDriver'];
    const listed = histList(INSTRUMENT_BASE, roots).sort();
    const SID_FIXTURE = 'scripts/witness/fixtures/k00-sid-nearend-997hz-gated-2hz-180s.wav';   // SOURCE-ID-02: the gated fixture + sidecar + the source reader
    const SOURCE_READER = 'scripts/witness/k00-source-ledger.py';
    // SID ENTRY (founder ruling 2026-09-15, tooling-only): the observer-liveness verifier + its eight synthetic self-test journals
    const LIVENESS = 'scripts/witness/k00-source-liveness.py';
    const LIVENESS_FIXTURES = ['badframes', 'boundary9plus', 'distractors', 'dormant9', 'frames0', 'live10', 'mixedreset', 'unrelated'].map((n) => `scripts/witness/fixtures/k00-source-liveness-selftest/${n}.jsonl`);
    expect(tracked(roots)).toEqual([...listed, OUTPUT_READER, PLAYBACK_PROBE, S2_FIXTURE, S2_FIXTURE_SIDECAR, VOLUME_DRIFT_CENSUS, SID_FIXTURE, SID_FIXTURE + '.sha256', SOURCE_READER, LIVENESS, ...LIVENESS_FIXTURES].sort());   // S2 (founder ruling 2026-09-15): the tracked stimulus + its sidecar
    const moved = listed.filter((p) => !histRaw(INSTRUMENT_BASE, p).equals(readFileSync(join(process.cwd(), p))));
    expect(moved.sort()).toEqual(INSTRUMENT);
  });
  it('the four-subject table is identical across ledger · driver · batch · reinstall: vpio-02 → .vpio02 · "VoiceKernel VPIO-02" · ioRunning; the three historical rows unchanged; no default bundle; the driver still passes the app under test nothing', () => {
    const l = W('scripts/witness/k00-ledger.py');
    expect(l).toMatch(/'vpio-02': \{'bundle': 'life\.soullab\.voicekernel\.vpio02', 'label': 'VoiceKernel VPIO-02', 'running': 'ioRunning',\s+'refusal_terminal': None\}/);
    expect(l).toMatch(/'vpio-01': \{'bundle': 'life\.soullab\.voicekernel\.vpio01', 'label': 'VoiceKernel VPIO-01', 'running': 'ioRunning',\s+'refusal_terminal': None\}/);
    expect(l).toContain("STEPS = {'p5b0': P5B0_STEPS, 'phase-a': PHASE_A_STEPS, 'vpio-01': VPIO01_STEPS, 'vpio-02': VPIO02_STEPS}");
    expect(l).toContain("choices=sorted(SUBJECTS)");
    const t = stripComments(W('ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift'));
    expect(t).toMatch(/"vpio-02": Subject\(key: "vpio-02", bundleID: "life\.soullab\.voicekernel\.vpio02", iconLabel: "VoiceKernel VPIO-02"\)/);
    expect(t).toMatch(/"vpio-01": Subject\(key: "vpio-01", bundleID: "life\.soullab\.voicekernel\.vpio01", iconLabel: "VoiceKernel VPIO-01"\)/);
    expect((t.match(/Subject\(key:/g) ?? []).length).toBe(5);   // SOURCE-ID-02: + vpio-02-sid (custody declaration only)
    expect(t).toMatch(/"vpio-02-sid": Subject\(key: "vpio-02-sid", bundleID: "life\.soullab\.voicekernel\.vpio02sid", iconLabel: "VoiceKernel VPIO-02-SID"\)/);
    expect(t).toMatch(/env\["K00_SUBJECT"\] \?\? "p5b0"/);
    expect(t).not.toMatch(/launchArguments|launchEnvironment|UserDefaults|dlopen|NSClassFromString/);
    const bx = execLines(W('scripts/witness/k00-driver-batch.sh'));
    expect(bx).toMatch(/vpio-02\)\s+BID="life\.soullab\.voicekernel\.vpio02"; ICON="VoiceKernel VPIO-02";;/);
    expect(bx).toMatch(/vpio-01\)\s+BID="life\.soullab\.voicekernel\.vpio01"; ICON="VoiceKernel VPIO-01";;/);
    expect((bx.match(/life\.soullab\.voicekernel\.k00/g) ?? []).length).toBe(1);
    expect((bx.match(/life\.soullab\.voicekernel\.vpio02(?!sid)/g) ?? []).length).toBe(1);   // named once: the subject row; every use is $BID
    expect((bx.match(/life\.soullab\.voicekernel\.vpio02sid/g) ?? []).length).toBe(1);        // SOURCE-ID-02: the SID row, once
    expect(bx).toMatch(/vpio-02-sid\)\s+BID="life\.soullab\.voicekernel\.vpio02sid"; ICON="VoiceKernel VPIO-02-SID";;/);
    expect(bx).not.toMatch(/install app|uninstall/);                                          // no reinstall is added to the batch
    const rx = execLines(W('scripts/witness/k00-reinstall.sh'));
    expect(rx).toMatch(/vpio-02\)\s+BID="\$VPIO02_BID"; PIN_BID="\$VPIO02_BID"; PIN_UUID="\$VPIO02_UUID"; PIN_DYLIB_SHA="\$VPIO02_DYLIB_SHA"; PIN_EXEC_SHA="\$VPIO02_EXEC_SHA"; PIN_MANIFEST_SHA="\$VPIO02_MANIFEST_SHA"; PIN_MANIFEST_FILES="\$VPIO02_MANIFEST_FILES";;/);
    expect(rx).toMatch(/vpio-01\)\s+BID="\$VPIO_BID";\s+PIN_BID="\$VPIO_BID";\s+PIN_UUID="\$VPIO_UUID";/);
    // the unknown-subject refusal names the closed set: the FROZEN entry classifier still names four subjects (it is byte-identical
    // to its frozen state); driver · batch · reinstall name five (SOURCE-ID-02). The batch maps vpio-02-sid → classifier vpio-02
    // explicitly (declared custody + trace compatibility = subject identity; founder ruling 2026-09-14).
    expect(l).toMatch(/p5b0[ |]+phase-a[ |]+vpio-01[ |]+vpio-02(?![ |]+vpio-02-sid)/);
    expect(l).not.toMatch(/vpio-02-sid/);
    for (const src of [t, bx, rx]) expect(src).toMatch(/p5b0[ |]+phase-a[ |]+vpio-01[ |]+vpio-02[ |]+vpio-02-sid/);
    expect(bx).toContain('CLASSIFIER_SUBJECT="$SUBJECT"; [ "$SUBJECT" = vpio-02-sid ] && CLASSIFIER_SUBJECT="vpio-02"');
  });
  it('the ledger VPIO02_STEPS list is exactly the fourteen seams, in order, and equals the AudioGraph.swift enum order of the frozen subject', () => {
    const l = W('scripts/witness/k00-ledger.py');
    const m = l.match(/VPIO02_STEPS = \[([^\]]+)\]/)!;
    const steps = [...m[1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1]);
    expect(steps).toEqual(VPIO02_STEPS);
    const g = histBody(ORGANISM, 'ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift');
    expect([...g.matchAll(/case \w+ = "([a-z_]+)"/g)].map((x) => x[1])).toEqual(VPIO02_STEPS);
    // VPIO-01's frozen 11-step list is untouched
    expect(l).toContain("VPIO01_STEPS = ['unit_created', 'io_enabled', 'vp_properties_set', 'input_format_read', 'formats_set', 'callbacks_armed',\n                'initialize_begin', 'initialize_return', 'start_begin', 'start_return', 'is_running_immediate']");
  });
  it('the reinstall pins the VPIO-02 identity in its own constants (the VPIO-01 pins unchanged), selects PIN_* by subject, refuses a conflicting K00_EXPECT_*, and every refusal precedes the one install verb; the .vpio01 id appears in no executable line but its own pin', () => {
    const r = W('scripts/witness/k00-reinstall.sh'); const rx = execLines(r);
    for (const [k, v] of Object.entries({ VPIO02_BID: VPIO02.bundle, VPIO02_UUID: VPIO02.uuid, VPIO02_DYLIB_SHA: VPIO02.dylib, VPIO02_EXEC_SHA: VPIO02.exec, VPIO02_MANIFEST_SHA: VPIO02.manifest })) expect(rx).toContain(`${k}="${v}"`);
    expect(rx).toContain('VPIO02_MANIFEST_FILES=7');
    for (const [k, v] of Object.entries({ VPIO_BID: VPIO01.bundle, VPIO_UUID: VPIO01.uuid, VPIO_DYLIB_SHA: VPIO01.dylib, VPIO_EXEC_SHA: VPIO01.exec, VPIO_MANIFEST_SHA: VPIO01.manifest })) expect(rx).toContain(`${k}="${v}"`);
    expect(rx).toContain('VPIO_MANIFEST_FILES=7');
    // the pin block and the just-in-time block are keyed on the selected pin, never on a subject-name comparison
    expect(rx).not.toMatch(/"\$SUBJECT" = "vpio-01"|"\$SUBJECT" = "vpio-02"/);
    expect((rx.match(/if \[ -n "\$PIN_BID" \]; then/g) ?? []).length).toBe(2);
    for (const use of ['[ "$EXPECT" != "$PIN_UUID" ]', '[ "$EXPECT_SHA" != "$PIN_DYLIB_SHA" ]', 'EXPECT="$PIN_UUID"; EXPECT_SHA="$PIN_DYLIB_SHA"', '[ "$MAN_SELF_SHA" = "$PIN_MANIFEST_SHA" ]',
                       '= "$PIN_MANIFEST_FILES" ]', '[ "$EXEC_SHA" = "$PIN_EXEC_SHA" ]', '[ "$PRODUCT_BID" = "$PIN_BID" ]', 'grep -q "$PIN_BID" <<<"$APPS"']) expect(rx).toContain(use);
    const install = rx.indexOf('devicectl device install app');
    for (const before of ['uuid-expectation-conflicts-with-pin', 'dylib-sha-expectation-conflicts-with-pin', 'manifest-file-required', 'manifest-sha', 'manifest-file-count', 'executable-sha', 'bundle-id',
                          'device info apps', 'absence NOT established', 'PRESENT — $PIN_BID is already installed', 'K00_EXEC_AUTHORITY', 'exit 3', 'exit 4']) expect(rx.indexOf(before)).toBeLessThan(install);
    expect((rx.match(/devicectl device install app/g) ?? []).length).toBe(1);
    const noProse = r.split('\n').filter((l) => !/^\s*(#|echo\b)/.test(l)).join('\n');
    expect(noProse).not.toMatch(/uninstall/);
    // .vpio01 / .vpio02 literals: each exactly once, on its own constant line; every other use goes through $PIN_BID / $BID
    expect((rx.match(/life\.soullab\.voicekernel\.vpio01/g) ?? []).length).toBe(1);
    expect((rx.match(/life\.soullab\.voicekernel\.vpio02(?!sid)/g) ?? []).length).toBe(1);
    // SOURCE-ID-02 (founder ruling 2026-09-15): the SID subject's bundle is the one known fact; every other pin is EMPTY until its own
    // MAC-COMPILE records it, and an empty pin refuses (pins-unrecorded) before any device read.
    // SID REINSTALL-PIN-SID (founder rulings 2026-09-15, code-only): act 1 (3f3cb15b0) recorded the dylib UUID + dylib SHA-256, act 2 the
    // executable SHA-256 + manifest SHA-256 + file count — all five from the one accepted SID MAC-COMPILE-02 act (faf918b5c, carrier-B
    // ca735fe15); pins-unrecorded therefore no longer fires for the SID subject, every other gate stands; the container is a
    // WITNESS-REQUIRED sentinel (never empty, never a UUID) and is not read anywhere in the script.
    expect(rx).toContain('VPIO02SID_BID="life.soullab.voicekernel.vpio02sid"');
    expect(rx).toContain('VPIO02SID_UUID="4A6AD464-0A19-320F-980E-7446F6AA1440"');
    expect(rx).toContain('VPIO02SID_DYLIB_SHA="a15b399d9a9a3c1071d12ba3c4fb24a56b3f6e51c708f8d3c5dd9cb811bdfc44"');
    expect(rx).toContain('VPIO02SID_EXEC_SHA="db036694dcaa415bb50bb6319af249d643e6db76847177541db836f2f1ec5d17"');
    expect(rx).toContain('VPIO02SID_MANIFEST_SHA="699ac758b12bd8062145655ad12fab6ed5ac2c96e1b4003cc210a5b39f72c7a4"');
    expect(rx).toContain('VPIO02SID_MANIFEST_FILES=7');
    expect(rx).toContain('VPIO02SID_CONTAINER="WITNESS-REQUIRED"');
    expect((rx.match(/VPIO02SID_CONTAINER/g) ?? []).length).toBe(1);                       // declared once, consumed nowhere
    expect(rx).not.toMatch(/VPIO02SID_CONTAINER=""|VPIO02SID_CONTAINER="[0-9A-F]{8}-/);     // never empty, never a manufactured UUID
    expect(rx).toMatch(/vpio-02-sid\)\s+BID="\$VPIO02SID_BID"; PIN_BID="\$VPIO02SID_BID"; PIN_UUID="\$VPIO02SID_UUID";/);
    expect(rx.indexOf('pins-unrecorded')).toBeGreaterThan(-1);
    expect(rx.indexOf('pins-unrecorded')).toBeLessThan(rx.indexOf('device info apps'));
    expect(rx.indexOf('pins-unrecorded')).toBeLessThan(install);
    // ChatGPT Voice takeover 2026-09-16: iOS DAS prewarm can resurrect historical harnesses asynchronously.
    // The SID install path therefore re-reads the process table inside k00-reinstall.sh immediately before the one install verb.
    const jit = rx.indexOf('sid-jit-processes-before-install.txt');
    expect(jit).toBeGreaterThan(rx.indexOf('codesign -dv'));
    expect(jit).toBeLessThan(install);
    expect(rx).toContain('[ "$PIN_BID" = "$VPIO02SID_BID" ]');
    expect(rx).toMatch(/PROC_RC=0; PROCS="\$\(xcrun devicectl device info processes --device "\$DEV" 2>&1\)" \|\| PROC_RC=\$\?/);
    expect(rx).toContain('SID just-in-time harness-zero precondition failed');
    expect(rx.indexOf('SID just-in-time harness-zero precondition failed')).toBeLessThan(install);
    expect((rx.match(/life\.soullab\.voicekernel\.vpio02sid/g) ?? []).length).toBe(1);
    expect(rx).not.toMatch(/K00_EXEC_AUTHORITY[^\n]*(\b(grep|cat|git)\b|==|-f )/);
  });
  it('the ledger self-test passes 34/34, naming the VPIO-02 full trace, the lawful refusal prefixes, out-of-order/missing-seam refusals, and every cross-subject mismatch', () => {
    const out = execFileSync('python3', ['scripts/witness/k00-ledger.py', '--selftest'], { cwd: process.cwd() }).toString('utf8');
    expect(out).toMatch(/selftest: 34\/34 expectations met/);
    for (const line of ['vpio-02 gen-1 listen, full 14-step trace, ioRunning: gen-1 listen',
                        'vpio-02 gen-1 §3 refusal after format_probe_uninitialize_return → recovery: failure then recovery',
                        'vpio-02 gen-1 §3 refusal then degraded (the O6 shape): failure then degradation',
                        'vpio-02 refusal prefix out of order is not the subject: SUBJECT-MISMATCH',
                        'vpio-02 read BEFORE the probe initialize is not the subject: SUBJECT-MISMATCH',
                        'vpio-02 with a missing probe seam is not the subject (never synthesized): SUBJECT-MISMATCH',
                        'engine 13-step journal under --subject vpio-02 is a mismatch: SUBJECT-MISMATCH',
                        'engine 14-step Phase-A journal under --subject vpio-02 is a mismatch (same count, different seams): SUBJECT-MISMATCH',
                        'VPIO-01 full 11-step journal under --subject vpio-02 is a mismatch: SUBJECT-MISMATCH',
                        'VPIO-01 step-4 refusal (the 0/30 shape) under --subject vpio-02 is a mismatch: SUBJECT-MISMATCH',
                        'VPIO-02 full 14-step journal under --subject vpio-01 is a mismatch: SUBJECT-MISMATCH',
                        'VPIO-02 step-7 refusal under --subject vpio-01 is a mismatch: SUBJECT-MISMATCH',
                        'shared-head refusal (3 steps) qualifies under vpio-01 — trace-indistinguishable, custody decides: failure then recovery',
                        'shared-head refusal (3 steps) qualifies under vpio-02 — trace-indistinguishable, custody decides: failure then recovery']) expect(out).toContain(line);
    expect(out).not.toMatch(/^FAIL/m);
  });
  it('corpus partition (founder ruling 2026-09-15; SID custody extension 2026-09-16): every tracked journal carries H (declared subject) and C (physical start-trace signature); vpio-02-sid remains its own custody subject while intentionally sharing the vpio-02 physical trace; disagreement fails closed naming file · header · signature; sets are vpio-02 61 · vpio-02-sid 75 · vpio-01 30 · engine 468; the frozen classifier reproduces every produced ledger under its declared classifier subject; cross-subject reads are SUBJECT-MISMATCH; no directory is named', () => {
    const LEDGER_ROOT = 'docs/programme/VOICE-2026/driver-ledger';
    const all = tracked([`:(glob)${LEDGER_ROOT}/**/kernel00-*.jsonl`]);
    expect(all.length).toBe(634);
    // H — the declared subject: the nearest ledger.md above the journal (written by the batch from its --subject); no ledger ⇒ none (the archive)
    const headerOf = (p: string): { dir: string; subject: string } | null => {
      let d = dirname(p);
      while (d.startsWith(LEDGER_ROOT) && d !== LEDGER_ROOT) {
        const lm = join(process.cwd(), d, 'ledger.md');
        if (existsSync(lm)) { const m = readFileSync(lm, 'utf8').match(/subject=([^\s·|]+)/); return { dir: d, subject: m ? m[1] : 'none' }; }
        d = dirname(d);
      }
      return null;
    };
    // C — the physical subject: the journal's own graph_start_trace steps (format_probe_initialize_begin ⇒ vpio-02; input_format_read without the probe ⇒ vpio-01; else engine)
    const signatureOf = (p: string): string => {
      const steps = new Set<string>();
      for (const line of readFileSync(join(process.cwd(), p), 'utf8').split('\n')) {
        if (!line.includes('"graph_start_trace"')) continue;
        try { const r = JSON.parse(line); if (r.event === 'graph_start_trace' && r.evidence?.step) steps.add(String(r.evidence.step)); } catch { /* not a record */ }
      }
      return steps.has('format_probe_initialize_begin') ? 'vpio-02' : steps.has('input_format_read') ? 'vpio-01' : 'engine';
    };
    const physicalForDeclared = (subject: string | null | undefined): string =>
      subject === 'vpio-02' || subject === 'vpio-02-sid' ? 'vpio-02' : subject === 'vpio-01' ? 'vpio-01' : 'engine';
    const carriers = new Map(all.map((p) => { const h = headerOf(p); return [p, { h, c: signatureOf(p) }]; }));
    const disagreements = all.filter((p) => physicalForDeclared(carriers.get(p)!.h?.subject) !== carriers.get(p)!.c)
      .map((p) => `${p}: header=${carriers.get(p)!.h?.subject ?? 'none'} expectedSignature=${physicalForDeclared(carriers.get(p)!.h?.subject)} signature=${carriers.get(p)!.c}`);
    expect(disagreements).toEqual([]);
    const declaredCorpus = (subject: string) => all.filter((p) => carriers.get(p)!.h?.subject === subject && carriers.get(p)!.c === physicalForDeclared(subject));
    const vpio02 = declaredCorpus('vpio-02'), vpio02sid = declaredCorpus('vpio-02-sid'), vpio01 = declaredCorpus('vpio-01');
    const engine = all.filter((p) => physicalForDeclared(carriers.get(p)!.h?.subject) === 'engine' && carriers.get(p)!.c === 'engine');
    expect([vpio02.length, vpio02sid.length, vpio01.length, engine.length]).toEqual([61, 75, 30, 468]);
    expect(all.filter((p) => carriers.get(p)!.h === null).length).toBe(154);          // the archive: no header, engine by signature
    const classify = (subject: string, files: string[]): Map<string, string> => {
      if (files.length === 0) return new Map();
      const out = execFileSync('python3', ['scripts/witness/k00-ledger.py', '--subject', subject, ...files], { cwd: process.cwd(), maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
      return new Map(out.split('\n').filter(Boolean).map((row) => [row.match(/\(`(kernel00-[^`]+\.jsonl)`\)/)![1], row.match(/\*\*([^*]+)\*\*/)![1]]));
    };
    const classes = (subject: string, files: string[]) => { const m = classify(subject, files); return files.map((p) => m.get(basename(p))!); };
    // historical pins (counts, not membership): VPIO-01 F-W1 30 × degradation; the VPIO-02 corpus 59 × gen-1 listen + 1 × failure then recovery (29+1 · 10 · 10 · 10 · 1)
    expect(classes('vpio-01', vpio01)).toEqual(Array(30).fill('failure then degradation'));
    const c02 = classes('vpio-02', vpio02);
    expect(c02.filter((c) => c === 'gen-1 listen').length).toBe(60);
    expect(c02.filter((c) => c === 'failure then recovery').length).toBe(1);
    // SID is a separate custody subject whose entry classifier is deliberately vpio-02 (declared in the produced ledger).
    const c02sid = classes('vpio-02', vpio02sid);
    expect(c02sid.filter((c) => c === 'gen-1 listen').length).toBe(74);
    expect(c02sid.filter((c) => c === 'failure then degradation').length).toBe(1);
    // cross-subject: structural, both directions; SID also mismatches under vpio-01; engine-era remains closed.
    expect(classes('vpio-01', vpio02)).toEqual(Array(61).fill('SUBJECT-MISMATCH'));
    expect(classes('vpio-01', vpio02sid)).toEqual(Array(75).fill('SUBJECT-MISMATCH'));
    expect(classes('vpio-02', vpio01)).toEqual(Array(30).fill('SUBJECT-MISMATCH'));
    expect(new Set(classes('vpio-02', engine))).toEqual(new Set(['SUBJECT-MISMATCH', 'DRIVER/INFRASTRUCTURE FAILURE']));
    expect(new Set(classes('vpio-01', engine))).toEqual(new Set(['SUBJECT-MISMATCH', 'DRIVER/INFRASTRUCTURE FAILURE']));
    // per-population truth from the produced ledger: for every ledgered directory the frozen classifier, run under the header's subject,
    // reproduces the produced class column row for row (rows without a journal — infrastructure — have nothing to reproduce;
    // journals under not-a-sample/ are present in `all` and named in no row). The one ledger that names a journal in more than one row
    // is the C-D5 listing-flood shape (PRE-AUTH, produced before C-D6); its rows are historical evidence and its only delta from the
    // frozen classifier is the C-D6 gen-1 §3 refusal (one journal, SUBJECT-MISMATCH → failure then degradation), pinned exactly.
    const byDir = new Map<string, string[]>();
    for (const p of all) { const h = carriers.get(p)!.h; if (h) byDir.set(h.dir, [...(byDir.get(h.dir) ?? []), p]); }
    expect(byDir.size).toBe(20);                                                                    // + SID ENTRY-BATCH-05 as its own custody population; archive remains headerless
    const floods: string[] = [];
    for (const [dir, files] of byDir) {
      const declaredSubject = headerOf(files[0])!.subject;
      const subject = declaredSubject === 'vpio-02-sid' ? 'vpio-02' : declaredSubject; // produced ledger's classifierSubject law
      const rows = readFileSync(join(process.cwd(), dir, 'ledger.md'), 'utf8').replace(/\r/g, '').split('\n').filter((l) => /^\| (AUTOMATED|MANUAL)/.test(l))
        .map((l) => ({ file: l.match(/\(`(kernel00-[^`]+\.jsonl)`\)/)?.[1] ?? null, cls: l.match(/\*\*([^*]+)\*\*/)![1] }));
      const named = rows.filter((r): r is { file: string; cls: string } => r.file !== null);
      const present = new Map(files.map((p) => [basename(p), p]));
      const samples = files.filter((p) => !p.includes('/not-a-sample/'));
      for (const r of named) expect(present.has(r.file)).toBe(true);                                        // every ledgered journal is tracked in this directory
      for (const p of files.filter((p) => p.includes('/not-a-sample/'))) expect(named.some((r) => r.file === basename(p))).toBe(false);
      for (const p of samples) expect(named.some((r) => r.file === basename(p))).toBe(true);
      const current = classify(subject, samples);
      const deltas = named.filter((r) => current.get(r.file) !== r.cls).map((r) => `${basename(dir)} ${r.file}: produced=${r.cls} current=${current.get(r.file)}`);
      const perFile = new Map<string, number>(); for (const r of named) perFile.set(r.file, (perFile.get(r.file) ?? 0) + 1);
      if ([...perFile.values()].some((n) => n > 1)) {
        floods.push(dir);
        expect(subject).toBe('p5b0');
        expect(new Set(deltas)).toEqual(new Set([`${basename(dir)} kernel00-K00-faf8fa3e-1789240954.jsonl: produced=SUBJECT-MISMATCH current=failure then degradation`]));
        expect(deltas.length).toBe(10);
      } else {
        expect(deltas).toEqual([]);
      }
    }
    expect(floods.length).toBe(1);
  }, 180_000);
  // ---- K00-05 / K00-06 instrument (founder ruling 2026-09-14, Option C): driver test + batch flags + evidence-only reader; everything else frozen ----
  it('C-D20 (founder ruling 2026-09-14/15): relative to the K00-05/06 instrument 8b111709b the driver test moved (C-D20), the output reader moved (C-D22) and the batch moved (S2, 2026-09-15 — every historical line preserved in order, proven in the S2 block); the entry classifier stays byte-identical; reinstall drift is closed to SID custody + the JIT harness-zero guard', () => {
    expect(histRaw(INSTRUMENT_K0506, 'scripts/witness/k00-ledger.py').equals(readFileSync(join(process.cwd(), 'scripts/witness/k00-ledger.py')))).toBe(true);
    // SOURCE-ID-02 (founder ruling 2026-09-15): the reinstall moves beyond 8b111709b ONLY by the SID custody declarations
    expect(sidOnlyDelta(histRaw(INSTRUMENT_K0506, 'scripts/witness/k00-reinstall.sh').toString('utf8'), readFileSync(join(process.cwd(), 'scripts/witness/k00-reinstall.sh'), 'utf8'), SID_ALLOWED)).toEqual([]);
    expect(histRaw(INSTRUMENT_K0506, 'scripts/witness/k00-driver-batch.sh').equals(readFileSync(join(process.cwd(), 'scripts/witness/k00-driver-batch.sh')))).toBe(false);
    // C-D22 (founder ruling 2026-09-15): the output reader moved beyond 8b111709b in exactly the closed-boundary family rule; pinned below.
    expect(histRaw(INSTRUMENT_K0506, 'scripts/witness/k00-output-ledger.py').equals(readFileSync(join(process.cwd(), 'scripts/witness/k00-output-ledger.py')))).toBe(false);
    expect(histRaw(INSTRUMENT_K0506, 'ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift').equals(readFileSync(join(process.cwd(), 'ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift')))).toBe(false);
  });
  it('K00-05/06 Option C: the entry classifier is byte-identical to the F-W1 instrument 08483cfe4; the reinstall differs from it only by SOURCE-ID-02 custody plus the exact SID JIT harness-zero guard; the frozen organism is ac12dedf4 in history', () => {
    expect(histRaw(INSTRUMENT_VPIO02B, 'scripts/witness/k00-ledger.py').equals(readFileSync(join(process.cwd(), 'scripts/witness/k00-ledger.py')))).toBe(true);
    expect(sidOnlyDelta(histRaw(INSTRUMENT_VPIO02B, 'scripts/witness/k00-reinstall.sh').toString('utf8'), readFileSync(join(process.cwd(), 'scripts/witness/k00-reinstall.sh'), 'utf8'), SID_ALLOWED)).toEqual([]);
  });
  it('K00-05/06 Option C + C-D20: the driver gains exactly testOutputSample with the ruled sequence (wait Play present ≤5 s · else ≤4 bounded reveal swipes with an exact-label check each · hierarchy to the runner log then the SAME driver failure · wait Play enabled ≤5 s · settle · Play · cancel-at · Cancel active if enabled · 1 s · Play · 4.5 s · Export); the three historical tests are byte-identical to 08483cfe4; the app under test still receives nothing', () => {
    const now = W('ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift');
    const was = histRaw(INSTRUMENT_VPIO02B, 'ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift').toString('utf8');
    const fn = (src: string, name: string) => { const m = src.match(new RegExp(`    func ${name}\\(\\) throws \\{[\\s\\S]*?\\n    \\}\\n`)); return m ? m[0] : null; };
    for (const name of ['testOneSample', 'testW4Sample', 'testTerminateOnly']) { expect(fn(was, name)).not.toBeNull(); expect(fn(now, name)).toEqual(fn(was, name)); }
    for (const helper of ['requireCold', 'launchCold', 'setVoiceProcessing', 'exportAndTerminate']) expect(fn(now, helper) ?? now.match(new RegExp(`    private func ${helper}[\\s\\S]*?\\n    \\}\\n`))![0]).toEqual(was.match(new RegExp(`    private func ${helper}[\\s\\S]*?\\n    \\}\\n`))![0]);
    const t = stripComments(now);
    expect((t.match(/func test[A-Za-z0-9]+\(\) throws/g) ?? []).sort()).toEqual(['func testOneSample() throws', 'func testOutputSample() throws', 'func testTerminateOnly() throws', 'func testW4Sample() throws']);
    expect(t).toMatch(/env\["K00_CANCEL_AT_MS"\] \?\? "1000"/); expect(t).toMatch(/env\["K00_SETTLE_S"\] \?\? "2"/);
    const body = t.slice(t.indexOf('func testOutputSample()'), t.indexOf('func testTerminateOnly()'));
    const order = ['requireCold()', 'launchCold()', 'setVoiceProcessing(on: vpOn)', 'tap("Enter conversation", timeout: 5)', 'harness.buttons["Play 3 s tone"]',
                   'play.waitForExistence(timeout: 5)', 'for i in 1...Self.revealSwipeLimit', 'harness.swipeUp()', 'harness.buttons["Play 3 s tone"].exists', 'if revealed { break }',
                   'if !revealed', 'harness.debugDescription', 'K00-HIERARCHY:', "driverFail(\"'Play 3 s tone' not found after Enter", 'waitEnabled(play, timeout: 5)',
                   'ENTRY-NOT-REACHED', 'Thread.sleep(forTimeInterval: settleSeconds)', 'play.tap()', 'TimeInterval(cancelAtMs) / 1000.0', 'harness.buttons["Cancel active"]', 'cancel.exists && cancel.isEnabled',
                   'cancel.tap()', 'NOT-A-CANCEL-ROW', 'Thread.sleep(forTimeInterval: 1.0)', 'waitEnabled(play, timeout: 3)', 'Thread.sleep(forTimeInterval: 4.5)', 'exportAndTerminate()'];
    let at = -1; for (const step of order) { const i = body.indexOf(step, at + 1); expect(i).toBeGreaterThan(at); at = i; }
    expect((body.match(/driverFail\(/g) ?? []).length).toBe(1);                                  // only the missing-button precondition; never an audio outcome
    expect(t).toMatch(/static let revealSwipeLimit = 4\n/);                                       // C-D20: the bound is the ruling (maximum 4 upward swipes)
    expect((body.match(/swipeUp\(\)/g) ?? []).length).toBe(1);                                   // exactly one swipe site, inside the bounded loop; no unbounded search
    expect(body).toMatch(/for i in 1\.\.\.Self\.revealSwipeLimit \{\s*harness\.swipeUp\(\)\s*Thread\.sleep\(forTimeInterval: 0\.5\)\s*revealed = harness\.buttons\["Play 3 s tone"\]\.exists/);
    expect(body).not.toMatch(/swipeDown|swipeLeft|swipeRight|scrollTo|while /);                   // no other scroll gesture, no open-ended loop
    expect(body.indexOf('K00-HIERARCHY:')).toBeLessThan(body.indexOf('driverFail('));           // the hierarchy is written BEFORE the same failure returns
    expect((body.match(/debugDescription/g) ?? []).length).toBe(1);                                // read once, only on the not-revealed path
    const after = body.slice(body.indexOf('guard waitEnabled(play, timeout: 5)'));               // from the unchanged guard onward: byte-for-byte the 8b111709b act
    const wasBody = stripComments(histRaw(INSTRUMENT_K0506, 'ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift').toString('utf8'));
    const wasOut = wasBody.slice(wasBody.indexOf('func testOutputSample()'), wasBody.indexOf('func testTerminateOnly()'));
    expect(after).toEqual(wasOut.slice(wasOut.indexOf('guard waitEnabled(play, timeout: 5)')));
    expect(body).not.toMatch(/XCTFail|XCTAssert/);
    expect(body).not.toMatch(/Voice processing: OFF|Apply faults|Digital-zero|Stall output|Speaker|System default|Leave|Re-enter/);   // no fault, route, VP-off or exit act inside the output act
    expect(t).toMatch(/private func waitEnabled\(_ b: XCUIElement, timeout: TimeInterval\) -> Bool/);
    expect(t).toMatch(/private func note\(_ line: String\) \{\s*NSLog\("%@", line\)\s*\}/);
    expect(t).not.toMatch(/launchArguments|launchEnvironment|UserDefaults|dlopen|NSClassFromString|import AVFoundation|import AudioToolbox|AVAudioSession/);
  });
  it('K00-05/06 Option C: the batch carries --act entry|output · --cancel-at · --settle; without --act output the historical invocation is unchanged (same test, same env, same header line); the output act forwards exactly two runner-env values, refuses --w4, and reads every ledgered journal a second time with the evidence-only reader', () => {
    const b = W('scripts/witness/k00-driver-batch.sh'); const bx = execLines(b);
    const was = execLines(histRaw(INSTRUMENT_VPIO02B, 'scripts/witness/k00-driver-batch.sh').toString('utf8'));
    expect(bx).toContain('ACT=entry; CANCEL_AT=1000; SETTLE=2');
    expect(bx).toMatch(/--act\) ACT="\$2"; shift 2;; --cancel-at\) CANCEL_AT="\$2"; shift 2;; --settle\) SETTLE="\$2"; shift 2;;/);
    expect(bx).toMatch(/case "\$ACT" in entry\|output\) ;; \*\) echo "unknown act '\$ACT' \(entry\|output\); refusing" >&2; exit 2;; esac/);
    expect(bx).toMatch(/if \[ "\$ACT" = output \] && \[ -n "\$W4" \]; then[^\n]*exit 2; fi/);
    expect(bx).toContain('TEST="$([ -n "$W4" ] && echo testW4Sample || echo testOneSample)"');                    // historical selection first, untouched
    expect(bx).toMatch(/if \[ "\$ACT" = output \]; then TEST=testOutputSample; OUTPUT_LEDGER="\$LEDGER_DIR\/output-ledger\.md"; OUTPUT_ENV="TEST_RUNNER_K00_CANCEL_AT_MS=\$CANCEL_AT TEST_RUNNER_K00_SETTLE_S=\$SETTLE"; fi/);
    expect(bx).toContain('OUTPUT_LEDGER=""; OUTPUT_ENV=""');                                                                 // empty under the historical act
    expect(bx).toMatch(/env \$OUTPUT_ENV TEST_RUNNER_K00_MODE="\$MODE" TEST_RUNNER_K00_VP="\$VP" TEST_RUNNER_K00_HOLD_S="\$HOLD" TEST_RUNNER_K00_W4_MS="\$\{W4:-500\}" TEST_RUNNER_K00_SUBJECT="\$SUBJECT"/);
    expect((bx.match(/TEST_RUNNER_K00_CANCEL_AT_MS/g) ?? []).length).toBe(1);                                              // set in one place, only under output
    const header = 'echo "stratum=$LABEL · N=$N · vp=$VP · mode=$MODE · hold=${HOLD}s · w4=${W4:-off} · subject=$SUBJECT · bundle=$BID · device=$DEV · xcodeDest=$XDEST"';
    expect(bx).toContain(header); expect(was).toContain(header);                                                              // the historical header line is verbatim
    // SOURCE-ID-02 (founder ruling 2026-09-15): a second header line declares the classifier subject when it differs (declared custody ≠ trace subject)
    expect(bx).toContain('[ "$CLASSIFIER_SUBJECT" != "$SUBJECT" ] && echo "classifierSubject=$CLASSIFIER_SUBJECT');
    expect(bx).toMatch(/\[ "\$ACT" = output \] && echo "act=output · cancelAt=\$\{CANCEL_AT\}ms · settle=\$\{SETTLE\}s/);
    const ledgerCallWas = 'python3 "$ROOT/scripts/witness/k00-ledger.py" --stratum "$LABEL" --index "$i" --mode "$MODE" --subject "$SUBJECT" $([ -n "$W4" ] && echo --w4) "$LEDGER_DIR/journals/$f" >> "$LEDGER"';
    // SOURCE-ID-02: the one ruled substitution on the entry-classifier line — the FROZEN classifier receives the trace-compatible
    // subject (vpio-02 for vpio-02-sid); for every historical subject CLASSIFIER_SUBJECT == SUBJECT and the row is produced exactly as before
    const ledgerCall = ledgerCallWas.replace('--subject "$SUBJECT"', '--subject "$CLASSIFIER_SUBJECT"');
    expect(was).toContain(ledgerCallWas); expect(bx).toContain(ledgerCall); expect(bx).not.toContain(ledgerCallWas);
    const outCall = bx.indexOf('k00-output-ledger.py" --stratum'); const guard = bx.indexOf('if [ -n "$OUTPUT_LEDGER" ]; then');
    expect(guard).toBeGreaterThan(-1); expect(outCall).toBeGreaterThan(guard); expect(outCall).toBeGreaterThan(bx.indexOf(ledgerCall));
    expect((bx.match(/python3 "\$ROOT\/scripts\/witness\/k00-output-ledger\.py"/g) ?? []).length).toBe(2);              // --header once, one row-call once, both inside the guard
    expect(bx).not.toMatch(/install app|uninstall|k00-reinstall/);
    for (const line of was.split('\n').filter((l) => /devicectl|xcodebuild/.test(l))) expect(bx).toContain(line.replace(/^\s+TEST_RUNNER_K00_MODE=/, 'env $OUTPUT_ENV TEST_RUNNER_K00_MODE='));   // every device/xcodebuild line survives (the env prefix is the one edit)
  });
  it('K00-05/06 Option C: the output reader is evidence-only — closed verdict vocabulary, ratified 100 ms and the 0.90 witness criterion as named constants, no subprocess/device/xcodebuild, no journal write, no import of the entry classifier; --selftest 33/33 naming the founder’s twelve offline cases; every real VPIO journal yields no PASS and no FAIL', () => {
    const r = W(OUTPUT_READER);
    expect(r).toContain('CANCEL_WINDOW_MS = 100'); expect(r).toContain('GAP_FRACTION = 0.90');
    expect(r).not.toMatch(/subprocess|devicectl|xcodebuild|xcrun|os\.system|import k00|k00_ledger|open\([^)]*['"]w/);
    for (const v of ['PASS-05', 'FAIL-05', 'NOT-A-CANCEL-ROW', 'NO-COMPLETION-ROW', 'NON-EVIDENCE', 'INCOMPLETE-05', 'NO-OUTPUT', 'PASS-06', 'FAIL-06', 'CHARACTERIZE-06', 'UNMEASURED-06', 'INVALID', 'EN-ROW', 'DESCRIPTIVE']) expect(r).toContain(`'${v}'`);
    const out = execFileSync('python3', [OUTPUT_READER, '--selftest'], { cwd: process.cwd() }).toString('utf8');
    expect(out).toMatch(/selftest: 35\/35 expectations met/); expect(out).not.toMatch(/^FAIL/m);   // C-D22: +1 case, +2 expectations
    for (const line of ['cancel with framesRendered > 0 but no pre-cancel sample → admissible: k05_cancel=PASS-05',
                        'cancel > 100 ms → FAIL-05: k05_cancel=FAIL-05',
                        'handle mismatch → FAIL-05: k05_cancel=FAIL-05',
                        'completion frame mismatch → FAIL-05: k05_complete=FAIL-05',
                        'completion latency > 3.15 s alone → descriptive, NOT FAIL: k05_complete=PASS-05',
                        'one transient digital-zero callback → NOT collapse: k06=CHARACTERIZE-06',
                        'partial-zero full window → CHARACTERIZE: k06=CHARACTERIZE-06',
                        'all-zero full window → FAIL-06: k06=FAIL-06',
                        'callback rate < 90 % baseline → FAIL-06: k06=FAIL-06',
                        'missing coupling record → FAIL-06: k06=FAIL-06',
                        'synthetic/faulted row → INVALID: k05_cancel=INVALID',
                        'entry not reached → EN-ROW: k05_cancel=EN-ROW',
                        'F-W1 shape (listening, no Play) → NO-OUTPUT / UNMEASURED-06, never PASS or FAIL',
                        'foreign input_dead during the cancelled stream → NON-EVIDENCE for K00-05, never automatic FAIL: k05_cancel=NON-EVIDENCE']) expect(out).toContain(line);
    const outputLedgers = execFileSync('git', ['ls-files', 'docs/programme/VOICE-2026/driver-ledger'], { cwd: process.cwd() }).toString('utf8').split('\n').filter((p) => p.endsWith('/ledger.md'));
    const ledgerText = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
    const exactSubject = (p: string) => ledgerText(p).match(/\bsubject=([^\s·|]+)/)?.[1] ?? '';
    const batchLabel = (p: string) => ledgerText(p).match(/^# DRIVER-01 batch — ([^—\n]+) — /m)?.[1].trim() ?? '';
    const outputDirs = outputLedgers.filter((p) => ['VPIO-01', 'VPIO-02'].includes(batchLabel(p))).map((p) => p.replace(/ledger\.md$/, 'journals'));
    const sidEntryDirs = outputLedgers.filter((p) => exactSubject(p) === 'vpio-02-sid').map((p) => p.replace(/ledger\.md$/, 'journals'));
    const journals = outputDirs.flatMap((d) => execFileSync('git', ['ls-files', d], { cwd: process.cwd() }).toString('utf8').split('\n').filter((f) => f.endsWith('.jsonl') && !f.includes('not-a-sample')));
    const sidEntryJournals = sidEntryDirs.flatMap((d) => execFileSync('git', ['ls-files', d], { cwd: process.cwd() }).toString('utf8').split('\n').filter((f) => f.endsWith('.jsonl') && !f.includes('not-a-sample')));
    expect(journals.length).toBe(60);
    expect(sidEntryJournals.length).toBe(75); // ENTRY evidence is intentionally outside K00-05/06 output interpretation.
    const rows = execFileSync('python3', [OUTPUT_READER, '--subject', 'vpio-02', ...journals], { cwd: process.cwd(), maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
    expect(rows).not.toMatch(/\*\*(PASS|FAIL)-0[56]\*\*/);
    expect((rows.match(/\*\*NO-OUTPUT\*\*/g) ?? []).length).toBe(60); expect((rows.match(/\*\*EN-ROW\*\*/g) ?? []).length).toBe(120);
  });
  it('C-D22 (founder ruling 2026-09-15, offline only): a full input window ending at the EXACT ms of its stream_complete satisfies the output-family presence rule; exact equality only; thresholds, the 0.90 criterion, digital-zero and input_dead rules and the full-window definition unchanged; the synthetic boundary case FAILS on 8b111709b and PASSES now; corpus replay changes exactly the S1 row-1 K00-06 verdict', () => {
    const r = W(OUTPUT_READER);
    expect(r).toMatch(/completion_ends = \{t\(st\['end'\]\) for st in streams if st\['end'\] and st\['end'\]\['event'\] == 'stream_complete'\}/);
    expect(r).toMatch(/if not any\(abs\(t\(o\) - t\(r\)\) <= OUTPUT_FAMILY_TOLERANCE_MS for o in outs\) and t\(r\) not in completion_ends:/);
    expect(r).toContain('CANCEL_WINDOW_MS = 100'); expect(r).toContain('GAP_FRACTION = 0.90'); expect(r).toContain('OUTPUT_FAMILY_TOLERANCE_MS = 250');
    expect(r).toMatch(/full = \[r for r in samples if any\(i0 <= window\(r\)\[0\] and window\(r\)\[1\] <= i1 for i0, i1, _ in intervals\)\]/);   // full-window definition unchanged
    expect(r).toContain("build(boundary_complete=True), {'k06': 'PASS-06', 'k05_complete': 'PASS-05'}");
    const was = histRaw(INSTRUMENT_K0506, OUTPUT_READER).toString('utf8');
    expect(was).not.toContain('completion_ends');
    // corpus replay: the produced VP-ON ledger (K00-0506-20260915T004738Z) is reproduced byte-identically; the S1 ledger differs in exactly row 1 K00-06 (FAIL-06 → PASS-06)
    const rowsOf = (dir: string) => {
      const led = readFileSync(join(process.cwd(), 'docs/programme/VOICE-2026/driver-ledger', dir, 'ledger.md'), 'utf8');
      const files = [...new Set([...led.matchAll(/kernel00-K00-[0-9a-f]+-\d+\.jsonl/g)].map((m) => m[0]))];
      const out: string[] = [];
      files.forEach((f, k) => out.push(...execFileSync('python3', [OUTPUT_READER, '--stratum', 'AUTOMATED-COLD-LAUNCH', '--index', String(k + 1), '--subject', 'vpio-02', join('docs/programme/VOICE-2026/driver-ledger', dir, 'journals', f)], { cwd: process.cwd() }).toString('utf8').split('\n').filter((l) => l.startsWith('| AUTOMATED'))));
      const produced = readFileSync(join(process.cwd(), 'docs/programme/VOICE-2026/driver-ledger', dir, 'output-ledger.md'), 'utf8').split('\n').map((l) => l.replace(/\r/g, '')).filter((l) => l.startsWith('| AUTOMATED') && !l.includes('DRIVER-MARKER'));
      return { out, produced };
    };
    const on = rowsOf('K00-0506-20260915T004738Z'); expect(on.out).toEqual(on.produced);
    const s1 = rowsOf('K00-0506-VPOFF-20260915T012817Z');
    const diff = s1.produced.map((l, k) => [l, s1.out[k]]).filter(([a, b]) => a !== b);
    expect(diff.length).toBe(1);
    expect(diff[0][0]).toMatch(/\| 1 \| K00-06 `K00-558df5b2` \| \*\*FAIL-06\*\* \|.*output-health family absent beside the input window at t=1037764041/);
    expect(diff[0][1]).toMatch(/\| 1 \| K00-06 `K00-558df5b2` \| \*\*PASS-06\*\* \|/);
  });
  it('S2 design (founder ruling 2026-09-15): the Mac playback-capability probe is DISCOVERY ONLY — help/man/listings with stdin closed; never executes say; no audio file, no volume change, no device selection; C-D11 filename shift; capture-time manifest + seal', () => {
    const pp = readFileSync(join(process.cwd(), PLAYBACK_PROBE), 'utf8');
    const ppExec = pp.split('\n').filter((l) => !/^\s*(#|echo\b|\{?\s*echo\b)/.test(l)).join('\n');
    expect(pp).toMatch(/local f="\$1"; shift/);
    expect(pp).toMatch(/"\$@" <\/dev\/null; echo "\[rc=\$\?\]"/);                       // every tool invocation has stdin closed
    expect(ppExec).not.toMatch(/^\s*(capture [^ ]+ |helpflag )?say\b/m);                   // say is never executed (only `command -v say` / man)
    expect(ppExec).not.toMatch(/\.(wav|aiff?|caf|mp3|m4a|flac)\b/i);                         // no audio file is named, created or played
    expect(ppExec).not.toMatch(/set volume|SwitchAudioSource -s|osascript -e '(set|tell)/);    // nothing changed or selected
    expect(ppExec).not.toMatch(/\b(afplay|ffplay|mpv|sox|play) [^-\n>]*\//);                    // no player receives a path (a `>/dev/null` redirect is not an argument)
    expect(ppExec).not.toMatch(/devicectl|xcodebuild|k00-driver-batch/);                         // no device act, no batch
    expect(pp).toContain('capture audio-devices.txt system_profiler SPAudioDataType');
    expect(pp).toContain("capture output-volume-read.txt osascript -e 'get volume settings'");
    expect(pp).toMatch(/"soundPlayed":False/); expect(pp).toMatch(/SEAL\.sha256/);
  });
});

// ---- S2 batch-only orchestration (founder ruling 2026-09-15): stimulus custody around the run_test seam; the gate never executes a player ----
describe('KERNEL-00 · S2 batch-only orchestration (founder ruling 2026-09-15) — a SHA-pinned 997 Hz fixture played by a SHA-pinned /usr/bin/afplay around the run_test seam; read-only Mac output preflight; closed --stimulus token; organism · driver · readers · reinstall frozen; the historical batch path is byte-preserved', () => {
  const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
  const execLines = (s: string) => s.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
  const tracked = (paths: string[]) => execFileSync('git', ['ls-files', '--', ...paths], { cwd: process.cwd() }).toString('utf8').split('\n').filter(Boolean).sort();
  const BATCH = 'scripts/witness/k00-driver-batch.sh';
  const FIXTURE = 'scripts/witness/fixtures/k00-s2-nearend-997hz-180s.wav';
  const SIDECAR = FIXTURE + '.sha256';
  const S2_STIMULUS_SHA256 = '1a505b3d38a97b75cb935f85bd33deb889628322e558f74af9a5f05afbfbd00e';   // pinned once; must equal the sidecar, the batch and the file
  const S2_AFPLAY_SHA256 = '88f3b577790877524edc79a20de8838a019c0ca723a0eaa4a8612a860317cabb';     // the playback census's /usr/bin/afplay (playback-probe-20260915T020250Z)
  const INSTRUMENT_K0506 = '8b111709b6e5010b4b6ee7281d257141945276ff';                            // the batch's last frozen state (K00-05/06 Option C)
  const INSTRUMENT_CD20 = '83a382a1455161996d499f30cbf00504bbd0332a';                             // the driver's frozen state (C-D20)
  const INSTRUMENT_VPIO02B = '08483cfe4f6c3e98198805337ced99bae92ce911';                          // entry classifier + reinstall frozen state
  const OUTPUT_READER_CD22 = 'b2a18e4845e9692c820c25ca8e41f61b741ff1ba';                          // output reader's frozen state (C-D22)
  const fn = (bx: string, name: string) => { const a = bx.indexOf(`${name}(){`); expect(a).toBeGreaterThan(-1); const b = bx.indexOf('\n}\n', a); return bx.slice(a, b + 3); };
  it('S2 stimulus fixture: tracked WAV is exactly PCM16 · mono · 48 000 Hz · 8 640 000 frames (180.000 s) · a continuous 997 Hz sine at peak 0.20 FS with no fade; its SHA-256 equals the sidecar, the batch pin and this gate\'s pin (file name alone is not custody)', () => {
    const buf = readFileSync(join(process.cwd(), FIXTURE));
    expect(buf.toString('ascii', 0, 4)).toBe('RIFF'); expect(buf.toString('ascii', 8, 12)).toBe('WAVE');
    let off = 12; let fmt: Record<string, number> | null = null; let dataOff = -1; let dataLen = -1;
    while (off + 8 <= buf.length) {
      const id = buf.toString('ascii', off, off + 4); const len = buf.readUInt32LE(off + 4);
      if (id === 'fmt ') fmt = { format: buf.readUInt16LE(off + 8), channels: buf.readUInt16LE(off + 10), rate: buf.readUInt32LE(off + 12), bits: buf.readUInt16LE(off + 22) };
      if (id === 'data') { dataOff = off + 8; dataLen = len; }
      off += 8 + len + (len & 1);
    }
    expect(fmt).toEqual({ format: 1, channels: 1, rate: 48000, bits: 16 });
    expect(dataLen).toBe(17_280_000); expect(dataOff + dataLen).toBe(buf.length);
    const frames = dataLen / 2; expect(frames).toBe(8_640_000);
    const peak = Math.round(0.20 * 32767); expect(peak).toBe(6553);
    let max = 0, min = 0, crossings = 0, prev = 0, worst = 0;
    for (let i = 0; i < frames; i++) {
      const v = buf.readInt16LE(dataOff + 2 * i);
      if (v > max) max = v; if (v < min) min = v;
      if (i < 48000) { if (i > 0 && ((prev < 0 && v >= 0) || (prev >= 0 && v < 0))) crossings++; prev = v; }
      if (i < 48000) { const d = Math.abs(v - Math.round(peak * Math.sin(2 * Math.PI * 997 * i / 48000))); if (d > worst) worst = d; }
    }
    expect(max).toBe(peak); expect(min).toBe(-peak);                       // full-file peak exactly ±0.20 FS: no fade, no clipping, no silence-only file
    expect(crossings).toBeGreaterThanOrEqual(1992); expect(crossings).toBeLessThanOrEqual(1996);   // 2 × 997 crossings in the first second
    expect(worst).toBeLessThanOrEqual(1);                                   // first second matches the 997 Hz sine to 1 LSB
    const last = buf.readInt16LE(dataOff + 2 * (frames - 1)); expect(Math.abs(last - Math.round(peak * Math.sin(2 * Math.PI * 997 * (frames - 1) / 48000)))).toBeLessThanOrEqual(1);
    const sha = createHash('sha256').update(buf).digest('hex');
    expect(sha).toBe(S2_STIMULUS_SHA256);
    expect(W(SIDECAR)).toBe(`${S2_STIMULUS_SHA256}  k00-s2-nearend-997hz-180s.wav\n`);
    expect(execLines(W(BATCH))).toContain(`S2_STIMULUS_SHA256="${S2_STIMULUS_SHA256}"`);
    expect(S2_STIMULUS_SHA256).toMatch(/^[0-9a-f]{64}$/);                  // no placeholder hash may land
  });
  it('S2 player: /usr/bin/afplay is SHA-pinned to the playback census value; the ONE invocation is verbatim `/usr/bin/afplay -v 0.50 -t 180 "$S2_STIMULUS"`, lives only inside stimulus_start, and the recorded -v / -t constants equal it', () => {
    const bx = execLines(W(BATCH));
    const census = W('docs/programme/VOICE-2026/driver-ledger/playback-probe-20260915T020250Z/shasum-afplay.txt');
    expect(census).toContain(`${S2_AFPLAY_SHA256}  /usr/bin/afplay`);
    expect(bx).toContain('S2_AFPLAY="/usr/bin/afplay"'); expect(bx).toContain(`S2_AFPLAY_SHA256="${S2_AFPLAY_SHA256}"`);
    expect(bx).toContain('S2_AFPLAY_VOLUME="0.50"'); expect(bx).toContain('S2_AFPLAY_SECONDS="180"');
    const inv = bx.match(/^\s*\/usr\/bin\/afplay -v 0\.50 -t 180 "\$S2_STIMULUS" <\/dev\/null > "\$LEDGER_DIR\/stimulus-sample-\$1-afplay\.log" 2>&1 &$/gm) ?? [];
    expect(inv.length).toBe(1);
    expect((bx.match(/afplay -v/g) ?? []).length).toBe(1);                 // no second player invocation anywhere
    expect(fn(bx, 'stimulus_start')).toContain(inv[0].trim());
    expect(bx).not.toMatch(/\bsay\b|ffplay|mpv|sox\b|\bplay\b/);
  });
  it('S2 preflight fails closed, read-only, BEFORE sample 1: fixture present + SHA = pin + exact WAV format → exactly one default output = Mac Studio Speakers (coreaudio_device_type_builtin) → output volume 69 · muted false → afplay executable + SHA = pin; every clause STOPs (return 1 → exit 8) and nothing is played or changed', () => {
    const bx = execLines(W(BATCH)); const pf = fn(bx, 'stimulus_preflight');
    for (const c of ['S2_OUTPUT_DEVICE="Mac Studio Speakers"', 'S2_OUTPUT_TRANSPORT="coreaudio_device_type_builtin"', 'S2_OUTPUT_VOLUME="69"', 'S2_OUTPUT_MUTED="false"']) expect(bx).toContain(c);
    const order = ['[ -f "$S2_STIMULUS" ] ||', 'shasum -a 256 "$S2_STIMULUS" >', '= "$S2_STIMULUS_SHA256" ] ||', '(1, 48000, 2, 8640000)', 'system_profiler SPAudioDataType -json >', 'len(defaults) == 1', "osascript -e 'get volume settings' >",
                   '"output volume:$S2_OUTPUT_VOLUME,"', '"output muted:$S2_OUTPUT_MUTED"', '[ -x "$S2_AFPLAY" ] ||', 'shasum -a 256 "$S2_AFPLAY" >', '= "$S2_AFPLAY_SHA256" ] ||', 'log "stimulus preflight PASS'];
    let last = -1; for (const o of order) { const i = pf.indexOf(o); expect(i).toBeGreaterThan(last); last = i; }
    expect((pf.match(/\|\| \{ log "STOP: [^\n]*return 1; \}/g) ?? []).length).toBeGreaterThanOrEqual(10);
    expect(pf).not.toMatch(/afplay -v|kill|set volume/);                    // the preflight reads; it never plays, signals or sets
    const main = 'stimulus_preflight || { log "STOP: stimulus preflight failed — nothing played, nothing sampled"; exit 8; }';
    expect(bx).toContain(main);
    expect(bx.indexOf(main)).toBeGreaterThan(bx.indexOf('XCTESTRUN="$(ls -t'));   // after the driver build (nothing about the phone is touched by it)
    expect(bx.indexOf(main)).toBeLessThan(bx.indexOf('for i in $(seq 1 "$N"); do'));   // before sample 1
    expect(bx.indexOf(main)).toBeLessThan(bx.indexOf('stimulus_start "$i"'));            // before any player start
  });
  it('no S2 code sets system volume, selects an output device, disconnects Bluetooth, installs a utility or repairs state: osascript only ever reads `get volume settings`; system_profiler only reads SPAudioDataType; no set-volume / SwitchAudioSource / blueutil / defaults-write / sudo anywhere in the batch', () => {
    const bx = execLines(W(BATCH));
    expect(bx).not.toMatch(/set volume|SwitchAudioSource|blueutil|defaults write|--remove-existing-content|networksetup|\bsudo\b|killall|kill -9/);
    for (const l of bx.split('\n').filter((l) => l.includes('osascript'))) expect(l).toContain("osascript -e 'get volume settings'");
    for (const l of bx.split('\n').filter((l) => l.includes('system_profiler'))) expect(l).toContain('system_profiler SPAudioDataType -json');
    expect((bx.match(/osascript -e 'get volume settings' > /g) ?? []).length).toBe(1); expect((bx.match(/system_profiler SPAudioDataType -json > /g) ?? []).length).toBe(1);   // one read each; other mentions are STOP messages
  });
  it('--stimulus is closed: the only token is s2-nearend, resolved internally to the tracked fixture path; no command-line path is accepted; lawful only with --act output · --vp on · --mode L · --subject vpio-02, refused before any lock, build or playback; $STIMULUS is never used as a path', () => {
    const bx = execLines(W(BATCH));
    expect(bx).toContain('STIMULUS=""; S2_PID=""; S2_MON=""');
    expect(bx).toContain('  --stimulus) STIMULUS="$2"; shift 2;;');
    // SOURCE-ID-02A (founder ruling 2026-09-15, defect 1): ONE closed dispatch — exactly two lawful pairings, each guarded on its own
    // branch BEFORE the catch-all; the SOURCE-ID-02 draft's two-stage parser (a catch-all refusal ahead of the SID branch) is forbidden.
    const caseLine = 'case "$STIMULUS" in "") ;;';
    const s2Branch = 's2-nearend)        [ "$SUBJECT" = vpio-02 ]     || {';
    const sidBranch = 'sid-nearend-gated) [ "$SUBJECT" = vpio-02-sid ] || {';
    const catchAll = `*) echo "unknown stimulus '$STIMULUS' (lawful pairings: s2-nearend with --subject vpio-02 · sid-nearend-gated with --subject vpio-02-sid; no path is accepted); refusing" >&2; exit 2;;`;
    expect((bx.match(/case "\$STIMULUS" in/g) ?? []).length).toBe(1);                                  // one dispatch, never two
    const dispatch = bx.slice(bx.indexOf(caseLine), bx.indexOf('\nesac', bx.indexOf(caseLine)));
    expect(dispatch).toContain(s2Branch); expect(dispatch).toContain(sidBranch); expect(dispatch).toContain(catchAll);
    expect(dispatch.indexOf(s2Branch)).toBeLessThan(dispatch.indexOf(catchAll)); expect(dispatch.indexOf(sidBranch)).toBeLessThan(dispatch.indexOf(catchAll));
    expect(dispatch).not.toMatch(/s2-nearend\) ;;/);                                                    // no unguarded admission
    expect(bx).not.toContain('the only token is s2-nearend');
    // SOURCE-ID-02 (founder ruling 2026-09-15): a second closed token (sid-nearend-gated) lawful only with vpio-02-sid; s2-nearend stays
    // lawful only with vpio-02 (the stationary S-a arm is NOT OPEN on the SID subject); the shared guard admits the two subjects only.
    const guard = 'if [ -n "$STIMULUS" ] && { [ "$ACT" != output ] || [ "$VP" != on ] || [ "$MODE" != L ] || { [ "$SUBJECT" != vpio-02 ] && [ "$SUBJECT" != vpio-02-sid ]; }; }; then';
    expect(bx.indexOf(caseLine)).toBeLessThan(bx.indexOf('exec 9>"$LOCK"'));                         // dispatch precedes the device lock
    expect(bx).toContain('S2_STIMULUS="$ROOT/scripts/witness/fixtures/k00-sid-nearend-997hz-gated-2hz-180s.wav"');
    expect(bx).toContain(caseLine); expect(bx).toContain(guard);
    expect(bx.indexOf(caseLine)).toBeLessThan(bx.indexOf('exec 9>"$LOCK"'));       // refused before the device lock
    expect(bx.indexOf(guard)).toBeLessThan(bx.indexOf('exec 9>"$LOCK"'));
    expect(bx).toContain('S2_STIMULUS="$ROOT/scripts/witness/fixtures/k00-s2-nearend-997hz-180s.wav"');
    const uses = bx.split('\n').filter((l) => l.includes('$STIMULUS'));
    for (const l of uses) expect(l).toMatch(/^(case "\$STIMULUS" in|\s+\*\) echo "unknown stimulus '\$STIMULUS'|if \[ "\$STIMULUS" = sid-nearend-gated \]; then|SOURCE_LEDGER=""; \[ "\$STIMULUS" = sid-nearend-gated \]|if \[ -n "\$STIMULUS" \] && \{|\s+echo "--stimulus \$STIMULUS is lawful only|\s+\[ -n "\$STIMULUS" \] && echo "stimulus=\$STIMULUS|if \[ -n "\$STIMULUS" \]; then|\s+if \[ -n "\$STIMULUS" \]; then)/);
    expect(bx).not.toMatch(/\/\$STIMULUS|-f "\$STIMULUS"|afplay[^\n]*\$STIMULUS[^_]/);
  });
  it('stimulus lifetime per sample: start → record PID/epoch → 1 s settle → prove alive & non-zombie (else infrastructure abort, exit 9, no identical rows) → 1 s liveness monitor throughout run_test → run_test → post-run state → explicit TERM → wait that exact child → exit status → custody VALID|INVALID; the -t 180 ceiling is the failsafe, not the stop', () => {
    const bx = execLines(W(BATCH));
    const loop = bx.slice(bx.indexOf('for i in $(seq 1 "$N"); do'), bx.lastIndexOf('\ndone'));
    const iStart = loop.indexOf('stimulus_start "$i"'), iRun = loop.indexOf('run_test "$TEST"'), iStop = loop.indexOf('stimulus_stop "$i"');
    expect(iStart).toBeGreaterThan(loop.indexOf('daemon_snapshot "$i" before'));                 // after the ordinary cold precondition
    expect(iStart).toBeLessThan(iRun); expect(iRun).toBeLessThan(iStop);
    expect(loop.slice(iRun, iStop)).not.toMatch(/continue|exit/);                               // nothing can skip the stop between run_test and stimulus_stop
    expect(loop).toMatch(/stimulus_start "\$i" \|\| \{ echo "\| \$LABEL \| \$i \| \$MODE \| — \| — \| — \| \*\*DRIVER\/INFRASTRUCTURE FAILURE\*\* \| stimulus player not alive before the phone invocation[^\n]*exit 9; \}/);
    const st = fn(bx, 'stimulus_start');
    for (const [a, b] of [['S2_PID=$!', "printf 'pid\\t%s\\nstartEpoch"], ["printf 'pid\\t%s\\nstartEpoch", 'sleep 1'], ['sleep 1', 'preRunState'], ['preRunState', '[ "$st" != alive ]'], ['[ "$st" != alive ]', 'while :; do sleep 1; printf \'liveness']]) expect(st.indexOf(a)).toBeLessThan(st.indexOf(b));
    expect(st).toContain('S2_MON=$!');
    const sp = fn(bx, 'stimulus_stop');
    for (const [a, b] of [['kill "$S2_MON"', 'postRunState'], ['postRunState', 'stopRequestedEpoch'], ['stopRequestedEpoch', 'kill -TERM "$S2_PID"'], ['kill -TERM "$S2_PID"', 'wait "$S2_PID"'], ['wait "$S2_PID"', 'waitExitStatus'], ['waitExitStatus', "custody\\tVALID"], ["custody\\tVALID", "custody\\tINVALID"]]) expect(sp.indexOf(a)).toBeLessThan(sp.indexOf(b));
    expect(sp).toMatch(/if \[ "\$st" = alive \] && \[ "\$\{died:-0\}" -eq 0 \]; then printf 'custody\\tVALID\\n'/);
    const as = fn(bx, 'afplay_state'); expect(as).toContain('ps -o stat= -p'); expect(as).toContain('*Z*) echo zombie'); expect(as).toContain('*afplay*) echo alive'); expect(as).not.toMatch(/kill/);
    expect(bx).toContain("trap 'if [ -n \"${S2_PID:-}\" ]; then kill -TERM \"$S2_PID\" 2>/dev/null; fi; exit 130' INT TERM");   // signals only; the EXIT trap (lock dir) is untouched
  });
  it('stimulus invalidity can never become a physiological verdict: custody is written only to stimulus-sample-N.tsv / stimulus-preflight/; both reader invocations are byte-identical to 8b111709b and receive nothing about the stimulus; k00-ledger.py · k00-output-ledger.py · the driver tree are byte-frozen; reinstall drift is closed to SID custody + JIT guard', () => {
    const now = execLines(W(BATCH)); const was = execLines(histRaw(INSTRUMENT_K0506, BATCH).toString('utf8'));
    const readerLines = (s: string) => s.split('\n').filter((l) => /k00-(output-)?ledger\.py" --/.test(l));
    // SOURCE-ID-02: the entry-classifier row line carries the one ruled substitution ($CLASSIFIER_SUBJECT); otherwise verbatim
    expect(readerLines(now).map((l) => l.replace('--subject "$CLASSIFIER_SUBJECT"', '--subject "$SUBJECT"'))).toEqual(readerLines(was)); expect(readerLines(now).length).toBe(4);
    for (const l of now.split('\n').filter((l) => l.includes('python3 "$ROOT/scripts/witness/k00-'))) expect(l).not.toMatch(/custody|STIMULUS|S2_|afplay/);   // reader invocations carry nothing about the stimulus
    for (const l of now.split('\n').filter((l) => l.includes("custody\\t"))) expect(l).toContain('>> "$t"');
    expect(now).toContain('local t="$LEDGER_DIR/stimulus-sample-$1.tsv"');
    expect(histRaw(INSTRUMENT_VPIO02B, 'scripts/witness/k00-ledger.py').equals(readFileSync(join(process.cwd(), 'scripts/witness/k00-ledger.py')))).toBe(true);
    expect(sidOnlyDelta(histRaw(INSTRUMENT_VPIO02B, 'scripts/witness/k00-reinstall.sh').toString('utf8'), readFileSync(join(process.cwd(), 'scripts/witness/k00-reinstall.sh'), 'utf8'), SID_ALLOWED)).toEqual([]);
    expect(histRaw(OUTPUT_READER_CD22, 'scripts/witness/k00-output-ledger.py').equals(readFileSync(join(process.cwd(), 'scripts/witness/k00-output-ledger.py')))).toBe(true);
    const driver = histList(INSTRUMENT_CD20, ['ios/VoiceKernelDriver']).sort();
    expect(tracked(['ios/VoiceKernelDriver'])).toEqual(driver);
    // SOURCE-ID-02: the driver moves beyond C-D20 only by the SID subject row and the two closed-set strings (the app under test still receives nothing)
    for (const p of driver) {
      if (p.endsWith('K00DriverTests.swift')) expect(sidOnlyDelta(histRaw(INSTRUMENT_CD20, p).toString('utf8'), readFileSync(join(process.cwd(), p), 'utf8'), SID_ALLOWED)).toEqual([]);
      else expect(histRaw(INSTRUMENT_CD20, p).equals(readFileSync(join(process.cwd(), p)))).toBe(true);
    }
  });
  it('SID ENTRY never waits out or repairs a nonzero harness set: the adjacent JIT read is the only SID ENTRY process precondition', () => {
    const b = execLines(W(BATCH));
    expect(b).not.toContain('sid_entry_wait_for_zero');
    expect(b).not.toMatch(/natural-zero window|prewarm-wait|sleep 5/);
    const loopStart = b.indexOf('for i in $(seq 1 "$N"); do');
    const sidBranch = b.indexOf('if [ "$SUBJECT" = vpio-02-sid ] && [ "$ACT" = entry ]; then', loopStart);
    const historicalCleanup = b.indexOf('elif harness_present; then', sidBranch);
    expect(sidBranch).toBeGreaterThan(loopStart); expect(historicalCleanup).toBeGreaterThan(sidBranch);
    const sidPre = b.slice(sidBranch, historicalCleanup);
    expect(sidPre).toContain('No cleanup path is entered here');
    expect(sidPre).not.toMatch(/testTerminateOnly|sleep|terminate|signal/);
  });
  it('SID ENTRY every sample has one adjacent fail-closed full process-set read; any nonzero/unreadable set is preserved and STOPs before launch with no cleanup', () => {
    const b = execLines(W(BATCH));
    const guardFn = fn(b, 'sid_entry_jit_guard');
    expect(guardFn).toContain('local idx="$1"');
    expect(guardFn).toContain('sample-$1-jit-processes.json');
    expect(guardFn).toContain('sample-$1-jit-processes.stdout');
    expect(guardFn).toContain('sample-$1-jit-harness-state.txt');
    expect(guardFn).toContain('xcrun devicectl device info processes --device "$DEV" --json-output "$js" >"$out" 2>&1 || rc=$?');
    expect(guardFn).toContain('n="$(grep -ci VoiceKernelHarness "$js" || true)"');
    expect(guardFn).toContain('[ "$n" -eq 0 ]');
    expect(guardFn).not.toMatch(/testTerminateOnly|device process terminate|device process signal|install app|xcodebuild|launchCold|sleep/);
    const loopStart = b.indexOf('for i in $(seq 1 "$N"); do');
    const driverCall = b.indexOf('T0=$(date +%s); run_test "$TEST"', loopStart);
    expect(loopStart).toBeGreaterThan(-1); expect(driverCall).toBeGreaterThan(loopStart);
    const loop = b.slice(loopStart, driverCall);
    const sid = 'if [ "$SUBJECT" = vpio-02-sid ] && [ "$ACT" = entry ]; then';
    const historicalCleanup = loop.indexOf('elif harness_present; then');
    expect(historicalCleanup).toBeGreaterThan(loop.indexOf(sid));
    const cleanupBody = loop.slice(historicalCleanup, loop.indexOf('daemon_snapshot "$i" before'));
    expect(cleanupBody).toContain('run_test testTerminateOnly');
    const jitAt = loop.lastIndexOf(sid);
    expect(jitAt).toBeGreaterThan(loop.indexOf('daemon_snapshot "$i" before'));
    expect(jitAt).toBeLessThan(loop.indexOf('log "sample $i/$N — driver ($TEST, mode $MODE)"'));
    const jitBlock = loop.slice(jitAt);
    expect(jitBlock).toContain('if ! sid_entry_jit_guard "$i"; then');
    expect(jitBlock).toContain('no terminate attempted, no sample launched');
    expect(jitBlock).toContain('exit 10');
    expect(jitBlock).not.toContain('run_test testTerminateOnly');
    expect(jitBlock).not.toMatch(/sleep|natural-zero|prewarm-wait/);
  });
  it('the historical batch path is preserved: every executable line of the batch at 8b111709b is present, verbatim and in order, in the current batch; every added executable line is inside one of the four S2 functions, an S2/STIMULUS constant, or an `if [ -n "$STIMULUS" ]` block — without --stimulus nothing new runs', () => {
    const was = execLines(histRaw(INSTRUMENT_K0506, BATCH).toString('utf8')).split('\n');
    // SOURCE-ID-02 (founder ruling 2026-09-15): exactly one historical line is substituted — the entry-classifier call receives
    // $CLASSIFIER_SUBJECT (== $SUBJECT for every historical subject). It is normalized back here so the in-order scan sees history verbatim.
    const now = execLines(W(BATCH)).split('\n').map((l) => l.replace('--subject "$CLASSIFIER_SUBJECT" $([ -n "$W4" ]', '--subject "$SUBJECT" $([ -n "$W4" ]').replace('(p5b0|phase-a|vpio-01|vpio-02|vpio-02-sid)', '(p5b0|phase-a|vpio-01|vpio-02)').replace('elif harness_present; then', 'if harness_present; then'));   // + SID refusal set + the ruled SID-only bypass of historical cleanup
    let j = 0; for (const l of was) { while (j < now.length && now[j] !== l) j++; expect(j < now.length ? l : `MISSING: ${l}`).toBe(l); j++; }
    const allowed = new Set<number>();
    for (let i = 0; i < now.length; i++) {
      if (/^(afplay_state|stimulus_preflight|stimulus_start|stimulus_stop)\(\)\{/.test(now[i])) { let k = i; while (k < now.length && now[k] !== '}') { allowed.add(k); k++; } allowed.add(k); }
      if (/^\s*if \[ -n "\$STIMULUS" \]/.test(now[i]) && /then$/.test(now[i])) { let k = i; while (k < now.length && !/^\s*fi$/.test(now[k])) { allowed.add(k); k++; } allowed.add(k); }
      if (/^\s*if \[ "\$STIMULUS" = sid-nearend-gated \]; then$/.test(now[i])) { let k = i; while (k < now.length && !/^\s*fi$/.test(now[k])) { allowed.add(k); k++; } allowed.add(k); }   // SOURCE-ID-02
      if (/^\s*if \[ -n "\$SOURCE_LEDGER" \]; then/.test(now[i])) { let k = i; while (k < now.length && !/^\s*fi$/.test(now[k])) { allowed.add(k); k++; } allowed.add(k); }                    // SOURCE-ID-02
      if (/^sid_entry_jit_guard\(\)\{/.test(now[i])) { let k = i; while (k < now.length && now[k] !== '}') { allowed.add(k); k++; } allowed.add(k); }                    // SID ENTRY-PREP-01
      if (/^\s*if \[ "\$SUBJECT" = vpio-02-sid \] && \[ "\$ACT" = entry \]; then$/.test(now[i])) { let k = i; while (k < now.length && !/^\s*(fi|elif harness_present; then)$/.test(now[k])) { allowed.add(k); k++; } if (/^\s*elif harness_present; then$/.test(now[k])) allowed.add(k); else allowed.add(k); }  // SID ENTRY no-cleanup branch or adjacent JIT refusal block
    }
    const wasSet = new Map<string, number>(); for (const l of was) wasSet.set(l, (wasSet.get(l) ?? 0) + 1);
    const added: string[] = [];
    now.forEach((l, i) => { const n = wasSet.get(l) ?? 0; if (n > 0) { wasSet.set(l, n - 1); return; } if (allowed.has(i)) return; if (/^(STIMULUS=""|S2_[A-Z0-9_]+=")/.test(l) || l.includes('$STIMULUS') || l.includes('--stimulus') || SID_ALLOWED.test(l) || /^\s*(fi|\}|esac|done)?\s*$/.test(l)) return; added.push(l); });   // bare block closers carry no executable content
    expect(added).toEqual([]);
    expect(now.filter((l) => l.includes('$STIMULUS')).length).toBeGreaterThanOrEqual(6);
  });
});

// ---- S2-VOLUME-DRIFT-01 (founder ruling 2026-09-15): read-only census of the 69 → 31 output-volume drift; the instrument reads, never sets ----
describe('KERNEL-00 · S2-VOLUME-DRIFT-01 — the drift census instrument is read-only: volume/device/Bluetooth/boot/sleep/preferences/process/unified-log READS with documented flags only; no set-volume, device selection, playback, signal, preference write, phone or batch verb; manifest + seal', () => {
  const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
  const execLines = (s: string) => s.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
  it('reads only, with documented flags; writes only into its own census directory (+ the raw log window off-repo); seals a manifest with every mutation flag false', () => {
    const x = execLines(W('scripts/witness/k00-volume-drift-census.sh'));
    expect(x).not.toMatch(/set volume|SwitchAudioSource|blueutil|defaults (write|delete|import)|\bsudo\b|afplay|\bsay\b|\bkill\b|killall|devicectl|xcodebuild|xcrun|log (collect|config|stream)|networksetup|pmset [a-z]*(sleep|wake|restart|schedule)|launchctl/);
    for (const l of x.split('\n').filter((l) => /shutdown|reboot/.test(l))) expect(l).toMatch(/^capture last-(reboot|shutdown)\.txt last (reboot|shutdown)$/);   // history reads only
    for (const l of x.split('\n').filter((l) => l.includes('osascript'))) expect(l).toContain("osascript -e 'get volume settings'");
    for (const l of x.split('\n').filter((l) => /\bdefaults\b/.test(l) && !l.includes('defaults-'))) expect(l).toMatch(/defaults (domains|read)\b/);
    for (const l of x.split('\n').filter((l) => l.includes('system_profiler'))) expect(l).toMatch(/system_profiler SP(Audio|Bluetooth)DataType -json/);
    for (const l of x.split('\n').filter((l) => /^\s*log show/.test(l))) expect(l).toMatch(/^log show --last "\$LAST" --style syslog --predicate '[^']*' > "\$RAW\/log-window\.txt"/);
    expect(x).toContain('capture log-show-help.txt log show --help');
    expect(x).toContain('RAW="/private/tmp/k00-volume-drift-$STAMP"');                       // the raw unified-log window never enters the repo
    expect(x).toContain('OUT="$ROOT/docs/programme/VOICE-2026/driver-ledger/volume-drift-$STAMP"');
    expect(x).toMatch(/'volumeSet': False, 'deviceSelected': False, 'soundPlayed': False, 'phoneTouched': False, 'preferencesWritten': False/);
    expect(x).toContain("'SEAL.sha256'"); expect(x).toContain('shasum -a 256 "$RAW/log-window.txt"');
    expect((x.match(/<\/dev\/null/g) ?? []).length).toBeGreaterThanOrEqual(4);              // stdin closed on every external read
    expect(execLines(W('scripts/witness/k00-driver-batch.sh'))).not.toMatch(/volume-drift|K00_DRIFT/);   // the batch is untouched by this act
  });
});

// ---- SOURCE-ID-02 (founder ruling 2026-09-15): the source-identification instrument — a new subject by custody, evidence only ----
describe('KERNEL-00 · SOURCE-ID-02 — seven-bin Goertzel at the consumed seam (evidence only) · gated 997 Hz fixture · evidence-only source reader · SID custody declarations; implementation is code/offline only', () => {
  const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
  const ORGANISM = 'ac12dedf4';
  const GRAPH = 'ios/VoiceKernel/Sources/VoiceKernel/AudioGraph.swift';
  const KERNEL = 'ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift';
  const SID_FIXTURE = 'scripts/witness/fixtures/k00-sid-nearend-997hz-gated-2hz-180s.wav';
  const SID_SHA = '30d51cf4b7527d28131bd9c2535c6bd4dcd2403c8dc0343fc045f6f6959875eb';
  const BINS = [440, 700, 880, 997, 1200, 1320, 1760];
  it('the estimator lives only in AudioGraph.swift: the bin set is exactly the seven ruled frequencies; frames close every fourth callback; coefficients come from the OBSERVED rate after the format guard and before any callback is armed; the fourteen trace seams are unchanged; no new AudioUnit/AudioOutputUnit/AudioComponent call, no timer, no lock, no allocation on the audio path', () => {
    const g = stripComments(W(GRAPH)); const h = histBody(ORGANISM, GRAPH);
    expect(g).toContain('public static let binsHz: [Double] = [440, 700, 880, 997, 1200, 1320, 1760]');
    expect(g).toContain('public static let callbacksPerFrame = 4');
    const guard = g.indexOf('try hw.requireValid()'), est = g.indexOf('sourceEstimator = SourceEstimator(sampleRate: hw.sampleRate)'), arm = g.indexOf('trace(.callbacksArmed');
    expect(guard).toBeGreaterThan(-1); expect(est).toBeGreaterThan(guard); expect(arm).toBeGreaterThan(est);
    expect([...g.matchAll(/case \w+ = "([a-z_]+)"/g)].map((x) => x[1])).toEqual([...h.matchAll(/case \w+ = "([a-z_]+)"/g)].map((x) => x[1]));   // 14 seams, same order
    for (const re of [/AudioUnitGetProperty\(/g, /AudioUnitSetProperty\(/g, /AudioUnitInitialize\(/g, /AudioUnitUninitialize\(/g, /AudioOutputUnitStart\(/g, /AudioUnitRender\(/g, /AudioComponent\w*\(/g, /AudioUnitAddPropertyListener\(/g, /\bimport \w+/g])
      expect((g.match(re) ?? []).length).toBe((h.match(re) ?? []).length);
    expect(g).not.toMatch(/DispatchQueue|Timer\b|Thread\b|OSAllocatedUnfairLock|DispatchSemaphore/);
    expect((g.match(/NSLock\(/g) ?? []).length).toBe((h.match(/NSLock\(/g) ?? []).length);   // the one pre-existing render lock; none added
    expect((g.match(/lock\.lock\(\)/g) ?? []).length).toBe((h.match(/lock\.lock\(\)/g) ?? []).length);
    // the audio-thread hook: the same consumed samples, after measure(); the frame is emitted outside the buffer closure
    const pull = g.slice(g.indexOf('fileprivate func pullInput('), g.indexOf('fileprivate func render('));
    expect(pull).toMatch(/let \(rms, peak\) = Self\.measure\(base, n\)[\s\S]*sourceEstimator\?\.consume\(base, n\)/);
    expect(pull.indexOf('onSource?(')).toBeGreaterThan(pull.indexOf('if let o = observation { onInput?(o) }'));
    // SIMD state, cos/sin recurrence, magnitude normalized by the window sum; lane 7 zero
    expect(g).toMatch(/SIMD8<Double>/); expect(g).toMatch(/mag\[7\] = 0/); expect(g).toMatch(/if wsum > 0 \{ mag \/= wsum \}/);
    expect(g).toMatch(/public static func modulationIndex\(_ ordered: \[Double\], frameSeconds: Double, hz: Double = 2\.0\) -> Double\?/);
  });
  it('the kernel journals input_source_sample exactly once, from the existing tick, component SourceEvidence, beside an UNCHANGED input_health_sample; the record is never a causal parent; nothing in supervisor · policy · projection · state reads source evidence', () => {
    const k = stripComments(W(KERNEL)); const hk = histBody(ORGANISM, KERNEL);
    expect((k.match(/"input_source_sample"/g) ?? []).length).toBe(1);
    expect(k).toMatch(/journal\("SourceEvidence", "input_source_sample", cause: "sample", evidence: src\)/);
    expect(k).not.toMatch(/lastObservationSeq = journal\("SourceEvidence"/);
    const tick = k.slice(k.indexOf('private func sampleIfDue('), k.indexOf('private func handleSource('));
    expect(tick.indexOf('"input_health_sample"')).toBeLessThan(tick.indexOf('"input_source_sample"'));
    const health = (s: string) => s.slice(s.indexOf('journal("HealthSupervisor", "input_health_sample"'), s.indexOf('if let g = graph, let r = g.renderStats()'));
    expect(health(k)).toBe(health(hk));                                                                              // the health record is byte-identical
    expect(k).toMatch(/ag\.onSource = \{ \[weak self\] o in Task \{ await self\?\.handleSource\(o\) \} \}/);
    const hs = k.slice(k.indexOf('private func handleSource('), k.indexOf('private func handleSource(') + 400);
    expect(hs).toMatch(/guard o\.generation == snap\.generation else \{ return \}\s+sourceAgg\.add\(o\)\s+\}/);
    for (const key of ['m2_997', 'm2_440', 'binsHz', 'frameReset', 'analysisRateHz']) expect(k).toContain(`"${key}"`);
    for (const f of ['HealthSupervisor.swift', 'RecoveryPolicy.swift', 'StateProjection.swift', 'KernelState.swift', 'Replay.swift'])
      expect(stripComments(W('ios/VoiceKernel/Sources/VoiceKernel/' + f))).not.toMatch(/SourceObservation|SourceEstimator|input_source_sample|m2_/);
    expect(k).not.toMatch(/sourceAgg[^\n]*(inputFlow|floor|transition|requestRecovery|health\.)/);
  });
  it('the pure-logic tests carry the source unit vectors: seven bins · coherent gain · the four amplitude-domain leakage coefficients · silence · frame reset · the ordered 2 Hz index (ideal gate ≥ 1.15, steady 0, fluctuation < 0.9) · a gated stimulus through the whole estimator', () => {
    const t = stripComments(W('ios/VoiceKernel/Tests/VoiceKernelTests/PureLogicTests.swift'));
    expect(t).toContain('final class SourceEstimatorTests: XCTestCase');
    for (const name of ['testTheBinSetIsExactlyTheSevenRuledFrequenciesAndAFrameClosesEveryFourthCallback', 'testAStimulusToneReadsItsOwnBinAtTheCoherentGainAndNothingInTheControls',
                        'testOwnToneHarmonicsLeakIntoTheStimulusBinNoMoreThanTheAmplitudeCoefficientsTheReadingLawPins', 'testSilenceReadsZeroEverywhereAndACallbackSizeChangeResetsTheFrame',
                        'testTheOrderedEnvelopeModulationIndexSeparatesAGatedStimulusFromASteadyOrFluctuatingOne', 'testAGatedStimulusThroughTheWholeEstimatorCarriesTheSignatureOnTheStimulusBinOnly']) expect(t).toContain(`func ${name}()`);
    expect(t).toContain('[(440.0, 2.16e-5), (880.0, 2.77e-3), (1320.0, 4.00e-5), (1760.0, 1.12e-5)]');
    expect(t).toContain('XCTAssertEqual(SourceEstimator.binsHz, [440, 700, 880, 997, 1200, 1320, 1760])');
  });
  it('the gated fixture is exactly PCM16 · mono · 48 000 Hz · 8 640 000 frames · 997 Hz at peak 0.20 FS gated 250 ms on / 250 ms off (2 Hz, 50 % duty) with 2 ms raised-cosine edges; OFF halves are digital zero; SHA-256 equals the sidecar and the batch pin', () => {
    const buf = readFileSync(join(process.cwd(), SID_FIXTURE));
    expect(buf.toString('ascii', 0, 4)).toBe('RIFF'); expect(buf.toString('ascii', 8, 12)).toBe('WAVE');
    let off = 12; let fmt: Record<string, number> | null = null; let dataOff = -1; let dataLen = -1;
    while (off + 8 <= buf.length) {
      const id = buf.toString('ascii', off, off + 4); const len = buf.readUInt32LE(off + 4);
      if (id === 'fmt ') fmt = { format: buf.readUInt16LE(off + 8), channels: buf.readUInt16LE(off + 10), rate: buf.readUInt32LE(off + 12), bits: buf.readUInt16LE(off + 22) };
      if (id === 'data') { dataOff = off + 8; dataLen = len; }
      off += 8 + len + (len & 1);
    }
    expect(fmt).toEqual({ format: 1, channels: 1, rate: 48000, bits: 16 });
    const frames = dataLen / 2; expect(frames).toBe(8_640_000); expect(dataOff + dataLen).toBe(buf.length);
    const peak = 6553, period = 24000, on = 12000, edge = 96;
    let max = 0, min = 0, worst = 0, offNonZero = 0, onSamples = 0;
    for (let i = 0; i < 96000; i++) {                                                    // the first two seconds: four full gate periods
      const v = buf.readInt16LE(dataOff + 2 * i); if (v > max) max = v; if (v < min) min = v;
      const ph = i % period;
      if (ph >= on) { if (v !== 0) offNonZero++; continue; }
      onSamples++;
      let gain = 1; if (ph < edge) gain = 0.5 - 0.5 * Math.cos(Math.PI * ph / edge); else if (ph >= on - edge) gain = 0.5 - 0.5 * Math.cos(Math.PI * (on - 1 - ph) / edge);
      const d = Math.abs(v - Math.round(peak * gain * Math.sin(2 * Math.PI * 997 * i / 48000))); if (d > worst) worst = d;
    }
    expect(offNonZero).toBe(0); expect(onSamples).toBe(48000); expect(worst).toBeLessThanOrEqual(1);
    for (let i = 96000; i < frames; i += 997) { const v = buf.readInt16LE(dataOff + 2 * i); if (v > max) max = v; if (v < min) min = v; }
    expect(max).toBe(peak); expect(min).toBe(-peak);
    const sha = createHash('sha256').update(buf).digest('hex'); expect(sha).toBe(SID_SHA);
    expect(W(SID_FIXTURE + '.sha256')).toBe(`${SID_SHA}  k00-sid-nearend-997hz-gated-2hz-180s.wav\n`);
    expect(W('scripts/witness/k00-driver-batch.sh')).toContain(`S2_STIMULUS_SHA256="${SID_SHA}"`);
  });
  it('the source reader is evidence-only: closed vocabulary, the amplitude-domain coefficients and the tail bound pinned, geometry fail-closed, frameReset before any attribution and the own-control law (SOURCE-ID-02A), self-test 24/24 naming every path; every tracked VPIO-02 journal reads UNMEASURED-SRC: no_source_evidence (never PASS/FAIL)', () => {
    const r = W('scripts/witness/k00-source-ledger.py');
    expect(r).toContain("A440, A880, A1320, A1760, TAIL = 2.16e-5, 2.77e-3, 4.00e-5, 1.12e-5, 2.82e-6");
    expect(r).toContain("VIS, SURV, SUPP, NOISE, M2, CB_MIN, MIN_FRAMES = 10.0, 0.1, 0.01, 10.0, 0.9, 90, 20");
    expect(r).toContain("GEOMETRY = {'rate': 48000.0, 'frameFrames': 1920}");
    // SOURCE-ID-02A (founder ruling 2026-09-15): frameReset is indeterminate BEFORE either attribution verdict (defect 2); the own-tone
    // control clears only when numeric-and-quiet, or undefined with a complete record and no material own-band energy; otherwise
    // own_control_unmeasured — missing control evidence never earns SURVIVES.
    const law = r.slice(r.indexOf("residual = g('e440Mean')"), r.indexOf('verdicts.append('));
    expect(law.indexOf("if reset > 0: v = 'INDETERMINATE-SRC: frameReset'")).toBeLessThan(law.indexOf("v = 'NEAR-END-SURVIVES'"));
    expect(law.indexOf("v = 'NEAR-END-SURVIVES'")).toBeLessThan(law.indexOf("v = 'NEAR-END-SUPPRESSED'"));
    expect(law).toContain("control = 'clear' if (m2own is not None and m2own < M2) else ('clear' if (m2own is None and own_quiet) else ('modulated' if m2own is not None else 'unmeasured'))");
    expect(law).toContain("own_quiet = complete and g('e440Mean') < max(cal['C_base'], Cw)");
    expect(law).toMatch(/and control == 'clear':\s+v = 'NEAR-END-SURVIVES'/);
    expect(law).toContain("elif control == 'unmeasured': v = 'INDETERMINATE-SRC: own_control_unmeasured'");
    expect(law).not.toMatch(/m2own is None or m2own < M2/);
    for (const v of ['NEAR-END-SURVIVES', 'NEAR-END-SUPPRESSED', 'INDETERMINATE-SRC: frameReset', 'INDETERMINATE-SRC: between', 'INDETERMINATE-SRC: floor', 'INDETERMINATE-SRC: signature_absent', 'INDETERMINATE-SRC: own_control_unmeasured', 'INDETERMINATE-SRC: own_modulated', 'no_source_evidence', 'gate_not_seen', 'stimulus_not_visible', 'no_full_rendering_window']) expect(r).toContain(v);
    const out = execFileSync('python3', ['scripts/witness/k00-source-ledger.py', '--selftest'], { cwd: process.cwd() }).toString('utf8');
    expect(out).toMatch(/selftest: 24\/24/); expect(out).not.toMatch(/^FAIL/m);
    for (const line of ['21 suppressed amplitude + healthy capture + frameReset → frameReset, never SUPPRESSED', '22 m2_440 undefined because the own band is quiet (complete record) → control clears, SURVIVES',
                        '23 m2_440 undefined while own-band energy is material → own_control_unmeasured', '24 malformed record (own-band keys missing) never clears the control', '16 own_modulated veto', '17 frameReset in a window is never SURVIVES']) expect(out).toContain(line);
    const sourceLedgers = execFileSync('git', ['ls-files', 'docs/programme/VOICE-2026/driver-ledger'], { cwd: process.cwd() }).toString('utf8').split('\n').filter((p) => p.endsWith('/ledger.md'));
    const exactSourceSubject = (p: string) => readFileSync(join(process.cwd(), p), 'utf8').match(/\bsubject=([^\s·|]+)/)?.[1] ?? '';
    const dirs = sourceLedgers.filter((p) => exactSourceSubject(p) === 'vpio-02');
    const sidEntryDirs = sourceLedgers.filter((p) => exactSourceSubject(p) === 'vpio-02-sid');
    const journals = dirs.flatMap((p) => execFileSync('git', ['ls-files', p.replace(/ledger\.md$/, 'journals')], { cwd: process.cwd() }).toString('utf8').split('\n').filter((f) => f.endsWith('.jsonl') && !f.includes('not-a-sample')));
    const sidEntryJournals = sidEntryDirs.flatMap((p) => execFileSync('git', ['ls-files', p.replace(/ledger\.md$/, 'journals')], { cwd: process.cwd() }).toString('utf8').split('\n').filter((f) => f.endsWith('.jsonl') && !f.includes('not-a-sample')));
    expect(journals.length).toBe(61);
    expect(sidEntryJournals.length).toBe(75); // constitutional boundary: ENTRY journals never enter source-attribution interpretation.
    const rows = execFileSync('python3', ['scripts/witness/k00-source-ledger.py', '--subject', 'vpio-02', ...journals], { cwd: process.cwd(), maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
    expect((rows.match(/no_source_evidence/g) ?? []).length).toBe(61); expect(rows).not.toMatch(/PASS|FAIL|VALID\*\*/);
  });
  it('custody declarations: the batch names the SID subject once, maps it to classifier vpio-02, admits sid-nearend-gated only with vpio-02-sid and s2-nearend only with vpio-02, and invokes the source reader only inside the output guard after the two frozen readers; the frozen readers are byte-identical to b198e2e37', () => {
    const bx = W('scripts/witness/k00-driver-batch.sh').split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
    expect(bx).toContain('SOURCE_LEDGER=""; [ "$STIMULUS" = sid-nearend-gated ] && SOURCE_LEDGER="$LEDGER_DIR/source-ledger.md"');
    const srcCall = bx.indexOf('k00-source-ledger.py" --stratum'), guard = bx.indexOf('if [ -n "$SOURCE_LEDGER" ]; then'), outCall = bx.indexOf('k00-output-ledger.py" --stratum');
    expect(guard).toBeGreaterThan(outCall); expect(srcCall).toBeGreaterThan(guard);
    expect((bx.match(/python3 "\$ROOT\/scripts\/witness\/k00-source-ledger\.py"/g) ?? []).length).toBe(2);
    for (const l of bx.split('\n').filter((l) => l.includes('k00-source-ledger.py'))) expect(l).not.toMatch(/custody|STIMULUS|S2_|afplay/);
    for (const p of ['scripts/witness/k00-ledger.py', 'scripts/witness/k00-output-ledger.py']) expect(histRaw('b198e2e37058f2e059d986b4b148e224215f3ee3', p).equals(readFileSync(join(process.cwd(), p)))).toBe(true);
  });
});

describe('KERNEL-00 · SID ENTRY observer-liveness verifier (founder ruling 2026-09-15, tooling-only) — a validity input for [G], never an ENTRY class', () => {
  const V = 'scripts/witness/k00-source-liveness.py';
  const stripPy = (s: string) => s.replace(/"""[\s\S]*?"""/g, '').split('\n').map((l) => l.replace(/#.*$/, '')).join('\n');
  it('reads only input_source_sample records and only their frames / frameReset evidence keys; the source (docstring and comments stripped) names no bin, magnitude, m2, attribution or stimulus key and never imports the source reader', () => {
    const src = stripPy(readFileSync(join(process.cwd(), V), 'utf8'));
    expect(src).toContain('EVENT = "input_source_sample"');
    expect(src).toContain('KEY_FRAMES = "frames"');
    expect(src).toContain('KEY_RESET = "frameReset"');
    expect((src.match(/ev\.get\(/g) ?? []).length).toBe(2);                                             // exactly two evidence reads
    expect(src).not.toMatch(/magnitudes|m2_|m2\b|e997|e440|e880|e700|e1200|e1320|e1760|binsHz|stimulus|SURV|SUPP|NEAR-END|INDETERMINATE|Fisher|UNPERTURBED|PERTURBED|k00-source-ledger|k00-ledger/);
    expect(src).toContain('LIVE_MIN = 10');
    expect(src).not.toMatch(/subprocess|import\s+(re|csv|statistics|scipy|numpy)/);
  });
  it('self-test 9/9 on the synthetic journals: 10 → LIVE · 9 → DORMANT · frames=0 never counts · missing/non-numeric/negative frames never count · mixed frameReset counters reported exactly · unrelated records ignored · bin/magnitude/m2 content cannot change any column', () => {
    const out = execFileSync('python3', [V, '--selftest'], { cwd: process.cwd() }).toString('utf8');
    expect(out.trim().split('\n').pop()).toBe('selftest 9/9');
    expect(out).not.toMatch(/FAIL/);
  });
  it('on a real VPIO-02 (no-observer) journal it reads 0 source records → DORMANT, the correct negative control; the header is the seven pinned columns', () => {
    const j = join(process.cwd(), 'docs/programme/VOICE-2026/driver-ledger/VPIO-02-20260914T223500Z/journals');
    const one = readdirSync(j).filter((n) => n.endsWith('.jsonl')).sort()[0];
    const out = execFileSync('python3', [V, join(j, one)], { cwd: process.cwd() }).toString('utf8').trim().split('\n');
    expect(out[0]).toBe('journal\tsource_sample_records\tframes_present_records\tframeReset_nonzero_records\tframeReset_zero_records\tresets_total\tliveness');
    expect(out[1]).toBe(`${one}\t0\t0\t0\t0\t0\tDORMANT`);
  });
  it('ENTRY-04 successor pins are history-safe and one-shot: fetch the pinned branch, never require an empty historical ENTRY corpus, mark invocation before the authority gate, and bind success to exactly one newly-created ledger', () => {
    const pre = readFileSync(join(process.cwd(), 'docs/programme/VOICE-2026/SID_ENTRY-PREFLIGHT-04_PIN_DRAFT_2026-09-16.sh'), 'utf8');
    const batch = readFileSync(join(process.cwd(), 'docs/programme/VOICE-2026/SID_ENTRY-BATCH-04_PIN_DRAFT_2026-09-16.sh'), 'utf8');
    expect(pre).toContain('SHA=9df4c93401a1ba92babd2b7ab297112e974ee1cb');
    expect(pre).toContain('git fetch origin fix/chatgpt-voice-jit-install-guard');
    expect(batch).toContain('ACT_MARK=/private/tmp/sid-entry-batch-04-invoked.txt');
    expect(batch.indexOf("printf 'SID-ENTRY-BATCH-04 INVOKED")).toBeLessThan(batch.indexOf('test -n "$K00_EXEC_AUTHORITY"'));
    expect(batch).not.toMatch(/ls -d .*VPIO-02-SID-ENTRY-2.*wc -l/);
    expect(batch).toContain(`find "$BASE" -maxdepth 1 -type d -name 'VPIO-02-SID-ENTRY-2*' | LC_ALL=C sort > "$BEFORE"`);
    expect(batch).toContain('NEW=$(comm -13 "$BEFORE" "$AFTER")');
    expect(batch).toContain('test \"$(printf');
    expect(batch).toContain('\"$NEW\" | sed \'/^$/d\' | wc -l');
    expect(batch).toContain('cp "$ACT_MARK" "$L/batch-act-marker.txt"');
    expect((batch.match(/scripts\/witness\/k00-driver-batch\.sh VPIO-02-SID-ENTRY 30/g) ?? []).length).toBe(1);
  });
  it('ENTRY-05 successor pins bind the repaired fail-closed instrument, preserve witnessed containers and <=300 s freshness, and remain one-shot N=30 with no stimulus', () => {
    const pre = readFileSync(join(process.cwd(), 'docs/programme/VOICE-2026/SID_ENTRY-PREFLIGHT-05_PIN_DRAFT_2026-09-16.sh'), 'utf8');
    const batch = readFileSync(join(process.cwd(), 'docs/programme/VOICE-2026/SID_ENTRY-BATCH-05_PIN_DRAFT_2026-09-16.sh'), 'utf8');
    expect(pre).toContain('SHA=9ed72a38cce6fb55e909e747898f4d452dcfdf3d');
    expect(batch).toContain('SHA=9ed72a38cce6fb55e909e747898f4d452dcfdf3d');
    expect(pre).toContain('SID_CONTAINER=85948DBD-BA8F-4679-950D-31767B1C24E5');
    expect(pre).toContain('HIST_CONTAINER=E3B88028-A10F-46B1-AB27-CF0A1F83FB78');
    expect(pre).toContain('test "$(grep -ci VoiceKernelHarness "$PF/processes.json")" = 0');
    expect(pre).toContain('git fetch origin fix/chatgpt-voice-jit-install-guard');
    expect(batch).toContain('test "$AGE" -le 300');
    expect(batch).toContain('ACT_MARK=/private/tmp/sid-entry-batch-05-invoked.txt');
    expect(batch.indexOf("printf 'SID-ENTRY-BATCH-05 INVOKED")).toBeLessThan(batch.indexOf('test -n "$K00_EXEC_AUTHORITY"'));
    expect(batch).toContain('scripts/witness/k00-driver-batch.sh VPIO-02-SID-ENTRY 30 --vp on --mode L --hold 15 --subject vpio-02-sid');
    expect(batch).not.toContain('--stimulus');
    expect((batch.match(/scripts\/witness\/k00-driver-batch\.sh VPIO-02-SID-ENTRY 30/g) ?? []).length).toBe(1);
    expect(batch).toContain('NEW=$(comm -13 "$BEFORE" "$AFTER")');
  });
});
