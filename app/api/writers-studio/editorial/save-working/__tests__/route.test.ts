jest.mock('@/lib/maia/canonical-turn',()=>({resolveCanonicalIdentity:jest.fn()}));
jest.mock('@/lib/manuscript/editorialRuntime/workingSave',()=>({saveWorkingEditorialVersion:jest.fn()}));
import {NextRequest} from 'next/server';
import {resolveCanonicalIdentity} from '@/lib/maia/canonical-turn';
import {saveWorkingEditorialVersion} from '@/lib/manuscript/editorialRuntime/workingSave';
import {POST} from '../route';
const MEMBER='11111111-1111-4111-8111-111111111111';
const UUID='22222222-2222-4222-8222-222222222222';
const body={idempotencyKey:UUID,relationshipId:UUID,sectionId:UUID,range:{start:0,end:4},
 revisionNumber:1,threadId:null,supersedes:null,replacementText:'Exact',sanctuary:false,kept:[]};
const req=(value:unknown)=>new NextRequest('http://localhost/api/writers-studio/editorial/save-working',{
 method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(value)});
const identity=resolveCanonicalIdentity as jest.MockedFunction<typeof resolveCanonicalIdentity>;
const save=saveWorkingEditorialVersion as jest.MockedFunction<typeof saveWorkingEditorialVersion>;
beforeAll(()=>{process.env.WRITERS_STUDIO_EDITORIAL_ENABLED='1'});
beforeEach(()=>{jest.resetAllMocks();identity.mockResolvedValue({status:'verified',memberId:MEMBER});});
it('returns 201 only for a committed exact member Save and marks it private',async()=>{
 save.mockResolvedValue({ok:true,replayed:false,threadId:UUID,chainId:UUID,versionId:UUID,supersedes:null,sectionId:UUID});
 const res=await POST(req(body));expect(res.status).toBe(201);expect(res.headers.get('cache-control')).toContain('no-store');
 expect(await res.json()).toMatchObject({threadId:UUID,versionId:UUID,replayed:false});
 expect(save).toHaveBeenCalledWith(expect.objectContaining({identity:{status:'verified',memberId:MEMBER},request:body}));
});
it('returns 200 for an exact idempotent replay',async()=>{
 save.mockResolvedValue({ok:true,replayed:true,threadId:UUID,chainId:UUID,versionId:UUID,supersedes:null,sectionId:UUID});
 expect((await POST(req(body))).status).toBe(200);
});
it('refuses unknown request fields before storage',async()=>{
 const res=await POST(req({...body,author:'maia'}));expect(res.status).toBe(400);expect(save).not.toHaveBeenCalled();
});
it('refuses unauthenticated calls before parsing or storage',async()=>{
 identity.mockResolvedValue({status:'missing'} as never);const res=await POST(req(body));expect(res.status).toBe(401);expect(save).not.toHaveBeenCalled();
});
it('preserves a current-authority refusal without false success',async()=>{
 save.mockResolvedValue({ok:false,reason:'origin_unavailable'});const res=await POST(req(body));expect(res.status).toBe(409);
 expect(await res.json()).toEqual({error:'origin_unavailable',persisted:false});
});
