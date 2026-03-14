// @ts-nocheck
// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { makeCanonHeaders } from '@/lib/sovereign/http/canonHeaders';
import { loadLedgerForMember, loadCalibrationProfile } from '@/lib/consciousness/interpretiveLedger';
import { loadActiveHypotheses } from '@/lib/consciousness/hypothesisBuffer';
import type {
  InterpretiveLedgerEntry,
  AccumulatingHypothesis,
} from '@/lib/types/interpretive-ledger';

/**
 * GET /api/members/ledger
 *
 * Sovereignty invariant proof: the member can see what the Cognitive OS
 * is holding about them — both promoted ledger entries and the accumulating
 * hypothesis buffer — before any member-facing UI exists.
 *
 * This endpoint is the inspectability guarantee. Anything that influences
 * MAIA's behaviour toward a member must be visible here on request.
 *
 * Auth:  Session cookie (getCurrentSession) — server determines identity.
 * Scope: Authenticated member's own data only.
 *
 * Query params:
 *   include_inactive=true  — include expired/superseded ledger entries
 *   include_buffer=false   — omit the pre-ledger hypothesis buffer
 */
export async function GET(request: NextRequest) {
  const correlationId = crypto.randomUUID();

  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await getCurrentSession();
  if (!session?.memberId) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in to view your interpretive ledger.' },
      { status: 401, headers: makeCanonHeaders(correlationId) },
    );
  }
  const memberId = session.memberId;

  // ── Query params ──────────────────────────────────────────────────────────
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get('include_inactive') === 'true';
  const includeBuffer   = searchParams.get('include_buffer')   !== 'false'; // default true

  // ── Load all Cognitive OS state in parallel ───────────────────────────────
  const [ledgerEntries, bufferHypotheses, calibration] = await Promise.all([
    loadLedgerForMember({
      member_id:       memberId,
      include_inactive: includeInactive,
      limit:           100,
    }),
    includeBuffer ? loadActiveHypotheses(memberId) : Promise.resolve([] as AccumulatingHypothesis[]),
    loadCalibrationProfile(memberId),
  ]);

  // ── Shape ledger response ─────────────────────────────────────────────────
  const ledger = ledgerEntries.map(shapeEntry);
  const buffer = bufferHypotheses.map(shapeHypothesis);

  // ── Summary ───────────────────────────────────────────────────────────────
  const promotedDates = ledgerEntries
    .filter(e => e.status === 'active')
    .map(e => e.promoted_at)
    .sort();

  const summary = {
    total_ledger_entries:  ledger.length,
    active_ledger_entries: ledger.filter(e => e.status === 'active').length,
    total_buffer_hypotheses: buffer.length,
    oldest_ledger_entry: promotedDates[0] ?? null,
    newest_ledger_entry: promotedDates[promotedDates.length - 1] ?? null,
    calibration_keys:    Object.keys(calibration).length,
  };

  return NextResponse.json(
    {
      // What the OS has promoted into durable interpretive memory
      ledger,
      // What the OS is still watching (accumulating, not yet promoted)
      buffer,
      // How the OS has calibrated its communication style
      calibration,
      // Overview
      summary,
      // Transparency metadata
      _meta: {
        correlationId,
        sovereignty_note:
          'This is everything the Cognitive OS holds about you. ' +
          'Buffer entries are under observation — they require recurrence across multiple ' +
          'contexts before promotion. Ledger entries are durable interpretations ' +
          'that currently influence how MAIA engages with you.',
        include_inactive: includeInactive,
        include_buffer:   includeBuffer,
      },
    },
    { status: 200, headers: makeCanonHeaders(correlationId) },
  );
}

// ─── Shape helpers ─────────────────────────────────────────────────────────
// These produce clean, member-legible JSON. Internal field names
// (composite_confidence, gate_status internals) are omitted or renamed
// to language that doesn't require technical knowledge to read.

function shapeEntry(e: InterpretiveLedgerEntry) {
  return {
    id:                  e.id,
    type:                e.interpretation_type,
    interpretation:      e.interpretation,
    observation_summary: e.observation_summary,
    status:              e.status,
    confidence: {
      signal:       round(e.confidence?.signal_confidence),
      structural:   round(e.confidence?.structural_confidence),
      interpretive: round(e.confidence?.interpretive_confidence),
      composite:    round(e.confidence?.composite),
    },
    routing_weight:      round(e.routing_influence_weight),
    surfacing_status:    e.surfacing_status,
    // Falsifiability — what would weaken or invalidate this interpretation
    contradiction_conditions: e.falsifiability?.contradiction_conditions ?? [],
    decay_conditions:         e.falsifiability?.decay_conditions         ?? [],
    // Developmental context
    phase_at_creation:   e.phase_at_creation,
    element_at_creation: e.element_at_creation,
    // Lineage
    parent_ledger_entry_id: e.parent_ledger_entry_id ?? null,
    promoted_from_hypothesis_id: e.promoted_from_hypothesis_id,
    // Timestamps
    promoted_at:  e.promoted_at,
    last_updated: e.last_updated,
    // Member annotations (what you've said about this interpretation)
    annotations: (e.member_annotations ?? []).map(a => ({
      type:    a.annotation_type,
      content: a.annotation,
      at:      a.created_at,
    })),
  };
}

function shapeHypothesis(h: AccumulatingHypothesis) {
  const evidence_count       = h.evidence_events?.length        ?? 0;
  const contradiction_count  = h.contradicting_evidence?.length ?? 0;

  return {
    id:                    h.id,
    type:                  h.interpretation_type,
    candidate:             h.candidate_interpretation,
    observation_summary:   h.observation_summary,
    status:                h.status,
    // Progress toward promotion
    recurrence_count:      h.recurrence_count,
    cross_context_count:   h.cross_context_count,
    contexts_seen:         h.context_types_seen,
    evidence_count,
    contradiction_count,
    confidence: {
      signal:       round(h.confidence?.signal_confidence),
      structural:   round(h.confidence?.structural_confidence),
      interpretive: round(h.confidence?.interpretive_confidence),
      composite:    round(h.confidence?.composite),
    },
    routing_weight:         round(h.routing_influence_weight),
    // What would weaken this
    contradiction_conditions: h.contradiction_conditions,
    decay_conditions:         h.decay_conditions,
    // Developmental context
    phase_at_creation:   h.phase_at_creation,
    element_at_creation: h.element_at_creation,
    // Timestamps
    created_at:   h.created_at,
    last_updated: h.last_updated,
    // Note to member about what "buffer" means
    _note: evidence_count === 1
      ? 'Single observation — watching for recurrence before drawing any conclusions.'
      : `${evidence_count} observations so far. Requires consistent pattern across multiple contexts before becoming a durable interpretation.`,
  };
}

function round(n: number | undefined | null): number | null {
  if (n == null || isNaN(n)) return null;
  return Math.round(n * 1000) / 1000;
}
