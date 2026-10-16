import {NextRequest} from 'next/server';

jest.mock('@/lib/auth/getMemberFromRequest',()=>({
  getMemberIdFromRequest:jest.fn(),
}));
jest.mock('@/lib/writersStudio/betaAccessServer',()=>({
  writersStudioBetaAccess:jest.fn(),
}));
jest.mock('../heldEncryptedHistoryR21',()=>({
  appendHeldRevisionR21:jest.fn(),
  readHeldRevisionR21:jest.fn(),
}));

import {getMemberIdFromRequest} from '@/lib/auth/getMemberFromRequest';
import {writersStudioBetaAccess} from '@/lib/writersStudio/betaAccessServer';
import {
  appendHeldRevisionR21,readHeldRevisionR21,
} from '../heldEncryptedHistoryR21';
import {
  saveHeldWriterRevisionR22,reopenHeldWriterRevisionR22,
  R22_REAL_MEMBER_HISTORY_ENABLED,R22_REVIEW_PATH,
  type R22Scope,type R22FictionalCustodian,
} from '../reviewHeldHistoryServiceR22';

const verified=getMemberIdFromRequest as jest.MockedFunction<typeof getMemberIdFromRequest>;
const allow=writersStudioBetaAccess as jest.MockedFunction<typeof writersStudioBetaAccess>;
const append=appendHeldRevisionR21 as jest.MockedFunction<typeof appendHeldRevisionR21>;
const reopen=readHeldRevisionR21 as jest.MockedFunction<typeof readHeldRevisionR21>;
const MEMBER='11111111-1111-4111-8111-111111111111';
const FOREIGN='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-333333333333';
const KEYID='44444444-4444-4444-8444-444444444444';
const URL='https://soullab.life'+R22_REVIEW_PATH;
const envs=['R22_FICTIONAL_HISTORY_SERVICE',
 'R21_FICTIONAL_ENCRYPTED_HISTORY','WRITERS_STUDIO_RESTRICTED_BETA',
 'WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW'] as const;
const previous=Object.fromEntries(envs.map(n=>[n,process.env[n]]));
const records=[{field:'manuscript_working_drafts.content',recordId:WORK,
 value:Buffer.from('SYNTHETIC_R22_NeverRealText')}];
const saved={memberId:MEMBER,workId:WORK,generation:1,keyId:KEYID,
 cipherDigest:'a'.repeat(64),previousDigest:null,state:'fictional_held_only' as const};
const restored={manifest:saved,records};
const fakeKey={keyId:KEYID,keyBytes:Buffer.alloc(32,42)};
const fakeTrust={signed:{} as never,signer:{} as never,
 independent:{minimumGeneration:20}};
function request(method='POST',opts?:{origin?:string;host?:string;url?:string;
 claim?:string}):NextRequest{
 const headers:Record<string,string>={host:opts?.host||'soullab.life'};
 if(opts?.origin!==null)
  headers.origin=opts?.origin||'https://soullab.life';
 if(opts?.claim)headers['x-member-id']=opts.claim;
 return new NextRequest(opts?.url||URL,{method,headers});
}
function custodian(change?:Partial<R22Scope>):R22FictionalCustodian{
 return {authority:'fixture_only_not_external_key_authority',
   resolve:jest.fn(async(scope:R22Scope)=>({
     scope:{...scope,...change},
     key:fakeKey,trust:fakeTrust,
   }))};
}
const save=(req=request(),authority=custodian())=>
  saveHeldWriterRevisionR22({request:req,workId:WORK,generation:1,
    records,custodian:authority});
const read=(req=request('GET'),authority=custodian())=>
  reopenHeldWriterRevisionR22({request:req,workId:WORK,generation:1,
    custodian:authority});

beforeEach(()=>{
 jest.resetAllMocks();
 for(const n of envs)process.env[n]='true';
 process.env.R22_FICTIONAL_HISTORY_SERVICE='fictional-only';
 process.env.R21_FICTIONAL_ENCRYPTED_HISTORY='fictional-only';
 verified.mockResolvedValue(MEMBER);
 allow.mockResolvedValue({eligible:true,basis:'active_beta_tester'});
 append.mockResolvedValue(saved);
 reopen.mockResolvedValue(restored);
});
afterAll(()=>{
 for(const n of envs)if(previous[n]===undefined)delete process.env[n];
 else process.env[n]=previous[n];
});

describe('R22 verified request -> scoped fictive custodian -> encrypted history',()=>{
 it('has no real-member authoring enablement',()=>{
  expect(R22_REAL_MEMBER_HISTORY_ENABLED).toBe(false);
 });
 it('normal production runtime refuses without fictional opt-in',async()=>{
  delete process.env.R22_FICTIONAL_HISTORY_SERVICE;
  expect(await save()).toEqual({kind:'refused',status:404});
  expect(verified).not.toHaveBeenCalled();
 });
 it('requires previously qualified R21 fixture-only opt-in',async()=>{
  delete process.env.R21_FICTIONAL_ENCRYPTED_HISTORY;
  expect(await save()).toEqual({kind:'refused',status:404});
 });
 it('requires restricted beta and R17 reviewer flags',async()=>{
  delete process.env.WRITERS_STUDIO_RESTRICTED_BETA;
  expect(await save()).toEqual({kind:'refused',status:404});
  process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
  delete process.env.WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW;
  expect(await save()).toEqual({kind:'refused',status:404});
 });
 it('refuses wrong HTTP operation before any session resolution',async()=>{
  expect(await save(request('GET'))).toEqual({kind:'refused',status:405});
  expect(await read(request('POST'))).toEqual({kind:'refused',status:405});
  expect(verified).not.toHaveBeenCalled();
 });
 it('requires exact HTTPS main host and exact path',async()=>{
  expect(await save(request('POST',{host:'beta.soullab.life',
    url:'https://beta.soullab.life'+R22_REVIEW_PATH})))
    .toEqual({kind:'refused',status:403});
  expect(await save(request('POST',{url:'https://soullab.life/writers-studio'})))
    .toEqual({kind:'refused',status:404});
  expect(verified).not.toHaveBeenCalled();
 });
 it('refuses cross-origin browser writes before reading a session',async()=>{
  expect(await save(request('POST',{origin:'https://attacker.example'})))
    .toEqual({kind:'refused',status:403});
  expect(verified).not.toHaveBeenCalled();
 });
 it('a forged header does not create member session identity',async()=>{
  verified.mockResolvedValue(null);
  expect(await save(request('POST',{claim:FOREIGN})))
    .toEqual({kind:'refused',status:401});
  expect(allow).not.toHaveBeenCalled();
 });
 it('refuses noninvited member and founder-only witness',async()=>{
  allow.mockResolvedValueOnce({eligible:false,basis:'not_in_pilot'});
  expect(await save()).toEqual({kind:'refused',status:403});
  allow.mockResolvedValueOnce({eligible:true,basis:'founder_witness'});
  expect(await save()).toEqual({kind:'refused',status:403});
  expect(append).not.toHaveBeenCalled();
 });
 it('refuses unreviewed work identifiers before contacting custodian',async()=>{
  const auth=custodian();
  expect(await saveHeldWriterRevisionR22({request:request(),workId:'bad',
    generation:1,records,custodian:auth}))
    .toEqual({kind:'refused',status:400});
  expect(auth.resolve).not.toHaveBeenCalled();
 });
 it('refuses wrong generation or missing records',async()=>{
  expect(await saveHeldWriterRevisionR22({request:request(),workId:WORK,
    generation:0,records,custodian:custodian()}))
    .toEqual({kind:'refused',status:400});
  expect(await saveHeldWriterRevisionR22({request:request(),workId:WORK,
    generation:1,records:[],custodian:custodian()}))
    .toEqual({kind:'refused',status:400});
 });
 it('refuses a custodian not explicitly fictional-only',async()=>{
  const c={...custodian(),authority:'unreviewed_client_provider'} as never;
  expect(await save(request(),c)).toEqual({kind:'refused',status:503});
  expect(append).not.toHaveBeenCalled();
 });
 it('refuses a key grant scoped to the wrong member/work/generation/purpose',async()=>{
  for(const change of [
    {memberId:FOREIGN},{workId:FOREIGN},{generation:2},
    {purpose:'read' as const},
  ]){
    expect(await save(request(),custodian(change)))
      .toEqual({kind:'refused',status:503});
  }
  expect(append).not.toHaveBeenCalled();
 });
 it('refuses missing external-trust contract or custodian failure',async()=>{
  const absent=custodian();
  (absent.resolve as jest.Mock).mockResolvedValueOnce({
    scope:{memberId:MEMBER,workId:WORK,generation:1,purpose:'append'},
    key:fakeKey,trust:{...fakeTrust,signed:null},
  });
  expect(await save(request(),absent)).toEqual({kind:'refused',status:503});
  const crashed=custodian();
  (crashed.resolve as jest.Mock).mockRejectedValueOnce(Error('do not print real key'));
  expect(await save(request(),crashed)).toEqual({kind:'refused',status:503});
 });
 it('derives exact writer from session and only passes scoped author to R21 save',async()=>{
  const authority=custodian();
  expect(await save(request('POST',{claim:MEMBER}),authority))
    .toEqual({kind:'held_fixture_only',value:saved});
  expect(verified).toHaveBeenCalledTimes(1);
  expect(allow).toHaveBeenCalledWith(MEMBER);
  expect(authority.resolve).toHaveBeenCalledWith({
    memberId:MEMBER,workId:WORK,generation:1,purpose:'append',
  });
  expect(append).toHaveBeenCalledWith(expect.objectContaining({
    writer: {kind:'held_only',origin:'https://soullab.life',
      subject:{memberId:MEMBER,assertedBy:'server_verified_member_session'}},
    workId:WORK,generation:1,
  }));
 });
 it('uses exact same session owner for encrypted historic reopen',async()=>{
  const authority=custodian();
  expect(await read(request('GET'),authority))
    .toEqual({kind:'held_fixture_only',value:restored});
  expect(authority.resolve).toHaveBeenCalledWith({
    memberId:MEMBER,workId:WORK,generation:1,purpose:'read',
  });
  expect(reopen).toHaveBeenCalledWith(expect.objectContaining({
    writer:expect.objectContaining({subject:expect.objectContaining({memberId:MEMBER})}),
    workId:WORK,generation:1,
  }));
 });
 it('does not leak storage/provider error details to HTTP client',async()=>{
  append.mockRejectedValueOnce(Error('PRIVATE WRITER TEXT MUST NOT BE REFLECTED'));
  expect(await save()).toEqual({kind:'refused',status:503});
  reopen.mockRejectedValueOnce(Error('TEST KEY MATERIAL MUST NOT BE REFLECTED'));
  expect(await read()).toEqual({kind:'refused',status:503});
 });
});
