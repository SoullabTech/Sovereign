import crypto from 'node:crypto';
import { segmentClaimUnits } from '../claimIdentityShadow/claimUnits';
import type { ClaimDraft, ClaimPlan, PlannedClaim } from './types';

const VERSION = 'prospective-claim-plan-v1' as const;
const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const sorted = (values: readonly string[] | undefined) => [...(values ?? [])].sort();

export function claimIdForDraft(planId: string, ordinal: number, draft: ClaimDraft): string {
  return sha256(JSON.stringify({
    version: VERSION,
    planId,
    ordinal,
    speechAct: draft.speechAct,
    proposition: draft.proposition,
    standing: draft.standing,
    evidenceRefs: sorted(draft.evidenceRefs),
    relationRefs: sorted(draft.relationRefs),
    questionIntent: draft.questionIntent ?? null,
  }));
}

function validateSurface(draft: ClaimDraft): void {
  const units = segmentClaimUnits('prospective-surface', draft.surfaceText);
  if (units.length !== 1 || units[0]!.segmentationStatus !== 'atomic') {
    throw new Error('surface-must-be-one-atomic-claim');
  }
  if (draft.speechAct === 'QUESTION' && units[0]!.kind !== 'question') {
    throw new Error('question-surface-must-be-question');
  }
  if (draft.speechAct !== 'QUESTION' && units[0]!.kind === 'question') {
    throw new Error('assertive-surface-cannot-be-question');
  }
}

function validateDraft(draft: ClaimDraft): void {
  if (!draft.proposition.trim() || !draft.surfaceText.trim()) throw new Error('empty-claim');
  validateSurface(draft);
  const evidence = draft.evidenceRefs ?? [];
  if (draft.speechAct === 'GROUNDED') {
    if (!['established', 'adopted', 'system_fact', 'historical_only'].includes(draft.standing)) throw new Error('grounded-standing-invalid');
    if (evidence.length === 0) throw new Error('grounded-requires-evidence');
  }
  if (draft.speechAct === 'CANDIDATE') {
    if (draft.standing !== 'provisional') throw new Error('candidate-must-be-provisional');
    if (!/^(?:i wonder|i'm wondering|i am wondering|perhaps|maybe|one possibility is|it may be|could it be|i suspect)\b/i.test(draft.surfaceText.trim())) {
      throw new Error('candidate-surface-must-be-explicitly-provisional');
    }
  }
  if (draft.speechAct === 'QUESTION') {
    if (draft.standing !== 'open') throw new Error('question-must-be-open');
    if (!draft.questionIntent) throw new Error('question-requires-intent');
  }
}

export function compileClaimPlan(planId: string, drafts: readonly ClaimDraft[]): ClaimPlan {
  if (!planId.trim()) throw new Error('plan-id-required');
  drafts.forEach(validateDraft);
  const localIndex = new Map<string, number>();
  drafts.forEach((draft, ordinal) => {
    if (!draft.localId) return;
    const key = draft.localId.trim();
    if (!key) throw new Error('empty-local-id');
    if (localIndex.has(key)) throw new Error('duplicate-local-id');
    localIndex.set(key, ordinal);
  });
  const ids = drafts.map((draft, ordinal) => claimIdForDraft(planId, ordinal, draft));
  const claims: PlannedClaim[] = drafts.map((draft, ordinal) => {
    const ordinalTargets = [...(draft.targetOrdinals ?? [])];
    const localTargets = [...(draft.targetLocalIds ?? [])].map((key) => {
      const resolved = localIndex.get(key);
      if (resolved === undefined) throw new Error(`unknown-target-local-id:${key}`);
      return resolved;
    });
    const targets = [...new Set([...ordinalTargets, ...localTargets])];
    if (targets.some((x) => !Number.isInteger(x) || x < 0 || x >= drafts.length || x === ordinal)) {
      throw new Error('invalid-target-ordinal');
    }
    return {
      ...draft,
      claimId: ids[ordinal]!,
      ordinal,
      evidenceRefs: [...(draft.evidenceRefs ?? [])],
      relationRefs: [...(draft.relationRefs ?? [])],
      targetClaimIds: targets.map((x) => ids[x]!),
    };
  });
  for (const claim of claims) {
    if (claim.speechAct === 'QUESTION' && claim.questionIntent === 'confirm' && claim.targetClaimIds.length !== 1) {
      throw new Error('confirm-question-requires-one-target');
    }
    if (claim.speechAct === 'QUESTION' && claim.questionIntent === 'reopen') {
      const targets = claim.targetClaimIds
        .map((id) => claims.find((c) => c.claimId === id))
        .filter((c): c is PlannedClaim => Boolean(c));
      if (targets.some((target) => target.standing === 'established' || target.standing === 'adopted')) {
        throw new Error('cannot-reopen-established-claim');
      }
    }
  }
  return { version: VERSION, planId, claims };
}
