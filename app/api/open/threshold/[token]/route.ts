export const runtime='nodejs';
export const dynamic='force-dynamic';
import {NextRequest,NextResponse} from 'next/server';
import {
  appendEncounterConsentDecision,
  decideStoredEncounterConsent,
  loadEncounterConsentContext,
  scopeFromContext,
} from '@/lib/encounters/consentLedgerStore';
import type {EncounterConsentAction,EncounterConsentPurpose} from '@/lib/encounters/consentDecision';
import {JOIN_CONSENT_TEXT,RECORD_CONSENT_TEXT,verifyThresholdToken} from '@/lib/encounters/threshold';
const THRESHOLD_PURPOSES=new Set<EncounterConsentPurpose>(['join','record_audio']);
const ACTIONS=new Set<EncounterConsentAction>(['grant','refuse','revoke']);
async function loadThresholdContext(token:string){
  const claims=verifyThresholdToken(token);if(!claims)return null;
  const context=await loadEncounterConsentContext(claims.encounterId,claims.participantId);
  if(!context||context.agreementVersion!==claims.agreementVersion||context.generation!==claims.generation)return null;
  return {claims,context};
}
export async function GET(_request:NextRequest,{params}:{params:Promise<{token:string}>}){
 try{
  const {token}=await params;const loaded=await loadThresholdContext(token);
  if(!loaded)return NextResponse.json({error:'Invalid, expired, or superseded threshold link'},{status:404});
  const joinScope=scopeFromContext(loaded.context,'join');
  const recordScope=scopeFromContext(loaded.context,'record_audio');
  const [joinDecision,recordDecision]=await Promise.all([
    decideStoredEncounterConsent(joinScope),decideStoredEncounterConsent(recordScope),
  ]);
  return NextResponse.json({encounterId:loaded.context.encounterId,displayName:loaded.context.displayName,
    role:loaded.context.role,agreementVersion:loaded.context.agreementVersion,generation:loaded.context.generation,
    joinConsentText:JOIN_CONSENT_TEXT,recordConsentText:RECORD_CONSENT_TEXT,
    joined:joinDecision.allowed,recordConsented:recordDecision.allowed,
    joinDecision:joinDecision.reason,recordDecision:recordDecision.reason});
 }catch(error){console.error('[Threshold/open] GET error:',error instanceof Error?error.name:'unknown');
  return NextResponse.json({error:'Failed to load threshold'},{status:500});}
}
export async function POST(request:NextRequest,{params}:{params:Promise<{token:string}>}){
 try{
  const {token}=await params;const loaded=await loadThresholdContext(token);
  if(!loaded)return NextResponse.json({error:'Invalid, expired, or superseded threshold link'},{status:404});
  let body:{purpose?:unknown;action?:unknown};try{body=await request.json();}catch{body={};}
  if(typeof body.purpose!=='string'||!THRESHOLD_PURPOSES.has(body.purpose as EncounterConsentPurpose)
     ||typeof body.action!=='string'||!ACTIONS.has(body.action as EncounterConsentAction))
    return NextResponse.json({error:'purpose and action must name one supported decision'},{status:400});
  const purpose=body.purpose as EncounterConsentPurpose;const action=body.action as EncounterConsentAction;
  const scope=scopeFromContext(loaded.context,purpose);
  await appendEncounterConsentDecision({...scope,action,textSnapshot:action==='grant'
    ?(purpose==='join'?JOIN_CONSENT_TEXT:RECORD_CONSENT_TEXT):null});
  const decision=await decideStoredEncounterConsent(scope);
  console.log('[Threshold/open] consent decision appended',{purpose,action,
    encounterIdPrefix:loaded.context.encounterId.slice(0,8),participantIdPrefix:loaded.context.participantId.slice(0,8)});
  return NextResponse.json({ok:true,purpose,action,allowed:decision.allowed,reason:decision.reason,
    agreementVersion:scope.agreementVersion,generation:scope.generation});
 }catch(error){
  if(error instanceof Error&&error.message==='CONSENT_SCOPE_STALE_OR_UNKNOWN')
   return NextResponse.json({error:'The consent agreement changed; reopen the current threshold link'},{status:409});
  console.error('[Threshold/open] POST error:',error instanceof Error?error.name:'unknown');
  return NextResponse.json({error:'Failed to record consent decision'},{status:500});}
}
