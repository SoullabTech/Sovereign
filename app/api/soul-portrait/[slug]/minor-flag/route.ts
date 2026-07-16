export const dynamic = 'force-dynamic';

/**
 * POST /api/soul-portrait/[slug]/minor-flag — practitioner (owner) only.
 *
 * Correction surface for an accidentally ticked (or missed) "Subject is a
 * minor" checkbox at generation. Exists because the flag is otherwise
 * invisible on the preview until the send API refuses with 403 — which
 * happened in production (2026-07-16, an elder's portrait, corrected by SQL).
 *
 * Refusals:
 *   · non-owner / unknown slug — store scoping → 404 (never leaks)
 *   · published portrait — 409; published portraits are write-once (Gate 2).
 *     A wrongly-flagged published portrait is regenerated, not edited.
 *
 * This route only corrects the RECORD of who the portrait is about. The send
 * route's minor → guardian-consent refusal is untouched and stays in force.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getOwnedPortraitBySlug, setOwnedDraftMinorFlag } from '@/lib/soulPortrait/portraitStore';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (typeof body.isMinor !== 'boolean') {
    return NextResponse.json({ error: 'isMinor_boolean_required' }, { status: 400 });
  }

  const portrait = await getOwnedPortraitBySlug(slug, memberId);
  if (!portrait) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (portrait.publishedAt) {
    return NextResponse.json(
      { error: 'published_write_once', message: 'This portrait has been published and is write-once. To change who it is about, regenerate it.' },
      { status: 409 },
    );
  }

  const updated = await setOwnedDraftMinorFlag(portrait.id, memberId, body.isMinor);
  if (!updated) return NextResponse.json({ error: 'update_failed' }, { status: 500 });

  console.log('[SoulPortrait] minor-flag corrected', {
    portraitId: updated.id,
    memberIdPrefix: memberId.slice(0, 8),
    isMinor: updated.subjectIsMinor,
  });

  return NextResponse.json({ ok: true, subjectIsMinor: updated.subjectIsMinor });
}
