/**
 * R20-R3 — versioned deletion-ledger admission for the ACTUAL bounded Write/Work
 * cascade graph. SYNTHETIC ENGINEERING CANDIDATE: not a production signer.
 *
 * Unlike the original R20-R2 V1 experiment (five content lanes), V2 requires a
 * frozen exact schema/primary-key registry, signed into both ledger and head
 * AND pinned by a trust source independent of the database being recovered.
 *
 * Source/Vault paths, filenames, titles, content, content digests, model
 * responses and human notes are NEVER signed into this checkpoint.
 *
 * A valid signature cannot prove physical independence. Production must use
 * a signer/high-water service outside the DB, NAS snapshots, workstation and
 * any failure domain from which backups might be restored.
 */
import { createHash, createPublicKey, verify } from 'node:crypto';
import { canonicalJSON, digest, keyFingerprint } from '../r20-r2/signedLedger.mjs';

export const REGISTRY_FORMAT = 'SOULLAB-R20-R3-CAPTURE-COVERAGE-V1';
export const LEDGER_FORMAT = 'SOULLAB-R20-R3-CAPTURE-LEDGER-V2';
export const HEAD_FORMAT = 'SOULLAB-R20-R3-CAPTURE-HEAD-V2';
export const SYNTHETIC_ONLY = 'R20_DISPOSABLE_SYNTHETIC_ONLY';

const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/;
const INT = /^-?(?:0|[1-9][0-9]*)$/;
const NAME = /^[a-z_][a-z0-9_]*$/;
const SHA256 = /^[a-f0-9]{64}$/;
const ORIGIN = /^[a-zA-Z0-9_.:-]{1,80}$/;
const TYPES = new Set(['uuid', 'int4', 'int8']);
const ROOTS = new Set(['member_manuscripts', 'living_works']);
const MIN_INT8 = -(2n ** 63n), MAX_INT8 = 2n ** 63n - 1n;

function refusal(reason) { throw new Error('R20 captured authority refused: ' + reason); }
function exact(value, fields) {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length === fields.length &&
    fields.every(key => Object.prototype.hasOwnProperty.call(value, key));
}

export function validateCaptureRegistry(registry) {
  if (!exact(registry, ['schema', 'source', 'captureRoots', 'tables']) ||
      registry.schema !== REGISTRY_FORMAT ||
      registry.source !== 'synthetic_staging_schema_only' ||
      !Array.isArray(registry.captureRoots) ||
      [...registry.captureRoots].sort().join('|') !== [...ROOTS].sort().join('|') ||
      !Array.isArray(registry.tables) || registry.tables.length === 0) {
    refusal('unsupported or untrusted capture registry');
  }
  const map = new Map();
  for (const row of registry.tables) {
    if (!exact(row, ['table', 'primaryKey']) ||
        typeof row.table !== 'string' || !NAME.test(row.table) ||
        map.has(row.table) || !Array.isArray(row.primaryKey) ||
        row.primaryKey.length === 0 || row.primaryKey.length > 8) {
      refusal('invalid or duplicate registered table');
    }
    const cols = new Set();
    for (const key of row.primaryKey) {
      if (!exact(key, ['column', 'pgType']) ||
          !NAME.test(key.column) || cols.has(key.column) ||
          !TYPES.has(key.pgType)) {
        refusal('unsupported or duplicate registered primary key');
      }
      cols.add(key.column);
    }
    map.set(row.table, row.primaryKey);
  }
  if (![...ROOTS].every(root => map.has(root))) {
    refusal('authoritative deletion roots missing from captured graph');
  }
  const names = [...map.keys()];
  if (names.join('|') !== [...names].sort().join('|')) {
    refusal('capture registry is not in canonical table order');
  }
  return map;
}

/** Includes only schema, table/primary-key identifiers, never a Work's words. */
export function registryDigest(registry) {
  validateCaptureRegistry(registry);
  return digest(registry);
}

export function validCapturedIdentity(keys, opaqueValue) {
  if (typeof opaqueValue !== 'string' || opaqueValue.length > 512) return false;
  const values = opaqueValue.split(':');
  if (values.length !== keys.length) return false;
  return keys.every(({ pgType }, index) => {
    const v = values[index];
    if (pgType === 'uuid') return UUID.test(v);
    if (!INT.test(v) || v === '-0') return false;
    try {
      const n = BigInt(v);
      return pgType === 'int4'
        ? n >= -2147483648n && n <= 2147483647n
        : n >= MIN_INT8 && n <= MAX_INT8;
    } catch { return false; }
  });
}

function verifiedSigned(document, key, kind) {
  if (!exact(document, ['payload', 'algorithm', 'signer', 'signature']) ||
      document.algorithm !== 'Ed25519' ||
      typeof document.signature !== 'string' ||
      document.signer !== keyFingerprint(key)) {
    refusal('missing or unpinned signer for ' + kind);
  }
  const publicKey = key?.type === 'public' ? key : createPublicKey(key);
  const signature = Buffer.from(document.signature, 'base64');
  if (signature.length !== 64 ||
      !verify(null, Buffer.from(canonicalJSON(document.payload),'utf8'), publicKey, signature)) {
    refusal('invalid signature for ' + kind);
  }
  return document.payload;
}

/**
 * Requires TWO independently supplied public keys plus a separately pinned
 * registry digest, monotonic high-water floor and exact current signed head.
 * They cannot be derived from the backup being restored or from its database.
 * This pure function cannot prove the physical custody of those parameters.
 */
export function admitCapturedDeletionAuthority({
  registry, sealedLedger, sealedHead, ledgerPublicKey, headPublicKey,
  independentlyPinnedRegistryDigest,
  independentlyPinnedHeadDigest,
  independentlyPinnedMinimumSequence,
}) {
  if (!SHA256.test(independentlyPinnedRegistryDigest || '') ||
      !SHA256.test(independentlyPinnedHeadDigest || '') ||
      !Number.isSafeInteger(independentlyPinnedMinimumSequence) ||
      independentlyPinnedMinimumSequence < 1) {
    refusal('independent trust anchors or monotonic minimum unavailable');
  }
  const graph = validateCaptureRegistry(registry);
  const fingerprint = registryDigest(registry);
  if (fingerprint !== independentlyPinnedRegistryDigest) {
    refusal('capture registry differs from independent pin');
  }
  if (keyFingerprint(ledgerPublicKey) === keyFingerprint(headPublicKey)) {
    refusal('event signer and independent high-water signer cannot be the same key');
  }
  const ledger = verifiedSigned(sealedLedger, ledgerPublicKey, 'ledger');
  const head = verifiedSigned(sealedHead, headPublicKey, 'head');
  if (!exact(ledger, ['schema','sequence','captureRegistryDigest','events']) ||
      !exact(head, ['schema','sequence','captureRegistryDigest','ledgerDigest','issuedBy']) ||
      ledger.schema !== LEDGER_FORMAT || head.schema !== HEAD_FORMAT ||
      ledger.captureRegistryDigest !== fingerprint ||
      head.captureRegistryDigest !== fingerprint ||
      !Number.isSafeInteger(ledger.sequence) || ledger.sequence < 1 ||
      !Number.isSafeInteger(head.sequence) || head.sequence < 1 ||
      head.sequence !== ledger.sequence ||
      head.sequence < independentlyPinnedMinimumSequence ||
      !ORIGIN.test(head.issuedBy) ||
      head.ledgerDigest !== digest(ledger) ||
      digest(head) !== independentlyPinnedHeadDigest) {
    refusal('signed ledger, independent head or schema commitment incomplete or stale');
  }
  if (!Array.isArray(ledger.events) || ledger.events.length !== ledger.sequence) {
    refusal('signed deletion sequence contains a gap');
  }
  const seenManifests = new Set(), seenIdentities = new Set();
  let tombstoneCount = 0;
  for (let i = 0; i < ledger.events.length; i++) {
    const event = ledger.events[i];
    if (!exact(event, ['sequence','manifest','tombstones']) ||
        event.sequence !== i + 1 || typeof event.manifest !== 'string' ||
        !UUID.test(event.manifest) || seenManifests.has(event.manifest) ||
        !Array.isArray(event.tombstones) || event.tombstones.length === 0) {
      refusal('invalid, unordered or duplicate deletion event');
    }
    seenManifests.add(event.manifest);
    let containsRoot = false;
    for (const target of event.tombstones) {
      if (!exact(target, ['table','id']) ||
          typeof target.table !== 'string' ||
          !graph.has(target.table) ||
          !validCapturedIdentity(graph.get(target.table), target.id)) {
        refusal('unregistered, non-opaque or content-bearing deletion identity');
      }
      const key = target.table + '/' + target.id;
      if (seenIdentities.has(key)) refusal('duplicate signed deletion identity');
      seenIdentities.add(key);
      if (ROOTS.has(target.table)) containsRoot = true;
      tombstoneCount++;
    }
    if (!containsRoot) refusal('deletion event does not tombstone a bounded root');
  }
  return Object.freeze({
    state: 'CAPTURED_SIGNED_AUTHORITY_VERIFIED_CONDITIONALLY',
    sequence: ledger.sequence,
    registryDigest: fingerprint,
    signedHeadDigest: digest(head),
    tombstoneCount,
    capturedTableCount: graph.size,
    // Cryptography alone cannot make trust custody independent or certify
    // production restore, even if all signatures mathematically verify.
    productionSignerCertified: false,
    productionPromotionAllowed: false,
    events: structuredClone(ledger.events),
  });
}

/**
 * Any outbox manifest absent from the verified independent head is still owed
 * and therefore must HOLD restoration/erasure-complete statements. This is
 * evidence comparison only; exporting/signing are separate privileged services.
 */
export function assertOutboxCovered(admission, outboxEntries) {
  if (admission?.productionPromotionAllowed !== false ||
      !Array.isArray(admission?.events) || !Array.isArray(outboxEntries)) {
    refusal('signed outbox coverage input unavailable');
  }
  // In this candidate the independent full ledger is append-only. An outbox
  // census that omits even one committed manifest must NEVER be stamped
  // complete. This assumes the caller read the complete committed outbox in
  // one consistent snapshot; the production DB adapter must prove that fact.
  if (outboxEntries.length === 0 || outboxEntries.length !== admission.events.length) {
    refusal('complete committed outbox census does not equal signed ledger history');
  }
  const indexed = new Map(admission.events.map(e => [e.manifest,e]));
  const seen = new Set();
  for (const item of outboxEntries) {
    if (!exact(item, ['manifest','tombstones']) ||
        seen.has(item.manifest) || !Array.isArray(item.tombstones)) {
      refusal('incomplete outbox evidence');
    }
    seen.add(item.manifest);
    const signed = indexed.get(item.manifest);
    if (!signed) refusal('committed deletion missing from independent signed ledger');
    const norm = a => a.map(v => canonicalJSON(v)).sort();
    if (canonicalJSON(norm(item.tombstones)) !== canonicalJSON(norm(signed.tombstones))) {
      refusal('signed deletion identities differ from committed outbox');
    }
  }
  return Object.freeze({ allPresentedObligationsAnchored: true, count: seen.size,
    productionPromotionAllowed: false });
}

/** Intentionally no raw SQL, filesystem writes, network or private-key import. */
export const RECOVERY_STATUS = Object.freeze({
  syntheticAdapterOnly: true,
  separateProductionSignerNeeded: true,
  unconditionalProductionRelease: false,
});
