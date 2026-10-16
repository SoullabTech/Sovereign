/**
 * R48 HELD ONLY — independently re-observe whether an R46 spent Apply token
 * produced a specific immutable R35 ciphertext version + HMAC receipt.
 *
 * This code is READ-ONLY. Missing proof stays HELD, NEVER safe to retry.
 * SQL approval metadata cannot regenerate private proposals; the custodian
 * must separately possess the original opaque token, fictional R46 issuer
 * root, and R35 Work key with current signed restoration authority.
 *
 * Proof requires token-specific receipt and save-payload HMACs, authenticated
 * ciphertext and previous generation, and encrypted R37 Apply provenance.
 * Not a production route, real KMS, user consent, or release approval.
 */
import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import path from 'node:path';
import {query} from '@/lib/db/postgres';
import {payloadHash} from '@/lib/manuscript/draftConcurrency';
import {
 reopenHeldDraftR35,type R35Custody,
 R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED,
} from './heldProtectedDraftR35';
import {R44_PROTOCOL,R44_REAL_AUTHOR_APPROVAL_ENABLED}
 from './heldDurableAuthorApprovalR44';
import {R37_PROTOCOL,R37_REAL_SECTION_EDIT_ENABLED}
 from './heldSectionApplyR37';
import {R46_REAL_DURABLE_SIGNED_APPLY_ENABLED}
 from './heldDurableSignedApplyR46';

export const R48_REAL_SPENT_APPLY_RECOVERY_ENABLED=false as const;
export const R48_PROTOCOL='soullab.ws.r48.fictional-spent-apply-proof.v1' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHA=/^[a-f0-9]{64}$/;
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
type HoldReason='HELD_UNVERIFIED_REQUEST'|'HELD_NO_SPENT_APPROVAL'|
 'HELD_SPENT_WITHOUT_MATCHING_RECEIPT'|
 'HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT';
export type R48Evidence=
 | {protocol:typeof R48_PROTOCOL;kind:'held_only';reason:HoldReason;
     releaseApproved:false;retryAuthorized:false}
 | {protocol:typeof R48_PROTOCOL;kind:'FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED';
     action:'apply';generation:number;cipherSHA256:string;
     /** Internal scope only: never expose this in a browser response. */
     sectionId:string;alternativeId:string;resultingSectionSHA256:string;
     sessionBindingSHA256:string;consentNoticeSHA256:string;
     consentEventSequence:number;reviewBindingHmac:string;
     priorDraftVersionVerified:true;unchangedSectionIds:readonly string[];
     releaseApproved:false;retryAuthorized:false};
export type R48CustodianRead={
 authority:'fictional_independent_recovery_custodian_only';
 /** Already established by a protected custodian, NEVER the browser. */
 memberId:string;workId:string;approvalToken:string;
 approvalIssuerSecret:Buffer;
 custody:R35Custody;
};
type Claim={
 member_id:string;work_id:string;section_id:string;
 alternative_id:string;expected_generation:number|string;
 state:'prepared'|'spent';session_binding_sha256:string;
 notice_sha256:string;consent_sequence:number|string;
 review_binding_hmac:string;spent_at_ms:number|string|null;
};
type Receipt={
 action:string;generation:string|number;checkpoint_count:string|number;
 payload_hmac:string;
};
type Version={
 key_id:string;cipher_sha256:string;action:string;
 checkpoint_count:number|string;
};
type Note={
 protocol:typeof R37_PROTOCOL;kind:'apply';sectionId:string;
 alternativeId:string;fromGeneration:number;previousWorkSHA256:string;
 resultingSectionSHA256:string;
};
const held=(reason:HoldReason):R48Evidence=>({
 protocol:R48_PROTOCOL,kind:'held_only',reason,
 releaseApproved:false,retryAuthorized:false,
});
const digest=(t:string)=>createHash('sha256').update(t,'utf8').digest('hex');
function hmac(key:Buffer,domain:string,parts:string[]):string{
 const mac=createHmac('sha256',key).update(domain);
 for(const p of parts)mac.update('\u0000').update(p,'utf8');
 return mac.digest('hex');
}
function equalHex(x:string,y:string):boolean{
 return SHA.test(x)&&SHA.test(y)&&
  timingSafeEqual(Buffer.from(x,'hex'),Buffer.from(y,'hex'));
}
function tokenHmac(issuer:Buffer,token:string):string{
 return createHmac('sha256',issuer).update(JSON.stringify([
  R44_PROTOCOL,'opaque-token',token,
 ])).digest('hex');
}
function idempotencyKey(issuer:Buffer,token:string):string{
 return 'r46-'+createHmac('sha256',issuer)
  .update('spent-approved-author-edit\u0000')
  .update(token,'utf8').digest('hex').slice(0,40);
}
function integer(value:unknown,minimum=1):number|null{
 const n=typeof value==='string'?Number(value):value;
 return typeof n==='number'&&Number.isSafeInteger(n)&&n>=minimum?n:null;
}
function ready(input:R48CustodianRead):boolean{
 const database=process.env.DATABASE_URL||'';
 const vault=process.env.FILE_STORAGE_PATH||'';
 return R48_REAL_SPENT_APPLY_RECOVERY_ENABLED===false&&
    R46_REAL_DURABLE_SIGNED_APPLY_ENABLED===false&&
    R44_REAL_AUTHOR_APPROVAL_ENABLED===false&&
    R37_REAL_SECTION_EDIT_ENABLED===false&&
    R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED===false&&
    process.env.R48_SPENT_APPLY_RECOVERY_FIXTURE==='fictional-only'&&
    process.env.R46_DURABLE_SIGNED_APPLY_FIXTURE==='fictional-only'&&
    process.env.R44_DURABLE_APPROVAL_FIXTURE==='fictional-only'&&
    process.env.R37_SECTION_PASSAGE_FIXTURE==='fictional-only'&&
    process.env.R35_PROTECTED_DRAFT_FIXTURE==='fictional-only'&&
    process.env.R35_PHYSICAL_PG16_FIXTURE==='fictional-only'&&
    /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(database)&&
    path.basename(vault)==='vault'&&
    path.basename(path.dirname(vault)).startsWith('ws-r35-physical-')&&
    !!input&&input.authority==='fictional_independent_recovery_custodian_only'&&
    UUID.test(input.memberId||'')&&UUID.test(input.workId||'')&&
    TOKEN.test(input.approvalToken||'')&&
    Buffer.isBuffer(input.approvalIssuerSecret)&&
    input.approvalIssuerSecret.length===32&&
    Buffer.isBuffer(input.custody?.key?.keyBytes)&&
    input.custody.key.keyBytes.length===32&&
    UUID.test(input.custody.key.keyId||'');
}
function note(raw:unknown):Note|null{
 if(typeof raw!=='string')return null;
 let obj:unknown;
 try{obj=JSON.parse(raw);}catch{return null;}
 if(!obj||typeof obj!=='object'||Array.isArray(obj))return null;
 const a=obj as Record<string,unknown>;
 if(Object.keys(a).sort().join('|')!==
    'alternativeId|fromGeneration|kind|previousWorkSHA256|protocol|resultingSectionSHA256|sectionId'||
    a.protocol!==R37_PROTOCOL||a.kind!=='apply'||
    !UUID.test(a.sectionId as string)||!UUID.test(a.alternativeId as string)||
    !SHA.test(a.previousWorkSHA256 as string)||
    !SHA.test(a.resultingSectionSHA256 as string)||
    !integer(a.fromGeneration))return null;
 return a as Note;
}
export async function inspectSpentApplyR48(
 input:R48CustodianRead,
):Promise<R48Evidence>{
 if(!ready(input))return held('HELD_UNVERIFIED_REQUEST');
 try{
  const memberId=input.memberId,workId=input.workId;
  const approval=await query<Claim>(
   'SELECT member_id,work_id,section_id,alternative_id,'+
   'expected_generation,state,session_binding_sha256,notice_sha256,'+
   'consent_sequence,review_binding_hmac,spent_at_ms '+
   'FROM writers_studio_r44_held_approval '+
   'WHERE member_id=$1 AND work_id=$2 AND token_hmac=$3',[
    memberId,workId,tokenHmac(input.approvalIssuerSecret,input.approvalToken),
   ]);
  if(approval.rows.length!==1)return held('HELD_UNVERIFIED_REQUEST');
  const a=approval.rows[0];
  const from=integer(a.expected_generation);
  if(!from||!UUID.test(a.section_id)||!UUID.test(a.alternative_id)||
     !SHA.test(a.session_binding_sha256)||
     !SHA.test(a.notice_sha256)||
     !SHA.test(a.review_binding_hmac)||!integer(a.consent_sequence)||
     a.member_id!==memberId||a.work_id!==workId)
   return held('HELD_UNVERIFIED_REQUEST');
  if(a.state!=='spent'||!integer(a.spent_at_ms))
   return held('HELD_NO_SPENT_APPROVAL');
  const next=from+1;
  if(!Number.isSafeInteger(next))
   return held('HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT');
  const idemTag=hmac(input.custody.key.keyBytes,
   'r35.idempotency-key.v1',
   [memberId,workId,idempotencyKey(input.approvalIssuerSecret,input.approvalToken)]);
  const receipt=await query<Receipt>(
   'SELECT action,generation,checkpoint_count,payload_hmac '+
   'FROM writers_studio_r35_draft_receipts '+
   'WHERE work_id=$1 AND idem_hmac=$2',[workId,idemTag]);
  if(receipt.rows.length===0)
   return held('HELD_SPENT_WITHOUT_MATCHING_RECEIPT');
  if(receipt.rows.length!==1)
   return held('HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT');
  const rec=receipt.rows[0],count=integer(rec.checkpoint_count,0);
  if(rec.action!=='save'||integer(rec.generation)!==next||
    !SHA.test(rec.payload_hmac)||count===null)
   return held('HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT');
  const version=await query<Version>(
   'SELECT key_id,cipher_sha256,action,checkpoint_count '+
   'FROM writers_studio_r35_draft_versions '+
   'WHERE work_id=$1 AND member_id=$2 AND generation=$3',
   [workId,memberId,next]);
  if(version.rows.length!==1)
   return held('HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT');
  const v=version.rows[0];
  if(v.key_id!==input.custody.key.keyId||
     v.action!=='save'||!SHA.test(v.cipher_sha256)||
     integer(v.checkpoint_count,0)!==count)
   return held('HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT');
  const subject={
   memberId,assertedBy:'server_verified_member_session' as const,
  };
  const [before,after]=await Promise.all([
   reopenHeldDraftR35({
    subject,workId,custody:input.custody,generation:from,
   }),
   reopenHeldDraftR35({
    subject,workId,custody:input.custody,generation:next,
   }),
  ]);
  if(before.workId!==workId||after.workId!==workId||
     before.generation!==from||after.generation!==next||
     before.kind!=='sections'||after.kind!=='sections'||
     after.action!=='save'||after.checkpointCount!==count||
     before.sections.length<2||
     before.sections.length!==after.sections.length||
     before.sections.map(s=>s.text).join('')!==before.content||
     after.sections.map(s=>s.text).join('')!==after.content)
   return held('HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT');
  const n=note(after.note);
  if(!n||n.fromGeneration!==from||
     n.sectionId!==a.section_id||
     n.alternativeId!==a.alternative_id||
     digest(before.content)!==n.previousWorkSHA256)
   return held('HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT');
  let changed=0;const untouched:string[]=[];
  for(let i=0;i<after.sections.length;i++){
   const prior=before.sections[i],current=after.sections[i];
   if(prior.id!==current.id||!UUID.test(current.id))
    return held('HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT');
   if(prior.text!==current.text){
    if(current.id!==n.sectionId||++changed!==1||
       digest(current.text)!==n.resultingSectionSHA256)
     return held('HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT');
   }else untouched.push(current.id);
  }
  if(changed!==1||untouched.length!==after.sections.length-1)
   return held('HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT');
  // R35's actual save payload fingerprint is HMACed with the R35 key.
  const payload=payloadHash('save',{
   sections:after.sections,checkpoint:false,note:after.note,
  });
  const payloadTag=hmac(input.custody.key.keyBytes,'r35.payload.v1',
   [memberId,workId,'save:'+payload]);
  if(!equalHex(payloadTag,rec.payload_hmac))
   return held('HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT');
  return {
   protocol:R48_PROTOCOL,kind:'FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED',
   action:'apply',generation:next,cipherSHA256:v.cipher_sha256,
   sectionId:n.sectionId,alternativeId:n.alternativeId,
   resultingSectionSHA256:n.resultingSectionSHA256,
   sessionBindingSHA256:a.session_binding_sha256,
   consentNoticeSHA256:a.notice_sha256,
   consentEventSequence:integer(a.consent_sequence)!,
   reviewBindingHmac:a.review_binding_hmac,
   priorDraftVersionVerified:true,unchangedSectionIds:untouched,
   releaseApproved:false,retryAuthorized:false,
  };
 }catch{
  // Unavailable DB, revoked or missing Work key, orphan ciphertext, or
  // altered SQL cannot be interpreted as successful writing or safe retry.
  return held('HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT');
 }
}
