import type { A29Design } from './model';

export function referenceDesign(): A29Design {
  return {
    census: [
      {
        receiver:'REVIEW_DISCUSS', standing:'NOT_ADMISSIBLE',
        durableReceiverIdentity:true, exactCompletionIdentity:true,
        historyPolicy:'NONE', additiveTypedProducerPossible:false,
        requiresWeakeningExistingLaw:true,
        reason:'Review history is NONE and continuation is false.',
      },
      {
        receiver:'FOCUS', standing:'NOT_ADMISSIBLE',
        durableReceiverIdentity:false, exactCompletionIdentity:false,
        historyPolicy:'OTHER', additiveTypedProducerPossible:false,
        requiresWeakeningExistingLaw:true,
        reason:'No A2 durable successful Focus completion identity exists.',
      },
      {
        receiver:'EDITORIAL', standing:'ADMISSION_DESIGNABLE',
        durableReceiverIdentity:true, exactCompletionIdentity:true,
        historyPolicy:'CHILD_LOCAL_MULTI_TURN', additiveTypedProducerPossible:true,
        requiresWeakeningExistingLaw:false,
        reason:'Editorial has exact durable identity and a closed typed candidate path; cross-episode provenance requires a new additive producer.',
      },
    ],
    first: {
      relationshipId:'rel-1', memberId:'member-1', workId:'work-1', manuscriptId:'manuscript-1',
      receiver:'EDITORIAL', receiverStanding:'ADMISSION_DESIGNABLE',
      receiverThreadId:'editorial-thread-new', receiverTurnId:'editorial-turn-new', receiverRelationshipId:'rel-1',
      materialClass:'PRIOR_MAIA_EDITORIAL_TURN',
      sourceEpisodeSequence:2, sourceRelationshipId:'rel-1', sourceMemberId:'member-1', sourceWorkId:'work-1', sourceManuscriptId:'manuscript-1',
      sourceChildKind:'EDITORIAL_TURN', sourceThreadId:'editorial-thread-old', sourceMaiaTurnIndex:4,
      sourceSpeaker:'maia', sourceAvailable:true, sourceBodyKind:'EXACT_TURN_BODY',
      sourceTemporal:'CURRENT_FROZEN_LOCUS', sourceScope:'section', admittedScope:'passage',
      selectionBasis:'EXPLICIT_EPISODE', producerId:'system.writer_relationship_prior_editorial_turn',
      producerAuthority:'situate', producerAuthorship:'system', producerParticipationClass:'retrieved',
      reusesSameThreadHistoryProducer:false, usesGenericContextBag:false,
      carriesMemberTurn:false, carriesWholeEpisodeTranscript:false, generatesSummary:false,
      rereadsSourceLocus:false, rereadsSurroundingWork:false,
      sourceReadProofRequired:true, receiverAdmissionProofRequired:true,
      providerAuthority:false, mutationAuthority:false, runtimeEnabled:false,
    },
  };
}
