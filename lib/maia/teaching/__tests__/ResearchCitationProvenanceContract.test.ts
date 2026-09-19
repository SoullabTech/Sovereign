/** @jest-environment node */

import {
  RESEARCH_CITATION_PROVENANCE_VERSION,
  assessEvidenceSet,
  buildTeachingEvidenceRecord,
  type TeachingEvidenceInput,
} from '../ResearchCitationProvenanceContract';
import {
  planKnowledgeAcquisition,
  type KnowledgeAcquisitionPlan,
  type KnowledgeNeedInput,
} from '../KnowledgeRetrievalOrchestrationContract';
import {
  composeTeachingSequence,
  type TeachingCompositionInput,
} from '../TeachingCompositionContract';
import type { TeachingSourceRef } from '../TeachingContextSourceContract';

function scientificComposition() {
  const source: TeachingSourceRef = {
    sourceId: 'paper',
    sourceClass: 'external_scientific',
    standing: 'scientific_reference',
    revisionOrLocator: 'doi:10.1000/example',
    citationAvailable: true,
  };
  const input: TeachingCompositionInput = {
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
      stepId: 'science-step',
      act: 'EXPLAIN',
      claimClass: 'evidence_summary',
      sourceIds: ['paper'],
      statementLayer: 'source',
      learnerEvidenceIds: ['q'],
    }],
  };
  return composeTeachingSequence(input);
}

function scientificNeed(overrides: Partial<KnowledgeNeedInput> = {}): KnowledgeNeedInput {
  return {
    needId: 'need-science',
    stepId: 'science-step',
    requiredSourceClasses: ['external_scientific'],
    requiredStandings: ['scientific_reference'],
    freshnessRequirement: 'recent_scholarly',
    evidenceRoles: ['peer_reviewed_scientific'],
    minimumIndependentSources: 1,
    insufficiencyDisposition: 'qualify',
    ...overrides,
  };
}

function scientificPlan(need = scientificNeed()): KnowledgeAcquisitionPlan {
  return planKnowledgeAcquisition({
    composition: scientificComposition(),
    needs: [need],
  });
}

function webComposition() {
  const source: TeachingSourceRef = {
    sourceId: 'web-source',
    sourceClass: 'external_web_general',
    standing: 'current_web_reference',
    revisionOrLocator: 'https://example.test/current',
    citationAvailable: true,
  };
  return composeTeachingSequence({
    context: 'general_maia',
    audience: 'member',
    domain: {
      domainKey: 'consciousness_studies',
      family: 'consciousness',
      t2Domain: 'consciousness_studies',
    },
    sources: [source],
    learnerEvidence: [{ evidenceId: 'q', kind: 'explicit_question', source: 'current_interaction' }],
    practiceFrame: 'conceptual_education',
    authorityRequest: 'education',
    sourceSupport: 'sufficient',
    sourceHandling: 'teach_normally',
    steps: [{
      stepId: 'web-step',
      act: 'EXPLAIN',
      claimClass: 'source_explanation',
      sourceIds: ['web-source'],
      statementLayer: 'source',
      learnerEvidenceIds: ['q'],
    }],
  });
}

function webPlan(): KnowledgeAcquisitionPlan {
  return planKnowledgeAcquisition({
    composition: webComposition(),
    needs: [{
      needId: 'need-web',
      stepId: 'web-step',
      requiredSourceClasses: ['external_web_general'],
      requiredStandings: ['current_web_reference'],
      freshnessRequirement: 'current_web',
      evidenceRoles: ['current_web'],
      minimumIndependentSources: 1,
      insufficiencyDisposition: 'qualify',
    }],
  });
}

function practitionerComposition() {
  const source: TeachingSourceRef = {
    sourceId: 'practitioner',
    sourceClass: 'practitioner_material',
    standing: 'practitioner_authored',
    revisionOrLocator: 'practitioner:method',
    citationAvailable: false,
  };
  return composeTeachingSequence({
    context: 'coaching_practice',
    audience: 'coach',
    domain: {
      domainKey: 'coaching_practitioner_craft',
      family: 'coaching_and_practitioner_craft',
      t2Domain: 'coaching_models',
    },
    sources: [source],
    learnerEvidence: [{ evidenceId: 'q', kind: 'explicit_question', source: 'current_interaction' }],
    practiceFrame: 'conceptual_education',
    authorityRequest: 'education',
    sourceSupport: 'sufficient',
    sourceHandling: 'teach_normally',
    steps: [{
      stepId: 'practice-step',
      act: 'EXPLAIN',
      claimClass: 'source_explanation',
      sourceIds: ['practitioner'],
      statementLayer: 'source',
      learnerEvidenceIds: ['q'],
    }],
  });
}

function practitionerPlan(): KnowledgeAcquisitionPlan {
  return planKnowledgeAcquisition({
    composition: practitionerComposition(),
    needs: [{
      needId: 'need-practice',
      stepId: 'practice-step',
      requiredSourceClasses: ['practitioner_material'],
      requiredStandings: ['practitioner_authored'],
      freshnessRequirement: 'durable',
      evidenceRoles: ['primary_source'],
      minimumIndependentSources: 1,
      insufficiencyDisposition: 'qualify',
    }],
  });
}

function scientificEvidence(overrides: Partial<TeachingEvidenceInput> = {}): TeachingEvidenceInput {
  return {
    evidenceId: 'e1',
    knowledgeNeedId: 'need-science',
    sourceRequestId: 'need-science:external_scientific',
    sourceClass: 'external_scientific',
    standing: 'scientific_reference',
    sourceForm: 'primary_study',
    evidenceRoles: ['peer_reviewed_scientific'],
    source: {
      sourceId: 'doi:10.1000/example',
      title: 'A controlled study',
      authorshipKey: 'authors:alpha',
      authors: ['A. Author', 'B. Author'],
      institutionOrPublisher: 'Journal of Examples',
      publicationOrRevisionDate: '2026-06-01',
      revision: null,
      edition: null,
      canonicalSha: null,
      doi: '10.1000/example',
      stableLocator: 'https://doi.org/10.1000/example',
      governedFilePath: null,
      governedChecksum: null,
      accessedAt: '2026-09-18T20:00:00Z',
      underlyingSourceKey: 'study:10.1000/example',
      independentlyReopenable: true,
    },
    citation: {
      citationPresent: true,
      stableCitationLocator: 'https://doi.org/10.1000/example',
      pinpointLocator: null,
      renderableCitation: 'Author A, Author B. A controlled study. 2026.',
      citedSourceSupportsClaim: true,
    },
    provenance: {
      acquisitionAdapterClass: 'scientific_source_adapter',
      authorityRequirement: 'external_provenance_authority',
      authorityProof: 'authority:external-scientific',
      custodyProof: 'custody:doi:10.1000/example',
      transformations: ['extraction', 'paraphrase'],
      expressionStanding: 'source_faithful_paraphrase',
      peerReviewed: true,
      reliabilityStanding: 'verified_for_claim',
    },
    freshnessStanding: 'recent_scholarly',
    claimRelation: 'SUPPORTS',
    ...overrides,
  };
}

function webEvidence(overrides: Partial<TeachingEvidenceInput> = {}): TeachingEvidenceInput {
  return {
    evidenceId: 'web-e1',
    knowledgeNeedId: 'need-web',
    sourceRequestId: 'need-web:external_web_general',
    sourceClass: 'external_web_general',
    standing: 'current_web_reference',
    sourceForm: 'web_reference',
    evidenceRoles: ['current_web'],
    source: {
      sourceId: 'web-source',
      title: 'Current source',
      authorshipKey: 'institution:example',
      authors: [],
      institutionOrPublisher: 'Example Institute',
      publicationOrRevisionDate: '2026-09-18',
      revision: null,
      edition: null,
      canonicalSha: null,
      doi: null,
      stableLocator: 'https://example.test/current',
      governedFilePath: null,
      governedChecksum: null,
      accessedAt: '2026-09-18T20:00:00Z',
      underlyingSourceKey: 'web:https://example.test/current',
      independentlyReopenable: true,
    },
    citation: {
      citationPresent: true,
      stableCitationLocator: 'https://example.test/current',
      pinpointLocator: null,
      renderableCitation: 'Example Institute, Current source, 2026.',
      citedSourceSupportsClaim: true,
    },
    provenance: {
      acquisitionAdapterClass: 'current_web_adapter',
      authorityRequirement: 'current_web_provenance_authority',
      authorityProof: 'authority:web',
      custodyProof: 'custody:web',
      transformations: ['extraction', 'paraphrase'],
      expressionStanding: 'source_faithful_paraphrase',
      peerReviewed: false,
      reliabilityStanding: 'verified_for_claim',
    },
    freshnessStanding: 'current_web',
    claimRelation: 'SUPPORTS',
    ...overrides,
  };
}

function practitionerEvidence(overrides: Partial<TeachingEvidenceInput> = {}): TeachingEvidenceInput {
  return {
    evidenceId: 'practice-e1',
    knowledgeNeedId: 'need-practice',
    sourceRequestId: 'need-practice:practitioner_material',
    sourceClass: 'practitioner_material',
    standing: 'practitioner_authored',
    sourceForm: 'practitioner_authored',
    evidenceRoles: ['primary_source'],
    source: {
      sourceId: 'practitioner',
      title: 'Practitioner method note',
      authorshipKey: 'author:practitioner',
      authors: ['Practitioner'],
      institutionOrPublisher: null,
      publicationOrRevisionDate: null,
      revision: null,
      edition: null,
      canonicalSha: null,
      doi: null,
      stableLocator: null,
      governedFilePath: null,
      governedChecksum: null,
      accessedAt: null,
      underlyingSourceKey: 'practice:note-1',
      independentlyReopenable: false,
    },
    citation: {
      citationPresent: false,
      stableCitationLocator: null,
      pinpointLocator: null,
      renderableCitation: null,
      citedSourceSupportsClaim: false,
    },
    provenance: {
      acquisitionAdapterClass: 'practitioner_scoped_material',
      authorityRequirement: 'practitioner_scope_authority',
      authorityProof: null,
      custodyProof: null,
      transformations: ['extraction', 'paraphrase'],
      expressionStanding: 'source_faithful_paraphrase',
      peerReviewed: false,
      reliabilityStanding: 'unknown',
    },
    freshnessStanding: 'durable',
    claimRelation: 'INSUFFICIENT_TO_DETERMINE',
    ...overrides,
  };
}

describe('MAIA Teaching Intelligence T5 — Research, Citation & Provenance Contract', () => {
  it('pins rcp-1 and remains fully non-executing', () => {
    const r = buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence());
    expect(RESEARCH_CITATION_PROVENANCE_VERSION).toBe('rcp-1');
    expect(r.authorityEffect).toBe('DESCRIPTIVE_PROVENANCE_RECORD_ONLY');
    expect(r.executionStanding).toBe('NON_EXECUTING_PROPOSAL');
    expect(r.mayRetrieve).toBe(false);
    expect(r.mayBrowse).toBe(false);
    expect(r.mayDownloadSource).toBe(false);
    expect(r.mayCallModel).toBe(false);
    expect(r.mayTeach).toBe(false);
    expect(r.mayExecute).toBe(false);
    expect(r.mayMutatePrompt).toBe(false);
    expect(r.mayPersistLearnerState).toBe(false);
  });

  it('binds evidence to exact T4 need, exact request, and exact T3 step', () => {
    const r = buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence());
    expect(r.knowledgeNeedId).toBe('need-science');
    expect(r.sourceRequestId).toBe('need-science:external_scientific');
    expect(r.teachingStepId).toBe('science-step');
    expect(r.claimClass).toBe('evidence_summary');
  });

  it('rejects unknown knowledge needs and source requests', () => {
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({ knowledgeNeedId: 'missing' })))
      .toThrow(/knowledge need does not exist/);
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({ sourceRequestId: 'missing' })))
      .toThrow(/source request does not exist/);
  });

  it('rejects request/need cross-binding and source-class substitution', () => {
    const plan = scientificPlan();
    const forged = {
      ...plan,
      sourceRequests: [{ ...plan.sourceRequests[0], knowledgeNeedId: 'other' }],
    } as KnowledgeAcquisitionPlan;
    expect(() => buildTeachingEvidenceRecord(forged, scientificEvidence()))
      .toThrow(/not bound to this knowledge need/);
    expect(() => buildTeachingEvidenceRecord(plan, scientificEvidence({
      sourceClass: 'external_academic',
      standing: 'peer_reviewed_evidence',
      sourceForm: 'secondary_scholarship',
    }))).toThrow(/source class does not match exact T4 source request/);
  });

  it('rejects standing, adapter, and authority substitution', () => {
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      standing: 'peer_reviewed_evidence',
    }))).toThrow(/does not satisfy exact T4 source request/);
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      provenance: {
        ...scientificEvidence().provenance,
        acquisitionAdapterClass: 'academic_source_adapter',
      },
    }))).toThrow(/adapter does not match/);
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      provenance: {
        ...scientificEvidence().provenance,
        authorityRequirement: 'current_web_provenance_authority',
      },
    }))).toThrow(/authority requirement does not match/);
  });

  it('rejects URL-only provenance for current web material', () => {
    const bad = webEvidence({
      source: {
        ...webEvidence().source,
        authors: [],
        institutionOrPublisher: null,
      },
    });
    expect(() => buildTeachingEvidenceRecord(webPlan(), bad))
      .toThrow(/requires stable locator, access date, and author or institution/);
  });

  it('keeps a fresh web source distinct from a reliable source', () => {
    const r = buildTeachingEvidenceRecord(webPlan(), webEvidence({
      provenance: {
        ...webEvidence().provenance,
        reliabilityStanding: 'unknown',
      },
    }));
    expect(r.freshnessMeetsRequirement).toBe(true);
    expect(r.eligibleForLaterTeachingConsideration).toBe(false);
  });

  it('keeps old evidence historical rather than current', () => {
    const r = buildTeachingEvidenceRecord(webPlan(), webEvidence({
      freshnessStanding: 'stale',
    }));
    expect(r.freshnessMeetsRequirement).toBe(false);
    expect(r.eligibleForLaterTeachingConsideration).toBe(false);
  });

  it('does not treat author identity as authority', () => {
    const r = buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      provenance: {
        ...scientificEvidence().provenance,
        authorityProof: null,
        custodyProof: null,
      },
    }));
    expect(r.source.authors.length).toBeGreaterThan(0);
    expect(r.eligibleForLaterTeachingConsideration).toBe(false);
  });

  it('distinguishes auditable, partially auditable, and unauditable evidence', () => {
    const auditable = buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence());
    expect(auditable.auditability).toBe('auditable');

    const partial = buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      source: { ...scientificEvidence().source, independentlyReopenable: false },
      provenance: { ...scientificEvidence().provenance, authorityProof: null, custodyProof: null },
    }));
    expect(partial.auditability).toBe('partially_auditable');

    const unauditable = buildTeachingEvidenceRecord(practitionerPlan(), practitionerEvidence());
    expect(unauditable.auditability).toBe('unauditable');
    expect(unauditable.eligibleForLaterTeachingConsideration).toBe(false);
  });

  it('requires citation when T2/T4 requires it', () => {
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      citation: {
        citationPresent: false,
        stableCitationLocator: null,
        pinpointLocator: null,
        renderableCitation: null,
        citedSourceSupportsClaim: false,
      },
    }))).toThrow(/requires a citation/);
  });

  it('requires stable citation locator and renderable citation when citation is present', () => {
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      citation: {
        ...scientificEvidence().citation,
        stableCitationLocator: null,
      },
    }))).toThrow(/stable locator and renderable citation/);
  });

  it('preserves CITATION PRESENT ≠ CLAIM SUPPORTED', () => {
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      citation: {
        ...scientificEvidence().citation,
        citedSourceSupportsClaim: false,
      },
    }))).toThrow(/citation present is not equivalent to claim support/);
  });

  it('does not let topically related neutral evidence become support', () => {
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      claimRelation: 'NEUTRAL',
      citation: {
        ...scientificEvidence().citation,
        citedSourceSupportsClaim: true,
      },
    }))).toThrow(/citation cannot claim support/);

    const r = buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      claimRelation: 'NEUTRAL',
      citation: {
        ...scientificEvidence().citation,
        citedSourceSupportsClaim: false,
      },
    }));
    expect(r.eligibleForLaterTeachingConsideration).toBe(false);
  });

  it('requires exact quotation citation and pinpoint locator', () => {
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      provenance: {
        ...scientificEvidence().provenance,
        transformations: ['extraction'],
        expressionStanding: 'exact_quotation',
      },
      citation: {
        ...scientificEvidence().citation,
        pinpointLocator: null,
      },
    }))).toThrow(/quotation requires a present citation and pinpoint locator/);
  });

  it('rejects transformed prose masquerading as exact quotation', () => {
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      provenance: {
        ...scientificEvidence().provenance,
        transformations: ['extraction', 'paraphrase'],
        expressionStanding: 'exact_quotation',
      },
      citation: {
        ...scientificEvidence().citation,
        pinpointLocator: 'p. 4',
      },
    }))).toThrow(/exact quotation may not contain semantic transformation/);
  });

  it('requires paraphrase transformations to remain explicit', () => {
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      provenance: {
        ...scientificEvidence().provenance,
        transformations: ['extraction'],
        expressionStanding: 'source_faithful_paraphrase',
      },
    }))).toThrow(/must disclose paraphrase transformation/);
  });

  it('requires MAIA paraphrase to disclose model assistance', () => {
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      provenance: {
        ...scientificEvidence().provenance,
        transformations: ['paraphrase'],
        expressionStanding: 'maia_paraphrase',
      },
    }))).toThrow(/paraphrase \+ model-assisted transformation/);
  });

  it('prevents MAIA synthesis from impersonating source support', () => {
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      provenance: {
        ...scientificEvidence().provenance,
        transformations: ['summarization', 'model_assisted_transformation'],
        expressionStanding: 'maia_synthesis',
      },
    }))).toThrow(/may not independently serve as source support/);
  });

  it('can represent MAIA synthesis visibly without treating it as source evidence', () => {
    const r = buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence({
      claimRelation: 'NEUTRAL',
      citation: {
        ...scientificEvidence().citation,
        citedSourceSupportsClaim: false,
      },
      provenance: {
        ...scientificEvidence().provenance,
        transformations: ['summarization', 'model_assisted_transformation'],
        expressionStanding: 'maia_synthesis',
      },
    }));
    expect(r.sourceEvidenceStanding).toBe('NON_SOURCE_SYNTHESIS');
    expect(r.eligibleForLaterTeachingConsideration).toBe(false);
  });

  it('never transfers source authority to transformed output', () => {
    const r = buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence());
    expect(r.provenance.transformations.length).toBeGreaterThan(0);
    expect(r.provenance.sourceAuthorityInheritedByTransformation).toBe(false);
  });

  it('does not infer consensus from peer review or a primary study', () => {
    const r = buildTeachingEvidenceRecord(scientificPlan(), scientificEvidence());
    expect(r.provenance.peerReviewed).toBe(true);
    expect(r.sourceForm).toBe('primary_study');
    expect(r.consensusCapableSourceForm).toBe(false);
    expect(r.consensusEvidenceStanding).toBe('not_claimed');
  });

  it('rejects primary study relabeled as consensus evidence', () => {
    expect(() => buildTeachingEvidenceRecord(scientificPlan(scientificNeed({
      evidenceRoles: ['peer_reviewed_scientific', 'consensus_review'],
    })), scientificEvidence({
      evidenceRoles: ['peer_reviewed_scientific', 'consensus_review'],
    }))).toThrow(/consensus_review role requires consensus-capable source form/);
  });

  it('allows a systematic review to carry consensus-review standing without making consensus automatic', () => {
    const plan = scientificPlan(scientificNeed({
      evidenceRoles: ['peer_reviewed_scientific', 'consensus_review'],
    }));
    const r = buildTeachingEvidenceRecord(plan, scientificEvidence({
      sourceForm: 'systematic_review',
      evidenceRoles: ['peer_reviewed_scientific', 'consensus_review'],
    }));
    expect(r.consensusCapableSourceForm).toBe(true);
    expect(r.consensusEvidenceStanding).toBe('supports_consensus_claim');
  });

  it('rejects web reference impersonating peer-reviewed evidence', () => {
    expect(() => buildTeachingEvidenceRecord(webPlan(), webEvidence({
      provenance: {
        ...webEvidence().provenance,
        peerReviewed: true,
      },
    }))).toThrow(/web reference may not claim peer-reviewed standing/);
  });

  it('treats multiple chunks from one underlying source as one independent source', () => {
    const plan = scientificPlan(scientificNeed({ minimumIndependentSources: 2 }));
    const a = buildTeachingEvidenceRecord(plan, scientificEvidence({ evidenceId: 'a' }));
    const b = buildTeachingEvidenceRecord(plan, scientificEvidence({
      evidenceId: 'b',
      source: {
        ...scientificEvidence().source,
        sourceId: 'chunk-2',
      },
    }));
    const assessment = assessEvidenceSet(plan, 'need-science', [a, b]);
    expect(assessment.independentSourceCount).toBe(1);
    expect(assessment.standing).toBe('PARTIAL_SUPPORT');
  });

  it('treats mirrored or syndicated copies as one underlying source', () => {
    const plan = scientificPlan(scientificNeed({ minimumIndependentSources: 2 }));
    const a = buildTeachingEvidenceRecord(plan, scientificEvidence({ evidenceId: 'a' }));
    const b = buildTeachingEvidenceRecord(plan, scientificEvidence({
      evidenceId: 'b',
      source: {
        ...scientificEvidence().source,
        sourceId: 'mirror',
        stableLocator: 'https://mirror.test/study',
        authorshipKey: 'mirror-publisher',
        underlyingSourceKey: 'study:10.1000/example',
      },
    }));
    const assessment = assessEvidenceSet(plan, 'need-science', [a, b]);
    expect(assessment.independentSourceCount).toBe(1);
    expect(assessment.standing).toBe('PARTIAL_SUPPORT');
  });

  it('requires distinct underlying sources and authorship for independent corroboration', () => {
    const plan = scientificPlan(scientificNeed({ minimumIndependentSources: 2 }));
    const a = buildTeachingEvidenceRecord(plan, scientificEvidence({ evidenceId: 'a' }));
    const b = buildTeachingEvidenceRecord(plan, scientificEvidence({
      evidenceId: 'b',
      source: {
        ...scientificEvidence().source,
        sourceId: 'study-2',
        doi: '10.1000/other',
        stableLocator: 'https://doi.org/10.1000/other',
        authorshipKey: 'authors:beta',
        authors: ['C. Author'],
        underlyingSourceKey: 'study:10.1000/other',
      },
      citation: {
        ...scientificEvidence().citation,
        stableCitationLocator: 'https://doi.org/10.1000/other',
        renderableCitation: 'C. Author. Another study. 2026.',
      },
    }));
    const assessment = assessEvidenceSet(plan, 'need-science', [a, b]);
    expect(assessment.independentSourceCount).toBe(2);
    expect(assessment.independentAuthorshipCount).toBe(2);
    expect(assessment.standing).toBe('CONSISTENT_SUPPORT');
  });

  it('does not infer consensus from multiple ordinary studies', () => {
    const plan = scientificPlan(scientificNeed({
      evidenceRoles: ['peer_reviewed_scientific', 'consensus_review'],
      minimumIndependentSources: 2,
    }));
    const a = buildTeachingEvidenceRecord(plan, scientificEvidence({ evidenceId: 'a' }));
    const b = buildTeachingEvidenceRecord(plan, scientificEvidence({
      evidenceId: 'b',
      source: {
        ...scientificEvidence().source,
        sourceId: 'study-2',
        doi: '10.1000/other',
        stableLocator: 'https://doi.org/10.1000/other',
        authorshipKey: 'authors:beta',
        authors: ['C. Author'],
        underlyingSourceKey: 'study:10.1000/other',
      },
      citation: {
        ...scientificEvidence().citation,
        stableCitationLocator: 'https://doi.org/10.1000/other',
        renderableCitation: 'C. Author. Another study. 2026.',
      },
    }));
    const assessment = assessEvidenceSet(plan, 'need-science', [a, b]);
    expect(assessment.hasConsensusCapableEvidence).toBe(false);
    expect(assessment.standing).toBe('NO_CONSENSUS_EVIDENCE');
  });

  it('recognizes explicit consensus-capable evidence only when it supports the exact claim', () => {
    const plan = scientificPlan(scientificNeed({
      evidenceRoles: ['peer_reviewed_scientific', 'consensus_review'],
    }));
    const review = buildTeachingEvidenceRecord(plan, scientificEvidence({
      sourceForm: 'systematic_review',
      evidenceRoles: ['peer_reviewed_scientific', 'consensus_review'],
    }));
    const assessment = assessEvidenceSet(plan, 'need-science', [review]);
    expect(assessment.hasConsensusCapableEvidence).toBe(true);
    expect(assessment.standing).toBe('CONSENSUS_EVIDENCE_PRESENT');
  });

  it('preserves research disagreement instead of averaging it into consensus', () => {
    const plan = scientificPlan();
    const support = buildTeachingEvidenceRecord(plan, scientificEvidence({ evidenceId: 'support' }));
    const contradict = buildTeachingEvidenceRecord(plan, scientificEvidence({
      evidenceId: 'contradict',
      claimRelation: 'CONTRADICTS',
      citation: {
        ...scientificEvidence().citation,
        citedSourceSupportsClaim: false,
      },
    }));
    const assessment = assessEvidenceSet(plan, 'need-science', [support, contradict]);
    expect(assessment.standing).toBe('CONFLICTING_EVIDENCE');
    expect(assessment.preservedConflict).toBe(true);
    expect(assessment.supportingIds).toEqual(['support']);
    expect(assessment.contradictingIds).toEqual(['contradict']);
  });

  it('keeps evidence-set assessment non-teaching and non-executing', () => {
    const plan = scientificPlan();
    const record = buildTeachingEvidenceRecord(plan, scientificEvidence());
    const assessment = assessEvidenceSet(plan, 'need-science', [record]);
    expect(assessment.mayTeach).toBe(false);
    expect(assessment.mayExecute).toBe(false);
  });

  it('rejects retrieval metadata as scholarly provenance', () => {
    const bad = {
      ...scientificEvidence(),
      retrievalSignals: {
        similarity: 0.999,
        retrievalCount: 1000,
      },
    } as unknown as TeachingEvidenceInput;
    expect(() => buildTeachingEvidenceRecord(scientificPlan(), bad))
      .toThrow(/non-contract key: retrievalSignals/);
  });

  it('rejects prompt/provider/runtime escape fields', () => {
    for (const key of ['provider', 'model', 'prompt', 'browse', 'retrieve', 'download', 'execute']) {
      const bad = { ...scientificEvidence(), [key]: true } as unknown as TeachingEvidenceInput;
      expect(() => buildTeachingEvidenceRecord(scientificPlan(), bad))
        .toThrow(new RegExp('non-contract key: ' + key));
    }
  });
});
