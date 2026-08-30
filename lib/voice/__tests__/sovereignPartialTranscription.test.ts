/** @jest-environment jsdom */

/**
 * DESKTOP-SOVEREIGN-STT-INTERIM-01 — the member must see MAIA hearing them,
 * and must never see a provisional word mistaken for a turn.
 *
 * ⛔ THE DEFECT. The Desktop sovereign transport was one-shot: record, wait for
 * silence, POST, get one transcript. Nothing appeared while the member spoke.
 *
 * ⛔ THE CONSTRAINT THE FIX MUST NOT BREAK. A member turn is born once.
 * Provisional chunks may reach the display and nothing else. These tests are
 * written as attempts to (a) get provisional text to stand in for a turn,
 * (b) get provisional audio off the device after revocation, and (c) let a
 * stale provisional reading overwrite a newer one.
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

import { recordAndTranscribe } from '../androidVoiceFallback';
import { createRollingPartialTranscriber } from '../rollingPartialTranscription';

let recorders: FakeRecorder[] = [];

/**
 * A MediaRecorder that honours a timeslice: `flush()` stands in for the
 * periodic `dataavailable` the browser fires while recording.
 */
class FakeRecorder {
  static isTypeSupported = () => true;
  state: 'inactive' | 'recording' = 'recording';
  timeslice?: number;
  ondataavailable: ((e: any) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public stream: any, public opts: any) { recorders.push(this); }
  start(timeslice?: number) { this.state = 'recording'; this.timeslice = timeslice; }
  /** One periodic chunk, big enough to clear the min-prefix-bytes floor. */
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

const track = () => ({ stop: jest.fn(), kind: 'audio', addEventListener: jest.fn(), removeEventListener: jest.fn() });
const fakeStream = () => { const t = [track()]; return { getTracks: () => t, getAudioTracks: () => t } as any; };

let fetchMock: ReturnType<typeof jest.fn>;

beforeEach(() => {
  recorders = [];
  (globalThis as any).MediaRecorder = FakeRecorder;
  (globalThis as any).AudioContext = class {
    state = 'running';
    createMediaStreamSource() { return { connect: jest.fn(), disconnect: jest.fn() }; }
    createAnalyser() {
      return { fftSize: 0, frequencyBinCount: 8, getByteTimeDomainData: (a: Uint8Array) => a.fill(200), connect: jest.fn(), disconnect: jest.fn() };
    }
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
  };
  fetchMock = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ transcription: 'hello there' }) }));
  stubGlobal('fetch', fetchMock);
});
afterEach(() => { unstubAllGlobals(); jest.restoreAllMocks(); });

const settle = (ms = 5) => new Promise((r) => setTimeout(r, ms));

const transcribeCalls = () =>
  fetchMock.mock.calls.filter((c) => String(c[0]).includes('/api/voice/transcribe-simple'));

// ── P0: the path stays one-shot for every caller that did not ask ──────────
describe('P0 — strictly additive: no onPartial, nothing changes', () => {
  it('records without a timeslice and makes exactly one transcription request', async () => {
    const p = recordAndTranscribe(fakeStream(), { maxMs: 60_000 });
    await settle();
    recorders[0].stop();
    const result = await p;
    expect(result.ok).toBe(true);
    expect(recorders[0].timeslice).toBeUndefined();
    expect(transcribeCalls()).toHaveLength(1);
  });
});

// ── P1: the member sees text while speaking ───────────────────────────────
describe('P1 — provisional text follows speech', () => {
  it('emits provisional text mid-recording, before the final transcript', async () => {
    const seen: string[] = [];
    const p = recordAndTranscribe(fakeStream(), {
      maxMs: 60_000,
      partialIntervalMs: 0,
      onPartial: (t) => seen.push(t),
    });
    await settle();
    expect(recorders[0].timeslice).toBeGreaterThan(0);

    recorders[0].flush();
    await settle();

    // Text reached the member while the recording was still running.
    expect(seen.length).toBeGreaterThan(0);
    expect(recorders[0].state).toBe('recording');

    recorders[0].stop();
    await p;
  });

  it('a later reading REPLACES the earlier provisional words', async () => {
    const seen: string[] = [];
    let n = 0;
    fetchMock.mockImplementation(async (url: any) => {
      if (!String(url).includes('/api/voice/transcribe-simple')) {
        return { ok: true, status: 200, json: async () => ({}) };
      }
      n += 1;
      return { ok: true, status: 200, json: async () => ({ transcription: `reading ${n}` }) };
    });

    const p = recordAndTranscribe(fakeStream(), {
      maxMs: 60_000,
      partialIntervalMs: 0,
      onPartial: (t) => seen.push(t),
    });
    await settle();
    recorders[0].flush();
    await settle();
    recorders[0].flush();
    await settle();

    // Whole-prefix re-reading: successive values are full replacements, which
    // is what lets a mis-heard word be corrected rather than only appended to.
    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen[1]).not.toBe(seen[0]);

    recorders[0].stop();
    await p;
  });
});

// ── P2: one turn, and only one ────────────────────────────────────────────
describe('P2 — a member turn is born once', () => {
  it('provisional readings never become the returned transcript', async () => {
    const seen: string[] = [];
    fetchMock.mockImplementation(async (url: any, init: any) => {
      if (!String(url).includes('/api/voice/transcribe-simple')) {
        return { ok: true, status: 200, json: async () => ({}) };
      }
      const provisional = init?.body?.get?.('provisional') === 'true';
      return {
        ok: true,
        status: 200,
        json: async () => ({ transcription: provisional ? 'PROVISIONAL' : 'the committed turn' }),
      };
    });

    const p = recordAndTranscribe(fakeStream(), {
      maxMs: 60_000,
      partialIntervalMs: 0,
      onPartial: (t) => seen.push(t),
    });
    await settle();
    recorders[0].flush();
    await settle();
    recorders[0].stop();
    const result = await p;

    expect(seen).toContain('PROVISIONAL');
    // ⛔ The one value the caller may commit is the final one, and it is not a
    // provisional reading.
    expect(result.transcript).toBe('the committed turn');
  });

  it('the final flush at stop() does not open another provisional request', async () => {
    const p = recordAndTranscribe(fakeStream(), {
      maxMs: 60_000,
      partialIntervalMs: 0,
      onPartial: () => { /* display only */ },
    });
    await settle();
    recorders[0].flush();
    await settle();
    const beforeStop = transcribeCalls().length;
    recorders[0].stop();
    await p;
    await settle();
    // Exactly one more request: the final transcript. The stop-flush chunk must
    // not race it with a provisional reading of the same audio.
    expect(transcribeCalls().length).toBe(beforeStop + 1);
  });
});

// ── P3: partials inherit revocation, they do not route around it ──────────
describe('P3 — a revoked capture shows nothing and sends nothing', () => {
  it('no provisional audio leaves the device after revocation', async () => {
    const c = new AbortController();
    const seen: string[] = [];
    const p = recordAndTranscribe(fakeStream(), {
      signal: c.signal,
      maxMs: 60_000,
      partialIntervalMs: 0,
      onPartial: (t) => seen.push(t),
    });
    await settle();
    c.abort();
    recorders[0].flush();          // audio keeps arriving after the member left
    await settle();
    const result = await p;

    expect(result.reason).toBe('aborted');
    expect(transcribeCalls()).toHaveLength(0);
    expect(seen).toHaveLength(0);
  });

  it('a provisional result that arrives after revocation is not shown', async () => {
    const c = new AbortController();
    const seen: string[] = [];
    const t = createRollingPartialTranscriber({
      mimeType: 'audio/webm',
      intervalMs: 0,
      signal: c.signal,
      onPartial: (text) => seen.push(text),
    });
    t.offerPrefix(new Blob(['z'.repeat(4000)], { type: 'audio/webm' }));
    c.abort();                     // revoked while the request is in flight
    await settle();
    expect(seen).toHaveLength(0);
    t.close();
  });

  it('close() ends delivery — the final transcript owns the text from then on', async () => {
    const seen: string[] = [];
    const t = createRollingPartialTranscriber({
      mimeType: 'audio/webm',
      intervalMs: 0,
      onPartial: (text) => seen.push(text),
    });
    t.offerPrefix(new Blob(['z'.repeat(4000)], { type: 'audio/webm' }));
    t.close();                     // recording ended before the reading landed
    await settle();
    expect(seen).toHaveLength(0);
  });
});

// ── P4: ordering ──────────────────────────────────────────────────────────
describe('P4 — a stale reading never overwrites a newer one', () => {
  it('drops an out-of-order result', async () => {
    const seen: string[] = [];
    const resolvers: Array<(v: any) => void> = [];
    fetchMock.mockImplementation((url: any) => {
      if (!String(url).includes('/api/voice/transcribe-simple')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
      }
      return new Promise((resolve) => resolvers.push(resolve));
    });

    const t = createRollingPartialTranscriber({
      mimeType: 'audio/webm',
      intervalMs: 0,
      onPartial: (text) => seen.push(text),
    });

    const prefix = () => new Blob(['z'.repeat(4000)], { type: 'audio/webm' });
    t.offerPrefix(prefix());                       // seq 1 — in flight
    await settle();
    // Only one request may be in flight; a second offer while busy is dropped
    // rather than queued, so the newest audio always wins the next slot.
    expect(resolvers).toHaveLength(1);

    resolvers[0]({ ok: true, status: 200, json: async () => ({ transcription: 'second' }) });
    await settle();
    t.offerPrefix(prefix());                       // seq 2
    await settle();
    resolvers[1]({ ok: true, status: 200, json: async () => ({ transcription: 'third' }) });
    await settle();

    expect(seen).toEqual(['second', 'third']);
    t.close();
  });
});
