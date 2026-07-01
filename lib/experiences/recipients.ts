/**
 * Guided Experiences — recipient registry (CANDIDATE capability)
 *
 * "The Beginning" is the first guided orientation experience. Personalization here
 * is pure delivery data — a name and an optional first-contact line. It persists
 * nothing, infers nothing, and asserts no member meaning. If/when a second guided
 * experience earns the shared shell, THIS registry + the scroll shell get extracted
 * into a real engine (extract, don't invent). Until then it stays deliberately small.
 */

export interface Recipient {
  /** Display name shown on arrival and woven into Kelly's closing letter. */
  name: string;
  /** Optional reply target for the closing "Let's Begin" action. */
  replyTo?: string;
}

const RECIPIENTS: Record<string, Recipient> = {
  mark: { name: 'Mark' },
};

/** Default reply target for the closing invitation. Configure per-recipient above. */
export const DEFAULT_REPLY_TO = 'kelly@soullab.life';

export function getRecipient(token: string | undefined | null): Recipient | null {
  if (!token) return null;
  return RECIPIENTS[token.toLowerCase()] ?? null;
}
