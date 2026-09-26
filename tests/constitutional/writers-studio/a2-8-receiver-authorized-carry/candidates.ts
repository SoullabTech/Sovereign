import type { ReceiverAuthorizedCarry } from './model';
export type Mutator = (x: any) => void;
export const mutant = (base: ReceiverAuthorizedCarry, mutate: Mutator): ReceiverAuthorizedCarry => {
  const x = structuredClone(base) as any; mutate(x); return x;
};
export const defeatCandidates: readonly [string,string,Mutator][] = [
  ['D1 membership-alone-authorizes','L6',x=>{x.sourceReadAuthority='NONE';x.receiverAdmission='NONE';}],
  ['D2 prior-disclosure-reused','L21',x=>{x.priorDisclosureGrantsCurrentRead=true;}],
  ['D3 receiver-admission-absent','L7',x=>{x.receiverAdmission='NONE';}],
  ['D4 source-read-absent','L6',x=>{x.sourceReadAuthority='NONE';}],
  ['D5 review-history-replay','L8',x=>{x.receiverKind='REVIEW_DISCUSS';x.receiverRuntimeStanding='CURRENT_FORBIDDEN';}],
  ['D6 child-local-history-as-parent','L10',x=>{x.childLocalHistoryUsedAsParentAuthority=true;}],
  ['D7 focus-receiver','L9',x=>{x.receiverKind='FOCUS_ACT';x.receiverRuntimeStanding='CURRENT_INELIGIBLE';}],
  ['D8 as-read-relabeled-current','L11',x=>{x.sourceTemporal='AS_READ';x.materialTemporal='CURRENT';}],
  ['D9 current-work-substitution','L25',x=>{x.currentWorkSubstitutedForSource=true;}],
  ['D10 silent-then-vs-now','L22',x=>{x.materialTemporal='CURRENT';x.comparisonAuthority=false;}],
  ['D11 passage-widened-to-chapter','L12',x=>{x.sourceScope='passage';x.admittedScope='chapter';}],
  ['D12 summary-hides-scope-widening','L12',x=>{x.material.materialClass='DERIVED_SUMMARY';x.material.representation='DERIVED_SUMMARY';x.material.derivationSourceSequences=[x.sourceEpisodeSequence];x.sourceScope='passage';x.admittedScope='chapter';}],
  ['D13 flattened-transcript','L26',x=>{x.material.representation='FLATTENED_TRANSCRIPT';}],
  ['D14 provenance-lost','L13',x=>{x.material.provenancePreserved=false;x.material.authorshipPreserved=false;}],
  ['D15 deleted-source-reconstructed','L14',x=>{x.sourceAvailable=false;}],
  ['D16 unavailable-source-summary','L14',x=>{x.sourceAvailable=false;x.material.materialClass='DERIVED_SUMMARY';x.material.representation='DERIVED_SUMMARY';x.material.derivationSourceSequences=[x.sourceEpisodeSequence];}],
  ['D17 summary-without-provenance','L15',x=>{x.material.materialClass='DERIVED_SUMMARY';x.material.representation='DERIVED_SUMMARY';x.material.derivationSourceSequences=[];}],
  ['D18 summary-sources-latest','L17',x=>{x.material.materialClass='DERIVED_SUMMARY';x.material.representation='DERIVED_SUMMARY';x.material.derivationSourceSequences=[x.sourceEpisodeSequence];x.selectionBasis='LATEST';}],
  ['D19 latest-episode-selection','L17',x=>{x.selectionBasis='LATEST';}],
  ['D20 relationship-return-as-consent','L18',x=>{x.relationshipReturnGrantsCarry=true;}],
  ['D21 durable-place-as-material','L18',x=>{x.durablePlaceGrantsCarry=true;}],
  ['D22 sanctuary-bypass','L19',x=>{x.privacyStanding='REFUSED';}],
  ['D23 provider-authority-from-carry','L20',x=>{x.providerCallAuthority=true;}],
  ['D24 mutation-authority-from-carry','L20',x=>{x.mutationAuthority=true;}],
  ['D25 generic-context-bag','L27',x=>{x.material.materialShape='GENERIC_CONTEXT_BAG';}],
  ['D26 other-relationship-source','L2',x=>{x.sourceRelationshipId='rel-other';}],
  ['D27 other-member-work-source','L5',x=>{x.sourceMemberId='member-other';x.sourceWorkId='work-other';}],
  ['D28 temporal-posture-omitted','L29',x=>{x.sourceTemporal=undefined;}],
  ['D29 receiver-identity-omitted','L4',x=>{x.receiverId='';}],
  ['D30 authority-collapsed-boolean','L28',x=>{x.authorityModel='COLLAPSED_BOOLEAN';}],
];
