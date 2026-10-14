import {NextRequest} from 'next/server';
import {getCurrentSession} from '@/lib/auth/serverSessions';
import {query} from '@/lib/db/postgres';
import {readHousePreferences} from '@/lib/house/preferencesStore';
import {canUseHouseStudioH1} from '@/lib/access/houseStudioH1Access';
import {POST} from '../route';

jest.mock('@/lib/auth/serverSessions',()=>({getCurrentSession:jest.fn()}));
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
jest.mock('@/lib/house/preferencesStore',()=>({readHousePreferences:jest.fn()}));
jest.mock('@/lib/access/houseStudioH1Access',()=>({canUseHouseStudioH1:jest.fn()}));
const current=getCurrentSession as jest.Mock;
const db=query as jest.Mock;
const prefs=readHousePreferences as jest.Mock;
const h1=canUseHouseStudioH1 as jest.Mock;
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const request=(claimed:unknown,origin='http://127.0.0.1:37999',destination='home')=>
  new NextRequest('http://127.0.0.1:37999/api/auth/home-view',{
    method:'POST',
    headers:{origin,host:'127.0.0.1:37999','content-type':'application/json'},
    body:JSON.stringify({expectedMemberId:claimed,destination}),
  });

describe('R5 authenticated private JSON — never server-rendered HTML',()=>{
  beforeEach(()=>{
    jest.clearAllMocks();
    current.mockResolvedValue({memberId:A,sessionToken:'fixture-cookie-A'});
    prefs.mockResolvedValue({tag:'"hp1-fixture"',eligibleIds:[],revision:0,
      preferences:{version:1,center:[],shortcuts:[],passingThrough:'quiet'}});
    h1.mockReturnValue(false);
    db.mockImplementation(async(sql:string,params:unknown[])=>{
      expect(params).toEqual([A]);
      if(sql.includes('FROM members'))return {rows:[{id:A,name:'Fiction A'}]};
      if(sql.includes('FROM living_works'))return {rows:[{id:'work-A',title:'A_SECRET_FICTION'}]};
      throw Error('unexpected SQL');
    });
  });
  it('loads only server-authenticated A and no-store response after same-origin POST',async()=>{
    const r=await POST(request(A));
    expect(r.status).toBe(200);
    expect(r.headers.get('cache-control')).toContain('private');
    expect(r.headers.get('cache-control')).toContain('no-store');
    expect(r.headers.get('vary')).toContain('Cookie');
    expect(r.headers.get('content-type')).toContain('application/json');
    const payload=await r.json();
    expect(payload.memberId).toBe(A);
    expect(payload.firstName).toBe('Fiction');
    expect(payload.livingWorks).toEqual([{id:'work-A',title:'A_SECRET_FICTION'}]);
    expect(payload.livingWorks.some((x:{title:string})=>x.title.includes('B_SECRET'))).toBe(false);
  });
  it('refuses a B identity assertion even with A cookie, without database reads',async()=>{
    const r=await POST(request(B));
    expect(r.status).toBe(409);
    expect(db).not.toHaveBeenCalled();
  });
  it('refuses missing session and cross-origin before private reads',async()=>{
    current.mockResolvedValueOnce(null);
    expect((await POST(request(A))).status).toBe(401);
    expect((await POST(request(A,'https://outside.invalid'))).status).toBe(403);
    expect(db).not.toHaveBeenCalled();
  });
  it('rejects wrong destination',async()=>{
    expect((await POST(request(A,'http://127.0.0.1:37999','other'))).status).toBe(400);
    expect(db).not.toHaveBeenCalled();
  });
  it('keeps source database failure distinct from a legitimate empty Work',async()=>{
    db.mockRejectedValue(Error('fictional DB down'));
    const r=await POST(request(A));
    expect(r.status).toBe(503);
    expect((await r.json()).error).toBe('Private data unavailable');
  });
});
