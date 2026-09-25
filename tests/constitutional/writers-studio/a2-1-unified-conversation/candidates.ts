import type { UnifiedEditorialRelationship } from './model';
import { referenceRelationship } from './contract';
const clone=(): UnifiedEditorialRelationship => structuredClone(referenceRelationship());
const review=(r:any)=>r.episodes.find((e:any)=>e.child.kind==='REVIEW_DISCUSS_ACT');
export const defeatCandidates = [
  ['D1','L1',(r:any)=>{r.relationshipId=r.episodes[1].child.threadId;r.relationshipIdOrigin='CHILD_REUSED'}],
  ['D2','L2',(r:any)=>{r.scopeRemintedRelationship=true}], ['D3','L3',(r:any)=>{r.episodes[0].workId='other'}],
  ['D4','L3',(r:any)=>{r.episodes[0].memberId='other'}], ['D5','L5',(r:any)=>{const e=review(r);e.history='CHILD_LOCAL_MULTI_TURN';e.continuationAuthorized=true}],
  ['D6','L6',(r:any)=>{r.episodes[0].carry='RECEIVER_AUTHORIZED';r.episodes[0].cognitionCarryAuthorized=false}],
  ['D7','L7',(r:any)=>{r.parentDisclosureAuthority=true}], ['D8','L8',(r:any)=>{review(r).temporal='THEN_VS_NOW'}],
  ['D9','L9',(r:any)=>{review(r).child.readingId=''}], ['D10','L10',(r:any)=>{const e=review(r);e.child.observationId=e.child.observationKey}],
  ['D11','L11',(r:any)=>{r.episodes[0].sourceAddressKind='SOURCE_SECTION';r.episodes[0].draftAddressKind='DRAFT_SECTION'}],
  ['D12','L12',(r:any)=>{r.scopeStandings=[{requested:'chapter',executed:'section',executability:'EXECUTED',seam:'FOCUS_ACT'}]}],
  ['D13','L13',(r:any)=>{r.scopeStandings=[{requested:'chapter',executed:'section',executability:'NOT_EXECUTABLE',seam:null}]}],
  ['D14','L14',(r:any)=>{r.durablePlaceClaimed=true;r.placeBasis='LAST_EPISODE'}], ['D15','L15',(r:any)=>{r.durablePlaceClaimed=true;r.placeBasis='LATEST_SAVED_SECTION'}],
  ['D16','L16',(r:any)=>{r.parentMutationAuthority=true}], ['D17','L17',(r:any)=>{r.presentationProjectionPreservesEpisodeSemantics=false}],
  ['D18','L18',(r:any)=>{r.parentOrderingAuthority='TIMESTAMP'}], ['D19','L19',(r:any)=>{r.episodes[0].priorDisclosureGrantsCurrentStanding=true}],
  ['D20','L20',(r:any)=>{r.episodes[0].sanctuary='REFUSED';r.episodes[0].status='COMPLETED'}], ['D21','L21',(r:any)=>{r.allowCrossSessionPersonalMemory=true}],
  ['D22','L22',(r:any)=>{r.pluralityPolicy='LATEST'}],
  ['D23','L23',(r:any)=>{r.scopeStandings=[{requested:'sentence',executed:'sentence',executability:'EXECUTED',seam:'EDITORIAL_THREAD_ACT'}];r.episodes.forEach((e:any)=>e.sentenceLocatorKind='NONE')}],
  ['D24','L24',(r:any)=>{r.scopeStandings=[{requested:'whole_work',executed:'whole_work',executability:'EXECUTED',seam:'FOCUS_ACT'}]}],
] as const;
export function mutant(mut:(r:any)=>void): UnifiedEditorialRelationship { const r:any=clone(); mut(r); return r; }
