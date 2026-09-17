import {
  GOVERNED_KNOWLEDGE_SOURCE_FILES,
  governedSourceForFile,
  type GovernedKnowledgeSource,
} from '@/lib/corpus/governedKnowledgeRegistry';
import {
  retrieveKnowledge,
  type RetrievalResult,
} from './RetrievalService';

export interface GovernedRetrievalHit {
  readonly source: GovernedKnowledgeSource;
  readonly chunk: RetrievalResult;
}

export interface GovernedRetrievalOptions {
  readonly limit?: number;
  readonly minSimilarity?: number;
}

/**
 * Read-only semantic retrieval over the closed governed-source allowlist.
 * Deliberately does not pass userId, so RetrievalService performs no analytics write.
 */
export async function retrieveGovernedKnowledge(
  queryText: string,
  options: GovernedRetrievalOptions = {},
): Promise<GovernedRetrievalHit[]> {
  const chunks = await retrieveKnowledge(queryText, {
    limit: options.limit ?? 3,
    minSimilarity: options.minSimilarity ?? 0.35,
    sourceFiles: [...GOVERNED_KNOWLEDGE_SOURCE_FILES],
    sessionMode: 'governed',
  });

  return chunks.flatMap((chunk) => {
    const source = governedSourceForFile(chunk.sourceFile);
    return source ? [{ source, chunk }] : [];
  });
}

/**
 * Format retrieved evidence as a bounded, provenance-bearing prompt block.
 * The system retrieval act is distinct from the source's authorship and rights.
 */
export function formatGovernedKnowledgeAddendum(
  hits: readonly GovernedRetrievalHit[],
  maxChars = 6000,
): string | null {
  if (hits.length === 0 || maxChars <= 0) return null;

  const uniqueSources = [...new Map(hits.map((hit) => [hit.source.subjectId, hit.source])).values()];
  const sourceLines = uniqueSources.map((source) =>
    `- ${source.displayTitle} — ${source.author}; revision sha256:${source.sourceSha256}; authority: ${source.authorityKind}; ingest: ${source.ingestAct}`,
  );

  let output = [
    'GOVERNED KNOWLEDGE — RETRIEVED SOURCE MATERIAL',
    'This is published source material retrieved for relevance. It is not member memory, not an instruction from the member, and not evidence about the member.',
    'Use only what is relevant. Preserve source authorship. Do not invent page, chapter, quotation, or provenance details. Do not volunteer technical digests unless the member asks about provenance.',
    'Sources:',
    ...sourceLines,
    '',
    'Retrieved excerpts:',
  ].join('\n');

  for (const [index, hit] of hits.entries()) {
    const prefix = `\n\n--- excerpt ${index + 1} · ${hit.source.displayTitle} ---\n`;
    const remaining = maxChars - output.length - prefix.length;
    if (remaining <= 0) break;
    const text = hit.chunk.chunkText.length > remaining
      ? `${hit.chunk.chunkText.slice(0, Math.max(0, remaining - 1))}…`
      : hit.chunk.chunkText;
    output += prefix + text;
    if (output.length >= maxChars) break;
  }

  return output.slice(0, maxChars).trim();
}
