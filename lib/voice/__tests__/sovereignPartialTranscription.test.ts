/** @jest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { recordAndTranscribe } from '../androidVoiceFallback';
import { createRollingPartialTranscriber } from '../rollingPartialTranscription';


if (typeof (globalThis.crypto as { randomUUID?: unknown })?.randomUUID !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { randomUUID } = require('crypto');
  if (!globalThis.crypto) (globalThis as { crypto?: unknown }).crypto = {};
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: randomUUID, configurable: true, writable: true,
  });
}

const originals = new Map<string, unknown>();
function stubGlobal(key: string, value: unknown) {
  if (!originals.has(key)) originals.set(key, (globalThis as Record<string, unknown>)[key]);
  (globalThis as Record<string, unknown>)[key] = value;
}
function restoreGlobals() {
  for (const [key, value] of originals) {
    if (value === undefined) delete (globalThis as Record<string, unknown>)[key];
    else (globalThis as Record<string, unknown>)[key] = value;
  }
  originals.clear();
}

let recorders: FakeRecorder[] = [];
class FakeRecorder {
  static isTypeSupported = () => true;
  state: 'inactive' | 'recording' = 'inactive';
  timeslice?: number;
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public stream: unknown, public options: unknown) {
    recorders.push(this);
  }
  start(timeslice?: number) {
    this.state = 'recording';
    this.timeslice = timeslice;
  }
  flush(bytes = 4000) {
    this.ondataavailable?.({
      data: new Blob(['p'.repeat(bytes)], { type: 'audio/webm' }),
    });
  }
  stop() {
    if (this.state === 'inactive') return;
    this.state = 'inactive';
    this.ondataavailable?.({
      data: new Blob(['f'], { type: 'audio/webm' }),
    });
    this.onstop?.();
  }
}

const track = () => ({
  stop: jest.fn(),
  kind: 'audio',
  readyState: 'live',
  muted: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
});
const stream = () => {
  const tracks = [track()];
  return { getTracks: () => tracks, getAudioTracks: () => tracks } as unknown as MediaStream;
};
const settle = (ms = 10) => new Promise(resolve => setTimeout(resolve, ms));

let fetchMock: ReturnType<typeof jest.fn>;
beforeEach(() => {
  recorders = [];
  stubGlobal('MediaRecorder', FakeRecorder);
  stubGlobal('AudioContext', class {
    state = 'running';
    createMediaStreamSource() {
      return { connect: jest.fn(), disconnect: jest.fn() };
    }
    createAnalyser() {
      return {
        fftSize: 0,
        getFloatTimeDomainData: (buffer: Float32Array) => buffer.fill(0.2),
      };
    }
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
  });
  fetchMock = jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ transcription: 'words arriving now' }),
  }));
  stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  restoreGlobals();
  jest.restoreAllMocks();
});

const transcribeCalls = () => fetchMock.mock.calls.filter(
  call => String(call[0]).includes('/api/voice/transcribe-simple'),
);

describe('sovereign rolling transcript', () => {
  it('leaves ordinary one-shot callers unchanged', async () => {
    const pending = recordAndTranscribe(stream(), { maxMs: 60_000 });
    await settle();
    expect(recorders[0].timeslice).toBeUndefined();
    recorders[0].stop();

    const result = await pending;
    expect(result.transcript).toBe('words arriving now');
    expect(transcribeCalls()).toHaveLength(1);
  });

  it('shows provisional words while capture is still recording', async () => {
    const seen: string[] = [];
    const pending = recordAndTranscribe(stream(), {
      maxMs: 60_000,
      partialIntervalMs: 0,
      onPartial: text => seen.push(text),
    });
    await settle();
    expect(recorders[0].timeslice).toBeGreaterThan(0);
    recorders[0].flush();
    await settle();

    expect(seen).toEqual(['words arriving now']);
    expect(recorders[0].state).toBe('recording');

    recorders[0].stop();
    await pending;
  });

  it('commits only the final transcript, never provisional text', async () => {
    fetchMock.mockImplementation(async (_url: unknown, init: any) => ({
      ok: true,
      status: 200,
      json: async () => ({
        transcription: init?.body?.get?.('provisional') === 'true'
          ? 'words arriving now'
          : 'the committed turn',
      }),
    }));
    const seen: string[] = [];
    const pending = recordAndTranscribe(stream(), {
      maxMs: 60_000,
      partialIntervalMs: 0,
      onPartial: text => seen.push(text),
    });
    await settle();
    recorders[0].flush();
    await settle();
    recorders[0].stop();

    const result = await pending;
    expect(seen).toContain('words arriving now');
    expect(result.transcript).toBe('the committed turn');
    expect(result.transcript).not.toBe(seen[0]);
  });

  it('revocation prevents provisional audio and text leaving the capture', async () => {
    const controller = new AbortController();
    const seen: string[] = [];
    const pending = recordAndTranscribe(stream(), {
      signal: controller.signal,
      maxMs: 60_000,
      partialIntervalMs: 0,
      onPartial: text => seen.push(text),
    });
    await settle();
    controller.abort();
    recorders[0].flush();
    const result = await pending;

    expect(result.reason).toBe('aborted');
    expect(transcribeCalls()).toHaveLength(0);
    expect(seen).toHaveLength(0);
  });

  it('close blocks a provisional result that resolves after final authority begins', async () => {
    let resolveFetch!: (value: unknown) => void;
    fetchMock.mockImplementation(() => new Promise(resolve => { resolveFetch = resolve; }));
    const seen: string[] = [];
    const partial = createRollingPartialTranscriber({
      mimeType: 'audio/webm',
      intervalMs: 0,
      onPartial: text => seen.push(text),
    });

    partial.offerPrefix(new Blob(['x'.repeat(4000)], { type: 'audio/webm' }));
    await settle();
    partial.close();
    resolveFetch({
      ok: true,
      status: 200,
      json: async () => ({ transcription: 'too late' }),
    });
    await settle();
    expect(seen).toHaveLength(0);
  });
});
