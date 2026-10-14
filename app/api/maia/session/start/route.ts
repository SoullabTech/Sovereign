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
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest'

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

    // MAIA session ownership is authoritative only when backed by a valid,
    // revocable HttpOnly auth session. A raw body.memberId is a CLAIM, never
    // a credential. Ordinary guest sessions remain guest-owned (NULL member).
    // The shared resolver verifies either the HttpOnly web cookie or an
    // x-session-token against non-revoked auth_sessions (Safari/iOS fallback).
    // Neither body.memberId nor a bare x-member-id is an authority.
    const verifiedMemberId = await getMemberIdFromRequest(request)
    const claimedMember = memberId === undefined || memberId === null || memberId === ''
      ? null : memberId
    if (claimedMember !== null && typeof claimedMember !== 'string') {
      return NextResponse.json({ ok: false, error: 'Invalid member claim' }, { status: 400 })
    }
    if (claimedMember && !verifiedMemberId) {
      return NextResponse.json({ ok: false, error: 'Authenticated member session required' }, { status: 401 })
    }
    if (claimedMember && verifiedMemberId !== claimedMember) {
      return NextResponse.json({ ok: false, error: 'Member claim mismatch' }, { status: 403 })
    }
    if (anonId !== undefined && anonId !== null &&
        (typeof anonId !== 'string' || anonId.length > 128)) {
      return NextResponse.json({ ok: false, error: 'Invalid guest identifier' }, { status: 400 })
    }
    const guestAnonId = verifiedMemberId ? null : typeof anonId === 'string' ? anonId || null : null

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
        maia_mode = EXCLUDED.maia_mode,
        voice_enabled = EXCLUDED.voice_enabled
      WHERE maia_sessions.member_id IS NOT DISTINCT FROM EXCLUDED.member_id
        AND maia_sessions.anon_id IS NOT DISTINCT FROM EXCLUDED.anon_id
      RETURNING id, started_at, status
      `,
      [
        sessionId,
        verifiedMemberId,
        guestAnonId,
        normalizedPrivacyMode,
        mode,
        normalizedMaiaMode,
        voiceEnabled,
      ]
    )

    const session = result.rows[0]
    if (!session) {
      // A client-chosen ID can collide with a different member or guest.
      // Never reassign an existing session's attribution on that collision.
      return NextResponse.json({ ok: false, error: 'Session ownership conflict' }, { status: 409 })
    }

    console.log(`[session/start] Session ${sessionId} registered (member: ${verifiedMemberId ? 'verified' : 'guest'})`)

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
