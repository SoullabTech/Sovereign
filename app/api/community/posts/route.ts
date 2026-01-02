// app/api/community/posts/route.ts
/**
 * COMMUNITY POSTS API
 *
 * Full CRUD for community posts with search, filtering, and pagination.
 * Supports the tiered content system.
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

// GET - List/search posts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Pagination
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = (page - 1) * limit

  // Filters
  const territorySlug = searchParams.get('territory')
  const contentType = searchParams.get('type')
  const element = searchParams.get('element')
  const tradition = searchParams.get('tradition')
  const featured = searchParams.get('featured') === 'true'
  const pinned = searchParams.get('pinned') === 'true'

  // Search
  const searchQuery = searchParams.get('q')

  // Sorting
  const sortBy = searchParams.get('sort') || 'created_at'
  const sortOrder = searchParams.get('order') || 'desc'

  try {
    let whereConditions = ["p.status = 'published'"]
    let params: (string | number | boolean)[] = []
    let paramIndex = 1

    // Territory filter
    if (territorySlug) {
      whereConditions.push(`t.slug = $${paramIndex}`)
      params.push(territorySlug)
      paramIndex++
    }

    // Content type filter
    if (contentType) {
      whereConditions.push(`p.content_type = $${paramIndex}`)
      params.push(contentType)
      paramIndex++
    }

    // Element filter
    if (element) {
      whereConditions.push(`p.element = $${paramIndex}`)
      params.push(element)
      paramIndex++
    }

    // Tradition filter
    if (tradition) {
      whereConditions.push(`p.tradition = $${paramIndex}`)
      params.push(tradition)
      paramIndex++
    }

    // Featured filter
    if (featured) {
      whereConditions.push('p.is_featured = true')
    }

    // Pinned filter
    if (pinned) {
      whereConditions.push('p.is_pinned = true')
    }

    // Full-text search
    if (searchQuery && searchQuery.trim()) {
      whereConditions.push(`(
        p.title ILIKE $${paramIndex} OR
        p.content ILIKE $${paramIndex} OR
        p.excerpt ILIKE $${paramIndex} OR
        $${paramIndex + 1} = ANY(p.tags)
      )`)
      params.push(`%${searchQuery}%`)
      params.push(searchQuery.toLowerCase())
      paramIndex += 2
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : ''

    // Validate sort column
    const validSorts = ['created_at', 'heart_count', 'view_count', 'comment_count', 'updated_at']
    const sortColumn = validSorts.includes(sortBy) ? sortBy : 'created_at'
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC'

    // Count total
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM community_posts p
      LEFT JOIN community_territories t ON p.territory_id = t.id
      ${whereClause}
    `, params)
    const total = parseInt(countResult.rows[0].total)

    // Fetch posts
    const postsResult = await query(`
      SELECT
        p.*,
        t.slug as territory_slug,
        t.name as territory_name,
        t.icon as territory_icon
      FROM community_posts p
      LEFT JOIN community_territories t ON p.territory_id = t.id
      ${whereClause}
      ORDER BY p.is_pinned DESC, p.${sortColumn} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset])

    return NextResponse.json({
      ok: true,
      posts: postsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + postsResult.rows.length < total
      },
      filters: {
        territory: territorySlug,
        type: contentType,
        element,
        tradition,
        search: searchQuery
      }
    })

  } catch (err) {
    console.error('[Posts] GET error:', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST - Create new post
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userName = request.headers.get('x-user-name') || 'Anonymous'

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      content,
      territorySlug,
      contentType = 'discussion',
      tags = [],
      element,
      tradition
    } = body

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Get territory ID
    let territoryId = null
    if (territorySlug) {
      const territoryResult = await query(
        'SELECT id FROM community_territories WHERE slug = $1',
        [territorySlug]
      )
      if (territoryResult.rows.length > 0) {
        territoryId = territoryResult.rows[0].id
      }
    }

    // Generate excerpt
    const excerpt = content.substring(0, 200).replace(/[#*`]/g, '').trim() +
                   (content.length > 200 ? '...' : '')

    // Determine content tier based on type
    const tierMap: Record<string, number> = {
      'essay': 2,
      'review': 3,
      'practice_report': 3,
      'breakthrough': 3,
      'discussion': 4,
      'question': 4
    }
    const contentTier = tierMap[contentType] || 4

    // Create post
    const result = await query(`
      INSERT INTO community_posts (
        user_id, user_name, title, content, excerpt,
        territory_id, content_type, content_tier,
        tags, element, tradition, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `, [
      userId,
      userName,
      title.trim(),
      content.trim(),
      excerpt,
      territoryId,
      contentType,
      contentTier,
      tags,
      element || null,
      tradition || null
    ])

    return NextResponse.json({
      ok: true,
      post: result.rows[0]
    }, { status: 201 })

  } catch (err) {
    console.error('[Posts] POST error:', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
