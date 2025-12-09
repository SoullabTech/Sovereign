// backend: lib/consciousness/navigator/logger.ts

import { pool } from '@/lib/db'; // adjust to your actual Postgres pool
import { SoulState, NavigatorDecision } from './types';

export interface LogNavigatorDecisionParams {
  memberId: string;
  sessionId?: string;
  soulState: SoulState;
  decision: NavigatorDecision;
}

export const NavigatorLogger = {
  async logDecision(params: LogNavigatorDecisionParams): Promise<void> {
    const { memberId, sessionId, soulState, decision } = params;

    const activeSpiral = soulState.activeSpiral;

    await pool.query(
      `
      INSERT INTO navigator_decisions (
        member_id,
        session_id,
        decision_id,
        awareness_level,
        awareness_confidence,
        nervous_system_load,
        life_domain,
        spiral_phase,
        spiral_intensity,
        detected_facet,
        harmony_index,
        total_intensity_load,
        field_primary_theme,
        field_similarity_percentile,
        recommended_protocol_id,
        secondary_protocol_ids,
        guidance_tone,
        depth_level,
        risk_flags,
        requires_facilitator,
        raw_soul_state,
        raw_decision
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6,
        $7, $8, $9,
        $10, $11, $12,
        $13, $14,
        $15, $16,
        $17, $18,
        $19, $20,
        $21, $22
      )
      `,
      [
        memberId,
        sessionId ?? null,
        decision.decisionId,

        soulState.session.awarenessLevel ?? null,
        soulState.session.awarenessConfidence ?? null,
        soulState.session.nervousSystemLoad ?? null,

        activeSpiral?.lifeDomain ?? null,
        activeSpiral?.currentPhase ?? null,
        activeSpiral?.intensity ?? null,

        soulState.detectedFacet ?? null,
        soulState.constellation.harmonyIndex ?? null,
        soulState.constellation.totalIntensityLoad ?? null,

        soulState.field.primaryTheme ?? null,
        soulState.field.similarityPercentile ?? null,

        decision.recommendedProtocolId ?? null,
        decision.secondaryProtocolIds ?? null,
        decision.guidanceTone ?? null,
        decision.depthLevel ?? null,
        decision.riskFlags ?? null,
        decision.requiresFacilitator ?? false,

        JSON.stringify(soulState),
        JSON.stringify(decision),
      ],
    );
  },

  async logFeedback(params: {
    decisionId: string;
    memberId: string;
    rating?: number;
    notes?: string;
    source?: string; // 'member' | 'facilitator' | 'system'
  }): Promise<void> {
    const { decisionId, memberId, rating, notes, source } = params;

    await pool.query(
      `
      INSERT INTO navigator_feedback (
        decision_id,
        member_id,
        rating,
        notes,
        source
      ) VALUES ($1, $2, $3, $4, $5)
      `,
      [decisionId, memberId, rating ?? null, notes ?? null, source ?? 'member'],
    );
  },
};