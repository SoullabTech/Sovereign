export const dynamic = 'force-static';
export async function generateStaticParams() { return [{ slug: 'default', articleSlug: 'default' }]; }

/**
 * PORTAL SINGLE ARTICLE API
 *
 * Returns a single article by slug
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; articleSlug: string }> }
) {
  try {
    const { slug, articleSlug } = await params;

    // Get practitioner ID
    const practitionerResult = await db.query(
      `SELECT id FROM practitioners WHERE slug = $1 AND status = 'active'`,
      [slug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    const practitionerId = practitionerResult.rows[0].id;

    // Get article
    const articleResult = await db.query(
      `SELECT
        id,
        title,
        slug,
        excerpt,
        content,
        cover_image_url,
        category,
        tags,
        reading_time_minutes,
        published_at
      FROM portal_articles
      WHERE practitioner_id = $1 AND slug = $2 AND is_published = true`,
      [practitionerId, articleSlug]
    );

    if (articleResult.rows.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ article: articleResult.rows[0] });
  } catch (error) {
    console.error('Portal article error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
