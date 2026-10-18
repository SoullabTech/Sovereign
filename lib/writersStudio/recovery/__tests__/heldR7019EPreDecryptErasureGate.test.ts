import {createHash,generateKeyPairSync,sign} from 'node:crypto';
import {
  R7019E_PRODUCTION_DECRYPT_ADMISSION_ENABLED,
  R7019E_PRODUCTION_ANTIRESURRECTION_PROVEN,
  R7019E_CENSUS_PROTOCOL,
  canonicalR7019ECensus,
  assertHeldR7019EPreDecryptAdmission,
  withHeldR7019EPreDecryptGate,
  type R7019ESignedCensusBody,
  type R7019ECurrentExternalAuthority,
} from '../heldR7019EPreDecryptErasureGate';
import {
  canonicalDeletionPayload,
  type DeletionHighwaterV1,
} from '../deletionBarrierV1';

const archiveSigner=generateKeyPairSync('ed25519');
const deletionSigner=generateKeyPairSync('ed25519');
const attackerSigner=generateKeyPairSync('ed25519');
const M='11111111-1111-4111-8111-111111111111';
const WORK_A='306902ed-21a9-4c01-aa15-984755598218';
const WORK_B='4c0782ca-9074-43ee-9f3c-5f8500026780';
const KEY_A='3ac9b90d-8d79-44cf-bf3f-81376d8b7efe';
const KEY_B='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const head='8e7b183303036f09c0bc6fc7f4ef7e4f34bed7d4';
const sha=(v:Buffer)=>createHash('sha256').update(v).digest('hex');
const dbCipher=Buffer.from('FICTIONAL CIPHERTEXT WITNESS A');
const vaultCipher=Buffer.from('FICTIONAL CIPHERTEXT WITNESS B');
const fakeManifest=Buffer.from(JSON.stringify({
  protocol:'soullab.ws.r70.19c.fict-coherent-point.v1',
  head,generation:'16a01dab3c9e',
  sql:{name:'database.pgdump.gpg',sha256:sha(dbCipher),bytes:dbCipher.length},
  vault:{name:'vault.tar.gpg',sha256:sha(vaultCipher),bytes:vaultCipher.length},
  releaseApproved:false,offsiteKeyCustodyCertified:false,
  completeWriterCoverageCertified:false,
  externalErasureAuthorityVerified:false,
  sourceDatabaseVaultTransactionIsolated:true,
}));
const archive={
  sourceHead:head,generationNonce:'16a01dab3c9e',
  manifest:fakeManifest,
  postgresCiphertext:dbCipher,
  vaultCiphertext:vaultCipher,
};
const body=(patch:Partial<R7019ESignedCensusBody>={}):R7019ESignedCensusBody=>({
  protocol:R7019E_CENSUS_PROTOCOL,sourceHead:head,
  generationNonce:archive.generationNonce,
  snapshotGeneration:20,
  manifestSha256:sha(archive.manifest),
  dbCipherSha256:sha(archive.postgresCiphertext),
  vaultCipherSha256:sha(archive.vaultCiphertext),
  works:[
    {memberId:M,workId:WORK_A,keyId:KEY_A},
    {memberId:M,workId:WORK_B,keyId:KEY_B},
  ],...patch,
});
const signedCensus=(b=body(),signer=archiveSigner.privateKey)=>({
  body:b,signature:sign(null,canonicalR7019ECensus(b),signer).toString('base64'),
});
const highwater=(revokedWorks:string[]=[],revokedKeyIds:string[]=[],
  generation=22)=>{
  const checkpoint:DeletionHighwaterV1={
    protocol:'soullab.ws.deletion-highwater.v1',
    stream:'writers-studio-beta',generation,revokedWorks,revokedKeyIds,
  };
  return {
    checkpoint,
    signature:sign(null,canonicalDeletionPayload(checkpoint),
      deletionSigner.privateKey).toString('base64'),
  };
};
const authority=(patch:Partial<R7019ECurrentExternalAuthority>={}):
 R7019ECurrentExternalAuthority=>({
  pinnedCensusSigner:archiveSigner.publicKey,
  pinnedDeletionSigner:deletionSigner.publicKey,
  signedDeletion:highwater(),
  independentMinimumDeletionGeneration:22,
  independentMinimumSnapshotGeneration:20,
  expectedMemberIds:[M],
  independentlyExpectedOwnedWorks:body().works,
  ...patch,
});
const params=(external=authority(),census=signedCensus())=>
  ({archive,signedCensus:census,external});
const refusal=(input:ReturnType<typeof params>,code:string)=>{
  const decrypt=jest.fn(()=>'UNSAFE DECRYPT FICTIONAL');
  expect(()=>withHeldR7019EPreDecryptGate(input,decrypt)).toThrow(
    expect.objectContaining({code}),
  );
  expect(decrypt).not.toHaveBeenCalled();
};
const before=process.env.R7019E_ERASURE_FIXTURE;
beforeAll(()=>{process.env.R7019E_ERASURE_FIXTURE='fictional-only';});
afterAll(()=>{
  if(before===undefined)delete process.env.R7019E_ERASURE_FIXTURE;
  else process.env.R7019E_ERASURE_FIXTURE=before;
});

describe('R70.19E: actual current deletion authority before fictional decryptor',()=>{
  it('cannot become a production release flag even after a valid fixture witness',()=>{
    const op=jest.fn(()=>({fictionalRestored:true}));
    const proof=withHeldR7019EPreDecryptGate(params(),op);
    expect(op).toHaveBeenCalledTimes(1);
    expect(proof.result).toEqual({fictionalRestored:true});
    expect(proof.permission.witnessedWorks).toBe(2);
    expect(proof.permission.productionRestoreApproved).toBe(false);
    expect(proof.permission.realMemberAdmissionApproved).toBe(false);
    expect(proof.permission.signedWorkCensusPhysicallyCompleteProven).toBe(false);
    expect(R7019E_PRODUCTION_DECRYPT_ADMISSION_ENABLED).toBe(false);
    expect(R7019E_PRODUCTION_ANTIRESURRECTION_PROVEN).toBe(false);
  });

  it('an older correctly signed archive containing a now-deleted Work is refused pre-decrypt',()=>{
    refusal(params(authority({
      signedDeletion:highwater([WORK_A],[],22),
    })), 'deleted_work_refused');
  });
  it('separately revoked encryption key defeats restoring a still-listed Work',()=>{
    refusal(params(authority({signedDeletion:highwater([],[KEY_B],22)})),
      'deleted_key_refused');
  });
  it('a trusted newer minimum snapshot epoch defeats an older valid archive',()=>{
    refusal(params(authority({independentMinimumSnapshotGeneration:21})),
      'stale_signed_backup_generation');
  });
  it('a stale checkpoint cannot override an independent deletion high-water',()=>{
    refusal(params(authority({signedDeletion:highwater([],[],21)})),
      'current_independent_deletion_checkpoint_missing_or_stale');
  });
  it('the current deletion checkpoint must not come only from the restored archive',()=>{
    refusal(params(authority({signedDeletion:null as any})),
      'current_independent_deletion_checkpoint_missing_or_stale');
    refusal(params(authority({
      independentMinimumDeletionGeneration:0,
    })),'missing_independent_recovery_authority');
  });
  it('a census signature from another Ed25519 signer is never trusted',()=>{
    refusal(params(authority(),signedCensus(body(),attackerSigner.privateKey)),
      'untrusted_work_census_signer');
  });
  it('an altered signed census is refused even when the signed old archive is unchanged',()=>{
    const fake=signedCensus();
    const tampered={...fake,body:{...fake.body,snapshotGeneration:21}};
    refusal(params(authority(),tampered),'untrusted_work_census_signer');
  });
  it('ciphertext or manifest substitutions refuse before reading any private key',()=>{
    refusal({...params(),archive:{...archive,
      vaultCiphertext:Buffer.from('OTHER FICTIONAL CIPHER')}},'untrusted_archive_manifest');
    refusal({...params(),archive:{...archive,
      manifest:Buffer.from('REPLACED FICTIONAL MANIFEST')}},'untrusted_archive_manifest');
  });
  it('even a newly signed fake manifest claiming production GO remains refused',()=>{
    const forgedManifest=Buffer.from(JSON.stringify({
      ...JSON.parse(fakeManifest.toString('utf8')),
      releaseApproved:true,
    }));
    const forgedBody=body({manifestSha256:sha(forgedManifest)});
    refusal({...params(),archive:{...archive,manifest:forgedManifest},
      signedCensus:signedCensus(forgedBody)},'untrusted_archive_manifest');
  });
  it('member scope comes from reviewed external authority, not copied archive metadata',()=>{
    refusal(params(authority({
      expectedMemberIds:['22222222-2222-4222-8222-222222222222'],
    })),'foreign_or_missing_member_scope');
  });
  it('unaccounted, duplicate, or unsorted Works cannot be silently restored',()=>{
    expect(()=>canonicalR7019ECensus(body({works:[]})))
      .toThrow(expect.objectContaining({code:'untrusted_signed_work_census'}));
    expect(()=>canonicalR7019ECensus(body({works:[
      {memberId:M,workId:WORK_B,keyId:KEY_B},
      {memberId:M,workId:WORK_A,keyId:KEY_A},
    ]}))).toThrow(expect.objectContaining({
      code:'duplicate_unsorted_or_invalid_work_identity',
    }));
    expect(()=>canonicalR7019ECensus(body({works:[
      {memberId:M,workId:WORK_A,keyId:KEY_A},
      {memberId:M,workId:WORK_B,keyId:KEY_A},
    ]}))).toThrow(expect.objectContaining({
      code:'duplicate_unsorted_or_invalid_work_identity',
    }));
  });
  it('without an explicit fictional mode no callback may run',()=>{
    delete process.env.R7019E_ERASURE_FIXTURE;
    try{refusal(params(),'fixture_only_no_production_decrypt');}
    finally{process.env.R7019E_ERASURE_FIXTURE='fictional-only';}
  });
  it('a signed but OMITTED Work is refused against the independently expected full Work index',()=>{
    const partial=body({works:[{memberId:M,workId:WORK_A,keyId:KEY_A}]});
    refusal(params(authority(),signedCensus(partial)),
      'independent_work_census_mismatch');
  });
  it('absent or substituted external Work census cannot authorize reading the old ciphertext',()=>{
    refusal(params(authority({
      independentlyExpectedOwnedWorks:[],
    })),'missing_independent_recovery_authority');
    refusal(params(authority({
      independentlyExpectedOwnedWorks:[{memberId:M,workId:WORK_A,keyId:KEY_A}],
    })),'independent_work_census_mismatch');
  });
  it('a snapshot ahead of current signed deletion authority is refused',()=>{
    const future=body({snapshotGeneration:23});
    refusal(params(authority(),signedCensus(future)),'snapshot_ahead_of_checkpoint');
  });
});
