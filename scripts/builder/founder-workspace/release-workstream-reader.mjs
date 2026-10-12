// @ts-check
/**
 * WRITER-BETA-WORKSTREAM-01. Read-only historical release evidence for ONE
 * governed JARVIS Work Unit. Nothing from this record grants release authority.
 * No directory creation, credential access, provider call, timer, or write.
 */
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';

export const WORK_ID = 'v2-writer-s-studio-small-beta-launch-mv5adx5f';
export const WORK_TITLE = 'Writer’s Studio — Small Beta Launch';
export const EVIDENCE_SCHEMA = 'jarvis.release-workstream-evidence.v1';
const GATE_IDS = Object.freeze([
  'linux-fence', 'member-access', 'device-copy', 'source-custody',
  'migrations', 'writer-rehearsal', 'release-authorization',
]);
const ALLOWED_STANDINGS = new Set(['witnessed', 'hold', 'open', 'future-decision']);
const MAX_BYTES = 32768;

/** @param {string} v @param {string} root */
function inside(v, root) {
  const rel = path.relative(root, v);
  return rel === '' || (rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel));
}

/** @param {string} p */
function regularFile(p) {
  try {
    const stat = lstatSync(p);
    return stat.isFile() && !stat.isSymbolicLink() && stat.size > 0 && stat.size <= MAX_BYTES;
  } catch { return false; }
}

/**
 * @param {{env?:NodeJS.ProcessEnv, home?:string, allowedRoots?:string[]}} [opts]
 * @returns {any}
 */
export function readWriterBetaReleaseEvidence(opts = {}) {
  const env = opts.env || process.env;
  const home = opts.home || os.homedir();
  const ainHome = env.AIN_DELEGATION_HOME || path.join(home, '.claude', 'ain-delegation');
  const file = path.join(ainHome, 'projections', 'writers-studio-small-beta-launch.v1.json');
  const absent = (/** @type {string} */ reason) => ({
    work_unit_id: WORK_ID, title: WORK_TITLE, file: null,
    authority: 'orientation_only', release_approval: 'NOT_AUTHORIZED',
    evidence_state: 'UNVERIFIED', recorded_at: null, gates: [], reason,
  });
  // Only the fixed record may be read; a symlink may redirect past AIN home.
  if (!existsSync(file)) return absent('Release evidence index not yet recorded.');
  if (!regularFile(file)) return absent('Release evidence index is not a bounded regular file.');
  try {
    if (realpathSync(file) !== path.resolve(file)) return absent('Release evidence index is reached through a symlinked path.');
  } catch { return absent('Release evidence index cannot be resolved safely.'); }
  /** @type {{
    schema:string,work_unit_id:string,title:string,authority:string,
    release_approval:string,recorded_at:string,
    gates:Array<{id:string,label:string,plain:string,standing:string,
      observed_at:string|null,receipt:{path:string,sha256:string}|null}>
  } | null} */
  let doc = null;
  try { doc = JSON.parse(readFileSync(file, 'utf8')); }
  catch { return absent('Release evidence index cannot be parsed.'); }
  if (doc?.schema !== EVIDENCE_SCHEMA || doc.work_unit_id !== WORK_ID
    || doc.title !== WORK_TITLE || doc.authority !== 'orientation_only'
    || doc.release_approval !== 'NOT_AUTHORIZED'
    || !Number.isFinite(Date.parse(doc.recorded_at || ''))
    || !Array.isArray(doc.gates)
    || doc.gates.length !== GATE_IDS.length
    || doc.gates.some((g, i) => g?.id !== GATE_IDS[i]
      || !ALLOWED_STANDINGS.has(g.standing)
      || typeof g.label !== 'string' || !g.label.trim() || g.label.length > 140
      || typeof g.plain !== 'string' || !g.plain.trim() || g.plain.length > 1300
      || (g.observed_at != null && !/^20\d\d-\d\d-\d\d$/.test(g.observed_at)))) {
    return absent('Release evidence index has invalid identity, authority, or gate standing.');
  }

  const roots = opts.allowedRoots || [
    path.join(home, '.maia-release-authority'),
    path.join(home, 'ws-publish-preview-20261010', 'docs', 'programme'),
  ];
  const gates = doc.gates.map((g) => {
    const expected = g.receipt;
    let proof = false;
    if (expected && typeof expected.path === 'string'
      && /^[0-9a-f]{64}$/i.test(expected.sha256 || '')
      && roots.some(root => inside(expected.path, root)) && regularFile(expected.path)) {
      try {
        const resolved = realpathSync(expected.path);
        // Refuse path symlinks and symlinked parent traversal.
        if (resolved === path.resolve(expected.path)
          && roots.some(root => inside(resolved, root))) {
          proof = createHash('sha256').update(readFileSync(expected.path)).digest('hex') === expected.sha256;
        }
      } catch { /* unavailable proof must not be promoted */ }
    }
    const hasReceipt = expected != null;
    const changed = (g.standing === 'witnessed' && !proof) || (hasReceipt && !proof);
    return {
      id: g.id, label: g.label, plain: g.plain,
      standing: changed ? 'unverified' : g.standing,
      recorded_at: g.observed_at || null,
      receipt_verified: proof,
      source_name: proof && expected ? path.basename(expected.path) : null,
      ...(changed ? { note:'Recorded evidence changed or cannot be verified. No pass is carried forward.' } : {}),
      // Gate state is descriptive history and NEVER a permission.
    };
  });

  return {
    work_unit_id: WORK_ID, title: WORK_TITLE, file,
    authority: 'orientation_only', release_approval: 'NOT_AUTHORIZED',
    evidence_state: gates.some(g=>g.standing === 'unverified') ? 'PARTIAL' : 'OBSERVED',
    recorded_at: doc.recorded_at, gates,
    historical_only: true,
    reason: 'History is not a live service check or release authorization.',
  };
}
