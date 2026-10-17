/**
 * RF01 R1-B read-only/quarantined influence and held erasure tests.
 * All fictitious member identities; never use production DB or deletion.
 */
import {describe,it,expect,beforeEach,jest} from '@jest/globals';
const A='11111111-1111-1111-1111-111111111111';
const B='22222222-2222-2222-2222-222222222222';
const S='fictional-owned-session';
const T='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
const mockQuery=jest.fn<(...a:any[])=>Promise<any>>();
const mockTx=jest.fn<(fn:(client:any)=>Promise<any>)=>Promise<any>>();
jest.mock('@/lib/db/postgres',()=>({
 query:(...a:any[])=>mockQuery(...a),
 transaction:(fn:(client:any)=>Promise<any>)=>mockTx(fn),
}));
import {
 assertMemberInfluenceAllowed,MemberInfluenceHeld,
 MemberInfluenceCustodyUnavailable,influenceHoldResponse,
} from '../memberInfluenceHold';
import {eraseExactFictionalMemberTurns} from '../exactTurnErasure';

beforeEach(()=>{
 delete process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED;
 mockQuery.mockReset();mockTx.mockReset();
 mockQuery.mockImplementation(async()=>({rows:[]}));
});
describe('RF01 R1-B member-derived influence hold',()=>{
 it('allows a member only after a successful authoritative empty lookup',async()=>{
  await expect(assertMemberInfluenceAllowed(A)).resolves.toBeUndefined();
  expect(mockQuery).toHaveBeenCalledWith(
   expect.stringContaining('rf01_member_erasure_holds'),[A],
  );
 });
 it('refuses a member with a hold rather than retrieving old derived memories',async()=>{
  mockQuery.mockImplementation(async()=>({rows:[{held:1}]}));
  await expect(assertMemberInfluenceAllowed(A)).rejects.toBeInstanceOf(MemberInfluenceHeld);
  expect(influenceHoldResponse(new MemberInfluenceHeld())).toEqual({
   error:'MEMBER_INFLUENCE_ERASURE_HOLD',action:'REVIEW_ERASURE_CUSTODY',
  });
 });
 it('database outage and missing schema do not become an empty result',async()=>{
  mockQuery.mockImplementation(async()=>{throw new Error('FICTIONAL_DB_UNAVAILABLE')});
  await expect(assertMemberInfluenceAllowed(A))
   .rejects.toBeInstanceOf(MemberInfluenceCustodyUnavailable);
  expect(influenceHoldResponse(new MemberInfluenceCustodyUnavailable())).toEqual({
   error:'MEMBER_INFLUENCE_CUSTODY_UNAVAILABLE',
   action:'REVIEW_ERASURE_CUSTODY',
  });
 });
 it('missing actor cannot bypass the hold lookup',async()=>{
  await expect(assertMemberInfluenceAllowed(''))
   .rejects.toBeInstanceOf(MemberInfluenceCustodyUnavailable);
  expect(mockQuery).not.toHaveBeenCalled();
 });
});
describe('RF01 R1-B erasure activation never follows a chat message',()=>{
 it('is held by default, before any SQL transaction',async()=>{
  const res=await eraseExactFictionalMemberTurns({
   verifiedMemberId:A,sessionId:S,turnIds:[T],explicitMemberConfirmation:true,
  });
  expect(res).toMatchObject({ok:false,code:'R1B_ERASURE_RELEASE_HELD'});
  expect(mockTx).not.toHaveBeenCalled();
 });
 it('a production environment refuses even when the fictional flag is present',async()=>{
  const prior=process.env.NODE_ENV;
  process.env.NODE_ENV='production';
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  try{
   const res=await eraseExactFictionalMemberTurns({
    verifiedMemberId:A,sessionId:S,turnIds:[T],explicitMemberConfirmation:true,
   });
   expect(res).toMatchObject({ok:false,code:'R1B_ERASURE_RELEASE_HELD'});
   expect(mockTx).not.toHaveBeenCalled();
  }finally{
   process.env.NODE_ENV=prior;
   delete process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED;
  }
 });
 it('a forged yes flag without an explicit member action cannot delete',async()=>{
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  const res=await eraseExactFictionalMemberTurns({
   verifiedMemberId:A,sessionId:S,turnIds:[T],explicitMemberConfirmation:false,
  });
  expect(res).toMatchObject({ok:false,code:'R1B_AUTHORIZATION_NOT_ESTABLISHED'});
  expect(mockTx).not.toHaveBeenCalled();
 });
 it('rejects duplicates and mixed wildcard identifiers before SQL',async()=>{
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  for(const turnIds of [[T,T],['*'],[T,'foreign'],[]]){
   expect((await eraseExactFictionalMemberTurns({
    verifiedMemberId:A,sessionId:S,turnIds,explicitMemberConfirmation:true,
   })).ok).toBe(false);
  }
  expect(mockTx).not.toHaveBeenCalled();
 });
 it('cannot use another member as the authenticated actor through a claim',async()=>{
  process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED='1';
  const res=await eraseExactFictionalMemberTurns({
   verifiedMemberId:B,sessionId:S,turnIds:[T],explicitMemberConfirmation:false,
  });
  expect(res.ok).toBe(false);
  expect(mockTx).not.toHaveBeenCalled();
 });
});
