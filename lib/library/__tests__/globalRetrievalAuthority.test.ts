/**
 * @jest-environment node
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {
  buildGlobalLibraryAuthoritySql,
  getGlobalLibraryAuthorityKeys,
  resetGlobalLibraryAuthorityCacheForTests,
} from '../globalRetrievalAuthority';
import { EA_INGEST_CONTRACT } from '../../corpus/eaIngestContract';

describe('J6 · global Library retrieval authority', () => {
  afterEach(() => resetGlobalLibraryAuthorityCacheForTests());

  test('canonical authority resolves exactly the admitted EA path + exact checksum', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const keys = getGlobalLibraryAuthorityKeys(repoRoot);
    expect(keys).toEqual([{ filePath: EA_INGEST_CONTRACT.sourcePath, checksum: EA_INGEST_CONTRACT.sourceSha256 }]);
  });

  test('SQL requires unscoped rows plus the exact admitted path/checksum pair', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const filter = buildGlobalLibraryAuthoritySql('s', 2, repoRoot);
    expect(filter.clause).toContain('s.practitioner_member_id IS NULL');
    expect(filter.clause).toContain('s.field_slug IS NULL');
    expect(filter.clause).toContain('s.file_path = $2');
    expect(filter.clause).toContain('s.checksum = $3');
    expect(filter.params).toEqual([EA_INGEST_CONTRACT.sourcePath, EA_INGEST_CONTRACT.sourceSha256]);
  });

  test('missing governed custody fails closed to no globally retrievable sources', () => {
    const emptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'global-library-authority-empty-'));
    try {
      expect(getGlobalLibraryAuthorityKeys(emptyRoot)).toEqual([]);
      expect(buildGlobalLibraryAuthoritySql('s', 2, emptyRoot)).toEqual({ clause: ' AND FALSE', params: [] });
    } finally {
      fs.rmSync(emptyRoot, { recursive: true, force: true });
    }
  });

  test('both semantic and full-text global readers cross the centralized authority seam', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const source = fs.readFileSync(path.join(repoRoot, 'lib/library/LibraryService.ts'), 'utf8');
    expect(source.match(/buildGlobalLibraryAuthoritySql\('s', params\.length \+ 1\)/g)).toHaveLength(2);
  });

  test('production Docker custody is an exact allowlist, never the historical data/ain tree', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const ignore = fs.readFileSync(path.join(repoRoot, '.dockerignore'), 'utf8');
    const dockerfile = fs.readFileSync(path.join(repoRoot, 'Dockerfile'), 'utf8');

    expect(ignore).not.toMatch(/^data\/ain\/$/m);
    expect(ignore).toContain('data/ain/*');
    expect(ignore).toContain('!data/ain/corpus-admission.json');
    expect(ignore).toContain('!data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md');
    expect(ignore).toContain('!docs/corpus-authority/elemental-alchemy.md');

    expect(dockerfile).toContain('find data/ain/source -type f');
    expect(dockerfile).toContain('find docs/corpus-authority -type f');
    expect(dockerfile).toContain('ingest-elemental-alchemy-governed.ts --runtime-custody');
    expect(dockerfile).toContain('/app/data/ain/corpus-admission.json');
    expect(dockerfile).toContain('/app/data/ain/source ./data/ain/source');
    expect(dockerfile).toContain('/app/docs/corpus-authority ./docs/corpus-authority');
  });
});
