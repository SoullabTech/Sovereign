export type Scope = 'passage' | 'section';
export type Refusal =
  | 'relationship_required' | 'relationship_not_found' | 'current_declaration_unavailable'
  | 'receiver_thread_invalid' | 'receiver_scope_unmeasured' | 'source_episode_not_found'
  | 'source_kind_not_editorial' | 'source_thread_invalid' | 'source_turn_not_found'
  | 'source_turn_not_maia' | 'source_unavailable' | 'same_thread_source'
  | 'scope_widening_forbidden';

export interface RawCarryRequest {
  readonly kind: 'prior_maia_editorial_turn';
  readonly sourceEpisodeSequence: number;
  readonly relationshipIdInsideCarry?: string;
  readonly sourceThreadId?: string;
  readonly sourceMaiaTurnIndex?: number;
  readonly sourceBody?: string;
  readonly sourceScope?: Scope;
  readonly unknownKeysAllowed: boolean;
}

export interface RouteContract {
  readonly topKeys: readonly string[];
  readonly relationshipIdRequiredForCarry: boolean;
  readonly carryShapeClosed: boolean;
  readonly positiveIntegerSequenceRequired: boolean;
  readonly duplicateParentIdentityForbidden: boolean;
  readonly clientSourceFactsForbidden: boolean;
  readonly order: readonly (
    | 'gate' | 'identity' | 'parse' | 'posture' | 'sanctuary_refusal'
    | 'relationship_preflight' | 'carry_preflight' | 'persist_member_act'
    | 'mint_exchange' | 'run_turn' | 'handoff' | 'provider' | 'persist_outcome'
  )[];
}

export interface SourceReadContract {
  readonly inputFields: readonly string[];
  readonly provesRelationshipOwnership: boolean;
  readonly provesCurrentDeclaration: boolean;
  readonly provesReceiverThreadOwnership: boolean;
  readonly provesReceiverManuscriptMatch: boolean;
  readonly provesReceiverMeasuredScope: boolean;
  readonly provesSourceEpisodeExact: boolean;
  readonly provesSourceChildKindEditorial: boolean;
  readonly derivesSourceThreadFromCustody: boolean;
  readonly derivesSourceTurnIndexFromCustody: boolean;
  readonly provesSourceThreadOwnership: boolean;
  readonly provesSourceTurnExists: boolean;
  readonly provesSourceSpeakerMaia: boolean;
  readonly refusesUnavailableSource: boolean;
  readonly refusesSameThread: boolean;
  readonly scopeTable: Readonly<Record<`${Scope}->${Scope}`, 'ALLOW' | 'REFUSE'>>;
}

export interface ResolvedCarryContract {
  readonly kind: 'PRIOR_MAIA_EDITORIAL_TURN';
  readonly producerId: 'system.writer_relationship_prior_editorial_turn';
  readonly immutable: boolean;
  readonly rawRequestMayConstruct: boolean;
  readonly sourceBodyReadCount: number;
}

export interface ProducerContract {
  readonly producerId: 'system.writer_relationship_prior_editorial_turn' | string;
  readonly authoredBy: 'system' | 'member';
  readonly participationClass: 'retrieved' | 'authored' | 'inferred';
  readonly authority: 'situate' | 'infer' | 'compute';
  readonly consentBasis: string | null;
  readonly identityRequirement: 'verified' | 'any';
  readonly notSanctuary: boolean;
  readonly rooms: readonly string[];
  readonly mandatory: boolean;
  readonly scope: 'route' | 'tier' | 'floor';
  readonly reusesSameThreadHistoryProducer: boolean;
  readonly registeredBeforeUse: boolean;
}

export interface AssemblyContract {
  readonly widensEditorialProducerUnion: boolean;
  readonly sameThreadHistoryUnchanged: boolean;
  readonly genericExtraCandidates: boolean;
  readonly genericContextBag: boolean;
  readonly castBypass: boolean;
  readonly sourceBodyPlacement: 'DEDICATED_CANDIDATE' | 'ENCOUNTER_INPUT' | 'CURRENT_THREAD_HISTORY' | 'SUMMARY';
  readonly sourceBodyOccurrences: number;
  readonly preservesEarlierMaiaAuthorship: boolean;
  readonly preservesFrozenTemporalStanding: boolean;
  readonly labelsContextNotInstruction: boolean;
  readonly grantsRereadAuthority: boolean;
}

export interface ReceiverContract {
  readonly runTurnInputIsResolvedCarryOnly: boolean;
  readonly rawCarryRequestAcceptedByRunTurn: boolean;
  readonly receiverThreadExact: boolean;
  readonly receiverRelationshipExact: boolean;
  readonly sourceReadProofRequired: boolean;
  readonly receiverAdmissionProofRequired: boolean;
  readonly secondSourceReadAfterPersistence: boolean;
  readonly mipaRequired: boolean;
  readonly rendererProofRequired: boolean;
  readonly droppedProducerRefusesHandoff: boolean;
  readonly providerAuthority: boolean;
  readonly mutationAuthority: boolean;
}

export interface PersistenceContract {
  readonly addsCarryToA2Episode: boolean;
  readonly addsCarryToAskTurns: boolean;
  readonly addsCarryToProposalObjects: boolean;
  readonly addsNewPersistenceTable: boolean;
}

export interface RefusalContract {
  readonly closedSet: readonly Refusal[];
  readonly malformed400: boolean;
  readonly semantic409: boolean;
  readonly notFound404WhereExistingLaw: boolean;
  readonly preflightRefusalPersistedFalse: boolean;
  readonly providerNotReachedOnPreflightRefusal: boolean;
}

export interface A210Contract {
  readonly raw: RawCarryRequest;
  readonly route: RouteContract;
  readonly source: SourceReadContract;
  readonly resolved: ResolvedCarryContract;
  readonly producer: ProducerContract;
  readonly assembly: AssemblyContract;
  readonly receiver: ReceiverContract;
  readonly persistence: PersistenceContract;
  readonly refusal: RefusalContract;
}
