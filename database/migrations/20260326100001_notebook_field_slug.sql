-- Add field_slug to notebook_entries for master field association
-- Allows entries to be scoped to a specific field (jondi, kelly, nathan, etc.)
-- NULL = unscoped (personal/general notebook entry)

ALTER TABLE notebook_entries
  ADD COLUMN IF NOT EXISTS field_slug TEXT;

-- Filtered index: only index rows that have a field_slug
CREATE INDEX IF NOT EXISTS idx_notebook_field_slug
  ON notebook_entries (member_id, field_slug)
  WHERE field_slug IS NOT NULL;

COMMENT ON COLUMN notebook_entries.field_slug IS 'Master field slug (e.g. jondi, kelly, nathan). NULL = unscoped personal entry.';
