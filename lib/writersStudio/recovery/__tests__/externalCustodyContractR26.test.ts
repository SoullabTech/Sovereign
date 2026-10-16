/**
 * R26 cryptographic contract falsifiers. Keys, signers and author data are
 * fabricated in-process. Passing does NOT establish independent key custody.
 */
import {
  generateKeyPairSync, createHash, randomBytes, sign,
} from 'node:crypto';
import {
  canonicalDeletionPayload, type DeletionHighwaterV1,
} from '../deletionBarrierV1';
import {
  canonicalKeyLeaseR26, canonicalFreshnessR26, verifyExternalCustodyR26,
  R26_REAL_MEMBER_KEY_CUSTODY_ENABLED,
  type R26VerifiedInput, type R26Lease, type R26Freshness,
} from '../externalCustodyContractR26';
import { WorkRecoveryRefusal } from '../workEnvelopeV1';

const member='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const foreign='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const work='4c0782ca-9074-43ee-9f3c-5f8500026780';
const otherWork='4c0782ca-9074-43ee-9f3c-5f8500026781';
const keyId='9f8746d1-76c3-4217-8d2c-115056189df7';
const otherKey='9f8746d1-76c3-4217-8d2c-115056189df8';
const now=1792164000000;
const challenge='ec'.repeat(32);
const hex=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const checkpoint=(patch:Partial<DeletionHighwaterV1>={})=>({
  protocol:'soullab.ws.deletion-highwater.v1' as const,
  stream:'writers-studio-beta' as const,
  generation:10,revokedWorks:[] as string[],revokedKeyIds:[] as string[],
  ...patch,
});
type TestRig = {
  input:R26VerifiedInput;
  refresh:(change?:{
    lease?:Partial<R26Lease>;
    witness?:Partial<R26Freshness>;
    checkpoint?:Partial<DeletionHighwaterV1>;
    signLease?:boolean;
    signWitness?:boolean;
    signCheckpoint?:boolean;
  })=>R26VerifiedInput;
};
function rig():TestRig{
  const custody=generateKeyPairSync('ed25519');
  const deletion=generateKeyPairSync('ed25519');
  const freshKey=generateKeyPairSync('ed25519');
  const key={keyId,keyBytes:randomBytes(32)};
  const base={
    scope:{memberId:member,workId:work,generation:1,keyId,purpose:'append' as const},
    serverChallenge:challenge,key,
    roots:{keyCustodian:custody.publicKey,
      deletionAuthority:deletion.publicKey,independentFreshness:freshKey.publicKey},
    nowMs:now,
  };
  const build=(change:Parameters<TestRig['refresh']>[0]={}):R26VerifiedInput=>{
    const check=checkpoint(change.checkpoint);
    const signedDeletion={checkpoint:check,signature:sign(null,
      canonicalDeletionPayload(check),deletion.privateKey).toString('base64')};
    const checkpointSha256=hex(canonicalDeletionPayload(check));
    const lease:R26Lease={protocol:'soullab.ws.external-work-key-lease.r26',
      ...base.scope,challenge,issuedAtMs:now-1000,expiresAtMs:now+30000,
      keySha256:hex(key.keyBytes),checkpointSha256,...change.lease};
    const freshness:R26Freshness={protocol:'soullab.ws.independent-highwater-witness.r26',
      memberId:member,workId:work,keyId,challenge,minimumGeneration:10,
      checkpointSha256,issuedAtMs:now-1000,expiresAtMs:now+30000,...change.witness};
    return {...base,deletion:signedDeletion,
      lease:{statement:lease,signature:sign(null,canonicalKeyLeaseR26(lease),
        custody.privateKey).toString('base64')},
      freshness:{statement:freshness,signature:sign(null,canonicalFreshnessR26(freshness),
        freshKey.privateKey).toString('base64')}};
  };
  const input=build();
  return {input,refresh:build};
}
function denied(operation:()=>unknown,reason?:string):void{
  try {operation();throw new Error('R26 unexpectedly admitted rejected fixture');}
  catch(e){
    expect(e).toBeInstanceOf(WorkRecoveryRefusal);
    if(reason)expect((e as WorkRecoveryRefusal).code).toBe(reason);
  }
}
describe('R26 independent Work-key and deletion witness contract — fictional only',()=>{
 it('keeps real member key service uninstalled',()=>{
   expect(R26_REAL_MEMBER_KEY_CUSTODY_ENABLED).toBe(false);
 });
 it('accepts three distinct correctly signed synthetic authorities only for exact scope',()=>{
   const x=rig().input;
   const y=verifyExternalCustodyR26(x);
   expect(y.key).toBe(x.key);
   expect(y.independent?.minimumGeneration).toBe(10);
   expect(y.signedDeletion).toBe(x.deletion);
   expect(y.trustedSigner).toBe(x.roots.deletionAuthority);
 });
 it('rejects a forged work key or mutated key bytes before grant',()=>{
   const x=rig().input;
   denied(()=>verifyExternalCustodyR26({...x,key:{...x.key,keyBytes:randomBytes(32)}}),
     'r26_key_lease_scope_mismatch');
   denied(()=>verifyExternalCustodyR26({...x,key:{...x.key,keyId:otherKey}}),
     'r26_invalid_external_work_key');
 });
 it('rejects writer, Work, operation, version, key and challenge substitutions',()=>{
   const x=rig().input;
   for(const patch of [
     {memberId:foreign},{workId:otherWork},{purpose:'read' as const},
     {generation:2},{keyId:otherKey},
   ]){
     denied(()=>verifyExternalCustodyR26({...x,scope:{...x.scope,...patch}}));
   }
   denied(()=>verifyExternalCustodyR26({...x,serverChallenge:'12'.repeat(32)}),
     'r26_key_lease_scope_mismatch');
 });
 it('rejects missing, expired and future-dated lease or external witness',()=>{
   const r=rig(),x=r.input;
   for(const shift of [
     {expiresAtMs:now-1},{issuedAtMs:now+10000},{issuedAtMs:now-130000},
     {issuedAtMs:now-1000,expiresAtMs:now+130000},
   ]){
     denied(()=>verifyExternalCustodyR26(r.refresh({lease:shift})),
       'r26_stale_or_invalid_external_attestation');
     denied(()=>verifyExternalCustodyR26(r.refresh({witness:shift})),
       'r26_stale_or_invalid_external_attestation');
   }
   denied(()=>verifyExternalCustodyR26({...x,lease:null as never}),
     'r26_missing_signed_grant');
   denied(()=>verifyExternalCustodyR26({...x,freshness:null as never}),
     'r26_missing_signed_grant');
 });
 it('rejects signed lease and freshness sent with wrong signer or tampered signatures',()=>{
   const x=rig().input;
   denied(()=>verifyExternalCustodyR26({...x,
     lease:{...x.lease,signature:x.freshness.signature}}),'r26_signature_refused');
   denied(()=>verifyExternalCustodyR26({...x,
     freshness:{...x.freshness,signature:x.lease.signature}}),'r26_signature_refused');
   denied(()=>verifyExternalCustodyR26({...x,
     lease:{...x.lease,signature:'not-base64'}}),'r26_invalid_attestation_signature');
 });
 it('requires three distinct pinned Ed25519 PUBLIC trust keys, not backup-injected private keys',()=>{
   const x=rig().input;
   denied(()=>verifyExternalCustodyR26({...x,roots:{
     ...x.roots,independentFreshness:x.roots.deletionAuthority}}),
     'r26_collapsed_trust_signers');
   const another=generateKeyPairSync('ed25519');
   denied(()=>verifyExternalCustodyR26({...x,roots:{
     ...x.roots,keyCustodian:another.publicKey}}),'r26_signature_refused');
   denied(()=>verifyExternalCustodyR26({...x,roots:{
     ...x.roots,deletionAuthority:another.privateKey}}),
     'r26_missing_trusted_public_key');
 });
 it('rejects a signed external witness scoped to a different writer or deletion digest',()=>{
   const r=rig();
   denied(()=>verifyExternalCustodyR26(r.refresh({witness:{memberId:foreign}})),
     'r26_freshness_scope_mismatch');
   denied(()=>verifyExternalCustodyR26(r.refresh({witness:{workId:otherWork}})),
     'r26_freshness_scope_mismatch');
   denied(()=>verifyExternalCustodyR26(r.refresh({witness:{checkpointSha256:'a'.repeat(64)}})),
     'r26_freshness_scope_mismatch');
 });
 it('refuses replay of older signed checkout against current independently signed generation',()=>{
   const r=rig();
   denied(()=>verifyExternalCustodyR26(r.refresh({
     checkpoint:{generation:8},witness:{minimumGeneration:10},
   })),'stale_deletion_checkpoint');
 });
 it('refuses a Work whose current signed deletion checkpoint revoked the Work',()=>{
   const r=rig();
   denied(()=>verifyExternalCustodyR26(r.refresh({
     checkpoint:{revokedWorks:[work]},
   })),'deleted_work_refused');
 });
 it('refuses a retired encryption key even when original ciphertext still survives',()=>{
   const r=rig();
   denied(()=>verifyExternalCustodyR26(r.refresh({
     checkpoint:{revokedKeyIds:[keyId]},
   })),'deleted_key_refused');
 });
 it('rejects replacing signed deletion checkpoint without matching independent signatures',()=>{
   const x=rig().input;
   denied(()=>verifyExternalCustodyR26({...x,deletion:{
     ...x.deletion,checkpoint:{...x.deletion.checkpoint,generation:11},
   }}),'r26_key_lease_scope_mismatch');
   const d=rig().input;
   denied(()=>verifyExternalCustodyR26({...d,deletion:{
     ...d.deletion,signature:d.lease.signature,
   }}),'deletion_barrier_signature_invalid');
 });
 it('rejects future generation when signed deletion authority has not witnessed it',()=>{
   const r=rig(),x=r.input;
   const requested={...x.scope,generation:11};
   const refreshed=r.refresh({lease:{generation:11}});
   denied(()=>verifyExternalCustodyR26({...refreshed,scope:requested}),
     'snapshot_ahead_of_checkpoint');
 });
 it('rejects unknown attestation fields and invalid authority scope',()=>{
   const r=rig(),x=r.input;
   denied(()=>verifyExternalCustodyR26({...x,
     lease:{...x.lease,statement:{...x.lease.statement,clientRole:'founder'}} as never}),
     'r26_unrecognized_attestation_shape');
   denied(()=>verifyExternalCustodyR26({...x,scope:{
     ...x.scope,purpose:'admin' as never,
   }}),'r26_invalid_custody_scope');
 });
 it('does not admit a service-wide or client-derived owner role by itself',()=>{
   const x=rig().input;
   denied(()=>verifyExternalCustodyR26({...x,scope:{
     ...x.scope,memberId:'founder',
   }}),'r26_invalid_custody_scope');
 });
});
