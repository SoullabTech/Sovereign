export type AdmissionBasis =
  | 'current_conversation'
  | 'explicit_selection'
  | 'explicit_facet_open'
  | 'standing_continuity_permission'
  | 'system_required_boundary_context';

export type PermissionStanding = 'unavailable' | 'available' | 'admitted';

export type RepresentationAuthority = 'descriptive' | 'selective' | 'authoritative';

export type EpistemicKind =
  | 'source_fact'
  | 'member_authored_report'
  | 'member_authored_meaning'
  | 'computed_fact'
  | 'symbolic_tradition'
  | 'symbolic_correspondence'
  | 'system_derived_summary'
  | 'maia_hypothesis'
  | 'counterevidence';

export type TemporalStanding =
  | 'current'
  | 'historical'
  | 'prospective'
  | 'superseded'
  | 'unknown';

export type CandidateRole =
  | 'exact'
  | 'conceptual'
  | 'bridge'
  | 'counterevidence'
  | 'context'
  | 'symbolic';

export interface RetrievalSignals {
  lexical: number | null;
  semantic: number | null;
  graph: number | null;
  temporal: number | null;
  directness: number | null;
  inquiryFit: number | null;
}
export interface SourceIdentity {
  sourceRef: string;
  sourceClass: string;
  objectId: string;
  revision?: string | number;
  contentHash?: string;
  returnPath?: string;
}

export interface TemporalValidity {
  eventTime?: string;
  recordTime?: string;
  validFrom?: string;
  validTo?: string;
  supersededBy?: string;
}

export interface SourceFabricCandidate {
  identity: SourceIdentity;
  permission: PermissionStanding;
  admissionBasis?: AdmissionBasis;
  authority: RepresentationAuthority;
  epistemicKind: EpistemicKind;
  temporalStanding: TemporalStanding;
  temporalValidity?: TemporalValidity;
  signals: RetrievalSignals;
  roles: CandidateRole[];
  memberSelected: boolean;
  speakable: boolean;
  disclosed: boolean;
  reliedUpon: boolean;
  uncertainty: number;
  excerpt?: string;
  relationPath?: string[];
  supportScope: string[];
  prohibitedSupport: string[];
}

export interface InquiryContract {
  query: string;
  claimNeed: string;
  temporalNeed: 'current' | 'historical' | 'prospective' | 'mixed' | 'unknown';
  eligibleSourceClasses: string[];
  maxCandidates: number;
}
export interface CandidateAdjudication {
  sourceRef: string;
  admitted: boolean;
  rankable: boolean;
  reason:
    | 'admitted'
    | 'permission_denied'
    | 'source_class_ineligible'
    | 'superseded_for_current_claim';
  signalVector: RetrievalSignals;
  authority: RepresentationAuthority;
  epistemicKind: EpistemicKind;
  temporalStanding: TemporalStanding;
  roles: CandidateRole[];
  memberSelected: boolean;
}

function bounded(value: number | null): number {
  if (value === null || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

/** Reference-only comparator for contract tests. Production weights are NOT canonized here. */
export function referenceDescriptiveRetrievalScore(signals: RetrievalSignals): number {
  const weights = {
    lexical: 0.20,
    semantic: 0.24,
    graph: 0.14,
    temporal: 0.16,
    directness: 0.14,
    inquiryFit: 0.12,
  } as const;
  return Object.entries(weights).reduce(
    (sum, [key, weight]) => sum + bounded(signals[key as keyof RetrievalSignals]) * weight,
    0,
  );
}
export function adjudicateCandidate(
  candidate: SourceFabricCandidate,
  inquiry: InquiryContract,
): CandidateAdjudication {
  if (candidate.permission !== 'admitted') {
    return {
      sourceRef: candidate.identity.sourceRef,
      admitted: false,
      rankable: false,
      reason: 'permission_denied',
      signalVector: candidate.signals,
      authority: candidate.authority,
      epistemicKind: candidate.epistemicKind,
      temporalStanding: candidate.temporalStanding,
      roles: candidate.roles,
      memberSelected: candidate.memberSelected,
    };
  }
  if (!inquiry.eligibleSourceClasses.includes(candidate.identity.sourceClass)) {
    return {
      sourceRef: candidate.identity.sourceRef,
      admitted: false,
      rankable: false,
      reason: 'source_class_ineligible',
      signalVector: candidate.signals,
      authority: candidate.authority,
      epistemicKind: candidate.epistemicKind,
      temporalStanding: candidate.temporalStanding,
      roles: candidate.roles,
      memberSelected: candidate.memberSelected,
    };
  }
  if (inquiry.temporalNeed === 'current' && candidate.temporalStanding === 'superseded') {
    return {
      sourceRef: candidate.identity.sourceRef,
      admitted: true,
      rankable: false,
      reason: 'superseded_for_current_claim',
      signalVector: candidate.signals,
      authority: candidate.authority,
      epistemicKind: candidate.epistemicKind,
      temporalStanding: candidate.temporalStanding,
      roles: candidate.roles,
      memberSelected: candidate.memberSelected,
    };
  }
  return {
    sourceRef: candidate.identity.sourceRef,
    admitted: true,
    rankable: true,
    reason: 'admitted',
    signalVector: candidate.signals,
    authority: candidate.authority,
    epistemicKind: candidate.epistemicKind,
    temporalStanding: candidate.temporalStanding,
    roles: candidate.roles,
    memberSelected: candidate.memberSelected,
  };
}

export function compareRankableCandidates(
  a: SourceFabricCandidate,
  b: SourceFabricCandidate,
): number {
  if (a.memberSelected !== b.memberSelected) return a.memberSelected ? -1 : 1;

  const counterA = a.roles.includes('counterevidence');
  const counterB = b.roles.includes('counterevidence');
  if (counterA !== counterB) return counterA ? -1 : 1;

  const exactA = a.roles.includes('exact');
  const exactB = b.roles.includes('exact');
  if (exactA !== exactB) return exactA ? -1 : 1;

  return referenceDescriptiveRetrievalScore(b.signals) - referenceDescriptiveRetrievalScore(a.signals);
}

export type ClaimClass =
  | 'source_identity'
  | 'member_current_state'
  | 'member_historical_experience'
  | 'symbolic_parallel'
  | 'causal_explanation'
  | 'prediction'
  | 'other_person_interiority'
  | 'conceptual_orientation';

export function canSupportClaim(candidate: SourceFabricCandidate, claim: ClaimClass): boolean {
  if (!candidate.supportScope.includes(claim)) return false;
  if (candidate.prohibitedSupport.includes(claim)) return false;

  if (candidate.epistemicKind === 'symbolic_tradition' || candidate.epistemicKind === 'symbolic_correspondence') {
    return claim === 'symbolic_parallel' || claim === 'conceptual_orientation';
  }

  if (candidate.epistemicKind === 'maia_hypothesis') {
    return claim === 'conceptual_orientation';
  }

  if (candidate.epistemicKind === 'member_authored_report') {
    if (claim === 'other_person_interiority' || claim === 'causal_explanation' || claim === 'prediction') {
      return false;
    }
  }

  if (candidate.temporalStanding === 'superseded' && claim === 'member_current_state') return false;
  return true;
}

export interface SourceUseReceipt {
  sourceRef: string;
  admissionBasis: AdmissionBasis;
  retrieved: boolean;
  reliedUpon: boolean;
  speakable: boolean;
  disclosed: boolean;
  authority: RepresentationAuthority;
  epistemicKind: EpistemicKind;
  temporalStanding: TemporalStanding;
  roles: CandidateRole[];
  retrievalReasons: Array<
    'lexical' | 'semantic' | 'graph' | 'temporal' | 'directness' | 'inquiry_fit' | 'member_selection'
  >;

  supportScope: string[];
  prohibitedSupport: string[];
}

export interface RetrieveCandidatesRequest {
  inquiry: InquiryContract;
  eligibleSourceClasses: string[];
  admittedSourceRefs?: string[];
  excludedSourceRefs?: string[];
}

export interface RetrieveCandidatesResult {
  candidates: SourceFabricCandidate[];
  receipts: SourceUseReceipt[];
  excluded: Array<{
    sourceRef: string;
    reason: CandidateAdjudication['reason'] | 'member_excluded';
  }>;
}

export interface SourceFabricBroker {
  retrieveCandidates(request: RetrieveCandidatesRequest): Promise<RetrieveCandidatesResult>;
}
