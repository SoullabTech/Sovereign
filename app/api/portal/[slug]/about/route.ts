export const dynamic = 'force-static';
export async function generateStaticParams() { return []; }

/**
 * PORTAL ABOUT API
 *
 * Returns practitioner bio and extended profile for the about page
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get practitioner profile with extended info
    const practitionerResult = await db.query(
      `SELECT
        p.id,
        p.name,
        p.tagline,
        p.bio,
        p.long_bio,
        p.photo_url,
        p.specialties,
        p.certifications,
        p.years_experience,
        p.location,
        p.approach,
        p.values,
        p.settings,
        mp.brand_colors
      FROM practitioners p
      LEFT JOIN maia_personas mp ON mp.practitioner_id = p.id
      WHERE p.slug = $1 AND p.status = 'active'`,
      [slug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    const p = practitionerResult.rows[0];
    const settings = p.settings || {};
    const brandColors = p.brand_colors || {};

    const profile = {
      id: p.id,
      name: p.name,
      tagline: p.tagline,
      bio: p.bio,
      long_bio: p.long_bio,
      photo_url: p.photo_url,
      specialties: p.specialties || [],
      certifications: p.certifications || [],
      years_experience: p.years_experience || 0,
      location: p.location,
      approach: p.approach,
      values: p.values || [],
      brand: {
        accent_color: brandColors.accent || settings.accent_color || '#D4AF37',
      },
    };

    // Get featured testimonials
    const testimonialsResult = await db.query(
      `SELECT
        id,
        client_name,
        content,
        rating
      FROM testimonials
      WHERE practitioner_id = $1 AND is_approved = true
      ORDER BY is_featured DESC, rating DESC, created_at DESC
      LIMIT 4`,
      [p.id]
    );

    return NextResponse.json({
      profile,
      testimonials: testimonialsResult.rows,
    });
  } catch (error) {
    console.error('Portal about error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
