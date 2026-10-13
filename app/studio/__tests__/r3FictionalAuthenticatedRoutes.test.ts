/**
 * PRO-STUDIO-01-A / R1b-R3: REAL AUTH + GET ROUTE SOURCE with FICTIONAL
 * in-memory PostgreSQL results. No real database, network, member or client
 * records, no schema writes, and no production or billing integration.
 *
 * Intentionally do NOT mock getMemberIdFromRequest / getCurrentPractitioner /
 * getPractitionerIdForMember / getCurrentSession / GET route handlers.
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { renderToStaticMarkup } from 'react-dom/server';
import db, { query } from '@/lib/db/postgres';
import { GET as clientsGET } from '@/app/api/studio/clients/route';
import { GET as bookingsGET } from '@/app/api/studio/bookings/route';
import { GET as whoamiGET } from '@/app/api/studio/whoami/route';
import ReflectArrival from '@/app/pro-studio/reflect/page';
import { readStudioResource, practiceHomeStanding } from '@/lib/studio/practiceHomeLoad';
import { selectPracticeIdentity, selectPracticeClients, selectPracticeBookings } from '@/lib/studio/practiceHomeResponses';

jest.mock('@/lib/db/postgres', () => {
  const q = jest.fn();
  return { __esModule: true, query: q, default: { query: q } };
});
jest.mock('next/headers', () => ({cookies: jest.fn()}));
jest.mock('next/navigation', () => ({redirect: jest.fn()}));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    require('react').createElement('a', {href, ...props}, children),
}));
jest.mock('@/lib/team/colabTeams', () => ({
  COLAB_TEAM_COOKIE: 'colab-team',
  resolveCurrentTeamId: jest.fn(async () => null),
}));
jest.mock('@/lib/auth/teamPermissions', () => ({
  getTeamRole: jest.fn(async () => null),
  getTeamById: jest.fn(async () => null),
}));

const MEMBER_A = 'fiction-member-a';
const MEMBER_B = 'fiction-member-b';
const MEMBER_C = 'fiction-member-no-practitioner';
const PRACTICE_A = 'fiction-practice-a';
const PRACTICE_B = 'fiction-practice-b';
const TOKENS = {
  a: 'fixture-session-a-not-secret',
  b: 'fixture-session-b-not-secret',
  c: 'fixture-session-c-not-secret',
  revoked: 'fixture-revoked',
  expired: 'fixture-expired',
};
type AuthRow = { member_id: string; token: string; revoked?: boolean; expired?: boolean };
const SESSIONS: Record<string, AuthRow> = {
  [TOKENS.a]: {member_id: MEMBER_A, token: TOKENS.a},
  [TOKENS.b]: {member_id: MEMBER_B, token: TOKENS.b},
  [TOKENS.c]: {member_id: MEMBER_C, token: TOKENS.c},
  [TOKENS.revoked]: {member_id: MEMBER_A, token: TOKENS.revoked, revoked:true},
  [TOKENS.expired]: {member_id: MEMBER_A, token: TOKENS.expired, expired:true},
};
const PRACTITIONERS: Record<string, {id:string; name:string}> = {
  [MEMBER_A]: {id:PRACTICE_A, name:'Fiction Practitioner A'},
  [MEMBER_B]: {id:PRACTICE_B, name:'Fiction Practitioner B'},
};
const FICT_CLIENT_A = {
  id:'fiction-client-a', practitioner_id:PRACTICE_A, name:'Fiction Client A',
  email:'a@example.invalid', status:'active', tier:null, tags:[], key_placements:null,
  total_revenue:'0', birth_date:null,birth_time:null,birth_location:null,
  internal_notes:null,chart_image_url:null,leadership_profile:null,client_types:[],
  last_session_at:'2026-09-20T10:00:00.000Z',next_session_at:null,total_sessions:'1',
  created_at:'2026-08-20T00:00:00.000Z',updated_at:'2026-09-20T00:00:00.000Z',
};
const FICT_CLIENT_B = {...FICT_CLIENT_A, id:'fiction-client-b', practitioner_id:PRACTICE_B,
  name:'Fiction Client B', email:'b@example.invalid'};
const FICT_BOOK_A = {
  id:'fiction-book-a', scheduled_start:'2026-11-01T12:00:00.000Z',
  scheduled_end:'2026-11-01T13:00:00.000Z', status:'scheduled',notes:null,
  practitioner_notes:null,price_cents:0,payment_status:null,google_event_id:null,
  calendar_sync_status:null, calendar_sync_error:null,calendar_disclosure:'generic',
  created_at:'2026-10-01T00:00:00.000Z',updated_at:'2026-10-01T00:00:00.000Z',
  client_id:FICT_CLIENT_A.id,service_name:'Fiction Session',duration_minutes:60,
  client_name:FICT_CLIENT_A.name,client_email:FICT_CLIENT_A.email,client_phone:null,
};
const FICT_BOOK_B = {...FICT_BOOK_A,id:'fiction-book-b',client_id:FICT_CLIENT_B.id,
  client_name:FICT_CLIENT_B.name,client_email:FICT_CLIENT_B.email};
let cookieValues: Record<string,string> = {};
let clientRows:Record<string,unknown[]> = {};
let bookingRows:Record<string,unknown[]> = {};
let failClients = false;
let failBookings = false;
let sqlReads: Array<{className:string; params:unknown[]}> = [];
const pg = query as jest.Mock;
const mockedCookies = cookies as jest.Mock;
const mockedRedirect = redirect as jest.Mock;
const fakeQuery = async (sql:string, params:unknown[] = []) => {
  if (/^\s*UPDATE auth_sessions SET last_active_at/i.test(sql)) {
    return {rows:[],rowCount:1};
  }
  if (/\bFROM auth_sessions\b/i.test(sql)) {
    const token=String(params[0]||'');
    const row=SESSIONS[token];
    const active= row && !row.revoked && !row.expired;
    sqlReads.push({className:'auth_sessions',params:['token-redacted']});
    if(!active)return {rows:[],rowCount:0};
    if (/SELECT\s+member_id/i.test(sql))
      return {rows:[{member_id:row.member_id}],rowCount:1};
    return {rows:[{
      id:'fiction-session-row',member_id:row.member_id,session_token:row.token,
      device_id:null,ip_address:null,user_agent:null,expires_at:'2099-01-01T00:00:00.000Z',
      last_active_at:'2026-10-12T00:00:00.000Z',revoked:false,
    }],rowCount:1};
  }
  if (/\bFROM practitioners p\b/i.test(sql)) {
    const member=String(params[0]);
    const p=PRACTITIONERS[member];
    sqlReads.push({className:'practitioner_identity',params:[member]});
    return {rows: p ? [{
      practitioner_id:p.id,name:p.name,slug:'fiction-'+member,
      portal_type:'generalist',enabled_modules:null,studio_mode:'practice',
    }] : [],rowCount:p?1:0};
  }
  if (/\bFROM practitioners\b/i.test(sql)) {
    const member=String(params[0]);
    const p=PRACTITIONERS[member];
    sqlReads.push({className:'practitioner_lookup',params:[member]});
    return {rows: p ? [{id:p.id}]:[],rowCount:p?1:0};
  }
  if (/\bFROM practitioner_clients c\b/i.test(sql)) {
    const pract=String(params[0]);
    sqlReads.push({className:'clients',params:[pract]});
    if(failClients)throw new Error('FICTIONAL_DATABASE_UNAVAILABLE');
    return {rows:clientRows[pract]||[],rowCount:(clientRows[pract]||[]).length};
  }
  if (/\bFROM sessions s\b/i.test(sql)) {
    const pract=String(params[0]);
    sqlReads.push({className:'bookings',params:[pract]});
    if(failBookings)throw new Error('FICTIONAL_DATABASE_UNAVAILABLE');
    return {rows:bookingRows[pract]||[],rowCount:(bookingRows[pract]||[]).length};
  }
  throw new Error('UNEXPECTED_SQL_FICTIONAL_FIXTURE_ONLY: '+sql.slice(0,65));
};
function req(url:string,token?:string,claimedMember?:string){
  const headers:Record<string,string> = {};
  if(token)headers['x-session-token']=token;
  if(claimedMember)headers['x-member-id']=claimedMember;
  return new NextRequest('http://127.0.0.1:37993'+url,{headers});
}
const resource=async<T>(route:(r:NextRequest)=>Promise<Response>,url:string,token:string,
 select:(input:unknown)=>T|null) =>
  readStudioResource(async()=>route(req(url,token)),url,select);
beforeEach(()=>{
  jest.clearAllMocks();
  cookieValues={};clientRows={[PRACTICE_A]:[FICT_CLIENT_A],[PRACTICE_B]:[FICT_CLIENT_B]};
  bookingRows={[PRACTICE_A]:[FICT_BOOK_A],[PRACTICE_B]:[FICT_BOOK_B]};
  failClients=false;failBookings=false;sqlReads=[];
  pg.mockImplementation(fakeQuery);
  (db.query as jest.Mock).mockImplementation(fakeQuery);
  mockedCookies.mockImplementation(async()=>({
    get:(key:string)=>cookieValues[key] ? {value:cookieValues[key]} : undefined,
  }));
  mockedRedirect.mockImplementation(()=>{throw Error('NEXT_REDIRECT');});
});
describe('R3 real auth resolvers + GET APIs, with only fictitious SQL fixture',()=>{
  test('A authenticated header session yields identity and A-scoped client and booking',async()=>{
    const i=await resource(whoamiGET,'/api/studio/whoami',TOKENS.a,selectPracticeIdentity);
    const c=await resource(clientsGET,'/api/studio/clients',TOKENS.a,selectPracticeClients);
    const b=await resource(bookingsGET,'/api/studio/bookings?limit=20',TOKENS.a,selectPracticeBookings);
    expect(practiceHomeStanding(i,c,b)).toBe('ready');
    if(i.standing!=='ready'||c.standing!=='ready'||b.standing!=='ready')throw Error('Fixture unexpectedly held');
    expect(i.value.memberId).toBe(MEMBER_A);expect(i.value.practitionerId).toBe(PRACTICE_A);
    expect(c.value.map(x=>x.id)).toEqual([FICT_CLIENT_A.id]);
    expect(b.value.map(x=>x.id)).toEqual([FICT_BOOK_A.id]);
    expect(sqlReads.filter(x=>x.className==='clients').map(x=>x.params[0])).toEqual([PRACTICE_A]);
    expect(sqlReads.filter(x=>x.className==='bookings').map(x=>x.params[0])).toEqual([PRACTICE_A]);
  });
  test('Separate valid B session cannot see A client or booking',async()=>{
    const c=await resource(clientsGET,'/api/studio/clients',TOKENS.b,selectPracticeClients);
    const b=await resource(bookingsGET,'/api/studio/bookings',TOKENS.b,selectPracticeBookings);
    expect(c.standing).toBe('ready');expect(b.standing).toBe('ready');
    if(c.standing==='ready')expect(c.value.map(x=>x.id)).toEqual([FICT_CLIENT_B.id]);
    if(b.standing==='ready')expect(b.value.map(x=>x.id)).toEqual([FICT_BOOK_B.id]);
    expect(sqlReads.filter(x=>x.className==='clients').map(x=>x.params[0])).toEqual([PRACTICE_B]);
    expect(sqlReads.filter(x=>x.className==='bookings').map(x=>x.params[0])).toEqual([PRACTICE_B]);
  });
  test('Verified empty clients and bookings are genuine Practice zero-state',async()=>{
    clientRows[PRACTICE_A]=[];bookingRows[PRACTICE_A]=[];
    const i=await resource(whoamiGET,'/api/studio/whoami',TOKENS.a,selectPracticeIdentity);
    const c=await resource(clientsGET,'/api/studio/clients',TOKENS.a,selectPracticeClients);
    const b=await resource(bookingsGET,'/api/studio/bookings',TOKENS.a,selectPracticeBookings);
    expect(practiceHomeStanding(i,c,b)).toBe('ready');
    if(c.standing==='ready')expect(c.value).toEqual([]);
    if(b.standing==='ready')expect(b.value).toEqual([]);
  });
  test('DB failure on clients yields unavailable, never false zero state',async()=>{
    failClients=true;
    const i=await resource(whoamiGET,'/api/studio/whoami',TOKENS.a,selectPracticeIdentity);
    const c=await resource(clientsGET,'/api/studio/clients',TOKENS.a,selectPracticeClients);
    const b=await resource(bookingsGET,'/api/studio/bookings',TOKENS.a,selectPracticeBookings);
    expect(c.standing).toBe('unavailable');
    expect(practiceHomeStanding(i,c,b)).toBe('unavailable');
  });
  test('DB failure on bookings yields unavailable, never false zero state',async()=>{
    failBookings=true;
    const i=await resource(whoamiGET,'/api/studio/whoami',TOKENS.a,selectPracticeIdentity);
    const c=await resource(clientsGET,'/api/studio/clients',TOKENS.a,selectPracticeClients);
    const b=await resource(bookingsGET,'/api/studio/bookings',TOKENS.a,selectPracticeBookings);
    expect(b.standing).toBe('unavailable');
    expect(practiceHomeStanding(i,c,b)).toBe('unavailable');
  });
  test('Valid session with no practitioner cannot access Practice routes',async()=>{
    expect((await clientsGET(req('/api/studio/clients',TOKENS.c))).status).toBe(401);
    expect((await bookingsGET(req('/api/studio/bookings',TOKENS.c))).status).toBe(404);
    expect((await whoamiGET(req('/api/studio/whoami',TOKENS.c))).status).toBe(403);
    expect(sqlReads.filter(x=>x.className==='clients'||x.className==='bookings')).toEqual([]);
  });
  test.each([undefined,'fixture-revoked','fixture-expired','unknown-token'])(
    'Absent/revoked/expired/unknown session %s cannot retrieve practice',
    async(token)=>{
      expect((await clientsGET(req('/api/studio/clients',token))).status).toBe(401);
      expect((await bookingsGET(req('/api/studio/bookings',token))).status).toBe(401);
      expect((await whoamiGET(req('/api/studio/whoami',token))).status).toBe(401);
      expect(sqlReads.filter(x=>x.className==='clients'||x.className==='bookings')).toEqual([]);
    },
  );
  test('Claim mismatch does not impersonate another practitioner',async()=>{
    expect((await clientsGET(req('/api/studio/clients',TOKENS.a,MEMBER_B))).status).toBe(401);
    expect((await bookingsGET(req('/api/studio/bookings',TOKENS.a,MEMBER_B))).status).toBe(401);
    expect((await whoamiGET(req('/api/studio/whoami',TOKENS.a,MEMBER_B))).status).toBe(401);
    expect(sqlReads.filter(x=>x.className==='clients'||x.className==='bookings')).toEqual([]);
  });
  test('Malformed success rows from the real GET handlers become unavailable in R2a selectors',async()=>{
    clientRows[PRACTICE_A]=[{...FICT_CLIENT_A,id:null}];
    bookingRows[PRACTICE_A]=[{...FICT_BOOK_A,scheduled_start:'0'}];
    const c=await resource(clientsGET,'/api/studio/clients',TOKENS.a,selectPracticeClients);
    const b=await resource(bookingsGET,'/api/studio/bookings',TOKENS.a,selectPracticeBookings);
    expect(c.standing).toBe('unavailable');
    expect(b.standing).toBe('unavailable');
  });
});
describe('R3 member-first Reflect server page uses actual getCurrentSession with fictional SQL',()=>{
  test('Cookie-based session permits non-practitioner member to enter Reflect',async()=>{
    cookieValues.maia_session=TOKENS.c;
    const el=await ReflectArrival();
    const html=renderToStaticMarkup(el);
    expect(html).toContain('Your work begins with you.');
    expect(html).toContain('href="/maia/encounter"');
    expect(html).not.toContain('Add your first person');
    expect(sqlReads.filter(x=>x.className==='practitioner_identity'||x.className==='clients')).toEqual([]);
  });
  test('Signed-out/revoked/expired cookie sessions redirect and never render private state',async()=>{
    for(const token of [undefined,TOKENS.revoked,TOKENS.expired]){
      cookieValues=token?{maia_session:token}:{};
      await expect(ReflectArrival()).rejects.toThrow('NEXT_REDIRECT');
    }
    expect(mockedRedirect).toHaveBeenCalledWith('/signin?next=%2Fpro-studio%2Freflect');
  });
  test('Source boundary: missing RSC cookie cannot be replaced by an API-only token in this component',async()=>{
    // This unit case exercises cookie absence, NOT an HTTP navigation header.
    // The real localhost browser/HTTP R3 witness independently checks x-session-token
    // on a document request and observes the streamed signin redirect.
    cookieValues={};
    await expect(ReflectArrival()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockedRedirect).toHaveBeenCalled();
  });
});
