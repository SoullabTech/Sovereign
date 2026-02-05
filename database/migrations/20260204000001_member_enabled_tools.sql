-- Member Enabled Tools
-- Stores which tools each member has added to their personal Lab dashboard
--
-- Tools themselves are defined in config/toolRegistry.ts (not in DB)
-- This table only tracks member preferences

CREATE TABLE IF NOT EXISTS member_enabled_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,              -- References toolRegistry.ts tool.id
  category TEXT NOT NULL,             -- Denormalized for query efficiency
  display_order INT DEFAULT 0,        -- Order within category (lower = first)
  enabled BOOLEAN DEFAULT true,       -- Soft delete for "removed" tools
  added_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each member can only have one entry per tool
  UNIQUE(member_id, tool_id)
);

-- Index for fast member lookups
CREATE INDEX IF NOT EXISTS idx_member_enabled_tools_member
  ON member_enabled_tools(member_id)
  WHERE enabled = true;

-- Index for category grouping
CREATE INDEX IF NOT EXISTS idx_member_enabled_tools_category
  ON member_enabled_tools(member_id, category, display_order);


-- Member Category Preferences
-- Stores collapsed state and ordering of categories in My Lab
CREATE TABLE IF NOT EXISTS member_category_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  display_order INT DEFAULT 0,        -- Order of category sections
  collapsed BOOLEAN DEFAULT false,    -- Is this section collapsed?
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(member_id, category)
);

-- Index for member lookups
CREATE INDEX IF NOT EXISTS idx_member_category_prefs_member
  ON member_category_prefs(member_id, display_order);


-- Comments for documentation
COMMENT ON TABLE member_enabled_tools IS
  'Tracks which lab tools each member has enabled in their personal dashboard. Tool definitions live in config/toolRegistry.ts.';

COMMENT ON TABLE member_category_prefs IS
  'Stores member preferences for category display order and collapsed state in My Lab.';

COMMENT ON COLUMN member_enabled_tools.tool_id IS
  'References the tool.id from config/toolRegistry.ts - not a foreign key since tools are defined in code.';

COMMENT ON COLUMN member_enabled_tools.category IS
  'Denormalized from tool definition for efficient category-based queries.';
