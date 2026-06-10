export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO PROFILE API
 *
 * GET   — Return the current practitioner's editable profile (name, business_name,
 *         tagline, bio, slug, updated_at). Used by the /studio/booking hub's
 *         ProfileCard.
 * PATCH — Partial update of the same fields. Thin wrapper around updatePractitioner()
 *         from lib/practitioner/practitionerService.ts.
 *
 * Wire format is snake_case to match /api/portal/[slug]/config. The service layer
 * accepts camelCase, so the route handler does the mapping at the boundary.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { updatePractitioner } from '@/lib/practitioner/practitionerService';

interface ProfileWire {
  id: string;
  name: string;
  email: string | null;
  business_name: string | null;
  tagline: string | null;
  bio: string | null;
  slug: string;
  updated_at: string | null;
}

async function loadProfile(practitionerId: string): Promise<ProfileWire | null> {
  const result = await db.query(
    `SELECT id, name, email, business_name, tagline, bio, slug, updated_at
     FROM practitioners
     WHERE id = $1`,
    [practitionerId]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    business_name: row.business_name,
    tagline: row.tagline,
    bio: row.bio,
    slug: row.slug,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

export async function GET(request: NextRequest) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await loadProfile(identity.practitionerId);
    if (!profile) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[Studio Profile] GET error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate: at least one editable field must be present
    const allowedFields = ['name', 'business_name', 'tagline', 'bio'] as const;
    const hasAtLeastOne = allowedFields.some((k) => k in body);
    if (!hasAtLeastOne) {
      return NextResponse.json(
        { error: 'At least one of name, business_name, tagline, bio is required' },
        { status: 400 }
      );
    }

    // Validate name if present
    if ('name' in body) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json({ error: 'name must be a non-empty string' }, { status: 400 });
      }
      if (body.name.length > 200) {
        return NextResponse.json({ error: 'name too long (max 200)' }, { status: 400 });
      }
    }

    // Validate optional string fields
    for (const field of ['business_name', 'tagline', 'bio'] as const) {
      if (field in body && body[field] !== null && typeof body[field] !== 'string') {
        return NextResponse.json({ error: `${field} must be a string or null` }, { status: 400 });
      }
    }

    // Map snake_case wire → camelCase service layer
    const updateData: {
      name?: string;
      businessName?: string;
      tagline?: string;
      bio?: string;
    } = {};
    if ('name' in body) updateData.name = body.name.trim();
    if ('business_name' in body) updateData.businessName = body.business_name ?? '';
    if ('tagline' in body) updateData.tagline = body.tagline ?? '';
    if ('bio' in body) updateData.bio = body.bio ?? '';

    const updated = await updatePractitioner(identity.practitionerId, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Re-read to return the full wire shape (updatePractitioner returns a different shape)
    const profile = await loadProfile(identity.practitionerId);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[Studio Profile] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
