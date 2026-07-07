export const dynamic = 'force-dynamic';

/**
 * GET /api/soul-portrait/mine — the authenticated practitioner's OWN portrait drafts.
 *
 * Powers the Studio "Your Soul Portraits" index (the pilot's Return surface). Owner-scoped:
 * listOwnedPortraitsWithSubject filters by owner_member_id, so this can only ever return
 * the caller's own portraits. Records nothing. Delivers nothing. Not a client path — the
 * subject never reaches this route; only the owning practitioner does.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listOwnedPortraitsWithSubject } from '@/lib/soulPortrait/portraitStore';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const portraits = await listOwnedPortraitsWithSubject(memberId);
  return NextResponse.json({
    portraits: portraits.map((p) => ({
      id: p.id,
      slug: p.slug,
      subjectName: p.subjectName,
      subjectPersonId: p.subjectPersonId,
      portraitKind: p.portraitKind,
      consentState: p.consentState,
      published: p.publishedAt != null,
      createdAt: p.createdAt,
      previewUrl: `/soul-portrait/preview/${p.id}`,
    })),
  });
}
