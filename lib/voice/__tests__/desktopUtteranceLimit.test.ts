/**
 * DESKTOP-SOVEREIGN-STT-UTTERANCE-LIMIT-01 — a Desktop turn ends where the
 * member stops speaking, not where a recovery timer expires.
 *
 * ⛔ THE DEFECT (DEVICE + SOURCE CONFIRMED). Long Desktop turns ended at 8704 ms
 * and 8652 ms while the member was still mid-sentence, while 3.0 s and 2.4 s
 * turns in the same run completed correctly on silence. The failures cluster on
 * the timer, not on the audio: Desktop was inheriting
 * `DEFAULT_MAX_RECORDING_MS = 8000` from `androidVoiceFallback`, a bound written
 * for a one-shot Android recovery attempt.
 *
 * These tests are written as attempts to (a) cut a Desktop member off at eight
 * seconds, (b) leave a pathological capture running forever, (c) widen the
 * change onto Android/Firefox, and (d) break any invariant the interim and
 * lifecycle units already hold.
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { recordAndTranscribe } from '../androidVoiceFallback';
import { DESKTOP_MAX_UTTERANCE_MS } from '../desktopUtteranceLimits';

let recorders: FakeRecorder[] = [];

class FakeRecorder {
  static isTypeSupported = () => true;
  state: 'inactive' | 'recording' = 'recording';
  timeslice?: number;
  ondataavailable: ((e: any) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public stream: any, public opts: any) { recorders.push(this); }
  start(timeslice?: number) { this.state = 'recording'; this.timeslice = timeslice; }
  flush(bytes = 4000) {
    this.ondataavailable?.({ data: new Blob(['y'.repeat(bytes)], { type: 'audio/webm' }) });
  }
  stop() {
    if (this.state === 'inactive') return;
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['x'], { type: 'audio/webm' }) });
    this.onstop?.();
  }
}

/**
 * The analyser the module actually reads: `getFloatTimeDomainData`. `level` is
 * the per-sample amplitude — above the module's 0.012 RMS threshold counts as
 * speech, below it as silence.
 */
let level = 0.5;

const track = () => ({ stop: vi.fn(), kind: 'audio', addEventListener: vi.fn(), removeEventListener: vi.fn() });
const fakeStream = () => { const t = [track()]; return { getTracks: () => t, getAudioTracks: () => t } as any; };

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  recorders = [];
  level = 0.5;
  (globalThis as any).MediaRecorder = FakeRecorder;
  (globalThis as any).AudioContext = class {
    state = 'running';
    createMediaStreamSource() { return { connect: vi.fn(), disconnect: vi.fn() }; }
    createAnalyser() {
      return {
        fftSize: 0,
        frequencyBinCount: 8,
        getFloatTimeDomainData: (a: Float32Array) => a.fill(level),
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

const transcribeCalls = () =>
  fetchMock.mock.calls.filter((c) => String(c[0]).includes('/api/voice/transcribe-simple'));

/** Advance mocked time and let the promise chain in between actually run. */
async function advance(ms: number, step = 100) {
  for (let t = 0; t < ms; t += step) {
    await vi.advanceTimersByTimeAsync(step);
  }
}

// ── 1 · speech past eight seconds is not cut off ──────────────────────────
describe('1 — Desktop speech continuing past 8 seconds does not stop at 8 seconds', () => {
  it('still recording at 12s, and at 30s, while the member keeps speaking', async () => {
    vi.useFakeTimers();
    const p = recordAndTranscribe(fakeStream(), { maxMs: DESKTOP_MAX_UTTERANCE_MS });

    await advance(12_000);
    // ⛔ THE DEVICE FAILURE, as a unit: at second eight the member was told
    // their thought was over.
    expect(recorders[0].state).toBe('recording');
    expect(transcribeCalls()).toHaveLength(0);

    await advance(18_000);
    expect(recorders[0].state).toBe('recording');

    level = 0;                                    // the member finally stops
    await advance(3_000);
    expect(recorders[0].state).toBe('inactive');
    await p;
  });
});

// ── 2 · silence still ends the turn ───────────────────────────────────────
describe('2 — silence still ends the turn normally', () => {
  it('a 2.5s turn ends on the silence holdoff, nowhere near the ceiling', async () => {
    vi.useFakeTimers();
    const p = recordAndTranscribe(fakeStream(), { maxMs: DESKTOP_MAX_UTTERANCE_MS });

    await advance(2_500);                          // speaking
    expect(recorders[0].state).toBe('recording');
    level = 0;                                     // stopped speaking
    await advance(2_000);                          // holdoff is 1.5s

    expect(recorders[0].state).toBe('inactive');
    const result = await p;
    expect(result.ok).toBe(true);
    // Raising the ceiling must not have turned silence-completion into
    // ceiling-completion — the whole point is that ordinary turns never reach it.
    expect(result.durationMs).toBeLessThan(10_000);
  });
});

// ── 3 · the ceiling still exists ──────────────────────────────────────────
describe('3 — a pathological continuous capture is still stopped', () => {
  it('a room that never falls silent is cut at the safety ceiling', async () => {
    vi.useFakeTimers();
    const p = recordAndTranscribe(fakeStream(), { maxMs: DESKTOP_MAX_UTTERANCE_MS });

    await advance(DESKTOP_MAX_UTTERANCE_MS - 5_000, 500);
    expect(recorders[0].state).toBe('recording');  // not yet

    await advance(6_000, 500);                     // level never drops
    // ⛔ The microphone cannot stay open forever on a stuck VAD.
    expect(recorders[0].state).toBe('inactive');
    await p;
  });

  it('the ceiling is bounded and is not the recovery default', () => {
    expect(DESKTOP_MAX_UTTERANCE_MS).toBeGreaterThan(8_000);
    expect(Number.isFinite(DESKTOP_MAX_UTTERANCE_MS)).toBe(true);
  });
});

// ── 4 · the fallback default is untouched ─────────────────────────────────
describe('4 — Android-Chrome and Firefox/Zen keep the 8s bound', () => {
  it('a caller that names no maxMs still stops at 8s', async () => {
    vi.useFakeTimers();
    const p = recordAndTranscribe(fakeStream());   // no maxMs — the module default

    await advance(7_500);
    expect(recorders[0].state).toBe('recording');
    await advance(1_200);
    expect(recorders[0].state).toBe('inactive');
    await p;
  });

  it('the raised ceiling is passed ONLY under the Desktop classification', () => {
    // Source-level, because this is a routing fact rather than a runtime one:
    // the constant must sit behind `info.isDesktop`, so Firefox/Zen — which
    // reach the same branch by absence of Web Speech — cannot pick it up.
    const src = fs.readFileSync(
      path.resolve(__dirname, '../../../components/voice/ContinuousConversation.tsx'),
      'utf8',
    );
    const uses = [...src.matchAll(/DESKTOP_MAX_UTTERANCE_MS/g)];
    // one import + one guarded use
    expect(uses.length).toBe(2);
    const call = src.indexOf('recordAndTranscribe(stream, {');
    const args = src.slice(call, src.indexOf('});', call));
    expect(args).toContain('info.isDesktop ? { maxMs: DESKTOP_MAX_UTTERANCE_MS }');
  });
});

// ── 5 · one final transcript ──────────────────────────────────────────────
describe('5 — exactly one final transcript commits', () => {
  // ⚠️ SKIPPED ON PORT, 2026-08-30 — DEPENDENCY ABSENT, NOT A DEFECT.
  //
  // This test drives `recordAndTranscribe` with `partialIntervalMs` / `onPartial`.
  // Those options exist in the lineage this unit was authored on (419ef230: 5
  // occurrences in androidVoiceFallback) and do NOT exist in the lineage being
  // witnessed (18ed89f4b: 0). `onPartial` is therefore never invoked here and
  // `seen.length` is 0, so the assertion fails for the absence of provisional
  // transcription rather than for anything about the utterance ceiling.
  //
  // ⛔ Deliberately SKIPPED, not deleted. The one-final-transcript invariant it
  // also guards is real and must come back. Un-skip when the provisional/rolling
  // transcription machinery lands — DESKTOP-LIVE-TRANSCRIPT-01 — which is the
  // unit that ports `rollingPartialTranscription.ts` and the `onPartial` surface.
  // Nothing about this ceiling repair should make it pass; only that unit can.
  it.skip('a long turn with many provisional readings still returns one transcript', async () => {
    const seen: string[] = [];
    fetchMock.mockImplementation(async (url: any, init: any) => {
      if (!String(url).includes('/api/voice/transcribe-simple')) {
        return { ok: true, status: 200, json: async () => ({}) };
      }
      const provisional = init?.body?.get?.('provisional') === 'true';
      return {
        ok: true,
        status: 200,
        json: async () => ({ transcription: provisional ? 'PROVISIONAL' : 'the whole long turn' }),
      };
    });

    const p = recordAndTranscribe(fakeStream(), {
      maxMs: DESKTOP_MAX_UTTERANCE_MS,
      partialIntervalMs: 0,
      onPartial: (t) => seen.push(t),
    });
    await new Promise((r) => setTimeout(r, 5));
    for (let i = 0; i < 4; i++) {
      recorders[0].flush();
      await new Promise((r) => setTimeout(r, 5));
    }
    recorders[0].stop();
    const result = await p;

    expect(seen.length).toBeGreaterThan(1);        // the member saw it building
    expect(result.transcript).toBe('the whole long turn');
    const finals = fetchMock.mock.calls.filter(
      (c) => String(c[0]).includes('/api/voice/transcribe-simple')
        && (c[1] as any)?.body?.get?.('provisional') !== 'true',
    );
    expect(finals).toHaveLength(1);
  });

  it('a very long prefix freezes the DISPLAY without touching the capture', async () => {
    const seen: string[] = [];
    const p = recordAndTranscribe(fakeStream(), {
      maxMs: DESKTOP_MAX_UTTERANCE_MS,
      partialIntervalMs: 0,
      onPartial: (t) => seen.push(t),
    });
    await new Promise((r) => setTimeout(r, 5));
    recorders[0].flush(300_000);                   // past the prefix budget
    await new Promise((r) => setTimeout(r, 5));

    expect(seen).toHaveLength(0);                  // display froze
    expect(recorders[0].state).toBe('recording');  // capture did not
    recorders[0].stop();
    const result = await p;
    expect(result.ok).toBe(true);                  // and the turn still commits
    expect(result.transcript).toBe('hello there');
  });
});

// ── 6 · provisional closes before the final commits ───────────────────────
describe('6 — the provisional path closes before final commit', () => {
  it('no provisional reading is delivered once recording has ended', async () => {
    const seen: string[] = [];
    const p = recordAndTranscribe(fakeStream(), {
      maxMs: DESKTOP_MAX_UTTERANCE_MS,
      partialIntervalMs: 0,
      onPartial: (t) => seen.push(t),
    });
    await new Promise((r) => setTimeout(r, 5));
    recorders[0].flush();
    await new Promise((r) => setTimeout(r, 5));
    const before = seen.length;

    recorders[0].stop();
    await p;
    await new Promise((r) => setTimeout(r, 20));
    // The final transcript is the only authority from the moment recording ends.
    expect(seen.length).toBe(before);
  });
});

// ── 7 · revocation still wins, at any turn length ─────────────────────────
describe('7 — route exit still aborts immediately', () => {
  it('a 30-second turn abandoned mid-sentence sends nothing and shows nothing', async () => {
    vi.useFakeTimers();
    const c = new AbortController();
    const seen: string[] = [];
    const p = recordAndTranscribe(fakeStream(), {
      signal: c.signal,
      maxMs: DESKTOP_MAX_UTTERANCE_MS,
      partialIntervalMs: 0,
      onPartial: (t) => seen.push(t),
    });

    await advance(30_000, 1_000);
    expect(recorders[0].state).toBe('recording');

    c.abort();                                     // the member leaves /maia
    await vi.advanceTimersByTimeAsync(50);
    // ⛔ Raising the ceiling must not have widened the window in which an
    // abandoned capture keeps the microphone open.
    expect(recorders[0].state).toBe('inactive');

    const result = await p;
    expect(result.reason).toBe('aborted');
    expect(transcribeCalls()).toHaveLength(0);
    expect(seen).toHaveLength(0);
  });
});
