/**
 * Read-only REAL encrypted-fixture ciphertext inspection; test-owned
 * ephemeral signatures; deliberately NO decryption, private key read,
 * PostgreSQL start or member admission.
 *
 * R70.19E proves ordering: current trusted deletion authority and a
 * separately expected Work census must be accepted BEFORE a fictional
 * decrypt/restore callback. It does not prove actual offsite independence
 * or the completeness of the input census against decrypted DB contents.
 */
import {createHash,generateKeyPairSync,sign, type KeyObject} from 'node:crypto';
import {lstatSync,readFileSync,mkdirSync,readdirSync,
  writeFileSync,existsSync,realpathSync} from 'node:fs';
import path from 'node:path';
import {
  verifyR7019CFictionalCompletePoint,
} from './wsBetaR7019CEncryptedFixture';
import {
  R7019E_CENSUS_PROTOCOL,canonicalR7019ECensus,
  withHeldR7019EPreDecryptGate,
  type R7019ESignedCensusBody,
  type R7019ESignedCensus,
  type R7019ECurrentExternalAuthority,
} from '../../lib/writersStudio/recovery/heldR7019EPreDecryptErasureGate';
import {
  canonicalDeletionPayload,type DeletionHighwaterV1,
} from '../../lib/writersStudio/recovery/deletionBarrierV1';

const archiveDir=process.env.R7019E_ACCEPTED_GENERATION_DIR||'';
const evidenceDir=process.env.R7019E_EVIDENCE_DIR||'';
const expectedHead=process.env.R7019E_ARCHIVE_HEAD||'';
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const WORK_A='306902ed-21a9-4c01-aa15-984755598218';
const WORK_B='4c0782ca-9074-43ee-9f3c-5f8500026780';
const KEY_A='3ac9b90d-8d79-44cf-bf3f-81376d8b7efe';
const KEY_B='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const MEMBER='11111111-1111-4111-8111-111111111111';
const checks:Record<string,boolean>={};
function test(name:string,passed:boolean){
 checks[name]=passed;
 if(!passed)throw Error('R7019E_FAILED_'+name);
}
const safe=():void=>{
 if(process.env.R7019E_PHYSICAL_TEST!=='fictional-only'||
    process.env.R7019E_ERASURE_FIXTURE!=='fictional-only'||
    process.env.DATABASE_URL||process.env.FILE_STORAGE_PATH||
    !/^\/Volumes\/T7 Shield\/ws-beta-r7019c-[a-z0-9-]+\/complete-[a-f0-9]{12}$/.test(archiveDir)||
    !/^\/Volumes\/T7 Shield\/ws-beta-r7019e-[a-z0-9-]+$/.test(evidenceDir)||
    !/^[0-9a-f]{40}$/.test(expectedHead)||
    existsSync(evidenceDir))
   throw Error('R7019E_REFUSED_NON_FICTIONAL_OR_NONEXCLUSIVE_TEST');
 const s=lstatSync(archiveDir);
 if(!s.isDirectory()||s.isSymbolicLink()||realpathSync(archiveDir)!==archiveDir||
    s.mode%512!==0o700)
   throw Error('R7019E_UNTRUSTED_ACCEPTED_GENERATION_DIRECTORY');
};
function signedCensus(body:R7019ESignedCensusBody,signer:KeyObject):
 R7019ESignedCensus{
 return {body,signature:sign(null,canonicalR7019ECensus(body),signer)
   .toString('base64')};
}
function deletedCheckpoint(works:string[],keys:string[],gen:number,signer:KeyObject){
 const cp:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
  generation:gen,revokedWorks:[...works].sort(),revokedKeyIds:[...keys].sort(),
 };
 return {checkpoint:cp,
  signature:sign(null,canonicalDeletionPayload(cp),signer).toString('base64')};
}
function main(){
 safe();
 mkdirSync(evidenceDir,{mode:0o700});
 // This checks the existing archived fixture's ciphertext digests,
 // publication shape, file mode, and all production GO flags = false.
 const old=verifyR7019CFictionalCompletePoint(archiveDir,expectedHead);
 test('accepted_archives_have_both_verified_ciphertexts_and_no_live_GO',
  old.hasDatabaseCiphertext&&old.hasVaultCiphertext&&!old.productionRestoreApproved);
 const manifestBytes=readFileSync(path.join(archiveDir,'manifest.json'));
 const metadata=JSON.parse(manifestBytes.toString('utf8'));
 test('source_exact_git_and_generation_custody',
  metadata.head===expectedHead&&metadata.generation===path.basename(archiveDir).slice(9));
 const dbBytes=readFileSync(path.join(archiveDir,'database.pgdump.gpg'));
 const vaultBytes=readFileSync(path.join(archiveDir,'vault.tar.gpg'));
 const originalDigests={
  manifest:sha(manifestBytes),db:sha(dbBytes),vault:sha(vaultBytes),
 };
 const archive={
  sourceHead:metadata.head as string,
  generationNonce:metadata.generation as string,
  manifest:manifestBytes,
  postgresCiphertext:dbBytes,
  vaultCiphertext:vaultBytes,
 };
 const archiveSigner=generateKeyPairSync('ed25519');
 const deletionSigner=generateKeyPairSync('ed25519');
 const wrongSigner=generateKeyPairSync('ed25519');
 // These two work IDs are FICTIONAL TEST IDENTITIES, NOT an attested census
 // of the decrypted R70.19D PostgreSQL database. This remains a HOLD.
 const works=[
  {memberId:MEMBER,workId:WORK_A,keyId:KEY_A},
  {memberId:MEMBER,workId:WORK_B,keyId:KEY_B},
 ];
 const cbody:R7019ESignedCensusBody={
  protocol:R7019E_CENSUS_PROTOCOL,
  sourceHead:metadata.head,
  generationNonce:metadata.generation,
  snapshotGeneration:20,
  manifestSha256:originalDigests.manifest,
  dbCipherSha256:originalDigests.db,
  vaultCipherSha256:originalDigests.vault,
  works,
 };
 const signed=signedCensus(cbody,archiveSigner.privateKey);
 const external=(patch:Partial<R7019ECurrentExternalAuthority>={}):
  R7019ECurrentExternalAuthority=>({
   pinnedCensusSigner:archiveSigner.publicKey,
   pinnedDeletionSigner:deletionSigner.publicKey,
   signedDeletion:deletedCheckpoint([],[],22,deletionSigner.privateKey),
   independentMinimumDeletionGeneration:22,
   independentMinimumSnapshotGeneration:20,
   expectedMemberIds:[MEMBER],
   independentlyExpectedOwnedWorks:works,
   ...patch,
  });
 const request=(p:Partial<Parameters<typeof withHeldR7019EPreDecryptGate>[0]>={})=>
   ({archive,signedCensus:signed,external:external(),...p});
 const expectRefused=(label:string,code:string,
   custom:Parameters<typeof withHeldR7019EPreDecryptGate>[0])=>{
  let invoked=0,observed='';
  try{
   withHeldR7019EPreDecryptGate(custom,()=>{
    invoked++;return 'FICTIONAL WOULD OPEN RECOVERY KEY';
   });
  }catch(e){
   observed=(e && typeof e==='object' && 'code' in e)
     ?String((e as {code:unknown}).code):'no_code';
  }
  test(label,invoked===0&&observed===code);
 };
 expectRefused('currently_revoked_work_refused_before_recovery_key',
  'deleted_work_refused',request({
    external:external({signedDeletion:deletedCheckpoint(
      [WORK_A],[],22,deletionSigner.privateKey)}),
  }));
 expectRefused('current_deleted_encryption_key_refused_before_postgres',
  'deleted_key_refused',request({
    external:external({signedDeletion:deletedCheckpoint(
      [],[KEY_B],22,deletionSigner.privateKey)}),
  }));
 expectRefused('obsolete_cryptographically_valid_archive_refused',
  'stale_signed_backup_generation',request({
   external:external({independentMinimumSnapshotGeneration:21}),
  }));
 expectRefused('stale_signed_deletion_authority_refused',
  'current_independent_deletion_checkpoint_missing_or_stale',request({
   external:external({signedDeletion:deletedCheckpoint(
    [],[],21,deletionSigner.privateKey)}),
  }));
 expectRefused('wrong_valid_archive_signer_refused',
  'untrusted_work_census_signer',request({
    signedCensus:signedCensus(cbody,wrongSigner.privateKey),
  }));
 expectRefused('changed_encrypted_vault_refused',
  'untrusted_archive_manifest',request({
   archive:{...archive,vaultCiphertext:Buffer.concat([vaultBytes,Buffer.from('ALTER')])},
  }));
 const forgedManifest=Buffer.from(JSON.stringify({
   ...metadata,releaseApproved:true,
 }));
 expectRefused('forged_go_manifest_even_if_signed_again_refused',
  'untrusted_archive_manifest',request({
   archive:{...archive,manifest:forgedManifest},
   signedCensus:signedCensus({
     ...cbody,manifestSha256:sha(forgedManifest),
   },archiveSigner.privateKey),
  }));
 expectRefused('missing_independent_census_refused',
  'missing_independent_recovery_authority',request({
   external:external({independentlyExpectedOwnedWorks:[]}),
  }));
 expectRefused('signed_work_omission_refused_against_independent_census',
  'independent_work_census_mismatch',request({
   signedCensus:signedCensus({...cbody,works:[works[0]]},archiveSigner.privateKey),
  }));
 expectRefused('wrong_member_scope_refused',
  'foreign_or_missing_member_scope',request({
   external:external({expectedMemberIds:['22222222-2222-4222-8222-222222222222']}),
  }));
 expectRefused('missing_trusted_deletion_signer_refused',
  'missing_independent_recovery_authority',request({
   external:external({pinnedDeletionSigner:null as unknown as KeyObject}),
  }));
 delete process.env.R7019E_ERASURE_FIXTURE;
 try{
   expectRefused('missing_fixture_flag_never_runs_a_restore',
    'fixture_only_no_production_decrypt',request());
 }finally{process.env.R7019E_ERASURE_FIXTURE='fictional-only';}
 const reads={decryptionKeyReads:0,dockerRestores:0,callbackExecutions:0};
 const permitted=withHeldR7019EPreDecryptGate(request(),()=>{
  reads.callbackExecutions++;
  return {fictionalOnly:true,actualRestorePerformed:false};
 });
 test('surviving_unrevoked_snapshot_only_enters_explicit_fictional_callback',
  reads.callbackExecutions===1&&reads.decryptionKeyReads===0&&
  reads.dockerRestores===0&&
  permitted.permission.productionRestoreApproved===false&&
  permitted.permission.signedWorkCensusPhysicallyCompleteProven===false);
 test('original_ciphertext_untouched_by_readonly_erasure_preflight',
  sha(readFileSync(path.join(archiveDir,'database.pgdump.gpg')))===
   originalDigests.db&&
  sha(readFileSync(path.join(archiveDir,'vault.tar.gpg')))===
   originalDigests.vault);
 // Only counts and boolean facts are published. No Work IDs, signer private
 // keys, plaintext, signed checkpoints or arbitrary user text in receipts.
 const receipt={
  protocol:'soullab.ws.r70.19e.predecrypt-erasure-readonly.v1',
  status:'R7019E_FICTIONAL_SIGNED_OLD_POINT_ANTIRESURRECTION_PASS_BETA_HOLD',
  sourceHead:expectedHead,
  acceptedEncryptedGenerationVerified:true,
  checks,
  checksPassed:Object.values(checks).filter(Boolean).length,
  checksTotal:Object.keys(checks).length,
  testOnlyKeysGeneratedAndRetainedInMemory:true,
  noPrivateRecoveryKeyOrPGRestoreInvoked:
    reads.decryptionKeyReads===0&&reads.dockerRestores===0,
  actualUnderlyingDatabaseWorkCensusIndependentlyVerified:false,
  externalDeletionHighwaterProductionCertified:false,
  writerBetaReleaseApproved:false,
  productionRestoreApproved:false,
  originalCiphertextModified:false,
 };
 writeFileSync(path.join(evidenceDir,'R7019E_STALE_SIGNED_BACKUP_PREDECRYPT_HELD.json'),
  JSON.stringify(receipt,null,2)+'\n',{flag:'wx',mode:0o600});
 console.log(JSON.stringify({status:receipt.status,
   checksPassed:receipt.checksPassed,checksTotal:receipt.checksTotal,
   productionRestoreApproved:false,realMemberBetaApproved:false}));
}
try{main();}
catch(e){console.error('R7019E_FICTIONAL_VERIFICATION_HELD:',
  e instanceof Error?e.message:'unknown');process.exitCode=2;}
