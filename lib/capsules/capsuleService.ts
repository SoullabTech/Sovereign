/**
 * Capsule Service - Database Access Layer
 *
 * Provides CRUD operations for Reflection Capsules.
 * All queries enforce user_id scoping for security.
 *
 * Philosophy: MAIA does not store experience as the primary object.
 * MAIA witnesses experience and remembers what mattered.
 */

import { query, queryOne, insertOne } from '@/lib/db/postgres';
import type {
  CapsuleRow,
  CapsuleDTO,
  CapsuleUpdateInput,
  CapsuleListQuery,
  SourceType,
  Signals,
  GoldLine,
  Decision,
  NextStep,
  Practice,
  Pattern,
} from './types';
import { rowToDTO } from './types';

// =============================================================================
// CREATE
// =============================================================================

export interface CreateCapsuleParams {
  userId: string;
  sourceType: SourceType;
  sourceId?: string | null;
  title: string;
  summary: string;
  goldLines?: (GoldLine | string)[];
  decisions?: (Decision | string)[];
  nextSteps?: (NextStep | string)[];
  practices?: Practice[];
  patterns?: (Pattern | string)[];
  signals?: Signals | null;
  tags?: string[];
  sourceExcerpt?: string | null;
  draft?: boolean;
}

/**
 * Create a new capsule
 */
export async function createCapsule(params: CreateCapsuleParams): Promise<CapsuleDTO> {
  const {
    userId,
    sourceType,
    sourceId = null,
    title,
    summary,
    goldLines = [],
    decisions = [],
    nextSteps = [],
    practices = [],
    patterns = [],
    signals = null,
    tags = [],
    sourceExcerpt = null,
    draft = true,
  } = params;

  const sql = `
    INSERT INTO reflection_capsules (
      user_id,
      source_type,
      source_id,
      title,
      summary,
      gold_lines,
      decisions,
      next_steps,
      practices,
      patterns,
      signals,
      tags,
      source_excerpt,
      draft
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `;

  const row = await queryOne<CapsuleRow>(sql, [
    userId,
    sourceType,
    sourceId,
    title,
    summary,
    JSON.stringify(goldLines),
    JSON.stringify(decisions),
    JSON.stringify(nextSteps),
    JSON.stringify(practices),
    JSON.stringify(patterns),
    signals ? JSON.stringify(signals) : null,
    JSON.stringify(tags),
    sourceExcerpt,
    draft,
  ]);

  if (!row) {
    throw new Error('Failed to create capsule');
  }

  return rowToDTO(row);
}

// =============================================================================
// READ - LIST
// =============================================================================

export interface ListCapsulesParams {
  userId: string;
  query?: CapsuleListQuery;
}

export interface ListCapsulesResult {
  capsules: CapsuleDTO[];
  nextCursor: string | null;
}

/**
 * List capsules for a user with optional filters
 */
export async function listCapsules(params: ListCapsulesParams): Promise<ListCapsulesResult> {
  const { userId, query: queryParams = {} } = params;
  const {
    q,
    archived,
    pinned,
    draft,
    tag,
    limit = 20,
    cursor,
  } = queryParams;

  const conditions: string[] = ['user_id = $1'];
  const values: any[] = [userId];
  let paramIndex = 2;

  // Filter by archived status
  if (archived !== undefined) {
    conditions.push(`archived = $${paramIndex}`);
    values.push(archived);
    paramIndex++;
  }

  // Filter by pinned status
  if (pinned !== undefined) {
    conditions.push(`pinned = $${paramIndex}`);
    values.push(pinned);
    paramIndex++;
  }

  // Filter by draft status
  if (draft !== undefined) {
    conditions.push(`draft = $${paramIndex}`);
    values.push(draft);
    paramIndex++;
  }

  // Filter by tag (JSONB contains)
  if (tag) {
    conditions.push(`tags @> $${paramIndex}::jsonb`);
    values.push(JSON.stringify([tag]));
    paramIndex++;
  }

  // Search in title and summary
  if (q) {
    conditions.push(`(title ILIKE $${paramIndex} OR summary ILIKE $${paramIndex})`);
    values.push(`%${q}%`);
    paramIndex++;
  }

  // Cursor-based pagination (by created_at)
  if (cursor) {
    conditions.push(`created_at < $${paramIndex}`);
    values.push(cursor);
    paramIndex++;
  }

  // Build query
  const whereClause = conditions.join(' AND ');
  const sql = `
    SELECT *
    FROM reflection_capsules
    WHERE ${whereClause}
    ORDER BY pinned DESC, created_at DESC
    LIMIT $${paramIndex}
  `;
  values.push(limit + 1); // Fetch one extra to determine if there are more

  const result = await query<CapsuleRow>(sql, values);
  const rows = result.rows;

  // Determine if there are more results
  let nextCursor: string | null = null;
  if (rows.length > limit) {
    rows.pop(); // Remove the extra row
    const lastRow = rows[rows.length - 1];
    nextCursor = lastRow.created_at.toISOString();
  }

  return {
    capsules: rows.map(rowToDTO),
    nextCursor,
  };
}

// =============================================================================
// READ - GET BY ID
// =============================================================================

export interface GetCapsuleByIdParams {
  userId: string;
  capsuleId: string;
}

/**
 * Get a single capsule by ID (scoped to user)
 */
export async function getCapsuleById(params: GetCapsuleByIdParams): Promise<CapsuleDTO | null> {
  const { userId, capsuleId } = params;

  const sql = `
    SELECT *
    FROM reflection_capsules
    WHERE id = $1 AND user_id = $2
    LIMIT 1
  `;

  const row = await queryOne<CapsuleRow>(sql, [capsuleId, userId]);

  if (!row) {
    return null;
  }

  return rowToDTO(row);
}

// =============================================================================
// UPDATE
// =============================================================================

export interface UpdateCapsuleParams {
  userId: string;
  capsuleId: string;
  patch: CapsuleUpdateInput;
}

/**
 * Update a capsule (scoped to user)
 */
export async function updateCapsule(params: UpdateCapsuleParams): Promise<CapsuleDTO | null> {
  const { userId, capsuleId, patch } = params;

  // Build SET clause dynamically based on provided fields
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Map camelCase to snake_case
  const fieldMappings: Record<keyof CapsuleUpdateInput, string> = {
    title: 'title',
    summary: 'summary',
    goldLines: 'gold_lines',
    decisions: 'decisions',
    nextSteps: 'next_steps',
    practices: 'practices',
    patterns: 'patterns',
    signals: 'signals',
    tags: 'tags',
    sourceExcerpt: 'source_excerpt',
    draft: 'draft',
    pinned: 'pinned',
    archived: 'archived',
  };

  for (const [key, dbColumn] of Object.entries(fieldMappings)) {
    const value = patch[key as keyof CapsuleUpdateInput];
    if (value !== undefined) {
      setClauses.push(`${dbColumn} = $${paramIndex}`);

      // Serialize JSON fields
      if (['goldLines', 'decisions', 'nextSteps', 'practices', 'patterns', 'tags'].includes(key)) {
        values.push(JSON.stringify(value));
      } else if (key === 'signals') {
        values.push(value ? JSON.stringify(value) : null);
      } else {
        values.push(value);
      }
      paramIndex++;
    }
  }

  // If nothing to update, return current state
  if (setClauses.length === 0) {
    return getCapsuleById({ userId, capsuleId });
  }

  // Add updated_at (though trigger handles this, being explicit is safer)
  setClauses.push(`updated_at = NOW()`);

  const sql = `
    UPDATE reflection_capsules
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    RETURNING *
  `;
  values.push(capsuleId, userId);

  const row = await queryOne<CapsuleRow>(sql, values);

  if (!row) {
    return null;
  }

  return rowToDTO(row);
}

// =============================================================================
// ARCHIVE (convenience method)
// =============================================================================

export interface ArchiveCapsuleParams {
  userId: string;
  capsuleId: string;
  archived: boolean;
}

/**
 * Archive or unarchive a capsule
 */
export async function archiveCapsule(params: ArchiveCapsuleParams): Promise<CapsuleDTO | null> {
  return updateCapsule({
    userId: params.userId,
    capsuleId: params.capsuleId,
    patch: { archived: params.archived },
  });
}

// =============================================================================
// PIN (convenience method)
// =============================================================================

export interface PinCapsuleParams {
  userId: string;
  capsuleId: string;
  pinned: boolean;
}

/**
 * Pin or unpin a capsule
 */
export async function pinCapsule(params: PinCapsuleParams): Promise<CapsuleDTO | null> {
  return updateCapsule({
    userId: params.userId,
    capsuleId: params.capsuleId,
    patch: { pinned: params.pinned },
  });
}

// =============================================================================
// BRING INTO LAB (set draft = false)
// =============================================================================

export interface BringIntoLabParams {
  userId: string;
  capsuleId: string;
}

/**
 * "Bring into the Lab" - marks a capsule as no longer a draft
 */
export async function bringIntoLab(params: BringIntoLabParams): Promise<CapsuleDTO | null> {
  return updateCapsule({
    userId: params.userId,
    capsuleId: params.capsuleId,
    patch: { draft: false },
  });
}

// =============================================================================
// DELETE (hard delete - use sparingly)
// =============================================================================

export interface DeleteCapsuleParams {
  userId: string;
  capsuleId: string;
}

/**
 * Permanently delete a capsule
 * Consider using archiveCapsule instead for soft delete behavior
 */
export async function deleteCapsule(params: DeleteCapsuleParams): Promise<boolean> {
  const { userId, capsuleId } = params;

  const sql = `
    DELETE FROM reflection_capsules
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `;

  const row = await queryOne<{ id: string }>(sql, [capsuleId, userId]);
  return row !== null;
}

// =============================================================================
// COUNT (for stats)
// =============================================================================

export interface CountCapsulesParams {
  userId: string;
  archived?: boolean;
  draft?: boolean;
  pinned?: boolean;
}

/**
 * Count capsules for a user with optional filters
 */
export async function countCapsules(params: CountCapsulesParams): Promise<number> {
  const { userId, archived, draft, pinned } = params;

  const conditions: string[] = ['user_id = $1'];
  const values: any[] = [userId];
  let paramIndex = 2;

  if (archived !== undefined) {
    conditions.push(`archived = $${paramIndex}`);
    values.push(archived);
    paramIndex++;
  }

  if (draft !== undefined) {
    conditions.push(`draft = $${paramIndex}`);
    values.push(draft);
    paramIndex++;
  }

  if (pinned !== undefined) {
    conditions.push(`pinned = $${paramIndex}`);
    values.push(pinned);
    paramIndex++;
  }

  const sql = `
    SELECT COUNT(*) as count
    FROM reflection_capsules
    WHERE ${conditions.join(' AND ')}
  `;

  const row = await queryOne<{ count: string }>(sql, values);
  return parseInt(row?.count || '0', 10);
}
