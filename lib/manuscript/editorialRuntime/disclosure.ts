/** Editorial disclosure: authorization, accountability and outcome stay separate. */
import { randomUUID } from 'node:crypto';
import { confirmDisclosureCrossed } from '@/lib/disclosure/contextDisclosureReceipt';
import { establishDisclosureBoundary, mayCrossBoundary } from '@/lib/disclosure/disclosureBoundary';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { runStructured } from '@/lib/ai/structured/router';
import type { StructuredRequest, StructuredOutcome } from '@/lib/ai/structured/types';

export type EditorialDisclosureRefusal = 'external_authorization_required'
  | 'disclosure_unavailable' | 'disclosure_confirmation_failed';
export async function runDisclosedEditorial(input: {
  authorization?: 'anthropic'; memberId: string; workId: string;
  requestRef: string; request: StructuredRequest; posture: TurnPosture; threadId: string;
}): Promise<{ ok: true; structured: StructuredOutcome }
  | { ok: false; reason: EditorialDisclosureRefusal }> {
  if (input.authorization !== 'anthropic') return { ok: false, reason: 'external_authorization_required' };
  if (!(input.posture instanceof TurnPosture) || input.posture.sanctuary) return { ok: false, reason: 'disclosure_unavailable' };
  const disclosureId = randomUUID();
  const attempt = await establishDisclosureBoundary({
    requestId: input.requestRef, posture: input.posture, memberId: input.memberId, sessionId: input.threadId,
    disclosure: { disclosureId,
    boundary: 'writers_studio.editorial_turn->maia_cognition',
    sourceClass: 'work', participationBasis: 'member_invoked',
    sourceRef: input.workId, scopeKind: 'passage', gesture: 'work_with_this',
    destination: 'anthropic' },
  });
  if (!mayCrossBoundary(attempt)) return { ok: false, reason: 'disclosure_unavailable' };
  const structured = await runStructured(input.request);
  // Confirm before editorial admission; an invalid answer can follow a disclosure.
  if (structured.ok || structured.dispatch === 'response_observed') {
    if (!await confirmDisclosureCrossed(disclosureId)) {
      return { ok: false, reason: 'disclosure_confirmation_failed' };
    }
  }
  return { ok: true, structured };
}
