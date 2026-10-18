/** R1P HTTP contract, fictional data only. No database/key service/provider. */
import {randomBytes,randomUUID} from 'node:crypto';
import {NextRequest} from 'next/server';
import {
  R1P_REAL_MEMBER_PRIVATE_CANDIDATE_ROUTE_RELEASED,
  R1P_BOUND_ROUTE,
  handleVerifiedPrivateMemberCandidateR1P,
  type R1PTrustedRuntime,
} from '../verifiedMemberCandidateRequestR1P';
import {POST,GET,PATCH,PUT,DELETE} from '@/app/api/sovereign/writers-studio/private-member-candidates/route';

const M='11111111-1111-4111-8111-111111111111';
const W='22222222-2222-4222-8222-222222222222';
const LW='33333333-3333-4333-8333-333333333333';
const D='44444444-4444-4444-8444-444444444444';
const S='55555555-5555-4555-8555-555555555555';
const SESSION='r1p-fixture-session-only-not-a-real-bearer';
const O='https://beta.soullab.life';
const original='fictional lantern';
const replacement='fictional candle';
const policy={policyVersion:'fictional-policy',policySHA256:'b'.repeat(64)};
const workKey={keyId:randomUUID(),keyBytes:randomBytes(32)};
const body={kind:'stage_member_suggestion',manuscriptId:W,livingWorkId:LW,
  draftId:D,sectionId:S,baseVersion:7,
  selectedOriginal:original,replacementText:replacement};
const stage=jest.fn();const resolve=jest.fn();const getKey=jest.fn();
const actual=():R1PTrustedRuntime=>({
  stage:stage as unknown as R1PTrustedRuntime['stage'],
  resolveSession:resolve,getWorkKey:getKey,
  allowedOrigins:[O],policy,
});
function req(input:{origin?:string|null;cookie?:string|null;headers?:Record<string,string>;
 body?:unknown;method?:string;url?:string;json?:string}={}):NextRequest{
 const headers=new Headers({
  host:'beta.soullab.life',origin:O,'content-type':'application/json',
  'sec-fetch-site':'same-origin',
  ...(input.headers||{}),
 });
 if(input.origin===null)headers.delete('origin');
 else if(input.origin!==undefined)headers.set('origin',input.origin);
 if(input.cookie===null)headers.delete('cookie');
 else headers.set('cookie',`maia_session=${input.cookie===undefined?SESSION:input.cookie}`);
 const b=input.body===undefined?body:input.body;
 return new NextRequest(input.url||O+R1P_BOUND_ROUTE,{
  method:input.method||'POST',headers,
  body:input.json!==undefined?input.json:JSON.stringify(b),
 });
}
async function parsed(response:Response){
 return {status:response.status,body:await response.json(),
   cache:response.headers.get('cache-control'),vary:response.headers.get('vary')};
}
beforeEach(()=>{
 stage.mockReset();resolve.mockReset();getKey.mockReset();
 resolve.mockResolvedValue(M);
 getKey.mockResolvedValue({kind:'managed_exact_member_work_key',memberId:M,manuscriptId:W,workKey});
 stage.mockResolvedValue({kind:'encrypted_member_candidate_pending',candidateId:randomUUID(),
  author:'member',baseVersion:7,releaseApproved:false,canApply:false,canUndo:false});
});

describe('R1P real request boundary remains default-off',()=>{
 it('never ships a released HTTP stage route or unlocks R1O or the author edit',()=>{
  expect(R1P_REAL_MEMBER_PRIVATE_CANDIDATE_ROUTE_RELEASED).toBe(false);
 });
 it('POST to the actual Next route refuses before resolving credentials, keys, content or SQL',async()=>{
  const out=await parsed(await POST(req()));
  expect(out).toMatchObject({status:404,body:{kind:'not_released',releaseApproved:false,canApply:false,canUndo:false}});
  expect(out.cache).toContain('no-store');
  expect(resolve).not.toHaveBeenCalled();expect(getKey).not.toHaveBeenCalled();expect(stage).not.toHaveBeenCalled();
 });
 it('all other public route methods stay undiscoverable and nonmutating',async()=>{
  for(const handler of [GET,PUT,PATCH,DELETE]){
   const result=await handler();expect(result.status).toBe(404);
   expect(result.headers.get('cache-control')).toContain('no-store');
  }
  expect(resolve).not.toHaveBeenCalled();expect(stage).not.toHaveBeenCalled();
 });
});

describe('R1P nonpublic trusted server adapter',()=>{
 it('accepts one exact fictional authenticated-origin member-authored intent with key scoped by server',async()=>{
  const out=await parsed(await handleVerifiedPrivateMemberCandidateR1P(req(),actual()));
  expect(out.status).toBe(201);
  expect(out.body).toMatchObject({kind:'encrypted_member_candidate_pending',author:'member',
   baseVersion:7,releaseApproved:false,canApply:false,canUndo:false});
  expect(out.cache).toContain('no-store');
  expect(out.vary).toContain('Origin');
  expect(JSON.stringify(out.body)).not.toContain(original);
  expect(JSON.stringify(out.body)).not.toContain(replacement);
  expect(JSON.stringify(out.body)).not.toContain('keyBytes');
  expect(resolve).toHaveBeenCalledWith(SESSION);
  expect(getKey).toHaveBeenCalledWith(M,W);
  expect(stage).toHaveBeenCalledTimes(1);
  const input=stage.mock.calls[0][0];
  expect(input).toEqual({scope:{memberId:M,manuscriptId:W,livingWorkId:LW,
    draftId:D,sectionId:S,baseVersion:7},
   policy,author:'member',selectedOriginal:original,replacementText:replacement,workKey});
 });
 it.each([null,'null','https://foreign.invalid','http://beta.soullab.life','https://soullab.life','https://beta.soullab.life.evil.invalid'])
 ('refuses mismatched/absent/non-HTTPS Origin %s before auth',async origin=>{
  const result=await parsed(await handleVerifiedPrivateMemberCandidateR1P(req({origin}),actual()));
  expect(result.status).toBe(403);expect(resolve).not.toHaveBeenCalled();
  expect(stage).not.toHaveBeenCalled();
 });
 it.each(['cross-site','same-site'])('rejects Fetch-Metadata %s before touching writer SQL',async site=>{
  const result=await parsed(await handleVerifiedPrivateMemberCandidateR1P(req({headers:{'sec-fetch-site':site}}),actual()));
  expect(result.status).toBe(403);expect(stage).not.toHaveBeenCalled();
 });
 it('rejects spoofed host, Forwarded host and search parameters',async()=>{
  for(const changes of [
   {headers:{host:'localhost'}},
   {headers:{'x-forwarded-host':'other.invalid'}},
   {url:O+R1P_BOUND_ROUTE+'?memberId='+M},
  ]){
   expect((await handleVerifiedPrivateMemberCandidateR1P(req(changes),actual())).status).toBe(403);
  }
  expect(resolve).not.toHaveBeenCalled();
 });
 it('requires JSON content type and session credential (no bare member claim)',async()=>{
  expect((await handleVerifiedPrivateMemberCandidateR1P(req({headers:{'content-type':'text/plain'}}),actual())).status).toBe(415);
  const noSession=req({cookie:null,headers:{'x-member-id':M}});
  const noAuth=await parsed(await handleVerifiedPrivateMemberCandidateR1P(noSession,actual()));
  expect(noAuth.status).toBe(401);
  expect(resolve).not.toHaveBeenCalled();expect(stage).not.toHaveBeenCalled();
 });
 it('refuses conflicting cookie and bearer token without choosing either',async()=>{
  const res=await handleVerifiedPrivateMemberCandidateR1P(req({headers:{'x-session-token':'other-session'}}),actual());
  expect(res.status).toBe(403);expect(resolve).not.toHaveBeenCalled();
 });
 it('rejects expired credentials, mistaken identity and a conflicting member assertion',async()=>{
  resolve.mockResolvedValue(null);
  expect((await handleVerifiedPrivateMemberCandidateR1P(req(),actual())).status).toBe(401);
  resolve.mockResolvedValue(M);
  expect((await handleVerifiedPrivateMemberCandidateR1P(req({headers:{'x-member-id':'99999999-9999-4999-8999-999999999999'}}),actual())).status).toBe(403);
  expect(stage).not.toHaveBeenCalled();
 });
 it('allows legacy matching x-member-id only as corroboration, not authentication',async()=>{
  const res=await handleVerifiedPrivateMemberCandidateR1P(req({headers:{'x-member-id':M}}),actual());
  expect(res.status).toBe(201);
  expect(resolve).toHaveBeenCalledTimes(1);
 });
 it.each([{model:'claude'},{servedProvider:'anthropic'},{workKey:'browser-controlled'},{memberId:M},{author:'maia'},{canApply:true},{opaqueToken:'attempt'},{origin:'https://foreign.invalid'}])
 ('refuses additional privileged browser field %#',async(field)=>{
  const res=await parsed(await handleVerifiedPrivateMemberCandidateR1P(req({body:{...body,...field}}),actual()));
  expect(res.status).toBe(400);expect(res.body.kind).toBe('untrusted_author_action');
  expect(getKey).not.toHaveBeenCalled();expect(stage).not.toHaveBeenCalled();
 });
 it('refuses malformed version, invalid UUID and unpaired Unicode without touching Work',async()=>{
  for(const change of [{baseVersion:0},{baseVersion:'7'}, {draftId:'not-a-uuid'}, {replacementText:'\ud800'}]){
   expect((await handleVerifiedPrivateMemberCandidateR1P(req({body:{...body,...change}}),actual())).status).toBe(400);
  }
  expect(getKey).not.toHaveBeenCalled();expect(stage).not.toHaveBeenCalled();
 });
 it('refuses missing managed keys, foreign Work key grants and wrong key length',async()=>{
  for(const grant of [null,{kind:'managed_exact_member_work_key',memberId:M,manuscriptId:'other',workKey},
   {kind:'managed_exact_member_work_key',memberId:M,manuscriptId:W,workKey:{keyId:randomUUID(),keyBytes:Buffer.alloc(10)}},
   {kind:'unverified_browser_key',memberId:M,manuscriptId:W,workKey}]){
   getKey.mockResolvedValueOnce(grant);
   const result=await parsed(await handleVerifiedPrivateMemberCandidateR1P(req(),actual()));
   expect(result.status).toBe(503);
   expect(result.body).toMatchObject({releaseApproved:false,canApply:false,canUndo:false});
  }
  expect(stage).not.toHaveBeenCalled();
 });
 it('blocks when policy absent, session query fails, key resolver fails or SQL fails',async()=>{
  expect((await handleVerifiedPrivateMemberCandidateR1P(req(),{...actual(),policy:null})).status).toBe(503);
  resolve.mockRejectedValueOnce(Error('FICTIONAL_SESSION_DB_DOWN'));
  expect((await handleVerifiedPrivateMemberCandidateR1P(req(),actual())).status).toBe(503);
  getKey.mockRejectedValueOnce(Error('FICTIONAL_KMS_DOWN'));
  expect((await handleVerifiedPrivateMemberCandidateR1P(req(),actual())).status).toBe(503);
  stage.mockRejectedValueOnce(Error('FICTIONAL_ENCRYPTED_SQL_FAILED'));
  const out=await parsed(await handleVerifiedPrivateMemberCandidateR1P(req(),actual()));
  expect(out.status).toBe(503);expect(JSON.stringify(out.body)).not.toContain('FICTIONAL');
 });
 it('supports Safari bearer session without ambient cookies or member ID claims',async()=>{
  const response=await handleVerifiedPrivateMemberCandidateR1P(req({cookie:null,
    headers:{'x-session-token':SESSION}}),actual());
  expect(response.status).toBe(201);
  expect(resolve).toHaveBeenCalledWith(SESSION);
  expect(stage).toHaveBeenCalledTimes(1);
 });
 it('refuses an omitted/forged Content-Length before parsing or managed key lookup',async()=>{
  const request=req({headers:{'content-length':'999999'},json:'{}'});
  expect((await handleVerifiedPrivateMemberCandidateR1P(request,actual())).status).toBe(413);
  expect(getKey).not.toHaveBeenCalled();
 });
 it('stops a streamed oversized JSON body at 8192 bytes without content-length',async()=>{
  const encoder=new TextEncoder();
  const stream=new ReadableStream<Uint8Array>({
    start(controller){
      controller.enqueue(encoder.encode('{"replacementText":"'));
      controller.enqueue(encoder.encode('x'.repeat(9000)));
      controller.close();
    },
  });
  const request=new NextRequest(O+R1P_BOUND_ROUTE,{
    method:'POST',headers:{host:'beta.soullab.life',origin:O,
      'content-type':'application/json','sec-fetch-site':'same-origin',
      cookie:'maia_session='+SESSION},body:stream,duplex:'half',
  } as RequestInit);
  expect(request.headers.get('content-length')).toBeNull();
  expect((await handleVerifiedPrivateMemberCandidateR1P(request,actual())).status).toBe(413);
  expect(getKey).not.toHaveBeenCalled();expect(stage).not.toHaveBeenCalled();
 });
 it('refuses invalid UTF-8 and never stages plaintext on decode error',async()=>{
  const stream=new ReadableStream<Uint8Array>({
    start(controller){controller.enqueue(Uint8Array.of(0xc0,0xaf));controller.close();},
  });
  const request=new NextRequest(O+R1P_BOUND_ROUTE,{
    method:'POST',headers:{host:'beta.soullab.life',origin:O,
      'content-type':'application/json','sec-fetch-site':'same-origin',
      cookie:'maia_session='+SESSION},body:stream,duplex:'half',
  } as RequestInit);
  expect((await handleVerifiedPrivateMemberCandidateR1P(request,actual())).status).toBe(400);
  expect(stage).not.toHaveBeenCalled();
 });
 it('refuses stale/conflicted private proposal without granting Apply/Undo',async()=>{
  stage.mockResolvedValueOnce({kind:'refused',reason:'work_not_current',releaseApproved:false,canApply:false,canUndo:false});
  const out=await parsed(await handleVerifiedPrivateMemberCandidateR1P(req(),actual()));
  expect(out.status).toBe(409);
  expect(out.body).toMatchObject({canApply:false,canUndo:false,releaseApproved:false});
 });
 it('rejects wrong method/path, no mutation on GET-shaped request',async()=>{
  const odd=new NextRequest(O+R1P_BOUND_ROUTE,{method:'GET',headers:{host:'beta.soullab.life',origin:O}});
  expect((await handleVerifiedPrivateMemberCandidateR1P(odd,actual())).status).toBe(405);
  expect(resolve).not.toHaveBeenCalled();expect(stage).not.toHaveBeenCalled();
 });
});
