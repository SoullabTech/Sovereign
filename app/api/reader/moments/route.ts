import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest'
import { unauthenticatedResponse } from '@/lib/auth/authFailure'
import {
  presentReadingMoment,
  readerMomentType,
  readerRitualMode,
  readerText,
  readerUuid,
  type ReadingMomentRow,
} from '@/lib/reader/readerValidation'

export const dynamic = 'force-dynamic'

// GET reading moments for the verified member. Caller-supplied member identity
// is never accepted; ownership comes only from getMemberIdFromRequest().
export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true })
  }
  const memberId = await getMemberIdFromRequest(request)
  if (!memberId) return unauthenticatedResponse()

  const rawSegmentId = request.nextUrl.searchParams.get('segmentId')
  const rawChapterId = request.nextUrl.searchParams.get('chapterId')
  const segmentId = rawSegmentId ? readerUuid(rawSegmentId) : null
  const chapterId = rawChapterId ? readerUuid(rawChapterId) : null
  if ((rawSegmentId && !segmentId) || (rawChapterId && !chapterId)) {
    return NextResponse.json({ error: 'Invalid Reader identifier' }, { status: 400 })
  }

  try {
    let sql = `
      SELECT rm.*, s.text as segment_text, s.segment_index
      FROM reading_moments rm
      JOIN audiobook_segments s ON s.id = rm.segment_id
      WHERE rm.member_id = $1
    `
    const params: string[] = [memberId]

    if (segmentId) {
      sql += ` AND rm.segment_id = $2`
      params.push(segmentId)
    } else if (chapterId) {
      sql += ` AND s.chapter_id = $2`
      params.push(chapterId)
    }

    sql += ` ORDER BY rm.created_at DESC`
    const result = await query<ReadingMomentRow>(sql, params)
    return NextResponse.json({ moments: result.rows.map(presentReadingMoment) })
  } catch (error) {
    console.error('Error fetching reading moments:', error)
    return NextResponse.json({ error: 'Failed to fetch moments' }, { status: 500 })
  }
}

// POST creates a member-owned moment against an admitted audiobook segment.
export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request)
  if (!memberId) return unauthenticatedResponse()

  try {
    const body = await request.json() as Record<string, unknown>
    const segmentId = readerUuid(body.segmentId)
    const momentType = readerMomentType(body.momentType)
    const ritualMode = readerRitualMode(body.ritualMode)
    const content = body.content == null ? null : readerText(body.content, 10_000)

    if (!segmentId || !momentType) {
      return NextResponse.json({ error: 'Valid segmentId and momentType required' }, { status: 400 })
    }
    if (body.ritualMode != null && body.ritualMode !== '' && !ritualMode) {
      return NextResponse.json({ error: 'Invalid ritualMode' }, { status: 400 })
    }
    if (body.content != null && content == null) {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }

    const result = await query<ReadingMomentRow>(
      `INSERT INTO reading_moments (member_id, segment_id, moment_type, content, ritual_mode)
       SELECT $1, s.id, $3, $4, $5
         FROM audiobook_segments s
        WHERE s.id = $2
       RETURNING *`,
      [memberId, segmentId, momentType, content, ritualMode]
    )
    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }

    return NextResponse.json({ moment: presentReadingMoment(result.rows[0]) })
  } catch (error) {
    console.error('Error creating reading moment:', error)
    return NextResponse.json({ error: 'Failed to create moment' }, { status: 500 })
  }
}
