/**
 * R75 SERVER-ONLY: attribute an exact editorial proposal to the response
 * actually returned by the trusted provider adapter, never an HTTP field.
 * Does not publish to the writer, persist prose, or grant Apply/Undo.
 */
import {createHmac,randomUUID,sign,verify,type KeyLike} from 'node:crypto';
import {classifyDivergence,type ServingIdentity,
 type LLMProvider} from '@/lib/consciousness/servingIdentity';
import type {LLMResponse} from '@/lib/consciousness/LLMProvider';

export const R75_REAL_PRODUCER_ATTESTATION_ENABLED=false as const;
export const R75_PROTOCOL='soullab.ws.r75.producer-witness.v1' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA=/^[0-9a-f]{64}$/;
const B64=/^[A-Za-z0-9_-]{80,150}$/;
const providers=new Set<LLMProvider>(['ollama','anthropic']);
export type R75Scope={
 memberId:string;manuscriptId:string;draftId:string;sectionId:string;
 proposalVersionId:string;baseVersion:number;consentSequence:number;
 policySHA256:string;instructionContractSHA256:string;
};
type Attribution={
 servedProvider:LLMProvider;servedModel:string;
 intendedProvider:LLMProvider;intendedModel:string;
 divergence:ServingIdentity['divergence'];
};
export type R75Assertion={
 protocol:typeof R75_PROTOCOL;
 serverInvocationId:string;scope:R75Scope;
 producer:Attribution;proposalCommitment:string;issuedAtMs:number;
};
export type R75Record={assertion:R75Assertion;signature:string};
export type R75Issuer={
 scope:R75Scope;contentSecret:Buffer;signingKey:KeyLike;nowMs:number;
};
export type R75Verifier={
 expectedScope:R75Scope;expectedProposal:string;
 contentSecret:Buffer;publicKey:KeyLike;nowMs:number;
};
export type R75Verdict=
 | {kind:'r75_verified_server_producer_witness';attribution:Attribution;
    releaseApproved:false;canApply:false;canUndo:false}
 | {kind:'r75_producer_unverified';reason:string;
    releaseApproved:false;canApply:false;canUndo:false};
const deny=(reason:string):R75Verdict=>({
 kind:'r75_producer_unverified',reason,
 releaseApproved:false,canApply:false,canUndo:false,
});
const label=(s:unknown,max=160):s is string=>
 typeof s==='string'&&s.length>0&&s.length<=max&&s.trim()===s&&
 !/[\u0000-\u001f\u007f]/.test(s);
const secretOK=(s:Buffer)=>Buffer.isBuffer(s)&&s.length===32;
const scopeOK=(s:R75Scope):boolean=>!!s&&[
 s.memberId,s.manuscriptId,s.draftId,s.sectionId,s.proposalVersionId
].every(x=>typeof x==='string'&&UUID.test(x))&&
 Number.isSafeInteger(s.baseVersion)&&s.baseVersion>0&&
 Number.isSafeInteger(s.consentSequence)&&s.consentSequence>0&&
 SHA.test(s.policySHA256)&&SHA.test(s.instructionContractSHA256);
function commit(text:string,secret:Buffer):string{
 return createHmac('sha256',secret)
  .update(JSON.stringify([R75_PROTOCOL,'private-proposal-content',text]))
  .digest('hex');
}
function validCompletion(r:Pick<LLMResponse,
 'provider'|'model'|'serving'|'text'|'metadata'>):boolean{
 if(!r||!r.serving||!r.metadata||
  !providers.has(r.provider)||!providers.has(r.serving.intendedProvider)||
  !providers.has(r.serving.servedProvider)||
  !label(r.model)||!label(r.serving.intendedModel)||
  !label(r.serving.servedModel)||
  r.provider!==r.serving.servedProvider||
  r.model!==r.serving.servedModel||
  r.serving.divergence!==classifyDivergence(
    r.serving.intendedProvider,r.provider)||
  typeof r.text!=='string'||!r.text.trim()||
  Array.from(r.text).length>500||
  r.metadata.stopReason==='max_tokens')return false;
 if(r.serving.divergence!=='none'&&!label(r.serving.reason))return false;
 return true;
}
export function serializedR75(a:R75Assertion):string{
 // Fixed field order; never insert raw prompt or manuscript text.
 return JSON.stringify([
  a.protocol,a.serverInvocationId,
  a.scope.memberId,a.scope.manuscriptId,a.scope.draftId,a.scope.sectionId,
  a.scope.proposalVersionId,a.scope.baseVersion,a.scope.consentSequence,
  a.scope.policySHA256,a.scope.instructionContractSHA256,
  a.producer.servedProvider,a.producer.servedModel,
  a.producer.intendedProvider,a.producer.intendedModel,
  a.producer.divergence,a.proposalCommitment,a.issuedAtMs,
 ]);
}
/** Only the trusted model-calling service can capture a post-call result. */
export function captureCompletedProducerR75(
 ctx:R75Issuer,r:Pick<LLMResponse,
 'provider'|'model'|'serving'|'text'|'metadata'>,
):R75Record|null{
 if(!scopeOK(ctx?.scope)||!secretOK(ctx.contentSecret)||
  !Number.isSafeInteger(ctx.nowMs)||ctx.nowMs<1||
  !validCompletion(r))return null;
 const a:R75Assertion={
  protocol:R75_PROTOCOL,serverInvocationId:randomUUID(),scope:{...ctx.scope},
  producer:{
   servedProvider:r.provider,servedModel:r.model,
   intendedProvider:r.serving.intendedProvider,
   intendedModel:r.serving.intendedModel,
   divergence:r.serving.divergence,
  },
  proposalCommitment:commit(r.text,ctx.contentSecret),issuedAtMs:ctx.nowMs,
 };
 return {assertion:a,signature:sign(null,Buffer.from(serializedR75(a)),
  ctx.signingKey).toString('base64url')};
}
/**
 * Read only. Caller must separately recheck current consent, owned current
 * Work, and this record's immutable database provenance before showing MAIA.
 */
export function verifyCompletedProducerR75(
 record:R75Record,ctx:R75Verifier,
):R75Verdict{
 if(!ctx||!scopeOK(ctx.expectedScope)||!secretOK(ctx.contentSecret)||
  typeof ctx.expectedProposal!=='string'||!ctx.expectedProposal.trim()||
  Array.from(ctx.expectedProposal).length>500||
  !Number.isSafeInteger(ctx.nowMs)||ctx.nowMs<1||
  !record?.assertion)return deny('invalid_verification_input');
 const a=record.assertion;
 if(a.protocol!==R75_PROTOCOL||!UUID.test(a.serverInvocationId)||
  !scopeOK(a.scope)||!SHA.test(a.proposalCommitment)||
  !Number.isSafeInteger(a.issuedAtMs)||
  a.issuedAtMs>ctx.nowMs||
  !B64.test(record.signature)||
  !providers.has(a.producer.servedProvider)||
  !providers.has(a.producer.intendedProvider)||
  !label(a.producer.servedModel)||!label(a.producer.intendedModel)||
  a.producer.divergence!==classifyDivergence(
   a.producer.intendedProvider,a.producer.servedProvider))
  return deny('invalid_producer_record');
 for(const k of Object.keys(ctx.expectedScope) as Array<keyof R75Scope>){
  if(a.scope[k]!==ctx.expectedScope[k])return deny('different_work_or_consent');
 }
 if(a.proposalCommitment!==commit(ctx.expectedProposal,ctx.contentSecret))
  return deny('proposal_content_mismatch');
 try{
  // Base64url has unused low bits in its final sextet for a 64-byte
  // Ed25519 signature. Accept only one canonical encoding of the signed
  // bytes; alternate textual encodings must not impersonate another
  // signed approval or evade exact-receipt audit comparisons.
  const signedBytes=Buffer.from(record.signature,'base64url');
  if(signedBytes.length!==64||
     signedBytes.toString('base64url')!==record.signature)
   return deny('producer_signature_invalid');
  if(!verify(null,Buffer.from(serializedR75(a)),ctx.publicKey,signedBytes))
   return deny('producer_signature_invalid');
 }catch{return deny('producer_signature_unverifiable');}
 return {kind:'r75_verified_server_producer_witness',
  attribution:a.producer,releaseApproved:false,canApply:false,canUndo:false};
}
