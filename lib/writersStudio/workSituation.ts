/**
 * WS2-03C — MAIA, situated in the Work the member brought.
 *
 * ── THE MIDDLE TERM ────────────────────────────────────────────────────────
 *
 * WS2-03B built both ends of the Studio → MAIA → Studio contract and proved
 * them as a round trip, and then correctly refused to open Conversations,
 * because the middle term did not exist:
 *
 *   current Work identity  →  MAIA exchange situated in same Work  →  return
 *          BUILT                        NOT BUILT                     BUILT
 *
 * This module is that middle term. It is deliberately small, because the
 * dangerous part of situating a conversation is not the prompt text — it is
 * deciding whose Work the exchange is allowed to be about.
 *
 * ── WHY THE CLIENT SENDS ONLY AN ID ────────────────────────────────────────
 *
 * The handoff URL is member-visible and member-editable. Anything the client
 * says about a Work is therefore a claim, not a fact. If the Studio sent the
 * title and purpose along with the id, a hand-edited URL would write arbitrary
 * prose straight into MAIA's prompt — a prompt-injection channel opened by a
 * feature whose whole purpose is honest context.
 *
 * So the client sends `workId` and nothing else. Every word that reaches the
 * prompt is read here, from the row, scoped to the authenticated member. An id
 * the member does not own resolves to null and the exchange is simply not
 * situated. It fails CLOSED and it fails QUIET: an unsituated conversation is
 * a working conversation, and refusing to situate is not an error the member
 * needs to be alarmed about — it is MAIA declining to claim a context she
 * cannot verify.
 *
 * This mirrors the rule the route already holds for its own addenda: server
 * built, placed after `...meta`, so client-supplied meta can never override
 * what the server established.
 *
 * ── WHAT MAY REACH THE PROMPT, AND WHAT MAY NOT ────────────────────────────
 *
 * Only what the MEMBER AUTHORED about their own Work: the title they gave it,
 * the purpose in their words, their word for its form, and the stage they say
 * they are at. Every one of those is the member's own sentence — `living_works`
 * stores nothing the system inferred, and `stage` is explicitly "where the
 * member says they are. The system never sets or advances it."
 *
 * NOT included, and the omissions are the point:
 *
 *   the manuscript's text      MAIA is adjacent to the Work, not its reader.
 *                              Carrying the draft here would make her a second
 *                              owner of the member's material (D-019).
 *   declared materials         The member brought those into the WORK, which
 *                              is not the same act as bringing them into a
 *                              CONVERSATION. Crossing is the consent event,
 *                              and it has not been performed for this room.
 *   counts, progress, activity Nothing measured. A situated conversation is
 *                              context, never a report on the member.
 *
 * The addendum says what the member is working on and then gets out of the
 * way. It gives MAIA no instruction about what to do with it, because a
 * situated conversation is still the member's to steer.
 *
 * ── WHERE IT ACTUALLY LANDS ────────────────────────────────────────────────
 *
 * FAST and CORE inject it into the prompt. DEEP carries it in MaiaContext and
 * counts it in observability but does NOT inject it — buildComprehensiveVoice
 * Prompt extracts no addendum of any kind, which is the divergence recorded in
 * ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md §II.B. Every other addendum stops
 * at the same wall. Stated here so "situated" is never read as three tiers
 * when it is two.
 */

import { query } from '@/lib/db/postgres';

/** The member's own words about their own Work. Nothing inferred, nothing counted. */
export interface SituatedWork {
  id: string;
  /** The member's name for it, or null — unnamed is a correct state. */
  title: string | null;
  /** Their stated intention, in their words. */
  purpose: string | null;
  /** Their own word for what this is becoming ("Book"). Never a taxonomy. */
  form: string | null;
  /** Where the member says they are. The system never sets or advances it. */
  stage: string | null;
}

/**
 * Resolve a Work the member actually owns, or null.
 *
 * Member-scoped in the WHERE clause rather than checked afterwards: there is
 * no code path here that reads a row before confirming whose it is.
 */
export async function resolveSituatedWork(
  memberId: string | null | undefined,
  workId: unknown,
): Promise<SituatedWork | null> {
  if (!memberId || typeof workId !== 'string' || workId.trim() === '') return null;
  try {
    const res = await query<{
      id: string;
      title: string | null;
      purpose: string | null;
      form: string | null;
      stage: string | null;
    }>(
      `SELECT id, title, purpose, form, stage
         FROM living_works
        WHERE id = $1 AND member_id = $2
        LIMIT 1`,
      [workId, memberId],
    );
    return res.rows[0] ?? null;
  } catch {
    // A read failure is not a licence to situate on the client's say-so.
    return null;
  }
}

/**
 * The addendum, in the member's own words.
 *
 * Returns undefined when there is nothing verified to say, so the caller can
 * spread it into the addenda map exactly like every other optional block.
 */
export function formatWorkSituationForPrompt(work: SituatedWork | null): string | undefined {
  if (!work) return undefined;

  const lines = [
    '📖 WRITER\'S STUDIO — THE WORK ON THE TABLE',
    '',
    'The member came here from their Writer\'s Studio and brought one Work with',
    'them. Everything below is in their own words — they wrote it, you did not',
    'infer it, and none of it is a measurement of them.',
    '',
    `Work: ${work.title ?? '(they have not named it yet)'}`,
  ];
  if (work.form) lines.push(`They call it: ${work.form}`);
  if (work.purpose) lines.push(`Why they are making it: ${work.purpose}`);
  if (work.stage) lines.push(`Where they say they are: ${work.stage}`);

  lines.push(
    '',
    // Kept on single lines: a sentence split across an array element is split
    // in the prompt too, and a phrase broken by a newline reads worse and
    // matches worse.
    'You do not hold this Work and you are not its author.',
    'You have not been given its text.',
    'Speak with it in view; do not assume the conversation is about it unless',
    'they take it there.',
  );
  return lines.join('\n');
}

/** One line for the runtime log. Ids only — never the member's prose. */
export function summarizeWorkSituationForLog(
  requested: unknown,
  resolved: SituatedWork | null,
): { requested: boolean; situated: boolean; workIdPrefix?: string } {
  return {
    requested: typeof requested === 'string' && requested.trim() !== '',
    situated: resolved !== null,
    ...(resolved ? { workIdPrefix: resolved.id.slice(0, 8) } : {}),
  };
}
