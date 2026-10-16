import { createHash, generateKeyPairSync, randomBytes, randomUUID, sign } from 'node:crypto';
import { sealPendingArrival, type PendingSourceV1 } from '../pendingArrivalEnvelopeV1';
import { canonicalClaimedArrivalPayload, prepareClaimedArrivalRewrap,
  type ClaimedArrivalReceiptV1 } from '../pendingClaimTransferV1';
import { openWorkSnapshot } from '../workEnvelopeV1';

const memberId='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const foreignMember='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const arrivalId='306902ed-21a9-4c01-aa15-984755598218';
const manuscriptId='4c0782ca-9074-43ee-9f3c-5f8500026780';
const otherManuscript='4c0782ca-9074-43ee-9f3c-5f8500026781';
const authority={memberId,arrivalId,generation:4};
const sourceText=Buffer.from('This fictional paragraph is not a real client file.\n','utf8');
const artifact=Buffer.from([0x50,0x4b,0x03,0x04,0,0xee,0x81]);
const source:PendingSourceV1={kind:'artifact_extraction',sourceText,originalBytes:artifact,
  originalFilename:'fictitious-book.docx',
  mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
const pair=generateKeyPairSync('ed25519');
const wrongPair=generateKeyPairSync('ed25519');
const digest=(x:Buffer)=>createHash('sha256').update(x).digest('hex');
const key=()=>({keyId:randomUUID(),keyBytes:randomBytes(32)});
const receipt=(change:Partial<ClaimedArrivalReceiptV1>={}):ClaimedArrivalReceiptV1=>({
  protocol:'soullab.ws.pending-claim-transfer.v1',status:'claim_committed',
  claimId:randomUUID(),memberId,arrivalId,manuscriptId,
  pendingGeneration:4,manuscriptGeneration:5,claimEpoch:9,
  sourceKind:'artifact_extraction',sourceTextDigest:digest(sourceText),
  originalDigest:digest(artifact),...change,
});
function setup(options:{
  claim?:Partial<ClaimedArrivalReceiptV1>;
  source?:PendingSourceV1;
  claimSigner?:typeof pair.privateKey;
  trustedSigner?:typeof pair.publicKey|null;
  minimum?:number|null;
  pendingKey?:ReturnType<typeof key>;
  workKey?:ReturnType<typeof key>;
}={}) {
  const pk=options.pendingKey||key(),wk=options.workKey||key();
  const data=options.source||source;
  const pending=sealPendingArrival(authority,data,pk);
  const claim=receipt(options.claim);
  const signed={claim,signature:sign(null,canonicalClaimedArrivalPayload(claim),
    options.claimSigner||pair.privateKey).toString('base64')};
  const invoke=()=>prepareClaimedArrivalRewrap({
    pendingAuthority:authority,pendingEnvelope:pending,pendingKey:pk,workKey:wk,
    signedClaim:signed,trustedClaimSigner:options.trustedSigner===undefined?pair.publicKey:options.trustedSigner,
    trustedClaimEpoch:options.minimum===undefined?9:options.minimum,
  });
  return {invoke,pk,wk,signed,pending,claim};
}
const refuses=(cb:()=>unknown,code:string)=>expect(cb).toThrow(expect.objectContaining({code}));

describe('R12 signed pending-to-manuscript rewrap stays PREPARED and requires independent trust',()=>{
  it('rewraps fictional exact original bytes to a distinct manuscript-owned Work key',()=>{
    const x=setup();
    const result=x.invoke();
    expect(result.transitionStatus).toBe('PREPARED_ONLY_NOT_PERSISTED');
    expect(result.pendingKeyRetirement).toBe('REQUIRED_NOT_WITNESSED');
    expect(result.pendingFileErasure).toBe('REQUIRED_NOT_WITNESSED');
    expect(result.metadataCoverage).toBe('ORIGINAL_FILENAME_AND_MIME_NOT_CERTIFIED');
    expect(result.destinationManuscriptId).toBe(manuscriptId);
    expect(result.sealedWork.keyId).toBe(x.wk.keyId);
    expect(result.sealedWork.keyId).not.toBe(x.pk.keyId);
    expect(JSON.stringify(result)).not.toContain('This fictional paragraph');
    const rows=openWorkSnapshot({memberId,workId:manuscriptId,generation:5},result.sealedWork,x.wk);
    expect(rows.map(r=>r.field)).toEqual([
      'manuscript_source_arrivals.source_text','original_source.bytes',
    ]);
    expect(rows[0].value).toEqual(sourceText);
    expect(rows[1].value).toEqual(artifact);
    expect(rows.every(r=>r.recordId===arrivalId)).toBe(true);
  });
  it('never authorizes restore under an unrelated manuscript identity',()=>{
    const x=setup();const out=x.invoke();
    refuses(()=>openWorkSnapshot({memberId,workId:otherManuscript,generation:5},out.sealedWork,x.wk),
      'work_envelope_authentication_failed');
  });
  it('refuses a missing signer, a missing trusted external epoch, and a stale one',()=>{
    refuses(setup({trustedSigner:null}).invoke,'missing_independent_claim_authority');
    refuses(setup({minimum:null}).invoke,'missing_independent_claim_authority');
    refuses(setup({minimum:10}).invoke,'stale_claim_commit_epoch');
  });
  it('refuses claim signer substitution and bad signatures',()=>{
    refuses(setup({trustedSigner:wrongPair.publicKey}).invoke,'claim_signature_invalid');
    const x=setup();
    x.signed.signature='not-signature';
    refuses(x.invoke,'invalid_claim_signature');
  });
  it('refuses modified signed claim identity even if the signature was valid for the old record',()=>{
    const x=setup();x.signed.claim={...x.claim,manuscriptId:otherManuscript};
    refuses(x.invoke,'claim_signature_invalid');
  });
  it('refuses a validly signed foreign-member or different arrival claim',()=>{
    refuses(setup({claim:{memberId:foreignMember}}).invoke,'claim_pending_identity_mismatch');
    refuses(setup({claim:{arrivalId:otherManuscript}}).invoke,'claim_pending_identity_mismatch');
    refuses(setup({claim:{pendingGeneration:5}}).invoke,'claim_pending_identity_mismatch');
  });
  it('refuses valid signed receipts with incorrect fictional source digest or file digest',()=>{
    refuses(setup({claim:{sourceTextDigest:'a'.repeat(64)}}).invoke,'claim_source_bytes_differ');
    refuses(setup({claim:{originalDigest:'b'.repeat(64)}}).invoke,'claim_source_bytes_differ');
  });
  it('never reuses the pending key as the manuscript key even under another identifier',()=>{
    const k=key();
    refuses(setup({pendingKey:k,workKey:k}).invoke,'pending_key_must_not_be_work_key');
    refuses(setup({pendingKey:k,workKey:{keyId:randomUUID(),keyBytes:Buffer.from(k.keyBytes)}}).invoke,
      'pending_key_must_not_be_work_key');
  });
  it('refuses a receipt that claims the source is already a different kind',()=>{
    refuses(setup({claim:{sourceKind:'member_supplied_text',originalDigest:null}}).invoke,
      'claim_source_bytes_differ');
  });
  it('a confirmed paste transfers only text, without an invented original file',()=>{
    const pasted:PendingSourceV1={kind:'member_supplied_text',
      sourceText,originalBytes:null,originalFilename:null,mimeType:null};
    const x=setup({source:pasted,claim:{sourceKind:'member_supplied_text',originalDigest:null}});
    const out=x.invoke();
    expect(out.pendingFileErasure).toBe('NOT_APPLICABLE_PASTE');
    expect(out.metadataCoverage).toBe('ORIGINAL_FILENAME_AND_MIME_NOT_CERTIFIED');
    const records=openWorkSnapshot({memberId,workId:manuscriptId,generation:5},out.sealedWork,x.wk);
    expect(records).toHaveLength(1);
    expect(records[0].value).toEqual(sourceText);
  });
  it('refuses a receipt that is not an independently committed claim',()=>{
    refuses(()=>canonicalClaimedArrivalPayload(receipt({status:'uncommitted' as ClaimedArrivalReceiptV1['status']})),
      'untrusted_claim_receipt');
  });
});
