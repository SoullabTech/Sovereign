import {NextRequest} from 'next/server';
import {getMemberIdFromRequest} from '@/lib/auth/getMemberFromRequest';
import {query} from '@/lib/db/postgres';
import {TurnsStore} from '@/lib/memory/stores/TurnsStore';
import {GET,POST} from '../route';
import {isR4fProtectedSessionById} from '@/lib/maia/astrologyConsent/r4fGrantStore';
const protectedCheck=isR4fProtectedSessionById as jest.Mock;

jest.mock('@/lib/auth/getMemberFromRequest',()=>({getMemberIdFromRequest:jest.fn()}));
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
jest.mock('@/lib/memory/stores/TurnsStore',()=>({TurnsStore:{addAuditedExchange:jest.fn()},ExchangeIdentityConflict:class ExchangeIdentityConflict extends Error {}}));
jest.mock('@/lib/sovereign/memberSessionOwnership',()=>{
 const actual=jest.requireActual<any>('@/lib/sovereign/memberSessionOwnership');
 return {...actual,requireExistingOwnedSession:jest.fn(async()=>undefined)};
});
jest.mock('@/lib/maia/astrologyConsent/r4fGrantStore',()=>({isR4fProtectedSessionById:jest.fn()}));

const who=getMemberIdFromRequest as jest.Mock;
const db=query as jest.Mock;
const save=TurnsStore.addAuditedExchange as jest.Mock;
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const ordinary='fiction-ordinary-A';
const protectedId='fiction-chart-once-A';

const get=(sessionId?:string)=>new NextRequest(
 'http://localhost/api/conversation/turns?userId='+A+(sessionId?'&sessionId='+sessionId:'')
);
const post=(sessionId:string)=>new NextRequest('http://localhost/api/conversation/turns',{
 method:'POST',headers:{'content-type':'application/json'},
 body:JSON.stringify({
  userId:A,sessionId,userMessage:'FICTION_TEST_ONLY_ORDINARY_A',
  assistantMessage:'FICTION_TEST_ONLY_MAIA',exchangeId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 }),
});
function dbTruth(sql:string):{rows:unknown[]} {
 if(sql.includes('AS protected WHERE protected.session_id')){
   return {rows:sql.includes('UNUSED_DUMMY')?[{present:1}]:[]};
 }
 if(sql.includes('FROM conversation_turns'))
   return {rows:[{content:'FICTION_ORDINARY_A',role:'user'}]};
 return {rows:[]};
}
describe('R5h integration: authenticated consent audited turns and R4F chart-source exclusion',()=>{
 beforeEach(()=>{
  jest.resetAllMocks();
  who.mockResolvedValue(A);
  save.mockResolvedValue(undefined);
  db.mockImplementation((sql:string)=>dbTruth(sql));
  protectedCheck.mockResolvedValue(false);
 });
 it('ordinary A can retrieve A ordinary history, with no-store and owner admission',async()=>{
  const res=await GET(get(ordinary));
  expect(res.status).toBe(200);
  expect((await res.json())).toMatchObject({
   verifiedMemberId:A,scope:'ordinary',
   messages:[{content:'FICTION_ORDINARY_A'}],
  });
  expect(res.headers.get('cache-control')).toContain('no-store');
  const q=db.mock.calls.at(-1) as [string,string[]];
  expect(q[0]).toContain('WHERE user_id = $1 AND session_id = $2');
  expect(q[0]).toContain('astro_maia_protected_origins');
  expect(q[1]).toEqual([A,ordinary]);
 });
 it('registered chart session cannot use generic history GET',async()=>{
  db.mockImplementation(async(sql:string)=>{
   throw Error('PRIVATE_CONVERSATION_MUST_NOT_BE_READ');
  });
  protectedCheck.mockResolvedValue(true);
  const res=await GET(get(protectedId));
  expect(res.status).toBe(403);
  expect((await res.json()).messages).toBeUndefined();
  expect(protectedCheck).toHaveBeenCalledWith(protectedId);
  expect(db).not.toHaveBeenCalled();
 });
 it('a chart-shared-once session cannot be saved through the normal audited writer',async()=>{
  db.mockImplementation(async(sql:string)=>{
   throw Error('NO_FURTHER_DATABASE_WRITES_EXPECTED');
  });
  protectedCheck.mockResolvedValue(true);
  const res=await POST(post(protectedId));
  expect(res.status).toBe(403);
  expect(save).not.toHaveBeenCalled();
 });
 it('A ordinary write still uses R5f mandatory audit+turn pair',async()=>{
  const res=await POST(post(ordinary));
  expect(res.status).toBe(200);
  expect(save).toHaveBeenCalledTimes(1);
  expect(save.mock.calls[0][1]).toBe(A);
  expect(save.mock.calls[0][2]).toBe(ordinary);
 });
 it('cross-session history query always excludes registered chart origins',async()=>{
  const res=await GET(get());
  expect(res.status).toBe(200);
  expect(db.mock.calls[0][0]).toContain('astro_maia_transfer_grants');
  expect(db.mock.calls[0][0]).toContain('astro_maia_protected_origins');
  expect(db.mock.calls[0][1]).toEqual([A]);
 });
 it('missing protected-origin table refuses history as unavailable, never empty or success',async()=>{
  protectedCheck.mockRejectedValue(Error('relation "astro_maia_protected_origins" does not exist'));
  const res=await GET(get(ordinary));
  expect(res.status).toBe(503);
  expect((await res.json()).error).toBe('privacy_guard_unavailable');
  expect(res.headers.get('cache-control')).toContain('private');
 });
 it('a foreign account cannot claim A via query or body',async()=>{
  who.mockResolvedValue(B);
  expect((await GET(get(ordinary))).status).toBe(403);
  expect((await POST(post(ordinary))).status).toBe(403);
  expect(db).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
 });
 it('Sanctuary still refuses persistence and does not read chart registry',async()=>{
  const req=new NextRequest('http://localhost/api/conversation/turns',{
   method:'POST',headers:{'content-type':'application/json'},
   body:JSON.stringify({userId:A,isSanctuary:true,sessionId:protectedId,
     userMessage:'nothing retained',assistantMessage:'nothing retained'}),
  });
  const res=await POST(req);
  expect(res.status).toBe(200);
  expect((await res.json()).sanctuary).toBe(true);
  expect(save).not.toHaveBeenCalled();
  expect(db).not.toHaveBeenCalled();
 });
});
