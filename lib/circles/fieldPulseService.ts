/**
 * Field Pulse Service — circle field state from circle-native activity
 *
 * SOVEREIGNTY CORRECTION (2026-07-17, Kelly ruling R5/R12):
 * System-inferred member themes (member_theme_signals) are SUSPENDED from the
 * field pulse. Inferred material may support private tentative reflection, but
 * it may not enter a shared field without explicit member ratification and
 * collective eligibility. The pulse now derives only from circle-native,
 * already-governed inputs: inquiries and shared activity.
 * Do not reintroduce member_theme_signals here without a ratified collective
 * eligibility pathway. See:
 * docs/architecture/CIRCLES_FIELD_PULSE_CONTAINMENT_PLAN_2026-07-17.md
 */

import { queryOne } from '@/lib/db/postgres';
import type { CircleState, FieldSignal, FieldPhase } from './types';

// ── Full Pulse (for circle detail page) ──────────────────────

export async function getCirclePulse(
  circleId: string,
  _windowDays = 14
): Promise<CircleState> {
  // 1. Theme signals: intentionally empty — inferred-theme aggregation removed
  //    (see sovereignty correction note above).
  const signals: FieldSignal[] = [];

  // 2. Check for active inquiry
  const activeInquiry = await queryOne<{
    id: string;
    question: string;
  }>(
    `SELECT id, question
     FROM circle_inquiries
     WHERE circle_id = $1 AND status = 'open'
     LIMIT 1`,
    [circleId]
  );

  // 3. Last movement — MAX across all circle activity
  const movementResult = await queryOne<{ last_at: string | null }>(
    `SELECT GREATEST(
       (SELECT MAX(created_at) FROM shared_artifacts WHERE circle_id = $1 AND revoked_at IS NULL),
       (SELECT MAX(opened_at) FROM circle_inquiries WHERE circle_id = $1),
       (SELECT MAX(cir.created_at) FROM circle_inquiry_responses cir
        JOIN circle_inquiries ci ON ci.id = cir.inquiry_id
        WHERE ci.circle_id = $1)
     ) AS last_at`,
    [circleId]
  );

  const lastMovementAt = movementResult?.last_at ?? null;
  const hasActiveInquiry = !!activeInquiry;

  // 4. Derive phase
  const phase = derivePhase(hasActiveInquiry, signals.length > 0, !!lastMovementAt);

  return {
    phase,
    signals,
    hasActiveInquiry,
    activeInquiryId: activeInquiry?.id,
    activeInquiryQuestion: activeInquiry?.question,
    lastMovementAt,
  };
}

// ── Light Pulse (for list page cards) ────────────────────────

export async function getCirclePulseLight(
  circleId: string
): Promise<{ phase: FieldPhase; lastMovementAt: string | null; hasActiveInquiry: boolean }> {
  const [inquiryResult, movementResult] = await Promise.all([
    queryOne<{ id: string }>(
      `SELECT id FROM circle_inquiries WHERE circle_id = $1 AND status = 'open' LIMIT 1`,
      [circleId]
    ),
    queryOne<{ last_at: string | null }>(
      `SELECT GREATEST(
         (SELECT MAX(created_at) FROM shared_artifacts WHERE circle_id = $1 AND revoked_at IS NULL),
         (SELECT MAX(opened_at) FROM circle_inquiries WHERE circle_id = $1),
         (SELECT MAX(cir.created_at) FROM circle_inquiry_responses cir
          JOIN circle_inquiries ci ON ci.id = cir.inquiry_id
          WHERE ci.circle_id = $1)
       ) AS last_at`,
      [circleId]
    ),
  ]);

  const hasActiveInquiry = !!inquiryResult;
  const lastMovementAt = movementResult?.last_at ?? null;

  // Light pulse doesn't check theme signals — too expensive for N circles
  const phase = derivePhase(hasActiveInquiry, false, !!lastMovementAt);

  return { phase, lastMovementAt, hasActiveInquiry };
}

// ── Phase Heuristic ──────────────────────────────────────────

function derivePhase(
  hasActiveInquiry: boolean,
  hasSignals: boolean,
  hasActivity: boolean
): FieldPhase {
  if (hasActiveInquiry) return 'active';
  if (hasSignals) return 'integrating';
  if (hasActivity) return 'forming';
  return 'quiet';
}
