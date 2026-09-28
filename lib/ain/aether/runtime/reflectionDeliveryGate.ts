import type { SyntheticReflectionCandidate } from './syntheticReflectionCandidate';

export interface SyntheticHumanDeliveryAuthorization {
  authorizationRef:string;
  candidateRef:string;
  actor:'human';
  authorized:boolean;
  scope:'synthetic_handoff_only';
  note:string;
}

export interface SyntheticReflectionHandoffToken {
  tokenRef:string;
  candidateRef:string;
  authorizationRef:string;
  authorizedBy:'human';
  scope:'synthetic_handoff_only';
  handoffEligible:true;
  candidateText:string;
  candidateProvenanceRef:string;
  syntheticOnly:true;
  memberFacingDeliveryAuthorized:false;
  deliveryExecuted:false;
  persisted:false;
  maiaPromptMutated:false;
  productionAuthority:false;
  expiresWithProgrammeBoundary:true;
}

export interface ReflectionDeliveryGateResult {
  gatePassed:boolean;
  errors:string[];
  token:SyntheticReflectionHandoffToken|null;
  candidateValiditySelfAuthorized:false;
  memberFacingDeliveryAuthorized:false;
  deliveryExecuted:false;
  persistenceAuthorized:false;
  productionAuthority:false;
}

export function authorizeSyntheticReflectionHandoff(
  candidate:SyntheticReflectionCandidate,
  authorization:SyntheticHumanDeliveryAuthorization|null,
):ReflectionDeliveryGateResult{
  const errors:string[]=[];

  if(candidate.deliverable!==false) errors.push('candidate_delivery_flag_already_open');
  if(candidate.memberFacingDelivered!==false) errors.push('candidate_already_member_facing');
  if(candidate.persisted!==false) errors.push('candidate_already_persisted');
  if(candidate.maiaPromptMutated!==false) errors.push('candidate_already_mutated_maia_prompt');
  if(candidate.productionAuthority!==false) errors.push('candidate_has_production_authority');
  if(candidate.finalMeaningAuthority!=='member') errors.push('candidate_final_meaning_not_member_owned');
  if(candidate.provisional!==true) errors.push('candidate_not_provisional');
  if(candidate.correctionInvited!==true) errors.push('candidate_not_corrigible');

  if(!authorization){
    errors.push('explicit_human_authorization_required');
  } else {
    if(authorization.actor!=='human') errors.push('authorization_actor_not_human');
    if(authorization.authorized!==true) errors.push('human_authorization_not_granted');
    if(authorization.scope!=='synthetic_handoff_only') errors.push('authorization_scope_invalid');
    if(authorization.candidateRef!==candidate.candidateRef){
      errors.push('authorization_candidate_mismatch');
    }
    if(!authorization.authorizationRef.trim()) errors.push('authorization_ref_required');
    if(!authorization.note.trim()) errors.push('authorization_note_required');
  }

  if(errors.length>0){
    return {
      gatePassed:false,
      errors,
      token:null,
      candidateValiditySelfAuthorized:false,
      memberFacingDeliveryAuthorized:false,
      deliveryExecuted:false,
      persistenceAuthorized:false,
      productionAuthority:false,
    };
  }

  const token:SyntheticReflectionHandoffToken={
    tokenRef:'synthetic-handoff:'+authorization!.authorizationRef,
    candidateRef:candidate.candidateRef,
    authorizationRef:authorization!.authorizationRef,
    authorizedBy:'human',
    scope:'synthetic_handoff_only',
    handoffEligible:true,
    candidateText:candidate.text,
    candidateProvenanceRef:candidate.patternRef,
    syntheticOnly:true,
    memberFacingDeliveryAuthorized:false,
    deliveryExecuted:false,
    persisted:false,
    maiaPromptMutated:false,
    productionAuthority:false,
    expiresWithProgrammeBoundary:true,
  };

  return {
    gatePassed:true,
    errors:[],
    token,
    candidateValiditySelfAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    deliveryExecuted:false,
    persistenceAuthorized:false,
    productionAuthority:false,
  };
}
