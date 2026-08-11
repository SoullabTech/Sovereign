// Production web requires force-dynamic for runtime database access.
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Reflect with MAIA — one entry, by invitation only (J-5).
 *
 * POST /api/journal/reflect  { entryId }
 *   → { noticed: string, asked: string }
 *
 * THE STANCE THIS ROUTE ENFORCES
 *
 * MAIA does not greet the member at the door of their own Journal. She is
 * invited into one entry, after it has been kept, by an explicit gesture. This
 * route therefore has no batch mode, no "analyze recent entries", and no way to
 * be called on writing the member has not handed over. One entry id, one
 * response, nothing stored.
 *
 * WHAT MAIA IS ASKED TO DO
 *
 *   attend  — notice something ACTUALLY PRESENT in the member's words
 *   wonder  — ask one question that opens rather than closes
 *   return  — leave the member facing their own page, not a reading of it
 *
 * She is forbidden from summarizing, interpreting, diagnosing, advising,
 * reassuring, or naming a pattern. The acceptance test is behavioral, not
 * textual: after MAIA responds, does the member want to keep writing? A
 * response that invites consumption has failed even if it is insightful.
 *
 * SOVEREIGNTY BOUNDARIES
 *
 *   - The member is derived from the verified session. The entry is then loaded
 *     BY ID FROM THE DATABASE and must belong to that member. Entry text is
 *     never accepted from the request body — a caller cannot put words in a
 *     member's mouth, or read someone else's entry by guessing an id.
 *   - Nothing is written. No reflection row, no memory atom, no capsule, no
 *     episodic record. The response is ephemeral by design: this cut gives the
 *     member a reflection to think with, not a file MAIA keeps about them. If
 *     keeping a reflection is wanted later, that is a member gesture with its
 *     own storage decision — not a side effect of asking once.
 *   - A member whose storage decision keeps writing local-only has no row here,
 *     so this route cannot reach that writing at all. That is the correct
 *     failure: the boundary is structural, not promised in copy.
 *
 * The two parts are returned separately so the client can never render MAIA's
 * words as though the member wrote them. Attribution is a data-shape property,
 * not a styling choice.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { generateWithClaude } from '@/lib/ai/claudeClient';

const SYSTEM_PROMPT = `You are MAIA. A person has written in their private journal and has invited you to look at one entry. You are a guest on their page.

Reply with exactly two lines, in this format, and nothing else:

NOTICED: <one sentence>
ASKED: <one question>

NOTICED must point at something actually present in their words — a word they repeated, a hedge or qualifier, a contradiction, a shift in tense or person, something they named and then dropped, a detail they lingered on, a sentence that stops short. Name or quote the exact language wherever you can, so they can check it against what they wrote. If nothing specific stands out, notice something small and literal rather than inventing significance.

ASKED must be one short question that opens rather than closes, and that only they could answer. It should turn them back toward their own writing.

Never do any of this:
- summarize or paraphrase the entry back to them
- say what it means, or what it means about them
- diagnose, advise, reassure, encourage, or praise
- name a psychological pattern, or use therapy vocabulary
- claim to know how they feel
- refer to yourself, or to this being a reflection
- add any preamble, sign-off, or extra lines

Keep each line under 30 words. Plain language. No em-dashes at the start of a line.`;

interface QuickEntryRow {
  content: string;
  entry_type: string;
  created_at: string;
}

/**
 * Every id this member's rows may be filed under. Mirrors the resolution in
 * /api/journal/quick/list — legacy entries predate the UUID migration and are
 * keyed by username (or `username-nezat`).
 */
async function ownedIdsFor(memberId: string): Promise<string[]> {
  const ids = [memberId];
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(memberId)) return ids;
  try {
    const res = await query<{ username: string }>(
      'SELECT username FROM members WHERE id::text = $1',
      [memberId],
    );
    if (res.rows.length > 0) {
      ids.push(res.rows[0].username, `${res.rows[0].username}-nezat`);
    }
  } catch {
    // members table unavailable — the UUID alone is still a valid owner check
  }
  return ids;
}

/** Pull the two labelled lines out. Anything else is treated as a failure. */
function parseReflection(text: string): { noticed: string; asked: string } | null {
  const noticed = text.match(/NOTICED:\s*(.+)/i)?.[1]?.trim();
  const asked = text.match(/ASKED:\s*(.+)/i)?.[1]?.trim();
  if (!noticed || !asked) return null;
  return { noticed, asked };
}

export async function POST(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const entryId = typeof body?.entryId === 'string' ? body.entryId : null;
    if (!entryId) {
      return NextResponse.json(
        { success: false, error: 'entryId required' },
        { status: 400 },
      );
    }

    // The text comes from the member's own row, never from the request.
    const owners = await ownedIdsFor(memberId);
    const placeholders = owners.map((_, i) => `$${i + 2}`).join(', ');
    const result = await query<QuickEntryRow>(
      `SELECT content, entry_type, created_at
         FROM quick_journal_entries
        WHERE id = $1 AND user_id IN (${placeholders})
        LIMIT 1`,
      [entryId, ...owners],
    );

    if (result.rows.length === 0) {
      // Same answer whether the entry is absent or belongs to someone else.
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 },
      );
    }

    const entry = result.rows[0];
    const content = (entry.content || '').trim();
    if (content.length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: 'There is not enough here yet to sit with.',
        },
        { status: 422 },
      );
    }

    console.log(
      `[Journal/reflect] invited into one entry { member: ${memberId.slice(0, 8)}…, chars: ${content.length} }`,
    );

    const written = new Date(entry.created_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const { text } = await generateWithClaude({
      systemPrompt: SYSTEM_PROMPT,
      userInput: `Written ${written}.\n\n${content}`,
      meta: { userId: memberId, mode: 'journal-reflect' },
    });

    const parsed = parseReflection(text);
    if (!parsed) {
      // Better to say nothing than to render unattributable text on the
      // member's page.
      console.warn('[Journal/reflect] response did not match the two-line shape');
      return NextResponse.json(
        { success: false, error: 'MAIA did not have anything clear to offer.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, ...parsed });
  } catch (error) {
    console.error('[Journal/reflect] failed:', error);
    return NextResponse.json(
      { success: false, error: 'MAIA could not be reached just now.' },
      { status: 500 },
    );
  }
}
