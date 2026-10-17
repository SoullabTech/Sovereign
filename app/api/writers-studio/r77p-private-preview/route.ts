/**
 * R77P — local-fictional-only confidential pending proposal preview.
 * No real model, provider, member, operational signer or published proposal.
 * GET reads only after verified SQL member ownership/current consent,
 * AES-GCM authentication and verified synthetic server model witness.
 */
import {NextRequest,NextResponse} from 'next/server';
import {createHash,createPrivateKey,createPublicKey,randomUUID} from 'node:crypto';
import {getMemberIdFromRequest} from '@/lib/auth/getMemberFromRequest';
import {privateWriterNoStore} from '@/lib/writersStudio/release/privateWriterNoStore';
import {transaction} from '@/lib/db/postgres';
import {requireR72CurrentConsent,R72Refused} from '@/lib/writersStudio/recovery/r72MemberProposalConsent';
import {sealPendingR76,openPendingR76,R76Refused} from '@/lib/writersStudio/provenance/heldConfidentialCandidateR76';
import {servingIdentityFor} from '@/lib/consciousness/servingIdentity';
import type {R75Scope} from '@/lib/writersStudio/provenance/editorialModelProducerR75';

export const dynamic='force-dynamic';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA=/^[0-9a-f]{64}$/;
const refusal=(reason:string,status=409)=>
 privateWriterNoStore(NextResponse.json({kind:'refused',reason,releaseApproved:false},{status}));
const enabled=(req:NextRequest)=>
 process.env.NODE_ENV==='development'&&
 process.env.R77P_LOCAL_REVIEW_FIXTURE==='fictional-only'&&
 process.env.NEXT_PUBLIC_R77P_LOCAL_REVIEW_FIXTURE==='fictional-only'&&
 process.env.R77P_KEYS_ORIGIN==='synthetic-generated-test-only'&&
 process.env.R76_PENDING_CANDIDATE_FIXTURE==='fictional-only'&&
 process.env.R72_MEMBER_PROPOSALS_FIXTURE==='fictional-only'&&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/.test(
  process.env.DATABASE_URL||'')&&req.nextUrl.protocol==='http:'&&
 /^127\.0\.0\.1:\d+$/.test(req.headers.get('host')||'');
const instructionSHA=createHash('sha256')
 .update('R77P synthetic confidential preview: no model invoked').digest('hex');
const sampleResponse={
 text:'A fictional candle glows beside the remembered river.',
 provider:'ollama' as const,model:'qwen2.5:7b',
 serving:servingIdentityFor({
  intendedProvider:'anthropic',intendedModel:'claude-sonnet-4-6',
  servedProvider:'ollama',servedModel:'qwen2.5:7b',
  reason:'synthetic-only preview: no provider called',
 }),
 metadata:{generationTime:1,stopReason:'end_turn'},
};
// Fixture keys are minted fresh by the isolated PG driver and forwarded to
// localhost Next ONLY. Never log, reflect or persist their bytes.
function syntheticKeys(){
 const rawWork=process.env.R77P_FAKE_WORK_KEY_HEX||'';
 const rawContent=process.env.R77P_FAKE_CONTENT_SECRET_HEX||'';
 const keyId=process.env.R77P_FAKE_WORK_KEY_ID||'';
 const priv=process.env.R77P_FAKE_PRIVATE_PEM_B64||'';
 const pub=process.env.R77P_FAKE_PUBLIC_PEM_B64||'';
 if(!/^[a-f0-9]{64}$/.test(rawWork)||
    !/^[a-f0-9]{64}$/.test(rawContent)||!UUID.test(keyId)||
    !/^[A-Za-z0-9+/=]{100,5000}$/.test(priv)||
    !/^[A-Za-z0-9+/=]{100,5000}$/.test(pub))
  throw new Error('fixture_key_material_not_initialized');
 return {workKey:{keyId,keyBytes:Buffer.from(rawWork,'hex')},
  contentSecret:Buffer.from(rawContent,'hex'),
  privateKey:createPrivateKey(Buffer.from(priv,'base64').toString('utf8')),
  publicKey:createPublicKey(Buffer.from(pub,'base64').toString('utf8'))};
}
type ScopeHead={id:string;version:string};
async function currentScope(memberId:string,manuscriptId:string,sectionId:string){
 return transaction(async tx=>{
  const consent=await requireR72CurrentConsent(tx,memberId);
  const result=await tx.query<ScopeHead>(
   `SELECT d.id,d.version FROM manuscript_working_drafts d
     JOIN member_manuscripts m ON m.id=d.manuscript_id
      AND m.member_id=d.member_id
     JOIN manuscript_draft_sections ds ON ds.draft_id=d.id
    WHERE m.id=$1 AND m.member_id=$2 AND ds.id=$3
      AND d.section_addressable_at IS NOT NULL
    LIMIT 1`,[manuscriptId,memberId,sectionId]);
  if(result.rows.length!==1)throw new R76Refused('not_author_owned');
  return {head:result.rows[0],consent};
 });
}
function fail(e:unknown){
 if(e instanceof R76Refused||e instanceof R72Refused){
  const reason=e.reason;
  const code=/not_author_owned|not_owned|missing/.test(reason)?404:
   /consent|unapproved|writer_beta/.test(reason)?403:409;
  return refusal(reason,code);
 }
 return refusal('fictional_private_preview_unavailable',503);
}
export async function POST(req:NextRequest){
 if(!enabled(req))return new NextResponse(null,{status:404});
 if(req.headers.get('origin')!==`http://${req.headers.get('host')}`||
    req.headers.get('sec-fetch-site')==='cross-site'||
    req.headers.has('x-member-id')||
    !/^application\/json(?:;\s*charset=utf-8)?$/i.test(
      req.headers.get('content-type')||'')||
    req.nextUrl.searchParams.size!==0)
  return refusal('untrusted_origin',403);
 const memberId=await getMemberIdFromRequest(req);
 if(!memberId)return refusal('authentication_required',401);
 try{
  const raw=await req.text();
  if(Buffer.byteLength(raw)>1024)return refusal('request_too_large',413);
  const o:unknown=JSON.parse(raw);
  if(!o||typeof o!=='object'||Array.isArray(o))return refusal('invalid_action',400);
  const data=o as Record<string,unknown>;
  if(Object.keys(data).sort().join(',')!=='kind,manuscriptId,sectionId'||
    data.kind!=='stage_fictional_private_candidate'||
    typeof data.manuscriptId!=='string'||!UUID.test(data.manuscriptId)||
    typeof data.sectionId!=='string'||!UUID.test(data.sectionId))
   return refusal('invalid_action',400);
  const active=await currentScope(memberId,data.manuscriptId,data.sectionId);
  const {workKey,contentSecret,privateKey,publicKey}=syntheticKeys();
  const versionId=randomUUID();
  const scope:R75Scope={
   memberId,manuscriptId:data.manuscriptId,
   draftId:active.head.id,sectionId:data.sectionId,
   proposalVersionId:versionId,
   baseVersion:Number(active.head.version),
   consentSequence:active.consent.consentSequence,
   policySHA256:active.consent.noticeSHA256,
   instructionContractSHA256:instructionSHA,
  };
  const receipt=await sealPendingR76({
   scope,response:sampleResponse,workKey,
   issuer:{contentSecret,signingKey:privateKey,nowMs:Date.now()},
   publicKey,
  });
  return privateWriterNoStore(NextResponse.json({
   kind:'r77p_fictional_candidate_sealed',
   pendingId:receipt.reservedVersionId,mayApply:false,mayUndo:false,
   releaseApproved:false,
  }));
 }catch(e){return fail(e);}
}
export async function GET(req:NextRequest){
 if(!enabled(req))return new NextResponse(null,{status:404});
 const memberId=await getMemberIdFromRequest(req);
 if(!memberId)return refusal('authentication_required',401);
 const params=req.nextUrl.searchParams;
 const manuscriptId=params.get('manuscriptId')||'';
 const pendingId=params.get('pendingId')||'';
 if(params.size!==2||!UUID.test(manuscriptId)||!UUID.test(pendingId))
  return refusal('invalid_read_scope',400);
 try{
  // Read only non-prose scope metadata first and only for the member.
  const pending=await transaction(async tx=>{
   // The first query is metadata-only: distinguish an unowned candidate
   // as 404 without revealing whether the writer has active beta consent.
   // Encrypted fields and proposal words are NOT selected here.
   const q=await tx.query<{
    draft_id:string;section_id:string;base_version:string;
    consent_sequence:string;policy_sha256:string;instruction_contract_sha256:string;
   }>(`SELECT draft_id,section_id,base_version,consent_sequence,
        policy_sha256,instruction_contract_sha256
       FROM ws_r76_fixture_pending_private
      WHERE reserved_version_id=$1 AND member_id=$2 AND manuscript_id=$3`,
      [pendingId,memberId,manuscriptId]);
   const row=q.rows[0];
   if(!row)return null;
   // Only an owned metadata row can proceed to current-consent evaluation.
   // openPendingR76 repeats consent and Work verification before decryption.
   const active=await requireR72CurrentConsent(tx,memberId);
   if(active.consentSequence!==Number(row.consent_sequence)||
      active.noticeSHA256!==row.policy_sha256)
    throw new R76Refused('consent_or_notice_epoch_changed');
   return row;
  });
  if(!pending)return refusal('not_author_owned',404);
  const {workKey,contentSecret,publicKey}=syntheticKeys();
  const scope:R75Scope={
   memberId,manuscriptId,draftId:pending.draft_id,
   sectionId:pending.section_id,proposalVersionId:pendingId,
   baseVersion:Number(pending.base_version),
   consentSequence:Number(pending.consent_sequence),
   policySHA256:pending.policy_sha256,
   instructionContractSHA256:pending.instruction_contract_sha256,
  };
  if(!SHA.test(scope.policySHA256)||!SHA.test(scope.instructionContractSHA256))
   return refusal('invalid_stored_scope',409);
  const opened=await openPendingR76({
   scope,workKey,contentSecret,publicKey,nowMs:Date.now(),
  });
  return privateWriterNoStore(NextResponse.json({
   kind:'r77p_fictional_private_review_only',
   pendingId,
   proposedPassage:opened.proposedPassage,
   servedProvider:opened.servedProvider,
   servedModel:opened.servedModel,
   fictionalModelResponse:true,canApply:false,canUndo:false,
   publishedVersion:false,releaseApproved:false,
  }));
 }catch(e){return fail(e);}
}
