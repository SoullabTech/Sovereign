/**
 * Class A identity email — SMTP/Proton-only, no implicit Resend fallback.
 *
 * Reuse for ordinary on-file email verification and founder-initiated
 * re-verification. This does NOT change the default managed mail provider for
 * unrelated routes. Merely importing this module never sends any message.
 */
import { getEmailProvider } from './providers';
import type { EmailProvider } from './providers/types';
import type { SendEmailResult } from './sendEmail';

export function approvedVerificationSmtp(): EmailProvider | null {
  if (process.env.EMAIL_PROVIDER?.trim().toLowerCase() !== 'smtp') return null;
  try {
    const provider = getEmailProvider();
    if (provider.name !== 'smtp' || !provider.isConfigured()) return null;
    return provider;
  } catch {
    return null;
  }
}

/** SMTP server/provider ACCEPTED a message; it did not prove final delivery. */
export function acceptedVerificationSmtp(
  result: Pick<SendEmailResult, 'success' | 'provider' | 'id'>,
): boolean {
  return result.success === true
    && result.provider === 'smtp'
    && typeof result.id === 'string'
    && result.id.trim().length > 0;
}
