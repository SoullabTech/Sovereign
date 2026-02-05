/**
 * Member Tools Service
 *
 * Manages member's enabled lab tools and category preferences.
 * Tool definitions come from config/toolRegistry.ts - this service
 * only handles the member's personalization layer.
 */

import { query } from '@/lib/db/postgres';
import {
  TOOL_REGISTRY,
  CATEGORY_META,
  getDefaultEnabledTools,
  getToolById,
  type LabTool,
  type ToolCategory,
} from '@/config/toolRegistry';

// =============================================================================
// TYPES
// =============================================================================

export interface EnabledTool {
  toolId: string;
  category: ToolCategory;
  displayOrder: number;
  addedAt: Date;
}

export interface CategoryPref {
  category: ToolCategory;
  displayOrder: number;
  collapsed: boolean;
}

export interface MemberToolsState {
  enabledTools: EnabledTool[];
  categoryPrefs: CategoryPref[];
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Get all enabled tools for a member
 * If member has no tools yet, seeds with defaults
 */
export async function getMemberEnabledTools(
  memberId: string
): Promise<EnabledTool[]> {
  const result = await query(
    `SELECT tool_id, category, display_order, added_at
     FROM member_enabled_tools
     WHERE member_id = $1 AND enabled = true
     ORDER BY category, display_order`,
    [memberId]
  );

  // If no tools found, seed defaults
  if (result.rows.length === 0) {
    await seedDefaultTools(memberId);
    return getMemberEnabledTools(memberId); // Recurse once
  }

  return result.rows.map((row) => ({
    toolId: row.tool_id,
    category: row.category as ToolCategory,
    displayOrder: row.display_order,
    addedAt: new Date(row.added_at),
  }));
}

/**
 * Get member's category preferences
 * Returns defaults if none exist
 */
export async function getMemberCategoryPrefs(
  memberId: string
): Promise<CategoryPref[]> {
  const result = await query(
    `SELECT category, display_order, collapsed
     FROM member_category_prefs
     WHERE member_id = $1
     ORDER BY display_order`,
    [memberId]
  );

  // Return stored prefs merged with defaults for any missing categories
  const storedPrefs = new Map(
    result.rows.map((row) => [
      row.category,
      {
        category: row.category as ToolCategory,
        displayOrder: row.display_order,
        collapsed: row.collapsed,
      },
    ])
  );

  // Build complete list with defaults for missing
  const allPrefs: CategoryPref[] = [];
  for (const [category, meta] of Object.entries(CATEGORY_META)) {
    const stored = storedPrefs.get(category);
    allPrefs.push(
      stored || {
        category: category as ToolCategory,
        displayOrder: meta.defaultOrder,
        collapsed: false,
      }
    );
  }

  return allPrefs.sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Get full tools state for a member (tools + category prefs)
 */
export async function getMemberToolsState(
  memberId: string
): Promise<MemberToolsState> {
  const [enabledTools, categoryPrefs] = await Promise.all([
    getMemberEnabledTools(memberId),
    getMemberCategoryPrefs(memberId),
  ]);

  return { enabledTools, categoryPrefs };
}

// =============================================================================
// TOOL MANAGEMENT
// =============================================================================

/**
 * Add a tool to member's enabled list
 */
export async function addTool(
  memberId: string,
  toolId: string
): Promise<{ success: boolean; error?: string }> {
  const tool = getToolById(toolId);
  if (!tool) {
    return { success: false, error: 'Tool not found' };
  }

  // Get max display order for this category
  const orderResult = await query(
    `SELECT COALESCE(MAX(display_order), -1) + 1 as next_order
     FROM member_enabled_tools
     WHERE member_id = $1 AND category = $2`,
    [memberId, tool.category]
  );
  const nextOrder = orderResult.rows[0]?.next_order ?? 0;

  // Upsert the tool (might be re-enabling a previously removed tool)
  await query(
    `INSERT INTO member_enabled_tools (member_id, tool_id, category, display_order, enabled, added_at)
     VALUES ($1, $2, $3, $4, true, NOW())
     ON CONFLICT (member_id, tool_id)
     DO UPDATE SET enabled = true, display_order = $4, added_at = NOW()`,
    [memberId, toolId, tool.category, nextOrder]
  );

  return { success: true };
}

/**
 * Remove a tool from member's enabled list (soft delete)
 */
export async function removeTool(
  memberId: string,
  toolId: string
): Promise<{ success: boolean }> {
  await query(
    `UPDATE member_enabled_tools
     SET enabled = false
     WHERE member_id = $1 AND tool_id = $2`,
    [memberId, toolId]
  );

  return { success: true };
}

/**
 * Check if a tool is enabled for a member
 */
export async function isToolEnabled(
  memberId: string,
  toolId: string
): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM member_enabled_tools
     WHERE member_id = $1 AND tool_id = $2 AND enabled = true`,
    [memberId, toolId]
  );

  return result.rows.length > 0;
}

/**
 * Reorder tools within a category
 */
export async function reorderTools(
  memberId: string,
  category: ToolCategory,
  toolIds: string[]
): Promise<{ success: boolean }> {
  // Update each tool's display_order based on array position
  for (let i = 0; i < toolIds.length; i++) {
    await query(
      `UPDATE member_enabled_tools
       SET display_order = $1
       WHERE member_id = $2 AND tool_id = $3 AND category = $4`,
      [i, memberId, toolIds[i], category]
    );
  }

  return { success: true };
}

// =============================================================================
// CATEGORY PREFERENCES
// =============================================================================

/**
 * Toggle category collapsed state
 */
export async function toggleCategoryCollapsed(
  memberId: string,
  category: ToolCategory
): Promise<{ collapsed: boolean }> {
  // Upsert with toggle
  const result = await query(
    `INSERT INTO member_category_prefs (member_id, category, collapsed, display_order)
     VALUES ($1, $2, true, $3)
     ON CONFLICT (member_id, category)
     DO UPDATE SET collapsed = NOT member_category_prefs.collapsed, updated_at = NOW()
     RETURNING collapsed`,
    [memberId, category, CATEGORY_META[category].defaultOrder]
  );

  return { collapsed: result.rows[0]?.collapsed ?? false };
}

/**
 * Reorder categories
 */
export async function reorderCategories(
  memberId: string,
  categories: ToolCategory[]
): Promise<{ success: boolean }> {
  for (let i = 0; i < categories.length; i++) {
    await query(
      `INSERT INTO member_category_prefs (member_id, category, display_order)
       VALUES ($1, $2, $3)
       ON CONFLICT (member_id, category)
       DO UPDATE SET display_order = $3, updated_at = NOW()`,
      [memberId, categories[i], i]
    );
  }

  return { success: true };
}

// =============================================================================
// SEEDING
// =============================================================================

/**
 * Seed default tools for a new member
 */
export async function seedDefaultTools(memberId: string): Promise<void> {
  const defaults = getDefaultEnabledTools();

  // Group by category to set proper display_order
  const byCategory = new Map<ToolCategory, LabTool[]>();
  for (const tool of defaults) {
    const list = byCategory.get(tool.category) || [];
    list.push(tool);
    byCategory.set(tool.category, list);
  }

  // Insert all defaults
  for (const [category, tools] of byCategory) {
    for (let i = 0; i < tools.length; i++) {
      await query(
        `INSERT INTO member_enabled_tools (member_id, tool_id, category, display_order, enabled)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (member_id, tool_id) DO NOTHING`,
        [memberId, tools[i].id, category, i]
      );
    }
  }
}

// =============================================================================
// HYDRATION (combine DB state with full tool definitions)
// =============================================================================

export interface HydratedTool extends LabTool {
  displayOrder: number;
  addedAt: Date;
}

export interface HydratedCategory {
  category: ToolCategory;
  label: string;
  emoji: string;
  description: string;
  accentColor: string;
  displayOrder: number;
  collapsed: boolean;
  tools: HydratedTool[];
}

/**
 * Get fully hydrated tools state (tool definitions + member prefs)
 * This is what the UI consumes
 */
export async function getHydratedToolsState(
  memberId: string
): Promise<HydratedCategory[]> {
  const { enabledTools, categoryPrefs } = await getMemberToolsState(memberId);

  // Build a map of enabled tools by category
  const toolsByCategory = new Map<ToolCategory, HydratedTool[]>();

  for (const enabled of enabledTools) {
    const toolDef = getToolById(enabled.toolId);
    if (!toolDef) continue; // Tool was removed from registry

    const hydrated: HydratedTool = {
      ...toolDef,
      displayOrder: enabled.displayOrder,
      addedAt: enabled.addedAt,
    };

    const list = toolsByCategory.get(enabled.category) || [];
    list.push(hydrated);
    toolsByCategory.set(enabled.category, list);
  }

  // Build hydrated categories
  const result: HydratedCategory[] = [];

  for (const pref of categoryPrefs) {
    const tools = toolsByCategory.get(pref.category) || [];
    if (tools.length === 0) continue; // Skip empty categories

    const meta = CATEGORY_META[pref.category];

    result.push({
      category: pref.category,
      label: meta.label,
      emoji: meta.emoji,
      description: meta.description,
      accentColor: meta.accentColor,
      displayOrder: pref.displayOrder,
      collapsed: pref.collapsed,
      tools: tools.sort((a, b) => a.displayOrder - b.displayOrder),
    });
  }

  return result.sort((a, b) => a.displayOrder - b.displayOrder);
}
