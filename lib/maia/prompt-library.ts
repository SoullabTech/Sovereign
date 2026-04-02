/**
 * MAIA Prompt Library — Query Layer
 *
 * Retrieves weekly elemental themes and prompt sets.
 * Used by the oracle to weave active themes into conversation.
 *
 * Design: database-backed, seed-managed in Phase 1.
 * No admin UI yet — themes are created via SQL seed migrations.
 */

import { query } from '@/lib/db/postgres';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface PromptLibraryTheme {
  id: string;
  slug: string;
  title: string;
  element: string | null;
  refinement_phase: string | null;
  chapter_ref: string | null;
  orientation: string;
  status: 'draft' | 'active' | 'archived';
  active_from: string | null;
  active_until: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PromptLibraryItem {
  id: string;
  library_id: string;
  prompt_text: string;
  prompt_type: 'reflection' | 'inquiry' | 'grounding' | 'action' | 'integration';
  element_tag: string | null;
  tonal_tag: string | null;
  sort_order: number;
}

export interface ThemeWithItems extends PromptLibraryTheme {
  items: PromptLibraryItem[];
}

// ═══════════════════════════════════════════════════════════════
// Queries
// ═══════════════════════════════════════════════════════════════

/**
 * Get the currently active theme.
 *
 * Active = status 'active' AND (no date window OR within date window).
 * If multiple active themes exist, returns the most recently created.
 */
export async function getActiveTheme(): Promise<ThemeWithItems | null> {
  try {
    const result = await query<PromptLibraryTheme>(
      `SELECT * FROM prompt_library
       WHERE status = 'active'
         AND (active_from IS NULL OR active_from <= NOW())
         AND (active_until IS NULL OR active_until > NOW())
       ORDER BY created_at DESC
       LIMIT 1`
    );

    if (result.rows.length === 0) return null;

    const theme = result.rows[0];
    const items = await getThemeItems(theme.id);

    return { ...theme, items };
  } catch (error) {
    console.warn('[prompt-library] Failed to load active theme:', error);
    return null;
  }
}

/**
 * Get a theme by slug (with items).
 */
export async function getThemeBySlug(slug: string): Promise<ThemeWithItems | null> {
  try {
    const result = await query<PromptLibraryTheme>(
      `SELECT * FROM prompt_library WHERE slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) return null;

    const theme = result.rows[0];
    const items = await getThemeItems(theme.id);

    return { ...theme, items };
  } catch (error) {
    console.warn('[prompt-library] Failed to load theme by slug:', error);
    return null;
  }
}

/**
 * List all themes (without items). For future admin surface.
 */
export async function listThemes(): Promise<PromptLibraryTheme[]> {
  try {
    const result = await query<PromptLibraryTheme>(
      `SELECT * FROM prompt_library ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (error) {
    console.warn('[prompt-library] Failed to list themes:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// Internal
// ═══════════════════════════════════════════════════════════════

async function getThemeItems(libraryId: string): Promise<PromptLibraryItem[]> {
  const result = await query<PromptLibraryItem>(
    `SELECT * FROM prompt_library_items
     WHERE library_id = $1
     ORDER BY sort_order ASC`,
    [libraryId]
  );
  return result.rows;
}
