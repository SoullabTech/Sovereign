/**
 * E010 Admin Cockpit: method-specific Class A authorization (FICTIONAL).
 * Uses real proxy/access matrix, member auth resolver, admin auth GET/POST,
 * and settings GET/POST, with mocked in-memory PostgreSQL rows only.
 * No real password, user ID, production DB, admin session or deploy call.
 */
import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';
import { checkAccess, matchRule } from '@/config/accessMatrix';
import { proxy } from '@/proxy';
import { GET as ownerGET, POST as passwordPOST } from '@/app/api/admin/auth/route';
import { GET as settingsGET, POST as settingsPOST } from '@/app/api/admin/settings/route';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

const db = query as jest.Mock;
const SHARED = 'fictional-review-only-admin-password-never-real';
const FOUNDER = 'f1111111-1111-4111-8111-111111111111';
const CTO = 'c2222222-2222-4222-8222-222222222222';
const OTHER = '33333333-3333-4333-8333-333333333333';

type Persona = { id: string, roles: string[], adminRole: string | null, active?: boolean };
const fixture:Record<string,Persona>={
 'fixture-founder-both':{id:FOUNDER,roles:['member','admin'],adminRole:'founder'},
 'fixture-founder-role-only':{id:FOUNDER,roles:['member'],adminRole:'founder'},
 'fixture-cto-role-only':{id:CTO,roles:['member'],adminRole:'cto'},
 'fixture-cto-both':{id:CTO,roles:['member','admin'],adminRole:'cto'},
 'fixture-app-admin-only':{id:OTHER,roles:['member','admin'],adminRole:null},
 'fixture-ordinary-member':{id:OTHER,roles:['member'],adminRole:null},
 'fixture-revoked-founder':{id:FOUNDER,roles:['member','admin'],adminRole:'founder',active:false},
 'fixture-expired-founder':{id:FOUNDER,roles:['member','admin'],adminRole:'founder',active:false},
};
const settingsRow = {
 key:'fictional-ui-only',value:{enabled:false},description:'fictional',
 updated_at:null,updated_by:'fictional-admin'
};
function fakeSql(sql:string, params:unknown[]=[]){
 const token=String(params[0]??'');
 const candidate=fixture[token];
 const row=candidate?.active===false ? undefined : candidate;
 if(sql.includes('SELECT s.member_id, m.tier, m.roles'))return Promise.resolve({
   rows:row?[{member_id:row.id,tier:'free',roles:row.roles}]:[],
 });
 if(sql.includes('SELECT m.id, m.admin_role FROM members m'))return Promise.resolve({
   rows:row?.adminRole?[{id:row.id,admin_role:row.adminRole}]:[],
 });
 if(sql.includes('INSERT INTO admin_access_log'))return Promise.resolve({rows:[],rowCount:1});
 if(sql.includes('FROM system_settings'))return Promise.resolve({rows:[settingsRow]});
 if(sql.includes('INSERT INTO system_settings'))return Promise.resolve({rows:[settingsRow],rowCount:1});
 throw new Error('REFUSED_UNEXPECTED_SQL_IN_REVIEW_FIXTURE');
}
let counter=0;
function request(path:string,opts:{
 token?:string, headerToken?:string, passwordHeader?:string,
 bearerPassword?:string, method?:'GET'|'POST', body?:unknown,
 forgedRoles?:boolean,memberClaim?:string,
}={}):NextRequest{
 const hdr:Record<string,string>={
  host:'soullab.life','x-forwarded-for':'192.0.2.'+(++counter%230+10),
 };
 if(opts.token)hdr.cookie='maia_session='+opts.token;
 if(opts.headerToken)hdr['x-session-token']=opts.headerToken;
 if(opts.passwordHeader)hdr['x-admin-password']=opts.passwordHeader;
 if(opts.bearerPassword)hdr.authorization='Bearer '+opts.bearerPassword;
 if(opts.forgedRoles) {
  hdr['x-access-roles']='admin';hdr['x-maia-roles']='admin';
 }
 if(opts.memberClaim)hdr['x-member-id']=opts.memberClaim;
 if(opts.body!==undefined)hdr['content-type']='application/json';
 return new NextRequest('https://soullab.life'+path,{
  method:opts.method||'GET',headers:hdr,
  ...(opts.body!==undefined?{body:JSON.stringify(opts.body)}:{})
 });
}
async function checkOwner(token:string,opts:Parameters<typeof request>[1]={}){
 const r=request('/api/admin/auth',{token,...opts});
 const edge=await proxy(r);
 const response=await ownerGET(request('/api/admin/auth',{token,...opts}));
 return {edge:edge.status,status:response.status,body:await response.json(),headers:response.headers};
}
describe('Review-only actual-method legacy admin routing',()=>{
 const oldMode=process.env.ACCESS_CONTROL_MODE;
 const oldPassword=process.env.LABTOOLS_ADMIN_PASSWORD;
 beforeAll(()=>{
  process.env.ACCESS_CONTROL_MODE='strict';
  process.env.LABTOOLS_ADMIN_PASSWORD=SHARED;
 });
 afterAll(()=>{
  if(oldMode===undefined)delete process.env.ACCESS_CONTROL_MODE;
  else process.env.ACCESS_CONTROL_MODE=oldMode;
  if(oldPassword===undefined)delete process.env.LABTOOLS_ADMIN_PASSWORD;
  else process.env.LABTOOLS_ADMIN_PASSWORD=oldPassword;
 });
 beforeEach(()=>{db.mockReset().mockImplementation(fakeSql);});

 it('GET and POST share one nonpublic member-authenticated exact proxy rule; route controls verb privilege',()=>{
   expect(matchRule('/api/admin/auth')).toMatchObject({
     exact:'/api/admin/auth',minTier:'free'
   });
   expect(matchRule('/api/admin/auth')?.rolesAnyOf).toBeUndefined();
   expect(matchRule('/api/admin/auth')?.public).not.toBe(true);
   expect(checkAccess('/api/admin/auth','free',[],false).allowed).toBe(false);
   expect(checkAccess('/api/admin/auth','free',['member'],true).allowed).toBe(true);
   expect(matchRule('/api/admin/auth-fake')).toBeNull();
 });

 it('settings remains exact nonpublic app-admin route with an independent password guard',()=>{
   expect(matchRule('/api/admin/settings')).toMatchObject({
    exact:'/api/admin/settings',minTier:'free',rolesAnyOf:['admin']
   });
   expect(matchRule('/api/admin/settings')?.public).not.toBe(true);
   expect(matchRule('/api/admin/settings-fake')).toBeNull();
 });

 it.each([
  ['founder','fixture-founder-role-only'],
  ['cto','fixture-cto-role-only']
 ])('%s verified owner without application admin app-role gets its correct GET owner status',async(role,token)=>{
   const s=await checkOwner(token);
   expect(s.edge).toBe(200);
   expect(s.status).toBe(200);
   expect(s.body).toMatchObject({isAdmin:true,via:'member',role});
   expect(s.headers.get('cache-control')).toContain('no-store');
 });

 it.each([
  ['founder','fixture-founder-both'],
  ['cto','fixture-cto-both']
 ])('%s owner with app admin also gets correct GET status',async(role,token)=>{
   const s=await checkOwner(token);
   expect(s.edge).toBe(200);
   expect(s.body).toMatchObject({isAdmin:true,via:'member',role});
 });

 it('application admin without valid admin_role is not falsely promoted to owner',async()=>{
   const s=await checkOwner('fixture-app-admin-only');
   expect(s.edge).toBe(200);
   expect(s.body).toEqual({isAdmin:false});
 });

 it('ordinary member gets safe no-role result, not shared-password founder spoof',async()=>{
   const s=await checkOwner('fixture-ordinary-member',{
    passwordHeader:SHARED,
   });
   expect(s.edge).toBe(200);
   expect(s.body).toEqual({isAdmin:false});
 });

 it('Bearer legacy shared password does not claim a member founder/cto role',async()=>{
   const s=await checkOwner('fixture-ordinary-member',{
    bearerPassword:SHARED,
   });
   expect(s.body).toEqual({isAdmin:false});
 });

 it('anonymous shared password alone is rejected by proxy; handler returns false',async()=>{
   const r=request('/api/admin/auth',{passwordHeader:SHARED});
   expect((await proxy(r)).status).toBe(401);
   const resp=await ownerGET(request('/api/admin/auth',{passwordHeader:SHARED}));
   expect(resp.status).toBe(200);
   expect(await resp.json()).toEqual({isAdmin:false});
 });

 it('cookie and header disagree: current founder cookie wins over stale CTO header',async()=>{
   const s=await checkOwner('fixture-founder-both',{
     headerToken:'fixture-cto-both'
   });
   expect(s.body).toMatchObject({isAdmin:true,role:'founder'});
 });

 it('cookie and header disagree: current ordinary member cannot use stale founder header',async()=>{
   const s=await checkOwner('fixture-ordinary-member',{
     headerToken:'fixture-founder-both',passwordHeader:SHARED
   });
   expect(s.body).toEqual({isAdmin:false});
 });

 it('Safari header-only founder/CTO owner GET is admitted while anonymous stays denied',async()=>{
   const r=request('/api/admin/auth',{headerToken:'fixture-cto-role-only'});
   expect((await proxy(r)).status).toBe(200);
   const res=await ownerGET(request('/api/admin/auth',{headerToken:'fixture-cto-role-only'}));
   expect(await res.json()).toMatchObject({isAdmin:true,role:'cto',via:'member'});
 });

 it('revoked and expired synthetic sessions cannot get member admin roles',async()=>{
   for(const token of ['fixture-revoked-founder','fixture-expired-founder']){
     expect((await proxy(request('/api/admin/auth',{token}))).status).toBe(401);
     const resp=await ownerGET(request('/api/admin/auth',{token}));
     expect(await resp.json()).toEqual({isAdmin:false});
   }
 });

 it('forged memberId assertion cannot create an owner session',async()=>{
   const r=request('/api/admin/auth',{
      token:'fixture-ordinary-member',memberClaim:FOUNDER,forgedRoles:true
   });
   expect((await proxy(r)).status).toBe(401);
   const resp=await ownerGET(request('/api/admin/auth',{
     token:'fixture-ordinary-member',memberClaim:FOUNDER,forgedRoles:true
   }));
   expect(await resp.json()).toEqual({isAdmin:false});
 });

 it.each(['fixture-founder-role-only','fixture-cto-role-only','fixture-ordinary-member'])(
 'POST with valid shared password refuses session without application-admin role: %s',async token=>{
   const requestObj=request('/api/admin/auth',{
     token,method:'POST',body:{password:SHARED}
   });
   expect((await proxy(requestObj)).status).toBe(200);
   const r=await passwordPOST(request('/api/admin/auth',{
     token,method:'POST',body:{password:SHARED}
   }));
   expect(r.status).toBe(403);
 });

 it('anonymous POST with correct shared password is denied before password comparison',async()=>{
   expect((await proxy(request('/api/admin/auth',{
     method:'POST',body:{password:SHARED}
   }))).status).toBe(401);
   const r=await passwordPOST(request('/api/admin/auth',{
     method:'POST',body:{password:SHARED}
   }));
   expect(r.status).toBe(401);
 });

 it('verified app-admin with wrong shared password is denied by old password contract',async()=>{
   const opts={token:'fixture-app-admin-only',method:'POST' as const,body:{password:'fictional-wrong-password'}};
   expect((await proxy(request('/api/admin/auth',opts))).status).toBe(200);
   const r=await passwordPOST(request('/api/admin/auth',opts));
   expect(r.status).toBe(401);
 });

 it('verified application admin with correct shared password uses existing token format, not a DB member session',async()=>{
   const opts={token:'fixture-app-admin-only',method:'POST' as const,body:{password:SHARED}};
   expect((await proxy(request('/api/admin/auth',opts))).status).toBe(200);
   const r=await passwordPOST(request('/api/admin/auth',opts));
   expect(r.status).toBe(200);
   const data=await r.json();
   expect(data.success).toBe(true);
   expect(typeof data.token).toBe('string');
   expect(data.token).not.toBe(SHARED);
   const owner=await ownerGET(request('/api/admin/auth',{headerToken:data.token}));
   expect(await owner.json()).toEqual({isAdmin:false});
 });

 it('existing shared-password POST matches current founder cookie rather than stale app-admin header',async()=>{
   const opts={
     token:'fixture-founder-role-only',headerToken:'fixture-app-admin-only',
     method:'POST' as const,body:{password:SHARED}
   };
   expect((await proxy(request('/api/admin/auth',opts))).status).toBe(200);
   expect((await passwordPOST(request('/api/admin/auth',opts))).status).toBe(403);
 });

 it('verified application admin with cookie and password reaches existing settings GET',async()=>{
   const opts={token:'fixture-founder-both',passwordHeader:SHARED};
   expect((await proxy(request('/api/admin/settings',opts))).status).toBe(200);
   const r=await settingsGET(request('/api/admin/settings',opts));
   expect(r.status).toBe(200);
   expect((await r.json()).settings).toMatchObject([settingsRow]);
 });

 it('verified application admin without shared password is refused by settings handler',async()=>{
   const opts={token:'fixture-founder-both'};
   expect((await proxy(request('/api/admin/settings',opts))).status).toBe(200);
   expect((await settingsGET(request('/api/admin/settings',opts))).status).toBe(401);
 });

 it('settings POST is not reached by owner without app-admin role even with password',async()=>{
   const opts={
     token:'fixture-founder-role-only',passwordHeader:SHARED,
     method:'POST' as const,body:{key:'fictional-ui-only',value:{enabled:false}}
   };
   expect((await proxy(request('/api/admin/settings',opts))).status).toBe(403);
 });

 it('verified app-admin and shared password pass existing fictional settings write',async()=>{
   const opts={
     token:'fixture-founder-both',passwordHeader:SHARED,
     method:'POST' as const,body:{key:'fictional-ui-only',value:{enabled:false},updatedBy:'fictional'}
   };
   expect((await proxy(request('/api/admin/settings',opts))).status).toBe(200);
   const response=await settingsPOST(request('/api/admin/settings',opts));
   expect(response.status).toBe(200);
   expect(db.mock.calls.some(([q]:[string])=>String(q).includes('INSERT INTO system_settings'))).toBe(true);
 });

 it('session cookie but bad roles does not become admin due to forged headers or password',async()=>{
   const opts={token:'fixture-ordinary-member',passwordHeader:SHARED,forgedRoles:true};
   expect((await proxy(request('/api/admin/settings',opts))).status).toBe(403);
 });

 it('legacy method split has no effect on Reflect status route outer role requirements',()=>{
   const reflect=matchRule('/api/admin/reflect-release-status');
   expect(reflect).toMatchObject({
      exact:'/api/admin/reflect-release-status',minTier:'free'
   });
   expect(reflect?.rolesAnyOf).toBeUndefined();
   expect(matchRule('/api/admin/settings/anything')).toBeNull();
 });
});
