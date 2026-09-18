/** @jest-environment node */

import {
  KNOWLEDGE_RETRIEVAL_ORCHESTRATION_VERSION,
  evaluateKnowledgeSatisfaction,
  planKnowledgeAcquisition,
  type KnowledgeEvidenceCandidate,
  type KnowledgeNeedInput,
  type KnowledgeOrchestrationInput,
} from '../KnowledgeRetrievalOrchestrationContract';
import {
  composeTeachingSequence,
  type TeachingCompositionInput,
  type TeachingCompositionRecord,
} from '../TeachingCompositionContract';
import type { TeachingSourceRef } from '../TeachingContextSourceContract';

const writerPrimer: TeachingSourceRef = {
  sourceId: 'writer-primer',
  sourceClass: 'governed_library',
  standing: 'governed_reference',
  revisionOrLocator: 'sha:writer-1',
  citationAvailable: true,
};

function writerComposition(): TeachingCompositionRecord {
  const input: TeachingCompositionInput = {
    context: 'writers_studio',
    audience: 'writer',
    domain: { domainKey: 'writing_rhetoric', family: 'writing_and_rhetoric', t2Domain: 'writing_craft' },
    sources: [writerPrimer],
    learnerEvidence: [{ evidenceId: 'q1', kind: 'explicit_question', source: 'current_interaction' }],
    practiceFrame: 'manuscript_excerpt',
    authorityRequest: 'education',
    sourceSupport: 'sufficient',
    sourceHandling: 'teach_normally',
    steps: [{
      stepId: 'explain',
      act: 'EXPLAIN',
      claimClass: 'source_explanation',
      sourceIds: ['writer-primer'],
      statementLayer: 'source',
      learnerEvidenceIds: ['q1'],
    }],
  };
  return composeTeachingSequence(input);
}

function scientificComposition(): TeachingCompositionRecord {
  const source: TeachingSourceRef = {
    sourceId: 'paper',
    sourceClass: 'external_scientific',
    standing: 'scientific_reference',
    revisionOrLocator: 'doi:paper',
    citationAvailable: true,
  };
  return composeTeachingSequence({
    context: 'therapist_practitioner',
    audience: 'therapist_practitioner',
    domain: {
      domainKey: 'psychology_psychotherapy_models',
      family: 'psychology_and_psychotherapy',
      t2Domain: 'psychotherapy_models',
    },
    sources: [source],
    learnerEvidence: [{ evidenceId: 'q', kind: 'explicit_question', source: 'current_interaction' }],
    practiceFrame: 'conceptual_education',
    authorityRequest: 'education',
    sourceSupport: 'sufficient',
    sourceHandling: 'teach_normally',
    steps: [{
      stepId: 'evidence-step',
      act: 'EXPLAIN',
      claimClass: 'evidence_summary',
      sourceIds: ['paper'],
      statementLayer: 'source',
      learnerEvidenceIds: ['q'],
    }],
  });
}

function canonicalComposition(): TeachingCompositionRecord {
  const source: TeachingSourceRef = {
    sourceId: 'canon',
    sourceClass: 'soullab_canon',
    standing: 'canonical',
    revisionOrLocator: 'sha:canon',
    citationAvailable: true,
  };
  return composeTeachingSequence({
    context: 'general_maia',
    audience: 'member',
    domain: { domainKey: 'soullab_canon', family: 'soullab', t2Domain: 'soullab_canon' },
    sources: [source],
    learnerEvidence: [{ evidenceId: 'q', kind: 'explicit_question', source: 'current_interaction' }],
    practiceFrame: 'conceptual_education',
    authorityRequest: 'education',
    sourceSupport: 'sufficient',
    sourceHandling: 'teach_normally',
    steps: [{
      stepId: 'canon-step',
      act: 'EXPLAIN',
      claimClass: 'canonical_statement',
      sourceIds: ['canon'],
      statementLayer: 'source',
      learnerEvidenceIds: ['q'],
    }],
  });
}

function comparativeComposition(): TeachingCompositionRecord {
  const paper: TeachingSourceRef = {
    sourceId: 'paper',
    sourceClass: 'external_scientific',
    standing: 'scientific_reference',
    revisionOrLocator: 'doi:paper',
    citationAvailable: true,
  };
  const tradition: TeachingSourceRef = {
    sourceId: 'tradition',
    sourceClass: 'external_historical_tradition',
    standing: 'historical_or_traditional',
    revisionOrLocator: 'edition:1',
    citationAvailable: true,
  };
  return composeTeachingSequence({
    context: 'therapist_practitioner',
    audience: 'therapist_practitioner',
    domain: {
      domainKey: 'psychology_psychotherapy_models',
      family: 'psychology_and_psychotherapy',
      t2Domain: 'psychotherapy_models',
    },
    sources: [paper, tradition],
    learnerEvidence: [{ evidenceId: 'q', kind: 'requested_comparison', source: 'current_interaction' }],
    practiceFrame: 'conceptual_education',
    authorityRequest: 'education',
    sourceSupport: 'sufficient',
    sourceHandling: 'teach_normally',
    steps: [{
      stepId: 'compare-step',
      act: 'CONTRAST',
      claimClass: 'comparative_synthesis',
      sourceIds: ['paper', 'tradition'],
      statementLayer: 'maia_synthesis',
      learnerEvidenceIds: ['q'],
    }],
  });
}

function writerNeed(overrides: Partial<KnowledgeNeedInput> = {}): KnowledgeNeedInput {
  return {
    needId: 'need-writer',
    stepId: 'explain',
    requiredSourceClasses: ['governed_library'],
    requiredStandings: ['governed_reference'],
    freshnessRequirement: 'current_revision',
    evidenceRoles: ['secondary_source'],
    minimumIndependentSources: 1,
    insufficiencyDisposition: 'source_seeking_required',
    ...overrides,
  };
}

function scientificNeed(overrides: Partial<KnowledgeNeedInput> = {}): KnowledgeNeedInput {
  return {
    needId: 'need-science',
    stepId: 'evidence-step',
    requiredSourceClasses: ['external_scientific', 'external_academic'],
    requiredStandings: ['scientific_reference', 'peer_reviewed_evidence'],
    freshnessRequirement: 'recent_scholarly',
    evidenceRoles: ['peer_reviewed_scientific'],
    minimumIndependentSources: 1,
    insufficiencyDisposition: 'qualify',
    ...overrides,
  };
}

function plan(composition = writerComposition(), need = writerNeed()) {
  return planKnowledgeAcquisition({ composition, needs: [need] });
}

function evidence(overrides: Partial<KnowledgeEvidenceCandidate> = {}): KnowledgeEvidenceCandidate {
  return {
    evidenceId: 'e1',
    knowledgeNeedId: 'need-writer',
    sourceId: 'writer-primer',
    sourceClass: 'governed_library',
    standing: 'governed_reference',
    sourceForm: 'governed_reference',
    authorshipKey: 'soullab:writer-primer',
    revisionOrLocator: 'sha:writer-1',
    citationAvailable: true,
    freshnessStanding: 'current_revision',
    authorityStanding: 'authorized',
    representationStanding: 'appropriate',
    support: 'supports',
    evidenceRoles: ['secondary_source'],
    retrievalSignals: {
      stored: true,
      indexed: true,
      embedded: true,
      retrievable: true,
      retrieved: true,
      similarity: 0.91,
      domainMatch: true,
      categoryMatch: true,
      retrievalCount: 1,
      legacyRetrievalService: false,
    },
    ...overrides,
  };
}

function scientificEvidence(overrides: Partial<KnowledgeEvidenceCandidate> = {}): KnowledgeEvidenceCandidate {
  return evidence({
    evidenceId: 'science-1',
    knowledgeNeedId: 'need-science',
    sourceId: 'doi:study',
    sourceClass: 'external_scientific',
    standing: 'scientific_reference',
    sourceForm: 'primary_study',
    authorshipKey: 'authors:a',
    revisionOrLocator: 'doi:study',
    freshnessStanding: 'recent_scholarly',
    evidenceRoles: ['peer_reviewed_scientific'],
    ...overrides,
  });
}

describe('MAIA Teaching Intelligence T4 — Knowledge & Retrieval Orchestration Contract', () => {
  it('pins kro-1 and keeps every execution authority closed', () => {
    const p = plan();
    expect(KNOWLEDGE_RETRIEVAL_ORCHESTRATION_VERSION).toBe('kro-1');
    expect(p.authorityEffect).toBe('DESCRIPTIVE_ACQUISITION_PLAN_ONLY');
    expect(p.executionStanding).toBe('NON_EXECUTING_PROPOSAL');
    for (const key of [
      'mayRetrieve', 'mayBrowse', 'mayCallModel', 'mayTeach', 'mayExecute', 'mayMutatePrompt',
      'mayPersistLearnerState', 'mayWriteManuscript', 'mayDiagnose', 'mayDirectTreatment',
      'mayDirectClientAction', 'mayAutonomouslyAct',
    ] as const) expect(p[key]).toBe(false);
  });

  it('binds a knowledge need to the exact T3 claim and derived context', () => {
    expect(plan().knowledgeNeeds[0]).toMatchObject({
      needId: 'need-writer',
      stepId: 'explain',
      teachingContext: 'writers_studio',
      teachingDomainKey: 'writing_rhetoric',
      teachingDomain: 'writing_craft',
      claimClass: 'source_explanation',
      freshnessRequirement: 'current_revision',
    });
  });

  it('requires exactly one need per substantive T3 claim', () => {
    expect(() => planKnowledgeAcquisition({ composition: writerComposition(), needs: [] }))
      .toThrow(/exactly one knowledge need/);
  });

  it('rejects a need bound to a T3 no-claim sequence', () => {
    const composition = composeTeachingSequence({
      context: 'general_maia',
      audience: 'member',
      domain: { domainKey: 'soullab_canon', family: 'soullab', t2Domain: 'soullab_canon' },
      sources: [],
      learnerEvidence: [{ evidenceId: 'q', kind: 'explicit_question', source: 'current_interaction' }],
      practiceFrame: 'conceptual_education',
      authorityRequest: 'education',
      sourceSupport: 'unsupported',
      sourceHandling: 'source_seeking_required',
      steps: [{ stepId: 'ask', act: 'INQUIRE', claimClass: 'no_claim', sourceIds: [], statementLayer: 'none', learnerEvidenceIds: ['q'] }],
    });
    expect(() => planKnowledgeAcquisition({ composition, needs: [{ ...writerNeed(), stepId: 'ask' }] }))
      .toThrow(/exactly one knowledge need|substantive T3 step/);
  });

  it('excludes MAIA synthesis as a retrieval source or standing', () => {
    expect(() => plan(writerComposition(), {
      ...writerNeed(),
      requiredSourceClasses: ['maia_synthesis'] as never,
    })).toThrow(/invalid or non-retrievable/);
    expect(() => plan(writerComposition(), {
      ...writerNeed(),
      requiredStandings: ['maia_synthesis'],
    })).toThrow(/invalid or MAIA synthesis/);
  });

  it('requires canonical standing for canonical claims', () => {
    expect(() => plan(canonicalComposition(), {
      needId: 'need-canon',
      stepId: 'canon-step',
      requiredSourceClasses: ['soullab_research'],
      requiredStandings: ['research_hypothesis'],
      freshnessRequirement: 'current_revision',
      evidenceRoles: ['primary_source'],
      minimumIndependentSources: 1,
      insufficiencyDisposition: 'refrain',
    })).toThrow(/canonical_statement requires canonical standing/);
  });

  it('prevents tradition from satisfying scientific evidence', () => {
    expect(() => plan(scientificComposition(), {
      ...scientificNeed(),
      requiredSourceClasses: ['external_historical_tradition'],
      requiredStandings: ['historical_or_traditional'],
      freshnessRequirement: 'durable',
      evidenceRoles: ['historical_traditional'],
    })).toThrow(/evidence_summary requires academic\/scientific standing/);
  });

  it('prevents general web from satisfying academic evidence', () => {
    expect(() => plan(scientificComposition(), {
      ...scientificNeed(),
      requiredSourceClasses: ['external_web_general'],
      requiredStandings: ['current_web_reference'],
      freshnessRequirement: 'current_web',
      evidenceRoles: ['current_web'],
    })).toThrow(/evidence_summary requires academic\/scientific standing/);
  });

  it('enforces scholarly and current-web freshness route compatibility', () => {
    expect(() => plan(writerComposition(), writerNeed({ freshnessRequirement: 'recent_scholarly' })))
      .toThrow(/recent_scholarly/);
    expect(() => plan(writerComposition(), writerNeed({ freshnessRequirement: 'current_web' })))
      .toThrow(/current_web freshness requires external_web_general/);
  });

  it('maps governed Library to the existing path+checksum authority seam', () => {
    expect(plan().sourceRequests[0]).toMatchObject({
      retrievalAdapterClass: 'governed_library_path_checksum',
      authorityRequirement: 'global_library_path_checksum_authority',
    });
  });

  it('maps practitioner material to scoped authority without clinical authority', () => {
    const p = plan(writerComposition(), writerNeed({
      requiredSourceClasses: ['practitioner_material'],
      requiredStandings: ['practitioner_authored'],
    }));
    expect(p.sourceRequests[0]).toMatchObject({
      retrievalAdapterClass: 'practitioner_scoped_material',
      authorityRequirement: 'practitioner_scope_authority',
    });
    expect(p.mayDiagnose).toBe(false);
    expect(p.mayDirectTreatment).toBe(false);
  });

  it('preserves the existing governed retrieval law', () => {
    expect(plan().governingLaws).toContain(
      'AUTHORIZED_NE_INGESTED_NE_RETRIEVABLE_NE_RETRIEVED_NE_APPROPRIATE_TO_REPRESENT',
    );
  });

  it.each([
    ['storage/index/embed', { authorityStanding: 'unknown', representationStanding: 'unknown' }],
    ['retrieved alone', { authorityStanding: 'unknown', representationStanding: 'unknown' }],
    ['blocked authority', { authorityStanding: 'blocked' }],
  ] as const)('%s does not become satisfied', (_label, overrides) => {
    const result = evaluateKnowledgeSatisfaction(plan(), [evidence({
      ...overrides,
      retrievalSignals: {
        stored: true,
        indexed: true,
        embedded: true,
        retrievable: true,
        retrieved: true,
        similarity: 1,
        domainMatch: true,
        categoryMatch: true,
        retrievalCount: 9999,
        legacyRetrievalService: false,
      },
    })]);
    expect(result[0].state).not.toBe('SATISFIED');
  });

  it('high similarity, matching metadata, and retrieval frequency confer no authority', () => {
    expect(evaluateKnowledgeSatisfaction(plan(), [evidence({
      authorityStanding: 'blocked',
      retrievalSignals: {
        stored: true, indexed: true, embedded: true, retrievable: true, retrieved: true,
        similarity: 1, domainMatch: true, categoryMatch: true, retrievalCount: 10000,
        legacyRetrievalService: false,
      },
    })])[0].state).toBe('AUTHORITY_BLOCKED');
  });

  it('legacy RetrievalService availability cannot satisfy a T4 need', () => {
    const result = evaluateKnowledgeSatisfaction(plan(), [evidence({
      retrievalSignals: {
        stored: true, indexed: true, embedded: true, retrievable: true, retrieved: true,
        similarity: 0.999, domainMatch: true, categoryMatch: true, retrievalCount: 20,
        legacyRetrievalService: true,
      },
    })]);
    expect(result[0].state).toBe('AUTHORITY_BLOCKED');
    expect(result[0].reasons.join(' ')).toMatch(/legacy RetrievalService/);
  });

  it('authorized appropriate evidence can satisfy a bounded need', () => {
    expect(evaluateKnowledgeSatisfaction(plan(), [evidence()])[0].state).toBe('SATISFIED');
  });

  it('distinguishes stale, unavailable, insufficient, and contradictory evidence', () => {
    expect(evaluateKnowledgeSatisfaction(plan(), [evidence({ freshnessStanding: 'stale' })])[0].state)
      .toBe('FRESHNESS_BLOCKED');
    expect(evaluateKnowledgeSatisfaction(plan(), [])[0].state).toBe('UNAVAILABLE');
    expect(evaluateKnowledgeSatisfaction(plan(), [evidence({
      sourceClass: 'external_web_general',
      standing: 'current_web_reference',
      sourceForm: 'web_reference',
      freshnessStanding: 'current_web',
      evidenceRoles: ['current_web'],
    })])[0].state).toBe('INSUFFICIENT');
    expect(evaluateKnowledgeSatisfaction(plan(), [evidence({ support: 'contradicts' })])[0].state)
      .toBe('CONTRADICTORY');
  });

  it('requires citation/provenance when T2 requires it', () => {
    const p = plan(scientificComposition(), scientificNeed());
    expect(p.knowledgeNeeds[0].citationRequired).toBe(true);
    expect(evaluateKnowledgeSatisfaction(p, [scientificEvidence({ citationAvailable: false })])[0].state)
      .toBe('INSUFFICIENT');
  });

  it('requires independent authorship for multi-source corroboration', () => {
    const p = plan(writerComposition(), writerNeed({
      minimumIndependentSources: 2,
      evidenceRoles: ['secondary_source', 'independent_corroboration'],
    }));
    const sameA = evidence({ evidenceId: 'a', authorshipKey: 'same', evidenceRoles: ['secondary_source', 'independent_corroboration'] });
    const sameB = evidence({ evidenceId: 'b', sourceId: 'writer-2', authorshipKey: 'same', evidenceRoles: ['secondary_source', 'independent_corroboration'] });
    expect(evaluateKnowledgeSatisfaction(p, [sameA, sameB])[0].state).toBe('PARTIALLY_SUPPORTED');
    const independentB = { ...sameB, authorshipKey: 'different' };
    expect(evaluateKnowledgeSatisfaction(p, [sameA, independentB])[0].state).toBe('SATISFIED');
  });

  it('requires at least two independent sources for comparative synthesis', () => {
    expect(() => plan(comparativeComposition(), {
      needId: 'need-compare',
      stepId: 'compare-step',
      requiredSourceClasses: ['external_scientific', 'external_historical_tradition'],
      requiredStandings: ['scientific_reference', 'historical_or_traditional'],
      freshnessRequirement: 'durable',
      evidenceRoles: ['peer_reviewed_scientific', 'historical_traditional'],
      minimumIndependentSources: 1,
      insufficiencyDisposition: 'qualify',
    })).toThrow(/at least two independent sources/);
  });

  it('preserves co-presence as distinct from corroboration', () => {
    const p = plan(comparativeComposition(), {
      needId: 'need-compare',
      stepId: 'compare-step',
      requiredSourceClasses: ['external_scientific', 'external_historical_tradition'],
      requiredStandings: ['scientific_reference', 'historical_or_traditional'],
      freshnessRequirement: 'durable',
      evidenceRoles: ['peer_reviewed_scientific', 'historical_traditional', 'independent_corroboration'],
      minimumIndependentSources: 2,
      insufficiencyDisposition: 'qualify',
    });
    expect(p.governingLaws).toContain('CO_PRESENCE_NE_CORROBORATION');
  });

  it('does not infer scientific consensus from one primary study', () => {
    const p = plan(scientificComposition(), scientificNeed({
      evidenceRoles: ['peer_reviewed_scientific', 'consensus_review'],
    }));
    const result = evaluateKnowledgeSatisfaction(p, [scientificEvidence()]);
    expect(result[0].state).toBe('PARTIALLY_SUPPORTED');
    expect(result[0].reasons.join(' ')).toMatch(/consensus_review/);
  });

  it('does not infer scientific consensus from multiple ordinary studies', () => {
    const p = plan(scientificComposition(), scientificNeed({
      evidenceRoles: ['peer_reviewed_scientific', 'consensus_review'],
      minimumIndependentSources: 2,
    }));
    const a = scientificEvidence({ evidenceId: 'a', authorshipKey: 'a' });
    const b = scientificEvidence({ evidenceId: 'b', sourceId: 'doi:b', authorshipKey: 'b' });
    expect(evaluateKnowledgeSatisfaction(p, [a, b])[0].state).toBe('PARTIALLY_SUPPORTED');
    expect(p.governingLaws).toContain('MULTIPLE_RETRIEVED_SOURCES_NE_CONSENSUS');
  });

  it('rejects relabeling a primary study as consensus evidence', () => {
    const p = plan(scientificComposition(), scientificNeed({
      evidenceRoles: ['peer_reviewed_scientific', 'consensus_review'],
    }));
    expect(() => evaluateKnowledgeSatisfaction(p, [scientificEvidence({
      evidenceRoles: ['peer_reviewed_scientific', 'consensus_review'],
      sourceForm: 'primary_study',
    })])).toThrow(/consensus_review requires a review/);
  });

  it('allows an explicit systematic review to satisfy a consensus-review need', () => {
    const p = plan(scientificComposition(), scientificNeed({
      evidenceRoles: ['peer_reviewed_scientific', 'consensus_review'],
    }));
    expect(evaluateKnowledgeSatisfaction(p, [scientificEvidence({
      sourceForm: 'systematic_review',
      evidenceRoles: ['peer_reviewed_scientific', 'consensus_review'],
    })])[0].state).toBe('SATISFIED');
  });

  it('keeps MAIA synthesis outside acquisition even for comparative synthesis', () => {
    const p = plan(comparativeComposition(), {
      needId: 'need-compare',
      stepId: 'compare-step',
      requiredSourceClasses: ['external_scientific', 'external_historical_tradition'],
      requiredStandings: ['scientific_reference', 'historical_or_traditional'],
      freshnessRequirement: 'durable',
      evidenceRoles: ['peer_reviewed_scientific', 'historical_traditional'],
      minimumIndependentSources: 2,
      insufficiencyDisposition: 'qualify',
    });
    expect(p.knowledgeNeeds[0].statementLayer).toBe('maia_synthesis');
    expect(p.sourceRequests.map((r) => r.requestedSourceClass)).not.toContain('maia_synthesis' as never);
  });

  it('creates requests without executing retrieval, browsing, model calls, or teaching', () => {
    const p = plan();
    expect(p.sourceRequests.length).toBeGreaterThan(0);
    expect([p.mayRetrieve, p.mayBrowse, p.mayCallModel, p.mayTeach, p.mayExecute]).toEqual([
      false, false, false, false, false,
    ]);
  });

  it('rejects provider/query/prompt/runtime escape fields', () => {
    for (const key of ['model', 'provider', 'queryText', 'prompt', 'execute', 'browse', 'persistLearnerState']) {
      const bad = { composition: writerComposition(), needs: [writerNeed()], [key]: true } as unknown as KnowledgeOrchestrationInput;
      expect(() => planKnowledgeAcquisition(bad)).toThrow(new RegExp('non-contract key: ' + key));
    }
  });

  it('rejects a forged T3 record that opens retrieval authority', () => {
    const forged = { ...writerComposition(), mayRetrieve: true } as unknown as TeachingCompositionRecord;
    expect(() => planKnowledgeAcquisition({ composition: forged, needs: [writerNeed()] }))
      .toThrow(/preserve T3 false authority flag: mayRetrieve/);
  });

  it('preserves the bounded insufficiency disposition back to T3', () => {
    for (const disposition of ['qualify', 'inquire', 'source_seeking_required', 'refrain'] as const) {
      const p = plan(writerComposition(), writerNeed({ insufficiencyDisposition: disposition }));
      const result = evaluateKnowledgeSatisfaction(p, [])[0];
      expect(result.state).toBe('UNAVAILABLE');
      expect(result.insufficiencyDisposition).toBe(disposition);
    }
  });
});
