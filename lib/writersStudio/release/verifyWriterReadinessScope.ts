/**
 * REAL server principal + beta consent + legacy manuscript ownership preflight.
 * READ ONLY. It does not grant protected Work access or authorize ANY write.
 * All stronger R42/R46/R47/R48 Work/key authorities remain separately HELD.
 */
import type {NextRequest} from 'next/server';
import {query} from '@/lib/db/postgres';
import {getMemberIdFromSessionToken} from '@/lib/auth/getMemberFromRequest';
import {writersStudioBetaAccess} from '@/lib/writersStudio/betaAccessServer';
import {
 inspectProtectedManifestLineage,type CustodyMetadataResult,
} from './inspectProtectedManifestLineage';
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
 /** Explicit, member-declared Living Work relationships; NOT a choice of
  * one exclusive Work, nor an encrypted key/custody grant. Server only. */
 readonly declaredLivingWorkIds:readonly string[];
 /** Internal structural Source→Draft evidence only. Not a verified KMS key. */
 readonly protectedManifestEvidence:CustodyMetadataResult;
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

 // Bind identity to exactly the credential on THIS NextRequest, rather than
 // ambient next/headers cookies that could differ in a rewrapped request.
 // Never prefer an unverified x-member-id or maia_member_id assertion.
 const cookie=request.cookies.get('maia_session')?.value||null;
 const header=request.headers.get('x-session-token');
 if(cookie&&header&&cookie!==header)
  return refuse(403,'conflicting_credentials');
 if(['x-work-id','x-section-id','x-alternative-id',
     'x-author-confirmed'].some(k=>request.headers.has(k)))
  return refuse(403,'conflicting_credentials');
 const presented=header||cookie;
 if(!presented||presented.length>256)return refuse(401,'missing_session');

 let memberId:string|null=null;
 try{memberId=await getMemberIdFromSessionToken(presented);}
 catch{return refuse(503,'read_authority_unavailable');}
 if(!memberId)return refuse(401,'missing_session');
 const claimed=[
  request.headers.get('x-member-id'),
  request.cookies.get('maia_member_id')?.value||null,
 ].filter((v):v is string=>!!v);
 if(claimed.some(v=>v!==memberId))
  return refuse(403,'conflicting_credentials');

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

  // A protected R35 draft is addressed by the manuscript UUID. A Soullab
  // Living Work is a distinct member-authored concept, and one manuscript
  // can be declared in several Living Works. Do NOT infer a default or
  // automatically create a declaration; query only explicit owner records.
  const declarations=await query<{id:string}>(`
   SELECT w.id AS id
    FROM living_work_expressions e
    JOIN living_works w ON w.id=e.living_work_id
   WHERE e.expression_type='manuscript'
     AND e.expression_id=$1
     AND e.declared_by=$2
     AND w.member_id=$2
   ORDER BY w.id ASC`,[manuscriptId,memberId]);
  if(!Array.isArray(declarations.rows)||
     declarations.rows.some(r=>!UUID.test(r?.id??'')))
   return refuse(503,'read_authority_unavailable');
  const declaredLivingWorkIds=declarations.rows.map(r=>r.id);
  if(new Set(declaredLivingWorkIds.map(id=>id.toLowerCase())).size!==
    declaredLivingWorkIds.length)
   return refuse(503,'read_authority_unavailable');

  // The exact manuscript UUID — NOT any related Living Work id — is the
  // R35 encrypted Draft work_id. This is a metadata-only, read-only check.
  // A false/missing lineage or absent review-only schema still cannot grant
  // Save/Apply/Undo. Real independently governed key custody remains absent.
  const protectedManifestEvidence=await inspectProtectedManifestLineage({
   verifiedMemberId:memberId,manuscriptId,
  });
  return {kind:'verified_member_owns_legacy_manuscript',
   memberId,manuscriptId,declaredLivingWorkIds,protectedManifestEvidence,
   mayWrite:false,releaseApproved:false};
 }catch{
  // Unavailable consent or DB can never mean permitted plaintext fallback.
  return refuse(503,'read_authority_unavailable');
 }
}
