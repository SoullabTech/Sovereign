/**
 * MAIA-TEACHING-INTELLIGENCE-01 / T4 — Knowledge & Retrieval Orchestration Contract (kro-1).
 *
 * Pure, deterministic, descriptive, and non-executing. T4 consumes an already-valid
 * T3 composition, binds one knowledge need to every substantive claim, produces a
 * governed acquisition plan, and can deterministically evaluate returned evidence.
 *
 * T4 does not retrieve, browse, call models/providers, mutate prompts, teach, persist
 * learner state, write manuscripts, diagnose, direct treatment/client action, create
 * schemas/migrations, deploy, or mutate production.
 */
import type { TeachingCompositionRecord, TeachingCompositionStepRecord } from './TeachingCompositionContract';
import type {
  EpistemicStanding,
  TeachingClaimClass,
  TeachingContext,
  TeachingDomain,
} from './TeachingContextSourceContract';

export const KNOWLEDGE_RETRIEVAL_ORCHESTRATION_VERSION = 'kro-1' as const;

export const T4_SOURCE_CLASSES = [
  'soullab_canon',
  'soullab_research',
  'governed_library',
  'practitioner_material',
  'external_academic',
  'external_scientific',
  'external_historical_tradition',
  'external_web_general',
] as const;
export type T4SourceClass = (typeof T4_SOURCE_CLASSES)[number];

export const FRESHNESS_REQUIREMENTS = ['durable', 'current_revision', 'recent_scholarly', 'current_web'] as const;
export type FreshnessRequirement = (typeof FRESHNESS_REQUIREMENTS)[number];
export const FRESHNESS_STANDINGS = ['durable', 'current_revision', 'recent_scholarly', 'current_web', 'stale', 'unknown'] as const;
export type FreshnessStanding = (typeof FRESHNESS_STANDINGS)[number];

export const EVIDENCE_ROLES = [
  'canonical_authority',
  'primary_source',
  'secondary_source',
  'peer_reviewed_scientific',
  'historical_traditional',
  'current_web',
  'independent_corroboration',
  'consensus_review',
] as const;
export type EvidenceRole = (typeof EVIDENCE_ROLES)[number];

export const INSUFFICIENCY_DISPOSITIONS = ['qualify', 'inquire', 'source_seeking_required', 'refrain'] as const;
export type InsufficiencyDisposition = (typeof INSUFFICIENCY_DISPOSITIONS)[number];

export const KNOWLEDGE_SATISFACTION_STATES = [
  'SATISFIED',
  'PARTIALLY_SUPPORTED',
  'CONTRADICTORY',
  'INSUFFICIENT',
  'UNAVAILABLE',
  'AUTHORITY_BLOCKED',
  'FRESHNESS_BLOCKED',
] as const;
export type KnowledgeSatisfactionState = (typeof KNOWLEDGE_SATISFACTION_STATES)[number];

export const SOURCE_FORMS = [
  'canonical_text',
  'governed_reference',
  'practitioner_authored',
  'primary_study',
  'secondary_scholarship',
  'systematic_review',
  'meta_analysis',
  'consensus_statement',
  'traditional_text',
  'web_reference',
] as const;
export type SourceForm = (typeof SOURCE_FORMS)[number];

export const AUTHORITY_STANDINGS = ['authorized', 'blocked', 'unknown'] as const;
export type SourceAuthorityStanding = (typeof AUTHORITY_STANDINGS)[number];
export const REPRESENTATION_STANDINGS = ['appropriate', 'not_appropriate', 'unknown'] as const;
export type RepresentationStanding = (typeof REPRESENTATION_STANDINGS)[number];
export const EVIDENCE_SUPPORT = ['supports', 'contradicts', 'neutral'] as const;
export type EvidenceSupport = (typeof EVIDENCE_SUPPORT)[number];

export type RetrievalAdapterClass =
  | 'soullab_canon_resolver'
  | 'soullab_research_resolver'
  | 'governed_library_path_checksum'
  | 'practitioner_scoped_material'
  | 'academic_source_adapter'
  | 'scientific_source_adapter'
  | 'historical_tradition_adapter'
  | 'current_web_adapter';

export type AuthorityRequirement =
  | 'governed_repository_authority'
  | 'global_library_path_checksum_authority'
  | 'practitioner_scope_authority'
  | 'external_provenance_authority'
  | 'current_web_provenance_authority';

export interface KnowledgeNeedInput {
  needId: string;
  stepId: string;
  requiredSourceClasses: readonly T4SourceClass[];
  requiredStandings: readonly EpistemicStanding[];
  freshnessRequirement: FreshnessRequirement;
  evidenceRoles: readonly EvidenceRole[];
  minimumIndependentSources: number;
  insufficiencyDisposition: InsufficiencyDisposition;
}

export interface KnowledgeOrchestrationInput {
  composition: TeachingCompositionRecord;
  needs: readonly KnowledgeNeedInput[];
}

export interface KnowledgeNeedRecord {
  needId: string;
  stepId: string;
  teachingContext: TeachingContext;
  teachingDomainKey: string;
  teachingDomain: TeachingDomain;
  claimClass: TeachingClaimClass;
  statementLayer: TeachingCompositionStepRecord['statementLayer'];
  capableSourceClasses: readonly T4SourceClass[];
  requiredEpistemicStandings: readonly EpistemicStanding[];
  citationRequired: boolean;
  freshnessRequirement: FreshnessRequirement;
  sourceDiversity: {
    minimumIndependentSources: number;
    independentAuthorshipRequired: boolean;
  };
  evidenceRoles: readonly EvidenceRole[];
  insufficiencyDisposition: InsufficiencyDisposition;
}

export interface SourceAcquisitionRequest {
  requestId: string;
  knowledgeNeedId: string;
  requestedSourceClass: T4SourceClass;
  requiredEpistemicStandings: readonly EpistemicStanding[];
  targetDomain: TeachingDomain;
  freshnessRequirement: FreshnessRequirement;
  citationRequired: boolean;
  authorityRequirement: AuthorityRequirement;
  retrievalAdapterClass: RetrievalAdapterClass;
  requiredEvidenceRoles: readonly EvidenceRole[];
  minimumIndependentSources: number;
  failureDisposition: InsufficiencyDisposition;
}

export interface KnowledgeAcquisitionPlan {
  contractVersion: typeof KNOWLEDGE_RETRIEVAL_ORCHESTRATION_VERSION;
  teachingContractVersion: 'tcomp-1';
  teacherIdentity: 'MAIA_SHARED_TEACHER';
  knowledgeNeeds: readonly KnowledgeNeedRecord[];
  sourceRequests: readonly SourceAcquisitionRequest[];
  governingLaws: readonly string[];
  authorityEffect: 'DESCRIPTIVE_ACQUISITION_PLAN_ONLY';
  executionStanding: 'NON_EXECUTING_PROPOSAL';
  mayRetrieve: false;
  mayBrowse: false;
  mayCallModel: false;
  mayTeach: false;
  mayExecute: false;
  mayMutatePrompt: false;
  mayPersistLearnerState: false;
  mayWriteManuscript: false;
  mayDiagnose: false;
  mayDirectTreatment: false;
  mayDirectClientAction: false;
  mayAutonomouslyAct: false;
}

export interface RetrievalSignals {
  stored: boolean;
  indexed: boolean;
  embedded: boolean;
  retrievable: boolean;
  retrieved: boolean;
  similarity?: number;
  domainMatch?: boolean;
  categoryMatch?: boolean;
  retrievalCount?: number;
  legacyRetrievalService: boolean;
}

export interface KnowledgeEvidenceCandidate {
  evidenceId: string;
  knowledgeNeedId: string;
  sourceId: string;
  sourceClass: T4SourceClass;
  standing: EpistemicStanding;
  sourceForm: SourceForm;
  authorshipKey: string;
  revisionOrLocator: string;
  citationAvailable: boolean;
  freshnessStanding: FreshnessStanding;
  authorityStanding: SourceAuthorityStanding;
  representationStanding: RepresentationStanding;
  support: EvidenceSupport;
  evidenceRoles: readonly EvidenceRole[];
  retrievalSignals: RetrievalSignals;
}

export interface KnowledgeSatisfactionRecord {
  knowledgeNeedId: string;
  state: KnowledgeSatisfactionState;
  evidenceConsideredIds: readonly string[];
  evidenceUsedIds: readonly string[];
  reasons: readonly string[];
  insufficiencyDisposition: InsufficiencyDisposition;
}

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

const ROUTES: Record<T4SourceClass, { adapter: RetrievalAdapterClass; authority: AuthorityRequirement }> = {
  soullab_canon: { adapter: 'soullab_canon_resolver', authority: 'governed_repository_authority' },
  soullab_research: { adapter: 'soullab_research_resolver', authority: 'governed_repository_authority' },
  governed_library: { adapter: 'governed_library_path_checksum', authority: 'global_library_path_checksum_authority' },
  practitioner_material: { adapter: 'practitioner_scoped_material', authority: 'practitioner_scope_authority' },
  external_academic: { adapter: 'academic_source_adapter', authority: 'external_provenance_authority' },
  external_scientific: { adapter: 'scientific_source_adapter', authority: 'external_provenance_authority' },
  external_historical_tradition: { adapter: 'historical_tradition_adapter', authority: 'external_provenance_authority' },
  external_web_general: { adapter: 'current_web_adapter', authority: 'current_web_provenance_authority' },
};

const INPUT_KEYS = new Set(['composition', 'needs']);
const NEED_KEYS = new Set([
  'needId', 'stepId', 'requiredSourceClasses', 'requiredStandings',
  'freshnessRequirement', 'evidenceRoles', 'minimumIndependentSources', 'insufficiencyDisposition',
]);

function fail(message: string): never {
  throw new Error('knowledge/retrieval orchestration contract: ' + message);
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
  if (typeof value !== 'string' || !value) fail(where + ' must be a non-empty string');
}
function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function assertT3(value: unknown): asserts value is TeachingCompositionRecord {
  if (!isRecord(value)) fail('composition must be a T3 record');
  if (value.contractVersion !== 'tcomp-1') fail('composition must be tcomp-1');
  if (value.teacherIdentity !== 'MAIA_SHARED_TEACHER') fail('composition teacher identity is invalid');
  if (value.authorityEffect !== 'DESCRIPTIVE_COMPOSITION_ONLY') fail('composition authority effect is invalid');
  if (value.executionStanding !== 'NON_EXECUTING_PROPOSAL') fail('composition execution standing is invalid');
  for (const key of [
    'mayTeach', 'mayExecute', 'mayCallModel', 'mayRetrieve', 'mayBrowse', 'mayMutatePrompt',
    'mayPersistLearnerState', 'mayWriteManuscript', 'mayDiagnose', 'mayDirectTreatment',
    'mayDirectClientAction', 'mayAutonomouslyAct',
  ]) {
    if (value[key] !== false) fail('composition must preserve T3 false authority flag: ' + key);
  }
  if (!Array.isArray(value.steps)) fail('composition.steps must be an array');
}

function assertNeed(value: unknown): asserts value is KnowledgeNeedInput {
  if (!isRecord(value)) fail('knowledge need must be an object');
  onlyKeys(value, NEED_KEYS, 'knowledge need');
  nonEmpty(value.needId, 'knowledge need.needId');
  nonEmpty(value.stepId, 'knowledge need.stepId');
  if (!Array.isArray(value.requiredSourceClasses) || !value.requiredSourceClasses.length) fail('knowledge need requires source classes');
  if (new Set(value.requiredSourceClasses).size !== value.requiredSourceClasses.length) fail('knowledge need source classes must be unique');
  for (const sourceClass of value.requiredSourceClasses) {
    if (!oneOf(T4_SOURCE_CLASSES, sourceClass)) fail('knowledge need source class is invalid or non-retrievable');
  }
  if (!Array.isArray(value.requiredStandings) || !value.requiredStandings.length) fail('knowledge need requires standings');
  if (new Set(value.requiredStandings).size !== value.requiredStandings.length) fail('knowledge need standings must be unique');
  const allowedStandings: readonly EpistemicStanding[] = [
    'canonical', 'research_hypothesis', 'governed_reference', 'practitioner_authored',
    'peer_reviewed_evidence', 'scientific_reference', 'historical_or_traditional', 'current_web_reference',
  ];
  for (const standing of value.requiredStandings) if (!allowedStandings.includes(standing as EpistemicStanding)) fail('knowledge need standing is invalid or MAIA synthesis');
  if (!oneOf(FRESHNESS_REQUIREMENTS, value.freshnessRequirement)) fail('knowledge need freshness is invalid');
  if (!Array.isArray(value.evidenceRoles) || !value.evidenceRoles.length) fail('knowledge need requires evidence roles');
  for (const role of value.evidenceRoles) if (!oneOf(EVIDENCE_ROLES, role)) fail('knowledge need evidence role is invalid');
  if (!Number.isInteger(value.minimumIndependentSources) || value.minimumIndependentSources < 1 || value.minimumIndependentSources > 8) {
    fail('minimumIndependentSources must be an integer from 1 to 8');
  }
  if (!oneOf(INSUFFICIENCY_DISPOSITIONS, value.insufficiencyDisposition)) fail('knowledge need insufficiency disposition is invalid');
}

function validateNeed(step: TeachingCompositionStepRecord, need: KnowledgeNeedInput): void {
  for (const sourceClass of need.requiredSourceClasses) {
    if (!need.requiredStandings.some((standing) => SOURCE_STANDINGS[sourceClass].includes(standing))) {
      fail('source class ' + sourceClass + ' cannot satisfy any required standing');
    }
  }
  for (const standing of need.requiredStandings) {
    if (!need.requiredSourceClasses.some((sourceClass) => SOURCE_STANDINGS[sourceClass].includes(standing))) {
      fail('required standing ' + standing + ' has no capable source class');
    }
  }
  const claim = step.claimClass as TeachingClaimClass;
  if (claim === 'canonical_statement' && !need.requiredStandings.includes('canonical')) fail('canonical_statement requires canonical standing');
  if (claim === 'research_hypothesis' && !need.requiredStandings.includes('research_hypothesis')) fail('research_hypothesis requires research_hypothesis standing');
  if (claim === 'evidence_summary' && !need.requiredStandings.some((s) => s === 'peer_reviewed_evidence' || s === 'scientific_reference')) {
    fail('evidence_summary requires academic/scientific standing');
  }
  if (claim === 'tradition_description' && !need.requiredStandings.includes('historical_or_traditional')) fail('tradition_description requires historical/traditional standing');
  if (claim === 'comparative_synthesis' && need.minimumIndependentSources < 2) fail('comparative_synthesis requires at least two independent sources');
  if (need.freshnessRequirement === 'recent_scholarly' && !need.requiredSourceClasses.some((s) => s === 'external_academic' || s === 'external_scientific')) {
    fail('recent_scholarly freshness requires academic/scientific source class');
  }
  if (need.freshnessRequirement === 'current_web') {
    if (!need.requiredSourceClasses.includes('external_web_general')) fail('current_web freshness requires external_web_general');
    if (!need.requiredStandings.includes('current_web_reference')) fail('current_web freshness requires current_web_reference standing');
  }
  for (const role of need.evidenceRoles) {
    if (role === 'canonical_authority' && !need.requiredStandings.includes('canonical')) fail('canonical_authority requires canonical standing');
    if (role === 'peer_reviewed_scientific' && !need.requiredStandings.some((s) => s === 'peer_reviewed_evidence' || s === 'scientific_reference')) {
      fail('peer_reviewed_scientific requires academic/scientific standing');
    }
    if (role === 'historical_traditional' && !need.requiredStandings.includes('historical_or_traditional')) fail('historical_traditional requires historical/traditional standing');
    if (role === 'current_web' && !need.requiredStandings.includes('current_web_reference')) fail('current_web role requires current_web_reference standing');
    if (role === 'independent_corroboration' && need.minimumIndependentSources < 2) fail('independent_corroboration requires at least two independent sources');
    if (role === 'consensus_review' && claim !== 'evidence_summary') fail('consensus_review is only valid for evidence_summary');
  }
}

export function assertKnowledgeOrchestrationInput(value: unknown): asserts value is KnowledgeOrchestrationInput {
  if (!isRecord(value)) fail('input must be an object');
  onlyKeys(value, INPUT_KEYS, 'input');
  assertT3(value.composition);
  if (!Array.isArray(value.needs)) fail('needs must be an array');
  const steps = value.composition.steps.filter((step) => step.claimClass !== 'no_claim');
  if (steps.length !== value.needs.length) fail('exactly one knowledge need is required for every substantive T3 claim');
  const stepById = new Map(steps.map((step) => [step.stepId, step] as const));
  const needIds = new Set<string>();
  const boundSteps = new Set<string>();
  for (const need of value.needs) {
    assertNeed(need);
    if (needIds.has(need.needId)) fail('duplicate knowledge need id: ' + need.needId);
    if (boundSteps.has(need.stepId)) fail('multiple knowledge needs bound to T3 step ' + need.stepId);
    needIds.add(need.needId);
    boundSteps.add(need.stepId);
    const step = stepById.get(need.stepId);
    if (!step) fail('knowledge need must bind to an exact substantive T3 step: ' + need.stepId);
    validateNeed(step, need);
  }
}

function needRecord(composition: TeachingCompositionRecord, step: TeachingCompositionStepRecord, need: KnowledgeNeedInput): KnowledgeNeedRecord {
  if (!step.t2) fail('substantive T3 step must carry T2 standing');
  return {
    needId: need.needId,
    stepId: step.stepId,
    teachingContext: composition.context,
    teachingDomainKey: composition.domain.domainKey,
    teachingDomain: composition.domain.t2Domain,
    claimClass: step.claimClass as TeachingClaimClass,
    statementLayer: step.statementLayer,
    capableSourceClasses: [...need.requiredSourceClasses],
    requiredEpistemicStandings: [...need.requiredStandings],
    citationRequired: step.t2.citationRequired,
    freshnessRequirement: need.freshnessRequirement,
    sourceDiversity: {
      minimumIndependentSources: need.minimumIndependentSources,
      independentAuthorshipRequired: need.minimumIndependentSources > 1,
    },
    evidenceRoles: [...need.evidenceRoles],
    insufficiencyDisposition: need.insufficiencyDisposition,
  };
}

export function planKnowledgeAcquisition(value: KnowledgeOrchestrationInput): KnowledgeAcquisitionPlan {
  assertKnowledgeOrchestrationInput(value);
  const stepById = new Map(value.composition.steps.map((step) => [step.stepId, step] as const));
  const knowledgeNeeds = value.needs.map((need) => needRecord(value.composition, stepById.get(need.stepId)!, need));
  const sourceRequests = knowledgeNeeds.flatMap((need) => need.capableSourceClasses.map((sourceClass): SourceAcquisitionRequest => {
    const route = ROUTES[sourceClass];
    return {
      requestId: need.needId + ':' + sourceClass,
      knowledgeNeedId: need.needId,
      requestedSourceClass: sourceClass,
      requiredEpistemicStandings: need.requiredEpistemicStandings.filter((standing) => SOURCE_STANDINGS[sourceClass].includes(standing)),
      targetDomain: need.teachingDomain,
      freshnessRequirement: need.freshnessRequirement,
      citationRequired: need.citationRequired,
      authorityRequirement: route.authority,
      retrievalAdapterClass: route.adapter,
      requiredEvidenceRoles: [...need.evidenceRoles],
      minimumIndependentSources: need.sourceDiversity.minimumIndependentSources,
      failureDisposition: need.insufficiencyDisposition,
    };
  }));
  return {
    contractVersion: KNOWLEDGE_RETRIEVAL_ORCHESTRATION_VERSION,
    teachingContractVersion: 'tcomp-1',
    teacherIdentity: 'MAIA_SHARED_TEACHER',
    knowledgeNeeds,
    sourceRequests,
    governingLaws: [
      'AUTHORIZED_NE_INGESTED_NE_RETRIEVABLE_NE_RETRIEVED_NE_APPROPRIATE_TO_REPRESENT',
      'CO_PRESENCE_NE_CORROBORATION',
      'MULTIPLE_RETRIEVED_SOURCES_NE_CONSENSUS',
      'LEGACY_RETRIEVAL_NE_TEACHING_AUTHORITY',
    ],
    authorityEffect: 'DESCRIPTIVE_ACQUISITION_PLAN_ONLY',
    executionStanding: 'NON_EXECUTING_PROPOSAL',
    mayRetrieve: false,
    mayBrowse: false,
    mayCallModel: false,
    mayTeach: false,
    mayExecute: false,
    mayMutatePrompt: false,
    mayPersistLearnerState: false,
    mayWriteManuscript: false,
    mayDiagnose: false,
    mayDirectTreatment: false,
    mayDirectClientAction: false,
    mayAutonomouslyAct: false,
  };
}

function validEvidence(e: KnowledgeEvidenceCandidate): void {
  nonEmpty(e.evidenceId, 'evidenceId');
  nonEmpty(e.knowledgeNeedId, 'knowledgeNeedId');
  nonEmpty(e.sourceId, 'sourceId');
  if (!oneOf(T4_SOURCE_CLASSES, e.sourceClass)) fail('evidence sourceClass is invalid');
  if (!SOURCE_STANDINGS[e.sourceClass].includes(e.standing)) fail('evidence source class cannot claim standing ' + e.standing);
  if (!oneOf(SOURCE_FORMS, e.sourceForm)) fail('evidence sourceForm is invalid');
  nonEmpty(e.authorshipKey, 'authorshipKey');
  nonEmpty(e.revisionOrLocator, 'revisionOrLocator');
  if (!oneOf(FRESHNESS_STANDINGS, e.freshnessStanding)) fail('evidence freshness standing is invalid');
  if (!oneOf(AUTHORITY_STANDINGS, e.authorityStanding)) fail('evidence authority standing is invalid');
  if (!oneOf(REPRESENTATION_STANDINGS, e.representationStanding)) fail('evidence representation standing is invalid');
  if (!oneOf(EVIDENCE_SUPPORT, e.support)) fail('evidence support is invalid');
  for (const role of e.evidenceRoles) {
    if (!oneOf(EVIDENCE_ROLES, role)) fail('evidence role is invalid');
    if (role === 'canonical_authority' && e.standing !== 'canonical') fail('canonical_authority requires canonical standing');
    if (role === 'peer_reviewed_scientific' && e.standing !== 'peer_reviewed_evidence' && e.standing !== 'scientific_reference') fail('peer_reviewed_scientific requires academic/scientific standing');
    if (role === 'historical_traditional' && e.standing !== 'historical_or_traditional') fail('historical_traditional requires historical/traditional standing');
    if (role === 'current_web' && e.standing !== 'current_web_reference') fail('current_web requires current_web_reference standing');
    if (role === 'consensus_review' && !['systematic_review', 'meta_analysis', 'consensus_statement'].includes(e.sourceForm)) {
      fail('consensus_review requires a review, meta-analysis, or consensus statement');
    }
  }
  const r = e.retrievalSignals;
  if (r.similarity !== undefined && (r.similarity < 0 || r.similarity > 1)) fail('similarity must be from 0 to 1');
  if (r.retrievalCount !== undefined && (!Number.isInteger(r.retrievalCount) || r.retrievalCount < 0)) fail('retrievalCount must be non-negative');
}

function freshness(required: FreshnessRequirement, actual: FreshnessStanding): boolean {
  if (required === 'durable') return ['durable', 'current_revision', 'recent_scholarly', 'current_web'].includes(actual);
  return required === actual;
}

function authorityReady(e: KnowledgeEvidenceCandidate): boolean {
  return e.authorityStanding === 'authorized'
    && e.representationStanding === 'appropriate'
    && e.retrievalSignals.retrieved
    && !e.retrievalSignals.legacyRetrievalService;
}

export function evaluateKnowledgeSatisfaction(
  plan: KnowledgeAcquisitionPlan,
  evidence: readonly KnowledgeEvidenceCandidate[],
): readonly KnowledgeSatisfactionRecord[] {
  if (plan.contractVersion !== 'kro-1' || plan.mayRetrieve || plan.mayBrowse || plan.mayCallModel || plan.mayTeach) {
    fail('plan must remain kro-1 and non-executing');
  }
  const evidenceIds = new Set<string>();
  for (const item of evidence) {
    validEvidence(item);
    if (evidenceIds.has(item.evidenceId)) fail('duplicate evidence id: ' + item.evidenceId);
    evidenceIds.add(item.evidenceId);
    if (!plan.knowledgeNeeds.some((need) => need.needId === item.knowledgeNeedId)) fail('evidence references unknown knowledge need');
  }
  return plan.knowledgeNeeds.map((need) => {
    const all = evidence.filter((item) => item.knowledgeNeedId === need.needId);
    const considered = all.map((item) => item.evidenceId);
    const base = { knowledgeNeedId: need.needId, evidenceConsideredIds: considered, insufficiencyDisposition: need.insufficiencyDisposition };
    if (!all.length) return { ...base, state: 'UNAVAILABLE' as const, evidenceUsedIds: [], reasons: ['no evidence candidate returned'] };
    const matching = all.filter((item) =>
      need.capableSourceClasses.includes(item.sourceClass)
      && need.requiredEpistemicStandings.includes(item.standing)
    );
    if (!matching.length) return { ...base, state: 'INSUFFICIENT' as const, evidenceUsedIds: [], reasons: ['source class or epistemic standing does not satisfy need'] };
    const ready = matching.filter(authorityReady);
    if (!ready.length) {
      const legacy = matching.some((item) => item.retrievalSignals.legacyRetrievalService);
      const blocked = legacy || matching.some((item) => item.authorityStanding === 'blocked');
      return {
        ...base,
        state: blocked ? 'AUTHORITY_BLOCKED' as const : 'INSUFFICIENT' as const,
        evidenceUsedIds: [],
        reasons: [legacy ? 'legacy RetrievalService does not confer Teaching Intelligence authority' : 'authorized appropriate-to-represent standing is absent'],
      };
    }
    const fresh = ready.filter((item) => freshness(need.freshnessRequirement, item.freshnessStanding));
    if (!fresh.length) return { ...base, state: 'FRESHNESS_BLOCKED' as const, evidenceUsedIds: [], reasons: ['required freshness is absent'] };
    const citable = need.citationRequired ? fresh.filter((item) => item.citationAvailable) : fresh;
    const contradictory = citable.filter((item) => item.support === 'contradicts');
    if (contradictory.length) return {
      ...base,
      state: 'CONTRADICTORY' as const,
      evidenceUsedIds: contradictory.map((item) => item.evidenceId),
      reasons: ['authorized evidence contradicts the proposed teaching claim'],
    };
    const supporting = citable.filter((item) => item.support === 'supports');
    if (!supporting.length) return {
      ...base,
      state: 'INSUFFICIENT' as const,
      evidenceUsedIds: [],
      reasons: [need.citationRequired && fresh.some((item) => !item.citationAvailable)
        ? 'required citation/provenance is unavailable'
        : 'no authorized evidence supports the proposed teaching claim'],
    };
    const authors = new Set(supporting.map((item) => item.authorshipKey));
    const roles = new Set(supporting.flatMap((item) => item.evidenceRoles));
    const missingRoles = need.evidenceRoles.filter((role) => !roles.has(role));
    const diversityOk = authors.size >= need.sourceDiversity.minimumIndependentSources;
    if (!diversityOk || missingRoles.length) {
      const reasons: string[] = [];
      if (!diversityOk) reasons.push('independent-source requirement is not satisfied');
      if (missingRoles.length) reasons.push('required evidence roles missing: ' + missingRoles.join(', '));
      return {
        ...base,
        state: 'PARTIALLY_SUPPORTED' as const,
        evidenceUsedIds: supporting.map((item) => item.evidenceId),
        reasons,
      };
    }
    return {
      ...base,
      state: 'SATISFIED' as const,
      evidenceUsedIds: supporting.map((item) => item.evidenceId),
      reasons: ['authority, standing, freshness, citation, diversity, and evidence roles are satisfied'],
    };
  });
}
