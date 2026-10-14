/**
 * R20-R4 — fixture-only authenticated deletion-signing protocol.
 *
 * Outbox issuer signatures authenticate WHO made a claim; they do not prove
 * a real member was authenticated or a production DB transaction committed.
 * The production adapter MUST independently verify those facts.
 *
 * Never include member prose, filenames, Source bytes or key material.
 */
import { verify, sign } from 'node:crypto';
import { canonicalJSON, keyFingerprint } from '../r20-r2/signedLedger.mjs';
import { validateCaptureRegistry, validCapturedIdentity } from '../r20-r3/capturedLedger.mjs';

export const REQUEST_SCHEMA='SOULLAB-R20-R4-FICTIONAL-OUTBOX-APPEND-V1';
export const GENESIS_HEAD='0'.repeat(64);
const SHA=/^[0-9a-f]{64}$/;
const UUID=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/;
const NONCE=/^[0-9a-f]{32}$/;
const ROOTS=new Set(['member_manuscripts','living_works']);

export function reject(reason) {
  throw Error('R20-R4 signer refused: '+reason);
}
function exact(obj,keys) {
  return obj && typeof obj==='object' && !Array.isArray(obj) &&
    Object.keys(obj).length===keys.length &&
    keys.every(k=>Object.prototype.hasOwnProperty.call(obj,k));
}
export function validateFictionalOutboxPayload(payload,registry) {
  if (!exact(payload,['schema','nonce','sequence','priorHeadDigest','event']) ||
      payload.schema!==REQUEST_SCHEMA ||
      typeof payload.nonce!=='string' || !NONCE.test(payload.nonce) ||
      !Number.isSafeInteger(payload.sequence) || payload.sequence<1 ||
      typeof payload.priorHeadDigest!=='string' || !SHA.test(payload.priorHeadDigest)) {
    reject('invalid canonical signed append request');
  }
  const event=payload.event;
  if (!exact(event,['sequence','manifest','tombstones']) ||
      event.sequence!==payload.sequence ||
      typeof event.manifest!=='string' || !UUID.test(event.manifest) ||
      !Array.isArray(event.tombstones) || event.tombstones.length<1 ||
      event.tombstones.length>256) {
    reject('invalid committed-outbox event shape');
  }
  const registryMap=validateCaptureRegistry(registry);
  const seen=new Set();
  let hasRoot=false;
  for (const item of event.tombstones) {
    if (!exact(item,['table','id']) || !registryMap.has(item.table) ||
        !validCapturedIdentity(registryMap.get(item.table),item.id)) {
      reject('unknown or content-bearing deletion identity');
    }
    const identity=item.table+'/'+item.id;
    if(seen.has(identity)) reject('duplicate deletion identity');
    seen.add(identity);
    if(ROOTS.has(item.table)) hasRoot=true;
  }
  if (!hasRoot) reject('deletion lacks a bounded Work root');
  return Object.freeze({ sequence: payload.sequence,
    nonce: payload.nonce, priorHeadDigest: payload.priorHeadDigest,
    event: structuredClone(event) });
}
export function verifyAuthorizedOutboxClaim(envelope,publicKey,registry) {
  if (!exact(envelope,['payload','algorithm','signer','signature']) ||
      envelope.algorithm!=='Ed25519' ||
      envelope.signer!==keyFingerprint(publicKey) ||
      typeof envelope.signature!=='string' ||
      !/^[a-zA-Z0-9+/]{86}==$/.test(envelope.signature)) {
    reject('unrecognized or untrusted outbox authorizer');
  }
  const raw=Buffer.from(envelope.signature,'base64');
  if(raw.length!==64 || raw.toString('base64')!==envelope.signature ||
      !verify(null,Buffer.from(canonicalJSON(envelope.payload),'utf8'),publicKey,raw)) {
    reject('outbox attestation signature invalid');
  }
  return validateFictionalOutboxPayload(envelope.payload,registry);
}
export function makeFictionalOutboxClaim(payload,privateKey,publicKey) {
  const body=canonicalJSON(payload);
  const signature=sign(null,Buffer.from(body,'utf8'),privateKey).toString('base64');
  return {payload,algorithm:'Ed25519',signer:keyFingerprint(publicKey),signature};
}
export function verifyJsonRequestShape(request) {
  if (!exact(request,['action','fixtureOnly','claim']) ||
      request.action!=='APPEND_FICTIONAL_DELETION' ||
      request.fixtureOnly!==true) {
    reject('unknown service action or non-fictional target');
  }
  return request.claim;
}
