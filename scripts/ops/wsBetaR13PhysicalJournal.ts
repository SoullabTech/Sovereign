/**
 * R13 opt-in physical durability rehearsal, FICTIONAL ONLY.
 *
 * Exercises actual PostgreSQL CAS and retirement outbox + actual encrypted
 * Original/Work Docker volumes, but not a live app integration, credential
 * service, independent key custodian or historical backup recovery.
 *
 * There is deliberately NO "complete" or real-data migration action.
 */
import { spawnSync } from 'node:child_process';
import { createHash, generateKeyPairSync, randomBytes, randomUUID, sign } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { sealPendingArrival } from '../../lib/writersStudio/recovery/pendingArrivalEnvelopeV1';
import {
  prepareClaimedArrivalRewrap,canonicalClaimedArrivalPayload,
  type ClaimedArrivalReceiptV1,
} from '../../lib/writersStudio/recovery/pendingClaimTransferV1';
import {
  beginHeldTransfer,advanceHeldTransfer,canonicalTransferReceipt,
  type PendingToWorkTransferJournalV1,type TransferOperationV1,
  type IndependentTransferWitnesses,
} from '../../lib/writersStudio/recovery/transferJournalV1';

if (process.env.R13_PHYSICAL_FIXTURE !== 'fictional-only') {
  throw Error('R13_PHYSICAL_FIXTURE_REQUIRES_EXACT_FICTIONAL_ONLY_OPT_IN');
}
const PG='ws-r13-fictional-journal-pg-20261016';
const DB_VOL='ws-r13-fictional-db-data-20261016';
const PENDING_VOL='ws-r13-fictional-pending-source-20261016';
const WORK_VOL='ws-r13-fictional-work-source-20261016';
const IMAGE='pgvector/pgvector:pg16';
const OUTPUT='/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R13_PHYSICAL_JOURNAL_20261016.json';
const member='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const arrival='306902ed-21a9-4c01-aa15-984755598218';
const manuscript='4c0782ca-9074-43ee-9f3c-5f8500026780';
const evidence:{status:string;scope:string;checks:string[];negativeChecks:string[];
  realMembersRead:boolean;liveBetaChanged:boolean;keyAuthorityInstalled:boolean;
  originalPendingStillHeld:boolean;testContainersRemoved:boolean;error?:string}={
  status:'HOLD',scope:'NETWORKLESS_DISPOSABLE_FICTIONAL_PG_AND_SOURCE_VAULTS_ONLY',
  checks:[],negativeChecks:[],realMembersRead:false,liveBetaChanged:false,
  keyAuthorityInstalled:false,originalPendingStillHeld:true,testContainersRemoved:false,
};
const madeV:string[]=[];
let madePg=false;
function check(value:unknown,comment:string):void {
  if(!value)throw Error('FAILED_FICTIONAL_CHECK:'+comment);
  evidence.checks.push(comment);
}
function docker(args:string[],stdin?:Buffer,timeout=45000):Buffer {
  const result=spawnSync('docker',args,{input:stdin,encoding:null,timeout,maxBuffer:16*1024*1024});
  if(result.error||result.status!==0)
    throw Error('FICTIONAL_DOCKER_FAILURE:'+args[0]+':'+String(result.stderr||'').slice(-210));
  return Buffer.isBuffer(result.stdout)?result.stdout:Buffer.from(result.stdout||'');
}
function has(kind:'container'|'volume',name:string):boolean {
  return spawnSync('docker',[kind,'inspect',name],{stdio:'ignore',timeout:10000}).status===0;
}
function sql(q:string):string{
  return docker(['exec',PG,'psql','-XAtq','-v','ON_ERROR_STOP=1','-U','postgres','-d','postgres','-c',q])
    .toString('utf8').trim();
}
function failedSql(q:string):boolean{
  const r=spawnSync('docker',['exec',PG,'psql','-XAt','-v','ON_ERROR_STOP=1','-U','postgres',
   '-d','postgres','-c',q],{encoding:null,timeout:30000});
  return r.status!==0;
}
function digest(bytes:Buffer|string):string{
  return createHash('sha256').update(bytes).digest('hex');
}
function put(volume:string,name:string,bytes:Buffer):void{
  const path=volume===PENDING_VOL?'/pending':'/work';
  docker(['exec','-i',PG,'sh','-c','cat > '+path+'/'+name],bytes);
}
function get(volume:string,name:string):Buffer{
  return docker(['exec',PG,'cat',(volume===PENDING_VOL?'/pending/':'/work/')+name]);
}
const claimKeys=generateKeyPairSync('ed25519');
const storageKeys=generateKeyPairSync('ed25519');
const custodianKeys=generateKeyPairSync('ed25519');
const recoveryKeys=generateKeyPairSync('ed25519');
const witness:IndependentTransferWitnesses={
 storageSigner:storageKeys.publicKey,independentKeySigner:custodianKeys.publicKey,
 independentRecoverySigner:recoveryKeys.publicKey,minimumIndependentEpoch:12,
};
const key=()=>({keyId:randomUUID(),keyBytes:randomBytes(32)});
type PhaseRow={phase:string;revision:number;lastReceiptHash:string|null};
function row(j:PendingToWorkTransferJournalV1):PhaseRow {
 const raw=sql(`SELECT phase||'|'||revision||'|'||coalesce(last_receipt_hash,'')
   FROM r13_transfer_journal WHERE claim_id='${j.claimId}'`);
 const [phase,revision,hash]=raw.split('|');
 return {phase,revision:Number(revision),lastReceiptHash:hash||null};
}
function loadJournal(claimId:string):PendingToWorkTransferJournalV1 {
 const json=sql(`SELECT row_to_json(j)::text FROM r13_transfer_journal j
   WHERE claim_id='${claimId}'`);
 const stored=JSON.parse(json) as Record<string,any>;
 return {
  protocol:'soullab.ws.transfer-journal.v1',
  claimId:stored.claim_id,memberId:stored.member_id,arrivalId:stored.arrival_id,
  manuscriptId:stored.manuscript_id,pendingKeyId:stored.pending_key_id,
  workKeyId:stored.work_key_id,claimEpoch:Number(stored.claim_epoch),
  manuscriptGeneration:Number(stored.manuscript_generation),
  encryptedWorkDigest:stored.encrypted_work_digest,phase:stored.phase,
  revision:Number(stored.revision),lastReceiptSha256:stored.last_receipt_hash,
  recoveryStatus:stored.recovery_status,
 } as PendingToWorkTransferJournalV1;
}
function cas(j:PendingToWorkTransferJournalV1,next:PendingToWorkTransferJournalV1):boolean{
 const updated=sql(`UPDATE r13_transfer_journal SET phase='${next.phase}',
     revision=${next.revision},last_receipt_hash='${next.lastReceiptSha256}'
   WHERE claim_id='${j.claimId}' AND revision=${j.revision} AND phase='${j.phase}'
   RETURNING revision`);
 return updated===String(next.revision);
}
function nextReceipt(j:PendingToWorkTransferJournalV1,action:TransferOperationV1,
  witnessDigest:string){
 const receipt={protocol:'soullab.ws.transfer-operation.v1' as const,operation:action,
  claimId:j.claimId,memberId:j.memberId,arrivalId:j.arrivalId,manuscriptId:j.manuscriptId,
  pendingKeyId:j.pendingKeyId,workKeyId:j.workKeyId,
  transferRevision:j.revision,witnessEpoch:12,evidenceSha256:witnessDigest};
 const signer=action==='pending_key_revocation_attested'?custodianKeys.privateKey:
  action==='independent_recovery_checkpoint_attested'?recoveryKeys.privateKey:storageKeys.privateKey;
 return {receipt,signature:sign(null,canonicalTransferReceipt(receipt),signer).toString('base64')};
}
function start():void {
 const names=[PG,DB_VOL,PENDING_VOL,WORK_VOL];
 check(!has('container',PG),'fixture container name not previously used');
 for(const v of names.slice(1)){
  check(!has('volume',v),'fixture volume does not already exist:'+v);
  docker(['volume','create','--label','life.soullab.scope=ws-r13-fictional',v]);madeV.push(v);
 }
 docker(['run','-d','--name',PG,'--network','none','--memory','900m','--cpus','1',
  '--pids-limit','128','--security-opt','no-new-privileges',
  '-v',DB_VOL+':/var/lib/postgresql/data',
  '-v',PENDING_VOL+':/pending','-v',WORK_VOL+':/work',
  '--tmpfs','/tmp:rw,nosuid,size=48m','-e','POSTGRES_HOST_AUTH_METHOD=trust',
  '--label','life.soullab.scope=ws-r13-fictional',IMAGE],undefined,50000);
 madePg=true;
 for(let i=0;i<80;i++){
  const p=spawnSync('docker',['exec',PG,'pg_isready','-U','postgres','-d','postgres'],
    {stdio:'ignore',timeout:12000});
  if(p.status===0)break;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,150);
 }
 const config=JSON.parse(docker(['inspect',PG]).toString('utf8'))[0];
 check(config.HostConfig.NetworkMode==='none','isolated real PostgreSQL with no network');
 check(Object.keys(config.HostConfig.PortBindings||{}).length===0,'no host ports published');
 check(config.Mounts.length===3 &&
   config.Mounts.every((m:{Name:string})=>[DB_VOL,PENDING_VOL,WORK_VOL].includes(m.Name)),
   'only three uniquely named fictional volumes present');
}

try {
 start();
 const memberForeign='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
 const manuscriptForeign='4c0782ca-9074-43ee-9f3c-5f8500026781';
 const originalText=Buffer.from('FICTIONAL ONLY: the moonlit orchard and a silent creek.\n');
 const originalFile=Buffer.from([0x50,0x4b,0x03,0x04,0,0xfe,0xa4,0x1b]);
 const pendingKey=key(),workKey=key();
 const pendingAuthority={memberId:member,arrivalId:arrival,generation:4};
 const pendingEnvelope=sealPendingArrival(pendingAuthority,{
   kind:'artifact_extraction',sourceText:originalText,originalBytes:originalFile,
   originalFilename:'fictional-orchard.docx',
   mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 },pendingKey);
 put(PENDING_VOL,arrival+'.pending',Buffer.from(JSON.stringify(pendingEnvelope)));
 check(get(PENDING_VOL,arrival+'.pending').equals(Buffer.from(JSON.stringify(pendingEnvelope))),
  'pending file exists with verified encrypted capsule bytes');
 check(!get(PENDING_VOL,arrival+'.pending').includes(Buffer.from('moonlit orchard')),
  'no fictional plaintext in pending vault file');

 sql(`CREATE TABLE beta_members(id uuid PRIMARY KEY);
 CREATE TABLE member_manuscripts(id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES beta_members(id));
 CREATE TABLE manuscript_source_arrivals(id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES beta_members(id),
 manuscript_id uuid REFERENCES member_manuscripts(id),source_digest text NOT NULL);
 CREATE TABLE r13_transfer_journal(claim_id uuid PRIMARY KEY,member_id uuid NOT NULL,
 arrival_id uuid NOT NULL UNIQUE,manuscript_id uuid NOT NULL,
 pending_key_id uuid NOT NULL,work_key_id uuid NOT NULL,
 claim_epoch bigint NOT NULL,manuscript_generation integer NOT NULL,
 recovery_status text NOT NULL CHECK(recovery_status='HELD_CANDIDATE_ONLY'),
 phase text NOT NULL,revision integer NOT NULL CHECK(revision BETWEEN 0 AND 5),
 last_receipt_hash text,encrypted_work_digest text NOT NULL,
 CHECK((revision=0 AND last_receipt_hash IS NULL) OR
       (revision>0 AND last_receipt_hash IS NOT NULL)));
 CREATE TABLE r13_retirement_outbox(claim_id uuid PRIMARY KEY REFERENCES r13_transfer_journal(claim_id),
 pending_key_id uuid NOT NULL,manuscript_id uuid NOT NULL,
 obligation_digest text NOT NULL,status text NOT NULL CHECK(status='owed'));
 INSERT INTO beta_members VALUES('${member}'),('${memberForeign}');
 INSERT INTO member_manuscripts VALUES('${manuscript}','${member}'),('${manuscriptForeign}','${memberForeign}');
 INSERT INTO manuscript_source_arrivals VALUES('${arrival}','${member}',NULL,'${digest(originalText)}');`);
 // Isolated fixture ONLY: protect the immutable journal identity and its
 // monotonic phase transitions at the database boundary as well as in Node.
 sql(`CREATE FUNCTION r13_guard_journal() RETURNS trigger LANGUAGE plpgsql AS $guard$
 BEGIN
   IF TG_OP='INSERT' THEN
     IF NEW.phase<>'claim_committed' OR NEW.revision<>0 OR NEW.last_receipt_hash IS NOT NULL
       THEN RAISE EXCEPTION 'r13_initial_state_refused'; END IF;
     RETURN NEW;
   END IF;
   IF ROW(NEW.claim_id,NEW.member_id,NEW.arrival_id,NEW.manuscript_id,
      NEW.pending_key_id,NEW.work_key_id,NEW.claim_epoch,
      NEW.manuscript_generation,NEW.recovery_status,NEW.encrypted_work_digest)
     IS DISTINCT FROM
      ROW(OLD.claim_id,OLD.member_id,OLD.arrival_id,OLD.manuscript_id,
      OLD.pending_key_id,OLD.work_key_id,OLD.claim_epoch,
      OLD.manuscript_generation,OLD.recovery_status,OLD.encrypted_work_digest)
      THEN RAISE EXCEPTION 'r13_immutable_identity_refused'; END IF;
   IF NEW.revision<>OLD.revision+1 OR NEW.last_receipt_hash IS NULL
       OR NEW.last_receipt_hash=OLD.last_receipt_hash
      THEN RAISE EXCEPTION 'r13_revision_refused'; END IF;
   IF NOT (
     (OLD.phase='claim_committed' AND NEW.phase='work_capsule_verified')
     OR (OLD.phase='work_capsule_verified' AND NEW.phase='retirement_owed')
     OR (OLD.phase='retirement_owed' AND NEW.phase='key_retirement_witnessed')
     OR (OLD.phase='key_retirement_witnessed' AND NEW.phase='pending_bytes_erasure_witnessed')
     OR (OLD.phase='pending_bytes_erasure_witnessed' AND NEW.phase='review_ready_not_released')
   ) THEN RAISE EXCEPTION 'r13_illegal_phase_jump'; END IF;
   RETURN NEW;
 END; $guard$;
 CREATE TRIGGER r13_guard_before_journal BEFORE INSERT OR UPDATE ON r13_transfer_journal
 FOR EACH ROW EXECUTE FUNCTION r13_guard_journal();`);
 check(sql(`SELECT count(*) FROM manuscript_source_arrivals
  WHERE id='${arrival}' AND member_id='${memberForeign}'`)==='0','foreign member cannot claim pending Source');

 // A real claim is a committed SQL transaction BEFORE creating its signed receipt.
 const claimed=sql(`BEGIN;
 WITH own AS (SELECT id FROM member_manuscripts WHERE id='${manuscript}' AND member_id='${member}' FOR UPDATE),
 moved AS (UPDATE manuscript_source_arrivals SET manuscript_id=(SELECT id FROM own)
     WHERE id='${arrival}' AND member_id='${member}' AND manuscript_id IS NULL
       AND EXISTS(SELECT 1 FROM own) RETURNING id)
 SELECT count(*) FROM moved;
 COMMIT;`);
 check(claimed.includes('1'),'fictional Source claimed to verified same-member manuscript in committed PostgreSQL transaction');
 check(sql(`SELECT manuscript_id::text FROM manuscript_source_arrivals WHERE id='${arrival}'`)===manuscript,
  'claim state durable in physical PostgreSQL');
 const claim:ClaimedArrivalReceiptV1={
   protocol:'soullab.ws.pending-claim-transfer.v1',status:'claim_committed',
   claimId:randomUUID(),memberId:member,arrivalId:arrival,manuscriptId:manuscript,
   pendingGeneration:4,manuscriptGeneration:5,claimEpoch:12,
   sourceKind:'artifact_extraction',sourceTextDigest:digest(originalText),originalDigest:digest(originalFile),
 };
 const signedClaim={claim,signature:sign(null,canonicalClaimedArrivalPayload(claim),
   claimKeys.privateKey).toString('base64')};
 const prepared=prepareClaimedArrivalRewrap({
   pendingAuthority,pendingEnvelope,pendingKey,workKey,signedClaim,
   trustedClaimSigner:claimKeys.publicKey,trustedClaimEpoch:12,
 });
 let j=beginHeldTransfer({signedClaim,prepared,pendingKeyId:pendingKey.keyId,
   trustedClaimSigner:claimKeys.publicKey,trustedClaimEpoch:12});
 const enrolled=sql(`INSERT INTO r13_transfer_journal
   (claim_id,member_id,arrival_id,manuscript_id,pending_key_id,work_key_id,
    claim_epoch,manuscript_generation,recovery_status,phase,revision,last_receipt_hash,encrypted_work_digest)
   SELECT '${j.claimId}',a.member_id,a.id,m.id,
      '${j.pendingKeyId}','${j.workKeyId}',${j.claimEpoch},
      ${j.manuscriptGeneration},'HELD_CANDIDATE_ONLY','claim_committed',0,NULL,
      '${j.encryptedWorkDigest}'
     FROM manuscript_source_arrivals a
     JOIN member_manuscripts m ON m.id=a.manuscript_id AND m.member_id=a.member_id
    WHERE a.id='${arrival}' AND a.member_id='${member}' AND m.id='${manuscript}'
   RETURNING claim_id`);
 check(enrolled===j.claimId,
   'durable journal insertion is anchored to the independently same-owned committed Source claim');
 check(row(j).phase==='claim_committed'&&row(j).revision===0,
   'committed claim journal begins at revision zero with pending ciphertext intact');
 check(JSON.stringify(loadJournal(j.claimId))===JSON.stringify(j),
   'full journal identity, generation, key IDs and digest reconstruct entirely from PostgreSQL');
 check(failedSql(`UPDATE r13_transfer_journal
    SET phase='review_ready_not_released',revision=5,last_receipt_hash='${'f'.repeat(64)}'
    WHERE claim_id='${j.claimId}'`),
   'database trigger rejects direct jump from claim to review-ready even when forged revision is also supplied');
 check(failedSql(`UPDATE r13_transfer_journal
    SET member_id='${memberForeign}',phase='work_capsule_verified',
        revision=1,last_receipt_hash='${'e'.repeat(64)}'
    WHERE claim_id='${j.claimId}'`),
   'database trigger independently refuses mutation of original member/Work authority');
 check(row(j).revision===0 && loadJournal(j.claimId).memberId===member,
   'illegal phase/ownership writes did not change the physical journal');
 evidence.negativeChecks.push('DB_TRIGGER_REJECTS_PHASE_JUMP_AND_OWNER_SUBSTITUTION');

 const workSerialized=Buffer.from(JSON.stringify(prepared.sealedWork));
 put(WORK_VOL,manuscript+'.work',workSerialized);
 check(digest(get(WORK_VOL,manuscript+'.work'))===j.encryptedWorkDigest,
   'separate encrypted Work object durably written and byte-for-byte reread');
 check(!get(WORK_VOL,manuscript+'.work').includes(Buffer.from('orchard')),
   'newly sealed Work file does not reveal fictional original text');

 // Simulated hard process/container restart after file publish but before SQL
 // phase witness. Named fictional PostgreSQL and Source volumes survive restart.
 docker(['restart',PG],undefined,65000);
 for(let i=0;i<80;i++){
  if(spawnSync('docker',['exec',PG,'pg_isready','-U','postgres','-d','postgres'],
    {stdio:'ignore',timeout:8000}).status===0)break;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,175);
 }
 check(row(j).revision===0,'restart after file write cannot auto-promote unrecorded journal phase');
 const reloaded=loadJournal(j.claimId);
 check(JSON.stringify(reloaded)===JSON.stringify(j),
   'after restart a new worker can rebuild the full journal from database fields without process memory');
 j=reloaded;
 check(digest(get(WORK_VOL,manuscript+'.work'))===j.encryptedWorkDigest,
   'restart retains encrypted Work file without source reconstruction');

 const proof=nextReceipt(j,'work_capsule_durable_readback',digest(get(WORK_VOL,manuscript+'.work')));
 const advanced=advanceHeldTransfer(j,proof,witness);
 check(cas(j,advanced),'CAS journal promotion after real ciphertext reread committed once');
 const current=row(advanced);
 check(current.phase==='work_capsule_verified'&&current.revision===1,
   'physical PG stores Work readback phase and version');
 check(JSON.stringify(advanceHeldTransfer(advanced,proof,witness))===JSON.stringify(advanced),
   'same attestation retry does not advance journal');
 check(!cas(j,advanced),'stale competing journal revision cannot overwrite current state');
 evidence.negativeChecks.push('STALE_CAS_REFUSED_AFTER_SIGNED_WORK_READBACK');
 j=advanced;

 // Crash/failure prefix: inserting retirement debt but failing before journal
 // phase transition must roll back the SQL outbox insertion.
 const crash=failedSql(`BEGIN;
 INSERT INTO r13_retirement_outbox(claim_id,pending_key_id,manuscript_id,obligation_digest,status)
 VALUES('${j.claimId}','${pendingKey.keyId}','${manuscript}',
        '${digest('FICTIONAL_RETIREMENT_OBLIGATION')}','owed');
 SELECT 1/0;
 COMMIT;`);
 check(crash,'injected transaction failure interrupts outbox before phase publish');
 check(sql('SELECT count(*) FROM r13_retirement_outbox')==='0' && row(j).revision===1,
  'failed prefix leaves no false retirement debt or advanced phase');
 evidence.negativeChecks.push('FAILED_SQL_TRANSACTION_HAS_NO_DURABLE_FAKE_DEBT');

 const debtDigest=digest('FICTIONAL_RETIREMENT_OBLIGATION');
 const debtProof=nextReceipt(j,'retirement_obligation_committed',debtDigest);
 const debtPhase=advanceHeldTransfer(j,debtProof,witness);
 const outbox=sql(`BEGIN;
 WITH moved AS (
   UPDATE r13_transfer_journal
      SET phase='${debtPhase.phase}',revision=${debtPhase.revision},
          last_receipt_hash='${debtPhase.lastReceiptSha256}'
    WHERE claim_id='${j.claimId}' AND revision=${j.revision} AND phase='${j.phase}'
    RETURNING claim_id
 ), debt AS (
  INSERT INTO r13_retirement_outbox(claim_id,pending_key_id,manuscript_id,obligation_digest,status)
  SELECT claim_id,'${pendingKey.keyId}','${manuscript}','${debtDigest}','owed' FROM moved
  RETURNING claim_id)
 SELECT count(*) FROM debt;
 COMMIT;`);
 check(outbox.includes('1'),'retirement outbox and phase advance published in one PostgreSQL transaction');
 j=debtPhase;
 check(row(j).phase==='retirement_owed' && row(j).revision===2 &&
   sql('SELECT count(*) FROM r13_retirement_outbox')==='1',
   'durable retirement debt survived immediately after atomic commit');
 docker(['restart',PG],undefined,65000);
 for(let i=0;i<80;i++){
  if(spawnSync('docker',['exec',PG,'pg_isready','-U','postgres','-d','postgres'],
    {stdio:'ignore',timeout:8000}).status===0)break;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,175);
 }
 check(row(j).phase==='retirement_owed' && sql('SELECT count(*) FROM r13_retirement_outbox')==='1',
   'restart preserves retirement debt and journal recovery position');
 const debtReloaded=loadJournal(j.claimId);
 check(JSON.stringify(debtReloaded)===JSON.stringify(j),
   'restart reconstructs the exact owed retirement state, including last signed receipt digest');
 j=debtReloaded;
 check(digest(get(WORK_VOL,manuscript+'.work'))===j.encryptedWorkDigest,
   'restart retains encrypted manuscript capsule during owed retirement');
 check(digest(get(PENDING_VOL,arrival+'.pending'))===digest(JSON.stringify(pendingEnvelope)),
   'pending original remains intact until independent key retirement and provenance closure');
 const simulatedNoKeySigner={...witness,independentKeySigner:undefined as never};
 let absentKeyAuthorityRefused=false;
 try {
  const spoof=nextReceipt(j,'pending_key_revocation_attested',digest('UNINSTALLED_KEY_AUTHORITY'));
  advanceHeldTransfer(j,spoof,simulatedNoKeySigner);
 } catch(e) {
  absentKeyAuthorityRefused=(e as {code?:string}).code==='missing_independent_transfer_signer';
 }
 check(absentKeyAuthorityRefused,'without independent key authority retirement cannot advance');
 evidence.negativeChecks.push('EXTERNAL_KEY_CUSTODIAN_NOT_INSTALLED_AND_RETIREMENT_BLOCKED');
 check(j.phase==='retirement_owed',
   'crash-safe journal remains owed: no key retirement, vault erasure or completed deletion claimed');
 evidence.status='R13_FICTIONAL_DURABLE_RESTART_AND_CAS_PASS_REAL_RETIREMENT_HELD';
} catch(e){
 evidence.status='R13_FIXTURE_HOLD';
 evidence.error=String((e as Error)?.message||e).slice(0,450);
 process.exitCode=2;
} finally {
 if(madePg){
  try{docker(['rm','-f',PG],undefined,50000);}catch(e){evidence.error=(evidence.error||'')+' container_cleanup_failed';}
 }
 for(const v of [...madeV].reverse()){
  try{docker(['volume','rm',v],undefined,50000);}catch(e){evidence.error=(evidence.error||'')+' volume_cleanup_failed';}
 }
 evidence.testContainersRemoved=!has('container',PG)&&[DB_VOL,PENDING_VOL,WORK_VOL].every(v=>!has('volume',v));
 if(!evidence.testContainersRemoved)process.exitCode=2;
 writeFileSync(OUTPUT,JSON.stringify(evidence,null,2)+'\n',{mode:0o600});
 console.log(JSON.stringify({status:evidence.status,checks:evidence.checks.length,
  negatives:evidence.negativeChecks,cleaned:evidence.testContainersRemoved,
  retirementState:'NOT_COMPLETED_OR_AUTHORIZED',evidenceFile:OUTPUT,
  error:evidence.error||null},null,2));
}
