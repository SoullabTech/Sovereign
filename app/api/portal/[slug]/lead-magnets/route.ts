/**
 * PORTAL LEAD MAGNETS API
 *
 * Returns lead magnets/free resources for the portal
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

    // Get active lead magnets
    const leadMagnetsResult = await db.query(
      `SELECT
        id,
        name,
        description,
        long_description,
        type,
        delivery_type,
        benefits,
        is_featured as featured
      FROM lead_magnets
      WHERE practitioner_id = $1 AND is_active = true
      ORDER BY is_featured DESC, created_at DESC`,
      [practitionerId]
    );

    return NextResponse.json({ lead_magnets: leadMagnetsResult.rows });
  } catch (error) {
    console.error('Portal lead magnets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
