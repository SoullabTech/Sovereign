/**
 * Voice Session Metrics API
 *
 * Exposes tuning metrics and red flags for the relational stack.
 * Use this for debugging, tuning dashboards, and threshold optimization.
 *
 * GET /api/voice/session-metrics?sessionId=<id>
 * GET /api/voice/session-metrics (returns all active sessions)
 */

import { NextRequest } from 'next/server'
import {
  getVoiceSessionById,
  getActiveSessionIds,
  getSessionMetrics,
  getRelationalRedFlags,
} from '@/lib/voice/moshi/MoshiSessionManager'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')

  // If no sessionId provided, return list of active sessions
  if (!sessionId) {
    const activeIds = getActiveSessionIds()
    return Response.json({
      activeSessions: activeIds.length,
      sessionIds: activeIds,
    })
  }

  // Get specific session metrics
  const session = getVoiceSessionById(sessionId)
  if (!session) {
    return Response.json(
      { error: 'Session not found or expired', sessionId },
      { status: 404 }
    )
  }

  const metrics = getSessionMetrics(session)
  const redFlags = getRelationalRedFlags(session)

  return Response.json({
    metrics,
    redFlags,
    timestamp: Date.now(),
  })
}
