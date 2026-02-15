/**
 * Field Signal Emitter — The afferent nerve of MAIA's AIN collective field.
 *
 * Emits symbolic signal fingerprints (NEVER content) when meaningful
 * thresholds cross in a member session. Also provides trajectory
 * awareness for prompt shaping.
 *
 * Design principles:
 * 1. SANCTUARY ABSOLUTE: no signals from sanctuary sessions
 * 2. CONSENT is EMISSION gate, not read filter
 * 3. FIRE-AND-FORGET: never blocks oracle response
 * 4. NO CONTENT: only structural/symbolic metadata
 * 5. COHERENCE DELTA: turns snapshots into trajectory
 */

import { query } from '@/lib/db/postgres';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type SignalType =
  | 'breakthrough' | 'collapse' | 'integration' | 'boundary'
  | 'value_shift' | 'vow' | 'grief_wave' | 'shadow_contact'
  | 'return' | 'autonomy_claim';

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export type SpiralMotion = 'ascending' | 'stuck' | 'breakthrough';

export type ValueAxis =
  | 'freedom_belonging' | 'truth_harmony' | 'power_surrender'
  | 'structure_flow' | 'self_other' | 'known_unknown' | 'creation_destruction';

export type ConsentScope = 'private' | 'circle' | 'commons';

export type BreakthroughType =
  | 'shadow-integration' | 'vision-ignition' | 'emotional-release'
  | 'mental-clarity' | 'unity-experience';

export interface FieldSignal {
  memberId: string;
  sessionId?: string;
  signalType: SignalType;
  element: Element;
  phase: number;
  motion?: SpiralMotion | null;
  intensity: number;
  valueAxis?: ValueAxis | null;
  markers?: string[];
  consentScope?: ConsentScope;
  breakthroughType?: BreakthroughType | null;
  breakthroughDepth?: number | null;
  spiralLevel?: string | null;
  /** Deterministic idempotency key from cerebellum layer. If set, uses ON CONFLICT DO NOTHING. */
  idempotencyKey?: string | null;
}

export interface MemberTrajectory {
  signalCount: number;
  coherenceSlope: number;
  coherenceDirection: 'integrating' | 'stable' | 'fragmenting' | 'turbulent' | 'insufficient';
  dominantElement: Element | null;
  elementSequence: Element[];
  dominantSignalType: SignalType | null;
  activeValueAxis: ValueAxis | null;
  recurringPattern: string | null;
  volatility: number;
  lastSignalAt: Date | null;
  daysSinceLastSignal: number | null;
}

// ═══════════════════════════════════════════════════════════════
// Signal Emission
// ═══════════════════════════════════════════════════════════════

/**
 * Minimum intensity threshold for signal emission.
 * Very low-intensity events don't carry enough signal to be useful.
 */
const INTENSITY_THRESHOLD = 0.15;

function shouldEmit(signal: FieldSignal): boolean {
  if (signal.intensity < INTENSITY_THRESHOLD) return false;
  if (signal.phase < 1 || signal.phase > 12) return false;
  return true;
}

/**
 * Coherence delta scoring discipline.
 *
 * INVARIANT: Sign comes from signal_type ONLY.
 * Motion and intensity scale MAGNITUDE, never flip sign.
 * Element is territory, not goodness — it doesn't affect delta.
 */
function computeCoherenceDelta(signal: FieldSignal): number {
  const typeScores: Record<SignalType, number> = {
    breakthrough: 0.6,
    integration: 0.5,
    return: 0.3,
    vow: 0.3,
    autonomy_claim: 0.2,
    boundary: 0.2,
    shadow_contact: 0.1,
    value_shift: 0.0,
    grief_wave: -0.2,
    collapse: -0.5,
  };

  const baseDelta = typeScores[signal.signalType] ?? 0;
  const baseSign = Math.sign(baseDelta);
  if (baseDelta === 0) return 0;

  let magnitude = Math.abs(baseDelta);

  // Motion scales magnitude, never changes sign
  if (signal.motion === 'ascending') magnitude *= 1.15;
  else if (signal.motion === 'stuck') magnitude *= 1.2;
  else if (signal.motion === 'breakthrough') magnitude *= 1.3;

  // Intensity scales magnitude, never changes sign
  if (signal.intensity > 0.7) magnitude *= 1.15;
  else if (signal.intensity < 0.3) magnitude *= 0.85;

  // Breakthrough depth bonus (only for breakthrough signals)
  if (signal.signalType === 'breakthrough' && signal.breakthroughDepth && signal.breakthroughDepth > 0.7) {
    magnitude += 0.1;
  }

  const delta = baseSign * magnitude;
  return Math.max(-1, Math.min(1, Math.round(delta * 100) / 100));
}

/**
 * Emit a field signal. Fire-and-forget — returns void, never throws.
 *
 * SANCTUARY GATE: If isSanctuary is true, returns immediately.
 * No signal is emitted. No data is created.
 */
export function emitFieldSignal(signal: FieldSignal, isSanctuary: boolean = false): void {
  // SANCTUARY ABSOLUTE: no signals from sanctuary sessions
  if (isSanctuary) return;

  if (!shouldEmit(signal)) return;

  const coherenceDelta = computeCoherenceDelta(signal);
  const consentScope = signal.consentScope || 'private';
  const markers = (signal.markers || []).slice(0, 8);
  const idempotencyKey = signal.idempotencyKey || null;

  const sql = `
    INSERT INTO field_signals (
      member_id, session_id, signal_type,
      element, phase, motion, intensity,
      value_axis, markers, consent_scope,
      breakthrough_type, breakthrough_depth, spiral_level,
      coherence_delta, idempotency_key
    ) VALUES (
      $1, $2, $3,
      $4, $5, $6, $7,
      $8, $9, $10,
      $11, $12, $13,
      $14, $15
    )
    ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
  `;

  const params = [
    signal.memberId,
    signal.sessionId || null,
    signal.signalType,
    signal.element,
    signal.phase,
    signal.motion || null,
    signal.intensity,
    signal.valueAxis || null,
    markers,
    consentScope,
    signal.breakthroughType || null,
    signal.breakthroughDepth || null,
    signal.spiralLevel || null,
    coherenceDelta,
    idempotencyKey,
  ];

  // Fire-and-forget — no await, catch errors silently
  query(sql, params).then((result) => {
    // Telemetry: detect absorbed duplicates (ON CONFLICT DO NOTHING -> rowCount 0)
    if (idempotencyKey && result.rowCount === 0) {
      console.info('[field-signal] Idempotent retry absorbed:', {
        signalType: signal.signalType,
        idempotencyKey: idempotencyKey.slice(0, 12) + '...',
      });
    }
  }).catch((error) => {
    // Swallow — field signal emission should never break oracle response
    console.warn('[field-signal] Failed to emit signal:', {
      signalType: signal.signalType,
      element: signal.element,
      coherenceDelta,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// Signal Type Inference
// ═══════════════════════════════════════════════════════════════

/**
 * Infer the signal type from turn-level structural metadata.
 * Returns null if no signal should be emitted this turn.
 */
export function inferSignalType(params: {
  isBreakthrough: boolean;
  breakthroughDepth: number;
  motion?: string | null;
  intensity?: number | null;
  previousIntensity?: number | null;
  markers: string[];
}): SignalType | null {
  const { isBreakthrough, breakthroughDepth, motion, intensity, previousIntensity, markers } = params;

  // Breakthrough is the strongest signal
  if (isBreakthrough && breakthroughDepth > 0.3) return 'breakthrough';

  // Collapse: stuck + significant intensity drop
  if (motion === 'stuck' && intensity !== null && previousIntensity !== null
    && intensity !== undefined && previousIntensity !== undefined
    && previousIntensity - intensity > 0.3) {
    return 'collapse';
  }

  // Marker-based inference
  const markerStr = markers.join(' ').toLowerCase();
  if (markerStr.includes('boundary') || markerStr.includes('limit')) return 'boundary';
  if (markerStr.includes('shadow') || markerStr.includes('dark')) return 'shadow_contact';
  if (markerStr.includes('grief') || markerStr.includes('loss') || markerStr.includes('mourn')) return 'grief_wave';
  if (markerStr.includes('vow') || markerStr.includes('commit') || markerStr.includes('promise')) return 'vow';
  if (markerStr.includes('integrat') || markerStr.includes('synthes')) return 'integration';
  if (markerStr.includes('autonom') || markerStr.includes('independ') || markerStr.includes('self-relian')) return 'autonomy_claim';

  // High intensity ascending = integration signal
  if (motion === 'ascending' && intensity !== null && intensity !== undefined && intensity > 0.7) return 'integration';

  return null; // No signal this turn
}

/**
 * Infer value axis from element and markers.
 */
export function inferValueAxis(element: string, markers: string[]): ValueAxis | null {
  const markerStr = markers.join(' ').toLowerCase();

  // Marker-based inference (most specific)
  if (markerStr.includes('freedom') || markerStr.includes('belong')) return 'freedom_belonging';
  if (markerStr.includes('truth') || markerStr.includes('harmon')) return 'truth_harmony';
  if (markerStr.includes('power') || markerStr.includes('surrender')) return 'power_surrender';
  if (markerStr.includes('structure') || markerStr.includes('flow')) return 'structure_flow';
  if (markerStr.includes('self') || markerStr.includes('other') || markerStr.includes('service')) return 'self_other';
  if (markerStr.includes('unknown') || markerStr.includes('mystery') || markerStr.includes('certain')) return 'known_unknown';
  if (markerStr.includes('creat') || markerStr.includes('destruct') || markerStr.includes('releas')) return 'creation_destruction';

  // Element-based fallback (less specific)
  switch (element) {
    case 'fire': return 'power_surrender';
    case 'water': return 'known_unknown';
    case 'earth': return 'structure_flow';
    case 'air': return 'freedom_belonging';
    case 'aether': return 'self_other';
    default: return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Member Trajectory
// ═══════════════════════════════════════════════════════════════

/**
 * Load a member's trajectory from their signal history.
 * Graceful fallback: returns null if no signals or on error.
 *
 * Used at conversation start to give MAIA awareness of how
 * this person has been moving — not what they said, but how
 * the soul has been crossing thresholds.
 *
 * SANCTUARY GATE: If isSanctuary is true, returns null immediately.
 * Sanctuary sessions should not even read trajectory — the session
 * must behave as though it has no memory of movement.
 *
 * @param memberId - The member's UUID
 * @param windowDays - How far back to look (default 30)
 * @param limit - Max signals to consider (default 30)
 * @param isSanctuary - If true, returns null (no trajectory in sanctuary)
 */
export async function loadMemberTrajectory(
  memberId: string,
  windowDays: number = 30,
  limit: number = 30,
  isSanctuary: boolean = false,
): Promise<MemberTrajectory | null> {
  // SANCTUARY ABSOLUTE: no trajectory awareness in sanctuary sessions
  if (isSanctuary) return null;

  try {
    const result = await query(`
      SELECT
        signal_type, element, phase, motion, intensity,
        value_axis, coherence_delta, created_at
      FROM field_signals
      WHERE member_id = $1
        AND created_at > NOW() - ($2 || ' days')::interval
      ORDER BY created_at DESC
      LIMIT $3
    `, [memberId, String(windowDays), limit]);

    if (result.rows.length === 0) return null;

    const signals = result.rows;
    const deltas = signals
      .map((s: any) => parseFloat(s.coherence_delta))
      .filter((d: number) => !isNaN(d));

    // Coherence slope (linear regression on deltas, oldest to newest)
    const orderedDeltas = [...deltas].reverse(); // oldest first
    let slope = 0;
    if (orderedDeltas.length >= 3) {
      const n = orderedDeltas.length;
      const xMean = (n - 1) / 2;
      const yMean = orderedDeltas.reduce((a: number, b: number) => a + b, 0) / n;
      let numerator = 0;
      let denominator = 0;
      for (let i = 0; i < n; i++) {
        numerator += (i - xMean) * (orderedDeltas[i] - yMean);
        denominator += (i - xMean) * (i - xMean);
      }
      slope = denominator !== 0 ? numerator / denominator : 0;
    }

    // Average delta
    const avgDelta = deltas.length > 0
      ? deltas.reduce((a: number, b: number) => a + b, 0) / deltas.length
      : 0;

    // Volatility: standard deviation of coherence deltas
    let volatility = 0;
    if (deltas.length >= 3) {
      const mean = avgDelta;
      const sumSqDiff = deltas.reduce((acc: number, d: number) => acc + (d - mean) * (d - mean), 0);
      volatility = Math.sqrt(sumSqDiff / deltas.length);
    }

    // Coherence direction — requires slope AND average to agree
    let coherenceDirection: MemberTrajectory['coherenceDirection'] = 'insufficient';
    if (deltas.length >= 3) {
      if (volatility > 0.35) {
        coherenceDirection = 'turbulent'; // High variability overrides
      } else if (slope > 0.02 && avgDelta > 0.05) {
        coherenceDirection = 'integrating';
      } else if (slope < -0.02 && avgDelta < -0.05) {
        coherenceDirection = 'fragmenting';
      } else {
        coherenceDirection = 'stable';
      }
    }

    // Dominant element
    const elementCounts: Record<string, number> = {};
    const elementSequence: Element[] = [];
    for (const s of signals) {
      elementCounts[s.element] = (elementCounts[s.element] || 0) + 1;
      elementSequence.push(s.element as Element);
    }
    const dominantElement = Object.entries(elementCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as Element || null;

    // Dominant signal type
    const typeCounts: Record<string, number> = {};
    for (const s of signals) {
      typeCounts[s.signal_type] = (typeCounts[s.signal_type] || 0) + 1;
    }
    const dominantSignalType = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as SignalType || null;

    // Active value axis
    const axisCounts: Record<string, number> = {};
    for (const s of signals) {
      if (s.value_axis) {
        axisCounts[s.value_axis] = (axisCounts[s.value_axis] || 0) + 1;
      }
    }
    const activeValueAxis = Object.entries(axisCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as ValueAxis || null;

    // Recurring pattern: detect A->B->A element oscillation
    let recurringPattern: string | null = null;
    if (elementSequence.length >= 4) {
      const last4 = elementSequence.slice(0, 4);
      if (last4[0] === last4[2] && last4[1] === last4[3]) {
        recurringPattern = `${last4[0]}-${last4[1]} oscillation`;
      }
    }

    // Time since last signal
    const lastSignalAt = signals[0]?.created_at ? new Date(signals[0].created_at) : null;
    const daysSinceLastSignal = lastSignalAt
      ? Math.round((Date.now() - lastSignalAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      signalCount: signals.length,
      coherenceSlope: Math.round(slope * 1000) / 1000,
      coherenceDirection,
      dominantElement,
      elementSequence: elementSequence.slice(0, 8), // cap for prompt size
      dominantSignalType,
      activeValueAxis,
      recurringPattern,
      volatility: Math.round(volatility * 1000) / 1000,
      lastSignalAt,
      daysSinceLastSignal,
    };
  } catch (error) {
    // Graceful fallback — trajectory is nice-to-have, never required
    console.warn('[field-signal] Failed to load trajectory:', {
      memberId: memberId.slice(0, 8) + '...',
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Trajectory Prompt Formatting
// ═══════════════════════════════════════════════════════════════

/**
 * Format trajectory into a prompt section for MAIA.
 *
 * INVARIANTS (non-negotiable):
 * 1. Probabilistic language only ("appears," "suggests," "may indicate")
 * 2. HARD 600-char cap with sentence-boundary truncation
 * 3. Prefix: "Internal pacing context" — not directive, not diagnostic
 * 4. Volatility-aware: high variability triggers caution language
 * 5. Never mentions specific conversation content
 * 6. Returns null if trajectory is insufficient
 */
export function formatTrajectoryForPrompt(trajectory: MemberTrajectory | null): string | null {
  if (!trajectory) return null;
  if (trajectory.signalCount < 3) return null;

  const prefix = '[Internal pacing context (structural, non-content). These are pattern observations, not diagnoses. Use to calibrate pace and posture, not to direct content.]';

  const parts: string[] = [];

  // Coherence direction
  switch (trajectory.coherenceDirection) {
    case 'integrating':
      parts.push('Recent patterns suggest movement toward integration.');
      break;
    case 'fragmenting':
      parts.push('Recent patterns suggest some fragmentation or difficulty. Gentler pacing may be appropriate.');
      break;
    case 'turbulent':
      parts.push('Recent signal history appears highly variable. Avoid amplifying in either direction; hold steady ground.');
      break;
    case 'stable':
      parts.push('Recent trajectory appears relatively stable.');
      break;
    case 'insufficient':
      break; // Skip
  }

  // Dominant element
  if (trajectory.dominantElement) {
    parts.push(`The ${trajectory.dominantElement} element appears most present recently.`);
  }

  // Value axis
  if (trajectory.activeValueAxis) {
    const axisLabels: Record<ValueAxis, string> = {
      freedom_belonging: 'freedom and belonging',
      truth_harmony: 'truth and harmony',
      power_surrender: 'power and surrender',
      structure_flow: 'structure and flow',
      self_other: 'self-care and service',
      known_unknown: 'certainty and mystery',
      creation_destruction: 'creation and release',
    };
    parts.push(`The tension between ${axisLabels[trajectory.activeValueAxis]} may be alive.`);
  }

  // Recurring pattern
  if (trajectory.recurringPattern) {
    parts.push(`An oscillation pattern (${trajectory.recurringPattern}) appears in recent sessions.`);
  }

  // Absence signal
  if (trajectory.daysSinceLastSignal !== null && trajectory.daysSinceLastSignal > 7) {
    parts.push(`This person appears to be returning after ${trajectory.daysSinceLastSignal} days away.`);
  }

  // Volatility warning
  if (trajectory.volatility > 0.35 && trajectory.coherenceDirection !== 'turbulent') {
    parts.push('Signal variability is elevated; avoid strong interpretive framing.');
  }

  if (parts.length === 0) return null;

  let body = parts.join(' ');

  // HARD 600-char cap with sentence-boundary truncation
  if (body.length > 600) {
    const truncated = body.slice(0, 600);
    const lastPeriod = truncated.lastIndexOf('.');
    body = lastPeriod > 200 ? truncated.slice(0, lastPeriod + 1) : truncated + '...';
  }

  return `${prefix}\n\n${body}`;
}
