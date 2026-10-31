/** Source-only posture/current-origin witness for existing-thread Save. */
const identity=jest.fn();const append=jest.fn();
jest.mock('@/lib/maia/canonical-turn',()=>({resolveCanonicalIdentity:(...a:unknown[])=>identity(...a)}));
jest.mock('@/lib/manuscript/editorialRuntime/memberVersion',()=>({appendCurrentMemberVersion:(...a:unknown[])=>append(...a)}));
import {POST} from '../route';
const T='11111111-1111-4111-8111-111111111111',R='22222222-2222-4222-8222-222222222222',M='33333333-3333-4333-8333-333333333333';
const req=(body:unknown)=>({json:async()=>body}) as never;
const body={threadId:T,relationshipId:R,sanctuary:false,supersedes:null,replacementText:'FICTIONAL AUTHOR WORDING.'};
const before=process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;
beforeEach(()=>{jest.resetAllMocks();process.env.WRITERS_STUDIO_EDITORIAL_ENABLED='1';identity.mockResolvedValue({status:'verified',memberId:M});append.mockResolvedValue({outcome:'appended',version:{id:T,supersedes:null}});});
afterAll(()=>{if(before===undefined)delete process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;else process.env.WRITERS_STUDIO_EDITORIAL_ENABLED=before;});
it('ordinary current relationship is required and forwarded',async()=>{expect((await POST(req(body))).status).toBe(201);expect(append).toHaveBeenCalledWith(expect.objectContaining({memberId:M,relationshipId:R,threadId:T}));});
it('missing posture refuses before append',async()=>{expect((await POST(req({...body,sanctuary:undefined}))).status).toBe(400);expect(append).not.toHaveBeenCalled();});
it('Sanctuary refuses before append',async()=>{const res=await POST(req({...body,sanctuary:true}));expect(res.status).toBe(409);expect(append).not.toHaveBeenCalled();});
it('missing relationship refuses before append',async()=>{expect((await POST(req({...body,relationshipId:undefined}))).status).toBe(400);expect(append).not.toHaveBeenCalled();});
it('unknown or withdrawn current origin returns 409 without persisted claim',async()=>{append.mockResolvedValue({outcome:'refused',reason:'origin_unavailable'});const res=await POST(req(body));expect(res.status).toBe(409);expect(await res.json()).toEqual({error:'origin_unavailable',persisted:false});});
it('identity and feature gate remain fail closed',async()=>{identity.mockResolvedValue({status:'unverified'});expect((await POST(req(body))).status).toBe(401);jest.clearAllMocks();delete process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;expect((await POST(req(body))).status).toBe(404);});
