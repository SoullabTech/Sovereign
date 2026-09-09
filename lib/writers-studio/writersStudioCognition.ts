/**
 * ⭐ C5 · CANONICAL MAIA — and, after FOCUS-PRODUCER-01, canonical PARTICIPATION.
 *
 * ⛔ THE `meta.writerFocusContext` CHANNEL IS GONE. It never had a consumer, and
 * the Writer's Studio context contract refuses the `meta`/addendum/prompt family
 * outright: it is the ungoverned channel CMT-01 exists to close.
 *   *A dead unlawful channel should disappear, not become functional.*
 *
 * ⭐⭐ THE CROSSING, AMENDED. "Called getMaiaResponse()" is not a crossing — that
 * would let a valid receipt describe content canonical cognition refused, held or
 * never rendered. The crossing is:
 *
 *   Work authorized → typed producers constructed → MIPA admits them
 *     → CanonicalTurn built → renderer includes them at EVERY tier
 *     → rendered request handed to the response-producing path   ← CROSS
 *
 * So this port is two-phase. `prepare()` does everything up to but not including
 * generation and returns proof, or null. `generate()` begins the model handoff.
 * The caller confirms the receipt between them.
 */

import { getMaiaResponse } from '@/lib/sovereign/maiaService';
import { constructWriterTurn, renderWriterTurn, tierInvariant, type WriterHandoffProof } from './canonicalWriterTurn';
import type { CanonicalTurn, MemberIdentity } from '@/lib/maia/canonical-turn';

export interface CognitionPrepareInput {
  identity: MemberIdentity;
  sessionId: string;
  requestId: string;
  ask: string;
  workRef: string;
  scopeKind: 'whole_work' | 'section' | 'passage';
  label?: string;
  focusContext: string;
  sanctuary: boolean;
}

export interface PreparedHandoff {
  readonly turn: CanonicalTurn;
  readonly proof: WriterHandoffProof;
}

/**
 * Construct · adjudicate · render — everything before the model.
 *
 * ⛔ Returns null on any failure, and null means NO HANDOFF and therefore NO
 * CONFIRMATION: the receipt stays `attempted`, which is the truthful state when
 * authorization existed and the crossing did not.
 */
export async function prepareCanonicalHandoff(
  input: CognitionPrepareInput,
): Promise<PreparedHandoff | null> {
  try {
    const turn = constructWriterTurn({
      identity: input.identity,
      sessionRef: input.sessionId,
      exchangeId: input.requestId,
      ask: input.ask,
      sanctuary: input.sanctuary,
      participation: {
        focus: { workRef: input.workRef, scopeKind: input.scopeKind, label: input.label },
        workContext: input.focusContext,
      },
    });

    // ⭐ P5 enforced before the handoff, not hoped for afterwards. A membership
    // that differs by tier refuses the crossing rather than producing a Focus
    // that works in FAST and vanishes in CORE — a bug no human witness could
    // diagnose by feel.
    if (!tierInvariant(turn)) {
      console.error('[FOCUS] canonical handoff refused — participation is not tier-invariant', {
        turnId: turn.turnId,
      });
      return null;
    }

    const proof = renderWriterTurn(turn, { tier: 'CORE' });
    if (!proof) {
      // Admitted-but-not-rendered, or not admitted at all. Either way the Work
      // would not reach cognition, and a receipt must not say that it did.
      console.error('[FOCUS] canonical handoff refused — Work producer did not render', {
        turnId: turn.turnId,
      });
      return null;
    }
    return { turn, proof };
  } catch (err) {
    console.error('[FOCUS] canonical construction failed — no handoff', {
      error: err instanceof Error ? `${err.name}: ${err.message}` : 'unknown',
    });
    return null;
  }
}

/**
 * Begin the response-producing handoff. ⭐ Returns the in-flight promise WITHOUT
 * awaiting it, so the caller can confirm the receipt at the moment of handoff and
 * await generation afterwards. A generation failure after this point does not
 * unmake the crossing.
 */
export function beginCanonicalGeneration(
  prepared: PreparedHandoff,
  input: { memberId: string; sessionId: string; requestId: string; ask: string },
): Promise<{ ok: boolean; response?: string }> {
  return getMaiaResponse({
    sessionId: input.sessionId,
    input: input.ask,
    originRoute: '/api/writers-studio/focus',
    // ⛔ meta carries NO Writer material — identity and continuity only.
    meta: { userId: input.memberId, exchangeId: input.requestId },
    writerStudioTurn: prepared.turn,
  })
    .then(r => ({ ok: true, response: r?.text ?? undefined }))
    .catch(err => {
      console.error('[FOCUS] generation failed after handoff — the crossing still stands', {
        error: err instanceof Error ? err.message : 'unknown',
      });
      return { ok: false };
    });
}
