import type { ReceiverAuthorizedCarry } from './model';
/**
 * A2-8 lawful non-executing reference.
 *
 * This proves the shape of a future lawful carry without authorizing any live
 * Writer's Studio child seam. The future receiver is CONTRACT_ONLY.
 */
export function referenceCarry(): ReceiverAuthorizedCarry {
  return {
    contract:'A2_8_RECEIVER_AUTHORIZED_CARRY',
    relationshipId:'relationship-1', memberId:'member-1', workId:'work-1',
    sourceRelationshipId:'relationship-1', sourceEpisodeSequence:2,
    sourceMemberId:'member-1', sourceWorkId:'work-1',
    sourceChild:{kind:'REVIEW_DISCUSS',primaryId:'reading-1:observation-1',secondaryId:'review-turn-4'},
    sourceAvailable:true, sourceReadAuthority:'CURRENT_PROVED', sourceTemporal:'AS_READ',
    currentWorkSubstitutedForSource:false, sourceScope:'passage',
    receiverKind:'FUTURE_CONSTITUTED_RECEIVER', receiverId:'future-receiver-act-1',
    receiverMemberId:'member-1', receiverWorkId:'work-1',
    receiverAdmission:'EXACT_MATERIAL_CLASS', authorityModel:'DUAL_PROOF',
    receiverRuntimeStanding:'CONTRACT_ONLY', admittedScope:'passage',
    material:{materialClass:'REVIEW_OBSERVATION',representation:'STRUCTURED_REF',materialShape:'TYPED_CLASS',provenancePreserved:true,authorshipPreserved:true,derivationSourceSequences:[]},
    materialTemporal:'AS_READ', selectionBasis:'EXPLICIT_EPISODE', privacyStanding:'PROVED',
    comparisonAuthority:false, priorDisclosureGrantsCurrentRead:false,
    relationshipReturnGrantsCarry:false, durablePlaceGrantsCarry:false,
    childLocalHistoryUsedAsParentAuthority:false, providerCallAuthority:false,
    mutationAuthority:false, disposition:'AUTHORIZED_CONTRACT_ONLY',
  };
}
