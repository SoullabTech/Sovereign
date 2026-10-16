/**
 * R21 physical fixture only: local, disposable actual PostgreSQL16.
 * No real account, mail, providers, production, live keys, migrations or web.
 */
import {spawnSync} from 'node:child_process';
import {randomBytes,randomUUID,generateKeyPairSync,sign} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {canonicalDeletionPayload, type DeletionHighwaterV1} from '../../lib/writersStudio/recovery/deletionBarrierV1';
import type {R21HeldWriter,Trust} from '../../lib/writersStudio/recovery/heldEncryptedHistoryR21';
import type {WorkEncryptionKey,WorkRecord} from '../../lib/writersStudio/recovery/workEnvelopeV1';

if(process.env.R21_FICTIONAL_ENCRYPTED_HISTORY!=='fictional-only')
 throw Error('R21_EXACT_FICTIONAL_ONLY_OPTIN_REQUIRED');
const CONTAINER='ws-r21-fict-'+randomUUID().slice(0,10);
const PGPORT='55421';
const ROOT='/Volumes/T7 Shield/ws-beta-r21-encrypted-history-20261016';
const EVIDENCE='/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R21_PG16_ENCRYPTED_HISTORY_20261016.json';
const MEMBER='11111111-1111-4111-8111-111111111111';
const FOREIGN='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-333333333333';
const OTHERWORK='44444444-4444-4444-8444-444444444444';
const SENTINEL='R21_Synthetic_Manuscript_Original_And_Edited_Words';
const NOTE='R21 fictional history note with deliberately unusual text';
const receipt={
 status:'HOLD',postgresVersion:'',checks:[] as string[],negativeControls:[] as string[],
 noRealMembers:true,noProviderCalls:true,release:'HOLD',
 containerRemoved:false,error:null as string|null,
};
let created=false,close:undefined|(()=>Promise<void>);
function exec(cmd:string,args:string[],opts?:{input?:string;timeout?:number;ok?:boolean}):string{
 const x=spawnSync(cmd,args,{encoding:'utf8',input:opts?.input,timeout:opts?.timeout??25000,maxBuffer:8*1024*1024});
 if((x.error||x.status!==0)&&opts?.ok!==false)
  throw Error('r21_fixture_command_refused:'+cmd+':'+String(x.stderr||x.error).slice(-140));
 return (x.stdout||'').trim();
}
const docker=(args:string[],input?:string)=>exec('docker',args,{input});
function pg(sql:string):string{
 return docker(['exec',CONTAINER,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fictowner','-d','fictional_writer','-c',sql]);
}
function check(ok:unknown,msg:string){
 if(!ok)throw Error('r21_check_failed:'+msg);
 receipt.checks.push(msg);
}
function refused(p:Promise<unknown>,name:string) {
 return p.then(()=>{throw Error('r21_expected_refusal_failed:'+name)},()=>receipt.negativeControls.push(name));
}
const owner=(memberId:string):R21HeldWriter=>({
 kind:'held_only',subject:{memberId,assertedBy:'server_verified_member_session'},
 origin:'https://soullab.life',
});
(async()=>{
 try{
  docker(['run','--pull','never','-d','--name',CONTAINER,
   '--network','bridge','-p','127.0.0.1:'+PGPORT+':5432',
   '-e','POSTGRES_HOST_AUTH_METHOD=trust','-e','POSTGRES_USER=fictowner',
   '-e','POSTGRES_DB=fictional_writer','postgres:16.13']);
  created=true;
  let ready=false;
  for(let i=0;i<60;i++){
   const x=spawnSync('docker',['exec',CONTAINER,'psql','-XAtq','-U',
     'fictowner','-d','fictional_writer','-c','SELECT 1'],{encoding:'utf8',timeout:5000});
   if(x.status===0&&x.stdout.trim()==='1'){ready=true;break;}
   await new Promise(res=>setTimeout(res,250));
  }
  check(ready,'isolated PG16 ready with real SQL read');
  const ins=JSON.parse(docker(['inspect',CONTAINER]))[0];
  check(ins.HostConfig.PortBindings?.['5432/tcp']?.[0]?.HostIp==='127.0.0.1'
    &&ins.HostConfig.Binds===null &&ins.State.Running,
    'PG16 bound only to Mac loopback without host file mounts');
  receipt.postgresVersion=pg('SHOW server_version');
  check(receipt.postgresVersion.startsWith('16.'),'actual PG16 major verified');
  pg(`CREATE TABLE members(id uuid PRIMARY KEY);
 CREATE TABLE member_manuscripts(id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES members(id));
 INSERT INTO members VALUES ('${MEMBER}'),('${FOREIGN}');
 INSERT INTO member_manuscripts VALUES ('${WORK}','${MEMBER}'),('${OTHERWORK}','${FOREIGN}');`);
  const SQL=ROOT+'/docs/ops/WS_R21_ENCRYPTED_HISTORY_REVIEW_ONLY.sql';
  docker(['cp',SQL,CONTAINER+':/tmp/r21_held.sql']);
  docker(['exec',CONTAINER,'psql','-XAtq','-v','ON_ERROR_STOP=1','-U','fictowner',
   '-d','fictional_writer','-f','/tmp/r21_held.sql']);
  check(pg('SELECT count(*) FROM writers_studio_r21_held_revisions')==='0',
   'held encrypted revision table created only in disposable DB');
  process.env.DATABASE_URL='postgresql://fictowner@127.0.0.1:'+PGPORT+'/fictional_writer';
  const api=await import('../../lib/writersStudio/recovery/heldEncryptedHistoryR21');
  const db=await import('../../lib/db/postgres');
  close=()=>db.closePool();
  check(api.R21_REAL_MEMBER_ENCRYPTED_WRITES_ENABLED===false,'live R21 writer flag OFF');

  const key:WorkEncryptionKey={keyId:randomUUID(),keyBytes:randomBytes(32)};
  const signing=generateKeyPairSync('ed25519');
  const h:DeletionHighwaterV1={protocol:'soullab.ws.deletion-highwater.v1',
   stream:'writers-studio-beta',generation:20,revokedWorks:[],revokedKeyIds:[]};
  const trust:Trust={signed:{checkpoint:h,signature:sign(null,
   canonicalDeletionPayload(h),signing.privateKey).toString('base64')},
   signer:signing.publicKey,independent:{minimumGeneration:20}};
  // Keys and independent epoch are FICTIONAL, so this does not prove a live custodian.
  const textRecords=(text:string):WorkRecord[]=>[
   {field:'manuscript_working_drafts.content',recordId:randomUUID(),value:Buffer.from(text)},
   {field:'working_draft_revisions.note',recordId:randomUUID(),value:Buffer.from(NOTE)},
  ];
  const one=await api.appendHeldRevisionR21({writer:owner(MEMBER),workId:WORK,
   generation:1,records:textRecords(SENTINEL+' original'),key,trust});
  check(one.generation===1&&one.previousDigest===null,'first encrypted revision appended');
  const two=await api.appendHeldRevisionR21({writer:owner(MEMBER),workId:WORK,
   generation:2,records:textRecords(SENTINEL+' edited'),key,trust});
  check(two.generation===2&&two.previousDigest===one.cipherDigest,
   'second immutable revision links exact first ciphertext digest');
  const old=await api.readHeldRevisionR21({writer:owner(MEMBER),workId:WORK,
   generation:1,key,trust});
  const latest=await api.readHeldRevisionR21({writer:owner(MEMBER),workId:WORK,
   generation:2,key,trust});
  check(old.records[0].value.toString()==SENTINEL+' original'&&
    latest.records[0].value.toString()==SENTINEL+' edited',
    'owned original and edited draft both reopen with exact bytes');
  await refused(api.readHeldRevisionR21({writer:owner(FOREIGN),workId:WORK,
    generation:2,key,trust}),'CROSS_MEMBER_READ_REFUSED');
  await refused(api.appendHeldRevisionR21({writer:owner(FOREIGN),workId:WORK,
    generation:3,records:textRecords(SENTINEL+' foreign'),key,trust}),
    'CROSS_MEMBER_SAVE_REFUSED');
  await refused(api.appendHeldRevisionR21({writer:owner(MEMBER),workId:WORK,
    generation:2,records:textRecords(SENTINEL+' stale'),key,trust}),
    'STALE_VERSION_REFUSED');
  await refused(api.readHeldRevisionR21({writer:owner(MEMBER),workId:WORK,
    generation:2,key:{keyId:randomUUID(),keyBytes:randomBytes(32)},trust}),
    'WRONG_KEY_REFUSED');
  await refused(api.readHeldRevisionR21({writer:owner(MEMBER),workId:WORK,
    generation:2,key,trust:{...trust,independent:null}}),'NO_INDEPENDENT_EPOCH_REFUSED');
  const staleTrust:Trust={...trust,independent:{minimumGeneration:21}};
  await refused(api.readHeldRevisionR21({writer:owner(MEMBER),workId:WORK,
    generation:2,key,trust:staleTrust}),'STALE_SIGNED_HIGHWATER_REFUSED');
  const revoked={...h,revokedWorks:[WORK]};
  const revokedTrust:Trust={...trust,signed:{checkpoint:revoked,signature:sign(
   null,canonicalDeletionPayload(revoked),signing.privateKey).toString('base64')}};
  await refused(api.readHeldRevisionR21({writer:owner(MEMBER),workId:WORK,
    generation:2,key,trust:revokedTrust}),'DELETED_WORK_REFUSED');
  // A racing pair for new generation MUST NOT both commit.
  const racing=await Promise.allSettled([api.appendHeldRevisionR21({
   writer:owner(MEMBER),workId:WORK,generation:3,
   records:textRecords(SENTINEL+' raced A'),key,trust}),
   api.appendHeldRevisionR21({writer:owner(MEMBER),workId:WORK,generation:3,
   records:textRecords(SENTINEL+' raced B'),key,trust})]);
  check(racing.filter(x=>x.status==='fulfilled').length===1 &&
   racing.filter(x=>x.status==='rejected').length===1,
   'concurrent same-generation save has exactly one winner');
  receipt.negativeControls.push('CONCURRENT_GENERATION_COLLISION_REFUSED');
  const dump=docker(['exec',CONTAINER,'pg_dump','--no-owner','--no-privileges',
    '-U','fictowner','-d','fictional_writer']);
  check(!dump.includes(SENTINEL)&&!dump.includes(NOTE),
   'complete synthetic PostgreSQL logical dump contains no authored words or editorial note');
  const update=spawnSync('docker',['exec',CONTAINER,'psql','-XAtq',
   '-v','ON_ERROR_STOP=1','-U','fictowner','-d','fictional_writer',
   '-c',`UPDATE writers_studio_r21_held_revisions SET state='fictional_held_only'
   WHERE work_id='${WORK}'`],{encoding:'utf8'});
  check(update.status!==0 && update.stderr.includes('r21_revision_immutable'),
   'even owner cannot update immutable historical ciphertext');
  receipt.negativeControls.push('DIRECT_SQL_UPDATE_REFUSED');
  const mutation=spawnSync('docker',['exec',CONTAINER,'psql','-XAtq',
   '-v','ON_ERROR_STOP=1','-U','fictowner','-d','fictional_writer',
   '-c',`DELETE FROM writers_studio_r21_held_revisions
   WHERE work_id='${WORK}'`],{encoding:'utf8'});
  check(mutation.status!==0 && mutation.stderr.includes('r21_revision_immutable'),
   'even owner cannot delete immutable historical ciphertext');
  receipt.negativeControls.push('DIRECT_SQL_DELETE_REFUSED');

  await close();close=undefined;
  docker(['kill','--signal=SIGKILL',CONTAINER]);docker(['start',CONTAINER]);
  let recovered=false;
  for(let i=0;i<60;i++){
   try{recovered=pg(`SELECT count(*) FROM writers_studio_r21_held_revisions
       WHERE work_id='${WORK}'`)==='3'; if(recovered)break;}catch{}
   await new Promise(res=>setTimeout(res,300));
  }
  check(recovered,'real PostgreSQL SIGKILL restart retains 3 encrypted revisions');
  // Fresh process read-back reuses persistence, not an in-memory mock.
  check(!pg(`SELECT envelope::text FROM writers_studio_r21_held_revisions
      WHERE work_id='${WORK}' LIMIT 1`).includes(SENTINEL),
      'encrypted revision remains ciphertext after physical restart');
  receipt.status='R21_ACTUAL_PG16_FICTIONAL_REVISION_SAVE_RETURN_PASS_RELEASE_HOLD';
 }catch(err){
  receipt.error=String((err as Error).message||err).slice(-450);
  process.exitCode=2;
 }finally{
  if(close){try{await close();}catch{}}
  if(created){
   try{docker(['rm','-f','-v',CONTAINER]);receipt.containerRemoved=true;}
   catch{receipt.error=(receipt.error||'')+' docker_cleanup_refused';process.exitCode=2;}
  }
  writeFileSync(EVIDENCE,JSON.stringify(receipt,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({status:receipt.status,checks:receipt.checks.length,
    negatives:receipt.negativeControls,containerRemoved:receipt.containerRemoved,
    error:receipt.error,realBeta:'HOLD'}));
  if(receipt.status!=='R21_ACTUAL_PG16_FICTIONAL_REVISION_SAVE_RETURN_PASS_RELEASE_HOLD'
    ||!receipt.containerRemoved)process.exitCode=2;
 }
})().catch(e=>{console.error('R21_FIXTURE_FATAL',String(e));process.exitCode=2});
