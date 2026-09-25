import type { CustodyDesign } from './model';

/**
 * WRITERS-STUDIO-NEXT-01 / A2-2 — lawful non-executing custody design.
 *
 * Logical architecture:
 *   parent relationship custody
 *        + append-only relationship-local episode references
 *
 * No child prose is copied. Child content and authority remain in child custody.
 */
export function referenceDesign(): CustodyDesign {
  return {
    parentIdentitySource:'A2_OPAQUE',
    pluralityRepresentable:true,
    storesMemberId:true,
    storesLivingWorkId:true,
    storesManuscriptId:true,
    bindingProof:'SERVER_VERIFIED_MEMBER_LIVING_WORK_MANUSCRIPT_DECLARATION',
    appendReverifiesCurrentDeclaration:true,
    expressionRemovalMakesHistoricalOnly:true,

    parentStoresManuscriptProse:false,
    parentStoresChildResponseProse:false,
    parentGrantsDisclosure:false,
    parentGrantsCognition:false,
    parentGrantsMutation:false,
    parentGrantsPersonalMemory:false,
    parentClaimsDurablePlace:false,

    childReferenceShape:'CLOSED_DISCRIMINATED_UNION',
    exactlyOneChildKind:true,
    focusGranularity:'FOCUS_COMPLETED_EXCHANGE',
    editorialGranularity:'EDITORIAL_COMPLETED_TURN_PAIR',
    reviewGranularity:'REVIEW_COMPLETED_ACT',
    reviewUsesReadingLocalAddress:true,
    observationIdSubstitutesForReadingLocalAddress:false,

    parentOrder:'RELATIONSHIP_SEQUENCE_UNDER_PARENT_LOCK',
    concurrentAppend:'SERIALIZE_AND_UNIQUE',
    priorEpisodePositionMutable:false,
    childReferenceMutable:false,

    admitsPrePersistenceRefusalAsCompleted:false,
    admitsAttemptedFocusCrossingAsCompleted:false,
    admitsIncompleteReviewAsAnswered:false,
    admitsEditorialThreadOpenAsCompletedMaiaTurn:false,

    relationshipMembershipImpliesCognitionCarry:false,
    priorDisclosurePointerGrantsStanding:false,

    requestedExecutedScopeMustMatch:true,
    chapterIdentityFromHeading:false,
    wholeWorkExecutableFromRouteVocabulary:false,
    sentenceExecutableFromArbitrarySelection:false,

    latestEpisodeIsPlace:false,
    latestScopeIsPlace:false,
    relationshipSelection:'EXPLICIT_SELECTION',

    childDeletionPolicy:'OPAQUE_REF_BECOMES_UNAVAILABLE',
    parentDeletionCascadesToChildren:false,
    copiedParentProseSurvivesChildDeletion:false,

    readProjection:'CONTENT_FREE_RELATIONSHIP_INDEX',
    browserSuppliedIdsTrustedForOwnership:false,
    reusesAskThreadsAsParent:false,

    storesRequestedScopeSnapshot:true,
    storesExecutedScopeSnapshot:true,
    storesTemporalPostureSnapshot:true,
    storesHistoryPolicySnapshot:true,
    storesContinuationSnapshot:true,
    storesAuthorityClassSnapshot:true,
    storesCarryPolicySnapshot:true,
    provenanceRemainsChildAuthoritative:true,
    completionDerivedFromAdmission:true,
  };
}
