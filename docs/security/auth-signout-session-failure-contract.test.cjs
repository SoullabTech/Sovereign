/**
 * Auth security candidate: isolated, zero-network failure-contract unit tests.
 * Executes transpiled real signin/signout route functions with explicit fake
 * dependencies; does NOT prove production DB outage or native-app behavior.
 * Run: node --test docs/security/auth-signout-session-failure-contract.test.cjs
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const ts=require(process.env.AUTH_TEST_DEPS ? path.join(process.env.AUTH_TEST_DEPS,'typescript') : 'typescript');
const root=path.resolve(__dirname,'../..');
function actual(relative,imports){
 const f=path.join(root,relative);
 const out=ts.transpileModule(fs.readFileSync(f,'utf8'),{
  fileName:f,compilerOptions:{
   target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
   esModuleInterop:true,isolatedModules:true
  }
 }).outputText;
 const m=new Module.Module(f+'.isolation.cjs');m.filename=f+'.isolation.cjs';m.paths=[];
 m.require=id=>{
  if(imports.has(id))return imports.get(id);
  throw Error('Unapproved test import: '+id);
 };
 m._compile(out,m.filename);
 return m.exports;
}
function fakeNextResponse(){
 return {json:(body,options={})=>({
  body,status:options.status||200,headers:options.headers||{}
 })};
}
const member={
 id:'11111111-1111-4111-8111-111111111111',
 username:'fixture_founder',password_hash:'redacted-unit-only',
 name:'Fictional author',preferred_name:'Fictional founder',
 tier:'free',roles:['member']
};
function signinHarness(mode='ok',revokeOk=true){
 const calls={queries:[],revokes:[],cookieClears:[],audits:[]};
 const session={id:'unit-session-id',sessionToken:'synthetic-token-no-authority',
  expiresAt:new Date(Date.now()+360000),memberId:member.id};
 const imports=new Map([
  ['next/server',{NextResponse:fakeNextResponse()}],
  ['next/headers',{cookies:async()=>({set:(name,value)=>{
    calls.cookieClears.push({name,value});
  }})}],
  ['@/lib/db/postgres',{query:async(sql)=>{
   calls.queries.push(sql);
   if(sql.includes('FROM members'))return {rows:[member]};
   if(sql.includes('UPDATE members'))return {rowCount:1};
   throw Error('Unexpected test query');
  }}],
  ['@/lib/auth/passwordUtils',{verifyPassword:async()=>({ok:true,needsUpgrade:false})}],
  ['@/lib/auth/serverSessions',{
   createSession:async()=>{if(mode==='fail-insert')throw Error('Synthetic DB insert failure');return session},
   setSessionCookie:async()=>{if(mode==='fail-cookie')throw Error('Synthetic cookie failure')},
   setAccessCookies:async()=>{if(mode==='fail-access-cookie')throw Error('Synthetic access-cookie failure')},
   revokeSession:async(id,reason)=>{
    calls.revokes.push({id,reason});
    return revokeOk;
   }
  }],
  ['@/lib/security/authAudit',{logAuthEvent:async entry=>{calls.audits.push(entry);return {persisted:true}}}],
  ['@/lib/stellium/clients',{resolveMemberDisplayName:m=>m.preferred_name}],
  ['@/lib/auth/rateLimiter',{
   getClientIP:()=> '127.0.0.1',
   checkRateLimit:async()=>({allowed:true}),
   resetRateLimit:async()=>{},
   buildRateLimitHeaders:()=>({})
  }]
 ]);
 const post=actual('app/api/members/signin/route.ts',imports).POST;
 const req={headers:new Headers({'user-agent':'fictional-unit'}),json:async()=>({
  username:'fictional',password:'unit-fixture-not-a-real-password'
 })};
 return {calls,request:req,post};
}
test('session creation failure returns 503, no success and no token',async()=>{
 const h=signinHarness('fail-insert');
 const r=await h.post(h.request);
 assert.equal(r.status,503);
 assert.equal(r.body.success,false);
 assert.equal('session' in r.body,false);
 assert.equal(h.calls.audits.at(-1)?.result,'failure');
 assert.equal(h.calls.queries.some(q=>q.includes('UPDATE members')),false);
 assert.equal(h.calls.revokes.length,0);
});
test('cookie issuance failure compensates by revoking and clearing any partial cookies',async()=>{
 for(const mode of ['fail-cookie','fail-access-cookie']){
  const h=signinHarness(mode);
  const r=await h.post(h.request);
  assert.equal(r.status,503,mode);
  assert.equal(r.body.success,false);
  assert.equal('session' in r.body,false);
  assert.equal(h.calls.revokes.length,1);
  assert.equal(h.calls.revokes[0].reason,'incomplete_signin');
  assert.deepEqual(h.calls.cookieClears.map(x=>x.name),[
   'maia_session','maia_member_id','maia_tier','maia_roles'
  ]);
 }
});
test('failed server-session compensation still cannot produce success',async()=>{
 const h=signinHarness('fail-access-cookie',false);
 const r=await h.post(h.request);
 assert.equal(r.status,503);
 assert.equal(r.body.success,false);
 assert.ok(!r.body.session);
 assert.equal(h.calls.revokes.length,1);
 assert.equal(h.calls.cookieClears.length,4);
});
test('successful fixture session remains accepted after both cookie steps',async()=>{
 const h=signinHarness();
 const r=await h.post(h.request);
 assert.equal(r.status,200);
 assert.equal(r.body.success,true);
 assert.equal(r.body.session.token,'synthetic-token-no-authority');
 assert.equal(h.calls.revokes.length,0);
 assert.equal(h.calls.audits.at(-1)?.result,'success');
});
function signoutHarness({origin='https://fictional.invalid',host='fictional.invalid',
 site='same-origin',token='unit-test-token',throwDb=false,rowCount=1}={}){
 const calls={queries:0,cleared:[],reads:0};
 const headers=new Headers({Origin:origin,Host:host,'Sec-Fetch-Site':site});
 const req={headers,nextUrl:new URL('https://fictional.invalid/api/members/signout')};
 const imports=new Map([
  ['next/server',{NextResponse:fakeNextResponse()}],
  ['next/headers',{cookies:async()=>({
   get:name=>{calls.reads++;return token?{value:token}:undefined},
   set:(name,value)=>calls.cleared.push({name,value})
  })}],
  ['@/lib/db/postgres',{query:async()=>{
   calls.queries++;
   if(throwDb)throw Error('Synthetic DB outage');
   return {rowCount};
  }}]
 ]);
 const prev=process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
 process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS='https://fictional.invalid';
 const post=actual('app/api/members/signout/route.ts',imports).POST;
 if(prev===undefined)delete process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
 else process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=prev;
 return {post,req,calls};
}
async function doSignout(opts){
 const h=signoutHarness(opts);
 const prev=process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
 process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS='https://fictional.invalid';
 try{return {h,response:await h.post(h.req)}}finally{
  if(prev===undefined)delete process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
  else process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=prev;
 }
}
test('invalid origin refuses before touching session or database',async()=>{
 for(const opts of [{origin:'null'},{origin:'https://other.invalid'},
    {origin:'https://fictional.invalid',host:'attacker.invalid'},
    {site:'same-site'},{site:'cross-site'}]){
  const {h,response}=await doSignout(opts);
  assert.equal(response.status,403);
  assert.equal(h.calls.reads,0);
  assert.equal(h.calls.queries,0);
  assert.equal(h.calls.cleared.length,0);
 }
});
test('database outage returns 503 while clearing all local cookies, never claiming revocation',async()=>{
 const {h,response}=await doSignout({throwDb:true});
 assert.equal(response.status,503);
 assert.equal(response.body.success,false);
 assert.equal(response.body.localCookiesCleared,true);
 assert.equal(response.body.serverSessionRevoked,false);
 assert.equal(h.calls.queries,1);
 assert.deepEqual(h.calls.cleared.map(x=>x.name),['maia_session','maia_member_id','maia_tier','maia_roles']);
});
test('confirmed SQL revocation reports true; stale/missing tokens never claim new revocation',async()=>{
 let result=await doSignout({rowCount:1});
 assert.equal(result.response.status,200);
 assert.equal(result.response.body.serverSessionRevoked,true);
 result=await doSignout({rowCount:0});
 assert.equal(result.response.status,200);
 assert.equal(result.response.body.serverSessionRevoked,false);
 result=await doSignout({token:null});
 assert.equal(result.response.status,200);
 assert.equal(result.response.body.serverSessionRevoked,false);
 assert.equal(result.h.calls.queries,0);
});

[executed on device: Kellys-Mac-Studio.local (ab502e5b-916c-4777-acf5-0487f2771bd4)]