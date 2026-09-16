import { bindGestureToPlan } from '../gestureBinding';
import { claimIdForDraft, compileClaimPlan } from '../claimPlan';
import { renderClaimPlan, verifyRenderedPlan } from '../renderer';
import { auditRenderedRoundTrip } from '../roundTrip';
import type { ClaimDraft } from '../types';

const grounded: ClaimDraft = {
  proposition: 'Silver Cedar is the adopted guardian image.',
  surfaceText: 'The Silver Cedar is the guardian image you already chose for this work.',
  speechAct: 'GROUNDED',
  standing: 'established',
  evidenceRefs: ['E5', 'E6'],
  relationRefs: ['R5'],
};

const candidate: ClaimDraft = {
  proposition: 'Resilience may be part of the symbol significance.',
  surfaceText: 'I wonder whether resilience is part of what the image is beginning to carry.',
  speechAct: 'CANDIDATE',
  standing: 'provisional',
  evidenceRefs: ['E5'],
};

const openQuestion: ClaimDraft = {
  proposition: 'How might the guardian relation affect concrete practice or design?',
  surfaceText: 'How might that guardian relationship begin to affect the actual design of the work?',
  speechAct: 'QUESTION',
  standing: 'open',
  questionIntent: 'open_edge',
};

describe('PROSPECTIVE-CLAIM-PLAN-01 · P3 falsifiers', () => {
  test('P3-F1 claim identity exists before rendering and is stable across surface rewording', () => {
    const a = claimIdForDraft('plan-1', 0, grounded);
    const b = claimIdForDraft('plan-1', 0, { ...grounded, surfaceText: 'You have already chosen Silver Cedar as the guardian image for the work.' });
    expect(a).toBe(b);
  });

  test('P3-F2 proposition change changes claim identity', () => {
    const a = claimIdForDraft('plan-2', 0, grounded);
    const b = claimIdForDraft('plan-2', 0, { ...grounded, proposition: 'Silver Cedar is merely an image.' });
    expect(a).not.toBe(b);
  });

  test('P3-F3 standing or evidence lineage change changes claim identity', () => {
    const a = claimIdForDraft('plan-3', 0, grounded);
    const b = claimIdForDraft('plan-3', 0, { ...grounded, standing: 'adopted' });
    const c = claimIdForDraft('plan-3', 0, { ...grounded, evidenceRefs: ['E5'] });
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });

  test('P3-F4 deterministic render is a bijection over planned claims', () => {
    const plan = compileClaimPlan('plan-4', [grounded, candidate, openQuestion]);
    const rendered = renderClaimPlan(plan);
    expect(rendered.spans).toHaveLength(3);
    expect(verifyRenderedPlan(plan, rendered)).toBe(true);
    expect(rendered.text).toBe([grounded.surfaceText, candidate.surfaceText, openQuestion.surfaceText].join(' '));
  });

  test('P3-F5 rendering cannot invent unplanned semantic text', () => {
    const plan = compileClaimPlan('plan-5', [grounded, openQuestion]);
    const rendered = renderClaimPlan(plan);
    const covered = rendered.spans.map((span) => rendered.text.slice(span.startChar, span.endChar)).join(' ');
    expect(covered).toBe(rendered.text);
  });

  test('P3-F6 candidate must be visibly provisional at the surface', () => {
    expect(() => compileClaimPlan('plan-6', [{
      ...candidate,
      surfaceText: 'Resilience is part of what this symbol means to you.',
    }])).toThrow('candidate-surface-must-be-explicitly-provisional');
  });

  test('P3-F7 grounded claims require evidence and lawful standing', () => {
    expect(() => compileClaimPlan('plan-7', [{ ...grounded, evidenceRefs: [] }])).toThrow('grounded-requires-evidence');
    expect(() => compileClaimPlan('plan-7b', [{ ...grounded, standing: 'provisional' }])).toThrow('grounded-standing-invalid');
  });

  test('P3-F8 confirmation frame binds the targeted candidate, not question or neighboring claim', () => {
    const confirm: ClaimDraft = {
      proposition: 'Does the resilience candidate fit?',
      surfaceText: 'Does that possibility fit what you mean?',
      speechAct: 'QUESTION', standing: 'open', questionIntent: 'confirm', targetOrdinals: [1],
    };
    const plan = compileClaimPlan('plan-8', [grounded, candidate, confirm]);
    const binding = bindGestureToPlan('that is exactly it. MAIA!', plan);
    expect(binding.outcome).toBe('BOUND');
    expect(binding.targetClaimId).toBe(plan.claims[1]!.claimId);
    expect(binding.targetClaimId).not.toBe(plan.claims[0]!.claimId);
    expect(binding.targetClaimId).not.toBe(plan.claims[2]!.claimId);
  });

  test('P3-F9 correction through the same frame targets only the exact candidate', () => {
    const confirm: ClaimDraft = {
      proposition: 'Does the resilience candidate fit?',
      surfaceText: 'Does that possibility fit what you mean?',
      speechAct: 'QUESTION', standing: 'open', questionIntent: 'confirm', targetOrdinals: [1],
    };
    const plan = compileClaimPlan('plan-9', [grounded, candidate, confirm]);
    const binding = bindGestureToPlan("no, that's not it", plan);
    expect(binding.outcome).toBe('BOUND');
    expect(binding.targetClaimId).toBe(plan.claims[1]!.claimId);
  });

  test('P3-F10 opaque retrospective reference does not manufacture an antecedent', () => {
    const plan = compileClaimPlan('plan-10', [grounded, candidate]);
    const binding = bindGestureToPlan('what was that phrase I mentioned earlier?', plan);
    expect(binding.outcome).toBe('AMBIGUOUS');
    expect(binding.targetClaimId).toBeUndefined();
  });

  test('P3-F11 generic confirmation across multiple assertive claims remains ambiguous without frame', () => {
    const plan = compileClaimPlan('plan-11', [grounded, candidate]);
    const binding = bindGestureToPlan('that is exactly it', plan);
    expect(binding.outcome).toBe('AMBIGUOUS');
    expect(binding.candidateClaimIds).toHaveLength(2);
  });

  test('P3-F12 restart protest binds question claim only', () => {
    const plan = compileClaimPlan('plan-12', [grounded, openQuestion]);
    const binding = bindGestureToPlan('I already told you', plan);
    expect(binding.outcome).toBe('BOUND');
    expect(binding.targetClaimId).toBe(plan.claims[1]!.claimId);
  });

  test('P3-F13 an established relation cannot be reopened by plan declaration', () => {
    const reopen: ClaimDraft = {
      proposition: 'What does Silver Cedar mean?',
      surfaceText: 'What does the Silver Cedar mean to you?',
      speechAct: 'QUESTION', standing: 'open', questionIntent: 'reopen', targetOrdinals: [0],
    };
    expect(() => compileClaimPlan('plan-13', [grounded, reopen])).toThrow('cannot-reopen-established-claim');
  });

  test('P3-F14 relational Gestalt continues from established relation toward open edge', () => {
    const plan = compileClaimPlan('silver-cedar-gestalt', [grounded, candidate, openQuestion]);
    expect(plan.claims.map((c) => [c.speechAct, c.standing])).toEqual([
      ['GROUNDED', 'established'],
      ['CANDIDATE', 'provisional'],
      ['QUESTION', 'open'],
    ]);
    expect(plan.claims[2]!.questionIntent).toBe('open_edge');
  });

  test('P3-F15 rendering the same plan twice preserves claim ids and exact text', () => {
    const plan = compileClaimPlan('plan-15', [grounded, candidate, openQuestion]);
    expect(renderClaimPlan(plan)).toEqual(renderClaimPlan(plan));
  });

  test('P3-F16 surface rewording may preserve semantic claim identity but changes only the rendered bytes', () => {
    const first = compileClaimPlan('plan-16', [grounded]);
    const second = compileClaimPlan('plan-16', [{ ...grounded, surfaceText: 'You already chose the Silver Cedar as guardian for this work.' }]);
    expect(first.claims[0]!.claimId).toBe(second.claims[0]!.claimId);
    expect(renderClaimPlan(first).text).not.toBe(renderClaimPlan(second).text);
  });

  test('P3-F17 rendered prose round-trips one-to-one through retrospective claim parsing', () => {
    const plan = compileClaimPlan('plan-17', [grounded, candidate, openQuestion]);
    const audit = auditRenderedRoundTrip(plan, renderClaimPlan(plan));
    expect(audit.ok).toBe(true);
    expect(audit.reason).toBe('one-to-one');
  });

  test('P3-F18 confirmation question requires exactly one prospective target', () => {
    const confirm: ClaimDraft = {
      proposition: 'Does this fit?', surfaceText: 'Does that fit?', speechAct: 'QUESTION', standing: 'open', questionIntent: 'confirm', targetOrdinals: [],
    };
    expect(() => compileClaimPlan('plan-18', [grounded, confirm])).toThrow('confirm-question-requires-one-target');
  });
});
