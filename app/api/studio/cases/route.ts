export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * POST /api/studio/cases
 * Creates a practitioner_cases row linked to a practitioner_clients record.
 * Called when a practitioner opens a client and initiates case tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

export async function POST(request: NextRequest) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { practitionerId } = identity;
  const body = await request.json();
  const { clientId } = body as { clientId: string };

  if (!clientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
  }

  // Verify client belongs to this practitioner
  const clientRow = await db.query(
    `SELECT id, name FROM practitioner_clients WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId],
  );
  if (!clientRow.rows.length) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const client = clientRow.rows[0];

  // Check if a case already exists for this client
  const existing = await db.query(
    `SELECT id FROM practitioner_cases WHERE practitioner_id = $1 AND client_id = $2 LIMIT 1`,
    [practitionerId, clientId],
  );
  if (existing.rows.length) {
    return NextResponse.json({ caseId: existing.rows[0].id, existed: true });
  }

  // Create the case
  const result = await db.query(
    `INSERT INTO practitioner_cases
       (practitioner_id, client_id, client_identifier, privacy_mode)
     VALUES ($1, $2, $3, 'private')
     RETURNING id`,
    [practitionerId, clientId, client.name as string],
  );

  return NextResponse.json({ caseId: result.rows[0].id, existed: false }, { status: 201 });
}
