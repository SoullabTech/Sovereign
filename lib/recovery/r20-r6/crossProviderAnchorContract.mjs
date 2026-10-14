/**
 * R20-R6 cross-provider checkpoint admission, pure review-only negative filter.
 * The real AWS/GCS SDK clients and their identities are NOT connected.
 * JSON claims cannot establish physical custody, object lock or freshness.
 */
const SHA=/^[a-f0-9]{64}$/;
const GEN=/^(?:[1-9][0-9]{0,18})$/;
const SCHEMA='SOULLAB-R20-R6-OPAQUE-HIGHWATER-V1';
function refuse(reason) {
  throw Error('R20-R6 independent anchor refused: '+reason);
}
function exact(obj,keys) {
  return !!obj && typeof obj==='object' && !Array.isArray(obj) &&
    Object.keys(obj).length===keys.length &&
    keys.every(key=>Object.prototype.hasOwnProperty.call(obj,key));
}
export function examineProposedExternalAnchor({
  signer,anchor,head,
}={}){
  if(!signer||!anchor||!head)refuse('three_explicit_trust_roles_missing');
  if(!exact(signer,['provider','accountDomain','algorithm']) ||
     signer.provider!=='AWS_KMS' ||
     typeof signer.accountDomain!=='string' || signer.accountDomain.length<5 ||
     signer.algorithm!=='ED25519_SHA_512'){
    refuse('unrecognized_signing_authority');
  }
  if(!exact(anchor,[
    'provider','accountDomain','retention',
    'locked','metadataOnly','signedCheckpointHash',
    'objectGeneration','signedHeadSequence',
    'readAuthoritySeparatelyAdministered',
  ]) ||
      anchor.provider!=='GOOGLE_CLOUD_STORAGE' ||
      typeof anchor.accountDomain!=='string' || anchor.accountDomain.length<5 ||
      anchor.accountDomain===signer.accountDomain ||
      anchor.retention!=='BUCKET_LOCK_OR_OBJECT_LOCK_LOCKED' ||
      anchor.locked!==true ||
      anchor.metadataOnly!==true ||
      anchor.readAuthoritySeparatelyAdministered!==true ||
      typeof anchor.objectGeneration!=='string' ||
      !GEN.test(anchor.objectGeneration) ||
      !SHA.test(anchor.signedCheckpointHash||'') ||
      !Number.isSafeInteger(anchor.signedHeadSequence) ||
      anchor.signedHeadSequence<1) {
    refuse('external_monotonicity_or_custody_claim_incomplete');
  }
  if(!exact(head,['schema','sequence','signedHeadDigest','registryDigest']) ||
      head.schema!==SCHEMA ||
      !Number.isSafeInteger(head.sequence) || head.sequence<1 ||
      !SHA.test(head.signedHeadDigest||'') ||
      !SHA.test(head.registryDigest||'')) {
    refuse('unrecognized_or_content_bearing_head');
  }
  if(head.sequence!==anchor.signedHeadSequence ||
     head.signedHeadDigest!==anchor.signedCheckpointHash) {
    refuse('independent_checkpoint_conflict');
  }
  return Object.freeze({
    status:'DESIGN_INPUT_CONSISTENT_BUT_UNVERIFIED',
    sequence:head.sequence,
    fingerprint:head.signedHeadDigest,
    physicalCustodyCertified:false,
    actualCloudReadPerformed:false,
    productionPromotionAllowed:false,
    memberErasureCertified:false,
    requiresDirectProviderEvidence:true,
  });
}
export const EXTERNAL_ANCHOR_SCHEMA=SCHEMA;
