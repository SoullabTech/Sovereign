/** R26 fictional broker, no network or independently installed key operator. */
import {createHash,generateKeyPairSync,randomBytes,sign} from 'node:crypto';
import {
  createHeldFixtureCustodianR26, R26_REAL_HELD_KMS_ADAPTER_ENABLED,
  type R26FictionalOutsideOperator,
} from '../heldExternalCustodyAdapterR26';
import {
  canonicalKeyLeaseR26,canonicalFreshnessR26,type R26TrustRoots,
  type R26Lease,type R26Freshness,
} from '../externalCustodyContractR26';
import {canonicalDeletionPayload,type DeletionHighwaterV1} from '../deletionBarrierV1';
import {WorkRecoveryRefusal} from '../workEnvelopeV1';
import type {R23Scope} from '../reviewVaultHistoryServiceR23';

const member='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const foreign='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const work='4c0782ca-9074-43ee-9f3c-5f8500026780';
const keyId='9f8746d1-76c3-4217-8d2c-115056189df7';
const now=1792164000000;
const sha=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
const scope:R23Scope={memberId:member,workId:work,generation:1,purpose:'append'};
const fixtureFlag='R26_EXTERNAL_CUSTODY_FIXTURE';
const priorFlag=process.env[fixtureFlag];
beforeEach(()=>{process.env[fixtureFlag]='fictional-only';});
afterAll(()=>{
  if(priorFlag===undefined)delete process.env[fixtureFlag];
  else process.env[fixtureFlag]=priorFlag;
});
function rig(options?:{
  mutateLease?:(x:R26Lease)=>R26Lease;
  mutateWitness?:(x:R26Freshness)=>R26Freshness;
  revokedWorks?:string[];
  failure?:Error;
}){
  const key={keyId,keyBytes:randomBytes(32)};
  const leasePair=generateKeyPairSync('ed25519');
  const deletionPair=generateKeyPairSync('ed25519');
  const freshPair=generateKeyPairSync('ed25519');
  const roots:R26TrustRoots={
    keyCustodian:leasePair.publicKey,deletionAuthority:deletionPair.publicKey,
    independentFreshness:freshPair.publicKey,
  };
  const seen:string[]=[];
  const outside:R26FictionalOutsideOperator={
    authority:'fabricated_r26_external_operator_test_only',
    async resolve(request,challenge){
      seen.push(challenge);
      if(options?.failure)throw options.failure;
      const check:DeletionHighwaterV1={
        protocol:'soullab.ws.deletion-highwater.v1',
        stream:'writers-studio-beta',generation:10,
        revokedWorks:options?.revokedWorks??[],revokedKeyIds:[],
      };
      const canonical=canonicalDeletionPayload(check);
      const deletion={checkpoint:check,
        signature:sign(null,canonical,deletionPair.privateKey).toString('base64')};
      const checkpointSha256=sha(canonical);
      const a:R26Lease={
        protocol:'soullab.ws.external-work-key-lease.r26',
        ...request,keyId,challenge,issuedAtMs:now-1000,expiresAtMs:now+20000,
        keySha256:sha(key.keyBytes),checkpointSha256,
      };
      const b:R26Freshness={
        protocol:'soullab.ws.independent-highwater-witness.r26',
        memberId:request.memberId,workId:request.workId,keyId,challenge,
        minimumGeneration:10,checkpointSha256,
        issuedAtMs:now-1000,expiresAtMs:now+20000,
      };
      const actualLease=options?.mutateLease?.(a)??a;
      const actualWitness=options?.mutateWitness?.(b)??b;
      return {key,deletion,
        lease:{statement:actualLease,signature:sign(null,
          canonicalKeyLeaseR26(actualLease),leasePair.privateKey).toString('base64')},
        freshness:{statement:actualWitness,signature:sign(null,
          canonicalFreshnessR26(actualWitness),freshPair.privateKey).toString('base64')},
      };
    },
  };
  const custodian=createHeldFixtureCustodianR26({
    outside,trustedPublicRoots:roots,trustedClock:()=>now,
  });
  return {custodian,outside,seen,key,roots};
}
function refuses(code:string,cb:()=>Promise<unknown>) {
 return expect(cb()).rejects.toMatchObject({name:'WorkRecoveryRefusal',code});
}
describe('R26 bridge to R23 held vault — fabricated external process contract only',()=>{
 it('keeps real external KMS disabled',()=>{
   expect(R26_REAL_HELD_KMS_ADAPTER_ENABLED).toBe(false);
 });
 it('produces correctly scoped R23 custody from valid signed fake operator answers',async()=>{
   const r=rig();
   const material=await r.custodian.resolve(scope);
   expect(material.scope).toEqual(scope);
   expect(material.key).toBe(r.key);
   expect(material.trust.independent).toEqual({minimumGeneration:10});
   expect(material.trust.signer).toBe(r.roots.deletionAuthority);
   expect(material.trust.signed?.checkpoint.revokedWorks).toEqual([]);
   expect(r.seen).toHaveLength(1);
   expect(r.seen[0]).toMatch(/^[0-9a-f]{64}$/);
 });
 it('issues a different fresh server challenge for every attempted operation',async()=>{
   const r=rig();
   await r.custodian.resolve(scope);
   await r.custodian.resolve(scope);
   expect(r.seen).toHaveLength(2);
   expect(r.seen[0]).not.toBe(r.seen[1]);
 });
 it('refuses calls before fabricated external fixture is explicitly allowed',async()=>{
   const r=rig();delete process.env[fixtureFlag];
   await refuses('r26_real_member_key_service_disabled',()=>r.custodian.resolve(scope));
   expect(r.seen).toEqual([]);
 });
 it('does not permit a signed Work key for the wrong member',async()=>{
   const r=rig({mutateLease:x=>({...x,memberId:foreign})});
   await refuses('r26_key_lease_scope_mismatch',()=>r.custodian.resolve(scope));
 });
 it('does not permit a signed antirollback witness for another writer',async()=>{
   const r=rig({mutateWitness:x=>({...x,memberId:foreign})});
   await refuses('r26_freshness_scope_mismatch',()=>r.custodian.resolve(scope));
 });
 it('refuses a signed revocation of the original Work before touching storage',async()=>{
   const r=rig({revokedWorks:[work]});
   await refuses('deleted_work_refused',()=>r.custodian.resolve(scope));
 });
 it('refuses a mocked outside key-service outage without revealing its text',async()=>{
   const r=rig({failure:new Error('SECRET SYNTHETIC OPERATOR KEY')});
   await refuses('r26_external_custody_unavailable',()=>r.custodian.resolve(scope));
 });
 it('rejects an unsafe or nonexistent broker shape before requesting a key',()=>{
   expect(()=>createHeldFixtureCustodianR26({
     outside:{authority:'invalid' as never,resolve:jest.fn()},
     trustedPublicRoots:rig().roots,trustedClock:()=>now,
   })).toThrow(WorkRecoveryRefusal);
 });
});
