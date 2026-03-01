/**
 * Journal Store
 *
 * Reads from both journal tables and returns entries in a unified format.
 * Used to give MAIA awareness of what a member has written — not just
 * what they've said in conversation.
 *
 * Tables:
 *   elemental_journal_entries — practice-linked journal (user_id: text)
 *   quick_journal_entries     — freeform notes and voice captures (user_id: text)
 *
 * Sovereignty note:
 *   Journal entries are member-authored content. MAIA surfaces them with respect —
 *   not as data points to analyse, but as things the person chose to record.
 *   Never quote journal content back verbatim without clear context.
 */

import { query } from '@/lib/db/postgres';

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  /** Spiralogic element if this was an elemental journal entry */
  element?: string;
  /** 'quick' | 'elemental' */
  entryType?: string;
  tags?: string[];
  createdAt: string;
}

export const JournalStore = {
  /**
   * Get the most recent journal entries for a user, across both tables.
   * Returns in reverse chronological order (most recent first).
   */
  async getRecentEntries(userId: string, limit: number = 5): Promise<JournalEntry[]> {
    const result = await query<{
      id: string;
      user_id: string;
      content: string;
      element: string | null;
      tags: string[] | null;
      entry_type: string | null;
      created_at: string;
    }>(
      `
      SELECT
        id::text,
        user_id,
        content,
        element,
        tags,
        'elemental' as entry_type,
        created_at::text
      FROM elemental_journal_entries
      WHERE user_id = $1

      UNION ALL

      SELECT
        id::text,
        user_id,
        content,
        NULL as element,
        tags,
        entry_type,
        created_at::text
      FROM quick_journal_entries
      WHERE user_id = $1

      ORDER BY created_at DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    return (result.rows ?? []).map(r => ({
      id: r.id,
      userId: r.user_id,
      content: r.content,
      element: r.element ?? undefined,
      entryType: r.entry_type ?? undefined,
      tags: r.tags ?? undefined,
      createdAt: r.created_at,
    }));
  },
};
