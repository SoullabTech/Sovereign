import {
  runHeldOutDialogueSet,
  type HumanSemanticAdjudication,
  type HeldOutDialogueResult,
} from './blindSemanticGeneralization';

export interface HumanSemanticReviewCard {
  caseRef:string;
  description:string;
  representedField:Array<{
    spiralRef:string;
    domain:string;
    trajectory:string;
  }>;
  relationSummary:Array<{
    pair:string;
    kind:string;
  }>;
  gestalt:{
    standing:string;
    participatingSpiralRefs:string[];
    excludedSpiralRefs:string[];
  };
  machineDecision:'admit'|'refuse';
  utterance:string;
  whyThisReflection:string|null;
  uncertainty:string|null;
  memberCheck:string|null;
  machineErrors:string[];
  adjudicationOptions:HumanSemanticAdjudication[];
  reviewQuestions:string[];
  frozenMachineEvidenceRef:string;
}

export interface HumanSemanticReviewRecord {
  reviewRef:string;
  caseRef:string;
  frozenMachineEvidenceRef:string;
  adjudication:HumanSemanticAdjudication;
  correctionNote:string;
  correctedReflection?:string;
  reviewer:'human';
  sourceMachineEvidenceMutated:false;
}

export interface HumanSemanticReviewPacket {
  packetRef:string;
  parentR11:string;
  frozenMachineWitnessRef:string;
  cards:HumanSemanticReviewCard[];
  humanReviewStatus:'pending';
  sourceMachineEvidenceMutable:false;
}

function pairName(a:string,b:string){
  return [a,b].sort().join(' ↔ ');
}

export function buildHumanReviewCard(
  held:HeldOutDialogueResult,
  frozenMachineEvidenceRef:string,
):HumanSemanticReviewCard{
  const provenance=held.machineResult.provenance;
  return {
    caseRef:held.caseRef,
    description:held.description,
    representedField:held.field.spirals.map(s=>({
      spiralRef:s.spiralRef,
      domain:s.domain,
      trajectory:s.trajectory.classification,
    })),
    relationSummary:held.field.crossSpiralRelations.map(r=>({
      pair:pairName(r.aSpiralRef,r.bSpiralRef),
      kind:r.kind,
    })),
    gestalt:{
      standing:held.gestalt.standing,
      participatingSpiralRefs:[...held.gestalt.participatingSpiralRefs],
      excludedSpiralRefs:[...held.gestalt.excludedSpiralRefs],
    },
    machineDecision:held.machineResult.valid?'admit':'refuse',
    utterance:held.utterance.text,
    whyThisReflection:provenance?.whyThisReflection??null,
    uncertainty:provenance?.uncertainty??null,
    memberCheck:provenance?.memberCheck??null,
    machineErrors:[...held.machineResult.errors],
    adjudicationOptions:[...held.humanReview.allowedAdjudications],
    reviewQuestions:[...held.humanReview.questions],
    frozenMachineEvidenceRef,
  };
}

export function buildHumanSemanticReviewPacket():HumanSemanticReviewPacket{
  const run=runHeldOutDialogueSet();
  const frozenMachineEvidenceRef=
    'docs/programme/AIN-AETHER-01/r11/r11-evidence.json';
  return {
    packetRef:'AIN-AETHER-01R12-human-semantic-review',
    parentR11:'45b88f9c71dc72be113416a1d74b303c8e1ca532',
    frozenMachineWitnessRef:frozenMachineEvidenceRef,
    cards:run.results.map(r=>buildHumanReviewCard(r,frozenMachineEvidenceRef)),
    humanReviewStatus:'pending',
    sourceMachineEvidenceMutable:false,
  };
}

export function captureHumanSemanticReview(
  packet:HumanSemanticReviewPacket,
  input:{
    caseRef:string;
    adjudication:HumanSemanticAdjudication;
    correctionNote:string;
    correctedReflection?:string;
  },
):HumanSemanticReviewRecord{
  const card=packet.cards.find(c=>c.caseRef===input.caseRef);
  if(!card) throw new Error('HUMAN_REVIEW_UNKNOWN_CASE:'+input.caseRef);
  if(!card.adjudicationOptions.includes(input.adjudication)){
    throw new Error('HUMAN_REVIEW_INVALID_ADJUDICATION:'+input.adjudication);
  }
  if(!input.correctionNote.trim()){
    throw new Error('HUMAN_REVIEW_NOTE_REQUIRED');
  }

  return {
    reviewRef:'human-review:'+input.caseRef,
    caseRef:input.caseRef,
    frozenMachineEvidenceRef:card.frozenMachineEvidenceRef,
    adjudication:input.adjudication,
    correctionNote:input.correctionNote,
    correctedReflection:input.correctedReflection,
    reviewer:'human',
    sourceMachineEvidenceMutated:false,
  };
}

export function validateHumanSemanticReviewPacket(packet:HumanSemanticReviewPacket){
  const errors:string[]=[];
  if(packet.parentR11!=='45b88f9c71dc72be113416a1d74b303c8e1ca532'){
    errors.push('wrong_r11_parent');
  }
  if(packet.sourceMachineEvidenceMutable!==false){
    errors.push('machine_evidence_mutable');
  }
  if(packet.humanReviewStatus!=='pending'){
    errors.push('packet_not_pending');
  }
  if(packet.cards.length!==5){
    errors.push('unexpected_card_count');
  }

  for(const card of packet.cards){
    if(card.frozenMachineEvidenceRef!==packet.frozenMachineWitnessRef){
      errors.push('card_machine_ref_mismatch:'+card.caseRef);
    }
    if(card.reviewQuestions.length===0){
      errors.push('missing_review_questions:'+card.caseRef);
    }
    if(card.adjudicationOptions.length===0){
      errors.push('missing_adjudication_options:'+card.caseRef);
    }
  }

  return {valid:errors.length===0,errors};
}
