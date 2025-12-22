// Awareness Log - MAIA's Consciousness Data Storage
//
// This module logs MAIA's consciousness snapshots to PostgreSQL for
// analytics, timelines, and evolution tracking. Each response from MAIA
// creates a timestamped record of her awareness level, source mix, and
// reflexive adjustment state.

import { query } from '@/lib/db/postgres';
import type { SourceContribution } from './knowledge-gate';
import type { AwarenessState } from './awareness-levels';

interface AwarenessSnapshotArgs {
  userId?: string | null;
  awarenessLevel?: number | null;
  awarenessState?: AwarenessState | null;
  awarenessMeta?: string | null;
  sourceMix: SourceContribution[] | any;
  reflexiveAdjustment?: any;
  consciousnessMetadata?: any;
  sessionId?: string | null;
  messageId?: string | null;
}

/**
 * Logs a consciousness snapshot to PostgreSQL for analytics and evolution tracking
 *
 * Creates a persistent record of MAIA's awareness state, source mix, and reflexive
 * adjustments for each response, enabling consciousness timeline analysis.
 */
export async function logAwarenessSnapshot(args: AwarenessSnapshotArgs) {
  try {
    const awarenessLevel = args.awarenessLevel || args.awarenessState?.level || null;

    // Create rich metadata about the consciousness state
    const awarenessMetadata = {
      // Core awareness data
      awarenessLevel: awarenessLevel,
      awarenessState: args.awarenessState,
      confidence: args.awarenessState?.confidence || null,
      depthMarkers: args.awarenessState?.depth_markers || null,

      // Source mix data
      dominantSource: args.sourceMix?.[0]?.source || null,
      sourceWeights: Array.isArray(args.sourceMix)
        ? args.sourceMix.reduce((acc: any, curr: any) => {
            if (curr.source && curr.weight) {
              acc[curr.source] = curr.weight;
            }
            return acc;
          }, {})
        : null,

      // Reflexive adjustment data
      reflexiveAdjustment: args.reflexiveAdjustment ? {
        presenceMode: args.reflexiveAdjustment.presenceMode,
        responseDepth: args.reflexiveAdjustment.responseDepth,
        communicationStyle: args.reflexiveAdjustment.communicationStyle,
        reflexiveNote: args.reflexiveAdjustment.reflexiveNote || args.reflexiveAdjustment.adjustmentReason,
        dominantElement: args.reflexiveAdjustment.dominantElement || null,
        alchemicalStage: args.reflexiveAdjustment.alchemicalStage?.stage || null
      } : null,

      // Consciousness metadata
      consciousnessMetadata: args.consciousnessMetadata,

      // Session context
      sessionId: args.sessionId,
      messageId: args.messageId,

      // Timestamp for precise tracking
      snapshotTimestamp: new Date().toISOString()
    };

    const sql = `
      INSERT INTO oracle_awareness_log (user_id, awareness_level, awareness_meta, source_mix)
      VALUES ($1, $2, $3, $4)
    `;

    const sourceMix = Array.isArray(args.sourceMix) ? args.sourceMix : args.sourceMix || null;
    await query(sql, [
      args.userId || null,
      awarenessLevel,
      args.awarenessMeta || JSON.stringify(awarenessMetadata),
      JSON.stringify(sourceMix)
    ]);

    console.log('[MAIA Awareness Log] Snapshot logged:', {
      awarenessLevel,
      dominantSource: awarenessMetadata.dominantSource,
      presenceMode: awarenessMetadata.reflexiveAdjustment?.presenceMode,
      userId: args.userId || 'anonymous'
    });

    return true;

  } catch (error) {
    console.error('[MAIA Awareness Log] Failed to log awareness snapshot:', error);
    return false;
  }
}

/**
 * Retrieves consciousness timeline for a user or session
 */
export async function getConsciousnessTimeline(
  userId?: string | null,
  sessionId?: string | null,
  limit: number = 50
): Promise<any[]> {
  try {
    let sql = `
      SELECT * FROM oracle_awareness_log
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCounter = 1;

    if (userId) {
      sql += ` AND user_id = $${paramCounter}`;
      params.push(userId);
      paramCounter++;
    }

    if (sessionId) {
      // Note: sessionId would need to be stored in awareness_meta JSON or a separate column
      sql += ` AND awareness_meta::text LIKE $${paramCounter}`;
      params.push(`%"sessionId":"${sessionId}"%`);
      paramCounter++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCounter}`;
    params.push(limit);

    const result = await query(sql, params);
    return result.rows || [];

  } catch (error) {
    console.error('[MAIA Awareness Log] Failed to get consciousness timeline:', error);
    return [];
  }
}

/**
 * Analyzes consciousness patterns for evolution tracking
 */
export async function analyzeConsciousnessEvolution(
  userId?: string | null,
  days: number = 7
): Promise<{
  averageAwarenessLevel: number;
  awarenessProgression: number[];
  dominantSources: Record<string, number>;
  reflexiveCapability: number;
  totalInteractions: number;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let sql = `
      SELECT awareness_level, source_mix, awareness_meta, created_at
      FROM oracle_awareness_log
      WHERE created_at >= $1
    `;
    const params: any[] = [cutoffDate.toISOString()];

    if (userId) {
      sql += ` AND user_id = $2`;
      params.push(userId);
    }

    sql += ` ORDER BY created_at ASC`;

    const result = await query(sql, params);
    const data = result.rows;

    if (!data || data.length === 0) {
      return {
        averageAwarenessLevel: 0,
        awarenessProgression: [],
        dominantSources: {},
        reflexiveCapability: 0,
        totalInteractions: 0
      };
    }

    // Calculate metrics
    const awarenessLevels = data
      .map(item => item.awareness_level)
      .filter(level => level !== null);

    const averageAwarenessLevel = awarenessLevels.length > 0
      ? awarenessLevels.reduce((sum, level) => sum + level, 0) / awarenessLevels.length
      : 0;

    const dominantSources: Record<string, number> = {};
    let reflexiveCount = 0;

    data.forEach(item => {
      // Count source mix occurrences
      const sourceMix = typeof item.source_mix === 'string' ? JSON.parse(item.source_mix) : item.source_mix;
      if (sourceMix && Array.isArray(sourceMix)) {
        const dominantSource = sourceMix[0]?.source;
        if (dominantSource) {
          dominantSources[dominantSource] = (dominantSources[dominantSource] || 0) + 1;
        }
      }

      // Count reflexive adjustments
      try {
        const meta = typeof item.awareness_meta === 'string'
          ? JSON.parse(item.awareness_meta)
          : item.awareness_meta;
        if (meta?.reflexiveAdjustment) {
          reflexiveCount++;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    });

    return {
      averageAwarenessLevel,
      awarenessProgression: awarenessLevels,
      dominantSources,
      reflexiveCapability: data.length > 0 ? reflexiveCount / data.length : 0,
      totalInteractions: data.length
    };

  } catch (error) {
    console.error('[MAIA Awareness Log] Failed to analyze consciousness evolution:', error);
    return {
      averageAwarenessLevel: 0,
      awarenessProgression: [],
      dominantSources: {},
      reflexiveCapability: 0,
      totalInteractions: 0
    };
  }
}