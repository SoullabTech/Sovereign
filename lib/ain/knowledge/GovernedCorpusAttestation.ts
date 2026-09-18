import { query } from '@/lib/db/postgres';
import type { GovernedKnowledgeSource } from '@/lib/corpus/governedKnowledgeRegistry';
import type { GovernedSelectionContract } from './GovernedSelectionContract';

interface CorpusAttestationRow {
  row_count: number;
  source_count: number;
  embedded_count: number;
  min_index: number | null;
  max_index: number | null;
  min_dims: number | null;
  max_dims: number | null;
  chunk_set_sha256: string | null;
  embedding_set_sha256: string | null;
}

export interface GovernedCorpusAttestationResult {
  readonly rowCount: number;
  readonly sourceCount: number;
  readonly embeddedCount: number;
  readonly minIndex: number;
  readonly maxIndex: number;
  readonly vectorDimensions: number;
  readonly chunkSetSha256: string;
  readonly embeddingSetSha256: string;
}

/**
 * Read-only attestation of the exact stored corpus and its vector representations.
 * Any substitution of row text, row count/index identity, embedding presence,
 * embedding dimensions, or embedding bytes becomes RED before SELECTIVE ranking.
 */
export async function assertGovernedCorpusAttestation(
  source: GovernedKnowledgeSource,
  contract: GovernedSelectionContract,
): Promise<GovernedCorpusAttestationResult> {
  if (
    contract.subjectId !== source.subjectId ||
    contract.sourcePath !== source.sourcePath ||
    contract.sourceSha256 !== source.sourceSha256
  ) {
    throw new Error(`governed corpus attestation contract/source mismatch for ${source.subjectId}`);
  }

  const result = await query<CorpusAttestationRow>(`
    WITH corpus AS (
      SELECT
        count(*)::int AS row_count,
        count(DISTINCT source_file)::int AS source_count,
        count(embedding)::int AS embedded_count,
        min(chunk_index)::int AS min_index,
        max(chunk_index)::int AS max_index,
        min(vector_dims(embedding)) FILTER (WHERE embedding IS NOT NULL)::int AS min_dims,
        max(vector_dims(embedding)) FILTER (WHERE embedding IS NOT NULL)::int AS max_dims,
        '[' || string_agg(
          '{"sourceFile":' || to_json(source_file)::text ||
          ',"chunkIndex":' || chunk_index::text ||
          ',"chunkSha256":"' || encode(digest(chunk_text, 'sha256'), 'hex') || '"}',
          ',' ORDER BY chunk_index
        ) || ']' AS chunk_payload,
        '[' || string_agg(
          '{"chunkIndex":' || chunk_index::text ||
          ',"embeddingSha256":"' || encode(digest(embedding::text, 'sha256'), 'hex') || '"}',
          ',' ORDER BY chunk_index
        ) FILTER (WHERE embedding IS NOT NULL) || ']' AS embedding_payload
      FROM ain_knowledge_chunks
      WHERE source_file = $1
    )
    SELECT
      row_count,
      source_count,
      embedded_count,
      min_index,
      max_index,
      min_dims,
      max_dims,
      CASE WHEN chunk_payload IS NULL THEN NULL
        ELSE encode(digest(chunk_payload, 'sha256'), 'hex') END AS chunk_set_sha256,
      CASE WHEN embedding_payload IS NULL THEN NULL
        ELSE encode(digest(embedding_payload, 'sha256'), 'hex') END AS embedding_set_sha256
    FROM corpus
  `, [source.sourceFile]);

  const row = result.rows[0];
  const expected = contract.corpusAttestation;
  const expectedMaxIndex = expected.chunkCount - 1;

  if (
    !row ||
    row.row_count !== expected.chunkCount ||
    row.source_count !== 1 ||
    row.embedded_count !== expected.chunkCount ||
    row.min_index !== 0 ||
    row.max_index !== expectedMaxIndex ||
    row.min_dims !== contract.vectorDimensions ||
    row.max_dims !== contract.vectorDimensions ||
    row.chunk_set_sha256 !== expected.chunkSetSha256 ||
    row.embedding_set_sha256 !== expected.embeddingSetSha256
  ) {
    throw new Error(
      `governed corpus attestation failed for ${source.subjectId}: ` +
      `${row?.row_count ?? -1} rows / ${row?.embedded_count ?? -1} embedded / ` +
      `indexes ${row?.min_index ?? -1}-${row?.max_index ?? -1} / ` +
      `dims ${row?.min_dims ?? -1}-${row?.max_dims ?? -1} / ` +
      `chunk ${row?.chunk_set_sha256 ?? 'missing'} / ` +
      `embedding ${row?.embedding_set_sha256 ?? 'missing'}`,
    );
  }

  return {
    rowCount: row.row_count,
    sourceCount: row.source_count,
    embeddedCount: row.embedded_count,
    minIndex: row.min_index,
    maxIndex: row.max_index,
    vectorDimensions: row.min_dims,
    chunkSetSha256: row.chunk_set_sha256,
    embeddingSetSha256: row.embedding_set_sha256,
  };
}
