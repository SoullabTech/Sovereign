/**
 * R18 physical parity fixture: actual repo adapter against local disposable
 * PostgreSQL 16 Docker, loopback-only published test port, fictional bytes only.
 * NO remote, production, real members, provider, keys or SMTP.
 */
import { spawnSync } from 'node:child_process';
import { createHash, generateKeyPairSync, randomBytes, randomUUID, sign } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, renameSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sealPendingArrival } from '../../lib/writersStudio/recovery/pendingArrivalEnvelopeV1';
import { canonicalClaimedArrivalPayload, type ClaimedArrivalReceiptV1 }
  from '../../lib/writersStudio/recovery/pendingClaimTransferV1';
import { canonicalOriginalProvenanceV2, type OriginalProvenanceV2 }
  from '../../lib/writersStudio/recovery/originalProvenanceV2';
import { preparePairedOriginalV2, openPairedOriginalV2 }
  from '../../lib/writersStudio/recovery/pairedOriginalCustodyV2';
import { canonicalDeletionPayload, type DeletionHighwaterV1 }
  from '../../lib/writersStudio/recovery/deletionBarrierV1';

if(process.env.R18_PG16_FIXTURE!=='fictional-only')
  throw Error('R18_PG16_EXACT_FICTIONAL_ONLY_OPT_IN_REQUIRED');

const EVIDENCE='/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R18_DOCKER_PG16_ACTUAL_STORE_20261016.json';
const MIGRATION='/Volumes/T7 Shield/ws-beta-r16-storage-adapter-20261016/docs/ops/WS_R16_HELD_PAIRED_STORE_REVIEW_ONLY.sql';
const PORT='55418'; // Docker publishes loopback ONLY; no external interface.
const CONTAINER='ws-r18-pg16-'+randomUUID().slice(0,12);
const MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const FOREIGN='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const ARRIVAL='306902ed-21a9-4c01-aa15-984755598218';
const MANUSCRIPT='4c0782ca-9074-43ee-9f3c-5f8500026780';
const PLAIN='R16_FICTIONAL_SENTINEL_original_essay_DoNotPersistInDatabase';
const ORIGINAL_FILENAME='R16 private fictional source ✦.docx';
const RAW_TEXT=Buffer.from(PLAIN+'\r\nCompletely invented work.\0','utf8');
const RAW_BYTES=Buffer.from([0x50,0x4b,0x03,0x04,0x00,0xfd,0xf4,0xa1,0x4f,0x52]);
const MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const claimSigner=generateKeyPairSync('ed25519');
const sourceSigner=generateKeyPairSync('ed25519');
const eraseSigner=generateKeyPairSync('ed25519');
const hash=(s:Buffer|string)=>createHash('sha256').update(s).digest('hex');
const key=()=>({keyId:randomUUID(),keyBytes:randomBytes(32)});
const receipt={status:'HOLD' as string,scope:'REAL_REPO_POSTGRES_AND_DURABLE_FILEVAULT_APIS_FICTIONAL_ONLY',
  postgresVersion:'',checks:[] as string[],negativeControls:[] as string[],
  productionTouched:false,realMembersRead:false,modelCalls:0,
  realKeyCustodianInstalled:false,realWriterAdmission:'HOLD',
  temporaryClusterStopped:false,temporaryFilesRemoved:false,error:null as string|null};
let root:string|undefined,started=false,closeDatabase:undefined|(()=>Promise<void>);
function check(ok:unknown,msg:string):void{
  if(!ok)throw Error('R16_ACTUAL_ADAPTER_CHECK_FAILED:'+msg);
  receipt.checks.push(msg);
}
function shell(program:string,args:string[],timeout=55000):string{
  const p=spawnSync(program,args,{encoding:'utf8',timeout,cwd:'/private/tmp',
    maxBuffer:8*1024*1024});
  if(p.error||p.status!==0)throw Error('R16_NATIVE_SHELL_ERROR:'+program+':'+String(p.stderr||'').slice(-220));
  return (p.stdout||'').trim();
}
function shellFails(program:string,args:string[]):boolean{
  const p=spawnSync(program,args,{stdio:'ignore',timeout:30000,cwd:'/private/tmp'});
  return p.status!==0;
}
function pgArgs(sql?:string):string[]{
  const prefix=['exec','-i',CONTAINER];
  return [...prefix,'psql','-XAtq','-v','ON_ERROR_STOP=1','-U','soullab','-d','postgres',...(sql===undefined?[]:['-c',sql])];
}
function psql(q:string):string{return shell('docker',pgArgs(q));}
function psqlFail(q:string):boolean{return shellFails('docker',pgArgs(q));}
function waitReady():void{
  for(let i=0;i<100;i++){
    if(!shellFails('docker',['exec',CONTAINER,'pg_isready','-U','soullab','-d','postgres']))return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,200);
  }
  throw Error('R18_DOCKER_PG16_NOT_READY');
}
function start():void{
  root=mkdtempSync(join(tmpdir(),'ws-r18-pg16-actual-'));
  mkdirSync(join(root,'vault'));
  writeFileSync(join(root,'FICT_ONLY.marker'),'R18 exclusively fictional Source and SQL\n');
  // No --rm, because crash restart must reuse the same disposable container
  // filesystem; finally always removes ONLY this random per-run container.
  shell('docker',['run','--pull','never','-d','--name',CONTAINER,
      '-e','POSTGRES_HOST_AUTH_METHOD=trust','-e','POSTGRES_USER=soullab',
      '-p','127.0.0.1:'+PORT+':5432','postgres:16.13'],80000);
  started=true;waitReady();
  receipt.postgresVersion=shell('docker',['exec',CONTAINER,'postgres','--version']);
  check(receipt.postgresVersion.startsWith('postgres (PostgreSQL) 16.'),
    'Docker actual PostgreSQL 16 on loopback-only ephemeral test container');
}
function dump():string{
  return shell('docker',['exec',CONTAINER,'pg_dump','-Fp','--no-owner',
    '--no-privileges','-U','soullab','-d','postgres'],65000);
}
function installReviewOnlyMigration():void{
  shell('docker',['cp',MIGRATION,CONTAINER+':/tmp/r18_review_only.sql']);
  shell('docker',pgArgs().concat(['-f','/tmp/r18_review_only.sql']));
}

(async()=>{
 try {
  start();
  psql(`CREATE TABLE members(id uuid PRIMARY KEY);
    CREATE TABLE member_manuscripts(id uuid PRIMARY KEY,
      member_id uuid NOT NULL REFERENCES members(id));
    CREATE TABLE manuscript_source_arrivals(id uuid PRIMARY KEY,
      member_id uuid NOT NULL REFERENCES members(id),
      manuscript_id uuid REFERENCES member_manuscripts(id));
    INSERT INTO members VALUES('${MEMBER}'),('${FOREIGN}');
    INSERT INTO member_manuscripts VALUES('${MANUSCRIPT}','${MEMBER}');
    INSERT INTO manuscript_source_arrivals VALUES('${ARRIVAL}','${MEMBER}','${MANUSCRIPT}');`);
  installReviewOnlyMigration();
  check(psql(`SELECT count(*) FROM writers_studio_r16_held_pairs`)==='0',
    'review-only R16 schema applied only to fresh empty fictional database');
  // A negative control proves the full SQL dump scanner detects a plaintext
  // manuscript sentinel in ANY table, not just the new R16 pair table.
  psql(`CREATE TABLE r16_intentional_plaintext_negative_control(value text);
    INSERT INTO r16_intentional_plaintext_negative_control VALUES
      ('${PLAIN}');`);
  check(dump().includes(PLAIN),
    'negative control: full PostgreSQL logical dump detects deliberately inserted plaintext');
  psql('DROP TABLE r16_intentional_plaintext_negative_control;');
  receipt.negativeControls.push('DETECTOR_POSITIVE_CONTROL_FOR_PLAINTEXT_SQL');
  check(!dump().includes(PLAIN),
    'after removing negative-control table full SQL dump excludes fictional text sentinel');

  const pendingKey=key(),workKey=key();
  const pendingAuthority={memberId:MEMBER,arrivalId:ARRIVAL,generation:4};
  const pendingCipher=sealPendingArrival(pendingAuthority,{
    kind:'artifact_extraction',sourceText:RAW_TEXT,originalBytes:RAW_BYTES,
    originalFilename:ORIGINAL_FILENAME,mimeType:MIME,
  },pendingKey);
  const claim:ClaimedArrivalReceiptV1={
    protocol:'soullab.ws.pending-claim-transfer.v1',status:'claim_committed',
    claimId:randomUUID(),memberId:MEMBER,arrivalId:ARRIVAL,
    manuscriptId:MANUSCRIPT,pendingGeneration:4,manuscriptGeneration:5,
    claimEpoch:12,sourceKind:'artifact_extraction',
    sourceTextDigest:hash(RAW_TEXT),originalDigest:hash(RAW_BYTES),
  };
  const signedClaim={claim,signature:sign(null,
    canonicalClaimedArrivalPayload(claim),claimSigner.privateKey).toString('base64')};
  const provenance:OriginalProvenanceV2={
    protocol:'soullab.ws.original-provenance.v2',
    claimId:claim.claimId,memberId:MEMBER,arrivalId:ARRIVAL,
    manuscriptId:MANUSCRIPT,receiptEpoch:13,
    sourceKind:'artifact_extraction',
    sourceTextSha256:hash(RAW_TEXT),sourceTextBytes:RAW_TEXT.length,
    originalSha256:hash(RAW_BYTES),originalByteLength:RAW_BYTES.length,
    originalFilename:ORIGINAL_FILENAME,mimeType:MIME,
    extractionMethod:'R16-fictional-parser',extractorVersion:'test-v1',
  };
  const signedProvenance={provenance,signature:sign(null,
    canonicalOriginalProvenanceV2(provenance),sourceSigner.privateKey).toString('base64')};
  const prepared=preparePairedOriginalV2({
    pendingAuthority,pendingEnvelope:pendingCipher,
    pendingKey,workKey,signedClaim,trustedClaimSigner:claimSigner.publicKey,
    independentClaimMinimumEpoch:12,
    signedProvenance,trustedProvenanceSigner:sourceSigner.publicKey,
    independentProvenanceMinimumEpoch:13,
  });
  const highwater:DeletionHighwaterV1={
    protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
    generation:20,revokedWorks:[],revokedKeyIds:[],
  };
  const signedHighwater={checkpoint:highwater,
    signature:sign(null,canonicalDeletionPayload(highwater),eraseSigner.privateKey)
     .toString('base64')};
  const authorities={
    signedClaim,claimSigner:claimSigner.publicKey,minimumClaimEpoch:12,
    provenanceSigner:sourceSigner.publicKey,minimumProvenanceEpoch:13,
    deletionHighwater:signedHighwater,deletionSigner:eraseSigner.publicKey,
    independentDeletionGeneration:{minimumGeneration:20},
  };
  const subject={memberId:MEMBER,assertedBy:'server_verified_member_session' as const};
  // Configuration happens BEFORE importing the real DB and vault services.
  process.env.DATABASE_URL='postgresql://soullab@127.0.0.1:'+PORT+'/postgres';
  process.env.FILE_STORAGE_PATH=join(root!,'vault');
  const actual=await import('../../lib/writersStudio/recovery/heldPairedStoreR16');
  const db=await import('../../lib/db/postgres');
  closeDatabase=()=>db.closePool();
  check(actual.R16_REAL_MEMBER_PAIRED_STORAGE_ENABLED===false,
    'no real member author writing feature activation');
  const stored=await actual.persistHeldPairedCandidateR16({
    subject,prepared,pendingKeyId:pendingKey.keyId,workKey,authorities,
  });
  check(stored.memberId===MEMBER && stored.manuscriptId===MANUSCRIPT &&
    stored.claimId===claim.claimId,
    'ACTUAL repository adapter committed a same-member encrypted pair manifest');
  check(psql(`SELECT count(*) FROM writers_studio_r16_held_pairs WHERE
    claim_id='${claim.claimId}' AND member_id='${MEMBER}'`)==='1',
    'manifest exists in real temporary PostgreSQL after actual repository transaction');
  check(stored.workRef!==stored.provenanceRef &&
    stored.workRef.startsWith(actual.R16_PAIRED_STORAGE_NAMESPACE+'/') &&
    stored.provenanceRef.startsWith(actual.R16_PAIRED_STORAGE_NAMESPACE+'/'),
    'two distinct immutable encrypted vault references recorded');
  const workFile=join(root!,'vault',stored.workRef);
  const provFile=join(root!,'vault',stored.provenanceRef);
  check(existsSync(workFile)&&existsSync(provFile),
    'ACTUAL durable fileVault persisted both encrypted files');
  check(hash(readFileSync(workFile))===stored.workDigest &&
    hash(readFileSync(provFile))===stored.provenanceDigest,
    'both immutable ciphertext files pass independent byte-for-byte hash readback');
  check(!readFileSync(workFile).includes(RAW_TEXT) &&
    !readFileSync(provFile).includes(Buffer.from(ORIGINAL_FILENAME)),
    'no manuscript words or private original filename in raw encrypted filesystem');

  const opened=await actual.readHeldPairedCiphertextsR16(subject,stored.claimId);
  check(opened.manifest.pairDigest===stored.pairDigest &&
    opened.package.pairDigest===prepared.package.pairDigest,
    'ACTUAL owner-scoped repository read path returns identical encrypted pair');
  const recovered=openPairedOriginalV2({
    package:opened.package,workKey,signedClaim,
    trustedClaimSigner:claimSigner.publicKey,independentClaimMinimumEpoch:12,
    trustedProvenanceSigner:sourceSigner.publicKey,independentProvenanceMinimumEpoch:13,
    signedDeletionHighwater:signedHighwater,trustedDeletionSigner:eraseSigner.publicKey,
    independentDeletionGeneration:{minimumGeneration:20},
  });
  check(recovered.sourceText.equals(RAW_TEXT) &&
    recovered.originalBytes?.equals(RAW_BYTES) &&
    recovered.provenance.originalFilename===ORIGINAL_FILENAME,
    'actual persisted pair restores exact fictional Source and original filename');

  let crossMemberRefused=false;
  try {await actual.readHeldPairedCiphertextsR16({
    memberId:FOREIGN,assertedBy:'server_verified_member_session',
  },stored.claimId);}
  catch(e){crossMemberRefused=(e as {code?:string}).code==='r16_scoped_pair_not_found';}
  check(crossMemberRefused,
    'foreign member cannot read encrypted pair through actual Postgres adapter');
  receipt.negativeControls.push('FOREIGN_MEMBER_CIPHERTEXT_READ_REFUSED');

  let wrongSessionRefused=false;
  try {await actual.persistHeldPairedCandidateR16({
    subject:{memberId:FOREIGN,assertedBy:'server_verified_member_session'},
    prepared,pendingKeyId:pendingKey.keyId,workKey,authorities,
  });}
  catch(e){wrongSessionRefused=(e as {code?:string}).code==='r16_owner_or_source_journal_refused';}
  check(wrongSessionRefused,'foreign session cannot persist another member Source pair');
  receipt.negativeControls.push('FOREIGN_MEMBER_PERSIST_REFUSED');

  let invalidDirectMutation=false;
  try{
    invalidDirectMutation=psqlFail(`UPDATE writers_studio_r16_held_pairs
      SET member_id='${FOREIGN}' WHERE claim_id='${claim.claimId}'`);
  }catch {invalidDirectMutation=true;}
  check(invalidDirectMutation,
    'PostgreSQL trigger rejects direct mutation to foreign member after custody insertion');
  receipt.negativeControls.push('DIRECT_SQL_OWNER_MUTATION_REFUSED');

  const sqlDump=dump();
  check(!sqlDump.includes(PLAIN) &&
    !sqlDump.includes(ORIGINAL_FILENAME) &&
    !sqlDump.includes('R16-fictional-parser'),
    'complete isolated logical PostgreSQL dump contains no fictional manuscript or provenance text');
  check(!readFileSync(workFile).includes(Buffer.from(PLAIN)) &&
    !readFileSync(provFile).includes(Buffer.from(PLAIN)),
    'neither encrypted vault object contains plaintext sentinel');

  // Test a missing provenance half, then restore exactly; this is fictional
  // only and does not claim key retirement or permanent data destruction.
  renameSync(provFile,provFile+'.fixture-held');
  let missingPairRefused=false;
  try {await actual.readHeldPairedCiphertextsR16(subject,stored.claimId);}
  catch {missingPairRefused=true;}
  check(missingPairRefused,'missing provenance file refuses a partial Work read');
  receipt.negativeControls.push('MISSING_ENCRYPTED_PROVENANCE_REFUSED');
  renameSync(provFile+'.fixture-held',provFile);
  check((await actual.readHeldPairedCiphertextsR16(subject,stored.claimId))
    .package.pairDigest===stored.pairDigest,'replaced original encrypted provenance requalifies exact pair');

  // Stop real shared Pool before a hard PostgreSQL process restart.
  await closeDatabase();closeDatabase=undefined;
  // Power-loss analogue: kill database PID 1, then restart the same
  // disposable writable layer without changing its Source ciphertexts.
  shell('docker',['kill','--signal=SIGKILL',CONTAINER],65000);
  shell('docker',['start',CONTAINER],65000);
  waitReady();
  check(psql(`SELECT count(*) FROM writers_studio_r16_held_pairs
    WHERE claim_id='${claim.claimId}' AND pair_digest='${stored.pairDigest}'`)==='1',
    'after PostgreSQL restart both Work+provenance digests and owner persist');
  check(existsSync(workFile)&&existsSync(provFile) &&
    hash(readFileSync(workFile))===stored.workDigest &&
    hash(readFileSync(provFile))===stored.provenanceDigest,
    'encrypted vault files survive database restart with exact hashes');

  // Even with a DB row and two physical ciphertexts, this is NOT a completed
  // retirement. No independence, offsite backup, real session or UI asserted.
  receipt.status='R18_PG16_REAL_REPOSITORY_ADAPTER_FICTIONAL_PASS_REAL_RELEASE_HELD';
 }catch(e){
  receipt.status='R18_PG16_ACTUAL_STORE_FIXTURE_HOLD';
  receipt.error=String((e as Error)?.message||e).slice(0,520);
  process.exitCode=2;
 }finally{
  if(closeDatabase){
    try{await closeDatabase();}catch{receipt.error=(receipt.error||'')+' db_pool_close_failure';}
  }
  if(root&&started){
    try{shell('docker',['rm','-f',CONTAINER],60000); started=false;}
    catch{receipt.error=(receipt.error||'')+' docker_pg16_remove_failure';process.exitCode=2;}
  }
  receipt.temporaryClusterStopped=!started;
  if(root&&!started&&existsSync(join(root,'FICT_ONLY.marker'))){
    try{rmSync(root,{recursive:true,force:true});}
    catch{receipt.error=(receipt.error||'')+' temp_cleanup_failure';process.exitCode=2;}
  }
  receipt.temporaryFilesRemoved=Boolean(root&&!existsSync(root));
  if(!receipt.temporaryClusterStopped||!receipt.temporaryFilesRemoved)process.exitCode=2;
  writeFileSync(EVIDENCE,JSON.stringify(receipt,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({status:receipt.status,
    checks:receipt.checks.length,negativeControls:receipt.negativeControls,
    clusterStopped:receipt.temporaryClusterStopped,filesCleaned:receipt.temporaryFilesRemoved,
    release:'HOLD',realIndependentKeys:'NOT_INSTALLED',
    evidence:EVIDENCE,error:receipt.error},null,2));
 }
})().catch(e=>{console.error('R18_SCRIPT_ERROR',String(e));process.exitCode=2;});
