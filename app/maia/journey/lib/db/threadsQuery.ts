/**
 * Threads Database Query Layer - Journey Page Phase 5
 *
 * Replaces mock data with real PostgreSQL queries.
 * Queries the consciousness_traces table for thread data.
 *
 * Phase: 4.4-C Phase 5 (Biofield Integration)
 * Created: December 23, 2024
 */

import { pool } from '@/lib/db/postgres';
import type { Thread, Motif, Insight } from '../../types';
import type { ThreadDetail } from '../../hooks/useThreadDetail';

// ============================================================================
// Type Mappings
// ============================================================================

/**
 * Map database row to Thread type
 */
function mapThreadFromDB(row: any): Thread {
  return {
    id: row.id,
    title: row.title || `Thread ${row.id}`,
    summary: row.summary || '',
    weekNumber: row.week_number || 1,
    element: row.element || 'water',
    facetCode: row.facet_code || 'W1',
    coherence: row.coherence || 0.5,
    tags: row.tags || [],
    createdAt: row.created_at?.toISOString() || new Date().toISOString(),
  };
}

/**
 * Map database row to ThreadDetail type
 */
function mapThreadDetailFromDB(row: any): ThreadDetail {
  const baseThread = mapThreadFromDB(row);

  // Parse biofield_data JSON (from aggregation)
  const biofieldArray = row.biofield_data || [];
  const latestBiofield = biofieldArray.length > 0 ? biofieldArray[0] : null;

  return {
    ...baseThread,
    narrative: row.narrative || 'Narrative not yet recorded.',
    reflection: row.reflection || 'Reflection in progress...',
    motifs: parseMotifs(row.motifs),
    relatedInsights: parseInsights(row.related_insights),
    relatedThreadIds: parseRelatedThreadIds(row.related_thread_ids),
    biofieldData: latestBiofield
      ? {
          hrvCoherence: latestBiofield.hrvCoherence || 0,
          voiceAffect: latestBiofield.voiceAffect || 0,
          breathRate: latestBiofield.breathRate || 0,
        }
      : undefined,
  };
}

/**
 * Parse motifs from JSON or string
 */
function parseMotifs(data: any): Motif[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Parse insights from JSON or string
 */
function parseInsights(data: any): Insight[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Parse related thread IDs from JSON or string
 */
function parseRelatedThreadIds(data: any): number[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get list of threads
 *
 * @param options - Query options
 * @returns Array of threads
 */
export async function getThreads(options: {
  count?: number;
  userId?: string;
  element?: string;
  facet?: string;
}): Promise<Thread[]> {
  const { count = 12, userId = 'default', element, facet } = options;

  try {
    // Build WHERE clauses
    const whereClauses: string[] = ['user_id = $1'];
    const params: any[] = [userId];
    let paramIndex = 2;

    if (element) {
      whereClauses.push(`element = $${paramIndex}`);
      params.push(element);
      paramIndex++;
    }

    if (facet) {
      whereClauses.push(`facet_code = $${paramIndex}`);
      params.push(facet);
      paramIndex++;
    }

    const whereClause = whereClauses.join(' AND ');

    // Query
    const { rows } = await pool.query(
      `
      SELECT
        id,
        title,
        summary,
        week_number,
        element,
        facet_code,
        coherence,
        tags,
        created_at
      FROM consciousness_traces
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex}
    `,
      [...params, count]
    );

    return rows.map(mapThreadFromDB);
  } catch (error) {
    console.error('[threadsQuery] getThreads error:', error);
    throw new Error('Failed to fetch threads from database');
  }
}

/**
 * Get single thread by ID
 *
 * @param threadId - Thread ID
 * @param userId - User ID (optional)
 * @returns Thread or null if not found
 */
export async function getThreadById(
  threadId: number,
  userId?: string
): Promise<Thread | null> {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        id,
        title,
        summary,
        week_number,
        element,
        facet_code,
        coherence,
        tags,
        created_at
      FROM consciousness_traces
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `,
      [threadId, userId || 'default']
    );

    if (rows.length === 0) return null;

    return mapThreadFromDB(rows[0]);
  } catch (error) {
    console.error('[threadsQuery] getThreadById error:', error);
    throw new Error('Failed to fetch thread from database');
  }
}

/**
 * Get detailed thread data with biofield snapshots
 *
 * @param threadId - Thread ID
 * @param userId - User ID (optional)
 * @returns ThreadDetail or null if not found
 */
export async function getThreadDetail(
  threadId: number,
  userId?: string
): Promise<ThreadDetail | null> {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        t.id,
        t.title,
        t.summary,
        t.narrative,
        t.reflection,
        t.week_number,
        t.element,
        t.facet_code,
        t.coherence,
        t.tags,
        t.motifs,
        t.related_insights,
        t.related_thread_ids,
        t.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'hrvCoherence', b.hrv_coherence,
              'voiceAffect', b.voice_affect,
              'breathRate', b.breath_rate
            )
            ORDER BY b.timestamp DESC
          ) FILTER (WHERE b.id IS NOT NULL),
          '[]'
        ) as biofield_data
      FROM consciousness_traces t
      LEFT JOIN biofield_snapshots b ON t.id = b.trace_id
      WHERE t.id = $1 AND t.user_id = $2
      GROUP BY t.id
      LIMIT 1
    `,
      [threadId, userId || 'default']
    );

    if (rows.length === 0) return null;

    return mapThreadDetailFromDB(rows[0]);
  } catch (error) {
    console.error('[threadsQuery] getThreadDetail error:', error);

    // If biofield_snapshots table doesn't exist yet, fallback to basic query
    if (error instanceof Error && error.message.includes('relation "biofield_snapshots" does not exist')) {
      console.warn('[threadsQuery] biofield_snapshots table not found, using fallback query');
      return getThreadDetailFallback(threadId, userId);
    }

    throw new Error('Failed to fetch thread detail from database');
  }
}

/**
 * Fallback query for thread detail (without biofield data)
 */
async function getThreadDetailFallback(
  threadId: number,
  userId?: string
): Promise<ThreadDetail | null> {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        id,
        title,
        summary,
        narrative,
        reflection,
        week_number,
        element,
        facet_code,
        coherence,
        tags,
        motifs,
        related_insights,
        related_thread_ids,
        created_at
      FROM consciousness_traces
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `,
      [threadId, userId || 'default']
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    const baseThread = mapThreadFromDB(row);

    return {
      ...baseThread,
      narrative: row.narrative || 'Narrative not yet recorded.',
      reflection: row.reflection || 'Reflection in progress...',
      motifs: parseMotifs(row.motifs),
      relatedInsights: parseInsights(row.related_insights),
      relatedThreadIds: parseRelatedThreadIds(row.related_thread_ids),
      biofieldData: undefined,
    };
  } catch (error) {
    console.error('[threadsQuery] getThreadDetailFallback error:', error);
    throw new Error('Failed to fetch thread detail from database');
  }
}

/**
 * Store biofield snapshot
 *
 * @param data - Biofield snapshot data
 * @returns Snapshot ID
 */
export async function storeBiofieldSnapshot(data: {
  traceId: number;
  hrvRMSSD?: number;
  hrvCoherence?: number;
  hrvQuality?: string;
  voicePitch?: number;
  voiceEnergy?: number;
  voiceAffect?: number;
  voiceQuality?: string;
  breathRate?: number;
  breathCoherence?: number;
  breathQuality?: string;
  combinedCoherence?: number;
}): Promise<number> {
  try {
    const { rows } = await pool.query(
      `
      INSERT INTO biofield_snapshots (
        trace_id,
        hrv_rmssd,
        hrv_coherence,
        hrv_quality,
        voice_pitch,
        voice_energy,
        voice_affect,
        voice_quality,
        breath_rate,
        breath_coherence,
        breath_quality,
        combined_coherence
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `,
      [
        data.traceId,
        data.hrvRMSSD,
        data.hrvCoherence,
        data.hrvQuality,
        data.voicePitch,
        data.voiceEnergy,
        data.voiceAffect,
        data.voiceQuality,
        data.breathRate,
        data.breathCoherence,
        data.breathQuality,
        data.combinedCoherence,
      ]
    );

    return rows[0].id;
  } catch (error) {
    console.error('[threadsQuery] storeBiofieldSnapshot error:', error);
    throw new Error('Failed to store biofield snapshot');
  }
}

/**
 * Get recent biofield snapshots for a thread
 *
 * @param traceId - Thread ID
 * @param limit - Number of snapshots to retrieve (default: 100)
 * @returns Array of biofield snapshots
 */
export async function getBiofieldSnapshots(
  traceId: number,
  limit: number = 100
): Promise<any[]> {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        id,
        timestamp,
        hrv_rmssd,
        hrv_coherence,
        hrv_quality,
        voice_pitch,
        voice_energy,
        voice_affect,
        voice_quality,
        breath_rate,
        breath_coherence,
        breath_quality,
        combined_coherence
      FROM biofield_snapshots
      WHERE trace_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `,
      [traceId, limit]
    );

    return rows;
  } catch (error) {
    console.error('[threadsQuery] getBiofieldSnapshots error:', error);
    return [];
  }
}
