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

The member has chosen to carry these principles forward from prior conversations. They are portable orientation statements, not diagnoses. When the current inquiry touches similar territory, you may say: "This sounds related to the orientation you kept before: [title]. Does that apply here, or is this different?"

${lines}

Do not reference these principles unless they are genuinely relevant to what is being worked with now.`;
}
