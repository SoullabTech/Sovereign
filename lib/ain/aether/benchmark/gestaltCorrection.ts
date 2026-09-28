import type { MultiSpiralField } from './multiSpiral';
import {
  deriveAethericGestalt,
  type AethericGestaltCandidate,
} from './fieldOfFields';

export type GestaltRecognition=
  | 'unreviewed'
  | 'recognized'
  | 'partly_recognized'
  | 'rejected'
  | 'reshaped';

export type GestaltCorrectionKind=
  | 'recognize'
  | 'partly_recognize'
  | 'reject'
  | 'exclude_spiral'
  | 'include_spiral'
  | 'reshape';

export interface GestaltCorrection {
  correctionRef:string;
  kind:GestaltCorrectionKind;
  targetGestaltRef:string;
  spiralRef?:string;
  note:string;
  introducedBy:'member';
}

export interface CorrectedAethericGestalt {
  original:AethericGestaltCandidate;
  active:AethericGestaltCandidate;
  recognition:GestaltRecognition;
  correctionRefs:string[];
  memberNotes:string[];
  sourceFieldPreserved:true;
  relationHistoryPreserved:true;
  finalMeaningAuthority:'member';
}

function unique<T>(xs:T[]):T[]{ return [...new Set(xs)]; }

export function applyGestaltCorrection(
  field:MultiSpiralField,
  current:AethericGestaltCandidate,
  correction:GestaltCorrection,
):CorrectedAethericGestalt {
  if(correction.targetGestaltRef!==current.gestaltRef){
    throw new Error('GESTALT_CORRECTION_TARGET_MISMATCH');
  }

  let recognition:GestaltRecognition='unreviewed';
  let active={...current,
    participatingSpiralRefs:[...current.participatingSpiralRefs],
    excludedSpiralRefs:[...current.excludedSpiralRefs],
    supportingRelationRefs:[...current.supportingRelationRefs],
    excludedRelationRefs:[...current.excludedRelationRefs],
  };

  if(correction.kind==='recognize') recognition='recognized';
  if(correction.kind==='partly_recognize') recognition='partly_recognized';
  if(correction.kind==='reject') recognition='rejected';

  if(correction.kind==='exclude_spiral'){
    if(!correction.spiralRef) throw new Error('GESTALT_CORRECTION_SPIRAL_REQUIRED');
    active.participatingSpiralRefs=active.participatingSpiralRefs.filter(ref=>ref!==correction.spiralRef);
    active.excludedSpiralRefs=unique([...active.excludedSpiralRefs,correction.spiralRef]);
    active.supportingRelationRefs=field.crossSpiralRelations
      .filter(r=>
        active.participatingSpiralRefs.includes(r.aSpiralRef) &&
        active.participatingSpiralRefs.includes(r.bSpiralRef) &&
        r.kind!=='independent_movement'
      )
      .map(r=>r.relationRef);
    active.excludedRelationRefs=field.crossSpiralRelations
      .filter(r=>!active.supportingRelationRefs.includes(r.relationRef))
      .map(r=>r.relationRef);
    active.standing=
      active.participatingSpiralRefs.length>=3&&active.supportingRelationRefs.length>=2
        ? 'candidate_gestalt'
        : active.participatingSpiralRefs.length>=2&&active.supportingRelationRefs.length>=1
          ? 'partial_gestalt'
          : 'insufficient_gestalt';
    recognition='reshaped';
  }

  if(correction.kind==='include_spiral'){
    if(!correction.spiralRef) throw new Error('GESTALT_CORRECTION_SPIRAL_REQUIRED');
    if(!field.spirals.some(s=>s.spiralRef===correction.spiralRef)){
      throw new Error('GESTALT_CORRECTION_UNKNOWN_SPIRAL');
    }
    active.participatingSpiralRefs=unique([...active.participatingSpiralRefs,correction.spiralRef]);
    active.excludedSpiralRefs=active.excludedSpiralRefs.filter(ref=>ref!==correction.spiralRef);
    active.supportingRelationRefs=field.crossSpiralRelations
      .filter(r=>
        active.participatingSpiralRefs.includes(r.aSpiralRef) &&
        active.participatingSpiralRefs.includes(r.bSpiralRef) &&
        r.kind!=='independent_movement'
      )
      .map(r=>r.relationRef);
    active.excludedRelationRefs=field.crossSpiralRelations
      .filter(r=>!active.supportingRelationRefs.includes(r.relationRef))
      .map(r=>r.relationRef);
    active.standing=
      active.participatingSpiralRefs.length>=3&&active.supportingRelationRefs.length>=2
        ? 'candidate_gestalt'
        : active.participatingSpiralRefs.length>=2&&active.supportingRelationRefs.length>=1
          ? 'partial_gestalt'
          : 'insufficient_gestalt';
    recognition='reshaped';
  }

  if(correction.kind==='reshape'){
    recognition='reshaped';
  }

  if(recognition==='rejected'){
    active={
      ...active,
      standing:'insufficient_gestalt',
      proposition:'The proposed higher-order gestalt was rejected by the member and is not active for interpretation.',
    };
  }

  return {
    original:current,
    active,
    recognition,
    correctionRefs:[correction.correctionRef],
    memberNotes:[correction.note],
    sourceFieldPreserved:true,
    relationHistoryPreserved:true,
    finalMeaningAuthority:'member',
  };
}

export function validateCorrectedGestalt(
  field:MultiSpiralField,
  corrected:CorrectedAethericGestalt,
){
  const errors:string[]=[];
  if(!corrected.sourceFieldPreserved) errors.push('source_field_not_preserved');
  if(!corrected.relationHistoryPreserved) errors.push('relation_history_not_preserved');
  if(corrected.finalMeaningAuthority!=='member') errors.push('final_meaning_not_member_owned');
  if(corrected.recognition==='rejected'&&corrected.active.standing!=='insufficient_gestalt'){
    errors.push('rejected_gestalt_still_active');
  }

  const fieldRefs=new Set(field.spirals.map(s=>s.spiralRef));
  for(const ref of corrected.active.participatingSpiralRefs){
    if(!fieldRefs.has(ref)) errors.push('active_unknown_spiral:'+ref);
  }
  for(const ref of corrected.active.excludedSpiralRefs){
    if(!fieldRefs.has(ref)) errors.push('excluded_unknown_spiral:'+ref);
  }

  if(corrected.original.totalizingAuthority||corrected.active.totalizingAuthority){
    errors.push('totalizing_authority_granted');
  }
  if(corrected.original.identityAuthority||corrected.active.identityAuthority){
    errors.push('identity_authority_granted');
  }
  if(corrected.original.soulRepresentationAuthority||corrected.active.soulRepresentationAuthority){
    errors.push('soul_representation_authority_granted');
  }

  return {valid:errors.length===0,errors};
}

export function regenerateGestaltFromField(field:MultiSpiralField){
  return deriveAethericGestalt(field);
}
