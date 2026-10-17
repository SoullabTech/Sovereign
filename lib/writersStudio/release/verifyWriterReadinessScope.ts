/**
 * REAL server principal + beta consent + legacy manuscript ownership preflight.
 * READ ONLY. It does not grant protected Work access or authorize ANY write.
 * All stronger R42/R46/R47/R48 Work/key authorities remain separately HELD.
 */
import type {NextRequest} from 'next/server';
import {query} from '@/lib/db/postgres';
import {getMemberIdFromRequest} from '@/lib/auth/getMemberFromRequest';
import {writersStudioBetaAccess} from '@/lib/writersStudio/betaAccessServer';
import {
 approvedBetaConsentPolicy,hasActiveWriterBetaConsent,
} from '@/lib/writersStudio/betaConsentGate';

export const WS_REAL_PROTECTED_MEMBER_WRITES_ENABLED=false as const;
export const WS_PROTECTED_READINESS_PROTOCOL=
 'soullab.ws.real-protected-readiness.held.v1' as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

export type VerifiedWriterReadinessScope={
 readonly kind:'verified_member_owns_legacy_manuscript';
 readonly memberId:string;readonly manuscriptId:string;
 /** Explicitly NOT a protected Work/key/consent-to-write authority. */
 readonly mayWrite:false;readonly releaseApproved:false;
};
export type WriterReadinessScopeResult=
 | VerifiedWriterReadinessScope
 | {readonly kind:'refused';readonly status:400|401|403|404|503;
    readonly reason:'malformed_request'|'missing_session'|
     'conflicting_credentials'|'not_in_approved_group_or_no_consent'|
     'not_an_owned_manuscript'|'read_authority_unavailable';
    readonly releaseApproved:false};
const refuse=(status:400|401|403|404|503,
 reason:Extract<WriterReadinessScopeResult,{kind:'refused'}>['reason']
):WriterReadinessScopeResult=>({
 kind:'refused',status,reason,releaseApproved:false,
});

/**
 * Uses actual auth_sessions-backed identity, server-side beta permission,
 * latest member consent and an owner-scoped EXISTENCE query only.
 * No original, draft, Keeps, source text, filenames or keys are accessed.
 *
 * A success result is SERVER INTERNAL and CANNOT be used as write authority.
 */
export async function verifyWriterReadinessScope(
 request:NextRequest,manuscriptId:string,
):Promise<WriterReadinessScopeResult>{
 if(process.env.CAPACITOR_BUILD||
    process.env.MAIA_CABIN_MODE==='offline'||
    process.env.WRITERS_STUDIO_RESTRICTED_BETA!=='true')
  return refuse(404,'not_in_approved_group_or_no_consent');
 if(request.method!=='GET'||!UUID.test(manuscriptId??'')||
   request.nextUrl.search!==''||
   request.nextUrl.pathname!==
     '/api/sovereign/writers-studio/manuscripts/'+manuscriptId+
      '/protected-readiness')
  return refuse(400,'malformed_request');

 // Historical cookie precedence can conceal a DIFFERENT simultaneously
 // submitted Safari token. Refuse such conflicts before a database read.
 const cookie=request.cookies.get('maia_session')?.value||null;
 const header=request.headers.get('x-session-token');
 if(cookie&&header&&cookie!==header)
  return refuse(403,'conflicting_credentials');
 if(['x-work-id','x-section-id','x-alternative-id',
     'x-author-confirmed'].some(k=>request.headers.has(k)))
  return refuse(403,'conflicting_credentials');

 let memberId:string|null=null;
 try{memberId=await getMemberIdFromRequest(request);}
 catch{return refuse(503,'read_authority_unavailable');}
 if(!memberId)return refuse(401,'missing_session');

 try{
  const access=await writersStudioBetaAccess(memberId);
  if(access.eligible!==true)
   return refuse(404,'not_in_approved_group_or_no_consent');
  // Even a founder/CTO witness still needs the member's latest consent.
  const policy=approvedBetaConsentPolicy(
   process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION,
   process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256,
  );
  if(!policy||!(await hasActiveWriterBetaConsent(memberId,policy)))
   return refuse(404,'not_in_approved_group_or_no_consent');

  // Manifest/Source/Work-key ownership is separate and NOT proven here.
  const owned=await query<{owns:boolean}>(`
   SELECT EXISTS(
     SELECT 1 FROM member_manuscripts
      WHERE id=$1 AND member_id=$2
   ) AS owns`,[manuscriptId,memberId]);
  if(owned.rows.length!==1||owned.rows[0].owns!==true)
   return refuse(404,'not_an_owned_manuscript');

  return {kind:'verified_member_owns_legacy_manuscript',
   memberId,manuscriptId,mayWrite:false,releaseApproved:false};
 }catch{
  // Unavailable consent or DB can never mean permitted plaintext fallback.
  return refuse(503,'read_authority_unavailable');
 }
}
