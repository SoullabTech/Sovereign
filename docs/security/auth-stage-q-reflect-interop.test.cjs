/**
 * Stage Q / Reflect C0-AUTH composition falsifiers (fictional, no network).
 *
 * Loads ACTUAL PR #1870 verifiedAccess and EXACT Stage Q signout + web helper
 * from this isolated review candidate. Session DB and Next cookies are
 * fictional in-memory substitutes. Does not prove a production merge, real SQL
 * or browser behavior. Preserve PR #1870's sign-in source untouched.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const ts=require(process.env.AUTH_TEST_DEPS
 ? path.join(process.env.AUTH_TEST_DEPS,'typescript'):'typescript');
const root=path.resolve(__dirname,'../..');
const origin='https://fictional-reflect-interop.invalid';

function actual(file,imports){
 const absolute=path.join(root,file);
 const transpiled=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{
  fileName:absolute,compilerOptions:{
   target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
   isolatedModules:true,esModuleInterop:true,
  },
 }).outputText;
 const mod=new Module.Module(absolute+'.interop.cjs');
 mod.filename=absolute+'.interop.cjs';mod.paths=[];
 mod.require=id=>{
  if(imports.has(id))return imports.get(id);
  throw Error('Unapproved interop module import: '+id);
 };
 mod._compile(transpiled,mod.filename);
 return mod.exports;
}
function newCookieJar(cookie){
 const map=new Map();
 if(cookie)map.set('maia_session',cookie);
 return {
  get:name=>map.has(name)?{value:map.get(name)}:undefined,
  set:(name,value,options={})=>{
   if(options.expires instanceof Date&&options.expires.getTime()<=0)map.delete(name);
   else map.set(name,value);
  },
  has:name=>map.has(name),
 };
}
function harness({cookie=null,header=null,rows={},dbDown=false}={}){
 const sessions=new Map(Object.entries(rows).map(([token,row])=>
  [token,{member_id:row.member_id,tier:row.tier||'free',
   roles:row.roles||['member'],revoked:!!row.revoked}]));
 let outage=dbDown,reads=0,writes=0;
 const sql=async(statement,params=[])=>{
  if(outage)throw Error('Fictional SQL service unavailable');
  if(statement.includes('SELECT s.member_id')){
   reads++;
   const session=sessions.get(params[0]);
   return {rows:session&&!session.revoked?
    [{member_id:session.member_id,tier:session.tier,roles:session.roles}]:[]};
  }
  if(statement.includes('UPDATE auth_sessions')){
   writes++;
   const session=sessions.get(params[0]);
   if(!session||session.revoked)return {rowCount:0};
   session.revoked=true;
   return {rowCount:1};
  }
  throw Error('Unexpected interop query shape');
 };
 const identities=actual('lib/auth/identityAssertions.ts',new Map());
 const access=actual('lib/auth/verifiedAccess.ts',new Map([
  ['@/lib/db/postgres',{query:sql}],
  ['./identityAssertions',identities],
 ]));
 const cookies=newCookieJar(cookie);
 const NextResponse={
  json:(body,opt={})=>{
   const status=opt.status||200;
   return {status,ok:status>=200&&status<300,body,json:async()=>body};
  },
 };
 const signout=actual('app/api/members/signout/route.ts',new Map([
  ['next/server',{NextResponse}],
  ['next/headers',{cookies:async()=>cookies}],
  ['@/lib/db/postgres',{query:sql}],
 ]));
 const web=actual('lib/auth/webSignOut.ts',new Map([
  ['@/lib/http/apiBase',{clearAuthState:()=>{},isNativeCapacitor:()=>false}],
  ['@capacitor/core',{Capacitor:{isNativePlatform:()=>false}}],
 ]));
 function request(headerToken=header,claims={}){
  const headers=new Headers();
  if(headerToken)headers.set('x-session-token',headerToken);
  for(const [name,value] of Object.entries(claims))headers.set(name,value);
  return {headers,cookies,url:origin+'/api/test'};
 }
 async function post(headerToken=null,claimedOrigin=origin,extra={}){
  const headers=new Headers({Origin:claimedOrigin,Host:'fictional-reflect-interop.invalid',
   'Sec-Fetch-Site':claimedOrigin===origin?'same-origin':'cross-site'});
  if(headerToken)headers.set('x-session-token',headerToken);
  for(const [name,value] of Object.entries(extra))headers.set(name,value);
  const previous=process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
  process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=origin;
  try{return await signout.POST({headers,url:origin+'/api/members/signout',cookies})}
  finally{
   if(previous===undefined)delete process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
   else process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=previous;
  }
 }
 async function transport(route,options){
  assert.equal(route,'/api/members/signout');
  assert.equal(options.credentials,'same-origin');
  assert.equal(options.mode,'cors');
  return post(options.headers?.['x-session-token']||null);
 }
 return {access,web,cookies,request,post,transport,
  get reads(){return reads},get writes(){return writes},
  isRevoked:token=>sessions.get(token)?.revoked===true,
  setOutage:v=>{outage=v},
 };
}
const a={member_id:'11111111-1111-4111-8111-111111111111'};
const b={member_id:'22222222-2222-4222-8222-222222222222'};

test('PR1870 resolver accepts valid Safari header when stale cookie is present',async()=>{
 const h=harness({cookie:'fictional-stale',header:'fictional-valid',rows:{'fictional-valid':a}});
 const access=await h.access.deriveVerifiedAccess(h.request());
 assert.equal(access.authenticated,true);
 assert.equal(access.memberId,a.member_id);
 assert.equal(h.reads,2);
 // Stage Q helper deliberately separates conflicting transport values:
 // cookie-only attempt clears the stale cookie, then header-only revokes.
 const result=await h.web.signOutWebCredentials(h.transport,'fictional-valid');
 assert.equal(result.kind,'complete');
 assert.equal(result.confirmedRevocations,1);
 assert.equal(h.isRevoked('fictional-valid'),true);
 assert.equal(h.cookies.has('maia_session'),false);
 assert.equal((await h.access.deriveVerifiedAccess(h.request())).authenticated,false);
});

test('two valid sessions for same member authenticate then revoke separately',async()=>{
 const h=harness({cookie:'cookie-A',header:'header-B',
  rows:{'cookie-A':a,'header-B':a}});
 const before=await h.access.deriveVerifiedAccess(h.request());
 assert.equal(before.authenticated,true);
 assert.equal(before.memberId,a.member_id);
 const result=await h.web.signOutWebCredentials(h.transport,'header-B');
 assert.equal(result.kind,'complete');
 assert.equal(result.confirmedRevocations,2);
 assert.equal(h.isRevoked('cookie-A'),true);
 assert.equal(h.isRevoked('header-B'),true);
});

test('different valid member sessions fail closed in resolver and direct signout',async()=>{
 const h=harness({cookie:'cookie-A',header:'header-B',
  rows:{'cookie-A':a,'header-B':b}});
 const resolved=await h.access.deriveVerifiedAccess(h.request());
 assert.equal(resolved.authenticated,false);
 assert.equal(resolved.reason,'conflicting_credentials');
 assert.deepEqual(resolved.roles,[]);
 const out=await h.post('header-B');
 assert.equal(out.status,409);
 assert.equal(out.body.success,false);
 assert.equal(h.writes,0);
 assert.equal(h.isRevoked('cookie-A'),false);
 assert.equal(h.isRevoked('header-B'),false);
});

test('same token in cookie and header validates and revokes exactly once',async()=>{
 const h=harness({cookie:'same-fixture',header:'same-fixture',
  rows:{'same-fixture':a}});
 const resolved=await h.access.deriveVerifiedAccess(h.request());
 assert.equal(resolved.authenticated,true);
 assert.equal(h.reads,1);
 const out=await h.post('same-fixture');
 assert.equal(out.status,200);
 assert.equal(out.body.serverSessionRevoked,true);
 assert.equal(h.writes,1);
 const replay=await h.access.deriveVerifiedAccess(h.request());
 assert.equal(replay.authenticated,false);
});

test('contradictory member assertions do not survive valid session',async()=>{
 const h=harness({cookie:'cookie-A',rows:{'cookie-A':a}});
 const denied=await h.access.deriveVerifiedAccess(h.request(null,{
  'x-member-id':a.member_id,'x-maia-member-id':b.member_id,
 }));
 assert.equal(denied.authenticated,false);
 assert.equal(denied.reason,'claim_mismatch');
 assert.deepEqual(denied.roles,[]);
});

test('Origin null cannot revoke cookie or header sessions',async()=>{
 const h=harness({cookie:'cookie-A',header:'header-B',
  rows:{'cookie-A':a,'header-B':a}});
 const denied=await h.post('header-B','null');
 assert.equal(denied.status,403);
 assert.equal(h.writes,0);
 assert.equal(h.cookies.has('maia_session'),true);
});

test('database unavailability refuses verified identity and reports unrevoked 503',async()=>{
 const h=harness({cookie:'cookie-A',rows:{'cookie-A':a},dbDown:true});
 const old=console.error;let diagnostics='';
 console.error=(...words)=>{diagnostics+=words.join(' ')};
 try {
  const auth=await h.access.deriveVerifiedAccess(h.request(null));
  assert.equal(auth.authenticated,false);
  assert.equal(auth.reason,'invalid_session');
  const out=await h.post();
  assert.equal(out.status,503);
  assert.equal(out.body.serverSessionRevoked,false);
  assert.equal(out.body.localCookiesCleared,true);
  assert.equal(h.cookies.has('maia_session'),false);
  assert.doesNotMatch(diagnostics,/cookie-A/);
 }finally{console.error=old}
});

test('source-custody: PR1870 resolver and Stage Q route/helper have pinned blobs',()=>{
 const expected=new Map([
  ['lib/auth/verifiedAccess.ts','6a0821fedf2e921d2d7e7091cdb73da11d197296'],
  ['app/api/members/signout/route.ts','5ef39a974759dc5d4f60bf5bf2eea375c7e7451e'],
  ['lib/auth/webSignOut.ts','1fe1f1dda2d78216415d0c24b5e4f81963bedaca'],
  ['config/accessMatrix.ts','a93c5d3d382037a68828ee5a7423106a03adad2f'],
  ['app/api/members/signin/route.ts','4ea14beb385e83320cf6e586f990784fe47aacd8'],
 ]);
 const {execFileSync}=require('node:child_process');
 for(const [p,expectedSha] of expected){
  const actualSha=execFileSync('git',['hash-object',p],{cwd:root,encoding:'utf8'}).trim();
  assert.equal(actualSha,expectedSha,p+' source drift');
 }
});

test('strict access matrix admits only exact web signout and not member API namespace',()=>{
 const matrix=actual('config/accessMatrix.ts',new Map());
 const old=process.env.ACCESS_CONTROL_MODE;
 const oldNode=process.env.NODE_ENV;
 process.env.ACCESS_CONTROL_MODE='strict';
 process.env.NODE_ENV='production';
 try{
  const signout=matrix.checkAccess('/api/members/signout','free',[],false);
  assert.equal(signout.allowed,true);
  assert.equal(signout.rule?.exact,'/api/members/signout');
  assert.equal(signout.rule?.public,true);
  const unmapped=matrix.checkAccess('/api/members/fictional-unmapped','free',[],false);
  assert.equal(unmapped.allowed,false);
  assert.equal(unmapped.unmapped,true);
 }finally{
  if(old===undefined)delete process.env.ACCESS_CONTROL_MODE;
  else process.env.ACCESS_CONTROL_MODE=old;
  if(oldNode===undefined)delete process.env.NODE_ENV;
  else process.env.NODE_ENV=oldNode;
 }
});
