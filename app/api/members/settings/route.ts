// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';


import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

/**
 * GET /api/members/settings
 * Get member settings
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
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
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, ...updates } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
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

    if (setClauses.length === 0) {
      return NextResponse.json(
        { error: 'No settings to update' },
        { status: 400 }
      );
    }

    // Upsert: insert if not exists, update if exists
    await query(
      `INSERT INTO member_settings (member_id)
       VALUES ($1)
       ON CONFLICT (member_id) DO NOTHING`,
      [memberId]
    );

    const result = await query(
      `UPDATE member_settings
       SET ${setClauses.join(', ')}
       WHERE member_id = $1
       RETURNING *`,
      values
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
