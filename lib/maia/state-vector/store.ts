/**
 * STATE VECTOR STORE
 *
 * Persistence layer for state vectors.
 * Uses local PostgreSQL via lib/db/postgres.ts (never Supabase).
 *
 * Read and write operations for state vectors, plus history queries.
 */

import { query, insertOne, queryOne, getMany } from '../../db/postgres';
import type {
  StateVector,
  StateVectorRow,
  Element,
  KairosAssessment,
} from './types';

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Persist a state vector to the database.
 * Returns the stored row.
 */
export async function storeStateVector(
  sv: StateVector,
  rawText?: string
): Promise<StateVectorRow> {
  const row = {
    id: sv.id,
    member_id: sv.memberId,
    session_id: sv.sessionId || null,
    source: sv.source,
    primary_element: sv.primary.element,
    primary_facet_code: sv.primary.facet
      ? (sv.primary.facet.type === 'spiralogic' ? sv.primary.facet.code : sv.primary.facet.quality)
      : null,
    primary_phase: sv.primary.phase || null,
    primary_intensity: sv.primary.intensity,
    primary_polarity: sv.primary.polarity,
    primary_stability: sv.primary.stability,
    secondary_element: sv.secondary?.element || null,
    secondary_reading: sv.secondary ? JSON.stringify(sv.secondary) : null,
    confidence: sv.confidence,
    kairos_assessment: sv.kairos.assessment,
    kairos_confidence: sv.kairos.confidence,
    kairos_description: sv.kairos.description || null,
    movement: JSON.stringify(sv.movement),
    evidence: JSON.stringify(sv.evidence),
    raw_text: rawText || null,
  };

  return insertOne<StateVectorRow>('state_vectors', row);
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Get the most recent state vector for a member.
 */
export async function getLatestVector(memberId: string): Promise<StateVectorRow | null> {
  return queryOne<StateVectorRow>(
    `SELECT * FROM state_vectors WHERE member_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [memberId]
  );
}

/**
 * Get recent state vectors for a member (for trend analysis).
 */
export async function getRecentVectors(
  memberId: string,
  limit: number = 10
): Promise<StateVectorRow[]> {
  return getMany<StateVectorRow>(
    `SELECT * FROM state_vectors WHERE member_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [memberId, limit]
  );
}

/**
 * Get state vectors for a specific session.
 */
export async function getSessionVectors(sessionId: string): Promise<StateVectorRow[]> {
  return getMany<StateVectorRow>(
    `SELECT * FROM state_vectors WHERE session_id = $1 ORDER BY created_at ASC`,
    [sessionId]
  );
}

/**
 * Get element distribution for a member over a time period.
 * Returns counts of each element.
 */
export async function getElementDistribution(
  memberId: string,
  days: number = 30
): Promise<Record<Element, number>> {
  const result = await query<{ primary_element: Element; count: string }>(
    `SELECT primary_element, COUNT(*) as count
     FROM state_vectors
     WHERE member_id = $1 AND created_at > NOW() - INTERVAL '1 day' * $2
     GROUP BY primary_element`,
    [memberId, days]
  );

  const distribution: Record<Element, number> = {
    earth: 0, water: 0, fire: 0, air: 0, aether: 0,
  };

  for (const row of result.rows) {
    distribution[row.primary_element] = parseInt(row.count);
  }

  return distribution;
}

/**
 * Get members currently at collapse-risk or threshold.
 * Used for safety monitoring (facilitator dashboard).
 */
export async function getElevatedKairosMembers(): Promise<StateVectorRow[]> {
  return getMany<StateVectorRow>(
    `SELECT DISTINCT ON (member_id) *
     FROM state_vectors
     WHERE kairos_assessment IN ('threshold', 'collapse-risk')
       AND created_at > NOW() - INTERVAL '24 hours'
     ORDER BY member_id, created_at DESC`
  );
}

/**
 * Get daily polarity and stability averages for a member.
 * Used for the longitudinal state card.
 */
export async function getDailyAverages(
  memberId: string,
  days: number = 14
): Promise<Array<{
  day: string;
  avg_polarity: number;
  avg_stability: number;
  readings: number;
  dominant_element: Element;
}>> {
  const result = await query(
    `SELECT
       DATE_TRUNC('day', created_at)::date AS day,
       ROUND(AVG(primary_polarity), 1) AS avg_polarity,
       ROUND(AVG(primary_stability), 1) AS avg_stability,
       COUNT(*) AS readings,
       MODE() WITHIN GROUP (ORDER BY primary_element) AS dominant_element
     FROM state_vectors
     WHERE member_id = $1 AND created_at > NOW() - INTERVAL '1 day' * $2
     GROUP BY DATE_TRUNC('day', created_at)
     ORDER BY day DESC`,
    [memberId, days]
  );

  return result.rows;
}
