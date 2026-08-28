export const dynamic = 'force-dynamic';

/**
 * GET  /api/capsules — list capsules for the authenticated member.
 *                      Query params: q, archived, pinned, draft, tag, limit, cursor
 * POST /api/capsules — CONFIRM KEEP. The member-confirmed write.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * KEEP AUTHORITY CONTRACT (Kelly ruling 2026-08-28)
 *
 *   OPEN KEEP     = UI/navigation act        = zero persistence
 *   PREPARE KEEP  = distill for preview      = ephemeral only, zero durable write
 *   CONFIRM KEEP  = explicit member action   = persistence permitted  ← POST here
 *
 * This POST is the Keep flow's only write seam. /api/capsules/from-chat-window
 * prepares a draft and writes nothing; the member reviews and edits it; landing
 * here is their governing gesture. "MAIA may operate the House. The member
 * governs memory."
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  listCapsules,
  createCapsule,
  CapsuleListQuerySchema,
  CapsuleCreateSchema,
} from '@/lib/capsules';
import { memberRef } from '@/lib/privacy/memberRef';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const memberId = await requireMemberId();

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const rawQuery = {
      q: searchParams.get('q') || undefined,
      archived: searchParams.get('archived') === 'true' ? true : searchParams.get('archived') === 'false' ? false : undefined,
      pinned: searchParams.get('pinned') === 'true' ? true : searchParams.get('pinned') === 'false' ? false : undefined,
      draft: searchParams.get('draft') === 'true' ? true : searchParams.get('draft') === 'false' ? false : undefined,
      tag: searchParams.get('tag') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
      cursor: searchParams.get('cursor') || undefined,
    };

    // Validate query params
    const parseResult = CapsuleListQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    // Fetch capsules
    const result = await listCapsules({
      userId: memberId,
      query: parseResult.data,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[API] GET /api/capsules error:', error);
    return NextResponse.json(
      { error: 'Failed to list capsules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const memberId = await requireMemberId();

    const body = await request.json();
    const parseResult = CapsuleCreateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    // What the member confirmed is what gets written. Nothing is re-distilled
    // or re-interpreted here — a Keep must not become a different Keep between
    // the preview they approved and the row on disk.
    const capsule = await createCapsule({
      userId: memberId,
      ...parseResult.data,
    });

    console.log(
      `[API] Keep confirmed — capsule ${capsule.id} created for member ${memberRef(memberId)}`
    );

    return NextResponse.json({ capsule }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[API] POST /api/capsules error:', error);
    return NextResponse.json(
      { error: 'Failed to create capsule' },
      { status: 500 }
    );
  }
}
