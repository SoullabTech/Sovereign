import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { decideAdmission, loadDeclaration } from '../corpus/admission';

export interface GlobalLibraryAuthorityKey {
  filePath: string;
  checksum: string;
}

let cache: { repoRoot: string; keys: GlobalLibraryAuthorityKey[] } | null = null;

function listCandidates(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listCandidates(full));
    else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) files.push(full);
  }
  return files.sort((a, b) => a.localeCompare(b));
}

/**
 * Global MAIA Library retrieval is a REPRESENTATION boundary, not a storage
 * boundary. A source may exist in library_sources for a practitioner, member,
 * import workflow, or future review without thereby becoming inherited wisdom
 * MAIA may retrieve globally.
 *
 * For the current governed stream, the only globally retrievable Library
 * sources are exact data/ain/source items admitted by the corpus declaration.
 * The DB row must match BOTH the admitted repository path and the SHA-256 of the
 * governed source bytes. Unclassified, generic, curated-without-authority, and
 * practitioner-scoped material therefore cannot become global retrieval merely
 * by reaching `completed + embedded`.
 */
export function getGlobalLibraryAuthorityKeys(
  repoRoot: string = process.cwd(),
): GlobalLibraryAuthorityKey[] {
  const root = path.resolve(repoRoot);
  if (cache?.repoRoot === root) return cache.keys;

  const sourceRoot = path.join(root, 'data/ain/source');
  const candidates = listCandidates(sourceRoot);
  if (candidates.length === 0) {
    cache = { repoRoot: root, keys: [] };
    return [];
  }

  const verdict = decideAdmission(root, candidates, loadDeclaration(root));
  if (verdict.refused.length > 0) {
    throw new Error(
      `global Library retrieval REFUSED: ${verdict.refused.length} admitted candidate(s) carry human-record signals`,
    );
  }

  const keys = verdict.admitted.map((rel) => {
    const normalized = rel.split(path.sep).join('/');
    const bytes = fs.readFileSync(path.join(root, rel));
    return {
      filePath: normalized,
      checksum: createHash('sha256').update(bytes).digest('hex'),
    };
  });

  cache = { repoRoot: root, keys };
  return keys;
}

export function buildGlobalLibraryAuthoritySql(
  alias: string,
  startParam: number,
  repoRoot: string = process.cwd(),
): { clause: string; params: string[] } {
  const keys = getGlobalLibraryAuthorityKeys(repoRoot);
  if (keys.length === 0) return { clause: ' AND FALSE', params: [] };

  const params: string[] = [];
  const pairs = keys.map((key, index) => {
    const pathParam = startParam + index * 2;
    const checksumParam = pathParam + 1;
    params.push(key.filePath, key.checksum);
    return `(${alias}.file_path = $${pathParam} AND ${alias}.checksum = $${checksumParam})`;
  });

  return {
    clause:
      ` AND ${alias}.practitioner_member_id IS NULL` +
      ` AND ${alias}.field_slug IS NULL` +
      ` AND (${pairs.join(' OR ')})`,
    params,
  };
}

/** Test-only cache reset; production callers should treat authority as process-stable. */
export function resetGlobalLibraryAuthorityCacheForTests(): void {
  cache = null;
}
