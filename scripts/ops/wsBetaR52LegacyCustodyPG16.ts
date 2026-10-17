/**
 * R52 local PostgreSQL16-only test of historical Writer custody census.
 * DOES NOT activate the 12 real author routes or query actual member tables.
 *
 * No production database address, member data, model, KMS, host storage or
 * remote image pull. Every identity and consent event is invented.
 */
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {Pool} from 'pg';
import {
 R52_CUSTODY_CENSUS_SQL,
 R52_REAL_LEGACY_PILOT_FENCE_ENABLED,
 reviewLegacyWriterPilotFenceR52,
} from '../../lib/writersStudio/release/heldLegacyWriterFenceR52';

if(process.env.R52_PHYSICAL_PG16_FIXTURE!=='fictional-only'||
 R52_REAL_LEGACY_PILOT_FENCE_ENABLED!==false)
 throw Error('R52_REQUIRES_COMPILED_OFF_AND_EXPLICIT_FICTIONAL_ONLY');
const root=process.cwd();
const name='ws-r52-legacy-custody-'+randomUUID().slice(0,11);
const evidence='/Volumes/T7 Shield/ws-beta-r52-legacy-ingress-evidence-20261016';
mkdirSync(evidence,{recursive:true});
const receipt=path.join(evidence,'R52_LEGACY_CUSTODY_PG16_'+randomUUID().slice(0,9)+'.json');
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const C='33333333-3333-4333-8333-333333333333';
const D='44444444-4444-4444-8444-444444444444';
const E='55555555-5555-4555-8555-555555555555';
const F='66666666-6666-4666-8666-666666666666';
const G='77777777-7777-4777-8777-777777777777';
const workE='88888888-8888-4888-8888-888888888888';
const workF='99999999-9999-4999-8999-999999999999';
const digest='a'.repeat(64);
const checks:string[]=[];
const verify=(condition:unknown,label:string)=>{
 if(!condition)throw Error('R52_PHYSICAL_CHECK_FAILED_'+label);
 checks.push(label);
};
function docker(args:string[],optional=false){
 const r=spawnSync('docker',args,{encoding:'utf8',timeout:55000,maxBuffer:16*1024*1024});
 if((r.status!==0||r.error)&&!optional)
  throw Error('R52_DISPOSABLE_DOCKER_REFUSED_'+args[0]+':'+
   String(r.stderr||r.error).slice(-170));
 return r;
}
const pg=(sql:string)=>docker(['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
 '-U','fict','-d','r52_fence','-c',sql]).stdout.trim();
async function waitInside(){
 for(let i=0;i<90;i++){
  const result=docker(['exec',name,'psql','-XAtq','-U','fict',
   '-d','r52_fence','-c','SELECT 1'],true);
  if(result.status===0&&result.stdout.trim()==='1')return;
  await new Promise(resolve=>setTimeout(resolve,180));
 }
 throw Error('R52_DISPOSABLE_PG16_DID_NOT_START');
}
function apply(pathname:string){
 const file=path.join(root,pathname);
 const dst='/tmp/'+path.basename(file);
 docker(['cp',file,name+':'+dst]);
 docker(['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','r52_fence','-f',dst]);
}
let started=false,pool:Pool|null=null;
const state={
 status:'R52_FICTIONAL_HISTORY_CENSUS_HOLD',
 checks,errors:null as string|null,cleanContainer:false,
 releaseApproved:false,realMemberTouches:0,providerCalls:0,
 productionChanged:false,liveRoutesEnabled:false,
};
async function main(){
 docker(['run','--pull','never','-d','--name',name,
  '--network','bridge','--memory','512m','--cpus','1',
  '--pids-limit','128','--security-opt','no-new-privileges',
  '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=256m',
  '-p','127.0.0.1::5432','-e','POSTGRES_USER=fict',
  '-e','POSTGRES_DB=r52_fence','-e','POSTGRES_HOST_AUTH_METHOD=trust',
  'postgres:16.13']);
 started=true;
 await waitInside();
 verify(pg('SHOW server_version_num').startsWith('160'),'isolated PostgreSQL16');
 const conf=JSON.parse(docker(['inspect',name]).stdout)[0];
 verify(conf.HostConfig.PortBindings?.['5432/tcp']?.[0]?.HostIp==='127.0.0.1'&&
  conf.HostConfig.Binds===null,'database loopback and no host mounts');
 const binding=docker(['port',name,'5432/tcp']).stdout.trim();
 const bound=/^127\.0\.0\.1:(\d+)$/.exec(binding);
 if(!bound)throw Error('R52_REFUSED_NONLOCAL_DOCKER_FORWARDER');
 pg("CREATE TABLE members (id uuid PRIMARY KEY,admin_role text);"+
    "CREATE TABLE member_manuscripts (id uuid PRIMARY KEY,"+
    " member_id uuid NOT NULL REFERENCES members(id));");
 pg("INSERT INTO members (id,admin_role) VALUES "+
    [A,B,C,D,E,F].map(id=>"('"+id+"',NULL)").join(',')+
    ",('"+G+"','founder');"+
    "INSERT INTO member_manuscripts (id,member_id) VALUES "+
    "('"+workE+"','"+E+"'),('"+workF+"','"+F+"');");
 apply('database/migrations/20261015000001_writer_studio_beta_consent_events.sql');
 apply('docs/ops/WS_R32_ENCRYPTED_ORIGINAL_REVIEW_ONLY.sql');
 apply('docs/ops/WS_R33_ENCRYPTED_PENDING_REVIEW_ONLY.sql');
 apply('docs/ops/WS_R35_ENCRYPTED_DRAFT_LEDGER_REVIEW_ONLY.sql');
 verify(pg('SELECT count(*) FROM writers_studio_beta_consent_events')==='0'&&
  pg('SELECT count(*) FROM writers_studio_r32_held_originals')==='0'&&
  pg('SELECT count(*) FROM writers_studio_r33_held_pending')==='0'&&
  pg('SELECT count(*) FROM writers_studio_r35_draft_heads')==='0',
  'four canonical protected table families start empty');
 // C was previously accepted and subsequently revoked. This must still
 // permanently fence the old plaintext writer even if not on pilot allowlist.
 pg("INSERT INTO writers_studio_beta_consent_events"+
  " (member_id,actor_member_id,decision,policy_version,policy_sha256) VALUES "+
  "('"+C+"','"+C+"','accept','synthetic-v1','"+digest+"'),"+
  "('"+C+"','"+C+"','revoke','synthetic-v1','"+digest+"');");
 // D has pending encrypted arrival, no immutable Source yet.
 pg("INSERT INTO writers_studio_r33_held_pending"+
  " (arrival_id,member_id,pending_generation,pending_key_id,"+
  "envelope_ref,metadata_ref,envelope_sha256,metadata_sha256,pair_sha256) VALUES "+
  "('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','"+D+"',1,"+
  "'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',"+
  "'ws-beta-r33-held-pending/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.enc',"+
  "'ws-beta-r33-held-pending/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.enc',"+
  "'"+digest+"','"+digest+"','"+digest+"');");
 // E has only immutable encrypted Source custody, F only a protected Draft.
 pg("INSERT INTO writers_studio_r32_held_originals"+
  " (id,member_id,manuscript_id,arrival_id,work_generation,key_id,"+
  "work_ref,metadata_ref,work_sha256,metadata_sha256,pair_sha256) VALUES "+
  "('cccccccc-cccc-4ccc-8ccc-cccccccccccc','"+E+"','"+workE+"',"+
  "'dddddddd-dddd-4ddd-8ddd-dddddddddddd',1,"+
  "'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',"+
  "'ws-beta-r32-held-source/cccccccc-cccc-4ccc-8ccc-cccccccccccc.enc',"+
  "'ws-beta-r32-held-source/dddddddd-dddd-4ddd-8ddd-dddddddddddd.enc',"+
  "'"+digest+"','"+digest+"','"+digest+"');");
 pg("INSERT INTO writers_studio_r35_draft_heads"+
  " (work_id,member_id,generation,checkpoint_count) VALUES "+
  "('"+workF+"','"+F+"',1,0);");
 verify(pg("SELECT count(*) FROM writers_studio_beta_consent_events")==='2'&&
  pg("SELECT count(*) FROM writers_studio_r32_held_originals")==='1'&&
  pg("SELECT count(*) FROM writers_studio_r33_held_pending")==='1'&&
  pg("SELECT count(*) FROM writers_studio_r35_draft_heads")==='1',
  'recorded fictional consent/Source/pending/Draft history');
 pool=new Pool({connectionString:'postgresql://fict@127.0.0.1:'+
  bound[1]+'/r52_fence',max:2,connectionTimeoutMillis:2500});
 const cases=[
  [A,'pilot_requires_encrypted_writer'],
  [B,'nonpilot_legacy_preserved'],
  [C,'historically_protected_writer'],
  [D,'historically_protected_writer'],
  [E,'historically_protected_writer'],
  [F,'historically_protected_writer'],
  [G,'founder_requires_encrypted_writer'],
 ] as const;
 for(const [id,expected] of cases){
  const result=await pool.query<{
   founder_or_cto:boolean;protected_custody_witness:boolean;
  }>(R52_CUSTODY_CENSUS_SQL,[id]);
  if(result.rows.length!==1)throw Error('R52_MEMBER_CENSUS_ROW_MISSING');
  const item=result.rows[0];
  const reviewed=reviewLegacyWriterPilotFenceR52({
   activated:true,verifiedMemberId:id,rawPilotIds:A,
   founderOrCto:item.founder_or_cto,
   protectedCustodyWitness:item.protected_custody_witness,
   restrictedBetaEnabled:true,
  });
  verify(reviewed.reason===expected&&
   reviewed.mayWriteLegacy===(id===B)&&
   reviewed.encryptedWritingAuthorized===false&&
   reviewed.releaseApproved===false,
   'fictional member role/history cannot downgrade legacy policy');
 }
 // A missing custody table yields an actual PG error. A future activated
 // writer would hold its request; a SQL exception can never mean no custody.
 pg('DROP TABLE writers_studio_r33_held_pending');
 let missingRefused=false;
 try{await pool.query(R52_CUSTODY_CENSUS_SQL,[B]);}
 catch{missingRefused=true;}
 verify(missingRefused&&reviewLegacyWriterPilotFenceR52({
  activated:true,verifiedMemberId:B,rawPilotIds:A,
  founderOrCto:false,protectedCustodyWitness:null,
  restrictedBetaEnabled:true,
 }).mayWriteLegacy===false,
 'unavailable original custody table refuses instead of using legacy SQL');
 verify(R52_REAL_LEGACY_PILOT_FENCE_ENABLED===false,
  'all actual Next routes remain compiled default-off');
}
(async()=>{
 try{
  await main();
  state.status='R52_FICTIONAL_PG16_HISTORICAL_FENCE_PASS_RELEASE_HOLD';
 }catch(e){
  state.errors=(e instanceof Error?e.message:String(e)).slice(0,220);
  process.exitCode=2;
 }finally{
  if(pool)await pool.end().catch(()=>{});
  state.cleanContainer=!started||
   docker(['rm','-f','-v',name],true).status===0;
  writeFileSync(receipt,JSON.stringify(state,null,2)+'\n',{
   mode:0o600,flag:'wx',
  });
  console.log(JSON.stringify({status:state.status,
   checks:state.checks.length,clean:state.cleanContainer,
   error:state.errors,receipt,releaseApproved:false}));
  if(!state.cleanContainer||state.status!==
   'R52_FICTIONAL_PG16_HISTORICAL_FENCE_PASS_RELEASE_HOLD')
   process.exitCode=2;
 }
})();
