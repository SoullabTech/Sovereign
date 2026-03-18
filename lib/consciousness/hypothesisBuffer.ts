/**
 * lib/consciousness/hypothesisBuffer.ts
 *
 * Persistence layer for the Accumulating Hypothesis Buffer.
 *
 * Responsibilities:
 *   - Write new normalized observations as hypothesis seeds or evidence additions
 *   - Read active hypotheses for gate evaluation
 *   - Update gate status and confidence after evaluation
 *   - Record contradiction events (never delete hypotheses)
 *   - Promote eligible hypotheses to the interpretive ledger
 *   - Mark expired / discarded hypotheses
 *
 * Design:
 *   - All writes are fire-and-forget (never block the oracle)
 *   - Reads gracefully fallback on error
 *   - original_language is written but never read back for routing
 *   - Evidence events are INSERT-only (no UPDATE path)
 *
 * Tables: accumulating_hypotheses, hypothesis_evidence_events,
 *         hypothesis_contradictions
 */

import { query } from '@/lib/db/postgres';
import type {
  AccumulatingHypothesis,
  ContradictionEvent,
  GateEvaluationResult,
  GateStatus,
  HypothesisEvidenceEvent,
  HypothesisStatus,
  NormalizedObservation,
  SpiralogicPhase,
  Element,
} from '@/lib/types/interpretive-ledger';

import {
  evaluateHypothesis,
  computeConfidence,
  DEFAULT_GATE_THRESHOLDS,
} from './gateEvaluator';

// ─── Default falsifiability anchors ──────────────────────────────────────────

/**
 * Canonical default contradiction and decay conditions per interpretation type.
 *
 * These are type-level minimums, not custom-crafted per observation.
 * The OS requires at least one anchor for every ledger entry, so these
 * ensure the structural_completeness gate passes for OS-native observations.
 * Model-proposed hypotheses may supply richer, observation-specific anchors.
 */
function getDefaultFalsifiabilityAnchors(type: string): {
  contradiction_conditions: string[];
  decay_conditions: string[];
} {
  switch (type) {
    case 'identity_arc':
      return {
        contradiction_conditions: [
          'Pattern consistently absent across 3 or more different contexts',
          'Member explicitly states this interpretation no longer applies to them',
        ],
        decay_conditions: [
          'Pattern unobserved across 5 or more consecutive sessions',
          'Developmental phase shifts by 4 or more positions from phase at creation',
        ],
      };
    case 'elemental':
      return {
        contradiction_conditions: [
          'Dominant element reading changes significantly across 2 or more consecutive turns',
          'Signal strength drops below detection threshold in 3 or more consecutive sessions',
        ],
        decay_conditions: [
          'Elemental reading not reinforced across 5 sessions',
          'Phase transition moves pattern into a different elemental domain',
        ],
      };
    case 'phase':
      return {
        contradiction_conditions: [
          'Phase score contradicts this reading in 2 or more independent sessions',
          'Member demonstrates capacities clearly inconsistent with assigned phase',
        ],
        decay_conditions: [
          'Phase reading changes significantly across 2 or more consecutive sessions',
          'Pattern was observed only at a prior developmental phase and not since',
        ],
      };
    case 'relational':
      return {
        contradiction_conditions: [
          'Member explicitly requests a different relational approach',
          'Communication preference contradicted across 2 or more sessions',
        ],
        decay_conditions: [
          'Relational pattern not reinforced across 5 consecutive sessions',
          'Member autonomy milestone significantly changes the relational context',
        ],
      };
    case 'style_calibration':
    default:
      return {
        contradiction_conditions: [
          'Member requests a different style or approach',
          'Style preference not observed across 3 or more sessions',
        ],
        decay_conditions: [
          'Style preference shifts across 3 or more consecutive sessions',
          'Pattern not observed in 5 or more consecutive sessions',
        ],
      };
  }
}

// ─── Seeding: create or extend hypothesis from a normalized observation ───────

/**
 * Given a normalized observation from the OS, either:
 *   (a) create a new accumulating hypothesis, or
 *   (b) add an evidence event to an existing matching hypothesis
 *
 * Fire-and-forget — never awaited in the oracle hot path.
 */
export function enqueueObservation(
  memberId: string,
  observation: NormalizedObservation,
  sessionId: string,
): void {
  _enqueueObservationAsync(memberId, observation, sessionId).catch(err =>
    console.error('[HypothesisBuffer] enqueueObservation failed (non-fatal):', err),
  );
}

async function _enqueueObservationAsync(
  memberId: string,
  observation: NormalizedObservation,
  sessionId: string,
): Promise<void> {
  // Try to find an existing accumulating hypothesis with the same
  // interpretation type and candidate (rough match by type + first 80 chars)
  const existing = await findMatchingHypothesis(
    memberId,
    observation.interpretation_type,
    observation.candidate_interpretation,
  );

  if (existing) {
    await addEvidenceEvent(existing.id, observation, sessionId);
    await refreshHypothesisCounters(existing.id);
  } else {
    await createHypothesis(memberId, observation, sessionId);
  }
}

// ─── Create new hypothesis ────────────────────────────────────────────────────

async function createHypothesis(
  memberId: string,
  observation: NormalizedObservation,
  sessionId: string,
): Promise<string> {
  const evWeight = observation.initial_evidence_event.evidence_weight;
  const sigStrength = observation.initial_evidence_event.signal_strength;
  const anchors = getDefaultFalsifiabilityAnchors(observation.interpretation_type);

  const result = await query<{ id: string }>(
    `INSERT INTO accumulating_hypotheses (
      member_id,
      phase_at_creation,
      element_at_creation,
      originating_agent,
      originating_model,
      original_language,
      observation_summary,
      candidate_interpretation,
      interpretation_type,
      target_store,
      recurrence_count,
      cross_context_count,
      context_types_seen,
      signal_confidence,
      structural_confidence,
      interpretive_confidence,
      composite_confidence,
      confidence_computed_at,
      contradiction_conditions,
      decay_conditions,
      routing_influence_weight
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      1, 0, $11,
      $12, 0, $13, $14, NOW(),
      $15, $16,
      0.05
    )
    RETURNING id`,
    [
      memberId,
      observation.initial_evidence_event.context_element === 'fire'   ? 1
        : observation.initial_evidence_event.context_element === 'water'  ? 2
        : observation.initial_evidence_event.context_element === 'earth'  ? 3
        : observation.initial_evidence_event.context_element === 'air'    ? 4
        : 5, // aether → phase 5 as a neutral default; caller should supply real phase
      observation.initial_evidence_event.context_element,
      observation.originating_agent,
      observation.originating_model,
      '', // original_language — caller may pass separately; archival only
      observation.observation_summary,
      observation.candidate_interpretation,
      observation.interpretation_type,
      observation.target_store,
      [observation.initial_evidence_event.context_domain + ':' +
       observation.initial_evidence_event.context_element],
      sigStrength * evWeight,       // signal_confidence seed
      evWeight,                     // interpretive_confidence seed
      (sigStrength * evWeight * 0.30 + evWeight * 0.25), // composite seed (no structural yet)
      anchors.contradiction_conditions,
      anchors.decay_conditions,
    ],
  );

  const hypothesisId = result.rows[0].id;

  // Write the initial evidence event
  await _insertEvidenceEvent(hypothesisId, observation, sessionId);

  return hypothesisId;
}

// ─── Add evidence to existing hypothesis ─────────────────────────────────────

async function addEvidenceEvent(
  hypothesisId: string,
  observation: NormalizedObservation,
  sessionId: string,
): Promise<void> {
  await _insertEvidenceEvent(hypothesisId, observation, sessionId);
}

async function _insertEvidenceEvent(
  hypothesisId: string,
  observation: NormalizedObservation,
  sessionId: string,
): Promise<void> {
  const ev = observation.initial_evidence_event;
  await query(
    `INSERT INTO hypothesis_evidence_events (
      hypothesis_id, session_id, observation,
      context_domain, context_element, context_mode,
      evidence_type, evidence_weight, signal_strength
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      hypothesisId,
      sessionId,
      ev.observation,
      ev.context_domain,
      ev.context_element,
      ev.context_mode,
      ev.evidence_type,
      ev.evidence_weight,
      ev.signal_strength,
    ],
  );
}

// ─── Refresh counters after new evidence ─────────────────────────────────────

/**
 * Recount recurrence, cross-context, and recompute confidence
 * from the full evidence + contradiction set.
 * Called after each new evidence event is written.
 */
async function refreshHypothesisCounters(hypothesisId: string): Promise<void> {
  // Count distinct sessions (recurrence) and context types
  const countsResult = await query<{
    recurrence_count: string;
    context_types: string[];
  }>(
    `SELECT
      COUNT(DISTINCT session_id)::text AS recurrence_count,
      array_agg(DISTINCT context_domain || ':' || context_element) AS context_types
    FROM hypothesis_evidence_events
    WHERE hypothesis_id = $1`,
    [hypothesisId],
  );

  const { recurrence_count: recStr, context_types } = countsResult.rows[0];
  const recurrence_count = parseInt(recStr, 10);
  const context_types_seen = context_types ?? [];
  const cross_context_count = context_types_seen.length;

  // Load full evidence + contradictions to recompute confidence
  const [evResult, conResult] = await Promise.all([
    query<{
      signal_strength: number;
      evidence_weight: number;
      evidence_type: string;
    }>(
      `SELECT signal_strength, evidence_weight, evidence_type
       FROM hypothesis_evidence_events WHERE hypothesis_id = $1`,
      [hypothesisId],
    ),
    query<{ contradiction_weight: number }>(
      `SELECT contradiction_weight
       FROM hypothesis_contradictions WHERE hypothesis_id = $1`,
      [hypothesisId],
    ),
  ]);

  const evidenceRows = evResult.rows.map(r => ({
    signal_strength: Number(r.signal_strength),
    evidence_weight: Number(r.evidence_weight),
  }));

  const contradictionRows = conResult.rows.map(r => ({
    contradiction_weight: Number(r.contradiction_weight),
  }));

  // Simple confidence recompute inline (mirrors gateEvaluator logic)
  const totalWeight = evidenceRows.reduce((s, e) => s + e.evidence_weight, 0);
  const weightedSignal = evidenceRows.reduce(
    (s, e) => s + e.signal_strength * e.evidence_weight, 0
  );
  const signal_confidence = totalWeight > 0 ? weightedSignal / totalWeight : 0;

  const contextRatio = Math.min(1, cross_context_count / Math.max(1, DEFAULT_GATE_THRESHOLDS.min_cross_context));
  const totalConPenalty = contradictionRows.reduce((s, c) => s + c.contradiction_weight, 0);
  const conPenalty = Math.min(0.80, totalConPenalty * 0.4);
  const structural_confidence = Math.max(0, contextRatio - conPenalty);

  const interpretive_confidence = totalWeight / Math.max(1, evidenceRows.length);
  const composite_confidence =
    signal_confidence * 0.30 +
    structural_confidence * 0.45 +
    interpretive_confidence * 0.25;

  await query(
    `UPDATE accumulating_hypotheses SET
      recurrence_count        = $2,
      cross_context_count     = $3,
      context_types_seen      = $4,
      signal_confidence       = $5,
      structural_confidence   = $6,
      interpretive_confidence = $7,
      composite_confidence    = $8,
      confidence_computed_at  = NOW()
    WHERE id = $1`,
    [
      hypothesisId,
      recurrence_count,
      cross_context_count,
      context_types_seen,
      parseFloat(signal_confidence.toFixed(3)),
      parseFloat(structural_confidence.toFixed(3)),
      parseFloat(interpretive_confidence.toFixed(3)),
      parseFloat(composite_confidence.toFixed(3)),
    ],
  );
}

// ─── Contradiction recording ──────────────────────────────────────────────────

/**
 * Record a contradiction event against an active hypothesis.
 * Does NOT delete the hypothesis — reduces structural_confidence.
 * Fire-and-forget.
 */
export function enqueueContradiction(
  hypothesisId: string,
  event: Omit<ContradictionEvent, 'id' | 'hypothesis_id'>,
): void {
  _enqueueContradictionAsync(hypothesisId, event).catch(err =>
    console.error('[HypothesisBuffer] enqueueContradiction failed (non-fatal):', err),
  );
}

async function _enqueueContradictionAsync(
  hypothesisId: string,
  event: Omit<ContradictionEvent, 'id' | 'hypothesis_id'>,
): Promise<void> {
  await query(
    `INSERT INTO hypothesis_contradictions (
      hypothesis_id, session_id, observation,
      context_domain, context_element,
      source, contradiction_weight, user_initiated
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      hypothesisId,
      event.session_id,
      event.observation,
      event.context_domain,
      event.context_element,
      event.source,
      event.contradiction_weight,
      event.user_initiated,
    ],
  );

  // Refresh confidence to reflect the new contradiction
  await refreshHypothesisCounters(hypothesisId);
}

// ─── Gate status update ───────────────────────────────────────────────────────

/**
 * Persist gate evaluation results back to the hypothesis row.
 * Called after evaluateHypothesis() runs in the background.
 */
export async function persistGateResult(
  hypothesisId: string,
  result: GateEvaluationResult,
): Promise<void> {
  const { gate_status: g, confidence: c } = result;

  let newStatus: HypothesisStatus = 'accumulating';
  if (result.expiry_recommended || result.recommendation === 'discard') {
    newStatus = result.expiry_recommended ? 'expired' : 'discarded';
  } else if (result.promotion_worthy) {
    newStatus = 'worthy';
  } else if (result.promotion_eligible) {
    newStatus = 'eligible';
  }

  await query(
    `UPDATE accumulating_hypotheses SET
      gate_recurrence          = $2,
      gate_cross_context       = $3,
      gate_developmental_rel   = $4,
      gate_structural_complete = $5,
      gate_store_routing       = $6,
      gate_confidence_floor    = $7,
      gate_evaluated_at        = NOW(),
      signal_confidence        = $8,
      structural_confidence    = $9,
      interpretive_confidence  = $10,
      composite_confidence     = $11,
      confidence_computed_at   = NOW(),
      status                   = $12
    WHERE id = $1`,
    [
      hypothesisId,
      g.recurrence,
      g.cross_context,
      g.developmental_relevance,
      g.structural_completeness,
      g.store_routing,
      g.confidence_floor,
      parseFloat(c.signal_confidence.toFixed(3)),
      parseFloat(c.structural_confidence.toFixed(3)),
      parseFloat(c.interpretive_confidence.toFixed(3)),
      parseFloat(c.composite.toFixed(3)),
      newStatus,
    ],
  );
}

// ─── Reads ────────────────────────────────────────────────────────────────────

/**
 * Load active hypotheses for a member (for gate evaluation pass).
 * Returns only those in 'accumulating' | 'eligible' | 'worthy' states.
 * Excludes promoted / discarded / expired.
 */
export async function loadActiveHypotheses(
  memberId: string,
): Promise<AccumulatingHypothesis[]> {
  try {
    const result = await query<Record<string, unknown>>(
      `SELECT h.*,
        COALESCE(e.events, '[]') AS evidence_events,
        COALESCE(c.contradictions, '[]') AS contradicting_evidence
      FROM accumulating_hypotheses h
      LEFT JOIN LATERAL (
        SELECT json_agg(ev ORDER BY ev.created_at) AS events
        FROM hypothesis_evidence_events ev
        WHERE ev.hypothesis_id = h.id
      ) e ON true
      LEFT JOIN LATERAL (
        SELECT json_agg(co ORDER BY co.created_at) AS contradictions
        FROM hypothesis_contradictions co
        WHERE co.hypothesis_id = h.id
      ) c ON true
      WHERE h.member_id = $1
        AND h.status IN ('accumulating', 'eligible', 'worthy')
      ORDER BY h.last_updated DESC`,
      [memberId],
    );

    return result.rows.map(rowToHypothesis);
  } catch (err) {
    console.error('[HypothesisBuffer] loadActiveHypotheses failed (returning []):', err);
    return [];
  }
}

/**
 * Find a hypothesis whose interpretation type and candidate closely match.
 * Used to decide whether to extend an existing hypothesis or create a new one.
 */
async function findMatchingHypothesis(
  memberId: string,
  interpretationType: string,
  candidateInterpretation: string,
): Promise<{ id: string } | null> {
  try {
    // Match on type + first 60 characters of candidate (rough dedup)
    const prefix = candidateInterpretation.slice(0, 60);
    const result = await query<{ id: string }>(
      `SELECT id FROM accumulating_hypotheses
       WHERE member_id = $1
         AND interpretation_type = $2
         AND candidate_interpretation ILIKE $3
         AND status IN ('accumulating', 'eligible', 'worthy')
       ORDER BY last_updated DESC
       LIMIT 1`,
      [memberId, interpretationType, `${prefix}%`],
    );

    return result.rows[0] ?? null;
  } catch {
    return null;
  }
}

// ─── Row mapping ──────────────────────────────────────────────────────────────

function rowToHypothesis(row: Record<string, unknown>): AccumulatingHypothesis {
  return {
    id:                       row.id as string,
    member_id:                row.member_id as string,
    created_at:               new Date(row.created_at as string),
    last_updated:             new Date(row.last_updated as string),
    phase_at_creation:        Number(row.phase_at_creation) as SpiralogicPhase,
    element_at_creation:      row.element_at_creation as Element,
    originating_agent:        row.originating_agent as string,
    originating_model:        row.originating_model as string,
    original_language:        row.original_language as string,
    observation_summary:      row.observation_summary as string,
    candidate_interpretation: row.candidate_interpretation as string,
    interpretation_type:      row.interpretation_type as AccumulatingHypothesis['interpretation_type'],
    target_store:             row.target_store as AccumulatingHypothesis['target_store'],
    evidence_events:          (row.evidence_events as HypothesisEvidenceEvent[]) ?? [],
    contradicting_evidence:   (row.contradicting_evidence as ContradictionEvent[]) ?? [],
    recurrence_count:         Number(row.recurrence_count),
    context_types_seen:       (row.context_types_seen as string[]) ?? [],
    cross_context_count:      Number(row.cross_context_count),
    confidence: {
      signal_confidence:       Number(row.signal_confidence),
      structural_confidence:   Number(row.structural_confidence),
      interpretive_confidence: Number(row.interpretive_confidence),
      composite:               Number(row.composite_confidence),
      computed_at:             new Date(row.confidence_computed_at as string),
    },
    gate_status: {
      recurrence:              row.gate_recurrence as GateStatus['recurrence'],
      cross_context:           row.gate_cross_context as GateStatus['cross_context'],
      developmental_relevance: row.gate_developmental_rel as GateStatus['developmental_relevance'],
      structural_completeness: row.gate_structural_complete as GateStatus['structural_completeness'],
      store_routing:           row.gate_store_routing as GateStatus['store_routing'],
      confidence_floor:        row.gate_confidence_floor as GateStatus['confidence_floor'],
      evaluated_at:            row.gate_evaluated_at
        ? new Date(row.gate_evaluated_at as string)
        : new Date(0),
    },
    contradiction_conditions:  (row.contradiction_conditions as string[]) ?? [],
    decay_conditions:          (row.decay_conditions as string[]) ?? [],
    status:                    row.status as HypothesisStatus,
    parent_hypothesis_id:      (row.parent_hypothesis_id as string) ?? null,
    routing_influence_weight:  Number(row.routing_influence_weight),
    surfacing_eligible:        false, // always false in buffer
  };
}
