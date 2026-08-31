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
 * Runs one whole speech generation under a hard wall-clock deadline.
 *
 * The deadline is a RACE, not a hope. An earlier revision only aborted the
 * controller and then waited for the upstream call to reject — which makes
 * the deadline contingent on upstream honouring AbortSignal. An upstream that
 * ignores or mishandles the signal could still hold the caller indefinitely,
 * which is the exact failure this unit exists to end.
 *
 * The two mechanisms do different jobs and both are required:
 *
 *   abort  → resource cancellation (stop the work, free the socket)
 *   race   → conversational authority (the caller is released on time,
 *            whether or not the work cooperates)
 *
 * Whatever `run` is given must include EVERY leg of the generation, response
 * body consumption included. The production 589,288ms was measured after the
 * body was consumed, so we do not know whether those minutes were spent
 * waiting for headers, for the body, or both. A deadline that covers only the
 * header exchange would not have bounded the witnessed failure.
 *
 * A generation abandoned here is abandoned for good. If the upstream later
 * succeeds, that result is discarded — it can never become this call's return
 * value.
 */
export async function runWithTTSDeadline<T>(
  run: (signal: AbortSignal) => Promise<T>,
  requestId: string,
  deadlineMs: number = TTS_REQUEST_DEADLINE_MS
): Promise<T> {
  const controller = new AbortController();
  const startedAt = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      const elapsedMs = Date.now() - startedAt;
      console.warn(
        `[openai-tts:${requestId}] DEADLINE_EXCEEDED elapsed=${elapsedMs}ms deadline=${deadlineMs}ms — generation abandoned`
      );
      reject(new TTSDeadlineExceeded(deadlineMs, elapsedMs));
    }, deadlineMs);
  });

  const work = run(controller.signal);

  // An abandoned generation may still settle later, in either direction. Its
  // rejection must not surface as an unhandled rejection, and its success must
  // not reach anyone: nothing awaits `work` again after the race is decided.
  void work.then(
    () => undefined,
    () => undefined
  );

  try {
    return await Promise.race([work, deadline]);
  } catch (err) {
    if (err instanceof TTSDeadlineExceeded) throw err;
    if (controller.signal.aborted) {
      // Upstream rejected because we aborted it — same abandonment, reported
      // in the same terms rather than as an upstream transport failure.
      throw new TTSDeadlineExceeded(deadlineMs, Date.now() - startedAt);
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
