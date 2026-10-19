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
if(edge.sourceCommit!==sha||edge.sourceCaddyBlob!=='9cffaa85d5b42a05cd1de7eb0726d8435b69'||
 edge.upstreamCount!==5||edge.preservedHostHeaderCount!==5){
 throw Error('Caddy source custody/route shape mismatch');
}
const sourceManifest=JSON.parse(fs.readFileSync(
 path.join(nextFixture,'STAGE_Q_BUILD_MANIFEST.json'),'utf8'));
if(sourceManifest.sourceCommit!==sha||sourceManifest.sourceFiles.length!==9)
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
 const answer=await fromPage(page,'/api/members/signin',{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({username,transport}),
 });
 assert.equal(answer.status,200,'Fictional Next sign-in must pass Caddy');
 assert.equal(answer.data.fixture,true);
 assert.match(answer.data.token,/^[0-9a-f]{64}$/);
 return answer.data.token;
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
 await db.query("CREATE TABLE members(id UUID PRIMARY KEY,username TEXT UNIQUE NOT NULL,tier TEXT DEFAULT 'free',roles TEXT[] DEFAULT ARRAY['member'])");
 await db.query(fs.readFileSync(path.join(root,'database/migrations/20260119000001_auth_sessions.sql'),'utf8'));
 for(const name of ['fixture_member','fixture_second']){
  await db.query("INSERT INTO members(id,username,tier,roles) VALUES($1,$2,'free',ARRAY['member'])",
   [crypto.randomUUID(),name]);
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