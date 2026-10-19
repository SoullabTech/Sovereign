/**
 * Stage Q — actual Next.js 16 proxy/signin/signout behind disposable Caddy HTTPS.
 * Fresh fictional PostgreSQL, WebKit + independent raw HTTPS negative probes.
 *
 * The app fixture is assembled from reviewed, Git-blob-verified source by
 * auth-stage-q-next16-fixture-build.cjs. Only its display-name helper is stubbed.
 *
 * No network calls other than loopback to the isolated CI database or HTTPS
 * endpoint. Caddy runs in its own temporary Docker container on localhost.
 */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const http=require('node:http'),https=require('node:https');
const cp=require('node:child_process'),crypto=require('node:crypto');
const {Client}=require('pg'),bcrypt=require('bcrypt'),{webkit}=require('playwright');

const required={
  sentinel:'fictional-next16-ci-only',
  host:'127.0.0.1', pgport:5550, db:'stageq_next_fictional',
  dbUser:'stageq_next_fixture', nextPort:3827, httpsPort:443,
};
if(process.env.STAGE_Q_NEXT_FIXTURE!==required.sentinel ||
   process.env.PGHOST!==required.host ||
   Number(process.env.PGPORT)!==required.pgport ||
   process.env.PGDATABASE!==required.db ||
   process.env.PGUSER!==required.dbUser){
 throw Error('Refusing any non-disposable or non-loopback target');
}
const workspace=path.resolve(__dirname,'../..');
const fixture=path.join(process.env.RUNNER_TEMP||os.tmpdir(),'stageq-next16-fictional');
const origin='https://'+required.host;
const nextOrigin='http://'+required.host+':'+required.nextPort;
const reverseName='stageq-caddy-fixture-'+process.pid;
let db,browser,nextProcess,caddyProcess,tmpdir,memberRecord;
const processLogs=[];

function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function rememberProcess(proc,name){
 const add=data=>{
  const text=String(data).replace(/[A-Fa-f0-9]{64}/g,'[redacted-token]');
  for(const line of text.split('\n').filter(Boolean)){
   processLogs.push(name+' '+line.slice(0,240));
   if(processLogs.length>80)processLogs.shift();
  }
 };
 proc.stdout?.on('data',add);
 proc.stderr?.on('data',add);
}
async function probe(url,{httpsOnly=false,headers={}}={}){
 return new Promise((resolve,reject)=>{
  const client=httpsOnly?https:http;
  const req=client.request(url,{
   method:'GET',headers,
   ...(httpsOnly?{rejectUnauthorized:false}:{}),
   timeout:1800,
  },res=>{
   res.resume();res.on('end',()=>resolve(res.statusCode));
  });
  req.on('error',reject);
  req.on('timeout',()=>req.destroy(Error('Fixture probe timeout')));
  req.end();
 });
}
async function ready(url,portIsTls=false){
 for(let i=0;i<100;i++){
  try{
   const s=await probe(url,{httpsOnly:portIsTls});
   if(s>=200&&s<500)return;
  }catch{}
  await sleep(350);
 }
 throw Error('Disposable service did not start: '+(portIsTls?'HTTPS Caddy':'Next16')+
  ' recent='+processLogs.slice(-8).join(' | '));
}
function tlsFiles(){
 tmpdir=fs.mkdtempSync(path.join(os.tmpdir(),'stageq-caddy-'));
 fs.chmodSync(tmpdir,0o700);
 const key=path.join(tmpdir,'fictional.key'),crt=path.join(tmpdir,'fictional.crt');
 const result=cp.spawnSync('openssl',[
  'req','-x509','-nodes','-newkey','rsa:2048','-days','1',
  '-keyout',key,'-out',crt,
  '-subj','/CN=127.0.0.1','-addext','subjectAltName=IP:127.0.0.1',
 ],{stdio:'ignore'});
 assert.equal(result.status,0,'Ephemeral loopback certificate generation');
 fs.chmodSync(key,0o600);
 const caddy=[
  'https://127.0.0.1 {',
  ' tls /fixture/fictional.crt /fixture/fictional.key',
  ' reverse_proxy 127.0.0.1:'+required.nextPort+' {',
  '   header_up Host {http.request.host}',
  ' }',
  '}',
 ].join('\n')+'\n';
 fs.writeFileSync(path.join(tmpdir,'Caddyfile'),caddy,{mode:0o600});
}
async function seedMember(role='member'){
 const id=crypto.randomUUID();
 const username='fiction_'+id.replace(/-/g,'').slice(0,13);
 const password='fixture-password-'+crypto.randomUUID();
 const hash=await bcrypt.hash(password,12);
 await db.query(
  "INSERT INTO members (id,username,email,password_hash,name,preferred_name,tier,roles) VALUES($1,$2,$3,$4,'Fictional member','Fictional member','free',$5)",
  [id,username,username+'@example.invalid',hash,[role]]
 );
 return{id,username,password};
}
async function tokenRevoked(token){
 const r=await db.query('SELECT revoked FROM auth_sessions WHERE session_token=$1',[token]);
 return r.rows[0]?.revoked;
}
async function browserPage(){
 const context=await browser.newContext({ignoreHTTPSErrors:true});
 const page=await context.newPage();
 await page.goto(origin+'/',{waitUntil:'load'});
 return{context,page};
}
async function webCall(page,endpoint,{method='GET',body=null,headers={}}={}){
 return page.evaluate(async input=>{
  const res=await fetch(input.endpoint,{
   method:input.method,credentials:'same-origin',redirect:'manual',
   cache:'no-store',headers:input.headers,
   ...(input.body!==null?{body:JSON.stringify(input.body)}:{}),
  });
  const raw=await res.text();
  let data=null;try{data=JSON.parse(raw)}catch{data=raw.slice(0,200)}
  return{status:res.status,data};
 },{endpoint,method,body,headers});
}
async function signIn(page,member){
 const r=await webCall(page,'/api/members/signin',{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:{username:member.username,password:member.password},
 });
 assert.equal(r.status,200,'Real Next sign-in must succeed');
 assert.equal(r.data.success,true);
 assert.ok(r.data.session?.token);
 return r.data.session.token;
}
async function rawPost(endpoint,{originHeader,token}={}){
 return new Promise((resolve,reject)=>{
  const headers={'Content-Type':'application/json'};
  if(originHeader!==undefined)headers.Origin=originHeader;
  if(token)headers.Cookie='maia_session='+token;
  const req=https.request(origin+endpoint,{
   method:'POST',rejectUnauthorized:false,headers,timeout:2500,
  },res=>{
   let raw='';res.on('data',chunk=>{raw+=chunk;});
   res.on('end',()=>{let data;try{data=JSON.parse(raw)}catch{data=null}
    resolve({status:res.statusCode,data,headers:res.headers});
   });
  });
  req.on('timeout',()=>req.destroy(Error('Raw loopback request timeout')));
  req.on('error',reject);req.end('{}');
 });
}
test.before(async()=>{
 assert.ok(fs.existsSync(path.join(fixture,'.next','BUILD_ID')),'A genuine compiled Next build is mandatory');
 db=new Client({
  host:required.host,port:required.pgport,database:required.db,
  user:required.dbUser,password:process.env.PGPASSWORD,
  connectionTimeoutMillis:5000,
 });
 await db.connect();
 const identity=await db.query('SELECT current_database() AS db,current_user AS usr');
 assert.equal(identity.rows[0].db,required.db);
 assert.equal(identity.rows[0].usr,required.dbUser);
 await db.query([
  'CREATE TABLE members (',
  ' id UUID PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE,',
  ' passkey TEXT, password_hash TEXT, name TEXT, preferred_name TEXT,',
  " onboarded BOOLEAN DEFAULT TRUE, onboarding_step TEXT, tier TEXT DEFAULT 'free',",
  " roles TEXT[] DEFAULT ARRAY['member'], subscription_active BOOLEAN DEFAULT FALSE,",
  ' subscription_expires_at TIMESTAMPTZ, has_webauthn BOOLEAN DEFAULT FALSE,',
  " preferred_auth_method TEXT DEFAULT 'password', must_reset_password BOOLEAN DEFAULT FALSE,",
  ' last_sign_in TIMESTAMPTZ',
  ')',
 ].join('\n'));
 for(const migration of [
  '20260119000001_auth_sessions.sql',
  '20260119000004_auth_rate_limits.sql',
  '20260828000001_audit_logs.sql',
 ]){
  await db.query(fs.readFileSync(path.join(workspace,'database/migrations',migration),'utf8'));
 }
 memberRecord=await seedMember('member');
 tlsFiles();
 const childEnv={...process.env,
  NODE_ENV:'production',NODE_OPTIONS:'--max-old-space-size=4096',
  PORT:String(required.nextPort),HOSTNAME:'127.0.0.1',
  DATABASE_URL:'postgresql://'+required.dbUser+':'+encodeURIComponent(process.env.PGPASSWORD)+
   '@127.0.0.1:'+required.pgport+'/'+required.db,
  AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS:origin,
  ACCESS_CONTROL_MODE:'strict',
  NEXT_PUBLIC_ROOT_DOMAIN:'soullab.life',
  NEXT_TELEMETRY_DISABLED:'1',
 };
 nextProcess=cp.spawn(process.execPath,[
  path.join(workspace,'node_modules/next/dist/bin/next'),'start',
  '--hostname',required.host,'--port',String(required.nextPort),
 ],{cwd:fixture,env:childEnv,stdio:['ignore','pipe','pipe']});
 rememberProcess(nextProcess,'Next');
 await ready(nextOrigin+'/');
 caddyProcess=cp.spawn('docker',[
  'run','--rm','--name',reverseName,'--network','host',
  '--mount','type=bind,src='+tmpdir+',dst=/fixture,readonly',
  'caddy:2.10-alpine','caddy','run','--config','/fixture/Caddyfile',
  '--adapter','caddyfile',
 ],{stdio:['ignore','pipe','pipe']});
 rememberProcess(caddyProcess,'Caddy');
 await ready(origin+'/',true);
 browser=await webkit.launch({headless:true});
});

test.after(async()=>{
 try{if(browser)await browser.close()}catch{}
 if(caddyProcess){
  cp.spawnSync('docker',['stop','-t','2',reverseName],{stdio:'ignore',timeout:8000});
  caddyProcess.kill('SIGTERM');
 }
 if(nextProcess)nextProcess.kill('SIGTERM');
 if(db)await db.end();
 if(tmpdir)fs.rmSync(tmpdir,{recursive:true,force:true});
});

test('real Next16 Proxy strict gate denies anonymous and unmapped API paths',async()=>{
 const {context,page}=await browserPage();
 try{
  const unauthed=await webCall(page,'/api/sovereign/stageq');
  assert.equal(unauthed.status,401,'Proxy must deny protected route');
  const missing=await webCall(page,'/api/members/unmapped-stageq');
  assert.equal(missing.status,404,'Strict matrix must deny unmapped member route');
  assert.match(JSON.stringify(missing.data),/not configured in the access matrix/i);
 }finally{await context.close()}
});

test('real Next sign-in creates Secure/HttpOnly cookie; proxy derives identity and rejects forged access roles',async()=>{
 const {context,page}=await browserPage();
 try{
  const token=await signIn(page,memberRecord);
  const cookies=await context.cookies(origin);
  const session=cookies.find(x=>x.name==='maia_session');
  assert.ok(session,'Real Next route must issue maia_session cookie');
  assert.equal(session.secure,true);assert.equal(session.httpOnly,true);
  assert.equal(await page.evaluate(()=>document.cookie.includes('maia_session')),false);
  const allowed=await webCall(page,'/api/sovereign/stageq',{
   headers:{'x-access-roles':'admin','x-access-tier':'pro','x-access-authed':'true'},
  });
  assert.equal(allowed.status,200);
  assert.equal(allowed.data.authed,'true');
  assert.equal(allowed.data.memberId,memberRecord.id);
  assert.equal(allowed.data.tier,'free');
  assert.equal(allowed.data.roles,'member');
  assert.equal(allowed.data.host,'127.0.0.1');
  assert.equal(allowed.data.forwardedProto,'https');
  const admin=await webCall(page,'/admin');
  assert.equal(admin.status,403,'Nonadmin must not bypass founder role by tier waiver');
  const out=await webCall(page,'/api/members/signout',{method:'POST'});
  assert.equal(out.status,200);
  assert.equal(out.data.serverSessionRevoked,true);
  assert.equal(await tokenRevoked(token),true);
  assert.equal((await context.cookies(origin)).some(x=>x.name==='maia_session'),false);
  assert.equal((await webCall(page,'/api/sovereign/stageq')).status,401);
  assert.equal((await webCall(page,'/api/sovereign/stageq',{
   headers:{'x-session-token':token},
  })).status,401);
 }finally{await context.close()}
});

test('browser header-only bearer revokes without cookie, with repeat denial',async()=>{
 const {context,page}=await browserPage();
 try{
  const token=await signIn(page,memberRecord);
  await context.clearCookies();
  const accessible=await webCall(page,'/api/sovereign/stageq',{
   headers:{'x-session-token':token},
  });
  assert.equal(accessible.status,200);
  const out=await webCall(page,'/api/members/signout',{
   method:'POST',headers:{'x-session-token':token},
  });
  assert.equal(out.status,200);assert.equal(out.data.serverSessionRevoked,true);
  assert.equal(await tokenRevoked(token),true);
  assert.equal((await webCall(page,'/api/sovereign/stageq',{
   headers:{'x-session-token':token},
  })).status,401);
 }finally{await context.close()}
});

test('Caddy + Next preserve origin/Host refusal and strict signout method',async()=>{
 const {context,page}=await browserPage();
 try{
  const token=await signIn(page,memberRecord);
  const nullOrigin=await rawPost('/api/members/signout',{originHeader:'null',token});
  assert.equal(nullOrigin.status,403);
  const foreign=await rawPost('/api/members/signout',{originHeader:'https://foreign.invalid',token});
  assert.equal(foreign.status,403);
  const absent=await rawPost('/api/members/signout',{token});
  assert.equal(absent.status,403);
  assert.equal(await tokenRevoked(token),false,'Foreign origins must not revoke');
  const get=await webCall(page,'/api/members/signout');
  assert.equal(get.status,405);
  const allowed=await webCall(page,'/api/members/signout',{method:'POST'});
  assert.equal(allowed.status,200);
 }finally{await context.close()}
});

test('SQL revocation refusal gives real Next 503 and cookie clearing; recovery succeeds',async()=>{
 const {context,page}=await browserPage();
 try{
  const token=await signIn(page,memberRecord);
  await db.query(
   "CREATE FUNCTION stageq_next_reject_revocation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fiction-only'; END; $$"
  );
  await db.query('CREATE TRIGGER stageq_next_revoke_block BEFORE UPDATE OF revoked ON auth_sessions FOR EACH ROW EXECUTE FUNCTION stageq_next_reject_revocation()');
  let first;
  try{first=await webCall(page,'/api/members/signout',{method:'POST'})}
  finally{
   await db.query('DROP TRIGGER stageq_next_revoke_block ON auth_sessions');
   await db.query('DROP FUNCTION stageq_next_reject_revocation()');
  }
  assert.equal(first.status,503);
  assert.equal(first.data.serverSessionRevoked,false);
  assert.equal(first.data.localCookiesCleared,true);
  assert.equal((await context.cookies(origin)).some(x=>x.name==='maia_session'),false);
  assert.equal(await tokenRevoked(token),false);
  const retry=await webCall(page,'/api/members/signout',{
   method:'POST',headers:{'x-session-token':token},
  });
  assert.equal(retry.status,200);assert.equal(retry.data.serverSessionRevoked,true);
  assert.equal(await tokenRevoked(token),true);
 }finally{await context.close()}
});

test('Next16 post-issuance metadata SQL fault reports issued session truthfully',async()=>{
 const {context,page}=await browserPage();
 try{
  await db.query(
   "CREATE FUNCTION stageq_next_metadata_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fiction-only'; END; $$"
  );
  await db.query('CREATE TRIGGER stageq_next_metadata_block BEFORE UPDATE OF last_sign_in ON members FOR EACH ROW EXECUTE FUNCTION stageq_next_metadata_fail()');
  let token;
  try{token=await signIn(page,memberRecord)}
  finally{
   await db.query('DROP TRIGGER stageq_next_metadata_block ON members');
   await db.query('DROP FUNCTION stageq_next_metadata_fail()');
  }
  assert.equal(await tokenRevoked(token),false);
  assert.equal((await webCall(page,'/api/sovereign/stageq')).status,200);
 }finally{await context.close()}
});
