/**
 * MAIA-TEACHING-INTELLIGENCE-01 / T8 — Runtime Teaching Authority (tra-1).
 *
 * T8 is the first contract that may authorize an already-adjudicated teaching
 * sequence to participate in the current model turn. It does not create a new
 * pedagogy; it only opens a bounded execution membrane around T1–T7.
 */
import type { TeachingCompositionRecord } from './TeachingCompositionContract';
import type { LearnerDialogueAdaptationRecord } from './LearnerDialogueAdaptationContract';
import type { TeachingPlatformBindingRecord } from './TeachingPlatformBindingContract';

export const TEACHING_RUNTIME_AUTHORITY_VERSION = 'tra-1' as const;

export const RUNTIME_KNOWLEDGE_STANDINGS = [
  'GOVERNED_SOURCE',
  'MAIA_SYNTHESIS_UNVERIFIED',
  'NO_SOURCE_REQUIRED',
] as const;
export type RuntimeKnowledgeStanding = (typeof RUNTIME_KNOWLEDGE_STANDINGS)[number];

export interface TeachingRuntimeAuthorityInput {
  interactionId: string;
  binding: TeachingPlatformBindingRecord;
  composition: TeachingCompositionRecord;
  adaptation: LearnerDialogueAdaptationRecord;
  knowledgeStanding: RuntimeKnowledgeStanding;
}

export interface TeachingRuntimeAuthorityRecord {
  contractVersion: typeof TEACHING_RUNTIME_AUTHORITY_VERSION;
  interactionId: string;
  surface: TeachingPlatformBindingRecord['surface'];
  context: TeachingPlatformBindingRecord['context'];
  audience: TeachingPlatformBindingRecord['audience'];
  domainKey: string;
  knowledgeStanding: RuntimeKnowledgeStanding;
  runtimeStanding: 'CURRENT_TURN_ONLY';
  executionStanding: 'AUTHORIZED_CURRENT_TURN' | 'REFRAIN_CURRENT_TURN';
  authorityEffect: 'BOUNDED_TEACHING_EXECUTION';
  proposedActs: readonly string[];
  adaptationStanding: 'CURRENT_INTERACTION_ONLY';
  learnerClaims: readonly [];
  mayTeach: boolean;
  mayCallExistingModelSeam: true;
  mayRenderTeachingDirective: true;
  mayUseGovernedRetrievalResult: boolean;
  mayBrowse: false;
  mayAcquireExternalSources: false;
  mayChangeModelRouting: false;
  mayPersistLearnerState: false;
  mayReadDurableLearnerProfile: false;
  mayWriteLearnerProfile: false;
  mayScoreLearner: false;
  mayRankLearner: false;
  mayWriteManuscript: false;
  mayDiagnose: false;
  mayDirectTreatment: false;
  mayDirectClientAction: false;
  mayAutonomouslyAct: false;
}

function fail(message: string): never {
  throw new Error(`teaching runtime authority: ${message}`);
}

export function authorizeTeachingRuntime(
  input: TeachingRuntimeAuthorityInput,
): TeachingRuntimeAuthorityRecord {
  const { binding, composition, adaptation } = input;

  if (!input.interactionId) fail('interactionId is required');
  if (binding.contractVersion !== 'tpb-1') fail('T7 binding version is not canonical');
  if (binding.bindingStanding !== 'BOUND_NON_EXECUTING') fail('T7 binding standing is invalid');
  if (binding.adaptationStanding !== 'CURRENT_INTERACTION_ONLY') fail('T7 learner standing widened');
  if (binding.context !== composition.context || binding.audience !== composition.audience) {
    fail('T7 binding does not match T3 context/audience');
  }
  if (binding.domain.domainKey !== composition.domain.domainKey) fail('T7/T3 domain mismatch');
  if (composition.executionStanding !== 'NON_EXECUTING_PROPOSAL') fail('T3 standing is invalid');
  if (composition.adaptationStanding !== 'CURRENT_INTERACTION_ONLY') fail('T3 learner standing widened');
  if (composition.learnerClaims.length !== 0) fail('T3 contains learner claims');
  if (adaptation.contractVersion !== 'lda-1') fail('T6 adaptation version is not canonical');
  if (adaptation.interactionId !== input.interactionId) fail('T6 interaction mismatch');
  if (adaptation.adaptationStanding !== 'CURRENT_INTERACTION_ONLY') fail('T6 learner standing widened');
  if (adaptation.learnerClaims.length !== 0 || adaptation.stableTraitInferences.length !== 0) {
    fail('T6 contains learner/profile claims');
  }
  if (adaptation.durableLearnerProfile !== null) fail('durable learner profile is forbidden');
  if (!RUNTIME_KNOWLEDGE_STANDINGS.includes(input.knowledgeStanding)) fail('knowledge standing is invalid');

  const proposedActs = composition.steps.map((step) => step.act);
  const refrainOnly = proposedActs.length > 0 && proposedActs.every((act) => act === 'REFRAIN');

  return Object.freeze({
    contractVersion: TEACHING_RUNTIME_AUTHORITY_VERSION,
    interactionId: input.interactionId,
    surface: binding.surface,
    context: binding.context,
    audience: binding.audience,
    domainKey: binding.domain.domainKey,
    knowledgeStanding: input.knowledgeStanding,
    runtimeStanding: 'CURRENT_TURN_ONLY',
    executionStanding: refrainOnly ? 'REFRAIN_CURRENT_TURN' : 'AUTHORIZED_CURRENT_TURN',
    authorityEffect: 'BOUNDED_TEACHING_EXECUTION',
    proposedActs: Object.freeze([...proposedActs]),
    adaptationStanding: 'CURRENT_INTERACTION_ONLY',
    learnerClaims: Object.freeze([]) as readonly [],
    mayTeach: !refrainOnly,
    mayCallExistingModelSeam: true,
    mayRenderTeachingDirective: true,
    mayUseGovernedRetrievalResult: input.knowledgeStanding === 'GOVERNED_SOURCE',
    mayBrowse: false,
    mayAcquireExternalSources: false,
    mayChangeModelRouting: false,
    mayPersistLearnerState: false,
    mayReadDurableLearnerProfile: false,
    mayWriteLearnerProfile: false,
    mayScoreLearner: false,
    mayRankLearner: false,
    mayWriteManuscript: false,
    mayDiagnose: false,
    mayDirectTreatment: false,
    mayDirectClientAction: false,
    mayAutonomouslyAct: false,
  });
}
