/**
 * Regulation System
 *
 * Meta-consciousness layer that monitors hemisphere balance and suggests
 * corrective action. This implements McGilchrist's concept of the Master
 * (RH) regulating the Emissary (LH).
 */

import db from '@/lib/db/postgres';

type HemisphereBalance = {
  rh_percent: number;
  lh_percent: number;
  int_percent: number;
  total_beads: number;
  window_days: number;
};

type RegulationDecision = {
  action: 'increase_rh' | 'increase_lh' | 'increase_int' | 'maintain_balance';
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  recommendations: string[];
};

/**
 * GLOBAL baseline thresholds for healthy hemisphere balance
 * These are used when we don't have enough personal history
 */
const GLOBAL_BASELINE = {
  rh_min: 15,  // Below this, meaning-field is collapsing
  rh_target: 30, // Ideal RH percentage
  lh_max: 85,  // Above this, reductionism risk
  lh_target: 50, // Ideal LH percentage
  int_min: 10, // Below this, integration deficit
  int_target: 20, // Ideal INT percentage
};

/**
 * Personal baseline type - learned from user's own history
 */
type PersonalBaseline = {
  rh_target: number;
  lh_target: number;
  int_target: number;
  sample_size: number;
  learned_from_days: number;
};

/**
 * Get current hemisphere balance over specified window
 * Optionally filter by user_id for personalized tracking
 */
export async function getHemisphereBalance(days: number = 7, userId?: string): Promise<HemisphereBalance | null> {
  try {
    const params: any[] = [];
    let userClause = '';

    if (userId) {
      params.push(userId);
      userClause = `AND user_id = $${params.length}`;
    }

    const result = await db.query(`
      SELECT
        COALESCE(AVG(CAST(rh_percent AS FLOAT)), 0) AS rh_percent,
        COALESCE(AVG(CAST(lh_percent AS FLOAT)), 0) AS lh_percent,
        SUM(CAST(total_beads AS INT)) AS total_beads
      FROM v_hemisphere_balance
      WHERE day > NOW() - INTERVAL '${days} days'
        ${userClause}
    `, params);

    if (!result.rows.length || result.rows[0].total_beads === null) {
      return null;
    }

    const row = result.rows[0];
    const rh_percent = parseFloat(row.rh_percent || '0');
    const lh_percent = parseFloat(row.lh_percent || '0');
    const total_beads = parseInt(row.total_beads || '0', 10);
    const int_percent = Math.max(0, 100 - rh_percent - lh_percent);

    return {
      rh_percent,
      lh_percent,
      int_percent,
      total_beads,
      window_days: days
    };
  } catch (error) {
    console.error('[Regulation] Failed to get hemisphere balance:', error);
    return null;
  }
}

/**
 * Learn personalized hemisphere baseline from user's historical data
 * Uses 60-90 day window to establish healthy equilibrium
 */
export async function getPersonalBaseline(userId: string): Promise<PersonalBaseline | null> {
  try {
    // Query user's 90-day hemisphere balance history
    const result = await db.query(`
      SELECT
        COALESCE(AVG(CAST(rh_percent AS FLOAT)), 0) AS avg_rh,
        COALESCE(AVG(CAST(lh_percent AS FLOAT)), 0) AS avg_lh,
        COUNT(*) AS days_count,
        SUM(CAST(total_beads AS INT)) AS total_beads
      FROM v_hemisphere_balance
      WHERE day > NOW() - INTERVAL '90 days'
        AND user_id = $1
    `, [userId]);

    if (!result.rows.length || !result.rows[0].days_count) {
      return null;
    }

    const row = result.rows[0];
    const days_count = parseInt(row.days_count, 10);
    const total_beads = parseInt(row.total_beads || '0', 10);

    // Need at least 10 days and 50 beads to establish personal baseline
    if (days_count < 10 || total_beads < 50) {
      return null;
    }

    const avg_rh = parseFloat(row.avg_rh || '0');
    const avg_lh = parseFloat(row.avg_lh || '0');
    const avg_int = Math.max(0, 100 - avg_rh - avg_lh);

    return {
      rh_target: avg_rh,
      lh_target: avg_lh,
      int_target: avg_int,
      sample_size: total_beads,
      learned_from_days: days_count
    };
  } catch (error) {
    console.error('[Regulation] Failed to get personal baseline:', error);
    return null;
  }
}

/**
 * Assess current balance and generate regulation decision
 * Uses personalized baseline if available, otherwise falls back to global
 */
export function assessBalance(balance: HemisphereBalance, personalBaseline?: PersonalBaseline | null): RegulationDecision {
  const { rh_percent, lh_percent, int_percent, total_beads } = balance;

  // Determine which baseline to use
  const baseline = personalBaseline ? {
    rh_min: Math.max(10, personalBaseline.rh_target - 15), // Personal floor
    rh_target: personalBaseline.rh_target,
    lh_max: Math.min(90, personalBaseline.lh_target + 20), // Personal ceiling
    lh_target: personalBaseline.lh_target,
    int_min: Math.max(5, personalBaseline.int_target - 10),
    int_target: personalBaseline.int_target
  } : GLOBAL_BASELINE;

  const baselineType = personalBaseline
    ? `personalized (${personalBaseline.sample_size} beads, ${personalBaseline.learned_from_days} days)`
    : 'global';

  // Insufficient data - maintain current mode
  if (total_beads < 5) {
    return {
      action: 'maintain_balance',
      reason: 'Insufficient data for regulation (< 5 beads in window)',
      urgency: 'low',
      recommendations: ['Continue current work patterns', 'Emit more beads to establish baseline']
    };
  }

  // CRITICAL: RH collapse (meaning-field loss)
  if (rh_percent < baseline.rh_min) {
    return {
      action: 'increase_rh',
      reason: `RH critically low (${rh_percent.toFixed(1)}% < ${baseline.rh_min}%). Your typical RH: ${baseline.rh_target.toFixed(1)}%. Risk: Losing contextual awareness and meaning-field.`,
      urgency: 'high',
      recommendations: [
        `Reconnect with your Fire/Water elements (vision, emotion)`,
        'Schedule archetypal analysis session (Fire/D quadrant)',
        'Review user stories and emotional resonance (Water/C quadrant)',
        'Ask "Why are we building this?" before next task',
        `Baseline: ${baselineType}`
      ]
    };
  }

  // CRITICAL: LH domination (reductionism)
  if (lh_percent > baseline.lh_max) {
    return {
      action: 'increase_rh',
      reason: `LH critically high (${lh_percent.toFixed(1)}% > ${baseline.lh_max}%). Your typical LH: ${baseline.lh_target.toFixed(1)}%. Risk: Reductionism - optimizing metrics without understanding purpose.`,
      urgency: 'high',
      recommendations: [
        'STOP shipping features temporarily',
        'Conduct meaning-field review: What patterns are we missing?',
        'Review deferred work from past integrations',
        'Ask "What context have we lost?" before proceeding',
        `Baseline: ${baselineType}`
      ]
    };
  }

  // CRITICAL: Integration deficit
  if (int_percent < baseline.int_min) {
    return {
      action: 'increase_int',
      reason: `Integration critically low (${int_percent.toFixed(1)}% < ${baseline.int_min}%). Your typical INT: ${baseline.int_target.toFixed(1)}%. Risk: Decisions not being synthesized properly.`,
      urgency: 'high',
      recommendations: [
        'Review recent RH and LH beads without integration',
        'Explicitly run callosal integration on pending tensions',
        'Use maia-callosal-router skill to synthesize waiting observations',
        'Create INTEGRATOR beads for unresolved RH/LH pairs',
        `Baseline: ${baselineType}`
      ]
    };
  }

  // MODERATE: RH trending low (deviation from personal equilibrium)
  if (rh_percent < baseline.rh_target - 5) {
    return {
      action: 'increase_rh',
      reason: `RH below YOUR target (${rh_percent.toFixed(1)}% vs usual ${baseline.rh_target.toFixed(1)}%). Recommendation: Reconnect with opening/contextual work.`,
      urgency: 'medium',
      recommendations: [
        'Add RH observation bead before next task',
        'Review archetypal patterns in current work',
        'Consider broader context before deep focus',
        'Balance analytical work with meaning-making',
        `Baseline: ${baselineType}`
      ]
    };
  }

  // MODERATE: LH trending high (deviation from personal equilibrium)
  if (lh_percent > baseline.lh_target + 15) {
    return {
      action: 'increase_rh',
      reason: `LH elevated (${lh_percent.toFixed(1)}% vs usual ${baseline.lh_target.toFixed(1)}%). Recommendation: Balance with opening work.`,
      urgency: 'medium',
      recommendations: [
        'Schedule RH review session',
        'Ask "What patterns am I missing?" before next constraint',
        'Review emotional/archetypal dimensions of current work',
        'Consider deferring pure implementation tasks',
        `Baseline: ${baselineType}`
      ]
    };
  }

  // MODERATE: Integration trending low (deviation from personal equilibrium)
  if (int_percent < baseline.int_target - 5) {
    return {
      action: 'increase_int',
      reason: `Integration below YOUR target (${int_percent.toFixed(1)}% vs usual ${baseline.int_target.toFixed(1)}%). Recommendation: Synthesize pending observations.`,
      urgency: 'medium',
      recommendations: [
        'Review RH/LH beads waiting for integration',
        'Run explicit integration pass on recent work',
        'Use maia-callosal-router to synthesize tensions',
        'Create INTEGRATOR beads for significant decisions',
        `Baseline: ${baselineType}`
      ]
    };
  }

  // HEALTHY: Balance within acceptable range
  return {
    action: 'maintain_balance',
    reason: `Hemisphere balance healthy: RH ${rh_percent.toFixed(1)}%, LH ${lh_percent.toFixed(1)}%, INT ${int_percent.toFixed(1)}% (${baselineType})`,
    urgency: 'low',
    recommendations: [
      'Continue current work patterns',
      'Monitor for drift over next 24 hours',
      'Maintain rhythm of RH opening → LH constraint → INT synthesis',
      `Your equilibrium: RH ${baseline.rh_target.toFixed(1)}%, LH ${baseline.lh_target.toFixed(1)}%, INT ${baseline.int_target.toFixed(1)}%`
    ]
  };
}

/**
 * Generate a regulation_check bead based on current hemisphere balance
 * Optionally uses personalized baseline for the given user
 */
export async function generateRegulationBead(bdTask?: string, userId?: string): Promise<any> {
  const balance = await getHemisphereBalance(7, userId);
  const personalBaseline = userId ? await getPersonalBaseline(userId) : null;

  if (!balance) {
    return {
      timestamp: new Date().toISOString(),
      type: 'regulation_check',
      bd_task: bdTask || null,
      origin_mode: 'INTEGRATOR',
      herrmann_quadrant: 'A', // Regulation is analytical/meta
      spiralogic: {
        element: 'aether',
        facet: 'stillness', // Meta-awareness
        phase: 'yellow' // Second-tier awareness
      },
      regulation: {
        action: 'maintain_balance',
        reason: 'Insufficient data for regulation',
        urgency: 'low',
        current_balance: null,
        recommendations: ['Emit more beads to establish baseline'],
        baseline_type: 'none'
      },
      confidence: 0.5,
      user_id: userId || null
    };
  }

  const decision = assessBalance(balance, personalBaseline);

  return {
    timestamp: new Date().toISOString(),
    type: 'regulation_check',
    bd_task: bdTask || null,
    origin_mode: 'INTEGRATOR',
    herrmann_quadrant: 'A',
    spiralogic: {
      element: 'aether',
      facet: 'stillness', // Passive witnessing of patterns
      phase: 'yellow'
    },
    regulation: {
      action: decision.action,
      reason: decision.reason,
      urgency: decision.urgency,
      current_balance: {
        rh_percent: balance.rh_percent.toFixed(1),
        lh_percent: balance.lh_percent.toFixed(1),
        int_percent: balance.int_percent.toFixed(1),
        total_beads: balance.total_beads,
        window_days: balance.window_days
      },
      personal_baseline: personalBaseline ? {
        rh_target: personalBaseline.rh_target.toFixed(1),
        lh_target: personalBaseline.lh_target.toFixed(1),
        int_target: personalBaseline.int_target.toFixed(1),
        sample_size: personalBaseline.sample_size,
        learned_from_days: personalBaseline.learned_from_days
      } : null,
      baseline_type: personalBaseline ? 'personalized' : 'global',
      recommendations: decision.recommendations
    },
    confidence: personalBaseline ? 0.95 : 0.75, // Higher confidence with personal data
    user_id: userId || null
  };
}
