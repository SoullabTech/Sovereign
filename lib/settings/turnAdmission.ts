/**
 * SANCTUARY-INIT-GATE-01 — the single admission predicate.
 *
 * Two questions that must not be conflated:
 *
 *   isSanctuary  — HOW does an admitted turn execute?
 *   admission    — MAY a turn execute at all?
 *
 * Text dispatch, voice dispatch and turn persistence each enforce the gate at
 * their own boundary, but they consume the decision from here so they cannot
 * disagree about whether turn-bearing work is admitted.
 *
 * Pure and storage-free by design: the rules are the part that must be
 * falsifiable, so they live where a test can drive them directly rather than
 * only through a mounted component.
 */

import type { SanctuaryInitState } from './accountSettings';

/**
 * May turn-bearing work begin? `unresolved` is the absence of an established
 * boundary, never a value to execute against.
 */
export function mayBeginTurn(state: SanctuaryInitState): boolean {
  return state === 'sanctuary' || state === 'continuity';
}

export interface PersistenceDecision {
  /** Whether this change may be written through to durable turn storage. */
  post: boolean;
  /** The sync watermark to carry forward. */
  nextWatermark: number;
}

/**
 * Decide whether a change in the message list may cross into turn persistence.
 *
 * The subtle case is `admitted === false`. The watermark still advances to the
 * current count, and that is not a dropped write: while the boundary is
 * unresolved BOTH turn entry points are refused, so no turn can have been
 * created, and any growth in the message list is restored history. Restored
 * history must never be re-POSTed — the restore path already sets the
 * watermark for exactly this reason. Holding the watermark back here instead
 * would make the gate manufacture that bug: on resolution the effect would
 * re-run holding the whole restored transcript as "new" and write it all.
 */
export function decideTurnPersistence(args: {
  admitted: boolean;
  messageCount: number;
  watermark: number;
}): PersistenceDecision {
  const { admitted, messageCount, watermark } = args;

  if (!admitted) {
    return { post: false, nextWatermark: messageCount };
  }

  // One exchange is a user message plus a reply.
  if (messageCount >= watermark + 2) {
    return { post: true, nextWatermark: messageCount };
  }

  return { post: false, nextWatermark: watermark };
}
