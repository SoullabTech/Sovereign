import {NextRequest} from 'next/server';
jest.mock('@/lib/writersStudio/betaPostWithdrawalCustody',()=>({authenticatedPostWithdrawalMember:jest.fn()}));
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
import {authenticatedPostWithdrawalMember} from '@/lib/writersStudio/betaPostWithdrawalCustody';
import {query} from '@/lib/db/postgres';
import {GET} from './route';
const gate=authenticatedPostWithdrawalMember as jest.Mock;
const q=query as jest.Mock;
const m='11111111-1111-4111-8111-111111111111';
const req=()=>new NextRequest('https://beta.soullab.life/api/beta/custody');
beforeEach(()=>{jest.resetAllMocks();gate.mockResolvedValue({kind:'allowed',memberId:m});q.mockResolvedValue({rows:[]});});
it('refuses without verified historical consent',async()=>{
 gate.mockResolvedValue({kind:'refused',status:403});
 expect((await GET(req())).status).toBe(403);
 expect(q).not.toHaveBeenCalled();
});
it('lists only member-owned Work metadata with no writing text',async()=>{
 q.mockResolvedValue({rows:[{id:'id1',title:'Fictional Work',created_at:'2026-10-15'}]});
 const res=await GET(req());expect(res.status).toBe(200);
 expect(res.headers.get('cache-control')).toBe('no-store');
 expect(await res.json()).toEqual({
  manuscripts:[{id:'id1',title:'Fictional Work',createdAt:'2026-10-15'}],hasMore:false,
 });
 expect(q.mock.calls[0][0]).toContain('WHERE member_id = $1');
 expect(q.mock.calls[0][1]).toEqual([m]);
});
it('fails closed on DB errors',async()=>{
 q.mockRejectedValue(new Error('fake db down'));
 expect((await GET(req())).status).toBe(503);
});
