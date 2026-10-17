import {generateKeyPairSync,randomBytes} from 'node:crypto';
import {selfServing,servingIdentityFor}
 from '@/lib/consciousness/servingIdentity';
import type {LLMResponse} from '@/lib/consciousness/LLMProvider';
import {
 captureCompletedProducerR75,verifyCompletedProducerR75,
 R75_REAL_PRODUCER_ATTESTATION_ENABLED,
 type R75Record,type R75Scope,
} from '../editorialModelProducerR75';

const keys=generateKeyPairSync('ed25519');
const other=generateKeyPairSync('ed25519');
const scope:R75Scope={
 memberId:'11111111-1111-4111-8111-111111111111',
 manuscriptId:'22222222-2222-4222-8222-222222222222',
 draftId:'33333333-3333-4333-8333-333333333333',
 sectionId:'44444444-4444-4444-8444-444444444444',
 proposalVersionId:'55555555-5555-4555-8555-555555555555',
 baseVersion:7,consentSequence:8,policySHA256:'a'.repeat(64),
 instructionContractSHA256:'b'.repeat(64),
};
const secret=randomBytes(32);
const time=1813420800000;
const fake:Pick<LLMResponse,'provider'|'model'|'serving'|'text'|'metadata'>={
 provider:'ollama',model:'qwen2.5:7b',
 serving:selfServing('ollama','qwen2.5:7b'),
 text:'An invented quiet harbor.',metadata:{generationTime:32,stopReason:'end_turn'},
};
const issue=(scopeOverride:typeof scope=scope,content=fake)=>
 captureCompletedProducerR75({
  scope:scopeOverride,contentSecret:secret,signingKey:keys.privateKey,nowMs:time
 },content);
const verify=(record:R75Record|null,override:Partial<typeof scope>={},
 proposal=fake.text,verificationSecret=secret,publicKey=keys.publicKey,
 at=time+1000)=>
 verifyCompletedProducerR75(record as R75Record,{
  expectedScope:{...scope,...override},expectedProposal:proposal,
  contentSecret:verificationSecret,publicKey,nowMs:at,
 });
const mutated=(base:R75Record,transform:(copy:R75Record)=>void):R75Record=>{
 const value=structuredClone(base);
 transform(value);
 return value;
};
describe('R75 server-witnessed actual served model, not browser claim',()=>{
 it('leaves the real MAIA proposal publisher off by source law',()=>{
  expect(R75_REAL_PRODUCER_ATTESTATION_ENABLED).toBe(false);
 });
 it('accepts a signer-attested exact proposal without authorizing Apply',()=>{
  const made=issue();
  expect(made).not.toBeNull();
  const judged=verify(made);
  expect(judged).toMatchObject({
   kind:'r75_verified_server_producer_witness',
   releaseApproved:false,canApply:false,canUndo:false,
   attribution:{servedProvider:'ollama',servedModel:'qwen2.5:7b',
    intendedProvider:'ollama',intendedModel:'qwen2.5:7b',divergence:'none'},
  });
  expect(JSON.stringify(made)).not.toContain(fake.text);
 });
 it('records actual served local when the request intended cloud, not the requested model',()=>{
  const response={...fake,serving:servingIdentityFor({
   intendedProvider:'anthropic',intendedModel:'claude-sonnet-4-6',
   servedProvider:'ollama',servedModel:'qwen2.5:7b',reason:'test fallback'
  })};
  expect(verify(issue(scope,response))).toMatchObject({
   kind:'r75_verified_server_producer_witness',
   attribution:{servedProvider:'ollama',servedModel:'qwen2.5:7b',
    intendedProvider:'anthropic',intendedModel:'claude-sonnet-4-6',
    divergence:'capability'},
  });
 });
 it('rejects a forged serving identity that disagrees with provider response',()=>{
  const forged={...fake,serving:selfServing('anthropic','claude-sonnet-4-6')};
  expect(issue(scope,forged)).toBeNull();
 });
 it('rejects false fallback labels and unexplained fallback',()=>{
  const wrong={...fake,serving:{...fake.serving,intendedProvider:'anthropic' as const}};
  const noReason={...fake,serving:servingIdentityFor({
   intendedProvider:'anthropic',intendedModel:'claude-sonnet-4-6',
   servedProvider:'ollama',servedModel:'qwen2.5:7b',reason:'',
  })};
  expect(issue(scope,wrong)).toBeNull();
  expect(issue(scope,noReason)).toBeNull();
 });
 it('rejects partial/truncated responses as if complete',()=>{
  expect(issue(scope,{...fake,metadata:{...fake.metadata,stopReason:'max_tokens'}}))
   .toBeNull();
 });
 it('rejects empty text, invalid scope, or missing consent event',()=>{
  expect(issue(scope,{...fake,text:''})).toBeNull();
  expect(issue({...scope,consentSequence:0})).toBeNull();
  expect(issue({...scope,proposalVersionId:'untrusted'})).toBeNull();
 });
 it('rejects content changed after signing, including one punctuation change',()=>{
  expect(verify(issue(),{},'An invented quiet harbor!').kind).toBe('r75_producer_unverified');
 });
 it('rejects a missing or wrong server content secret',()=>{
  expect(verify(issue(),{},fake.text,randomBytes(32)).kind)
   .toBe('r75_producer_unverified');
 });
 it('rejects wrong member, Work, draft, section or proposal UUID',()=>{
  const made=issue();
  for(const field of ['memberId','manuscriptId','draftId','sectionId',
   'proposalVersionId'] as const){
   expect(verify(made,{[field]:'66666666-6666-4666-8666-666666666666'}).kind)
    .toBe('r75_producer_unverified');
  }
 });
 it('rejects a moved Draft or a withdrawn/replaced consent epoch and policy',()=>{
  const made=issue();
  for(const changed of [
   {baseVersion:scope.baseVersion+1},
   {consentSequence:scope.consentSequence+1},
   {policySHA256:'c'.repeat(64)},
   {instructionContractSHA256:'d'.repeat(64)},
  ]){
   expect(verify(made,changed).kind).toBe('r75_producer_unverified');
  }
 });
 it('rejects tampered model metadata, different signature and wrong trust root',()=>{
  const made=issue()!;
  expect(verify(mutated(made,x=>{x.assertion.producer.servedModel='fake';})).kind)
   .toBe('r75_producer_unverified');
  expect(verify(mutated(made,x=>{x.signature=(x.signature[0]==='A'?'B':'A')+x.signature.slice(1);})).kind)
   .toBe('r75_producer_unverified');
  expect(verify(made,{},fake.text,secret,other.publicKey).kind)
   .toBe('r75_producer_unverified');
 });
 it('refuses noncanonical alternate encodings of the EXACT same Ed25519 bytes',()=>{
  const made=issue()!;
  const abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const last=made.signature.at(-1)!;
  const alias=made.signature.slice(0,-1)+abc[abc.indexOf(last)^1];
  expect(alias).not.toBe(made.signature);
  // Ed25519 signatures are 64 bytes: the final base64url character contains
  // four unused low bits. Without strict canonicalization these two TEXT
  // receipts decode to the SAME signed bytes.
  expect(Buffer.from(alias,'base64url').equals(
   Buffer.from(made.signature,'base64url'))).toBe(true);
  expect(verify({...made,signature:alias}).kind)
    .toBe('r75_producer_unverified');
 });
 it('rejects a future receipt but preserves accurate historical authorship',()=>{
  const made=issue()!;
  expect(verify(made,{},fake.text,secret,keys.publicKey,time-1).kind)
   .toBe('r75_producer_unverified');
  // Who actually produced an immutable proposal does not expire after minutes.
  // Current author consent and mutable Work are rechecked separately.
  expect(verify(made,{},fake.text,secret,keys.publicKey,time+86400000).kind)
   .toBe('r75_verified_server_producer_witness');
 });
 it('never derives MAIA authorship from model name alone or writes a proposal row',()=>{
  const made=issue()!;
  const serialized=JSON.stringify(made);
  expect(serialized).not.toContain('author');
  expect(serialized).not.toContain(fake.text);
  expect(serialized).not.toContain('releaseApproved');
 });
});
