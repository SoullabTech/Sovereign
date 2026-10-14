import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync, sign} from 'node:crypto';
import {digest,keyFingerprint,canonicalJSON} from
  '../../../lib/recovery/r20-r2/signedLedger.mjs';
import {HEAD_FORMAT} from
  '../../../lib/recovery/r20-r3/capturedLedger.mjs';
import {PIN_FORMAT} from
  '../../../lib/recovery/r20-r3/externalAnchorBoundary.mjs';
import {
  KMS_ALGORITHM,KMS_MESSAGE_TYPE,KMS_KEY_SPEC,
  MAX_KMS_RAW_MESSAGE_BYTES,REVIEW_ONLY,
  prepareReviewOnlyAwsKmsSign as prepare,
  verifyReviewOnlyAwsKmsReply as verifyReply,
  proposeLedgerHeadMigration as draftCommitment,
} from '../../../lib/recovery/r20-r6/managedEd25519KmsContract.mjs';

const a=generateKeyPairSync('ed25519');
const b=generateKeyPairSync('ed25519');
const ARN_A='arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789abc';
const ARN_B='arn:aws:kms:us-east-1:123456789012:key/abcdef12-abcd-abcd-abcd-abcdef123456';
const SHA='a'.repeat(64),SHA2='b'.repeat(64);
const head=()=>({
  schema:HEAD_FORMAT,sequence:3,
  captureRegistryDigest:SHA,ledgerDigest:SHA2,
  issuedBy:'FICTIONAL_SIGNER_ONLY',
});
const pin=()=>({
  schema:PIN_FORMAT,registryDigest:SHA,
  headDigest:SHA2,minimumSequence:3,
});
const prepareHead=()=>prepare({
  role:'HEAD',keyArn:ARN_A,payload:head(),
  pinnedPublicKey:a.publicKey,
  pinnedKeyFingerprint:keyFingerprint(a.publicKey),
});
const preparePin=()=>prepare({
  role:'PIN',keyArn:ARN_B,payload:pin(),
  pinnedPublicKey:b.publicKey,
  pinnedKeyFingerprint:keyFingerprint(b.publicKey),
});
const mockResponse=(p,privateKey)=>({
  KeyId:p.request.KeyId,
  SigningAlgorithm:KMS_ALGORITHM,
  Signature:sign(null,p.request.Message,privateKey),
});
const refuse=(name,fn)=>test(name,()=>{
  assert.throws(fn,/R20-R6 KMS contract refused/);
});
test('explicitly review-only, never KMS API execution',()=>{
  assert.equal(REVIEW_ONLY,true);
  assert.equal(KMS_KEY_SPEC,'ECC_NIST_EDWARDS25519');
  assert.equal(KMS_ALGORITHM,'ED25519_SHA_512');
  assert.equal(KMS_MESSAGE_TYPE,'RAW');
  assert.equal(MAX_KMS_RAW_MESSAGE_BYTES,4096);
});
test('head canonical JSON maps to AWS KMS ED25519 raw request',()=>{
  const p=prepareHead();
  assert.equal(p.apiCalled,false);
  assert.equal(p.productionPromotionAllowed,false);
  assert.equal(p.productionSignerCertified,false);
  assert.equal(p.request.SigningAlgorithm,KMS_ALGORITHM);
  assert.equal(p.request.MessageType,'RAW');
  assert.equal(p.request.KeyId,ARN_A);
  assert.equal(p.preparedBytes.toString('utf8'),canonicalJSON(head()));
  assert.equal(p.request.Message.length<4097,true);
});
test('pure Ed25519 KMS byte-equivalent fixture head signature verifies',()=>{
  const p=prepareHead();
  const out=verifyReply({prepared:p,response:mockResponse(p,a.privateKey)});
  assert.equal(out.signedPayloadDigest,digest(head()));
  assert.equal(out.role,'HEAD');
  assert.equal(out.productionPromotionAllowed,false);
  assert.equal(out.productionSignerCertified,false);
});
test('distinct pin identity verifies with second Ed25519 key',()=>{
  const p=preparePin();
  const out=verifyReply({prepared:p,response:mockResponse(p,b.privateKey)});
  assert.equal(out.role,'PIN');
  assert.notEqual(keyFingerprint(a.publicKey),keyFingerprint(b.publicKey));
});
refuse('cannot sign arbitrary plaintext or member prose',()=>
  prepare({role:'LEDGER',keyArn:ARN_A,payload:{
    sourceText:'real member writing prohibited',
  },pinnedPublicKey:a.publicKey,
  pinnedKeyFingerprint:keyFingerprint(a.publicKey)}));
refuse('ledger cannot be silently signed through bounded HEAD adapter',()=>
  prepare({role:'HEAD',keyArn:ARN_A,payload:{
    schema:'SOULLAB-R20-R3-CAPTURE-LEDGER-V2',
    events:Array.from({length:1000},(_,i)=>({sequence:i+1})),
  },pinnedPublicKey:a.publicKey,
  pinnedKeyFingerprint:keyFingerprint(a.publicKey)}));
refuse('cannot sign PIN using HEAD schema',()=>
  prepare({role:'PIN',keyArn:ARN_B,payload:head(),
    pinnedPublicKey:b.publicKey,
    pinnedKeyFingerprint:keyFingerprint(b.publicKey)}));
refuse('cannot sign HEAD using PIN schema',()=>
  prepare({role:'HEAD',keyArn:ARN_A,payload:pin(),
    pinnedPublicKey:a.publicKey,
    pinnedKeyFingerprint:keyFingerprint(a.publicKey)}));
refuse('additional content field rejected even when signed authority requests it',()=>{
  const h=head();h.text='not permitted';
  prepare({role:'HEAD',keyArn:ARN_A,payload:h,
    pinnedPublicKey:a.publicKey,
    pinnedKeyFingerprint:keyFingerprint(a.publicKey)});
});
refuse('key ARN must be specific asymmetric KMS key rather than alias',()=>
  prepare({role:'HEAD',keyArn:'alias/r20-signing',payload:head(),
    pinnedPublicKey:a.publicKey,
    pinnedKeyFingerprint:keyFingerprint(a.publicKey)}));
refuse('pinned fingerprint cannot be supplied from wrong key',()=>
  prepare({role:'HEAD',keyArn:ARN_A,payload:head(),
    pinnedPublicKey:a.publicKey,
    pinnedKeyFingerprint:keyFingerprint(b.publicKey)}));
refuse('private PEM cannot substitute for pinned public key',()=>
  prepare({role:'HEAD',keyArn:ARN_A,payload:head(),
    pinnedPublicKey:a.privateKey.export({format:'pem',type:'pkcs8'}),
    pinnedKeyFingerprint:keyFingerprint(a.publicKey)}));
refuse('missing public-key pin prevents request',()=>
  prepare({role:'HEAD',keyArn:ARN_A,payload:head(),
    pinnedPublicKey:a.publicKey}));
refuse('wrong signing role response KeyId refused',()=>{
  const p=prepareHead(),r=mockResponse(p,a.privateKey);
  r.KeyId=ARN_B;verifyReply({prepared:p,response:r});
});
refuse('wrong KMS signing algorithm response refused',()=>{
  const p=prepareHead(),r=mockResponse(p,a.privateKey);
  r.SigningAlgorithm='ED25519_PH_SHA_512';
  verifyReply({prepared:p,response:r});
});
refuse('signature of changed digest cannot certify original HEAD',()=>{
  const p=prepareHead();
  const other=sign(null,Buffer.from(canonicalJSON(pin())),a.privateKey);
  verifyReply({prepared:p,response:{
    KeyId:ARN_A,SigningAlgorithm:KMS_ALGORITHM,Signature:other,
  }});
});
refuse('wrong signing key signature cannot certify original HEAD',()=>{
  const p=prepareHead();
  verifyReply({prepared:p,response:mockResponse(p,b.privateKey)});
});
refuse('malformed signature cannot certify original HEAD',()=>{
  const p=prepareHead();
  verifyReply({prepared:p,response:{
    KeyId:ARN_A,SigningAlgorithm:KMS_ALGORITHM,
    Signature:new Uint8Array(32),
  }});
});
refuse('canonical HEAD sequence cannot be zero',()=>{
  const h=head();h.sequence=0;
  prepare({role:'HEAD',keyArn:ARN_A,payload:h,
    pinnedPublicKey:a.publicKey,
    pinnedKeyFingerprint:keyFingerprint(a.publicKey)});
});
test('future compact commitment is a distinct incompatible wire protocol',()=>{
  const candidate=draftCommitment({
    sequence:4,registryDigest:SHA,ledgerRootDigest:SHA2,
    previousHeadDigest:SHA,
  });
  assert.equal(candidate.backwardCompatibleWithR20R3,false);
  assert.equal(candidate.productionPromotionAllowed,false);
  assert.notEqual(candidate.schema,HEAD_FORMAT);
});
refuse('incomplete future commitment refused',()=>
  draftCommitment({sequence:4,registryDigest:SHA,ledgerRootDigest:SHA2}));
