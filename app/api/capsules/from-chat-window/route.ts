export const dynamic = 'force-dynamic';

/**
 * POST /api/capsules/from-chat-window
 *
 * PREPARE a Keep from a chat window (last N turns). Distills the material and
 * returns an UNSAVED draft. This endpoint writes nothing.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * KEEP AUTHORITY CONTRACT (Kelly ruling 2026-08-28 — KEEP-OPEN-NONPERSISTENT-01)
 *
 *   OPEN KEEP     = UI/navigation act        = zero persistence
 *   PREPARE KEEP  = distill for preview      = ephemeral only, zero durable write
 *   CONFIRM KEEP  = explicit member action   = persistence permitted
 *
 * Recognition must never silently collapse into commitment. "MAIA may operate
 * the House. The member governs memory."
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT THIS ROUTE USED TO DO, AND WHY IT CHANGED:
 * Until 2026-08-28 this route distilled the window AND called createCapsule() —
 * an `INSERT INTO reflection_capsules` — in the same request. The Keep panel
 * calls it on OPEN, so a row landed before the member had seen, edited, or
 * confirmed anything. "Open a tool" and "commit something to memory" were
 * accidentally fused, which meant every path that could open Keep silently
 * exercised the member's consent authority. That is the defect this route no
 * longer contains.
 *
 * The write now lives behind the member's own gesture, at POST /api/capsules.
 *
 * NOTE ON REVERSIBILITY: `draft: true` did not make the old write harmless. A
 * draft row is still durable member material on disk, still subject to consent
 * and forgetting, and — before the Sanctuary source guard landed in the same
 * unit — was reachable from a Sanctuary session. Draft is a lifecycle state,
 * not an absence of persistence.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { memberRef } from '@/lib/privacy/memberRef';
import {
  CapsuleCreateFromChatWindowSchema,
  distillCapsuleFromChatWindow,
  generateSourceExcerpt,
} from '@/lib/capsules';

// Deliberately NOT imported: createCapsule. This route has no write authority.
// If a future change needs one here, it needs a ruling first — see the contract
// above and app/api/capsules/__tests__/keepOpenNonPersistent.test.ts.

export async function POST(request: NextRequest) {
  try {
    // Require authentication (uses same method as voice routes for consistency)
    const memberId = await getMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

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

    console.log(`[API] Distilling ${window.length} chat messages (preview — no write)...`);

    // Distill the chat window
    const distilled = await distillCapsuleFromChatWindow(window, windowSize, {
      existingTags: tags,
    });

    // Generate source excerpt
    const sourceExcerpt = generateSourceExcerpt(window, 1000);

    // The prepared draft. Deliberately carries NO id: there is no row. Anything
    // that needs an id needs the member to have confirmed first, and will fail
    // loudly here rather than appearing to have saved something.
    const draft = {
      sourceType: 'chat' as const,
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
      draft: true,
    };

    console.log(
      `[API] Prepared Keep draft from chat window for member ${memberRef(memberId)} — nothing persisted`
    );

    // 200, not 201: nothing was created.
    return NextResponse.json({ draft }, { status: 200 });
  } catch (error) {
    console.error('[API] POST /api/capsules/from-chat-window error:', error);
    return NextResponse.json(
      { error: 'Failed to prepare Keep from chat' },
      { status: 500 }
    );
  }
}
