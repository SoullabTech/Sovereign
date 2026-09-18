/** @jest-environment node */

import {
  CORE_TEACHING_DOMAIN_REGISTRY,
  TEACHING_COMPOSITION_CONTRACT_VERSION,
  composeTeachingSequence,
  type TeachingCompositionInput,
} from '../TeachingCompositionContract';
import type { TeachingSourceRef } from '../TeachingContextSourceContract';

const writerPrimer: TeachingSourceRef = {
  sourceId: 'writer-primer',
  sourceClass: 'governed_library',
  standing: 'governed_reference',
  revisionOrLocator: 'sha:writer-1',
  citationAvailable: true,
};

function baseSteps() {
  return [
    { stepId: 's1', act: 'ORIENT' as const, claimClass: 'no_claim' as const, sourceIds: [], statementLayer: 'none' as const, learnerEvidenceIds: ['q1'] },
    { stepId: 's2', act: 'EXPLAIN' as const, claimClass: 'source_explanation' as const, sourceIds: ['writer-primer'], statementLayer: 'source' as const, learnerEvidenceIds: ['q1'] },
    { stepId: 's3', act: 'ILLUSTRATE' as const, claimClass: 'source_explanation' as const, sourceIds: ['writer-primer'], statementLayer: 'maia_paraphrase' as const, learnerEvidenceIds: ['q1'] },
    { stepId: 's4', act: 'INQUIRE' as const, claimClass: 'no_claim' as const, sourceIds: [], statementLayer: 'none' as const, learnerEvidenceIds: ['q1'] },
    { stepId: 's5', act: 'CHECK_UNDERSTANDING' as const, claimClass: 'no_claim' as const, sourceIds: [], statementLayer: 'none' as const, learnerEvidenceIds: ['q1'] },
  ];
}

function fixture(overrides: Partial<TeachingCompositionInput> = {}): TeachingCompositionInput {
  return {
    context: 'writers_studio',
    audience: 'writer',
    domain: { domainKey: 'writing_rhetoric', family: 'writing_and_rhetoric', t2Domain: 'writing_craft' },
    sources: [writerPrimer],
    learnerEvidence: [{ evidenceId: 'q1', kind: 'explicit_question', source: 'current_interaction' }],
    practiceFrame: 'manuscript_excerpt',
    authorityRequest: 'education',
    sourceSupport: 'sufficient',
    sourceHandling: 'teach_normally',
    steps: baseSteps(),
    ...overrides,
  };
}

describe('MAIA Teaching Intelligence T3 — Teaching Composition Contract', () => {
  it('pins tcomp-1 and remains fully non-executing', () => {
    const record = composeTeachingSequence(fixture());
    expect(TEACHING_COMPOSITION_CONTRACT_VERSION).toBe('tcomp-1');
    expect(record.authorityEffect).toBe('DESCRIPTIVE_COMPOSITION_ONLY');
    expect(record.executionStanding).toBe('NON_EXECUTING_PROPOSAL');
    expect(record.mayTeach).toBe(false);
    expect(record.mayExecute).toBe(false);
    expect(record.mayCallModel).toBe(false);
    expect(record.mayRetrieve).toBe(false);
    expect(record.mayBrowse).toBe(false);
    expect(record.mayMutatePrompt).toBe(false);
    expect(record.mayPersistLearnerState).toBe(false);
  });

  it('composes a bounded Writer Studio sequence through T1 and T2', () => {
    const record = composeTeachingSequence(fixture());
    expect(record.steps.map((step) => step.act)).toEqual([
      'ORIENT', 'EXPLAIN', 'ILLUSTRATE', 'INQUIRE', 'CHECK_UNDERSTANDING',
    ]);
    expect(record.steps.every((step) => step.t1.executionStanding === 'NON_EXECUTING_PROPOSAL')).toBe(true);
    expect(record.steps[1].t2?.context).toBe('writers_studio');
    expect(record.steps[1].epistemicStandings).toEqual(['governed_reference']);
  });

  it('bounds teaching sequences to at most eight acts', () => {
    const repeated = Array.from({ length: 9 }, (_, index) => ({
      stepId: 'x' + index,
      act: 'INQUIRE' as const,
      claimClass: 'no_claim' as const,
      sourceIds: [],
      statementLayer: 'none' as const,
      learnerEvidenceIds: [],
    }));
    expect(() => composeTeachingSequence(fixture({ steps: repeated }))).toThrow(/between 1 and 8/);
  });

  it('keeps one MAIA identity while changing room authority for coaching', () => {
    const record = composeTeachingSequence(fixture({
      context: 'coaching_practice',
      audience: 'coach',
      domain: { domainKey: 'coaching_practitioner_craft', family: 'coaching_and_practitioner_craft', t2Domain: 'coaching_models' },
      practiceFrame: 'coaching_scenario',
    }));
    expect(record.teacherIdentity).toBe('MAIA_SHARED_TEACHER');
    expect(record.context).toBe('coaching_practice');
    expect(record.mayDirectClientAction).toBe(false);
  });

  it('supports therapist/practitioner model teaching without clinical authority', () => {
    const record = composeTeachingSequence(fixture({
      context: 'therapist_practitioner',
      audience: 'therapist_practitioner',
      domain: { domainKey: 'psychology_psychotherapy_models', family: 'psychology_and_psychotherapy', t2Domain: 'psychotherapy_models' },
      practiceFrame: 'conceptual_case',
    }));
    expect(record.teacherIdentity).toBe('MAIA_SHARED_TEACHER');
    expect(record.mayDiagnose).toBe(false);
    expect(record.mayDirectTreatment).toBe(false);
  });

  it('registers the required initial teaching domains', () => {
    expect(Object.keys(CORE_TEACHING_DOMAIN_REGISTRY)).toEqual(expect.arrayContaining([
      'writing_rhetoric',
      'coaching_practitioner_craft',
      'psychology_psychotherapy_models',
      'philosophy',
      'spirituality_contemplative_traditions',
      'consciousness_studies',
      'systems_complexity',
      'relational_collective_intelligence',
      'soullab_canon',
      'soullab_research',
      'relational_geometry',
      'elemental_alchemy',
      'spiralogic',
      'ain',
      'maia_constitutional_architecture',
    ]));
  });

  it('keeps the domain vocabulary extensible beyond the initial registry', () => {
    const record = composeTeachingSequence(fixture({
      domain: { domainKey: 'ecological_psychology', family: 'psychology_and_psychotherapy', t2Domain: 'psychology' },
    }));
    expect(record.domain.domainKey).toBe('ecological_psychology');
  });

  it('does not allow a registered domain to spoof another T2 authority class', () => {
    expect(() => composeTeachingSequence(fixture({
      domain: { domainKey: 'relational_geometry', family: 'research', t2Domain: 'soullab_canon' },
    }))).toThrow(/must preserve its registered family and T2 domain/);
  });

  it('prevents a Soullab research hypothesis from becoming canon', () => {
    const research: TeachingSourceRef = {
      sourceId: 'rg-research',
      sourceClass: 'soullab_research',
      standing: 'research_hypothesis',
      revisionOrLocator: 'sha:rg',
      citationAvailable: true,
    };
    expect(() => composeTeachingSequence(fixture({
      context: 'research_lab',
      audience: 'researcher',
      domain: { domainKey: 'relational_geometry', family: 'research', t2Domain: 'relational_geometry' },
      practiceFrame: 'research_problem',
      sources: [research],
      steps: [{
        stepId: 'canon',
        act: 'EXPLAIN',
        claimClass: 'canonical_statement',
        sourceIds: ['rg-research'],
        statementLayer: 'source',
        learnerEvidenceIds: ['q1'],
      }],
    }))).toThrow(/canonical_statement requires canonical source standing/);
  });

  it('prevents spiritual or historical tradition from impersonating science', () => {
    const badTradition = {
      sourceId: 'tradition',
      sourceClass: 'external_historical_tradition',
      standing: 'scientific_reference',
      revisionOrLocator: 'edition:1',
      citationAvailable: true,
    } as unknown as TeachingSourceRef;
    expect(() => composeTeachingSequence(fixture({
      context: 'general_maia',
      audience: 'member',
      domain: { domainKey: 'spirituality_contemplative_traditions', family: 'spirituality_and_contemplation', t2Domain: 'spirituality' },
      practiceFrame: 'conceptual_education',
      sources: [badTradition],
      steps: [{
        stepId: 'science',
        act: 'EXPLAIN',
        claimClass: 'evidence_summary',
        sourceIds: ['tradition'],
        statementLayer: 'source',
        learnerEvidenceIds: ['q1'],
      }],
    }))).toThrow(/cannot claim standing scientific_reference/);
  });

  it('prevents general web material from becoming academic evidence', () => {
    const web: TeachingSourceRef = {
      sourceId: 'web',
      sourceClass: 'external_web_general',
      standing: 'current_web_reference',
      revisionOrLocator: 'https://example.test',
      citationAvailable: true,
    };
    expect(() => composeTeachingSequence(fixture({
      sources: [web],
      steps: [{
        stepId: 'evidence',
        act: 'EXPLAIN',
        claimClass: 'evidence_summary',
        sourceIds: ['web'],
        statementLayer: 'source',
        learnerEvidenceIds: ['q1'],
      }],
    }))).toThrow(/requires academic\/scientific standing/);
  });

  it('prevents MAIA synthesis from masquerading as sourced or canonical fact', () => {
    const canonA: TeachingSourceRef = {
      sourceId: 'canon-a',
      sourceClass: 'soullab_canon',
      standing: 'canonical',
      revisionOrLocator: 'sha:a',
      citationAvailable: true,
    };
    const canonB: TeachingSourceRef = { ...canonA, sourceId: 'canon-b', revisionOrLocator: 'sha:b' };
    expect(() => composeTeachingSequence(fixture({
      context: 'general_maia',
      audience: 'member',
      domain: { domainKey: 'soullab_canon', family: 'soullab', t2Domain: 'soullab_canon' },
      practiceFrame: 'conceptual_education',
      sources: [canonA, canonB],
      steps: [{
        stepId: 'synthesis',
        act: 'EXPLAIN',
        claimClass: 'canonical_statement',
        sourceIds: ['canon-a', 'canon-b'],
        statementLayer: 'maia_synthesis',
        learnerEvidenceIds: ['q1'],
      }],
    }))).toThrow(/MAIA synthesis/);
  });

  it('preserves distinct standings in comparative teaching', () => {
    const paper: TeachingSourceRef = {
      sourceId: 'paper',
      sourceClass: 'external_academic',
      standing: 'peer_reviewed_evidence',
      revisionOrLocator: 'doi:10.x',
      citationAvailable: true,
    };
    const tradition: TeachingSourceRef = {
      sourceId: 'tradition',
      sourceClass: 'external_historical_tradition',
      standing: 'historical_or_traditional',
      revisionOrLocator: 'edition:1',
      citationAvailable: true,
    };
    const record = composeTeachingSequence(fixture({
      context: 'therapist_practitioner',
      audience: 'therapist_practitioner',
      domain: { domainKey: 'psychology_psychotherapy_models', family: 'psychology_and_psychotherapy', t2Domain: 'psychotherapy_models' },
      practiceFrame: 'conceptual_education',
      sources: [paper, tradition],
      steps: [{
        stepId: 'compare',
        act: 'CONTRAST',
        claimClass: 'comparative_synthesis',
        sourceIds: ['paper', 'tradition'],
        statementLayer: 'maia_synthesis',
        learnerEvidenceIds: ['q1'],
      }],
    }));
    expect(record.steps[0].epistemicStandings).toEqual(['peer_reviewed_evidence', 'historical_or_traditional']);
    expect(record.steps[0].statementLayer).toBe('maia_synthesis');
  });

  it('rejects hidden learner profiling fields', () => {
    const bad = {
      ...fixture(),
      learnerProfile: { level: 'advanced', psychometrics: ['x'] },
    } as unknown as TeachingCompositionInput;
    expect(() => composeTeachingSequence(bad)).toThrow(/non-contract key: learnerProfile/);
  });

  it('accepts learner adaptation only from current-interaction evidence', () => {
    const bad = fixture({
      learnerEvidence: [{
        evidenceId: 'q1',
        kind: 'explicit_question',
        source: 'durable_profile' as unknown as 'current_interaction',
      }],
    });
    expect(() => composeTeachingSequence(bad)).toThrow(/source must be current_interaction/);

    const record = composeTeachingSequence(fixture());
    expect(record.adaptationStanding).toBe('CURRENT_INTERACTION_ONLY');
    expect(record.learnerClaims).toEqual([]);
    expect(record.mayPersistLearnerState).toBe(false);
  });

  it('requires present-interaction confusion evidence before repair', () => {
    expect(() => composeTeachingSequence(fixture({
      steps: [{
        stepId: 'repair',
        act: 'REPAIR_MISUNDERSTANDING',
        claimClass: 'source_explanation',
        sourceIds: ['writer-primer'],
        statementLayer: 'source',
        learnerEvidenceIds: ['q1'],
      }],
    }))).toThrow(/requires current-interaction confusion evidence/);

    expect(() => composeTeachingSequence(fixture({
      learnerEvidence: [{ evidenceId: 'confused', kind: 'explicit_confusion', source: 'current_interaction' }],
      steps: [{
        stepId: 'repair',
        act: 'REPAIR_MISUNDERSTANDING',
        claimClass: 'source_explanation',
        sourceIds: ['writer-primer'],
        statementLayer: 'source',
        learnerEvidenceIds: ['confused'],
      }],
    }))).not.toThrow();
  });

  it.each([
    'diagnosis',
    'treatment_direction',
    'client_action_direction',
    'autonomous_professional_action',
  ] as const)('refuses professional action authority: %s', (authorityRequest) => {
    expect(() => composeTeachingSequence(fixture({ authorityRequest }))).toThrow(/outside T3 teaching authority/);
  });

  it('preserves teaching from authorship even inside Writer Studio', () => {
    expect(() => composeTeachingSequence(fixture({ authorityRequest: 'authorship' }))).toThrow(/outside T3 teaching authority/);
    expect(composeTeachingSequence(fixture()).mayWriteManuscript).toBe(false);
  });

  it('requires explicit epistemic handling when sources are partial or contradictory', () => {
    expect(() => composeTeachingSequence(fixture({
      sourceSupport: 'partial',
      sourceHandling: 'teach_normally',
    }))).toThrow(/may not teach normally/);

    expect(() => composeTeachingSequence(fixture({
      sourceSupport: 'contradictory',
      sourceHandling: 'qualify_and_teach',
      steps: [{
        stepId: 'explain',
        act: 'EXPLAIN',
        claimClass: 'source_explanation',
        sourceIds: ['writer-primer'],
        statementLayer: 'source',
        learnerEvidenceIds: ['q1'],
      }],
    }))).toThrow(/requires an ORIENT act/);
  });

  it('refuses substantive teaching when source support is unsupported', () => {
    expect(() => composeTeachingSequence(fixture({
      sourceSupport: 'unsupported',
      sourceHandling: 'refrain',
      steps: [
        {
          stepId: 'explain',
          act: 'EXPLAIN',
          claimClass: 'source_explanation',
          sourceIds: ['writer-primer'],
          statementLayer: 'source',
          learnerEvidenceIds: ['q1'],
        },
        {
          stepId: 'stop',
          act: 'REFRAIN',
          claimClass: 'no_claim',
          sourceIds: [],
          statementLayer: 'none',
          learnerEvidenceIds: [],
        },
      ],
    }))).toThrow(/may not compose substantive teaching claims/);
  });

  it('can mark source seeking as required without opening retrieval authority', () => {
    const record = composeTeachingSequence(fixture({
      sourceSupport: 'partial',
      sourceHandling: 'source_seeking_required',
      steps: [
        { stepId: 'orient', act: 'ORIENT', claimClass: 'no_claim', sourceIds: [], statementLayer: 'none', learnerEvidenceIds: ['q1'] },
        { stepId: 'stop', act: 'REFRAIN', claimClass: 'no_claim', sourceIds: [], statementLayer: 'none', learnerEvidenceIds: [] },
      ],
    }));
    expect(record.sourceSeekingRequired).toBe(true);
    expect(record.mayRetrieve).toBe(false);
    expect(record.mayBrowse).toBe(false);
  });

  it('requires REFRAIN to be terminal', () => {
    expect(() => composeTeachingSequence(fixture({
      steps: [
        { stepId: 'stop', act: 'REFRAIN', claimClass: 'no_claim', sourceIds: [], statementLayer: 'none', learnerEvidenceIds: [] },
        { stepId: 'ask', act: 'INQUIRE', claimClass: 'no_claim', sourceIds: [], statementLayer: 'none', learnerEvidenceIds: [] },
      ],
    }))).toThrow(/REFRAIN must be terminal/);
  });

  it('rejects runtime/model/provider/prompt escape fields', () => {
    for (const key of ['model', 'provider', 'prompt', 'execute', 'persistLearnerState']) {
      const bad = { ...fixture(), [key]: true } as unknown as TeachingCompositionInput;
      expect(() => composeTeachingSequence(bad)).toThrow(new RegExp('non-contract key: ' + key));
    }
  });

  it('keeps explanation structurally separate from execution', () => {
    const record = composeTeachingSequence(fixture({
      steps: [{
        stepId: 'explain',
        act: 'EXPLAIN',
        claimClass: 'source_explanation',
        sourceIds: ['writer-primer'],
        statementLayer: 'maia_paraphrase',
        learnerEvidenceIds: ['q1'],
      }],
    }));
    expect(record.steps[0].t1.act).toBe('EXPLAIN');
    expect(record.steps[0].t1.mayExecute).toBe(false);
    expect(record.steps[0].executionStanding).toBe('NON_EXECUTING_PROPOSAL');
    expect(record.mayExecute).toBe(false);
  });
});
