/**
 * MAIL-IDENTITY: one canonical, qualified automated sending identity.
 *
 * The only live-proven SMTP token is bound to noreply@soullab.life.
 * Former managed Resend From identities may not be submitted through that
 * token verbatim, regardless of an SMTP server that happens to permit aliases.
 * Preserve a human reply address only when known or explicitly supplied.
 *
 * Founder-approved 2026-10-12: retain one permanent-default From identity
 * regardless of whether the underlying approved SMTP service changes later.
 * Display names may convey purpose, but must be trusted static labels; never
 * inherit a dynamic member or practitioner string as the sending identity.
 * This does not merge Reply-To, P0 protections or software/human authority.
 */
import { extractRecipientMailbox } from './capacity';

const PURPOSE_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  'notify:safety': 'Soullab Safety',
  auth: 'Soullab Account',
  security: 'Soullab Security',
  invite: 'Soullab Invitations',
  'soul-portrait': 'Soullab Soul Portraits',
  practitioner: 'Soullab Studio',
  portal: 'Soullab Bookings',
  reminder: 'Soullab Reminders',
  broadcast: 'Soullab Updates',
};

function approvedDisplayName(purpose: string): string {
  const exact = PURPOSE_DISPLAY_NAMES[purpose];
  if (exact) return exact;
  const family = purpose.includes(':') ? purpose.split(':', 1)[0] : purpose;
  return PURPOSE_DISPLAY_NAMES[family] ?? 'Soullab';
}
export const QUALIFIED_SENDER_ADDRESS = 'noreply@soullab.life';

/** Only historically audited software-role senders are eligible for convergence. */
const PREVIOUS_SOFTWARE_SENDERS: ReadonlySet<string> = new Set([
  'noreply@soullab.life',
  'kelly@soullab.life',
  'bookings@soullab.life',
  'portal@soullab.life',
  'reminders@soullab.life',
  'updates@soullab.life',
  'team@soullab.life',
  'gifts@soullab.life',
  'maia@soullab.life',
]);

export type SenderResolution =
  | { allowed: true; from: string; replyTo?: string; recast: boolean }
  | { allowed: false; reason: 'unqualified_sender' | 'invalid_reply_to' };

export function managedSender(
  requestedFrom: string, replyTo?: string, purpose = ''
): SenderResolution {
  const originalMailbox = extractRecipientMailbox(requestedFrom);
  if (!originalMailbox || !PREVIOUS_SOFTWARE_SENDERS.has(originalMailbox)) {
    return { allowed: false, reason: 'unqualified_sender' };
  }
  // Do not invent a Reply-To address for role mailboxes that may not exist.
  // Kelly's mailbox is known to be human-owned and reply-capable.
  const candidateReply = replyTo ?? (
    originalMailbox === 'kelly@soullab.life' ? originalMailbox : undefined
  );
  const qualifiedReply = candidateReply
    ? extractRecipientMailbox(candidateReply) : undefined;
  if (candidateReply && !qualifiedReply) {
    return { allowed: false, reason: 'invalid_reply_to' };
  }
  return {
    allowed: true,
    from: `${approvedDisplayName(purpose)} <${QUALIFIED_SENDER_ADDRESS}>`,
    ...(qualifiedReply ? { replyTo: qualifiedReply } : {}),
    recast: originalMailbox !== QUALIFIED_SENDER_ADDRESS,
  };
}
