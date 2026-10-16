/**
 * R47 · Held, fictional-only durable PRIVATE editorial proposal/choice custody.
 *
 * R43/R46's server-held selected alternative must survive process restart.
 * This service seals the exact R37-reviewed choice into immutable AES-GCM
 * ciphertext before recording VERIFIED SQL custody. SQL records an intention
 * first, so an interrupted encrypted publication is never backfilled blindly.
 *
 * Separate from R44's durable approval token and from R35 manuscript versions:
 * saving/recovering a proposal NEVER approves Apply, Undo or member admission.
 * Real session/current consent/KMS/revocation authority remains unimplemented.
 */
import {createHash,createHmac,randomUUID,timingSafeEqual,type KeyObject}
 from 'node:crypto';
import path from 'node:path';
import {query} from '@/lib/db/postgres';
import {readVaultBytes,writeDurableVaultBytes}
 from '@/lib/storage/fileVault';
import {
 sealWorkSnapshot,openWorkSnapshot,WorkRecoveryRefusal,
 type WorkEncryptionKey,type SealedWorkV1,
} from './workEnvelopeV1';
import {requireCurrentRestoreAuthorization} from './deletionBarrierV1';
import {reopenHeldDraftR35,type R35Custody,type R35Subject,type R35View}
 from './heldProtectedDraftR35';
import {reviewSectionPassageR37,
 type R37SectionSelection} from './heldSectionApplyR37';
import type {R29CurrentAdmission} from './sessionBoundCustodyR29';

export const R47_REAL_PRIVATE_EDITORIAL_ENABLED=false as const;
export const R47_PROTOCOL='soullab.ws.r47.encrypted-private-choice.v1' as const;
export const R47_NAMESPACE='ws-beta-r47-private-review' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA=/^[a-f0-9]{64}$/;
const MAX_PRIVATE=3*1024*1024;
const deny=(code:string):never=>{throw new WorkRecoveryRefusal('r47_'+code);};
const digest=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
const hmac=(key:Buffer,domain:string,payload:unknown)=>
 createHmac('sha256',key).update(JSON.stringify([R47_PROTOCOL,domain,payload])).digest('hex');

type R47ReviewRow={
 review_id:string;member_id:string;work_id:string;
 draft_generation:number|string;section_id:string;alternative_id:string;
 key_id:string;idem_hmac:string;review_hmac:string;consent_hmac:string;
 cipher_ref:string;cipher_sha256:string|null;state:'reserved'|'verified';
};
type PrivateReview={
 protocol:typeof R47_PROTOCOL;
 reviewId:string;memberId:string;workId:string;generation:number;
 consentNoticeSHA256:string;consentEventSequence:number;
 selection:R37SectionSelection;
 preview:{
   sectionId:string;alternativeId:string;originalPassage:string;
   proposedPassage:string;sectionOrder:string[];untouchedSectionIds:string[];
 };
};
export type R47PrivateInput={
 subject:R35Subject;
 admission:R29CurrentAdmission;
 workId:string;
 draftCustody:R35Custody;
 privateCustody:R35Custody;
};
export type R47RecordInput=R47PrivateInput&{
 selection:R37SectionSelection;
 idempotencyKey:string;
 /** Accepted only by a fictional test caller; never mount as an API parameter. */
 interruptAfter?:'intention'|'ciphertext';
};
export type R47ReadInput=R47PrivateInput&{
 reviewId:string;generation:number;
};
export type R47Receipt={
 kind:'HELD_ENCRYPTED_PRIVATE_REVIEW';
 reviewId:string;workId:string;generation:number;sectionId:string;
 alternativeId:string;status:'created'|'replayed'|'reconciled';
 releaseApproved:false;canApply:false;
};
export type R47PrivateRead={
 kind:'HELD_PRIVATE_REVIEW_READ_ONLY';
 reviewId:string;workId:string;generation:number;
 preview:PrivateReview['preview'];selection:R37SectionSelection;
 releaseApproved:false;canApply:false;
};

const INSERT=[
 'INSERT INTO writers_studio_r47_private_review',
 '(review_id,member_id,work_id,draft_generation,section_id,alternative_id,',
 'key_id,idem_hmac,review_hmac,consent_hmac,cipher_ref)',
 'VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
 'ON CONFLICT (work_id,idem_hmac) DO NOTHING RETURNING review_id',
].join(' ');
const OWN=[
 'SELECT * FROM writers_studio_r47_private_review',
 'WHERE work_id=$1 AND idem_hmac=$2',
].join(' ');
const BY_ID=[
 'SELECT * FROM writers_studio_r47_private_review',
 'WHERE review_id=$1 AND work_id=$2 AND member_id=$3',
 'AND draft_generation=$4',
].join(' ');
const VERIFIED=[
 'UPDATE writers_studio_r47_private_review SET state=\'verified\',',
 'cipher_sha256=$2,verified_at=now()',
 'WHERE review_id=$1 AND state=\'reserved\'',
 'AND member_id=$3 AND work_id=$4 AND draft_generation=$5',
 'AND review_hmac=$6 AND consent_hmac=$7',
 'RETURNING cipher_sha256',
].join(' ');

function fixture(){
 if(R47_REAL_PRIVATE_EDITORIAL_ENABLED!==false||
   process.env.R47_PRIVATE_EDITORIAL_FIXTURE!=='fictional-only'||
   process.env.R37_SECTION_PASSAGE_FIXTURE!=='fictional-only'||
   process.env.R36_PASSAGE_REVIEW_FIXTURE!=='fictional-only'||
   process.env.R35_PROTECTED_DRAFT_FIXTURE!=='fictional-only'||
   process.env.R35_PHYSICAL_PG16_FIXTURE!=='fictional-only'||
   !/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(
     process.env.DATABASE_URL||'')||
   path.basename(process.env.FILE_STORAGE_PATH||'')!=='vault'||
   !path.basename(path.dirname(process.env.FILE_STORAGE_PATH||''))
      .startsWith('ws-r35-physical-'))
  deny('real_private_review_disabled');
}
function uuid(x:unknown):string{
 if(typeof x!=='string'||!UUID.test(x))deny('invalid_identity');
 return (x as string).toLowerCase();
}
function hasCustody(c:R35Custody,workId:string,generation:number){
 if(!c?.key||!Buffer.isBuffer(c.key.keyBytes)||
    c.key.keyBytes.length!==32||!c.signedDeletion||
    !c.trustedSigner||!c.independent)deny('independent_fictional_key_proof_required');
 uuid(c.key.keyId);
 requireCurrentRestoreAuthorization({
  request:{workId,keyId:c.key.keyId,snapshotGeneration:generation},
  signed:c.signedDeletion,trustedSigner:c.trustedSigner,
  independent:c.independent,
 });
}
function distinct(a:R35Custody,b:R35Custody){
 if(a.key.keyId.toLowerCase()===b.key.keyId.toLowerCase()||
    timingSafeEqual(a.key.keyBytes,b.key.keyBytes))
  deny('private_review_and_draft_keys_must_differ');
}
function consent(a:R29CurrentAdmission,subject:R35Subject){
 if(!a||typeof a!=='object'||a.activeWriter!==true||
    !subject||subject.assertedBy!=='server_verified_member_session'||
    uuid(a.memberId)!==uuid(subject.memberId)||
    typeof a.consentNoticeSHA256!=='string'||
    !SHA.test(a.consentNoticeSHA256)||
    !Number.isSafeInteger(a.consentEventSequence)||
    a.consentEventSequence<=0||
    typeof a.sessionBindingSHA256!=='string'||
    !SHA.test(a.sessionBindingSHA256))
   deny('fictional_member_or_current_consent_required');
 // Do not store public-domain consent hashes; consentTag uses the private Work key.
}
function validateIdentity(i:R47PrivateInput,generation:number){
 const w=uuid(i?.workId),m=uuid(i?.subject?.memberId);
 if(!Number.isSafeInteger(generation)||generation<1)
  deny('invalid_draft_generation');
 // Asserted subject and admission are synthetic. No real session attestation.
 consent(i.admission,i.subject);
 hasCustody(i.draftCustody,w,generation);
 hasCustody(i.privateCustody,w,generation);
 distinct(i.draftCustody,i.privateCustody);
 return {workId:w,memberId:m};
}
function consentTag(i:R47PrivateInput){
 return hmac(i.privateCustody.key.keyBytes,'consent',[
   uuid(i.admission.memberId),i.admission.consentNoticeSHA256,
   i.admission.consentEventSequence,
 ]);
}
function receipt(row:R47ReviewRow,status:R47Receipt['status']):R47Receipt{
 return {kind:'HELD_ENCRYPTED_PRIVATE_REVIEW',reviewId:row.review_id,
  workId:row.work_id,generation:Number(row.draft_generation),
  sectionId:row.section_id,alternativeId:row.alternative_id,
  status,releaseApproved:false,canApply:false};
}
function assertRow(r:R47ReviewRow,i:R47PrivateInput,generation:number,
  expected?:{idempotency:string;review:string;consent:string;section:string;alternative:string}){
 const a=validateIdentity(i,generation);
 if(!r||uuid(r.member_id)!==a.memberId||
   uuid(r.work_id)!==a.workId||
   Number(r.draft_generation)!==generation||
   uuid(r.key_id)!==uuid(i.privateCustody.key.keyId)||
   r.cipher_ref!==R47_NAMESPACE+'/'+uuid(r.review_id)+'.enc'||
   (r.state!=='reserved'&&r.state!=='verified')||
   (r.state==='verified'&&!SHA.test(r.cipher_sha256||''))||
   (r.state==='reserved'&&r.cipher_sha256!==null)||
   r.consent_hmac!==consentTag(i))
  deny('review_manifest_or_consent_mismatch');
 if(expected&&(r.idem_hmac!==expected.idempotency||
   r.review_hmac!==expected.review||
   r.consent_hmac!==expected.consent||
   uuid(r.section_id)!==expected.section||
   uuid(r.alternative_id)!==expected.alternative))
  deny('idempotency_review_choice_conflict');
}
function verifiedPreview(data:PrivateReview,reviewId:string,i:R47PrivateInput,
 view:R35View):boolean{
 if(!data||data.protocol!==R47_PROTOCOL||
    uuid(data.reviewId)!==uuid(reviewId)||
    uuid(data.memberId)!==uuid(i.subject.memberId)||
    uuid(data.workId)!==uuid(i.workId)||
    data.generation!==view.generation||
    data.consentNoticeSHA256!==i.admission.consentNoticeSHA256||
    data.consentEventSequence!==i.admission.consentEventSequence)
   deny('sealed_choice_scope_mismatch');
 const reviewed=reviewSectionPassageR37(view,data.selection);
 const r=reviewed.review;
 if(data.preview.sectionId!==r.sectionId||
    data.preview.alternativeId!==r.chosenAlternativeId||
    data.preview.originalPassage!==r.originalPassage||
    data.preview.proposedPassage!==r.proposedPassage||
    JSON.stringify(data.preview.sectionOrder)!==
      JSON.stringify(reviewed.sectionOrder)||
    JSON.stringify(data.preview.untouchedSectionIds)!==
      JSON.stringify(reviewed.untouchedSectionIds))
  deny('sealed_private_choice_does_not_match_draft');
 return true;
}
async function privateData(row:R47ReviewRow,i:R47PrivateInput,
 view:R35View,expectDigest:boolean):Promise<{data:PrivateReview;sha:string}>{
 let bytes:Buffer;
 try{bytes=await readVaultBytes(row.cipher_ref);}
 catch{return deny('reserved_missing_ciphertext_held');}
 const sha=digest(bytes);
 if(expectDigest&&sha!==row.cipher_sha256)deny('cipher_digest_mismatch');
 let box:SealedWorkV1;
 try{box=JSON.parse(bytes.toString('utf8')) as SealedWorkV1;}
 catch{return deny('sealed_choice_envelope_invalid');}
 const records=openWorkSnapshot({memberId:i.subject.memberId,
   workId:i.workId,generation:view.generation},box,i.privateCustody.key);
 if(records.length!==1||
    records[0].field!=='manuscript_revision_offers.proposed_text'||
    uuid(records[0].recordId)!==uuid(row.review_id))
  deny('sealed_choice_record_identity_mismatch');
 let data:PrivateReview;
 try{data=JSON.parse(records[0].value.toString('utf8')) as PrivateReview;}
 catch{return deny('sealed_choice_payload_invalid');}
 verifiedPreview(data,row.review_id,i,view);
 const tag=hmac(i.privateCustody.key.keyBytes,'review-plan',
   {...data,reviewId:null});
 if(tag!==row.review_hmac)deny('private_choice_binding_mismatch');
 if(uuid(row.section_id)!==uuid(data.preview.sectionId)||
    uuid(row.alternative_id)!==uuid(data.preview.alternativeId))
  deny('private_choice_index_mismatch');
 return {data,sha};
}
async function getView(i:R47PrivateInput,generation:number):Promise<R35View>{
 const a=validateIdentity(i,generation);
 return reopenHeldDraftR35({subject:i.subject,workId:a.workId,
  generation,custody:i.draftCustody});
}
async function finish(row:R47ReviewRow,i:R47PrivateInput,view:R35View,
 status:'created'|'reconciled'):Promise<R47Receipt>{
 const opened=await privateData(row,i,view,row.state==='verified');
 if(row.state==='verified')return receipt(row,'replayed');
 const r=await query<{cipher_sha256:string}>(VERIFIED,[
  row.review_id,opened.sha,row.member_id,row.work_id,view.generation,
  row.review_hmac,row.consent_hmac,
 ]);
 if(r.rows.length!==1){
  const now=await query<R47ReviewRow>(BY_ID,[
    row.review_id,row.work_id,row.member_id,view.generation,
  ]);
  if(now.rows.length!==1||now.rows[0].state!=='verified'||
     now.rows[0].cipher_sha256!==opened.sha)
   deny('review_custody_commit_uncertain_held');
 }
 return receipt(row,status);
}

/** Intention → ciphertext/fsync → authenticated reread → immutable SQL link. */
export async function recordHeldPrivateReviewR47(i:R47RecordInput):Promise<R47Receipt>{
 fixture();
 const generation=i?.selection?.section?.expectedGeneration;
 const a=validateIdentity(i,generation);
 if(typeof i.idempotencyKey!=='string'||i.idempotencyKey.length<12||
    i.idempotencyKey.length>128)
  deny('invalid_private_review_intent');
 const view=await getView(i,generation);
 const verified=reviewSectionPassageR37(view,i.selection);
 const plan=(id:string):PrivateReview=>({
   protocol:R47_PROTOCOL,reviewId:id,
   memberId:a.memberId,workId:a.workId,generation,
   consentNoticeSHA256:i.admission.consentNoticeSHA256,
   consentEventSequence:i.admission.consentEventSequence,
   selection:i.selection,
   preview:{sectionId:verified.review.sectionId,
     alternativeId:verified.review.chosenAlternativeId,
     originalPassage:verified.review.originalPassage,
     proposedPassage:verified.review.proposedPassage,
     sectionOrder:[...verified.sectionOrder],
     untouchedSectionIds:[...verified.untouchedSectionIds]},
 });
 const idem=hmac(i.privateCustody.key.keyBytes,'review-idem',[
   a.memberId,a.workId,i.idempotencyKey,
 ]);
 // Exclude the random review ID from choice equality so an exact replay can
 // resolve the earlier immutable row without re-sealing or writing new bytes.
 const review=hmac(i.privateCustody.key.keyBytes,'review-plan',
   {...plan('00000000-0000-4000-8000-000000000000'),reviewId:null});
 const approximate=Buffer.byteLength(JSON.stringify(plan(
   '00000000-0000-4000-8000-000000000000')),'utf8');
 if(approximate>MAX_PRIVATE)deny('private_choice_too_large');
 const intentId=randomUUID(),ref=R47_NAMESPACE+'/'+intentId+'.enc';
 const out=await query<{review_id:string}>(INSERT,[
   intentId,a.memberId,a.workId,generation,
   verified.review.sectionId,verified.review.chosenAlternativeId,
   i.privateCustody.key.keyId,idem,review,consentTag(i),ref,
 ]);
 const existing=await query<R47ReviewRow>(OWN,[a.workId,idem]);
 if(existing.rows.length!==1)deny('review_intention_unavailable');
 const row=existing.rows[0];
 assertRow(row,i,generation,{idempotency:idem,review,
   consent:consentTag(i),section:verified.review.sectionId,
   alternative:verified.review.chosenAlternativeId});
 if(out.rows.length===0)return finish(row,i,view,'reconciled');
 if(out.rows[0].review_id!==row.review_id)
  deny('review_intention_identity_mismatch');
 if(i.interruptAfter==='intention')
  deny('interrupted_after_intention_held');
 const privatePlain=Buffer.from(JSON.stringify(plan(row.review_id)),'utf8');
 if(privatePlain.length>MAX_PRIVATE)deny('private_choice_too_large');
 const box=sealWorkSnapshot({memberId:a.memberId,
  workId:a.workId,generation},[{
  field:'manuscript_revision_offers.proposed_text',
  recordId:row.review_id,value:privatePlain,
 }],i.privateCustody.key);
 const bytes=Buffer.from(JSON.stringify(box),'utf8');
 try{await writeDurableVaultBytes(R47_NAMESPACE,row.review_id,'enc',bytes);}
 catch{return deny('private_choice_vault_publication_uncertain_held');}
 if(i.interruptAfter==='ciphertext')
  deny('interrupted_after_ciphertext_held');
 return finish(row,i,view,'created');
}

/** Explicit recovery only: never rewrite a missing ciphertext or reissue Apply. */
export async function reconcileHeldPrivateReviewR47(i:R47ReadInput):Promise<R47Receipt>{
 fixture();
 const a=validateIdentity(i,i.generation);
 const rows=await query<R47ReviewRow>(BY_ID,[
  uuid(i.reviewId),a.workId,a.memberId,i.generation,
 ]);
 if(rows.rows.length!==1)deny('foreign_or_missing_private_review');
 const row=rows.rows[0];
 assertRow(row,i,i.generation);
 const view=await getView(i,i.generation);
 return finish(row,i,view,'reconciled');
}

/** Read-only private preview after verified custody and current fake consent. */
export async function reopenHeldPrivateReviewR47(i:R47ReadInput):Promise<R47PrivateRead>{
 fixture();
 const a=validateIdentity(i,i.generation);
 const rows=await query<R47ReviewRow>(BY_ID,[
   uuid(i.reviewId),a.workId,a.memberId,i.generation,
 ]);
 if(rows.rows.length!==1)deny('foreign_or_missing_private_review');
 const row=rows.rows[0];
 assertRow(row,i,i.generation);
 if(row.state!=='verified')deny('unreconciled_private_review_held');
 const view=await getView(i,i.generation);
 const {data}=await privateData(row,i,view,true);
 return {kind:'HELD_PRIVATE_REVIEW_READ_ONLY',
  reviewId:row.review_id,workId:a.workId,generation:i.generation,
  preview:data.preview,selection:data.selection,
  releaseApproved:false,canApply:false};
}
