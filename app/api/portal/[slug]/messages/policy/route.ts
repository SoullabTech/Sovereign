/**
 * PORTAL MESSAGE POLICY API
 *
 * GET /api/portal/[slug]/messages/policy
 *
 * Get practitioner's messaging policy for client display.
 * Shows when they check messages, expected response time, and crisis info.
 *
 * AUTHORIZATION: Token-based. Returns limited public info.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import {
  validatePortalAccess,
  formatPolicyForClient,
  formatCheckDays,
} from '@/lib/portal/messages';
import { getEffectivePolicy } from '@/lib/practitioner/messages';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Helper to get practitioner ID and name from slug
 */
async function getPractitionerFromSlug(slug: string): Promise<{ id: string; name: string } | null> {
  const result = await db.query(
    `SELECT p.id, p.name, p.business_name
     FROM practitioners p
     WHERE p.slug = $1 AND p.status = 'active'`,
    [slug]
  );
  if (!result.rows[0]) return null;
  return {
    id: result.rows[0].id,
    name: result.rows[0].business_name || result.rows[0].name,
  };
}

/**
 * GET /api/portal/[slug]/messages/policy
 *
 * Query params:
 * - token: optional - if provided, returns client-specific policy if exists
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    // Get practitioner
    const practitioner = await getPractitionerFromSlug(slug);
    if (!practitioner) {
      return NextResponse.json(
        { error: 'Portal not found' },
        { status: 404 }
      );
    }

    // Validate token if provided
    let clientId: string | undefined;
    if (token) {
      const access = await validatePortalAccess(token);
      if (access && access.practitionerId === practitioner.id) {
        clientId = access.clientId;
      }
    }

    // Get effective policy
    const policy = await getEffectivePolicy(practitioner.id, clientId);

    if (!policy) {
      return NextResponse.json({
        available: false,
        message: 'Between-session messaging is not currently available.',
        practitioner_name: practitioner.name,
      });
    }

    // Return client-safe policy info
    return NextResponse.json({
      available: policy.allow_client_messages && policy.is_active,
      practitioner_name: practitioner.name,
      check_days: policy.check_days,
      check_days_formatted: formatCheckDays(policy.check_days),
      check_window: `${policy.check_window_start} - ${policy.check_window_end}`,
      timezone: policy.timezone,
      max_response_hours: policy.max_response_hours,
      crisis_copy: policy.crisis_copy,
      policy_summary: formatPolicyForClient(policy),
    });
  } catch (error) {
    console.error('[Portal Policy API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policy' },
      { status: 500 }
    );
  }
}
