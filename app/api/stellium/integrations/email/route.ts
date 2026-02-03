/**
 * EMAIL INTEGRATION API
 * =====================
 * Manage practitioner email integration settings
 *
 * GET    - Get current email integration (summary, no API keys exposed)
 * PUT    - Update email integration config
 * DELETE - Disconnect BYO, revert to managed
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';
import {
  getEmailIntegrationSummary,
  upsertEmailIntegration,
  disconnectEmailIntegration,
  type EmailIntegrationConfig,
} from '@/lib/practitioner/integrations';

/**
 * Get practitioner ID from authenticated member
 */
async function getPractitionerForMember(memberId: string): Promise<string | null> {
  const result = await query<{ id: string }>(
    'SELECT id FROM practitioners WHERE member_id = $1',
    [memberId]
  );
  return result.rows[0]?.id || null;
}

/**
 * GET /api/stellium/integrations/email
 *
 * Get email integration summary for the authenticated practitioner
 * API keys are masked for security
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

    const summary = await getEmailIntegrationSummary(practitionerId);

    return NextResponse.json({ integration: summary });
  } catch (error) {
    console.error('[Email Integration API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email integration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/stellium/integrations/email
 *
 * Update email integration configuration
 *
 * Body for managed mode:
 *   { mode: 'managed' }
 *
 * Body for BYO Resend:
 *   { mode: 'resend', apiKey: 're_...', fromEmail: 'hello@example.com', fromName?: '...', replyTo?: '...' }
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
    const { mode, apiKey, fromEmail, fromName, replyTo } = body;

    // Validate mode
    if (!mode || !['managed', 'resend'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "managed" or "resend"' },
        { status: 400 }
      );
    }

    // Build config
    let config: EmailIntegrationConfig;

    if (mode === 'managed') {
      config = { mode: 'managed' };
    } else {
      // BYO Resend validation
      if (!apiKey) {
        return NextResponse.json(
          { error: 'API key is required for Resend mode' },
          { status: 400 }
        );
      }
      if (!fromEmail) {
        return NextResponse.json(
          { error: 'From email is required for Resend mode' },
          { status: 400 }
        );
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(fromEmail)) {
        return NextResponse.json(
          { error: 'Invalid from email format' },
          { status: 400 }
        );
      }

      if (replyTo && !emailRegex.test(replyTo)) {
        return NextResponse.json(
          { error: 'Invalid reply-to email format' },
          { status: 400 }
        );
      }

      // Verify API key works by checking domains (lightweight call)
      const isValidKey = await verifyResendApiKey(apiKey);
      if (!isValidKey) {
        return NextResponse.json(
          { error: 'Invalid Resend API key. Please check your key and try again.' },
          { status: 400 }
        );
      }

      config = {
        mode: 'resend',
        apiKey,
        fromEmail,
        fromName: fromName || undefined,
        replyTo: replyTo || undefined,
      };
    }

    // Save integration
    const result = await upsertEmailIntegration(practitionerId, config);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || 'Failed to save integration' },
        { status: 500 }
      );
    }

    // Return updated summary
    const summary = await getEmailIntegrationSummary(practitionerId);

    return NextResponse.json({
      success: true,
      message: mode === 'managed'
        ? 'Switched to Soullab managed email'
        : 'Resend integration configured successfully',
      integration: summary,
    });
  } catch (error) {
    console.error('[Email Integration API] PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update email integration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stellium/integrations/email
 *
 * Disconnect BYO integration and revert to managed
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

    await disconnectEmailIntegration(practitionerId);

    return NextResponse.json({
      success: true,
      message: 'Email integration disconnected. Now using Soullab managed email.',
      integration: {
        provider: 'managed',
        status: 'connected',
      },
    });
  } catch (error) {
    console.error('[Email Integration API] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}

/**
 * Verify Resend API key by making a lightweight domains request
 */
async function verifyResendApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
