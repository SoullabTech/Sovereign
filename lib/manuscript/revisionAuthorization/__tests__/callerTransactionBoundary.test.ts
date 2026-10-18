/** Actual one-use executor under the verified member-consent DB transaction.
 * No external member, network, provider, or production SQL in this fixture. */
import { transaction } from '@/lib/db/postgres';
import { saveSectionInTransaction } from '@/lib/manuscript/sections/saveSection';
import { evaluateExecutionFit } from '../executionFit';
import { applyExactlyOnce } from '@/lib/manuscript/exactText';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';
import { hydrateAuthorizationRow } from '../store';
import { executeAuthorization, executeAuthorizationOnClient } from '../execute';
import { withLockedCurrentWriterConsentR1K } from '@/lib/writersStudio/release/serializedWriterBetaConsentR1K';
import type { TransactionClient } from '@/lib/db/postgres';

jest.mock('@/lib/db/postgres',()=>({transaction:jest.fn()}));
jest.mock('@/lib/manuscript/sections/saveSection',()=>({saveSectionInTransaction:jest.fn()}));
jest.mock('../executionFit',()=>({evaluateExecutionFit:jest.fn()}));
jest.mock('@/lib/manuscript/exactText',()=>({applyExactlyOnce:jest.fn()}));
jest.mock('@/lib/manuscript/sections/sectionProjection',()=>({splitStoredSection:jest.fn()}));
jest.mock('../store',()=>({AUTH_COLUMNS:'id, member_id, proposal_chain_id, proposal_version_id',hydrateAuthorizationRow:jest.fn()}));
const txRunner=transaction as jest.Mock;
const saver=saveSectionInTransaction as jest.Mock;
const fit=evaluateExecutionFit as jest.Mock;
const applied=applyExactlyOnce as jest.Mock;
const split=splitStoredSection as jest.Mock;
const hydrate=hydrateAuthorizationRow as jest.Mock;
const MEMBER='11111111-1111-4111-8111-111111111111';
const FOREIGN='22222222-2222-4222-8222-222222222222';
const AUTH='33333333-3333-4333-8333-333333333333';
const DRAFT='44444444-4444-4444-8444-444444444444';
const WORK='55555555-5555-4555-8555-555555555555';
const SECTION='66666666-6666-4666-8666-666666666666';
const POLICY={policyVersion:'fictional-author-consent',policySHA256:'a'.repeat(64)};
const permission={
 memberId:MEMBER,proposalVersionId:'version-a',proposalChainId:'chain-a',
 acceptedAt:null,resultingVersion:null,guard:{
  workId:WORK,draftId:DRAFT,targetSectionId:SECTION,baseVersion:7,
  expectedText:'fictional lantern',operation:'replace_exact_text',
 },
};
const calls:{sql:string;params:unknown[]}[]=[];
let authExists=true, currentConsent=true, throwReceipt=false, throwRecovery=false;
const client:TransactionClient={query:async(sql,params=[])=>{
 calls.push({sql,params});
 if(sql.includes('SELECT id FROM members WHERE id=$1 FOR UPDATE'))return {rows:[{id:MEMBER}]} as never;
 if(sql.includes('FROM writers_studio_beta_consent_events'))return {rows:[{
  seq:'7',decision:currentConsent?'accept':'revoke',
  policy_version:POLICY.policyVersion,policy_sha256:POLICY.policySHA256,
 }]} as never;
 if(sql.includes('FROM manuscript_revision_authorizations')&&sql.includes('FOR UPDATE'))return {rows:authExists?[{id:AUTH}]:[]} as never;
 if(sql.includes('SELECT formulation FROM proposal_versions'))return {rows:[{formulation:'fictional candle'}]} as never;
 if(sql.includes('SELECT id, version FROM manuscript_working_drafts'))return {rows:[{id:DRAFT,version:'7'}]} as never;
 if(sql.includes('FROM manuscript_draft_sections'))return {rows:[{id:SECTION,text:'Chapter\n\nfictional lantern',heading:'Chapter'}]} as never;
 if(sql.includes('UPDATE manuscript_revision_authorizations')){
  if(throwReceipt)throw Error('FICTIONAL_RECEIPT_SQL_FAILURE');
  return {rows:[{id:AUTH,accepted_at:new Date(),resulting_version:8}]} as never;
 }
 if(sql.includes('INSERT INTO manuscript_application_recovery')){
  if(throwRecovery)throw Error('FICTIONAL_RECOVERY_SQL_FAILURE');
  return {rows:[]} as never;
 }
 throw new Error('unexpected SQL in constrained fixture');
}};
beforeEach(()=>{
 calls.length=0;authExists=true;currentConsent=true;throwReceipt=false;throwRecovery=false;
 txRunner.mockReset();saver.mockReset();fit.mockReset();applied.mockReset();split.mockReset();hydrate.mockReset();
 txRunner.mockImplementation((cb:(tx:TransactionClient)=>unknown)=>cb(client));
 saver.mockResolvedValue({status:'saved',version:8});
 fit.mockReturnValue({fits:true});
 split.mockReturnValue({body:'fictional lantern',headingPrefix:'Chapter\n\n'});
 applied.mockReturnValue({ok:true,applied:'fictional candle'});
 hydrate.mockImplementation((row:{accepted_at?:Date})=>({
  ...permission,acceptedAt:row.accepted_at?row.accepted_at.toISOString():null,
  resultingVersion:row.resulting_version??null,
 }));
});
const sqls=()=>calls.map(x=>x.sql);

describe('Canonical executor shares the outer Writer consent transaction',()=>{
 test('original API retains one transaction and exact-authority-before-draft order',async()=>{
  const out=await executeAuthorization(MEMBER,AUTH);
  expect(out.outcome).toBe('executed');
  expect(txRunner).toHaveBeenCalledTimes(1);
  expect(saver).toHaveBeenCalledTimes(1);
  expect(sqls()[0]).toContain('FROM manuscript_revision_authorizations');
  expect(sqls()[0]).toContain('FOR UPDATE');
  expect(sqls()[1]).toContain('SELECT formulation FROM proposal_versions');
  expect(sqls()[2]).toContain('manuscript_working_drafts');
  expect(sqls()[3]).toContain('manuscript_draft_sections');
  expect(sqls()[4]).toContain('UPDATE manuscript_revision_authorizations');
  expect(sqls()[5]).toContain('INSERT INTO manuscript_application_recovery');
 });
 test('member consent row-lock, latest acceptance and manuscript mutation use exactly ONE DB transaction client',async()=>{
  const returned=await withLockedCurrentWriterConsentR1K(MEMBER,POLICY,tx=>executeAuthorizationOnClient(tx,MEMBER,AUTH));
  expect(returned).toMatchObject({kind:'executed_inside_consent_lock',releaseApproved:false,value:{outcome:'executed'}});
  expect(txRunner).toHaveBeenCalledTimes(1); // not nested
  expect(sqls()[0]).toContain('members WHERE id=$1 FOR UPDATE');
  expect(sqls()[1]).toContain('FROM writers_studio_beta_consent_events');
  expect(sqls()[2]).toContain('FROM manuscript_revision_authorizations');
  expect(sqls()[2]).toContain('FOR UPDATE');
  expect(saver).toHaveBeenCalledWith(client,WORK,MEMBER,SECTION,'fictional candle',7);
  expect(sqls().at(-1)).toContain('manuscript_application_recovery');
 });
 test('after revocation, no authorization or section read and zero manuscript writes',async()=>{
  currentConsent=false;
  const result=await withLockedCurrentWriterConsentR1K(MEMBER,POLICY,tx=>executeAuthorizationOnClient(tx,MEMBER,AUTH));
  expect(result).toMatchObject({kind:'refused',reason:'current_consent_not_verified'});
  expect(sqls()).toHaveLength(2);
  expect(saver).not.toHaveBeenCalled();
 });
 test('a foreign or unavailable authorizing row is rejected before reading proposal, draft or section',async()=>{
  authExists=false;
  const out=await executeAuthorizationOnClient(client,FOREIGN,AUTH);
  expect(out).toEqual({outcome:'refused',reason:'authorization_unknown'});
  expect(sqls()).toHaveLength(1);
  expect(calls[0].params).toEqual([AUTH,FOREIGN]);
  expect(saver).not.toHaveBeenCalled();
  expect(txRunner).not.toHaveBeenCalled();
 });
 test('reuse of an already-spent authorization is refused before reading the proposal',async()=>{
  hydrate.mockImplementationOnce(()=>({...permission,acceptedAt:new Date().toISOString(),resultingVersion:8}));
  const out=await executeAuthorizationOnClient(client,MEMBER,AUTH);
  expect(out).toEqual({outcome:'refused',reason:'already_spent'});
  expect(sqls()).toHaveLength(1);
  expect(saver).not.toHaveBeenCalled();
 });
 test('stale section fit is refused without write or authorization consumption',async()=>{
  fit.mockReturnValue({fits:false,reason:'stale_base'});
  const out=await executeAuthorizationOnClient(client,MEMBER,AUTH);
  expect(out).toEqual({outcome:'refused',reason:'stale_base'});
  expect(sqls().some(x=>x.includes('UPDATE manuscript_revision_authorizations'))).toBe(false);
  expect(saver).not.toHaveBeenCalled();
 });
 test('failed canonical section writer does not consume permission',async()=>{
  saver.mockResolvedValue({status:'refused',refusal:'stale_base'});
  const out=await executeAuthorizationOnClient(client,MEMBER,AUTH);
  expect(out).toEqual({outcome:'refused',reason:'write_refused'});
  expect(sqls().some(x=>x.includes('UPDATE manuscript_revision_authorizations'))).toBe(false);
 });
 test.each([['receipt',()=>{throwReceipt=true;}],['recovery',()=>{throwRecovery=true;}]] as const)
 ('%s durable failure propagates to the same outer transaction for rollback',async(_,setup)=>{
  setup();
  await expect(withLockedCurrentWriterConsentR1K(MEMBER,POLICY,tx=>executeAuthorizationOnClient(tx,MEMBER,AUTH)))
    .rejects.toThrow(/FICTIONAL_(RECEIPT|RECOVERY)_SQL_FAILURE/);
  expect(txRunner).toHaveBeenCalledTimes(1);
  expect(saver).toHaveBeenCalledTimes(1);
 });
});
