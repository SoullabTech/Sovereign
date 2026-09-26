export type Receiver = 'REVIEW_DISCUSS' | 'FOCUS' | 'EDITORIAL';
export type CensusStanding = 'NOT_ADMISSIBLE' | 'ADMISSION_DESIGNABLE' | 'RUNTIME_ENABLED';
export type MaterialClass = 'PRIOR_MAIA_EDITORIAL_TURN';
export type Scope = 'passage' | 'section';

export interface ReceiverCensusRow {
  readonly receiver: Receiver;
  readonly standing: CensusStanding;
  readonly durableReceiverIdentity: boolean;
  readonly exactCompletionIdentity: boolean;
  readonly historyPolicy: 'NONE' | 'CHILD_LOCAL_MULTI_TURN' | 'OTHER';
  readonly additiveTypedProducerPossible: boolean;
  readonly requiresWeakeningExistingLaw: boolean;
  readonly reason: string;
}

export interface FirstCarryAdmissionDesign {
  readonly relationshipId: string;
  readonly memberId: string;
  readonly workId: string;
  readonly manuscriptId: string;

  readonly receiver: 'EDITORIAL';
  readonly receiverStanding: 'ADMISSION_DESIGNABLE';
  readonly receiverThreadId: string;
  readonly receiverTurnId: string;
  readonly receiverRelationshipId: string;

  readonly materialClass: MaterialClass;
  readonly sourceEpisodeSequence: number;
  readonly sourceRelationshipId: string;
  readonly sourceMemberId: string;
  readonly sourceWorkId: string;
  readonly sourceManuscriptId: string;
  readonly sourceChildKind: 'EDITORIAL_TURN';
  readonly sourceThreadId: string;
  readonly sourceMaiaTurnIndex: number;
  readonly sourceSpeaker: 'maia';
  readonly sourceAvailable: boolean;
  readonly sourceBodyKind: 'EXACT_TURN_BODY';
  readonly sourceTemporal: 'CURRENT_FROZEN_LOCUS';
  readonly sourceScope: Scope;

  readonly admittedScope: Scope;
  readonly selectionBasis: 'EXPLICIT_EPISODE';
  readonly producerId: 'system.writer_relationship_prior_editorial_turn';
  readonly producerAuthority: 'situate';
  readonly producerAuthorship: 'system';
  readonly producerParticipationClass: 'retrieved';
  readonly reusesSameThreadHistoryProducer: boolean;
  readonly usesGenericContextBag: boolean;
  readonly carriesMemberTurn: boolean;
  readonly carriesWholeEpisodeTranscript: boolean;
  readonly generatesSummary: boolean;
  readonly rereadsSourceLocus: boolean;
  readonly rereadsSurroundingWork: boolean;

  readonly sourceReadProofRequired: true;
  readonly receiverAdmissionProofRequired: true;
  readonly providerAuthority: false;
  readonly mutationAuthority: false;
  readonly runtimeEnabled: false;
}

export interface A29Design {
  readonly census: readonly ReceiverCensusRow[];
  readonly first: FirstCarryAdmissionDesign;
}
