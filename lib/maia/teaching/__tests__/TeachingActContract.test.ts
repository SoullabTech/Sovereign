/** @jest-environment node */

import fs from 'fs';
import path from 'path';

import {
  PROVENANCE_LAYERS,
  TEACHING_ACTS,
  TEACHING_ACT_CONTRACT_VERSION,
  T0_RESTRAINT_CODES,
  classifyTeachingDisposition,
  type TeachingDispositionInput,
} from '../TeachingActContract';

const clearRestraints = {
  wouldOverwriteMemberMeaning: false,
  presenceBeforePedagogy: false,
  interpretationClaimRequired: false,
  completionPressure: false,
  falseAuthorityRisk: false,
  restraintVsFailureUnclear: false,
} as const;

function fixture(overrides: Partial<TeachingDispositionInput> = {}): TeachingDispositionInput {
  return {
    occasion: {
      kind: 'explicit_request',
      requestedAct: 'ORIENT',
      directExplanationRequested: false,
      teachingDeclined: false,
    },
    sourceBasis: {
      requiredForAct: true,
      standing: 'governed_ready',
      retrievalRelevant: true,
      sources: [{ sourceId: 'elemental-alchemy', revision: 'f57f17e6' }],
      provenanceLayers: ['source'],
    },
    restraints: { ...clearRestraints },
    candidateAct: null,
    uncertainty: { level: 'low', reasons: [] },
    ...overrides,
  };
}

describe('MAIA Teaching Intelligence T1 — Teaching Act Contract', () => {
  it('pins the closed grammar and makes REFRAIN first-class', () => {
    expect(TEACHING_ACT_CONTRACT_VERSION).toBe('tac-1');
    expect([...TEACHING_ACTS]).toEqual([
      'ORIENT',
      'EXPLAIN',
      'ILLUSTRATE',
      'CONTRAST',
      'INQUIRE',
      'INVITE_EXPERIENCE',
      'OFFER_PRACTICE',
      'CHECK_UNDERSTANDING',
      'REPAIR_MISUNDERSTANDING',
      'REFRAIN',
    ]);
    expect([...T0_RESTRAINT_CODES]).toEqual(['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8']);
  });

  it('F-T1-01 retrieval relevance does not imply teaching without an occasion', () => {
    const result = classifyTeachingDisposition(fixture({
      occasion: { kind: 'none', directExplanationRequested: false, teachingDeclined: false },
      candidateAct: 'EXPLAIN',
    }));
    expect(result.act).toBe('REFRAIN');
    expect(result.rationale).toEqual(['no_member_occasion']);
    expect(result.sourceBasis.retrievalRelevant).toBe(true);
  });

  it('F-T1-02 direct explanation remains available when explicitly requested', () => {
    const result = classifyTeachingDisposition(fixture({
      occasion: { kind: 'explicit_request', directExplanationRequested: true, teachingDeclined: false },
      candidateAct: 'INQUIRE',
    }));
    expect(result.act).toBe('EXPLAIN');
    expect(result.rationale).toEqual(['member_requested_direct_explanation']);
  });

  it('F-T1-03 explicit requested family is preserved', () => {
    const result = classifyTeachingDisposition(fixture({
      occasion: {
        kind: 'explicit_request',
        requestedAct: 'CONTRAST',
        directExplanationRequested: false,
        teachingDeclined: false,
      },
    }));
    expect(result.act).toBe('CONTRAST');
  });

  it('F-T1-04 present movement remains proposal-only', () => {
    const result = classifyTeachingDisposition(fixture({
      occasion: { kind: 'present_movement', directExplanationRequested: false, teachingDeclined: false },
      candidateAct: 'INVITE_EXPERIENCE',
    }));
    expect(result.act).toBe('INVITE_EXPERIENCE');
    expect(result.rationale).toEqual(['present_movement_candidate']);
    expect(result.mayExecute).toBe(false);
    expect(result.executionStanding).toBe('NON_EXECUTING_PROPOSAL');
  });

  it('F-T1-05 R1 member decline overrides teaching request', () => {
    const result = classifyTeachingDisposition(fixture({
      occasion: {
        kind: 'explicit_request',
        requestedAct: 'EXPLAIN',
        directExplanationRequested: true,
        teachingDeclined: true,
      },
    }));
    expect(result.act).toBe('REFRAIN');
    expect(result.rationale).toContain('member_declined_teaching');
  });

  it('F-T1-06 R2 source boundary refuses source-dependent teaching', () => {
    const result = classifyTeachingDisposition(fixture({
      sourceBasis: {
        requiredForAct: true,
        standing: 'unavailable',
        retrievalRelevant: true,
        sources: [],
        provenanceLayers: [],
      },
    }));
    expect(result.act).toBe('REFRAIN');
    expect(result.rationale).toContain('source_not_governed');
    expect(result.restraintChecks.find((r) => r.code === 'R2')).toEqual({
      code: 'R2',
      triggered: true,
      nature: 'authority_boundary',
    });
  });

  it.each([
    ['wouldOverwriteMemberMeaning', 'R3', 'preserve_unfinished_meaning'],
    ['presenceBeforePedagogy', 'R4', 'presence_before_pedagogy'],
    ['interpretationClaimRequired', 'R5', 'interpretation_boundary'],
    ['completionPressure', 'R6', 'completion_pressure'],
    ['falseAuthorityRisk', 'R7', 'false_authority_risk'],
  ] as const)('F-T1 restraint %s triggers %s', (field, code, reason) => {
    const result = classifyTeachingDisposition(fixture({
      restraints: { ...clearRestraints, [field]: true },
    }));
    expect(result.act).toBe('REFRAIN');
    expect(result.rationale).toContain(reason);
    expect(result.restraintChecks.find((r) => r.code === code)?.triggered).toBe(true);
  });

  it('F-T1-07 R8 is a failure boundary, not wise silence', () => {
    const result = classifyTeachingDisposition(fixture({
      restraints: { ...clearRestraints, restraintVsFailureUnclear: true },
      uncertainty: { level: 'high', reasons: ['failure_boundary'] },
    }));
    expect(result.act).toBe('REFRAIN');
    expect(result.rationale).toContain('failure_boundary_unresolved');
    expect(result.restraintChecks.find((r) => r.code === 'R8')).toEqual({
      code: 'R8',
      triggered: true,
      nature: 'failure_boundary',
    });
  });

  it('F-T1-08 learner-state and mastery fields are rejected', () => {
    const learnerState = { ...fixture(), learnerState: 'integrating' } as unknown as TeachingDispositionInput;
    expect(() => classifyTeachingDisposition(learnerState)).toThrow(/non-contract key: learnerState/);

    const mastery = { ...fixture(), mastery: 0.9 } as unknown as TeachingDispositionInput;
    expect(() => classifyTeachingDisposition(mastery)).toThrow(/non-contract key: mastery/);
  });

  it('F-T1-09 source fidelity keeps provenance distinct and rejects authorVoice', () => {
    const result = classifyTeachingDisposition(fixture({
      sourceBasis: {
        requiredForAct: true,
        standing: 'governed_ready',
        retrievalRelevant: true,
        sources: [{ sourceId: 'elemental-alchemy', revision: 'f57f17e6' }],
        provenanceLayers: ['source', 'maia_paraphrase', 'maia_synthesis'],
      },
    }));
    expect(result.sourceBasis.provenanceLayers).toEqual(['source', 'maia_paraphrase', 'maia_synthesis']);
    expect([...PROVENANCE_LAYERS]).toEqual(['source', 'maia_paraphrase', 'maia_synthesis']);

    const bad = {
      ...fixture(),
      sourceBasis: { ...fixture().sourceBasis, authorVoice: 'imitate-author' },
    } as unknown as TeachingDispositionInput;
    expect(() => classifyTeachingDisposition(bad)).toThrow(/non-contract key: authorVoice/);
  });

  it('F-T1-10 source-independent direct explanation remains possible', () => {
    const result = classifyTeachingDisposition(fixture({
      occasion: { kind: 'explicit_request', directExplanationRequested: true, teachingDeclined: false },
      sourceBasis: {
        requiredForAct: false,
        standing: 'not_required',
        retrievalRelevant: false,
        sources: [],
        provenanceLayers: [],
      },
    }));
    expect(result.act).toBe('EXPLAIN');
  });

  it('F-T1-11 output is descriptive only, claim-free, non-executing and non-persistent', () => {
    const result = classifyTeachingDisposition(fixture());
    expect(result.authorityEffect).toBe('DESCRIPTIVE_PROPOSAL_ONLY');
    expect(result.learnerClaims).toEqual([]);
    expect(result.mayExecute).toBe(false);
    expect(result.mayPersistLearnerState).toBe(false);
  });

  it('F-T1-12 same structured evidence produces same record', () => {
    expect(classifyTeachingDisposition(fixture())).toEqual(classifyTeachingDisposition(fixture()));
  });

  it('F-T1-13 every output exposes all R1-R8 checks', () => {
    expect(classifyTeachingDisposition(fixture()).restraintChecks.map((r) => r.code))
      .toEqual(['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8']);
  });

  it('F-T1-14 module has no runtime I/O, retrieval, model, prompt, DB or memory dependency', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../TeachingActContract.ts'), 'utf8');
    expect(source).not.toMatch(/^import\s/m);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bquery\s*\(/);
    expect(source).not.toMatch(/retrieveGovernedKnowledge|retrieveKnowledge|generateLocalEmbedding/);
    expect(source).not.toMatch(/\bOpenAI\b|\bAnthropic\b|\bOllama\b|INSERT INTO|UPDATE\s+\w+/i);
  });
});
