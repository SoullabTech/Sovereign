/**
 * DESKTOP-SOVEREIGN-STT-LIFECYCLE-01 — a capture the member walked away from
 * must not keep working.
 *
 * ⛔ THE DEFECT. The Desktop sovereign branch held its MediaStream in a local
 * `let stream`, while `stopListening()` — what teardown calls — only knew about
 * `micStreamRef.current`. And `recordAndTranscribe` had no cancellation signal;
 * its own contract said stream lifecycle belonged to the caller. So a member who
 * left `/maia` mid-sentence left a recorder running behind another screen, which
 * then POSTed their audio to `/api/voice/transcribe-simple` and dispatched a
 * transcript into a conversation they were no longer in.
 *
 * These are written as attempts to get audio off the device, or a transcript
 * into the conversation, after authority has been revoked.
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { recordAndTranscribe } from '../androidVoiceFallback';

// ── a MediaRecorder / audio stack small enough to reason about ──────────────
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

const track = () => ({ stop: vi.fn(), kind: 'audio', addEventListener: vi.fn(), removeEventListener: vi.fn() });
const fakeStream = () => { const t = [track()]; return { getTracks: () => t, getAudioTracks: () => t } as any; };

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  recorders = [];
  (globalThis as any).MediaRecorder = FakeRecorder;
  (globalThis as any).AudioContext = class {
    state = 'running';
    createMediaStreamSource() { return { connect: vi.fn(), disconnect: vi.fn() }; }
    createAnalyser() {
      return { fftSize: 0, frequencyBinCount: 8, getByteTimeDomainData: (a: Uint8Array) => a.fill(200), connect: vi.fn(), disconnect: vi.fn() };
    }
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
  };
  fetchMock = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ transcription: 'hello there' }) }));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

/** Let the recorder's own stop path run. */
const settle = () => new Promise((r) => setTimeout(r, 5));

/**
 * Only the TRANSCRIPTION request counts.
 *
 * ⛔ `logVoiceEvent` ships telemetry over the same fetch, so a bare call count
 * would conflate "the member's audio was uploaded" with "a diagnostic line was
 * posted". Those are exactly the two things this unit must not confuse: the
 * whole point is that audio does not leave the device after revocation, while
 * telemetry about the abort legitimately does.
 */
const transcribeCalls = () =>
  fetchMock.mock.calls.filter((c) => String(c[0]).includes('/api/voice/transcribe-simple'));

describe('T1/T2 — a revoked capture never POSTs the member\'s audio', () => {
  it('aborted BEFORE recording begins: no transcription request', async () => {
    const c = new AbortController();
    c.abort();
    const result = await recordAndTranscribe(fakeStream(), { signal: c.signal });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('aborted');
    expect(transcribeCalls()).toHaveLength(0);
  });

  it('aborted DURING recording: the recorder stops and nothing is sent', async () => {
    const c = new AbortController();
    const p = recordAndTranscribe(fakeStream(), { signal: c.signal, maxMs: 60_000 });
    await settle();
    expect(recorders.length).toBe(1);
    c.abort();
    const result = await p;
    expect(result.reason).toBe('aborted');
    // ⛔ The recorder was actually STOPPED, not merely ignored — otherwise the
    // microphone stays open behind whatever screen the member moved to.
    expect(recorders[0].state).toBe('inactive');
    expect(transcribeCalls()).toHaveLength(0);
  });
});

describe('T3 — abort between recording and upload', () => {
  it('recording completes but authority is gone: still no POST', async () => {
    // The gate sits after the blob exists and before the request. This is the
    // window the original code had no way to close.
    const c = new AbortController();
    const p = recordAndTranscribe(fakeStream(), { signal: c.signal, maxMs: 60_000 });
    await settle();
    c.abort();
    const result = await p;
    expect(result.reason).toBe('aborted');
    expect(transcribeCalls()).toHaveLength(0);
  });

  it('a transcript that arrives after revocation is not returned', async () => {
    const c = new AbortController();
    fetchMock.mockImplementation(async (url: any) => {
      if (!String(url).includes('/api/voice/transcribe-simple')) {
        return { ok: true, status: 200, json: async () => ({}) };
      }
      c.abort();                                   // revoked mid-flight
      return { ok: true, status: 200, json: async () => ({ transcription: 'too late' }) };
    });
    const p = recordAndTranscribe(fakeStream(), { signal: c.signal, maxMs: 30 });
    await settle();
    recorders[0]?.stop();
    const result = await p;
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('aborted');
    expect((result as any).transcript).toBeUndefined();
  });

  it('an AbortError from the request is reported as an abort, not a transport failure', async () => {
    const c = new AbortController();
    fetchMock.mockImplementation(async (url: any) => {
      if (!String(url).includes('/api/voice/transcribe-simple')) {
        return { ok: true, status: 200, json: async () => ({}) };
      }
      const e = new Error('aborted'); e.name = 'AbortError'; throw e;
    });
    const p = recordAndTranscribe(fakeStream(), { signal: c.signal, maxMs: 30 });
    await settle();
    recorders[0]?.stop();
    c.abort();
    const result = await p;
    expect(result.reason).toBe('aborted');
    expect(result.reason).not.toBe('transcribe_http_error');
  });
});

describe('T8 — callers that pass no signal are unchanged', () => {
  it('Android/Firefox behaviour is identical without a signal', async () => {
    const p = recordAndTranscribe(fakeStream(), { maxMs: 30 });
    await settle();
    recorders[0]?.stop();
    const result = await p;
    expect(result.ok).toBe(true);
    expect(result.transcript).toBe('hello there');
    expect(transcribeCalls()).toHaveLength(1);
  });

  it('T7 — a completed capture still dispatches exactly one transcript', async () => {
    const p = recordAndTranscribe(fakeStream(), { maxMs: 30 });
    await settle();
    recorders[0]?.stop();
    await p;
    expect(transcribeCalls()).toHaveLength(1);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// T4 / T5 / T6 / T9 — the COMPONENT side, asserted structurally
//
// ⛔ These are source guards rather than behavioural tests because the branch
// they protect lives inside a 4,000-line component whose mount requires the
// whole voice tree. The properties are about ORDER and OWNERSHIP — which is
// what the defect was — and order is a property of the file.
// ════════════════════════════════════════════════════════════════════════════

describe('the capture is owned by the component, not by one async scope', () => {
  const fs = require('node:fs') as typeof import('node:fs');
  const path = require('node:path') as typeof import('node:path');
  const src = fs.readFileSync(
    path.join(__dirname, '..', '..', '..', 'components', 'voice', 'ContinuousConversation.tsx'), 'utf8');

  /**
   * The SOVEREIGN branch only.
   *
   * ⛔ `recordAndTranscribe` has two call sites — the Android-Chrome recovery
   * and this one. Slicing from the first match reads the wrong branch and makes
   * these guards report on code they are not guarding. (It did, on the first
   * run: the ordering assertion compared offsets from two different branches
   * and failed for a reason that had nothing to do with the property.)
   */
  const sovereign = src.slice(src.indexOf("logVoiceEvent('voice_listening_started', { path: sovereignReason })"));

  it('T5 — teardown can reach the sovereign stream', () => {
    // ⛔ THE DEFECT. `stopListening()` only stopped `micStreamRef.current`; the
    // sovereign stream lived in a local `let stream` it had never heard of.
    const stop = src.slice(src.indexOf('const stopListening = useCallback'));
    const revoke = stop.indexOf("revokeSovereignCapture('stopListening')");
    expect(revoke, 'stopListening does not revoke the sovereign capture').toBeGreaterThan(-1);
    // and it is not nested inside the userExitMode branch, which would leave
    // navigation and error-recovery stops unable to reach it.
    const userExit = stop.indexOf('if (options?.userExitMode)');
    expect(revoke).toBeLessThan(userExit);
  });

  it('T5 — unmount revokes explicitly, not only via stopListening', () => {
    expect(src).toContain("revokeSovereignCapture('unmount')");
  });

  it('T5 — revocation stops every track and aborts the request', () => {
    const fn = src.slice(src.indexOf('const revokeSovereignCapture'));
    expect(fn).toContain('controller.abort()');
    expect(fn).toContain('getTracks().forEach');
  });

  it('T6 — revocation is idempotent and safe with no active capture', () => {
    const fn = src.slice(src.indexOf('const revokeSovereignCapture'), src.indexOf('const handsFreeActiveRef'));
    // Returns early when there is nothing to revoke…
    expect(fn).toMatch(/if \(!active\) return;/);
    // …and clears the slot before touching anything, so a second call is a no-op.
    expect(fn).toMatch(/sovereignCaptureRef\.current = null;[\s\S]*controller\.abort/);
  });

  it('T6 — the generation is bumped BEFORE abort, so a throw cannot leave it live', () => {
    const fn = src.slice(src.indexOf('const revokeSovereignCapture'), src.indexOf('const handsFreeActiveRef'));
    expect(fn.indexOf('sovereignGenerationRef.current += 1'))
      .toBeLessThan(fn.indexOf('controller.abort()'));
  });

  it('T4 — a stale completion cannot dispatch', () => {
    // Abort stops the work; it cannot un-resolve a promise already in flight.
    const branch = sovereign;
    const gate = branch.indexOf('sovereignGenerationRef.current !== captureGeneration');
    // ⛔ The CALL, not the word. The comment above the gate names
    // `witnessDispatch` while explaining what it prevents, and matching that
    // prose made this guard measure the distance to its own documentation.
    const dispatch = branch.indexOf("witnessDispatch('web_whisper'");
    const onTranscript = branch.indexOf('onTranscript(result.transcript)');
    expect(gate).toBeGreaterThan(-1);
    expect(gate, 'a stale result can reach witnessDispatch').toBeLessThan(dispatch);
    expect(gate, 'a stale result can reach onTranscript').toBeLessThan(onTranscript);
  });

  it('T4 — the signal is actually passed to the recorder', () => {
    // Shape-tolerant on purpose. DESKTOP-SOVEREIGN-STT-INTERIM-01 added a
    // second option (`onPartial`) to this same call, which broke the original
    // single-line literal match. What this guard is FOR is that the capture's
    // signal reaches `recordAndTranscribe` — not how the object is formatted.
    const call = sovereign.indexOf('recordAndTranscribe(stream, {');
    expect(call, 'the sovereign branch no longer calls recordAndTranscribe').toBeGreaterThan(-1);
    const args = sovereign.slice(call, sovereign.indexOf('});', call));
    expect(args, 'the capture signal is not passed to the recorder')
      .toContain('signal: captureController.signal');
  });

  it('T6 — one capture\'s finally cannot tear down a newer one', () => {
    const branch = sovereign;
    expect(branch).toContain('sovereignCaptureRef.current?.generation === captureGeneration');
    expect(branch).toContain('sovereignGenerationRef.current === captureGeneration');
  });

  it('T9 — registration happens immediately after getUserMedia, with no await between', () => {
    // A suspension point in that window would let a teardown find no capture to
    // revoke, and the stream would outlive the component that opened it.
    const start = sovereign.indexOf('stream = await navigator.mediaDevices.getUserMedia({ audio: true })');
    const register = sovereign.indexOf('sovereignCaptureRef.current = {', start);
    expect(start).toBeGreaterThan(-1);
    expect(register).toBeGreaterThan(start);
    // Everything after the getUserMedia statement itself, up to registration.
    const between = sovereign.slice(sovereign.indexOf(';', start) + 1, register);
    // The catch block legitimately sits here and cannot suspend — it throws.
    const withoutCatch = between.replace(/catch \(err: any\)[\s\S]*?\n        \}/, '');
    expect(withoutCatch, 'an await sits between acquiring and registering the stream').not.toContain('await ');
  });
});
