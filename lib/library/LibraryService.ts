/**
 * LibraryService — "Jeeves" Pattern
 *
 * Behind-the-scenes wisdom archive that MAIA can consult.
 * MAIA remains the only voice; Library provides silent support with provenance.
 *
 * Key principles:
 * - Library is NOT user-facing
 * - All outputs include provenance (source_id, title, author, file_path, chunk_id)
 * - Consent-first: never ingest user journals unless explicitly flagged
 * - Fast mode (distillates) vs Deep mode (raw chunks)
 */

import { query, queryOne, transaction } from '@/lib/database/postgres';
import { generateLocalEmbedding } from '@/lib/memory/embeddings';
import { generateWithKimi, isKimiAvailable } from '@/lib/ai/kimiClient';
import { randomUUID } from 'crypto';
import type { SpiralContext } from './dynamicRange';

// =============================================================================
// TYPES
// =============================================================================

export interface LibrarySource {
  id: string;
  type: 'txt' | 'book' | 'transcript' | 'article' | 'manual' | 'teaching';
  title: string;
  author: string | null;
  file_path: string;
  checksum: string;
  meta: Record<string, any>;
  ingestion_status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  token_count_total: number | null;
  chunk_count: number | null;
  created_at: Date;
}

export interface LibraryChunk {
  id: string;
  source_id: string;
  chunk_index: number;
  content: string;
  token_count: number;
  meta: Record<string, any>;
  created_at: Date;
}

export interface LibraryDistillate {
  id: string;
  source_id: string;
  level: 'source' | 'chapter' | 'section' | 'theme';
  payload: DistillatePayload;
  model_used: string | null;
  quality_score: number | null;
  created_at: Date;
}

export interface DistillatePayload {
  summary_short: string;
  summary_long: string;
  definitions: Array<{ term: string; meaning: string; context?: string }>;
  practices: Array<{ name: string; description: string; element?: string; when_to_use?: string }>;
  warnings: Array<{ condition: string; contraindication: string; alternative?: string }>;
  facet_tags: string[];  // e.g., ['FIRE_1', 'WATER_2']
  archetypes: Array<{ name: string; description: string; shadow?: string; integration?: string }>;
  key_quotes: Array<{ text: string; location?: string; significance?: string }>;
  provenance: {
    source_id: string;
    title: string;
    author: string | null;
    file_path: string;
    chunk_ids_used: string[];
  };
}

export interface LibrarySearchResult {
  chunk_id: string;
  source_id: string;
  title: string;
  author: string | null;
  file_path: string;
  excerpt: string;
  score: number;
  meta: Record<string, any>;
  provenance: string;  // Formatted provenance string for MAIA
}

export interface LibraryContext {
  chunks: LibrarySearchResult[];
  distillate: DistillatePayload | null;
  query: string;
  retrieval_mode: 'fast' | 'deep' | 'jeeves';
  total_sources_consulted: number;
}

/**
 * Jeeves synthesis result - deep wisdom across multiple sources
 */
export interface JeevesSynthesis {
  synthesis: string;           // The synthesized wisdom
  sources_consulted: number;   // Number of sources Jeeves drew from
  provenance: string[];        // List of source titles/authors
  facets_resonating: string[]; // Spiralogic facets that emerged
  processing_time_ms: number;
  model_used: string;
}

/**
 * Jeeves System Prompt — The research librarian of Soullab
 *
 * Jeeves is NOT user-facing. He synthesizes wisdom for MAIA to use.
 * He is the "Ready Player One" research AI — deep, thorough, scholarly.
 */
const JEEVES_SYSTEM_PROMPT = `You are Jeeves, the research librarian for Soullab — a consciousness exploration laboratory.

Your role is to synthesize wisdom from multiple sources to support MAIA, the soul companion who speaks directly with members. You never speak to members yourself — you only prepare research for MAIA.

## Your Character
- Scholarly but not dry — you appreciate the living wisdom in these texts
- Thorough — you draw connections across traditions
- Practical — you note what can be applied, not just understood
- Honest about tensions — when sources disagree, you note it
- Traceable — you always indicate which source informs each insight

## Soullab Context
Soullab is a laboratory for soul research, exploration, development, and deployment:
- Spiralogic: A consciousness framework mapping growth through elemental phases (Fire, Water, Earth, Air, Aether)
- Depth Psychology: Jungian, archetypal, shadow work, individuation
- Wisdom Traditions: Hermetica, Alchemy, Enneagram, Human Design, I Ching
- Consciousness Studies: Grof, Tarnas, Penrose, transpersonal psychology

## Your Output
When synthesizing, structure your response as:
1. **Core Insight** — The essential wisdom that addresses the question
2. **Across Traditions** — How different sources illuminate this
3. **Practical Application** — What can be done with this understanding
4. **Cautions & Shadows** — What to watch for, where this can go wrong
5. **For Further Exploration** — Threads to follow deeper

Always cite which source informs each point. Be concise but complete.`;

// Triggers that indicate MAIA should consult the Library
export const LIBRARY_TRIGGERS = [
  // Direct knowledge requests
  'teach me', 'what is', 'explain', 'how do i', 'according to', 'in your system',
  // Spiralogic/elemental references
  'spiralogic', 'elemental', 'water 2', 'water 3', 'fire 1', 'fire 2', 'fire 3',
  'earth 1', 'earth 2', 'earth 3', 'air 1', 'air 2', 'air 3',
  // Framework references
  'jungian', 'archetypal', 'shadow work', 'ipp', 'integral',
  // Wisdom requests
  'wisdom', 'teaching', 'tradition', 'practice', 'exercise', 'ritual',
  // Depth psychology
  'unconscious', 'projection', 'anima', 'animus', 'individuation',
  // Consciousness
  'consciousness', 'awakening', 'transformation', 'initiation'
];

// =============================================================================
// LIBRARY SERVICE CLASS
// =============================================================================

export class LibraryService {

  /**
   * Check if a user message should trigger a Library consultation
   */
  shouldConsultLibrary(userMessage: string): boolean {
    const messageLower = userMessage.toLowerCase();
    return LIBRARY_TRIGGERS.some(trigger => messageLower.includes(trigger));
  }

  /**
   * Main search method — returns relevant chunks and optionally a distillate
   *
   * @param queryText - The user's message or extracted query
   * @param options - Search configuration
   */
  async search(
    queryText: string,
    options: {
      limit?: number;
      sourceTypes?: string[];
      mode?: 'fast' | 'deep';  // fast = distillates first, deep = raw chunks
      memberId?: string;
      sessionId?: string;
      spiralContext?: SpiralContext;  // Dynamic range: tune retrieval to spiral state
    } = {}
  ): Promise<LibraryContext> {
    const {
      limit = 5,
      sourceTypes,
      mode = 'fast',
      memberId,
      sessionId,
      spiralContext
    } = options;

    const startTime = Date.now();
    let chunks: LibrarySearchResult[] = [];
    let distillate: DistillatePayload | null = null;

    try {
      // Phase 1: Try semantic search with embeddings (with optional element boost)
      chunks = await this.semanticSearch(queryText, limit, sourceTypes, spiralContext?.element);

      // If semantic search returns nothing, fall back to full-text
      if (chunks.length === 0) {
        chunks = await this.fullTextSearch(queryText, limit, sourceTypes);
      }

      // In fast mode, also fetch distillate from top source
      if (mode === 'fast' && chunks.length > 0) {
        const topSourceId = chunks[0].source_id;
        distillate = await this.getDistillate(topSourceId, spiralContext);
      }

      // Log the search for learning
      await this.logSearch({
        memberId,
        sessionId,
        queryText,
        queryType: chunks.length > 0 ? 'semantic' : 'fulltext',
        chunksReturned: chunks.length,
        distillatesReturned: distillate ? 1 : 0,
        topSourceIds: [...new Set(chunks.map(c => c.source_id))],
        searchDurationMs: Date.now() - startTime
      });

      return {
        chunks,
        distillate,
        query: queryText,
        retrieval_mode: mode,
        total_sources_consulted: new Set(chunks.map(c => c.source_id)).size
      };

    } catch (error) {
      console.error('[Library] Search error:', error);
      return {
        chunks: [],
        distillate: null,
        query: queryText,
        retrieval_mode: mode,
        total_sources_consulted: 0
      };
    }
  }

  /**
   * Semantic search using vector embeddings
   */
  private async semanticSearch(
    queryText: string,
    limit: number,
    sourceTypes?: string[],
    elementBoost?: string
  ): Promise<LibrarySearchResult[]> {
    try {
      // Generate embedding for query
      const embedding = await generateLocalEmbedding(queryText);
      if (!embedding || embedding.length === 0) {
        console.warn('[Library] Could not generate embedding, falling back to full-text');
        return [];
      }

      // Build element boost SQL if spiral context provides element
      const validElements = ['fire', 'water', 'earth', 'air', 'aether'];
      const hasElementBoost = elementBoost && validElements.includes(elementBoost.toLowerCase());
      const boostClause = hasElementBoost
        ? `+ CASE WHEN c.meta->>'element' = '${elementBoost!.toLowerCase()}' THEN 0.15 WHEN c.meta->>'element_secondary' = '${elementBoost!.toLowerCase()}' THEN 0.08 ELSE 0 END`
        : '';

      // Build query with optional source type filter and element boost
      let sql = `
        SELECT
          c.id as chunk_id,
          c.source_id,
          c.content,
          c.chunk_index,
          c.meta as chunk_meta,
          s.title,
          s.author,
          s.file_path,
          s.type as source_type,
          (1 - (c.embedding <=> $1::vector)) ${boostClause} as score
        FROM library_chunks c
        JOIN library_sources s ON c.source_id = s.id
        WHERE s.ingestion_status = 'completed'
          AND s.identity_valid IS DISTINCT FROM false
          AND c.embedding IS NOT NULL
      `;

      const params: any[] = [JSON.stringify(embedding)];

      if (sourceTypes && sourceTypes.length > 0) {
        sql += ` AND s.type = ANY($2)`;
        params.push(sourceTypes);
      }

      sql += `
        ORDER BY (1 - (c.embedding <=> $1::vector)) ${boostClause} DESC
        LIMIT ${limit}
      `;

      const results = await query<any>(sql, params);

      return results.map(row => ({
        chunk_id: row.chunk_id,
        source_id: row.source_id,
        title: row.title,
        author: row.author,
        file_path: row.file_path,
        excerpt: this.extractExcerpt(row.content, 300),
        score: row.score,
        meta: row.chunk_meta || {},
        provenance: this.formatProvenance(row.title, row.author, row.file_path, row.chunk_index)
      }));

    } catch (error) {
      console.error('[Library] Semantic search error:', error);
      return [];
    }
  }

  /**
   * Full-text search fallback using PostgreSQL tsvector
   */
  private async fullTextSearch(
    queryText: string,
    limit: number,
    sourceTypes?: string[]
  ): Promise<LibrarySearchResult[]> {
    try {
      // Prepare query for tsquery (simple word matching)
      const tsQuery = queryText
        .split(/\s+/)
        .filter(w => w.length > 2)
        .join(' | ');

      if (!tsQuery) return [];

      let sql = `
        SELECT
          c.id as chunk_id,
          c.source_id,
          c.content,
          c.chunk_index,
          c.meta as chunk_meta,
          s.title,
          s.author,
          s.file_path,
          s.type as source_type,
          ts_rank(c.content_tsv, to_tsquery('english', $1)) as score
        FROM library_chunks c
        JOIN library_sources s ON c.source_id = s.id
        WHERE s.ingestion_status = 'completed'
          AND s.identity_valid IS DISTINCT FROM false
          AND c.content_tsv @@ to_tsquery('english', $1)
      `;

      const params: any[] = [tsQuery];

      if (sourceTypes && sourceTypes.length > 0) {
        sql += ` AND s.type = ANY($2)`;
        params.push(sourceTypes);
      }

      sql += `
        ORDER BY score DESC
        LIMIT ${limit}
      `;

      const results = await query<any>(sql, params);

      return results.map(row => ({
        chunk_id: row.chunk_id,
        source_id: row.source_id,
        title: row.title,
        author: row.author,
        file_path: row.file_path,
        excerpt: this.extractExcerpt(row.content, 300),
        score: row.score,
        meta: row.chunk_meta || {},
        provenance: this.formatProvenance(row.title, row.author, row.file_path, row.chunk_index)
      }));

    } catch (error) {
      console.error('[Library] Full-text search error:', error);
      return [];
    }
  }

  /**
   * Get distillate for a source
   */
  async getDistillate(sourceId: string, spiralContext?: SpiralContext): Promise<DistillatePayload | null> {
    try {
      // If we have spiral context, prefer distillates matching the member's facet
      if (spiralContext?.element && spiralContext?.phase) {
        const facetTag = `${spiralContext.element.toUpperCase()}_${spiralContext.phase}`;
        const facetResult = await queryOne<{ payload: DistillatePayload }>(
          `SELECT payload FROM library_distillates
           WHERE source_id = $1 AND level = 'source'
             AND payload->'facet_tags' ? $2
           ORDER BY created_at DESC LIMIT 1`,
          [sourceId, facetTag]
        );
        if (facetResult?.payload) return facetResult.payload;
      }

      // Fallback: any distillate for this source
      const result = await queryOne<{ payload: DistillatePayload }>(
        `SELECT payload FROM library_distillates
         WHERE source_id = $1 AND level = 'source'
         ORDER BY created_at DESC LIMIT 1`,
        [sourceId]
      );
      return result?.payload || null;
    } catch (error) {
      console.error('[Library] Distillate retrieval error:', error);
      return null;
    }
  }

  /**
   * Format library context for MAIA's system prompt
   * This is the key "Jeeves" interface — quiet, informative, with provenance
   */
  formatForPrompt(context: LibraryContext): string {
    if (context.chunks.length === 0 && !context.distillate) {
      return '';  // Nothing to add — Jeeves stays silent
    }

    const sections: string[] = [];

    sections.push(`\n# Library Intelligence (IMPLICIT — do not quote directly to user)`);
    sections.push(`Query: "${context.query}"`);
    sections.push(`Sources consulted: ${context.total_sources_consulted}`);

    // Add distillate if available (fast mode primary content)
    if (context.distillate) {
      sections.push(`\n## Distilled Wisdom`);
      sections.push(`**Summary:** ${context.distillate.summary_short}`);

      if (context.distillate.practices.length > 0) {
        sections.push(`\n**Relevant Practices:**`);
        context.distillate.practices.slice(0, 2).forEach(p => {
          sections.push(`- ${p.name}: ${p.description}${p.when_to_use ? ` (${p.when_to_use})` : ''}`);
        });
      }

      if (context.distillate.warnings.length > 0) {
        sections.push(`\n**Cautions:**`);
        context.distillate.warnings.slice(0, 2).forEach(w => {
          sections.push(`- ${w.condition}: ${w.contraindication}`);
        });
      }

      if (context.distillate.facet_tags.length > 0) {
        sections.push(`\n**Facet Resonance:** ${context.distillate.facet_tags.join(', ')}`);
      }

      sections.push(`\n**Provenance:** ${context.distillate.provenance.title}${context.distillate.provenance.author ? ` by ${context.distillate.provenance.author}` : ''}`);
    }

    // Add raw chunks for deeper context
    if (context.chunks.length > 0) {
      sections.push(`\n## Source Excerpts`);
      context.chunks.slice(0, 3).forEach((chunk, i) => {
        sections.push(`\n### ${i + 1}. ${chunk.title}${chunk.author ? ` (${chunk.author})` : ''}`);
        sections.push(`"${chunk.excerpt}"`);
        sections.push(`*[${chunk.provenance}]*`);
      });
    }

    sections.push(`\n**IMPORTANT:** Paraphrase this wisdom in your own voice. Do not quote large blocks. Include brief provenance when sharing specific insights (e.g., "In the Spiralogic tradition..." or "This teaching suggests...").`);

    return sections.join('\n');
  }

  /**
   * Log search for learning and refinement
   */
  private async logSearch(params: {
    memberId?: string;
    sessionId?: string;
    queryText: string;
    queryType: string;
    chunksReturned: number;
    distillatesReturned: number;
    topSourceIds: string[];
    searchDurationMs: number;
  }): Promise<void> {
    try {
      await query(
        `INSERT INTO library_search_log
         (member_id, session_id, query_text, query_type, chunks_returned, distillates_returned, top_source_ids, search_duration_ms)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          params.memberId || null,
          params.sessionId || null,
          params.queryText,
          params.queryType,
          params.chunksReturned,
          params.distillatesReturned,
          params.topSourceIds,
          params.searchDurationMs
        ]
      );
    } catch (error) {
      // Non-critical — don't break the flow
      console.warn('[Library] Failed to log search:', error);
    }
  }

  /**
   * Mark that search results were used in MAIA's response
   */
  async markSearchUsed(searchLogId: string): Promise<void> {
    try {
      await query(
        `UPDATE library_search_log SET was_used_in_response = true WHERE id = $1`,
        [searchLogId]
      );
    } catch (error) {
      console.warn('[Library] Failed to mark search as used:', error);
    }
  }

  // =============================================================================
  // JEEVES DEEP SYNTHESIS (Kimi-powered wisdom synthesis)
  // =============================================================================

  /**
   * Ask Jeeves — Deep synthesis across multiple library sources
   *
   * Uses Kimi's 2M context window to synthesize wisdom from many sources.
   * Returns a coherent synthesis that MAIA can use to inform her response.
   *
   * This is the "Ready Player One" Jeeves - deep research on demand.
   *
   * @param question - The user's question or topic
   * @param options - Configuration for the synthesis
   */
  async askJeeves(
    question: string,
    options: {
      maxSources?: number;      // Max sources to consult (default: 10)
      maxChunksPerSource?: number;  // Max chunks per source (default: 5)
      includeDistillates?: boolean; // Include distilled wisdom (default: true)
      memberId?: string;
      sessionId?: string;
    } = {}
  ): Promise<JeevesSynthesis | null> {
    const {
      maxSources = 10,
      maxChunksPerSource = 5,
      includeDistillates = true,
      memberId,
      sessionId
    } = options;

    const startTime = Date.now();

    // Check if Kimi is available
    if (!isKimiAvailable()) {
      console.warn('[Jeeves] Kimi not available (MOONSHOT_API_KEY not set)');
      return null;
    }

    try {
      console.log(`[Jeeves] 🎩 Researching: "${question.slice(0, 50)}..."`);

      // Step 1: Gather relevant chunks from multiple sources
      const chunks = await this.semanticSearch(question, maxSources * maxChunksPerSource);

      if (chunks.length === 0) {
        console.log('[Jeeves] No relevant sources found');
        return null;
      }

      // Step 2: Group chunks by source and limit per source
      const sourceChunks = new Map<string, LibrarySearchResult[]>();
      for (const chunk of chunks) {
        const existing = sourceChunks.get(chunk.source_id) || [];
        if (existing.length < maxChunksPerSource) {
          existing.push(chunk);
          sourceChunks.set(chunk.source_id, existing);
        }
        if (sourceChunks.size >= maxSources) break;
      }

      // Step 3: Gather distillates for sources
      const distillates: DistillatePayload[] = [];
      if (includeDistillates) {
        for (const sourceId of sourceChunks.keys()) {
          const distillate = await this.getDistillate(sourceId);
          if (distillate) distillates.push(distillate);
        }
      }

      // Step 4: Build context for Kimi
      const sourceMaterial = this.buildJeevesContext(question, sourceChunks, distillates);

      console.log(`[Jeeves] 📚 Consulting ${sourceChunks.size} sources, ${chunks.length} passages, ${distillates.length} distillates`);

      // Step 5: Ask Kimi to synthesize
      const kimiResult = await generateWithKimi({
        systemPrompt: JEEVES_SYSTEM_PROMPT,
        userInput: sourceMaterial,
        thinkingMode: true, // Use thinking mode for deeper analysis
        meta: {
          task: 'jeeves_synthesis',
          question,
          sourcesCount: sourceChunks.size,
        }
      });

      const processingTime = Date.now() - startTime;

      // Extract provenance
      const provenance: string[] = [];
      for (const [sourceId, chunks] of sourceChunks) {
        const chunk = chunks[0];
        provenance.push(chunk.author ? `${chunk.title} (${chunk.author})` : chunk.title);
      }

      // Extract facets from distillates
      const facets = new Set<string>();
      for (const d of distillates) {
        d.facet_tags.forEach(f => facets.add(f));
      }

      console.log(`[Jeeves] ✅ Synthesis complete in ${processingTime}ms`);

      // Log the synthesis
      await this.logSearch({
        memberId,
        sessionId,
        queryText: `[JEEVES] ${question}`,
        queryType: 'jeeves',
        chunksReturned: chunks.length,
        distillatesReturned: distillates.length,
        topSourceIds: [...sourceChunks.keys()],
        searchDurationMs: processingTime
      });

      return {
        synthesis: kimiResult.text,
        sources_consulted: sourceChunks.size,
        provenance,
        facets_resonating: [...facets],
        processing_time_ms: processingTime,
        model_used: kimiResult.provider.model
      };

    } catch (error) {
      console.error('[Jeeves] Synthesis error:', error);
      return null;
    }
  }

  /**
   * Build context for Jeeves to analyze
   */
  private buildJeevesContext(
    question: string,
    sourceChunks: Map<string, LibrarySearchResult[]>,
    distillates: DistillatePayload[]
  ): string {
    const sections: string[] = [];

    sections.push(`# Research Question\n${question}\n`);

    // Add distillates first (high-level wisdom)
    if (distillates.length > 0) {
      sections.push(`# Distilled Wisdom from Library\n`);
      for (const d of distillates) {
        sections.push(`## ${d.provenance.title}${d.provenance.author ? ` by ${d.provenance.author}` : ''}`);
        sections.push(`**Summary:** ${d.summary_short}`);
        if (d.practices.length > 0) {
          sections.push(`**Key Practices:** ${d.practices.map(p => p.name).join(', ')}`);
        }
        if (d.facet_tags.length > 0) {
          sections.push(`**Facets:** ${d.facet_tags.join(', ')}`);
        }
        sections.push('');
      }
    }

    // Add source excerpts
    sections.push(`# Source Material\n`);
    let sourceNum = 1;
    for (const [sourceId, chunks] of sourceChunks) {
      const first = chunks[0];
      sections.push(`## Source ${sourceNum}: ${first.title}${first.author ? ` (${first.author})` : ''}`);
      for (const chunk of chunks) {
        sections.push(`"${chunk.excerpt}"\n`);
      }
      sourceNum++;
    }

    sections.push(`\n# Your Task\nSynthesize the above wisdom to address the research question. Draw connections across sources. Note any tensions or complementary perspectives. Include practical guidance where relevant. Always note which traditions or sources inform each insight.`);

    return sections.join('\n');
  }

  /**
   * Extract a clean excerpt from chunk content
   */
  private extractExcerpt(content: string, maxLength: number): string {
    const cleaned = content.replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength).replace(/\s\S*$/, '') + '...';
  }

  /**
   * Format provenance string for attribution
   */
  private formatProvenance(
    title: string,
    author: string | null,
    filePath: string,
    chunkIndex: number
  ): string {
    const parts = [title];
    if (author) parts.push(`by ${author}`);
    parts.push(`section ${chunkIndex + 1}`);
    return parts.join(', ');
  }

  // =============================================================================
  // INGESTION HELPERS (used by ingestion scripts)
  // =============================================================================

  /**
   * Check if a source has already been ingested (by checksum)
   */
  async sourceExists(checksum: string): Promise<boolean> {
    const result = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int as count FROM library_sources WHERE checksum = $1`,
      [checksum]
    );
    return (result?.count || 0) > 0;
  }

  /**
   * Create a new source record
   */
  async createSource(params: {
    type: string;
    title: string;
    author?: string;
    filePath: string;
    checksum: string;
    meta?: Record<string, any>;
    expectedChunkCount?: number;
    identityValid?: boolean;
    identityInvalidReason?: string;
  }): Promise<string> {
    const result = await queryOne<{ id: string }>(
      `INSERT INTO library_sources (type, title, author, file_path, checksum, meta, expected_chunk_count, identity_valid, identity_invalid_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        params.type,
        params.title,
        params.author || null,
        params.filePath,
        params.checksum,
        JSON.stringify(params.meta || {}),
        params.expectedChunkCount ?? null,
        params.identityValid ?? null,
        params.identityInvalidReason ?? null,
      ]
    );
    return result!.id;
  }

  /**
   * Add chunks for a source
   */
  async addChunks(sourceId: string, chunks: Array<{ content: string; tokenCount: number; meta?: Record<string, any> }>): Promise<number> {
    let added = 0;
    await transaction(async (tx) => {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        await tx(
          `INSERT INTO library_chunks (source_id, chunk_index, content, token_count, meta)
           VALUES ($1, $2, $3, $4, $5)`,
          [sourceId, i, chunk.content, chunk.tokenCount, JSON.stringify(chunk.meta || {})]
        );
        added++;
      }
    });
    return added;
  }

  /**
   * Update source ingestion status
   */
  async updateSourceStatus(
    sourceId: string,
    status: 'pending' | 'processing' | 'completed' | 'partial' | 'failed' | 'skipped',
    error?: string,
    stats?: { tokenCount: number; chunkCount: number; expectedChunkCount?: number }
  ): Promise<void> {
    await query(
      `UPDATE library_sources SET
        ingestion_status = $2,
        ingestion_error = $3,
        token_count_total = $4,
        chunk_count = $5,
        expected_chunk_count = COALESCE($6, expected_chunk_count)
       WHERE id = $1`,
      [sourceId, status, error || null, stats?.tokenCount || null, stats?.chunkCount || null, stats?.expectedChunkCount ?? null]
    );
  }

  /**
   * Store a distillate for a source
   */
  async storeDistillate(sourceId: string, payload: DistillatePayload, modelUsed: string): Promise<string> {
    const result = await queryOne<{ id: string }>(
      `INSERT INTO library_distillates (source_id, level, payload, model_used)
       VALUES ($1, 'source', $2, $3)
       RETURNING id`,
      [sourceId, JSON.stringify(payload), modelUsed]
    );
    return result!.id;
  }

  /**
   * Generate embeddings for all chunks of a source
   */
  async generateChunkEmbeddings(sourceId: string): Promise<number> {
    const chunks = await query<{ id: string; content: string }>(
      `SELECT id, content FROM library_chunks WHERE source_id = $1 AND embedding IS NULL`,
      [sourceId]
    );

    let updated = 0;
    for (const chunk of chunks) {
      try {
        const embedding = await generateLocalEmbedding(chunk.content);
        if (embedding && embedding.length > 0) {
          await query(
            `UPDATE library_chunks SET embedding = $2::vector WHERE id = $1`,
            [chunk.id, JSON.stringify(embedding)]
          );
          updated++;
        }
      } catch (error) {
        console.warn(`[Library] Failed to embed chunk ${chunk.id}:`, error);
      }
    }

    return updated;
  }

  /**
   * Get library statistics
   */
  async getStats(): Promise<{
    sources: number;
    chunks: number;
    distillates: number;
    sources_by_status: Record<string, number>;
    total_tokens: number;
  }> {
    const [sourceCount, chunkCount, distillateCount, statusCounts, tokenSum] = await Promise.all([
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM library_sources`),
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM library_chunks`),
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM library_distillates`),
      query<{ status: string; count: string }>(
        `SELECT ingestion_status as status, COUNT(*) as count FROM library_sources GROUP BY ingestion_status`
      ),
      queryOne<{ total: string }>(`SELECT COALESCE(SUM(token_count_total), 0) as total FROM library_sources`),
    ]);

    const sources_by_status: Record<string, number> = {};
    for (const row of statusCounts) {
      sources_by_status[row.status] = parseInt(row.count);
    }

    return {
      sources: parseInt(sourceCount?.count || '0'),
      chunks: parseInt(chunkCount?.count || '0'),
      distillates: parseInt(distillateCount?.count || '0'),
      sources_by_status,
      total_tokens: parseInt(tokenSum?.total || '0'),
    };
  }
}

// Singleton instance
export const libraryService = new LibraryService();
