/**
 * R70.19 read-only, code-only mutation inventory gate. NEVER a production
 * backup permit. Source bytes/anchors establish identity, not coherent capture.
 * No database, vault, network, key, member or provider access is performed.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const R7019_REAL_WHOLE_WRITER_BACKUP_ENABLED = false;
export const R7019_COMPLETE_RESTORE_VERIFIED = false;
const fileDir = path.dirname(fileURLToPath(import.meta.url));
const manifestFile = path.join(fileDir, 'wsBetaR7019WriterMutationInventory.json');
export const R7019_MANIFEST = Object.freeze(JSON.parse(readFileSync(manifestFile, 'utf8')));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export function assessR7019WholeWriterCoverage(root, options = {}) {
  // Overrides are only for negative test cases; never grant release authority.
  const overrides = options.sourceOverrides ?? {};
  const drift = [];
  const foundIds = [];
  const requiredIds = [];
  const seenIds = new Set();
  const manifest = R7019_MANIFEST;
  for (const entry of manifest.entries) {
    requiredIds.push(entry.id);
    if (seenIds.has(entry.id) || !entry.path ||
        path.isAbsolute(entry.path) ||
        entry.path.split('/').includes('..')) {
      drift.push({ id: entry.id, reason: 'invalid_or_duplicate_entry' });
      continue;
    }
    seenIds.add(entry.id);
    let bytes;
    try {
      bytes = Object.prototype.hasOwnProperty.call(overrides, entry.path)
        ? Buffer.from(overrides[entry.path])
        : readFileSync(path.join(root, entry.path));
    } catch {
      drift.push({ id: entry.id, reason: 'source_missing' });
      continue;
    }
    if (sha256(bytes) !== entry.sha256) {
      drift.push({ id: entry.id, reason: 'source_digest_changed' });
      continue;
    }
    const content = bytes.toString('utf8');
    if (!entry.anchors.every((anchor) => content.includes(anchor))) {
      drift.push({ id: entry.id, reason: 'writer_anchor_missing' });
      continue;
    }
    foundIds.push(entry.id);
  }

  const unresolved = [...new Set(requiredIds)];
  // No caller-provided booleans, environment switches, mock receipts, or
  // source-code marker can promote a real backup. That requires *external*
  // exact-source concurrent SQL+vault/backup/key/restore authority, not here.
  const status = drift.length
    ? 'R7019_WRITER_SOURCE_CUSTODY_DRIFT_HELD'
    : 'R7019_WHOLE_WRITER_CAPTURE_UNQUALIFIED_HELD';
  return Object.freeze({
    protocol: 'soullab.ws.r7019.whole-writer-capture-hold.v1',
    status,
    baselineSourceHead: manifest.baselineSourceHead,
    verifiedKnownEntries: foundIds.length,
    knownRequiredEntries: manifest.entries.length,
    unqualifiedWriterIds: unresolved,
    unmappedFamilies: [...manifest.unmappedFamilies],
    drift,
    codeOnly: true,
    releaseApproved: false,
    wholeWriterBackupComplete: false,
    actualProductionEncryptionProven: false,
    independentVaultAndDbRestoreProven: false,
    safeForRealManuscripts: false,
  });
}

if (process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.argv[2];
  if (!root || !path.isAbsolute(root)) {
    process.stderr.write('R7019_REFUSED_ABSOLUTE_SOURCE_ROOT_REQUIRED\n');
    process.exitCode = 64;
  } else {
    const assessment = assessR7019WholeWriterCoverage(root);
    // Metadata only; no member details, source contents or file secrets.
    process.stdout.write(JSON.stringify(assessment, null, 2) + '\n');
    // Intentionally nonzero: a HELD gate MUST NOT be treated as ship PASS.
    process.exitCode = 78;
  }
}
