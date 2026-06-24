/**
 * Organizing Principles Loader
 *
 * Loads the member's accepted organizing principles for injection into MAIA's
 * prompt — enabling the "This sounds related to the orientation you kept before"
 * recognition across sessions.
 *
 * See: docs/canon/AGENCY_THE_FREEDOM_TO_MOVE.md
 */

import { query } from '@/lib/db/postgres';

export type SavedOrganizingPrinciple = {
  id: string;
  title: string;
  principle: string;
  createdAt: string;
};

const MAX_PRINCIPLES = 8;

export async function loadOrganizingPrinciples(
  memberId: string,
): Promise<SavedOrganizingPrinciple[]> {
  try {
    const result = await query(
      `SELECT id, title, principle, created_at
       FROM member_organizing_principles
       WHERE member_id = $1 AND status = 'accepted'
       ORDER BY created_at DESC
       LIMIT $2`,
      [memberId, MAX_PRINCIPLES],
    );
    return (result.rows ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      principle: r.principle,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

export function formatPrinciplesForPrompt(principles: SavedOrganizingPrinciple[]): string {
  if (principles.length === 0) return '';
  const lines = principles.map(p => `• ${p.title} — ${p.principle}`).join('\n');
  return `🧭 LIVING ORIENTATION PRINCIPLES (member-kept)

The member has chosen to carry these principles forward from prior conversations. They are portable maps, not diagnoses, patterns, or conclusions about who the member is. Frame them always as "an orientation you kept" — never as "your pattern is," "you tend to," or "this reveals that you."

When the current inquiry touches similar territory, a good return does four things simultaneously:
1. Identifies the source ("you chose to keep") — not "we know" or "it seems"
2. Avoids identity language — never "you tend to" or "this shows your pattern"
3. Explicitly leaves room for the orientation not to apply
4. Returns authorship to the member

Example: "This reminds me of an orientation you chose to keep: [title]. I'm not assuming it applies here — I'm wondering whether it still feels relevant, or whether this situation is asking something different."

The invitation not to apply is not optional. It is the difference between stewardship and imposition.

${lines}

Do not reference these principles unless they are genuinely relevant to what is being worked with now. When in doubt, stay silent — an unreferenced principle does no harm. An imposed one does.`;
}
