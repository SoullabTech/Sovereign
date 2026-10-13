/**
 * R20-R3J: durable checkpoint signing *fixture*, NOT a production signer.
 *
 * Every checkpoint is signed by THREE external callback roles (ledger/head/pin)
 * and fsync'd to four isolated fixture directories, with commit published last.
 * Incomplete generations, unknown files, missing authority or rollback refuse.
 *
 * A shared host/filesystem, test signing keys, and caller-supplied committed
 * outbox DO NOT prove physically independent custody or production finality.
 * No production network, member data, database, keys, NAS or restore paths.
 */
import { promises as fs, constants } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { canonicalJSON, digest } from '../r20-r2/signedLedger.mjs';
import {
  LEDGER_FORMAT, HEAD_FORMAT, registryDigest,
} from './capturedLedger.mjs';
import {
  PIN_FORMAT, readAndAdmitExternalCapturedAuthority,
} from './externalAnchorBoundary.mjs';

export const TARGET = 'R20_R3J_FICTIONAL_DURABLE_AUTHORITY_ONLY';
const ROLES = Object.freeze(['ledger', 'head', 'pin', 'commit']);
const SERIAL = /^checkpoint-(?:0{0,11}[1-9][0-9]{0,11})\.json$/;

function refuse(reason) { throw Error('R20-R3J durable authority refused: ' + reason); }
function filename(n) { return 'checkpoint-' + String(n).padStart(12, '0') + '.json'; }

async function verifyFixtureRoot(root) {
  if (typeof root !== 'string' || !path.isAbsolute(root) ||
      !path.resolve(root).startsWith(path.join(os.tmpdir(), 'r20-r3j-fixture-'))) {
    refuse('non-fixture storage location');
  }
  const real = await fs.realpath(root).catch(() => refuse('fixture root missing'));
  // macOS maps /var to /private/var; do not mistake this trusted OS prefix
  // alias for a symlink at the root directory itself.
  const realTmp = await fs.realpath(os.tmpdir());
  if (!real.startsWith(path.join(realTmp, 'r20-r3j-fixture-'))) {
    refuse('fixture root escaped trusted temporary directory');
  }
  const base = await fs.lstat(root);
  if (!base.isDirectory() || base.isSymbolicLink()) refuse('unsafe fixture root');
  const dirs = {};
  for (const role of ROLES) {
    const dir = path.join(root, role);
    try { await fs.mkdir(dir, { mode: 0o700 }); }
    catch (error) { if (error.code !== 'EEXIST') refuse('fixture directory unavailable'); }
    const stat = await fs.lstat(dir);
    if (!stat.isDirectory() || stat.isSymbolicLink() ||
        await fs.realpath(dir) !== path.join(real, role)) {
      refuse('unsafe fixture witness directory');
    }
    dirs[role] = dir;
  }
  return dirs;
}

async function syncedExclusiveWrite(dir, name, data) {
  const file = path.join(dir, name);
  const flags = constants.O_CREAT | constants.O_EXCL |
    constants.O_WRONLY | (constants.O_NOFOLLOW || 0);
  let fd;
  try {
    fd = await fs.open(file, flags, 0o600);
    await fd.writeFile(data, 'utf8');
    await fd.sync();
  } catch {
    refuse('immutable checkpoint write failed');
  } finally {
    if (fd) await fd.close();
  }
  const parent = await fs.open(dir, constants.O_RDONLY);
  try { await parent.sync(); } finally { await parent.close(); }
}

async function snapshotCensus(dirs) {
  const sets = await Promise.all(ROLES.map(async role => {
    const entries = (await fs.readdir(dirs[role])).sort();
    const sequence = [];
    for (const entry of entries) {
      if (!SERIAL.test(entry)) refuse('unrecognized or contaminated checkpoint directory');
      const number = Number(entry.slice('checkpoint-'.length, -'.json'.length));
      if (!Number.isSafeInteger(number) || number < 1 || filename(number) !== entry) {
        refuse('noncanonical checkpoint generation');
      }
      const stat = await fs.lstat(path.join(dirs[role], entry));
      if (!stat.isFile() || stat.isSymbolicLink()) refuse('unsafe checkpoint file');
      sequence.push(number);
    }
    return sequence;
  }));
  const count = sets[0].length;
  for (const list of sets) {
    if (list.length !== count || list.some((value, i) => value !== i + 1)) {
      refuse('partial rollback or unpublished checkpoint generation');
    }
  }
  return count;
}

async function loadCheckpoint(dirs, n) {
  const parts = await Promise.all(ROLES.map(async role => {
    try {
      return JSON.parse(await fs.readFile(path.join(dirs[role], filename(n)), 'utf8'));
    } catch { refuse('checkpoint missing corrupt or unreadable'); }
  }));
  const [sealedLedger, sealedHead, sealedPin, marker] = parts;
  if (marker?.schema !== 'R20_R3J_SYNTHETIC_COMMIT_V1' ||
      marker?.sequence !== n ||
      marker?.ledgerDigest !== digest(sealedLedger) ||
      marker?.headDigest !== digest(sealedHead) ||
      marker?.pinDigest !== digest(sealedPin) ||
      Object.keys(marker).length !== 5) refuse('checkpoint publication marker mismatch');
  return { sealedLedger, sealedHead, sealedPin };
}

async function verifyCheckpoint({
  captureRegistry, locations, keys, completeCommittedOutbox, checkpoint,
}) {
  return readAndAdmitExternalCapturedAuthority({
    captureRegistry, locations, keys,
    // The R20 captured-graph verifier accepts a content-minimal outbox
    // identity projection, NOT the sequence-bearing signed ledger format.
    completeCommittedOutbox: completeCommittedOutbox.map(
      ({ manifest, tombstones }) => ({ manifest, tombstones }),
    ),
    transport: {
      getLedger: async () => checkpoint.sealedLedger,
      getHead: async () => checkpoint.sealedHead,
      getPin: async () => checkpoint.sealedPin,
    },
  });
}

function validatedOutbox(entries) {
  if (!Array.isArray(entries) || entries.length === 0 ||
      entries.some((event, i) => !event ||
        event.sequence !== i + 1 || typeof event.manifest !== 'string' ||
        !Array.isArray(event.tombstones) || event.tombstones.length === 0)) {
    refuse('complete committed fictional outbox required');
  }
  return entries;
}

async function validatedState(dirs, captureRegistry, locations, keys, committed) {
  const count = await snapshotCensus(dirs);
  if (count === 0) return { count: 0, latest: null };
  if (!Array.isArray(committed) || committed.length !== count) {
    refuse('outbox is not the complete committed signed generation');
  }
  let last = null;
  for (let n = 1; n <= count; n++) {
    const checkpoint = await loadCheckpoint(dirs, n);
    const expected = committed.slice(0, n);
    if (canonicalJSON(checkpoint.sealedLedger.payload?.events) !== canonicalJSON(expected)) {
      refuse('previous signed event history differs from committed outbox');
    }
    const admission = await verifyCheckpoint({
      captureRegistry, locations, keys, completeCommittedOutbox: expected,
      checkpoint,
    });
    if (admission.signedSequence !== n ||
        admission.productionPromotionAllowed !== false ||
        admission.physicallyIndependentSignerCertified !== false) {
      refuse('invalid signed checkpoint generation');
    }
    last = { checkpoint, admission };
  }
  return { count, latest: last };
}

/**
 * Read all checkpoint generations; never trust a "latest" file that an old
 * database snapshot might roll back. The complete committed outbox must be
 * supplied independently by a real deployment (NOT implemented here).
 */
export async function readDurableFixtureAuthority({
  target, root, captureRegistry, locations, keys, completeCommittedOutbox,
}) {
  if (target !== TARGET) refuse('synthetic target only');
  const dirs = await verifyFixtureRoot(root);
  const outbox = validatedOutbox(completeCommittedOutbox);
  const state = await validatedState(dirs, captureRegistry, locations, keys, outbox);
  if (state.count === 0) refuse('no committed signed checkpoint');
  return Object.freeze({
    state: 'R20_R3J_FICTIONAL_DURABLE_CHECKPOINT',
    signedSequence: state.latest.admission.signedSequence,
    signedHeadDigest: state.latest.admission.signedHeadDigest,
    coveredOutboxCount: state.latest.admission.coveredOutboxCount,
    productionPromotionAllowed: false,
    physicallyIndependentSignerCertified: false,
    checkpoint: state.latest.checkpoint,
  });
}

/**
 * Immutable publication order: ledger -> head -> pin -> commit marker.
 * Every stage is fsync'd. A crash before commit leaves detectable partial
 * artifacts and blocks future recovery; never silently repairs/purges them.
 * Test hook crashAfter is FICTIONAL ONLY and cannot select production media.
 */
export async function appendDurableFixtureCheckpoint({
  target, root, captureRegistry, locations, keys, committedOutbox,
  signers, crashAfter,
}) {
  if (target !== TARGET) refuse('synthetic target only');
  if (!signers || !['ledger', 'head', 'pin'].every(
    key => typeof signers[key] === 'function',
  )) refuse('three independent signing callback roles required');
  const dirs = await verifyFixtureRoot(root);
  const outbox = validatedOutbox(committedOutbox);
  // Already-stored signed history is checked against a known current prefix.
  const existing = await snapshotCensus(dirs);
  if (existing > 0) await validatedState(
    dirs, captureRegistry, locations, keys, outbox.slice(0, existing),
  );
  if (outbox.length !== existing + 1) {
    refuse('exactly one new committed fictional deletion required');
  }

  const n = outbox.length;
  const registry = registryDigest(captureRegistry);
  const ledgerPayload = {
    schema: LEDGER_FORMAT, sequence: n,
    captureRegistryDigest: registry, events: outbox,
  };
  const sealedLedger = await signers.ledger(ledgerPayload);
  const headPayload = {
    schema: HEAD_FORMAT, sequence: n, captureRegistryDigest: registry,
    ledgerDigest: digest(ledgerPayload), issuedBy: 'R20_R3J_FICTIONAL_CUSTODIAN',
  };
  const sealedHead = await signers.head(headPayload);
  const pinPayload = {
    schema: PIN_FORMAT, registryDigest: registry,
    headDigest: digest(headPayload), minimumSequence: n,
  };
  const sealedPin = await signers.pin(pinPayload);
  const verified = await verifyCheckpoint({
    captureRegistry, locations, keys, completeCommittedOutbox: outbox,
    checkpoint: { sealedLedger, sealedHead, sealedPin },
  });
  if (verified.signedSequence !== n || verified.productionPromotionAllowed !== false) {
    refuse('signer input does not match committed fictional event');
  }
  const marker = {
    schema: 'R20_R3J_SYNTHETIC_COMMIT_V1', sequence: n,
    ledgerDigest: digest(sealedLedger),
    headDigest: digest(sealedHead),
    pinDigest: digest(sealedPin),
  };
  for (const [role, document] of [
    ['ledger', sealedLedger], ['head', sealedHead],
    ['pin', sealedPin], ['commit', marker],
  ]) {
    await syncedExclusiveWrite(dirs[role], filename(n), canonicalJSON(document));
    if (crashAfter === role) refuse('simulated power interruption after ' + role);
  }
  return Object.freeze({
    state: 'R20_R3J_FICTIONAL_COMMITTED',
    signedSequence: n,
    signedHeadDigest: verified.signedHeadDigest,
    productionPromotionAllowed: false,
    physicallyIndependentSignerCertified: false,
  });
}
