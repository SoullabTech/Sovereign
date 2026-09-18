import { createHash } from 'crypto';

import {
  ELEMENTAL_ALCHEMY_GOVERNED_SOURCE,
  GOVERNED_KNOWLEDGE_VECTOR_CONTRACT,
  type GovernedKnowledgeSource,
} from '@/lib/corpus/governedKnowledgeRegistry';

export type GovernedSelectionAuthorityClass = 'SELECTIVE';
export type GovernedRankingMetric = 'cosine';

export interface GovernedKnowledgeApplicabilityContract {
  readonly positiveScope: readonly string[];
  readonly confusableScope: readonly string[];
  readonly minPositiveSimilarity: number;
  readonly minPositiveMargin: number;
}

export interface GovernedSelectionContract {
  readonly contractId: string;
  readonly authorityClass: GovernedSelectionAuthorityClass;
  readonly effectScope: 'current_turn_retrieved_evidence_membership';
  readonly subjectId: string;
  readonly sourcePath: string;
  readonly sourceSha256: string;
  readonly vectorModel: string;
  readonly vectorModelDigest: string;
  readonly vectorDimensions: number;
  readonly applicability: GovernedKnowledgeApplicabilityContract;
  readonly chunkSelection: {
    readonly requireStoredEmbedding: true;
    readonly rankingMetric: GovernedRankingMetric;
    readonly minChunkSimilarity: number;
    readonly maxChunks: number;
    readonly useDomainCategoryFilters: false;
  };
  readonly corpusAttestation: {
    readonly chunkCount: number;
    readonly chunkSetSha256: string;
    readonly embeddingSetSha256: string;
  };
}

const EA_SELECTION_MATERIAL = Object.freeze({
  contractId: 'J8-R1-EA-SELECTIVE-v1',
  authorityClass: 'SELECTIVE',
  effectScope: 'current_turn_retrieved_evidence_membership',
  subjectId: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.subjectId,
  sourcePath: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourcePath,
  sourceSha256: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourceSha256,
  vectorModel: GOVERNED_KNOWLEDGE_VECTOR_CONTRACT.model,
  vectorModelDigest: '0a109f422b47e3a30ba2b10eca18548e944e8a23073ee3f3e947efcf3c45e59f',
  vectorDimensions: GOVERNED_KNOWLEDGE_VECTOR_CONTRACT.dimensions,
  applicability: Object.freeze({
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
  chunkSelection: Object.freeze({
    requireStoredEmbedding: true,
    rankingMetric: 'cosine',
    minChunkSimilarity: 0.55,
    maxChunks: 3,
    useDomainCategoryFilters: false,
  }),
  corpusAttestation: Object.freeze({
    chunkCount: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.chunkCount,
    chunkSetSha256: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.chunkSetSha256,
    embeddingSetSha256: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.embeddingSetSha256,
  }),
} satisfies GovernedSelectionContract);

/**
 * Stable material whose digest is the object of any eventual founder SELECTIVE grant.
 * Property order is deliberate and covered by tests. Do not add timestamps or runtime state.
 */
export const ELEMENTAL_ALCHEMY_SELECTION_CONTRACT = EA_SELECTION_MATERIAL;

export function governedSelectionContractDigest(
  contract: GovernedSelectionContract = ELEMENTAL_ALCHEMY_SELECTION_CONTRACT,
): string {
  return createHash('sha256').update(JSON.stringify(contract), 'utf8').digest('hex');
}

// Filled from the exact deterministic material above. A mismatch is a RED attestation.
export const ELEMENTAL_ALCHEMY_SELECTION_CONTRACT_SHA256 = 'cb616d711e62b40f8042065c3d8a072c25f5ee6da1050c376e0246a4d1e39928';

export function assertGovernedSelectionContractAttested(
  contract: GovernedSelectionContract = ELEMENTAL_ALCHEMY_SELECTION_CONTRACT,
): GovernedSelectionContract {
  const actual = governedSelectionContractDigest(contract);
  if (actual !== ELEMENTAL_ALCHEMY_SELECTION_CONTRACT_SHA256) {
    throw new Error(
      `governed SELECTIVE contract attestation failed (${actual} != ${ELEMENTAL_ALCHEMY_SELECTION_CONTRACT_SHA256})`,
    );
  }
  return contract;
}

export function selectionContractForSource(
  source: GovernedKnowledgeSource,
): GovernedSelectionContract | null {
  return source.subjectId === ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.subjectId
    ? ELEMENTAL_ALCHEMY_SELECTION_CONTRACT
    : null;
}
