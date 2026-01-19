export const dynamic = 'force-static';
export async function generateStaticParams() { return [{ slug: 'default' }]; }

/**
 * PORTAL ARTICLES API
 *
 * Returns published articles/education content for the portal
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

    // Get published articles
    const articlesResult = await db.query(
      `SELECT
        id,
        title,
        slug,
        excerpt,
        cover_image_url,
        category,
        tags,
        reading_time_minutes,
        is_featured as featured,
        published_at
      FROM portal_articles
      WHERE practitioner_id = $1 AND is_published = true
      ORDER BY is_featured DESC, published_at DESC`,
      [practitionerId]
    );

    return NextResponse.json({ articles: articlesResult.rows });
  } catch (error) {
    console.error('Portal articles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
