import { compileClaimPlan } from '../claimPlan';
import { renderClaimPlan } from '../renderer';
import { auditRenderedRoundTrip } from '../roundTrip';
import type { ClaimDraft, RenderedClaimPlan } from '../types';

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

const question: ClaimDraft = {
  proposition: 'How might the guardian relation affect concrete practice or design?',
  surfaceText: 'How might that guardian relationship begin to affect the actual design of the work?',
  speechAct: 'QUESTION',
  standing: 'open',
  questionIntent: 'open_edge',
};
describe('PROSPECTIVE-CLAIM-PLAN-01 · P6 deterministic round trip', () => {
  test('P6-F1 every prospective claim maps to exactly one retrospective unit', () => {
    const plan = compileClaimPlan('p6-one-to-one', [grounded, candidate, question]);
    const audit = auditRenderedRoundTrip(plan, renderClaimPlan(plan));
    expect(audit.ok).toBe(true);
    expect(audit.mappings).toHaveLength(3);
    expect(new Set(audit.mappings.map((m) => m.retrospectiveClaimId)).size).toBe(3);
    expect(audit.droppedClaimCount).toBe(0);
    expect(audit.unplannedUnitCount).toBe(0);
  });

  test('P6-F2 exact rendered bytes and span boundaries are preserved', () => {
    const plan = compileClaimPlan('p6-bytes', [grounded, candidate, question]);
    const rendered = renderClaimPlan(plan);
    const audit = auditRenderedRoundTrip(plan, rendered);
    expect(audit.ok).toBe(true);
    for (const mapping of audit.mappings) {
      const claim = plan.claims.find((c) => c.claimId === mapping.prospectiveClaimId)!;
      expect(rendered.text.slice(mapping.startChar, mapping.endChar)).toBe(claim.surfaceText);
    }
  });

  test('P6-F3 standing and speech act travel from plan rather than retrospective inference', () => {
    const plan = compileClaimPlan('p6-status', [grounded, candidate]);
    const audit = auditRenderedRoundTrip(plan, renderClaimPlan(plan));
    expect(audit.ok).toBe(true);
    expect(audit.mappings.map((m) => m.retrospectiveKind)).toEqual(['assertion', 'assertion']);
    expect(audit.mappings.map((m) => [m.prospectiveSpeechAct, m.prospectiveStanding])).toEqual([
      ['GROUNDED', 'established'],
      ['CANDIDATE', 'provisional'],
    ]);
  });

  test('P6-F4 unplanned extra prose is rejected', () => {
    const plan = compileClaimPlan('p6-extra', [grounded, question]);
    const rendered = renderClaimPlan(plan);
    const tampered: RenderedClaimPlan = {
      ...rendered,
      text: `${rendered.text} This sentence was never planned.`,
    };
    const audit = auditRenderedRoundTrip(plan, tampered);
    expect(audit.ok).toBe(false);
    expect(['render-contract-failed', 'claim-count-changed']).toContain(audit.reason);
  });

  test('P6-F5 merged or dropped realization is rejected', () => {
    const plan = compileClaimPlan('p6-merge', [grounded, candidate]);
    const rendered = renderClaimPlan(plan);
    const tampered: RenderedClaimPlan = {
      planId: rendered.planId,
      text: rendered.text.replace(' I wonder', 'I wonder'),
      spans: rendered.spans,
    };
    const audit = auditRenderedRoundTrip(plan, tampered);
    expect(audit.ok).toBe(false);
  });

  test('P6-F6 prospective and retrospective IDs remain distinct namespaces with lawful mapping', () => {
    const plan = compileClaimPlan('p6-namespace', [grounded, candidate, question]);
    const audit = auditRenderedRoundTrip(plan, renderClaimPlan(plan));
    expect(audit.ok).toBe(true);
    for (const mapping of audit.mappings) {
      expect(mapping.prospectiveClaimId).toHaveLength(64);
      expect(mapping.retrospectiveClaimId).toHaveLength(64);
      expect(mapping.prospectiveClaimId).not.toBe(mapping.retrospectiveClaimId);
    }
  });
});
