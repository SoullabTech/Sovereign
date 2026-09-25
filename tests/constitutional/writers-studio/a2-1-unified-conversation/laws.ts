import type { UnifiedEditorialRelationship, RelationshipEpisode, SemanticScope } from './model';
export type LawResult = { id: string; pass: boolean; detail: string };
const childIds = (e: RelationshipEpisode): string[] => {
  if (e.child.kind === 'FOCUS_ACT') return [e.child.requestId,e.child.disclosureId,e.child.exchangeId,e.child.sessionId];
  if (e.child.kind === 'EDITORIAL_THREAD_ACT') return [e.child.threadId,e.child.proposalChainId];
  return [e.child.readingId,e.child.observationKey,e.child.observationId,e.child.threadId,e.child.actId];
};
const rank: { [K in SemanticScope]: number } = { sentence:1, passage:2, section:3, chapter:4, whole_work:5 };
export function evaluate(r: UnifiedEditorialRelationship): LawResult[] {
  const ids = r.episodes.flatMap(childIds);
  const review = r.episodes.filter(e => e.child.kind === 'REVIEW_DISCUSS_ACT');
  const scopeRows = [...r.episodes.map(e=>e.scope), ...r.scopeStandings];
  const unsupportedTruthful = scopeRows.every(s => s.executability === 'EXECUTED'
    ? s.executed !== null && rank[s.executed] >= rank[s.requested]
    : s.executed === null);
  return [
    {id:'L1',pass:r.relationshipIdOrigin==='A2_MINTED_OPAQUE'&&!ids.includes(r.relationshipId),detail:'parent id opaque and distinct'},
    {id:'L2',pass:!r.scopeRemintedRelationship,detail:'scope change does not remint parent'},
    {id:'L3',pass:r.episodes.every(e=>e.memberId===r.memberId&&e.workId===r.workId),detail:'member + Work bound'},
    {id:'L4',pass:r.episodes.every(e=>childIds(e).every(Boolean)),detail:'native child identity retained'},
    {id:'L5',pass:review.every(e=>e.history==='NONE'&&!e.continuationAuthorized),detail:'Review history NONE / no continuation'},
    {id:'L6',pass:r.parentCognitionCarryDefault==='FORBIDDEN'&&r.episodes.every(e=>e.carry!=='RECEIVER_AUTHORIZED'||e.cognitionCarryAuthorized),detail:'no automatic cognition carry'},
    {id:'L7',pass:r.parentDisclosureAuthority===false,detail:'parent not disclosure authority'},
    {id:'L8',pass:review.every(e=>e.temporal==='AS_READ'),detail:'Review AS_READ remains AS_READ'},
    {id:'L9',pass:review.every(e=>e.child.kind==='REVIEW_DISCUSS_ACT'&&!!e.child.readingId&&!!e.child.observationKey),detail:'Review reading-local'},
    {id:'L10',pass:review.every(e=>e.child.kind==='REVIEW_DISCUSS_ACT'&&e.child.observationId!==e.child.observationKey),detail:'observation_id not reading-local authority'},
    {id:'L11',pass:r.episodes.every(e=>!(e.sourceAddressKind==='SOURCE_SECTION'&&e.draftAddressKind==='DRAFT_SECTION'&&e.child.kind==='FOCUS_ACT')),detail:'address namespaces not collapsed'},
    {id:'L12',pass:scopeRows.every(s=>s.executed===null||s.executed===s.requested),detail:'executed scope exactly matches requested scope'},
    {id:'L13',pass:unsupportedTruthful,detail:'unsupported scope explicit'},
    {id:'L14',pass:!(r.durablePlaceClaimed&&r.placeBasis==='LAST_EPISODE'),detail:'last episode not durable place'},
    {id:'L15',pass:!(r.durablePlaceClaimed&&r.placeBasis==='LATEST_SAVED_SECTION'),detail:'latest save not durable place'},
    {id:'L16',pass:r.parentMutationAuthority===false&&r.episodes.every(e=>e.mutationAuthority==='NONE'),detail:'no Work mutation authority'},
    {id:'L17',pass:r.presentationProjectionPreservesEpisodeSemantics,detail:'projection preserves semantics'},
    {id:'L18',pass:r.parentOrderingAuthority==='EXPLICIT_SEQUENCE'&&r.episodes.every((e,i)=>e.sequence===i+1),detail:'parent succession explicit'},
    {id:'L19',pass:r.episodes.every(e=>!e.priorDisclosureGrantsCurrentStanding),detail:'prior receipt not standing'},
    {id:'L20',pass:r.episodes.every(e=>!(e.sanctuary==='REFUSED'&&e.status==='COMPLETED')),detail:'Sanctuary refusal not completed episode'},
    {id:'L21',pass:r.allowCrossSessionPersonalMemory===false,detail:'no cross-session personal memory grant'},
    {id:'L22',pass:r.pluralityPolicy==='EXPLICIT_SELECTION_REQUIRED',detail:'plurality requires explicit selection'},
    {id:'L23',pass:r.scopeStandings.filter(s=>s.requested==='sentence').every(s=>s.executability!=='EXECUTED'||r.episodes.some(e=>e.sentenceLocatorKind==='CONSTITUTED_SENTENCE')),detail:'sentence requires locator'},
    {id:'L24',pass:r.scopeStandings.filter(s=>s.requested==='whole_work').every(s=>s.executability!=='EXECUTED'),detail:'route vocabulary not live whole-Work conversation'},
  ];
}
