import test from 'node:test';
import assert from 'node:assert/strict';
import {
  examineProposedExternalAnchor as assess,
  EXTERNAL_ANCHOR_SCHEMA,
} from '../../../lib/recovery/r20-r6/crossProviderAnchorContract.mjs';

const H='c'.repeat(64),G='b'.repeat(64);
function good(){
 return {
   signer:{
     provider:'AWS_KMS',accountDomain:'isolated-signing-account',
     algorithm:'ED25519_SHA_512',
   },
   anchor:{
     provider:'GOOGLE_CLOUD_STORAGE',
     accountDomain:'separately-administered-anchor-project',
     retention:'BUCKET_LOCK_OR_OBJECT_LOCK_LOCKED',
     locked:true,metadataOnly:true,
     signedCheckpointHash:H,objectGeneration:'123456789',
     signedHeadSequence:4,readAuthoritySeparatelyAdministered:true,
   },
   head:{
     schema:EXTERNAL_ANCHOR_SCHEMA,
     sequence:4,signedHeadDigest:H,registryDigest:G,
   },
 };
}
const deny=(name,update)=>test(name,()=>{
  const data=good();
  update(data);
  assert.throws(()=>assess(data),/R20-R6 independent anchor refused/);
});
test('a consistent cross-provider claim is NEVER itself operational proof',()=>{
 const r=assess(good());
 assert.equal(r.status,'DESIGN_INPUT_CONSISTENT_BUT_UNVERIFIED');
 assert.equal(r.sequence,4);
 assert.equal(r.physicalCustodyCertified,false);
 assert.equal(r.actualCloudReadPerformed,false);
 assert.equal(r.productionPromotionAllowed,false);
 assert.equal(r.requiresDirectProviderEvidence,true);
});
deny('missing trust parties',v=>{delete v.anchor});
deny('same cloud provider not cross-provider',v=>{v.anchor.provider='AWS_KMS'});
deny('separate domains may not be equal',v=>{
 v.anchor.accountDomain=v.signer.accountDomain;
});
deny('unsigned or user-modifiable retention refused',v=>{v.anchor.locked=false});
deny('non-locked policy refused',v=>{
 v.anchor.retention='UNLOCKED';
});
deny('anchor contains member content refused',v=>{v.anchor.metadataOnly=false});
deny('overstated current epoch refused',v=>{v.anchor.signedHeadSequence=3});
deny('wrong digest refused',v=>{v.anchor.signedCheckpointHash=G});
deny('no object generation refuses remote proof claim',v=>{
 v.anchor.objectGeneration='';
});
deny('invalid object generation refuses',v=>{v.anchor.objectGeneration='old'});
deny('signer and reader share administration refused',v=>{
 v.anchor.readAuthoritySeparatelyAdministered=false;
});
deny('missing high-water from writer refused',v=>{v.head.sequence=0});
deny('member identifiers cannot silently enter checkpoint',v=>{
 v.head.memberId='secret-identity';
});
deny('incomplete registry commitment rejected',v=>{
 v.head.registryDigest='missing';
});
deny('unrecognized signer algorithm rejected',v=>{
 v.signer.algorithm='ED25519_PH_SHA_512';
});
deny('unrecognized signer provider rejected',v=>{
 v.signer.provider='SOULLAB_MINISFORUM';
});
deny('partial evidence shape cannot claim acceptance',v=>{
 v.anchor.extra='unreviewed';
});
