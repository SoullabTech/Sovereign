export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { patternRecencyWeight } from '@/lib/patterns/patternRecencyWeight';
import {
  PATTERN_LEDGER_PRACTITIONER_READ_CONTAINED,
  PATTERN_LEDGER_CONTAINMENT,
} from '@/lib/studio/containment/inferenceContainment';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const identity = await getCurrentPractitioner(req);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: clientId } = await params;
  if (!clientId) {
    return NextResponse.json({ error: 'Missing client id' }, { status: 400 });
  }

  // ── CONTAINED (Practitioner Inference Containment, 2026-08-06) ───────────
  // pattern_ledger holds system-INFERRED claims about the member, including
  // status='emerging' rows the member has never been offered. Surfacing them
  // here puts the practitioner upstream of the member's own recognition.
  //
  // Fail closed BEFORE the read: no query runs, no scores are computed, and the
  // data is left intact for investigation and for the coming authority ruling.
  // ⛔ Do not re-open by filtering statuses or hiding scores — the claim itself
  //    is what may not cross. Only a member-declared crossing re-opens this.
  if (PATTERN_LEDGER_PRACTITIONER_READ_CONTAINED) {
    return NextResponse.json({ patterns: [], containment: PATTERN_LEDGER_CONTAINMENT });
  }

  try {
    const result = await db.query(
      `SELECT
         COALESCE(pattern_key, 'unknown')   AS pattern_key,
         COALESCE(statement, 'Pattern')     AS pattern_label,
         COALESCE(pattern_type, 'pattern')  AS pattern_type,
         recurrence_count,
         first_seen_at,
         last_evidence_at                   AS last_seen_at,
         latest_significance, average_significance, max_significance,
         trigger_contexts, evidence_refs,
         status
       FROM pattern_ledger
       WHERE member_id = $1
         AND status IN ('emerging', 'offered', 'confirmed', 'partial', 'active')
       ORDER BY last_evidence_at DESC
       LIMIT 50`,
      [clientId]
    );

    const rows = result.rows.map(row => {
      const recency = patternRecencyWeight(row.last_seen_at);
      const avgSig = parseFloat(row.average_significance);
      const maxSig = parseFloat(row.max_significance);
      const count = row.recurrence_count as number;
      const weightedScore =
        avgSig * 0.4 +
        maxSig * 0.2 +
        Math.log(count + 1) * 0.25 +
        recency * 0.15;

      const triggerContexts: string[] = Array.isArray(row.trigger_contexts)
        ? row.trigger_contexts
        : (row.trigger_contexts ?? []);

      const evidenceRefs: object[] = Array.isArray(row.evidence_refs)
        ? row.evidence_refs
        : (row.evidence_refs ?? []);

      return {
        patternKey: row.pattern_key,
        patternLabel: row.pattern_label,
        patternType: row.pattern_type,
        recurrenceCount: count,
        firstSeenAt: row.first_seen_at,
        lastSeenAt: row.last_seen_at,
        latestSignificance: parseFloat(row.latest_significance),
        averageSignificance: avgSig,
        maxSignificance: maxSig,
        triggerContexts,
        evidenceCount: evidenceRefs.length,
        status: row.status,
        weightedScore: parseFloat(weightedScore.toFixed(4)),
      };
    });

    // Sort by weighted score descending
    rows.sort((a, b) => b.weightedScore - a.weightedScore);

    return NextResponse.json({ patterns: rows });
  } catch (err) {
    console.error('[PatternLedger API] Error:', err);
    return NextResponse.json({ error: 'Failed to load pattern ledger' }, { status: 500 });
  }
}
