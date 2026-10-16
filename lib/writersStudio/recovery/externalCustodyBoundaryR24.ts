/**
 * R24 HELD — independently pinned custody-lease verification contract.
 *
 * This DOES NOT install a real external key/antirollback provider. The only
 * supported issuer in R24 tests is synthetic. Production stays hard-disabled.
 *
 * The system signing Work leases must be separate from the app's SQL/vault
 * and from old backup media. Trust roots MUST come from a reviewed operator,
 * never from a lease, request body, saved Work or restored database.
 */
import {createHash,verify,type KeyObject} from 'node:crypto';
import {requireCurrentRestoreAuthorization,
  type SignedDeletionHighwaterV1,type IndependentGenerationWitness,
} from './deletionBarrierV1';
import {WorkRecoveryRefusal,type WorkEncryptionKey} from './workEnvelopeV1';

export const R24_REAL_EXTERNAL_CUSTODY_ENABLED=false as const;
export const R24_LEASE_PROTOCOL='soullab.ws.external-work-lease.r24' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const B64=/^[A-Za-z0-9+/]{86}==$/;
const NONCE=/^[a-f0-9]{32}$/;
const SHA=/^[a-f0-9]{64}$/;
const MAX_LEASE_MS=60_000;
const MAX_CLOCK_SKEW_MS=5_000;

export type R24Scope={
 memberId:string;workId:string;generation:number;operation:'append'|'read';
};
export type R24Lease={
 protocol:typeof R24_LEASE_PROTOCOL;
 scope:R24Scope;
 keyId:string;
 keyDigest:string;
 deletionGeneration:number;
 nonce:string;
 issuedAtMs:number;
 expiresAtMs:number;
};
export type R24SignedLease={lease:R24Lease;signature:string};
export type R24LeaseKeyPackage={
 signedLease:R24SignedLease;
 key:WorkEncryptionKey;
 signedDeletion:SignedDeletionHighwaterV1;
};
/** Must be backed by a separately governed, durable, antirollback service. */
export type R24ExternallyPinnedAuthority={
 pinnedLeaseSigner:KeyObject;
 pinnedDeletionSigner:KeyObject;
 minimumDeletionGeneration(scope:R24Scope):Promise<number>;
 consumeNonce(lease:R24Lease):Promise<boolean>;
};
export type R24HeldGrant={
 scope:R24Scope;key:WorkEncryptionKey;
 deletion:{
  signed:SignedDeletionHighwaterV1;
  trustedSigner:KeyObject;
  independent:IndependentGenerationWitness;
 };
};
const refuse=(s:string):never=>{throw new WorkRecoveryRefusal(s)};
const id=(value:string):string=>{
 if(typeof value!=='string'||!UUID.test(value))refuse('r24_invalid_scope_id');
 return value.toLowerCase();
};
const exact=(a:R24Scope,b:R24Scope):boolean=>
 a.memberId===b.memberId&&a.workId===b.workId&&
 a.generation===b.generation&&a.operation===b.operation;
function scopeValue(s:R24Scope):R24Scope{
 if(!s||!['append','read'].includes(s.operation)||
   !Number.isSafeInteger(s.generation)||s.generation<1)
  refuse('r24_invalid_scope');
 return {memberId:id(s.memberId),workId:id(s.workId),
  generation:s.generation,operation:s.operation};
}
export function canonicalR24Lease(raw:R24Lease):Buffer{
 if(!raw||raw.protocol!==R24_LEASE_PROTOCOL||
 typeof raw.keyId!=='string'||!UUID.test(raw.keyId)||
 !NONCE.test(raw.nonce)||
 !Number.isSafeInteger(raw.deletionGeneration)||raw.deletionGeneration<1||
 !Number.isSafeInteger(raw.issuedAtMs)||
 !Number.isSafeInteger(raw.expiresAtMs)||
 raw.expiresAtMs<=raw.issuedAtMs||
 raw.expiresAtMs-raw.issuedAtMs>MAX_LEASE_MS)
   refuse('r24_invalid_lease');
 const scope=scopeValue(raw.scope);
 // A strict, versioned, ordered canonical body — no locale or JSON field order.
 return Buffer.from(JSON.stringify([
  R24_LEASE_PROTOCOL,scope.memberId,scope.workId,scope.generation,
  scope.operation,raw.keyId.toLowerCase(),raw.keyDigest,raw.deletionGeneration,
  raw.nonce,raw.issuedAtMs,raw.expiresAtMs]),'utf8');
}
function verifiedSignedLease(input:R24SignedLease,trust:KeyObject,
 expected:R24Scope,nowMs:number):R24Lease{
 if(!input?.lease||!input.signature||!trust||
   trust.asymmetricKeyType!=='ed25519'||!B64.test(input.signature))
    refuse('r24_untrusted_lease');
 const canonical=canonicalR24Lease(input.lease);
 const signature=Buffer.from(input.signature,'base64');
 if(signature.length!==64||signature.toString('base64')!==input.signature||
    !verify(null,canonical,trust,signature))
     refuse('r24_lease_signature_refused');
 const raw=input.lease,sc=scopeValue(raw.scope);
 if(!exact(sc,expected))refuse('r24_scope_substitution_refused');
 if(nowMs<raw.issuedAtMs-MAX_CLOCK_SKEW_MS||
   nowMs>raw.expiresAtMs)refuse('r24_lease_expired_or_future');
 return raw;
}
function acceptedKey(key:WorkEncryptionKey,keyId:string,keyDigest:string):WorkEncryptionKey{
 if(!key||!UUID.test(key.keyId)||key.keyId.toLowerCase()!==keyId.toLowerCase()||
    !Buffer.isBuffer(key.keyBytes)||key.keyBytes.length!==32||
 createHash('sha256').update(key.keyBytes).digest('hex')!==keyDigest)
    refuse('r24_scoped_key_invalid');
 return key;
}
/**
 * An app server consumes only a lease with an operator-pinned public key, an
 * independently durable current deletion epoch, and a separately persisted
 * one-use nonce record. No fallback on provider outage. Called only AFTER
 * R17 independently validates session + invitation + consent.
 *
 * R24's exact fictional-only flag is not a production deployment switch.
 * NEVER turn it into an environment-controlled real-member enablement flag.
 */
export async function reviewR24HeldCustodyLease(input:{
 scope:R24Scope;package:R24LeaseKeyPackage;
 authority:R24ExternallyPinnedAuthority;nowMs?:number;
}):Promise<R24HeldGrant>{
 if(process.env.R24_INDEPENDENT_AUTHORITY_FIXTURE!=='fictional-only')
    refuse('r24_real_custody_unavailable');
 const expected=scopeValue(input?.scope);
 if(!input?.authority||typeof input.authority.consumeNonce!=='function'||
    typeof input.authority.minimumDeletionGeneration!=='function'||
    !input.authority.pinnedLeaseSigner||
    !input.authority.pinnedDeletionSigner||
    input.authority.pinnedDeletionSigner.asymmetricKeyType!=='ed25519')
    refuse('r24_external_authority_unavailable');
 const now=input.nowMs??Date.now();
 if(!Number.isSafeInteger(now))refuse('r24_invalid_time');
 const pack=input.package;
 if(!pack?.signedLease||!pack.signedDeletion)refuse('r24_missing_trust_proofs');
 const lease=verifiedSignedLease(pack.signedLease,
   input.authority.pinnedLeaseSigner,expected,now);
 const key=acceptedKey(pack.key,lease.keyId,lease.keyDigest);
 let floor=Number.NaN;
 try{floor=await input.authority.minimumDeletionGeneration(expected);}
 catch{refuse('r24_independent_generation_unavailable');}
 if(!Number.isSafeInteger(floor)||floor<1||
   floor!==lease.deletionGeneration)
   refuse('r24_independent_generation_mismatch');
 requireCurrentRestoreAuthorization({
  request:{workId:expected.workId,keyId:key.keyId,
   snapshotGeneration:expected.generation},
  signed:pack.signedDeletion,trustedSigner:input.authority.pinnedDeletionSigner,
  independent:{minimumGeneration:floor},
 });
 let consumed=false;
 try{consumed=await input.authority.consumeNonce(lease);}
 catch{refuse('r24_nonce_authority_unavailable');}
 if(consumed!==true)refuse('r24_lease_replay_refused');
 return {scope:expected,key,deletion:{
   signed:pack.signedDeletion,trustedSigner:input.authority.pinnedDeletionSigner,
   independent:{minimumGeneration:floor},
 }};
}
