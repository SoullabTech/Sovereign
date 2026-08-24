import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { unauthenticatedResponse } from '@/lib/auth/authFailure';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request)

  if (!memberId) {
    return unauthenticatedResponse()
  }

  const status = request.nextUrl.searchParams.get('status') || 'draft'

  try {
    const result = await query(
      `SELECT id, source_title, source_element, post_type, text, status, created_at, updated_at
       FROM content_posts
       WHERE member_id = $1 AND status = $2
       ORDER BY created_at DESC`,
      [memberId, status]
    )

    return NextResponse.json({ posts: result.rows })
  } catch (error) {
    console.error('[ContentPosts] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request)

  if (!memberId) {
    return unauthenticatedResponse()
  }

  try {
    const body = await request.json()
    const { sourceTitle, sourceElement, postType, text } = body

    if (!postType || !text) {
      return NextResponse.json({ error: 'postType and text required' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO content_posts (member_id, source_title, source_element, post_type, text, status)
       VALUES ($1, $2, $3, $4, $5, 'draft')
       RETURNING id, post_type, text, status, created_at`,
      [memberId, sourceTitle || null, sourceElement || null, postType, text]
    )

    return NextResponse.json({ post: result.rows[0] })
  } catch (error) {
    console.error('[ContentPosts] POST error:', error)
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request)

  if (!memberId) {
    return unauthenticatedResponse()
  }

  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 })
    }

    if (!['draft', 'approved', 'scheduled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const result = await query(
      `UPDATE content_posts
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND member_id = $3
       RETURNING id, post_type, text, status, updated_at`,
      [status, id, memberId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post: result.rows[0] })
  } catch (error) {
    console.error('[ContentPosts] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}
