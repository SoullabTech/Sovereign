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
import { adjudicateParticipation, type ProvenanceClaim, type ExclusionReason } from '../maia/participationGate';

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

/**
 * P3b (MIPA Phase 0) — BREAKTHROUGH SNAPSHOTS ARE PARTICIPATION-TYPED.
 *
 * `breakthrough_moments` carries NO provenance column — not `authored_by`, not
 * `marked_by_member`, not `source_turn_id`. Its columns are id, user_id,
 * timestamp, insight, element, integrated, related_themes, conversation_id.
 * Row-level authorship is therefore not certifiable at read time, whatever
 * wrote the row.
 *
 * Both branches of the ambiguity converge on the same verdict, which is why the
 * exclusion is robust rather than resting on the uncertainty:
 *
 *   - The SOLE live writer (`MemoryWriteback.ts:384-390`) fires on
 *     `significance >= 0.5 || isBreakthroughPattern(...)` and stores a
 *     machine-`extractInsight`ed string. That is system inference end to end;
 *     even with a provenance column it would be `maia`/`inference` and would
 *     still be excluded as unendorsed.
 *   - LEGACY rows are indeterminate, and indeterminate provenance is excluded
 *     rather than guessed.
 *
 * NOTHING MEMBER-AUTHORED IS EXCLUDED BY THIS. No writer in the repository can
 * express member marking for this table (`addBreakthrough` and
 * `saveBreakthroughMoment` both have zero callers, and neither ever took a
 * member-marked input). The member-marked breakthrough class is
 * `member_memory_atoms.is_breakthrough` — schema-constrained member-only, on
 * the atoms path, untouched by this change.
 *
 * `insight` and `element` exist ONLY on the admitted arm, so composing them
 * without narrowing on the discriminant is a compile error.
 */
/**
 * P3c (MIPA Phase 0) — THE DEVELOPMENTAL BUCKET IS THE SAME MATERIAL R24 EXCLUDED.
 *
 * `getSemanticMemories` selects `content_text` from `developmental_memories` —
 * the same table AND the same column that P3a adjudicated as uncertified
 * inference. This is not a second inference class. It is an ALTERNATE READER to
 * material already excluded, reaching the prompt through a different composer
 * (`formatForPrompt` memory bullets) and, unlike the `directional_cue` prime
 * R24 removed, reaching it VERBATIM.
 *
 * Per the adjudication: converge onto the same participation boundary rather
 * than inventing a parallel provenance or adjudication mechanism. The claim is
 * `null` here for the same reason it is null in `memoryLoaders` — the table
 * records no authorship, and inferring it from the probable writer is the guess
 * the backfill policy forbids.
 *
 * `content` exists only on the admitted arm, so composing it without narrowing
 * is a compile error.
 */
export interface DevelopmentalRowBase {
  id: string;
  significance: number;
  timestamp: Date;
  facet?: string;
  similarity: number;
  compositeScore: number;
}

export interface AdmittedDevelopmentalRow extends DevelopmentalRowBase {
  participation: 'admitted';
  content: string;
}

export interface ExcludedDevelopmentalRow extends DevelopmentalRowBase {
  participation: 'excluded';
  exclusionReason: ExclusionReason;
}

export type DevelopmentalRowSnapshot =
  | AdmittedDevelopmentalRow
  | ExcludedDevelopmentalRow;

/** P3c — the developmental bucket reports what it withheld, not only what it yielded. */
export interface DevelopmentalBucketResult {
  candidates: MemoryCandidate[];
  excludedCount: number;
}

export interface BreakthroughBase {
  id: string;
  integrated: boolean;
  timestamp: Date;
  relatedThemes: string[];
}

export interface AdmittedBreakthrough extends BreakthroughBase {
  participation: 'admitted';
  insight: string;
  element?: string;
}

export interface ExcludedBreakthrough extends BreakthroughBase {
  participation: 'excluded';
  exclusionReason: ExclusionReason;
}

export type BreakthroughSnapshot = AdmittedBreakthrough | ExcludedBreakthrough;

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
    /** P3c observability — reported after adjudication, never an input to it. */
    developmentalExcluded: number;
    breakthroughsFound: number;
    /**
     * P3b observability. Reported AFTER adjudication, never an input to it —
     * same discipline as `selectionTrace`. Distinguishes "the member has no
     * breakthroughs" from "breakthroughs existed and did not participate".
     */
    breakthroughsExcluded: number;
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
    const [recentTurns, developmentalBucket, breakthroughs, relationshipData] = await Promise.all([
      this.getRecentTurns(userId, sessionId, scope),
      this.getSemanticMemories(userId, currentInput, facet),
      this.getBreakthroughs(userId),
      this.getRelationshipData(userId),
    ]);

    // Merge and rank all candidates
    const allCandidates = [
      ...this.turnsToCandidate(recentTurns),
      ...developmentalBucket.candidates,
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
        semanticHits: developmentalBucket.candidates.length,
        developmentalExcluded: developmentalBucket.excludedCount,
        breakthroughsFound: breakthroughs.filter(b => b.participation === 'admitted').length,
        breakthroughsExcluded: breakthroughs.filter(b => b.participation === 'excluded').length,
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
  ): Promise<DevelopmentalBucketResult> {
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
        const adjudicated = nonVectorResult.rows.map((row) =>
          this.adjudicateDevelopmentalRow({
            id: row.id,
            content_text: row.content_text,
            significance: parseFloat(row.significance) || 0.5,
            formed_at: row.formed_at,
            facet_code: row.facet_code,
            similarity: 0,
            score: parseFloat(row.score) || 0,
          }),
        );
        const excludedCount = adjudicated.filter(r => r.participation === 'excluded').length;
        console.log(
          `[MemoryBundle] Non-vector retrieval: ${nonVectorResult.rows.length} rows, ` +
          `${excludedCount} excluded by participation gate (P3c)`,
        );
        return {
          candidates: this.developmentalToCandidates(adjudicated),
          excludedCount,
        };
      }

      // If non-vector returns nothing, try vector search (for future when embeddings exist)
      const embedding = await generateLocalEmbedding(queryText);

      if (embedding.length === 0) {
        console.log('[MemoryBundle] No embedding generated, returning empty');
        return { candidates: [], excludedCount: 0 };
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

      // P3c — the vector branch is doubly dead today (unreachable when the
      // non-vector branch returns rows; and MemoryWriteback writes
      // vector_embedding as NULL). It is gated rather than deleted so that if
      // embeddings ever appear, the material does not walk back in ungoverned.
      const vectorAdjudicated = (vectorResult.rows || []).map((row) =>
          this.adjudicateDevelopmentalRow({
            id: row.id,
            content_text: row.content_text || '',
            significance: parseFloat(row.significance) || 0.5,
            formed_at: row.formed_at,
            facet_code: row.facet_code,
            similarity: parseFloat(row.similarity) || 0,
            score: parseFloat(row.composite_score) || 0,
          }),
        );
      return {
        candidates: this.developmentalToCandidates(vectorAdjudicated),
        excludedCount: vectorAdjudicated.filter(r => r.participation === 'excluded').length,
      };

    } catch (err) {
      console.warn('[MemoryBundle] Memory retrieval failed:', err);
      return { candidates: [], excludedCount: 0 };
    }
  },

  /**
   * P3c — the single certified adjudication point for a developmental row.
   *
   * Converges onto `adjudicateParticipation`, the same gate P3a and P3b use. No
   * parallel provenance model, no second adjudicator: an alternate reader must
   * reach the SAME boundary, or the boundary is decorative.
   */
  adjudicateDevelopmentalRow(row: {
    id: string;
    content_text: string | null;
    significance: number;
    formed_at: string | Date;
    facet_code?: string | null;
    similarity: number;
    score: number;
  }): DevelopmentalRowSnapshot {
    const base = {
      id: row.id,
      significance: row.significance,
      timestamp: new Date(row.formed_at),
      facet: row.facet_code ?? undefined,
      similarity: row.similarity,
      compositeScore: row.score,
    };

    // Same reasoning as lib/maia/memoryLoaders.ts: `developmental_memories`
    // records no authorship, so nothing here can establish it. Never guessed,
    // never defaulted to member.
    const provenance: ProvenanceClaim = null;

    const verdict = adjudicateParticipation({ provenance, endorsement: 'none' });
    if (!verdict.admitted) {
      // No `content` on this arm — by type, not convention.
      return { ...base, participation: 'excluded', exclusionReason: verdict.reason };
    }
    return { ...base, participation: 'admitted', content: row.content_text ?? '' };
  },

  /**
   * P3c — admitted developmental rows become candidates; excluded ones do not.
   * `content: r.content` does not typecheck against the union.
   */
  developmentalToCandidates(rows: DevelopmentalRowSnapshot[]): MemoryCandidate[] {
    return rows
      .filter((r): r is AdmittedDevelopmentalRow => r.participation === 'admitted')
      .map((r) => ({
        id: r.id,
        content: r.content,
        source: 'developmental' as const,
        significance: r.significance,
        timestamp: r.timestamp,
        facet: r.facet,
        similarity: r.similarity,
        compositeScore: r.compositeScore,
      }));
  },

  /**
   * BUCKET C: Breakthroughs (prefer not integrated, most recent)
   * Uses exact SQL from user guidance
   */
  async getBreakthroughs(userId: string): Promise<BreakthroughSnapshot[]> {
    try {
      const result = await query(`
        SELECT id, timestamp, insight, element, integrated, related_themes
        FROM breakthrough_moments
        WHERE user_id = $1
        ORDER BY integrated ASC, timestamp DESC
        LIMIT 5
      `, [userId]);

      return (result.rows || []).map((row): BreakthroughSnapshot => {
        const base = {
          id: row.id,
          integrated: row.integrated,
          timestamp: new Date(row.timestamp),
          relatedThemes: row.related_themes || [],
        };

        // P3b — PROVENANCE IS NEVER GUESSED, AND NEVER DEFAULTED TO MEMBER.
        //
        // The table has no provenance column, so nothing here can establish
        // authorship. Defaulting to `member` would be the most dangerous
        // possible "compatibility fix": it would convert machine inference into
        // member testimony silently, at the top of the authority lattice.
        const provenance: ProvenanceClaim = null;

        const verdict = adjudicateParticipation({ provenance, endorsement: 'none' });
        if (!verdict.admitted) {
          // No `insight`, no `element` on this arm — by type, not convention.
          return { ...base, participation: 'excluded', exclusionReason: verdict.reason };
        }
        return { ...base, participation: 'admitted', insight: row.insight, element: row.element };
      });
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
    allBreakthroughs: BreakthroughSnapshot[]
  ): RelationshipSnapshot {

    // P3b — EVERY breakthrough-derived field is computed from ADMITTED rows only.
    //
    // Including the COUNT. "7 breakthroughs recorded (water dominant)" is an
    // aggregate claim about the member's development, and an aggregate over
    // uncertified inference is still uncertified inference — it is arguably
    // worse, because a count reads as established fact while carrying no
    // provenance a reader could interrogate.
    const breakthroughs = allBreakthroughs.filter(
      (b): b is AdmittedBreakthrough => b.participation === 'admitted',
    );

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

  breakthroughsToCandidate(breakthroughs: BreakthroughSnapshot[]): MemoryCandidate[] {
    // P3b — the filter is not defensive style. `content: b.insight` does not
    // typecheck against the union, because the excluded arm has no `insight`.
    return breakthroughs
      .filter((b): b is AdmittedBreakthrough => b.participation === 'admitted')
      .map(b => ({
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
      // P3b — when no breakthrough is admitted, the clause is OMITTED rather
      // than rendered as "0 breakthroughs recorded". Asserting zero is still
      // asserting; silence is the honest form of having nothing certified.
      const bt = rs.breakthroughCount > 0
        ? ` ${rs.breakthroughCount} breakthroughs recorded${rs.dominantElement ? ` (${rs.dominantElement} dominant)` : ''}.`
        : '';
      parts.push(`🧠 RELATIONSHIP: ${rs.encounterCount} turns across sessions.${bt}`);
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
