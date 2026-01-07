/**
 * AIN Knowledge System
 *
 * Contextual wisdom retrieval from embedded source texts.
 * Supports mode-aware filtering for therapeutic, divination, and philosophical domains.
 */

export {
  processSourceFile,
  processAllSources,
  chunkText,
  extractTitle,
  classifySource,
  type KnowledgeChunk,
} from './ChunkingService';

export {
  retrieveKnowledge,
  retrieveForMode,
  formatForPrompt,
  getKnowledgeStats,
  type RetrievalResult,
  type RetrievalOptions,
} from './RetrievalService';
