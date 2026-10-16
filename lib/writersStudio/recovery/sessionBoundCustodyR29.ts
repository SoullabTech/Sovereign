/**
 * R29 REVIEW-ONLY — session/consent-bound, signed extension of R26 custody.
 *
 * The existing R26 key lease does not sign current session or accepted notice.
 * R29 introduces a NEW domain-separated signed attestation that binds the
 * existing R26 lease digest, server session binding, latest accepted notice
 * and consent event sequence, Work, generation, purpose and challenge.
 *
 * This module does not connect AWS/KMS, open writer routes, store real keys or
 * establish an external commit/revocation lock. Fictional tests only.
 */
import { createHash, verify, type KeyObject } from 'node:crypto';
import {
  canonicalKeyLeaseR26, verifyExternalCustodyR26,
  type R26VerifiedInput,
  type R26Scope,
} from './externalCustodyContractR26';
import { WorkRecoveryRefusal } from './workEnvelopeV1';

export const R29_REAL_WRITER_AUTHORIZATION_ENABLED = false as const;
export const R29_PROTOCOL = 'soullab.ws.session-consent-bound-lease.r29' as const;
const SHA = /^[a-f0-9]{64}$/;
const MAX_MS = 30_000;
const FUTURE_MS = 2_000;
const reject = (s:string):never => { throw new WorkRecoveryRefusal('r29_'+s); };
const hash = (b:Buffer)=>createHash('sha256').update(b).digest('hex');
const exactKeys = (o:unknown,fields:readonly string[]):boolean =>
  !!o && typeof o==='object' && !Array.isArray(o) &&
  Object.keys(o).sort().join(',') === [...fields].sort().join(',');
const fields = [
  'protocol','leaseDigestSHA256','memberId','workId','keyId','generation',
  'purpose','challenge','sessionBindingSHA256','consentNoticeSHA256',
  'consentEventSequence','issuedAtMs','expiresAtMs',
] as const;

export type R29CurrentAdmission = Readonly<{
  /** Must originate from independently checked auth_sessions, never browser body. */
  memberId:string;
  /** Opaque binding minted by the verifier; never log or persist raw token. */
  sessionBindingSHA256:string;
  /** Exact approved notice digest, current in server consent policy. */
  consentNoticeSHA256:string;
  /** Latest immutable consent event number, monotonically increasing. */
  consentEventSequence:number;
  activeWriter:boolean;
}>;
export type R29BoundAttestation = Readonly<{
  protocol:typeof R29_PROTOCOL;
  leaseDigestSHA256:string;
  memberId:string;
  workId:string;
  keyId:string;
  generation:number;
  purpose:'append';
  challenge:string;
  sessionBindingSHA256:string;
  consentNoticeSHA256:string;
  consentEventSequence:number;
  issuedAtMs:number;
  expiresAtMs:number;
}>;
export type R29SignedBound = Readonly<{
  attestation:R29BoundAttestation;
  signature:string;
}>;
export type R29VerifiedBound = Readonly<{
  kind:'CRYPTOGRAPHIC_BINDING_ONLY';
  releaseApproved:false;
  memberId:string;
  workId:string;
  generation:number;
  challenge:string;
}>;
function validAdmission(a: R29CurrentAdmission | null | undefined): a is R29CurrentAdmission {
  return !!a && exactKeys(a,[
    'memberId','sessionBindingSHA256','consentNoticeSHA256','consentEventSequence',
    'activeWriter',
  ]) &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(a.memberId) &&
    SHA.test(a.sessionBindingSHA256) && SHA.test(a.consentNoticeSHA256) &&
    Number.isSafeInteger(a.consentEventSequence) && a.consentEventSequence>0 &&
    a.activeWriter===true;
}
function sameAdmission(a:R29CurrentAdmission,b:R29CurrentAdmission):boolean {
  return a.memberId===b.memberId &&
    a.sessionBindingSHA256===b.sessionBindingSHA256 &&
    a.consentNoticeSHA256===b.consentNoticeSHA256 &&
    a.consentEventSequence===b.consentEventSequence &&
    a.activeWriter===true && b.activeWriter===true;
}
export function canonicalR29BoundLease(a:R29BoundAttestation):Buffer {
  if(!exactKeys(a,fields) || a.protocol!==R29_PROTOCOL ||
    !SHA.test(a.leaseDigestSHA256) || !SHA.test(a.sessionBindingSHA256) ||
    !SHA.test(a.consentNoticeSHA256) || a.purpose!=='append' ||
    !Number.isSafeInteger(a.consentEventSequence) || a.consentEventSequence<1 ||
    !Number.isSafeInteger(a.issuedAtMs) || !Number.isSafeInteger(a.expiresAtMs))
    reject('malformed_bound_lease');
  // The R26 signer must sign these bytes *after* it has independently checked
  // the actual verified session and exact current consent notice.
  return Buffer.from(JSON.stringify([
    R29_PROTOCOL,a.leaseDigestSHA256,a.memberId,a.workId,a.keyId,a.generation,
    a.purpose,a.challenge,a.sessionBindingSHA256,a.consentNoticeSHA256,
    a.consentEventSequence,a.issuedAtMs,a.expiresAtMs,
  ]),'utf8');
}
function verifiedSignature(bytes:Buffer,sig:string,key:KeyObject):void {
  if(!key || key.type!=='public' || key.asymmetricKeyType!=='ed25519' ||
     typeof sig!=='string' || !/^[a-zA-Z0-9+/]{86}==$/.test(sig))
    reject('invalid_binding_signature');
  const raw=Buffer.from(sig,'base64');
  if(raw.length!==64 || raw.toString('base64')!==sig ||
     !verify(null,bytes,key,raw)) reject('invalid_binding_signature');
}
/**
 * Trusts only caller-pinned R26 roots; a malicious member cannot supply issuer
 * keys. Verifies OLD signed R26 lease and the NEW signed R29 context together.
 * Even success cannot prove the roots are independently administered.
 */
export function verifySessionBoundLeaseR29(input:{
  readonly r26:R26VerifiedInput;
  readonly signed:R29SignedBound;
  readonly initial:R29CurrentAdmission;
  readonly nowMs:number;
}):R29VerifiedBound {
  const {r26,signed,initial,nowMs}=input||{};
  if(!r26 || !validAdmission(initial) ||
    !signed || !exactKeys(signed,['attestation','signature']))
    reject('untrusted_session_or_attestation');
  if(r26.scope.purpose!=='append')reject('unreviewed_purpose');
  // Includes R26 signed Work lease, deletion checkpoint, independent witness
  // and the Work key digest; all existing R26 restrictions still apply.
  verifyExternalCustodyR26({...r26,nowMs});
  const a=signed.attestation;
  const bytes=canonicalR29BoundLease(a);
  const base= r26.lease.statement;
  const expectedDigest=hash(canonicalKeyLeaseR26(base));
  if (a.leaseDigestSHA256!==expectedDigest ||
      a.memberId!==r26.scope.memberId ||
      a.workId!==r26.scope.workId || a.keyId!==r26.scope.keyId ||
      a.generation!==r26.scope.generation || a.purpose!=='append' ||
      a.challenge!==r26.serverChallenge ||
      a.memberId!==initial.memberId ||
      a.sessionBindingSHA256!==initial.sessionBindingSHA256 ||
      a.consentNoticeSHA256!==initial.consentNoticeSHA256 ||
      a.consentEventSequence!==initial.consentEventSequence)
    reject('binding_scope_mismatch');
  if(!Number.isSafeInteger(nowMs) || !Number.isSafeInteger(a.issuedAtMs) ||
     !Number.isSafeInteger(a.expiresAtMs) ||
     a.expiresAtMs<=nowMs || a.issuedAtMs>nowMs+FUTURE_MS ||
     a.issuedAtMs<nowMs-MAX_MS ||
     a.expiresAtMs-a.issuedAtMs>MAX_MS ||
     a.expiresAtMs>base.expiresAtMs)
    reject('expired_or_untrusted_binding');
  verifiedSignature(bytes,signed.signature,r26.roots.keyCustodian);
  return {
    kind:'CRYPTOGRAPHIC_BINDING_ONLY',releaseApproved:false,
    memberId:a.memberId,workId:a.workId,
    generation:a.generation,challenge:a.challenge,
  };
}

/** Future Work coordinator interface; NOT implemented for real KMS. */
export type R29FictionalWorkFence = Readonly<{
  authority:'fictional_work_revocation_lock_only';
  /** Must serialize revocation and final version commit for one Work. */
  runHeld<T>(scope:R26Scope,work:()=>Promise<T>):Promise<T>;
}>;
export type R29FixtureOutcome<T> =
  | {kind:'refused';reason:'service_disabled'|'authority_unavailable'|
      'session_or_consent_changed'|'external_grant_invalid'|'fenced_write_refused'}
  | {kind:'fictional_fenced_only';value:T;releaseApproved:false};

/**
 * Explicitly does the second auth+consent check INSIDE a mock Work fence,
 * after key-service latency. The final callback may run only while the fence
 * holds. In production this must be an independent, revocation-serialized
 * authority, NOT a local mutex or a post-call DB check alone.
 *
 * No real route invokes this function; no real fence service exists.
 */
export async function rehearseSessionBoundWriteR29<T>(input:{
  readonly initial:R29CurrentAdmission;
  readonly issue:()=>Promise<{r26:R26VerifiedInput;signed:R29SignedBound}>;
  readonly loadCurrentAdmission:()=>Promise<R29CurrentAdmission|null>;
  readonly fence:R29FictionalWorkFence;
  readonly commit:()=>Promise<T>;
  readonly nowMs:()=>number;
}):Promise<R29FixtureOutcome<T>> {
  if(R29_REAL_WRITER_AUTHORIZATION_ENABLED!==false ||
     process.env.R29_SESSION_FENCE_FIXTURE!=='fictional-only')
    return {kind:'refused',reason:'service_disabled'};
  if(!input || !validAdmission(input.initial) ||
     input.fence?.authority!=='fictional_work_revocation_lock_only' ||
     typeof input.fence.runHeld!=='function')
    return {kind:'refused',reason:'authority_unavailable'};
  try {
    const issued=await input.issue();
    if(!issued) return {kind:'refused',reason:'authority_unavailable'};
    const proof=verifySessionBoundLeaseR29({
      ...issued,initial:input.initial,nowMs:input.nowMs(),
    });
    const scope=issued.r26.scope;
    const value=await input.fence.runHeld(scope,async()=>{
      const current=await input.loadCurrentAdmission();
      if(!current || !validAdmission(current) ||
         !sameAdmission(input.initial,current) ||
         current.memberId!==proof.memberId) {
        throw new WorkRecoveryRefusal('r29_session_or_consent_changed');
      }
      // The receipt may have expired while waiting to obtain the Work fence.
      verifySessionBoundLeaseR29({...issued,initial:current,nowMs:input.nowMs()});
      return input.commit();
    });
    return {kind:'fictional_fenced_only',value,releaseApproved:false};
  }catch(error){
    if(error instanceof WorkRecoveryRefusal &&
       error.code==='r29_session_or_consent_changed')
      return {kind:'refused',reason:'session_or_consent_changed'};
    return {kind:'refused',reason:'fenced_write_refused'};
  }
}
