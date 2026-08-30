/** @jest-environment jsdom */

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

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
/**
 * ⛔ jest has no `stubGlobal`. This is vitest's semantics, preserved exactly:
 * remember the ORIGINAL on first stub, and on restore put it back — or delete
 * the key if there was no original. Dropping these calls would have left a
 * mocked `fetch` leaking into every later test in the file.
 */
const __stubbed = new Map<string, unknown>();
const stubGlobal = (k: string, v: unknown) => {
  if (!__stubbed.has(k)) __stubbed.set(k, (globalThis as Record<string, unknown>)[k]);
  (globalThis as Record<string, unknown>)[k] = v;
};
const unstubAllGlobals = () => {
  for (const [k, v] of __stubbed) {
    if (v === undefined) delete (globalThis as Record<string, unknown>)[k];
    else (globalThis as Record<string, unknown>)[k] = v;
  }
  __stubbed.clear();
};

/**
 * ⛔ ENVIRONMENT GAP, not a stub. jsdom 20 ships `crypto` WITHOUT
 * `randomUUID`. The route is reached through `apiFetch`, which calls
 * `getOrCreateVisitorId()` first — so without this the request dies with
 * "crypto.randomUUID is not a function" BEFORE the stubbed `fetch` is ever
 * called (probe: 0 fetch calls), and every assertion past the transcribe step
 * fails for a reason that has nothing to do with what it is testing.
 *
 * Node's own implementation is used; nothing about the value is asserted.
 */
if (typeof (globalThis.crypto as { randomUUID?: unknown })?.randomUUID !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { randomUUID } = require('crypto');
  if (!globalThis.crypto) (globalThis as { crypto?: unknown }).crypto = {};
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: randomUUID, configurable: true, writable: true,
  });
}

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

const track = () => ({ stop: jest.fn(), kind: 'audio', addEventListener: jest.fn(), removeEventListener: jest.fn() });
const fakeStream = () => { const t = [track()]; return { getTracks: () => t, getAudioTracks: () => t } as any; };

let fetchMock: ReturnType<typeof jest.fn>;

beforeEach(() => {
  recorders = [];
  level = 0.5;
  (globalThis as any).MediaRecorder = FakeRecorder;
  (globalThis as any).AudioContext = class {
    state = 'running';
    createMediaStreamSource() { return { connect: jest.fn(), disconnect: jest.fn() }; }
    createAnalyser() {
      return {
        fftSize: 0,
        frequencyBinCount: 8,
        getFloatTimeDomainData: (a: Float32Array) => a.fill(level),
        connect: jest.fn(),
        disconnect: jest.fn(),
      };
    }
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
  };
  fetchMock = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ transcription: 'hello there' }) }));
  stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  jest.useRealTimers();
  unstubAllGlobals();
  jest.restoreAllMocks();
});

const transcribeCalls = () =>
  fetchMock.mock.calls.filter((c) => String(c[0]).includes('/api/voice/transcribe-simple'));

/** Advance mocked time and let the promise chain in between actually run. */
async function advance(ms: number, step = 100) {
  for (let t = 0; t < ms; t += step) {
    await jest.advanceTimersByTimeAsync(step);
  }
}

// ── 1 · speech past eight seconds is not cut off ──────────────────────────
describe('1 — Desktop speech continuing past 8 seconds does not stop at 8 seconds', () => {
  it('still recording at 12s, and at 30s, while the member keeps speaking', async () => {
    jest.useFakeTimers();
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
    jest.useFakeTimers();
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
    jest.useFakeTimers();
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
    jest.useFakeTimers();
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

// ── 5 & 6 · DEFERRED WITH THE PROVISIONAL PATH ───────────────────────────
//
// ⛔ NOT DELETED, AND NOT RELAXED. Two describes stood here — "exactly one
// final transcript commits" and "the provisional path closes before final
// commit". Both drive `recordAndTranscribe` with an `onPartial` callback.
//
// DESKTOP-PLATFORM-STT-01 deliberately carried only the utterance ceiling from
// 1c2c59af9 and left its provisional/interim half behind, so `RunOptions` in
// this tree has no `onPartial` at all: those tests exercise a capability the
// module does not yet have, and would assert against silence.
//
// They belong to the interim-text unit and travel with it — restore them from
// 1c2c59af9 when `onPartial` lands, not before. Nothing about the ceiling is
// left unproven by their absence: sections 1-4 and 7 cover it.

// ── 7 · revocation still wins, at any turn length ─────────────────────────
describe('7 — route exit still aborts immediately', () => {
  // ⛔ "and shows nothing" was dropped from this test's name and body along with
  // the provisional path. It drove `onPartial` and then asserted no provisional
  // text arrived — which this tree CANNOT fail, because `RunOptions` has no
  // `onPartial` to call. A green tick that cannot go red is not proof, so the
  // assertion travels with the interim-text unit rather than standing here
  // looking like coverage. What remains below is real: the ceiling does not
  // widen the window in which an abandoned capture keeps the microphone.
  it('a 30-second turn abandoned mid-sentence sends nothing', async () => {
    jest.useFakeTimers();
    const c = new AbortController();
    const p = recordAndTranscribe(fakeStream(), {
      signal: c.signal,
      maxMs: DESKTOP_MAX_UTTERANCE_MS,
    });

    await advance(30_000, 1_000);
    expect(recorders[0].state).toBe('recording');

    c.abort();                                     // the member leaves /maia
    await jest.advanceTimersByTimeAsync(50);
    // ⛔ Raising the ceiling must not have widened the window in which an
    // abandoned capture keeps the microphone open.
    expect(recorders[0].state).toBe('inactive');

    const result = await p;
    expect(result.reason).toBe('aborted');
    expect(transcribeCalls()).toHaveLength(0);
  });
});
