/** @jest-environment jsdom */

/**
 * MEMBER-CONTENT LOG CONTAINMENT — the member's transcribed speech.
 *
 * The defect this locks: `WhisperContinuousConversation` wrote the member's own
 * transcribed words, verbatim, to the browser console — and, on the failure
 * branch, logged the transcription endpoint's whole response body, which is the
 * same leak one server-shape change away.
 *
 * The containment rule is exact, and the near-misses are the point:
 *   · the plaintext is removed from the log;
 *   · it is NOT replaced by a hash, digest, fingerprint, embedding, excerpt,
 *     prefix, truncation, or any reversible encoding;
 *   · the event and its non-content diagnostics survive — that transcription
 *     happened, how long it took, how many characters came back, audio size
 *     and energy — as does delivery to `onTranscript`, because containment is
 *     about the LOG, not about the member's words reaching MAIA.
 *
 * Both sides are asserted here. A negative-only suite silently passes when the
 * event stops emitting at all, and a capture that stringifies with `String(arg)`
 * flattens objects to "[object Object]" — which would make every negative
 * assertion below vacuously true. The capture therefore SERIALIZES, and a
 * dedicated control test proves the check is capable of failing.
 *
 * Environment note: jsdom has no MediaRecorder, AudioContext or getUserMedia,
 * so the browser capture path is stood up as fakes below. What is witnessed
 * here is exactly what that allows — which console lines the component emits
 * on a real pass through its own transcription flow. Nothing about audio
 * quality, device behaviour or layout is claimed.
 */

import { act } from 'react';
import { createElement, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';

jest.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => 'web' },
}));

jest.mock('capacitor-voice-recorder', () => ({
  VoiceRecorder: {
    requestAudioRecordingPermission: jest.fn(async () => ({ value: true })),
    startRecording: jest.fn(async () => ({ value: true })),
    stopRecording: jest.fn(async () => ({ value: { recordDataBase64: '' } })),
  },
}));

jest.mock('lucide-react', () => ({
  Mic: () => null,
  MicOff: () => null,
  Loader2: () => null,
}));

// VIRTUAL, and the reason matters: `lib/analytics/supabaseAnalytics` does not
// exist in the tree. The component's import of it is already unresolvable, which
// is why the file carries `@ts-nocheck` and why nothing imports it. That is a
// pre-existing defect, reported and deliberately NOT fixed by this unit — the
// mock stands the module up so the containment code can actually be executed.
jest.mock(
  '../../../lib/analytics/supabaseAnalytics',
  () => ({
    Analytics: {
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      transcriptionSuccess: jest.fn(),
      transcriptionError: jest.fn(),
    },
  }),
  { virtual: true },
);

import {
  WhisperContinuousConversation,
  type WhisperContinuousConversationRef,
} from '../WhisperContinuousConversation';

// A fixture distinctive enough that an accidental substring match is not
// plausible, and containing no token the contained log lines could legitimately
// emit on their own.
const MEMBER_SPEECH =
  'zqx-fixture-9312 I told my brother the truth about why I stopped calling him';

let logs: string[];
let spies: Array<ReturnType<typeof jest.spyOn>> = [];
let container: HTMLDivElement;
let root: Root;
let rafDepth = 0;

/**
 * Serializing capture. `String(arg)` would render any object argument as
 * "[object Object]", so a log that passed member content inside an object
 * would sail past the negative assertions. JSON.stringify keeps it visible.
 */
const capture = (sink: string[]) => (...args: unknown[]) => {
  sink.push(
    args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '),
  );
};

const captured = () => logs.join('\n');

/** A MediaRecorder good enough to walk the component's own web capture path. */
class FakeMediaRecorder {
  static isTypeSupported = () => true;
  state = 'inactive';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void | Promise<void>) | null = null;
  constructor(public stream: unknown, public options: { mimeType: string }) {}
  start() {
    this.state = 'recording';
    // The component installs `ondataavailable` before calling start().
    this.ondataavailable?.({ data: new Blob(['0123456789'], { type: 'audio/webm' }) });
  }
  stop() {
    this.state = 'inactive';
    // MUST be deferred: the component assigns `onstop` on the line AFTER stop().
    queueMicrotask(() => void this.onstop?.());
  }
}

function installBrowserFakes() {
  (globalThis as any).MediaRecorder = FakeMediaRecorder;

  (globalThis as any).navigator.mediaDevices = {
    getUserMedia: async () => ({ getTracks: () => [{ stop: () => {} }] }),
  };

  (globalThis as any).AudioContext = class {
    state = 'running';
    createAnalyser() {
      return {
        fftSize: 0,
        frequencyBinCount: 32,
        // Loud enough to clear the component's 0.02 energy floor.
        getByteFrequencyData: (a: Uint8Array) => a.fill(200),
        disconnect: () => {},
      };
    }
    createMediaStreamSource() {
      return { connect: () => {} };
    }
    async close() {
      this.state = 'closed';
    }
  };
  (globalThis as any).window.AudioContext = (globalThis as any).AudioContext;

  // Bounded, synchronous rAF: three energy samples, then stop. An unbounded
  // shim would recurse forever inside monitorAudioLevel.
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
    if (rafDepth++ < 3) cb(0);
    return rafDepth;
  };
  (globalThis as any).cancelAnimationFrame = () => {};
}

/** Drain the microtask queue so awaited chains inside the flow settle. */
async function flush() {
  for (let i = 0; i < 50; i++) await Promise.resolve();
}

/**
 * Drive one complete capture → transcribe cycle and return what the component
 * handed to `onTranscript`.
 */
async function runTranscriptionCycle(
  response: unknown,
  { ok = true }: { ok?: boolean } = {},
): Promise<string[]> {
  const delivered: string[] = [];
  (globalThis as any).fetch = jest.fn(async () => ({
    ok,
    status: ok ? 200 : 500,
    json: async () => response,
  }));

  const ref = createRef<WhisperContinuousConversationRef>();

  await act(async () => {
    root.render(
      createElement(WhisperContinuousConversation as any, {
        ref,
        onTranscript: (t: string) => delivered.push(t),
        autoRestart: false,
        autoStart: false,
      }),
    );
  });

  await act(async () => {
    await ref.current!.startListening();
  });

  await act(async () => {
    jest.advanceTimersByTime(5000);
    await flush();
  });

  return delivered;
}

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  jest.useFakeTimers();
  logs = [];
  rafDepth = 0;
  installBrowserFakes();
  spies = [
    jest.spyOn(console, 'log').mockImplementation(capture(logs)),
    jest.spyOn(console, 'warn').mockImplementation(capture(logs)),
    jest.spyOn(console, 'error').mockImplementation(capture(logs)),
  ];
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  spies.forEach((s) => s.mockRestore());
  jest.useRealTimers();
});

describe('WhisperContinuousConversation — NEGATIVE: member speech never reaches the console', () => {
  it('does not emit the transcript text', async () => {
    await runTranscriptionCycle({ success: true, transcription: MEMBER_SPEECH });
    expect(captured()).not.toContain(MEMBER_SPEECH);
  });

  it('does not emit any excerpt, prefix or truncation of the transcript', async () => {
    await runTranscriptionCycle({ success: true, transcription: MEMBER_SPEECH });
    const out = captured();
    // Every prefix from 8 chars up. A truncation substitute would trip one.
    for (let n = 8; n <= MEMBER_SPEECH.length; n++) {
      expect(out).not.toContain(MEMBER_SPEECH.slice(0, n));
    }
    // ...and any distinctive interior word.
    for (const word of ['zqx-fixture-9312', 'brother', 'stopped calling', 'truth']) {
      expect(out).not.toContain(word);
    }
  });

  it('does not substitute a digest, fingerprint or encoding of the transcript', async () => {
    const { createHash } = require('node:crypto') as typeof import('node:crypto');
    await runTranscriptionCycle({ success: true, transcription: MEMBER_SPEECH });
    const out = captured();

    for (const algo of ['sha256', 'sha1', 'md5']) {
      const hex = createHash(algo).update(MEMBER_SPEECH).digest('hex');
      expect(out).not.toContain(hex);
      expect(out).not.toContain(hex.slice(0, 12));
      expect(out).not.toContain(createHash(algo).update(MEMBER_SPEECH).digest('base64'));
    }
    expect(out).not.toContain(Buffer.from(MEMBER_SPEECH).toString('base64'));
    expect(out).not.toContain(encodeURIComponent(MEMBER_SPEECH));
  });

  it('does not leak the transcript through the failure branch response body', async () => {
    // The server shape the whole-object log would have exposed: a response that
    // fails the success gate while still carrying the member's words.
    await runTranscriptionCycle({
      success: false,
      transcription: MEMBER_SPEECH,
      error: 'downstream rejected',
    });
    const out = captured();
    expect(out).not.toContain(MEMBER_SPEECH);
    for (const word of ['zqx-fixture-9312', 'brother', 'truth']) {
      expect(out).not.toContain(word);
    }
  });

  /**
   * NON-VACUITY CONTROL. Without this, every assertion above would still pass
   * if the capture were broken, the spies never installed, or the fixture never
   * reached the code under test. Here the same capture is deliberately fed the
   * pre-fix log lines, and the check must FAIL to detect them.
   */
  it('CONTROL: the containment check is capable of failing', () => {
    const control: string[] = [];
    capture(control)('✅ Transcription:', MEMBER_SPEECH);
    expect(control.join('\n')).toContain(MEMBER_SPEECH);

    // And it must see content hidden inside an OBJECT argument too — this is
    // the case a String(arg) capture would flatten to "[object Object]".
    const control2: string[] = [];
    capture(control2)('❌ No transcription in response:', {
      success: false,
      transcription: MEMBER_SPEECH,
    });
    expect(control2.join('\n')).toContain(MEMBER_SPEECH);
  });

  it('CONTROL: the flow under test actually ran', async () => {
    const delivered = await runTranscriptionCycle({
      success: true,
      transcription: MEMBER_SPEECH,
    });
    // If the harness never reached transcription, every negative above is void.
    expect(delivered).toEqual([MEMBER_SPEECH]);
    expect((globalThis as any).fetch).toHaveBeenCalled();
  });
});

describe('WhisperContinuousConversation — POSITIVE: the event and its diagnostics survive', () => {
  it('still emits the transcription-complete marker', async () => {
    await runTranscriptionCycle({ success: true, transcription: MEMBER_SPEECH });
    expect(captured()).toContain('✅ Transcription:');
  });

  it('still reports non-content size and timing diagnostics', async () => {
    await runTranscriptionCycle({ success: true, transcription: MEMBER_SPEECH });
    const out = captured();
    expect(out).toContain(`${MEMBER_SPEECH.length} chars`);
    expect(out).toMatch(/✅ Transcription: \d+ chars in \d+ms/);
    expect(out).toContain('🎵 Audio blob:');
    expect(out).toContain('🔊 Audio energy:');
  });

  it('still delivers the full transcript to the caller — containment is about the LOG', async () => {
    const delivered = await runTranscriptionCycle({
      success: true,
      transcription: MEMBER_SPEECH,
    });
    expect(delivered).toEqual([MEMBER_SPEECH]);
  });

  it('still reports an empty transcription failure, with its non-content shape', async () => {
    await runTranscriptionCycle({ success: true, transcription: '', error: null });
    const out = captured();
    expect(out).toContain('❌ No transcription in response');
    expect(out).toContain('"hasTranscription":true');
    expect(out).toContain('"success":true');
  });

  it('still reports a server-side failure without leaking anything member-authored', async () => {
    await runTranscriptionCycle({ success: false, error: 'whisper unavailable' });
    const out = captured();
    expect(out).toContain('❌ No transcription in response');
    expect(out).toContain('whisper unavailable');
    expect(out).not.toContain(MEMBER_SPEECH);
  });
});
