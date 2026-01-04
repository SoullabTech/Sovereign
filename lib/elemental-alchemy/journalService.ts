/**
 * ELEMENTAL JOURNAL SERVICE
 *
 * CRUD operations for elemental journal entries.
 * Uses local PostgreSQL (NOT Supabase).
 */

import { pool } from '@/lib/db/postgres';
import type { ElementKey } from './assessmentQuestions';

export interface ElementalJournalEntry {
  id: string;
  user_id: string;
  element: ElementKey | null;
  chapter_num: number | null;
  practice_id: string | null;
  prompt: string | null;
  content: string;
  insights: string[];
  mood: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateJournalEntry {
  userId: string;
  element?: ElementKey;
  chapterNum?: number;
  practiceId?: string;
  prompt?: string;
  content: string;
  insights?: string[];
  mood?: string;
  tags?: string[];
}

export interface JournalFilters {
  element?: ElementKey;
  practiceId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Create a new journal entry
 */
export async function createJournalEntry(entry: CreateJournalEntry): Promise<ElementalJournalEntry> {
  const {
    userId,
    element,
    chapterNum,
    practiceId,
    prompt,
    content,
    insights = [],
    mood,
    tags = []
  } = entry;

  const result = await pool.query<ElementalJournalEntry>(
    `INSERT INTO elemental_journal_entries
     (user_id, element, chapter_num, practice_id, prompt, content, insights, mood, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [userId, element || null, chapterNum || null, practiceId || null, prompt || null, content, insights, mood || null, tags]
  );

  return result.rows[0];
}

/**
 * Get journal entries for a user
 */
export async function getJournalEntries(
  userId: string,
  filters: JournalFilters = {}
): Promise<{ entries: ElementalJournalEntry[]; total: number }> {
  const { element, practiceId, search, limit = 20, offset = 0 } = filters;

  let whereClause = 'WHERE user_id = $1';
  const params: (string | number)[] = [userId];
  let paramIndex = 2;

  if (element) {
    whereClause += ` AND element = $${paramIndex}`;
    params.push(element);
    paramIndex++;
  }

  if (practiceId) {
    whereClause += ` AND practice_id = $${paramIndex}`;
    params.push(practiceId);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND (content ILIKE $${paramIndex} OR prompt ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Get total count
  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM elemental_journal_entries ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get entries
  params.push(limit, offset);
  const result = await pool.query<ElementalJournalEntry>(
    `SELECT * FROM elemental_journal_entries
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  return { entries: result.rows, total };
}

/**
 * Get a single journal entry by ID
 */
export async function getJournalEntryById(
  id: string,
  userId: string
): Promise<ElementalJournalEntry | null> {
  const result = await pool.query<ElementalJournalEntry>(
    'SELECT * FROM elemental_journal_entries WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  return result.rows[0] || null;
}

/**
 * Update a journal entry
 */
export async function updateJournalEntry(
  id: string,
  userId: string,
  updates: Partial<Pick<CreateJournalEntry, 'content' | 'insights' | 'mood' | 'tags'>>
): Promise<ElementalJournalEntry | null> {
  const setClauses: string[] = [];
  const params: (string | string[] | null)[] = [id, userId];
  let paramIndex = 3;

  if (updates.content !== undefined) {
    setClauses.push(`content = $${paramIndex}`);
    params.push(updates.content);
    paramIndex++;
  }

  if (updates.insights !== undefined) {
    setClauses.push(`insights = $${paramIndex}`);
    params.push(updates.insights);
    paramIndex++;
  }

  if (updates.mood !== undefined) {
    setClauses.push(`mood = $${paramIndex}`);
    params.push(updates.mood || null);
    paramIndex++;
  }

  if (updates.tags !== undefined) {
    setClauses.push(`tags = $${paramIndex}`);
    params.push(updates.tags);
    paramIndex++;
  }

  if (setClauses.length === 0) {
    return getJournalEntryById(id, userId);
  }

  const result = await pool.query<ElementalJournalEntry>(
    `UPDATE elemental_journal_entries
     SET ${setClauses.join(', ')}
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    params
  );

  return result.rows[0] || null;
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntry(id: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM elemental_journal_entries WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  return (result.rowCount ?? 0) > 0;
}

/**
 * Get journal stats for a user
 */
export async function getJournalStats(userId: string): Promise<{
  total: number;
  byElement: Record<ElementKey, number>;
  recentCount: number;
}> {
  // Total count
  const totalResult = await pool.query<{ count: string }>(
    'SELECT COUNT(*) FROM elemental_journal_entries WHERE user_id = $1',
    [userId]
  );
  const total = parseInt(totalResult.rows[0].count, 10);

  // By element
  const elementResult = await pool.query<{ element: ElementKey; count: string }>(
    `SELECT element, COUNT(*) FROM elemental_journal_entries
     WHERE user_id = $1 AND element IS NOT NULL
     GROUP BY element`,
    [userId]
  );

  const byElement: Record<ElementKey, number> = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    aether: 0
  };

  elementResult.rows.forEach(row => {
    byElement[row.element] = parseInt(row.count, 10);
  });

  // Recent count (last 7 days)
  const recentResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM elemental_journal_entries
     WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'`,
    [userId]
  );
  const recentCount = parseInt(recentResult.rows[0].count, 10);

  return { total, byElement, recentCount };
}
