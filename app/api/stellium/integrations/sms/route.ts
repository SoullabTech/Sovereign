/**
 * SMS INTEGRATION API
 * ====================
 * Manage practitioner Twilio SMS integration settings
 *
 * GET    - Get current SMS integration (summary, no auth token exposed)
 * PUT    - Update Twilio configuration (validates credentials before saving)
 * DELETE - Disconnect Twilio integration
 *
 * Mirrors the exact pattern of /api/stellium/integrations/email
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';
import {
  getSmsIntegrationSummary,
  upsertSmsIntegration,
  disconnectSmsIntegration,
  type TwilioSmsConfig,
} from '@/lib/practitioner/integrations';
import { TwilioProvider } from '@/lib/comms/providers/TwilioProvider';

async function getPractitionerForMember(memberId: string): Promise<string | null> {
  const result = await query<{ id: string }>(
    'SELECT id FROM practitioners WHERE member_id = $1',
    [memberId]
  );
  return result.rows[0]?.id || null;
}

/**
 * GET /api/stellium/integrations/sms
 */
export async function GET() {
  try {
    let memberId: string;
    try {
      memberId = await requireMemberId();
    } catch {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const practitionerId = await getPractitionerForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Not a practitioner' },
        { status: 403 }
      );
    }

    const summary = await getSmsIntegrationSummary(practitionerId);

    return NextResponse.json({ integration: summary });
  } catch (error) {
    console.error('[SMS Integration API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SMS integration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/stellium/integrations/sms
 *
 * Body:
 *   { accountSid: 'AC...', authToken: '...', fromNumber: '+1...', messagingServiceSid?: 'MG...' }
 */
export async function PUT(request: Request) {
  try {
    let memberId: string;
    try {
      memberId = await requireMemberId();
    } catch {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const practitionerId = await getPractitionerForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Not a practitioner' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { accountSid, authToken, fromNumber, messagingServiceSid } = body;

    // Validate required fields
    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json(
        { error: 'accountSid, authToken, and fromNumber are required' },
        { status: 400 }
      );
    }

    // Validate account SID format
    if (!accountSid.startsWith('AC')) {
      return NextResponse.json(
        { error: 'Invalid Account SID format (must start with AC)' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const normalized = TwilioProvider.normalizePhoneNumber(fromNumber);
    if (!normalized) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Verify credentials work with Twilio
    const provider = new TwilioProvider();
    const valid = await provider.verifyCredentials({
      account_sid: accountSid,
      auth_token: authToken,
    });

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid Twilio credentials. Please check your Account SID and Auth Token.' },
        { status: 400 }
      );
    }

    // Save integration
    const config: TwilioSmsConfig = {
      provider: 'twilio',
      accountSid,
      authToken,
      fromNumber: normalized,
      messagingServiceSid: messagingServiceSid || undefined,
    };

    const result = await upsertSmsIntegration(practitionerId, config);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || 'Failed to save integration' },
        { status: 500 }
      );
    }

    const summary = await getSmsIntegrationSummary(practitionerId);

    return NextResponse.json({
      success: true,
      message: 'Twilio SMS integration configured successfully',
      integration: summary,
    });
  } catch (error) {
    console.error('[SMS Integration API] PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update SMS integration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stellium/integrations/sms
 */
export async function DELETE() {
  try {
    let memberId: string;
    try {
      memberId = await requireMemberId();
    } catch {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const practitionerId = await getPractitionerForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Not a practitioner' },
        { status: 403 }
      );
    }

    await disconnectSmsIntegration(practitionerId);

    return NextResponse.json({
      success: true,
      message: 'SMS integration disconnected.',
      integration: {
        provider: null,
        status: 'disconnected',
      },
    });
  } catch (error) {
    console.error('[SMS Integration API] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}
