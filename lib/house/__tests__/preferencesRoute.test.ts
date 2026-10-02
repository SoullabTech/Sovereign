import { NextRequest } from 'next/server';
import { GET, PUT } from '../../../app/api/house/preferences/route';
import { query } from '@/lib/db/postgres';
import { cookies, headers } from 'next/headers';
import { HOUSE_PLACES } from '../catalog';
import { defaultHousePreferences } from '../preferences';
import { housePreferenceTag } from '../preferencesStore';
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
jest.mock('next/headers',()=>({cookies:jest.fn(),headers:jest.fn()}));
const q=query as jest.Mock;
const cookieMock=cookies as jest.Mock; const headerMock=headers as jest.Mock;
const prefs=defaultHousePreferences(HOUSE_PLACES.map(p=>p.id));
function session(cookieToken?:string, headerToken?:string, forgedId='foreign') {
  cookieMock.mockResolvedValue({get:(key:string)=>key==='maia_session'&&cookieToken?{value:cookieToken}:key==='maia_member_id'?{value:forgedId}:undefined});
  headerMock.mockResolvedValue(new Headers({'x-member-id':forgedId,...(headerToken?{'x-session-token':headerToken}:{})}));
}
function request(method='GET', body?:unknown, extra:Record<string,string>={}, suffix='') {
  return new NextRequest('http://localhost:3197/api/house/preferences'+suffix,{method,
    headers:{origin:'http://localhost:3197','content-type':'application/json','if-match':housePreferenceTag('A',0),...extra},
    ...(body!==undefined?{body:JSON.stringify(body)}:{})});
}
beforeEach(()=>{
  jest.resetAllMocks();session('valid-A');
  q.mockImplementation(async(sql:string,params:unknown[])=>{
    if(sql.includes('FROM auth_sessions'))return {rows:params[0]==='valid-A'?[{member_id:'A'}]:params[0]==='valid-B'?[{member_id:'B'}]:[]};
    if(sql.includes('AS studio'))return {rows:[{studio:true}]};
    if(sql.includes('INSERT INTO house_member_preferences'))return {rows:[{version:1,center_ids:prefs.center,shortcut_ids:prefs.shortcuts,passing_through:true,revision:1}]};
    return {rows:[]};
  });
});
describe('P1 verified ownership and HTTP boundary',()=>{
  test('unsigned member cookie/header cannot read',async()=>{
    session();expect((await GET(request())).status).toBe(401);expect(q).not.toHaveBeenCalled();
  });
  test('unsigned member cookie/header cannot write',async()=>{
    session();expect((await PUT(request('PUT',{expectedRevision:0,preferences:prefs}))).status).toBe(401);expect(q).not.toHaveBeenCalled();
  });
  test('expired/revoked/unknown token has no preference access',async()=>{
    session('invalid');expect((await GET(request())).status).toBe(401);
    expect(q.mock.calls.every(([sql])=>sql.includes('FROM auth_sessions') && sql.includes('revoked = FALSE') && sql.includes('expires_at > NOW()'))).toBe(true);
  });
  test('verified session owns read despite forged IDs',async()=>{
    const res=await GET(request()); expect(res.status).toBe(200);
    expect(q.mock.calls.filter(([sql])=>!sql.includes('auth_sessions')).every(([,params])=>params[0]==='A')).toBe(true);
  });
  test('verified session header fallback still works',async()=>{
    session(undefined,'valid-B');const res=await GET(request());expect(res.status).toBe(200);
    expect((await res.json()).tag).toBe(housePreferenceTag('B',0));
  });
  test('all successful reads are private and uncached',async()=>{
    const res=await GET(request());expect(res.headers.get('cache-control')).toContain('no-store');expect(res.headers.get('vary')).toContain('Cookie');
  });
  test('query-member selection is refused rather than honored',async()=>{
    expect((await GET(request('GET',undefined,{},'?memberId=B'))).status).toBe(400);
  });
  test('identity/role/permission fields cannot be saved',async()=>{
    const res=await PUT(request('PUT',{memberId:'B',expectedRevision:0,preferences:prefs}));expect(res.status).toBe(400);
    expect(q.mock.calls.some(([sql])=>sql.includes('INSERT INTO house_member_preferences'))).toBe(false);
  });
  test('cross-origin write refuses before persistence',async()=>{
    const res=await PUT(request('PUT',{expectedRevision:0,preferences:prefs},{origin:'https://foreign.example'}));expect(res.status).toBe(403);
  });
  test('a draft from account A cannot silently save to account B',async()=>{
    session('valid-B');const res=await PUT(request('PUT',{expectedRevision:0,preferences:prefs}));expect(res.status).toBe(409);
    expect((await res.json()).code).toBe('HOUSE_CONTEXT_CHANGED');expect(q.mock.calls.some(([sql])=>sql.includes('INSERT'))).toBe(false);
  });
  test('missing owner/revision tag refuses the write',async()=>{
    expect((await PUT(request('PUT',{expectedRevision:0,preferences:prefs},{'if-match':''}))).status).toBe(409);
  });
  test('success acknowledges the stored revision with its tag',async()=>{
    const res=await PUT(request('PUT',{expectedRevision:0,preferences:prefs}));expect(res.status).toBe(200);
    expect(res.headers.get('etag')).toBe(housePreferenceTag('A',1));expect((await res.json()).revision).toBe(1);
  });
  test('unknown/duplicate IDs are refused',async()=>{
    for(const shortcuts of [['journal','journal'],['admin']])expect((await PUT(request('PUT',{expectedRevision:0,preferences:{...prefs,shortcuts}}))).status).toBe(400);
  });
  test('database failure is not a success or an empty saved arrangement',async()=>{
    q.mockRejectedValue(new Error('database unavailable'));const res=await GET(request());expect(res.status).toBe(503);
    expect(await res.text()).not.toContain('database unavailable');expect(res.headers.get('cache-control')).toContain('no-store');
  });
});
