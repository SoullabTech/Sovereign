import { sendEmail } from '@/lib/email/sendEmail';

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';

const PARTNER_MAP: Record<string, { name: string; email: string; fieldUrl: string }> = {
  'ce284751-e457-42f6-89b6-bc07d0876682': {
    name: 'Kelly',
    email: 'kelly@soullab.life',
    fieldUrl: 'https://kelly.soullab.life',
  },
  '7ce3b84c-a33c-4fcb-9aa8-03cf7a7eae78': {
    name: 'Nathan',
    email: 'Nathan.Kane@thermofisher.com',
    fieldUrl: 'https://nathan.soullab.life',
  },
};

function getRecipient(actorId: string) {
  return actorId === 'ce284751-e457-42f6-89b6-bc07d0876682'
    ? PARTNER_MAP['7ce3b84c-a33c-4fcb-9aa8-03cf7a7eae78']
    : PARTNER_MAP['ce284751-e457-42f6-89b6-bc07d0876682'];
}

function getActor(actorId: string) {
  return PARTNER_MAP[actorId] ?? { name: 'Someone', email: '', fieldUrl: '' };
}

export async function sendPartnerNotification(opts: {
  event: 'card_added' | 'card_moved' | 'dm_sent';
  actorId: string;
  fieldSlug: string;
  cardTitle?: string;
  columnId?: string;
  messagePreview?: string;
}) {
  if (!RESEND_API_KEY) return;
  const recipient = getRecipient(opts.actorId);
  const actor = getActor(opts.actorId);
  if (!recipient?.email) return;

  let subject = '';
  let bodyHtml = '';
  const fieldLink =
    opts.event === 'dm_sent'
      ? `${recipient.fieldUrl}/partner-view`
      : `${recipient.fieldUrl}/operator`;

  if (opts.event === 'card_added') {
    subject = `${actor.name} added "${opts.cardTitle}" to the board`;
    bodyHtml = `
      <p style="font-size:15px;line-height:1.7;color:#2A2318;">
        <strong>${actor.name}</strong> added a new card to the <strong>${opts.columnId}</strong> column:
      </p>
      <div style="background:#1A140E;border-radius:6px;padding:16px 20px;margin:16px 0;">
        <p style="color:#E8DDD0;font-size:15px;margin:0;">${opts.cardTitle}</p>
      </div>
      <p style="font-size:14px;color:#4A3F35;">
        <a href="${fieldLink}" style="color:#B08060;">View the board &rarr;</a>
      </p>
    `;
  } else if (opts.event === 'card_moved') {
    subject = `${actor.name} moved "${opts.cardTitle}"`;
    bodyHtml = `
      <p style="font-size:15px;line-height:1.7;color:#2A2318;">
        <strong>${actor.name}</strong> moved a card to <strong>${opts.columnId}</strong>:
      </p>
      <div style="background:#1A140E;border-radius:6px;padding:16px 20px;margin:16px 0;">
        <p style="color:#E8DDD0;font-size:15px;margin:0;">${opts.cardTitle}</p>
      </div>
      <p style="font-size:14px;color:#4A3F35;">
        <a href="${fieldLink}" style="color:#B08060;">View the board &rarr;</a>
      </p>
    `;
  } else if (opts.event === 'dm_sent') {
    subject = `New message from ${actor.name}`;
    bodyHtml = `
      <p style="font-size:15px;line-height:1.7;color:#2A2318;">
        <strong>${actor.name}</strong> sent you a message in your partner workspace.
      </p>
      ${
        opts.messagePreview
          ? `<div style="border-left:3px solid #B08060;padding-left:16px;margin:16px 0;color:#2A2318;font-size:15px;">${opts.messagePreview}</div>`
          : ''
      }
      <p style="font-size:14px;color:#4A3F35;">
        <a href="${fieldLink}" style="color:#B08060;">Open Partner Workspace &rarr;</a>
      </p>
    `;
  }

  const html = `
    <div style="font-family:Helvetica,sans-serif;max-width:560px;margin:0 auto;background:#F7F3EC;border-radius:8px;overflow:hidden;">
      <div style="background:#1A140E;padding:24px 28px;">
        <p style="color:#B08060;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 6px;">Soullab</p>
        <h2 style="color:#E8DDD0;font-size:18px;font-weight:300;margin:0;">${subject}</h2>
      </div>
      <div style="padding:28px;">${bodyHtml}</div>
      <div style="background:#EDE8E0;padding:16px 28px;">
        <p style="font-size:11px;color:#9A8F80;margin:0;">Soullab Partner Workspace &middot; <a href="https://soullab.life" style="color:#B08060;">soullab.life</a></p>
      </div>
    </div>
  `;

  const result = await sendEmail({
    purpose: 'notify:partner',
    from: 'Soullab <noreply@soullab.life>',
    to: [recipient.email],
    replyTo: actor.email || undefined,
    subject,
    html,
  });
  // Non-fatal by design, but no longer invisible: the try/catch this replaces
  // could not observe a provider refusal, because the provider resolves them.
  if (!result.success) {
    console.error(
      `[PartnerNotification] REFUSED failureKind=${result.failureKind ?? 'unclassified'} providerCode=${result.providerCode ?? 'unnamed'}`
    );
  }
}
