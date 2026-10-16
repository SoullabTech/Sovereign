/**
 * R23 isolated PostgreSQL 16 and immutable-vault ciphertext physical witness.
 * Fictional content and ephemeral key signer only; NEVER production migration.
 */
import { spawnSync } from 'node:child_process';
import { generateKeyPairSync, randomBytes, randomUUID, sign, createHash } from 'node:crypto';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { canonicalDeletionPayload, type DeletionHighwaterV1 } from '../../lib/writersStudio/recovery/deletionBarrierV1';

if (process.env.R23_FIXTURE !== 'fictional-only')
  throw Error('R23_EXACT_FICTIONAL_ONLY_OPT_IN_REQUIRED');

const MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const FOREIGN='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const WORK='4c0782ca-9074-43ee-9f3c-5f8500026780';
const name='ws-r23-pg16-'+randomUUID().slice(0,12);
const port='55421';
const root=mkdtempSync(join(tmpdir(),'ws-r23-pg16-history-'));
const sql='/Volumes/T7 Shield/ws-beta-r23-vault-history-20261016/docs/ops/WS_R23_VAULT_HISTORY_REVIEW_ONLY.sql';
const evidence='/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R23_PG16_VAULT_HISTORY_20261016.json';
const checks:string[]=[];
const negatives:string[]=[];
let started=false;
let close:undefined|(()=>Promise<void>);
let fail:string|null=null;
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex');
function cmd(args:string[],limit=40000):string {
  const r=spawnSync('docker',args,{encoding:'utf8',timeout:limit,maxBuffer:8*1024*1024});
  if(r.status!==0 || r.error) throw Error('R23_DOCKER_COMMAND_FAILED:'+String(r.stderr||r.error).slice(-180));
  return r.stdout.trim();
}
function ok(v:unknown,reason:string){if(!v)throw Error('R23_CHECK_FAILED:'+reason);checks.push(reason);}
function psql(q:string):string {
  return cmd(['exec','-i',name,'psql','-XAtq','-v','ON_ERROR_STOP=1','-U','soullab','-d','postgres','-c',q]);
}
function waitReady(){
  for(let i=0;i<90;i++){
    const r=spawnSync('docker',['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
      '-U','soullab','-d','postgres','-c','SELECT 1'],
      {encoding:'utf8',timeout:5000});
    if(r.status===0 && r.stdout.trim()==='1')return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,150);
  }
  throw Error('R23_PG16_NOT_READY');
}
function restoreAuth(generation=10,revokedWorks:string[]=[]){
  const signer=generateKeyPairSync('ed25519');
  const checkpoint:DeletionHighwaterV1={
    protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
    generation,revokedWorks,revokedKeyIds:[],
  };
  return {
    signedDeletion:{checkpoint,signature:sign(null,canonicalDeletionPayload(checkpoint),signer.privateKey).toString('base64')},
    trustedSigner:signer.publicKey,
    independent:{minimumGeneration:10},
  };
}
async function main(){
  mkdirSync(join(root,'vault'),{recursive:true});
  writeFileSync(join(root,'fictional.marker'),'R23_FICTIONAL_ONLY');
  cmd(['run','--pull','never','-d','--name',name,
    '--network','bridge','-e','POSTGRES_USER=soullab',
    '-e','POSTGRES_HOST_AUTH_METHOD=trust',
    '-p','127.0.0.1:'+port+':5432','postgres:16.13'],80000);
  started=true;waitReady();
  ok(cmd(['exec',name,'postgres','--version']).startsWith('postgres (PostgreSQL) 16.'),
    'disposable real PostgreSQL 16, loopback-only port');
  psql(`CREATE TABLE members(id uuid PRIMARY KEY);
    CREATE TABLE member_manuscripts(id uuid PRIMARY KEY, member_id uuid REFERENCES members(id));
    INSERT INTO members VALUES('${MEMBER}'),('${FOREIGN}');
    INSERT INTO member_manuscripts VALUES('${WORK}','${MEMBER}');`);
  cmd(['cp',sql,name+':/tmp/r23_review.sql']);
  cmd(['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
    '-U','soullab','-d','postgres','-f','/tmp/r23_review.sql']);
  ok(psql('SELECT count(*) FROM writers_studio_r23_held_history')==='0',
    'review-only encrypted manifest schema on empty fictional database');

  process.env.DATABASE_URL='postgresql://soullab@127.0.0.1:'+port+'/postgres';
  process.env.FILE_STORAGE_PATH=join(root,'vault');
  const store=await import('../../lib/writersStudio/recovery/heldVaultHistoryR23');
  const db=await import('../../lib/db/postgres');
  close=()=>db.closePool();
  const key={keyId:randomUUID(),keyBytes:randomBytes(32)};
  const deletion=restoreAuth();
  const authority={key,...deletion};
  const subject={memberId:MEMBER,assertedBy:'server_verified_member_session' as const};
  const records=[
    {field:'manuscript_working_drafts.content',recordId:randomUUID(),
      value:Buffer.from('R23 fiction: a tiny draft about imaginary stars.','utf8')},
    {field:'working_draft_revisions.content',recordId:randomUUID(),
      value:Buffer.from('R23 fictional previous line, only in AES-GCM.','utf8')},
    {field:'manuscript_keeps.verbatim_text',recordId:randomUUID(),
      value:Buffer.from('R23 invented quoted phrase, never in SQL.','utf8')},
  ];
  ok(store.R23_REAL_WRITER_HISTORY_ENABLED===false,'real member writer remains statically disabled');
  const first=await store.persistHeldHistoryR23({subject,manuscriptId:WORK,
    generation:1,records,authority});
  ok(first.previousSHA256===null && first.generation===1,
    'first immutable version has no previous hash');
  const saved=await store.persistHeldHistoryR23({subject,manuscriptId:WORK,
    generation:2,records,authority});
  ok(saved.previousSHA256===first.cipherSHA256,
    'second encrypted revision links exact previous vault ciphertext digest');
  ok(saved.manuscriptId===WORK && saved.memberId===MEMBER && saved.generation===2,
    'real repository transaction stores ciphertext manifest with owner and generation');
  const file=join(root,'vault',saved.cipherRef);
  const cipher=readFileSync(file);
  ok(sha(cipher)===saved.cipherSHA256 && !cipher.includes(records[0].value),
    'immutable vault contains SHA-verified ciphertext, not author prose');
  const restored=await store.readHeldHistoryR23({subject,manuscriptId:WORK,generation:2,authority});
  ok(restored.records.length===records.length &&
    restored.records.every((r,i)=>r.value.equals(records[i].value)),
    'cryptographically authenticated read restores exact synthetic current/history/keeps');
  const dump=cmd(['exec',name,'pg_dump','-Fp','-U','soullab','-d','postgres']);
  ok(records.every(r=>!dump.includes(r.value.toString('utf8'))),
    'complete disposable SQL dump excludes original fictional manuscript, history and keeps');
  let denied=false;
  try{await store.readHeldHistoryR23({subject:{...subject,memberId:FOREIGN},
    manuscriptId:WORK,generation:2,authority});}catch{denied=true;}
  ok(denied,'foreign member cannot read history');negatives.push('foreign_read');
  denied=false;
  try{await store.persistHeldHistoryR23({subject:{...subject,memberId:FOREIGN},
    manuscriptId:WORK,generation:3,records,authority});}catch{denied=true;}
  ok(denied,'foreign member cannot persist history');negatives.push('foreign_write');
  denied=false;
  try{await store.readHeldHistoryR23({subject,manuscriptId:WORK,generation:2,
    authority:{...authority,key:{keyId:key.keyId,keyBytes:randomBytes(32)}}});}catch{denied=true;}
  ok(denied,'wrong AES-256 key cannot open history');negatives.push('wrong_key');
  denied=false;
  try{await store.readHeldHistoryR23({subject,manuscriptId:WORK,generation:2,
    authority:{...authority,independent:{minimumGeneration:11}}});}catch{denied=true;}
  ok(denied,'stale external deletion highwater refuses');negatives.push('stale_antirollback');
  denied=false;
  try{await store.readHeldHistoryR23({subject,manuscriptId:WORK,generation:2,
    authority:{...authority,...restoreAuth(10,[WORK])}});}catch{denied=true;}
  ok(denied,'current signed deleted Work refuses restore');negatives.push('deleted_work');
  denied=false;
  try{await store.persistHeldHistoryR23({subject,manuscriptId:WORK,generation:2,records,authority});}
  catch{denied=true;}
  ok(denied,'duplicate immutable generation refuses');negatives.push('generation_replay');

  // A forged chain must fail even if SQL fields have valid-shaped hashes.
  const badSql="INSERT INTO writers_studio_r23_held_history "
    +"(id,member_id,manuscript_id,work_generation,key_id,cipher_ref,"
    +"cipher_sha256,previous_sha256,state) VALUES ('"
    +randomUUID()+"','"+MEMBER+"','"+WORK+"',4,'"+key.keyId
    +"','ws-beta-r23-held-history/"+randomUUID()+".enc','"
    +"a".repeat(64)+"','"+"b".repeat(64)+"','held_only')";
  const forged=spawnSync('docker',['exec',name,'psql','-XAtq',
    '-v','ON_ERROR_STOP=1','-U','soullab','-d','postgres','-c',badSql],
    {encoding:'utf8',timeout:30000});
  ok(forged.status!==0 &&
    forged.stderr.includes('r23_missing_or_changed_predecessor'),
    'forged direct SQL revision link refused');
  negatives.push('forged_predecessor');

  const racing=await Promise.allSettled([
    store.persistHeldHistoryR23({subject,manuscriptId:WORK,generation:3,records,authority}),
    store.persistHeldHistoryR23({subject,manuscriptId:WORK,generation:3,records,authority}),
  ]);
  ok(racing.filter(x=>x.status==='fulfilled').length===1 &&
    racing.filter(x=>x.status==='rejected').length===1,
    'concurrent same-generation saves produce exactly one committed version');
  negatives.push('concurrent_version_collision');
  // Failed writes may leave an encrypted orphan. Synthetic fixture cleanup
  // is not a production orphan-reconciliation strategy.

  const tampered=Buffer.from(cipher);
  tampered[Math.floor(tampered.length/2)]^=0x04;
  writeFileSync(file,tampered);
  denied=false;
  try{await store.readHeldHistoryR23({subject,manuscriptId:WORK,generation:2,authority});}
  catch{denied=true;}
  ok(denied,'ciphertext mutation refuses readback');negatives.push('cipher_tamper');
  writeFileSync(file,cipher);
  // SQL owner mutation triggers refuse independently of app code.
  const alter=spawnSync('docker',['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
    '-U','soullab','-d','postgres','-c',
    `UPDATE writers_studio_r23_held_history SET member_id='${FOREIGN}' WHERE manuscript_id='${WORK}';`],
    {stdio:'ignore',timeout:30000});
  ok(alter.status!==0,'SQL UPDATE trigger makes historical owner immutable');negatives.push('owner_mutation');

  await close(); close=undefined;
  cmd(['kill','--signal=SIGKILL',name]);
  cmd(['start',name]);
  waitReady();
  ok(psql(`SELECT count(*) FROM writers_studio_r23_held_history
      WHERE member_id='${MEMBER}' AND manuscript_id='${WORK}'
        AND cipher_sha256='${saved.cipherSHA256}'`)==='1',
    'physical PostgreSQL SIGKILL and restart preserves ownership + encrypted manifest');
  ok(existsSync(file) && sha(readFileSync(file))===saved.cipherSHA256,
    'encrypted files survive DB restart without mutation');
}
(async()=>{
 try{await main();}
 catch(e){fail=String((e as Error)?.message||e).slice(0,500);process.exitCode=2;}
 finally{
  if(close)await close().catch(()=>undefined);
  if(started){
    try{cmd(['rm','-fv',name],55000);started=false;}
    catch(e){fail=(fail||'')+'; cleanup_failed';process.exitCode=2;}
  }
  if(!started)rmSync(root,{recursive:true,force:true});
  const receipt={status:fail?'HOLD_PHYSICAL_FAIL':'R23_PG16_ENCRYPTED_HISTORY_FIXTURE_PASS_RELEASE_HELD',
    checks:checks.length,negatives,details:checks,postgresMajor:16,
    modelCalls:0,realMembers:0,realRuntimeEnabled:false,externalKeyCustodianInstalled:false,
    containerRemoved:!started,tempFilesRemoved:!existsSync(root),error:fail};
  writeFileSync(evidence,JSON.stringify(receipt,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({status:receipt.status,checks:checks.length,negatives,
    containerRemoved:receipt.containerRemoved,filesRemoved:receipt.tempFilesRemoved,error:fail,
    evidence},null,2));
 }
})();
