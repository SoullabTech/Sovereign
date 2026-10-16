import {
  createHash, generateKeyPairSync, randomBytes, sign,
} from 'node:crypto';
import {
  canonicalDeletionPayload, type DeletionHighwaterV1,
} from '../deletionBarrierV1';
import {
  canonicalKeyLeaseR26, canonicalFreshnessR26,
  type R26VerifiedInput, type R26Lease, type R26Freshness,
} from '../externalCustodyContractR26';
import {
  canonicalR29BoundLease, verifySessionBoundLeaseR29,
  rehearseSessionBoundWriteR29, R29_REAL_WRITER_AUTHORIZATION_ENABLED,
  R29_PROTOCOL, type R29SignedBound, type R29BoundAttestation,
  type R29CurrentAdmission, type R29FictionalWorkFence,
} from '../sessionBoundCustodyR29';

const member='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const work='4c0782ca-9074-43ee-9f3c-5f8500026780';
const keyId='9f8746d1-76c3-4217-8d2c-115056189df7';
const now=1792164000000;
const challenge='ec'.repeat(32);
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const notice='b'.repeat(64);
const session='a'.repeat(64);
type Rig = ReturnType<typeof rig>;
function rig(){
  const custodian=generateKeyPairSync('ed25519');
  const deletion=generateKeyPairSync('ed25519');
  const freshness=generateKeyPairSync('ed25519');
  const key={keyId,keyBytes:randomBytes(32)};
  const scope={memberId:member,workId:work,generation:1,keyId,
    purpose:'append' as const};
  const check:DeletionHighwaterV1={
    protocol:'soullab.ws.deletion-highwater.v1',
    stream:'writers-studio-beta',
    generation:10,revokedWorks:[],revokedKeyIds:[],
  };
  const checkBuffer=canonicalDeletionPayload(check);
  const checkpointSha256=sha(checkBuffer);
  const baseLease:R26Lease={
    protocol:'soullab.ws.external-work-key-lease.r26',
    ...scope,challenge,issuedAtMs:now-1000,expiresAtMs:now+20000,
    keySha256:sha(key.keyBytes),checkpointSha256,
  };
  const fresh:R26Freshness={
    protocol:'soullab.ws.independent-highwater-witness.r26',
    memberId:member,workId:work,keyId,challenge,minimumGeneration:10,
    checkpointSha256,issuedAtMs:now-1000,expiresAtMs:now+20000,
  };
  const r26:R26VerifiedInput={
    scope,key,serverChallenge:challenge,nowMs:now,
    roots:{
      keyCustodian:custodian.publicKey,
      deletionAuthority:deletion.publicKey,
      independentFreshness:freshness.publicKey,
    },
    lease:{statement:baseLease,signature:sign(null,canonicalKeyLeaseR26(baseLease),
      custodian.privateKey).toString('base64')},
    freshness:{statement:fresh,signature:sign(null,canonicalFreshnessR26(fresh),
      freshness.privateKey).toString('base64')},
    deletion:{checkpoint:check,signature:sign(null,checkBuffer,
      deletion.privateKey).toString('base64')},
  };
  const initial:R29CurrentAdmission={
    memberId:member,sessionBindingSHA256:session,
    consentNoticeSHA256:notice,consentEventSequence:7,activeWriter:true,
  };
  const attestation:R29BoundAttestation={
    protocol:R29_PROTOCOL,leaseDigestSHA256:sha(canonicalKeyLeaseR26(baseLease)),
    ...scope,challenge,sessionBindingSHA256:session,
    consentNoticeSHA256:notice,consentEventSequence:7,
    issuedAtMs:now-1000,expiresAtMs:now+10000,
  };
  const signed:R29SignedBound={
    attestation,
    signature:sign(null,canonicalR29BoundLease(attestation),
      custodian.privateKey).toString('base64'),
  };
  const resign=(newAttestation:R29BoundAttestation):R29SignedBound=>({
    attestation:newAttestation,
    signature:sign(null,canonicalR29BoundLease(newAttestation),
      custodian.privateKey).toString('base64'),
  });
  return {r26,signed,initial,resign,scope};
}
const verified=(r:Rig)=>verifySessionBoundLeaseR29({
  r26:r.r26,signed:r.signed,initial:r.initial,nowMs:now,
});
type MutableFixtureInput = {
  -readonly [K in keyof Parameters<typeof rehearseSessionBoundWriteR29>[0]]:
    Parameters<typeof rehearseSessionBoundWriteR29>[0][K];
};
function fixtureInput(r:Rig){
  let current:R29CurrentAdmission|null={...r.initial};
  const commit=jest.fn(async()=>({saved:'fictional-only' as const}));
  const loadCurrentAdmission=jest.fn(async()=>current);
  const issue=jest.fn(async()=>({r26:r.r26,signed:r.signed}));
  const fence:R29FictionalWorkFence={
    authority:'fictional_work_revocation_lock_only',
    runHeld:async(_scope,cb)=>cb(),
  };
  const input: MutableFixtureInput={
    initial:r.initial,issue,loadCurrentAdmission,fence,commit,nowMs:()=>now,
  };
  return {
    input,commit,issue,loadCurrentAdmission,
    setCurrent:(x:R29CurrentAdmission|null)=>{current=x;},
  };
}
const flag='R29_SESSION_FENCE_FIXTURE';
const prior=process.env[flag];
beforeEach(()=>{process.env[flag]='fictional-only';});
afterAll(()=>{
  if(prior===undefined)delete process.env[flag];
  else process.env[flag]=prior;
});

describe('R29 session-consent cryptographic binding, offline fictional source',()=>{
  it('never enables real writer authoring or provisioned KMS',()=>{
    expect(R29_REAL_WRITER_AUTHORIZATION_ENABLED).toBe(false);
    const r=verified(rig());
    expect(r.kind).toBe('CRYPTOGRAPHIC_BINDING_ONLY');
    expect(r.releaseApproved).toBe(false);
    expect(r.workId).toBe(work);
  });
  it('refuses wrong current session, consent notice, epoch and member even if KMS signed old lease',()=>{
    for(const patch of [
      {sessionBindingSHA256:'c'.repeat(64)},
      {consentNoticeSHA256:'d'.repeat(64)},
      {consentEventSequence:8},
      {memberId:'44444444-4444-4444-8444-444444444444'},
    ]){
      const r=rig();
      r.initial={...r.initial,...patch};
      expect(()=>verified(r)).toThrow('r29_binding_scope_mismatch');
    }
  });
  it('refuses explicitly forged session binding or consent SHA in signed R29 payload',()=>{
    for(const patch of [
      {sessionBindingSHA256:'c'.repeat(64)},
      {consentNoticeSHA256:'d'.repeat(64)},
      {consentEventSequence:8},
      {leaseDigestSHA256:'f'.repeat(64)},
      {challenge:'ac'.repeat(32)},
      {generation:2},
    ]){
      const r=rig();
      const updated={...r.signed.attestation,...patch};
      r.signed=r.resign(updated);
      expect(()=>verified(r)).toThrow('r29_binding_scope_mismatch');
    }
  });
  it('requires valid signature from the R26-pinned Work key custodian',()=>{
    const r=rig();
    r.signed={...r.signed,signature:'A'.repeat(86)+'=='};
    expect(()=>verified(r)).toThrow('r29_invalid_binding_signature');
    const z=rig();
    z.signed={...z.signed,signature:sign(null,canonicalR29BoundLease(z.signed.attestation),
      generateKeyPairSync('ed25519').privateKey).toString('base64')};
    expect(()=>verified(z)).toThrow('r29_invalid_binding_signature');
  });
  it('refuses accidentally dropping consent/session fields or adding a raw token',()=>{
    const r=rig();
    delete (r.signed.attestation as unknown as Record<string,unknown>).consentNoticeSHA256;
    expect(()=>verified(r)).toThrow('r29_malformed_bound_lease');
    const z=rig();
    (z.signed.attestation as unknown as Record<string,unknown>).token='FAKE_SECRET';
    expect(()=>verified(z)).toThrow('r29_malformed_bound_lease');
  });
  it('rejects R29 lease expiry, clock skew, and attempts to outlive underlying R26 lease',()=>{
    const cases=[
      {issuedAtMs:now-1000,expiresAtMs:now},
      {issuedAtMs:now+4000,expiresAtMs:now+8000},
      {issuedAtMs:now-35000,expiresAtMs:now-3000},
      {issuedAtMs:now-1000,expiresAtMs:now+40000},
    ];
    for(const patch of cases){
      const r=rig();
      r.signed=r.resign({...r.signed.attestation,...patch});
      expect(()=>verified(r)).toThrow('r29_expired_or_untrusted_binding');
    }
  });
  it('refuses read/export privilege inferred from an append-only signed v2 grant',()=>{
    const r=rig();
    r.r26={...r.r26,scope:{...r.r26.scope,purpose:'read'}};
    expect(()=>verified(r)).toThrow('r29_unreviewed_purpose');
  });
  it('refuses a revoked Work even if the new R29 context is correctly signed',()=>{
    const r=rig();
    const cp=r.r26.deletion.checkpoint;
    r.r26={...r.r26,deletion:{
      ...r.r26.deletion,
      checkpoint:{...cp,revokedWorks:[work]},
    }};
    expect(()=>verified(r)).toThrow(); // Old R26 witnesses cannot authorize resurrection.
  });
  it('holds all operations when fictional-only environment is absent',async()=>{
    const r=rig(),f=fixtureInput(r);
    delete process.env[flag];
    expect(await rehearseSessionBoundWriteR29(f.input))
      .toEqual({kind:'refused',reason:'service_disabled'});
    expect(f.issue).not.toHaveBeenCalled();
    expect(f.commit).not.toHaveBeenCalled();
  });
  it('allows mock commit ONLY under mock Work revocation fence after repeated approval',async()=>{
    const r=rig(),f=fixtureInput(r);
    let inside=false;
    f.input.fence={
      authority:'fictional_work_revocation_lock_only',
      runHeld:async(_scope,cb)=>{
        inside=true;
        try{return await cb();} finally{inside=false;}
      },
    };
    f.input.commit=jest.fn(async()=>{
      expect(inside).toBe(true);
      return {saved:'fictional-only' as const};
    });
    const out=await rehearseSessionBoundWriteR29(f.input);
    expect(out.kind).toBe('fictional_fenced_only');
    expect(f.input.commit).toHaveBeenCalledTimes(1);
    expect(f.loadCurrentAdmission).toHaveBeenCalledTimes(1);
  });
  it('refuses consent withdrawal during external key call, before fenced write',async()=>{
    const r=rig(),f=fixtureInput(r);
    f.input.issue=async()=>{
      f.setCurrent({...r.initial,activeWriter:false,consentEventSequence:8});
      return {r26:r.r26,signed:r.signed};
    };
    const out=await rehearseSessionBoundWriteR29(f.input);
    expect(out).toEqual({kind:'refused',reason:'session_or_consent_changed'});
    expect(f.commit).not.toHaveBeenCalled();
  });
  it('refuses a new/revoked session during key service latency',async()=>{
    const r=rig(),f=fixtureInput(r);
    f.input.issue=async()=>{
      f.setCurrent({...r.initial,sessionBindingSHA256:'e'.repeat(64)});
      return {r26:r.r26,signed:r.signed};
    };
    expect(await rehearseSessionBoundWriteR29(f.input))
      .toEqual({kind:'refused',reason:'session_or_consent_changed'});
    expect(f.commit).not.toHaveBeenCalled();
  });
  it('rejects a new consent event even with same notice and active writer',async()=>{
    const r=rig(),f=fixtureInput(r);
    f.setCurrent({...r.initial,consentEventSequence:8});
    expect(await rehearseSessionBoundWriteR29(f.input))
      .toEqual({kind:'refused',reason:'session_or_consent_changed'});
    expect(f.commit).not.toHaveBeenCalled();
  });
  it('catches revocation after KMS returns but before Work coordinator lock',async()=>{
    const r=rig(),f=fixtureInput(r);
    f.input.fence={
      authority:'fictional_work_revocation_lock_only',
      runHeld:async(_scope,cb)=>{
        f.setCurrent({...r.initial,activeWriter:false,consentEventSequence:8});
        return cb();
      },
    };
    expect(await rehearseSessionBoundWriteR29(f.input))
      .toEqual({kind:'refused',reason:'session_or_consent_changed'});
    expect(f.commit).not.toHaveBeenCalled();
  });
  it('refuses expired lease while queued for the Work lock',async()=>{
    const r=rig(),f=fixtureInput(r);
    let clock=now;
    f.input.nowMs=()=>clock;
    f.input.fence={
      authority:'fictional_work_revocation_lock_only',
      runHeld:async(_scope,cb)=>{clock=now+22000;return cb();},
    };
    expect(await rehearseSessionBoundWriteR29(f.input))
      .toEqual({kind:'refused',reason:'fenced_write_refused'});
    expect(f.commit).not.toHaveBeenCalled();
  });
  it('fails closed on missing mock Work fence and outages',async()=>{
    const r=rig(),f=fixtureInput(r);
    f.input.fence=null as never;
    expect(await rehearseSessionBoundWriteR29(f.input))
      .toEqual({kind:'refused',reason:'authority_unavailable'});
    expect(f.commit).not.toHaveBeenCalled();

    const z=fixtureInput(r);
    z.input.issue=async()=>{throw new Error('private KMS token or user information');};
    expect(await rehearseSessionBoundWriteR29(z.input))
      .toEqual({kind:'refused',reason:'fenced_write_refused'});
    expect(z.commit).not.toHaveBeenCalled();
  });
});
