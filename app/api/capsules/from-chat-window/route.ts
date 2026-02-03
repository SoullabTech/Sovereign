export const dynamic = 'force-dynamic';

/**
 * POST /api/capsules/from-chat-window
 *
 * Create a capsule from a chat window (last N turns).
 * Primary endpoint for "Capture the Spirit" action in chat UI.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  CapsuleCreateFromChatWindowSchema,
  createCapsule,
  distillCapsuleFromChatWindow,
  generateSourceExcerpt,
} from '@/lib/capsules';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const memberId = await requireMemberId();

    // Parse and validate body
    const body = await request.json();
    const parseResult = CapsuleCreateFromChatWindowSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { messages, windowSize, title, tags, signals, sourceId } = parseResult.data;

    // Take last N messages
    const window = messages.slice(-(windowSize || 16));

    console.log(`[API] Distilling ${window.length} chat messages...`);

    // Distill the chat window
    const distilled = await distillCapsuleFromChatWindow(window, windowSize, {
      existingTags: tags,
    });

    // Generate source excerpt
    const sourceExcerpt = generateSourceExcerpt(window, 1000);

    // Create the capsule
    const capsule = await createCapsule({
      userId: memberId,
      sourceType: 'chat',
      sourceId: sourceId || null,
      title: title || distilled.title,
      summary: distilled.summary,
      goldLines: distilled.goldLines,
      decisions: distilled.decisions,
      nextSteps: distilled.nextSteps,
      practices: distilled.practices,
      patterns: distilled.patterns,
      signals: signals || distilled.signals || null,
      tags: tags || distilled.tags || [],
      sourceExcerpt,
      draft: true, // Chat captures always start as drafts
    });

    console.log(`[API] Created capsule ${capsule.id} from chat window for member ${memberId.slice(0, 8)}`);

    return NextResponse.json({ capsule }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[API] POST /api/capsules/from-chat-window error:', error);
    return NextResponse.json(
      { error: 'Failed to create capsule from chat' },
      { status: 500 }
    );
  }
}
