export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import db from '@/lib/db/postgres';
import {
  rowToNode,
  nodeProvenanceStats,
  caseTransitionAnalytics,
  repairPriority,
  IntegritySummary,
  CaseIntegrityEntry,
} from '@/lib/consciousness/elementNodeGenerator';

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, clean: 2 };

/**
 * GET /api/studio/element-nodes/integrity
 *
 * Admin repair queue — returns a provenance-aware integrity summary across all
 * cases in this practitioner's caseload, sorted by repair urgency.
 *
 * Response shape:
 *
 *   cases[]             Per-case integrity entries, sorted high → medium → clean
 *     .caseId           Case UUID
 *     .totalNodes       Total nodes in the case
 *     .provenance       Full coercion breakdown (NodeProvenanceStats)
 *     .repairPriority   'high' | 'medium' | 'clean'
 *
 *   totals
 *     .totalCases               All cases with at least one node
 *     .casesNeedingAttention    Cases with high or medium priority
 *     .totalLegacyNodes         Across all cases
 *     .totalCanonicalNodes      Across all cases
 *
 * Repair priority rules (matches NodeProvenanceStats segmentation):
 *   high    coercedFromEmptyOrNull > 0 OR coercedFromInvalidString > 0
 *   medium  coercedFromAetherSingleton > 0
 *   clean   legacyCoerced === 0
 */
export async function GET(request: NextRequest) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Load all nodes across all practitioner cases in one query
  const result = await db.query(
    `SELECT n.*
     FROM case_element_nodes n
     JOIN practitioner_cases pc ON pc.id = n.case_id
     WHERE pc.practitioner_id = $1
     ORDER BY n.case_id, n.confirmed_by_practitioner DESC, n.confidence DESC NULLS LAST, n.created_at ASC`,
    [identity.practitionerId],
  );

  // Group rows by case_id
  const byCase = new Map<string, typeof result.rows>();
  for (const row of result.rows) {
    const caseId = row.case_id as string;
    const existing = byCase.get(caseId) ?? [];
    existing.push(row);
    byCase.set(caseId, existing);
  }

  // Build per-case integrity entries
  const entries: CaseIntegrityEntry[] = [];
  for (const [caseId, rows] of byCase) {
    const nodes = rows.map(rowToNode);
    const provenance = nodeProvenanceStats(nodes);
    const transitions = caseTransitionAnalytics(nodes);
    entries.push({
      caseId,
      totalNodes: nodes.length,
      provenance,
      repairPriority: repairPriority(provenance),
      hasLegacyTransitions: transitions.hasLegacyTransitions,
    });
  }

  // Sort: high → medium → clean, then by caseId for stable ordering
  entries.sort((a, b) => {
    const pa = PRIORITY_ORDER[a.repairPriority];
    const pb = PRIORITY_ORDER[b.repairPriority];
    return pa !== pb ? pa - pb : a.caseId.localeCompare(b.caseId);
  });

  const casesNeedingAttention = entries.filter(e => e.repairPriority !== 'clean').length;
  const totalLegacyNodes = entries.reduce((sum, e) => sum + e.provenance.legacyCoerced, 0);
  const totalCanonicalNodes = entries.reduce((sum, e) => sum + e.provenance.canonical, 0);

  const summary: IntegritySummary = {
    cases: entries,
    totals: {
      totalCases: entries.length,
      casesNeedingAttention,
      totalLegacyNodes,
      totalCanonicalNodes,
    },
  };

  return NextResponse.json(summary);
}
