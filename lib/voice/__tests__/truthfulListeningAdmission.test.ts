/** @jest-environment jsdom */

/**
 * PLATFORM-D02A-01 — Truthful Listening Admission.
 *
 * ⛔ THE DEFECT. `/maia` declared LISTENING when `getUserMedia` resolved —
 * before MediaRecorder existed, before the analyser existed, before one sample
 * was admitted. The claim was therefore true through a suspended AudioContext,
 * a muted or ended track, a transcribe route that 410s, and a recording that
 * never stops. One word for every failure, distinguishing none of them. It is
 * the first lie on the path the founder actually walks
 * (docs/ops/DESKTOP_PLATFORM_CONVERSATION_01_CENSUS.md §3).
 *
 * This is MAIA-D02A's rule — frame receipt is the authority for listening,
 * never graph acquisition — asserted on the surface D02A never covered.
 *
 * ⛔ WHAT THESE TESTS DO NOT CLAIM. They do not claim a suspended AudioContext
 * caused the founder's failure, or that the 120 s ceiling did. Those remain
 * hypotheses. What is proven here is that the apparatus can no longer say it is
 * hearing when it is not, and that when it never hears it says so in its own
 * name rather than blaming the member for speaking unclearly.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import './support/jsdomCrypto';
import { recordAndTranscribe, type CaptureMilestone } from '../androidVoiceFallback';

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

let recorders: FakeRecorder[] = [];

class FakeRecorder {
  static isTypeSupported = () => true;
  state: 'inactive' | 'recording' = 'recording';
  ondataavailable: ((e: any) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public stream: any, public opts: any) { recorders.push(this); }
  start() { this.state = 'recording'; }
  stop() {
    if (this.state === 'inactive') return;
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['x'], { type: 'audio/webm' }) });
    this.onstop?.();
  }
}

/** Above the module's 0.012 RMS threshold: a member speaking throughout. */
const SPEAKING_LEVEL = 0.56;

/**
 * A track whose health we control. Real MediaStreamTracks always carry these;
 * the point of the parameters is to simulate the apparatus failing, which is
 * the whole subject of this unit.
 */
const track = (o: { readyState?: string; muted?: boolean } = {}) => ({
  stop: jest.fn(), kind: 'audio',
  readyState: o.readyState ?? 'live',
  muted: o.muted ?? false,
  addEventListener: jest.fn(), removeEventListener: jest.fn(),
});
const streamOf = (t: any) => { const ts = [t]; return { getTracks: () => ts, getAudioTracks: () => ts } as any; };
const liveStream = () => streamOf(track());

/** `contextState` is the lever: 'suspended' is a graph that never runs. */
function installAudio(contextState: 'running' | 'suspended') {
  (globalThis as any).AudioContext = class {
    state = contextState;
    createMediaStreamSource() { return { connect: jest.fn(), disconnect: jest.fn() }; }
    createAnalyser() {
      return {
        fftSize: 0, frequencyBinCount: 8,
        getFloatTimeDomainData: (a: Float32Array) => a.fill(SPEAKING_LEVEL),
        connect: jest.fn(), disconnect: jest.fn(),
      };
    }
    // ⛔ A suspended context that cannot resume — the apparatus this unit is
    // about. `resume()` resolving without changing `state` is exactly what a
    // blocked autoplay policy looks like from here.
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
  };
}

let fetchMock: ReturnType<typeof jest.fn>;

beforeEach(() => {
  recorders = [];
  (globalThis as any).MediaRecorder = FakeRecorder;
  installAudio('running');
  fetchMock = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ transcription: 'hello there' }) }));
  stubGlobal('fetch', fetchMock);
});
afterEach(() => { unstubAllGlobals(); jest.restoreAllMocks(); });

/**
 * ⛔ These fakes speak CONTINUOUSLY (SPEAKING_LEVEL is above threshold on every
 * poll), so the silence-stop never fires and a capture would run to its ceiling.
 * Every completing test therefore bounds `maxMs` explicitly. That is a property
 * of the fixture, not a tuning of the module — production silence-stops.
 */
const settle = () => new Promise((r) => setTimeout(r, 20));

const transcribeCalls = () =>
  fetchMock.mock.calls.filter((c) => String(c[0]).includes('/api/voice/transcribe-simple'));

/** Collect milestones in the order the capture reported them. */
function collector() {
  const seen: CaptureMilestone[] = [];
  const detail: Record<string, any> = {};
  return {
    seen, detail,
    onMilestone: (stage: CaptureMilestone, d?: Record<string, unknown>) => {
      seen.push(stage);
      detail[stage] = d;
    },
  };
}

// ── 1 · admission is what grounds the claim ─────────────────────────────────

describe('1 — a capture reports admission only when audio is demonstrably arriving', () => {
  it('a running graph with a live track admits, and the walk can be read in order', async () => {
    const c = collector();
    const result = await recordAndTranscribe(liveStream(), {
      onMilestone: c.onMilestone, minMs: 10, maxMs: 350,
    });

    expect(result.ok).toBe(true);
    // ⭐ The chain the founder asked to be able to read.
    expect(c.seen[0]).toBe('recorder_created');
    expect(c.seen).toContain('audio_admitted');
    expect(c.seen).toContain('speech_detected');
    expect(c.seen.at(-1)).toBe('capture_stopped');
    // Admission precedes speech: you cannot hear words before you hear anything.
    expect(c.seen.indexOf('audio_admitted')).toBeLessThan(c.seen.indexOf('speech_detected'));
    expect(c.detail.capture_stopped.admitted).toBe(true);
  });

  it('each stage fires at most once, so a surface cannot re-enter a state it left', async () => {
    const c = collector();
    await recordAndTranscribe(liveStream(), { onMilestone: c.onMilestone, minMs: 10, maxMs: 350 });
    for (const stage of ['recorder_created', 'audio_admitted', 'speech_detected'] as CaptureMilestone[]) {
      expect(c.seen.filter((s) => s === stage).length).toBe(1);
    }
  });

  it('an observer that throws cannot break the capture it is observing', async () => {
    const result = await recordAndTranscribe(liveStream(), {
      onMilestone: () => { throw new Error('a careless surface'); },
      minMs: 10, maxMs: 350,
    });
    expect(result.ok).toBe(true);
    expect(result.transcript).toBe('hello there');
  });
});

// ── 2 · when it never hears, it says so ─────────────────────────────────────

describe('2 — an apparatus that never hears names itself, and does not blame the member', () => {
  it('a graph that never runs is refused as no_audio_admitted, not transcribed', async () => {
    installAudio('suspended');
    const c = collector();
    const result = await recordAndTranscribe(liveStream(), {
      onMilestone: c.onMilestone, admissionDeadlineMs: 300, maxMs: 60_000,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('no_audio_admitted');
    expect(c.seen).not.toContain('audio_admitted');

    // ⛔ AND THE MEMBER'S AUDIO NEVER LEFT THE DEVICE. Posting it would return an
    // empty transcript and tell the member they said nothing — blaming them for
    // an apparatus that was not listening.
    expect(transcribeCalls().length).toBe(0);
  });

  it('a muted track is refused, even with the graph running', async () => {
    const result = await recordAndTranscribe(streamOf(track({ muted: true })), {
      admissionDeadlineMs: 300, maxMs: 60_000,
    });
    expect(result.reason).toBe('no_audio_admitted');
    expect(transcribeCalls().length).toBe(0);
  });

  it('an ended track is refused', async () => {
    const result = await recordAndTranscribe(streamOf(track({ readyState: 'ended' })), {
      admissionDeadlineMs: 300, maxMs: 60_000,
    });
    expect(result.reason).toBe('no_audio_admitted');
  });

  it('⭐ it does not wait out the utterance ceiling to say so', async () => {
    // The whole symptom: Desktop carries a 120 s ceiling, so a capture that
    // never hears used to sit in LISTENING for two minutes. The admission
    // deadline is independent of that ceiling and fires first.
    installAudio('suspended');
    const started = Date.now();
    const result = await recordAndTranscribe(liveStream(), {
      admissionDeadlineMs: 300, maxMs: 120_000,
    });
    expect(result.reason).toBe('no_audio_admitted');
    expect(Date.now() - started).toBeLessThan(3000);
  });
});

// ── 3 · the deadline cannot cut a real utterance short ──────────────────────

describe('3 — admission bounds only admission', () => {
  it('once audio is admitted the deadline can never fire, however long the member speaks', async () => {
    const c = collector();
    // A deadline far shorter than the recording. Admission happens on the first
    // poll, so the capture must run to its own silence/ceiling end regardless.
    const p = recordAndTranscribe(liveStream(), {
      onMilestone: c.onMilestone,
      admissionDeadlineMs: 50,
      minMs: 400, silenceHoldoffMs: 10_000, maxMs: 700,
    });
    const result = await p;
    expect(c.seen).toContain('audio_admitted');
    // Ended on its own ceiling, NOT on admission.
    expect(result.reason).not.toBe('no_audio_admitted');
    expect(c.detail.capture_stopped.reason).toBe('max');
  });

  it('a capture that ends before its first poll is not accused of never hearing', async () => {
    // ⛔ FOUND BY sovereignCaptureLifecycle T3/T7/T8. Admission is observed on a
    // 100 ms poll, so a capture stopped immediately has proved nothing either
    // way. Reading the bare flag reported `no_audio_admitted` for a perfectly
    // good short recording — and for one the member had ABORTED.
    const p = recordAndTranscribe(liveStream(), { minMs: 10, maxMs: 60_000 });
    await settle();                            // let the recorder be constructed
    recorders[0].stop();                       // then end it before a poll matters
    const result = await p;
    expect(result.reason).not.toBe('no_audio_admitted');
  });

  it('an aborted capture keeps its own reason', async () => {
    installAudio('suspended');
    const ac = new AbortController();
    const p = recordAndTranscribe(liveStream(), { signal: ac.signal, admissionDeadlineMs: 5000 });
    ac.abort();
    const result = await p;
    expect(result.reason).toBe('aborted');
  });
});

// ── 4 · callers that ask for nothing are unchanged ──────────────────────────

describe('4 — the unit is additive', () => {
  it('a caller passing no onMilestone records exactly as before', async () => {
    const result = await recordAndTranscribe(liveStream(), { minMs: 10, maxMs: 350 });
    expect(result.ok).toBe(true);
    expect(result.transcript).toBe('hello there');
    expect(transcribeCalls().length).toBe(1);
  });
});
