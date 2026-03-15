export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import db from '@/lib/db/postgres';
import { confirmNode, deleteNode } from '@/lib/consciousness/elementNodeGenerator';
import {
  FacetKey,
  NodeRole,
  StateValence,
  isFacetKey,
} from '@/lib/consciousness/facetRegistry';

const VALID_ROLES: ReadonlySet<string> = new Set(['marker', 'goal', 'grounding']);
const VALID_VALENCES: ReadonlySet<string> = new Set(['positive', 'neutral', 'negative']);

async function getVerifiedNode(nodeId: string, caseId: string, practitionerId: string) {
  const result = await db.query(
    `SELECT n.id FROM case_element_nodes n
     JOIN practitioner_cases c ON c.id = n.case_id
     WHERE n.id = $1 AND n.case_id = $2 AND c.practitioner_id = $3`,
    [nodeId, caseId, practitionerId],
  );
  return result.rows[0] ?? null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string; nodeId: string }> },
) {
  const { caseId, nodeId } = await params;
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await getVerifiedNode(nodeId, caseId, identity.practitionerId);
  if (!existing) {
    return NextResponse.json({ error: 'Node not found' }, { status: 404 });
  }

  const body = await request.json();

  if (body.facet !== undefined && !isFacetKey(body.facet)) {
    return NextResponse.json(
      { error: `facet must be a valid FacetKey. Got: ${body.facet}` },
      { status: 400 },
    );
  }
  if (body.role !== undefined && !VALID_ROLES.has(body.role)) {
    return NextResponse.json(
      { error: `role must be one of: marker, goal, grounding. Got: ${body.role}` },
      { status: 400 },
    );
  }
  if (body.stateValence !== undefined && body.stateValence !== null && !VALID_VALENCES.has(body.stateValence)) {
    return NextResponse.json(
      { error: `stateValence must be positive, neutral, or negative. Got: ${body.stateValence}` },
      { status: 400 },
    );
  }

  const node = await confirmNode(nodeId, identity.practitionerId, body as {
    confirmed?: boolean;
    facet?: FacetKey;
    role?: NodeRole;
    stateValence?: StateValence;
    practitionerNote?: string;
  });
  if (!node) {
    return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
  }
  return NextResponse.json({ node });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string; nodeId: string }> },
) {
  const { caseId, nodeId } = await params;
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await getVerifiedNode(nodeId, caseId, identity.practitionerId);
  if (!existing) {
    return NextResponse.json({ error: 'Node not found' }, { status: 404 });
  }

  await deleteNode(nodeId);
  return NextResponse.json({ deleted: true });
}
