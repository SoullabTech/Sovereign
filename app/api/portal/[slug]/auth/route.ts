/**
 * PRACTITIONER AUTH API
 *
 * Validates practitioner ownership for admin pages
 * Returns practitioner data if authenticated
 */

export const dynamic = 'force-static';
export async function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Practitioner slug is required' },
        { status: 400 }
      );
    }

    // Get session from cookies or headers
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const memberId = cookieStore.get('member_id')?.value;

    // Also check localStorage sync (sent as header)
    const authHeader = request.headers.get('x-member-id');

    const effectiveMemberId = memberId || authHeader;

    if (!effectiveMemberId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Look up practitioner by slug
    const practitionerResult = await query(
      `SELECT
        p.*,
        m.name as member_name,
        m.email as member_email
       FROM practitioners p
       LEFT JOIN members m ON p.member_id = m.id
       WHERE p.slug = $1`,
      [slug]
    );

    if (practitionerResult.rows.length === 0) {
      // Try to find by member_id if no practitioners table exists yet
      // This is a fallback for development
      const memberResult = await query(
        `SELECT id, name, email FROM members WHERE id = $1`,
        [effectiveMemberId]
      );

      if (memberResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Practitioner not found' },
          { status: 404 }
        );
      }

      // Create a mock practitioner for development
      const member = memberResult.rows[0];
      const mockPractitioner = {
        id: member.id,
        member_id: member.id,
        slug: slug,
        name: member.name,
        email: member.email,
        modality: 'astrology',
        brand: {
          name: member.name,
          tagline: 'Astrologer',
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json({ practitioner: mockPractitioner });
    }

    const practitioner = practitionerResult.rows[0];

    // Verify the current user owns this practitioner profile
    if (practitioner.member_id !== effectiveMemberId) {
      return NextResponse.json(
        { error: 'You do not have permission to access this practitioner profile' },
        { status: 403 }
      );
    }

    // Return practitioner data
    return NextResponse.json({
      practitioner: {
        id: practitioner.id,
        member_id: practitioner.member_id,
        slug: practitioner.slug,
        name: practitioner.name || practitioner.member_name,
        email: practitioner.email || practitioner.member_email,
        modality: practitioner.modality || 'astrology',
        brand: practitioner.brand || {
          name: practitioner.name || practitioner.member_name,
        },
        is_active: practitioner.is_active ?? true,
        created_at: practitioner.created_at,
        updated_at: practitioner.updated_at,
      },
    });
  } catch (error) {
    console.error('[Practitioner Auth] Error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
