/**
 * PRACTITIONER FAQ API
 *
 * CRUD operations for practitioner FAQs
 */

export const dynamic = 'force-static';
export async function generateStaticParams() { return [{ slug: 'default' }]; }

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

// GET - List FAQs for a practitioner
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
    const searchParams = request.nextUrl.searchParams;
    const publishedOnly = searchParams.get('published') === 'true';

    // Get practitioner by slug
    const practitionerResult = await query(
      `SELECT id FROM practitioners WHERE slug = $1`,
      [slug]
    );

    let practitionerId: string;

    if (practitionerResult.rows.length === 0) {
      // Fallback: try to get from portal config
      const portalResult = await query(
        `SELECT practitioner_id FROM portal_configs WHERE slug = $1`,
        [slug]
      );

      if (portalResult.rows.length === 0) {
        // For development, allow fetching by slug directly
        practitionerId = slug;
      } else {
        practitionerId = portalResult.rows[0].practitioner_id;
      }
    } else {
      practitionerId = practitionerResult.rows[0].id;
    }

    let whereClause = 'WHERE practitioner_id = $1';
    if (publishedOnly) {
      whereClause += ' AND is_published = true';
    }

    const result = await query(
      `SELECT * FROM practitioner_faqs
       ${whereClause}
       ORDER BY category, display_order ASC`,
      [practitionerId]
    );

    return NextResponse.json({ faqs: result.rows });
  } catch (error) {
    console.error('[FAQ API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// POST - Create a new FAQ
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { practitionerId, question, answer, category, is_published } = body;

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID is required' },
        { status: 400 }
      );
    }

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // Get the max display_order for this category
    const orderResult = await query(
      `SELECT COALESCE(MAX(display_order), -1) + 1 as next_order
       FROM practitioner_faqs
       WHERE practitioner_id = $1 AND category = $2`,
      [practitionerId, category || 'general']
    );

    const displayOrder = orderResult.rows[0]?.next_order || 0;

    const result = await query(
      `INSERT INTO practitioner_faqs (
        practitioner_id, question, answer, category, display_order, is_published
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        practitionerId,
        question,
        answer,
        category || 'general',
        displayOrder,
        is_published ?? true,
      ]
    );

    return NextResponse.json({ faq: result.rows[0] });
  } catch (error) {
    console.error('[FAQ API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}
