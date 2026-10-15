import {NextRequest} from 'next/server';
jest.mock('@/lib/writersStudio/betaPostWithdrawalCustody',()=>({
 authenticatedPostWithdrawalMember:jest.fn(),
 VALID_WORK_ID:/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
}));
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
jest.mock('@/lib/manuscript/source/eraseManuscript',()=>({eraseManuscript:jest.fn()}));
import {authenticatedPostWithdrawalMember} from '@/lib/writersStudio/betaPostWithdrawalCustody';
import {query} from '@/lib/db/postgres';
import {eraseManuscript} from '@/lib/manuscript/source/eraseManuscript';
import {GET,DELETE} from './route';
const gate=authenticatedPostWithdrawalMember as jest.Mock;
const q=query as jest.Mock;
const erase=eraseManuscript as jest.Mock;
const id='11111111-1111-4111-8111-111111111111';
const owner='22222222-2222-4222-8222-222222222222';
const target={params:Promise.resolve({id})};
const url='https://beta.soullab.life/api/beta/custody/'+id;
const get=()=>new NextRequest(url);
const del=(confirmation:unknown='DELETE MY WRITING',origin='https://beta.soullab.life',extra:Record<string,unknown>={})=>
 new NextRequest(url,{method:'DELETE',
  headers:{'content-type':'application/json',origin},
  body:JSON.stringify({confirmation,manuscriptId:id,...extra}),
 });
beforeEach(()=>{
 jest.resetAllMocks();
 gate.mockResolvedValue({kind:'allowed',memberId:owner});
 q.mockResolvedValueOnce({rows:[{id,title:'Fictional work',created_at:'2026-10-15'}]})
  .mockResolvedValueOnce({rows:[{content:'Latest fictional authored text',version:'3',updated_at:'2026-10-15'}]})
  .mockResolvedValueOnce({rows:[{id:'s1',position:0,heading:'Opening',body:'Earlier source text',heading_depth:1}]});
 erase.mockResolvedValue({ok:true,artifactsQueued:1,sweptAll:true});
});
it('refuses unauthenticated or nonhistorical member before DB access',async()=>{
 gate.mockResolvedValue({kind:'refused',status:403});
 expect((await GET(get(),target)).status).toBe(403);
 expect(q).not.toHaveBeenCalled();
});
it('exports newest saved draft and source sections with owner-check-first',async()=>{
 const res=await GET(get(),target);
 expect(res.status).toBe(200);
 expect(res.headers.get('cache-control')).toBe('no-store');
 const body=await res.json();
 expect(body.kind).toBe('soullab.member-owned-writing-custody');
 expect(body.currentDraft.content).toBe('Latest fictional authored text');
 expect(body.originalSections[0].body).toBe('Earlier source text');
 expect(body.originalFileIncluded).toBe(false);
 expect(q.mock.calls[0][0]).toContain('WHERE id=$1 AND member_id=$2');
 expect(q.mock.calls[0][1]).toEqual([id,owner]);
 expect(erase).not.toHaveBeenCalled();
});
it('foreign manuscript is indistinguishable from missing manuscript',async()=>{
 q.mockReset().mockResolvedValueOnce({rows:[]});
 expect((await GET(get(),target)).status).toBe(404);
 expect(q).toHaveBeenCalledTimes(1);
});
it('rejects deletion from other Origins before member or Work is read',async()=>{
 expect((await DELETE(del('DELETE MY WRITING','https://evil.invalid'),target)).status).toBe(403);
 expect(gate).not.toHaveBeenCalled();
 expect(erase).not.toHaveBeenCalled();
});
it('refuses incomplete destructive confirmation, mismatched ID and extra fields',async()=>{
 expect((await DELETE(del('Delete'),target)).status).toBe(400);
 expect((await DELETE(del('DELETE MY WRITING','https://beta.soullab.life',{memberId:'other'}),target)).status).toBe(400);
 expect(erase).not.toHaveBeenCalled();
});
it('deletes only exact verified member and original via the existing erasure service',async()=>{
 const res=await DELETE(del(),target);
 expect(res.status).toBe(200);
 expect(await res.json()).toEqual({removed:true,originalBytesDestroyed:true});
 expect(erase).toHaveBeenCalledTimes(1);
 expect(erase).toHaveBeenCalledWith(id,owner);
 expect(q).not.toHaveBeenCalled();
});
it('never claims original was deleted when file erasure remains pending',async()=>{
 erase.mockResolvedValue({ok:true,artifactsQueued:1,sweptAll:false});
 const res=await DELETE(del(),target);
 expect(res.status).toBe(503);
 expect((await res.json()).originalBytesDestroyed).toBe(false);
});
it('preserves missing or shared-source refusal',async()=>{
 erase.mockResolvedValue({ok:false,refusal:'not_found'});
 expect((await DELETE(del(),target)).status).toBe(404);
 erase.mockResolvedValue({ok:false,refusal:'declared_in_other_works',works:2});
 expect((await DELETE(del(),target)).status).toBe(409);
});
it('does not grant deletion if member authority becomes unavailable',async()=>{
 gate.mockRejectedValue(new Error('offline fixture'));
 expect((await DELETE(del(),target)).status).toBe(503);
 expect(erase).not.toHaveBeenCalled();
});
