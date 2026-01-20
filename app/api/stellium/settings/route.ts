/**
 * STELLIUM SETTINGS API
 *
 * Manage practitioner settings: profile, session defaults, notifications, practice
 *
 * Security: Derives practitionerId from authenticated member session cookie.
 * Never accepts practitionerId from client to prevent cross-practitioner access.
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';
import {
  getPractitionerSettings,
  updatePractitionerProfile,
  updateSessionDefaults,
  updateNotificationSettings,
  updatePracticeSettings,
} from '@/lib/stellium/settings';

/**
 * Get the practitioner ID for an authenticated member
 * Returns null if member is not a practitioner
 */
async function getPractitionerForMember(memberId: string): Promise<string | null> {
  const result = await query<{ id: string }>(
    'SELECT id FROM practitioners WHERE member_id = $1',
    [memberId]
  );
  return result.rows[0]?.id || null;
}

/**
 * GET /api/stellium/settings
 * Get all settings for the authenticated practitioner
 *
 * Auth: httpOnly session cookie (maia_session)
 */
export async function GET() {
  try {
    // Require authentication from session cookie
    let memberId: string;
    try {
      memberId = await requireMemberId();
    } catch {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Derive practitioner from authenticated member
    const practitionerId = await getPractitionerForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Not a practitioner' },
        { status: 403 }
      );
    }

    const settings = await getPractitionerSettings(practitionerId);

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[Stellium Settings API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/stellium/settings
 * Update settings for the authenticated practitioner
 *
 * Auth: httpOnly session cookie (maia_session)
 *
 * Body:
 * - section: 'profile' | 'sessionDefaults' | 'notifications' | 'practice'
 * - data: section-specific update data
 */
export async function PUT(request: Request) {
  try {
    // Require authentication from session cookie
    let memberId: string;
    try {
      memberId = await requireMemberId();
    } catch {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Derive practitioner from authenticated member
    const practitionerId = await getPractitionerForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Not a practitioner' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { error: 'Section and data required' },
        { status: 400 }
      );
    }

    let result;
    switch (section) {
      case 'profile':
        result = await updatePractitionerProfile(practitionerId, data);
        break;
      case 'sessionDefaults':
        result = await updateSessionDefaults(practitionerId, data);
        break;
      case 'notifications':
        result = await updateNotificationSettings(practitionerId, data);
        break;
      case 'practice':
        result = await updatePracticeSettings(practitionerId, data);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid section. Must be profile, sessionDefaults, notifications, or practice' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Update failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      section,
      data: result,
    });
  } catch (error) {
    console.error('[Stellium Settings API] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
