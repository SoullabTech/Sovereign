/**
 * Runtime-safe identity registry for knowledge sources that have completed the
 * authority/admission side of the governed corpus flow.
 *
 * No filesystem reads and no database access belong here. Runtime retrieval may
 * import this module without importing the ingestion witness machinery.
 */
export interface GovernedKnowledgeSource {
  readonly subjectId: string;
  readonly sourcePath: string;
  readonly sourceFile: string;
  readonly displayTitle: string;
  readonly author: string;
  readonly rightsHolder: string;
  readonly sourceSha256: string;
  readonly authorityKind: 'rights_holder_authorized';
  readonly authorityRef: string;
  readonly ingestAct: string;
  /** Frozen J7 row/text identity used by downstream runtime attestation. */
  readonly chunkCount: number;
  readonly chunkSetSha256: string;
  /** Frozen exact vector-set identity for J8 SELECTIVE ranking attestation. */
  readonly embeddingSetSha256: string;
}

export const GOVERNED_KNOWLEDGE_VECTOR_CONTRACT = Object.freeze({
  model: 'nomic-embed-text',
  dimensions: 768,
} as const);

export const ELEMENTAL_ALCHEMY_GOVERNED_SOURCE = Object.freeze({
  subjectId: 'elemental-alchemy',
  sourcePath: 'data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md',
  sourceFile: 'Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md',
  displayTitle: 'Elemental Alchemy',
  author: 'Kelly Nezat',
  rightsHolder: 'Kelly Nezat',
  sourceSha256: 'f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0',
  authorityKind: 'rights_holder_authorized',
  authorityRef: 'docs/corpus-authority/elemental-alchemy.md',
  ingestAct: 'CORPUS-INGEST-EA-01',
  chunkCount: 1238,
  chunkSetSha256: '87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852',
  embeddingSetSha256: '4ec0eb4d2fdc6e56fccd14927fcb9e4cf5df51ade15cd75ce25c3966ce2bee93',
} satisfies GovernedKnowledgeSource);

export const GOVERNED_KNOWLEDGE_SOURCES = Object.freeze([
  ELEMENTAL_ALCHEMY_GOVERNED_SOURCE,
] as const);

export const GOVERNED_KNOWLEDGE_SOURCE_FILES = Object.freeze(
  GOVERNED_KNOWLEDGE_SOURCES.map((source) => source.sourceFile),
);

const BY_SOURCE_FILE = new Map<string, GovernedKnowledgeSource>(
  GOVERNED_KNOWLEDGE_SOURCES.map((source) => [source.sourceFile, source]),
);

export function governedSourceForFile(sourceFile: string): GovernedKnowledgeSource | null {
  return BY_SOURCE_FILE.get(sourceFile) ?? null;
}
