// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

/** Whitelist settings fields for export (exclude internal id) */
function pickSettingsForExport(row: Record<string, unknown>) {
  if (!row) return null;
  return {
    defaultMemoryMode: row.default_memory_mode,
    voiceModel: row.voice_model,
    voiceSpeed: row.voice_speed,
    memoryDepth: row.memory_depth,
    archetype: row.archetype,
    conversationMode: row.conversation_mode,
    preferredAssistantName: row.preferred_assistant_name,
    notifications: {
      weeklyDigest: row.email_weekly_digest,
      breakthroughMoments: row.email_breakthrough_moments,
      communityUpdates: row.email_community_updates,
      productUpdates: row.email_product_updates,
    },
    privacy: {
      shareAnonymousInsights: row.share_anonymous_insights,
      allowResearchParticipation: row.allow_research_participation,
    },
    membership: {
      tier: row.circle_tier,
      amount: row.circle_amount,
      joinedAt: row.circle_joined_at,
    },
    wisdomSystems: row.wisdom_systems,
    culturalLens: row.cultural_lens,
    storageConsent: row.storage_consent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * POST /api/members/export-data
 * Export all member data (GDPR compliance)
 *
 * Authentication: Session cookie required - exports only the authenticated member's data
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate via session - user can only export their own data
    const session = await getCurrentSession();
    const memberId = session?.memberId ?? null;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to export your data.' },
        { status: 401 }
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
      settings: pickSettingsForExport(settingsResult.rows[0]),
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
