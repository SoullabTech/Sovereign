import type { UnifiedEditorialRelationship } from './model';

/**
 * WRITERS-STUDIO-NEXT-01 / A2-1 — lawful non-executing reference.
 *
 * One parent relationship, three lawful child kinds. The parent records
 * relationship succession only. It grants no child history, disclosure,
 * cognition carry, personal memory, durable place, or Work mutation.
 */
export function referenceRelationship(): UnifiedEditorialRelationship {
  return {
    contract: 'A2_1_UNIFIED_EDITORIAL_RELATIONSHIP',
    relationshipId: 'a2rel-opaque-001',
    relationshipIdOrigin: 'A2_MINTED_OPAQUE',
    memberId: 'member-1',
    workId: 'work-1',
    scopeRemintedRelationship: false,
    parentCognitionCarryDefault: 'FORBIDDEN',
    parentDisclosureAuthority: false,
    parentMutationAuthority: false,
    durablePlaceClaimed: false,
    placeBasis: 'NONE',
    allowCrossSessionPersonalMemory: false,
    pluralityPolicy: 'EXPLICIT_SELECTION_REQUIRED',
    parentOrderingAuthority: 'EXPLICIT_SEQUENCE',
    presentationProjectionPreservesEpisodeSemantics: true,
    scopeStandings: [
      { requested:'passage', executed:'passage', executability:'EXECUTED', seam:'EDITORIAL_THREAD_ACT' },
      { requested:'section', executed:'section', executability:'EXECUTED', seam:'FOCUS_ACT' },
      { requested:'chapter', executed:null, executability:'NOT_EXECUTABLE', seam:null },
      { requested:'whole_work', executed:null, executability:'NOT_MEMBER_REACHABLE', seam:null },
      { requested:'sentence', executed:null, executability:'NOT_EXECUTABLE', seam:null },
    ],
    episodes: [
      {
        sequence: 1, memberId:'member-1', workId:'work-1',
        child:{kind:'FOCUS_ACT',requestId:'focus-request-1',disclosureId:'focus-disclosure-1',exchangeId:'focus-exchange-1',sessionId:'focus-session-1'},
        scope:{requested:'section',executed:'section',executability:'EXECUTED',seam:'FOCUS_ACT'},
        temporal:'CURRENT', authority:'FOCUS_DISCLOSURE',
        history:'SESSION_PERSISTED_NOT_ADMITTED', continuationAuthorized:false,
        carry:'PRESENTATION_ONLY', cognitionCarryAuthorized:false,
        mutationAuthority:'NONE', status:'COMPLETED', sanctuary:'ORDINARY',
        sourceAddressKind:'SOURCE_SECTION', draftAddressKind:'NONE',
        sentenceLocatorKind:'NONE', priorDisclosureGrantsCurrentStanding:false,
      },
      {
        sequence: 2, memberId:'member-1', workId:'work-1',
        child:{kind:'EDITORIAL_THREAD_ACT',threadId:'editorial-thread-1',proposalChainId:'proposal-chain-1',draftId:'draft-1',baseVersion:7,targetDraftSectionId:'draft-section-1',locusDigest:'sha256:locus-1'},
        scope:{requested:'passage',executed:'passage',executability:'EXECUTED',seam:'EDITORIAL_THREAD_ACT'},
        temporal:'CURRENT_FROZEN_LOCUS', authority:'EDITORIAL_CHAIN',
        history:'CHILD_LOCAL_MULTI_TURN', continuationAuthorized:true,
        carry:'PRESENTATION_ONLY', cognitionCarryAuthorized:false,
        mutationAuthority:'NONE', status:'COMPLETED', sanctuary:'ORDINARY',
        sourceAddressKind:'NONE', draftAddressKind:'DRAFT_SECTION',
        sentenceLocatorKind:'NONE', priorDisclosureGrantsCurrentStanding:false,
      },
      {
        sequence: 3, memberId:'member-1', workId:'work-1',
        child:{kind:'REVIEW_DISCUSS_ACT',readingId:'reading-1',observationKey:'observation-key-1',observationId:'observation-id-1',threadId:'review-thread-1',actId:'review-act-1'},
        scope:{requested:'passage',executed:'passage',executability:'EXECUTED',seam:'REVIEW_DISCUSS_ACT'},
        temporal:'AS_READ', authority:'R2_DISCLOSURE',
        history:'NONE', continuationAuthorized:false,
        carry:'PRESENTATION_ONLY', cognitionCarryAuthorized:false,
        mutationAuthority:'NONE', status:'COMPLETED', sanctuary:'ORDINARY',
        sourceAddressKind:'SOURCE_SECTION', draftAddressKind:'NONE',
        sentenceLocatorKind:'NONE', priorDisclosureGrantsCurrentStanding:false,
      },
    ],
  };
}
