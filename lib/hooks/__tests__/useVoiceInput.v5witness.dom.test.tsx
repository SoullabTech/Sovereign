/**
 * @jest-environment jsdom
 */
/**
 * V5 UTTERANCE-TAIL WITNESS — the instrument must be unable to become the defect.
 *
 * WHY THIS SUITE EXISTS
 * ---------------------
 * `bffa557a` was a repair that made field behavior WORSE, and it was withdrawn.
 * The lesson generalises: anything added to the recognition path — including
 * something added only to observe it — has to be proven incapable of changing
 * what it observes. Events appearing is not evidence that the instrument is safe.
 *
 * So the load-bearing test here is the NEGATIVE CONTROL: telemetry is mocked to
 * throw on EVERY call, and recognition plus turn-finalization must behave
 * identically to a run where telemetry succeeds — same submitted text, same
 * timing, same listening state, same accumulation.
 *
 * The second thing proven is that the witness can actually distinguish the
 * orderings it was built for — specifically ordering D (silence timer fires
 * while fresh interim speech exists) and ordering F (a result arrives after the
 * turn already committed). An instrument that cannot separate those would be
 * decoration.
 */

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

// ── Telemetry mock, switchable mid-suite ──────────────────────────────────
let emitted: Array<{ event: string; metadata: Record<string, unknown> }> = [];
let telemetryThrows = false;

jest.mock('@/lib/voice/voiceDiagnostics', () => ({
  logVoiceEvent: (event: string, metadata: Record<string, unknown>) => {
    if (telemetryThrows) throw new Error('telemetry sink is down');
    emitted.push({ event, metadata });
  },
}));

import { useVoiceInput } from '../useVoiceInput';

class FakeRecognition {
  static instances: FakeRecognition[] = [];
  continuous = false;
  interimResults = false;
  lang = '';
  maxAlternatives = 1;
  started = false;
  stopCount = 0;

  onstart: (() => void) | null = null;
  onresult: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  onend: (() => void) | null = null;

  constructor() { FakeRecognition.instances.push(this); }
  start() { this.started = true; this.onstart?.(); }
  stop() { this.stopCount++; this.started = false; this.onend?.(); }
  abort() { this.started = false; }

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

const submitted: string[] = [];

function Harness() {
  const voice = useVoiceInput({
    onResult: () => {},
    onError: () => {},
    onAutoStop: (text: string) => { submitted.push(text); },
    continuous: true,
    silenceTimeoutMs: 1200,
    minSpeechLengthChars: 3,
  });
  return <div>{voice.isRecording ? 'rec' : 'idle'}</div>;
}

// Rendered with react-dom/client and React 19's own `act`. `@testing-library/react`
// is deliberately NOT used: it is not a dependency of this repository, and adding
// one to land an instrument would widen this unit past its boundary.
let root: Root | null = null;
let container: HTMLDivElement | null = null;

function mount() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => { root!.render(<Harness />); });
  const rec = FakeRecognition.instances[0];
  expect(rec).toBeDefined();
  act(() => { rec.start(); });
  return { rec };
}

function unmount() {
  if (root) act(() => { root!.unmount(); });
  if (container) container.remove();
  root = null; container = null;
}

beforeEach(() => {
  jest.useFakeTimers();
  FakeRecognition.instances = [];
  emitted = [];
  submitted.length = 0;
  telemetryThrows = false;
  (global as any).window = global as any;
  (global as any).SpeechRecognition = FakeRecognition;
  (global as any).webkitSpeechRecognition = FakeRecognition;
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => { unmount(); jest.useRealTimers(); jest.restoreAllMocks(); });

/** One full utterance → silence → commit. Returns what was submitted. */
function runTurn(rec: FakeRecognition) {
  act(() => { rec.emitSpeech('hello there', true); });
  act(() => { jest.advanceTimersByTime(1200); });
  return [...submitted];
}

describe('NEGATIVE CONTROL — telemetry cannot change behavior', () => {
  it('submits identical text whether telemetry succeeds or throws on every call', () => {
    const { rec: recOk } = mount();
    const withTelemetry = runTurn(recOk);
    const stopsWithTelemetry = recOk.stopCount;

    // Same scenario, telemetry now throwing on every single emit.
    unmount();
    FakeRecognition.instances = [];
    submitted.length = 0;
    telemetryThrows = true;
    const { rec: recThrow } = mount();
    const withBrokenTelemetry = runTurn(recThrow);

    expect(withBrokenTelemetry).toEqual(withTelemetry);
    expect(withBrokenTelemetry).toEqual(['hello there']);
    expect(recThrow.stopCount).toBe(stopsWithTelemetry);
  });

  it('a throwing telemetry sink does not prevent the turn from committing at all', () => {
    telemetryThrows = true;
    const { rec } = mount();
    expect(runTurn(rec)).toEqual(['hello there']);
  });

  it('silence timeout duration is unchanged by instrumentation', () => {
    const { rec } = mount();
    act(() => { rec.emitSpeech('hello there', true); });
    // One tick short of the deadline: must NOT have committed.
    act(() => { jest.advanceTimersByTime(1199); });
    expect(submitted).toEqual([]);
    act(() => { jest.advanceTimersByTime(1); });
    expect(submitted).toEqual(['hello there']);
  });

  it('interim results do not commit, and do not shorten the timer', () => {
    const { rec } = mount();
    act(() => { rec.emitSpeech('still speaking', false); });
    act(() => { jest.advanceTimersByTime(1200); });
    // Interim-only never reaches minSpeechLengthChars via finalTranscriptRef,
    // so nothing is submitted — unchanged from baseline behavior.
    expect(submitted).toEqual([]);
  });

  it('CONTROL: the mock is actually wired — events are captured when it does not throw', () => {
    const { rec } = mount();
    runTurn(rec);
    expect(emitted.length).toBeGreaterThan(0);
  });
});

describe('the witness distinguishes the orderings it was built for', () => {
  const names = () => emitted.map((e) => e.event);

  it('emits the arm → fire → commit_requested → committed sequence', () => {
    const { rec } = mount();
    runTurn(rec);
    expect(names()).toEqual(expect.arrayContaining([
      'voice_result_final',
      'voice_silence_timer_armed',
      'voice_silence_timer_fired',
      'voice_turn_commit_requested',
      'voice_turn_committed',
    ]));
  });

  it('ORDERING D: fired carries the interim length that existed at fire time', () => {
    const { rec } = mount();
    act(() => { rec.emitSpeech('committed words', true); });
    act(() => { rec.emitSpeech('trailing words still interim', false); });
    act(() => { jest.advanceTimersByTime(1200); });

    const fired = emitted.find((e) => e.event === 'voice_silence_timer_fired');
    expect(fired).toBeDefined();
    // The timer closure cannot see `interimTranscript` directly; without the ref
    // this number would be unavailable and ordering D would be undiagnosable.
    expect(fired!.metadata.interimCharCountAtFire).toBe('trailing words still interim'.length);
    expect(fired!.metadata.willCommit).toBe(true);
  });

  it('ORDERING F: a result after commit is reported, not inferred', () => {
    const { rec } = mount();
    runTurn(rec);
    emitted = [];
    act(() => { rec.emitSpeech('the tail nobody heard', true); });

    const after = emitted.find((e) => e.event === 'voice_result_after_commit');
    expect(after).toBeDefined();
    expect(after!.metadata.resultAfterCommit).toBe(true);
    expect(after!.metadata.turnCommitId).toBe(1);
  });

  it('NEGATIVE CONTROL: result_after_commit does NOT fire before a commit', () => {
    const { rec } = mount();
    act(() => { rec.emitSpeech('first words', false); });
    expect(names()).not.toContain('voice_result_after_commit');
  });

  it('no transcript text reaches telemetry', () => {
    const { rec } = mount();
    runTurn(rec);
    const blob = JSON.stringify(emitted);
    expect(blob).not.toContain('hello there');
    expect(blob).not.toContain('hello');
  });
});
