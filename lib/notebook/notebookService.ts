/**
 * Living Notebook — Service Layer
 *
 * CRUD operations for notebook entries.
 * Follows spiralStatePersistence.ts patterns:
 *   - Reads are awaited (caller needs data)
 *   - Mutations are fire-and-forget where possible (never block UX)
 *   - createEntry is awaited (caller needs the new ID)
 *
 * Table: notebook_entries (see migrations/20260326000001_notebook_entries.sql)
 */

import { query } from '@/lib/db/postgres';
import { classifyEntry } from './classifyEntry';
import { getAllActiveSlugs } from '@/lib/masters/registry';
import type {
  NotebookEntry,
  CreateEntryInput,
  UpdateEntryInput,
  NotebookFilter,
  EntryClassification,
} from './types';

// ═══════════════════════════════════════════════════════════════
// Field slug validation — coerce unknown/malformed to null
// ═══════════════════════════════════════════════════════════════

function normalizeFieldSlug(raw?: string | null): string | null {
  if (!raw) return null;
  const slug = raw.trim().toLowerCase();
  if (!slug) return null;
  const valid = getAllActiveSlugs();
  return valid.includes(slug) ? slug : null;
}

// ═══════════════════════════════════════════════════════════════
// 1. Create Entry (awaited — caller needs ID back)
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new notebook entry. Auto-classifies if no explicit type.
 * Returns the created entry (awaited because caller needs the ID).
 */
export async function createEntry(
  memberId: string,
  input: CreateEntryInput,
): Promise<NotebookEntry | null> {
  try {
    // Auto-classify if no explicit type provided
    let classification: EntryClassification | null = null;
    let entryType = input.entry_type || 'note';

    if (!input.entry_type) {
      classification = classifyEntry(input.content);
      entryType = classification.detected_type;
    } else {
      // Still run classification for metadata, but don't override explicit type
      classification = classifyEntry(input.content);
      classification.detected_type = entryType;
    }

    // Merge auto-detected tags with explicit tags
    const tags = [
      ...new Set([
        ...(input.tags || []),
        ...(classification?.detected_tags || []),
      ]),
    ];

    const result = await query<NotebookEntry>(
      `INSERT INTO notebook_entries (
        member_id, content, entry_type, title, tags, source,
        source_ref, client_id, conversation_id, session_id,
        primary_context, field_slug, classification, priority, due_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13, $14, $15
      )
      RETURNING *`,
      [
        memberId,
        input.content,
        entryType,
        input.title || null,
        tags,
        input.source || 'manual',
        input.source_ref ? JSON.stringify(input.source_ref) : null,
        input.client_id || null,
        input.conversation_id || null,
        input.session_id || null,
        input.primary_context || 'personal',
        normalizeFieldSlug(input.field_slug),
        classification ? JSON.stringify(classification) : null,
        input.priority || null,
        input.due_at || null,
      ],
    );

    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch (error) {
    console.error('[notebook] Failed to create entry:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. Update Entry (fire-and-forget)
// ═══════════════════════════════════════════════════════════════

/**
 * Update an existing notebook entry. Fire-and-forget.
 * Only updates fields present in the input.
 */
export function updateEntry(
  memberId: string,
  entryId: string,
  input: UpdateEntryInput,
): void {
  const setClauses: string[] = [];
  const values: unknown[] = [memberId, entryId];
  let paramIdx = 3;

  const fieldMap: [keyof UpdateEntryInput, string][] = [
    ['content', 'content'],
    ['entry_type', 'entry_type'],
    ['title', 'title'],
    ['tags', 'tags'],
    ['status', 'status'],
    ['priority', 'priority'],
    ['due_at', 'due_at'],
    ['client_id', 'client_id'],
    ['conversation_id', 'conversation_id'],
    ['session_id', 'session_id'],
    ['primary_context', 'primary_context'],
    ['field_slug', 'field_slug'],
    ['weight', 'weight'],
    ['occurrence_count', 'occurrence_count'],
    ['last_seen_at', 'last_seen_at'],
  ];

  for (const [key, column] of fieldMap) {
    if (input[key] !== undefined) {
      setClauses.push(`${column} = $${paramIdx}`);
      values.push(input[key]);
      paramIdx++;
    }
  }

  // JSONB fields need JSON.stringify
  if (input.evolution_state !== undefined) {
    setClauses.push(`evolution_state = $${paramIdx}`);
    values.push(JSON.stringify(input.evolution_state));
    paramIdx++;
  }

  // Re-classify if content changed
  if (input.content && !input.entry_type) {
    const classification = classifyEntry(input.content);
    setClauses.push(`classification = $${paramIdx}`);
    values.push(JSON.stringify(classification));
    paramIdx++;
  }

  if (setClauses.length === 0) return;

  const sql = `
    UPDATE notebook_entries
    SET ${setClauses.join(', ')}
    WHERE member_id = $1 AND id = $2
  `;

  query(sql, values).catch((error) => {
    console.warn('[notebook] Failed to update entry:', {
      memberId,
      entryId,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 3. Archive Entry (fire-and-forget, soft delete)
// ═══════════════════════════════════════════════════════════════

export function archiveEntry(memberId: string, entryId: string): void {
  query(
    `UPDATE notebook_entries
     SET status = 'archived', archived_at = NOW()
     WHERE member_id = $1 AND id = $2`,
    [memberId, entryId],
  ).catch((error) => {
    console.warn('[notebook] Failed to archive entry:', {
      memberId,
      entryId,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 4. Complete Entry (fire-and-forget)
// ═══════════════════════════════════════════════════════════════

export function completeEntry(memberId: string, entryId: string): void {
  query(
    `UPDATE notebook_entries
     SET status = 'done', completed_at = NOW()
     WHERE member_id = $1 AND id = $2`,
    [memberId, entryId],
  ).catch((error) => {
    console.warn('[notebook] Failed to complete entry:', {
      memberId,
      entryId,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 5. List Entries (awaited read)
// ═══════════════════════════════════════════════════════════════

export async function listEntries(
  memberId: string,
  filter: NotebookFilter = {},
): Promise<NotebookEntry[]> {
  try {
    const conditions: string[] = ['member_id = $1'];
    const values: unknown[] = [memberId];
    let paramIdx = 2;

    if (filter.entry_type) {
      conditions.push(`entry_type = $${paramIdx}`);
      values.push(filter.entry_type);
      paramIdx++;
    }

    if (filter.status) {
      conditions.push(`status = $${paramIdx}`);
      values.push(filter.status);
      paramIdx++;
    } else {
      // Default: exclude archived
      conditions.push(`status != 'archived'`);
    }

    if (filter.primary_context) {
      conditions.push(`primary_context = $${paramIdx}`);
      values.push(filter.primary_context);
      paramIdx++;
    }

    if (filter.client_id) {
      conditions.push(`client_id = $${paramIdx}`);
      values.push(filter.client_id);
      paramIdx++;
    }

    if (filter.field_slug) {
      conditions.push(`field_slug = $${paramIdx}`);
      values.push(filter.field_slug);
      paramIdx++;
    }

    if (filter.tag) {
      conditions.push(`$${paramIdx} = ANY(tags)`);
      values.push(filter.tag);
      paramIdx++;
    }

    if (filter.search) {
      conditions.push(
        `to_tsvector('english', coalesce(title, '') || ' ' || content) @@ plainto_tsquery('english', $${paramIdx})`,
      );
      values.push(filter.search);
      paramIdx++;
    }

    const limit = Math.min(filter.limit || 20, 100);
    const offset = filter.offset || 0;

    const sql = `
      SELECT *
      FROM notebook_entries
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const result = await query<NotebookEntry>(sql, values);
    return result.rows;
  } catch (error) {
    console.warn('[notebook] Failed to list entries:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// 6. Get Single Entry (awaited read)
// ═══════════════════════════════════════════════════════════════

export async function getEntry(
  memberId: string,
  entryId: string,
): Promise<NotebookEntry | null> {
  try {
    const result = await query<NotebookEntry>(
      `SELECT * FROM notebook_entries WHERE member_id = $1 AND id = $2`,
      [memberId, entryId],
    );
    return result.rows[0] || null;
  } catch (error) {
    console.warn('[notebook] Failed to get entry:', {
      memberId,
      entryId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// 7. Get Recent Entries (for oracle context injection)
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch recent active entries for MAIA context injection.
 * Weighted by recency and signal strength.
 */
export async function getRecentEntries(
  memberId: string,
  limit = 5,
): Promise<NotebookEntry[]> {
  try {
    const result = await query<NotebookEntry>(
      `SELECT *
       FROM notebook_entries
       WHERE member_id = $1 AND status = 'active'
       ORDER BY
         GREATEST(weight, 0.1) * (1.0 / (EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 + 1)) DESC,
         created_at DESC
       LIMIT $2`,
      [memberId, limit],
    );
    return result.rows;
  } catch (error) {
    console.warn('[notebook] Failed to get recent entries:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// 8. Full-Text Search (awaited read)
// ═══════════════════════════════════════════════════════════════

export async function searchEntries(
  memberId: string,
  searchQuery: string,
  limit = 10,
): Promise<NotebookEntry[]> {
  try {
    const result = await query<NotebookEntry>(
      `SELECT *,
        ts_rank(
          to_tsvector('english', coalesce(title, '') || ' ' || content),
          plainto_tsquery('english', $2)
        ) AS rank
       FROM notebook_entries
       WHERE member_id = $1
         AND status != 'archived'
         AND to_tsvector('english', coalesce(title, '') || ' ' || content)
             @@ plainto_tsquery('english', $2)
       ORDER BY rank DESC, created_at DESC
       LIMIT $3`,
      [memberId, searchQuery, limit],
    );
    return result.rows;
  } catch (error) {
    console.warn('[notebook] Failed to search entries:', {
      memberId,
      searchQuery,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
