/**
 * POST /api/maia/session/start
 *
 * Called by the client when a new MAIA session begins.
 * Creates the maia_sessions row so finalize can safely reference it.
 *
 * Request body:
 *   sessionId: string      — Client-generated session ID (e.g., "session_1770727521118")
 *   memberId?: string      — Member UUID (optional, for guests)
 *   anonId?: string        — Anonymous ID (optional, fallback identifier)
 *   privacyMode?: string   — 'sanctuary' | 'standard' | 'full' (default: 'standard')
 *   maiaMode?: string      — 'normal' | 'patient' | 'scribe' (default: 'normal')
 *   voiceEnabled?: boolean — Whether voice is enabled (default: false)
 *
 * Idempotent: ON CONFLICT DO UPDATE (safe to call multiple times)
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'

const VALID_PRIVACY_MODES = ['sanctuary', 'standard', 'full'] as const
const VALID_MAIA_MODES = ['normal', 'patient', 'scribe'] as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      sessionId,
      memberId,
      anonId,
      privacyMode = 'standard',
      maiaMode = 'normal',
      voiceEnabled = false,
    } = body

    // Validation
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'sessionId required (string)' },
        { status: 400 }
      )
    }

    if (sessionId.length > 100) {
      return NextResponse.json(
        { ok: false, error: 'sessionId too long (max 100 chars)' },
        { status: 400 }
      )
    }

    // Normalize privacy mode
    const normalizedPrivacyMode = VALID_PRIVACY_MODES.includes(privacyMode)
      ? privacyMode
      : 'standard'

    // Derive mode from privacy (sanctuary privacy = sanctuary mode)
    const mode = normalizedPrivacyMode === 'sanctuary' ? 'sanctuary' : 'continuity'

    // Normalize maia mode
    const normalizedMaiaMode = VALID_MAIA_MODES.includes(maiaMode)
      ? maiaMode
      : 'normal'

    // Upsert the session (idempotent)
    const result = await query(
      `
      INSERT INTO maia_sessions (
        id, member_id, anon_id, privacy_mode, mode, maia_mode, voice_enabled,
        started_at, last_activity_at, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), 'active')
      ON CONFLICT (id) DO UPDATE SET
        last_activity_at = NOW(),
        member_id = COALESCE(EXCLUDED.member_id, maia_sessions.member_id),
        anon_id = COALESCE(EXCLUDED.anon_id, maia_sessions.anon_id),
        maia_mode = EXCLUDED.maia_mode,
        voice_enabled = EXCLUDED.voice_enabled
      RETURNING id, started_at, status
      `,
      [
        sessionId,
        memberId || null,
        anonId || null,
        normalizedPrivacyMode,
        mode,
        normalizedMaiaMode,
        voiceEnabled,
      ]
    )

    const session = result.rows[0]

    console.log(`[session/start] Session ${sessionId} registered (member: ${memberId || 'guest'})`)

    return NextResponse.json({
      ok: true,
      sessionId: session.id,
      startedAt: session.started_at,
      status: session.status,
    })

  } catch (error) {
    console.error('[session/start] Error:', error)

    // Handle table doesn't exist error gracefully
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json({
        ok: false,
        error: 'Session table not yet migrated. Run database migrations.',
        code: 'MIGRATION_NEEDED',
      }, { status: 503 })
    }

    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
