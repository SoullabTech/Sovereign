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
 *   3. Returns the recipient link; optionally emails it via the
 *      practitioner's EmailRouter (Soullab-as-courier).
 *
 * Refusals: minors (guardian flow is a separate crossing — fails closed);
 * missing attestation; non-owner (store scoping → 404).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getOwnedPortraitBySlug, publishOwnedPortrait } from '@/lib/soulPortrait/portraitStore';
import { recordPortraitConsent } from '@/lib/soulPortrait/consentRecord';
import { isPortraitConsentLive } from '@/lib/soulPortrait/consentAccess';
import { EmailRouter } from '@/lib/comms/emailRouter';

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
  const subjectName: string = (published.immutableText as any)?.person?.name || 'Soul Portrait';

  let emailed = false;
  let emailError: string | undefined;
  const recipientEmail = typeof body.recipientEmail === 'string' ? body.recipientEmail.trim() : '';
  if (recipientEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return NextResponse.json({ error: 'invalid_recipient_email' }, { status: 400 });
    }
    const personalNote = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : '';
    const router = new EmailRouter(memberId);
    const result = await router.send(
      {
        to: recipientEmail,
        toName: typeof body.recipientName === 'string' ? body.recipientName.trim() || undefined : undefined,
        subject: `A Soul Portrait for ${subjectName}`,
        bodyText: [
          `A Soul Portrait has been prepared for ${subjectName}.`,
          `This portrait was created as a reflection and offering for you. There is no right way to engage it.`,
          personalNote ? `\n${personalNote}\n` : '',
          `Read it here, in your own time:\n${url}`,
          `\nThis link is private and unlisted — it was made for you.`,
        ].join('\n'),
        bodyHtml: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2a2a2a; line-height: 1.6;">
            <p>A Soul Portrait has been prepared for <strong>${escapeHtml(subjectName)}</strong>.</p>
            <p>This portrait was created as a reflection and offering for you. There is no right way to engage it.</p>
            ${personalNote ? `<blockquote style="border-left: 3px solid #C9A227; margin: 16px 0; padding: 4px 16px; color: #444;">${escapeHtml(personalNote)}</blockquote>` : ''}
            <p style="margin: 28px 0;">
              <a href="${url}" style="background: #1A2F24; color: #EAF2EC; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Read your Soul Portrait</a>
            </p>
            <p style="font-size: 13px; color: #777;">This link is private and unlisted — it was made for you.</p>
          </div>`,
      },
      { fromEmail: 'noreply@soullab.life', fromName: 'Soullab' },
    );
    emailed = result.success;
    if (!result.success) emailError = result.error;
  }

  return NextResponse.json({
    ok: true,
    url,
    path,
    slug: published.slug,
    publishedAt: published.publishedAt,
    emailed,
    ...(emailError ? { emailError } : {}),
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
