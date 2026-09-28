import type { AetherConnectorQueryPlan } from './queryPlan';
import {
  adjudicateReviewedQueryPlan,
  fingerprintQueryPlan,
  type HumanQueryPlanReview,
  type QueryPlanFingerprint,
} from './planReviewCustody';

export interface HumanExecutionAuthorization {
  authorizationRef:string;
  actor:'human';
  queryRef:string;
  fingerprint:QueryPlanFingerprint;
  authorized:boolean;
  issuedAt:string;
  expiresAt:string;
  note:string;
}

export interface ConnectorExecutionToken {
  tokenRef:string;
  queryRef:string;
  fingerprint:QueryPlanFingerprint;
  authorizationRef:string;
  authorizedBy:'human';
  issuedAt:string;
  expiresAt:string;
  oneShot:true;
  consumed:boolean;
  executionEligible:boolean;
  connectorExecutionImplemented:false;
  executionOccurred:false;
  recordReadExecuted:false;
  recordCountRead:0;
  persistenceAuthorized:false;
  memberFacingDeliveryAuthorized:false;
  maiaPromptMutationAuthorized:false;
  productionAuthority:false;
}

export interface ExecutionTokenAdjudication {
  issued:boolean;
  errors:string[];
  token:ConnectorExecutionToken|null;
  executionAuthorized:false;
  recordReadExecuted:false;
  recordCountRead:0;
  persistenceAuthorized:false;
  memberFacingDeliveryAuthorized:false;
  maiaPromptMutationAuthorized:false;
  productionAuthority:false;
}

export interface ExecutionTokenUseResult {
  usable:boolean;
  errors:string[];
  token:ConnectorExecutionToken;
  executorPresent:false;
  executionOccurred:false;
  recordReadExecuted:false;
  recordCountRead:0;
}

function parseTime(value:string){
  const parsed=Date.parse(value);
  return Number.isNaN(parsed)?null:parsed;
}

export function issueExecutionToken(
  plan:AetherConnectorQueryPlan,
  review:HumanQueryPlanReview|null,
  authorization:HumanExecutionAuthorization|null,
):ExecutionTokenAdjudication{
  const errors:string[]=[];
  const reviewResult=adjudicateReviewedQueryPlan(plan,review);
  if(!reviewResult.reviewBound){
    errors.push(...reviewResult.errors.map(e=>'review:'+e));
  }

  const current=fingerprintQueryPlan(plan);

  if(!authorization){
    errors.push('fresh_human_execution_authorization_required');
  } else {
    if(authorization.actor!=='human') errors.push('authorization_actor_not_human');
    if(authorization.queryRef!==plan.queryRef) errors.push('authorization_query_ref_mismatch');
    if(authorization.fingerprint.algorithm!=='sha256') errors.push('authorization_fingerprint_algorithm_mismatch');
    if(authorization.fingerprint.canonicalVersion!=='aether-query-plan-v1'){
      errors.push('authorization_fingerprint_version_mismatch');
    }
    if(authorization.fingerprint.digest!==current.digest){
      errors.push('authorization_fingerprint_mismatch');
    }
    if(authorization.authorized!==true) errors.push('human_execution_authorization_not_granted');
    if(!authorization.authorizationRef.trim()) errors.push('authorization_ref_required');
    if(!authorization.note.trim()) errors.push('authorization_note_required');

    const issued=parseTime(authorization.issuedAt);
    const expires=parseTime(authorization.expiresAt);
    if(issued===null) errors.push('authorization_issued_at_invalid');
    if(expires===null) errors.push('authorization_expires_at_invalid');
    if(issued!==null&&expires!==null&&issued>=expires){
      errors.push('authorization_expiry_invalid');
    }
  }

  if(errors.length>0){
    return {
      issued:false,
      errors:[...new Set(errors)],
      token:null,
      executionAuthorized:false,
      recordReadExecuted:false,
      recordCountRead:0,
      persistenceAuthorized:false,
      memberFacingDeliveryAuthorized:false,
      maiaPromptMutationAuthorized:false,
      productionAuthority:false,
    };
  }

  const token:ConnectorExecutionToken={
    tokenRef:'aether-exec-token:'+authorization!.authorizationRef,
    queryRef:plan.queryRef,
    fingerprint:current,
    authorizationRef:authorization!.authorizationRef,
    authorizedBy:'human',
    issuedAt:authorization!.issuedAt,
    expiresAt:authorization!.expiresAt,
    oneShot:true,
    consumed:false,
    executionEligible:true,
    connectorExecutionImplemented:false,
    executionOccurred:false,
    recordReadExecuted:false,
    recordCountRead:0,
    persistenceAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    maiaPromptMutationAuthorized:false,
    productionAuthority:false,
  };

  return {
    issued:true,
    errors:[],
    token,
    executionAuthorized:false,
    recordReadExecuted:false,
    recordCountRead:0,
    persistenceAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    maiaPromptMutationAuthorized:false,
    productionAuthority:false,
  };
}

export function validateExecutionTokenForNextGate(
  token:ConnectorExecutionToken,
  plan:AetherConnectorQueryPlan,
  now:string,
):ExecutionTokenUseResult{
  const errors:string[]=[];
  const current=fingerprintQueryPlan(plan);
  const nowTime=parseTime(now);
  const expires=parseTime(token.expiresAt);

  if(token.queryRef!==plan.queryRef) errors.push('token_query_ref_mismatch');
  if(token.fingerprint.digest!==current.digest) errors.push('token_fingerprint_mismatch');
  if(token.oneShot!==true) errors.push('token_not_one_shot');
  if(token.consumed!==false) errors.push('token_already_consumed');
  if(token.executionEligible!==true) errors.push('token_not_execution_eligible');
  if(token.connectorExecutionImplemented!==false) errors.push('connector_executor_present_forbidden_in_r5');
  if(nowTime===null) errors.push('token_check_time_invalid');
  if(expires===null) errors.push('token_expiry_invalid');
  if(nowTime!==null&&expires!==null&&nowTime>=expires) errors.push('token_expired');

  return {
    usable:errors.length===0,
    errors:[...new Set(errors)],
    token,
    executorPresent:false,
    executionOccurred:false,
    recordReadExecuted:false,
    recordCountRead:0,
  };
}

export function consumeExecutionTokenWithoutExecution(
  token:ConnectorExecutionToken,
):ConnectorExecutionToken{
  return {
    ...token,
    consumed:true,
    executionEligible:false,
    connectorExecutionImplemented:false,
    executionOccurred:false,
    recordReadExecuted:false,
    recordCountRead:0,
    persistenceAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    maiaPromptMutationAuthorized:false,
    productionAuthority:false,
  };
}
