import { REQUIRED } from './contract.mjs';
const clone=v=>structuredClone(v);
export function evaluate(input){
  const i=clone(input);
  const reasons=[];
  if(i.readiness!==REQUIRED.readiness) reasons.push('R5A_NOT_READY');
  if(i.grant!==REQUIRED.grant) reasons.push('E1_GRANT_NOT_ACTIVE');
  if(i.session!==REQUIRED.session) reasons.push('SESSION_NOT_ADMITTED');
  if(i.lifecycle!==REQUIRED.lifecycle) reasons.push('LIFECYCLE_NOT_ROUTED');
  if(i.route_fresh!==true) reasons.push('ROUTE_NOT_FRESH');
  if(i.authorized_core_fresh!==true) reasons.push('AUTHORIZED_CORE_NOT_FRESH');
  return Object.freeze({
    disposition:reasons.length?'HELD':'ADMISSIBLE',
    reasons:Object.freeze(reasons),
    dispatch_authorized:false,
    session_opened:false,
    grant_claimed:false,
    lifecycle_transitioned:false,
  });
}
