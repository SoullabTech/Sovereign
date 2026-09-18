/** @jest-environment node */
import * as path from 'path';

import {
  ELEMENTAL_ALCHEMY_GOVERNED_SOURCE,
  GOVERNED_KNOWLEDGE_SOURCE_FILES,
  GOVERNED_KNOWLEDGE_VECTOR_CONTRACT,
} from '../governedKnowledgeRegistry';
import { EA_INGEST_CONTRACT } from '../eaIngestContract';
import { ELEMENTAL_ALCHEMY_SELECTION_CONTRACT } from '@/lib/ain/knowledge/GovernedSelectionContract';
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

  test('retrieval vector contract remains equal to the governed ingestion vector contract', () => {
    expect(GOVERNED_KNOWLEDGE_VECTOR_CONTRACT).toEqual({
      model: EA_INGEST_CONTRACT.embeddingModel,
      dimensions: EA_INGEST_CONTRACT.embeddingDimensions,
    });
  });

  test('J7 text identity remains bound while J8 selection owns applicability separately', () => {
    expect(ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.chunkCount).toBe(EA_INGEST_CONTRACT.chunkCount);
    expect(ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.chunkSetSha256).toBe(EA_INGEST_CONTRACT.chunkSetSha256);
    expect(ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.embeddingSetSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.authorityKind).toBe('rights_holder_authorized');
    expect(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.applicability.positiveScope.length).toBeGreaterThan(0);
    expect(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.applicability.confusableScope.length).toBeGreaterThan(0);
  });
});
