import type { A210Contract, Refusal } from './model';
export type LawResult={id:string;pass:boolean;detail:string};
const before=(xs:readonly string[],a:string,b:string)=>xs.indexOf(a)>=0&&xs.indexOf(b)>=0&&xs.indexOf(a)<xs.indexOf(b);
const refusalSet: readonly Refusal[] = [
'relationship_required','relationship_not_found','current_declaration_unavailable','receiver_thread_invalid','receiver_scope_unmeasured','source_episode_not_found','source_kind_not_editorial','source_thread_invalid','source_turn_not_found','source_turn_not_maia','source_unavailable','same_thread_source','scope_widening_forbidden'];
export function evaluate(c:A210Contract):LawResult[]{return [
{id:'L1',pass:c.route.relationshipIdRequiredForCarry&&c.route.duplicateParentIdentityForbidden&&!('relationshipIdInsideCarry' in c.raw),detail:'one parent identity only'},
{id:'L2',pass:c.route.carryShapeClosed&&c.route.positiveIntegerSequenceRequired&&c.raw.kind==='prior_maia_editorial_turn'&&Number.isInteger(c.raw.sourceEpisodeSequence)&&c.raw.sourceEpisodeSequence>=1&&!c.raw.unknownKeysAllowed,detail:'minimal closed raw carry shape'},
{id:'L3',pass:c.route.clientSourceFactsForbidden&&!c.raw.sourceThreadId&&!c.raw.sourceMaiaTurnIndex&&!c.raw.sourceBody&&!c.raw.sourceScope,detail:'source facts are server-derived'},
{id:'L4',pass:before(c.route.order,'posture','sanctuary_refusal')&&before(c.route.order,'sanctuary_refusal','carry_preflight'),detail:'Sanctuary precedes carry read'},
{id:'L5',pass:before(c.route.order,'relationship_preflight','carry_preflight')&&before(c.route.order,'carry_preflight','persist_member_act'),detail:'carry preflight precedes member persistence'},
{id:'L6',pass:c.source.inputFields.join('|')==='memberId|relationshipId|receiverThreadId|sourceEpisodeSequence',detail:'source service input exact'},
{id:'L7',pass:c.source.provesRelationshipOwnership&&c.source.provesCurrentDeclaration,detail:'relationship ownership and current declaration proved'},
{id:'L8',pass:c.source.provesReceiverThreadOwnership&&c.source.provesReceiverManuscriptMatch&&c.source.provesReceiverMeasuredScope,detail:'receiver preflight exact'},
{id:'L9',pass:c.source.provesSourceEpisodeExact&&c.source.provesSourceChildKindEditorial,detail:'exact Editorial source episode'},
{id:'L10',pass:c.source.derivesSourceThreadFromCustody&&c.source.derivesSourceTurnIndexFromCustody,detail:'source identity derived from custody'},
{id:'L11',pass:c.source.provesSourceThreadOwnership&&c.source.provesSourceTurnExists&&c.source.provesSourceSpeakerMaia,detail:'exact available MAIA turn proved'},
{id:'L12',pass:c.source.refusesUnavailableSource&&c.source.refusesSameThread,detail:'unavailable and same-thread source refuse'},
{id:'L13',pass:c.source.scopeTable['passage->passage']==='ALLOW'&&c.source.scopeTable['passage->section']==='REFUSE'&&c.source.scopeTable['section->passage']==='ALLOW'&&c.source.scopeTable['section->section']==='ALLOW',detail:'scope relation exact'},
{id:'L14',pass:c.resolved.kind==='PRIOR_MAIA_EDITORIAL_TURN'&&c.resolved.producerId==='system.writer_relationship_prior_editorial_turn'&&c.resolved.immutable&&!c.resolved.rawRequestMayConstruct,detail:'server-minted immutable resolved carry'},
{id:'L15',pass:c.resolved.sourceBodyReadCount===1&&!c.receiver.secondSourceReadAfterPersistence,detail:'source body read exactly once'},
{id:'L16',pass:c.producer.producerId==='system.writer_relationship_prior_editorial_turn'&&!c.producer.reusesSameThreadHistoryProducer,detail:'new producer identity'},
{id:'L17',pass:c.producer.authoredBy==='system'&&c.producer.participationClass==='retrieved'&&c.producer.authority==='situate',detail:'producer provenance and authority exact'},
{id:'L18',pass:c.producer.identityRequirement==='verified'&&!c.producer.notSanctuary&&c.producer.rooms.length===1&&c.producer.rooms[0]==='writers_studio'&&!c.producer.mandatory&&c.producer.scope==='route',detail:'producer eligibility exact'},
{id:'L19',pass:c.producer.consentBasis!==null&&c.producer.registeredBeforeUse,detail:'explicit selection basis and registry-before-use'},
{id:'L20',pass:c.assembly.widensEditorialProducerUnion&&c.assembly.sameThreadHistoryUnchanged&&!c.assembly.genericExtraCandidates&&!c.assembly.genericContextBag&&!c.assembly.castBypass,detail:'additive typed Editorial producer only'},
{id:'L21',pass:c.assembly.sourceBodyPlacement==='DEDICATED_CANDIDATE'&&c.assembly.sourceBodyOccurrences===1,detail:'source body dedicated and once'},
{id:'L22',pass:c.assembly.preservesEarlierMaiaAuthorship&&c.assembly.preservesFrozenTemporalStanding&&c.assembly.labelsContextNotInstruction&&!c.assembly.grantsRereadAuthority,detail:'candidate semantics preserve authorship time and context-only standing'},
{id:'L23',pass:c.receiver.runTurnInputIsResolvedCarryOnly&&!c.receiver.rawCarryRequestAcceptedByRunTurn,detail:'runtime receives resolved carry only'},
{id:'L24',pass:c.receiver.receiverThreadExact&&c.receiver.receiverRelationshipExact&&c.receiver.sourceReadProofRequired&&c.receiver.receiverAdmissionProofRequired,detail:'receiver dual-proof exact'},
{id:'L25',pass:c.receiver.mipaRequired&&c.receiver.rendererProofRequired&&c.receiver.droppedProducerRefusesHandoff,detail:'canonical handoff proof required'},
{id:'L26',pass:!c.receiver.providerAuthority&&!c.receiver.mutationAuthority,detail:'carry grants no provider or mutation authority'},
{id:'L27',pass:!c.persistence.addsCarryToA2Episode&&!c.persistence.addsCarryToAskTurns&&!c.persistence.addsCarryToProposalObjects&&!c.persistence.addsNewPersistenceTable,detail:'no persistence-schema widening'},
{id:'L28',pass:refusalSet.every(x=>c.refusal.closedSet.includes(x))&&c.refusal.closedSet.length===refusalSet.length,detail:'closed refusal taxonomy complete'},
{id:'L29',pass:c.refusal.malformed400&&c.refusal.semantic409&&c.refusal.notFound404WhereExistingLaw&&c.refusal.preflightRefusalPersistedFalse,detail:'HTTP refusal semantics exact'},
{id:'L30',pass:c.refusal.providerNotReachedOnPreflightRefusal,detail:'preflight refusal cannot reach provider'},
];}
