// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { isValidReviewLensId, type ReviewLensId } from '@/lib/studio/reviewLens';

/**
 * GET /api/members/settings
 * Get member settings
 *
 * Authentication:
 *   - Primary: Session cookie (HttpOnly, secure)
 *   - Fallback: Query param memberId (legacy, will be deprecated)
 */
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    // Primary: Get identity from session cookie
    const session = await getCurrentSession();
    let memberId = session?.memberId ?? null;

    // Fallback: Query param for backward compatibility
    if (!memberId) {
      const searchParams = request.nextUrl.searchParams;
      memberId = searchParams.get('memberId');
    }

    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get or create settings
    let result = await query(
      `SELECT * FROM member_settings WHERE member_id = $1`,
      [memberId]
    );

    // Create settings if they don't exist
    if (result.rows.length === 0) {
      result = await query(
        `INSERT INTO member_settings (member_id)
         VALUES ($1)
         RETURNING *`,
        [memberId]
      );
    }

    const settings = result.rows[0];

    return NextResponse.json({
      // MAIA Interaction
      maia: {
        defaultMemoryMode: settings.default_memory_mode,
        voiceModel: settings.voice_model,
        voiceSpeed: parseFloat(settings.voice_speed),
        memoryDepth: settings.memory_depth,
        archetype: settings.archetype,
        conversationMode: settings.conversation_mode,
        preferredAssistantName: settings.preferred_assistant_name || 'MAIA',
      },
      // Notifications
      notifications: {
        weeklyDigest: settings.email_weekly_digest,
        breakthroughMoments: settings.email_breakthrough_moments,
        communityUpdates: settings.email_community_updates,
        productUpdates: settings.email_product_updates,
      },
      // Privacy
      privacy: {
        shareAnonymousInsights: settings.share_anonymous_insights,
        allowResearchParticipation: settings.allow_research_participation,
      },
      // Membership
      membership: {
        tier: settings.circle_tier,
        amount: settings.circle_amount,
        joinedAt: settings.circle_joined_at,
      },
      // Storage consent (server-authoritative)
      storageConsent: settings.storage_consent || {},
      // Practitioner review lens preferences
      preferredReviewLenses: (settings.preferred_review_lenses ?? []) as ReviewLensId[],
    });
  } catch (error) {
    console.error('[Settings API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/members/settings
 * Update member settings
 *
 * Authentication:
 *   - Primary: Session cookie (HttpOnly, secure)
 *   - Fallback: Body memberId (legacy, will be deprecated)
 */
export async function PUT(request: NextRequest) {
  try {
    // Primary: Get identity from session cookie
    const session = await getCurrentSession();
    let memberId = session?.memberId ?? null;

    const body = await request.json();
    const { memberId: bodyMemberId, ...updates } = body;

    // Fallback: Body memberId for backward compatibility
    if (!memberId && bodyMemberId) {
      memberId = bodyMemberId;
    }

    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Build dynamic update query
    const setClauses: string[] = [];
    const values: unknown[] = [memberId];
    let paramIndex = 2;

    // MAIA settings
    if (updates.defaultMemoryMode !== undefined) {
      setClauses.push(`default_memory_mode = $${paramIndex++}`);
      values.push(updates.defaultMemoryMode);
    }
    if (updates.voiceModel !== undefined) {
      setClauses.push(`voice_model = $${paramIndex++}`);
      values.push(updates.voiceModel);
    }
    if (updates.voiceSpeed !== undefined) {
      setClauses.push(`voice_speed = $${paramIndex++}`);
      values.push(updates.voiceSpeed);
    }
    if (updates.memoryDepth !== undefined) {
      setClauses.push(`memory_depth = $${paramIndex++}`);
      values.push(updates.memoryDepth);
    }
    if (updates.archetype !== undefined) {
      setClauses.push(`archetype = $${paramIndex++}`);
      values.push(updates.archetype);
    }
    if (updates.conversationMode !== undefined) {
      setClauses.push(`conversation_mode = $${paramIndex++}`);
      values.push(updates.conversationMode);
    }
    if (updates.preferredAssistantName !== undefined) {
      setClauses.push(`preferred_assistant_name = $${paramIndex++}`);
      values.push(updates.preferredAssistantName);
    }

    // Notification settings
    if (updates.emailWeeklyDigest !== undefined) {
      setClauses.push(`email_weekly_digest = $${paramIndex++}`);
      values.push(updates.emailWeeklyDigest);
    }
    if (updates.emailBreakthroughMoments !== undefined) {
      setClauses.push(`email_breakthrough_moments = $${paramIndex++}`);
      values.push(updates.emailBreakthroughMoments);
    }
    if (updates.emailCommunityUpdates !== undefined) {
      setClauses.push(`email_community_updates = $${paramIndex++}`);
      values.push(updates.emailCommunityUpdates);
    }
    if (updates.emailProductUpdates !== undefined) {
      setClauses.push(`email_product_updates = $${paramIndex++}`);
      values.push(updates.emailProductUpdates);
    }

    // Privacy settings
    if (updates.shareAnonymousInsights !== undefined) {
      setClauses.push(`share_anonymous_insights = $${paramIndex++}`);
      values.push(updates.shareAnonymousInsights);
    }
    if (updates.allowResearchParticipation !== undefined) {
      setClauses.push(`allow_research_participation = $${paramIndex++}`);
      values.push(updates.allowResearchParticipation);
    }

    // Membership
    if (updates.circleTier !== undefined) {
      setClauses.push(`circle_tier = $${paramIndex++}`);
      values.push(updates.circleTier);
    }
    if (updates.circleAmount !== undefined) {
      setClauses.push(`circle_amount = $${paramIndex++}`);
      values.push(updates.circleAmount);
    }

    // Practitioner review lens preferences
    if (updates.preferredReviewLenses !== undefined) {
      if (
        !Array.isArray(updates.preferredReviewLenses) ||
        updates.preferredReviewLenses.some((l: unknown) => typeof l !== 'string' || !isValidReviewLensId(l))
      ) {
        return NextResponse.json(
          { error: 'preferredReviewLenses must be an array of valid ReviewLensId values', code: 'INVALID_LENS_IDS' },
          { status: 400 },
        );
      }
      setClauses.push(`preferred_review_lenses = $${paramIndex++}`);
      values.push(updates.preferredReviewLenses);
    }

    // Storage consent (server-authoritative)
    // Uses dedicated UPSERT to ensure atomicity
    if (updates.storageConsent !== undefined) {
      // Handle consent separately with atomic UPSERT
      await query(
        `INSERT INTO member_settings (member_id, storage_consent)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (member_id)
         DO UPDATE SET storage_consent = COALESCE(member_settings.storage_consent, '{}'::jsonb) || EXCLUDED.storage_consent,
                       updated_at = NOW()`,
        [memberId, JSON.stringify(updates.storageConsent)]
      );
    }

    if (setClauses.length === 0 && updates.storageConsent === undefined) {
      return NextResponse.json(
        { error: 'No settings to update' },
        { status: 400 }
      );
    }

    // For non-consent settings, use two-step upsert
    if (setClauses.length > 0) {
      await query(
        `INSERT INTO member_settings (member_id)
         VALUES ($1)
         ON CONFLICT (member_id) DO NOTHING`,
        [memberId]
      );

      await query(
        `UPDATE member_settings
         SET ${setClauses.join(', ')}
         WHERE member_id = $1`,
        values
      );
    }

    // Fetch and return the updated settings
    const result = await query(
      `SELECT * FROM member_settings WHERE member_id = $1`,
      [memberId]
    );

    return NextResponse.json({
      success: true,
      settings: result.rows[0],
    });
  } catch (error) {
    console.error('[Settings API] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
