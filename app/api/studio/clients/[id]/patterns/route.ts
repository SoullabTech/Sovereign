export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { getPatternsForClient } from '@/lib/patterns/getMemberPatterns';
import { createPattern } from '@/lib/patterns/createPattern';
import { queryOne } from '@/lib/db/postgres';

interface ClientRow {
  memberId: string | null;
}

// Verify the client (by member_id) belongs to the practitioner
async function getClientMemberId(
  memberId: string,
  practitionerId: string
): Promise<string | null> {
  const row = await queryOne<ClientRow>(
    `SELECT member_id AS "memberId"
     FROM practitioner_clients
     WHERE member_id = $1
       AND practitioner_id = $2
     LIMIT 1`,
    [memberId, practitionerId]
  );
  return row?.memberId ?? null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: memberId } = await context.params;
    const verified = await getClientMemberId(memberId, identity.practitionerId);
    if (!verified) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const patterns = await getPatternsForClient(memberId, identity.practitionerId);
    return NextResponse.json({ patterns }, { status: 200 });
  } catch (error) {
    console.error('GET /api/studio/clients/[id]/patterns failed:', error);
    return NextResponse.json({ error: 'Failed to load patterns' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: memberId } = await context.params;
    const verified = await getClientMemberId(memberId, identity.practitionerId);
    if (!verified) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const body = await request.json();
    const theme = typeof body.theme === 'string' ? body.theme.trim() : '';

    if (!theme) {
      return NextResponse.json({ error: 'Theme is required' }, { status: 400 });
    }

    const description =
      typeof body.description === 'string' && body.description.trim().length > 0
        ? body.description.trim()
        : undefined;

    const confidence =
      typeof body.confidence === 'number' ? body.confidence : undefined;

    if (confidence != null && (Number.isNaN(confidence) || confidence < 0 || confidence > 1)) {
      return NextResponse.json(
        { error: 'Confidence must be between 0 and 1' },
        { status: 400 }
      );
    }

    const status = body.status === 'offered' ? 'offered' as const : 'emerging' as const;

    const pattern = await createPattern({
      memberId,
      practitionerId: identity.practitionerId,
      theme,
      description,
      confidence,
      status,
    });

    return NextResponse.json({ pattern }, { status: 201 });
  } catch (error) {
    console.error('POST /api/studio/clients/[id]/patterns failed:', error);
    return NextResponse.json({ error: 'Failed to create pattern' }, { status: 500 });
  }
}
