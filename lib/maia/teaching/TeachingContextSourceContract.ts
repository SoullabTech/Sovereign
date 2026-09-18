/**
 * MAIA-TEACHING-INTELLIGENCE-01 / T2 — Teaching Context & Source Contract (`tcs-1`).
 *
 * Pure, deterministic, non-executing. This contract does not retrieve, browse, call models,
 * alter prompts, persist learner state, or execute teaching. It only classifies the teaching
 * room/audience and the epistemic standing of already-available source references.
 */

export const TEACHING_CONTEXT_CONTRACT_VERSION = 'tcs-1' as const;

export const TEACHING_CONTEXTS = [
  'general_maia',
  'writers_studio',
  'coaching_practice',
  'therapist_practitioner',
  'research_lab',
] as const;
export type TeachingContext = (typeof TEACHING_CONTEXTS)[number];

export const TEACHING_AUDIENCES = [
  'member',
  'writer',
  'coach',
  'therapist_practitioner',
  'researcher',
] as const;
export type TeachingAudience = (typeof TEACHING_AUDIENCES)[number];
export const TEACHING_DOMAINS = [
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
] as const;
export type TeachingDomain = (typeof TEACHING_DOMAINS)[number];

export const TEACHING_SOURCE_CLASSES = [
  'soullab_canon',
  'soullab_research',
  'governed_library',
  'practitioner_material',
  'external_academic',
  'external_scientific',
  'external_historical_tradition',
  'external_web_general',
  'maia_synthesis',
] as const;
export type TeachingSourceClass = (typeof TEACHING_SOURCE_CLASSES)[number];
export const EPISTEMIC_STANDINGS = [
  'canonical',
  'research_hypothesis',
  'governed_reference',
  'practitioner_authored',
  'peer_reviewed_evidence',
  'scientific_reference',
  'historical_or_traditional',
  'current_web_reference',
  'maia_synthesis',
] as const;
export type EpistemicStanding = (typeof EPISTEMIC_STANDINGS)[number];

export const CLAIM_CLASSES = [
  'canonical_statement',
  'research_hypothesis',
  'source_explanation',
  'evidence_summary',
  'tradition_description',
  'comparative_synthesis',
] as const;
export type TeachingClaimClass = (typeof CLAIM_CLASSES)[number];

export interface TeachingContextRequest {
  context: TeachingContext;
  audience: TeachingAudience;
  domain: TeachingDomain;
  claimClass: TeachingClaimClass;
}

export interface TeachingSourceRef {
  sourceId: string;
  sourceClass: TeachingSourceClass;
  standing: EpistemicStanding;
  revisionOrLocator: string;
  citationAvailable: boolean;
}
export interface TeachingContextSourceInput {
  request: TeachingContextRequest;
  sources: readonly TeachingSourceRef[];
}

export interface TeachingContextSourceRecord {
  contractVersion: typeof TEACHING_CONTEXT_CONTRACT_VERSION;
  context: TeachingContext;
  audience: TeachingAudience;
  domain: TeachingDomain;
  claimClass: TeachingClaimClass;
  sourceRefs: readonly TeachingSourceRef[];
  sourceClasses: readonly TeachingSourceClass[];
  epistemicStandings: readonly EpistemicStanding[];
  citationRequired: boolean;
  externalEvidencePresent: boolean;
  soullabCanonPresent: boolean;
  soullabResearchPresent: boolean;
  authorityEffect: 'DESCRIPTIVE_CONTEXT_ONLY';
  mayRetrieve: false;
  mayBrowse: false;
  mayTeach: false;
  mayPersistLearnerState: false;
}

const INPUT_KEYS = new Set(['request', 'sources']);
const REQUEST_KEYS = new Set(['context', 'audience', 'domain', 'claimClass']);
const SOURCE_KEYS = new Set(['sourceId', 'sourceClass', 'standing', 'revisionOrLocator', 'citationAvailable']);

function fail(message: string): never {
  throw new Error(`teaching context/source contract: ${message}`);
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

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function assertSourcePair(sourceClass: TeachingSourceClass, standing: EpistemicStanding): void {
  const allowed: Record<TeachingSourceClass, readonly EpistemicStanding[]> = {
    soullab_canon: ['canonical'],
    soullab_research: ['research_hypothesis'],
    governed_library: ['governed_reference', 'canonical', 'research_hypothesis'],
    practitioner_material: ['practitioner_authored', 'governed_reference'],
    external_academic: ['peer_reviewed_evidence'],
    external_scientific: ['scientific_reference', 'peer_reviewed_evidence'],
    external_historical_tradition: ['historical_or_traditional'],
    external_web_general: ['current_web_reference'],
    maia_synthesis: ['maia_synthesis'],
  };
  if (!allowed[sourceClass].includes(standing)) fail(`${sourceClass} cannot claim standing ${standing}`);
}
function contextAudienceCompatible(context: TeachingContext, audience: TeachingAudience): boolean {
  if (context === 'writers_studio') return audience === 'writer';
  if (context === 'coaching_practice') return audience === 'coach';
  if (context === 'therapist_practitioner') return audience === 'therapist_practitioner';
  if (context === 'research_lab') return audience === 'researcher';
  return audience === 'member';
}

export function assertTeachingContextSourceInput(value: unknown): asserts value is TeachingContextSourceInput {
  if (!isRecord(value)) fail('input must be an object');
  assertOnlyKeys(value, INPUT_KEYS, 'input');

  if (!isRecord(value.request)) fail('request must be an object');
  assertOnlyKeys(value.request, REQUEST_KEYS, 'request');
  if (!oneOf(TEACHING_CONTEXTS, value.request.context)) fail('request.context is invalid');
  if (!oneOf(TEACHING_AUDIENCES, value.request.audience)) fail('request.audience is invalid');
  if (!oneOf(TEACHING_DOMAINS, value.request.domain)) fail('request.domain is invalid');
  if (!oneOf(CLAIM_CLASSES, value.request.claimClass)) fail('request.claimClass is invalid');
  if (!contextAudienceCompatible(value.request.context, value.request.audience)) {
    fail(`context ${value.request.context} is not compatible with audience ${value.request.audience}`);
  }

  if (!Array.isArray(value.sources)) fail('sources must be an array');
  for (const source of value.sources) {
    if (!isRecord(source)) fail('source entries must be objects');
    assertOnlyKeys(source, SOURCE_KEYS, 'source');
    if (typeof source.sourceId !== 'string' || !source.sourceId) fail('source requires sourceId');
    if (!oneOf(TEACHING_SOURCE_CLASSES, source.sourceClass)) fail('source.sourceClass is invalid');
    if (!oneOf(EPISTEMIC_STANDINGS, source.standing)) fail('source.standing is invalid');
    if (typeof source.revisionOrLocator !== 'string' || !source.revisionOrLocator) fail('source requires revisionOrLocator');
    if (typeof source.citationAvailable !== 'boolean') fail('source.citationAvailable must be boolean');
    assertSourcePair(source.sourceClass, source.standing);
  }
}

function requiresCitation(claimClass: TeachingClaimClass): boolean {
  return claimClass === 'evidence_summary' || claimClass === 'research_hypothesis' || claimClass === 'tradition_description';
}

function assertClaimSupport(request: TeachingContextRequest, sources: readonly TeachingSourceRef[]): void {
  if (request.claimClass === 'canonical_statement') {
    if (!sources.some((s) => s.standing === 'canonical')) fail('canonical_statement requires canonical source standing');
  }
  if (request.claimClass === 'research_hypothesis') {
    if (!sources.some((s) => s.standing === 'research_hypothesis')) fail('research_hypothesis requires research_hypothesis standing');
  }
  if (request.claimClass === 'evidence_summary') {
    if (!sources.some((s) => s.standing === 'peer_reviewed_evidence' || s.standing === 'scientific_reference')) {
      fail('evidence_summary requires academic/scientific standing');
    }
  }
  if (request.claimClass === 'tradition_description') {
    if (!sources.some((s) => s.standing === 'historical_or_traditional')) fail('tradition_description requires historical_or_traditional standing');
  }
  if (request.claimClass === 'comparative_synthesis') {
    if (sources.length < 2) fail('comparative_synthesis requires at least two sources');
  }
}
export function classifyTeachingContextSource(value: TeachingContextSourceInput): TeachingContextSourceRecord {
  assertTeachingContextSourceInput(value);
  assertClaimSupport(value.request, value.sources);

  const citationRequired = requiresCitation(value.request.claimClass);
  if (citationRequired && value.sources.some((s) => !s.citationAvailable)) {
    fail(`${value.request.claimClass} requires citations for all participating sources`);
  }

  return {
    contractVersion: TEACHING_CONTEXT_CONTRACT_VERSION,
    context: value.request.context,
    audience: value.request.audience,
    domain: value.request.domain,
    claimClass: value.request.claimClass,
    sourceRefs: value.sources.map((s) => ({ ...s })),
    sourceClasses: unique(value.sources.map((s) => s.sourceClass)),
    epistemicStandings: unique(value.sources.map((s) => s.standing)),
    citationRequired,
    externalEvidencePresent: value.sources.some((s) => s.sourceClass.startsWith('external_')),
    soullabCanonPresent: value.sources.some((s) => s.sourceClass === 'soullab_canon' || s.standing === 'canonical'),
    soullabResearchPresent: value.sources.some((s) => s.sourceClass === 'soullab_research' || s.standing === 'research_hypothesis'),
    authorityEffect: 'DESCRIPTIVE_CONTEXT_ONLY',
    mayRetrieve: false,
    mayBrowse: false,
    mayTeach: false,
    mayPersistLearnerState: false,
  };
}
