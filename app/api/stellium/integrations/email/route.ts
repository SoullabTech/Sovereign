/**
 * EMAIL INTEGRATION API
 * =====================
 * Practitioner email uses Soullab's managed sovereign SMTP transport.
 * No practitioner-supplied email-vendor credentials are accepted.
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';
import {
  getEmailIntegrationSummary,
  upsertEmailIntegration,
  disconnectEmailIntegration,
} from '@/lib/practitioner/integrations';

async function getPractitionerForMember(memberId: string): Promise<string | null> {
  const result = await query<{ id: string }>(
    'SELECT id FROM practitioners WHERE member_id = $1',
    [memberId]
  );
  return result.rows[0]?.id || null;
}

async function practitionerOrResponse() {
  try {
    const memberId = await requireMemberId();
    const practitionerId = await getPractitionerForMember(memberId);
    if (!practitionerId) {
      return { practitionerId: null, response: NextResponse.json({ error: 'Not a practitioner' }, { status: 403 }) };
    }
    return { practitionerId, response: null };
  } catch {
    return { practitionerId: null, response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }
}

export async function GET() {
  const auth = await practitionerOrResponse();
  if (auth.response) return auth.response;
  const integration = await getEmailIntegrationSummary(auth.practitionerId!);
  return NextResponse.json({ integration });
}

export async function PUT(request: Request) {
  const auth = await practitionerOrResponse();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  if (body?.mode && body.mode !== 'managed') {
    return NextResponse.json(
      { error: 'Practitioner email uses Soullab managed SMTP. External email-provider credentials are not accepted.' },
      { status: 400 }
    );
  }

  const result = await upsertEmailIntegration(auth.practitionerId!, { mode: 'managed' });
  if (!result.ok) {
    return NextResponse.json({ error: result.error || 'Failed to save integration' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Soullab managed email is active.',
    integration: await getEmailIntegrationSummary(auth.practitionerId!),
  });
}

export async function DELETE() {
  const auth = await practitionerOrResponse();
  if (auth.response) return auth.response;
  await disconnectEmailIntegration(auth.practitionerId!);
  return NextResponse.json({
    success: true,
    message: 'Practitioner-specific email configuration cleared. Soullab managed SMTP remains the delivery path.',
    integration: { provider: 'managed', status: 'connected' },
  });
}
