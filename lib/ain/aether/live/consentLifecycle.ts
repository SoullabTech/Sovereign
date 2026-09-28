import type { LiveAetherConsentGrant } from './liveInputContract';

export type LiveConsentState=
  | 'valid'
  | 'consumed'
  | 'expired'
  | 'revoked'
  | 'invalid';

export interface LiveConsentLifecycleRecord {
  consentRef:string;
  grantedAt:string;
  expiresAt:string;
  revokedAt?:string;
  consumedAt?:string;
  sessionRef?:string;
}

export interface LiveConsentUseRequest {
  memberRef:string;
  consentRef:string;
  sessionRef?:string;
  now:string;
}

export interface LiveConsentEvaluation {
  valid:boolean;
  state:LiveConsentState;
  errors:string[];
  reusable:boolean;
  consumeOnUse:boolean;
  validUntil:string|null;
}

function timestamp(value:string){
  const parsed=Date.parse(value);
  return Number.isNaN(parsed)?null:parsed;
}

export function evaluateLiveConsent(
  grant:LiveAetherConsentGrant,
  lifecycle:LiveConsentLifecycleRecord,
  request:LiveConsentUseRequest,
):LiveConsentEvaluation{
  const errors:string[]=[];

  if(grant.consentRef!==lifecycle.consentRef) errors.push('lifecycle_consent_ref_mismatch');
  if(grant.consentRef!==request.consentRef) errors.push('request_consent_ref_mismatch');
  if(grant.memberRef!==request.memberRef) errors.push('request_member_mismatch');

  const now=timestamp(request.now);
  const grantedAt=timestamp(lifecycle.grantedAt);
  const expiresAt=timestamp(lifecycle.expiresAt);
  const revokedAt=lifecycle.revokedAt?timestamp(lifecycle.revokedAt):null;
  const consumedAt=lifecycle.consumedAt?timestamp(lifecycle.consumedAt):null;

  if(now===null) errors.push('invalid_request_time');
  if(grantedAt===null) errors.push('invalid_granted_at');
  if(expiresAt===null) errors.push('invalid_expires_at');
  if(revokedAt===null&&lifecycle.revokedAt) errors.push('invalid_revoked_at');
  if(consumedAt===null&&lifecycle.consumedAt) errors.push('invalid_consumed_at');

  if(errors.length>0){
    return {
      valid:false,
      state:'invalid',
      errors,
      reusable:false,
      consumeOnUse:grant.scope==='aether_read_once',
      validUntil:null,
    };
  }

  if(revokedAt!==null&&revokedAt!<=now!){
    return {
      valid:false,
      state:'revoked',
      errors:['consent_revoked'],
      reusable:false,
      consumeOnUse:grant.scope==='aether_read_once',
      validUntil:lifecycle.revokedAt??null,
    };
  }

  if(now!<grantedAt!){
    return {
      valid:false,
      state:'invalid',
      errors:['consent_not_yet_valid'],
      reusable:false,
      consumeOnUse:grant.scope==='aether_read_once',
      validUntil:lifecycle.expiresAt,
    };
  }

  if(now!>=expiresAt!){
    return {
      valid:false,
      state:'expired',
      errors:['consent_expired'],
      reusable:false,
      consumeOnUse:grant.scope==='aether_read_once',
      validUntil:lifecycle.expiresAt,
    };
  }

  if(grant.scope==='aether_read_once'&&consumedAt!==null){
    return {
      valid:false,
      state:'consumed',
      errors:['consent_already_consumed'],
      reusable:false,
      consumeOnUse:true,
      validUntil:lifecycle.expiresAt,
    };
  }

  if(grant.scope==='aether_session_read'){
    if(!lifecycle.sessionRef) errors.push('session_scope_missing_session_ref');
    if(!request.sessionRef) errors.push('request_session_ref_required');
    if(lifecycle.sessionRef&&request.sessionRef&&lifecycle.sessionRef!==request.sessionRef){
      errors.push('session_ref_mismatch');
    }
  }

  if(errors.length>0){
    return {
      valid:false,
      state:'invalid',
      errors,
      reusable:false,
      consumeOnUse:false,
      validUntil:lifecycle.expiresAt,
    };
  }

  return {
    valid:true,
    state:'valid',
    errors:[],
    reusable:grant.scope==='aether_session_read',
    consumeOnUse:grant.scope==='aether_read_once',
    validUntil:lifecycle.expiresAt,
  };
}

export function consumeReadOnceConsent(
  grant:LiveAetherConsentGrant,
  lifecycle:LiveConsentLifecycleRecord,
  consumedAt:string,
):LiveConsentLifecycleRecord{
  if(grant.scope!=='aether_read_once'){
    return {...lifecycle};
  }
  return {...lifecycle,consumedAt};
}

export function revokeLiveConsent(
  lifecycle:LiveConsentLifecycleRecord,
  revokedAt:string,
):LiveConsentLifecycleRecord{
  return {...lifecycle,revokedAt};
}
