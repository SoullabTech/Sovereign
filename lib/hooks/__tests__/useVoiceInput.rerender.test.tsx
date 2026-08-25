/**
 * @jest-environment jsdom
 */
/**
 * Composer-microphone self-abort regression test.
 *
 * THE DEFECT THIS PINS
 * --------------------
 * `useVoiceInput` built its SpeechRecognition instance in an effect whose
 * dependency array included `onResult` / `onError`. Every consumer passes those
 * as inline arrow literals, so they are a NEW function identity on every
 * render. The effect's cleanup calls `recognition.abort()`.
 *
 * That closed a loop the member could not escape:
 *
 *   speak → onresult → setState → RENDER → new callback identity
 *         → effect re-runs → cleanup → abort() → "aborted" error
 *
 * The recognizer's lifetime was governed by React callback identity, so voice
 * input destroyed itself mid-sentence and then displayed the wreckage as
 * "Voice recognition error: aborted" — a member photographed exactly this.
 * The abort was real, and we caused it. Safari was not being temperamental.
 *
 * The test drives the REAL hook against a fake SpeechRecognition that records
 * every abort, then forces the re-renders that used to be fatal.
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import { useVoiceInput } from '../useVoiceInput';

// ── Fake Web Speech engine ────────────────────────────────────────────────
class FakeRecognition {
  static instances: FakeRecognition[] = [];
  static abortCount = 0;

  continuous = false;
  interimResults = false;
  lang = '';
  maxAlternatives = 1;
  started = false;
  aborted = false;

  onstart: (() => void) | null = null;
  onresult: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  onend: (() => void) | null = null;

  constructor() {
    FakeRecognition.instances.push(this);
  }

  start() {
    this.started = true;
    this.onstart?.();
  }

  stop() {
    this.started = false;
    this.onend?.();
  }

  /** Faithful to the browser: abort() on a live instance emits `aborted`. */
  abort() {
    FakeRecognition.abortCount++;
    this.aborted = true;
    if (this.started) {
      this.started = false;
      this.onerror?.({ error: 'aborted' });
      this.onend?.();
    }
  }

  /** Simulate the member speaking. */
  emitSpeech(text: string, isFinal: boolean) {
    this.onresult?.({
      resultIndex: 0,
      results: Object.assign(
        [Object.assign([{ transcript: text, confidence: 0.9 }], { isFinal })],
        { length: 1 },
      ),
    });
  }
}

function Harness({
  onResult,
  onError,
  tick,
}: {
  onResult: (t: string, f: boolean) => void;
  onError: (m: string) => void;
  tick: number;
}) {
  // Inline arrows, exactly as every real consumer passes them. This is the
  // shape that used to make the recognizer's lifetime depend on rendering.
  const voice = useVoiceInput({
    onResult: (t, f) => onResult(t, f),
    onError: (m) => onError(m),
    onAutoStop: () => {},
  });
  return <div data-testid="tick">{tick}{voice.isRecording ? ' rec' : ''}</div>;
}

describe('useVoiceInput — composer mic survives re-rendering', () => {
  let errors: string[];
  let results: Array<[string, boolean]>;

  beforeEach(() => {
    FakeRecognition.instances = [];
    FakeRecognition.abortCount = 0;
    errors = [];
    results = [];
    (global as any).window = global as any;
    (global as any).SpeechRecognition = FakeRecognition;
    (global as any).webkitSpeechRecognition = FakeRecognition;
  });

  function mount() {
    const utils = render(
      <Harness tick={0} onResult={(t, f) => results.push([t, f])} onError={(m) => errors.push(m)} />,
    );
    const rec = FakeRecognition.instances[0];
    expect(rec).toBeDefined();
    act(() => { rec.start(); });
    return { ...utils, rec };
  }

  it('builds exactly ONE recognizer, not one per render', () => {
    const { rerender } = mount();
    for (let i = 1; i <= 5; i++) {
      act(() => {
        rerender(
          <Harness tick={i} onResult={(t, f) => results.push([t, f])} onError={(m) => errors.push(m)} />,
        );
      });
    }
    // Before the fix this grew with every render.
    expect(FakeRecognition.instances).toHaveLength(1);
  });

  it('does NOT abort the live recognizer when the component re-renders', () => {
    const { rerender } = mount();
    expect(FakeRecognition.abortCount).toBe(0);

    for (let i = 1; i <= 10; i++) {
      act(() => {
        rerender(
          <Harness tick={i} onResult={(t, f) => results.push([t, f])} onError={(m) => errors.push(m)} />,
        );
      });
    }

    // THE assertion. Before the fix this was ~10.
    expect(FakeRecognition.abortCount).toBe(0);
  });

  it('keeps transcribing across re-renders — the member is still heard', () => {
    const { rerender, rec } = mount();

    act(() => { rec.emitSpeech('I was beginning to realize', false); });
    act(() => {
      rerender(
        <Harness tick={1} onResult={(t, f) => results.push([t, f])} onError={(m) => errors.push(m)} />,
      );
    });
    act(() => { rec.emitSpeech('I was beginning to realize something', true); });

    expect(rec.aborted).toBe(false);
    expect(results.length).toBeGreaterThanOrEqual(2);
    // Callbacks reach the LATEST props via refs, so nothing is dropped.
    expect(results[results.length - 1][0]).toContain('beginning to realize');
  });

  it('never shows the member "aborted" — it is our own lifecycle event', () => {
    const { rerender, rec } = mount();
    for (let i = 1; i <= 6; i++) {
      act(() => {
        rerender(
          <Harness tick={i} onResult={(t, f) => results.push([t, f])} onError={(m) => errors.push(m)} />,
        );
      });
    }
    // Even if an abort is genuinely issued, it is not member-facing.
    act(() => { rec.abort(); });

    expect(errors.join(' ')).not.toMatch(/abort/i);
    expect(errors).toEqual([]);
  });

  it('suppresses routine no-speech in continuous mode', () => {
    const { rec } = mount();
    act(() => { rec.onerror?.({ error: 'no-speech' }); });
    expect(errors).toEqual([]);
  });

  it('still surfaces a real failure, in language the member can act on', () => {
    const { rec } = mount();
    act(() => { rec.onerror?.({ error: 'not-allowed' }); });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/permission/i);
  });

  it('never leaks a raw browser error code into member-facing text', () => {
    const { rec } = mount();
    act(() => { rec.onerror?.({ error: 'some-future-webkit-code' }); });
    expect(errors.join(' ')).not.toContain('some-future-webkit-code');
    expect(errors[0]).toMatch(/tap the mic/i);
  });

  it('tears the recognizer down exactly once, on unmount', () => {
    const { unmount } = mount();
    expect(FakeRecognition.abortCount).toBe(0);
    unmount();
    expect(FakeRecognition.abortCount).toBe(1);
  });
});
