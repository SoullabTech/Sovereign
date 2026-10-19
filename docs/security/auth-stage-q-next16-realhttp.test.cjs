/**
 * Stage Q: actual compiled Next16 proxy + strict access matrix over ephemeral
 * HTTPS and a real, fictional PostgreSQL 14 service. Tests only reduced
 * disposable fixture endpoints; NOT Caddy, full Soullab UI, or Apple Safari.
 */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const crypto=require('node:crypto'),http=require('node:http'),https=require('node:https');
const {spawn,spawnSync}=require('node:child_process');
const {Client}=require('pg'),{webkit}=require('playwright');
const root=path.resolve(__dirname,'../..');
const fixture=path.join(os.tmpdir(),'soullab-stageq-next16-'+
  (process.env.GITHUB_SHA||'isolated-local').slice(0,16));
const httpsPort=3844,nextPort=3829,origin='https://127.0.0.1:'+httpsPort;
const guard='stageq-next16-fictional-only';
if(process.env.STAGE_Q_NEXT16_DISPOSABLE!==guard||
   process.env.PGHOST!=='127.0.0.1'||
   Number(process.env.PGPORT)!==5549||
   process.env.PGDATABASE!=='stageq_next16_fictional'||
   process.env.PGUSER!=='stageq_next16_fixture'||
   !process.env.DATABASE_URL?.includes('127.0.0.1:5549/stageq_next16_fictional')){
 throw Error('Refusing untrusted Next16/PostgreSQL runtime target');
}
if(!fs.existsSync(path.join(fixture,'.stageq-fixture'))||
   fs.readFileSync(path.join(fixture,'.stageq-fixture'),'utf8')!==guard||
   !fs.existsSync(path.join(fixture,'.next/BUILD_ID'))){
 throw Error('No exact disposable Next16 build exists');
}
const build=JSON.parse(fs.readFileSync(path.join(fixture,'STAGE_Q_BUILD_MANIFEST.json'),'utf8'));
if(build.sourceCommit!==(process.env.GITHUB_SHA||'isolated-local')||
   build.sourceFiles.length!==9){
 throw Error('Discrepant Next16 source custody manifest');
}
let db,next,proxy,browser,tlsDir;
let logTail='';
const logs=(chunk)=>{
 const text=String(chunk);
 // Do not disclose bearer tokens or fixture-only credentials in diagnostics.
 logTail=(logTail+text).slice(-9000)
  .replace(/\b[0-9a-f]{64}\b/ig,'[redacted-token]')
  .replace(/stageq_next16_fictional_password_only/g,'[redacted-secret]');
};
async function eventually(fn,label,ms=60000){
 const deadline=Date.now()+ms;
 let last;
 while(Date.now()<deadline){
  try{return await fn()}catch(e){last=e;await new Promise(r=>setTimeout(r,350))}
 }
 throw Error(label+' did not become ready: '+String(last||'timeout').slice(0,250)+
  ' tail='+logTail.slice(-1200));
}
function startNext(){
 next=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),
  'start','--hostname','127.0.0.1','--port',String(nextPort)],{
   cwd:fixture,
   env:{...process.env,NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',
    ACCESS_CONTROL_MODE:'strict',
    AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS:origin,
    NEXT_PUBLIC_ROOT_DOMAIN:'stageq-fiction.invalid'},
   stdio:['ignore','pipe','pipe'],
 });
 next.stdout.on('data',logs);next.stderr.on('data',logs);
}
async function httpReady(){
 return new Promise((resolve,reject)=>{
  const req=http.get({hostname:'127.0.0.1',port:nextPort,path:'/',timeout:2500},
   res=>{res.resume();res.on('end',()=>{
    if(res.statusCode===200)resolve();else reject(Error('HTTP '+res.statusCode));
   })});
  req.on('error',reject);req.on('timeout',()=>req.destroy(Error('not ready')));
 });
}
function proxyRequest(req,res){
 const headers={...req.headers,
  host:req.headers.host,
  'x-forwarded-proto':'https',
  'x-forwarded-host':req.headers.host};
 const upstream=http.request({
  host:'127.0.0.1',port:nextPort,path:req.url,method:req.method,headers,
 },up=>{
  res.writeHead(up.statusCode||502,up.headers);
  up.pipe(res);
 });
 upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502);res.end();});
 req.pipe(upstream);
}
async function startProxy(){
 tlsDir=fs.mkdtempSync(path.join(os.tmpdir(),'stageq-next16-tls-'));
 const key=path.join(tlsDir,'key.pem'),cert=path.join(tlsDir,'cert.pem');
 const p=spawnSync('openssl',[
  'req','-x509','-nodes','-newkey','rsa:2048','-days','1',
  '-keyout',key,'-out',cert,'-subj','/CN=127.0.0.1',
  '-addext','subjectAltName=IP:127.0.0.1',
 ],{stdio:'ignore'});
 assert.equal(p.status,0,'Ephemeral loopback TLS generation failed');
 fs.chmodSync(key,0o600);
 proxy=https.createServer({key:fs.readFileSync(key),cert:fs.readFileSync(cert)},
  proxyRequest);
 await new Promise((resolve,reject)=>{
  proxy.once('error',reject);proxy.listen(httpsPort,'127.0.0.1',resolve);
 });
}
async function pageWithContext(){
 const context=await browser.newContext({ignoreHTTPSErrors:true});
 const page=await context.newPage();
 await page.goto(origin+'/',{waitUntil:'load'});
 return {context,page};
}
async function fromWeb(page,route,options={}){
 return page.evaluate(async ({route,options})=>{
  const r=await fetch(route,{
   credentials:'same-origin',redirect:'manual',cache:'no-store',...options});
  const type=r.headers.get('content-type')||'';
  let data=null;
  if(type.includes('json'))data=await r.json();
  else data=await r.text();
  return {status:r.status,body:data,redirect:r.headers.get('location')};
 },{route,options});
}
async function issue(page,username='fixture_member',transport='cookie'){
 const r=await fromWeb(page,'/api/members/signin',{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({username,transport})});
 assert.equal(r.status,200,'Fixture session issuance failed');
 assert.equal(r.body.fixture,true);
 assert.match(r.body.token,/^[a-f0-9]{64}$/);
 return r.body.token;
}
async function statusOf(token){
 const r=await db.query('SELECT revoked,expires_at FROM auth_sessions WHERE session_token=$1',[token]);
 return r.rows[0];
}
async function raw(route,method='GET',headers={},body=null){
 return new Promise((resolve,reject)=>{
  const req=https.request({
   hostname:'127.0.0.1',port:httpsPort,path:route,method,
   rejectUnauthorized:false,headers:{...headers,Host:'127.0.0.1:'+httpsPort},
   timeout:8000,
  },res=>{
   let data='';
   res.on('data',x=>data+=String(x));
   res.on('end',()=>resolve({status:res.statusCode,body:data,headers:res.headers}));
  });
  req.on('error',reject);req.on('timeout',()=>req.destroy(Error('request timed out')));
  if(body)req.write(body);
  req.end();
 });
}
async function sqlRevocationTrigger(on){
 if(on){
  await db.query(
   "CREATE FUNCTION stageq_next16_deny_revoke() RETURNS trigger LANGUAGE plpgsql AS $$ "+
   "BEGIN RAISE EXCEPTION 'fictional SQL revocation failure'; END; $$");
  await db.query(
   'CREATE TRIGGER stageq_next16_no_revoke BEFORE UPDATE OF revoked ON auth_sessions '+
   'FOR EACH ROW EXECUTE FUNCTION stageq_next16_deny_revoke()');
 }else{
  await db.query('DROP TRIGGER stageq_next16_no_revoke ON auth_sessions');
  await db.query('DROP FUNCTION stageq_next16_deny_revoke()');
 }
}
test.before(async()=>{
 db=new Client({
  host:'127.0.0.1',port:5549,database:'stageq_next16_fictional',
  user:'stageq_next16_fixture',password:process.env.PGPASSWORD,
  connectionTimeoutMillis:4000,
 });
 await db.connect();
 const meta=await db.query('SELECT current_database() db,current_user usr');
 assert.equal(meta.rows[0].db,'stageq_next16_fictional');
 assert.equal(meta.rows[0].usr,'stageq_next16_fixture');
 await db.query("CREATE TABLE members(id UUID PRIMARY KEY,username TEXT UNIQUE NOT NULL,"+
  "tier TEXT DEFAULT 'free',roles TEXT[] DEFAULT ARRAY['member'])");
 await db.query(fs.readFileSync(path.join(root,
  'database/migrations/20260119000001_auth_sessions.sql'),'utf8'));
 for(const name of ['fixture_member','fixture_second']){
  await db.query('INSERT INTO members(id,username,tier,roles) VALUES($1,$2,$3,$4)',
   [crypto.randomUUID(),name,'free',['member']]);
 }
 startNext();
 await eventually(httpReady,'Real Next16 HTTP server');
 await startProxy();
 browser=await webkit.launch({headless:true});
});
test.after(async()=>{
 if(browser)await browser.close();
 if(proxy)await new Promise(resolve=>proxy.close(resolve));
 if(next){
  next.kill('SIGTERM');
  await Promise.race([
   new Promise(resolve=>next.once('exit',resolve)),
   new Promise(resolve=>setTimeout(resolve,5000)),
  ]);
  if(next.exitCode===null&&!next.killed)next.kill('SIGKILL');
 }
 if(db)await db.end();
 if(tlsDir)fs.rmSync(tlsDir,{recursive:true,force:true});
});
test('strict real Next proxy denies anonymous protected room and unmapped member API',async()=>{
 const {context,page}=await pageWithContext();
 try{
  await page.goto(origin+'/writers-studio',{waitUntil:'load'});
  assert.match(page.url(),/\/signin/);
  assert.equal(await page.locator('[data-testid="protected-room"]').count(),0);
  const unpublished=await fromWeb(page,'/api/members/undocumented');
  assert.equal(unpublished.status,404);
  assert.doesNotMatch(String(unpublished.body),/MUST_NOT_BE_REACHABLE/);
 }finally{await context.close()}
});
test('real Next session cookie is Secure/HttpOnly, role server-derived; signout and replay denial',async()=>{
 const {context,page}=await pageWithContext();
 try{
  const token=await issue(page);
  const cookies=await context.cookies(origin);
  const c=cookies.find(x=>x.name==='maia_session');
  assert.ok(c);
  assert.equal(c.secure,true);assert.equal(c.httpOnly,true);
  assert.equal(await page.evaluate(()=>document.cookie.includes('maia_session')),false);
  await page.goto(origin+'/writers-studio',{waitUntil:'load'});
  const room=page.locator('[data-testid="protected-room"]');
  assert.equal(await room.count(),1);
  assert.equal(await room.getAttribute('data-authed'),'true');
  assert.equal(await room.getAttribute('data-roles'),'member');
  const noBypass=await raw('/api/members/undocumented','GET',
   {'Cookie':'maia_session='+token,'x-access-roles':'admin'});
  assert.equal(noBypass.status,404);
  assert.equal((await statusOf(token)).revoked,false);
  const out=await fromWeb(page,'/api/members/signout',{method:'POST'});
  assert.equal(out.status,200);
  assert.equal(out.body.serverSessionRevoked,true);
  assert.equal((await statusOf(token)).revoked,true);
  assert.equal((await context.cookies(origin)).some(x=>x.name==='maia_session'),false);
  const reuse=await raw('/writers-studio','GET',{'x-session-token':token});
  assert.notEqual(reuse.status,200);
  assert.doesNotMatch(reuse.body,/Fictional private room/);
 }finally{await context.close()}
});
test('Next handler denies GET, missing/null/foreign Origin and hostile cross-site requests',async()=>{
 const {context,page}=await pageWithContext();
 try{
  const token=await issue(page);
  const h={'Cookie':'maia_session='+token};
  const getter=await raw('/api/members/signout','GET',h);
  assert.equal(getter.status,405);
  for(const originHeader of [null,'null','https://foreign.invalid']){
   const headers={...h,'Sec-Fetch-Site':'cross-site'};
   if(originHeader!==null)headers.Origin=originHeader;
   const denial=await raw('/api/members/signout','POST',headers);
   assert.equal(denial.status,403);
   assert.equal((await statusOf(token)).revoked,false);
  }
  const forged=await raw('/api/members/signout','POST',{
    ...h,Origin:'https://foreign.invalid','x-forwarded-host':'127.0.0.1:3844',
    'Sec-Fetch-Site':'same-origin',
  });
  assert.equal(forged.status,403);
  assert.equal((await statusOf(token)).revoked,false);
 }finally{await context.close()}
});
test('separate Next HTTPS cookie and bearer revocations; conflicting credentials fail closed',async()=>{
 const {context,page}=await pageWithContext();
 try{
  const a=await issue(page);
  const b=await issue(page,'fixture_member','bearer');
  const conflict=await fromWeb(page,'/api/members/signout',{
   method:'POST',headers:{'x-session-token':b}});
  assert.equal(conflict.status,409);
  assert.equal((await statusOf(a)).revoked,false);
  assert.equal((await statusOf(b)).revoked,false);
  const first=await fromWeb(page,'/api/members/signout',{method:'POST'});
  assert.equal(first.status,200);
  assert.equal(first.body.serverSessionRevoked,true);
  assert.equal((await statusOf(a)).revoked,true);
  const second=await fromWeb(page,'/api/members/signout',{
   method:'POST',headers:{'x-session-token':b}});
  assert.equal(second.status,200);
  assert.equal(second.body.serverSessionRevoked,true);
  assert.equal((await statusOf(b)).revoked,true);
  const replay=await raw('/writers-studio','GET',{'x-session-token':b});
  assert.notEqual(replay.status,200);
 }finally{await context.close()}
});
test('real SQL trigger failure: Next returns 503 with cookie expiration; bearer retry revokes',async()=>{
 const {context,page}=await pageWithContext();
 try{
  const token=await issue(page);
  await sqlRevocationTrigger(true);
  let refused;
  try{
   refused=await fromWeb(page,'/api/members/signout',{method:'POST'});
  }finally{await sqlRevocationTrigger(false)}
  assert.equal(refused.status,503);
  assert.equal(refused.body.success,false);
  assert.equal(refused.body.serverSessionRevoked,false);
  assert.equal(refused.body.localCookiesCleared,true);
  assert.equal((await context.cookies(origin)).some(x=>x.name==='maia_session'),false);
  assert.equal((await statusOf(token)).revoked,false);
  const retry=await fromWeb(page,'/api/members/signout',{
   method:'POST',headers:{'x-session-token':token}});
  assert.equal(retry.status,200);
  assert.equal(retry.body.serverSessionRevoked,true);
  assert.equal((await statusOf(token)).revoked,true);
 }finally{await context.close()}
});
test('expired or already-revoked fictional token clears cookies without inventing revocation',async()=>{
 const {context,page}=await pageWithContext();
 try{
  const token=await issue(page);
  await db.query('UPDATE auth_sessions SET expires_at=NOW()-INTERVAL \'1 day\' WHERE session_token=$1',[token]);
  const denied=await raw('/writers-studio','GET',{'Cookie':'maia_session='+token});
  assert.notEqual(denied.status,200);
  const clear=await fromWeb(page,'/api/members/signout',{method:'POST'});
  assert.equal(clear.status,200);
  assert.equal(clear.body.serverSessionRevoked,true);
  const again=await fromWeb(page,'/api/members/signout',{
   method:'POST',headers:{'x-session-token':token}});
  assert.equal(again.status,200);
  assert.equal(again.body.serverSessionRevoked,false);
 }finally{await context.close()}
});