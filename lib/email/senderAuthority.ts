/**
 * MAIL-IDENTITY: one qualified interim Proton submission identity.
 *
 * The only live-proven SMTP token is bound to noreply@soullab.life.
 * Former managed Resend From identities may not be submitted through that
 * token verbatim, regardless of an SMTP server that happens to permit aliases.
 * Preserve a human reply address only when known or explicitly supplied.
 *
 * This is an explicit temporary convergence, not silent sender spoofing:
 * outbound managed mail visibly originates from Soullab's software sender.
 */
import { extractRecipientMailbox } from './capacity';

const VERIFIED_SENDER = 'Soullab <noreply@soullab.life>';
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
  'support@soullab.life',
  'problem@soullab.life',
]);

export type SenderResolution =
  | { allowed: true; from: string; replyTo?: string; recast: boolean }
  | { allowed: false; reason: 'unqualified_sender' | 'invalid_reply_to' };

export function managedSender(
  requestedFrom: string, replyTo?: string
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
    from: VERIFIED_SENDER,
    ...(qualifiedReply ? { replyTo: qualifiedReply } : {}),
    recast: originalMailbox !== QUALIFIED_SENDER_ADDRESS,
  };
}
