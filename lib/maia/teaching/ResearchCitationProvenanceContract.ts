/**
 * MAIA-TEACHING-INTELLIGENCE-01 / T5 — Research, Citation & Provenance Contract (rcp-1).
 *
 * Pure, deterministic, descriptive, and non-executing. T5 binds source/evidence identity
 * to an exact T4 KnowledgeNeed + SourceAcquisitionRequest + T3 teaching step and records
 * citation, provenance, freshness, transformation, support, auditability, independence,
 * and consensus standing.
 *
 * T5 does not retrieve, browse, download sources, call models/providers, mutate prompts,
 * teach, persist learner state, create schema, deploy, or mutate production.
 */

import type { EpistemicStanding } from './TeachingContextSourceContract';
import {
  EVIDENCE_ROLES,
  type AuthorityRequirement,
  type EvidenceRole,
  type FreshnessStanding,
  type KnowledgeAcquisitionPlan,
  type RetrievalAdapterClass,
  type SourceForm,
  type T4SourceClass,
} from './KnowledgeRetrievalOrchestrationContract';

export const RESEARCH_CITATION_PROVENANCE_VERSION = 'rcp-1' as const;

export const CLAIM_EVIDENCE_RELATIONS = [
  'SUPPORTS',
  'CONTRADICTS',
  'NEUTRAL',
  'INSUFFICIENT_TO_DETERMINE',
] as const;
export type ClaimEvidenceRelation = (typeof CLAIM_EVIDENCE_RELATIONS)[number];

export const EXPRESSION_STANDINGS = [
  'exact_quotation',
  'source_faithful_paraphrase',
  'maia_paraphrase',
  'maia_synthesis',
] as const;
export type ExpressionStanding = (typeof EXPRESSION_STANDINGS)[number];

export const TRANSFORMATION_TYPES = [
  'extraction',
  'chunking',
  'normalization',
  'translation',
  'summarization',
  'paraphrase',
  'model_assisted_transformation',
] as const;
export type TransformationType = (typeof TRANSFORMATION_TYPES)[number];

export const AUDITABILITY_STANDINGS = ['auditable', 'partially_auditable', 'unauditable'] as const;
export type AuditabilityStanding = (typeof AUDITABILITY_STANDINGS)[number];

export const RELIABILITY_STANDINGS = ['verified_for_claim', 'not_verified', 'unknown'] as const;
export type ReliabilityStanding = (typeof RELIABILITY_STANDINGS)[number];

export const EVIDENCE_SET_STANDINGS = [
  'CONSISTENT_SUPPORT',
  'CONFLICTING_EVIDENCE',
  'PARTIAL_SUPPORT',
  'INSUFFICIENT_EVIDENCE',
  'CONSENSUS_EVIDENCE_PRESENT',
  'NO_CONSENSUS_EVIDENCE',
] as const;
export type EvidenceSetStanding = (typeof EVIDENCE_SET_STANDINGS)[number];

export interface SourceIdentityInput {
  sourceId: string;
  title: string;
  authorshipKey: string;
  authors: readonly string[];
  institutionOrPublisher: string | null;
  publicationOrRevisionDate: string | null;
  revision: string | null;
  edition: string | null;
  canonicalSha: string | null;
  doi: string | null;
  stableLocator: string | null;
  governedFilePath: string | null;
  governedChecksum: string | null;
  accessedAt: string | null;
  underlyingSourceKey: string;
  independentlyReopenable: boolean;
}

export interface CitationInput {
  citationPresent: boolean;
  stableCitationLocator: string | null;
  pinpointLocator: string | null;
  renderableCitation: string | null;
  citedSourceSupportsClaim: boolean;
}

export interface ProvenanceInput {
  acquisitionAdapterClass: RetrievalAdapterClass;
  authorityRequirement: AuthorityRequirement;
  authorityProof: string | null;
  custodyProof: string | null;
  transformations: readonly TransformationType[];
  expressionStanding: ExpressionStanding;
  peerReviewed: boolean;
  reliabilityStanding: ReliabilityStanding;
}

export interface TeachingEvidenceInput {
  evidenceId: string;
  knowledgeNeedId: string;
  sourceRequestId: string;
  sourceClass: T4SourceClass;
  standing: EpistemicStanding;
  sourceForm: SourceForm;
  evidenceRoles: readonly EvidenceRole[];
  source: SourceIdentityInput;
  citation: CitationInput;
  provenance: ProvenanceInput;
  freshnessStanding: FreshnessStanding;
  freshnessRequirement: string;
  freshnessMeetsRequirement: boolean;
  claimRelation: ClaimEvidenceRelation;
}

export interface TeachingEvidenceRecord {
  contractVersion: typeof RESEARCH_CITATION_PROVENANCE_VERSION;
  evidenceId: string;
  knowledgeNeedId: string;
  sourceRequestId: string;
  teachingStepId: string;
  claimClass: string;
  sourceClass: T4SourceClass;
  standing: EpistemicStanding;
  sourceForm: SourceForm;
  evidenceRoles: readonly EvidenceRole[];
  source: SourceIdentityInput;
  citation: CitationInput & {
    citationRequired: boolean;
  };
  provenance: ProvenanceInput & {
    sourceAuthorityInheritedByTransformation: false;
    provenanceChain: readonly ['SOURCE', 'ACQUISITION', 'EVIDENCE_RECORD', 'TEACHING_CLAIM'];
  };
  freshnessStanding: FreshnessStanding;
  claimRelation: ClaimEvidenceRelation;
  auditability: AuditabilityStanding;
  consensusCapableSourceForm: boolean;
  consensusEvidenceStanding: 'not_claimed' | 'eligible_source_form' | 'supports_consensus_claim';
  independentIdentity: {
    authorshipKey: string;
    underlyingSourceKey: string;
  };
  sourceEvidenceStanding: 'DIRECT_SOURCE' | 'DERIVED_SOURCE' | 'NON_SOURCE_SYNTHESIS';
  eligibleForLaterTeachingConsideration: boolean;
  authorityEffect: 'DESCRIPTIVE_PROVENANCE_RECORD_ONLY';
  executionStanding: 'NON_EXECUTING_PROPOSAL';
  mayRetrieve: false;
  mayBrowse: false;
  mayDownloadSource: false;
  mayCallModel: false;
  mayTeach: false;
  mayExecute: false;
  mayMutatePrompt: false;
  mayPersistLearnerState: false;
}

export interface EvidenceSetAssessment {
  contractVersion: typeof RESEARCH_CITATION_PROVENANCE_VERSION;
  knowledgeNeedId: string;
  evidenceIds: readonly string[];
  supportingIds: readonly string[];
  contradictingIds: readonly string[];
  neutralIds: readonly string[];
  insufficientIds: readonly string[];
  independentSourceCount: number;
  independentAuthorshipCount: number;
  hasConsensusCapableEvidence: boolean;
  standing: EvidenceSetStanding;
  reasons: readonly string[];
  preservedConflict: boolean;
  mayTeach: false;
  mayExecute: false;
}

const INPUT_KEYS = new Set([
  'evidenceId',
  'knowledgeNeedId',
  'sourceRequestId',
  'sourceClass',
  'standing',
  'sourceForm',
  'evidenceRoles',
  'source',
  'citation',
  'provenance',
  'freshnessStanding',
  'claimRelation',
]);
const SOURCE_KEYS = new Set([
  'sourceId',
  'title',
  'authorshipKey',
  'authors',
  'institutionOrPublisher',
  'publicationOrRevisionDate',
  'revision',
  'edition',
  'canonicalSha',
  'doi',
  'stableLocator',
  'governedFilePath',
  'governedChecksum',
  'accessedAt',
  'underlyingSourceKey',
  'independentlyReopenable',
]);
const CITATION_KEYS = new Set([
  'citationPresent',
  'stableCitationLocator',
  'pinpointLocator',
  'renderableCitation',
  'citedSourceSupportsClaim',
]);
const PROVENANCE_KEYS = new Set([
  'acquisitionAdapterClass',
  'authorityRequirement',
  'authorityProof',
  'custodyProof',
  'transformations',
  'expressionStanding',
  'peerReviewed',
  'reliabilityStanding',
]);

const SOURCE_FORMS_BY_CLASS: Record<T4SourceClass, readonly SourceForm[]> = {
  soullab_canon: ['canonical_text'],
  soullab_research: ['governed_reference'],
  governed_library: ['canonical_text', 'governed_reference'],
  practitioner_material: ['practitioner_authored', 'governed_reference'],
  external_academic: [
    'primary_study',
    'secondary_scholarship',
    'systematic_review',
    'meta_analysis',
    'consensus_statement',
  ],
  external_scientific: [
    'primary_study',
    'secondary_scholarship',
    'systematic_review',
    'meta_analysis',
    'consensus_statement',
  ],
  external_historical_tradition: ['traditional_text', 'secondary_scholarship'],
  external_web_general: ['web_reference'],
};

const SOURCE_STANDINGS: Record<T4SourceClass, readonly EpistemicStanding[]> = {
  soullab_canon: ['canonical'],
  soullab_research: ['research_hypothesis'],
  governed_library: ['governed_reference', 'canonical', 'research_hypothesis'],
  practitioner_material: ['practitioner_authored', 'governed_reference'],
  external_academic: ['peer_reviewed_evidence'],
  external_scientific: ['scientific_reference', 'peer_reviewed_evidence'],
  external_historical_tradition: ['historical_or_traditional'],
  external_web_general: ['current_web_reference'],
};

const CONSENSUS_FORMS = new Set<SourceForm>([
  'systematic_review',
  'meta_analysis',
  'consensus_statement',
]);

function fail(message: string): never {
  throw new Error('research/citation/provenance contract: ' + message);
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function onlyKeys(rec: Record<string, unknown>, allowed: ReadonlySet<string>, where: string): void {
  for (const key of Object.keys(rec)) if (!allowed.has(key)) fail(where + ' contains non-contract key: ' + key);
}
function oneOf<T extends readonly string[]>(list: T, value: unknown): value is T[number] {
  return typeof value === 'string' && list.includes(value);
}
function nonEmpty(value: unknown, where: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) fail(where + ' must be a non-empty string');
}
function nullableString(value: unknown, where: string): void {
  if (value !== null && (typeof value !== 'string' || value.length === 0)) {
    fail(where + ' must be null or a non-empty string');
  }
}
function isoDateOrNull(value: string | null, where: string): void {
  if (value === null) return;
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?Z)?$/.test(value)) {
    fail(where + ' must be an ISO date/date-time');
  }
}
function assertPlan(plan: KnowledgeAcquisitionPlan): void {
  if (plan.contractVersion !== 'kro-1') fail('plan must be kro-1');
  if (plan.executionStanding !== 'NON_EXECUTING_PROPOSAL') fail('plan must remain non-executing');
  for (const key of [
    'mayRetrieve',
    'mayBrowse',
    'mayCallModel',
    'mayTeach',
    'mayExecute',
    'mayMutatePrompt',
    'mayPersistLearnerState',
  ] as const) {
    if (plan[key] !== false) fail('plan must preserve false authority flag: ' + key);
  }
}

function assertSourceIdentity(value: unknown): asserts value is SourceIdentityInput {
  if (!isRecord(value)) fail('source must be an object');
  onlyKeys(value, SOURCE_KEYS, 'source');
  nonEmpty(value.sourceId, 'source.sourceId');
  nonEmpty(value.title, 'source.title');
  nonEmpty(value.authorshipKey, 'source.authorshipKey');
  if (!Array.isArray(value.authors) || value.authors.some((a) => typeof a !== 'string' || !a)) {
    fail('source.authors must contain non-empty strings');
  }
  nullableString(value.institutionOrPublisher, 'source.institutionOrPublisher');
  nullableString(value.publicationOrRevisionDate, 'source.publicationOrRevisionDate');
  nullableString(value.revision, 'source.revision');
  nullableString(value.edition, 'source.edition');
  nullableString(value.canonicalSha, 'source.canonicalSha');
  nullableString(value.doi, 'source.doi');
  nullableString(value.stableLocator, 'source.stableLocator');
  nullableString(value.governedFilePath, 'source.governedFilePath');
  nullableString(value.governedChecksum, 'source.governedChecksum');
  nullableString(value.accessedAt, 'source.accessedAt');
  nonEmpty(value.underlyingSourceKey, 'source.underlyingSourceKey');
  if (typeof value.independentlyReopenable !== 'boolean') fail('source.independentlyReopenable must be boolean');
  isoDateOrNull(value.publicationOrRevisionDate as string | null, 'source.publicationOrRevisionDate');
  isoDateOrNull(value.accessedAt as string | null, 'source.accessedAt');
  if (typeof value.canonicalSha === 'string' && !/^[0-9a-f]{40}$/.test(value.canonicalSha)) {
    fail('source.canonicalSha must be a 40-character lowercase git SHA');
  }
  if (typeof value.governedChecksum === 'string' && !/^[0-9a-f]{64}$/.test(value.governedChecksum)) {
    fail('source.governedChecksum must be a SHA-256 hex digest');
  }
}

function assertCitation(value: unknown): asserts value is CitationInput {
  if (!isRecord(value)) fail('citation must be an object');
  onlyKeys(value, CITATION_KEYS, 'citation');
  if (typeof value.citationPresent !== 'boolean') fail('citation.citationPresent must be boolean');
  nullableString(value.stableCitationLocator, 'citation.stableCitationLocator');
  nullableString(value.pinpointLocator, 'citation.pinpointLocator');
  nullableString(value.renderableCitation, 'citation.renderableCitation');
  if (typeof value.citedSourceSupportsClaim !== 'boolean') fail('citation.citedSourceSupportsClaim must be boolean');
  if (!value.citationPresent && (value.stableCitationLocator || value.renderableCitation || value.pinpointLocator)) {
    fail('citation locators may not be present when citationPresent is false');
  }
}

function assertProvenance(value: unknown): asserts value is ProvenanceInput {
  if (!isRecord(value)) fail('provenance must be an object');
  onlyKeys(value, PROVENANCE_KEYS, 'provenance');
  const adapters: readonly RetrievalAdapterClass[] = [
    'soullab_canon_resolver',
    'soullab_research_resolver',
    'governed_library_path_checksum',
    'practitioner_scoped_material',
    'academic_source_adapter',
    'scientific_source_adapter',
    'historical_tradition_adapter',
    'current_web_adapter',
  ];
  const authorities: readonly AuthorityRequirement[] = [
    'governed_repository_authority',
    'global_library_path_checksum_authority',
    'practitioner_scope_authority',
    'external_provenance_authority',
    'current_web_provenance_authority',
  ];
  if (!oneOf(adapters, value.acquisitionAdapterClass)) fail('provenance acquisition adapter is invalid');
  if (!oneOf(authorities, value.authorityRequirement)) fail('provenance authority requirement is invalid');
  nullableString(value.authorityProof, 'provenance.authorityProof');
  nullableString(value.custodyProof, 'provenance.custodyProof');
  if (!Array.isArray(value.transformations)) fail('provenance.transformations must be an array');
  if (new Set(value.transformations).size !== value.transformations.length) fail('transformations must be unique');
  for (const t of value.transformations) if (!oneOf(TRANSFORMATION_TYPES, t)) fail('transformation is invalid');
  if (!oneOf(EXPRESSION_STANDINGS, value.expressionStanding)) fail('expressionStanding is invalid');
  if (typeof value.peerReviewed !== 'boolean') fail('peerReviewed must be boolean');
  if (!oneOf(RELIABILITY_STANDINGS, value.reliabilityStanding)) fail('reliabilityStanding is invalid');
}

function validateSourceIdentityForClass(sourceClass: T4SourceClass, source: SourceIdentityInput): void {
  if (sourceClass === 'soullab_canon' || sourceClass === 'soullab_research') {
    if (!source.canonicalSha || !source.stableLocator) fail(sourceClass + ' requires canonicalSha and stableLocator');
  }
  if (sourceClass === 'governed_library') {
    if (!source.governedFilePath || !source.governedChecksum) {
      fail('governed_library requires governedFilePath and governedChecksum');
    }
  }
  if (sourceClass === 'practitioner_material') {
    if (source.authors.length === 0 && !source.institutionOrPublisher) {
      fail('practitioner_material requires author or institution identity');
    }
  }
  if (sourceClass === 'external_academic' || sourceClass === 'external_scientific') {
    if (source.authors.length === 0 || !source.publicationOrRevisionDate || (!source.doi && !source.stableLocator)) {
      fail(sourceClass + ' requires authors, publication date, and DOI or stable locator');
    }
  }
  if (sourceClass === 'external_historical_tradition') {
    if (!source.stableLocator || (!source.edition && !source.revision)) {
      fail('historical/traditional source requires stable locator and edition or revision');
    }
  }
  if (sourceClass === 'external_web_general') {
    if (!source.stableLocator || !source.accessedAt || (!source.institutionOrPublisher && source.authors.length === 0)) {
      fail('current web source requires stable locator, access date, and author or institution');
    }
  }
}

function validateExpression(input: TeachingEvidenceInput): void {
  const { expressionStanding, transformations } = input.provenance;
  if (expressionStanding === 'exact_quotation') {
    if (!input.citation.citationPresent || !input.citation.pinpointLocator) {
      fail('exact quotation requires a present citation and pinpoint locator');
    }
    if (transformations.some((t) => ['translation', 'summarization', 'paraphrase', 'model_assisted_transformation'].includes(t))) {
      fail('exact quotation may not contain semantic transformation');
    }
  }
  if (expressionStanding === 'source_faithful_paraphrase' && !transformations.includes('paraphrase')) {
    fail('source-faithful paraphrase must disclose paraphrase transformation');
  }
  if (expressionStanding === 'maia_paraphrase') {
    if (!transformations.includes('paraphrase') || !transformations.includes('model_assisted_transformation')) {
      fail('MAIA paraphrase must disclose paraphrase + model-assisted transformation');
    }
  }
  if (expressionStanding === 'maia_synthesis') {
    if (input.claimRelation === 'SUPPORTS') fail('MAIA synthesis may not independently serve as source support');
    if (!transformations.includes('model_assisted_transformation')) {
      fail('MAIA synthesis must disclose model-assisted transformation');
    }
  }
}

function auditability(source: SourceIdentityInput, provenance: ProvenanceInput): AuditabilityStanding {
  const identity = Boolean(
    source.canonicalSha
    || source.doi
    || source.governedChecksum
    || source.stableLocator
  );
  const custody = Boolean(provenance.custodyProof || provenance.authorityProof);
  if (identity && custody && source.independentlyReopenable) return 'auditable';
  if (identity) return 'partially_auditable';
  return 'unauditable';
}

function sourceEvidenceStanding(expression: ExpressionStanding): TeachingEvidenceRecord['sourceEvidenceStanding'] {
  if (expression === 'exact_quotation') return 'DIRECT_SOURCE';
  if (expression === 'maia_synthesis') return 'NON_SOURCE_SYNTHESIS';
  return 'DERIVED_SOURCE';
}

function freshnessMeets(required: string, actual: FreshnessStanding): boolean {
  if (required === 'durable') return ['durable', 'current_revision', 'recent_scholarly', 'current_web'].includes(actual);
  return required === actual;
}

function eligible(
  input: TeachingEvidenceInput,
  audit: AuditabilityStanding,
  citationRequired: boolean,
  freshnessRequired: string,
): boolean {
  if (input.provenance.expressionStanding === 'maia_synthesis') return false;
  if (input.claimRelation !== 'SUPPORTS') return false;
  if (input.provenance.reliabilityStanding !== 'verified_for_claim') return false;
  if (audit === 'unauditable') return false;
  if (!input.provenance.authorityProof || !input.provenance.custodyProof) return false;
  if (!freshnessMeets(freshnessRequired, input.freshnessStanding)) return false;
  if (citationRequired && (!input.citation.citationPresent || !input.citation.citedSourceSupportsClaim)) return false;
  return true;
}

export function buildTeachingEvidenceRecord(
  plan: KnowledgeAcquisitionPlan,
  value: TeachingEvidenceInput,
): TeachingEvidenceRecord {
  assertPlan(plan);
  if (!isRecord(value)) fail('evidence input must be an object');
  onlyKeys(value, INPUT_KEYS, 'evidence input');
  nonEmpty(value.evidenceId, 'evidenceId');
  nonEmpty(value.knowledgeNeedId, 'knowledgeNeedId');
  nonEmpty(value.sourceRequestId, 'sourceRequestId');
  if (!oneOf([
    'soullab_canon',
    'soullab_research',
    'governed_library',
    'practitioner_material',
    'external_academic',
    'external_scientific',
    'external_historical_tradition',
    'external_web_general',
  ] as const, value.sourceClass)) fail('sourceClass is invalid');
  if (!SOURCE_STANDINGS[value.sourceClass].includes(value.standing)) {
    fail('source class cannot claim standing ' + value.standing);
  }
  if (!SOURCE_FORMS_BY_CLASS[value.sourceClass].includes(value.sourceForm)) {
    fail('source form ' + value.sourceForm + ' is invalid for ' + value.sourceClass);
  }
  if (!Array.isArray(value.evidenceRoles)) fail('evidenceRoles must be an array');
  for (const role of value.evidenceRoles) {
    if (!oneOf(EVIDENCE_ROLES, role)) fail('evidence role is invalid');
  }
  assertSourceIdentity(value.source);
  assertCitation(value.citation);
  assertProvenance(value.provenance);
  if (!oneOf([
    'durable',
    'current_revision',
    'recent_scholarly',
    'current_web',
    'stale',
    'unknown',
  ] as const, value.freshnessStanding)) fail('freshnessStanding is invalid');
  if (!oneOf(CLAIM_EVIDENCE_RELATIONS, value.claimRelation)) fail('claimRelation is invalid');

  const need = plan.knowledgeNeeds.find((n) => n.needId === value.knowledgeNeedId);
  if (!need) fail('knowledge need does not exist in T4 plan');
  const request = plan.sourceRequests.find((r) => r.requestId === value.sourceRequestId);
  if (!request) fail('source request does not exist in T4 plan');
  if (request.knowledgeNeedId !== need.needId) fail('source request is not bound to this knowledge need');
  if (request.requestedSourceClass !== value.sourceClass) fail('source class does not match exact T4 source request');
  if (!request.requiredEpistemicStandings.includes(value.standing)) fail('standing does not satisfy exact T4 source request');
  if (request.retrievalAdapterClass !== value.provenance.acquisitionAdapterClass) fail('acquisition adapter does not match T4 request');
  if (request.authorityRequirement !== value.provenance.authorityRequirement) fail('authority requirement does not match T4 request');

  validateSourceIdentityForClass(value.sourceClass, value.source);
  validateExpression(value);

  if (need.citationRequired && !value.citation.citationPresent) fail('T4/T2 requires a citation for this claim');
  if (value.citation.citationPresent && (!value.citation.stableCitationLocator || !value.citation.renderableCitation)) {
    fail('present citation requires stable locator and renderable citation');
  }
  if (value.citation.citedSourceSupportsClaim && value.claimRelation !== 'SUPPORTS') {
    fail('citation cannot claim support when evidence relation is not SUPPORTS');
  }
  if (value.claimRelation === 'SUPPORTS' && value.citation.citationPresent && !value.citation.citedSourceSupportsClaim) {
    fail('citation present is not equivalent to claim support');
  }

  if (value.evidenceRoles.includes('canonical_authority') && value.standing !== 'canonical') fail('canonical_authority requires canonical standing');
  if (value.evidenceRoles.includes('peer_reviewed_scientific')) {
    if (!value.provenance.peerReviewed || !['peer_reviewed_evidence', 'scientific_reference'].includes(value.standing)) {
      fail('peer_reviewed_scientific requires peer-reviewed academic/scientific standing');
    }
  }
  if (value.evidenceRoles.includes('historical_traditional') && value.standing !== 'historical_or_traditional') fail('historical_traditional requires historical/traditional standing');
  if (value.evidenceRoles.includes('current_web') && value.standing !== 'current_web_reference') fail('current_web requires current_web_reference standing');

  const consensusCapable = CONSENSUS_FORMS.has(value.sourceForm);
  const claimsConsensusRole = value.evidenceRoles.includes('consensus_review');
  if (claimsConsensusRole && !consensusCapable) fail('consensus_review role requires consensus-capable source form');
  if (value.provenance.peerReviewed && value.sourceForm === 'web_reference') fail('web reference may not claim peer-reviewed standing');

  const audit = auditability(value.source, value.provenance);
  const consensusStanding = claimsConsensusRole
    ? (value.claimRelation === 'SUPPORTS' && value.citation.citedSourceSupportsClaim
      ? 'supports_consensus_claim'
      : 'eligible_source_form')
    : 'not_claimed';

  return {
    contractVersion: RESEARCH_CITATION_PROVENANCE_VERSION,
    evidenceId: value.evidenceId,
    knowledgeNeedId: need.needId,
    sourceRequestId: request.requestId,
    teachingStepId: need.stepId,
    claimClass: need.claimClass,
    sourceClass: value.sourceClass,
    standing: value.standing,
    sourceForm: value.sourceForm,
    evidenceRoles: [...value.evidenceRoles],
    source: {
      ...value.source,
      authors: [...value.source.authors],
    },
    citation: {
      ...value.citation,
      citationRequired: need.citationRequired,
    },
    provenance: {
      ...value.provenance,
      transformations: [...value.provenance.transformations],
      sourceAuthorityInheritedByTransformation: false,
      provenanceChain: ['SOURCE', 'ACQUISITION', 'EVIDENCE_RECORD', 'TEACHING_CLAIM'],
    },
    freshnessStanding: value.freshnessStanding,
    freshnessRequirement: need.freshnessRequirement,
    freshnessMeetsRequirement: freshnessMeets(need.freshnessRequirement, value.freshnessStanding),
    claimRelation: value.claimRelation,
    auditability: audit,
    consensusCapableSourceForm: consensusCapable,
    consensusEvidenceStanding: consensusStanding,
    independentIdentity: {
      authorshipKey: value.source.authorshipKey,
      underlyingSourceKey: value.source.underlyingSourceKey,
    },
    sourceEvidenceStanding: sourceEvidenceStanding(value.provenance.expressionStanding),
    eligibleForLaterTeachingConsideration: eligible(value, audit, need.citationRequired, need.freshnessRequirement),
    authorityEffect: 'DESCRIPTIVE_PROVENANCE_RECORD_ONLY',
    executionStanding: 'NON_EXECUTING_PROPOSAL',
    mayRetrieve: false,
    mayBrowse: false,
    mayDownloadSource: false,
    mayCallModel: false,
    mayTeach: false,
    mayExecute: false,
    mayMutatePrompt: false,
    mayPersistLearnerState: false,
  };
}

export function assessEvidenceSet(
  plan: KnowledgeAcquisitionPlan,
  knowledgeNeedId: string,
  records: readonly TeachingEvidenceRecord[],
): EvidenceSetAssessment {
  assertPlan(plan);
  nonEmpty(knowledgeNeedId, 'knowledgeNeedId');
  const need = plan.knowledgeNeeds.find((n) => n.needId === knowledgeNeedId);
  if (!need) fail('knowledge need does not exist in T4 plan');

  const evidence = records.filter((r) => r.knowledgeNeedId === knowledgeNeedId);
  if (evidence.some((r) => r.contractVersion !== 'rcp-1')) fail('all evidence records must be rcp-1');
  const ids = evidence.map((r) => r.evidenceId);
  if (new Set(ids).size !== ids.length) fail('evidence IDs must be unique');

  const supporting = evidence.filter((r) => r.claimRelation === 'SUPPORTS');
  const contradicting = evidence.filter((r) => r.claimRelation === 'CONTRADICTS');
  const neutral = evidence.filter((r) => r.claimRelation === 'NEUTRAL');
  const insufficient = evidence.filter((r) => r.claimRelation === 'INSUFFICIENT_TO_DETERMINE');
  const independentlyEligible = supporting.filter((r) => r.eligibleForLaterTeachingConsideration);
  const sourceKeys = new Set(independentlyEligible.map((r) => r.independentIdentity.underlyingSourceKey));
  const authorships = new Set(independentlyEligible.map((r) => r.independentIdentity.authorshipKey));
  const independentCount = Math.min(sourceKeys.size, authorships.size);
  const hasConsensus = independentlyEligible.some((r) => r.consensusEvidenceStanding === 'supports_consensus_claim');

  const reasons: string[] = [];
  let standing: EvidenceSetStanding;

  if (contradicting.length > 0) {
    standing = 'CONFLICTING_EVIDENCE';
    reasons.push('contradictory evidence is preserved and may not be averaged away');
  } else if (independentlyEligible.length === 0) {
    standing = 'INSUFFICIENT_EVIDENCE';
    reasons.push('no eligible supporting evidence survives provenance requirements');
  } else if (need.evidenceRoles.includes('consensus_review')) {
    if (hasConsensus) {
      standing = 'CONSENSUS_EVIDENCE_PRESENT';
      reasons.push('consensus-capable evidence explicitly supports the exact claim');
    } else {
      standing = 'NO_CONSENSUS_EVIDENCE';
      reasons.push('ordinary studies or multiple records do not establish consensus');
    }
  } else if (independentCount < need.sourceDiversity.minimumIndependentSources) {
    standing = 'PARTIAL_SUPPORT';
    reasons.push('independent-source requirement is not satisfied');
  } else {
    standing = 'CONSISTENT_SUPPORT';
    reasons.push('eligible supporting evidence satisfies the independent-source requirement');
  }

  return {
    contractVersion: RESEARCH_CITATION_PROVENANCE_VERSION,
    knowledgeNeedId,
    evidenceIds: ids,
    supportingIds: supporting.map((r) => r.evidenceId),
    contradictingIds: contradicting.map((r) => r.evidenceId),
    neutralIds: neutral.map((r) => r.evidenceId),
    insufficientIds: insufficient.map((r) => r.evidenceId),
    independentSourceCount: sourceKeys.size,
    independentAuthorshipCount: authorships.size,
    hasConsensusCapableEvidence: hasConsensus,
    standing,
    reasons,
    preservedConflict: contradicting.length > 0,
    mayTeach: false,
    mayExecute: false,
  };
}
