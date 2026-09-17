/**
 * Runtime-safe identity registry for knowledge sources that have completed the
 * authority/admission side of the governed corpus flow.
 *
 * No filesystem reads and no database access belong here. Runtime retrieval may
 * import this module without importing the ingestion witness machinery.
 */
export interface GovernedKnowledgeApplicability {
  /** Positive retrieval scope. These descriptors do not confer source authority. */
  readonly positiveScope: readonly string[];
  /** Nearby semantic systems that must not be mistaken for this source's scope. */
  readonly confusableScope: readonly string[];
  /** Query must be at least this close to one positive scope descriptor. */
  readonly minPositiveSimilarity: number;
  /** Positive scope must beat the nearest confusable descriptor by this margin. */
  readonly minPositiveMargin: number;
}

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
  /** Retrieval activation contract; separate from rights/admission authority. */
  readonly retrievalApplicability: GovernedKnowledgeApplicability;
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
  retrievalApplicability: Object.freeze({
    positiveScope: Object.freeze([
      "Kelly Nezat's Elemental Alchemy is a psychospiritual self-knowledge and personal-development framework using Fire, Water, Earth, Air, and Aether as facets of human awareness and lived experience.",
      'Questions about inner awareness, self-knowledge, personal meaning, imagination, emotion, embodiment, thinking, communication, archetypal or Jungian self-understanding, and integrating elemental facets of the self.',
    ]),
    confusableScope: Object.freeze([
      'Traditional Chinese medicine five elements, meridians, organs, acupuncture, qi, and feng shui correspondences.',
      'Ayurveda, doshas, vata, pitta, kapha, Ayurvedic medicine and traditional Indian health practices.',
      'Chemical elements, periodic table, atomic number, electron configuration, atoms and chemistry.',
    ]),
    minPositiveSimilarity: 0.50,
    minPositiveMargin: 0.05,
  }),
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
