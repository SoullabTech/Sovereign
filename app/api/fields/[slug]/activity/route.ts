import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getFieldBySlug } from '@/lib/masters/registry';

export const dynamic = 'force-dynamic';

// Kelly and Nathan slugs — for partner scope expansion
const PARTNER_SLUGS: Record<string, string> = {
  kelly: 'nathan',
  nathan: 'kelly',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!getFieldBySlug(slug)) {
    return NextResponse.json({ error: 'Field not found' }, { status: 404 });
  }

  const url = new URL(req.url);
  const scope = url.searchParams.get('scope');

  let slugs = [slug];
  if (scope === 'partner' && PARTNER_SLUGS[slug]) {
    slugs = [slug, PARTNER_SLUGS[slug]];
  }

  const placeholders = slugs.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await query(
    `SELECT
       a.id,
       a.field_slug,
       a.actor_id,
       a.event_type,
       a.payload,
       a.created_at,
       m.name AS actor_name
     FROM field_activity_log a
     LEFT JOIN members m ON m.id = a.actor_id
     WHERE a.field_slug IN (${placeholders})
     ORDER BY a.created_at DESC
     LIMIT 30`,
    slugs
  );

  return NextResponse.json({ events: rows });
}
