// Integration Helper: Canary-Aware Router Weights Resolver
import { pool } from "@/lib/db/postgres";

export interface FacetWeights {
  W1: number;
  W2: number;
  W3: number;
  F1: number;
  F2: number;
  F3: number;
  E1: number;
  E2: number;
  E3: number;
  A1: number;
  A2: number;
  A3: number;
  Æ1: number;
  Æ2: number;
  Æ3: number;
  [key: string]: number; // Allow additional facets
}

/**
 * Get effective facet weights for member (canary-aware)
 *
 * This resolver enables GUARDED-tier canary deployments by:
 * 1. Checking if member is in an active canary
 * 2. Returning proposed_config if in canary
 * 3. Falling back to global weights otherwise
 *
 * Usage:
 * ```typescript
 * import { getEffectiveFacetWeights } from "@/lib/co-evolution/routerWeightsResolver";
 *
 * // Inside your symbolic router:
 * const weights = await getEffectiveFacetWeights(session.userId);
 *
 * // Apply weights to facet scores:
 * const weightedScores = {
 *   W1: baseScores.W1 * (weights.W1 ?? 1.0),
 *   F2: baseScores.F2 * (weights.F2 ?? 1.0),
 *   // ... etc
 * };
 *
 * const winner = Object.entries(weightedScores)
 *   .sort((a, b) => b[1] - a[1])[0];
 * ```
 */
export async function getEffectiveFacetWeights(memberId: string): Promise<FacetWeights | null> {
  const client = await pool.connect();
  try {
    // Check if member is in active canary
    const canary = await client.query<{ proposed_config: FacetWeights }>(
      `SELECT ic.proposed_config
       FROM canary_deployments cd
       JOIN improvement_candidates ic ON ic.id = cd.improvement_candidate_id
       WHERE cd.ended_at IS NULL
         AND $1::text = ANY(cd.member_ids)
         AND ic.change_type='router_weight'
       ORDER BY cd.started_at DESC
       LIMIT 1`,
      [memberId]
    );

    if (canary.rows[0]?.proposed_config) {
      return canary.rows[0].proposed_config;
    }

    // Return global weights
    const global = await client.query<{ facet_weights: FacetWeights }>(
      `SELECT facet_weights
       FROM router_weights
       WHERE scope='global' AND active=true
       ORDER BY updated_at DESC
       LIMIT 1`
    );

    return global.rows[0]?.facet_weights ?? null;
  } catch (error) {
    console.error("[routerWeightsResolver] Error:", error);
    return null;
  } finally {
    client.release();
  }
}

/**
 * Get relational profile for member
 *
 * Returns relational dimensions and agent weights for member.
 * Creates default profile if none exists.
 */
export async function getRelationalProfile(memberId: string) {
  const client = await pool.connect();
  try {
    // Ensure profile exists
    await client.query(
      `INSERT INTO relational_profiles (member_id)
       VALUES ($1)
       ON CONFLICT (member_id) DO NOTHING`,
      [memberId]
    );

    const { rows } = await client.query(
      `SELECT *
       FROM relational_profiles
       WHERE member_id = $1`,
      [memberId]
    );

    return rows[0] ?? null;
  } catch (error) {
    console.error("[getRelationalProfile] Error:", error);
    return null;
  } finally {
    client.release();
  }
}
