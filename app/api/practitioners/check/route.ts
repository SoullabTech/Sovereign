/**
 * PRACTITIONER CHECK API
 *
 * Checks if a member already has a practitioner account.
 * Used during signup flow to determine if member needs to create one.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

interface CheckPractitionerInput {
  memberId: string;
}

interface PractitionerResult {
  id: string;
  slug: string;
  name: string;
  email: string;
  modality: string;
  is_active: boolean;
}

/**
 * POST /api/practitioners/check
 *
 * Checks if member has an existing practitioner account.
 * Returns hasPractitioner boolean and practitioner data if exists.
 */
export async function POST(request: NextRequest) {
  try {
    const body: CheckPractitionerInput = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId is required' },
        { status: 400 }
      );
    }

    // Check for existing practitioner
    const result = await query<PractitionerResult>(
      `SELECT id, slug, name, email, modality, is_active
       FROM practitioners
       WHERE member_id = $1`,
      [memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        hasPractitioner: false,
        practitioner: null,
      });
    }

    const practitioner = result.rows[0];

    return NextResponse.json({
      hasPractitioner: true,
      practitioner,
    });
  } catch (error) {
    console.error('[Practitioner Check API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check practitioner status' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/practitioners/check?slug=example
 *
 * Checks if a slug is available for use.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'slug query parameter is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9][a-z0-9-]{2,48}[a-z0-9]$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({
        available: false,
        reason: 'Invalid format. Use 4-50 lowercase letters, numbers, and hyphens.',
      });
    }

    // Check if slug exists
    const result = await query<{ id: string }>(
      'SELECT id FROM practitioners WHERE slug = $1',
      [slug]
    );

    return NextResponse.json({
      available: result.rows.length === 0,
      slug,
    });
  } catch (error) {
    console.error('[Practitioner Check API] Slug check error:', error);
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    );
  }
}
