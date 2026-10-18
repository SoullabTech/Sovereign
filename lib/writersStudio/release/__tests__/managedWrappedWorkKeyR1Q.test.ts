/** R1Q server-only Work-key custody. Synthetic provider NEVER used in app. */
import {randomBytes,randomUUID} from 'node:crypto';
import {withLockedCurrentWriterConsentR1K} from '../serializedWriterBetaConsentR1K';
import {
  R1Q_OPERATIONAL_KMS_AND_MEMBER_KEY_RELEASED,
  resolveWrappedMemberWorkKeyR1Q,
  type ManagedWorkKeyUnwrapperR1Q,
} from '../managedWrappedWorkKeyR1Q';

jest.mock('../serializedWriterBetaConsentR1K',()=>({withLockedCurrentWriterConsentR1K:jest.fn()}));
const locked=withLockedCurrentWriterConsentR1K as jest.Mock;
const MEMBER='11111111-1111-4111-8111-111111111111';
const WORK='22222222-2222-4222-8222-222222222222';
const POLICY={policyVersion:'r1q-fictional',policySHA256:'a'.repeat(64)};
const DIGEST='f'.repeat(64);
const KEY_ID='33333333-3333-4333-8333-333333333333';
const ROW={
 member_id:MEMBER,manuscript_id:WORK,key_epoch:'1',key_id:KEY_ID,
 provider:'external_managed_kms',provider_key_ref:'fictional-kms-key-reference',
 opaque_work_digest:DIGEST,wrapped_key:randomBytes(60),
};
let rows=[ROW],consentSeq=12,lookupCount=0;
let key:Buffer;
const tx={query:jest.fn(async (_sql:string,_params:unknown[])=>{
 lookupCount++;return {rows:rows.length?[{...rows[0]}]:[]};
})};
const derive=jest.fn(async()=>DIGEST);
const unwrap=jest.fn(async()=>key);
const provider=():ManagedWorkKeyUnwrapperR1Q=>({
 deriveOpaqueWorkDigest:derive,unwrap,
});
const call=()=>resolveWrappedMemberWorkKeyR1Q({memberId:MEMBER,manuscriptId:WORK,policy:POLICY,provider:provider()});
const envKeys=['WRITERS_STUDIO_RESTRICTED_BETA','WRITERS_STUDIO_BETA_MEMBER_IDS','MAIA_CABIN_MODE'] as const;
let prior:Record<string,string|undefined>={};
beforeAll(()=>{
 for(const k of envKeys)prior[k]=process.env[k];
 process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
 process.env.WRITERS_STUDIO_BETA_MEMBER_IDS=MEMBER;
 delete process.env.MAIA_CABIN_MODE;
});
afterAll(()=>{for(const k of envKeys){
 if(prior[k]===undefined)delete process.env[k];else process.env[k]=prior[k];
}});
beforeEach(()=>{
 key=randomBytes(32);rows=[{...ROW,wrapped_key:Buffer.from(ROW.wrapped_key)}];
 consentSeq=12;lookupCount=0;
 tx.query.mockClear();derive.mockClear();unwrap.mockReset();
 unwrap.mockImplementation(async()=>key);
 locked.mockReset();
 locked.mockImplementation(async(_id:string,_policy:unknown,fn:(db:typeof tx,c:unknown)=>Promise<unknown>)=>({
  kind:'executed_inside_consent_lock',releaseApproved:false,
  value:await fn(tx,{seq:consentSeq,decision:'accept',policyVersion:POLICY.policyVersion,
    policySHA256:POLICY.policySHA256}),
 }));
});

describe('R1Q wrapped data key is not an authorization grant',()=>{
 it('never releases operational KMS or an active Writer endpoint',()=>{
  expect(R1Q_OPERATIONAL_KMS_AND_MEMBER_KEY_RELEASED).toBe(false);
 });
 it('loads wrapped bytes twice under actual member consent and returns only a fresh 32-byte copy',async()=>{
  const result=await call();
  expect(result).toMatchObject({kind:'managed_exact_member_work_key',memberId:MEMBER,manuscriptId:WORK,
   workKey:{keyId:KEY_ID}});
  expect(result?.workKey.keyBytes).toEqual(key);
  expect(result?.workKey.keyBytes).not.toBe(key);
  expect(locked).toHaveBeenCalledTimes(2);
  expect(lookupCount).toBe(2);
  expect(tx.query.mock.calls[0][0]).toContain('JOIN member_manuscripts');
  expect(tx.query.mock.calls[0][0]).toContain('FROM ops_contacts');
  expect(tx.query.mock.calls[0][0]).toContain('living_work_expressions');
  expect(unwrap).toHaveBeenCalledTimes(1);
  const args=unwrap.mock.calls[0][0];
  expect(args.context).toEqual({service:'soullab-writers-beta',opaqueWorkDigest:DIGEST});
  expect(args.wrappedKey).toEqual(ROW.wrapped_key);
  expect(args.wrappedKey).not.toBe(ROW.wrapped_key);
  expect(JSON.stringify(args)).not.toContain(MEMBER);
  expect(JSON.stringify(args)).not.toContain(WORK);
  expect(JSON.stringify(args)).not.toContain('proposed');
 });
 it('requires explicit member allowlist and held beta switch',async()=>{
  for(const [flag,allowlist] of [['false',MEMBER],['true','*'],['true','']] as const){
   process.env.WRITERS_STUDIO_RESTRICTED_BETA=flag;
   process.env.WRITERS_STUDIO_BETA_MEMBER_IDS=allowlist;
   expect(await call()).toBeNull();
  }
  expect(locked).not.toHaveBeenCalled();expect(unwrap).not.toHaveBeenCalled();
  process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
  process.env.WRITERS_STUDIO_BETA_MEMBER_IDS=MEMBER;
 });
 it('refuses malformed member/work without reading SQL or contacting any provider',async()=>{
  for(const fake of ['not-a-work-id','0000','00000000-0000-0000-0000-000000000000']){
   const r=await resolveWrappedMemberWorkKeyR1Q({memberId:MEMBER,manuscriptId:fake,policy:POLICY,provider:provider()});
   expect(r).toBeNull();
  }
  expect(derive).not.toHaveBeenCalled();expect(locked).not.toHaveBeenCalled();
 });
 it('refuses a member with no wrapped Work record before external decrypt',async()=>{
  rows=[];
  expect(await call()).toBeNull();
  expect(locked).toHaveBeenCalledTimes(1);
  expect(unwrap).not.toHaveBeenCalled();
 });
 it('rejects mismatched opaque Work digest, key context and provider record',async()=>{
  for(const row of [
   {...ROW,opaque_work_digest:'0'.repeat(64)},
   {...ROW,key_id:'forged-key'},
   {...ROW,wrapped_key:Buffer.alloc(1)},
   {...ROW,provider:'browser_claim'},
   {...ROW,manuscript_id:'99999999-9999-4999-8999-999999999999'},
  ]){
   rows=[row as typeof ROW];
   expect(await call()).toBeNull();
  }
  expect(unwrap).not.toHaveBeenCalled();
 });
 it('invalid opaque provider digest never opens a consent transaction',async()=>{
  derive.mockResolvedValueOnce('unencrypted_member_id');
  expect(await call()).toBeNull();
  expect(locked).not.toHaveBeenCalled();expect(unwrap).not.toHaveBeenCalled();
 });
 it('refuses if latest consent was withdrawn during provider unwrap',async()=>{
  locked.mockImplementationOnce(async(_id:string,_p:unknown,fn:any)=>({
   kind:'executed_inside_consent_lock',releaseApproved:false,
   value:await fn(tx,{seq:12,decision:'accept',policyVersion:POLICY.policyVersion,policySHA256:POLICY.policySHA256}),
  })).mockResolvedValueOnce({kind:'refused',reason:'current_consent_not_verified',releaseApproved:false});
  expect(await call()).toBeNull();
  expect(unwrap).toHaveBeenCalledTimes(1);
  expect(locked).toHaveBeenCalledTimes(2);
 });
 it('refuses a revoked-then-reaccepted consent with different sequence',async()=>{
  let count=0;
  locked.mockImplementation(async(_id:string,_p:unknown,fn:any)=>({
   kind:'executed_inside_consent_lock',releaseApproved:false,
   value:await fn(tx,{seq:count++===0?12:14,decision:'accept',
     policyVersion:POLICY.policyVersion,policySHA256:POLICY.policySHA256}),
  }));
  expect(await call()).toBeNull();
  expect(unwrap).toHaveBeenCalledTimes(1);
 });
 it('refuses wrapped key rotation during KMS unwrap',async()=>{
  tx.query.mockImplementationOnce(async()=>({rows:[{...ROW}]}))
    .mockImplementationOnce(async()=>({rows:[{...ROW,key_epoch:'2',key_id:randomUUID()}]}));
  expect(await call()).toBeNull();
  expect(unwrap).toHaveBeenCalledTimes(1);
 });
 it('does not fall back to local/PHI env keys on remote KMS exception or malformed key bytes',async()=>{
  unwrap.mockRejectedValueOnce(new Error('FAKE_REMOTE_KMS_UNAVAILABLE'));
  expect(await call()).toBeNull();
  unwrap.mockResolvedValueOnce(Buffer.alloc(16));
  expect(await call()).toBeNull();
 });
 it('fails closed if database membership or current consent query is unavailable',async()=>{
  locked.mockRejectedValueOnce(new Error('FAKE_PRIVACY_DB_OFFLINE'));
  expect(await call()).toBeNull();
  expect(unwrap).not.toHaveBeenCalled();
 });
});
