/** @jest-environment jsdom */

/**
 * DESKTOP-VOICE-GHOST-REARM-01 — a non-empty transcription is not evidence that
 * the member spoke.
 *
 * ⛔ THE DEFECT, DEVICE-WITNESSED 2026-08-30 on candidate 1c2c59af9. After a
 * legitimate 32.749s / 278-character turn, hands-free re-armed on
 * `maia_stopped_speaking` and captured a room in which nobody said anything.
 * Whisper returned "You". `readTranscript()` — working correctly — reported it
 * non-empty, and `if (result.ok && result.transcript)` authored it as the
 * member's words. MAIA answered the ghost, which re-armed capture, which
 * produced "You" again. The telemetry marked the second one
 * `sameAsPrevious: true` and dispatched it anyway, because
 * `dispatchProvenance.ts` states plainly that `sameAsPrevious` is REPORTED,
 * never acted on. No guard failed. No guard was ever asked.
 *
 * ⛔ WHY THE OBVIOUS FIX IS THE WRONG ONE. The two ghost captures were 1.503s
 * and 2.094s. The recorder stops when `elapsed >= minMs && silenceFor >=
 * silenceHoldoffMs`, so those durations are themselves evidence:
 *
 *     1.503s — `lastLoudAt` never moved. Not one sample crossed the threshold.
 *     2.094s — one crossing at ~594ms, then nothing.
 *
 * A boolean `speechObserved` set by any single crossing would have refused the
 * first and admitted the second. One ambient blip satisfies it. The evidence has
 * to be voiced *duration*, which is why the second case below is the load-bearing
 * one — it is the negative control for the fix we did not make.
 *
 * ⛔ WHY THE GATE IS IN THE PRODUCER. Three call sites in
 * `ContinuousConversation.tsx` (`fallback` :1263, `android_fallback` :2819,
 * `web_whisper` :3503 — the one in the trace) each guard on
 * `result.ok && result.transcript` before `witnessDispatch` and `onTranscript`.
 * Refusing inside `recordAndTranscribe` makes all three safe by construction and
 * gives a fourth call site the refusal for free. So these tests assert `ok:
 * false` AND that no upload happened: the refusal lands strictly earlier than
 * dispatch — the silent capture never leaves the device at all.
 *
 * These are written as attempts to author words the member did not say.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

/**
 * ⛔ jest has no `stubGlobal`. This is vitest's semantics, preserved exactly:
 * remember the ORIGINAL on first stub, and on restore put it back — or delete
 * the key if there was no original.
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

import { recordAndTranscribe } from '../androidVoiceFallback';

/** The VAD polls every 100ms; one entry in a pattern below is one poll. */
const TICK_MS = 100;
/** Comfortably above SILENCE_RMS_THRESHOLD (0.012). */
const VOICED = 0.05;
/** A silent room. The noise floor sits ~0.005; this is below even that. */
const QUIET = 0;

/** Current analyser amplitude. The fake analyser fills its buffer with this, so
 *  RMS of a constant-filled buffer is exactly |amplitude|. */
let amplitude = QUIET;

class FakeRecorder {
  static isTypeSupported = () => true;
  state: 'inactive' | 'recording' = 'recording';
  ondataavailable: ((e: unknown) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public stream: unknown, public opts: unknown) {}
  start() { this.state = 'recording'; }
  stop() {
    if (this.state === 'inactive') return;
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['x'], { type: 'audio/webm' }) });
    this.onstop?.();
  }
}

const track = () => ({ stop: jest.fn(), kind: 'audio', addEventListener: jest.fn(), removeEventListener: jest.fn() });
const fakeStream = () => { const t = [track()]; return { getTracks: () => t, getAudioTracks: () => t } as unknown as MediaStream; };

let fetchMock: ReturnType<typeof jest.fn>;

/**
 * jsdom here provides no global `Response`, so this is the shape
 * `recordAndTranscribe` actually consumes: `.ok`, `.status`, `.json()`.
 */
const transcriptionResponse = (transcription: string) => ({
  ok: true,
  status: 200,
  json: async () => ({ success: true, transcription }),
});

/**
 * ⛔ `logVoiceEvent` POSTs telemetry to `/api/telemetry/client` through the same
 * global `fetch`, so EVERY run of this module produces fetch calls whether or
 * not audio was uploaded. Asserting on the bare call count would make
 * "the silent capture never left the device" pass or fail on telemetry volume.
 * Only calls to the transcription endpoint count as the member's audio leaving.
 */
const uploadCalls = () =>
  fetchMock.mock.calls.filter((c) => String(c[0]).includes('/api/voice/transcribe-simple'));

/** Play an amplitude pattern, one entry per 100ms VAD poll. */
async function speak(pattern: number[]): Promise<void> {
  for (const a of pattern) {
    amplitude = a;
    await jest.advanceTimersByTimeAsync(TICK_MS);
  }
}

const silence = (ticks: number) => Array(ticks).fill(QUIET) as number[];
const voiced = (ticks: number) => Array(ticks).fill(VOICED) as number[];

/** Short windows so a case is a few hundred ticks of fake time, not real waiting. */
const OPTS = { maxMs: 8000, silenceHoldoffMs: 1500, minMs: 800 };

beforeEach(() => {
  jest.useFakeTimers();
  amplitude = QUIET;
  // jsdom ships no `crypto.randomUUID`, and `apiFetch` calls it while building
  // the visitor id — without this every upload dies as `transcribe_http_error`
  // and the admit-cases below fail for a reason that has nothing to do with
  // authorship.
  if (typeof (globalThis.crypto as { randomUUID?: unknown })?.randomUUID !== 'function') {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { ...globalThis.crypto, randomUUID: () => '00000000-0000-4000-8000-000000000000' },
    });
  }
  (globalThis as Record<string, unknown>).MediaRecorder = FakeRecorder;
  (globalThis as Record<string, unknown>).AudioContext = class {
    state = 'running';
    createMediaStreamSource() { return { connect: jest.fn(), disconnect: jest.fn() }; }
    createAnalyser() {
      return {
        fftSize: 1024,
        // ⛔ The real code reads FLOAT time-domain data. A fake that only offers
        // getByteTimeDomainData would throw inside the poll and never measure
        // anything — the test would pass for the wrong reason.
        getFloatTimeDomainData: (a: Float32Array) => a.fill(amplitude),
        connect: jest.fn(),
        disconnect: jest.fn(),
      };
    }
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
  };
  fetchMock = jest.fn(async () => transcriptionResponse('You'));
  stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  jest.useRealTimers();
  unstubAllGlobals();
  jest.restoreAllMocks();
});

describe('DESKTOP-VOICE-GHOST-REARM-01 — capture cannot author what it never heard', () => {
  it('refuses a capture in which nothing was ever said (the 1.503s ghost)', async () => {
    const run = recordAndTranscribe(fakeStream(), OPTS);
    await speak(silence(20));
    const result = await run;

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('no_speech_observed');
  });

  it('does not send a silent capture off the device at all', async () => {
    const run = recordAndTranscribe(fakeStream(), OPTS);
    await speak(silence(20));
    await run;

    // ⛔ Strictly earlier than dispatch. The member's audio never left.
    expect(uploadCalls()).toHaveLength(0);
  });

  it('refuses a single ambient blip in an otherwise silent capture (the 2.094s ghost)', async () => {
    // ⛔ THE NEGATIVE CONTROL FOR THE FIX WE DID NOT MAKE. A boolean
    // `speechObserved` set by any crossing would return ok:true here, and this
    // exact shape was authored as member speech on the device.
    const run = recordAndTranscribe(fakeStream(), OPTS);
    await speak([...silence(5), VOICED, ...silence(20)]);
    const result = await run;

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('no_speech_observed');
    expect(uploadCalls()).toHaveLength(0);
  });

  it('admits a short real utterance ("Hi")', async () => {
    fetchMock.mockImplementation(async () => transcriptionResponse('Hi'));

    const run = recordAndTranscribe(fakeStream(), OPTS);
    await speak([...voiced(3), ...silence(20)]);
    const result = await run;

    // ⛔ THE CALIBRATION GUARD. Raising MIN_VOICED_MS past ~300ms starts
    // refusing the member's actual words, which is the worse failure. If this
    // case ever goes red, the floor was raised too far — do not relax the two
    // ghost cases to compensate.
    expect(result.ok).toBe(true);
    expect(result.transcript).toBe('Hi');
    expect(uploadCalls()).toHaveLength(1);
  });

  it('still admits sustained speech', async () => {
    fetchMock.mockImplementation(async () => transcriptionResponse('the blue lantern is beside the cedar tree'));

    const run = recordAndTranscribe(fakeStream(), OPTS);
    await speak([...voiced(20), ...silence(20)]);
    const result = await run;

    expect(result.ok).toBe(true);
    expect(result.transcript).toBe('the blue lantern is beside the cedar tree');
  });

  it('reports the refusal as its own reason, not as a transcription failure', async () => {
    // A ghost is not `empty_transcript`: Whisper answered, and answered
    // non-emptily. Collapsing the two would hide the authorship defect inside a
    // reason that already existed and already looked benign.
    const run = recordAndTranscribe(fakeStream(), OPTS);
    await speak(silence(20));
    const result = await run;

    expect(result.reason).not.toBe('empty_transcript');
    expect(result.reason).not.toBe('empty_blob');
    expect(result.reason).toBe('no_speech_observed');
  });
});
