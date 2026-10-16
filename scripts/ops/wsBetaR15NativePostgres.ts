/**
 * R15 non-Docker native PostgreSQL fault fixture, fictional-only.
 * Starts a fresh Unix-socket-only PG14 cluster inside os.tmpdir(). No network
 * listener, production volumes, member writing, backups, or external key calls.
 */
import {spawnSync} from 'node:child_process';
import {createHash,generateKeyPairSync,randomBytes,randomUUID,sign} from 'node:crypto';
import {existsSync,mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {sealPendingArrival} from '../../lib/writersStudio/recovery/pendingArrivalEnvelopeV1';
import {canonicalClaimedArrivalPayload,type ClaimedArrivalReceiptV1}
 from '../../lib/writersStudio/recovery/pendingClaimTransferV1';
import {canonicalOriginalProvenanceV2,type OriginalProvenanceV2}
 from '../../lib/writersStudio/recovery/originalProvenanceV2';
import {preparePairedOriginalV2,openPairedOriginalV2,type PairedOriginalPackageV2}
 from '../../lib/writersStudio/recovery/pairedOriginalCustodyV2';
import {canonicalDeletionPayload,type DeletionHighwaterV1}
 from '../../lib/writersStudio/recovery/deletionBarrierV1';
import {beginHeldPairedTransferV2,advanceHeldPairedTransferV2,canonicalPairedTransferProofV2,
 type PairedTransferActionV2,type PairedTransferJournalV2,
 type PairedTransferWitnessesV2} from '../../lib/writersStudio/recovery/pairedTransferJournalV2';

if(process.env.R15_NATIVE_FIXTURE!=='fictional-only')
 throw Error('R15_NATIVE_FIXTURE_REQUIRES_EXACT_FICTIONAL_ONLY_OPT_IN');
const RECEIPT='/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R15_NATIVE_POSTGRES_20261016.json';
const PORT='55415';const MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const FOREIGN='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const ARRIVAL='306902ed-21a9-4c01-aa15-984755598218';
const WORK='4c0782ca-9074-43ee-9f3c-5f8500026780';
const CLAIM='d3a75cd8-40cc-4fe2-a15e-437ce4ca2c58';
const TEXT=Buffer.from('Fictional writing with a silver moon.\r\nEnd.\0','utf8');
const FILE=Buffer.from([0x50,0x4b,0x03,0x04,0,253,4,9,0,11]);
const NAME='Original fictional manuscript ✦.docx';
const MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const signer=generateKeyPairSync('ed25519'),metadataSigner=generateKeyPairSync('ed25519'),
 deletionSigner=generateKeyPairSync('ed25519'),storageSigner=generateKeyPairSync('ed25519'),
 keySigner=generateKeyPairSync('ed25519'),recoverySigner=generateKeyPairSync('ed25519');
const witnesses:PairedTransferWitnessesV2={
 storageSigner:storageSigner.publicKey,independentKeySigner:keySigner.publicKey,
 independentRecoverySigner:recoverySigner.publicKey,externalMinimumEpoch:20,
};
const digest=(s:Buffer|string)=>createHash('sha256').update(s).digest('hex');
const key=()=>({keyId:randomUUID(),keyBytes:randomBytes(32)});
const result={status:'HOLD',scope:'UNIX_SOCKET_ONLY_PG14_FICTIONAL_NATIVE',
 checks:[] as string[],negatives:[] as string[],postgresVersion:'unknown',
 productionTouched:false,realMembersRead:false,externalKeyAuthority:false,
 realWriterAdmission:'HOLD',clusterStopped:false,temporaryFilesRemoved:false,
 error:null as string|null};
let root:string|undefined;let started=false;
const check=(ok:unknown,label:string)=>{
 if(!ok)throw Error('R15_NATIVE_ASSERTION_FAILED:'+label);
 result.checks.push(label);
};
function exec(program:string,args:string[],limit=60000):string {
 const r=spawnSync(program,args,{cwd:'/private/tmp',encoding:'utf8',
  timeout:limit,maxBuffer:4*1024*1024});
 if(r.error||r.status!==0)throw Error('NATIVE_COMMAND_FAILED:'+program+':'+String(r.stderr||'').slice(-240));
 return(r.stdout||'').trim();
}
function failed(program:string,args:string[]):boolean {
 return spawnSync(program,args,{cwd:'/private/tmp',stdio:'ignore',timeout:35000}).status!==0;
}
function pgargs():string[]{
 if(!root)throw Error('NATIVE_ROOT_MISSING');
 return ['-XAtq','-v','ON_ERROR_STOP=1','-h',join(root,'socket'),'-p',PORT,
  '-U','soullab','-d','postgres'];
}
const sql=(q:string)=>exec('psql',[...pgargs(),'-c',q]);
const sqlFails=(q:string)=>failed('psql',[...pgargs(),'-c',q]);
function ready():void {
 for(let i=0;i<90;i++){
  if(failed('pg_isready',['-h',join(root!,'socket'),'-p',PORT,'-U','soullab'])===false)return;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,150);
 }
 throw Error('NATIVE_PG_NOT_READY');
}
function start():void{
 root=mkdtempSync(join(tmpdir(),'ws-r15-native-pg-'));
 mkdirSync(join(root,'socket'));
 writeFileSync(join(root,'fictional-only.marker'),'R15 fictional PostgreSQL only\n');
 result.postgresVersion=exec('postgres',['--version']);
 exec('initdb',['-D',join(root,'data'),'-U','soullab','-A','trust',
  '--no-instructions','-E','UTF8','--locale=C'],75000);
 const options='-c listen_addresses= -c unix_socket_directories='+join(root,'socket')+
  ' -c port='+PORT+' -c fsync=on';
 exec('pg_ctl',['-D',join(root,'data'),'-l',join(root,'pg.log'),
  '-o',options,'-w','start'],65000);started=true;ready();
 check(existsSync(join(root,'socket','.s.PGSQL.'+PORT)),
  'fresh PostgreSQL bound only to private Unix socket');
}
function restart():void{
 exec('pg_ctl',['-D',join(root!,'data'),'-m','immediate','-w','stop']);
 started=false;
 exec('pg_ctl',['-D',join(root!,'data'),'-l',join(root!,'pg.log'),
  '-o','-c listen_addresses= -c unix_socket_directories='+join(root!,'socket')+
   ' -c port='+PORT+' -c fsync=on','-w','start']);
 started=true;ready();
}
function filename(kind:'pending'|'work'|'metadata'):string{return join(root!,kind+'.encrypted');}
const store=(kind:'pending'|'work'|'metadata',bytes:Buffer)=>
 writeFileSync(filename(kind),bytes,{mode:0o600});
const restore=(kind:'pending'|'work'|'metadata')=>readFileSync(filename(kind));
function loadJournal():PairedTransferJournalV2{
 const row=JSON.parse(sql(`SELECT row_to_json(j)::text FROM r15_journal j WHERE claim_id='${CLAIM}'`));
 return {protocol:'soullab.ws.paired-transfer-journal.v2',
  claimId:row.claim_id,memberId:row.member_id,arrivalId:row.arrival_id,
  manuscriptId:row.manuscript_id,pendingKeyId:row.pending_key_id,
  workKeyId:row.work_key_id,claimEpoch:Number(row.claim_epoch),
  workGeneration:Number(row.work_generation),workDigest:row.work_digest,
  provenanceDigest:row.provenance_digest,pairDigest:row.pair_digest,
  phase:row.phase,revision:Number(row.revision),lastReceiptSha256:row.last_receipt_sha256,
  custody:'HELD_FICTIONAL_CANDIDATE_ONLY'};
}
function cas(old:PairedTransferJournalV2,next:PairedTransferJournalV2):boolean{
 return sql(`UPDATE r15_journal SET phase='${next.phase}',revision=${next.revision},
   last_receipt_sha256='${next.lastReceiptSha256}'
    WHERE claim_id='${CLAIM}' AND revision=${old.revision}
       AND phase='${old.phase}' RETURNING revision`)===String(next.revision);
}
function receiptFor(j:PairedTransferJournalV2,action:PairedTransferActionV2,evidence:string){
 const proof={protocol:'soullab.ws.paired-transfer-proof.v2' as const,action,
  claimId:j.claimId,memberId:j.memberId,arrivalId:j.arrivalId,manuscriptId:j.manuscriptId,
  pendingKeyId:j.pendingKeyId,workKeyId:j.workKeyId,claimEpoch:j.claimEpoch,
  workDigest:j.workDigest,provenanceDigest:j.provenanceDigest,pairDigest:j.pairDigest,
  journalRevision:j.revision,witnessEpoch:20,evidenceSha256:evidence};
 const s=action==='independent_pending_key_revocation_witnessed'
  ?keySigner.privateKey:action==='independent_recovery_checkpoint_witnessed'
    ?recoverySigner.privateKey:storageSigner.privateKey;
 return {proof,signature:sign(null,canonicalPairedTransferProofV2(proof),s).toString('base64')};
}
function paired(j:PairedTransferJournalV2):PairedOriginalPackageV2{
 if(!existsSync(filename('work'))||!existsSync(filename('metadata')))
  throw Error('SECOND_ENCRYPTED_PART_MISSING');
 const w=restore('work'),m=restore('metadata');
 if(digest(w)!==j.workDigest||digest(m)!==j.provenanceDigest||
   digest(JSON.stringify(['soullab.ws.paired-original.v2',j.workDigest,j.provenanceDigest]))!==j.pairDigest)
  throw Error('ENCRYPTED_PAIR_DIGEST_MISMATCH');
 return {protocol:'soullab.ws.paired-original.v2',
  work:JSON.parse(w.toString('utf8')),provenance:JSON.parse(m.toString('utf8')),
  workDigest:j.workDigest,provenanceDigest:j.provenanceDigest,pairDigest:j.pairDigest};
}

try {
 start();
 const pk=key(),wk=key(),pendingAuthority={memberId:MEMBER,arrivalId:ARRIVAL,generation:4};
 const rawPending=sealPendingArrival(pendingAuthority,{
   kind:'artifact_extraction',sourceText:TEXT,originalBytes:FILE,
   originalFilename:NAME,mimeType:MIME,
 },pk);
 const pendingBytes=Buffer.from(JSON.stringify(rawPending),'utf8');
 store('pending',pendingBytes);
 check(restore('pending').equals(pendingBytes),'fictional pending Source encrypted on disk');
 check(!pendingBytes.includes(TEXT)&&!pendingBytes.includes(Buffer.from(NAME)),
  'pending Source file has no visible text or private filename');
 sql(`CREATE TABLE beta_members(id uuid PRIMARY KEY);
 CREATE TABLE member_manuscripts(id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES beta_members(id));
 CREATE TABLE manuscript_source_arrivals(
   id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES beta_members(id),
   manuscript_id uuid REFERENCES member_manuscripts(id),source_hash text,artifact_hash text);
 CREATE TABLE r15_journal(
   claim_id uuid PRIMARY KEY,member_id uuid NOT NULL,
   arrival_id uuid NOT NULL UNIQUE,manuscript_id uuid NOT NULL,
   pending_key_id uuid NOT NULL,work_key_id uuid NOT NULL,
   claim_epoch bigint NOT NULL,work_generation int NOT NULL,
   work_digest text NOT NULL,provenance_digest text NOT NULL,pair_digest text NOT NULL,
   phase text NOT NULL,revision int NOT NULL CHECK(revision BETWEEN 0 AND 5),
   last_receipt_sha256 text,custody text NOT NULL CHECK(custody='HELD_FICTIONAL_CANDIDATE_ONLY'),
   CHECK((revision=0 AND last_receipt_sha256 IS NULL) OR
         (revision>0 AND last_receipt_sha256 IS NOT NULL)));
 CREATE TABLE r15_outbox(claim_id uuid PRIMARY KEY REFERENCES r15_journal(claim_id),
   pending_key_id uuid NOT NULL,pair_digest text NOT NULL,
   evidence_sha256 text NOT NULL,status text NOT NULL CHECK(status='owed'));
 INSERT INTO beta_members VALUES('${MEMBER}'),('${FOREIGN}');
 INSERT INTO member_manuscripts VALUES('${WORK}','${MEMBER}');
 INSERT INTO manuscript_source_arrivals VALUES('${ARRIVAL}','${MEMBER}',NULL,
   '${digest(TEXT)}','${digest(FILE)}');`);
 check(sql(`SELECT count(*) FROM manuscript_source_arrivals WHERE
     id='${ARRIVAL}' AND member_id='${FOREIGN}'`)==='0',
   'foreign member cannot claim original row');
 sql(`BEGIN;
   WITH owned AS (SELECT id FROM member_manuscripts
     WHERE id='${WORK}' AND member_id='${MEMBER}' FOR UPDATE),
   bound AS (UPDATE manuscript_source_arrivals SET manuscript_id=(SELECT id FROM owned)
     WHERE id='${ARRIVAL}' AND member_id='${MEMBER}' AND manuscript_id IS NULL
       AND EXISTS(SELECT 1 FROM owned) RETURNING id)
   SELECT count(*) FROM bound;COMMIT;`);
 check(sql(`SELECT manuscript_id::text FROM manuscript_source_arrivals WHERE id='${ARRIVAL}'`)===WORK,
   'same-owner Source claim committed in isolated native PostgreSQL');
 check(sql(`SELECT count(*) FROM manuscript_source_arrivals a
     JOIN member_manuscripts m ON a.manuscript_id=m.id AND a.member_id=m.member_id
    WHERE a.id='${ARRIVAL}' AND a.source_hash='${digest(TEXT)}'
      AND a.artifact_hash='${digest(FILE)}'`)==='1',
   'claim signer subject confirmed by committed owner join and exact source hashes');
 const claim:ClaimedArrivalReceiptV1={
  protocol:'soullab.ws.pending-claim-transfer.v1',status:'claim_committed',
  claimId:CLAIM,memberId:MEMBER,arrivalId:ARRIVAL,manuscriptId:WORK,
  pendingGeneration:4,manuscriptGeneration:5,claimEpoch:20,
  sourceKind:'artifact_extraction',sourceTextDigest:digest(TEXT),originalDigest:digest(FILE)
 };
 const signedClaim={claim,signature:sign(null,canonicalClaimedArrivalPayload(claim),
   signer.privateKey).toString('base64')};
 const metadata:OriginalProvenanceV2={
   protocol:'soullab.ws.original-provenance.v2',claimId:CLAIM,memberId:MEMBER,
   arrivalId:ARRIVAL,manuscriptId:WORK,receiptEpoch:21,
   sourceKind:'artifact_extraction',sourceTextSha256:digest(TEXT),
   sourceTextBytes:TEXT.length,originalSha256:digest(FILE),
   originalByteLength:FILE.length,originalFilename:NAME,mimeType:MIME,
   extractionMethod:'fictional-mammoth',extractorVersion:'test-1.0'
 };
 const signedMetadata={provenance:metadata,signature:sign(null,
   canonicalOriginalProvenanceV2(metadata),metadataSigner.privateKey).toString('base64')};
 const prepared=preparePairedOriginalV2({
   pendingAuthority,pendingEnvelope:rawPending,pendingKey:pk,workKey:wk,signedClaim,
   trustedClaimSigner:signer.publicKey,independentClaimMinimumEpoch:20,
   signedProvenance:signedMetadata,trustedProvenanceSigner:metadataSigner.publicKey,
   independentProvenanceMinimumEpoch:21
 });
 const checkpoint:DeletionHighwaterV1={
   protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
   generation:30,revokedWorks:[],revokedKeyIds:[]
 };
 const signedHighwater={checkpoint,
   signature:sign(null,canonicalDeletionPayload(checkpoint),
     deletionSigner.privateKey).toString('base64')};
 let journal=beginHeldPairedTransferV2({
  prepared,pendingKeyId:pk.keyId,workKey:wk,
  authorities:{signedClaim,claimSigner:signer.publicKey,minimumClaimEpoch:20,
   provenanceSigner:metadataSigner.publicKey,minimumProvenanceEpoch:21,
   deletionHighwater:signedHighwater,deletionSigner:deletionSigner.publicKey,
   independentDeletionGeneration:{minimumGeneration:30}}
 });
 check(journal.phase==='claim_committed'&&journal.revision===0,
   'verified original and provenance claims produce a held pair journal');
 sql(`CREATE FUNCTION r15_guard() RETURNS trigger LANGUAGE plpgsql AS $f$
 BEGIN
  IF TG_OP='INSERT' THEN
   IF NEW.phase<>'claim_committed' OR NEW.revision<>0 THEN
    RAISE EXCEPTION 'initial_journal_invalid'; END IF;
   RETURN NEW;
  END IF;
  IF ROW(NEW.claim_id,NEW.member_id,NEW.arrival_id,NEW.manuscript_id,
      NEW.pending_key_id,NEW.work_key_id,NEW.claim_epoch,NEW.work_generation,
      NEW.work_digest,NEW.provenance_digest,NEW.pair_digest,NEW.custody)
    IS DISTINCT FROM
    ROW(OLD.claim_id,OLD.member_id,OLD.arrival_id,OLD.manuscript_id,
      OLD.pending_key_id,OLD.work_key_id,OLD.claim_epoch,OLD.work_generation,
      OLD.work_digest,OLD.provenance_digest,OLD.pair_digest,OLD.custody)
    THEN RAISE EXCEPTION 'immutable_pair_identity'; END IF;
  IF NEW.revision<>OLD.revision+1 OR NEW.last_receipt_sha256 IS NULL OR
    NOT((OLD.phase='claim_committed' AND NEW.phase='pair_verified') OR
       (OLD.phase='pair_verified' AND NEW.phase='retirement_owed') OR
       (OLD.phase='retirement_owed' AND NEW.phase='key_retirement_witnessed') OR
       (OLD.phase='key_retirement_witnessed' AND NEW.phase='pending_erasure_witnessed') OR
       (OLD.phase='pending_erasure_witnessed' AND NEW.phase='review_ready_not_released'))
   THEN RAISE EXCEPTION 'illegal_phase_or_revision'; END IF;
  RETURN NEW;
 END; $f$;
 CREATE TRIGGER r15_no_skip BEFORE INSERT OR UPDATE ON r15_journal
 FOR EACH ROW EXECUTE FUNCTION r15_guard();`);
 const inserted=sql(`INSERT INTO r15_journal
   (claim_id,member_id,arrival_id,manuscript_id,pending_key_id,work_key_id,
    claim_epoch,work_generation,work_digest,provenance_digest,pair_digest,
    phase,revision,last_receipt_sha256,custody)
   SELECT '${CLAIM}',a.member_id,a.id,m.id,'${pk.keyId}','${wk.keyId}',20,5,
      '${journal.workDigest}','${journal.provenanceDigest}','${journal.pairDigest}',
      'claim_committed',0,NULL,'HELD_FICTIONAL_CANDIDATE_ONLY'
   FROM manuscript_source_arrivals a JOIN member_manuscripts m
     ON a.manuscript_id=m.id AND a.member_id=m.member_id
   WHERE a.id='${ARRIVAL}' AND a.member_id='${MEMBER}'
   RETURNING claim_id`);
 check(inserted===CLAIM,'journal inserted only from same-member source ownership join');
 check(JSON.stringify(loadJournal())===JSON.stringify(journal),
   'full pair journal reconstructs from relational database with no process state');
 check(sqlFails(`UPDATE r15_journal SET phase='review_ready_not_released',
     revision=5,last_receipt_sha256='${'f'.repeat(64)}' WHERE claim_id='${CLAIM}'`),
   'native database refuses direct fake completion');
 check(sqlFails(`UPDATE r15_journal SET provenance_digest='${'e'.repeat(64)}',
     phase='pair_verified',revision=1,last_receipt_sha256='${'f'.repeat(64)}'
     WHERE claim_id='${CLAIM}'`),
   'native database refuses swapping an encrypted provenance identity');
 result.negatives.push('DATABASE_GUARD_REJECTS_SKIP_AND_METADATA_SUBSTITUTION');

 const workRaw=Buffer.from(JSON.stringify(prepared.package.work),'utf8');
 const metaRaw=Buffer.from(JSON.stringify(prepared.package.provenance),'utf8');
 store('work',workRaw);
 check(digest(restore('work'))===journal.workDigest,
   'encrypted manuscript component persists independently');
 let incomplete=false;try{paired(journal);}catch{incomplete=true;}
 check(incomplete,'one-sided encrypted file cannot qualify as full original custody');
 check(loadJournal().phase==='claim_committed',
   'incomplete pair cannot advance transfer journal');
 restart();
 journal=loadJournal();
 check(journal.phase==='claim_committed'&&incomplete,
   'hard native database restart preserves held first-half transfer');
 check(existsSync(filename('work'))&&!existsSync(filename('metadata')),
   'after crash the missing provenance file is still correctly missing');
 result.negatives.push('FIRST_HALF_CRASH_REFUSES_PAIR_CERTIFICATION');
 store('metadata',metaRaw);
 check(digest(restore('metadata'))===journal.provenanceDigest,
   'encrypted original filename and extraction metadata companion persisted separately');
 check(!metaRaw.includes(Buffer.from(NAME))&&!metaRaw.includes(TEXT),
   'private file name and writing remain concealed in encrypted companion');
 check(paired(journal).pairDigest===journal.pairDigest,
   'two independent ciphertexts recompute manifest-authorized exact pair');
 restart();
 journal=loadJournal();
 check(paired(journal).pairDigest===journal.pairDigest,
   'both encrypted files and database pair identity survive second hard restart');
 const changed=Buffer.from(metaRaw);
 changed[changed.length-3]^=1;store('metadata',changed);
 let tamper=false;try{paired(journal);}catch{tamper=true;}
 check(tamper,'modified signed provenance ciphertext fails readback');
 check(loadJournal().revision===0,
   'tampering fails closed without inventing a journal promotion');
 result.negatives.push('ENCRYPTED_METADATA_TAMPERING_REFUSED');
 store('metadata',metaRaw);
 check(paired(journal).pairDigest===journal.pairDigest,
   'restored unmodified encrypted provenance requalifies exact pair');
 const signedReadback=receiptFor(journal,'paired_ciphertexts_durable_readback',
  paired(journal).pairDigest);
 const first=advanceHeldPairedTransferV2(journal,signedReadback,witnesses);
 check(cas(journal,first),'CAS advances only signed full-pair readback');
 check(!cas(journal,first),'stale concurrent CAS cannot double-advance');
 check(JSON.stringify(advanceHeldPairedTransferV2(first,signedReadback,witnesses))===
   JSON.stringify(first),'identical signed receipt replay remains idempotent');
 journal=first;
 check(loadJournal().phase==='pair_verified','relational pair-verified state survived CAS');
 result.negatives.push('STALE_CONCURRENT_CAS_REFUSED');
 const debtDigest=digest('FICTIONAL_PENDING_RETIREMENT_OBLIGATION_'+journal.pairDigest);
 check(sqlFails(`BEGIN;
   INSERT INTO r15_outbox(claim_id,pending_key_id,pair_digest,evidence_sha256,status)
    VALUES('${CLAIM}','${pk.keyId}','${journal.pairDigest}',
    '${debtDigest}','owed');
   SELECT 1/0;COMMIT;`),'injected SQL crash interrupts uncommitted debt');
 check(sql('SELECT count(*) FROM r15_outbox')==='0' &&
  loadJournal().phase==='pair_verified',
  'aborted transaction cannot fabricate retirement debt');
 result.negatives.push('FAILED_RETIREMENT_WRITE_ROLLED_BACK');
 const owed=advanceHeldPairedTransferV2(journal,
   receiptFor(journal,'retirement_obligation_committed',debtDigest),witnesses);
 sql(`BEGIN;
   WITH moved AS (UPDATE r15_journal
     SET phase='${owed.phase}',revision=${owed.revision},
       last_receipt_sha256='${owed.lastReceiptSha256}'
     WHERE claim_id='${CLAIM}' AND revision=${journal.revision}
       AND phase='${journal.phase}' RETURNING claim_id),
   debt AS (INSERT INTO r15_outbox(claim_id,pending_key_id,pair_digest,evidence_sha256,status)
     SELECT claim_id,'${pk.keyId}','${journal.pairDigest}',
       '${debtDigest}','owed' FROM moved RETURNING claim_id)
   SELECT count(*) FROM debt;COMMIT;`);
 check(sql(`SELECT count(*) FROM r15_outbox WHERE claim_id='${CLAIM}'`) === '1' &&
   loadJournal().phase==='retirement_owed',
   'outbox debt and journal move commit in same SQL transaction');
 restart();journal=loadJournal();
 check(journal.phase==='retirement_owed'&&journal.revision===2,
   'after restart complete pair journal remains at durable owed retirement');
 check(sql(`SELECT count(*) FROM r15_outbox WHERE
   claim_id='${CLAIM}' AND pending_key_id='${pk.keyId}'
    AND pair_digest='${journal.pairDigest}'`)==='1',
   'retirement obligation bound to exact two-part ciphertext survives restart');
 check(paired(journal).pairDigest===journal.pairDigest,
   'Work and full original provenance remain restorable after owed crash point');
 const reopened=openPairedOriginalV2({
   package:paired(journal),workKey:wk,signedClaim,
   trustedClaimSigner:signer.publicKey,independentClaimMinimumEpoch:20,
   trustedProvenanceSigner:metadataSigner.publicKey,independentProvenanceMinimumEpoch:21,
   signedDeletionHighwater:signedHighwater,trustedDeletionSigner:deletionSigner.publicKey,
   independentDeletionGeneration:{minimumGeneration:30},
 });
 check(reopened.sourceText.equals(TEXT)&&reopened.originalBytes?.equals(FILE),
  'actual ciphertext pair restores exact fictional Source/original bytes');
 check(reopened.provenance.originalFilename===NAME&&
   reopened.provenance.extractionMethod==='fictional-mammoth',
   'restored original private name and extraction provenance are intact');
 check(restore('pending').equals(pendingBytes),
   'pending encrypted original remains preserved because key retirement has not occurred');
 let noKeyAuthority=false;
 try{advanceHeldPairedTransferV2(journal,
   receiptFor(journal,'independent_pending_key_revocation_witnessed',
    digest('NONEXISTENT_INDEPENDENT_KMS')),
   {...witnesses,independentKeySigner:null});}
 catch(e){noKeyAuthority=(e as {code?:string}).code==='independent_paired_signer_unavailable';}
 check(noKeyAuthority,'no independent key authority means retirement cannot be claimed');
 check(loadJournal().phase==='retirement_owed',
   'no key-retirement or deletion-complete phase was persisted');
 result.negatives.push('REAL_KEY_AUTHORITY_MISSING_RETIREMENT_REFUSED');
 result.status='R15_NATIVE_FICTIONAL_PAIR_CRASH_AND_OUTBOX_PASS_RELEASE_HELD';
}catch(e){
 result.status='R15_NATIVE_FIXTURE_HOLD';result.error=String((e as Error)?.message||e).slice(0,470);
 process.exitCode=2;
}finally{
 if(root&&started){
  try{exec('pg_ctl',['-D',join(root,'data'),'-m','immediate','-w','stop'],65000);
    started=false;}
  catch(e){result.error=(result.error||'')+' native_pg_stop_failure';process.exitCode=2;}
 }
 result.clusterStopped=!started;
 if(root&&result.clusterStopped&&existsSync(join(root,'fictional-only.marker'))){
  try{rmSync(root,{recursive:true,force:true});}
  catch(e){result.error=(result.error||'')+' native_temp_cleanup_failure';process.exitCode=2;}
 }
 result.temporaryFilesRemoved=Boolean(root&&!existsSync(root));
 if(!result.temporaryFilesRemoved)process.exitCode=2;
 writeFileSync(RECEIPT,JSON.stringify(result,null,2)+'\n',{mode:0o600});
 console.log(JSON.stringify({status:result.status,
  checks:result.checks.length,negativeControls:result.negatives,
  clusterStopped:result.clusterStopped,cleaned:result.temporaryFilesRemoved,
  realMemberAdmission:result.realWriterAdmission,
  independentKeyAuthority:'NOT_INSTALLED',receipt:RECEIPT,error:result.error},null,2));
}
