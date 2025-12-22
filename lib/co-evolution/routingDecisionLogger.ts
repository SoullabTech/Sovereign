// Integration Helper: Routing Decision Logger with Version Pointers
import { pool } from "@/lib/db/postgres";

export interface RoutingDecisionInput {
  userId: string;
  sessionId: string;
  facetCode: string;
  confidence: number;
  alternatives: any; // Array of competing hypotheses
  routingRuleId: string;

  biomarkers?: any;
  extractedCues?: any;
  safetyFlags?: any;

  myceliumCycleId?: string | null;

  // VERSION POINTERS - Keystone for causality tracking
  relationalProfileVersionUsed?: number | null;
  routerWeightsVersionUsed?: number | null;
  ruleVersionUsed?: number | null;
}

/**
 * Record routing decision with full trace spine
 *
 * This is the KEYSTONE integration point that enables:
 * - Competing hypotheses logging (why this facet, not others)
 * - Version pointers for causality tracking
 * - Offline replay capability
 *
 * Usage:
 * ```typescript
 * import { recordRoutingDecision } from "@/lib/co-evolution/routingDecisionLogger";
 *
 * // Inside your symbolic router:
 * const decisionId = await recordRoutingDecision({
 *   userId: session.userId,
 *   sessionId: session.id,
 *   facetCode: "W1",
 *   confidence: 0.87,
 *   alternatives: [
 *     { facet: "F2", confidence: 0.72, reason: "Lower confidence due to arousal mismatch" },
 *     { facet: "A1", confidence: 0.64, reason: "Cognitive signal present but weaker" }
 *   ],
 *   routingRuleId: "facet:W1:spring:safety",
 *   biomarkers: { arousal: 0.65, valence: -0.12, hrv: 42.3 },
 *   extractedCues: { keywords: ["overwhelm", "panic"], emotions: ["fear"] },
 *   safetyFlags: {},
 *   relationalProfileVersionUsed: profile.version,
 *   routerWeightsVersionUsed: weights.version,
 *   ruleVersionUsed: 1
 * });
 * ```
 */
export async function recordRoutingDecision(input: RoutingDecisionInput): Promise<string | null> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO routing_decisions (
        member_id, session_id,
        facet_code, confidence, alternatives, routing_rule_id,
        biomarkers, extracted_cues, safety_flags,
        mycelium_cycle_id,
        relational_profile_version_used,
        router_weights_version_used,
        rule_version_used,
        timestamp
      ) VALUES (
        $1,$2,
        $3,$4,$5::jsonb,$6,
        $7::jsonb,$8::jsonb,$9::jsonb,
        $10,
        $11,$12,$13,
        NOW()
      )
      RETURNING id`,
      [
        input.userId,
        input.sessionId,
        input.facetCode,
        input.confidence,
        JSON.stringify(input.alternatives ?? []),
        input.routingRuleId,
        JSON.stringify(input.biomarkers ?? {}),
        JSON.stringify(input.extractedCues ?? {}),
        JSON.stringify(input.safetyFlags ?? {}),
        input.myceliumCycleId ?? null,
        input.relationalProfileVersionUsed ?? null,
        input.routerWeightsVersionUsed ?? null,
        input.ruleVersionUsed ?? null,
      ]
    );
    return rows[0]?.id ?? null;
  } catch (error) {
    console.error("[routingDecisionLogger] Error:", error);
    return null;
  } finally {
    client.release();
  }
}
