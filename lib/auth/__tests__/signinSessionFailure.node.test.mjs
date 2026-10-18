import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import Module from 'node:module';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const deps=process.env.AUTH_FIXTURE_DEPS;
assert.ok(deps,'AUTH_FIXTURE_DEPS must reference installed local toolchain');
const require=createRequire(import.meta.url);
const ts=require(path.join(deps,'typescript'));
const {NextRequest,NextResponse}=require(path.join(deps,'next/server'));
function load(filename,imports){
 const full=path.join(root,filename);
 const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{
  fileName:full,compilerOptions:{
    target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true
  }
 }).outputText;
 const mod=new Module.Module(full+'.test.cjs');
 mod.filename=full+'.test.cjs';mod.paths=[];
 mod.require=id=>{
  if(imports.has(id))return imports.get(id);
  throw Error('Unexpected import '+id);
 };
 mod._compile(code,mod.filename);
 return mod.exports;
}
function fixture({noMember=false,wrongPassword=false,failCreate=false,failCookies=false,denyRateLimit=false}={}){
 const events={
  sql:[], audits:[],created:0, sessionCookie:0,accessCookie:0,
  cookieDeletes:[],revoked:[],reset:0,
 };
 const fakeMember={
  id:'11111111-1111-4111-8111-111111111111',
  username:'fictional-review-member',password_hash:'bcrypt-fixture',
  name:'A fictional account',preferred_name:'Review account',
  tier:'free',roles:['member'],subscription_active:false,
 };
 const query=async(sql,params)=>{
  events.sql.push({sql,params});
  if(sql.includes('FROM members')&&sql.includes('WHERE LOWER(username)')){
   return {rows:noMember?[]:[fakeMember]};
  }
  if(sql.includes('UPDATE members SET last_sign_in'))return {rows:[],rowCount:1};
  throw Error('Unexpected query: '+sql.slice(0,90));
 };
 const ctxCookies={
  delete:name=>events.cookieDeletes.push(name)
 };
 const imports=new Map([
  ['next/server',{NextRequest,NextResponse}],
  ['next/headers',{cookies:async()=>ctxCookies}],
  ['@/lib/db/postgres',{query}],
  ['@/lib/auth/passwordUtils',{
   verifyPassword:async()=>({ok:!wrongPassword,needsUpgrade:false}),
  }],
  ['@/lib/auth/serverSessions',{
   createSession:async()=>{
    events.created++;
    if(failCreate)throw Error('fixture SQL insert failure');
    return{
     id:'fictional-session-1',memberId:fakeMember.id,
     sessionToken:'fictional-never-production-token',
     expiresAt:new Date(Date.now()+30*86400000)
    };
   },
   setSessionCookie:async()=>{events.sessionCookie++;},
   setAccessCookies:async()=>{
    events.accessCookie++;
    if(failCookies)throw Error('fixture cookie-delivery failure');
   },
   revokeSession:async(id,reason)=>{events.revoked.push({id,reason});return true;}
  }],
  ['@/lib/security/authAudit',{logAuthEvent:async(entry)=>{events.audits.push(entry);return{persisted:true}}}],
  ['@/lib/stellium/clients',{resolveMemberDisplayName:member=>member.preferred_name}],
  ['@/lib/auth/rateLimiter',{
   checkRateLimit:async()=>({
    allowed:!denyRateLimit,remainingAttempts:3,blockedUntil:null,
    retryAfterSeconds:null
   }),
   resetRateLimit:async()=>{events.reset++;},
   getClientIP:()=> '127.0.0.1',
   buildRateLimitHeaders:()=>({'Retry-After':'300'})
  }]
 ]);
 const api=load('app/api/members/signin/route.ts',imports);
 const request=(data={})=>new NextRequest(
  'http://127.0.0.1:3822/api/members/signin',{
   method:'POST',
   headers:{'content-type':'application/json',origin:'http://127.0.0.1:3822'},
   body:JSON.stringify({username:'fictional-review-member',password:'not-a-real-user-password',...data})
  }
 );
 return {api,events,request};
}

test('wrong password refuses before durable session write',async()=>{
 const {api,events,request}=fixture({wrongPassword:true});
 const response=await api.POST(request());
 assert.equal(response.status,401);
 assert.equal(events.created,0);
 assert.equal(events.reset,0);
 assert.equal(events.audits[0]?.result,'failure');
});
test('unknown username refuses identically and does not issue a session',async()=>{
 const {api,events,request}=fixture({noMember:true});
 const response=await api.POST(request());
 assert.equal(response.status,401);
 assert.equal(events.created,0);
 assert.equal(events.audits[0]?.result,'failure');
});
test('rate limiter denial prevents member query or login attempts',async()=>{
 const {api,events,request}=fixture({denyRateLimit:true});
 const response=await api.POST(request());
 assert.equal(response.status,429);
 assert.equal(events.sql.length,0);
 assert.equal(events.created,0);
});
test('durable session creation failure returns 503, never success or a token',async()=>{
 const {api,events,request}=fixture({failCreate:true});
 const res=await api.POST(request());
 const payload=await res.json();
 assert.equal(res.status,503);
 assert.equal(payload.success,false);
 assert.equal(payload.code,'SESSION_ESTABLISHMENT_FAILED');
 assert.ok(!JSON.stringify(payload).includes('fictional-never-production-token'));
 assert.equal(events.created,1);
 assert.equal(events.sessionCookie,0);
 assert.equal(events.accessCookie,0);
 assert.equal(events.reset,0);
 assert.equal(events.revoked.length,0);
 assert.equal(events.audits.at(-1).result,'failure');
 assert.equal(events.audits.at(-1).action,'signin_failed');
 for(const name of ['maia_session','maia_member_id','maia_tier','maia_roles']){
  assert.ok(events.cookieDeletes.includes(name));
  assert.equal(res.cookies.get(name)?.value,'');
 }
});
test('partial cookie failure revokes created session and expires partial cookies',async()=>{
 const {api,events,request}=fixture({failCookies:true});
 const res=await api.POST(request());
 assert.equal(res.status,503);
 assert.equal((await res.json()).success,false);
 assert.equal(events.created,1);
 assert.equal(events.sessionCookie,1);
 assert.equal(events.accessCookie,1);
 assert.deepEqual(events.revoked,[{
  id:'fictional-session-1',reason:'signin_cookie_establishment_failed'
 }]);
 assert.equal(events.reset,0);
 for(const name of ['maia_session','maia_member_id','maia_tier','maia_roles']){
  assert.ok(events.cookieDeletes.includes(name));
  assert.equal(res.cookies.get(name)?.value,'');
 }
});
test('only fully established session returns 200 and bearer for Safari/iOS',async()=>{
 const {api,events,request}=fixture();
 const res=await api.POST(request());
 const data=await res.json();
 assert.equal(res.status,200);
 assert.equal(data.success,true);
 assert.equal(data.session.token,'fictional-never-production-token');
 assert.equal(data.memberId,'11111111-1111-4111-8111-111111111111');
 assert.equal(events.created,1);
 assert.equal(events.sessionCookie,1);
 assert.equal(events.accessCookie,1);
 assert.equal(events.revoked.length,0);
 assert.equal(events.reset,1);
 assert.equal(events.audits.at(-1).result,'success');
});
