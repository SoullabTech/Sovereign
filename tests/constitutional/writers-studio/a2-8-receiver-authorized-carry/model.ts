export type ChildKind = 'EDITORIAL_TURN' | 'REVIEW_DISCUSS' | 'FOCUS_ACT';
export type ReceiverKind = ChildKind | 'FUTURE_CONSTITUTED_RECEIVER';
export type MaterialClass = 'MEMBER_TURN' | 'MAIA_TURN' | 'REVIEW_OBSERVATION' | 'EVIDENCE_REF' | 'DERIVED_SUMMARY';
export type TemporalPosture = 'AS_READ' | 'CURRENT_FROZEN_LOCUS' | 'CURRENT';
export type Scope = 'sentence' | 'passage' | 'section' | 'chapter' | 'whole_work';
export type SourceReadAuthority = 'CURRENT_PROVED' | 'PRIOR_DISCLOSURE_ONLY' | 'NONE';
export type ReceiverAdmission = 'EXACT_MATERIAL_CLASS' | 'CHILD_LOCAL_HISTORY_ONLY' | 'NONE';
export type RuntimeStanding = 'CONTRACT_ONLY' | 'CURRENT_FORBIDDEN' | 'CURRENT_INELIGIBLE';
export type SelectionBasis = 'EXPLICIT_EPISODE' | 'LATEST' | 'FIRST' | 'RELATIONSHIP_RETURN' | 'DURABLE_PLACE';
export type PrivacyStanding = 'PROVED' | 'UNPROVED' | 'REFUSED';
export type CarryDisposition = 'AUTHORIZED_CONTRACT_ONLY' | 'REFUSED';

export interface NativeChildIdentity {
  readonly kind: ChildKind;
  readonly primaryId: string;
  readonly secondaryId: string;
}

export interface CarryMaterial {
  readonly materialClass: MaterialClass;
  readonly representation: 'VERBATIM' | 'STRUCTURED_REF' | 'DERIVED_SUMMARY' | 'FLATTENED_TRANSCRIPT';
  readonly materialShape: 'TYPED_CLASS' | 'GENERIC_CONTEXT_BAG';
  readonly provenancePreserved: boolean;
  readonly authorshipPreserved: boolean;
  readonly derivationSourceSequences: readonly number[];
}

export interface ReceiverAuthorizedCarry {
  readonly contract: 'A2_8_RECEIVER_AUTHORIZED_CARRY';
  readonly relationshipId: string;
  readonly memberId: string;
  readonly workId: string;

  readonly sourceRelationshipId: string;
  readonly sourceEpisodeSequence: number;
  readonly sourceMemberId: string;
  readonly sourceWorkId: string;
  readonly sourceChild: NativeChildIdentity;
  readonly sourceAvailable: boolean;
  readonly sourceReadAuthority: SourceReadAuthority;
  readonly sourceTemporal: TemporalPosture;
  readonly currentWorkSubstitutedForSource: boolean;
  readonly sourceScope: Scope;

  readonly receiverKind: ReceiverKind;
  readonly receiverId: string;
  readonly receiverMemberId: string;
  readonly receiverWorkId: string;
  readonly receiverAdmission: ReceiverAdmission;
  readonly authorityModel: 'DUAL_PROOF' | 'COLLAPSED_BOOLEAN';
  readonly receiverRuntimeStanding: RuntimeStanding;
  readonly admittedScope: Scope;

  readonly material: CarryMaterial;
  readonly materialTemporal: TemporalPosture;
  readonly selectionBasis: SelectionBasis;
  readonly privacyStanding: PrivacyStanding;
  readonly comparisonAuthority: boolean;
  readonly priorDisclosureGrantsCurrentRead: boolean;
  readonly relationshipReturnGrantsCarry: boolean;
  readonly durablePlaceGrantsCarry: boolean;
  readonly childLocalHistoryUsedAsParentAuthority: boolean;
  readonly providerCallAuthority: boolean;
  readonly mutationAuthority: boolean;
  readonly disposition: CarryDisposition;
}
