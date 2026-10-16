import {generateKeyPairSync,randomBytes,randomUUID,sign,createHash,type KeyObject} from 'node:crypto';
import {canonicalDeletionPayload,type DeletionHighwaterV1} from '../deletionBarrierV1';
import {
 canonicalR24Lease,reviewR24HeldCustodyLease,
 R24_REAL_EXTERNAL_CUSTODY_ENABLED,R24_LEASE_PROTOCOL,
 type R24Scope,type R24Lease,type R24LeaseKeyPackage,
 type R24ExternallyPinnedAuthority,
} from '../externalCustodyBoundaryR24';
const MEMBER='11111111-1111-4111-8111-111111111111';
const OTHER='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-333333333333';
const KEYID='44444444-4444-4444-8444-444444444444';
const NOW=1792162800000;
const scope:R24Scope={memberId:MEMBER,workId:WORK,
 generation:2,operation:'append'};
const old=process.env.R24_INDEPENDENT_AUTHORITY_FIXTURE;
type Fixture={input:Parameters<typeof reviewR24HeldCustodyLease>[0];
  lease:R24Lease; leaseSigner:ReturnType<typeof generateKeyPairSync>;
  deletionSigner:ReturnType<typeof generateKeyPairSync>;
  consumed:Set<string>;external:R24ExternallyPinnedAuthority;};
function mk():Fixture{
 const leaseSigner=generateKeyPairSync('ed25519'),
 deletionSigner=generateKeyPairSync('ed25519'),consumed=new Set<string>();
 const keyBytes=randomBytes(32);
 const lease:R24Lease={protocol:R24_LEASE_PROTOCOL,
 scope:{...scope},keyId:KEYID,keyDigest:createHash('sha256').update(keyBytes).digest('hex'),deletionGeneration:8,
 nonce:randomBytes(16).toString('hex'),
 issuedAtMs:NOW-1000,expiresAtMs:NOW+20000};
 const checkpoint:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
  generation:8,revokedWorks:[],revokedKeyIds:[],
 };
 const signedLease={
  lease,signature:sign(null,canonicalR24Lease(lease),
    leaseSigner.privateKey).toString('base64'),
 };
 const signedDeletion={
  checkpoint,signature:sign(null,canonicalDeletionPayload(checkpoint),
    deletionSigner.privateKey).toString('base64'),
 };
 const pack:R24LeaseKeyPackage={
  signedLease,key:{keyId:KEYID,keyBytes},
  signedDeletion,
 };
 const external:R24ExternallyPinnedAuthority={
  pinnedLeaseSigner:leaseSigner.publicKey,
  pinnedDeletionSigner:deletionSigner.publicKey,
  minimumDeletionGeneration:jest.fn(async()=>8),
  consumeNonce:jest.fn(async(l)=>{
    if(consumed.has(l.nonce))return false;
    consumed.add(l.nonce);return true;
  }),
 };
 return {lease,leaseSigner,deletionSigner,consumed,external,
  input:{scope:{...scope},package:pack,authority:external,nowMs:NOW}};
}
const run=(f:Fixture)=>reviewR24HeldCustodyLease(f.input);
function resign(f:Fixture){
 f.input.package.signedLease.signature=sign(null,
   canonicalR24Lease(f.lease),f.leaseSigner.privateKey as KeyObject).toString('base64');
}
beforeEach(()=>{process.env.R24_INDEPENDENT_AUTHORITY_FIXTURE='fictional-only'});
afterAll(()=>{
 if(old===undefined)delete process.env.R24_INDEPENDENT_AUTHORITY_FIXTURE;
 else process.env.R24_INDEPENDENT_AUTHORITY_FIXTURE=old;
});

describe('R24 independently pinned author/Work/deletion lease boundary',()=>{
 it('real member KMS integration remains hard-disabled',()=>{
  expect(R24_REAL_EXTERNAL_CUSTODY_ENABLED).toBe(false);
 });
 it('fails before consuming a secret or nonce outside synthetic fixture',async()=>{
  const f=mk();delete process.env.R24_INDEPENDENT_AUTHORITY_FIXTURE;
  await expect(run(f)).rejects.toMatchObject({code:'r24_real_custody_unavailable'});
  expect(f.external.consumeNonce).not.toHaveBeenCalled();
 });
 it('issues only an exact scoped short-lived lease with external deletion witness',async()=>{
  const f=mk(),result=await run(f);
  expect(result.scope).toEqual(scope);
  expect(result.key.keyId).toBe(KEYID);
  expect(result.deletion.independent.minimumGeneration).toBe(8);
  expect(f.external.consumeNonce).toHaveBeenCalledTimes(1);
 });
 it('refuses replay of exactly same attested lease',async()=>{
  const f=mk();await run(f);
  await expect(run(f)).rejects.toMatchObject({code:'r24_lease_replay_refused'});
 });
 it('refuses different writer, work, generation or operation even with valid signature',async()=>{
  for(const wrong of [{memberId:OTHER},{workId:OTHER},
    {generation:3},{operation:'read' as const}]){
    const f=mk();
    f.input.scope={...scope,...wrong};
    await expect(run(f)).rejects.toMatchObject({code:'r24_scope_substitution_refused'});
    expect(f.external.consumeNonce).not.toHaveBeenCalled();
  }
 });
 it('refuses unsigned or tampered lease data',async()=>{
  const f=mk();f.lease.scope.memberId=OTHER;
  await expect(run(f)).rejects.toMatchObject({code:'r24_lease_signature_refused'});
  const z=mk();z.input.package.signedLease.signature='bad';
  await expect(run(z)).rejects.toMatchObject({code:'r24_untrusted_lease'});
 });
 it('refuses attacker-supplied signer rather than trusting a self-signed lease',async()=>{
  const f=mk(),foreign=generateKeyPairSync('ed25519');
  f.external.pinnedLeaseSigner=foreign.publicKey;
  await expect(run(f)).rejects.toMatchObject({code:'r24_lease_signature_refused'});
 });
 it('rejects future, expired and overlong token validity',async()=>{
  let f=mk();f.input.nowMs=NOW+25000;
  await expect(run(f)).rejects.toMatchObject({code:'r24_lease_expired_or_future'});
  f=mk();f.input.nowMs=NOW-7000;
  await expect(run(f)).rejects.toMatchObject({code:'r24_lease_expired_or_future'});
  f=mk();f.lease.expiresAtMs=f.lease.issuedAtMs+61000;
  await expect(run(f)).rejects.toMatchObject({code:'r24_invalid_lease'});
 });
 it('refuses wrong Work key, malformed key bytes and key substitution',async()=>{
  const f=mk();f.input.package.key.keyId=OTHER;
  await expect(run(f)).rejects.toMatchObject({code:'r24_scoped_key_invalid'});
  const z=mk();z.input.package.key.keyBytes=Buffer.alloc(16);
  await expect(run(z)).rejects.toMatchObject({code:'r24_scoped_key_invalid'});
 });
 it('refuses missing external signer/epoch/nonce authority',async()=>{
  let f=mk();f.input.authority=null as never;
  await expect(run(f)).rejects.toMatchObject({code:'r24_external_authority_unavailable'});
  f=mk();f.external.minimumDeletionGeneration=jest.fn(async()=>{throw Error('down')});
  await expect(run(f)).rejects.toMatchObject({code:'r24_independent_generation_unavailable'});
  f=mk();f.external.consumeNonce=jest.fn(async()=>{throw Error('down')});
  await expect(run(f)).rejects.toMatchObject({code:'r24_nonce_authority_unavailable'});
 });
 it('refuses independent deletion epoch older/newer than signed scope',async()=>{
  const f=mk();
  f.external.minimumDeletionGeneration=jest.fn(async()=>9);
  await expect(run(f)).rejects.toMatchObject({code:'r24_independent_generation_mismatch'});
 });
 it('refuses external signer without valid deletion signature',async()=>{
  const f=mk();
  f.input.package.signedDeletion.signature='invalid';
  await expect(run(f)).rejects.toMatchObject({code:'invalid_deletion_barrier'});
  expect(f.external.consumeNonce).not.toHaveBeenCalled();
 });
 it('refuses revoked Work, retired key and stale checkpoint before any lease use',async()=>{
  for(const revoked of ['work','key'] as const){
   const f=mk(),checkpoint=f.input.package.signedDeletion.checkpoint;
   if(revoked==='work')checkpoint.revokedWorks=[WORK];
   else checkpoint.revokedKeyIds=[KEYID];
   f.input.package.signedDeletion.signature=sign(null,
     canonicalDeletionPayload(checkpoint),
     f.deletionSigner.privateKey as KeyObject).toString('base64');
   await expect(run(f)).rejects.toMatchObject({
     code:revoked==='work'?'deleted_work_refused':'deleted_key_refused',
   });
   expect(f.external.consumeNonce).not.toHaveBeenCalled();
  }
 });
 it('rejects signed deletion checkpoint from an attacker-controlled signer',async()=>{
  const f=mk(),rogue=generateKeyPairSync('ed25519');
  f.input.package.signedDeletion.signature=sign(null,
    canonicalDeletionPayload(f.input.package.signedDeletion.checkpoint),
    rogue.privateKey as KeyObject).toString('base64');
  await expect(run(f)).rejects.toMatchObject({code:'deletion_barrier_signature_invalid'});
  expect(f.external.consumeNonce).not.toHaveBeenCalled();
 });
 it('refuses substituted key bytes even if the key ID is unchanged',async()=>{
  const f=mk();f.input.package.key.keyBytes=Buffer.alloc(32,7);
  await expect(run(f)).rejects.toMatchObject({code:'r24_scoped_key_invalid'});
  expect(f.external.consumeNonce).not.toHaveBeenCalled();
 });
 it('refuses replay record when separate independent store rejects it',async()=>{
  const f=mk();f.external.consumeNonce=jest.fn(async()=>false);
  await expect(run(f)).rejects.toMatchObject({code:'r24_lease_replay_refused'});
 });
 it('rejects a Work generation beyond current signed checkpoint',async()=>{
  const f=mk();f.lease.scope.generation=9;
  f.input.scope.generation=9;resign(f);
  await expect(run(f)).rejects.toMatchObject({code:'snapshot_ahead_of_checkpoint'});
 });
});
