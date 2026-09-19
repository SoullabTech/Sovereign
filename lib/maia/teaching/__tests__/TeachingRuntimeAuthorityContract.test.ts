import { authorizeTeachingRuntime } from '../TeachingRuntimeAuthorityContract';
import { composeTeachingSequence } from '../TeachingCompositionContract';
import { proposeLearnerDialogueAdaptation } from '../LearnerDialogueAdaptationContract';
import { resolveTeachingPlatformBinding } from '../TeachingPlatformBindingContract';

function fixture() {
  const binding = resolveTeachingPlatformBinding({
    surface: 'general_maia',
    route: 'sovereign_maia_list',
    context: 'general_maia',
    audience: 'member',
    domainKey: 'relational_geometry',
  });
  const composition = composeTeachingSequence({
    context: binding.context,
    audience: binding.audience,
    domain: binding.domain,
    sources: [],
    learnerEvidence: [{ evidenceId: 'e1', kind: 'explicit_question', source: 'current_interaction' }],
    practiceFrame: 'conceptual_education',
    authorityRequest: 'education',
    sourceSupport: 'sufficient',
    sourceHandling: 'teach_normally',
    steps: [{
      stepId: 's1', act: 'INQUIRE', claimClass: 'no_claim',
      sourceIds: [], statementLayer: 'none', learnerEvidenceIds: ['e1'],
    }],
  });  const adaptation = proposeLearnerDialogueAdaptation({
    interactionId: 'i1',
    composition,
    signal: {
      signalId: 'sig1',
      kind: 'EXPLICIT_QUESTION',
      evidence: { turnId: 't1', locator: 'current_user_message', source: 'current_interaction' },
      teachingStepId: 's1',
      repairMismatch: null,
    },
    knowledgePlan: null,
    evidenceAssessment: null,
  });
  return { binding, composition, adaptation };
}

describe('T8 Runtime Teaching Authority', () => {
  it('authorizes only the current turn through the existing model seam', () => {
    const f = fixture();
    const r = authorizeTeachingRuntime({
      interactionId: 'i1', ...f, knowledgeStanding: 'NO_SOURCE_REQUIRED',
    });
    expect(r.runtimeStanding).toBe('CURRENT_TURN_ONLY');
    expect(r.executionStanding).toBe('AUTHORIZED_CURRENT_TURN');
    expect(r.mayCallExistingModelSeam).toBe(true);
    expect(r.mayRenderTeachingDirective).toBe(true);
    expect(r.mayTeach).toBe(true);
  });  it('does not widen learner or professional authority', () => {
    const f = fixture();
    const r = authorizeTeachingRuntime({
      interactionId: 'i1', ...f, knowledgeStanding: 'NO_SOURCE_REQUIRED',
    });
    expect(r.learnerClaims).toEqual([]);
    expect(r.mayPersistLearnerState).toBe(false);
    expect(r.mayReadDurableLearnerProfile).toBe(false);
    expect(r.mayWriteLearnerProfile).toBe(false);
    expect(r.mayScoreLearner).toBe(false);
    expect(r.mayRankLearner).toBe(false);
    expect(r.mayWriteManuscript).toBe(false);
    expect(r.mayDiagnose).toBe(false);
    expect(r.mayDirectTreatment).toBe(false);
    expect(r.mayDirectClientAction).toBe(false);
    expect(r.mayAutonomouslyAct).toBe(false);
  });

  it('does not create browsing, source-acquisition, or routing authority', () => {
    const f = fixture();
    const r = authorizeTeachingRuntime({
      interactionId: 'i1', ...f, knowledgeStanding: 'MAIA_SYNTHESIS_UNVERIFIED',
    });
    expect(r.mayBrowse).toBe(false);
    expect(r.mayAcquireExternalSources).toBe(false);
    expect(r.mayChangeModelRouting).toBe(false);
    expect(r.mayUseGovernedRetrievalResult).toBe(false);
  });  it('may use an already-governed source result without acquiring one', () => {
    const f = fixture();
    const r = authorizeTeachingRuntime({
      interactionId: 'i1', ...f, knowledgeStanding: 'GOVERNED_SOURCE',
    });
    expect(r.mayUseGovernedRetrievalResult).toBe(true);
    expect(r.mayAcquireExternalSources).toBe(false);
    expect(r.mayBrowse).toBe(false);
  });

  it('rejects a mismatched interaction', () => {
    const f = fixture();
    expect(() => authorizeTeachingRuntime({
      interactionId: 'other', ...f, knowledgeStanding: 'NO_SOURCE_REQUIRED',
    })).toThrow(/interaction mismatch/);
  });

  it('rejects durable learner standing', () => {
    const f = fixture();
    expect(() => authorizeTeachingRuntime({
      interactionId: 'i1',
      binding: f.binding,
      composition: f.composition,
      adaptation: { ...f.adaptation, adaptationStanding: 'DURABLE' } as any,
      knowledgeStanding: 'NO_SOURCE_REQUIRED',
    })).toThrow(/learner standing widened/);
  });  it('rejects learner/profile claims', () => {
    const f = fixture();
    expect(() => authorizeTeachingRuntime({
      interactionId: 'i1',
      binding: f.binding,
      composition: f.composition,
      adaptation: { ...f.adaptation, learnerClaims: ['expert'] } as any,
      knowledgeStanding: 'NO_SOURCE_REQUIRED',
    })).toThrow(/learner\/profile claims/);
  });

  it('rejects a T7/T3 domain mismatch', () => {
    const f = fixture();
    expect(() => authorizeTeachingRuntime({
      interactionId: 'i1',
      binding: { ...f.binding, domain: { ...f.binding.domain, domainKey: 'philosophy' } } as any,
      composition: f.composition,
      adaptation: f.adaptation,
      knowledgeStanding: 'NO_SOURCE_REQUIRED',
    })).toThrow(/domain mismatch/);
  });

  it('rejects invalid knowledge standing', () => {
    const f = fixture();
    expect(() => authorizeTeachingRuntime({
      interactionId: 'i1', ...f, knowledgeStanding: 'TRUST_ME' as any,
    })).toThrow(/knowledge standing is invalid/);
  });
});