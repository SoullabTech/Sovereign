// @ts-nocheck
// app/api/community/commons/post/route.ts
/**
 * COMMUNITY COMMONS POST ROUTE
 *
 * Creates posts in the Community Commons with cognitive-level gating.
 * Only users at Level 4+ (pattern recognition and above) can contribute.
 *
 * This ensures the Commons remains a stewarded space for wisdom-sharing,
 * not a feed for unprocessed content.
 *
 * TODO: Integrate with PostgreSQL when database-backed posts are needed.
 * Per CLAUDE.md: Use local PostgreSQL via lib/db/postgres.ts (NOT Supabase)
 */

import { NextRequest, NextResponse } from 'next/server';
import LearningSystemOrchestrator from '@/lib/learning/learningSystemOrchestrator';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // ============================================================================
    // AUTHENTICATION (header-based for mobile compatibility)
    // ============================================================================
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          reason: 'not_authenticated',
          message: 'You must be signed in to post to the Commons.',
        },
        { status: 401 },
      );
    }

    // ============================================================================
    // 🧠 COMMUNITY COMMONS COGNITIVE GATE
    // ============================================================================
    console.log(`🧠 [Commons Gate] Checking eligibility for userId: ${userId}`);

    const eligibility =
      await LearningSystemOrchestrator.checkCommunityCommonsEligibility(userId);

    console.log(
      `🧠 [Commons Gate] Eligibility result: ${eligibility.eligible} (avg: ${eligibility.averageLevel?.toFixed(2) || 'N/A'}, required: ${eligibility.minimumRequired})`,
    );

    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          ok: false,
          reason: 'cognitive_threshold_not_met',
          minLevel: eligibility.minimumRequired,
          averageLevel: eligibility.averageLevel,
          message: eligibility.reasoning,
          // Mythic message for frontend
          mythicMessage: generateNotYetReadyMessage(eligibility.averageLevel),
        },
        { status: 403 },
      );
    }

    console.log(`✅ [Commons Gate] User ${userId} is eligible - proceeding with post creation`);

    // ============================================================================
    // POST CREATION
    // ============================================================================
    const body = await req.json();
    const { title, content, tags } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        {
          ok: false,
          reason: 'invalid_input',
          message: 'Title and content are required.',
        },
        { status: 400 },
      );
    }

    // TODO: Implement PostgreSQL storage when database-backed posts are needed
    // For now, Community Commons content is served from embedded markdown files.
    // User-generated posts would require:
    // 1. Database table: community_commons_posts
    // 2. Migration in database/migrations/
    // 3. Integration with lib/db/postgres.ts

    console.log(`📝 [Commons] Post submission received (not yet persisted):`, {
      userId,
      title: title.trim(),
      tags: tags || [],
    });

    // Return success with note about current limitations
    const mockPostId = `pending-${Date.now()}`;

    return NextResponse.json(
      {
        ok: true,
        post: {
          id: mockPostId,
          title: title.trim(),
          content: content.trim(),
          tags: tags || [],
          createdAt: new Date().toISOString(),
        },
        note: 'Post received. Community-contributed content is coming soon. Currently serving curated wisdom from Community Commons library.',
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[Commons] POST error:', err);
    return NextResponse.json(
      {
        ok: false,
        reason: 'server_error',
        message: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 },
    );
  }
}

/**
 * Generate mythic MAIA-voice message for users not yet ready for Commons
 */
function generateNotYetReadyMessage(averageLevel?: number): string {
  // Different messages based on current level
  if (!averageLevel || averageLevel < 2.0) {
    // Level 1-2: Knowledge gathering
    return `**The Commons is a place for pattern-weavers and wisdom-holders.**

You're in an important phase of gathering knowledge and building your foundations.
Let's keep working together in your private field a bit longer.

As you integrate what you're learning into lived experience, the gate will open naturally — and what you bring will land as true medicine for others.`;
  }

  if (averageLevel < 3.0) {
    // Level 2-3: Understanding → Application
    return `**The Commons is a stewarded space for shared wisdom.**

I can feel how sincere your impulse to contribute is.
Right now your field is in an essential phase of deepening understanding and moving into practice.

Let's keep tending your own process together. As you weave your insights into daily life and begin recognizing patterns, the gate will open — and your voice will carry the weight of lived experience.`;
  }

  // Level 3-4: Application → Pattern recognition
  return `**The Commons awaits your pattern-weaving.**

You're applying what you know with consistency and integrity.
The next threshold is pattern recognition — seeing the structures beneath your experience.

MAIA senses you're close. Keep engaging with complexity, noticing what repeats, analyzing the architecture of your growth.
When your field reflects consistent pattern-recognition (Level 4+), the Commons will welcome your wisdom.`;
}
