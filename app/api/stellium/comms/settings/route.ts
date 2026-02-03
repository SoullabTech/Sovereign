/**
 * STELLIUM COMMS SETTINGS API
 *
 * Manage practitioner communication settings
 *
 * GET  - Get current comms settings
 * PUT  - Update comms settings
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';

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
 * GET /api/stellium/comms/settings
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

    // Get or create comms settings
    let settings = await query<{
      id: string;
      default_email: string | null;
      default_phone: string | null;
      default_channel: string;
      reply_to_mode: string;
      custom_reply_to: string | null;
      email_from_name: string | null;
      email_signature: string | null;
      sms_signature: string | null;
      sending_hours: object | null;
      timezone: string;
      auto_reminder_enabled: boolean;
      auto_followup_enabled: boolean;
    }>(
      `SELECT * FROM practitioner_comms_settings WHERE practitioner_id = $1`,
      [practitionerId]
    );

    if (settings.rows.length === 0) {
      // Create default settings
      await query(
        `INSERT INTO practitioner_comms_settings (practitioner_id)
         VALUES ($1) ON CONFLICT (practitioner_id) DO NOTHING`,
        [practitionerId]
      );
      settings = await query(
        `SELECT * FROM practitioner_comms_settings WHERE practitioner_id = $1`,
        [practitionerId]
      );
    }

    // Get configured providers
    const credentials = await query<{
      provider: string;
      verified: boolean;
      last_used_at: Date | null;
    }>(
      `SELECT provider, verified, last_used_at
       FROM practitioner_comms_credentials
       WHERE practitioner_id = $1 AND status = 'active'`,
      [practitionerId]
    );

    return NextResponse.json({
      settings: settings.rows[0],
      providers: credentials.rows,
    });
  } catch (error) {
    console.error('[Comms Settings API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * PUT /api/stellium/comms/settings
 */
export async function PUT(request: Request) {
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

    // Build update query dynamically
    const allowedFields = [
      'default_email',
      'default_phone',
      'default_channel',
      'reply_to_mode',
      'custom_reply_to',
      'email_from_name',
      'email_signature',
      'sms_signature',
      'sending_hours',
      'timezone',
      'auto_reminder_enabled',
      'auto_followup_enabled',
    ];

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(
          field === 'sending_hours' && body[field]
            ? JSON.stringify(body[field])
            : body[field]
        );
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(practitionerId);
    await query(
      `UPDATE practitioner_comms_settings
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE practitioner_id = $${paramIndex}`,
      values
    );

    // Return updated settings
    const settings = await query(
      `SELECT * FROM practitioner_comms_settings WHERE practitioner_id = $1`,
      [practitionerId]
    );

    return NextResponse.json({
      success: true,
      settings: settings.rows[0],
    });
  } catch (error) {
    console.error('[Comms Settings API] Update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
