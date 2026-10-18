/**
 * R1P — real NextRequest trust boundary for a PRIVATE member-authored option.
 *
 * Future protected Writer HTTP route may invoke this only after a separately
 * reviewed production key custodian, HTTPS/CSRF configuration, storage,
 * backup/restore and release GO. The shipped route is COMPILE-TIME CLOSED.
 *
 * The browser may offer only a selected original passage and its MEMBER
 * authored alternative. It NEVER chooses identity, Work key, served provider,
 * a proposal author, approval token or whether editing is enabled.
 *
 * Authentication uses ONLY the credential attached to this actual request
 * and auth_sessions lookup. Ambient `cookies()` must not influence it.
 */
import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {getMemberIdFromSessionToken} from '@/lib/auth/getMemberFromRequest';
import {approvedBetaConsentPolicy} from '@/lib/writersStudio/betaConsentGate';
import {
  stagePrivateMemberCandidateR1O,
  R1O_REAL_MEMBER_EDITORIAL_ROUTE_RELEASED,
} from './privateMemberCandidateR1O';
import type {WorkEncryptionKey} from '@/lib/writersStudio/recovery/workEnvelopeV1';
import {privateWriterNoStore} from './privateWriterNoStore';

export const R1P_REAL_MEMBER_PRIVATE_CANDIDATE_ROUTE_RELEASED=false as const;
export const R1P_PROTOCOL='soullab.ws.r1p.authenticated-private-author-gate.held.v1' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REQUEST_FIELDS=[
  'kind','manuscriptId','livingWorkId','draftId','sectionId',
  'baseVersion','selectedOriginal','replacementText',
].sort();
export const R1P_BOUND_ROUTE='/api/sovereign/writers-studio/private-member-candidates' as const;
const respond=(status:number,kind:string,extra:Record<string,unknown>={})=>
  privateWriterNoStore(NextResponse.json({
    protocol:R1P_PROTOCOL,kind,releaseApproved:false,
    canApply:false,canUndo:false,...extra,
  },{status,headers:{'Vary':'Cookie, Origin, x-session-token',
    'X-Content-Type-Options':'nosniff'}}));

export type R1PTrustedKeyGrant=Readonly<{
  kind:'managed_exact_member_work_key';
  memberId:string;manuscriptId:string;
  workKey:WorkEncryptionKey;
}>;
export type R1PTrustedRuntime=Readonly<{
  /** Production adapter must read a separately governed server-side key;
   * no browser header/JSON/env fallback is permitted here. */
  getWorkKey:(memberId:string,manuscriptId:string)=>Promise<R1PTrustedKeyGrant|null>;
  resolveSession:(token:string)=>Promise<string|null>;
  stage:typeof stagePrivateMemberCandidateR1O;
  allowedOrigins:readonly string[];
  policy:ReturnType<typeof approvedBetaConsentPolicy>;
}>;

/** Production routes pass this resolver; remains unavailable until key service
 * integration is independently qualified. Never use PHI/integration keys. */
export async function unconfiguredManagedWorkKeyR1P(
 _memberId:string,_manuscriptId:string,
):Promise<R1PTrustedKeyGrant|null>{return null;}

function validOrigin(req:NextRequest,allowed:readonly string[]):boolean{
 const raw=req.headers.get('origin');
 if(!raw||raw==='null'||req.headers.get('sec-fetch-site')==='cross-site')return false;
 if(req.headers.get('sec-fetch-site')==='same-site')return false;
 try{
  const u=new URL(raw);
  if(u.username||u.password||u.search||u.hash||u.pathname!=='/' ||
     u.protocol!=='https:'||u.origin!==raw||!allowed.includes(u.origin))
    return false;
  // Host must correspond to the trusted HTTPS browser Origin. Forwarded
  // headers are NOT independent client authorization claims.
  if(req.headers.get('host')?.toLowerCase()!==u.host.toLowerCase())return false;
  const forwarded=req.headers.get('x-forwarded-host');
  if(forwarded&&forwarded.toLowerCase()!==u.host.toLowerCase())return false;
  return req.nextUrl.searchParams.size===0;
 }catch{return false;}
}
function validJsonBody(body:unknown):body is {
 kind:'stage_member_suggestion';manuscriptId:string;livingWorkId:string;
 draftId:string;sectionId:string;baseVersion:number;
 selectedOriginal:string;replacementText:string;
}{
 if(!body||typeof body!=='object'||Array.isArray(body))return false;
 const v=body as Record<string,unknown>;
 if(Object.keys(v).sort().join('|')!==REQUEST_FIELDS.join('|')||
    v.kind!=='stage_member_suggestion'||
    ![v.manuscriptId,v.livingWorkId,v.draftId,v.sectionId]
      .every(x=>typeof x==='string'&&UUID.test(x))||
    typeof v.baseVersion!=='number'||!Number.isSafeInteger(v.baseVersion)||v.baseVersion<1)
   return false;
 return [v.selectedOriginal,v.replacementText].every(x=>
   typeof x==='string'&&x.length>0&&Buffer.byteLength(x,'utf8')<=2000&&
   Buffer.from(x,'utf8').toString('utf8')===x);
}

/** Bound chunked request bytes BEFORE parsing; Content-Length may be absent
 * or forged, so even streams with unknown length cannot exhaust memory. */
async function boundedJsonText(request:NextRequest):Promise<
  {kind:'bytes';text:string}|{kind:'too_large'}|{kind:'invalid'}
>{
  if(!request.body)return {kind:'invalid'};
  const reader=request.body.getReader();
  const chunks:Uint8Array[]=[];
  let bytes=0;
  try{
    while(true){
      const next=await reader.read();
      if(next.done)break;
      bytes+=next.value.byteLength;
      if(bytes>8192){
        await reader.cancel().catch(()=>{});
        return {kind:'too_large'};
      }
      chunks.push(next.value);
    }
    const data=Buffer.concat(chunks.map(c=>Buffer.from(c)),bytes);
    const text=new TextDecoder('utf-8',{fatal:true}).decode(data);
    return {kind:'bytes',text};
  }catch{return {kind:'invalid'};}
  finally{reader.releaseLock();}
}

/** Callable only by a trusted server adapter, not exported as an HTTP route.
 * `resolveSession` and `getWorkKey` are dependency-injected for bounded tests.
 */
export async function handleVerifiedPrivateMemberCandidateR1P(
 req:NextRequest, trusted:R1PTrustedRuntime,
):Promise<NextResponse>{
 if(req.method!=='POST'||req.nextUrl.pathname!==R1P_BOUND_ROUTE)
  return respond(405,'method_not_allowed');
 if(!validOrigin(req,trusted.allowedOrigins))return respond(403,'invalid_origin');
 if(!/^application\/json(?:;\s*charset=utf-8)?$/i.test(req.headers.get('content-type')||''))
  return respond(415,'json_required');
 const cookie=req.cookies.get('maia_session')?.value??null;
 const bearer=req.headers.get('x-session-token');
 if(cookie&&bearer&&cookie!==bearer)return respond(403,'conflicting_session_credentials');
 const token=bearer||cookie;
 if(!token||token.length>256)return respond(401,'authentication_required');
 // A former client may send x-member-id, but it can ONLY be checked against
 // auth_sessions, never treated as an identity or source of Work authority.
 let memberId:string|null;
 try{memberId=await trusted.resolveSession(token);}
 catch{return respond(503,'authentication_unavailable');}
 if(!memberId||!UUID.test(memberId))return respond(401,'authentication_required');
 const claim=req.headers.get('x-member-id')||req.cookies.get('maia_member_id')?.value||null;
 if(claim&&claim!==memberId)return respond(403,'conflicting_member_claim');
 if(!trusted.policy)return respond(503,'policy_unavailable');
 const length=req.headers.get('content-length');
 if(length&&(!/^\d{1,8}$/.test(length)||Number(length)>8192))return respond(413,'request_too_large');
 const read=await boundedJsonText(req);
 if(read.kind==='too_large')return respond(413,'request_too_large');
 if(read.kind==='invalid')return respond(400,'invalid_json');
 let body:unknown;
 try{body=JSON.parse(read.text);}
 catch{return respond(400,'invalid_json');}
 if(!validJsonBody(body))return respond(400,'untrusted_author_action');
 const manuscriptId=body.manuscriptId;
 let grant:R1PTrustedKeyGrant|null;
 try{grant=await trusted.getWorkKey(memberId,manuscriptId);}
 catch{return respond(503,'managed_custody_unavailable');}
 if(!grant||grant.kind!=='managed_exact_member_work_key'||
    grant.memberId!==memberId||grant.manuscriptId!==manuscriptId||
    !grant.workKey||!UUID.test(grant.workKey.keyId)||
    !Buffer.isBuffer(grant.workKey.keyBytes)||grant.workKey.keyBytes.length!==32)
  return respond(503,'managed_custody_unavailable');
 try{
  const stage=await trusted.stage({
    scope:{memberId,manuscriptId,livingWorkId:body.livingWorkId,
      draftId:body.draftId,sectionId:body.sectionId,
      baseVersion:body.baseVersion},
    policy:trusted.policy,author:'member',
    selectedOriginal:body.selectedOriginal,
    replacementText:body.replacementText,workKey:grant.workKey,
  });
  if(stage.kind!=='encrypted_member_candidate_pending')
    return respond(409,'private_candidate_not_current');
  return respond(201,'encrypted_member_candidate_pending',{
    candidateId:stage.candidateId,baseVersion:stage.baseVersion,
    author:'member',
  });
 }catch{
  // No DB/encryption/prose/keys in client errors. Infrastructure exceptions
  // never fall through to old plaintext writer or infer permission to Apply.
  return respond(503,'private_candidate_unavailable');
 }
}

/** Always unbound unless a separately reviewed production key custodian, exact
 * origin config, authenticated browser and release flag are all ratified. */
export async function serveHeldPrivateMemberCandidateR1P(req:NextRequest):Promise<NextResponse>{
 if(R1P_REAL_MEMBER_PRIVATE_CANDIDATE_ROUTE_RELEASED===false||
    R1O_REAL_MEMBER_EDITORIAL_ROUTE_RELEASED===false)
  return respond(404,'not_released');
 // Deliberately no secret manager fallback here. A future independently
 // reviewed integration must replace this hold with a real managed adapter.
 return handleVerifiedPrivateMemberCandidateR1P(req,{
  getWorkKey:unconfiguredManagedWorkKeyR1P,
  resolveSession:getMemberIdFromSessionToken,
  stage:stagePrivateMemberCandidateR1O,
  allowedOrigins:['https://soullab.life','https://beta.soullab.life'],
  policy:approvedBetaConsentPolicy(
    process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION,
    process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256,
  ),
 });
}
