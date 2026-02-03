export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PORTAL SETTINGS API
 *
 * Update practitioner portal settings (e.g., portal_status)
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { practitioner_id, portal_status } = body;

    if (!practitioner_id) {
      return NextResponse.json({ error: 'practitioner_id required' }, { status: 400 });
    }

    // Validate portal_status if provided
    if (portal_status && !['draft', 'live'].includes(portal_status)) {
      return NextResponse.json({ error: 'Invalid portal_status. Must be "draft" or "live".' }, { status: 400 });
    }

    // Verify the practitioner owns this portal
    const verifyResult = await db.query(
      `SELECT id FROM practitioners WHERE id = $1 AND slug = $2 AND status = 'active'`,
      [practitioner_id, slug]
    );

    if (verifyResult.rows.length === 0) {
      return NextResponse.json({ error: 'Unauthorized or portal not found' }, { status: 403 });
    }

    // Update portal_status if provided
    if (portal_status) {
      await db.query(
        `UPDATE practitioners SET portal_status = $1, updated_at = NOW() WHERE id = $2`,
        [portal_status, practitioner_id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Portal settings updated',
      data: { portal_status },
    });
  } catch (error) {
    console.error('[Portal Settings] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const result = await db.query(
      `SELECT portal_status FROM practitioners WHERE slug = $1 AND status = 'active'`,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        portal_status: result.rows[0].portal_status || 'draft',
      },
    });
  } catch (error) {
    console.error('[Portal Settings] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
