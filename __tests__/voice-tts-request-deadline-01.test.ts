/**
 * VOICE-TTS-REQUEST-DEADLINE-01 — acceptance proof.
 *
 * Reproduces the witnessed 2026-08-31 failure shape: a TTS generation that
 * does not answer, and then answers long after the conversation has moved on.
 *
 * Two producers are used deliberately:
 *
 *   abortAware   — honours AbortSignal. Proves resource cancellation.
 *   abortIgnoring — deliberately ignores AbortSignal and resolves anyway.
 *                   Proves the deadline is a hard wall rather than a request
 *                   the upstream may decline.
 *
 * The abortIgnoring case is the load-bearing one. An earlier revision of this
 * test only ever used an abort-aware producer, which meant a late completion
 * could never occur and the negative control proved nothing about the failure
 * actually witnessed in production.
 */
import {
  runWithTTSDeadline,
  TTSDeadlineExceeded,
  TTS_REQUEST_DEADLINE_MS,
} from '@/lib/voice/ttsDeadline';

/** Honours the signal: rejects with AbortError when aborted. */
const abortAware = (signal: AbortSignal) =>
  new Promise<string>((_resolve, reject) => {
    signal.addEventListener('abort', () => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      reject(err);
    });
  });

/**
 * Ignores the signal entirely and resolves after `ms`, exactly as the
 * production request did when it returned 200 after 589,288ms.
 */
const abortIgnoring = (ms: number, onResolve?: () => void) => () =>
  new Promise<string>((resolve) => {
    setTimeout(() => {
      onResolve?.();
      resolve('late-audio');
    }, ms);
  });

const WITNESSED_HANG_MS = 589_288;

describe('VOICE-TTS-REQUEST-DEADLINE-01', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('bounds the deadline well below the 45s/75s emergency ceilings this failure escaped', () => {
    expect(TTS_REQUEST_DEADLINE_MS).toBe(20_000);
    expect(TTS_REQUEST_DEADLINE_MS).toBeLessThan(45_000);
  });

  it('returns normally when the whole generation succeeds before the deadline', async () => {
    await expect(runWithTTSDeadline(async () => 'audio', 'rid-fast')).resolves.toBe('audio');
  });

  it('abandons an abort-aware generation that exceeds the deadline', async () => {
    const p = runWithTTSDeadline(abortAware, 'rid-hang', 20_000);
    const settled = p.catch((e) => e);
    jest.advanceTimersByTime(20_001);
    expect(await settled).toBeInstanceOf(TTSDeadlineExceeded);
  });

  it('carries deadline and elapsed time so abandonment is auditable, not silent', async () => {
    const p = runWithTTSDeadline(abortAware, 'rid-audit', 20_000);
    const settled = p.catch((e) => e);
    jest.advanceTimersByTime(20_001);
    const err = await settled;
    expect(err.deadlineMs).toBe(20_000);
    expect(err.elapsedMs).toBeGreaterThanOrEqual(0);
  });

  it('aborts the signal, so SDK-internal retries cannot extend the wall clock', async () => {
    let seen: AbortSignal | undefined;
    const p = runWithTTSDeadline((signal) => {
      seen = signal;
      return abortAware(signal);
    }, 'rid-retry', 20_000);
    const settled = p.catch((e) => e);
    jest.advanceTimersByTime(20_001);
    await settled;
    expect(seen!.aborted).toBe(true);
  });

  it('does not report a non-deadline transport error as an abandonment', async () => {
    const boom = new Error('upstream 500');
    const err = await runWithTTSDeadline(async () => {
      throw boom;
    }, 'rid-err').catch((e) => e);
    expect(err).toBe(boom);
    expect(err).not.toBeInstanceOf(TTSDeadlineExceeded);
  });

  // ── HARD WALL ───────────────────────────────────────────────────────────
  it('releases the caller at the deadline even when the upstream IGNORES the abort', async () => {
    const p = runWithTTSDeadline(abortIgnoring(WITNESSED_HANG_MS), 'rid-uncooperative', 20_000);
    const settled = p.catch((e) => e);
    jest.advanceTimersByTime(20_001);
    const err = await settled;
    expect(err).toBeInstanceOf(TTSDeadlineExceeded);
    expect(err.deadlineMs).toBe(20_000);
  });

  // ── MANDATORY NEGATIVE CONTROL ──────────────────────────────────────────
  // Witnessed: a response returned after the conversation had moved on and
  // spoke into a later exchange. This models that exactly — the upstream
  // ignores the abort and genuinely succeeds at 589,288ms.
  it('NEGATIVE CONTROL: an abort-ignoring upstream really completes late, and that success reaches no one', async () => {
    let upstreamCompleted = false;
    const p = runWithTTSDeadline(
      abortIgnoring(WITNESSED_HANG_MS, () => {
        upstreamCompleted = true;
      }),
      'rid-late',
      20_000
    );
    const settled = p.catch((e) => e);

    jest.advanceTimersByTime(20_001);
    expect(await settled).toBeInstanceOf(TTSDeadlineExceeded);
    expect(upstreamCompleted).toBe(false); // not yet — the caller was freed first

    // Now run out the full duration the production request actually took.
    jest.advanceTimersByTime(WITNESSED_HANG_MS);
    await Promise.resolve();
    await Promise.resolve();

    // The upstream DID succeed. That is the whole point of this control:
    // a late success occurred, and it changed nothing for the caller.
    expect(upstreamCompleted).toBe(true);
    await expect(p).rejects.toBeInstanceOf(TTSDeadlineExceeded);
  });
});
