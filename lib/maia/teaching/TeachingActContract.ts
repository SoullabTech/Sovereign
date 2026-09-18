/**
 * MAIA-TEACHING-INTELLIGENCE-01 / T1 — Teaching Act Contract (`tac-1`).
 *
 * Pure, deterministic, and non-executing. No I/O, model calls, retrieval,
 * prompt mutation, persistence, routing, or learner-state authority.
 *
 * Governing constitution:
 * docs/programme/MAIA-TEACHING-INTELLIGENCE-01_T0_TEACHING_CONSTITUTION_2026-09-18.md
 */

export const TEACHING_ACT_CONTRACT_VERSION = 'tac-1' as const;

export const TEACHING_ACTS = [
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
] as const;
export type TeachingAct = (typeof TEACHING_ACTS)[number];
export type TeachingActCandidate = Exclude<TeachingAct, 'REFRAIN'>;

export const TEACHING_OCCASIONS = ['explicit_request', 'present_movement', 'none'] as const;
export type TeachingOccasionKind = (typeof TEACHING_OCCASIONS)[number];

export const SOURCE_STANDINGS = ['not_required', 'governed_ready', 'unavailable'] as const;
export type SourceStanding = (typeof SOURCE_STANDINGS)[number];

export const PROVENANCE_LAYERS = ['source', 'maia_paraphrase', 'maia_synthesis'] as const;
export type ProvenanceLayer = (typeof PROVENANCE_LAYERS)[number];

export const UNCERTAINTY_LEVELS = ['low', 'medium', 'high'] as const;
export type TeachingUncertaintyLevel = (typeof UNCERTAINTY_LEVELS)[number];

export const UNCERTAINTY_REASONS = [
  'member_intent',
  'teaching_fit',
  'act_choice',
  'source_scope',
  'failure_boundary',
] as const;
export type TeachingUncertaintyReason = (typeof UNCERTAINTY_REASONS)[number];

export const T0_RESTRAINT_CODES = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8'] as const;
export type T0RestraintCode = (typeof T0_RESTRAINT_CODES)[number];

export const TEACHING_RATIONALE_CODES = [
  'member_requested_direct_explanation',
  'member_requested_act',
  'present_movement_candidate',
  'no_member_occasion',
  'member_declined_teaching',
  'source_not_governed',
  'preserve_unfinished_meaning',
  'presence_before_pedagogy',
  'interpretation_boundary',
  'completion_pressure',
  'false_authority_risk',
  'failure_boundary_unresolved',
] as const;
export type TeachingRationaleCode = (typeof TEACHING_RATIONALE_CODES)[number];

export interface TeachingOccasion {
  kind: TeachingOccasionKind;
  requestedAct?: TeachingActCandidate;
  directExplanationRequested: boolean;
  teachingDeclined: boolean;
}

export interface GovernedSourceReference {
  sourceId: string;
  revision: string;
}

export interface TeachingSourceBasis {
  requiredForAct: boolean;
  standing: SourceStanding;
  retrievalRelevant: boolean;
  sources: readonly GovernedSourceReference[];
  provenanceLayers: readonly ProvenanceLayer[];
}

export interface TeachingRestraintSignals {
  wouldOverwriteMemberMeaning: boolean;
  presenceBeforePedagogy: boolean;
  interpretationClaimRequired: boolean;
  completionPressure: boolean;
  falseAuthorityRisk: boolean;
  restraintVsFailureUnclear: boolean;
}

export interface TeachingUncertainty {
  level: TeachingUncertaintyLevel;
  reasons: readonly TeachingUncertaintyReason[];
}

export interface TeachingDispositionInput {
  occasion: TeachingOccasion;
  sourceBasis: TeachingSourceBasis;
  restraints: TeachingRestraintSignals;
  candidateAct: TeachingActCandidate | null;
  uncertainty: TeachingUncertainty;
}

export interface TeachingRestraintCheck {
  code: T0RestraintCode;
  triggered: boolean;
  nature: 'pedagogical_restraint' | 'authority_boundary' | 'failure_boundary';
}

export interface TeachingDispositionRecord {
  contractVersion: typeof TEACHING_ACT_CONTRACT_VERSION;
  act: TeachingAct;
  executionStanding: 'NON_EXECUTING_PROPOSAL';
  authorityEffect: 'DESCRIPTIVE_PROPOSAL_ONLY';
  occasion: {
    kind: TeachingOccasionKind;
    directExplanationRequested: boolean;
  };
  sourceBasis: {
    requiredForAct: boolean;
    standing: SourceStanding;
    retrievalRelevant: boolean;
    sources: readonly GovernedSourceReference[];
    provenanceLayers: readonly ProvenanceLayer[];
  };
  restraintChecks: readonly TeachingRestraintCheck[];
  rationale: readonly TeachingRationaleCode[];
  uncertainty: TeachingUncertainty;
  learnerClaims: readonly [];
  mayExecute: false;
  mayPersistLearnerState: false;
}

const INPUT_KEYS = new Set(['occasion', 'sourceBasis', 'restraints', 'candidateAct', 'uncertainty']);
const OCCASION_KEYS = new Set(['kind', 'requestedAct', 'directExplanationRequested', 'teachingDeclined']);
const SOURCE_KEYS = new Set(['requiredForAct', 'standing', 'retrievalRelevant', 'sources', 'provenanceLayers']);
const SOURCE_REF_KEYS = new Set(['sourceId', 'revision']);
const RESTRAINT_KEYS = new Set([
  'wouldOverwriteMemberMeaning',
  'presenceBeforePedagogy',
  'interpretationClaimRequired',
  'completionPressure',
  'falseAuthorityRisk',
  'restraintVsFailureUnclear',
]);
const UNCERTAINTY_KEYS = new Set(['level', 'reasons']);

function fail(message: string): never {
  throw new Error(`teaching act contract: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertOnlyKeys(rec: Record<string, unknown>, allowed: ReadonlySet<string>, where: string): void {
  for (const key of Object.keys(rec)) if (!allowed.has(key)) fail(`${where} contains non-contract key: ${key}`);
}

function oneOf<T extends readonly string[]>(list: T, value: unknown): value is T[number] {
  return typeof value === 'string' && list.includes(value);
}

function nonRefrainAct(value: unknown): value is TeachingActCandidate {
  return oneOf(TEACHING_ACTS, value) && value !== 'REFRAIN';
}

function assertBoolean(value: unknown, name: string): asserts value is boolean {
  if (typeof value !== 'boolean') fail(`${name} must be boolean`);
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

export function assertTeachingDispositionInput(value: unknown): asserts value is TeachingDispositionInput {
  if (!isRecord(value)) fail('input must be an object');
  assertOnlyKeys(value, INPUT_KEYS, 'input');

  if (!isRecord(value.occasion)) fail('occasion must be an object');
  assertOnlyKeys(value.occasion, OCCASION_KEYS, 'occasion');
  if (!oneOf(TEACHING_OCCASIONS, value.occasion.kind)) fail('occasion.kind is invalid');
  if (value.occasion.requestedAct !== undefined && !nonRefrainAct(value.occasion.requestedAct)) {
    fail('occasion.requestedAct must be a non-REFRAIN teaching act');
  }
  assertBoolean(value.occasion.directExplanationRequested, 'occasion.directExplanationRequested');
  assertBoolean(value.occasion.teachingDeclined, 'occasion.teachingDeclined');

  if (!isRecord(value.sourceBasis)) fail('sourceBasis must be an object');
  assertOnlyKeys(value.sourceBasis, SOURCE_KEYS, 'sourceBasis');
  assertBoolean(value.sourceBasis.requiredForAct, 'sourceBasis.requiredForAct');
  assertBoolean(value.sourceBasis.retrievalRelevant, 'sourceBasis.retrievalRelevant');
  if (!oneOf(SOURCE_STANDINGS, value.sourceBasis.standing)) fail('sourceBasis.standing is invalid');
  if (!Array.isArray(value.sourceBasis.sources)) fail('sourceBasis.sources must be an array');
  for (const source of value.sourceBasis.sources) {
    if (!isRecord(source)) fail('sourceBasis.sources entries must be objects');
    assertOnlyKeys(source, SOURCE_REF_KEYS, 'source reference');
    if (typeof source.sourceId !== 'string' || source.sourceId.length === 0) fail('source reference requires sourceId');
    if (typeof source.revision !== 'string' || source.revision.length === 0) fail('source reference requires revision');
  }
  if (!Array.isArray(value.sourceBasis.provenanceLayers)) fail('sourceBasis.provenanceLayers must be an array');
  for (const layer of value.sourceBasis.provenanceLayers) {
    if (!oneOf(PROVENANCE_LAYERS, layer)) fail(`invalid provenance layer: ${String(layer)}`);
  }
  if (value.sourceBasis.standing === 'governed_ready') {
    if (value.sourceBasis.sources.length === 0) fail('governed_ready requires at least one source reference');
    if (!value.sourceBasis.provenanceLayers.includes('source')) fail('governed_ready requires source provenance');
  }
  if (value.sourceBasis.standing === 'not_required' && value.sourceBasis.sources.length > 0) {
    fail('not_required source standing may not carry source references');
  }

  if (!isRecord(value.restraints)) fail('restraints must be an object');
  assertOnlyKeys(value.restraints, RESTRAINT_KEYS, 'restraints');
  for (const key of RESTRAINT_KEYS) assertBoolean(value.restraints[key], `restraints.${key}`);

  if (value.candidateAct !== null && !nonRefrainAct(value.candidateAct)) {
    fail('candidateAct must be null or a non-REFRAIN teaching act');
  }

  if (!isRecord(value.uncertainty)) fail('uncertainty must be an object');
  assertOnlyKeys(value.uncertainty, UNCERTAINTY_KEYS, 'uncertainty');
  if (!oneOf(UNCERTAINTY_LEVELS, value.uncertainty.level)) fail('uncertainty.level is invalid');
  if (!Array.isArray(value.uncertainty.reasons)) fail('uncertainty.reasons must be an array');
  for (const reason of value.uncertainty.reasons) {
    if (!oneOf(UNCERTAINTY_REASONS, reason)) fail(`invalid uncertainty reason: ${String(reason)}`);
  }
}

function sourceBoundaryTriggered(input: TeachingDispositionInput): boolean {
  return input.sourceBasis.requiredForAct && input.sourceBasis.standing !== 'governed_ready';
}

function buildRestraintChecks(input: TeachingDispositionInput): TeachingRestraintCheck[] {
  return [
    { code: 'R1', triggered: input.occasion.teachingDeclined, nature: 'pedagogical_restraint' },
    { code: 'R2', triggered: sourceBoundaryTriggered(input), nature: 'authority_boundary' },
    { code: 'R3', triggered: input.restraints.wouldOverwriteMemberMeaning, nature: 'pedagogical_restraint' },
    { code: 'R4', triggered: input.restraints.presenceBeforePedagogy, nature: 'pedagogical_restraint' },
    { code: 'R5', triggered: input.restraints.interpretationClaimRequired, nature: 'pedagogical_restraint' },
    { code: 'R6', triggered: input.restraints.completionPressure, nature: 'pedagogical_restraint' },
    { code: 'R7', triggered: input.restraints.falseAuthorityRisk, nature: 'authority_boundary' },
    { code: 'R8', triggered: input.restraints.restraintVsFailureUnclear, nature: 'failure_boundary' },
  ];
}

function restraintRationales(checks: readonly TeachingRestraintCheck[]): TeachingRationaleCode[] {
  const reasons: TeachingRationaleCode[] = [];
  for (const check of checks) {
    if (!check.triggered) continue;
    if (check.code === 'R1') reasons.push('member_declined_teaching');
    if (check.code === 'R2') reasons.push('source_not_governed');
    if (check.code === 'R3') reasons.push('preserve_unfinished_meaning');
    if (check.code === 'R4') reasons.push('presence_before_pedagogy');
    if (check.code === 'R5') reasons.push('interpretation_boundary');
    if (check.code === 'R6') reasons.push('completion_pressure');
    if (check.code === 'R7') reasons.push('false_authority_risk');
    if (check.code === 'R8') reasons.push('failure_boundary_unresolved');
  }
  return reasons;
}

function selectAct(input: TeachingDispositionInput, checks: readonly TeachingRestraintCheck[]) {
  const blocked = restraintRationales(checks);
  if (blocked.length) return { act: 'REFRAIN' as const, rationale: blocked };

  if (input.occasion.kind === 'none') {
    return { act: 'REFRAIN' as const, rationale: ['no_member_occasion'] as TeachingRationaleCode[] };
  }

  if (input.occasion.kind === 'explicit_request' && input.occasion.directExplanationRequested) {
    return {
      act: 'EXPLAIN' as const,
      rationale: ['member_requested_direct_explanation'] as TeachingRationaleCode[],
    };
  }

  if (input.occasion.kind === 'explicit_request' && input.occasion.requestedAct) {
    return {
      act: input.occasion.requestedAct,
      rationale: ['member_requested_act'] as TeachingRationaleCode[],
    };
  }

  if (input.candidateAct) {
    return {
      act: input.candidateAct,
      rationale: [
        input.occasion.kind === 'explicit_request' ? 'member_requested_act' : 'present_movement_candidate',
      ] as TeachingRationaleCode[],
    };
  }

  return { act: 'REFRAIN' as const, rationale: ['no_member_occasion'] as TeachingRationaleCode[] };
}

export function classifyTeachingDisposition(value: TeachingDispositionInput): TeachingDispositionRecord {
  assertTeachingDispositionInput(value);
  const checks = buildRestraintChecks(value);
  const selected = selectAct(value, checks);

  return {
    contractVersion: TEACHING_ACT_CONTRACT_VERSION,
    act: selected.act,
    executionStanding: 'NON_EXECUTING_PROPOSAL',
    authorityEffect: 'DESCRIPTIVE_PROPOSAL_ONLY',
    occasion: {
      kind: value.occasion.kind,
      directExplanationRequested: value.occasion.directExplanationRequested,
    },
    sourceBasis: {
      requiredForAct: value.sourceBasis.requiredForAct,
      standing: value.sourceBasis.standing,
      retrievalRelevant: value.sourceBasis.retrievalRelevant,
      sources: value.sourceBasis.sources.map((source) => ({ ...source })),
      provenanceLayers: unique(value.sourceBasis.provenanceLayers),
    },
    restraintChecks: checks,
    rationale: unique(selected.rationale),
    uncertainty: {
      level: value.uncertainty.level,
      reasons: unique(value.uncertainty.reasons),
    },
    learnerClaims: [],
    mayExecute: false,
    mayPersistLearnerState: false,
  };
}
