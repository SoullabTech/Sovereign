import type { StandingEvidence } from '../../../scripts/research/structural-standing/standing-envelope';
import type { InterpretivePlan } from '../../../scripts/research/structural-standing/interpretive-basis-envelope';

export type { StandingEvidence } from '../../../scripts/research/structural-standing/standing-envelope';

export const RELATIONAL_FIELD_SHADOW_ARCHITECTURE_VERSION = 'rf-shadow-01@d899b3df6' as const;
export const PRIMARY_CAPTURE_STAGE = 'sovereign_list_pre_http_return' as const;

export type ShadowProcessingProfile = 'FAST' | 'CORE' | 'DEEP';
export type ShadowRunStatus = 'rendered' | 'refused' | 'error';

export type OrdinaryRelation =
  | 'DEFINITION'
  | 'STATUS'
  | 'AUTHORIZATION'
  | 'PROHIBITION'
  | 'REQUIREMENT'
  | 'CORRECTION'
  | 'CAUSAL'
  | 'QUALIFIER'
  | 'IMPLEMENTATION_DETAIL'
  | 'PARALLEL_STATUS'
  | 'HISTORY';

export type CurrentActRelation =
  | 'ANSWERS'
  | 'GOVERNS_CURRENT_ACT'
  | 'REQUIRES_FOR_CURRENT_ACT'
  | 'CORRECTS_CURRENT_ACT'
  | 'CAUSES_CURRENT_ACT'
  | 'QUALIFIES_CURRENT_ACT'
  | 'BACKGROUND';

export type MaterialityClass =
  | 'GOVERNS'
  | 'CORRECTS'
  | 'REQUIRED_FOR_VALIDITY'
  | 'CAUSALLY_MATERIAL'
  | 'QUALIFIES'
  | 'NON_MATERIAL';

export interface CurrentActProjectionCandidate {
  readonly evidenceId: string;
  readonly ordinaryRelation: OrdinaryRelation;
  readonly similarity: number;
  readonly entityOverlap: number;
  readonly relevant: boolean;
  readonly currentActRelation: CurrentActRelation;
  readonly materialityClass: MaterialityClass;
  readonly materialityStrength: number;
  readonly anchorPriority: number;
  readonly baselineScore: number;
  readonly materialityScore: number;
}

export interface CurrentActProjection {
  readonly architectureVersion: string;
  readonly researchLineage: {
    readonly h7jAcquisitionRuleSha256: string;
    readonly h7iR1SpecSha256: string;
    readonly ordinaryRelationProposalVersion: string;
    readonly semanticRelevanceVersion: string;
    readonly evidenceScope: 'current_session' | 'consented_cross_session';
  };
  readonly projectionStatus: 'projected' | 'no_direct_anchor' | 'no_prior_evidence';
  readonly currentEvidenceId: string;
  readonly anchorEvidenceId: string | null;
  readonly selectedEvidenceIds: readonly string[];
  readonly candidates: readonly CurrentActProjectionCandidate[];
  readonly projectionDigest: string;
}

export interface HistoricalMemberRow {
  readonly id: string;
  readonly exchangeId: string | null;
  readonly content: string;
  readonly createdAt: string;
  readonly sourceKind?: 'conversation_turn' | 'cross_session_turn';
}

export interface EvidenceManifestItem {
  readonly evidenceId: string;
  readonly sourceKind: 'current_request' | 'conversation_turn' | 'cross_session_turn';
  readonly sourceRowId: string | null;
  readonly exchangeId: string | null;
  readonly contentSha256: string;
  readonly createdAt: string | null;
  readonly current: boolean;
}

export interface RelationalFieldPacket {
  readonly evidence: readonly StandingEvidence[];
  readonly currentEvidenceId: string;
  readonly manifest: readonly EvidenceManifestItem[];
  readonly packetDigest: string;
}

export interface RelationalFieldShadowLaunch {
  readonly turnId: number;
  readonly exchangeId: string;
  readonly sessionId: string;
  readonly userInput: string;
  readonly primaryResponse: string;
  readonly processingProfile: ShadowProcessingProfile;
  readonly originRoute?: string | null;
  /** Runtime eligibility only; never persisted in shadow evidence. */
  readonly memberId?: string | null;
}

export interface StructuredShadowGeneration {
  readonly modelName: string;
  readonly seed: number;
  readonly rawText: string;
  readonly rawPlan: InterpretivePlan;
  readonly generationMs: number;
  readonly promptSha256: string;
}

export interface ShadowEvidenceRow {
  readonly turnId: number;
  readonly exchangeId: string;
  readonly architectureVersion: string;
  readonly modelName: string;
  readonly deterministicSeed: number;
  readonly status: ShadowRunStatus;
  readonly processingProfile: ShadowProcessingProfile;
  readonly originRoute?: string | null;
  readonly primaryStage: typeof PRIMARY_CAPTURE_STAGE;
  readonly primaryResponseSha256: string;
  readonly primaryResponseText: string;
  readonly currentEvidenceId: string;
  readonly evidenceManifest: readonly EvidenceManifestItem[];
  readonly packetDigest: string;
  readonly promptSha256?: string | null;
  readonly basisEvidenceIds: readonly string[];
  readonly rawPlan?: InterpretivePlan | CurrentActProjection | null;
  readonly rawPlanSha256?: string | null;
  readonly shadowResponseText?: string | null;
  readonly renderedDigest?: string | null;
  readonly refusalCode?: string | null;
  readonly errorCode?: string | null;
  readonly generationMs?: number | null;
  readonly totalMs: number;
}
