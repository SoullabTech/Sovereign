/**
 * R70.19E: FICTIONAL recovery pre-decrypt gate for signed Work census
 * and current externally witnessed deletion authority.
 *
 * HARD HOLD. The production Archive/Work index and deletion high-water
 * provider do not yet exist. This API cannot turn any archive into a
 * production-restorable/real-member-safe point. Its callback demonstrates
 * refusal BEFORE an isolated decryptor or PostgreSQL restore can be invoked.
 *
 * The archive's self-reported manifest or signed OLD ledger is NEVER the
 * authority for the CURRENT deletion generation.
 */
import {createHash,verify,type KeyObject} from 'node:crypto';
import {
  requireCurrentRestoreAuthorization,
  type SignedDeletionHighwaterV1,
} from './deletionBarrierV1';

export const R7019E_PRODUCTION_DECRYPT_ADMISSION_ENABLED=false as const;
export const R7019E_PRODUCTION_ANTIRESURRECTION_PROVEN=false as const;
export const R7019E_CENSUS_PROTOCOL='soullab.ws.r70.19e.signed-cipher-census.fixture.v1' as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const SHA=/^[a-f0-9]{64}$/;
const HEAD=/^[a-f0-9]{40}$/;
const NONCE=/^[a-f0-9]{12}$/;
const sha=(v:Buffer)=>createHash('sha256').update(v).digest('hex');
const integer=(x:unknown):x is number=>
  typeof x==='number'&&Number.isSafeInteger(x)&&x>=1;
export class R7019ERefusal extends Error{
  constructor(readonly code:string){
    super('r7019e_'+code);
    this.name='R7019ERefusal';
  }
}
const stop=(reason:string):never=>{throw new R7019ERefusal(reason);};

export type R7019ESignedCensusBody={
  readonly protocol:typeof R7019E_CENSUS_PROTOCOL;
  readonly sourceHead:string;
  readonly generationNonce:string;
  readonly snapshotGeneration:number;
  readonly manifestSha256:string;
  readonly dbCipherSha256:string;
  readonly vaultCipherSha256:string;
  readonly works:ReadonlyArray<{
    readonly memberId:string;
    readonly workId:string;
    readonly keyId:string;
  }>;
};
export type R7019ESignedCensus={
  readonly body:R7019ESignedCensusBody;
  readonly signature:string;
};
export type R7019ECurrentExternalAuthority={
  readonly pinnedCensusSigner:KeyObject;
  readonly pinnedDeletionSigner:KeyObject;
  readonly signedDeletion:SignedDeletionHighwaterV1;
  /** MUST be read from an independently governed, nonrollbackable store.
   * This is injected fictional evidence, never read from archive metadata. */
  readonly independentMinimumDeletionGeneration:number;
  /** Minimum acceptable snapshot epoch under an independently pinned ledger.
   * This must not be taken from the backup or a restored database. */
  readonly independentMinimumSnapshotGeneration:number;
  /** Reviewed external scope; a member ID from the archive is not trust. */
  readonly expectedMemberIds:readonly string[];
  /** Separately verified complete Work/key ownership census for this
   * recovery generation. Without an independent census, omitting a deleted
   * Work from the signed archive index could bypass the Work-level stop. */
  readonly independentlyExpectedOwnedWorks:ReadonlyArray<{
    readonly memberId:string;readonly workId:string;readonly keyId:string;
  }>;
};

function validateCensus(body:R7019ESignedCensusBody):void{
  if(body?.protocol!==R7019E_CENSUS_PROTOCOL||
     !HEAD.test(body.sourceHead)||!NONCE.test(body.generationNonce)||
     !integer(body.snapshotGeneration)||
     !SHA.test(body.manifestSha256)||!SHA.test(body.dbCipherSha256)||
     !SHA.test(body.vaultCipherSha256)||
     !Array.isArray(body.works)||body.works.length<1||
     body.works.length>1000)stop('untrusted_signed_work_census');
  let prev='';
  const keys=new Set<string>();
  for(const work of body.works){
    if(!work||!UUID.test(work.memberId)||
       !UUID.test(work.workId)||!UUID.test(work.keyId)||
       work.workId<=prev||keys.has(work.keyId))
      stop('duplicate_unsorted_or_invalid_work_identity');
    prev=work.workId;
    keys.add(work.keyId);
  }
}
/** Stable canonical signature bytes, never member writing and independent
 * of object-property order. This function is test-only signature prep. */
export function canonicalR7019ECensus(body:R7019ESignedCensusBody):Buffer{
  validateCensus(body);
  return Buffer.from(JSON.stringify([
    R7019E_CENSUS_PROTOCOL,body.sourceHead,body.generationNonce,
    body.snapshotGeneration,body.manifestSha256,body.dbCipherSha256,
    body.vaultCipherSha256,
    body.works.map(w=>[w.memberId,w.workId,w.keyId]),
  ]),'utf8');
}
function currentWitness(external:R7019ECurrentExternalAuthority):void{
  if(!external||!external.pinnedCensusSigner||
     !external.pinnedDeletionSigner||
     external.pinnedCensusSigner.asymmetricKeyType!=='ed25519'||
     external.pinnedDeletionSigner.asymmetricKeyType!=='ed25519'||
     !integer(external.independentMinimumDeletionGeneration)||
     !integer(external.independentMinimumSnapshotGeneration)||
     !Array.isArray(external.expectedMemberIds)||
     external.expectedMemberIds.length<1||
     external.expectedMemberIds.length>1000||
     !Array.isArray(external.independentlyExpectedOwnedWorks)||
     external.independentlyExpectedOwnedWorks.length<1||
     external.independentlyExpectedOwnedWorks.length>1000)
    stop('missing_independent_recovery_authority');
  const expected=external.expectedMemberIds;
  if(expected.some(x=>!UUID.test(x))||
     new Set(expected).size!==expected.length||
     expected.join('|')!==[...expected].sort().join('|'))
    stop('invalid_independently_expected_member_scope');
  let prev='';
  const seenKeys=new Set<string>();
  for(const work of external.independentlyExpectedOwnedWorks){
    if(!work||!UUID.test(work.memberId)||!UUID.test(work.workId)||
       !UUID.test(work.keyId)||work.workId<=prev||seenKeys.has(work.keyId))
      stop('invalid_independent_owned_work_index');
    prev=work.workId;
    seenKeys.add(work.keyId);
  }
}
function verifyCensusSignature(record:R7019ESignedCensus,trust:KeyObject):void{
  if(!record||typeof record.signature!=='string'||
     !/^[A-Za-z0-9+/]{86}==$/.test(record.signature))
    stop('missing_signed_work_census');
  const signature=Buffer.from(record.signature,'base64');
  if(signature.length!==64||signature.toString('base64')!==record.signature)
    stop('invalid_census_signature_encoding');
  const body=canonicalR7019ECensus(record.body);
  if(!verify(null,body,trust,signature))stop('untrusted_work_census_signer');
}
export type R7019EArchiveBytes={
  readonly sourceHead:string;
  readonly generationNonce:string;
  readonly manifest:Buffer;
  readonly postgresCiphertext:Buffer;
  readonly vaultCiphertext:Buffer;
};
export type R7019EHeldVerdict={
  readonly disposition:'R7019E_FICTIONAL_PREDECRYPT_AUTHORIZED_BETA_HOLD';
  readonly witnessedWorks:number;
  readonly snapshotGeneration:number;
  readonly currentDeletionGeneration:number;
  readonly productionRestoreApproved:false;
  readonly currentProductionDeletionAuthorityCertified:false;
  readonly signedWorkCensusPhysicallyCompleteProven:false;
  readonly realMemberAdmissionApproved:false;
};
/** Reads only already-encrypted bytes and the (not secret) manifest.
 * Refuses if externally pinned CURRENT deletion authority contradicts an
 * older signed archive census, BEFORE restoring or accessing decryption key.
 */
export function assertHeldR7019EPreDecryptAdmission(input:{
  readonly archive:R7019EArchiveBytes;
  readonly signedCensus:R7019ESignedCensus;
  readonly external:R7019ECurrentExternalAuthority;
}):R7019EHeldVerdict{
  if(R7019E_PRODUCTION_DECRYPT_ADMISSION_ENABLED!==false||
     process.env.NODE_ENV!=='test'||
     process.env.R7019E_ERASURE_FIXTURE!=='fictional-only')
    stop('fixture_only_no_production_decrypt');
  const {archive,signedCensus,external}=input||{};
  currentWitness(external);
  if(!archive||!Buffer.isBuffer(archive.manifest)||
     !Buffer.isBuffer(archive.postgresCiphertext)||
     !Buffer.isBuffer(archive.vaultCiphertext)||
     !HEAD.test(archive.sourceHead)||!NONCE.test(archive.generationNonce))
    stop('invalid_untrusted_archive');
  verifyCensusSignature(signedCensus,external.pinnedCensusSigner);
  const census=signedCensus.body;
  let manifest:Record<string,unknown>;
  try{
    const parsed:unknown=JSON.parse(archive.manifest.toString('utf8'));
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))
      stop('untrusted_archive_manifest');
    manifest=parsed as Record<string,unknown>;
  }catch(e){
    if(e instanceof R7019ERefusal)throw e;
    stop('untrusted_archive_manifest');
  }
  const sql=manifest.sql as Record<string,unknown>|undefined;
  const vault=manifest.vault as Record<string,unknown>|undefined;
  if(manifest.protocol!=='soullab.ws.r70.19c.fict-coherent-point.v1'||
     manifest.head!==archive.sourceHead||
     manifest.generation!==archive.generationNonce||
     manifest.releaseApproved!==false||
     manifest.offsiteKeyCustodyCertified!==false||
     manifest.completeWriterCoverageCertified!==false||
     manifest.externalErasureAuthorityVerified!==false||
     manifest.sourceDatabaseVaultTransactionIsolated!==true||
     !sql||sql.name!=='database.pgdump.gpg'||
     sql.sha256!==sha(archive.postgresCiphertext)||
     sql.bytes!==archive.postgresCiphertext.length||
     !vault||vault.name!=='vault.tar.gpg'||
     vault.sha256!==sha(archive.vaultCiphertext)||
     vault.bytes!==archive.vaultCiphertext.length)
    stop('untrusted_archive_manifest');
  if(census.sourceHead!==archive.sourceHead||
     census.generationNonce!==archive.generationNonce||
     census.manifestSha256!==sha(archive.manifest)||
     census.dbCipherSha256!==sha(archive.postgresCiphertext)||
     census.vaultCipherSha256!==sha(archive.vaultCiphertext))
    stop('source_or_ciphertext_census_mismatch');
  if(census.snapshotGeneration<external.independentMinimumSnapshotGeneration)
    stop('stale_signed_backup_generation');
  const seenMembers=[...new Set(census.works.map(x=>x.memberId))].sort();
  if(seenMembers.join('|')!==external.expectedMemberIds.join('|'))
    stop('foreign_or_missing_member_scope');
  const signedWorkIds=census.works.map(w=>[w.memberId,w.workId,w.keyId]);
  const independentWorkIds=external.independentlyExpectedOwnedWorks.map(
    w=>[w.memberId,w.workId,w.keyId]);
  if(JSON.stringify(signedWorkIds)!==JSON.stringify(independentWorkIds))
    stop('independent_work_census_mismatch');
  if(!external.signedDeletion||
     external.signedDeletion.checkpoint.generation!==
       external.independentMinimumDeletionGeneration)
    stop('current_independent_deletion_checkpoint_missing_or_stale');
  for(const work of census.works){
    requireCurrentRestoreAuthorization({
      request:{
        workId:work.workId,keyId:work.keyId,
        snapshotGeneration:census.snapshotGeneration,
      },
      signed:external.signedDeletion,
      trustedSigner:external.pinnedDeletionSigner,
      independent:{
        minimumGeneration:external.independentMinimumDeletionGeneration,
      },
    });
  }
  return Object.freeze({
    disposition:'R7019E_FICTIONAL_PREDECRYPT_AUTHORIZED_BETA_HOLD',
    witnessedWorks:census.works.length,
    snapshotGeneration:census.snapshotGeneration,
    currentDeletionGeneration:external.independentMinimumDeletionGeneration,
    productionRestoreApproved:false,
    currentProductionDeletionAuthorityCertified:false,
    signedWorkCensusPhysicallyCompleteProven:false,
    realMemberAdmissionApproved:false,
  });
}
/** The ONLY R70.19E demonstration path to a fictional "decrypt/restore"
 * callback. All preflight refusals happen before callback execution.
 * This is not integrated with any real production restore executable.
 */
export function withHeldR7019EPreDecryptGate<T>(
  input:Parameters<typeof assertHeldR7019EPreDecryptAdmission>[0],
  restoreFictional:()=>T,
):{readonly result:T;readonly permission:R7019EHeldVerdict}{
  const permission=assertHeldR7019EPreDecryptAdmission(input);
  if(typeof restoreFictional!=='function')stop('missing_fictional_restore');
  return {result:restoreFictional(),permission};
}
