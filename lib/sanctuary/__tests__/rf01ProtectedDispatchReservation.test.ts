/** RF01 S1-C protected one-use provider claim; fictional database only. */
import {describe,it,expect,beforeEach,jest} from '@jest/globals';
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const S='fictional-session-A';
const X='44444444-4444-4444-8444-444444444444';
const mockQuery=jest.fn<(sql:string,args:unknown[])=>Promise<{rows:any[]}>>();
jest.mock('@/lib/db/postgres',()=>({query:(sql:string,args:unknown[])=>mockQuery(sql,args)}));
import {
  S1C_DISPATCH_CONTRACT,
  ProtectedDispatchRefusal,
  reserveProtectedTextDispatch,
  requireProtectedTextDispatch,
} from '../protectedDispatchReservation';
const reservations=new Set<string>();
let storeUp=true;
let owner=A;
let priorConsent=true;
beforeEach(()=>{
 delete process.env.RF01_S1C_DISPATCH_RESERVATIONS_ENABLED;
 mockQuery.mockReset();reservations.clear();
 storeUp=true;owner=A;priorConsent=true;
 mockQuery.mockImplementation(async (sql,args)=>{
  if(!storeUp)throw new Error('FICTIONAL_SQL_FAILURE');
  const id=String(args[0]);
  expect(sql).toContain('ON CONFLICT (request_id) DO NOTHING RETURNING request_id');
  expect(sql).toContain("AND c.posture='sanctuary'");
  expect(sql).toContain("AND s.member_id=g.member_id AND s.status='active'");
  if(!priorConsent || args[1]!==owner || reservations.has(id))return {rows:[]};
  reservations.add(id);
  return {rows:[{request_id:id}]};
 });
});
const identity=(memberId=A,sessionId=S,exchangeId=X)=>({memberId,sessionId,exchangeId});
describe('RF01 S1-C atomic egress reservation',()=>{
 it('is off by default before touching SQL',async()=>{
  expect(await reserveProtectedTextDispatch(identity()))
    .toEqual({ok:false,code:'PROTECTED_DISPATCH_HELD'});
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('no client flag can bypass default-off',async()=>{
  expect(await reserveProtectedTextDispatch({
   ...identity(),authorized:true,allowRetry:true,
  } as any)).toMatchObject({ok:false,code:'PROTECTED_DISPATCH_HELD'});
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('refuses malformed or missing member, session or exchange',async()=>{
  process.env.RF01_S1C_DISPATCH_RESERVATIONS_ENABLED='1';
  for(const x of [
   {memberId:'',sessionId:S,exchangeId:X},
   {memberId:A,sessionId:'',exchangeId:X},
   {memberId:A,sessionId:S,exchangeId:'not-a-uuid'},
  ])expect((await reserveProtectedTextDispatch(x)).ok).toBe(false);
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('one authorized processor attempt is reserved exactly once',async()=>{
  process.env.RF01_S1C_DISPATCH_RESERVATIONS_ENABLED='1';
  const first=await reserveProtectedTextDispatch(identity());
  expect(first).toEqual({ok:true,contract:S1C_DISPATCH_CONTRACT});
  expect(reservations.size).toBe(1);
  const second=await reserveProtectedTextDispatch(identity());
  expect(second).toMatchObject({ok:false,code:'DISPATCH_ALREADY_RESERVED_OR_UNAUTHORIZED'});
  expect(reservations.size).toBe(1);
 });
 it('a competing actor cannot reuse another member grant',async()=>{
  process.env.RF01_S1C_DISPATCH_RESERVATIONS_ENABLED='1';
  expect((await reserveProtectedTextDispatch(identity(B))).ok).toBe(false);
  expect(reservations.size).toBe(0);
 });
 it('an absent verified posture never authorizes egress',async()=>{
  process.env.RF01_S1C_DISPATCH_RESERVATIONS_ENABLED='1';priorConsent=false;
  expect((await reserveProtectedTextDispatch(identity())).ok).toBe(false);
 });
 it('DB outage refuses and reveals none of the error text',async()=>{
  process.env.RF01_S1C_DISPATCH_RESERVATIONS_ENABLED='1';storeUp=false;
  const out=await reserveProtectedTextDispatch(identity());
  expect(out).toMatchObject({ok:false,code:'DISPATCH_DATABASE_UNAVAILABLE'});
  expect(JSON.stringify(out)).not.toContain('FICTIONAL_SQL_FAILURE');
 });
 it('ordinary non-Sanctuary requests do not claim provider reservations',async()=>{
  process.env.RF01_S1C_DISPATCH_RESERVATIONS_ENABLED='1';
  await expect(requireProtectedTextDispatch({
   sanctuary:false,userId:A,sessionId:S,exchangeId:X,
  })).resolves.toBeUndefined();
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('direct SDK callers require a positive one-use claim',async()=>{
  await expect(requireProtectedTextDispatch({
   sanctuary:true,userId:A,sessionId:S,exchangeId:X,
  })).rejects.toBeInstanceOf(ProtectedDispatchRefusal);
  expect(mockQuery).not.toHaveBeenCalled();
  process.env.RF01_S1C_DISPATCH_RESERVATIONS_ENABLED='1';
  await expect(requireProtectedTextDispatch({
   sanctuary:true,userId:A,sessionId:S,exchangeId:X,
  })).resolves.toBeUndefined();
  await expect(requireProtectedTextDispatch({
   sanctuary:true,userId:A,sessionId:S,exchangeId:X,
  })).rejects.toBeInstanceOf(ProtectedDispatchRefusal);
 });
});
