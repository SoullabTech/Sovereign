import { createHash, generateKeyPairSync, randomBytes, randomUUID, sign } from 'node:crypto';
import {
  preparePairedOriginalV2,openPairedOriginalV2,
  R14_REAL_MEMBER_ORIGINAL_CUSTODY_ENABLED,
  type PairedOriginalPackageV2,
} from '../pairedOriginalCustodyV2';
import { sealPendingArrival, type PendingSourceV1 } from '../pendingArrivalEnvelopeV1';
import { openWorkSnapshot, type SealedWorkV1 } from '../workEnvelopeV1';
import {
  canonicalClaimedArrivalPayload, type ClaimedArrivalReceiptV1,
} from '../pendingClaimTransferV1';
import {
  canonicalOriginalProvenanceV2,sha256Exact,type OriginalProvenanceV2,
} from '../originalProvenanceV2';
import { canonicalDeletionPayload,type DeletionHighwaterV1 } from '../deletionBarrierV1';

const claimPair=generateKeyPairSync('ed25519');
const provenancePair=generateKeyPairSync('ed25519');
const deletionPair=generateKeyPairSync('ed25519');
const outsider=generateKeyPairSync('ed25519');
const A='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const B='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const ARR='306902ed-21a9-4c01-aa15-984755598218';
const WORK='4c0782ca-9074-43ee-9f3c-5f8500026780';
const OTHER='4c0782ca-9074-43ee-9f3c-5f8500026781';
const text=Buffer.from('A paper lantern in a purely fictional orchard\r\në\0','utf8');
const bytes=Buffer.from([0x50,0x4b,0x03,0x04,0,0xfe,0xff,10,0,6]);
const createKey=()=>({keyId:randomUUID(),keyBytes:randomBytes(32)});
const source:PendingSourceV1={
 kind:'artifact_extraction',sourceText:text,originalBytes:bytes,
 originalFilename:'Private Fictional Manuscript ✦.docx',
 mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const refuse=(f:()=>unknown,code:string)=>expect(f).toThrow(expect.objectContaining({code}));
function fixture(opts:{memberId?:string;workId?:string;source?:PendingSourceV1}={}) {
  const memberId=opts.memberId||A,manuscriptId=opts.workId||WORK;
  const sample=opts.source||source;
  const claim:ClaimedArrivalReceiptV1={
    protocol:'soullab.ws.pending-claim-transfer.v1',status:'claim_committed',
    claimId:randomUUID(),memberId,arrivalId:ARR,manuscriptId,
    pendingGeneration:4,manuscriptGeneration:5,claimEpoch:12,
    sourceKind:sample.kind,sourceTextDigest:sha256Exact(sample.sourceText),
    originalDigest:sample.originalBytes?sha256Exact(sample.originalBytes):null,
  };
  const signedClaim={claim,signature:sign(null,canonicalClaimedArrivalPayload(claim),claimPair.privateKey)
    .toString('base64')};
  const origin:OriginalProvenanceV2={
    protocol:'soullab.ws.original-provenance.v2',
    claimId:claim.claimId,memberId,arrivalId:ARR,manuscriptId,receiptEpoch:13,
    sourceKind:sample.kind,sourceTextSha256:claim.sourceTextDigest,
    sourceTextBytes:sample.sourceText.length,
    originalSha256:claim.originalDigest,
    originalByteLength:sample.originalBytes?.length??null,
    originalFilename:sample.originalFilename,mimeType:sample.mimeType,
    extractionMethod:sample.kind==='artifact_extraction'?'synthetic-docx-mammoth':'member-supplied',
    extractorVersion:sample.kind==='artifact_extraction'?'fictional-1.0':'n/a',
  };
  const signedProvenance={provenance:origin,signature:sign(null,canonicalOriginalProvenanceV2(origin),
    provenancePair.privateKey).toString('base64')};
  const pendingAuthority={memberId,arrivalId:ARR,generation:4};
  const pendingKey=createKey(),workKey=createKey();
  const pendingEnvelope=sealPendingArrival(pendingAuthority,sample,pendingKey);
  const input={
    pendingAuthority,pendingEnvelope,pendingKey,workKey,signedClaim,
    trustedClaimSigner:claimPair.publicKey,independentClaimMinimumEpoch:12,
    signedProvenance,trustedProvenanceSigner:provenancePair.publicKey,
    independentProvenanceMinimumEpoch:13,
  };
  const highwater=(overrides:Partial<DeletionHighwaterV1>={})=>{
    const checkpoint:DeletionHighwaterV1={
      protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
      generation:20,revokedWorks:[],revokedKeyIds:[],...overrides,
    };
    return {checkpoint,signature:sign(null,canonicalDeletionPayload(checkpoint),
      deletionPair.privateKey).toString('base64')};
  };
  const read=(pack:PairedOriginalPackageV2,overrides:Record<string,unknown>={})=>
    openPairedOriginalV2({
      package:pack,workKey,signedClaim,trustedClaimSigner:claimPair.publicKey,
      independentClaimMinimumEpoch:12,trustedProvenanceSigner:provenancePair.publicKey,
      independentProvenanceMinimumEpoch:13,signedDeletionHighwater:highwater(),
      trustedDeletionSigner:deletionPair.publicKey,
      independentDeletionGeneration:{minimumGeneration:20},
      ...overrides,
    });
  return {input,claim,signedClaim,origin,source:sample,workKey,read,highwater};
}
function digestPair(x:PairedOriginalPackageV2):PairedOriginalPackageV2 {
 const workDigest=createHash('sha256').update(JSON.stringify(x.work)).digest('hex');
 const provenanceDigest=createHash('sha256').update(JSON.stringify(x.provenance)).digest('hex');
 const pairDigest=createHash('sha256').update(JSON.stringify([x.protocol,workDigest,provenanceDigest])).digest('hex');
 return {...x,workDigest,provenanceDigest,pairDigest};
}

describe('R14 encrypted paired original provenance (fictional)',()=>{
  it('roundtrips full signed original provenance and immutable Source bytes without plaintext metadata outside ciphertext',()=>{
    const x=fixture(),prepared=preparePairedOriginalV2(x.input);
    expect(R14_REAL_MEMBER_ORIGINAL_CUSTODY_ENABLED).toBe(false);
    expect(prepared.transitionStatus).toBe('PREPARED_ONLY_NOT_PERSISTED');
    expect(prepared.pendingKeyRetirement).toBe('NOT_WITNESSED');
    expect(prepared.pendingFileErasure).toBe('NOT_WITNESSED');
    expect(prepared.sourceAndWorkBackupCensus).toBe('NOT_CERTIFIED');
    expect(prepared.encryptedMetadataCoverage).toBe('FILENAME_MIME_EXTRACTOR_AND_HASHES_ENCRYPTED');
    const exported=JSON.stringify(prepared.package);
    for(const forbidden of ['Private Fictional Manuscript','synthetic-docx-mammoth','paper lantern',A,ARR,WORK]){
      expect(exported).not.toContain(forbidden);
    }
    const recovered=x.read(prepared.package);
    expect(recovered.sourceText).toEqual(text);
    expect(recovered.originalBytes).toEqual(bytes);
    expect(recovered.provenance).toEqual(x.origin);
    expect(recovered.provenance.originalFilename).toBe(source.originalFilename);
    expect(recovered.provenance.mimeType).toBe(source.mimeType);
    expect(recovered.provenance.extractorVersion).toBe('fictional-1.0');
  });

  it('an older single-Work reader cannot mistake a two-part R14 package for complete original custody',()=>{
    const x=fixture(),paired=preparePairedOriginalV2(x.input).package;
    refuse(()=>openWorkSnapshot({memberId:A,workId:WORK,generation:5},
      paired as unknown as SealedWorkV1,x.workKey), 'unsupported_work_envelope');
    // Extracting paired.work alone would lose file provenance; rolling back
    // to an old reader therefore requires explicit compatibility acceptance.
    expect(paired.provenanceDigest).toMatch(/^[a-f0-9]{64}$/);
  });

  it('a confirmed paste has no fake original file, filename or MIME',()=>{
    const pasted:PendingSourceV1={kind:'member_supplied_text',sourceText:Buffer.from('Only fictional typed words.\n'),
      originalBytes:null,originalFilename:null,mimeType:null};
    const x=fixture({source:pasted}),paired=preparePairedOriginalV2(x.input);
    const output=x.read(paired.package);
    expect(output.sourceText).toEqual(pasted.sourceText);
    expect(output.originalBytes).toBeNull();
    expect(output.provenance.originalFilename).toBeNull();
    expect(output.provenance.originalByteLength).toBeNull();
  });

  it('no independent deletion authority means no decrypted text or private filename',()=>{
    const x=fixture(),pair=preparePairedOriginalV2(x.input).package;
    refuse(()=>x.read(pair,{trustedDeletionSigner:null}),'untrusted_deletion_checkpoint');
    refuse(()=>x.read(pair,{independentDeletionGeneration:null}),'untrusted_deletion_checkpoint');
    refuse(()=>x.read(pair,{signedDeletionHighwater:null}),'untrusted_deletion_checkpoint');
  });

  it('a signed deleted-Work checkpoint refuses even an old intact and globally decryptable pair',()=>{
    const x=fixture(),pair=preparePairedOriginalV2(x.input).package;
    refuse(()=>x.read(pair,{signedDeletionHighwater:x.highwater({revokedWorks:[WORK]})}),
      'deleted_work_refused');
    refuse(()=>x.read(pair,{signedDeletionHighwater:x.highwater({revokedKeyIds:[x.workKey.keyId]})}),
      'deleted_key_refused');
  });

  it('old valid deletion signature is refused by independent newer checkpoint minimum',()=>{
    const x=fixture(),pair=preparePairedOriginalV2(x.input).package;
    refuse(()=>x.read(pair,{signedDeletionHighwater:x.highwater({generation:19})}),
      'stale_deletion_checkpoint');
  });

  it('rejects Work ciphertext swapped from a different signed manuscript package',()=>{
    const a=fixture(),b=fixture({workId:OTHER}),left=preparePairedOriginalV2(a.input).package,
      right=preparePairedOriginalV2({...b.input,workKey:a.workKey}).package;
    refuse(()=>a.read({...left,work:right.work}), 'paired_package_integrity_mismatch');
    refuse(()=>a.read(digestPair({...left,work:right.work})), 'work_envelope_authentication_failed');
  });

  it('rejects swapped original provenance even when the attacker recomputes untrusted manifest hashes',()=>{
    const a=fixture(),b=fixture(),left=preparePairedOriginalV2(a.input).package,
      right=preparePairedOriginalV2(b.input).package;
    refuse(()=>a.read({...left,provenance:right.provenance}), 'paired_package_integrity_mismatch');
    refuse(()=>a.read(digestPair({...left,provenance:right.provenance})),
      'unsupported_paired_provenance');
  });

  it('wrong claimant signer or provenance signer cannot authorize restoration',()=>{
    const x=fixture(),pack=preparePairedOriginalV2(x.input).package;
    refuse(()=>x.read(pack,{trustedClaimSigner:outsider.publicKey}), 'invalid_signed_claim');
    refuse(()=>x.read(pack,{trustedProvenanceSigner:outsider.publicKey}),
      'provenance_signature_invalid');
  });

  it('rejects independent claim/provenance epoch rollbacks',()=>{
    const x=fixture(),pack=preparePairedOriginalV2(x.input).package;
    refuse(()=>x.read(pack,{independentClaimMinimumEpoch:15}), 'stale_claim_witness');
    refuse(()=>x.read(pack,{independentProvenanceMinimumEpoch:15}),
      'stale_provenance_receipt');
  });

  it('refuses private metadata changing without the signed source claim issuer',()=>{
    const x=fixture();
    const modified={...x.input,signedProvenance:{
      ...x.input.signedProvenance,provenance:{
        ...x.input.signedProvenance.provenance,originalFilename:'unexpected.docx',
      },
    }};
    refuse(()=>preparePairedOriginalV2(modified),'provenance_signature_invalid');
  });

  it('refuses a second claimant identity even with the original paired encryption key',()=>{
    const a=fixture(),packageA=preparePairedOriginalV2(a.input).package;
    const b=fixture({memberId:B});
    refuse(()=>a.read(packageA,{signedClaim:b.signedClaim}), 'work_envelope_authentication_failed');
  });

  it('refuses invalid cipher encoding, incorrect key and unreviewed package shape',()=>{
    const x=fixture(),packageA=preparePairedOriginalV2(x.input).package;
    refuse(()=>x.read({...packageA,protocol:'legacy' as typeof packageA.protocol}),
      'unsupported_paired_source_package');
    refuse(()=>x.read(digestPair({...packageA,
      provenance:{...packageA.provenance,nonce:'not-b64'}})),
      'invalid_paired_cipher_encoding');
    refuse(()=>x.read(packageA,{workKey:{...x.workKey,keyBytes:randomBytes(32)}}),
      'work_envelope_authentication_failed');
  });

  it('refuses any unreviewed plaintext metadata added to nested encrypted envelopes',()=>{
    const x=fixture(),pack=preparePairedOriginalV2(x.input).package;
    const work={...pack.work,originalFilename:'unreviewed-visible-name.docx'};
    refuse(()=>x.read(digestPair({...pack,work} as PairedOriginalPackageV2)),
      'unreviewed_plaintext_envelope_field');
    const provenance={...pack.provenance,extractedText:'unreviewed-plaintext'};
    refuse(()=>x.read(digestPair({...pack,provenance} as PairedOriginalPackageV2)),
      'unreviewed_plaintext_envelope_field');
  });

  it('cannot prepare with missing provenance signer or a mismatched filename approved by a signer',()=>{
    const x=fixture();
    refuse(()=>preparePairedOriginalV2({...x.input,trustedProvenanceSigner:null}),
      'missing_independent_provenance_authority');
    const changed={...x.origin,originalFilename:'different-name.docx'};
    const fresh={provenance:changed,signature:sign(null,
      canonicalOriginalProvenanceV2(changed),provenancePair.privateKey).toString('base64')};
    refuse(()=>preparePairedOriginalV2({...x.input,signedProvenance:fresh}),
      'provenance_does_not_match_original');
  });
});
