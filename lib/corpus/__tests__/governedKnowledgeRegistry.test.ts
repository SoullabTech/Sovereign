/** @jest-environment node */
import * as path from 'path';

import {
  ELEMENTAL_ALCHEMY_GOVERNED_SOURCE,
  GOVERNED_KNOWLEDGE_SOURCE_FILES,
} from '../governedKnowledgeRegistry';
import {
  getGlobalLibraryAuthorityKeys,
  resetGlobalLibraryAuthorityCacheForTests,
} from '@/lib/library/globalRetrievalAuthority';

describe('governed knowledge runtime registry', () => {
  afterEach(() => resetGlobalLibraryAuthorityCacheForTests());

  test('runtime identity is equivalent to the J6 admission-derived authority key', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const keys = getGlobalLibraryAuthorityKeys(repoRoot);

    expect(keys).toEqual([{
      filePath: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourcePath,
      checksum: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourceSha256,
    }]);
    expect(GOVERNED_KNOWLEDGE_SOURCE_FILES).toEqual([
      ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourceFile,
    ]);
  });
});
