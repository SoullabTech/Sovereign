export const dynamic = 'force-dynamic';

/**
 * POST /api/soul-portrait/[slug]/send — practitioner (owner) only. Path B Gate 4.
 *
 * The send crossing: turns an owner's DRAFT into a delivered portrait a
 * non-member can receive.
 *   1. Requires the practitioner's explicit attestation that the subject
 *      consented (verbal/written) — consent is RECORDED, never inferred.
 *   2. Appends the consent event to the soul_portrait_consents ledger and
 *      publishes the row (write-once from then on).
 *   3. Returns an unlisted private link ONLY. Outbound email transport is
 *      held pending separately authorized, Resend-free delivery.
 *
 * Refusals: minors (guardian flow is a separate crossing — fails closed);
 * missing attestation; non-owner (store scoping → 404).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getOwnedPortraitBySlug, publishOwnedPortrait } from '@/lib/soulPortrait/portraitStore';
import { recordPortraitConsent } from '@/lib/soulPortrait/consentRecord';
import { isPortraitConsentLive } from '@/lib/soulPortrait/consentAccess';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://soullab.life';

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

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'invalid_delivery_request' }, { status: 400 });
  }
  // MAIL-05 HOLD: email and other delivery details cannot enter the legacy
  // Resend provider route. Reject before recording consent or publication.
  const unsupportedDelivery = ['recipientEmail', 'recipientName', 'message'].some(key =>
    body[key] != null && String(body[key]).trim() !== ''
  );
  if (unsupportedDelivery) {
    return NextResponse.json({
      error: 'email_delivery_held',
      message: 'Only private-link sharing is available. Create a link without contact details.',
    }, { status: 409, headers: { 'Cache-Control': 'private, no-store' } });
  }

  const portrait = await getOwnedPortraitBySlug(slug, memberId);
  if (!portrait) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Minor hard rule: the guardian consent flow is not wired for delivery — fail closed.
  if (portrait.subjectIsMinor || (portrait.immutableText as any)?.person?.isMinor) {
    return NextResponse.json(
      { error: 'Portraits of minors cannot be sent — guardian consent flow not yet available.' },
      { status: 403 },
    );
  }

  const alreadyLive = await isPortraitConsentLive(portrait.id);

  if (!alreadyLive) {
    // First send requires the attestation; a re-send of a live portrait does not.
    if (body.consentAttested !== true) {
      return NextResponse.json(
        { error: 'consent_attestation_required', message: 'Confirm the recipient has consented to receive this portrait.' },
        { status: 400 },
      );
    }
    const consentSource = body.consentSource === 'written' ? 'written' : 'verbal';
    const liveness = await recordPortraitConsent({
      portraitId: portrait.id,
      actorType: 'subject',
      actorMemberId: portrait.subjectMemberId,
      action: 'set',
      consentSource,
      flags: { portrait_read: true, recorded_by: memberId },
    });
    if (!liveness.live) {
      return NextResponse.json({ error: 'consent_not_live', reason: liveness.reason }, { status: 409 });
    }
  }

  const published = await publishOwnedPortrait(portrait.id, memberId);
  if (!published) return NextResponse.json({ error: 'publish_failed' }, { status: 500 });

  const path = `/soul-portrait/view/${published.slug}`;
  const url = `${BASE_URL}${path}`;
  // No outbound email, provider import, hidden retry or recipient contact
  // collection exists in the beta's private-link delivery path.

  return NextResponse.json({
    ok: true,
    url,
    path,
    slug: published.slug,
    publishedAt: published.publishedAt,
    emailed: false,
    delivery: 'private_link_only',
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}
