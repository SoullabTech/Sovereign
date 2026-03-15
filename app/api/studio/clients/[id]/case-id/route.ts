export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * GET /api/studio/clients/[id]/case-id
 *
 * Returns the practitioner_cases.id linked to a studio client (practitioner_clients.id).
 * Returns { caseId: string } or { caseId: null } if no case exists yet.
 *
 * Matching logic: practitioner_cases.client_id column (if present) first,
 * then falls back to name matching via client_identifier.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: clientId } = await params;
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { practitionerId } = identity;

  // First: try direct FK lookup (client_id column, if it exists)
  try {
    const direct = await db.query(
      `SELECT id FROM practitioner_cases
       WHERE practitioner_id = $1 AND client_id = $2
       LIMIT 1`,
      [practitionerId, clientId],
    );
    if (direct.rows.length) {
      return NextResponse.json({ caseId: direct.rows[0].id });
    }
  } catch {
    // Column may not exist yet — fall through to name matching
  }

  // Second: match by client name via practitioner_clients → practitioner_cases.client_identifier
  const nameResult = await db.query(
    `SELECT pc.id
     FROM practitioner_cases pc
     JOIN practitioner_clients cl ON cl.practitioner_id = pc.practitioner_id
     WHERE pc.practitioner_id = $1
       AND cl.id = $2
       AND pc.client_identifier ILIKE cl.name
     LIMIT 1`,
    [practitionerId, clientId],
  );

  if (nameResult.rows.length) {
    return NextResponse.json({ caseId: nameResult.rows[0].id });
  }

  return NextResponse.json({ caseId: null });
}
