/**
 * Stage Q -- FULL, previously attested immutable Soullab image / rendered WebKit.
 *
 * This file is a disposable fictional-identity witness. It NEVER connects to
 * a hosted Soullab service, registry, staging/production database or app.
 * The browser restricts ALL HTTP(S) requests to https://localhost; the three
 * Docker containers share a freshly created --internal bridge network.
 *
 * NOT an Apple Safari, public TLS, deployed Caddy, or all-feature UI witness.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const crypto = require('node:crypto'), dns = require('node:dns');
const {spawnSync} = require('node:child_process');
const https = require('node:https');
dns.setDefaultResultOrder('ipv4first');

const SOURCE_SHA='9ed5d83ba856b4e8c4940ef7f928447ae28c3837';
const IMAGE='maia-sovereign:stageq-classa-1883-review-only';
const IMAGE_ID='sha256:ee8ea174a90dc7465921a3cd6db801321cfe82a0f35633d94ed8371eba63b6e9';
const PASSWORD='stageq-fictional-rendered-webkit-credential';
const EXPECTED_SENTINEL='stageq-full-image-rendered-fictional-only';
const PG_PASSWORD='fixture-stageq-only-not-a-real-secret';
const DB_NAME='stageq_full_image_fictional';
const PG_USER='stageq_full_image_fixture';
const ROOT=path.resolve(__dirname,'../..');
const ORIGIN='https://localhost';
const short=(process.env.GITHUB_SHA||'').slice(0,10);
const NET='stageqfull-net-'+short;
const PG='stageqfull-pg-'+short;
const APP='stageqfull-app-'+short;
const EDGE='stageqfull-edge-'+short;
const label='stageq-full-image-fictional';
const USER_ID='11111111-1111-4111-8111-111111111111';
const USERNAME='stageq_full_fixture';
const EMAIL='stageq.full@example.invalid';
let workdir=null,browser=null,createdNetwork=false,containers=[];

if(process.env.GITHUB_ACTIONS!=='true' ||
   process.env.STAGE_Q_FULL_IMAGE_FIXTURE!==EXPECTED_SENTINEL ||
   !/^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA||'') ||
   !process.env.CI) {
  throw Error('Refusing non-CI or non-fictional full-image WebKit acceptance');
}
function run(cmd,args,opts={}){
 const r=spawnSync(cmd,args,{encoding:'utf8',timeout:opts.timeout||60000,
  input:opts.input,maxBuffer:opts.maxBuffer||1024*1024});
 if(r.status!==0){
  let e=(r.stderr||r.stdout||'').slice(-1300);
  e=e.replace(/[a-f0-9]{64}/gi,'[token-redacted]')
    .replaceAll(PG_PASSWORD,'[fictional-db-password]')
    .replaceAll(PASSWORD,'[fictional-credential]');
  throw Error('Fixture process '+cmd+' failed, status '+r.status+': '+e);
 }
 return(r.stdout||'').trim();
}
function dc(...args){return run('docker',args)}
function psql(sql,extra=[]){
 return run('docker',['exec','-i',PG,'psql','-X','-q','-A','-t',
  '-v','ON_ERROR_STOP=1',...extra,'-U',PG_USER,'-d',DB_NAME],{input:sql,timeout:30000});
}
function sqlFile(file){
 const hashes={
  '20260119000001_auth_sessions.sql':'62d0183ac47c6b215df10e33fe760a7a1a19cc9f',
  '20260119000004_auth_rate_limits.sql':'9606a3a09304ba40d9ca22633f952db5b8aed676',
  '20260828000001_audit_logs.sql':'1d2381dfe4c829cfca642d3a7e2f0c2d16737390',
 };
 const rel=path.join('database/migrations',file);
 const blob=run('git',['hash-object',rel],{timeout:10000});
 assert.equal(blob,hashes[file],'Pinned fixture migration drift');
 return fs.readFileSync(path.join(ROOT,rel),'utf8');
}
function hasOwnedContainer(name){
 const p=spawnSync('docker',['inspect','--format','{{index .Config.Labels "soullab.stageq"}}',name],
  {encoding:'utf8',timeout:10000});
 return p.status===0&&(p.stdout||'').trim()===label;
}
function assertAbsent(name){
 const p=spawnSync('docker',['inspect',name],{encoding:'utf8',timeout:10000});
 assert.notEqual(p.status,0,'Refusing reuse of an existing container name');
}
function startContainer(name,args){
 assertAbsent(name);
 const id=dc('run','-d','--name',name,'--label','soullab.stageq='+label,...args);
 assert.ok(id.length>=12);
 containers.push(name);
}
async function eventually(fn,name,ms=75000){
 const end=Date.now()+ms;let last;
 while(Date.now()<end){
  try{return await fn()}
  catch(e){last=e;await new Promise(resolve=>setTimeout(resolve,400))}
 }
 throw Error(name+' failed: '+String(last?.message||last||'timeout').slice(0,200));
}
function tlsGet(pathname){
 return new Promise((resolve,reject)=>{
  const req=https.get({hostname:'127.0.0.1',servername:'localhost',
   headers:{Host:'localhost'},port:443,path:pathname,
   rejectUnauthorized:false,timeout:3000},res=>{
   res.resume();res.on('end',()=>resolve(res.statusCode));
  });
  req.on('error',reject);
  req.on('timeout',()=>req.destroy(Error('local HTTPS timed out')));
 });
}
test.before(async()=>{
 const actualId=dc('image','inspect',IMAGE,'--format','{{.Id}}');
 assert.equal(actualId,IMAGE_ID,'Previously attested immutable image identity required');
 assert.equal(dc('image','inspect',IMAGE,'--format','{{.Architecture}}'),'amd64');
 const stamped=dc('image','inspect',IMAGE,'--format',
  '{{range .Config.Env}}{{println .}}{{end}}');
 assert.match(stamped,new RegExp('GIT_COMMIT='+SOURCE_SHA));
 assert.match(stamped,/DEPLOY_LANE=ci-review-image-only/);
 for(const name of [PG,APP,EDGE])assertAbsent(name);
 const exists=spawnSync('docker',['network','inspect',NET],{encoding:'utf8',timeout:10000});
 assert.notEqual(exists.status,0,'Refusing to reuse existing network name');
 dc('network','create','--label','soullab.stageq='+label,'--internal','--driver','bridge',NET);
 createdNetwork=true;
 startContainer(PG,['--network',NET,
  '-e','POSTGRES_USER='+PG_USER,'-e','POSTGRES_PASSWORD='+PG_PASSWORD,
  '-e','POSTGRES_DB='+DB_NAME,'postgres:14-alpine']);
 await eventually(async()=>{
  // pg_isready can return OK during the image's temporary startup server,
  // before POSTGRES_DB has actually been created. Require the exact database
  // and user to accept an authenticated SQL query, then seed our schema.
  const p=spawnSync('docker',['exec',PG,'psql','-X','-q','-A','-t',
   '-v','ON_ERROR_STOP=1','-U',PG_USER,'-d',DB_NAME,
   '-c','SELECT current_database(),current_user;'],{
   encoding:'utf8',timeout:5000});
  if(p.status!==0||(p.stdout||'').trim()!==DB_NAME+'|'+PG_USER)
   throw Error('Exact fictional PostgreSQL database not fully initialized');
 },'Fictional PostgreSQL database created and authenticated',45000);
 const meta=psql('SELECT current_database(),current_user;').split('\n').at(-1);
 assert.equal(meta,DB_NAME+'|'+PG_USER,'Wrong SQL database authority');
 psql([
  'CREATE TABLE members (',
  ' id UUID PRIMARY KEY,username TEXT UNIQUE NOT NULL,email TEXT UNIQUE NOT NULL,',
  ' passkey TEXT,password_hash TEXT NOT NULL,name TEXT,preferred_name TEXT,',
  ' onboarded BOOLEAN DEFAULT TRUE,onboarding_step TEXT,tier TEXT DEFAULT \'free\',',
  ' roles TEXT[] DEFAULT ARRAY[\'member\'],',
  ' subscription_active BOOLEAN DEFAULT FALSE,subscription_expires_at TIMESTAMPTZ,',
  ' has_webauthn BOOLEAN DEFAULT FALSE,preferred_auth_method TEXT DEFAULT \'password\',',
  ' must_reset_password BOOLEAN DEFAULT FALSE,last_sign_in TIMESTAMPTZ,',
  ' is_practitioner BOOLEAN DEFAULT FALSE',
  ');',
 ].join(' '));
 for(const file of ['20260119000001_auth_sessions.sql',
  '20260119000004_auth_rate_limits.sql','20260828000001_audit_logs.sql'])
  psql(sqlFile(file));
 const pwHash=dc('run','--rm','--network','none','--entrypoint','node',IMAGE,
   '-e','require("bcrypt").hash(process.argv[1],12).then(x=>console.log(x))',PASSWORD);
 assert.match(pwHash,/^\$2[aby]\$12\$/);
 psql("INSERT INTO members(id,username,email,password_hash,name,preferred_name,tier,roles)"+
  " VALUES('"+USER_ID+"','"+USERNAME+"','"+EMAIL+"',:'pw_hash',"+
  " 'Fictional WebKit account','Fictional WebKit account','free',ARRAY['member']);",
  ['-v','pw_hash='+pwHash]);
 startContainer(APP,['--network',NET,'--memory','3g','--pids-limit','256',
  '-e','DATABASE_URL=postgresql://'+PG_USER+':'+PG_PASSWORD+'@'+PG+':5432/'+DB_NAME,
  '-e','ACCESS_CONTROL_MODE=strict',
  '-e','AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS='+ORIGIN,
  '-e','NEXT_TELEMETRY_DISABLED=1',
  '-e','SKIP_ENV_VALIDATION=true',
  IMAGE]);
 workdir=fs.mkdtempSync(path.join(os.tmpdir(),'stageq-fullimage-webui-'));
 fs.writeFileSync(path.join(workdir,'.stageq-owned'),EXPECTED_SENTINEL,{mode:0o600});
 const crt=path.join(workdir,'fixture.crt'),key=path.join(workdir,'fixture.key');
 run('openssl',['req','-x509','-nodes','-newkey','rsa:2048','-days','1',
  '-keyout',key,'-out',crt,'-subj','/CN=localhost',
  '-addext','subjectAltName=DNS:localhost,IP:127.0.0.1'],{timeout:30000});
 fs.chmodSync(key,0o600);
 const caddyConfig=[
  '{','  admin off','  auto_https disable_redirects','}',
  'https://localhost {',
  ' tls /etc/stageq/fixture.crt /etc/stageq/fixture.key',
  ' reverse_proxy '+APP+':3000 {',
  '   header_up Host {host}',
  '   header_up X-Forwarded-Proto https',
  ' }',
  '}',
 ].join('\n');
 fs.writeFileSync(path.join(workdir,'Caddyfile'),caddyConfig,{mode:0o600});
 // Unlike the separate canonical-Caddy acceptance, this tiny edge exists
 // ONLY to give the full production app a local trusted HTTPS browser origin.
 startContainer(EDGE,['--network',NET,
  '-v',workdir+':/etc/stageq:ro','caddy:2.10.2-alpine',
  'caddy','run','--config','/etc/stageq/Caddyfile','--adapter','caddyfile']);
 await eventually(async()=>{
  // Probe actual Caddy+full-app HTTP through a second test-only process
  // sharing Caddy's private network namespace. No published ports or egress.
  const snippet=[
   "const https=require('https');",
   "const req=https.get({hostname:'127.0.0.1',servername:'localhost',",
   "headers:{Host:'localhost'},port:443,path:'/signin',",
   "rejectUnauthorized:false,timeout:2500},res=>{",
   "res.resume();res.on('end',()=>process.exit(res.statusCode===200?0:2))});",
   "req.on('error',()=>process.exit(3));",
   "req.on('timeout',()=>req.destroy());",
  ].join('');
  const reply=spawnSync('docker',[
   'run','--rm','--pull','never','--network','container:'+EDGE,
   '--entrypoint','node',IMAGE,'-e',snippet,
  ],{encoding:'utf8',timeout:9000,maxBuffer:1024*1024});
  if(reply.status!==0)throw Error('Private Caddy/Next HTTPS probe '+reply.status);
 },'Private, fully isolated Caddy + real Next signin',70000);

});

test.after(async()=>{
 if(browser)await browser.close().catch(()=>{});
 for(const name of containers.slice().reverse()){
  if(!hasOwnedContainer(name))continue;
  const p=spawnSync('docker',['rm','-f',name],{encoding:'utf8',timeout:30000});
  if(p.status!==0)console.error('Owned fictional container cleanup failed: '+name);
 }
 if(createdNetwork){
  const owner=spawnSync('docker',['network','inspect','--format',
   '{{index .Labels "soullab.stageq"}}',NET],{encoding:'utf8',timeout:10000});
  if(owner.status!==0||(owner.stdout||'').trim()!==label){
   throw Error('Refusing network cleanup without a matching owner marker');
  }
  const p=spawnSync('docker',['network','rm',NET],{encoding:'utf8',timeout:10000});
  if(p.status!==0)console.error('Owned fictional network cleanup failed: '+NET);
 }
 if(workdir&&fs.existsSync(path.join(workdir,'.stageq-owned'))&&
  fs.readFileSync(path.join(workdir,'.stageq-owned'),'utf8')===EXPECTED_SENTINEL)
  fs.rmSync(workdir,{recursive:true,force:false});
});

test('three real rendered WebKit cases pass in the same private Caddy namespace',()=>{
 const pgIp=dc('inspect',PG,'--format',
  '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}');
 assert.match(pgIp,/^(172\.(1[6-9]|2[0-9]|3[01])\.|10\.|192\.168\.)/);
 const browserName='stageqfull-browser-'+short;
 assertAbsent(browserName);
 const script=path.join(ROOT,'docs/security/auth-stage-q-full-image-contained-browser.test.cjs');
 const nodeModules=path.join(ROOT,'node_modules');
 assert.ok(fs.existsSync(script),'Reviewed browser test must exist');
 assert.ok(fs.existsSync(nodeModules),'Pinned Playwright/pg dependencies must exist');
 const args=[
  'run','--rm','--pull','never','--name',browserName,
  '--label','soullab.stageq='+label,
  '--network','container:'+EDGE,
  '--cap-drop','ALL','--security-opt','no-new-privileges',
  '--pids-limit','512','--memory','4g','--shm-size','1g',
  '-v',script+':/work/browser.test.cjs:ro',
  '-v',nodeModules+':/work/node_modules:ro',
  '-e','GITHUB_ACTIONS=true',
  '-e','STAGE_Q_BROWSER_FIXTURE=stageq-contained-webkit-fictional-only',
  '-e','STAGE_Q_PG_CONTAINER_IP='+pgIp,
  '-e','PGPORT=5432',
  '-e','PGDATABASE='+DB_NAME,
  '-e','PGUSER='+PG_USER,
  '-e','PGPASSWORD='+PG_PASSWORD,
  '-e','ATTESTED_IMAGE_ID='+IMAGE_ID,
  'mcr.microsoft.com/playwright:v1.56.1-noble',
  'node','--test','/work/browser.test.cjs',
 ];
 // Track this exact label-verified disposable browser even on timeout.
 containers.push(browserName);
 const p=spawnSync('docker',args,{
  encoding:'utf8',timeout:245000,maxBuffer:8*1024*1024,
 });
 const output=(p.stdout||'')+'\n'+(p.stderr||'');
 for(const line of output.split('\n')){
  if(/^\s*(ok [0-9]+ |not ok |# Subtest:|# tests |# pass |# fail |# duration_ms )/.test(line))
   console.log(line.slice(0,350));
 }
 if(p.status!==0){
  const tail=output.slice(-1100).replace(/[a-f0-9]{64}/ig,'[fictional-token]')
   .replaceAll(PG_PASSWORD,'[fixture-db-password]')
   .replaceAll(PASSWORD,'[fixture-credential]');
  throw Error('Contained Linux WebKit source-attested browser test failed: '+tail);
 }
 assert.match(output,/# tests 3/);
 assert.match(output,/# pass 3/);
 assert.match(output,/# fail 0/);
});
