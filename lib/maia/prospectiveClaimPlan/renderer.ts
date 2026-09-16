import type { ClaimPlan, RenderedClaimPlan } from './types';

export function renderClaimPlan(plan: ClaimPlan): RenderedClaimPlan {
  let text = '';
  const spans = plan.claims.map((claim, index) => {
    if (index > 0) text += ' ';
    const startChar = text.length;
    text += claim.surfaceText;
    return {
      claimId: claim.claimId,
      startChar,
      endChar: text.length,
      speechAct: claim.speechAct,
      standing: claim.standing,
    } as const;
  });
  return { planId: plan.planId, text, spans };
}

export function verifyRenderedPlan(plan: ClaimPlan, rendered: RenderedClaimPlan): boolean {
  if (rendered.planId !== plan.planId || rendered.spans.length !== plan.claims.length) return false;
  let cursor = 0;
  for (let i = 0; i < plan.claims.length; i += 1) {
    const claim = plan.claims[i]!;
    const span = rendered.spans[i]!;
    if (i > 0) {
      if (rendered.text.slice(cursor, span.startChar) !== ' ') return false;
    } else if (span.startChar !== 0) return false;
    if (span.claimId !== claim.claimId || span.speechAct !== claim.speechAct || span.standing !== claim.standing) return false;
    if (rendered.text.slice(span.startChar, span.endChar) !== claim.surfaceText) return false;
    cursor = span.endChar;
  }
  return cursor === rendered.text.length;
}
