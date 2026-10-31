/** Current-authority acceptance for the existing-thread member-version route. */
const resolveIdentity=jest.fn();
const appendCurrent=jest.fn();
jest.mock('@/lib/maia/canonical-turn',()=>({resolveCanonicalIdentity:(...a:unknown[])=>resolveIdentity(...a)}));
jest.mock('@/lib/manuscript/editorialRuntime/memberVersion',()=>({
 appendCurrentMemberVersion:(...a:unknown[])=>appendCurrent(...a),
}));
import {POST} from '../route';
const THREAD='11111111-1111-4111-8111-111111111111';
const REL='22222222-2222-4222-8222-222222222222';
const MEMBER='33333333-3333-4333-8333-333333333333';
const VERSION='44444444-4444-4444-8444-444444444444';
const fixture={threadId:THREAD,relationshipId:REL,sanctuary:false,supersedes:null as string|null,replacementText:'My exact words.'};
const request=(body:unknown)=>({json:async()=>body}) as never;
const initial=process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;
beforeEach(()=>{jest.resetAllMocks();process.env.WRITERS_STUDIO_EDITORIAL_ENABLED='1';
 resolveIdentity.mockResolvedValue({status:'verified',memberId:MEMBER});
 appendCurrent.mockResolvedValue({outcome:'appended',version:{id:VERSION,supersedes:null}});
});
afterAll(()=>{if(initial===undefined)delete process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;else process.env.WRITERS_STUDIO_EDITORIAL_ENABLED=initial;});

describe('existing-thread Save requires current Work relationship and posture',()=>{
 it('passes only server-needed current-authority fields and marks success private',async()=>{
  const res=await POST(request(fixture));
  expect(res.status).toBe(201);expect(res.headers.get('cache-control')).toContain('no-store');
  expect(appendCurrent).toHaveBeenCalledWith({memberId:MEMBER,relationshipId:REL,threadId:THREAD,supersedes:null,replacementText:'My exact words.'});
 });
 it.each([
  [{...fixture,relationshipId:undefined},'relationship_required'],
  [{...fixture,sanctuary:undefined},'posture_required'],
 ])('refuses missing current authority before append',async(body,error)=>{
  const res=await POST(request(body));expect(res.status).toBe(400);expect(await res.json()).toMatchObject({error});expect(appendCurrent).not.toHaveBeenCalled();
 });
 it('refuses Sanctuary as a posture decision before append',async()=>{
  const res=await POST(request({...fixture,sanctuary:true}));expect(res.status).toBe(409);
  expect(await res.json()).toEqual({error:'sanctuary_unavailable',persisted:false});expect(appendCurrent).not.toHaveBeenCalled();
 });
 it.each(['author','chainId','manuscriptId','revisionNumber','sourceRange'])('refuses caller authority field %s',async(field)=>{
  const res=await POST(request({...fixture,[field]:'fictional'}));expect(res.status).toBe(400);expect((await res.json()).error).toContain(field);expect(appendCurrent).not.toHaveBeenCalled();
 });
 it('retains an intentionally empty member formulation',async()=>{
  const res=await POST(request({...fixture,replacementText:''}));expect(res.status).toBe(201);expect(appendCurrent.mock.calls[0][0].replacementText).toBe('');
 });
 it('refuses null thread before storage',async()=>{expect((await POST(request({...fixture,threadId:null}))).status).toBe(400);expect(appendCurrent).not.toHaveBeenCalled();});
 it('returns current-origin refusal without false persistence',async()=>{
  appendCurrent.mockResolvedValue({outcome:'refused',reason:'origin_unavailable'});
  const res=await POST(request(fixture));expect(res.status).toBe(409);expect(await res.json()).toEqual({error:'origin_unavailable',persisted:false});
 });
 it('preserves stale predecessor refusal without retry',async()=>{
  appendCurrent.mockResolvedValue({outcome:'refused',reason:'not_successor_of_head'});
  const input={...fixture,supersedes:VERSION};const res=await POST(request(input));expect(res.status).toBe(409);
  expect(appendCurrent.mock.calls[0][0].supersedes).toBe(VERSION);expect(appendCurrent).toHaveBeenCalledTimes(1);
 });
 it('refuses anonymous identity and disabled feature before storage',async()=>{
  resolveIdentity.mockResolvedValue({status:'missing'});expect((await POST(request(fixture))).status).toBe(401);expect(appendCurrent).not.toHaveBeenCalled();
  jest.clearAllMocks();delete process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;expect((await POST(request(fixture))).status).toBe(404);expect(resolveIdentity).not.toHaveBeenCalled();
 });
});
