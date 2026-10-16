/**
 * R39 — disposable Mac-local PG16 + R29 signed section Apply/Undo request
 * + R35 encrypted vault integration witness. Never real member operations.
 */
import {spawnSync} from 'node:child_process';
import {randomUUID,createHash} from 'node:crypto';
import {existsSync,mkdirSync,mkdtempSync,readFileSync,statSync,
 readdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {connect} from 'node:net';
import {join} from 'node:path';

const WORK=process.cwd();
if(process.env.R39_PHYSICAL_PG16_FIXTURE!=='fictional-only'||
   process.env.R43_AUTHOR_CHOICE_FIXTURE!=='fictional-only'||
   process.env.R46_DURABLE_SIGNED_APPLY_FIXTURE!=='fictional-only'||
   process.env.R48_PHYSICAL_PG16_FIXTURE!=='fictional-only')
 throw Error('R39_EXACT_PHYSICAL_FICTIONAL_ONLY_OPT_IN_REQUIRED');
const name='ws-r48-spent-apply-'+randomUUID().slice(0,11);
const root=mkdtempSync(join(tmpdir(),'ws-r35-physical-r48-'));
const vault=join(root,'vault');mkdirSync(vault);
const evidence='/Volumes/T7 Shield/ws-beta-r48-spent-apply-evidence-20261016';
mkdirSync(evidence,{recursive:true});
const receipt=join(evidence,'R48_SPENT_APPLY_RECOVERY_ACTUAL_PG16_20261016.json');
const testLog=join(evidence,'R48_PG16_JEST_20261016.log');
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
  // Anonymous Docker PG volume survives controlled restart; removed by rm -v.
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
   R48_SPENT_APPLY_RECOVERY_FIXTURE:'fictional-only',
   R48_PHYSICAL_PG16_FIXTURE:'fictional-only',
   R48_COLD_FIXTURE_PATH:join(root,'r48-spent-apply-cold.json'),
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
   /Tests:\s+4 skipped, 26 passed, 30 total/.test((runner.stdout||'')+(runner.stderr||'')),
   '26 fictional R39/R43/R46/R48 physical tests passed');
 const cold=join(root,'r48-spent-apply-cold.json');
 observe(existsSync(cold)&&(statSync(cold).mode&0o077)===0,
   'R48 no-prose fictional read authority held in a mode-0600 temp file');
 const readAuth=JSON.parse(readFileSync(cold,'utf8')) as {
  entries:{approvalToken:string;keyBytes:string;issuerSecret:string}[];
 };
 observe(Array.isArray(readAuth.entries)&&readAuth.entries.length===2&&
   !readFileSync(cold,'utf8').includes(secret),
   'invented cold-process escrow has two scopes but no fictional prose');
 observe(sql("SELECT count(*) FROM writers_studio_r44_held_approval WHERE state='spent'")==='2',
  'successful Apply and failed signed attempt both permanently spent');
 observe(sql("SELECT count(*) FROM writers_studio_r44_held_approval WHERE state='prepared'")==='0',
  'no review remains replayable after signed edit and revocation refusal');
 const dump=docker(['exec',name,'pg_dump','-Fp','-U','fict','-d','r35_draft']).stdout;
 observe(readAuth.entries.every(x=>![x.approvalToken,x.keyBytes,x.issuerSecret]
   .some(secretPart=>dump.includes(secretPart))),
   'no raw custodian tokens or fictional key bytes in PostgreSQL dump');
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
 observe(sql("SELECT count(*) FROM writers_studio_r44_held_approval WHERE state='spent'")==='2',
   'R46 one successful and one refused Apply remain durably spent');
 observe(sql("SELECT count(*) FROM writers_studio_r35_draft_versions WHERE work_id='33333333-3333-4333-8333-33333333333b'")==='2'&&
   sql("SELECT count(*) FROM writers_studio_r35_draft_versions WHERE work_id='33333333-3333-4333-8333-33333333333c'")==='1',
   'pre-restart one completed and one unresolved fictional Work history');
 // Deliberately cold DB and Node process while retaining exact committed PG
 // metadata in anonymous Docker storage (no host mount or real account).
 docker(['restart',name]);await ready();
 const rebound=docker(['port',name,'5432/tcp']).stdout.trim();
 const checked=/^127\.0\.0\.1:(\d+)$/.exec(rebound);
 if(!checked)throw Error('R48_COLD_HOST_LOOPBACK_CHANGED');
 env.DATABASE_URL='postgresql://fict@127.0.0.1:'+checked[1]+'/r35_draft';
 // Confirm the macOS host forwarder, not only Postgres inside Docker.
 let hostReady=false;
 for(let i=0;i<60;i++){
  const opened=await new Promise<boolean>(resolve=>{
   const socket=connect({host:'127.0.0.1',port:Number(checked[1])});
   socket.once('connect',()=>{socket.destroy();resolve(true);});
   socket.once('error',()=>{socket.destroy();resolve(false);});
   socket.setTimeout(800,()=>{socket.destroy();resolve(false);});
  });
  if(opened){hostReady=true;break;}
  await new Promise(resolve=>setTimeout(resolve,150));
 }
 if(!hostReady)throw Error('R48_COLD_HOST_PORT_NOT_READY');
 observe(sql('SELECT count(*) FROM writers_studio_r44_held_approval')==='2',
   'controlled PostgreSQL restart retains both immutable spent approvals');
 const fresh=spawnSync('./node_modules/.bin/tsx',
  ['scripts/ops/wsBetaR48ColdSpentApply.ts'],{
   cwd:WORK,env:{...env,R48_COLD_PROCESS_FIXTURE:'fictional-only'},
   encoding:'utf8',timeout:70000,maxBuffer:8*1024*1024,
  });
 const returned=(fresh.stdout||'').split('\n').find(line=>
  line.includes('R48_FRESH_PROCESS_SPENT_APPLY_READ_ONLY_PASS'));
 if(fresh.status!==0||!returned)
  throw Error('R48_FRESH_PROCESS_RECOVERY_UNQUALIFIED_'+
    String(fresh.stderr||fresh.error).slice(-160));
 const proof=JSON.parse(returned) as {confirmed:number;unresolved:number;
   retryAuthorized:boolean;releaseApproved:boolean};
 observe(proof.confirmed===1&&proof.unresolved===1&&
   proof.retryAuthorized===false&&proof.releaseApproved===false,
   'fresh Node process confirms one ciphertext Apply and holds one spent unresolved');
 observe(sql("SELECT count(*) FROM writers_studio_r35_draft_versions WHERE work_id='33333333-3333-4333-8333-33333333333b'")==='2'&&
   sql("SELECT count(*) FROM writers_studio_r35_draft_versions WHERE work_id='33333333-3333-4333-8333-33333333333c'")==='1',
   'read-only cold reconciliation creates no new encrypted revisions');

 // All exact fixture cells are disposable, and no real member/payment/mail/provider
 // authorization can be inferred from this SQL and file-vault test.
}
const state={
 status:'R48_SPENT_APPLY_RECOVERY_FICTIONAL_HOLD',checks,errors:null as string|null,
 testedGitHead:null as string|null,
 realMemberTouches:0,modelCalls:0,mailCalls:0,realKmsInstalled:false,
 publicRouteMounted:false,productionChanged:false,
 containerRemoved:false,temporaryVaultRemoved:false,
};
(async()=>{
 try{await main();state.status='R48_SPENT_APPLY_RECOVERY_PG16_FICTIONAL_PASS_RELEASE_HOLD';}
 catch(e){state.errors=String((e as Error)?.message||e).slice(0,210);
  process.exitCode=2;}
 finally{
  if(started)state.containerRemoved=docker(['rm','-f','-v',name],true).status===0;
  else state.containerRemoved=true;
  rmSync(root,{recursive:true,force:true});
  state.temporaryVaultRemoved=!existsSync(root);
  const head=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'});
  state.testedGitHead=head.status===0?head.stdout.trim():null;
  writeFileSync(receipt,JSON.stringify(state,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({
   status:state.status,passedChecks:checks.length,
   clean:state.containerRemoved&&state.temporaryVaultRemoved,
   testedGitHead:state.testedGitHead,error:state.errors,
   releaseApproved:false}));
  if(state.status!=='R48_SPENT_APPLY_RECOVERY_PG16_FICTIONAL_PASS_RELEASE_HOLD'||
    !state.containerRemoved||!state.temporaryVaultRemoved)process.exitCode=2;
 }
})();
