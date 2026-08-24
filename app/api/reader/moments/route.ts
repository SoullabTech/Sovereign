import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { unauthenticatedResponse } from '@/lib/auth/authFailure';

export const dynamic = 'force-dynamic'

// GET reading moments for a member
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  const memberId = await getMemberIdFromRequest(request)
  const segmentId = request.nextUrl.searchParams.get('segmentId')
  const chapterId = request.nextUrl.searchParams.get('chapterId')

  if (!memberId) {
    return unauthenticatedResponse()
  }

  try {
    let sql = `
      SELECT rm.*, s.text as segment_text, s.segment_index
      FROM reading_moments rm
      JOIN audiobook_segments s ON s.id = rm.segment_id
      WHERE rm.member_id = $1
    `
    const params: (string | null)[] = [memberId]

    if (segmentId) {
      sql += ` AND rm.segment_id = $2`
      params.push(segmentId)
    } else if (chapterId) {
      sql += ` AND s.chapter_id = $2`
      params.push(chapterId)
    }

    sql += ` ORDER BY rm.created_at DESC`

    const result = await query(sql, params)
    return NextResponse.json({ moments: result.rows })
  } catch (error) {
    console.error('Error fetching reading moments:', error)
    return NextResponse.json({ error: 'Failed to fetch moments' }, { status: 500 })
  }
}

// POST create a new reading moment
export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request)

  if (!memberId) {
    return unauthenticatedResponse()
  }

  try {
    const body = await request.json()
    const { segmentId, momentType, content, ritualMode } = body

    if (!segmentId || !momentType) {
      return NextResponse.json({ error: 'segmentId and momentType required' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO reading_moments (member_id, segment_id, moment_type, content, ritual_mode)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [memberId, segmentId, momentType, content || null, ritualMode || null]
    )

    return NextResponse.json({ moment: result.rows[0] })
  } catch (error) {
    console.error('Error creating reading moment:', error)
    return NextResponse.json({ error: 'Failed to create moment' }, { status: 500 })
  }
}
