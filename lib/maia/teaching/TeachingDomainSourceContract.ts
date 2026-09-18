/**
 * MAIA-TEACHING-INTELLIGENCE-01 / T2
 * Teaching Domain & Source Authority Contract (`tds-1`).
 *
 * Pure, deterministic, non-executing. This module classifies WHERE teaching is
 * occurring and WHAT epistemic standing a supplied source may carry.
 *
 * It does not fetch sources, inspect member text, call models, build prompts,
 * execute teaching, persist state, or authorize clinical action.
 */

export const TEACHING_DOMAIN_CONTRACT_VERSION = 'tds-1' as const;

export const TEACHING_DOMAINS = [
  'GENERAL',
  'RESEARCH',
  'WRITING',
  'COACHING',
  'PRACTITIONER',
] as const;
export type TeachingDomain = (typeof TEACHING_DOMAINS)[number];

export const TEACHING_SURFACES = [
  'maia',
  'research',
  'writers_studio',
  'coaching',
  'practitioner',
  'supervision',
] as const;
export type TeachingSurface = (typeof TEACHING_SURFACES)[number];
export const TEACHING_GOALS = [
  'EXPLAIN_CONCEPT',
  'TEACH_SKILL',
  'COMPARE_MODELS',
  'EXPLAIN_RESEARCH',
  'TEACH_METHOD',
  'CRITIQUE_WORK',
  'REFLECT_PRACTICE',
] as const;
export type TeachingGoal = (typeof TEACHING_GOALS)[number];

export const KNOWLEDGE_SOURCE_CLASSES = [
  'SOULLAB_CANON',
  'SOULLAB_RESEARCH',
  'GOVERNED_LIBRARY',
  'EXTERNAL_SCHOLARLY',
  'EXTERNAL_PUBLIC_WEB',
  'HISTORICAL_TRADITION',
  'MAIA_SYNTHESIS',
] as const;
export type KnowledgeSourceClass = (typeof KNOWLEDGE_SOURCE_CLASSES)[number];

export const RESEARCH_STAGES = [
  'PRELIMINARY_DIRECTION',
  'HYPOTHESIS',
  'EXPERIMENTAL_EVIDENCE',
  'RATIFIED_FINDING',
] as const;
export type ResearchStage = (typeof RESEARCH_STAGES)[number];

export const SCHOLARLY_KINDS = [
  'PEER_REVIEWED',
  'PREPRINT',
  'SCHOLARLY_BOOK',
  'INSTITUTIONAL_REVIEW',
] as const;
export type ScholarlyKind = (typeof SCHOLARLY_KINDS)[number];
export const CONTEXT_MATERIAL_CLASSES = [
  'NONE',
  'MEMBER_WORK',
  'COACHING_SCENARIO',
  'PRACTITIONER_CASE_CONTEXT',
] as const;
export type ContextMaterialClass = (typeof CONTEXT_MATERIAL_CLASSES)[number];

export const CLAIM_STANDINGS = [
  'CANONICAL_WITHIN_SOULLAB',
  'ACTIVE_RESEARCH',
  'RATIFIED_RESEARCH',
  'GOVERNED_REFERENCE',
  'SCHOLARLY_EVIDENCE',
  'PUBLIC_INFORMATION',
  'TRADITIONAL_ATTRIBUTION',
  'HEURISTIC_SYNTHESIS',
] as const;
export type ClaimStanding = (typeof CLAIM_STANDINGS)[number];

export interface CitationRef {
  title: string;
  locator: string;
  retrievedAt?: string;
}

export interface BaseKnowledgeSource {
  sourceClass: KnowledgeSourceClass;
  sourceId: string;
}

export interface SoullabCanonSource extends BaseKnowledgeSource {
  sourceClass: 'SOULLAB_CANON';
  revision: string;
}
export interface SoullabResearchSource extends BaseKnowledgeSource {
  sourceClass: 'SOULLAB_RESEARCH';
  revision: string;
  researchStage: ResearchStage;
}

export interface GovernedLibrarySource extends BaseKnowledgeSource {
  sourceClass: 'GOVERNED_LIBRARY';
  revision: string;
  provenanceId: string;
}

export interface ExternalScholarlySource extends BaseKnowledgeSource {
  sourceClass: 'EXTERNAL_SCHOLARLY';
  scholarlyKind: ScholarlyKind;
  citation: CitationRef;
}

export interface ExternalPublicWebSource extends BaseKnowledgeSource {
  sourceClass: 'EXTERNAL_PUBLIC_WEB';
  citation: CitationRef & { retrievedAt: string };
}

export interface HistoricalTraditionSource extends BaseKnowledgeSource {
  sourceClass: 'HISTORICAL_TRADITION';
  tradition: string;
  citation: CitationRef;
}

export interface MaiaSynthesisSource extends BaseKnowledgeSource {
  sourceClass: 'MAIA_SYNTHESIS';
  basisSourceIds: readonly string[];
}
export type TeachingKnowledgeSource =
  | SoullabCanonSource
  | SoullabResearchSource
  | GovernedLibrarySource
  | ExternalScholarlySource
  | ExternalPublicWebSource
  | HistoricalTraditionSource
  | MaiaSynthesisSource;

export interface TeachingContextMaterial {
  kind: ContextMaterialClass;
  contextId?: string;
}

export interface TeachingDomainSourceInput {
  surface: TeachingSurface;
  domain: TeachingDomain;
  goal: TeachingGoal;
  source: TeachingKnowledgeSource;
  contextMaterial: TeachingContextMaterial;
}

export interface TeachingDomainSourceEnvelope {
  contractVersion: typeof TEACHING_DOMAIN_CONTRACT_VERSION;
  surface: TeachingSurface;
  domain: TeachingDomain;
  goal: TeachingGoal;
  sourceClass: KnowledgeSourceClass;
  sourceId: string;
  claimStanding: ClaimStanding;
  attributionMode:
    | 'soullab_canon'
    | 'soullab_research'
    | 'named_source'
    | 'named_tradition'
    | 'maia_synthesis';
  citationRequired: boolean;
  freshnessRequired: boolean;
  externalScientificEvidence: boolean;
  establishedScientificFinding: false;
  clinicalActionAuthority: false;
  contextMaterial: {
    kind: ContextMaterialClass;
    contextId?: string;
    authority: 'CONTEXT_ONLY';
    knowledgeAuthority: false;
  };
  executionStanding: 'NON_EXECUTING_SOURCE_ENVELOPE';
  mayExecute: false;
  mayPersistLearnerState: false;
}

const SURFACE_DOMAIN_MAP: Readonly<Record<TeachingSurface, readonly TeachingDomain[]>> = {
  maia: ['GENERAL', 'RESEARCH'],
  research: ['RESEARCH'],
  writers_studio: ['WRITING'],
  coaching: ['COACHING'],
  practitioner: ['PRACTITIONER'],
  supervision: ['PRACTITIONER'],
};

function fail(message: string): never {
  throw new Error(`teaching domain/source contract: ${message}`);
}

function oneOf<T extends readonly string[]>(list: T, value: unknown): value is T[number] {
  return typeof value === 'string' && list.includes(value);
}

function assertNonEmpty(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be non-empty`);
}
function assertCitation(citation: CitationRef, requireFreshness = false): void {
  assertNonEmpty(citation?.title, 'citation.title');
  assertNonEmpty(citation?.locator, 'citation.locator');
  if (requireFreshness) assertNonEmpty(citation?.retrievedAt, 'citation.retrievedAt');
}

function validateSurfaceDomain(surface: TeachingSurface, domain: TeachingDomain): void {
  if (!SURFACE_DOMAIN_MAP[surface].includes(domain)) {
    fail(`surface ${surface} cannot claim teaching domain ${domain}`);
  }
}

function validateContext(context: TeachingContextMaterial): void {
  if (!oneOf(CONTEXT_MATERIAL_CLASSES, context.kind)) fail('contextMaterial.kind is invalid');
  if (context.kind === 'NONE' && context.contextId !== undefined) {
    fail('NONE context may not carry contextId');
  }
  if (context.kind !== 'NONE') assertNonEmpty(context.contextId, 'contextMaterial.contextId');
}

function validateSource(source: TeachingKnowledgeSource): void {
  if (!oneOf(KNOWLEDGE_SOURCE_CLASSES, source.sourceClass)) fail('sourceClass is invalid');
  assertNonEmpty(source.sourceId, 'source.sourceId');

  if (source.sourceClass === 'SOULLAB_CANON') {
    assertNonEmpty(source.revision, 'source.revision');
  } else if (source.sourceClass === 'SOULLAB_RESEARCH') {
    assertNonEmpty(source.revision, 'source.revision');
    if (!oneOf(RESEARCH_STAGES, source.researchStage)) fail('researchStage is invalid');
  } else if (source.sourceClass === 'GOVERNED_LIBRARY') {
    assertNonEmpty(source.revision, 'source.revision');
    assertNonEmpty(source.provenanceId, 'source.provenanceId');
  } else if (source.sourceClass === 'EXTERNAL_SCHOLARLY') {
    if (!oneOf(SCHOLARLY_KINDS, source.scholarlyKind)) fail('scholarlyKind is invalid');
    assertCitation(source.citation);
  } else if (source.sourceClass === 'EXTERNAL_PUBLIC_WEB') {
    assertCitation(source.citation, true);
  } else if (source.sourceClass === 'HISTORICAL_TRADITION') {
    assertNonEmpty(source.tradition, 'source.tradition');
    assertCitation(source.citation);
  } else if (source.sourceClass === 'MAIA_SYNTHESIS') {
    if (!Array.isArray(source.basisSourceIds) || source.basisSourceIds.length < 2) {
      fail('MAIA_SYNTHESIS requires at least two basisSourceIds');
    }
    for (const id of source.basisSourceIds) assertNonEmpty(id, 'basisSourceId');
  }
}

function standingFor(source: TeachingKnowledgeSource): ClaimStanding {
  switch (source.sourceClass) {
    case 'SOULLAB_CANON':
      return 'CANONICAL_WITHIN_SOULLAB';
    case 'SOULLAB_RESEARCH':
      return source.researchStage === 'RATIFIED_FINDING'
        ? 'RATIFIED_RESEARCH'
        : 'ACTIVE_RESEARCH';
    case 'GOVERNED_LIBRARY':
      return 'GOVERNED_REFERENCE';
    case 'EXTERNAL_SCHOLARLY':
      return 'SCHOLARLY_EVIDENCE';
    case 'EXTERNAL_PUBLIC_WEB':
      return 'PUBLIC_INFORMATION';
    case 'HISTORICAL_TRADITION':
      return 'TRADITIONAL_ATTRIBUTION';
    case 'MAIA_SYNTHESIS':
      return 'HEURISTIC_SYNTHESIS';
  }
}
function attributionFor(source: TeachingKnowledgeSource): TeachingDomainSourceEnvelope['attributionMode'] {
  switch (source.sourceClass) {
    case 'SOULLAB_CANON':
      return 'soullab_canon';
    case 'SOULLAB_RESEARCH':
      return 'soullab_research';
    case 'HISTORICAL_TRADITION':
      return 'named_tradition';
    case 'MAIA_SYNTHESIS':
      return 'maia_synthesis';
    default:
      return 'named_source';
  }
}

export function classifyTeachingDomainSource(
  input: TeachingDomainSourceInput,
): TeachingDomainSourceEnvelope {
  if (!oneOf(TEACHING_SURFACES, input.surface)) fail('surface is invalid');
  if (!oneOf(TEACHING_DOMAINS, input.domain)) fail('domain is invalid');
  if (!oneOf(TEACHING_GOALS, input.goal)) fail('goal is invalid');

  validateSurfaceDomain(input.surface, input.domain);
  validateSource(input.source);
  validateContext(input.contextMaterial);

  return {
    contractVersion: TEACHING_DOMAIN_CONTRACT_VERSION,
    surface: input.surface,
    domain: input.domain,
    goal: input.goal,
    sourceClass: input.source.sourceClass,
    sourceId: input.source.sourceId,
    claimStanding: standingFor(input.source),
    attributionMode: attributionFor(input.source),
    citationRequired:
      input.source.sourceClass === 'EXTERNAL_SCHOLARLY' ||
      input.source.sourceClass === 'EXTERNAL_PUBLIC_WEB' ||
      input.source.sourceClass === 'HISTORICAL_TRADITION',
    freshnessRequired: input.source.sourceClass === 'EXTERNAL_PUBLIC_WEB',
    externalScientificEvidence: input.source.sourceClass === 'EXTERNAL_SCHOLARLY',
    establishedScientificFinding: false,
    clinicalActionAuthority: false,
    contextMaterial: {
      kind: input.contextMaterial.kind,
      ...(input.contextMaterial.contextId ? { contextId: input.contextMaterial.contextId } : {}),
      authority: 'CONTEXT_ONLY',
      knowledgeAuthority: false,
    },
    executionStanding: 'NON_EXECUTING_SOURCE_ENVELOPE',
    mayExecute: false,
    mayPersistLearnerState: false,
  };
}