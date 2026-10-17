/**
 * R56: actual auth_sessions + beta contact/consent + member manuscript/Living
 * Work relation + R32 Source + R35 protected Draft head, all in a disposable
 * PostgreSQL 16 database. No real session, human, Work key or manuscript.
 *
 * This is READ ONLY relative to any real data and the application: fixture
 * setup inserts invented metadata into an anonymous tmpfs PostgreSQL.
 * R56 inspector never writes. No network provider, cloud DB, or active route.
 */
import {spawnSync} from 'node:child_process';
import {randomUUID,createHash} from 'node:crypto';
import {mkdirSync,mkdtempSync,rmSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {NextRequest} from 'next/server';
import {Pool} from 'pg';
const ROOT=process.cwd();
if(process.env.R56_PHYSICAL_PG16_FIXTURE!=='fictional-only')
 throw Error('R56_REAL_MEMBER_DATABASE_REFUSED');
const output='/Volumes/T7 Shield/ws-beta-r56-author-boundary-evidence-20261016';
mkdirSync(output,{recursive:true});
const evidence=path.join(output,'R56_VERIFIED_MEMBER_WORK_PG16_'+randomUUID().slice(0,9)+'.json');
const name='ws-r56-author-'+randomUUID().slice(0,11);
const temp=mkdtempSync(path.join(tmpdir(),'ws-r35-physical-r56-'));
const vault=path.join(temp,'vault');mkdirSync(vault,{mode:0o700});
const M='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const C='33333333-3333-4333-8333-333333333333';
const MANUSCRIPT='44444444-4444-4444-8444-444444444444';
const FOREIGN_MANUSCRIPT='55555555-5555-4555-8555-555555555555';
const NO_SOURCE='66666666-6666-4666-8666-666666666666';
const NO_DRAFT='77777777-7777-4777-8777-777777777777';
const WORK='88888888-8888-4888-8888-888888888888';
const WORK2='99999999-9999-4999-8999-999999999999';
const FOREIGN_WORK='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const UNDECLARED='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ID='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const KID='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const ARRIVAL='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const NOTICE='Fictional notice for an isolated protected Writer Studio review. '+
 'No actual member, provider, or production Work is part of this rehearsal.';
const HASH=createHash('sha256').update(NOTICE).digest('hex');
const TOKEN='r56-invented-session-verified-only';
const OTHER_TOKEN='r56-invented-other-session';
const CHK:string[]=[];
const verify=(v:unknown,message:string)=>{
 if(!v)throw Error('R56_VERIFICATION_REFUSED_'+message);
 CHK.push(message);
};
let created=false;
let pool:Pool|null=null;
let sourceHead:string|null=null;
const state={
 status:'R56_FICTIONAL_MEMBER_WORK_HELD',checks:CHK,error:null as string|null,
 sourceCommit:null as string|null,disposableContainerRemoved:false,
 temporaryVaultRemoved:false,productionChanged:false,realMemberRecordsRead:0,
 externalProviderCalls:0,memberWritingEnabled:false,
};
function docker(args:string[],optional=false){
 const x=spawnSync('docker',args,{
  cwd:ROOT,encoding:'utf8',timeout:55000,maxBuffer:16*1024*1024});
 if(x.status!==0&&!optional)
  throw Error('R56_DOCKER_FIXTURE_REFUSED_'+args[0]+'_'+
   String(x.stderr||x.error).slice(-140));
 return x;
}
function sql(command:string){
 return docker(['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','r35_draft','-c',command]).stdout.trim();
}
function apply(relative:string){
 const source=path.join(ROOT,relative);
 const target='/tmp/'+path.basename(source);
 docker(['cp',source,name+':'+target]);
 docker(['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','r35_draft','-f',target]);
}
async function ready(){
 for(let i=0;i<85;i++){
  const p=docker(['exec',name,'psql','-XAtq','-U','fict',
   '-d','r35_draft','-c','SELECT 1'],true);
  if(p.status===0&&p.stdout.trim()==='1')return;
  await new Promise(r=>setTimeout(r,170));
 }
 throw Error('R56_POSTGRES16_NOT_READY');
}
async function main(){
 docker(['run','--pull','never','-d','--name',name,
  '--network','bridge','--memory','560m','--cpus','1',
  '--pids-limit','128','--security-opt','no-new-privileges',
  '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=256m',
  '-p','127.0.0.1::5432','-e','POSTGRES_USER=fict',
  '-e','POSTGRES_DB=r35_draft','-e','POSTGRES_HOST_AUTH_METHOD=trust',
  'postgres:16.13']);
 created=true;await ready();
 verify(sql('SHOW server_version_num').startsWith('160'),
  'PostgreSQL16 actual disposable server started');
 const configuration=JSON.parse(docker(['inspect',name]).stdout)[0];
 const bind=configuration.HostConfig.PortBindings?.['5432/tcp']?.[0];
 verify(bind?.HostIp==='127.0.0.1'&&
  configuration.HostConfig.Binds===null,
  'fixture PostgreSQL port localhost-only and no host mounts');
 const portRaw=docker(['port',name,'5432/tcp']).stdout.trim();
 const bound=/^127\.0\.0\.1:(\d+)$/.exec(portRaw);
 if(!bound)throw Error('R56_NON_LOCAL_POSTGRES_FORWARDER');
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:'+bound[1]+'/r35_draft';
 process.env.FILE_STORAGE_PATH=vault;
 process.env.R56_REAL_SESSION_WORK_FIXTURE='fictional-only';
 process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
 process.env.WRITERS_STUDIO_BETA_MEMBER_IDS=[M,B,C].join(',');
 process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION='fictional-r56-v1';
 process.env.WRITERS_STUDIO_BETA_CONSENT_NOTICE=NOTICE;
 process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256=HASH;
 sql("CREATE TABLE members(id uuid PRIMARY KEY,admin_role text,tier text,roles jsonb);"+
  "CREATE TABLE auth_sessions(session_token text PRIMARY KEY,"+
  "member_id uuid NOT NULL REFERENCES members(id),revoked boolean NOT NULL,"+
  "expires_at timestamptz NOT NULL);"+
  "CREATE TABLE ops_contacts(member_id uuid NOT NULL REFERENCES members(id),"+
  "deleted_at timestamptz,contact_type text,pipeline_stage text);"+
  "CREATE TABLE member_manuscripts(id uuid PRIMARY KEY,"+
  "member_id uuid NOT NULL REFERENCES members(id),title text NOT NULL);");
 sql("INSERT INTO members(id,admin_role,tier,roles) VALUES "+
  "('"+M+"',NULL,'pro','[\"member\"]'::jsonb),"+
  "('"+B+"',NULL,'pro','[\"member\"]'::jsonb),"+
  "('"+C+"','founder','pro','[\"admin\"]'::jsonb);"+
  "INSERT INTO auth_sessions VALUES"+
  "('"+TOKEN+"','"+M+"',false,now()+interval '2 hours'),"+
  "('"+OTHER_TOKEN+"','"+B+"',false,now()+interval '2 hours'),"+
  "('expired-fictional','"+M+"',false,now()-interval '1 hour'),"+
  "('revoked-fictional','"+M+"',true,now()+interval '2 hours');"+
  "INSERT INTO ops_contacts(member_id,contact_type,pipeline_stage) VALUES "+
  "('"+M+"','beta_tester','active'),"+
  "('"+B+"','beta_tester','active');"+
  "INSERT INTO member_manuscripts VALUES"+
  "('"+MANUSCRIPT+"','"+M+"','Invented Manuscript'),"+
  "('"+FOREIGN_MANUSCRIPT+"','"+B+"','Other Invented Manuscript'),"+
  "('"+NO_SOURCE+"','"+M+"','Not Published Source'),"+
  "('"+NO_DRAFT+"','"+M+"','Unpublished Draft');");
 apply('database/migrations/20261015000001_writer_studio_beta_consent_events.sql');
 apply('database/migrations/20260801000001_living_works.sql');
 apply('docs/ops/WS_R32_ENCRYPTED_ORIGINAL_REVIEW_ONLY.sql');
 apply('docs/ops/WS_R35_ENCRYPTED_DRAFT_LEDGER_REVIEW_ONLY.sql');
 sql("INSERT INTO living_works(id,member_id,title) VALUES"+
  "('"+WORK+"','"+M+"','Declared Work'),"+
  "('"+WORK2+"','"+M+"','Other Legitimate Work'),"+
  "('"+FOREIGN_WORK+"','"+B+"','Foreign Work'),"+
  "('"+UNDECLARED+"','"+M+"','Unlinked Work');"+
  "INSERT INTO living_work_expressions(living_work_id,expression_type,"+
  "expression_id,declared_by) VALUES"+
  "('"+WORK+"','manuscript','"+MANUSCRIPT+"','"+M+"'),"+
  "('"+WORK2+"','manuscript','"+MANUSCRIPT+"','"+M+"'),"+
  "('"+WORK+"','manuscript','"+NO_SOURCE+"','"+M+"'),"+
  "('"+WORK+"','manuscript','"+NO_DRAFT+"','"+M+"'),"+
  "('"+FOREIGN_WORK+"','manuscript','"+FOREIGN_MANUSCRIPT+"','"+B+"');"+
  "INSERT INTO writers_studio_r35_draft_heads"+
  "(work_id,member_id,generation,checkpoint_count) VALUES"+
  "('"+MANUSCRIPT+"','"+M+"',1,0),"+
  "('"+NO_SOURCE+"','"+M+"',1,0),"+
  "('"+FOREIGN_MANUSCRIPT+"','"+B+"',1,0);");
 const ref=(part:string)=>"ws-beta-r32-held-source/"+part+".enc";
 for(const [member,mId,sid,arrival] of [
  [M,MANUSCRIPT,ID,ARRIVAL],
  [M,NO_DRAFT,'11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   '11111111-bbbb-4bbb-8bbb-bbbbbbbbbbbb'],
 ]){
  const meta=randomUUID();
  sql("INSERT INTO writers_studio_r32_held_originals"+
   " (id,member_id,manuscript_id,arrival_id,work_generation,key_id,"+
   "work_ref,metadata_ref,work_sha256,metadata_sha256,pair_sha256) VALUES"+
   "('"+sid+"','"+member+"','"+mId+"','"+arrival+
   "',1,'"+KID+"','"+ref(sid)+"','"+ref(meta)+"','"+
   HASH+"','"+HASH+"','"+HASH+"');");
 }
 sql("INSERT INTO writers_studio_beta_consent_events"+
  "(member_id,actor_member_id,decision,policy_version,policy_sha256) VALUES"+
  "('"+M+"','"+M+"','accept','fictional-r56-v1','"+HASH+"'),"+
  "('"+B+"','"+B+"','accept','fictional-r56-v1','"+HASH+"'),"+
  "('"+C+"','"+C+"','accept','fictional-r56-v1','"+HASH+"');");
 pool=new Pool({connectionString:process.env.DATABASE_URL,max:2,
  connectionTimeoutMillis:3500});
 const {
  readHeldRealSessionWorkR56,
  recheckHeldRealSessionWorkR56,R56_REAL_PROTECTED_WRITER_ENABLED,
  R56_HELD_ROUTE,
 }=await import('../../lib/writersStudio/recovery/heldRealSessionWorkAdmissionR56');
 verify(R56_REAL_PROTECTED_WRITER_ENABLED===false,
  'compiled source prohibits real writer activation');
 function request(options:{
  token?:string;cookie?:string;url?:string;origin?:string;
  header?:Record<string,string>;intent?:string;
 }={}){
  const token=options.token??TOKEN;
  return new NextRequest(options.url??'https://soullab.life'+R56_HELD_ROUTE,{
   method:'POST',headers:{
    host:'soullab.life',
    origin:options.origin??'https://soullab.life',
    'sec-fetch-site':'same-origin',
    'content-type':'application/json',
    'x-ws-author-intent':options.intent??'review',
    ...(options.cookie==='none'?{'x-session-token':token}:
     {cookie:'maia_session='+(options.cookie??token)}),
    ...options.header,
   },
  });
 }
 const action=(r=request(),manuscript=MANUSCRIPT,living=WORK,
  intent:'review'|'apply'='review')=>
  readHeldRealSessionWorkR56({
   request:r,manuscriptId:manuscript,
   selectedLivingWorkId:living,intent,
  });
 const ok=await action();
 verify(ok.kind==='held_private_session_and_work_witness'&&
  ok.memberId===M&&ok.protectedDraftManuscriptId===MANUSCRIPT&&
  ok.declaredLivingWorkId===WORK&&ok.currentDraftGeneration===1&&
  ok.writerAuthorized===false&&ok.releaseApproved===false,
  'actual signed-in auth_sessions and declared living Work structurally checked');
 if(ok.kind!=='held_private_session_and_work_witness')
  throw Error('R56_ACTUAL_PG_AUTH_NOT_ACCEPTED');
 verify((await recheckHeldRealSessionWorkR56(ok,request())).kind===
  'held_private_session_and_work_witness',
  'fresh repeated session plus latest consent and protected Work still current');
 verify((await action(request(),MANUSCRIPT,WORK2)).kind===
  'held_private_session_and_work_witness',
  'two legitimately declared living Works are individually provable without guessing');
 verify((await action(request(),MANUSCRIPT,UNDECLARED)).kind==='held_refused',
  'same-owner undeclared living Work cannot silently inherit manuscript');
 verify((await action(request(),MANUSCRIPT,FOREIGN_WORK)).kind==='held_refused',
  'foreign declared Work cannot be borrowed through a real session');
 verify((await action(request(),FOREIGN_MANUSCRIPT,FOREIGN_WORK)).kind==='held_refused',
  'foreign manuscript and foreign living Work cannot cross member boundaries');
 verify((await action(request(),NO_SOURCE,WORK)).kind==='held_refused',
  'protected Draft without immutable R32 Source cannot authorize editing');
 verify((await action(request(),NO_DRAFT,WORK)).kind==='held_refused',
  'immutable Source without protected R35 draft head cannot authorize editing');
 verify((await action(request({cookie:'expired-fictional'}))).kind==='held_refused'&&
  (await action(request({cookie:'revoked-fictional'}))).kind==='held_refused',
  'expired and revoked auth_sessions independently deny writer admission');
 verify((await action(request({header:{'x-member-id':B}}))).kind==='held_refused',
  'client identity claim conflicting with verified auth_sessions rejected');
 verify((await action(request({cookie:'none'}))).kind===
  'held_private_session_and_work_witness',
  'genuine auth_sessions validated x-session-token transport with no cookie');
 verify((await action(request({url:'https://soullab.life'+R56_HELD_ROUTE+'?_t='+TOKEN}))).kind===
  'held_refused',
  'sensitive session token in author POST query URL never accepted');
 verify((await action(request({origin:'https://attacker.invalid'}))).kind===
  'held_refused','cross-origin browser POST cannot receive review authorization');
 verify((await action(request({header:{'sec-fetch-site':'cross-site'}}))).kind===
  'held_refused','cross-site author POST blocked even with existing cookie');
 const founder=await action(request({cookie:'none',token:OTHER_TOKEN}));
 verify(founder.kind==='held_refused'||
  (founder.kind==='held_private_session_and_work_witness'&&founder.memberId===B),
  'different verified session cannot impersonate the original writer');
 sql("INSERT INTO writers_studio_beta_consent_events"+
  "(member_id,actor_member_id,decision,policy_version,policy_sha256) VALUES"+
  "('"+M+"','"+M+"','revoke','fictional-r56-v1','"+HASH+"');");
 verify((await recheckHeldRealSessionWorkR56(ok,request())).kind===
  'held_refused',
  'consent withdrawal between preview and commit revalidation refuses');
 sql("INSERT INTO writers_studio_beta_consent_events"+
  "(member_id,actor_member_id,decision,policy_version,policy_sha256) VALUES"+
  "('"+M+"','"+M+"','accept','fictional-r56-v1','"+HASH+"');");
 const changed=await recheckHeldRealSessionWorkR56(ok,request());
 verify(changed.kind==='held_refused',
  'even renewed consent is a different immutable epoch from prior review');
 const current=await action();
 verify(current.kind==='held_private_session_and_work_witness',
  'new accepted consent epoch requires fresh author review');
 if(current.kind!=='held_private_session_and_work_witness')
  throw Error('R56_NEW_CONSENT_REVIEW_MISSING');
 sql("UPDATE writers_studio_r35_draft_heads SET generation=2"+
  " WHERE work_id='"+MANUSCRIPT+"'");
 verify((await recheckHeldRealSessionWorkR56(current,request())).kind===
  'held_refused',
  'current protected draft head advanced after review and was rejected');
 verify((await action()).kind==='held_private_session_and_work_witness',
  'updated current head is only eligible for a NEW review');
 const newReview=await action();
 if(newReview.kind!=='held_private_session_and_work_witness')
  throw Error('R56_NEW_REVIEW_NOT_PRESENT');
 sql("UPDATE auth_sessions SET revoked=true WHERE session_token='"+TOKEN+"'");
 verify((await recheckHeldRealSessionWorkR56(newReview,request())).kind===
  'held_refused',
  'session revocation between earlier review and signed-edit preflight refuses');
 // Missing additive protected table is NOT an excuse to write to legacy SQL.
 sql('DROP TABLE writers_studio_r32_held_originals');
 verify((await action()).kind==='held_refused',
  'missing protected Source schema never provides plaintext fallback');
 const dump=docker(['exec',name,'pg_dump','-Fp','-U','fict','-d','r35_draft']).stdout;
 verify(!dump.includes(NOTICE)&&!dump.includes(TOKEN.slice(0,16)+'-'+MANUSCRIPT),
  'fictional session/notice metadata does not include user writing');
 verify(sql("SELECT count(*) FROM writers_studio_r35_draft_versions")==='0',
  'R56 performs no encrypted draft Save, Apply or Undo');
}
(async()=>{
 try{await main();state.status='R56_REAL_AUTH_SESSION_WORK_RELATION_PG16_PASS_RELEASE_HOLD';}
 catch(e){state.error=(e instanceof Error?e.message:String(e)).slice(0,250);
  process.exitCode=2;}
 finally{
  const ownedPool=pool as Pool|null;
  if(ownedPool)await ownedPool.end().catch(()=>{});
  // This driver also uses the application's singleton read-only SQL pool;
  // close it before disposing the fictional PostgreSQL instance.
  try{
   const shared=await import('../../lib/db/postgres');
   await shared.closePool();
  }catch{
   state.error=state.error??'r56_pool_teardown_unverified';
   process.exitCode=2;
  }
  state.disposableContainerRemoved=!created||
   docker(['rm','-f','-v',name],true).status===0;
  rmSync(temp,{recursive:true,force:true});
  state.temporaryVaultRemoved=!existsSync(temp);
  const git=spawnSync('git',['rev-parse','HEAD'],{
   cwd:ROOT,encoding:'utf8'});
  state.sourceCommit=git.status===0?git.stdout.trim():null;
  writeFileSync(evidence,JSON.stringify(state,null,2)+'\n',{
   mode:0o600,flag:'wx',
  });
  console.log(JSON.stringify({
   status:state.status,passedChecks:CHK.length,
   cleaned:state.disposableContainerRemoved&&state.temporaryVaultRemoved,
   error:state.error,sourceCommit:state.sourceCommit,
   releaseApproved:false,receipt:evidence,
  }));
  if(state.status!=='R56_REAL_AUTH_SESSION_WORK_RELATION_PG16_PASS_RELEASE_HOLD'||
   !state.disposableContainerRemoved||!state.temporaryVaultRemoved)
   process.exitCode=2;
 }
})();
