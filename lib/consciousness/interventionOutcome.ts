/**
 * Intervention Outcome Tracking — Transformation Loop Closure
 *
 * Three responsibilities:
 *   1. logIntervention()       — record what MAIA did (fire-and-forget)
 *   2. captureShift()          — compare previous state to current input, update outcome
 *   3. synthesizeLearning()    — compute member-specific "what seems to work"
 *
 * Philosophy: Same as spiral state persistence — fire-and-forget writes,
 * graceful fallback on read, never block oracle response.
 *
 * Table: member_intervention_outcomes (migration: 20260328000001_intervention_outcomes.sql)
 */

import { query } from '@/lib/db/postgres';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type InteractionContext = 'self' | 'relationship' | 'group' | 'practitioner_client' | 'unknown';
export type ToneProfile = 'grounded' | 'directive' | 'reflective' | 'ceremonial' | 'neutral';

export interface InterventionRecord {
  relational_stance: string;  // HOLD / MIRROR / CHALLENGE / RELEASE / SEASONAL_RETURN
  element: string;            // fire / water / earth / air / aether
  phase?: number;
  intensity?: number;
  interaction_context?: InteractionContext;
  tone_profile?: ToneProfile;
  conversation_depth?: number;
  trust_level?: number;
}

export type ShiftType = 'language' | 'emotional' | 'pattern' | 'none';
export type ShiftDirection = 'positive' | 'neutral' | 'negative';
export type AutonomySignal = 'naming_own_direction' | 'asking_system' | 'neither';

export interface ShiftObservation {
  shift_detected: boolean;
  shift_type: ShiftType;
  shift_direction: ShiftDirection;
  coherence_delta: number;          // -1.0 to +1.0
  repetition_flag: boolean;
  autonomy_signal: AutonomySignal;
}

export interface LearningHint {
  effective_stances: string[];       // stances that tend to produce positive shifts
  cautious_stances: string[];        // stances that tend not to help
  autonomy_trend: 'increasing' | 'stable' | 'decreasing' | 'unknown';
  repetition_rate: number;           // 0-1, how often same patterns repeat
  total_observations: number;
  hint_text: string | null;          // ready-to-inject prompt text (or null if insufficient data)
}

// ═══════════════════════════════════════════════════════════════
// 1. Log Intervention (fire-and-forget — called after oracle response)
// ═══════════════════════════════════════════════════════════════

/**
 * Fire-and-forget: log what MAIA did this turn.
 * Returns the intervention row ID so shift detection can update it on next turn.
 * Never blocks oracle response.
 */
export function logIntervention(
  memberId: string,
  sessionId: string,
  intervention: InterventionRecord,
): void {
  const sql = `
    INSERT INTO member_intervention_outcomes (
      member_id, session_id,
      relational_stance, element, phase, intensity,
      interaction_context, tone_profile,
      conversation_depth, trust_level
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;

  query(sql, [
    memberId,
    sessionId,
    intervention.relational_stance,
    intervention.element,
    intervention.phase ?? null,
    intervention.intensity ?? null,
    intervention.interaction_context ?? 'unknown',
    intervention.tone_profile ?? 'neutral',
    intervention.conversation_depth ?? null,
    intervention.trust_level ?? null,
  ]).catch((error) => {
    console.warn('[intervention-outcome] Failed to log intervention:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 2. Shift Detection (lightweight heuristic, not diagnostic)
// ═══════════════════════════════════════════════════════════════

const AUTONOMY_MARKERS = [
  'i think', 'i realize', 'i see now', 'i want to', 'i need to',
  'i decided', 'i choose', 'it feels like', 'what i notice is',
  'i can', 'i will', 'my sense is', 'i understand',
];

const DEPENDENCY_MARKERS = [
  'tell me what to do', 'what should i', 'decide for me',
  'you choose', 'i need you to', "i can't without",
  'fix this for me', 'just tell me',
];

const CLARITY_MARKERS = [
  'actually', 'now i see', 'that makes sense', 'oh',
  'yes', 'exactly', 'right', 'i get it', 'that clicks',
  'i hadn\'t thought of', 'interesting',
];

const STUCK_MARKERS = [
  'same thing again', 'nothing changes', 'still stuck',
  'keep going in circles', 'already tried', 'doesn\'t work',
  'i don\'t know', 'confused', 'lost',
];

/**
 * Detect shift between previous MAIA response and current user input.
 * Returns a lightweight observation — heuristic, not diagnostic.
 */
export function detectShift(
  currentMessage: string,
  previousMessage?: string,
): ShiftObservation {
  const lower = currentMessage.toLowerCase();
  const prevLower = (previousMessage ?? '').toLowerCase();

  // Autonomy signal
  const autonomyScore = AUTONOMY_MARKERS.filter(m => lower.includes(m)).length;
  const dependencyScore = DEPENDENCY_MARKERS.filter(m => lower.includes(m)).length;
  const autonomy_signal: AutonomySignal =
    autonomyScore > dependencyScore ? 'naming_own_direction' :
    dependencyScore > 0 ? 'asking_system' : 'neither';

  // Clarity / stuckness
  const clarityScore = CLARITY_MARKERS.filter(m => lower.includes(m)).length;
  const stuckScore = STUCK_MARKERS.filter(m => lower.includes(m)).length;

  // Repetition detection (same core words appearing)
  const repetition_flag = detectRepetition(lower, prevLower);

  // Determine shift
  const shift_detected = clarityScore > 0 || autonomyScore > 0 || stuckScore > 1;

  let shift_type: ShiftType = 'none';
  let shift_direction: ShiftDirection = 'neutral';
  let coherence_delta = 0;

  if (clarityScore > stuckScore) {
    shift_type = 'language';
    shift_direction = 'positive';
    coherence_delta = Math.min(clarityScore * 0.15, 0.6);
  } else if (stuckScore > clarityScore) {
    shift_type = 'pattern';
    shift_direction = 'negative';
    coherence_delta = Math.max(-stuckScore * 0.15, -0.6);
  }

  if (autonomyScore > dependencyScore) {
    shift_direction = 'positive';
    coherence_delta = Math.min(coherence_delta + 0.1, 1.0);
  } else if (dependencyScore > 0) {
    coherence_delta = Math.max(coherence_delta - 0.1, -1.0);
  }

  if (repetition_flag && shift_direction !== 'negative') {
    shift_direction = 'neutral';
    coherence_delta = Math.max(coherence_delta - 0.05, -1.0);
  }

  return {
    shift_detected,
    shift_type,
    shift_direction,
    coherence_delta: Math.round(coherence_delta * 1000) / 1000,
    repetition_flag,
    autonomy_signal,
  };
}

/**
 * Simple repetition check: do the previous and current messages
 * share a high proportion of meaningful words?
 */
function detectRepetition(current: string, previous: string): boolean {
  if (!previous) return false;
  const stopWords = new Set(['the', 'a', 'an', 'is', 'was', 'are', 'i', 'me', 'my', 'to', 'and', 'of', 'in', 'it', 'that', 'this', 'for', 'but', 'not', 'with']);
  const extract = (text: string) => text.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

  const currentWords = new Set(extract(current));
  const previousWords = extract(previous);

  if (previousWords.length < 3) return false;
  const overlap = previousWords.filter(w => currentWords.has(w)).length;
  return overlap / previousWords.length > 0.5;
}

// ═══════════════════════════════════════════════════════════════
// 3. Capture Shift (update most recent intervention with outcome)
// ═══════════════════════════════════════════════════════════════

/**
 * Fire-and-forget: update the most recent uncaptured intervention
 * for this member with the observed shift.
 */
export function captureShift(
  memberId: string,
  sessionId: string,
  shift: ShiftObservation,
): void {
  const sql = `
    UPDATE member_intervention_outcomes
    SET
      shift_detected = $3,
      shift_type = $4,
      shift_direction = $5,
      coherence_delta = $6,
      repetition_flag = $7,
      autonomy_signal = $8,
      outcome_captured_at = NOW()
    WHERE id = (
      SELECT id FROM member_intervention_outcomes
      WHERE member_id = $1
        AND session_id = $2
        AND outcome_captured_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    )
  `;

  query(sql, [
    memberId,
    sessionId,
    shift.shift_detected,
    shift.shift_type,
    shift.shift_direction,
    shift.coherence_delta,
    shift.repetition_flag,
    shift.autonomy_signal,
  ]).catch((error) => {
    console.warn('[intervention-outcome] Failed to capture shift:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 4. Synthesize Learning (read back into oracle)
// ═══════════════════════════════════════════════════════════════

const MIN_OBSERVATIONS = 5;   // need at least this many to synthesize
const LOOKBACK_DAYS = 60;     // don't use stale data

/**
 * Compute a member-specific learning hint from accumulated outcomes.
 * Returns null-safe hint with graceful degradation when data is sparse.
 *
 * This is the "what seems to work for this person" synthesis.
 */
export async function synthesizeLearning(memberId: string): Promise<LearningHint> {
  const empty: LearningHint = {
    effective_stances: [],
    cautious_stances: [],
    autonomy_trend: 'unknown',
    repetition_rate: 0,
    total_observations: 0,
    hint_text: null,
  };

  try {
    // Aggregate by stance: avg coherence_delta, shift rate
    const result = await query<{
      relational_stance: string;
      total: string;
      avg_delta: string;
      shift_rate: string;
      autonomy_rate: string;
      repetition_rate: string;
    }>(
      `SELECT
        relational_stance,
        COUNT(*)::text as total,
        COALESCE(AVG(coherence_delta), 0)::numeric(4,3)::text as avg_delta,
        (COUNT(*) FILTER (WHERE shift_detected = true))::numeric / NULLIF(COUNT(*), 0)::numeric as shift_rate,
        (COUNT(*) FILTER (WHERE autonomy_signal = 'naming_own_direction'))::numeric / NULLIF(COUNT(*), 0)::numeric as autonomy_rate,
        (COUNT(*) FILTER (WHERE repetition_flag = true))::numeric / NULLIF(COUNT(*), 0)::numeric as repetition_rate
      FROM member_intervention_outcomes
      WHERE member_id = $1
        AND outcome_captured_at IS NOT NULL
        AND created_at > NOW() - INTERVAL '${LOOKBACK_DAYS} days'
      GROUP BY relational_stance
      ORDER BY avg_delta DESC`,
      [memberId]
    );

    const totalObs = result.rows.reduce((sum, r) => sum + Number(r.total), 0);
    if (totalObs < MIN_OBSERVATIONS) {
      return { ...empty, total_observations: totalObs };
    }

    // Classify stances
    const effective: string[] = [];
    const cautious: string[] = [];
    let totalRepRate = 0;
    let totalAutonomyRate = 0;

    for (const row of result.rows) {
      const avgDelta = Number(row.avg_delta);
      const shiftRate = Number(row.shift_rate);
      const stance = row.relational_stance;

      if (avgDelta > 0.05 && shiftRate > 0.3) {
        effective.push(stance);
      } else if (avgDelta < -0.05 || shiftRate < 0.15) {
        cautious.push(stance);
      }

      totalRepRate += Number(row.repetition_rate) * Number(row.total);
      totalAutonomyRate += Number(row.autonomy_rate) * Number(row.total);
    }

    const avgRepRate = totalRepRate / totalObs;
    const avgAutonomyRate = totalAutonomyRate / totalObs;

    // Autonomy trend from recent vs older data
    const autonomy_trend = await computeAutonomyTrend(memberId);

    const hint: LearningHint = {
      effective_stances: effective,
      cautious_stances: cautious,
      autonomy_trend,
      repetition_rate: Math.round(avgRepRate * 100) / 100,
      total_observations: totalObs,
      hint_text: buildLearningHintText(effective, cautious, autonomy_trend, avgRepRate, avgAutonomyRate),
    };

    return hint;
  } catch (error) {
    console.warn('[intervention-outcome] Failed to synthesize learning:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return empty;
  }
}

// ═══════════════════════════════════════════════════════════════
// 5. Autonomy Trend (recent 15 vs older)
// ═══════════════════════════════════════════════════════════════

async function computeAutonomyTrend(memberId: string): Promise<LearningHint['autonomy_trend']> {
  try {
    const result = await query<{ bucket: string; autonomy_rate: string }>(
      `SELECT
        CASE WHEN created_at > NOW() - INTERVAL '14 days' THEN 'recent' ELSE 'older' END as bucket,
        (COUNT(*) FILTER (WHERE autonomy_signal = 'naming_own_direction'))::numeric / NULLIF(COUNT(*), 0)::numeric as autonomy_rate
      FROM member_intervention_outcomes
      WHERE member_id = $1
        AND outcome_captured_at IS NOT NULL
        AND created_at > NOW() - INTERVAL '${LOOKBACK_DAYS} days'
      GROUP BY bucket`,
      [memberId]
    );

    const recent = result.rows.find(r => r.bucket === 'recent');
    const older = result.rows.find(r => r.bucket === 'older');

    if (!recent || !older) return 'unknown';

    const recentRate = Number(recent.autonomy_rate);
    const olderRate = Number(older.autonomy_rate);
    const diff = recentRate - olderRate;

    if (diff > 0.1) return 'increasing';
    if (diff < -0.1) return 'decreasing';
    return 'stable';
  } catch {
    return 'unknown';
  }
}

// ═══════════════════════════════════════════════════════════════
// 6. Build Learning Hint Text (for prompt injection)
// ═══════════════════════════════════════════════════════════════

function buildLearningHintText(
  effective: string[],
  cautious: string[],
  autonomyTrend: LearningHint['autonomy_trend'],
  repetitionRate: number,
  autonomyRate: number,
): string | null {
  const lines: string[] = [];

  if (effective.length > 0) {
    const labels = effective.map(s => s.toLowerCase().replace(/_/g, ' ')).join(', ');
    lines.push(`This member tends to respond well to ${labels} approaches.`);
  }

  if (cautious.length > 0) {
    const labels = cautious.map(s => s.toLowerCase().replace(/_/g, ' ')).join(', ');
    lines.push(`${labels} approaches have not reliably produced movement for this member.`);
  }

  if (repetitionRate > 0.4) {
    lines.push(`Pattern repetition is high (${Math.round(repetitionRate * 100)}%). Consider a different angle or pacing.`);
  }

  if (autonomyTrend === 'increasing') {
    lines.push('Autonomy is increasing — hold lighter, give more space.');
  } else if (autonomyTrend === 'decreasing') {
    lines.push('Autonomy signals are decreasing. Prioritize returning power and agency to the member.');
  }

  if (autonomyRate > 0.6) {
    lines.push('This member frequently names their own direction. Keep responses spacious and brief.');
  }

  if (lines.length === 0) return null;

  return `[Transformation Learning — soft guidance only, do not impose]:\n${lines.join('\n')}`;
}
