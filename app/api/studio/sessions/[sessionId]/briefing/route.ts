export const dynamic = 'force-dynamic';

/**
 * STUDIO SESSION BRIEFING
 *
 * GET: Returns a pre-session briefing payload for the session detail page.
 * Reuses the existing session prep engine from lib/practitioner/sessionPrep.ts
 * which queries practitioner_sessions for clinical history, themes, and insights.
 *
 * SOVEREIGNTY: This endpoint is fully local — no external AI calls.
 * The prep engine queries practitioner_sessions for relationship history.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getSessionPrep } from '@/lib/practitioner/sessionPrep';

async function getPractitionerId(): Promise<string | null> {
  const result = await db.query(
    'SELECT id FROM practitioners WHERE slug = $1',
    ['stellium']
  );
  return result.rows[0]?.id || null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    // Load the Studio session to get client_id
    const sessionRes = await db.query(
      `SELECT id, client_id, scheduled_start, status
       FROM sessions
       WHERE id = $1 AND practitioner_id = $2
       LIMIT 1`,
      [sessionId, practitionerId]
    );

    const session = sessionRes.rows[0];
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    if (!session.client_id) {
      return NextResponse.json(
        { success: false, error: 'No client linked to this session' },
        { status: 400 }
      );
    }

    // Reuse the existing prep engine — it queries practitioner_sessions
    // for clinical history, themes, insights, and flags
    const prep = await getSessionPrep(practitionerId, session.client_id);

    // Stable response shape: hasHistory is the canonical signal
    const hasHistory = !!prep?.last_session;

    // Early return for no history — stable contract
    if (!prep || !hasHistory) {
      return NextResponse.json({
        ok: true,
        hasHistory: false,
        message: 'First session with this client',
        note: 'No prior practitioner session history found yet.',
        briefing: null,
      });
    }

    // Shape the response for the UI — keep it focused on what matters
    // before the session, not the full clinical data dump
    const briefing = {
      client_name: prep.client?.name || prep.client?.preferred_name || null,

      last_session: prep.last_session
        ? {
            date: prep.last_session.date,
            type: prep.last_session.type,
            notes: prep.last_session.notes || null,
            themes: prep.last_session.themes || [],
            insights: prep.last_session.insights || [],
            days_ago: prep.last_session.days_ago,
          }
        : null,

      journey: {
        total_sessions: prep.journey?.total_sessions ?? 0,
        months_together: prep.journey?.months_together ?? 0,
        recurring_themes: prep.journey?.recurring_themes ?? [],
        stated_goals: prep.journey?.stated_goals || null,
      },

      flags: prep.flags ?? [],

      recent_sessions: prep.recent_sessions ?? [],

      message_digest: prep.message_digest
        ? {
            messages_since_last_session: prep.message_digest.messages_since_last_session,
            has_safety_concerns: prep.message_digest.has_safety_concerns,
            has_time_sensitive: prep.message_digest.has_time_sensitive,
            synthesis: prep.message_digest.synthesis || null,
          }
        : null,
    };

    return NextResponse.json({
      ok: true,
      hasHistory: true,
      message: null,
      note: null,
      briefing,
    });
  } catch (error) {
    console.error('[studio][briefing] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to build briefing' },
      { status: 500 }
    );
  }
}
