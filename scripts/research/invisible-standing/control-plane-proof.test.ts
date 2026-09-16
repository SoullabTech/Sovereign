import { readFileSync } from 'node:fs';
import {
  auditInvisibleStanding,
  authorizeInvisibleStandingEmission,
  type AuditEvidence,
} from './control-plane';

const emptyContext = { evidence: [] as AuditEvidence[], evidencePopulationComplete: false };

function currentResponses(): string[] {
  const blind = JSON.parse(readFileSync('docs/programme/evidence/STANDING_SHADOW_S5_BLIND_REVIEW_2026-09-16.json', 'utf8'));
  const key = JSON.parse(readFileSync('docs/programme/evidence/STANDING_SHADOW_S5_CONDITION_KEY_REVEALED_2026-09-16.json', 'utf8'));
  return blind.cases.map((c: any) => {
    const keyed = key.cases.find((k: any) => k.caseId === c.caseId);
    const condition = new Map(keyed.candidates.map((x: any) => [x.id, x.condition]));
    return c.candidates.find((candidate: any) => condition.get(candidate.id) === 'current').text;
  });
}

describe('JARVIS-MAIA-INVISIBLE-STANDING-01 control plane', () => {
  it('passes all ten human-preferred current responses byte-identically', () => {
    const responses = currentResponses();
    expect(responses).toHaveLength(10);
    for (const draft of responses) {
      const audit = auditInvisibleStanding(draft, emptyContext);
      const emission = authorizeInvisibleStandingEmission(draft, audit);
      expect(audit.disposition).toBe('pass');
      expect(emission).toEqual({ allowed: true, text: draft });
    }
  });

  it('allows MAIA to speak naturally in first person', () => {
    const draft = "I hear the tension you're naming, and I want to respect that both sides still matter.";
    const audit = auditInvisibleStanding(draft, emptyContext);
    expect(audit.disposition).toBe('pass');
    expect(authorizeInvisibleStandingEmission(draft, audit)).toEqual({ allowed: true, text: draft });
  });

  it('refuses a direct member attribution that exactly belongs to system evidence', () => {
    const evidence: AuditEvidence[] = [{
      evidenceId: 'M1',
      text: 'Autonomy is the organizing center of what is happening.',
      authoredBy: 'system',
      claimStanding: 'unavailable',
    }];
    const draft = 'You said: “Autonomy is the organizing center of what is happening.”';
    const audit = auditInvisibleStanding(draft, { evidence, evidencePopulationComplete: true });
    expect(audit.disposition).toBe('refuse');
    expect(audit.findings[0].ruleId).toBe('member_attribution_wrong_source');
  });

  it('refuses a superseded member claim when attributed as current but permits historical quotation', () => {
    const evidence: AuditEvidence[] = [{
      evidenceId: 'E1',
      text: 'Autonomy is the center of this for me.',
      authoredBy: 'member',
      claimStanding: 'superseded',
      claimKey: 'organizing-center',
    }];
    const current = auditInvisibleStanding('You now say: “Autonomy is the center of this for me.”', { evidence, evidencePopulationComplete: true });
    expect(current.disposition).toBe('refuse');
    expect(current.findings[0].ruleId).toBe('superseded_claim_as_current');

    const historicalDraft = 'Earlier, you said: “Autonomy is the center of this for me.”';
    const historical = auditInvisibleStanding(historicalDraft, { evidence, evidencePopulationComplete: true });
    expect(historical.disposition).toBe('pass');
    expect(authorizeInvisibleStandingEmission(historicalDraft, historical)).toEqual({ allowed: true, text: historicalDraft });
  });

  it('passes an exact current member quote', () => {
    const evidence: AuditEvidence[] = [{
      evidenceId: 'E2',
      text: 'Actually, grief is the center.',
      authoredBy: 'member',
      claimStanding: 'current',
      claimKey: 'organizing-center',
    }];
    const draft = 'You now say: “Actually, grief is the center.”';
    const audit = auditInvisibleStanding(draft, { evidence, evidencePopulationComplete: true });
    expect(audit.disposition).toBe('pass');
    expect(authorizeInvisibleStandingEmission(draft, audit)).toEqual({ allowed: true, text: draft });
  });

  it('observes but does not block an unknown attribution when the evidence population is incomplete', () => {
    const draft = 'You said: “The cedar felt like a guardian.”';
    const audit = auditInvisibleStanding(draft, emptyContext);
    expect(audit.disposition).toBe('observe');
    expect(audit.findings[0].ruleId).toBe('member_attribution_unverified');
    expect(authorizeInvisibleStandingEmission(draft, audit)).toEqual({ allowed: true, text: draft });
  });

  it('refuses existing constitutional identity-predicate violations without authoring a repair', () => {
    const draft = 'You are becoming the person you were always meant to be.';
    const audit = auditInvisibleStanding(draft, emptyContext);
    expect(audit.disposition).toBe('refuse');
    const emission = authorizeInvisibleStandingEmission(draft, audit);
    expect(emission.allowed).toBe(false);
    expect('text' in emission).toBe(false);
  });

  it('refuses existing false memory-capability claims without authoring a repair', () => {
    const draft = "I don't have memory between conversations.";
    const audit = auditInvisibleStanding(draft, emptyContext);
    expect(audit.disposition).toBe('refuse');
    expect(audit.findings.some((f) => f.ruleId === 'false_memory_capability_claim')).toBe(true);
  });

  it('refuses to authorize a different draft than the one audited', () => {
    const audit = auditInvisibleStanding('I hear you.', emptyContext);
    expect(() => authorizeInvisibleStandingEmission('I hear you differently.', audit)).toThrow('draft_digest_mismatch');
  });
});
