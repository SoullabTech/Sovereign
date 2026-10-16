/** R32 actual PG16 + file-vault encrypted first Source, fictional only. */
import {spawnSync} from 'node:child_process';
import {createHash,randomBytes,randomUUID,generateKeyPairSync,sign} from 'node:crypto';
import {existsSync,readFileSync,mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {canonicalDeletionPayload,type DeletionHighwaterV1} from '../../lib/writersStudio/recovery/deletionBarrierV1';

if(process.env.R32_ENCRYPTED_SOURCE_FIXTURE!=='fictional-only'||
 process.env.R32_SOURCE_PG16_FIXTURE!=='fictional-only')
 throw Error('R32_FICTIONAL_ONLY_OPT_IN_REQUIRED');
const P='ws-r32-source-'+randomUUID().slice(0,10);
const PORT='55432';
const ROOT=process.cwd();
const dir=mkdtempSync(join(tmpdir(),'ws-r32-source-fixture-'));
const vault=join(dir,'vault');mkdirSync(vault);
const EVIDENCE='/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R32_PG16_ENCRYPTED_SOURCE_20261016.json';
const MEMBER='11111111-1111-4111-8111-111111111111';
const FOREIGN='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-333333333333';
const FWORK='44444444-4444-4444-8444-444444444444';
const TEXT='R32 FICTIONAL EDITION IMPORTANT SECRET BOOK AUTHORIAL PARAGRAPH';
const FILENAME='R32_MY_SECRET_NAME.docx';
const ORIGINAL=Buffer.concat([Buffer.from('PK\u0003\u0004R32_Original_fictional_DOCX_only\u0000'),randomBytes(31)]);
const state={status:'HOLD' as string,checks:[] as string[],negativeControls:[] as string[],
 temporaryContainerRemoved:false,vaultFixtureRemoved:false,sourceHead:null as string|null,
 realWriting:false,realKms:false,prodTouched:false,error:null as string|null,
};
let started=false,close:undefined|(()=>Promise<void>);
const check=(v:unknown,s:string)=>{if(!v)throw Error('R32_CHECK_FAILED_'+s);state.checks.push(s)};
function command(argv:string[],allowFailure=false):{status:number|null;stdout:string;stderr:string}{
 const p=spawnSync('docker',argv,{encoding:'utf8',timeout:45000,maxBuffer:12*1024*1024});
 if((p.status!==0||p.error)&&!allowFailure)
  throw Error('R32_DOCKER_COMMAND_FAILED_'+argv[0]+'_'+String(p.stderr||p.error).slice(-190));
 return {status:p.status,stdout:p.stdout||'',stderr:p.stderr||''};
}
const pg=(sql:string)=>command(['exec',P,'psql','-XAtq','-v','ON_ERROR_STOP=1',
 '-U','fict','-d','r32_source','-c',sql]).stdout.trim();
async function refuse(p:Promise<unknown>,tag:string){
 try{await p;}catch{state.negativeControls.push(tag);return;}
 throw Error('R32_MISSING_REFUSAL_'+tag);
}
const as=(memberId:string)=>({memberId,assertedBy:'server_verified_member_session' as const});
async function ready(){
 for(let i=0;i<90;i++){
  const sql=command(['exec',P,'psql','-XAtq','-U','fict',
    '-d','r32_source','-c','SELECT 1'],true);
  const pid=command(['exec',P,'cat','/proc/1/comm'],true);
  if(sql.status===0 && sql.stdout.trim()==='1' &&
    pid.status===0 && pid.stdout.trim()==='postgres')return;
  await new Promise(resolve=>setTimeout(resolve,200));
 }
 throw Error('R32_STABLE_PG16_NOT_READY');
}
(async()=>{
 try{
  command(['run','--pull','never','-d','--name',P,
   '--network','bridge','-p','127.0.0.1:'+PORT+':5432',
   '-e','POSTGRES_HOST_AUTH_METHOD=trust','-e','POSTGRES_USER=fict',
   '-e','POSTGRES_DB=r32_source','postgres:16.13']);
  started=true;
  await ready();
  const v=pg('SHOW server_version_num');
  check(v.startsWith('160'),'physical PostgreSQL 16 stable');
  const ins=JSON.parse(command(['inspect',P]).stdout)[0];
  check(ins.HostConfig.PortBindings?.['5432/tcp']?.[0]?.HostIp==='127.0.0.1' &&
    ins.HostConfig.Binds===null,
    'PostgreSQL only Mac loopback, no host binds');
  pg(`CREATE TABLE members(id uuid PRIMARY KEY);
    CREATE TABLE member_manuscripts(id uuid PRIMARY KEY,
      member_id uuid NOT NULL REFERENCES members(id));
    INSERT INTO members VALUES ('${MEMBER}'),('${FOREIGN}');
    INSERT INTO member_manuscripts VALUES ('${WORK}','${MEMBER}'),
      ('${FWORK}','${FOREIGN}');`);
  const SQL=join(ROOT,'docs/ops/WS_R32_ENCRYPTED_SOURCE_REVIEW_ONLY.sql');
  command(['cp',SQL,P+':/tmp/r32_source.sql']);
  command(['exec',P,'psql','-XAtq','-v','ON_ERROR_STOP=1','-U','fict',
    '-d','r32_source','-f','/tmp/r32_source.sql']);
  check(pg('SELECT count(*) FROM writers_studio_r32_held_sources')==='0',
    'review-only metadata table empty before fictional import');

  process.env.DATABASE_URL='postgresql://fict@127.0.0.1:'+PORT+'/r32_source';
  process.env.FILE_STORAGE_PATH=vault;
  const storage=await import('../../lib/writersStudio/recovery/heldEncryptedSourceR32');
  const db=await import('../../lib/db/postgres');
  close=()=>db.closePool();
  check(storage.R32_REAL_SOURCE_IMPORT_ENABLED===false,'real source import disabled');

  const signing=generateKeyPairSync('ed25519');
  const key={keyId:randomUUID(),keyBytes:randomBytes(32)};
  const cp:DeletionHighwaterV1={protocol:'soullab.ws.deletion-highwater.v1',
    stream:'writers-studio-beta',generation:7,revokedWorks:[],revokedKeyIds:[]};
  const signed={checkpoint:cp,
    signature:sign(null,canonicalDeletionPayload(cp),signing.privateKey).toString('base64')};
  const custody={key,signed,signer:signing.publicKey,
    independent:{minimumGeneration:7}};
  const meta={originalFilename:FILENAME,format:'DOCX' as const,
    mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extractor:'r32-fictional-extractor',extractorVersion:'1.0'};
  const mine=await storage.importHeldEncryptedSourceR32({
    subject:as(MEMBER),workId:WORK,originalBytes:ORIGINAL,
    extractedSourceText:Buffer.from(TEXT),privateMetadata:meta,custody,
  });
  check(mine.memberId===MEMBER&&mine.workId===WORK,'owned encrypted Source manifest saved');
  const bin=readFileSync(join(vault,mine.cipherRef));
  check(createHash('sha256').update(bin).digest('hex')===mine.cipherDigest &&
   !bin.includes(Buffer.from(TEXT))&&!bin.includes(Buffer.from(FILENAME)) &&
   !bin.includes(ORIGINAL),
   'vault contains authenticated ciphertext without original bytes or filename');
  const recovered=await storage.reopenHeldEncryptedSourceR32({
    subject:as(MEMBER),workId:WORK,custody});
  check(recovered.originalBytes.equals(ORIGINAL)&&
    recovered.extractedSourceText.toString()===TEXT&&
    recovered.privateMetadata.originalFilename===FILENAME,
   'exact original bytes, extracted source and private provenance round trip');
  const dump=command(['exec',P,'pg_dump','-U','fict','-d','r32_source']).stdout;
  check(!dump.includes(TEXT)&&!dump.includes(FILENAME)&&
   !dump.includes('r32-fictional-extractor')&&
   !dump.includes(ORIGINAL.toString('utf8')),
   'whole synthetic PostgreSQL dump contains no author text, private filename or original');
  check(pg('SELECT count(*) FROM writers_studio_r32_held_sources')==='1',
   'SQL contains exactly one ciphertext-only Source manifest');
  await refuse(storage.importHeldEncryptedSourceR32({
    subject:as(MEMBER),workId:WORK,originalBytes:ORIGINAL,
    extractedSourceText:Buffer.from(TEXT),privateMetadata:meta,custody,
  }),'duplicate Work Source refused before new vault publication');
  check(pg('SELECT count(*) FROM writers_studio_r32_held_sources')==='1',
    'duplicate Source cannot create a second owner manuscript record');
  await refuse(storage.reopenHeldEncryptedSourceR32({
    subject:as(FOREIGN),workId:WORK,custody}),'cross-member Source read');
  await refuse(storage.importHeldEncryptedSourceR32({
    subject:as(FOREIGN),workId:WORK,originalBytes:ORIGINAL,
    extractedSourceText:Buffer.from(TEXT),privateMetadata:meta,custody,
  }),'cross-member Source import');
  await refuse(storage.reopenHeldEncryptedSourceR32({
    subject:as(MEMBER),workId:WORK,custody:{...custody,
      key:{keyId:key.keyId,keyBytes:randomBytes(32)}}}),'wrong same-ID encryption key');
  await refuse(storage.reopenHeldEncryptedSourceR32({
    subject:as(MEMBER),workId:WORK,custody:{...custody,
      independent:{minimumGeneration:8}}}),'stale deleted-work authority');
  const revoked:DeletionHighwaterV1={...cp,revokedWorks:[WORK]};
  const revokedSigned={checkpoint:revoked,
    signature:sign(null,canonicalDeletionPayload(revoked),signing.privateKey).toString('base64')};
  await refuse(storage.reopenHeldEncryptedSourceR32({
    subject:as(MEMBER),workId:WORK,custody:{...custody,signed:revokedSigned}}),
   'revoked Source Work');
  await refuse(storage.importHeldEncryptedSourceR32({
    subject:as(MEMBER),workId:WORK,originalBytes:Buffer.alloc(9*1024*1024,0x42),
    extractedSourceText:Buffer.from(TEXT),privateMetadata:meta,custody}),
    'large source refuses plaintext fallback');
  const sqlMutation=command(['exec',P,'psql','-XAtq','-v','ON_ERROR_STOP=1',
    '-U','fict','-d','r32_source','-c',
    `UPDATE writers_studio_r32_held_sources SET member_id='${FOREIGN}'
      WHERE id='${mine.id}'`],true);
  check(sqlMutation.status!==0,'immutable Source owner update refused by PostgreSQL');
  state.negativeControls.push('SQL owner change rejected');
  await close();close=undefined;
  command(['kill','--signal=SIGKILL',P]);command(['start',P]);
  await ready();
  check(pg(`SELECT count(*) FROM writers_studio_r32_held_sources
    WHERE work_id='${WORK}' AND cipher_digest='${mine.cipherDigest}'`)==='1',
    'database crash restart preserves exact encrypted Source manifest');
  check(existsSync(join(vault,mine.cipherRef)),
    'encrypted Source vault original exists after database restart');
  state.status='R32_PG16_ENCRYPTED_FICTIONAL_SOURCE_IMPORT_PASS_REAL_BETA_HOLD';
 }catch(e){
  state.error=String((e as Error)?.message||e).slice(0,250);
  process.exitCode=2;
 }finally{
  if(close){try{await close();}catch{}}
  if(started){
   const removed=command(['rm','-f','-v',P],true);
   state.temporaryContainerRemoved=removed.status===0;
  }
  rmSync(dir,{recursive:true,force:true});
  state.vaultFixtureRemoved=!existsSync(dir);
  const sourceHead=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'});
  state.sourceHead=sourceHead.status===0?sourceHead.stdout.trim():null;
  const fs=await import('node:fs');
  fs.writeFileSync(EVIDENCE,JSON.stringify(state,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({
    status:state.status,checks:state.checks.length,
    negatives:state.negativeControls,
    clean:state.temporaryContainerRemoved&&state.vaultFixtureRemoved,
    error:state.error,realRelease:'HOLD',
  }));
  if(state.status!=='R32_PG16_ENCRYPTED_FICTIONAL_SOURCE_IMPORT_PASS_REAL_BETA_HOLD'||
     !state.temporaryContainerRemoved||!state.vaultFixtureRemoved)process.exitCode=2;
 }
})();
