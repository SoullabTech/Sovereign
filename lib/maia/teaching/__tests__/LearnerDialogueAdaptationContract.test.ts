/** @jest-environment node */

import {
  LEARNER_DIALOGUE_ADAPTATION_VERSION,
  proposeLearnerDialogueAdaptation,
  type LearnerDialogueAdaptationInput,
  type LearnerSignalInput,
} from '../LearnerDialogueAdaptationContract';
import {
  composeTeachingSequence,
  type TeachingCompositionInput,
} from '../TeachingCompositionContract';
import {
  planKnowledgeAcquisition,
  type KnowledgeAcquisitionPlan,
} from '../KnowledgeRetrievalOrchestrationContract';
import {
  assessEvidenceSet,
  type EvidenceSetAssessment,
} from '../ResearchCitationProvenanceContract';
import type { TeachingSourceRef } from '../TeachingContextSourceContract';

function composition() {
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
    learnerEvidence: [
      {
        evidenceId: 'q',
        kind: 'explicit_question',
        source: 'current_interaction',
      },
    ],
    practiceFrame: 'conceptual_education',
    authorityRequest: 'education',
    sourceSupport: 'sufficient',
    sourceHandling: 'teach_normally',
    steps: [{
      stepId: 'step-1',
      act: 'EXPLAIN',
      claimClass: 'evidence_summary',
      sourceIds: ['paper'],
      statementLayer: 'source',
      learnerEvidenceIds: ['q'],
    }],
  };
  return composeTeachingSequence(input);
}

function plan(): KnowledgeAcquisitionPlan {
  return planKnowledgeAcquisition({
    composition: composition(),
    needs: [{
      needId: 'need-1',
      stepId: 'step-1',
      requiredSourceClasses: ['external_scientific'],
      requiredStandings: ['scientific_reference'],
      freshnessRequirement: 'recent_scholarly',
      evidenceRoles: ['peer_reviewed_scientific'],
      minimumIndependentSources: 1,
      insufficiencyDisposition: 'qualify',
    }],
  });
}

function assessment(
  standing: EvidenceSetAssessment['standing'] = 'INSUFFICIENT_EVIDENCE',
): EvidenceSetAssessment {
  return {
    ...assessEvidenceSet(plan(), 'need-1', []),
    standing,
  };
}

function signal(
  kind: LearnerSignalInput['kind'],
  overrides: Partial<LearnerSignalInput> = {},
): LearnerSignalInput {
  return {
    signalId: 'signal-1',
    kind,
    evidence: {
      turnId: 'turn-7',
      locator: 'turn-7:chars-10-42',
      source: 'current_interaction',
    },
    teachingStepId: 'step-1',
    repairMismatch: null,
    ...overrides,
  };
}

function input(
  kind: LearnerSignalInput['kind'],
  overrides: Partial<LearnerDialogueAdaptationInput> = {},
  signalOverrides: Partial<LearnerSignalInput> = {},
): LearnerDialogueAdaptationInput {
  return {
    interactionId: 'interaction-1',
    composition: composition(),
    signal: signal(kind, signalOverrides),
    knowledgePlan: null,
    evidenceAssessment: null,
    ...overrides,
  };
}

describe('T6 Learner Dialogue & Adaptation', () => {
  it('pins lda-1 and fixes the non-executing authority boundary', () => {
    const r = proposeLearnerDialogueAdaptation(input('EXPLICIT_QUESTION'));
    expect(LEARNER_DIALOGUE_ADAPTATION_VERSION).toBe('lda-1');
    expect(r.authorityEffect).toBe('DESCRIPTIVE_DIALOGUE_ADAPTATION_ONLY');
    expect(r.executionStanding).toBe('NON_EXECUTING_PROPOSAL');
    expect(r.adaptationStanding).toBe('CURRENT_INTERACTION_ONLY');
    expect(r.mayTeach).toBe(false);
    expect(r.mayExecute).toBe(false);
    expect(r.mayCallModel).toBe(false);
    expect(r.mayRetrieve).toBe(false);
    expect(r.mayBrowse).toBe(false);
    expect(r.mayMutatePrompt).toBe(false);
    expect(r.mayPersistLearnerState).toBe(false);
    expect(r.mayReadDurableLearnerProfile).toBe(false);
    expect(r.mayWriteLearnerProfile).toBe(false);
    expect(r.mayInferStableTraits).toBe(false);
    expect(r.mayScoreLearner).toBe(false);
    expect(r.mayRankLearner).toBe(false);
    expect(r.mayDiagnose).toBe(false);
    expect(r.mayDirectTreatment).toBe(false);
    expect(r.mayDirectClientAction).toBe(false);
    expect(r.mayAutonomouslyAct).toBe(false);
  });

  it('binds current evidence, exact T3 step, and exact T1 act', () => {
    const r = proposeLearnerDialogueAdaptation(input('CLARIFICATION_REQUEST'));
    expect(r.interactionId).toBe('interaction-1');
    expect(r.signalId).toBe('signal-1');
    expect(r.evidence.source).toBe('current_interaction');
    expect(r.teachingStepId).toBe('step-1');
    expect(r.t1Act).toBe('EXPLAIN');
  });
  it('maps clarification, example, and contrast lawfully', () => {
    const clarification = proposeLearnerDialogueAdaptation(
      input('CLARIFICATION_REQUEST'),
    );
    expect(clarification.proposedT1NextActs).toEqual(['EXPLAIN', 'INQUIRE']);

    const example = proposeLearnerDialogueAdaptation(input('EXAMPLE_REQUEST'));
    expect(example.proposedT1NextActs).toEqual(['ILLUSTRATE']);

    const contrast = proposeLearnerDialogueAdaptation(input('CONTRAST_REQUEST'));
    expect(contrast.proposedT1NextActs).toEqual(['CONTRAST']);
  });
  it('simplification does not infer low intelligence', () => {
    const r = proposeLearnerDialogueAdaptation(
      input('SIMPLIFICATION_REQUEST'),
    );
    expect(r.proposedAdaptation.depth).toBe('simplify');
    expect(r.stableTraitInferences).toEqual([]);
    expect(r.reasons).toContain(
      'simplification_requested_without_trait_inference',
    );
  });

  it('depth request does not infer expertise', () => {
    const r = proposeLearnerDialogueAdaptation(input('DEPTH_REQUEST'));
    expect(r.proposedAdaptation.depth).toBe('deepen');
    expect(r.stableTraitInferences).toEqual([]);
    expect(r.reasons).toContain('depth_requested_without_expertise_inference');
  });
  it('confusion is not inability', () => {
    const r = proposeLearnerDialogueAdaptation(input('CONFUSION_EXPRESSED'));
    expect(r.understandingStanding).toBe('CONFUSION_EXPRESSED');
    expect(r.stableTraitInferences).toEqual([]);
    expect(r.learnerClaims).toEqual([]);
    expect(r.proposedT1NextActs).toContain('CHECK_UNDERSTANDING');
  });

  it('understanding expressed is not mastery', () => {
    const r = proposeLearnerDialogueAdaptation(
      input('UNDERSTANDING_EXPRESSED'),
    );
    expect(r.understandingStanding).toBe('UNDERSTANDING_EXPRESSED');
    expect(r.learnerClaims).toEqual([]);
    expect(r.durableLearnerProfile).toBeNull();
  });

  it('partial understanding remains current-interaction-only', () => {
    const r = proposeLearnerDialogueAdaptation(
      input('PARTIAL_UNDERSTANDING_EXPRESSED'),
    );
    expect(r.understandingStanding)
      .toBe('PARTIAL_UNDERSTANDING_EXPRESSED');
    expect(r.adaptationStanding).toBe('CURRENT_INTERACTION_ONLY');
  });
  it('restatement without specific mismatch cannot trigger repair', () => {
    const r = proposeLearnerDialogueAdaptation(input('RESTATEMENT_ATTEMPT'));
    expect(r.proposedT1NextActs).not.toContain('REPAIR_MISUNDERSTANDING');
    expect(r.blockedActs).toContainEqual({
      act: 'REPAIR_MISUNDERSTANDING',
      reason: 'no_specific_mismatch',
    });
  });

  it('traceable restatement mismatch may propose bounded repair', () => {
    const r = proposeLearnerDialogueAdaptation(input(
      'RESTATEMENT_ATTEMPT',
      {},
      {
        repairMismatch: {
          targetKind: 'definition',
          targetId: 'definition:projection',
          mismatchDescription: 'restatement reverses the defined relation',
        },
      },
    ));
    expect(r.understandingStanding).toBe('MISUNDERSTANDING_CANDIDATE');
    expect(r.proposedT1NextActs).toContain('REPAIR_MISUNDERSTANDING');
    expect(r.repairMismatch?.targetId).toBe('definition:projection');
  });
  it('disagreement is not misunderstanding', () => {
    const r = proposeLearnerDialogueAdaptation(
      input('CHALLENGE_OR_DISAGREEMENT'),
    );
    expect(r.understandingStanding).toBe('CONTESTED_OR_CHALLENGED');
    expect(r.proposedT1NextActs).not.toContain('REPAIR_MISUNDERSTANDING');
    expect(r.blockedActs).toContainEqual({
      act: 'REPAIR_MISUNDERSTANDING',
      reason: 'disagreement_is_not_misunderstanding',
    });
    expect(r.proposedAdaptation.dialogueMovements)
      .toContain('preserve_disagreement');
  });

  it('source challenge is not resistance', () => {
    const r = proposeLearnerDialogueAdaptation(
      input('SOURCE_OR_EVIDENCE_CHALLENGE'),
    );
    expect(r.proposedT1NextActs).not.toContain('REPAIR_MISUNDERSTANDING');
    expect(r.blockedActs).toContainEqual({
      act: 'REPAIR_MISUNDERSTANDING',
      reason: 'challenge_is_not_resistance',
    });
  });
  it('learner correction does not become learner failure', () => {
    const r = proposeLearnerDialogueAdaptation(input('TEACHER_CORRECTION'));
    expect(r.proposedT1NextActs).not.toContain('REPAIR_MISUNDERSTANDING');
    expect(r.reasons).toContain('learner_corrected_teacher');
    expect(r.blockedActs).toContainEqual({
      act: 'REPAIR_MISUNDERSTANDING',
      reason: 'teacher_correction_is_not_learner_failure',
    });
  });

  it('practice request proposes practice without executing it', () => {
    const r = proposeLearnerDialogueAdaptation(input('PRACTICE_REQUEST'));
    expect(r.proposedT1NextActs).toEqual(['OFFER_PRACTICE']);
    expect(r.mayTeach).toBe(false);
  });

  it('practice decline blocks pressure', () => {
    const r = proposeLearnerDialogueAdaptation(input('PRACTICE_DECLINE'));
    expect(r.proposedT1NextActs).toEqual(['REFRAIN']);
    expect(r.blockedActs).toContainEqual({
      act: 'OFFER_PRACTICE',
      reason: 'practice_declined',
    });
  });
  it('stop or topic change yields REFRAIN only', () => {
    const r = proposeLearnerDialogueAdaptation(
      input('STOP_OR_TOPIC_CHANGE'),
    );
    expect(r.proposedT1NextActs).toEqual(['REFRAIN']);
    expect(r.blockedActs.some((entry) => entry.act === 'EXPLAIN'))
      .toBe(true);
    expect(r.blockedActs.some((entry) => entry.act === 'OFFER_PRACTICE'))
      .toBe(true);
  });

  it('preserves T5 insufficient evidence', () => {
    const r = proposeLearnerDialogueAdaptation(
      input('SOURCE_OR_EVIDENCE_CHALLENGE', {
        knowledgePlan: plan(),
        evidenceAssessment: assessment('INSUFFICIENT_EVIDENCE'),
      }),
    );
    expect(r.epistemicConstraint?.standing).toBe('INSUFFICIENT_EVIDENCE');
    expect(r.epistemicConstraintPreserved).toBe(true);
    expect(r.reasons).toContain('epistemic_insufficiency_preserved');
    expect(r.proposedT1NextActs).not.toContain('REPAIR_MISUNDERSTANDING');
  });
  it('preserves T5 conflicting evidence', () => {
    const r = proposeLearnerDialogueAdaptation(
      input('CHALLENGE_OR_DISAGREEMENT', {
        knowledgePlan: plan(),
        evidenceAssessment: assessment('CONFLICTING_EVIDENCE'),
      }),
    );
    expect(r.epistemicConstraint?.standing).toBe('CONFLICTING_EVIDENCE');
    expect(r.reasons).toContain('epistemic_conflict_preserved');
    expect(r.proposedT1NextActs).not.toContain('REPAIR_MISUNDERSTANDING');
  });
  it('preserves T5 no-consensus standing', () => {
    const r = proposeLearnerDialogueAdaptation(
      input('SOURCE_OR_EVIDENCE_CHALLENGE', {
        knowledgePlan: plan(),
        evidenceAssessment: assessment('NO_CONSENSUS_EVIDENCE'),
      }),
    );
    expect(r.epistemicConstraint?.standing).toBe('NO_CONSENSUS_EVIDENCE');
    expect(r.reasons).toContain('epistemic_no_consensus_preserved');
  });

  it('requires T4 and T5 constraints together', () => {
    expect(() => proposeLearnerDialogueAdaptation(
      input('EXPLICIT_QUESTION', { knowledgePlan: plan() }),
    )).toThrow(/must be supplied together/);
    expect(() => proposeLearnerDialogueAdaptation(
      input('EXPLICIT_QUESTION', {
        evidenceAssessment: assessment(),
      }),
    )).toThrow(/must be supplied together/);
  });
  it('requires epistemic constraint to bind to the same teaching step', () => {
    const p = plan();
    const forged = {
      ...p,
      knowledgeNeeds: p.knowledgeNeeds.map((need) => ({
        ...need,
        stepId: 'other-step',
      })),
    } as KnowledgeAcquisitionPlan;
    expect(() => proposeLearnerDialogueAdaptation(
      input('SOURCE_OR_EVIDENCE_CHALLENGE', {
        knowledgePlan: forged,
        evidenceAssessment: assessment(),
      }),
    )).toThrow(/does not bind to the signal teaching step/);
  });

  it('rejects unknown teaching step identity', () => {
    expect(() => proposeLearnerDialogueAdaptation(
      input('CLARIFICATION_REQUEST', {}, {
        teachingStepId: 'missing-step',
      }),
    )).toThrow(/does not exist in composition/);
  });
  it('rejects evidence outside the current interaction', () => {
    const bad = input('EXPLICIT_QUESTION') as any;
    bad.signal.evidence.source = 'durable_memory';
    expect(() => proposeLearnerDialogueAdaptation(bad))
      .toThrow(/current_interaction/);
  });

  it('rejects repair mismatch attached to disagreement', () => {
    expect(() => proposeLearnerDialogueAdaptation(
      input('CHALLENGE_OR_DISAGREEMENT', {}, {
        repairMismatch: {
          targetKind: 'proposition',
          targetId: 'claim-1',
          mismatchDescription: 'forged mismatch',
        },
      }),
    )).toThrow(/only valid for RESTATEMENT_ATTEMPT/);
  });

  it('supports stop without a teaching step when no epistemic binding exists', () => {
    const r = proposeLearnerDialogueAdaptation(
      input('STOP_OR_TOPIC_CHANGE', {}, { teachingStepId: null }),
    );
    expect(r.teachingStepId).toBeNull();
    expect(r.t1Act).toBeNull();
  });
  it('rejects covert learner-profile fields', () => {
    for (const key of [
      'profile',
      'learnerProfile',
      'intelligence',
      'expertise',
      'learningStyle',
      'mastery',
    ]) {
      const bad = {
        ...input('EXPLICIT_QUESTION'),
        [key]: 'forbidden',
      } as any;
      expect(() => proposeLearnerDialogueAdaptation(bad))
        .toThrow(new RegExp('non-contract key: ' + key));
    }
  });

  it('rejects persistence, embedding, scoring, and ranking fields', () => {
    for (const key of ['persist', 'memoryWrite', 'embedding', 'score', 'rank']) {
      const bad = { ...input('EXPLICIT_QUESTION'), [key]: true } as any;
      expect(() => proposeLearnerDialogueAdaptation(bad))
        .toThrow(new RegExp('non-contract key: ' + key));
    }
  });
  it('rejects model, provider, prompt, retrieval, browse, and execute fields', () => {
    for (const key of [
      'model',
      'provider',
      'prompt',
      'retrieve',
      'browse',
      'execute',
    ]) {
      const bad = { ...input('EXPLICIT_QUESTION'), [key]: true } as any;
      expect(() => proposeLearnerDialogueAdaptation(bad))
        .toThrow(new RegExp('non-contract key: ' + key));
    }
  });

  it('rejects diagnosis, treatment, and client-action fields', () => {
    for (const key of [
      'diagnosis',
      'treatment',
      'clientAction',
      'professionalAction',
    ]) {
      const bad = { ...input('CONFUSION_EXPRESSED'), [key]: true } as any;
      expect(() => proposeLearnerDialogueAdaptation(bad))
        .toThrow(new RegExp('non-contract key: ' + key));
    }
  });
  it('rejects durable learner-profile composition standing', () => {
    const badComposition = {
      ...composition(),
      adaptationStanding: 'DURABLE_PROFILE',
    } as any;
    expect(() => proposeLearnerDialogueAdaptation(
      input('EXPLICIT_QUESTION', { composition: badComposition }),
    )).toThrow(/CURRENT_INTERACTION_ONLY/);
  });

  it('rejects compositions that already carry learner claims', () => {
    const badComposition = {
      ...composition(),
      learnerClaims: ['expert'],
    } as any;
    expect(() => proposeLearnerDialogueAdaptation(
      input('EXPLICIT_QUESTION', { composition: badComposition }),
    )).toThrow(/learnerClaims must remain empty/);
  });

  it('keeps teaching repair distinct from treatment authority', () => {
    const r = proposeLearnerDialogueAdaptation(
      input('RESTATEMENT_ATTEMPT', {}, {
        repairMismatch: {
          targetKind: 'model',
          targetId: 'model:cbt',
          mismatchDescription: 'restatement substitutes a different model claim',
        },
      }),
    );
    expect(r.proposedT1NextActs).toContain('REPAIR_MISUNDERSTANDING');
    expect(r.mayDiagnose).toBe(false);
    expect(r.mayDirectTreatment).toBe(false);
    expect(r.mayDirectClientAction).toBe(false);
  });

  it('never creates durable competence or learning-style claims', () => {
    const understood = proposeLearnerDialogueAdaptation(
      input('UNDERSTANDING_EXPRESSED'),
    );
    const simplified = proposeLearnerDialogueAdaptation(
      input('SIMPLIFICATION_REQUEST'),
    );
    expect(understood.stableTraitInferences).toEqual([]);
    expect(understood.durableLearnerProfile).toBeNull();
    expect(simplified.stableTraitInferences).toEqual([]);
    expect(simplified.durableLearnerProfile).toBeNull();
  });
});
