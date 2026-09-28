import { runHeldOutDialogueSet } from './blindSemanticGeneralization';
import {
  buildHumanSemanticReviewPacket,
  captureHumanSemanticReview,
  type HumanSemanticReviewRecord,
} from './humanSemanticReview';
import {
  buildEvidenceBoundUtterance,
  validateDialogueSemanticFidelity,
  type DialogueClaimKind,
  type EvidenceBoundUtterance,
} from './dialogueSemanticFidelity';
import { adjudicateBalancedAetherUtterance } from './fieldDialogueFalsification';

export interface HumanReviewRepairRequest {
  repairRef:string;
  caseRef:string;
  adjudication:HumanSemanticReviewRecord['adjudication'];
  correctionNote:string;
  correctedReflection:string;
  claimKind:DialogueClaimKind;
  spiralRefs:string[];
}

export interface HumanReviewRepairResult {
  repairRef:string;
  caseRef:string;
  frozenMachineEvidenceRef:string;
  humanReviewRef:string;
  originalMachineUtterance:string;
  correctedCandidate:string;
  posture:{
    valid:boolean;
    disposition:string;
    overreachErrors:string[];
    underreachErrors:string[];
  };
  semantic:{
    valid:boolean;
    errors:string[];
  };
  accepted:boolean;
  activeReflection:string|null;
  machineWitnessMutated:false;
  humanReviewRecordMutated:false;
  finalMeaningAuthority:'member';
}

function heldOutCase(caseRef:string){
  const run=runHeldOutDialogueSet();
  const held=run.results.find(r=>r.caseRef===caseRef);
  if(!held) throw new Error('REPAIR_UNKNOWN_CASE:'+caseRef);
  return held;
}

export function adjudicateHumanReviewRepair(
  request:HumanReviewRepairRequest,
):HumanReviewRepairResult{
  const packet=buildHumanSemanticReviewPacket();
  const held=heldOutCase(request.caseRef);

  const review=captureHumanSemanticReview(packet,{
    caseRef:request.caseRef,
    adjudication:request.adjudication,
    correctionNote:request.correctionNote,
    correctedReflection:request.correctedReflection,
  });

  const base=buildEvidenceBoundUtterance(
    held.field,
    held.gestalt,
    request.claimKind,
    request.spiralRefs,
  );

  const candidate:EvidenceBoundUtterance={
    ...base,
    utteranceRef:'human-repair:'+request.repairRef,
    text:request.correctedReflection,
    fieldAnchorTerms:[...request.spiralRefs],
  };

  const posture=adjudicateBalancedAetherUtterance(
    candidate.text,
    candidate.fieldAnchorTerms,
  );
  const semantic=validateDialogueSemanticFidelity(
    held.field,
    held.gestalt,
    candidate,
  );
  const accepted=posture.valid&&semantic.valid;

  return {
    repairRef:request.repairRef,
    caseRef:request.caseRef,
    frozenMachineEvidenceRef:review.frozenMachineEvidenceRef,
    humanReviewRef:review.reviewRef,
    originalMachineUtterance:held.utterance.text,
    correctedCandidate:request.correctedReflection,
    posture:{
      valid:posture.valid,
      disposition:posture.disposition,
      overreachErrors:[...posture.overreachErrors],
      underreachErrors:[...posture.underreachErrors],
    },
    semantic:{
      valid:semantic.valid,
      errors:[...semantic.errors],
    },
    accepted,
    activeReflection:accepted?request.correctedReflection:null,
    machineWitnessMutated:false,
    humanReviewRecordMutated:false,
    finalMeaningAuthority:'member',
  };
}

export function validateHumanReviewRepair(result:HumanReviewRepairResult){
  const errors:string[]=[];
  if(result.machineWitnessMutated!==false) errors.push('machine_witness_mutated');
  if(result.humanReviewRecordMutated!==false) errors.push('human_review_record_mutated');
  if(result.finalMeaningAuthority!=='member') errors.push('final_meaning_not_member_owned');
  if(result.accepted && (!result.posture.valid||!result.semantic.valid)){
    errors.push('accepted_without_all_gates');
  }
  if(!result.accepted && result.activeReflection!==null){
    errors.push('rejected_repair_became_active');
  }
  if(result.accepted && result.activeReflection!==result.correctedCandidate){
    errors.push('accepted_repair_not_active_candidate');
  }
  return {valid:errors.length===0,errors};
}
