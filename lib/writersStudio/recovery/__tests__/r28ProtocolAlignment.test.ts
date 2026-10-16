import {
  R26_REAL_MEMBER_KEY_CUSTODY_ENABLED,
  canonicalKeyLeaseR26,
  type R26Lease,
} from '../externalCustodyContractR26';
import { R26_REAL_HELD_KMS_ADAPTER_ENABLED } from
  '../heldExternalCustodyAdapterR26';
import {
  R27_MANAGED_KMS_PROVISIONING_ENABLED,
  R27_REAL_MEMBER_WRITING_ENABLED,
} from '../managedKmsTopologyR27';
import { WorkRecoveryRefusal } from '../workEnvelopeV1';

function currentR26Lease():R26Lease{
  return {
    protocol:'soullab.ws.external-work-key-lease.r26',
    memberId:'11111111-1111-4111-8111-111111111111',
    workId:'22222222-2222-4222-8222-222222222222',
    keyId:'33333333-3333-4333-8333-333333333333',
    purpose:'append',
    generation:1,
    challenge:'a'.repeat(64),
    issuedAtMs:1000000,expiresAtMs:1020000,
    keySha256:'b'.repeat(64),
    checkpointSha256:'c'.repeat(64),
  };
}
describe('R28 explicit reconciliation of independent signer contract with planned managed KMS',()=>{
  it('keeps all real writer and provisioning flags OFF',()=>{
    expect(R26_REAL_MEMBER_KEY_CUSTODY_ENABLED).toBe(false);
    expect(R26_REAL_HELD_KMS_ADAPTER_ENABLED).toBe(false);
    expect(R27_MANAGED_KMS_PROVISIONING_ENABLED).toBe(false);
    expect(R27_REAL_MEMBER_WRITING_ENABLED).toBe(false);
  });
  it('proves R26 accepted lease does not yet include live session/notice binding',()=>{
    const lease=currentR26Lease();
    expect(canonicalKeyLeaseR26(lease)).toBeInstanceOf(Buffer);
    for(const extra of ['sessionBindingSHA256','consentSHA256']){
      const altered={...lease,[extra]:'d'.repeat(64)};
      expect(()=>canonicalKeyLeaseR26(altered as R26Lease))
        .toThrow('r26_unrecognized_attestation_shape');
    }
    // A field's rejection by this *held* signer is not a security bypass.
    // Real integration needs a separately versioned, signed, session/consent-
    // bound lease and fresh authorization across the KMS latency window.
  });
  it('does not infer export permission from existing append/read lease',()=>{
    const altered={...currentR26Lease(),purpose:'export'};
    expect(()=>canonicalKeyLeaseR26(altered as R26Lease))
      .toThrow('r26_invalid_custody_scope');
  });
  it('cannot use partial or unsigned lease as operational issuance',()=>{
    const altered={...currentR26Lease()};
    delete (altered as unknown as Record<string,unknown>).checkpointSha256;
    expect(()=>canonicalKeyLeaseR26(altered as R26Lease))
      .toThrow(WorkRecoveryRefusal);
  });
});
