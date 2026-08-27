/**
 * What the member is told when intake stops.
 *
 * WS2-01B, 2026-08-27. The product rule this module exists to make testable:
 *
 *   **If intake refuses or cannot proceed, the member must be told exactly
 *   where it stopped and why.**
 *
 * Four separate silent refusals reached a writer as nothing at all — a button
 * pressed and a room that did not move — because each call site decided for
 * itself what to say, and two of them decided to say nothing. A rule enforced
 * separately at three call sites is not a rule; it is three opinions.
 *
 * So the decision is made ONCE, here, as a pure function of (stage, status,
 * body). Nothing in it touches the DOM, so what the member reads is a value a
 * test can assert — which is the whole point. A log line proving the ROUTE
 * refused is not evidence the MEMBER was told; only this is.
 *
 * Two constraints hold in every branch:
 *
 *   1. **The server's own words win.** "too many sections (max 400)" is
 *      something a writer can act on. "Could not save. Please try again."
 *      is an apology standing where a fact belongs.
 *   2. **There is no empty answer.** Every path returns a sentence naming the
 *      stage that stopped. A caller cannot accidentally render nothing,
 *      because nothing is not one of the values.
 */

/** Where intake stopped, in the member's terms — not the route's. */
export type IntakeStage = 'read' | 'cuts' | 'save';

/** What the member was doing, said plainly, for the fallback sentences. */
const STAGE_ACT: Record<IntakeStage, string> = {
  read: 'reading that file',
  cuts: 'reading the cuts in that text',
  save: 'saving your manuscript',
};

/**
 * The assurance that follows every refusal.
 *
 * Intake is a threshold: up to the save, nothing has been written. Saying so is
 * not reassurance for its own sake — a writer who does not know whether a
 * failed import left half a book behind cannot safely try again.
 */
const NOTHING_LOST: Record<IntakeStage, string> = {
  read: 'Nothing was saved, and your file is unchanged.',
  cuts: 'Nothing was saved, and your text is unchanged.',
  save: 'Nothing was saved. Your cuts are still here, so you can try again.',
};

/** A body the client managed to parse, or the empty object when it could not. */
export interface IntakeBody {
  error?: unknown;
  reason?: unknown;
}

function serverWords(body: IntakeBody | null | undefined): string | null {
  const e = body?.error;
  return typeof e === 'string' && e.trim().length > 0 ? e.trim() : null;
}

/**
 * The sentence the member reads when intake stops at `stage`.
 *
 * `status` is the HTTP status, or 0 when the request never got an answer at all
 * — a distinction worth keeping, because "the Press refused" and "the Press was
 * not reached" are different facts about the world and suggest different next
 * moves.
 */
export function intakeMessage(
  stage: IntakeStage,
  status: number,
  body?: IntakeBody | null,
): string {
  const said = serverWords(body);
  if (said) return said;

  if (status === 0) {
    return `We could not reach the Press while ${STAGE_ACT[stage]}. ${NOTHING_LOST[stage]}`;
  }
  /* No message from the server is itself a fact, and the status is the only
     handle anyone has on it — the member's, and ours when they quote it back. */
  return `Something stopped while ${STAGE_ACT[stage]} (HTTP ${status}). ${NOTHING_LOST[stage]}`;
}
