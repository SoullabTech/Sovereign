export const dynamic = 'force-dynamic';

/**
 * Sacred Learning — Reflection API
 * POST /api/sacred-learning/reflection
 *
 * Saves a member's reflection linked to a passage.
 * Respects Sanctuary Mode: if sanctuary flag is present, returns success without storing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { saveReflection, upsertFormationState } from '@/lib/sacred-learning/sacredLearningService';
import { query } from '@/lib/db/postgres';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { passageId, themeId, text, sanctuary } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Reflection text is required' }, { status: 400 });
    }

    // Sanctuary Mode: acknowledge but do not store
    if (sanctuary) {
      return NextResponse.json({
        saved: false,
        sanctuary: true,
        message: 'Reflection received in sanctuary — not stored.',
      });
    }

    const reflection = await saveReflection(
      session.memberId,
      passageId || null,
      themeId || null,
      text.trim()
    );

    // Fire-and-forget: update formation count
    upsertFormationState(session.memberId, { reflectionsWritten: 1 });

    // Fire-and-forget: bridge to episodic_memories for MAIA resonance
    bridgeToEpisodicMemory(session.memberId, passageId, text.trim());

    return NextResponse.json({ saved: true, reflection });
  } catch (error) {
    console.error('[Sacred] Reflection save error:', error);
    return NextResponse.json(
      { error: 'Failed to save reflection' },
      { status: 500 }
    );
  }
}

/**
 * Fire-and-forget: bridge sacred reflection to episodic_memories
 * so MAIA's memory palace can recall it in future conversations.
 */
async function bridgeToEpisodicMemory(
  memberId: string,
  passageId: string | null,
  content: string
) {
  try {
    const firstLine = content.trim().split(/[\n.!?]/)[0].slice(0, 80);
    const title = `Sacred Reflection: ${firstLine}`;
    const episodeId = `sacred-${crypto.randomUUID()}`;

    await query(
      `INSERT INTO episodic_memories
        (user_id, episode_id, experience_title, experience_description,
         experience_context, significance, emotional_intensity,
         semantic_vector, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())`,
      [
        memberId,
        episodeId,
        title,
        content,
        passageId ? `sacred_reflection_${passageId}` : 'sacred_reflection',
        6, // significance: meaningful but not crisis-level
        0.5,
        '[]', // no vector embedding for now — text fallback works for resonance
      ]
    );

    console.log(`[Sacred→Memory] Bridged reflection → ${episodeId}`);
  } catch (err) {
    // Non-fatal: reflection save already succeeded
    console.error('[Sacred→Memory] Bridge failed (reflection still saved):', err);
  }
}
