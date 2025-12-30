/**
 * Phase 2K-a: Selflet Archive API
 *
 * Returns archived past-self messages for the archive drawer.
 * GET /api/selflet/archive?limit=25&cursor=...&userId=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { selfletChain } from '@/lib/memory/selflet/SelfletChain';

const IS_PROD = process.env.NODE_ENV === 'production';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '25', 10), 100);
    const cursor = searchParams.get('cursor') ?? undefined;
    const bodyUserId = searchParams.get('userId') ?? undefined;

    // Identity resolution (same pattern as action route)
    const devTrustBodyId = process.env.MAIA_DEV_TRUST_BODY_ID === '1';

    let effectiveUserId: string | null = null;

    // TODO: When auth is implemented, get userId from verified session
    // const authUserId = await getAuthenticatedUserId(req);
    // if (authUserId) effectiveUserId = authUserId;

    if (!effectiveUserId && !IS_PROD && devTrustBodyId && bodyUserId) {
      effectiveUserId = bodyUserId.trim();
    }

    if (!effectiveUserId) {
      return NextResponse.json(
        { ok: false, error: 'unauthorized' },
        { status: 401 }
      );
    }

    const result = await selfletChain.getArchivedMessagesForUser({
      userId: effectiveUserId,
      limit,
      cursor,
    });

    return NextResponse.json({
      ok: true,
      items: result.items.map((item) => ({
        id: item.id,
        messageType: item.messageType,
        title: item.title,
        content: item.content,
        relevanceThemes: item.relevanceThemes,
        createdAt: item.createdAt.toISOString(),
        archivedAt: item.archivedAt.toISOString(),
        archivedReason: item.archivedReason,
      })),
      nextCursor: result.nextCursor,
    });
  } catch (err) {
    console.error('[SELFLET] archive route error:', err);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
