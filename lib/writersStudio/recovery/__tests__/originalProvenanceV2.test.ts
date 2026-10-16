import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import {
  canonicalOriginalProvenanceV2,verifySignedOriginalProvenanceV2,sha256Exact,
  type OriginalProvenanceV2,
} from '../originalProvenanceV2';
import type { ClaimedArrivalReceiptV1 } from '../pendingClaimTransferV1';
import type { PendingSourceV1 } from '../pendingArrivalEnvelopeV1';

const memberId='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const arrivalId='306902ed-21a9-4c01-aa15-984755598218';
const manuscriptId='4c0782ca-9074-43ee-9f3c-5f8500026780';
const claimId='d3a75cd8-40cc-4fe2-a15e-437ce4ca2c58';
const sourceText=Buffer.from('Fictional original — café\r\n\0next passage\n','utf8');
const originalBytes=Buffer.from([0x50,0x4b,0x03,0x04,0xff,0x00,0x2f]);
const pending: PendingSourceV1 = {
 kind:'artifact_extraction',sourceText,originalBytes,
 originalFilename:'Revised — café 2026 ✦.docx',
 mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const claim: ClaimedArrivalReceiptV1 = {
 protocol:'soullab.ws.pending-claim-transfer.v1',status:'claim_committed',
 claimId,memberId,arrivalId,manuscriptId,
 pendingGeneration:4,manuscriptGeneration:5,claimEpoch:11,
 sourceKind:'artifact_extraction',
 sourceTextDigest:sha256Exact(sourceText),originalDigest:sha256Exact(originalBytes),
};
const provenance = (overrides: Partial<OriginalProvenanceV2>={}): OriginalProvenanceV2 => ({
 protocol:'soullab.ws.original-provenance.v2',claimId,memberId,arrivalId,manuscriptId,
 receiptEpoch:12,sourceKind:'artifact_extraction',
 sourceTextSha256:claim.sourceTextDigest,sourceTextBytes:sourceText.length,
 originalSha256:claim.originalDigest,originalByteLength:originalBytes.length,
 originalFilename:pending.originalFilename,mimeType:pending.mimeType,
 extractionMethod:'fictional-docx-extraction',extractorVersion:'test-v1',
 ...overrides,
});
const pair=generateKeyPairSync('ed25519'),foreign=generateKeyPairSync('ed25519');
const signed=(p=provenance())=>({
 provenance:p,signature:sign(null,canonicalOriginalProvenanceV2(p),pair.privateKey).toString('base64'),
});
const accepted=(p=provenance(),override:Partial<Parameters<typeof verifySignedOriginalProvenanceV2>[0]>={})=>
 verifySignedOriginalProvenanceV2({
  signed:signed(p),trustedSigner:pair.publicKey,independentMinimumEpoch:12,
  committedClaim:claim,decryptedPending:pending,...override,
 });
const refuses=(f:()=>unknown,code:string)=>expect(f).toThrow(expect.objectContaining({code}));

describe('R14 signed exact original provenance (fictional) — no live signers',()=>{
 it('preserves exact original filename, MIME, extract method/version, binary hash and byte lengths',()=>{
   const actual=accepted();
   expect(actual).toEqual(provenance());
   expect(actual.originalFilename).toBe('Revised — café 2026 ✦.docx');
   expect(actual.sourceTextBytes).toBe(Buffer.byteLength(sourceText));
   expect(actual.originalByteLength).toBe(originalBytes.length);
 });
 it('rejects altered original filename even with unchanged Source bytes',()=>{
   refuses(()=>accepted(provenance({originalFilename:'renamed.docx'})),
     'provenance_does_not_match_original');
 });
 it('rejects altered MIME or source byte length even if the member and file hash match',()=>{
   refuses(()=>accepted(provenance({mimeType:'application/pdf'})),
     'provenance_does_not_match_original');
   refuses(()=>accepted(provenance({sourceTextBytes:sourceText.length+1})),
     'provenance_does_not_match_original');
 });
 it('rejects wrong member, Work or arrival and stale provenance epoch',()=>{
   refuses(()=>accepted(provenance({memberId:'5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205'})),
     'provenance_claim_identity_mismatch');
   refuses(()=>accepted(provenance({manuscriptId:'4c0782ca-9074-43ee-9f3c-5f8500026781'})),
     'provenance_claim_identity_mismatch');
   refuses(()=>accepted(provenance({arrivalId:'306902ed-21a9-4c01-aa15-984755598219'})),
     'provenance_claim_identity_mismatch');
   refuses(()=>accepted(provenance({receiptEpoch:11})), 'stale_provenance_receipt');
 });
 it('rejects tampered signature or different signer',()=>{
   const original=signed();original.provenance={...original.provenance,originalFilename:'renamed.docx'};
   refuses(()=>verifySignedOriginalProvenanceV2({
     signed:original,trustedSigner:pair.publicKey,
     independentMinimumEpoch:12,committedClaim:claim,decryptedPending:pending,
   }), 'provenance_signature_invalid');
   refuses(()=>accepted(provenance(),{trustedSigner:foreign.publicKey}),
     'provenance_signature_invalid');
 });
 it('requires independently supplied signer and nonrollbackable minimum epoch',()=>{
   refuses(()=>accepted(provenance(),{trustedSigner:null}), 'missing_independent_provenance_authority');
   refuses(()=>accepted(provenance(),{independentMinimumEpoch:null}),
     'missing_independent_provenance_authority');
 });
 it('rejects metadata fields not included in the signed canonical contract',()=>{
   refuses(()=>canonicalOriginalProvenanceV2({
     ...provenance(),unsafeAdditionalDescription:'invisible' } as unknown as OriginalProvenanceV2),
   'unsupported_original_provenance');
 });
 it('rejects missing file hash, original byte length or filename',()=>{
   refuses(()=>canonicalOriginalProvenanceV2(provenance({originalSha256:null})),
     'invalid_provenance_digest');
   refuses(()=>canonicalOriginalProvenanceV2(provenance({originalByteLength:0})),
     'invalid_provenance_length_or_epoch');
   refuses(()=>canonicalOriginalProvenanceV2(provenance({originalFilename:null})),
     'invalid_provenance_text');
 });
 it('preserves a confirmed paste with NO invented original, filename or MIME',()=>{
   const text=Buffer.from('Synthetic paste with CRLF\r\n','utf8');
   const paste:PendingSourceV1={kind:'member_supplied_text',sourceText:text,
     originalBytes:null,originalFilename:null,mimeType:null};
   const pasteClaim={...claim,sourceKind:'member_supplied_text' as const,
     originalDigest:null,sourceTextDigest:sha256Exact(text)};
   const meta=provenance({sourceKind:'member_supplied_text',sourceTextSha256:sha256Exact(text),
     sourceTextBytes:text.length,originalSha256:null,originalByteLength:null,
     originalFilename:null,mimeType:null,extractionMethod:'member-supplied',
     extractorVersion:'n/a'});
   expect(verifySignedOriginalProvenanceV2({signed:signed(meta),trustedSigner:pair.publicKey,
     independentMinimumEpoch:12,committedClaim:pasteClaim,decryptedPending:paste})).toEqual(meta);
   refuses(()=>canonicalOriginalProvenanceV2({...meta,originalFilename:'invented.docx'}),
     'pasted_source_invented_original');
   refuses(()=>canonicalOriginalProvenanceV2({...meta,extractionMethod:'mammoth-convertToMarkdown'}),
     'invented_paste_extractor');
   refuses(()=>canonicalOriginalProvenanceV2(provenance({extractionMethod:'member-supplied'})),
     'file_cannot_claim_member_paste');
 });
 it('uses exact bytes instead of trimming/normalizing text before hashing',()=>{
   expect(sha256Exact(sourceText)).not.toBe(sha256Exact(Buffer.from(sourceText.toString().replaceAll('\r\n','\n'))));
   expect(sha256Exact(Buffer.from('café'))).not.toBe(sha256Exact(Buffer.from('cafe\u0301')));
 });
});
