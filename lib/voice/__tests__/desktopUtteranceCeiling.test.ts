/**
 * DESKTOP-SOVEREIGN-STT-UTTERANCE-LIMIT-01 — a Desktop turn ends when the
 * member stops speaking, not when a recovery-probe timer expires.
 *
 * ⛔ THE DEFECT. `androidVoiceFallback` was built as a ONE-SHOT RECOVERY probe
 * for Android Chrome, and bounded itself at `DEFAULT_MAX_RECORDING_MS = 8000`.
 * DESKTOP-SOVEREIGN-STT-01 routed Desktop through the same transport, and
 * Desktop inherited that bound. The rolling-partial work did not create it.
 *
 * On the founder device, long spoken turns terminated at 8704 ms and 8652 ms
 * while the member was still speaking. Two short turns in the same run ended at
 * 3.0 s and 2.4 s — silence completion working correctly. That ~8.6–8.7 s
 * cluster is what distinguishes a hard ceiling from a false VAD: the recorder
 * was not mishearing silence, it was being switched off mid-breath.
 *
 * ⛔ WHAT MUST NOT BE LOST IN THE REPAIR. The fix has to be a DESKTOP-SCOPED
 * value. Editing the shared default would silently widen Android-Chrome
 * recovery and the Firefox/Zen branch — a behaviour change nobody witnessed.
 * T4 below is the guard for that, and it is the one most easily lost.
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { recordAndTranscribe, DESKTOP_SOVEREIGN_MAX_RECORDING_MS } from '../androidVoiceFallback';

/** The inherited recovery bound. Named here so a test that drifts is loud. */
const ANDROID_RECOVERY_MAX_MS = 8000;

// ── a MediaRecorder / audio stack small enough to reason about ──────────────
let recorders: FakeRecorder[] = [];

/**
 * Chunks must clear `MIN_PREFIX_BYTES` (2000) or the rolling transcriber
 * silently drops every prefix and the provisional assertions below would pass
 * for the wrong reason.
 */
const CHUNK = 'x'.repeat(3000);

class FakeRecorder {
  static isTypeSupported = () => true;
  state: 'inactive' | 'recording' = 'inactive';
  ondataavailable: ((e: any) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private flushTimer: any = null;
  constructor(public stream: any, public opts: any) { recorders.push(this); }

  start(timesliceMs?: number) {
    this.state = 'recording';
    // A timeslice makes the real recorder hand over decodable prefixes on a
    // cadence. Modelled, because the provisional path only exists under it.
    if (timesliceMs) {
      this.flushTimer = setInterval(() => {
        if (this.state !== 'recording') return;
        this.ondataavailable?.({ data: new Blob([CHUNK], { type: 'audio/webm' }) });
      }, timesliceMs);
    }
  }

  stop() {
    if (this.state === 'inactive') return;
    this.state = 'inactive';
    if (this.flushTimer) { clearInterval(this.flushTimer); this.flushTimer = null; }
    this.ondataavailable?.({ data: new Blob([CHUNK], { type: 'audio/webm' }) });
    this.onstop?.();
  }
}

const track = () => ({ stop: vi.fn(), kind: 'audio', addEventListener: vi.fn(), removeEventListener: vi.fn() });
const fakeStream = () => { const t = [track()]; return { getTracks: () => t, getAudioTracks: () => t } as any; };

/**
 * The member's voice, as the analyser sees it. `SILENCE_RMS_THRESHOLD` is
 * 0.012; 0.5 is unambiguously speech and 0 is unambiguously silence, so no
 * assertion here rides on the threshold's exact value.
 */
let speaking = true;

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  recorders = [];
  speaking = true;
  vi.useFakeTimers();
  (globalThis as any).MediaRecorder = FakeRecorder;
  (globalThis as any).AudioContext = class {
    state = 'running';
    createMediaStreamSource() { return { connect: vi.fn(), disconnect: vi.fn() }; }
    createAnalyser() {
      return {
        fftSize: 1024,
        // ⛔ The REAL method. The module reads `getFloatTimeDomainData`; a fake
        // that only offers the Byte variant makes silence detection throw
        // inside its own interval and every duration assertion meaningless.
        getFloatTimeDomainData: (a: Float32Array) => a.fill(speaking ? 0.5 : 0),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
    }
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
  };
  fetchMock = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ transcription: 'hello there' }) }));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/**
 * Only requests carrying the member's audio count, and only the FINAL one is a
 * turn.
 *
 * ⛔ `logVoiceEvent` ships telemetry over the same fetch, and provisional
 * prefixes go to the SAME route as the final transcript (by design — one
 * first-party endpoint, one gate, one container). So neither a bare call count
 * nor a URL filter can answer "how many turns were born". The provisional
 * marker is the only thing that separates them.
 */
const transcribeCalls = () =>
  fetchMock.mock.calls.filter((c) => String(c[0]).includes('/api/voice/transcribe-simple'));

const isProvisional = (call: any[]): boolean => {
  const body = call[1]?.body;
  return typeof body?.get === 'function' && body.get('provisional') === 'true';
};

const finalCalls = () => transcribeCalls().filter((c) => !isProvisional(c));
const partialCalls = () => transcribeCalls().filter((c) => isProvisional(c));

// ════════════════════════════════════════════════════════════════════════════
// T1 + T3 — the ceiling moved, and it is still a ceiling
// ════════════════════════════════════════════════════════════════════════════

describe('T1/T3 — Desktop speech is bounded by silence, then by an exceptional ceiling', () => {
  it('T1 — continuous speech past 8 seconds is NOT cut off', async () => {
    const p = recordAndTranscribe(fakeStream(), { maxMs: DESKTOP_SOVEREIGN_MAX_RECORDING_MS });
    expect(recorders).toHaveLength(1);

    // Straight through the inherited bound, and past the founder-device
    // termination cluster (8704 ms / 8652 ms), still speaking.
    await vi.advanceTimersByTimeAsync(ANDROID_RECOVERY_MAX_MS + 1000);
    expect(recorders[0].state, 'the recorder stopped at the inherited 8s bound').toBe('recording');

    // And well past it: a long spoken turn is an ordinary turn.
    await vi.advanceTimersByTimeAsync(30_000);
    expect(recorders[0].state, 'a 39s spoken turn was cut off').toBe('recording');

    speaking = false;
    await vi.advanceTimersByTimeAsync(3000);
    const result = await p;
    expect(result.ok).toBe(true);
    expect(result.durationMs).toBeGreaterThan(ANDROID_RECOVERY_MAX_MS);
  });

  it('T3 — a microphone that never falls silent is still stopped', async () => {
    // Pathological capture: a room that never goes quiet. Speech never ends,
    // so only the ceiling can end it — and it must.
    const p = recordAndTranscribe(fakeStream(), { maxMs: DESKTOP_SOVEREIGN_MAX_RECORDING_MS });

    await vi.advanceTimersByTimeAsync(DESKTOP_SOVEREIGN_MAX_RECORDING_MS - 1000);
    expect(recorders[0].state).toBe('recording');

    await vi.advanceTimersByTimeAsync(2000);
    expect(recorders[0].state, 'the safety ceiling never fired').toBe('inactive');

    const result = await p;
    expect(result.durationMs).toBeGreaterThanOrEqual(DESKTOP_SOVEREIGN_MAX_RECORDING_MS);
  });

  it('T3 — the ceiling is a bound, not an absence of one', () => {
    // ⛔ The failure this guards is a "fix" that removes the limit entirely, or
    // pushes it so far out that a stuck microphone records until the machine
    // sleeps. Exceptional, still finite, still measured in minutes.
    expect(DESKTOP_SOVEREIGN_MAX_RECORDING_MS).toBeGreaterThan(60_000);
    expect(DESKTOP_SOVEREIGN_MAX_RECORDING_MS).toBeLessThanOrEqual(300_000);
    expect(Number.isFinite(DESKTOP_SOVEREIGN_MAX_RECORDING_MS)).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// T2 — silence is still what ends a turn
// ════════════════════════════════════════════════════════════════════════════

describe('T2 — silence still ends the turn normally', () => {
  it('a short turn ends on silence, nowhere near the ceiling', async () => {
    const p = recordAndTranscribe(fakeStream(), { maxMs: DESKTOP_SOVEREIGN_MAX_RECORDING_MS });

    await vi.advanceTimersByTimeAsync(2400);     // the member speaks
    expect(recorders[0].state).toBe('recording');

    speaking = false;                            // …and stops
    await vi.advanceTimersByTimeAsync(2000);     // > DEFAULT_SILENCE_HOLDOFF_MS

    expect(recorders[0].state, 'silence no longer ends the turn').toBe('inactive');
    const result = await p;
    expect(result.ok).toBe(true);
    // ⛔ The point of the whole unit: raising the ceiling must not make short
    // turns wait for it.
    expect(result.durationMs).toBeLessThan(ANDROID_RECOVERY_MAX_MS);
  });

  it('silence before minMs cannot end the turn early', async () => {
    // The 3.0 s / 2.4 s completions on the founder device were this working.
    // A member who pauses to think within the first 800 ms is not finished.
    speaking = false;
    const p = recordAndTranscribe(fakeStream(), { maxMs: DESKTOP_SOVEREIGN_MAX_RECORDING_MS });
    await vi.advanceTimersByTimeAsync(400);
    expect(recorders[0].state).toBe('recording');
    await vi.advanceTimersByTimeAsync(3000);
    expect(recorders[0].state).toBe('inactive');
    await p;
  });
});

// ════════════════════════════════════════════════════════════════════════════
// T4 — THE GUARD MOST EASILY LOST
// ════════════════════════════════════════════════════════════════════════════

describe('T4 — Android-Chrome and Firefox/Zen keep the bound they were designed against', () => {
  it('a caller that passes no maxMs still stops at 8 seconds', async () => {
    // ⛔ This is the whole reason the fix is a second constant rather than an
    // edit to `DEFAULT_MAX_RECORDING_MS`. The Android-Chrome recovery path and
    // the Firefox/Zen branch both call `recordAndTranscribe` without a maxMs.
    // If this test starts passing at 120 s, the repair widened two transports
    // nobody witnessed.
    const p = recordAndTranscribe(fakeStream());

    await vi.advanceTimersByTimeAsync(ANDROID_RECOVERY_MAX_MS - 500);
    expect(recorders[0].state, 'the recovery probe stopped early').toBe('recording');

    await vi.advanceTimersByTimeAsync(1000);
    expect(recorders[0].state, 'the shared default was widened').toBe('inactive');

    const result = await p;
    expect(result.durationMs).toBeLessThan(ANDROID_RECOVERY_MAX_MS + 1000);
  });

  it('the shared default constant is untouched in source', () => {
    const fs = require('node:fs') as typeof import('node:fs');
    const path = require('node:path') as typeof import('node:path');
    const src = fs.readFileSync(path.join(__dirname, '..', 'androidVoiceFallback.ts'), 'utf8');
    expect(src, 'DEFAULT_MAX_RECORDING_MS was edited instead of scoped')
      .toContain('const DEFAULT_MAX_RECORDING_MS = 8000;');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// T5 / T6 — one turn, and provisional text that knows when to stop
// ════════════════════════════════════════════════════════════════════════════

describe('T5/T6 — a long turn is still born exactly once', () => {
  it('T5 — many provisional reads, exactly one final transcript', async () => {
    const onPartial = vi.fn();
    const p = recordAndTranscribe(fakeStream(), {
      maxMs: DESKTOP_SOVEREIGN_MAX_RECORDING_MS,
      onPartial,
      partialIntervalMs: 900,
    });

    await vi.advanceTimersByTimeAsync(20_000);   // a genuinely long turn
    speaking = false;
    await vi.advanceTimersByTimeAsync(2500);

    const result = await p;
    expect(result.ok).toBe(true);

    // The provisional path did real work over those 20 seconds…
    expect(partialCalls().length).toBeGreaterThan(1);
    // …and none of it became a turn.
    expect(finalCalls(), 'a long turn committed more than one transcript').toHaveLength(1);
  });

  it('T6 — the provisional path closes before the final transcript commits', async () => {
    // ⛔ THE RACE. A provisional read issued at second 19 can return after
    // recording ends. If it were still allowed to paint, the member would watch
    // MAIA's committed words be overwritten by a guess she had already
    // discarded. `partial.close()` runs the moment recording ends, and the
    // delivery gate drops anything that lands after it.
    let releaseProvisional: (() => void) | null = null;
    fetchMock.mockImplementation(async (url: any, init: any) => {
      const ok = { ok: true, status: 200, json: async () => ({ transcription: 'FINAL TEXT' }) };
      if (!String(url).includes('/api/voice/transcribe-simple')) return { ok: true, status: 200, json: async () => ({}) };
      if (init?.body?.get?.('provisional') !== 'true') return ok;
      // Hold this provisional open across the end of recording.
      await new Promise<void>((r) => { releaseProvisional = r; });
      return { ok: true, status: 200, json: async () => ({ transcription: 'STALE GUESS' }) };
    });

    const onPartial = vi.fn();
    const p = recordAndTranscribe(fakeStream(), {
      maxMs: DESKTOP_SOVEREIGN_MAX_RECORDING_MS,
      onPartial,
      partialIntervalMs: 900,
    });

    await vi.advanceTimersByTimeAsync(3000);
    expect(releaseProvisional, 'no provisional request was ever issued').not.toBeNull();

    speaking = false;
    await vi.advanceTimersByTimeAsync(2500);
    const result = await p;
    expect(result.transcript).toBe('FINAL TEXT');

    // Now let the stale provisional land, after the turn is already committed.
    releaseProvisional!();
    await vi.advanceTimersByTimeAsync(100);

    expect(onPartial, 'a provisional read painted after the final transcript')
      .not.toHaveBeenCalledWith('STALE GUESS');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// T7 — a longer ceiling must not lengthen the exit
// ════════════════════════════════════════════════════════════════════════════

describe('T7 — route exit still aborts immediately', () => {
  it('a 120s ceiling does not mean a 120s microphone after the member leaves', async () => {
    // ⛔ THE RISK THIS UNIT INTRODUCES. Moving the ceiling out multiplies the
    // window in which a member can walk away mid-capture. Revocation has to
    // remain instant, or the repair trades a truncated sentence for an open
    // microphone behind another screen.
    const c = new AbortController();
    const p = recordAndTranscribe(fakeStream(), {
      signal: c.signal,
      maxMs: DESKTOP_SOVEREIGN_MAX_RECORDING_MS,
    });

    await vi.advanceTimersByTimeAsync(15_000);   // deep into a long turn
    expect(recorders[0].state).toBe('recording');

    c.abort();
    await vi.advanceTimersByTimeAsync(0);
    expect(recorders[0].state, 'the recorder kept running after revocation').toBe('inactive');

    const result = await p;
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('aborted');
    expect(finalCalls(), 'audio left the device after the member walked away').toHaveLength(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// The COMPONENT side — asserted structurally
//
// ⛔ Source guards rather than behavioural tests because the branch lives
// inside a 4,000-line component whose mount requires the whole voice tree. The
// property at stake is SCOPE — which transport gets the new bound — and scope
// is a property of the file.
// ════════════════════════════════════════════════════════════════════════════

describe('the Desktop ceiling is applied to Desktop and to nothing else', () => {
  const fs = require('node:fs') as typeof import('node:fs');
  const path = require('node:path') as typeof import('node:path');
  const src = fs.readFileSync(
    path.join(__dirname, '..', '..', '..', 'components', 'voice', 'ContinuousConversation.tsx'), 'utf8');

  /**
   * The SOVEREIGN branch only. `recordAndTranscribe` has three call sites; the
   * other two are the Android-Chrome recovery and must not be read here.
   */
  const sovereign = src.slice(src.indexOf("logVoiceEvent('voice_listening_started', { path: sovereignReason })"));

  it('the sovereign branch passes an explicit maxMs', () => {
    const call = sovereign.indexOf('recordAndTranscribe(stream, {');
    expect(call).toBeGreaterThan(-1);
    const args = sovereign.slice(call, sovereign.indexOf('});', call));
    expect(args, 'the sovereign capture still inherits the 8s recovery bound').toContain('maxMs');
  });

  it('the ceiling is gated on isDesktop, not on capability', () => {
    // ⛔ Firefox/Zen reach this same branch by ABSENCE of Web Speech. Gating on
    // anything but classification would hand them a transport change they were
    // never witnessed under — the same mistake, in the other direction, that
    // put the 8s bound on Desktop in the first place.
    expect(sovereign).toMatch(
      /const captureMaxMs = info\.isDesktop \? DESKTOP_SOVEREIGN_MAX_RECORDING_MS : undefined;/,
    );
    // …and an undefined value is omitted rather than passed, so a non-Desktop
    // caller falls through to the module default exactly as before.
    expect(sovereign).toContain('captureMaxMs === undefined ? {} : { maxMs: captureMaxMs }');
  });

  it('the Android-Chrome recovery call sites are left bare', () => {
    // Everything BEFORE the sovereign branch is the recovery path.
    const recovery = src.slice(0, src.indexOf("logVoiceEvent('voice_listening_started', { path: sovereignReason })"));
    expect(recovery, 'the Android-Chrome recovery path was given a maxMs it never had')
      .not.toMatch(/recordAndTranscribe\([^)]*maxMs/);
  });

  it('no browser SpeechRecognition was reintroduced for long turns', () => {
    // The sovereign ruling forbids handing member audio back to a
    // browser-managed recognizer, at any utterance length.
    //
    // ⛔ COMMENTS STRIPPED FIRST. The branch's own documentation says "no
    // browser SpeechRecognition" while explaining what it forbids, and the
    // first version of this guard matched that sentence — measuring the
    // distance to its own prose rather than to any code. Same failure the
    // lifecycle suite records at T4.
    const branch = sovereign
      .slice(0, sovereign.indexOf('});', sovereign.indexOf('recordAndTranscribe(stream, {')))
      .replace(/\/\/.*$/gm, '');
    expect(branch).not.toMatch(/SpeechRecognition/);
  });
});
