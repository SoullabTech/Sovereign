// Awareness Log - MAIA's Consciousness Data Storage
//
// This module logs MAIA's consciousness snapshots to local Supabase for
// analytics, timelines, and evolution tracking. Each response from MAIA
// creates a timestamped record of her awareness level, source mix, and
// reflexive adjustment state.

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
 * Logs a consciousness snapshot to Supabase for analytics and evolution tracking
 *
 * Creates a persistent record of MAIA's awareness state, source mix, and reflexive
 * adjustments for each response, enabling consciousness timeline analysis.
 */
export async function logAwarenessSnapshot(args: AwarenessSnapshotArgs) {
  try {
    const supabase = createClient();

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

    const insertData = {
      user_id: args.userId || null,
      awareness_level: awarenessLevel,
      awareness_meta: args.awarenessMeta || JSON.stringify(awarenessMetadata),
      source_mix: Array.isArray(args.sourceMix) ? args.sourceMix : args.sourceMix || null,
    };

    const { error } = await supabase
      .from('oracle_awareness_log')
      .insert(insertData);

    if (error) {
      console.error('[MAIA Awareness Log] Failed to insert snapshot:', error);
      return false;
    }

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
    const supabase = createClient();

    let query = supabase
      .from('oracle_awareness_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (sessionId) {
      // Note: sessionId would need to be stored in awareness_meta JSON or a separate column
      query = query.like('awareness_meta', `%"sessionId":"${sessionId}"%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[MAIA Awareness Log] Failed to fetch timeline:', error);
      return [];
    }

    return data || [];

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
    const supabase = createClient();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let query = supabase
      .from('oracle_awareness_log')
      .select('awareness_level, source_mix, awareness_meta, created_at')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: true });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('[MAIA Awareness Log] Failed to analyze evolution:', error);
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
      if (item.source_mix && Array.isArray(item.source_mix)) {
        const dominantSource = item.source_mix[0]?.source;
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