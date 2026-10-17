/**
 * R39 — disposable Mac-local PG16 + R29 signed section Apply/Undo request
 * + R35 encrypted vault integration witness. Never real member operations.
 */
import {spawnSync} from 'node:child_process';
import {randomUUID,createHash} from 'node:crypto';
import {existsSync,mkdirSync,mkdtempSync,readFileSync,
 readdirSync,rmSync,writeFileSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {connect} from 'node:net';
import {join} from 'node:path';

const WORK=process.cwd();
if(process.env.R39_PHYSICAL_PG16_FIXTURE!=='fictional-only'||
   process.env.R43_AUTHOR_CHOICE_FIXTURE!=='fictional-only'||
   process.env.R46_DURABLE_SIGNED_APPLY_FIXTURE!=='fictional-only'||
   process.env.R47_DURABLE_UNDO_FIXTURE!=='fictional-only'||
   process.env.R48_SPENT_APPLY_RECOVERY_FIXTURE!=='fictional-only'||
   process.env.R50_APPLY_UNDO_CONVERGENCE_FIXTURE!=='fictional-only'||
   process.env.R53_PHYSICAL_PG16_FIXTURE!=='fictional-only'||
   process.env.R53_CANONICAL_AUTHOR_FIXTURE!=='fictional-only'||
   process.env.R54_PHYSICAL_PG16_FIXTURE!=='fictional-only'||
   process.env.R54_PC3_BROWSER_FIXTURE!=='fictional-only'||
   process.env.R55_REAL_PC3_CONVERGENCE_FIXTURE!=='fictional-only')
 throw Error('R39_EXACT_PHYSICAL_FICTIONAL_ONLY_OPT_IN_REQUIRED');
const name='ws-r55-converged-pc3-'+randomUUID().slice(0,11);
const root=mkdtempSync(join(tmpdir(),'ws-r35-physical-r48-r55-'));
const vault=join(root,'vault');mkdirSync(vault);
const evidence=join('/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R55_CONVERGED_PC3_ENCRYPTED_BROWSER_20261016',
 'run-'+randomUUID().slice(0,11));
mkdirSync(evidence,{recursive:true});
const receipt=join(evidence,'R55_CONVERGED_PC3_ENCRYPTED_AUTHOR_20261016.json');
const testLog=join(evidence,'R55_PC3_ENCRYPTED_PHASE1_JEST_20261016.log');
const coldLog=join(evidence,'R55_PC3_ENCRYPTED_COLD_JEST_20261016.log');
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const F='55555555-5555-4555-8555-555555555555';
const policy='r38-fictional-notice';
const hash='b'.repeat(64);
const secret='R38 Fictional Writer Encrypted Request Secret Words';
const checks:string[]=[];
let failure:string|null=null,started=false,port='';
const observe=(value:unknown,message:string)=>{
 if(!value)throw Error('R39_CHECK_FAILED_'+message);
 checks.push(message);
};
function docker(args:string[],optional=false):{status:number|null,stdout:string,stderr:string}{
 const r=spawnSync('docker',args,{encoding:'utf8',timeout:60000,maxBuffer:16*1024*1024});
 if((r.status!==0||r.error)&&!optional)
  throw Error('R39_DOCKER_REFUSED_'+args[0]+':'+String(r.stderr||r.error).slice(-180));
 return {status:r.status,stdout:r.stdout||'',stderr:r.stderr||''};
}
const sql=(statement:string)=>docker(['exec',name,'psql','-XAtq',
 '-v','ON_ERROR_STOP=1','-U','fict','-d','r35_draft','-c',statement]).stdout.trim();
async function ready(){
 for(let i=0;i<110;i++){
  const query=docker(['exec',name,'psql','-XAtq','-U','fict','-d','r35_draft','-c','SELECT 1'],true);
  const pid=docker(['exec',name,'cat','/proc/1/comm'],true);
  if(query.status===0&&query.stdout.trim()==='1'&&pid.status===0&&
     pid.stdout.trim()==='postgres')return;
  await new Promise(resolve=>setTimeout(resolve,180));
 }
 throw Error('R38_POSTGRES16_NOT_STABLY_READY');
}
async function main(){
 writeFileSync(join(root,'R38_FICTIONAL_ONLY.marker'),'synthetic R38\n',{mode:0o600});
 docker(['run','--pull','never','-d','--name',name,'--network','bridge',
  '--memory','900m','--cpus','2','--pids-limit','160',
  '--security-opt','no-new-privileges',
  '-p','127.0.0.1::5432',
  '-e','POSTGRES_USER=fict','-e','POSTGRES_DB=r35_draft',
  '-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:16.13']);
 started=true;await ready();
 const binding=docker(['port',name,'5432/tcp']).stdout.trim();
 const m=/^127\.0\.0\.1:(\d+)$/.exec(binding);
 if(!m)throw Error('R38_NON_LOOPBACK_REFUSED');
 port=m[1];
 const config=JSON.parse(docker(['inspect',name]).stdout)[0];
 observe(config.HostConfig.PortBindings?.['5432/tcp']?.[0]?.HostIp==='127.0.0.1'&&
   config.HostConfig.Binds===null,'loopback-only PostgreSQL fixture no host mounts');
 observe(sql('SHOW server_version_num').startsWith('160'),
   'disposable actual PostgreSQL 16');
 sql(`CREATE TABLE members(id uuid PRIMARY KEY,admin_role text);
 CREATE TABLE ops_contacts(member_id uuid REFERENCES members(id),
   deleted_at timestamptz,contact_type text,pipeline_stage text);
 CREATE TABLE auth_sessions(session_token text PRIMARY KEY,
   member_id uuid REFERENCES members(id),revoked boolean NOT NULL,
   expires_at timestamptz NOT NULL);
 CREATE TABLE writers_studio_beta_consent_events (
   seq bigserial PRIMARY KEY,member_id uuid REFERENCES members(id),
   decision text NOT NULL,policy_version text NOT NULL,policy_sha256 text NOT NULL);
 CREATE TABLE member_manuscripts (id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES members(id));
 CREATE TABLE r38_fixture_work_fence (
   work_id uuid PRIMARY KEY REFERENCES member_manuscripts(id),
   member_id uuid NOT NULL REFERENCES members(id),active boolean NOT NULL DEFAULT true);
 INSERT INTO members VALUES ('${A}',NULL),('${B}',NULL),('${F}','founder');
 INSERT INTO ops_contacts VALUES
 ('${A}',NULL,'beta_tester','active'),('${B}',NULL,'beta_tester','active');
 INSERT INTO auth_sessions VALUES
 ('r38-fictitious-session-A','${A}',false,now()+interval '1 day'),
 ('r38-fictitious-session-B','${B}',false,now()+interval '1 day'),
 ('r38-fictitious-session-founder','${F}',false,now()+interval '1 day'),
 ('r38-fictitious-expired','${A}',false,now()-interval '1 day');
 INSERT INTO writers_studio_beta_consent_events(member_id,decision,policy_version,policy_sha256)
 VALUES('${A}','accept','${policy}','${hash}'),('${B}','accept','${policy}','${hash}');
 INSERT INTO member_manuscripts VALUES
 ('33333333-3333-4333-8333-333333333331','${A}'),
 ('33333333-3333-4333-8333-333333333332','${A}'),
 ('33333333-3333-4333-8333-333333333333','${A}'),
 ('33333333-3333-4333-8333-333333333334','${A}'),
 ('33333333-3333-4333-8333-333333333335','${A}'),
 ('33333333-3333-4333-8333-333333333336','${A}'),
 ('33333333-3333-4333-8333-333333333337','${A}'),
 ('33333333-3333-4333-8333-333333333338','${A}'),
 ('33333333-3333-4333-8333-333333333339','${A}'),
 ('33333333-3333-4333-8333-333333333330','${A}'),
 ('33333333-3333-4333-8333-33333333333a','${A}'),
 ('33333333-3333-4333-8333-33333333333b','${A}'),
 ('33333333-3333-4333-8333-33333333333c','${A}'),
 ('33333333-3333-4333-8333-33333333333d','${A}'),
 ('33333333-3333-4333-8333-33333333333e','${A}'),
 ('33333333-3333-4333-8333-33333333333f','${A}'),
 ('33333333-3333-4333-8333-333333333340','${A}'),
 ('33333333-3333-4333-8333-333333333341','${A}'),
 ('33333333-3333-4333-8333-333333333342','${A}'),
 ('44444444-4444-4444-8444-444444444444','${B}');
 INSERT INTO r38_fixture_work_fence(work_id,member_id)
 SELECT id,member_id FROM member_manuscripts;`);
 const schema=join(WORK,'docs/ops/WS_R35_ENCRYPTED_DRAFT_LEDGER_REVIEW_ONLY.sql');
 docker(['cp',schema,name+':/tmp/r38_review_only.sql']);
 docker(['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','r35_draft','-f','/tmp/r38_review_only.sql']);
 // Durable, review-only approval schema; never production migrations.
 sql('CREATE UNIQUE INDEX r46_owner_pair ON member_manuscripts(id,member_id)');
 const approvalDDL=join(WORK,'docs/ops/WS_R44_DURABLE_AUTHOR_APPROVAL_REVIEW_ONLY.sql');
 docker(['cp',approvalDDL,name+':/tmp/r46_approval.sql']);
 docker(['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','r35_draft','-f','/tmp/r46_approval.sql']);
 observe(sql('SELECT count(*) FROM writers_studio_r44_held_approval')==='0',
  'R44 durable PostgreSQL approval ledger starts empty');
 const undoSchema=join(WORK,'docs/ops/WS_R47_DURABLE_UNDO_REVIEW_ONLY.sql');
 docker(['cp',undoSchema,name+':/tmp/r47_undo.sql']);
 docker(['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','r35_draft','-f','/tmp/r47_undo.sql']);
 observe(sql('SELECT count(*) FROM writers_studio_r47_held_undo')==='0',
  'R47 Undo PostgreSQL attempt ledger initially empty');
 observe(sql('SELECT count(*) FROM writers_studio_r35_draft_versions')==='0',
   'review-only ciphertext and receipt SQL initially empty');
 const args=['./node_modules/.bin/jest','--config','jest.config.js',
   '--runInBand','--runTestsByPath','scripts/ops/__tests__/r39ActualSignedSectionPG16.test.ts'];
 const env={...process.env,
   R38_SIGNED_DRAFT_REQUEST_FIXTURE:'fictional-only',
   R43_AUTHOR_CHOICE_FIXTURE:'fictional-only',
   R44_DURABLE_APPROVAL_FIXTURE:'fictional-only',
   R45_DURABLE_SIGNED_AUTHOR_FIXTURE:'fictional-only',
   R46_DURABLE_SIGNED_APPLY_FIXTURE:'fictional-only',
   R47_DURABLE_UNDO_FIXTURE:'fictional-only',
   R48_SPENT_APPLY_RECOVERY_FIXTURE:'fictional-only',
   R48_PHYSICAL_PG16_FIXTURE:'fictional-only',
   R48_COLD_FIXTURE_PATH:join(root,'r48-spent-apply-cold.json'),
   R50_APPLY_UNDO_CONVERGENCE_FIXTURE:'fictional-only',
   R53_PHYSICAL_PG16_FIXTURE:'fictional-only',
   R53_CANONICAL_AUTHOR_FIXTURE:'fictional-only',
   R54_PC3_BROWSER_FIXTURE:'fictional-only',
   R55_REAL_PC3_CONVERGENCE_FIXTURE:'fictional-only',
   R54_PHYSICAL_PG16_FIXTURE:'fictional-only',
   R54_BROWSER_EVIDENCE_DIR:evidence,
   R43_CANONICAL_REVIEW_FIXTURE:'fictional-only',
   R39_SIGNED_SECTION_REQUEST_FIXTURE:'fictional-only',
   R37_SECTION_PASSAGE_FIXTURE:'fictional-only',
   R36_PASSAGE_REVIEW_FIXTURE:'fictional-only',
   R39_PHYSICAL_PG16_FIXTURE:'fictional-only',
   R29_SESSION_FENCE_FIXTURE:'fictional-only',
   R35_PROTECTED_DRAFT_FIXTURE:'fictional-only',
   R35_PHYSICAL_PG16_FIXTURE:'fictional-only',
   WRITERS_STUDIO_RESTRICTED_BETA:'true',
   WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW:'true',
   WRITERS_STUDIO_BETA_MEMBER_IDS:`${A},${B}`,
   WRITERS_STUDIO_BETA_CONSENT_VERSION:policy,
   WRITERS_STUDIO_BETA_CONSENT_SHA256:hash,
   DATABASE_URL:'postgresql://fict@127.0.0.1:'+port+'/r35_draft',
   FILE_STORAGE_PATH:vault,
 };
 const runner=spawnSync(args[0],args.slice(1),
  {cwd:WORK,env,encoding:'utf8',timeout:100000,maxBuffer:20*1024*1024});
 writeFileSync(testLog,(runner.stdout||'')+(runner.stderr||''),{mode:0o600});
 observe(runner.status===0&&
   /Test Suites:\s+1 passed, 1 total/.test((runner.stdout||'')+(runner.stderr||''))&&
   /Tests:\s+1 skipped, 33 passed, 34 total/.test((runner.stdout||'')+(runner.stderr||''))&&
   /skipped R48 one PostgreSQL Work holds encrypted reviewed choice/.test(
     (runner.stdout||'')+(runner.stderr||'')),
   '33 fictional signed Apply/Undo and Chrome/WebKit PC3 author tests pass');
 const log=(runner.stdout||'')+(runner.stderr||'');
 const browserReports=[...log.matchAll(/R54_BROWSER_META\s+(\{[^\r\n]+\})/g)]
  .map(v=>JSON.parse(v[1]) as {engine:string;checksPassed:number;
   screenshots:number;externalRequests:number});
 observe(browserReports.length===2&&
   new Set(browserReports.map(v=>v.engine)).size===2&&
   browserReports.every(v=>v.checksPassed>=30&&
    v.screenshots===4&&v.externalRequests===0),
   'both real engines recorded 30+ author controls with zero external calls');
 const screenTypes=['REVIEW','APPLIED','DESKTOP','MOBILE'];
 observe(['chromium','webkit'].every(engine=>screenTypes.every(which=>{
  const file=join(evidence,engine,
   'R54_'+engine.toUpperCase()+'_FICTIONAL_PC3_'+which+'.png');
  return existsSync(file)&&statSync(file).size>12000;
 })),
   'eight fiction-only exact browser screenshots saved before cleanup');
 const coldFile=join(root,'r48-spent-apply-cold.json');
 observe(existsSync(coldFile)&&(statSync(coldFile).mode&0o077)===0,
   'invented R48 escrow stored with mode-0600 inside disposable vault parent');
 const coldShape=JSON.parse(readFileSync(coldFile,'utf8')) as {
  protocol:string;entries:{approvalToken:string;keyBytes:string;issuerSecret:string}[];
 };
 observe(coldShape.entries.length===2&&
    !readFileSync(coldFile,'utf8').includes(secret),
   'two private fictional R48 recovery scopes but zero novel prose in escrow');
 observe(sql("SELECT count(*) FROM writers_studio_r44_held_approval WHERE state='spent'")==='5',
  'successful Apply and failed signed attempt both permanently spent');
 observe(sql("SELECT count(*) FROM writers_studio_r44_held_approval WHERE state='prepared'")==='0',
  'no review remains replayable after signed edit and revocation refusal');
 observe(sql("SELECT count(*) FROM writers_studio_r47_held_undo WHERE state='spent'")==='6',
  'three one-use durable Undo attempts are spent exactly once');
 observe(sql("SELECT count(*) FROM writers_studio_r35_draft_versions WHERE work_id='33333333-3333-4333-8333-33333333333b'")==='3'&&
   sql("SELECT count(*) FROM writers_studio_r35_draft_versions WHERE work_id='33333333-3333-4333-8333-33333333333c'")==='1',
   'after R47 Undo author Work has three saved versions, unresolved Apply has one');
  const dump=docker(['exec',name,'pg_dump','-Fp','-U','fict','-d','r35_draft']).stdout;
 observe(coldShape.entries.every(x=>
    ![x.approvalToken,x.keyBytes,x.issuerSecret].some(secretPart=>dump.includes(secretPart))),
   'whole fictional dump excludes raw private recovery tokens and keys');
 // Whole fixture pg_dump necessarily contains synthetic auth_sessions tokens.
 // The author manuscript phrase and raw idempotency request token must not
 // appear there; a separate query below checks the draft receipt columns.
 observe(!dump.includes(secret)&&!dump.includes('r38-save-first'),
   'whole fictional PG16 dump excludes author text and raw idempotency key');
 // auth_sessions fixture necessarily contains synthetic tokens; the Draft
 // tables, unlike this whole disposable test DB, must never hold those tokens.
 const onlyDraft=sql(
  `SELECT string_agg(row_to_json(x)::text,' ' ORDER BY x.work_id)
   FROM (SELECT work_id,idem_hmac,payload_hmac,generation,checkpoint_count
     FROM writers_studio_r35_draft_receipts) x`);
 observe(!onlyDraft.includes(secret)&&!onlyDraft.includes('r38-save-first')&&
    !onlyDraft.includes('r38-fictitious-session-A'),
    'HMAC structural receipt rows contain no key text, request token or prose');
 const objects=readdirSync(join(vault,'ws-beta-r35-held-drafts')).filter(x=>x.endsWith('.enc'));
 observe(objects.length>=9&&objects.every(x=>!readFileSync(
   join(vault,'ws-beta-r35-held-drafts',x)).includes(Buffer.from(secret))),
  'R35 immutable sealed vault objects have ciphertext not author plaintext');
 const sectionSecrets=[
  'R38 first fictional section','R38 second fictional section',
  'first enchanted','first sparkling',
  'fictional-r39-apply-repeat-001','r39-undo-original-001',
 ];
 observe(sectionSecrets.every(x=>!dump.includes(x)),
  'whole fictional SQL dump excludes selected passage, alternatives and raw editorial action keys');
 observe(objects.every(name=>{
  const b=readFileSync(join(vault,'ws-beta-r35-held-drafts',name));
  return sectionSecrets.every(value=>!b.includes(Buffer.from(value)));
 }), 'encrypted vault objects contain no plaintext selection, alternative or undo receipt tokens');
 const authored=sql('SELECT count(*) FROM writers_studio_r35_draft_versions');
 observe(Number(authored)>=9,'R38 saved multiple actual fictional encrypted draft generations');
 // Forced restart of ONLY the randomly named disposable PostgreSQL 16 test.
 // Anonymous Docker-owned PGDATA volume survives restart and is removed by -v.
 docker(['kill','--signal=SIGKILL',name]);
 docker(['start',name]);
 await ready();
 observe(sql('SHOW server_version_num').startsWith('160'),
   'forced PostgreSQL restart recovered disposable PG16');
 // Docker may rebind an ephemeral host port after restart. Resolve again;
 // never assume the original client port persisted.
 const rebound=docker(['port',name,'5432/tcp']).stdout.trim();
 const portMatch=/^127[.]0[.]0[.]1:([0-9]+)$/.exec(rebound);
 if(!portMatch)throw Error('R47_RESTART_NOT_LOOPBACK');
 // Physical host forwarding may lag the Postgres readiness inside Docker.
 let hostReady=false;
 for(let i=0;i<60;i++){
  const open=await new Promise<boolean>(resolve=>{
   const sock=connect({host:'127.0.0.1',port:Number(portMatch[1])});
   sock.once('connect',()=>{sock.destroy();resolve(true);});
   sock.once('error',()=>{sock.destroy();resolve(false);});
   sock.setTimeout(850,()=>{sock.destroy();resolve(false);});
  });
  if(open){hostReady=true;break;}
  await new Promise(resolve=>setTimeout(resolve,160));
 }
 if(!hostReady)throw Error('R50_HOST_PORT_NOT_READY_AFTER_POSTGRES_RESTART');
 const coldEnv={...env,R47_COLD_PG16:'fictional-only',
   DATABASE_URL:'postgresql://fict@127.0.0.1:'+portMatch[1]+'/r35_draft'};
 const cold=spawnSync(args[0],[
  '--config','jest.config.js','--runInBand','--runTestsByPath',
  'scripts/ops/__tests__/r54ColdPG16UndoState.test.ts',
 ],{cwd:WORK,env:coldEnv,encoding:'utf8',timeout:100000,
   maxBuffer:20*1024*1024});
 writeFileSync(coldLog,(cold.stdout||'')+(cold.stderr||''),{mode:0o600});
 observe(cold.status===0&&
   /Tests:\s+6 passed, 6 total/.test((cold.stdout||'')+(cold.stderr||'')),
   'fresh application process retained spent approvals and immutable revision heads');
 observe(sql("SELECT count(*) FROM writers_studio_r47_held_undo WHERE state='spent'")==='6',
   'Undo spent state monotonic after forced PostgreSQL restart');
 const coldApply=spawnSync('./node_modules/.bin/tsx',
  ['scripts/ops/wsBetaR48ColdSpentApply.ts'],{
   cwd:WORK,
   env:{...coldEnv,R48_COLD_PROCESS_FIXTURE:'fictional-only'},
   encoding:'utf8',timeout:70000,maxBuffer:8*1024*1024,
  });
 const coldLines=(coldApply.stdout||'').split('\n');
 const coldReport=coldLines.find(line=>
    line.includes('R48_FRESH_PROCESS_SPENT_APPLY_READ_ONLY_PASS'));
 if(coldApply.status!==0||!coldReport)
   throw Error('R50_FRESH_READ_ONLY_APPLY_RECONCILIATION_HOLD_'+
     String(coldApply.stderr||coldApply.error).slice(-160));
 const result=JSON.parse(coldReport) as {
  confirmed:number;unresolved:number;retryAuthorized:boolean;
  releaseApproved:boolean;
 };
 observe(result.confirmed===1&&result.unresolved===1&&
   result.retryAuthorized===false&&result.releaseApproved===false,
   'new process verifies applied version 2 despite subsequent Undo and holds failed Apply');
 observe(sql("SELECT count(*) FROM writers_studio_r35_draft_versions WHERE work_id='33333333-3333-4333-8333-33333333333b'")==='3'&&
   sql("SELECT count(*) FROM writers_studio_r35_draft_versions WHERE work_id='33333333-3333-4333-8333-33333333333c'")==='1',
   'cross-process recovery and Undo observation created no new ciphertext revision');

 const restartedDump=docker(['exec',name,'pg_dump','-Fp','-U','fict','-d','r35_draft']).stdout;
 observe(sectionSecrets.every(s=>!restartedDump.includes(s)),
  'post-restart full fictional SQL dump excludes protected prose');
 // All exact fixture cells are disposable, and no real member/payment/mail/provider
 // authorization can be inferred from this SQL and file-vault test.
}
const state={
 status:'R55_CONVERGED_PC3_AUTHOR_BROWSER_FICTIONAL_HOLD',checks,errors:null as string|null,
 testedGitHead:null as string|null,
 realMemberTouches:0,modelCalls:0,mailCalls:0,realKmsInstalled:false,
 publicRouteMounted:false,productionChanged:false,
 containerRemoved:false,temporaryVaultRemoved:false,
};
(async()=>{
 try{await main();state.status='R55_REAL_PC3_AUTHOR_BROWSER_PG16_FICTIONAL_PASS_RELEASE_HOLD';}
 catch(e){state.errors=String((e as Error)?.message||e).slice(0,210);
  process.exitCode=2;}
 finally{
  if(started)state.containerRemoved=docker(['rm','-f','-v',name],true).status===0;
  else state.containerRemoved=true;
  rmSync(root,{recursive:true,force:true});
  state.temporaryVaultRemoved=!existsSync(root);
  const head=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'});
  state.testedGitHead=head.status===0?head.stdout.trim():null;
  writeFileSync(receipt,JSON.stringify(state,null,2)+'\n',{mode:0o600,flag:'wx'});
  console.log(JSON.stringify({
   status:state.status,passedChecks:checks.length,
   clean:state.containerRemoved&&state.temporaryVaultRemoved,
   testedGitHead:state.testedGitHead,error:state.errors,
   releaseApproved:false}));
  if(state.status!=='R55_REAL_PC3_AUTHOR_BROWSER_PG16_FICTIONAL_PASS_RELEASE_HOLD'||
    !state.containerRemoved||!state.temporaryVaultRemoved)process.exitCode=2;
 }
})();
