import { NextRequest } from 'next/server';
jest.mock('@/lib/auth/getMemberFromRequest',()=>({getMemberIdFromRequest:jest.fn()}));
jest.mock('@/lib/writersStudio/betaAccessServer',()=>({writersStudioBetaAccess:jest.fn()}));
jest.mock('../heldVaultHistoryR23',()=>({
  persistHeldHistoryR23:jest.fn(),
  readHeldHistoryR23:jest.fn(),
}));
import {getMemberIdFromRequest} from '@/lib/auth/getMemberFromRequest';
import {writersStudioBetaAccess} from '@/lib/writersStudio/betaAccessServer';
import {persistHeldHistoryR23,readHeldHistoryR23} from '../heldVaultHistoryR23';
import {
  saveHeldWriterRevisionR23,reopenHeldWriterRevisionR23,
  R23_REAL_MEMBER_VAULT_ENABLED,R23_REVIEW_PATH,
  type R23Scope,type R23FictionalCustodian,
} from '../reviewVaultHistoryServiceR23';

const auth=getMemberIdFromRequest as jest.MockedFunction<typeof getMemberIdFromRequest>;
const admit=writersStudioBetaAccess as jest.MockedFunction<typeof writersStudioBetaAccess>;
const save=persistHeldHistoryR23 as jest.MockedFunction<typeof persistHeldHistoryR23>;
const open=readHeldHistoryR23 as jest.MockedFunction<typeof readHeldHistoryR23>;
const MEMBER='11111111-1111-4111-8111-111111111111';
const FOREIGN='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-333333333333';
const KEY='44444444-4444-4444-8444-444444444444';
const URL='https://soullab.life'+R23_REVIEW_PATH;
const CONFIG=['WRITERS_STUDIO_RESTRICTED_BETA','WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW',
 'R23_VAULT_HISTORY_FIXTURE','R23_VAULT_SERVICE_FIXTURE'] as const;
const original=Object.fromEntries(CONFIG.map(x=>[x,process.env[x]]));
const key={keyId:KEY,keyBytes:Buffer.alloc(32,4)};
const trust={signed:{} as never,signer:{} as never,independent:{minimumGeneration:1}};
const manifest={id:WORK,memberId:MEMBER,manuscriptId:WORK,generation:1,keyId:KEY,
 cipherRef:'ws-beta-r23-held-history/'+WORK+'.enc',cipherSHA256:'a'.repeat(64),
 previousSHA256:null,state:'held_only' as const};
const rows=[{field:'manuscript_working_drafts.content',recordId:WORK,value:Buffer.from('fictional-vault-author-text')}];
function req(method='POST',opts?:{url?:string;origin?:string;host?:string;claim?:string}){
 const headers:Record<string,string>={host:opts?.host||'soullab.life'};
 if(method==='POST')headers.origin=opts?.origin||'https://soullab.life';
 if(opts?.claim)headers['x-member-id']=opts.claim;
 return new NextRequest(opts?.url||URL,{method,headers});
}
function custodian(change?:Partial<R23Scope>):R23FictionalCustodian{
 return {authority:'fixture_only_not_external_key_authority',
 resolve:jest.fn(async(scope:R23Scope)=>({scope:{...scope,...change},
  key,trust}))};
}
const append=(r=req(),c=custodian())=>
 saveHeldWriterRevisionR23({request:r,workId:WORK,generation:1,records:rows,custodian:c});
const read=(r=req('GET'),c=custodian())=>
 reopenHeldWriterRevisionR23({request:r,workId:WORK,generation:1,custodian:c});
beforeEach(()=>{
 jest.resetAllMocks();for(const x of CONFIG)process.env[x]='true';
 process.env.R23_VAULT_HISTORY_FIXTURE='fictional-only';
 process.env.R23_VAULT_SERVICE_FIXTURE='fictional-only';
 auth.mockResolvedValue(MEMBER);
 admit.mockResolvedValue({eligible:true,basis:'active_beta_tester'});
 save.mockResolvedValue(manifest);
 open.mockResolvedValue({manifest,records:rows});
});
afterAll(()=>{for(const x of CONFIG)
 if(original[x]===undefined)delete process.env[x];else process.env[x]=original[x]});

describe('R23 canonical encrypted-vault history session bridge',()=>{
 it('never activates real writer storage',()=>expect(R23_REAL_MEMBER_VAULT_ENABLED).toBe(false));
 it('refuses when either fixture-only switch absent',async()=>{
  delete process.env.R23_VAULT_SERVICE_FIXTURE;
  expect(await append()).toEqual({kind:'refused',status:404});
  process.env.R23_VAULT_SERVICE_FIXTURE='fictional-only';
  delete process.env.R23_VAULT_HISTORY_FIXTURE;
  expect(await append()).toEqual({kind:'refused',status:404});
  expect(auth).not.toHaveBeenCalled();
 });
 it('fails closed without restricted beta or R17 verified-session gate',async()=>{
  delete process.env.WRITERS_STUDIO_RESTRICTED_BETA;
  expect(await append()).toEqual({kind:'refused',status:404});
  process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
  delete process.env.WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW;
  expect(await append()).toEqual({kind:'refused',status:404});
 });
 it('rejects wrong host, origin and method before any key access',async()=>{
  expect(await append(req('POST',{host:'beta.soullab.life',
   url:'https://beta.soullab.life'+R23_REVIEW_PATH}))).toEqual({kind:'refused',status:403});
  expect(await append(req('POST',{origin:'https://attacker.invalid'}))).toEqual({kind:'refused',status:403});
  expect(await append(req('GET'))).toEqual({kind:'refused',status:405});
  expect(auth).not.toHaveBeenCalled();
 });
 it('rejects missing session even if user supplies member ID header',async()=>{
  auth.mockResolvedValue(null);
  expect(await append(req('POST',{claim:MEMBER}))).toEqual({kind:'refused',status:401});
  expect(save).not.toHaveBeenCalled();
 });
 it('rejects noninvited or founder-only witness access',async()=>{
  admit.mockResolvedValueOnce({eligible:false,basis:'not_in_pilot'});
  expect(await append()).toEqual({kind:'refused',status:403});
  admit.mockResolvedValueOnce({eligible:true,basis:'founder_witness'});
  expect(await append()).toEqual({kind:'refused',status:403});
  expect(save).not.toHaveBeenCalled();
 });
 it('rejects invalid work or absent records',async()=>{
  expect(await saveHeldWriterRevisionR23({request:req(),workId:'bad',
   generation:1,records:rows,custodian:custodian()})).toEqual({kind:'refused',status:400});
  expect(await saveHeldWriterRevisionR23({request:req(),workId:WORK,
   generation:1,records:[],custodian:custodian()})).toEqual({kind:'refused',status:400});
 });
 it('rejects key authority mismatched to member, work, version or purpose',async()=>{
  for(const wrong of [{memberId:FOREIGN},{workId:FOREIGN},{generation:2},
   {purpose:'read' as const}]){
   expect(await append(req(),custodian(wrong))).toEqual({kind:'refused',status:503});
  }
  expect(save).not.toHaveBeenCalled();
 });
 it('refuses missing independent checkpoint authority',async()=>{
  const c=custodian();
  (c.resolve as jest.Mock).mockResolvedValueOnce({
   scope:{memberId:MEMBER,workId:WORK,generation:1,purpose:'append'},
   key,trust:{...trust,independent:null},
  });
  expect(await append(req(),c)).toEqual({kind:'refused',status:503});
 });
 it('binds member only from verified session into vault save and read',async()=>{
  const c=custodian();
  expect(await append(req(),c)).toEqual({kind:'held_fixture_only',value:manifest});
  expect(auth).toHaveBeenCalledTimes(1);
  expect(admit).toHaveBeenCalledWith(MEMBER);
  expect(c.resolve).toHaveBeenCalledWith({
   memberId:MEMBER,workId:WORK,generation:1,purpose:'append',
  });
  expect(save).toHaveBeenCalledWith({
   subject:{memberId:MEMBER,assertedBy:'server_verified_member_session'},
   manuscriptId:WORK,generation:1,records:rows,
   authority:{key,signedDeletion:trust.signed,
    trustedSigner:trust.signer,independent:trust.independent},
  });
  expect(await read(req('GET'),c)).toEqual({kind:'held_fixture_only',value:{manifest,records:rows}});
  expect(open).toHaveBeenCalledWith(expect.objectContaining({
    subject:{memberId:MEMBER,assertedBy:'server_verified_member_session'},
    manuscriptId:WORK,
  }));
 });
 it('does not return provider, SQL or custody errors to caller',async()=>{
  save.mockRejectedValueOnce(new Error('SECRET MANUSCRIPT SENTINEL'));
  expect(await append()).toEqual({kind:'refused',status:503});
  open.mockRejectedValueOnce(new Error('SECRET KEY MATERIAL'));
  expect(await read()).toEqual({kind:'refused',status:503});
 });
});
