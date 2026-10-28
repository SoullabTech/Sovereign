export const runtime='nodejs';
export const dynamic='force-dynamic';
import {createHash} from 'crypto';
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
const RATE_WINDOW_MS=60_000;const RATE_MAX=12;const decisionHits=new Map<string,number[]>();
function rateLimited(token:string,now=Date.now()):boolean{
 const key=createHash('sha256').update(token).digest('hex');
 if(decisionHits.size>512){for(const [k,v] of decisionHits)if(v.every(t=>now-t>=RATE_WINDOW_MS))decisionHits.delete(k);}
 const recent=(decisionHits.get(key)??[]).filter(t=>now-t<RATE_WINDOW_MS);
 if(recent.length>=RATE_MAX){decisionHits.set(key,recent);return true;}
 recent.push(now);decisionHits.set(key,recent);return false;
}
function sameDecision(action:EncounterConsentAction,reason:string):boolean{
 return (action==='grant'&&reason==='granted')||(action==='refuse'&&reason==='refused')||(action==='revoke'&&reason==='revoked');
}
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
  const before=await decideStoredEncounterConsent(scope);
  if(before.reason==='revoked'&&action!=='revoke')
    return NextResponse.json({error:'A new consent generation and invitation are required after revocation'},{status:409});
  if(sameDecision(action,before.reason))
    return NextResponse.json({ok:true,purpose,action,allowed:before.allowed,reason:before.reason,
      agreementVersion:scope.agreementVersion,generation:scope.generation,reused:true});
  if(rateLimited(token))return NextResponse.json({error:'Too many consent decisions for this link'},{status:429});
  try{
   await appendEncounterConsentDecision({...scope,action,textSnapshot:action==='grant'
     ?(purpose==='join'?JOIN_CONSENT_TEXT:RECORD_CONSENT_TEXT):null});
  }catch(error){
   if(error instanceof Error&&error.message==='CONSENT_GENERATION_CLOSED')
    return NextResponse.json({error:'A new consent generation and invitation are required after revocation'},{status:409});
   throw error;
  }
  const decision=await decideStoredEncounterConsent(scope);
  console.log('[Threshold/open] consent decision appended',{purpose,action});
  return NextResponse.json({ok:true,purpose,action,allowed:decision.allowed,reason:decision.reason,
    agreementVersion:scope.agreementVersion,generation:scope.generation,reused:false});
 }catch(error){
  if(error instanceof Error&&error.message==='CONSENT_SCOPE_STALE_OR_UNKNOWN')
   return NextResponse.json({error:'The consent agreement changed; reopen the current threshold link'},{status:409});
  console.error('[Threshold/open] POST error:',error instanceof Error?error.name:'unknown');
  return NextResponse.json({error:'Failed to record consent decision'},{status:500});}
}
