/**
 * STELLIUM COMMS CREDENTIALS API
 *
 * Manage provider credentials (Resend, Twilio, etc.)
 *
 * GET  - List configured providers
 * POST - Add/update credentials for a provider
 * DELETE - Remove credentials for a provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';
import { deliveryService } from '@/lib/comms/DeliveryService';
import type { ProviderType } from '@/lib/comms/providers';

/**
 * Get practitioner ID from member
 */
async function getPractitionerForMember(memberId: string): Promise<string | null> {
  const result = await query<{ id: string }>(
    'SELECT id FROM practitioners WHERE member_id = $1',
    [memberId]
  );
  return result.rows[0]?.id || null;
}

/**
 * GET /api/stellium/comms/credentials
 *
 * List configured providers (credentials are never exposed)
 */
export async function GET() {
  try {
    let memberId: string;
    try {
      memberId = await requireMemberId();
    } catch {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const practitionerId = await getPractitionerForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Not a practitioner' }, { status: 403 });
    }

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
       ORDER BY created_at`,
      [practitionerId]
    );

    // Add display info for each provider
    const providers = result.rows.map((row) => ({
      ...row,
      displayName: getProviderDisplayName(row.provider as ProviderType),
      channel: getProviderChannel(row.provider as ProviderType),
    }));

    return NextResponse.json({ providers });
  } catch (error) {
    console.error('[Comms Credentials API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
  }
}

/**
 * POST /api/stellium/comms/credentials
 *
 * Add or update credentials for a provider
 * Body: { provider: 'resend' | 'twilio', credentials: {...} }
 */
export async function POST(request: Request) {
  try {
    let memberId: string;
    try {
      memberId = await requireMemberId();
    } catch {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const practitionerId = await getPractitionerForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Not a practitioner' }, { status: 403 });
    }

    const body = await request.json();
    const { provider, credentials } = body;

    if (!provider || !credentials) {
      return NextResponse.json(
        { error: 'Provider and credentials are required' },
        { status: 400 }
      );
    }

    // Validate provider type
    const validProviders: ProviderType[] = ['resend', 'twilio', 'sendgrid', 'postmark'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate required fields per provider
    const requiredFields = getRequiredFields(provider);
    const missingFields = requiredFields.filter((field) => !credentials[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify and store credentials
    const result = await deliveryService.verifyAndStoreCredentials(
      practitionerId,
      provider,
      credentials
    );

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || 'Invalid credentials' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${getProviderDisplayName(provider)} credentials saved successfully`,
      provider,
      verified: true,
    });
  } catch (error) {
    console.error('[Comms Credentials API] Error:', error);
    return NextResponse.json({ error: 'Failed to save credentials' }, { status: 500 });
  }
}

/**
 * DELETE /api/stellium/comms/credentials?provider=resend
 *
 * Remove credentials for a provider
 */
export async function DELETE(request: NextRequest) {
  try {
    let memberId: string;
    try {
      memberId = await requireMemberId();
    } catch {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const practitionerId = await getPractitionerForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Not a practitioner' }, { status: 403 });
    }

    const provider = request.nextUrl.searchParams.get('provider');
    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    await query(
      `DELETE FROM practitioner_comms_credentials
       WHERE practitioner_id = $1 AND provider = $2`,
      [practitionerId, provider]
    );

    return NextResponse.json({
      success: true,
      message: `${getProviderDisplayName(provider as ProviderType)} credentials removed`,
    });
  } catch (error) {
    console.error('[Comms Credentials API] Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete credentials' }, { status: 500 });
  }
}

// Helper functions

function getProviderDisplayName(provider: ProviderType): string {
  const names: Record<ProviderType, string> = {
    resend: 'Resend (Email)',
    twilio: 'Twilio (SMS)',
    sendgrid: 'SendGrid (Email)',
    postmark: 'Postmark (Email)',
  };
  return names[provider] || provider;
}

function getProviderChannel(provider: ProviderType): 'email' | 'sms' {
  const channels: Record<ProviderType, 'email' | 'sms'> = {
    resend: 'email',
    twilio: 'sms',
    sendgrid: 'email',
    postmark: 'email',
  };
  return channels[provider] || 'email';
}

function getRequiredFields(provider: ProviderType): string[] {
  const fields: Record<ProviderType, string[]> = {
    resend: ['api_key'],
    twilio: ['account_sid', 'auth_token', 'from_number'],
    sendgrid: ['api_key'],
    postmark: ['api_key'],
  };
  return fields[provider] || [];
}
