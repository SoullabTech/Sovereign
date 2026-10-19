/**
 * Stage Q / Reflect Class A — REAL disposable PostgreSQL interoperability.
 * This is NOT a deployed Next.js browser, Safari, or native-client test.
 *
 * Loads the unchanged PR #1870 dual-credential verifier and the source-pinned
 * Stage Q sign-out and client transport helper. All database rows are fictional.
 * An exact loopback/database identity and sentinel are required before import.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const crypto=require('node:crypto');
const ts=require('typescript'),{Client}=require('pg');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const expected={
  host:'127.0.0.1',port:5552,database:'stageq_reflect_fictional',
  user:'stageq_reflect_fixture',sentinel:'stageq-reflect-realpg-fiction-only',
};
if(process.env.STAGE_Q_REFLECT_REALPG!==expected.sentinel||
   process.env.PGHOST!==expected.host||Number(process.env.PGPORT)!==expected.port||
   process.env.PGDATABASE!==expected.database||process.env.PGUSER!==expected.user){
  throw Error('Refusing non-fixture PostgreSQL target');
}
const hashExpected={
  'lib/auth/verifiedAccess.ts':'6a0821fedf2e921d2d7e7091cdb73da11d197296',
  'app/api/members/signout/route.ts':'5ef39a974759dc5d4f60bf5bf2eea375c7e7451e',
  'lib/auth/webSignOut.ts':'1fe1f1dda2d78216415d0c24b5e4f81963bedaca',
  'app/api/members/signin/route.ts':'4ea14beb385e83320cf6e586f990784fe47aacd8',
  'config/accessMatrix.ts':'a93c5d3d382037a68828ee5a7423106a03adad2f',
  'database/migrations/20260119000001_auth_sessions.sql':'62d0183ac47c6b215df10e33fe760a7a1a19cc9f',
};
for(const [name,sha] of Object.entries(hashExpected)){
  const actual=execFileSync('git',['hash-object',name],{cwd:root,encoding:'utf8'}).trim();
  if(actual!==sha)throw Error('Source hash mismatch for '+name);
}
let db,activeJar;
function actual(filename,imports){
  const location=path.join(root,filename);
  const js=ts.transpileModule(fs.readFileSync(location,'utf8'),{
    fileName:location,compilerOptions:{
      target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
      esModuleInterop:true,isolatedModules:true,
    },
  }).outputText;
  const m=new Module.Module(location+'.stageq-realpg.cjs');
  m.filename=location+'.stageq-realpg.cjs';m.paths=[];
  m.require=id=>{
    if(imports.has(id))return imports.get(id);
    throw Error('Unapproved test module import: '+id);
  };
  m._compile(js,m.filename);
  return m.exports;
}
function jar(token=null){
  const values=new Map();
  if(token)values.set('maia_session',token);
  return{
    get:key=>values.has(key)?{value:values.get(key)}:undefined,
    set:(key,value,opts={})=>{
      if(opts.expires instanceof Date&&opts.expires.getTime()<=0)values.delete(key);
      else values.set(key,value);
    },
    has:key=>values.has(key),
  };
}
const query=(...args)=>db.query(...args);
const NextResponse={json:(body,options={})=>{
  const status=options.status||200;
  return{body,status,ok:status>=200&&status<300,json:async()=>body};
}};
const sessions=actual('lib/auth/serverSessions.ts',new Map([
  ['@/lib/db/postgres',{query}],
  ['./passwordUtils',{generateSecureToken:n=>crypto.randomBytes(n).toString('hex')}],
  ['next/headers',{cookies:async()=>activeJar}],
]));
const identity=actual('lib/auth/identityAssertions.ts',new Map());
const access=actual('lib/auth/verifiedAccess.ts',new Map([
  ['@/lib/db/postgres',{query}],
  ['./identityAssertions',identity],
]));
const signout=actual('app/api/members/signout/route.ts',new Map([
  ['next/server',{NextResponse}],
  ['next/headers',{cookies:async()=>activeJar}],
  ['@/lib/db/postgres',{query}],
]));
const client=actual('lib/auth/webSignOut.ts',new Map([
  ['@/lib/http/apiBase',{clearAuthState:()=>{},isNativeCapacitor:()=>false}],
  ['@capacitor/core',{Capacitor:{isNativePlatform:()=>false}}],
]));
const matrix=actual('config/accessMatrix.ts',new Map());
const origin='https://stageq-reflect-fixture.invalid';
function request(headerToken=null,claims={},url=origin+'/protected'){
  const headers=new Headers();
  if(headerToken)headers.set('x-session-token',headerToken);
  for(const [name,value] of Object.entries(claims))headers.set(name,value);
  return{headers,cookies:activeJar,url};
}
async function post(headerToken=null,claimedOrigin=origin,claimHeaders={}){
  const headers=new Headers({Origin:claimedOrigin,Host:'stageq-reflect-fixture.invalid',
    'Sec-Fetch-Site':claimedOrigin===origin?'same-origin':'cross-site'});
  if(headerToken)headers.set('x-session-token',headerToken);
  for(const [name,value] of Object.entries(claimHeaders))headers.set(name,value);
  const old=process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
  process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=origin;
  try{return await signout.POST({headers,url:origin+'/api/members/signout'})}
  finally{
    if(old===undefined)delete process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
    else process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=old;
  }
}
async function member(){
  const id=crypto.randomUUID();
  await query("INSERT INTO members(id,tier,roles) VALUES($1,'free',ARRAY['member'])",[id]);
  return id;
}
async function token(memberId){
  const session=await sessions.createSession({memberId,
    ipAddress:expected.host,userAgent:'fictional-real-postgres'});
  return session.sessionToken;
}
async function revoked(value){
  const result=await query('SELECT revoked FROM auth_sessions WHERE session_token=$1',[value]);
  return result.rows[0]?.revoked;
}
async function webTransport(route,options){
  assert.equal(route,'/api/members/signout');
  assert.equal(options.mode,'cors');
  assert.equal(options.credentials,'same-origin');
  assert.equal(options.redirect,'error');
  return post(options.headers?.['x-session-token']||null);
}
test.before(async()=>{
  db=new Client({
    host:expected.host,port:expected.port,database:expected.database,
    user:expected.user,password:process.env.PGPASSWORD,connectionTimeoutMillis:5000,
  });
  await db.connect();
  const meta=await query('SELECT current_database() AS database,current_user AS user');
  assert.equal(meta.rows[0].database,expected.database);
  assert.equal(meta.rows[0].user,expected.user);
  await query("CREATE TABLE members(id UUID PRIMARY KEY,tier TEXT DEFAULT 'free',roles TEXT[] DEFAULT ARRAY['member'])");
  await query(fs.readFileSync(path.join(root,'database/migrations/20260119000001_auth_sessions.sql'),'utf8'));
});
test.after(async()=>{if(db)await db.end()});

test('stale cookie defers to independently SQL-validated header; two-stage web logout revokes',async()=>{
  const id=await member(),headerToken=await token(id);
  activeJar=jar('synthetic-expired-cookie-not-in-db');
  const before=await access.deriveVerifiedAccess(request(headerToken));
  assert.equal(before.authenticated,true);assert.equal(before.memberId,id);
  const result=await client.signOutWebCredentials(webTransport,headerToken);
  assert.equal(result.kind,'complete');assert.equal(result.confirmedRevocations,1);
  assert.equal(await revoked(headerToken),true);
  assert.equal(activeJar.has('maia_session'),false);
  assert.equal((await access.deriveVerifiedAccess(request(headerToken))).authenticated,false);
});
test('two independently valid same-member SQL sessions both revoke',async()=>{
  const id=await member(),cookie=await token(id),header=await token(id);
  activeJar=jar(cookie);
  const before=await access.deriveVerifiedAccess(request(header));
  assert.equal(before.authenticated,true);assert.equal(before.memberId,id);
  const result=await client.signOutWebCredentials(webTransport,header);
  assert.equal(result.kind,'complete');assert.equal(result.confirmedRevocations,2);
  assert.equal(await revoked(cookie),true);assert.equal(await revoked(header),true);
});
test('cross-member valid sessions refuse authority and 409 direct signout without SQL write',async()=>{
  const memberA=await member(),memberB=await member();
  const cookie=await token(memberA),header=await token(memberB);
  activeJar=jar(cookie);
  const before=await access.deriveVerifiedAccess(request(header));
  assert.equal(before.authenticated,false);
  assert.equal(before.reason,'conflicting_credentials');
  assert.deepEqual(before.roles,[]);
  const out=await post(header);
  assert.equal(out.status,409);assert.equal(out.body.success,false);
  assert.equal(await revoked(cookie),false);assert.equal(await revoked(header),false);
});
test('identical cookie and header authorizes one member and revokes exactly once',async()=>{
  const id=await member(),same=await token(id);
  activeJar=jar(same);
  assert.equal((await access.deriveVerifiedAccess(request(same))).authenticated,true);
  const out=await post(same);
  assert.equal(out.status,200);assert.equal(out.body.serverSessionRevoked,true);
  assert.equal(await revoked(same),true);
  assert.equal((await access.deriveVerifiedAccess(request(same))).authenticated,false);
});
test('conflicting bare member claims cannot impersonate a validated SQL session',async()=>{
  const id=await member(),other=await member(),cookie=await token(id);
  activeJar=jar(cookie);
  const resolved=await access.deriveVerifiedAccess(request(null,{
    'x-member-id':id,'x-maia-member-id':other,
  }));
  assert.equal(resolved.authenticated,false);
  assert.equal(resolved.reason,'claim_mismatch');
  assert.deepEqual(resolved.roles,[]);
  assert.equal(await revoked(cookie),false);
});
test('null/foreign origin never revokes cookie or SQL-authorized header',async()=>{
  const id=await member(),cookie=await token(id),header=await token(id);
  activeJar=jar(cookie);
  for(const attemptedOrigin of ['null','https://foreign.invalid']){
    const out=await post(header,attemptedOrigin);
    assert.equal(out.status,403);
  }
  assert.equal(await revoked(cookie),false);assert.equal(await revoked(header),false);
  assert.equal(activeJar.has('maia_session'),true);
});
test('real SQL revocation fault yields partial 503, then recovery revokes bearer',async()=>{
  const id=await member(),cookie=await token(id);
  activeJar=jar(cookie);
  await query("CREATE FUNCTION stageq_interop_refuse() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fictional real SQL revocation block'; END; $$");
  await query('CREATE TRIGGER stageq_interop_no_update BEFORE UPDATE OF revoked ON auth_sessions FOR EACH ROW EXECUTE FUNCTION stageq_interop_refuse()');
  const previous=console.error;console.error=()=>{};
  let failure;
  try{failure=await post()}finally{
    console.error=previous;
    await query('DROP TRIGGER stageq_interop_no_update ON auth_sessions');
    await query('DROP FUNCTION stageq_interop_refuse()');
  }
  assert.equal(failure.status,503);
  assert.equal(failure.body.serverSessionRevoked,false);
  assert.equal(failure.body.localCookiesCleared,true);
  assert.equal(activeJar.has('maia_session'),false);
  assert.equal(await revoked(cookie),false);
  const retry=await post(cookie);
  assert.equal(retry.status,200);assert.equal(retry.body.serverSessionRevoked,true);
  assert.equal(await revoked(cookie),true);
  assert.equal((await access.deriveVerifiedAccess(request(cookie))).authenticated,false);
});
test('expired and previously revoked real sessions deny, and strict signout rule is exact',async()=>{
  const id=await member(),expired=await token(id),nowRevoked=await token(id);
  await query("UPDATE auth_sessions SET expires_at=NOW()-INTERVAL '1 hour' WHERE session_token=$1",[expired]);
  activeJar=jar(nowRevoked);
  const rev=await post();assert.equal(rev.status,200);
  assert.equal(rev.body.serverSessionRevoked,true);
  activeJar=jar(expired);
  const deniedExpired=await access.deriveVerifiedAccess(request());
  assert.equal(deniedExpired.authenticated,false);
  const deniedRevoked=await access.deriveVerifiedAccess(request(nowRevoked));
  assert.equal(deniedRevoked.authenticated,false);
  const old=process.env.ACCESS_CONTROL_MODE;
  process.env.ACCESS_CONTROL_MODE='strict';
  try{
    assert.equal(matrix.checkAccess('/api/members/signout','free',[],false).allowed,true);
    assert.equal(matrix.checkAccess('/api/members/fictional-unmapped','free',[],false).allowed,false);
  }finally{
    if(old===undefined)delete process.env.ACCESS_CONTROL_MODE;
    else process.env.ACCESS_CONTROL_MODE=old;
  }
});
