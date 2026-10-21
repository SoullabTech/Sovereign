/**
 * STELLIUM COMMS CREDENTIALS API
 *
 * Credential-backed comms are limited to SMS/Twilio.
 * Email is managed centrally through Soullab's SMTP transport and therefore
 * never accepts practitioner-supplied email-provider credentials here.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';
import { deliveryService } from '@/lib/comms/DeliveryService';
import type { ProviderType } from '@/lib/comms/providers';

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

  const result = await query<{
    id: string;
    provider: string;
    verified: boolean;
    verified_at: Date | null;
    last_used_at: Date | null;
    status: string;
    error_count: number;
    last_error: string | null;
    created_at: Date;
  }>(
    `SELECT id, provider, verified, verified_at, last_used_at, status,
            error_count, last_error, created_at
       FROM practitioner_comms_credentials
      WHERE practitioner_id = $1
        AND provider = 'twilio'
      ORDER BY created_at`,
    [auth.practitionerId]
  );

  return NextResponse.json({
    providers: result.rows.map((row) => ({
      ...row,
      displayName: 'Twilio (SMS)',
      channel: 'sms',
    })),
  });
}

export async function POST(request: Request) {
  const auth = await practitionerOrResponse();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const provider: ProviderType | undefined = body?.provider;
  const credentials = body?.credentials;

  if (provider !== 'twilio' || !credentials) {
    return NextResponse.json(
      { error: 'Only Twilio SMS credentials are accepted here. Email uses Soullab managed SMTP.' },
      { status: 400 }
    );
  }

  const required = ['account_sid', 'auth_token', 'from_number'];
  const missing = required.filter((field) => !credentials[field]);
  if (missing.length) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
  }

  const result = await deliveryService.verifyAndStoreCredentials(
    auth.practitionerId!,
    'twilio',
    credentials
  );

  if (!result.valid) {
    return NextResponse.json({ error: result.error || 'Invalid credentials' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: 'Twilio (SMS) credentials saved successfully',
    provider: 'twilio',
    verified: true,
  });
}

export async function DELETE(request: NextRequest) {
  const auth = await practitionerOrResponse();
  if (auth.response) return auth.response;

  const provider = request.nextUrl.searchParams.get('provider');
  if (provider !== 'twilio') {
    return NextResponse.json(
      { error: 'Only Twilio SMS credentials are managed here.' },
      { status: 400 }
    );
  }

  await query(
    `DELETE FROM practitioner_comms_credentials
      WHERE practitioner_id = $1 AND provider = 'twilio'`,
    [auth.practitionerId]
  );

  return NextResponse.json({
    success: true,
    message: 'Twilio (SMS) credentials removed',
  });
}
