/**
 * PRACTITIONER AUTH API
 *
 * Validates practitioner ownership for admin pages
 * Returns practitioner data if authenticated
 */

export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { cookies } from 'next/headers';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  const { slug } = params;

  // DEV BYPASS: Return mock practitioner in development mode
  // This allows testing the admin UI without a database connection
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    console.log('[Practitioner Auth] Dev bypass active for slug:', slug);
    // Use deterministic UUIDs for dev mode (valid UUID format required by Postgres)
    const mockPractitioner = {
      id: '00000000-0000-0000-0000-000000000001',
      member_id: '00000000-0000-0000-0000-000000000002',
      slug: slug || 'dev',
      name: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Dev Practitioner',
      email: `${slug || 'dev'}@example.com`,
      modality: 'astrology',
      brand: {
        name: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Dev Practice',
        tagline: 'Evolutionary Astrology',
      },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return NextResponse.json({ practitioner: mockPractitioner });
  }

  try {
    if (!slug) {
      return NextResponse.json(
        { error: 'Practitioner slug is required' },
        { status: 400 }
      );
    }

    // Get session from cookies or headers
    const cookieStore = await cookies();
    // AUTH-BOUNDARY-02 — caller identity from a verified session only.
    //
    // This previously resolved the caller as `member_id` cookie || `x-member-id`
    // header. Both are client-authored, and neither was validated against any
    // session record — the `session_token` cookie was read and never used. The
    // ownership check further down (`practitioner.member_id !== caller`) was
    // therefore comparing the practitioner's owner against a value the caller
    // had just chosen, so naming a practitioner's member id returned that
    // practitioner's profile, including their name and email.
    //
    // The ownership comparison itself is correct and is left untouched: this
    // repairs who the caller IS, not what they may reach.
    const effectiveMemberId = await getMemberIdFromRequest(request);

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

    // Dev bypass: return mock practitioner when database is unavailable
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      const { slug } = params;
      const authHeader = request.headers.get('x-member-id');
      console.log('[Practitioner Auth] Dev bypass: returning mock practitioner for slug:', slug);

      // Use deterministic UUIDs for dev mode (valid UUID format required by Postgres)
      const mockPractitioner = {
        id: authHeader || '00000000-0000-0000-0000-000000000001',
        member_id: authHeader || '00000000-0000-0000-0000-000000000002',
        slug: slug,
        name: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Dev Practitioner',
        email: `${slug || 'dev'}@example.com`,
        modality: 'astrology',
        brand: {
          name: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Dev Practice',
          tagline: 'Development Mode',
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json({ practitioner: mockPractitioner });
    }

    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
