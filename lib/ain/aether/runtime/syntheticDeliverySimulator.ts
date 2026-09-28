import type { SyntheticReflectionHandoffToken } from './reflectionDeliveryGate';

export interface SyntheticDeliveryReceipt {
  receiptRef:string;
  tokenRef:string;
  candidateRef:string;
  simulation:'no_op_sink';
  consumed:true;
  memberFacingContacted:false;
  deliveryExecuted:false;
  persisted:false;
  notificationSent:false;
  maiaPromptMutated:false;
  networkSideEffect:false;
  productionAuthority:false;
  auditNote:string;
}

export interface SyntheticDeliverySimulationResult {
  simulated:boolean;
  errors:string[];
  receipt:SyntheticDeliveryReceipt|null;
}

export function simulateSyntheticDelivery(
  token:SyntheticReflectionHandoffToken,
):SyntheticDeliverySimulationResult{
  const errors:string[]=[];

  if(token.syntheticOnly!==true) errors.push('token_not_synthetic_only');
  if(token.scope!=='synthetic_handoff_only') errors.push('token_scope_invalid');
  if(token.handoffEligible!==true) errors.push('token_not_handoff_eligible');
  if(token.memberFacingDeliveryAuthorized!==false){
    errors.push('member_facing_authority_present');
  }
  if(token.deliveryExecuted!==false) errors.push('token_already_delivered');
  if(token.persisted!==false) errors.push('token_already_persisted');
  if(token.maiaPromptMutated!==false) errors.push('token_maia_prompt_already_mutated');
  if(token.productionAuthority!==false) errors.push('token_has_production_authority');

  if(errors.length>0){
    return {simulated:false,errors,receipt:null};
  }

  return {
    simulated:true,
    errors:[],
    receipt:{
      receiptRef:'synthetic-delivery-receipt:'+token.tokenRef,
      tokenRef:token.tokenRef,
      candidateRef:token.candidateRef,
      simulation:'no_op_sink',
      consumed:true,
      memberFacingContacted:false,
      deliveryExecuted:false,
      persisted:false,
      notificationSent:false,
      maiaPromptMutated:false,
      networkSideEffect:false,
      productionAuthority:false,
      auditNote:'Synthetic handoff token consumed by no-op sink; no member-facing or persistent effect occurred.',
    },
  };
}
