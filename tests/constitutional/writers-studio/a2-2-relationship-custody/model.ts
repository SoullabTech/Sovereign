export type ParentIdentitySource =
  | 'A2_OPAQUE'
  | 'ASK_THREAD_ID'
  | 'SESSION_ID'
  | 'PROPOSAL_CHAIN_ID'
  | 'READING_ID'
  | 'GENERIC_GRAPH_NODE'
  | 'DERIVED_WORK_SINGLETON';

export type BindingProof =
  | 'SERVER_VERIFIED_MEMBER_LIVING_WORK_MANUSCRIPT_DECLARATION'
  | 'MANUSCRIPT_ONLY'
  | 'CLIENT_ASSERTED_IDS';

export type ChildReferenceShape =
  | 'CLOSED_DISCRIMINATED_UNION'
  | 'GENERIC_CHILD_ID'
  | 'OPTIONAL_EVERYTHING';

export type ParentOrder =
  | 'RELATIONSHIP_SEQUENCE_UNDER_PARENT_LOCK'
  | 'CREATED_AT'
  | 'CHILD_TURN_INDEX';

export type ConcurrentAppend =
  | 'SERIALIZE_AND_UNIQUE'
  | 'AMBIGUOUS'
  | 'LAST_WRITE_WINS';

export type MissingChildPolicy =
  | 'OPAQUE_REF_BECOMES_UNAVAILABLE'
  | 'SUMMARY_SUBSTITUTE'
  | 'REPOINT_TO_SUCCESSOR';

export type ReadProjection =
  | 'CONTENT_FREE_RELATIONSHIP_INDEX'
  | 'FLATTENED_TRANSCRIPT';

export type RelationshipSelection =
  | 'EXPLICIT_SELECTION'
  | 'LATEST'
  | 'FIRST';

export type ChildGranularity =
  | 'FOCUS_COMPLETED_EXCHANGE'
  | 'EDITORIAL_COMPLETED_TURN_PAIR'
  | 'REVIEW_COMPLETED_ACT'
  | 'WHOLE_THREAD'
  | 'SESSION'
  | 'GENERIC_REF';

export interface CustodyDesign {
  readonly parentIdentitySource: ParentIdentitySource;
  readonly pluralityRepresentable: boolean;
  readonly storesMemberId: boolean;
  readonly storesLivingWorkId: boolean;
  readonly storesManuscriptId: boolean;
  readonly bindingProof: BindingProof;
  readonly appendReverifiesCurrentDeclaration: boolean;
  readonly expressionRemovalMakesHistoricalOnly: boolean;

  readonly parentStoresManuscriptProse: boolean;
  readonly parentStoresChildResponseProse: boolean;
  readonly parentGrantsDisclosure: boolean;
  readonly parentGrantsCognition: boolean;
  readonly parentGrantsMutation: boolean;
  readonly parentGrantsPersonalMemory: boolean;
  readonly parentClaimsDurablePlace: boolean;

  readonly childReferenceShape: ChildReferenceShape;
  readonly exactlyOneChildKind: boolean;
  readonly focusGranularity: ChildGranularity;
  readonly editorialGranularity: ChildGranularity;
  readonly reviewGranularity: ChildGranularity;
  readonly reviewUsesReadingLocalAddress: boolean;
  readonly observationIdSubstitutesForReadingLocalAddress: boolean;

  readonly parentOrder: ParentOrder;
  readonly concurrentAppend: ConcurrentAppend;
  readonly priorEpisodePositionMutable: boolean;
  readonly childReferenceMutable: boolean;

  readonly admitsPrePersistenceRefusalAsCompleted: boolean;
  readonly admitsAttemptedFocusCrossingAsCompleted: boolean;
  readonly admitsIncompleteReviewAsAnswered: boolean;
  readonly admitsEditorialThreadOpenAsCompletedMaiaTurn: boolean;

  readonly relationshipMembershipImpliesCognitionCarry: boolean;
  readonly priorDisclosurePointerGrantsStanding: boolean;

  readonly requestedExecutedScopeMustMatch: boolean;
  readonly chapterIdentityFromHeading: boolean;
  readonly wholeWorkExecutableFromRouteVocabulary: boolean;
  readonly sentenceExecutableFromArbitrarySelection: boolean;

  readonly latestEpisodeIsPlace: boolean;
  readonly latestScopeIsPlace: boolean;
  readonly relationshipSelection: RelationshipSelection;

  readonly childDeletionPolicy: MissingChildPolicy;
  readonly parentDeletionCascadesToChildren: boolean;
  readonly copiedParentProseSurvivesChildDeletion: boolean;

  readonly readProjection: ReadProjection;
  readonly browserSuppliedIdsTrustedForOwnership: boolean;
  readonly reusesAskThreadsAsParent: boolean;

  readonly storesRequestedScopeSnapshot: boolean;
  readonly storesExecutedScopeSnapshot: boolean;
  readonly storesTemporalPostureSnapshot: boolean;
  readonly storesHistoryPolicySnapshot: boolean;
  readonly storesContinuationSnapshot: boolean;
  readonly storesAuthorityClassSnapshot: boolean;
  readonly storesCarryPolicySnapshot: boolean;
  readonly provenanceRemainsChildAuthoritative: boolean;
  readonly completionDerivedFromAdmission: boolean;
}
