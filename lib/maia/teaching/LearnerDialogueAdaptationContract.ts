/**
 * MAIA-TEACHING-INTELLIGENCE-01 / T6 - Learner Dialogue & Adaptation (lda-1).
 *
 * Pure, deterministic, descriptive, current-interaction-only, and non-executing.
 * Governing principle: ADAPT TO THE INTERACTION, NOT TO AN INVENTED PERSON.
 */

import { TEACHING_ACTS, type TeachingAct } from './TeachingActContract';
import type { TeachingCompositionRecord } from './TeachingCompositionContract';
import type { KnowledgeAcquisitionPlan } from './KnowledgeRetrievalOrchestrationContract';
import {
  EVIDENCE_SET_STANDINGS,
  type EvidenceSetAssessment,
  type EvidenceSetStanding,
} from './ResearchCitationProvenanceContract';

export const LEARNER_DIALOGUE_ADAPTATION_VERSION = 'lda-1' as const;

export const LEARNER_SIGNAL_KINDS = [
  'EXPLICIT_QUESTION',
  'CLARIFICATION_REQUEST',
  'EXAMPLE_REQUEST',
  'CONTRAST_REQUEST',
  'SIMPLIFICATION_REQUEST',
  'DEPTH_REQUEST',
  'CONFUSION_EXPRESSED',
  'PARTIAL_UNDERSTANDING_EXPRESSED',
  'UNDERSTANDING_EXPRESSED',
  'RESTATEMENT_ATTEMPT',
  'CHALLENGE_OR_DISAGREEMENT',
  'SOURCE_OR_EVIDENCE_CHALLENGE',
  'PRACTICE_REQUEST',
  'PRACTICE_DECLINE',
  'TEACHER_CORRECTION',
  'STOP_OR_TOPIC_CHANGE',
] as const;
export type LearnerSignalKind = (typeof LEARNER_SIGNAL_KINDS)[number];

export const UNDERSTANDING_STANDINGS = [
  'UNKNOWN',
  'CONFUSION_EXPRESSED',
  'PARTIAL_UNDERSTANDING_EXPRESSED',
  'UNDERSTANDING_EXPRESSED',
  'MISUNDERSTANDING_CANDIDATE',
  'CONTESTED_OR_CHALLENGED',
] as const;
export type UnderstandingStanding = (typeof UNDERSTANDING_STANDINGS)[number];

export const ADAPTATION_DEPTHS = ['simplify', 'maintain', 'deepen'] as const;
export type AdaptationDepth = (typeof ADAPTATION_DEPTHS)[number];
export const ADAPTATION_GRANULARITIES = [
  'orient_first',
  'step_by_step',
  'integrated_explanation',
  'concise_synthesis',
] as const;
export type AdaptationGranularity = (typeof ADAPTATION_GRANULARITIES)[number];

export const ADAPTATION_REPRESENTATIONS = [
  'explanation',
  'example',
  'illustration',
  'contrast',
  'analogy',
  'conceptual_map',
  'reflective_question',
  'practice',
] as const;
export type AdaptationRepresentation = (typeof ADAPTATION_REPRESENTATIONS)[number];

export const DIALOGUE_MOVEMENTS = [
  'answer',
  'clarify',
  'inquire',
  'check_understanding',
  'repair_misunderstanding',
  'invite_restatement',
  'offer_another_framing',
  'preserve_disagreement',
  'refrain',
] as const;
export type DialogueMovement = (typeof DIALOGUE_MOVEMENTS)[number];

export const REPAIR_TARGET_KINDS = [
  'proposition',
  'source',
  'model',
  'definition',
  'relationship',
] as const;
export type RepairTargetKind = (typeof REPAIR_TARGET_KINDS)[number];

export const ADAPTATION_REASON_CODES = [
  'answer_explicit_question',
  'clarify_requested',
  'example_requested',
  'contrast_requested',
  'simplification_requested_without_trait_inference',
  'depth_requested_without_expertise_inference',
  'confusion_expressed_without_ability_inference',
  'partial_understanding_current_interaction_only',
  'understanding_expressed_without_mastery_inference',
  'restatement_requires_check',
  'specific_restatement_mismatch',
  'preserve_disagreement',
  'preserve_source_challenge',
  'practice_explicitly_requested',
  'practice_declined_no_pressure',
  'learner_corrected_teacher',
  'stop_or_topic_change',
  'epistemic_conflict_preserved',
  'epistemic_partiality_preserved',
  'epistemic_insufficiency_preserved',
  'epistemic_no_consensus_preserved',
] as const;
export type AdaptationReasonCode = (typeof ADAPTATION_REASON_CODES)[number];

export const BLOCK_REASON_CODES = [
  'disagreement_is_not_misunderstanding',
  'challenge_is_not_resistance',
  'no_specific_mismatch',
  'practice_declined',
  'stop_requested',
  'epistemic_uncertainty_must_be_preserved',
  'teacher_correction_is_not_learner_failure',
] as const;
export type BlockReasonCode = (typeof BLOCK_REASON_CODES)[number];
export interface CurrentInteractionEvidenceRef {
  turnId: string;
  locator: string;
  source: 'current_interaction';
}

export interface RepairMismatchInput {
  targetKind: RepairTargetKind;
  targetId: string;
  mismatchDescription: string;
}

export interface LearnerSignalInput {
  signalId: string;
  kind: LearnerSignalKind;
  evidence: CurrentInteractionEvidenceRef;
  teachingStepId: string | null;
  repairMismatch: RepairMismatchInput | null;
}

export interface LearnerDialogueAdaptationInput {
  interactionId: string;
  composition: TeachingCompositionRecord;
  signal: LearnerSignalInput;
  knowledgePlan: KnowledgeAcquisitionPlan | null;
  evidenceAssessment: EvidenceSetAssessment | null;
}
export interface EpistemicConstraintRecord {
  knowledgeNeedId: string;
  standing: EvidenceSetStanding;
  evidenceIds: readonly string[];
  preserved: true;
}

export interface ProposedAdaptation {
  depth: AdaptationDepth;
  granularity: AdaptationGranularity;
  representations: readonly AdaptationRepresentation[];
  dialogueMovements: readonly DialogueMovement[];
}

export interface BlockedTeachingAct {
  act: TeachingAct;
  reason: BlockReasonCode;
}

export interface LearnerDialogueAdaptationRecord {
  contractVersion: typeof LEARNER_DIALOGUE_ADAPTATION_VERSION;
  interactionId: string;
  signalId: string;
  signalKind: LearnerSignalKind;
  evidence: CurrentInteractionEvidenceRef;
  teachingStepId: string | null;
  t1Act: TeachingAct | null;
  understandingStanding: UnderstandingStanding;
  proposedAdaptation: ProposedAdaptation;
  proposedT1NextActs: readonly TeachingAct[];
  blockedActs: readonly BlockedTeachingAct[];
  reasons: readonly AdaptationReasonCode[];
  repairMismatch: RepairMismatchInput | null;
  epistemicConstraint: EpistemicConstraintRecord | null;
  epistemicConstraintPreserved: boolean;
  learnerClaims: readonly [];
  stableTraitInferences: readonly [];
  durableLearnerProfile: null;
  authorityEffect: 'DESCRIPTIVE_DIALOGUE_ADAPTATION_ONLY';
  executionStanding: 'NON_EXECUTING_PROPOSAL';
  adaptationStanding: 'CURRENT_INTERACTION_ONLY';
  mayTeach: false;
  mayExecute: false;
  mayCallModel: false;
  mayRetrieve: false;
  mayBrowse: false;
  mayMutatePrompt: false;
  mayPersistLearnerState: false;
  mayReadDurableLearnerProfile: false;
  mayWriteLearnerProfile: false;
  mayInferStableTraits: false;
  mayScoreLearner: false;
  mayRankLearner: false;
  mayDiagnose: false;
  mayDirectTreatment: false;
  mayDirectClientAction: false;
  mayAutonomouslyAct: false;
}

const INPUT_KEYS = new Set([
  'interactionId',
  'composition',
  'signal',
  'knowledgePlan',
  'evidenceAssessment',
]);
const SIGNAL_KEYS = new Set([
  'signalId',
  'kind',
  'evidence',
  'teachingStepId',
  'repairMismatch',
]);
const EVIDENCE_KEYS = new Set(['turnId', 'locator', 'source']);
const MISMATCH_KEYS = new Set(['targetKind', 'targetId', 'mismatchDescription']);
const EPISTEMIC_UNCERTAINTY = new Set<EvidenceSetStanding>([
  'CONFLICTING_EVIDENCE',
  'PARTIAL_SUPPORT',
  'INSUFFICIENT_EVIDENCE',
  'NO_CONSENSUS_EVIDENCE',
]);

function fail(message: string): never {
  throw new Error('learner dialogue adaptation contract: ' + message);
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function onlyKeys(
  value: Record<string, unknown>,
  allowed: ReadonlySet<string>,
  where: string,
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail(where + ' contains non-contract key: ' + key);
  }
}
function oneOf<T extends readonly string[]>(
  values: T,
  value: unknown,
): value is T[number] {
  return typeof value === 'string' && values.includes(value);
}

function nonEmpty(value: unknown, where: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    fail(where + ' must be a non-empty string');
  }
}
function assertComposition(composition: TeachingCompositionRecord): void {
  if (composition.contractVersion !== 'tcomp-1') {
    fail('composition must be canonical tcomp-1');
  }
  if (composition.adaptationStanding !== 'CURRENT_INTERACTION_ONLY') {
    fail('composition must remain CURRENT_INTERACTION_ONLY');
  }
  if (composition.learnerClaims.length !== 0) {
    fail('composition learnerClaims must remain empty');
  }
  for (const key of [
    'mayTeach',
    'mayExecute',
    'mayCallModel',
    'mayRetrieve',
    'mayBrowse',
    'mayMutatePrompt',
    'mayPersistLearnerState',
  ] as const) {
    if (composition[key] !== false) {
      fail('composition must preserve false authority flag: ' + key);
    }
  }
}
function assertSignal(value: unknown): asserts value is LearnerSignalInput {
  if (!isRecord(value)) fail('signal must be an object');
  onlyKeys(value, SIGNAL_KEYS, 'signal');
  nonEmpty(value.signalId, 'signal.signalId');
  if (!oneOf(LEARNER_SIGNAL_KINDS, value.kind)) {
    fail('signal.kind is invalid');
  }
  if (!isRecord(value.evidence)) {
    fail('signal.evidence must be an object');
  }
  onlyKeys(value.evidence, EVIDENCE_KEYS, 'signal.evidence');
  nonEmpty(value.evidence.turnId, 'signal.evidence.turnId');
  nonEmpty(value.evidence.locator, 'signal.evidence.locator');
  if (value.evidence.source !== 'current_interaction') {
    fail('signal evidence must be current_interaction');
  }
  if (value.teachingStepId !== null) {
    nonEmpty(value.teachingStepId, 'signal.teachingStepId');
  }
  if (value.repairMismatch !== null) {
    if (!isRecord(value.repairMismatch)) {
      fail('signal.repairMismatch must be null or an object');
    }
    onlyKeys(value.repairMismatch, MISMATCH_KEYS, 'signal.repairMismatch');
    if (!oneOf(REPAIR_TARGET_KINDS, value.repairMismatch.targetKind)) {
      fail('repair target kind is invalid');
    }
    nonEmpty(value.repairMismatch.targetId, 'signal.repairMismatch.targetId');
    nonEmpty(value.repairMismatch.mismatchDescription, 'signal.repairMismatch.mismatchDescription');
    if (value.kind !== 'RESTATEMENT_ATTEMPT') {
      fail('repair mismatch is only valid for RESTATEMENT_ATTEMPT');
    }
  }
}

function resolveStep(composition: TeachingCompositionRecord, stepId: string | null) {
  if (stepId === null) return null;
  const step = composition.steps.find((candidate) => candidate.stepId === stepId);
  if (!step) fail('signal teachingStepId does not exist in composition');
  return step;
}

function assertEpistemicBinding(
  signal: LearnerSignalInput,
  plan: KnowledgeAcquisitionPlan | null,
  assessment: EvidenceSetAssessment | null,
): EpistemicConstraintRecord | null {
  if (plan === null && assessment === null) return null;
  if (plan === null || assessment === null) {
    fail('knowledgePlan and evidenceAssessment must be supplied together');
  }
  if (signal.teachingStepId === null) {
    fail('epistemic constraint requires exact teachingStepId');
  }
  if (plan.contractVersion !== 'kro-1') fail('knowledgePlan must be kro-1');
  if (plan.executionStanding !== 'NON_EXECUTING_PROPOSAL') {
    fail('knowledgePlan must remain non-executing');
  }
  for (const key of ['mayRetrieve', 'mayBrowse', 'mayCallModel', 'mayTeach', 'mayExecute'] as const) {
    if (plan[key] !== false) fail('knowledgePlan must preserve false authority flag: ' + key);
  }
  if (assessment.contractVersion !== 'rcp-1') fail('evidenceAssessment must be rcp-1');
  if (assessment.mayTeach !== false || assessment.mayExecute !== false) {
    fail('evidenceAssessment must remain non-teaching and non-executing');
  }
  if (!oneOf(EVIDENCE_SET_STANDINGS, assessment.standing)) {
    fail('evidenceAssessment standing is invalid');
  }
  const need = plan.knowledgeNeeds.find((candidate) => candidate.needId === assessment.knowledgeNeedId);
  if (!need) fail('evidenceAssessment knowledgeNeedId does not exist in T4 plan');
  if (need.stepId !== signal.teachingStepId) {
    fail('T4/T5 epistemic constraint does not bind to the signal teaching step');
  }
  return {
    knowledgeNeedId: assessment.knowledgeNeedId,
    standing: assessment.standing,
    evidenceIds: [...assessment.evidenceIds],
    preserved: true,
  };
}

function understandingStanding(signal: LearnerSignalInput): UnderstandingStanding {
  switch (signal.kind) {
    case 'CONFUSION_EXPRESSED': return 'CONFUSION_EXPRESSED';
    case 'PARTIAL_UNDERSTANDING_EXPRESSED': return 'PARTIAL_UNDERSTANDING_EXPRESSED';
    case 'UNDERSTANDING_EXPRESSED': return 'UNDERSTANDING_EXPRESSED';
    case 'RESTATEMENT_ATTEMPT':
      return signal.repairMismatch ? 'MISUNDERSTANDING_CANDIDATE' : 'PARTIAL_UNDERSTANDING_EXPRESSED';
    case 'CHALLENGE_OR_DISAGREEMENT':
    case 'SOURCE_OR_EVIDENCE_CHALLENGE':
    case 'TEACHER_CORRECTION':
      return 'CONTESTED_OR_CHALLENGED';
    default:
      return 'UNKNOWN';
  }
}

function adaptationFor(signal: LearnerSignalInput): ProposedAdaptation {
  switch (signal.kind) {
    case 'EXPLICIT_QUESTION':
      return { depth: 'maintain', granularity: 'integrated_explanation', representations: ['explanation'], dialogueMovements: ['answer', 'inquire'] };
    case 'CLARIFICATION_REQUEST':
      return { depth: 'maintain', granularity: 'step_by_step', representations: ['explanation'], dialogueMovements: ['clarify', 'inquire'] };
    case 'EXAMPLE_REQUEST':
      return { depth: 'maintain', granularity: 'integrated_explanation', representations: ['example', 'illustration'], dialogueMovements: ['offer_another_framing'] };
    case 'CONTRAST_REQUEST':
      return { depth: 'maintain', granularity: 'integrated_explanation', representations: ['contrast'], dialogueMovements: ['answer'] };
    case 'SIMPLIFICATION_REQUEST':
      return { depth: 'simplify', granularity: 'step_by_step', representations: ['explanation', 'analogy'], dialogueMovements: ['clarify', 'offer_another_framing'] };
    case 'DEPTH_REQUEST':
      return { depth: 'deepen', granularity: 'integrated_explanation', representations: ['explanation', 'conceptual_map'], dialogueMovements: ['answer'] };
    case 'CONFUSION_EXPRESSED':
      return { depth: 'simplify', granularity: 'step_by_step', representations: ['explanation', 'example'], dialogueMovements: ['inquire', 'offer_another_framing', 'check_understanding'] };
    case 'PARTIAL_UNDERSTANDING_EXPRESSED':
      return { depth: 'maintain', granularity: 'step_by_step', representations: ['explanation'], dialogueMovements: ['check_understanding', 'invite_restatement'] };
    case 'UNDERSTANDING_EXPRESSED':
      return { depth: 'maintain', granularity: 'concise_synthesis', representations: ['explanation'], dialogueMovements: ['check_understanding'] };
    case 'RESTATEMENT_ATTEMPT':
      return signal.repairMismatch
        ? { depth: 'maintain', granularity: 'step_by_step', representations: ['explanation', 'contrast'], dialogueMovements: ['repair_misunderstanding', 'check_understanding'] }
        : { depth: 'maintain', granularity: 'concise_synthesis', representations: ['explanation'], dialogueMovements: ['check_understanding', 'invite_restatement'] };
    case 'CHALLENGE_OR_DISAGREEMENT':
      return { depth: 'maintain', granularity: 'integrated_explanation', representations: ['contrast', 'reflective_question'], dialogueMovements: ['inquire', 'preserve_disagreement'] };
    case 'SOURCE_OR_EVIDENCE_CHALLENGE':
      return { depth: 'deepen', granularity: 'integrated_explanation', representations: ['contrast', 'conceptual_map'], dialogueMovements: ['inquire', 'preserve_disagreement'] };
    case 'PRACTICE_REQUEST':
      return { depth: 'maintain', granularity: 'step_by_step', representations: ['practice'], dialogueMovements: ['answer'] };
    case 'PRACTICE_DECLINE':
      return { depth: 'maintain', granularity: 'concise_synthesis', representations: [], dialogueMovements: ['refrain'] };
    case 'TEACHER_CORRECTION':
      return { depth: 'maintain', granularity: 'concise_synthesis', representations: ['reflective_question'], dialogueMovements: ['inquire', 'preserve_disagreement'] };
    case 'STOP_OR_TOPIC_CHANGE':
      return { depth: 'maintain', granularity: 'concise_synthesis', representations: [], dialogueMovements: ['refrain'] };
  }
}

function proposedActs(signal: LearnerSignalInput): TeachingAct[] {
  switch (signal.kind) {
    case 'EXPLICIT_QUESTION': return ['EXPLAIN', 'INQUIRE'];
    case 'CLARIFICATION_REQUEST': return ['EXPLAIN', 'INQUIRE'];
    case 'EXAMPLE_REQUEST': return ['ILLUSTRATE'];
    case 'CONTRAST_REQUEST': return ['CONTRAST'];
    case 'SIMPLIFICATION_REQUEST': return ['EXPLAIN', 'ILLUSTRATE'];
    case 'DEPTH_REQUEST': return ['EXPLAIN', 'CONTRAST'];
    case 'CONFUSION_EXPRESSED': return ['INQUIRE', 'ILLUSTRATE', 'CHECK_UNDERSTANDING'];
    case 'PARTIAL_UNDERSTANDING_EXPRESSED':
    case 'UNDERSTANDING_EXPRESSED': return ['CHECK_UNDERSTANDING'];
    case 'RESTATEMENT_ATTEMPT':
      return signal.repairMismatch ? ['REPAIR_MISUNDERSTANDING', 'CHECK_UNDERSTANDING'] : ['CHECK_UNDERSTANDING'];
    case 'CHALLENGE_OR_DISAGREEMENT':
    case 'SOURCE_OR_EVIDENCE_CHALLENGE': return ['INQUIRE', 'CONTRAST'];
    case 'PRACTICE_REQUEST': return ['OFFER_PRACTICE'];
    case 'PRACTICE_DECLINE':
    case 'STOP_OR_TOPIC_CHANGE': return ['REFRAIN'];
    case 'TEACHER_CORRECTION': return ['INQUIRE', 'REFRAIN'];
  }
}

function reasonsFor(
  signal: LearnerSignalInput,
  epistemic: EpistemicConstraintRecord | null,
): AdaptationReasonCode[] {
  const reasons: AdaptationReasonCode[] = [];
  switch (signal.kind) {
    case 'EXPLICIT_QUESTION': reasons.push('answer_explicit_question'); break;
    case 'CLARIFICATION_REQUEST': reasons.push('clarify_requested'); break;
    case 'EXAMPLE_REQUEST': reasons.push('example_requested'); break;
    case 'CONTRAST_REQUEST': reasons.push('contrast_requested'); break;
    case 'SIMPLIFICATION_REQUEST': reasons.push('simplification_requested_without_trait_inference'); break;
    case 'DEPTH_REQUEST': reasons.push('depth_requested_without_expertise_inference'); break;
    case 'CONFUSION_EXPRESSED': reasons.push('confusion_expressed_without_ability_inference'); break;
    case 'PARTIAL_UNDERSTANDING_EXPRESSED': reasons.push('partial_understanding_current_interaction_only'); break;
    case 'UNDERSTANDING_EXPRESSED': reasons.push('understanding_expressed_without_mastery_inference'); break;
    case 'RESTATEMENT_ATTEMPT':
      reasons.push(signal.repairMismatch ? 'specific_restatement_mismatch' : 'restatement_requires_check');
      break;
    case 'CHALLENGE_OR_DISAGREEMENT': reasons.push('preserve_disagreement'); break;
    case 'SOURCE_OR_EVIDENCE_CHALLENGE': reasons.push('preserve_source_challenge'); break;
    case 'PRACTICE_REQUEST': reasons.push('practice_explicitly_requested'); break;
    case 'PRACTICE_DECLINE': reasons.push('practice_declined_no_pressure'); break;
    case 'TEACHER_CORRECTION': reasons.push('learner_corrected_teacher'); break;
    case 'STOP_OR_TOPIC_CHANGE': reasons.push('stop_or_topic_change'); break;
  }
  if (epistemic?.standing === 'CONFLICTING_EVIDENCE') reasons.push('epistemic_conflict_preserved');
  if (epistemic?.standing === 'PARTIAL_SUPPORT') reasons.push('epistemic_partiality_preserved');
  if (epistemic?.standing === 'INSUFFICIENT_EVIDENCE') reasons.push('epistemic_insufficiency_preserved');
  if (epistemic?.standing === 'NO_CONSENSUS_EVIDENCE') reasons.push('epistemic_no_consensus_preserved');
  return [...new Set(reasons)];
}

function blockedActs(
  signal: LearnerSignalInput,
  epistemic: EpistemicConstraintRecord | null,
): BlockedTeachingAct[] {
  const blocked: BlockedTeachingAct[] = [];
  if (signal.kind === 'CHALLENGE_OR_DISAGREEMENT') {
    blocked.push({ act: 'REPAIR_MISUNDERSTANDING', reason: 'disagreement_is_not_misunderstanding' });
  }
  if (signal.kind === 'SOURCE_OR_EVIDENCE_CHALLENGE') {
    blocked.push({ act: 'REPAIR_MISUNDERSTANDING', reason: 'challenge_is_not_resistance' });
  }
  if (signal.kind === 'RESTATEMENT_ATTEMPT' && !signal.repairMismatch) {
    blocked.push({ act: 'REPAIR_MISUNDERSTANDING', reason: 'no_specific_mismatch' });
  }
  if (signal.kind === 'PRACTICE_DECLINE') {
    blocked.push({ act: 'OFFER_PRACTICE', reason: 'practice_declined' });
  }
  if (signal.kind === 'STOP_OR_TOPIC_CHANGE') {
    for (const act of TEACHING_ACTS) {
      if (act !== 'REFRAIN') blocked.push({ act, reason: 'stop_requested' });
    }
  }
  if (signal.kind === 'TEACHER_CORRECTION') {
    blocked.push({ act: 'REPAIR_MISUNDERSTANDING', reason: 'teacher_correction_is_not_learner_failure' });
  }
  if (epistemic && EPISTEMIC_UNCERTAINTY.has(epistemic.standing)) {
    if (!blocked.some((entry) => entry.act === 'REPAIR_MISUNDERSTANDING')) {
      blocked.push({ act: 'REPAIR_MISUNDERSTANDING', reason: 'epistemic_uncertainty_must_be_preserved' });
    }
  }
  return blocked;
}

export function proposeLearnerDialogueAdaptation(
  value: LearnerDialogueAdaptationInput,
): LearnerDialogueAdaptationRecord {
  if (!isRecord(value)) fail('input must be an object');
  onlyKeys(value, INPUT_KEYS, 'input');
  nonEmpty(value.interactionId, 'interactionId');
  assertComposition(value.composition);
  assertSignal(value.signal);
  const step = resolveStep(value.composition, value.signal.teachingStepId);
  const epistemic = assertEpistemicBinding(
    value.signal,
    value.knowledgePlan,
    value.evidenceAssessment,
  );
  const blocked = blockedActs(value.signal, epistemic);
  const blockedSet = new Set(blocked.map((entry) => entry.act));
  const acts = [...new Set(proposedActs(value.signal).filter((act) => !blockedSet.has(act)))];

  return {
    contractVersion: LEARNER_DIALOGUE_ADAPTATION_VERSION,
    interactionId: value.interactionId,
    signalId: value.signal.signalId,
    signalKind: value.signal.kind,
    evidence: { ...value.signal.evidence },
    teachingStepId: step?.stepId ?? null,
    t1Act: step?.t1.act ?? null,
    understandingStanding: understandingStanding(value.signal),
    proposedAdaptation: adaptationFor(value.signal),
    proposedT1NextActs: acts,
    blockedActs: blocked,
    reasons: reasonsFor(value.signal, epistemic),
    repairMismatch: value.signal.repairMismatch ? { ...value.signal.repairMismatch } : null,
    epistemicConstraint: epistemic,
    epistemicConstraintPreserved: epistemic !== null,
    learnerClaims: [],
    stableTraitInferences: [],
    durableLearnerProfile: null,
    authorityEffect: 'DESCRIPTIVE_DIALOGUE_ADAPTATION_ONLY',
    executionStanding: 'NON_EXECUTING_PROPOSAL',
    adaptationStanding: 'CURRENT_INTERACTION_ONLY',
    mayTeach: false,
    mayExecute: false,
    mayCallModel: false,
    mayRetrieve: false,
    mayBrowse: false,
    mayMutatePrompt: false,
    mayPersistLearnerState: false,
    mayReadDurableLearnerProfile: false,
    mayWriteLearnerProfile: false,
    mayInferStableTraits: false,
    mayScoreLearner: false,
    mayRankLearner: false,
    mayDiagnose: false,
    mayDirectTreatment: false,
    mayDirectClientAction: false,
    mayAutonomouslyAct: false,
  };
}
