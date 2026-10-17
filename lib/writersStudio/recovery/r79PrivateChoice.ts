/**
 * R79: isolated fictional-only, server-verified sealed-pending-to-exact-author
 * choice bridge. Never admits real MAIA output or a production write.
 *
 * There is no proposal_versions publication: private pending text is read
 * solely after exact member + current consent + draft-head + section + Unicode
 * passage position + original section SHA-256 + authenticated ciphertext +
 * signed synthetic provider/word witness. A separate R71 one-use token
 * authorizes the EXISTING canonical section writer. Undo stays independent.
 */
import {createHash,createPublicKey} from 'node:crypto';
import {transaction,type TransactionClient} from '@/lib/db/postgres';
import {splitStoredSection} from '@/lib/manuscript/sections/sectionProjection';
import {openPendingR76InTransaction,R76Refused}
 from '@/lib/writersStudio/provenance/heldConfidentialCandidateR76';
import type {R75Scope} from '@/lib/writersStudio/provenance/editorialModelProducerR75';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA=/^[a-f0-9]{64}$/;
const sha=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
export const R79_REAL_AUTHOR_ADMISSION_ENABLED=false as const;
export const enabledR79=()=>R79_REAL_AUTHOR_ADMISSION_ENABLED===false&&
 process.env.NODE_ENV==='development'&&
 process.env.R79_PRIVATE_AUTHOR_FIXTURE==='fictional-only'&&
 process.env.NEXT_PUBLIC_R79_PRIVATE_AUTHOR_FIXTURE==='fictional-only'&&
 process.env.R71_AUTHOR_EDITORIAL_FIXTURE==='fictional-only'&&
 process.env.R72_MEMBER_PROPOSALS_FIXTURE==='fictional-only'&&
 process.env.R76_PENDING_CANDIDATE_FIXTURE==='fictional-only'&&
 process.env.R77P_LOCAL_REVIEW_FIXTURE==='fictional-only'&&
 process.env.R77P_KEYS_ORIGIN==='synthetic-generated-test-only'&&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/.test(
  process.env.DATABASE_URL||'');
export class R79Refused extends Error{
 constructor(readonly reason:string){super('r79_'+reason);}
}
const refuse=(reason:string):never=>{throw new R79Refused(reason);};
/** Key bytes only reside in an isolated local Next process, never receipts. */
const keys=()=>{
 if(!enabledR79())return refuse('fictional_local_only');
 const keyId=process.env.R77P_FAKE_WORK_KEY_ID||'';
 const work=process.env.R77P_FAKE_WORK_KEY_HEX||'';
 const content=process.env.R77P_FAKE_CONTENT_SECRET_HEX||'';
 const pub=process.env.R77P_FAKE_PUBLIC_PEM_B64||'';
 if(!UUID.test(keyId)||!SHA.test(work)||!SHA.test(content)||
    !/^[A-Za-z0-9+/=]{100,5000}$/.test(pub))
  return refuse('fictional_key_material_unavailable');
 return {
  workKey:{keyId,keyBytes:Buffer.from(work,'hex')},
  contentSecret:Buffer.from(content,'hex'),
  publicKey:createPublicKey(Buffer.from(pub,'base64').toString('utf8')),
 };
};
type Locus={
 pending_version_id:string;member_id:string;manuscript_id:string;
 draft_id:string;section_id:string;base_version:string;
 passage_start:number;passage_end:number;passage_sha256:string;
 section_body_sha256:string;
 consent_sequence:string;policy_sha256:string;instruction_contract_sha256:string;
};
type Section={id:string;text:string;heading:string|null};
export type ExactSelection={
 memberId:string;manuscriptId:string;draftId:string;sectionId:string;
 baseVersion:number;pendingId:string;
 passage:{start:number;end:number;text:string};
};
/** INSERT after R76 ciphertext was sealed. On any failure the unpublished
 * orphan remains unusable: only a matching immutable locus can enter R71. */
export async function bindR79ExactPassage(input:ExactSelection){
 if(!enabledR79())return refuse('fictional_local_only');
 const {passage}=input;
 if(!UUID.test(input.memberId)||!UUID.test(input.manuscriptId)||
    !UUID.test(input.draftId)||!UUID.test(input.sectionId)||
    !UUID.test(input.pendingId)||!Number.isSafeInteger(input.baseVersion)||
    !Number.isSafeInteger(passage.start)||!Number.isSafeInteger(passage.end)||
    passage.start<0||passage.end<=passage.start||
    passage.end-passage.start>1200||!passage.text?.trim())
  return refuse('invalid_passage_identity');
 return transaction(async tx=>{
  const original=await tx.query<Section>(
   `SELECT ds.id,ds.text,ms.heading FROM manuscript_draft_sections ds
      JOIN manuscript_working_drafts d ON d.id=ds.draft_id
      JOIN member_manuscripts m ON m.id=d.manuscript_id
      LEFT JOIN manuscript_sections ms ON ms.id=ds.source_section_id
     WHERE ds.id=$1 AND d.id=$2 AND d.version=$3
       AND m.id=$4 AND m.member_id=$5 AND d.member_id=$5
     FOR UPDATE OF d`,
   [input.sectionId,input.draftId,input.baseVersion,
    input.manuscriptId,input.memberId]);
  const found=original.rows[0];
  const split=found?splitStoredSection(found.text,found.heading):null;
  if(!split||Array.from(split.body).slice(
    passage.start,passage.end).join('')!==passage.text)
   return refuse('exact_passage_not_current');
  const sealed=await tx.query<{reserved_version_id:string}>(
   `SELECT reserved_version_id FROM ws_r76_fixture_pending_private
     WHERE reserved_version_id=$1 AND member_id=$2
       AND manuscript_id=$3 AND draft_id=$4 AND section_id=$5
       AND base_version=$6`,
   [input.pendingId,input.memberId,input.manuscriptId,input.draftId,
    input.sectionId,input.baseVersion]);
  if(sealed.rows.length!==1)return refuse('sealed_candidate_not_owned');
  await tx.query(
   `INSERT INTO ws_r79_fixture_private_passage
     (pending_version_id,member_id,manuscript_id,draft_id,section_id,
      base_version,passage_start,passage_end,passage_sha256,section_body_sha256)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
   [input.pendingId,input.memberId,input.manuscriptId,input.draftId,
    input.sectionId,input.baseVersion,passage.start,passage.end,
    sha(passage.text),sha(split.body)]);
  return {kind:'R79_FICTIONAL_EXACT_PRIVATE_LOCUS',
   pendingId:input.pendingId,canApply:false,releaseApproved:false};
 });
}
export async function resolveR79CurrentPrivateChoice(
 tx:TransactionClient,scope:ExactSelection,
){
 if(!enabledR79())return refuse('fictional_local_only');
 if(!UUID.test(scope.pendingId)||!UUID.test(scope.memberId)||
   !UUID.test(scope.manuscriptId)||!UUID.test(scope.sectionId)||
   !UUID.test(scope.draftId))return refuse('invalid_identity');
 const r=await tx.query<Locus>(
  `SELECT b.*,p.consent_sequence,p.policy_sha256,p.instruction_contract_sha256
     FROM ws_r79_fixture_private_passage b
     JOIN ws_r76_fixture_pending_private p
      ON p.reserved_version_id=b.pending_version_id
      AND p.member_id=b.member_id AND p.manuscript_id=b.manuscript_id
      AND p.draft_id=b.draft_id AND p.section_id=b.section_id
      AND p.base_version=b.base_version
    WHERE b.pending_version_id=$1 AND b.member_id=$2
      AND b.manuscript_id=$3 AND b.draft_id=$4 AND b.section_id=$5
      AND b.base_version=$6`,
  [scope.pendingId,scope.memberId,scope.manuscriptId,scope.draftId,
   scope.sectionId,scope.baseVersion]);
 const v=r.rows[0],p=scope.passage;
 if(r.rows.length!==1||!v)return refuse('pending_locus_not_owned');
 if(!Number.isSafeInteger(p.start)||!Number.isSafeInteger(p.end)||
    p.start!==v.passage_start||p.end!==v.passage_end||
    sha(p.text)!==v.passage_sha256)
  return refuse('selected_words_not_same');
 const current=await tx.query<Section>(
  `SELECT ds.id,ds.text,ms.heading FROM manuscript_draft_sections ds
     LEFT JOIN manuscript_sections ms ON ms.id=ds.source_section_id
    WHERE ds.id=$1 AND ds.draft_id=$2`,
  [scope.sectionId,scope.draftId]);
 const found=current.rows[0];
 const body=found?splitStoredSection(found.text,found.heading)?.body:null;
 if(body===null||body===undefined||sha(body)!==v.section_body_sha256||
   Array.from(body).slice(p.start,p.end).join('')!==p.text)
  return refuse('section_or_exact_passage_changed');
 if(!Number.isSafeInteger(Number(v.consent_sequence))||
    !SHA.test(v.policy_sha256)||!SHA.test(v.instruction_contract_sha256))
  return refuse('invalid_custody_metadata');
 const r75Scope:R75Scope={
  memberId:scope.memberId,manuscriptId:scope.manuscriptId,
  draftId:scope.draftId,sectionId:scope.sectionId,
  proposalVersionId:scope.pendingId,baseVersion:scope.baseVersion,
  consentSequence:Number(v.consent_sequence),
  policySHA256:v.policy_sha256,
  instructionContractSHA256:v.instruction_contract_sha256,
 };
 const k=keys();
 const opened=await openPendingR76InTransaction(tx,{
  scope:r75Scope,workKey:k.workKey,contentSecret:k.contentSecret,
  publicKey:k.publicKey,nowMs:Date.now(),
 });
 if(!opened.proposedPassage.trim()||opened.publishedVersion!==false||
    opened.canApply!==false)
  return refuse('unverified_private_proposal');
 return {replacement:opened.proposedPassage,
  servedProvider:opened.servedProvider,servedModel:opened.servedModel,
  publishedVersion:false as const};
}

/** Metadata-only owner test; no ciphertext/proposal words selected. */
export async function ownsR79SealedChoice(
 tx:TransactionClient,memberId:string,pendingId:string,
):Promise<boolean>{
 if(!enabledR79()||!UUID.test(memberId)||!UUID.test(pendingId))return false;
 const r=await tx.query<{pending_version_id:string}>(
  `SELECT pending_version_id FROM ws_r79_fixture_private_passage
    WHERE pending_version_id=$1 AND member_id=$2`,[pendingId,memberId]);
 return r.rows.length===1;
}
