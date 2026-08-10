/**
 * lib/consciousness/interpretiveLedger.ts
 *
 * Persistence layer for the Interpretive Ledger.
 *
 * Responsibilities:
 *   - Promote a hypothesis to the ledger (write the durable entry)
 *   - Read ledger entries for routing (lean view) and member inspection (full view)
 *   - Apply decay: reduce routing_influence_weight over developmental time
 *   - Record member annotations (contest, clarify, confirm, clear_influence)
 *   - Handle surfacing status transitions (declined → held_lightly, etc.)
 *   - Write relational calibration signals
 *
 * Design:
 *   - Promotion is a deliberate write (not fire-and-forget) — it marks a gate passage
 *   - Reads always fallback gracefully on error
 *   - Decay is applied in a background pass (sweeper), not blocking reads
 *   - Member annotations do NOT overwrite system observations
 *   - clear_influence reduces routing_influence_weight but preserves evidence
 *
 * Tables: interpretive_ledger, ledger_member_annotations, relational_calibration
 */

import { query } from '@/lib/db/postgres';
import type {
  AccumulatingHypothesis,
  AnnotationType,
  InterpretiveLedgerEntry,
  LedgerEntryStatus,
  LedgerReadOptions,
  LedgerRoutingView,
  LedgerSurfacingStatus,
  MemberAnnotation,
  SpiralogicPhase,
  Element,
} from '@/lib/types/interpretive-ledger';

// ─── Promotion ────────────────────────────────────────────────────────────────

/**
 * Promote an accumulating hypothesis to the interpretive ledger.
 *
 * GATE 1 (founder ruling 2026-08-09, F4/F7): promotion is now an OFFERING,
 * not an acquisition of authority. The entry is written with
 * routing_influence_weight = 0 and no authority_source — it exists, is
 * inspectable by the member, and influences nothing. Recurrence may establish
 * evidence; ONLY a member act (confirm / qualify — see addMemberAnnotation)
 * may confer routing authority. The DB constraint
 * ledger_authority_requires_member_act enforces this below application code.
 * The former weight-0.70-on-promotion rule is constitutionally rejected —
 * DO NOT RESURRECT.
 *
 * Marks the source hypothesis as 'promoted' and writes the ledger entry.
 * If parent_ledger_entry_id is provided, marks that parent as 'superseded'.
 *
 * Returns the new ledger entry ID.
 */
export async function promoteToLedger(
  hypothesis: AccumulatingHypothesis,
  options: {
    evidenceSummary: string;
    contradictionConditions?: string[];
    decayConditions?: string[];
    parentLedgerEntryId?: string | null;
  },
): Promise<string> {
  const {
    evidenceSummary,
    contradictionConditions = hypothesis.contradiction_conditions,
    decayConditions = hypothesis.decay_conditions,
    parentLedgerEntryId = null,
  } = options;

  // Guard: must have at least one falsifiability anchor
  if (contradictionConditions.length === 0) {
    throw new Error(
      `[InterpretiveLedger] Cannot promote hypothesis ${hypothesis.id}: ` +
      `no contradiction_conditions provided. All ledger entries must be falsifiable.`,
    );
  }

  // Write the ledger entry
  const insertResult = await query<{ id: string }>(
    `INSERT INTO interpretive_ledger (
      member_id,
      promoted_from_hypothesis_id,
      phase_at_creation,
      element_at_creation,
      observation_summary,
      interpretation,
      interpretation_type,
      evidence_summary,
      evidence_event_count,
      cross_context_count,
      signal_confidence,
      structural_confidence,
      interpretive_confidence,
      composite_confidence,
      confidence_computed_at,
      routing_influence_weight,
      surfacing_status,
      inactivity_sessions,
      phase_proximity_weight,
      last_decay_applied,
      contradiction_conditions,
      decay_conditions,
      min_contradiction_weight,
      status,
      parent_ledger_entry_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, NOW(),
      0, 'eligible', 5, 0.15, NOW(),
      $15, $16, 0.55,
      'active', $17
    )
    RETURNING id`,
    [
      hypothesis.member_id,
      hypothesis.id,
      hypothesis.phase_at_creation,
      hypothesis.element_at_creation,
      hypothesis.observation_summary,
      hypothesis.candidate_interpretation,
      hypothesis.interpretation_type,
      evidenceSummary,
      hypothesis.evidence_events.length,
      hypothesis.cross_context_count,
      parseFloat(hypothesis.confidence.signal_confidence.toFixed(3)),
      parseFloat(hypothesis.confidence.structural_confidence.toFixed(3)),
      parseFloat(hypothesis.confidence.interpretive_confidence.toFixed(3)),
      parseFloat(hypothesis.confidence.composite.toFixed(3)),
      contradictionConditions,
      decayConditions,
      parentLedgerEntryId,
    ],
  );

  const newEntryId = insertResult.rows[0].id;

  // Mark parent ledger entry as superseded (if lineage provided)
  if (parentLedgerEntryId) {
    await query(
      `UPDATE interpretive_ledger SET status = 'superseded' WHERE id = $1`,
      [parentLedgerEntryId],
    );
  }

  // Mark source hypothesis as promoted
  await query(
    `UPDATE accumulating_hypotheses SET status = 'promoted' WHERE id = $1`,
    [hypothesis.id],
  );

  console.log(
    `[InterpretiveLedger] Promoted hypothesis ${hypothesis.id} → ledger entry ${newEntryId}`,
  );

  return newEntryId;
}

// ─── Reads ────────────────────────────────────────────────────────────────────

/**
 * Lean routing view — what the conductor and oracle need at conversation start.
 * Returns only active entries above a minimum influence weight.
 * Graceful fallback to [] on error.
 *
 * GATE 1 constitutional boundary (F7): `authority_source IS NOT NULL` — an
 * entry with no member act NEVER reaches routing or a prompt, regardless of
 * evidence volume, confidence, or weight. This one predicate is the line
 * recurrence cannot cross.
 */
export async function loadLedgerForRouting(
  memberId: string,
  minWeight: number = 0.15,
): Promise<LedgerRoutingView[]> {
  try {
    const result = await query<LedgerRoutingView>(
      `SELECT
        id AS entry_id,
        interpretation,
        interpretation_type,
        routing_influence_weight,
        surfacing_status,
        phase_at_creation,
        element_at_creation,
        composite_confidence AS confidence_composite
      FROM interpretive_ledger
      WHERE member_id = $1
        AND status = 'active'
        AND authority_source IS NOT NULL
        AND routing_influence_weight >= $2
      ORDER BY routing_influence_weight DESC
      LIMIT 20`,
      [memberId, minWeight],
    );

    return result.rows;
  } catch (err) {
    console.error('[InterpretiveLedger] loadLedgerForRouting failed (returning []):', err);
    return [];
  }
}

/**
 * Full ledger read — for member inspection and the "what are you holding?" path.
 * Includes annotations and complete metadata.
 */
export async function loadLedgerForMember(
  options: LedgerReadOptions,
): Promise<InterpretiveLedgerEntry[]> {
  try {
    const conditions: string[] = ['l.member_id = $1'];
    const params: unknown[]    = [options.member_id];
    let paramIdx = 2;

    if (!options.include_inactive) {
      conditions.push(`l.status = 'active'`);
    }
    if (options.interpretation_type) {
      conditions.push(`l.interpretation_type = $${paramIdx++}`);
      params.push(options.interpretation_type);
    }
    if (options.min_routing_weight !== undefined) {
      conditions.push(`l.routing_influence_weight >= $${paramIdx++}`);
      params.push(options.min_routing_weight);
    }

    const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
    const whereClause = conditions.join(' AND ');

    const result = await query<Record<string, unknown>>(
      `SELECT
        l.*,
        COALESCE(a.annotations, '[]') AS member_annotations
      FROM interpretive_ledger l
      LEFT JOIN LATERAL (
        SELECT json_agg(ann ORDER BY ann.created_at) AS annotations
        FROM ledger_member_annotations ann
        WHERE ann.ledger_entry_id = l.id
      ) a ON true
      WHERE ${whereClause}
      ORDER BY l.routing_influence_weight DESC, l.promoted_at DESC
      ${limitClause}`,
      params,
    );

    return result.rows.map(rowToLedgerEntry);
  } catch (err) {
    console.error('[InterpretiveLedger] loadLedgerForMember failed (returning []):', err);
    return [];
  }
}

/**
 * Summary of active interpretations for the worthiness check in gate evaluation.
 * Returns just the interpretation strings (not full entries).
 */
export async function loadLedgerSummaries(memberId: string): Promise<string[]> {
  try {
    const result = await query<{ interpretation: string }>(
      `SELECT interpretation FROM interpretive_ledger
       WHERE member_id = $1 AND status = 'active'`,
      [memberId],
    );
    return result.rows.map(r => r.interpretation);
  } catch {
    return [];
  }
}

// ─── Surfacing status transitions ─────────────────────────────────────────────

/**
 * Record that an interpretation was offered to the member.
 * Transitions surfacing_status from 'eligible' → 'timing_gated' pending response.
 */
export async function markOffered(entryId: string): Promise<void> {
  await query(
    `UPDATE interpretive_ledger SET surfacing_status = 'timing_gated' WHERE id = $1`,
    [entryId],
  ).catch(err =>
    console.error('[InterpretiveLedger] markOffered failed (non-fatal):', err),
  );
}

/**
 * Record that the member declined an offered interpretation.
 * Transitions to 'declined' → 'held_lightly'.
 * Reduces routing_influence_weight but does NOT delete evidence.
 *
 * Key invariant: rejection cannot become evidence FOR the interpretation.
 * The decline is recorded as a relational signal (framing didn't land),
 * not as substantive evidence about the person.
 */
export async function markDeclined(entryId: string): Promise<void> {
  // GATE 1: weight arithmetic must respect ledger_authority_requires_member_act —
  // an entry with no member-granted authority stays at exactly 0.
  await query(
    `UPDATE interpretive_ledger SET
      surfacing_status         = 'held_lightly',
      routing_influence_weight = CASE
        WHEN authority_source IS NULL THEN 0
        ELSE GREATEST(0.05, routing_influence_weight * 0.30)
      END
    WHERE id = $1`,
    [entryId],
  ).catch(err =>
    console.error('[InterpretiveLedger] markDeclined failed (non-fatal):', err),
  );
}

/**
 * Record that the member resonated with an interpretation.
 *
 * GATE 1 (F3/F4): resonance is relational feedback, NOT confirmation.
 * It adjusts evidence-side confidence and keeps the entry offerable — it does
 * NOT touch routing_influence_weight and does NOT grant authority. The formal
 * authority-conferring act is 'confirm' (grantMemberAuthority below).
 */
export async function markAccepted(entryId: string): Promise<void> {
  await query(
    `UPDATE interpretive_ledger SET
      structural_confidence    = LEAST(1.0, structural_confidence + 0.10),
      composite_confidence     = LEAST(1.0, composite_confidence   + 0.07),
      surfacing_status         = 'eligible'
    WHERE id = $1`,
    [entryId],
  ).catch(err =>
    console.error('[InterpretiveLedger] markAccepted failed (non-fatal):', err),
  );
}

/**
 * GATE 1 — the member act that confers routing authority (F1/F7).
 *
 * confirm  → authority_source 'member_confirmed', weight 0.70
 * qualify  → authority_source 'member_qualified', weight 0.70 — the member's
 *            qualifying words (the annotation text) are the governing text;
 *            the system's original interpretation remains preserved unchanged.
 *
 * This is the ONLY path by which a ledger entry acquires routing weight.
 * Silence never reaches here; recurrence never reaches here (F4).
 */
export async function grantMemberAuthority(
  entryId: string,
  memberId: string,
  kind: 'member_confirmed' | 'member_qualified',
): Promise<void> {
  await query(
    `UPDATE interpretive_ledger SET
      authority_source         = $2,
      authority_granted_at     = NOW(),
      routing_influence_weight = 0.70,
      surfacing_status         = 'eligible'
    WHERE id = $1 AND member_id = $3`,
    [entryId, kind, memberId],
  ).catch(err =>
    console.error('[InterpretiveLedger] grantMemberAuthority failed (non-fatal):', err),
  );
}

// ─── Member annotations ───────────────────────────────────────────────────────

/**
 * Write a member annotation against a ledger entry and apply its side effects.
 *
 * The annotation layers alongside the system observation — neither overwrites.
 * The member is meeting the material consciously, not editing the system's record.
 *
 * Side effects by annotation type:
 *   resonates          → increases routing_influence_weight, keeps surfacing eligible
 *   does_not_resonate  → reduces routing_influence_weight, moves to held_lightly
 *   not_now            → sets timing_gated (no epistemic impact, no influence change)
 *   add_context        → pure annotation, no ledger row mutation
 *   clear_influence    → sets routing_influence_weight to near-zero, cleared_by_member
 *
 * Key invariant: a decline (does_not_resonate) is NOT treated as evidence FOR the
 * interpretation. It records that this framing didn't land — a relational signal,
 * not a substantive observation about the person.
 */
export async function addMemberAnnotation(
  ledgerEntryId: string,
  memberId: string,
  annotation: string,
  annotationType: AnnotationType,
): Promise<void> {
  // Write the annotation record (always — this is the member's voice)
  await query(
    `INSERT INTO ledger_member_annotations (ledger_entry_id, member_id, annotation, annotation_type)
     VALUES ($1, $2, $3, $4)`,
    [ledgerEntryId, memberId, annotation, annotationType],
  );

  // Apply action-specific side effects
  switch (annotationType) {
    case 'resonates':
      // Positive recognition: increase routing influence slightly, keep surfacing eligible.
      // Does not promote the entry or change evidence — it confirms the framing landed.
      await markAccepted(ledgerEntryId);
      break;

    case 'does_not_resonate':
      // Framing didn't land: reduce influence, move to held_lightly.
      // Evidence is preserved — decline is NOT counted as evidence for the interpretation.
      await markDeclined(ledgerEntryId);
      break;

    case 'not_now':
      // Timing feedback only: suppress near-term surfacing without any epistemic weight.
      // routing_influence_weight is NOT changed. The interpretation remains intact.
      await query(
        `UPDATE interpretive_ledger SET surfacing_status = 'timing_gated'
         WHERE id = $1 AND surfacing_status = 'eligible'`,
        [ledgerEntryId],
      ).catch(err =>
        console.error('[InterpretiveLedger] not_now surfacing_status update failed (non-fatal):', err),
      );
      break;

    case 'clear_influence':
      // Member removes active routing influence (F2-analog for interpretations:
      // authority is withdrawn; evidence remains intact — a sovereignty action,
      // not a data deletion). GATE 1: authority_source is stripped and weight
      // goes to exactly 0, per ledger_authority_requires_member_act.
      await query(
        `UPDATE interpretive_ledger SET
          authority_source         = NULL,
          routing_influence_weight = 0,
          surfacing_status         = 'cleared_by_member'
         WHERE id = $1`,
        [ledgerEntryId],
      ).catch(err =>
        console.error('[InterpretiveLedger] clear_influence update failed (non-fatal):', err),
      );
      break;

    case 'confirm':
      // GATE 1 (F1): "yes, that's true of me" — the member act that confers
      // routing authority. The interpretation may now inform MAIA as a
      // member-confirmed understanding, with provenance and date.
      await grantMemberAuthority(ledgerEntryId, memberId, 'member_confirmed');
      break;

    case 'qualify':
      // GATE 1 (F1/F3): "partly — but it's more like…" — authority is granted
      // to the member's OWN qualifying words (the annotation), which become the
      // governing text. The system's original interpretation is preserved
      // unchanged and MAIA's later restatements of the qualification acquire
      // nothing beyond what the member actually said.
      await grantMemberAuthority(ledgerEntryId, memberId, 'member_qualified');
      break;

    case 'add_context':
      // Pure member extension — no side effect on the ledger row.
      // The annotation record itself is the entire action.
      break;
  }
}

// ─── Decay sweep ──────────────────────────────────────────────────────────────

/**
 * Apply developmental decay to active ledger entries for a member.
 *
 * Called by the sweeper cron — not in the oracle hot path.
 *
 * Decay factors:
 *   1. Inactivity: entries with no session activity in N sessions
 *   2. Phase distance: each full Spiralogic phase elapsed reduces weight
 *
 * Entries whose routing_influence_weight drops below 0.05 are marked 'expired'.
 */
export async function applyDecay(
  memberId: string,
  currentPhase: SpiralogicPhase,
  sessionsSinceActive: Record<string, number>, // entryId → sessions since last evidence
): Promise<void> {
  const entries = await query<{ id: string; phase_at_creation: number; routing_influence_weight: number }>(
    `SELECT id, phase_at_creation, routing_influence_weight
     FROM interpretive_ledger
     WHERE member_id = $1 AND status = 'active'`,
    [memberId],
  );

  for (const entry of entries.rows) {
    const phaseDelta = Math.abs(currentPhase - entry.phase_at_creation);
    const wrappedDelta = Math.min(phaseDelta, 12 - phaseDelta);
    const inactiveSessions = sessionsSinceActive[entry.id] ?? 0;

    // Phase decay: 15% per full phase elapsed (configurable via phase_proximity_weight)
    const phaseDecayFactor = Math.max(0, 1 - wrappedDelta * 0.15);
    // Inactivity decay: 10% per session past the threshold
    const inactivityDecayFactor = inactiveSessions > 5
      ? Math.max(0, 1 - (inactiveSessions - 5) * 0.10)
      : 1;

    const newWeight = parseFloat(
      (entry.routing_influence_weight * phaseDecayFactor * inactivityDecayFactor).toFixed(3),
    );
    const newStatus: LedgerEntryStatus = newWeight < 0.05 ? 'expired' : 'active';

    await query(
      `UPDATE interpretive_ledger SET
        routing_influence_weight = $2,
        last_decay_applied       = NOW(),
        status                   = $3
       WHERE id = $1`,
      [entry.id, newWeight, newStatus],
    );
  }
}

// ─── Relational calibration ───────────────────────────────────────────────────

/**
 * Upsert a relational calibration signal.
 * Lighter gate: one clear signal is sufficient.
 * Members can also write directly (member_editable = true).
 */
export function upsertCalibration(
  memberId: string,
  preferenceKey: string,
  preferenceValue: string,
  source: 'interaction' | 'explicit' = 'interaction',
): void {
  _upsertCalibrationAsync(memberId, preferenceKey, preferenceValue, source).catch(err =>
    console.error('[InterpretiveLedger] upsertCalibration failed (non-fatal):', err),
  );
}

async function _upsertCalibrationAsync(
  memberId: string,
  preferenceKey: string,
  preferenceValue: string,
  source: 'interaction' | 'explicit',
): Promise<void> {
  const confidenceDelta = source === 'explicit' ? 0.30 : 0.10;
  await query(
    `INSERT INTO relational_calibration (member_id, preference_key, preference_value, confidence, source)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (member_id, preference_key)
     DO UPDATE SET
       preference_value = EXCLUDED.preference_value,
       confidence       = LEAST(1.0, relational_calibration.confidence + $4),
       source           = EXCLUDED.source,
       session_count    = relational_calibration.session_count + 1`,
    [memberId, preferenceKey, preferenceValue, confidenceDelta, source],
  );
}

/**
 * Load calibration profile for a member.
 * Returns key-value map of preferences above confidence floor.
 */
export async function loadCalibrationProfile(
  memberId: string,
  minConfidence: number = 0.30,
): Promise<Record<string, string>> {
  try {
    const result = await query<{ preference_key: string; preference_value: string }>(
      `SELECT preference_key, preference_value
       FROM relational_calibration
       WHERE member_id = $1 AND confidence >= $2`,
      [memberId, minConfidence],
    );

    return Object.fromEntries(result.rows.map(r => [r.preference_key, r.preference_value]));
  } catch {
    return {};
  }
}

// ─── Row mapping ──────────────────────────────────────────────────────────────

function rowToLedgerEntry(row: Record<string, unknown>): InterpretiveLedgerEntry {
  return {
    id:                           row.id as string,
    member_id:                    row.member_id as string,
    promoted_from_hypothesis_id:  row.promoted_from_hypothesis_id as string,
    created_at:                   new Date(row.created_at as string),
    promoted_at:                  new Date(row.promoted_at as string),
    last_updated:                 new Date(row.last_updated as string),
    phase_at_creation:            Number(row.phase_at_creation) as SpiralogicPhase,
    element_at_creation:          row.element_at_creation as Element,
    observation_summary:          row.observation_summary as string,
    interpretation:               row.interpretation as string,
    interpretation_type:          row.interpretation_type as InterpretiveLedgerEntry['interpretation_type'],
    evidence_summary:             row.evidence_summary as string,
    evidence_event_count:         Number(row.evidence_event_count),
    cross_context_count:          Number(row.cross_context_count),
    confidence: {
      signal_confidence:          Number(row.signal_confidence),
      structural_confidence:      Number(row.structural_confidence),
      interpretive_confidence:    Number(row.interpretive_confidence),
      composite:                  Number(row.composite_confidence),
      computed_at:                new Date(row.confidence_computed_at as string),
    },
    routing_influence_weight:     Number(row.routing_influence_weight),
    surfacing_status:             row.surfacing_status as LedgerSurfacingStatus,
    decay_schedule: {
      inactivity_sessions:        Number(row.inactivity_sessions),
      phase_proximity_weight:     Number(row.phase_proximity_weight),
      current_routing_weight:     Number(row.routing_influence_weight),
      last_decay_applied:         new Date(row.last_decay_applied as string),
    },
    falsifiability: {
      contradiction_conditions:           (row.contradiction_conditions as string[]) ?? [],
      decay_conditions:                   (row.decay_conditions as string[]) ?? [],
      minimum_contradiction_weight_to_weaken: Number(row.min_contradiction_weight),
    },
    member_annotations:           (row.member_annotations as MemberAnnotation[]) ?? [],
    parent_ledger_entry_id:       (row.parent_ledger_entry_id as string) ?? null,
    status:                       row.status as LedgerEntryStatus,
  };
}
