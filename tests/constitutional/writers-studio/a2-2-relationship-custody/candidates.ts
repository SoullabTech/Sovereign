import type { CustodyDesign } from './model';
import { referenceDesign } from './design';

const clone=(): CustodyDesign => structuredClone(referenceDesign());

export const defeatCandidates = [
  ['D1','F1',(d:any)=>{d.parentIdentitySource='ASK_THREAD_ID'}],
  ['D2','F5',(d:any)=>{d.parentIdentitySource='DERIVED_WORK_SINGLETON'}],
  ['D3','F11',(d:any)=>{d.childReferenceShape='GENERIC_CHILD_ID';d.exactlyOneChildKind=false}],
  ['D4','F11',(d:any)=>{d.childReferenceShape='OPTIONAL_EVERYTHING';d.exactlyOneChildKind=false}],
  ['D5','F14',(d:any)=>{d.parentOrder='CREATED_AT'}],
  ['D6','F15',(d:any)=>{d.parentOrder='CHILD_TURN_INDEX'}],
  ['D7','F29',(d:any)=>{d.priorEpisodePositionMutable=true}],
  ['D8','F16',(d:any)=>{d.concurrentAppend='AMBIGUOUS'}],
  ['D9','F6',(d:any)=>{d.parentStoresManuscriptProse=true}],
  ['D10','F26',(d:any)=>{d.parentStoresChildResponseProse=true;d.copiedParentProseSurvivesChildDeletion=true}],
  ['D11','F28',(d:any)=>{d.childDeletionPolicy='SUMMARY_SUBSTITUTE'}],
  ['D12','F7',(d:any)=>{d.parentGrantsDisclosure=true}],
  ['D13','F13',(d:any)=>{d.reviewUsesReadingLocalAddress=false;d.observationIdSubstitutesForReadingLocalAddress=true}],
  ['D14','P14',(d:any)=>{d.reviewGranularity='WHOLE_THREAD';d.storesHistoryPolicySnapshot=false}],
  ['D15','F17',(d:any)=>{d.admitsPrePersistenceRefusalAsCompleted=true}],
  ['D16','F18',(d:any)=>{d.admitsAttemptedFocusCrossingAsCompleted=true}],
  ['D17','P11',(d:any)=>{d.admitsIncompleteReviewAsAnswered=true}],
  ['D18','P11',(d:any)=>{d.admitsEditorialThreadOpenAsCompletedMaiaTurn=true}],
  ['D19','F30',(d:any)=>{d.parentGrantsMutation=true}],
  ['D20','P19',(d:any)=>{d.parentGrantsPersonalMemory=true}],
  ['D21','F24',(d:any)=>{d.latestEpisodeIsPlace=true;d.parentClaimsDurablePlace=true}],
  ['D22','F24',(d:any)=>{d.latestScopeIsPlace=true;d.parentClaimsDurablePlace=true}],
  ['D23','F20',(d:any)=>{d.requestedExecutedScopeMustMatch=false}],
  ['D24','F22',(d:any)=>{d.wholeWorkExecutableFromRouteVocabulary=true}],
  ['D25','F23',(d:any)=>{d.sentenceExecutableFromArbitrarySelection=true}],
  ['D26','F26',(d:any)=>{d.copiedParentProseSurvivesChildDeletion=true}],
  ['D27','F28',(d:any)=>{d.childReferenceMutable=true;d.childDeletionPolicy='REPOINT_TO_SUCCESSOR'}],
  ['D28','F28',(d:any)=>{d.childDeletionPolicy='REPOINT_TO_SUCCESSOR'}],
  ['D29','F8',(d:any)=>{d.bindingProof='CLIENT_ASSERTED_IDS';d.browserSuppliedIdsTrustedForOwnership=true}],
  ['D30','F1',(d:any)=>{d.reusesAskThreadsAsParent=true;d.parentIdentitySource='ASK_THREAD_ID'}],
] as const;

export function mutant(mutate:(d:any)=>void): CustodyDesign {
  const d:any=clone(); mutate(d); return d;
}
