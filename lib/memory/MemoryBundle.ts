/**
 * MEMORY BUNDLE BUILDER
 *
 * Implements the full recall pipeline:
 * 1. Retrieve → from multiple buckets (recent, semantic, breakthroughs)
 * 2. Rank → composite scoring (similarity × significance × recency × facet)
 * 3. Compress → memory bullets instead of raw content
 * 4. Permission gate → respect scope (session-only vs cross-session)
 *
 * Returns a structured bundle ready for prompt injection.
 */

import { query } from '@/lib/db/postgres';
import { TurnsStore } from './stores/TurnsStore';
import { generateLocalEmbedding } from './embeddings';
import { calculateDecayedConfidence } from './confidenceDecay';
import { ConversationMemoryUsesStore } from './stores/ConversationMemoryUsesStore';
import { memberRef } from '../privacy/memberRef';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface MemoryBullet {
  id?: string;          // Original memory row ID (for audit trail)
  content: string;      // Compressed summary
  source: 'turn' | 'developmental' | 'insight' | 'breakthrough';
  significance: number; // 0-1
  timestamp: Date;
  facet?: string;       // Spiralogic facet if available
}

export interface RelationshipSnapshot {
  encounterCount: number;
  firstSeen: Date | null;
  lastSeen: Date | null;
  breakthroughCount: number;
  recentBreakthroughs: string[];  // Last 2-3 breakthrough summaries
  dominantElement?: string;       // Most frequent element
  integrationRate: number;        // % of breakthroughs marked integrated
}

/**
 * One ranked candidate, as the existing pipeline already adjudicated it.
 *
 * M1.5 (observability only): this is DERIVED from `deduplicate(rankCandidates(...))`
 * and the existing `slice(0, maxBullets)` — it introduces no ranking, no
 * threshold, and no selection rule. `rank` is the candidate's index in the
 * already-ordered deduped list; `selected` is whether that index survived the
 * existing cutoff. Removing this field would change what is REPORTED and
 * nothing about what is CHOSEN.
 *
 * Deliberately carries no memory body — identifiers, provenance, score and
 * state are enough to reconstruct the decision without logging private content.
 */
export interface MemorySelectionTraceEntry {
  id: string;
  source: 'turn' | 'developmental' | 'insight' | 'breakthrough';
  score: number | null;
  rank: number;
  selected: boolean;
}

export interface MemoryBundle {
  // Compressed content for prompt injection
  recentContinuity: string;       // "Last session summary"
  memoryBullets: MemoryBullet[];  // Ranked, compressed memories
  relationshipSnapshot: RelationshipSnapshot;

  /** Observability only — see MemorySelectionTraceEntry. Never influences selection. */
  selectionTrace: MemorySelectionTraceEntry[];

  // Metadata for debugging/logging
  retrievalStats: {
    turnsRetrieved: number;
    turnsSameSession: number;      // Turns from current session
    turnsCrossSession: number;     // Turns from other sessions
    semanticHits: number;
    breakthroughsFound: number;
    totalCandidates: number;
    afterRanking: number;
  };
}

export interface BuildBundleInput {
  userId: string;
  currentInput: string;           // User's current message (for semantic search)
  sessionId?: string;
  traceId?: string;               // For memory usage audit trail
  facet?: string;                 // Current Spiralogic facet
  scope?: 'session' | 'cross_session' | 'all';  // Permission gate
  maxBullets?: number;            // Default 5
}

// ═══════════════════════════════════════════════════════════════
// MEMORY BUNDLE SERVICE
// ═══════════════════════════════════════════════════════════════

export const MemoryBundleService = {

  /**
   * BUILD MEMORY BUNDLE
   *
   * Main entry point. Retrieves from all buckets, ranks, compresses,
   * and returns a structured bundle for prompt injection.
   */
  async build(input: BuildBundleInput): Promise<MemoryBundle> {
    const { userId, currentInput, sessionId, traceId, facet, scope = 'cross_session', maxBullets = 5 } = input;

    console.log(`📦 [MemoryBundle] Building for user: ${memberRef(userId)}`);

    // Parallel retrieval from all buckets
    const [recentTurns, semanticMemories, breakthroughs, relationshipData] = await Promise.all([
      this.getRecentTurns(userId, sessionId, scope),
      this.getSemanticMemories(userId, currentInput, facet),
      this.getBreakthroughs(userId),
      this.getRelationshipData(userId),
    ]);

    // Merge and rank all candidates
    const allCandidates = [
      ...this.turnsToCandidate(recentTurns),
      ...semanticMemories,
      ...this.breakthroughsToCandidate(breakthroughs),
    ];

    // 📊 MEMORY AUDIT: Record retrieved candidates BEFORE compression (Option B)
    // This captures the canonical "one row per retrieved memory" audit trail
    if (traceId && sessionId && userId && allCandidates.length > 0) {
      try {
        await ConversationMemoryUsesStore.recordRetrievedCandidates({
          sessionId,
          messageId: traceId,
          userId,
          candidates: allCandidates.map(c => ({
            id: c.id,
            source: c.source,
            retrievalScore: c.compositeScore ?? null,
            semanticScore: c.similarity ?? null,
            confidenceScore: c.significance ?? null,
            usedAs: c.source === 'breakthrough' ? 'breakthrough' : c.source === 'insight' ? 'pattern' : 'context',
          })),
        });
      } catch (auditErr) {
        console.warn('⚠️ [MemoryBundle] Failed to record candidate audit:', auditErr);
        // Non-blocking
      }
    }

    // Rank with composite score
    const ranked = this.rankCandidates(allCandidates, currentInput, facet);

    // De-duplicate and take top N
    const deduped = this.deduplicate(ranked);
    const topBullets = deduped.slice(0, maxBullets);

    // Compress into memory bullets
    const memoryBullets = topBullets.map(c => this.compress(c));

    // M1.5 OBSERVABILITY — read AFTER the cutoff above, never before it.
    // `deduped` is already ordered; `topBullets` is already chosen. This only
    // names what happened. It must stay below both so it cannot be mistaken
    // for an input to either.
    const selectionTrace: MemorySelectionTraceEntry[] = deduped.map((c, index) => ({
      id: c.id,
      source: c.source,
      score: typeof c.compositeScore === 'number' ? c.compositeScore : null,
      rank: index,
      selected: index < maxBullets,
    }));

    // Build recent continuity summary
    const recentContinuity = this.buildContinuitySummary(recentTurns);

    // Build relationship snapshot
    const relationshipSnapshot = this.buildRelationshipSnapshot(relationshipData, breakthroughs);

    // Compute same-session vs cross-session turn counts
    const turnsSameSession = recentTurns.filter(t => t.sessionId === sessionId).length;
    const turnsCrossSession = recentTurns.length - turnsSameSession;

    console.log(`📦 [MemoryBundle] Built: ${memoryBullets.length} bullets, ${recentTurns.length} recent turns (${turnsCrossSession} cross-session)`);

    return {
      recentContinuity,
      memoryBullets,
      relationshipSnapshot,
      selectionTrace,
      retrievalStats: {
        turnsRetrieved: recentTurns.length,
        turnsSameSession,
        turnsCrossSession,
        semanticHits: semanticMemories.length,
        breakthroughsFound: breakthroughs.length,
        totalCandidates: allCandidates.length,
        afterRanking: topBullets.length,
      },
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // BUCKET RETRIEVAL
  // ═══════════════════════════════════════════════════════════════

  /**
   * BUCKET A: Cross-session turns (exclude current session)
   * Uses exact SQL from user guidance
   */
  async getRecentTurns(
    userId: string,
    sessionId?: string,
    scope: 'session' | 'cross_session' | 'all' = 'cross_session'
  ): Promise<Array<{ id?: string; role: string; content: string; createdAt: string; sessionId?: string }>> {

    if (scope === 'session' && sessionId) {
      // Session-only: only return turns from current session
      return TurnsStore.getSessionTurns(sessionId);
    }

    // Cross-session: exclude current session
    if (scope === 'cross_session' && sessionId) {
      const result = await query(`
        SELECT id, role, content, created_at as "createdAt", session_id as "sessionId"
        FROM conversation_turns
        WHERE user_id = $1
          AND session_id <> $2
        ORDER BY created_at DESC
        LIMIT 12
      `, [userId, sessionId]);
      return (result.rows ?? []).reverse();
    }

    // All: return recent turns across all sessions
    return TurnsStore.getRecentTurns(userId, 12);
  },

  /**
   * BUCKET B: Developmental memories (non-vector ranking first, then semantic)
   * Uses exact SQL from user guidance - starts with significance + recency ranking
   */
  async getSemanticMemories(
    userId: string,
    queryText: string,
    facet?: string
  ): Promise<MemoryCandidate[]> {
    try {
      // First try non-vector ranking with confidence decay (works even when tables are empty/no embeddings)
      // NOTE (2026-04-09): scope/authority clauses removed — columns do not exist in the production schema.
      // This was the root cause of silent memory retrieval failure. See MAIA_MEMORY_CANON_v1.0.md §VIII
      // (schema drift = canon violation). Global canon memory is a future feature: when reintroduced,
      // re-add a WHERE clause against columns that actually exist in developmental_memories.
      const nonVectorSql = `
        SELECT
          id,
          memory_type,
          facet_code,
          entity_tags,
          content_text,
          significance,
          formed_at,
          last_confirmed_at,
          confirmed_by_user,
          recall_count,
          (
            0.40 * COALESCE(
              calculate_decayed_confidence(significance, memory_type, last_confirmed_at, formed_at),
              significance
            ) +
            0.35 * EXP(-EXTRACT(EPOCH FROM (NOW() - formed_at)) / 86400.0 / 30.0) +
            0.15 * CASE WHEN confirmed_by_user THEN 0.15 ELSE 0 END +
            0.10 * LEAST(recall_count / 10.0, 1.0)
          ) AS score
        FROM developmental_memories
        WHERE user_id = $1
          AND content_text IS NOT NULL
          AND (valid_to IS NULL OR valid_to > NOW())
        ORDER BY score DESC
        LIMIT 12
      `;

      const nonVectorResult = await query(nonVectorSql, [userId]);

      if (nonVectorResult.rows && nonVectorResult.rows.length > 0) {
        console.log(`[MemoryBundle] Non-vector retrieval: ${nonVectorResult.rows.length} memories`);
        return nonVectorResult.rows.map(row => ({
          id: row.id,
          content: row.content_text,
          source: 'developmental' as const,
          significance: parseFloat(row.significance) || 0.5,
          timestamp: new Date(row.formed_at),
          facet: row.facet_code,
          similarity: 0,
          compositeScore: parseFloat(row.score) || 0,
        }));
      }

      // If non-vector returns nothing, try vector search (for future when embeddings exist)
      const embedding = await generateLocalEmbedding(queryText);

      if (embedding.length === 0) {
        console.log('[MemoryBundle] No embedding generated, returning empty');
        return [];
      }

      // NOTE (2026-04-09): scope/authority removed from SELECT and WHERE — see non-vector query above.
      const vectorSql = `
        SELECT
          id,
          content_text,
          significance,
          facet_code,
          formed_at,
          memory_type,
          entity_tags,
          1 - (vector_embedding <=> $1::vector) AS similarity,
          (
            0.50 * (1 - (vector_embedding <=> $1::vector)) +
            0.30 * LEAST(significance, 1.0) +
            0.20 * EXP(-EXTRACT(EPOCH FROM (NOW() - formed_at)) / 86400.0 / 30.0)
          ) AS composite_score
        FROM developmental_memories
        WHERE user_id = $2
          AND vector_embedding IS NOT NULL
        ORDER BY composite_score DESC
        LIMIT 8
      `;

      const vectorResult = await query(vectorSql, [`[${embedding.join(',')}]`, userId]);

      return (vectorResult.rows || []).map(row => ({
        id: row.id,
        content: row.content_text || '',
        source: 'developmental' as const,
        significance: parseFloat(row.significance) || 0.5,
        timestamp: new Date(row.formed_at),
        facet: row.facet_code,
        similarity: parseFloat(row.similarity) || 0,
        compositeScore: parseFloat(row.composite_score) || 0,
      }));

    } catch (err) {
      console.warn('[MemoryBundle] Memory retrieval failed:', err);
      return [];
    }
  },

  /**
   * BUCKET C: Breakthroughs (prefer not integrated, most recent)
   * Uses exact SQL from user guidance
   */
  async getBreakthroughs(userId: string): Promise<Array<{
    id: string;
    insight: string;
    element?: string;
    integrated: boolean;
    timestamp: Date;
    relatedThemes: string[];
  }>> {
    try {
      const result = await query(`
        SELECT id, timestamp, insight, element, integrated, related_themes
        FROM breakthrough_moments
        WHERE user_id = $1
        ORDER BY integrated ASC, timestamp DESC
        LIMIT 5
      `, [userId]);

      return (result.rows || []).map(row => ({
        id: row.id,
        insight: row.insight,
        element: row.element,
        integrated: row.integrated,
        timestamp: new Date(row.timestamp),
        relatedThemes: row.related_themes || [],
      }));
    } catch (err) {
      console.warn('[MemoryBundle] Breakthrough fetch failed:', err);
      return [];
    }
  },

  /**
   * BUCKET D: Relationship data (encounter history)
   */
  async getRelationshipData(userId: string): Promise<{
    encounterCount: number;
    firstSeen: Date | null;
    lastSeen: Date | null;
    sessionCount: number;
  }> {
    try {
      const result = await query(`
        SELECT
          COUNT(*) as encounter_count,
          MIN(created_at) as first_seen,
          MAX(created_at) as last_seen,
          COUNT(DISTINCT session_id) as session_count
        FROM conversation_turns
        WHERE user_id = $1
      `, [userId]);

      const row = result.rows?.[0];
      return {
        encounterCount: parseInt(row?.encounter_count || '0'),
        firstSeen: row?.first_seen ? new Date(row.first_seen) : null,
        lastSeen: row?.last_seen ? new Date(row.last_seen) : null,
        sessionCount: parseInt(row?.session_count || '0'),
      };
    } catch (err) {
      console.warn('[MemoryBundle] Relationship data fetch failed:', err);
      return { encounterCount: 0, firstSeen: null, lastSeen: null, sessionCount: 0 };
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // RANKING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Rank candidates with composite scoring
   */
  rankCandidates(
    candidates: MemoryCandidate[],
    currentInput: string,
    facet?: string
  ): MemoryCandidate[] {

    return candidates
      .map(c => {
        // Use pre-computed score if available (from semantic query)
        if (c.compositeScore) return c;

        // Otherwise compute score
        const similarity = c.similarity || 0;
        const significance = c.significance || 0.5;
        const recencyDays = (Date.now() - c.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.exp(-recencyDays / 30); // Decay over 30 days
        const facetMatch = (facet && c.facet === facet) ? 1.2 : 1.0; // 20% boost for facet match

        c.compositeScore = (
          0.40 * similarity +
          0.30 * significance +
          0.20 * recencyScore +
          0.10
        ) * facetMatch;

        return c;
      })
      .sort((a, b) => (b.compositeScore || 0) - (a.compositeScore || 0));
  },

  /**
   * De-duplicate by content similarity
   */
  deduplicate(candidates: MemoryCandidate[]): MemoryCandidate[] {
    const seen = new Set<string>();
    const deduped: MemoryCandidate[] = [];

    for (const c of candidates) {
      // Simple hash: first 100 chars lowercase
      const hash = c.content.substring(0, 100).toLowerCase().replace(/\s+/g, ' ');
      if (!seen.has(hash)) {
        seen.add(hash);
        deduped.push(c);
      }
    }

    return deduped;
  },

  // ═══════════════════════════════════════════════════════════════
  // COMPRESSION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Compress a candidate into a memory bullet
   */
  compress(candidate: MemoryCandidate): MemoryBullet {
    // Truncate content intelligently
    let content = candidate.content;

    if (content.length > 150) {
      // Find a natural break point
      const breakPoints = ['. ', '? ', '! ', ', ', ' '];
      let truncated = content.substring(0, 150);

      for (const bp of breakPoints) {
        const lastBreak = truncated.lastIndexOf(bp);
        if (lastBreak > 80) {
          truncated = truncated.substring(0, lastBreak + bp.length - 1);
          break;
        }
      }

      content = truncated + (truncated.length < candidate.content.length ? '...' : '');
    }

    return {
      id: candidate.id || undefined,  // Preserve for audit trail
      content,
      source: candidate.source,
      significance: candidate.significance,
      timestamp: candidate.timestamp,
      facet: candidate.facet,
    };
  },

  /**
   * Build a continuity summary from recent turns
   */
  buildContinuitySummary(turns: Array<{ role: string; content: string; createdAt: string }>): string {
    if (turns.length === 0) return '';

    // Get last 3 exchanges (6 turns max)
    const recent = turns.slice(-6);

    const bullets: string[] = [];
    for (let i = 0; i < recent.length; i += 2) {
      const userTurn = recent[i];
      const assistantTurn = recent[i + 1];

      if (userTurn?.role === 'user') {
        const userSnippet = userTurn.content.substring(0, 60) + (userTurn.content.length > 60 ? '...' : '');
        const assistantSnippet = assistantTurn?.content?.substring(0, 60) || '';
        bullets.push(`• User: "${userSnippet}" → MAIA responded about ${this.extractTopicHint(assistantSnippet)}`);
      }
    }

    return bullets.length > 0
      ? `Recent conversation:\n${bullets.join('\n')}`
      : '';
  },

  /**
   * Build relationship snapshot for prompt context
   */
  buildRelationshipSnapshot(
    relationshipData: { encounterCount: number; firstSeen: Date | null; lastSeen: Date | null; sessionCount: number },
    breakthroughs: Array<{ insight: string; element?: string; integrated: boolean }>
  ): RelationshipSnapshot {

    const integratedCount = breakthroughs.filter(b => b.integrated).length;
    const integrationRate = breakthroughs.length > 0
      ? integratedCount / breakthroughs.length
      : 0;

    // Find dominant element from breakthroughs
    const elementCounts: Record<string, number> = {};
    for (const b of breakthroughs) {
      if (b.element) {
        elementCounts[b.element] = (elementCounts[b.element] || 0) + 1;
      }
    }
    const dominantElement = Object.entries(elementCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      encounterCount: relationshipData.encounterCount,
      firstSeen: relationshipData.firstSeen,
      lastSeen: relationshipData.lastSeen,
      breakthroughCount: breakthroughs.length,
      recentBreakthroughs: breakthroughs.slice(0, 3).map(b =>
        b.insight.substring(0, 80) + (b.insight.length > 80 ? '...' : '')
      ),
      dominantElement,
      integrationRate,
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════

  turnsToCandidate(turns: Array<{ id?: string; role: string; content: string; createdAt: string }>): MemoryCandidate[] {
    return turns
      .filter(t => t.role === 'user') // Only user messages as candidates
      .map(t => ({
        id: t.id || '',  // Preserve turn ID for audit trail
        content: t.content,
        source: 'turn' as const,
        significance: 0.5, // Base significance for turns
        timestamp: new Date(t.createdAt),
        similarity: 0,
        compositeScore: 0,
      }));
  },

  breakthroughsToCandidate(breakthroughs: Array<{ id: string; insight: string; element?: string; timestamp: Date }>): MemoryCandidate[] {
    return breakthroughs.map(b => ({
      id: b.id,
      content: b.insight,
      source: 'breakthrough' as const,
      significance: 0.9, // High significance for breakthroughs
      timestamp: b.timestamp,
      facet: b.element,
      similarity: 0,
      compositeScore: 0,
    }));
  },

  extractTopicHint(text: string): string {
    // Extract a brief topic hint from response
    if (!text || text.length < 10) return 'the topic';

    // Look for key phrases
    const patterns = [
      /about\s+(\w+(?:\s+\w+)?)/i,
      /regarding\s+(\w+(?:\s+\w+)?)/i,
      /your\s+(\w+(?:\s+\w+)?)/i,
    ];

    for (const p of patterns) {
      const match = text.match(p);
      if (match) return match[1];
    }

    // Fallback: first few words
    return text.split(' ').slice(0, 3).join(' ');
  },

  /**
   * FORMAT FOR PROMPT
   *
   * Returns a string ready to inject into the prompt.
   */
  formatForPrompt(bundle: MemoryBundle): string {
    const parts: string[] = [];

    // Relationship context (brief)
    if (bundle.relationshipSnapshot.encounterCount > 0) {
      const rs = bundle.relationshipSnapshot;
      parts.push(`🧠 RELATIONSHIP: ${rs.encounterCount} turns across sessions. ${rs.breakthroughCount} breakthroughs recorded${rs.dominantElement ? ` (${rs.dominantElement} dominant)` : ''}.`);
    }

    // Recent continuity
    if (bundle.recentContinuity) {
      parts.push(bundle.recentContinuity);
    }

    // Memory bullets (if any relevant ones)
    if (bundle.memoryBullets.length > 0) {
      const bulletText = bundle.memoryBullets
        .map(b => `• [${b.source}${b.facet ? `/${b.facet}` : ''}] ${b.content}`)
        .join('\n');
      parts.push(`\n📚 RELEVANT MEMORIES:\n${bulletText}`);
    }

    // Breakthrough context (if any)
    if (bundle.relationshipSnapshot.recentBreakthroughs.length > 0) {
      parts.push(`\n⭐ RECENT BREAKTHROUGHS:\n${bundle.relationshipSnapshot.recentBreakthroughs.map(b => `• ${b}`).join('\n')}`);
    }

    return parts.join('\n\n');
  },
};

// Internal type for ranking candidates
interface MemoryCandidate {
  id: string;
  content: string;
  source: 'turn' | 'developmental' | 'insight' | 'breakthrough';
  significance: number;
  timestamp: Date;
  facet?: string;
  similarity?: number;
  compositeScore?: number;
}

export default MemoryBundleService;
