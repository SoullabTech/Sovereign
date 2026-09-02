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
      // Developmental memories.
      //
      // P1 (MIPA Phase 0) — THIS QUERY NAMED FIVE COLUMNS THAT DO NOT EXIST.
      //
      // `event_type`, `cognitive_level`, `intensity`, `content` and
      // `created_at` are not columns of `developmental_memories`; the real ones
      // are `memory_type`, `significance`, `content_text` and `formed_at`. The
      // query therefore threw on every call — and a `.catch(() => ({ rows: [] }))`
      // written for a MISSING TABLE silently swallowed a BROKEN QUERY.
      //
      // The member downloaded a file named `maia-data-export-<date>.json`
      // containing `"memories": []`, with no way to tell that the section was
      // empty because the query failed rather than because they had none. An
      // export that silently omits is worse than one that openly does not
      // cover: the first is a false claim about the member's own record.
      //
      // Columns corrected below, and the blanket catch replaced by one that
      // SURFACES the failure into the payload (see `memoriesError`). A section
      // may be empty; it may never be silently empty.
      query(
        `SELECT id, memory_type, facet_code, significance, content_text,
                entity_tags, confirmed_by_user, recall_count,
                vector_embedding IS NOT NULL as has_embedding,
                valid_from, valid_to, formed_at
         FROM developmental_memories
         WHERE user_id = $1
         ORDER BY formed_at DESC`,
        [memberId]
      ).catch((err: unknown) => {
        console.error('[Export API] developmental_memories query failed:', err);
        return { rows: null as unknown as Record<string, unknown>[] };
      }),
      // Google credentials (sanitized).
      //
      // P1 — the same silent-failure pattern, smaller blast radius but a worse
      // shape: this section renders `connected: false`, so a failed query does
      // not merely omit — it makes a FALSE STATEMENT about the member's account.
      // The table and all three columns exist, so the old catch guarded nothing
      // real while standing ready to convert any failure into a wrong answer.
      query(
        `SELECT user_id, created_at, updated_at
         FROM google_calendar_credentials
         WHERE user_id = $1`,
        [memberId]
      ).catch((err: unknown) => {
        console.error('[Export API] google_calendar_credentials query failed:', err);
        return { rows: null as unknown as Record<string, unknown>[] };
      }),
    ]);

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: memberResult.rows[0],
      settings: pickSettingsForExport(settingsResult.rows[0]),
      sessions: sessionsResult.rows,
      // P1 — `null` rows means the query FAILED, which is reported rather than
      // rendered as an empty section. `[]` means the member genuinely has none.
      memories: memoriesResult.rows ?? [],
      ...(memoriesResult.rows === null
        ? {
            memoriesError:
              'This section could not be read and is INCOMPLETE. It is not empty because you have no developmental memories — the export failed to retrieve them. Please report this.',
          }
        : {}),
      connectedServices: {
        // P1 — three states, not two. "unknown" is the honest answer when the
        // read failed; reporting `connected: false` would assert something the
        // export does not know.
        google:
          googleResult.rows === null
            ? {
                connected: 'unknown' as const,
                error:
                  'This could not be read. It does NOT mean the service is disconnected — the export failed to check. Please report this.',
              }
            : googleResult.rows.length > 0
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
