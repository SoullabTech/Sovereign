export const dynamic = 'force-static';
export async function generateStaticParams() { return [{ slug: 'default' }]; }

/**
 * PORTAL SERVICES API
 *
 * Returns all active services for a practitioner's portal
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get practitioner ID
    const practitionerResult = await db.query(
      `SELECT id FROM practitioners WHERE slug = $1 AND status = 'active'`,
      [slug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    const practitionerId = practitionerResult.rows[0].id;

    // Get all active services
    const servicesResult = await db.query(
      `SELECT
        id,
        name,
        description,
        long_description,
        duration_minutes,
        price_cents,
        category,
        is_featured as featured,
        includes,
        display_order
      FROM services
      WHERE practitioner_id = $1 AND is_active = true
      ORDER BY display_order ASC, is_featured DESC, name ASC`,
      [practitionerId]
    );

    return NextResponse.json({ services: servicesResult.rows });
  } catch (error) {
    console.error('Portal services error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
