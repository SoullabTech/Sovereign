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
  version?: number; // Version tracking for CEE causality
  [key: string]: number | undefined; // Allow additional facets and version
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
    const canary = await client.query<{ proposed_config: FacetWeights; version: number }>(
      `SELECT ic.proposed_config, ic.version
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
      return {
        ...canary.rows[0].proposed_config,
        version: canary.rows[0].version
      };
    }

    // Return global weights
    const global = await client.query<{ facet_weights: FacetWeights; version: number }>(
      `SELECT facet_weights, version
       FROM router_weights
       WHERE scope='global' AND active=true
       ORDER BY updated_at DESC
       LIMIT 1`
    );

    if (global.rows[0]?.facet_weights) {
      return {
        ...global.rows[0].facet_weights,
        version: global.rows[0].version
      };
    }

    return null;
  } catch (error) {
    console.error("[routerWeightsResolver] Error:", error);
    return null;
  } finally {
    client.release();
  }
}

/**
 * Resolve all version pointers for CEE causality tracking
 *
 * Returns version numbers for router weights, relational profile, and rules
 * to enable full causality tracking in CEE.
 */
export async function resolveRouterWeights(memberId: string): Promise<{
  relational_profile_version_used: number | null;
  router_weights_version_used: number | null;
  rule_version_used: number | null;
}> {
  try {
    // Get router weights version (uses its own pool connection)
    const weights = await getEffectiveFacetWeights(memberId);
    const router_weights_version_used = weights?.version ?? null;

    // Get relational profile version (uses its own pool connection)
    const profile = await getRelationalProfile(memberId);
    const relational_profile_version_used = profile?.version ?? null;

    // Rule version is currently static (would come from consciousness_rules table)
    const rule_version_used = 1;

    return {
      relational_profile_version_used,
      router_weights_version_used,
      rule_version_used
    };
  } catch (error) {
    console.error("[resolveRouterWeights] Error:", error);
    return {
      relational_profile_version_used: null,
      router_weights_version_used: null,
      rule_version_used: null
    };
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
