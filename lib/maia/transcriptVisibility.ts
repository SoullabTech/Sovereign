/**
 * Which turns the member actually sees in the transcript.
 *
 * MLX-06 Unit 3B. This predicate was an inline filter inside a 10,794-line
 * component. It is extracted — behaviour-preserving — because it decides
 * whether MAIA's first words reach the member, and that deserved a name and a
 * test rather than a comment.
 *
 * THE RULE IT ENCODES, and why it exists:
 *
 *   Legacy `greeting-*` messages are NOT shown in the transcript. They are
 *   duplicated by the pre-activation welcome surface, which composes its own
 *   greeting; rendering both made MAIA appear to greet twice.
 *
 *   The Arrival first contact is DIFFERENT IN KIND. It is not a banner shown
 *   while waiting for the member — it is MAIA's first turn, answering what the
 *   member just said moments earlier at the threshold. It belongs in the
 *   conversation, and the welcome surface never shows it (that surface renders
 *   generateWelcomeGreeting, not this message). Filtered out, it had no visible
 *   home anywhere — generated, seeded, and never seen.
 */

export const ARRIVAL_CONTACT_PREFIX = 'arrival-contact-';
export const LEGACY_GREETING_PREFIX = 'greeting-';

export interface TranscriptTurn {
  id?: string;
  text?: string;
  content?: string;
}

/** True when this turn belongs in the member-visible transcript. */
export function isMemberVisibleTurn(message: TranscriptTurn): boolean {
  return !message.id?.startsWith(LEGACY_GREETING_PREFIX);
}

/**
 * The id a first-contact turn should carry.
 *
 * With arrival context, MAIA is answering the member — a real turn. Without it,
 * the legacy greeting keeps the prefix that hides it behind the welcome surface,
 * so nothing changes for members who did not just arrive.
 */
export function firstContactId(hasArrivalContext: boolean, now: number): string {
  return `${hasArrivalContext ? ARRIVAL_CONTACT_PREFIX : LEGACY_GREETING_PREFIX}${now}`;
}
