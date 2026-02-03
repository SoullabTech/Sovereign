export const dynamic = 'force-dynamic';

/**
 * POST /api/capsules/from-text
 *
 * Create a capsule from raw text (journal entry, note, etc.)
 * Uses LLM distillation to extract the spirit.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  CapsuleCreateFromTextSchema,
  createCapsule,
  distillCapsuleFromText,
} from '@/lib/capsules';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const memberId = await requireMemberId();

    // Parse and validate body
    const body = await request.json();
    const parseResult = CapsuleCreateFromTextSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { sourceType, text, title, tags, signals, draft } = parseResult.data;

    // Distill the text into a capsule draft
    console.log(`[API] Distilling ${text.length} chars of ${sourceType}...`);
    const distilled = await distillCapsuleFromText(text, {
      sourceType,
      existingTags: tags,
    });

    // Create the capsule
    const capsule = await createCapsule({
      userId: memberId,
      sourceType,
      title: title || distilled.title,
      summary: distilled.summary,
      goldLines: distilled.goldLines,
      decisions: distilled.decisions,
      nextSteps: distilled.nextSteps,
      practices: distilled.practices,
      patterns: distilled.patterns,
      signals: signals || distilled.signals || null,
      tags: tags || distilled.tags || [],
      sourceExcerpt: text.length > 500 ? text.slice(0, 500) + '...' : text,
      draft: draft ?? true,
    });

    console.log(`[API] Created capsule ${capsule.id} for member ${memberId.slice(0, 8)}`);

    return NextResponse.json({ capsule }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[API] POST /api/capsules/from-text error:', error);
    return NextResponse.json(
      { error: 'Failed to create capsule' },
      { status: 500 }
    );
  }
}
