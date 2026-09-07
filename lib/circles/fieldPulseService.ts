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
 * eligibility pathway.
 *
 * ⚠️ PROVENANCE (B-04, resolved 2026-09-07): this header previously cited
 * `docs/architecture/CIRCLES_FIELD_PULSE_CONTAINMENT_PLAN_2026-07-17.md`. That
 * document does not exist and is not recoverable on any ref — including the
 * branch the 2026-08-01 preservation audit claims it is stranded on. THE RULING
 * IS INTACT; only its plan document is missing. The surviving authoritative
 * evidence is this comment plus the runtime behavior below, which the Circle
 * verifier proves on every run (assertion C4). See:
 * docs/architecture/CIRCLES_FIELD_PULSE_CONTAINMENT_PROVENANCE_2026-09-07.md
 */

import { query, queryOne } from '@/lib/db/postgres';
import { getCircleWithMembership } from './circleService';
import type { CircleState, FieldSignal, FieldPhase } from './types';

/**
 * MEMBERSHIP BOUNDARY (CIRCLE-04 · P4, B-08)
 *
 * These functions previously took a Circle id alone and trusted their callers.
 * Both callers were in fact correctly scoped — the detail route checked
 * membership, the summary route derived ids from listMyCircles() — but the
 * SERVICE CONTRACT permitted an unscoped call, and every sibling service in
 * lib/circles self-gates. That asymmetry was latent boundary debt: the next
 * caller inherits no protection from the signature.
 *
 * The boundary now lives in the contract. No exported function here surfaces
 * Circle-native activity without member identity.
 *
 * ⛔ No RLS (project invariant — plain self-hosted Postgres). ⛔ Existing route
 * gates are unchanged; this is defence in depth beneath them, not instead.
 *
 * The summary path deliberately does NOT loop getCircleWithMembership() per
 * Circle. Authorization is expressed IN the query — it reads through the
 * member's own active memberships — so there is nothing to bypass and no N+1.
 */

// ── Full Pulse (for circle detail page) ──────────────────────

export async function getCirclePulse(
  circleId: string,
  memberId: string,
  _windowDays = 14
): Promise<CircleState> {
  // Self-gating. Throws FORBIDDEN unless the caller holds an active membership.
  await getCircleWithMembership(circleId, memberId);

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
        WHERE ci.circle_id = $1 AND cir.withdrawn_at IS NULL)
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

// ── Summary pulse, member-scoped (for the list page) ─────────

export interface CirclePulseSummary {
  phase: FieldPhase;
  lastMovementAt: string | null;
  hasActiveInquiry: boolean;
}

/**
 * Pulse summaries for every Circle this member actively belongs to.
 *
 * One query, scoped through `circle_memberships`. A Circle the member does not
 * actively belong to cannot appear in the result, because it is never selected
 * — the authorization IS the join, not a check layered over one. That removes
 * the N+1 and the possibility of a bypass in the same move.
 *
 * Replaces the former per-Circle `getCirclePulseLight()`, which took a bare
 * Circle id and left scoping to whoever called it.
 */
export async function getCirclePulseSummariesForMember(
  memberId: string
): Promise<Record<string, CirclePulseSummary>> {
  const result = await query<{
    circle_id: string;
    has_active_inquiry: boolean;
    last_at: string | null;
  }>(
    `SELECT
       cm.circle_id,
       EXISTS (
         SELECT 1 FROM circle_inquiries ci
         WHERE ci.circle_id = cm.circle_id AND ci.status = 'open'
       ) AS has_active_inquiry,
       GREATEST(
         (SELECT MAX(sa.created_at) FROM shared_artifacts sa
          WHERE sa.circle_id = cm.circle_id AND sa.revoked_at IS NULL),
         (SELECT MAX(ci.opened_at) FROM circle_inquiries ci
          WHERE ci.circle_id = cm.circle_id),
         (SELECT MAX(cir.created_at) FROM circle_inquiry_responses cir
          JOIN circle_inquiries ci ON ci.id = cir.inquiry_id
          WHERE ci.circle_id = cm.circle_id AND cir.withdrawn_at IS NULL)
       ) AS last_at
     FROM circle_memberships cm
     WHERE cm.member_id = $1 AND cm.status = 'active'`,
    [memberId]
  );

  const summaries: Record<string, CirclePulseSummary> = {};
  for (const row of result.rows) {
    summaries[row.circle_id] = {
      // Signals stay false for the same reason they are empty above: the
      // 2026-07-17 correction severed inferred material from the shared field.
      phase: derivePhase(row.has_active_inquiry, false, !!row.last_at),
      lastMovementAt: row.last_at,
      hasActiveInquiry: row.has_active_inquiry,
    };
  }
  return summaries;
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
