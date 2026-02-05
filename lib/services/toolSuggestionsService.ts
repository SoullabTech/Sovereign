/**
 * Tool Suggestions Service
 *
 * Phase 1 of the community tool ecosystem.
 * Members can suggest tools they want to see in the Lab.
 */

import { query } from '@/lib/db/postgres';
import { CATEGORY_META, type ToolCategory } from '@/config/toolRegistry';

// =============================================================================
// TYPES
// =============================================================================

export type SuggestionStatus =
  | 'submitted'
  | 'triaged'
  | 'accepted'
  | 'building'
  | 'shipped'
  | 'declined';

export interface ToolSuggestion {
  id: string;
  memberId: string;
  title: string;
  category: ToolCategory;
  shortDescription: string;
  useCase: string | null;
  ethicalNotes: string | null;
  referenceLinks: string | null;
  status: SuggestionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSuggestionInput {
  title: string;
  category: ToolCategory;
  shortDescription: string;
  useCase?: string;
  ethicalNotes?: string;
  referenceLinks?: string;
}

// =============================================================================
// VALIDATION
// =============================================================================

const VALID_CATEGORIES = Object.keys(CATEGORY_META) as ToolCategory[];

export function isValidCategory(category: string): category is ToolCategory {
  return VALID_CATEGORIES.includes(category as ToolCategory);
}

export function validateSuggestion(
  input: Partial<CreateSuggestionInput>
): { valid: true; data: CreateSuggestionInput } | { valid: false; error: string } {
  if (!input.title || input.title.trim().length < 2) {
    return { valid: false, error: 'Title must be at least 2 characters' };
  }

  if (input.title.length > 100) {
    return { valid: false, error: 'Title must be under 100 characters' };
  }

  if (!input.category || !isValidCategory(input.category)) {
    return { valid: false, error: 'Please select a valid category' };
  }

  if (!input.shortDescription || input.shortDescription.trim().length < 10) {
    return { valid: false, error: 'Description must be at least 10 characters' };
  }

  if (input.shortDescription.length > 500) {
    return { valid: false, error: 'Description must be under 500 characters' };
  }

  return {
    valid: true,
    data: {
      title: input.title.trim(),
      category: input.category,
      shortDescription: input.shortDescription.trim(),
      useCase: input.useCase?.trim() || undefined,
      ethicalNotes: input.ethicalNotes?.trim() || undefined,
      referenceLinks: input.referenceLinks?.trim() || undefined,
    },
  };
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Create a new tool suggestion
 */
export async function createSuggestion(
  memberId: string,
  input: CreateSuggestionInput
): Promise<ToolSuggestion> {
  const result = await query(
    `INSERT INTO tool_suggestions
       (member_id, title, category, short_description, use_case, ethical_notes, reference_links)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      memberId,
      input.title,
      input.category,
      input.shortDescription,
      input.useCase || null,
      input.ethicalNotes || null,
      input.referenceLinks || null,
    ]
  );

  return mapRow(result.rows[0]);
}

/**
 * Get a member's own suggestions
 */
export async function getMemberSuggestions(
  memberId: string
): Promise<ToolSuggestion[]> {
  const result = await query(
    `SELECT * FROM tool_suggestions
     WHERE member_id = $1
     ORDER BY created_at DESC`,
    [memberId]
  );

  return result.rows.map(mapRow);
}

/**
 * Get a single suggestion by ID (for the member who created it)
 */
export async function getSuggestion(
  suggestionId: string,
  memberId: string
): Promise<ToolSuggestion | null> {
  const result = await query(
    `SELECT * FROM tool_suggestions
     WHERE id = $1 AND member_id = $2`,
    [suggestionId, memberId]
  );

  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

/**
 * Get all suggestions for steward review
 * (Admin only - check role before calling)
 */
export async function getSuggestionsForReview(
  status?: SuggestionStatus
): Promise<ToolSuggestion[]> {
  const sql = status
    ? `SELECT * FROM tool_suggestions WHERE status = $1 ORDER BY created_at ASC`
    : `SELECT * FROM tool_suggestions ORDER BY status, created_at ASC`;

  const result = status
    ? await query(sql, [status])
    : await query(sql);

  return result.rows.map(mapRow);
}

/**
 * Update suggestion status (steward action)
 */
export async function updateSuggestionStatus(
  suggestionId: string,
  status: SuggestionStatus,
  stewardId: string,
  stewardNotes?: string
): Promise<ToolSuggestion | null> {
  const result = await query(
    `UPDATE tool_suggestions
     SET status = $1,
         reviewed_by = $2,
         reviewed_at = NOW(),
         steward_notes = COALESCE($3, steward_notes),
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [status, stewardId, stewardNotes || null, suggestionId]
  );

  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

/**
 * Get suggestion counts by status (for steward dashboard)
 */
export async function getSuggestionCounts(): Promise<Record<SuggestionStatus, number>> {
  const result = await query(
    `SELECT status, COUNT(*)::int as count
     FROM tool_suggestions
     GROUP BY status`
  );

  const counts: Record<SuggestionStatus, number> = {
    submitted: 0,
    triaged: 0,
    accepted: 0,
    building: 0,
    shipped: 0,
    declined: 0,
  };

  for (const row of result.rows) {
    counts[row.status as SuggestionStatus] = row.count;
  }

  return counts;
}

// =============================================================================
// HELPERS
// =============================================================================

function mapRow(row: any): ToolSuggestion {
  return {
    id: row.id,
    memberId: row.member_id,
    title: row.title,
    category: row.category as ToolCategory,
    shortDescription: row.short_description,
    useCase: row.use_case,
    ethicalNotes: row.ethical_notes,
    referenceLinks: row.reference_links,
    status: row.status as SuggestionStatus,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
