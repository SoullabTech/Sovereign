/**
 * VOICE-TTS-REQUEST-DEADLINE-01
 *
 * Governing rule: no optional output channel may hold conversational
 * authority while it waits.
 *
 * Witnessed 2026-08-31 (session qann9o9t): a single admitted request to
 * /api/voice/openai-tts stayed open for 589,288ms (9m49s) and then returned
 * 200. Nothing in the route could end it — there was no AbortController, no
 * signal, and no timeout on either speech.create call site. The member was
 * imprisoned for the whole window. The caller's own `finally`, whose comment
 * claims to release the UI "no matter what awaited leg hung", never ran:
 * a hung await never reaches a finally. The 45s/75s client emergency
 * machinery was escaped entirely, because that machinery only engages once
 * audio is already in playback territory, and audio never arrived.
 *
 * The deadline is deliberately far above a healthy call (~2-3s observed) and
 * far below those emergency ceilings. TTS is optional output; it does not get
 * ten minutes.
 */

export const TTS_REQUEST_DEADLINE_MS = 20_000;

export class TTSDeadlineExceeded extends Error {
  readonly deadlineMs: number;
  readonly elapsedMs: number;
  constructor(deadlineMs: number, elapsedMs: number) {
    super(`TTS generation abandoned after ${elapsedMs}ms (deadline ${deadlineMs}ms)`);
    this.name = 'TTSDeadlineExceeded';
    this.deadlineMs = deadlineMs;
    this.elapsedMs = elapsedMs;
  }
}

/**
 * Runs one speech generation under a hard wall-clock deadline.
 *
 * A single AbortController wraps the entire call, so SDK-internal retries
 * cannot extend the wall clock past the deadline — the signal stays aborted
 * across every attempt.
 *
 * On deadline, this throws. It never returns a late value: a generation
 * abandoned here is abandoned for good, and the caller is responsible for
 * ensuring nothing from it reaches the member.
 */
export async function runWithTTSDeadline<T>(
  run: (signal: AbortSignal) => Promise<T>,
  requestId: string,
  deadlineMs: number = TTS_REQUEST_DEADLINE_MS
): Promise<T> {
  const controller = new AbortController();
  const startedAt = Date.now();
  const timer = setTimeout(() => controller.abort(), deadlineMs);
  try {
    return await run(controller.signal);
  } catch (err) {
    if (controller.signal.aborted) {
      const elapsedMs = Date.now() - startedAt;
      console.warn(
        `[openai-tts:${requestId}] DEADLINE_EXCEEDED elapsed=${elapsedMs}ms deadline=${deadlineMs}ms — generation abandoned`
      );
      throw new TTSDeadlineExceeded(deadlineMs, elapsedMs);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
