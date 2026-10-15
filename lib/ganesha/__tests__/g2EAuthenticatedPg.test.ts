/**
 * G2-3E isolated session-backed PostgreSQL acceptance rehearsal.
 * Real getMemberIdFromRequest -> resolveIndividualContext -> PG -> handlers.
 * Only Next's request-scoped cookie getter and release admission are mocked:
 * source release remains an unconditional false in the actual candidate.
 * DATABASE_URL is a temporary Unix-domain socket populated with fictional rows.
 */
import {beforeAll,afterAll,beforeEach,describe,expect,it,jest} from '@jest/globals';
import {NextRequest} from 'next/server';

const mockCookieJar:Record<string,string>={};
const mockRelease={admitted:false};
jest.mock('next/headers',()=>({
  cookies:async()=>({
    get:(name:string)=>mockCookieJar[name]?{value:mockCookieJar[name]}:undefined,
  }),
}));
jest.mock('@/lib/ganesha/g2MemberAuthoringRelease',()=>({
  isG2MemberAuthoringReleaseAdmitted:()=>mockRelease.admitted,
}));

import {query,closePool} from '@/lib/db/postgres';
import {GET as overview} from '@/app/api/ganesha/personal-field/overview/route';
import {GET as notes,POST as createNote} from '@/app/api/ganesha/personal-field/notes/route';
import {PATCH as editNote} from '@/app/api/ganesha/personal-field/notes/[id]/route';
import {GET as attention,POST as place} from '@/app/api/ganesha/personal-field/attention/route';
import {PATCH as reposition} from '@/app/api/ganesha/personal-field/attention/[id]/route';
import {GET as individualContext} from '@/app/api/ganesha/individual-context/route';

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const P='33333333-3333-4333-8333-333333333333';
const AN='55555555-5555-4555-8555-555555555555';
const BN='66666666-6666-4666-8666-666666666666';
const DEC_A='88888888-8888-4888-8888-888888888888';
const DEC_B='99999999-9999-4999-8999-999999999999';
const ATT_A='a0000000-0000-4000-8000-000000000001';
const extra='a0000000-0000-4000-8000-000000000009';
const base='http://127.0.0.1:7777/api/ganesha';
const p=(id:string)=>({params:Promise.resolve({id})});
function req(path:string,token?:string,method='GET',body?:unknown,claims:Record<string,string>={}){
  const headers:Record<string,string>={...claims};
  if(token)headers['x-session-token']=token;
  if(body!==undefined)headers['content-type']='application/json';
  return new NextRequest(base+path,{method,headers,
    ...(body!==undefined?{body:JSON.stringify(body)}:{})});
}
function a(path:string,method='GET',body?:unknown,claims:Record<string,string>={}){
  return req(path,'g2e-session-A',method,body,claims);
}
function b(path:string,method='GET',body?:unknown,claims:Record<string,string>={}){
  return req(path,'g2e-session-B',method,body,claims);
}
function ids(list:any[]):string[]{return list.map(x=>x.id);}
function strings(view:unknown):string{return JSON.stringify(view);}

beforeAll(()=>{
  if(process.env.G2E_DISCONNECTED_FIXTURE!=='yes' ||
     !process.env.DATABASE_URL?.includes('g2e_auth_') ||
     !process.env.DATABASE_URL?.includes('host=%2Ftmp%2F')) {
    throw new Error('G2-3E refuses to run without its temporary Unix socket fixture');
  }
});
beforeEach(()=>{
  for(const key of Object.keys(mockCookieJar))delete mockCookieJar[key];
  mockRelease.admitted=true; // Synthetic fixture alone; actual source is FALSE.
});
afterAll(async()=>{await closePool();});

describe('G2-3E signed-session, member-owned Personal Field API against real synthetic PG',()=>{
  it('source release hold refuses authenticated access, regardless of installed fixture schema',async()=>{
    mockRelease.admitted=false;
    const r=await overview(a('/personal-field/overview'));
    expect(r.status).toBe(503);
    expect((await r.json()).state).toBe('authorization_held');
    const w=await createNote(a('/personal-field/notes','POST',{section:'alive',body:'refused'}));
    expect(w.status).toBe(503);
    const count=await query<{n:number}>('SELECT count(*)::integer n FROM field_notes WHERE personal_member_id=$1',[A]);
    expect(count.rows[0].n).toBe(1);
  });
  it('rejects no credential, raw member ID, expired and revoked signed sessions',async()=>{
    for(const r of [
      req('/personal-field/overview'),
      req('/personal-field/overview',undefined,'GET',undefined,{'x-member-id':B}),
      req('/personal-field/overview','g2e-session-expired'),
      req('/personal-field/overview','g2e-session-revoked'),
      req('/personal-field/overview','fake-token'),
    ])expect((await overview(r)).status).toBe(401);
  });
  it('rejects mismatch between real member session and untrusted identity claim',async()=>{
    const stolen=await overview(a('/personal-field/overview?memberId='+B,'GET',undefined,{'x-member-id':B}));
    expect(stolen.status).toBe(401);
    mockCookieJar.maia_session='g2e-session-A';
    expect((await overview(req('/personal-field/overview','g2e-session-B','GET',undefined,
      {'x-member-id':B}))).status).toBe(401);
    mockCookieJar.maia_member_id=B;
    expect((await overview(req('/personal-field/overview','g2e-session-A'))).status).toBe(401);
  });
  it('refuses conflicting valid cookie-A and header-B sessions even with no member claim',async()=>{
    mockCookieJar.maia_session='g2e-session-A';
    const r=await overview(req('/personal-field/overview','g2e-session-B'));
    expect(r.status).toBe(401);
    const identity=await individualContext(req('/individual-context','g2e-session-B'));
    expect(identity.status).toBe(401);
  });
  it('accepts only verified web cookie and Safari header and never leaks identity detail',async()=>{
    mockCookieJar.maia_session='g2e-session-A';
    const cookie=await individualContext(req('/individual-context'));
    expect(cookie.status).toBe(200);
    expect(await cookie.json()).toMatchObject({
      personalField:{owner:'member',identityReady:true},legacyPersonal:{status:'none'},
    });
    // A cookie takes priority; remove it to exercise Safari header fallback as B.
    delete mockCookieJar.maia_session;
    const head=await individualContext(b('/individual-context'));
    expect(head.status).toBe(200);
    const identity=await head.json();
    expect(identity.legacyPersonal.status).toBe('active');
    expect(identity).not.toHaveProperty('legacyPersonalPractitionerId');
  });
  it('A sees only own native Personal Field without any practitioner account',async()=>{
    const r=await overview(a('/personal-field/overview?memberId='+B+'&tier=pro'));
    expect(r.status).toBe(200);
    const v=await r.json();
    expect(v.legacyStatus).toBe('none');
    expect(v.owner).toBe('member');
    expect(v.authoringEnabled).toBe(false);
    expect(ids(v.notes)).toEqual([AN]);
    expect(v.events.map((x:any)=>x.title)).toEqual(['A native event']);
    expect(v.people.map((x:any)=>x.name)).toEqual(['A fictional friend']);
    expect(v.attention.memberNative.map((x:any)=>x.label)).toEqual(['A chosen attention']);
    expect(v.attention.historical).toHaveLength(0);
    expect(strings(v)).not.toContain('B own');
    expect(strings(v)).not.toContain('B professional');
    expect(r.headers.get('cache-control')).toContain('no-store');
  });
  it('B sees only own native and verified historical Personal rows, never Pro or A',async()=>{
    const r=await overview(b('/personal-field/overview?practitionerId='+P));
    expect(r.status).toBe(200);
    const v=await r.json();
    expect(v.legacyStatus).toBe('active');
    expect(ids(v.notes)).toContain(BN);
    expect(v.notes.map((x:any)=>x.body)).toContain('B historic private note');
    expect(v.events.map((x:any)=>x.title)).toEqual(['B historical event','B native event']);
    expect(v.people.map((x:any)=>x.name)).toEqual(['B fictional friend','B historical person']);
    expect(v.attention.historical.map((x:any)=>x.label)).toEqual(['B historical attention']);
    expect(strings(v)).not.toContain('A own native');
    expect(strings(v)).not.toContain('B professional');
    expect(strings(v)).not.toContain('professional person');
    expect(strings(v)).not.toContain(P);
  });
  it('A authors and reopens own Note; B cannot edit or read it, A can revise',async()=>{
    const made=await createNote(a('/personal-field/notes','POST',
      {section:'tending',body:'Fictional A passage'}));
    expect(made.status).toBe(201);
    const {id}=await made.json();
    const wrong=await editNote(b('/personal-field/notes/'+id,'PATCH',
      {body:'B attempted overwrite'}),p(id));
    expect(wrong.status).toBe(404);
    const own=await editNote(a('/personal-field/notes/'+id,'PATCH',
      {body:'A revised fictional passage'}),p(id));
    expect(own.status).toBe(200);
    const refreshed=await notes(a('/personal-field/notes'));
    expect((await refreshed.json()).notes.some((x:any)=>
      x.id===id&&x.body==='A revised fictional passage')).toBe(true);
    const foreign=await notes(b('/personal-field/notes'));
    expect(ids((await foreign.json()).notes)).not.toContain(id);
    expect((await query('SELECT body FROM field_notes WHERE id=$1',[id])).rows[0].body)
      .toBe('A revised fictional passage');
  });
  it('B cannot mutate A native Note or Attention, including forged route scope',async()=>{
    expect((await editNote(b('/personal-field/notes/'+AN,'PATCH',
      {section:'asking'}),p(AN))).status).toBe(404);
    expect((await reposition(b('/personal-field/attention/'+ATT_A,'PATCH',
      {position:88}),p(ATT_A))).status).toBe(404);
    expect((await createNote(a('/personal-field/notes','POST',
      {section:'alive',body:'forgery',personal_member_id:B}))).status).toBe(400);
    const real=await query<{body:string}>('SELECT body FROM field_notes WHERE id=$1',[AN]);
    expect(real.rows[0].body).toBe('A own native note');
  });
  it('cross-member and Pro references cannot be placed into personal Attention',async()=>{
    const wrong=await place(a('/personal-field/attention','POST',
      {field:'important',kind:'decision',refId:DEC_B}));
    expect(wrong.status).toBe(404);
    const own=await place(a('/personal-field/attention','POST',
      {field:'important',kind:'decision',refId:DEC_A}));
    expect(own.status).toBe(201);
    const ownId=(await own.json()).id;
    const result=await attention(a('/personal-field/attention'));
    const v=await result.json();
    expect(v.attention.some((x:any)=>x.id===ownId&&x.label==='A private decision')).toBe(true);
    expect(strings(v)).not.toContain('B private decision');
    expect((await attention(b('/personal-field/attention'))).status).toBe(200);
    const moved=await reposition(a('/personal-field/attention/'+ownId,'PATCH',
      {field:'emerging',position:-2}),p(ownId));
    expect(moved.status).toBe(200);
    expect((await reposition(b('/personal-field/attention/'+ownId,'PATCH',
      {position:23}),p(ownId))).status).toBe(404);
  });
  it('suspended history disappears without losing B independent member-native material',async()=>{
    await query('UPDATE practitioners SET status=$2 WHERE id=$1',[P,'suspended']);
    try {
      const r=await overview(b('/personal-field/overview'));
      expect(r.status).toBe(200);
      const v=await r.json();
      expect(v.legacyStatus).toBe('unavailable');
      expect(v.notes.map((x:any)=>x.body)).not.toContain('B historic private note');
      expect(ids(v.notes)).toContain(BN);
      expect(v.events.map((x:any)=>x.title)).toEqual(['B native event']);
      expect(v.people.map((x:any)=>x.name)).toEqual(['B fictional friend']);
    } finally {
      await query('UPDATE practitioners SET status=$2 WHERE id=$1',[P,'active']);
    }
  });
  it('ambiguous historical records stay held while B native Personal Field survives',async()=>{
    await query("INSERT INTO practitioners(id,member_id,portal_type,status) VALUES($1,$2,'personal','active')",[extra,B]);
    try {
      const r=await overview(b('/personal-field/overview'));
      expect(r.status).toBe(200);
      const v=await r.json();
      expect(v.legacyStatus).toBe('ambiguous');
      expect(ids(v.notes)).toContain(BN);
      expect(strings(v)).not.toContain('B historic private note');
    } finally {
      await query('DELETE FROM practitioners WHERE id=$1',[extra]);
    }
  });
  it('legacy history reassignment invalidates the former member reference',async()=>{
    await query('UPDATE practitioners SET member_id=$2 WHERE id=$1',[P,A]);
    try {
      const r=await overview(b('/personal-field/overview'));
      expect(r.status).toBe(200);
      const v=await r.json();
      expect(v.legacyStatus).toBe('none');
      expect(strings(v)).not.toContain('B historic private note');
      expect(strings(v)).not.toContain('B historical event');
      expect(ids(v.notes)).toContain(BN);
    } finally{
      await query('UPDATE practitioners SET member_id=$2 WHERE id=$1',[P,B]);
    }
  });
  it('missing schema capability fails 503, never a successful empty Personal Field',async()=>{
    await query('ALTER TABLE field_notes DROP CONSTRAINT field_notes_personal_member_fk');
    try{
      const r=await overview(a('/personal-field/overview'));
      expect(r.status).toBe(503);
      expect((await r.json()).state).toBe('migration_held');
      expect((await notes(a('/personal-field/notes'))).status).toBe(503);
    }finally{
      await query('ALTER TABLE field_notes ADD CONSTRAINT field_notes_personal_member_fk FOREIGN KEY(personal_member_id) REFERENCES members(id) ON DELETE CASCADE NOT VALID');
    }
  });
  it('missing Event table yields explicit unavailable, not fabricated empty history',async()=>{
    await query('ALTER TABLE field_events RENAME TO field_events_unavailable');
    try{
      const r=await overview(a('/personal-field/overview'));
      expect(r.status).toBe(503);
      expect((await r.json()).error).toBe('Personal Field temporarily unavailable');
    }finally{
      await query('ALTER TABLE field_events_unavailable RENAME TO field_events');
    }
  });
  it('auth database read failure yields 503 and discloses no session token',async()=>{
    await query('ALTER TABLE auth_sessions RENAME TO auth_sessions_offline');
    try{
      const r=await overview(a('/personal-field/overview'));
      expect(r.status).toBe(503);
      const message=strings(await r.json());
      expect(message).not.toContain('g2e-session-A');
      expect(message).not.toContain('auth_sessions_offline');
    }finally{
      await query('ALTER TABLE auth_sessions_offline RENAME TO auth_sessions');
    }
  });
  it('revoked session cannot write or read; no destructive API is exported',async()=>{
    await query("UPDATE auth_sessions SET revoked=TRUE WHERE session_token='g2e-session-A'");
    expect((await overview(a('/personal-field/overview'))).status).toBe(401);
    expect((await createNote(a('/personal-field/notes','POST',
      {section:'alive',body:'should never write'}))).status).toBe(401);
    expect((await notes(a('/personal-field/notes'))).status).toBe(401);
    const noteModule=await import('@/app/api/ganesha/personal-field/notes/[id]/route');
    const attentionModule=await import('@/app/api/ganesha/personal-field/attention/[id]/route');
    expect('DELETE' in noteModule).toBe(false);
    expect('DELETE' in attentionModule).toBe(false);
  });
});
