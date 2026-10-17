/**
 * R76 — held FICTIONAL pending MAIA-candidate envelope.
 *
 * It is NOT a published proposal_versions record: SQL stores encrypted
 * potential wording and a trusted-server SIGNED response witness only.
 * No public API route, provider call or operational signing/key grant.
 * There is NO Apply/Undo path into the Work from this module.
 */
import {createHash,type KeyLike} from 'node:crypto';
import {transaction,type TransactionClient} from '@/lib/db/postgres';
import {requireR72CurrentConsent} from
 '@/lib/writersStudio/recovery/r72MemberProposalConsent';
import {sealWorkSnapshot,openWorkSnapshot,
 type SealedWorkV1,type WorkEncryptionKey} from
 '@/lib/writersStudio/recovery/workEnvelopeV1';
import {captureCompletedProducerR75,verifyCompletedProducerR75,
 type R75Issuer,type R75Record,type R75Scope} from
 '@/lib/writersStudio/provenance/editorialModelProducerR75';
import type {LLMResponse} from '@/lib/consciousness/LLMProvider';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DB=/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/;
const FIELD='manuscript_revision_offers.proposed_text';
export const R76_REAL_CONFIDENTIAL_PROPOSALS_ENABLED=false as const;
export class R76Refused extends Error{
 constructor(readonly reason:string){
  super('r76_'+reason);
  this.name='R76Refused';
 }
}
const refuse=(reason:string):never=>{throw new R76Refused(reason);};
const sha=(bytes:string)=>createHash('sha256').update(bytes,'utf8').digest('hex');
const cipherHash=(box:SealedWorkV1)=>
 sha(JSON.stringify([box.protocol,box.keyId,box.iv,box.tag,box.ciphertext]));
const uuid=(s:string)=>typeof s==='string'&&UUID.test(s);
function fixture(){
 const isolatedTest=process.env.NODE_ENV==='test';
 const isolatedReviewDev=process.env.NODE_ENV==='development'&&
  process.env.R77P_LOCAL_REVIEW_FIXTURE==='fictional-only'&&
  process.env.NEXT_PUBLIC_R77P_LOCAL_REVIEW_FIXTURE==='fictional-only'&&
  process.env.R77P_KEYS_ORIGIN==='synthetic-generated-test-only';
 if(R76_REAL_CONFIDENTIAL_PROPOSALS_ENABLED!==false||
    process.env.R76_PENDING_CANDIDATE_FIXTURE!=='fictional-only'||
    !(isolatedTest||isolatedReviewDev)||
    !DB.test(process.env.DATABASE_URL||''))
  refuse('disabled_outside_disposable_local_fixture');
}
type DraftRow={id:string;version:string;section_addressable_at:Date|null};
async function checkCurrent(tx:TransactionClient,scope:R75Scope){
 const r=await tx.query<DraftRow>(
  `SELECT d.id,d.version,d.section_addressable_at
    FROM manuscript_working_drafts d
    JOIN member_manuscripts m ON m.id=d.manuscript_id
       AND m.member_id=d.member_id
    JOIN manuscript_draft_sections ds ON ds.draft_id=d.id
   WHERE m.id=$1 AND m.member_id=$2 AND d.id=$3 AND ds.id=$4
     AND d.section_addressable_at IS NOT NULL FOR UPDATE OF d`,
 [scope.manuscriptId,scope.memberId,scope.draftId,scope.sectionId]);
 const row=r.rows[0];
 if(r.rows.length!==1||!row||Number(row.version)!==scope.baseVersion)
  refuse('writer_work_or_draft_head_moved');
 const consent=await requireR72CurrentConsent(tx,scope.memberId);
 if(consent.consentSequence!==scope.consentSequence||
    consent.noticeSHA256!==scope.policySHA256)
  refuse('consent_or_notice_epoch_changed');
}
type Row={
 reserved_version_id:string;member_id:string;manuscript_id:string;
 draft_id:string;section_id:string;base_version:string;
 consent_sequence:string;policy_sha256:string;
 instruction_contract_sha256:string;key_id:string;
 cipher_envelope:SealedWorkV1;cipher_sha256:string;
 server_witness:R75Record['assertion'];witness_signature:string;
};
export type PendingR76Receipt={
 kind:'R76_SEALED_PENDING_NOT_PUBLISHED';
 reservedVersionId:string;generation:number;
 source:'synthetic_server_witness_fixture';
 canApply:false;canUndo:false;releaseApproved:false;
};
export type R76PrivatePreview={
 kind:'R76_PRIVATE_PENDING_REVIEW_ONLY';pendingVersionId:string;
 /** Delivered only to trusted server caller AFTER current consent + decrypt */
 proposedPassage:string;servedProvider:string;servedModel:string;
 canApply:false;canUndo:false;releaseApproved:false;
 publishedVersion:false;
};
function validateScope(scope:R75Scope){
 if(!scope||![scope.memberId,scope.manuscriptId,scope.draftId,
  scope.sectionId,scope.proposalVersionId].every(uuid)||
  !Number.isSafeInteger(scope.baseVersion)||scope.baseVersion<1||
  !Number.isSafeInteger(scope.consentSequence)||scope.consentSequence<1||
  !/^[0-9a-f]{64}$/.test(scope.policySHA256)||
  !/^[0-9a-f]{64}$/.test(scope.instructionContractSHA256))
  refuse('invalid_exact_writer_or_consent_scope');
}
export async function sealPendingR76(input:{
 scope:R75Scope; response:Pick<LLMResponse,
  'provider'|'model'|'serving'|'text'|'metadata'>;
 workKey:WorkEncryptionKey;issuer:Omit<R75Issuer,'scope'>;
 publicKey:KeyLike;
}):Promise<PendingR76Receipt>{
 fixture();validateScope(input.scope);
 // R75 claims a reserved future version ID; a pending candidate is NOT a
 // proposal_versions row and carries no author action or publish permission.
 const recorded=captureCompletedProducerR75({
  ...input.issuer,scope:input.scope,
 },input.response);
 if(!recorded)return refuse('producing_model_or_response_unattributable');
 const checked=verifyCompletedProducerR75(recorded,{
  expectedScope:input.scope,expectedProposal:input.response.text,
  contentSecret:input.issuer.contentSecret,
  publicKey:input.publicKey,nowMs:input.issuer.nowMs,
 });
 if(checked.kind!=='r75_verified_server_producer_witness')
  return refuse('unverified_producer_signature');
 const box=sealWorkSnapshot({
  memberId:input.scope.memberId,workId:input.scope.manuscriptId,
  generation:input.scope.baseVersion,
 },[{field:FIELD,recordId:input.scope.proposalVersionId,
     value:Buffer.from(input.response.text,'utf8')}],input.workKey);
 await transaction(async tx=>{
  await checkCurrent(tx,input.scope);
  const existing=await tx.query<{id:string}>(
   'SELECT id FROM proposal_versions WHERE id=$1',
   [input.scope.proposalVersionId]);
  if(existing.rows.length)refuse('already_published_version');
  await tx.query(
   `INSERT INTO ws_r76_fixture_pending_private
     (reserved_version_id,member_id,manuscript_id,draft_id,section_id,
       base_version,consent_sequence,policy_sha256,
       instruction_contract_sha256,key_id,cipher_envelope,cipher_sha256,
       server_witness,witness_signature)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13::jsonb,$14)`,
    [input.scope.proposalVersionId,input.scope.memberId,
     input.scope.manuscriptId,input.scope.draftId,input.scope.sectionId,
     input.scope.baseVersion,input.scope.consentSequence,
     input.scope.policySHA256,input.scope.instructionContractSHA256,
     input.workKey.keyId,JSON.stringify(box),cipherHash(box),
     JSON.stringify(recorded.assertion),recorded.signature]);
 });
 return {kind:'R76_SEALED_PENDING_NOT_PUBLISHED',
  reservedVersionId:input.scope.proposalVersionId,
  generation:input.scope.baseVersion,
  source:'synthetic_server_witness_fixture',
  canApply:false,canUndo:false,releaseApproved:false};
}
export async function openPendingR76(input:{
 scope:R75Scope;workKey:WorkEncryptionKey;
 publicKey:KeyLike;contentSecret:Buffer;nowMs:number;
}):Promise<R76PrivatePreview>{
 fixture();validateScope(input.scope);
 return transaction(async tx=>{
  // Verify active, matching consent and exact owned section/draft BEFORE
  // reading the SQL envelope, so revoked/foreign queries do not fetch it.
  await checkCurrent(tx,input.scope);
  const r=await tx.query<Row>(
   `SELECT reserved_version_id,member_id,manuscript_id,draft_id,
      section_id,base_version,consent_sequence,policy_sha256,
      instruction_contract_sha256,key_id,cipher_envelope,cipher_sha256,
      server_witness,witness_signature
     FROM ws_r76_fixture_pending_private
    WHERE reserved_version_id=$1 AND member_id=$2 AND manuscript_id=$3
      AND draft_id=$4 AND section_id=$5 AND base_version=$6`,
   [input.scope.proposalVersionId,input.scope.memberId,
    input.scope.manuscriptId,input.scope.draftId,input.scope.sectionId,
    input.scope.baseVersion]);
  const row=r.rows[0];
  if(r.rows.length!==1||!row)
   return refuse('private_candidate_missing_or_not_owned');
  if(Number(row.consent_sequence)!==input.scope.consentSequence||
   row.policy_sha256!==input.scope.policySHA256||
   row.instruction_contract_sha256!==input.scope.instructionContractSHA256)
   return refuse('stored_scope_or_consent_mismatch');
  const box=row.cipher_envelope;
  if(!box||cipherHash(box)!==row.cipher_sha256||
     row.key_id!==input.workKey.keyId)
   return refuse('cipher_manifest_or_key_mismatch');
  const published=await tx.query<{id:string}>(
   'SELECT id FROM proposal_versions WHERE id=$1',
   [input.scope.proposalVersionId]);
  if(published.rows.length)return refuse('candidate_already_published');
  let result:ReturnType<typeof openWorkSnapshot>;
  try{
   result=openWorkSnapshot({
    memberId:input.scope.memberId,workId:input.scope.manuscriptId,
    generation:input.scope.baseVersion,
   },box,input.workKey);
  }catch{return refuse('private_cipher_authentication_refused');}
  if(result.length!==1||result[0].field!==FIELD||
     result[0].recordId!==input.scope.proposalVersionId)
   return refuse('private_record_identity_refused');
  const proposed=result[0].value.toString('utf8');
  if(proposed.length<1||proposed.length>500||
     Buffer.from(proposed,'utf8').toString('utf8')!==proposed)
   return refuse('invalid_decrypted_proposal_content');
  const verified=verifyCompletedProducerR75({
   assertion:row.server_witness,signature:row.witness_signature,
  },{
   expectedScope:input.scope,expectedProposal:proposed,
   contentSecret:input.contentSecret,publicKey:input.publicKey,
   nowMs:input.nowMs,
  });
  if(verified.kind!=='r75_verified_server_producer_witness')
   return refuse('producer_witness_mismatch');
  // No persisted proposal_versions row, no content exported over HTTP and
  // no author Apply/Undo. Returned text is *server-only* pending material.
  return {kind:'R76_PRIVATE_PENDING_REVIEW_ONLY',
   pendingVersionId:input.scope.proposalVersionId,
   proposedPassage:proposed,
   servedProvider:verified.attribution.servedProvider,
   servedModel:verified.attribution.servedModel,
   canApply:false,canUndo:false,releaseApproved:false,
   publishedVersion:false};
 });
}
