export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

/**
 * POST /api/members/export-data
 * Export all member data (GDPR compliance)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
      );
    }

    // Fetch all member data
    const [
      memberResult,
      settingsResult,
      sessionsResult,
      memoriesResult,
      googleResult,
    ] = await Promise.all([
      // Basic profile
      query(
        `SELECT id, username, name, email, passkey, bio, timezone,
                onboarded, created_at, last_sign_in
         FROM members WHERE id = $1`,
        [memberId]
      ),
      // Settings
      query(
        `SELECT * FROM member_settings WHERE member_id = $1`,
        [memberId]
      ),
      // Session history
      query(
        `SELECT id, started_at, ended_at, mode, message_count, summary
         FROM member_sessions
         WHERE member_id = $1
         ORDER BY started_at DESC`,
        [memberId]
      ),
      // Developmental memories (if exists)
      query(
        `SELECT id, facet_code, event_type, cognitive_level, intensity,
                content, vector_embedding IS NOT NULL as has_embedding,
                created_at
         FROM developmental_memories
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [memberId]
      ).catch(() => ({ rows: [] })), // Table might not exist
      // Google credentials (sanitized)
      query(
        `SELECT user_id, created_at, updated_at
         FROM google_calendar_credentials
         WHERE user_id = $1`,
        [memberId]
      ).catch(() => ({ rows: [] })),
    ]);

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: memberResult.rows[0],
      settings: settingsResult.rows[0] || null,
      sessions: sessionsResult.rows,
      memories: memoriesResult.rows,
      connectedServices: {
        google: googleResult.rows.length > 0
          ? { connected: true, connectedAt: googleResult.rows[0].created_at }
          : { connected: false },
      },
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="maia-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('[Export API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
