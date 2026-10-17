import {generateKeyPairSync,randomBytes} from 'node:crypto';
import {selfServing} from '@/lib/consciousness/servingIdentity';
import {captureCompletedProducerR75,type R75Scope}
 from '../editorialModelProducerR75';

const mockConsent=jest.fn();
jest.mock('@/lib/writersStudio/recovery/r72MemberProposalConsent',()=>({
 requireR72CurrentConsent:(...args:unknown[])=>mockConsent(...args),
}));
import {inspectCurrentProducerR75}
 from '../heldProducerReadR75';
import type {TransactionClient} from '@/lib/db/postgres';

const k=generateKeyPairSync('ed25519'),secret=randomBytes(32);
const scope:R75Scope={
 memberId:'11111111-1111-4111-8111-111111111111',
 manuscriptId:'22222222-2222-4222-8222-222222222222',
 draftId:'33333333-3333-4333-8333-333333333333',
 sectionId:'44444444-4444-4444-8444-444444444444',
 proposalVersionId:'55555555-5555-4555-8555-555555555555',
 baseVersion:4,consentSequence:7,
 policySHA256:'a'.repeat(64),instructionContractSHA256:'b'.repeat(64),
};
const now=1813420800000;
const response={
 provider:'ollama' as const,model:'qwen2.5:7b',
 serving:selfServing('ollama','qwen2.5:7b'),
 text:'A synthetic inner garden.',
 metadata:{generationTime:17,stopReason:'end_turn'},
};
function signed(){
 const receipt=captureCompletedProducerR75({
  scope,contentSecret:secret,signingKey:k.privateKey,nowMs:now,
 },response);
 if(!receipt)throw Error('FICTITIOUS_PRODUCER_NOT_CAPTURED');
 return receipt;
}
function row(overrides:Record<string,unknown>={}):Record<string,unknown>{
 const {assertion:a,signature}=signed();
 return {
  author:'maia',formulation:response.text,
  member_id:scope.memberId,work_id:scope.manuscriptId,
  draft_id:scope.draftId,target_section_id:scope.sectionId,
  base_version:scope.baseVersion,
  proposal_version_id:scope.proposalVersionId,
  server_invocation_id:a.serverInvocationId,
  witness_member_id:scope.memberId,
  witness_manuscript_id:scope.manuscriptId,
  witness_draft_id:scope.draftId,witness_section_id:scope.sectionId,
  witness_base_version:scope.baseVersion,
  consent_sequence:scope.consentSequence,
  policy_sha256:scope.policySHA256,
  instruction_contract_sha256:scope.instructionContractSHA256,
  served_provider:a.producer.servedProvider,
  served_model:a.producer.servedModel,
  intended_provider:a.producer.intendedProvider,
  intended_model:a.producer.intendedModel,
  divergence:a.producer.divergence,
  proposal_commitment:a.proposalCommitment,signed_at_ms:a.issuedAtMs,
  signature,...overrides,
 };
}
function ctx(){
 return {
  memberId:scope.memberId,manuscriptId:scope.manuscriptId,
  draftId:scope.draftId,sectionId:scope.sectionId,
  proposalVersionId:scope.proposalVersionId,baseVersion:scope.baseVersion,
  instructionContractSHA256:scope.instructionContractSHA256,
  contentSecret:secret,publicKey:k.publicKey,nowMs:now+100,
 };
}
const query=jest.fn();
const tx={query:(...args:unknown[])=>query(...args)} as unknown as TransactionClient;
const original={
 flag:process.env.R75_PG_SQL_READ_FIXTURE,
 r72:process.env.R72_MEMBER_PROPOSALS_FIXTURE,
 url:process.env.DATABASE_URL,
};
beforeEach(()=>{
 query.mockReset();mockConsent.mockReset();
 process.env.R75_PG_SQL_READ_FIXTURE='fictional-only';
 process.env.R72_MEMBER_PROPOSALS_FIXTURE='fictional-only';
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:49152/ws_atomic';
 mockConsent.mockResolvedValue({
  consentSequence:scope.consentSequence,noticeSHA256:scope.policySHA256,
 });
});
afterAll(()=>{
 for(const [key,value] of Object.entries(original)){
  const env=key==='flag'?'R75_PG_SQL_READ_FIXTURE':
   key==='r72'?'R72_MEMBER_PROPOSALS_FIXTURE':'DATABASE_URL';
  if(value===undefined)delete process.env[env];else process.env[env]=value;
 }
});
const run=()=>inspectCurrentProducerR75(tx,ctx());

describe('R75 verified producer custody is NOT author Apply permission',()=>{
 it('accepts exact signed server result only after current consent',async()=>{
  query.mockResolvedValue({rows:[row()]});
  expect(await run()).toMatchObject({
   kind:'r75_verified_server_producer_witness',
   releaseApproved:false,canApply:false,canUndo:false,
  });
  expect(mockConsent).toHaveBeenCalledTimes(1);
  expect(query).toHaveBeenCalledTimes(1);
  const sql=String(query.mock.calls[0][0]);
  expect(sql).toContain('LEFT JOIN ws_r75_fixture_producer_witness');
  expect(sql).toContain("c.member_id=$2");
 });
 it('keeps verified member-authored versions outside MAIA attribution',async()=>{
  query.mockResolvedValue({rows:[row({author:'member'})]});
  expect((await run()).kind).toBe('r75_producer_unverified');
 });
 it('refuses unlinked MAIA-labelled SQL row even with plausible text',async()=>{
  query.mockResolvedValue({rows:[row({proposal_version_id:null,signature:null})]});
  expect((await run()).kind).toBe('r75_producer_unverified');
 });
 it('refuses missing, foreign or stale Work rows',async()=>{
  query.mockResolvedValueOnce({rows:[]});
  expect((await run()).kind).toBe('r75_producer_unverified');
  query.mockResolvedValueOnce({rows:[row({work_id:'66666666-6666-4666-8666-666666666666'})]});
  expect((await run()).kind).toBe('r75_producer_unverified');
 });
 it('refuses a forged returned model or altered proposal formulation',async()=>{
  query.mockResolvedValueOnce({rows:[row({served_model:'faked-provider-model'})]});
  expect((await run()).kind).toBe('r75_producer_unverified');
  query.mockResolvedValueOnce({rows:[row({formulation:'Another invention.'})]});
  expect((await run()).kind).toBe('r75_producer_unverified');
 });
 it('refuses consent epoch changed since model produced the proposal',async()=>{
  mockConsent.mockResolvedValue({
   consentSequence:scope.consentSequence+1,
   noticeSHA256:scope.policySHA256,
  });
  query.mockResolvedValue({rows:[row()]});
  expect((await run()).kind).toBe('r75_producer_unverified');
 });
 it('refuses withdrawn consent before reading any proposal data',async()=>{
  mockConsent.mockRejectedValue(new Error('CONSENT_WITHDRAWN'));
  expect((await run()).kind).toBe('r75_producer_unverified');
  expect(query).not.toHaveBeenCalled();
 });
 it('fails closed outside strictly fictional SQL environment',async()=>{
  delete process.env.R75_PG_SQL_READ_FIXTURE;
  expect((await run()).kind).toBe('r75_producer_unverified');
  expect(mockConsent).not.toHaveBeenCalled();
 });
});
