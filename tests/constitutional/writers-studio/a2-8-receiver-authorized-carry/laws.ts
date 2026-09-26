import type { ReceiverAuthorizedCarry, Scope } from './model';
export type LawResult = { id: string; pass: boolean; detail: string };
const rank: Record<Scope, number> = { sentence:1, passage:2, section:3, chapter:4, whole_work:5 };
const wantsAuthorize = (c: ReceiverAuthorizedCarry) => c.disposition === 'AUTHORIZED_CONTRACT_ONLY';
export function evaluate(c: ReceiverAuthorizedCarry): LawResult[] {
  const auth = wantsAuthorize(c);
  const summary = c.material.materialClass === 'DERIVED_SUMMARY' || c.material.representation === 'DERIVED_SUMMARY';
  const currentChild = c.receiverKind !== 'FUTURE_CONSTITUTED_RECEIVER';
  const temporalKnown = ['AS_READ','CURRENT_FROZEN_LOCUS','CURRENT'].includes(c.sourceTemporal as string);
  return [
    { id:'L1', pass:c.contract==='A2_8_RECEIVER_AUTHORIZED_CARRY' && c.relationshipId.length>0, detail:'typed parent carry contract' },
    { id:'L2', pass:c.sourceRelationshipId===c.relationshipId && c.sourceEpisodeSequence>0, detail:'exact source episode in exact parent' },
    { id:'L3', pass:c.sourceChild.primaryId.length>0 && c.sourceChild.secondaryId.length>0, detail:'native source child identity present' },
    { id:'L4', pass:c.receiverId.length>0, detail:'exact receiver identity present' },
    { id:'L5', pass:c.sourceMemberId===c.memberId && c.receiverMemberId===c.memberId && c.sourceWorkId===c.workId && c.receiverWorkId===c.workId, detail:'same member + Work bound' },
    { id:'L6', pass:!auth || c.sourceReadAuthority==='CURRENT_PROVED', detail:'authorization requires current source-read authority' },
    { id:'L7', pass:!auth || c.receiverAdmission==='EXACT_MATERIAL_CLASS', detail:'authorization requires receiver material-class admission' },
    { id:'L8', pass:!(c.receiverKind==='REVIEW_DISCUSS' && auth), detail:'Review remains history NONE / no cross-episode receiver' },
    { id:'L9', pass:!(c.receiverKind==='FOCUS_ACT' && auth), detail:'Focus remains ineligible for A2 carry' },
    { id:'L10', pass:!c.childLocalHistoryUsedAsParentAuthority, detail:'child-local history is not parent carry authority' },
    { id:'L11', pass:!auth || c.materialTemporal===c.sourceTemporal || c.comparisonAuthority, detail:'source temporal posture preserved' },
    { id:'L12', pass:!auth || rank[c.admittedScope] <= rank[c.sourceScope], detail:'carry does not widen source scope' },
    { id:'L13', pass:c.material.provenancePreserved && c.material.authorshipPreserved, detail:'provenance + authorship preserved' },
    { id:'L14', pass:c.sourceAvailable || !auth, detail:'unavailable source refuses carry' },
    { id:'L15', pass:!summary || c.material.derivationSourceSequences.length>0, detail:'summary has explicit derivation sources' },
    { id:'L16', pass:!summary || c.material.derivationSourceSequences.every(n=>n>0), detail:'summary derivation uses exact episode sequence' },
    { id:'L17', pass:c.selectionBasis==='EXPLICIT_EPISODE', detail:'source episode chosen explicitly' },
    { id:'L18', pass:!c.relationshipReturnGrantsCarry && !c.durablePlaceGrantsCarry, detail:'return/place grant no cognition authority' },
    { id:'L19', pass:!auth || c.privacyStanding==='PROVED', detail:'privacy/Sanctuary standing separately proved' },
    { id:'L20', pass:!c.providerCallAuthority && !c.mutationAuthority, detail:'carry grants no provider or mutation authority' },
    { id:'L21', pass:!c.priorDisclosureGrantsCurrentRead, detail:'prior disclosure receipt not current read authority' },
    { id:'L22', pass:!auth || c.materialTemporal===c.sourceTemporal || c.comparisonAuthority, detail:'comparison requires explicit authority' },
    { id:'L23', pass:!auth || !currentChild || c.receiverRuntimeStanding!=='CONTRACT_ONLY', detail:'contract-only positive reference cannot masquerade as live child receiver' },
    { id:'L24', pass:currentChild || c.receiverRuntimeStanding==='CONTRACT_ONLY', detail:'future receiver remains contract-only' },
    { id:'L25', pass:!c.currentWorkSubstitutedForSource, detail:'current Work cannot substitute for historical source' },
    { id:'L26', pass:c.material.representation!=='FLATTENED_TRANSCRIPT', detail:'flattened transcript forbidden' },
    { id:'L27', pass:c.material.materialShape==='TYPED_CLASS', detail:'typed material class required' },
    { id:'L28', pass:c.authorityModel==='DUAL_PROOF', detail:'source-read and receiver-admission remain independent' },
    { id:'L29', pass:temporalKnown, detail:'source temporal posture must be explicit' },
  ];
}
