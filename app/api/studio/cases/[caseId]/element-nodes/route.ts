export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import db from '@/lib/db/postgres';
import {
  generateCandidateNodes,
  listCaseNodes,
  createManualNode,
  caseFieldAnalytics,
} from '@/lib/consciousness/elementNodeGenerator';
import {
  FacetKey,
  NodeRole,
  StateValence,
  isFacetKey,
} from '@/lib/consciousness/facetRegistry';

const VALID_ROLES: ReadonlySet<string> = new Set(['marker', 'goal', 'grounding']);
const VALID_VALENCES: ReadonlySet<string> = new Set(['positive', 'neutral', 'negative']);

async function getVerifiedCase(caseId: string, practitionerId: string) {
  const result = await db.query(
    `SELECT id FROM practitioner_cases WHERE id = $1 AND practitioner_id = $2`,
    [caseId, practitionerId],
  );
  return result.rows[0] ?? null;
}

/**
 * GET /api/studio/cases/[caseId]/element-nodes
 *
 * Response shape:
 *
 *   nodes      CaseElementNode[]     All nodes for the case, ordered by confirmed → confidence → created
 *   analytics  CaseFieldAnalytics    Provenance-aware analytics summary — analytics contract:
 *
 *     analytics.provenance           Raw coercion breakdown (canonical / legacyCoerced / three sub-buckets).
 *     analytics.hasLegacyNodes       Quick flag: any coerced nodes exist.
 *
 *     analytics.facetFrequency[]     Per-facet { canonical, legacyCoerced } counts.
 *                                    Use canonical for frequency charts and transition graphs.
 *                                    Exclude or separately display legacyCoerced.
 *
 *     analytics.roleDistribution     Per-role { canonical, legacyCoerced } counts.
 *                                    Use canonical.* for analytics; legacyCoerced.* for integrity reporting.
 *
 *     analytics.boardRegionDistribution  Ring vs center { canonical, legacyCoerced } counts.
 *
 *     analytics.confirmedCount       Practitioner-confirmed nodes (always canonical — manual write path).
 *
 * Provenance buckets (analytics.provenance.*):
 *   canonical                  Already canonical in DB — safe for all analytics.
 *   legacyCoerced              Reconstructed at read time — use with caution or exclude.
 *   coercedFromAetherSingleton Pre-triadic 'aether' (expected in older cases; recommend practitioner review).
 *   coercedFromInvalidString   Non-canonical non-empty string — indicates write-path bypass; investigate.
 *   coercedFromEmptyOrNull     Empty/null facet — incomplete data at write time; highest repair priority.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const caseRecord = await getVerifiedCase(caseId, identity.practitionerId);
  if (!caseRecord) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }

  const nodes = await listCaseNodes(caseId);
  return NextResponse.json({ nodes, analytics: caseFieldAnalytics(nodes) });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const caseRecord = await getVerifiedCase(caseId, identity.practitionerId);
  if (!caseRecord) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }

  const body = await request.json();
  const { action } = body;

  if (action === 'generate') {
    const result = await generateCandidateNodes(caseId, identity.practitionerId);
    const nodes = await listCaseNodes(caseId);
    return NextResponse.json({
      nodes,
      newCount: result.inserted,
      skipped: result.skipped,
      analytics: caseFieldAnalytics(nodes),
    });
  }

  if (action === 'create') {
    const { facet, role, stateValence, practitionerNote } = body;

    if (!facet || !isFacetKey(facet)) {
      return NextResponse.json(
        { error: `facet must be a valid FacetKey (e.g. fire_1, aether_2). Got: ${facet ?? 'missing'}` },
        { status: 400 },
      );
    }
    if (!role || !VALID_ROLES.has(role)) {
      return NextResponse.json(
        { error: `role must be one of: marker, goal, grounding. Got: ${role ?? 'missing'}` },
        { status: 400 },
      );
    }
    if (stateValence !== undefined && stateValence !== null && !VALID_VALENCES.has(stateValence)) {
      return NextResponse.json(
        { error: `stateValence must be positive, neutral, or negative. Got: ${stateValence}` },
        { status: 400 },
      );
    }

    const node = await createManualNode(
      caseId, identity.practitionerId,
      facet as FacetKey, role as NodeRole, (stateValence as StateValence) ?? null, practitionerNote ?? null,
    );
    return NextResponse.json({ node }, { status: 201 });
  }

  return NextResponse.json({ error: 'action must be generate or create' }, { status: 400 });
}
