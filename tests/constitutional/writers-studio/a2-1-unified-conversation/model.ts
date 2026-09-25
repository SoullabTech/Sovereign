export type SemanticScope = 'sentence' | 'passage' | 'section' | 'chapter' | 'whole_work';
export type ChildKind = 'FOCUS_ACT' | 'EDITORIAL_THREAD_ACT' | 'REVIEW_DISCUSS_ACT';
export type CarryPolicy = 'PRESENTATION_ONLY' | 'RECEIVER_AUTHORIZED' | 'FORBIDDEN_AUTO_CARRY';
export type EpisodeStatus = 'COMPLETED' | 'REFUSED_PRE_PERSISTENCE';
export type TemporalPosture = 'CURRENT' | 'CURRENT_FROZEN_LOCUS' | 'AS_READ' | 'THEN_VS_NOW';
export type HistoryPolicy = 'NONE' | 'CHILD_LOCAL_MULTI_TURN' | 'SESSION_PERSISTED_NOT_ADMITTED';
export type AuthorityClass = 'FOCUS_DISCLOSURE' | 'EDITORIAL_CHAIN' | 'R2_DISCLOSURE';
export type Executability = 'EXECUTED' | 'NOT_EXECUTABLE' | 'NOT_MEMBER_REACHABLE';

export interface ScopeStanding {
  readonly requested: SemanticScope;
  readonly executed: SemanticScope | null;
  readonly executability: Executability;
  readonly seam: ChildKind | null;
}
export interface FocusChild {
  readonly kind: 'FOCUS_ACT';
  readonly requestId: string; readonly disclosureId: string;
  readonly exchangeId: string; readonly sessionId: string;
}
export interface EditorialChild {
  readonly kind: 'EDITORIAL_THREAD_ACT';
  readonly threadId: string; readonly proposalChainId: string;
  readonly draftId: string; readonly baseVersion: number;
  readonly targetDraftSectionId: string; readonly locusDigest: string;
}
export interface ReviewChild {
  readonly kind: 'REVIEW_DISCUSS_ACT';
  readonly readingId: string; readonly observationKey: string;
  readonly observationId: string; readonly threadId: string; readonly actId: string;
}
export type ChildIdentity = FocusChild | EditorialChild | ReviewChild;

export interface RelationshipEpisode {
  readonly sequence: number;
  readonly memberId: string;
  readonly workId: string;
  readonly child: ChildIdentity;
  readonly scope: ScopeStanding;
  readonly temporal: TemporalPosture;
  readonly authority: AuthorityClass;
  readonly history: HistoryPolicy;
  readonly continuationAuthorized: boolean;
  readonly carry: CarryPolicy;
  readonly cognitionCarryAuthorized: boolean;
  readonly mutationAuthority: 'NONE';
  readonly status: EpisodeStatus;
  readonly sanctuary: 'ORDINARY' | 'REFUSED';
  readonly sourceAddressKind: 'SOURCE_SECTION' | 'NONE';
  readonly draftAddressKind: 'DRAFT_SECTION' | 'NONE';
  readonly sentenceLocatorKind: 'NONE' | 'CONSTITUTED_SENTENCE';
  readonly priorDisclosureGrantsCurrentStanding: boolean;
}
export interface UnifiedEditorialRelationship {
  readonly contract: 'A2_1_UNIFIED_EDITORIAL_RELATIONSHIP';
  readonly relationshipId: string;
  readonly relationshipIdOrigin: 'A2_MINTED_OPAQUE' | 'CHILD_REUSED' | 'DERIVED_FROM_CHILD';
  readonly memberId: string;
  readonly workId: string;
  readonly episodes: readonly RelationshipEpisode[];
  readonly scopeStandings: readonly ScopeStanding[];
  readonly parentCognitionCarryDefault: 'FORBIDDEN';
  readonly parentDisclosureAuthority: boolean;
  readonly parentMutationAuthority: boolean;
  readonly durablePlaceClaimed: boolean;
  readonly placeBasis: 'NONE' | 'LATEST_SAVED_SECTION' | 'LAST_EPISODE';
  readonly allowCrossSessionPersonalMemory: boolean;
  readonly pluralityPolicy: 'EXPLICIT_SELECTION_REQUIRED' | 'LATEST' | 'FIRST';
  readonly parentOrderingAuthority: 'EXPLICIT_SEQUENCE' | 'TIMESTAMP';
  readonly presentationProjectionPreservesEpisodeSemantics: boolean;
  readonly scopeRemintedRelationship: boolean;
}
