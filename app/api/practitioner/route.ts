export const dynamic = 'force-dynamic';

/**
 * Practitioner API - Main Routes
 *
 * GET /api/practitioner - List all practitioners (admin only)
 * POST /api/practitioner - Create a new practitioner
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  listPractitioners,
  createPractitioner,
  getPractitionerBySlug,
} from '@/lib/practitioner/practitionerService';

// List all practitioners (admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'onboarding' | 'building' | 'active' | 'paused' | 'archived' | null;

    const practitioners = await listPractitioners(status || undefined);

    return NextResponse.json({
      practitioners,
      count: practitioners.length,
    });
  } catch (error) {
    console.error('[PRACTITIONER] List error:', error);
    return NextResponse.json(
      { error: 'Failed to list practitioners' },
      { status: 500 }
    );
  }
}

// Create a new practitioner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, name, email, businessName, tagline, bio } = body;

    // Validate required fields
    if (!slug || !name || !email) {
      return NextResponse.json(
        { error: 'Slug, name, and email are required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await getPractitionerBySlug(slug);
    if (existing) {
      return NextResponse.json(
        { error: 'A practitioner with this slug already exists' },
        { status: 409 }
      );
    }

    // Create the practitioner
    const practitioner = await createPractitioner({
      slug,
      name,
      email,
      businessName,
      tagline,
      bio,
    });

    return NextResponse.json({
      success: true,
      practitioner,
    });
  } catch (error) {
    console.error('[PRACTITIONER] Create error:', error);
    return NextResponse.json(
      { error: 'Failed to create practitioner' },
      { status: 500 }
    );
  }
}
