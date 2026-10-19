/**
 * Stage Q — real Caddy edge + compiled Next16 strict proxy + WebKit + SQL.
 * All inputs are fictional, loopback-bound and disposable. Linux WebKit is NOT
 * Apple's Safari; Caddy config is an explicitly disclosed derivative of the
 * pinned production Caddyfile, not the deployed Caddy process.
 */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const crypto=require('node:crypto'),http=require('node:http'),https=require('node:https');
const {spawn,spawnSync}=require('node:child_process');
const {Client}=require('pg'),{webkit}=require('playwright');
const root=path.resolve(__dirname,'../..');
const guard='stageq-caddy-fictional-ci-only';
const fixtureGuard='stageq-next16-fictional-only';
const sha=process.env.GITHUB_SHA||'isolated-local';
const nextFixture=path.join(os.tmpdir(),'soullab-stageq-next16-'+sha.slice(0,16));
const caddyFixture=path.join(os.tmpdir(),'soullab-stageq-caddy-'+sha.slice(0,16));
const origin='https://stageq-next16.invalid';
// Fictional, fixed, not a credential for any account outside this disposable DB.
const FIXTURE_PASSWORD='stageq-fully-fictional-bcrypt-password';
const dockerName='stageq-caddy-'+sha.slice(0,12);
if(process.env.STAGE_Q_CADDY_DISPOSABLE!==guard||
   process.env.STAGE_Q_NEXT16_DISPOSABLE!==fixtureGuard||
   process.env.PGHOST!=='127.0.0.1'||Number(process.env.PGPORT)!==5549||
   process.env.PGDATABASE!=='stageq_next16_fictional'||
   process.env.PGUSER!=='stageq_next16_fixture'||
   process.env.DATABASE_URL!==
     'postgresql://stageq_next16_fixture:stageq_next16_fictional_password_only@127.0.0.1:5549/stageq_next16_fictional'){
 throw Error('Refusing non-fictional/non-loopback Caddy + Next16 acceptance');
}
if(!fs.existsSync(path.join(nextFixture,'.stageq-fixture'))||
 fs.readFileSync(path.join(nextFixture,'.stageq-fixture'),'utf8')!==fixtureGuard||
 !fs.existsSync(path.join(nextFixture,'.next/BUILD_ID'))||
 !fs.existsSync(path.join(caddyFixture,'.stageq-owned'))||
 fs.readFileSync(path.join(caddyFixture,'.stageq-owned'),'utf8')!==guard){
 throw Error('Both source-pinned, owned Next16 and Caddy fixtures are required');
}
const edge=JSON.parse(fs.readFileSync(path.join(caddyFixture,'STAGE_Q_CADDY_CUSTODY.json'),'utf8'));
const custody={
 commitMatches:edge.sourceCommit===sha,
 blobMatches:edge.sourceCaddyBlob==='9cffaa85d5b42a05cd1de7eb0726d8435b3e5b69',
 activeUpstreams:edge.upstreamCount,
 activeHostMappings:edge.preservedHostHeaderCount,
 nullCorsHeaders:edge.preservedNullCorsHeaders,
};
if(!custody.commitMatches||!custody.blobMatches||
 custody.activeUpstreams!==5||custody.activeHostMappings!==5||
 custody.nullCorsHeaders!==2){
 throw Error('Caddy source custody/route shape mismatch: '+JSON.stringify(custody));
}
const sourceManifest=JSON.parse(fs.readFileSync(
 path.join(nextFixture,'STAGE_Q_BUILD_MANIFEST.json'),'utf8'));
if(sourceManifest.sourceCommit!==sha||sourceManifest.sourceFiles.length!==18)
 throw Error('Next16 source custody mismatch');

let db,next,browser,containerId=null,nextLog='';
function censored(chunk){
 nextLog=(nextLog+String(chunk)).slice(-8000)
  .replace(/\b[a-f0-9]{64}\b/ig,'[redacted-token]')
  .replaceAll('stageq_next16_fictional_password_only','[redacted-fixture]');
}
function run(cmd,args,options={}){
 const p=spawnSync(cmd,args,{encoding:'utf8',timeout:90000,maxBuffer:1024*1024,...options});
 if(p.status!==0){
  const details=(p.stderr||p.stdout||'').slice(-1400)
   .replace(/\b[a-f0-9]{64}\b/ig,'[redacted-token]')
   .replaceAll('stageq_next16_fictional_password_only','[redacted-fixture]');
  throw Error(cmd+' failed: '+p.status+' '+details);
 }
 return (p.stdout||'').trim();
}
async function eventual(fn,name,ms=60000){
 const limit=Date.now()+ms;let last;
 while(Date.now()<limit){
  try{return await fn()}catch(e){last=e;await new Promise(resolve=>setTimeout(resolve,300))}
 }
 throw Error(name+' unavailable: '+String(last||'timeout').slice(0,170)+
 ' nextTail='+nextLog.slice(-700));
}
function startNext(){
 next=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),
  'start','--hostname','127.0.0.1','--port','3829'],{
  cwd:nextFixture,stdio:['ignore','pipe','pipe'],
  env:{...process.env,NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',
   ACCESS_CONTROL_MODE:'strict',AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS:origin,
   NEXT_PUBLIC_ROOT_DOMAIN:'stageq-fiction.invalid'},
 });
 next.stdout.on('data',censored);next.stderr.on('data',censored);
}
function nodeReady(){
 return new Promise((resolve,reject)=>{
  const req=http.get('http://127.0.0.1:3829/',res=>{
   res.resume();res.on('end',()=>res.statusCode===200?resolve():reject(Error('HTTP '+res.statusCode)));
  });
  req.setTimeout(2500,()=>req.destroy(Error('startup timeout')));
  req.on('error',reject);
 });
}
function caddyReady(){
 return new Promise((resolve,reject)=>{
  const req=https.get({hostname:'stageq-next16.invalid',port:443,path:'/',
   rejectUnauthorized:false,timeout:2500},res=>{
   res.resume();res.on('end',()=>res.statusCode===200?resolve():reject(Error('HTTP '+res.statusCode)));
  });
  req.on('error',reject);req.on('timeout',()=>req.destroy(Error('Caddy startup timeout')));
 });
}
async function startCaddy(){
 const key=path.join(caddyFixture,'fixture.key');
 const cert=path.join(caddyFixture,'fixture.crt');
 run('openssl',['req','-x509','-nodes','-newkey','rsa:2048','-days','1',
  '-keyout',key,'-out',cert,'-subj','/CN=stageq-next16.invalid',
  '-addext','subjectAltName=DNS:stageq-next16.invalid'],{stdio:'ignore'});
 fs.chmodSync(key,0o600);
 const mount=caddyFixture+':/etc/stageq:ro';
 const image='caddy:2.10.2-alpine';
 run('docker',['run','--rm','--network','host','-v',mount,image,
  'caddy','validate','--config','/etc/stageq/Caddyfile','--adapter','caddyfile']);
 // This unique name is never force-reused; a preexisting container is an error.
 containerId=run('docker',['run','--detach','--name',dockerName,
  '--label','soullab.stageq=fictional','--network','host',
  '-v',mount,image,'caddy','run','--config','/etc/stageq/Caddyfile',
  '--adapter','caddyfile']);
 await eventual(caddyReady,'Actual disposable Caddy HTTPS listener');
}
function browserContext(){
 return browser.newContext({ignoreHTTPSErrors:true});
}
async function fromPage(page,url,options={}){
 return page.evaluate(async({url,options})=>{
  const response=await fetch(url,{credentials:'same-origin',redirect:'manual',cache:'no-store',...options});
  const contentType=response.headers.get('content-type')||'';
  const data=contentType.includes('json')?await response.json():await response.text();
  return{status:response.status,data,marker:response.headers.get('x-maia-origin')||null};
 },{url,options});
}
function raw(endpoint,method='GET',headers={}){
 return new Promise((resolve,reject)=>{
  const req=https.request({hostname:'stageq-next16.invalid',port:443,path:endpoint,method,
   rejectUnauthorized:false,timeout:9000,headers},res=>{
   let body='';res.on('data',c=>body+=String(c));
   res.on('end',()=>resolve({status:res.statusCode,body,headers:res.headers}));
  });
  req.on('error',reject);req.on('timeout',()=>req.destroy(Error('request timeout')));
  req.end();
 });
}
async function issue(page,transport='cookie',username='fixture_member'){
 // The real PR1870 signin handler always sets an HttpOnly browser cookie and
 // also returns the same session token to the Safari header transport.
 // For a bearer-only test, restore the browser's prior cookie state after
 // issuing a separate, real SQL-backed session.
 const snapshot=transport==='bearer'?await page.context().cookies(origin):null;
 const answer=await fromPage(page,'/api/members/signin',{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({username,password:FIXTURE_PASSWORD}),
 });
 assert.equal(answer.status,200,'Real Class A signin must pass Caddy');
 assert.equal(answer.data.success,true);
 assert.match(answer.data.session?.token,/^[a-f0-9]{64}$/);
 if(transport==='bearer'){
  await page.context().clearCookies();
  if(snapshot.length)await page.context().addCookies(snapshot);
 }
 return answer.data.session.token;
}
async function revoked(token){
 const r=await db.query('SELECT revoked FROM auth_sessions WHERE session_token=$1',[token]);
 return r.rows[0]?.revoked;
}
async function trigger(on){
 if(on){
  await db.query("CREATE FUNCTION stageq_caddy_refuse() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fictional Caddy SQL refusal'; END; $$");
  await db.query('CREATE TRIGGER stageq_caddy_revoke_fail BEFORE UPDATE OF revoked ON auth_sessions FOR EACH ROW EXECUTE FUNCTION stageq_caddy_refuse()');
 }else{
  await db.query('DROP TRIGGER stageq_caddy_revoke_fail ON auth_sessions');
  await db.query('DROP FUNCTION stageq_caddy_refuse()');
 }
}
test.before(async()=>{
 db=new Client({host:'127.0.0.1',port:5549,database:'stageq_next16_fictional',
  user:'stageq_next16_fixture',password:process.env.PGPASSWORD,connectionTimeoutMillis:5000});
 await db.connect();
 const meta=await db.query('SELECT current_database() db,current_user usr');
 assert.equal(meta.rows[0].db,'stageq_next16_fictional');
 assert.equal(meta.rows[0].usr,'stageq_next16_fixture');
 await db.query([
  'CREATE TABLE members (',
  ' id UUID PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL,',
  ' passkey TEXT, password_hash TEXT NOT NULL, name TEXT, preferred_name TEXT,',
  ' onboarded BOOLEAN DEFAULT TRUE, onboarding_step TEXT,',
  " tier TEXT DEFAULT 'free', roles TEXT[] DEFAULT ARRAY['member'],",
  ' subscription_active BOOLEAN DEFAULT FALSE, subscription_expires_at TIMESTAMPTZ,',
  ' has_webauthn BOOLEAN DEFAULT FALSE, preferred_auth_method TEXT DEFAULT \'password\',',
  ' must_reset_password BOOLEAN DEFAULT FALSE, last_sign_in TIMESTAMPTZ',
  ')',
 ].join(' '));
 for(const filename of [
  '20260119000001_auth_sessions.sql',
  '20260119000004_auth_rate_limits.sql',
  '20260828000001_audit_logs.sql',
 ]){
  await db.query(fs.readFileSync(path.join(root,'database/migrations',filename),'utf8'));
 }
 const passwordHash=await require('bcrypt').hash(FIXTURE_PASSWORD,12);
 for(const name of ['fixture_member','fixture_second']){
  await db.query(
   'INSERT INTO members(id,username,email,password_hash,name,preferred_name,tier,roles)'+
   " VALUES($1,$2,$3,$4,'Fictional account','Fictional account','free',ARRAY['member'])",
   [crypto.randomUUID(),name,name+'@example.invalid',passwordHash]);
 }
 startNext();
 await eventual(nodeReady,'Compiled Next16 application');
 await startCaddy();
 browser=await webkit.launch({headless:true});
});
test.after(async()=>{
 if(browser)await browser.close();
 if(containerId){
  try{
   const label=run('docker',['inspect','--format','{{index .Config.Labels "soullab.stageq"}}',containerId]);
   if(label==='fictional')run('docker',['rm','--force',containerId]);
   else console.error('Caddy cleanup refused: unexpected container label');
  }catch{console.error('Caddy cleanup could not be verified; unique fixture container needs inspection')}
 }
 if(next){
  next.kill('SIGTERM');
  await Promise.race([new Promise(resolve=>next.once('exit',resolve)),new Promise(r=>setTimeout(r,4000))]);
  if(next.exitCode===null&&!next.killed)next.kill('SIGKILL');
 }
 if(db)await db.end();
});
test('real derived Caddy apex and emergency deny rules remain active',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try{
  await page.goto(origin+'/',{waitUntil:'load'});
  const front=await fromPage(page,'/');
  assert.equal(front.status,200);
  assert.equal(front.marker,'caddy-sovereign');
  const disabled=await raw('/api/members/migrate-data','POST');
  assert.equal(disabled.status,403);
  assert.match(disabled.body,/Endpoint disabled/);
  const unmapped=await fromPage(page,'/api/members/undocumented');
  assert.equal(unmapped.status,404);
  assert.doesNotMatch(String(unmapped.data),/MUST_NOT_BE_REACHABLE/);
 }finally{await context.close()}
});
test('Caddy Host/Origin reaches strict Next: Secure HttpOnly cookie and SQL replay refusal',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try{
  await page.goto(origin+'/',{waitUntil:'load'});
  const token=await issue(page);
  const saved=(await context.cookies(origin)).find(c=>c.name==='maia_session');
  assert.ok(saved);assert.equal(saved.secure,true);assert.equal(saved.httpOnly,true);
  assert.equal(await page.evaluate(()=>document.cookie.includes('maia_session')),false);
  await page.goto(origin+'/writers-studio',{waitUntil:'load'});
  const room=page.locator('[data-testid="protected-room"]');
  assert.equal(await room.count(),1);
  assert.equal(await room.getAttribute('data-roles'),'member');
  const signed=await fromPage(page,'/api/members/signout',{method:'POST'});
  assert.equal(signed.status,200);
  assert.equal(signed.data.serverSessionRevoked,true);
  assert.equal((await context.cookies(origin)).some(c=>c.name==='maia_session'),false);
  assert.equal(await revoked(token),true);
  const replay=await raw('/writers-studio','GET',{'x-session-token':token});
  assert.notEqual(replay.status,200);
  assert.doesNotMatch(replay.body,/Fictional private room/);
 }finally{await context.close()}
});
test('Caddy preflight may allow null but actual signout rejects null/foreign origin',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try{
  await page.goto(origin+'/',{waitUntil:'load'});
  const token=await issue(page);
  const preflight=await raw('/api/members/signout','OPTIONS',{
   Origin:'null','Access-Control-Request-Method':'POST',
  });
  assert.equal(preflight.status,204);
  assert.equal(preflight.headers['access-control-allow-origin'],'null');
  const refusals=[{}, {Origin:'null'}, {Origin:'https://evil.invalid'},
   {Origin:origin,'Sec-Fetch-Site':'cross-site'}];
  for(const attrs of refusals){
   const result=await raw('/api/members/signout','POST',{
    Cookie:'maia_session='+token,...attrs,
   });
   assert.equal(result.status,403);
   assert.equal(await revoked(token),false);
  }
  const spoof=await raw('/api/members/signout','POST',{
   Cookie:'maia_session='+token,Origin:'https://evil.invalid',
   'X-Forwarded-Host':'stageq-next16.invalid',
  });
  assert.equal(spoof.status,403);
  assert.equal(await revoked(token),false);
 }finally{await context.close()}
});
test('Caddy dual-transport and credential conflict uphold separate SQL authority',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try{
  await page.goto(origin+'/',{waitUntil:'load'});
  const a=await issue(page,'cookie');
  const b=await issue(page,'bearer');
  const conflict=await fromPage(page,'/api/members/signout',{
   method:'POST',headers:{'x-session-token':b},
  });
  assert.equal(conflict.status,409);
  assert.equal(await revoked(a),false);
  assert.equal(await revoked(b),false);
  const first=await fromPage(page,'/api/members/signout',{method:'POST'});
  assert.equal(first.status,200);
  assert.equal(first.data.serverSessionRevoked,true);
  const second=await fromPage(page,'/api/members/signout',{
   method:'POST',headers:{'x-session-token':b},
  });
  assert.equal(second.status,200);
  assert.equal(second.data.serverSessionRevoked,true);
  assert.equal(await revoked(a),true);
  assert.equal(await revoked(b),true);
 }finally{await context.close()}
});
test('Caddy preserves truthful 503 partial exit and successful recovered bearer retry',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try{
  await page.goto(origin+'/',{waitUntil:'load'});
  const token=await issue(page);
  await trigger(true);
  const oldError=console.error;console.error=()=>{};
  let refusal;
  try{refusal=await fromPage(page,'/api/members/signout',{method:'POST'})}
  finally{console.error=oldError;await trigger(false)}
  assert.equal(refusal.status,503);
  assert.equal(refusal.data.localCookiesCleared,true);
  assert.equal(refusal.data.serverSessionRevoked,false);
  assert.equal((await context.cookies(origin)).some(c=>c.name==='maia_session'),false);
  assert.equal(await revoked(token),false);
  const retry=await fromPage(page,'/api/members/signout',{
   method:'POST',headers:{'x-session-token':token},
  });
  assert.equal(retry.status,200);
  assert.equal(retry.data.serverSessionRevoked,true);
  assert.equal(await revoked(token),true);
 }finally{await context.close()}
});

test('Class A resolver authorizes valid header through a stale cookie at real Caddy/Next edge',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try {
  await page.goto(origin+'/',{waitUntil:'load'});
  const staleCookie=await issue(page,'cookie','fixture_member');
  const headerToken=await issue(page,'bearer','fixture_member');
  assert.equal((await context.cookies(origin)).some(c=>c.name==='maia_session'),true);
  const changed=await db.query(
   'UPDATE auth_sessions SET revoked=TRUE,revoked_at=NOW() WHERE session_token=$1 AND revoked=FALSE',
   [staleCookie],
  );
  assert.equal(changed.rowCount,1);
  const protectedRoute=await raw('/writers-studio','GET',{
   Cookie:'maia_session='+staleCookie,'x-session-token':headerToken,
  });
  assert.equal(protectedRoute.status,200,
   'verified Class A header must not be masked by revoked cookie');
  assert.match(protectedRoute.body,/Fictional private room/);
  const first=await fromPage(page,'/api/members/signout',{method:'POST'});
  assert.equal(first.status,200);
  assert.equal(first.data.serverSessionRevoked,false,
   'already-revoked cookie must not fabricate a new revocation');
  assert.equal((await context.cookies(origin)).some(c=>c.name==='maia_session'),false);
  const second=await fromPage(page,'/api/members/signout',{
   method:'POST',headers:{'x-session-token':headerToken},
  });
  assert.equal(second.status,200);
  assert.equal(second.data.serverSessionRevoked,true);
  assert.equal(await revoked(headerToken),true);
  const replay=await raw('/writers-studio','GET',{'x-session-token':headerToken});
  assert.notEqual(replay.status,200);
  assert.doesNotMatch(replay.body,/Fictional private room/);
 } finally { await context.close() }
});

test('Class A resolver denies different-member cookie and header behind actual Caddy',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try{
  await page.goto(origin+'/',{waitUntil:'load'});
  const cookie=await issue(page,'cookie','fixture_member');
  const other=await issue(page,'bearer','fixture_second');
  const privateRoom=await raw('/writers-studio','GET',{
    Cookie:'maia_session='+cookie,'x-session-token':other,
  });
  assert.notEqual(privateRoom.status,200,
   'different verified member identities must never be resolved by precedence');
  assert.doesNotMatch(privateRoom.body,/Fictional private room/);
  const conflict=await fromPage(page,'/api/members/signout',{
   method:'POST',headers:{'x-session-token':other},
  });
  assert.equal(conflict.status,409);
  assert.equal(conflict.data.success,false);
  assert.equal(await revoked(cookie),false);
  assert.equal(await revoked(other),false);
  assert.equal((await context.cookies(origin)).some(c=>c.name==='maia_session'),true);
 }finally{await context.close()}
});

test('Class A accepts two different same-member credentials but signout still separates them',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try{
  await page.goto(origin+'/',{waitUntil:'load'});
  const cookie=await issue(page,'cookie','fixture_member');
  const bearer=await issue(page,'bearer','fixture_member');
  const permitted=await raw('/writers-studio','GET',{
   Cookie:'maia_session='+cookie,'x-session-token':bearer,
  });
  assert.equal(permitted.status,200);
  assert.match(permitted.body,/Fictional private room/);
  const simultaneous=await fromPage(page,'/api/members/signout',{
   method:'POST',headers:{'x-session-token':bearer},
  });
  assert.equal(simultaneous.status,409,
   'different cookie/header tokens should never be silently chosen for mutation');
  assert.equal(await revoked(cookie),false);
  assert.equal(await revoked(bearer),false);
  assert.equal((await fromPage(page,'/api/members/signout',{method:'POST'})).data.serverSessionRevoked,true);
  assert.equal((await fromPage(page,'/api/members/signout',{
   method:'POST',headers:{'x-session-token':bearer},
  })).data.serverSessionRevoked,true);
  assert.equal(await revoked(cookie),true);
  assert.equal(await revoked(bearer),true);
 }finally{await context.close()}
});


test('real Class A password verification refuses fictional bad password before issuing a session',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try {
  await page.goto(origin+'/',{waitUntil:'load'});
  const count=await db.query(
   'SELECT count(*) AS n FROM auth_sessions s JOIN members m ON m.id=s.member_id WHERE m.username=$1',
   ['fixture_member']);
  const refused=await fromPage(page,'/api/members/signin',{
   method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({username:'fixture_member',password:'incorrect-fictional-password'}),
  });
  assert.equal(refused.status,401);
  assert.equal((await context.cookies(origin)).some(c=>c.name==='maia_session'),false);
  const nextCount=await db.query(
   'SELECT count(*) AS n FROM auth_sessions s JOIN members m ON m.id=s.member_id WHERE m.username=$1',
   ['fixture_member']);
  assert.equal(nextCount.rows[0].n,count.rows[0].n);
 }finally{await context.close()}
});

test('real Class A signin stays truthful if last_sign_in SQL metadata update fails',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try {
  await page.goto(origin+'/',{waitUntil:'load'});
  await db.query("CREATE FUNCTION stageq_fail_metadata() RETURNS trigger LANGUAGE plpgsql AS 'BEGIN RAISE EXCEPTION ''synthetic metadata failure''; END;'");
  await db.query('CREATE TRIGGER stageq_bad_metadata BEFORE UPDATE OF last_sign_in ON members FOR EACH ROW EXECUTE FUNCTION stageq_fail_metadata()');
  let answer;
  try {
   answer=await fromPage(page,'/api/members/signin',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username:'fixture_member',password:FIXTURE_PASSWORD}),
   });
  }finally{
   await db.query('DROP TRIGGER stageq_bad_metadata ON members');
   await db.query('DROP FUNCTION stageq_fail_metadata()');
  }
  assert.equal(answer.status,200);
  assert.equal(answer.data.success,true);
  assert.match(answer.data.session?.token,/^[0-9a-f]{64}$/);
  assert.equal(await revoked(answer.data.session.token),false);
  const stored=(await context.cookies(origin)).find(c=>c.name==='maia_session');
  assert.equal(stored?.httpOnly,true);
  assert.equal(stored?.secure,true);
 }finally{await context.close()}
});

test('real Class A signin refuses 503 without success after SQL session INSERT failure',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try {
  await page.goto(origin+'/',{waitUntil:'load'});
  await db.query("CREATE FUNCTION stageq_fail_session() RETURNS trigger LANGUAGE plpgsql AS 'BEGIN RAISE EXCEPTION ''synthetic session insert failure''; END;'");
  await db.query('CREATE TRIGGER stageq_bad_session BEFORE INSERT ON auth_sessions FOR EACH ROW EXECUTE FUNCTION stageq_fail_session()');
  let result;
  try {
   result=await fromPage(page,'/api/members/signin',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username:'fixture_member',password:FIXTURE_PASSWORD}),
   });
  }finally{
   await db.query('DROP TRIGGER stageq_bad_session ON auth_sessions');
   await db.query('DROP FUNCTION stageq_fail_session()');
  }
  assert.equal(result.status,503);
  assert.notEqual(result.data.success,true);
  assert.equal(result.data.session,undefined);
  assert.equal((await context.cookies(origin)).some(c=>c.name==='maia_session'),false);
 }finally{await context.close()}
});

test('exact-source custody for combined PR1870/Stage Q web candidate',()=>{
 const expected={
  'lib/auth/verifiedAccess.ts':'6a0821fedf2e921d2d7e7091cdb73da11d197296',
  'app/api/members/signin/route.ts':'4ea14beb385e83320cf6e586f990784fe47aacd8',
  'app/api/members/signout/route.ts':'5ef39a974759dc5d4f60bf5bf2eea375c7e7451e',
  'config/accessMatrix.ts':'a93c5d3d382037a68828ee5a7423106a03adad2f',
  'lib/auth/webSignOut.ts':'1fe1f1dda2d78216415d0c24b5e4f81963bedaca',
  'Caddyfile':'9cffaa85d5b42a05cd1de7eb0726d8435b3e5b69',
  'proxy.ts':'0c9f42abc46bd55e67b1857d4864e0a42574d2e6',
 };
 for(const [relative,sha] of Object.entries(expected)){
  const read=spawnSync('git',['hash-object',relative],{
   cwd:root,encoding:'utf8',timeout:10000,
  });
  assert.equal(read.status,0,'source must exist: '+relative);
  assert.equal(read.stdout.trim(),sha,'reviewed source blob changed: '+relative);
 }
});


/**
 * These tests mount ACTUAL reviewed JSX source for /signin and /studio/account
 * in WebKit. The Next handler/authorization/Caddy/PostgreSQL are exact source,
 * while non-auth devices/biometry, art and apiBase are inert fixture-only stubs.
 */
async function loginThroughRenderedForm(page) {
 await page.goto(origin+'/signin',{waitUntil:'load'});
 await page.getByPlaceholder('Email or username').fill('fixture_member');
 await page.getByPlaceholder('Password').fill(FIXTURE_PASSWORD);
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await page.waitForURL(origin+'/home',{timeout:16000});
 const token=await page.evaluate(()=>localStorage.getItem('maia_session_token'));
 assert.match(token||'',/^[0-9a-f]{64}$/);
 return token;
}

test('actual UnifiedAuth renders password entry and rejects incorrect bcrypt password',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try{
  await page.goto(origin+'/signin',{waitUntil:'load'});
  const name=page.getByPlaceholder('Email or username');
  const password=page.getByPlaceholder('Password');
  assert.equal(await name.isVisible(),true);
  assert.equal(await password.isVisible(),true);
  await name.fill('fixture_member');
  await password.fill('wrong-fixture-password');
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await page.getByText('Invalid username or password',{exact:true}).waitFor({timeout:12000});
  assert.match(page.url(),/\/signin/);
  assert.equal((await context.cookies(origin)).some(c=>c.name==='maia_session'),false);
 }finally{await context.close()}
});

test('actual UnifiedAuth successful password entry stores bearer and reaches fictional Home',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try{
  const token=await loginThroughRenderedForm(page);
  assert.equal(await revoked(token),false);
  const saved=(await context.cookies(origin)).find(c=>c.name==='maia_session');
  assert.ok(saved);
  assert.equal(saved.httpOnly,true);
  assert.equal(saved.secure,true);
  assert.equal(await page.getByTestId('fictional-home').isVisible(),true);
 }finally{await context.close()}
});

test('unconfirmed signout warning remains visible with still-valid cookie instead of silent redirect',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try{
  await page.goto(origin+'/',{waitUntil:'load'});
  const token=await issue(page);
  assert.equal(await revoked(token),false);
  await page.goto(origin+'/signin?signout=unconfirmed',{waitUntil:'load'});
  const warning=page.getByRole('alert').filter({hasText:'Server sign-out was not confirmed.'});
  await warning.getByText('Server sign-out was not confirmed.').waitFor({timeout:12000});
  // The real UI normally redirects to /home for a validated session. Here
  // the warning-state entry explicitly disables that redirect.
  await page.waitForTimeout(3400);
  assert.match(page.url(),/signout=unconfirmed/);
  assert.equal(await warning.isVisible(),true);
  assert.equal(await revoked(token),false);
 }finally{await context.close()}
});

test('actual Studio Account button revokes SQL-backed cookie and stored bearer then redirects',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try{
  const token=await loginThroughRenderedForm(page);
  await page.goto(origin+'/studio/account',{waitUntil:'load'});
  const button=page.getByRole('button',{name:'Sign out of this device'});
  await button.waitFor({timeout:15000});
  const statusCodes=[];
  page.on('response',response=>{
   if(new URL(response.url()).pathname==='/api/members/signout')
    statusCodes.push(response.status());
  });
  await button.click();
  try {
   await page.waitForURL(/\/signin\?from=signout/,{timeout:12000});
  }catch{
   const dialog=page.getByRole('alertdialog');
   const summary={
    endpointStatuses:statusCodes,
    dialogVisible:await dialog.isVisible().catch(()=>false),
    dialogText:(await dialog.innerText().catch(()=>'' )).slice(0,600),
    stillAtStudio:page.url().includes('/studio/account'),
    sqlSessionRevoked:await revoked(token),
    cookiePresent:(await context.cookies(origin)).some(c=>c.name==='maia_session'),
    storedBearerPresent:await page.evaluate(()=>!!localStorage.getItem('maia_session_token')),
   };
   throw Error('UI signout did not navigate: '+JSON.stringify(summary));
  }
  assert.equal(await revoked(token),true);
  assert.equal((await context.cookies(origin)).some(c=>c.name==='maia_session'),false);
  assert.equal(await page.evaluate(()=>localStorage.getItem('maia_session_token')),null);
 }finally{await context.close()}
});

test('actual Studio Account shows partial SQL failure and explicit local-only exit',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try{
  const token=await loginThroughRenderedForm(page);
  await page.goto(origin+'/studio/account',{waitUntil:'load'});
  await page.getByRole('button',{name:'Sign out of this device'}).waitFor({timeout:15000});
  await trigger(true);
  try{
   await page.getByRole('button',{name:'Sign out of this device'}).click();
   const modal=page.getByRole('alertdialog',{name:'Sign-out could not be confirmed'});
   await modal.waitFor({timeout:18000});
   assert.equal(await modal.getByRole('button',{name:'Stay here'}).isVisible(),true);
   if(!(await modal.getByRole('button',{name:'Clear this device only'}).isVisible().catch(()=>false))){
    const summary={
     dialogText:(await modal.innerText()).slice(0,600),
     sessionRevoked:await revoked(token),
     cookiePresent:(await context.cookies(origin)).some(c=>c.name==='maia_session'),
     urlAtStudio:page.url().includes('/studio/account'),
    };
    throw Error('No local-only option after injected SQL revocation failure: '+JSON.stringify(summary));
   }
   assert.equal(await modal.getByRole('button',{name:'Retry sign-out'}).count(),0);
   assert.equal(await page.evaluate(()=>document.activeElement?.textContent?.trim()),'Stay here');
   assert.equal(await revoked(token),false);
   assert.equal((await context.cookies(origin)).some(c=>c.name==='maia_session'),false);
   await modal.getByRole('button',{name:'Clear this device only'}).click();
   await page.waitForURL(/\/signin\?signout=unconfirmed/,{timeout:15000});
   assert.equal(await page.getByRole('alert').filter({hasText:'Server sign-out was not confirmed.'}).isVisible(),true);
   assert.equal(await page.evaluate(()=>localStorage.getItem('maia_session_token')),null);
   assert.equal(await revoked(token),false);
  }finally{await trigger(false)}
 }finally{await context.close()}
});

test('actual Studio Account refuses local-only exit without HttpOnly cookie-clearing proof',async()=>{
 const context=await browserContext(),page=await context.newPage();
 try{
  const token=await loginThroughRenderedForm(page);
  await page.goto(origin+'/studio/account',{waitUntil:'load'});
  await page.getByRole('button',{name:'Sign out of this device'}).waitFor({timeout:15000});
  // Browser transport failure/403 is synthetic. It must not trigger server
  // revocation or allow a false local-only exit.
  await page.route('**/api/members/signout',route=>route.fulfill({
   status:403,contentType:'application/json',
   body:JSON.stringify({success:false,error:'Fictional Origin denial'}),
  }));
  await page.getByRole('button',{name:'Sign out of this device'}).click();
  const modal=page.getByRole('alertdialog',{name:'Sign-out could not be confirmed'});
  await modal.waitFor({timeout:15000});
  assert.equal(await modal.getByRole('button',{name:'Retry sign-out'}).isVisible(),true);
  assert.equal(await modal.getByRole('button',{name:'Clear this device only'}).count(),0);
  assert.equal((await context.cookies(origin)).some(c=>c.name==='maia_session'),true);
  assert.equal(await revoked(token),false);
  await modal.getByRole('button',{name:'Stay here'}).click();
  assert.equal(await modal.count(),0);
  assert.match(page.url(),/\/studio\/account/);
 }finally{await context.close()}
});
