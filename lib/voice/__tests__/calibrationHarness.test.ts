/** @jest-environment jsdom */

/**
 * DESKTOP-VOICE-DEVICE-CALIBRATION-HARNESS-01 — prove the instrument measures.
 *
 * The calibration census established that no production threshold is ratifiable
 * from this repository: there are zero audio fixtures, zero recorded utterances
 * and zero real speech amplitudes. Synthetic structures showed the criterion
 * family's BEHAVIOUR — a ±1 phase term, an exact collision between a ~250 ms
 * impulse and a ~200 ms utterance, and a hard cliff at 0.012 — but cannot say
 * where a boundary belongs. This harness exists to collect the missing facts
 * from a real microphone.
 *
 * ⛔ IT IS AN INSTRUMENT, NOT A GATE. It decides nothing, admits nothing and
 * refuses nothing. It records, measures, and drops the audio.
 *
 * ⛔ THESE TESTS EXIST BECAUSE A GREEN HARNESS PROVES NOTHING BY ITSELF. Each
 * measurement below has a mutation that must break it; a harness whose readings
 * survive the deletion of the code that produces them is not a measuring
 * instrument. That failure has already occurred three times in this programme.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import './support/jsdomCrypto';

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

import { recordAndTranscribe, type CaptureCalibration } from '../androidVoiceFallback';

const QUIET = 0.005;   // the noise floor the module's own comment cites
const VOICED = 0.05;   // comfortably above SILENCE_RMS_THRESHOLD (0.012)

let amplitude = QUIET;
let ctxState = 'running';
let trackReady = 'live';
let trackMuted = false;
let analyserThrows = false;

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

const fakeStream = () => {
  const t = [{
    stop: jest.fn(), kind: 'audio',
    get readyState() { return trackReady; },
    get muted() { return trackMuted; },
    enabled: true,
    addEventListener: jest.fn(), removeEventListener: jest.fn(),
  }];
  return { getTracks: () => t, getAudioTracks: () => t } as unknown as MediaStream;
};

let fetchMock: ReturnType<typeof jest.fn>;
const uploads = () =>
  fetchMock.mock.calls.filter((c) => String(c[0]).includes('/api/voice/transcribe-simple'));

const OPTS = { maxMs: 8000, silenceHoldoffMs: 1500, minMs: 800 };

/** Play one amplitude per 100 ms analyser poll. */
async function play(pattern: number[]): Promise<void> {
  for (const a of pattern) {
    amplitude = a;
    await jest.advanceTimersByTimeAsync(100);
  }
}
const silence = (n: number) => Array(n).fill(QUIET) as number[];
const voiced = (n: number) => Array(n).fill(VOICED) as number[];

/** Run one calibration trial and return its measurement. */
async function trial(pattern: number[]): Promise<CaptureCalibration> {
  let out: CaptureCalibration | null = null;
  const run = recordAndTranscribe(fakeStream(), {
    ...OPTS,
    calibration: { onMeasure: (m) => { out = m; }, stopBeforeUpload: true },
  });
  await play(pattern);
  await run;
  if (!out) throw new Error('no measurement emitted');
  return out;
}

beforeEach(() => {
  jest.useFakeTimers();
  amplitude = QUIET; ctxState = 'running'; trackReady = 'live';
  trackMuted = false; analyserThrows = false;
  (globalThis as Record<string, unknown>).MediaRecorder = FakeRecorder;
  (globalThis as Record<string, unknown>).AudioContext = class {
    get state() { return ctxState; }
    createMediaStreamSource() { return { connect: jest.fn(), disconnect: jest.fn() }; }
    createAnalyser() {
      return {
        fftSize: 1024,
        getFloatTimeDomainData: (a: Float32Array) => {
          if (analyserThrows) throw new TypeError('analyser gone');
          a.fill(amplitude);
        },
        connect: jest.fn(), disconnect: jest.fn(),
      };
    }
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
  };
  fetchMock = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ transcription: 'X' }) }));
  stubGlobal('fetch', fetchMock);
});

afterEach(() => { jest.useRealTimers(); unstubAllGlobals(); jest.restoreAllMocks(); });

describe('the harness measures activity', () => {
  it('known quiet reads zero crossings', async () => {
    const m = await trial(silence(20));
    expect(m.crossingCount).toBe(0);
    expect(m.scheduledPolls).toBeGreaterThan(0);
    expect(m.trustedPolls).toBe(m.scheduledPolls);
  });

  it('known above-threshold activity reads crossings', async () => {
    const m = await trial([...voiced(5), ...silence(20)]);
    expect(m.crossingCount).toBeGreaterThan(0);
  });

  it('more activity reads more crossings — the measurement is graded, not binary', async () => {
    const few = await trial([...voiced(2), ...silence(20)]);
    const many = await trial([...voiced(10), ...silence(20)]);
    expect(many.crossingCount).toBeGreaterThan(few.crossingCount);
  });

  it('bounded RMS summary tracks amplitude BELOW the crossing threshold', async () => {
    // The one place a summary earns its place: under the 0.012 cliff every
    // crossing-derived shape reports a flat zero, and this does not.
    const quiet = await trial(silence(20));
    const under = await trial([...Array(6).fill(0.0100), ...silence(20)]);
    expect(under.crossingCount).toBe(0);
    expect(quiet.crossingCount).toBe(0);
    expect(under.rmsMax).toBeGreaterThan(quiet.rmsMax);
  });
});

describe('the harness refuses to certify an untrustworthy apparatus', () => {
  it('a non-running context marks the trial untrusted', async () => {
    ctxState = 'suspended';
    const m = await trial(silence(20));
    expect(m.contextTrustBroken).toBe(true);
  });

  it('an ended track marks the trial untrusted', async () => {
    trackReady = 'ended';
    const m = await trial(silence(20));
    expect(m.trackEnded).toBe(true);
  });

  it('a browser/OS-muted track marks the trial untrusted', async () => {
    trackMuted = true;
    const m = await trial(silence(20));
    expect(m.trackMuted).toBe(true);
  });

  it('a throwing analyser is counted, not silently absorbed', async () => {
    // ⛔ A caught read still returns before the stop comparisons — deliberately,
    // so the harness reproduces production's behaviour rather than repairing it.
    // The capture therefore runs to the hard ceiling (maxMs + 200), which is why
    // this trial is played out to 9 s rather than 2 s.
    analyserThrows = true;
    const m = await trial(silence(90));
    expect(m.analyserErrors).toBeGreaterThan(0);
    // Untrusted polls contribute no acoustic evidence.
    expect(m.crossingCount).toBe(0);
  });

  it('untrusted polls are excluded from the trusted count', async () => {
    ctxState = 'suspended';
    const m = await trial([...voiced(10), ...silence(20)]);
    expect(m.trustedPolls).toBe(0);
    expect(m.crossingCount).toBe(0);
  });
});

describe('the harness never sends audio anywhere', () => {
  it('a measured capture makes no transcription request', async () => {
    await trial([...voiced(10), ...silence(20)]);
    // ⛔ Filtered to the transcription endpoint: logVoiceEvent ships telemetry
    // over the same fetch, so a bare call count would conflate diagnostics with
    // the member's audio leaving the device.
    expect(uploads()).toHaveLength(0);
  });

  it('a silent capture still yields a measurement and still sends nothing', async () => {
    const m = await trial(silence(20));
    expect(m.durationMs).toBeGreaterThan(0);
    expect(uploads()).toHaveLength(0);
  });
});

describe('production is untouched when calibration is absent', () => {
  it('an ordinary capture still uploads and still returns a transcript', async () => {
    const run = recordAndTranscribe(fakeStream(), OPTS);
    await play([...voiced(5), ...silence(20)]);
    const r = await run;
    expect(uploads()).toHaveLength(1);
    expect(r.ok).toBe(true);
    expect(r.transcript).toBe('X');
  });

  it('stop timing is identical with and without the instrument', async () => {
    // ⛔ THE INVARIANT. desktopUtteranceLimit owns stop timing; if instrumenting
    // moved it, this diverges and that suite would fail too.
    const run = recordAndTranscribe(fakeStream(), OPTS);
    await play(silence(20));
    const plain = await run;

    const measured = await trial(silence(20));
    expect(measured.durationMs).toBe(plain.durationMs);
  });
});
