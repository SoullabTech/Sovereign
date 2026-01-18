/**
 * PORTAL HOME API
 *
 * Returns data for the portal landing page including profile, services, testimonials, and lead magnets
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get practitioner profile
    const practitionerResult = await db.query(
      `SELECT
        p.id,
        p.name,
        p.slug,
        p.business_name,
        p.tagline,
        p.bio,
        p.photo_url,
        p.specialties,
        p.years_experience,
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
      slug: p.slug,
      tagline: p.tagline,
      bio: p.bio,
      photo_url: p.photo_url,
      specialties: p.specialties || [],
      years_experience: p.years_experience || 0,
      brand: {
        name: p.business_name || p.name,
        tagline: p.tagline || '',
        primary_color: brandColors.primary || settings.primary_color || '#1a1a2e',
        secondary_color: brandColors.secondary || settings.secondary_color || '#16213e',
        accent_color: brandColors.accent || settings.accent_color || '#D4AF37',
      },
    };

    // Get featured services (limit 6)
    const servicesResult = await db.query(
      `SELECT
        id,
        name,
        description,
        duration_minutes,
        price_cents,
        is_featured as featured
      FROM services
      WHERE practitioner_id = $1 AND is_active = true
      ORDER BY is_featured DESC, display_order ASC, name ASC
      LIMIT 6`,
      [p.id]
    );

    // Get testimonials (limit 4)
    const testimonialsResult = await db.query(
      `SELECT
        t.id,
        t.client_name,
        t.content,
        t.rating,
        s.name as service_name
      FROM testimonials t
      LEFT JOIN services s ON s.id = t.service_id
      WHERE t.practitioner_id = $1 AND t.is_approved = true
      ORDER BY t.is_featured DESC, t.created_at DESC
      LIMIT 4`,
      [p.id]
    );

    // Get primary lead magnet
    const leadMagnetResult = await db.query(
      `SELECT
        id,
        name,
        description,
        type
      FROM lead_magnets
      WHERE practitioner_id = $1 AND is_active = true
      ORDER BY is_featured DESC, created_at DESC
      LIMIT 1`,
      [p.id]
    );

    return NextResponse.json({
      profile,
      services: servicesResult.rows,
      testimonials: testimonialsResult.rows,
      lead_magnet: leadMagnetResult.rows[0] || null,
    });
  } catch (error) {
    console.error('Portal home error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
