/**
 * R20-R2 independent deletion checkpoint verifier, protocol candidate only.
 * Ed25519 signatures authenticate checkpoints, but independent custody,
 * hardware key management and an external monotonic high-water are still
 * required before production use.
 *
 * No signing keys, member content or production identifiers are stored here.
 */
import { createHash, sign, verify, createPublicKey } from 'node:crypto';

export const LEDGER_FORMAT = 'SOULLAB-R20-R2-LEDGER-V1';
export const HEAD_FORMAT = 'SOULLAB-R20-R2-HEAD-V1';

function refuse(reason) {
  throw new Error('R20 recovery refused: ' + reason);
}

export function canonicalJSON(value) {
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol' ||
      (typeof value === 'number' && !Number.isSafeInteger(value))) {
    refuse('unsupported checkpoint value');
  }
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalJSON).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((key) => {
    if (value[key] === undefined) refuse('undefined data in checkpoint');
    return JSON.stringify(key) + ':' + canonicalJSON(value[key]);
  }).join(',') + '}';
}

export function digest(payload) {
  return createHash('sha256').update(canonicalJSON(payload), 'utf8').digest('hex');
}

export function keyFingerprint(publicKey) {
  // Trust anchors must be public-only. Never silently derive a trust anchor
  // from a caller-supplied signing/private key.
  if (publicKey?.type === 'private' ||
      (typeof publicKey === 'string' && !publicKey.includes('-----BEGIN PUBLIC KEY-----'))) {
    refuse('pinned verification key is not a public-only key');
  }
  const key = publicKey?.type === 'public' ? publicKey : createPublicKey(publicKey);
  if (key.type !== 'public' || key.asymmetricKeyType !== 'ed25519') {
    refuse('non-Ed25519 public verification key');
  }
  return createHash('sha256').update(key.export({ type: 'spki', format: 'der' })).digest('hex');
}

/** Used only with externally held keys; never generates a production key. */
export function seal(payload, privateKey, publicKey) {
  if (!payload || typeof payload !== 'object') refuse('invalid payload');
  const bytes = Buffer.from(canonicalJSON(payload), 'utf8');
  const sig = sign(null, bytes, privateKey);
  return { payload, algorithm: 'Ed25519', signer: keyFingerprint(publicKey), signature: sig.toString('base64') };
}

function openSeal(document, publicKey) {
  if (!document || typeof document !== 'object' || !document.payload ||
      document.algorithm !== 'Ed25519' || typeof document.signature !== 'string' ||
      document.signer !== keyFingerprint(publicKey)) {
    refuse('missing or incorrect independently pinned signer');
  }
  const signature = Buffer.from(document.signature, 'base64');
  if (signature.length !== 64 ||
      !verify(null, Buffer.from(canonicalJSON(document.payload), 'utf8'), publicKey, signature)) {
    refuse('invalid checkpoint signature');
  }
  return document.payload;
}

function hasExactKeys(object, required) {
  return object !== null && typeof object === 'object' && !Array.isArray(object) &&
    Object.keys(object).length === required.length &&
    required.every(key => Object.prototype.hasOwnProperty.call(object, key));
}

const TABLES = new Set([
  'member_manuscripts', 'living_works', 'conversation_turns', 'agent_runs', 'integration_passes',
]);
const ID = /^[a-zA-Z0-9_.:-]{1,128}$/;
const SHA = /^[a-f0-9]{64}$/;
function validObject(item) {
  return item && typeof item === 'object' && TABLES.has(item.table) &&
    typeof item.id === 'string' && ID.test(item.id);
}

export function admitSignedDeletionAuthority({
  sealedLedger, sealedHead, ledgerPublicKey, headPublicKey,
  independentlyPinnedMinimumSequence,
  independentlyPinnedHeadDigest,
}) {
  // These two pinned values MUST originate outside the restorable database
  // and outside the potentially-contaminated backup/snapshot being restored.
  if (!Number.isSafeInteger(independentlyPinnedMinimumSequence) ||
      independentlyPinnedMinimumSequence < 1 ||
      !SHA.test(independentlyPinnedHeadDigest || '')) {
    refuse('independent high-water and head commitment unavailable');
  }
  const ledger = openSeal(sealedLedger, ledgerPublicKey);
  const head = openSeal(sealedHead, headPublicKey);
  if (!hasExactKeys(ledger, ['schema', 'sequence', 'events']) ||
      !hasExactKeys(head, ['schema', 'sequence', 'ledgerDigest', 'issuedBy']) ||
      ledger.schema !== LEDGER_FORMAT || head.schema !== HEAD_FORMAT) {
    refuse('unsupported or content-bearing checkpoint format');
  }
  if (!Number.isSafeInteger(ledger.sequence) || ledger.sequence < 1 ||
      !Number.isSafeInteger(head.sequence) || head.sequence < 1) {
    refuse('invalid checkpoint sequence');
  }
  if (head.sequence < independentlyPinnedMinimumSequence ||
      head.sequence !== ledger.sequence) {
    refuse('rolled-back or incomplete signed ledger');
  }
  if (digest(head) !== independentlyPinnedHeadDigest) {
    refuse('signed head differs from independent pin');
  }
  if (head.ledgerDigest !== digest(ledger)) {
    refuse('ledger does not match signed independent head');
  }
  if (!Array.isArray(ledger.events) || ledger.events.length !== ledger.sequence) {
    refuse('deletion event sequence contains gaps');
  }
  const seen = new Set();
  for (let i = 0; i < ledger.events.length; i += 1) {
    const event = ledger.events[i];
    if (!hasExactKeys(event, ['sequence', 'manifest', 'tombstones', 'scopes']) ||
        event.sequence !== i + 1 ||
        typeof event.manifest !== 'string' || !ID.test(event.manifest) ||
        seen.has(event.manifest)) {
      refuse('duplicate, missing or out-of-order deletion event');
    }
    seen.add(event.manifest);
    if (!Array.isArray(event.tombstones) || !Array.isArray(event.scopes) ||
        (event.tombstones.length === 0 && event.scopes.length === 0)) {
      refuse('deletion event does not identify a refusal target');
    }
    if (!event.tombstones.every(item => hasExactKeys(item, ['table', 'id']) && validObject(item))) {
      refuse('unknown object identity or content-bearing tombstone');
    }
    for (const scope of event.scopes) {
      const permitted = ['table', 'memberId', 'sessionId', 'windowStart', 'windowEnd'];
      if (!scope || typeof scope !== 'object' || Array.isArray(scope) ||
          Object.keys(scope).some(key => !permitted.includes(key)) ||
          !TABLES.has(scope.table) ||
          (typeof scope.memberId !== 'string' && typeof scope.sessionId !== 'string')) {
        refuse('unscoped, unknown or content-bearing deletion scope');
      }
      if (scope.memberId != null && !ID.test(scope.memberId)) refuse('invalid member scope');
      if (scope.sessionId != null && !ID.test(scope.sessionId)) refuse('invalid session scope');
      for (const key of ['windowStart', 'windowEnd']) {
        if (scope[key] != null && (typeof scope[key] !== 'string' ||
            !Number.isFinite(Date.parse(scope[key])) ||
            !/Z$|[+-][0-9]{2}:[0-9]{2}$/.test(scope[key]))) {
          refuse('invalid time-window boundary');
        }
      }
      if (scope.windowStart && scope.windowEnd &&
          Date.parse(scope.windowStart) > Date.parse(scope.windowEnd)) {
        refuse('reversed deletion time window');
      }
    }
  }
  return Object.freeze({
    admitted: true,
    latestSequence: ledger.sequence,
    signedLedgerDigest: digest(ledger),
    pinnedHeadDigest: digest(head),
    tombstoneCount: ledger.events.reduce((n, x) => n + x.tombstones.length, 0),
    scopeCount: ledger.events.reduce((n, x) => n + x.scopes.length, 0),
  });
}
