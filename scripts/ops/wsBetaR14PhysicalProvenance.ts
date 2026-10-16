/**
 * R14 opt-in PHYSICAL paired Source/provenance recovery rehearsal, fictional only.
 * Fresh networkless PostgreSQL and disposable original/Work volumes. No live
 * data, independent key store, member accounts, API provider or production.
 */
import {spawnSync} from 'node:child_process';
import {createHash,generateKeyPairSync,randomBytes,randomUUID,sign} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {sealPendingArrival,type PendingSourceV1} from '../../lib/writersStudio/recovery/pendingArrivalEnvelopeV1';
import {canonicalClaimedArrivalPayload,type ClaimedArrivalReceiptV1}
  from '../../lib/writersStudio/recovery/pendingClaimTransferV1';
import {canonicalOriginalProvenanceV2,sha256Exact,type OriginalProvenanceV2}
  from '../../lib/writersStudio/recovery/originalProvenanceV2';
import {preparePairedOriginalV2,openPairedOriginalV2,type PairedOriginalPackageV2}
  from '../../lib/writersStudio/recovery/pairedOriginalCustodyV2';
import {canonicalDeletionPayload,type DeletionHighwaterV1}
  from '../../lib/writersStudio/recovery/deletionBarrierV1';

if (process.env.R14_PHYSICAL_FIXTURE !== 'fictional-only')
  throw Error('R14_REQUIRES_EXACT_FICTIONAL_ONLY_OPT_IN');

const PG='ws-r14-fictional-provenance-pg-20261016';
const DB='ws-r14-fictional-pgdata-20261016';
const PENDING='ws-r14-fictional-pending-vault-20261016';
const WORK='ws-r14-fictional-work-vault-20261016';
const IMAGE='pgvector/pgvector:pg16';
const REPORT='/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R14_PHYSICAL_PROVENANCE_20261016.json';
const memberId='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const foreignId='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const arrivalId='306902ed-21a9-4c01-aa15-984755598218';
const manuscriptId='4c0782ca-9074-43ee-9f3c-5f8500026780';
const claimId='d3a75cd8-40cc-4fe2-a15e-437ce4ca2c58';
const docText=Buffer.from('Fictional orchard: an original passage\r\nend.\0','utf8');
const docOriginal=Buffer.from([0x50,0x4b,0x03,0x04,0,255,3,1,6,0,11]);
const docName='Original Test — édition spéciale ✦.docx';
const docMime='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const extractor='fictional-mammoth-parser';
const extractorVersion='fixture-only-1.0';
const claims=generateKeyPairSync('ed25519');
const provenanceSigner=generateKeyPairSync('ed25519');
const deletionSigner=generateKeyPairSync('ed25519');
const dummyKey=()=>({keyId:randomUUID(),keyBytes:randomBytes(32)});
const report={
  status:'HOLD' as string,scope:'ONLY_DISPOSABLE_NETWORKLESS_PG_VOLUMES_AND_FICTIONAL_PROVENANCE',
  checks:[] as string[],negativeControls:[] as string[],
  realMemberDataRead:false,productionChanged:false,publicGatewayChanged:false,
  providerCalls:0,independentKeyAuthorityInstalled:false,memberEnrollmentEnabled:false,
  resourcesCleaned:false,limitations:[
   'No real original/Work key custodian or independently nonrollbackable highwater exists',
   'Not an actual Writer Studio backup job; only fictional DB and filesystem fixture',
   'Original and Work files are retained; no key destruction or erasure attempted',
  ],error:null as string|null,
};
const volumes:string[]=[];
let created=false;
function verify(check:unknown,label:string) {
  if(!check)throw Error('R14_PHYSICAL_ASSERTION_FAILED: '+label);
  report.checks.push(label);
}
function docker(args:string[],input?:Buffer,timeout=45000):Buffer {
  const p=spawnSync('docker',args,{input,encoding:null,timeout,maxBuffer:16*1024*1024});
  if(p.error||p.status!==0)
    throw Error('R14_FIXTURE_DOCKER_ERROR:'+args[0]+':'+String(p.stderr||'').slice(-200));
  return Buffer.isBuffer(p.stdout)?p.stdout:Buffer.from(p.stdout||'');
}
function exists(kind:'container'|'volume',name:string):boolean {
  return spawnSync('docker',[kind,'inspect',name],{stdio:'ignore',timeout:10000}).status===0;
}
function sql(query:string):string {
  return docker(['exec',PG,'psql','-XAtq','-v','ON_ERROR_STOP=1',
   '-U','postgres','-d','postgres','-c',query]).toString('utf8').trim();
}
function quote(s:string):string{return "'"+s.replaceAll("'","''")+"'";}
function sha(x:Buffer|string):string{return createHash('sha256').update(x).digest('hex');}
function writeFile(volume:'pending'|'work',file:string,bytes:Buffer):void {
  docker(['exec','-i',PG,'sh','-c','cat > /'+volume+'/'+file],bytes);
}
function readFile(volume:'pending'|'work',file:string):Buffer {
  return docker(['exec',PG,'cat','/'+volume+'/'+file]);
}
function absentFile(volume:'pending'|'work',file:string):boolean{
  return spawnSync('docker',['exec',PG,'test','-f','/'+volume+'/'+file],
    {stdio:'ignore',timeout:8000}).status!==0;
}
function rebootAndReady():void {
  docker(['restart',PG],undefined,65000);
  for(let i=0;i<90;i++){
    if(spawnSync('docker',['exec',PG,'pg_isready','-U','postgres','-d','postgres'],
      {stdio:'ignore',timeout:10000}).status===0)return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,160);
  }
  throw Error('R14_FICTIONAL_DB_RESTART_FAILED');
}
function start():void {
  verify(!exists('container',PG),'refuse pre-existing named synthetic container');
  for(const v of [DB,PENDING,WORK]){
    verify(!exists('volume',v),'refuse pre-existing named synthetic volume');
    docker(['volume','create','--label','life.soullab.scope=r14-fictional',v]);volumes.push(v);
  }
  docker(['run','-d','--name',PG,'--network','none','--memory','820m','--cpus','1',
    '--pids-limit','128','--security-opt','no-new-privileges',
    '-v',DB+':/var/lib/postgresql/data','-v',PENDING+':/pending','-v',WORK+':/work',
    '--tmpfs','/tmp:rw,nosuid,size=64m','-e','POSTGRES_HOST_AUTH_METHOD=trust',
    '--label','life.soullab.scope=r14-fictional',IMAGE],undefined,60000);created=true;
  for(let i=0;i<90;i++){
    if(spawnSync('docker',['exec',PG,'pg_isready','-U','postgres','-d','postgres'],
      {stdio:'ignore',timeout:10000}).status===0)break;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,150);
  }
  const config=JSON.parse(docker(['inspect',PG]).toString('utf8'))[0];
  verify(config.HostConfig.NetworkMode==='none','fictional PostgreSQL has no network');
  verify(Object.keys(config.HostConfig.PortBindings||{}).length===0,'fictional PostgreSQL exposes no host ports');
  verify(config.Mounts.length===3 && config.Mounts.every((m:{Name:string})=>
   [DB,PENDING,WORK].includes(m.Name)),'only three dedicated fictional volumes mounted');
}

try {
  start();
  const sample:PendingSourceV1={kind:'artifact_extraction',
    sourceText:docText,originalBytes:docOriginal,
    originalFilename:docName,mimeType:docMime};
  const pendingAuthority={memberId,arrivalId,generation:4};
  const pendingKey=dummyKey(),workKey=dummyKey();
  const arrivalEnvelope=sealPendingArrival(pendingAuthority,sample,pendingKey);
  const pendingRaw=Buffer.from(JSON.stringify(arrivalEnvelope),'utf8');
  writeFile('pending',arrivalId+'.pending',pendingRaw);
  verify(readFile('pending',arrivalId+'.pending').equals(pendingRaw),
    'private pending original stored and reread as encrypted Source bytes');
  verify(!pendingRaw.includes(Buffer.from(docName))&&!pendingRaw.includes(docText),
    'no original filename or manuscript prose in pending encrypted Source file');

  sql(`CREATE TABLE beta_members(id uuid PRIMARY KEY);
  CREATE TABLE member_manuscripts(id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES beta_members(id));
  CREATE TABLE manuscript_source_arrivals(
   id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES beta_members(id),
   manuscript_id uuid REFERENCES member_manuscripts(id),
   source_kind text NOT NULL,source_text_hash text NOT NULL,artifact_hash text,
   artifact_size bigint,original_filename text,mime_type text,
   extraction_method text,extractor_version text);
  CREATE TABLE r14_paired_original_manifest (
   claim_id uuid PRIMARY KEY,member_id uuid NOT NULL,arrival_id uuid NOT NULL,
   manuscript_id uuid NOT NULL,work_digest text NOT NULL,
   provenance_digest text NOT NULL,pair_digest text NOT NULL,
   state text NOT NULL CHECK(state='PREPARED_ONLY_NOT_PERSISTED'));
  INSERT INTO beta_members VALUES('${memberId}'),('${foreignId}');
  INSERT INTO member_manuscripts VALUES('${manuscriptId}','${memberId}');
  INSERT INTO manuscript_source_arrivals(id,member_id,source_kind,
   source_text_hash,artifact_hash,artifact_size,original_filename,mime_type,
   extraction_method,extractor_version)
   VALUES('${arrivalId}','${memberId}','artifact_extraction',
   '${sha(docText)}','${sha(docOriginal)}',${docOriginal.length},
   ${quote(docName)},${quote(docMime)},${quote(extractor)},${quote(extractorVersion)});`);
  verify(sql(`SELECT count(*) FROM manuscript_source_arrivals WHERE id='${arrivalId}'
    AND member_id='${foreignId}'`)==='0','wrong fictional member cannot access pending original row');

  const claimTx=sql(`BEGIN;
  WITH own AS (SELECT id FROM member_manuscripts
     WHERE id='${manuscriptId}' AND member_id='${memberId}' FOR UPDATE),
  moved AS (UPDATE manuscript_source_arrivals SET manuscript_id=(SELECT id FROM own)
     WHERE id='${arrivalId}' AND member_id='${memberId}' AND manuscript_id IS NULL
       AND EXISTS(SELECT 1 FROM own) RETURNING id)
  SELECT count(*) FROM moved;
  COMMIT;`);
  verify(claimTx.includes('1'),'owner-checked pending arrival attached in committed SQL transaction');
  const observed=JSON.parse(sql(`SELECT row_to_json(x)::text FROM (
    SELECT a.id,a.member_id,a.manuscript_id,a.source_kind,a.source_text_hash,
       a.artifact_hash,a.artifact_size,a.original_filename,a.mime_type,
       a.extraction_method,a.extractor_version
    FROM manuscript_source_arrivals a
      JOIN member_manuscripts m ON m.id=a.manuscript_id AND m.member_id=a.member_id
    WHERE a.id='${arrivalId}' AND a.member_id='${memberId}'
  ) x`)) as Record<string,unknown>;
  verify(observed.member_id===memberId&&observed.manuscript_id===manuscriptId,
    'metadata issuer confirms source and target identity from committed owner join');
  verify(observed.original_filename===docName&&observed.mime_type===docMime,
    'metadata issuer reads exact original filename and MIME from committed Source row');
  verify(observed.source_text_hash===sha(docText) &&
    observed.artifact_hash===sha(docOriginal) &&
    Number(observed.artifact_size)===docOriginal.length,
    'metadata issuer matches PostgreSQL Source hashes and length to decrypted fictional bytes');

  const claim:ClaimedArrivalReceiptV1={
    protocol:'soullab.ws.pending-claim-transfer.v1',status:'claim_committed',
    claimId,memberId,arrivalId,manuscriptId,pendingGeneration:4,
    manuscriptGeneration:5,claimEpoch:12,sourceKind:'artifact_extraction',
    sourceTextDigest:String(observed.source_text_hash),
    originalDigest:String(observed.artifact_hash),
  };
  const signedClaim={claim,signature:sign(null,canonicalClaimedArrivalPayload(claim),
    claims.privateKey).toString('base64')};
  const meta:OriginalProvenanceV2={
    protocol:'soullab.ws.original-provenance.v2',
    claimId,memberId,arrivalId,manuscriptId,receiptEpoch:13,
    sourceKind:'artifact_extraction',
    sourceTextSha256:String(observed.source_text_hash),
    sourceTextBytes:docText.length,
    originalSha256:String(observed.artifact_hash),
    originalByteLength:Number(observed.artifact_size),
    originalFilename:String(observed.original_filename),
    mimeType:String(observed.mime_type),
    extractionMethod:String(observed.extraction_method),
    extractorVersion:String(observed.extractor_version),
  };
  const signedProvenance={provenance:meta,signature:sign(null,
    canonicalOriginalProvenanceV2(meta),provenanceSigner.privateKey).toString('base64')};
  const prepared=preparePairedOriginalV2({
    pendingAuthority,pendingEnvelope:arrivalEnvelope,pendingKey,workKey,
    signedClaim,trustedClaimSigner:claims.publicKey,independentClaimMinimumEpoch:12,
    signedProvenance,trustedProvenanceSigner:provenanceSigner.publicKey,
    independentProvenanceMinimumEpoch:13,
  });
  verify(prepared.transitionStatus==='PREPARED_ONLY_NOT_PERSISTED' &&
    prepared.pendingKeyRetirement==='NOT_WITNESSED' &&
    prepared.pendingFileErasure==='NOT_WITNESSED',
    'R14 paired package preparation cannot claim key retirement or Source deletion');
  verify(prepared.sourceAndWorkBackupCensus==='NOT_CERTIFIED',
    'full SQL/Source/replica backup census remains explicitly unqualified');
  const combined=prepared.package;
  const workRaw=Buffer.from(JSON.stringify(combined.work),'utf8');
  const provRaw=Buffer.from(JSON.stringify(combined.provenance),'utf8');
  writeFile('work',manuscriptId+'.work',workRaw);
  writeFile('work',manuscriptId+'.provenance',provRaw);
  verify(!workRaw.includes(docText)&&!provRaw.includes(Buffer.from(docName))&&
    !provRaw.includes(Buffer.from(extractor)),
    'encrypted Work and provenance volumes do not reveal original content or filename in raw files');
  verify(sha(readFile('work',manuscriptId+'.work'))===combined.workDigest &&
    sha(readFile('work',manuscriptId+'.provenance'))===combined.provenanceDigest,
    'both encrypted halves separately persisted and byte-for-byte verified');
  sql(`INSERT INTO r14_paired_original_manifest
    (claim_id,member_id,arrival_id,manuscript_id,work_digest,
     provenance_digest,pair_digest,state)
    VALUES('${claimId}','${memberId}','${arrivalId}','${manuscriptId}',
     '${combined.workDigest}','${combined.provenanceDigest}','${combined.pairDigest}',
     'PREPARED_ONLY_NOT_PERSISTED')`);
  verify(sql(`SELECT count(*) FROM r14_paired_original_manifest WHERE
    claim_id='${claimId}' AND member_id='${memberId}' AND pair_digest='${combined.pairDigest}'
    AND state='PREPARED_ONLY_NOT_PERSISTED'`)==='1',
    'SQL manifest references both exact encrypted Source and provenance halves');
  rebootAndReady();
  verify(sql(`SELECT count(*) FROM r14_paired_original_manifest
    WHERE claim_id='${claimId}' AND pair_digest='${combined.pairDigest}'`)==='1',
    'full paired manifest survives real PostgreSQL restart');

  function reloadPackage():PairedOriginalPackageV2 {
    const rows=sql(`SELECT work_digest||'|'||provenance_digest||'|'||pair_digest
      FROM r14_paired_original_manifest WHERE claim_id='${claimId}'`).split('|');
    const encryptedWork=readFile('work',manuscriptId+'.work');
    const encryptedProvenance=readFile('work',manuscriptId+'.provenance');
    if (sha(encryptedWork)!==rows[0] || sha(encryptedProvenance)!==rows[1] ||
        rows[2]!==combined.pairDigest)throw Error('R14_PAIRED_STORAGE_DIGEST_MISMATCH');
    return {protocol:'soullab.ws.paired-original.v2',
      work:JSON.parse(encryptedWork.toString('utf8')),
      provenance:JSON.parse(encryptedProvenance.toString('utf8')),
      workDigest:rows[0],provenanceDigest:rows[1],pairDigest:rows[2]};
  }
  const restoredPackage=reloadPackage();
  verify(restoredPackage.pairDigest===combined.pairDigest,
    'independent process can reconstruct complete paired object after restart');
  const checkpoint:DeletionHighwaterV1={
    protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
    generation:20,revokedWorks:[],revokedKeyIds:[],
  };
  const signedHighwater=(w:DeletionHighwaterV1)=>({
    checkpoint:w,signature:sign(null,canonicalDeletionPayload(w),deletionSigner.privateKey).toString('base64'),
  });
  function recover(p:PairedOriginalPackageV2,w=checkpoint,overrides:Record<string,unknown>={}) {
    return openPairedOriginalV2({
      package:p,workKey,signedClaim,trustedClaimSigner:claims.publicKey,
      independentClaimMinimumEpoch:12,trustedProvenanceSigner:provenanceSigner.publicKey,
      independentProvenanceMinimumEpoch:13,
      signedDeletionHighwater:signedHighwater(w),
      trustedDeletionSigner:deletionSigner.publicKey,
      independentDeletionGeneration:{minimumGeneration:20},
      ...overrides,
    });
  }
  const readback=recover(restoredPackage);
  verify(readback.sourceText.equals(docText)&&readback.originalBytes?.equals(docOriginal),
    'separately stored encrypted pair restores exact fictional source bytes and extracted text');
  verify(readback.provenance.originalFilename===docName &&
    readback.provenance.mimeType===docMime &&
    readback.provenance.extractionMethod===extractor &&
    readback.provenance.extractorVersion===extractorVersion,
    'recovered original filename MIME extraction provenance all match committed SQL source');

  const missingPath='/work/'+manuscriptId+'.provenance';
  docker(['exec',PG,'mv',missingPath,missingPath+'.held']);
  verify(absentFile('work',manuscriptId+'.provenance'),
    'lost provenance half is detectable and cannot be mistaken for complete Work custody');
  let missingRefused=false;
  try {reloadPackage();}catch{missingRefused=true;}
  verify(missingRefused,'recovery refuses incomplete paired file set even though Work content still exists');
  report.negativeControls.push('INCOMPLETE_ENCRYPTED_METADATA_PAIR_REFUSED');
  docker(['exec',PG,'mv',missingPath+'.held',missingPath]);
  verify(reloadPackage().pairDigest===combined.pairDigest,
    'restoring original provenance half returns the exact two-part manifest');

  const mutated=Buffer.from(provRaw);
  mutated[mutated.length-4]^=1;
  writeFile('work',manuscriptId+'.provenance',mutated);
  let mutationRefused=false;
  try {reloadPackage();}catch{mutationRefused=true;}
  verify(mutationRefused,'tampered provenance companion refuses manifest readback');
  report.negativeControls.push('SAVED_METADATA_CIPHERTEXT_TAMPERING_REFUSED');
  writeFile('work',manuscriptId+'.provenance',provRaw);
  verify(reloadPackage().pairDigest===combined.pairDigest,
    'untampered provenance file remains recoverable');

  const revoked:DeletionHighwaterV1={...checkpoint,revokedWorks:[manuscriptId]};
  let revokedRefused=false;
  try {recover(reloadPackage(),revoked);}
  catch(e){revokedRefused=(e as {code?:string}).code==='deleted_work_refused';}
  verify(revokedRefused,
    'newer independently signed synthetic deletion checkpoint refuses intact old Work and filename');
  report.negativeControls.push('SIGNER_AUTHENTICATED_DELETED_WORK_REFUSED_BEFORE_DECRYPT');
  let staleRefused=false;
  try {recover(reloadPackage(),{...checkpoint,generation:19});}
  catch(e){staleRefused=(e as {code?:string}).code==='stale_deletion_checkpoint';}
  verify(staleRefused,'stale signed checkpoint cannot bypass independently provided higher generation');
  report.negativeControls.push('SIGNED_OLD_CHECKPOINT_REFUSED');
  let missingAuthorityRefused=false;
  try {recover(reloadPackage(),checkpoint,{independentDeletionGeneration:null});}
  catch(e){missingAuthorityRefused=(e as {code?:string}).code==='untrusted_deletion_checkpoint';}
  verify(missingAuthorityRefused,'no independent deletion custodian means no decrypted original or filename');
  report.negativeControls.push('NO_EXTERNAL_DELETION_AUTHORITY_REFUSED');

  verify(readFile('pending',arrivalId+'.pending').equals(pendingRaw),
    'pending encrypted original still retained pending independent key retirement');
  verify(sql(`SELECT state FROM r14_paired_original_manifest WHERE claim_id='${claimId}'`)==='PREPARED_ONLY_NOT_PERSISTED',
    'physical SQL has no completed/erased status despite both ciphertext halves present');
  report.status='R14_PAIRED_FICTIONAL_PROVENANCE_RESTART_PASS_REAL_AUTHORITY_HOLD';
}catch(e){
  report.status='R14_PHYSICAL_FIXTURE_HOLD';
  report.error=String((e as Error)?.message||e).slice(0,450);
  process.exitCode=2;
}finally{
  if(created) {
    try{docker(['rm','-f',PG],undefined,45000);}
    catch(e){report.error=(report.error||'')+' container_cleanup_failure';}
  }
  for(const volume of [...volumes].reverse()){
    try{docker(['volume','rm',volume],undefined,45000);}
    catch(e){report.error=(report.error||'')+' volume_cleanup_failure';}
  }
  report.resourcesCleaned=!exists('container',PG) &&
    [DB,PENDING,WORK].every(v=>!exists('volume',v));
  if(!report.resourcesCleaned)process.exitCode=2;
  writeFileSync(REPORT,JSON.stringify(report,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({
    status:report.status,checks:report.checks.length,
    negativeControls:report.negativeControls,
    resourcesCleaned:report.resourcesCleaned,
    realWriterAdmission:'HOLD',independentKeyAuthority:'NOT_INSTALLED',
    receipt:REPORT,error:report.error,
  },null,2));
}
