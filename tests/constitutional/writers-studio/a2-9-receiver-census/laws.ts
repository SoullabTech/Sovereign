import type { A29Design, Scope } from './model';
export type LawResult = { id:string; pass:boolean; detail:string };
const rank: Record<Scope,number> = { passage:1, section:2 };
export function evaluate(d:A29Design):LawResult[] {
  const review=d.census.find(x=>x.receiver==='REVIEW_DISCUSS');
  const focus=d.census.find(x=>x.receiver==='FOCUS');
  const editorial=d.census.find(x=>x.receiver==='EDITORIAL');
  const f=d.first;
  return [
    {id:'L1',pass:review?.standing==='NOT_ADMISSIBLE'&&review.historyPolicy==='NONE',detail:'Review is not admissible'},
    {id:'L2',pass:focus?.standing==='NOT_ADMISSIBLE'&&!focus.exactCompletionIdentity,detail:'Focus is not admissible'},
    {id:'L3',pass:editorial?.standing==='ADMISSION_DESIGNABLE'&&editorial.additiveTypedProducerPossible===true&&editorial.requiresWeakeningExistingLaw===false,detail:'Editorial is designable only additively'},
    {id:'L4',pass:d.census.filter(x=>x.standing==='ADMISSION_DESIGNABLE').length===1,detail:'exactly one receiver is designable'},
    {id:'L5',pass:f.materialClass==='PRIOR_MAIA_EDITORIAL_TURN',detail:'one first material class'},
    {id:'L6',pass:f.selectionBasis==='EXPLICIT_EPISODE'&&f.sourceEpisodeSequence>0,detail:'source episode explicitly selected'},
    {id:'L7',pass:f.producerId==='system.writer_relationship_prior_editorial_turn'&&!f.reusesSameThreadHistoryProducer,detail:'new cross-episode producer identity'},
    {id:'L8',pass:!f.usesGenericContextBag,detail:'no generic context bag'},
    {id:'L9',pass:!f.carriesMemberTurn&&!f.carriesWholeEpisodeTranscript&&!f.generatesSummary,detail:'exact prior MAIA turn only'},
    {id:'L10',pass:f.sourceRelationshipId===f.relationshipId&&f.receiverRelationshipId===f.relationshipId,detail:'same A2 parent'},
    {id:'L11',pass:f.sourceMemberId===f.memberId&&f.sourceWorkId===f.workId&&f.sourceManuscriptId===f.manuscriptId,detail:'same member Work manuscript'},
    {id:'L12',pass:f.sourceChildKind==='EDITORIAL_TURN'&&f.sourceThreadId.length>0&&f.sourceMaiaTurnIndex>=0,detail:'exact editorial source custody identity'},
    {id:'L13',pass:f.sourceSpeaker==='maia',detail:'source turn speaker is MAIA'},
    {id:'L14',pass:f.sourceAvailable,detail:'source must be available'},
    {id:'L15',pass:f.sourceTemporal==='CURRENT_FROZEN_LOCUS',detail:'source temporal posture preserved'},
    {id:'L16',pass:rank[f.admittedScope]<=rank[f.sourceScope],detail:'source scope not widened'},
    {id:'L17',pass:f.receiverThreadId.length>0&&f.receiverTurnId.length>0,detail:'exact receiver identity required'},
    {id:'L18',pass:f.sourceReadProofRequired&&f.receiverAdmissionProofRequired,detail:'dual proof required'},
    {id:'L19',pass:f.producerAuthority==='situate'&&f.producerAuthorship==='system'&&f.producerParticipationClass==='retrieved',detail:'context-only provenance preserved'},
    {id:'L20',pass:!f.rereadsSourceLocus&&!f.rereadsSurroundingWork&&!f.providerAuthority&&!f.mutationAuthority&&!f.runtimeEnabled,detail:'no reread provider mutation or runtime authority'},
  ];
}
