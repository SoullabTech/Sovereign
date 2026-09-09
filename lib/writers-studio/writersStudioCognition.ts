/**
 * ⭐ C5 · CANONICAL MAIA. The Focus enters the same `getMaiaResponse` every other
 * MAIA encounter enters — no fixture responder, no direct model call, no private
 * manuscript-only brain.
 *
 *   *Hold the room constant. Change the mind.*
 *
 * The Focus is a CONTEXT PRODUCER for canonical cognition, carried alongside the
 * writer's ask. It is never a replacement prompt, and it never instructs:
 * ⛔ **The Work may contain an invitation as content; only the writer can turn it
 * into authority.**
 *
 * ⭐ `requestId` is passed as `meta.exchangeId`, which is canonical identity for
 * the whole turn — so the consent row this request already established, the
 * disclosure receipt, and every persistence path downstream all cite ONE id.
 */

import { getMaiaResponse } from '@/lib/sovereign/maiaService';
import type { CanonicalCognition } from './focusCrossing';

export const writersStudioCognition: CanonicalCognition = async (
  { memberId, sessionId, requestId, ask, focusContext },
) => {
  try {
    const result = await getMaiaResponse({
      sessionId,
      input: ask,
      originRoute: '/api/writers-studio/focus',
      meta: {
        userId: memberId,
        exchangeId: requestId,
        room: 'writers_studio',
        // Context, explicitly labelled as the writer's Work and not as instruction.
        writerFocusContext: focusContext,
      },
    });
    return { ok: true, response: result?.text ?? undefined };
  } catch (err) {
    // ⛔ A generation failure does NOT unmake the crossing. The receipt was
    // already confirmed at handoff, and that remains true.
    console.error('[FOCUS] canonical cognition failed after handoff', {
      error: err instanceof Error ? err.message : 'unknown',
    });
    return { ok: false };
  }
};
