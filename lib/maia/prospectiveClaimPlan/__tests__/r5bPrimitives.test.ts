import { claimIdForDraft, compileClaimPlan } from '../claimPlan';
import type { ClaimDraft } from '../types';

const candidate: ClaimDraft = {
  localId: 'cand_resilience',
  proposition: 'Resilience may fit.',
  surfaceText: 'Perhaps resilience is part of what is present.',
  speechAct: 'CANDIDATE',
  standing: 'provisional',
  evidenceRefs: ['E1'],
  relationRefs: [],
};

describe('FREE-SYNTHESIS-CLAIM-PLAN-REPLAY-01 · R5b primitives', () => {
  test('local handle resolves deterministically to the exact candidate claim', () => {
    const confirm: ClaimDraft = {
      localId: 'q_confirm',
      proposition: 'Does resilience fit?',
      surfaceText: 'Does that possibility fit?',
      speechAct: 'QUESTION',
      standing: 'open',
      questionIntent: 'confirm',
      targetLocalIds: ['cand_resilience'],
    };
    const plan = compileClaimPlan('r5b-local-target', [candidate, confirm]);
    expect(plan.claims[1]!.targetClaimIds).toEqual([plan.claims[0]!.claimId]);
  });
  test('local handle does not alter stable semantic claim identity', () => {
    const a = claimIdForDraft('r5b-id', 0, candidate);
    const b = claimIdForDraft('r5b-id', 0, { ...candidate, localId: 'another_handle' });
    expect(a).toBe(b);
  });

  test('unknown or duplicate local handles are rejected', () => {
    const badTarget: ClaimDraft = {
      localId: 'q', proposition: 'Does it fit?', surfaceText: 'Does it fit?',
      speechAct: 'QUESTION', standing: 'open', questionIntent: 'confirm',
      targetLocalIds: ['missing'],
    };
    expect(() => compileClaimPlan('r5b-unknown', [candidate, badTarget]))
      .toThrow('unknown-target-local-id:missing');
    expect(() => compileClaimPlan('r5b-dup', [candidate, { ...candidate }]))
      .toThrow('duplicate-local-id');
  });

  test('historical-only grounded report is structurally representable', () => {
    const historical: ClaimDraft = {
      localId: 'hist_fear', proposition: 'Fear was the earlier interpretation and is now superseded.',
      surfaceText: 'Fear was the earlier interpretation, which has since been superseded.',
      speechAct: 'GROUNDED', standing: 'historical_only',
      evidenceRefs: ['E_old', 'E_correction'], relationRefs: ['R_correction'],
    };    const plan = compileClaimPlan('r5b-history', [historical]);
    expect(plan.claims[0]!.standing).toBe('historical_only');
    expect(plan.claims[0]!.evidenceRefs).toContain('E_old');
  });

  test('unresolved antecedent system fact may ground an abstention claim', () => {
    const abstain: ClaimDraft = {
      localId: 'sys_unresolved',
      proposition: 'No exact antecedent is resolved.',
      surfaceText: 'No exact antecedent is currently resolved for that reference.',
      speechAct: 'GROUNDED',
      standing: 'system_fact',
      evidenceRefs: ['SYS1'],
      relationRefs: [],
    };
    const plan = compileClaimPlan('r5b-abstain', [abstain]);
    expect(plan.claims[0]!.standing).toBe('system_fact');
  });
});