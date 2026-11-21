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
import { sendEmail, SENDERS } from '@/lib/email/sendEmail';

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

  // F4: an established portrait's consent to be read is not blanket consent
  // to forward its private link to arbitrary new addresses. The recipient
  // must be explicitly named and freshly attested on EVERY email crossing.
  // Do this before publication or any new consent ledger writes.
  const recipientEmail = typeof body.recipientEmail === 'string'
    ? body.recipientEmail.trim().toLowerCase() : '';
  if (recipientEmail) {
    if (!/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(recipientEmail)) {
      return NextResponse.json({ error: 'invalid_recipient_email' }, { status: 400 });
    }
    if (body.recipientConsentAttested !== true) {
      return NextResponse.json(
        { error: 'recipient_consent_attestation_required',
          message: 'Confirm that this exact recipient agreed to receive the private link.' },
        { status: 400 }
      );
    }
    if (body.subjectShareAttested !== true) {
      return NextResponse.json(
        { error: 'subject_sharing_attestation_required',
          message: 'Confirm the portrait subject authorized sharing with this exact recipient.' },
        { status: 400 }
      );
    }

  }

  const alreadyLive = await isPortraitConsentLive(portrait.id);
  // Published portrait consent cannot be resurrected by a new send gesture.
  // Fresh consent after revocation requires its own governed subject flow.
  if (!alreadyLive && portrait.publishedAt) {
    return NextResponse.json({
      error: 'subject_consent_not_live',
      message: "The portrait subject’s governing consent is not live.",
    }, { status: 409 });
  }

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

  // The SMTP reservation records recipient-specific attestation atomically,
  // immediately before contacting the provider. No separate speculative audit.
  const published = await publishOwnedPortrait(portrait.id, memberId);
  if (!published) return NextResponse.json({ error: 'publish_failed' }, { status: 500 });

  const path = `/soul-portrait/view/${published.slug}`;
  const url = `${BASE_URL}${path}`;
  // No newline/header control characters from authored portrait fields.
  const subjectName: string = String(
    (published.immutableText as any)?.person?.name || 'Soul Portrait'
  ).replace(/[\r\n]/g, ' ').slice(0, 160);

  let emailed = false;
  let emailError: string | undefined;
  if (recipientEmail) {
    const personalNote = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : '';
    const result = await sendEmail({
      purpose: 'soul-portrait:delivery',
      from: SENDERS.noreply,
      to: recipientEmail, // raw single mailbox, never a display-name wrapper
      subject: `A Soul Portrait for ${subjectName}`,
      text: [
        `A Soul Portrait has been prepared for ${subjectName}.`,
        'This portrait was created as a reflection and offering for you.',
        personalNote ? `\n${personalNote}\n` : '',
        `Read it here, in your own time:\n${url}`,
        '\nThis private link was made for you.',
      ].join('\n'),
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2a2a2a;">
          <p>A Soul Portrait has been prepared for <strong>${escapeHtml(subjectName)}</strong>.</p>
          ${personalNote ? `<blockquote>${escapeHtml(personalNote)}</blockquote>` : ''}
          <p><a href="${url}">Read your Soul Portrait</a></p>
          <p>This link is private and unlisted — it was made for you.</p>
        </div>`,
      triggerType: 'route',
      triggerRef: 'app/api/soul-portrait/[slug]/send',
      memberId,
      portraitDelivery: {
        portraitId: portrait.id,
        ownerMemberId: memberId,
        recipientConsentAttested: true,
        subjectShareAttested: true,
        consentSource: body.recipientConsentSource === 'written' ? 'written' : 'verbal',
      },
    });
    emailed = result.success;
    if (!result.success) {
      emailError = result.failureKind === 'exception'
        ? 'Delivery could not be confirmed. Please verify before attempting to send again.'
        : 'Automatic email could not be sent. The private portrait link is available to copy.';
    }
    // Acceptance from SMTP does not prove delivery into the recipient inbox.
    console.log('[soul-portrait/send] mail result', {
      accepted: result.success,
      provider: result.provider ?? null,
      failureKind: result.failureKind ?? null,
      id: result.success ? result.id ?? null : null,
    });
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
