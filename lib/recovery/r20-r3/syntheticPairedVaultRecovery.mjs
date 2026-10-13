/**
 * R20-R3J synthetic completeness test for paired "database" + Source vault.
 * NOT a production snapshot reader, verifier, key custodian or restore engine.
 *
 * No file/db/network I/O. Recognizes only explicitly fictional string/byte
 * fixtures. Historic plaintext backup copies always force refusal.
 */
import { createHash } from 'node:crypto';
import { TARGET as AUTH_TARGET, readDurableFixtureAuthority } from './durableFixtureAuthority.mjs';

const ID = /^fixture-[a-z0-9-]{1,70}$/;
// UUIDs below are allowed only in explicitly fictional records for alignment
// with the captured R20 deletion-identity schema; no production access exists.
const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/;
const WORK_ID = v => typeof v === 'string' && (ID.test(v) || UUID.test(v));
const HASH = /^[0-9a-f]{64}$/;
export const TARGET = 'R20_R3J_FICTIONAL_PAIRED_DB_VAULT_ONLY';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = reason => { throw Error('R20 paired Source recovery refused: ' + reason); };
const unique = values => new Set(values).size === values.length;

export async function verifySyntheticPairedSourceSnapshot({ target, snapshot, authorityRead }) {
  if (target !== TARGET || snapshot?.type !== 'FICTIONAL_DB_VAULT_PAIR' ||
      snapshot?.containsMemberData !== false) fail('non-synthetic archive');
  // Never accept a caller-constructed {admitted:true} or signedEpoch claim.
  // Reread and cryptographically validate every stored fixture checkpoint.
  if (!authorityRead || typeof authorityRead !== 'object') fail('signed authority reader missing');
  const authority = await readDurableFixtureAuthority({ ...authorityRead, target: AUTH_TARGET });
  if (authority?.state !== 'R20_R3J_FICTIONAL_DURABLE_CHECKPOINT' ||
      authority.productionPromotionAllowed !== false ||
      authority.physicallyIndependentSignerCertified !== false ||
      !Number.isSafeInteger(authority.signedSequence) ||
      authority.signedSequence < 1 ||
      authority.checkpoint?.sealedLedger?.payload?.sequence !== authority.signedSequence) {
    fail('missing previously validated fictional signed checkpoint');
  }
  const gen = snapshot.generation;
  const db = snapshot.database, vault = snapshot.sourceVault;
  if (typeof gen !== 'string' || !ID.test(gen) ||
      db?.generation !== gen || vault?.generation !== gen ||
      typeof db.commitFence !== 'string' || !ID.test(db.commitFence) ||
      db.commitFence !== vault.commitFence || !Array.isArray(db.works) ||
      !Array.isArray(db.sources) || !Array.isArray(vault.artifacts)) {
    fail('incomplete or non-atomic database-vault generation');
  }
  if (!snapshot.expected || !['works','sources','files'].every(key =>
    Number.isSafeInteger(snapshot.expected[key]) && snapshot.expected[key] >= 0) ||
      snapshot.expected.works !== db.works.length ||
      snapshot.expected.sources !== db.sources.length ||
      snapshot.expected.files !== vault.artifacts.length ||
      db.works.length === 0 || db.sources.length === 0) {
    fail('incomplete source and Work manifest census');
  }
  // This is a fictional copy-count claim, not real NAS evidence.
  const copies = snapshot.legacyReconstructiveCopies;
  if (!Number.isSafeInteger(copies) || copies !== 0) {
    fail('historic plaintext or unresolved reconstructive copies');
  }
  if (!unique(db.works.map(w=>w?.id)) ||
      !unique(db.sources.map(s=>s?.id)) ||
      !unique(vault.artifacts.map(a=>a?.id))) {
    fail('duplicate Work or Source identity');
  }

  const works = new Set();
  for (const work of db.works) {
    if (!work || !WORK_ID(work.id)) fail('invalid fictional Work identity');
    works.add(work.id);
  }
  const tombstones = authority.checkpoint.sealedLedger.payload.events
    .flatMap(e => e.tombstones || [])
    .filter(t => t.table === 'member_manuscripts' || t.table === 'living_works')
    .map(t => t.id);
  if (db.works.some(w => tombstones.includes(w.id))) {
    fail('deleted Work still reconstructible from archive');
  }

  const references = new Map();
  for (const src of db.sources) {
    if (!src || !ID.test(src.id) || !works.has(src.workId) ||
        typeof src.sourceText !== 'string' ||
        !src.sourceText.startsWith('FICTIONAL:') ||
        src.sourceText.length > 10000 ||
        typeof src.sourceTextHash !== 'string' ||
        src.sourceTextHash !== hash(Buffer.from(src.sourceText,'utf8')) ||
        !['artifact','paste'].includes(src.kind)) {
      fail('unaccounted, unsafe or corrupt fictional source');
    }
    if (src.kind === 'artifact') {
      if (!HASH.test(src.artifactHash || '')) fail('missing Source SHA256');
      references.set(src.id, src.artifactHash);
    } else if (src.artifactHash !== null) {
      fail('pasted text invented an original file');
    }
  }
  if (references.size !== vault.artifacts.length) {
    fail('missing or unclaimed original Source');
  }
  for (const artifact of vault.artifacts) {
    if (!artifact || !ID.test(artifact.id) ||
        typeof artifact.dataBase64 !== 'string' ||
        !references.has(artifact.id)) {
      fail('orphan or unexpected Source artifact');
    }
    const bytes = Buffer.from(artifact.dataBase64,'base64');
    // Canonical base64 prevents accepting corrupt/truncated alternate encodings.
    if (bytes.length === 0 || bytes.toString('base64') !== artifact.dataBase64 ||
        hash(bytes) !== references.get(artifact.id)) {
      fail('original Source hash or encoding mismatch');
    }
  }
  return Object.freeze({
    state: 'R20_R3J_FICTIONAL_COMPLETE_PAIR_ONLY',
    consistentFixtureGeneration: gen,
    restoredFictionalWorks: db.works.length,
    verifiedFictionalSources: db.sources.length,
    verifiedFictionalOriginalFiles: vault.artifacts.length,
    productionPromotionAllowed: false,
    realVaultRecovered: false,
    historicalBackupsRemediated: false,
    independentlyCertified: false,
  });
}
