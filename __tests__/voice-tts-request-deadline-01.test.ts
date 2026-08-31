/**
 * VOICE-TTS-REQUEST-DEADLINE-01 — acceptance proof.
 *
 * Reproduces the witnessed 2026-08-31 failure shape: a TTS generation that
 * does not answer, and then answers long after the conversation has moved on.
 *
 * The last test is the mandatory negative control. It is not enough that the
 * deadline fires; the abandoned generation's eventual success must be inert.
 */
import {
  runWithTTSDeadline,
  TTSDeadlineExceeded,
  TTS_REQUEST_DEADLINE_MS,
} from '@/lib/voice/ttsDeadline';

const never = (signal: AbortSignal, resolveAfterMs?: number) =>
  new Promise<string>((resolve, reject) => {
    const t = resolveAfterMs
      ? setTimeout(() => resolve('late-audio'), resolveAfterMs)
      : undefined;
    signal.addEventListener('abort', () => {
      if (t) clearTimeout(t);
      const err = new Error('aborted');
      err.name = 'AbortError';
      reject(err);
    });
  });

describe('VOICE-TTS-REQUEST-DEADLINE-01', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('bounds the deadline well below the 45s/75s emergency ceilings this failure escaped', () => {
    expect(TTS_REQUEST_DEADLINE_MS).toBe(20_000);
    expect(TTS_REQUEST_DEADLINE_MS).toBeLessThan(45_000);
  });

  it('returns normally when generation succeeds before the deadline', async () => {
    const p = runWithTTSDeadline(async () => 'audio', 'rid-fast');
    await expect(p).resolves.toBe('audio');
  });

  it('abandons a generation that exceeds the deadline (the 589s case)', async () => {
    const p = runWithTTSDeadline((signal) => never(signal), 'rid-hang', 20_000);
    const assertion = expect(p).rejects.toBeInstanceOf(TTSDeadlineExceeded);
    jest.advanceTimersByTime(20_001);
    await assertion;
  });

  it('carries the elapsed time so abandonment is auditable, not silent', async () => {
    const p = runWithTTSDeadline((signal) => never(signal), 'rid-audit', 20_000);
    const assertion = p.catch((e) => e);
    jest.advanceTimersByTime(20_001);
    const err = await assertion;
    expect(err).toBeInstanceOf(TTSDeadlineExceeded);
    expect(err.deadlineMs).toBe(20_000);
    expect(err.elapsedMs).toBeGreaterThanOrEqual(0);
  });

  it('passes a signal that is already aborted, so SDK retries cannot extend the wall clock', async () => {
    let seen: AbortSignal | undefined;
    const p = runWithTTSDeadline((signal) => {
      seen = signal;
      return never(signal);
    }, 'rid-retry', 20_000);
    const assertion = p.catch((e) => e);
    jest.advanceTimersByTime(20_001);
    await assertion;
    // A retry inside the SDK would reuse this same signal, which stays aborted.
    expect(seen!.aborted).toBe(true);
  });

  it('does not surface a non-deadline transport error as an abandonment', async () => {
    const boom = new Error('upstream 500');
    const err = await runWithTTSDeadline(async () => {
      throw boom;
    }, 'rid-err').catch((e) => e);
    expect(err).toBe(boom);
    expect(err).not.toBeInstanceOf(TTSDeadlineExceeded);
  });

  // ── MANDATORY NEGATIVE CONTROL ──────────────────────────────────────────
  // Witnessed: a response that returned after the conversation had moved on
  // spoke into a later exchange. A deadline alone does not prevent that.
  it('NEGATIVE CONTROL: a late success after abandonment never reaches the caller', async () => {
    let lateValue: string | undefined;
    const p = runWithTTSDeadline(
      (signal) => never(signal, 589_288).then((v) => (lateValue = v)),
      'rid-late',
      20_000
    );
    const assertion = p.catch((e) => e);
    jest.advanceTimersByTime(20_001);
    const err = await assertion;
    expect(err).toBeInstanceOf(TTSDeadlineExceeded);

    // Advance past the full 589s the production request actually took.
    jest.advanceTimersByTime(600_000);
    await Promise.resolve();

    // The abandoned generation produced nothing the caller can act on.
    expect(lateValue).toBeUndefined();
    await expect(p).rejects.toBeInstanceOf(TTSDeadlineExceeded);
  });
});
