/**
 * MAIA-TEACHING-INTELLIGENCE-01 / T7 — Teaching Platform Binding Contract (tpb-1).
 *
 * Pure, deterministic, and non-executing. T7 binds an already-canonical teaching
 * context to a governed MAIA product surface. It does not invoke T1–T6, retrieve,
 * browse, call a model/provider, mutate prompts, persist learner state, write
 * manuscripts, deploy, or mutate production.
 */

import {
  CORE_TEACHING_DOMAIN_REGISTRY,
  type TeachingDomainDescriptor,
} from './TeachingCompositionContract';
import {
  TEACHING_AUDIENCES,
  TEACHING_CONTEXTS,
  type TeachingAudience,
  type TeachingContext,
} from './TeachingContextSourceContract';
import type { T4SourceClass } from './KnowledgeRetrievalOrchestrationContract';

export const TEACHING_PLATFORM_BINDING_VERSION = 'tpb-1' as const;

export const TEACHING_SURFACES = [
  'general_maia',
  'writers_studio',
  'coaching_practice',
  'therapist_practitioner',
  'research_lab',
] as const;
export type TeachingSurface = (typeof TEACHING_SURFACES)[number];

export const TEACHING_SURFACE_ROUTES = [
  'oracle_conversation',
  'writers_studio_editorial',
  'coaching_learning',
  'practitioner_learning',
  'research_learning',
] as const;
export type TeachingSurfaceRoute = (typeof TEACHING_SURFACE_ROUTES)[number];

export interface TeachingPlatformBindingInput {
  surface: TeachingSurface;
  route: TeachingSurfaceRoute;
  context: TeachingContext;
  audience: TeachingAudience;
  domainKey: string;
}

export interface TeachingPlatformBindingRecord {
  contractVersion: typeof TEACHING_PLATFORM_BINDING_VERSION;
  surface: TeachingSurface;
  route: TeachingSurfaceRoute;
  context: TeachingContext;
  audience: TeachingAudience;
  domain: TeachingDomainDescriptor;
  allowedSourceClasses: readonly T4SourceClass[];
  adaptationStanding: 'CURRENT_INTERACTION_ONLY';
  teacherIdentity: 'MAIA_SHARED_TEACHER';
  bindingStanding: 'BOUND_NON_EXECUTING';
  authorityEffect: 'PLATFORM_BINDING_ONLY';
  mayInvokeTeachingContracts: false;
  mayTeach: false;
  mayExecute: false;
  mayRetrieve: false;
  mayBrowse: false;
  mayCallModel: false;
  mayMutatePrompt: false;
  mayPersistLearnerState: false;
  mayReadDurableLearnerProfile: false;
  mayWriteLearnerProfile: false;
  mayWriteManuscript: false;
  mayDiagnose: false;
  mayDirectTreatment: false;
  mayDirectClientAction: false;
  mayAutonomouslyAct: false;
}

type SurfaceLaw = {
  route: TeachingSurfaceRoute;
  context: TeachingContext;
  audience: TeachingAudience;
  domainKeys: readonly string[];
  sourceClasses: readonly T4SourceClass[];
};

const WRITING_DOMAINS = ['writing_rhetoric'] as const;
const COACHING_DOMAINS = [
  'coaching_practitioner_craft',
  'psychology_psychotherapy_models',
  'systems_complexity',
  'relational_collective_intelligence',
  'soullab_canon',
  'elemental_alchemy',
  'spiralogic',
] as const;
const PRACTITIONER_DOMAINS = [
  'psychology_psychotherapy_models',
  'coaching_practitioner_craft',
  'systems_complexity',
  'philosophy',
  'spirituality_contemplative_traditions',
  'consciousness_studies',
  'relational_collective_intelligence',
  'soullab_canon',
  'soullab_research',
  'relational_geometry',
  'elemental_alchemy',
  'spiralogic',
  'ain',
  'maia_constitutional_architecture',
] as const;
const RESEARCH_DOMAINS = [
  'consciousness_studies',
  'systems_complexity',
  'relational_collective_intelligence',
  'soullab_research',
  'relational_geometry',
  'philosophy',
  'psychology_psychotherapy_models',
] as const;

const ALL_DOMAIN_KEYS = Object.freeze(Object.keys(CORE_TEACHING_DOMAIN_REGISTRY));

const INTERNAL_AND_EXTERNAL_SOURCES: readonly T4SourceClass[] = [
  'soullab_canon',
  'soullab_research',
  'governed_library',
  'practitioner_material',
  'external_academic',
  'external_scientific',
  'external_historical_tradition',
  'external_web_general',
];

const SURFACE_LAW: Readonly<Record<TeachingSurface, SurfaceLaw>> = {
  general_maia: {
    route: 'oracle_conversation',
    context: 'general_maia',
    audience: 'member',
    domainKeys: ALL_DOMAIN_KEYS,
    sourceClasses: INTERNAL_AND_EXTERNAL_SOURCES,
  },
  writers_studio: {
    route: 'writers_studio_editorial',
    context: 'writers_studio',
    audience: 'writer',
    domainKeys: WRITING_DOMAINS,
    sourceClasses: [
      'soullab_canon',
      'governed_library',
      'practitioner_material',
      'external_academic',
      'external_historical_tradition',
      'external_web_general',
    ],
  },
  coaching_practice: {
    route: 'coaching_learning',
    context: 'coaching_practice',
    audience: 'coach',
    domainKeys: COACHING_DOMAINS,
    sourceClasses: INTERNAL_AND_EXTERNAL_SOURCES,
  },
  therapist_practitioner: {
    route: 'practitioner_learning',
    context: 'therapist_practitioner',
    audience: 'therapist_practitioner',
    domainKeys: PRACTITIONER_DOMAINS,
    sourceClasses: INTERNAL_AND_EXTERNAL_SOURCES,
  },
  research_lab: {
    route: 'research_learning',
    context: 'research_lab',
    audience: 'researcher',
    domainKeys: RESEARCH_DOMAINS,
    sourceClasses: INTERNAL_AND_EXTERNAL_SOURCES,
  },
};

const INPUT_KEYS = new Set(['surface', 'route', 'context', 'audience', 'domainKey']);

function fail(message: string): never {
  throw new Error(`teaching platform binding contract: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function oneOf<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === 'string' && values.includes(value);
}

export function assertTeachingPlatformBindingInput(
  value: unknown,
): asserts value is TeachingPlatformBindingInput {
  if (!isRecord(value)) fail('input must be an object');
  for (const key of Object.keys(value)) {
    if (!INPUT_KEYS.has(key)) fail(`input contains non-contract key: ${key}`);
  }
  if (!oneOf(TEACHING_SURFACES, value.surface)) fail('surface is invalid');
  if (!oneOf(TEACHING_SURFACE_ROUTES, value.route)) fail('route is invalid');
  if (!oneOf(TEACHING_CONTEXTS, value.context)) fail('context is invalid');
  if (!oneOf(TEACHING_AUDIENCES, value.audience)) fail('audience is invalid');
  if (typeof value.domainKey !== 'string' || value.domainKey.length === 0) fail('domainKey is required');
}

export function resolveTeachingPlatformBinding(
  input: TeachingPlatformBindingInput,
): TeachingPlatformBindingRecord {
  assertTeachingPlatformBindingInput(input);

  const law = SURFACE_LAW[input.surface];
  if (input.route !== law.route) fail(`surface ${input.surface} cannot bind route ${input.route}`);
  if (input.context !== law.context) fail(`surface ${input.surface} requires context ${law.context}`);
  if (input.audience !== law.audience) fail(`surface ${input.surface} requires audience ${law.audience}`);
  if (!law.domainKeys.includes(input.domainKey)) {
    fail(`domain ${input.domainKey} is not allowed on surface ${input.surface}`);
  }

  const domain = CORE_TEACHING_DOMAIN_REGISTRY[input.domainKey];
  if (!domain) fail(`unknown canonical teaching domain: ${input.domainKey}`);

  return Object.freeze({
    contractVersion: TEACHING_PLATFORM_BINDING_VERSION,
    surface: input.surface,
    route: input.route,
    context: input.context,
    audience: input.audience,
    domain: Object.freeze({
      domainKey: input.domainKey,
      family: domain.family,
      t2Domain: domain.t2Domain,
    }),
    allowedSourceClasses: Object.freeze([...law.sourceClasses]),
    adaptationStanding: 'CURRENT_INTERACTION_ONLY',
    teacherIdentity: 'MAIA_SHARED_TEACHER',
    bindingStanding: 'BOUND_NON_EXECUTING',
    authorityEffect: 'PLATFORM_BINDING_ONLY',
    mayInvokeTeachingContracts: false,
    mayTeach: false,
    mayExecute: false,
    mayRetrieve: false,
    mayBrowse: false,
    mayCallModel: false,
    mayMutatePrompt: false,
    mayPersistLearnerState: false,
    mayReadDurableLearnerProfile: false,
    mayWriteLearnerProfile: false,
    mayWriteManuscript: false,
    mayDiagnose: false,
    mayDirectTreatment: false,
    mayDirectClientAction: false,
    mayAutonomouslyAct: false,
  });
}
