/**
 * R20-R3 — strict READ-ONLY boundary for an OUT-OF-DATABASE signed ledger,
 * head and separately signed monotonic trust pin.
 *
 * This is an adapter contract. No provisioned external service exists here.
 * Network I/O, certificate pinning, key provisioning and physically independent
 * custody MUST be supplied/reviewed separately. Injecting three providers in
 * a test does not certify their physical independence.
 *
 * Refuse if any of the three facts cannot be obtained; never fall back to the
 * database outbox, unsigned HTTP response, local backup or unsupervised signer.
 */
import { createPublicKey, verify } from 'node:crypto';
import { canonicalJSON, keyFingerprint } from '../r20-r2/signedLedger.mjs';
import {
  admitCapturedDeletionAuthority, assertOutboxCovered,
} from './capturedLedger.mjs';

export const PIN_FORMAT = 'SOULLAB-R20-R3-INDEPENDENT-HIGHWATER-PIN-V1';

function refuse(reason) { throw Error('R20 external anchor refused: ' + reason); }
function exact(obj, keys) {
  return obj && typeof obj === 'object' && !Array.isArray(obj) &&
    Object.keys(obj).length === keys.length &&
    keys.every(k => Object.prototype.hasOwnProperty.call(obj,k));
}
function verifiedSite(input) {
  if (typeof input !== 'string') refuse('configured witness site missing');
  let url;
  try {url=new URL(input);}catch{refuse('malformed witness site');}
  if (url.protocol !== 'https:' || url.username || url.password ||
      url.search || url.hash || url.port !== '') refuse('witness site lacks HTTPS-only origin');
  const hostname=url.hostname.toLowerCase();
  // WHATWG URL canonicalizes shorthand IPv4 (127.1 -> 127.0.0.1) and
  // IPv4-mapped IPv6 (::ffff:127.0.0.1 -> [::ffff:7f00:1]). Reject
  // the full 127/8 block and unspecified addresses, not just 127.0.0.1.
  // Public-looking hostnames still require separate DNS and physical-custody
  // evidence; URL validation alone never certifies independence.
  const loopbackV4=/^127(?:\.[0-9]{1,3}){3}$/.test(hostname);
  const mappedLoopbackV4=/^\[::ffff:7f[0-9a-f]{2}:[0-9a-f]{1,4}\]$/.test(hostname);
  if (!hostname || hostname==='localhost' || hostname.endsWith('.localhost') ||
      loopbackV4 || mappedLoopbackV4 || hostname==='0.0.0.0' ||
      hostname==='[::1]' || hostname==='[::]') {
    refuse('loopback or unspecified address cannot be independent witness custody');
  }
  return url.origin;
}
function verifiedPinRecord(signed, trustKey) {
  if (!exact(signed,['payload','algorithm','signer','signature']) ||
      signed.algorithm!=='Ed25519' ||
      signed.signer!==keyFingerprint(trustKey) ||
      typeof signed.signature!=='string') {
    refuse('trust pin not independently signed under approved public key');
  }
  const sig=Buffer.from(signed.signature,'base64');
  const key=trustKey?.type==='public'?trustKey:createPublicKey(trustKey);
  if(sig.length!==64 ||
     !verify(null,Buffer.from(canonicalJSON(signed.payload),'utf8'),key,sig)) {
    refuse('trust pin signature invalid');
  }
  const p=signed.payload;
  if (!exact(p,['schema','registryDigest','headDigest','minimumSequence']) ||
      p.schema!==PIN_FORMAT ||
      typeof p.registryDigest!=='string' || !/^[a-f0-9]{64}$/.test(p.registryDigest) ||
      typeof p.headDigest!=='string' || !/^[a-f0-9]{64}$/.test(p.headDigest) ||
      !Number.isSafeInteger(p.minimumSequence) || p.minimumSequence<1) {
    refuse('independent pin shape or content invalid');
  }
  return p;
}

/**
 * Callers must supply trusted PUBLIC keys from founder-reviewed configuration,
 * not retrieve them from the services they are supposedly authenticating.
 * getLedger/getHead/getPin are injected; this module has no network fallback.
 *
 * Returns conditional synthetic engineering evidence, NEVER production release
 * authority. Actual independent failure-domain proof is an operational gate.
 */
export async function readAndAdmitExternalCapturedAuthority({
  captureRegistry, locations, keys, transport, completeCommittedOutbox,
}) {
  if (!exact(locations,['ledger','head','pin']) ||
      !exact(keys,['ledgerPublicKey','headPublicKey','pinPublicKey']) ||
      !exact(transport,['getLedger','getHead','getPin']) ||
      !Array.isArray(completeCommittedOutbox)) {
    refuse('explicit three-way external custody contract required');
  }
  const sites = Object.values(locations).map(verifiedSite);
  if (new Set(sites).size!==3) {
    refuse('ledger, signed head and independent pin share a witness origin');
  }
  const keyHashes=[
    keyFingerprint(keys.ledgerPublicKey),
    keyFingerprint(keys.headPublicKey),
    keyFingerprint(keys.pinPublicKey),
  ];
  if (new Set(keyHashes).size!==3) refuse('all three custody roles require distinct keys');
  if (!Object.values(transport).every(value=>typeof value==='function')) {
    refuse('independent read providers unavailable');
  }
  let signedLedger,signedHead,signedPin;
  try {
    [signedLedger,signedHead,signedPin]=await Promise.all([
      transport.getLedger(locations.ledger),
      transport.getHead(locations.head),
      transport.getPin(locations.pin),
    ]);
  } catch {
    refuse('one or more independent authorities unavailable');
  }
  const pin=verifiedPinRecord(signedPin,keys.pinPublicKey);
  const admitted=admitCapturedDeletionAuthority({
    registry:captureRegistry,sealedLedger:signedLedger,sealedHead:signedHead,
    ledgerPublicKey:keys.ledgerPublicKey,headPublicKey:keys.headPublicKey,
    independentlyPinnedRegistryDigest:pin.registryDigest,
    independentlyPinnedHeadDigest:pin.headDigest,
    independentlyPinnedMinimumSequence:pin.minimumSequence,
  });
  const census=assertOutboxCovered(admitted,completeCommittedOutbox);
  return Object.freeze({
    state:'R20_EXTERNAL_ANCHOR_CONTRACT_SYNTHETIC_VERIFIED',
    witnessOriginCount:sites.length,
    independentKeyRoleCount:keyHashes.length,
    signedSequence:admitted.sequence,
    coveredOutboxCount:census.count,
    signedCaptureRelations:admitted.capturedTableCount,
    historicalRecoveryReadiness:'CANDIDATE_ONLY',
    productionPromotionAllowed:false,
    physicallyIndependentSignerCertified:false,
  });
}
