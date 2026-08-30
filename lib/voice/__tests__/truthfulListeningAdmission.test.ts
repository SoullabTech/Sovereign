/** @jest-environment jsdom */

/**
 * PLATFORM-D02A-01 — Truthful Listening Admission.
 *
 * ⛔ THE DEFECT. `/maia` declared LISTENING when `getUserMedia` resolved —
 * before MediaRecorder existed, before the analyser existed, before one sample
 * was admitted. The claim was therefore true through a suspended AudioContext,
 * a muted or ended track, a transcribe route that 410s, and a recording that
 * never stopped. One word for every failure, distinguishing none of them.
 *
 * This is MAIA-D02A's rule — frame receipt is the authority for listening,
 * never graph acquisition — asserted on the canonical `/maia` surface, which is
 * what MAIA Desktop actually displays.
 *
 * ⛔ WHAT THESE TESTS DO NOT CLAIM. They do not claim a suspended AudioContext
 * caused the observed Desktop failure, nor that the utterance ceiling did.
 * Those remain hypotheses. What is proven is that the apparatus can no longer
 * say it is hearing when it is not, and that when it never hears it says so in
 * its own name rather than blaming the member for speaking unclearly.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { recordAndTranscribe, type CaptureMilestone } from '../androidVoiceFallback';

/**
 * ⛔ ENVIRONMENT GAP, not a stub — carried verbatim from
 * `desktopUtteranceLimit.test.ts`, which is this tree's convention. jsdom 20
 * ships `crypto` WITHOUT `randomUUID`. The route is reached through
 * `apiFetch`, which calls `getOrCreateVisitorId()` first — so without this the
 * request dies with "crypto.randomUUID is not a function" BEFORE the stubbed
 * `fetch` is ever called, and the upload assertions below fail for a reason
 * that has nothing to do with what they test.
 */
if (typeof (globalThis.crypto as { randomUUID?: unknown })?.randomUUID !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { randomUUID } = require('crypto');
  if (!globalThis.crypto) (globalThis as { crypto?: unknown }).crypto = {};
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: randomUUID, configurable: true, writable: true,
  });
}

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
let constructed = 0;

class FakeRecorder {
  static isTypeSupported = () => true;
  state: 'inactive' | 'recording' = 'recording';
  ondataavailable: ((e: any) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public stream: any, public opts: any) { recorders.push(this); constructed++; }
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
    // A suspended context that cannot resume — `resume()` resolving without
    // changing `state` is what a blocked autoplay policy looks like from here.
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
  };
}

let fetchMock: ReturnType<typeof jest.fn>;

beforeEach(() => {
  recorders = []; constructed = 0;
  (globalThis as any).MediaRecorder = FakeRecorder;
  installAudio('running');
  fetchMock = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ transcription: 'hello there' }) }));
  stubGlobal('fetch', fetchMock);
});
afterEach(() => { unstubAllGlobals(); jest.restoreAllMocks(); });

/**
 * ⛔ These fakes speak CONTINUOUSLY, so the silence-stop never fires and a
 * capture would run to its ceiling. Completing tests bound `maxMs` explicitly.
 * That is a property of the fixture, not a tuning of the module.
 */
const settle = () => new Promise((r) => setTimeout(r, 20));

const transcribeCalls = () =>
  fetchMock.mock.calls.filter((c) => String(c[0]).includes('/api/voice/transcribe-simple'));

function collector() {
  const seen: CaptureMilestone[] = [];
  const detail: Record<string, any> = {};
  return {
    seen, detail,
    onMilestone: (stage: CaptureMilestone, d?: Record<string, unknown>) => {
      seen.push(stage); detail[stage] = d;
    },
  };
}

// ── 1, 2, 3 · what may and may not ground the claim ─────────────────────────

describe('what grounds LISTENING', () => {
  it('1/2 — neither the microphone handle nor the recorder alone admits audio', async () => {
    // ⛔ The suspended graph is the case that separates the three. getUserMedia
    // has resolved (the caller holds a stream), MediaRecorder is constructed and
    // started — and NOTHING is being heard. Under the old contract this state
    // displayed LISTENING.
    installAudio('suspended');
    const c = collector();
    await recordAndTranscribe(liveStream(), {
      onMilestone: c.onMilestone, admissionDeadlineMs: 300, maxMs: 60_000,
    });
    expect(constructed).toBe(1);                       // the recorder WAS built
    expect(c.seen).toContain('recorder_created');      // and said so
    expect(c.seen).not.toContain('audio_admitted');    // and that is not admission
  });

  it('3 — admitted audio reports admission, and the walk reads in order', async () => {
    const c = collector();
    const result = await recordAndTranscribe(liveStream(), { minMs: 10, maxMs: 350, onMilestone: c.onMilestone });
    expect(result.ok).toBe(true);
    expect(c.seen[0]).toBe('recorder_created');
    expect(c.seen).toContain('audio_admitted');
    expect(c.seen).toContain('speech_detected');
    expect(c.seen.at(-1)).toBe('capture_stopped');
    // You cannot hear words before you hear anything.
    expect(c.seen.indexOf('audio_admitted')).toBeLessThan(c.seen.indexOf('speech_detected'));
  });

  it('each stage fires at most once, so a surface cannot re-enter a state it left', async () => {
    const c = collector();
    await recordAndTranscribe(liveStream(), { minMs: 10, maxMs: 350, onMilestone: c.onMilestone });
    for (const stage of ['recorder_created', 'audio_admitted', 'speech_detected'] as CaptureMilestone[]) {
      expect(c.seen.filter((s) => s === stage).length).toBe(1);
    }
  });
});

// ── 4, 5 · explicit deadness, and naming the failure ────────────────────────

describe('an apparatus that never hears names itself', () => {
  it('5 — a graph that never runs returns no_audio_admitted and uploads nothing', async () => {
    installAudio('suspended');
    const result = await recordAndTranscribe(liveStream(), { admissionDeadlineMs: 300, maxMs: 60_000 });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('no_audio_admitted');
    // ⛔ The member's audio never left the device. Posting it returns an empty
    // transcript and tells the member they said nothing — blaming them for an
    // apparatus that was not listening.
    expect(transcribeCalls().length).toBe(0);
  });

  it('4 — a muted track prevents admission even with the graph running', async () => {
    const result = await recordAndTranscribe(streamOf(track({ muted: true })), {
      admissionDeadlineMs: 300, maxMs: 60_000,
    });
    expect(result.reason).toBe('no_audio_admitted');
    expect(transcribeCalls().length).toBe(0);
  });

  it('4 — an ended track prevents admission', async () => {
    const result = await recordAndTranscribe(streamOf(track({ readyState: 'ended' })), {
      admissionDeadlineMs: 300, maxMs: 60_000,
    });
    expect(result.reason).toBe('no_audio_admitted');
  });

  it('⭐ it does not wait out the utterance ceiling to say so', async () => {
    // A capture that never hears used to sit in LISTENING until the ceiling.
    // The admission deadline is independent of it and fires first.
    installAudio('suspended');
    const started = Date.now();
    const result = await recordAndTranscribe(liveStream(), { admissionDeadlineMs: 300, maxMs: 120_000 });
    expect(result.reason).toBe('no_audio_admitted');
    expect(Date.now() - started).toBeLessThan(3000);
  });
});

// ── 6, 7 · the deadline bounds admission and nothing else ───────────────────

describe('admission bounds only admission', () => {
  it('7 — once admitted, the deadline can never end the utterance', async () => {
    const c = collector();
    // A deadline far shorter than the recording. Admission happens on the first
    // poll, so the capture must run to its own end regardless.
    const result = await recordAndTranscribe(liveStream(), {
      onMilestone: c.onMilestone,
      admissionDeadlineMs: 50,
      minMs: 400, silenceHoldoffMs: 10_000, maxMs: 700,
    });
    expect(c.seen).toContain('audio_admitted');
    expect(result.reason).not.toBe('no_audio_admitted');
    expect(c.detail.capture_stopped.reason).toBe('max');
  });

  it('6 — a very short capture is not falsely relabeled', async () => {
    // ⛔ Admission is observed on a 100 ms poll, so a capture ending before its
    // first tick has proved nothing either way. Keying the verdict on a bare
    // flag would accuse a perfectly good short recording of never being heard.
    const p = recordAndTranscribe(liveStream(), { minMs: 10, maxMs: 60_000 });
    await settle();
    recorders[0].stop();
    const result = await p;
    expect(result.reason).not.toBe('no_audio_admitted');
  });

  it('6 — an aborted capture keeps its own reason', async () => {
    installAudio('suspended');
    const ac = new AbortController();
    const p = recordAndTranscribe(liveStream(), { signal: ac.signal, admissionDeadlineMs: 5000 });
    ac.abort();
    const result = await p;
    expect(result.reason).toBe('aborted');
  });
});

// ── 8, 11 · the observer, and callers who asked for nothing ─────────────────

describe('the unit is additive', () => {
  it('8 — a milestone observer that throws cannot break the recording', async () => {
    const result = await recordAndTranscribe(liveStream(), {
      onMilestone: () => { throw new Error('a careless surface'); },
      minMs: 10, maxMs: 350,
    });
    expect(result.ok).toBe(true);
    expect(result.transcript).toBe('hello there');
  });

  it('11 — a caller passing no onMilestone records exactly as before', async () => {
    const result = await recordAndTranscribe(liveStream(), { minMs: 10, maxMs: 350 });
    expect(result.ok).toBe(true);
    expect(result.transcript).toBe('hello there');
    expect(transcribeCalls().length).toBe(1);
  });
});

// ── 9 · the telemetry receiver accepts the new event ────────────────────────

describe('9 — the new observation is not silently dropped', () => {
  it('voice_capture_milestone is in both the client vocabulary and the receiver allow-list', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, rel), 'utf8');
    // ⛔ BOTH ENDS. The client type union is what makes the call compile; the
    // receiver allow-list is what makes it survive the request. Registering one
    // without the other ships instrumentation that vanishes at the door.
    expect(read('../voiceDiagnostics.ts')).toContain("'voice_capture_milestone'");
    expect(read('../../../app/api/telemetry/client/route.ts')).toContain("'voice_capture_milestone'");
  });
});
