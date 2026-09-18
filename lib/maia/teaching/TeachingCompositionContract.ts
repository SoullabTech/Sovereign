/**
 * MAIA-TEACHING-INTELLIGENCE-01 / T3 — Teaching Composition Contract (tcomp-1).
 *
 * Pure, deterministic, and non-executing. T3 composes already-proposed T1 teaching
 * acts inside a T2 teaching context while preserving source standing, current-
 * interaction-only learner evidence, and professional authority boundaries.
 *
 * T3 does not generate teaching prose, call a model, retrieve or browse sources,
 * mutate prompts, persist learner state, write manuscripts, direct client care,
 * or execute any teaching sequence.
 */

import {
  classifyTeachingDisposition,
  type ProvenanceLayer,
  type TeachingAct,
  type TeachingActCandidate,
  type TeachingDispositionInput,
  type TeachingDispositionRecord,
} from './TeachingActContract';
import {
  classifyTeachingContextSource,
  type EpistemicStanding,
  type TeachingAudience,
  type TeachingClaimClass,
  type TeachingContext,
  type TeachingContextSourceRecord,
  type TeachingDomain,
  type TeachingSourceClass,
  type TeachingSourceRef,
} from './TeachingContextSourceContract';

export const TEACHING_COMPOSITION_CONTRACT_VERSION = 'tcomp-1' as const;

export const TEACHING_DOMAIN_FAMILIES = [
  'writing_and_rhetoric',
  'coaching_and_practitioner_craft',
  'psychology_and_psychotherapy',
  'philosophy',
  'spirituality_and_contemplation',
  'consciousness',
  'systems_and_complexity',
  'relational_and_collective_intelligence',
  'soullab',
  'research',
] as const;
export type TeachingDomainFamily = (typeof TEACHING_DOMAIN_FAMILIES)[number];

export const CORE_TEACHING_DOMAIN_REGISTRY: Readonly<
  Record<string, { family: TeachingDomainFamily; t2Domain: TeachingDomain }>
> = {
  writing_rhetoric: { family: 'writing_and_rhetoric', t2Domain: 'writing_craft' },
  coaching_practitioner_craft: { family: 'coaching_and_practitioner_craft', t2Domain: 'coaching_models' },
  psychology_psychotherapy_models: { family: 'psychology_and_psychotherapy', t2Domain: 'psychotherapy_models' },
  philosophy: { family: 'philosophy', t2Domain: 'philosophy' },
  spirituality_contemplative_traditions: { family: 'spirituality_and_contemplation', t2Domain: 'spirituality' },
  consciousness_studies: { family: 'consciousness', t2Domain: 'consciousness_studies' },
  systems_complexity: { family: 'systems_and_complexity', t2Domain: 'systems_thinking' },
  relational_collective_intelligence: {
    family: 'relational_and_collective_intelligence',
    t2Domain: 'collective_intelligence',
  },
  soullab_canon: { family: 'soullab', t2Domain: 'soullab_canon' },
  soullab_research: { family: 'research', t2Domain: 'consciousness_research' },
  relational_geometry: { family: 'research', t2Domain: 'relational_geometry' },
  elemental_alchemy: { family: 'soullab', t2Domain: 'soullab_canon' },
  spiralogic: { family: 'soullab', t2Domain: 'soullab_canon' },
  ain: { family: 'soullab', t2Domain: 'soullab_canon' },
  maia_constitutional_architecture: { family: 'soullab', t2Domain: 'soullab_canon' },
};

export interface TeachingDomainDescriptor {
  domainKey: string;
  family: TeachingDomainFamily;
  t2Domain: TeachingDomain;
}

export const LEARNER_EVIDENCE_KINDS = [
  'explicit_question',
  'explicit_confusion',
  'explicit_preference',
  'explicit_experience',
  'demonstrated_understanding',
  'requested_depth',
  'requested_example',
  'requested_comparison',
  'misunderstanding_observed',
] as const;
export type LearnerEvidenceKind = (typeof LEARNER_EVIDENCE_KINDS)[number];

export interface CurrentInteractionLearnerEvidence {
  evidenceId: string;
  kind: LearnerEvidenceKind;
  source: 'current_interaction';
}

export const TEACHING_PRACTICE_FRAMES = [
  'conceptual_education',
  'general_example',
  'manuscript_excerpt',
  'coaching_scenario',
  'conceptual_case',
  'reflective_exercise',
  'research_problem',
] as const;
export type TeachingPracticeFrame = (typeof TEACHING_PRACTICE_FRAMES)[number];

export const TEACHING_AUTHORITY_REQUESTS = [
  'education',
  'consultation',
  'authorship',
  'diagnosis',
  'treatment_direction',
  'client_action_direction',
  'autonomous_professional_action',
] as const;
export type TeachingAuthorityRequest = (typeof TEACHING_AUTHORITY_REQUESTS)[number];

export const TEACHING_SOURCE_SUPPORT = ['sufficient', 'partial', 'contradictory', 'unsupported'] as const;
export type TeachingSourceSupport = (typeof TEACHING_SOURCE_SUPPORT)[number];

export const TEACHING_SOURCE_HANDLING = [
  'teach_normally',
  'qualify_and_teach',
  'inquire',
  'source_seeking_required',
  'refrain',
] as const;
export type TeachingSourceHandling = (typeof TEACHING_SOURCE_HANDLING)[number];

export const TEACHING_STATEMENT_LAYERS = ['none', 'source', 'maia_paraphrase', 'maia_synthesis'] as const;
export type TeachingStatementLayer = (typeof TEACHING_STATEMENT_LAYERS)[number];
export type TeachingStepClaimClass = TeachingClaimClass | 'no_claim';

export interface TeachingStepRequest {
  stepId: string;
  act: TeachingAct;
  claimClass: TeachingStepClaimClass;
  sourceIds: readonly string[];
  statementLayer: TeachingStatementLayer;
  learnerEvidenceIds: readonly string[];
}

export interface TeachingCompositionInput {
  context: TeachingContext;
  audience: TeachingAudience;
  domain: TeachingDomainDescriptor;
  sources: readonly TeachingSourceRef[];
  learnerEvidence: readonly CurrentInteractionLearnerEvidence[];
  practiceFrame: TeachingPracticeFrame;
  authorityRequest: TeachingAuthorityRequest;
  sourceSupport: TeachingSourceSupport;
  sourceHandling: TeachingSourceHandling;
  steps: readonly TeachingStepRequest[];
}

export interface TeachingCompositionStepRecord {
  stepId: string;
  act: TeachingAct;
  claimClass: TeachingStepClaimClass;
  sourceIds: readonly string[];
  sourceClasses: readonly TeachingSourceClass[];
  epistemicStandings: readonly EpistemicStanding[];
  statementLayer: TeachingStatementLayer;
  learnerEvidenceIds: readonly string[];
  t1: TeachingDispositionRecord;
  t2: TeachingContextSourceRecord | null;
  executionStanding: 'NON_EXECUTING_PROPOSAL';
}

export interface TeachingCompositionRecord {
  contractVersion: typeof TEACHING_COMPOSITION_CONTRACT_VERSION;
  teacherIdentity: 'MAIA_SHARED_TEACHER';
  context: TeachingContext;
  audience: TeachingAudience;
  domain: TeachingDomainDescriptor;
  practiceFrame: TeachingPracticeFrame;
  authorityRequest: 'education' | 'consultation';
  sourceSupport: TeachingSourceSupport;
  sourceHandling: TeachingSourceHandling;
  sourceSeekingRequired: boolean;
  sourceLedger: readonly TeachingSourceRef[];
  learnerEvidence: readonly CurrentInteractionLearnerEvidence[];
  adaptationStanding: 'CURRENT_INTERACTION_ONLY';
  learnerClaims: readonly [];
  steps: readonly TeachingCompositionStepRecord[];
  authorityEffect: 'DESCRIPTIVE_COMPOSITION_ONLY';
  executionStanding: 'NON_EXECUTING_PROPOSAL';
  mayTeach: false;
  mayExecute: false;
  mayCallModel: false;
  mayRetrieve: false;
  mayBrowse: false;
  mayMutatePrompt: false;
  mayPersistLearnerState: false;
  mayWriteManuscript: false;
  mayDiagnose: false;
  mayDirectTreatment: false;
  mayDirectClientAction: false;
  mayAutonomouslyAct: false;
}

const INPUT_KEYS = new Set([
  'context',
  'audience',
  'domain',
  'sources',
  'learnerEvidence',
  'practiceFrame',
  'authorityRequest',
  'sourceSupport',
  'sourceHandling',
  'steps',
]);
const DOMAIN_KEYS = new Set(['domainKey', 'family', 't2Domain']);
const LEARNER_EVIDENCE_KEYS = new Set(['evidenceId', 'kind', 'source']);
const STEP_KEYS = new Set(['stepId', 'act', 'claimClass', 'sourceIds', 'statementLayer', 'learnerEvidenceIds']);
const T2_CLAIM_CLASSES: readonly TeachingClaimClass[] = [
  'canonical_statement',
  'research_hypothesis',
  'source_explanation',
  'evidence_summary',
  'tradition_description',
  'comparative_synthesis',
];
const T1_ACTS: readonly TeachingAct[] = [
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
];

const ROOM_PRACTICE_FRAMES: Record<TeachingContext, readonly TeachingPracticeFrame[]> = {
  general_maia: ['conceptual_education', 'general_example', 'reflective_exercise'],
  writers_studio: ['conceptual_education', 'general_example', 'manuscript_excerpt', 'reflective_exercise'],
  coaching_practice: ['conceptual_education', 'general_example', 'coaching_scenario', 'reflective_exercise'],
  therapist_practitioner: ['conceptual_education', 'general_example', 'conceptual_case', 'reflective_exercise'],
  research_lab: ['conceptual_education', 'general_example', 'research_problem', 'reflective_exercise'],
};

const PROHIBITED_AUTHORITY_REQUESTS = new Set<TeachingAuthorityRequest>([
  'authorship',
  'diagnosis',
  'treatment_direction',
  'client_action_direction',
  'autonomous_professional_action',
]);

function fail(message: string): never {
  throw new Error('teaching composition contract: ' + message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertOnlyKeys(rec: Record<string, unknown>, allowed: ReadonlySet<string>, where: string): void {
  for (const key of Object.keys(rec)) if (!allowed.has(key)) fail(where + ' contains non-contract key: ' + key);
}

function oneOf<T extends readonly string[]>(list: T, value: unknown): value is T[number] {
  return typeof value === 'string' && list.includes(value);
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function assertNonEmptyId(value: unknown, where: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) fail(where + ' must be a non-empty string');
}

function assertDomain(value: unknown): asserts value is TeachingDomainDescriptor {
  if (!isRecord(value)) fail('domain must be an object');
  assertOnlyKeys(value, DOMAIN_KEYS, 'domain');
  assertNonEmptyId(value.domainKey, 'domain.domainKey');
  if (!/^[a-z0-9][a-z0-9_-]{0,99}$/.test(value.domainKey)) fail('domain.domainKey must be a stable slug');
  if (!oneOf(TEACHING_DOMAIN_FAMILIES, value.family)) fail('domain.family is invalid');

  const t2Domains: readonly TeachingDomain[] = [
    'soullab_canon',
    'relational_geometry',
    'consciousness_research',
    'writing_craft',
    'editorial_practice',
    'coaching_models',
    'psychology',
    'psychotherapy_models',
    'systems_thinking',
    'philosophy',
    'spirituality',
    'comparative_religion',
    'phenomenology',
    'consciousness_studies',
    'collective_intelligence',
    'research_methods',
  ];
  if (!oneOf(t2Domains, value.t2Domain)) fail('domain.t2Domain is invalid');

  const core = CORE_TEACHING_DOMAIN_REGISTRY[value.domainKey];
  if (core && (core.family !== value.family || core.t2Domain !== value.t2Domain)) {
    fail('core domain ' + value.domainKey + ' must preserve its registered family and T2 domain');
  }
}

function assertLearnerEvidence(value: unknown): asserts value is CurrentInteractionLearnerEvidence[] {
  if (!Array.isArray(value)) fail('learnerEvidence must be an array');
  const ids = new Set<string>();
  for (const evidence of value) {
    if (!isRecord(evidence)) fail('learnerEvidence entries must be objects');
    assertOnlyKeys(evidence, LEARNER_EVIDENCE_KEYS, 'learnerEvidence entry');
    assertNonEmptyId(evidence.evidenceId, 'learnerEvidence.evidenceId');
    if (ids.has(evidence.evidenceId)) fail('duplicate learner evidence id: ' + evidence.evidenceId);
    ids.add(evidence.evidenceId);
    if (!oneOf(LEARNER_EVIDENCE_KINDS, evidence.kind)) fail('learnerEvidence.kind is invalid');
    if (evidence.source !== 'current_interaction') fail('learnerEvidence source must be current_interaction');
  }
}

function assertSteps(value: unknown): asserts value is TeachingStepRequest[] {
  if (!Array.isArray(value)) fail('steps must be an array');
  if (value.length < 1 || value.length > 8) fail('steps must contain between 1 and 8 teaching acts');
  const ids = new Set<string>();
  for (const step of value) {
    if (!isRecord(step)) fail('steps entries must be objects');
    assertOnlyKeys(step, STEP_KEYS, 'step');
    assertNonEmptyId(step.stepId, 'step.stepId');
    if (ids.has(step.stepId)) fail('duplicate teaching step id: ' + step.stepId);
    ids.add(step.stepId);
    if (!oneOf(T1_ACTS, step.act)) fail('step.act is invalid');
    if (step.claimClass !== 'no_claim' && !oneOf(T2_CLAIM_CLASSES, step.claimClass)) fail('step.claimClass is invalid');
    if (!Array.isArray(step.sourceIds) || step.sourceIds.some((id) => typeof id !== 'string' || !id)) {
      fail('step.sourceIds must contain non-empty strings');
    }
    if (new Set(step.sourceIds).size !== step.sourceIds.length) fail('step ' + step.stepId + ' contains duplicate sourceIds');
    if (!oneOf(TEACHING_STATEMENT_LAYERS, step.statementLayer)) fail('step.statementLayer is invalid');
    if (!Array.isArray(step.learnerEvidenceIds) || step.learnerEvidenceIds.some((id) => typeof id !== 'string' || !id)) {
      fail('step.learnerEvidenceIds must contain non-empty strings');
    }
    if (new Set(step.learnerEvidenceIds).size !== step.learnerEvidenceIds.length) {
      fail('step ' + step.stepId + ' contains duplicate learnerEvidenceIds');
    }
  }
}

export function assertTeachingCompositionInput(value: unknown): asserts value is TeachingCompositionInput {
  if (!isRecord(value)) fail('input must be an object');
  assertOnlyKeys(value, INPUT_KEYS, 'input');

  const contexts: readonly TeachingContext[] = [
    'general_maia',
    'writers_studio',
    'coaching_practice',
    'therapist_practitioner',
    'research_lab',
  ];
  const audiences: readonly TeachingAudience[] = ['member', 'writer', 'coach', 'therapist_practitioner', 'researcher'];
  if (!oneOf(contexts, value.context)) fail('context is invalid');
  if (!oneOf(audiences, value.audience)) fail('audience is invalid');
  assertDomain(value.domain);

  if (!Array.isArray(value.sources)) fail('sources must be an array');
  const sourceIds = new Set<string>();
  for (const source of value.sources) {
    if (!isRecord(source)) fail('source entries must be objects');
    assertNonEmptyId(source.sourceId, 'source.sourceId');
    if (sourceIds.has(source.sourceId)) fail('duplicate source id: ' + source.sourceId);
    sourceIds.add(source.sourceId);
  }

  assertLearnerEvidence(value.learnerEvidence);
  if (!oneOf(TEACHING_PRACTICE_FRAMES, value.practiceFrame)) fail('practiceFrame is invalid');
  if (!oneOf(TEACHING_AUTHORITY_REQUESTS, value.authorityRequest)) fail('authorityRequest is invalid');
  if (!oneOf(TEACHING_SOURCE_SUPPORT, value.sourceSupport)) fail('sourceSupport is invalid');
  if (!oneOf(TEACHING_SOURCE_HANDLING, value.sourceHandling)) fail('sourceHandling is invalid');
  assertSteps(value.steps);
}

function validateRoomAndAuthority(input: TeachingCompositionInput): void {
  if (!ROOM_PRACTICE_FRAMES[input.context].includes(input.practiceFrame)) {
    fail('practice frame ' + input.practiceFrame + ' is not admitted in ' + input.context);
  }
  if (PROHIBITED_AUTHORITY_REQUESTS.has(input.authorityRequest)) {
    fail('authority request ' + input.authorityRequest + ' is outside T3 teaching authority');
  }
}

function validateSourceHandling(input: TeachingCompositionInput): void {
  const acts = input.steps.map((step) => step.act);
  if (input.sourceSupport === 'sufficient') {
    if (!['teach_normally', 'qualify_and_teach'].includes(input.sourceHandling)) {
      fail('sufficient source support does not require inquiry, source seeking, or refrain');
    }
  } else if (input.sourceHandling === 'teach_normally') {
    fail(input.sourceSupport + ' source support may not teach normally without epistemic handling');
  }

  if (input.sourceHandling === 'qualify_and_teach' && !acts.includes('ORIENT')) {
    fail('qualify_and_teach requires an ORIENT act that can carry epistemic qualification');
  }
  if (input.sourceHandling === 'inquire' && !acts.includes('INQUIRE')) {
    fail('inquire source handling requires an INQUIRE act');
  }
  if (input.sourceHandling === 'source_seeking_required' && !acts.some((act) => act === 'INQUIRE' || act === 'REFRAIN')) {
    fail('source_seeking_required must include INQUIRE or REFRAIN while retrieval remains closed');
  }
  if (input.sourceHandling === 'refrain' && acts[acts.length - 1] !== 'REFRAIN') {
    fail('refrain source handling requires terminal REFRAIN');
  }

  if (input.sourceSupport === 'unsupported') {
    if (!['inquire', 'source_seeking_required', 'refrain'].includes(input.sourceHandling)) {
      fail('unsupported source support may only inquire, request source seeking, or refrain');
    }
    const prohibited = input.steps.find((step) =>
      !['ORIENT', 'INQUIRE', 'REFRAIN'].includes(step.act) || step.claimClass !== 'no_claim'
    );
    if (prohibited) fail('unsupported source support may not compose substantive teaching claims');
  }
}

function validateStepShape(
  step: TeachingStepRequest,
  sourceById: ReadonlyMap<string, TeachingSourceRef>,
  evidenceById: ReadonlyMap<string, CurrentInteractionLearnerEvidence>,
  isLast: boolean,
): void {
  for (const sourceId of step.sourceIds) if (!sourceById.has(sourceId)) fail('step ' + step.stepId + ' references unknown source ' + sourceId);
  for (const evidenceId of step.learnerEvidenceIds) {
    if (!evidenceById.has(evidenceId)) fail('step ' + step.stepId + ' references unknown learner evidence ' + evidenceId);
  }

  if (step.claimClass === 'no_claim') {
    if (step.sourceIds.length !== 0) fail('step ' + step.stepId + ' with no_claim may not carry sourceIds');
    if (step.statementLayer !== 'none') fail('step ' + step.stepId + ' with no_claim must use statementLayer none');
  } else {
    if (step.sourceIds.length === 0) fail('step ' + step.stepId + ' teaching claim requires at least one source');
    if (step.statementLayer === 'none') fail('step ' + step.stepId + ' teaching claim requires a provenance statement layer');
  }

  if (step.statementLayer === 'maia_synthesis') {
    if (step.claimClass !== 'comparative_synthesis') {
      fail('step ' + step.stepId + ' MAIA synthesis must remain comparative_synthesis');
    }
    if (step.sourceIds.length < 2) fail('step ' + step.stepId + ' MAIA synthesis requires at least two source references');
  }
  if (step.claimClass === 'comparative_synthesis' && step.statementLayer !== 'maia_synthesis') {
    fail('step ' + step.stepId + ' comparative_synthesis must be labeled maia_synthesis');
  }
  if (step.claimClass === 'canonical_statement' && step.statementLayer === 'maia_synthesis') {
    fail('step ' + step.stepId + ' MAIA synthesis cannot become a canonical statement');
  }

  if (step.act === 'CONTRAST' && step.claimClass !== 'comparative_synthesis') {
    fail('step ' + step.stepId + ' CONTRAST requires comparative_synthesis provenance');
  }
  if (step.act === 'REFRAIN') {
    if (!isLast) fail('REFRAIN must be terminal in a teaching sequence');
    if (step.claimClass !== 'no_claim') fail('REFRAIN may not carry a teaching claim');
  }

  if (step.act === 'REPAIR_MISUNDERSTANDING') {
    const repairEvidence = step.learnerEvidenceIds
      .map((id) => evidenceById.get(id))
      .some((evidence) => evidence?.kind === 'explicit_confusion' || evidence?.kind === 'misunderstanding_observed');
    if (!repairEvidence) fail('REPAIR_MISUNDERSTANDING requires current-interaction confusion evidence');
  }
}

function provenanceForLayer(layer: TeachingStatementLayer): readonly ProvenanceLayer[] {
  if (layer === 'source') return ['source'];
  if (layer === 'maia_paraphrase') return ['source', 'maia_paraphrase'];
  if (layer === 'maia_synthesis') return ['source', 'maia_synthesis'];
  return [];
}

function uncertaintyForSupport(sourceSupport: TeachingSourceSupport): TeachingDispositionInput['uncertainty'] {
  if (sourceSupport === 'sufficient') return { level: 'low', reasons: [] };
  if (sourceSupport === 'partial') return { level: 'medium', reasons: ['source_scope'] };
  return { level: 'high', reasons: ['source_scope'] };
}

function buildT1(
  step: TeachingStepRequest,
  sources: readonly TeachingSourceRef[],
  sourceSupport: TeachingSourceSupport,
): TeachingDispositionRecord {
  const hasClaim = step.claimClass !== 'no_claim';
  const input: TeachingDispositionInput = {
    occasion: step.act === 'REFRAIN'
      ? { kind: 'none', directExplanationRequested: false, teachingDeclined: false }
      : { kind: 'present_movement', directExplanationRequested: false, teachingDeclined: false },
    sourceBasis: hasClaim
      ? {
        requiredForAct: true,
        standing: 'governed_ready',
        retrievalRelevant: sourceSupport !== 'sufficient',
        sources: sources.map((source) => ({ sourceId: source.sourceId, revision: source.revisionOrLocator })),
        provenanceLayers: provenanceForLayer(step.statementLayer),
      }
      : {
        requiredForAct: false,
        standing: 'not_required',
        retrievalRelevant: sourceSupport !== 'sufficient',
        sources: [],
        provenanceLayers: [],
      },
    restraints: {
      wouldOverwriteMemberMeaning: false,
      presenceBeforePedagogy: false,
      interpretationClaimRequired: false,
      completionPressure: false,
      falseAuthorityRisk: false,
      restraintVsFailureUnclear: false,
    },
    candidateAct: step.act === 'REFRAIN' ? null : step.act as TeachingActCandidate,
    uncertainty: uncertaintyForSupport(sourceSupport),
  };
  const record = classifyTeachingDisposition(input);
  if (record.act !== step.act) fail('T1 did not preserve proposed act ' + step.act + ' for step ' + step.stepId);
  return record;
}

export function composeTeachingSequence(value: TeachingCompositionInput): TeachingCompositionRecord {
  assertTeachingCompositionInput(value);
  validateRoomAndAuthority(value);
  validateSourceHandling(value);

  // Validate every available source/context pair through T2 before composing step-level claims.
  classifyTeachingContextSource({
    request: {
      context: value.context,
      audience: value.audience,
      domain: value.domain.t2Domain,
      claimClass: 'source_explanation',
    },
    sources: value.sources,
  });

  const sourceById = new Map(value.sources.map((source) => [source.sourceId, source] as const));
  const evidenceById = new Map(value.learnerEvidence.map((evidence) => [evidence.evidenceId, evidence] as const));

  const steps = value.steps.map((step, index): TeachingCompositionStepRecord => {
    validateStepShape(step, sourceById, evidenceById, index === value.steps.length - 1);
    const sources = step.sourceIds.map((sourceId) => sourceById.get(sourceId)!);
    const t2 = step.claimClass === 'no_claim'
      ? null
      : classifyTeachingContextSource({
        request: {
          context: value.context,
          audience: value.audience,
          domain: value.domain.t2Domain,
          claimClass: step.claimClass,
        },
        sources,
      });
    const t1 = buildT1(step, sources, value.sourceSupport);

    return {
      stepId: step.stepId,
      act: step.act,
      claimClass: step.claimClass,
      sourceIds: [...step.sourceIds],
      sourceClasses: unique(sources.map((source) => source.sourceClass)),
      epistemicStandings: unique(sources.map((source) => source.standing)),
      statementLayer: step.statementLayer,
      learnerEvidenceIds: [...step.learnerEvidenceIds],
      t1,
      t2,
      executionStanding: 'NON_EXECUTING_PROPOSAL',
    };
  });

  return {
    contractVersion: TEACHING_COMPOSITION_CONTRACT_VERSION,
    teacherIdentity: 'MAIA_SHARED_TEACHER',
    context: value.context,
    audience: value.audience,
    domain: { ...value.domain },
    practiceFrame: value.practiceFrame,
    authorityRequest: value.authorityRequest as 'education' | 'consultation',
    sourceSupport: value.sourceSupport,
    sourceHandling: value.sourceHandling,
    sourceSeekingRequired: value.sourceHandling === 'source_seeking_required',
    sourceLedger: value.sources.map((source) => ({ ...source })),
    learnerEvidence: value.learnerEvidence.map((evidence) => ({ ...evidence })),
    adaptationStanding: 'CURRENT_INTERACTION_ONLY',
    learnerClaims: [],
    steps,
    authorityEffect: 'DESCRIPTIVE_COMPOSITION_ONLY',
    executionStanding: 'NON_EXECUTING_PROPOSAL',
    mayTeach: false,
    mayExecute: false,
    mayCallModel: false,
    mayRetrieve: false,
    mayBrowse: false,
    mayMutatePrompt: false,
    mayPersistLearnerState: false,
    mayWriteManuscript: false,
    mayDiagnose: false,
    mayDirectTreatment: false,
    mayDirectClientAction: false,
    mayAutonomouslyAct: false,
  };
}
