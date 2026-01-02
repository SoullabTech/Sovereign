// app/api/community/territories/route.ts
/**
 * COMMUNITY TERRITORIES API
 *
 * Returns the organic territory structure for Community Commons.
 * Territories follow the universal wisdom journey flow.
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const parentSlug = searchParams.get('parent')
  const includeChildren = searchParams.get('children') === 'true'

  try {
    let territories

    if (parentSlug) {
      // Get children of a specific territory
      const result = await query(`
        SELECT t.*, p.slug as parent_slug, p.name as parent_name,
               t.is_technical, t.section
        FROM community_territories t
        LEFT JOIN community_territories p ON t.parent_id = p.id
        WHERE p.slug = $1
        ORDER BY t.sort_order
      `, [parentSlug])
      territories = result.rows
    } else if (includeChildren) {
      // Get all territories with hierarchy
      const result = await query(`
        SELECT
          t.*,
          p.slug as parent_slug,
          p.name as parent_name,
          t.is_technical,
          t.section,
          (SELECT COUNT(*) FROM community_posts WHERE territory_id = t.id) as post_count
        FROM community_territories t
        LEFT JOIN community_territories p ON t.parent_id = p.id
        ORDER BY COALESCE(p.sort_order, t.sort_order), t.sort_order
      `)
      territories = result.rows
    } else {
      // Get only root territories
      const result = await query(`
        SELECT
          t.*,
          t.is_technical,
          t.section,
          (SELECT COUNT(*) FROM community_territories WHERE parent_id = t.id) as child_count,
          (SELECT COALESCE(SUM(post_count), 0) FROM community_territories WHERE parent_id = t.id OR id = t.id) as total_posts
        FROM community_territories t
        WHERE t.parent_id IS NULL
        ORDER BY t.sort_order
      `)
      territories = result.rows
    }

    return NextResponse.json({
      ok: true,
      territories,
      count: territories.length
    })

  } catch (err) {
    console.error('[Territories] GET error:', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch territories' },
      { status: 500 }
    )
  }
}
