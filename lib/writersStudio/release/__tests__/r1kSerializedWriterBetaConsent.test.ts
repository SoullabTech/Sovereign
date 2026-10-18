/** Real production consent transaction source; only member data is synthetic. */
import { transaction } from '@/lib/db/postgres';
import {
  R1K_REAL_PROTECTED_EDITORIAL_RELEASED,
  recordWriterBetaConsentDecisionR1K,
  withLockedCurrentWriterConsentR1K,
} from '../serializedWriterBetaConsentR1K';

jest.mock('@/lib/db/postgres',()=>({transaction:jest.fn()}));
const transact=transaction as jest.Mock;
const query=jest.fn();
const MEMBER='11111111-1111-4111-8111-111111111111';
const POLICY={policyVersion:'fictional-policy-1',policySHA256:'c'.repeat(64)};
const mockLatest=(decision='accept',version=POLICY.policyVersion,sha=POLICY.policySHA256)=>
  ({rows:[{seq:'7',decision,policy_version:version,policy_sha256:sha}]});
const defaultRows=(sql:string)=>{
  if(sql.includes('FROM members WHERE id=$1 FOR UPDATE'))return {rows:[{id:MEMBER}]};
  if(sql.includes('SELECT seq,decision,policy_version,policy_sha256'))return mockLatest();
  return {rows:[],rowCount:1};
};
beforeEach(()=>{
  query.mockReset();transact.mockReset();
  query.mockImplementation(async(sql:string)=>defaultRows(sql));
  transact.mockImplementation(async(fn:(client:unknown)=>Promise<unknown>)=>fn({query:(...args:unknown[])=>query(...args)}));
});

describe('R1K actual Writer beta consent serialization',()=>{
 it('never releases an editorial operation through a compile-time switch',()=>{
  expect(R1K_REAL_PROTECTED_EDITORIAL_RELEASED).toBe(false);
 });
 it('validates source/member/notice before opening a transaction',async()=>{
  expect(await recordWriterBetaConsentDecisionR1K({verifiedMemberId:'forged',decision:'accept',approvedPolicy:POLICY}))
    .toMatchObject({kind:'member_unavailable'});
  expect(await recordWriterBetaConsentDecisionR1K({verifiedMemberId:MEMBER,decision:'accept',approvedPolicy:null}))
    .toMatchObject({kind:'member_unavailable'});
  expect(transact).not.toHaveBeenCalled();
 });
 it('real accept locks member FIRST, then appends self-actor consent; no author content',async()=>{
  const r=await recordWriterBetaConsentDecisionR1K({verifiedMemberId:MEMBER,decision:'accept',approvedPolicy:POLICY});
  expect(r).toEqual({kind:'recorded',decision:'accept'});
  expect(transact).toHaveBeenCalledTimes(1);
  expect(query).toHaveBeenCalledTimes(2);
  expect(query.mock.calls[0]).toEqual(['SELECT id FROM members WHERE id=$1 FOR UPDATE',[MEMBER]]);
  expect(query.mock.calls[1][0]).toContain('INSERT INTO writers_studio_beta_consent_events');
  expect(query.mock.calls[1][1]).toEqual([MEMBER,'accept',POLICY.policyVersion,POLICY.policySHA256]);
 });
 it('withdraws latest exact prior version, independent of current configured notice',async()=>{
  query.mockImplementation(async(sql:string)=>sql.includes('SELECT seq,decision,policy_version,policy_sha256')
    ? mockLatest('accept','prior-policy','b'.repeat(64)):defaultRows(sql));
  const r=await recordWriterBetaConsentDecisionR1K({verifiedMemberId:MEMBER,decision:'revoke'});
  expect(r).toEqual({kind:'recorded',decision:'revoke'});
  expect(query).toHaveBeenCalledTimes(3);
  expect(query.mock.calls[0][0]).toContain('FOR UPDATE');
  expect(query.mock.calls[1][0]).toContain('ORDER BY seq DESC LIMIT 1');
  expect(query.mock.calls[2][1]).toEqual([MEMBER,'revoke','prior-policy','b'.repeat(64)]);
 });
 it('duplicate withdrawal is idempotent and does not append another revoke',async()=>{
  query.mockImplementation(async(sql:string)=>sql.includes('SELECT seq,decision,policy_version,policy_sha256')
    ? mockLatest('revoke'):defaultRows(sql));
  expect(await recordWriterBetaConsentDecisionR1K({verifiedMemberId:MEMBER,decision:'revoke'}))
    .toEqual({kind:'already_revoked'});
  expect(query).toHaveBeenCalledTimes(2);
 });
 it('a member without any prior consent cannot revoke or be credited as consenting',async()=>{
  query.mockImplementation(async(sql:string)=>sql.includes('SELECT seq,decision,policy_version,policy_sha256')
    ? {rows:[]}:defaultRows(sql));
  expect(await recordWriterBetaConsentDecisionR1K({verifiedMemberId:MEMBER,decision:'revoke'}))
    .toEqual({kind:'no_prior_consent'});
  expect(query).toHaveBeenCalledTimes(2);
 });
 it('a missing member row cannot create consent or enter a protected edit',async()=>{
  query.mockImplementation(async(sql:string)=>sql.includes('FOR UPDATE')?{rows:[]}:defaultRows(sql));
  expect(await recordWriterBetaConsentDecisionR1K({verifiedMemberId:MEMBER,decision:'accept',approvedPolicy:POLICY}))
    .toEqual({kind:'member_unavailable'});
  const edit=jest.fn();
  expect(await withLockedCurrentWriterConsentR1K(MEMBER,POLICY,edit))
    .toMatchObject({kind:'refused',reason:'member_unavailable',releaseApproved:false});
  expect(edit).not.toHaveBeenCalled();
 });
 it('approved callback executes only AFTER row lock + latest exact consent',async()=>{
  const writer=jest.fn(async(tx:any,consent:any)=>{
    expect(consent).toMatchObject({seq:7,decision:'accept',policyVersion:POLICY.policyVersion});
    await tx.query('SELECT 77',[]);
    return {status:'fictional_guarded_callback_complete'};
  });
  const r=await withLockedCurrentWriterConsentR1K(MEMBER,POLICY,writer);
  expect(r).toEqual({kind:'executed_inside_consent_lock',value:{status:'fictional_guarded_callback_complete'},releaseApproved:false});
  expect(writer).toHaveBeenCalledTimes(1);
  expect(query.mock.calls.map(c=>c[0])).toEqual([
    'SELECT id FROM members WHERE id=$1 FOR UPDATE',expect.stringContaining('ORDER BY seq DESC LIMIT 1'),'SELECT 77',
  ]);
 });
 it.each(['revoke','different'] as const)('blocks a current edit on %s consent without invoking callback',async mode=>{
  query.mockImplementation(async(sql:string)=>sql.includes('SELECT seq,decision,policy_version,policy_sha256')
    ? (mode==='revoke'?mockLatest('revoke'):mockLatest('accept','older-policy')):defaultRows(sql));
  const action=jest.fn();
  const out=await withLockedCurrentWriterConsentR1K(MEMBER,POLICY,action);
  expect(out).toEqual({kind:'refused',reason:'current_consent_not_verified',releaseApproved:false});
  expect(action).not.toHaveBeenCalled();
 });
 it('missing/wrong consent policy fails before opening a transaction',async()=>{
  const action=jest.fn();
  const out=await withLockedCurrentWriterConsentR1K(MEMBER,{policyVersion:'invalid!',policySHA256:'b'.repeat(64)},action);
  expect(out).toMatchObject({kind:'refused',releaseApproved:false});
  expect(transact).not.toHaveBeenCalled();
  expect(action).not.toHaveBeenCalled();
 });
 it('throws on unreadable consent record without interpreting it as grant',async()=>{
  query.mockImplementation(async(sql:string)=>sql.includes('SELECT seq,decision,policy_version,policy_sha256')
    ? {rows:[{seq:'invalid',decision:'accept',policy_version:POLICY.policyVersion,policy_sha256:POLICY.policySHA256}]}:defaultRows(sql));
  const action=jest.fn();
  await expect(withLockedCurrentWriterConsentR1K(MEMBER,POLICY,action))
    .rejects.toThrow('WRITER_BETA_CONSENT_RECORD_UNVERIFIABLE');
  expect(action).not.toHaveBeenCalled();
 });
});
