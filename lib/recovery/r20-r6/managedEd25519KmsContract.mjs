/**
 * R20-R6 — AWS KMS ED25519_SHA_512 RAW protocol adapter, REVIEW-ONLY.
 *
 * This module performs NO network I/O and has NO credentials or private keys.
 * Production role issuance, KMS policy, real member authorization, ledger
 * externalization and cross-provider monotonicity remain unimplemented.
 *
 * AWS KMS RAW permits <=4096 message bytes; unlike the unbounded R20-R3 V2
 * ledger, the HEAD and independent PIN are compact. Never silently sign a
 * ledger digest while claiming it is a signature over the original ledger:
 * such a protocol change requires a distinct schema and verifier.
 */
import { createPublicKey, verify } from 'node:crypto';
import { canonicalJSON, digest, keyFingerprint } from '../r20-r2/signedLedger.mjs';
import { HEAD_FORMAT } from '../r20-r3/capturedLedger.mjs';
import { PIN_FORMAT } from '../r20-r3/externalAnchorBoundary.mjs';

export const KMS_ALGORITHM='ED25519_SHA_512';
export const KMS_KEY_SPEC='ECC_NIST_EDWARDS25519';
export const KMS_MESSAGE_TYPE='RAW';
export const MAX_KMS_RAW_MESSAGE_BYTES=4096;
export const REVIEW_ONLY=true;
const SHA=/^[0-9a-f]{64}$/;
const ARN=/^arn:aws(?:-us-gov)?:kms:[a-z0-9-]+:[0-9]{12}:key\/[a-zA-Z0-9-]{10,128}$/;
const NAME=/^[a-zA-Z0-9_.:-]{1,80}$/;
const exact=(x,keys)=>!!x&&typeof x==='object'&&!Array.isArray(x)&&
  Object.keys(x).length===keys.length&&
  keys.every(k=>Object.prototype.hasOwnProperty.call(x,k));
function fail(code){throw Error('R20-R6 KMS contract refused: '+code);}
function validatePayload(payload,role){
  if(role==='HEAD'){
    if(!exact(payload,['schema','sequence','captureRegistryDigest','ledgerDigest','issuedBy']) ||
       payload.schema!==HEAD_FORMAT ||
       !Number.isSafeInteger(payload.sequence) || payload.sequence<1 ||
       !SHA.test(payload.captureRegistryDigest||'') ||
       !SHA.test(payload.ledgerDigest||'') ||
       !NAME.test(payload.issuedBy||'')) {
      fail('unrecognized_or_content_bearing_head');
    }
    return;
  }
  if(role==='PIN'){
    if(!exact(payload,['schema','registryDigest','headDigest','minimumSequence']) ||
       payload.schema!==PIN_FORMAT ||
       !SHA.test(payload.registryDigest||'') ||
       !SHA.test(payload.headDigest||'') ||
       !Number.isSafeInteger(payload.minimumSequence) ||
       payload.minimumSequence<1) {
      fail('unrecognized_or_content_bearing_pin');
    }
    return;
  }
  fail('only_bounded_head_and_pin_allowed_in_r6');
}
function verificationKey(value){
  try{
    if(typeof value==='string' && !value.includes('-----BEGIN PUBLIC KEY-----'))
      fail('pinned_public_key_required');
    if(value?.type==='private')fail('pinned_public_key_required');
    const pub=value?.type==='public'?value:createPublicKey(value);
    if(pub.type!=='public' || pub.asymmetricKeyType!=='ed25519') {
      fail('pinned_ed25519_public_key_required');
    }
    return pub;
  }catch(error){
    if(String(error.message).startsWith('R20-R6'))throw error;
    fail('invalid_public_key');
  }
}
export function prepareReviewOnlyAwsKmsSign({
  role,keyArn,payload,pinnedPublicKey,pinnedKeyFingerprint,
}={}){
  if(role!=='HEAD' && role!=='PIN') fail('only_head_or_pin_may_sign');
  if(typeof keyArn!=='string' || !ARN.test(keyArn))fail('exact_kms_key_arn_required');
  validatePayload(payload,role);
  const key=verificationKey(pinnedPublicKey);
  const actual=keyFingerprint(key);
  if(!SHA.test(pinnedKeyFingerprint||'') || actual!==pinnedKeyFingerprint)
    fail('pinned_signer_key_mismatch');
  const raw=Buffer.from(canonicalJSON(payload),'utf8');
  if(raw.length===0 || raw.length>MAX_KMS_RAW_MESSAGE_BYTES)
    fail('kms_raw_message_limit');
  return Object.freeze({
    status:'R20_R6_OFFLINE_SIGN_REQUEST_ONLY',
    role,
    originalPayload:structuredClone(payload),
    preparedBytes:raw,
    preparedDigest:digest(payload),
    pinnedKeyFingerprint:actual,
    pinnedPublicKey:key,
    request:Object.freeze({
      KeyId:keyArn,
      SigningAlgorithm:KMS_ALGORITHM,
      MessageType:KMS_MESSAGE_TYPE,
      Message:raw,
    }),
    productionSignerCertified:false,
    productionPromotionAllowed:false,
    apiCalled:false,
  });
}
export function verifyReviewOnlyAwsKmsReply({prepared,response}={}){
  if(prepared?.status!=='R20_R6_OFFLINE_SIGN_REQUEST_ONLY' ||
     prepared.apiCalled!==false ||
     prepared.request?.SigningAlgorithm!==KMS_ALGORITHM ||
     prepared.request?.MessageType!==KMS_MESSAGE_TYPE ||
     !response || response.KeyId!==prepared.request.KeyId ||
     response.SigningAlgorithm!==KMS_ALGORITHM) {
    fail('kms_response_custody_mismatch');
  }
  const signature=response.Signature;
  if(!(signature instanceof Uint8Array) || signature.length!==64 ||
     !verify(null,prepared.preparedBytes,
       prepared.pinnedPublicKey,signature)) {
    fail('invalid_kms_signing_signature');
  }
  return Object.freeze({
    status:'R20_R6_FICTIONAL_SIGNATURE_VERIFIED_ONLY',
    role:prepared.role,
    keyArn:response.KeyId,
    signedPayloadDigest:prepared.preparedDigest,
    signerPublicFingerprint:prepared.pinnedKeyFingerprint,
    productionSignerCertified:false,
    productionPromotionAllowed:false,
  });
}
/**
 * Future ledger size solution, NOT wire-compatible with R20-R3 V2.
 * Head may commit an immutable ledger-root digest and a previous head.
 * New schema/verifier and independent ledger-store coverage are required.
 */
export function proposeLedgerHeadMigration({sequence,registryDigest,ledgerRootDigest,previousHeadDigest}={}){
  if(!Number.isSafeInteger(sequence)||sequence<1||
    ![registryDigest,ledgerRootDigest,previousHeadDigest].every(x=>SHA.test(x||''))){
    fail('incomplete_future_commitment');
  }
  return Object.freeze({
    schema:'SOULLAB-R20-R7-LEDGER-COMMITMENT-DRAFT-V1',
    sequence,registryDigest,ledgerRootDigest,previousHeadDigest,
    backwardCompatibleWithR20R3:false,
    productionPromotionAllowed:false,
  });
}
