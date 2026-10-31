/** Session Room door — current, participant-authored join consent opens signaling. */
import { decideEncounterConsent } from './consentDecision';
import {
  loadEncounterConsentContext,
  loadEncounterConsentEvents,
  scopeFromContext,
} from './consentLedgerStore';
import { verifyThresholdToken } from './threshold';
export type RoomEntry =
  | { ok:true;encounterId:string;participantId:string;role:string;displayName:string;agreementVersion:string;generation:number }
  | { ok:false;status:403|404;reason:'invalid_token'|'wrong_room'|'unknown_participant'|'stale_consent_scope'|'no_consent'|'ambiguous_consent' };
export async function authorizeRoomEntry(token:string,roomId:string):Promise<RoomEntry>{
  const claims=verifyThresholdToken(token);
  if(!claims)return {ok:false,status:404,reason:'invalid_token'};
  if(claims.encounterId!==roomId)return {ok:false,status:403,reason:'wrong_room'};
  const context=await loadEncounterConsentContext(claims.encounterId,claims.participantId);
  if(!context)return {ok:false,status:404,reason:'unknown_participant'};
  if(context.agreementVersion!==claims.agreementVersion||context.generation!==claims.generation)
    return {ok:false,status:403,reason:'stale_consent_scope'};
  const scope=scopeFromContext(context,'join');
  const decision=decideEncounterConsent(await loadEncounterConsentEvents(scope),scope);
  if(!decision.allowed){
    return {ok:false,status:403,reason:decision.reason==='ambiguous_latest_event'||decision.reason==='invalid_event'
      ?'ambiguous_consent':'no_consent'};
  }
  return {ok:true,encounterId:context.encounterId,participantId:context.participantId,
    role:context.role,displayName:context.displayName,agreementVersion:context.agreementVersion,
    generation:context.generation};
}
