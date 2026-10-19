/**
 * Stage Q: real PostgreSQL crash/restart and persistent session replay witness.
 * Exact reviewed auth modules with fictional members only. This test will
 * refuse any non-loopback/non-disposable DB target. It does not deploy or
 * connect to Soullab staging/production, and is not encrypted-backup recovery.
 *
 * Three separate processes/CI stages:
 *   node docs/security/auth-stage-q-postgres-crash-restart.cjs seed
 *   ... docker kill only the labeled fictional postgres test container ...
 *   node docs/security/auth-stage-q-postgres-crash-restart.cjs offline
 *   ... docker start that exact container ...
 *   node docs/security/auth-stage-q-postgres-crash-restart.cjs recovered
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const crypto=require('node:crypto'),Module=require('node:module');
const ts=require('typescript'),{Client}=require('pg');
const root=path.resolve(__dirname,'../..');
const expected={
 sentinel:'stageq-postgres-crash-fictional-only',
 host:'127.0.0.1',port:5550,
 database:'stageq_crash_fictional',user:'stageq_crash_fixture',
};
if(process.env.STAGE_Q_CRASH_DISPOSABLE!==expected.sentinel||
 process.env.PGHOST!==expected.host||Number(process.env.PGPORT)!==expected.port||
 process.env.PGDATABASE!==expected.database||process.env.PGUSER!==expected.user||
 !/^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA||'')){
 throw Error('Refusing non-fixture PostgreSQL crash/restart test');
}
const sha=process.env.GITHUB_SHA;
const folder=path.join(os.tmpdir(),'soullab-stageq-crash-'+sha.slice(0,16));
const manifestPath=path.join(folder,'fictional-session-manifest.json');
const marker=path.join(folder,'.stageq-owned');
const origin='https://stageq-crash.invalid';
const command=process.argv[2];
const sourceFiles=[
 'lib/auth/serverSessions.ts','lib/auth/verifiedAccess.ts',
 'lib/auth/identityAssertions.ts','app/api/members/signout/route.ts',
 'database/migrations/20260119000001_auth_sessions.sql',
];
function fileHash(rel){
 return crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex');
}
const sourceHashes=Object.fromEntries(sourceFiles.map(name=>[name,fileHash(name)]));
const dbParams={
 host:expected.host,port:expected.port,database:expected.database,user:expected.user,
 password:process.env.PGPASSWORD,connectionTimeoutMillis:1400,
};
async function query(sql,params=[]){
 const db=new Client(dbParams);
 try {
  await db.connect();
  return await db.query(sql,params);
 }finally{
  await db.end().catch(()=>{});
 }
}
function transpile(rel,imports){
 const abs=path.join(root,rel);
 const output=ts.transpileModule(fs.readFileSync(abs,'utf8'),{
  fileName:abs,compilerOptions:{
   target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
   isolatedModules:true,esModuleInterop:true,
  },
 }).outputText;
 const mod=new Module.Module(abs+'.stageq-restart.cjs');
 mod.filename=abs+'.stageq-restart.cjs';mod.paths=[];
 mod.require=name=>{
  if(imports.has(name))return imports.get(name);
  throw Error('Unapproved fixture module '+name);
 };
 mod._compile(output,mod.filename);
 return mod.exports;
}
function jar(token=null){
 const map=new Map();
 if(token)map.set('maia_session',token);
 return {
  get:name=>map.has(name)?{value:map.get(name)}:undefined,
  set:(name,value,options={})=>{
   if(options.expires instanceof Date&&options.expires.getTime()<=0)map.delete(name);
   else map.set(name,value);
  },
  has:name=>map.has(name),
 };
}
let activeJar=jar();
const NextResponse={json:(body,options={})=>({status:options.status||200,body})};
const sessions=transpile('lib/auth/serverSessions.ts',new Map([
 ['@/lib/db/postgres',{query}],
 ['./passwordUtils',{generateSecureToken:n=>crypto.randomBytes(n).toString('hex')}],
 ['next/headers',{cookies:async()=>activeJar}],
]));
const identities=transpile('lib/auth/identityAssertions.ts',new Map());
const verify=transpile('lib/auth/verifiedAccess.ts',new Map([
 ['./identityAssertions',identities],
 ['@/lib/db/postgres',{query}],
]));
const signout=transpile('app/api/members/signout/route.ts',new Map([
 ['next/server',{NextResponse}],
 ['next/headers',{cookies:async()=>activeJar}],
 ['@/lib/db/postgres',{query}],
]));
function verifiedRequest(token){
 const headers=new Headers();
 if(token)headers.set('x-session-token',token);
 return {headers,cookies:jar(),url:origin+'/api/protected'};
}
async function signoutRequest(token=null,cookieToken=null){
 activeJar=jar(cookieToken);
 const headers=new Headers({Origin:origin,Host:'stageq-crash.invalid',
  'Sec-Fetch-Site':'same-origin'});
 if(token)headers.set('x-session-token',token);
 const old=process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
 process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=origin;
 try {
  const response=await signout.POST({headers,url:origin+'/api/members/signout'});
  return {response,cookies:activeJar};
 }finally{
  if(old===undefined)delete process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS;
  else process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS=old;
 }
}
function readManifest(){
 assert.equal(fs.readFileSync(marker,'utf8'),expected.sentinel);
 const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 assert.equal(manifest.kind,expected.sentinel);
 assert.equal(manifest.sourceCommit,sha);
 assert.deepEqual(manifest.sourceHashes,sourceHashes);
 assert.match(manifest.activeToken,/^[0-9a-f]{64}$/);
 assert.match(manifest.revokedToken,/^[0-9a-f]{64}$/);
 assert.match(manifest.expiredToken,/^[0-9a-f]{64}$/);
 return manifest;
}
async function seed(){
 if(fs.existsSync(folder))throw Error('Preexisting test-owned path; refusing overwrite');
 const m=await query('SELECT current_database() database,current_user usr');
 assert.equal(m.rows[0].database,expected.database);
 assert.equal(m.rows[0].usr,expected.user);
 await query("CREATE TABLE members(id UUID PRIMARY KEY,tier TEXT DEFAULT 'free',roles TEXT[] DEFAULT ARRAY['member'])");
 await query(fs.readFileSync(path.join(root,'database/migrations/20260119000001_auth_sessions.sql'),'utf8'));
 const memberId=crypto.randomUUID();
 await query("INSERT INTO members(id,tier,roles) VALUES($1,'free',ARRAY['member'])",[memberId]);
 async function newToken(){
  const s=await sessions.createSession({
   memberId,ipAddress:'127.0.0.1',userAgent:'fictional-crash-test',
  });
  return s.sessionToken;
 }
 const activeToken=await newToken();
 const revokedToken=await newToken();
 const expiredToken=await newToken();
 const auth=await verify.deriveVerifiedAccess(verifiedRequest(activeToken));
 assert.equal(auth.authenticated,true);
 assert.equal(auth.memberId,memberId);
 assert.deepEqual(auth.roles,['member']);
 const out=await signoutRequest(revokedToken);
 assert.equal(out.response.status,200);
 assert.equal(out.response.body.serverSessionRevoked,true);
 await query("UPDATE auth_sessions SET expires_at=NOW()-INTERVAL '5 minutes' WHERE session_token=$1",
  [expiredToken]);
 assert.equal((await verify.deriveVerifiedAccess(verifiedRequest(revokedToken))).authenticated,false);
 assert.equal((await verify.deriveVerifiedAccess(verifiedRequest(expiredToken))).authenticated,false);
 fs.mkdirSync(folder,{recursive:false,mode:0o700});
 fs.writeFileSync(marker,expected.sentinel,{flag:'wx',mode:0o600});
 fs.writeFileSync(manifestPath,JSON.stringify({
  kind:expected.sentinel,sourceCommit:sha,sourceHashes,memberId,
  activeToken,revokedToken,expiredToken,
 }),{flag:'wx',mode:0o600});
 console.log('Stage Q durable fictional PostgreSQL seed: PASS (three sessions, one revoked, one expired)');
}
async function offline(){
 const manifest=readManifest();
 let refused=false;
 try {await query('SELECT 1')}catch{refused=true}
 assert.equal(refused,true,'PostgreSQL must be unreachable during crash witness');
 const oldError=console.error;
 let caught=0;
 console.error=()=>{caught++};
 try{
  const denied=await verify.deriveVerifiedAccess(verifiedRequest(manifest.activeToken));
  assert.equal(denied.authenticated,false,'DB outage must fail closed');
  assert.equal(denied.memberId,null);
  const out=await signoutRequest(null,manifest.activeToken);
  assert.equal(out.response.status,503);
  assert.equal(out.response.body.success,false);
  assert.equal(out.response.body.localCookiesCleared,true);
  assert.equal(out.response.body.serverSessionRevoked,false);
  assert.equal(out.cookies.has('maia_session'),false);
  assert.ok(caught>=1,'Outage should trigger a sanitized diagnostic path');
 }finally{console.error=oldError}
 console.log('Stage Q PostgreSQL crash/refusal: PASS (authenticated access refused, signout 503, local cookie expired)');
}
async function recovered(){
 const manifest=readManifest();
 const m=await query('SELECT current_database() database,current_user usr');
 assert.equal(m.rows[0].database,expected.database);
 assert.equal(m.rows[0].usr,expected.user);
 const rows=await query(
  'SELECT session_token,revoked,expires_at FROM auth_sessions WHERE member_id=$1',
  [manifest.memberId]);
 assert.equal(rows.rowCount,3);
 const byToken=new Map(rows.rows.map(x=>[x.session_token,x]));
 assert.equal(byToken.get(manifest.activeToken).revoked,false);
 assert.equal(byToken.get(manifest.revokedToken).revoked,true);
 assert.equal(byToken.get(manifest.expiredToken).revoked,false);
 assert.ok(new Date(byToken.get(manifest.expiredToken).expires_at).getTime()<Date.now());
 const live=await verify.deriveVerifiedAccess(verifiedRequest(manifest.activeToken));
 assert.equal(live.authenticated,true);
 assert.equal(live.memberId,manifest.memberId);
 assert.deepEqual(live.roles,['member']);
 for(const token of [manifest.revokedToken,manifest.expiredToken]){
  const denied=await verify.deriveVerifiedAccess(verifiedRequest(token));
  assert.equal(denied.authenticated,false);
  assert.equal(denied.memberId,null);
 }
 const confirmed=await signoutRequest(manifest.activeToken);
 assert.equal(confirmed.response.status,200);
 assert.equal(confirmed.response.body.serverSessionRevoked,true);
 const retry=await signoutRequest(manifest.activeToken);
 assert.equal(retry.response.status,200);
 assert.equal(retry.response.body.serverSessionRevoked,false);
 const replay=await verify.deriveVerifiedAccess(verifiedRequest(manifest.activeToken));
 assert.equal(replay.authenticated,false);
 const db=await query('SELECT revoked FROM auth_sessions WHERE session_token=$1',[manifest.activeToken]);
 assert.equal(db.rows[0].revoked,true);
 console.log('Stage Q PostgreSQL crash/restart: PASS (persisted roles and revoked/expired state, recovered revocation, replay denied)');
}
function cleanup(){
 assert.equal(fs.readFileSync(marker,'utf8'),expected.sentinel);
 const manifest=readManifest();
 assert.equal(manifest.sourceCommit,sha);
 fs.rmSync(folder,{recursive:true,force:false});
 console.log('Stage Q fictional private session manifest cleaned');
}
(async()=>{
 if(command==='seed')await seed();
 else if(command==='offline')await offline();
 else if(command==='recovered')await recovered();
 else if(command==='cleanup')cleanup();
 else throw Error('Expected seed/offline/recovered/cleanup');
})().catch(e=>{
 console.error('Stage Q disposable PostgreSQL crash/restart check failed: '+
  String(e?.message||e).replace(/[0-9a-f]{64}/ig,'[fictional-token]'));
 process.exitCode=1;
});
