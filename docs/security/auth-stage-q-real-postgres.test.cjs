/**
 * Stage Q real PostgreSQL sign-out acceptance against a disposable CI service.
 * Executes reviewed TypeScript server/client modules. No production credentials,
 * actual members, local machines, external URLs, or live database are consulted.
 * HTTP cookies are simulated; this is NOT a Safari/Next production witness.
 */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const crypto=require('node:crypto'),ts=require('typescript'),{Client}=require('pg');
const root=path.resolve(__dirname,'../..');
if(process.env.STAGE_Q_DISPOSABLE_POSTGRES!=='fictional-ci-only' ||
   process.env.PGHOST!=='127.0.0.1' || Number(process.env.PGPORT)!==5547 ||
   process.env.PGDATABASE!=='stageq_fictional' || process.env.PGUSER!=='stageq_fixture')
  throw Error('Refusing a non-fictional or non-loopback PostgreSQL target');
let db,activeJar;
function loadTs(file,imports){
 const pathname=path.join(root,file);
 const js=ts.transpileModule(fs.readFileSync(pathname,'utf8'),{
  fileName:pathname,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
   esModuleInterop:true,isolatedModules:true},
 }).outputText;
 const m=new Module.Module(pathname+'.fixture.cjs');m.filename=pathname+'.fixture.cjs';m.paths=[];
 m.require=id=>{if(imports.has(id))return imports.get(id);throw Error('Unapproved import '+id)};
 m._compile(js,m.filename);return m.exports;
}
function cookieJar(){
 const map=new Map();return{
  get:key=>map.has(key)?{value:map.get(key)}:undefined,
  set:(key,value,options={})=>{
   if(options.expires instanceof Date&&options.expires.getTime()<=0)map.delete(key);
   else map.set(key,value);
  },
  has:key=>map.has(key),
 };
}
const query=(...args)=>db.query(...args);
const NextResponse={json:(body,opts={})=>{
 const status=opts.status||200;return{status,ok:status>=200&&status<300,body,json:async()=>body};
}};
const sessions=loadTs('lib/auth/serverSessions.ts',new Map([
 ['@/lib/db/postgres',{query}],
 ['./passwordUtils',{generateSecureToken:n=>crypto.randomBytes(n).toString('hex')}],
 ['next/headers',{cookies:async()=>activeJar}],
]));
const signout=loadTs('app/api/members/signout/route.ts',new Map([
 ['next/server',{NextResponse}],['next/headers',{cookies:async()=>activeJar}],
 ['@/lib/db/postgres',{query}],
]));
const identity=loadTs('lib/auth/identityAssertions.ts',new Map());
const auth=loadTs('lib/auth/verifiedAccess.ts',new Map([
 ['./identityAssertions',identity],['@/lib/db/postgres',{query}],
]));
const web=loadTs('lib/auth/webSignOut.ts',new Map([
 ['@/lib/http/apiBase',{clearAuthState:()=>{},isNativeCapacitor:()=>false}],
 ['@capacitor/core',{Capacitor:{isNativePlatform:()=>false}}],
]));
const origin='https://stage-q-fiction.invalid';
async function member(){
 const id=crypto.randomUUID();
 await query("INSERT INTO members(id,tier,roles) VALUES($1,'free',ARRAY['member'])",[id]);
 return id;
}
async function tokenFor(id){
 const s=await sessions.createSession({memberId:id,ipAddress:'127.0.0.1',userAgent:'fiction-only'});
 return s.sessionToken;
}
async function revoked(token){
 const r=await query('SELECT revoked FROM auth_sessions WHERE session_token=$1',[token]);
 return r.rows[0]?.revoked;
}
async function post(headerToken=null,claimedOrigin=origin){
 const headers=new Headers({Origin:claimedOrigin,Host:'stage-q-fiction.invalid',
  'Sec-Fetch-Site':claimedOrigin===origin?'same-origin':'cross-site'});
 if(headerToken)headers.set('x-session-token',headerToken);
 const old=process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
 process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=origin;
 try{return await signout.POST({headers,url:origin+'/api/members/signout',cookies:activeJar})}
 finally{if(old===undefined)delete process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
 else process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=old}
}
async function accessWith(header){
 const headers=new Headers();if(header)headers.set('x-session-token',header);
 return auth.deriveVerifiedAccess({cookies:activeJar,headers,url:origin+'/api/auth/whoami'});
}
test.before(async()=>{
 db=new Client({host:'127.0.0.1',port:5547,database:'stageq_fictional',
  user:'stageq_fixture',password:process.env.PGPASSWORD,connectionTimeoutMillis:5000});
 await db.connect();
 const r=await query('SELECT current_database() AS db,current_user AS usr');
 assert.equal(r.rows[0].db,'stageq_fictional');assert.equal(r.rows[0].usr,'stageq_fixture');
 await query('CREATE TABLE members(id UUID PRIMARY KEY,tier TEXT DEFAULT \'free\',roles TEXT[] DEFAULT ARRAY[\'member\'])');
 await query(fs.readFileSync(path.join(root,'database/migrations/20260119000001_auth_sessions.sql'),'utf8'));
});
test.after(async()=>{if(db)await db.end()});

test('real PostgreSQL session insertion, revocation and replay denial',async()=>{
 const id=await member(),token=await tokenFor(id);
 activeJar=cookieJar();activeJar.set('maia_session',token);
 assert.equal(await revoked(token),false);
 const before=await accessWith(null);
 assert.equal(before.authenticated,true);assert.equal(before.memberId,id);
 const out=await post();
 assert.equal(out.status,200);assert.equal(out.body.serverSessionRevoked,true);
 assert.equal(await revoked(token),true);assert.equal(activeJar.has('maia_session'),false);
 assert.equal((await accessWith(token)).authenticated,false);
});
test('real SQL revokes distinct cookie and Safari bearer sessions independently',async()=>{
 const id=await member(),cookie=await tokenFor(id),header=await tokenFor(id);
 activeJar=cookieJar();activeJar.set('maia_session',cookie);
 const result=await web.signOutWebCredentials(async(p,options)=>{
  assert.equal(p,'/api/members/signout');assert.equal(options.credentials,'same-origin');
  return post(options.headers?.['x-session-token']||null);
 },header);
 assert.equal(result.kind,'complete');assert.equal(result.confirmedRevocations,2);
 assert.equal(await revoked(cookie),true);assert.equal(await revoked(header),true);
});
test('real SQL write failure produces 503; retry after SQL recovery revokes',async()=>{
 const id=await member(),token=await tokenFor(id);
 activeJar=cookieJar();activeJar.set('maia_session',token);
 await query("CREATE FUNCTION stageq_fail_revoke() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fictional revoke failure'; END; $$");
 await query('CREATE TRIGGER stageq_refuse BEFORE UPDATE OF revoked ON auth_sessions FOR EACH ROW EXECUTE FUNCTION stageq_fail_revoke()');
 const oldError=console.error;console.error=()=>{};
 let refused;
 try{refused=await post()}
 finally{
  console.error=oldError;
  await query('DROP TRIGGER stageq_refuse ON auth_sessions');
  await query('DROP FUNCTION stageq_fail_revoke()');
 }
 assert.equal(refused.status,503);assert.equal(refused.body.localCookiesCleared,true);
 assert.equal(refused.body.serverSessionRevoked,false);assert.equal(await revoked(token),false);
 const retry=await post(token);
 assert.equal(retry.status,200);assert.equal(retry.body.serverSessionRevoked,true);
 assert.equal(await revoked(token),true);
});
test('conflicting cookie/header credentials leave both real SQL sessions unrevoked',async()=>{
 const id=await member(),cookie=await tokenFor(id),header=await tokenFor(id);
 activeJar=cookieJar();activeJar.set('maia_session',cookie);
 const out=await post(header);
 assert.equal(out.status,409);assert.equal(await revoked(cookie),false);assert.equal(await revoked(header),false);
});
test('null browser Origin is refused before any SQL revocation',async()=>{
 const id=await member(),token=await tokenFor(id);
 activeJar=cookieJar();activeJar.set('maia_session',token);
 const out=await post(null,'null');
 assert.equal(out.status,403);assert.equal(await revoked(token),false);
});