/**
 * R65 — conventional writer's own pasted Source, all manuscript sections and
 * one SAVE intention commit in exactly ONE PostgreSQL transaction.
 *
 * The member identity comes ONLY from the already verified route session.
 * Repeated same-member/UUID/same-author-payload confirmations are receipts,
 * never a second Work; a spent/deleted or modified request cannot be replayed.
 *
 * This helper is NOT a generic file-backed import: uploaded files need the
 * existing independently verified durable-vault claim. No KMS or live flag.
 */
import {createHash} from 'node:crypto';
import {transaction} from '@/lib/db/postgres';
import {buildArrival,MEMBER_SUPPLIED_TEXT} from './custody';
import type {ConfirmedSectionR63} from './persistConfirmedSectionsR63';
import { withHeldR7019BWriter } from '@/lib/writersStudio/recovery/heldR7019BWriterFence';

const UUID_V4=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

export class PasteConfirmationRefusalR65 extends Error {
 constructor(readonly reason:'invalid_confirmation'|
    'changed_confirmation'|'deleted_or_unverifiable_receipt'){
  super('paste_confirmation_'+reason);
  this.name='PasteConfirmationRefusalR65';
 }
}

export type ConfirmedPasteResultR65={
 readonly manuscriptId:string;
 readonly replayed:boolean;
 readonly sourceCustody:'source_custodied';
};

export async function persistConfirmedPasteR65(input:{
 readonly verifiedMemberId:string;
 readonly confirmationId:string;
 readonly title:string;
 readonly sections:readonly ConfirmedSectionR63[];
 readonly sourceText:string;
}):Promise<ConfirmedPasteResultR65>{
 if(!input?.verifiedMemberId||!UUID_V4.test(input.confirmationId||'')||
   !input.title?.trim()||!input.sections?.length||
   typeof input.sourceText!=='string'||!input.sourceText.trim()){
  throw new PasteConfirmationRefusalR65('invalid_confirmation');
 }
 const record=buildArrival({
  kind:MEMBER_SUPPLIED_TEXT,sourceText:input.sourceText,
 });
 // Not a secret and not an encryption key; a stable identity commitment
 // for precisely the same Save payload. Do not log, expose or accept it
 // as a client-controlled permission. Original prose remains separately held.
 const fingerprint=createHash('sha256').update(
  JSON.stringify(['r65-confirmed-paste-v1',input.title,input.sections,
   input.sourceText])).digest('hex');

 return withHeldR7019BWriter(input.verifiedMemberId, 'confirmed_paste',
  () => transaction(async(tx)=>{
  // Unique (member_id,confirmation_id) is the cross-process mutex. PG
  // holds conflict detection through COMMIT/ROLLBACK, serializing concurrent
  // retries instead of allowing a second manuscript row.
  const claimed=await tx.query<{confirmation_id:string}>(`
   INSERT INTO manuscript_import_confirmations
      (member_id,confirmation_id)
   VALUES($1,$2)
   ON CONFLICT (member_id,confirmation_id) DO NOTHING
   RETURNING confirmation_id
  `,[input.verifiedMemberId,input.confirmationId]);
  if(claimed.rowCount===0){
   const existing=await tx.query<{
    request_sha256:string|null;manuscript_id:string|null;
   }>(`
    SELECT p.request_sha256,c.manuscript_id
      FROM manuscript_import_confirmations c
      LEFT JOIN manuscript_import_active_payloads p
        ON p.member_id=c.member_id
       AND p.confirmation_id=c.confirmation_id
       AND p.manuscript_id=c.manuscript_id
     WHERE c.member_id=$1 AND c.confirmation_id=$2 FOR UPDATE OF c
   `,[input.verifiedMemberId,input.confirmationId]);
   const row=existing.rows[0];
   if(existing.rows.length!==1 || !row){
    throw new PasteConfirmationRefusalR65('deleted_or_unverifiable_receipt');
   }
   if(!row.manuscript_id || !row.request_sha256){
    throw new PasteConfirmationRefusalR65('deleted_or_unverifiable_receipt');
   }
   if(row.request_sha256!==fingerprint){
    throw new PasteConfirmationRefusalR65('changed_confirmation');
   }
   // The receipt is only valid if the SAME member's manuscript and exact
   // immutable member-supplied Source are still present and certified.
   // A removed/missing Source or foreign manuscript is never replay authority.
   const verified=await tx.query<{id:string}>(`
    SELECT m.id FROM member_manuscripts m
     JOIN manuscript_source_arrivals s
       ON s.manuscript_id=m.id AND s.member_id=m.member_id
      AND s.source_kind='member_supplied_text'
      AND s.source_text_hash=$3
    WHERE m.id=$1 AND m.member_id=$2
      AND m.source_custody='source_custodied'
    LIMIT 1
   `,[row.manuscript_id,input.verifiedMemberId,record.sourceTextHash]);
   if(verified.rows.length!==1){
    throw new PasteConfirmationRefusalR65('deleted_or_unverifiable_receipt');
   }
   return {
    manuscriptId:row.manuscript_id,replayed:true,
    sourceCustody:'source_custodied',
   };
  }
  if(claimed.rowCount!==1){
   throw new PasteConfirmationRefusalR65('deleted_or_unverifiable_receipt');
  }

  const minted=await tx.query<{id:string}>(
   'INSERT INTO member_manuscripts (member_id, title) VALUES ($1,$2) RETURNING id',
   [input.verifiedMemberId,input.title],
  );
  const manuscriptId=minted.rows[0]?.id;
  if(minted.rowCount!==1 || !manuscriptId){
   throw new Error('r65_manuscript_insert_unverified');
  }
  for(const section of input.sections){
   const saved=await tx.query(`
    INSERT INTO manuscript_sections
      (manuscript_id,position,heading,body,heading_depth,heading_signal)
    VALUES ($1,$2,$3,$4,$5,$6)
   `,[manuscriptId,section.position,section.heading,section.body,
     section.headingDepth,section.headingSignal]);
   if(saved.rowCount!==1)throw new Error('r65_section_insert_unverified');
  }
  const original=await tx.query<{id:string}>(`
   INSERT INTO manuscript_source_arrivals
      (member_id,manuscript_id,source_kind,artifact_ref,artifact_hash,
       artifact_size,original_filename,mime_type,source_text,source_text_hash,
       extraction_method,extractor_version)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
   RETURNING id
  `,[
   input.verifiedMemberId,manuscriptId,record.sourceKind,
   record.artifactRef,record.artifactHash,record.artifactSize,
   record.originalFilename,record.mimeType,record.sourceText,
   record.sourceTextHash,record.extractionMethod,record.extractorVersion,
  ]);
  if(original.rowCount!==1 || !original.rows[0]?.id){
   throw new Error('r65_original_source_insert_unverified');
  }
  const marked=await tx.query(`
   UPDATE member_manuscripts SET source_custody='source_custodied'
    WHERE id=$1 AND member_id=$2
  `,[manuscriptId,input.verifiedMemberId]);
  if(marked.rowCount!==1)throw new Error('r65_source_custody_mark_unverified');
  const finalized=await tx.query(`
   UPDATE manuscript_import_confirmations SET manuscript_id=$3
    WHERE member_id=$1 AND confirmation_id=$2
      AND manuscript_id IS NULL
  `,[input.verifiedMemberId,input.confirmationId,manuscriptId]);
  if(finalized.rowCount!==1){
   throw new Error('r65_receipt_finalization_unverified');
  }
  // Content-derived request fingerprints are NOT permanent tombstones:
  // their FK to the manuscript cascades on Delete Work while the opaque
  // confirmation UUID survives with manuscript_id=NULL.
  const active=await tx.query(`
   INSERT INTO manuscript_import_active_payloads
      (member_id,confirmation_id,manuscript_id,request_sha256)
   VALUES ($1,$2,$3,$4)
  `,[input.verifiedMemberId,input.confirmationId,manuscriptId,fingerprint]);
  if(active.rowCount!==1){
   throw new Error('r65_payload_receipt_unverified');
  }
  // The RETURNED receipt happens only AFTER transaction() commits.
  return {
   manuscriptId,replayed:false,sourceCustody:'source_custodied',
  };
 }));
}
