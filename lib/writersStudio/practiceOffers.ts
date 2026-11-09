/**
 * WS-DEVELOP-STUDIO — the one gentle offer for a helper's book: case stories are other people's lives.
 *
 * Founder (2026-11-09): "offer it once", and "suggestions not obnoxious". So: one short, warm sentence at the end of an answer, only when the passage she was given
 * really tells a real person's story, never a warning, never a condition, never repeated. Only for a Work the writer DECLARED to be a helper's book.
 * Once-ness is read from what was actually said (the stored answers), not from a flag the system sets on its own.
 */
import { query } from '@/lib/db/postgres';

/** The words that mark the offer as MADE. The instruction asks MAIA to use them; their presence in a stored answer is how "once" is known. */
export const ANONYMISE_MARKER = /other people[’']s lives/i;

export const ANONYMISE_OFFER_INSTRUCTION = [
  'ONE GENTLE OFFER, AT MOST ONCE EVER. This writer has said they are a helper writing from their own practice.',
  'If — and only if — the passage you were given tells a real person’s story, you may add ONE short sentence at the very end of your answer, in your own warm voice,',
  'saying that case stories are other people’s lives and asking, lightly, whether they have changed what could identify the person. Use the words “other people’s lives”.',
  'Make it clear no answer is needed. It must not be a warning, a rule, a legal or clinical statement, or a condition of anything. It must not interrupt your answer.',
  'Never ask for, guess or repeat identifying details. Do not mention that you were told to offer it. If the passage does not tell a real person’s story, say nothing about this at all.',
].join(' ');

/** Has MAIA already made this offer anywhere in this Work's conversations? Member-scoped in the SQL. */
export async function anonymiseOfferAlreadyMade(memberId: string, manuscriptId: string): Promise<boolean> {
  const r = await query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM ask_turns t JOIN ask_threads th ON th.id = t.thread_id
      WHERE th.member_id = $1 AND th.manuscript_id = $2 AND t.speaker = 'maia' AND t.body ~* $3`,
    [memberId, manuscriptId, "other people[’']s lives"]);
  return Number(r.rows[0]?.n ?? 0) > 0;
}
